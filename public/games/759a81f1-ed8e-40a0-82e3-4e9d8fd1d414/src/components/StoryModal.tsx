/**
 * Modal de Historia, Lore y Prólogo Retro - Callejón del Dragón
 * Presenta el cómic/diálogos introductorios y los perfiles de los personajes.
 */

import React, { useState } from 'react';
import { X, ChevronRight, ChevronLeft, Play, ShieldAlert, Award } from 'lucide-react';
import { GAME_STORY } from '../game/story';

interface StoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartPlaying: () => void;
}

export const StoryModal: React.FC<StoryModalProps> = ({ isOpen, onClose, onStartPlaying }) => {
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<'prologue' | 'characters' | 'villains'>('prologue');

  if (!isOpen) return null;

  const currentFrame = GAME_STORY.prologueFrames[currentFrameIndex];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl bg-slate-950 border-2 border-amber-500/80 rounded-xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden text-slate-100">
        {/* Cabecera */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-2">
            <span className="text-amber-400">📜</span>
            <h2 className="font-pixel text-xs sm:text-sm text-amber-400 tracking-wider">
              HISTORIA: LOS BASADOS (FURIA CALLEJERA)
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Pestañas de Navegación */}
        <div className="flex border-b border-slate-800 bg-slate-950 px-3 pt-2 gap-2 text-xs font-pixel">
          <button
            onClick={() => setActiveTab('prologue')}
            className={`px-3 py-1.5 rounded-t transition-colors cursor-pointer ${
              activeTab === 'prologue'
                ? 'bg-amber-500 text-black font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            PRÓLOGO (CÓMIC)
          </button>
          <button
            onClick={() => setActiveTab('characters')}
            className={`px-3 py-1.5 rounded-t transition-colors cursor-pointer ${
              activeTab === 'characters'
                ? 'bg-amber-500 text-black font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            LOS BASADOS
          </button>
          <button
            onClick={() => setActiveTab('villains')}
            className={`px-3 py-1.5 rounded-t transition-colors cursor-pointer ${
              activeTab === 'villains'
                ? 'bg-amber-500 text-black font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            MAD GEAR
          </button>
        </div>

        {/* Contenido Principal */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 font-sans-ui text-sm">
          {activeTab === 'prologue' && (
            <div className="flex flex-col gap-4">
              {/* Recuadro de Cómic Retro */}
              <div className="bg-slate-900 border-2 border-slate-700 rounded-lg p-4 sm:p-6 relative min-h-[160px] flex flex-col justify-between">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
                  <span className="font-pixel text-[10px] text-amber-400">
                    {currentFrame.speaker}
                  </span>
                  <span className="font-retro text-xs text-slate-400">
                    ESCENA {currentFrameIndex + 1} DE {GAME_STORY.prologueFrames.length}
                  </span>
                </div>

                <p className="font-pixel text-xs sm:text-sm text-slate-100 leading-relaxed drop-shadow">
                  "{currentFrame.text}"
                </p>

                {/* Retrato del personaje que habla */}
                <div className="mt-4 flex items-center gap-3 pt-2 border-t border-slate-800/80">
                  <div className="w-10 h-10 rounded-full bg-slate-800 border border-amber-400/50 flex items-center justify-center text-xl">
                    {currentFrame.portrait === 'maki'
                      ? '🥷'
                      : currentFrame.portrait === 'haggar'
                      ? '🥊'
                      : currentFrame.portrait === 'carlos'
                      ? '⚔️'
                      : '🏙️'}
                  </div>
                  <div>
                    <span className="font-pixel text-[9px] text-slate-300 block">
                      {currentFrame.speaker === 'NARRADOR' ? 'EURASIA, 1993' : currentFrame.speaker}
                    </span>
                    <span className="text-[11px] text-slate-400 font-retro">
                      {currentFrame.portrait === 'maki'
                        ? 'Maestra Ninjutsu Bushinryu · Velocidad Extrema'
                        : currentFrame.portrait === 'haggar'
                        ? 'Alcalde de Metro City · Grappler Pesado'
                        : currentFrame.portrait === 'carlos'
                        ? 'Espadachín Samurai · Katana & Equilibrio'
                        : 'Eurasia bajo la sombra de Mad Gear'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Botones de Navegación de Escenas */}
              <div className="flex items-center justify-between">
                <button
                  disabled={currentFrameIndex === 0}
                  onClick={() => setCurrentFrameIndex((prev) => Math.max(0, prev - 1))}
                  className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-xs font-pixel flex items-center gap-1 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>ANTERIOR</span>
                </button>

                <div className="flex gap-1.5">
                  {GAME_STORY.prologueFrames.map((_, idx) => (
                    <div
                      key={idx}
                      className={`w-2.5 h-2.5 rounded-full ${
                        idx === currentFrameIndex ? 'bg-amber-400' : 'bg-slate-700'
                      }`}
                    />
                  ))}
                </div>

                <button
                  disabled={currentFrameIndex === GAME_STORY.prologueFrames.length - 1}
                  onClick={() =>
                    setCurrentFrameIndex((prev) =>
                      Math.min(GAME_STORY.prologueFrames.length - 1, prev + 1)
                    )
                  }
                  className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-xs font-pixel flex items-center gap-1 cursor-pointer"
                >
                  <span>SIGUIENTE</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {activeTab === 'characters' && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {GAME_STORY.characters.map((char) => (
                <div
                  key={char.id}
                  className="bg-slate-900 border border-slate-700 rounded-lg p-3 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">
                        {char.id === 'maki' ? '🥷' : char.id === 'haggar' ? '🥊' : '⚔️'}
                      </span>
                      <div>
                        <h3 className="font-pixel text-[11px] text-amber-400">{char.name}</h3>
                        <span className="font-retro text-[10px] text-slate-400">{char.alias}</span>
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-relaxed mb-2 font-retro">{char.bio}</p>
                  </div>

                  <div className="space-y-1 border-t border-slate-800 pt-2 text-[10px] font-retro text-slate-300">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Estilo:</span>
                      <span className="text-amber-200">{char.style}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Especial:</span>
                      <span className="text-rose-400 font-pixel text-[8px]">{char.signatureMove}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'villains' && (
            <div className="space-y-2.5">
              {GAME_STORY.villains.map((villain, i) => (
                <div
                  key={i}
                  className="bg-slate-900 border border-slate-800 rounded-lg p-3 flex items-start gap-3"
                >
                  <div className="p-2 rounded bg-rose-950/60 border border-rose-800 text-rose-400 shrink-0">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-pixel text-xs text-rose-400">{villain.name}</h4>
                      <span className="font-retro text-xs text-slate-400">· {villain.role}</span>
                    </div>
                    <p className="text-xs text-slate-300 mt-1">{villain.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pie de modal */}
        <div className="px-4 py-3 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-retro text-slate-400">
            <Award className="w-4 h-4 text-amber-400" />
            <span>Rescata a Rena y Genryusai de las garras de Retu</span>
          </div>

          <button
            onClick={() => {
              onClose();
              onStartPlaying();
            }}
            className="px-4 py-2 rounded font-pixel text-xs bg-amber-500 hover:bg-amber-400 text-black font-bold flex items-center gap-1.5 cursor-pointer active:scale-95 transition-transform"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>¡A PELEAR!</span>
          </button>
        </div>
      </div>
    </div>
  );
};
