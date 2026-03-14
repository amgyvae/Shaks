from django.urls import path
from .views import CourseListCreateView, EnrollmentCreateView, CourseDetailView, SubmitQuizView, LessonViewSet

urlpatterns = [
    path("", CourseListCreateView.as_view(), name="course-list-create"),
    path("enroll/", EnrollmentCreateView.as_view(), name="enroll-list-create"),
    path("<int:pk>/", CourseDetailView.as_view()),
    path("quizzes/submit/", SubmitQuizView.as_view()),
    
    #lessons links
    path("lessons/", LessonViewSet.as_view({'get': 'list', 'post': 'create'})),
    path("lessons/<int:pk>/", LessonViewSet.as_view({'get': 'retrieve'})),
    
]
