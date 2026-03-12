from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import get_user_model
from .models import TeacherProfile
from .serializers import RegisterSerializer, MeSerializer, TeacherProfileSerializer


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
        teacher = TeacherProfile.objects.get(user=request.user)
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

