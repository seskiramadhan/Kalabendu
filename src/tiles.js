export const T = {
  AIR: 0,
  RUMPUT: 1,
  TANAH: 2,
  BATU: 3,
  TANAH_LIAT: 4,
  PASIR: 5,
  KAYU_JATI: 6,
  BAMBU: 7,
  DAUN_KELAPA: 8,
  BATA_MERAH: 9,
  EMAS: 10,
  PERAK: 11,
  TEMBAGA: 12,
  BATU_BARA: 13,
  BELERANG: 14,
  POHON_SAWIT: 15,
  TUNGGUL: 16,
  LUMPUR: 17,
  BIBIT: 18,
  BATU_CANDI: 19,
};

// hardness = seconds to mine by hand; drop = item id given when mined.
// needsGround = plant-like tiles that pop when the block under them is removed.
const DEFS = [
  [T.AIR, 'air', { solid: false, hardness: 0, drop: 0 }],
  [T.RUMPUT, 'rumput', { hardness: 0.4, drop: T.TANAH }],
  [T.TANAH, 'tanah', { hardness: 0.35 }],
  [T.BATU, 'batu_andesit', { hardness: 1.0 }],
  [T.TANAH_LIAT, 'tanah_liat', { hardness: 0.5 }],
  [T.PASIR, 'pasir', { hardness: 0.3 }],
  [T.KAYU_JATI, 'kayu_jati', { hardness: 0.6 }],
  [T.BAMBU, 'bambu', { hardness: 0.4 }],
  [T.DAUN_KELAPA, 'daun_kelapa', { solid: false, hardness: 0.15 }],
  [T.BATA_MERAH, 'bata_merah', { hardness: 0.9 }],
  [T.EMAS, 'emas', { hardness: 1.6 }],
  [T.PERAK, 'perak', { hardness: 1.4 }],
  [T.TEMBAGA, 'tembaga', { hardness: 1.2 }],
  [T.BATU_BARA, 'batu_bara', { hardness: 1.1 }],
  [T.BELERANG, 'belerang', { hardness: 1.0 }],
  [T.POHON_SAWIT, 'pohon_sawit', { solid: false, hardness: 0.7, needsGround: true }],
  [T.TUNGGUL, 'tunggul', { solid: false, hardness: 0.5, drop: T.KAYU_JATI, needsGround: true }],
  [T.LUMPUR, 'lumpur', { hardness: 0.3 }],
  [T.BIBIT, 'bibit', { solid: false, hardness: 0.1, needsGround: true }],
  [T.BATU_CANDI, 'batu_candi', { hardness: 1.2 }],
];

export const TILE_COUNT = DEFS.length;
export const TILES = [];
for (const [id, key, opts] of DEFS) {
  TILES[id] = {
    id,
    key,
    solid: opts.solid ?? true,
    hardness: opts.hardness,
    drop: opts.drop ?? id,
    needsGround: !!opts.needsGround,
  };
}

export const SOLID = new Uint8Array(256);
for (const def of TILES) if (def.solid) SOLID[def.id] = 1;

export function isFertile(id) {
  return id === T.TANAH || id === T.RUMPUT || id === T.LUMPUR;
}
