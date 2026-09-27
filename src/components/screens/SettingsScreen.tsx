import React, { useState } from 'react';
import {
  User,
  Phone,
  Sliders,
  Bell,
  Download,
  ShieldCheck,
  Cpu,
  Info,
  ChevronRight,
  Sparkles,
  Sun,
  Moon,
  Monitor,
  Check,
  Flame,
  Zap,
  LogOut,
  LogIn,
} from 'lucide-react';
import {
  ScreenId,
  SensorVitals,
  BiomechanicalData,
  EnvironmentalData,
  SportType,
  SportsSessionState,
} from '../../types';
import { ScreenHeader } from '../common/ScreenHeader';
import { useTheme } from '../../context/ThemeContext';
import { downloadTelemetryCsv } from '../../utils/csvExport';
import { generateHistoryData } from '../../mock/historyData';
import { useAuth } from '../../context/AuthContext';

interface SettingsScreenProps {
  onNavigate: (screen: ScreenId) => void;
  onReplayIntro?: () => void;
  vitals?: SensorVitals;
  biomech?: BiomechanicalData;
  enviro?: EnvironmentalData;
  sportsSession?: SportsSessionState;
  onToggleSportsMode?: () => void;
  onChangeSportType?: (sport: SportType) => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  onNavigate,
  onReplayIntro,
  vitals,
  biomech,
  enviro,
  sportsSession,
  onToggleSportsMode,
  onChangeSportType,
}) => {
  const { theme, effectiveTheme, setTheme } = useTheme();
  const { user, logout } = useAuth();
  const [activeModal, setActiveModal] = useState<string | null>(null);

  // Settings State
  const [hrMaxThreshold, setHrMaxThreshold] = useState(140);
  const [spo2MinThreshold, setSpo2MinThreshold] = useState(92);
  const [vibrationAlerts, setVibrationAlerts] = useState(true);
  const [soundAlerts, setSoundAlerts] = useState(true);
  const [autoNotifyContacts, setAutoNotifyContacts] = useState(true);
  const [exportSuccess, setExportSuccess] = useState(false);

  const handleExportData = (format: 'csv' | 'json') => {
    const history = generateHistoryData('24H');
    if (format === 'csv') {
      downloadTelemetryCsv({
        historyData: history,
        vitals,
        biomech,
        enviro,
        timeRangeLabel: '24H',
        filenamePrefix: 'vitalshell-telemetry-export',
      });
    } else {
      const payload = {
        app: 'VitalShell Smart Jacket',
        device: 'VitalShell VS-01',
        exportedAt: new Date().toISOString(),
        currentVitals: vitals,
        currentBiomech: biomech,
        currentEnviro: enviro,
        historyLogs: history,
      };
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `vitalshell-telemetry-export-${Date.now()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
    setExportSuccess(true);
    setTimeout(() => {
      setExportSuccess(false);
      setActiveModal(null);
    }, 2000);
  };

  return (
    <div className="w-full flex-1 flex flex-col px-4 sm:px-6 py-3 overflow-y-auto select-none transition-colors">
      <ScreenHeader title="Settings" showBack={false} />

      {/* User Profile Card */}
      <button
        id="settings-profile-card"
        onClick={() => setActiveModal('profile')}
        className="w-full p-4 rounded-2xl bg-white dark:bg-[#0c1529] border border-slate-200 dark:border-[#182847] shadow-xs flex items-center justify-between mt-3 text-left hover:border-cyan-500/50 transition cursor-pointer group"
      >
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-cyan-600 to-blue-700 p-0.5 shadow-md">
            <div className="w-full h-full rounded-full bg-slate-100 dark:bg-[#0d162a] flex items-center justify-center text-cyan-600 dark:text-cyan-300 font-bold overflow-hidden">
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-base font-semibold">
                  {user?.name ? user.name.slice(0, 2).toUpperCase() : 'OP'}
                </span>
              )}
            </div>
          </div>
          <div>
            <h2 className="text-slate-900 dark:text-white text-sm font-bold tracking-tight">
              {user?.name || 'Operator Profile'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              {user?.email || 'User Profile & Apparel Calibration'}
            </p>
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-cyan-500 transition" />
      </button>

      {/* Theme Selection Section: Light, Dark, System Theme */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#0c1529] border border-slate-200 dark:border-[#182847] shadow-xs mt-3">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-cyan-500" />
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              App Theme
            </span>
          </div>
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
            Active: <strong className="text-cyan-600 dark:text-cyan-400 capitalize">{theme === 'system' ? `System (${effectiveTheme})` : theme}</strong>
          </span>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
          Select your display theme. System automatically synchronizes with your device preferences.
        </p>

        <div className="grid grid-cols-3 gap-2.5">
          {/* Light Theme Option */}
          <button
            id="theme-option-light"
            onClick={() => setTheme('light')}
            className={`relative p-3 rounded-xl border flex flex-col items-center justify-center text-center transition-all cursor-pointer ${
              theme === 'light'
                ? 'bg-cyan-50 dark:bg-cyan-950/40 border-cyan-500 text-cyan-700 dark:text-cyan-300 ring-2 ring-cyan-500/20 shadow-xs'
                : 'bg-slate-50 dark:bg-[#080e1b] border-slate-200 dark:border-[#16233d] text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
            }`}
          >
            {theme === 'light' && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-cyan-500 text-white flex items-center justify-center text-[10px]">
                <Check className="w-2.5 h-2.5 stroke-[3]" />
              </span>
            )}
            <Sun className={`w-5 h-5 mb-1.5 ${theme === 'light' ? 'text-amber-500' : 'text-slate-500'}`} />
            <span className="text-xs font-semibold">Light</span>
            <span className="text-[10px] text-slate-400 mt-0.5">Clean high-contrast</span>
          </button>

          {/* Dark Theme Option */}
          <button
            id="theme-option-dark"
            onClick={() => setTheme('dark')}
            className={`relative p-3 rounded-xl border flex flex-col items-center justify-center text-center transition-all cursor-pointer ${
              theme === 'dark'
                ? 'bg-cyan-50 dark:bg-cyan-950/40 border-cyan-500 text-cyan-700 dark:text-cyan-300 ring-2 ring-cyan-500/20 shadow-xs'
                : 'bg-slate-50 dark:bg-[#080e1b] border-slate-200 dark:border-[#16233d] text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
            }`}
          >
            {theme === 'dark' && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-cyan-500 text-white flex items-center justify-center text-[10px]">
                <Check className="w-2.5 h-2.5 stroke-[3]" />
              </span>
            )}
            <Moon className={`w-5 h-5 mb-1.5 ${theme === 'dark' ? 'text-cyan-400' : 'text-slate-500'}`} />
            <span className="text-xs font-semibold">Dark</span>
            <span className="text-[10px] text-slate-400 mt-0.5">Deep OLED tech</span>
          </button>

          {/* System Theme Option */}
          <button
            id="theme-option-system"
            onClick={() => setTheme('system')}
            className={`relative p-3 rounded-xl border flex flex-col items-center justify-center text-center transition-all cursor-pointer ${
              theme === 'system'
                ? 'bg-cyan-50 dark:bg-cyan-950/40 border-cyan-500 text-cyan-700 dark:text-cyan-300 ring-2 ring-cyan-500/20 shadow-xs'
                : 'bg-slate-50 dark:bg-[#080e1b] border-slate-200 dark:border-[#16233d] text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
            }`}
          >
            {theme === 'system' && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-cyan-500 text-white flex items-center justify-center text-[10px]">
                <Check className="w-2.5 h-2.5 stroke-[3]" />
              </span>
            )}
            <Monitor className={`w-5 h-5 mb-1.5 ${theme === 'system' ? 'text-cyan-500' : 'text-slate-500'}`} />
            <span className="text-xs font-semibold">System</span>
            <span className="text-[10px] text-slate-400 mt-0.5">Auto match OS</span>
          </button>
        </div>
      </div>

      {/* Sports Mode & Athletic Telemetry Settings Card */}
      <div className="p-3.5 rounded-2xl bg-white dark:bg-[#0c1529] border border-slate-200 dark:border-[#182847] shadow-xs mt-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
              sportsSession?.active
                ? 'bg-amber-500/15 text-amber-500'
                : 'bg-slate-100 dark:bg-[#14223b] text-slate-500'
            }`}>
              <Flame className={`w-4 h-4 ${sportsSession?.active ? 'animate-pulse' : ''}`} />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900 dark:text-white">
                Sports & Workout Mode
              </span>
              <span className="block text-[11px] text-slate-500 dark:text-slate-400">
                {sportsSession?.active ? 'Active: 1Hz telemetry & shock filtering' : 'Optimize algorithms for exercise'}
              </span>
            </div>
          </div>

          <button
            id="settings-sports-mode-toggle"
            onClick={onToggleSportsMode}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
              sportsSession?.active ? 'bg-amber-500' : 'bg-slate-300 dark:bg-slate-700'
            }`}
            aria-label="Toggle Sports Mode"
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                sportsSession?.active ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Sport Type Selector & Optimizations */}
        {sportsSession?.active && (
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-[#16233d] space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                Current Activity
              </span>
              <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                {sportsSession.sportType}
              </span>
            </div>

            <div className="grid grid-cols-4 gap-1.5">
              {(['Running', 'Cycling', 'HIIT', 'General Fitness'] as SportType[]).map((sport) => {
                const isSelected = sportsSession.sportType === sport;
                return (
                  <button
                    key={sport}
                    onClick={() => onChangeSportType && onChangeSportType(sport)}
                    className={`py-1.5 px-1 rounded-xl text-[10px] font-bold transition cursor-pointer truncate ${
                      isSelected
                        ? 'bg-amber-500 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-[#142038] text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-[#1c2c4d]'
                    }`}
                  >
                    {sport}
                  </button>
                );
              })}
            </div>

            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#080f1e] text-[10px] text-slate-600 dark:text-slate-400 space-y-1">
              <div className="flex items-center justify-between">
                <span>• Telemetry frequency:</span>
                <strong className="text-cyan-600 dark:text-cyan-400">1Hz Real-Time</strong>
              </div>
              <div className="flex items-center justify-between">
                <span>• Athletic shock filter:</span>
                <strong className="text-emerald-600 dark:text-emerald-400">2.0–3.5G Tolerant</strong>
              </div>
              <div className="flex items-center justify-between">
                <span>• Exertion HR floor:</span>
                <strong className="text-amber-600 dark:text-amber-400">Cardio Target Calibrated</strong>
              </div>
            </div>

            <button
              id="settings-open-sports-session-btn"
              onClick={() => onNavigate('sports')}
              className="w-full py-2 px-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 text-xs font-bold transition cursor-pointer flex items-center justify-between"
            >
              <span>Open Dedicated Sports Session Screen</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Menu List Items */}
      <div className="p-2 rounded-2xl bg-white dark:bg-[#0c1529] border border-slate-200 dark:border-[#182847] shadow-xs mt-3 divide-y divide-slate-100 dark:divide-[#16233d]">
        {/* Emergency Contacts */}
        <button
          id="menu-emergency-contacts"
          onClick={() => onNavigate('emergency')}
          className="w-full flex items-center justify-between p-3 text-left hover:bg-slate-50 dark:hover:bg-[#111e38]/50 rounded-xl transition cursor-pointer"
        >
          <div className="flex items-center space-x-3">
            <Phone className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            <span className="text-xs text-slate-800 dark:text-slate-200 font-medium">Emergency Contacts</span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>

        {/* Alert Thresholds */}
        <button
          id="menu-alert-thresholds"
          onClick={() => setActiveModal('thresholds')}
          className="w-full flex items-center justify-between p-3 text-left hover:bg-slate-50 dark:hover:bg-[#111e38]/50 rounded-xl transition cursor-pointer"
        >
          <div className="flex items-center space-x-3">
            <Sliders className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            <span className="text-xs text-slate-800 dark:text-slate-200 font-medium">Alert Thresholds</span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>

        {/* Notifications */}
        <button
          id="menu-notifications"
          onClick={() => setActiveModal('notifications')}
          className="w-full flex items-center justify-between p-3 text-left hover:bg-slate-50 dark:hover:bg-[#111e38]/50 rounded-xl transition cursor-pointer"
        >
          <div className="flex items-center space-x-3">
            <Bell className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            <span className="text-xs text-slate-800 dark:text-slate-200 font-medium">Notifications & Haptics</span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>

        {/* Data Export */}
        <button
          id="menu-data-export"
          onClick={() => setActiveModal('export')}
          className="w-full flex items-center justify-between p-3 text-left hover:bg-slate-50 dark:hover:bg-[#111e38]/50 rounded-xl transition cursor-pointer"
        >
          <div className="flex items-center space-x-3">
            <Download className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            <span className="text-xs text-slate-800 dark:text-slate-200 font-medium">Data Export</span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>

        {/* Privacy */}
        <button
          id="menu-privacy"
          onClick={() => setActiveModal('privacy')}
          className="w-full flex items-center justify-between p-3 text-left hover:bg-slate-50 dark:hover:bg-[#111e38]/50 rounded-xl transition cursor-pointer"
        >
          <div className="flex items-center space-x-3">
            <ShieldCheck className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            <span className="text-xs text-slate-800 dark:text-slate-200 font-medium">Privacy & Security</span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>

        {/* Device Diagnostics */}
        <button
          id="menu-device-diagnostics"
          onClick={() => onNavigate('diagnostics')}
          className="w-full flex items-center justify-between p-3 text-left hover:bg-slate-50 dark:hover:bg-[#111e38]/50 rounded-xl transition cursor-pointer"
        >
          <div className="flex items-center space-x-3">
            <Cpu className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            <span className="text-xs text-slate-800 dark:text-slate-200 font-medium">Device Diagnostics</span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>

        {/* About VitalShell */}
        <button
          id="menu-about-vitalshell"
          onClick={() => setActiveModal('about')}
          className="w-full flex items-center justify-between p-3 text-left hover:bg-slate-50 dark:hover:bg-[#111e38]/50 rounded-xl transition cursor-pointer"
        >
          <div className="flex items-center space-x-3">
            <Info className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            <span className="text-xs text-slate-800 dark:text-slate-200 font-medium">About VitalShell</span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>

        {/* Account Authentication & Switch Operator */}
        <button
          id="menu-account-auth"
          onClick={async () => {
            if (user) {
              await logout();
            }
            onNavigate('auth');
          }}
          className="w-full flex items-center justify-between p-3 text-left hover:bg-slate-50 dark:hover:bg-[#111e38]/50 rounded-xl transition cursor-pointer"
        >
          <div className="flex items-center space-x-3">
            {user ? (
              <LogOut className="w-4 h-4 text-rose-500" />
            ) : (
              <LogIn className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            )}
            <div>
              <span className={`text-xs font-medium ${user ? 'text-rose-600 dark:text-rose-400' : 'text-slate-800 dark:text-slate-200'}`}>
                {user ? 'Sign Out / Switch Operator' : 'Sign In with Email / Google'}
              </span>
              <span className="block text-[10px] text-slate-400">
                {user ? `Signed in as ${user.email}` : 'Access encrypted telemetry sync'}
              </span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>
      </div>

      {/* Profile Modal */}
      {activeModal === 'profile' && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/60 dark:bg-black/80 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setActiveModal(null)}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-white dark:bg-[#0d172e] border border-slate-200 dark:border-cyan-500/40 p-5 shadow-2xl transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-[#1a2d52]">
              <h3 className="text-slate-900 dark:text-white font-bold text-sm">User Profile</h3>
              <button
                onClick={() => setActiveModal(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white text-xs p-1"
              >
                ✕
              </button>
            </div>
            <div className="mt-3 space-y-2.5 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-[#182847]">
                <span className="text-slate-500 dark:text-slate-400">Name</span>
                <span className="text-slate-900 dark:text-white font-semibold">{user?.name || 'Operator'}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-[#182847]">
                <span className="text-slate-500 dark:text-slate-400">Email</span>
                <span className="text-slate-900 dark:text-white font-semibold">{user?.email || 'Not Signed In'}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-[#182847]">
                <span className="text-slate-500 dark:text-slate-400">Account Type</span>
                <span className="text-cyan-600 dark:text-cyan-400 font-semibold capitalize">{user?.provider || 'Authenticated'}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-[#182847]">
                <span className="text-slate-500 dark:text-slate-400">Biometric Calibrated</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Yes (Active)</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-500 dark:text-slate-400">Firmware Pair</span>
                <span className="text-slate-800 dark:text-white font-mono">VS-01-94A2B</span>
              </div>
            </div>
            <div className="mt-5 flex items-center justify-between pt-2 border-t border-slate-100 dark:border-[#182847]">
              <button
                onClick={async () => {
                  await logout();
                  setActiveModal(null);
                  onNavigate('auth');
                }}
                className="text-xs text-rose-600 dark:text-rose-400 hover:underline font-semibold cursor-pointer"
              >
                Sign Out
              </button>
              <button
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Thresholds Modal */}
      {activeModal === 'thresholds' && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/60 dark:bg-black/80 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setActiveModal(null)}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-white dark:bg-[#0d172e] border border-slate-200 dark:border-cyan-500/40 p-5 shadow-2xl transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-[#1a2d52]">
              <h3 className="text-slate-900 dark:text-white font-bold text-sm">Alert Thresholds</h3>
              <button
                onClick={() => setActiveModal(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white text-xs p-1"
              >
                ✕
              </button>
            </div>
            <div className="mt-4 space-y-4 text-xs">
              <div>
                <div className="flex justify-between mb-1 text-slate-700 dark:text-slate-300">
                  <span>Max Heart Rate Alert</span>
                  <span className="text-cyan-600 dark:text-cyan-400 font-bold">{hrMaxThreshold} bpm</span>
                </div>
                <input
                  type="range"
                  min="110"
                  max="180"
                  value={hrMaxThreshold}
                  onChange={(e) => setHrMaxThreshold(Number(e.target.value))}
                  className="w-full accent-cyan-500"
                />
              </div>

              <div>
                <div className="flex justify-between mb-1 text-slate-700 dark:text-slate-300">
                  <span>Min SpO₂ Alert</span>
                  <span className="text-cyan-600 dark:text-cyan-400 font-bold">{spo2MinThreshold} %</span>
                </div>
                <input
                  type="range"
                  min="85"
                  max="95"
                  value={spo2MinThreshold}
                  onChange={(e) => setSpo2MinThreshold(Number(e.target.value))}
                  className="w-full accent-cyan-500"
                />
              </div>
            </div>
            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold cursor-pointer"
              >
                Save Thresholds
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notifications Modal */}
      {activeModal === 'notifications' && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/60 dark:bg-black/80 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setActiveModal(null)}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-white dark:bg-[#0d172e] border border-slate-200 dark:border-cyan-500/40 p-5 shadow-2xl transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-[#1a2d52]">
              <h3 className="text-slate-900 dark:text-white font-bold text-sm">Notification Preferences</h3>
              <button
                onClick={() => setActiveModal(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white text-xs p-1"
              >
                ✕
              </button>
            </div>
            <div className="mt-3 space-y-3 text-xs">
              <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-[#182847]">
                <span className="text-slate-700 dark:text-slate-300">Jacket Haptic Vibration</span>
                <input
                  type="checkbox"
                  checked={vibrationAlerts}
                  onChange={(e) => setVibrationAlerts(e.target.checked)}
                  className="w-4 h-4 accent-cyan-500 cursor-pointer"
                />
              </div>
              <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-[#182847]">
                <span className="text-slate-700 dark:text-slate-300">Audible Siren on Critical Hazard</span>
                <input
                  type="checkbox"
                  checked={soundAlerts}
                  onChange={(e) => setSoundAlerts(e.target.checked)}
                  className="w-4 h-4 accent-cyan-500 cursor-pointer"
                />
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-slate-700 dark:text-slate-300">Auto-Dispatch to Emergency Contacts</span>
                <input
                  type="checkbox"
                  checked={autoNotifyContacts}
                  onChange={(e) => setAutoNotifyContacts(e.target.checked)}
                  className="w-4 h-4 accent-cyan-500 cursor-pointer"
                />
              </div>
            </div>
            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Data Export Modal */}
      {activeModal === 'export' && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/60 dark:bg-black/80 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setActiveModal(null)}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-white dark:bg-[#0d172e] border border-slate-200 dark:border-cyan-500/40 p-5 shadow-2xl transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-[#1a2d52]">
              <h3 className="text-slate-900 dark:text-white font-bold text-sm">Export Sensor Telemetry</h3>
              <button
                onClick={() => setActiveModal(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white text-xs p-1"
              >
                ✕
              </button>
            </div>
            <p className="text-slate-600 dark:text-slate-300 text-xs mt-3 leading-relaxed">
              Generate an export file of continuous ECG, respiration, IMU posture, and
              environmental metrics for clinical review.
            </p>
            {exportSuccess ? (
              <div className="mt-4 p-3 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-medium flex items-center justify-center space-x-2">
                <Check className="w-4 h-4 stroke-[2.5]" />
                <span>Telemetry CSV downloaded successfully!</span>
              </div>
            ) : (
              <div className="mt-4 flex flex-col space-y-2">
                <button
                  id="settings-export-csv-btn"
                  onClick={() => handleExportData('csv')}
                  className="w-full py-2.5 px-4 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold flex items-center justify-center space-x-2 cursor-pointer shadow-xs transition"
                >
                  <Download className="w-4 h-4 stroke-[2]" />
                  <span>Download Telemetry (.CSV)</span>
                </button>
                <button
                  id="settings-export-json-btn"
                  onClick={() => handleExportData('json')}
                  className="w-full py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#14203a] dark:hover:bg-[#1a2b4e] text-slate-700 dark:text-slate-300 text-xs font-medium cursor-pointer transition text-center"
                >
                  Download as JSON
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Privacy Modal */}
      {activeModal === 'privacy' && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/60 dark:bg-black/80 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setActiveModal(null)}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-white dark:bg-[#0d172e] border border-slate-200 dark:border-cyan-500/40 p-5 shadow-2xl transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-[#1a2d52]">
              <h3 className="text-slate-900 dark:text-white font-bold text-sm">Privacy & Encryption</h3>
              <button
                onClick={() => setActiveModal(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white text-xs p-1"
              >
                ✕
              </button>
            </div>
            <div className="mt-3 space-y-2 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              <p>
                VitalShell processes all physiological and biomechanical sensor fusion on-device in
                real-time.
              </p>
              <p>
                Transmission between the jacket and companion application is secured via AES-256-GCM
                hardware-level cryptography.
              </p>
            </div>
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* About Modal */}
      {activeModal === 'about' && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/60 dark:bg-black/80 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setActiveModal(null)}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-white dark:bg-[#0d172e] border border-slate-200 dark:border-cyan-500/40 p-5 shadow-2xl transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-[#1a2d52]">
              <h3 className="text-slate-900 dark:text-white font-bold text-sm">About VitalShell</h3>
              <button
                onClick={() => setActiveModal(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white text-xs p-1"
              >
                ✕
              </button>
            </div>
            <div className="mt-3 space-y-2 text-xs text-slate-600 dark:text-slate-300">
              <p className="font-semibold text-slate-900 dark:text-white">VitalShell Companion v2.4.1</p>
              <p>Hardware Model: VitalShell VS-01 Smart Protective Jacket</p>
              <p className="text-slate-500 dark:text-slate-400">
                Multi-sensor smart apparel fusing ECG, dual-channel EMG, respiratory pneumography,
                6-DOF IMU, and microclimate environmental telemetry.
              </p>
            </div>
            {onReplayIntro && (
              <div className="mt-4 pt-3 border-t border-slate-200 dark:border-[#182847]">
                <button
                  onClick={() => {
                    setActiveModal(null);
                    onReplayIntro();
                  }}
                  className="w-full py-2 rounded-xl bg-slate-100 dark:bg-[#14203a] hover:bg-slate-200 dark:hover:bg-[#1a2b4e] text-cyan-600 dark:text-cyan-400 text-xs font-semibold cursor-pointer"
                >
                  Replay Intro Screen
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
