import { BTN } from '../core/input.js';
import { canAct } from '../entities/fighter.js';

const MAX_ENGAGED = 2;

// Simple beat 'em up brain: at most two enemies engage at once, the rest
// wait at a distance on either side of the player and take turns.
export function thinkBrawler(e, game, dt, rand) {
  const b = (e.brain ??= {
    cool: 0.6 + rand() * 1.2,
    side: rand() < 0.5 ? -1 : 1,
    yOff: (rand() - 0.5) * 50,
    wait: 80 + rand() * 40,
    comboLeft: 0,
    shuffle: 0,
  });
  e.input.held = 0;
  e.input.pressed = 0;
  const engaged = game.ai.engaged;

  if (!canAct(e) && e.state !== 'attack') {
    if (e.state !== 'hurt') engaged.delete(e.uid);
    return;
  }
  const target = nearestHero(e, game);
  if (!target) return;

  b.cool -= dt;
  b.shuffle -= dt;
  if (b.shuffle <= 0) {
    b.shuffle = 1.2 + rand() * 1.5;
    b.yOff = (rand() - 0.5) * 60;
    if (rand() < 0.25) b.side = -b.side;
  }

  if (e.state === 'attack') {
    if (b.comboLeft > 0 && e.move.next && e.t > e.move.startup / 60) {
      e.input.pressed = BTN.LIGHT;
      b.comboLeft--;
    }
    return;
  }

  const isEngaged = engaged.has(e.uid);
  if (!isEngaged && engaged.size < MAX_ENGAGED && b.cool <= 0) engaged.add(e.uid);

  const side = Math.sign(e.x - target.x) || b.side;
  const reach = e.def.reach;
  let tx;
  let ty;
  if (engaged.has(e.uid)) {
    tx = target.x + side * (reach - 10);
    ty = target.y;
  } else {
    tx = target.x + side * b.wait;
    ty = target.y + b.yOff;
  }

  const dx = tx - e.x;
  const dy = ty - e.y;
  let held = 0;
  if (Math.abs(dx) > 5) held |= dx > 0 ? BTN.RIGHT : BTN.LEFT;
  if (Math.abs(dy) > 3) held |= dy > 0 ? BTN.DOWN : BTN.UP;
  e.input.held = held;
  if (!(held & (BTN.LEFT | BTN.RIGHT))) e.facing = Math.sign(target.x - e.x) || e.facing;

  const inRange = Math.abs(target.x - e.x) < reach && Math.abs(target.y - e.y) < 7;
  const facingTarget = Math.sign(target.x - e.x) === e.facing;
  const targetDown = target.state === 'knockdown' || target.state === 'getup' || target.state === 'dead';
  if (engaged.has(e.uid) && inRange && facingTarget && !targetDown) {
    e.input.held = 0;
    if (rand() < 0.25) {
      e.input.pressed = BTN.HEAVY;
      b.comboLeft = 0;
    } else {
      e.input.pressed = BTN.LIGHT;
      b.comboLeft = rand() < 0.5 ? 1 : 0;
    }
    engaged.delete(e.uid);
    b.cool = 1.1 + rand() * 1.4;
  }
}

function nearestHero(e, game) {
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
