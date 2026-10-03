import { Component, ElementRef, ViewChild, ViewChildren, QueryList } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { DragDropModule, CdkDrag, CdkDragEnd } from '@angular/cdk/drag-drop';

interface DialogueOption {
  id: number;
  character: string;
  text: string;
  isCorrect: boolean;
}

interface Challenge {
  emotionTitle: string;
  emotionImage: string;
  fallbackEmoji: string;
  dialogues: DialogueOption[];
  explanation: string;
}

@Component({
  selector: 'app-emoticono-dialogo',
  standalone: true,
  imports: [CommonModule, DragDropModule],
  templateUrl: './emoticono-dialogo.component.html',
  styleUrls: ['./emoticono-dialogo.component.scss']
})
export class EmoticonoDialogoComponent {
  @ViewChild('targetZone') targetZone!: ElementRef;
  @ViewChildren(CdkDrag) dragElements!: QueryList<CdkDrag>;

  challenges: Challenge[] = [
    {
      emotionTitle: 'Frustración y Molestia',
      emotionImage: 'assets/images/frustracion.PNG',
      fallbackEmoji: '😤',
      explanation: 'El personaje expresa molestia e impaciencia directa por los fallos repetidos del sistema.',
      dialogues: [
        { id: 1, character: 'Jefe de Proyecto', text: '¡Llevamos tres intentos y el sistema sigue fallando en lo mismo!', isCorrect: true },
        { id: 2, character: 'Asistente', text: 'Buenas tardes a todos, espero que tengan un excelente día.', isCorrect: false },
        { id: 3, character: 'Investigador', text: 'Analicemos los datos detenidamente para encontrar el patrón.', isCorrect: false },
        { id: 4, character: 'Guardia', text: 'Todo se encuentra en orden por aquí, pueden continuar.', isCorrect: false }
      ]
    },
    {
      emotionTitle: 'Miedo y Suspenso',
      emotionImage: 'assets/images/miedo.PNG',
      fallbackEmoji: '😨',
      explanation: 'El diálogo transmite tensión ante una amenaza desconocida en la oscuridad.',
      dialogues: [
        { id: 1, character: 'Chef', text: 'La receta necesita un poco más de sal y pimienta.', isCorrect: false },
        { id: 2, character: 'Explorador', text: 'Escuché un crujido detrás de ese árbol, cuidado con los depredadores.', isCorrect: true },
        { id: 3, character: 'Vendedor', text: '¡Aproveche nuestras ofertas especiales de esta semana!', isCorrect: false },
        { id: 4, character: 'Programador', text: 'El código compiló a la primera sin ningún error.', isCorrect: false }
      ]
    }
  ];

  currentIndex: number = 0;
  score: number = 0;
  
  droppedOption: DialogueOption | null = null;
  hasImageError: boolean = false;
  answered: boolean = false;
  isCorrectDrop: boolean = false;
  gameOver: boolean = false;

  constructor(private router: Router) {}

  onImageError() {
    this.hasImageError = true;
  }

  // Detecta si el globo arrastrado colisiona/solapa con la zona objetivo
  onDragEnded(event: CdkDragEnd, option: DialogueOption) {
    if (this.answered || !this.targetZone) return;

    const dragRect = event.source.getRootElement().getBoundingClientRect();
    const targetRect = this.targetZone.nativeElement.getBoundingClientRect();

    if (this.isOverlapping(dragRect, targetRect)) {
      this.droppedOption = option;
      this.answered = true;
      this.isCorrectDrop = option.isCorrect;

      if (this.isCorrectDrop) {
        this.score += 20;
      }
    }
  }

  // Comprueba intersección de rectángulos en 2D
  private isOverlapping(rect1: DOMRect, rect2: DOMRect): boolean {
    return !(
      rect1.right < rect2.left ||
      rect1.left > rect2.right ||
      rect1.bottom < rect2.top ||
      rect1.top > rect2.bottom
    );
  }

  nextChallenge() {
    this.resetPositions();
    this.answered = false;
    this.droppedOption = null;
    this.hasImageError = false;
    this.isCorrectDrop = false;
    this.currentIndex++;

    if (this.currentIndex >= this.challenges.length) {
      this.gameOver = true;
    }
  }

  restartGame() {
    this.resetPositions();
    this.currentIndex = 0;
    this.score = 0;
    this.answered = false;
    this.droppedOption = null;
    this.hasImageError = false;
    this.isCorrectDrop = false;
    this.gameOver = false;
  }

  // Devuelve todos los globos a su posición inicial en la pantalla
  private resetPositions() {
    if (this.dragElements) {
      this.dragElements.forEach(drag => drag.reset());
    }
  }

  exitGame() {
    this.router.navigate(['/literatus-games']);
  }
}