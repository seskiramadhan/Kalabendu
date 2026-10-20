import { FRAME } from '../entities/fighter.js';

const BODY_W = 10;
const BODY_H = 60;
const JUGGLE_DECAY = 0.82;

export function activeHitbox(f) {
  const m = f.move;
  if (!m) return null;
  const s = m.startup * FRAME;
  let active = false;
  if (f.state === 'attack') active = f.t >= s && f.t < s + m.active * FRAME;
  else if (f.state === 'jumpAttack') active = f.t >= s;
  if (!active) return null;
  const h = m.hit;
  const x0 = f.facing > 0 ? f.x + h.x : f.x - h.x - h.w;
  return { x0, x1: x0 + h.w, z0: f.z + h.z, z1: f.z + h.z + h.h, y: f.y, depth: h.depth };
}

export function hurtbox(f) {
  if (f.state === 'knockdown' || f.state === 'getup' || f.state === 'dead') return null;
  const scale = f.def.size ?? 1;
  if (f.state === 'airborne') {
    return { x0: f.x - 16 * scale, x1: f.x + 16 * scale, z0: f.z, z1: f.z + 30 * scale };
  }
  return { x0: f.x - BODY_W * scale, x1: f.x + BODY_W * scale, z0: f.z, z1: f.z + BODY_H * scale };
}

// Checks every active hitbox against every opposing hurtbox.
export function resolveHits(game) {
  for (const attacker of game.entities) {
    const hb = activeHitbox(attacker);
    if (!hb) continue;
    for (const target of game.entities) {
      if (target.team === attacker.team || target.invuln > 0 || attacker.hitIds.has(target.uid)) continue;
      const tb = hurtbox(target);
      if (!tb) continue;
      if (Math.abs(target.y - hb.y) > hb.depth) continue;
      if (hb.x1 < tb.x0 || hb.x0 > tb.x1 || hb.z1 < tb.z0 || hb.z0 > tb.z1) continue;
      applyHit(game, attacker, target, hb, tb);
    }
  }
}

function applyHit(game, attacker, target, hb, tb) {
  const m = attacker.move;
  attacker.hitIds.add(target.uid);
  target.hp = Math.max(0, target.hp - m.damage);
  target.lastHitAt = game.time;
  const dir = attacker.x <= target.x ? 1 : -1;
  target.facing = -dir;
  target.move = null;

  const inAir = target.state === 'airborne' || target.z > 0;
  if (m.launch || inAir || target.hp <= 0) {
    const base = m.launch || (target.hp <= 0 ? 220 : 160);
    const vz = inAir ? Math.max(base * 0.7, 150) : base;
    target.vz = vz * Math.pow(JUGGLE_DECAY, target.juggles);
    target.juggles++;
    target.vx = dir * m.push * (inAir ? 0.7 : 1);
    target.vy = 0;
    target.z = Math.max(target.z, 1);
    target.bounced = false;
    target.state = 'airborne';
    target.t = 0;
  } else {
    target.state = 'hurt';
    target.t = 0;
    target.stun = (m.stun ?? 16) * FRAME;
    target.vx = dir * m.push;
    target.hurtFrame = (target.hurtFrame + 1) % 2;
  }

  const heavy = m.knockdown || m.damage >= 8;
  game.hitstop = Math.max(game.hitstop, m.hitstop ?? (heavy ? 0.11 : 0.055));
  const cx = (Math.max(hb.x0, tb.x0) + Math.min(hb.x1, tb.x1)) / 2;
  const cz = (Math.max(hb.z0, tb.z0) + Math.min(hb.z1, tb.z1)) / 2;
  game.emit({ type: 'hit', x: cx, y: target.y, z: cz, heavy, attacker, target });
  game.emit({ type: 'sfx', name: heavy ? 'hitHeavy' : 'hit', power: 1 });
  game.emit({ type: 'shake', amount: m.shake ?? (heavy ? 3 : 1) });
}
