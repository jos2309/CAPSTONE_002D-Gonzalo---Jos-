from rest_framework import generics
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import BookMinigame, Minigame
from .serializers import BookMinigameSerializer, MinigameSerializer

# Endpoint 1: Listar minijuegos de un libro específico por su UUID
class BookMinigameListView(generics.ListAPIView):
    serializer_class = BookMinigameSerializer

    def get_queryset(self):
        book_id = self.kwargs.get('book_id')
        return BookMinigame.objects.filter(book_id=book_id)

# Endpoint 2 (Opcional): Obtener los juegos filtrando por libro y tipo de juego (ej. ráfaga, emoticono)
class BookMinigameByCodeView(APIView):
    def get(self, request, book_id, game_code):
        games = BookMinigame.objects.filter(book_id=book_id, minigame__code=game_code)
        serializer = BookMinigameSerializer(games, many=True)
        return Response(serializer.data)