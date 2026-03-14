from rest_framework.views import APIView
from django.urls import path, include
# from .views import RegisterView, MeView, TeacherDashboardView, TeacherProfileView, UpdateTeacherProfileView
from .views import *
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),
    path("me/", MeView.as_view(), name="me"),
    path("teacher/dashboard/", TeacherDashboardView.as_view()),
    path("teacher/profile/", TeacherProfileView.as_view()),
    path("teacher/profile/update", UpdateTeacherProfileView.as_view()),
    path("api/login/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/refresh/", TokenRefreshView.as_view(), name="token_refresh"),

]