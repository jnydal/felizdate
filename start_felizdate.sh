#!/bin/bash
gunicorn runserver -c gunicorn_chat.py
gunicorn runserver -c gunicorn_instance1.py