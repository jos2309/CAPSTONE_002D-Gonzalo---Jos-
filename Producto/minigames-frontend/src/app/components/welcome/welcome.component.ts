import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Minigame } from '../../models/minigame';

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
export class WelcomeComponent {
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
      description: 'Completa con el concepto que encaja en la frase.',
      route: '/games/completa-dialogo',
      icon: '🧠',
    },
    {
      id: 7,
      title: 'El Testigo Ocular',
      description: 'Recuerda detalles clave de la imagen.',
      route: '/games/testigo-ocular',
      icon: '🎴',
    },
    {
      id: 8,
      title: 'Cazador de Intrusos',
      description: 'Encuentra y arrastra fuera de escena los elementos que no coinciden.',
      route: '/games/cazador-intrusos',
      icon: '🔢',
    },
    {
      id: 9,
      title: 'Busca en la imagen.',
      description: 'Ayuda a buscar el elemento perdido en la imagen.',
      route: '/games/busca-imagen',
      icon: '🔤',
    },
    {
      id: 10,
      title: 'Cómics Desordenados',
      description: 'Ordenas las imagenes según ocurrieron.',
      route: '/games/comics-desordenados',
      icon: '⏱️',
    }
  ];

  /**
   * Resetea la posición del scroll al inicio de la página.
   */
  scrollToTop(): void {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }
}