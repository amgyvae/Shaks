from django.urls import path

from apps.chat import views

urlpatterns = [
    path('rooms/', views.ChatRoomListView.as_view(), name='chat-rooms'),
    path('rooms/get-or-create/', views.GetOrCreateRoomView.as_view(), name='chat-get-or-create'),
    path('rooms/<int:room_id>/messages/', views.ChatMessageListView.as_view(), name='chat-messages'),
]
