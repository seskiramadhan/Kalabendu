// Enemy types as data. `ai` picks the brain in src/ai.
export const ENEMIES = {
  preman: {
    id: 'preman',
    nameKey: 'enemy_preman',
    maxHp: 36,
    walkX: 62,
    walkY: 40,
    light: ['preman_l1'],
    heavy: 'preman_heavy',
    ai: 'brawler',
    reach: 36,
    look: {
      skin: '#9a6a44',
      top: '#e6e0cc',
      pants: '#34405e',
      sleeve: '#9a6a44',
      clothLight: '#f6f2e4',
      sash: '#2a2420',
      headgear: 'bandana',
      bandana: '#b8302a',
      hair: '#1a1210',
    },
  },
};
