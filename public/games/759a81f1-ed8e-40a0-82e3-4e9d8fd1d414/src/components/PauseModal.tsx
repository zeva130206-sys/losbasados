/**
 * Modal de Pausa Arcade - Callejón del Dragón
 */

import React from 'react';
import { Play, RotateCcw, Home, Gamepad2, Volume2, VolumeX, Music } from 'lucide-react';

interface PauseModalProps {
  isOpen: boolean;
  isMuted: boolean;
  isMusicMuted: boolean;
  onResume: () => void;
  onRestart: () => void;
  onBackToTitle: () => void;
  onOpenControls: () => void;
  onToggleSound: () => void;
  onToggleMusic: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  isOpen,
  isMuted,
  isMusicMuted,
  onResume,
  onRestart,
  onBackToTitle,
  onOpenControls,
  onToggleSound,
  onToggleMusic
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in text-slate-100">
      <div className="bg-slate-950 border-2 border-slate-700 rounded-xl p-6 max-w-sm w-full text-center flex flex-col items-center gap-4 shadow-2xl">
        <h2 className="font-pixel text-xl text-amber-400 tracking-wider">
          JUEGO EN PAUSA
        </h2>

        <div className="flex flex-col gap-2 w-full mt-2">
          {/* Reanudar */}
          <button
            onClick={onResume}
            className="w-full py-3 rounded-lg font-pixel text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform cursor-pointer shadow-lg shadow-emerald-600/30"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>REANUDAR PARTIDA</span>
          </button>

          {/* Guía de Mandos */}
          <button
            onClick={onOpenControls}
            className="w-full py-2.5 rounded-lg font-pixel text-[10px] bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Gamepad2 className="w-4 h-4 text-emerald-400" />
            <span>VER CONTROLES DE MANDO</span>
          </button>

          {/* Opciones de Audio */}
          <div className="grid grid-cols-2 gap-2 my-1">
            <button
              onClick={onToggleSound}
              className={`py-2 px-2 rounded font-pixel text-[9px] flex items-center justify-center gap-1.5 border ${
                isMuted
                  ? 'bg-slate-900 border-slate-800 text-slate-500'
                  : 'bg-slate-800 border-slate-700 text-emerald-400'
              }`}
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              <span>{isMuted ? 'SFX OFF' : 'SFX ON'}</span>
            </button>

            <button
              onClick={onToggleMusic}
              className={`py-2 px-2 rounded font-pixel text-[9px] flex items-center justify-center gap-1.5 border ${
                isMusicMuted
                  ? 'bg-slate-900 border-slate-800 text-slate-500'
                  : 'bg-slate-800 border-slate-700 text-cyan-400'
              }`}
            >
              <Music className="w-3.5 h-3.5" />
              <span>{isMusicMuted ? 'BGM OFF' : 'BGM ON'}</span>
            </button>
          </div>

          {/* Reiniciar Nivel */}
          <button
            onClick={onRestart}
            className="w-full py-2 rounded-lg font-pixel text-[10px] bg-slate-900 hover:bg-slate-800 border border-slate-800 text-rose-300 flex items-center justify-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>REINICIAR NIVEL</span>
          </button>

          {/* Menú Principal */}
          <button
            onClick={onBackToTitle}
            className="w-full py-2 rounded-lg font-pixel text-[10px] bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Home className="w-3.5 h-3.5" />
            <span>SALIR AL TÍTULO</span>
          </button>
        </div>

        <span className="font-retro text-xs text-slate-500">
          Pulsa START, OPTIONS o ESC para continuar
        </span>
      </div>
    </div>
  );
};
