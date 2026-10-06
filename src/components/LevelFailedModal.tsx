import React from 'react';
import { RotateCcw, Grid } from 'lucide-react';

interface LevelFailedModalProps {
  reason: 'timeout' | 'wrong_exit';
  targetExit: number;
  onTryAgain: () => void;
  onLevelSelect: () => void;
}

export const LevelFailedModal: React.FC<LevelFailedModalProps> = ({
  reason,
  targetExit,
  onTryAgain,
  onLevelSelect,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <div className="w-full max-w-sm rounded-3xl bg-slate-900 border border-rose-500/50 p-6 text-center text-slate-100 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
        <div className="text-4xl">
          {reason === 'timeout' ? '⏳' : '⚠️'}
        </div>

        <div>
          <h2 className="text-2xl font-black text-rose-400 uppercase tracking-tight">
            {reason === 'timeout' ? "TIME'S UP!" : 'WRONG EXIT!'}
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            {reason === 'timeout'
              ? 'The clock ran out before you escaped the maze.'
              : `You reached the wrong exit! Your target is Exit ${targetExit}.`}
          </p>
        </div>

        <div className="space-y-2.5 pt-2">
          <button
            onClick={onTryAgain}
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-rose-500 to-amber-600 text-slate-950 font-black text-sm shadow-lg shadow-rose-500/20 hover:brightness-110 active:scale-98 transition-all flex items-center justify-center space-x-2"
          >
            <RotateCcw className="w-5 h-5" />
            <span>TRY AGAIN</span>
          </button>

          <button
            onClick={onLevelSelect}
            className="w-full py-3 px-5 rounded-xl bg-slate-800 border border-slate-700 text-teal-200 font-semibold text-xs hover:bg-slate-700 flex items-center justify-center space-x-2"
          >
            <Grid className="w-4 h-4 text-teal-400" />
            <span>LEVEL SELECT</span>
          </button>
        </div>
      </div>
    </div>
  );
};
