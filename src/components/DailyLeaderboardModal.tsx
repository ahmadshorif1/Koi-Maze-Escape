import React from 'react';
import { Trophy, Calendar, Play, ArrowLeft, Star, Flame } from 'lucide-react';
import { DailyScoreRecord, LevelConfig } from '../game/types';
import { formatNiceDate } from '../game/dailyChallenge';

interface DailyLeaderboardModalProps {
  dailyConfig: LevelConfig;
  leaderboard: DailyScoreRecord[];
  todayDateStr: string;
  onPlayDaily: () => void;
  onBack: () => void;
}

export const DailyLeaderboardModal: React.FC<DailyLeaderboardModalProps> = ({
  dailyConfig,
  leaderboard,
  todayDateStr,
  onPlayDaily,
  onBack,
}) => {
  return (
    <div className="relative w-full h-full flex flex-col bg-slate-950 text-slate-100 overflow-hidden">
      {/* Header */}
      <div className="p-4 pt-safe flex items-center justify-between bg-slate-900/80 backdrop-blur-md border-b border-amber-500/30">
        <button
          onClick={onBack}
          className="p-2.5 rounded-full bg-slate-800 text-teal-300 hover:bg-slate-700 active:scale-95 transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="text-center">
          <h2 className="text-xl font-black text-amber-300 tracking-wide uppercase flex items-center justify-center space-x-2">
            <Calendar className="w-5 h-5 text-amber-400" />
            <span>DAILY CHALLENGE</span>
          </h2>
          <span className="text-xs font-semibold text-teal-300/90 block">
            {formatNiceDate(todayDateStr)}
          </span>
        </div>

        <div className="w-9" />
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-4 max-w-xl mx-auto w-full space-y-4 pb-20">
        {/* Today's Maze World Card */}
        <div className="p-4 rounded-3xl bg-gradient-to-r from-amber-950/60 via-slate-900 to-teal-950/60 border border-amber-500/40 shadow-xl space-y-3">
          <div className="flex justify-between items-start">
            <div>
              <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-[11px] font-bold uppercase">
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                <span>Today's Random Maze</span>
              </div>
              <h3 className="text-lg font-black text-slate-100 mt-1">
                {dailyConfig.worldName}
              </h3>
            </div>

            <div className="text-right">
              <span className="text-[10px] text-teal-300 font-bold uppercase block">Target</span>
              <span className="text-base font-black text-amber-400">Exit {dailyConfig.targetExit}</span>
            </div>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            {dailyConfig.description}
          </p>

          <button
            onClick={onPlayDaily}
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 text-slate-950 font-black text-sm shadow-lg shadow-amber-500/20 hover:brightness-110 active:scale-98 transition-all flex items-center justify-center space-x-2"
          >
            <Play className="w-5 h-5 fill-current" />
            <span>PLAY TODAY'S MAZE</span>
          </button>
        </div>

        {/* Global Leaderboard Section */}
        <div className="space-y-3">
          <h4 className="text-xs font-black uppercase text-amber-300 tracking-wider flex items-center space-x-1.5 pl-1">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>Top Scores for {formatNiceDate(todayDateStr)}</span>
          </h4>

          <div className="bg-slate-900/90 rounded-2xl border border-slate-800 divide-y divide-slate-800/60 overflow-hidden shadow-lg">
            {leaderboard.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">
                No scores recorded today yet. Be the first to conquer today's maze!
              </div>
            ) : (
              leaderboard.map((item, index) => {
                const rank = index + 1;
                let rankBadge = `${rank}`;
                let rankStyle = 'bg-slate-800 text-slate-300 border-slate-700';

                if (rank === 1) {
                  rankBadge = '🥇';
                  rankStyle = 'bg-amber-500/20 border-amber-400 text-amber-300 font-black';
                } else if (rank === 2) {
                  rankBadge = '🥈';
                  rankStyle = 'bg-slate-300/20 border-slate-300 text-slate-200 font-bold';
                } else if (rank === 3) {
                  rankBadge = '🥉';
                  rankStyle = 'bg-amber-800/20 border-amber-700 text-amber-500 font-bold';
                }

                return (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3.5 text-xs hover:bg-slate-800/40 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-8 h-8 rounded-full border flex items-center justify-center text-xs ${rankStyle}`}
                      >
                        {rankBadge}
                      </div>

                      <div>
                        <span className="font-bold text-slate-100 block text-sm">
                          {item.playerName}
                        </span>
                        <div className="flex items-center space-x-2 text-[10px] text-slate-400 mt-0.5">
                          <span>⏱ {item.timeTaken}s</span>
                          <span>•</span>
                          <span>⚡ {item.moves} moves</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="font-mono font-bold text-amber-300 text-sm block">
                        {item.score}
                      </span>
                      <div className="flex items-center justify-end space-x-0.5 mt-0.5">
                        {[1, 2, 3].map((starNum) => (
                          <Star
                            key={starNum}
                            className={`w-3 h-3 ${
                              starNum <= item.stars
                                ? 'text-amber-400 fill-amber-400'
                                : 'text-slate-700'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
