from django.urls import path
from .views import SubmitQuizView

urlpatterns = [
    path("submit/", SubmitQuizView.as_view(), name="quiz-submit"),
]