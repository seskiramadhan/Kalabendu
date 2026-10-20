import { TILE } from './world.js';
import { moveBody, overlapsSolid } from './physics.js';

const WALK_SPEED = 170;
const ACCEL_GROUND = 1600;
const ACCEL_AIR = 900;
const GRAVITY = 1700;
const JUMP_SPEED = 520;
const JUMP_CUT = 0.45;
const MAX_FALL = 900;
const COYOTE_TIME = 0.1;
const JUMP_BUFFER = 0.12;

export function createPlayer(id, tileX, tileY) {
  return {
    id,
    x: tileX * TILE + 2,
    y: tileY * TILE - 28,
    w: 12,
    h: 28,
    vx: 0,
    vy: 0,
    onGround: false,
    facing: 1,
    hp: 100,
    maxHp: 100,
    rupiah: 0,
    intent: { move: 0, jump: false },
    jumpWasHeld: false,
    coyote: 0,
    jumpBuffer: 0,
    walkTime: 0,
  };
}

export function updatePlayer(p, world, dt) {
  const { move, jump } = p.intent;

  const target = move * WALK_SPEED;
  const accel = p.onGround ? ACCEL_GROUND : ACCEL_AIR;
  p.vx = approach(p.vx, target, accel * dt);
  if (move !== 0) p.facing = move;

  p.coyote = p.onGround ? COYOTE_TIME : Math.max(0, p.coyote - dt);
  if (jump && !p.jumpWasHeld) p.jumpBuffer = JUMP_BUFFER;
  else p.jumpBuffer = Math.max(0, p.jumpBuffer - dt);

  if (p.jumpBuffer > 0 && p.coyote > 0) {
    p.vy = -JUMP_SPEED;
    p.jumpBuffer = 0;
    p.coyote = 0;
  }
  if (!jump && p.jumpWasHeld && p.vy < 0) p.vy *= JUMP_CUT;
  p.jumpWasHeld = jump;

  p.vy = Math.min(p.vy + GRAVITY * dt, MAX_FALL);

  const wasGrounded = p.onGround;
  const vxBefore = p.vx;
  moveBody(p, world, dt);
  if (wasGrounded && vxBefore !== 0 && p.vx === 0) tryStepUp(p, world, vxBefore, dt);

  p.walkTime = p.onGround && Math.abs(p.vx) > 10 ? p.walkTime + dt : 0;
}

function tryStepUp(p, world, vx, dt) {
  const probe = { x: p.x + Math.sign(vx) * 2, y: p.y - TILE, w: p.w, h: p.h };
  if (overlapsSolid(probe, world)) return;
  p.y -= TILE;
  p.vx = vx;
  p.x += vx * dt;
  if (overlapsSolid(p, world)) {
    p.x -= vx * dt;
    p.y += TILE;
    p.vx = 0;
  }
}

function approach(v, target, step) {
  if (v < target) return Math.min(v + step, target);
  if (v > target) return Math.max(v - step, target);
  return v;
}
