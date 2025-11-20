# -*- encoding: UTF-8 -*-
"""
Standalone Tornado server responsible only for realtime endpoints
(`/async/recv/` long-polling + `/socket` WebSocket push). All standard
Django HTTP traffic is now served directly by Gunicorn via the WSGI entrypoint.
"""
import os

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "felizdate.settings")

import django

django.setup()

import importlib
import tornado.ioloop
import tornado.web

async_handlers = importlib.import_module("backend.main.async")


def make_application():
    return tornado.web.Application(
        [
            (r"/async/recv/?", async_handlers.LongpollHandler),
            (r"/socket", async_handlers.WebSocketHandler),
        ]
    )


def main():
    host = os.getenv("ASYNC_HOST", "0.0.0.0")
    port = int(os.getenv("ASYNC_PORT", "8080"))
    application = make_application()
    application.listen(port, address=host)
    print(f"Tornado async server listening on {host}:{port}")
    tornado.ioloop.IOLoop.current().start()


if __name__ == "__main__":
    main()