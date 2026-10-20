import { BTN } from '../core/input.js';
import { canAct } from '../entities/fighter.js';
import { VIEW_W } from '../core/view.js';

// Preman Kampung: punches up close, stomps, and rushes across the screen.
// After a rush he is dizzy — the moment to try Kuncian (grab).
export function thinkBossPreman(e, game, dt, rand) {
  const b = (e.brain ??= { cool: 1.2, summoned: false, plan: null });
  e.input.held = 0;
  e.input.pressed = 0;
  if (e.state === 'attack') {
    bossFollowUp(e);
    return;
  }
  if (!canAct(e)) return;

  if (!b.summoned && e.hp < e.def.maxHp * 0.5) {
    b.summoned = true;
    for (const side of [-1, 1]) {
      const x = side < 0 ? game.camera.x - 30 : game.camera.x + VIEW_W + 30;
      const add = game.spawnEnemy('preman', x, e.y + side * 20);
      add.facing = -side;
      add.entering = true;
    }
    game.emit({ type: 'tutorial', key: 'tut_boss_adds' });
  }

  const target = [...game.heroes.values()].find((h) => h.state !== 'dead');
  if (!target) return;
  const dx = target.x - e.x;
  const dy = target.y - e.y;
  const adx = Math.abs(dx);
  b.cool -= dt;

  if (b.cool > 0) {
    // Circle at medium range while waiting.
    const want = 90;
    let held = 0;
    if (adx < want - 15) held |= dx > 0 ? BTN.LEFT : BTN.RIGHT;
    else if (adx > want + 25) held |= dx > 0 ? BTN.RIGHT : BTN.LEFT;
    if (Math.abs(dy) > 6) held |= dy > 0 ? BTN.DOWN : BTN.UP;
    e.input.held = held;
    if (!(held & (BTN.LEFT | BTN.RIGHT))) e.facing = Math.sign(dx) || e.facing;
    return;
  }

  if (!b.plan) b.plan = adx > 120 || rand() < 0.3 ? 'rush' : rand() < 0.35 ? 'stomp' : 'punch';

  if (b.plan === 'rush') {
    if (Math.abs(dy) > 4) {
      e.input.held = dy > 0 ? BTN.DOWN : BTN.UP;
      return;
    }
    e.facing = Math.sign(dx) || e.facing;
    e.input.pressed = BTN.SPECIAL;
  } else {
    const reach = b.plan === 'stomp' ? 40 : e.def.reach;
    if (adx > reach || Math.abs(dy) > 7) {
      let held = dx > 0 ? BTN.RIGHT : BTN.LEFT;
      if (adx < reach) held = 0;
      if (Math.abs(dy) > 5) held |= dy > 0 ? BTN.DOWN : BTN.UP;
      e.input.held = held;
      return;
    }
    e.facing = Math.sign(dx) || e.facing;
    e.input.pressed = b.plan === 'stomp' ? BTN.HEAVY : BTN.LIGHT;
    b.combo = b.plan === 'punch';
  }
  b.plan = null;
  b.cool = 1.4 + rand() * 1.2;
}

// Lets the punch chain continue into the second hit.
function bossFollowUp(e) {
  if (e.brain?.combo && e.state === 'attack' && e.move?.next && e.t > e.move.startup / 60) {
    e.input.pressed = BTN.LIGHT;
    e.brain.combo = false;
  }
}
