import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { ChatService } from '../../core/services/chat.service';
import { Router } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';

export interface CategoryOption {
  name: string;
  slug: string;
  icon: string;
}

@Component({
  selector: 'app-character-hub',
  templateUrl: './character-hub.component.html',
  styleUrls: ['./character-hub.component.css']
})
export class CharacterHubComponent implements OnInit, OnDestroy {
  chatService = inject(ChatService);
  api = inject(ApiService);
  router = inject(Router);
  auth = inject(AuthService);

  // Datos para las secciones
  allCharacters: any[] = [];
  featuredCharacters: any[] = []; // Más populares
  recentCharacters: any[] = []; // Últimas sesiones
  filteredCharacters: any[] = []; // Resultado de búsqueda
  selectedChatCharacter: any = null; // Para la sección "Habla con ellos"

  isLoading = true;
  errorMsg = '';
  searchQuery = '';
  isSearching = false;

  activeQuickFilter = 'all'; // 'all', 'stories', 'featured', 'ai'
  selectedCategory = 'all';

  // Categorías para "¿A quién quieres conocer?"
  categories: CategoryOption[] = [
    { name: 'Todos', slug: 'all', icon: '✨' },
    { name: 'Aventureros', slug: 'aventura', icon: '🧙' },
    { name: 'Detectives', slug: 'misterio', icon: '🕵️' },
    { name: 'Príncipes y princesas', slug: 'realeza', icon: '👑' },
    { name: 'Héroes', slug: 'heroes', icon: '🦸' },
    { name: 'Criaturas', slug: 'criaturas', icon: '🧟' },
    { name: 'Fantasía', slug: 'fantasia', icon: '🧚' },
    { name: 'Ciencia Ficción', slug: 'ciencia-ficcion', icon: '🚀' },
    { name: 'Clásicos', slug: 'clasicos', icon: '🎭' }
  ];

  // Skeletons
  skeletonArray = Array(8).fill(0);

  // Personajes por defecto (fallback seguro en caso de error o backend sin datos)
  defaultCharacters: any[] = [
    {
      id: 1,
      name: 'Sherlock Holmes',
      book_title: 'Estudio en Escarlata',
      book_slug: 'estudio-en-escarlata',
      avatar_image_url: 'assets/default_avatar.jpg',
      description: 'El detective consultor más famoso de la literatura, célebre por su agudeza deductiva.',
      genre: 'Misterio',
      tags: ['Detectives', 'Misterio', 'Clásicos'],
      sample_dialogue: '—Una vez descartado lo imposible, lo que queda, por improbable que parezca, debe ser la verdad.',
      chat_count: 342
    },
    {
      id: 2,
      name: 'Alicia',
      book_title: 'Alicia en el País de las Maravillas',
      book_slug: 'alicia-en-el-pais-de-las-maravillas',
      avatar_image_url: 'assets/default_avatar.jpg',
      description: 'Una niña curiosa e inquisitiva que vive las más extraordinarias aventuras al caer por la madriguera.',
      genre: 'Fantasía',
      tags: ['Fantasía', 'Aventureros', 'Clásicos'],
      sample_dialogue: '—¡Qué extraño lugar! ¿Quieres explorar las maravillas del País de las Maravillas conmigo?',
      chat_count: 512
    },
    {
      id: 3,
      name: 'Peter Pan',
      book_title: 'Peter Pan',
      book_slug: 'peter-pan',
      avatar_image_url: 'assets/default_avatar.jpg',
      description: 'El intrépido líder de los Niños Perdidos que vuela libre por el País de Nunca Jamás.',
      genre: 'Aventura',
      tags: ['Aventureros', 'Fantasía', 'Héroes'],
      sample_dialogue: '—¡Ven conmigo a Nunca Jamás! Solo necesitas fe, confianza y un poco de polvo de hadas.',
      chat_count: 420
    },
    {
      id: 4,
      name: 'El Principito',
      book_title: 'El Principito',
      book_slug: 'el-principito',
      avatar_image_url: 'assets/default_avatar.jpg',
      description: 'Un sabio y entrañable viajero galáctico proveniente del asteroide B-612.',
      genre: 'Fantasía',
      tags: ['Fantasía', 'Clásicos', 'Héroes'],
      sample_dialogue: '—Solo con el corazón se puede ver bien; lo esencial es invisible para los ojos.',
      chat_count: 610
    }
  ];

  ngOnInit() {
    this.loadAllData();
  }

  ngOnDestroy() {}

  loadAllData() {
    this.isLoading = true;
    this.errorMsg = '';
    
    // 1. Cargar Destacados / Avatares globales
    this.chatService.getGlobalAvatars('', 'popularity').subscribe({
      next: (data) => {
        const avatars = (data && data.length > 0) ? data : this.defaultCharacters;
        this.allCharacters = avatars;
        this.featuredCharacters = avatars.slice(0, 8);
        this.selectedChatCharacter = avatars[0] || this.defaultCharacters[0];
        this.isLoading = false;
      },
      error: (err) => {
        console.warn('Error cargando avatares:', err);
        // Si hay un error, usamos los personajes por defecto para no dejar pantalla vacía
        this.allCharacters = this.defaultCharacters;
        this.featuredCharacters = this.defaultCharacters;
        this.selectedChatCharacter = this.defaultCharacters[0];
        this.isLoading = false;
      }
    });

    // 2. Cargar Recientes
    this.chatService.getRecentAvatars().subscribe({
      next: (data) => {
        this.recentCharacters = data || [];
      },
      error: (err) => {
        console.warn("No se pudieron cargar recientes", err);
      }
    });
  }

  retryLoad() {
    this.loadAllData();
  }

  onSearchChange() {
    if (!this.searchQuery.trim()) {
      this.isSearching = false;
      this.filteredCharacters = [];
      return;
    }

    this.isSearching = true;
    this.isLoading = true;
    this.chatService.getGlobalAvatars(this.searchQuery).subscribe({
      next: (data) => {
        this.filteredCharacters = data || [];
        this.isLoading = false;
      },
      error: () => {
        const q = this.searchQuery.toLowerCase();
        this.filteredCharacters = this.allCharacters.filter(c =>
          c.name?.toLowerCase().includes(q) ||
          c.book_title?.toLowerCase().includes(q) ||
          c.description?.toLowerCase().includes(q)
        );
        this.isLoading = false;
      }
    });
  }

  clearSearch() {
    this.searchQuery = '';
    this.isSearching = false;
    this.filteredCharacters = [];
  }

  setQuickFilter(filterKey: string) {
    this.activeQuickFilter = filterKey;
  }

  setCategoryFilter(categorySlug: string) {
    this.selectedCategory = categorySlug;
  }

  get categorizedCharacters(): any[] {
    if (this.selectedCategory === 'all') return this.allCharacters;
    const cat = this.selectedCategory.toLowerCase();
    return this.allCharacters.filter(c => {
      const tags = (c.tags || []).map((t: string) => t.toLowerCase());
      const desc = (c.description || '').toLowerCase();
      const title = (c.book_title || '').toLowerCase();
      const genre = (c.genre || '').toLowerCase();
      return tags.includes(cat) || desc.includes(cat) || title.includes(cat) || genre.includes(cat);
    });
  }

  selectChatCharacter(char: any) {
    this.selectedChatCharacter = char;
  }

  openChat(character: any) {
    if (!character) return;

    if (!this.auth.isLoggedIn()) {
      this.router.navigate(['/demo-chat', character.id]);
      return;
    }

    if (!character.book_slug) {
      this.router.navigate(['/demo-chat', character.id]);
      return;
    }

    // Verificar si el usuario ya posee el libro
    this.api.get<any>(`library/inventory/check/?slug=${character.book_slug}`).subscribe({
      next: (res: any) => {
        if (res.owned) {
          this.router.navigate(['/reader', res.inventory_id], { 
            queryParams: { chatWith: character.id } 
          });
        } else {
          this.router.navigate(['/book', character.book_slug]);
        }
      },
      error: (err: any) => {
        console.error("Error verificando propiedad", err);
        this.router.navigate(['/book', character.book_slug]);
      }
    });
  }

  goToBook(slug?: string) {
    if (slug) {
      this.router.navigate(['/book', slug]);
    } else {
      this.router.navigate(['/catalog']);
    }
  }
}

