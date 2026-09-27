// Real Device Battery Service using Battery Status API (navigator.getBattery)

export interface RealBatteryState {
  supported: boolean;
  level: number; // 0 - 100
  charging: boolean;
}

type BatteryListener = (state: RealBatteryState) => void;

class DeviceBatteryService {
  private batteryManager: any = null;
  private listeners: Set<BatteryListener> = new Set();
  private state: RealBatteryState = {
    supported: false,
    level: 85,
    charging: false,
  };

  public async init(onUpdate?: BatteryListener): Promise<RealBatteryState> {
    if (onUpdate) {
      this.listeners.add(onUpdate);
    }

    if (typeof navigator !== 'undefined' && 'getBattery' in navigator) {
      try {
        const bm = await (navigator as any).getBattery();
        this.batteryManager = bm;
        this.state = {
          supported: true,
          level: Math.round(bm.level * 100),
          charging: bm.charging,
        };

        bm.addEventListener('levelchange', () => {
          this.state.level = Math.round(bm.level * 100);
          this.notify();
        });

        bm.addEventListener('chargingchange', () => {
          this.state.charging = bm.charging;
          this.notify();
        });
      } catch (err) {
        console.warn('Battery API error:', err);
      }
    }

    this.notify();
    return { ...this.state };
  }

  public getState(): RealBatteryState {
    return { ...this.state };
  }

  public subscribe(listener: BatteryListener): () => void {
    this.listeners.add(listener);
    listener(this.getState());
    return () => this.listeners.delete(listener);
  }

  private notify() {
    const s = this.getState();
    this.listeners.forEach((l) => l(s));
  }
}

export const deviceBatteryService = new DeviceBatteryService();
