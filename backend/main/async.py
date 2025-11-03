# -*- encoding: UTF-8 -*-
'''
Async

Created on 28. des. 2011

@author: J. Nydal
'''
from django.utils.translation import ugettext
from exceptions import AppException
from models import Worker, UserProfile
import logging
from handlerUtils import JSONSuccessResponse, JSONErrorResponse, getLoggedInUserProfile, getLoggedInProfile
import TornadoDjangoWrapper
import mixin
import tornado.web
import os, time
from felizdate.main.modelUtils import getFirst
#import zmq
from threading import Thread
import ast

logger = logging.getLogger("socket")

class MessageBuffer():
    def __init__(self) :
        self._messages = []
    def add(self, message):
        self._messages.append(message)
    def get(self):
        data = self._messages
        self._messages = [];
        return data
    def isEmpty(self):
        return len(self._messages) == 0
    
def subscriberFunction():
    context = zmq.Context()#@UndefinedVariable
    AsyncSession.SUBSCRIBER = context.socket(zmq.SUB) #@UndefinedVariable
    
    # subscribe to all workers
    for worker in AsyncSession.WORKERS:
        AsyncSession.SUBSCRIBER.connect("tcp://" + worker.ip + ":" + str(worker.mq_port))
        # subscriber.setsockopt(zmq.SUBSCRIBE, b"A") conditions?
    
    while True:
        try:
            msgStr = AsyncSession.SUBSCRIBER.recv_multipart()
            message = ast.literal_eval(msgStr)
            # if recipient of message has async session at instance, push
            asyncSession = AsyncSession.get(message.toUserProfileId)
            try:
                if asyncSession:
                    asyncSession.addMessage(message)
            except Exception, e:
                pass
        except zmq.ZMQError as e:#@UndefinedVariable
            if e.errno == zmq.ETERM: #@UndefinedVariable
                break           # Interrupted
            else:
                raise 

class AsyncSession(object) :
    ASYNC_SESSIONS = {}
    CUR_ID = 100
    SUBSCRIBER_THREAD = None
    SUBSCRIBER = None
    PUBLISHER = None
    WORKER = None
    WORKERS = None
    initialized = False

    def __init__(self, profileId, websocketBased):
        if not AsyncSession.initialized:
            # get worker info
            ppid = ""
            if hasattr(os, 'getppid'):
                ppid = os.getppid()
            if ppid != "":
                logger.debug("Async: Base PID: " + str(ppid))
                AsyncSession.WORKER = getFirst(Worker.objects.filter(pid=ppid))
                if AsyncSession.WORKER:
                    logger.debug("Resolved worker information: " + str(AsyncSession.WORKER))
                    # lookup other workers
                    AsyncSession.WORKERS = Worker.objects.all().exclude(pk=AsyncSession.WORKER.id)
                
                    # set up subscriber
                    AsyncSession.SUBSCRIBER_THREAD = Thread(target=subscriberFunction)
                    AsyncSession.SUBSCRIBER_THREAD.start()
                    
                    # set up publisher
                    ctx = zmq.Context.instance() #@UndefinedVariable
                    AsyncSession.PUBLISHER = ctx.socket(zmq.PUB) #@UndefinedVariable
                    AsyncSession.PUBLISHER.bind("tcp://*:" + str(AsyncSession.WORKER.mq_port))
                    AsyncSession.initialized = True
        self.messageBuffer = MessageBuffer()
        self.asyncHandler = None
        self.callback = None
        self.websocketBased = websocketBased
        
        for v in AsyncSession.ASYNC_SESSIONS.values() :
            if v.profileId == profileId :
                raise AppException(ugettext("In use"))
        self.profileId = profileId
        AsyncSession.CUR_ID += 1
        self.id   = AsyncSession.CUR_ID 

        AsyncSession.ASYNC_SESSIONS[self.profileId] = self   
        
    @classmethod
    def send(cls, message, toProfileId):
        asyncSession = AsyncSession.get(toProfileId)
        try:
            if asyncSession:
                asyncSession.addMessage(message)
                return True
            else:
                # session not found on at current worker. Broadcast.
                AsyncSession.PUBLISHER.send(str(message))
        except Exception, e:
            logger.debug(e)
    
    """
    poke/trigger push response if messagebuffer is not empty,
    and unregister the callback.
    """
    def poke(self):
        if not self.messageBuffer.isEmpty():
            if self.websocketBased:
                if self.asyncHandler:
                    if self.asyncHandler.ws_connection:
                        buffer = self.messageBuffer.get()
                        for message in buffer:
                            self.asyncHandler.write_message(message)
                    else:
                        logger.debug(self.asyncHandler.current_user.email + ': ws connection is not available...')
                else:
                    logger.debug('asynchandler is not set...')
            elif self.callback:
                self.callback(self.messageBuffer.get())
                self.callback = None
    
    def refreshAsyncHandler(self):
        self.setAsyncHandler(self.asyncHandler)

    """
    register callback
    """
    def register(self, cb):
         self.callback = cb
    
    def addMessage(self, message):
        self.messageBuffer.add(message)
        self.poke()
    
    def setAsyncHandler(self, handler):
        #def onNewWSMessages(messages):
        #    handler.write_message({ 'payload': messages, 'success': True })
        
        def onNewMessages(messages):
            if not handler.request.connection.stream.closed():
                handler.finish({ 'payload': messages, 'success': True })

        if not self.websocketBased:
            self.register(handler.async_callback(onNewMessages))
        self.asyncHandler = handler

    @classmethod
    def hasSession(self, profileId) :
        if profileId in AsyncSession.ASYNC_SESSIONS:
            return True
        return False

    @classmethod
    def getAll(self) :
        return [ s for s in AsyncSession.ASYNC_SESSIONS.values() ]
    
    @classmethod
    def get(self, id):
        return AsyncSession.ASYNC_SESSIONS.get(id)
        
    @classmethod
    def remove(self, id) :
        if id in AsyncSession.ASYNC_SESSIONS:
            if AsyncSession.ASYNC_SESSIONS[id].websocketBased:
                if AsyncSession.ASYNC_SESSIONS[id].asyncHandler and AsyncSession.ASYNC_SESSIONS[id].asyncHandler.ws_connection:
                    AsyncSession.ASYNC_SESSIONS[id].asyncHandler.close()
                else:
                    logger.debug('Could not close asynchandler or its ws connection as it does not exist anymore.')
            del AsyncSession.ASYNC_SESSIONS[id]

"""
    request handlers
"""
def remove(request) :
    thisUserProfile = getLoggedInUserProfile(request)

    session = AsyncSession.get(thisUserProfile.id)
    if not session :
        return JSONErrorResponse(ugettext('session expired'))

    AsyncSession.remove(thisUserProfile.id)
    
    return JSONSuccessResponse()

"""
    Longpoll handler for recieving notifications and chat messages.
    Is executed just after user logs in, and is continously run as a message loop.
"""
class LongpollHandler(TornadoDjangoWrapper.BaseHandler, mixin.DataMixin):
    @tornado.web.asynchronous
    def get(self):
        since = self.get_argument("since")
        if not since:
            return JSONErrorResponse(ugettext('Must supply since parameter'))
    
        thisUserProfile = getLoggedInProfile(self.current_user)
        if thisUserProfile != None:
            asyncSession = AsyncSession.get(thisUserProfile.id)
            if asyncSession == None:  
                asyncSession = AsyncSession(thisUserProfile.id, False)
        
            if asyncSession:
                asyncSession.setAsyncHandler(self)
                asyncSession.poke()

class WebSocketHandler(TornadoDjangoWrapper.WSBaseHandler):
    def open(self, *args, **kwargs):
        super(WebSocketHandler, self).open()
        thisUserProfile = getLoggedInProfile(self.current_user)
        if thisUserProfile != None:
            asyncSession = AsyncSession.get(thisUserProfile.id)
            if asyncSession == None:  
                asyncSession = AsyncSession(thisUserProfile.id, True)
                logger.debug(self.current_user.email + " created new async session.")
            asyncSession.setAsyncHandler(self)
            asyncSession.poke()
            logger.debug(self.current_user.email + " binded async session.")
            
    def on_close(self):
        super(WebSocketHandler, self).on_close()
        thisUserProfile = getLoggedInProfile(self.current_user)
        if thisUserProfile != None:
            AsyncSession.remove(thisUserProfile.id)
            logger.debug(self.current_user.email + " removed async session.")
        logger.debug(self.current_user.email + ": " if self.current_user else "" + "connection closed.")
    
    def on_message(self, message):
        messageDict = ast.literal_eval(message)
        toUserProfileId = int(messageDict['toProfileId'])
        toUserProfile = UserProfile.objects.get(id=toUserProfileId)
        if not toUserProfile:
            return JSONErrorResponse(ugettext("Profile does not exist."))
        
        fromUserProfile = getLoggedInProfile(self.current_user)  
        if fromUserProfile in toUserProfile.blockedProfiles.all():
            return JSONErrorResponse(ugettext("Message cannot be delivered to recipient for the moment."))
        messageText = messageDict['message']    
    
        timestamp = int(round(time.time()))
        message = { 'type': 'msg', 'toProfileId': toUserProfileId, 'fromProfileId': fromUserProfile.id, 'fromProfileName': fromUserProfile.profilename, 'text': messageText, 'timestamp': timestamp, 'microImageUrl': fromUserProfile.getMicroProfileImageUrl() }
        AsyncSession.send(message, message['toProfileId'])
    
    """
    is set to hixie/draft76 because IOS 4.3 does not support newest protocol.
    """
    def allow_draft76(self):
        return True
    