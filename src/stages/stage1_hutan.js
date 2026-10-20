// Stage 1 — Hutan Terbakar → Kebun Sawit (Environment). Pure data.
export const STAGE1 = {
  id: 'stage1',
  nameKey: 'stage1_name',
  subtitleKey: 'stage1_sub',
  clearKey: 'stage1_clear',
  clearSubKey: 'stage1_clear_sub',
  width: 4400,
  floorTop: 176,
  floorBottom: 262,
  spawn: { x: 70, y: 220 },
  theme: 'hutan',
  sky: ['#f0a060', '#c8643a', '#5a3a3a'],
  eraGain: 12,
  zones: [
    { x0: 0, x1: 1800, kind: 'forest', haze: 0.4 },
    { x0: 1800, x1: 3500, kind: 'sawit', haze: 0.22 },
    { x0: 3500, x1: 4400, kind: 'river', haze: 0.12, slow: 0.65 },
  ],
  decorFires: [140, 360, 520, 780, 1010, 1240, 1460, 1690],
  props: [
    { type: 'jerigen', x: 300, y: 204 },
    { type: 'warga', x: 640, y: 196 },
    { type: 'kardus', x: 980, y: 246, drops: ['es_teh'] },
    { type: 'warga', x: 1420, y: 240 },
    { type: 'drum', x: 2150, y: 200, drops: ['nasi_bungkus', 'koin'] },
    { type: 'jerigen', x: 2600, y: 248 },
    { type: 'warga', x: 3260, y: 206 },
    { type: 'kardus', x: 3700, y: 236, drops: ['nasi_bungkus'] },
    { type: 'drum', x: 3980, y: 196, drops: ['es_teh', 'koin', 'koin'] },
  ],
  items: [
    { type: 'ember', x: 420, y: 236 },
    { type: 'ember', x: 1600, y: 210 },
    { type: 'bambu_runcing', x: 2400, y: 230 },
    { type: 'ember', x: 3880, y: 250 },
  ],
  sections: [
    {
      camX: 0,
      tutorial: 'tut_fire',
      waves: [
        { enemies: [{ type: 'pembakar', side: 'right' }, { type: 'preman', side: 'right' }] },
        { when: 1, enemies: [{ type: 'asap', side: 'right' }, { type: 'asap', side: 'left' }] },
      ],
    },
    {
      camX: 900,
      tutorial: 'tut_rescue',
      waves: [
        { enemies: [{ type: 'penebang', side: 'right' }, { type: 'pembakar', side: 'left' }] },
        { when: 1, enemies: [{ type: 'asap', side: 'right' }, { type: 'penebang', side: 'right' }, { type: 'preman_tongkat', side: 'left' }] },
      ],
    },
    {
      camX: 1900,
      tutorial: 'tut_dozer',
      waves: [
        { enemies: [{ type: 'buldoser', side: 'right', y: 220 }] },
        { when: 0, enemies: [{ type: 'preman', side: 'left' }, { type: 'pembakar', side: 'right' }] },
      ],
    },
    {
      camX: 2900,
      tutorial: 'tut_sawit',
      waves: [
        { enemies: [{ type: 'penebang', side: 'right' }, { type: 'pembakar', side: 'right' }, { type: 'asap', side: 'left' }] },
        { when: 1, enemies: [{ type: 'asap', side: 'right' }, { type: 'asap', side: 'right' }, { type: 'penebang', side: 'left' }] },
      ],
    },
    {
      camX: 3920,
      tutorial: 'tut_raja',
      boss: true,
      waves: [{ enemies: [{ type: 'raja_sawit', side: 'right', y: 218 }] }],
    },
  ],
};
