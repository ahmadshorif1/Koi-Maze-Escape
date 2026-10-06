import React from 'react';
import { Play, RotateCcw, Grid, Settings, HelpCircle } from 'lucide-react';

interface PauseModalProps {
  onResume: () => void;
  onRestart: () => void;
  onLevelSelect: () => void;
  onSettings: () => void;
  onHowToPlay: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  onResume,
  onRestart,
  onLevelSelect,
  onSettings,
  onHowToPlay,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <div className="w-full max-w-sm rounded-3xl bg-slate-900 border border-teal-500/40 p-6 text-center text-slate-100 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
        <h2 className="text-2xl font-black text-amber-300 uppercase tracking-wide">
          GAME PAUSED
        </h2>

        <div className="space-y-2.5 pt-2">
          <button
            onClick={onResume}
            className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/20 hover:brightness-110 active:scale-98 transition-all flex items-center justify-center space-x-2"
          >
            <Play className="w-5 h-5 fill-current" />
            <span>RESUME GAME</span>
          </button>

          <button
            onClick={onRestart}
            className="w-full py-3 px-5 rounded-xl bg-slate-800 border border-slate-700 text-teal-200 font-semibold text-xs hover:bg-slate-700 active:scale-98 transition-all flex items-center justify-center space-x-2"
          >
            <RotateCcw className="w-4 h-4 text-teal-400" />
            <span>RESTART LEVEL</span>
          </button>

          <button
            onClick={onLevelSelect}
            className="w-full py-3 px-5 rounded-xl bg-slate-800 border border-slate-700 text-teal-200 font-semibold text-xs hover:bg-slate-700 active:scale-98 transition-all flex items-center justify-center space-x-2"
          >
            <Grid className="w-4 h-4 text-teal-400" />
            <span>LEVEL SELECT</span>
          </button>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={onSettings}
              className="py-2.5 px-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 font-medium text-xs hover:bg-slate-800 flex items-center justify-center space-x-1.5"
            >
              <Settings className="w-3.5 h-3.5 text-slate-400" />
              <span>SETTINGS</span>
            </button>

            <button
              onClick={onHowToPlay}
              className="py-2.5 px-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 font-medium text-xs hover:bg-slate-800 flex items-center justify-center space-x-1.5"
            >
              <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
              <span>TUTORIAL</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
