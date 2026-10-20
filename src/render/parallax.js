import { VIEW_W, VIEW_H } from '../game.js';

function rng(seed) {
  let s = seed >>> 0 || 1;
  return () => {
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    return (s >>> 0) / 4294967296;
  };
}

function canvas(w, h) {
  const c = document.createElement('canvas');
  c.width = Math.ceil(w);
  c.height = Math.ceil(h);
  return c;
}

function px(ctx, color, x, y, w, h) {
  ctx.fillStyle = color;
  ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
}

function ridge(ctx, width, baseY, amp, color, r, step = 6) {
  ctx.fillStyle = color;
  let y = baseY;
  for (let x = 0; x < width; x += step) {
    y += (r() - 0.5) * amp;
    y = Math.max(baseY - amp * 3, Math.min(baseY + amp, y));
    ctx.fillRect(x, Math.round(y), step, VIEW_H);
  }
}

function palm(ctx, x, baseY, h, color) {
  for (let i = 0; i < h; i++) px(ctx, color, x + Math.round(Math.sin(i / 9) * 3), baseY - i, 3, 1);
  const tx = x + Math.round(Math.sin(h / 9) * 3) + 1;
  const ty = baseY - h;
  for (const dir of [-1, 1]) {
    for (let k = 0; k < 14; k++) {
      px(ctx, color, tx + dir * k, ty + Math.round((k * k) / 22), 2, 2);
      px(ctx, color, tx + dir * Math.round(k * 0.6), ty - 3 + Math.round((k * k) / 18), 2, 2);
    }
  }
}

function joglo(ctx, x, baseY, w, roof, wall) {
  const h = 18;
  px(ctx, wall, x + 6, baseY - h, w - 12, h);
  for (let i = 0; i < 10; i++) px(ctx, roof, x + i * 2, baseY - h - i * 1.4, w - i * 4, 2);
  for (let i = 0; i < 5; i++) px(ctx, roof, x + w / 2 - 6 + i, baseY - h - 14 - i * 1.6, 12 - i * 2, 2);
}

function buildFar(stage) {
  const r = rng(11);
  const width = VIEW_W + (stage.width - VIEW_W) * 0.12;
  const c = canvas(width, VIEW_H);
  const ctx = c.getContext('2d');
  // volcano, softly lit by the dawn sun
  const cx = width * 0.55;
  for (let y = 40; y < 170; y++) {
    const half = (y - 40) * 1.6 + 6;
    px(ctx, '#8d6a7a', cx - half, y, half * 2, 1);
  }
  px(ctx, '#a07f8a', cx - 6, 40, 12, 3);
  for (let i = 0; i < 6; i++) px(ctx, 'rgba(240,230,230,0.5)', cx - 3 + i * 2 - 6, 34 - i * 3, 6 - i, 3);
  ridge(ctx, width, 128, 6, '#7a5a6e', r);
  return { canvas: c, factor: 0.12, y: 0 };
}

function buildMid(stage) {
  const r = rng(23);
  const width = VIEW_W + (stage.width - VIEW_W) * 0.4;
  const c = canvas(width, VIEW_H);
  const ctx = c.getContext('2d');
  ridge(ctx, width, 142, 4, '#5e4a52', r, 8);
  for (let x = 10; x < width; x += 50 + Math.floor(r() * 50)) {
    if (r() < 0.35) joglo(ctx, x, 150, 46 + Math.floor(r() * 20), '#4a3238', '#56403f');
    else palm(ctx, x, 150, 34 + Math.floor(r() * 18), '#3f3138');
  }
  return { canvas: c, factor: 0.4, y: 0 };
}

// Bamboo fence and props: same plane as the back of the floor.
function buildWall(stage) {
  const r = rng(37);
  const c = canvas(stage.width, VIEW_H);
  const ctx = c.getContext('2d');
  const top = 128;
  const bottom = stage.floorTop;
  for (let x = 0; x < stage.width; x += 5) {
    const h = 2 + Math.floor(r() * 4);
    px(ctx, '#2c1f16', x, top - h - 1, 5, bottom - top + h + 1);
    px(ctx, r() < 0.5 ? '#b89a5a' : '#a88a4c', x + 1, top - h, 3, bottom - top + h);
    px(ctx, '#7d6638', x + 1, top + 12, 3, 1);
    px(ctx, '#7d6638', x + 1, top + 28, 3, 1);
  }
  px(ctx, '#5e4a2a', 0, top + 10, stage.width, 3);
  px(ctx, '#5e4a2a', 0, top + 30, stage.width, 3);

  for (const prop of stage.props) {
    if (prop.type === 'pendopo') {
      const x = prop.x;
      for (let i = 0; i < 12; i++) px(ctx, i % 3 ? '#7a3a22' : '#6a3020', x + 18 - 14 - i * 5, 70 + i * 2.2, 28 + i * 10, 3);
      px(ctx, '#5c2a18', x + 18 - 8, 64, 16, 6);
      px(ctx, '#5c2a18', x - 40, 96, 116, 3);
      for (const dx of [-30, -2, 26, 54]) px(ctx, '#4a2c18', x + dx, 99, 4, bottom - 99);
    } else if (prop.type === 'kentongan') {
      const x = prop.x;
      px(ctx, '#4a2c18', x, 92, 4, bottom - 92);
      px(ctx, '#4a2c18', x - 10, 92, 24, 3);
      px(ctx, '#8a5a2b', x - 3, 96, 10, 22);
      px(ctx, '#2c1f16', x + 1, 100, 2, 14);
    } else if (prop.type === 'banner') {
      const x = prop.x;
      px(ctx, '#4a2c18', x, 70, 3, bottom - 70);
      px(ctx, '#4a2c18', x + 60, 70, 3, bottom - 70);
      px(ctx, '#2c1f16', x + 2, 76, 60, 26);
      px(ctx, '#c8322a', x + 4, 78, 56, 22);
      for (let i = 0; i < 7; i++) px(ctx, '#e0b252', x + 8 + i * 8, 86, 4, 4);
    }
  }
  return { canvas: c, factor: 1, y: 0 };
}

function buildFloor(stage) {
  const r = rng(51);
  const h = VIEW_H - stage.floorTop;
  const c = canvas(stage.width, h);
  const ctx = c.getContext('2d');
  px(ctx, '#8a6240', 0, 0, stage.width, h);
  for (let i = 0; i < stage.width * h * 0.04; i++) {
    px(ctx, r() < 0.5 ? '#7d5838' : '#956c48', r() * stage.width, r() * h, 2, 1);
  }
  // stone pavers in perspective rows
  for (let row = 0; row < 5; row++) {
    const y = 6 + row * 18;
    const tileW = 26 + row * 6;
    for (let x = (row % 2) * (tileW / 2); x < stage.width; x += tileW + 4) {
      px(ctx, '#6e5038', x, y, tileW, 9 + row);
      px(ctx, '#a07a58', x, y, tileW, 1);
    }
  }
  px(ctx, '#5a3f2a', 0, 0, stage.width, 2);
  return { canvas: c, factor: 1, y: stage.floorTop };
}

export function buildStageArt(stage) {
  const sky = canvas(VIEW_W, VIEW_H);
  const ctx = sky.getContext('2d');
  const g = ctx.createLinearGradient(0, 0, 0, stage.floorTop);
  g.addColorStop(0, stage.sky[2]);
  g.addColorStop(0.55, stage.sky[1]);
  g.addColorStop(1, stage.sky[0]);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  ctx.fillStyle = 'rgba(255,236,190,0.9)';
  ctx.beginPath();
  ctx.arc(330, 112, 16, 0, Math.PI * 2);
  ctx.fill();
  return { sky, layers: [buildFar(stage), buildMid(stage), buildWall(stage), buildFloor(stage)] };
}
