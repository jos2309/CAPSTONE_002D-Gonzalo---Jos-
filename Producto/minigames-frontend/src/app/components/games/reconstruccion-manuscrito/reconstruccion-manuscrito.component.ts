import { Component, OnInit, ElementRef, ViewChildren, QueryList } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { DragDropModule, CdkDrag, CdkDragEnd } from '@angular/cdk/drag-drop';

export interface StoryFragment {
  id: number;
  text: string;
}

export interface Challenge {
  id: number;
  title: string;
  fragments: StoryFragment[];
}

@Component({
  selector: 'app-reconstruccion-manuscrito',
  standalone: true,
  imports: [CommonModule, DragDropModule],
  templateUrl: './reconstruccion-manuscrito.component.html',
  styleUrls: ['./reconstruccion-manuscrito.component.scss']
})
export class ReconstruccionManuscritoComponent implements OnInit {
  @ViewChildren(CdkDrag) dragElements!: QueryList<CdkDrag>;
  @ViewChildren('slotZone') slotZones!: QueryList<ElementRef>;

  challenges: Challenge[] = [
    {
      id: 1,
      title: 'Caperucita Roja',
      fragments: [
        { id: 1, text: 'Caperucita sale de casa con una cesta de comida para visitar a su abuelita enferma.' },
        { id: 2, text: 'En el bosque se cruza con el lobo feroz, quien la engaña para tomar el camino más largo.' },
        { id: 3, text: 'El lobo se adelanta a la casa de la abuela, la oculta en el armario y se disfraza con su ropa.' },
        { id: 4, text: 'Caperucita llega a la casa, nota rasgos extraños en su abuela y el lobo la ataca de sorpresa.' },
        { id: 5, text: 'Un leñador que pasaba cerca escucha los gritos, rescata a Caperucita y ahuyenta al lobo.' }
      ]
    },
    {
      id: 2,
      title: 'El Patito Feo',
      fragments: [
        { id: 1, text: 'Nace un pajarillo distinto a sus hermanos, siendo rechazado y burlado por los animales de la granja.' },
        { id: 2, text: 'Cansado del maltrato, el patito huye del corral y vaga en soledad durante el frío invierno.' },
        { id: 3, text: 'Pasa varios meses refugiado con temor, añorando encontrar un lugar donde sea aceptado.' },
        { id: 4, text: 'Al llegar la primavera, observa a un grupo de majestuosos cisnes nadando en un estanque.' },
        { id: 5, text: 'Se acerca temeroso a su reflejo en el agua y descubre que se ha convertido en un hermoso cisne.' }
      ]
    }
  ];

  currentIndex: number = 0;
  score: number = 0;
  attemptsRemaining: number = 2;
  
  pool: StoryFragment[] = [];
  slots: StoryFragment[][] = [[], [], [], [], []];

  isVerified: boolean = false;
  isCorrect: boolean = false;
  gameOver: boolean = false;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.loadChallenge(this.currentIndex);
  }

  loadChallenge(index: number): void {
    this.isVerified = false;
    this.isCorrect = false;
    this.attemptsRemaining = 2;
    this.slots = [[], [], [], [], []];
    
    const original = [...this.challenges[index].fragments];
    this.pool = this.shuffleArray(original);
  }

  private shuffleArray(array: StoryFragment[]): StoryFragment[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    if (shuffled.every((item, idx) => item.id === idx + 1)) {
      return this.shuffleArray(array);
    }
    return shuffled;
  }

  onDragEnded(event: CdkDragEnd, fragment: StoryFragment): void {
    if (this.isVerified && this.isCorrect) return;

    this.removeFromSlots(fragment);

    const bubbleRect = event.source.getRootElement().getBoundingClientRect();
    let bestSlotIndex = -1;
    let maxRatio = 0;

    this.slotZones.forEach((slotRef, index) => {
      const slotRect = slotRef.nativeElement.getBoundingClientRect();
      const ratio = this.calculateOverlapRatio(bubbleRect, slotRect);
      
      if (ratio >= 0.80 && ratio > maxRatio) {
        maxRatio = ratio;
        bestSlotIndex = index;
      }
    });

    if (bestSlotIndex !== -1) {
      this.slots[bestSlotIndex].push(fragment);
    }
  }

  private calculateOverlapRatio(bubbleRect: DOMRect, slotRect: DOMRect): number {
    const xOverlap = Math.max(0, Math.min(bubbleRect.right, slotRect.right) - Math.max(bubbleRect.left, slotRect.left));
    const yOverlap = Math.max(0, Math.min(bubbleRect.bottom, slotRect.bottom) - Math.max(bubbleRect.top, slotRect.top));
    const intersectionArea = xOverlap * yOverlap;
    const bubbleArea = bubbleRect.width * bubbleRect.height;

    return bubbleArea > 0 ? intersectionArea / bubbleArea : 0;
  }

  private removeFromSlots(fragment: StoryFragment): void {
    for (let i = 0; i < this.slots.length; i++) {
      this.slots[i] = this.slots[i].filter(f => f.id !== fragment.id);
    }
  }

  get isAllSlotsFilled(): boolean {
    return this.slots.every(slot => slot.length === 1);
  }

  verifyOrder(): void {
    if (!this.isAllSlotsFilled) return;

    let correct = true;
    for (let i = 0; i < 5; i++) {
      if (this.slots[i][0].id !== i + 1) {
        correct = false;
        break;
      }
    }

    this.isVerified = true;
    if (correct) {
      this.isCorrect = true;
      this.score += 100 * this.attemptsRemaining;
    } else {
      this.attemptsRemaining--;
      this.isCorrect = false;
    }
  }

  retryChallenge(): void {
    this.isVerified = false;
    this.slots = [[], [], [], [], []];
    this.resetPositions();
  }

  nextChallenge(): void {
    this.resetPositions();
    if (this.currentIndex + 1 < this.challenges.length) {
      this.currentIndex++;
      this.loadChallenge(this.currentIndex);
    } else {
      this.gameOver = true;
    }
  }

  restartGame(): void {
    this.resetPositions();
    this.currentIndex = 0;
    this.score = 0;
    this.gameOver = false;
    this.loadChallenge(0);
  }

  private resetPositions(): void {
    if (this.dragElements) {
      this.dragElements.forEach(drag => drag.reset());
    }
  }

  exitGame(): void {
    this.router.navigate(['/']);
  }
}