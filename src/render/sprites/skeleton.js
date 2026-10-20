// Draws a fighter from a pose: absolute joint angles in degrees, 0 = hanging
// down, positive = rotated toward the facing direction. Lines are plotted as
// pixel squares so the figure stays crisp when the 480x270 buffer is scaled.
const LEN = { torso: 20, thigh: 15, shin: 15, upper: 11, fore: 11, neck: 8 };
const HEAD = 7;
const OUTLINE = '#120c0a';
const RAD = Math.PI / 180;

function seg(ctx, a, b, w, color) {
  ctx.fillStyle = color;
  const steps = Math.max(1, Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1])));
  const half = w / 2;
  for (let i = 0; i <= steps; i++) {
    const x = a[0] + ((b[0] - a[0]) * i) / steps;
    const y = a[1] + ((b[1] - a[1]) * i) / steps;
    ctx.fillRect(Math.round(x - half), Math.round(y - half), w, w);
  }
}

function disc(ctx, c, r, color) {
  ctx.fillStyle = color;
  const cx = Math.round(c[0]);
  const cy = Math.round(c[1]);
  for (let dy = -r; dy <= r; dy++) {
    const span = Math.floor(Math.sqrt(r * r - dy * dy + r * 0.6));
    ctx.fillRect(cx - span, cy + dy, span * 2 + 1, 1);
  }
}

function part(ctx, a, b, w, color) {
  seg(ctx, a, b, w + 2, OUTLINE);
  seg(ctx, a, b, w, color);
}

function shade(hex, k) {
  const n = parseInt(hex.slice(1), 16);
  const c = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => Math.max(0, Math.min(255, Math.round(v * k))));
  return `rgb(${c.join(',')})`;
}

// Returns the joint points for a pose with the hip at (0, 0).
export function solve(pose, facing) {
  const dir = (deg, len, from) => [from[0] + Math.sin(deg * RAD) * len * facing, from[1] + Math.cos(deg * RAD) * len];
  const hip = [0, 0];
  const t = pose.t * RAD;
  const neck = [Math.sin(t) * LEN.torso * facing, -Math.cos(t) * LEN.torso];
  const shoulder = [neck[0] - Math.sin(t) * 2 * facing, neck[1] + Math.cos(t) * 2];
  const ht = (pose.t + (pose.hd ?? 0)) * RAD;
  const head = [neck[0] + Math.sin(ht) * LEN.neck * facing, neck[1] - Math.cos(ht) * LEN.neck];
  const bElbow = dir(pose.bu, LEN.upper, shoulder);
  const bHand = dir(pose.bf, LEN.fore, bElbow);
  const fElbow = dir(pose.fu, LEN.upper, shoulder);
  const fHand = dir(pose.ff, LEN.fore, fElbow);
  const bKnee = dir(pose.bt, LEN.thigh, hip);
  const bFoot = dir(pose.bs, LEN.shin, bKnee);
  const fKnee = dir(pose.ft, LEN.thigh, hip);
  const fFoot = dir(pose.fs, LEN.shin, fKnee);
  const pts = { hip, neck, shoulder, head, bElbow, bHand, fElbow, fHand, bKnee, bFoot, fKnee, fFoot };

  const spin = (pose.spin ?? 0) * RAD * facing;
  if (spin) {
    const pivot = pose.spinPivot === 'center' ? [neck[0] / 2, neck[1] / 2] : hip;
    const cos = Math.cos(spin);
    const sin = Math.sin(spin);
    for (const k in pts) {
      const [x, y] = pts[k];
      const dx = x - pivot[0];
      const dy = y - pivot[1];
      pts[k] = [pivot[0] + dx * cos - dy * sin, pivot[1] + dx * sin + dy * cos];
    }
  }
  return pts;
}

// x, groundY: feet position on the floor; z: height above the floor.
export function drawFigure(ctx, pose, look, x, groundY, z, facing) {
  const p = solve(pose, facing);
  let lowest = -Infinity;
  for (const k in p) lowest = Math.max(lowest, p[k][1] + (k === 'head' ? HEAD : 2));
  const ox = Math.round(x);
  const oy = Math.round(groundY - z - lowest);
  for (const k in p) p[k] = [p[k][0] + ox, p[k][1] + oy];

  const backSkin = shade(look.skin, 0.8);
  const backPants = shade(look.pants, 0.75);
  const backSleeve = shade(look.sleeve, 0.75);

  // back arm and leg
  part(ctx, p.shoulder, p.bElbow, 5, backSleeve);
  part(ctx, p.bElbow, p.bHand, 4, backSkin);
  disc(ctx, p.bHand, 2, backSkin);
  part(ctx, p.hip, p.bKnee, 7, backPants);
  part(ctx, p.bKnee, p.bFoot, 6, backPants);
  seg(ctx, p.bFoot, [p.bFoot[0] + 4 * facing, p.bFoot[1]], 3, backSkin);

  // torso with sash
  part(ctx, p.hip, p.neck, 11, look.top);
  seg(ctx, [p.neck[0] + 2 * facing, p.neck[1] + 3], [p.hip[0] + 2 * facing, p.hip[1] - 5], 2, look.clothLight);
  seg(ctx, [p.hip[0] - 5, p.hip[1] - 2], [p.hip[0] + 5, p.hip[1] - 2], 4, look.sash);
  seg(ctx, [p.hip[0] - 4 * facing, p.hip[1]], [p.hip[0] - 8 * facing, p.hip[1] + 8], 3, look.sash);

  // front leg
  part(ctx, p.hip, p.fKnee, 7, look.pants);
  part(ctx, p.fKnee, p.fFoot, 6, look.pants);
  seg(ctx, p.fFoot, [p.fFoot[0] + 4 * facing, p.fFoot[1]], 3, look.skin);

  // head with udeng (batik headband)
  disc(ctx, p.head, HEAD + 1, OUTLINE);
  disc(ctx, p.head, HEAD, look.skin);
  const hx = Math.round(p.head[0]);
  const hy = Math.round(p.head[1]);
  drawHeadgear(ctx, look, hx, hy, facing);
  ctx.fillStyle = OUTLINE;
  ctx.fillRect(hx + 3 * facing, hy, 1, 2);

  // front arm last so strikes read clearly
  part(ctx, p.shoulder, p.fElbow, 5, look.sleeve);
  part(ctx, p.fElbow, p.fHand, 4, look.skin);
  disc(ctx, p.fHand, 2, look.skin);

  return p;
}

function drawHeadgear(ctx, look, hx, hy, facing) {
  ctx.fillStyle = look.hair;
  ctx.fillRect(hx - 6, hy - 7, 12, 3);
  ctx.fillRect(hx - 6 * facing - (facing > 0 ? 0 : 2), hy - 5, 3, 6);
  const back = facing > 0 ? hx - 11 : hx + 8;
  if (look.headgear === 'udeng') {
    ctx.fillStyle = look.udeng;
    ctx.fillRect(hx - 7, hy - 5, 15, 4);
    ctx.fillStyle = look.udengDots;
    for (let i = -5; i <= 5; i += 3) ctx.fillRect(hx + i, hy - 4, 1, 1);
    ctx.fillStyle = look.udeng;
    ctx.fillRect(back, hy - 4, 4, 2);
    ctx.fillRect(facing > 0 ? hx - 12 : hx + 10, hy - 2, 3, 2);
  } else if (look.headgear === 'bandana') {
    ctx.fillStyle = look.bandana;
    ctx.fillRect(hx - 7, hy - 8, 15, 5);
    ctx.fillRect(back, hy - 6, 4, 3);
    ctx.fillRect(facing > 0 ? hx - 13 : hx + 11, hy - 4, 3, 4);
    ctx.fillStyle = '#f6f2e4';
    ctx.fillRect(hx - 2, hy - 7, 1, 1);
    ctx.fillRect(hx + 3, hy - 6, 1, 1);
  }
}
