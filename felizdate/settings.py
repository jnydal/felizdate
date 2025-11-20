"""
Compatibility settings module that re-exports the legacy backend settings.
This lets us keep the historical `DJANGO_SETTINGS_MODULE=felizdate.settings`
value while physically storing the configuration under `backend/settings.py`.
"""
from backend.settings import *  # noqa: F401,F403

