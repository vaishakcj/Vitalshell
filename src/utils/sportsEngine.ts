import {
  SportType,
  SportsSessionState,
  SensorVitals,
  BiomechanicalData,
  EnvironmentalData,
  RiskFusionState,
  SafetyLevel,
} from '../types';

export interface HeartRateZoneInfo {
  zone: 1 | 2 | 3 | 4 | 5;
  name: 'Warm Up' | 'Fat Burn' | 'Aerobic' | 'Threshold' | 'Peak';
  minBpm: number;
  maxBpm: number;
  color: string;
  bgLight: string;
  borderClass: string;
  textClass: string;
  badgeClass: string;
  description: string;
}

export const HR_ZONES: HeartRateZoneInfo[] = [
  {
    zone: 1,
    name: 'Warm Up',
    minBpm: 90,
    maxBpm: 114,
    color: '#06b6d4', // cyan
    bgLight: 'bg-cyan-500/15',
    borderClass: 'border-cyan-500/40',
    textClass: 'text-cyan-600 dark:text-cyan-400',
    badgeClass: 'bg-cyan-500 text-white',
    description: 'Active recovery, warm up & joint preparation (50-60% Max HR)',
  },
  {
    zone: 2,
    name: 'Fat Burn',
    minBpm: 115,
    maxBpm: 133,
    color: '#10b981', // emerald
    bgLight: 'bg-emerald-500/15',
    borderClass: 'border-emerald-500/40',
    textClass: 'text-emerald-600 dark:text-emerald-400',
    badgeClass: 'bg-emerald-500 text-white',
    description: 'Building aerobic base & metabolic efficiency (60-70% Max HR)',
  },
  {
    zone: 3,
    name: 'Aerobic',
    minBpm: 134,
    maxBpm: 152,
    color: '#0284c7', // blue/sky
    bgLight: 'bg-sky-500/15',
    borderClass: 'border-sky-500/40',
    textClass: 'text-sky-600 dark:text-sky-400',
    badgeClass: 'bg-sky-500 text-white',
    description: 'Cardiovascular endurance & stamina building (70-80% Max HR)',
  },
  {
    zone: 4,
    name: 'Threshold',
    minBpm: 153,
    maxBpm: 171,
    color: '#f59e0b', // amber
    bgLight: 'bg-amber-500/15',
    borderClass: 'border-amber-500/40',
    textClass: 'text-amber-600 dark:text-amber-400',
    badgeClass: 'bg-amber-500 text-white',
    description: 'Anaerobic lactate threshold & high tempo performance (80-90% Max HR)',
  },
  {
    zone: 5,
    name: 'Peak',
    minBpm: 172,
    maxBpm: 195,
    color: '#f43f5e', // rose
    bgLight: 'bg-rose-500/15',
    borderClass: 'border-rose-500/40',
    textClass: 'text-rose-600 dark:text-rose-400',
    badgeClass: 'bg-rose-500 text-white',
    description: 'Maximal effort, sprint capacity & neuromuscular power (90-100% Max HR)',
  },
];

export function getHeartRateZone(heartRate: number): HeartRateZoneInfo {
  if (heartRate < 115) return HR_ZONES[0];
  if (heartRate < 134) return HR_ZONES[1];
  if (heartRate < 153) return HR_ZONES[2];
  if (heartRate < 172) return HR_ZONES[3];
  return HR_ZONES[4];
}

export const SPORT_PROFILES: Record<
  SportType,
  {
    label: string;
    targetHrMin: number;
    targetHrMax: number;
    targetCadenceMin: number;
    targetCadenceMax: number;
    cadenceUnit: string;
    defaultPosture: 'Running' | 'Sitting' | 'Standing' | 'Walking';
    calPerSec: number;
    description: string;
  }
> = {
  Running: {
    label: 'Outdoor Run',
    targetHrMin: 146,
    targetHrMax: 164,
    targetCadenceMin: 156,
    targetCadenceMax: 174,
    cadenceUnit: 'spm',
    defaultPosture: 'Running',
    calPerSec: 0.22, // ~13.2 kcal/min
    description: 'Stride cadence analysis, impact shock absorption & cardio tracking',
  },
  Cycling: {
    label: 'Road Cycling',
    targetHrMin: 136,
    targetHrMax: 154,
    targetCadenceMin: 80,
    targetCadenceMax: 96,
    cadenceUnit: 'rpm',
    defaultPosture: 'Sitting',
    calPerSec: 0.18, // ~10.8 kcal/min
    description: 'Pedal cadence, torso aerodynamic tilt & aerobic endurance',
  },
  HIIT: {
    label: 'HIIT & Intervals',
    targetHrMin: 158,
    targetHrMax: 176,
    targetCadenceMin: 110,
    targetCadenceMax: 140,
    cadenceUnit: 'rpm',
    defaultPosture: 'Standing',
    calPerSec: 0.25, // ~15 kcal/min
    description: 'Burst heart rate spikes, rapid recovery velocity & dynamic G-loads',
  },
  'General Fitness': {
    label: 'General Fitness',
    targetHrMin: 122,
    targetHrMax: 140,
    targetCadenceMin: 98,
    targetCadenceMax: 118,
    cadenceUnit: 'spm',
    defaultPosture: 'Walking',
    calPerSec: 0.14, // ~8.4 kcal/min
    description: 'Aerobic heart rate maintenance, active posture & calorie burn',
  },
};

export const INITIAL_SPORTS_SESSION: SportsSessionState = {
  active: false,
  paused: false,
  sportType: 'Running',
  elapsedSeconds: 0,
  caloriesBurned: 0,
  cadence: 162,
  peakHeartRate: 78,
  averageHeartRate: 78,
  activeZone: 3,
  zoneName: 'Aerobic',
  highPrecisionSampling: true,
  adaptiveShockFilter: true,
};

export function formatSportsDuration(seconds: number): string {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hrs > 0) {
    return `${hrs.toString().padStart(2, '0')}:${mins
      .toString()
      .padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Optimizes the multi-sensor risk model for athletic exertion:
 * In athletic mode, high heart rate (130-170 bpm), elevated respiration (25-34 bpm),
 * and high motion G-forces are normal indicators of high fitness output, not pathologies.
 */
export function calculateSportsOptimizedRiskFusion(
  vitals: SensorVitals,
  biomech: BiomechanicalData,
  enviro: EnvironmentalData,
  isSportsMode: boolean
): RiskFusionState {
  if (!isSportsMode) {
    // Standard daily monitoring calculation
    return calculateStandardRisk(vitals, biomech, enviro);
  }

  // Sports Mode: Calibrated for athletic exertion
  let physioRisk = 0;
  let biomechRisk = 0;
  let enviroRisk = 0;

  // Athletic physiological thresholds
  if (vitals.heartRate > 185) {
    // Extreme cardiovascular strain
    physioRisk += 45;
  } else if (vitals.heartRate > 175) {
    // Near maximum effort
    physioRisk += 15;
  } else {
    // 120-175 bpm is optimal training range in sports mode
    physioRisk += 2;
  }

  // SpO2 during heavy exertion
  if (vitals.spo2 < 90) {
    physioRisk += 50;
  } else if (vitals.spo2 < 93) {
    physioRisk += 20;
  }

  // Athletic heat accumulation
  if (vitals.skinTemp > 38.8) {
    physioRisk += 35; // Potential heat exhaustion
  } else if (vitals.skinTemp > 38.0) {
    physioRisk += 10;
  }

  // Biomechanical athletic shock & fall evaluation
  // Athletic strides generate ~2.0-3.5G impacts which should be absorbed by adaptive shock filter
  if (biomech.fallDetected) {
    biomechRisk += 80;
  } else if (biomech.posture === 'Lying Down' && vitals.heartRate > 140) {
    // Athlete collapsed with high heart rate
    biomechRisk += 70;
  } else {
    // Athletic movement is healthy
    biomechRisk += 2;
  }

  // Environment during outdoor sports
  if (enviro.temperature > 38) {
    enviroRisk += 25; // Heat stress risk during sports
  } else if (enviro.temperature < 0) {
    enviroRisk += 20; // Freezing exposure
  }

  if (enviro.uvIndex > 8) {
    enviroRisk += 15;
  }

  const total = Math.min(
    100,
    Math.round(physioRisk * 0.5 + biomechRisk * 0.35 + enviroRisk * 0.15)
  );

  let state: SafetyLevel = 'NORMAL';
  let description = 'Sports Mode: Exertion parameters optimal for athletic training.';

  if (total >= 75 || biomech.fallDetected) {
    state = 'CRITICAL';
    description = biomech.fallDetected
      ? 'CRITICAL: Impact or sudden deceleration detected during workout!'
      : 'CRITICAL: Extreme physiological overstrain during workout.';
  } else if (total >= 45) {
    state = 'WARNING';
    description = 'High cardiovascular or heat stress during workout. Consider pacing down.';
  } else if (total >= 22) {
    state = 'CAUTION';
    description = 'High intensity exertion zone active. Hydration recommended.';
  }

  return {
    score: total,
    state,
    description,
    physioContribution: Math.round(physioRisk * 0.5),
    biomechContribution: Math.round(biomechRisk * 0.35),
    enviroContribution: Math.round(enviroRisk * 0.15),
  };
}

function calculateStandardRisk(
  vitals: SensorVitals,
  biomech: BiomechanicalData,
  enviro: EnvironmentalData
): RiskFusionState {
  let physio = 0;
  let biomechScore = 0;
  let enviroScore = 0;

  if (vitals.heartRate > 120 || vitals.heartRate < 45) physio += 40;
  else if (vitals.heartRate > 100 || vitals.heartRate < 55) physio += 20;

  if (vitals.spo2 < 90) physio += 50;
  else if (vitals.spo2 < 94) physio += 20;

  if (biomech.fallDetected) biomechScore += 85;
  else if (biomech.posture === 'Lying Down') biomechScore += 25;

  if (enviro.gasLevel > 70) enviroScore += 45;
  else if (enviro.gasLevel > 35) enviroScore += 20;

  const total = Math.min(
    100,
    Math.round(physio * 0.45 + biomechScore * 0.35 + enviroScore * 0.2)
  );

  let state: SafetyLevel = 'NORMAL';
  let description = 'Contextual analysis shows no significant risk factors.';

  if (total >= 76) {
    state = 'CRITICAL';
    description = 'Immediate hazard detected! Extreme physiological or biomechanical risk.';
  } else if (total >= 51) {
    state = 'WARNING';
    description = 'Multiple elevated indicators requiring prompt user awareness.';
  } else if (total >= 26) {
    state = 'CAUTION';
    description = 'Mild physiological or environmental anomaly observed.';
  }

  return {
    score: total,
    state,
    description,
    physioContribution: Math.round(physio * 0.45),
    biomechContribution: Math.round(biomechScore * 0.35),
    enviroContribution: Math.round(enviroScore * 0.2),
  };
}
