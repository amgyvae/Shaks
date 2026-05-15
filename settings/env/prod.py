"""
Production settings.

Imports everything from base.py, then overrides what differs in production:
  - DEBUG = False
  - ALLOWED_HOSTS restricted to real hostnames
  - SMTP email backend
  - Strict security headers (proxy SSL, XSS filter, X-Frame)
"""
from settings.base import *  # noqa: F401, F403

DEBUG = False

ALLOWED_HOSTS = ['localhost', '127.0.0.1', '0.0.0.0']

EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'

# Tell Django that the nginx proxy sets X-Forwarded-Proto
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
SECURE_BROWSER_XSS_FILTER = True
X_FRAME_OPTIONS = 'DENY'
SECURE_CONTENT_TYPE_NOSNIFF = True
