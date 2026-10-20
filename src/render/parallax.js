import { VIEW_W, VIEW_H } from '../core/view.js';

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

// ---- Stage 0: Kampung Saat Fajar ----

function kampungFar(stage) {
  const r = rng(71);
  const width = VIEW_W + (stage.width - VIEW_W) * 0.1;
  const c = canvas(width, VIEW_H);
  const ctx = c.getContext('2d');
  ridge(ctx, width, 118, 5, '#6f6a86', r, 8);
  ridge(ctx, width, 130, 4, '#4f5e5c', r, 5);
  // Smoke from the burning forest beyond the hills: the story's first hint.
  for (const sx of [width * 0.3, width * 0.55, width * 0.8]) {
    px(ctx, 'rgba(255,140,60,0.35)', sx - 14, 124, 28, 6);
    for (let i = 0; i < 26; i++) {
      const y = 124 - i * 4;
      const drift = i * i * 0.08;
      const rad = 4 + i * 0.6;
      ctx.fillStyle = `rgba(${120 + i},${110 + i},${110 + i},${0.5 - i * 0.015})`;
      ctx.beginPath();
      ctx.arc(Math.round(sx + drift), y, rad, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  return { canvas: c, factor: 0.1, y: 0 };
}

function kampungMid(stage) {
  const r = rng(83);
  const width = VIEW_W + (stage.width - VIEW_W) * 0.35;
  const c = canvas(width, VIEW_H);
  const ctx = c.getContext('2d');
  // rice terraces with water catching the dawn light
  const bands = ['#5e8a3a', '#6e9a44', '#7aa64c', '#87b254'];
  for (let i = 0; i < 4; i++) {
    const y = 132 + i * 9;
    for (let x = 0; x < width; x += 4) {
      const wave = Math.round(Math.sin(x / 60 + i) * 2);
      px(ctx, bands[i], x, y + wave, 4, 12);
      if (r() < 0.25) px(ctx, '#f2c98a', x, y + wave + 3, 3, 1);
    }
  }
  for (let x = 20; x < width; x += 60 + Math.floor(r() * 70)) palm(ctx, x, 136, 30 + Math.floor(r() * 20), '#3d5a34');
  return { canvas: c, factor: 0.35, y: 0 };
}

function genteng(ctx, x, y, w, h) {
  for (let i = 0; i < h; i++) {
    const inset = Math.round(((h - i) / h) * 10);
    px(ctx, i % 3 ? '#b5532e' : '#8c3a20', x - 6 + inset, y + i, w + 12 - inset * 2, 1);
  }
}

function kampungBuilding(ctx, b, floorTop, r) {
  const x = b.x;
  const base = floorTop;
  if (b.type === 'rumah') {
    const w = 120;
    px(ctx, '#2c1f16', x - 1, base - 58, w + 2, 58);
    for (let i = 0; i < w; i += 6) px(ctx, i % 12 ? '#a0703e' : '#946634', x + i, base - 57, 6, 57);
    px(ctx, '#5e3b1a', x + 18, base - 40, 22, 18);
    px(ctx, '#f2c98a', x + 20, base - 38, 18, 14);
    px(ctx, '#5e3b1a', x + 28, base - 38, 2, 14);
    px(ctx, '#5e3b1a', x + 70, base - 44, 22, 44);
    px(ctx, '#7a4e24', x + 72, base - 42, 18, 42);
    px(ctx, '#e0b252', x + 87, base - 22, 2, 2);
    genteng(ctx, x, base - 82, w, 26);
  } else if (b.type === 'warung') {
    const w = 140;
    px(ctx, '#2c1f16', x - 1, base - 60, w + 2, 60);
    px(ctx, '#7a5a3a', x, base - 59, w, 59);
    // shelves of snacks and sachets
    for (let row = 0; row < 3; row++) {
      px(ctx, '#4a3020', x + 8, base - 52 + row * 12, w - 16, 2);
      for (let i = 0; i < 16; i++) {
        const cols = ['#e8571e', '#f2c94c', '#3a7ad8', '#4aa03c', '#d8433a', '#f6f2e4'];
        px(ctx, cols[Math.floor(r() * cols.length)], x + 10 + i * 8, base - 60 + row * 12, 5, 7);
      }
    }
    px(ctx, '#5e3b1a', x + 4, base - 22, w - 8, 22);
    px(ctx, '#8a5a2b', x + 4, base - 22, w - 8, 3);
    // striped tarp awning
    for (let i = 0; i < w + 20; i += 10) px(ctx, (i / 10) % 2 ? '#f6f2e4' : '#2f7a2c', x - 10 + i, base - 74, 10, 10);
    px(ctx, '#2c1f16', x - 10, base - 64, w + 20, 2);
    px(ctx, '#2c1f16', x + 28, base - 92, 84, 18);
    px(ctx, '#e0b252', x + 30, base - 90, 80, 14);
    ctx.fillStyle = '#5a1a14';
    ctx.font = 'bold 9px monospace';
    ctx.fillText('WARUNG', x + 44, base - 79);
  } else if (b.type === 'posronda') {
    const w = 70;
    for (const dx of [2, w - 6]) px(ctx, '#4a2c18', x + dx, base - 46, 4, 46);
    px(ctx, '#8a5a2b', x, base - 20, w, 4);
    genteng(ctx, x, base - 60, w, 14);
    px(ctx, '#4a2c18', x + 30, base - 46, 3, 8);
    px(ctx, '#8a5a2b', x + 27, base - 38, 9, 18);
    ctx.fillStyle = '#f6f2e4';
    ctx.font = '7px monospace';
    ctx.fillText('POS RONDA', x + 8, base - 24);
  } else if (b.type === 'gapura') {
    for (const dx of [0, 96]) {
      px(ctx, '#2c1f16', x + dx - 1, base - 80, 18, 80);
      px(ctx, '#e6e0cc', x + dx, base - 79, 16, 79);
      px(ctx, '#c8322a', x + dx, base - 79, 16, 6);
    }
    px(ctx, '#2c1f16', x - 4, base - 96, 120, 18);
    px(ctx, '#6e2a17', x - 3, base - 95, 118, 16);
    ctx.fillStyle = '#f2c94c';
    ctx.font = 'bold 8px monospace';
    ctx.fillText('KAMPUNG SUKAMAKMUR', x + 4, base - 84);
  } else if (b.type === 'balai') {
    const w = 260;
    px(ctx, '#2c1f16', x - 1, base - 66, w + 2, 66);
    px(ctx, '#d8c8a0', x, base - 65, w, 65);
    for (let i = 10; i < w; i += 40) px(ctx, '#8a5a2b', x + i, base - 65, 6, 65);
    genteng(ctx, x, base - 96, w, 30);
    px(ctx, '#2c1f16', x + 80, base - 64, 100, 14);
    px(ctx, '#2f5a8a', x + 81, base - 63, 98, 12);
    ctx.fillStyle = '#f6f2e4';
    ctx.font = 'bold 8px monospace';
    ctx.fillText('BALAI DESA', x + 102, base - 54);
  }
}

function kampungWall(stage) {
  const r = rng(97);
  const c = canvas(stage.width, VIEW_H);
  const ctx = c.getContext('2d');
  const top = stage.floorTop;
  // bamboo fence and banana plants behind the buildings
  for (let x = 0; x < stage.width; x += 5) {
    px(ctx, '#2c1f16', x, top - 22, 5, 22);
    px(ctx, r() < 0.5 ? '#b89a5a' : '#a88a4c', x + 1, top - 21, 3, 21);
  }
  px(ctx, '#5e4a2a', 0, top - 14, stage.width, 2);
  for (let x = 60; x < stage.width; x += 150 + Math.floor(r() * 120)) {
    px(ctx, '#4a6a2a', x, top - 40, 3, 40);
    for (let k = 0; k < 4; k++) px(ctx, '#5e8a3a', x - 10 + (k % 2) * 12, top - 46 + k * 6, 12, 4);
  }
  for (const b of stage.houses) kampungBuilding(ctx, b, top, r);
  return { canvas: c, factor: 1, y: 0 };
}

function kampungFloor(stage) {
  const r = rng(113);
  const h = VIEW_H - stage.floorTop;
  const c = canvas(stage.width, h);
  const ctx = c.getContext('2d');
  px(ctx, '#9a7048', 0, 0, stage.width, h);
  for (let i = 0; i < stage.width * h * 0.05; i++) {
    px(ctx, r() < 0.5 ? '#8a6240' : '#a87c52', r() * stage.width, r() * h, 2, 1);
  }
  // tyre tracks of the angkot and motorbikes
  for (const y of [34, 40, 62, 68]) for (let x = 0; x < stage.width; x += 3) if (r() < 0.7) px(ctx, '#86603e', x, y, 3, 1);
  // grass along the back edge
  for (let x = 0; x < stage.width; x += 2) px(ctx, r() < 0.5 ? '#5e8a3a' : '#4f7a32', x, 0, 2, 2 + Math.floor(r() * 4));
  return { canvas: c, factor: 1, y: stage.floorTop };
}

// ---- Stage 1: Hutan Terbakar -> Kebun Sawit -> river ----

function zoneKind(stage, worldX) {
  const z = stage.zones?.find((z) => worldX >= z.x0 && worldX < z.x1);
  return z?.kind ?? stage.zones?.[stage.zones.length - 1]?.kind;
}

function sawitPalm(ctx, x, baseY, h, trunk, frond) {
  px(ctx, trunk, x - 2, baseY - h, 5, h);
  for (let i = 0; i < h; i += 4) px(ctx, frond, x - 3, baseY - h + i, 2, 1);
  for (const dir of [-1, 1]) {
    for (let k = 0; k < 12; k++) {
      px(ctx, frond, x + dir * k, baseY - h + Math.round((k * k) / 12) - 2, 2, 2);
      px(ctx, frond, x + dir * Math.round(k * 0.7), baseY - h - 5 + Math.round((k * k) / 9), 2, 2);
    }
  }
}

function hutanFar(stage) {
  const r = rng(131);
  const f = 0.12;
  const width = VIEW_W + (stage.width - VIEW_W) * f;
  const c = canvas(width, VIEW_H);
  const ctx = c.getContext('2d');
  ridge(ctx, width, 120, 5, '#5a3a48', r, 8);
  for (let x = 0; x < width; x += 4) {
    const kind = zoneKind(stage, x / f);
    if (kind === 'forest') {
      px(ctx, 'rgba(255,120,40,0.35)', x, 128, 4, 10);
      if (r() < 0.05) {
        for (let i = 0; i < 18; i++) {
          ctx.fillStyle = `rgba(90,80,80,${0.45 - i * 0.02})`;
          ctx.beginPath();
          ctx.arc(x + i * i * 0.1, 128 - i * 5, 5 + i * 0.7, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    } else if (kind === 'river') {
      px(ctx, '#6a6a7e', x, 126, 4, 20);
    }
  }
  return { canvas: c, factor: f, y: 0 };
}

function hutanMid(stage) {
  const r = rng(149);
  const f = 0.4;
  const width = VIEW_W + (stage.width - VIEW_W) * f;
  const c = canvas(width, VIEW_H);
  const ctx = c.getContext('2d');
  ridge(ctx, width, 144, 3, '#3e2e30', r, 8);
  let x = 0;
  while (x < width) {
    const kind = zoneKind(stage, x / f);
    if (kind === 'forest') {
      const hgt = 40 + Math.floor(r() * 30);
      px(ctx, '#2a1e1c', x, 150 - hgt, 4, hgt);
      for (let k = 0; k < 4; k++) px(ctx, '#2a1e1c', x - 8 + k * 3, 150 - hgt + 8 + k * 7, 10, 2);
      px(ctx, 'rgba(255,110,40,0.5)', x + 3, 150 - hgt, 1, hgt);
      x += 22 + Math.floor(r() * 26);
    } else if (kind === 'sawit') {
      // the same palm, the same height, the same gap — on and on
      sawitPalm(ctx, x, 150, 26, '#4a4a2a', '#5a6a2e');
      x += 18;
    } else {
      px(ctx, '#3a4a3a', x, 120, 6, 30);
      px(ctx, '#4a5a44', x - 8, 112, 22, 12);
      x += 40 + Math.floor(r() * 30);
    }
  }
  return { canvas: c, factor: f, y: 0 };
}

function hutanWall(stage) {
  const r = rng(167);
  const c = canvas(stage.width, VIEW_H);
  const ctx = c.getContext('2d');
  const top = stage.floorTop;
  let x = 0;
  while (x < stage.width) {
    const kind = zoneKind(stage, x);
    if (kind === 'forest') {
      // burnt rainforest giants
      const w = 14 + Math.floor(r() * 10);
      px(ctx, '#1e1412', x - 1, 40, w + 2, top - 40);
      px(ctx, '#3a2620', x, 40, w, top - 40);
      px(ctx, '#5a3a2a', x + 2, 40, 2, top - 40);
      for (let k = 0; k < 3; k++) px(ctx, '#1e1412', x - 20 + k * 14, 60 + k * 18, 30, 4);
      px(ctx, '#ff7a2a', x + w - 2, 80 + Math.floor(r() * 40), 2, 12);
      if (r() < 0.3) {
        px(ctx, '#2a1e1c', x + w + 10, top - 10, 30, 10);
        px(ctx, '#7a5a3a', x + w + 10, top - 10, 6, 10);
      }
      x += 70 + Math.floor(r() * 60);
    } else if (kind === 'sawit') {
      sawitPalm(ctx, x, top, 70, '#5e4e2e', '#6f7f3a');
      px(ctx, '#8a3a1a', x - 4, top - 66, 8, 6);
      x += 64;
    } else {
      // riverbank: sandbags and a broken bridge rail
      for (let i = 0; i < 4; i++) px(ctx, i % 2 ? '#a08a5a' : '#8a7448', x + i * 14, top - 14 - (i % 2) * 6, 14, 8);
      px(ctx, '#5e3b1a', x + 70, top - 50, 4, 50);
      px(ctx, '#5e3b1a', x + 70, top - 46, 50, 3);
      px(ctx, '#5e3b1a', x + 116, top - 40, 4, 40);
      x += 160 + Math.floor(r() * 60);
    }
  }
  // signs (all fictional)
  const sign = (sx, w, color, text, textColor = '#f6f2e4') => {
    px(ctx, '#2c1f16', sx + w / 2 - 2, top - 70, 4, 70);
    px(ctx, '#2c1f16', sx - 1, top - 96, w + 2, 22);
    px(ctx, color, sx, top - 95, w, 20);
    ctx.fillStyle = textColor;
    ctx.font = 'bold 7px monospace';
    ctx.fillText(text, sx + 4, top - 82);
  };
  sign(560, 124, '#e6e0cc', 'DILARANG MEMBAKAR HUTAN', '#8a2a20');
  sign(2060, 150, '#2f5a2a', 'KONSESI PT SAWIT SEJAHTERA SEKALI');
  sign(3140, 112, '#c8a050', 'SAWIT UNTUK SIAPA?', '#2c1f16');
  sign(3640, 96, '#8a2a20', 'AWAS BANJIR!');
  return { canvas: c, factor: 1, y: 0 };
}

function hutanFloor(stage) {
  const r = rng(181);
  const h = VIEW_H - stage.floorTop;
  const c = canvas(stage.width, h);
  const ctx = c.getContext('2d');
  for (let x = 0; x < stage.width; x += 4) {
    const kind = zoneKind(stage, x);
    const base = kind === 'forest' ? '#6a5446' : kind === 'sawit' ? '#a8683a' : '#6a5030';
    px(ctx, base, x, 0, 4, h);
  }
  for (let i = 0; i < stage.width * h * 0.05; i++) {
    const x = r() * stage.width;
    const kind = zoneKind(stage, x);
    const col = kind === 'forest' ? (r() < 0.06 ? '#ff8a3a' : r() < 0.5 ? '#5a4638' : '#7a6656') : kind === 'sawit' ? (r() < 0.5 ? '#94582e' : '#b8784a') : r() < 0.5 ? '#7a6040' : '#8a7454';
    px(ctx, col, x, r() * h, 2, 1);
  }
  for (let x = 0; x < stage.width; x += 3) {
    if (zoneKind(stage, x) === 'sawit') {
      px(ctx, '#8a5028', x, 30, 3, 2);
      px(ctx, '#8a5028', x, 58, 3, 2);
    }
  }
  return { canvas: c, factor: 1, y: stage.floorTop };
}

// ---- Stage 2: Pabrik Tutup (night) ----

function skyline(ctx, width, baseY, color, lit, r) {
  for (let x = 0; x < width; ) {
    const w = 16 + Math.floor(r() * 28);
    const h = 20 + Math.floor(r() * 50);
    px(ctx, color, x, baseY - h, w, h + 40);
    for (let wy = baseY - h + 4; wy < baseY - 4; wy += 6)
      for (let wx = x + 3; wx < x + w - 3; wx += 5) if (r() < 0.12) px(ctx, lit, wx, wy, 2, 2);
    x += w + 2;
  }
}

function pabrikFar(stage) {
  const r = rng(211);
  const width = VIEW_W + (stage.width - VIEW_W) * 0.12;
  const c = canvas(width, VIEW_H);
  skyline(c.getContext('2d'), width, 140, '#1a2236', '#e0c070', r);
  return { canvas: c, factor: 0.12, y: 0 };
}

function pabrikMid(stage) {
  const r = rng(223);
  const width = VIEW_W + (stage.width - VIEW_W) * 0.4;
  const c = canvas(width, VIEW_H);
  const ctx = c.getContext('2d');
  for (let x = 0; x < width; x += 90 + Math.floor(r() * 40)) {
    // sawtooth factory roofs and cold chimneys: no smoke, the factory is closed
    for (let k = 0; k < 4; k++) for (let i = 0; i < 12; i++) px(ctx, '#232c40', x + k * 16 + i, 120 - (i * 12) / 12 * 1.2, 1, 30);
    px(ctx, '#232c40', x, 132, 64, 30);
    px(ctx, '#2a344a', x + 54, 70, 8, 62);
    px(ctx, '#c8322a', x + 54, 74, 8, 3);
  }
  return { canvas: c, factor: 0.4, y: 0 };
}

function pabrikWall(stage) {
  const r = rng(239);
  const c = canvas(stage.width, VIEW_H);
  const ctx = c.getContext('2d');
  const top = stage.floorTop;
  px(ctx, '#3a3e48', 0, 80, stage.width, top - 80);
  for (let y = 84; y < top; y += 6) for (let x = (y / 6) % 2 ? 0 : 6; x < stage.width; x += 12) px(ctx, '#33363f', x, y, 11, 5);
  for (let x = 40; x < stage.width; x += 220 + Math.floor(r() * 80)) {
    // closed roller door covered with PHK notices
    px(ctx, '#1e2026', x - 1, 100, 92, top - 100);
    for (let y = 102; y < top; y += 4) px(ctx, y % 8 ? '#5a5e68' : '#4a4e58', x, y, 90, 3);
    for (let i = 0; i < 4; i++) {
      const nx = x + 8 + i * 20 + Math.floor(r() * 6);
      const ny = 116 + Math.floor(r() * 26);
      px(ctx, '#f6f2e4', nx, ny, 14, 18);
      px(ctx, '#c8322a', nx + 2, ny + 2, 10, 4);
      px(ctx, '#8a8a8a', nx + 2, ny + 9, 10, 1);
      px(ctx, '#8a8a8a', nx + 2, ny + 12, 8, 1);
    }
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 7px monospace';
    ctx.fillText('PHK', x + 10, 128);
  }
  // silent conveyor belts and a machine between the doors
  for (let x = 170; x < stage.width; x += 300) {
    px(ctx, '#20232a', x, top - 26, 110, 10);
    for (let i = 0; i < 110; i += 8) px(ctx, '#4a4e58', x + i, top - 24, 4, 6);
    for (const [i, col] of [[10, '#c8a070'], [40, '#e6e0cc'], [72, '#8a5a3a']]) px(ctx, col, x + i, top - 34, 14, 8);
    px(ctx, '#4a5a6a', x + 112, top - 60, 30, 50);
    px(ctx, '#c8322a', x + 118, top - 52, 6, 6);
  }
  const sign = (sx, w, color, text, tc) => {
    px(ctx, '#120c0a', sx - 1, 84, w + 2, 18);
    px(ctx, color, sx, 85, w, 16);
    ctx.fillStyle = tc;
    ctx.font = 'bold 8px monospace';
    ctx.fillText(text, sx + 5, 96);
  };
  sign(120, 200, '#2a5a8a', 'PT SEPATU & KERAMIK MAJU MUNDUR', '#f6f2e4');
  sign(1300, 120, '#c8322a', 'DITUTUP SEMENTARA', '#f6f2e4');
  sign(2400, 150, '#e0b252', 'DIGANTI MESIN, MAAF YA', '#2a2a2a');
  return { canvas: c, factor: 1, y: 0 };
}

function pabrikFloor(stage) {
  const r = rng(251);
  const h = VIEW_H - stage.floorTop;
  const c = canvas(stage.width, h);
  const ctx = c.getContext('2d');
  px(ctx, '#4a4c52', 0, 0, stage.width, h);
  for (let i = 0; i < stage.width * h * 0.04; i++) px(ctx, r() < 0.5 ? '#42444a' : '#55575d', r() * stage.width, r() * h, 2, 1);
  for (let x = 0; x < stage.width; x += 12) {
    px(ctx, (x / 12) % 2 ? '#e0b252' : '#2a2a2a', x, 2, 12, 3);
    px(ctx, (x / 12) % 2 ? '#2a2a2a' : '#e0b252', x, h - 6, 12, 3);
  }
  return { canvas: c, factor: 1, y: stage.floorTop };
}

// ---- Stage 3: Pasar Rakyat -> Lantai Bursa ----

function pasarFar(stage) {
  const r = rng(263);
  const f = 0.12;
  const width = VIEW_W + (stage.width - VIEW_W) * f;
  const c = canvas(width, VIEW_H);
  const ctx = c.getContext('2d');
  for (let x = 0; x < width; x += 4) {
    if (zoneKind(stage, x / f) === 'bursa') px(ctx, '#0e1018', x, 0, 4, VIEW_H);
  }
  skyline(ctx, width, 136, '#5a6a8a', '#f6f2e4', r);
  for (let x = 0; x < width; x += 4) if (zoneKind(stage, x / f) === 'bursa') px(ctx, '#0e1018', x, 0, 4, VIEW_H);
  return { canvas: c, factor: f, y: 0 };
}

function pasarMid(stage) {
  const r = rng(271);
  const f = 0.4;
  const width = VIEW_W + (stage.width - VIEW_W) * f;
  const c = canvas(width, VIEW_H);
  const ctx = c.getContext('2d');
  for (let x = 0; x < width; x += 4) {
    if (zoneKind(stage, x / f) !== 'bursa') continue;
    px(ctx, '#141826', x, 40, 4, 120);
    if ((x / 4) % 6 === 0) for (let y = 50; y < 150; y += 16) px(ctx, r() < 0.5 ? '#3a1a1a' : '#1a3a2a', x, y, 20, 12);
  }
  for (let x = 0; x < width; x += 30 + Math.floor(r() * 20)) {
    if (zoneKind(stage, x / f) === 'bursa') continue;
    const cols = ['#c8322a', '#2f7a2c', '#3a7ad8', '#e0b252'];
    const col = cols[Math.floor(r() * cols.length)];
    for (let i = 0; i < 6; i++) px(ctx, col, x - i * 2, 120 + i * 2, 34 + i * 4, 2);
    px(ctx, '#4a3a2a', x + 2, 132, 3, 20);
  }
  return { canvas: c, factor: f, y: 0 };
}

function pasarWall(stage) {
  const r = rng(283);
  const c = canvas(stage.width, VIEW_H);
  const ctx = c.getContext('2d');
  const top = stage.floorTop;
  let x = 0;
  while (x < stage.width) {
    if (zoneKind(stage, x) === 'bursa') {
      px(ctx, '#181c2a', x, 60, 4, top - 60);
      px(ctx, '#2a3046', x, top - 8, 4, 8);
      x += 4;
      continue;
    }
    // a market stall: tarp roof, a table of produce, a sack of rice
    const w = 90;
    const cols = ['#c8322a', '#2f7a2c', '#3a7ad8', '#e86a1a'];
    const tarp = cols[Math.floor(r() * cols.length)];
    for (let i = 0; i < w + 12; i += 8) px(ctx, (i / 8) % 2 ? tarp : '#f6f2e4', x - 6 + i, 90, 8, 10);
    px(ctx, '#4a2c18', x, 100, 3, top - 100);
    px(ctx, '#4a2c18', x + w - 3, 100, 3, top - 100);
    px(ctx, '#8a5a2b', x, top - 34, w, 6);
    const produce = [['#e0402a', 6], ['#4aa03c', 5], ['#f2c94c', 5], ['#8a3a8a', 4], ['#e86a1a', 5]];
    for (let i = 0; i < 14; i++) {
      const [col, sz] = produce[Math.floor(r() * produce.length)];
      px(ctx, col, x + 4 + i * 6, top - 34 - sz, sz, sz);
    }
    px(ctx, '#e6dcc0', x + w - 26, top - 28, 20, 28);
    ctx.fillStyle = '#8a6a3a';
    ctx.font = 'bold 5px monospace';
    ctx.fillText('BERAS', x + w - 25, top - 14);
    x += w + 30 + Math.floor(r() * 30);
  }
  return { canvas: c, factor: 1, y: 0 };
}

function pasarFloor(stage) {
  const r = rng(293);
  const h = VIEW_H - stage.floorTop;
  const c = canvas(stage.width, h);
  const ctx = c.getContext('2d');
  for (let x = 0; x < stage.width; x += 4) px(ctx, zoneKind(stage, x) === 'bursa' ? '#1a1e2a' : '#8a8478', x, 0, 4, h);
  for (let i = 0; i < stage.width * h * 0.04; i++) {
    const x = r() * stage.width;
    const bursa = zoneKind(stage, x) === 'bursa';
    px(ctx, bursa ? (r() < 0.1 ? '#5a1a1a' : '#222838') : r() < 0.5 ? '#7a7468' : '#9a9488', x, r() * h, 2, 1);
  }
  for (let x = 0; x < stage.width; x += 26) {
    if (zoneKind(stage, x) === 'bursa') {
      px(ctx, '#2a3046', x, 0, 1, h);
    } else if (r() < 0.3) px(ctx, 'rgba(160,190,210,0.5)', x, 20 + Math.floor(r() * 60), 16, 3);
  }
  return { canvas: c, factor: 1, y: stage.floorTop };
}

const THEMES = {
  padepokan: [buildFar, buildMid, buildWall, buildFloor],
  kampung: [kampungFar, kampungMid, kampungWall, kampungFloor],
  hutan: [hutanFar, hutanMid, hutanWall, hutanFloor],
  pabrik: [pabrikFar, pabrikMid, pabrikWall, pabrikFloor],
  pasar: [pasarFar, pasarMid, pasarWall, pasarFloor],
};

export function buildStageArt(stage) {
  const sky = canvas(VIEW_W, VIEW_H);
  const ctx = sky.getContext('2d');
  const g = ctx.createLinearGradient(0, 0, 0, stage.floorTop);
  g.addColorStop(0, stage.sky[2]);
  g.addColorStop(0.55, stage.sky[1]);
  g.addColorStop(1, stage.sky[0]);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  const sun = stage.sun ?? { x: 330, y: 112, r: 16, color: stage.theme === 'hutan' ? 'rgba(255,140,80,0.8)' : 'rgba(255,236,190,0.9)' };
  ctx.fillStyle = sun.color;
  ctx.beginPath();
  ctx.arc(sun.x, sun.y, sun.r, 0, Math.PI * 2);
  ctx.fill();
  return { sky, layers: THEMES[stage.theme].map((build) => build(stage)) };
}
