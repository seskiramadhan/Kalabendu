import { BTN } from '../core/input.js';
import { MOVES } from '../combat/moves.js';
import { WEAPONS } from '../combat/weapons.js';

export const FRAME = 1 / 60;
const GRAVITY = 980;
const DODGE_TIME = 0.32;
const DODGE_SPEED = 230;
const DODGE_INVULN = 0.26;
const LAND_TIME = 0.08;
const KNOCKDOWN_TIME = 0.6;
const GETUP_TIME = 0.35;
const GETUP_INVULN = 0.9;
const DEAD_TIME = 1.4;
const GRAB_TIME = 1.8;
const KNEE_TIME = 0.22;
const THROW_TIME = 0.35;

let nextUid = 1;

// Heroes and enemies share this body. Heroes read input from players,
// enemies from their AI; both arrive as held/pressed button bits.
export function createFighter(def, team, x, y) {
  return {
    uid: nextUid++,
    kind: team === 'hero' ? 'hero' : 'enemy',
    team,
    def,
    x,
    y,
    z: def.float ?? 0,
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
    hitIds: new Set(),
    invuln: 0,
    stun: 0,
    juggles: 0,
    bounced: false,
    hurtFrame: 0,
    hp: def.maxHp,
    weapon: def.weapon ? { id: def.weapon, durability: WEAPONS[def.weapon].durability } : null,
    grabbedUid: null,
    knees: 0,
    kneeT: 0,
    thrown: false,
    ownerUid: null,
    dizzyTime: 0,
    killed: false,
    semangat: 0,
    lives: team === 'hero' ? 3 : 0,
    rehitK: -1,
    respawnDrop: false,
    lastHitAt: -10,
    walkDist: 0,
    remove: false,
    input: { held: 0, pressed: 0 },
  };
}

export function setState(f, state) {
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

export function isAirState(state) {
  return state === 'jump' || state === 'jumpAttack' || state === 'airborne';
}

export function lightChain(f) {
  return f.weapon ? WEAPONS[f.weapon.id].light : f.def.light;
}

export function canAct(f) {
  return f.state === 'idle' || f.state === 'walk';
}

export function startMove(f, game, moveId, chain = 0) {
  const dir = axes(f.input.held).x;
  if (dir) f.facing = dir;
  f.move = MOVES[moveId];
  f.chain = chain;
  f.queued = null;
  f.activeEmitted = false;
  f.hitIds.clear();
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
  const speed = DODGE_SPEED * (f.def.dodgeMul ?? 1);
  f.vx = (dx / len) * speed;
  f.vy = (dy / len) * speed * 0.6;
  if (dx) f.facing = dx;
  f.state = 'dodge';
  f.t = 0;
  f.invuln = DODGE_INVULN;
  game.emit({ type: 'sfx', name: 'whoosh', power: 0 });
  game.emit({ type: 'dust', x: f.x, y: f.y, size: 1 });
}

function startAirAttack(f, game, moveId) {
  f.airAttacked = true;
  f.move = MOVES[moveId];
  f.activeEmitted = false;
  f.hitIds.clear();
  f.state = 'jumpAttack';
  f.t = 0;
}

export function updateFighter(f, game, dt) {
  const { held, pressed } = f.input;
  const dir = axes(held);
  const def = f.def;
  f.t += dt;
  f.invuln = Math.max(0, f.invuln - dt);

  switch (f.state) {
    case 'idle':
    case 'walk': {
      if (pressed & BTN.JUMP && def.jumpSpeed) startJump(f, game, dir.x);
      else if (pressed & BTN.DODGE && def.canDodge) startDodge(f, game, dir);
      else if (pressed & BTN.LIGHT) {
        if (!(f.kind === 'hero' && game.tryPickup(f))) startMove(f, game, lightChain(f)[0]);
      } else if (pressed & BTN.HEAVY && f.weapon && f.kind === 'hero') startMove(f, game, 'throw_anim');
      else if (pressed & BTN.HEAVY && def.heavy) startMove(f, game, def.heavy);
      else if (pressed & BTN.SPECIAL && def.special) trySpecial(f, game);
      else {
        const slow = game.slowAt?.(f) ?? 1;
        f.vx = dir.x * def.walkX * slow;
        f.vy = dir.y * def.walkY * slow;
        if (dir.x) f.facing = dir.x;
        setState(f, dir.x || dir.y ? 'walk' : 'idle');
        const target = def.canGrab && dir.x ? game.findGrabTarget(f, dir.x) : null;
        if (target) startGrab(f, game, target);
      }
      break;
    }
    case 'attack': {
      const m = f.move;
      const s = m.startup * FRAME;
      const a = m.active * FRAME;
      const r = m.recovery * FRAME;
      if (pressed & BTN.LIGHT && f.t > s * 0.5 && m.next) f.queued = 'light';
      if (pressed & BTN.HEAVY && f.t > s && def.heavy && !f.weapon && m.id !== def.heavy) f.queued = 'heavy';
      if (!f.activeEmitted && f.t >= s) {
        f.activeEmitted = true;
        if (m.throws) game.throwWeapon(f);
        else if (m.spawnFire) game.spawnFireAhead(f, m.spawnFire);
        else if (m.throwsBag) game.throwBag(f);
        if (m.shoot) game.shoot(f, m.shoot);
        if (m.candles) game.spawnCandles(f, m.candles);
        if (m.heal) game.healNear(f, m.heal);
        if (m.summon) game.summon(f, m.summon);
        if (m.darkness) game.darkness = m.darkness;
        if (!m.throws) game.emit({ type: 'sfx', name: m.sfx ?? 'whoosh', power: f.chain });
        if (!m.throws && m.hit) game.emit({ type: 'swing', who: f, move: m });
      }
      if (m.lunge) f.vx = f.t >= s && f.t < s + a ? f.facing * m.lunge : 0;
      else f.vx = f.t < s + a ? (f.facing * m.step) / (s + a) : 0;
      f.vy = 0;
      if (m.rehit && f.t >= s) {
        const k = Math.floor((f.t - s) / (m.rehit * FRAME));
        if (k !== f.rehitK) {
          f.rehitK = k;
          f.hitIds.clear();
        }
      }
      if (pressed & BTN.SPECIAL && f.kind === 'hero' && def.special && m.id !== def.special && f.t >= s) {
        trySpecial(f, game);
        break;
      }
      if (f.t >= s + a) {
        if (pressed & BTN.DODGE && def.canDodge) {
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
      if (f.t >= s + a + r) {
        if (m.dizzyAfter) {
          setState(f, 'dizzy');
          f.dizzyTime = m.dizzyAfter;
          game.emit({ type: 'dizzy', who: f });
        } else setState(f, 'idle');
      }
      break;
    }
    case 'grab':
      updateGrab(f, game, dt, dir, pressed);
      break;
    case 'throw':
      f.vx = 0;
      if (f.t >= THROW_TIME) setState(f, 'idle');
      break;
    case 'grabbed':
      f.vx = 0;
      f.vy = 0;
      if (f.t > GRAB_TIME + 0.8) setState(f, 'idle');
      break;
    case 'frozen':
      f.vx = 0;
      f.vy = 0;
      if (f.t >= f.stun) {
        f.netted = false;
        setState(f, 'idle');
      }
      break;
    case 'block':
      f.vx *= Math.max(0, 1 - dt * 10);
      f.vy = 0;
      if (f.t >= 0.3) setState(f, 'idle');
      break;
    case 'dizzy':
      f.vx = 0;
      f.vy = 0;
      if (f.t >= f.dizzyTime) setState(f, 'idle');
      break;
    case 'jump': {
      f.vx += (dir.x * def.walkX - f.vx) * Math.min(1, dt * 4);
      if (!f.airAttacked && def.air) {
        if (pressed & BTN.LIGHT) startAirAttack(f, game, def.air.light);
        else if (pressed & BTN.HEAVY) startAirAttack(f, game, def.air.heavy);
      }
      break;
    }
    case 'jumpAttack':
      if (!f.activeEmitted && f.t >= f.move.startup * FRAME) {
        f.activeEmitted = true;
        game.emit({ type: 'sfx', name: f.move.sfx ?? 'whoosh', power: 1 });
        game.emit({ type: 'swing', who: f, move: f.move });
      }
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
    case 'hurt':
      f.vx *= Math.max(0, 1 - dt * 9);
      f.vy = 0;
      // A special can break out of hitstun, at the cost of Semangat.
      if (pressed & BTN.SPECIAL && f.kind === 'hero' && def.special) {
        trySpecial(f, game);
        break;
      }
      if (f.t >= f.stun) setState(f, 'idle');
      break;
    case 'airborne':
      break;
    case 'knockdown':
      f.vx *= Math.max(0, 1 - dt * 10);
      if (f.t >= KNOCKDOWN_TIME) {
        if (f.hp <= 0) {
          setState(f, 'dead');
        } else {
          setState(f, 'getup');
          f.invuln = GETUP_INVULN;
        }
      }
      break;
    case 'getup':
      f.vx = 0;
      if (f.t >= GETUP_TIME) {
        f.juggles = 0;
        setState(f, 'idle');
      }
      break;
    case 'dead':
      f.vx = 0;
      if (def.float) f.z += dt * 20;
      if (f.t >= DEAD_TIME && f.kind !== 'hero') f.remove = true;
      break;
  }

  f.x += f.vx * dt;
  f.y += f.vy * dt;
  if (f.state === 'walk') f.walkDist += Math.hypot(f.vx, f.vy) * dt;

  if (isAirState(f.state)) {
    f.vz -= GRAVITY * dt;
    f.z += f.vz * dt;
    if (f.z <= 0) land(f, game);
  }
}

export const SPECIAL_COST = 50;

function trySpecial(f, game) {
  if (f.kind === 'hero') {
    if (f.semangat < SPECIAL_COST) {
      game.emit({ type: 'noSemangat', who: f });
      return false;
    }
    f.semangat -= SPECIAL_COST;
  }
  startMove(f, game, f.def.special);
  const m = f.move;
  if (m.invulnFrames) f.invuln = Math.max(f.invuln, m.invulnFrames * FRAME);
  f.rehitK = -1;
  game.emit({ type: 'special', who: f });
  game.emit({ type: 'label', who: f, key: m.nameKey });
  game.emit({ type: 'sfx', name: 'special' });
  return true;
}

function startGrab(f, game, e) {
  f.state = 'grab';
  f.t = 0;
  f.grabbedUid = e.uid;
  f.knees = 0;
  f.kneeT = 0;
  f.vx = 0;
  f.vy = 0;
  f.facing = Math.sign(e.x - f.x) || f.facing;
  e.state = 'grabbed';
  e.t = 0;
  e.vx = 0;
  e.vy = 0;
  e.move = null;
  game.ai.engaged.delete(e.uid);
  game.emit({ type: 'label', who: f, key: 'move_kuncian' });
  game.emit({ type: 'sfx', name: 'grab' });
}

// Kuncian: J = knee strike (third one throws), K or J pressed away = Bantingan.
function updateGrab(f, game, dt, dir, pressed) {
  const e = game.byUid(f.grabbedUid);
  if (!e || e.state !== 'grabbed') {
    setState(f, 'idle');
    return;
  }
  f.vx = 0;
  f.vy = 0;
  const size = e.def.size ?? 1;
  e.x = f.x + f.facing * 18 * size;
  e.y = f.y + 0.5;
  e.z = 0;
  e.facing = -f.facing;
  f.kneeT = Math.max(0, f.kneeT - dt);

  const away = dir.x === -f.facing;
  if (pressed & BTN.HEAVY || (pressed & BTN.LIGHT && (away || f.knees >= 2))) {
    const throwDir = away ? -f.facing : f.facing;
    f.facing = throwDir;
    f.state = 'throw';
    f.t = 0;
    game.emit({ type: 'label', who: f, key: 'move_bantingan' });
    game.directHit(f, e, MOVES.bantingan, { launchDir: throwDir, thrown: true });
    return;
  }
  if (pressed & BTN.LIGHT && f.kneeT <= 0) {
    f.kneeT = KNEE_TIME;
    f.knees++;
    game.emit({ type: 'label', who: f, key: 'move_knee' });
    game.directHit(f, e, MOVES.kuncian_knee, { keepGrabbed: true });
    if (e.state === 'grabbed') e.t = 0;
    return;
  }
  if (f.t > GRAB_TIME) {
    e.state = 'idle';
    e.t = 0;
    e.vx = f.facing * 80;
    setState(f, 'idle');
  }
}

function land(f, game) {
  f.z = 0;
  f.thrown = false;
  if (f.respawnDrop) {
    f.respawnDrop = false;
    game.shockwave(f);
  }
  if (f.state === 'airborne') {
    if (!f.bounced && f.vz < -150) {
      f.bounced = true;
      f.vz = -f.vz * 0.3;
      f.vx *= 0.5;
      game.emit({ type: 'sfx', name: 'thud' });
      game.emit({ type: 'dust', x: f.x, y: f.y, size: 2 });
      game.emit({ type: 'shake', amount: 2 });
      return;
    }
    f.vz = 0;
    f.state = 'knockdown';
    f.t = 0;
    game.emit({ type: 'dust', x: f.x, y: f.y, size: 1 });
    return;
  }
  f.vz = 0;
  f.vx = 0;
  f.state = 'land';
  f.t = 0;
  game.emit({ type: 'sfx', name: 'land' });
  game.emit({ type: 'dust', x: f.x, y: f.y, size: 2 });
}
