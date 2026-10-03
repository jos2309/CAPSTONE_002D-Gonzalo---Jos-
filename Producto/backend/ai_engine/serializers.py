from rest_framework import serializers
from .models import AIAvatar, ChatSession, ChatMessage


class AIAvatarListSerializer(serializers.ModelSerializer):
    """
    Serializer para la lista de avatares en el panel del lector.
    Incluye campo computado 'is_unlocked' basado en el progreso del usuario.
    """
    is_unlocked = serializers.SerializerMethodField()
    avatar_image_url = serializers.SerializerMethodField()
    video_avatar_url = serializers.SerializerMethodField()
    image_speaking_1_url = serializers.SerializerMethodField()
    image_speaking_2_url = serializers.SerializerMethodField()
    image_speaking_3_url = serializers.SerializerMethodField()
    image_thinking_url = serializers.SerializerMethodField()

    class Meta:
        model = AIAvatar
        fields = [
            'id', 'name', 'description', 'avatar_image_url', 'video_avatar_url',
            'image_speaking_1_url', 'image_speaking_2_url', 'image_speaking_3_url', 'image_thinking_url',
            'unlock_at_chapter', 'is_major_character', 'is_author',
            'is_unlocked', 'greeting_message',
        ]

    def _get_absolute_url(self, image_field):
        """Método auxiliar para construir URLs absolutas o relativas de forma segura."""
        if not image_field or not getattr(image_field, 'name', None):
            return None
        request = self.context.get('request')
        if request:
            return request.build_absolute_uri(image_field.url)
        return image_field.url

    def _get_manga_asset_fallback(self, obj, filename):
        """Retorna la URL fallback si el avatar utiliza la estructura de carpetas de manga_assets."""
        avatar_url = self._get_absolute_url(obj.avatar_image)
        if avatar_url and 'manga_assets' in avatar_url:
            base_url = avatar_url.rsplit('/', 1)[0] + '/'
            return base_url + filename
        return None

    def get_is_unlocked(self, obj):
        # El autor siempre está disponible para chatear
        if getattr(obj, 'is_author', False):
            return True
        
        # El contexto 'current_chapter' es inyectado por la vista
        current_chapter = self.context.get('current_chapter', 0)
        unlock_at = getattr(obj, 'unlock_at_chapter', 0) or 0
        return current_chapter >= unlock_at

    def get_avatar_image_url(self, obj):
        return self._get_absolute_url(obj.avatar_image)

    def get_video_avatar_url(self, obj):
        # Mantenido por compatibilidad con el frontend
        return None

    def get_image_speaking_1_url(self, obj):
        return self._get_absolute_url(obj.image_speaking_1) or self._get_manga_asset_fallback(obj, 'talking_1.webp')

    def get_image_speaking_2_url(self, obj):
        return self._get_absolute_url(obj.image_speaking_2) or self._get_manga_asset_fallback(obj, 'talking_2.webp')

    def get_image_speaking_3_url(self, obj):
        return self._get_absolute_url(obj.image_speaking_3) or self._get_manga_asset_fallback(obj, 'talking_3.webp')

    def get_image_thinking_url(self, obj):
        return self._get_absolute_url(obj.image_thinking) or self._get_manga_asset_fallback(obj, 'thinking.webp')


class ChatSessionSerializer(serializers.ModelSerializer):
    """Serializer para crear/recuperar una sesión de chat."""
    id = serializers.CharField(read_only=True)  # UUID como string
    avatar_name = serializers.CharField(source='avatar.name', read_only=True, default='')

    class Meta:
        model = ChatSession
        fields = ['id', 'title', 'avatar_name', 'created_at']


class ChatMessageSerializer(serializers.ModelSerializer):
    """Serializer para los mensajes individuales de una sesión."""
    class Meta:
        model = ChatMessage
        fields = ['id', 'role', 'content', 'created_at']


class ChatInteractionSerializer(serializers.Serializer):
    """
    Serializador para la entrada del endpoint de chat.
    Valida session_id (UUID) y mensaje.
    """
    session_id = serializers.UUIDField(required=True)
    message = serializers.CharField(required=True, max_length=2000)


class GlobalHubAvatarSerializer(serializers.ModelSerializer):
    """Serializer para el Hub Global de Personajes (Character.ai style)."""
    book_title = serializers.CharField(source='edition.book.title', read_only=True, default=None)
    book_slug = serializers.CharField(source='edition.book.slug', read_only=True, default=None)
    avatar_image_url = serializers.SerializerMethodField()
    tags = serializers.SerializerMethodField()
    trend_level = serializers.SerializerMethodField()

    class Meta:
        model = AIAvatar
        fields = [
            'id', 'name', 'book_title', 'book_slug', 'description', 'avatar_image_url',
            'tags', 'trend_level', 'chat_count'
        ]

    def get_avatar_image_url(self, obj):
        if obj.avatar_image and getattr(obj.avatar_image, 'name', None):
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.avatar_image.url)
            return obj.avatar_image.url
        return None

    def get_trend_level(self, obj):
        chat_count = getattr(obj, 'chat_count', 0) or 0
        if chat_count > 100:
            return 90
        if chat_count > 50:
            return 70
        if chat_count > 10:
            return 40
        return 10

    def get_tags(self, obj):
        tags = []
        if getattr(obj, 'is_author', False):
            tags.append("Autor")
        if getattr(obj, 'is_major_character', False):
            tags.append("Principal")
        return tags