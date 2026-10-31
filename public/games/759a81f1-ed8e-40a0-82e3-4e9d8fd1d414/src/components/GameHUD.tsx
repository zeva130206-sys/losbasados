/**
 * HUD Superior e Inferior Arcade Estilo Final Fight 2 (Capcom SNES)
 * Barras de vitalidad para Jugador 1 y Jugador 2 (Modo Co-op), puntuaciones separadas,
 * indicador "SIGUE ➔➔" y estado de mandos universales.
 */

import React from 'react';
import { Volume2, VolumeX, Music, Pause, Play, BookOpen, Gamepad2, Smartphone, Globe, Activity } from 'lucide-react';
import { GameDifficulty, GamepadInfo, PlayerEntity } from '../game/types';
import { STAGES_CONFIG } from '../game/story';

interface GameHUDProps {
  player: PlayerEntity;
  player2?: PlayerEntity | null;
  score: number;
  scoreP2?: number;
  stageIndex: number;
  subAreaIndex?: number;
  totalSubAreas?: number;
  subAreaName?: string;
  difficulty?: GameDifficulty;
  isSubAreaCleared?: boolean;
  stageTimer: number;
  isPaused: boolean;
  isMuted: boolean;
  isMusicMuted: boolean;
  gamepadInfo: GamepadInfo | null;
  showTouchControls: boolean;
  onTogglePause: () => void;
  onToggleSound: () => void;
  onToggleMusic: () => void;
  onToggleTouchControls: () => void;
  onOpenStory: () => void;
  onOpenControlsGuide: () => void;
  onOpenDebug: () => void;
  onTagPartner: () => void;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  player,
  player2,
  score,
  scoreP2 = 0,
  stageIndex,
  subAreaIndex = 0,
  totalSubAreas = 11,
  subAreaName = 'Calle Comercial',
  difficulty = 'normal',
  isSubAreaCleared = false,
  isPaused,
  isMuted,
  isMusicMuted,
  gamepadInfo,
  showTouchControls,
  onTogglePause,
  onToggleSound,
  onToggleMusic,
  onToggleTouchControls,
  onOpenStory,
  onOpenControlsGuide,
  onOpenDebug,
  onTagPartner
}) => {
  const hpPercent = Math.max(0, Math.min(100, (player.stats.hp / player.stats.maxHp) * 100));
  const furyPercent = Math.max(0, Math.min(100, (player.stats.specialMeter / player.stats.maxSpecial) * 100));
  const isSpecialReady = player.stats.specialMeter >= player.stats.specialCost;

  const hpPercentP2 = player2 ? Math.max(0, Math.min(100, (player2.stats.hp / player2.stats.maxHp) * 100)) : 0;
  const furyPercentP2 = player2 ? Math.max(0, Math.min(100, (player2.stats.specialMeter / player2.stats.maxSpecial) * 100)) : 0;
  const isSpecialReadyP2 = player2 ? player2.stats.specialMeter >= player2.stats.specialCost : false;

  const currentStage = STAGES_CONFIG[stageIndex] || STAGES_CONFIG[0];

  const getCharIcon = (id: string) => {
    switch (id) {
      case 'vaze': return '🧢';
      case 'cody': return '👊';
      case 'maki': return '🥷';
      case 'haggar': return '💪';
      case 'carlos': return '⚔️';
      default: return '🥊';
    }
  };

  const getDifficultyBadge = () => {
    switch (difficulty) {
      case 'facil':
        return <span className="text-emerald-400 font-pixel text-[8px] border border-emerald-600/60 bg-emerald-950/70 px-1.5 py-0.5 rounded">FÁCIL</span>;
      case 'normal':
        return <span className="text-blue-400 font-pixel text-[8px] border border-blue-600/60 bg-blue-950/70 px-1.5 py-0.5 rounded">NORMAL</span>;
      case 'dificil':
        return <span className="text-amber-400 font-pixel text-[8px] border border-amber-600/60 bg-amber-950/70 px-1.5 py-0.5 rounded">DIFÍCIL</span>;
      case 'basado':
        return <span className="text-rose-400 font-pixel text-[8px] border border-rose-600/80 bg-rose-950/90 px-1.5 py-0.5 rounded animate-pulse shadow-[0_0_8px_rgba(244,63,94,0.5)]">💀 BASADO (x3)</span>;
    }
  };

  return (
    <header className="absolute top-0 left-0 right-0 p-2 sm:p-3 pointer-events-none z-20 flex flex-col gap-1.5">
      <div className="flex items-center justify-between gap-2 max-w-7xl mx-auto w-full">
        
        {/* BLOQUE IZQUIERDO: JUGADOR 1 */}
        <div className="flex items-center gap-2 bg-slate-950/90 border-2 border-blue-500/80 px-2.5 py-1.5 rounded-lg shadow-xl backdrop-blur-xs pointer-events-auto">
          <button
            onClick={onTagPartner}
            title="Haz clic para relevar de compañero (Tag)"
            className="w-10 h-10 sm:w-11 sm:h-11 rounded bg-blue-950/80 border-2 border-blue-400 flex flex-col items-center justify-center font-pixel text-xs transition-transform active:scale-95 cursor-pointer shadow"
          >
            <span className="text-base">{getCharIcon(player.stats.id)}</span>
            <span className="text-[7px] text-blue-300 font-bold mt-0.5 truncate max-w-[38px]">
              1P
            </span>
          </button>

          <div className="flex flex-col gap-1 w-32 sm:w-44">
            <div className="flex items-center justify-between font-pixel text-[8px] sm:text-[9px]">
              <span className="text-blue-300 uppercase truncate max-w-[100px]">
                {player.stats.name}
              </span>
              <div className="flex items-center gap-1 text-slate-300">
                <span>V:</span>
                <span className="tabular-nums font-bold text-amber-300">x{player.stats.lives}</span>
              </div>
            </div>

            {/* Barra de Vitalidad Amarilla sobre Fondo Carmesí */}
            <div className="w-full h-3 bg-red-950 border border-slate-700 rounded-xs overflow-hidden relative">
              <div
                className="h-full bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-300 transition-all duration-100"
                style={{ width: `${hpPercent}%` }}
              />
              <span className="absolute inset-0 flex items-center justify-center font-pixel text-[7px] text-slate-950 tracking-widest font-black drop-shadow">
                HP {Math.round(player.stats.hp)}%
              </span>
            </div>

            {/* Barra de Super Especial */}
            <div className="w-full h-2 bg-slate-900 border border-slate-700 rounded-xs overflow-hidden relative">
              <div
                className={`h-full transition-all duration-100 ${
                  isSpecialReady ? 'bg-cyan-400 animate-pulse' : 'bg-blue-600'
                }`}
                style={{ width: `${furyPercent}%` }}
              />
              {isSpecialReady && (
                <span className="absolute inset-0 flex items-center justify-center font-pixel text-[6px] text-cyan-950 uppercase tracking-wider font-bold">
                  ¡SUPER LISTO!
                </span>
              )}
            </div>
          </div>
        </div>

        {/* BLOQUE CENTRAL: PAÍS, SUB-ÁREA, DIFICULTAD Y PUNTUACIÓN */}
        <div className="flex flex-col items-center bg-slate-950/90 border-2 border-slate-700 px-3 sm:px-4 py-1 rounded-lg shadow-xl backdrop-blur-xs">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 font-pixel text-[8px] sm:text-[9px] text-amber-400">
              <Globe className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-cyan-400" />
              <span>{currentStage.country.toUpperCase()} · ÁREA {subAreaIndex + 1}/{totalSubAreas}</span>
            </div>
            {getDifficultyBadge()}
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="font-pixel text-[8px] text-slate-300 max-w-[120px] sm:max-w-[180px] truncate uppercase">
              {subAreaName}
            </span>
            <div className="flex items-center gap-1.5 font-pixel text-[9px] sm:text-[11px] text-amber-300 tabular-nums font-bold">
              <span>1P: {score.toString().padStart(6, '0')}</span>
              {player2 && <span className="text-rose-400">| 2P: {scoreP2.toString().padStart(6, '0')}</span>}
            </div>
          </div>
        </div>

        {/* BLOQUE DERECHO: JUGADOR 2 (SI ESTÁ EN MODO 2P) O BOTONES DE ACCIÓN */}
        {player2 ? (
          <div className="flex items-center gap-2 bg-slate-950/90 border-2 border-rose-500/80 px-2.5 py-1.5 rounded-lg shadow-xl backdrop-blur-xs pointer-events-auto">
            <div className="flex flex-col gap-1 w-32 sm:w-44 text-right">
              <div className="flex items-center justify-between font-pixel text-[8px] sm:text-[9px]">
                <div className="flex items-center gap-1 text-slate-300">
                  <span>V:</span>
                  <span className="tabular-nums font-bold text-amber-300">x{player2.stats.lives}</span>
                </div>
                <span className="text-rose-300 uppercase truncate max-w-[100px]">
                  {player2.stats.name}
                </span>
              </div>

              {/* Barra de Vitalidad P2 */}
              <div className="w-full h-3 bg-red-950 border border-slate-700 rounded-xs overflow-hidden relative">
                <div
                  className="h-full bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-300 transition-all duration-100 ml-auto"
                  style={{ width: `${hpPercentP2}%` }}
                />
                <span className="absolute inset-0 flex items-center justify-center font-pixel text-[7px] text-slate-950 tracking-widest font-black drop-shadow">
                  HP {Math.round(player2.stats.hp)}%
                </span>
              </div>

              {/* Barra de Super Especial P2 */}
              <div className="w-full h-2 bg-slate-900 border border-slate-700 rounded-xs overflow-hidden relative">
                <div
                  className={`h-full transition-all duration-100 ml-auto ${
                    isSpecialReadyP2 ? 'bg-cyan-400 animate-pulse' : 'bg-rose-600'
                  }`}
                  style={{ width: `${furyPercentP2}%` }}
                />
                {isSpecialReadyP2 && (
                  <span className="absolute inset-0 flex items-center justify-center font-pixel text-[6px] text-cyan-950 uppercase tracking-wider font-bold">
                    ¡SUPER LISTO!
                  </span>
                )}
              </div>
            </div>

            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded bg-rose-950/80 border-2 border-rose-400 flex flex-col items-center justify-center font-pixel text-xs shadow">
              <span className="text-base">{getCharIcon(player2.stats.id)}</span>
              <span className="text-[7px] text-rose-300 font-bold mt-0.5 truncate max-w-[38px]">
                2P
              </span>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 bg-slate-950/90 border-2 border-slate-700 px-2 py-1.5 rounded-lg shadow-xl backdrop-blur-xs pointer-events-auto">
            <button
              onClick={onOpenControlsGuide}
              title="Guía de Mandos y Teclas"
              className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer"
            >
              <Gamepad2 className="w-4 h-4" />
            </button>

            <button
              onClick={onOpenDebug}
              title="Abrir Depurador de Mandos (F2)"
              className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-emerald-400 transition-colors cursor-pointer"
            >
              <Activity className="w-4 h-4" />
            </button>

            <button
              onClick={onOpenStory}
              title="Ver Historia y Cómic"
              className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-amber-400 transition-colors cursor-pointer"
            >
              <BookOpen className="w-4 h-4" />
            </button>

            <button
              onClick={onToggleTouchControls}
              title={showTouchControls ? 'Ocultar Controles Táctiles' : 'Mostrar Controles Táctiles'}
              className={`p-1.5 rounded transition-colors cursor-pointer ${
                showTouchControls ? 'bg-amber-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
            >
              <Smartphone className="w-4 h-4" />
            </button>

            <button
              onClick={onToggleMusic}
              title={isMusicMuted ? 'Activar Música BGM' : 'Silenciar Música BGM'}
              className={`p-1.5 rounded transition-colors cursor-pointer ${
                isMusicMuted ? 'bg-slate-800 text-slate-500' : 'bg-slate-800 hover:bg-slate-700 text-cyan-400'
              }`}
            >
              <Music className="w-4 h-4" />
            </button>

            <button
              onClick={onToggleSound}
              title={isMuted ? 'Activar Efectos SFX' : 'Silenciar Efectos SFX'}
              className={`p-1.5 rounded transition-colors cursor-pointer ${
                isMuted ? 'bg-slate-800 text-slate-500' : 'bg-slate-800 hover:bg-slate-700 text-emerald-400'
              }`}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            <button
              onClick={onTogglePause}
              title={isPaused ? 'Reanudar' : 'Pausar'}
              className="p-1.5 rounded bg-rose-900/80 hover:bg-rose-800 text-rose-200 transition-colors cursor-pointer"
            >
              {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
            </button>
          </div>
        )}
      </div>

      {/* Banner Arcade Clásico de avance "¡SIGUE! ➔➔" */}
      {isSubAreaCleared && (
        <div className="flex items-center justify-center pointer-events-none mt-1 animate-bounce">
          <div className="bg-amber-500/95 border-2 border-yellow-300 text-slate-950 px-3 py-1 rounded-lg shadow-[0_0_20px_rgba(234,179,8,0.8)] font-pixel text-[10px] sm:text-xs font-black flex items-center gap-2 tracking-widest">
            <span className="text-yellow-950 font-black">¡ZONA DESPEJADA!</span>
            <span className="text-rose-700 bg-yellow-200 px-2 py-0.5 rounded font-black text-xs sm:text-sm animate-pulse">
              SIGUE A LA DERECHA ➔➔
            </span>
          </div>
        </div>
      )}

      {/* Tira inferior de estado de mandos y atajos */}
      <div className="flex items-center justify-between text-[10px] font-retro text-slate-300 max-w-7xl mx-auto w-full px-1">
        <button
          onClick={onOpenDebug}
          title="Haz clic para inspeccionar ejes y botones (F2)"
          className="flex items-center gap-1.5 bg-black/75 hover:bg-slate-900 px-2 py-0.5 rounded border border-slate-800 hover:border-emerald-500 transition-colors cursor-pointer pointer-events-auto"
        >
          <span className="text-amber-400">🎮</span>
          <span>{gamepadInfo?.connected ? `${gamepadInfo.displayName} (Listo)` : 'Teclado / Táctil Activo'}</span>
          <span className="text-[9px] text-emerald-400 font-pixel ml-1">[F2 DEBUG]</span>
        </button>

        {player2 && (
          <div className="flex items-center gap-2 pointer-events-auto">
            <button
              onClick={onToggleMusic}
              className="p-1 rounded bg-black/70 hover:bg-slate-800 text-cyan-400 text-[9px] font-pixel border border-slate-800"
            >
              {isMusicMuted ? 'MÚSICA OFF' : 'MÚSICA ON'}
            </button>
            <button
              onClick={onTogglePause}
              className="p-1 rounded bg-rose-950 hover:bg-rose-900 text-rose-300 text-[9px] font-pixel border border-rose-800"
            >
              {isPaused ? 'REANUDAR' : 'PAUSA'}
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
