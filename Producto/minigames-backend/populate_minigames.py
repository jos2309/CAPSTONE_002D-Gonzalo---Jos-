import os
import django
import uuid

# Configurar el entorno de Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

# Importar modelos exactos del backend
from catalog.models import Book
from games.models import BookMinigame, Minigame

NAMESPACE_BOOKS = uuid.UUID('6ba7b810-9dad-11d1-80b4-00c04fd430c8')

minigames_dataset = {
    "Caperucita Roja": {
        "rafaga_vf": [
            {
                "passage_text": "Caperucita Roja caminaba por el bosque para llevarle una cesta con comida a su abuelita enferma. En el camino, se encontró con el lobo feroz, quien le sugirió tomar el camino más largo.",
                "time_per_statement": 3,
                "statements": [
                    { "text": "Caperucita llevaba comida a su abuelita.", "isTrue": True },
                    { "text": "Caperucita se encontró con un oso en el bosque.", "isTrue": False },
                    { "text": "El lobo le sugirió tomar el camino más corto.", "isTrue": False }
                ]
            },
            {
                "passage_text": "El lobo llegó primero a la casa de la abuela, se vistió con su ropa y se metió en la cama esperando a Caperucita.",
                "time_per_statement": 3,
                "statements": [
                    { "text": "El lobo llegó a la casa antes que Caperucita.", "isTrue": True },
                    { "text": "El lobo se escondió debajo de la mesa.", "isTrue": False },
                    { "text": "El lobo usó la ropa de la abuela.", "isTrue": True }
                ]
            }
        ],
        "emoticono_dialogo": [
            {
                "emotionImage": "assets/images/emoticono/lobo_sorprendido.png",
                "dialogues": [
                    { "text": "¡Qué dientes tan grandes tienes!", "isCorrect": True },
                    { "text": "¡Qué flores tan bonitas llevas!", "isCorrect": False },
                    { "text": "¡Hola abuelita, vine a cantar!", "isCorrect": False },
                    { "text": "¡Me gusta mucho tu sombrero!", "isCorrect": False }
                ]
            },
            {
                "emotionImage": "assets/images/emoticono/caperucita_feliz.png",
                "dialogues": [
                    { "text": "¡Te traje unas galletas, abuelita!", "isCorrect": True },
                    { "text": "¡Tengo mucho miedo del lobo!", "isCorrect": False },
                    { "text": "¡Me he perdido en el bosque!", "isCorrect": False },
                    { "text": "¡Prefiero comer pastel de manzana!", "isCorrect": False }
                ]
            }
        ],
        "imagen_pixelada": [
            {
                "total_time": 7,
                "challenges": [
                    {
                        "correctCharacter": "Lobo Feroz",
                        "imageSrc": "assets/images/pixelado/lobo_disfrazado.png",
                        "options": ["El Cazador", "Lobo Feroz", "La Abuelita", "Caperucita", "El Leñador"]
                    }
                ]
            },
            {
                "total_time": 7,
                "challenges": [
                    {
                        "correctCharacter": "El Cazador",
                        "imageSrc": "assets/images/pixelado/cazador_bosque.png",
                        "options": ["El Leñador", "El Cazador", "El Lobo", "El Padre", "El Guardabosques"]
                    }
                ]
            }
        ]
    },
    "Los tres cerditos": {
        "rafaga_vf": [
            {
                "passage_text": "El primer cerdito construyó su casa de paja rápidamente para irse a jugar, mientras que el hermano mayor trabajó duro en su casa de ladrillos.",
                "time_per_statement": 3,
                "statements": [
                    { "text": "El primer cerdito hizo su casa de madera.", "isTrue": False },
                    { "text": "El hermano mayor usó ladrillos.", "isTrue": True },
                    { "text": "La casa de paja se construyó muy rápido.", "isTrue": True }
                ]
            },
            {
                "passage_text": "El lobo sopló y sopló hasta derrumbar las casas de paja y madera, pero la casa de ladrillo resistió sin moverse.",
                "time_per_statement": 3,
                "statements": [
                    { "text": "El lobo derribó la casa de ladrillo.", "isTrue": False },
                    { "text": "La casa de madera se cayó con el soplido.", "isTrue": True },
                    { "text": "El lobo usó un martillo para romper las casas.", "isTrue": False }
                ]
            }
        ],
        "emoticono_dialogo": [
            {
                "emotionImage": "assets/images/emoticono/lobo_furioso.png",
                "dialogues": [
                    { "text": "¡Soplaré y soplaré y tu casa derribaré!", "isCorrect": True },
                    { "text": "¡Por favor, déjame entrar a tomar té!", "isCorrect": False },
                    { "text": "¡Construyeron una linda casa!", "isCorrect": False },
                    { "text": "¡Vengo a entregarles una carta!", "isCorrect": False }
                ]
            },
            {
                "emotionImage": "assets/images/emoticono/cerdito_aliviado.png",
                "dialogues": [
                    { "text": "¡Aquí dentro el lobo no podrá hacernos nada!", "isCorrect": True },
                    { "text": "¡Tengo que construir otra casa de paja!", "isCorrect": False },
                    { "text": "¡El lobo es nuestro nuevo amigo!", "isCorrect": False },
                    { "text": "¡Salgamos a jugar al jardín!", "isCorrect": False }
                ]
            }
        ],
        "imagen_pixelada": [
            {
                "total_time": 7,
                "challenges": [
                    {
                        "correctCharacter": "Casa de Ladrillo",
                        "imageSrc": "assets/images/pixelado/casa_ladrillo.png",
                        "options": ["Casa de Paja", "Casa de Madera", "Casa de Ladrillo", "Castillo", "Cabaña de Piedra"]
                    }
                ]
            },
            {
                "total_time": 7,
                "challenges": [
                    {
                        "correctCharacter": "Cerdito Mayor",
                        "imageSrc": "assets/images/pixelado/cerdito_trabajador.png",
                        "options": ["Cerdito Menor", "Cerdito Mediano", "Cerdito Mayor", "Lobo", "Oso Constructor"]
                    }
                ]
            }
        ]
    },
    "El gato con botas": {
        "rafaga_vf": [
            {
                "passage_text": "Un joven molinero heredó solo un gato, pero el animal le prometió que si le daba un par de botas y un saco, lo haría muy rico.",
                "time_per_statement": 3,
                "statements": [
                    { "text": "El joven heredó un gran castillo.", "isTrue": False },
                    { "text": "El gato pidió unas botas y un saco.", "isTrue": True },
                    { "text": "El gato prometió ayudar a su dueño.", "isTrue": True }
                ]
            },
            {
                "passage_text": "El gato engañó al malvado ogro pidiéndole que se convirtiera en un pequeño ratón, momento en el cual se lo comió para quedarse con su castillo.",
                "time_per_statement": 3,
                "statements": [
                    { "text": "El ogro se convirtió en un gran león primero.", "isTrue": True },
                    { "text": "El gato se hizo amigo del ogro.", "isTrue": False },
                    { "text": "El gato se comió al ogro transformado en ratón.", "isTrue": True }
                ]
            }
        ],
        "emoticono_dialogo": [
            {
                "emotionImage": "assets/images/emoticono/gato_gritando.png",
                "dialogues": [
                    { "text": "¡Socorro! ¡El Marqués de Carabás se está ahogando en el río!", "isCorrect": True },
                    { "text": "¡Miren qué pez tan grande he atrapado para cenar!", "isCorrect": False },
                    { "text": "¡Hola Rey, venimos a cantar una hermosa canción!", "isCorrect": False },
                    { "text": "¡Tengo mucho frío, necesito que me presten ropa!", "isCorrect": False }
                ]
            },
            {
                "emotionImage": "assets/images/emoticono/ogro_fiero.png",
                "dialogues": [
                    { "text": "¡Puedo transformarme en un feroz y enorme león!", "isCorrect": True },
                    { "text": "¡Soy un pequeño ratoncito que busca queso!", "isCorrect": False },
                    { "text": "¡Bienvenidos a mi fiesta en el gran castillo!", "isCorrect": False },
                    { "text": "¡Me da mucho miedo la magia y los trucos!", "isCorrect": False }
                ]
            }
        ],
        "imagen_pixelada": [
            {
                "total_time": 7,
                "challenges": [
                    {
                        "correctCharacter": "El Gato con Botas",
                        "imageSrc": "assets/images/pixelado/gato_con_botas.png",
                        "options": ["El Marqués de Carabás", "El Gato con Botas", "El Rey", "El Ogro", "El Molinero"]
                    }
                ]
            },
            {
                "total_time": 7,
                "challenges": [
                    {
                        "correctCharacter": "Castillo del Ogro",
                        "imageSrc": "assets/images/pixelado/castillo_ogro.png",
                        "options": ["Casa del Molino", "Palacio Real", "Castillo del Ogro", "Choza del Bosque", "Cueva Misteriosa"]
                    }
                ]
            }
        ]
    },
    "Hansel y Gretel": {
        "rafaga_vf": [
            {
                "passage_text": "Hansel lanzó migas de pan al suelo para recordar el camino de regreso a casa, pero los pájaros del bosque se las comieron todas.",
                "time_per_statement": 3,
                "statements": [
                    { "text": "Hansel usó piedras blancas la primera vez.", "isTrue": True },
                    { "text": "Los pájaros se comieron las migas de pan.", "isTrue": True },
                    { "text": "Los niños encontraron el camino fácilmente.", "isTrue": False }
                ]
            },
            {
                "passage_text": "En medio del bosque encontraron una casita hecha de caramelos y chocolates. La anciana que vivía allí era en realidad una bruja malvada.",
                "time_per_statement": 3,
                "statements": [
                    { "text": "La casa estaba hecha de madera vieja.", "isTrue": False },
                    { "text": "Una amable abuelita vivía en la casa.", "isTrue": False },
                    { "text": "La casa estaba cubierta de dulces.", "isTrue": True }
                ]
            }
        ],
        "emoticono_dialogo": [
            {
                "emotionImage": "assets/images/emoticono/bruja_malvada.png",
                "dialogues": [
                    { "text": "¡Niños, entren a comer unos dulces!", "isCorrect": True },
                    { "text": "¡Sálvenme de este bosque oscuro!", "isCorrect": False },
                    { "text": "¡No toquen mi casa de madera!", "isCorrect": False },
                    { "text": "¡Voy a regalarles mi varita mágica!", "isCorrect": False }
                ]
            },
            {
                "emotionImage": "assets/images/emoticono/gretel_valiente.png",
                "dialogues": [
                    { "text": "¡No sé cómo mirar dentro del horno, enséñame cómo entra una persona!", "isCorrect": True },
                    { "text": "¡Bruja, voy a prepararte una sopa deliciosa!", "isCorrect": False },
                    { "text": "¡Déjame salir corriendo a buscar ayuda al bosque!", "isCorrect": False },
                    { "text": "¡Quiero encender el fuego para cocinar pan!", "isCorrect": False }
                ]
            }
        ],
        "imagen_pixelada": [
            {
                "total_time": 7,
                "challenges": [
                    {
                        "correctCharacter": "Casa de Dulces",
                        "imageSrc": "assets/images/pixelado/casa_dulces.png",
                        "options": ["Castillo Real", "Casa de Dulces", "Cabaña de Madera", "Cueva", "Torre de Piedra"]
                    }
                ]
            },
            {
                "total_time": 7,
                "challenges": [
                    {
                        "correctCharacter": "Hansel",
                        "imageSrc": "assets/images/pixelado/hansel_encerrado.png",
                        "options": ["Gretel", "Hansel", "El Padre", "El Leñador", "El Guardián"]
                    }
                ]
            }
        ]
    },
    "El patito feo": {
        "rafaga_vf": [
            {
                "passage_text": "Un pequeño pajarito nació en un nido de patos. Era más grande y de color diferente a sus hermanos, por lo que todos en la granja se burlaban de él.",
                "time_per_statement": 3,
                "statements": [
                    { "text": "El patito era idéntico a sus hermanos.", "isTrue": False },
                    { "text": "Los animales de la granja eran amables con él.", "isTrue": False },
                    { "text": "El patito decidió irse de la granja.", "isTrue": True }
                ]
            },
            {
                "passage_text": "Pasó el frío invierno y al llegar la primavera, el patito se miró en el reflejo del agua y descubrió que se había transformado en un hermoso cisne blanco.",
                "time_per_statement": 3,
                "statements": [
                    { "text": "El patito se convirtió en un gran ganso.", "isTrue": False },
                    { "text": "Se dio cuenta de su cambio al verse en el agua.", "isTrue": True },
                    { "text": "Se transformó en un hermoso cisne blanco.", "isTrue": True }
                ]
            }
        ],
        "emoticono_dialogo": [
            {
                "emotionImage": "assets/images/emoticono/patito_triste.png",
                "dialogues": [
                    { "text": "Nadie quiere jugar conmigo por ser diferente...", "isCorrect": True },
                    { "text": "¡Soy el pato más rápido del estanque!", "isCorrect": False },
                    { "text": "¡Qué bonita es mi granja!", "isCorrect": False },
                    { "text": "¡Me encanta nadar con mis hermanos!", "isCorrect": False }
                ]
            },
            {
                "emotionImage": "assets/images/emoticono/cisne_majestuoso.png",
                "dialogues": [
                    { "text": "¡No soy un pato feo, soy un cisne!", "isCorrect": True },
                    { "text": "¡Extraño ser un pequeño patito gris!", "isCorrect": False },
                    { "text": "¡Nunca aprenderé a volar!", "isCorrect": False },
                    { "text": "¡Quiero regresar a la granja de pollos!", "isCorrect": False }
                ]
            }
        ],
        "imagen_pixelada": [
            {
                "total_time": 7,
                "challenges": [
                    {
                        "correctCharacter": "Patito Feo",
                        "imageSrc": "assets/images/pixelado/patito_nacimiento.png",
                        "options": ["Mamá Pata", "Patito Feo", "Pollito", "Cisne", "Pavo Real"]
                    }
                ]
            },
            {
                "total_time": 7,
                "challenges": [
                    {
                        "correctCharacter": "Granja de Animales",
                        "imageSrc": "assets/images/pixelado/granja_animales.png",
                        "options": ["Bosque Nevado", "Granja de Animales", "Lago Congelado", "Nido de Pájaros", "Molino de Viento"]
                    }
                ]
            }
        ]
    }
}

def run():
    print("=== POBLANDO MINIJUEGOS EN LA BASE DE DATOS ===")
    created_count = 0

    for book_title, game_types in minigames_dataset.items():
        try:
            # Buscar el libro en la BD directamente por su título (ignorando mayúsculas/minúsculas)
            book = Book.objects.get(title__iexact=book_title)
            print(f"✓ Libro encontrado en BD: '{book.title}' con ID real: {book.id}")
        except Book.DoesNotExist:
            print(f"[ERROR] El libro '{book_title}' no existe en la tabla catalog_book de la BD.")
            continue

        for game_code, samples in game_types.items():
            minigame, _ = Minigame.objects.get_or_create(
                code=game_code,
                defaults={
                    "name": game_code.replace('_', ' ').title(),
                    "description": f"Minijuego tipo {game_code}"
                }
            )

            for idx, sample_data in enumerate(samples, start=1):
                # Usar get_or_create o update_or_create para vincular el libro real
                game, created = BookMinigame.objects.get_or_create(
                    book=book,
                    minigame=minigame,
                    config_data=sample_data,
                    defaults={
                        "title": f"Desafío {minigame.name} #{idx}"
                    }
                )
                if created:
                    created_count += 1

    print(f"\n✓ Proceso finalizado. Se crearon {created_count} nuevos registros.")

if __name__ == "__main__":
    run()