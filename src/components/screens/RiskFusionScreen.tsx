import React, { useState } from 'react';
import {
  Heart,
  User,
  Leaf,
  ShieldCheck,
  ChevronRight,
  Info,
  Sliders,
} from 'lucide-react';
import {
  SensorVitals,
  BiomechanicalData,
  EnvironmentalData,
  RiskFusionState,
} from '../../types';
import { ScreenHeader } from '../common/ScreenHeader';
import { calculateRiskFusion } from '../../mock/sensorEngine';

interface RiskFusionScreenProps {
  vitals: SensorVitals;
  biomech: BiomechanicalData;
  enviro: EnvironmentalData;
  riskFusion: RiskFusionState;
  onUpdateState: (
    v: SensorVitals,
    b: BiomechanicalData,
    e: EnvironmentalData,
    rf: RiskFusionState
  ) => void;
  onBack: () => void;
}

export const RiskFusionScreen: React.FC<RiskFusionScreenProps> = ({
  vitals,
  biomech,
  enviro,
  riskFusion,
  onUpdateState,
  onBack,
}) => {
  const [showControls, setShowControls] = useState(false);

  const [sensitivityProfile, setSensitivityProfile] = useState<'standard' | 'exertion' | 'heat_watch' | 'lone_worker'>('standard');

  const handleSelectProfile = (profile: 'standard' | 'exertion' | 'heat_watch' | 'lone_worker') => {
    setSensitivityProfile(profile);
    // Recalculate fused score with operator sensitivity profile weighting
    let adjustedRf = calculateRiskFusion(vitals, biomech, enviro);
    if (profile === 'heat_watch') {
      adjustedRf = {
        ...adjustedRf,
        enviroContribution: Math.min(100, adjustedRf.enviroContribution * 1.3),
        score: Math.min(100, Math.round(adjustedRf.score * 1.15)),
      };
    } else if (profile === 'exertion') {
      adjustedRf = {
        ...adjustedRf,
        score: Math.max(0, Math.round(adjustedRf.score * 0.88)), // athletic tolerance
      };
    } else if (profile === 'lone_worker') {
      adjustedRf = {
        ...adjustedRf,
        biomechContribution: Math.min(100, adjustedRf.biomechContribution * 1.25),
      };
    }
    onUpdateState(vitals, biomech, enviro, adjustedRf);
  };

  // State colors
  const isCritical = riskFusion.state === 'CRITICAL';
  const isWarning = riskFusion.state === 'WARNING';
  const isCaution = riskFusion.state === 'CAUTION';

  let stateColor = 'text-emerald-400';
  let stateBorder = 'border-emerald-500/50';
  let stateBg = 'bg-emerald-500/15';

  if (isCritical) {
    stateColor = 'text-rose-400';
    stateBorder = 'border-rose-500/50';
    stateBg = 'bg-rose-500/15';
  } else if (isWarning) {
    stateColor = 'text-orange-400';
    stateBorder = 'border-orange-500/50';
    stateBg = 'bg-orange-500/15';
  } else if (isCaution) {
    stateColor = 'text-yellow-400';
    stateBorder = 'border-yellow-500/50';
    stateBg = 'bg-yellow-500/15';
  }

  return (
    <div className="w-full flex-1 flex flex-col px-4 py-2 overflow-y-auto select-none">
      <ScreenHeader
        title="Risk-Fusion Engine"
        onBack={onBack}
        rightAction={
          <button
            onClick={() => setShowControls(!showControls)}
            className="p-1.5 rounded-lg bg-slate-100 dark:bg-[#0e172a] border border-slate-200 dark:border-[#1d2d4d] text-cyan-600 dark:text-cyan-400 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
            title="Configure risk sensitivity profiles"
          >
            <Sliders className="w-4 h-4" />
          </button>
        }
      />

      {/* Interactive Risk Sensitivity Configuration Bar if toggled */}
      {showControls && (
        <div className="mb-3 p-3 rounded-2xl bg-white dark:bg-[#0d162b] border border-cyan-500/30 text-xs shadow-xs animate-fadeIn">
          <div className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-2 flex items-center justify-between">
            <span>Risk Sensitivity Profile:</span>
            <span className="text-[10px] text-cyan-600 dark:text-cyan-400 font-mono">Live Fused Math</span>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            <button
              onClick={() => handleSelectProfile('standard')}
              className={`px-2.5 py-1.5 rounded-xl text-[11px] font-medium transition cursor-pointer ${
                sensitivityProfile === 'standard'
                  ? 'bg-cyan-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-[#14203a] hover:bg-slate-200 dark:hover:bg-[#1a2b4e] text-slate-800 dark:text-slate-200'
              }`}
            >
              • Standard Duty
            </button>
            <button
              onClick={() => handleSelectProfile('exertion')}
              className={`px-2.5 py-1.5 rounded-xl text-[11px] font-medium transition cursor-pointer ${
                sensitivityProfile === 'exertion'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-[#14203a] hover:bg-slate-200 dark:hover:bg-[#1a2b4e] text-amber-600 dark:text-amber-300'
              }`}
            >
              • Athletic / Exertion
            </button>
            <button
              onClick={() => handleSelectProfile('heat_watch')}
              className={`px-2.5 py-1.5 rounded-xl text-[11px] font-medium transition cursor-pointer ${
                sensitivityProfile === 'heat_watch'
                  ? 'bg-orange-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-[#14203a] hover:bg-slate-200 dark:hover:bg-[#1a2b4e] text-orange-600 dark:text-orange-400'
              }`}
            >
              • Heat & Thermal Stress
            </button>
            <button
              onClick={() => handleSelectProfile('lone_worker')}
              className={`px-2.5 py-1.5 rounded-xl text-[11px] font-medium transition cursor-pointer ${
                sensitivityProfile === 'lone_worker'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-[#14203a] hover:bg-slate-200 dark:hover:bg-[#1a2b4e] text-rose-600 dark:text-rose-400'
              }`}
            >
              • Lone Worker / Decel
            </button>
          </div>
        </div>
      )}

      {/* Central Visual: 3 Converging Nodes -> RISK FUSION */}
      <div className="relative w-full py-4 flex items-center justify-center my-auto">
        <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center">
          {/* Ambient center glow */}
          <div className="absolute inset-0 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

          {/* SVG Connection Energy Lines */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 280 280">
            {/* Center is at (140, 150) */}
            {/* Top Node (Physiological): (140, 52) */}
            {/* Bottom Left Node (Biomechanical): (62, 205) */}
            {/* Bottom Right Node (Environmental): (218, 205) */}

            {/* Triangle boundary lines */}
            <polygon
              points="140,52 62,205 218,205"
              fill="none"
              stroke="#64748b"
              strokeOpacity="0.3"
              strokeWidth="2"
              strokeDasharray="4 4"
            />

            {/* Glowing convergence lines toward center */}
            <line
              x1="140"
              y1="52"
              x2="140"
              y2="145"
              stroke="#06b6d4"
              strokeWidth="2.5"
              strokeLinecap="round"
              className="animate-pulse"
            />
            <line
              x1="62"
              y1="205"
              x2="140"
              y2="145"
              stroke="#06b6d4"
              strokeWidth="2.5"
              strokeLinecap="round"
              className="animate-pulse"
            />
            <line
              x1="218"
              y1="205"
              x2="140"
              y2="145"
              stroke="#06b6d4"
              strokeWidth="2.5"
              strokeLinecap="round"
              className="animate-pulse"
            />

            {/* Pulsing energy particles along vectors */}
            <circle cx="140" cy="100" r="3" fill="#06b6d4" className="animate-ping" />
            <circle cx="100" cy="175" r="3" fill="#06b6d4" className="animate-ping" />
            <circle cx="180" cy="175" r="3" fill="#06b6d4" className="animate-ping" />
          </svg>

          {/* Top Node: Physiological */}
          <div className="absolute top-1 left-1/2 -translate-x-1/2 flex flex-col items-center z-10">
            <div className="w-14 h-14 rounded-full bg-white dark:bg-[#0d162a] border-2 border-cyan-500 dark:border-cyan-400/80 shadow-[0_0_15px_rgba(6,182,212,0.3)] flex items-center justify-center text-cyan-600 dark:text-cyan-300">
              <Heart className="w-6 h-6 fill-cyan-400/20" />
            </div>
            <span className="text-[10px] text-slate-700 dark:text-slate-300 font-semibold tracking-wider mt-1.5 uppercase">
              Physiological
            </span>
          </div>

          {/* Bottom Left Node: Biomechanical */}
          <div className="absolute bottom-2 left-1 flex flex-col items-center z-10">
            <div className="w-14 h-14 rounded-full bg-white dark:bg-[#0d162a] border-2 border-cyan-500 dark:border-cyan-400/80 shadow-[0_0_15px_rgba(6,182,212,0.3)] flex items-center justify-center text-cyan-600 dark:text-cyan-300">
              <User className="w-6 h-6" />
            </div>
            <span className="text-[10px] text-slate-700 dark:text-slate-300 font-semibold tracking-wider mt-1.5 uppercase">
              Biomechanical
            </span>
          </div>

          {/* Bottom Right Node: Environmental */}
          <div className="absolute bottom-2 right-1 flex flex-col items-center z-10">
            <div className="w-14 h-14 rounded-full bg-white dark:bg-[#0d162a] border-2 border-cyan-500 dark:border-cyan-400/80 shadow-[0_0_15px_rgba(6,182,212,0.3)] flex items-center justify-center text-cyan-600 dark:text-cyan-300">
              <Leaf className="w-6 h-6" />
            </div>
            <span className="text-[10px] text-slate-700 dark:text-slate-300 font-semibold tracking-wider mt-1.5 uppercase">
              Environmental
            </span>
          </div>

          {/* Center Convergence Core: RISK FUSION */}
          <div className="absolute top-[52%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-slate-900 dark:bg-[#091122] border-2 border-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.5)] flex flex-col items-center justify-center text-center p-1">
              <span className="text-[9px] font-bold text-white tracking-widest leading-tight">
                RISK
              </span>
              <span className="text-[9px] font-bold text-cyan-400 tracking-widest leading-tight">
                FUSION
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Cards Section */}
      <div className="space-y-2.5 pb-3">
        {/* Safety State Card */}
        <div className="p-3.5 rounded-2xl bg-white dark:bg-[#0c1529] border border-slate-200 dark:border-[#182847] shadow-xs flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div
              className={`w-9 h-9 rounded-xl ${stateBg} flex items-center justify-center ${stateColor}`}
            >
              <ShieldCheck className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Safety State</span>
              <div className={`text-base font-bold tracking-wide ${stateColor}`}>
                {riskFusion.state}
              </div>
            </div>
          </div>
        </div>

        {/* Risk Score Card */}
        <div className="p-3.5 rounded-2xl bg-white dark:bg-[#0c1529] border border-slate-200 dark:border-[#182847] shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Risk Score</span>
            <div className="text-slate-900 dark:text-white text-base font-bold mt-0.5">
              {riskFusion.score}{' '}
              <span className="text-xs font-normal text-slate-500 dark:text-slate-400">/ 100</span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </div>

        {/* Info Description Box */}
        <div className="p-3 rounded-2xl bg-white dark:bg-[#0c1529] border border-slate-200 dark:border-[#182847] shadow-xs flex items-start space-x-2.5 text-xs text-slate-600 dark:text-slate-400">
          <Info className="w-4 h-4 text-cyan-600 dark:text-cyan-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed">{riskFusion.description}</p>
        </div>
      </div>
    </div>
  );
};
