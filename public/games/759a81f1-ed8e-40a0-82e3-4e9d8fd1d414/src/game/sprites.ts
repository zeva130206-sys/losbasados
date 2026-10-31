/**
 * Motor de Renderizado Pixel Art 16-Bit Estilo Arcade Capcom (CPS-1 / SNES Final Fight)
 * Genera sprites detallados con sombreado anatómico muscular multicapa (4-5 tonos por material),
 * pliegues textiles en vaqueros denim, arneses de cuero con hebillas metálicas y poses canónicas
 * para Cody, Haggar, Maki, Carlos, Punks, Clan Andore y Jefes.
 */

import { CharacterId, EnemyType, PlayerAction } from './types';

export class PixelArtRenderer {
  private cache: Map<string, HTMLCanvasElement> = new Map();

  private createOffscreenCanvas(width: number, height: number): { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D } {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
    ctx.imageSmoothingEnabled = false;
    return { canvas, ctx };
  }

  // --- SPRITES DE LUCHADORES 16-BIT (CODY, HAGGAR, MAKI, CARLOS) ---

  public getPlayerSprite(charId: CharacterId, action: PlayerAction, frame: number, facing: 1 | -1): HTMLCanvasElement {
    const key = `player16_${charId}_${action}_${frame}_${facing}`;
    if (this.cache.has(key)) return this.cache.get(key)!;

    const width = 64;
    const height = 64;
    const { canvas, ctx } = this.createOffscreenCanvas(width, height);

    if (facing === -1) {
      ctx.translate(width, 0);
      ctx.scale(-1, 1);
    }

    const cx = 20;
    const bobY = (frame % 2) * 2;

    // Paleta de Piel 16-bit
    const skinHigh = '#fde0c8';
    const skinMid = '#f7c29e';
    const skinShadow = '#e09874';
    const skinDeep = '#b86b45';

    // 0. VAZE (El protagonista basado canónico: gorra invertida, gabardina roja, camiseta negra y Neo-Furia)
    if (charId === 'vaze') {
      const y = 6 + bobY;

      // Gorra negra hacia atrás con visera hacia la nuca y detalle rojo
      ctx.fillStyle = '#09090b'; // Sombra profunda de la gorra
      ctx.fillRect(cx + 4, y - 7, 13, 9);
      ctx.fillStyle = '#18181b'; // Corona principal
      ctx.fillRect(cx + 5, y - 6, 11, 7);
      ctx.fillStyle = '#27272a'; // Brillo superior
      ctx.fillRect(cx + 6, y - 7, 7, 2);
      // Visera orientada hacia atrás (nuca)
      ctx.fillStyle = '#09090b';
      ctx.fillRect(cx + 1, y - 3, 5, 3);
      ctx.fillStyle = '#ef4444'; // Logo / detalle rojo frontal de la gorra
      ctx.fillRect(cx + 11, y - 5, 3, 2);

      // Mechones de pelo oscuro rebelde asomando por la frente y sienes
      ctx.fillStyle = '#1c1917';
      ctx.fillRect(cx + 13, y - 2, 4, 4);
      ctx.fillRect(cx + 4, y - 1, 3, 3);

      // Rostro determinado y cuello
      ctx.fillStyle = skinDeep;
      ctx.fillRect(cx + 6, y + 2, 10, 8);
      ctx.fillStyle = skinMid;
      ctx.fillRect(cx + 7, y + 2, 8, 7);
      ctx.fillStyle = skinHigh;
      ctx.fillRect(cx + 8, y + 3, 5, 4); // Pómulo
      // Mirada afilada arcade
      ctx.fillStyle = '#451a03';
      ctx.fillRect(cx + 10, y + 3, 4, 1); // Ceja fruncida
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(cx + 11, y + 4, 2, 2); // Pupila

      // Gabardina larga roja carmesí abierta (flota dinámicamente detrás del cuerpo)
      const coatBillow = action === 'punch1' || action === 'punch2' || action === 'punch3' || action === 'kick' || action === 'special' ? -8 : -3;
      ctx.fillStyle = '#450a0a'; // Sombra más profunda del abrigo
      ctx.fillRect(cx + coatBillow, y + 12, 8, 26);
      ctx.fillStyle = '#7f1d1d'; // Sombra media
      ctx.fillRect(cx + coatBillow + 1, y + 11, 7, 25);
      ctx.fillStyle = '#b91c1c'; // Rojo carmesí del abrigo
      ctx.fillRect(cx + coatBillow + 2, y + 10, 6, 24);
      ctx.fillStyle = '#dc2626'; // Luces de pliegues en movimiento
      ctx.fillRect(cx + coatBillow + 3, y + 12, 3, 20);

      // Cuello alto y hombreras tácticas del abrigo
      ctx.fillStyle = '#991b1b';
      ctx.fillRect(cx + 2, y + 8, 4, 5); // Cuello izquierdo
      ctx.fillRect(cx + 14, y + 8, 4, 5); // Cuello derecho
      ctx.fillStyle = '#7f1d1d'; // Hombreras acolchadas
      ctx.fillRect(cx + 1, y + 10, 4, 4);
      ctx.fillRect(cx + 15, y + 10, 4, 4);

      // Camiseta táctica negra interior
      ctx.fillStyle = '#09090b';
      ctx.fillRect(cx + 5, y + 10, 10, 15);
      ctx.fillStyle = '#18181b';
      ctx.fillRect(cx + 6, y + 11, 8, 13);
      ctx.fillStyle = '#27272a'; // Pectorales sombreados
      ctx.fillRect(cx + 7, y + 12, 3, 5);
      ctx.fillRect(cx + 10, y + 12, 3, 5);

      // Brazos musculares y guantes de combate rojos
      if (action === 'punch1' || action === 'punch2' || action === 'punch3') {
        const isFinisher = action === 'punch3';
        // Brazo en puñetazo directo rápido
        ctx.fillStyle = skinShadow;
        ctx.fillRect(cx + 14, y + 9, isFinisher ? 22 : 18, 7);
        ctx.fillStyle = skinMid;
        ctx.fillRect(cx + 15, y + 10, isFinisher ? 20 : 16, 5);
        // Mitón / Guantelete de combate rojo
        ctx.fillStyle = '#991b1b';
        ctx.fillRect(cx + (isFinisher ? 28 : 24), y + 8, 8, 9);
        ctx.fillStyle = '#dc2626';
        ctx.fillRect(cx + (isFinisher ? 29 : 25), y + 9, 6, 7);
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(cx + (isFinisher ? 30 : 26), y + 10, 4, 3);
        // Estela cortante de impacto rojo
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(cx + (isFinisher ? 36 : 32), y + 7, 10, 4);
        ctx.fillStyle = '#fca5a5';
        ctx.fillRect(cx + (isFinisher ? 38 : 34), y + 8, 6, 2);
      } else if (action === 'kick' || action === 'jumpkick') {
        // Patada alta callejera con onda cortante carmesí
        ctx.fillStyle = skinMid;
        ctx.fillRect(cx + 8, y + 16, 16, 6);
        ctx.fillStyle = '#0f172a'; // Pantalón pierna alzada
        ctx.fillRect(cx + 16, y + 14, 12, 7);
        ctx.fillStyle = '#020617'; // Bota
        ctx.fillRect(cx + 26, y + 12, 7, 8);
        ctx.fillStyle = '#dc2626'; // Cordones
        ctx.fillRect(cx + 27, y + 13, 2, 4);
        // Arco de estela cortante de patada (crescent kick trail)
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(cx + 24, y + 16, 16, -0.6, 0.8);
        ctx.lineWidth = 3;
        ctx.strokeStyle = '#ef4444';
        ctx.stroke();
        ctx.strokeStyle = '#fecdd3';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      } else if (action === 'special') {
        // ESPECIAL: NEO-FURIA (Orbe de energía carmesí concentrada + ráfaga de choque)
        // Brazos reuniendo energía
        ctx.fillStyle = skinMid;
        ctx.fillRect(cx + 12, y + 10, 10, 6);
        ctx.fillStyle = '#dc2626';
        ctx.fillRect(cx + 20, y + 9, 6, 8);

        // Orbe Neo-Furia (núcleo oscuro con aura carmesí ardiente)
        ctx.fillStyle = '#450a0a';
        ctx.beginPath();
        ctx.arc(cx + 32, y + 14, 11, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#991b1b';
        ctx.beginPath();
        ctx.arc(cx + 32, y + 14, 8, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(cx + 32, y + 14, 5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(cx + 32, y + 14, 2, 0, Math.PI * 2);
        ctx.fill();

        // Anillo de choque exterior
        ctx.strokeStyle = '#f43f5e';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(cx + 32, y + 14, 15, 0, Math.PI * 2);
        ctx.stroke();
      } else {
        // Guardia / Reposo
        ctx.fillStyle = skinMid;
        ctx.fillRect(cx + 10, y + 11, 6, 7);
        ctx.fillStyle = '#dc2626';
        ctx.fillRect(cx + 13, y + 12, 5, 6);
      }

      // Cinturón táctico con hebilla metálica
      ctx.fillStyle = '#020617';
      ctx.fillRect(cx + 4, y + 24, 12, 3);
      ctx.fillStyle = '#e2e8f0'; // Hebilla plateada
      ctx.fillRect(cx + 9, y + 24, 4, 3);

      // Pantalones cargo tácticos oscuros con bolsillos laterales
      ctx.fillStyle = '#020617'; // Sombra profunda de piernas
      ctx.fillRect(cx + 3, y + 27, 6, 17);
      ctx.fillRect(cx + 11, y + 27, 6, 17);
      ctx.fillStyle = '#0f172a'; // Tono principal cargo
      ctx.fillRect(cx + 4, y + 27, 4, 16);
      ctx.fillRect(cx + 12, y + 27, 4, 16);
      ctx.fillStyle = '#1e293b'; // Bolsillos cargo y costuras
      ctx.fillRect(cx + 2, y + 31, 3, 6);
      ctx.fillRect(cx + 15, y + 31, 3, 6);

      // Botas militares negras con cordones rojos
      ctx.fillStyle = '#020617';
      ctx.fillRect(cx + 2, y + 43, 8, 7);
      ctx.fillRect(cx + 11, y + 43, 8, 7);
      ctx.fillStyle = '#dc2626'; // Cordones cruzados rojos
      ctx.fillRect(cx + 5, y + 44, 2, 4);
      ctx.fillRect(cx + 14, y + 44, 2, 4);
      ctx.fillStyle = '#475569'; // Suelas reforzadas
      ctx.fillRect(cx + 2, y + 48, 8, 2);
      ctx.fillRect(cx + 11, y + 48, 8, 2);

    // 1. CODY TRAVERS (El clásico luchador de camiseta blanca, vaqueros azules y muñequeras)
    } else if (charId === 'cody') {
      const y = 6 + bobY;

      // Pelo rubio con flequillo y volumen arcade
      ctx.fillStyle = '#713f12'; // Sombra profunda de pelo
      ctx.fillRect(cx + 4, y - 6, 12, 10);
      ctx.fillStyle = '#eab308'; // Tono medio rubio
      ctx.fillRect(cx + 5, y - 5, 11, 7);
      ctx.fillStyle = '#fef08a'; // Brillo superior
      ctx.fillRect(cx + 6, y - 6, 8, 3);
      ctx.fillRect(cx + 3, y - 2, 4, 3);

      // Rostro y cuello con perfil sombreado
      ctx.fillStyle = skinDeep;
      ctx.fillRect(cx + 6, y + 2, 10, 9);
      ctx.fillStyle = skinMid;
      ctx.fillRect(cx + 7, y + 2, 8, 8);
      ctx.fillStyle = skinHigh;
      ctx.fillRect(cx + 8, y + 3, 5, 4); // Pómulo iluminado
      // Ojo y ceja
      ctx.fillStyle = '#451a03';
      ctx.fillRect(cx + 10, y + 4, 3, 1);
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(cx + 11, y + 5, 2, 2);

      // Camiseta blanca clásica con sombreado de pliegues anatómicos
      // Base y sombras de los pliegues
      ctx.fillStyle = '#64748b'; // Sombra profunda
      ctx.fillRect(cx + 2, y + 10, 16, 16);
      ctx.fillStyle = '#94a3b8'; // Sombra media
      ctx.fillRect(cx + 3, y + 10, 15, 15);
      ctx.fillStyle = '#e2e8f0'; // Blanco suave
      ctx.fillRect(cx + 4, y + 10, 13, 13);
      ctx.fillStyle = '#ffffff'; // Blanco puro (luces pectorales)
      ctx.fillRect(cx + 5, y + 11, 6, 6);
      ctx.fillRect(cx + 12, y + 11, 4, 6);

      // Brazos musculares y muñequeras azules de vendaje
      if (action === 'punch1' || action === 'punch2' || action === 'punch3') {
        const isFinisher = action === 'punch3';
        // Brazo derecho extendido en puñetazo directo o uppercut
        ctx.fillStyle = skinShadow;
        ctx.fillRect(cx + 14, y + 9, isFinisher ? 22 : 18, 7);
        ctx.fillStyle = skinMid;
        ctx.fillRect(cx + 15, y + 10, isFinisher ? 20 : 16, 5);
        ctx.fillStyle = skinHigh;
        ctx.fillRect(cx + 16, y + 10, isFinisher ? 18 : 14, 2);
        // Muñequera azul clásica
        ctx.fillStyle = '#1e3a8a';
        ctx.fillRect(cx + (isFinisher ? 28 : 24), y + 8, 8, 9);
        ctx.fillStyle = '#3b82f6';
        ctx.fillRect(cx + (isFinisher ? 29 : 25), y + 9, 6, 7);
        ctx.fillStyle = skinDeep; // Puño cerrado
        ctx.fillRect(cx + (isFinisher ? 34 : 30), y + 9, 4, 6);
      } else if (action === 'kick' || action === 'jumpkick') {
        // Patada voladora o lateral
        ctx.fillStyle = skinMid;
        ctx.fillRect(cx + 10, y + 18, 20, 6);
        ctx.fillStyle = '#1e40af';
        ctx.fillRect(cx + 20, y + 17, 10, 8);
        ctx.fillStyle = '#ffffff'; // Zapatillas
        ctx.fillRect(cx + 28, y + 16, 6, 8);
      } else if (action === 'special') {
        // Tornado Kick / Torbellino con estela de viento
        ctx.fillStyle = '#60a5fa';
        ctx.fillRect(cx - 12, y + 4, 44, 8);
        ctx.fillStyle = '#93c5fd';
        ctx.fillRect(cx - 16, y + 8, 52, 10);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(cx - 8, y + 6, 36, 4);
      } else {
        // Guardia clásica (brazos cruzados al frente listos para pelear)
        ctx.fillStyle = skinShadow;
        ctx.fillRect(cx + 12, y + 11, 8, 9);
        ctx.fillStyle = skinMid;
        ctx.fillRect(cx + 13, y + 12, 6, 7);
        // Muñequeras azules visibles
        ctx.fillStyle = '#1e40af';
        ctx.fillRect(cx + 14, y + 12, 6, 7);
        ctx.fillStyle = '#60a5fa';
        ctx.fillRect(cx + 15, y + 13, 3, 4);
      }

      // Cinturón de cuero con hebilla metálica
      ctx.fillStyle = '#451a03';
      ctx.fillRect(cx + 3, y + 24, 15, 3);
      ctx.fillStyle = '#facc15'; // Hebilla dorada
      ctx.fillRect(cx + 9, y + 24, 4, 3);
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(cx + 10, y + 25, 2, 1);

      // Vaqueros Denim con sombreado de tela y bolsillos
      // Sombra oscura
      ctx.fillStyle = '#1e3a8a';
      ctx.fillRect(cx + 3, y + 27, 6, 18);
      ctx.fillRect(cx + 11, y + 27, 6, 18);
      // Azul medio vaquero
      ctx.fillStyle = '#2563eb';
      ctx.fillRect(cx + 4, y + 27, 4, 17);
      ctx.fillRect(cx + 12, y + 27, 4, 17);
      // Luces en muslos y rodillas desgastadas
      ctx.fillStyle = '#60a5fa';
      ctx.fillRect(cx + 5, y + 29, 2, 6);
      ctx.fillRect(cx + 13, y + 29, 2, 6);
      ctx.fillRect(cx + 5, y + 37, 2, 3); // Rodilla
      ctx.fillRect(cx + 13, y + 37, 2, 3);

      // Zapatillas retro blancas con suela gris
      ctx.fillStyle = '#334155'; // Suela
      ctx.fillRect(cx + 2, y + 48, 8, 3);
      ctx.fillRect(cx + 10, y + 48, 8, 3);
      ctx.fillStyle = '#e2e8f0'; // Cuerpo zapatilla
      ctx.fillRect(cx + 3, y + 44, 6, 5);
      ctx.fillRect(cx + 11, y + 44, 6, 5);
      ctx.fillStyle = '#ffffff'; // Puntera
      ctx.fillRect(cx + 5, y + 45, 4, 4);
      ctx.fillRect(cx + 13, y + 45, 4, 4);

    // 2. MIKE HAGGAR (Luchador colosal, arnés de cuero, pantalones militares)
    } else if (charId === 'haggar') {
      const y = 3 + bobY;

      // Pelo castaño estilo militar pompadour
      ctx.fillStyle = '#291305';
      ctx.fillRect(cx + 3, y - 6, 16, 9);
      ctx.fillStyle = '#542d11';
      ctx.fillRect(cx + 4, y - 5, 14, 7);
      ctx.fillStyle = '#854d0e';
      ctx.fillRect(cx + 6, y - 6, 10, 3);

      // Cabeza ancha, mandíbula cuadrada y bigote colosal
      ctx.fillStyle = skinDeep;
      ctx.fillRect(cx + 4, y + 2, 14, 10);
      ctx.fillStyle = skinMid;
      ctx.fillRect(cx + 5, y + 2, 12, 9);
      ctx.fillStyle = skinHigh;
      ctx.fillRect(cx + 6, y + 3, 8, 4);
      // Ojos intimidantes
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(cx + 11, y + 5, 2, 2);
      // Bigote icónico espeso
      ctx.fillStyle = '#1c1917';
      ctx.fillRect(cx + 6, y + 8, 12, 4);
      ctx.fillStyle = '#451a03';
      ctx.fillRect(cx + 7, y + 8, 10, 2);

      // Torso imponente de coloso (músculos pectorales y abdominales definidos)
      ctx.fillStyle = skinDeep;
      ctx.fillRect(cx - 2, y + 11, 24, 18);
      ctx.fillStyle = skinShadow;
      ctx.fillRect(cx, y + 11, 21, 16);
      ctx.fillStyle = skinMid;
      ctx.fillRect(cx + 2, y + 12, 18, 14);
      ctx.fillStyle = skinHigh; // Luces pectorales
      ctx.fillRect(cx + 3, y + 13, 6, 5);
      ctx.fillRect(cx + 13, y + 13, 6, 5);
      // Línea de corte pectoral y six-pack
      ctx.fillStyle = skinDeep;
      ctx.fillRect(cx + 10, y + 13, 2, 13);
      ctx.fillRect(cx + 6, y + 20, 9, 2);

      // Arnés de cuero cruzado con hebilla metálica
      ctx.fillStyle = '#451a03';
      ctx.fillRect(cx + 2, y + 11, 4, 17);
      ctx.fillStyle = '#78350f';
      ctx.fillRect(cx + 3, y + 11, 2, 17);
      ctx.fillStyle = '#e2e8f0'; // Hebilla de acero
      ctx.fillRect(cx + 2, y + 18, 4, 3);

      // Brazos masivos
      if (action === 'punch1' || action === 'punch2' || action === 'punch3') {
        // Martillazo destructor de Haggar
        ctx.fillStyle = skinDeep;
        ctx.fillRect(cx + 16, y + 8, 20, 10);
        ctx.fillStyle = skinMid;
        ctx.fillRect(cx + 17, y + 9, 18, 8);
        ctx.fillStyle = skinHigh;
        ctx.fillRect(cx + 18, y + 9, 14, 4);
        // Muñequera de cuero
        ctx.fillStyle = '#451a03';
        ctx.fillRect(cx + 28, y + 8, 8, 10);
      } else if (action === 'special') {
        // Spinning Clothesline con estela masiva de impacto
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(cx - 16, y + 6, 54, 8);
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(cx - 20, y + 10, 62, 10);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(cx - 12, y + 8, 46, 4);
      } else {
        // Guardia de titan
        ctx.fillStyle = skinShadow;
        ctx.fillRect(cx + 15, y + 12, 8, 12);
        ctx.fillStyle = skinMid;
        ctx.fillRect(cx + 16, y + 13, 6, 9);
        ctx.fillStyle = '#451a03';
        ctx.fillRect(cx + 17, y + 18, 5, 5);
      }

      // Cinturón ancho de luchador profesional
      ctx.fillStyle = '#1c1917';
      ctx.fillRect(cx + 1, y + 27, 19, 4);
      ctx.fillStyle = '#eab308'; // Gran placa dorada
      ctx.fillRect(cx + 8, y + 26, 6, 5);

      // Pantalones de combate verde oliva con volumen 16-bit
      ctx.fillStyle = '#14532d'; // Sombra verde militar
      ctx.fillRect(cx + 1, y + 31, 8, 16);
      ctx.fillRect(cx + 11, y + 31, 8, 16);
      ctx.fillStyle = '#15803d'; // Verde militar medio
      ctx.fillRect(cx + 2, y + 31, 6, 15);
      ctx.fillRect(cx + 12, y + 31, 6, 15);
      ctx.fillStyle = '#4ade80'; // Luces
      ctx.fillRect(cx + 4, y + 33, 2, 7);
      ctx.fillRect(cx + 14, y + 33, 2, 7);

      // Botas pesadas marrones de combate
      ctx.fillStyle = '#1c1917';
      ctx.fillRect(cx, y + 49, 10, 5);
      ctx.fillRect(cx + 11, y + 49, 10, 5);
      ctx.fillStyle = '#78350f';
      ctx.fillRect(cx + 1, y + 46, 8, 5);
      ctx.fillRect(cx + 12, y + 46, 8, 5);

    // 3. MAKI GENRYUSAI (Kunoichi ágil de Bushinryu, traje carmesí)
    } else if (charId === 'maki') {
      const y = 8 + bobY;

      // Pelo rubio brillante con coleta ondeante
      ctx.fillStyle = '#854d0e';
      ctx.fillRect(cx + 2, y - 6, 12, 10);
      ctx.fillStyle = '#eab308';
      ctx.fillRect(cx + 3, y - 6, 10, 8);
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(cx + 5, y - 7, 7, 4);
      // Coleta dinámica
      ctx.fillStyle = '#eab308';
      ctx.fillRect(cx - 5, y - 7, 8, 4);
      ctx.fillRect(cx - 8, y - 5, 5, 4);

      // Rostro estilizado
      ctx.fillStyle = skinDeep;
      ctx.fillRect(cx + 4, y + 2, 9, 8);
      ctx.fillStyle = skinMid;
      ctx.fillRect(cx + 5, y + 2, 7, 7);
      ctx.fillStyle = skinHigh;
      ctx.fillRect(cx + 6, y + 3, 5, 4);
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(cx + 9, y + 4, 2, 2);

      // Traje carmesí Bushinryu con solapas negras y fajín blanco
      ctx.fillStyle = '#7f1d1d'; // Sombra roja profunda
      ctx.fillRect(cx + 2, y + 9, 12, 15);
      ctx.fillStyle = '#dc2626'; // Rojo carmesí
      ctx.fillRect(cx + 3, y + 10, 10, 13);
      ctx.fillStyle = '#f87171'; // Luces
      ctx.fillRect(cx + 4, y + 10, 4, 6);
      ctx.fillRect(cx + 10, y + 10, 2, 6);
      // Cuello negro interior
      ctx.fillStyle = '#18181b';
      ctx.fillRect(cx + 6, y + 9, 4, 3);
      // Cinturón blanco obi
      ctx.fillStyle = '#cbd5e1';
      ctx.fillRect(cx + 2, y + 16, 12, 3);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(cx + 3, y + 16, 9, 2);

      // Brazos y muñequeras ninja
      if (action === 'punch1' || action === 'punch2') {
        ctx.fillStyle = skinMid;
        ctx.fillRect(cx + 10, y + 10, 16, 5);
        ctx.fillStyle = '#dc2626';
        ctx.fillRect(cx + 20, y + 9, 6, 7);
      } else if (action === 'kick' || action === 'jumpkick') {
        ctx.fillStyle = skinMid;
        ctx.fillRect(cx + 6, y + 16, 18, 5);
        ctx.fillStyle = '#991b1b';
        ctx.fillRect(cx + 18, y + 15, 6, 7);
      } else if (action === 'special') {
        ctx.fillStyle = '#f87171';
        ctx.fillRect(cx - 10, y + 4, 38, 8);
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(cx - 12, y + 6, 42, 6);
      } else {
        ctx.fillStyle = skinMid;
        ctx.fillRect(cx + 8, y + 11, 6, 6);
        ctx.fillStyle = '#dc2626';
        ctx.fillRect(cx + 11, y + 12, 4, 5);
      }

      // Mallas negras y calzado tabi rojo
      ctx.fillStyle = '#18181b';
      ctx.fillRect(cx + 3, y + 24, 4, 15);
      ctx.fillRect(cx + 8, y + 24, 4, 15);
      ctx.fillStyle = '#3f3f46';
      ctx.fillRect(cx + 4, y + 26, 2, 8);
      ctx.fillRect(cx + 9, y + 26, 2, 8);
      // Calzado rojo ninja
      ctx.fillStyle = '#991b1b';
      ctx.fillRect(cx + 2, y + 40, 5, 5);
      ctx.fillRect(cx + 8, y + 40, 5, 5);
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(cx + 3, y + 41, 3, 3);
      ctx.fillRect(cx + 9, y + 41, 3, 3);

    // 4. CARLOS MIYAMOTO (Samurai urbano con katana y artes marciales)
    } else {
      const y = 6 + bobY;

      // Pelo negro recogido en coleta samurai con cinta blanca
      ctx.fillStyle = '#09090b';
      ctx.fillRect(cx + 3, y - 6, 13, 9);
      ctx.fillStyle = '#27272a';
      ctx.fillRect(cx + 4, y - 5, 11, 7);
      ctx.fillStyle = '#ffffff'; // Cinta
      ctx.fillRect(cx - 2, y - 6, 6, 3);

      // Rostro concentrado
      ctx.fillStyle = skinDeep;
      ctx.fillRect(cx + 5, y + 2, 10, 8);
      ctx.fillStyle = skinMid;
      ctx.fillRect(cx + 6, y + 2, 8, 7);
      ctx.fillStyle = skinHigh;
      ctx.fillRect(cx + 7, y + 3, 6, 4);
      ctx.fillStyle = '#09090b';
      ctx.fillRect(cx + 10, y + 4, 2, 2);

      // Chaleco marcial verde esmeralda y torso
      ctx.fillStyle = '#064e3b';
      ctx.fillRect(cx + 2, y + 10, 14, 15);
      ctx.fillStyle = '#059669';
      ctx.fillRect(cx + 3, y + 11, 12, 13);
      ctx.fillStyle = '#34d399';
      ctx.fillRect(cx + 4, y + 11, 4, 6);
      // Katana en la cintura
      ctx.fillStyle = '#18181b';
      ctx.fillRect(cx - 4, y + 18, 18, 3); // Vaina
      ctx.fillStyle = '#facc15'; // Tsuba dorada
      ctx.fillRect(cx + 8, y + 17, 3, 5);

      // Brazos y ataques
      if (action === 'punch1' || action === 'punch2' || action === 'punch3') {
        // Corte rápido de katana
        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(cx + 14, y + 8, 20, 3);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(cx + 15, y + 7, 18, 2);
        ctx.fillStyle = '#facc15';
        ctx.fillRect(cx + 12, y + 7, 3, 5);
      } else if (action === 'special') {
        // Dancing Blade con gran estela de acero brillante
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(cx - 10, y + 4, 42, 6);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(cx - 12, y + 6, 46, 5);
      } else {
        ctx.fillStyle = skinMid;
        ctx.fillRect(cx + 10, y + 11, 6, 6);
      }

      // Pantalones hakama marciales negros y sandalias
      ctx.fillStyle = '#18181b';
      ctx.fillRect(cx + 2, y + 25, 6, 18);
      ctx.fillRect(cx + 10, y + 25, 6, 18);
      ctx.fillStyle = '#27272a';
      ctx.fillRect(cx + 3, y + 25, 4, 16);
      ctx.fillRect(cx + 11, y + 25, 4, 16);
      ctx.fillStyle = '#713f12'; // Sandalias de cuero
      ctx.fillRect(cx + 2, y + 44, 7, 4);
      ctx.fillRect(cx + 10, y + 44, 7, 4);
    }

    this.cache.set(key, canvas);
    return canvas;
  }

  // --- SPRITES DE ENEMIGOS 16-BIT (ANDORE, SCHOT, JACK, BULL, JEFES) ---

  public getEnemySprite(type: EnemyType, action: string, frame: number, facing: 1 | -1): HTMLCanvasElement {
    const key = `enemy16_${type}_${action}_${frame}_${facing}`;
    if (this.cache.has(key)) return this.cache.get(key)!;

    const isGiant = type.includes('andore') || type.startsWith('boss');
    const width = isGiant ? 68 : 56;
    const height = isGiant ? 68 : 56;
    const { canvas, ctx } = this.createOffscreenCanvas(width, height);

    if (facing === -1) {
      ctx.translate(width, 0);
      ctx.scale(-1, 1);
    }

    const cx = isGiant ? 18 : 16;
    const bobY = (frame % 2) * 2;
    const y = (isGiant ? 4 : 8) + bobY;

    // 1. CLAN ANDORE (Andore Jr, Andore estándar, Gran Andore)
    if (type === 'andore_jr' || type === 'andore' || type === 'g_andore') {
      const isGrand = type === 'g_andore';
      const isJr = type === 'andore_jr';
      // Malla: Jr = Azul, Estándar = Leopardo/Rojo, Gran Andore = Gris Acero
      const singletColor = isJr ? '#1d4ed8' : isGrand ? '#475569' : '#dc2626';

      // Pelo afro rizado y rostro rudo
      ctx.fillStyle = '#291305';
      ctx.fillRect(cx + 4, y - 6, 18, 10);
      ctx.fillStyle = '#451a03';
      ctx.fillRect(cx + 5, y - 5, 16, 8);
      // Rostro
      ctx.fillStyle = '#d97706';
      ctx.fillRect(cx + 6, y + 2, 14, 10);
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(cx + 8, y + 3, 10, 6);
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(cx + 14, y + 4, 3, 2);

      // Torso gigante de luchador profesional
      ctx.fillStyle = '#b45309';
      ctx.fillRect(cx, y + 12, 24, 20);
      ctx.fillStyle = '#d97706';
      ctx.fillRect(cx + 2, y + 12, 20, 18);
      ctx.fillStyle = singletColor; // Malla de lucha
      ctx.fillRect(cx + 4, y + 18, 16, 14);
      ctx.fillStyle = '#fcd34d'; // Motas si es estándar
      if (!isJr && !isGrand) {
        ctx.fillRect(cx + 6, y + 20, 2, 2);
        ctx.fillRect(cx + 12, y + 22, 2, 2);
      }

      // Brazos masivos
      if (action === 'attack') {
        ctx.fillStyle = '#b45309';
        ctx.fillRect(cx + 18, y + 12, 20, 10);
        ctx.fillStyle = '#d97706';
        ctx.fillRect(cx + 19, y + 13, 18, 8);
      } else {
        ctx.fillStyle = '#b45309';
        ctx.fillRect(cx + 16, y + 14, 8, 12);
      }

      // Pantalones de lucha y botas
      ctx.fillStyle = '#1c1917';
      ctx.fillRect(cx + 3, y + 32, 7, 16);
      ctx.fillRect(cx + 13, y + 32, 7, 16);
      ctx.fillStyle = singletColor;
      ctx.fillRect(cx + 2, y + 48, 9, 6);
      ctx.fillRect(cx + 12, y + 48, 9, 6);

    // 2. PUNKS CALLEJEROS (Schot con chaqueta verde, Jack con chaqueta azul)
    } else if (type === 'schot' || type === 'jack') {
      const vestColor = type === 'schot' ? '#16a34a' : '#0284c7';
      const vestShade = type === 'schot' ? '#14532d' : '#0369a1';

      // Cresta punk teñida
      ctx.fillStyle = '#7e22ce';
      ctx.fillRect(cx + 5, y - 6, 6, 9);
      ctx.fillStyle = '#a855f7';
      ctx.fillRect(cx + 6, y - 6, 4, 7);

      // Rostro
      ctx.fillStyle = '#e09874';
      ctx.fillRect(cx + 4, y + 2, 9, 8);
      ctx.fillStyle = '#fed7aa';
      ctx.fillRect(cx + 5, y + 3, 7, 6);
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(cx + 9, y + 4, 2, 2);

      // Chaleco motero de cuero con remaches metálicos
      ctx.fillStyle = vestShade;
      ctx.fillRect(cx + 2, y + 10, 12, 14);
      ctx.fillStyle = vestColor;
      ctx.fillRect(cx + 3, y + 11, 10, 12);
      ctx.fillStyle = '#e2e8f0'; // Remaches metálicos
      ctx.fillRect(cx + 3, y + 12, 2, 2);
      ctx.fillRect(cx + 10, y + 12, 2, 2);

      if (action === 'attack') {
        ctx.fillStyle = '#e09874';
        ctx.fillRect(cx + 12, y + 10, 16, 5);
      } else {
        ctx.fillStyle = '#e09874';
        ctx.fillRect(cx + 10, y + 12, 6, 7);
      }

      // Vaqueros rasgados y botas con tachuelas
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(cx + 3, y + 24, 4, 14);
      ctx.fillRect(cx + 8, y + 24, 4, 14);
      ctx.fillStyle = '#475569';
      ctx.fillRect(cx + 4, y + 26, 2, 4); // Desgaste rodilla
      ctx.fillStyle = '#09090b';
      ctx.fillRect(cx + 2, y + 38, 5, 4);
      ctx.fillRect(cx + 8, y + 38, 5, 4);

    // 3. MATONES BULL (Calvo con chaleco marrón)
    } else if (type === 'bull' || type === 'elijah') {
      ctx.fillStyle = '#7c2d12';
      ctx.fillRect(cx + 4, y - 4, 10, 8);
      ctx.fillStyle = '#fed7aa';
      ctx.fillRect(cx + 5, y + 2, 9, 8);

      ctx.fillStyle = '#854d0e';
      ctx.fillRect(cx + 2, y + 10, 14, 16);

      if (action === 'attack') {
        ctx.fillStyle = '#fed7aa';
        ctx.fillRect(cx + 14, y + 9, 18, 7);
      } else {
        ctx.fillStyle = '#fed7aa';
        ctx.fillRect(cx + 10, y + 12, 6, 8);
      }

      ctx.fillStyle = '#1c1917';
      ctx.fillRect(cx + 3, y + 26, 5, 14);
      ctx.fillRect(cx + 9, y + 26, 5, 14);

    // 4. JEFES DE ETAPA (Won Won, Freddie, Retu)
    } else {
      if (type === 'boss_won') {
        // Won Won (Hong Kong): Delantal blanco de carnicero y machete de acero gigante
        ctx.fillStyle = '#b45309';
        ctx.fillRect(cx + 3, y - 4, 16, 10);
        ctx.fillStyle = '#fed7aa';
        ctx.fillRect(cx + 5, y + 3, 12, 9);
        // Delantal manchado
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(cx + 2, y + 12, 18, 20);
        ctx.fillStyle = '#ef4444'; // Salpicaduras de salsa roja
        ctx.fillRect(cx + 6, y + 16, 3, 4);
        ctx.fillRect(cx + 12, y + 22, 4, 3);
        // Gran machete de carnicero con hoja de acero
        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(cx + 16, y + 10, 18, 9);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(cx + 17, y + 9, 16, 2);
      } else if (type === 'boss_fred') {
        // Freddie (París): Boina militar roja y uniforme de camuflaje
        ctx.fillStyle = '#dc2626'; // Boina militar
        ctx.fillRect(cx + 4, y - 6, 16, 7);
        ctx.fillStyle = '#365314'; // Camuflaje
        ctx.fillRect(cx + 2, y + 12, 18, 20);
      } else {
        // Retu (Japón): Traje kabuki imperial y maquillaje de guerra
        ctx.fillStyle = '#1e1b4b';
        ctx.fillRect(cx + 4, y - 6, 16, 8);
        ctx.fillStyle = '#ffffff'; // Pintura kabuki blanca
        ctx.fillRect(cx + 5, y + 2, 14, 9);
        ctx.fillStyle = '#dc2626'; // Franjas de guerra rojas
        ctx.fillRect(cx + 7, y + 3, 2, 6);
        ctx.fillRect(cx + 13, y + 3, 2, 6);
        ctx.fillStyle = '#831843'; // Kimono imperial
        ctx.fillRect(cx + 1, y + 11, 20, 22);
      }

      ctx.fillStyle = '#0f172a';
      ctx.fillRect(cx + 3, y + 34, 7, 16);
      ctx.fillRect(cx + 12, y + 34, 7, 16);
    }

    this.cache.set(key, canvas);
    return canvas;
  }

  // --- CONSUMIBLES (Comidas cuantitativas de Final Fight 2) ---
  public getFoodSprite(type: 'meat' | 'pizza' | 'bread' | 'soda'): HTMLCanvasElement {
    const key = `food16_${type}`;
    if (this.cache.has(key)) return this.cache.get(key)!;

    const { canvas, ctx } = this.createOffscreenCanvas(28, 28);

    if (type === 'meat') {
      // Carne Asada / Roast Barbecue en plato (+100% vitalidad)
      ctx.fillStyle = '#451a03';
      ctx.fillRect(4, 5, 20, 14);
      ctx.fillStyle = '#9a3412';
      ctx.fillRect(6, 7, 16, 10);
      ctx.fillStyle = '#f97316';
      ctx.fillRect(8, 9, 12, 6);
      ctx.fillStyle = '#f8fafc'; // Huesos laterales
      ctx.fillRect(2, 9, 4, 5);
      ctx.fillRect(22, 9, 4, 5);
    } else if (type === 'pizza') {
      // Pizza (+50% vitalidad)
      ctx.fillStyle = '#b45309';
      ctx.fillRect(4, 4, 18, 5);
      ctx.fillStyle = '#facc15'; // Queso fundido
      ctx.fillRect(6, 8, 14, 12);
      ctx.fillStyle = '#dc2626'; // Pepperoni
      ctx.fillRect(8, 10, 4, 4);
      ctx.fillRect(14, 14, 4, 4);
    } else if (type === 'bread') {
      // Hogaza de pan (+25% vitalidad)
      ctx.fillStyle = '#78350f';
      ctx.fillRect(4, 8, 18, 10);
      ctx.fillStyle = '#b45309';
      ctx.fillRect(6, 9, 14, 7);
      ctx.fillStyle = '#d97706';
      ctx.fillRect(7, 10, 12, 3);
    } else {
      // Lata de refresco (+12% vitalidad)
      ctx.fillStyle = '#991b1b';
      ctx.fillRect(7, 4, 14, 18);
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(8, 5, 12, 16);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(9, 9, 10, 5);
    }

    this.cache.set(key, canvas);
    return canvas;
  }

  // --- OBJETOS DESTRUCTIBLES DEL ESCENARIO ---
  public getPropSprite(type: 'barrel' | 'crate' | 'trashcan' | 'car' | 'phonebooth' | 'mine'): HTMLCanvasElement {
    const key = `prop16_${type}`;
    if (this.cache.has(key)) return this.cache.get(key)!;

    const isCar = type === 'car';
    const isPhone = type === 'phonebooth';
    const width = isCar ? 56 : isPhone ? 28 : 32;
    const height = isCar ? 34 : isPhone ? 48 : 32;
    const { canvas, ctx } = this.createOffscreenCanvas(width, height);

    if (type === 'car') {
      // Coche chatarra destrozado estilo arcade Slum Final Fight
      // Ruedas y bajos
      ctx.fillStyle = '#09090b';
      ctx.fillRect(4, 22, 12, 11);
      ctx.fillRect(38, 22, 12, 11);
      ctx.fillStyle = '#27272a'; // Llantas desgastadas
      ctx.fillRect(7, 25, 6, 6);
      ctx.fillRect(41, 25, 6, 6);

      // Chasis de chapa abollada roja y morada
      ctx.fillStyle = '#7f1d1d';
      ctx.fillRect(2, 14, 52, 11);
      ctx.fillStyle = '#991b1b';
      ctx.fillRect(3, 13, 50, 10);
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(4, 12, 48, 4);

      // Cabina y techo abollado
      ctx.fillStyle = '#1e1b4b';
      ctx.fillRect(14, 4, 26, 10);
      // Parabrisas y ventanas rotas con telaraña de grietas
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(16, 6, 10, 6);
      ctx.fillRect(28, 6, 10, 6);
      ctx.fillStyle = '#f8fafc'; // Grietas blancas
      ctx.fillRect(20, 7, 2, 5);
      ctx.fillRect(32, 8, 3, 3);

      // Parachoques y faros rotos
      ctx.fillStyle = '#64748b';
      ctx.fillRect(1, 20, 4, 5);
      ctx.fillRect(51, 20, 4, 5);
      ctx.fillStyle = '#facc15'; // Faro roto parpadeante
      ctx.fillRect(52, 17, 3, 3);

      // Grafiti en la puerta: "BASADO"
      ctx.fillStyle = '#f43f5e';
      ctx.font = 'bold 6px sans-serif';
      ctx.fillText('BASADO', 16, 21);

    } else if (type === 'phonebooth') {
      // Cabina telefónica clásica amarilla/madera de la calle
      ctx.fillStyle = '#713f12'; // Marco profundo
      ctx.fillRect(2, 2, 24, 44);
      ctx.fillStyle = '#eab308'; // Estructura amarilla arcade
      ctx.fillRect(3, 3, 22, 42);
      ctx.fillStyle = '#ca8a04';
      ctx.fillRect(5, 5, 18, 38);

      // Letrero superior "TELEPHONE"
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(4, 4, 20, 6);
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(6, 6, 16, 2);

      // Cristales transparentes con reflejos diagonales
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(5, 12, 8, 16);
      ctx.fillRect(15, 12, 8, 16);
      ctx.fillStyle = '#e0f2fe';
      ctx.fillRect(7, 14, 2, 10);
      ctx.fillRect(17, 14, 2, 10);

      // Teléfono interior negro y cable espiral
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(11, 16, 6, 9);
      ctx.fillStyle = '#e2e8f0'; // Auricular
      ctx.fillRect(10, 15, 3, 7);

    } else if (type === 'barrel') {
      // Barril de madera con aros metálicos
      ctx.fillStyle = '#451a03';
      ctx.fillRect(4, 3, 24, 26);
      ctx.fillStyle = '#78350f';
      ctx.fillRect(3, 6, 26, 20);
      ctx.fillStyle = '#92400e';
      ctx.fillRect(5, 7, 22, 18);
      // Remaches y aros de hierro
      ctx.fillStyle = '#334155';
      ctx.fillRect(3, 9, 26, 4);
      ctx.fillRect(3, 20, 26, 4);
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(5, 10, 3, 2);
      ctx.fillRect(15, 10, 3, 2);
      ctx.fillRect(24, 10, 3, 2);
    } else if (type === 'crate') {
      // Caja de madera reforzada
      ctx.fillStyle = '#451a03';
      ctx.fillRect(2, 2, 28, 28);
      ctx.fillStyle = '#854d0e';
      ctx.fillRect(4, 4, 24, 24);
      ctx.fillStyle = '#a16207';
      ctx.fillRect(6, 6, 20, 20);
      // Marco y diagonales reforzadas
      ctx.fillStyle = '#542d11';
      ctx.fillRect(4, 4, 24, 3);
      ctx.fillRect(4, 25, 24, 3);
      ctx.fillRect(4, 4, 3, 24);
      ctx.fillRect(25, 4, 3, 24);
      ctx.fillRect(8, 8, 16, 3);
      ctx.fillRect(8, 21, 16, 3);
    } else if (type === 'mine') {
      // Mina trampa eléctrica
      ctx.fillStyle = '#09090b';
      ctx.fillRect(4, 16, 24, 12);
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(10, 18, 12, 6);
      ctx.fillStyle = '#fecdd3';
      ctx.fillRect(14, 20, 4, 2);
    } else {
      // Caneca metálica galvanizada de callejón
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(4, 4, 24, 24);
      ctx.fillStyle = '#475569';
      ctx.fillRect(6, 6, 20, 22);
      ctx.fillStyle = '#64748b';
      ctx.fillRect(8, 8, 16, 18);
      // Tapa metálica
      ctx.fillStyle = '#334155';
      ctx.fillRect(2, 2, 28, 4);
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(11, 1, 10, 2);
    }

    this.cache.set(key, canvas);
    return canvas;
  }
}

export const pixelSprites = new PixelArtRenderer();
