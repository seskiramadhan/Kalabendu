import { World, BIOME } from './world.js';
import { T } from './tiles.js';
import { makeNoise2D, fbm, mulberry32 } from './noise.js';

export const WORLD_W = 4200;
export const WORLD_H = 1200;
const SURFACE = 360;
const BLEND = 40;

// West to east. Sawit plantations take over the east side.
const PLAN = [
  [BIOME.PANTAI, 200],
  [BIOME.HUTAN, 420],
  [BIOME.KAMPUNG, 90],
  [BIOME.SAWAH, 160],
  [BIOME.BAMBU, 180],
  [BIOME.HUTAN, 380],
  [BIOME.GUNUNG, 360],
  [BIOME.HUTAN, 340],
  [BIOME.BAMBU, 160],
  [BIOME.SAWAH, 140],
  [BIOME.KAMPUNG, 90],
  [BIOME.HUTAN, 260],
  [BIOME.KAMPUNG, 80],
  [BIOME.SAWIT, 900],
  [BIOME.PANTAI, 200],
];

const KAMPUNG_NAMES = ['Sukamakmur', 'Wanasari', 'Tirtamulya', 'Karangjati', 'Sidomukti'];

export function generateWorld(seed = Date.now() >>> 0, w = WORLD_W, h = WORLD_H) {
  const world = new World(w, h, seed);
  const rand = mulberry32(seed);
  const n = {
    height: makeNoise2D(seed + 1),
    soil: makeNoise2D(seed + 2),
    cave: makeNoise2D(seed + 3),
    cavern: makeNoise2D(seed + 4),
    rock: makeNoise2D(seed + 5),
    seam: makeNoise2D(seed + 6),
  };

  const segments = layoutSegments(w, rand);
  shapeSurface(world, segments, n);
  fillTerrain(world, n);
  placeOres(world, rand);
  placeVegetation(world, segments, rand);
  const spawn = placeKampungs(world, segments, rand);
  placeSkyIslands(world, rand);
  return { world, spawn };
}

function layoutSegments(w, rand) {
  const widths = PLAN.map(([, width]) => width * (0.85 + rand() * 0.3));
  const total = widths.reduce((a, b) => a + b, 0);
  let x = 0;
  return PLAN.map(([biome], i) => {
    const x0 = Math.round(x);
    x += (widths[i] * w) / total;
    const x1 = i === PLAN.length - 1 ? w : Math.round(x);
    return { biome, x0, x1 };
  });
}

function biomeHeight(seg, x, n) {
  const hill = fbm(n.height, x / 160, 0.5, 3);
  switch (seg.biome) {
    case BIOME.PANTAI: {
      const edge = seg.x0 === 0 ? 1 - x / seg.x1 : (x - seg.x0) / (seg.x1 - seg.x0);
      return SURFACE + 18 + edge * 22 + hill * 3;
    }
    case BIOME.HUTAN:
      return SURFACE + hill * 24;
    case BIOME.BAMBU:
      return SURFACE + hill * 14;
    case BIOME.SAWAH: {
      const raw = SURFACE - 6 + hill * 24;
      return Math.round(raw / 2) * 2;
    }
    case BIOME.KAMPUNG:
      return SURFACE + 2;
    case BIOME.SAWIT:
      return SURFACE + 6 + hill * 6;
    case BIOME.GUNUNG: {
      const c = (seg.x0 + seg.x1) / 2;
      const hw = (seg.x1 - seg.x0) / 2;
      const t = Math.max(0, 1 - Math.abs(x - c) / hw);
      let lift = 130 * Math.pow(t, 1.25);
      const d = Math.abs(x - c);
      if (d < 14) lift -= (14 - d) * 0.9;
      return SURFACE + hill * 8 - lift;
    }
  }
  return SURFACE;
}

function shapeSurface(world, segments, n) {
  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i];
    for (let x = seg.x0; x < seg.x1; x++) {
      let hgt = biomeHeight(seg, x, n);
      const prev = segments[i - 1];
      const next = segments[i + 1];
      // Kampung and sawah keep their own shape so houses and terraces stay flat.
      const flat = seg.biome === BIOME.KAMPUNG;
      if (!flat && prev && x - seg.x0 < BLEND) {
        const k = 0.5 * (1 - (x - seg.x0) / BLEND);
        hgt = hgt * (1 - k) + biomeHeight(prev, x, n) * k;
      }
      if (!flat && next && seg.x1 - x < BLEND) {
        const k = 0.5 * (1 - (seg.x1 - x) / BLEND);
        hgt = hgt * (1 - k) + biomeHeight(next, x, n) * k;
      }
      world.surface[x] = Math.round(hgt);
      world.biome[x] = seg.biome;
    }
  }
  // Kampung edges: ramp neighbours into the flat ground.
  for (const seg of segments) {
    if (seg.biome !== BIOME.KAMPUNG) continue;
    const flatY = world.surface[seg.x0 + 5];
    for (let d = 0; d < BLEND; d++) {
      const k = d / BLEND;
      for (const x of [seg.x0 - BLEND + d, seg.x1 + BLEND - 1 - d]) {
        if (x < 0 || x >= world.w) continue;
        world.surface[x] = Math.round(world.surface[x] * (1 - k) + flatY * k);
      }
    }
  }
}

function fillTerrain(world, n) {
  const { w, h, tiles } = world;
  for (let x = 0; x < w; x++) {
    const s = world.surface[x];
    const biome = world.biome[x];
    const soilDepth = 5 + Math.round((n.soil(x / 30, 0.3) + 1) * 3);
    const clayDepth = soilDepth + 10 + Math.round((n.soil(x / 50, 7.7) + 1) * 5);
    const peakLift = SURFACE - s;

    for (let y = Math.max(0, s); y < h; y++) {
      const depth = y - s;
      let id;
      if (biome === BIOME.PANTAI && depth < 10) id = T.PASIR;
      else if (biome === BIOME.GUNUNG && peakLift > 55 && depth < 12) id = T.BATU_VULKANIK;
      else if (biome === BIOME.SAWAH && depth === 0) id = T.LUMPUR;
      else if (biome === BIOME.SAWIT && depth === 0) id = T.TANAH;
      else if (depth === 0) id = T.RUMPUT;
      else if (depth < soilDepth) id = T.TANAH;
      else if (depth < clayDepth) id = T.TANAH_LIAT;
      else id = rockAt(x, y, n);

      if (depth > 12 && isCave(x, y, n)) id = y > 1125 ? T.MAGMA : T.AIR;
      if (y > 1160 + n.rock(x / 40, 3.1) * 15) id = T.MAGMA;
      tiles[y * w + x] = id;
    }
  }
}

function rockAt(x, y, n) {
  if (y > 930 + n.rock(x / 60, 1.7) * 40) return T.BATU_VULKANIK;
  if (y < 820 && n.rock(x / 90, y / 55) > 0.4) return T.BATU_KAPUR;
  if (y > 470 && y < 900 && Math.abs(n.seam(x / 70, y / 9)) < 0.045) return T.BATU_BARA;
  return T.BATU;
}

function isCave(x, y, n) {
  const tunnel = Math.abs(fbm(n.cave, x / 55, y / 32, 3));
  if (tunnel < 0.045) return true;
  const deepBoost = Math.min(1, (y - SURFACE) / 500) * 0.1;
  return fbm(n.cavern, x / 110, y / 70, 3) > 0.42 - deepBoost;
}

const REPLACEABLE = new Set([T.BATU, T.BATU_KAPUR, T.TANAH_LIAT, T.BATU_VULKANIK]);

function placeOres(world, rand) {
  const { w, h } = world;
  const veins = Math.round((w * h) / 800);
  for (let i = 0; i < veins; i++) {
    let x = Math.floor(rand() * w);
    let y = SURFACE + 20 + Math.floor(rand() * (h - SURFACE - 40));
    const ore = oreForDepth(y, world.biome[x], rand);
    const steps = 4 + Math.floor(rand() * 8);
    for (let s = 0; s < steps; s++) {
      for (let dy = 0; dy < 2; dy++)
        for (let dx = 0; dx < 2; dx++) {
          if (REPLACEABLE.has(world.get(x + dx, y + dy))) world.tiles[(y + dy) * w + x + dx] = ore;
        }
      x += Math.floor(rand() * 3) - 1;
      y += Math.floor(rand() * 3) - 1;
      if (x < 0 || x >= w - 1 || y < 0 || y >= h - 1) break;
    }
  }
}

function oreForDepth(y, biome, rand) {
  const r = rand();
  if (biome === BIOME.GUNUNG && y < 700 && r < 0.4) return T.BELERANG;
  if (y < 520) return r < 0.8 ? T.TEMBAGA : T.PERAK;
  if (y < 760) return r < 0.4 ? T.TEMBAGA : r < 0.8 ? T.PERAK : T.EMAS;
  if (y < 960) return r < 0.4 ? T.PERAK : r < 0.8 ? T.EMAS : T.BELERANG;
  return r < 0.45 ? T.EMAS : T.BELERANG;
}

function placeVegetation(world, segments, rand) {
  for (const seg of segments) {
    let x = seg.x0 + 3;
    while (x < seg.x1 - 3) {
      const s = world.surface[x];
      const ground = world.get(x, s);
      switch (seg.biome) {
        case BIOME.HUTAN:
          if (ground === T.RUMPUT) growJati(world, x, s - 1, rand);
          x += 4 + Math.floor(rand() * 5);
          break;
        case BIOME.BAMBU:
          if (ground === T.RUMPUT) growBambu(world, x, s - 1, rand);
          x += rand() < 0.75 ? 2 : 5;
          break;
        case BIOME.PANTAI:
          if (ground === T.PASIR && rand() < 0.5) growKelapa(world, x, s - 1, rand);
          x += 9 + Math.floor(rand() * 10);
          break;
        case BIOME.SAWAH:
          if (ground === T.LUMPUR && world.get(x, s - 1) === T.AIR) world.set(x, s - 1, T.PADI);
          x += 1;
          break;
        case BIOME.SAWIT:
          // identical rows, the same spacing, the same height
          if (ground === T.TANAH) growSawit(world, x, s - 1);
          x += 5;
          break;
        case BIOME.GUNUNG:
          if (ground === T.RUMPUT && rand() < 0.5) growJati(world, x, s - 1, rand);
          x += 7 + Math.floor(rand() * 8);
          break;
        default:
          x += 1;
      }
    }
  }
}

export function growJati(world, x, y, rand) {
  const height = 5 + Math.floor(rand() * 5);
  for (let i = 0; i < height; i++) {
    if (world.get(x, y - i) !== T.AIR) return;
    world.set(x, y - i, T.BATANG_JATI);
  }
  const top = y - height;
  const rx = 3 + Math.floor(rand() * 2);
  const ry = 2 + Math.floor(rand() * 2);
  for (let dy = -ry; dy <= ry; dy++)
    for (let dx = -rx; dx <= rx; dx++) {
      const d = (dx * dx) / (rx * rx + 0.6) + (dy * dy) / (ry * ry + 0.6);
      if (d > 1) continue;
      if (world.get(x + dx, top + dy) === T.AIR) world.set(x + dx, top + dy, T.DAUN_HUTAN);
    }
}

function growBambu(world, x, y, rand) {
  const height = 6 + Math.floor(rand() * 8);
  for (let i = 0; i < height; i++) {
    if (world.get(x, y - i) !== T.AIR) return;
    world.set(x, y - i, T.BATANG_BAMBU);
  }
  if (world.get(x - 1, y - height + 1) === T.AIR) world.set(x - 1, y - height + 1, T.DAUN_HUTAN);
}

function growKelapa(world, x, y, rand) {
  const height = 6 + Math.floor(rand() * 5);
  for (let i = 0; i < height; i++) {
    if (world.get(x, y - i) !== T.AIR) return;
    world.set(x, y - i, T.BATANG_KELAPA);
  }
  const top = y - height;
  const crown = [[0, 0], [-1, 0], [1, 0], [-2, 0], [2, 0], [-3, 1], [3, 1], [0, -1], [-1, -1], [1, -1]];
  for (const [dx, dy] of crown) if (world.get(x + dx, top + dy) === T.AIR) world.set(x + dx, top + dy, T.DAUN_KELAPA);
}

export function growSawit(world, x, y) {
  for (let i = 0; i < 3; i++) if (world.get(x, y - i) !== T.AIR) return;
  world.set(x, y, T.BATANG_SAWIT);
  world.set(x, y - 1, T.BATANG_SAWIT);
  world.set(x, y - 2, T.POHON_SAWIT);
  for (const [dx, dy] of [[-1, -2], [1, -2], [0, -3], [-1, -3], [1, -3]])
    if (world.get(x + dx, y + dy) === T.AIR) world.set(x + dx, y + dy, T.DAUN_SAWIT);
}

function clearAbove(world, x0, x1, groundY, height) {
  for (let x = x0; x < x1; x++)
    for (let y = groundY - height; y < groundY; y++) world.set(x, y, T.AIR);
}

function placeKampungs(world, segments, rand) {
  let spawn = null;
  let k = 0;
  for (const seg of segments) {
    if (seg.biome !== BIOME.KAMPUNG) continue;
    const ground = world.surface[seg.x0 + 5];
    for (let x = seg.x0; x < seg.x1; x++) {
      world.surface[x] = ground;
      for (let y = ground; y < ground + 6; y++) world.set(x, y, y === ground ? T.RUMPUT : T.TANAH);
    }
    clearAbove(world, seg.x0, seg.x1, ground, 30);

    const houses = [];
    let x = seg.x0 + 10;
    while (x < seg.x1 - 16) {
      const width = 7 + Math.floor(rand() * 3);
      buildRumahPanggung(world, x, ground, width);
      houses.push({ x0: x, x1: x + width });
      x += width + 6 + Math.floor(rand() * 5);
    }
    world.kampungs.push({
      id: k,
      name: KAMPUNG_NAMES[k % KAMPUNG_NAMES.length],
      x0: seg.x0,
      x1: seg.x1,
      ground,
      houses,
      nearSawit: segments[segments.indexOf(seg) + 1]?.biome === BIOME.SAWIT,
    });
    if (!spawn) spawn = { x: seg.x0 + 4, y: ground };
    k++;
  }
  return spawn ?? { x: 50, y: world.surface[50] };
}

// Stilt house: open stilts, teak floor, woven walls, terracotta roof, door on the left.
function buildRumahPanggung(world, x0, ground, width) {
  const x1 = x0 + width - 1;
  const floor = ground - 3;
  for (const sx of [x0 + 1, x1 - 1]) {
    world.set(sx, ground - 1, T.BATANG_JATI);
    world.set(sx, ground - 2, T.BATANG_JATI);
  }
  for (let x = x0; x <= x1; x++) world.set(x, floor, T.KAYU_JATI);
  const wallTop = floor - 4;
  for (let y = wallTop; y < floor; y++) {
    for (let x = x0 + 1; x < x1; x++) world.set(x, y, T.DINDING_ANYAMAN);
    world.set(x1, y, T.KAYU_JATI);
  }
  world.set(x0, wallTop, T.KAYU_JATI);
  for (let r = 0; r < 4; r++) {
    for (let x = x0 - 1 + r; x <= x1 + 1 - r; x++) world.set(x, wallTop - 1 - r, T.GENTENG);
  }
  world.set(x0 - 2, ground - 1, T.KAYU_JATI);
  world.set(x0 - 1, ground - 2, T.KAYU_JATI);
  world.set(x0 - 1, ground - 1, T.KAYU_JATI);
}

function placeSkyIslands(world, rand) {
  const count = 14;
  for (let i = 0; i < count; i++) {
    const cx = 150 + Math.floor(((i + rand() * 0.8) / count) * (world.w - 300));
    const cy = 90 + Math.floor(rand() * 150);
    const half = 9 + Math.floor(rand() * 10);
    const thick = 5 + Math.floor(rand() * 7);
    for (let dx = -half; dx <= half; dx++) {
      const k = 1 - (dx / half) ** 2;
      const bottom = Math.round(thick * k + rand());
      for (let dy = 0; dy <= bottom; dy++) {
        const id = dy === 0 ? T.RUMPUT : dy < 3 ? T.TANAH : T.BATU;
        world.set(cx + dx, cy + dy, id);
      }
    }
    if (i % 2 === 0) buildCandiRuin(world, cx, cy, rand);
    else growJati(world, cx + Math.floor(rand() * 6) - 3, cy - 1, rand);
  }
}

// A small stepped candi, weathered: some stones are missing.
function buildCandiRuin(world, cx, groundY, rand) {
  const steps = [[4, 2], [3, 2], [2, 2], [1, 1], [0, 1]];
  let y = groundY - 1;
  for (const [half, rows] of steps) {
    for (let r = 0; r < rows; r++, y--) {
      for (let dx = -half; dx <= half; dx++) {
        if (rand() < 0.12) continue;
        world.set(cx + dx, y, T.BATU_CANDI);
      }
    }
  }
}
