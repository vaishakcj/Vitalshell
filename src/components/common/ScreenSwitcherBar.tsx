import React from 'react';
import { ScreenId } from '../../types';

interface ScreenSwitcherBarProps {
  currentScreen: ScreenId;
  onSelectScreen: (s: ScreenId) => void;
}

export const ScreenSwitcherBar: React.FC<ScreenSwitcherBarProps> = ({
  currentScreen,
  onSelectScreen,
}) => {
  const screens: { id: ScreenId; label: string; num: number }[] = [
    { id: 'intro', label: 'Intro', num: 1 },
    { id: 'dashboard', label: 'Dashboard', num: 2 },
    { id: 'physiological', label: 'Physiological', num: 3 },
    { id: 'biomechanical', label: 'Biomechanical', num: 4 },
    { id: 'environment', label: 'Environment', num: 5 },
    { id: 'risk-fusion', label: 'Risk-Fusion', num: 6 },
    { id: 'alerts', label: 'Alerts', num: 7 },
    { id: 'history', label: 'History', num: 8 },
    { id: 'connectivity', label: 'Connectivity', num: 9 },
    { id: 'diagnostics', label: 'Diagnostics', num: 10 },
    { id: 'emergency', label: 'Emergency', num: 11 },
    { id: 'settings', label: 'Settings', num: 12 },
  ];

  return (
    <div className="w-full bg-[#050811] border-b border-[#121f36] px-3 py-2 flex items-center space-x-1.5 overflow-x-auto no-scrollbar z-40 select-none">
      <span className="text-[10px] text-cyan-400 font-semibold uppercase tracking-wider shrink-0 mr-1.5 flex items-center">
        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mr-1.5 animate-pulse" />
        12 Screens:
      </span>
      {screens.map((item) => {
        const isActive = currentScreen === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onSelectScreen(item.id)}
            className={`px-2.5 py-1 rounded-full text-[11px] font-medium shrink-0 transition-all cursor-pointer ${
              isActive
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                : 'bg-[#0d1629] text-slate-300 hover:text-white hover:bg-[#14223d] border border-[#182744]'
            }`}
          >
            {item.num}. {item.label}
          </button>
        );
      })}
    </div>
  );
};
