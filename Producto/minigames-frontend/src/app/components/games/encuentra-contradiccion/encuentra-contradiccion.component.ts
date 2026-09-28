import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

interface ImageOption {
  id: number;
  imageSrc: string;
  altText: string;
  isContradiction: boolean; // 'true' si es la imagen que contradice el texto
}

interface ContradictionChallenge {
  id: number;
  premiseText: string;
  explanation: string;
  images: ImageOption[];
}

@Component({
  selector: 'app-encuentra-contradiccion',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './encuentra-contradiccion.component.html',
  styleUrls: ['./encuentra-contradiccion.component.scss']
})
export class EncuentraContradiccionComponent implements OnInit, OnDestroy {
  challenges: ContradictionChallenge[] = [
    {
      id: 1,
      premiseText: 'El sospechoso llevaba un sombrero verde y una bufanda roja mientras caminaba bajo la lluvia.',
      explanation: 'La tercera imagen muestra al sujeto con un sombrero AZUL en lugar de verde.',
      images: [
        {
          id: 101,
          imageSrc: 'assets/images/demo1_correcto1.PNG',
          altText: 'Sombrero verde y bufanda',
          isContradiction: false
        },
        {
          id: 102,
          imageSrc: 'assets/images/demo1_correcto2.PNG',
          altText: 'Bufanda roja bajo la lluvia',
          isContradiction: false
        },
        {
          id: 103,
          imageSrc: 'assets/images/demo1_contradiccion.PNG',
          altText: 'Sombrero azul y bufanda roja',
          isContradiction: true // CONTRADICCIÓN
        },
        {
          id: 104,
          imageSrc: 'assets/images/demo1_correcto3.PNG',
          altText: 'Persona bajo la lluvia',
          isContradiction: false
        }
      ]
    },
    {
      id: 2,
      premiseText: 'En la mesa del desayuno había únicamente frutas frescas: dos manzanas rojas y un plátano amarillo.',
      explanation: 'La pizza no es una fruta fresca y contradice la afirmación del texto.',
      images: [
        {
          id: 201,
          imageSrc: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=400&q=80',
          altText: 'Manzanas rojas',
          isContradiction: false
        },
        {
          id: 202,
          imageSrc: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=400&q=80',
          altText: 'Rebanada de pizza',
          isContradiction: true // CONTRADICCIÓN
        },
        {
          id: 203,
          imageSrc: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=400&q=80',
          altText: 'Plátano amarillo',
          isContradiction: false
        },
        {
          id: 204,
          imageSrc: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?auto=format&fit=crop&w=400&q=80',
          altText: 'Cesta con frutas',
          isContradiction: false
        }
      ]
    }
  ];

  currentIndex: number = 0;
  score: number = 0;

  // Lógica del modal y temporizador
  showPremiseModal: boolean = true;
  readonly TIME_LIMIT: number = 6; // 6 Segundos
  timeRemaining: number = 6;
  timerInterval: any = null;

  // Estado del juego
  answered: boolean = false;
  selectedOption: ImageOption | null = null;
  isCorrect: boolean = false;
  timeOut: boolean = false;
  gameOver: boolean = false;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.prepareChallenge();
  }

  ngOnDestroy(): void {
    this.stopTimer();
  }

  prepareChallenge() {
    this.stopTimer();
    this.showPremiseModal = true;
    this.answered = false;
    this.selectedOption = null;
    this.isCorrect = false;
    this.timeOut = false;
    this.timeRemaining = this.TIME_LIMIT;
  }

  // Se activa al presionar el botón "¡Entendido!" en el modal
  startTimerAndGame() {
    this.showPremiseModal = false;
    this.timeRemaining = this.TIME_LIMIT;

    this.timerInterval = setInterval(() => {
      if (this.timeRemaining > 0 && !this.answered) {
        this.timeRemaining -= 0.1;
      } else if (this.timeRemaining <= 0 && !this.answered) {
        this.handleTimeOut();
      }
    }, 100);
  }

  selectOption(option: ImageOption) {
    if (this.answered || this.showPremiseModal) return;

    this.stopTimer();
    this.answered = true;
    this.selectedOption = option;
    this.isCorrect = option.isContradiction;

    if (this.isCorrect) {
      // Puntos proporcionales al tiempo restante
      const pointsObtained = Math.max(10, Math.round(this.timeRemaining * 15));
      this.score += pointsObtained;
    }
  }

  handleTimeOut() {
    this.stopTimer();
    this.timeRemaining = 0;
    this.answered = true;
    this.timeOut = true;
    this.isCorrect = false;
  }

  nextChallenge() {
    this.currentIndex++;
    if (this.currentIndex >= this.challenges.length) {
      this.gameOver = true;
    } else {
      this.prepareChallenge();
    }
  }

  restartGame() {
    this.currentIndex = 0;
    this.score = 0;
    this.gameOver = false;
    this.prepareChallenge();
  }

  stopTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  exitGame() {
    this.stopTimer();
    this.router.navigate(['/']);
  }
}