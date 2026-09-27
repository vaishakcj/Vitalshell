import React, { useState } from 'react';
import {
  Heart,
  Timer,
  Play,
  Pause,
  RotateCcw,
  Footprints,
  Activity,
  Flame,
  Wind,
  Flag,
  Bike,
  Dumbbell,
  Zap,
} from 'lucide-react';
import {
  SportsSessionState,
  SensorVitals,
  BiomechanicalData,
  SportType,
  SportsLap,
} from '../../types';
import {
  HR_ZONES,
  SPORT_PROFILES,
  formatSportsDuration,
  getHeartRateZone,
} from '../../utils/sportsEngine';
import { ScreenHeader } from '../common/ScreenHeader';

interface SportsScreenProps {
  sportsSession: SportsSessionState;
  vitals: SensorVitals;
  biomech: BiomechanicalData;
  onBack: () => void;
  onTogglePlayPause: () => void;
  onResetSession: () => void;
  onChangeSportType: (sport: SportType) => void;
  onToggleSportsMode: () => void;
}

export const SportsScreen: React.FC<SportsScreenProps> = ({
  sportsSession,
  vitals,
  onBack,
  onTogglePlayPause,
  onResetSession,
  onChangeSportType,
  onToggleSportsMode,
}) => {
  // Recorded split laps
  const [laps, setLaps] = useState<SportsLap[]>([
    {
      lapNumber: 1,
      splitDuration: 300,
      elapsedSeconds: 300,
      avgHeartRate: 142,
      cadence: 168,
    },
  ]);

  const activeProfile = SPORT_PROFILES[sportsSession.sportType] || SPORT_PROFILES.Running;
  const currentZone = getHeartRateZone(vitals.heartRate);

  const handleRecordLap = () => {
    const previousTotal = laps.reduce((acc, l) => acc + l.splitDuration, 0);
    const splitSecs = Math.max(10, sportsSession.elapsedSeconds - previousTotal);
    const newLap: SportsLap = {
      lapNumber: laps.length + 1,
      splitDuration: splitSecs,
      elapsedSeconds: sportsSession.elapsedSeconds,
      avgHeartRate: vitals.heartRate,
      cadence: sportsSession.cadence,
    };
    setLaps([newLap, ...laps]);
  };

  const sportTypes: { type: SportType; label: string; icon: React.ReactNode }[] = [
    { type: 'Running', label: 'Running', icon: <Footprints className="w-3.5 h-3.5" /> },
    { type: 'Cycling', label: 'Cycling', icon: <Bike className="w-3.5 h-3.5" /> },
    { type: 'HIIT', label: 'HIIT', icon: <Zap className="w-3.5 h-3.5" /> },
    { type: 'General Fitness', label: 'Fitness', icon: <Dumbbell className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="w-full flex-1 flex flex-col bg-slate-50 dark:bg-[#070b14] select-none">
      <ScreenHeader
        title="Sports Mode"
        subtitle={`${activeProfile.label} Session`}
        showBack={true}
        onBack={onBack}
        rightAction={
          <button
            id="sports-header-exit-btn"
            onClick={onToggleSportsMode}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center space-x-1.5 ${
              sportsSession.active
                ? 'bg-rose-500/15 hover:bg-rose-500/25 text-rose-600 dark:text-rose-400 border border-rose-500/30'
                : 'bg-emerald-500 text-white hover:bg-emerald-600'
            }`}
          >
            <span>{sportsSession.active ? 'End Workout' : 'Start Workout'}</span>
          </button>
        }
      />

      <div className="w-full px-4 sm:px-6 py-3 space-y-3.5 max-w-3xl mx-auto">
        {/* SPORT TYPE SELECTOR (Clean Segmented Control) */}
        <div className="p-1 rounded-xl bg-slate-200/70 dark:bg-[#0f1b33] border border-slate-200 dark:border-[#192b4f] grid grid-cols-4 gap-1">
          {sportTypes.map(({ type, label, icon }) => {
            const isSelected = sportsSession.sportType === type;
            return (
              <button
                key={type}
                id={`sports-profile-btn-${type.toLowerCase().replace(' ', '-')}`}
                onClick={() => onChangeSportType(type)}
                className={`py-2 px-2 rounded-lg text-xs font-bold transition cursor-pointer flex items-center justify-center space-x-1.5 ${
                  isSelected
                    ? 'bg-white dark:bg-[#1a2d52] text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <span>{icon}</span>
                <span className="truncate">{label}</span>
              </button>
            );
          })}
        </div>

        {/* PRIMARY TIMER & SESSION CONTROLLER */}
        <div
          id="section-sport-timer"
          className="p-4 rounded-2xl bg-white dark:bg-[#0c1529] border border-slate-200 dark:border-[#182847] shadow-xs"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <Timer className="w-4 h-4 text-cyan-500" />
              <span className="text-[11px] font-bold tracking-wider text-slate-500 dark:text-slate-400 uppercase">
                Elapsed Time
              </span>
            </div>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                sportsSession.paused
                  ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                  : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
              }`}
            >
              {sportsSession.paused ? 'Paused' : 'Active 1Hz'}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Big Stopwatch Readout */}
            <div className="text-4xl sm:text-5xl font-mono font-extrabold tracking-tight text-slate-900 dark:text-white">
              {formatSportsDuration(sportsSession.elapsedSeconds)}
            </div>

            {/* Quick Action Buttons */}
            <div className="flex items-center space-x-2">
              <button
                id="sports-screen-play-pause-btn"
                onClick={onTogglePlayPause}
                className={`flex-1 sm:flex-none flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl font-bold text-xs transition cursor-pointer shadow-xs ${
                  sportsSession.paused
                    ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
                    : 'bg-amber-500 hover:bg-amber-600 text-white'
                }`}
              >
                {sportsSession.paused ? (
                  <>
                    <Play className="w-4 h-4 fill-current" />
                    <span>Resume</span>
                  </>
                ) : (
                  <>
                    <Pause className="w-4 h-4 fill-current" />
                    <span>Pause</span>
                  </>
                )}
              </button>

              <button
                id="sports-screen-lap-btn"
                onClick={handleRecordLap}
                disabled={sportsSession.paused}
                className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#14223d] dark:hover:bg-[#1a2c4e] border border-slate-200 dark:border-[#1f355c] text-slate-700 dark:text-slate-200 text-xs font-bold transition cursor-pointer disabled:opacity-40"
              >
                <Flag className="w-3.5 h-3.5 text-cyan-500" />
                <span>Lap</span>
              </button>

              <button
                id="sports-screen-reset-btn"
                onClick={onResetSession}
                className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#14223d] dark:hover:bg-[#1a2c4e] border border-slate-200 dark:border-[#1f355c] text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition cursor-pointer"
                title="Reset Stopwatch"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* HEART RATE & TRAINING ZONE SECTION */}
        <div
          id="section-cardio-zones"
          className="p-4 rounded-2xl bg-white dark:bg-[#0c1529] border border-slate-200 dark:border-[#182847] shadow-xs"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Heart className="w-4 h-4 text-rose-500" />
              <span className="text-[11px] font-bold tracking-wider text-slate-500 dark:text-slate-400 uppercase">
                Heart Rate & Training Zone
              </span>
            </div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              Target: {activeProfile.targetHrMin}–{activeProfile.targetHrMax} bpm
            </span>
          </div>

          <div className="flex items-baseline justify-between mb-3">
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl sm:text-4xl font-mono font-extrabold text-slate-900 dark:text-white">
                {vitals.heartRate}
              </span>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">bpm</span>
            </div>

            <span
              className={`px-2.5 py-1 rounded-lg text-xs font-extrabold uppercase ${currentZone.badgeClass}`}
            >
              Zone {currentZone.zone} • {currentZone.name}
            </span>
          </div>

          {/* 5-Zone Segmented Bar */}
          <div className="grid grid-cols-5 gap-1.5 h-3 rounded-full overflow-hidden">
            {HR_ZONES.map((z) => {
              const isActive = currentZone.zone === z.zone;
              return (
                <div
                  key={z.zone}
                  className={`h-full rounded-sm transition-all duration-300 relative ${
                    isActive ? 'ring-2 ring-slate-900 dark:ring-white scale-y-110' : 'opacity-35'
                  }`}
                  style={{ backgroundColor: z.color }}
                />
              );
            })}
          </div>

          {/* Zone Labels */}
          <div className="grid grid-cols-5 text-center text-[10px] text-slate-500 dark:text-slate-400 mt-2 font-mono">
            <span>Z1 (90-114)</span>
            <span>Z2 (115-133)</span>
            <span>Z3 (134-152)</span>
            <span>Z4 (153-171)</span>
            <span>Z5 (172+)</span>
          </div>
        </div>

        {/* 4 CORE ATHLETIC METRICS (Essential Telemetry Only) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {/* Cadence */}
          <div
            id="sport-kpi-cadence"
            className="p-3.5 rounded-2xl bg-white dark:bg-[#0c1529] border border-slate-200 dark:border-[#182847] shadow-xs"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Cadence</span>
              <Footprints className="w-3.5 h-3.5 text-teal-500" />
            </div>
            <div className="mt-2 text-2xl font-extrabold font-mono text-slate-900 dark:text-white">
              {sportsSession.cadence}{' '}
              <span className="text-xs font-normal text-slate-500">{activeProfile.cadenceUnit}</span>
            </div>
          </div>

          {/* Active Calories */}
          <div
            id="sport-kpi-calories"
            className="p-3.5 rounded-2xl bg-white dark:bg-[#0c1529] border border-slate-200 dark:border-[#182847] shadow-xs"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Energy Burn</span>
              <Flame className="w-3.5 h-3.5 text-amber-500" />
            </div>
            <div className="mt-2 text-2xl font-extrabold font-mono text-slate-900 dark:text-white">
              {Math.round(sportsSession.caloriesBurned)}{' '}
              <span className="text-xs font-normal text-slate-500">kcal</span>
            </div>
          </div>

          {/* Avg & Peak HR */}
          <div
            id="sport-kpi-hr-summary"
            className="p-3.5 rounded-2xl bg-white dark:bg-[#0c1529] border border-slate-200 dark:border-[#182847] shadow-xs"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Avg / Peak HR</span>
              <Activity className="w-3.5 h-3.5 text-rose-500" />
            </div>
            <div className="mt-2 text-2xl font-extrabold font-mono text-slate-900 dark:text-white">
              {sportsSession.averageHeartRate}{' '}
              <span className="text-xs font-normal text-slate-400">/ {sportsSession.peakHeartRate}</span>
            </div>
          </div>

          {/* Respiration */}
          <div
            id="sport-kpi-respiration"
            className="p-3.5 rounded-2xl bg-white dark:bg-[#0c1529] border border-slate-200 dark:border-[#182847] shadow-xs"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Respiration</span>
              <Wind className="w-3.5 h-3.5 text-cyan-500" />
            </div>
            <div className="mt-2 text-2xl font-extrabold font-mono text-slate-900 dark:text-white">
              {vitals.respiration}{' '}
              <span className="text-xs font-normal text-slate-500">bpm</span>
            </div>
          </div>
        </div>

        {/* LAPS & INTERVAL SPLITS (Clean table) */}
        {laps.length > 0 && (
          <div
            id="section-laps-splits"
            className="p-4 rounded-2xl bg-white dark:bg-[#0c1529] border border-slate-200 dark:border-[#182847] shadow-xs"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Flag className="w-4 h-4 text-cyan-500" />
                <span className="text-[11px] font-bold tracking-wider text-slate-500 dark:text-slate-400 uppercase">
                  Laps & Interval Splits
                </span>
              </div>
              <span className="text-xs font-mono font-medium text-slate-500 dark:text-slate-400">
                {laps.length} {laps.length === 1 ? 'Lap' : 'Laps'} recorded
              </span>
            </div>

            <div className="space-y-1.5">
              {laps.map((lap) => (
                <div
                  key={lap.lapNumber}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-[#080e1c] border border-slate-200/80 dark:border-[#16233d] text-xs"
                >
                  <div className="flex items-center space-x-3">
                    <span className="w-6 h-6 rounded-full bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 font-bold flex items-center justify-center text-[10px]">
                      L{lap.lapNumber}
                    </span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">
                      {formatSportsDuration(lap.splitDuration)}
                    </span>
                  </div>

                  <div className="flex items-center space-x-4 text-slate-600 dark:text-slate-400 font-mono text-xs">
                    <span>
                      <strong className="text-slate-900 dark:text-white font-bold">{lap.avgHeartRate}</strong> bpm
                    </span>
                    <span>
                      <strong className="text-slate-900 dark:text-white font-bold">{lap.cadence}</strong> {activeProfile.cadenceUnit}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* RETURN ACTION */}
        <div className="pt-1 pb-4">
          <button
            id="sports-return-dashboard-btn"
            onClick={onBack}
            className="w-full py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-[#0c1529] dark:hover:bg-[#14223d] border border-slate-300 dark:border-[#182847] text-slate-700 dark:text-slate-200 text-xs font-bold transition cursor-pointer text-center"
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};
