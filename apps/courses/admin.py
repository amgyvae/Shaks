from django.contrib import admin
from .models import Course, Enrollment, Module, Lesson, Quiz, Question, LessonProgress, QuizAttempt, StudentAnswer, Answer, Submission
# Register your models here.

admin.site.register(Course)
admin.site.register(Enrollment)
admin.site.register(Module)
admin.site.register(Lesson)
admin.site.register(Quiz)
admin.site.register(Question)
admin.site.register(LessonProgress)
admin.site.register(QuizAttempt)
admin.site.register(StudentAnswer)
admin.site.register(Answer)
admin.site.register(Submission)