import { BTN } from '../core/input.js';
import { canAct, startMove } from '../entities/fighter.js';
import { VIEW_W } from '../core/view.js';

const clampView = (game, x, pad = 30) => Math.max(game.camera.x + pad, Math.min(game.camera.x + VIEW_W - pad, x));

function hero(game, e) {
  let best = null;
  let bestD = Infinity;
  for (const h of game.heroes.values()) {
    if (h.state === 'dead') continue;
    const d = Math.abs(h.x - e.x) + Math.abs(h.y - e.y);
    if (d < bestD) {
      bestD = d;
      best = h;
    }
  }
  return best;
}

function steer(e, tx, ty, dx = 5, dy = 3) {
  let held = 0;
  if (Math.abs(tx - e.x) > dx) held |= tx > e.x ? BTN.RIGHT : BTN.LEFT;
  if (Math.abs(ty - e.y) > dy) held |= ty > e.y ? BTN.DOWN : BTN.UP;
  e.input.held = held;
  return held;
}

function reset(e) {
  e.input.held = 0;
  e.input.pressed = 0;
}

// Keeps a distance band and fires its shot when lined up; swings if cornered.
export function thinkRanged(e, game, dt, rand) {
  const d = e.def;
  const b = (e.brain ??= { cool: 1 + rand() * 1.5, side: rand() < 0.5 ? -1 : 1, yOff: (rand() - 0.5) * 30 });
  reset(e);
  if (!canAct(e)) return;
  const h = hero(game, e);
  if (!h) return;
  b.cool -= dt;
  const dx = h.x - e.x;
  const adx = Math.abs(dx);
  const [min, max] = d.range;
  if (adx < 32 && Math.abs(h.y - e.y) < 8 && d.light.length) {
    e.facing = Math.sign(dx) || e.facing;
    e.input.pressed = BTN.LIGHT;
    return;
  }
  if (b.cool <= 0 && adx >= min * 0.7 && adx <= max * 1.2) {
    if (Math.abs(h.y - e.y) > 5) {
      steer(e, e.x, h.y);
      return;
    }
    e.facing = Math.sign(dx) || e.facing;
    startMove(e, game, d.shot);
    b.cool = d.shotCd + rand();
    return;
  }
  const side = Math.sign(e.x - h.x) || b.side;
  const tx = clampView(game, h.x + side * (min + max) / 2);
  if (!steer(e, tx, h.y + b.yOff, 8, 4)) e.facing = Math.sign(dx) || e.facing;
}

// Allies fight the nearest enemy, or follow the hero.
export function thinkAlly(e, game, dt, rand) {
  const b = (e.brain ??= { cool: rand() });
  reset(e);
  if (!canAct(e)) return;
  b.cool -= dt;
  let target = null;
  let best = Infinity;
  for (const x of game.entities) {
    if (x.kind !== 'enemy' || x.state === 'dead' || x.entering) continue;
    const dist = Math.abs(x.x - e.x) + Math.abs(x.y - e.y);
    if (dist < best) {
      best = dist;
      target = x;
    }
  }
  if (!target) {
    const h = hero(game, e);
    if (h) steer(e, h.x - h.facing * 40, h.y + 14, 20, 6);
    return;
  }
  const side = Math.sign(e.x - target.x) || 1;
  const dx = target.x - e.x;
  if (Math.abs(dx) < e.def.reach && Math.abs(target.y - e.y) < 7) {
    e.facing = Math.sign(dx) || e.facing;
    if (b.cool <= 0) {
      e.input.pressed = BTN.LIGHT;
      b.cool = 0.7 + rand() * 0.6;
    }
    return;
  }
  steer(e, target.x + side * (e.def.reach - 8), target.y);
}

// Tikus Berdasi: rushes in, snatches rupiah on contact, then flees off screen.
export function thinkThief(e, game) {
  reset(e);
  if (!canAct(e)) return;
  if (e.fleeing) {
    const left = e.x - game.camera.x < VIEW_W / 2;
    e.input.held = left ? BTN.LEFT : BTN.RIGHT;
    if (e.x < game.camera.x - 30 || e.x > game.camera.x + VIEW_W + 30) {
      e.remove = true;
      game.emit({ type: 'thiefEscaped', amount: e.loot ?? 0 });
    }
    return;
  }
  const h = hero(game, e);
  if (!h) return;
  if (Math.abs(h.x - e.x) < 14 && Math.abs(h.y - e.y) < 8 && h.invuln <= 0 && h.state !== 'dead') {
    game.steal(e, h);
    e.fleeing = true;
    return;
  }
  steer(e, h.x, h.y, 3, 3);
}

// Makelar Kasus: hangs back near the boss and heals it.
export function thinkSupport(e, game, dt, rand) {
  const b = (e.brain ??= { cool: 2 + rand() });
  reset(e);
  if (!canAct(e)) return;
  const h = hero(game, e);
  if (!h) return;
  b.cool -= dt;
  const boss = game.boss && game.boss.state !== 'dead' ? game.boss : null;
  if (b.cool <= 0) {
    startMove(e, game, e.def.supportMove);
    b.cool = e.def.supportCd + rand();
    return;
  }
  const anchor = boss ?? h;
  const away = Math.sign(e.x - h.x) || 1;
  const tx = clampView(game, (boss ? anchor.x : h.x) + away * 70);
  if (!steer(e, tx, anchor.y - 20, 10, 6)) e.facing = Math.sign(h.x - e.x) || e.facing;
}

// Provokator: stays at a distance and riles the crowd into new attackers.
export function thinkProvokator(e, game, dt, rand) {
  const b = (e.brain ??= { cool: 2 + rand() * 2 });
  reset(e);
  if (!canAct(e)) return;
  const h = hero(game, e);
  if (!h) return;
  b.cool -= dt;
  if (b.cool <= 0 && game.enemies.length < 7) {
    e.facing = Math.sign(h.x - e.x) || e.facing;
    startMove(e, game, e.def.supportMove);
    b.cool = e.def.supportCd + rand() * 2;
    return;
  }
  const away = Math.sign(e.x - h.x) || 1;
  if (!steer(e, clampView(game, h.x + away * 150), h.y - 25, 10, 6)) e.facing = Math.sign(h.x - e.x) || e.facing;
}

// Data-driven boss: def.attacks = [{ move, min, max, weight, align }],
// def.summons = [{ at: hp ratio, enemies?: [...], allies?: [...], tutorial? }].
export function thinkBoss(e, game, dt, rand) {
  const d = e.def;
  const b = (e.brain ??= { cool: 1.4, summoned: 0 });
  reset(e);
  if (!canAct(e)) return;
  const h = hero(game, e);
  if (!h) return;
  const ratio = e.hp / d.maxHp;
  const next = d.summons?.[b.summoned];
  if (next && ratio <= next.at) {
    b.summoned++;
    game.summonGroup(e, next);
  }
  b.cool -= dt;
  const dx = h.x - e.x;
  const adx = Math.abs(dx);
  if (b.cool > 0) {
    const tx = clampView(game, h.x + (Math.sign(e.x - h.x) || 1) * (d.keep ?? 100), 40);
    if (!steer(e, tx, h.y, 20, 6)) e.facing = Math.sign(dx) || e.facing;
    return;
  }
  if (!b.plan) {
    const fits = d.attacks.filter((a) => adx >= (a.min ?? 0) && adx <= (a.max ?? 999));
    const pool = fits.length ? fits : d.attacks;
    let roll = rand() * pool.reduce((s, a) => s + (a.weight ?? 1), 0);
    b.plan = pool.find((a) => (roll -= a.weight ?? 1) <= 0) ?? pool[0];
  }
  const plan = b.plan;
  if (adx > (plan.max ?? 999)) {
    steer(e, h.x, h.y, 10, 4);
    return;
  }
  if (plan.align && Math.abs(h.y - e.y) > 5) {
    steer(e, e.x, h.y);
    return;
  }
  e.facing = Math.sign(dx) || e.facing;
  startMove(e, game, plan.move);
  b.plan = null;
  b.cool = (d.cooldown ?? 1.4) + rand() * 0.8;
}
