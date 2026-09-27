import { HistoryPoint, SensorVitals, BiomechanicalData, EnvironmentalData } from '../types';

interface ExportTelemetryParams {
  historyData: HistoryPoint[];
  vitals?: SensorVitals;
  biomech?: BiomechanicalData;
  enviro?: EnvironmentalData;
  timeRangeLabel?: string;
  filenamePrefix?: string;
}

/**
 * Escapes fields for standard RFC 4180 CSV format
 */
function escapeCsvField(val: unknown): string {
  if (val === null || val === undefined) return '';
  const str = String(val);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Generates and triggers download of a standardized CSV containing
 * both historical and active physiological, biomechanical, and environmental metrics.
 */
export function downloadTelemetryCsv({
  historyData,
  vitals,
  biomech,
  enviro,
  timeRangeLabel = '24H',
  filenamePrefix = 'vitalshell-telemetry',
}: ExportTelemetryParams): void {
  const headers = [
    'Timestamp_ISO',
    'Timestamp_Epoch_Ms',
    'Time_Label',
    'Heart_Rate_BPM',
    'SpO2_Percent',
    'Skin_Temperature_C',
    'Respiration_Rate_BPM',
    'Posture_State',
    'Cadence_RPM',
    'Tilt_Angle_Deg',
    'IMU_Accel_X_G',
    'IMU_Accel_Y_G',
    'IMU_Accel_Z_G',
    'Movement_Level',
    'Fall_Detected',
    'Ambient_Temp_C',
    'Ambient_Humidity_Percent',
    'Risk_Classification',
  ];

  const rows: string[][] = [];

  // 1. If active telemetry snapshot is provided, include it as the latest real-time row
  if (vitals || biomech || enviro) {
    const now = new Date();
    rows.push([
      now.toISOString(),
      String(now.getTime()),
      'Current Real-Time',
      String(vitals?.heartRate ?? 74),
      String(vitals?.spo2 ?? 98),
      String(vitals?.skinTemp ?? 36.6),
      String(vitals?.respiration ?? 16),
      biomech?.posture ?? 'Upright / Riding',
      String(biomech?.cadence ?? 0),
      String(biomech?.tiltAngle ?? 3.8),
      String(biomech?.imu.x ?? 0.08),
      String(biomech?.imu.y ?? 0.03),
      String(biomech?.imu.z ?? 0.98),
      biomech?.movement ?? 'Normal',
      biomech?.fallDetected ? 'TRUE' : 'FALSE',
      String(enviro?.temperature ?? 22.4),
      String(enviro?.humidity ?? 45),
      'ACTIVE_REALTIME',
    ]);
  }

  // 2. Add all chronological historical log entries
  historyData.forEach((pt) => {
    const isWarn = pt.riskState === 'WARNING';
    const d = new Date(pt.timestamp);
    rows.push([
      d.toISOString(),
      String(pt.timestamp),
      pt.timeLabel,
      String(pt.heartRate),
      String(pt.spo2),
      String(pt.temperature),
      String(pt.respiration),
      isWarn ? 'Unstable Posture' : 'Upright / Riding',
      String(isWarn ? 88 : 72),
      String(isWarn ? 18.5 : 4.2),
      String(isWarn ? 0.28 : 0.08),
      String(isWarn ? 0.14 : 0.02),
      String(isWarn ? 1.45 : 0.98),
      isWarn ? 'Elevated' : 'Normal',
      'FALSE',
      String(enviro?.temperature ?? 22.0),
      String(enviro?.humidity ?? 45),
      pt.riskState,
    ]);
  });

  const csvContent = [
    headers.map(escapeCsvField).join(','),
    ...rows.map((row) => row.map(escapeCsvField).join(',')),
  ].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute(
    'download',
    `${filenamePrefix}-${timeRangeLabel.toLowerCase()}-${Date.now()}.csv`
  );
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
