<<<<<<< HEAD
"""
ASGI config for settings project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/6.0/howto/deployment/asgi/
"""

import os

from django.core.asgi import get_asgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'settings.settings')

application = get_asgi_application()
=======
import os

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'settings.env.local')

from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.security.websocket import AllowedHostsOriginValidator

django_asgi_app = get_asgi_application()

from apps.chat.routing import websocket_urlpatterns as chat_ws
from apps.core.middleware import JWTAuthMiddlewareStack

application = ProtocolTypeRouter({
    'http': django_asgi_app,
    'websocket': AllowedHostsOriginValidator(
        JWTAuthMiddlewareStack(
            URLRouter(chat_ws)
        )
    ),
})
>>>>>>> final changes with requirements
