from rest_framework import serializers

from apps.meetings.models import Meeting


class MeetingReadSerializer(serializers.ModelSerializer):
    created_by_name = serializers.CharField(source='created_by.full_name', read_only=True)

    class Meta:
        model = Meeting
        fields = ('id', 'title', 'description', 'meeting_link', 'scheduled_at', 'created_by', 'created_by_name', 'created_at')
        read_only_fields = fields


class MeetingWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Meeting
        fields = ('title', 'description', 'meeting_link', 'scheduled_at')
