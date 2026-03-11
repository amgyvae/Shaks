from django.http import JsonResponse
from .models import User
def users_list(request):
    students = list(User.objects.filter(role = 'student').values())
    teachers = list(User.objects.filter(role = 'teacher').values())
    return JsonResponse({
        "students": students, 
        "teachers": teachers
    })