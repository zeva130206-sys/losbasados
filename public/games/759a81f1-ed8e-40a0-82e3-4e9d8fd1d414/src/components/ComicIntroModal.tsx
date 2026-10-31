/**
 * Modal de Cómic e Historia Cinematográfica: "EL RESCATE DE LA BABY PC"
 * Viñetas interactivas con globos de diálogo estilo cómic retro, efectos SFX
 * y narrativa épica de cómo el Friki Hacker robó la legendaria PC customizada.
 */

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, X, Play, Monitor, Zap, Skull, ShieldAlert } from 'lucide-react';
import { GAME_STORY } from '../game/story';
import { retroAudio } from '../game/audio';

interface ComicIntroModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartPlaying: () => void;
}

export const ComicIntroModal: React.FC<ComicIntroModalProps> = ({
  isOpen,
  onClose,
  onStartPlaying
}) => {
  const [currentPanelIdx, setCurrentPanelIdx] = useState(0);
  const panels = GAME_STORY.comicPanels;
  const current = panels[currentPanelIdx];

  if (!isOpen) return null;

  const handleNext = () => {
    retroAudio.playMenuBeep();
    if (currentPanelIdx < panels.length - 1) {
      setCurrentPanelIdx(prev => prev + 1);
    } else {
      onStartPlaying();
    }
  };

  const handlePrev = () => {
    retroAudio.playMenuBeep();
    if (currentPanelIdx > 0) {
      setCurrentPanelIdx(prev => prev - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/95 backdrop-blur-md text-slate-100 select-none animate-fade-in">
      <div className="relative w-full max-w-4xl bg-slate-950 border-4 border-amber-500 rounded-2xl shadow-2xl shadow-rose-950/60 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Barra superior estilo encabezado de cómic vintage */}
        <div className="bg-gradient-to-r from-rose-950 via-slate-900 to-amber-950 border-b-2 border-amber-500/80 px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="bg-amber-400 text-black font-pixel text-[9px] px-2 py-0.5 rounded font-black tracking-wider uppercase">
              CÓMIC BASADO #{current.id}
            </span>
            <span className="font-pixel text-xs text-amber-300 tracking-wider">
              {current.title}
            </span>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            title="Cerrar cómic"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cuerpo de la Viñeta */}
        <div className="p-4 sm:p-6 flex-1 overflow-y-auto flex flex-col gap-4">
          {/* Subtítulo y atmósfera */}
          <div className="flex items-center justify-between text-xs font-pixel text-slate-400 border-b border-slate-800 pb-2">
            <span className="text-amber-400">📍 {current.subtitle}</span>
            <span className="text-rose-400 animate-pulse font-mono">{current.sfx}</span>
          </div>

          {/* Cuadro principal de ilustración simulada estilo cómic */}
          <div className="relative w-full h-56 sm:h-72 bg-gradient-to-b from-slate-900 via-black to-slate-950 rounded-xl border-2 border-slate-700 overflow-hidden flex items-center justify-center p-4 shadow-inner">
            {/* Grid de puntos estilo imprenta cómic halftones */}
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

            {/* Escenas dinámicas por tipo */}
            {current.sceneType === 'hq' && (
              <div className="relative flex flex-col items-center text-center z-10">
                <div className="relative mb-3">
                  <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-rose-600 via-amber-500 to-cyan-500 p-1 animate-pulse shadow-2xl shadow-rose-500/50 flex items-center justify-center">
                    <Monitor className="w-16 h-16 text-slate-950" />
                  </div>
                  <span className="absolute -bottom-2 -right-2 bg-amber-400 text-black text-[9px] font-pixel px-2 py-0.5 rounded-full font-bold shadow-md">
                    "LA BABY"
                  </span>
                </div>
                <h3 className="font-pixel text-sm sm:text-base text-amber-300">
                  ESTACIÓN BATTLESTATION · WATER-COOLED OVERCLOCKED
                </h3>
                <p className="text-[11px] font-retro text-cyan-300 mt-1 max-w-md">
                  CPU 16 Cores a 5.8 GHz · GPU Triple Slot Carmesí · Los Datos Supremos de Los Basados
                </p>
              </div>
            )}

            {current.sceneType === 'assault' && (
              <div className="relative flex flex-col items-center text-center z-10">
                <div className="flex items-center gap-6 mb-3">
                  <div className="w-20 h-20 rounded-xl bg-purple-950/80 border-2 border-purple-500 flex items-center justify-center text-purple-400 shadow-xl">
                    <Skull className="w-12 h-12" />
                  </div>
                  <Zap className="w-8 h-8 text-amber-400 animate-bounce" />
                  <div className="w-20 h-20 rounded-xl bg-rose-950/80 border-2 border-rose-500 flex items-center justify-center text-rose-400 shadow-xl">
                    <ShieldAlert className="w-12 h-12" />
                  </div>
                </div>
                <h3 className="font-pixel text-sm sm:text-base text-rose-500 neon-glow-red">
                  ¡INVASIÓN DEL SINDICATO MAD GEAR!
                </h3>
                <p className="text-[11px] font-retro text-slate-300 mt-1 max-w-md">
                  El Hacker Friki corta la energía mientras gigantes de lucha libre derriban la puerta blindada.
                </p>
              </div>
            )}

            {current.sceneType === 'escape' && (
              <div className="relative flex flex-col items-center text-center z-10">
                <div className="w-full max-w-md bg-slate-900/90 border border-slate-700 rounded-lg p-3 text-left">
                  <div className="flex items-center gap-2 mb-1.5 text-rose-400 font-pixel text-xs">
                    <span>🚇</span>
                    <span>TÚNELES DEL METRO Y ANDENES SUBTERRÁNEOS</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-gradient-to-r from-rose-500 to-amber-400 h-full w-3/4 animate-pulse" />
                  </div>
                  <span className="text-[10px] font-retro text-slate-400 mt-1 block">
                    Rastro de refrigerante derramado en los rieles hacia los muelles de Hong Kong...
                  </span>
                </div>
              </div>
            )}

            {current.sceneType === 'vow' && (
              <div className="relative flex flex-col items-center text-center z-10">
                <div className="relative p-3 rounded-full bg-rose-950/90 border-2 border-rose-500 shadow-2xl shadow-rose-600/60 mb-2">
                  <span className="text-4xl">🧢🔥</span>
                </div>
                <h3 className="font-pixel text-base sm:text-lg text-amber-400 neon-glow-gold">
                  VAZE SE AJUSTA LA GORRA: "¡NADIE TOCA A MI BABY!"
                </h3>
                <p className="text-xs font-pixel text-rose-400 mt-1">
                  ★ MODO BASADO AL MÁXIMO ACTIVADO · EURASIA EN ALERTA ★
                </p>
              </div>
            )}

            {/* Efecto de Sonido SFX Comic Pop-out */}
            <div className="absolute top-2 right-2 bg-rose-600 text-white font-pixel text-[10px] sm:text-xs px-2.5 py-1 rounded-md rotate-3 shadow-lg border-2 border-white animate-pulse">
              {current.sfx}
            </div>
          </div>

          {/* Caja de Narración del Cómic */}
          <div className="bg-amber-950/30 border-l-4 border-amber-400 p-3 rounded-r-lg">
            <span className="font-pixel text-[9px] text-amber-400 uppercase tracking-widest block mb-1">
              📜 NARRACIÓN OFICIAL:
            </span>
            <p className="font-sans-ui text-xs sm:text-sm text-slate-200 leading-relaxed">
              {current.narration}
            </p>
          </div>

          {/* Diálogos en Globos de Cómic */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1">
            {current.dialogue.map((dial, idx) => (
              <div
                key={idx}
                className={`relative p-3 rounded-xl border-2 ${
                  dial.speaker === 'VAZE'
                    ? 'bg-rose-950/80 border-rose-400 text-rose-100 shadow-lg shadow-rose-950/50'
                    : dial.speaker === 'HACKER FRIKI' || dial.speaker === 'ANDORE'
                    ? 'bg-purple-950/80 border-purple-400 text-purple-100'
                    : 'bg-slate-900/90 border-slate-700 text-slate-200'
                }`}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="font-pixel text-[9px] uppercase tracking-wider font-bold text-amber-400">
                    {dial.speaker}
                  </span>
                  {dial.balloonType === 'shout' && (
                    <span className="text-[8px] font-pixel text-rose-400">⚡ ¡GRITO!</span>
                  )}
                </div>
                <p className="font-pixel text-[10px] sm:text-xs leading-normal">
                  "{dial.text}"
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Barra inferior con controles de viñeta */}
        <div className="bg-slate-900 border-t border-slate-800 p-3 sm:p-4 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            {panels.map((p, idx) => (
              <button
                key={p.id}
                onClick={() => {
                  retroAudio.playMenuBeep();
                  setCurrentPanelIdx(idx);
                }}
                className={`w-7 h-7 rounded-lg font-pixel text-xs transition-all cursor-pointer ${
                  currentPanelIdx === idx
                    ? 'bg-amber-400 text-black font-black scale-110 shadow-lg'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                }`}
              >
                {p.id}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrev}
              disabled={currentPanelIdx === 0}
              className="px-3 py-1.5 rounded-lg font-pixel text-xs bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 border border-slate-700 flex items-center gap-1 cursor-pointer transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline">ANTERIOR</span>
            </button>

            {currentPanelIdx < panels.length - 1 ? (
              <button
                onClick={handleNext}
                className="px-4 py-1.5 rounded-lg font-pixel text-xs bg-amber-400 hover:bg-amber-300 text-slate-950 font-black border border-amber-300 flex items-center gap-1 cursor-pointer transition-colors shadow-lg shadow-amber-500/30"
              >
                <span>SIGUIENTE</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={onStartPlaying}
                className="px-4 py-2 rounded-lg font-pixel text-xs bg-rose-600 hover:bg-rose-500 text-white font-black border-2 border-rose-300 flex items-center gap-1.5 cursor-pointer transition-all animate-pulse shadow-xl shadow-rose-600/50"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>¡A RECUPERAR A LA BABY!</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
