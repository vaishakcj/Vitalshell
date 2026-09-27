import React from 'react';
import {
  Timer,
  Play,
  Pause,
  RotateCcw,
  Activity,
  Heart,
  Footprints,
  Flame,
  Wind,
  Bike,
  Zap,
  Dumbbell,
} from 'lucide-react';
import { SportType, SportsSessionState, SensorVitals } from '../../types';
import {
  HR_ZONES,
  SPORT_PROFILES,
  formatSportsDuration,
  getHeartRateZone,
} from '../../utils/sportsEngine';

interface SportsHudProps {
  session: SportsSessionState;
  vitals: SensorVitals;
  onTogglePlayPause: () => void;
  onResetSession: () => void;
  onChangeSport: (sport: SportType) => void;
  onCloseSportsMode: () => void;
}

export const SportsHud: React.FC<SportsHudProps> = ({
  session,
  vitals,
  onTogglePlayPause,
  onResetSession,
  onChangeSport,
  onCloseSportsMode,
}) => {
  const currentZone = getHeartRateZone(vitals.heartRate);
  const activeProfile = SPORT_PROFILES[session.sportType];

  const sportsList: { type: SportType; label: string; icon: React.ReactNode }[] = [
    { type: 'Running', label: 'Run', icon: <Footprints className="w-3 h-3" /> },
    { type: 'Cycling', label: 'Cycle', icon: <Bike className="w-3 h-3" /> },
    { type: 'HIIT', label: 'HIIT', icon: <Zap className="w-3 h-3" /> },
    { type: 'General Fitness', label: 'Fitness', icon: <Dumbbell className="w-3 h-3" /> },
  ];

  return (
    <div
      id="sports-hud-container"
      className="w-full mt-2 p-3 rounded-2xl bg-white dark:bg-[#0c1529] border border-cyan-500/40 dark:border-cyan-500/30 shadow-xs transition-all"
    >
      {/* Top Banner: Sports Mode Active Tag + Timer + Controls */}
      <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-100 dark:border-[#182847]">
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
            <span className="text-xs font-bold tracking-wider text-slate-800 dark:text-slate-200 uppercase">
              Sports Mode
            </span>
          </div>
          <span
            className={`px-1.5 py-0.2 rounded text-[9px] font-extrabold uppercase ${
              session.paused
                ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
            }`}
          >
            {session.paused ? 'Paused' : '1Hz'}
          </span>
        </div>

        {/* Stopwatch Readout & Quick Controls */}
        <div className="flex items-center space-x-1.5">
          <div className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-[#14223d] border border-slate-200 dark:border-[#1d3258]">
            <Timer className="w-3 h-3 text-slate-400" />
            <span className="font-mono text-xs font-extrabold text-slate-900 dark:text-white">
              {formatSportsDuration(session.elapsedSeconds)}
            </span>
          </div>

          <button
            id="sports-pause-toggle-btn"
            onClick={onTogglePlayPause}
            className={`p-1.5 rounded-lg border transition cursor-pointer ${
              session.paused
                ? 'bg-emerald-500 text-white border-emerald-600 hover:bg-emerald-600'
                : 'bg-slate-100 dark:bg-[#14223d] border-slate-200 dark:border-[#1d3258] text-slate-700 dark:text-slate-300 hover:bg-slate-200'
            }`}
            title={session.paused ? 'Resume Workout' : 'Pause Workout'}
            aria-label={session.paused ? 'Resume' : 'Pause'}
          >
            {session.paused ? <Play className="w-3 h-3 fill-current" /> : <Pause className="w-3 h-3 fill-current" />}
          </button>

          <button
            id="sports-reset-btn"
            onClick={onResetSession}
            className="p-1.5 rounded-lg bg-slate-100 dark:bg-[#14223d] border border-slate-200 dark:border-[#1d3258] text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition cursor-pointer"
            title="Reset Session"
            aria-label="Reset Session"
          >
            <RotateCcw className="w-3 h-3" />
          </button>

          <button
            id="sports-exit-btn"
            onClick={onCloseSportsMode}
            className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-[10px] font-bold uppercase transition cursor-pointer"
            title="Exit Sports Mode"
          >
            End
          </button>
        </div>
      </div>

      {/* Sport Selector Tabs */}
      <div className="grid grid-cols-4 gap-1 my-2">
        {sportsList.map(({ type, label, icon }) => {
          const isSelected = session.sportType === type;
          return (
            <button
              key={type}
              id={`sport-select-${type.toLowerCase().replace(' ', '-')}`}
              onClick={() => onChangeSport(type)}
              className={`py-1.5 px-2 rounded-lg text-[11px] font-semibold transition cursor-pointer flex items-center justify-center space-x-1 border ${
                isSelected
                  ? 'bg-cyan-500 text-white border-cyan-600 shadow-2xs font-bold'
                  : 'bg-slate-50 hover:bg-slate-100 dark:bg-[#101b33] dark:hover:bg-[#142445] border-slate-200/80 dark:border-[#192b4f] text-slate-600 dark:text-slate-300'
              }`}
            >
              <span>{icon}</span>
              <span>{label}</span>
            </button>
          );
        })}
      </div>

      {/* Heart Rate Training Zone Meter */}
      <div className="p-2 rounded-xl bg-slate-50 dark:bg-[#080e1c] border border-slate-200/80 dark:border-[#16233d] my-1.5">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <div className="flex items-center space-x-1.5">
            <Heart className="w-3 h-3 text-rose-500" />
            <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300">Zone:</span>
            <span className={`px-1.5 py-0.2 rounded text-[9px] font-extrabold uppercase ${currentZone.badgeClass}`}>
              Z{currentZone.zone} • {currentZone.name}
            </span>
          </div>
          <span className="font-mono font-bold text-xs text-slate-900 dark:text-white">
            {vitals.heartRate} <span className="text-[9px] font-normal text-slate-400">bpm</span>
          </span>
        </div>

        {/* 5-Zone Segmented Bar */}
        <div className="grid grid-cols-5 gap-1 h-1.5 rounded-full overflow-hidden">
          {HR_ZONES.map((z) => {
            const isActive = currentZone.zone === z.zone;
            return (
              <div
                key={z.zone}
                className={`h-full rounded-xs transition-all duration-300 ${
                  isActive ? 'opacity-100 ring-1 ring-white dark:ring-slate-900 scale-y-125' : 'opacity-35'
                }`}
                style={{ backgroundColor: z.color }}
                title={`Zone ${z.zone}: ${z.name}`}
              />
            );
          })}
        </div>
      </div>

      {/* 4 Core Athletic Performance KPIs */}
      <div className="grid grid-cols-4 gap-1.5 mt-2">
        {/* Calories */}
        <div className="p-2 rounded-xl bg-slate-50 dark:bg-[#101b33] border border-slate-200/80 dark:border-[#182847]">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[9px] font-medium">Burn</span>
            <Flame className="w-2.5 h-2.5 text-amber-500" />
          </div>
          <div className="mt-1 text-slate-900 dark:text-white text-xs sm:text-sm font-extrabold font-mono leading-none">
            {Math.round(session.caloriesBurned)} <span className="text-[8px] font-normal text-slate-400 font-sans">kcal</span>
          </div>
        </div>

        {/* Cadence */}
        <div className="p-2 rounded-xl bg-slate-50 dark:bg-[#101b33] border border-slate-200/80 dark:border-[#182847]">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[9px] font-medium">Cadence</span>
            <Footprints className="w-2.5 h-2.5 text-teal-500" />
          </div>
          <div className="mt-1 text-slate-900 dark:text-white text-xs sm:text-sm font-extrabold font-mono leading-none">
            {session.cadence} <span className="text-[8px] font-normal text-slate-400 font-sans">{activeProfile.cadenceUnit}</span>
          </div>
        </div>

        {/* Avg / Peak HR */}
        <div className="p-2 rounded-xl bg-slate-50 dark:bg-[#101b33] border border-slate-200/80 dark:border-[#182847]">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[9px] font-medium">Avg HR</span>
            <Activity className="w-2.5 h-2.5 text-rose-500" />
          </div>
          <div className="mt-1 text-slate-900 dark:text-white text-xs sm:text-sm font-extrabold font-mono leading-none">
            {session.averageHeartRate} <span className="text-[8px] font-normal text-slate-400 font-sans">bpm</span>
          </div>
        </div>

        {/* Respiration */}
        <div className="p-2 rounded-xl bg-slate-50 dark:bg-[#101b33] border border-slate-200/80 dark:border-[#182847]">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[9px] font-medium">Resp</span>
            <Wind className="w-2.5 h-2.5 text-cyan-500" />
          </div>
          <div className="mt-1 text-slate-900 dark:text-white text-xs sm:text-sm font-extrabold font-mono leading-none">
            {vitals.respiration} <span className="text-[8px] font-normal text-slate-400 font-sans">bpm</span>
          </div>
        </div>
      </div>
    </div>
  );
};
