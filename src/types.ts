export type ScreenId =
  | 'intro'
  | 'auth'
  | 'dashboard'
  | 'physiological'
  | 'biomechanical'
  | 'environment'
  | 'risk-fusion'
  | 'alerts'
  | 'history'
  | 'connectivity'
  | 'diagnostics'
  | 'emergency'
  | 'settings'
  | 'sports';

export type TabId = 'dashboard' | 'environment' | 'history' | 'alerts' | 'settings';

export type AlertSeverity = 'critical' | 'elevated' | 'resolved';

export interface AlertItem {
  id: string;
  title: string;
  source: string;
  time: string;
  severity: AlertSeverity;
  description: string;
  acknowledged?: boolean;
}

export type SafetyLevel = 'NORMAL' | 'CAUTION' | 'WARNING' | 'CRITICAL';

export interface SensorVitals {
  heartRate: number; // bpm
  spo2: number; // %
  respiration: number; // bpm
  skinTemp: number; // °C
  bloodPressureSystolic: number; // mmHg
  bloodPressureDiastolic: number; // mmHg
  hrv: number; // ms
  meanArterialPressure: number;
}

export interface BiomechanicalData {
  posture: 'Standing' | 'Sitting' | 'Walking' | 'Running' | 'Lying Down';
  imu: {
    x: number;
    y: number;
    z: number;
  };
  movement: 'Low' | 'Moderate' | 'High';
  fallDetected: boolean;
  cadence: number; // steps/min
  tiltAngle: number; // degrees
}

export interface EnvironmentalData {
  temperature: number; // °C
  humidity: number; // %
  gasLevel: number; // PPM
  noise: number; // dB
  safetyScore: number; // 0-100
  scoreLabel: 'Good' | 'Fair' | 'Hazardous';
  uvIndex: number;
  pressure: number; // hPa
}

export interface RiskFusionState {
  score: number; // 0-100
  state: SafetyLevel;
  description: string;
  physioContribution: number;
  biomechContribution: number;
  enviroContribution: number;
}

export interface ConnectivityState {
  connected: boolean;
  statusText: 'Connected' | 'Connecting' | 'Synchronizing' | 'Disconnected' | 'Error';
  deviceName: string;
  ipAddress: string;
  signalStrength: 'Strong' | 'Medium' | 'Weak';
  signalBars: number; // 1-4
  latency: number; // ms
  lastPacketSec: number;
  syncActive: number;
  syncTotal: number;
  endpoint: string;
  battery: number;
  batteryCharging?: boolean;
  bleConnected?: boolean;
  bleDeviceName?: string;
  deviceMotionActive?: boolean;
  ambientWeatherActive?: boolean;
  audioNoiseActive?: boolean;
  realSensorActive?: boolean;
}

export interface EmergencyContact {
  id: string;
  relation: string;
  name: string;
  phone: string;
  avatarSeed: string;
  notified: boolean;
  notifiedTime?: string;
  isPrimary?: boolean;
}

export type HistoryTimeRange = '1H' | '6H' | '24H' | '7D' | '30D';

export interface HistoryPoint {
  timeLabel: string;
  timestamp: number;
  heartRate: number;
  spo2: number;
  temperature: number;
  respiration: number;
  riskState: SafetyLevel;
}

export type SportType = 'Running' | 'Cycling' | 'HIIT' | 'General Fitness';

export interface SportsLap {
  lapNumber: number;
  splitDuration: number; // seconds
  elapsedSeconds: number;
  avgHeartRate: number;
  cadence: number;
}

export interface SportsSessionState {
  active: boolean;
  paused: boolean;
  sportType: SportType;
  elapsedSeconds: number;
  caloriesBurned: number;
  cadence: number; // steps/min or rpm
  peakHeartRate: number;
  averageHeartRate: number;
  activeZone: 1 | 2 | 3 | 4 | 5;
  zoneName: 'Warm Up' | 'Fat Burn' | 'Aerobic' | 'Threshold' | 'Peak';
  highPrecisionSampling: boolean; // 1Hz telemetry
  adaptiveShockFilter: boolean; // filtering athletic vibrations
  laps?: SportsLap[];
}
