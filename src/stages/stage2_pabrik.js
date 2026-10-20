// Stage 2 — Pabrik Tutup (Jobs). Pure data.
export const STAGE2 = {
  id: 'stage2',
  nameKey: 'stage2_name',
  subtitleKey: 'stage2_sub',
  clearKey: 'stage2_clear',
  clearSubKey: 'stage2_clear_sub',
  width: 3800,
  floorTop: 176,
  floorBottom: 262,
  spawn: { x: 70, y: 220 },
  theme: 'pabrik',
  sky: ['#2a3450', '#1a2236', '#0c1020'],
  sun: { x: 380, y: 40, r: 12, color: 'rgba(240,240,220,0.9)' },
  eraGain: 10,
  haze: 0.05,
  props: [
    { type: 'kardus', x: 320, y: 230 },
    { type: 'drum', x: 700, y: 200, drops: ['nasi_bungkus'] },
    { type: 'kardus', x: 1180, y: 250, drops: ['bukti'] },
    { type: 'drum', x: 1620, y: 206 },
    { type: 'kardus', x: 2150, y: 236, drops: ['es_teh', 'koin'] },
    { type: 'drum', x: 2700, y: 252, drops: ['nasi_bungkus', 'koin'] },
    { type: 'kardus', x: 3100, y: 200, drops: ['bukti'] },
  ],
  items: [
    { type: 'kursi_plastik', x: 520, y: 246 },
    { type: 'golok', x: 1900, y: 220 },
    { type: 'ember', x: 2900, y: 232 },
  ],
  sections: [
    {
      camX: 0,
      tutorial: 'tut_satpam',
      waves: [
        { enemies: [{ type: 'satpam', side: 'right' }, { type: 'preman', side: 'right' }] },
        { when: 1, enemies: [{ type: 'satpam', side: 'left' }, { type: 'mandor', side: 'right' }] },
      ],
    },
    {
      camX: 880,
      tutorial: 'tut_mandor',
      waves: [
        { enemies: [{ type: 'mandor', side: 'right' }, { type: 'satpam', side: 'right' }, { type: 'preman_tongkat', side: 'left' }] },
        { when: 1, enemies: [{ type: 'robot', side: 'right' }, { type: 'mandor', side: 'left' }] },
      ],
    },
    {
      camX: 1800,
      tutorial: 'tut_robot',
      waves: [
        { enemies: [{ type: 'robot', side: 'right' }, { type: 'robot', side: 'left' }] },
        { when: 1, enemies: [{ type: 'satpam', side: 'right' }, { type: 'satpam', side: 'left' }, { type: 'mandor', side: 'right' }] },
      ],
    },
    {
      camX: 2650,
      waves: [
        { enemies: [{ type: 'mandor', side: 'right' }, { type: 'robot', side: 'right' }, { type: 'satpam', side: 'left' }] },
        { when: 1, enemies: [{ type: 'robot', side: 'right' }, { type: 'preman', side: 'left' }, { type: 'mandor', side: 'left' }] },
      ],
    },
    {
      camX: 3320,
      tutorial: 'tut_juragan',
      boss: true,
      waves: [{ enemies: [{ type: 'juragan', side: 'right', y: 218 }] }],
    },
  ],
};
