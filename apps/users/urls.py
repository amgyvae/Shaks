from django.urls import path
from .views import RegisterView, MeView, TeacherDashboardView, TeacherProfileView, UpdateTeacherProfileView, users_list, ProfileView

urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),
    path("me/", MeView.as_view(), name="me"),
    path('users/', users_list),
    path("teacher/dashboard/", TeacherDashboardView.as_view()),
    path("teacher/profile/", TeacherProfileView.as_view()),
    path("teacher/profile/update/", UpdateTeacherProfileView.as_view()),
    path("student/profile/", ProfileView.as_view()),
]