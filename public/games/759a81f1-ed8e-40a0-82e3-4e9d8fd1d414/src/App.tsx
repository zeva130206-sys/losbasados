/**
 * Los Basados: Furia Callejera (Final Fight 2 Architecture Edition)
 * Beat 'em up en Pixel Art 2.5D con Eje Z, Clinch/Agarres, IA Autónoma con Tokens y 6 Etapas Globales.
 * Soporte Universal para Mandos (Xbox, Switch, PS4/PS5, Genéricos USB/TV), Modo 2 Jugadores Co-op,
 * Configuración de Teclas Remappeable y Cinemática de Cómic ("La Baby" PC).
 */

import React, { useEffect, useRef, useState } from 'react';
import { gameEngine } from './game/engine';
import { gamepadManager } from './game/gamepad';
import { retroAudio } from './game/audio';
import { CharacterId, GameDifficulty, GamepadInfo, GameMode, GameState, PlayerEntity, SubAreaConfig } from './game/types';
import { TitleScreen } from './components/TitleScreen';
import { GameHUD } from './components/GameHUD';
import { TouchControls } from './components/TouchControls';
import { ComicIntroModal } from './components/ComicIntroModal';
import { KeyRemapModal } from './components/KeyRemapModal';
import { ControlsGuideModal } from './components/ControlsGuideModal';
import { PauseModal } from './components/PauseModal';
import { GameOverModal, VictoryModal } from './components/EndGameModals';
import { GamepadDebugOverlay } from './components/GamepadDebugOverlay';

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Estados del juego
  const [gameState, setGameState] = useState<GameState>('TITLE');
  const [difficulty, setDifficulty] = useState<GameDifficulty>('normal');
  const [selectedChar, setSelectedChar] = useState<CharacterId>('vaze');
  const [selectedChar2, setSelectedChar2] = useState<CharacterId>('cody');
  const [selectedStageIndex, setSelectedStageIndex] = useState<number>(0);
  const [currentSubArea, setCurrentSubArea] = useState<SubAreaConfig | null>(null);
  const [playerName, setPlayerName] = useState<string>('Basado');
  const [playerData, setPlayerData] = useState<PlayerEntity | null>(null);
  const [player2Data, setPlayer2Data] = useState<PlayerEntity | null>(null);
  const [score, setScore] = useState<number>(0);
  const [scoreP2, setScoreP2] = useState<number>(0);

  // Audio
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isMusicMuted, setIsMusicMuted] = useState<boolean>(false);

  // Mandos y Táctil
  const [gamepadInfo, setGamepadInfo] = useState<GamepadInfo | null>(null);
  const [showTouchControls, setShowTouchControls] = useState<boolean>(false);
  const [controllerToast, setControllerToast] = useState<string | null>(null);

  // Modales
  const [isComicOpen, setIsComicOpen] = useState<boolean>(false);
  const [isKeyRemapOpen, setIsKeyRemapOpen] = useState<boolean>(false);
  const [isControlsGuideOpen, setIsControlsGuideOpen] = useState<boolean>(false);
  const [isDebugOpen, setIsDebugOpen] = useState<boolean>(false);
  const [enableScanlines, setEnableScanlines] = useState<boolean>(false);

  // 1. Inicialización del motor y detección de dispositivo
  useEffect(() => {
    const isMobileDevice =
      typeof window !== 'undefined' &&
      ('ontouchstart' in window || navigator.maxTouchPoints > 0 || window.innerWidth <= 1024);
    setShowTouchControls(isMobileDevice);

    if (canvasRef.current) {
      gameEngine.attachCanvas(canvasRef.current);
    }

    gameEngine.onStateChange = (newState) => {
      setGameState(newState);
    };

    gameEngine.onPlayerUpdate = (player) => {
      setPlayerData({ ...player });
    };

    gameEngine.onPlayer2Update = (player2) => {
      setPlayer2Data(player2 ? { ...player2 } : null);
    };

    gameEngine.onScoreUpdate = (newScore) => {
      setScore(newScore);
    };

    gameEngine.onScore2Update = (newScore2) => {
      setScoreP2(newScore2);
    };

    gameEngine.onSubAreaChange = (newSubArea) => {
      setCurrentSubArea({ ...newSubArea });
    };

    const unsubscribeGamepad = gamepadManager.subscribe((info) => {
      setGamepadInfo(info ? { ...info } : null);
      if (info && info.connected) {
        setControllerToast(`🎮 ${info.displayName} conectado`);
        setTimeout(() => setControllerToast(null), 3500);
      }
    });

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F2' || e.key === '`') {
        e.preventDefault();
        setIsDebugOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    gameEngine.startLoop();

    return () => {
      gameEngine.stopLoop();
      retroAudio.stopMusic();
      unsubscribeGamepad();
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // 2. Control de inicio de juego (1P o 2P Co-op)
  const handleStartGame = (mode: GameMode = '1P') => {
    retroAudio.unlock();
    gameEngine.gameMode = mode;
    gameEngine.setCustomPlayerName(playerName);
    gameEngine.setDifficulty(difficulty);
    gameEngine.setCharacter(selectedChar);
    if (mode === '2P') {
      gameEngine.setCharacter2(selectedChar2);
    }
    gameEngine.resetLevel(selectedStageIndex, 0);
    gameEngine.startGame();
    setCurrentSubArea(gameEngine.getCurrentSubArea());
  };

  const handleSelectDifficulty = (diff: GameDifficulty) => {
    setDifficulty(diff);
    gameEngine.setDifficulty(diff);
  };

  const handleSelectChar = (charId: CharacterId) => {
    setSelectedChar(charId);
    gameEngine.setCustomPlayerName(playerName);
    gameEngine.setCharacter(charId);
    retroAudio.playMenuBeep();
  };

  const handleSelectChar2 = (charId: CharacterId) => {
    setSelectedChar2(charId);
    gameEngine.setCharacter2(charId);
    retroAudio.playMenuBeep();
  };

  const handleSelectStage = (stageIdx: number) => {
    setSelectedStageIndex(stageIdx);
    gameEngine.resetLevel(stageIdx);
    retroAudio.playMenuBeep();
  };

  const handleChangePlayerName = (name: string) => {
    setPlayerName(name);
    gameEngine.setCustomPlayerName(name);
  };

  const handleTagPartner = () => {
    gameEngine.switchPartner();
  };

  const handleToggleSound = () => {
    const muted = retroAudio.toggleMute();
    setIsMuted(muted);
  };

  const handleToggleMusic = () => {
    const active = retroAudio.toggleMusic();
    setIsMusicMuted(!active);
  };

  const handleTogglePause = () => {
    gameEngine.togglePause();
  };

  const handleBackToTitle = () => {
    setGameState('TITLE');
    gameEngine.gameState = 'TITLE';
    retroAudio.startTitleMusic();
  };

  return (
    <div className="relative w-screen h-screen bg-black overflow-hidden select-none flex items-center justify-center">
      <div
        className={`relative w-full h-full max-w-[1920px] max-h-[1080px] flex items-center justify-center bg-black ${
          enableScanlines ? 'scanlines' : ''
        }`}
      >
        <canvas
          ref={canvasRef}
          width={gameEngine.V_WIDTH}
          height={gameEngine.V_HEIGHT}
          className="pixel-canvas w-full h-full max-w-full max-h-full object-contain bg-slate-950 shadow-2xl"
        />

        {/* Notificación Toast cuando se conecta un mando */}
        {controllerToast && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 z-40 bg-emerald-950/90 border-2 border-emerald-500 text-emerald-200 px-4 py-2 rounded-lg font-pixel text-xs shadow-2xl animate-bounce flex items-center gap-2">
            <span>{controllerToast}</span>
          </div>
        )}

        {/* PANTALLA DE TÍTULO ARCADE (Rediseñada según imagen_5ec4e548.png) */}
        {gameState === 'TITLE' && (
          <TitleScreen
            playerName={playerName}
            onChangePlayerName={handleChangePlayerName}
            selectedChar={selectedChar}
            selectedChar2={selectedChar2}
            selectedStageIndex={selectedStageIndex}
            onSelectStage={handleSelectStage}
            difficulty={difficulty}
            onSelectDifficulty={handleSelectDifficulty}
            gamepadInfo={gamepadInfo}
            onSelectChar={handleSelectChar}
            onSelectChar2={handleSelectChar2}
            onStartGame={handleStartGame}
            onOpenComicStory={() => setIsComicOpen(true)}
            onOpenControlsConfig={() => setIsKeyRemapOpen(true)}
            onOpenDebug={() => setIsDebugOpen(true)}
          />
        )}

        {/* HUD EN PARTIDA (Durante juego o pausa) */}
        {(gameState === 'PLAYING' || gameState === 'PAUSED') && playerData && (
          <>
            <GameHUD
              player={playerData}
              player2={player2Data}
              score={score}
              scoreP2={scoreP2}
              stageIndex={gameEngine.currentStageIndex}
              subAreaIndex={gameEngine.currentSubAreaIndex}
              totalSubAreas={currentSubArea?.totalSubAreas || 11}
              subAreaName={currentSubArea?.name || gameEngine.getCurrentSubArea().name}
              difficulty={difficulty}
              isSubAreaCleared={gameEngine.isSubAreaCleared}
              stageTimer={gameEngine.stageTimer}
              isPaused={gameState === 'PAUSED'}
              isMuted={isMuted}
              isMusicMuted={isMusicMuted}
              gamepadInfo={gamepadInfo}
              showTouchControls={showTouchControls}
              onTogglePause={handleTogglePause}
              onToggleSound={handleToggleSound}
              onToggleMusic={handleToggleMusic}
              onToggleTouchControls={() => setShowTouchControls(!showTouchControls)}
              onOpenStory={() => setIsComicOpen(true)}
              onOpenControlsGuide={() => setIsControlsGuideOpen(true)}
              onOpenDebug={() => setIsDebugOpen(true)}
              onTagPartner={handleTagPartner}
            />

            {/* Controles táctiles en pantalla */}
            {showTouchControls && (
              <TouchControls
                specialReady={playerData.stats.specialMeter >= playerData.stats.specialCost}
                onTagPartner={handleTagPartner}
              />
            )}
          </>
        )}

        {/* MODAL DE PAUSA */}
        <PauseModal
          isOpen={gameState === 'PAUSED'}
          isMuted={isMuted}
          isMusicMuted={isMusicMuted}
          onResume={handleTogglePause}
          onRestart={() => gameEngine.retryCurrentLevel()}
          onBackToTitle={handleBackToTitle}
          onOpenControls={() => setIsKeyRemapOpen(true)}
          onToggleSound={handleToggleSound}
          onToggleMusic={handleToggleMusic}
        />

        {/* MODAL DE FIN DE JUEGO (GAME OVER) - Soluciona el bug de reintento */}
        {gameState === 'GAME_OVER' && (
          <GameOverModal
            score={score + scoreP2}
            onRetry={() => {
              gameEngine.retryCurrentLevel();
            }}
            onBackToTitle={handleBackToTitle}
          />
        )}

        {/* MODAL DE VICTORIA (STAGE CLEAR) */}
        {gameState === 'VICTORY' && (
          <VictoryModal
            score={score + scoreP2}
            onPlayAgain={() => gameEngine.restartGame()}
            onBackToTitle={handleBackToTitle}
          />
        )}

        {/* MODAL DE HISTORIA Y CÓMIC ("LA BABY" PC) */}
        <ComicIntroModal
          isOpen={isComicOpen}
          onClose={() => setIsComicOpen(false)}
          onStartPlaying={() => {
            setIsComicOpen(false);
            if (gameState === 'TITLE') {
              handleStartGame('1P');
            }
          }}
        />

        {/* MODAL DE CONFIGURACIÓN DE TECLAS Y MANDOS (P1 & P2) */}
        <KeyRemapModal
          isOpen={isKeyRemapOpen}
          onClose={() => setIsKeyRemapOpen(false)}
          gamepadInfo={gamepadInfo}
        />

        {/* MODAL DE GUÍA RÁPIDA DE MANDOS */}
        <ControlsGuideModal
          isOpen={isControlsGuideOpen}
          onClose={() => setIsControlsGuideOpen(false)}
          gamepadInfo={gamepadInfo}
        />

        {/* DEPURADOR Y MONITOR DE ENTRADAS EN PANTALLA */}
        <GamepadDebugOverlay
          isOpen={isDebugOpen}
          onClose={() => setIsDebugOpen(false)}
        />

        {/* Botones Flotantes Discretos de Filtro CRT y Depurador de Mandos */}
        <div className="absolute bottom-2 left-2 z-20 pointer-events-auto opacity-50 hover:opacity-100 transition-opacity flex items-center gap-1.5">
          <button
            onClick={() => setEnableScanlines(!enableScanlines)}
            className={`px-2 py-1 rounded text-[8px] font-pixel border cursor-pointer ${
              enableScanlines
                ? 'bg-emerald-950 border-emerald-500 text-emerald-300'
                : 'bg-black/60 border-slate-800 text-slate-500'
            }`}
          >
            {enableScanlines ? 'CRT ON' : 'CRT OFF'}
          </button>

          <button
            onClick={() => setIsDebugOpen(!isDebugOpen)}
            className={`px-2 py-1 rounded text-[8px] font-pixel border flex items-center gap-1 cursor-pointer transition-colors ${
              isDebugOpen
                ? 'bg-emerald-900 border-emerald-400 text-white shadow-lg'
                : 'bg-black/70 border-slate-800 text-emerald-400 hover:border-emerald-500'
            }`}
            title="Monitor y diagnóstico de mandos en pantalla (F2)"
          >
            <span>🎮 DEBUG</span>
            <span className="text-[7px] text-slate-400 font-mono">(F2)</span>
          </button>
        </div>
      </div>
    </div>
  );
}
