from django.contrib.auth import get_user_model
from .models import TeacherProfile, Profile
from rest_framework import serializers

User = get_user_model()

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=0)
    
    class Meta:
        model = User
        fields = ("id", "username", "email", "password") #remove role
        
    def create(self, validated_data):
        password = validated_data.pop("password")
        user = User(**validated_data)
        user.role = "stundent"
        user.set_password(password)
        user.save()
        return user
    
class MeSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("id", "username", "email", "role")
        read_only_fields = ("role")
        
class TeacherProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True) 
    class Meta:
        model = TeacherProfile
        fields = [
            'id',
            'user',               
            'username',           
            'avatar',
            'experience_years',
            'bio',
            'specialization',
            'created_at',
        ]
        read_only_fields = ['id', 'created_at', 'username']  
        
class ProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    class Meta:
        model = Profile
        fields = [
            'id',
            'user',
            'username',
            'bio',
            'avatar',
            'phone',
        ]
        read_only_fields = ['id', 'username']