import React, { useState } from 'react';
import {
  Thermometer,
  Droplets,
  CloudSun,
  Volume2,
  Info,
} from 'lucide-react';
import { EnvironmentalData } from '../../types';
import { ScreenHeader } from '../common/ScreenHeader';

interface EnvironmentScreenProps {
  enviro: EnvironmentalData;
  onBack: () => void;
}

export const EnvironmentScreen: React.FC<EnvironmentScreenProps> = ({
  enviro,
  onBack,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'details'>('overview');

  // Calculate circular stroke dasharray for 92/100
  const circumference = 2 * Math.PI * 40;
  const strokeDashoffset = circumference - (enviro.safetyScore / 100) * circumference;

  return (
    <div className="w-full flex-1 flex flex-col px-4 py-2 overflow-y-auto select-none">
      <ScreenHeader title="Environment" onBack={onBack} />

      {/* Overview | Details Tabs */}
      <div className="flex justify-center my-2">
        <div className="flex p-1 bg-slate-100 dark:bg-[#0b1325] rounded-xl border border-slate-200 dark:border-[#16233d] w-full max-w-[280px]">
          <button
            id="enviro-tab-overview"
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
            id="enviro-tab-details"
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

      {activeTab === 'overview' ? (
        <div className="space-y-3 pb-4 mt-2">
          {/* 4 Sensor Cards (2x2 Grid) */}
          <div className="grid grid-cols-2 gap-2.5">
            {/* Temperature */}
            <div className="p-3.5 rounded-2xl bg-white dark:bg-[#0c1529] border border-slate-200 dark:border-[#182847] shadow-xs flex flex-col justify-between">
              <div className="flex items-center space-x-2 text-slate-500 dark:text-slate-400">
                <Thermometer className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                <span className="text-xs font-medium">Temperature</span>
              </div>
              <div className="mt-3">
                <span className="text-slate-900 dark:text-white text-lg font-bold tracking-tight">
                  {enviro.temperature.toFixed(1)}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-normal ml-1">°C</span>
              </div>
            </div>

            {/* Humidity */}
            <div className="p-3.5 rounded-2xl bg-white dark:bg-[#0c1529] border border-slate-200 dark:border-[#182847] shadow-xs flex flex-col justify-between">
              <div className="flex items-center space-x-2 text-slate-500 dark:text-slate-400">
                <Droplets className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                <span className="text-xs font-medium">Humidity</span>
              </div>
              <div className="mt-3">
                <span className="text-slate-900 dark:text-white text-lg font-bold tracking-tight">
                  {enviro.humidity}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-normal ml-1">%</span>
              </div>
            </div>

            {/* Gas Level */}
            <div className="p-3.5 rounded-2xl bg-white dark:bg-[#0c1529] border border-slate-200 dark:border-[#182847] shadow-xs flex flex-col justify-between">
              <div className="flex items-center space-x-2 text-slate-500 dark:text-slate-400">
                <CloudSun className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                <span className="text-xs font-medium">Gas Level</span>
              </div>
              <div className="mt-3">
                <span className="text-slate-900 dark:text-white text-lg font-bold tracking-tight">
                  {enviro.gasLevel}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-normal ml-1">PPM</span>
              </div>
            </div>

            {/* Noise */}
            <div className="p-3.5 rounded-2xl bg-white dark:bg-[#0c1529] border border-slate-200 dark:border-[#182847] shadow-xs flex flex-col justify-between">
              <div className="flex items-center space-x-2 text-slate-500 dark:text-slate-400">
                <Volume2 className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                <span className="text-xs font-medium">Noise</span>
              </div>
              <div className="mt-3">
                <span className="text-slate-900 dark:text-white text-lg font-bold tracking-tight">
                  {enviro.noise}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-normal ml-1">dB</span>
              </div>
            </div>
          </div>

          {/* Environmental Safety Score Card */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#0c1529] border border-slate-200 dark:border-[#182847] shadow-xs flex flex-col items-center justify-center text-center">
            <span className="text-xs text-slate-700 dark:text-slate-300 font-semibold tracking-wide mb-3">
              Environmental Safety Score
            </span>

            {/* Circular Progress Gauge */}
            <div className="relative w-28 h-28 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="currentColor"
                  className="text-slate-200 dark:text-[#16233d]"
                  strokeWidth="7"
                  fill="none"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="#10b981"
                  strokeWidth="7"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  fill="none"
                  className="transition-all duration-700 ease-out"
                />
              </svg>

              {/* Inside score text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                  {enviro.safetyScore}
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 -mt-0.5">/ 100</span>
              </div>
            </div>

            {/* Status Pill */}
            <div className="flex items-center space-x-1.5 mt-3">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{enviro.scoreLabel}</span>
            </div>

            {/* Descriptive subtext */}
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5">
              All values are within safe range.
            </p>
          </div>
        </div>
      ) : (
        /* Details Tab */
        <div className="space-y-3 pb-4 mt-2">
          <div className="p-4 rounded-2xl bg-white dark:bg-[#0c1529] border border-slate-200 dark:border-[#182847] shadow-xs">
            <div className="flex items-center space-x-2 text-cyan-600 dark:text-cyan-400 text-xs font-semibold mb-2">
              <Info className="w-4 h-4" />
              <span>Microclimate Telemetry</span>
            </div>
            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-[#182847]">
                <span className="text-slate-500 dark:text-slate-400">Air Quality Index (AQI)</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">28 (Excellent)</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-[#182847]">
                <span className="text-slate-500 dark:text-slate-400">Carbon Monoxide (CO)</span>
                <span className="text-slate-900 dark:text-white font-semibold">0.4 PPM</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-[#182847]">
                <span className="text-slate-500 dark:text-slate-400">UV Exposure Index</span>
                <span className="text-slate-900 dark:text-white font-semibold">1.2 (Low)</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-[#182847]">
                <span className="text-slate-500 dark:text-slate-400">Barometric Pressure</span>
                <span className="text-slate-900 dark:text-white font-semibold">{enviro.pressure} hPa</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-500 dark:text-slate-400">Thermal Comfort Index</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Optimal</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
