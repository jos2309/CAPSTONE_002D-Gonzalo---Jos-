import os
import sys
import os
# Add parent directory to path to allow importing django config
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
import django

# Configurar el entorno de Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from catalog.models import Author, Book, BookAuthor, Genre, Edition
from ai_engine.models import AIAvatar
from django.core.files.base import ContentFile

def seed_data():
    print("El seeding de datos ahora se realiza dinámicamente desde populate_books.py")
    print("No se inyectarán datos ficticios ni libros de prueba sin archivo .epub real.")

if __name__ == "__main__":
    seed_data()

