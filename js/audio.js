// ============================================================================
// Smart Canteen Audio Synthesizer (Zero-dependency Web Audio API)
// ============================================================================

class SoundFX {
  constructor() {
    this.ctx = null;
    this.enabled = true;
  }

  init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.ctx = new AudioContext();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggle(enabled) {
    this.enabled = enabled !== undefined ? enabled : !this.enabled;
    return this.enabled;
  }

  playTone(freq, type, duration, delay = 0, gainLevel = 0.15) {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      const startTime = this.ctx.currentTime + delay;
      osc.type = type;
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(gainLevel, startTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + duration);
    } catch (e) {
      console.warn("Audio playback not allowed or failed:", e);
    }
  }

  // Button click tap
  playClick() {
    this.playTone(800, 'sine', 0.04, 0, 0.05);
  }

  // Order placed fanfare
  playOrderPlaced() {
    this.playTone(523.25, 'sine', 0.2, 0, 0.18);    // C5
    this.playTone(659.25, 'sine', 0.2, 0.1, 0.18);  // E5
    this.playTone(783.99, 'sine', 0.35, 0.2, 0.22); // G5
    this.playTone(1046.50, 'triangle', 0.5, 0.3, 0.25); // C6
  }

  // Kitchen new order ding-dong alert
  playKitchenAlert() {
    this.playTone(880, 'sine', 0.25, 0, 0.25);      // A5
    this.playTone(587.33, 'triangle', 0.45, 0.18, 0.3); // D5
  }

  // Order ready for pickup bell
  playOrderReady() {
    this.playTone(659.25, 'triangle', 0.2, 0, 0.2);     // E5
    this.playTone(830.61, 'triangle', 0.2, 0.12, 0.2);  // G#5
    this.playTone(987.77, 'sine', 0.45, 0.24, 0.25);   // B5
    this.playTone(1318.51, 'sine', 0.6, 0.36, 0.3);    // E6
  }
}

window.soundFX = new SoundFX();
