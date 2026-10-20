import { TILE } from './world.js';

const EPS = 0.001;

export function moveBody(body, world, dt) {
  body.x += body.vx * dt;
  collideX(body, world);
  body.onGround = false;
  body.y += body.vy * dt;
  collideY(body, world);
}

function collideX(b, world) {
  if (b.vx === 0) return;
  const top = Math.floor(b.y / TILE);
  const bottom = Math.floor((b.y + b.h - EPS) / TILE);
  const tx = b.vx > 0 ? Math.floor((b.x + b.w - EPS) / TILE) : Math.floor(b.x / TILE);
  for (let ty = top; ty <= bottom; ty++) {
    if (!world.isSolid(tx, ty)) continue;
    b.x = b.vx > 0 ? tx * TILE - b.w : (tx + 1) * TILE;
    b.vx = 0;
    return;
  }
}

function collideY(b, world) {
  if (b.vy === 0) return;
  const left = Math.floor(b.x / TILE);
  const right = Math.floor((b.x + b.w - EPS) / TILE);
  const ty = b.vy > 0 ? Math.floor((b.y + b.h - EPS) / TILE) : Math.floor(b.y / TILE);
  for (let tx = left; tx <= right; tx++) {
    if (!world.isSolid(tx, ty)) continue;
    if (b.vy > 0) {
      b.y = ty * TILE - b.h;
      b.onGround = true;
    } else {
      b.y = (ty + 1) * TILE;
    }
    b.vy = 0;
    return;
  }
}

export function overlapsSolid(b, world) {
  const left = Math.floor(b.x / TILE);
  const right = Math.floor((b.x + b.w - EPS) / TILE);
  const top = Math.floor(b.y / TILE);
  const bottom = Math.floor((b.y + b.h - EPS) / TILE);
  for (let ty = top; ty <= bottom; ty++) {
    for (let tx = left; tx <= right; tx++) {
      if (world.isSolid(tx, ty)) return true;
    }
  }
  return false;
}
