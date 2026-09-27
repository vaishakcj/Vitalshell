import React from 'react';
import {
  Heart,
  Droplets,
  Wind,
  Thermometer,
  ShieldCheck,
  Wifi,
  ChevronRight,
  Sun,
  Moon,
  Activity,
  UserCheck,
  Wrench,
  Compass,
  BatteryLow,
  BatteryFull,
  BatteryWarning,
  Flame,
  Zap,
  Footprints,
  User,
} from 'lucide-react';
import {
  SensorVitals,
  RiskFusionState,
  ConnectivityState,
  ScreenId,
  SportType,
  SportsSessionState,
} from '../../types';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { formatSportsDuration, getHeartRateZone } from '../../utils/sportsEngine';
import { WhoopSafetyDial } from '../dashboard/WhoopSafetyDial';

interface DashboardScreenProps {
  vitals: SensorVitals;
  riskFusion: RiskFusionState;
  connectivity: ConnectivityState;
  onNavigate: (screen: ScreenId) => void;
  sportsSession?: SportsSessionState;
  onToggleSportsMode?: () => void;
  onTogglePlayPauseSports?: () => void;
  onResetSportsSession?: () => void;
  onChangeSportType?: (sport: SportType) => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  vitals,
  riskFusion,
  connectivity,
  onNavigate,
  sportsSession,
  onToggleSportsMode,
  onTogglePlayPauseSports,
  onResetSportsSession,
  onChangeSportType,
}) => {
  const { effectiveTheme, setTheme } = useTheme();
  const { user } = useAuth();

  const toggleTheme = () => {
    setTheme(effectiveTheme === 'dark' ? 'light' : 'dark');
  };

  // Battery status & low battery threshold (<20%)
  const batteryLevel = connectivity.battery ?? 82;
  const isLowBattery = batteryLevel < 20;

  const getBatteryIcon = (pct: number) => {
    if (pct < 20) return <BatteryWarning className="w-3.5 h-3.5 text-rose-500 animate-pulse" />;
    if (pct < 50) return <BatteryLow className="w-3.5 h-3.5 text-amber-500" />;
    return <BatteryFull className="w-3.5 h-3.5 text-emerald-500" />;
  };

  return (
    <div className="w-full h-full flex-1 flex flex-col justify-between px-3.5 sm:px-5 py-2.5 sm:py-3 select-none transition-colors overflow-hidden">
      {/* Top Header & Status Bar */}
      <div className="shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-2.5 h-2.5 rounded-full bg-cyan-500 shadow-[0_0_8px_#06b6d4]" />
            <h1 className="text-slate-900 dark:text-white text-base sm:text-lg tracking-[0.2em] font-bold">
              VITALSHELL
            </h1>
          </div>

          <div className="flex items-center space-x-2">
            {/* Quick Sports Mode Toggle Button */}
            <button
              id="dashboard-sports-toggle-btn"
              onClick={() => {
                if (!sportsSession?.active && onToggleSportsMode) {
                  onToggleSportsMode();
                }
                onNavigate('sports');
              }}
              title={sportsSession?.active ? 'Sports Session Active - Click to Open' : 'Open Sports Mode & Start Session'}
              className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-xl border text-xs font-bold transition cursor-pointer ${
                sportsSession?.active
                  ? 'bg-gradient-to-r from-amber-500/20 to-rose-500/20 border-amber-500/60 text-amber-600 dark:text-amber-400 ring-2 ring-amber-500/30 shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 dark:bg-[#0c1529] dark:hover:bg-[#12203d] border-slate-200 dark:border-[#182847] text-slate-700 dark:text-slate-300'
              }`}
            >
              {sportsSession?.active ? (
                <>
                  <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500 animate-pulse" />
                  <span className="tracking-wide text-[11px]">SPORTS ACTIVE</span>
                </>
              ) : (
                <>
                  <Zap className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                  <span className="tracking-wide text-[11px]">SPORTS MODE</span>
                </>
              )}
            </button>

            {/* Quick Theme Toggle Button */}
            <button
              id="dashboard-theme-toggle"
              onClick={toggleTheme}
              title={`Switch to ${effectiveTheme === 'dark' ? 'Light' : 'Dark'} mode`}
              className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#0c1529] dark:hover:bg-[#12203d] border border-slate-200 dark:border-[#182847] text-slate-700 dark:text-slate-300 transition cursor-pointer"
              aria-label="Toggle theme"
            >
              {effectiveTheme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-700" />
              )}
            </button>

            {/* User Profile / Auth Quick Access */}
            <button
              id="dashboard-user-btn"
              onClick={() => onNavigate('settings')}
              title={`Operator: ${user?.name || 'Operator'} (${user?.email || 'Logged In'})`}
              className="w-7 h-7 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-700 p-0.5 shadow-xs hover:scale-105 transition cursor-pointer shrink-0"
            >
              <div className="w-full h-full rounded-[10px] bg-white dark:bg-[#0d162a] flex items-center justify-center text-cyan-600 dark:text-cyan-300 font-bold overflow-hidden text-[10px]">
                {user?.avatarUrl ? (
                  <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <span>{user?.name ? user.name.slice(0, 2).toUpperCase() : 'OP'}</span>
                )}
              </div>
            </button>
          </div>
        </div>

        {/* Jacket Status Bar subline */}
        <div
          className={`flex items-center justify-between mt-2 px-3 py-1.5 rounded-xl border text-xs transition-colors ${
            isLowBattery
              ? 'bg-rose-500/10 dark:bg-rose-950/20 border-rose-500/40'
              : 'bg-slate-100/90 dark:bg-[#0c1529]/90 border-slate-200/80 dark:border-[#182847]'
          }`}
        >
          <button
            onClick={() => onNavigate('connectivity')}
            className="flex items-center space-x-1.5 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
          >
            <span
              className={`w-2 h-2 rounded-full ${
                connectivity.connected ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 'bg-rose-500'
              }`}
            />
            <span className="text-[10px] sm:text-[11px] font-semibold tracking-wider text-slate-800 dark:text-slate-200">
              {connectivity.connected ? 'JACKET CONNECTED' : 'DISCONNECTED'}
            </span>
            <Wifi className="w-3 h-3 text-cyan-600 dark:text-cyan-400 opacity-75" />
          </button>

          {/* Single Status Bar Battery Indicator with Low-Battery Warning state */}
          <button
            id="status-bar-battery-btn"
            onClick={() => onNavigate('connectivity')}
            className={`flex items-center space-x-1.5 px-2 py-0.5 rounded-lg transition cursor-pointer ${
              isLowBattery
                ? 'bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/50 shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
            title={
              isLowBattery
                ? `Low Battery Warning: ${batteryLevel}% (<20%)`
                : `Battery: ${batteryLevel}%`
            }
          >
            {getBatteryIcon(batteryLevel)}
            <span
              className={`text-[11px] font-bold font-mono ${
                isLowBattery
                  ? 'text-rose-600 dark:text-rose-400'
                  : 'text-emerald-600 dark:text-emerald-400'
              }`}
            >
              {batteryLevel}%
            </span>
            <span
              className={`text-[9px] font-bold tracking-wider ${
                isLowBattery
                  ? 'text-rose-600 dark:text-rose-400'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              {isLowBattery ? 'LOW BATTERY' : 'BATTERY'}
            </span>
          </button>
        </div>

        {/* Low Battery Warning Banner (< 20%) */}
        {isLowBattery && (
          <button
            id="dashboard-low-battery-banner"
            onClick={() => onNavigate('connectivity')}
            className="w-full mt-2 px-3 py-1.5 rounded-xl bg-rose-500/15 dark:bg-rose-950/40 border border-rose-500/40 text-rose-700 dark:text-rose-300 flex items-center justify-between text-xs cursor-pointer hover:bg-rose-500/20 transition text-left shadow-xs"
          >
            <div className="flex items-center space-x-2">
              <BatteryWarning className="w-3.5 h-3.5 text-rose-500 shrink-0 animate-bounce" />
              <div className="text-[11px]">
                <span className="font-bold text-rose-600 dark:text-rose-400">
                  Low Battery ({batteryLevel}%):{' '}
                </span>
                <span className="opacity-90">
                  Jacket power below 20%. Connect USB-C charger.
                </span>
              </div>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-rose-500 shrink-0 ml-2 opacity-80" />
          </button>
        )}

        {/* Sports Mode Active Slim Status Banner (Keeps Dashboard clean and non-scrolling) */}
        {sportsSession?.active && (
          <button
            id="dashboard-sports-active-pill"
            onClick={() => onNavigate('sports')}
            className="w-full mt-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-cyan-500/10 border border-amber-500/40 text-slate-800 dark:text-slate-100 flex items-center justify-between text-xs hover:border-amber-500/70 transition cursor-pointer shadow-2xs group"
          >
            <div className="flex items-center space-x-2 truncate">
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
              </span>
              <span className="font-bold text-amber-600 dark:text-amber-400 uppercase text-[10px] sm:text-[11px] tracking-wider shrink-0">
                {sportsSession.sportType} Active
              </span>
              <span className="text-slate-400 dark:text-slate-500">•</span>
              <span className="font-mono font-bold text-[10px] sm:text-[11px] text-slate-700 dark:text-slate-300 shrink-0">
                {formatSportsDuration(sportsSession.elapsedSeconds)}
              </span>
              <span className="text-slate-400 dark:text-slate-500">•</span>
              <span className="text-[10px] sm:text-[11px] text-cyan-600 dark:text-cyan-400 font-semibold truncate">
                {vitals.heartRate} bpm (Zone {sportsSession.activeZone})
              </span>
            </div>
            <div className="flex items-center space-x-1 text-amber-600 dark:text-amber-400 text-[10px] sm:text-[11px] font-semibold shrink-0 ml-2 group-hover:translate-x-0.5 transition-transform">
              <span>Open Session</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </button>
        )}
      </div>

      {/* Main Central WHOOP-Style Animated Dial Indicator */}
      <WhoopSafetyDial
        riskFusion={riskFusion}
        vitals={vitals}
        sportsSession={sportsSession}
        onNavigate={onNavigate}
      />

      {/* Quick Vitals Section */}
      <div className="shrink-0 pb-1">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 font-bold tracking-wider uppercase">
            {sportsSession?.active ? 'WORKOUT TELEMETRY' : 'QUICK VITALS'}
          </span>
          <button
            onClick={() => onNavigate('physiological')}
            className="text-[10px] sm:text-[11px] text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 flex items-center font-semibold cursor-pointer"
          >
            All Biometrics <ChevronRight className="w-3 h-3 ml-0.5" />
          </button>
        </div>

        {/* 2x2 Grid of Cards (Adaptive to Sports Mode) */}
        <div className="grid grid-cols-2 gap-2">
          {/* Card 1: Heart Rate */}
          <button
            id="vital-heart-rate"
            onClick={() => onNavigate('physiological')}
            className="flex flex-col p-2.5 sm:p-3 rounded-xl bg-white dark:bg-[#0c1529] border border-slate-200 dark:border-[#182847] shadow-2xs hover:border-cyan-500/50 transition text-left cursor-pointer group"
          >
            <div className="flex items-center justify-between w-full">
              <div className="w-6 h-6 rounded-lg bg-rose-500/15 flex items-center justify-center text-rose-500 dark:text-rose-400">
                <Heart className="w-3.5 h-3.5 fill-rose-500/20" />
              </div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Heart Rate</span>
            </div>
            <div className="mt-1">
              <div className="text-slate-900 dark:text-white text-base sm:text-lg font-extrabold tracking-tight">
                {vitals.heartRate}{' '}
                <span className="text-xs font-normal text-slate-500 dark:text-slate-400">bpm</span>
              </div>
              <div className="flex items-center space-x-1 mt-0.5">
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    sportsSession?.active
                      ? 'bg-cyan-500'
                      : vitals.heartRate > 100
                      ? 'bg-amber-400'
                      : 'bg-emerald-500'
                  }`}
                />
                <span className="text-[9px] text-slate-600 dark:text-slate-300 font-medium truncate">
                  {sportsSession?.active
                    ? `Zone ${getHeartRateZone(vitals.heartRate).zone} (${getHeartRateZone(vitals.heartRate).name})`
                    : vitals.heartRate > 100
                    ? 'Elevated'
                    : 'Normal'}
                </span>
              </div>
            </div>
          </button>

          {/* Card 2: Cadence (if sports mode) OR SpO2 (if normal) */}
          {sportsSession?.active ? (
            <button
              id="vital-cadence"
              onClick={() => onNavigate('biomechanical')}
              className="flex flex-col p-2.5 sm:p-3 rounded-xl bg-white dark:bg-[#0c1529] border border-slate-200 dark:border-[#182847] shadow-2xs hover:border-cyan-500/50 transition text-left cursor-pointer group"
            >
              <div className="flex items-center justify-between w-full">
                <div className="w-6 h-6 rounded-lg bg-teal-500/15 flex items-center justify-center text-teal-600 dark:text-teal-400">
                  <Footprints className="w-3.5 h-3.5" />
                </div>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Cadence</span>
              </div>
              <div className="mt-1">
                <div className="text-slate-900 dark:text-white text-base sm:text-lg font-extrabold tracking-tight">
                  {sportsSession.cadence}{' '}
                  <span className="text-xs font-normal text-slate-500 dark:text-slate-400">
                    {sportsSession.sportType === 'Cycling' ? 'rpm' : 'spm'}
                  </span>
                </div>
                <div className="flex items-center space-x-1 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-medium">
                    Optimal Rhythm
                  </span>
                </div>
              </div>
            </button>
          ) : (
            <button
              id="vital-spo2"
              onClick={() => onNavigate('physiological')}
              className="flex flex-col p-2.5 sm:p-3 rounded-xl bg-white dark:bg-[#0c1529] border border-slate-200 dark:border-[#182847] shadow-2xs hover:border-cyan-500/50 transition text-left cursor-pointer group"
            >
              <div className="flex items-center justify-between w-full">
                <div className="w-6 h-6 rounded-lg bg-cyan-500/15 flex items-center justify-center text-cyan-600 dark:text-cyan-400">
                  <Droplets className="w-3.5 h-3.5" />
                </div>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">SpO₂</span>
              </div>
              <div className="mt-1">
                <div className="text-slate-900 dark:text-white text-base sm:text-lg font-extrabold tracking-tight">
                  {vitals.spo2} <span className="text-xs font-normal text-slate-500 dark:text-slate-400">%</span>
                </div>
                <div className="flex items-center space-x-1 mt-0.5">
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      vitals.spo2 < 95 ? 'bg-amber-400' : 'bg-emerald-500'
                    }`}
                  />
                  <span className="text-[9px] text-slate-600 dark:text-slate-300 font-medium">
                    {vitals.spo2 < 95 ? 'Caution' : 'Normal'}
                  </span>
                </div>
              </div>
            </button>
          )}

          {/* Card 3: Calories (if sports mode) OR Respiration (if normal) */}
          {sportsSession?.active ? (
            <button
              id="vital-calories"
              onClick={() => onNavigate('physiological')}
              className="flex flex-col p-2.5 sm:p-3 rounded-xl bg-white dark:bg-[#0c1529] border border-slate-200 dark:border-[#182847] shadow-2xs hover:border-cyan-500/50 transition text-left cursor-pointer group"
            >
              <div className="flex items-center justify-between w-full">
                <div className="w-6 h-6 rounded-lg bg-amber-500/15 flex items-center justify-center text-amber-600 dark:text-amber-400">
                  <Flame className="w-3.5 h-3.5" />
                </div>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Active Burn</span>
              </div>
              <div className="mt-1">
                <div className="text-slate-900 dark:text-white text-base sm:text-lg font-extrabold tracking-tight">
                  {Math.round(sportsSession.caloriesBurned)}{' '}
                  <span className="text-xs font-normal text-slate-500 dark:text-slate-400">kcal</span>
                </div>
                <div className="flex items-center space-x-1 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  <span className="text-[9px] text-amber-600 dark:text-amber-400 font-medium">
                    Metabolic Rate
                  </span>
                </div>
              </div>
            </button>
          ) : (
            <button
              id="vital-respiration"
              onClick={() => onNavigate('physiological')}
              className="flex flex-col p-2.5 sm:p-3 rounded-xl bg-white dark:bg-[#0c1529] border border-slate-200 dark:border-[#182847] shadow-2xs hover:border-cyan-500/50 transition text-left cursor-pointer group"
            >
              <div className="flex items-center justify-between w-full">
                <div className="w-6 h-6 rounded-lg bg-teal-500/15 flex items-center justify-center text-teal-600 dark:text-teal-400">
                  <Wind className="w-3.5 h-3.5" />
                </div>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Respiration</span>
              </div>
              <div className="mt-1">
                <div className="text-slate-900 dark:text-white text-base sm:text-lg font-extrabold tracking-tight">
                  {vitals.respiration}{' '}
                  <span className="text-xs font-normal text-slate-500 dark:text-slate-400">bpm</span>
                </div>
                <div className="flex items-center space-x-1 mt-0.5">
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      vitals.respiration > 22 ? 'bg-amber-400' : 'bg-emerald-500'
                    }`}
                  />
                  <span className="text-[9px] text-slate-600 dark:text-slate-300 font-medium">
                    {vitals.respiration > 22 ? 'Elevated' : 'Normal'}
                  </span>
                </div>
              </div>
            </button>
          )}

          {/* Card 4: Respiration / Cardio Stamina (in sports mode) OR Skin Temp (in normal mode) */}
          {sportsSession?.active ? (
            <button
              id="vital-sports-respiration"
              onClick={() => onNavigate('physiological')}
              className="flex flex-col p-2.5 sm:p-3 rounded-xl bg-white dark:bg-[#0c1529] border border-slate-200 dark:border-[#182847] shadow-2xs hover:border-cyan-500/50 transition text-left cursor-pointer group"
            >
              <div className="flex items-center justify-between w-full">
                <div className="w-6 h-6 rounded-lg bg-cyan-500/15 flex items-center justify-center text-cyan-600 dark:text-cyan-400">
                  <Wind className="w-3.5 h-3.5" />
                </div>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Respiration</span>
              </div>
              <div className="mt-1">
                <div className="text-slate-900 dark:text-white text-base sm:text-lg font-extrabold tracking-tight">
                  {vitals.respiration}{' '}
                  <span className="text-xs font-normal text-slate-500 dark:text-slate-400">bpm</span>
                </div>
                <div className="flex items-center space-x-1 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                  <span className="text-[9px] text-cyan-600 dark:text-cyan-400 font-medium">
                    Aerobic Pace
                  </span>
                </div>
              </div>
            </button>
          ) : (
            <button
              id="vital-skin-temp"
              onClick={() => onNavigate('physiological')}
              className="flex flex-col p-2.5 sm:p-3 rounded-xl bg-white dark:bg-[#0c1529] border border-slate-200 dark:border-[#182847] shadow-2xs hover:border-cyan-500/50 transition text-left cursor-pointer group"
            >
              <div className="flex items-center justify-between w-full">
                <div className="w-6 h-6 rounded-lg bg-amber-500/15 flex items-center justify-center text-amber-600 dark:text-amber-400">
                  <Thermometer className="w-3.5 h-3.5" />
                </div>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Skin Temp</span>
              </div>
              <div className="mt-1">
                <div className="text-slate-900 dark:text-white text-base sm:text-lg font-extrabold tracking-tight">
                  {vitals.skinTemp.toFixed(1)}{' '}
                  <span className="text-xs font-normal text-slate-500 dark:text-slate-400">°C</span>
                </div>
                <div className="flex items-center space-x-1 mt-0.5">
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      vitals.skinTemp > 37.8 ? 'bg-amber-400' : 'bg-emerald-500'
                    }`}
                  />
                  <span className="text-[9px] text-slate-600 dark:text-slate-300 font-medium">
                    {vitals.skinTemp > 37.8 ? 'Elevated' : 'Normal'}
                  </span>
                </div>
              </div>
            </button>
          )}
        </div>

        {/* Quick Module Shortcuts for Easy Cross-Device Navigation */}
        <div className="mt-2 grid grid-cols-3 gap-1.5">
          <button
            onClick={() => onNavigate('biomechanical')}
            className="p-1.5 sm:p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#0c1529] dark:hover:bg-[#12203d] border border-slate-200 dark:border-[#182847] flex flex-col items-center justify-center text-center transition cursor-pointer"
          >
            <Activity className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400 mb-0.5" />
            <span className="text-[10px] font-semibold text-slate-800 dark:text-slate-200">Biomechanical</span>
            <span className="text-[8px] text-slate-500 dark:text-slate-400">IMU & Posture</span>
          </button>

          <button
            onClick={() => onNavigate('diagnostics')}
            className="p-1.5 sm:p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#0c1529] dark:hover:bg-[#12203d] border border-slate-200 dark:border-[#182847] flex flex-col items-center justify-center text-center transition cursor-pointer"
          >
            <Wrench className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 mb-0.5" />
            <span className="text-[10px] font-semibold text-slate-800 dark:text-slate-200">Diagnostics</span>
            <span className="text-[8px] text-slate-500 dark:text-slate-400">Self-Test</span>
          </button>

          <button
            onClick={() => onNavigate('emergency')}
            className="p-1.5 sm:p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#0c1529] dark:hover:bg-[#12203d] border border-slate-200 dark:border-[#182847] flex flex-col items-center justify-center text-center transition cursor-pointer"
          >
            <UserCheck className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 mb-0.5" />
            <span className="text-[10px] font-semibold text-slate-800 dark:text-slate-200">Emergency</span>
            <span className="text-[8px] text-slate-500 dark:text-slate-400">SOS Contacts</span>
          </button>
        </div>
      </div>
    </div>
  );
};
