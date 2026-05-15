from django.urls import path, include
from rest_framework.routers import DefaultRouter

from apps.courses import views

router = DefaultRouter()
router.register('grades', views.GradeViewSet, basename='grade')
router.register('subjects', views.SubjectViewSet, basename='subject')
router.register('modules', views.ModuleViewSet, basename='module')
router.register('topics', views.TopicViewSet, basename='topic')
router.register('announcements', views.AnnouncementViewSet, basename='announcement')

urlpatterns = [
    path('', include(router.urls)),
    path('topics/<int:pk>/watched/', views.MarkVideoWatchedView.as_view(), name='mark-watched'),
    path('watched/', views.WatchedTopicsView.as_view(), name='watched-list'),
]