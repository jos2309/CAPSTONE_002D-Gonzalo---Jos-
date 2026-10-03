import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Minigame } from '../../models/minigame';
import { MinigamesService } from '../../core/services/minigames.service';

export interface ExtendedMinigame extends Minigame {
  comingSoon?: boolean;
}

@Component({
  selector: 'app-welcome',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.scss']
})
export class WelcomeComponent implements OnInit {
  private minigamesService = inject(MinigamesService);

  minigames: ExtendedMinigame[] = [
    {
      id: 1,
      title: 'Ráfaga Verdadero/Falso',
      description: 'Responde rápido antes de que se agote el tiempo.',
      route: '/games/rafaga-vf',
      icon: '⚡'
    },
    {
      id: 2,
      title: 'Emoticono de Diálogo',
      description: 'Asocia el emoticono correcto al tono de cada frase.',
      route: '/games/emoticono-dialogo',
      icon: '🎭'
    },
    {
      id: 3,
      title: 'Imagen Pixelada',
      description: 'Adivina qué o quién se oculta tras los píxeles.',
      route: '/games/imagen-pixelada',
      icon: '🖼️'
    },
    {
      id: 4,
      title: 'Encuentra la Contradicción',
      description: 'Detecta el detalle que no encaja con la premisa.',
      route: '/games/encuentra-contradiccion',
      icon: '🔍'
    },
    {
      id: 5,
      title: 'Reconstrucción manuscrito',
      description: 'Ayuda a reconstruir la historia.',
      route: '/games/reconstruccion-manuscrito',
      icon: '🧩',
    },
    {
      id: 6,
      title: 'Completa el Diálogo',
      description: 'Pon a prueba tus conocimientos generales.',
      route: '/games/trivia-express',
      icon: '🧠',
      comingSoon: true
    },
    {
      id: 7,
      title: 'El Testigo Ocular',
      description: 'Memoriza la secuencia de imágenes e íconos.',
      route: '/games/memoria-visual',
      icon: '🎴',
      comingSoon: true
    },
    {
      id: 8,
      title: 'Cazador de Intrusos',
      description: 'Organiza los eventos en el orden cronológico.',
      route: '/games/ordena-secuencia',
      icon: '🔢',
      comingSoon: true
    },
    {
      id: 9,
      title: 'Trazado de Rutas',
      description: 'Encuentra las palabras ocultas en la grilla.',
      route: '/games/sopa-letras',
      icon: '🔤',
      comingSoon: true
    },
    {
      id: 10,
      title: 'Cómics Desordenados',
      description: 'Completa los retos antes de que expire el cronómetro.',
      route: '/games/desafio-tiempo',
      icon: '⏱️',
      comingSoon: true
    }
  ];

  ngOnInit(): void {
    this.minigamesService.getMinigames().subscribe({
      next: (data) => {
        console.log('Minigames obtenidos del backend local:', data);
      },
      error: (err) => {
        console.warn('Backend minigames no devolvió datos o offline, usando lista predeterminada.', err);
      }
    });
  }
}