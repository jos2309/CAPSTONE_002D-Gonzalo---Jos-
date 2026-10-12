"""
scripts/populate_all_chapters.py — Ingesta masiva de capítulos desde archivos EPUB.
"""
import os
import sys
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
django.setup()

from catalog.models import Book, Chapter, Edition
from scripts.fix_broken_books import extract_chapters_from_spine

def populate_all_chapters():
    books = Book.objects.all().order_by('id')
    total = books.count()
    print(f"Iniciando procesamiento masivo de capítulos para {total} libros...")

    success = 0
    skipped = 0
    failed = 0

    for i, book in enumerate(books):
        if book.chapters.exists():
            skipped += 1
            continue

        edition = book.editions.filter(file__isnull=False).exclude(file='').first()
        if not edition or not edition.file:
            failed += 1
            continue

        epub_path = edition.file.path
        if not os.path.exists(epub_path):
            failed += 1
            continue

        try:
            chapters_data = extract_chapters_from_spine(epub_path, book.slug)
            if chapters_data:
                Chapter.objects.bulk_create([
                    Chapter(book=book, title=c['title'], content_html=c['content_html'], order=c['order'])
                    for c in chapters_data
                ])
                success += 1
                if success % 50 == 0:
                    print(f"Progreso: [{i+1}/{total}] {success} libros procesados exitosamente...")
            else:
                failed += 1
        except Exception as e:
            print(f"Error procesando {book.slug}: {e}")
            failed += 1

    print("\n=== RESUMEN DE PROCESAMIENTO MASIVO ===")
    print(f"Libros procesados con éxito: {success}")
    print(f"Libros ya existentes (omitidos): {skipped}")
    print(f"Libros sin EPUB / fallidos: {failed}")
    print(f"Total Capítulos en la BD: {Chapter.objects.count()}")

if __name__ == '__main__':
    populate_all_chapters()
