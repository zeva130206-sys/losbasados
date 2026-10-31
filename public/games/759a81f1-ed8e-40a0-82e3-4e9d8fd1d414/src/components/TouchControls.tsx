/**
 * Controles Táctiles en Pantalla 100% Funcionales para Móviles, Tablets y Navegadores Táctiles
 * Comunica directamente con el subsistema `gameEngine.setTouchDirection()` y `gameEngine.setTouchButton()`
 * con captura de puntero individual (multi-touch simultáneo para mover y golpear a la vez).
 */

import React, { useRef, useState, useEffect } from 'react';
import { gameEngine } from '../game/engine';

interface TouchControlsProps {
  specialReady: boolean;
  onTagPartner: () => void;
}

export const TouchControls: React.FC<TouchControlsProps> = ({ specialReady, onTagPartner }) => {
  const dpadRef = useRef<HTMLDivElement>(null);
  const [knobPos, setKnobPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [activeDirections, setActiveDirections] = useState<{ up: boolean; down: boolean; left: boolean; right: boolean }>({
    up: false,
    down: false,
    left: false,
    right: false
  });
  const [activeButtons, setActiveButtons] = useState<{ jump: boolean; punch: boolean; kick: boolean; special: boolean }>({
    jump: false,
    punch: false,
    kick: false,
    special: false
  });

  // Haptic feedback en dispositivos compatibles
  const triggerHaptic = (ms: number = 25) => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try {
        navigator.vibrate(ms);
      } catch {
        // Ignorar
      }
    }
  };

  // 1. MANEJO DEL JOYSTICK / D-PAD VIRTUAL
  const handleDpadStart = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    updateDpadMovement(e.clientX, e.clientY);
    triggerHaptic(20);
  };

  const handleDpadMove = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.buttons > 0 || e.pointerType === 'touch') {
      updateDpadMovement(e.clientX, e.clientY);
    }
  };

  const handleDpadEnd = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setKnobPos({ x: 0, y: 0 });
    setActiveDirections({ up: false, down: false, left: false, right: false });
    gameEngine.setTouchDirection(false, false, false, false);
  };

  const updateDpadMovement = (clientX: number, clientY: number) => {
    if (!dpadRef.current) return;
    const rect = dpadRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const rawDx = clientX - centerX;
    const rawDy = clientY - centerY;
    const maxRadius = rect.width / 2 - 12;

    const dist = Math.hypot(rawDx, rawDy);
    const angle = Math.atan2(rawDy, rawDx);

    const clampedDist = Math.min(dist, maxRadius);
    const knobX = Math.cos(angle) * clampedDist;
    const knobY = Math.sin(angle) * clampedDist;
    setKnobPos({ x: knobX, y: knobY });

    const threshold = 14;
    const left = rawDx < -threshold;
    const right = rawDx > threshold;
    const up = rawDy < -threshold;
    const down = rawDy > threshold;

    setActiveDirections({ up, down, left, right });
    gameEngine.setTouchDirection(left, right, up, down);
  };

  // 2. MANEJO DE BOTONES DE ACCIÓN (JUMP, PUNCH, KICK, SPECIAL)
  const handleBtnDown = (action: 'jump' | 'punch' | 'kick' | 'special', e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);

    setActiveButtons(prev => ({ ...prev, [action]: true }));
    gameEngine.setTouchButton(action, true);
    triggerHaptic(action === 'special' ? 50 : 30);
  };

  const handleBtnUp = (action: 'jump' | 'punch' | 'kick' | 'special', e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setActiveButtons(prev => ({ ...prev, [action]: false }));
    gameEngine.setTouchButton(action, false);
  };

  // Limpiar estados si se pierde el foco
  useEffect(() => {
    return () => {
      gameEngine.setTouchDirection(false, false, false, false);
      gameEngine.setTouchButton('jump', false);
      gameEngine.setTouchButton('punch', false);
      gameEngine.setTouchButton('kick', false);
      gameEngine.setTouchButton('special', false);
    };
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none select-none z-30 flex flex-col justify-between p-2 sm:p-5">
      {/* Botón superior de TAG partner rápido */}
      <div className="flex justify-end pointer-events-auto mt-14 sm:mt-16 mr-1">
        <button
          onPointerDown={(e) => {
            e.preventDefault();
            triggerHaptic(35);
            gameEngine.setTouchButton('tag', true);
            onTagPartner();
          }}
          className="bg-gradient-to-r from-amber-500 to-yellow-500 active:from-amber-600 active:to-yellow-600 border-2 border-amber-300 text-slate-950 font-black px-3.5 py-1.5 rounded-lg font-pixel text-[10px] shadow-2xl flex items-center gap-1.5 active:scale-95 transition-transform cursor-pointer"
        >
          <span className="text-sm">🔄</span>
          <span>TAG PARTNER</span>
        </button>
      </div>

      {/* Barra inferior: D-PAD / Joystick a la izquierda, Botones a la derecha */}
      <div className="flex items-end justify-between w-full pointer-events-none pb-2 sm:pb-4">
        {/* D-PAD / ANALOG JOYSTICK TÁCTIL */}
        <div className="flex flex-col items-center pointer-events-auto">
          <div
            ref={dpadRef}
            onPointerDown={handleDpadStart}
            onPointerMove={handleDpadMove}
            onPointerUp={handleDpadEnd}
            onPointerCancel={handleDpadEnd}
            className="w-36 h-36 sm:w-40 sm:h-40 relative bg-slate-950/85 border-2 border-slate-700 rounded-full shadow-2xl backdrop-blur-md touch-none flex items-center justify-center cursor-pointer active:border-emerald-500/80 transition-colors"
          >
            {/* Cruz Guía */}
            <div className="absolute w-28 h-28 pointer-events-none">
              {/* Arriba */}
              <div
                className={`absolute top-0 left-1/2 -translate-x-1/2 w-8 h-8 rounded-t flex items-center justify-center font-pixel text-xs border-t-2 border-x-2 transition-colors ${
                  activeDirections.up
                    ? 'bg-emerald-500 text-black border-emerald-300 shadow-md shadow-emerald-500/50'
                    : 'bg-slate-900/90 text-slate-400 border-slate-700'
                }`}
              >
                ▲
              </div>
              {/* Abajo */}
              <div
                className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-8 rounded-b flex items-center justify-center font-pixel text-xs border-b-2 border-x-2 transition-colors ${
                  activeDirections.down
                    ? 'bg-emerald-500 text-black border-emerald-300 shadow-md shadow-emerald-500/50'
                    : 'bg-slate-900/90 text-slate-400 border-slate-700'
                }`}
              >
                ▼
              </div>
              {/* Izquierda */}
              <div
                className={`absolute left-0 top-1/2 -translate-y-1/2 w-8 h-8 rounded-l flex items-center justify-center font-pixel text-xs border-l-2 border-y-2 transition-colors ${
                  activeDirections.left
                    ? 'bg-emerald-500 text-black border-emerald-300 shadow-md shadow-emerald-500/50'
                    : 'bg-slate-900/90 text-slate-400 border-slate-700'
                }`}
              >
                ◀
              </div>
              {/* Derecha */}
              <div
                className={`absolute right-0 top-1/2 -translate-y-1/2 w-8 h-8 rounded-r flex items-center justify-center font-pixel text-xs border-r-2 border-y-2 transition-colors ${
                  activeDirections.right
                    ? 'bg-emerald-500 text-black border-emerald-300 shadow-md shadow-emerald-500/50'
                    : 'bg-slate-900/90 text-slate-400 border-slate-700'
                }`}
              >
                ▶
              </div>
            </div>

            {/* Pomo Central Móvil (Joystick Thumb) */}
            <div
              className="absolute w-12 h-12 rounded-full bg-gradient-to-b from-slate-700 via-slate-800 to-slate-900 border-2 border-emerald-400/80 shadow-xl flex items-center justify-center pointer-events-none transition-transform duration-75"
              style={{
                transform: `translate(${knobPos.x}px, ${knobPos.y}px)`
              }}
            >
              <div className="w-5 h-5 rounded-full bg-emerald-500/40 border border-emerald-300" />
            </div>
          </div>
          <span className="font-pixel text-[8px] text-slate-400 mt-1">D-PAD 8-DIR</span>
        </div>

        {/* BOTONES DE ACCIÓN ARCADE (DIAMANTE SNES / CPS-1) */}
        <div className="relative w-44 h-44 sm:w-48 sm:h-48 pointer-events-auto touch-none">
          {/* Botón Salto (Abajo - Verde A) */}
          <button
            onPointerDown={(e) => handleBtnDown('jump', e)}
            onPointerUp={(e) => handleBtnUp('jump', e)}
            onPointerCancel={(e) => handleBtnUp('jump', e)}
            className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-14 h-14 sm:w-16 sm:h-16 rounded-full shadow-2xl flex flex-col items-center justify-center cursor-pointer transition-all border-2 ${
              activeButtons.jump
                ? 'bg-emerald-400 border-white scale-95 shadow-emerald-500/80'
                : 'bg-emerald-600 border-emerald-400/90 active:scale-90'
            }`}
          >
            <span className="font-pixel text-[10px] sm:text-xs text-white font-black drop-shadow">SALTO</span>
            <span className="text-[8px] text-emerald-200 font-mono">B</span>
          </button>

          {/* Botón Puñetazo / Clinch (Derecha - Rojo B / Y) */}
          <button
            onPointerDown={(e) => handleBtnDown('punch', e)}
            onPointerUp={(e) => handleBtnUp('punch', e)}
            onPointerCancel={(e) => handleBtnUp('punch', e)}
            className={`absolute right-0 top-1/2 -translate-y-1/2 w-14 h-14 sm:w-16 sm:h-16 rounded-full shadow-2xl flex flex-col items-center justify-center cursor-pointer transition-all border-2 ${
              activeButtons.punch
                ? 'bg-rose-400 border-white scale-95 shadow-rose-500/80'
                : 'bg-rose-600 border-rose-400/90 active:scale-90'
            }`}
          >
            <span className="font-pixel text-[10px] sm:text-xs text-white font-black drop-shadow">PUÑO</span>
            <span className="text-[8px] text-rose-200 font-mono">Y</span>
          </button>

          {/* Botón Patada / Suplex (Izquierda - Ámbar X) */}
          <button
            onPointerDown={(e) => handleBtnDown('kick', e)}
            onPointerUp={(e) => handleBtnUp('kick', e)}
            onPointerCancel={(e) => handleBtnUp('kick', e)}
            className={`absolute left-0 top-1/2 -translate-y-1/2 w-14 h-14 sm:w-16 sm:h-16 rounded-full shadow-2xl flex flex-col items-center justify-center cursor-pointer transition-all border-2 ${
              activeButtons.kick
                ? 'bg-amber-400 border-white scale-95 shadow-amber-500/80'
                : 'bg-amber-600 border-amber-400/90 active:scale-90'
            }`}
          >
            <span className="font-pixel text-[9px] sm:text-[11px] text-white font-black drop-shadow">PATADA</span>
            <span className="text-[8px] text-amber-200 font-mono">X</span>
          </button>

          {/* Botón Furia Especial (Arriba - Azul / Cyan) */}
          <button
            onPointerDown={(e) => handleBtnDown('special', e)}
            onPointerUp={(e) => handleBtnUp('special', e)}
            onPointerCancel={(e) => handleBtnUp('special', e)}
            className={`absolute top-0 left-1/2 -translate-x-1/2 w-14 h-14 sm:w-16 sm:h-16 rounded-full shadow-2xl flex flex-col items-center justify-center cursor-pointer transition-all border-2 ${
              activeButtons.special
                ? 'bg-cyan-300 border-white scale-95 shadow-cyan-400/90'
                : specialReady
                ? 'bg-blue-600 border-cyan-400 ring-4 ring-cyan-400/40 animate-pulse'
                : 'bg-slate-800 border-slate-600 opacity-70'
            }`}
          >
            <span className="font-pixel text-[9px] sm:text-[10px] text-white font-black drop-shadow">FURIA</span>
            <span className="text-[8px] text-cyan-200 font-mono">Y+B</span>
          </button>
        </div>
      </div>
    </div>
  );
};
