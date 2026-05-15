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
