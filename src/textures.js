import { T, TILE_COUNT } from './tiles.js';

const S = 16;
export const VARIANTS = 4;

// Uniform sawit rows on purpose: every oil palm looks the same.
const UNIFORM = new Set([T.POHON_SAWIT, T.BATANG_SAWIT, T.DAUN_SAWIT]);

function rng(seed) {
  let s = seed >>> 0 || 1;
  return () => {
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    return (s >>> 0) / 4294967296;
  };
}

function painter(img, r) {
  const px = (x, y, c) => {
    if (x < 0 || y < 0 || x >= S || y >= S) return;
    const i = (y * S + x) * 4;
    img.data[i] = c[0];
    img.data[i + 1] = c[1];
    img.data[i + 2] = c[2];
    img.data[i + 3] = c[3] ?? 255;
  };
  const pick = (cols) => cols[Math.floor(r() * cols.length)];
  const fill = (cols, weights) => {
    for (let y = 0; y < S; y++)
      for (let x = 0; x < S; x++) px(x, y, weights ? weighted(cols, weights, r()) : pick(cols));
  };
  const blob = (cx, cy, rad, cols) => {
    for (let y = -rad; y <= rad; y++)
      for (let x = -rad; x <= rad; x++)
        if (x * x + y * y <= rad * rad + r() * 2) px(cx + x, cy + y, pick(cols));
  };
  return { px, pick, fill, blob };
}

function weighted(cols, weights, v) {
  let acc = 0;
  const total = weights.reduce((a, b) => a + b, 0);
  for (let i = 0; i < cols.length; i++) {
    acc += weights[i] / total;
    if (v <= acc) return cols[i];
  }
  return cols[cols.length - 1];
}

const hex = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
const C = (...hs) => hs.map(hex);

const PAL = {
  tanah: C('#7a4a2a', '#6b3f23', '#83522f'),
  batu: C('#615e5b', '#56534f', '#6b6865'),
  liat: C('#a5492b', '#984226', '#ae5433'),
  pasir: C('#e3ca90', '#d6bb7e', '#ecd6a3'),
  lumpur: C('#5b4632', '#523f2d', '#634d37'),
};

function stoneBase(p, r) {
  p.fill(PAL.batu, [5, 3, 2]);
  for (let i = 0; i < 3; i++) {
    let x = Math.floor(r() * S);
    let y = Math.floor(r() * S);
    for (let k = 0; k < 5; k++) {
      p.px(x, y, hex('#46433f'));
      x += r() < 0.5 ? 1 : 0;
      y += r() < 0.5 ? 1 : -1;
    }
  }
}

function ore(p, r, cols) {
  stoneBase(p, r);
  const n = 3 + Math.floor(r() * 2);
  for (let i = 0; i < n; i++) p.blob(2 + Math.floor(r() * 12), 2 + Math.floor(r() * 12), 1, cols);
}

const PAINT = {
  [T.TANAH](p, r) {
    p.fill(PAL.tanah, [5, 3, 2]);
    for (let i = 0; i < 2; i++) p.px(Math.floor(r() * S), Math.floor(r() * S), hex('#9b7b5a'));
  },
  [T.RUMPUT](p, r) {
    PAINT[T.TANAH](p, r);
    const greens = C('#4f9a3a', '#5aa842', '#468a33');
    for (let x = 0; x < S; x++) {
      const depth = 3 + Math.floor(r() * 3);
      for (let y = 0; y < depth; y++) p.px(x, y, p.pick(greens));
      p.px(x, 0, hex('#6cbf4a'));
    }
  },
  [T.BATU]: stoneBase,
  [T.TANAH_LIAT](p, r) {
    p.fill(PAL.liat, [5, 3, 2]);
    for (let y = 3; y < S; y += 5) for (let x = 0; x < S; x++) if (r() < 0.7) p.px(x, y, hex('#8a3b22'));
  },
  [T.PASIR](p) {
    p.fill(PAL.pasir, [6, 3, 2]);
  },
  [T.KAYU_JATI](p, r) {
    const base = C('#8a5a2b', '#83552a', '#915f2e');
    p.fill(base, [5, 3, 2]);
    for (let y = 0; y < S; y++) {
      if (y % 8 === 7) for (let x = 0; x < S; x++) p.px(x, y, hex('#5e3b1a'));
      else if (r() < 0.35) for (let x = 0; x < S; x++) if (r() < 0.6) p.px(x, y, hex('#7a4e24'));
    }
  },
  [T.BAMBU](p, r) {
    for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) p.px(x, y, hex('#3d4a1f'));
    for (const x0 of [0, 5, 11]) {
      const w = x0 === 11 ? 5 : 4;
      for (let y = 0; y < S; y++)
        for (let x = x0; x < x0 + w; x++) p.px(x, y, x === x0 ? hex('#c7cf6a') : r() < 0.8 ? hex('#a3b34a') : hex('#95a443'));
      const node = (x0 * 3) % 7 + 2;
      for (let x = x0; x < x0 + w; x++) {
        p.px(x, node, hex('#6d7a2c'));
        p.px(x, node + 8, hex('#6d7a2c'));
      }
    }
  },
  [T.DAUN_KELAPA](p, r) {
    const greens = C('#3f8a3a', '#357a31', '#4a9a42', '#2f6b2b');
    for (let y = 0; y < S; y++)
      for (let x = 0; x < S; x++) {
        const stripe = (x + y) % 4 === 0;
        if (stripe || r() < 0.78) p.px(x, y, stripe ? hex('#5fae4f') : p.pick(greens));
      }
  },
  [T.BATA_MERAH](p, r) {
    const bricks = C('#a4452a', '#9a3f26', '#ad4e31');
    const mortar = hex('#d9b48f');
    for (let y = 0; y < S; y++) {
      const row = Math.floor(y / 4);
      const off = row % 2 ? 4 : 0;
      for (let x = 0; x < S; x++) {
        const isMortar = y % 4 === 3 || (x + off) % 8 === 7;
        p.px(x, y, isMortar ? mortar : p.pick(bricks));
      }
    }
    // faint batik dot in the middle of some bricks
    if (r() < 0.5) p.px(2, 1, hex('#c0603f'));
  },
  [T.EMAS]: (p, r) => ore(p, r, C('#f2c94c', '#d4a017', '#ffe07a')),
  [T.PERAK]: (p, r) => ore(p, r, C('#d7dde2', '#a9b3ba', '#f4f7f9')),
  [T.TEMBAGA]: (p, r) => ore(p, r, C('#c87533', '#e08d4f', '#a85f26')),
  [T.BATU_BARA]: (p, r) => ore(p, r, C('#1e1e1e', '#2e2e2e', '#141414')),
  [T.BELERANG]: (p, r) => ore(p, r, C('#e8e04a', '#c9c12f', '#f5ee7a')),
  [T.POHON_SAWIT](p) {
    const trunk = hex('#6b5a3a');
    const scar = hex('#544629');
    for (let y = 6; y < S; y++)
      for (let x = 6; x < 10; x++) p.px(x, y, (x + y) % 3 === 0 ? scar : trunk);
    const frond = hex('#6f7f3a');
    const frondDark = hex('#5c6a30');
    const arms = [[-1, 0], [1, 0], [-1, -1], [1, -1], [0, -1]];
    for (const [dx, dy] of arms)
      for (let k = 0; k < 7; k++) {
        const x = 8 + dx * k;
        const y = 5 + dy * Math.floor(k * 0.6) + (dx !== 0 ? Math.floor(k * k / 14) : -k + 2);
        p.px(x, y, k % 2 ? frond : frondDark);
        p.px(x, y + 1, frondDark);
      }
  },
  [T.TUNGGUL](p) {
    for (let y = 9; y < S; y++)
      for (let x = 3; x < 13; x++) p.px(x, y, (x === 3 || x === 12) ? hex('#5e3b1a') : hex('#7a4e24'));
    for (let x = 3; x < 13; x++) p.px(x, 9, hex('#c49a6c'));
    for (let x = 5; x < 11; x++) p.px(x, 10, hex('#a57c50'));
    p.px(7, 10, hex('#c49a6c'));
    p.px(8, 10, hex('#c49a6c'));
    p.px(2, 15, hex('#5e3b1a'));
    p.px(13, 15, hex('#5e3b1a'));
  },
  [T.LUMPUR](p, r) {
    p.fill(PAL.lumpur, [5, 3, 2]);
    for (let i = 0; i < 3; i++) {
      const x = Math.floor(r() * 13);
      const y = Math.floor(r() * S);
      p.px(x, y, hex('#7a654b'));
      p.px(x + 1, y, hex('#7a654b'));
    }
  },
  [T.BIBIT](p) {
    for (let x = 4; x < 12; x++) p.px(x, 15, hex('#6b3f23'));
    for (let x = 5; x < 11; x++) p.px(x, 14, hex('#7a4a2a'));
    for (let y = 8; y < 14; y++) p.px(8, y, hex('#4f8a2e'));
    const leaf = hex('#7ccf4f');
    const leafDark = hex('#5aa842');
    [[6, 8], [5, 7], [4, 7], [7, 9]].forEach(([x, y]) => p.px(x, y, leaf));
    [[9, 7], [10, 6], [11, 6], [9, 8]].forEach(([x, y]) => p.px(x, y, leafDark));
    p.px(8, 7, leaf);
  },
  [T.BATU_CANDI](p, r) {
    const base = C('#6e6a66', '#67635f', '#73706b');
    p.fill(base, [5, 3, 2]);
    // kawung motif: four petals around a centre
    const light = hex('#827e79');
    const dark = hex('#4f4c48');
    for (let y = 0; y < S; y++)
      for (let x = 0; x < S; x++) {
        for (const [cx, cy] of [[4, 4], [11, 4], [4, 11], [11, 11]]) {
          const d = (x - cx) ** 2 * 1.4 + (y - cy) ** 2 * 0.7;
          const d2 = (x - cx) ** 2 * 0.7 + (y - cy) ** 2 * 1.4;
          if ((cx + cy) % 2 ? d2 < 7 : d < 7) p.px(x, y, light);
        }
      }
    p.px(7, 7, dark);
    p.px(8, 8, dark);
    p.px(7, 8, dark);
    p.px(8, 7, dark);
    for (let i = 0; i < S; i++) {
      p.px(i, 0, dark);
      p.px(0, i, dark);
    }
    if (r() < 0.3) p.px(13, 2, dark);
  },
  [T.BATANG_JATI](p, r) {
    const bark = C('#6e4724', '#5e3b1a', '#7a5029');
    for (let y = 0; y < S; y++)
      for (let x = 4; x < 12; x++) p.px(x, y, x === 4 || x === 11 ? hex('#4a2e14') : p.pick(bark));
    for (let i = 0; i < 3; i++) {
      const x = 5 + Math.floor(r() * 6);
      const y = Math.floor(r() * 13);
      p.px(x, y, hex('#4a2e14'));
      p.px(x, y + 1, hex('#4a2e14'));
    }
  },
  [T.DAUN_HUTAN](p, r) {
    // a mix of greens and the odd flower: diverse natural forest
    const greens = C('#2f7a2c', '#3c8f34', '#25662a', '#4aa03c', '#1f5a26');
    for (let y = 0; y < S; y++)
      for (let x = 0; x < S; x++) if (r() < 0.97) p.px(x, y, p.pick(greens));
    if (r() < 0.35) p.px(2 + Math.floor(r() * 12), 2 + Math.floor(r() * 12), hex('#e86a5a'));
    if (r() < 0.25) p.px(2 + Math.floor(r() * 12), 2 + Math.floor(r() * 12), hex('#f2d55c'));
  },
  [T.BATANG_KELAPA](p) {
    for (let y = 0; y < S; y++) {
      const ring = y % 4 === 0;
      for (let x = 6; x < 10; x++) p.px(x, y, ring ? hex('#6b5638') : x === 6 ? hex('#a8875a') : hex('#8f7149'));
    }
  },
  [T.BATANG_BAMBU](p) {
    for (let y = 0; y < S; y++)
      for (let x = 6; x < 10; x++) {
        const node = y === 5 || y === 13;
        p.px(x, y, node ? hex('#6d7a2c') : x === 6 ? hex('#c7cf6a') : hex('#9fb048'));
      }
    p.px(10, 5, hex('#7d9a36'));
    p.px(11, 4, hex('#7d9a36'));
    p.px(5, 13, hex('#7d9a36'));
    p.px(4, 12, hex('#7d9a36'));
  },
  [T.PADI](p, r) {
    const stalk = C('#8fb34a', '#a6c35a', '#7a9e3c');
    for (let i = 0; i < 5; i++) {
      const x = 1 + i * 3 + Math.floor(r() * 2);
      const top = 3 + Math.floor(r() * 4);
      for (let y = top; y < S; y++) p.px(x, y, p.pick(stalk));
      p.px(x + 1, top, hex('#e3c25a'));
      p.px(x + 1, top + 1, hex('#d4ad45'));
    }
  },
  [T.BATU_VULKANIK](p, r) {
    p.fill(C('#2a2624', '#231f1d', '#332e2b'), [5, 3, 2]);
    for (let i = 0; i < 3; i++) p.px(Math.floor(r() * S), Math.floor(r() * S), hex('#5a3a2a'));
  },
  [T.MAGMA](p, r) {
    p.fill(C('#e8571e', '#f07a26', '#d1401a'), [4, 3, 2]);
    for (let i = 0; i < 6; i++) p.px(Math.floor(r() * S), Math.floor(r() * S), hex('#ffd25a'));
  },
  [T.BATU_KAPUR](p, r) {
    p.fill(C('#cfc6b0', '#c4baa2', '#d8d0bc'), [5, 3, 2]);
    for (let i = 0; i < 2; i++) p.blob(2 + Math.floor(r() * 12), 2 + Math.floor(r() * 12), 1, C('#b8ad93'));
  },
  [T.DINDING_ANYAMAN](p) {
    // woven bamboo wall, dark so it reads as a backdrop
    for (let y = 0; y < S; y++)
      for (let x = 0; x < S; x++) {
        const over = (Math.floor(x / 4) + Math.floor(y / 4)) % 2 === 0;
        const edge = over ? y % 4 === 0 : x % 4 === 0;
        p.px(x, y, edge ? hex('#4d3a22') : over ? hex('#7d6440') : hex('#6c5536'));
      }
  },
  [T.GENTENG](p) {
    for (let y = 0; y < S; y++)
      for (let x = 0; x < S; x++) {
        const row = Math.floor(y / 4);
        const lx = (x + (row % 2) * 2) % 4;
        const shade = y % 4 === 3 ? hex('#6e2a17') : lx === 0 ? hex('#8c3a20') : hex('#b5532e');
        p.px(x, y, shade);
      }
  },
  [T.DAUN_SAWIT](p) {
    // one dull green, no flowers: monoculture
    const leaf = hex('#6f7f3a');
    const rib = hex('#5c6a30');
    for (let k = 0; k < 3; k++) {
      for (let x = 0; x < S; x++) {
        const d = Math.abs(x - 7.5);
        const y = Math.round(2 + k * 4 + (d * d) / 12);
        if (y >= S) continue;
        p.px(x, y, rib);
        if (x % 2 === 0) {
          p.px(x, y + 1, leaf);
          p.px(x, y + 2, leaf);
        }
      }
    }
  },
  [T.BATANG_SAWIT](p) {
    for (let y = 0; y < S; y++)
      for (let x = 5; x < 11; x++) p.px(x, y, (x + y) % 3 === 0 ? hex('#544629') : hex('#6b5a3a'));
  },
};

export function buildAtlas() {
  const atlas = document.createElement('canvas');
  atlas.width = S * VARIANTS;
  atlas.height = S * TILE_COUNT;
  const ctx = atlas.getContext('2d');
  for (let id = 1; id < TILE_COUNT; id++) {
    const paint = PAINT[id];
    if (!paint) continue;
    for (let v = 0; v < VARIANTS; v++) {
      const img = ctx.createImageData(S, S);
      const r = rng((id * 7919 + (UNIFORM.has(id) ? 0 : v) * 104729) ^ 0x9e3779b9);
      paint(painter(img, r), r);
      ctx.putImageData(img, v * S, id * S);
    }
  }
  return atlas;
}

export function variantAt(x, y) {
  let h = (x * 374761393 + y * 668265263) | 0;
  h = (h ^ (h >>> 13)) * 1274126177;
  return ((h ^ (h >>> 16)) >>> 0) % VARIANTS;
}

export function iconDataURL(atlas, id, size = 32) {
  const c = document.createElement('canvas');
  c.width = size;
  c.height = size;
  const ctx = c.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(atlas, 0, id * S, S, S, 0, 0, size, size);
  return c.toDataURL();
}
