#!/bin/bash
set -euo pipefail

gunicorn felizdate.wsgi:application -c gunicorn_web.py &
WEB_PID=$!

daphne -b 0.0.0.0 -p 8080 felizdate.asgi:application &
REALTIME_PID=$!

trap "kill $WEB_PID $REALTIME_PID" EXIT
wait $WEB_PID $REALTIME_PID