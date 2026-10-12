import os
import sys
import json
import re
from pathlib import Path

# Añadir el directorio raíz al PATH para encontrar 'config'
backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, backend_dir)

# Configurar entorno Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
import django
django.setup()

from catalog.models import Book, Author
from django.utils.text import slugify

def normalize(text):
    if not text:
        return ""
    text = text.lower()
    text = re.sub(r'[áàäâ]', 'a', text)
    text = re.sub(r'[éèëê]', 'e', text)
    text = re.sub(r'[íìïî]', 'i', text)
    text = re.sub(r'[óòöô]', 'o', text)
    text = re.sub(r'[úùüû]', 'u', text)
    text = re.sub(r'[ñ]', 'n', text)
    text = re.sub(r'[^a-z0-9\s]', '', text)
    return text.strip()

def find_file(filename):
    possible_paths = [
        Path(filename),
        Path(backend_dir) / filename,
        Path(__file__).parent / filename,
    ]
    for p in possible_paths:
        if p.exists():
            return p
    return None

def inject_synopses():
    synopses_file = find_file("synopses_backup.json")
    if not synopses_file:
        print("[!] No se encontró el archivo synopses_backup.json")
        return 0

    with open(synopses_file, 'r', encoding='utf-8') as f:
        try:
            synopses_data = json.load(f)
        except json.JSONDecodeError:
            print("[ERROR] Error leyendo synopses_backup.json")
            return 0

    books = list(Book.objects.all().prefetch_related('authors'))
    book_by_id = {str(b.id): b for b in books}
    book_by_slug = {b.slug: b for b in books if b.slug}
    book_by_title_lower = {b.title.strip().lower(): b for b in books}
    
    book_by_norm_title = {}
    for b in books:
        nt = normalize(b.title)
        if nt:
            if nt not in book_by_norm_title:
                book_by_norm_title[nt] = []
            book_by_norm_title[nt].append(b)

    book_title_slug = {}
    for b in books:
        ts = slugify(b.title)
        if ts:
            if ts not in book_title_slug:
                book_title_slug[ts] = []
            book_title_slug[ts].append(b)

    authors = list(Author.objects.all().prefetch_related('books'))
    author_by_norm_name = {normalize(a.full_name): a for a in authors if normalize(a.full_name)}

    count = 0
    updated_book_ids = set()
    print(f"[>] Inyectando y asociando {len(synopses_data)} sinopsis...")

    for key, synopsis in synopses_data.items():
        if not synopsis or not isinstance(synopsis, str):
            continue
            
        book = None

        # Tier 1: Coincidencia directa por ID, Slug, Título exacto/normalizado
        if key in book_by_id:
            book = book_by_id[key]
        elif key in book_by_slug:
            book = book_by_slug[key]
        elif key.strip().lower() in book_by_title_lower:
            book = book_by_title_lower[key.strip().lower()]
        elif slugify(key) in book_title_slug:
            book = book_title_slug[slugify(key)][0]
        elif normalize(key) in book_by_norm_title:
            book = book_by_norm_title[normalize(key)][0]

        # Tier 2: Extracción de título entre comillas en la sinopsis
        if not book:
            quoted = re.findall(r"['\"‘“«]([^'\"’”»]{2,100})['\"’”»]", synopsis[:300])
            for q in quoted:
                nq = normalize(q)
                sq = slugify(q)
                if nq in book_by_norm_title:
                    book = book_by_norm_title[nq][0]
                    break
                elif sq in book_title_slug:
                    book = book_title_slug[sq][0]
                    break

        # Tier 3: Coincidencia del título en la primera oración del texto
        if not book:
            norm_syn = normalize(synopsis)
            syn_first_sent = norm_syn.split('.')[0]
            for b in sorted(books, key=lambda x: len(x.title), reverse=True):
                tb_norm = normalize(b.title)
                if len(tb_norm) >= 4:
                    if tb_norm in syn_first_sent or f" {tb_norm} " in f" {norm_syn} ":
                        b_authors = [normalize(a.full_name) for a in b.authors.all()]
                        if any(fa in norm_syn for fa in b_authors) or len(tb_norm) >= 10:
                            book = b
                            break

        # Tier 4: Autor detectado en texto + libro perteneciente a ese autor
        if not book:
            norm_syn = normalize(synopsis)
            detected_author = None
            for norm_aname, a_obj in sorted(author_by_norm_name.items(), key=lambda x: len(x[0]), reverse=True):
                if len(norm_aname) >= 5 and norm_aname in norm_syn:
                    detected_author = a_obj
                    break
            if detected_author:
                for ab in detected_author.books.all():
                    ab_norm = normalize(ab.title)
                    if len(ab_norm) >= 3 and (ab_norm in norm_syn or slugify(ab.title) in norm_syn):
                        book = ab
                        break

        if book and book.id not in updated_book_ids:
            try:
                book.synopsis = synopsis
                book.save(update_fields=['synopsis'])
                updated_book_ids.add(book.id)
                count += 1
            except Exception as e:
                print(f"  [!] Error actualizando libro '{book.title}': {e}")

    return count

def inject_biographies():
    bio_file = find_file("biographies_backup.json")
    if not bio_file:
        print("[!] No se encontró el archivo biographies_backup.json")
        return 0

    with open(bio_file, 'r', encoding='utf-8') as f:
        try:
            bio_data = json.load(f)
        except json.JSONDecodeError:
            print("[ERROR] Error leyendo biographies_backup.json")
            return 0

    authors = list(Author.objects.all())
    author_by_id = {str(a.id): a for a in authors}
    author_by_slug = {a.slug: a for a in authors if a.slug}
    author_by_name = {a.full_name.strip().lower(): a for a in authors}
    author_by_norm_name = {normalize(a.full_name): a for a in authors if normalize(a.full_name)}

    count = 0
    updated_author_ids = set()
    print(f"[>] Inyectando y asociando {len(bio_data)} biografías...")

    for key, bio in bio_data.items():
        if not bio or not isinstance(bio, str):
            continue

        author = None

        # Tier 1: ID, Slug, Nombre exacto/normalizado
        if key in author_by_id:
            author = author_by_id[key]
        elif key in author_by_slug:
            author = author_by_slug[key]
        elif slugify(key) in author_by_slug:
            author = author_by_slug[slugify(key)]
        elif key.strip().lower() in author_by_name:
            author = author_by_name[key.strip().lower()]
        elif normalize(key) in author_by_norm_name:
            author = author_by_norm_name[normalize(key)]

        # Tier 2: Nombre extraído del texto de la biografía
        if not author:
            first_line = bio.split('.')[0]
            name_part = re.split(r'\s*\([^)]*\)|\s*,|\s+fue\s+|\s+es\s+|\s+seudonimo\s+', first_line)[0].strip()
            norm_np = normalize(name_part)
            if norm_np in author_by_norm_name:
                author = author_by_norm_name[norm_np]
            else:
                norm_bio = normalize(bio[:150])
                for norm_n, a_obj in sorted(author_by_norm_name.items(), key=lambda x: len(x[0]), reverse=True):
                    if len(norm_n) >= 4 and (norm_bio.startswith(norm_n) or f" {norm_n} " in f" {norm_bio} "):
                        author = a_obj
                        break

        if author and author.id not in updated_author_ids:
            try:
                author.bio = bio
                author.save(update_fields=['bio'])
                updated_author_ids.add(author.id)
                count += 1
            except Exception as e:
                print(f"  [!] Error actualizando autor '{author.full_name}': {e}")

    return count

def main():
    print("--- INICIANDO INYECCIÓN Y ASOCIACIÓN DINÁMICA DE DATOS DE IA ---")
    
    synopses_injected = inject_synopses()
    print(f"[OK] Se inyectaron y actualizaron {synopses_injected} sinopsis de libros en la base de datos.\n")
    
    bios_injected = inject_biographies()
    print(f"[OK] Se inyectaron y actualizaron {bios_injected} biografías de autores en la base de datos.\n")
    
    print("---------------------------------------------------------------")
    print(f"RESUMEN FINAL DE REGISTROS ENRIQUECIDOS:")
    print(f" - Libros actualizados con sinopsis: {synopses_injected}")
    print(f" - Autores actualizados con biografía: {bios_injected}")
    print("[OK] ¡Inyección completada exitosamente!")

if __name__ == "__main__":
    main()
