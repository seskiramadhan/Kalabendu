const OUT = '#120c0a';

function r(ctx, color, x, y, w, h) {
  ctx.fillStyle = color;
  ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
}

// Asap: a drifting haze spirit with ember eyes.
export function drawAsap(ctx, e, camX, time) {
  const x = e.x - camX;
  const y = e.y - e.z;
  const fade = e.state === 'dead' ? Math.max(0, 1 - e.t / 1.2) : 1;
  for (let i = 0; i < 7; i++) {
    const a = time * 1.5 + i;
    const ox = Math.cos(a) * 6 + (i - 3) * 3;
    const oy = Math.sin(a * 1.3) * 4 - i * 4;
    ctx.fillStyle = `rgba(${110 + i * 8},${104 + i * 6},${100 + i * 6},${0.55 * fade})`;
    ctx.beginPath();
    ctx.arc(Math.round(x + ox), Math.round(y + oy - 10), 9 - i * 0.5, 0, Math.PI * 2);
    ctx.fill();
  }
  if (e.state !== 'dead') {
    const blink = Math.floor(time * 3 + e.uid) % 9 === 0;
    r(ctx, '#ff8a2a', x - 5 + e.facing, y - 30, 3, blink ? 1 : 3);
    r(ctx, '#ff8a2a', x + 2 + e.facing, y - 30, 3, blink ? 1 : 3);
    r(ctx, '#3a2a2a', x - 3, y - 23, 6, 2);
  }
}

// Buldoser Liar: a yellow bulldozer with a blade; an angry face on the cab.
export function drawBuldoser(ctx, e, camX, time) {
  const f = e.facing;
  const x = Math.round(e.x - camX);
  const y = Math.round(e.y);
  const shake = e.state === 'attack' && e.t < e.move.startup / 60 ? (Math.floor(time * 40) % 2 ? 1 : -1) : 0;
  const bx = x + shake;
  r(ctx, OUT, bx - 34, y - 16, 68, 16);
  r(ctx, '#3a3a3a', bx - 33, y - 15, 66, 14);
  for (let i = 0; i < 8; i++) r(ctx, '#5a5a5a', bx - 31 + ((i * 8 + Math.floor(e.x / 3)) % 64), y - 13, 4, 10);
  r(ctx, OUT, bx - 28, y - 44, 50, 30);
  r(ctx, '#f2c94c', bx - 27, y - 43, 48, 28);
  r(ctx, '#d4a017', bx - 27, y - 20, 48, 5);
  r(ctx, OUT, bx - 20 * f - 10, y - 64, 22, 22);
  r(ctx, '#f2c94c', bx - 20 * f - 9, y - 63, 20, 20);
  r(ctx, '#9ad0e8', bx - 20 * f - 6, y - 60, 14, 9);
  // angry brows and eyes on the cab window
  r(ctx, OUT, bx - 20 * f - 5, y - 58, 5, 1);
  r(ctx, OUT, bx - 20 * f + 2, y - 58, 5, 1);
  r(ctx, '#e0402a', bx - 20 * f - 4, y - 56, 3, 3);
  r(ctx, '#e0402a', bx - 20 * f + 3, y - 56, 3, 3);
  // blade
  const bladeX = f > 0 ? bx + 24 : bx - 32;
  r(ctx, OUT, bladeX - 1, y - 40, 10, 40);
  r(ctx, '#8a8a8a', bladeX, y - 39, 8, 38);
  r(ctx, '#b0b0b0', bladeX + (f > 0 ? 6 : 0), y - 39, 2, 38);
  r(ctx, '#3a3a3a', bx + 6 * f - 2, y - 76, 4, 14);
  if (e.state === 'attack' && e.t >= e.move.startup / 60) {
    ctx.fillStyle = 'rgba(80,70,60,0.6)';
    for (let i = 0; i < 4; i++) ctx.fillRect(bx - 40 * f - i * 6 * f, y - 8 - i * 3, 6, 6);
  }
  if (e.state === 'dizzy') {
    ctx.fillStyle = 'rgba(70,70,70,0.7)';
    for (let i = 0; i < 3; i++) ctx.fillRect(bx + 6 * f - 3 + Math.sin(time * 4 + i) * 4, y - 86 - i * 8 - ((time * 30) % 8), 6, 6);
  }
}

// Raja Sawit: a giant of palm fronds, a log body and money bags.
export function drawRaja(ctx, e, camX, time) {
  const f = e.facing;
  const x = Math.round(e.x - camX);
  const y = Math.round(e.y);
  const m = e.move;
  const winding = e.state === 'attack' && m && e.t < m.startup / 60;
  const smashing = e.state === 'attack' && m?.id === 'raja_smash' && !winding;
  const sway = Math.round(Math.sin(time * 2) * 2);
  // legs: two thick logs
  for (const dx of [-12, 6]) {
    r(ctx, OUT, x + dx - 1, y - 36, 12, 36);
    r(ctx, '#6e4724', x + dx, y - 35, 10, 35);
    r(ctx, '#c49a6c', x + dx, y - 35, 10, 3);
  }
  // log body with money-bag belly
  r(ctx, OUT, x - 22, y - 96, 44, 64);
  r(ctx, '#7a5029', x - 21, y - 95, 42, 62);
  for (let i = 0; i < 5; i++) r(ctx, '#5e3b1a', x - 21, y - 88 + i * 12, 42, 2);
  for (const [bx, by] of [[-14, -60], [2, -56], [-6, -46]]) {
    r(ctx, OUT, x + bx - 1, y + by - 1, 16, 14);
    r(ctx, '#c8a050', x + bx, y + by, 14, 12);
    r(ctx, '#8a6a3a', x + bx + 5, y + by - 3, 4, 3);
    ctx.fillStyle = '#5a3a1a';
    ctx.font = 'bold 6px monospace';
    ctx.fillText('Rp', x + bx + 2, y + by + 9);
  }
  // arms: a log club arm raised when winding up, slammed when smashing
  const armAngle = winding && m?.id === 'raja_smash' ? -2.2 : smashing ? 0.9 : 0.3 + Math.sin(time * 2) * 0.1;
  const sx = x + 18 * f;
  const sy = y - 86;
  const len = 46;
  const ex = sx + Math.cos(armAngle) * len * f;
  const ey = sy + Math.sin(armAngle) * len + len * 0.4;
  ctx.strokeStyle = OUT;
  ctx.lineWidth = 12;
  ctx.beginPath();
  ctx.moveTo(sx, sy);
  ctx.lineTo(ex, ey);
  ctx.stroke();
  ctx.strokeStyle = '#6e4724';
  ctx.lineWidth = 9;
  ctx.stroke();
  r(ctx, '#c49a6c', ex - 5, ey - 5, 10, 10);
  // back arm holding a money bag
  r(ctx, OUT, x - 30 * f - 6, y - 82, 12, 26);
  r(ctx, '#6e4724', x - 30 * f - 5, y - 81, 10, 24);
  r(ctx, '#c8a050', x - 30 * f - 8, y - 60, 16, 14);
  // head: crown of drooping sawit fronds, glowing eyes
  const hx = x + 4 * f;
  const hy = y - 108 + sway;
  r(ctx, OUT, hx - 13, hy - 13, 26, 26);
  r(ctx, '#5e4e2e', hx - 12, hy - 12, 24, 24);
  r(ctx, winding ? '#ff3a2a' : '#f2c94c', hx - 7 + 2 * f, hy - 4, 5, 4);
  r(ctx, winding ? '#ff3a2a' : '#f2c94c', hx + 2 + 2 * f, hy - 4, 5, 4);
  r(ctx, OUT, hx - 6, hy + 5, 12, 2);
  for (let i = 0; i < 9; i++) {
    const a = -Math.PI / 2 + (i - 4) * 0.36 + Math.sin(time * 1.5 + i) * 0.05;
    for (let k = 0; k < 26; k++) {
      const fx = hx + Math.cos(a) * k;
      const fy = hy - 10 + Math.sin(a) * k + (k * k) / 40;
      r(ctx, k % 4 === 0 ? '#5c6a30' : '#6f7f3a', fx, fy, 3, 3);
    }
  }
  if (e.state === 'dizzy') {
    for (let i = 0; i < 3; i++) {
      const a = time * 5 + (i * Math.PI * 2) / 3;
      r(ctx, '#f2c94c', hx + Math.cos(a) * 18 - 1, hy - 26 + Math.sin(a) * 5, 3, 3);
    }
  }
  if (e.state === 'dead') {
    ctx.fillStyle = `rgba(255,140,60,${Math.max(0, 0.5 - e.t * 0.3)})`;
    ctx.fillRect(x - 40, y - 130, 80, 130);
  }
}

// Ground fire patch (hazard).
export function drawFire(ctx, fire, camX, time) {
  const x = Math.round(fire.x - camX);
  const y = Math.round(fire.y);
  const k = Math.min(1, fire.t * 3, (fire.life - fire.t) * 1.5);
  const glow = ctx.createRadialGradient(x, y - 4, 2, x, y - 4, 20);
  glow.addColorStop(0, `rgba(255,160,60,${0.4 * k})`);
  glow.addColorStop(1, 'rgba(255,120,40,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(x - 20, y - 24, 40, 30);
  flames(ctx, x, y, 11, 18 * k, time + fire.uid);
}

export function flames(ctx, x, y, halfW, height, time) {
  for (let i = -halfW; i <= halfW; i += 3) {
    const h = Math.max(2, height * (1 - Math.abs(i) / (halfW + 3)) * (0.6 + 0.4 * Math.sin(time * 12 + i * 1.7)));
    r(ctx, '#e0402a', x + i, y - h, 3, h);
    r(ctx, '#f08a2a', x + i, y - h * 0.7, 3, h * 0.7);
    r(ctx, '#ffd25a', x + i + 1, y - h * 0.35, 1, h * 0.35);
  }
}

// Steam puff where a fire was put out — handled by effects.
