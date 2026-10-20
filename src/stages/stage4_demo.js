// Stage 4 — Jalan Raya Demo (Society). Pure data.
export const STAGE4 = {
  id: 'stage4',
  nameKey: 'stage4_name',
  subtitleKey: 'stage4_sub',
  clearKey: 'stage4_clear',
  clearSubKey: 'stage4_clear_sub',
  width: 4400,
  floorTop: 178,
  floorBottom: 262,
  spawn: { x: 70, y: 220 },
  theme: 'demo',
  sky: ['#f0c890', '#c88a6a', '#6a6a8a'],
  sun: { x: 360, y: 96, r: 14, color: 'rgba(255,210,150,0.8)' },
  eraGain: 8,
  haze: 0.06,
  decorFires: [520, 1340, 2280, 3150, 3980],
  props: [
    { type: 'kardus', x: 380, y: 240, drops: ['es_teh'] },
    { type: 'drum', x: 900, y: 206, drops: ['koin', 'koin'] },
    { type: 'gerobak', x: 1500, y: 230, drops: ['nasi_bungkus', 'es_teh', 'koin'] },
    { type: 'kardus', x: 2050, y: 210, drops: ['bukti'] },
    { type: 'drum', x: 2700, y: 250, drops: ['nasi_bungkus'] },
    { type: 'gerobak', x: 3300, y: 214, drops: ['nasi_bungkus', 'koin', 'koin'] },
    { type: 'kardus', x: 3600, y: 246, drops: ['bukti'] },
  ],
  items: [
    { type: 'tongkat', x: 620, y: 226 },
    { type: 'kursi_plastik', x: 1900, y: 240 },
    { type: 'ember', x: 2900, y: 220 },
  ],
  sections: [
    {
      camX: 0,
      tutorial: 'tut_demo',
      waves: [
        { enemies: [{ type: 'preman_bayaran', side: 'right' }, { type: 'mahasiswa', side: 'left', ally: true }] },
        { when: 1, enemies: [{ type: 'preman_bayaran', side: 'right' }, { type: 'preman_bayaran', side: 'left' }] },
      ],
    },
    {
      camX: 1000,
      tutorial: 'tut_provokator',
      waves: [
        { enemies: [{ type: 'provokator', side: 'right' }, { type: 'preman_bayaran', side: 'right' }] },
        { when: 1, enemies: [{ type: 'buzzer', side: 'right' }, { type: 'preman_bayaran', side: 'left' }, { type: 'ojol', side: 'left', ally: true }] },
      ],
    },
    {
      camX: 2100,
      tutorial: 'tut_buzzer',
      waves: [
        { enemies: [{ type: 'buzzer', side: 'right' }, { type: 'buzzer', side: 'left' }, { type: 'preman_bayaran', side: 'right' }] },
        { when: 1, enemies: [{ type: 'provokator', side: 'right' }, { type: 'preman_tongkat', side: 'left' }, { type: 'mahasiswa', side: 'left', ally: true }] },
      ],
    },
    {
      camX: 3000,
      waves: [
        { enemies: [{ type: 'preman_bayaran', side: 'right' }, { type: 'provokator', side: 'left' }, { type: 'buzzer', side: 'right' }] },
        { when: 1, enemies: [{ type: 'preman_bayaran', side: 'right' }, { type: 'preman_bayaran', side: 'left' }, { type: 'buzzer', side: 'left' }] },
      ],
    },
    {
      camX: 3920,
      tutorial: 'tut_truk',
      boss: true,
      waves: [{ enemies: [{ type: 'komandan_truk', side: 'right', y: 214 }] }],
    },
    {
      camX: 3920,
      tutorial: 'tut_komandan',
      boss: true,
      waves: [{ enemies: [{ type: 'komandan', side: 'right', y: 220 }, { type: 'preman_bayaran', side: 'left' }] }],
    },
  ],
};
