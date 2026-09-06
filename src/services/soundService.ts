import { storageService } from './storageService';

class SoundService {
  private ctx: AudioContext | null = null;

  private init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
  }

  public playTone(freq: number, type: OscillatorType, duration: number, gainLevel = 0.1) {
    if (!storageService.getState().settings.soundEnabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      gain.gain.setValueAtTime(gainLevel, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch {}
  }

  public click() {
    this.playTone(620, 'sine', 0.08, 0.05);
  }

  public success() {
    this.playTone(523.25, 'triangle', 0.1, 0.08);
    setTimeout(() => this.playTone(659.25, 'triangle', 0.12, 0.08), 80);
    setTimeout(() => this.playTone(783.99, 'triangle', 0.22, 0.08), 160);
  }

  public alert() {
    this.playTone(240, 'sawtooth', 0.18, 0.12);
    setTimeout(() => this.playTone(180, 'sawtooth', 0.25, 0.12), 120);
  }
}

export const soundService = new SoundService();
