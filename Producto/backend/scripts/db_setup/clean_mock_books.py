import os
import sys
from pathlib import Path

# Add backend directory to sys.path
BASE_DIR = Path(__file__).resolve().parent.parent.parent
sys.path.append(str(BASE_DIR))

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
import django
django.setup()

from django.db import transaction
from catalog.models import Book, Edition, Chapter, BookAuthor

def clean_mock_books():
    print("Iniciando depuración de libros de prueba (mock data)...\n")

    # Obtener libros sin ediciones o con ediciones vacías/sin archivo epub válido
    valid_book_ids = Book.objects.filter(
        editions__file__isnull=False
    ).exclude(
        editions__file=''
    ).values_list('id', flat=True).distinct()

    mock_books = Book.objects.exclude(id__in=valid_book_ids)
    mock_count = mock_books.count()

    print(f"Se encontraron {mock_count} libros ficticios/incompletos sin archivo .epub real:")

    deleted_titles = []
    with transaction.atomic():
        for book in mock_books:
            deleted_titles.append(f"{book.title} (slug: {book.slug})")
            book.delete()

    for title in deleted_titles[:15]:
        print(f"  [-] Eliminado: {title}")
    if len(deleted_titles) > 15:
        print(f"  ... y {len(deleted_titles) - 15} libros adicionales.")

    print("\n" + "="*50)
    print(f"RESUMEN DE LIMPIEZA:")
    print(f"Libros eliminados: {mock_count}")
    print(f"Libros reales restantes en BD: {Book.objects.count()}")
    print("="*50)

if __name__ == '__main__':
    clean_mock_books()
