import React from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, Flame, ChevronRight, AlertTriangle, AlertOctagon } from 'lucide-react';
import { RiskFusionState, SportsSessionState, SensorVitals, ScreenId } from '../../types';
import { getHeartRateZone } from '../../utils/sportsEngine';
import { DotsRotationDial } from './DotsRotationDial';

interface WhoopSafetyDialProps {
  riskFusion: RiskFusionState;
  vitals: SensorVitals;
  sportsSession?: SportsSessionState;
  onNavigate: (screen: ScreenId) => void;
}

export const WhoopSafetyDial: React.FC<WhoopSafetyDialProps> = ({
  riskFusion,
  vitals,
  sportsSession,
  onNavigate,
}) => {
  const isSports = !!sportsSession?.active;
  const isNormal = riskFusion.state === 'NORMAL';
  const isCaution = riskFusion.state === 'CAUTION';
  const isWarning = riskFusion.state === 'WARNING';
  const isCritical = riskFusion.state === 'CRITICAL';

  // Palette definition according to state (matching dots rotation.webm visuals)
  const theme = React.useMemo(() => {
    if (isSports) {
      return {
        primary: '#06b6d4', // Cyan
        secondary: '#0891b2',
        glow: 'rgba(6, 182, 212, 0.5)',
        ringBg: 'border-cyan-500/30',
        textColor: 'text-cyan-600 dark:text-cyan-400',
        label: 'TRAINING ZONE',
        value: `ZONE ${getHeartRateZone(vitals.heartRate).zone} • ${getHeartRateZone(vitals.heartRate).name.toUpperCase()}`,
        subtext: `${sportsSession.sportType} exertion telemetry calibrated. Shock dampening active.`,
        gradientId: 'whoop-grad-sports',
      };
    }
    if (isCritical) {
      return {
        primary: '#f43f5e', // Rose
        secondary: '#e11d48',
        glow: 'rgba(244, 63, 94, 0.55)',
        ringBg: 'border-rose-500/30',
        textColor: 'text-rose-600 dark:text-rose-400',
        label: 'SAFETY STATE',
        value: riskFusion.state,
        subtext: riskFusion.description || 'Critical anomalies detected. Review biometrics.',
        gradientId: 'whoop-grad-critical',
      };
    }
    if (isWarning) {
      return {
        primary: '#f97316', // Orange
        secondary: '#ea580c',
        glow: 'rgba(249, 115, 22, 0.5)',
        ringBg: 'border-orange-500/30',
        textColor: 'text-orange-600 dark:text-orange-400',
        label: 'SAFETY STATE',
        value: riskFusion.state,
        subtext: riskFusion.description || 'Elevated physiological strain detected.',
        gradientId: 'whoop-grad-warning',
      };
    }
    if (isCaution) {
      return {
        primary: '#eab308', // Yellow
        secondary: '#ca8a04',
        glow: 'rgba(234, 179, 8, 0.45)',
        ringBg: 'border-yellow-500/30',
        textColor: 'text-yellow-600 dark:text-yellow-400',
        label: 'SAFETY STATE',
        value: riskFusion.state,
        subtext: riskFusion.description || 'Cautionary threshold variance noted.',
        gradientId: 'whoop-grad-caution',
      };
    }
    // NORMAL: Authentic glowing emerald/neon green matching dots rotation.webm
    return {
      primary: '#00f59b', // Neon emerald matching dots rotation.webm
      secondary: '#10b981',
      glow: 'rgba(0, 245, 155, 0.5)',
      ringBg: 'border-emerald-500/30',
      textColor: 'text-emerald-500 dark:text-emerald-400',
      label: 'SAFETY STATE',
      value: 'NORMAL',
      subtext: 'All parameters are within the safe range.',
      gradientId: 'whoop-grad-normal',
    };
  }, [isSports, isCritical, isWarning, isCaution, riskFusion, vitals.heartRate, sportsSession]);

  const handleClick = () => {
    onNavigate(isSports ? 'sports' : 'risk-fusion');
  };

  return (
    <div className="flex flex-col items-center justify-center my-auto py-1 sm:py-2 shrink-0 select-none">
      {/* Interactive Dial Trigger */}
      <button
        id="dashboard-safety-circle"
        onClick={handleClick}
        className="group relative w-56 h-56 sm:w-60 sm:h-60 flex items-center justify-center cursor-pointer transition focus:outline-hidden"
        title={
          isSports
            ? 'Click to inspect Sports Session & Training Zones'
            : 'Click to open Multi-Sensor Risk-Fusion Model'
        }
        aria-label={`Safety State: ${theme.value}`}
      >
        {/* Soft Ambient Radial Glow Backdrop */}
        <div
          className="absolute inset-4 rounded-full blur-2xl pointer-events-none opacity-30 dark:opacity-50 transition-opacity"
          style={{
            background: `radial-gradient(circle, ${theme.glow} 0%, transparent 70%)`,
          }}
        />

        {/* Concentric Dots Rotation Animation (dots rotation.webm) */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <DotsRotationDial
            color={theme.primary}
            secondaryColor={theme.secondary}
            glowColor={theme.glow}
            speed={isSports ? 1.4 : 1.0}
            size={230}
          />
        </div>

        {/* Central Safety State Card */}
        <motion.div
          animate={{
            scale: [1, 1.025, 1],
          }}
          transition={{
            duration: isSports ? 1.6 : 3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.96 }}
          className={`relative z-20 w-28 h-28 sm:w-30 sm:h-30 rounded-full border ${theme.ringBg} flex flex-col items-center justify-center bg-white/95 dark:bg-[#070e1c]/95 shadow-xl dark:shadow-2xl transition-all duration-300 backdrop-blur-md`}
          style={{
            boxShadow: `0 0 20px ${theme.glow}, inset 0 0 10px ${theme.glow}`,
          }}
        >
          {/* Subtle radial inner glow backdrop */}
          <div
            className="absolute inset-2 rounded-full opacity-20 dark:opacity-35 pointer-events-none"
            style={{
              background: `radial-gradient(circle, ${theme.primary} 0%, transparent 75%)`,
            }}
          />

          {/* Central Status Icon with Heartbeat / Respiration Pulse */}
          <motion.div
            animate={
              isSports
                ? { scale: [1, 1.15, 1] }
                : isCritical
                ? { scale: [1, 1.22, 1] }
                : { scale: [1, 1.08, 1] }
            }
            transition={{
              duration: isSports ? 0.75 : 1.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="relative z-10 mb-0.5"
          >
            {isSports ? (
              <Flame className="w-6 h-6 sm:w-7 sm:h-7 text-cyan-500 dark:text-cyan-400 fill-cyan-500/20 stroke-[2.2]" />
            ) : isCritical ? (
              <AlertOctagon className={`w-6 h-6 sm:w-7 sm:h-7 ${theme.textColor} stroke-[2.2]`} />
            ) : isWarning || isCaution ? (
              <AlertTriangle className={`w-6 h-6 sm:w-7 sm:h-7 ${theme.textColor} stroke-[2.2]`} />
            ) : (
              <ShieldCheck className={`w-6 h-6 sm:w-7 sm:h-7 ${theme.textColor} stroke-[2.2]`} />
            )}
          </motion.div>

          {/* Label */}
          <span className="relative z-10 text-[8.5px] sm:text-[9.5px] text-slate-500 dark:text-slate-400 font-bold tracking-[0.2em] uppercase">
            {theme.label}
          </span>

          {/* Main State Value */}
          <span
            className={`relative z-10 text-sm sm:text-base font-extrabold tracking-wide mt-0.5 text-center px-1 leading-tight ${theme.textColor}`}
          >
            {theme.value}
          </span>
        </motion.div>
      </button>

      {/* Dynamic Subtext */}
      <p className="text-slate-600 dark:text-slate-400 text-[11px] sm:text-xs text-center mt-2 max-w-[280px] font-medium leading-tight transition-colors">
        {theme.subtext}
      </p>

      {/* Action link */}
      <button
        id="whoop-subtext-link"
        onClick={handleClick}
        className="mt-1 text-[10px] sm:text-[11px] text-cyan-600 dark:text-cyan-400 font-semibold hover:underline flex items-center space-x-1 cursor-pointer transition-colors"
      >
        <span>{isSports ? 'Open Sports Workout Session' : 'View multi-sensor risk model'}</span>
        <ChevronRight className="w-3 h-3" />
      </button>
    </div>
  );
};
