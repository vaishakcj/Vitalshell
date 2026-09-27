import React from 'react';
import { ChevronLeft } from 'lucide-react';

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  rightAction?: React.ReactNode;
}

export const ScreenHeader: React.FC<ScreenHeaderProps> = ({
  title,
  subtitle,
  showBack = true,
  onBack,
  rightAction,
}) => {
  return (
    <header className="w-full px-4 sm:px-6 py-3.5 flex items-center justify-between z-20 border-b border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-[#070b14]/80 backdrop-blur-md sticky top-0 transition-colors">
      <div className="flex items-center space-x-2">
        {showBack && (
          <button
            id="header-back-button"
            onClick={onBack}
            className="p-2 -ml-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            aria-label="Back"
          >
            <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
          </button>
        )}
        <div>
          <h1 className="text-slate-900 dark:text-white text-base sm:text-lg font-bold tracking-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-[11px] text-slate-500 dark:text-slate-400 -mt-0.5">
              {subtitle}
            </p>
          )}
        </div>
      </div>
      {rightAction && <div className="flex items-center space-x-2">{rightAction}</div>}
    </header>
  );
};

