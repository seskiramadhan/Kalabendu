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

// Robot Pengganti: a boxy replacement machine with a barcode chest.
export function drawRobot(ctx, e, camX, time) {
  const f = e.facing;
  const x = Math.round(e.x - camX);
  const y = Math.round(e.y - e.z);
  const m = e.move;
  const wind = e.state === 'attack' && m && e.t < m.startup / 60;
  const hitting = e.state === 'attack' && m && !wind && e.t < (m.startup + m.active) / 60;
  const lying = e.state === 'airborne' || e.state === 'knockdown' || e.state === 'dead';
  if (lying) {
    r(ctx, OUT, x - 30, y - 16, 60, 16);
    r(ctx, '#8a94a0', x - 29, y - 15, 58, 14);
    r(ctx, '#e0402a', x + 20 * f, y - 12, 4, 4);
    return;
  }
  const step = e.state === 'walk' ? Math.round(Math.sin(e.walkDist / 6) * 2) : 0;
  for (const dx of [-8, 3]) {
    r(ctx, OUT, x + dx - 1, y - 22, 8, 22);
    r(ctx, '#5a646e', x + dx, y - 21, 6, 21 + (dx < 0 ? step : -step));
  }
  r(ctx, OUT, x - 13, y - 52, 26, 32);
  r(ctx, '#8a94a0', x - 12, y - 51, 24, 30);
  for (let i = 0; i < 7; i++) r(ctx, '#2a2a2a', x - 8 + i * 2 + (i % 2), y - 44, 1, 10);
  r(ctx, OUT, x - 9, y - 66, 18, 14);
  r(ctx, '#a0aab4', x - 8, y - 65, 16, 12);
  r(ctx, wind ? '#ff3a2a' : '#5ae0ff', x - 4 + 2 * f, y - 61, 8, 3);
  r(ctx, '#5a646e', x - 1, y - 72, 2, 6);
  r(ctx, '#e0402a', x - 2, y - 74, 4, 2);
  const reach = hitting ? 22 : wind ? -4 : 6;
  r(ctx, OUT, x + f * 10 - (f < 0 ? reach + 6 : 0), y - 46, reach + 6, 8);
  r(ctx, '#5a646e', x + f * 10 - (f < 0 ? reach + 5 : 0), y - 45, reach + 4, 6);
  r(ctx, '#3a3a3a', x + f * (14 + reach) - 4, y - 48, 8, 10);
}

// Juragan Outsourcing: a boss in a mech built from machines and contracts.
export function drawMech(ctx, e, camX, time) {
  const f = e.facing;
  const x = Math.round(e.x - camX);
  const y = Math.round(e.y);
  const m = e.move;
  const wind = e.state === 'attack' && m && e.t < m.startup / 60;
  const stamping = e.state === 'attack' && m?.id === 'mech_stamp' && !wind;
  for (const dx of [-24, 10]) {
    r(ctx, OUT, x + dx - 1, y - 30, 16, 30);
    r(ctx, '#4a5a6a', x + dx, y - 29, 14, 29);
    r(ctx, '#2a3a4a', x + dx - 2, y - 6, 18, 6);
  }
  r(ctx, OUT, x - 32, y - 84, 64, 56);
  r(ctx, '#6a7a8a', x - 31, y - 83, 62, 54);
  r(ctx, '#e0b252', x - 31, y - 40, 62, 4);
  // contracts pinned to the hull
  for (let i = 0; i < 3; i++) {
    r(ctx, '#f6f2e4', x - 26 + i * 18, y - 74 + (i % 2) * 6, 12, 16);
    for (let k = 0; k < 4; k++) r(ctx, '#8a8a8a', x - 24 + i * 18, y - 70 + (i % 2) * 6 + k * 3, 8, 1);
  }
  // cockpit with the boss inside: fat cigar, money-green tie
  r(ctx, OUT, x - 14, y - 106, 28, 24);
  r(ctx, '#9ad0e8', x - 13, y - 105, 26, 22);
  r(ctx, '#c08a5a', x - 6, y - 102, 12, 11);
  r(ctx, '#1a1210', x - 7, y - 104, 14, 3);
  r(ctx, '#1a1210', x + 3 * f - 1, y - 98, 2, 2);
  r(ctx, '#7a4e24', x + 6 * f - (f < 0 ? 6 : 0), y - 95, 6, 2);
  r(ctx, '#ff6a2a', x + 12 * f - 1, y - 95, 2, 2);
  r(ctx, '#2a2a3a', x - 8, y - 90, 16, 6);
  r(ctx, '#3a8a4a', x - 1, y - 90, 3, 6);
  // stamp arm
  const armY = stamping ? y - 20 : wind && m?.id === 'mech_stamp' ? y - 110 : y - 66;
  const ax = x + f * 40;
  r(ctx, OUT, ax - 5, Math.min(armY, y - 70) - 1, 10, Math.abs(armY - (y - 70)) + 4);
  r(ctx, '#4a5a6a', ax - 4, Math.min(armY, y - 70), 8, Math.abs(armY - (y - 70)) + 2);
  r(ctx, OUT, ax - 14, armY - 2, 28, 16);
  r(ctx, '#c8322a', ax - 13, armY - 1, 26, 14);
  ctx.fillStyle = '#f6f2e4';
  ctx.font = 'bold 6px monospace';
  ctx.fillText('PHK', ax - 9, armY + 9);
  r(ctx, '#3a3a3a', x - 20, y - 116, 6, 12);
  if (Math.floor(time * 3) % 2) {
    ctx.fillStyle = 'rgba(60,60,60,0.6)';
    ctx.fillRect(x - 21, y - 124 - ((time * 20) % 8), 8, 6);
  }
  if (e.state === 'dizzy') {
    for (let i = 0; i < 4; i++) r(ctx, '#f2c94c', x - 20 + i * 14 + Math.sin(time * 20 + i) * 2, y - 118 + Math.cos(time * 20 + i) * 2, 3, 3);
  }
}

// Hantu Bursa: a ghost of crashing charts and shredded rupiah notes.
export function drawHantu(ctx, e, camX, time) {
  const f = e.facing;
  const x = Math.round(e.x - camX);
  const y = Math.round(e.y - e.z);
  const wind = e.state === 'attack' && e.move && e.t < e.move.startup / 60;
  const fade = e.state === 'dead' ? Math.max(0, 1 - e.t / 1.3) : 1;
  ctx.globalAlpha = 0.9 * fade;
  // tattered body of shredded notes
  for (let i = 0; i < 18; i++) {
    const a = (i / 18) * Math.PI * 2;
    const len = 26 + Math.sin(time * 3 + i) * 6;
    const px = x + Math.cos(a) * 10;
    const py = y - 40 + Math.sin(a) * 10;
    for (let k = 0; k < len; k += 3) {
      r(ctx, i % 3 ? '#7aa08a' : '#c8a050', px + Math.sin(time * 4 + k / 6 + i) * 3, py + k, 3, 2);
    }
  }
  r(ctx, OUT, x - 18, y - 76, 36, 40);
  r(ctx, '#3a4a5a', x - 17, y - 75, 34, 38);
  // falling red chart across its face
  ctx.strokeStyle = '#ff3a2a';
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (let i = 0; i <= 8; i++) {
    const px = x - 15 + i * 4;
    const py = y - 70 + i * 3 + (i % 2 ? -3 : 3);
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.stroke();
  r(ctx, wind ? '#ff3a2a' : '#f6f2e4', x - 9 + 3 * f, y - 62, 5, 5);
  r(ctx, wind ? '#ff3a2a' : '#f6f2e4', x + 3 + 3 * f, y - 62, 5, 5);
  r(ctx, OUT, x - 6, y - 48, 12, 4);
  ctx.fillStyle = '#ff3a2a';
  ctx.font = 'bold 7px monospace';
  ctx.fillText('▼', x - 3, y - 80 + Math.sin(time * 6) * 2);
  ctx.globalAlpha = 1;
}

// Falling red candlestick bar: shadow first, then the bar drops.
export function drawCandle(ctx, c, camX, time) {
  const x = Math.round(c.x - camX);
  const y = Math.round(c.y);
  const warn = 0.9;
  if (c.t < 0) return;
  if (c.t < warn) {
    const k = c.t / warn;
    ctx.fillStyle = `rgba(255,40,30,${0.25 + 0.35 * k})`;
    ctx.fillRect(x - 9, y - 2, 18, 4);
    const by = y - 200 * (1 - k);
    r(ctx, '#7a1a14', x - 1, by - 46, 2, 46);
    r(ctx, OUT, x - 6, by - 38, 12, 28);
    r(ctx, '#e0402a', x - 5, by - 37, 10, 26);
  } else {
    r(ctx, '#7a1a14', x - 1, y - 46, 2, 46);
    r(ctx, OUT, x - 6, y - 38, 12, 30);
    r(ctx, '#e0402a', x - 5, y - 37, 10, 28);
    if (Math.floor(time * 20) % 2) r(ctx, '#ffd25a', x - 10, y - 4, 20, 2);
  }
}

// Buzzer: a floating phone that spams notifications.
export function drawBuzzer(ctx, e, camX, time) {
  const f = e.facing;
  const x = Math.round(e.x - camX);
  const bob = Math.round(Math.sin(time * 5 + e.uid) * 2);
  const y = Math.round(e.y - e.z) + bob;
  const lying = e.state === 'knockdown' || e.state === 'dead';
  const wind = e.state === 'attack' && e.move && e.t < e.move.startup / 60;
  if (lying) {
    r(ctx, OUT, x - 11, y - 6, 22, 6);
    r(ctx, '#2a2a3a', x - 10, y - 5, 20, 4);
    r(ctx, '#3a6aa0', x - 8, y - 5, 16, 1);
    return;
  }
  // little wings
  const flap = Math.floor(time * 16) % 2 ? 3 : 0;
  r(ctx, '#d8e4f0', x - 14, y - 22 - flap, 6, 4);
  r(ctx, '#d8e4f0', x + 8, y - 22 - flap, 6, 4);
  r(ctx, OUT, x - 8, y - 32, 16, 26);
  r(ctx, '#2a2a3a', x - 7, y - 31, 14, 24);
  r(ctx, wind ? '#ff5a4a' : '#5aa0e0', x - 6, y - 29, 12, 18);
  // angry emoji face
  r(ctx, OUT, x - 4 + f, y - 25, 2, 2);
  r(ctx, OUT, x + 2 + f, y - 25, 2, 2);
  r(ctx, OUT, x - 3 + f, y - 19, 6, 1);
  // notification badge
  r(ctx, '#e0402a', x + 4, y - 35, 6, 6);
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 5px monospace';
  ctx.fillText('9', x + 5, y - 30);
  // shadow on the floor
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.fillRect(x - 6, Math.round(e.y) - 1, 12, 2);
}

// Komandan Preman on a water-cannon truck.
export function drawTruck(ctx, e, camX, time) {
  const f = e.facing;
  const x = Math.round(e.x - camX);
  const y = Math.round(e.y);
  const m = e.move;
  const wind = e.state === 'attack' && m && e.t < m.startup / 60;
  const shake = wind && m?.id === 'truk_tabrak' ? (Math.floor(time * 40) % 2 ? 1 : -1) : 0;
  const bx = x + shake;
  // wheels
  for (const dx of [-30, 22]) {
    r(ctx, OUT, bx + dx - 1, y - 14, 16, 14);
    r(ctx, '#2a2a2a', bx + dx, y - 13, 14, 12);
    r(ctx, '#8a8a8a', bx + dx + 5, y - 9, 4, 4);
  }
  // tank body (back) and cab (front)
  r(ctx, OUT, bx - 46, y - 50, 70, 38);
  r(ctx, '#5a6a7a', bx - 45, y - 49, 68, 36);
  r(ctx, '#3a4a5a', bx - 45, y - 24, 68, 4);
  r(ctx, '#f6f2e4', bx - 40, y - 42, 30, 6);
  r(ctx, OUT, bx + 22 * f - 14, y - 58, 30, 46);
  r(ctx, '#3a4a5a', bx + 22 * f - 13, y - 57, 28, 44);
  r(ctx, '#9ad0e8', bx + 22 * f - 10 + (f > 0 ? 6 : 0), y - 54, 14, 12);
  // siren
  const blink = Math.floor(time * 6) % 2;
  r(ctx, blink ? '#e0402a' : '#3a6aa0', bx + 22 * f - 6, y - 63, 6, 5);
  r(ctx, blink ? '#3a6aa0' : '#e0402a', bx + 22 * f + 1, y - 63, 6, 5);
  // Komandan on the roof: big body, red beret
  const kx = bx - 10;
  const ky = y - 50;
  r(ctx, OUT, kx - 9, ky - 26, 18, 26);
  r(ctx, '#4a5a3a', kx - 8, ky - 25, 16, 25);
  r(ctx, OUT, kx - 7, ky - 40, 14, 14);
  r(ctx, '#8a5a38', kx - 6, ky - 39, 12, 12);
  r(ctx, '#a4302a', kx - 8, ky - 42, 15, 5);
  r(ctx, '#120c0a', kx - 3 + 2 * f, ky - 35, 6, 2);
  r(ctx, '#f2c94c', kx - 6, ky - 22, 12, 2);
  // water cannon turret on the roof
  const tx = bx + 4;
  const ty = y - 54;
  r(ctx, OUT, tx - 6, ty - 8, 12, 9);
  r(ctx, '#8a94a0', tx - 5, ty - 7, 10, 7);
  const aim = wind && m?.id === 'truk_semprot' ? 4 : 0;
  r(ctx, OUT, tx + (f > 0 ? 4 : -26), ty - 6 - aim, 22, 5);
  r(ctx, '#a0aab4', tx + (f > 0 ? 5 : -25), ty - 5 - aim, 20, 3);
  if (e.state === 'attack' && m?.id === 'truk_tabrak' && !wind) {
    ctx.fillStyle = 'rgba(80,70,60,0.6)';
    for (let i = 0; i < 4; i++) ctx.fillRect(bx - 50 * f - i * 6 * f, y - 8 - i * 3, 6, 6);
  }
  if (e.state === 'dizzy') {
    ctx.fillStyle = 'rgba(200,220,240,0.7)';
    for (let i = 0; i < 3; i++) ctx.fillRect(bx + 22 * f - 3 + Math.sin(time * 4 + i) * 4, y - 70 - i * 8 - ((time * 30) % 8), 6, 6);
  }
  if (e.state === 'dead') {
    ctx.fillStyle = `rgba(200,220,240,${Math.max(0, 0.6 - e.t * 0.3)})`;
    ctx.fillRect(bx - 50, y - 100, 100, 100);
  }
}

// Tikus Berdasi: a rat in a necktie that runs off with coins.
export function drawTikus(ctx, e, camX, time) {
  const f = e.facing;
  const x = Math.round(e.x - camX);
  const y = Math.round(e.y - e.z);
  const lying = e.state === 'airborne' || e.state === 'knockdown' || e.state === 'dead';
  if (lying) {
    r(ctx, OUT, x - 12, y - 8, 24, 8);
    r(ctx, '#7a7a82', x - 11, y - 7, 22, 6);
    r(ctx, '#c8322a', x - 2, y - 7, 4, 6);
    return;
  }
  const step = e.state === 'walk' ? Math.round(Math.sin(e.walkDist / 4) * 2) : 0;
  // tail
  for (let i = 0; i < 10; i++) r(ctx, '#d89a9a', x - f * (8 + i), y - 6 - Math.sin(i / 2 + time * 6) * 2, 2, 2);
  // legs
  r(ctx, '#5a5a62', x - 5, y - 6, 3, 6 + step);
  r(ctx, '#5a5a62', x + 2, y - 6, 3, 6 - step);
  // body in a little suit
  r(ctx, OUT, x - 7, y - 22, 14, 17);
  r(ctx, '#2a2a34', x - 6, y - 21, 12, 15);
  r(ctx, '#f6f2e4', x - 2, y - 21, 4, 5);
  r(ctx, '#c8322a', x - 1, y - 20, 2, 8);
  // head with big ears and snout
  r(ctx, OUT, x - 6, y - 32, 13, 11);
  r(ctx, '#8a8a92', x - 5, y - 31, 11, 9);
  r(ctx, '#8a8a92', x + f * 6 - 2, y - 28, 5, 4);
  r(ctx, '#e0a0a0', x + f * 9 - 1, y - 28, 2, 2);
  r(ctx, '#d89a9a', x - 6, y - 35, 4, 4);
  r(ctx, '#d89a9a', x + 2, y - 35, 4, 4);
  r(ctx, OUT, x + f * 2, y - 29, 2, 2);
  // coin sack when carrying loot
  if (e.loot > 0) {
    r(ctx, OUT, x - f * 10 - 5, y - 26, 10, 10);
    r(ctx, '#c8a050', x - f * 10 - 4, y - 25, 8, 8);
  }
}

// Batara Kala: the giant embodiment of the age of curse, drawn like a wayang raksasa.
export function drawKala(ctx, e, camX, time) {
  const f = e.facing;
  const x = Math.round(e.x - camX);
  const y = Math.round(e.y);
  const m = e.move;
  const wind = e.state === 'attack' && m && e.t < m.startup / 60;
  const slamming = e.state === 'attack' && m?.id === 'kala_slam' && !wind;
  const fade = e.state === 'dead' ? Math.max(0, 1 - e.t / 2) : 1;
  ctx.globalAlpha = fade;
  // dark aura
  const glow = ctx.createRadialGradient(x, y - 70, 10, x, y - 70, 90);
  glow.addColorStop(0, wind ? 'rgba(255,60,30,0.35)' : 'rgba(120,20,40,0.3)');
  glow.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(x - 90, y - 160, 180, 170);
  // legs and kain
  for (const dx of [-16, 6]) {
    r(ctx, OUT, x + dx - 1, y - 40, 12, 40);
    r(ctx, '#3a1a1a', x + dx, y - 39, 10, 39);
  }
  r(ctx, OUT, x - 24, y - 58, 48, 24);
  r(ctx, '#5a1a2a', x - 23, y - 57, 46, 22);
  for (let i = 0; i < 6; i++) r(ctx, '#c8a050', x - 21 + i * 8, y - 50, 3, 3);
  // torso
  r(ctx, OUT, x - 22, y - 104, 44, 48);
  r(ctx, '#2a1218', x - 21, y - 103, 42, 46);
  r(ctx, '#c8a050', x - 21, y - 90, 42, 3);
  // arms: one raised for the slam
  const armA = wind && m?.id === 'kala_slam' ? -2.3 : slamming ? 0.9 : 0.5 + Math.sin(time * 1.5) * 0.1;
  const sx = x + 20 * f;
  const sy = y - 98;
  const ex = sx + Math.cos(armA) * 50 * f;
  const ey = sy + Math.sin(armA) * 50 + 18;
  ctx.strokeStyle = OUT;
  ctx.lineWidth = 11;
  ctx.beginPath();
  ctx.moveTo(sx, sy);
  ctx.lineTo(ex, ey);
  ctx.stroke();
  ctx.strokeStyle = '#3a1a1a';
  ctx.lineWidth = 8;
  ctx.stroke();
  r(ctx, '#c8a050', ex - 6, ey - 6, 12, 12);
  r(ctx, OUT, x - 30 * f - 6, y - 98, 12, 40);
  r(ctx, '#3a1a1a', x - 30 * f - 5, y - 97, 10, 38);
  // head: big round eyes, fangs, golden crown with flames
  const hx = x + 4 * f;
  const hy = y - 124 + Math.round(Math.sin(time * 2) * 2);
  r(ctx, OUT, hx - 17, hy - 16, 34, 34);
  r(ctx, '#8a1a1a', hx - 16, hy - 15, 32, 32);
  r(ctx, '#f6f2e4', hx - 11 + 2 * f, hy - 8, 9, 9);
  r(ctx, '#f6f2e4', hx + 3 + 2 * f, hy - 8, 9, 9);
  r(ctx, wind ? '#ff3a2a' : OUT, hx - 8 + 4 * f, hy - 5, 4, 4);
  r(ctx, wind ? '#ff3a2a' : OUT, hx + 6 + 4 * f, hy - 5, 4, 4);
  r(ctx, OUT, hx - 12, hy + 6, 24, 8);
  r(ctx, '#f6f2e4', hx - 10, hy + 6, 4, 7);
  r(ctx, '#f6f2e4', hx + 6, hy + 6, 4, 7);
  r(ctx, '#f6f2e4', hx - 4, hy + 6, 2, 3);
  r(ctx, '#f6f2e4', hx + 2, hy + 6, 2, 3);
  r(ctx, OUT, hx - 18, hy - 26, 36, 12);
  r(ctx, '#c8a050', hx - 17, hy - 25, 34, 10);
  for (let i = 0; i < 5; i++) r(ctx, '#e0c070', hx - 15 + i * 7, hy - 32 + (i % 2) * 3, 4, 8);
  flames(ctx, hx, hy - 32, 14, 10 + Math.sin(time * 5) * 3, time);
  if (e.state === 'dizzy') {
    for (let i = 0; i < 4; i++) {
      const a = time * 5 + (i * Math.PI) / 2;
      r(ctx, '#f2c94c', hx + Math.cos(a) * 22 - 1, hy - 40 + Math.sin(a) * 5, 3, 3);
    }
  }
  ctx.globalAlpha = 1;
  if (e.state === 'dead') {
    ctx.fillStyle = `rgba(255,240,200,${Math.max(0, 0.7 - e.t * 0.35)})`;
    ctx.fillRect(x - 60, y - 170, 120, 170);
  }
}
