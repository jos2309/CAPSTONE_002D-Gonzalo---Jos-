"""
scripts/populate_books.py
-------------------------
Script de importación masiva para popular el catálogo de libros en Literatus Novelist.
Escanea de forma altamente eficiente la carpeta media/books/, detecta archivos .epub y cover.jpg/png,
extrae los metadatos (título, autor) e inserta los registros correspondientes en los modelos
Book, Author, BookAuthor y Edition.
"""

import os
import sys
import re
import zipfile
from pathlib import Path
from decimal import Decimal

# Configurar encoding utf-8 para la salida estándar en Windows
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

# Añadir el directorio raíz del backend al sys.path para cargar Django
BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.append(str(BASE_DIR))

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
import django
django.setup()

from django.db import transaction
from django.utils.text import slugify
from catalog.models import Book, Author, BookAuthor, Edition


def get_metadata_from_epub(epub_path):
    """
    Lee los metadatos de título y autor directamente desde la estructura OPF del EPUB (zip).
    """
    try:
        with zipfile.ZipFile(epub_path, 'r') as z:
            # Buscar el container.xml para obtener la ruta del archivo OPF
            if 'META-INF/container.xml' not in z.namelist():
                return None, None
            container = z.read('META-INF/container.xml').decode('utf-8', errors='ignore')
            opf_match = re.search(r'full-path=["\']([^"\']+)["\']', container, re.IGNORECASE)
            if not opf_match:
                return None, None
            
            opf_path = opf_match.group(1)
            if opf_path not in z.namelist():
                return None, None
                
            opf_content = z.read(opf_path).decode('utf-8', errors='ignore')
            
            title_match = re.search(r'<dc:title[^>]*>(.*?)</dc:title>', opf_content, re.DOTALL | re.IGNORECASE)
            creator_match = re.search(r'<dc:creator[^>]*>(.*?)</dc:creator>', opf_content, re.DOTALL | re.IGNORECASE)
            
            title = re.sub(r'<[^>]+>', '', title_match.group(1)).strip() if title_match else None
            creator = re.sub(r'<[^>]+>', '', creator_match.group(1)).strip() if creator_match else None
            
            # Limpieza básica de espacios sobrantes y HTML entidades simples
            if title:
                title = title.replace('&amp;', '&').replace('&quot;', '"').replace('&lt;', '<').replace('&gt;', '>')
            if creator:
                creator = creator.replace('&amp;', '&').replace('&quot;', '"').replace('&lt;', '<').replace('&gt;', '>')
                
            return title, creator
    except Exception:
        return None, None


def slugify_author(name):
    slug = slugify(name)
    return slug[:250] if slug else 'autor-desconocido'


def run_import():
    books_dir = BASE_DIR / 'media' / 'books'
    if not books_dir.exists():
        print(f"Error: El directorio {books_dir} no existe.")
        return

    folders = [f for f in books_dir.iterdir() if f.is_dir()]
    total_folders = len(folders)
    print(f"Iniciando procesamiento de {total_folders} carpetas en {books_dir}...\n")

    created_books_count = 0
    updated_books_count = 0
    authors_created_count = 0
    editions_created_count = 0

    batch_size = 100

    for i, folder in enumerate(folders, 1):
        folder_slug = folder.name[:500]
        
        # Buscar .epub
        epub_files = list(folder.glob("*.epub"))
        epub_path = epub_files[0] if epub_files else None
        
        # Buscar portada (cover.jpg, cover.png, o cualquier imagen)
        cover_files = list(folder.glob("cover.jpg")) or list(folder.glob("cover.jpeg")) or list(folder.glob("cover.png")) or list(folder.glob("*.jpg")) or list(folder.glob("*.png"))
        cover_path = cover_files[0] if cover_files else None

        title, author_name = None, None
        if epub_path:
            title, author_name = get_metadata_from_epub(epub_path)

        # Fallbacks si los metadatos no estaban en el OPF
        if not title:
            title = folder.name.replace('-', ' ').title()
        if not author_name:
            author_name = "Autor Desconocido"

        # Truncar cadenas si exceden límites del modelo
        title = title[:255]
        author_name = author_name[:255]

        with transaction.atomic():
            # 1. Obtener o crear Autor
            author_slug = slugify_author(author_name)
            author, author_created = Author.objects.get_or_create(
                slug=author_slug,
                defaults={'full_name': author_name}
            )
            if author_created:
                authors_created_count += 1

            # 2. Ruta relativa para la imagen de portada si existe
            cover_rel_path = f"books/{folder.name}/{cover_path.name}" if cover_path else ""

            # 3. Obtener o crear Libro
            book, book_created = Book.objects.get_or_create(
                slug=folder_slug,
                defaults={
                    'title': title,
                    'status': Book.StatusChoices.PUBLISHED,
                    'is_published': True,
                    'cover_image': cover_rel_path
                }
            )

            # Si el libro ya existía pero no tenía portada, actualizarla
            if not book_created:
                updated_books_count += 1
                if cover_rel_path and not book.cover_image:
                    book.cover_image = cover_rel_path
                    book.save(update_fields=['cover_image'])
            else:
                created_books_count += 1

            # 4. Vincular Autor con Libro
            BookAuthor.objects.get_or_create(
                book=book,
                author=author,
                defaults={'role': BookAuthor.RoleChoices.PRIMARY}
            )

            # 5. Crear Edición EPUB si existe archivo físico
            if epub_path:
                epub_rel_path = f"books/{folder.name}/{epub_path.name}"
                edition, ed_created = Edition.objects.get_or_create(
                    book=book,
                    format=Edition.FormatChoices.EPUB,
                    defaults={
                        'file': epub_rel_path,
                        'price': Decimal('0.00'),
                        'language': 'es'
                    }
                )
                if ed_created:
                    editions_created_count += 1

        if i % batch_size == 0 or i == total_folders:
            print(f"  [+] Procesados [{i}/{total_folders}] libros...")

    final_book_count = Book.objects.count()
    final_author_count = Author.objects.count()
    final_edition_count = Edition.objects.count()

    print("\n" + "="*50)
    print("RESUMEN FINAL DE LA IMPORTACION MASIVA")
    print("="*50)
    print(f"Libros creados nuevos: {created_books_count}")
    print(f"Libros actualizados/existentes: {updated_books_count}")
    print(f"Autores creados: {authors_created_count}")
    print(f"Ediciones creadas: {editions_created_count}")
    print("-"*50)
    print(f"Total de Libros en Base de Datos: {final_book_count}")
    print(f"Total de Autores en Base de Datos: {final_author_count}")
    print(f"Total de Ediciones en Base de Datos: {final_edition_count}")
    print("="*50)


if __name__ == '__main__':
    run_import()
