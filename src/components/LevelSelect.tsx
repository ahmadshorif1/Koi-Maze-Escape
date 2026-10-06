import React from 'react';
import { ArrowLeft, Lock, Star } from 'lucide-react';
import { GAME_LEVELS } from '../game/levels';
import { LevelProgress } from '../game/types';

interface LevelSelectProps {
  progressList: LevelProgress[];
  onSelectLevel: (levelId: number) => void;
  onBack: () => void;
}

export const LevelSelect: React.FC<LevelSelectProps> = ({
  progressList,
  onSelectLevel,
  onBack,
}) => {
  return (
    <div className="relative w-full h-full flex flex-col bg-slate-950 text-slate-100 overflow-hidden">
      {/* Header */}
      <div className="p-4 pt-safe flex items-center justify-between bg-slate-900/80 backdrop-blur-md border-b border-teal-500/20">
        <button
          onClick={onBack}
          className="p-2.5 rounded-full bg-slate-800 text-teal-300 hover:bg-slate-700 active:scale-95 transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-extrabold text-amber-300 tracking-wide uppercase">
          SELECT LEVEL
        </h2>

        <div className="w-9" />
      </div>

      {/* Levels Grid Container */}
      <div className="flex-1 overflow-y-auto p-4 max-w-2xl mx-auto w-full">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 pb-8">
          {GAME_LEVELS.map((level) => {
            const prog = progressList.find((p) => p.levelId === level.id) || {
              levelId: level.id,
              unlocked: level.id === 1,
              stars: 0,
              bestTime: null,
              bestScore: 0,
              bestMoves: null,
            };

            return (
              <button
                key={level.id}
                disabled={!prog.unlocked}
                onClick={() => onSelectLevel(level.id)}
                className={`relative flex flex-col items-center justify-between p-3.5 rounded-2xl border text-left transition-all active:scale-95 ${
                  prog.unlocked
                    ? 'bg-slate-900/90 border-teal-500/40 hover:border-amber-400 hover:shadow-lg hover:shadow-amber-500/10'
                    : 'bg-slate-950/60 border-slate-800 opacity-50 cursor-not-allowed'
                }`}
              >
                {/* Level Number & Lock */}
                <div className="w-full flex justify-between items-center">
                  <span className="text-sm font-black text-amber-300">
                    Lvl {level.id}
                  </span>
                  {!prog.unlocked && <Lock className="w-4 h-4 text-slate-500" />}
                </div>

                {/* World Theme Name */}
                <div className="my-2 text-center">
                  <span className="text-xs font-semibold text-slate-200 line-clamp-1">
                    {level.worldName}
                  </span>
                  <span className="text-[10px] text-teal-400/80 block mt-0.5">
                    Target: Exit {level.targetExit}
                  </span>
                </div>

                {/* Star Rating Badges */}
                <div className="flex items-center space-x-1 mt-1">
                  {[1, 2, 3].map((starNum) => (
                    <Star
                      key={starNum}
                      className={`w-3.5 h-3.5 ${
                        starNum <= prog.stars
                          ? 'text-amber-400 fill-amber-400'
                          : 'text-slate-700'
                      }`}
                    />
                  ))}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
