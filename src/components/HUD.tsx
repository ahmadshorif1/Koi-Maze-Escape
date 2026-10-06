import React from 'react';
import { Pause, Volume2, VolumeX, Lightbulb, Compass, RotateCcw } from 'lucide-react';
import { LevelConfig } from '../game/types';

interface HUDProps {
  levelConfig: LevelConfig;
  timeRemaining: number;
  movesCount: number;
  hintsRemaining: number;
  isMuted: boolean;
  onToggleMute: () => void;
  onPause: () => void;
  onHint: () => void;
  onRecenter: () => void;
  onRestart: () => void;
}

export const HUD: React.FC<HUDProps> = ({
  levelConfig,
  timeRemaining,
  movesCount,
  hintsRemaining,
  isMuted,
  onToggleMute,
  onPause,
  onHint,
  onRecenter,
  onRestart,
}) => {
  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;
  const timeFormatted = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  return (
    <>
      {/* Top HUD Header */}
      <div className="absolute top-0 left-0 right-0 z-20 p-3 pt-safe flex justify-between items-center bg-gradient-to-b from-slate-950/90 via-slate-950/60 to-transparent pointer-events-none">
        {/* Left Stats */}
        <div className="flex items-center space-x-2 pointer-events-auto">
          <button
            onClick={onPause}
            className="p-2 rounded-xl bg-slate-900/80 backdrop-blur-md border border-teal-500/30 text-slate-100 hover:bg-slate-800 active:scale-95 transition-all shadow-md"
          >
            <Pause className="w-5 h-5 text-teal-400" />
          </button>

          <button
            onClick={onToggleMute}
            className="p-2 rounded-xl bg-slate-900/80 backdrop-blur-md border border-teal-500/30 text-slate-100 hover:bg-slate-800 active:scale-95 transition-all shadow-md"
          >
            {isMuted ? (
              <VolumeX className="w-5 h-5 text-rose-400" />
            ) : (
              <Volume2 className="w-5 h-5 text-teal-400" />
            )}
          </button>
        </div>

        {/* Center Target Exit Badge */}
        <div className="flex flex-col items-center pointer-events-auto">
          <div className="px-4 py-1.5 rounded-full bg-amber-500 text-slate-950 font-black text-xs md:text-sm tracking-wider uppercase shadow-lg shadow-amber-500/30 border border-amber-300/50 flex items-center space-x-1.5">
            <span>TARGET EXIT {levelConfig.targetExit}</span>
          </div>
          <span className="text-[10px] font-semibold text-teal-200/80 mt-0.5">
            Level {levelConfig.id}
          </span>
        </div>

        {/* Right Timer & Moves */}
        <div className="flex items-center space-x-2 pointer-events-auto">
          <div className="flex flex-col items-end px-3 py-1 rounded-xl bg-slate-900/80 backdrop-blur-md border border-teal-500/30 text-xs font-mono font-bold">
            <span className={timeRemaining < 15 ? 'text-rose-400 animate-pulse' : 'text-amber-300'}>
              ⏱ {timeFormatted}
            </span>
            <span className="text-[10px] text-slate-400 font-sans font-normal">
              MOVES: {movesCount}
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Control Actions Bar */}
      <div className="absolute bottom-0 left-0 right-0 z-20 p-4 pb-safe flex justify-center items-center space-x-3 bg-gradient-to-t from-slate-950/90 via-slate-950/60 to-transparent pointer-events-none">
        <button
          onClick={onHint}
          disabled={hintsRemaining <= 0}
          className="pointer-events-auto px-4 py-2.5 rounded-xl bg-slate-900/90 backdrop-blur-md border border-amber-500/40 text-amber-300 font-semibold text-xs md:text-sm hover:bg-slate-800 active:scale-95 transition-all shadow-lg flex items-center space-x-1.5 disabled:opacity-40"
        >
          <Lightbulb className="w-4 h-4 text-amber-400" />
          <span>HINT ({hintsRemaining})</span>
        </button>

        <button
          onClick={onRecenter}
          className="pointer-events-auto px-4 py-2.5 rounded-xl bg-slate-900/90 backdrop-blur-md border border-teal-500/40 text-teal-200 font-semibold text-xs md:text-sm hover:bg-slate-800 active:scale-95 transition-all shadow-lg flex items-center space-x-1.5"
        >
          <Compass className="w-4 h-4 text-teal-400" />
          <span>RECENTER</span>
        </button>

        <button
          onClick={onRestart}
          className="pointer-events-auto p-2.5 rounded-xl bg-slate-900/90 backdrop-blur-md border border-teal-500/40 text-slate-200 hover:bg-slate-800 active:scale-95 transition-all shadow-lg"
          title="Restart Level"
        >
          <RotateCcw className="w-4 h-4 text-slate-300" />
        </button>
      </div>
    </>
  );
};
