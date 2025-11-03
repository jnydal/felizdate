# -*- encoding: UTF-8 -*-
'''
Created on 30. mai 2012

@author: jny
'''
############# init parent django project settings
from django.core.management import setup_environ
from os import path
import django.conf
import django.contrib.auth
import django.core.handlers.wsgi
import django.db
import django.utils.importlib
import logging
import felizdate.settings
import sys
import tornado.options
import tornado.web, tornado.websocket
sys.path.append(path.dirname(path.dirname(path.abspath(__file__))))

setup_environ(felizdate.settings)
###############

class DBMixIn(object):
    def dbconnection(self):
        #if not hasattr(self.application, 'db'):
        self.application.dbconnection = django.db.connection
        return self.application.dbconnection

class BaseHandler(tornado.web.RequestHandler): # todo: extract django stuff into DjangoHandler
    def __init__(self, *request, **kwargs):
        super(BaseHandler,self).__init__(*request,**kwargs)
        
    def prepare(self):
        super(BaseHandler, self).prepare()
        # Prepare ORM connections
        django.db.connection.queries = []

    def finish(self, chunk=None):
        super(BaseHandler, self).finish(chunk=chunk)
        # Clean up django ORM connections
        django.db.connection.close()
        logging.info('%d sql queries' % len(django.db.connection.queries))
        for query in django.db.connection.queries:
            logging.debug('%s [%s seconds]' % (query['sql'], query['time']))

        # Clean up after python-memcached
        from django.core.cache import cache
        if hasattr(cache, 'close'):
            cache.close()

    def get_django_session(self):
        if not hasattr(self, '_session'):
            engine = django.utils.importlib.import_module(django.conf.settings.SESSION_ENGINE)
            session_key = self.get_cookie(django.conf.settings.SESSION_COOKIE_NAME)
            self._session = engine.SessionStore(session_key)
        return self._session

    def get_user_locale(self):
        # locale.get will use the first non-empty argument that matches a
        # supported language.
        return tornado.locale.get(
                                  self.get_argument('lang', None),
                                  self.get_django_session().get('django_language', None),
                                  self.get_cookie('django_language', None))

    def get_current_user(self):
        # get_user needs a django request object, but only looks at the session
        class Dummy(object): pass
        django_request = Dummy()
        django_request.session = self.get_django_session()
        user = django.contrib.auth.get_user(django_request)
        if user.is_authenticated():
            return user
        else:
            # try basic auth
            if not self.request.headers.has_key('Authorization'):
                return None
            kind, data = self.request.headers['Authorization'].split(' ')
            if kind != 'Basic':
                return None
            (username, _, password) = data.decode('base64').partition(':')
            user = django.contrib.auth.authenticate(username=username,password=password)
            if user is not None and user.is_authenticated():
                return user
            return None

    def get_django_request(self):
        request = django.core.handlers.wsgi.WSGIRequest(
          tornado.wsgi.WSGIContainer.environ(self.request))
        request.session = self.get_django_session()
        
        if self.current_user:
            request.user = self.current_user
        else:
            request.user = django.contrib.auth.models.AnonymousUser()
        
        return request

class WSBaseHandler(tornado.websocket.WebSocketHandler):
    def __init__(self, *request, **kwargs):
        super(WSBaseHandler,self).__init__(*request,**kwargs)

    def open(self):
        super(WSBaseHandler, self).open()
        # Prepare ORM connections
        dbconnection = django.db.connection#self.dbconnection()
        dbconnection.queries = []
        pass

    def on_close(self):
        # Clean up django ORM connections
        django.db.connection.close()
        # Clean up after python-memcached
        from django.core.cache import cache
        if hasattr(cache, 'close'):
            cache.close()

    def get_django_session(self):
        if not hasattr(self, '_session'):
            engine = django.utils.importlib.import_module(django.conf.settings.SESSION_ENGINE)
            session_key = self.get_cookie(django.conf.settings.SESSION_COOKIE_NAME)
            self._session = engine.SessionStore(session_key)
        return self._session

    def get_user_locale(self):
        # locale.get will use the first non-empty argument that matches a
        # supported language.
        return tornado.locale.get(
                                  self.get_argument('lang', None),
                                  self.get_django_session().get('django_language', None),
                                  self.get_cookie('django_language', None))

    def get_current_user(self):
        # get_user needs a django request object, but only looks at the session
        class Dummy(object): pass
        django_request = Dummy()
        django_request.session = self.get_django_session()
        user = django.contrib.auth.get_user(django_request)
        if user.is_authenticated():
            return user
        else:
            # try basic auth
            if not self.request.headers.has_key('Authorization'):
                return None
            kind, data = self.request.headers['Authorization'].split(' ')
            if kind != 'Basic':
                return None
            (username, _, password) = data.decode('base64').partition(':')
            user = django.contrib.auth.authenticate(username=username,password=password)
            if user is not None and user.is_authenticated():
                return user
            return None

    def get_django_request(self):
        request = django.core.handlers.wsgi.WSGIRequest(
          tornado.wsgi.WSGIContainer.environ(self.request))
        request.session = self.get_django_session()
        
        if self.current_user:
            request.user = self.current_user
        else:
            request.user = django.contrib.auth.models.AnonymousUser()
        
        return request
