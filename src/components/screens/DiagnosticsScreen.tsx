import React, { useState } from 'react';
import { CheckCircle2, ChevronRight, Cpu } from 'lucide-react';
import { ScreenHeader } from '../common/ScreenHeader';

interface DiagnosticsScreenProps {
  onBack: () => void;
}

export const DiagnosticsScreen: React.FC<DiagnosticsScreenProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<'sensors' | 'system'>('sensors');

  const sensorList = [
    { name: 'ECG', status: 'Connected' },
    { name: 'EMG Left', status: 'Connected' },
    { name: 'EMG Right', status: 'Connected' },
    { name: 'Respiration', status: 'Connected' },
    { name: 'Skin Temperature', status: 'Connected' },
    { name: 'IMU', status: 'Connected' },
    { name: 'Ambient Temp', status: 'Connected' },
    { name: 'Humidity', status: 'Connected' },
    { name: 'Gas', status: 'Connected' },
    { name: 'Noise', status: 'Connected' },
  ];

  const systemMetrics = [
    { label: 'Battery Health', value: '98% (Normal)' },
    { label: 'Processor Status', value: 'ARM Cortex-M33 (Nominal)' },
    { label: 'Memory Usage', value: '42% of 512 KB SRAM' },
    { label: 'Communication Status', value: 'BLE 5.3 & Wi-Fi 6 Connected' },
    { label: 'Sensor Synchronization', value: '0 drift, jitter < 1.2 ms' },
    { label: 'System Temperature', value: '31.2 °C' },
    { label: 'Firmware Status', value: 'v2.4.1 (Up to date)' },
  ];

  return (
    <div className="w-full flex-1 flex flex-col px-4 py-2 overflow-y-auto select-none">
      <ScreenHeader title="Diagnostics" onBack={onBack} />

      {/* Tabs: Sensors | System */}
      <div className="flex justify-center my-2">
        <div className="flex p-1 bg-slate-100 dark:bg-[#0b1325] rounded-xl border border-slate-200 dark:border-[#16233d] w-full max-w-[280px]">
          <button
            id="diag-tab-sensors"
            onClick={() => setActiveTab('sensors')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              activeTab === 'sensors'
                ? 'bg-white dark:bg-[#182847] text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Sensors
          </button>
          <button
            id="diag-tab-system"
            onClick={() => setActiveTab('system')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              activeTab === 'system'
                ? 'bg-white dark:bg-[#182847] text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            System
          </button>
        </div>
      </div>

      {activeTab === 'sensors' ? (
        <div className="space-y-2 pb-4 mt-2">
          {/* Sensors Checklist Card */}
          <div className="p-3.5 rounded-2xl bg-white dark:bg-[#0c1529] border border-slate-200 dark:border-[#182847] divide-y divide-slate-100 dark:divide-[#16233d] shadow-xs">
            {sensorList.map((sensor) => (
              <div
                key={sensor.name}
                className="flex items-center justify-between py-2 text-xs"
              >
                <div className="flex items-center space-x-2.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_6px_#10b981]" />
                  <span className="text-slate-800 dark:text-slate-200 font-medium">{sensor.name}</span>
                </div>
                <div className="flex items-center space-x-1 text-emerald-600 dark:text-emerald-400 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>{sensor.status}</span>
                </div>
              </div>
            ))}
          </div>

          {/* System Health Card */}
          <div className="p-4 rounded-2xl bg-white dark:bg-[#0c1529] border border-slate-200 dark:border-[#182847] shadow-xs flex items-center justify-between mt-3">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500 dark:border-emerald-400/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div>
                <span className="text-xs text-slate-900 dark:text-white font-bold block">System Health</span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">All systems operational</span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 dark:text-slate-500" />
          </div>
        </div>
      ) : (
        /* System Tab */
        <div className="space-y-3 pb-4 mt-2">
          <div className="p-4 rounded-2xl bg-white dark:bg-[#0c1529] border border-slate-200 dark:border-[#182847] shadow-xs">
            <div className="flex items-center space-x-2 text-cyan-600 dark:text-cyan-400 text-xs font-semibold mb-2">
              <Cpu className="w-4 h-4" />
              <span>VitalShell Jacket Controller Specs</span>
            </div>
            <div className="space-y-2.5 text-xs divide-y divide-slate-100 dark:divide-[#16233d]">
              {systemMetrics.map((m) => (
                <div key={m.label} className="flex justify-between py-2">
                  <span className="text-slate-500 dark:text-slate-400">{m.label}</span>
                  <span className="text-slate-900 dark:text-white font-semibold text-right">{m.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
