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
  } else if (p.type === 'jerigen') {
    r(ctx, OUT, x - 8, y - 21, 16, 21);
    r(ctx, '#c8322a', x - 7, y - 20, 14, 19);
    r(ctx, '#e8574a', x - 5, y - 18, 3, 15);
    r(ctx, OUT, x + 1, y - 24, 5, 4);
    r(ctx, '#3a3a3a', x - 4, y - 23, 6, 3);
  } else if (p.type === 'warga') {
    // a villager tied to a post, waving for help
    r(ctx, '#5e3b1a', x - 2, y - 56, 5, 56);
    const wave = Math.round(Math.sin(time * 6) * 3);
    r(ctx, OUT, x - 8, y - 46, 16, 30);
    r(ctx, '#5a8a6a', x - 7, y - 45, 14, 20);
    r(ctx, '#6a4a2a', x - 7, y - 26, 14, 26);
    r(ctx, '#b07a4f', x - 6, y - 56, 12, 10);
    r(ctx, '#c8a050', x - 10, y - 60, 20, 4);
    r(ctx, '#d8b56a', x - 6, y - 64, 12, 4);
    r(ctx, OUT, x - 2, y - 52, 2, 2);
    r(ctx, '#e6e0cc', x - 8, y - 36, 16, 2);
    r(ctx, '#e6e0cc', x - 8, y - 30, 16, 2);
    r(ctx, '#b07a4f', x + 7, y - 52 + wave, 3, 8);
    if (Math.floor(time * 2) % 2) {
      ctx.fillStyle = '#f6f2e4';
      ctx.font = 'bold 7px monospace';
      ctx.fillText('TOLONG!', x - 14, y - 70);
    }
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
    case 'bukti':
      // a folder of evidence with a red stamp
      r(ctx, OUT, x - 8, y - 11, 16, 11);
      r(ctx, '#e6d6a0', x - 7, y - 10, 14, 9);
      r(ctx, '#c8322a', x + 1, y - 8, 5, 4);
      r(ctx, '#8a7a50', x - 6, y - 6, 6, 1);
      r(ctx, '#8a7a50', x - 6, y - 4, 5, 1);
      if (Math.floor(time * 4) % 2) r(ctx, '#fff6c0', x - 9, y - 13, 2, 2);
      break;
    case 'uang':
      r(ctx, OUT, x - 8, y - 7, 16, 7);
      r(ctx, '#4a9a5a', x - 7, y - 6, 14, 5);
      r(ctx, '#7ac08a', x - 2, y - 6, 4, 5);
      break;
    default:
      if (it.def.kind === 'weapon') drawWeaponFlat(ctx, it.def.weapon, x, y);
  }
}

function flamesSmall(ctx, x, y) {
  const t = performance.now() / 60;
  for (let i = -2; i <= 2; i++) {
    const h = 4 + Math.sin(t + i * 2) * 2 + (2 - Math.abs(i)) * 2;
    r(ctx, '#e0402a', x + i * 2, y - h, 2, h);
    r(ctx, '#ffd25a', x + i * 2, y - h * 0.5, 1, h * 0.5);
  }
}

function drawWeaponFlat(ctx, id, x, y) {
  const w = WEAPONS[id];
  if (w.draw === 'bag') {
    r(ctx, OUT, x - 9, y - 14, 18, 15);
    r(ctx, w.color, x - 8, y - 13, 16, 13);
    r(ctx, '#8a6a3a', x - 2, y - 16, 4, 3);
    ctx.fillStyle = '#5a3a1a';
    ctx.font = 'bold 6px monospace';
    ctx.fillText('Rp', x - 5, y - 4);
    return;
  }
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
  } else if (w.draw === 'torch') {
    for (let i = -4; i < w.len; i++) r(ctx, i < 0 ? OUT : w.color, hx + dx * i - 1, hy + dy * i - 1, 2, 2);
    const tx = hx + dx * w.len;
    const ty = hy + dy * w.len;
    flamesSmall(ctx, tx, ty);
  } else if (w.draw === 'saw') {
    const cx = hx + dx * 6;
    const cy = hy + dy * 6;
    r(ctx, OUT, cx - 6, cy - 5, 12, 10);
    r(ctx, w.color, cx - 5, cy - 4, 10, 8);
    const bx = cx + dx * 8;
    const by = cy + dy * 8;
    for (let i = 0; i < 22; i++) {
      const tooth = (i + Math.floor(performance.now() / 40)) % 3 === 0;
      r(ctx, OUT, bx + dx * i - 2, by + dy * i - 2, 4, 4);
      r(ctx, tooth ? '#f6f2e4' : '#9a9a9a', bx + dx * i - 1, by + dy * i - 1, 3, 3);
    }
  } else if (w.draw === 'whip') {
    r(ctx, OUT, hx - 5, hy - 6, 10, 12);
    r(ctx, w.color, hx - 4, hy - 5, 8, 10);
    for (let i = 0; i < 26; i++) r(ctx, i % 4 ? '#f6f2e4' : '#c8c0a8', hx + dx * (6 + i) + Math.sin(i / 3) * 2, hy + dy * (6 + i), 2, 2);
  } else if (w.draw === 'sack') {
    r(ctx, OUT, hx - 10, hy - 14, 20, 24);
    r(ctx, w.color, hx - 9, hy - 13, 18, 22);
    ctx.fillStyle = '#8a6a3a';
    ctx.font = 'bold 5px monospace';
    ctx.fillText('BERAS', hx - 8, hy);
  } else if (w.draw === 'bag') {
    r(ctx, OUT, hx - 7, hy - 7, 14, 14);
    r(ctx, w.color, hx - 6, hy - 6, 12, 12);
  } else if (w.draw === 'bucket') {
    const cx = hx + dx * 4;
    const cy = hy + dy * 4;
    r(ctx, OUT, cx - 7, cy - 6, 14, 12);
    r(ctx, w.color, cx - 6, cy - 5, 12, 10);
    r(ctx, '#6aa0f0', cx - 6, cy - 5, 12, 2);
  }
}

export function drawProjectile(ctx, p, camX, time) {
  if (p.draw) {
    drawShot(ctx, p, camX, time);
    return;
  }
  const x = Math.round(p.x - camX);
  const y = Math.round(p.y - p.z);
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(Math.round(time * 20) * (Math.PI / 4) * p.facing);
  drawWeaponFlat(ctx, p.weaponId, 0, 4);
  ctx.restore();
}

// Ranged shots (see combat/shots.js).
export function drawShot(ctx, p, camX, time) {
  const x = Math.round(p.x - camX);
  const y = Math.round(p.y - p.z);
  switch (p.draw) {
    case 'coin':
      r(ctx, OUT, x - 3, y - 3, 6, 6);
      r(ctx, '#f2c94c', x - 2, y - 2, 4, 4);
      break;
    case 'chain':
      for (let i = 0; i < 6; i++) r(ctx, i % 2 ? '#a0a0a0' : '#d0d0d0', x - p.facing * i * 5 - 2, y - 2, 4, 3);
      r(ctx, '#c8322a', x - 3, y - 4, 6, 6);
      break;
    case 'paper':
    case 'contract':
      r(ctx, OUT, x - 7, y - 6, 14, 12);
      r(ctx, '#f6f2e4', x - 6, y - 5, 12, 10);
      r(ctx, '#c8322a', x - 2, y - 2, 5, 4);
      ctx.fillStyle = '#2a2a2a';
      ctx.font = 'bold 5px monospace';
      ctx.fillText(p.draw === 'paper' ? 'DENDA' : 'PHK', x - 6, y - 1);
      break;
    case 'spam':
      r(ctx, OUT, x - 8, y - 7, 16, 14);
      r(ctx, '#3a7ad8', x - 7, y - 6, 14, 12);
      r(ctx, '#f6f2e4', x - 5, y - 4, 10, 2);
      r(ctx, '#f6f2e4', x - 5, y - 1, 7, 2);
      r(ctx, '#e0402a', x + 4, y - 9, 5, 5);
      break;
    case 'note':
      r(ctx, '#7aa08a', x - 4 + Math.sin(time * 10 + p.uid) * 2, y - 2, 8, 4);
      r(ctx, '#4a7a5a', x - 1, y - 2, 2, 4);
      ctx.fillStyle = 'rgba(255,40,30,0.25)';
      ctx.fillRect(x - 6, Math.round(p.y) - 1, 12, 2);
      break;
    case 'water':
      for (let i = 0; i < 8; i++) r(ctx, i % 2 ? '#9ad0f0' : '#5aa0e0', x - p.facing * i * 4 - 3, y - 4 + Math.sin(time * 30 + i) * 2, 6, 6);
      break;
    case 'flame':
      for (let i = 0; i < 6; i++) r(ctx, i % 2 ? '#ffd25a' : '#e0402a', x - p.facing * i * 4 - 4, y - 6 + Math.sin(time * 25 + i) * 3, 8, 8);
      break;
    case 'cash':
      r(ctx, OUT, x - 7, y - 4, 14, 8);
      r(ctx, '#4a9a5a', x - 6, y - 3, 12, 6);
      r(ctx, '#7ac08a', x - 2, y - 3, 4, 6);
      break;
  }
}
