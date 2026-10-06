import React from 'react';
import { Star, ArrowRight, RotateCcw, Grid } from 'lucide-react';

interface LevelCompleteModalProps {
  levelId: number;
  stars: number;
  timeTaken: number;
  moves: number;
  score: number;
  onNextLevel: () => void;
  onReplay: () => void;
  onLevelSelect: () => void;
  isLastLevel: boolean;
}

export const LevelCompleteModal: React.FC<LevelCompleteModalProps> = ({
  levelId,
  stars,
  timeTaken,
  moves,
  score,
  onNextLevel,
  onReplay,
  onLevelSelect,
  isLastLevel,
}) => {
  const minutes = Math.floor(timeTaken / 60);
  const seconds = timeTaken % 60;
  const timeFormatted = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <div className="w-full max-w-sm rounded-3xl bg-slate-900 border border-amber-500/50 p-6 text-center text-slate-100 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
        <div className="text-4xl animate-bounce">🎉</div>

        <div>
          <h2 className="text-2xl font-black bg-gradient-to-r from-amber-300 via-amber-200 to-yellow-400 bg-clip-text text-transparent uppercase tracking-tight">
            LEVEL {levelId} COMPLETE!
          </h2>
          <p className="text-xs text-teal-300 font-semibold mt-1">
            New Environment Unlocked!
          </p>
        </div>

        {/* Stars Earned */}
        <div className="flex justify-center items-center space-x-2 py-1">
          {[1, 2, 3].map((starNum) => (
            <Star
              key={starNum}
              className={`w-10 h-10 transition-transform ${
                starNum <= stars
                  ? 'text-amber-400 fill-amber-400 animate-pulse scale-110'
                  : 'text-slate-700'
              }`}
            />
          ))}
        </div>

        {/* Stats Summary Box */}
        <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 grid grid-cols-3 gap-2 text-center">
          <div>
            <span className="text-[10px] text-slate-400 uppercase block font-medium">
              Time
            </span>
            <span className="text-sm font-mono font-bold text-teal-300">
              {timeFormatted}
            </span>
          </div>

          <div>
            <span className="text-[10px] text-slate-400 uppercase block font-medium">
              Moves
            </span>
            <span className="text-sm font-mono font-bold text-amber-300">
              {moves}
            </span>
          </div>

          <div>
            <span className="text-[10px] text-slate-400 uppercase block font-medium">
              Score
            </span>
            <span className="text-sm font-mono font-bold text-emerald-400">
              {score}
            </span>
          </div>
        </div>

        {/* Buttons */}
        <div className="space-y-2.5 pt-2">
          {!isLastLevel ? (
            <button
              onClick={onNextLevel}
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 text-slate-950 font-black text-base shadow-lg shadow-amber-500/25 hover:brightness-110 active:scale-98 transition-all flex items-center justify-center space-x-2"
            >
              <span>NEXT LEVEL</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          ) : (
            <div className="text-sm font-bold text-amber-300 p-2">
              🏆 You Beat All 20 Levels! True Koi Master!
            </div>
          )}

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={onReplay}
              className="py-3 px-4 rounded-xl bg-slate-800 border border-slate-700 text-teal-200 font-semibold text-xs hover:bg-slate-700 flex items-center justify-center space-x-1.5"
            >
              <RotateCcw className="w-4 h-4 text-teal-400" />
              <span>REPLAY</span>
            </button>

            <button
              onClick={onLevelSelect}
              className="py-3 px-4 rounded-xl bg-slate-800 border border-slate-700 text-teal-200 font-semibold text-xs hover:bg-slate-700 flex items-center justify-center space-x-1.5"
            >
              <Grid className="w-4 h-4 text-teal-400" />
              <span>LEVELS</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
