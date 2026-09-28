import { Routes } from '@angular/router';
import { WelcomeComponent } from './components/welcome/welcome.component';
import { RafagaVfComponent } from './components/games/rafaga-vf/rafaga-vf.component';
import { EmoticonoDialogoComponent } from './components/games/emoticono-dialogo/emoticono-dialogo.component';
import { ImagenPixeladaComponent } from './components/games/imagen-pixelada/imagen-pixelada.component';
import { EncuentraContradiccionComponent } from './components/games/encuentra-contradiccion/encuentra-contradiccion.component';
import { ReconstruccionManuscritoComponent } from './components/games/reconstruccion-manuscrito/reconstruccion-manuscrito.component';
import { CompletaDialogoComponent } from './components/games/completa-dialogo/completa-dialogo.component';
import { TestigoOcularComponent } from './components/games/testigo-ocular/testigo-ocular.component';
import { CazadorIntrusosComponent } from './components/games/cazador-intrusos/cazador-intrusos.component';
import { BuscaImagenComponent } from './components/games/busca-imagen/busca-imagen.component';
import { ComicsDesordenadosComponent } from './components/games/comics-desordenados/comics-desordenados.component';

export const routes: Routes = [
  { path: '', component: WelcomeComponent },
  { path: 'games/rafaga-vf', component: RafagaVfComponent },
  { path: 'games/emoticono-dialogo', component: EmoticonoDialogoComponent },
  { path: 'games/imagen-pixelada', component: ImagenPixeladaComponent},
  { path: 'games/encuentra-contradiccion', component: EncuentraContradiccionComponent},
  { path: 'games/reconstruccion-manuscrito', component: ReconstruccionManuscritoComponent},
  { path: 'games/completa-dialogo', component: CompletaDialogoComponent},
  { path: 'games/testigo-ocular', component: TestigoOcularComponent},
  { path: 'games/cazador-intrusos', component: CazadorIntrusosComponent},
  { path: 'games/busca-imagen', component: BuscaImagenComponent},
  { path: 'games/comics-desordenados', component: ComicsDesordenadosComponent},
];