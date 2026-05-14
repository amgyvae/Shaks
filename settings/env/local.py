<<<<<<< HEAD
from ..base import *
=======
from settings.base import *  
>>>>>>> final changes with requirements

DEBUG = True

DATABASES = {
<<<<<<< HEAD
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": BASE_DIR / "db.sqlite3",
    }
}
=======
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'

>>>>>>> final changes with requirements
