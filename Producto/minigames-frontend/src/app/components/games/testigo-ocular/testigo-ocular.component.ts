import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

interface Question {
  id: number;
  prompt: string;
  correctOption: string;
  options: string[];
}

interface DemoLevel {
  id: number;
  title: string;
  storyTag: string;
  imageUrl: string;
  questions: Question[];
}

@Component({
  selector: 'app-testigo-ocular',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './testigo-ocular.component.html',
  styleUrls: ['./testigo-ocular.component.scss']
})
export class TestigoOcularComponent implements OnInit, OnDestroy, AfterViewInit {
  levels: DemoLevel[] = [
    {
      id: 1,
      title: 'Caperucita Roja',
      storyTag: 'Charles Perrault / Hermanos Grimm',
      imageUrl: 'assets/images/caperucita.jpg',
      questions: [
        {
          id: 1,
          prompt: '¿De qué color es la capa/caperuza de la niña?',
          correctOption: 'Rojo',
          options: ['Rojo', 'Azul', 'Verde', 'Amarillo']
        },
        {
          id: 2,
          prompt: '¿Qué animal aparece acechando en la escena?',
          correctOption: 'El Lobo',
          options: ['El Lobo', 'El Oso', 'El Zorro', 'El Cazador']
        },
        {
          id: 3,
          prompt: '¿Qué objeto lleva Caperucita en la mano/brazo?',
          correctOption: 'Una canasta',
          options: ['Una canasta', 'Un farol', 'Un paraguas', 'Un libro']
        }
      ]
    },
    {
      id: 2,
      title: 'Rumpelstiltskin',
      storyTag: 'Hermanos Grimm',
      imageUrl: 'assets/images/rumpelstiltskin.jpg',
      questions: [
        {
          id: 1,
          prompt: '¿Qué personaje se encuentra a la izquierda?',
          correctOption: 'Rumpelstiltskin',
          options: ['Rumpelstiltskin', 'El Rey', 'La Molinera', 'Un Cazador']
        },
        {
          id: 2,
          prompt: '¿Qué objeto con fuego encendido se observa a la derecha?',
          correctOption: 'Una olla / caldero',
          options: ['Una olla / caldero', 'Un cofre de oro', 'Un pozo de agua', 'Una rueda de hilar']
        },
        {
          id: 3,
          prompt: '¿Qué estructura destaca al fondo del bosque?',
          correctOption: 'Una casa blanca',
          options: ['Una casa blanca', 'Un castillo de piedra', 'Una cueva oscura', 'Un molino de viento']
        }
      ]
    }
  ];

  currentLevelIndex: number = 0;
  currentQuestionIndex: number = 0;
  currentLevel!: DemoLevel;
  currentQuestion!: Question;

  score: number = 0;
  lives: number = 2; // 2 vidas por set de preguntas (por imagen)
  timeLeft: number = 5.0; // 5 segundos
  timerInterval: any = null;

  // Historial de respuestas por nivel y pregunta
  questionResults: boolean[][] = [];

  // Estados: 'intro' | 'answering' | 'questionFeedback' | 'finished'
  gameStatus: 'intro' | 'answering' | 'questionFeedback' | 'finished' = 'intro';

  feedbackMessage: string = '';
  isLastAttemptCorrect: boolean = false;

  constructor(private router: Router) {}

  ngOnInit(): void {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    this.restartGame();
  }

  ngAfterViewInit(): void {
    // Garantiza que la pantalla suba al inicio tras renderizar la vista y el pop-up en móvil
    setTimeout(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }, 0);
  }

  ngOnDestroy(): void {
    this.clearTimer();
  }

  loadLevel(index: number): void {
    this.clearTimer();
    this.currentLevelIndex = index;
    this.currentLevel = this.levels[index];
    this.currentQuestionIndex = 0;
    this.currentQuestion = this.currentLevel.questions[0];
    this.lives = 2;
    this.gameStatus = 'intro';
  }

  startAnsweringPhase(): void {
    this.gameStatus = 'answering';
    this.currentQuestion = this.currentLevel.questions[this.currentQuestionIndex];
    this.startTimer();
  }

  startTimer(): void {
    this.clearTimer();
    this.timeLeft = 5.0;
    const stepMs = 100;
    
    this.timerInterval = setInterval(() => {
      this.timeLeft = Math.max(0, +(this.timeLeft - 0.1).toFixed(1));
      if (this.timeLeft <= 0) {
        this.clearTimer();
        this.handleTimeout();
      }
    }, stepMs);
  }

  clearTimer(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  handleTimeout(): void {
    this.lives--;
    this.isLastAttemptCorrect = false;

    if (this.lives > 0) {
      this.feedbackMessage = `¡Tiempo agotado! Te queda 1 vida para esta imagen.`;
    } else {
      this.markRemainingQuestionsOfLevelAsFailed();
      this.feedbackMessage = '¡Tiempo agotado y sin vidas para esta imagen!';
    }
    this.gameStatus = 'questionFeedback';
  }

  selectOption(option: string): void {
    if (this.gameStatus !== 'answering') return;

    this.clearTimer();

    if (option === this.currentQuestion.correctOption) {
      // RESPUESTA CORRECTA
      this.score += 100 + Math.round(this.timeLeft * 20);
      this.isLastAttemptCorrect = true;
      this.registerResult(true);
      this.feedbackMessage = '¡Excelente memoria! Respuesta correcta.';
      this.gameStatus = 'questionFeedback';
    } else {
      // RESPUESTA INCORRECTA
      this.lives--;
      this.isLastAttemptCorrect = false;

      if (this.lives > 0) {
        this.feedbackMessage = `Incorrecto. Te queda 1 vida para esta imagen.`;
      } else {
        this.markRemainingQuestionsOfLevelAsFailed();
        this.feedbackMessage = '¡Respuesta incorrecta! Te has quedado sin vidas para esta imagen.';
      }
      this.gameStatus = 'questionFeedback';
    }
  }

  registerResult(isCorrect: boolean): void {
    if (!this.questionResults[this.currentLevelIndex]) {
      this.questionResults[this.currentLevelIndex] = [];
    }
    this.questionResults[this.currentLevelIndex][this.currentQuestionIndex] = isCorrect;
  }

  markRemainingQuestionsOfLevelAsFailed(): void {
    if (!this.questionResults[this.currentLevelIndex]) {
      this.questionResults[this.currentLevelIndex] = [];
    }
    for (let q = 0; q < this.currentLevel.questions.length; q++) {
      if (this.questionResults[this.currentLevelIndex][q] === undefined) {
        this.questionResults[this.currentLevelIndex][q] = false;
      }
    }
  }

  nextQuestionOrLevel(): void {
    if (this.lives <= 0) {
      this.gameStatus = 'finished';
      return;
    }

    if (this.isLastAttemptCorrect) {
      if (this.currentQuestionIndex + 1 < this.currentLevel.questions.length) {
        this.currentQuestionIndex++;
        this.startAnsweringPhase();
      } else {
        this.gameStatus = 'finished';
      }
    } else {
      this.startAnsweringPhase();
    }
  }

  nextLevelOrRestart(): void {
    if (this.hasNextLevel) {
      this.loadLevel(this.currentLevelIndex + 1);
    } else {
      this.restartGame();
    }
  }

  restartGame(): void {
    this.score = 0;
    this.questionResults = [];
    this.loadLevel(0);
  }

  exitGame(): void {
    this.clearTimer();
    this.router.navigate(['/']);
  }

  get timerPercentage(): number {
    return (this.timeLeft / 5.0) * 100;
  }

  get hasNextLevel(): boolean {
    return this.currentLevelIndex + 1 < this.levels.length;
  }
}