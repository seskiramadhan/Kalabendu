// Weapons swap a fighter's light chain while held. Each hit costs one point
// of durability; heavy throws the weapon as a projectile.
export const WEAPONS = {
  bambu_runcing: {
    nameKey: 'item_bambu', light: ['bambu_l1', 'bambu_l2'], durability: 10, throwMove: 'throw_bambu',
    draw: 'pole', len: 34, color: '#c7b36a', tip: '#ece0a0',
  },
  kursi_plastik: {
    nameKey: 'item_kursi', light: ['kursi_l1'], durability: 4, throwMove: 'throw_kursi',
    draw: 'chair', color: '#d8433a',
  },
  ember: {
    nameKey: 'item_ember', light: ['ember_l1', 'ember_l2'], durability: 6, throwMove: 'throw_ember',
    draw: 'bucket', color: '#3a7ad8',
  },
  golok: {
    nameKey: 'item_golok', light: ['golok_l1', 'golok_l2', 'golok_l3'], durability: 12, throwMove: 'throw_golok',
    draw: 'blade', len: 18, color: '#c9ced4', handle: '#5e3b1a',
  },
  // Enemy-only tools: never dropped (fixed: true).
  obor: { light: ['obor_l1'], durability: 999, fixed: true, draw: 'torch', len: 20, color: '#7a4e24' },
  gergaji: { light: ['gergaji_l1'], durability: 999, fixed: true, draw: 'saw', color: '#e0a020' },
  karung_uang: { light: [], durability: 1, fixed: true, throwMove: 'raja_bag_hit', draw: 'bag', color: '#c8a050' },
  pentungan: { light: ['pentungan_l1', 'pentungan_l2'], durability: 999, fixed: true, draw: 'pole', len: 18, color: '#2a2a2a', tip: '#4a4a4a' },
  map_kertas: { light: ['cambuk_l1'], durability: 999, fixed: true, draw: 'whip', color: '#f6f2e4' },
  karung_beras: { light: ['preman_l1'], durability: 999, fixed: true, draw: 'sack', color: '#e6dcc0' },
  tongkat: {
    nameKey: 'item_tongkat', light: ['tongkat_l1', 'tongkat_l2'], durability: 8, throwMove: 'throw_bambu',
    draw: 'pole', len: 26, color: '#7a4e24', tip: '#8f5e30',
  },
};
