import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

interface PixelChallenge {
  id: number;
  correctCharacter: string;
  imageSrc: string;
  fallbackEmoji: string;
  options: string[]; // 5 opciones
}

@Component({
  selector: 'app-imagen-pixelada',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './imagen-pixelada.component.html',
  styleUrls: ['./imagen-pixelada.component.scss']
})
export class ImagenPixeladaComponent implements OnInit, OnDestroy {
  @ViewChild('pixelCanvas', { static: false }) canvasRef!: ElementRef<HTMLCanvasElement>;

  challenges: PixelChallenge[] = [
    {
      id: 1,
      correctCharacter: 'Santa Claus',
      imageSrc: 'assets/images/santa.PNG',
      fallbackEmoji: '🕵️‍♂️',
      options: [
        'Inspector Alegre',
        'Santa Claus',
        'Guardia Nocturno',
        'Científico Loco',
        'Agente Secreto'
      ]
    },
    {
      id: 2,
      correctCharacter: 'Jesucristo',
      imageSrc: 'assets/images/jesucristo.PNG',
      fallbackEmoji: '😨',
      options: [
        'Chef Asustado',
        'Programador Enojado',
        'Jesucristo',
        'Astronauta Perdido',
        'Monstruo Oculto'
      ]
    }
  ];

  currentIndex: number = 0;
  score: number = 0;
  
  // Lógica del Temporizador y Píxeles
  readonly TOTAL_TIME: number = 15; // Tiempo máximo en segundos para revelar la imagen
  elapsedTime: number = 0;
  timerInterval: any = null;
  currentPotentialPoints: number = 100;

  // Control de Estado de la Imagen
  imgElement: HTMLImageElement | null = null;
  imageLoaded: boolean = false;
  hasImageError: boolean = false;
  offCanvas: HTMLCanvasElement | null = null;

  // Control de Juego
  answered: boolean = false;
  selectedOption: string | null = null;
  isCorrect: boolean = false;
  gameOver: boolean = false;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.loadChallenge();
  }

  ngOnDestroy(): void {
    this.clearTimer();
  }

  loadChallenge() {
    this.clearTimer();
    this.answered = false;
    this.selectedOption = null;
    this.isCorrect = false;
    this.hasImageError = false;
    this.imageLoaded = false;
    this.elapsedTime = 0;
    this.currentPotentialPoints = 100;

    const currentChallenge = this.challenges[this.currentIndex];
    this.imgElement = new Image();
    this.imgElement.src = currentChallenge.imageSrc;

    this.imgElement.onload = () => {
      this.imageLoaded = true;
      this.startTimerAndRendering();
    };

    this.imgElement.onerror = () => {
      this.hasImageError = true;
      this.startTimerAndRendering();
    };
  }

  startTimerAndRendering() {
    this.renderFrame();

    // Actualiza la imagen y el puntaje cada 100 milisegundos para una transición fluida
    this.timerInterval = setInterval(() => {
      if (this.elapsedTime < this.TOTAL_TIME && !this.answered) {
        this.elapsedTime += 0.1;
        
        // Cálculo de puntos: De 100 pts iniciales bajando hasta 1 pt a los 15 segundos
        const progress = Math.min(this.elapsedTime / this.TOTAL_TIME, 1);
        this.currentPotentialPoints = Math.max(1, Math.round(100 * (1 - progress)));

        this.renderFrame();
      } else if (this.elapsedTime >= this.TOTAL_TIME && !this.answered) {
        this.currentPotentialPoints = 1;
        this.renderFrame();
      }
    }, 100);
  }

  renderFrame() {
    if (this.hasImageError || !this.imageLoaded || !this.canvasRef) return;

    const canvas = this.canvasRef.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx || !this.imgElement) return;

    // Progreso de 0.0 (totalmente pixelado) a 1.0 (imagen nítida)
    const progress = Math.min(this.elapsedTime / this.TOTAL_TIME, 1);
    
    // Escala de píxeles: Comienza al 3% de resolución y escala hasta el 100%
    const pixelScale = 0.03 + (0.97 * Math.pow(progress, 2)); // Función cuadrática para un revelado suave

    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    // Dimensiones en el canvas auxiliar reducido
    const scaledWidth = Math.max(4, Math.floor(canvasWidth * pixelScale));
    const scaledHeight = Math.max(4, Math.floor(canvasHeight * pixelScale));

    if (!this.offCanvas) {
      this.offCanvas = document.createElement('canvas');
    }
    this.offCanvas.width = scaledWidth;
    this.offCanvas.height = scaledHeight;

    const offCtx = this.offCanvas.getContext('2d');
    if (offCtx) {
      // 1. Dibujar imagen reducida en canvas invisible
      offCtx.imageSmoothingEnabled = true;
      offCtx.drawImage(this.imgElement, 0, 0, scaledWidth, scaledHeight);

      // 2. Escalar la imagen reducida al canvas principal sin suavizado (efecto píxel)
      ctx.imageSmoothingEnabled = false;
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);
      ctx.drawImage(this.offCanvas, 0, 0, scaledWidth, scaledHeight, 0, 0, canvasWidth, canvasHeight);
    }
  }

  selectOption(option: string) {
    if (this.answered) return;

    this.clearTimer();
    this.answered = true;
    this.selectedOption = option;

    const correct = this.challenges[this.currentIndex].correctCharacter;
    this.isCorrect = (option === correct);

    if (this.isCorrect) {
      this.score += this.currentPotentialPoints;
    }

    // Revelar la imagen al 100% al responder
    this.elapsedTime = this.TOTAL_TIME;
    this.renderFrame();
  }

  nextChallenge() {
    this.currentIndex++;
    if (this.currentIndex >= this.challenges.length) {
      this.gameOver = true;
    } else {
      this.loadChallenge();
    }
  }

  restartGame() {
    this.currentIndex = 0;
    this.score = 0;
    this.gameOver = false;
    this.loadChallenge();
  }

  clearTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  exitGame() {
    this.clearTimer();
    this.router.navigate(['/literatus-games']);
  }
}