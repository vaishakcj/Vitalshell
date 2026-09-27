import React, { useState } from 'react';
import {
  Heart,
  Droplets,
  Wind,
  Thermometer,
  Activity,
  Info,
  Flame,
  Zap,
} from 'lucide-react';
import { SensorVitals, SportsSessionState } from '../../types';
import { ScreenHeader } from '../common/ScreenHeader';
import { Sparkline } from '../common/Sparkline';
import { HR_ZONES, getHeartRateZone } from '../../utils/sportsEngine';

interface PhysiologicalScreenProps {
  vitals: SensorVitals;
  onBack: () => void;
  sportsSession?: SportsSessionState;
}

export const PhysiologicalScreen: React.FC<PhysiologicalScreenProps> = ({
  vitals,
  onBack,
  sportsSession,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'details'>('overview');

  const currentZone = getHeartRateZone(vitals.heartRate);

  // Realistic historical waveforms for each sparkline
  const hrWave = [74, 76, 75, 78, 81, 79, 77, 78, 80, 78];
  const spo2Wave = [98, 98, 97, 98, 99, 98, 98, 98, 97, 98];
  const respWave = [15, 16, 17, 16, 15, 16, 16, 17, 16, 16];
  const tempWave = [36.4, 36.4, 36.5, 36.5, 36.6, 36.5, 36.5, 36.5, 36.5, 36.5];
  const bpWave = [118, 120, 119, 122, 120, 121, 119, 120, 120, 120];

  return (
    <div className="w-full flex-1 flex flex-col px-4 py-2 overflow-y-auto select-none">
      <ScreenHeader title="Physiological" onBack={onBack} />

      {/* Overview | Details Pill Tab */}
      <div className="flex justify-center my-2">
        <div className="flex p-1 bg-slate-100 dark:bg-[#0b1325] rounded-xl border border-slate-200 dark:border-[#16233d] w-full max-w-[280px]">
          <button
            id="physio-tab-overview"
            onClick={() => setActiveTab('overview')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-white dark:bg-[#182847] text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Overview
          </button>
          <button
            id="physio-tab-details"
            onClick={() => setActiveTab('details')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              activeTab === 'details'
                ? 'bg-white dark:bg-[#182847] text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Details
          </button>
        </div>
      </div>

      {/* Sports Mode Banner */}
      {sportsSession?.active && (
        <div className="mb-3 p-3 rounded-2xl bg-gradient-to-r from-amber-500/15 via-rose-500/10 to-cyan-500/15 border border-amber-500/30 text-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Flame className="w-4 h-4 text-amber-500 animate-pulse" />
              <span className="font-bold text-slate-900 dark:text-white">
                Sports Mode Active: {sportsSession.sportType}
              </span>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-600 dark:text-amber-400">
              1Hz Real-Time
            </span>
          </div>
          <div className="flex items-center space-x-4 mt-2 text-[11px] text-slate-600 dark:text-slate-300">
            <span>Peak HR: <strong className="text-slate-900 dark:text-white">{sportsSession.peakHeartRate} bpm</strong></span>
            <span>Avg HR: <strong className="text-slate-900 dark:text-white">{sportsSession.averageHeartRate} bpm</strong></span>
            <span>Burn: <strong className="text-amber-600 dark:text-amber-400">{Math.round(sportsSession.caloriesBurned)} kcal</strong></span>
          </div>
        </div>
      )}

      {activeTab === 'overview' ? (
        <div className="space-y-2.5 pb-4 mt-2">
          {/* Heart Rate Zone Progress Bar (Active in Sports Mode or Expandable) */}
          {sportsSession?.active && (
            <div className="p-3.5 rounded-2xl bg-white dark:bg-[#0c1529] border border-slate-200 dark:border-[#182847] shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center space-x-1.5">
                  <Activity className="w-3.5 h-3.5 text-cyan-500" />
                  <span>Cardio Training Zones</span>
                </span>
                <span className="text-[11px] font-extrabold text-cyan-600 dark:text-cyan-400">
                  Zone {currentZone.zone} • {currentZone.name}
                </span>
              </div>

              {/* 5 Zone Bars */}
              <div className="grid grid-cols-5 gap-1.5 h-2.5 rounded-full overflow-hidden bg-slate-100 dark:bg-[#080e1a] p-0.5">
                {HR_ZONES.map((z) => {
                  const isActive = currentZone.zone === z.zone;
                  return (
                    <div
                      key={z.zone}
                      title={`${z.name} (${z.minBpm}-${z.maxBpm} bpm)`}
                      className={`h-full rounded-xs transition-all duration-300 ${
                        isActive
                          ? 'ring-2 ring-white dark:ring-cyan-300 scale-y-125'
                          : 'opacity-40'
                      }`}
                      style={{ backgroundColor: z.color }}
                    />
                  );
                })}
              </div>

              <div className="flex items-center justify-between mt-2 text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                <span>Z1: Warm Up ({HR_ZONES[0].minBpm}+)</span>
                <span>Z3: Aerobic ({HR_ZONES[2].minBpm}-{HR_ZONES[2].maxBpm})</span>
                <span>Z5: Peak ({HR_ZONES[4].minBpm}+)</span>
              </div>
            </div>
          )}

          {/* Heart Rate */}
          <div
            id="physio-card-hr"
            className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-white dark:bg-[#0c1529] border border-slate-200 dark:border-[#182847] shadow-xs"
          >
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-rose-500/15 flex items-center justify-center text-rose-500 dark:text-rose-400">
                <Heart className="w-5 h-5 fill-rose-500/20" />
              </div>
              <div>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Heart Rate</span>
                <div className="text-slate-900 dark:text-white text-base font-bold">
                  {vitals.heartRate}{' '}
                  <span className="text-xs font-normal text-slate-500 dark:text-slate-400">bpm</span>
                </div>
                <div className="flex items-center space-x-1.5 mt-0.5">
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      sportsSession?.active
                        ? 'bg-cyan-500 shadow-[0_0_6px_#06b6d4]'
                        : vitals.heartRate > 100
                        ? 'bg-amber-400'
                        : 'bg-emerald-500 shadow-[0_0_6px_#10b981]'
                    }`}
                  />
                  <span className="text-[10px] text-slate-600 dark:text-slate-300 font-medium">
                    {sportsSession?.active
                      ? `Zone ${currentZone.zone} • ${currentZone.name}`
                      : vitals.heartRate > 100
                      ? 'Elevated'
                      : 'Normal'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Sparkline data={hrWave} color={sportsSession?.active ? '#06b6d4' : '#10b981'} width={75} height={32} />
            </div>
          </div>

          {/* SpO2 */}
          <div
            id="physio-card-spo2"
            className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-white dark:bg-[#0c1529] border border-slate-200 dark:border-[#182847] shadow-xs"
          >
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-cyan-500/15 flex items-center justify-center text-cyan-600 dark:text-cyan-400">
                <Droplets className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">SpO₂</span>
                <div className="text-slate-900 dark:text-white text-base font-bold">
                  {vitals.spo2}{' '}
                  <span className="text-xs font-normal text-slate-500 dark:text-slate-400">%</span>
                </div>
                <div className="flex items-center space-x-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_#10b981]" />
                  <span className="text-[10px] text-slate-600 dark:text-slate-300 font-medium">Normal</span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Sparkline data={spo2Wave} color="#06b6d4" width={75} height={32} />
            </div>
          </div>

          {/* Respiration */}
          <div
            id="physio-card-respiration"
            className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-white dark:bg-[#0c1529] border border-slate-200 dark:border-[#182847] shadow-xs"
          >
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-teal-500/15 flex items-center justify-center text-teal-600 dark:text-teal-400">
                <Wind className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Respiration</span>
                <div className="text-slate-900 dark:text-white text-base font-bold">
                  {vitals.respiration}{' '}
                  <span className="text-xs font-normal text-slate-500 dark:text-slate-400">bpm</span>
                </div>
                <div className="flex items-center space-x-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_#10b981]" />
                  <span className="text-[10px] text-slate-600 dark:text-slate-300 font-medium">Normal</span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Sparkline data={respWave} color="#14b8a6" width={75} height={32} />
            </div>
          </div>

          {/* Skin Temperature */}
          <div
            id="physio-card-skin-temp"
            className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-white dark:bg-[#0c1529] border border-slate-200 dark:border-[#182847] shadow-xs"
          >
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/15 flex items-center justify-center text-amber-600 dark:text-amber-400">
                <Thermometer className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Skin Temperature</span>
                <div className="text-slate-900 dark:text-white text-base font-bold">
                  {vitals.skinTemp.toFixed(1)}{' '}
                  <span className="text-xs font-normal text-slate-500 dark:text-slate-400">°C</span>
                </div>
                <div className="flex items-center space-x-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_#10b981]" />
                  <span className="text-[10px] text-slate-600 dark:text-slate-300 font-medium">Normal</span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Sparkline data={tempWave} color="#3b82f6" width={75} height={32} />
            </div>
          </div>

          {/* Blood Pressure */}
          <div
            id="physio-card-bp"
            className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-white dark:bg-[#0c1529] border border-slate-200 dark:border-[#182847] shadow-xs"
          >
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-cyan-500/15 flex items-center justify-center text-cyan-600 dark:text-cyan-400">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Blood Pressure</span>
                <div className="text-slate-900 dark:text-white text-base font-bold">
                  {vitals.bloodPressureSystolic} / {vitals.bloodPressureDiastolic}{' '}
                  <span className="text-xs font-normal text-slate-500 dark:text-slate-400">mmHg</span>
                </div>
                <div className="flex items-center space-x-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_#10b981]" />
                  <span className="text-[10px] text-slate-600 dark:text-slate-300 font-medium">Normal</span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Sparkline data={bpWave} color="#06b6d4" width={75} height={32} />
            </div>
          </div>
        </div>
      ) : (
        /* Details Tab */
        <div className="space-y-3 pb-4 mt-2">
          <div className="p-4 rounded-2xl bg-white dark:bg-[#0c1529] border border-slate-200 dark:border-[#182847] shadow-xs">
            <div className="flex items-center space-x-2 text-cyan-600 dark:text-cyan-400 text-xs font-semibold mb-2">
              <Info className="w-4 h-4" />
              <span>Advanced Hemodynamics</span>
            </div>
            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-[#182847]">
                <span className="text-slate-500 dark:text-slate-400">Heart Rate Variability (HRV)</span>
                <span className="text-slate-900 dark:text-white font-semibold">{vitals.hrv} ms (Normal)</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-[#182847]">
                <span className="text-slate-500 dark:text-slate-400">Mean Arterial Pressure (MAP)</span>
                <span className="text-slate-900 dark:text-white font-semibold">{vitals.meanArterialPressure} mmHg</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-[#182847]">
                <span className="text-slate-500 dark:text-slate-400">Thoracic Bioimpedance</span>
                <span className="text-slate-900 dark:text-white font-semibold">24.2 Ω (Clear)</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-[#182847]">
                <span className="text-slate-500 dark:text-slate-400">Pulse Wave Transit Time</span>
                <span className="text-slate-900 dark:text-white font-semibold">182 ms</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-500 dark:text-slate-400">Sensor Signal Confidence</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">99.8% (Optimal)</span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-[#0c1529] border border-slate-200 dark:border-[#182847] shadow-xs">
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-3">24-Hour Range Summary</div>
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#080e1c] border border-slate-200 dark:border-[#142038]">
                <div className="text-[10px] text-slate-500 dark:text-slate-400">Resting HR</div>
                <div className="text-slate-900 dark:text-white font-bold mt-1">62 bpm</div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#080e1c] border border-slate-200 dark:border-[#142038]">
                <div className="text-[10px] text-slate-500 dark:text-slate-400">Peak HR</div>
                <div className="text-slate-900 dark:text-white font-bold mt-1">118 bpm</div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#080e1c] border border-slate-200 dark:border-[#142038]">
                <div className="text-[10px] text-slate-500 dark:text-slate-400">Avg SpO₂</div>
                <div className="text-slate-900 dark:text-white font-bold mt-1">98.2 %</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
