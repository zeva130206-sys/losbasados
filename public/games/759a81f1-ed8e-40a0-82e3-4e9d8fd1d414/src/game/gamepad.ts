/**
 * Gestor Universal de Gamepads Robusto y Normalizador de Entradas
 * 
 * Normaliza D-Pad y Sticks Analógicos para Xbox (360/One/Series/XInput),
 * Nintendo Switch (Pro Controller, Joy-Cons emparejados y modo individual),
 * PlayStation (DualShock 4, DualSense PS5) y Mandos Genéricos DirectInput / USB / Smart TV.
 * 
 * Soporta layouts estándar W3C ('standard') y no estándar (''),
 * decodificando POV Hat Switches (Axis 9 / 4 / 5), pares de ejes D-Pad secundarios,
 * y proveyendo un logger/estado de depuración en tiempo real para visualización en pantalla.
 */

import { ControllerBrand, GamepadDebugLogEntry, GamepadInfo, InputState, RawGamepadState } from './types';

export class GamepadManager {
  private activeGamepadIndex: number | null = null;
  private previousButtonStates: Map<string, boolean> = new Map(); // key: `${padIndex}_${btnIndex}`
  private previousAxisStates: Map<string, number> = new Map(); // key: `${padIndex}_${axisIndex}`
  private onControllerChangeCallbacks: ((info: GamepadInfo | null) => void)[] = [];
  private currentInfo: GamepadInfo | null = null;

  // Registro de depuración y estado crudo
  private debugLogs: GamepadDebugLogEntry[] = [];
  private readonly MAX_LOGS = 80;
  private latestRawStates: RawGamepadState[] = [];

  // Configuración de zona muerta y umbrales
  private readonly STICK_DEADZONE = 0.20;
  private readonly TRIGGER_THRESHOLD = 0.45;

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('gamepadconnected', this.handleConnected);
      window.addEventListener('gamepaddisconnected', this.handleDisconnected);
    }
  }

  public subscribe(callback: (info: GamepadInfo | null) => void): () => void {
    this.onControllerChangeCallbacks.push(callback);
    callback(this.currentInfo);
    return () => {
      this.onControllerChangeCallbacks = this.onControllerChangeCallbacks.filter(cb => cb !== callback);
    };
  }

  // --- LOGGING Y DIAGNÓSTICO EN TIEMPO REAL ---
  private addLog(type: GamepadDebugLogEntry['type'], message: string) {
    const now = new Date();
    const timeStr = `${now.toTimeString().split(' ')[0]}.${now.getMilliseconds().toString().padStart(3, '0')}`;
    const entry: GamepadDebugLogEntry = {
      id: `${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      time: timeStr,
      type,
      message
    };
    this.debugLogs.unshift(entry);
    if (this.debugLogs.length > this.MAX_LOGS) {
      this.debugLogs.pop();
    }
  }

  public getDebugLogs(): GamepadDebugLogEntry[] {
    return [...this.debugLogs];
  }

  public clearDebugLogs(): void {
    this.debugLogs = [];
    this.addLog('info', 'Historial de registro de mandos reiniciado.');
  }

  public getRawSnapshots(): RawGamepadState[] {
    return this.latestRawStates;
  }

  // --- DETECCIÓN DE MARCA Y VENDOR ---
  public detectBrand(id: string): ControllerBrand {
    const lower = id.toLowerCase();
    // PlayStation
    if (
      lower.includes('054c') ||
      lower.includes('playstation') ||
      lower.includes('dualshock') ||
      lower.includes('dualsense') ||
      lower.includes('sony')
    ) {
      return 'playstation';
    }
    // Xbox & XInput
    if (
      lower.includes('045e') ||
      lower.includes('xbox') ||
      lower.includes('x-box') ||
      lower.includes('microsoft') ||
      lower.includes('xinput') ||
      lower.includes('0e6f') // PDP Xbox controllers
    ) {
      return 'xbox';
    }
    // Nintendo Switch
    if (
      lower.includes('057e') ||
      lower.includes('switch') ||
      lower.includes('joy-con') ||
      lower.includes('pro controller') ||
      lower.includes('nintendo')
    ) {
      return 'switch';
    }
    return 'generic';
  }

  public getDisplayName(brand: ControllerBrand, rawId: string): string {
    const lower = rawId.toLowerCase();
    switch (brand) {
      case 'playstation':
        if (lower.includes('dualsense')) return 'PlayStation 5 DualSense';
        if (lower.includes('dualshock')) return 'PlayStation 4 DualShock';
        return 'PlayStation Controller';
      case 'xbox':
        if (lower.includes('series')) return 'Xbox Series X|S Controller';
        if (lower.includes('360')) return 'Xbox 360 Controller';
        return 'Xbox One / Wireless Controller';
      case 'switch':
        if (lower.includes('joy-con (l)')) return 'Joy-Con Izquierdo (Switch)';
        if (lower.includes('joy-con (r)')) return 'Joy-Con Derecho (Switch)';
        if (lower.includes('pro controller')) return 'Nintendo Switch Pro Controller';
        return 'Nintendo Switch Gamepad';
      case 'generic':
      default:
        if (lower.includes('8bitdo') || lower.includes('2dc8')) return '8BitDo Wireless Gamepad';
        if (lower.includes('dragonrise') || lower.includes('0079')) return 'DragonRise Arcade USB';
        return rawId.length > 30 ? `${rawId.substring(0, 27)}...` : (rawId || 'Mando USB / Smart TV');
    }
  }

  private handleConnected = (e: GamepadEvent) => {
    const gp = e.gamepad;
    this.activeGamepadIndex = gp.index;
    const brand = this.detectBrand(gp.id);
    const displayName = this.getDisplayName(brand, gp.id);
    const hasVibration = !!(
      gp.vibrationActuator ||
      (gp as unknown as { hapticActuators?: unknown[] }).hapticActuators?.length
    );

    this.currentInfo = {
      connected: true,
      id: gp.id,
      brand,
      displayName,
      hasVibration,
      mapping: gp.mapping || 'non-standard',
      axesCount: gp.axes.length,
      buttonsCount: gp.buttons.length
    };

    this.addLog(
      'connect',
      `Mando #${gp.index} conectado: "${displayName}" [Mapping: ${gp.mapping || 'custom'} | Ejes: ${gp.axes.length} | Botones: ${gp.buttons.length}]`
    );

    this.triggerHaptic(100, 0.4, 0.4);
    this.notifySubscribers();
  };

  private handleDisconnected = (e: GamepadEvent) => {
    this.addLog('disconnect', `Mando #${e.gamepad.index} desconectado (${e.gamepad.id})`);
    if (this.activeGamepadIndex === e.gamepad.index) {
      this.activeGamepadIndex = null;
      this.currentInfo = null;
      this.notifySubscribers();
    }
  };

  private notifySubscribers() {
    this.onControllerChangeCallbacks.forEach(cb => cb(this.currentInfo));
  }

  public triggerHaptic(duration: number = 100, weak: number = 0.5, strong: number = 0.5) {
    if (typeof navigator === 'undefined' || !navigator.getGamepads) return;

    try {
      const gamepads = navigator.getGamepads();
      for (const gp of gamepads) {
        if (gp && gp.vibrationActuator) {
          (gp.vibrationActuator as { playEffect?: (type: string, opts: object) => Promise<unknown> }).playEffect?.(
            'dual-rumble',
            {
              startDelay: 0,
              duration,
              weakMagnitude: Math.min(1, Math.max(0, weak)),
              strongMagnitude: Math.min(1, Math.max(0, strong))
            }
          );
        }
      }
    } catch {
      // Ignorar si no está soportado
    }
  }

  // --- DECODIFICACIÓN DE POV HAT / CRUCETA EN EJES ANALÓGICOS ---
  /**
   * Decodifica un eje POV Hat estándar de DirectInput (típicamente Axis 9 o 4/5).
   * Valores canónicos:
   * -1.00: Arriba
   * -0.71: Arriba + Derecha
   * -0.43: Derecha
   * -0.14: Abajo + Derecha
   * +0.14: Abajo
   * +0.43: Abajo + Izquierda
   * +0.71: Izquierda
   * +1.00: Arriba + Izquierda
   * ~1.2857 o > 1.05 o NaN: Neutro
   */
  private parsePovHat(val: number): { up: boolean; down: boolean; left: boolean; right: boolean } | null {
    // Si está fuera del rango normalizado de dirección o cerca de neutro (1.2857)
    if (isNaN(val) || val > 1.05 || (val > -0.05 && val < 0.05)) {
      return null;
    }

    const TOL = 0.12;
    const isNear = (target: number) => Math.abs(val - target) <= TOL;

    if (isNear(-1.0)) return { up: true, down: false, left: false, right: false };
    if (isNear(-0.714)) return { up: true, down: false, left: false, right: true };
    if (isNear(-0.428)) return { up: false, down: false, left: false, right: true };
    if (isNear(-0.142)) return { up: false, down: true, left: false, right: true };
    if (isNear(0.142)) return { up: false, down: true, left: false, right: false };
    if (isNear(0.428)) return { up: false, down: true, left: true, right: false };
    if (isNear(0.714)) return { up: false, down: false, left: true, right: false };
    if (isNear(1.0)) return { up: true, down: false, left: true, right: false };

    return null;
  }

  /**
   * Encuesta de todos los mandos conectados en cada fotograma.
   * Realiza la normalización unificada de D-Pad, Sticks y Botones para cualquier vendor.
   * Mapea y normaliza los mandos conectados hacia los estados de entrada de P1 y P2 (Co-op)
   */
  public poll(targetInput: InputState, targetP2?: InputState): void {
    if (typeof navigator === 'undefined' || !navigator.getGamepads) return;

    const gamepads = navigator.getGamepads();
    let anyGamepadFound = false;
    let activePadCount = 0;
    const rawSnapshots: RawGamepadState[] = [];

    for (let i = 0; i < gamepads.length; i++) {
      const gp = gamepads[i];
      if (!gp || !gp.connected) continue;

      const currentTarget = (activePadCount === 1 && targetP2) ? targetP2 : targetInput;
      activePadCount++;
      anyGamepadFound = true;
      const brand = this.detectBrand(gp.id);
      const displayName = this.getDisplayName(brand, gp.id);

      // Actualizar info activa si es necesario
      if (!this.currentInfo || this.activeGamepadIndex === null) {
        this.activeGamepadIndex = gp.index;
        this.currentInfo = {
          connected: true,
          id: gp.id,
          brand,
          displayName,
          hasVibration: !!gp.vibrationActuator,
          mapping: gp.mapping || 'non-standard',
          axesCount: gp.axes.length,
          buttonsCount: gp.buttons.length
        };
        this.notifySubscribers();
      }

      const buttons = gp.buttons;
      const axes = gp.axes;

      const isBtnPressed = (btnIdx: number) => {
        if (btnIdx < 0 || btnIdx >= buttons.length || !buttons[btnIdx]) return false;
        return buttons[btnIdx].pressed || buttons[btnIdx].value > this.TRIGGER_THRESHOLD;
      };

      const getBtnValue = (btnIdx: number) => {
        if (btnIdx < 0 || btnIdx >= buttons.length || !buttons[btnIdx]) return 0;
        return buttons[btnIdx].value;
      };

      // -------------------------------------------------------------
      // 1. NORMALIZACIÓN DE STICK ANALÓGICO IZQUIERDO (MOVIMIENTO CONTINUO)
      // -------------------------------------------------------------
      let rawStickX = 0;
      let rawStickY = 0;
      let stickMovementSource = '';

      // A) Comprobación primaria: Ejes 0 y 1 (estándar en el 95% de mandos)
      if (axes.length >= 2) {
        rawStickX = axes[0];
        rawStickY = axes[1];
      }

      // Manejo de Joy-Con individual girado 90° (Switch)
      const lowerId = gp.id.toLowerCase();
      if (lowerId.includes('joy-con (l)') && gp.mapping !== 'standard') {
        // En Joy-Con L no-estándar, los ejes suelen estar rotados
        const tempX = rawStickX;
        rawStickX = rawStickY;
        rawStickY = -tempX;
      } else if (lowerId.includes('joy-con (r)') && gp.mapping !== 'standard') {
        const tempX = rawStickX;
        rawStickX = -rawStickY;
        rawStickY = tempX;
      }

      // Aplicar zona muerta radial para evitar stick drift
      let normStickX = 0;
      let normStickY = 0;
      const stickMagnitude = Math.hypot(rawStickX, rawStickY);

      if (stickMagnitude > this.STICK_DEADZONE) {
        const factor = Math.min(1, (stickMagnitude - this.STICK_DEADZONE) / (1 - this.STICK_DEADZONE));
        normStickX = (rawStickX / stickMagnitude) * factor;
        normStickY = (rawStickY / stickMagnitude) * factor;
        stickMovementSource = `Stick Izq (Ejes 0/1) [mag: ${stickMagnitude.toFixed(2)}]`;
      } else if (axes.length >= 4) {
        // B) Fallback para mandos genéricos donde el stick analógico está en ejes 2 y 3:
        // Aseguramos que NO sean gatillos (los gatillos DirectInput suelen reposar en -1.0 constante o 0.0)
        const altX = axes[2];
        const altY = axes[3];
        const isNotTrigger = Math.abs(altX) <= 0.98 && Math.abs(altY) <= 0.98;
        const altMag = Math.hypot(altX, altY);

        if (isNotTrigger && altMag > this.STICK_DEADZONE) {
          const factor = Math.min(1, (altMag - this.STICK_DEADZONE) / (1 - this.STICK_DEADZONE));
          normStickX = (altX / altMag) * factor;
          normStickY = (altY / altMag) * factor;
          stickMovementSource = `Stick Alt (Ejes 2/3) [mag: ${altMag.toFixed(2)}]`;
        }
      }

      // -------------------------------------------------------------
      // 2. NORMALIZACIÓN DE D-PAD / CRUCETA DIRECCIONAL (ROBUSTA)
      // -------------------------------------------------------------
      let dpadUp = false;
      let dpadDown = false;
      let dpadLeft = false;
      let dpadRight = false;
      let dpadSource = '';

      // A) D-Pad en Botones Estándar W3C: 12 (Arriba), 13 (Abajo), 14 (Izquierda), 15 (Derecha)
      if (buttons.length >= 16) {
        if (isBtnPressed(12)) { dpadUp = true; dpadSource = 'Botón 12 (Arriba)'; }
        if (isBtnPressed(13)) { dpadDown = true; dpadSource = 'Botón 13 (Abajo)'; }
        if (isBtnPressed(14)) { dpadLeft = true; dpadSource = 'Botón 14 (Izquierda)'; }
        if (isBtnPressed(15)) { dpadRight = true; dpadSource = 'Botón 15 (Derecha)'; }
      }

      // B) D-Pad decodificado de POV Hat Switch en Ejes (DirectInput Axis 9, 4, 5, etc.)
      // Probamos Axis 9 (el más frecuente en DirectInput para Xbox 360 y mandos USB de PC)
      if (!dpadUp && !dpadDown && !dpadLeft && !dpadRight) {
        const potentialHatAxes = [9, 4, 5, 6, 7];
        for (const axisIdx of potentialHatAxes) {
          if (axes.length > axisIdx) {
            const parsed = this.parsePovHat(axes[axisIdx]);
            if (parsed) {
              dpadUp = parsed.up;
              dpadDown = parsed.down;
              dpadLeft = parsed.left;
              dpadRight = parsed.right;
              dpadSource = `POV Hat (Eje ${axisIdx}: ${axes[axisIdx].toFixed(2)})`;
              break;
            }
          }
        }
      }

      // C) D-Pad en Ejes Discretos Secundarios (ej. Eje 4 = X DPad, Eje 5 = Y DPad)
      if (!dpadUp && !dpadDown && !dpadLeft && !dpadRight && axes.length >= 6) {
        const dpadAxisX = axes[4];
        const dpadAxisY = axes[5];
        if (Math.abs(dpadAxisX) > 0.6 || Math.abs(dpadAxisY) > 0.6) {
          if (dpadAxisY < -0.6) dpadUp = true;
          if (dpadAxisY > 0.6) dpadDown = true;
          if (dpadAxisX < -0.6) dpadLeft = true;
          if (dpadAxisX > 0.6) dpadRight = true;
          dpadSource = `Ejes D-Pad (4/5: ${dpadAxisX.toFixed(2)}, ${dpadAxisY.toFixed(2)})`;
        }
      }

      // -------------------------------------------------------------
      // 3. COMBINACIÓN DE ENTRADAS DE MOVIMIENTO (STICK + D-PAD)
      // -------------------------------------------------------------
      const moveUp = dpadUp || normStickY < -0.28;
      const moveDown = dpadDown || normStickY > 0.28;
      const moveLeft = dpadLeft || normStickX < -0.28;
      const moveRight = dpadRight || normStickX > 0.28;

      let finalMoveX = normStickX;
      let finalMoveY = normStickY;

      if (dpadLeft && !dpadRight) finalMoveX = -1;
      else if (dpadRight && !dpadLeft) finalMoveX = 1;

      if (dpadUp && !dpadDown) finalMoveY = -1;
      else if (dpadDown && !dpadUp) finalMoveY = 1;

      const movementSource = [dpadSource, stickMovementSource].filter(Boolean).join(' + ') || 'Neutro / Inactivo';

      if (moveUp) currentTarget.up = true;
      if (moveDown) currentTarget.down = true;
      if (moveLeft) currentTarget.left = true;
      if (moveRight) currentTarget.right = true;

      // -------------------------------------------------------------
      // 4. NORMALIZACIÓN DE BOTONES DE ACCIÓN (JUMP, PUNCH, KICK, SPECIAL, TAG, PAUSE)
      // -------------------------------------------------------------
      // Botón 0: Cruz (PS) / A (Xbox) / B (Switch) -> SALTO
      // Botón 1: Círculo (PS) / B (Xbox) / A (Switch) -> PUÑETAZO / ATAQUE
      // Botón 2: Cuadrado (PS) / X (Xbox) / Y (Switch) -> PATADA / AGARRE
      // Botón 3: Triángulo (PS) / Y (Xbox) / X (Switch) -> FURIA / ESPECIAL
      // Botón 4/5: L1 / R1 o LB / RB -> TAG PARTNER
      // Botón 6/7: L2 / R2 o LT / RT -> TAG ALTERNATIVO O ESPECIAL
      // Botón 8/9/16: Select / Start / Options / Menu / Home -> PAUSA
      const jumpPressed = isBtnPressed(0);
      const punchPressed = isBtnPressed(1);
      const kickPressed = isBtnPressed(2);
      const specialPressed = isBtnPressed(3) || (isBtnPressed(0) && isBtnPressed(1)); // Y+B o Botón 3
      const tagPressed = isBtnPressed(4) || isBtnPressed(5) || isBtnPressed(6) || isBtnPressed(7);
      const pausePressed = isBtnPressed(9) || isBtnPressed(8) || isBtnPressed(16);

      // Detección de flanco ascendente (Just Pressed) para este gamepad
      const padPrefix = `${gp.index}_`;
      const prevJump = this.previousButtonStates.get(`${padPrefix}jump`) || false;
      const prevPunch = this.previousButtonStates.get(`${padPrefix}punch`) || false;
      const prevKick = this.previousButtonStates.get(`${padPrefix}kick`) || false;
      const prevSpecial = this.previousButtonStates.get(`${padPrefix}special`) || false;
      const prevTag = this.previousButtonStates.get(`${padPrefix}tag`) || false;
      const prevPause = this.previousButtonStates.get(`${padPrefix}pause`) || false;

      if (jumpPressed) currentTarget.jump = true;
      if (jumpPressed && !prevJump) currentTarget.jumpJustPressed = true;

      if (punchPressed) currentTarget.punch = true;
      if (punchPressed && !prevPunch) currentTarget.punchJustPressed = true;

      if (kickPressed) currentTarget.kick = true;
      if (kickPressed && !prevKick) currentTarget.kickJustPressed = true;

      if (specialPressed) currentTarget.special = true;
      if (specialPressed && !prevSpecial) currentTarget.specialJustPressed = true;

      if (tagPressed && !prevTag) currentTarget.switchPartnerJustPressed = true;
      if (pausePressed && !prevPause) currentTarget.pauseJustPressed = true;

      // Actualizar mapa de estados previos
      this.previousButtonStates.set(`${padPrefix}jump`, jumpPressed);
      this.previousButtonStates.set(`${padPrefix}punch`, punchPressed);
      this.previousButtonStates.set(`${padPrefix}kick`, kickPressed);
      this.previousButtonStates.set(`${padPrefix}special`, specialPressed);
      this.previousButtonStates.set(`${padPrefix}tag`, tagPressed);
      this.previousButtonStates.set(`${padPrefix}pause`, pausePressed);

      // Registrar eventos significativos en el log de depuración (throttled)
      buttons.forEach((btn, bIdx) => {
        const key = `${padPrefix}btn_${bIdx}`;
        const wasPressed = this.previousButtonStates.get(key) || false;
        const nowPressed = btn.pressed || btn.value > this.TRIGGER_THRESHOLD;
        if (nowPressed && !wasPressed) {
          const actionLabel = bIdx === 0 ? ' [SALTO]' : bIdx === 1 ? ' [GOLPE]' : bIdx === 2 ? ' [PATADA]' : bIdx === 3 ? ' [ESPECIAL]' : (bIdx === 4 || bIdx === 5) ? ' [TAG]' : bIdx === 9 ? ' [PAUSA]' : '';
          this.addLog('button', `Pad #${gp.index} Botón ${bIdx}${actionLabel} presionado (val: ${btn.value.toFixed(2)})`);
        }
        this.previousButtonStates.set(key, nowPressed);
      });

      // Registrar movimiento de stick en el log cuando cruza el umbral
      axes.forEach((axisVal, aIdx) => {
        const key = `${padPrefix}axis_${aIdx}`;
        const prevVal = this.previousAxisStates.get(key) ?? 0;
        if (Math.abs(axisVal) > 0.6 && Math.abs(prevVal) <= 0.6) {
          const dir = axisVal > 0 ? '+' : '-';
          this.addLog('axis', `Pad #${gp.index} Eje ${aIdx} deflectado: ${dir}${Math.abs(axisVal).toFixed(2)}`);
        }
        this.previousAxisStates.set(key, axisVal);
      });

      // Crear captura para el overlay de depuración UI
      const rawButtonsSnapshot = Array.from(buttons).map((btn, idx) => ({
        index: idx,
        pressed: btn.pressed || btn.value > this.TRIGGER_THRESHOLD,
        value: btn.value
      }));

      rawSnapshots.push({
        index: gp.index,
        id: gp.id,
        mapping: gp.mapping || 'custom',
        brand,
        displayName,
        connected: gp.connected,
        axes: Array.from(axes),
        buttons: rawButtonsSnapshot,
        normalized: {
          moveX: Number(finalMoveX.toFixed(2)),
          moveY: Number(finalMoveY.toFixed(2)),
          up: moveUp,
          down: moveDown,
          left: moveLeft,
          right: moveRight,
          jump: jumpPressed,
          punch: punchPressed,
          kick: kickPressed,
          special: specialPressed,
          tag: tagPressed,
          pause: pausePressed,
          movementSource
        },
        timestamp: Date.now()
      });

      // Si este mando está enviando inputs, asignarlo como gamepad activo prioritario
      if (
        jumpPressed ||
        punchPressed ||
        kickPressed ||
        specialPressed ||
        moveLeft ||
        moveRight ||
        moveUp ||
        moveDown ||
        tagPressed ||
        pausePressed
      ) {
        this.activeGamepadIndex = gp.index;
      }
    }

    this.latestRawStates = rawSnapshots;

    if (!anyGamepadFound && this.currentInfo) {
      this.currentInfo = null;
      this.notifySubscribers();
    }
  }

  public getActiveInfo(): GamepadInfo | null {
    return this.currentInfo;
  }
}

export const gamepadManager = new GamepadManager();
