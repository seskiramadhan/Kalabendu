// Shadow-puppet scenes: dark silhouettes on a lamp-lit kelir (screen).
const INK = '#1a100b';

function screen(ctx, w, h, warm = 1) {
  const g = ctx.createRadialGradient(w / 2, h * 0.35, 10, w / 2, h * 0.5, w * 0.7);
  g.addColorStop(0, `rgba(255,${Math.round(214 + 20 * warm)},${Math.round(150 + 40 * warm)},1)`);
  g.addColorStop(0.6, '#e0a860');
  g.addColorStop(1, '#6a3a1a');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
}

export function gunungan(ctx, cx, base, size, color = INK) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(cx, base - size * 1.25);
  ctx.bezierCurveTo(cx + size * 0.3, base - size, cx + size * 0.6, base - size * 0.5, cx + size * 0.55, base - size * 0.1);
  ctx.lineTo(cx + size * 0.4, base);
  ctx.lineTo(cx - size * 0.4, base);
  ctx.lineTo(cx - size * 0.55, base - size * 0.1);
  ctx.bezierCurveTo(cx - size * 0.6, base - size * 0.5, cx - size * 0.3, base - size, cx, base - size * 1.25);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,220,160,0.35)';
  ctx.lineWidth = 1;
  for (let i = 0; i < 5; i++) {
    ctx.beginPath();
    ctx.moveTo(cx, base - size * 0.2 - i * size * 0.16);
    ctx.quadraticCurveTo(cx + size * 0.25, base - size * 0.35 - i * size * 0.16, cx + size * (0.35 - i * 0.05), base - size * 0.3 - i * size * 0.16);
    ctx.moveTo(cx, base - size * 0.2 - i * size * 0.16);
    ctx.quadraticCurveTo(cx - size * 0.25, base - size * 0.35 - i * size * 0.16, cx - size * (0.35 - i * 0.05), base - size * 0.3 - i * size * 0.16);
    ctx.stroke();
  }
}

// A wayang figure in profile: long thin arms on sticks, tall headdress.
export function figure(ctx, x, base, s, facing = 1, kind = 'ksatria', sway = 0) {
  ctx.save();
  ctx.translate(x, base);
  ctx.scale(facing, 1);
  ctx.fillStyle = INK;
  ctx.strokeStyle = INK;
  // skirt (kain) and legs
  ctx.beginPath();
  ctx.moveTo(-10 * s, 0);
  ctx.lineTo(8 * s, 0);
  ctx.lineTo(4 * s, -26 * s);
  ctx.lineTo(-6 * s, -26 * s);
  ctx.closePath();
  ctx.fill();
  // torso
  ctx.beginPath();
  ctx.moveTo(-5 * s, -26 * s);
  ctx.lineTo(5 * s, -26 * s);
  ctx.lineTo(3 * s, -48 * s);
  ctx.lineTo(-4 * s, -48 * s);
  ctx.closePath();
  ctx.fill();
  // head with long nose
  ctx.beginPath();
  ctx.ellipse(1 * s, -54 * s, 5 * s, 6 * s, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(5 * s, -55 * s);
  ctx.lineTo(10 * s, -52 * s);
  ctx.lineTo(5 * s, -51 * s);
  ctx.fill();
  // headdress
  if (kind === 'raja' || kind === 'kala') {
    ctx.beginPath();
    ctx.moveTo(-5 * s, -58 * s);
    ctx.lineTo(-2 * s, -74 * s);
    ctx.lineTo(2 * s, -66 * s);
    ctx.lineTo(5 * s, -76 * s);
    ctx.lineTo(6 * s, -58 * s);
    ctx.fill();
  } else {
    ctx.beginPath();
    ctx.moveTo(-6 * s, -57 * s);
    ctx.quadraticCurveTo(-12 * s, -64 * s, -8 * s, -70 * s);
    ctx.lineTo(4 * s, -60 * s);
    ctx.fill();
  }
  // arms on sticks (gapit)
  ctx.lineWidth = 2 * s;
  ctx.beginPath();
  ctx.moveTo(2 * s, -46 * s);
  ctx.lineTo(16 * s, -30 * s + sway * 4);
  ctx.lineTo(26 * s, -40 * s + sway * 8);
  ctx.moveTo(-2 * s, -46 * s);
  ctx.lineTo(-12 * s, -24 * s - sway * 3);
  ctx.lineTo(-6 * s, -6 * s);
  ctx.stroke();
  ctx.lineWidth = 1;
  ctx.strokeStyle = 'rgba(26,16,11,0.6)';
  ctx.beginPath();
  ctx.moveTo(26 * s, -40 * s + sway * 8);
  ctx.lineTo(22 * s, 10 * s);
  ctx.moveTo(-6 * s, -6 * s);
  ctx.lineTo(-8 * s, 10 * s);
  ctx.stroke();
  ctx.restore();
}

// Batara Kala's head: wide eyes, fangs, crown.
function kalaHead(ctx, cx, cy, s, time) {
  ctx.fillStyle = INK;
  ctx.beginPath();
  ctx.ellipse(cx, cy, 40 * s, 34 * s, 0, 0, Math.PI * 2);
  ctx.fill();
  for (let i = -3; i <= 3; i++) {
    ctx.beginPath();
    ctx.moveTo(cx + i * 12 * s - 6 * s, cy - 28 * s);
    ctx.lineTo(cx + i * 12 * s, cy - (52 + (i % 2 ? 0 : 10)) * s);
    ctx.lineTo(cx + i * 12 * s + 6 * s, cy - 28 * s);
    ctx.fill();
  }
  const glow = 0.6 + 0.4 * Math.sin(time * 3);
  ctx.fillStyle = `rgba(255,${Math.round(80 + 60 * glow)},40,${0.9})`;
  ctx.beginPath();
  ctx.ellipse(cx - 14 * s, cy - 6 * s, 7 * s, 5 * s, 0, 0, Math.PI * 2);
  ctx.ellipse(cx + 14 * s, cy - 6 * s, 7 * s, 5 * s, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#f6e0b0';
  for (const dx of [-10, 10]) {
    ctx.beginPath();
    ctx.moveTo(cx + dx * s - 4 * s, cy + 14 * s);
    ctx.lineTo(cx + dx * s, cy + 28 * s);
    ctx.lineTo(cx + dx * s + 4 * s, cy + 14 * s);
    ctx.fill();
  }
}

function flamesRow(ctx, w, base, time, alpha = 1) {
  for (let x = 0; x < w; x += 10) {
    const h = 14 + Math.sin(time * 6 + x) * 6;
    ctx.fillStyle = `rgba(200,60,20,${0.6 * alpha})`;
    ctx.beginPath();
    ctx.moveTo(x, base);
    ctx.quadraticCurveTo(x + 5, base - h * 2, x + 10, base);
    ctx.fill();
  }
}

function house(ctx, x, base, w) {
  ctx.fillStyle = INK;
  ctx.fillRect(x, base - w * 0.6, w, w * 0.6);
  ctx.beginPath();
  ctx.moveTo(x - 6, base - w * 0.6);
  ctx.lineTo(x + w / 2, base - w * 1.05);
  ctx.lineTo(x + w + 6, base - w * 0.6);
  ctx.fill();
}

export function drawWayang(ctx, id, w, h, time) {
  const base = h - 14;
  screen(ctx, w, h, id === 'kalasuba' ? 1.4 : id === 'darkruin' ? 0.2 : 1);
  ctx.save();
  ctx.shadowColor = 'rgba(26,16,11,0.6)';
  ctx.shadowBlur = 6;
  const sway = Math.sin(time * 1.5);
  switch (id) {
    case 'kalabendu':
      kalaHead(ctx, w * 0.7, h * 0.38, 1.1, time);
      gunungan(ctx, w * 0.25, base, 90);
      flamesRow(ctx, w, base + 4, time, 0.8);
      break;
    case 'village':
      for (let i = 0; i < 4; i++) house(ctx, 30 + i * 110, base, 56);
      figure(ctx, w * 0.5, base, 1.6, 1, 'ksatria', sway);
      break;
    case 'forest':
      for (let i = 0; i < 9; i++) {
        ctx.fillStyle = INK;
        ctx.fillRect(20 + i * 52, base - 110 + (i % 3) * 14, 8, 110);
        for (let k = 0; k < 3; k++) ctx.fillRect(4 + i * 52, base - 96 + (i % 3) * 14 + k * 22, 40, 4);
      }
      flamesRow(ctx, w, base + 4, time, 1);
      figure(ctx, w * 0.2, base, 1.3, 1, 'ksatria', sway);
      break;
    case 'factory':
      ctx.fillStyle = INK;
      for (let i = 0; i < 5; i++) ctx.fillRect(60 + i * 80, base - 130, 14, 130);
      ctx.fillRect(30, base - 70, w - 60, 70);
      for (let i = 0; i < 6; i++) figure(ctx, 70 + i * 60, base, 0.9, i % 2 ? 1 : -1, 'rakyat', sway * 0.5);
      break;
    case 'market':
      ctx.fillStyle = INK;
      ctx.fillRect(w / 2 - 3, base - 120, 6, 120);
      ctx.fillRect(w / 2 - 90, base - 118 + sway * 6, 180, 4);
      ctx.beginPath();
      ctx.arc(w / 2 - 80, base - 96 + sway * 6, 22, 0, Math.PI);
      ctx.arc(w / 2 + 80, base - 96 - sway * 6, 22, 0, Math.PI);
      ctx.fill();
      for (let i = 0; i < 10; i++) {
        ctx.beginPath();
        ctx.arc(40 + i * 44, ((time * 40 + i * 37) % (h - 20)) + 4, 5, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    case 'demo':
      for (let i = 0; i < 12; i++) figure(ctx, 20 + i * 40, base, 0.9 + (i % 3) * 0.1, 1, 'rakyat', Math.sin(time * 3 + i));
      ctx.fillStyle = INK;
      ctx.fillRect(120, base - 120, 240, 26);
      break;
    case 'tower':
      ctx.fillStyle = INK;
      ctx.fillRect(w / 2 - 40, 8, 80, base - 8);
      for (let y = 20; y < base - 10; y += 14) {
        ctx.fillStyle = 'rgba(255,214,90,0.6)';
        ctx.fillRect(w / 2 - 30, y, 60, 3);
      }
      figure(ctx, w * 0.2, base, 1.4, 1, 'ksatria', sway);
      figure(ctx, w * 0.82, base, 1.4, -1, 'raja', -sway);
      break;
    case 'kalasuba': {
      const g = ctx.createRadialGradient(w / 2, h * 0.3, 4, w / 2, h * 0.3, 60);
      g.addColorStop(0, 'rgba(255,255,220,0.9)');
      g.addColorStop(1, 'rgba(255,255,220,0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
      gunungan(ctx, w / 2, base, 100);
      for (let i = 0; i < 14; i++) {
        ctx.fillStyle = INK;
        ctx.fillRect(10 + i * 34, base - 30 - Math.sin(time * 2 + i) * 3, 2, 30);
      }
      for (let i = 0; i < 4; i++) {
        const bx = (time * 30 + i * 120) % (w + 40) - 20;
        ctx.fillRect(bx, 30 + i * 12, 8, 2);
      }
      break;
    }
    case 'dawn':
      ctx.fillStyle = 'rgba(255,240,200,0.7)';
      ctx.beginPath();
      ctx.arc(w / 2, base, 60, Math.PI, 0);
      ctx.fill();
      figure(ctx, w * 0.35, base, 1.4, 1, 'ksatria', sway);
      break;
    case 'darkruin':
      ctx.fillStyle = INK;
      ctx.fillRect(w / 2 - 40, 8, 80, base - 8);
      kalaHead(ctx, w / 2, h * 0.3, 0.8, time);
      for (let i = 0; i < 20; i++) {
        ctx.beginPath();
        ctx.arc(20 + i * 24, base - ((time * 30 + i * 13) % 40), 3, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
  }
  ctx.restore();
}
