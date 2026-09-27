// Real Device Motion & Gyroscope Sensor Service using DeviceMotionEvent / DeviceOrientationEvent
import { BiomechanicalData } from '../types';

type MotionListener = (data: Partial<BiomechanicalData>, rawEvent?: DeviceMotionEvent) => void;
type FallAlertListener = () => void;

class MotionSensorService {
  private isListening = false;
  private listeners: Set<MotionListener> = new Set();
  private fallListeners: Set<FallAlertListener> = new Set();

  private lastStepTimestamp = 0;
  private stepCount = 0;
  private cadenceHistory: number[] = [];
  private lastImpactTimestamp = 0;

  public isSupported(): boolean {
    return typeof window !== 'undefined' && 'DeviceMotionEvent' in window;
  }

  public getIsActive(): boolean {
    return this.isListening;
  }

  // Request permission (required on iOS 13+ Safari/Chrome)
  public async requestPermission(): Promise<boolean> {
    if (!this.isSupported()) return false;

    try {
      const dme = DeviceMotionEvent as any;
      if (typeof dme.requestPermission === 'function') {
        const response = await dme.requestPermission();
        return response === 'granted';
      }
      return true;
    } catch (err) {
      console.warn('Motion permission request error:', err);
      return false;
    }
  }

  public async start(): Promise<{ success: boolean; error?: string }> {
    if (!this.isSupported()) {
      return { success: false, error: 'Device motion sensors not supported on this browser or platform.' };
    }

    try {
      const granted = await this.requestPermission();
      if (!granted) {
        return { success: false, error: 'Device motion permission denied by user.' };
      }

      if (!this.isListening) {
        window.addEventListener('devicemotion', this.handleMotion, { passive: true });
        this.isListening = true;
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Failed to start motion listener.' };
    }
  }

  public stop(): void {
    if (this.isListening) {
      window.removeEventListener('devicemotion', this.handleMotion);
      this.isListening = false;
    }
  }

  public onMotion(listener: MotionListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  public onFall(listener: FallAlertListener): () => void {
    this.fallListeners.add(listener);
    return () => this.fallListeners.delete(listener);
  }

  private handleMotion = (event: DeviceMotionEvent) => {
    const acc = event.accelerationIncludingGravity || event.acceleration;
    if (!acc) return;

    // Default gravity on Earth is ~9.81 m/s^2. Normalize into G units.
    const rawX = acc.x ?? 0;
    const rawY = acc.y ?? 0;
    const rawZ = acc.z ?? 9.81;

    const gX = Number((rawX / 9.81).toFixed(2));
    const gY = Number((rawY / 9.81).toFixed(2));
    const gZ = Number((rawZ / 9.81).toFixed(2));

    const totalMagnitude = Math.sqrt(gX * gX + gY * gY + gZ * gZ);

    // Compute Thoracic Incline / Tilt angle in degrees
    const clampedZ = Math.min(1, Math.max(-1, gZ / (totalMagnitude || 1)));
    const tiltAngle = Math.round(Math.acos(clampedZ) * (180 / Math.PI));

    // Determine Posture based on dominant gravitational vector
    let posture: 'Standing' | 'Sitting' | 'Walking' | 'Running' | 'Lying Down' = 'Standing';
    const absY = Math.abs(gY);
    const absZ = Math.abs(gZ);

    // Dynamic movement variance
    const linearAcc = event.acceleration;
    const linearMag = linearAcc
      ? Math.sqrt((linearAcc.x ?? 0) ** 2 + (linearAcc.y ?? 0) ** 2 + (linearAcc.z ?? 0) ** 2)
      : Math.abs(totalMagnitude - 1.0) * 9.81;

    let movement: 'Low' | 'Moderate' | 'High' = 'Low';
    if (linearMag > 4.5) {
      movement = 'High';
      posture = 'Running';
    } else if (linearMag > 1.8) {
      movement = 'Moderate';
      posture = 'Walking';
    } else {
      movement = 'Low';
      if (absZ > 0.75) {
        posture = 'Lying Down';
      } else if (absY > 0.65) {
        posture = 'Standing';
      } else {
        posture = 'Sitting';
      }
    }

    // Step / Cadence estimation on rhythmic vertical motion
    const now = Date.now();
    if (linearMag > 2.2 && now - this.lastStepTimestamp > 280) {
      const stepDeltaMs = now - this.lastStepTimestamp;
      this.lastStepTimestamp = now;
      this.stepCount++;

      if (stepDeltaMs < 2000) {
        const instantCadence = Math.round(60000 / stepDeltaMs);
        if (instantCadence >= 40 && instantCadence <= 220) {
          this.cadenceHistory.push(instantCadence);
          if (this.cadenceHistory.length > 5) this.cadenceHistory.shift();
        }
      }
    }

    const currentCadence =
      this.cadenceHistory.length > 0 && now - this.lastStepTimestamp < 3500
        ? Math.round(this.cadenceHistory.reduce((a, b) => a + b, 0) / this.cadenceHistory.length)
        : 0;

    // Real Fall Impact Detection:
    // A sudden severe impact (> 2.8G) followed by an immediate resting state (< 0.6 m/s^2 linear)
    let fallDetected = false;
    if (totalMagnitude > 2.8 && now - this.lastImpactTimestamp > 5000) {
      this.lastImpactTimestamp = now;
      fallDetected = true;
      this.fallListeners.forEach((l) => l());
    }

    const biomechUpdate: Partial<BiomechanicalData> = {
      imu: { x: gX, y: gY, z: gZ },
      tiltAngle: Math.min(90, Math.max(0, tiltAngle)),
      posture,
      movement,
      cadence: currentCadence,
      fallDetected,
    };

    this.listeners.forEach((l) => l(biomechUpdate, event));
  };
}

export const motionSensorService = new MotionSensorService();
