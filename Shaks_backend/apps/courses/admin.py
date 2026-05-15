from django.contrib import admin
from .models import Grade, Subject, Module, Topic, Announcement

admin.site.register(Grade)
admin.site.register(Subject)
admin.site.register(Module)
admin.site.register(Topic)
admin.site.register(Announcement)