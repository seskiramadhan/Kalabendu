import { audio } from './audio.js';

// Gamelan-style music made with Web Audio (no files). A 16-beat cycle:
// saron plays the balungan (main melody), bonang doubles it, kenong and
// kempul mark the phrases, the gong closes the cycle, kendang keeps time.
// The age sets the tuning: pelog (darker) in Kalabendu, slendro (brighter)
// as the world heals.

const PELOG = [1, 1.07, 1.19, 1.42, 1.51, 2, 2.14];
const SLENDRO = [1, 1.14, 1.31, 1.51, 1.74, 2, 2.28];

// One entry per track: base pitch, tempo (beats per minute), melody seed.
const TRACKS = {
  menu: { base: 262, bpm: 64, seed: 3, calm: true },
  padepokan: { base: 262, bpm: 84, seed: 5 },
  stage0: { base: 294, bpm: 92, seed: 7 },
  stage1: { base: 247, bpm: 96, seed: 11 },
  stage2: { base: 233, bpm: 100, seed: 13 },
  stage3: { base: 277, bpm: 104, seed: 17 },
  stage4: { base: 262, bpm: 110, seed: 19 },
  stage5: { base: 220, bpm: 108, seed: 23 },
  story: { base: 262, bpm: 58, seed: 29, calm: true },
};

const LOOKAHEAD = 0.15;

function melody(seed) {
  let s = seed * 9301 + 49297;
  const rnd = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
  const notes = [];
  let n = 2;
  for (let i = 0; i < 16; i++) {
    n = Math.max(0, Math.min(6, n + Math.round((rnd() - 0.5) * 4)));
    notes.push(i % 4 === 3 ? (i === 15 ? 0 : n) : rnd() < 0.15 ? -1 : n);
  }
  return notes;
}

class Music {
  constructor() {
    this.track = null;
    this.on = true;
    this.boss = false;
    this.era = 10;
    this.timer = 0;
    this.out = null;
  }

  setEnabled(on) {
    this.on = on;
    if (!on) this.stop();
    else if (this.track) this.play(this.track, { era: this.era, force: true });
  }

  setEra(era) {
    this.era = era;
  }

  setBoss(boss) {
    this.boss = boss;
  }

  play(id, { era = this.era, force = false } = {}) {
    this.era = era;
    if (this.track === id && this.timer && !force) return;
    this.stop();
    this.track = id;
    this.boss = false;
    if (!this.on || !TRACKS[id]) return;
    this.start();
  }

  stop() {
    clearInterval(this.timer);
    this.timer = 0;
    if (this.out) {
      const g = this.out;
      const c = audio.ctx;
      g.gain.setTargetAtTime(0, c.currentTime, 0.3);
      setTimeout(() => g.disconnect(), 1500);
      this.out = null;
    }
  }

  // Waits for the first tap/key (browsers start audio only after one).
  start() {
    if (!audio.ctx) {
      this.timer = setInterval(() => {
        if (!audio.ctx) return;
        clearInterval(this.timer);
        this.start();
      }, 250);
      return;
    }
    const c = audio.ctx;
    const def = TRACKS[this.track];
    this.out = c.createGain();
    this.out.gain.value = 0.0001;
    this.out.gain.setTargetAtTime(def.calm ? 0.22 : 0.28, c.currentTime, 0.5);
    this.out.connect(audio.musicBus);
    this.notes = melody(def.seed);
    this.beat = 0;
    this.next = c.currentTime + 0.1;
    this.timer = setInterval(() => this.tick(), 50);
  }

  tick() {
    const c = audio.ctx;
    if (!c || !this.out) return;
    if (c.state === 'suspended') return;
    const def = TRACKS[this.track];
    // The boss doubles the tempo feel (irama tanggung → lancar).
    const spb = 60 / (def.bpm * (this.boss ? 1.35 : 1));
    while (this.next < c.currentTime + LOOKAHEAD) {
      this.beatAt(this.beat, this.next, spb, def);
      this.beat = (this.beat + 1) % 16;
      this.next += spb;
    }
  }

  beatAt(i, t, spb, def) {
    const scale = this.era >= 40 ? SLENDRO : PELOG;
    const pitch = (n, oct = 1) => def.base * scale[n] * oct;
    const n = this.notes[i];
    if (n >= 0) {
      this.saron(t, pitch(n), 0.16);
      if (!def.calm) this.saron(t + spb / 2, pitch((n + (i % 2 ? 2 : 1)) % 7, 2), 0.06);
    }
    if (!def.calm || i % 2 === 0) this.bonang(t, pitch(n < 0 ? 0 : n, 0.5), 0.08);
    if (i % 4 === 3) this.kenong(t, pitch(i === 15 ? 0 : 2, 0.5));
    if (i === 5 || i === 9 || i === 13) this.kempul(t, pitch(4, 0.25));
    if (i === 15) this.gong(t + spb * 0.95);
    if (!def.calm) {
      if (i % 2 === 0) this.kendang(t, i % 4 === 0 ? 1 : 0.5);
      if (this.boss) this.kendang(t + spb / 2, 0.4);
    }
  }

  // Metal key: a bright partial over the note, fast decay.
  saron(t, f, gain) {
    this.bell(t, f, gain, 0.9, [1, 2.76, 5.4], [1, 0.25, 0.08]);
  }

  bonang(t, f, gain) {
    this.bell(t, f, gain, 0.6, [1, 2.3], [1, 0.3]);
  }

  kenong(t, f) {
    this.bell(t, f, 0.1, 1.6, [1, 1.006, 2.01], [1, 0.6, 0.15]);
  }

  kempul(t, f) {
    this.bell(t, f, 0.12, 2.2, [1, 1.01], [1, 0.7]);
  }

  // Big gong: two close low tones beat against each other.
  gong(t) {
    this.bell(t, 62, 0.3, 4.5, [1, 1.022, 2.4], [1, 0.8, 0.12], 0.04);
  }

  bell(t, f, gain, decay, ratios, amps, attack = 0.004) {
    const c = audio.ctx;
    const g = c.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain, t + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t + decay);
    g.connect(this.out);
    ratios.forEach((r, k) => {
      const o = c.createOscillator();
      o.type = 'sine';
      o.frequency.value = f * r;
      const a = c.createGain();
      a.gain.value = amps[k];
      o.connect(a).connect(g);
      o.start(t);
      o.stop(t + decay + 0.05);
    });
  }

  kendang(t, power) {
    const c = audio.ctx;
    const o = c.createOscillator();
    o.type = 'sine';
    o.frequency.setValueAtTime(150, t);
    o.frequency.exponentialRampToValueAtTime(70, t + 0.12);
    const g = c.createGain();
    g.gain.setValueAtTime(0.25 * power, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);
    o.connect(g).connect(this.out);
    o.start(t);
    o.stop(t + 0.2);
  }
}

export const music = new Music();
