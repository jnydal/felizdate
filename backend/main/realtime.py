from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer


def _format_user_group(user_profile_id):
    return f"user_{user_profile_id}"


def dispatch_chat_message(target_profile_id, payload):
    """
    Send a chat payload to the websocket group for the given profile.
    Returns True if the message was queued, False otherwise.
    """
    layer = get_channel_layer()
    if not layer:
        return False
    async_to_sync(layer.group_send)(
        _format_user_group(target_profile_id),
        {
            "type": "chat.message",
            "payload": payload,
        },
    )
    return True

