import {
  SensorVitals,
  BiomechanicalData,
  EnvironmentalData,
  RiskFusionState,
  ConnectivityState,
  AlertItem,
  EmergencyContact,
  SafetyLevel,
} from '../types';

export const INITIAL_VITALS: SensorVitals = {
  heartRate: 78,
  spo2: 98,
  respiration: 16,
  skinTemp: 36.5,
  bloodPressureSystolic: 120,
  bloodPressureDiastolic: 80,
  hrv: 64,
  meanArterialPressure: 93,
};

export const INITIAL_BIOMECHANICAL: BiomechanicalData = {
  posture: 'Standing',
  imu: {
    x: 0.12,
    y: 0.04,
    z: 0.98,
  },
  movement: 'Low',
  fallDetected: false,
  cadence: 0,
  tiltAngle: 3.8,
};

export const INITIAL_ENVIRONMENT: EnvironmentalData = {
  temperature: 28.4,
  humidity: 61,
  gasLevel: 12,
  noise: 54,
  safetyScore: 92,
  scoreLabel: 'Good',
  uvIndex: 1.2,
  pressure: 1013,
};

export const INITIAL_CONNECTIVITY: ConnectivityState = {
  connected: true,
  statusText: 'Connected',
  deviceName: 'VitalShell VS-01 Wearable',
  ipAddress: '192.168.1.105',
  signalStrength: 'Strong',
  signalBars: 4,
  latency: 18,
  lastPacketSec: 1,
  syncActive: 12,
  syncTotal: 12,
  endpoint: '192.168.1.105:8080',
  battery: 88,
  batteryCharging: false,
  bleConnected: false,
  deviceMotionActive: false,
  ambientWeatherActive: false,
  audioNoiseActive: false,
  realSensorActive: true,
};

export const INITIAL_ALERTS: AlertItem[] = [
  {
    id: 'alt-1',
    title: 'Fall Detected',
    source: 'IMU',
    time: '22:14',
    severity: 'critical',
    description: 'Sudden deceleration impact of 3.8g followed by prolonged inactivity.',
  },
  {
    id: 'alt-2',
    title: 'High Heart Rate',
    source: 'Heart Rate',
    time: '18:32',
    severity: 'elevated',
    description: 'Sustained heart rate above 140 bpm while in low movement state.',
  },
  {
    id: 'alt-3',
    title: 'Temperature Elevated',
    source: 'Skin Temp',
    time: '12:15',
    severity: 'resolved',
    description: 'Skin temperature exceeded 38.2 °C during midday thermal stress.',
  },
  {
    id: 'alt-4',
    title: 'Low SpO₂',
    source: 'SpO₂',
    time: '09:42',
    severity: 'resolved',
    description: 'Blood oxygen saturation dropped below 93% for 45 seconds.',
  },
  {
    id: 'alt-5',
    title: 'Movement Detected',
    source: 'IMU',
    time: '08:11',
    severity: 'resolved',
    description: 'Rapid transition from rest to high-intensity cadence.',
  },
];

export const INITIAL_CONTACTS: EmergencyContact[] = [
  {
    id: 'cnt-1',
    relation: 'Primary Contact',
    name: 'Mom',
    phone: '+91 98765 43210',
    avatarSeed: 'mom_avatar',
    notified: false,
    isPrimary: true,
  },
  {
    id: 'cnt-2',
    relation: 'Secondary Contact',
    name: 'Brother',
    phone: '+91 87654 32109',
    avatarSeed: 'brother_avatar',
    notified: false,
    isPrimary: false,
  },
];

/**
 * Calculates risk score (0 - 100) and Safety State from fused sensor inputs.
 * Follows the Master Prompt:
 * 0 - 25  -> NORMAL
 * 26 - 50 -> CAUTION
 * 51 - 75 -> WARNING
 * 76 - 100 -> CRITICAL
 */
export function calculateRiskFusion(
  vitals: SensorVitals,
  biomech: BiomechanicalData,
  enviro: EnvironmentalData
): RiskFusionState {
  let physioScore = 0;
  let biomechScore = 0;
  let enviroScore = 0;

  // 1. Physiological factor evaluation
  // HR normal 60-100
  if (vitals.heartRate > 140 || vitals.heartRate < 45) {
    physioScore += 40;
  } else if (vitals.heartRate > 105 || vitals.heartRate < 55) {
    physioScore += 18;
  } else {
    physioScore += 4;
  }

  // SpO2 normal >= 95
  if (vitals.spo2 < 90) {
    physioScore += 45;
  } else if (vitals.spo2 < 94) {
    physioScore += 22;
  } else {
    physioScore += 2;
  }

  // Respiration normal 12-20
  if (vitals.respiration > 30 || vitals.respiration < 8) {
    physioScore += 25;
  } else if (vitals.respiration > 22 || vitals.respiration < 10) {
    physioScore += 12;
  } else {
    physioScore += 3;
  }

  // Skin temp normal 35.5 - 37.5
  if (vitals.skinTemp > 39.0 || vitals.skinTemp < 34.0) {
    physioScore += 25;
  } else if (vitals.skinTemp > 37.8 || vitals.skinTemp < 35.0) {
    physioScore += 12;
  } else {
    physioScore += 2;
  }

  // 2. Biomechanical factor evaluation
  if (biomech.fallDetected) {
    biomechScore += 80;
  } else if (biomech.posture === 'Lying Down' && vitals.heartRate > 100) {
    biomechScore += 35;
  } else if (biomech.movement === 'High' && vitals.heartRate > 130) {
    biomechScore += 18;
  } else {
    biomechScore += 5;
  }

  // 3. Environmental factor evaluation
  // Temp normal 18 - 32
  if (enviro.temperature > 42 || enviro.temperature < 0) {
    enviroScore += 35;
  } else if (enviro.temperature > 34 || enviro.temperature < 10) {
    enviroScore += 16;
  } else {
    enviroScore += 4;
  }

  // Gas level normal < 25 PPM
  if (enviro.gasLevel > 70) {
    enviroScore += 45;
  } else if (enviro.gasLevel > 35) {
    enviroScore += 20;
  } else {
    enviroScore += 3;
  }

  // Noise level
  if (enviro.noise > 95) {
    enviroScore += 20;
  } else if (enviro.noise > 80) {
    enviroScore += 10;
  } else {
    enviroScore += 2;
  }

  // Weighted fusion calculation:
  // Physio 45%, Biomech 35%, Enviro 20%
  const total = Math.min(
    100,
    Math.round(
      physioScore * 0.45 +
      biomechScore * 0.35 +
      enviroScore * 0.20
    )
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
  } else {
    state = 'NORMAL';
    description = 'Contextual analysis shows no significant risk factors.';
  }

  return {
    score: total,
    state,
    description,
    physioContribution: Math.round(physioScore * 0.45),
    biomechContribution: Math.round(biomechScore * 0.35),
    enviroContribution: Math.round(enviroScore * 0.20),
  };
}
