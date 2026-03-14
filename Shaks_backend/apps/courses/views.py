from django.shortcuts import render
from rest_framework import generics, permissions
from .models import Course, Enrollment, Quiz, Answer, QuizAttempt, StudentAnswer, Question
from .serializers import CourseSerializer, CourseDetailSerializer
from .permissions import IsTeacher
from .enrollment_serializers import EnrollmentSerializer
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.viewsets import ModelViewSet
from .models import Lesson
from .serializers import LessonSerializer

# Create your views here.
class CourseListCreateView(generics.ListCreateAPIView):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer
    
    def get_permissions(self):
        if self.request.method == "POST":
            return [IsTeacher()]
        return [permissions.AllowAny()]
    
    def perform_create(self, serializer):
        serializer.save(teacher=self.request.user)

class EnrollmentCreateView(generics.CreateAPIView):
    serializer_class = EnrollmentSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def perform_create(self, serializer):
        serializer.save(student=self.request.user)  
        
class CourseDetailView(generics.RetrieveAPIView):
    queryset = Course.objects.all()
    serializer_class = CourseDetailSerializer
    
class SubmitQuizView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        quiz_id = request.data.get("quiz_id")
        answers = request.data.get("answer", [])
        
        quiz = Quiz.objects.get(id=quiz_id)
        
        attempt = QuizAttempt.objects.create(
            student=request.user,
            quiz=quiz
        )
        
        score = 0
        total = len(answers)
        
        for item in answers:
            question_id = item["question_id"]
            answer_id = item["answer_id"]
            
            question = Question.objects.get(id=question_id)
            answer = Answer.objects.get(id=answer_id)
            
            is_correct = answer.is_correct
            
            if is_correct:
                score+=1
                
            StudentAnswer.objects.create(
                attempt=attempt,
                question=question,
                selected_answer=answer,
                is_correct=is_correct
            )
            
        percent = (score / total) * 100 if total > 0 else 0
        
        attempt.score = percent
        attempt.completed = True
        attempt.save()
        
        return Response({
            "score": percent
        })
    
class LessonViewSet(ModelViewSet):
    queryset = Lesson.objects.all()
    serializer_class = LessonSerializer