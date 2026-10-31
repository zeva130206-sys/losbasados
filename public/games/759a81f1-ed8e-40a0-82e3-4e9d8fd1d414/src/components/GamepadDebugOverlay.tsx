/**
 * Monitor y Diagnóstico de Entradas en Pantalla (Gamepad & Input Debugger)
 * Permite visualizar el estado crudo (raw) de ejes, botones, POV hats y mapeo normalizado en tiempo real.
 */

import React, { useState, useEffect } from 'react';
import { X, Activity, RefreshCw, Vibrate, Terminal, ChevronDown, ChevronUp, Copy, Check } from 'lucide-react';
import { gamepadManager } from '../game/gamepad';
import { GamepadDebugLogEntry, RawGamepadState } from '../game/types';

interface GamepadDebugOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GamepadDebugOverlay: React.FC<GamepadDebugOverlayProps> = ({ isOpen, onClose }) => {
  const [snapshots, setSnapshots] = useState<RawGamepadState[]>([]);
  const [logs, setLogs] = useState<GamepadDebugLogEntry[]>([]);
  const [selectedPadIndex, setSelectedPadIndex] = useState<number>(0);
  const [copied, setCopied] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'visual' | 'logs'>('visual');
  const [isMinimized, setIsMinimized] = useState<boolean>(false);

  // Actualización en tiempo real (~30 FPS para evitar sobrecarga en UI)
  useEffect(() => {
    if (!isOpen) return;

    const interval = setInterval(() => {
      const currentSnapshots = gamepadManager.getRawSnapshots();
      setSnapshots(currentSnapshots);
      setLogs(gamepadManager.getDebugLogs());

      if (currentSnapshots.length > 0 && !currentSnapshots.some(s => s.index === selectedPadIndex)) {
        setSelectedPadIndex(currentSnapshots[0].index);
      }
    }, 33); // ~30 fps

    return () => clearInterval(interval);
  }, [isOpen, selectedPadIndex]);

  if (!isOpen) return null;

  const currentPad = snapshots.find(s => s.index === selectedPadIndex) || snapshots[0];

  const handleTestVibration = () => {
    gamepadManager.triggerHaptic(150, 0.8, 0.8);
  };

  const handleClearLogs = () => {
    gamepadManager.clearDebugLogs();
    setLogs(gamepadManager.getDebugLogs());
  };

  const handleCopyDiagnostics = () => {
    if (!currentPad) {
      navigator.clipboard?.writeText('No hay gamepad conectado.');
      return;
    }
    const report = {
      timestamp: new Date().toISOString(),
      controller: {
        index: currentPad.index,
        id: currentPad.id,
        brand: currentPad.brand,
        displayName: currentPad.displayName,
        mapping: currentPad.mapping,
        axesCount: currentPad.axes.length,
        buttonsCount: currentPad.buttons.length
      },
      rawAxes: currentPad.axes.map((v, i) => `Axis ${i}: ${v.toFixed(3)}`),
      rawButtons: currentPad.buttons.map(b => `Btn ${b.index}: ${b.pressed ? 'PRESSED' : 'off'} (${b.value.toFixed(2)})`),
      normalized: currentPad.normalized,
      recentLogs: logs.slice(0, 15).map(l => `[${l.time}] [${l.type}] ${l.message}`)
    };

    navigator.clipboard?.writeText(JSON.stringify(report, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={`fixed z-50 transition-all duration-200 select-none ${
        isMinimized
          ? 'bottom-4 right-4 w-72'
          : 'bottom-4 right-4 sm:bottom-6 sm:right-6 w-[94vw] sm:w-[540px] max-w-[580px]'
      }`}
    >
      <div className="bg-slate-950/95 border-2 border-emerald-500/80 rounded-xl shadow-2xl backdrop-blur-md overflow-hidden text-slate-100 flex flex-col max-h-[85vh]">
        {/* Cabecera del Depurador */}
        <div className="flex items-center justify-between px-3 py-2 bg-slate-900 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <Activity className="w-4 h-4 text-emerald-400" />
            <h3 className="font-pixel text-[10px] sm:text-xs text-emerald-400 tracking-wider">
              INPUT DEBUGGER · RAW STATE
            </h3>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title={isMinimized ? 'Expandir' : 'Minimizar'}
            >
              {isMinimized ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Cerrar depurador"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Si está minimizado, solo muestra resumen rápido */}
        {isMinimized ? (
          <div className="p-3 text-xs font-mono bg-slate-950 flex items-center justify-between">
            <span className="text-emerald-400 truncate max-w-[170px]">
              {currentPad ? currentPad.displayName : 'Sin Mando Conectado'}
            </span>
            <span className="text-[10px] text-slate-400">
              {currentPad ? `X:${currentPad.normalized.moveX} Y:${currentPad.normalized.moveY}` : 'Pulsar tecla/botón'}
            </span>
          </div>
        ) : (
          <>
            {/* Barra de Selección de Mando y Herramientas Rápidas */}
            <div className="bg-slate-900/80 px-3 py-2 border-b border-slate-800 flex items-center justify-between gap-2 flex-wrap text-xs">
              {snapshots.length > 0 ? (
                <div className="flex items-center gap-1.5 overflow-x-auto">
                  {snapshots.map(pad => (
                    <button
                      key={pad.index}
                      onClick={() => setSelectedPadIndex(pad.index)}
                      className={`px-2 py-1 rounded text-[10px] font-pixel transition-colors ${
                        selectedPadIndex === pad.index
                          ? 'bg-emerald-600 text-white font-bold'
                          : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      PAD #{pad.index} ({pad.brand.toUpperCase()})
                    </button>
                  ))}
                </div>
              ) : (
                <span className="text-amber-400 font-pixel text-[9px] flex items-center gap-1">
                  ⚠️ No hay gamepads detectados. Presiona cualquier botón en tu mando.
                </span>
              )}

              <div className="flex items-center gap-1 ml-auto">
                <button
                  onClick={handleTestVibration}
                  className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 text-[10px] font-pixel flex items-center gap-1 transition-colors"
                  title="Enviar pulso de vibración háptica"
                >
                  <Vibrate className="w-3 h-3" />
                  <span>VIBRAR</span>
                </button>
                <button
                  onClick={handleCopyDiagnostics}
                  className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-amber-300 text-[10px] font-pixel flex items-center gap-1 transition-colors"
                  title="Copiar reporte completo al portapapeles"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copied ? 'COPIADO' : 'COPIAR'}</span>
                </button>
              </div>
            </div>

            {/* Pestañas de Vista */}
            <div className="flex border-b border-slate-800 bg-slate-950 px-3 pt-1.5 gap-2 text-[10px] font-pixel">
              <button
                onClick={() => setActiveTab('visual')}
                className={`px-3 py-1 rounded-t transition-colors ${
                  activeTab === 'visual'
                    ? 'bg-slate-800 text-emerald-400 border-t-2 border-emerald-400'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                ESTADO EN VIVO & EJES
              </button>
              <button
                onClick={() => setActiveTab('logs')}
                className={`px-3 py-1 rounded-t transition-colors flex items-center gap-1 ${
                  activeTab === 'logs'
                    ? 'bg-slate-800 text-emerald-400 border-t-2 border-emerald-400'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Terminal className="w-3 h-3" />
                <span>REGISTRO DE EVENTOS ({logs.length})</span>
              </button>
            </div>

            {/* Contenido Principal */}
            <div className="p-3 overflow-y-auto flex-1 font-mono text-xs space-y-3 max-h-[60vh] scrollbar-thin">
              {currentPad ? (
                activeTab === 'visual' ? (
                  <>
                    {/* Ficha Técnica del Mando */}
                    <div className="bg-slate-900/90 border border-slate-800 p-2.5 rounded-lg space-y-1 text-[11px]">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Dispositivo:</span>
                        <span className="text-emerald-300 font-bold truncate max-w-[280px]">
                          {currentPad.displayName}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="text-slate-400">Vendor ID / Raw ID:</span>
                        <span className="text-slate-300 truncate max-w-[280px]" title={currentPad.id}>
                          {currentPad.id}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-[10px] border-t border-slate-800/80 pt-1">
                        <span className="text-slate-400">Mapping API:</span>
                        <span
                          className={`font-pixel text-[9px] px-1.5 py-0.5 rounded ${
                            currentPad.mapping === 'standard'
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-700'
                              : 'bg-amber-950 text-amber-300 border border-amber-700'
                          }`}
                        >
                          {currentPad.mapping.toUpperCase()}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="text-slate-400">Ejes / Botones detectados:</span>
                        <span className="text-cyan-300">
                          {currentPad.axes.length} Ejes · {currentPad.buttons.length} Botones
                        </span>
                      </div>
                    </div>

                    {/* Brújula de Movimiento & Mapeo Normalizado */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {/* Stick Visual & D-Pad */}
                      <div className="bg-slate-900/90 border border-slate-800 p-2.5 rounded-lg flex flex-col items-center justify-center">
                        <span className="text-[10px] font-pixel text-slate-400 mb-2">
                          DIRECCIÓN ANALÓGICA & D-PAD
                        </span>

                        {/* Coordenadas 2D Stick */}
                        <div className="relative w-28 h-28 bg-slate-950 border border-slate-700 rounded-full flex items-center justify-center shadow-inner">
                          {/* Líneas de cruz guía */}
                          <div className="absolute w-full h-[1px] bg-slate-800" />
                          <div className="absolute h-full w-[1px] bg-slate-800" />
                          {/* Círculo de zona muerta */}
                          <div className="absolute w-12 h-12 border border-dashed border-slate-800 rounded-full pointer-events-none" />

                          {/* Cursor de Stick Normalizado */}
                          <div
                            className="absolute w-4 h-4 bg-emerald-400 rounded-full shadow-lg shadow-emerald-500/50 transition-all duration-75 border-2 border-slate-900"
                            style={{
                              transform: `translate(${currentPad.normalized.moveX * 42}px, ${
                                currentPad.normalized.moveY * 42
                              }px)`
                            }}
                          />

                          {/* Indicadores D-Pad alrededor */}
                          <span
                            className={`absolute top-1 text-[8px] font-pixel ${
                              currentPad.normalized.up ? 'text-emerald-400 font-bold scale-125' : 'text-slate-600'
                            }`}
                          >
                            ▲
                          </span>
                          <span
                            className={`absolute bottom-1 text-[8px] font-pixel ${
                              currentPad.normalized.down ? 'text-emerald-400 font-bold scale-125' : 'text-slate-600'
                            }`}
                          >
                            ▼
                          </span>
                          <span
                            className={`absolute left-1 text-[8px] font-pixel ${
                              currentPad.normalized.left ? 'text-emerald-400 font-bold scale-125' : 'text-slate-600'
                            }`}
                          >
                            ◀
                          </span>
                          <span
                            className={`absolute right-1 text-[8px] font-pixel ${
                              currentPad.normalized.right ? 'text-emerald-400 font-bold scale-125' : 'text-slate-600'
                            }`}
                          >
                            ▶
                          </span>
                        </div>

                        <div className="mt-2 text-[10px] font-mono text-center">
                          <span className="text-slate-400">Norm: </span>
                          <span className="text-emerald-300 font-bold">
                            X: {currentPad.normalized.moveX.toFixed(2)} | Y: {currentPad.normalized.moveY.toFixed(2)}
                          </span>
                        </div>
                      </div>

                      {/* Estado de Acciones Normalizadas del Juego */}
                      <div className="bg-slate-900/90 border border-slate-800 p-2.5 rounded-lg flex flex-col justify-between">
                        <div>
                          <span className="text-[10px] font-pixel text-slate-400 block mb-2">
                            ACCIONES DEL JUEGO
                          </span>
                          <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                            <div
                              className={`p-1.5 rounded border text-center font-pixel ${
                                currentPad.normalized.jump
                                  ? 'bg-blue-600 border-blue-400 text-white shadow-lg'
                                  : 'bg-slate-950 border-slate-800 text-slate-500'
                              }`}
                            >
                              SALTO
                            </div>
                            <div
                              className={`p-1.5 rounded border text-center font-pixel ${
                                currentPad.normalized.punch
                                  ? 'bg-rose-600 border-rose-400 text-white shadow-lg'
                                  : 'bg-slate-950 border-slate-800 text-slate-500'
                              }`}
                            >
                              GOLPE
                            </div>
                            <div
                              className={`p-1.5 rounded border text-center font-pixel ${
                                currentPad.normalized.kick
                                  ? 'bg-amber-600 border-amber-400 text-white shadow-lg'
                                  : 'bg-slate-950 border-slate-800 text-slate-500'
                              }`}
                            >
                              PATADA
                            </div>
                            <div
                              className={`p-1.5 rounded border text-center font-pixel ${
                                currentPad.normalized.special
                                  ? 'bg-cyan-600 border-cyan-400 text-white shadow-lg'
                                  : 'bg-slate-950 border-slate-800 text-slate-500'
                              }`}
                            >
                              FURIA
                            </div>
                            <div
                              className={`p-1.5 rounded border text-center font-pixel ${
                                currentPad.normalized.tag
                                  ? 'bg-purple-600 border-purple-400 text-white shadow-lg'
                                  : 'bg-slate-950 border-slate-800 text-slate-500'
                              }`}
                            >
                              TAG
                            </div>
                            <div
                              className={`p-1.5 rounded border text-center font-pixel ${
                                currentPad.normalized.pause
                                  ? 'bg-rose-800 border-rose-500 text-white shadow-lg'
                                  : 'bg-slate-950 border-slate-800 text-slate-500'
                              }`}
                            >
                              PAUSA
                            </div>
                          </div>
                        </div>

                        <div className="mt-2 pt-2 border-t border-slate-800 text-[10px] text-slate-400">
                          <span className="block text-slate-500 text-[9px] uppercase font-pixel">Fuente Activa:</span>
                          <span className="text-amber-300 text-[10px] leading-tight block break-words">
                            {currentPad.normalized.movementSource}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Visualizador de Ejes Analógicos Crudos (Raw Axes) */}
                    <div className="bg-slate-900/90 border border-slate-800 p-2.5 rounded-lg">
                      <span className="text-[10px] font-pixel text-slate-400 block mb-2">
                        EJES ANALÓGICOS CRUDOS ({currentPad.axes.length} EJES)
                      </span>
                      <div className="space-y-1.5">
                        {currentPad.axes.map((val, idx) => {
                          const percent = Math.min(100, Math.max(0, ((val + 1) / 2) * 100));
                          const isDeflected = Math.abs(val) > 0.2;
                          let labelHint = '';
                          if (idx === 0) labelHint = 'Stick X';
                          else if (idx === 1) labelHint = 'Stick Y';
                          else if (idx === 2) labelHint = 'Stick R X / Gatillo';
                          else if (idx === 3) labelHint = 'Stick R Y';
                          else if (idx === 4) labelHint = 'D-Pad X / Gatillo';
                          else if (idx === 5) labelHint = 'D-Pad Y / Gatillo';
                          else if (idx === 9) labelHint = 'POV Hat DirectInput';

                          return (
                            <div key={idx} className="flex items-center gap-2 text-[10px]">
                              <span className="w-14 shrink-0 text-slate-400">
                                Eje {idx}:
                              </span>
                              <div className="relative flex-1 h-3.5 bg-slate-950 border border-slate-800 rounded overflow-hidden">
                                {/* Marca de centro neutro */}
                                <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-slate-700 z-10" />
                                {/* Barra de deflexión */}
                                <div
                                  className={`h-full transition-all duration-75 ${
                                    isDeflected ? 'bg-cyan-400' : 'bg-slate-700'
                                  }`}
                                  style={{
                                    width: `${Math.abs(val) * 50}%`,
                                    marginLeft: val >= 0 ? '50%' : `${50 - Math.abs(val) * 50}%`
                                  }}
                                />
                              </div>
                              <span
                                className={`w-14 text-right font-mono ${
                                  isDeflected ? 'text-cyan-300 font-bold' : 'text-slate-400'
                                }`}
                              >
                                {val >= 0 ? `+${val.toFixed(2)}` : val.toFixed(2)}
                              </span>
                              {labelHint && (
                                <span className="text-[9px] text-slate-500 w-24 truncate hidden sm:inline">
                                  ({labelHint})
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Matriz de Botones Crudos (Raw Buttons) */}
                    <div className="bg-slate-900/90 border border-slate-800 p-2.5 rounded-lg">
                      <span className="text-[10px] font-pixel text-slate-400 block mb-2">
                        BOTONES FÍSICOS CRUDOS ({currentPad.buttons.length} DETECTADOS)
                      </span>
                      <div className="grid grid-cols-5 sm:grid-cols-8 gap-1.5">
                        {currentPad.buttons.map(btn => (
                          <div
                            key={btn.index}
                            className={`p-1 rounded text-center border transition-colors ${
                              btn.pressed
                                ? 'bg-emerald-500 border-emerald-300 text-slate-950 font-bold shadow-md shadow-emerald-500/50'
                                : 'bg-slate-950 border-slate-800 text-slate-400'
                            }`}
                            title={`Botón ${btn.index}: ${btn.pressed ? 'PULSADO' : 'libre'} (Valor: ${btn.value.toFixed(2)})`}
                          >
                            <span className="text-[8px] font-pixel block">B{btn.index}</span>
                            <span className="text-[8px] font-mono block">
                              {btn.value > 0.05 ? btn.value.toFixed(1) : '0'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  /* Pestaña de Registro de Eventos (Logs) */
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[10px] text-slate-400 pb-1 border-b border-slate-800">
                      <span>ÚLTIMOS {logs.length} EVENTOS CAPTURADOS:</span>
                      <button
                        onClick={handleClearLogs}
                        className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-1 font-pixel text-[8px]"
                      >
                        <RefreshCw className="w-2.5 h-2.5" />
                        <span>LIMPIAR</span>
                      </button>
                    </div>

                    <div className="bg-black/80 border border-slate-800 rounded p-2 space-y-1 font-mono text-[10px] max-h-[380px] overflow-y-auto">
                      {logs.length === 0 ? (
                        <div className="text-slate-600 text-center py-4 italic">
                          No hay eventos registrados aún. Mueve los sticks o presiona botones.
                        </div>
                      ) : (
                        logs.map(log => {
                          const color =
                            log.type === 'connect'
                              ? 'text-emerald-400 font-bold'
                              : log.type === 'disconnect'
                              ? 'text-rose-400 font-bold'
                              : log.type === 'button'
                              ? 'text-amber-300'
                              : log.type === 'axis'
                              ? 'text-cyan-300'
                              : 'text-slate-300';

                          return (
                            <div key={log.id} className="flex items-start gap-1.5 leading-snug">
                              <span className="text-slate-500 shrink-0 text-[9px]">[{log.time}]</span>
                              <span className="text-slate-600 shrink-0 text-[8px] font-pixel">[{log.type.toUpperCase()}]</span>
                              <span className={`${color} break-all`}>{log.message}</span>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                )
              ) : (
                <div className="p-6 text-center space-y-3">
                  <div className="text-3xl">🎮</div>
                  <p className="text-xs text-slate-300 font-pixel">NO SE DETECTA NINGÚN MANDO ACTIVO</p>
                  <p className="text-[11px] text-slate-400 leading-relaxed font-retro">
                    Por motivos de privacidad de los navegadores web (Chrome, Firefox, Safari, Edge), la Gamepad API
                    no expone mandos conectados hasta que el usuario presiona al menos un botón en el controlador.
                  </p>
                  <div className="inline-block px-3 py-1.5 rounded bg-slate-900 border border-emerald-500/40 text-emerald-400 text-[10px] font-pixel animate-pulse">
                    Presiona cualquier botón (A, X, Start o Cruz)
                  </div>
                </div>
              )}
            </div>

            {/* Pie del Depurador */}
            <div className="px-3 py-2 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
              <span className="font-pixel text-[8px] text-slate-500">
                ATAJO: TECLA F2 O BOTÓN DEBUG EN HUD
              </span>
              <button
                onClick={onClose}
                className="px-3 py-1 rounded font-pixel text-[9px] bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
              >
                CERRAR
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
