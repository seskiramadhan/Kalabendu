import { animState } from './poses.js';
import { FRAME } from '../../entities/fighter.js';

// Optional sprite sheets. Until art exists every fighter is drawn in code;
// drop assets/sprites/<id>.png (made from tools/sheet.html's template) and
// list the id in assets/sprites/manifest.json to switch that fighter over.
// One row per animation state, frames FRAME_W x FRAME_H, feet at FOOT_Y.
export const FRAME_W = 64;
export const FRAME_H = 80;
export const FOOT_Y = 76;

// Row order and the code poses each frame is exported from.
export const LAYOUT = [
  { anim: 'idle', poses: ['stance', 'stance2'], fps: 2 },
  { anim: 'walk', poses: ['walk1', 'walk2', 'walk3', 'walk4'], fps: 9 },
  { anim: 'attack1', poses: ['jab_wind', 'jab_hit'] },
  { anim: 'attack2', poses: ['palm_wind', 'palm_hit'] },
  { anim: 'attack3', poses: ['frontkick_wind', 'frontkick_hit'] },
  { anim: 'attack4', poses: ['sabit_wind', 'sabit_hit'] },
  { anim: 'heavy', poses: ['sweep_wind', 'sweep_hit'] },
  { anim: 'jump', poses: ['jump_up', 'jump_down'] },
  { anim: 'jumpAttack', poses: ['airpunch', 'airkick'] },
  { anim: 'hurt', poses: ['hurt1', 'hurt2'] },
  { anim: 'knockdown', poses: ['airhit', 'lying'] },
  { anim: 'getup', poses: ['getup', 'land'] },
  { anim: 'grab', poses: ['grab', 'knee'] },
  { anim: 'throw', poses: ['grab', 'throwPose'] },
  { anim: 'special', poses: ['sabit_wind', 'sabit_hit', 'airkick', 'ride'], fps: 12 },
  { anim: 'dizzy', poses: ['dizzy'] },
  { anim: 'dodge', poses: ['roll'] },
];

const ROW = Object.fromEntries(LAYOUT.map((r, i) => [r.anim, i]));
const ALIAS = { dead: 'knockdown', airborne: 'knockdown', grabbed: 'hurt', land: 'getup', frozen: 'hurt', block: 'idle' };
const sheets = new Map();

export async function loadSheets(base = 'assets/sprites/') {
  try {
    const res = await fetch(base + 'manifest.json', { cache: 'no-cache' });
    if (!res.ok) return;
    const ids = await res.json();
    await Promise.all(
      ids.map(
        (id) =>
          new Promise((done) => {
            const img = new Image();
            img.onload = () => {
              sheets.set(id, img);
              done();
            };
            img.onerror = done;
            img.src = `${base}${id}.png`;
          }),
      ),
    );
  } catch {}
}

export function sheetFor(id) {
  return sheets.get(id) ?? null;
}

// Which cell of the sheet shows this fighter right now.
export function frameFor(f, time) {
  let anim = animState(f);
  if (f.state === 'attack' && f.move?.id !== f.def.special && f.move?.id !== f.def.heavy && f.move?.id !== 'throw_anim') {
    anim = 'attack' + Math.min(4, (f.chain ?? 0) + 1);
  }
  anim = ALIAS[anim] ?? anim;
  const row = ROW[anim] ?? 0;
  const spec = LAYOUT[row];
  const n = spec.poses.length;
  let col = 0;
  if (f.state === 'attack' && f.move && anim !== 'special') col = f.t >= f.move.startup * FRAME ? 1 : 0;
  else if (anim === 'walk') col = Math.floor(f.walkDist / 17.5) % n;
  else if (anim === 'jump') col = f.vz > 0 ? 0 : 1;
  else col = Math.floor(time * (spec.fps ?? 4)) % n;
  return { row, col: Math.min(col, n - 1) };
}
