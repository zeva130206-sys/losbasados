/**
 * Modal de Configuración y Asignación de Teclas (Key Remapper) para Jugador 1 y Jugador 2
 * Permite cambiar cualquier tecla en el teclado para ambos jugadores de forma individual,
 * persistir en localStorage y visualizar la autodetección de mandos conectados (P1 = Mando 1, P2 = Mando 2).
 */

import React, { useState, useEffect } from 'react';
import { X, RotateCcw, Save, Keyboard, Gamepad2, Check } from 'lucide-react';
import { gameEngine } from '../game/engine';
import { CustomKeyConfig, PlayerKeyBindings, GamepadInfo } from '../game/types';
import { retroAudio } from '../game/audio';

interface KeyRemapModalProps {
  isOpen: boolean;
  onClose: () => void;
  gamepadInfo: GamepadInfo | null;
}

type RemapTarget = {
  player: 'p1' | 'p2';
  action: keyof PlayerKeyBindings;
} | null;

const ACTION_LABELS: Record<keyof PlayerKeyBindings, { name: string; desc: string }> = {
  up: { name: 'Arriba (Eje Z)', desc: 'Moverse hacia el fondo de la calle' },
  down: { name: 'Abajo (Eje Z)', desc: 'Moverse hacia el frente del escenario' },
  left: { name: 'Izquierda', desc: 'Desplazamiento horizontal' },
  right: { name: 'Derecha', desc: 'Desplazamiento horizontal' },
  punch: { name: 'Golpe / Combo', desc: 'Puñetazo básico, combo y clinch' },
  kick: { name: 'Patada', desc: 'Patada frontal y de barrido' },
  jump: { name: 'Saltar', desc: 'Salto vertical y patada aérea' },
  special: { name: 'Super Especial', desc: 'Ataque de 360° / Neo-Furia' },
  tag: { name: 'Relevo / Tag', desc: 'Cambiar de personaje en reserva' },
  pause: { name: 'Pausa / Menú', desc: 'Pausar el combate' }
};

export const KeyRemapModal: React.FC<KeyRemapModalProps> = ({
  isOpen,
  onClose,
  gamepadInfo
}) => {
  const [activeTab, setActiveTab] = useState<'p1' | 'p2' | 'gamepad'>('p1');
  const [currentConfig, setCurrentConfig] = useState<CustomKeyConfig>(() => gameEngine.getKeyConfig());
  const [listeningFor, setListeningFor] = useState<RemapTarget>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setCurrentConfig(gameEngine.getKeyConfig());
      setListeningFor(null);
      setSavedSuccess(false);
    }
  }, [isOpen]);

  // Listener para capturar la siguiente tecla pulsada
  useEffect(() => {
    if (!listeningFor) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const keyName = e.key;

      setCurrentConfig(prev => {
        const updated = {
          ...prev,
          [listeningFor.player]: {
            ...prev[listeningFor.player],
            [listeningFor.action]: keyName
          }
        };
        return updated;
      });

      retroAudio.playPunch();
      setListeningFor(null);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [listeningFor]);

  if (!isOpen) return null;

  const handleStartListening = (player: 'p1' | 'p2', action: keyof PlayerKeyBindings) => {
    retroAudio.playMenuBeep();
    setListeningFor({ player, action });
  };

  const handleSave = () => {
    gameEngine.saveKeyConfig(currentConfig);
    retroAudio.playHeavyPunch();
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 800);
  };

  const handleReset = () => {
    retroAudio.playMenuBeep();
    gameEngine.resetKeyConfig();
    setCurrentConfig(gameEngine.getKeyConfig());
    setListeningFor(null);
  };

  const currentBindings = activeTab === 'p1' ? currentConfig.p1 : currentConfig.p2;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/95 backdrop-blur-md text-slate-100 select-none animate-fade-in">
      <div className="relative w-full max-w-2xl bg-slate-950 border-4 border-amber-500 rounded-2xl shadow-2xl shadow-amber-950/50 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Cabecera */}
        <div className="bg-gradient-to-r from-slate-900 via-amber-950 to-slate-900 border-b-2 border-amber-500/80 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Keyboard className="w-5 h-5 text-amber-400" />
            <h2 className="font-pixel text-xs sm:text-sm text-amber-300 tracking-wider uppercase">
              CONFIGURACIÓN DE CONTROLES (P1 & P2)
            </h2>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Pestañas: Jugador 1 / Jugador 2 / Mandos Gamepad */}
        <div className="flex border-b border-slate-800 bg-slate-900/60 font-pixel text-[10px]">
          <button
            onClick={() => {
              setActiveTab('p1');
              setListeningFor(null);
            }}
            className={`flex-1 py-2.5 px-3 flex items-center justify-center gap-1.5 cursor-pointer transition-colors border-b-2 ${
              activeTab === 'p1'
                ? 'border-amber-400 text-amber-400 bg-slate-900 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            <span>JUGADOR 1 (TECLADO)</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('p2');
              setListeningFor(null);
            }}
            className={`flex-1 py-2.5 px-3 flex items-center justify-center gap-1.5 cursor-pointer transition-colors border-b-2 ${
              activeTab === 'p2'
                ? 'border-rose-400 text-rose-400 bg-slate-900 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            <span>JUGADOR 2 (TECLADO)</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('gamepad');
              setListeningFor(null);
            }}
            className={`flex-1 py-2.5 px-3 flex items-center justify-center gap-1.5 cursor-pointer transition-colors border-b-2 ${
              activeTab === 'gamepad'
                ? 'border-emerald-400 text-emerald-400 bg-slate-900 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Gamepad2 className="w-3.5 h-3.5" />
            <span>MANDOS USB / TV</span>
          </button>
        </div>

        {/* Contenido */}
        <div className="p-4 sm:p-5 flex-1 overflow-y-auto">
          {listeningFor && (
            <div className="mb-4 p-3 bg-amber-500/20 border-2 border-amber-400 rounded-xl text-center animate-pulse">
              <span className="font-pixel text-xs text-amber-300 block">
                ⚡ PRESIONA CUALQUIER TECLA PARA: "{ACTION_LABELS[listeningFor.action].name}" ({listeningFor.player.toUpperCase()})
              </span>
              <span className="text-[10px] font-retro text-slate-300 mt-0.5 block">
                (O presiona ESC para cancelar)
              </span>
            </div>
          )}

          {activeTab !== 'gamepad' ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[10px] font-pixel text-slate-400 px-2 pb-1 border-b border-slate-800">
                <span>ACCIÓN DE COMBATE</span>
                <span>TECLA ASIGNADA (HAZ CLIC PARA CAMBIAR)</span>
              </div>

              {(Object.keys(ACTION_LABELS) as Array<keyof PlayerKeyBindings>).map((action) => {
                const currentKey = currentBindings[action];
                const isListeningThis = listeningFor?.player === activeTab && listeningFor?.action === action;

                return (
                  <div
                    key={action}
                    className={`flex items-center justify-between p-2 rounded-lg border transition-all ${
                      isListeningThis
                        ? 'bg-amber-950/80 border-amber-400 shadow-md ring-2 ring-amber-400'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <span className="font-pixel text-[10px] text-white block">
                        {ACTION_LABELS[action].name}
                      </span>
                      <span className="text-[9px] font-retro text-slate-400">
                        {ACTION_LABELS[action].desc}
                      </span>
                    </div>

                    <button
                      onClick={() => handleStartListening(activeTab, action)}
                      className={`px-3 py-1.5 rounded font-pixel text-xs min-w-[70px] text-center border cursor-pointer transition-colors ${
                        isListeningThis
                          ? 'bg-amber-400 text-black border-amber-300 font-black animate-pulse'
                          : 'bg-black text-amber-300 border-slate-700 hover:border-amber-400'
                      }`}
                    >
                      {isListeningThis ? '...' : (currentKey ? currentKey.toUpperCase() : '---')}
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Vista informativa de Mandos (Gamepad) */
            <div className="space-y-3">
              <div className="bg-slate-900/80 border border-slate-700 rounded-xl p-3">
                <div className="flex items-center gap-2 mb-2 text-emerald-400 font-pixel text-xs">
                  <Gamepad2 className="w-4 h-4" />
                  <span>AUTOCONFIGURACIÓN UNIVERSAL PARA 2 JUGADORES:</span>
                </div>
                <p className="font-sans-ui text-xs text-slate-300 leading-relaxed mb-3">
                  Los mandos conectados vía USB, Bluetooth o TV Box se asignan automáticamente:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px] font-pixel">
                  <div className="p-2.5 rounded-lg bg-black border border-blue-500/50">
                    <span className="text-blue-400 block font-bold mb-1">🎮 MANDO #1 → JUGADOR 1</span>
                    <span className="text-slate-400 font-retro block">D-Pad / Stick: Moverse (Eje Z)</span>
                    <span className="text-slate-400 font-retro block">Botón Sur (A/Cruz): Golpe</span>
                    <span className="text-slate-400 font-retro block">Botón Este (B/Círculo): Salto</span>
                    <span className="text-slate-400 font-retro block">Botón Oeste (X/Cuadrado): Patada</span>
                    <span className="text-slate-400 font-retro block">Gatillo R1/RB: Super Especial Neo-Furia</span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-black border border-rose-500/50">
                    <span className="text-rose-400 block font-bold mb-1">🎮 MANDO #2 → JUGADOR 2</span>
                    <span className="text-slate-400 font-retro block">D-Pad / Stick: Moverse (Eje Z)</span>
                    <span className="text-slate-400 font-retro block">Botón Sur (A/Cruz): Golpe</span>
                    <span className="text-slate-400 font-retro block">Botón Este (B/Círculo): Salto</span>
                    <span className="text-slate-400 font-retro block">Botón Oeste (X/Cuadrado): Patada</span>
                    <span className="text-slate-400 font-retro block">Gatillo R1/RB: Super Especial</span>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-emerald-950/40 border border-emerald-500/50 rounded-xl">
                <span className="font-pixel text-[10px] text-emerald-400 block mb-1">
                  ESTADO ACTUAL DE HARDWARE:
                </span>
                <span className="font-retro text-xs text-slate-300">
                  {gamepadInfo?.connected
                    ? `🟢 ${gamepadInfo.displayName} detectado y listo.`
                    : '⚪ Ningún mando conectado por el momento. Conecta uno para jugar en solitario o dos mandos para Cooperativo 2P.'}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Pie de modal con acciones */}
        <div className="bg-slate-900 border-t border-slate-800 p-3 flex items-center justify-between gap-2">
          <button
            onClick={handleReset}
            className="px-3 py-1.5 rounded-lg font-pixel text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center gap-1 cursor-pointer transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>RESTAURAR POR DEFECTO</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg font-pixel text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 cursor-pointer"
            >
              CANCELAR
            </button>

            <button
              onClick={handleSave}
              className="px-4 py-1.5 rounded-lg font-pixel text-[10px] bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold flex items-center gap-1.5 cursor-pointer shadow-lg shadow-amber-500/30"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-4 h-4 text-emerald-700" />
                  <span>¡GUARDADO!</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>GUARDAR CONTROLES</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
