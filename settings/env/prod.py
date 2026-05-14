<<<<<<< HEAD
from ..base import *

DEBUG = False

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": "lms",
        "USER": "postgres",
        "PASSWORD": "password",
        "HOST": "localhost",
        "PORT": "5432",
    }
}
=======
from settings.base import * 

DEBUG = False

ALLOWED_HOSTS = ['localhost', '127.0.0.1', '0.0.0.0']

EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'

SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
SECURE_BROWSER_XSS_FILTER = True
X_FRAME_OPTIONS = 'DENY'
SECURE_CONTENT_TYPE_NOSNIFF = True
>>>>>>> final changes with requirements
