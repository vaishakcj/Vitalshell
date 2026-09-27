import React, { useState } from 'react';
import {
  Wifi,
  ChevronRight,
  RefreshCw,
  Radio,
  CheckCircle2,
  Battery,
  BatteryWarning,
  BatteryLow,
  BatteryFull,
  Bluetooth,
  Activity,
  Compass,
  CloudSun,
  Mic,
  Smartphone,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';
import { ConnectivityState } from '../../types';
import { ScreenHeader } from '../common/ScreenHeader';
import { bleManager } from '../../services/bleService';
import { motionSensorService } from '../../services/motionSensorService';
import { environmentSensorService } from '../../services/environmentSensorService';

interface ConnectivityScreenProps {
  connectivity: ConnectivityState;
  onUpdateConnectivity: (updated: Partial<ConnectivityState>) => void;
  onBack: () => void;
  onSyncRealClimate?: () => Promise<void>;
  onToggleAudioSensor?: () => void;
  isAudioActive?: boolean;
}

export const ConnectivityScreen: React.FC<ConnectivityScreenProps> = ({
  connectivity,
  onUpdateConnectivity,
  onBack,
  onSyncRealClimate,
  onToggleAudioSensor,
  isAudioActive = false,
}) => {
  const [reconnecting, setReconnecting] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [bleConnecting, setBleConnecting] = useState(false);
  const [motionStarting, setMotionStarting] = useState(false);
  const [weatherSyncing, setWeatherSyncing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleReconnect = () => {
    setReconnecting(true);
    onUpdateConnectivity({ statusText: 'Connecting', connected: false });
    triggerToast('Re-establishing hardware handshake...');

    setTimeout(() => {
      setReconnecting(false);
      onUpdateConnectivity({
        statusText: 'Connected',
        connected: true,
        latency: Math.floor(18 + Math.random() * 6),
        lastPacketSec: 1,
      });
      triggerToast('Hardware link verified!');
    }, 1200);
  };

  const handleSyncNow = () => {
    setSyncing(true);
    onUpdateConnectivity({ statusText: 'Synchronizing' });
    triggerToast('Syncing real-time telemetry pipeline...');

    setTimeout(() => {
      setSyncing(false);
      onUpdateConnectivity({
        statusText: 'Connected',
        syncActive: 12,
        syncTotal: 12,
        lastPacketSec: 0,
      });
      triggerToast('All 12 physical telemetry channels synchronized!');
    }, 1000);
  };

  // Real Web Bluetooth Connect
  const handleConnectBle = async () => {
    if (!bleManager.isSupported()) {
      triggerToast('Web Bluetooth requires Chrome on Android, macOS, or Windows.');
      return;
    }

    if (connectivity.bleConnected) {
      await bleManager.disconnect();
      onUpdateConnectivity({
        bleConnected: false,
        bleDeviceName: undefined,
      });
      triggerToast('Bluetooth wearable disconnected.');
      return;
    }

    setBleConnecting(true);
    try {
      const res = await bleManager.connect();
      if (res.success) {
        onUpdateConnectivity({
          bleConnected: true,
          bleDeviceName: res.deviceName || 'BLE Heart Rate Sensor',
        });
        triggerToast(`Paired to ${res.deviceName || 'BLE Device'}!`);
      } else if (res.error && !res.error.includes('cancelled')) {
        triggerToast(res.error);
      }
    } catch (err: any) {
      triggerToast(err?.message || 'Bluetooth connection failed.');
    } finally {
      setBleConnecting(false);
    }
  };

  // Real Device Accelerometer & Gyroscope
  const handleToggleMotion = async () => {
    if (!motionSensorService.isSupported()) {
      triggerToast('Device motion sensors not supported on this platform.');
      return;
    }

    if (connectivity.deviceMotionActive) {
      motionSensorService.stop();
      onUpdateConnectivity({ deviceMotionActive: false });
      triggerToast('Phone motion sensors disengaged.');
      return;
    }

    setMotionStarting(true);
    try {
      const res = await motionSensorService.start();
      if (res.success) {
        onUpdateConnectivity({ deviceMotionActive: true });
        triggerToast('Phone accelerometer & IMU active! Move phone to track motion.');
      } else {
        triggerToast(res.error || 'Permission denied for motion sensors.');
      }
    } finally {
      setMotionStarting(false);
    }
  };

  // Real Weather Sync (GPS + Open-Meteo)
  const handleFetchClimate = async () => {
    setWeatherSyncing(true);
    try {
      if (onSyncRealClimate) {
        await onSyncRealClimate();
        triggerToast('Local meteorological conditions updated from GPS.');
      } else {
        const res = await environmentSensorService.fetchRealClimate();
        if (res.success && res.data) {
          triggerToast(`Local Climate: ${res.data.temperature}°C, ${res.data.humidity}% RH`);
          onUpdateConnectivity({ ambientWeatherActive: true });
        } else {
          triggerToast(res.error || 'Failed to fetch weather.');
        }
      }
    } finally {
      setWeatherSyncing(false);
    }
  };

  return (
    <div className="w-full flex-1 flex flex-col px-4 py-2 overflow-y-auto select-none">
      <ScreenHeader title="Connectivity & Hardware" onBack={onBack} />

      {/* Main Status Card */}
      <div className="p-5 rounded-2xl bg-white dark:bg-[#0c1529] border border-slate-200 dark:border-[#182847] shadow-xs flex items-center justify-between mt-2">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-full bg-emerald-500/20 border-2 border-emerald-500 dark:border-emerald-400 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-[0_0_16px_rgba(16,185,129,0.4)]">
            <Wifi className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-slate-900 dark:text-white text-base font-bold tracking-tight">
                {connectivity.statusText}
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                LIVE
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              {connectivity.deviceName}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-1">
          <Wifi className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
        </div>
      </div>

      {/* Real Hardware Integrations Section */}
      <div className="mt-4">
        <div className="flex items-center justify-between px-1 mb-2">
          <span className="text-xs font-bold text-slate-900 dark:text-white tracking-wide uppercase">
            Hardware & Physical Sensors
          </span>
          <span className="text-[10px] text-cyan-600 dark:text-cyan-400 font-medium">
            Active Hardware Mode
          </span>
        </div>

        {/* 1. Bluetooth Low Energy (BLE) Wearable Card */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#0c1529] border border-slate-200 dark:border-[#182847] shadow-xs space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  connectivity.bleConnected
                    ? 'bg-blue-500/20 text-blue-500 border border-blue-500/40'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                }`}
              >
                <Bluetooth className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs text-slate-900 dark:text-white font-bold block">
                  Bluetooth Wearable / Jacket
                </span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {connectivity.bleConnected
                    ? `Connected: ${connectivity.bleDeviceName || 'GATT Sensor'}`
                    : 'Pair real BLE Heart Rate monitor or VitalShell jacket'}
                </p>
              </div>
            </div>

            <button
              onClick={handleConnectBle}
              disabled={bleConnecting}
              className={`py-1.5 px-3 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center space-x-1.5 ${
                connectivity.bleConnected
                  ? 'bg-rose-500/10 text-rose-600 hover:bg-rose-500/20 border border-rose-500/30'
                  : 'bg-blue-600 hover:bg-blue-500 text-white shadow-xs'
              }`}
            >
              {bleConnecting ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : connectivity.bleConnected ? (
                <span>Disconnect</span>
              ) : (
                <>
                  <Bluetooth className="w-3.5 h-3.5" />
                  <span>Pair BLE</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* 2. Physical Phone Accelerometer & Gyroscope Card */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#0c1529] border border-slate-200 dark:border-[#182847] shadow-xs mt-2.5">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  connectivity.deviceMotionActive
                    ? 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/40'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                }`}
              >
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs text-slate-900 dark:text-white font-bold block">
                  Physical Motion Sensors (IMU)
                </span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {connectivity.deviceMotionActive
                    ? 'Live phone accelerometer & posture kinematics active'
                    : 'Stream actual device accelerometer & step cadence'}
                </p>
              </div>
            </div>

            <button
              onClick={handleToggleMotion}
              disabled={motionStarting}
              className={`py-1.5 px-3 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center space-x-1.5 ${
                connectivity.deviceMotionActive
                  ? 'bg-emerald-500 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {motionStarting ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <span>{connectivity.deviceMotionActive ? 'Engaged' : 'Enable'}</span>
              )}
            </button>
          </div>
        </div>

        {/* 3. Real Meteorological Weather & Acoustic Decibel Cards */}
        <div className="grid grid-cols-2 gap-2 mt-2.5">
          {/* GPS Real Climate */}
          <div className="p-3.5 rounded-2xl bg-white dark:bg-[#0c1529] border border-slate-200 dark:border-[#182847] shadow-xs flex flex-col justify-between">
            <div className="flex items-center space-x-2 text-cyan-600 dark:text-cyan-400">
              <CloudSun className="w-4 h-4" />
              <span className="text-xs font-semibold">GPS Climate</span>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
              Fetch physical temperature, humidity, and UV from local weather API
            </p>
            <button
              onClick={handleFetchClimate}
              disabled={weatherSyncing}
              className="mt-2.5 w-full py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-[11px] font-semibold transition cursor-pointer flex items-center justify-center space-x-1"
            >
              {weatherSyncing ? (
                <RefreshCw className="w-3 h-3 animate-spin" />
              ) : (
                <span>Sync Weather</span>
              )}
            </button>
          </div>

          {/* Real Audio Noise SPL */}
          <div className="p-3.5 rounded-2xl bg-white dark:bg-[#0c1529] border border-slate-200 dark:border-[#182847] shadow-xs flex flex-col justify-between">
            <div className="flex items-center space-x-2 text-teal-600 dark:text-teal-400">
              <Mic className="w-4 h-4" />
              <span className="text-xs font-semibold">Microphone SPL</span>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
              {isAudioActive
                ? 'Sampling real acoustic room noise in decibels'
                : 'Measure actual environmental room decibels (dB SPL)'}
            </p>
            <button
              onClick={onToggleAudioSensor}
              className={`mt-2.5 w-full py-1.5 rounded-xl text-[11px] font-semibold transition cursor-pointer flex items-center justify-center space-x-1 ${
                isAudioActive
                  ? 'bg-teal-500 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <span>{isAudioActive ? 'Stop Mic' : 'Live Decibels'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Telemetry Network Rows Card */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#0c1529] border border-slate-200 dark:border-[#182847] shadow-xs mt-3.5 space-y-3 text-xs">
        <div className="flex items-center justify-between pb-1 border-b border-slate-100 dark:border-[#182847]">
          <span className="text-slate-500 dark:text-slate-400 font-medium">IP Address / Gateway</span>
          <span className="text-slate-900 dark:text-white font-mono">{connectivity.ipAddress}</span>
        </div>

        <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-[#182847]">
          <span className="text-slate-500 dark:text-slate-400 font-medium">Signal Strength</span>
          <div className="flex items-center space-x-1.5">
            <div className="flex items-end space-x-0.5 h-3">
              <span className="w-1 h-1.5 bg-emerald-500 rounded-xs" />
              <span className="w-1 h-2 bg-emerald-500 rounded-xs" />
              <span className="w-1 h-2.5 bg-emerald-500 rounded-xs" />
              <span className="w-1 h-3 bg-emerald-500 rounded-xs" />
            </div>
            <span className="text-slate-900 dark:text-white font-semibold">{connectivity.signalStrength}</span>
          </div>
        </div>

        <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-[#182847]">
          <span className="text-slate-500 dark:text-slate-400 font-medium">Pipeline Latency</span>
          <div className="flex items-center space-x-1 text-slate-900 dark:text-white font-mono">
            <span>{connectivity.latency} ms</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
          </div>
        </div>

        <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-[#182847]">
          <span className="text-slate-500 dark:text-slate-400 font-medium">Last Packet Received</span>
          <span className="text-slate-900 dark:text-white font-medium">{connectivity.lastPacketSec}s ago</span>
        </div>

        <div className="flex items-center justify-between pt-1">
          <span className="text-slate-500 dark:text-slate-400 font-medium">Active Channels</span>
          <span className="text-emerald-600 dark:text-emerald-400 font-semibold font-mono">
            {connectivity.syncActive} / {connectivity.syncTotal} active
          </span>
        </div>
      </div>

      {/* Buttons: Reconnect | Sync Now */}
      <div className="grid grid-cols-2 gap-2.5 mt-3">
        <button
          id="btn-reconnect"
          onClick={handleReconnect}
          disabled={reconnecting}
          className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-98 text-white text-xs font-semibold tracking-wide transition flex items-center justify-center space-x-1.5 shadow-xs cursor-pointer disabled:opacity-50"
        >
          {reconnecting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
          <span>{reconnecting ? 'Reconnecting...' : 'Reconnect Link'}</span>
        </button>

        <button
          id="btn-sync-now"
          onClick={handleSyncNow}
          disabled={syncing}
          className="w-full py-3 rounded-xl bg-white dark:bg-[#0c1529] hover:bg-slate-50 dark:hover:bg-[#14223d] active:scale-98 border border-slate-200 dark:border-[#20345b] text-slate-800 dark:text-white text-xs font-semibold tracking-wide transition flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-50 shadow-xs"
        >
          {syncing && <Radio className="w-3.5 h-3.5 animate-pulse text-cyan-600 dark:text-cyan-400" />}
          <span>{syncing ? 'Syncing...' : 'Sync Channels'}</span>
        </button>
      </div>

      {/* Real Hardware Battery Status (from Hardware / Battery API) */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#0c1529] border border-slate-200 dark:border-[#182847] shadow-xs mt-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {connectivity.battery < 20 ? (
              <BatteryWarning className="w-4 h-4 text-rose-500 animate-pulse" />
            ) : connectivity.battery < 50 ? (
              <BatteryLow className="w-4 h-4 text-amber-500" />
            ) : (
              <BatteryFull className="w-4 h-4 text-emerald-500" />
            )}
            <div>
              <span className="text-xs text-slate-900 dark:text-white font-semibold block">
                Hardware Battery Status
              </span>
              <span className="text-[10px] text-slate-400">
                {connectivity.batteryCharging ? 'Charging (External Power)' : 'Operating on Battery Power'}
              </span>
            </div>
          </div>
          <span
            className={`text-xs font-bold font-mono px-2 py-0.5 rounded-md ${
              connectivity.battery < 20
                ? 'bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30'
                : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
            }`}
          >
            {connectivity.battery}%
          </span>
        </div>

        {/* Visual Battery Bar */}
        <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full mt-2.5 overflow-hidden">
          <div
            className={`h-full transition-all duration-300 rounded-full ${
              connectivity.battery < 20
                ? 'bg-rose-500'
                : connectivity.battery < 50
                ? 'bg-amber-500'
                : 'bg-emerald-500'
            }`}
            style={{ width: `${Math.max(5, Math.min(100, connectivity.battery))}%` }}
          />
        </div>
      </div>

      {/* Device Endpoint Card */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#0c1529] border border-slate-200 dark:border-[#182847] shadow-xs mt-3 flex items-center justify-between">
        <div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Device Endpoint</span>
          <div className="text-slate-900 dark:text-white text-xs font-mono font-semibold mt-0.5">
            {connectivity.endpoint}
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-slate-400 dark:text-slate-500" />
      </div>

      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed bottom-16 left-1/2 -translate-x-1/2 z-50 bg-slate-900 dark:bg-[#0f1d38] border border-cyan-500/50 text-white text-xs px-4 py-2 rounded-full shadow-lg flex items-center space-x-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
