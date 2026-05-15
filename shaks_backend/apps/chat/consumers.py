import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model

User = get_user_model()


class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_id = self.scope['url_route']['kwargs']['room_id']
        self.room_group_name = f'chat_{self.room_id}'

        user = self.scope.get('user')
        if not user or not user.is_authenticated:
            await self.close()
            return

        allowed = await self.is_room_participant(user, int(self.room_id))
        if not allowed:
            await self.close()
            return

        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, code):
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def receive(self, text_data=None, bytes_data=None):
        data = json.loads(text_data)
        content = data.get('content', '').strip()
        if not content:
            return

        user = self.scope['user']
        message = await self.save_message(user, int(self.room_id), content)

        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'chat_message',
                'id': message['id'],
                'sender_id': user.id,
                'sender_name': user.full_name,
                'content': content,
                'sent_at': message['sent_at'],
            }
        )

    async def chat_message(self, event):
        await self.send(text_data=json.dumps({
            'id': event['id'],
            'sender_id': event['sender_id'],
            'sender_name': event['sender_name'],
            'content': event['content'],
            'sent_at': event['sent_at'],
        }))

    @database_sync_to_async
    def is_room_participant(self, user, room_id):
        from .models import ChatRoom
        return ChatRoom.objects.filter(
            id=room_id
        ).filter(
            teacher=user
        ).exists() or ChatRoom.objects.filter(
            id=room_id
        ).filter(
            student=user
        ).exists()

    @database_sync_to_async
    def save_message(self, user, room_id, content):
        from .models import ChatMessage
        msg = ChatMessage.objects.create(
            room_id=room_id,
            sender=user,
            content=content
        )
        return {'id': msg.id, 'sent_at': msg.sent_at.isoformat()}
