import { FRAME } from '../../entities/fighter.js';

// Joint angles: t torso lean, hd head tilt, bu/bf back arm upper/fore,
// fu/ff front arm, bt/bs back thigh/shin, ft/fs front thigh/shin, spin = whole body.
const stance = { t: 8, hd: 0, bu: 20, bf: 150, fu: 45, ff: 140, bt: -28, bs: -6, ft: 32, fs: 6 };

export const POSES = {
  stance,
  stance2: { ...stance, t: 11, bf: 144, ff: 134, bt: -31, ft: 35 },
  walk1: { ...stance, t: 6, bt: -26, bs: -14, ft: 26, fs: 10 },
  walk2: { ...stance, t: 6, bt: -2, bs: -32, ft: 6, fs: -4 },
  walk3: { ...stance, t: 6, bt: 24, bs: 8, ft: -24, fs: -16 },
  walk4: { ...stance, t: 6, bt: 4, bs: -4, ft: -2, fs: -32 },

  jab_wind: { ...stance, t: 4, fu: 20, ff: 60 },
  jab_hit: { ...stance, t: 16, bu: 25, bf: 150, fu: 90, ff: 90, bt: -34, bs: -8, ft: 38, fs: 8 },
  palm_wind: { ...stance, t: 0, bu: -25, bf: 60 },
  palm_hit: { ...stance, t: 22, bu: 88, bf: 98, fu: 20, ff: 150, bt: -38, bs: -10, ft: 42, fs: 10 },
  frontkick_wind: { ...stance, t: -4, fu: 55, ff: 150, bt: -6, bs: -3, ft: 72, fs: -40 },
  frontkick_hit: { ...stance, t: -14, bu: 40, bf: 160, fu: 60, ff: 150, bt: -8, bs: -4, ft: 86, fs: 92 },
  sabit_wind: { ...stance, t: -10, bu: -30, bf: 30, fu: 60, ff: 150, bt: -10, bs: -5, ft: 62, fs: -60, spin: -10 },
  sabit_hit: { ...stance, t: -28, bu: -55, bf: -20, fu: 75, ff: 125, bt: -12, bs: -8, ft: 118, fs: 122 },
  sweep_wind: { ...stance, t: 32, bu: 60, bf: 30, fu: 70, ff: 40, bt: -72, bs: 22, ft: 42, fs: -60 },
  sweep_hit: { ...stance, t: 42, bu: 55, bf: 20, fu: 62, ff: 30, bt: -82, bs: 32, ft: 90, fs: 92 },

  jump_up: { ...stance, t: 0, bu: 140, bf: 170, fu: 125, ff: 160, bt: -18, bs: -52, ft: 62, fs: -22 },
  jump_down: { ...stance, t: 5, bu: 60, bf: 100, fu: 75, ff: 120, bt: -12, bs: -22, ft: 32, fs: 2 },
  airkick: { ...stance, t: -22, bu: 120, bf: 150, fu: 40, ff: 120, bt: 12, bs: -82, ft: 76, fs: 82 },
  land: { ...stance, t: 14, bt: -46, bs: 10, ft: 52, fs: -12 },
  roll: { t: 50, hd: 20, bu: 70, bf: 130, fu: 60, ff: 120, bt: 85, bs: -40, ft: 95, fs: -50, spinPivot: 'center' },
};

const ATTACK = {
  jab: ['jab_wind', 'jab_hit'],
  palm: ['palm_wind', 'palm_hit'],
  frontkick: ['frontkick_wind', 'frontkick_hit'],
  sabit: ['sabit_wind', 'sabit_hit'],
  sweep: ['sweep_wind', 'sweep_hit'],
  airkick: ['airkick', 'airkick'],
};

const LOOPS = {
  idle: [['stance', 0.55], ['stance2', 0.55]],
  walk: [['walk1', 0.11], ['walk2', 0.11], ['walk3', 0.11], ['walk4', 0.11]],
};

function lerpPose(a, b, k) {
  const out = {};
  for (const key in a) {
    const va = a[key];
    const vb = b[key] ?? va;
    out[key] = typeof va === 'number' ? va + (vb - va) * k : va;
  }
  for (const key in b) if (!(key in out)) out[key] = b[key];
  return out;
}

const ease = (k) => 1 - (1 - k) * (1 - k);

function loopPose(frames, time) {
  const total = frames.reduce((s, [, d]) => s + d, 0);
  let t = time % total;
  for (let i = 0; i < frames.length; i++) {
    const [name, d] = frames[i];
    if (t < d) {
      const next = frames[(i + 1) % frames.length][0];
      return lerpPose(POSES[name], POSES[next], t / d);
    }
    t -= d;
  }
  return POSES[frames[0][0]];
}

function attackPose(f) {
  const m = f.move;
  const [wind, hit] = ATTACK[m.anim];
  const s = m.startup * FRAME;
  const a = m.active * FRAME;
  const r = m.recovery * FRAME;
  if (f.t < s) return lerpPose(POSES.stance, POSES[wind], ease(f.t / s));
  if (f.t < s + a) return lerpPose(POSES[wind], POSES[hit], Math.min(1, (f.t - s) / (FRAME * 2)));
  return lerpPose(POSES[hit], POSES.stance, ease(Math.min(1, (f.t - s - a) / r)));
}

// Named animation state, as a sprite sheet would use: idle, walk, attack1..4,
// heavy, jump, jumpAttack, dodge, land.
export function animState(f) {
  if (f.state === 'attack') {
    if (f.move.id === f.def.heavy) return 'heavy';
    return 'attack' + (f.chain + 1);
  }
  return f.state;
}

export function poseFor(f, time) {
  switch (f.state) {
    case 'idle':
      return loopPose(LOOPS.idle, time);
    case 'walk':
      return loopPose(LOOPS.walk, f.walkDist / 70);
    case 'attack':
      return attackPose(f);
    case 'jump': {
      const k = Math.max(0, Math.min(1, 0.5 - f.vz / 500));
      return lerpPose(POSES.jump_up, POSES.jump_down, k);
    }
    case 'jumpAttack':
      return lerpPose(POSES.jump_down, POSES.airkick, Math.min(1, f.t / (FRAME * 3)));
    case 'land':
      return POSES.land;
    case 'dodge':
      return { ...POSES.roll, spin: Math.min(1, f.t / 0.3) * 360 };
  }
  return POSES.stance;
}
