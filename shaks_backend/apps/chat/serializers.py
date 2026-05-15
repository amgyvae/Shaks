from rest_framework import serializers

from apps.chat.models import ChatRoom, ChatMessage


class ChatMessageReadSerializer(serializers.ModelSerializer):
    sender_name = serializers.CharField(source='sender.full_name', read_only=True)
    sender_id = serializers.IntegerField(source='sender.id', read_only=True)

    class Meta:
        model = ChatMessage
        fields = ('id', 'room', 'sender_id', 'sender_name', 'content', 'sent_at', 'is_read')
        read_only_fields = fields


class ChatMessageWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatMessage
        fields = ('content',)


class ChatRoomReadSerializer(serializers.ModelSerializer):
    teacher_name = serializers.CharField(source='teacher.full_name', read_only=True)
    student_name = serializers.CharField(source='student.full_name', read_only=True)
    last_message = serializers.SerializerMethodField()
    unread_count = serializers.SerializerMethodField()

    class Meta:
        model = ChatRoom
        fields = ('id', 'teacher', 'teacher_name', 'student', 'student_name', 'created_at', 'last_message', 'unread_count')
        read_only_fields = fields

    def get_last_message(self, obj: ChatRoom) -> dict | None:
        msg = obj.messages.last()
        if msg:
            return {'content': msg.content, 'sent_at': msg.sent_at, 'sender_name': msg.sender.full_name}
        return None

    def get_unread_count(self, obj: ChatRoom) -> int:
        request = self.context.get('request')
        if request:
            return obj.messages.filter(is_read=False).exclude(sender=request.user).count()
        return 0


class ChatRoomWriteSerializer(serializers.Serializer):
    user_id = serializers.IntegerField(help_text='ID of the other participant.')
