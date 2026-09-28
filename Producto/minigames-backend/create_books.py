import uuid
from catalog.models import Book

# Namespace para generar UUIDs v5 deterministas basados en el título
NAMESPACE_BOOKS = uuid.UUID('6ba7b810-9dad-11d1-80b4-00c04fd430c8')

demo_books = [
    {"title": "El patito feo", "author": "H. C. Andersen"},
    {"title": "Pulgarcito", "author": "C. Perrault"},
    {"title": "Barba Azul", "author": "C. Perrault"},
    {"title": "Los zapatos rojos", "author": "H. C. Andersen"},
    {"title": "Blancanieves", "author": "Hnos. Grimm"},
    {"title": "La Cenicienta", "author": "Hnos. Grimm"},
    {"title": "Hansel y Gretel", "author": "Hnos. Grimm"},
    {"title": "La Bella Durmiente", "author": "Hnos. Grimm / C. Perrault"},
    {"title": "El gato con botas", "author": "C. Perrault / Hnos. Grimm"},
    {"title": "El traje nuevo del emperador", "author": "H. C. Andersen"},
    {"title": "El soldadito de plomo", "author": "H. C. Andersen"},
    {"title": "Rapunzel", "author": "Hnos. Grimm"},
    {"title": "El gigante egoísta", "author": "O. Wilde"},
    {"title": "El ruiseñor y la rosa", "author": "O. Wilde"},
    {"title": "Rumpelstiltskin", "author": "Hnos. Grimm"},
    {"title": "Los tres cerditos", "author": "J. Jacobs"},
    {"title": "Ricitos de oro y los tres osos", "author": "W. W. Denslow"},
    {"title": "Caperucita Roja", "author": "C. Perrault"},
    {"title": "La princesa y el guisante", "author": "H. C. Andersen"},
]

print("=== POBLANDO CATÁLOGO DEMO CON UUIDs FIJOS ===")

for item in demo_books:
    title = item["title"]
    book_uuid = uuid.uuid5(NAMESPACE_BOOKS, title)
    
    # Crea o recupera el libro únicamente con campos estándar
    book, created = Book.objects.get_or_create(
        id=book_uuid,
        defaults={
            "title": title,
            "synopsis": f"Cuento infantil clásico de {item['author']}."
        }
    )
    
    status = "CREADO" if created else "EXISTENTE"
    print(f"[{status}] UUID: {book.id} | Título: {book.title}")

print("\n✓ Catálogo cargado con éxito.")