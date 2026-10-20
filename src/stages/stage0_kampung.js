// Stage 0 — Kampung Saat Fajar (tutorial). Pure data.
// sections: camera stops at camX; waves spawn when at most `when` enemies remain.
export const STAGE0 = {
  id: 'stage0',
  nameKey: 'stage0_name',
  subtitleKey: 'stage0_sub',
  width: 3000,
  floorTop: 176,
  floorBottom: 262,
  spawn: { x: 70, y: 220 },
  theme: 'kampung',
  clearKey: 'stage0_clear',
  clearSubKey: 'stage0_clear_sub',
  eraGain: 12,
  haze: 0.05,
  sky: ['#ffd9a0', '#f4a77a', '#9e6f8e'],
  houses: [
    { type: 'gapura', x: 40 },
    { type: 'rumah', x: 230 },
    { type: 'warung', x: 470 },
    { type: 'rumah', x: 760 },
    { type: 'posronda', x: 1010 },
    { type: 'rumah', x: 1220 },
    { type: 'warung', x: 1520 },
    { type: 'rumah', x: 1820 },
    { type: 'rumah', x: 2080 },
    { type: 'balai', x: 2560 },
  ],
  props: [
    { type: 'drum', x: 380, y: 196 },
    { type: 'kardus', x: 620, y: 248 },
    { type: 'gerobak', x: 1080, y: 200, drops: ['nasi_bungkus', 'koin', 'koin', 'koin'] },
    { type: 'kardus', x: 1350, y: 236, drops: ['bambu_runcing'] },
    { type: 'drum', x: 1700, y: 250 },
    { type: 'gerobak', x: 2240, y: 206, drops: ['nasi_bungkus', 'es_teh', 'koin', 'koin'] },
    { type: 'drum', x: 2470, y: 190, drops: ['es_teh'] },
  ],
  items: [
    { type: 'kursi_plastik', x: 900, y: 240 },
    { type: 'ember', x: 1950, y: 210 },
  ],
  sections: [
    {
      camX: 0,
      tutorial: 'tut_basics',
      waves: [
        { enemies: [{ type: 'preman', side: 'right' }] },
        { when: 0, enemies: [{ type: 'preman', side: 'right' }, { type: 'preman', side: 'left' }] },
      ],
    },
    {
      camX: 640,
      tutorial: 'tut_kick',
      waves: [
        { enemies: [{ type: 'preman', side: 'right' }, { type: 'preman_tongkat', side: 'right' }] },
        { when: 1, enemies: [{ type: 'preman', side: 'left' }, { type: 'preman', side: 'right' }] },
      ],
    },
    {
      camX: 1300,
      tutorial: 'tut_weapon',
      waves: [
        { enemies: [{ type: 'preman', side: 'right' }, { type: 'preman', side: 'right' }, { type: 'preman_tongkat', side: 'left' }] },
        { when: 1, enemies: [{ type: 'preman_tongkat', side: 'right' }, { type: 'preman', side: 'left' }] },
      ],
    },
    {
      camX: 1900,
      tutorial: 'tut_grab',
      waves: [
        { enemies: [{ type: 'preman', side: 'right' }, { type: 'preman', side: 'left' }, { type: 'preman', side: 'right' }] },
        { when: 1, enemies: [{ type: 'preman_tongkat', side: 'right' }, { type: 'preman_tongkat', side: 'left' }] },
      ],
    },
    {
      camX: 2520,
      tutorial: 'tut_boss',
      boss: true,
      waves: [{ enemies: [{ type: 'preman_kampung', side: 'right', y: 220 }] }],
    },
  ],
};
