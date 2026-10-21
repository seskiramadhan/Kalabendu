import { HEROES } from '../entities/heroes.js';
import { ENEMIES } from '../entities/enemies.js';
import { ALLIES } from '../entities/allies.js';
import { PROPS } from '../entities/props.js';
import { ITEMS } from '../entities/items.js';
import { MOVES } from '../combat/moves.js';
import { zoneAt, VILLAGER_LOOK } from '../systems/environment.js';

// Online co-op: the host runs the game and sends snapshots; the guest keeps a
// "mirror" with the same shape the renderer and HUD read. Only what is drawn
// is sent. Entities are matched by uid so the HUD's target bar and effects
// can keep pointing at the same objects between snapshots.

const SKIP = new Set(['def', 'move', 'hitIds', 'hitAt', 'brain', 'input', 'queued', 'drops', 'remove']);
const round = (v) => (typeof v === 'number' ? Math.round(v * 10) / 10 : v);

function defRef(e) {
  switch (e.kind) {
    case 'hero':
      return ['h', e.def.id, e.def.maxHp];
    case 'enemy':
      return ['e', e.def.id, e.def.boss ? 1 : 0, e.def.miniBoss ? 1 : 0];
    case 'ally':
      return ['a', e.def.id];
    case 'npc':
      return ['n'];
    case 'prop':
      return ['p', e.type];
    case 'item':
      return ['i', e.type];
    default:
      return null;
  }
}

function packEntity(e) {
  const o = {};
  for (const k in e) {
    if (SKIP.has(k)) continue;
    const v = e[k];
    if (v === null || v === undefined || v === false || v === 0) continue;
    if (typeof v === 'function') continue;
    if (typeof v === 'object' && !(k === 'look' || k === 'weapon')) continue;
    o[k] = round(v);
  }
  const d = defRef(e);
  if (d) o.d = d;
  if (e.move?.id) o.m = e.move.id;
  return o;
}

// Event fields that point at entities travel as uids.
const REFS = ['who', 'target', 'attacker', 'from', 'to'];

function packEvent(ev) {
  const o = {};
  for (const k in ev) {
    const v = ev[k];
    if (REFS.includes(k) && v && typeof v === 'object') o[k] = { uid: v.uid };
    else if (k === 'move' && v) o.move = v.id;
    else if (typeof v !== 'object' || v === null || Array.isArray(v)) o[k] = v;
  }
  return o;
}

export function packSnapshot(game, events, mode) {
  return {
    type: 'snap',
    mode,
    stage: game.stage.id,
    g: {
      camX: round(game.camera.x),
      era: game.era,
      eraAfter: game.eraAfter,
      darkness: round(game.darkness),
      haze: round(game.haze),
      cleared: game.cleared,
      over: game.over,
      continueTimer: round(game.continueTimer),
      score: game.score,
      rupiah: game.rupiah,
      evidence: game.evidence,
      saved: game.saved,
      go: game.go,
      time: round(game.time),
      hitstop: round(game.hitstop),
      boss: game.boss?.uid ?? 0,
    },
    ents: game.entities.map(packEntity),
    ev: events.map(packEvent),
  };
}

// Zero values are left out of snapshots, so new mirror entities start from these.
const ZEROES = { x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0, t: 0, chain: 0, invuln: 0, walkDist: 0, hurtFrame: 0, kneeT: 0, poison: 0, loot: 0, semangat: 0, hp: 0, lives: 0, stun: 0, juggles: 0, lastHitAt: 0, facing: 1 };

const defCache = new Map();
function resolveDef(d, e) {
  if (!d) return undefined;
  const key = d.join('|');
  if (defCache.has(key)) return defCache.get(key);
  let def;
  if (d[0] === 'h') def = { ...HEROES[d[1]], maxHp: d[2] };
  else if (d[0] === 'e') def = { ...ENEMIES[d[1]], boss: !!d[2], miniBoss: !!d[3] };
  else if (d[0] === 'a') def = ALLIES[d[1]];
  else if (d[0] === 'n') def = { look: VILLAGER_LOOK };
  else if (d[0] === 'p') def = PROPS[d[1]];
  else if (d[0] === 'i') def = ITEMS[d[1]];
  defCache.set(key, def);
  return def;
}

// What the guest renders. Fields not in a snapshot fall back to 0 / false.
export class Mirror {
  constructor(stages) {
    this.stages = stages;
    this.byUid = new Map();
    this.game = null;
    this.mode = 'menu';
  }

  apply(snap, onStageChange) {
    this.mode = snap.mode;
    const stage = this.stages[snap.stage];
    if (!this.game || this.game.stage !== stage) {
      this.byUid.clear();
      this.game = makeGame(stage);
      onStageChange?.(this.game);
    }
    const g = this.game;
    Object.assign(g, snap.g);
    g.camera.x = snap.g.camX;
    const seen = new Set();
    const list = [];
    for (const o of snap.ents) {
      let e = this.byUid.get(o.uid);
      if (!e) {
        e = { hitIds: new Set(), ...ZEROES };
        this.byUid.set(o.uid, e);
      }
      for (const k in e) if (k !== 'hitIds' && k !== 'def' && !(k in o)) e[k] = typeof e[k] === 'number' ? 0 : typeof e[k] === 'boolean' ? false : null;
      for (const k in o) if (k !== 'd' && k !== 'm') e[k] = o[k];
      e.def = resolveDef(o.d, e) ?? e.def;
      e.move = o.m ? MOVES[o.m] : null;
      seen.add(o.uid);
      list.push(e);
    }
    for (const uid of this.byUid.keys()) if (!seen.has(uid)) this.byUid.delete(uid);
    g.entities = list;
    g.heroes = new Map(list.filter((e) => e.kind === 'hero').map((e) => [e.playerId, e]));
    g.boss = this.byUid.get(snap.g.boss) ?? null;
    for (const ev of snap.ev) {
      for (const k of REFS) if (ev[k]) ev[k] = this.byUid.get(ev[k].uid) ?? { uid: ev[k].uid, kind: 'gone', x: 0, y: 0, z: 0 };
      if (ev.move) ev.move = MOVES[ev.move] ?? { id: ev.move };
      g.events.push(ev);
    }
  }
}

function makeGame(stage) {
  return {
    stage,
    camera: { x: 0 },
    entities: [],
    heroes: new Map(),
    events: [],
    boss: null,
    era: 10,
    darkness: 0,
    haze: 0,
    get finished() {
      return this.over && this.continueTimer <= 0;
    },
    slowAt(f) {
      if (f.z > 1) return 1;
      return zoneAt(this.stage, f.x)?.slow ?? 1;
    },
  };
}
