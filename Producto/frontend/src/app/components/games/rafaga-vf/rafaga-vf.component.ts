import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

interface Statement {
  text: string;
  isTrue: boolean;
}

@Component({
  selector: 'app-rafaga-vf',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './rafaga-vf.component.html',
  styleUrls: ['./rafaga-vf.component.scss']
})
export class RafagaVfComponent implements OnInit, OnDestroy {
  // Datos de prueba (posteriormente se cargarán desde Django)
  passageText: string = 'El detective vestía un abrigo café y bufanda roja. Entró a la biblioteca a las 03:00 AM silenciando sus pasos.';
  
  statements: Statement[] = [
    { text: 'El abrigo del detective era negro.', isTrue: false },
    { text: 'Llevaba una bufanda roja.', isTrue: true },
    { text: 'Entró a la biblioteca a las 3:00 AM.', isTrue: true },
    { text: 'Hizo mucho ruido al entrar.', isTrue: false },
    { text: 'Entró a una cocina.', isTrue: false }
  ];

  currentIndex: number = 0;
  score: number = 0;
  timeLeft: number = 3;
  timerInterval: any;
  gameStarted: boolean = false;
  gameOver: boolean = false;

  constructor(private router: Router) {}

  ngOnInit(): void {}

  startGame() {
    this.gameStarted = true;
    this.currentIndex = 0;
    this.score = 0;
    this.gameOver = false;
    this.startTimer();
  }

  startTimer() {
    this.timeLeft = 3;
    clearInterval(this.timerInterval);
    this.timerInterval = setInterval(() => {
      this.timeLeft--;
      if (this.timeLeft <= 0) {
        this.processAnswer(null); // Se agota el tiempo = respuesta incorrecta
      }
    }, 1000);
  }

  answer(userChoice: boolean) {
    this.processAnswer(userChoice);
  }

  processAnswer(userChoice: boolean | null) {
    clearInterval(this.timerInterval);
    const current = this.statements[this.currentIndex];

    if (userChoice !== null && userChoice === current.isTrue) {
      this.score += 10;
    }

    this.currentIndex++;

    if (this.currentIndex < this.statements.length) {
      this.startTimer();
    } else {
      this.endGame();
    }
  }

  endGame() {
    this.gameOver = true;
    clearInterval(this.timerInterval);
  }

  exitGame() {
    this.router.navigate(['/literatus-games']);
  }

  ngOnDestroy(): void {
    clearInterval(this.timerInterval);
  }
}