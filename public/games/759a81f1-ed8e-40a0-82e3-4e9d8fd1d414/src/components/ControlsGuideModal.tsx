/**
 * Guía Interactiva de Mandos y Controles - Callejón del Dragón
 * Muestra esquemas visuales para PlayStation 4/5, Xbox One/Series, Nintendo Switch, Teclado PC y Móvil/Tablet.
 */

import React, { useState, useEffect } from 'react';
import { X, Gamepad2, Keyboard, Smartphone, Tv } from 'lucide-react';
import { GamepadInfo } from '../game/types';

interface ControlsGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  gamepadInfo: GamepadInfo | null;
}

export const ControlsGuideModal: React.FC<ControlsGuideModalProps> = ({ isOpen, onClose, gamepadInfo }) => {
  const [activeTab, setActiveTab] = useState<'playstation' | 'xbox' | 'switch' | 'keyboard' | 'touch' | 'tv'>('playstation');
  const [pressedButtons, setPressedButtons] = useState<number[]>([]);

  // Si hay un mando conectado, seleccionar automáticamente su pestaña
  useEffect(() => {
    if (gamepadInfo && gamepadInfo.connected) {
      if (gamepadInfo.brand === 'playstation') setActiveTab('playstation');
      else if (gamepadInfo.brand === 'xbox') setActiveTab('xbox');
      else if (gamepadInfo.brand === 'switch') setActiveTab('switch');
      else setActiveTab('tv');
    }
  }, [gamepadInfo]);

  // Monitor en tiempo real de botones presionados en el mando para feedback interactivo
  useEffect(() => {
    if (!isOpen) return;
    let animId: number;

    const pollButtons = () => {
      if (typeof navigator !== 'undefined' && navigator.getGamepads) {
        const gamepads = navigator.getGamepads();
        for (const gp of gamepads) {
          if (gp && gp.connected) {
            const active: number[] = [];
            gp.buttons.forEach((b, idx) => {
              if (b.pressed || b.value > 0.5) active.push(idx);
            });
            setPressedButtons(active);
            break;
          }
        }
      }
      animId = requestAnimationFrame(pollButtons);
    };

    animId = requestAnimationFrame(pollButtons);
    return () => cancelAnimationFrame(animId);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl bg-slate-950 border-2 border-slate-700 rounded-xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden text-slate-100">
        {/* Cabecera */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-2">
            <Gamepad2 className="w-5 h-5 text-emerald-400" />
            <h2 className="font-pixel text-xs sm:text-sm text-emerald-400 tracking-wider">
              GUÍA DE MANDOS Y CONTROLES
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Pestañas de Plataformas */}
        <div className="flex border-b border-slate-800 bg-slate-950 px-2 pt-2 gap-1 overflow-x-auto text-xs font-pixel scrollbar-none">
          <button
            onClick={() => setActiveTab('playstation')}
            className={`px-3 py-1.5 rounded-t transition-colors cursor-pointer shrink-0 ${
              activeTab === 'playstation' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            PLAYSTATION 4 / 5
          </button>
          <button
            onClick={() => setActiveTab('xbox')}
            className={`px-3 py-1.5 rounded-t transition-colors cursor-pointer shrink-0 ${
              activeTab === 'xbox' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            XBOX ONE / SERIES
          </button>
          <button
            onClick={() => setActiveTab('switch')}
            className={`px-3 py-1.5 rounded-t transition-colors cursor-pointer shrink-0 ${
              activeTab === 'switch' ? 'bg-rose-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            SWITCH PRO
          </button>
          <button
            onClick={() => setActiveTab('keyboard')}
            className={`px-3 py-1.5 rounded-t transition-colors cursor-pointer shrink-0 ${
              activeTab === 'keyboard' ? 'bg-amber-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            TECLADO PC
          </button>
          <button
            onClick={() => setActiveTab('touch')}
            className={`px-3 py-1.5 rounded-t transition-colors cursor-pointer shrink-0 ${
              activeTab === 'touch' ? 'bg-purple-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            MÓVIL / TÁCTIL
          </button>
          <button
            onClick={() => setActiveTab('tv')}
            className={`px-3 py-1.5 rounded-t transition-colors cursor-pointer shrink-0 ${
              activeTab === 'tv' ? 'bg-slate-700 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            SMART TV / USB
          </button>
        </div>

        {/* Estado Interactivo de Botones en Vivo */}
        {gamepadInfo?.connected && (
          <div className="bg-slate-900/90 px-4 py-2 border-b border-slate-800 flex items-center justify-between text-xs font-retro">
            <span className="text-emerald-400 flex items-center gap-1">
              <span>●</span> {gamepadInfo.displayName} Conectado y Activo
            </span>
            <span className="text-slate-400">
              Botones pulsados en vivo: {pressedButtons.length > 0 ? `[${pressedButtons.join(', ')}]` : 'Ninguno'}
            </span>
          </div>
        )}

        {/* Tablas de Mapeo */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 font-sans-ui text-sm">
          {activeTab === 'playstation' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-300 font-retro">
                Compatible con mandos DualShock 4 (PS4) y DualSense (PS5) por Bluetooth y cable USB.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="bg-slate-900 p-2.5 rounded border border-slate-800 flex items-center justify-between">
                  <span className="font-pixel text-blue-400">✖ CRUZ</span>
                  <span className="text-slate-200 font-retro">Salto / Salto con Patada Aérea</span>
                </div>
                <div className="bg-slate-900 p-2.5 rounded border border-slate-800 flex items-center justify-between">
                  <span className="font-pixel text-pink-400">◼ CUADRADO</span>
                  <span className="text-slate-200 font-retro">Ataque / Combo / Golpe en Clinch</span>
                </div>
                <div className="bg-slate-900 p-2.5 rounded border border-slate-800 flex items-center justify-between">
                  <span className="font-pixel text-emerald-400">🔺 TRIÁNGULO</span>
                  <span className="text-slate-200 font-retro">Especial Invencible (Lariat/Bushin/Katana)</span>
                </div>
                <div className="bg-slate-900 p-2.5 rounded border border-slate-800 flex items-center justify-between">
                  <span className="font-pixel text-rose-400">⭕ CÍRCULO</span>
                  <span className="text-slate-200 font-retro">Ataque Secundario / Golpe Rápido</span>
                </div>
                <div className="bg-slate-900 p-2.5 rounded border border-slate-800 flex items-center justify-between">
                  <span className="font-pixel text-cyan-400">AGARRE (CLINCH)</span>
                  <span className="text-slate-200 font-retro">Acércate cuerpo a cuerpo (Automático)</span>
                </div>
                <div className="bg-slate-900 p-2.5 rounded border border-slate-800 flex items-center justify-between">
                  <span className="font-pixel text-rose-300">LANZAMIENTO / SUPLEX</span>
                  <span className="text-slate-200 font-retro">En Agarre: Izq/Der + Cuadrado (Daño AoE)</span>
                </div>
                <div className="bg-slate-900 p-2.5 rounded border border-slate-800 flex items-center justify-between">
                  <span className="font-pixel text-amber-400">L1 / R1</span>
                  <span className="text-slate-200 font-retro">Tag Partner (Maki / Haggar / Carlos)</span>
                </div>
                <div className="bg-slate-900 p-2.5 rounded border border-slate-800 flex items-center justify-between">
                  <span className="font-pixel text-slate-300">D-PAD / STICK IZQ</span>
                  <span className="text-slate-200 font-retro">Movimiento 8-Dir (Plano 2.5D X y Z)</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'xbox' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-300 font-retro">
                Compatible con mandos de Xbox 360, Xbox One, Xbox Series X|S y mandos de PC xInput.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="bg-slate-900 p-2.5 rounded border border-slate-800 flex items-center justify-between">
                  <span className="font-pixel text-emerald-400">BOTÓN A</span>
                  <span className="text-slate-200 font-retro">Salto / Patada en Salto</span>
                </div>
                <div className="bg-slate-900 p-2.5 rounded border border-slate-800 flex items-center justify-between">
                  <span className="font-pixel text-blue-400">BOTÓN X</span>
                  <span className="text-slate-200 font-retro">Ataque / Combo / Golpe en Clinch</span>
                </div>
                <div className="bg-slate-900 p-2.5 rounded border border-slate-800 flex items-center justify-between">
                  <span className="font-pixel text-amber-400">BOTÓN Y</span>
                  <span className="text-slate-200 font-retro">Especial Invencible (Y+B o Dedicado)</span>
                </div>
                <div className="bg-slate-900 p-2.5 rounded border border-slate-800 flex items-center justify-between">
                  <span className="font-pixel text-rose-400">BOTÓN B</span>
                  <span className="text-slate-200 font-retro">Ataque Rápido Secundario</span>
                </div>
                <div className="bg-slate-900 p-2.5 rounded border border-slate-800 flex items-center justify-between">
                  <span className="font-pixel text-cyan-400">CLINCH & LANZAMIENTO</span>
                  <span className="text-slate-200 font-retro">Acércate al enemigo + Izq/Der + X</span>
                </div>
                <div className="bg-slate-900 p-2.5 rounded border border-slate-800 flex items-center justify-between">
                  <span className="font-pixel text-slate-300">LB / RB</span>
                  <span className="text-slate-200 font-retro">Tag Partner (Maki / Haggar / Carlos)</span>
                </div>
                <div className="bg-slate-900 p-2.5 rounded border border-slate-800 flex items-center justify-between">
                  <span className="font-pixel text-slate-300">STICK / CRUCETA</span>
                  <span className="text-slate-200 font-retro">Navegación 2.5D (Lateral y Profundidad Z)</span>
                </div>
                <div className="bg-slate-900 p-2.5 rounded border border-slate-800 flex items-center justify-between">
                  <span className="font-pixel text-slate-300">START / MENU</span>
                  <span className="text-slate-200 font-retro">Pausar Partida</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'switch' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-300 font-retro">
                Compatible con Nintendo Switch Pro Controller y Joy-Cons (mapeo SNES canónico).
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="bg-slate-900 p-2.5 rounded border border-slate-800 flex items-center justify-between">
                  <span className="font-pixel text-amber-400">BOTÓN B (Abajo)</span>
                  <span className="text-slate-200 font-retro">Salto (Canónico SNES Final Fight)</span>
                </div>
                <div className="bg-slate-900 p-2.5 rounded border border-slate-800 flex items-center justify-between">
                  <span className="font-pixel text-blue-400">BOTÓN Y (Izquierda)</span>
                  <span className="text-slate-200 font-retro">Ataque Principal / Clinch / Suplex</span>
                </div>
                <div className="bg-slate-900 p-2.5 rounded border border-slate-800 flex items-center justify-between">
                  <span className="font-pixel text-emerald-400">BOTÓN X (Arriba)</span>
                  <span className="text-slate-200 font-retro">Super Especial (Invencibilidad)</span>
                </div>
                <div className="bg-slate-900 p-2.5 rounded border border-slate-800 flex items-center justify-between">
                  <span className="font-pixel text-rose-400">BOTÓN A (Derecha)</span>
                  <span className="text-slate-200 font-retro">Ataque Rápido Alternativo</span>
                </div>
                <div className="bg-slate-900 p-2.5 rounded border border-slate-800 flex items-center justify-between">
                  <span className="font-pixel text-slate-300">L / R</span>
                  <span className="text-slate-200 font-retro">Tag Partner Instantáneo</span>
                </div>
                <div className="bg-slate-900 p-2.5 rounded border border-slate-800 flex items-center justify-between">
                  <span className="font-pixel text-slate-300">STICK / D-PAD</span>
                  <span className="text-slate-200 font-retro">Movimiento 8 direcciones en el plano Z</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'keyboard' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-300 font-retro">
                Disposición ergonómica estándar Arcade de dos manos (Izquierda: Movimiento 8-Dir · Derecha: Combate y Clinch).
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="bg-slate-900 p-2.5 rounded border border-slate-800 flex items-center justify-between">
                  <span className="font-pixel text-amber-400">W / S · FLECHAS ↑ ↓</span>
                  <span className="text-slate-200 font-retro">Profundidad Z (Subir / Bajar en la calle)</span>
                </div>
                <div className="bg-slate-900 p-2.5 rounded border border-slate-800 flex items-center justify-between">
                  <span className="font-pixel text-amber-400">A / D · FLECHAS ← →</span>
                  <span className="text-slate-200 font-retro">Avanzar / Retroceder por el nivel</span>
                </div>
                <div className="bg-slate-900 p-2.5 rounded border border-slate-800 flex items-center justify-between">
                  <span className="font-pixel text-rose-400">TECLA J / Z</span>
                  <span className="text-slate-200 font-retro">Ataque / Combo / Golpes de Clinch</span>
                </div>
                <div className="bg-slate-900 p-2.5 rounded border border-slate-800 flex items-center justify-between">
                  <span className="font-pixel text-emerald-400">TECLA K / X · ESPACIO</span>
                  <span className="text-slate-200 font-retro">Salto / Patada en salto</span>
                </div>
                <div className="bg-slate-900 p-2.5 rounded border border-slate-800 flex items-center justify-between">
                  <span className="font-pixel text-cyan-400">TECLA L / C</span>
                  <span className="text-slate-200 font-retro">Super Furia Especial (Invencibilidad)</span>
                </div>
                <div className="bg-slate-900 p-2.5 rounded border border-slate-800 flex items-center justify-between">
                  <span className="font-pixel text-amber-300">TECLA Q / TAB</span>
                  <span className="text-slate-200 font-retro">Tag Partner (Maki / Haggar / Carlos)</span>
                </div>
                <div className="bg-slate-900 p-2.5 rounded border border-slate-800 flex items-center justify-between">
                  <span className="font-pixel text-rose-300">EN CLINCH: A/D + J</span>
                  <span className="text-slate-200 font-retro">Lanzamiento / Suplex (Proyectil AoE)</span>
                </div>
                <div className="bg-slate-900 p-2.5 rounded border border-slate-800 flex items-center justify-between">
                  <span className="font-pixel text-slate-300">ESCAPE / P</span>
                  <span className="text-slate-200 font-retro">Pausar / Menú</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'touch' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-300 font-retro">
                Controles virtuales en pantalla con respuesta háptica para teléfonos Android, iPhones, iPads y tablets.
              </p>
              <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 space-y-2 text-xs">
                <div className="flex items-start gap-2">
                  <span className="font-pixel text-amber-400">D-PAD VIRTUAL:</span>
                  <span className="text-slate-300 font-retro">
                    Cruceta táctil en la esquina inferior izquierda. Desliza en 8 direcciones para moverte lateralmente y en profundidad Z por el escenario.
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-pixel text-emerald-400">BOTÓN PUÑO (ROJO):</span>
                  <span className="text-slate-300 font-retro">
                    Ataque primario, combos en cadena, golpes de rodilla/cabeza al atrapar en clinch, o lanzamiento hacia atrás/adelante.
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-pixel text-blue-400">BOTÓN SALTO (VERDE):</span>
                  <span className="text-slate-300 font-retro">
                    Elevación sobre el eje Y. Pulsa Ataque en el aire para ejecutar la patada voladora.
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-pixel text-cyan-400">BOTÓN SUPER (AZUL):</span>
                  <span className="text-slate-300 font-retro">
                    Ataque especial defensivo con invencibilidad temporal que derriba a todos los enemigos a tu alrededor.
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-pixel text-amber-300">BOTÓN TAG (DORADO):</span>
                  <span className="text-slate-300 font-retro">
                    Intercambia instantáneamente entre Maki, Haggar y Carlos en pleno combate.
                  </span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'tv' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-300 font-retro">
                Ideal para televisores inteligentes con Android TV, Apple TV, navegadores web de Smart TV o PC conectada a TV.
              </p>
              <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 space-y-2 text-xs">
                <p className="text-slate-300 font-retro">
                  1. Conecta cualquier mando por Bluetooth o dongle USB 2.4GHz a tu televisor.
                </p>
                <p className="text-slate-300 font-retro">
                  2. El juego utiliza el estándar universal de la Gamepad API de W3C, por lo que el botón inferior siempre será Salto y el lateral Puñetazo.
                </p>
                <p className="text-slate-300 font-retro">
                  3. Presiona el botón START de tu mando para iniciar la partida sin necesidad de tocar un ratón.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Pie */}
        <div className="px-4 py-3 border-t border-slate-800 bg-slate-900/90 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded font-pixel text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-bold cursor-pointer"
          >
            ENTENDIDO
          </button>
        </div>
      </div>
    </div>
  );
};
