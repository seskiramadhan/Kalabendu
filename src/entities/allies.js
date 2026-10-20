// Fighters who join the hero for a fight (team hero, kind 'ally').
const ALLY_BASE = { walkX: 80, walkY: 50, light: ['preman_l1'], ai: 'ally', reach: 36, ally: true };

export const ALLIES = {
  buruh: {
    ...ALLY_BASE,
    id: 'buruh',
    nameKey: 'ally_buruh',
    maxHp: 50,
    look: { skin: '#a8744a', top: '#3a5a8a', pants: '#2a3a5a', sleeve: '#3a5a8a', clothLight: '#5a7aaa', sash: '#e0b252', headgear: 'helmet', helmet: '#e6e0cc', hair: '#1a1210' },
  },
  mahasiswa: {
    ...ALLY_BASE,
    id: 'mahasiswa',
    nameKey: 'ally_mahasiswa',
    maxHp: 45,
    look: { skin: '#b07a4f', top: '#e0b252', pants: '#2a2a3a', sleeve: '#e0b252', clothLight: '#f2d27a', sash: '#2a2a3a', headgear: 'bandana', bandana: '#f6f2e4', hair: '#1a1210' },
  },
  ojol: {
    ...ALLY_BASE,
    id: 'ojol',
    nameKey: 'ally_ojol',
    maxHp: 55,
    walkX: 95,
    look: { skin: '#9a6a44', top: '#e86a1a', pants: '#2a2a2a', sleeve: '#e86a1a', clothLight: '#f2a060', sash: '#2a2a2a', headgear: 'helmet', helmet: '#2a2a2a', hair: '#1a1210' },
  },
};
