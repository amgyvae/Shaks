from django.urls import path, include
from rest_framework.routers import DefaultRouter

from apps.assignments import views

router = DefaultRouter()
router.register('assignments', views.AssignmentViewSet, basename='assignment')
router.register('submissions', views.SubmissionViewSet, basename='submission')

urlpatterns = [
    path('', include(router.urls)),
    path('submissions/<int:pk>/review/', views.ReviewSubmissionView.as_view(), name='review-submission'),
]
