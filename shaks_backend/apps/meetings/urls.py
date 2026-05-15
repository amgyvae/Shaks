from rest_framework.routers import DefaultRouter

from apps.meetings.views import MeetingViewSet

router = DefaultRouter()
router.register(r'', MeetingViewSet, basename='meeting')
urlpatterns = router.urls
