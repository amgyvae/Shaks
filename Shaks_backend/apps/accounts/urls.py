"""URL patterns for accounts app."""
from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from . import views

urlpatterns = [
    path('register/', views.ActivateAccountView.as_view(), name='activate-account'),
    path('login/', views.LoginView.as_view(), name='login'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token-refresh'),

    path('me/', views.MeView.as_view(), name='me'),
    path('language/', views.LanguagePreferenceView.as_view(), name='language-preference'),
    path('timezone/', views.TimezonePreferenceView.as_view(), name='timezone-preference'),

    path('users/', views.UserListView.as_view(), name='user-list'),
    path('users/create/', views.CreateUserView.as_view(), name='user-create'),
    path('users/<int:pk>/', views.UserDetailView.as_view(), name='user-detail'),
    path('users/<int:pk>/assign-grade/', views.AssignGradeView.as_view(), name='assign-grade'),
]
