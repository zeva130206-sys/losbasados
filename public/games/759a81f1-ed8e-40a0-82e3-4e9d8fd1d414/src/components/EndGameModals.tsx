/**
 * Modal de Game Over y Victoria - Los Basados: Furia Callejera
 * Coherente con la historia del rescate de la legendaria PC "La Baby" y el Sindicato Mad Gear.
 */

import React from 'react';
import { RotateCcw, Trophy, Skull } from 'lucide-react';

interface GameOverModalProps {
  score: number;
  onRetry: () => void;
  onBackToTitle: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({ score, onRetry, onBackToTitle }) => {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-fade-in text-slate-100 select-none">
      <div className="bg-slate-950 border-4 border-rose-600 rounded-2xl p-6 max-w-md w-full text-center flex flex-col items-center gap-4 shadow-2xl shadow-rose-950/80">
        <div className="w-16 h-16 rounded-full bg-rose-950/80 border-2 border-rose-500 flex items-center justify-center text-rose-400">
          <Skull className="w-8 h-8" />
        </div>

        <h2 className="font-pixel text-xl sm:text-2xl text-rose-500 neon-glow-red font-black">
          FIN DEL JUEGO
        </h2>

        <p className="font-sans-ui text-xs sm:text-sm text-slate-300">
          El Sindicato Mad Gear y el Hacker Friki se escaparon temporalmente con <strong className="text-amber-400">"La Baby" PC</strong>. ¡Pero Los Basados nunca se rinden!
        </p>

        <div className="bg-slate-900 border border-slate-800 rounded-xl py-3 px-6 w-full">
          <span className="font-pixel text-[10px] text-amber-400 block mb-1">PUNTUACIÓN FINAL</span>
          <span className="font-pixel text-xl text-white tabular-nums tracking-widest font-black">
            {score.toString().padStart(6, '0')} PTS
          </span>
        </div>

        <div className="flex flex-col gap-2.5 w-full mt-2">
          <button
            onClick={onRetry}
            className="w-full py-3 rounded-xl font-pixel text-xs bg-rose-600 hover:bg-rose-500 text-white font-black flex items-center justify-center gap-2 active:scale-95 transition-transform cursor-pointer shadow-lg shadow-rose-600/40 border-2 border-rose-400"
          >
            <RotateCcw className="w-4 h-4" />
            <span>CONTINUAR (REINTENTAR)</span>
          </button>

          <button
            onClick={onBackToTitle}
            className="w-full py-2.5 rounded-xl font-pixel text-[10px] bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 transition-colors cursor-pointer"
          >
            VOLVER AL MENÚ PRINCIPAL
          </button>
        </div>
      </div>
    </div>
  );
};

interface VictoryModalProps {
  score: number;
  onPlayAgain: () => void;
  onBackToTitle: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({ score, onPlayAgain, onBackToTitle }) => {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-fade-in text-slate-100 select-none">
      <div className="bg-slate-950 border-4 border-amber-400 rounded-2xl p-6 max-w-md w-full text-center flex flex-col items-center gap-4 shadow-2xl shadow-amber-500/50">
        <div className="w-16 h-16 rounded-full bg-amber-950/80 border-2 border-amber-400 flex items-center justify-center text-amber-400">
          <Trophy className="w-8 h-8" />
        </div>

        <h2 className="font-pixel text-xl sm:text-2xl text-amber-400 neon-glow-gold font-black">
          ¡VICTORIA TOTAL!
        </h2>

        <p className="font-pixel text-xs text-emerald-400">
          ¡EL SINDICATO MAD GEAR HA SIDO DERROTADO Y "LA BABY" PC HA SIDO RECUPERADA!
        </p>

        <p className="font-sans-ui text-xs sm:text-sm text-slate-300">
          La battlestation con refrigeración líquida ha vuelto al búnker subterráneo de Los Basados. ¡Eurasia vuelve a respirar en paz!
        </p>

        <div className="bg-slate-900 border border-slate-800 rounded-xl py-3 px-6 w-full">
          <span className="font-pixel text-[10px] text-amber-400 block mb-1">PUNTUACIÓN RECORD</span>
          <span className="font-pixel text-2xl text-amber-300 tabular-nums tracking-widest font-black">
            {score.toString().padStart(6, '0')} PTS
          </span>
        </div>

        <div className="flex flex-col gap-2.5 w-full mt-2">
          <button
            onClick={onPlayAgain}
            className="w-full py-3 rounded-xl font-pixel text-xs bg-amber-400 hover:bg-amber-300 text-slate-950 font-black flex items-center justify-center gap-2 active:scale-95 transition-transform cursor-pointer shadow-lg shadow-amber-400/40 border-2 border-amber-200"
          >
            <RotateCcw className="w-4 h-4" />
            <span>JUGAR DE NUEVO</span>
          </button>

          <button
            onClick={onBackToTitle}
            className="w-full py-2.5 rounded-xl font-pixel text-[10px] bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 transition-colors cursor-pointer"
          >
            VOLVER AL MENÚ PRINCIPAL
          </button>
        </div>
      </div>
    </div>
  );
};
