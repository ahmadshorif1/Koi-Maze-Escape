import React, { useState } from 'react';
import { Download, Share2, Smartphone, X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSModal, setShowIOSModal] = useState(false);

  // If already installed, hide the button
  if (isInstalled) {
    return null;
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        onClick={install}
        className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-600 to-emerald-600 text-slate-950 font-black text-xs md:text-sm shadow-lg shadow-emerald-500/20 hover:brightness-110 active:scale-98 transition-all flex items-center justify-center space-x-2 border border-emerald-300/40"
      >
        <Download className="w-4 h-4 text-slate-950 stroke-[3]" />
        <span>ইন্সটল করুন (INSTALL APP)</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSModal(true)}
          className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-600 to-emerald-600 text-slate-950 font-black text-xs md:text-sm shadow-lg shadow-emerald-500/20 hover:brightness-110 active:scale-98 transition-all flex items-center justify-center space-x-2 border border-emerald-300/40"
        >
          <Smartphone className="w-4 h-4 text-slate-950 stroke-[3]" />
          <span>মোবাইলে ইন্সটল করুন</span>
        </button>

        {showIOSModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
            <div className="w-full max-w-sm rounded-3xl bg-slate-900 border border-emerald-500/50 p-6 text-slate-100 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <h3 className="text-base font-black text-emerald-300 flex items-center space-x-2">
                  <Smartphone className="w-5 h-5 text-emerald-400" />
                  <span>iPhone / iPad এ ইন্সটল নিয়ম</span>
                </h3>
                <button
                  onClick={() => setShowIOSModal(false)}
                  className="p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-slate-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
                <div className="flex items-start space-x-3 p-3 rounded-2xl bg-slate-950/60 border border-slate-800">
                  <div className="p-2 rounded-xl bg-teal-950 text-emerald-400 shrink-0">
                    <Share2 className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-100 block">১. শেয়ার বাটন চাপুন</span>
                    Safari ব্রাউজারের নিচে থাকা <strong>Share (শেয়ার)</strong> বাটনে ট্যাপ করুন।
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-3 rounded-2xl bg-slate-950/60 border border-slate-800">
                  <div className="p-2 rounded-xl bg-teal-950 text-emerald-400 shrink-0">
                    <Download className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-100 block">২. Add to Home Screen</span>
                    একটু নিচে স্ক্রল করে <strong>"Add to Home Screen"</strong> অপশনে চাপুন।
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowIOSModal(false)}
                className="w-full py-3 rounded-2xl bg-slate-800 text-slate-200 font-bold text-xs"
              >
                বন্ধ করুন (Close)
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  // Generic direct install button fallback (for desktop/browser preview trigger)
  return (
    <button
      onClick={() => {
        alert('মোবাইলে ইন্সটল করতে আপনার ব্রাউজার মেনু (3-dots) থেকে "Add to Home Screen" অথবা "Install App" অপশনে ক্লিক করুন।');
      }}
      className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-600 to-emerald-600 text-slate-950 font-black text-xs md:text-sm shadow-lg shadow-emerald-500/20 hover:brightness-110 active:scale-98 transition-all flex items-center justify-center space-x-2 border border-emerald-300/40"
    >
      <Download className="w-4 h-4 text-slate-950 stroke-[3]" />
      <span>ইন্সটল করুন (INSTALL APP)</span>
    </button>
  );
};
