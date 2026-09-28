import { Component, OnInit, ElementRef, ViewChildren, QueryList } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { DragDropModule, CdkDrag, CdkDragEnd } from '@angular/cdk/drag-drop';

export interface ComicPanel {
  id: number;
  image: string;
}

export interface Challenge {
  id: number;
  title: string;
  panels: ComicPanel[];
}

@Component({
  selector: 'app-comics-desordenados',
  standalone: true,
  imports: [CommonModule, DragDropModule],
  templateUrl: './comics-desordenados.component.html',
  styleUrls: ['./comics-desordenados.component.scss']
})
export class ComicsDesordenadosComponent implements OnInit {
  @ViewChildren(CdkDrag) dragElements!: QueryList<CdkDrag>;
  @ViewChildren('slotZone') slotZones!: QueryList<ElementRef>;

  challenges: Challenge[] = [
    {
      id: 1,
      title: 'Los tres cerditos',
      panels: [
        { id: 1, image: 'assets/images/comics/cerdos1.PNG' },
        { id: 2, image: 'assets/images/comics/cerdos2.PNG' },
        { id: 3, image: 'assets/images/comics/cerdos3.PNG' },
        { id: 4, image: 'assets/images/comics/cerdos4.PNG' }
      ]
    },
    {
      id: 2,
      title: 'Hansel y Gretel',
      panels: [
        { id: 1, image: 'assets/images/comics/hansel1.PNG' },
        { id: 2, image: 'assets/images/comics/hansel2.PNG' },
        { id: 3, image: 'assets/images/comics/hansel3.PNG' },
        { id: 4, image: 'assets/images/comics/hansel4.PNG' }
      ]
    }
  ];

  currentIndex: number = 0;
  score: number = 0;
  attemptsRemaining: number = 2;
  
  pool: ComicPanel[] = [];
  slots: ComicPanel[][] = [[], [], [], []];

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
    this.slots = [[], [], [], []];
    
    const original = [...this.challenges[index].panels];
    this.pool = this.shuffleArray(original);
  }

  private shuffleArray(array: ComicPanel[]): ComicPanel[] {
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

  onDragEnded(event: CdkDragEnd, panel: ComicPanel): void {
    if (this.isVerified && this.isCorrect) return;

    this.removeFromSlots(panel);

    const dragRect = event.source.getRootElement().getBoundingClientRect();
    let bestSlotIndex = -1;
    let maxRatio = 0;

    this.slotZones.forEach((slotRef, index) => {
      const slotRect = slotRef.nativeElement.getBoundingClientRect();
      const ratio = this.calculateOverlapRatio(dragRect, slotRect);
      
      if (ratio >= 0.80 && ratio > maxRatio) {
        maxRatio = ratio;
        bestSlotIndex = index;
      }
    });

    if (bestSlotIndex !== -1) {
      this.slots[bestSlotIndex].push(panel);
    }
  }

  private calculateOverlapRatio(dragRect: DOMRect, slotRect: DOMRect): number {
    const xOverlap = Math.max(0, Math.min(dragRect.right, slotRect.right) - Math.max(dragRect.left, slotRect.left));
    const yOverlap = Math.max(0, Math.min(dragRect.bottom, slotRect.bottom) - Math.max(dragRect.top, slotRect.top));
    const intersectionArea = xOverlap * yOverlap;
    const dragArea = dragRect.width * dragRect.height;

    return dragArea > 0 ? intersectionArea / dragArea : 0;
  }

  private removeFromSlots(panel: ComicPanel): void {
    for (let i = 0; i < this.slots.length; i++) {
      this.slots[i] = this.slots[i].filter(p => p.id !== panel.id);
    }
  }

  get isAllSlotsFilled(): boolean {
    return this.slots.every(slot => slot.length === 1);
  }

  verifyOrder(): void {
    if (!this.isAllSlotsFilled) return;

    let correct = true;
    for (let i = 0; i < 4; i++) {
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
    this.slots = [[], [], [], []];
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