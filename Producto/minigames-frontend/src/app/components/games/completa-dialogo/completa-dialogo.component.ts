import { Component, ElementRef, ViewChild, ViewChildren, QueryList, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { DragDropModule, CdkDrag, CdkDragEnd } from '@angular/cdk/drag-drop';

interface DialogLevel {
  id: number;
  textBefore: string;
  textAfter: string;
  correctWord: string;
  options: string[];
}

@Component({
  selector: 'app-completa-dialogo',
  standalone: true,
  imports: [CommonModule, DragDropModule],
  templateUrl: './completa-dialogo.component.html',
  styleUrls: ['./completa-dialogo.component.scss']
})
export class CompletaDialogoComponent implements OnInit, OnDestroy {
  @ViewChild('targetSlot') targetSlot!: ElementRef;
  @ViewChildren(CdkDrag) dragElements!: QueryList<CdkDrag>;

  levels: DialogLevel[] = [
    {
      id: 1,
      textBefore: 'Junto a un gran bosque vivía un pobre',
      textAfter: 'con su esposa y sus dos hijos.',
      correctWord: 'leñador',
      options: ['leñador', 'molinero', 'carpintero', 'granjero']
    },
    {
      id: 2,
      textBefore: 'La casita estaba hecha de',
      textAfter: 'y sus ventanas eran de puro azúcar.',
      correctWord: 'pan',
      options: ['pan', 'madera', 'chocolate', 'bizcocho']
    }
  ];

  currentLevelIndex: number = 0;
  currentLevel!: DialogLevel;
  availableOptions: string[] = [];
  droppedWord: string | null = null;

  score: number = 0;
  timeLeft: number = 7.0; // Cambiado a 7 segundos
  timerInterval: any = null;

  // Historial de respuestas (true = ✅, false = ❌)
  levelResults: boolean[] = [];

  // Estados: 'intro' | 'playing' | 'success' | 'error' | 'timeout' | 'finished'
  gameStatus: 'intro' | 'playing' | 'success' | 'error' | 'timeout' | 'finished' = 'intro';

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.loadLevel(this.currentLevelIndex, false);
  }

  ngOnDestroy(): void {
    this.clearTimer();
  }

  // Carga el nivel. El parámetro autoStart define si arranca a jugar directo o pasa por intro
  loadLevel(index: number, autoStart: boolean = false): void {
    this.clearTimer();
    this.resetPositions();
    this.currentLevelIndex = index;
    this.currentLevel = this.levels[index];
    this.availableOptions = [...this.currentLevel.options].sort(() => Math.random() - 0.5);
    this.droppedWord = null;
    this.timeLeft = 7.0;

    if (autoStart) {
      this.gameStatus = 'playing';
      this.startTimer();
    } else {
      this.gameStatus = 'intro';
    }
  }

  startGameplay(): void {
    this.gameStatus = 'playing';
    this.startTimer();
  }

  startTimer(): void {
    const stepMs = 100;
    this.timerInterval = setInterval(() => {
      this.timeLeft = Math.max(0, +(this.timeLeft - 0.1).toFixed(1));
      if (this.timeLeft <= 0) {
        this.clearTimer();
        if (this.gameStatus === 'playing') {
          this.gameStatus = 'timeout';
          this.levelResults[this.currentLevelIndex] = false;
        }
      }
    }, stepMs);
  }

  clearTimer(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  // DETECCIÓN DE SOLAPAMIENTO CON 30% DE TOLERANCIA
  onDragEnded(event: CdkDragEnd, option: string): void {
    if (this.gameStatus !== 'playing' || !this.targetSlot) return;

    const dragRect = event.source.getRootElement().getBoundingClientRect();
    const targetRect = this.targetSlot.nativeElement.getBoundingClientRect();

    const overlapPercentage = this.calculateOverlapPercentage(dragRect, targetRect);

    if (overlapPercentage >= 0.30) {
      this.clearTimer();
      this.droppedWord = option;

      if (option === this.currentLevel.correctWord) {
        this.gameStatus = 'success';
        this.score += 100 + Math.round(this.timeLeft * 20);
        this.levelResults[this.currentLevelIndex] = true;
      } else {
        this.gameStatus = 'error';
        this.levelResults[this.currentLevelIndex] = false;
      }
    }
  }

  private calculateOverlapPercentage(rect1: DOMRect, rect2: DOMRect): number {
    const xOverlap = Math.max(0, Math.min(rect1.right, rect2.right) - Math.max(rect1.left, rect2.left));
    const yOverlap = Math.max(0, Math.min(rect1.bottom, rect2.bottom) - Math.max(rect1.top, rect2.top));
    
    const overlapArea = xOverlap * yOverlap;
    const draggedArea = rect1.width * rect1.height;

    if (draggedArea === 0) return 0;
    return overlapArea / draggedArea;
  }

  resetPositions(): void {
    if (this.dragElements) {
      this.dragElements.forEach(drag => drag.reset());
    }
  }

  nextLevel(): void {
    if (this.currentLevelIndex + 1 < this.levels.length) {
      // Inicia directamente en modo de juego para niveles intermedios
      this.loadLevel(this.currentLevelIndex + 1, true);
    } else {
      this.gameStatus = 'finished';
    }
  }

  restartGame(): void {
    this.score = 0;
    this.levelResults = [];
    this.loadLevel(0, false); // Muestra intro al reiniciar
  }

  exitGame(): void {
    this.router.navigate(['/']);
  }

  get timerPercentage(): number {
    return (this.timeLeft / 7.0) * 100;
  }
}