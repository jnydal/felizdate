# -*- encoding: UTF-8 -*-
'''
Created on 30. mai 2012

@author: jny
'''

import os
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "felizdate.settings")

from django.core.wsgi import WSGIHandler
import tornado.wsgi, tornado.ioloop
from felizdate.main import async

wsgi_app = tornado.wsgi.WSGIContainer(WSGIHandler())
application = tornado.web.Application(
                                      [
                                       (r"/async/recv/$", async.LongpollHandler),
                                       (r"/socket", async.WebSocketHandler),
                                       (r".*", tornado.web.FallbackHandler, dict(fallback=wsgi_app)),
                                       ])

if __name__ == '__main__':
    application.listen(8080)
    print "Tornado/Django instance running."
    tornado.ioloop.IOLoop.instance().start()
