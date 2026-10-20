// Tiny Web Audio synth for sound effects. Music (gamelan by era) can plug
// into the same context later via audio.musicBus.
class Audio {
  constructor() {
    this.ctx = null;
    this.master = null;
    this.musicBus = null;
    this.noiseBuf = null;
    this.volume = 0.6;
    const unlock = () => this.unlock();
    window.addEventListener('keydown', unlock, { once: true });
    window.addEventListener('pointerdown', unlock, { once: true });
  }

  setVolume(v) {
    this.volume = v;
    if (this.master) this.master.gain.value = v;
  }

  unlock() {
    if (this.ctx) return;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    this.ctx = new AC();
    this.master = this.ctx.createGain();
    this.master.gain.value = this.volume;
    this.master.connect(this.ctx.destination);
    this.musicBus = this.ctx.createGain();
    this.musicBus.connect(this.master);
    const len = this.ctx.sampleRate * 0.5;
    this.noiseBuf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const d = this.noiseBuf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  }

  noise(dur, { freq = 1200, q = 1, type = 'bandpass', gain = 0.5, sweepTo } = {}) {
    const c = this.ctx;
    const src = c.createBufferSource();
    src.buffer = this.noiseBuf;
    const f = c.createBiquadFilter();
    f.type = type;
    f.frequency.value = freq;
    f.Q.value = q;
    if (sweepTo) f.frequency.exponentialRampToValueAtTime(sweepTo, c.currentTime + dur);
    const g = c.createGain();
    g.gain.setValueAtTime(gain, c.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + dur);
    src.connect(f).connect(g).connect(this.master);
    src.start();
    src.stop(c.currentTime + dur);
  }

  tone(dur, { freq = 200, to, type = 'sine', gain = 0.4 } = {}) {
    const c = this.ctx;
    const o = c.createOscillator();
    o.type = type;
    o.frequency.setValueAtTime(freq, c.currentTime);
    if (to) o.frequency.exponentialRampToValueAtTime(to, c.currentTime + dur);
    const g = c.createGain();
    g.gain.setValueAtTime(gain, c.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + dur);
    o.connect(g).connect(this.master);
    o.start();
    o.stop(c.currentTime + dur);
  }

  play(name, power = 1) {
    if (!this.ctx) return;
    switch (name) {
      case 'whoosh':
        this.noise(0.12, { freq: 900 + power * 300, sweepTo: 2600, q: 0.8, gain: 0.18 });
        break;
      case 'whooshBig':
        this.noise(0.2, { freq: 500, sweepTo: 1800, q: 0.7, gain: 0.25 });
        break;
      case 'hit':
        this.noise(0.08, { freq: 1800, q: 0.9, gain: 0.45 * power });
        this.tone(0.1, { freq: 180, to: 60, type: 'square', gain: 0.25 * power });
        break;
      case 'hitHeavy':
        this.noise(0.14, { freq: 900, q: 0.7, gain: 0.6 });
        this.tone(0.18, { freq: 120, to: 40, type: 'square', gain: 0.35 });
        break;
      case 'land':
        this.noise(0.08, { freq: 300, type: 'lowpass', gain: 0.25 });
        break;
      case 'thud':
        this.noise(0.2, { freq: 200, type: 'lowpass', gain: 0.5 });
        this.tone(0.2, { freq: 90, to: 40, gain: 0.3 });
        break;
      case 'jump':
        this.tone(0.08, { freq: 300, to: 520, type: 'triangle', gain: 0.12 });
        break;
      case 'special':
        this.tone(0.35, { freq: 220, to: 880, type: 'sawtooth', gain: 0.12 });
        this.noise(0.4, { freq: 400, sweepTo: 3000, q: 0.6, gain: 0.25 });
        break;
      case 'fire':
        this.noise(0.3, { freq: 600, type: 'lowpass', gain: 0.25 });
        break;
      case 'steam':
        this.noise(0.35, { freq: 3000, type: 'highpass', gain: 0.18 });
        break;
      case 'saw':
        this.tone(0.3, { freq: 110, to: 160, type: 'sawtooth', gain: 0.1 });
        this.noise(0.3, { freq: 1500, q: 2, gain: 0.12 });
        break;
      case 'horn':
        this.tone(0.45, { freq: 196, type: 'square', gain: 0.12 });
        this.tone(0.45, { freq: 247, type: 'square', gain: 0.1 });
        break;
      case 'deny':
        this.tone(0.12, { freq: 180, to: 120, type: 'square', gain: 0.12 });
        break;
      case 'combo':
        this.tone(0.1, { freq: 880, type: 'triangle', gain: 0.15 });
        setTimeout(() => this.tone(0.15, { freq: 1320, type: 'triangle', gain: 0.15 }), 80);
        break;
      case 'pickup':
        this.tone(0.08, { freq: 660, type: 'triangle', gain: 0.2 });
        setTimeout(() => this.tone(0.12, { freq: 990, type: 'triangle', gain: 0.2 }), 70);
        break;
    }
  }
}

export const audio = new Audio();
