import { Component, OnInit, Input, inject } from '@angular/core';
import { ApiService } from '../../core/services/api.service';
import { HttpParams } from '@angular/common/http';
import { Router } from '@angular/router';

export interface Book {
  id: string;
  title: string;
  slug: string;
  synopsis: string;
  is_featured: boolean;
  cover_image: string | null;
  created_at: string;
  genre_name?: string;
  chapters_count?: number;
  level_badge?: string;
  author_name?: string;
}

interface PaginatedResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Book[];
}

export interface CategoryPill {
  name: string;
  icon: string;
}

@Component({
  selector: 'app-book-list',
  templateUrl: './book-list.component.html',
  styleUrl: './book-list.component.css'
})
export class BookListComponent implements OnInit {
  private api = inject(ApiService);
  private router = inject(Router);

  @Input() isHome: boolean = false;

  books: Book[] = [];
  featuredAdventures: Book[] = [];
  isLoading = true;
  errorMsg = '';
  totalCount = 0;
  currentPage = 1;

  get totalPages(): number {
    const size = this.activeCategory || this.searchTerm ? 50 : 24;
    return Math.ceil(this.totalCount / size);
  }

  searchTerm = '';
  activeCategory: string | null = null;
  selectedOrdering: string = 'popularity';
  private searchTimeout: any;

  // Iconos para la plataforma de 7 a 14 años
  categoryIcons: Record<string, string> = {
    'Acción y aventura': '🗺️',
    'Ciencia ficción': '🚀',
    'Cuentos': '📖',
    'Fantasía': '✨',
    'Ficción clásica': '🏛️',
    'Ficción contemporánea': '📚',
    'Ficción histórica': '🏰',
    'Poesía': '📜',
    'Novela corta': '📗',
    'Mitos, leyendas y sagas': '🛡️',
    'Policíaca, negra y suspense': '🔍',
    'Teatro': '🎭',
    'Terror': '👻',
    'Antologías': '📚',
    'Romántica': '💖',
    'Sátira': '🎨',
    'Literatura de viaje': '⛵',
    'Biografías, diarios y hechos reales': '🖋️',
    'Ensayos': '🧠',
    'Filosofía': '🏛️',
    'Historia': '📜',
    'Psicología': '💡',
    'Sociedad y ciencias sociales': '🌍'
  };

  genreDbMap: Record<string, string> = {
    'Acción y aventura': 'Acción y aventura',
    'Ciencia ficción': 'Ciencia ficción',
    'Cuentos': 'Cuentos',
    'Fantasía': 'Fantasía',
    'Ficción clásica': 'Ficción clásica',
    'Ficción contemporánea': 'Ficción contemporánea',
    'Poesía': 'Poesía',
    'Romántica': 'Romántica',
    'Terror': 'Terror',
    'Antologías': 'Antologías',
    'Novela corta': 'Novela corta',
    'Teatro': 'Teatro',
    'Ficción histórica': 'Ficción histórica',
    'Ficción erótica': 'Ficción erótica',
    'Ficción religiosa y espiritual': 'Ficción religiosa y espiritual',
    'Mitos, leyendas y sagas': 'Mitos, leyendas y sagas',
    'Policíaca, negra y suspense': 'Policíaca, negra y suspense',
    'Sátira': 'Sátira',
    'Literatura de viaje': 'Literatura de viaje',
    'Filosofía': 'Filosofía',
    'Historia': 'Historia',
    'Psicología': 'Psicología',
    'Biografías, diarios y hechos reales': 'Biografías, Diarios Y Hechos Reales',
    'Ensayos': 'Ensayos',
    'Sociedad y ciencias sociales': 'Sociedad Y Ciencias Sociales',
  };

  categories = [
    { name: 'Literatura y ficción', sub: [
      'Acción y aventura', 'Antologías', 'Ciencia ficción', 'Cuentos', 'Fantasía',
      'Ficción clásica', 'Ficción contemporánea', 'Ficción histórica',
      'Mitos, leyendas y sagas', 'Novela corta', 'Poesía', 'Policíaca, negra y suspense',
      'Teatro', 'Terror'
    ]},
    { name: 'No ficción', sub: [
      'Biografías, diarios y hechos reales', 'Ensayos', 'Filosofía',
      'Historia', 'Psicología', 'Sociedad y ciencias sociales'
    ]}
  ];
  allSubcategories: CategoryPill[] = [];

  ngOnInit(): void {
    const rawSubs: string[] = [];
    this.categories.forEach(cat => rawSubs.push(...cat.sub));
    this.allSubcategories = rawSubs.map(subName => ({
      name: subName,
      icon: this.categoryIcons[subName] || '📖'
    }));

    this.fetchBooks();
  }

  fetchBooks(): void {
    this.isLoading = true;
    this.errorMsg = '';

    let params = new HttpParams();
    if (this.searchTerm) {
      params = params.set('search', this.searchTerm);
    }
    if (this.activeCategory) {
      const dbName = this.genreDbMap[this.activeCategory] || this.activeCategory;
      params = params.set('genres__name', dbName);
    }
    
    params = params.set('page_size', this.activeCategory || this.searchTerm ? '50' : '24');
    params = params.set('page', this.currentPage);

    if (this.selectedOrdering === 'popularity') {
      params = params.set('ordering', '-is_featured,-created_at');
    } else if (this.selectedOrdering === 'alphabetical') {
      params = params.set('ordering', 'title');
    } else if (this.selectedOrdering === 'recent') {
      params = params.set('ordering', '-created_at');
    } else if (!this.activeCategory && !this.searchTerm) {
      params = params.set('ordering', '?');
    }

    this.api.get<PaginatedResponse>('catalog/books/', params).subscribe({
      next: (response) => {
        this.books = (response.results || []).map((b, idx) => ({
          ...b,
          genre_name: this.activeCategory || 'Aventura',
          chapters_count: 8 + (idx % 7),
          level_badge: idx % 2 === 0 ? 'Nivel 1' : 'Nivel 2'
        }));
        this.totalCount = response.count || this.books.length;
        
        // Destacados para la sección de Aventuras
        this.featuredAdventures = this.books.filter(b => b.is_featured).slice(0, 4);
        if (this.featuredAdventures.length === 0) {
          this.featuredAdventures = this.books.slice(0, 4);
        }

        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al cargar libros:', err);
        this.errorMsg = 'No pudimos cargar la biblioteca. Por favor, revisa tu conexión.';
        this.isLoading = false;
      }
    });
  }

  onSearch(event: any): void {
    this.searchTerm = event.target.value;
    this.currentPage = 1;
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => this.fetchBooks(), 400);
  }

  setCategory(cat: string): void {
    this.activeCategory = this.activeCategory === cat ? null : cat;
    this.currentPage = 1;
    this.fetchBooks();
  }

  onOrderingChange(ordering: string): void {
    this.selectedOrdering = ordering;
    this.currentPage = 1;
    this.fetchBooks();
  }

  resetSearch(): void {
    this.searchTerm = '';
    this.activeCategory = null;
    this.currentPage = 1;
    this.fetchBooks();
  }

  retryFetch(): void {
    this.fetchBooks();
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.fetchBooks();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  goToBook(slug: string): void {
    this.router.navigate(['/book', slug]);
  }
}
