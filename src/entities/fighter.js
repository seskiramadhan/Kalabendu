import { BTN } from '../core/input.js';
import { MOVES } from '../combat/moves.js';

export const FRAME = 1 / 60;
const GRAVITY = 980;
const DODGE_TIME = 0.32;
const DODGE_SPEED = 230;
const DODGE_INVULN = 0.26;
const LAND_TIME = 0.08;

export function createHero(def, playerId, x, y) {
  return {
    kind: 'hero',
    playerId,
    def,
    x,
    y,
    z: 0,
    vx: 0,
    vy: 0,
    vz: 0,
    facing: 1,
    state: 'idle',
    t: 0,
    move: null,
    chain: 0,
    queued: null,
    activeEmitted: false,
    airAttacked: false,
    invuln: 0,
    hp: def.maxHp,
    walkDist: 0,
    input: { held: 0, pressed: 0 },
  };
}

function setState(f, state) {
  if (f.state === state) return;
  f.state = state;
  f.t = 0;
}

function axes(held) {
  return {
    x: (held & BTN.RIGHT ? 1 : 0) - (held & BTN.LEFT ? 1 : 0),
    y: (held & BTN.DOWN ? 1 : 0) - (held & BTN.UP ? 1 : 0),
  };
}

function startMove(f, game, moveId, chain = 0) {
  const dir = axes(f.input.held).x;
  if (dir) f.facing = dir;
  f.move = MOVES[moveId];
  f.chain = chain;
  f.queued = null;
  f.activeEmitted = false;
  f.state = 'attack';
  f.t = 0;
  f.vx = 0;
  f.vy = 0;
}

function startJump(f, game, dirX) {
  f.state = 'jump';
  f.t = 0;
  f.vz = f.def.jumpSpeed;
  f.vx = dirX * f.def.walkX * 1.15;
  f.vy = 0;
  f.airAttacked = false;
  game.emit({ type: 'sfx', name: 'jump' });
  game.emit({ type: 'dust', x: f.x, y: f.y, size: 1 });
}

function startDodge(f, game, dir) {
  let dx = dir.x;
  let dy = dir.y;
  if (!dx && !dy) dx = f.facing;
  const len = Math.hypot(dx, dy);
  f.vx = (dx / len) * DODGE_SPEED;
  f.vy = (dy / len) * DODGE_SPEED * 0.6;
  if (dx) f.facing = dx;
  f.state = 'dodge';
  f.t = 0;
  f.invuln = DODGE_INVULN;
  game.emit({ type: 'sfx', name: 'whoosh', power: 0 });
  game.emit({ type: 'dust', x: f.x, y: f.y, size: 1 });
}

export function updateHero(f, game, dt) {
  const { held, pressed } = f.input;
  const dir = axes(held);
  const def = f.def;
  f.t += dt;
  f.invuln = Math.max(0, f.invuln - dt);

  switch (f.state) {
    case 'idle':
    case 'walk': {
      if (pressed & BTN.JUMP) startJump(f, game, dir.x);
      else if (pressed & BTN.DODGE) startDodge(f, game, dir);
      else if (pressed & BTN.LIGHT) startMove(f, game, def.light[0]);
      else if (pressed & BTN.HEAVY) startMove(f, game, def.heavy);
      else {
        f.vx = dir.x * def.walkX;
        f.vy = dir.y * def.walkY;
        if (dir.x) f.facing = dir.x;
        setState(f, dir.x || dir.y ? 'walk' : 'idle');
      }
      break;
    }
    case 'attack': {
      const m = f.move;
      const s = m.startup * FRAME;
      const a = m.active * FRAME;
      const r = m.recovery * FRAME;
      if (pressed & BTN.LIGHT && f.t > s * 0.5 && m.next) f.queued = 'light';
      if (pressed & BTN.HEAVY && f.t > s && m.id !== def.heavy) f.queued = 'heavy';
      if (!f.activeEmitted && f.t >= s) {
        f.activeEmitted = true;
        game.emit({ type: 'sfx', name: m.sfx ?? 'whoosh', power: f.chain });
        game.emit({ type: 'swing', who: f, move: m });
      }
      f.vx = f.t < s + a ? (f.facing * m.step) / (s + a) : 0;
      f.vy = 0;
      if (f.t >= s + a) {
        if (pressed & BTN.DODGE) {
          startDodge(f, game, dir);
          break;
        }
        if (f.queued === 'light' && m.next) {
          startMove(f, game, m.next, f.chain + 1);
          break;
        }
        if (f.queued === 'heavy') {
          startMove(f, game, def.heavy);
          break;
        }
      }
      if (f.t >= s + a + r) setState(f, 'idle');
      break;
    }
    case 'jump': {
      f.vx += (dir.x * def.walkX - f.vx) * Math.min(1, dt * 4);
      if (pressed & (BTN.LIGHT | BTN.HEAVY) && !f.airAttacked) {
        f.airAttacked = true;
        f.move = MOVES[def.air];
        f.activeEmitted = true;
        f.state = 'jumpAttack';
        f.t = 0;
        game.emit({ type: 'sfx', name: 'whoosh', power: 1 });
      }
      break;
    }
    case 'jumpAttack':
      break;
    case 'dodge':
      if (f.t >= DODGE_TIME) {
        f.vx = 0;
        f.vy = 0;
        setState(f, 'idle');
      }
      break;
    case 'land':
      f.vx = 0;
      f.vy = 0;
      if (f.t >= LAND_TIME) setState(f, 'idle');
      break;
  }

  f.x += f.vx * dt;
  f.y += f.vy * dt;
  if (f.state === 'walk') f.walkDist += Math.hypot(f.vx, f.vy) * dt;

  if (f.state === 'jump' || f.state === 'jumpAttack') {
    f.vz -= GRAVITY * dt;
    f.z += f.vz * dt;
    if (f.z <= 0) {
      f.z = 0;
      f.vz = 0;
      f.vx = 0;
      f.state = 'land';
      f.t = 0;
      game.emit({ type: 'sfx', name: 'land' });
      game.emit({ type: 'dust', x: f.x, y: f.y, size: 2 });
    }
  }
}
