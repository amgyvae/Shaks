<<<<<<< HEAD
"""
URL configuration for settings project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    path("admin/", admin.site.urls),

    # Auth/JWT
    path("api/auth/token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/auth/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path('api-auth/', include('rest_framework.urls', namespace='rest_framework')),

    # Users API
    path("api/users/", include("apps.users.urls")),
    
    #API
    path("api/", include("apps.users.urls")),
    
    # Course API
    path("api/courses/", include("apps.courses.urls")),
    
    path("api/quizzes/", include("apps.courses.quiz_urls")),
    
    path("api/lessons/", include("apps.courses.urls"))
]
=======
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularSwaggerView,
    SpectacularRedocView,
)

urlpatterns = [
    path('admin/', admin.site.urls),

    # API Documentation
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),

    # App URLs
    path('api/auth/', include('apps.accounts.urls')),
    path('api/courses/', include('apps.courses.urls')),
    path('api/quizzes/', include('apps.quizzes.urls')),
    path('api/assignments/', include('apps.assignments.urls')),
    path('api/social/', include('apps.social.urls')),
    path('api/notifications/', include('apps.notifications.urls')),
    path('api/chat/', include('apps.chat.urls')),
    path('api/meetings/', include('apps.meetings.urls')),
    path('api/stats/', include('apps.core.urls')),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
>>>>>>> final changes with requirements
