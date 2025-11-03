# -*- encoding: UTF-8 -*-
'''
Created on 30. des. 2011

@author: jny
'''
from models import Message, UserProfile
from profileUtils import getLoggedInUserProfile
from handlerUtils import getLanguageCode
from django.conf import settings
from django.core.mail import send_mail
from django.utils.translation import ugettext

def getConversation(thisUserProfile, userProfile):
    messages = Message.objects.filter(fromProfile__in=[thisUserProfile,userProfile], toProfile__in=[thisUserProfile,userProfile]).order_by('timestamp')
    #query = query.
    
    #messages = []
    
    # TODO: do we need to create messages array? maybe we can just return the query?
    #for message in query:
    #    messages.append(Message(message=message.message, recipient=message.recipient, sender=message.sender, datesent=message.datesent))

    markConversationAsRead(thisUserProfile, userProfile)
    return messages
    
def markConversationAsRead(thisUserProfile, userProfile):
    messages = Message.objects.filter(fromProfile__in=[userProfile], toProfile__in=[thisUserProfile])
    messages.update(read=True)

def getLatestMessages(request, limit):
    userProfile = getLoggedInUserProfile(request)
    rawquery = None;
    if limit:
    # TODO: improve sql? use .join() instead of inefficient concat? # todo customize for postgres.
        rawQuery = 'select a.* from message a inner join (select "fromProfile_id", max(timestamp) as timestamp from message group by "fromProfile_id") as b on a."fromProfile_id" = b."fromProfile_id" and a.timestamp = b.timestamp where "toProfile_id" = ' + str(userProfile.id) + ' ORDER BY timestamp DESC LIMIT ' + str(settings.NOTIFICATION_MESSAGES_LIMIT)
    else:
        rawQuery = 'select a.* from message a inner join (select "fromProfile_id", max(timestamp) as timestamp from message group by "fromProfile_id") as b on a."fromProfile_id" = b."fromProfile_id" and a.timestamp = b.timestamp where "toProfile_id" = ' + str(userProfile.id) + ' ORDER BY timestamp DESC LIMIT ' + str(settings.DEFAULT_CONVERSATION_COUNT_LIMIT)

    return Message.objects.raw(rawQuery)

def sendEmail(message, request):
    toProfileId = message['toProfileId']
    toProfile = UserProfile.objects.get(pk=toProfileId)
    domainSuffix = getLanguageCode(request)
    if domainSuffix == "EN":
        domainSuffix = "COM"
    send_mail(ugettext('You have recieved a message from') + ' ' + message['fromProfileName'], ugettext('Log into felizdate to read the message:') + '\n\n' + 'http://www.felizdate.' + domainSuffix.lower(), 'no-reply@felizdate.' + domainSuffix.lower(), [toProfile.coreuser.email], fail_silently=False)

