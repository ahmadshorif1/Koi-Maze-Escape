import React from 'react';
import { Smartphone, CheckCircle, Compass } from 'lucide-react';

interface CalibrationModalProps {
  onCalibrate: () => void;
  onSkipToTouch: () => void;
}

export const CalibrationModal: React.FC<CalibrationModalProps> = ({
  onCalibrate,
  onSkipToTouch,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <div className="w-full max-w-sm rounded-3xl bg-slate-900 border border-teal-500/40 p-6 text-center text-slate-100 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
        {/* Animated Smartphone Tilt Graphic */}
        <div className="relative w-24 h-24 mx-auto flex items-center justify-center rounded-2xl bg-teal-950/60 border border-teal-500/30">
          <Smartphone className="w-12 h-12 text-amber-400 animate-bounce" />
          <div className="absolute inset-0 rounded-2xl border-2 border-amber-400/30 animate-ping" />
        </div>

        <div>
          <h2 className="text-2xl font-black text-amber-300 tracking-tight">
            CALIBRATE DEVICE
          </h2>
          <p className="mt-2 text-xs md:text-sm text-slate-300 leading-relaxed">
            Hold your phone in a comfortable, relaxed angle. Tap{' '}
            <span className="font-bold text-teal-300">CALIBRATE</span> to set your neutral position for tilt control.
          </p>
        </div>

        <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800 text-left space-y-2 text-xs text-slate-300">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Tilt Forward / Back → Swim Up / Down</span>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Tilt Left / Right → Swim Left / Right</span>
          </div>
        </div>

        <div className="space-y-2.5 pt-2">
          <button
            onClick={onCalibrate}
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 text-slate-950 font-extrabold text-sm shadow-lg shadow-amber-500/20 hover:brightness-110 active:scale-98 transition-all flex items-center justify-center space-x-2"
          >
            <Compass className="w-5 h-5" />
            <span>CALIBRATE & START</span>
          </button>

          <button
            onClick={onSkipToTouch}
            className="w-full py-2.5 text-xs text-slate-400 hover:text-slate-200 transition-colors"
          >
            Use Touch Controls Instead
          </button>
        </div>
      </div>
    </div>
  );
};
