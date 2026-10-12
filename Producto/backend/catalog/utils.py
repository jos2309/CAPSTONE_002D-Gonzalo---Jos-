"""
catalog/utils.py — Utilidades para extracción y gestión de capítulos desde EPUB.
"""
import os
import logging
from catalog.models import Chapter

logger = logging.getLogger(__name__)

def get_or_extract_chapters(book):
    """
    Obtiene los capítulos de un libro desde la base de datos.
    Si no existen registros en la BD pero la edición posee un archivo EPUB en disco,
    extrae dinámicamente los capítulos, los almacena en `catalog_chapter` y los retorna.
    """
    chapters = book.chapters.all().order_by('order').prefetch_related('audios')
    if chapters.exists():
        return list(chapters)

    # Intentar extracción física desde el archivo EPUB
    edition = book.editions.filter(file__isnull=False).exclude(file='').first()
    if edition and edition.file:
        try:
            epub_path = edition.file.path
            if os.path.exists(epub_path):
                from scripts.fix_broken_books import extract_chapters_from_spine
                chaps_data = extract_chapters_from_spine(epub_path, book.slug)
                if chaps_data:
                    created_chapters = Chapter.objects.bulk_create([
                        Chapter(book=book, title=c['title'], content_html=c['content_html'], order=c['order'])
                        for c in chaps_data
                    ])
                    return list(book.chapters.all().order_by('order').prefetch_related('audios'))
        except Exception as e:
            logger.warning(f"No se pudo extraer capítulos dinámicamente para {book.slug}: {e}")

    return []
