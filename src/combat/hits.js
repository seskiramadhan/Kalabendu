import { FRAME } from '../entities/fighter.js';
import { MOVES } from './moves.js';

const BODY_W = 10;
const BODY_H = 60;
const JUGGLE_DECAY = 0.82;

// Team an attack counts for: a thrown enemy fights for the hero who threw it.
function teamOf(e) {
  return e.thrown ? 'hero' : e.team;
}

export function activeHitbox(f) {
  if (f.kind === 'projectile') return boxAround(f, f.move.hit);
  if (f.thrown && f.state === 'airborne') return boxAround(f, MOVES.thrown_body.hit);
  const m = f.move;
  if (!m?.hit) return null;
  const s = m.startup * FRAME;
  let active = false;
  if (f.state === 'attack') active = f.t >= s && f.t < s + m.active * FRAME;
  else if (f.state === 'jumpAttack') active = f.t >= s;
  if (!active) return null;
  const scale = f.def.size ?? 1;
  const h = m.hit;
  const w = h.w * scale;
  const x0 = f.facing > 0 ? f.x + h.x * scale : f.x - h.x * scale - w;
  return { x0, x1: x0 + w, z0: f.z + h.z * scale, z1: f.z + (h.z + h.h) * scale, y: f.y, depth: h.depth };
}

function boxAround(e, h) {
  return { x0: e.x + h.x, x1: e.x + h.x + h.w, z0: e.z + h.z, z1: e.z + h.z + h.h, y: e.y, depth: h.depth };
}

export function hurtbox(f) {
  if (f.kind === 'prop') return { x0: f.x - f.def.w / 2, x1: f.x + f.def.w / 2, z0: 0, z1: f.def.h };
  if (f.kind !== 'hero' && f.kind !== 'enemy' && f.kind !== 'ally') return null;
  if (f.thrown || f.state === 'knockdown' || f.state === 'getup' || f.state === 'dead') return null;
  const scale = f.def.size ?? 1;
  if (f.state === 'airborne') {
    return { x0: f.x - 16 * scale, x1: f.x + 16 * scale, z0: f.z, z1: f.z + 30 * scale };
  }
  const bw = f.def.body?.w ?? BODY_W * scale;
  const bh = f.def.body?.h ?? BODY_H * scale;
  return { x0: f.x - bw, x1: f.x + bw, z0: f.z, z1: f.z + bh };
}

export function resolveHits(game) {
  for (const attacker of game.entities) {
    const hb = activeHitbox(attacker);
    if (!hb) continue;
    const team = teamOf(attacker);
    const move = attacker.kind === 'projectile' ? attacker.move : attacker.thrown ? MOVES.thrown_body : attacker.move;
    for (const target of game.entities) {
      if (target === attacker || target.team === team || target.invuln > 0) continue;
      if (target.kind === 'prop' && team !== 'hero') continue;
      if (attacker.hitIds.has(target.uid)) continue;
      const tb = hurtbox(target);
      if (!tb) continue;
      if (Math.abs(target.y - hb.y) > hb.depth) continue;
      if (hb.x1 < tb.x0 || hb.x0 > tb.x1 || hb.z1 < tb.z0 || hb.z0 > tb.z1) continue;
      attacker.hitIds.add(target.uid);
      const contact = {
        x: (Math.max(hb.x0, tb.x0) + Math.min(hb.x1, tb.x1)) / 2,
        z: (Math.max(hb.z0, tb.z0) + Math.min(hb.z1, tb.z1)) / 2,
      };
      if (target.kind === 'prop') hitProp(game, attacker, target, move, contact);
      else react(game, attacker, target, move, contact);
      if (attacker.kind === 'projectile') {
        attacker.spent = true;
        break;
      }
    }
  }
}

function owner(game, attacker) {
  if (attacker.kind === 'projectile' || attacker.thrown) return game.byUid(attacker.ownerUid);
  return attacker;
}

function hitProp(game, attacker, prop, m, contact) {
  prop.hp -= m.damage;
  prop.lastHitAt = game.time;
  game.hitstop = Math.max(game.hitstop, 0.04);
  game.emit({ type: 'hit', x: contact.x, y: prop.y, z: contact.z, heavy: false });
  game.emit({ type: 'sfx', name: 'thud' });
  wearWeapon(game, attacker, m);
  if (prop.hp <= 0) game.breakProp(prop);
}

function wearWeapon(game, attacker, m) {
  if (!m.weapon || !attacker.weapon) return;
  attacker.weapon.durability--;
  if (attacker.weapon.durability <= 0) {
    game.emit({ type: 'break', x: attacker.x + attacker.facing * 20, y: attacker.y, z: 30, colors: ['#c7b36a', '#7a4e24', '#d8433a'] });
    game.emit({ type: 'sfx', name: 'thud' });
    attacker.weapon = null;
  }
}

// Applies one hit's damage and reaction. opts: keepGrabbed (knee strikes),
// launchDir + thrown (Bantingan).
const BLOCKABLE_STATES = new Set(['idle', 'walk', 'block']);

// Shield bearers stop hits from the front unless the hit is a heavy,
// knockdown, special, throw or grab.
function blocks(attacker, target, m, opts) {
  if (!target.def.block || !BLOCKABLE_STATES.has(target.state) || opts.keepGrabbed || opts.thrown) return false;
  if (m.knockdown || m.special || m.unblockable) return false;
  const from = Math.sign(attacker.x - target.x) || attacker.facing * -1;
  return from === target.facing;
}

export function react(game, attacker, target, m, contact, opts = {}) {
  const hero = owner(game, attacker);
  if (target.shielded) {
    game.emit({ type: 'block', x: contact.x, y: target.y, z: contact.z });
    game.emit({ type: 'sfx', name: 'block' });
    return;
  }
  if (blocks(attacker, target, m, opts)) {
    target.state = 'block';
    target.t = 0;
    game.hitstop = Math.max(game.hitstop, 0.04);
    if (attacker.kind !== 'projectile') attacker.vx = -attacker.facing * 60;
    game.emit({ type: 'block', x: contact.x, y: target.y, z: contact.z });
    game.emit({ type: 'sfx', name: 'block' });
    wearWeapon(game, attacker, m);
    return;
  }
  // Guarded bosses take reduced damage until they are dizzy.
  const guard = target.def.guard && target.state !== 'dizzy' ? target.def.guard : 1;
  const bonus = hero?.team === 'hero' && target.team !== 'hero' ? hero.dmgMul ?? 1 : 1;
  const taken = target.team === 'hero' ? target.takeMul ?? 1 : 1;
  target.hp = Math.max(0, target.hp - m.damage * guard * bonus * taken);
  target.lastHitAt = game.time;
  if (hero?.kind === 'hero' && target.team !== 'hero') game.heroLanded(hero, m);
  if (target.team === 'hero') game.heroHurt(target, m);
  if (target.weapon && target.state !== 'grabbed') game.dropWeapon(target);
  wearWeapon(game, attacker, m);

  const dir = opts.launchDir ?? (attacker.x <= target.x ? 1 : -1);
  const armored = target.def.armor && !m.knockdown && target.state !== 'dizzy' && target.state !== 'grabbed' && target.hp > 0;
  const heavy = m.knockdown || m.damage >= 8;
  game.hitstop = Math.max(game.hitstop, m.hitstop ?? (heavy ? 0.11 : 0.055));
  game.emit({ type: 'hit', x: contact.x, y: target.y, z: contact.z, heavy, attacker, target, damage: m.damage });
  game.emit({ type: 'sfx', name: heavy ? 'hitHeavy' : 'hit', power: 1 });
  game.emit({ type: 'shake', amount: m.shake ?? (heavy ? 3 : 1) });

  if (armored) return;
  if (opts.keepGrabbed && target.hp > 0) return;
  // Machines and giants never flinch; haze spirits only drift back.
  if (target.def.immovable || target.def.float) {
    if (target.hp <= 0) {
      target.state = 'dead';
      target.t = 0;
      target.move = null;
      game.emit({ type: 'break', x: target.x, y: target.y, z: 30, colors: target.def.float ? ['#9a9a9a', '#c8c8c8', '#7a7a7a'] : ['#f2c94c', '#3a3a3a', '#7a4e24'], big: true });
      game.onKill(target);
    } else if (target.def.float) {
      target.state = 'hurt';
      target.t = 0;
      target.stun = 0.25;
      target.vx = dir * m.push * 0.8;
    }
    return;
  }

  target.facing = -dir;
  target.move = null;
  const inAir = target.state === 'airborne' || target.z > 0;
  if (m.launch || inAir || target.hp <= 0) {
    const base = m.launch || (target.hp <= 0 ? 220 : 160);
    let vz = inAir ? Math.max(base * 0.7, 150) : base;
    if ((target.def.size ?? 1) > 1) vz *= 0.65;
    target.vz = vz * Math.pow(JUGGLE_DECAY, target.juggles);
    target.juggles++;
    target.vx = dir * (opts.thrown ? 210 : m.push * (inAir ? 0.7 : 1));
    target.vy = 0;
    target.z = Math.max(target.z, 1);
    target.bounced = false;
    target.state = 'airborne';
    target.t = 0;
    if (opts.thrown) {
      target.thrown = true;
      target.ownerUid = attacker.uid;
      target.hitIds.clear();
    }
  } else {
    target.state = 'hurt';
    target.t = 0;
    target.stun = (m.stun ?? 16) * FRAME;
    target.vx = dir * m.push;
    target.hurtFrame = (target.hurtFrame + 1) % 2;
  }
  if (target.hp <= 0) game.onKill(target);
  else applyEffect(game, attacker, target, m);
}

// Extra effects carried by some shots: freeze ("fines"), pull (debt chain),
// fine (takes rupiah).
function applyEffect(game, attacker, target, m) {
  if (!m.effect || target.team !== 'hero') return;
  if (m.effect === 'freeze') {
    target.state = 'frozen';
    target.t = 0;
    target.stun = m.freeze ?? 1.2;
    target.vx = 0;
    game.emit({ type: 'frozen', who: target });
  } else if (m.effect === 'pull') {
    const src = owner(game, attacker) ?? attacker;
    target.vx = Math.sign(src.x - target.x) * 260;
  }
  if (m.fine) game.fine(target, m.fine);
}
