from django.urls import path, include
from rest_framework.routers import DefaultRouter

from apps.quizzes import views

router = DefaultRouter()
router.register('', views.QuizViewSet, basename='quiz')

urlpatterns = [
    path('submit/', views.SubmitAnswerView.as_view(), name='submit-answer'),
    path('', include(router.urls)),
]