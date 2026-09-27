import React from 'react';
import { motion } from 'motion/react';
import { Home, Compass, History, Bell, Settings } from 'lucide-react';
import { TabId } from '../../types';

interface BottomNavProps {
  activeTab: TabId;
  onSelectTab: (tab: TabId) => void;
  unresolvedAlertsCount?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onSelectTab,
  unresolvedAlertsCount = 2,
}) => {
  const tabs: { id: TabId; label: string; icon: React.ReactNode }[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <Home className="w-5 h-5" />,
    },
    {
      id: 'environment',
      label: 'Environment',
      icon: <Compass className="w-5 h-5" />,
    },
    {
      id: 'history',
      label: 'History',
      icon: <History className="w-5 h-5" />,
    },
    {
      id: 'alerts',
      label: 'Alerts',
      icon: (
        <div className="relative">
          <Bell className="w-5 h-5" />
          {unresolvedAlertsCount > 0 && (
            <span className="absolute -top-1 -right-1.5 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-[#0a1020]" />
          )}
        </div>
      ),
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: <Settings className="w-5 h-5" />,
    },
  ];

  return (
    <nav className="w-full bg-white/95 dark:bg-[#080d1a]/95 backdrop-blur-md border-t border-slate-200 dark:border-[#162238] px-3 py-2 flex items-center justify-around sticky bottom-0 z-30 select-none transition-colors">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            id={`nav-tab-${tab.id}`}
            onClick={() => onSelectTab(tab.id)}
            className={`relative flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all duration-200 cursor-pointer ${
              isActive
                ? 'text-cyan-600 dark:text-cyan-400 font-bold'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            {isActive && (
              <motion.div
                layoutId="activeBottomNavPill"
                className="absolute inset-0 bg-cyan-500/10 dark:bg-cyan-400/15 rounded-xl -z-10"
                transition={{ type: 'spring', stiffness: 450, damping: 32 }}
              />
            )}
            <div className={`transition-transform duration-200 ${isActive ? 'scale-110' : ''}`}>
              {tab.icon}
            </div>
            <span
              className={`text-[11px] mt-1 tracking-tight whitespace-nowrap ${
                isActive ? 'text-cyan-600 dark:text-cyan-400 font-bold' : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};

