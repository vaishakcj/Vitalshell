import React, { useEffect, useState } from 'react';
import { Wifi } from 'lucide-react';
import jacketImage from '../../assets/images/concept model VS-1.png';

interface IntroScreenProps {
  onComplete: () => void;
}

export const IntroScreen: React.FC<IntroScreenProps> = ({ onComplete }) => {
  const [dots, setDots] = useState('');

  useEffect(() => {
    const dotInterval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? '' : prev + '.'));
    }, 450);

    const autoNav = setTimeout(() => {
      onComplete();
    }, 2800);

    return () => {
      clearInterval(dotInterval);
      clearTimeout(autoNav);
    };
  }, [onComplete]);

  return (
    <div className="relative w-full h-full flex flex-col justify-between items-center px-6 py-8 bg-slate-50 dark:bg-[#070b14] overflow-hidden select-none transition-colors">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-80 h-80 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

      {/* Header Brand */}
      <div className="flex flex-col items-center text-center mt-6 z-10">
        <h1 className="text-slate-900 dark:text-white text-2xl tracking-[0.25em] font-semibold">
          VITALSHELL
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-xs mt-2 font-normal tracking-wide">
          Your whole body, sensed and protected.
        </p>
      </div>

      {/* Centered Smart Jacket Visual - Freestanding with NO box, border, or card outline */}
      <div className="relative my-auto flex items-center justify-center w-full max-w-[300px] sm:max-w-[330px] z-10 py-1">
        {/* Soft cyan radial silhouette backlight */}
        <div className="absolute inset-0 bg-radial from-cyan-500/15 dark:from-cyan-400/25 to-transparent rounded-full filter blur-xl scale-95 pointer-events-none" />

        <img
          src={jacketImage}
          alt="VitalShell Concept Model Smart Jacket"
          loading="eager"
          decoding="sync"
          referrerPolicy="no-referrer"
          className="relative z-10 w-full h-auto object-contain max-h-[380px] drop-shadow-lg transition-transform duration-500 hover:scale-[1.02]"
        />
      </div>

      {/* Bottom Connection Status Pill */}
      <div className="w-full flex flex-col items-center mb-6 z-10">
        <button
          id="intro-connecting-btn"
          onClick={onComplete}
          className="flex items-center space-x-2.5 px-6 py-3 rounded-full bg-white dark:bg-[#0e172a]/90 border border-cyan-500/30 text-slate-800 dark:text-slate-200 text-xs font-medium shadow-md hover:border-cyan-400 hover:text-cyan-600 dark:hover:text-white transition-all cursor-pointer"
        >
          <Wifi className="w-4 h-4 text-cyan-600 dark:text-cyan-400 animate-pulse stroke-[2.2]" />
          <span className="tracking-wide">
            Connecting to Jacket{dots}
          </span>
        </button>

        <button
          onClick={onComplete}
          className="mt-3 text-[11px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition cursor-pointer"
        >
          Tap to skip
        </button>
      </div>
    </div>
  );
};
