import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MinigameService } from '../../../services/minigame.service';

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
  passageText: string = '';
  statements: Statement[] = [];
  timeLimitPerQuestion: number = 3;

  currentIndex: number = 0;
  score: number = 0;
  timeLeft: number = 3;
  timerInterval: any;
  gameStarted: boolean = false;
  gameOver: boolean = false;
  
  isLoading: boolean = true;
  hasError: boolean = false;
  bookId: string = '';

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private minigameService: MinigameService
  ) {}

  ngOnInit(): void {
    // Ya3khod bookId men el URL ila kene kayn
    this.bookId = this.route.snapshot.paramMap.get('bookId') || '';
    this.loadGameData();
  }

  loadGameData(): void {
    this.isLoading = true;
    this.hasError = false;

    this.minigameService.getMinigameByCode('rafaga_vf', this.bookId || undefined).subscribe({
      next: (data) => {
        if (Array.isArray(data) && data.length > 0 && data[0]?.config_data) {
          const config = data[0].config_data;
          this.passageText = config.passage_text || config.passageText || 'Lee con atención las afirmaciones a continuación.';
          this.timeLimitPerQuestion = config.time_limit_per_question || 3;
          
          this.statements = (config.statements || []).map((s: any) => ({
            text: s.text,
            isTrue: s.is_true ?? s.isTrue
          }));
          this.hasError = false;
        } else {
          console.warn('No se encontraron datos para rafaga-vf en el libro seleccionado.');
          this.hasError = true;
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al cargar datos del minijuego:', err);
        this.hasError = true;
        this.isLoading = false;
      }
    });
  }

  startGame() {
    if (this.statements.length === 0) return;
    this.gameStarted = true;
    this.currentIndex = 0;
    this.score = 0;
    this.gameOver = false;
    this.startTimer();
  }

  startTimer() {
    this.timeLeft = this.timeLimitPerQuestion;
    clearInterval(this.timerInterval);
    this.timerInterval = setInterval(() => {
      this.timeLeft--;
      if (this.timeLeft <= 0) {
        this.processAnswer(null);
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
    this.router.navigate(['/']);
  }

  ngOnDestroy(): void {
    clearInterval(this.timerInterval);
  }
}