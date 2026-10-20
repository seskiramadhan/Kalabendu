import { BTN } from '../core/input.js';
import { canAct } from '../entities/fighter.js';
import { VIEW_W } from '../core/view.js';

function target(game) {
  return [...game.heroes.values()].find((h) => h.state !== 'dead') ?? null;
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

// Pembakar Lahan: keeps his distance and lights lines of fire toward you;
// swings the torch if you get close.
export function thinkArsonist(e, game, dt, rand) {
  const b = (e.brain ??= { cool: 1.5 + rand() * 1.5, side: rand() < 0.5 ? -1 : 1, yOff: (rand() - 0.5) * 40 });
  reset(e);
  if (!canAct(e)) return;
  const h = target(game);
  if (!h) return;
  b.cool -= dt;
  const dx = h.x - e.x;
  const side = Math.sign(e.x - h.x) || b.side;
  if (Math.abs(dx) < 34 && Math.abs(h.y - e.y) < 8 && b.cool < 0.8) {
    e.facing = Math.sign(dx) || e.facing;
    e.input.pressed = BTN.LIGHT;
    b.cool = 1.2;
    return;
  }
  if (b.cool <= 0 && Math.abs(dx) < 200) {
    if (Math.abs(h.y - e.y) > 5) {
      steer(e, e.x, h.y);
      return;
    }
    e.facing = Math.sign(dx) || e.facing;
    e.input.pressed = BTN.SPECIAL;
    b.cool = 3.2 + rand() * 1.5;
    return;
  }
  const tx = Math.max(game.camera.x + 30, Math.min(game.camera.x + VIEW_W - 30, h.x + side * 110));
  if (!steer(e, tx, h.y + b.yOff, 8, 4)) e.facing = Math.sign(dx) || e.facing;
}

// Asap: drifts toward you, wobbling; touching you poisons.
export function thinkHaze(e, game, dt) {
  reset(e);
  if (!canAct(e)) return;
  const h = target(game);
  if (!h) return;
  const wob = Math.sin(game.time * 2 + e.uid) * 18;
  if (!steer(e, h.x, h.y + wob, 6, 4)) e.facing = Math.sign(h.x - e.x) || e.facing;
}

// Buldoser Liar: drives to the screen edge, lines up, honks, then charges.
// After a charge it stalls (dizzy): the moment to hit it.
export function thinkDozer(e, game, dt, rand) {
  const b = (e.brain ??= { cool: 1 });
  reset(e);
  if (!canAct(e)) return;
  const h = target(game);
  if (!h) return;
  b.cool -= dt;
  const left = game.camera.x + 40;
  const right = game.camera.x + VIEW_W - 40;
  const fromLeft = h.x > game.camera.x + VIEW_W / 2;
  const edge = fromLeft ? left : right;
  if (Math.abs(e.x - edge) > 12 || Math.abs(e.y - h.y) > 4) {
    steer(e, edge, h.y, 10, 3);
    e.facing = fromLeft ? 1 : -1;
    return;
  }
  e.facing = fromLeft ? 1 : -1;
  if (b.cool <= 0) {
    e.input.pressed = BTN.SPECIAL;
    b.cool = 0.8 + rand();
  }
}

// Raja Sawit: log smash up close (log gets stuck = dizzy), walls of fire at
// mid range, money bags from far away; calls a bulldozer at 2/3 and 1/3 hp.
export function thinkRajaSawit(e, game, dt, rand) {
  const b = (e.brain ??= { cool: 1.5, calls: 0 });
  reset(e);
  if (!canAct(e)) return;
  const h = target(game);
  if (!h) return;
  const ratio = e.hp / e.def.maxHp;
  const wantCalls = ratio < 0.34 ? 2 : ratio < 0.67 ? 1 : 0;
  if (b.calls < wantCalls && !game.enemies.some((x) => x.def.id === 'buldoser' && x.state !== 'dead')) {
    b.calls++;
    const fromLeft = h.x > e.x;
    const dz = game.spawnEnemy('buldoser', fromLeft ? game.camera.x - 40 : game.camera.x + VIEW_W + 40, h.y, { minion: true });
    dz.entering = true;
    game.emit({ type: 'tutorial', key: 'tut_raja_dozer' });
  }
  b.cool -= dt;
  const dx = h.x - e.x;
  const adx = Math.abs(dx);
  if (b.cool > 0) {
    const tx = Math.max(game.camera.x + 40, Math.min(game.camera.x + VIEW_W - 40, h.x + Math.sign(e.x - h.x || 1) * 110));
    if (!steer(e, tx, h.y, 20, 6)) e.facing = Math.sign(dx) || e.facing;
    return;
  }
  e.facing = Math.sign(dx) || e.facing;
  if (adx < 80) {
    if (Math.abs(h.y - e.y) > 8) {
      steer(e, e.x, h.y);
      return;
    }
    e.input.pressed = BTN.LIGHT;
  } else if (adx < 200 && rand() < 0.6) e.input.pressed = BTN.HEAVY;
  else e.input.pressed = BTN.SPECIAL;
  b.cool = 1.6 + rand() * 1.2;
}
