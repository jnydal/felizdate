# -*- encoding: UTF-8 -*-
'''
Created on 30. mai 2012

@author: jny
'''
############# init parent django project settings
import os
import sys
import logging
import importlib

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "felizdate.settings")

import django
from django.conf import settings
from django.contrib import auth
from django.contrib.auth import models as auth_models
from django.core.handlers.wsgi import WSGIRequest
from django.db import connection

django.setup()

from os import path
import tornado.options
import tornado.web, tornado.websocket, tornado.wsgi

sys.path.append(path.dirname(path.dirname(path.abspath(__file__))))
###############

class DBMixIn(object):
    def dbconnection(self):
        self.application.dbconnection = connection
        return self.application.dbconnection

class BaseHandler(tornado.web.RequestHandler): # todo: extract django stuff into DjangoHandler
    def __init__(self, *request, **kwargs):
        super(BaseHandler,self).__init__(*request,**kwargs)
        
    def prepare(self):
        super(BaseHandler, self).prepare()
        # Prepare ORM connections
        connection.queries = []

    def finish(self, chunk=None):
        super(BaseHandler, self).finish(chunk=chunk)
        # Clean up django ORM connections
        connection.close()
        logging.info('%d sql queries' % len(connection.queries))
        for query in connection.queries:
            logging.debug('%s [%s seconds]' % (query['sql'], query['time']))

        # Clean up after python-memcached
        from django.core.cache import cache
        if hasattr(cache, 'close'):
            cache.close()

    def get_django_session(self):
        if not hasattr(self, '_session'):
            engine = importlib.import_module(settings.SESSION_ENGINE)
            session_key = self.get_cookie(settings.SESSION_COOKIE_NAME)
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
        class Dummy(object):
            pass

        django_request = Dummy()
        django_request.session = self.get_django_session()
        user = auth.get_user(django_request)
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
            user = auth.authenticate(username=username,password=password)
            if user is not None and user.is_authenticated():
                return user
            return None

    def get_django_request(self):
        request = WSGIRequest(tornado.wsgi.WSGIContainer.environ(self.request))
        request.session = self.get_django_session()
        
        if self.current_user:
            request.user = self.current_user
        else:
            request.user = auth_models.AnonymousUser()
        
        return request

class WSBaseHandler(tornado.websocket.WebSocketHandler):
    def __init__(self, *request, **kwargs):
        super(WSBaseHandler,self).__init__(*request,**kwargs)

    def open(self):
        super(WSBaseHandler, self).open()
        # Prepare ORM connections
        dbconnection = connection
        dbconnection.queries = []
        pass

    def on_close(self):
        # Clean up django ORM connections
        connection.close()
        # Clean up after python-memcached
        from django.core.cache import cache
        if hasattr(cache, 'close'):
            cache.close()

    def get_django_session(self):
        if not hasattr(self, '_session'):
            engine = importlib.import_module(settings.SESSION_ENGINE)
            session_key = self.get_cookie(settings.SESSION_COOKIE_NAME)
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
        class Dummy(object):
            pass

        django_request = Dummy()
        django_request.session = self.get_django_session()
        user = auth.get_user(django_request)
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
            user = auth.authenticate(username=username,password=password)
            if user is not None and user.is_authenticated():
                return user
            return None

    def get_django_request(self):
        request = WSGIRequest(tornado.wsgi.WSGIContainer.environ(self.request))
        request.session = self.get_django_session()
        
        if self.current_user:
            request.user = self.current_user
        else:
            request.user = auth_models.AnonymousUser()
        
        return request
