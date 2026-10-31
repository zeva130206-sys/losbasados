/**
 * Pantalla de Título Arcade - Los Basados: Furia Callejera (Final Fight 2 Edition)
 * Diseñada exactamente según imagen_5ec4e548.png y imagen_97f7fa30.png:
 * - Menú Neón Callejero Izquierdo (1P Aventura, Modo 2 Jugadores Co-op, Historia La Baby PC, Controles, Opciones, Debug)
 * - Mueble Arcade Derecho con Selección de Luchador y visualización de VAZE (Rebelde Urbano)
 * - Reproductor de Música Neón [VO] ON/OFF
 * - Ticker inferior de estado de mandos (Xbox, Switch, PS4/PS5, TV)
 */

import React, { useState } from 'react';
import { Play, Users, BookOpen, Settings2, Gamepad2, Volume2, VolumeX, Shield, Flame, Sword, Sparkles, Check } from 'lucide-react';
import { CharacterId, GameDifficulty, GamepadInfo, GameMode } from '../game/types';
import { GAME_STORY, STAGES_CONFIG } from '../game/story';
import { retroAudio } from '../game/audio';

interface TitleScreenProps {
  playerName: string;
  onChangePlayerName: (name: string) => void;
  selectedChar: CharacterId;
  selectedChar2?: CharacterId;
  selectedStageIndex: number;
  onSelectStage: (stageIndex: number) => void;
  difficulty: GameDifficulty;
  onSelectDifficulty: (diff: GameDifficulty) => void;
  gamepadInfo: GamepadInfo | null;
  onSelectChar: (charId: CharacterId) => void;
  onSelectChar2?: (charId: CharacterId) => void;
  onStartGame: (mode: GameMode) => void;
  onOpenComicStory: () => void;
  onOpenControlsConfig: () => void;
  onOpenDebug?: () => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  playerName,
  onChangePlayerName,
  selectedChar,
  selectedChar2 = 'cody',
  selectedStageIndex,
  onSelectStage,
  difficulty,
  onSelectDifficulty,
  gamepadInfo,
  onSelectChar,
  onSelectChar2,
  onStartGame,
  onOpenComicStory,
  onOpenControlsConfig,
  onOpenDebug
}) => {
  const [isPlayingTitleMusic, setIsPlayingTitleMusic] = useState(false);
  const [activeMenu, setActiveMenu] = useState<'MAIN' | 'OPTIONS' | 'CREDITS'>('MAIN');
  const [gameMode, setGameMode] = useState<GameMode>('1P');
  const [activeCabinetTab, setActiveCabinetTab] = useState<'P1' | 'P2'>('P1');

  const currentCharData = GAME_STORY.characters.find(c => c.id === (activeCabinetTab === 'P1' ? selectedChar : selectedChar2)) || GAME_STORY.characters[0];

  const handleToggleTitleAudio = () => {
    retroAudio.unlock();
    if (isPlayingTitleMusic) {
      retroAudio.stopMusic();
      setIsPlayingTitleMusic(false);
    } else {
      retroAudio.startTitleMusic();
      setIsPlayingTitleMusic(true);
    }
  };

  return (
    <div
      onClick={() => {
        retroAudio.unlock();
        if (!isPlayingTitleMusic && !retroAudio.isSoundMuted()) {
          retroAudio.startTitleMusic();
          setIsPlayingTitleMusic(true);
        }
      }}
      className="absolute inset-0 z-30 flex flex-col justify-between p-3 sm:p-5 bg-gradient-to-b from-slate-950 via-slate-900/95 to-black text-slate-100 overflow-y-auto select-none"
    >
      {/* Fondo Callejero con Luces de Neón y Grafitis */}
      <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(#ec4899_1px,transparent_1px)] [background-size:24px_24px]" />

      {/* ENCABEZADO PRINCIPAL (Exacto a imagen_5ec4e548.png) */}
      <div className="relative z-10 flex flex-col items-center text-center mt-1">
        <h1 className="font-pixel text-3xl sm:text-5xl text-cyan-300 tracking-wider drop-shadow-[0_0_12px_rgba(34,211,238,0.8)] uppercase font-black">
          LOS BASADOS:
        </h1>
        <h2 className="font-pixel text-2xl sm:text-4xl text-rose-500 tracking-widest drop-shadow-[0_0_15px_rgba(244,63,94,0.9)] uppercase font-black -mt-1">
          FURIA CALLEJERA
        </h2>
        <div className="flex items-center gap-2 mt-1">
          <span className="font-pixel text-[10px] sm:text-xs text-rose-400 tracking-widest font-bold">
            ARCHITECTURE · EURASIA.
          </span>
        </div>
      </div>

      {/* CONTENIDO CENTRAL: Menú Neón a la Izquierda vs Mueble Arcade a la Derecha */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-4 items-center max-w-6xl w-full mx-auto my-2 flex-1">
        
        {/* COLUMNA IZQUIERDA: MENÚ DE OPCIONES DE JUEGO */}
        <div className="lg:col-span-6 flex flex-col gap-2.5">
          {activeMenu === 'MAIN' && (
            <div className="flex flex-col gap-2">
              {/* Botón 1: Empezar Aventura (1P) */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  retroAudio.unlock();
                  onStartGame('1P');
                }}
                className="group relative flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-amber-500/20 via-slate-900 to-slate-950 border-2 border-amber-400 hover:border-amber-300 hover:bg-amber-500/30 transition-all cursor-pointer shadow-lg shadow-amber-500/20 text-left active:scale-[0.98]"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-amber-400 text-slate-950 flex items-center justify-center font-black">
                    <Play className="w-5 h-5 fill-current" />
                  </div>
                  <div>
                    <span className="font-pixel text-xs sm:text-sm text-amber-300 group-hover:text-amber-200 uppercase font-black block">
                      EMPEZAR AVENTURA (1P)
                    </span>
                    <span className="text-[10px] font-retro text-slate-400">
                      Modo historia solitario con relevo de compañero (Tag)
                    </span>
                  </div>
                </div>
                <span className="font-pixel text-xs text-amber-400">START</span>
              </button>

              {/* Botón 2: Modo 2 Jugadores (Cooperativo Co-op) */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  retroAudio.unlock();
                  onStartGame('2P');
                }}
                className="group relative flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-cyan-500/20 via-slate-900 to-slate-950 border-2 border-cyan-400 hover:border-cyan-300 hover:bg-cyan-500/30 transition-all cursor-pointer shadow-lg shadow-cyan-500/20 text-left active:scale-[0.98]"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-cyan-400 text-slate-950 flex items-center justify-center font-black">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-pixel text-xs sm:text-sm text-cyan-300 group-hover:text-cyan-200 uppercase font-black">
                        MODO 2 JUGADORES (COOP)
                      </span>
                      <span className="bg-rose-500 text-white text-[8px] font-pixel px-1.5 py-0.5 rounded uppercase">
                        NUEVO
                      </span>
                    </div>
                    <span className="text-[10px] font-retro text-slate-400">
                      2 Jugadores simultáneos con 2 mandos o teclado dividido
                    </span>
                  </div>
                </div>
                <span className="font-pixel text-xs text-cyan-400">2P CO-OP</span>
              </button>

              {/* Botón 3: Historia ("LA BABY" PC) */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenComicStory();
                }}
                className="group flex items-center justify-between p-2.5 rounded-xl bg-slate-900/90 border border-slate-700 hover:border-rose-400 hover:bg-rose-950/30 transition-all cursor-pointer text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-rose-950 border border-rose-500 flex items-center justify-center text-rose-400">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-pixel text-xs text-white group-hover:text-rose-300 uppercase block">
                      HISTORIA: "LA BABY" PC
                    </span>
                    <span className="text-[10px] font-retro text-slate-400">
                      Cinemática en viñetas: El rescate de la battlestation overclockeada
                    </span>
                  </div>
                </div>
                <span className="font-pixel text-[9px] text-rose-400">CÓMIC</span>
              </button>

              {/* Botón 4: Configurar Controles (P1 & P2 Teclado / Mandos) */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenControlsConfig();
                }}
                className="group flex items-center justify-between p-2.5 rounded-xl bg-slate-900/90 border border-slate-700 hover:border-emerald-400 hover:bg-emerald-950/30 transition-all cursor-pointer text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-950 border border-emerald-500 flex items-center justify-center text-emerald-400">
                    <Gamepad2 className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-pixel text-xs text-white group-hover:text-emerald-300 uppercase block">
                      CONFIGURAR CONTROLES (P1 & P2)
                    </span>
                    <span className="text-[10px] font-retro text-slate-400">
                      Reasignar teclas de teclado individualmente o ver mandos USB
                    </span>
                  </div>
                </div>
                <span className="font-pixel text-[9px] text-emerald-400">REMAP</span>
              </button>

              {/* Botón 5: Opciones y Dificultad */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveMenu('OPTIONS');
                }}
                className="group flex items-center justify-between p-2.5 rounded-xl bg-slate-900/90 border border-slate-700 hover:border-amber-400 hover:bg-amber-950/30 transition-all cursor-pointer text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-950 border border-amber-500 flex items-center justify-center text-amber-400">
                    <Settings2 className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-pixel text-xs text-white group-hover:text-amber-300 uppercase block">
                      OPCIONES & DIFICULTAD
                    </span>
                    <span className="text-[10px] font-retro text-slate-400">
                      Dificultad: {difficulty.toUpperCase()} · Etapa: {selectedStageIndex + 1}
                    </span>
                  </div>
                </div>
                <span className="font-pixel text-[9px] text-amber-400">AJUSTES</span>
              </button>

              {/* Botones secundarios: Modos Extra (Debug) y Créditos */}
              <div className="grid grid-cols-2 gap-2 mt-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenDebug?.();
                  }}
                  className="py-2 px-3 rounded-lg font-pixel text-[9px] bg-slate-900 border border-slate-700 hover:border-cyan-400 text-cyan-300 flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                >
                  <span>📊 MODOS EXTRA (DEBUG)</span>
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveMenu('CREDITS');
                  }}
                  className="py-2 px-3 rounded-lg font-pixel text-[9px] bg-slate-900 border border-slate-700 hover:border-purple-400 text-purple-300 flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                >
                  <span>⭐ CRÉDITOS</span>
                </button>
              </div>
            </div>
          )}

          {/* SUB-MENÚ DE OPCIONES Y DIFICULTAD */}
          {activeMenu === 'OPTIONS' && (
            <div className="bg-slate-900/90 border-2 border-amber-500/80 rounded-xl p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="font-pixel text-xs text-amber-400">AJUSTES DE PARTIDA</span>
                <button
                  onClick={() => setActiveMenu('MAIN')}
                  className="font-pixel text-[9px] text-slate-400 hover:text-white"
                >
                  VOLVER
                </button>
              </div>

              {/* Selector de Nombre */}
              <div>
                <span className="font-pixel text-[9px] text-slate-400 block mb-1">
                  NOMBRE DEL PERSONAJE PRINCIPAL:
                </span>
                <input
                  type="text"
                  maxLength={14}
                  value={playerName}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => onChangePlayerName(e.target.value)}
                  className="w-full bg-black border border-slate-700 text-amber-300 px-3 py-1.5 rounded font-pixel text-xs uppercase"
                  placeholder="Basado"
                />
              </div>

              {/* Selector de Dificultad */}
              <div>
                <span className="font-pixel text-[9px] text-slate-400 block mb-1">
                  NIVEL DE DIFICULTAD:
                </span>
                <div className="grid grid-cols-2 gap-1.5 font-pixel text-[9px]">
                  {(['facil', 'normal', 'dificil', 'basado'] as GameDifficulty[]).map((diff) => (
                    <button
                      key={diff}
                      onClick={() => onSelectDifficulty(diff)}
                      className={`p-2 rounded border cursor-pointer uppercase ${
                        difficulty === diff
                          ? 'bg-amber-400 text-black border-amber-300 font-bold'
                          : 'bg-black text-slate-300 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {diff === 'basado' ? '💀 NIVEL BASADO' : diff}
                    </button>
                  ))}
                </div>
              </div>

              {/* Selector de Etapa Inicial */}
              <div>
                <span className="font-pixel text-[9px] text-slate-400 block mb-1">
                  ETAPA INICIAL:
                </span>
                <div className="grid grid-cols-3 gap-1 text-[8px] font-pixel">
                  {STAGES_CONFIG.map((st, idx) => (
                    <button
                      key={st.stageNumber}
                      onClick={() => onSelectStage(idx)}
                      className={`p-1.5 rounded border truncate cursor-pointer ${
                        selectedStageIndex === idx
                          ? 'bg-cyan-500 text-black border-cyan-300 font-bold'
                          : 'bg-black text-slate-400 border-slate-800'
                      }`}
                    >
                      E{st.stageNumber}. {st.country}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* CRÉDITOS */}
          {activeMenu === 'CREDITS' && (
            <div className="bg-slate-900/90 border-2 border-purple-500/80 rounded-xl p-4 flex flex-col gap-2">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="font-pixel text-xs text-purple-400">CRÉDITOS OFICIALES</span>
                <button
                  onClick={() => setActiveMenu('MAIN')}
                  className="font-pixel text-[9px] text-slate-400 hover:text-white"
                >
                  VOLVER
                </button>
              </div>
              <p className="font-pixel text-[10px] text-amber-300">
                LOS BASADOS: FURIA CALLEJERA
              </p>
              <p className="text-xs font-sans-ui text-slate-300 leading-relaxed">
                Desarrollado bajo la arquitectura beat 'em up de Final Fight 2 (CPS-1 / SNES), integrando
                combate con eje Z, IA de tokens de agresión, cinemáticas cómicas y soporte nativo
                para 2 jugadores con mandos universales.
              </p>
              <span className="font-pixel text-[9px] text-rose-400 mt-2">
                ¡DEDICADO A LA COMUNIDAD DE LOS BASADOS!
              </span>
            </div>
          )}
        </div>

        {/* COLUMNA DERECHA: MUEBLE ARCADE "SELECCIÓN DE LUCHADOR" (Exacto a imagen_5ec4e548.png) */}
        <div className="lg:col-span-6 flex flex-col items-center justify-center">
          <div className="relative w-full max-w-md bg-gradient-to-b from-slate-950 via-slate-900 to-black border-4 border-rose-600 rounded-3xl p-4 shadow-2xl shadow-rose-950/80 ring-2 ring-rose-500/50">
            {/* Marquesina Superior Neón */}
            <div className="bg-gradient-to-r from-rose-600 via-amber-500 to-rose-600 text-slate-950 py-1.5 px-4 rounded-xl text-center mb-3 font-pixel text-xs sm:text-sm font-black tracking-widest shadow-lg uppercase">
              SELECCIÓN DE LUCHADOR
            </div>

            {/* Alternar P1 / P2 en el arcade */}
            <div className="flex items-center justify-center gap-2 mb-2 font-pixel text-[9px]">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveCabinetTab('P1');
                }}
                className={`px-3 py-1 rounded-lg border transition-all cursor-pointer ${
                  activeCabinetTab === 'P1'
                    ? 'bg-blue-600 text-white border-blue-400 font-bold'
                    : 'bg-black text-slate-400 border-slate-800'
                }`}
              >
                1P: {selectedChar.toUpperCase()}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveCabinetTab('P2');
                }}
                className={`px-3 py-1 rounded-lg border transition-all cursor-pointer ${
                  activeCabinetTab === 'P2'
                    ? 'bg-rose-600 text-white border-rose-400 font-bold'
                    : 'bg-black text-slate-400 border-slate-800'
                }`}
              >
                2P: {selectedChar2.toUpperCase()}
              </button>
            </div>

            {/* Pantalla CRT Simulada en el Arcade */}
            <div className="relative bg-black rounded-2xl border-4 border-slate-800 p-3 overflow-hidden shadow-inner flex flex-col items-center text-center">
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/5 to-transparent pointer-events-none" />

              {/* Avatar e Ilustración Pixel Art de VAZE / Personaje */}
              <div className="relative w-24 h-24 mb-2 flex items-center justify-center">
                <div className="w-20 h-20 rounded-xl bg-slate-900 border-2 border-rose-500 flex flex-col items-center justify-center shadow-lg relative overflow-hidden">
                  <span className="text-3xl">
                    {currentCharData.id === 'vaze' ? '🧢' :
                     currentCharData.id === 'cody' ? '🥊' :
                     currentCharData.id === 'haggar' ? '💪' :
                     currentCharData.id === 'maki' ? '🥷' : '⚔️'}
                  </span>
                  <span className="font-pixel text-[8px] text-amber-400 mt-1 uppercase font-bold">
                    {currentCharData.id}
                  </span>
                </div>

                {/* Insignia Neón */}
                <div className="absolute -top-1 -right-1 bg-amber-400 text-black text-[8px] font-pixel px-1.5 py-0.5 rounded-full font-bold">
                  ★ 16-BIT
                </div>
              </div>

              {/* Nombre y Alias */}
              <h3 className="font-pixel text-sm sm:text-base text-rose-400 tracking-wider uppercase font-bold">
                {currentCharData.name}
              </h3>
              <span className="font-pixel text-[10px] text-amber-300 block mb-1">
                {currentCharData.alias}
              </span>

              {/* Movimiento Especial */}
              <div className="w-full bg-slate-900/80 border border-slate-800 rounded-lg p-2 my-1 text-left">
                <span className="font-pixel text-[8px] text-rose-400 block mb-0.5">
                  ★ MOVIMIENTO ESPECIAL:
                </span>
                <span className="font-pixel text-[9px] text-white block">
                  {currentCharData.signatureMove}
                </span>
              </div>

              {/* Selector de Personajes en Fila */}
              <div className="grid grid-cols-5 gap-1.5 w-full mt-2">
                {GAME_STORY.characters.map((char) => {
                  const isSelected = (activeCabinetTab === 'P1' ? selectedChar : selectedChar2) === char.id;
                  return (
                    <button
                      key={char.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (activeCabinetTab === 'P1') {
                          onSelectChar(char.id as CharacterId);
                        } else {
                          onSelectChar2?.(char.id as CharacterId);
                        }
                      }}
                      className={`py-1.5 px-1 rounded-lg border font-pixel text-[8px] transition-all cursor-pointer flex flex-col items-center ${
                        isSelected
                          ? 'bg-rose-600 text-white border-rose-300 font-bold scale-105 shadow-md shadow-rose-600/50'
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-600'
                      }`}
                    >
                      <span className="text-xs">
                        {char.id === 'vaze' ? '🧢' :
                         char.id === 'cody' ? '🥊' :
                         char.id === 'haggar' ? '💪' :
                         char.id === 'maki' ? '🥷' : '⚔️'}
                      </span>
                      <span className="uppercase text-[7px] truncate max-w-full">{char.id}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Controles del Arcade físico (Palanca y botones ilustrados) */}
            <div className="mt-2 flex items-center justify-center gap-4 text-slate-600 font-pixel text-[8px]">
              <div className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-red-600 inline-block shadow-sm" />
                <span className="w-3 h-3 rounded-full bg-blue-600 inline-block shadow-sm" />
                <span className="w-3 h-3 rounded-full bg-yellow-500 inline-block shadow-sm" />
              </div>
              <span className="text-[7px] text-slate-400">CPS-1 SYSTEM ARCADE</span>
            </div>
          </div>
        </div>
      </div>

      {/* PIE DE PÁGINA: Widget Reproductor de Música [VO] y Ticker de Mandos */}
      <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-2 max-w-6xl w-full mx-auto pt-2 border-t border-slate-800/80">
        {/* Caja Neón: REPRODUCTOR DE MÚSICA [VO] ON / OFF (imagen_5ec4e548.png) */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleToggleTitleAudio();
          }}
          className="px-3 py-2 rounded-xl bg-slate-950 border-2 border-cyan-400 text-cyan-300 hover:bg-cyan-950/40 font-pixel text-[10px] flex items-center gap-2 shadow-lg shadow-cyan-500/20 cursor-pointer transition-colors"
        >
          {isPlayingTitleMusic ? <Volume2 className="w-4 h-4 text-cyan-300 animate-pulse" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          <div className="text-left">
            <span className="block text-[8px] text-slate-400">REPRODUCTOR DE MÚSICA</span>
            <span className="font-bold text-cyan-300 tracking-wider">
              {isPlayingTitleMusic ? '[VO] ON 🔊' : '[VO] OFF 🔈'}
            </span>
          </div>
        </button>

        {/* Ticker de Conexión de Mandos */}
        <div className="flex items-center gap-2 text-center text-[10px] sm:text-xs font-retro text-slate-400">
          <span className="text-emerald-400">★</span>
          <span>
            {gamepadInfo?.connected
              ? `${gamepadInfo.displayName} Conectado · Presiona START o ESPACIO para Iniciar`
              : 'Nintendo Switch, PS4/PS5, Xbox & Mandos USB Soportados · Presiona ESPACIO o START'}
          </span>
          <span className="text-emerald-400">★</span>
        </div>
      </div>
    </div>
  );
};
