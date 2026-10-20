import { MOVES } from '../combat/moves.js';
import { activeHitbox, react } from '../combat/hits.js';
import { createItem } from '../entities/items.js';

let nextUid = 4_000_000;
const FIRE_LIFE = 7;
const FIRE_HALF_W = 11;
const FIRE_TICK = 0.6;
const POISON_TIME = 3;
const POISON_DPS = 3;
const POISON_TOUCH = { damage: 3, push: 20, stun: 8, hitstop: 0.03, shake: 1 };

export const VILLAGER_LOOK = {
  skin: '#b07a4f',
  top: '#5a8a6a',
  pants: '#6a4a2a',
  sleeve: '#b07a4f',
  clothLight: '#7aa08a',
  sash: '#a4452a',
  headgear: 'caping',
  hair: '#1a1210',
};

const CANDLE_WARN = 0.9;
const CANDLE_HIT = { damage: 9, push: 90, launch: 170, knockdown: true, shake: 3, unblockable: true };

// Falling red candlestick bars: a warning shadow, then the crash.
export function spawnCandles(game, f, n) {
  const target = [...game.heroes.values()].find((h) => h.state !== 'dead');
  const cx = target?.x ?? f.x;
  const cy = target?.y ?? f.y;
  for (let i = 0; i < n; i++) {
    const x = cx + (i - (n - 1) / 2) * 34 + (game.rand() - 0.5) * 14;
    const y = Math.max(game.stage.floorTop + 6, Math.min(game.stage.floorBottom - 4, cy + (game.rand() - 0.5) * 36));
    game.entities.push({ uid: nextUid++, kind: 'hazard', type: 'candle', x, y, z: 0, t: -i * 0.12, life: CANDLE_WARN + 0.6, hit: false, remove: false });
  }
}

function updateCandle(game, c, dt, heroes) {
  c.t += dt;
  if (!c.hit && c.t >= CANDLE_WARN) {
    c.hit = true;
    game.emit({ type: 'shake', amount: 2 });
    game.emit({ type: 'sfx', name: 'thud' });
    for (const h of heroes) {
      if (h.invuln > 0 || h.state === 'dead' || Math.abs(h.x - c.x) > 11 || Math.abs(h.y - c.y) > 9) continue;
      react(game, { uid: c.uid, x: c.x, facing: 1, team: 'enemy', def: {}, hitIds: new Set() }, h, CANDLE_HIT, { x: h.x, z: 30 });
    }
  }
  if (c.t > c.life) c.remove = true;
}

export function zoneAt(stage, x) {
  return stage.zones?.find((z) => x >= z.x0 && x < z.x1) ?? null;
}

export function spawnFire(game, x, y, life = FIRE_LIFE) {
  if (x < 10 || x > game.stage.width - 10) return;
  game.entities.push({ uid: nextUid++, kind: 'hazard', type: 'fire', x, y, z: 0, t: 0, life, hitAt: new Map(), remove: false });
}

export function spawnFireAhead(game, f, count) {
  for (let i = 1; i <= count; i++) spawnFire(game, f.x + f.facing * (24 + i * 24), f.y + (i % 2 ? 4 : -4));
  game.emit({ type: 'sfx', name: 'fire' });
}

export function throwBag(game, f) {
  const target = [...game.heroes.values()][0];
  const dx = target ? target.x - f.x : f.facing * 120;
  game.entities.push({
    uid: nextUid++,
    kind: 'projectile',
    team: 'enemy',
    ownerUid: f.uid,
    weaponId: 'karung_uang',
    move: MOVES.raja_bag_hit,
    x: f.x + f.facing * 20,
    y: target?.y ?? f.y,
    z: 90,
    vx: dx / 0.9,
    vz: 160,
    gravity: true,
    facing: Math.sign(dx) || f.facing,
    t: 0,
    hitIds: new Set(),
    spent: false,
    remove: false,
  });
  game.emit({ type: 'sfx', name: 'whooshBig' });
}

// Money bags burst into coins (and a little fire) where they land.
export function landBag(game, p) {
  p.remove = true;
  game.emit({ type: 'break', x: p.x, y: p.y, z: 4, colors: ['#c8a050', '#f2c94c', '#8a6a3a'], big: true });
  game.emit({ type: 'shake', amount: 2 });
  for (let i = 0; i < 4; i++) {
    game.entities.push(createItem('koin', p.x, p.y + (game.rand() - 0.5) * 12, { z: 10, vz: 140 + game.rand() * 60, vx: (game.rand() - 0.5) * 140 }));
  }
  spawnFire(game, p.x, p.y, 4);
}

export function rescue(game, prop) {
  game.saved++;
  game.addScore(1000);
  game.entities.push({
    uid: nextUid++,
    kind: 'npc',
    def: { look: VILLAGER_LOOK },
    x: prop.x,
    y: prop.y,
    z: 0,
    vx: -90,
    facing: -1,
    state: 'walk',
    t: 0,
    walkDist: 0,
    remove: false,
  });
  game.emit({ type: 'saved', x: prop.x, y: prop.y });
  game.emit({ type: 'sfx', name: 'combo' });
}

export function updateEnvironment(game, dt) {
  const heroes = [...game.heroes.values()];
  let asap = 0;
  for (const e of game.entities) {
    if (e.kind === 'hazard') (e.type === 'candle' ? updateCandle : updateFire)(game, e, dt, heroes);
    else if (e.kind === 'npc') {
      e.t += dt;
      e.x += e.vx * dt;
      e.walkDist += Math.abs(e.vx) * dt;
      if (e.x < game.camera.x - 40) e.remove = true;
    } else if (e.kind === 'enemy' && e.def.poison && e.state !== 'dead') {
      asap++;
      for (const h of heroes) touchPoison(game, e, h);
    }
  }
  for (const h of heroes) {
    if (h.poison > 0) {
      h.poison -= dt;
      h.hp = Math.max(1, h.hp - POISON_DPS * dt);
    }
    if (h.weapon?.id === 'ember') douseWith(game, activeHitbox(h));
  }
  for (const p of game.entities) if (p.kind === 'projectile' && p.weaponId === 'ember') douseWith(game, activeHitbox(p));

  const zone = zoneAt(game.stage, game.camera.x + 240);
  // Trading floor: red bars rain down now and then.
  if (zone?.candles && game.enemies.length && game.rand() < zone.candles * dt) spawnCandles(game, heroes[0] ?? { x: game.camera.x + 240, y: 220 }, 1);
  game.darkness = Math.max(0, game.darkness - dt);
  const target = Math.min(0.85, (zone?.haze ?? game.stage.haze ?? 0) + asap * 0.12);
  game.haze += (target - game.haze) * Math.min(1, dt * 1.5);
}

function updateFire(game, fire, dt, heroes) {
  fire.t += dt;
  if (fire.t > fire.life) {
    fire.remove = true;
    return;
  }
  for (const h of heroes) {
    if (h.invuln > 0 || h.z > 10 || h.state === 'dead') continue;
    if (Math.abs(h.x - fire.x) > FIRE_HALF_W + 6 || Math.abs(h.y - fire.y) > 8) continue;
    const last = fire.hitAt.get(h.uid) ?? -10;
    if (game.time - last < FIRE_TICK) continue;
    fire.hitAt.set(h.uid, game.time);
    react(game, { uid: fire.uid, x: fire.x, facing: 1, team: 'enemy', def: {} }, h, MOVES.fire_burn, { x: h.x, z: 10 });
    game.emit({ type: 'sfx', name: 'fire' });
  }
}

function touchPoison(game, e, h) {
  if (h.invuln > 0 || h.state === 'dead' || h.poisonImmune || (h.poisonCd ?? 0) > game.time) return;
  if (Math.abs(h.x - e.x) > 16 || Math.abs(h.y - e.y) > 10) return;
  h.poison = POISON_TIME;
  h.poisonCd = game.time + 1;
  react(game, e, h, POISON_TOUCH, { x: h.x, z: 40 });
  game.emit({ type: 'poison', who: h });
}

// A bucket of water puts out the fires it swings through.
function douseWith(game, box) {
  if (!box) return;
  for (const f of game.entities) {
    if (f.kind !== 'hazard' || f.remove) continue;
    if (f.x + FIRE_HALF_W < box.x0 || f.x - FIRE_HALF_W > box.x1 || Math.abs(f.y - box.y) > 16) continue;
    f.remove = true;
    game.addScore(50);
    game.emit({ type: 'steam', x: f.x, y: f.y });
    game.emit({ type: 'sfx', name: 'steam' });
  }
}
