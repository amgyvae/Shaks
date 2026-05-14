<<<<<<< HEAD
from pathlib import Path
from .conf import SECRET_KEY, DEBUG
from datetime import timedelta

BASE_DIR = Path(__file__).resolve().parent.parent

ALLOWED_HOSTS = []

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    
    "apps.users",
    "apps.courses",
    "rest_framework",
    "corsheaders"
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "corsheaders.middleware.CorsMiddleware",
]

ROOT_URLCONF = "settings.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [BASE_DIR / "templates"],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
=======
import os
from pathlib import Path
from datetime import timedelta

from .conf import (
    SECRET_KEY, DEBUG, ALLOWED_HOSTS,
    REDIS_URL, CELERY_BROKER_URL, CELERY_RESULT_BACKEND, CHANNEL_LAYER_URL,
    EMAIL_HOST, EMAIL_PORT, EMAIL_HOST_USER, EMAIL_HOST_PASSWORD,
    EMAIL_USE_TLS, DEFAULT_FROM_EMAIL,
)

BASE_DIR: Path = Path(__file__).resolve().parent.parent

# ── Security 
SECRET_KEY = SECRET_KEY  
DEBUG = DEBUG  
ALLOWED_HOSTS = ALLOWED_HOSTS  

# ── Installed Applications 
DJANGO_APPS: list[str] = [
    'daphne',
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
]

THIRD_PARTY_APPS: list[str] = [
    'rest_framework',
    'rest_framework_simplejwt',
    'corsheaders',
    'channels',
    'django_filters',
    'drf_spectacular',
]

LOCAL_APPS: list[str] = [
    'apps.core',
    'apps.accounts',
    'apps.courses',
    'apps.quizzes',
    'apps.assignments',
    'apps.social',
    'apps.notifications',
    'apps.chat',
    'apps.meetings',
]

INSTALLED_APPS = DJANGO_APPS + THIRD_PARTY_APPS + LOCAL_APPS

# ── Middleware 
MIDDLEWARE: list[str] = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.locale.LocaleMiddleware',
    'apps.core.middleware.LanguageMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF: str = 'settings.urls'
ASGI_APPLICATION: str = 'settings.asgi.application'
WSGI_APPLICATION: str = 'settings.wsgi.application'

# ── Templates
TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
                'django.template.context_processors.i18n',
>>>>>>> final changes with requirements
            ],
        },
    },
]

<<<<<<< HEAD
'''
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ),
    "DEFAULT_PERMISSION_CLASSES": (
        "rest_framework.permissions.IsAuthenticated",
    ),
    "DEFAULT_RENDERER_CLASSES": (
        "rest_framework.renderers.JSONRenderer",
        "rest_framework.renderers.BrowsableAPIRenderer",
    ),
}
'''

REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework.authentication.SessionAuthentication",
        "rest_framework_simplejwt.authentication.JWTAuthentication",
        "rest_framework.authentication.BasicAuthentication",
    ),
    "DEFAULT_PERMISSION_CLASSES": (
        "rest_framework.permissions.AllowAny",
        'rest_framework.permissions.IsAuthenticated',
    ),
    "DEFAULT_RENDERER_CLASSES": (
        "rest_framework.renderers.JSONRenderer",
        "rest_framework.renderers.BrowsableAPIRenderer",
    ),
}

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=60),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=7),
}

WSGI_APPLICATION = "settings.wsgi.application"

DATABASES = {}

STATIC_URL = "/static/"
STATIC_ROOT = BASE_DIR / "staticfiles"
STATICFILES_DIRS = [BASE_DIR / "static"]

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

SECRET_KEY = SECRET_KEY
DEBUG = DEBUG

AUTH_USER_MODEL = "users.User"

CORS_ALLOW_ALL_ORIGINS = True

CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
]
=======
# ── Database  
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

# ── Auth  
AUTH_USER_MODEL: str = 'accounts.User'

AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

# ── Internationalization
LANGUAGE_CODE: str = 'en'
TIME_ZONE: str = 'Asia/Almaty'
USE_I18N: bool = True
USE_L10N: bool = True
USE_TZ: bool = True

LANGUAGES = [
    ('en', 'English'),
    ('ru', 'Russian'),
    ('kk', 'Kazakh'),
]

LOCALE_PATHS = [BASE_DIR / 'locale']

# ── Static & Media  ─
STATIC_URL: str = '/static/'
STATIC_ROOT: Path = BASE_DIR / 'staticfiles'
MEDIA_URL: str = '/media/'
MEDIA_ROOT: Path = BASE_DIR / 'media'

DEFAULT_AUTO_FIELD: str = 'django.db.models.BigAutoField'

# ── CORS 
CORS_ALLOW_ALL_ORIGINS: bool = True

# ── Django REST Framework 
REST_FRAMEWORK: dict = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
    'DEFAULT_FILTER_BACKENDS': [
        'django_filters.rest_framework.DjangoFilterBackend',
        'rest_framework.filters.SearchFilter',
        'rest_framework.filters.OrderingFilter',
    ],
    'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',
    'EXCEPTION_HANDLER': 'apps.core.exceptions.custom_exception_handler',
}

# ── SimpleJWT 
SIMPLE_JWT: dict = {
    'ACCESS_TOKEN_LIFETIME': timedelta(days=1),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=30),
    'AUTH_HEADER_TYPES': ('Bearer',),
    'TOKEN_OBTAIN_SERIALIZER': 'rest_framework_simplejwt.serializers.TokenObtainPairSerializer',
}

# ── DRF Spectacular (Swagger/ReDoc)
SPECTACULAR_SETTINGS: dict = {
    'TITLE': 'Shaks LMS API',
    'DESCRIPTION': (
        'REST API for Shaks Learning Management System. '
        'Supports JWT authentication, courses, assignments, quizzes, '
        'chat, notifications, meetings and social features. '
        'Supports languages: English (en), Russian (ru), Kazakh (kk).'
    ),
    'VERSION': '1.0.0',
    'SERVE_INCLUDE_SCHEMA': False,
    'COMPONENT_SPLIT_REQUEST': True,
    'TAGS': [
        {'name': 'Auth', 'description': 'Authentication & user management'},
        {'name': 'Courses', 'description': 'Grades, subjects, modules, topics'},
        {'name': 'Assignments', 'description': 'Assignments and submissions'},
        {'name': 'Quizzes', 'description': 'Quiz questions and attempts'},
        {'name': 'Social', 'description': 'Posts, likes, comments'},
        {'name': 'Chat', 'description': 'Direct messaging between teacher and student'},
        {'name': 'Notifications', 'description': 'In-app notifications'},
        {'name': 'Meetings', 'description': 'Scheduled online meetings'},
        {'name': 'Stats', 'description': 'Platform statistics (async)'},
    ],
    'SWAGGER_UI_SETTINGS': {
        'deepLinking': True,
        'persistAuthorization': True,
        'displayRequestDuration': True,
    },
}

# ── Redis Cache 
CACHES: dict = {
    'default': {
        'BACKEND': 'django_redis.cache.RedisCache',
        'LOCATION': REDIS_URL,
        'OPTIONS': {
            'CLIENT_CLASS': 'django_redis.client.DefaultClient',
        },
        'KEY_PREFIX': 'shaks',
    }
}

# ── Django Channels  
CHANNEL_LAYERS: dict = {
    'default': {
        'BACKEND': 'channels_redis.core.RedisChannelLayer',
        'CONFIG': {
            'hosts': [CHANNEL_LAYER_URL],
        },
    }
}

# ── Celery  
CELERY_BROKER_URL = CELERY_BROKER_URL  # noqa: F811
CELERY_RESULT_BACKEND = CELERY_RESULT_BACKEND  # noqa: F811
CELERY_ACCEPT_CONTENT: list[str] = ['json']
CELERY_TASK_SERIALIZER: str = 'json'
CELERY_RESULT_SERIALIZER: str = 'json'
CELERY_TIMEZONE: str = 'Asia/Almaty'
CELERY_BEAT_SCHEDULER: str = 'django_celery_beat.schedulers:DatabaseScheduler'

# ── Email  
EMAIL_BACKEND: str = 'django.core.mail.backends.console.EmailBackend'
EMAIL_HOST = EMAIL_HOST  # noqa: F811
EMAIL_PORT = EMAIL_PORT  # noqa: F811
EMAIL_HOST_USER = EMAIL_HOST_USER  # noqa: F811
EMAIL_HOST_PASSWORD = EMAIL_HOST_PASSWORD  # noqa: F811
EMAIL_USE_TLS = EMAIL_USE_TLS  # noqa: F811
DEFAULT_FROM_EMAIL = DEFAULT_FROM_EMAIL  # noqa: F811

# ── Logging 
LOGGING: dict = {
    'version': 1,
    'disable_existing_loggers': False,
    'filters': {
        'require_debug_true': {
            '()': 'django.utils.log.RequireDebugTrue',
        },
    },
    'formatters': {
        'simple': {
            'format': '[{levelname}] {message}',
            'style': '{',
        },
        'verbose': {
            'format': '{asctime} [{levelname}] {name} {module}: {message}',
            'style': '{',
            'datefmt': '%Y-%m-%d %H:%M:%S',
        },
    },
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
            'level': 'DEBUG',
            'formatter': 'simple',
        },
        'file': {
            'class': 'logging.handlers.RotatingFileHandler',
            'filename': BASE_DIR / 'logs' / 'app.log',
            'maxBytes': 5 * 1024 * 1024,  # 5 MB
            'backupCount': 3,
            'level': 'WARNING',
            'formatter': 'verbose',
        },
        'debug_requests': {
            'class': 'logging.handlers.RotatingFileHandler',
            'filename': BASE_DIR / 'logs' / 'debug_requests.log',
            'maxBytes': 5 * 1024 * 1024,
            'backupCount': 2,
            'level': 'DEBUG',
            'formatter': 'verbose',
            'filters': ['require_debug_true'],
        },
    },
    'loggers': {
        'apps.accounts': {
            'handlers': ['console', 'file'],
            'level': 'DEBUG',
            'propagate': False,
        },
        'apps.courses': {
            'handlers': ['console', 'file'],
            'level': 'DEBUG',
            'propagate': False,
        },
        'apps.assignments': {
            'handlers': ['console', 'file'],
            'level': 'DEBUG',
            'propagate': False,
        },
        'apps.chat': {
            'handlers': ['console', 'file'],
            'level': 'DEBUG',
            'propagate': False,
        },
        'apps.notifications': {
            'handlers': ['console', 'file'],
            'level': 'DEBUG',
            'propagate': False,
        },
        'apps.social': {
            'handlers': ['console', 'file'],
            'level': 'DEBUG',
            'propagate': False,
        },
        'apps.meetings': {
            'handlers': ['console', 'file'],
            'level': 'DEBUG',
            'propagate': False,
        },
        'django.request': {
            'handlers': ['file', 'debug_requests'],
            'level': 'WARNING',
            'propagate': False,
        },
        'celery': {
            'handlers': ['console', 'file'],
            'level': 'INFO',
            'propagate': False,
        },
    },
}
>>>>>>> final changes with requirements
