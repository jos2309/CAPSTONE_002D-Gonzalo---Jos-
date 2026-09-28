import { Component, OnInit, ElementRef, ViewChild, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';

export interface SceneItem {
  id: string;
  name: string;
  imageUrl: string;
  isIntruder: boolean;
  x: number;
  y: number;
}

export interface LevelData {
  id: number;
  title: string;
  storyTag: string;
  textDescription: string;
  bgImageUrl: string;
  items: SceneItem[];
}

@Component({
  selector: 'app-cazador-intrusos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cazador-intrusos.component.html',
  styleUrls: ['./cazador-intrusos.component.scss']
})
export class CazadorIntrusosComponent implements OnInit {
  @ViewChild('stageStage') stageStage!: ElementRef<HTMLDivElement>;

  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);

  levels: LevelData[] = [
    {
      id: 1,
      title: 'La Cabaña de la Abuela',
      storyTag: 'Caperucita Roja',
      textDescription: 'Al entrar en la cabaña, Caperucita vio a su abuela recostada bajo una manta roja en su cama de madera. Sobre la mesa descansaba la cesta de pan, mientras una extraña figura con cuerdas de lobo observaba pacientemente.',
      bgImageUrl: 'assets/images/cazador-intrusos/cabana-abuela-bg.jpg',
      items: [
        { id: 'item-1', name: 'Cesta de pan', imageUrl: 'assets/images/cazador-intrusos/cesta-pan.png', isIntruder: false, x: 0, y: 0 },
        { id: 'item-2', name: 'Cama de madera', imageUrl: 'assets/images/cazador-intrusos/cama-madera.png', isIntruder: false, x: 0, y: 0 },
        { id: 'item-3', name: 'Lobo disfrazado', imageUrl: 'assets/images/cazador-intrusos/lobo-disfrazado.png', isIntruder: false, x: 0, y: 0 },
        { id: 'item-4', name: 'Manta roja', imageUrl: 'assets/images/cazador-intrusos/manta-roja.png', isIntruder: false, x: 0, y: 0 },
        { id: 'item-5', name: 'Teléfono móvil', imageUrl: 'assets/images/cazador-intrusos/telefono-movil.png', isIntruder: true, x: 0, y: 0 },
        { id: 'item-6', name: 'Extintor', imageUrl: 'assets/images/cazador-intrusos/extintor-incendios.png', isIntruder: true, x: 0, y: 0 }
      ]
    },
    {
      id: 2,
      title: 'El Molino del Rey',
      storyTag: 'Rumpelstiltskin',
      textDescription: 'La joven molinera fue encerrada en una habitación repleta de fardos de paja dorada. En la esquina destacaba una vieja rueda de hilar madera, junto a una gran llave antigua sobre la repisa.',
      bgImageUrl: 'assets/images/cazador-intrusos/cuarto-paja-bg.jpg',
      items: [
        { id: 'item-1', name: 'Rueda de hilar', imageUrl: 'assets/images/cazador-intrusos/rueda-hilar.png', isIntruder: false, x: 0, y: 0 },
        { id: 'item-2', name: 'Fardo de paja', imageUrl: 'assets/images/cazador-intrusos/fardo-paja.png', isIntruder: false, x: 0, y: 0 },
        { id: 'item-3', name: 'Llave antigua', imageUrl: 'assets/images/cazador-intrusos/llave-antigua.png', isIntruder: false, x: 0, y: 0 },
        { id: 'item-4', name: 'Laptop moderno', imageUrl: 'assets/images/cazador-intrusos/laptop.png', isIntruder: true, x: 0, y: 0 },
        { id: 'item-5', name: 'Aspiradora', imageUrl: 'assets/images/cazador-intrusos/aspiradora.png', isIntruder: true, x: 0, y: 0 },
        { id: 'item-6', name: 'Gafas de sol', imageUrl: 'assets/images/cazador-intrusos/gafas-sol.png', isIntruder: true, x: 0, y: 0 }
      ]
    }
  ];

  currentLevelIndex: number = 0;
  currentLevel: LevelData | null = null;
  activeItems: SceneItem[] = [];

  lives: number = 2;
  score: number = 0;

  gameStatus: 'introText' | 'playing' | 'feedback' | 'finished' = 'introText';
  feedbackMessage: string = '';
  isLastCheckSuccess: boolean = false;

  draggedItem: SceneItem | null = null;
  dragOffset = { x: 0, y: 0 };

  ngOnInit(): void {
    this.loadLevel(0);
  }

  loadLevel(index: number): void {
    this.currentLevelIndex = index;
    this.currentLevel = this.levels[index];
    this.lives = 2;
    // Ubica los objetos aleatoriamente evitando colisiones entre ellos
    this.activeItems = this.getRandomizedItems(this.currentLevel.items);
    this.gameStatus = 'introText';
  }

  /** Genera posiciones (x, y) aleatorias sin superposición */
  private getRandomizedItems(originalItems: SceneItem[]): SceneItem[] {
    const items: SceneItem[] = JSON.parse(JSON.stringify(originalItems));
    const minDistanceX = 15; // Distancia % horizontal mínima entre centros
    const minDistanceY = 20; // Distancia % vertical mínima entre centros
    const minX = 6;
    const maxX = 78;
    const minY = 6;
    const maxY = 70;

    const placedCoords: { x: number; y: number }[] = [];

    for (const item of items) {
      let x = 0;
      let y = 0;
      let overlaps = true;
      let attempts = 0;

      while (overlaps && attempts < 120) {
        attempts++;
        x = Math.floor(Math.random() * (maxX - minX + 1)) + minX;
        y = Math.floor(Math.random() * (maxY - minY + 1)) + minY;

        overlaps = placedCoords.some(coord =>
          Math.abs(coord.x - x) < minDistanceX && Math.abs(coord.y - y) < minDistanceY
        );
      }

      placedCoords.push({ x, y });
      item.x = x;
      item.y = y;
    }

    return items;
  }

  closeModalStartGame(): void {
    this.gameStatus = 'playing';
  }

  onMouseDown(event: MouseEvent | TouchEvent, item: SceneItem): void {
    if (this.gameStatus !== 'playing') return;

    this.draggedItem = item;
    const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX;
    const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY;

    this.dragOffset = { x: clientX, y: clientY };
  }

  onMouseMove(event: MouseEvent | TouchEvent): void {
    if (!this.draggedItem || !this.stageStage || this.gameStatus !== 'playing') return;

    const stageRect = this.stageStage.nativeElement.getBoundingClientRect();
    const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX;
    const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY;

    const deltaX = ((clientX - this.dragOffset.x) / stageRect.width) * 100;
    const deltaY = ((clientY - this.dragOffset.y) / stageRect.height) * 100;

    this.draggedItem.x += deltaX;
    this.draggedItem.y += deltaY;

    this.dragOffset = { x: clientX, y: clientY };
  }

  onMouseUp(): void {
    this.draggedItem = null;
  }

  private getItemStageOverlapPercentage(itemId: string): number {
    if (!isPlatformBrowser(this.platformId)) return 0;

    const itemElem = document.getElementById(itemId);
    const stageElem = this.stageStage?.nativeElement;

    if (!itemElem || !stageElem) return 0;

    const itemRect = itemElem.getBoundingClientRect();
    const stageRect = stageElem.getBoundingClientRect();

    const xOverlap = Math.max(0, Math.min(itemRect.right, stageRect.right) - Math.max(itemRect.left, stageRect.left));
    const yOverlap = Math.max(0, Math.min(itemRect.bottom, stageRect.bottom) - Math.max(itemRect.top, stageRect.top));

    const overlapArea = xOverlap * yOverlap;
    const itemArea = itemRect.width * itemRect.height;

    return itemArea > 0 ? overlapArea / itemArea : 0;
  }

  checkSolution(): void {
    if (this.gameStatus !== 'playing') return;

    let errorsFound = false;
    let misplacedNames: string[] = [];

    for (const item of this.activeItems) {
      const overlap = this.getItemStageOverlapPercentage(item.id);
      const isInside = overlap >= 0.7;

      if (item.isIntruder && isInside) {
        errorsFound = true;
        misplacedNames.push(`"${item.name}" sigue dentro del área.`);
      } else if (!item.isIntruder && !isInside) {
        errorsFound = true;
        misplacedNames.push(`"${item.name}" pertenece al cuento y quedó fuera.`);
      }
    }

    if (!errorsFound) {
      this.isLastCheckSuccess = true;
      this.score += 200;
      this.feedbackMessage = '¡Perfecto! Has identificado correctamente todos los elementos del relato y dejado fuera los intrusos.';
      this.gameStatus = 'feedback';
    } else {
      this.isLastCheckSuccess = false;
      this.lives--;

      if (this.lives <= 0) {
        this.feedbackMessage = `Te has quedado sin vidas. Revisión: ${misplacedNames.join(' ')}`;
        this.gameStatus = 'finished';
      } else {
        this.feedbackMessage = `Revisa bien el texto: ${misplacedNames.join(' ')} Te queda ${this.lives} vida.`;
        this.gameStatus = 'feedback';
      }
    }
  }

  resumeGameFromFeedback(): void {
    if (this.lives <= 0) {
      this.gameStatus = 'finished';
    } else {
      this.gameStatus = 'playing';
    }
  }

  nextLevelOrRestart(): void {
    if (this.hasNextLevel) {
      this.loadLevel(this.currentLevelIndex + 1);
    } else {
      this.gameStatus = 'finished';
    }
  }

  restartGame(): void {
    this.score = 0;
    this.loadLevel(0);
  }

  exitGame(): void {
    this.router.navigate(['/']);
  }

  get hasNextLevel(): boolean {
    return this.currentLevelIndex + 1 < this.levels.length;
  }
}