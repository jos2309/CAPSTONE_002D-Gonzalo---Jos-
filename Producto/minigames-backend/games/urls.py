from django.urls import path
from .views import BookMinigameListView, BookMinigameByCodeView

urlpatterns = [
    # Ruta para obtener todos los minijuegos de un libro por su ID
    path('books/<uuid:book_id>/minigames/', BookMinigameListView.as_view(), name='book-minigames-list'),
    
    # Ruta para obtener minijuegos de un libro filtrados por tipo
    path('books/<uuid:book_id>/minigames/<str:game_code>/', BookMinigameByCodeView.as_view(), name='book-minigames-by-code'),
]