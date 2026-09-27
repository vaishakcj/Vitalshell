import { HistoryPoint, HistoryTimeRange } from '../types';

export function generateHistoryData(range: HistoryTimeRange): HistoryPoint[] {
  const configs: Record<HistoryTimeRange, { points: number; intervalMinutes: number; timeFormat: (d: Date) => string }> = {
    '1H': {
      points: 12,
      intervalMinutes: 5,
      timeFormat: (d) => `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`,
    },
    '6H': {
      points: 18,
      intervalMinutes: 20,
      timeFormat: (d) => `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`,
    },
    '24H': {
      points: 24,
      intervalMinutes: 60,
      timeFormat: (d) => `${d.getHours().toString().padStart(2, '0')}:00`,
    },
    '7D': {
      points: 14,
      intervalMinutes: 12 * 60,
      timeFormat: (d) => `${['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getDay()]}`,
    },
    '30D': {
      points: 30,
      intervalMinutes: 24 * 60,
      timeFormat: (d) => `${d.getDate()} ${['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][d.getMonth()]}`,
    },
  };

  const config = configs[range];
  const now = Date.now();
  const list: HistoryPoint[] = [];

  for (let i = config.points - 1; i >= 0; i--) {
    const timestamp = now - i * config.intervalMinutes * 60 * 1000;
    const date = new Date(timestamp);
    const progress = (config.points - 1 - i) / (config.points - 1);

    // Create realistic wave fluctuations matching the reference graph curves
    const hrBase = 76 + Math.sin(progress * Math.PI * 3.5) * 5 + Math.cos(progress * Math.PI * 2) * 3;
    const spo2Base = 98 - Math.abs(Math.sin(progress * Math.PI * 2)) * 1.5;
    const tempBase = 36.4 + Math.sin(progress * Math.PI * 2.8) * 0.4;
    const respBase = 16 + Math.cos(progress * Math.PI * 3.2) * 2;

    // A segment of elevated risk around 70% of the timeline matching the reference
    const isElevated = progress > 0.58 && progress < 0.78;
    const riskState = isElevated ? 'WARNING' : 'NORMAL';

    list.push({
      timeLabel: config.timeFormat(date),
      timestamp,
      heartRate: Math.round(isElevated ? hrBase + 12 : hrBase),
      spo2: Math.min(100, Math.max(94, Math.round(spo2Base))),
      temperature: Number((isElevated ? tempBase + 0.5 : tempBase).toFixed(1)),
      respiration: Math.round(isElevated ? respBase + 4 : respBase),
      riskState,
    });
  }

  return list;
}
