// Stage 3 — Pasar Rakyat -> Lantai Bursa (Economy). Pure data.
export const STAGE3 = {
  id: 'stage3',
  nameKey: 'stage3_name',
  subtitleKey: 'stage3_sub',
  clearKey: 'stage3_clear',
  clearSubKey: 'stage3_clear_sub',
  width: 4200,
  floorTop: 176,
  floorBottom: 262,
  spawn: { x: 70, y: 220 },
  theme: 'pasar',
  sky: ['#f8e0b0', '#e8b878', '#8aa0c8'],
  eraGain: 16,
  haze: 0.04,
  zones: [
    { x0: 0, x1: 2200, kind: 'pasar' },
    { x0: 2200, x1: 4200, kind: 'bursa', candles: 0.35 },
  ],
  boards: [
    { x: 260, items: [['BERAS', 12000], ['CABAI', 40000], ['MINYAK', 15000]] },
    { x: 980, items: [['GULA', 14000], ['TELUR', 26000], ['BAWANG', 30000]] },
    { x: 1700, items: [['BERAS', 13000], ['GAS', 22000], ['TAHU', 6000]] },
  ],
  screens: [
    { x: 2300, w: 120 },
    { x: 2620, w: 160 },
    { x: 3000, w: 140 },
    { x: 3360, w: 180 },
    { x: 3760, w: 140 },
  ],
  props: [
    { type: 'kardus', x: 420, y: 236, drops: ['es_teh'] },
    { type: 'gerobak', x: 860, y: 204, drops: ['nasi_bungkus', 'koin', 'koin'] },
    { type: 'kardus', x: 1400, y: 250, drops: ['bukti'] },
    { type: 'gerobak', x: 1960, y: 214, drops: ['nasi_bungkus', 'es_teh', 'koin'] },
    { type: 'drum', x: 2560, y: 240, drops: ['koin', 'koin'] },
    { type: 'kardus', x: 3200, y: 206, drops: ['bukti'] },
    { type: 'drum', x: 3620, y: 250, drops: ['nasi_bungkus'] },
  ],
  items: [
    { type: 'ember', x: 640, y: 222 },
    { type: 'kursi_plastik', x: 2400, y: 228 },
    { type: 'golok', x: 3450, y: 240 },
  ],
  sections: [
    {
      camX: 0,
      tutorial: 'tut_pasar',
      waves: [
        { enemies: [{ type: 'penimbun', side: 'right' }, { type: 'preman', side: 'left' }] },
        { when: 1, enemies: [{ type: 'spekulan', side: 'right' }, { type: 'preman', side: 'right' }] },
      ],
    },
    {
      camX: 1000,
      tutorial: 'tut_rentenir',
      waves: [
        { enemies: [{ type: 'rentenir', side: 'right' }, { type: 'penimbun', side: 'left' }] },
        { when: 1, enemies: [{ type: 'spekulan', side: 'right' }, { type: 'spekulan', side: 'left' }, { type: 'preman_tongkat', side: 'right' }] },
      ],
    },
    {
      camX: 2300,
      tutorial: 'tut_bursa',
      waves: [
        { enemies: [{ type: 'spekulan', side: 'right' }, { type: 'rentenir', side: 'right' }, { type: 'penimbun', side: 'left' }] },
        { when: 1, enemies: [{ type: 'spekulan', side: 'right' }, { type: 'spekulan', side: 'left' }, { type: 'rentenir', side: 'left' }] },
      ],
    },
    {
      camX: 3200,
      waves: [
        { enemies: [{ type: 'penimbun', side: 'right' }, { type: 'rentenir', side: 'right' }, { type: 'spekulan', side: 'left' }] },
        { when: 1, enemies: [{ type: 'spekulan', side: 'right' }, { type: 'penimbun', side: 'left' }, { type: 'rentenir', side: 'left' }] },
      ],
    },
    {
      camX: 3720,
      tutorial: 'tut_hantu',
      boss: true,
      waves: [{ enemies: [{ type: 'hantu_bursa', side: 'right', y: 214 }] }],
    },
  ],
};
