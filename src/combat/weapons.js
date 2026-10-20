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
  tongkat: {
    nameKey: 'item_tongkat', light: ['tongkat_l1', 'tongkat_l2'], durability: 8, throwMove: 'throw_bambu',
    draw: 'pole', len: 26, color: '#7a4e24', tip: '#8f5e30',
  },
};
