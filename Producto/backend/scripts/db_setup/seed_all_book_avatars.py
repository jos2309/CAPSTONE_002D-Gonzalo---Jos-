import os
import sys
import django

sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from catalog.models import Book, Edition
from ai_engine.models import AIAvatar

def seed_avatars_for_all_books():
    print("Iniciando Seeding Global de Personajes IA para el Catalogo...")
    
    books = Book.objects.all()
    created_count = 0
    updated_count = 0

    for book in books:
        editions = Edition.objects.filter(book=book)
        if not editions.exists():
            continue
            
        edition = editions.first()
        
        # Obtener el nombre del autor de la obra si existe
        authors = list(book.authors.all())
        author_name = authors[0].full_name if authors else "El Autor"
        
        # 1. Crear / Asegurar el Avatar del Autor
        author_avatar, created_a = AIAvatar.objects.get_or_create(
            edition=edition,
            is_author=True,
            defaults={
                'name': author_name,
                'description': f"Autor de '{book.title}'. Conoce todos los secretos de la trama y el contexto histórico de la obra.",
                'system_prompt': f"Eres {author_name}, el autor de la obra '{book.title}'. Respondes al lector con sabiduría, elocuencia y pasibilidad literaria. Conoces el destino de todos los personajes y los secretos narrativos de tu libro.",
                'temperature': 0.7,
                'model_name': 'gemini-2.0-flash',
                'unlock_at_chapter': 0,
                'is_major_character': True,
                'greeting_message': f"¡Saludos, estimado lector! Soy {author_name}, el creador de '{book.title}'. Es un honor acompañarte en esta lectura. ¿Qué preguntas tienes sobre mi obra?",
                'behavioral_context': "El autor reflexiona sobre su proceso creativo y comparte anécdotas del contexto en que escribió el libro.",
                'sample_dialogues': f"Escribí '{book.title}' inspirándome en la condición humana. Cada personaje refleja un aspecto del alma.",
                'kokoro_voice_id': 'af_bella'
            }
        )
        if created_a: created_count += 1
        
        # 2. Crear Personaje Principal (Capítulo 0) si no tiene personajes
        main_char_name = book.title.split()[0].capitalize() if book.title else "Protagonista"
        if main_char_name in ["El", "La", "Los", "Las", "Un", "Una", "De", "En"]:
            words = book.title.split()
            main_char_name = words[1].capitalize() if len(words) > 1 else "Personaje"

        main_avatar, created_m = AIAvatar.objects.get_or_create(
            edition=edition,
            name=f"Protagonista de {book.title}",
            defaults={
                'description': f"El personaje principal de '{book.title}'.",
                'system_prompt': f"Eres el protagonista principal de '{book.title}'. Te diriges al lector con inmersión total en primera persona, manteniendo la emoción y el tono dramático del libro.",
                'temperature': 0.75,
                'model_name': 'gemini-2.0-flash',
                'unlock_at_chapter': 0,
                'is_major_character': True,
                'is_author': False,
                'greeting_message': f"¡Hola! Soy el personaje principal de '{book.title}'. Qué alegría encontrarte en estas páginas. ¿Qué te gustaría preguntarme sobre nuestro viaje?",
                'behavioral_context': "Busca conectar emocionalmente con el lector mientras avanza por los capítulos.",
                'kokoro_voice_id': 'em_alex'
            }
        )
        if created_m: created_count += 1

        # 3. Personaje Secundario (Desbloquea en Capítulo 1)
        sec_avatar, created_s = AIAvatar.objects.get_or_create(
            edition=edition,
            name=f"Aliado de la Obra",
            defaults={
                'description': f"Personaje secundario que aparece a medida que avanzas en la lectura de '{book.title}'.",
                'system_prompt': f"Eres un personaje misterioso y clave en '{book.title}'. Revelas pistas de la historia al lector de manera intrigante.",
                'temperature': 0.80,
                'model_name': 'gemini-2.0-flash',
                'unlock_at_chapter': 1,
                'is_major_character': False,
                'is_author': False,
                'greeting_message': f"¡Ah! Veo que has avanzado en la lectura. Te estaba esperando.",
                'behavioral_context': "Solo se comunica con lectores que hayan avanzado al capítulo 1 o superior.",
                'kokoro_voice_id': 'af_nicole'
            }
        )
        if created_s: created_count += 1

    print(f"Seeding completado: {created_count} nuevos avatares creados para {books.count()} libros.")

if __name__ == "__main__":
    seed_avatars_for_all_books()
