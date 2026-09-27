import React, { useState } from 'react';
import {
  Compass,
  Activity,
  Shield,
  ChevronRight,
  Info,
  Footprints,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { BiomechanicalData, SportsSessionState } from '../../types';
import { ScreenHeader } from '../common/ScreenHeader';

interface BiomechanicalScreenProps {
  biomech: BiomechanicalData;
  onBack: () => void;
  onPerformImpactDrill?: () => void;
  sportsSession?: SportsSessionState;
}

export const BiomechanicalScreen: React.FC<BiomechanicalScreenProps> = ({
  biomech,
  onBack,
  onPerformImpactDrill,
  sportsSession,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'details'>('overview');

  return (
    <div className="w-full flex-1 flex flex-col px-4 py-2 overflow-y-auto select-none">
      <ScreenHeader title="Biomechanical" onBack={onBack} />

      {/* Sports Mode IMU Filter Active Banner */}
      {sportsSession?.active && (
        <div className="mb-3 p-3 rounded-2xl bg-teal-500/10 dark:bg-teal-950/30 border border-teal-500/30 text-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
              <span className="font-bold text-slate-900 dark:text-white">
                Athletic IMU Filter Active ({sportsSession.sportType})
              </span>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-500/20 text-teal-600 dark:text-teal-400">
              Shock Dampening
            </span>
          </div>
          <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1.5 leading-relaxed">
            Foot-strike impact dynamics (2.0–3.5G) are dynamically filtered to prevent false fall alerts during athletic movement.
          </p>
        </div>
      )}

      {/* Overview | Details Tabs */}
      <div className="flex justify-center my-2">
        <div className="flex p-1 bg-slate-100 dark:bg-[#0b1325] rounded-xl border border-slate-200 dark:border-[#16233d] w-full max-w-[280px]">
          <button
            id="biomech-tab-overview"
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
            id="biomech-tab-details"
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
          {/* Sports Cadence & Rhythm Card (if active) */}
          {sportsSession?.active && (
            <div className="p-4 rounded-2xl bg-white dark:bg-[#0c1529] border border-slate-200 dark:border-[#182847] shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-xl bg-teal-500/15 flex items-center justify-center text-teal-600 dark:text-teal-400">
                    <Footprints className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {sportsSession.sportType === 'Cycling' ? 'Pedal Cadence' : 'Stride Cadence'}
                    </span>
                    <span className="block text-[10px] text-slate-500 dark:text-slate-400">
                      Real-time IMU step frequency
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-lg font-extrabold text-teal-600 dark:text-teal-400 font-mono">
                    {sportsSession.cadence}{' '}
                    <span className="text-xs font-normal text-slate-500 dark:text-slate-400">
                      {sportsSession.sportType === 'Cycling' ? 'rpm' : 'spm'}
                    </span>
                  </span>
                  <span className="block text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                    Optimal Rhythm (98%)
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Posture Card with Holographic Human Silhouette */}
          <div className="p-4 rounded-2xl bg-white dark:bg-[#0c1529] border border-slate-200 dark:border-[#182847] shadow-xs flex items-center justify-between">
            {/* Holographic Body Visual */}
            <div className="relative w-28 h-36 flex items-center justify-center">
              {/* Radial glow */}
              <div className="absolute inset-0 bg-cyan-500/15 rounded-full blur-md" />

              {/* Glowing vector human figure */}
              <svg
                viewBox="0 0 100 160"
                className="w-full h-full drop-shadow-[0_0_10px_rgba(6,182,212,0.6)]"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Aura circles */}
                <ellipse cx="50" cy="80" rx="35" ry="65" stroke="#06b6d4" strokeWidth="0.75" strokeDasharray="3 3" opacity="0.4" />
                <circle cx="50" cy="80" r="42" stroke="#06b6d4" strokeWidth="0.5" opacity="0.2" />

                {/* Head */}
                <circle cx="50" cy="20" r="10" stroke="#22d3ee" strokeWidth="1.8" fill="#0c1529" />
                <circle cx="50" cy="20" r="3" fill="#22d3ee" className="animate-ping" />

                {/* Spine / Torso */}
                <line x1="50" y1="30" x2="50" y2="85" stroke="#22d3ee" strokeWidth="2.5" strokeLinecap="round" />
                {/* Biometric jacket sensor strip */}
                <line x1="50" y1="38" x2="50" y2="72" stroke="#34d399" strokeWidth="3.5" strokeLinecap="round" />

                {/* Shoulders & Arms */}
                <line x1="32" y1="42" x2="68" y2="42" stroke="#22d3ee" strokeWidth="2" strokeLinecap="round" />
                <line x1="32" y1="42" x2="26" y2="78" stroke="#22d3ee" strokeWidth="1.8" strokeLinecap="round" />
                <line x1="68" y1="42" x2="74" y2="78" stroke="#22d3ee" strokeWidth="1.8" strokeLinecap="round" />

                {/* Hands */}
                <circle cx="26" cy="82" r="2.5" fill="#38bdf8" />
                <circle cx="74" cy="82" r="2.5" fill="#38bdf8" />

                {/* Pelvis & Legs */}
                <line x1="38" y1="85" x2="62" y2="85" stroke="#22d3ee" strokeWidth="2" strokeLinecap="round" />
                <line x1="42" y1="85" x2="40" y2="140" stroke="#22d3ee" strokeWidth="2" strokeLinecap="round" />
                <line x1="58" y1="85" x2="60" y2="140" stroke="#22d3ee" strokeWidth="2" strokeLinecap="round" />

                {/* Feet */}
                <line x1="40" y1="140" x2="33" y2="142" stroke="#22d3ee" strokeWidth="2" strokeLinecap="round" />
                <line x1="60" y1="140" x2="67" y2="142" stroke="#22d3ee" strokeWidth="2" strokeLinecap="round" />

                {/* Joint tracking dots */}
                <circle cx="50" cy="55" r="2" fill="#10b981" />
                <circle cx="42" cy="110" r="2" fill="#22d3ee" />
                <circle cx="58" cy="110" r="2" fill="#22d3ee" />
              </svg>
            </div>

            {/* Posture Text */}
            <div className="flex-1 pl-4 flex flex-col justify-center">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Posture</span>
              <div className="flex items-center space-x-2 mt-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981]" />
                <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400 tracking-wide">
                  {biomech.posture}
                </span>
              </div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                Spine alignment within 3.8° nominal range.
              </span>
            </div>
          </div>

          {/* IMU Motion Card */}
          <div className="p-4 rounded-2xl bg-white dark:bg-[#0c1529] border border-slate-200 dark:border-[#182847] shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2 text-slate-700 dark:text-slate-300">
                <Compass className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                <span className="text-xs font-semibold">IMU Motion</span>
              </div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">6-DOF ACCEL</span>
            </div>

            {/* 3 Circular Axis Meters */}
            <div className="grid grid-cols-3 gap-2 text-center">
              {/* X */}
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#080e1c] border border-slate-200 dark:border-[#142038] flex flex-col items-center">
                <div className="flex items-center space-x-1 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                  <span className="w-3.5 h-3.5 rounded-full border border-cyan-500/50 flex items-center justify-center text-[9px] text-cyan-600 dark:text-cyan-400">
                    X
                  </span>
                  <span>g</span>
                </div>
                <span className="text-sm font-bold text-slate-900 dark:text-white mt-1.5 font-mono">
                  {biomech.imu.x.toFixed(2)} g
                </span>
              </div>

              {/* Y */}
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#080e1c] border border-slate-200 dark:border-[#142038] flex flex-col items-center">
                <div className="flex items-center space-x-1 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                  <span className="w-3.5 h-3.5 rounded-full border border-teal-500/50 flex items-center justify-center text-[9px] text-teal-600 dark:text-teal-400">
                    Y
                  </span>
                  <span>g</span>
                </div>
                <span className="text-sm font-bold text-slate-900 dark:text-white mt-1.5 font-mono">
                  {biomech.imu.y.toFixed(2)} g
                </span>
              </div>

              {/* Z */}
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#080e1c] border border-slate-200 dark:border-[#142038] flex flex-col items-center">
                <div className="flex items-center space-x-1 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                  <span className="w-3.5 h-3.5 rounded-full border border-blue-500/50 flex items-center justify-center text-[9px] text-blue-600 dark:text-blue-400">
                    Z
                  </span>
                  <span>g</span>
                </div>
                <span className="text-sm font-bold text-slate-900 dark:text-white mt-1.5 font-mono">
                  {biomech.imu.z.toFixed(2)} g
                </span>
              </div>
            </div>
          </div>

          {/* Movement Card */}
          <div className="p-3.5 rounded-2xl bg-white dark:bg-[#0c1529] border border-slate-200 dark:border-[#182847] shadow-xs flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-xl bg-blue-500/15 flex items-center justify-center text-blue-600 dark:text-blue-400">
                <Activity className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Movement</span>
                <div className="text-slate-900 dark:text-white text-sm font-bold">{biomech.movement}</div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </div>

          {/* Fall Detection Card */}
          <div className="p-3.5 rounded-2xl bg-white dark:bg-[#0c1529] border border-slate-200 dark:border-[#182847] shadow-xs flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                  biomech.fallDetected
                    ? 'bg-rose-500/20 text-rose-600 dark:text-rose-400'
                    : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                }`}
              >
                <Shield className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Fall Detection</span>
                <div className="flex items-center space-x-1.5 mt-0.5">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      biomech.fallDetected
                        ? 'bg-rose-500 shadow-[0_0_8px_#f43f5e]'
                        : 'bg-emerald-500 shadow-[0_0_8px_#10b981]'
                    }`}
                  />
                  <span
                    className={`text-xs font-bold ${
                      biomech.fallDetected ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
                    }`}
                  >
                    {biomech.fallDetected ? 'Fall Detected!' : 'No Fall Detected'}
                  </span>
                </div>
              </div>
            </div>

            {onPerformImpactDrill && (
              <button
                onClick={onPerformImpactDrill}
                className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-[10px] text-cyan-600 dark:text-cyan-400 border border-slate-200 dark:border-slate-700 cursor-pointer font-semibold"
                title="Perform safety drill verifying IMU deceleration and impact thresholds"
              >
                Impact Drill
              </button>
            )}
          </div>
        </div>
      ) : (
        /* Details Tab */
        <div className="space-y-3 pb-4 mt-2">
          <div className="p-4 rounded-2xl bg-white dark:bg-[#0c1529] border border-slate-200 dark:border-[#182847] shadow-xs">
            <div className="flex items-center space-x-2 text-cyan-600 dark:text-cyan-400 text-xs font-semibold mb-2">
              <Info className="w-4 h-4" />
              <span>Kinematic Gait & Posture Specs</span>
            </div>
            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-[#182847]">
                <span className="text-slate-500 dark:text-slate-400">Step Cadence</span>
                <span className="text-slate-900 dark:text-white font-semibold">{biomech.cadence} steps/min</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-[#182847]">
                <span className="text-slate-500 dark:text-slate-400">Thoracic Incline Angle</span>
                <span className="text-slate-900 dark:text-white font-semibold">{biomech.tiltAngle}° (Normal)</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-[#182847]">
                <span className="text-slate-500 dark:text-slate-400">Bilateral Gait Symmetry</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">98.4%</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-[#182847]">
                <span className="text-slate-500 dark:text-slate-400">Impact Shock Absorption</span>
                <span className="text-slate-900 dark:text-white font-semibold">0.42 kN (Safe)</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-500 dark:text-slate-400">IMU Sensor Drift</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">&lt; 0.02°/hr</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
