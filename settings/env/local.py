"""
Local development settings.

Imports everything from base.py, then overrides what differs locally:
  - DEBUG = True
  - SQLite database (no PostgreSQL needed locally)
  - Console email backend (emails print to terminal)
  - In-memory channel layer fallback (uncomment if Redis is not running)
"""
from settings.base import *  # noqa: F401, F403

DEBUG = True

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'

# Uncomment the block below to run without Redis (WebSocket disabled):
# CHANNEL_LAYERS = {
#     'default': {'BACKEND': 'channels.layers.InMemoryChannelLayer'}
# }
