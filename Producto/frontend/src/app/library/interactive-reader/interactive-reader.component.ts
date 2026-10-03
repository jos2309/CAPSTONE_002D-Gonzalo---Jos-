import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

export interface LoreTerm {
  key: string;
  title: string;
  category: string;
  description: string;
  icon: string;
  xpReward: number;
  unlocked?: boolean;
}

export interface InventoryItem {
  id: string;
  name: string;
  icon: string;
  description: string;
  rarity: 'común' | 'raro' | 'épico' | 'legendario';
  acquired: boolean;
}

export interface RPGChoice {
  id: string;
  text: string;
  consequence: string;
  xpGain: number;
  sidekickComment: string;
  sceneState: string;
  rewardItem?: InventoryItem;
}

export interface StoryNode {
  id: string;
  chapterTitle: string;
  pageNumber: number;
  totalPages: number;
  sceneTitle: string;
  sceneLocation: string;
  sceneDescription: string;
  sceneType: 'forest' | 'ruins' | 'cave' | 'castle';
  paragraphs: string[];
  choices: RPGChoice[];
}

@Component({
  selector: 'app-interactive-reader',
  templateUrl: './interactive-reader.component.html',
  styleUrls: ['./interactive-reader.component.css']
})
export class InteractiveReaderComponent implements OnInit {

  // ── JUGADOR & ESTADO GAMIFICADO ──
  public playerName: string = 'Lector Heroico';
  public playerTitle: string = 'Explorador de Leyendas';
  public playerLevel: number = 5;
  public currentXp: number = 1450;
  public maxXp: number = 2000;
  public xpPercentage: number = 72.5;
  public readingStreakDays: number = 4;
  
  // ── INVENTARIO ──
  public inventoryItems: InventoryItem[] = [
    { id: 'item-1', name: 'Espada Rúnica', icon: '🗡️', description: 'Hoja forjada con energía arcana. Brilla en la oscuridad.', rarity: 'épico', acquired: true },
    { id: 'item-2', name: 'Pergamino de Lore', icon: '📜', description: 'Contiene secretos antiguos sobre la creación del bosque.', rarity: 'raro', acquired: true },
    { id: 'item-3', name: 'Cristal de Maná', icon: '🔮', description: 'Gema que vibra con poder mágico elemental.', rarity: 'legendario', acquired: true },
    { id: 'item-4', name: 'Poción de Sabiduría', icon: '🧪', description: 'Incrementa la agudeza mental del lector.', rarity: 'común', acquired: true },
    { id: 'item-5', name: 'Llave Dorada', icon: '🗝️', description: 'Abre el cofre sagrado en las ruinas del santuario.', rarity: 'raro', acquired: false }
  ];
  public selectedInventoryItem: InventoryItem | null = null;

  // ── NODO DE HISTORIA Y CAPÍTULOS ──
  public currentChapterTitle: string = 'Capítulo 3: El Susurro de las Sombras en el Bosque';
  public currentNodeIndex: number = 0;
  public selectedChoice: RPGChoice | null = null;
  public decisionOutcome: string | null = null;
  public isChoiceConfirmed: boolean = false;

  // ── ANIMACIÓN DE XP FLOTANTE ──
  public showFloatingXp: boolean = false;
  public floatingXpAmount: number = 150;

  // ── AI SIDEKICK (LUMI LA LECHUZA SABIA) ──
  public sidekickName: string = 'Lumi';
  public sidekickRole: string = 'Asistente IA de Lectura';
  public sidekickMessage: string = '¡Hola, aventurero! Estoy aquí para ayudarte en tu viaje. ¡Haz clic en las palabras en azul para descubrir el lore oculto!';
  public sidekickIsThinking: boolean = false;
  
  private sidekickTips: string[] = [
    '💡 *Consejo de Lumi:* Las palabras resaltadas en azul son "Palabras Lore". ¡Haz clic en ellas para ganar XP extra!',
    '📜 *Dato Curioso:* El Grifo Dorado protege los secretos antiguos. Respeta su sabiduría cuando aparezca.',
    '⚡ *Racha de Lectura:* ¡Has leído por 4 días consecutivos! Recibes un +10% de bono de experiencia.',
    '🔮 *Pista de Lectura:* Si encuentras un Glifo Rúnico, intenta combinarlo con tu Cristal de Maná.',
    '📖 *Reto Lector:* Trata de imaginar cómo suena el rugido del viento entre las copas de los árboles.'
  ];
  private currentTipIndex: number = 0;

  // ── GLOSARIO DE LORE & MODAL ──
  public isLoreModalOpen: boolean = false;
  public activeLoreTerm: LoreTerm | null = null;

  public loreDictionary: Record<string, LoreTerm> = {
    'Bosque Susurrante': {
      key: 'Bosque Susurrante',
      title: 'El Bosque Susurrante',
      category: 'Lugar Mágico',
      icon: '🌲',
      description: 'Un bosque ancestral donde los árboles comunican conocimientos mediante el viento. Sus hojas resplandecen con luz esmeralda durante la noche.',
      xpReward: 25,
      unlocked: false
    },
    'Glifo Rúnico': {
      key: 'Glifo Rúnico',
      title: 'Glifo Rúnico Ancestral',
      category: 'Artefacto / Magia',
      icon: '✨',
      description: 'Símbolos alfabéticos grabados en piedra tallada por los Antiguos Sabios. Canalizan la energía de los elementos primordiales.',
      xpReward: 25,
      unlocked: false
    },
    'Grifo Dorado': {
      key: 'Grifo Dorado',
      title: 'El Grifo Dorado de la Cumbre',
      category: 'Criatura Mítica',
      icon: '🦅',
      description: 'Guardia sagrado con cabeza y wings de águila y cuerpo de león. Protege el Manuscrito del Viento de las fuerzas de la sombra.',
      xpReward: 25,
      unlocked: false
    },
    'Cristal de Maná': {
      key: 'Cristal de Maná',
      title: 'Cristal de Maná Puro',
      category: 'Gema Arcana',
      icon: '🔮',
      description: 'Mineral resplandeciente que acumula la magia ambiental. Permite activar antiguos mecanismos y descifrar encantamientos.',
      xpReward: 25,
      unlocked: false
    },
    'Alquimia Ancestral': {
      key: 'Alquimia Ancestral',
      title: 'Alquimia Ancestral',
      category: 'Disciplina Arcana',
      icon: '🧪',
      description: 'La ciencia antigua de transmutar elementos naturales en elixires de luz y brebajes de protección.',
      xpReward: 25,
      unlocked: false
    }
  };

  // ── ARBOL DE HISTORIA NODOS ──
  public storyNodes: StoryNode[] = [
    {
      id: 'node-1',
      chapterTitle: 'Capítulo 3: El Susurro de las Sombras',
      pageNumber: 14,
      totalPages: 32,
      sceneTitle: 'La Encrucijada del Árbol Milenario',
      sceneLocation: 'El Bosque Susurrante — Región Central',
      sceneDescription: 'Los rayos del atardecer filtran luces doradas sobre las raíces gigantes del roble centenario. Un portal rúnico brilla tenuemente.',
      sceneType: 'forest',
      paragraphs: [
        'Tras horas de marcha por el denso paraje, nuestro joven héroe llegó al corazón del <span class="lore-word" data-term="Bosque Susurrante">Bosque Susurrante</span>. Frente a él se erguía el grandioso Roble Milenario, cuyos troncos estaban cubiertos por musgo incandescente y grabados arcanos.',
        'En el centro del tronco tallado, un <span class="lore-word" data-term="Glifo Rúnico">Glifo Rúnico</span> comenzaba a destellar con un pulso violáceo. El aire olía a ozono y a magia pura. De repente, una sombra majestuosa descendió suavemente desde la fronda: era el afamado <span class="lore-word" data-term="Grifo Dorado">Grifo Dorado</span>, cuyos ojos de ámbar observaban cada uno de los movimientos con solemnidad.',
        'En su zurrón, el héroe sintió que el <span class="lore-word" data-term="Cristal de Maná">Cristal de Maná</span> aumentaba su temperatura. La encrucijada requería una decisión audaz para abrir la senda hacia el templo de la <span class="lore-word" data-term="Alquimia Ancestral">Alquimia Ancestral</span>.'
      ],
      choices: [
        {
          id: 'c1',
          text: 'Descifrar el Glifo Rúnico canalizando la luz de tu Cristal de Maná',
          consequence: 'Al acercar el cristal, el glifo emite una luz brillante que disipa las sombras y revela un pasadizo secreto entre las raíces.',
          xpGain: 150,
          sidekickComment: '¡Brillante decisión! La magia rúnica reaccionó perfectamente a tu Cristal de Maná. ¡Sumas +150 XP y desbloqueas el pasadizo!',
          sceneState: 'forest-portal',
          rewardItem: { id: 'item-5', name: 'Llave Dorada', icon: '🗝️', description: 'Abre el cofre sagrado en las ruinas del santuario.', rarity: 'raro', acquired: true }
        },
        {
          id: 'c2',
          text: 'Hacer una reverencia al Grifo Dorado y solicitar su bendición',
          consequence: 'El Grifo inclina su majestuosa cabeza, despliega sus alas doradas y te eleva suavemente hacia el puente de copas sagradas.',
          xpGain: 150,
          sidekickComment: '¡Qué muestra de respeto y valentía! El Grifo Dorado te reconoce como un noble aliado del bosque. ¡Ganas +150 XP!',
          sceneState: 'griffin-flight'
        },
        {
          id: 'c3',
          text: 'Preparar una fórmula de Alquimia Ancestral para iluminar la espesura',
          consequence: 'Mezclas las esencias de tu zurrón creando una niebla reluciente que aparta las espinas y abre un sendero despejado.',
          xpGain: 150,
          sidekickComment: '¡Excelente pensamiento analítico! La alquimia creó una vía segura sin perturbar el ecosistema mágico. ¡+150 XP!',
          sceneState: 'alchemy-path'
        }
      ]
    },
    {
      id: 'node-2',
      chapterTitle: 'Capítulo 3: El Pasadizo de Cristal',
      pageNumber: 15,
      totalPages: 32,
      sceneTitle: 'El Santuario Subterráneo de la Luz',
      sceneLocation: 'Las Cámaras Subterráneas del Bosque',
      sceneDescription: 'Estalactitas de cuarzo cuelgan del techo iluminando una fuente de agua pura donde flotan pergaminos de sabiduría.',
      sceneType: 'ruins',
      paragraphs: [
        'Avanzando por el sendero recién descubierto, los pasos resonaban suavemente en el suelo de piedra labrada. La atmósfera del santuario transmitía una paz inmensa.',
        'En el centro de la sala se encontraba el altar del sabio. Un resplandor envuelve las páginas de un antiguo tomo que espera ser leído por un verdadero Guardián de la Lectura.'
      ],
      choices: [
        {
          id: 'c2-1',
          text: 'Examinar los tomos arcanos del altar para desvelar el enigma final',
          consequence: 'Lees con atención las inscripciones antiguas y comprendes el secreto de los Sabios del Bosque.',
          xpGain: 200,
          sidekickComment: '¡Increíble sed de conocimiento! Has descifrado el tomo arcano y ganado +200 XP.',
          sceneState: 'sanctuary-altar'
        },
        {
          id: 'c2-2',
          text: 'Recoger el elixir purificador de la fuente y continuar hacia el valle',
          consequence: 'Guardas la esencia mágica en tu inventario y te preparas para el siguiente desafío exterior.',
          xpGain: 180,
          sidekickComment: '¡Una sabia preparación para lo que se avecina! El elixir te protegerá en tus futuras aventuras.',
          sceneState: 'sanctuary-fountain'
        }
      ]
    }
  ];

  constructor(private sanitizer: DomSanitizer) {}

  ngOnInit(): void {
    this.recalculateXpProgress();
  }

  // ── MANEJO DE TEXTO CON PALABRAS LORE INTERACTIVAS ──
  public getRenderedParagraph(paragraphText: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(paragraphText);
  }

  public onStoryTextClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (target && target.classList.contains('lore-word')) {
      const termKey = target.getAttribute('data-term');
      if (termKey && this.loreDictionary[termKey]) {
        this.openLoreModal(this.loreDictionary[termKey]);
      }
    }
  }

  // ── SELECCIÓN DE DECISIONES RPG ──
  public selectChoice(choice: RPGChoice): void {
    if (this.isChoiceConfirmed && this.selectedChoice?.id === choice.id) return;

    this.selectedChoice = choice;
    this.isChoiceConfirmed = true;
    this.decisionOutcome = choice.consequence;

    // 1. Actualizar globo de diálogo del Sidekick
    this.sidekickMessage = choice.sidekickComment;
    this.sidekickIsThinking = false;

    // 2. Sumar XP con animación
    this.awardXp(choice.xpGain);

    // 3. Otorgar ítem de recompensa si existe
    if (choice.rewardItem) {
      const existing = this.inventoryItems.find(i => i.id === choice.rewardItem?.id);
      if (existing) {
        existing.acquired = true;
      } else {
        this.inventoryItems.push(choice.rewardItem);
      }
    }
  }

  // ── SISTEMA DE XP ANIMADO ──
  public awardXp(amount: number): void {
    this.floatingXpAmount = amount;
    this.showFloatingXp = true;

    this.currentXp += amount;

    if (this.currentXp >= this.maxXp) {
      this.playerLevel++;
      this.currentXp = this.currentXp - this.maxXp;
      this.maxXp = Math.floor(this.maxXp * 1.25);
      this.playerTitle = 'Maestro del Saber Arcano';
      this.sidekickMessage = `🎉 ¡¡FELICIDADES!! Has subido al Nivel ${this.playerLevel} (${this.playerTitle}). ¡Tus conocimientos aumentan!`;
    }

    this.recalculateXpProgress();

    setTimeout(() => {
      this.showFloatingXp = false;
    }, 2500);
  }

  private recalculateXpProgress(): void {
    this.xpPercentage = Math.min(100, Math.round((this.currentXp / this.maxXp) * 100));
  }

  // ── ASISTENTE IA (SIDEKICK INTERACTIVO) ──
  public triggerSidekickHint(): void {
    this.sidekickIsThinking = true;
    setTimeout(() => {
      this.currentTipIndex = (this.currentTipIndex + 1) % this.sidekickTips.length;
      this.sidekickMessage = this.sidekickTips[this.currentTipIndex];
      this.sidekickIsThinking = false;
    }, 400);
  }

  // ── MODAL DE GLOSARIO / LORE ──
  public openLoreModal(term: LoreTerm): void {
    this.activeLoreTerm = term;
    this.isLoreModalOpen = true;
  }

  public closeLoreModal(): void {
    this.isLoreModalOpen = false;
  }

  public claimLoreXp(term: LoreTerm): void {
    if (!term.unlocked) {
      term.unlocked = true;
      this.awardXp(term.xpReward);
      this.sidekickMessage = `📖 ¡Excelente! Has añadido "${term.title}" a tu Bitácora de Lore y ganado +${term.xpReward} XP.`;
    }
    this.closeLoreModal();
  }

  // ── DETALLES DE INVENTARIO ──
  public openInventoryDetail(item: InventoryItem): void {
    if (!item.acquired) return;
    this.selectedInventoryItem = item;
  }

  public closeInventoryDetail(): void {
    this.selectedInventoryItem = null;
  }

  // ── NAVEGACIÓN DE PÁGINAS Y CAPÍTULOS ──
  public getCurrentNode(): StoryNode {
    return this.storyNodes[this.currentNodeIndex] || this.storyNodes[0];
  }

  public nextNode(): void {
    if (this.currentNodeIndex < this.storyNodes.length - 1) {
      this.currentNodeIndex++;
      this.resetNodeState();
    }
  }

  public prevNode(): void {
    if (this.currentNodeIndex > 0) {
      this.currentNodeIndex--;
      this.resetNodeState();
    }
  }

  private resetNodeState(): void {
    this.selectedChoice = null;
    this.decisionOutcome = null;
    this.isChoiceConfirmed = false;
    const node = this.getCurrentNode();
    this.currentChapterTitle = node.chapterTitle;
    this.sidekickMessage = `Ha comenzado una nueva sección: "${node.sceneTitle}". Revisa la historia e investiga las palabras clave.`;
  }
}
