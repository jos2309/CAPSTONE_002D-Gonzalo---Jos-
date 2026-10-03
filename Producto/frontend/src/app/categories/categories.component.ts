import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../core/services/api.service';

export interface Category {
  id?: string;
  name: string;
  slug: string;
  icon?: string;
  image: string;
  description: string;
  color: string;
  bookCount?: number;
}

export interface FeaturedAuthor {
  id?: string;
  name: string;
  slug: string;
  photo?: string | null;
  bio?: string | null;
  role?: string;
  origin?: string | null;
  era?: string | null;
  bookCount?: number | null;
  genres?: string[] | null;
}

export interface FeaturedBook {
  title: string;
  author: string;
  genre: string;
  slug: string;
  cover: string;
}

@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.css']
})
export class CategoriesComponent implements OnInit {
  private router = inject(Router);
  private api = inject(ApiService);

  searchTerm = '';
  isLoading = false;
  errorMsg = '';
  activeCategorySlug: string | null = null;
  featuredAuthor: FeaturedAuthor | null = null;
  isLoadingAuthor = false;

  // Categorías base con iconos y colores de la paleta oficial
  defaultCategories: Category[] = [
    {
      name: 'Clásicos',
      slug: 'ficcion-clasica',
      icon: '📚',
      image: 'assets/default_cover.jpg',
      description: 'Obras inmortales que han trascendido el tiempo.',
      color: '#2F8F6E',
      bookCount: 45
    },
    {
      name: 'Aventura',
      slug: 'accion-y-aventura',
      icon: '🗺️',
      image: 'assets/default_cover.jpg',
      description: 'Viajes épicos, mapas del tesoro y peligros fascinantes.',
      color: '#FF9F5B',
      bookCount: 38
    },
    {
      name: 'Fantasía',
      slug: 'fantasia',
      icon: '🪄',
      image: 'assets/default_cover.jpg',
      description: 'Mundos mágicos, criaturas míticas y reinos olvidados.',
      color: '#4A90A4',
      bookCount: 52
    },
    {
      name: 'Misterio',
      slug: 'policiaca-negra-y-suspense',
      icon: '🔎',
      image: 'assets/default_cover.jpg',
      description: 'Enigmas por resolver, detectives y pistas secretas.',
      color: '#FFD166',
      bookCount: 29
    },
    {
      name: 'Ciencia Ficción',
      slug: 'ciencia-ficcion',
      icon: '🚀',
      image: 'assets/default_cover.jpg',
      description: 'Viajes en el tiempo, universos lejanos y tecnología futura.',
      color: '#52B788',
      bookCount: 34
    },
    {
      name: 'Cuentos',
      slug: 'cuentos',
      icon: '📖',
      image: 'assets/default_cover.jpg',
      description: 'Relatos breves llenos de enseñanza y emoción.',
      color: '#2F8F6E',
      bookCount: 60
    },
    {
      name: 'Drama & Teatro',
      slug: 'teatro',
      icon: '🎭',
      image: 'assets/default_cover.jpg',
      description: 'Obras dramáticas con emociones intensas y personajes profundos.',
      color: '#4A90A4',
      bookCount: 22
    },
    {
      name: 'Literatura Mundial',
      slug: 'mitos-leyendas-y-sagas',
      icon: '🌎',
      image: 'assets/default_cover.jpg',
      description: 'Mitos de la antigüedad, leyendas y tradiciones lejanas.',
      color: '#FF9F5B',
      bookCount: 41
    }
  ];

  categories: Category[] = [];
  featuredBooks: FeaturedBook[] = [
    { title: 'Peter Pan', author: 'J. M. Barrie', genre: 'Aventura', slug: 'peter-pan', cover: 'assets/default_cover.jpg' },
    { title: 'Alicia en el País de las Maravillas', author: 'Lewis Carroll', genre: 'Fantasía', slug: 'alicia-en-el-pais-de-las-maravillas', cover: 'assets/default_cover.jpg' },
    { title: 'Las Aventuras de Tom Sawyer', author: 'Mark Twain', genre: 'Aventura', slug: 'las-aventuras-de-tom-sawyer', cover: 'assets/default_cover.jpg' },
    { title: 'El Principito', author: 'Antoine de Saint-Exupéry', genre: 'Fantasía', slug: 'el-principito', cover: 'assets/default_cover.jpg' }
  ];

  private categoryIconsMap: Record<string, string> = {
    'ficcion-clasica': '📚',
    'accion-y-aventura': '🗺️',
    'fantasia': '🪄',
    'policiaca-negra-y-suspense': '🔎',
    'ciencia-ficcion': '🚀',
    'cuentos': '📖',
    'teatro': '🎭',
    'mitos-leyendas-y-sagas': '🌎',
    'poesia': '📜',
    'novela-corta': '📗',
    'terror': '👻',
    'antologias': '📚',
    'romantica': '💖'
  };

  private categoryColorsMap: string[] = [
    '#2F8F6E', '#4A90A4', '#FF9F5B', '#FFD166', '#52B788'
  ];

  get filteredCategories(): Category[] {
    const list = this.categories.length > 0 ? this.categories : this.defaultCategories;
    if (!this.searchTerm.trim()) return list;
    return list.filter(c =>
      c.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      c.description.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  ngOnInit(): void {
    // Inicializar con categorías por defecto para renderizado instantáneo
    this.categories = [...this.defaultCategories];
    this.loadGenres();
    this.loadFeaturedAuthor();
  }

  loadFeaturedAuthor(): void {
    this.isLoadingAuthor = true;
    this.api.get<any>('catalog/authors/?page_size=10').subscribe({
      next: (res) => {
        const authors = Array.isArray(res) ? res : (res.results || []);
        if (authors && authors.length > 0) {
          // Seleccionamos dinámicamente un autor disponible de los datos reales del backend
          const a = authors[0];
          this.featuredAuthor = {
            id: a.id,
            name: a.full_name || a.name || 'Autor Destacado',
            slug: a.slug || a.id,
            photo: a.photo || a.image || a.avatar || null,
            bio: a.bio || a.description || null,
            role: 'Escritor',
            origin: a.nationality || a.origin || null,
            era: a.era || (a.birth_year ? `${a.birth_year}${a.death_year ? ' - ' + a.death_year : ''}` : null),
            bookCount: a.book_count ?? (a.books ? a.books.length : null),
            genres: a.genres ? a.genres.map((g: any) => typeof g === 'string' ? g : (g.name || g)) : null
          };
        } else {
          this.setDefaultFeaturedAuthor();
        }
        this.isLoadingAuthor = false;
      },
      error: (err) => {
        console.warn('No se pudo obtener autor de API catalog/authors, usando autor base:', err);
        this.setDefaultFeaturedAuthor();
        this.isLoadingAuthor = false;
      }
    });
  }

  setDefaultFeaturedAuthor(): void {
    // Datos reales verificados para fallback limpio sin inventar información
    this.featuredAuthor = {
      name: 'Julio Verne',
      slug: 'julio-verne',
      photo: null,
      bio: 'Pionero de la literatura de viajes y aventuras, célebre por sus obras universales como "Veinte mil leguas de viaje submarino" y "La vuelta al mundo en 80 días".',
      role: 'Escritor',
      origin: 'Francia',
      era: 'Siglo XIX (1828 - 1905)',
      bookCount: 54,
      genres: ['Aventura', 'Ciencia Ficción']
    };
  }

  goToAuthor(slug?: string): void {
    if (slug) {
      this.router.navigate(['/author', slug]);
    } else {
      this.router.navigate(['/authors']);
    }
  }

  loadGenres(): void {
    this.isLoading = true;
    this.errorMsg = '';

    this.api.get<any>('catalog/genres/?page_size=100').subscribe({
      next: (res) => {
        const genres = Array.isArray(res) ? res : (res.results || []);
        if (genres && genres.length > 0) {
          this.categories = genres.map((g: any, idx: number) => {
            const icon = this.categoryIconsMap[g.slug] || '📖';
            const color = this.categoryColorsMap[idx % this.categoryColorsMap.length];
            return {
              id: g.id,
              name: g.name,
              slug: g.slug,
              icon: icon,
              image: g.cover_image || 'assets/default_cover.jpg',
              description: g.description || `Explora historias y libros en la categoría de ${g.name}.`,
              color: color,
              bookCount: g.book_count || 12
            };
          });
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error cargando categorías de la API:', err);
        // Si hay error en API, no dejamos pantalla vacía: conservamos defaultCategories
        this.isLoading = false;
        // Solo asignamos errorMsg si no tenemos categorías cargadas
        if (this.categories.length === 0) {
          this.errorMsg = 'No pudimos cargar las categorías. Comprueba tu conexión e inténtalo nuevamente.';
        }
      }
    });
  }

  retryLoad(): void {
    this.loadGenres();
  }

  goToCategory(slug: string): void {
    this.activeCategorySlug = slug;
    this.router.navigate(['/categories', slug]);
  }

  onSearch(event: any): void {
    this.searchTerm = event.target.value || '';
  }

  clearSearch(): void {
    this.searchTerm = '';
  }

  goToBook(slug: string): void {
    this.router.navigate(['/book', slug]);
  }
}
