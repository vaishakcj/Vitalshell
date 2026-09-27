import React from 'react';
import { Wifi } from 'lucide-react';

interface StatusBarProps {
  battery?: number;
  time?: string;
  isDark?: boolean;
}

export const StatusBar: React.FC<StatusBarProps> = ({
  battery = 82,
  time = '9:41',
}) => {
  return (
    <div className="w-full px-6 pt-3 pb-2 flex items-center justify-between text-white text-xs font-semibold select-none z-30">
      <span className="tracking-tight text-sm font-medium text-slate-100">{time}</span>
      <div className="flex items-center space-x-2 text-slate-200">
        {/* Cellular 4 bars */}
        <div className="flex items-end space-x-0.5 h-3">
          <span className="w-0.5 h-1 bg-white rounded-xs"></span>
          <span className="w-0.5 h-1.5 bg-white rounded-xs"></span>
          <span className="w-0.5 h-2 bg-white rounded-xs"></span>
          <span className="w-0.5 h-2.5 bg-white rounded-xs"></span>
        </div>
        {/* Wi-Fi Icon */}
        <Wifi className="w-3.5 h-3.5 text-white stroke-[2.5]" />
        {/* Battery with percentage/fill */}
        <div className="flex items-center space-x-1">
          <div className="w-5 h-2.5 rounded-[3px] border border-white/80 p-0.5 flex items-center relative">
            <div
              className="h-full bg-emerald-400 rounded-[1.5px]"
              style={{ width: `${Math.min(100, Math.max(10, battery))}%` }}
            />
            <div className="absolute -right-1 w-0.5 h-1 bg-white/80 rounded-r-xs" />
          </div>
        </div>
      </div>
    </div>
  );
};
