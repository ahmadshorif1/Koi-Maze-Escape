import React from 'react';
import { X, Smartphone, Target, Compass, Sparkles } from 'lucide-react';

interface HowToPlayModalProps {
  onClose: () => void;
}

export const HowToPlayModal: React.FC<HowToPlayModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <div className="w-full max-w-sm rounded-3xl bg-slate-900 border border-teal-500/40 p-5 text-slate-100 shadow-2xl max-h-[90vh] overflow-y-auto space-y-4 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <h2 className="text-xl font-black text-amber-300 uppercase tracking-wide">
            HOW TO PLAY
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-slate-800 text-slate-400 hover:text-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Steps */}
        <div className="space-y-3.5 text-xs text-slate-300">
          <div className="flex items-start space-x-3 p-3 rounded-2xl bg-slate-950/60 border border-slate-800">
            <div className="p-2 rounded-xl bg-teal-950 text-amber-400 shrink-0">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-teal-300 block text-sm">1. Tilt Phone to Move</span>
              Tilt your smartphone forward, backward, left, or right to physically guide the koi fish through the water maze.
            </div>
          </div>

          <div className="flex items-start space-x-3 p-3 rounded-2xl bg-slate-950/60 border border-slate-800">
            <div className="p-2 rounded-xl bg-teal-950 text-amber-400 shrink-0">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-amber-300 block text-sm">2. Find Target Exit</span>
              Each level specifies a Target Exit number (1 to 6) around the outer ring perimeter. Reaching a wrong exit won't unlock the level!
            </div>
          </div>

          <div className="flex items-start space-x-3 p-3 rounded-2xl bg-slate-950/60 border border-slate-800">
            <div className="p-2 rounded-xl bg-teal-950 text-amber-400 shrink-0">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-teal-300 block text-sm">3. Recenter Anytime</span>
              Tap <span className="font-bold text-amber-300">RECENTER</span> at any moment during gameplay to adjust your comfortable holding angle!
            </div>
          </div>

          <div className="flex items-start space-x-3 p-3 rounded-2xl bg-slate-950/60 border border-slate-800">
            <div className="p-2 rounded-xl bg-teal-950 text-amber-400 shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-emerald-300 block text-sm">4. Unlock 20 Worlds</span>
              Complete levels to travel to new aquatic environments, ranging from tropical ponds to crystal caverns and celestial sanctuaries!
            </div>
          </div>
        </div>

        {/* Got It Button */}
        <button
          onClick={onClose}
          className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 text-slate-950 font-black text-sm shadow-lg shadow-amber-500/20"
        >
          GOT IT, LET'S PLAY!
        </button>
      </div>
    </div>
  );
};
