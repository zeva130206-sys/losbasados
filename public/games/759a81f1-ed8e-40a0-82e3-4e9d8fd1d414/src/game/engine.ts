/**
 * Motor Principal de Juego (Game Engine) - Los Basados: Furia Callejera
 * Basado en la arquitectura técnica de Final Fight 2 (Capcom, SNES 1993):
 * - Espacio 2.5D con movimiento en 8 direcciones (Eje X y Eje Z de profundidad 180 a 246).
 * - IA Autónoma con Gestor de Tokens de Ataque y 4 Niveles de Dificultad (Fácil, Normal, Difícil, Nivel Basado).
 * - Sub-Áreas Dinámicas (10 a 15 por país): Calles comerciales, callejones con grafitis, entradas de metro y andenes subterráneos.
 * - Mecánica clásica Arcade "¡SIGUE! ➔" (GO ➔): Al despejar enemigos, la cámara se desbloquea y el jugador avanza a pie al siguiente escenario.
 * - Soporte táctil nativo dedicado (sin sobrescritura en bucle) y mandos universales.
 */

import { retroAudio } from './audio';
import { gamepadManager } from './gamepad';
import { pixelSprites } from './sprites';
import { getRandomBasedQuote, STAGES_CONFIG } from './story';
import {
  CharacterId,
  CustomKeyConfig,
  EnemyEntity,
  EnemyType,
  FloatingText,
  GameDifficulty,
  GameMode,
  GameState,
  Hitbox,
  InputState,
  Particle,
  PickupEntity,
  PlayerAction,
  PlayerEntity,
  PlayerKeyBindings,
  PropEntity,
  SubAreaConfig
} from './types';

export const DEFAULT_KEY_CONFIG: CustomKeyConfig = {
  p1: {
    up: 'KeyW',
    down: 'KeyS',
    left: 'KeyA',
    right: 'KeyD',
    jump: 'Space',
    punch: 'KeyJ',
    kick: 'KeyK',
    special: 'KeyL',
    tag: 'KeyQ'
  },
  p2: {
    up: 'ArrowUp',
    down: 'ArrowDown',
    left: 'ArrowLeft',
    right: 'ArrowRight',
    jump: 'Numpad0',
    punch: 'Numpad1',
    kick: 'Numpad2',
    special: 'Numpad3',
    tag: 'Numpad7'
  }
};

export class GameEngine {
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private isRunning: boolean = false;
  private animId: number = 0;
  private lastTime: number = 0;

  // Resolución interna estilo recreativa arcade / SNES
  public readonly V_WIDTH = 480;
  public readonly V_HEIGHT = 270;

  // Límites del plano callejero en el eje Z (profundidad)
  public readonly Z_MIN = 180;
  public readonly Z_MAX = 246;

  // Estado del juego
  public gameState: GameState = 'TITLE';
  public gameMode: GameMode = '1P';
  public difficulty: GameDifficulty = 'normal';
  public activeCharId: CharacterId = 'vaze';
  public activeCharId2: CharacterId = 'haggar';
  public customPlayerName: string = 'Basado';
  public customPlayer2Name: string = 'Compañero';
  public score: number = 0;
  public scoreP2: number = 0;
  public currentStageIndex: number = 0; // 0 = Hong Kong, 1 = Francia, etc.
  public currentSubAreaIndex: number = 0; // Sub-área (1 a 11+)
  public isSubAreaCleared: boolean = false;
  public goArrowTimer: number = 0;
  public cameraX: number = 0;
  public levelLength: number = 620;
  public stageTimer: number = 99; // Contador de tiempo estilo arcade

  // Entidades
  public player!: PlayerEntity;
  public player2: PlayerEntity | null = null;
  public enemies: EnemyEntity[] = [];
  public props: PropEntity[] = [];
  public pickups: PickupEntity[] = [];
  public particles: Particle[] = [];
  public floatingTexts: FloatingText[] = [];

  // Mapeo configurable de teclas
  public keyConfig: CustomKeyConfig = {
    p1: { ...DEFAULT_KEY_CONFIG.p1 },
    p2: { ...DEFAULT_KEY_CONFIG.p2 }
  };

  // Tokens de ataque para IA
  private currentAttackTokens: number = 0;

  // Efectos de pantalla
  private hitstopTimer: number = 0;
  private screenShakeTimer: number = 0;
  private screenShakeMagnitude: number = 0;
  private lightningTimer: number = 0; // Para el escenario de Japón
  private lastUiNotifyTime: number = 0;

  // Entradas consolidadas Jugador 1 (Teclado P1, Mando 1, Táctil)
  public input: InputState = {
    left: false,
    right: false,
    up: false,
    down: false,
    jump: false,
    jumpJustPressed: false,
    punch: false,
    punchJustPressed: false,
    kick: false,
    kickJustPressed: false,
    special: false,
    specialJustPressed: false,
    pauseJustPressed: false,
    switchPartnerJustPressed: false
  };

  // Entradas consolidadas Jugador 2 (Teclado P2, Mando 2)
  public inputP2: InputState = {
    left: false,
    right: false,
    up: false,
    down: false,
    jump: false,
    jumpJustPressed: false,
    punch: false,
    punchJustPressed: false,
    kick: false,
    kickJustPressed: false,
    special: false,
    specialJustPressed: false,
    pauseJustPressed: false,
    switchPartnerJustPressed: false
  };

  // Entradas táctiles dedicadas e inmunes a ser borradas por teclado
  public touchInput: InputState = {
    left: false,
    right: false,
    up: false,
    down: false,
    jump: false,
    jumpJustPressed: false,
    punch: false,
    punchJustPressed: false,
    kick: false,
    kickJustPressed: false,
    special: false,
    specialJustPressed: false,
    pauseJustPressed: false,
    switchPartnerJustPressed: false
  };

  private keysHeld: Set<string> = new Set();
  private keysJustPressed: Set<string> = new Set();

  // Callbacks para la interfaz React
  public onStateChange?: (state: GameState) => void;
  public onPlayerUpdate?: (player: PlayerEntity) => void;
  public onPlayer2Update?: (player: PlayerEntity | null) => void;
  public onScoreUpdate?: (score: number) => void;
  public onScore2Update?: (score: number) => void;
  public onStageChange?: (stageIndex: number) => void;
  public onSubAreaChange?: (subArea: SubAreaConfig) => void;

  public getKeyConfig(): CustomKeyConfig {
    return this.keyConfig;
  }

  public setCharacter2(charId: CharacterId): void {
    this.activeCharId2 = charId;
    if (this.player2) {
      this.applyArchetypeStats(charId, this.player2);
      this.onPlayer2Update?.(this.player2);
    }
  }

  constructor() {
    this.loadKeyConfig();
    this.initKeyboard();
  }

  public loadKeyConfig(): void {
    if (typeof window === 'undefined') return;
    try {
      const saved = localStorage.getItem('los_basados_key_config');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.p1 && parsed.p2) {
          this.keyConfig = parsed;
        }
      }
    } catch {
      // Fallback a default
    }
  }

  public saveKeyConfig(newConfig: CustomKeyConfig): void {
    this.keyConfig = newConfig;
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('los_basados_key_config', JSON.stringify(newConfig));
      } catch {
        // ignore
      }
    }
  }

  public resetKeyConfig(): void {
    this.keyConfig = {
      p1: { ...DEFAULT_KEY_CONFIG.p1 },
      p2: { ...DEFAULT_KEY_CONFIG.p2 }
    };
    if (typeof window !== 'undefined') {
      localStorage.removeItem('los_basados_key_config');
    }
  }

  public setGameMode(mode: GameMode): void {
    this.gameMode = mode;
    this.resetLevel(this.currentStageIndex, this.currentSubAreaIndex);
  }

  public attachCanvas(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { alpha: false });
    if (this.ctx) {
      this.ctx.imageSmoothingEnabled = false;
    }
    this.resetLevel(this.currentStageIndex, 0);
  }

  private initKeyboard() {
    if (typeof window === 'undefined') return;

    window.addEventListener('keydown', (e) => {
      // Prevenir scroll en teclas de juego
      if (
        [
          'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space',
          'KeyW', 'KeyS', 'KeyA', 'KeyD', 'KeyJ', 'KeyK', 'KeyL', 'KeyQ',
          'Numpad0', 'Numpad1', 'Numpad2', 'Numpad3', 'Numpad7',
          'KeyU', 'KeyI', 'KeyO', 'KeyP'
        ].includes(e.code)
      ) {
        e.preventDefault();
      }
      if (!this.keysHeld.has(e.code)) {
        this.keysJustPressed.add(e.code);
      }
      this.keysHeld.add(e.code);
      retroAudio.unlock();
    });

    window.addEventListener('keyup', (e) => {
      this.keysHeld.delete(e.code);
    });

    window.addEventListener('blur', () => {
      this.keysHeld.clear();
      this.keysJustPressed.clear();
    });
  }

  // --- MÉTODOS DE ENTRADA TÁCTIL DEDICADOS ---
  public setTouchDirection(left: boolean, right: boolean, up: boolean, down: boolean) {
    this.touchInput.left = left;
    this.touchInput.right = right;
    this.touchInput.up = up;
    this.touchInput.down = down;
  }

  public setTouchButton(action: 'jump' | 'punch' | 'kick' | 'special' | 'tag' | 'pause', pressed: boolean) {
    if (action === 'jump') {
      if (pressed && !this.touchInput.jump) this.touchInput.jumpJustPressed = true;
      this.touchInput.jump = pressed;
    } else if (action === 'punch') {
      if (pressed && !this.touchInput.punch) this.touchInput.punchJustPressed = true;
      this.touchInput.punch = pressed;
    } else if (action === 'kick') {
      if (pressed && !this.touchInput.kick) this.touchInput.kickJustPressed = true;
      this.touchInput.kick = pressed;
    } else if (action === 'special') {
      if (pressed && !this.touchInput.special) this.touchInput.specialJustPressed = true;
      this.touchInput.special = pressed;
    } else if (action === 'tag') {
      if (pressed) this.touchInput.switchPartnerJustPressed = true;
    } else if (action === 'pause') {
      if (pressed) this.touchInput.pauseJustPressed = true;
    }
  }

  public setDifficulty(diff: GameDifficulty) {
    this.difficulty = diff;
    retroAudio.playMenuBeep();
  }

  public setCustomPlayerName(name: string) {
    this.customPlayerName = name.trim() || 'Basado';
    if (this.player) {
      this.player.stats.name = this.customPlayerName;
      this.notifyPlayerUpdate(true);
    }
  }

  public setCharacter(charId: CharacterId) {
    this.activeCharId = charId;
    if (this.player) {
      this.applyArchetypeStats(charId);
      this.notifyPlayerUpdate(true);
    }
  }

  private applyArchetypeStats(charId: CharacterId, target: PlayerEntity = this.player) {
    if (!target) return;
    const isVaze = charId === 'vaze';
    const isMaki = charId === 'maki';
    const isHaggar = charId === 'haggar';
    const isCody = charId === 'cody';

    target.stats.id = charId;
    target.stats.archetype = isMaki ? 'speedster' : isHaggar ? 'grappler' : 'allrounder';

    if (isVaze) {
      target.stats.name = target === this.player ? (this.customPlayerName || 'VAZE') : (this.customPlayer2Name || 'VAZE');
      target.stats.subtitle = 'VAZE: Rebelde Urbano - Fists & Speed';
      target.stats.punchDamage = 18;
      target.stats.kickDamage = 22;
      target.stats.throwDamage = 40;
      target.stats.speedX = 3.4;
      target.stats.speedZ = 2.1;
      target.stats.jumpPower = -7.2; // Salto arcade balanceado CPS-1
      target.stats.specialCost = 35;
      target.stats.signatureMove = 'Neo-Furia (Orbe y Corte Carmesí)';
      target.stats.color = '#ef4444';
      target.stats.bio = 'Rebelde urbano que lucha con gabardina roja para rescatar a su PC Baby.';
    } else if (isCody) {
      target.stats.name = target === this.player ? (this.customPlayerName || 'Cody') : (this.customPlayer2Name || 'Cody');
      target.stats.subtitle = 'Cody (Brawler Equilibrado)';
      target.stats.punchDamage = 16;
      target.stats.kickDamage = 20;
      target.stats.throwDamage = 38;
      target.stats.speedX = 3.3;
      target.stats.speedZ = 2.0;
      target.stats.jumpPower = -7.2;
      target.stats.specialCost = 35;
      target.stats.signatureMove = 'Tornado Kick & Mega Uppercut';
      target.stats.color = '#3b82f6';
      target.stats.bio = 'Luchador callejero';
    } else if (isHaggar) {
      target.stats.name = target === this.player ? (this.customPlayerName || 'Haggar') : (this.customPlayer2Name || 'Haggar');
      target.stats.subtitle = 'Haggar (Heavy Grappler)';
      target.stats.punchDamage = 22;
      target.stats.kickDamage = 24;
      target.stats.throwDamage = 50;
      target.stats.speedX = 2.6;
      target.stats.speedZ = 1.7;
      target.stats.jumpPower = -6.8;
      target.stats.specialCost = 45;
      target.stats.signatureMove = 'Spinning Clothesline';
      target.stats.color = '#eab308';
      target.stats.bio = 'Alcalde y titán de la lucha libre';
    } else if (isMaki) {
      target.stats.name = target === this.player ? (this.customPlayerName || 'Maki') : (this.customPlayer2Name || 'Maki');
      target.stats.subtitle = 'Maki (Speedster Ninja)';
      target.stats.punchDamage = 13;
      target.stats.kickDamage = 17;
      target.stats.throwDamage = 35;
      target.stats.speedX = 3.8;
      target.stats.speedZ = 2.3;
      target.stats.jumpPower = -7.5;
      target.stats.specialCost = 35;
      target.stats.signatureMove = 'Spinning Handstand Kick';
      target.stats.color = '#ef4444';
      target.stats.bio = 'Ninja de Bushinryu';
    } else {
      // Carlos
      target.stats.name = target === this.player ? (this.customPlayerName || 'Carlos') : (this.customPlayer2Name || 'Carlos');
      target.stats.subtitle = 'Carlos (Samurai Katana)';
      target.stats.punchDamage = 17;
      target.stats.kickDamage = 19;
      target.stats.throwDamage = 36;
      target.stats.speedX = 3.2;
      target.stats.speedZ = 2.0;
      target.stats.jumpPower = -7.2;
      target.stats.specialCost = 38;
      target.stats.signatureMove = 'Dancing Blade';
      target.stats.color = '#10b981';
      target.stats.bio = 'Maestro de la katana';
    }
  }

  public switchPartner() {
    const order: CharacterId[] = ['vaze', 'cody', 'haggar', 'maki', 'carlos'];
    const nextIdx = (order.indexOf(this.activeCharId) + 1) % order.length;
    this.setCharacter(order[nextIdx]);
    retroAudio.playPickup(false);
    this.triggerSpeechBubble(getRandomBasedQuote('tag'), 1.2);
    this.addFloatingText(this.player.x, this.player.z - 35, `¡TAG: ${this.player.stats.subtitle}!`, '#facc15');
    this.spawnSparks(this.player.x + 16, this.player.z, -15, '#facc15', 12);
  }

  public triggerSpeechBubble(text: string, duration: number = 1.3) {
    if (!this.player) return;
    this.player.speechBubble = {
      text,
      timer: duration,
      maxTimer: duration
    };
    retroAudio.playTextBlip();
  }

  public getCurrentSubArea(): SubAreaConfig {
    const stage = STAGES_CONFIG[this.currentStageIndex];
    if (stage.subAreas && stage.subAreas[this.currentSubAreaIndex]) {
      return stage.subAreas[this.currentSubAreaIndex];
    }
    return {
      subAreaIndex: 1,
      totalSubAreas: 1,
      name: stage.name,
      type: 'calle_comercial',
      levelLength: 620,
      enemyCount: 4,
      hasBoss: true,
      bossType: stage.bossType,
      ambientColor: '#0f172a'
    };
  }

  // --- REINTENTO DE NIVEL (FIX BUG CONTINUAR TRAS GAME OVER) ---
  public retryCurrentLevel() {
    this.gameState = 'PLAYING';
    const initialLives = this.difficulty === 'facil' ? 5 : this.difficulty === 'normal' ? 3 : 2;

    if (this.player) {
      this.player.stats.hp = this.player.stats.maxHp;
      this.player.stats.lives = initialLives;
      this.player.currentAction = 'idle';
      this.player.actionLockTimer = 0;
      this.player.invincibleTimer = 2.0;
      this.player.grabbedEnemyId = null;
      this.player.x = 40;
      this.player.z = 215;
      this.player.y = 0;
      this.player.vx = 0;
      this.player.vy = 0;
    }

    if (this.player2) {
      this.player2.stats.hp = this.player2.stats.maxHp;
      this.player2.stats.lives = initialLives;
      this.player2.currentAction = 'idle';
      this.player2.actionLockTimer = 0;
      this.player2.invincibleTimer = 2.0;
      this.player2.grabbedEnemyId = null;
      this.player2.x = 80;
      this.player2.z = 225;
      this.player2.y = 0;
      this.player2.vx = 0;
      this.player2.vy = 0;
    }

    this.resetLevel(this.currentStageIndex, this.currentSubAreaIndex);
    this.gameState = 'PLAYING';
    this.onStateChange?.('PLAYING');
    this.notifyPlayerUpdate(true);
    if (this.player2) {
      this.onPlayer2Update?.(this.player2);
    }
    this.startGame();
  }

  // --- INICIALIZACIÓN DE SUB-ÁREAS Y ETAPAS ---

  public resetLevel(stageIndex: number = 0, subAreaIndex: number = 0) {
    this.currentStageIndex = Math.max(0, Math.min(STAGES_CONFIG.length - 1, stageIndex));
    const stageData = STAGES_CONFIG[this.currentStageIndex];

    const subAreas = stageData.subAreas || [];
    this.currentSubAreaIndex = Math.max(0, Math.min(subAreas.length - 1, subAreaIndex));
    const subArea = this.getCurrentSubArea();

    this.levelLength = subArea.levelLength;
    this.cameraX = 0;
    this.hitstopTimer = 0;
    this.screenShakeTimer = 0;
    this.stageTimer = 99;
    this.currentAttackTokens = 0;
    this.isSubAreaCleared = false;
    this.goArrowTimer = 0;

    // Configurar vidas según dificultad
    const initialLives = this.difficulty === 'facil' ? 5 : this.difficulty === 'normal' ? 3 : 2;

    // Inicializar o reposicionar Jugador 1 en plano 2.5D
    if (!this.player) {
      this.player = {
        x: 40,
        z: 215,
        y: 0,
        vx: 0,
        vz: 0,
        vy: 0,
        width: 28,
        height: 44,
        facing: 1,
        isGrounded: true,
        stats: {
          id: this.activeCharId,
          name: this.customPlayerName || 'Basado',
          subtitle: 'VAZE: Rebelde Urbano - Fists & Speed',
          archetype: 'allrounder',
          maxHp: 100,
          hp: 100,
          speedX: 3.4,
          speedZ: 2.1,
          jumpPower: -7.2,
          punchDamage: 18,
          kickDamage: 22,
          throwDamage: 40,
          specialCost: 35,
          specialMeter: 40,
          maxSpecial: 100,
          lives: initialLives,
          score: this.score,
          color: '#ef4444',
          secondaryColor: '#f8fafc',
          bio: 'Rebelde urbano que lucha para rescatar a su PC Baby.',
          signatureMove: 'Neo-Furia'
        },
        currentAction: 'idle',
        animFrame: 0,
        animTimer: 0,
        comboTimer: 0,
        comboCount: 0,
        invincibleTimer: 0,
        actionLockTimer: 0,
        coyoteTimer: 0,
        jumpBufferTimer: 0,
        grabbedEnemyId: null,
        grabTimer: 0,
        grabHitsRemaining: 0
      };
    } else {
      this.player.x = 40;
      this.player.z = 215;
      this.player.y = 0;
      this.player.vx = 0;
      this.player.vz = 0;
      this.player.vy = 0;
      this.player.currentAction = 'idle';
      this.player.actionLockTimer = 0;
      this.player.grabbedEnemyId = null;
    }
    this.applyArchetypeStats(this.activeCharId, this.player);

    // Inicializar o reposicionar Jugador 2 si está en Modo 2 Jugadores
    if (this.gameMode === '2P') {
      if (!this.player2) {
        this.player2 = {
          x: 80,
          z: 225,
          y: 0,
          vx: 0,
          vz: 0,
          vy: 0,
          width: 32,
          height: 46,
          facing: 1,
          isGrounded: true,
          stats: {
            id: this.activeCharId2,
            name: this.customPlayer2Name || 'Haggar',
            subtitle: 'Haggar (Heavy Grappler)',
            archetype: 'grappler',
            maxHp: 100,
            hp: 100,
            speedX: 2.6,
            speedZ: 1.7,
            jumpPower: -6.8,
            punchDamage: 22,
            kickDamage: 24,
            throwDamage: 50,
            specialCost: 45,
            specialMeter: 40,
            maxSpecial: 100,
            lives: initialLives,
            score: this.scoreP2,
            color: '#eab308',
            secondaryColor: '#f8fafc',
            bio: 'Titán de la lucha libre',
            signatureMove: 'Spinning Clothesline'
          },
          currentAction: 'idle',
          animFrame: 0,
          animTimer: 0,
          comboTimer: 0,
          comboCount: 0,
          invincibleTimer: 0,
          actionLockTimer: 0,
          coyoteTimer: 0,
          jumpBufferTimer: 0,
          grabbedEnemyId: null,
          grabTimer: 0,
          grabHitsRemaining: 0
        };
      } else {
        this.player2.x = 80;
        this.player2.z = 225;
        this.player2.y = 0;
        this.player2.vx = 0;
        this.player2.vz = 0;
        this.player2.vy = 0;
        this.player2.currentAction = 'idle';
        this.player2.actionLockTimer = 0;
        this.player2.grabbedEnemyId = null;
      }
      this.applyArchetypeStats(this.activeCharId2, this.player2);
      this.onPlayer2Update?.(this.player2);
    } else {
      this.player2 = null;
      this.onPlayer2Update?.(null);
    }

    // Contenedores destructibles y atrezzo temático estilo Slum / Subway
    this.props = [
      { id: 'p1', x: 180, z: 195, y: 0, width: 28, height: 28, type: 'barrel', hp: 20, broken: false, drop: 'meat' },
      { id: 'p2', x: 340, z: 235, y: 0, width: 28, height: 28, type: 'crate', hp: 20, broken: false, drop: 'pizza' },
      { id: 'p3', x: 480, z: 200, y: 0, width: 28, height: 28, type: 'trashcan', hp: 25, broken: false, drop: 'soda' }
    ];

    // Coche chatarra destrozado o cabina telefónica según sub-área
    if (subArea.type === 'callejon_oscuro' || subArea.type === 'calle_comercial') {
      this.props.push({
        id: 'car1',
        x: 240,
        z: 190,
        y: 0,
        width: 52,
        height: 32,
        type: 'car',
        hp: 55,
        broken: false,
        drop: 'meat'
      });
      this.props.push({
        id: 'phone1',
        x: 410,
        z: 185,
        y: 0,
        width: 26,
        height: 44,
        type: 'phonebooth',
        hp: 35,
        broken: false,
        drop: 'bread'
      });
    }

    // Peligros ambientales en subterráneos o canales
    if (subArea.type === 'anden_subterraneo' || stageData.backgroundTheme === 'holland') {
      this.props.push({
        id: 'mine1',
        x: 290,
        z: 220,
        y: 0,
        width: 20,
        height: 10,
        type: 'mine',
        hp: 1,
        broken: false,
        drop: 'none'
      });
    }

    // GENERAR OLEADA DE ENEMIGOS SEGÚN DIFICULTAD Y SUB-ÁREA
    this.spawnSubAreaEnemies(subArea);

    this.pickups = [];
    this.particles = [];
    this.floatingTexts = [];
    this.notifyPlayerUpdate(true);
    this.onStageChange?.(this.currentStageIndex);
    this.onSubAreaChange?.(subArea);
  }

  // Generador de enemigos según dificultad
  private spawnSubAreaEnemies(subArea: SubAreaConfig) {
    this.enemies = [];

    // Ajustar número de enemigos según dificultad
    let count = subArea.enemyCount;
    if (this.difficulty === 'facil') count = Math.max(2, Math.floor(count * 0.7));
    else if (this.difficulty === 'dificil') count = Math.floor(count * 1.3);
    else if (this.difficulty === 'basado') count = Math.max(8, Math.floor(count * 2.2)); // Oleada masiva en Nivel Basado

    const typesList: EnemyType[] = ['schot', 'jack', 'bull', 'andore_jr', 'andore'];

    for (let i = 0; i < count; i++) {
      const type = typesList[i % typesList.length];
      const posX = 160 + (i * (this.levelLength - 260) / Math.max(1, count - 1)) + (Math.random() - 0.5) * 40;
      const posZ = this.Z_MIN + Math.random() * (this.Z_MAX - this.Z_MIN);
      this.enemies.push(this.createEnemy(`e_${i}`, type, Math.max(140, posX), posZ));
    }

    // Jefe final de la sub-área final
    if (subArea.hasBoss && subArea.bossType) {
      this.enemies.push(
        this.createEnemy('boss', subArea.bossType, this.levelLength - 100, 215, true)
      );
    }
  }

  private createEnemy(id: string, type: EnemyType, x: number, z: number, isBoss: boolean = false): EnemyEntity {
    const isAndore = type.includes('andore');
    let hp = 35;
    let name = 'Schot';
    let speed = 2.0;
    let scoreVal = 200;

    if (type === 'jack') { hp = 40; name = 'Jack'; speed = 2.1; scoreVal = 250; }
    else if (type === 'bull') { hp = 60; name = 'Bull'; speed = 1.8; scoreVal = 400; }
    else if (type === 'andore_jr') { hp = 90; name = 'Andore Jr'; speed = 1.7; scoreVal = 800; }
    else if (type === 'andore') { hp = 120; name = 'Andore'; speed = 1.6; scoreVal = 1200; }
    else if (type === 'g_andore') { hp = 160; name = 'Gran Andore'; speed = 1.5; scoreVal = 1800; }
    else if (isBoss) {
      hp = 260;
      name = STAGES_CONFIG[this.currentStageIndex].bossName;
      speed = 1.9;
      scoreVal = 5000;
    }

    // Multiplicadores según nivel de dificultad
    if (this.difficulty === 'facil') {
      hp = Math.round(hp * 0.75);
      speed *= 0.8;
    } else if (this.difficulty === 'dificil') {
      hp = Math.round(hp * 1.35);
      speed *= 1.25;
      scoreVal = Math.round(scoreVal * 1.5);
    } else if (this.difficulty === 'basado') {
      hp = Math.round(hp * 1.75);
      speed *= 1.55;
      scoreVal *= 3; // Recompensa triple en Nivel Basado
    }

    return {
      id,
      type,
      name,
      x,
      z,
      y: 0,
      vx: 0,
      vz: 0,
      vy: 0,
      width: isBoss || isAndore ? 34 : 26,
      height: isBoss || isAndore ? 48 : 40,
      facing: -1,
      isGrounded: true,
      maxHp: hp,
      hp,
      action: 'idle',
      animFrame: 0,
      animTimer: 0,
      attackCooldown: Math.random() * 40 + 20,
      windupTimer: 0,
      hurtTimer: 0,
      scoreValue: scoreVal,
      speed,
      targetZ: z,
      aiTimer: Math.random() * 0.8 + 0.2,
      hasAttackToken: false,
      isBoss
    };
  }

  public startGame() {
    this.gameState = 'PLAYING';
    this.onStateChange?.(this.gameState);
    retroAudio.startMusic();
    if (!this.isRunning) {
      this.startLoop();
    }
  }

  public togglePause() {
    if (this.gameState === 'PLAYING') {
      this.gameState = 'PAUSED';
      retroAudio.playMenuBeep();
    } else if (this.gameState === 'PAUSED') {
      this.gameState = 'PLAYING';
      retroAudio.playMenuBeep();
    }
    this.onStateChange?.(this.gameState);
  }

  public restartGame() {
    this.score = 0;
    this.resetLevel(0, 0);
    this.startGame();
  }

  // Avance físico tras ver el "¡SIGUE! ➔" y caminar al final del escenario
  public advanceSubArea() {
    const stage = STAGES_CONFIG[this.currentStageIndex];
    const subAreas = stage.subAreas || [];

    if (this.currentSubAreaIndex < subAreas.length - 1) {
      this.currentSubAreaIndex++;
      this.resetLevel(this.currentStageIndex, this.currentSubAreaIndex);
      retroAudio.playPickup(true);
      const newSubArea = this.getCurrentSubArea();
      this.triggerSpeechBubble(getRandomBasedQuote('combos'), 1.3);
      this.addFloatingText(this.player.x + 30, this.player.z - 40, `¡ENTRANDO: ${newSubArea.name.toUpperCase()}!`, '#38bdf8');
    } else {
      this.nextStage();
    }
  }

  public nextStage() {
    if (this.currentStageIndex < STAGES_CONFIG.length - 1) {
      this.currentStageIndex++;
      this.resetLevel(this.currentStageIndex, 0);
      this.startGame();
    } else {
      this.gameState = 'VICTORY';
      this.onStateChange?.(this.gameState);
    }
  }

  public startLoop() {
    this.isRunning = true;
    this.lastTime = performance.now();
    const frame = (time: number) => {
      const rawDt = (time - this.lastTime) / 1000;
      this.lastTime = time;
      const dt = Math.min(rawDt, 0.05);

      this.update(dt);
      this.render();

      this.animId = requestAnimationFrame(frame);
    };
    this.animId = requestAnimationFrame(frame);
  }

  public stopLoop() {
    this.isRunning = false;
    if (this.animId) {
      cancelAnimationFrame(this.animId);
    }
  }

  // --- LÓGICA DE ACTUALIZACIÓN DEL JUEGO (60 FPS) ---

  private update(dt: number) {
    this.gatherInput();
    gamepadManager.poll(this.input, this.inputP2);

    if (this.input.pauseJustPressed || this.inputP2.pauseJustPressed) {
      this.togglePause();
    }

    if (this.input.switchPartnerJustPressed && this.gameState === 'PLAYING') {
      this.switchPartner();
    }

    if (this.gameState !== 'PLAYING') return;

    this.goArrowTimer += dt;

    // Hitstop (pausa de impacto arcade)
    if (this.hitstopTimer > 0) {
      this.hitstopTimer -= dt;
      return;
    }

    if (this.screenShakeTimer > 0) {
      this.screenShakeTimer -= dt;
    }

    if (this.lightningTimer > 0) {
      this.lightningTimer -= dt;
    } else if (STAGES_CONFIG[this.currentStageIndex].backgroundTheme === 'japan' && Math.random() < 0.005) {
      this.lightningTimer = 0.15; // Relámpago de tormenta en Japón
      this.screenShake(0.15, 2);
    }

    // Actualizar jugador 1
    this.updatePlayer(dt);

    // Actualizar jugador 2 si está en Modo Cooperativo
    if (this.player2 && this.gameMode === '2P') {
      this.updatePlayer2(dt);
    }

    // Actualizar IA de enemigos (Autónoma con tokens)
    this.updateEnemies(dt);

    // Actualizar pickups y partículas
    this.updatePickups(dt);
    this.updateParticles(dt);
    this.updateFloatingTexts(dt);

    // Cámara de avance lateral
    this.updateCamera();

    this.clearJustPressedInputs();
    this.notifyPlayerUpdate(false);
  }

  // Throttling de notificación para mantener 60 FPS sin saturar React
  private notifyPlayerUpdate(force: boolean = false) {
    const now = performance.now();
    if (force || now - this.lastUiNotifyTime > 80) { // ~12 fps para el HUD
      this.lastUiNotifyTime = now;
      this.onPlayerUpdate?.(this.player);
      if (this.player2 && this.gameMode === '2P') {
        this.onPlayer2Update?.(this.player2);
      }
    }
  }

  private gatherInput() {
    const k = this.keysHeld;
    const jp = this.keysJustPressed;
    const p1Cfg = this.keyConfig.p1;
    const p2Cfg = this.keyConfig.p2;

    // --- ENTRADAS JUGADOR 1 (Configuración de Teclado + Táctil) ---
    this.input.left = k.has(p1Cfg.left) || k.has('KeyA') || this.touchInput.left;
    this.input.right = k.has(p1Cfg.right) || k.has('KeyD') || this.touchInput.right;
    this.input.up = k.has(p1Cfg.up) || k.has('KeyW') || this.touchInput.up;
    this.input.down = k.has(p1Cfg.down) || k.has('KeyS') || this.touchInput.down;

    this.input.jump = k.has(p1Cfg.jump) || k.has('Space') || this.touchInput.jump;
    this.input.jumpJustPressed = jp.has(p1Cfg.jump) || jp.has('Space') || this.touchInput.jumpJustPressed;

    this.input.punch = k.has(p1Cfg.punch) || k.has('KeyJ') || this.touchInput.punch;
    this.input.punchJustPressed = jp.has(p1Cfg.punch) || jp.has('KeyJ') || this.touchInput.punchJustPressed;

    this.input.kick = k.has(p1Cfg.kick) || k.has('KeyK') || this.touchInput.kick;
    this.input.kickJustPressed = jp.has(p1Cfg.kick) || jp.has('KeyK') || this.touchInput.kickJustPressed;

    this.input.special = k.has(p1Cfg.special) || k.has('KeyL') || (this.input.punch && this.input.jump) || this.touchInput.special;
    this.input.specialJustPressed = jp.has(p1Cfg.special) || jp.has('KeyL') || (jp.has(p1Cfg.punch) && jp.has(p1Cfg.jump)) || this.touchInput.specialJustPressed;

    if (p1Cfg.tag && jp.has(p1Cfg.tag)) {
      this.input.switchPartnerJustPressed = true;
    }
    if (this.touchInput.switchPartnerJustPressed) {
      this.input.switchPartnerJustPressed = true;
    }
    if (this.touchInput.pauseJustPressed) {
      this.input.pauseJustPressed = true;
    }

    // --- ENTRADAS JUGADOR 2 (Configuración de Teclado P2 / Numpad / Flechas) ---
    this.inputP2.left = k.has(p2Cfg.left) || k.has('ArrowLeft');
    this.inputP2.right = k.has(p2Cfg.right) || k.has('ArrowRight');
    this.inputP2.up = k.has(p2Cfg.up) || k.has('ArrowUp');
    this.inputP2.down = k.has(p2Cfg.down) || k.has('ArrowDown');

    this.inputP2.jump = k.has(p2Cfg.jump) || k.has('Numpad0') || k.has('KeyO');
    this.inputP2.jumpJustPressed = jp.has(p2Cfg.jump) || jp.has('Numpad0') || jp.has('KeyO');

    this.inputP2.punch = k.has(p2Cfg.punch) || k.has('Numpad1') || k.has('KeyU');
    this.inputP2.punchJustPressed = jp.has(p2Cfg.punch) || jp.has('Numpad1') || jp.has('KeyU');

    this.inputP2.kick = k.has(p2Cfg.kick) || k.has('Numpad2') || k.has('KeyI');
    this.inputP2.kickJustPressed = jp.has(p2Cfg.kick) || jp.has('Numpad2') || jp.has('KeyI');

    this.inputP2.special = k.has(p2Cfg.special) || k.has('Numpad3') || k.has('KeyP') || (this.inputP2.punch && this.inputP2.jump);
    this.inputP2.specialJustPressed = jp.has(p2Cfg.special) || jp.has('Numpad3') || jp.has('KeyP') || (jp.has(p2Cfg.punch) && jp.has(p2Cfg.jump));
  }

  private clearJustPressedInputs() {
    this.keysJustPressed.clear();
    this.input.jumpJustPressed = false;
    this.input.punchJustPressed = false;
    this.input.kickJustPressed = false;
    this.input.specialJustPressed = false;
    this.input.pauseJustPressed = false;
    this.input.switchPartnerJustPressed = false;

    this.inputP2.jumpJustPressed = false;
    this.inputP2.punchJustPressed = false;
    this.inputP2.kickJustPressed = false;
    this.inputP2.specialJustPressed = false;
    this.inputP2.pauseJustPressed = false;
    this.inputP2.switchPartnerJustPressed = false;

    // Limpiar también transitorios táctiles
    this.touchInput.jumpJustPressed = false;
    this.touchInput.punchJustPressed = false;
    this.touchInput.kickJustPressed = false;
    this.touchInput.specialJustPressed = false;
    this.touchInput.pauseJustPressed = false;
    this.touchInput.switchPartnerJustPressed = false;
  }

  // --- LÓGICA DEL JUGADOR (MOVIMIENTO 2.5D, CLINCH, COMBOS) ---

  private updatePlayer(dt: number) {
    const p = this.player;

    // Timer de burbuja de frase basada
    if (p.speechBubble) {
      p.speechBubble.timer -= dt;
      if (p.speechBubble.timer <= 0) p.speechBubble = null;
    }

    if (p.invincibleTimer > 0) p.invincibleTimer -= dt;
    if (p.actionLockTimer > 0) p.actionLockTimer -= dt;

    // Verificación de avance hacia el siguiente mapa tras despejar ("¡SIGUE! ➔")
    if (this.isSubAreaCleared && p.x >= this.levelLength - 40) {
      this.advanceSubArea();
      return;
    }

    // Si el jugador está agarrando a un enemigo (CLINCH AUTOMÁTICO)
    if (p.grabbedEnemyId) {
      this.updatePlayerClinch(dt);
      return;
    }

    // Bloqueo de acción (durante ejecución de golpe, lanzamiento o daño)
    if (p.actionLockTimer > 0) {
      if (!p.isGrounded) {
        p.vy += 18 * dt; // Gravedad
        p.y += p.vy;
        p.x += p.vx * dt * 60;
        if (p.y >= 0) {
          p.y = 0;
          p.vy = 0;
          p.isGrounded = true;
          p.currentAction = 'idle';
        }
      }
      return;
    }

    // FÍSICA Y MOVIMIENTO EN PLANO 2.5D
    let moveX = 0;
    let moveZ = 0;

    if (this.input.left) moveX -= 1;
    if (this.input.right) moveX += 1;
    if (this.input.up) moveZ -= 1;
    if (this.input.down) moveZ += 1;

    // Normalizar dirección diagonal
    if (moveX !== 0 && moveZ !== 0) {
      moveX *= 0.7071;
      moveZ *= 0.7071;
    }

    if (p.isGrounded) {
      p.vx = moveX * p.stats.speedX;
      p.vz = moveZ * p.stats.speedZ;
      p.x += p.vx;
      p.z += p.vz;

      if (moveX !== 0) p.facing = moveX > 0 ? 1 : -1;

      // Animación de caminar o idle
      if (moveX !== 0 || moveZ !== 0) {
        p.currentAction = 'walk';
        p.animTimer += dt;
        if (p.animTimer > 0.12) {
          p.animTimer = 0;
          p.animFrame = (p.animFrame + 1) % 4;
        }
      } else {
        p.currentAction = 'idle';
        p.animTimer += dt;
        if (p.animTimer > 0.3) {
          p.animTimer = 0;
          p.animFrame = (p.animFrame + 1) % 2;
        }
      }

      // Check automático de CLINCH por proximidad en el mismo plano Z
      this.checkAutomaticClinch();
    } else {
      // Movimiento aéreo
      p.vy += 18 * dt;
      p.y += p.vy;
      p.x += p.vx;

      if (p.y >= 0) {
        p.y = 0;
        p.vy = 0;
        p.isGrounded = true;
        p.currentAction = 'idle';
      }
    }

    // Contención dentro del plano 2.5D
    p.z = Math.max(this.Z_MIN, Math.min(this.Z_MAX, p.z));

    // Si la zona está despejada, permitimos caminar hasta el borde derecho para salir
    const maxX = this.isSubAreaCleared ? this.levelLength : Math.min(this.cameraX + this.V_WIDTH - 20, this.levelLength - 20);
    p.x = Math.max(this.cameraX + 10, Math.min(maxX, p.x));

    // ACCIONES DE COMBATE
    if (this.input.specialJustPressed && p.stats.specialMeter >= p.stats.specialCost) {
      this.executePlayerSpecial();
    } else if (this.input.punchJustPressed) {
      this.executePlayerPunch();
    } else if (this.input.kickJustPressed) {
      this.executePlayerKick();
    } else if (this.input.jumpJustPressed && p.isGrounded) {
      this.executePlayerJump();
    }
  }

  // --- LÓGICA DEL JUGADOR 2 (CO-OP MULTIJUGADOR) ---
  private updatePlayer2(dt: number) {
    const p = this.player2;
    if (!p) return;

    if (p.speechBubble) {
      p.speechBubble.timer -= dt;
      if (p.speechBubble.timer <= 0) p.speechBubble = null;
    }

    if (p.invincibleTimer > 0) p.invincibleTimer -= dt;
    if (p.actionLockTimer > 0) p.actionLockTimer -= dt;

    if (p.actionLockTimer > 0) {
      if (!p.isGrounded) {
        p.vy += 18 * dt;
        p.y += p.vy;
        p.x += p.vx * dt * 60;
        if (p.y >= 0) {
          p.y = 0;
          p.vy = 0;
          p.isGrounded = true;
          p.currentAction = 'idle';
        }
      }
      return;
    }

    let moveX = 0;
    let moveZ = 0;

    if (this.inputP2.left) moveX -= 1;
    if (this.inputP2.right) moveX += 1;
    if (this.inputP2.up) moveZ -= 1;
    if (this.inputP2.down) moveZ += 1;

    if (moveX !== 0 && moveZ !== 0) {
      moveX *= 0.7071;
      moveZ *= 0.7071;
    }

    if (p.isGrounded) {
      p.vx = moveX * p.stats.speedX;
      p.vz = moveZ * p.stats.speedZ;
      p.x += p.vx;
      p.z += p.vz;

      if (moveX !== 0) p.facing = moveX > 0 ? 1 : -1;

      if (moveX !== 0 || moveZ !== 0) {
        p.currentAction = 'walk';
        p.animTimer += dt;
        if (p.animTimer > 0.12) {
          p.animTimer = 0;
          p.animFrame = (p.animFrame + 1) % 4;
        }
      } else {
        p.currentAction = 'idle';
        p.animTimer += dt;
        if (p.animTimer > 0.3) {
          p.animTimer = 0;
          p.animFrame = (p.animFrame + 1) % 2;
        }
      }
    } else {
      p.vy += 18 * dt;
      p.y += p.vy;
      p.x += p.vx;
      if (p.y >= 0) {
        p.y = 0;
        p.vy = 0;
        p.isGrounded = true;
        p.currentAction = 'idle';
      }
    }

    p.z = Math.max(this.Z_MIN, Math.min(this.Z_MAX, p.z));
    const maxX = this.isSubAreaCleared ? this.levelLength : Math.min(this.cameraX + this.V_WIDTH - 20, this.levelLength - 20);
    p.x = Math.max(this.cameraX + 10, Math.min(maxX, p.x));

    if (this.inputP2.specialJustPressed && p.stats.specialMeter >= p.stats.specialCost) {
      this.executePlayerSpecial(p, true);
    } else if (this.inputP2.punchJustPressed) {
      this.executePlayerPunch(p, true);
    } else if (this.inputP2.kickJustPressed) {
      this.executePlayerKick(p, true);
    } else if (this.inputP2.jumpJustPressed && p.isGrounded) {
      this.executePlayerJump(p);
    }
  }

  // --- CLINCH (AGARRE AUTOMÁTICO) ---
  private checkAutomaticClinch() {
    const p = this.player;
    if (p.grabbedEnemyId || !p.isGrounded) return;

    for (const enemy of this.enemies) {
      if (enemy.hp <= 0 || enemy.action === 'thrown' || enemy.action === 'grabbed' || enemy.isBoss) continue;

      const sameZ = Math.abs(p.z - enemy.z) <= 8; // Mismo plano de profundidad Z
      const inFrontX = p.facing === 1 ? (enemy.x > p.x && enemy.x - p.x < 24) : (enemy.x < p.x && p.x - enemy.x < 24);

      if (sameZ && inFrontX) {
        // ACTIVAR CLINCH
        p.grabbedEnemyId = enemy.id;
        p.grabTimer = 2.5; // Tiempo límite para decidir rodillazos o lanzamiento
        p.grabHitsRemaining = 3; // Máximo 3 rodillazos antes de soltar o lanzar
        p.currentAction = 'clinch';
        enemy.action = 'grabbed';
        enemy.facing = p.facing === 1 ? -1 : 1;

        retroAudio.playClinch();
        this.triggerSpeechBubble(getRandomBasedQuote('clinch'), 1.2);
        this.addFloatingText(p.x, p.z - 30, '¡AGARRE!', '#f59e0b');
        break;
      }
    }
  }

  private updatePlayerClinch(dt: number) {
    const p = this.player;
    const enemy = this.enemies.find(e => e.id === p.grabbedEnemyId);

    if (!enemy || enemy.hp <= 0) {
      p.grabbedEnemyId = null;
      p.currentAction = 'idle';
      return;
    }

    // Posicionar al enemigo firmemente en las manos del jugador
    enemy.x = p.x + (p.facing * 18);
    enemy.z = p.z;
    enemy.y = 0;
    enemy.action = 'grabbed';

    p.grabTimer -= dt;

    // Si se acaba el tiempo, el enemigo se zafa
    if (p.grabTimer <= 0) {
      p.grabbedEnemyId = null;
      p.currentAction = 'idle';
      enemy.action = 'idle';
      return;
    }

    // 1. Lanzamiento / Suplex (Dirección contraria + Ataque)
    const throwInput = (p.facing === 1 && this.input.left) || (p.facing === -1 && this.input.right);

    if (this.input.punchJustPressed || this.input.kickJustPressed) {
      if (throwInput || this.input.kickJustPressed) {
        // EJECUTAR LANZAMIENTO / SUPLEX (DAÑO EN ÁREA AOE)
        this.executePlayerThrow(enemy);
      } else {
        // EJECUTAR GOLPE DE CLINCH (RODILLAZO O CABEZAZO)
        this.executeClinchStrike(enemy);
      }
    }
  }

  private executeClinchStrike(enemy: EnemyEntity) {
    const p = this.player;
    p.grabHitsRemaining--;
    p.grabTimer = 2.0; // Refrescar timer

    const damage = p.stats.archetype === 'grappler' ? 18 : 14;
    enemy.hp -= damage;
    p.stats.specialMeter = Math.min(p.stats.maxSpecial, p.stats.specialMeter + 8);
    this.score += 200;
    this.onScoreUpdate?.(this.score);

    retroAudio.playHeavyPunch();
    gamepadManager.triggerHaptic(100, 0.4, 0.5);
    this.screenShake(0.1, 2);
    this.spawnSparks(enemy.x, enemy.z, -10, '#f59e0b', 8);

    if (enemy.hp <= 0 || p.grabHitsRemaining <= 0) {
      // Tercer golpe: lanzamiento final
      this.executePlayerThrow(enemy);
    }
  }

  private executePlayerThrow(enemy: EnemyEntity) {
    const p = this.player;
    const throwDir = p.facing === 1 ? -1 : 1; // Lanzamiento por encima de la cabeza

    p.grabbedEnemyId = null;
    p.currentAction = 'idle';
    p.actionLockTimer = 0.25;

    enemy.action = 'thrown';
    enemy.vx = throwDir * 6.5;
    enemy.vy = -5.0; // Trayectoria parabólica
    enemy.hp -= p.stats.throwDamage;

    retroAudio.playSlam();
    gamepadManager.triggerHaptic(160, 0.6, 0.7);
    this.screenShake(0.25, 4);
    this.triggerSpeechBubble(getRandomBasedQuote('throws'), 1.4);
    this.addFloatingText(enemy.x, enemy.z - 30, '¡SUPLEX BASADO!', '#ef4444');

    // DAÑO EN ÁREA (AoE): El enemigo lanzado es un proyectil que derriba a otros
    setTimeout(() => {
      for (const other of this.enemies) {
        if (other.id === enemy.id || other.hp <= 0) continue;
        const samePlane = Math.abs(other.z - enemy.z) < 18;
        const inPath = Math.abs(other.x - enemy.x) < 45;

        if (samePlane && inPath) {
          other.hp -= 25;
          other.action = 'thrown';
          other.vx = throwDir * 3.5;
          other.vy = -3.5;
          this.spawnSparks(other.x, other.z, 0, '#f97316', 10);
        }
      }
    }, 150);
  }

  private executePlayerJump(p: PlayerEntity = this.player) {
    p.isGrounded = false;
    p.vy = p.stats.jumpPower;
    p.currentAction = 'jump';
    retroAudio.playJump();
  }

  private executePlayerPunch(p: PlayerEntity = this.player, isP2: boolean = false) {
    p.comboTimer = 0.45;
    p.comboCount = (p.comboCount % 3) + 1;

    let damage = p.stats.punchDamage;
    let isHeavy = false;

    if (p.comboCount === 1) {
      p.currentAction = 'punch1';
      retroAudio.playPunch();
    } else if (p.comboCount === 2) {
      p.currentAction = 'punch2';
      damage *= 1.25;
      retroAudio.playPunch();
    } else {
      p.currentAction = 'punch3';
      damage *= 1.8;
      isHeavy = true;
      retroAudio.playHeavyPunch();
      this.triggerSpeechBubble(getRandomBasedQuote('combos'), 1.2);
    }

    p.actionLockTimer = isHeavy ? 0.22 : 0.16;

    const hitbox: Hitbox = {
      x: p.facing === 1 ? p.x + p.width : p.x - 24,
      z: p.z,
      y: p.y,
      width: 24,
      depth: 14,
      height: 20,
      damage: Math.round(damage),
      knockbackX: (isHeavy ? 5.5 : 2.5) * p.facing,
      knockbackZ: 0,
      knockbackY: isHeavy ? -3.5 : -1,
      isHeavy,
      attackerId: isP2 ? 'player2' : 'player'
    };

    this.checkHitbox(hitbox);
  }

  private executePlayerKick(p: PlayerEntity = this.player, isP2: boolean = false) {
    const isAir = !p.isGrounded;
    p.currentAction = isAir ? 'jumpkick' : 'kick';
    p.actionLockTimer = isAir ? 0.28 : 0.22;

    const damage = isAir ? p.stats.kickDamage * 1.4 : p.stats.kickDamage;
    retroAudio.playKick();

    if (isAir) {
      p.vx = 4.2 * p.facing;
    }

    const hitbox: Hitbox = {
      x: p.facing === 1 ? p.x + p.width : p.x - 26,
      z: p.z,
      y: p.y,
      width: 26,
      depth: 16,
      height: 22,
      damage: Math.round(damage),
      knockbackX: (isAir ? 5.0 : 3.5) * p.facing,
      knockbackZ: 0,
      knockbackY: isAir ? -4 : -1.5,
      isHeavy: isAir,
      attackerId: isP2 ? 'player2' : 'player'
    };

    this.checkHitbox(hitbox);
  }

  private executePlayerSpecial(p: PlayerEntity = this.player, isP2: boolean = false) {
    p.stats.specialMeter -= p.stats.specialCost;
    p.currentAction = 'special';
    p.actionLockTimer = 0.45;
    p.invincibleTimer = 0.55;

    if (p.stats.id === 'vaze') {
      retroAudio.playSpecial();
    } else if (p.stats.id === 'cody' || p.stats.archetype === 'speedster' || p.stats.archetype === 'grappler') {
      retroAudio.playWhirlwind();
    } else {
      retroAudio.playKatanaSlash();
    }

    gamepadManager.triggerHaptic(180, 0.8, 0.9);
    this.screenShake(0.3, 5);
    this.triggerSpeechBubble(getRandomBasedQuote('specials'), 1.8);

    const hitbox: Hitbox = {
      x: p.x - 45,
      z: p.z,
      y: p.y,
      width: p.width + 90,
      depth: 32,
      height: 28,
      damage: 55,
      knockbackX: 6.5 * p.facing,
      knockbackZ: 0,
      knockbackY: -5,
      isHeavy: true,
      attackerId: isP2 ? 'player2' : 'player'
    };

    this.checkHitbox(hitbox);
  }

  private checkHitbox(hitbox: Hitbox) {
    let hitSomeone = false;

    // 1. Golpear enemigos
    for (const enemy of this.enemies) {
      if (enemy.hp <= 0 || enemy.action === 'grabbed' || enemy.action === 'thrown') continue;

      const hitX = hitbox.x + hitbox.width > enemy.x && hitbox.x < enemy.x + enemy.width;
      const hitZ = Math.abs(hitbox.z - enemy.z) <= hitbox.depth;

      if (hitX && hitZ) {
        this.damageEnemy(enemy, hitbox);
        hitSomeone = true;
      }
    }

    // 2. Romper contenedores y detonar minas
    for (const prop of this.props) {
      if (prop.broken) continue;

      const hitX = hitbox.x + hitbox.width > prop.x && hitbox.x < prop.x + prop.width;
      const hitZ = Math.abs(hitbox.z - prop.z) <= hitbox.depth + 6;

      if (hitX && hitZ) {
        prop.hp -= hitbox.damage;
        if (prop.hp <= 0) {
          prop.broken = true;
          this.breakProp(prop);
        } else {
          this.spawnSparks(prop.x + 12, prop.z, 0, '#fbbf24', 4);
        }
        hitSomeone = true;
      }
    }

    if (hitSomeone) {
      this.hitstopTimer = hitbox.isHeavy ? 0.08 : 0.04;
    }
  }

  private damageEnemy(enemy: EnemyEntity, hitbox: Hitbox) {
    enemy.hp -= hitbox.damage;
    enemy.action = hitbox.isHeavy ? 'knocked' : 'hurt';
    enemy.hurtTimer = hitbox.isHeavy ? 0.35 : 0.22;
    enemy.vx = hitbox.knockbackX;
    enemy.vy = hitbox.knockbackY;

    const isP2 = hitbox.attackerId === 'player2';
    const targetPlayer = (isP2 && this.player2) ? this.player2 : this.player;

    if (isP2) {
      this.scoreP2 += hitbox.isHeavy ? 150 : 80;
    } else {
      this.score += hitbox.isHeavy ? 150 : 80;
      this.onScoreUpdate?.(this.score);
    }

    targetPlayer.stats.specialMeter = Math.min(
      targetPlayer.stats.maxSpecial,
      targetPlayer.stats.specialMeter + (hitbox.isHeavy ? 10 : 5)
    );

    this.spawnSparks(enemy.x + enemy.width / 2, enemy.z, enemy.y - 15, '#facc15', hitbox.isHeavy ? 14 : 7);
    this.addFloatingText(enemy.x, enemy.z - 20, `${hitbox.damage}`, hitbox.isHeavy ? '#ef4444' : '#facc15');

    if (enemy.hp <= 0) {
      if (isP2) {
        this.scoreP2 += enemy.scoreValue;
      } else {
        this.score += enemy.scoreValue;
        this.onScoreUpdate?.(this.score);
      }
      retroAudio.playKO();

      if (Math.random() < 0.6) {
        this.triggerSpeechBubble(getRandomBasedQuote('kos'), 1.3);
      }
    }
  }

  private breakProp(prop: PropEntity) {
    if (prop.type === 'mine') {
      // Mina terrestre: explosión que daña a todos cerca
      retroAudio.playSlam();
      this.screenShake(0.3, 6);
      this.spawnSparks(prop.x, prop.z, 0, '#ef4444', 24);
      this.addFloatingText(prop.x, prop.z - 20, '¡BOOM!', '#ef4444');

      if (Math.abs(this.player.x - prop.x) < 40 && Math.abs(this.player.z - prop.z) < 20) {
        this.player.stats.hp -= 20;
        this.player.currentAction = 'hurt';
      }
      for (const e of this.enemies) {
        if (Math.abs(e.x - prop.x) < 45 && Math.abs(e.z - prop.z) < 25) {
          e.hp -= 40;
          e.action = 'hurt';
        }
      }
      return;
    }

    this.score += 150;
    this.onScoreUpdate?.(this.score);

    if (prop.drop !== 'none') {
      const dropType = prop.drop as 'meat' | 'pizza' | 'bread' | 'soda';
      this.pickups.push({
        id: `pick_${Date.now()}_${Math.random()}`,
        x: prop.x + 6,
        z: prop.z,
        y: -10,
        vx: (Math.random() - 0.5) * 2,
        vy: -3.5,
        type: dropType,
        value: dropType === 'meat' ? 100 : dropType === 'pizza' ? 50 : dropType === 'bread' ? 25 : 12,
        isGrounded: false,
        bounceCount: 0
      });
    }
  }

  // --- INTELIGENCIA ARTIFICIAL AUTÓNOMA (ATTACK TOKEN MANAGER Y DIFICULTAD) ---

  private updateEnemies(dt: number) {
    const p = this.player;
    this.currentAttackTokens = 0;

    // Tokens máximos según dificultad
    const maxTokens =
      this.difficulty === 'facil' ? 1 : this.difficulty === 'normal' ? 2 : this.difficulty === 'dificil' ? 3 : 5;

    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const e = this.enemies[i];

      if (e.hp <= 0) {
        e.action = 'knocked';
        e.vy += 18 * dt;
        e.y += e.vy;
        e.x += e.vx;
        if (e.y > 60) {
          this.enemies.splice(i, 1);
        }
        continue;
      }

      if (e.action === 'grabbed') continue;

      if (e.action === 'thrown') {
        e.vy += 18 * dt;
        e.y += e.vy;
        e.x += e.vx;
        if (e.y >= 0) {
          e.y = 0;
          e.vy = 0;
          e.action = 'hurt';
          e.hurtTimer = 0.3;
        }
        continue;
      }

      if (e.hurtTimer > 0) {
        e.hurtTimer -= dt;
        e.x += e.vx;
        e.vx *= 0.85;
        if (e.hurtTimer <= 0) e.action = 'idle';
        continue;
      }

      // LA IA SE MUEVE POR SÍ MISMA EN TODO MOMENTO (AUTÓNOMA)
      e.aiTimer -= dt;
      if (e.aiTimer <= 0) {
        e.aiTimer = Math.random() * 0.6 + 0.3;
        const zOffset = (Math.random() - 0.5) * 36;
        e.targetZ = Math.max(this.Z_MIN, Math.min(this.Z_MAX, p.z + zOffset));
      }

      const dx = p.x - e.x;
      const dz = p.z - e.z;
      const dist = Math.hypot(dx, dz);

      if (dist < 180 && this.currentAttackTokens < maxTokens) {
        e.hasAttackToken = true;
        this.currentAttackTokens++;
      } else {
        e.hasAttackToken = false;
      }

      e.facing = p.x > e.x ? 1 : -1;

      if (e.attackCooldown > 0) e.attackCooldown -= dt * 60;
      if (e.windupTimer > 0) {
        e.windupTimer -= dt;
        if (e.windupTimer <= 0) {
          this.enemyExecuteAttack(e);
        }
      } else {
        const nearX = Math.abs(dx) < 28;
        const nearZ = Math.abs(dz) < 12;

        if (e.hasAttackToken) {
          if (nearX && nearZ) {
            if (e.attackCooldown <= 0) {
              e.action = 'windup';
              e.windupTimer = e.isBoss ? 0.35 : (this.difficulty === 'basado' ? 0.12 : 0.25);
              e.attackCooldown = this.difficulty === 'basado' ? 30 : Math.random() * 70 + 60;
            } else {
              e.action = 'idle';
            }
          } else {
            e.action = 'walk';
            e.vx = (dx > 0 ? 1 : -1) * e.speed;
            e.vz = (dz > 0 ? 1 : -1) * (e.speed * 0.6);
            e.x += e.vx;
            e.z += e.vz;
          }
        } else {
          // Flanqueo circular autónomo
          e.action = 'flank';
          const idealDist = 75;
          const targetX = p.x + (dx > 0 ? -idealDist : idealDist);
          const fdx = targetX - e.x;
          const fdz = e.targetZ - e.z;

          e.vx = Math.sign(fdx) * (e.speed * 0.7);
          e.vz = Math.sign(fdz) * (e.speed * 0.5);
          e.x += e.vx;
          e.z += e.vz;
        }
      }

      e.z = Math.max(this.Z_MIN, Math.min(this.Z_MAX, e.z));
    }

    // CHECK DE DESPEJE DE SUB-ÁREA: Si no quedan enemigos, activar "¡SIGUE! ➔"
    if (this.enemies.length === 0 && !this.isSubAreaCleared) {
      this.isSubAreaCleared = true;
      this.goArrowTimer = 0;
      retroAudio.playPickup(false);
      this.triggerSpeechBubble("¡ZONA DESPEJADA! ¡VAMOS!", 1.5);
      this.addFloatingText(this.player.x + 30, this.player.z - 35, '¡SIGUE HACIA LA DERECHA! ➔', '#facc15');
    }
  }

  private enemyExecuteAttack(enemy: EnemyEntity) {
    const p = this.player;
    enemy.action = 'attack';
    setTimeout(() => {
      if (enemy.hp > 0 && enemy.action === 'attack') enemy.action = 'idle';
    }, 200);

    const nearX = Math.abs(p.x - enemy.x) < 32;
    const nearZ = Math.abs(p.z - enemy.z) < 14;

    if (nearX && nearZ && p.invincibleTimer <= 0) {
      let baseDmg = enemy.isBoss ? 20 : enemy.type.includes('andore') ? 16 : 9;
      if (this.difficulty === 'facil') baseDmg *= 0.65;
      else if (this.difficulty === 'dificil') baseDmg *= 1.3;
      else if (this.difficulty === 'basado') baseDmg *= 1.8;

      p.stats.hp -= Math.round(baseDmg);
      p.currentAction = 'hurt';
      p.actionLockTimer = 0.25;
      p.invincibleTimer = 0.6;

      retroAudio.playHurt();
      this.screenShake(0.2, 3);
      this.spawnSparks(p.x + p.width / 2, p.z, -15, '#ef4444', 10);
      this.addFloatingText(p.x, p.z - 25, `-${Math.round(baseDmg)}`, '#ef4444');

      if (p.stats.hp <= 0) {
        p.stats.lives--;
        if (p.stats.lives >= 0) {
          p.stats.hp = p.stats.maxHp;
          p.invincibleTimer = 2.0;
          this.triggerSpeechBubble("¡REVIVÍ CON PURA FIBRA!", 1.5);
          this.addFloatingText(p.x, p.z - 40, '¡VIDA EXTRA USADA!', '#10b981');
        } else {
          this.gameState = 'GAME_OVER';
          this.onStateChange?.(this.gameState);
        }
      }
    }
  }

  // --- PICKUPS, PARTÍCULAS Y TEXTOS ---

  private updatePickups(dt: number) {
    const p = this.player;

    for (let i = this.pickups.length - 1; i >= 0; i--) {
      const pick = this.pickups[i];

      if (!pick.isGrounded) {
        pick.vy += 12 * dt;
        pick.y += pick.vy;
        pick.x += pick.vx;

        if (pick.y >= 0) {
          pick.y = 0;
          pick.bounceCount++;
          if (pick.bounceCount < 2) {
            pick.vy = -2.0;
          } else {
            pick.isGrounded = true;
          }
        }
      }

      // Recolección por Jugador 1 o Jugador 2
      const targets = [this.player];
      if (this.player2 && this.gameMode === '2P') targets.push(this.player2);

      for (const target of targets) {
        const nearX = Math.abs(target.x - pick.x) < 22;
        const nearZ = Math.abs(target.z - pick.z) < 14;

        if (nearX && nearZ) {
          target.stats.hp = Math.min(target.stats.maxHp, target.stats.hp + pick.value);
          if (target === this.player2) {
            this.scoreP2 += pick.value * 20;
          } else {
            this.score += pick.value * 20;
            this.onScoreUpdate?.(this.score);
          }

          retroAudio.playPickup(true);
          this.triggerSpeechBubble(getRandomBasedQuote('food'), 1.3);
          this.addFloatingText(pick.x, pick.z - 25, `+${pick.value} HP`, '#10b981');
          this.spawnSparks(pick.x, pick.z, 0, '#34d399', 8);

          this.pickups.splice(i, 1);
          break;
        }
      }
    }
  }

  private updateParticles(dt: number) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const pt = this.particles[i];
      pt.life -= dt;
      pt.x += pt.vx;
      pt.y += pt.vy;
      if (pt.life <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  private updateFloatingTexts(dt: number) {
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.life -= dt;
      ft.y -= 24 * dt;
      if (ft.life <= 0) {
        this.floatingTexts.splice(i, 1);
      }
    }
  }

  private updateCamera() {
    let focusX = this.player.x;
    if (this.player2 && this.gameMode === '2P') {
      focusX = (this.player.x + this.player2.x) / 2;
    }
    const targetCamX = focusX - 160;
    const maxCam = Math.max(0, this.levelLength - this.V_WIDTH);
    this.cameraX = Math.max(0, Math.min(maxCam, targetCamX));
  }

  public screenShake(duration: number = 0.2, magnitude: number = 3) {
    this.screenShakeTimer = duration;
    this.screenShakeMagnitude = magnitude;
  }

  public addFloatingText(x: number, y: number, text: string, color: string = '#facc15') {
    this.floatingTexts.push({
      id: `ft_${Date.now()}_${Math.random()}`,
      x,
      y,
      text,
      color,
      life: 0.9,
      scale: 1.0
    });
  }

  public spawnSparks(x: number, z: number, y: number, color: string, count: number = 8) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 3 + 1.5;
      this.particles.push({
        x,
        z,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color,
        size: Math.random() * 2 + 2,
        life: 0.25,
        maxLife: 0.25
      });
    }
  }

  // --- RENDERIZADO VISUAL EN EL PLANO 2.5D ---

  private render() {
    if (!this.ctx || !this.canvas) return;
    const ctx = this.ctx;

    ctx.save();
    let shakeX = 0;
    let shakeY = 0;
    if (this.screenShakeTimer > 0) {
      shakeX = (Math.random() - 0.5) * this.screenShakeMagnitude * 2;
      shakeY = (Math.random() - 0.5) * this.screenShakeMagnitude * 2;
    }
    ctx.translate(shakeX, shakeY);

    // 1. Fondo dinámico según la Sub-Área (Calles, Callejones, Metro Subterráneo, etc.)
    this.renderSubAreaBackground(ctx);

    ctx.save();
    ctx.translate(-Math.round(this.cameraX), 0);

    // 2. Plano de la calle / Asfalto / Andén
    this.renderStreetGround(ctx);

    // 3. Renderizado de entidades ordenadas por Profundidad Z (Y-Sorting de 2.5D)
    this.renderEntitiesSorted(ctx);

    // 4. Partículas y textos flotantes
    this.renderParticlesAndTexts(ctx);

    ctx.restore();

    // 5. BANNER ARCADE PARPADEANTE "¡SIGUE! ➔" (GO ➔)
    if (this.isSubAreaCleared) {
      this.renderGoArrowBillboard(ctx);
    }

    // Relámpago de tormenta en Japón
    if (this.lightningTimer > 0) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
      ctx.fillRect(0, 0, this.V_WIDTH, this.V_HEIGHT);
    }

    ctx.restore();
  }

  // Renderizado temático según el tipo de sub-área
  private renderSubAreaBackground(ctx: CanvasRenderingContext2D) {
    const subArea = this.getCurrentSubArea();
    const type = subArea.type;

    if (type === 'calle_comercial' || type === 'galeria_tiendas') {
      // Bulevar con tiendas y letreros de neón
      const skyGrad = ctx.createLinearGradient(0, 0, 0, 180);
      skyGrad.addColorStop(0, '#0c1a2e');
      skyGrad.addColorStop(0.6, '#1e1b4b');
      skyGrad.addColorStop(1, '#0f172a');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, this.V_WIDTH, this.V_HEIGHT);

      // Tiendas iluminadas con marquesinas
      const offset = (this.cameraX * 0.3) % 180;
      for (let i = -1; i < 4; i++) {
        const storeX = i * 160 - offset;
        // Fachada de tienda
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(storeX, 70, 140, 110);
        // Toldo rayado (awning)
        ctx.fillStyle = i % 2 === 0 ? '#ef4444' : '#0284c7';
        ctx.fillRect(storeX - 5, 95, 150, 12);
        ctx.fillStyle = '#ffffff';
        for (let s = 0; s < 10; s++) {
          ctx.fillRect(storeX + s * 15, 95, 7, 12);
        }
        // Letrero neón de la tienda
        ctx.fillStyle = '#facc15';
        ctx.fillRect(storeX + 20, 75, 100, 16);
        ctx.fillStyle = '#0f172a';
        ctx.font = '7px sans-serif';
        ctx.fillText(i % 3 === 0 ? 'RAMEN 24H' : i % 3 === 1 ? 'BAR NEON' : 'ARCADE RETRO', storeX + 35, 86);
      }
    } else if (type === 'callejon_oscuro') {
      // Callejón oscuro con ladrillos rojos, grafitis y tuberías de vapor
      ctx.fillStyle = '#18181b';
      ctx.fillRect(0, 0, this.V_WIDTH, this.V_HEIGHT);
      ctx.fillStyle = '#7f1d1d'; // Muro de ladrillo
      ctx.fillRect(0, 60, this.V_WIDTH, 120);

      // Escaleras metálicas de incendios (fire escapes)
      const offset = (this.cameraX * 0.25) % 120;
      for (let i = -1; i < 5; i++) {
        const fx = i * 110 - offset;
        ctx.fillStyle = '#334155';
        ctx.fillRect(fx, 40, 60, 4);
        ctx.fillRect(fx + 10, 80, 60, 4);
        ctx.fillRect(fx + 25, 40, 3, 40); // Escalera
      }
      // Grafitis callejeros vibrantes
      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 9px sans-serif';
      ctx.fillText('MAD GEAR', 60 - offset, 115);
      ctx.fillStyle = '#f43f5e';
      ctx.fillText('BASADOS', 170 - offset, 130);
    } else if (type === 'entrada_metro' || type === 'anden_subterraneo' || type === 'vias_tren') {
      // METRO SUBTERRÁNEO CLÁSICO ESTILO FINAL FIGHT
      // Bóveda de azulejos blancos con franjas turquesas
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, this.V_WIDTH, this.V_HEIGHT);
      ctx.fillStyle = '#334155';
      ctx.fillRect(0, 50, this.V_WIDTH, 130);

      // Azulejos subterráneos blancos
      const tileOffset = (this.cameraX * 0.4) % 32;
      ctx.fillStyle = '#e2e8f0';
      for (let tx = -1; tx < 18; tx++) {
        ctx.fillRect(tx * 30 - tileOffset, 70, 28, 90);
      }
      // Franja de estación de metro
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(0, 90, this.V_WIDTH, 14);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 8px sans-serif';
      ctx.fillText('METRO SUBTERRÁNEO · ESTACIÓN LÍNEA 1', 120 - ((this.cameraX * 0.4) % 200), 100);

      // Columnas de acero con remaches
      for (let c = -1; c < 5; c++) {
        const colX = c * 130 - tileOffset;
        ctx.fillStyle = '#475569';
        ctx.fillRect(colX, 50, 16, 130);
        ctx.fillStyle = '#64748b';
        ctx.fillRect(colX + 3, 50, 10, 130);
      }
    } else if (type === 'muelle_portuario') {
      // Horizonte marítimo con grúas y contenedores de colores
      ctx.fillStyle = '#0c4a6e';
      ctx.fillRect(0, 0, this.V_WIDTH, 120);
      // Contenedores apilados
      const cOffset = (this.cameraX * 0.2) % 140;
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(40 - cOffset, 90, 70, 35);
      ctx.fillStyle = '#2563eb';
      ctx.fillRect(120 - cOffset, 80, 70, 45);
      ctx.fillStyle = '#16a34a';
      ctx.fillRect(200 - cOffset, 95, 60, 30);
    } else {
      // Azotea nocturna
      ctx.fillStyle = '#09090b';
      ctx.fillRect(0, 0, this.V_WIDTH, this.V_HEIGHT);
      ctx.fillStyle = '#27272a';
      ctx.fillRect(0, 90, this.V_WIDTH, 90);
    }
  }

  private renderStreetGround(ctx: CanvasRenderingContext2D) {
    const subArea = this.getCurrentSubArea();
    const isSubway = subArea.type === 'anden_subterraneo' || subArea.type === 'entrada_metro';

    if (isSubway) {
      // Andén de metro con franja amarilla de peligro y vías de tren
      ctx.fillStyle = '#334155';
      ctx.fillRect(-50, this.Z_MIN - 12, this.levelLength + 100, (this.Z_MAX - this.Z_MIN) + 40);
      // Franja amarilla con rombos de seguridad
      ctx.fillStyle = '#facc15';
      ctx.fillRect(-50, this.Z_MIN - 12, this.levelLength + 100, 6);
      // Vías de tren en el fondo
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(-50, this.Z_MAX + 15, this.levelLength + 100, 16);
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(-50, this.Z_MAX + 18, this.levelLength + 100, 2); // Riel
    } else {
      // Asfalto de calle tradicional con bordillo y acera
      const streetGrad = ctx.createLinearGradient(0, this.Z_MIN, 0, this.Z_MAX);
      streetGrad.addColorStop(0, '#1e293b');
      streetGrad.addColorStop(0.5, '#18181b');
      streetGrad.addColorStop(1, '#09090b');

      ctx.fillStyle = streetGrad;
      ctx.fillRect(-50, this.Z_MIN - 10, this.levelLength + 100, (this.Z_MAX - this.Z_MIN) + 40);

      // Bordillo de acera superior
      ctx.fillStyle = '#64748b';
      ctx.fillRect(-50, this.Z_MIN - 12, this.levelLength + 100, 4);

      // Señales de paso peatonal o líneas discontinuas
      ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
      for (let i = 0; i < this.levelLength; i += 80) {
        ctx.fillRect(i, this.Z_MIN + 25, 40, 3);
      }
    }
  }

  // Y-Sorting: Dibuja las entidades ordenadas por Z para profundidad 2.5D correcta
  private renderEntitiesSorted(ctx: CanvasRenderingContext2D) {
    type Renderable = { z: number; draw: () => void };
    const list: Renderable[] = [];

    // Props
    for (const prop of this.props) {
      if (prop.broken) continue;
      list.push({
        z: prop.z,
        draw: () => {
          const sprite = pixelSprites.getPropSprite(prop.type);
          const offsetY = prop.type === 'phonebooth' ? 44 : prop.type === 'car' ? 30 : 26;
          ctx.drawImage(sprite, prop.x, prop.z - offsetY);
        }
      });
    }

    // Pickups
    for (const pick of this.pickups) {
      list.push({
        z: pick.z,
        draw: () => {
          ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
          ctx.fillRect(pick.x + 2, pick.z, 14, 3);
          const sprite = pixelSprites.getFoodSprite(pick.type as 'meat' | 'pizza' | 'bread' | 'soda');
          ctx.drawImage(sprite, pick.x, pick.z + pick.y - 18);
        }
      });
    }

    // Enemigos
    for (const enemy of this.enemies) {
      list.push({
        z: enemy.z,
        draw: () => {
          // Sombra elíptica
          ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
          ctx.beginPath();
          ctx.ellipse(enemy.x + enemy.width / 2, enemy.z, enemy.width * 0.5, 4, 0, 0, Math.PI * 2);
          ctx.fill();

          const sprite = pixelSprites.getEnemySprite(enemy.type, enemy.action, enemy.animFrame, enemy.facing);
          ctx.drawImage(sprite, enemy.x - 8, enemy.z + enemy.y - 48);

          // Mini barra de HP sobre el enemigo
          if (enemy.hp < enemy.maxHp && enemy.hp > 0) {
            const barW = 28;
            const hpRatio = Math.max(0, enemy.hp / enemy.maxHp);
            ctx.fillStyle = '#7f1d1d';
            ctx.fillRect(enemy.x, enemy.z + enemy.y - 54, barW, 3);
            ctx.fillStyle = enemy.isBoss ? '#f59e0b' : '#ef4444';
            ctx.fillRect(enemy.x, enemy.z + enemy.y - 54, barW * hpRatio, 3);
          }
        }
      });
    }

    // Jugador 1
    list.push({
      z: this.player.z,
      draw: () => {
        const p = this.player;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.beginPath();
        ctx.ellipse(p.x + p.width / 2, p.z, p.width * 0.55, 4.5, 0, 0, Math.PI * 2);
        ctx.fill();

        // Parpadeo durante invencibilidad
        if (p.invincibleTimer > 0 && Math.floor(Date.now() / 60) % 2 === 0) {
          // Frame transparente para feedback visual
        } else {
          const sprite = pixelSprites.getPlayerSprite(p.stats.id, p.currentAction, p.animFrame, p.facing);
          ctx.drawImage(sprite, p.x - 8, p.z + p.y - 48);
        }

        // Indicador 1P en modo 2 Jugadores
        if (this.gameMode === '2P') {
          ctx.fillStyle = '#facc15';
          ctx.font = 'bold 7px sans-serif';
          ctx.fillText('1P', p.x + 8, p.z + p.y - 52);
        }

        // Bocadillo estilo cómic de Frase Basada
        if (p.speechBubble) {
          this.renderSpeechBubble(ctx, p);
        }
      }
    });

    // Jugador 2 (Modo Co-op)
    if (this.player2 && this.gameMode === '2P') {
      list.push({
        z: this.player2.z,
        draw: () => {
          const p = this.player2!;
          ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
          ctx.beginPath();
          ctx.ellipse(p.x + p.width / 2, p.z, p.width * 0.55, 4.5, 0, 0, Math.PI * 2);
          ctx.fill();

          if (p.invincibleTimer > 0 && Math.floor(Date.now() / 60) % 2 === 0) {
            // Frame transparente
          } else {
            const sprite = pixelSprites.getPlayerSprite(p.stats.id, p.currentAction, p.animFrame, p.facing);
            ctx.drawImage(sprite, p.x - 8, p.z + p.y - 48);
          }

          // Indicador 2P
          ctx.fillStyle = '#38bdf8';
          ctx.font = 'bold 7px sans-serif';
          ctx.fillText('2P', p.x + 8, p.z + p.y - 52);

          if (p.speechBubble) {
            this.renderSpeechBubble(ctx, p);
          }
        }
      });
    }

    // Ordenar de menor Z a mayor Z
    list.sort((a, b) => a.z - b.z);
    for (const item of list) {
      item.draw();
    }
  }

  // Renderizado del bocadillo cómic de frases basadas
  private renderSpeechBubble(ctx: CanvasRenderingContext2D, p: PlayerEntity) {
    if (!p.speechBubble) return;
    const text = p.speechBubble.text;
    ctx.save();
    ctx.font = 'bold 8px sans-serif';
    const textMetrics = ctx.measureText(text);
    const bubbleW = textMetrics.width + 14;
    const bubbleH = 18;
    const bubbleX = p.x + p.width / 2 - bubbleW / 2;
    const bubbleY = p.z + p.y - 66;

    // Fondo blanco con borde negro cómic
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1.5;
    ctx.fillRect(bubbleX, bubbleY, bubbleW, bubbleH);
    ctx.strokeRect(bubbleX, bubbleY, bubbleW, bubbleH);

    // Piquito del bocadillo
    ctx.beginPath();
    ctx.moveTo(p.x + p.width / 2 - 3, bubbleY + bubbleH);
    ctx.lineTo(p.x + p.width / 2, bubbleY + bubbleH + 4);
    ctx.lineTo(p.x + p.width / 2 + 3, bubbleY + bubbleH);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.stroke();

    // Texto
    ctx.fillStyle = '#0f172a';
    ctx.fillText(text, bubbleX + 7, bubbleY + 12);
    ctx.restore();
  }

  // RENDERIZADO DEL BILLBOARD "¡SIGUE! ➔" AL DESPEJAR ZONA
  private renderGoArrowBillboard(ctx: CanvasRenderingContext2D) {
    const isBlinkOn = Math.floor(this.goArrowTimer * 5) % 2 === 0;
    if (!isBlinkOn) return;

    ctx.save();
    const bannerX = this.V_WIDTH - 120;
    const bannerY = 28;

    // Cartel Neón Arcade
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(bannerX, bannerY, 110, 24);
    ctx.fillStyle = '#facc15';
    ctx.fillRect(bannerX + 2, bannerY + 2, 106, 20);

    ctx.fillStyle = '#09090b';
    ctx.font = 'bold 11px sans-serif';
    ctx.fillText('¡SIGUE! ➔➔', bannerX + 16, bannerY + 16);

    ctx.restore();
  }

  private renderParticlesAndTexts(ctx: CanvasRenderingContext2D) {
    // Partículas
    for (const pt of this.particles) {
      ctx.fillStyle = pt.color;
      ctx.fillRect(pt.x, pt.z + pt.y, pt.size, pt.size);
    }

    // Textos flotantes
    for (const ft of this.floatingTexts) {
      ctx.save();
      ctx.font = 'bold 10px sans-serif';
      ctx.fillStyle = ft.color;
      ctx.fillText(ft.text, ft.x, ft.y);
      ctx.restore();
    }
  }
}

export const gameEngine = new GameEngine();
