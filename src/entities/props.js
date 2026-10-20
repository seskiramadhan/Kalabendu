let nextUid = 2_000_000;

// Breakables. drops: item types spilled when broken.
export const PROPS = {
  drum: { hp: 12, w: 22, h: 30, drops: ['koin', 'koin'], debris: ['#2f6db0', '#1e4a80'] },
  kardus: { hp: 6, w: 22, h: 18, drops: ['es_teh'], debris: ['#b8925a', '#8a6a3a'] },
  gerobak: { hp: 26, w: 60, h: 46, drops: ['nasi_bungkus', 'koin', 'koin', 'koin'], debris: ['#c8322a', '#8a5a2b', '#e6e0cc'] },
};

export function createProp(type, x, y, drops) {
  const def = PROPS[type];
  return {
    uid: nextUid++,
    kind: 'prop',
    team: 'prop',
    type,
    def,
    drops: drops ?? def.drops,
    x,
    y,
    z: 0,
    hp: def.hp,
    lastHitAt: -10,
    invuln: 0,
    state: 'idle',
    remove: false,
  };
}
