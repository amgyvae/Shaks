<<<<<<< HEAD
# Python modules
import os

# Django modules
from django.core.wsgi import get_wsgi_application

# Project modules
from settings.conf import ENV_ID, ENV_POSSIBLE_OPTIONS


assert ENV_ID in ENV_POSSIBLE_OPTIONS, f"Invalid env id. Possible options: {ENV_POSSIBLE_OPTIONS}"

os.environ.setdefault('DJANGO_SETTINGS_MODULE', f'settings.env.{ENV_ID}')

application = get_wsgi_application()
=======
"""
WSGI config for settings project.

It exposes the WSGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/6.0/howto/deployment/wsgi/
"""

import os

from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'settings.settings')

application = get_wsgi_application()
>>>>>>> 8b8d9f28565ec785158feefecda8de01869b8e04
