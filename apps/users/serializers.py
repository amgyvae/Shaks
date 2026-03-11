from django.contrib.auth import get_user_model
from rest_framework import serializers

User = get_user_model()

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=0)
    
    class Meta:
        model = User
        fields = ("id", "username", "email", "password") 
        
    def create(self, validated_data):
        password = validated_data.pop("password")
        user = User(**validated_data)
        user.role = "student"
        user.set_password(password)
        user.save()
        return user
    
class MeSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("id", "username", "email", "role")
        read_only_fields = ("role")