/**
 * Definiciones de tipos para Los Basados: Furia Callejera
 * Basado en la arquitectura técnica de combate, IA y diseño de Final Fight 2.
 */

export type CharacterId = 'vaze' | 'cody' | 'haggar' | 'maki' | 'carlos';

export type GameMode = '1P' | '2P';

export type GameState = 'TITLE' | 'COMIC_INTRO' | 'STORY_INTRO' | 'PLAYING' | 'PAUSED' | 'STAGE_CLEAR' | 'VICTORY' | 'GAME_OVER';

export type GameDifficulty = 'facil' | 'normal' | 'dificil' | 'basado';

export interface PlayerKeyBindings {
  up: string;
  down: string;
  left: string;
  right: string;
  punch: string;
  kick: string;
  jump: string;
  special: string;
  tag?: string;
  pause?: string;
}

export interface CustomKeyConfig {
  p1: PlayerKeyBindings;
  p2: PlayerKeyBindings;
}

export type SubAreaType =
  | 'calle_comercial'
  | 'callejon_oscuro'
  | 'entrada_metro'
  | 'anden_subterraneo'
  | 'muelle_portuario'
  | 'galeria_tiendas'
  | 'azotea_nocturna'
  | 'vias_tren';

export interface SubAreaConfig {
  subAreaIndex: number;
  totalSubAreas: number;
  name: string;
  type: SubAreaType;
  levelLength: number;
  enemyCount: number;
  hasBoss: boolean;
  bossType?: EnemyType;
  ambientColor: string;
}

export type ControllerBrand = 'playstation' | 'xbox' | 'switch' | 'generic' | 'keyboard' | 'touch';

export interface GamepadInfo {
  connected: boolean;
  id: string;
  brand: ControllerBrand;
  displayName: string;
  hasVibration: boolean;
  mapping?: string;
  axesCount?: number;
  buttonsCount?: number;
}

export interface RawGamepadState {
  index: number;
  id: string;
  mapping: string;
  brand: ControllerBrand;
  displayName: string;
  connected: boolean;
  axes: number[];
  buttons: { index: number; pressed: boolean; value: number }[];
  normalized: {
    moveX: number;
    moveY: number;
    up: boolean;
    down: boolean;
    left: boolean;
    right: boolean;
    jump: boolean;
    punch: boolean;
    kick: boolean;
    special: boolean;
    tag: boolean;
    pause: boolean;
    movementSource: string;
  };
  timestamp: number;
}

export interface GamepadDebugLogEntry {
  id: string;
  time: string;
  type: 'connect' | 'disconnect' | 'button' | 'axis' | 'info';
  message: string;
}

export interface InputState {
  left: boolean;
  right: boolean;
  up: boolean;
  down: boolean;
  jump: boolean;
  jumpJustPressed: boolean;
  punch: boolean;
  punchJustPressed: boolean;
  kick: boolean;
  kickJustPressed: boolean;
  special: boolean;
  specialJustPressed: boolean;
  pauseJustPressed: boolean;
  switchPartnerJustPressed: boolean;
}

export interface Hitbox {
  x: number;
  z: number;
  y: number; // Elevación
  width: number;
  depth: number; // Tolerancia en eje Z
  height: number;
  damage: number;
  knockbackX: number;
  knockbackZ: number;
  knockbackY: number;
  isHeavy: boolean;
  attackerId: string;
}

export interface PlayerStats {
  id: CharacterId;
  name: string;
  subtitle: string;
  archetype: 'speedster' | 'grappler' | 'allrounder';
  maxHp: number;
  hp: number;
  speedX: number;
  speedZ: number;
  jumpPower: number;
  punchDamage: number;
  kickDamage: number;
  throwDamage: number;
  specialCost: number;
  specialMeter: number;
  maxSpecial: number;
  lives: number;
  score: number;
  color: string;
  secondaryColor: string;
  bio: string;
  signatureMove: string;
}

export type PlayerAction = 
  | 'idle' 
  | 'walk' 
  | 'jump' 
  | 'fall' 
  | 'punch1' 
  | 'punch2' 
  | 'punch3' 
  | 'kick' 
  | 'jumpkick' 
  | 'clinch'       // En agarre (sujetando al oponente)
  | 'clinch_hit'   // Rodillazo o cabezazo en agarre
  | 'throw'        // Lanzamiento / Suplex / Piledriver
  | 'special'      // Superataque (Spinning Clothesline / Handstand Kick / Dancing Blade)
  | 'hurt' 
  | 'knocked';

export interface SpeechBubble {
  text: string;
  timer: number;
  maxTimer: number;
}

export interface PlayerEntity {
  x: number;
  z: number;      // Profundidad en el plano callejero (180 a 245)
  y: number;      // Elevación de salto sobre el suelo (0 = en suelo, negativo = en aire)
  vx: number;
  vz: number;
  vy: number;
  width: number;
  height: number;
  facing: 1 | -1;
  isGrounded: boolean;
  stats: PlayerStats;
  currentAction: PlayerAction;
  animFrame: number;
  animTimer: number;
  comboTimer: number;
  comboCount: number;
  invincibleTimer: number;
  actionLockTimer: number;
  coyoteTimer: number;
  jumpBufferTimer: number;
  speechBubble?: SpeechBubble | null;
  // Mecánica de Agarre (Clinch) de Final Fight
  grabbedEnemyId: string | null;
  grabTimer: number;
  grabHitsRemaining: number;
}

export type EnemyType = 
  | 'schot'     // Punk verde ligero
  | 'jack'      // Punk azul
  | 'bull'      // Matón marrón
  | 'elijah'    // Matón con bate/cadena
  | 'andore_jr' // Andore Jr (mameluco azul)
  | 'andore'    // Andore clásico (mameluco rojo)
  | 'g_andore'  // Gran Andore (mameluco gris pesado)
  | 'boss_won'  // Jefe Etapa 1 (Hong Kong: Won Won)
  | 'boss_fred' // Jefe Etapa 2 (Francia: Freddie)
  | 'boss_retu';// Jefe Final Etapa 6 (Japón: Retu)

export interface EnemyEntity {
  id: string;
  type: EnemyType;
  name: string;
  x: number;
  z: number;
  y: number;
  vx: number;
  vz: number;
  vy: number;
  width: number;
  height: number;
  facing: 1 | -1;
  isGrounded: boolean;
  maxHp: number;
  hp: number;
  action: 'idle' | 'walk' | 'flank' | 'windup' | 'attack' | 'grabbed' | 'thrown' | 'hurt' | 'knocked';
  animFrame: number;
  animTimer: number;
  attackCooldown: number;
  windupTimer: number;
  hurtTimer: number;
  scoreValue: number;
  speed: number;
  // Inteligencia Artificial autónoma (Tokens de ataque)
  targetZ: number;
  aiTimer: number;
  hasAttackToken: boolean;
  isBoss?: boolean;
}

export interface StageData {
  stageNumber: number;
  name: string;
  country: string;
  desc: string;
  backgroundTheme: 'hongkong' | 'france' | 'holland' | 'england' | 'italy' | 'japan';
  levelLength: number;
  bossType: EnemyType;
  bossName: string;
  bgmType: 'street' | 'dock' | 'dojo';
  subAreas?: SubAreaConfig[];
}

export interface PropEntity {
  id: string;
  x: number;
  z: number;
  y: number;
  width: number;
  height: number;
  type: 'crate' | 'barrel' | 'trashcan' | 'mine' | 'car' | 'phonebooth';
  hp: number;
  broken: boolean;
  drop: 'meat' | 'pizza' | 'bread' | 'soda' | 'knife' | 'pipe' | 'coin' | 'none';
}

export interface PickupEntity {
  id: string;
  x: number;
  z: number;
  y: number;
  vx: number;
  vy: number;
  type: 'meat' | 'pizza' | 'bread' | 'soda' | 'knife' | 'pipe' | 'coin';
  value: number;
  isGrounded: boolean;
  bounceCount: number;
}

export interface Particle {
  x: number;
  z: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  life: number;
  maxLife: number;
}

export interface FloatingText {
  id: string;
  x: number;
  y: number;
  text: string;
  color: string;
  life: number;
  scale: number;
}
