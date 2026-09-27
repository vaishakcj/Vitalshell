// Real Environmental Sensor Service: Live Local Climate (GPS) & Room Noise SPL (Microphone)
import { EnvironmentalData } from '../types';

export class EnvironmentSensorService {
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private mediaStream: MediaStream | null = null;
  private audioInterval: any = null;
  private isAudioRunning = false;

  // Real Local Weather via Browser Geolocation & Open-Meteo
  public async fetchRealClimate(): Promise<{
    success: boolean;
    data?: Partial<EnvironmentalData>;
    error?: string;
  }> {
    if (typeof navigator === 'undefined' || !('geolocation' in navigator)) {
      return { success: false, error: 'Geolocation is not supported in this browser.' };
    }

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            const res = await fetch(
              `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,surface_pressure,uv_index`
            );
            if (!res.ok) {
              throw new Error(`Weather API error: ${res.statusText}`);
            }
            const json = await res.json();
            const current = json.current;

            const temp = Number(current.temperature_2m.toFixed(1));
            const hum = Math.round(current.relative_humidity_2m);
            const press = Math.round(current.surface_pressure);
            const uv = Number((current.uv_index ?? 1.0).toFixed(1));

            // Compute safety score based on real environmental stress
            let safetyScore = 95;
            if (temp > 35 || temp < 5) safetyScore -= 20;
            else if (temp > 30 || temp < 15) safetyScore -= 8;

            if (hum > 85 || hum < 20) safetyScore -= 10;
            if (uv > 8) safetyScore -= 15;
            else if (uv > 6) safetyScore -= 8;

            const scoreLabel = safetyScore >= 80 ? 'Good' : safetyScore >= 60 ? 'Fair' : 'Hazardous';

            resolve({
              success: true,
              data: {
                temperature: temp,
                humidity: hum,
                pressure: press,
                uvIndex: uv,
                safetyScore: Math.max(10, Math.min(100, safetyScore)),
                scoreLabel,
              },
            });
          } catch (err: any) {
            resolve({
              success: false,
              error: err?.message || 'Failed to parse live meteorological data.',
            });
          }
        },
        (geoErr) => {
          resolve({
            success: false,
            error: geoErr.message || 'Location access denied or unavailable.',
          });
        },
        { timeout: 10000, enableHighAccuracy: false }
      );
    });
  }

  // Real Room Acoustic Decibel Meter via Web Audio API
  public async startAudioNoiseMeter(
    onNoiseSample: (db: number) => void
  ): Promise<{ success: boolean; error?: string }> {
    if (this.isAudioRunning) return { success: true };

    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      return { success: false, error: 'Microphone sensor access not supported in this browser.' };
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      this.mediaStream = stream;

      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      this.audioContext = ctx;

      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 512;
      analyser.smoothingTimeConstant = 0.4;
      source.connect(analyser);
      this.analyser = analyser;

      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      this.audioInterval = setInterval(() => {
        analyser.getByteTimeDomainData(dataArray);

        // Calculate Root Mean Square (RMS) of amplitude
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          const sample = (dataArray[i] - 128) / 128; // -1 to 1
          sum += sample * sample;
        }
        const rms = Math.sqrt(sum / dataArray.length);

        // Approximate decibel SPL (30dB quiet whisper to 95dB loud shouting)
        let db = Math.round(30 + rms * 140);
        db = Math.min(95, Math.max(32, db));

        onNoiseSample(db);
      }, 350);

      this.isAudioRunning = true;
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Microphone access denied.' };
    }
  }

  public stopAudioNoiseMeter(): void {
    if (this.audioInterval) {
      clearInterval(this.audioInterval);
      this.audioInterval = null;
    }
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => track.stop());
      this.mediaStream = null;
    }
    if (this.audioContext) {
      try {
        this.audioContext.close();
      } catch {}
      this.audioContext = null;
    }
    this.isAudioRunning = false;
  }

  public isAudioActive(): boolean {
    return this.isAudioRunning;
  }
}

export const environmentSensorService = new EnvironmentSensorService();
