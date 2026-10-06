import React from 'react';
import { X, Smartphone, Volume2, Compass, Vibrate } from 'lucide-react';
import { GameSettings } from '../game/types';

interface SettingsModalProps {
  settings: GameSettings;
  onUpdateSettings: (newSettings: Partial<GameSettings>) => void;
  onRecenter: () => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  onUpdateSettings,
  onRecenter,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <div className="w-full max-w-sm rounded-3xl bg-slate-900 border border-teal-500/40 p-5 text-slate-100 shadow-2xl max-h-[90vh] overflow-y-auto space-y-4 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <h2 className="text-xl font-black text-amber-300 uppercase tracking-wide">
            SETTINGS
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-slate-800 text-slate-400 hover:text-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Control Mode Selection */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-teal-300 flex items-center space-x-1.5 uppercase">
            <Smartphone className="w-4 h-4 text-amber-400" />
            <span>Control Mode</span>
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(['motion', 'touch', 'both'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => onUpdateSettings({ controlMode: mode })}
                className={`py-2 px-2 rounded-xl text-xs font-semibold uppercase border transition-all ${
                  settings.controlMode === mode
                    ? 'bg-amber-500 text-slate-950 border-amber-300 shadow-md font-bold'
                    : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>

        {/* Motion Sensitivity */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-teal-300 uppercase">
            Motion Sensitivity
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(['LOW', 'MEDIUM', 'HIGH'] as const).map((level) => (
              <button
                key={level}
                onClick={() => onUpdateSettings({ sensitivity: level })}
                className={`py-2 px-2 rounded-xl text-xs font-semibold border transition-all ${
                  settings.sensitivity === level
                    ? 'bg-teal-500 text-slate-950 border-teal-300 font-bold'
                    : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800'
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        {/* Recenter Calibration Button */}
        <button
          onClick={() => {
            onRecenter();
            onClose();
          }}
          className="w-full py-2.5 px-4 rounded-xl bg-slate-800 border border-teal-500/40 text-teal-200 font-semibold text-xs hover:bg-slate-700 flex items-center justify-center space-x-2"
        >
          <Compass className="w-4 h-4 text-amber-400" />
          <span>RECENTER MOTION TILT</span>
        </button>

        {/* Invert Toggles */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <label className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs font-semibold text-slate-200">
            <span>Invert X</span>
            <input
              type="checkbox"
              checked={settings.invertX}
              onChange={(e) => onUpdateSettings({ invertX: e.target.checked })}
              className="w-4 h-4 accent-amber-500 rounded"
            />
          </label>

          <label className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs font-semibold text-slate-200">
            <span>Invert Y</span>
            <input
              type="checkbox"
              checked={settings.invertY}
              onChange={(e) => onUpdateSettings({ invertY: e.target.checked })}
              className="w-4 h-4 accent-amber-500 rounded"
            />
          </label>
        </div>

        {/* SFX & Music Volume Sliders */}
        <div className="space-y-3 pt-2 border-t border-slate-800">
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-bold text-teal-300">
              <span className="flex items-center space-x-1">
                <Volume2 className="w-3.5 h-3.5 text-amber-400" />
                <span>Sound Effects</span>
              </span>
              <span>{Math.round(settings.sfxVolume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={settings.sfxVolume}
              onChange={(e) => onUpdateSettings({ sfxVolume: parseFloat(e.target.value) })}
              className="w-full accent-amber-500 bg-slate-800 h-2 rounded-lg"
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs font-bold text-teal-300">
              <span className="flex items-center space-x-1">
                <Volume2 className="w-3.5 h-3.5 text-amber-400" />
                <span>Background Music</span>
              </span>
              <span>{Math.round(settings.musicVolume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={settings.musicVolume}
              onChange={(e) => onUpdateSettings({ musicVolume: parseFloat(e.target.value) })}
              className="w-full accent-amber-500 bg-slate-800 h-2 rounded-lg"
            />
          </div>
        </div>

        {/* Vibration Toggle */}
        <div className="pt-1">
          <label className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs font-semibold text-slate-200">
            <span className="flex items-center space-x-2">
              <Vibrate className="w-4 h-4 text-amber-400" />
              <span>Haptic Vibration</span>
            </span>
            <input
              type="checkbox"
              checked={settings.vibration}
              onChange={(e) => onUpdateSettings({ vibration: e.target.checked })}
              className="w-4 h-4 accent-amber-500 rounded"
            />
          </label>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 text-slate-950 font-bold text-sm"
        >
          SAVE & CLOSE
        </button>
      </div>
    </div>
  );
};
