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

// Optional recorded music: assets/music/manifest.json like
// {"explore": "explore.mp3", "boss": "boss.mp3"} replaces the code-made
// tracks (explore = every stage, boss = boss fights). Missing = code music.
const files = {};
let filesLoaded = null;
function loadFiles() {
  filesLoaded ??= (async () => {
    try {
      const res = await fetch('assets/music/manifest.json', { cache: 'no-cache' });
      if (!res.ok) return;
      const list = await res.json();
      await Promise.all(
        Object.entries(list).map(async ([kind, file]) => {
          const data = await (await fetch('assets/music/' + file)).arrayBuffer();
          files[kind] = await audio.ctx.decodeAudioData(data);
        }),
      );
    } catch {}
  })();
  return filesLoaded;
}

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
    this.live = [];
  }

  setEnabled(on) {
    this.on = on;
    if (!on) this.stop();
    else if (this.track) this.play(this.track, { era: this.era, force: true });
  }

  setEra(era) {
    this.era = era;
  }

  // Boss fights switch to their own, darker track (crossfade).
  setBoss(boss) {
    if (this.boss === boss) return;
    this.boss = boss;
    if (!this.track || !this.on) return;
    this.stop();
    this.start();
  }

  play(id, { era = this.era, force = false } = {}) {
    this.era = era;
    if (this.track === id && this.timer && !force && !this.boss) return;
    this.stop();
    this.track = id;
    this.boss = false;
    if (!this.on || !TRACKS[id]) return;
    this.start();
  }

  stop() {
    if (this.timer > 0) clearInterval(this.timer);
    this.timer = 0;
    if (this.out) {
      const g = this.out;
      const c = audio.ctx;
      const live = this.live;
      g.gain.setTargetAtTime(0, c.currentTime, 0.3);
      setTimeout(() => {
        for (const n of live) n.stop();
        g.disconnect();
      }, 1500);
      this.out = null;
      this.live = [];
    }
  }

  // Waits for the first tap/key (browsers start audio only after one).
  async start() {
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
    this.out.gain.setTargetAtTime(def.calm ? 0.22 : this.boss ? 0.34 : 0.28, c.currentTime, this.boss ? 0.2 : 0.5);
    this.out.connect(audio.musicBus);
    const out = this.out;
    await loadFiles();
    if (this.out !== out) return;
    const file = def.calm ? null : files[this.boss ? 'boss' : 'explore'];
    if (file) {
      const src = c.createBufferSource();
      src.buffer = file;
      src.loop = true;
      src.connect(out);
      src.start();
      this.live.push(src);
      this.timer = -1;
      return;
    }
    if (this.boss) this.drone(out);
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
    // Boss: slow and heavy, like a heartbeat in the dark.
    const spb = 60 / (this.boss ? 76 : def.bpm);
    while (this.next < c.currentTime + LOOKAHEAD) {
      if (this.boss) this.bossBeat(this.beat, this.next, spb, def);
      else this.beatAt(this.beat, this.next, spb, def);
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
    if (!def.calm && i % 2 === 0) this.kendang(t, i % 4 === 0 ? 1 : 0.5);
  }

  // Horror boss track: low drone, a heartbeat kendang, clashing pelog
  // seconds in the low saron, sparse out-of-tune bells, rising whispers,
  // and a huge gong every 8 beats.
  bossBeat(i, t, spb, def) {
    const low = def.base / 2;
    const step = i % 8;
    if (step === 0) this.gong(t);
    if (step === 0 || step === 4) {
      this.kendang(t, 1.2);
      this.kendang(t + spb * 0.28, 0.8);
    }
    const line = [0, 1, 0, 3, 0, 1, 4, 3];
    if (step % 2 === 0) {
      const n = line[(i >> 1) % 8];
      this.bell(t, low * PELOG[n], 0.14, 1.6, [1, 2.76], [1, 0.2]);
      // the half step above: a cluster that never resolves
      this.bell(t + 0.02, low * PELOG[n + 1], 0.09, 1.4, [1], [1]);
    }
    if (i % 16 === 6 || i % 16 === 13) this.bell(t + spb * 0.5, def.base * 2.9, 0.05, 2.6, [1, 1.013, 2.41], [1, 0.7, 0.3]);
    if (i % 16 === 10) this.whisper(t, spb * 4);
    if (i % 16 === 15) this.bell(t, low * 0.5, 0.12, 3, [1, 1.03], [1, 0.8]);
  }

  // Two low tones just out of tune with each other, breathing slowly.
  drone(out) {
    const c = audio.ctx;
    const g = c.createGain();
    g.gain.value = 0.12;
    const lfo = c.createOscillator();
    const lfoGain = c.createGain();
    lfo.frequency.value = 0.18;
    lfoGain.gain.value = 0.06;
    lfo.connect(lfoGain).connect(g.gain);
    lfo.start();
    this.live.push(lfo);
    for (const f of [55, 57.6, 110.8]) {
      const o = c.createOscillator();
      o.type = f > 100 ? 'triangle' : 'sine';
      o.frequency.value = f;
      o.connect(g);
      o.start();
      this.live.push(o);
    }
    g.connect(out);
  }

  // Filtered noise that swells up and cuts off: a breath behind you.
  whisper(t, dur) {
    const c = audio.ctx;
    const src = c.createBufferSource();
    src.buffer = audio.noiseBuf;
    src.loop = true;
    const f = c.createBiquadFilter();
    f.type = 'bandpass';
    f.frequency.setValueAtTime(400, t);
    f.frequency.exponentialRampToValueAtTime(2400, t + dur);
    f.Q.value = 6;
    const g = c.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.18, t + dur * 0.9);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(f).connect(g).connect(this.out);
    src.start(t);
    src.stop(t + dur + 0.05);
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
