import logging

from django.contrib.auth import get_user_model
from django.utils.translation import gettext_lazy as _
from drf_spectacular.utils import extend_schema, OpenApiResponse

from rest_framework import generics, permissions, status
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.chat.models import ChatRoom, ChatMessage
from apps.chat.serializers import ChatRoomReadSerializer, ChatRoomWriteSerializer, ChatMessageReadSerializer

logger = logging.getLogger('apps.chat')
User = get_user_model()


class ChatRoomListView(generics.ListAPIView):
    serializer_class = ChatRoomReadSerializer
    permission_classes = [permissions.IsAuthenticated]
    search_fields = ['teacher__full_name', 'student__full_name']

    def get_queryset(self):
        if getattr(self, 'swagger_fake_view', False):
            return ChatRoom.objects.none()
        user = self.request.user
        if user.role in ('teacher', 'admin'):
            return ChatRoom.objects.filter(teacher=user).select_related('teacher', 'student').prefetch_related('messages__sender')
        return ChatRoom.objects.filter(student=user).select_related('teacher', 'student').prefetch_related('messages__sender')

    def get_serializer_context(self):
        ctx = super().get_serializer_context()
        ctx['request'] = self.request
        return ctx

    @extend_schema(
        summary='List chat rooms',
        description='Returns all chat rooms for the authenticated user. Permission: IsAuthenticated.',
        tags=['Chat'],
        responses={200: ChatRoomReadSerializer(many=True), 401: OpenApiResponse(description='Not authenticated')},
    )
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)


class GetOrCreateRoomView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(
        summary='Get or create chat room',
        description='Returns an existing room or creates a new one between teacher and student.',
        tags=['Chat'],
        request=ChatRoomWriteSerializer,
        responses={
            200: ChatRoomReadSerializer,
            400: OpenApiResponse(description='Invalid user pair'),
            404: OpenApiResponse(description='User not found'),
        },
    )
    def post(self, request: Request) -> Response:
        user = request.user
        other_id = request.data.get('user_id')
        if not other_id:
            return Response({'detail': _('user_id required')}, status=status.HTTP_400_BAD_REQUEST)
        try:
            other = User.objects.get(id=other_id)
        except User.DoesNotExist:
            return Response({'detail': _('User not found')}, status=status.HTTP_404_NOT_FOUND)
        if user.role in ('teacher', 'admin') and other.role == 'student':
            teacher, student = user, other
        elif user.role == 'student' and other.role in ('teacher', 'admin'):
            teacher, student = other, user
        else:
            return Response({'detail': _('Chat must be between a teacher and a student')}, status=status.HTTP_400_BAD_REQUEST)
        room, _ = ChatRoom.objects.get_or_create(teacher=teacher, student=student)
        logger.info('Chat room %d accessed by %s', room.pk, user.identifier)
        return Response(ChatRoomReadSerializer(room, context={'request': request}).data)


class ChatMessageListView(generics.ListAPIView):
    serializer_class = ChatMessageReadSerializer
    permission_classes = [permissions.IsAuthenticated]
    ordering_fields = ['sent_at']

    def get_queryset(self):
        if getattr(self, 'swagger_fake_view', False):
            return ChatMessage.objects.none()
        room_id = self.kwargs['room_id']
        user = self.request.user
        ChatMessage.objects.filter(room_id=room_id).exclude(sender=user).update(is_read=True)
        return ChatMessage.objects.filter(room_id=room_id).select_related('sender')

    @extend_schema(
        summary='List chat messages',
        description='Returns all messages in a chat room. Marks received messages as read.',
        tags=['Chat'],
        responses={200: ChatMessageReadSerializer(many=True), 401: OpenApiResponse(description='Not authenticated')},
    )
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)
