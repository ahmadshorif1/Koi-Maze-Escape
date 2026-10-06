import React from 'react';
import { Play, Grid, HelpCircle, Settings, Smartphone, Award, Calendar, Flame } from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';

interface HomeScreenProps {
  onPlay: () => void;
  onDailyChallenge: () => void;
  onLevelSelect: () => void;
  onHowToPlay: () => void;
  onSettings: () => void;
  currentLevelId: number;
  totalStars: number;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onPlay,
  onDailyChallenge,
  onLevelSelect,
  onHowToPlay,
  onSettings,
  currentLevelId,
  totalStars,
}) => {
  return (
    <div className="relative w-full h-full flex flex-col items-center justify-between p-6 bg-gradient-to-b from-slate-950 via-teal-950 to-slate-950 text-slate-100 overflow-y-auto">
      {/* Background Animated Koi Water Ripple Effect */}
      <div className="absolute inset-0 pointer-events-none opacity-20 overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-teal-500 blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 translate-y-1/2 w-96 h-96 rounded-full bg-amber-500 blur-3xl animate-pulse" />
      </div>

      {/* Top Header Bar */}
      <div className="relative z-10 w-full flex justify-between items-center max-w-md pt-2">
        <div className="flex items-center space-x-2 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-teal-500/30">
          <Award className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-semibold text-amber-300">{totalStars} Stars</span>
        </div>

        <button
          onClick={onSettings}
          className="p-2.5 rounded-full bg-slate-900/80 backdrop-blur-md border border-teal-500/30 text-teal-300 hover:bg-teal-900/50 transition-all active:scale-95"
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>

      {/* Center Hero Logo & Koi Graphics */}
      <div className="relative z-10 my-auto flex flex-col items-center text-center max-w-md py-4">
        {/* Swimming Koi Animated Avatar */}
        <div className="relative w-36 h-36 mb-6 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-teal-500/20 border-2 border-teal-400/40 animate-ping" />
          <div className="absolute inset-2 rounded-full bg-slate-900/90 border border-teal-400/50 shadow-2xl flex items-center justify-center">
            {/* Cute Koi Illustration */}
            <svg className="w-24 h-24 text-amber-500 animate-bounce" viewBox="0 0 100 100">
              <path
                d="M 50,20 C 65,30 75,50 70,75 C 60,85 40,85 30,75 C 25,50 35,30 50,20 Z"
                fill="currentColor"
              />
              <circle cx="45" cy="35" r="4" fill="#0f172a" />
              <circle cx="55" cy="35" r="4" fill="#0f172a" />
              <path
                d="M 50,75 Q 30,90 20,95 Q 40,90 50,75 Q 60,90 80,95 Q 70,90 50,75 Z"
                fill="#f59e0b"
              />
            </svg>
          </div>
        </div>

        {/* Title & Subtitle */}
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-amber-300 via-teal-200 to-amber-400 bg-clip-text text-transparent drop-shadow-md">
          KOI MAZE ESCAPE
        </h1>
        <p className="mt-2 text-sm md:text-base font-medium text-teal-200/90 tracking-wide uppercase">
          Find Your Way Out!
        </p>

        {/* Control Mode Badge */}
        <div className="mt-4 inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-slate-900/80 border border-teal-500/30 text-xs text-teal-300">
          <Smartphone className="w-3.5 h-3.5 text-amber-400" />
          <span>Tilt & Touch Motion Controls</span>
        </div>
      </div>

      {/* Main Buttons Menu */}
      <div className="relative z-10 w-full max-w-md space-y-3 pb-4">
        {/* PWA 1-Click Mobile Install Button */}
        <PWAInstallButton />

        {/* Daily Challenge Highlight Button */}
        <button
          onClick={onDailyChallenge}
          className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-teal-600 via-emerald-600 to-teal-700 text-slate-100 font-bold text-sm shadow-lg shadow-teal-500/20 hover:brightness-110 active:scale-98 transition-all flex items-center justify-between border border-teal-400/40"
        >
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 rounded-xl bg-amber-500 text-slate-950">
              <Calendar className="w-5 h-5" />
            </div>
            <div className="text-left">
              <span className="block font-black text-amber-300 text-sm tracking-wide uppercase">
                DAILY CHALLENGE
              </span>
              <span className="block text-[11px] text-teal-100/80 font-medium">
                Procedural Maze & Leaderboard
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-1 px-2.5 py-1 rounded-full bg-slate-950/50 border border-amber-400/30 text-amber-300 text-xs font-bold">
            <Flame className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>TODAY</span>
          </div>
        </button>

        {/* Main Campaign Play Button */}
        <button
          onClick={onPlay}
          className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 text-slate-950 font-black text-lg shadow-lg shadow-amber-500/20 hover:brightness-110 active:scale-98 transition-all flex items-center justify-center space-x-3 border border-amber-300/40"
        >
          <Play className="w-6 h-6 fill-current" />
          <span>PLAY LEVEL {currentLevelId}</span>
        </button>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={onLevelSelect}
            className="py-3 px-4 rounded-xl bg-slate-900/90 backdrop-blur-md border border-teal-500/30 text-teal-200 font-semibold hover:bg-slate-800 transition-all active:scale-98 flex items-center justify-center space-x-2 text-sm"
          >
            <Grid className="w-4 h-4 text-teal-400" />
            <span>LEVELS</span>
          </button>

          <button
            onClick={onHowToPlay}
            className="py-3 px-4 rounded-xl bg-slate-900/90 backdrop-blur-md border border-teal-500/30 text-teal-200 font-semibold hover:bg-slate-800 transition-all active:scale-98 flex items-center justify-center space-x-2 text-sm"
          >
            <HelpCircle className="w-4 h-4 text-teal-400" />
            <span>HOW TO PLAY</span>
          </button>
        </div>
      </div>
    </div>
  );
};
