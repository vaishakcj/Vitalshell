// Web Bluetooth (BLE) Service for real wearable connectivity (VitalShell Jacket, HR Monitors, Fitness Straps)

export interface BleDeviceStatus {
  supported: boolean;
  connected: boolean;
  deviceName: string | null;
  heartRate: number | null;
  hrv: number | null;
  battery: number | null;
  error: string | null;
}

type BleListener = (status: BleDeviceStatus) => void;

class BleManager {
  private device: any = null;
  private server: any = null;
  private hrCharacteristic: any = null;
  private batteryCharacteristic: any = null;
  private listeners: Set<BleListener> = new Set();
  private recentRrIntervals: number[] = [];

  private status: BleDeviceStatus = {
    supported: typeof navigator !== 'undefined' && 'bluetooth' in navigator,
    connected: false,
    deviceName: null,
    heartRate: null,
    hrv: null,
    battery: null,
    error: null,
  };

  public isSupported(): boolean {
    return typeof navigator !== 'undefined' && 'bluetooth' in navigator;
  }

  public getStatus(): BleDeviceStatus {
    return { ...this.status };
  }

  public subscribe(listener: BleListener): () => void {
    this.listeners.add(listener);
    listener(this.getStatus());
    return () => this.listeners.delete(listener);
  }

  private notify() {
    const s = this.getStatus();
    this.listeners.forEach((l) => l(s));
  }

  // Request & connect to real Bluetooth Heart Rate & Battery GATT services
  public async connect(): Promise<{ success: boolean; error?: string; deviceName?: string }> {
    if (!this.isSupported()) {
      const err = 'Web Bluetooth API is not supported on this browser. Try Chrome on Android, macOS, or Windows.';
      this.status.error = err;
      this.notify();
      return { success: false, error: err };
    }

    try {
      this.status.error = null;
      // Request device with standard Heart Rate service or VitalShell peripheral
      const device = await (navigator as any).bluetooth.requestDevice({
        filters: [
          { services: ['heart_rate'] },
          { namePrefix: 'VitalShell' },
          { namePrefix: 'Polar' },
          { namePrefix: 'Garmin' },
          { namePrefix: 'Wahoo' },
        ],
        optionalServices: ['battery_service', 'environmental_sensing'],
      });

      this.device = device;
      this.status.deviceName = device.name || 'Bluetooth Wearable';

      device.addEventListener('gattserverdisconnected', () => {
        this.status.connected = false;
        this.status.deviceName = null;
        this.notify();
      });

      // Connect to GATT
      const server = await device.gatt.connect();
      this.server = server;
      this.status.connected = true;
      this.notify();

      // Subscribe to Heart Rate Measurement (UUID: 0x180D / 0x2A37)
      try {
        const hrService = await server.getPrimaryService('heart_rate');
        const hrChar = await hrService.getCharacteristic('heart_rate_measurement');
        this.hrCharacteristic = hrChar;
        await hrChar.startNotifications();
        hrChar.addEventListener('characteristicvaluechanged', (event: any) => {
          this.parseHeartRateData(event.target.value);
        });
      } catch (hrErr) {
        console.warn('Heart rate service not accessible:', hrErr);
      }

      // Subscribe to Battery Service (UUID: 0x180F / 0x2A19)
      try {
        const batService = await server.getPrimaryService('battery_service');
        const batChar = await batService.getCharacteristic('battery_level');
        this.batteryCharacteristic = batChar;
        const batVal = await batChar.readValue();
        const batteryLevel = batVal.getUint8(0);
        this.status.battery = batteryLevel;
        await batChar.startNotifications();
        batChar.addEventListener('characteristicvaluechanged', (event: any) => {
          this.status.battery = event.target.value.getUint8(0);
          this.notify();
        });
      } catch (batErr) {
        console.warn('Battery service not accessible on peripheral:', batErr);
      }

      this.notify();
      return { success: true, deviceName: this.status.deviceName || 'Wearable' };
    } catch (err: any) {
      if (err.name === 'NotFoundError') {
        // User cancelled pairing dialog
        return { success: false, error: 'Pairing cancelled by user.' };
      }
      this.status.error = err.message || 'Bluetooth connection failed.';
      this.notify();
      return { success: false, error: this.status.error };
    }
  }

  public async disconnect(): Promise<void> {
    if (this.device && this.device.gatt.connected) {
      try {
        this.device.gatt.disconnect();
      } catch (err) {
        console.warn('Error disconnecting BLE device:', err);
      }
    }
    this.status.connected = false;
    this.status.deviceName = null;
    this.status.heartRate = null;
    this.status.hrv = null;
    this.notify();
  }

  // Parses standard Bluetooth GATT Heart Rate Measurement payload
  private parseHeartRateData(value: DataView) {
    if (!value || value.byteLength === 0) return;

    const flags = value.getUint8(0);
    const is16Bit = (flags & 0x01) !== 0;
    const rrIntervalPresent = (flags & 0x10) !== 0;

    let offset = 1;
    let heartRate = 0;

    if (is16Bit) {
      heartRate = value.getUint16(offset, true);
      offset += 2;
    } else {
      heartRate = value.getUint8(offset);
      offset += 1;
    }

    this.status.heartRate = heartRate;

    // Check for Energy Expended (bit 3)
    if ((flags & 0x08) !== 0) {
      offset += 2;
    }

    // RR-Intervals for real-time HRV (RMSSD calculation)
    if (rrIntervalPresent && offset + 1 < value.byteLength) {
      const rrRaw = value.getUint16(offset, true);
      const rrMs = Math.round((rrRaw / 1024) * 1000); // 1/1024 sec to ms

      this.recentRrIntervals.push(rrMs);
      if (this.recentRrIntervals.length > 10) {
        this.recentRrIntervals.shift();
      }

      // Calculate RMSSD if at least 2 RR intervals exist
      if (this.recentRrIntervals.length >= 2) {
        let sumSquaredDiffs = 0;
        for (let i = 1; i < this.recentRrIntervals.length; i++) {
          const diff = this.recentRrIntervals[i] - this.recentRrIntervals[i - 1];
          sumSquaredDiffs += diff * diff;
        }
        const rmssd = Math.round(Math.sqrt(sumSquaredDiffs / (this.recentRrIntervals.length - 1)));
        this.status.hrv = rmssd;
      }
    }

    this.notify();
  }
}

export const bleManager = new BleManager();
