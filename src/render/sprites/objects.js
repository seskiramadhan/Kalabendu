import { WEAPONS } from '../../combat/weapons.js';

const OUT = '#120c0a';

function r(ctx, color, x, y, w, h) {
  ctx.fillStyle = color;
  ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
}

export function drawProp(ctx, p, camX, time) {
  const shake = time - p.lastHitAt < 0.15 ? (Math.floor(time * 60) % 2 ? 1 : -1) : 0;
  const x = Math.round(p.x - camX + shake);
  const y = Math.round(p.y);
  if (p.type === 'drum') {
    r(ctx, OUT, x - 12, y - 31, 24, 31);
    r(ctx, '#2f6db0', x - 11, y - 30, 22, 29);
    r(ctx, '#4f8fd0', x - 9, y - 30, 4, 29);
    for (const dy of [-24, -14, -5]) r(ctx, '#1e4a80', x - 11, y + dy, 22, 2);
    r(ctx, '#1e4a80', x - 11, y - 30, 22, 3);
  } else if (p.type === 'kardus') {
    r(ctx, OUT, x - 12, y - 19, 24, 19);
    r(ctx, '#b8925a', x - 11, y - 18, 22, 17);
    r(ctx, '#a07a48', x - 11, y - 18, 22, 4);
    r(ctx, '#e0d6b0', x - 2, y - 18, 4, 17);
    r(ctx, '#8a6a3a', x + 4, y - 10, 5, 3);
  } else if (p.type === 'gerobak') {
    // gerobak bakso: wooden cart with a glass case, wheel and sign
    r(ctx, OUT, x - 31, y - 47, 62, 40);
    r(ctx, '#8a5a2b', x - 30, y - 22, 60, 14);
    r(ctx, '#a06a34', x - 30, y - 22, 60, 3);
    r(ctx, '#e6e0cc', x - 26, y - 44, 40, 22);
    r(ctx, '#bfe0e8', x - 24, y - 42, 36, 18);
    for (let i = 0; i < 3; i++) {
      r(ctx, '#f6f2e4', x - 21 + i * 11, y - 31, 8, 5);
      r(ctx, '#c8a050', x - 20 + i * 11, y - 30, 6, 2);
    }
    r(ctx, '#c8322a', x - 26, y - 47, 40, 6);
    ctx.fillStyle = '#fff';
    ctx.font = '6px monospace';
    ctx.fillText('BAKSO', x - 20, y - 42);
    r(ctx, '#5e3b1a', x + 16, y - 40, 3, 32);
    r(ctx, '#5e3b1a', x + 16, y - 40, 14, 3);
    r(ctx, OUT, x - 22, y - 10, 12, 10);
    r(ctx, '#3a3a3a', x - 21, y - 9, 10, 8);
    r(ctx, '#888', x - 17, y - 6, 2, 2);
    r(ctx, '#5e3b1a', x + 22, y - 9, 3, 9);
  }
}

export function drawItem(ctx, it, camX, time) {
  const bob = it.z <= 0 ? Math.round(Math.sin(time * 4 + it.uid) * 1) : 0;
  const x = Math.round(it.x - camX);
  const y = Math.round(it.y - it.z - 2 + bob);
  if (it.def.kind === 'coin' && it.t > (it.lost ? 2 : 11) && Math.floor(time * 10) % 2) return;
  switch (it.type) {
    case 'nasi_bungkus':
      r(ctx, OUT, x - 8, y - 8, 16, 9);
      r(ctx, '#c49a6c', x - 7, y - 7, 14, 7);
      r(ctx, '#4f9a3a', x - 7, y - 7, 14, 2);
      r(ctx, '#e6e0cc', x - 1, y - 7, 2, 7);
      break;
    case 'es_teh':
      r(ctx, OUT, x - 5, y - 15, 10, 15);
      r(ctx, 'rgba(240,240,240,0.9)', x - 4, y - 14, 8, 13);
      r(ctx, '#c86a2a', x - 4, y - 10, 8, 9);
      r(ctx, '#e8a060', x - 3, y - 9, 2, 6);
      r(ctx, '#c8322a', x - 4, y - 14, 8, 1);
      r(ctx, '#f6f2e4', x + 1, y - 19, 1, 6);
      break;
    case 'koin': {
      const w = Math.max(1, Math.round(Math.abs(Math.cos(time * 5 + it.uid)) * 3));
      r(ctx, OUT, x - w - 1, y - 8, w * 2 + 2, 8);
      r(ctx, '#f2c94c', x - w, y - 7, w * 2, 6);
      break;
    }
    case 'uang':
      r(ctx, OUT, x - 8, y - 7, 16, 7);
      r(ctx, '#4a9a5a', x - 7, y - 6, 14, 5);
      r(ctx, '#7ac08a', x - 2, y - 6, 4, 5);
      break;
    default:
      if (it.def.kind === 'weapon') drawWeaponFlat(ctx, it.def.weapon, x, y);
  }
}

function drawWeaponFlat(ctx, id, x, y) {
  const w = WEAPONS[id];
  if (w.draw === 'pole') {
    r(ctx, OUT, x - w.len / 2 - 1, y - 4, w.len + 2, 4);
    r(ctx, w.color, x - w.len / 2, y - 3, w.len, 2);
    r(ctx, w.tip, x + w.len / 2 - 4, y - 3, 4, 2);
  } else if (w.draw === 'chair') {
    r(ctx, OUT, x - 9, y - 16, 18, 16);
    r(ctx, w.color, x - 8, y - 15, 3, 14);
    r(ctx, w.color, x - 8, y - 8, 16, 3);
    r(ctx, w.color, x + 5, y - 8, 3, 7);
  } else if (w.draw === 'bucket') {
    r(ctx, OUT, x - 7, y - 12, 14, 12);
    r(ctx, w.color, x - 6, y - 11, 12, 10);
    r(ctx, '#6aa0f0', x - 6, y - 11, 12, 2);
  } else if (w.draw === 'blade') {
    r(ctx, OUT, x - 10, y - 5, 21, 5);
    r(ctx, w.handle, x - 9, y - 4, 6, 3);
    r(ctx, w.color, x - 3, y - 4, 13, 3);
  }
}

// Weapon in the front hand, pointing along the forearm.
export function drawHeldWeapon(ctx, pts, id, facing) {
  const w = WEAPONS[id];
  const [hx, hy] = pts.fHand;
  const [ex, ey] = pts.fElbow;
  let dx = hx - ex;
  let dy = hy - ey;
  const len = Math.hypot(dx, dy) || 1;
  dx /= len;
  dy /= len;
  if (w.draw === 'pole' || w.draw === 'blade') {
    const L = w.len;
    const back = w.draw === 'pole' ? L * 0.35 : 3;
    for (let i = -back; i < L - back; i++) {
      const x = hx + dx * i;
      const y = hy + dy * i;
      const tip = i > L - back - 5;
      r(ctx, OUT, x - 1.5, y - 1.5, 3, 3);
      ctx.fillStyle = w.draw === 'blade' ? (i < 3 ? w.handle : w.color) : tip ? w.tip : w.color;
      ctx.fillRect(Math.round(x - 0.5), Math.round(y - 0.5), 2, 2);
    }
  } else if (w.draw === 'chair') {
    const cx = hx + dx * 8;
    const cy = hy + dy * 8;
    r(ctx, OUT, cx - 9, cy - 9, 18, 18);
    r(ctx, w.color, cx - 8, cy - 8, 16, 3);
    r(ctx, w.color, cx - 8 * facing, cy - 8, 3, 16);
    r(ctx, w.color, cx - 8, cy, 16, 3);
  } else if (w.draw === 'bucket') {
    const cx = hx + dx * 4;
    const cy = hy + dy * 4;
    r(ctx, OUT, cx - 7, cy - 6, 14, 12);
    r(ctx, w.color, cx - 6, cy - 5, 12, 10);
    r(ctx, '#6aa0f0', cx - 6, cy - 5, 12, 2);
  }
}

export function drawProjectile(ctx, p, camX, time) {
  const x = Math.round(p.x - camX);
  const y = Math.round(p.y - p.z);
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(Math.round(time * 20) * (Math.PI / 4) * p.facing);
  drawWeaponFlat(ctx, p.weaponId, 0, 4);
  ctx.restore();
}
