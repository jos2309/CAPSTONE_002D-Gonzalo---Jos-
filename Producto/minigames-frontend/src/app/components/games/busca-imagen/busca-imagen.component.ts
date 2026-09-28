import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

export interface LevelConfig {
  id: number;
  storyTitle: string;
  textSnippet: string;
  targetObjectName: string;
  imageUrl: string;
  targetArea: {
    top: number;    // % desde el borde superior
    left: number;   // % desde el borde izquierdo
    width: number;  // % de ancho del área táctil
    height: number; // % de alto del área táctil
  };
}

@Component({
  selector: 'app-busca-imagen',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './busca-imagen.component.html',
  styleUrls: ['./busca-imagen.component.scss']
})
export class BuscaImagenComponent implements OnInit, OnDestroy {
  gameState: 'intro' | 'playing' | 'result' = 'intro';
  resultType: 'success' | 'wrong' | 'timeout' = 'success';

  readonly TIME_LIMIT_MS: number = 5000;
  timeLeftMs: number = 5000;
  timerProgress: number = 100;
  private timerInterval: any;

  currentLevelIndex: number = 0;

  levels: LevelConfig[] = [
    {
      id: 1,
      storyTitle: 'Alicia en el País de las Maravillas',
      textSnippet: 'Al pie del gran hongo mágico, entre las hojas del pasto, alguien había olvidado una taza de té dorada.',
      targetObjectName: 'Taza de té dorada',
      imageUrl: 'assets/images/alicia-taza.jpg',
      targetArea: { top: 70, left: 23, width: 12, height: 12 }
    },
    {
      id: 2,
      storyTitle: 'Caperucita Roja',
      textSnippet: 'Oculta entre las gruesas ramas del gran roble, una pequeña cesta con manzanas descansaba olvidada.',
      targetObjectName: 'Cesta con manzanas',
      imageUrl: 'assets/images/caperucita-cesta.jpg',
      targetArea: { top: 62, left: 81, width: 14, height: 14 }
    }
  ];

  devMode: boolean = false;
  lastDevCoords: string = '';
  devTop: number = 50;
  devLeft: number = 50;
  devWidth: number = 12;
  devHeight: number = 12;

  constructor(private router: Router) {}

  get currentLevel(): LevelConfig {
    return this.levels[this.currentLevelIndex];
  }

  ngOnInit(): void {
    this.syncDevWithCurrentLevel();
    this.scrollToTopIfMobile();
  }

  ngOnDestroy(): void {
    this.stopTimer();
  }

  startGame(): void {
    this.gameState = 'playing';
    this.scrollToTopIfMobile();
    
    if (!this.devMode) {
      this.startTimer();
    }
  }

  startTimer(): void {
    this.stopTimer();
    this.timeLeftMs = this.TIME_LIMIT_MS;
    this.timerProgress = 100;

    const stepMs = 50;
    this.timerInterval = setInterval(() => {
      this.timeLeftMs -= stepMs;
      this.timerProgress = Math.max(0, (this.timeLeftMs / this.TIME_LIMIT_MS) * 100);

      if (this.timeLeftMs <= 0) {
        this.stopTimer();
        this.handleResult('timeout');
      }
    }, stepMs);
  }

  stopTimer(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  onTargetClick(event: MouseEvent): void {
    event.stopPropagation();
    if (this.devMode) {
      this.captureDevCoordinates(event);
      return;
    }
    if (this.gameState !== 'playing') return;
    this.stopTimer();
    this.handleResult('success');
  }

  onImageMissClick(event: MouseEvent): void {
    if (this.devMode) {
      this.captureDevCoordinates(event);
      return;
    }
    if (this.gameState !== 'playing') return;
    this.stopTimer();
    this.handleResult('wrong');
  }

  handleResult(type: 'success' | 'wrong' | 'timeout'): void {
    this.resultType = type;
    this.gameState = 'result';
    this.scrollToTopIfMobile();
  }

  nextLevel(): void {
    if (this.currentLevelIndex < this.levels.length - 1) {
      this.currentLevelIndex++;
    } else {
      this.currentLevelIndex = 0;
    }
    this.syncDevWithCurrentLevel();
    this.gameState = 'intro';
    this.scrollToTopIfMobile();
  }

  openIntroModal(): void {
    this.stopTimer();
    this.gameState = 'intro';
    this.scrollToTopIfMobile();
  }

  toggleDevMode(): void {
    this.devMode = !this.devMode;
    if (this.devMode) {
      this.syncDevWithCurrentLevel();
    }
  }

  adjustDevSize(delta: number): void {
    this.devWidth = Math.max(4, Math.min(40, this.devWidth + delta));
    this.devHeight = Math.max(4, Math.min(40, this.devHeight + delta));
    this.updateDevCoordsString();
  }

  captureDevCoordinates(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    const container = target.classList.contains('image-wrapper') 
      ? target 
      : target.closest('.image-wrapper') as HTMLElement;

    if (!container) return;

    const rect = container.getBoundingClientRect();
    
    const clickX = event.clientX - rect.left;
    const clickY = event.clientY - rect.top;

    this.devLeft = Math.round((clickX / rect.width) * 100);
    this.devTop = Math.round((clickY / rect.height) * 100);

    this.updateDevCoordsString();
  }

  private syncDevWithCurrentLevel(): void {
    const area = this.currentLevel.targetArea;
    this.devTop = area.top;
    this.devLeft = area.left;
    this.devWidth = area.width;
    this.devHeight = area.height;
    this.updateDevCoordsString();
  }

  private updateDevCoordsString(): void {
    this.lastDevCoords = `targetArea: { top: ${this.devTop}, left: ${this.devLeft}, width: ${this.devWidth}, height: ${this.devHeight} }`;
  }

  selectInputText(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input) {
      input.select();
    }
  }

  exitGame(): void {
    this.stopTimer();
    this.router.navigate(['/']);
  }

  private scrollToTopIfMobile(): void {
    if (typeof window !== 'undefined' && window.innerWidth <= 768) {
      window.scrollTo(0, 0);
    }
  }
}