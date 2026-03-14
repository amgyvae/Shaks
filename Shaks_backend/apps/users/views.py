from rest_framework import generics, permissions
from rest_framework.response import Response
from .serializers import RegisterSerializer, MeSerializer, TeacherProfileSerializer, ProfileSerializer
from .models import User, TeacherProfile, Profile
from rest_framework.views import APIView
from django.http import JsonResponse
from django.contrib.auth import get_user_model
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import NotFound

from .serializers import RegisterSerializer, MeSerializer

class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]
    
class MeView(APIView):
    def get(self, request):
        return Response(MeSerializer(request.user).data)

class TeacherDashboardView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        return Response({
            "message": "Welcome to Teacher Dashboard",
            "user": request.user.username,
        })

class TeacherProfileView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        try:
            teacher = TeacherProfile.objects.get(user=request.user)
        except TeacherProfile.DoesNotExist:
            raise NotFound("У вас ещё нет профиля преподавателя. Создайте его.")
        
        serializer = TeacherProfileSerializer(teacher)
        return Response(serializer.data)

class UpdateTeacherProfileView(APIView):
    permission_classes = [IsAuthenticated]
    def put(self, request):
        teacher = TeacherProfile.objects.get(user=request.user)
        serializer = TeacherProfileSerializer(
            teacher,
            data=request.data,
            partial=True
        )
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors)
    
class ProfileView(APIView):
    permissions_classes = [IsAuthenticated]
    def get(self, request):
        try:
            student = Profile.objects.get(user=request.user)
        except Profile.DoesNotExist:
            raise NotFound("У вас ещё нет профиля преподавателя. Создайте его.")

        serializer = ProfileSerializer(student)
        return Response(serializer.data)
            
    
def users_list(request):
    students = list(User.objects.filter(role = 'student').values())
    teachers = list(User.objects.filter(role = 'teacher').values())
    return JsonResponse({
        "students": students, 
        "teachers": teachers
    })
    
