// Stage 5 — Gedung Pejabat (Corruption): lobby, glass lift, vault. Pure data.
export const STAGE5 = {
  id: 'stage5',
  nameKey: 'stage5_name',
  subtitleKey: 'stage5_sub',
  clearKey: 'stage5_clear',
  clearSubKey: 'stage5_clear_sub',
  width: 4400,
  floorTop: 176,
  floorBottom: 262,
  spawn: { x: 70, y: 220 },
  theme: 'gedung',
  sky: ['#f6d8a8', '#d8a878', '#5a6a9a'],
  sun: { x: 80, y: 60, r: 12, color: 'rgba(255,230,180,0.8)' },
  eraGain: 20,
  haze: 0,
  zones: [
    { x0: 0, x1: 1700, kind: 'lobby' },
    { x0: 1700, x1: 3100, kind: 'lift' },
    { x0: 3100, x1: 4400, kind: 'vault' },
  ],
  props: [
    { type: 'kardus', x: 420, y: 240, drops: ['es_teh'] },
    { type: 'kardus', x: 1180, y: 210, drops: ['bukti'] },
    { type: 'drum', x: 1900, y: 244, drops: ['nasi_bungkus', 'koin'] },
    { type: 'kardus', x: 2500, y: 214, drops: ['bukti'] },
    { type: 'kardus', x: 3300, y: 230, drops: ['nasi_bungkus', 'es_teh', 'koin'] },
    { type: 'kardus', x: 3700, y: 250, drops: ['bukti'] },
  ],
  items: [
    { type: 'golok', x: 700, y: 226 },
    { type: 'kursi_plastik', x: 2200, y: 236 },
    { type: 'tongkat', x: 3450, y: 216 },
  ],
  sections: [
    {
      camX: 0,
      tutorial: 'tut_gedung',
      waves: [
        { enemies: [{ type: 'ajudan', side: 'right' }, { type: 'tikus', side: 'right' }] },
        { when: 1, enemies: [{ type: 'tikus', side: 'left' }, { type: 'ajudan', side: 'left' }, { type: 'jaksa_palsu', side: 'right' }] },
      ],
    },
    {
      camX: 1100,
      tutorial: 'tut_jaksa',
      waves: [
        { enemies: [{ type: 'jaksa_palsu', side: 'right' }, { type: 'ajudan', side: 'right' }, { type: 'tikus', side: 'left' }] },
        { when: 1, enemies: [{ type: 'makelar', side: 'right' }, { type: 'ajudan', side: 'left' }] },
      ],
    },
    {
      camX: 2100,
      tutorial: 'tut_lift',
      waves: [
        { enemies: [{ type: 'ajudan', side: 'right' }, { type: 'ajudan', side: 'left' }, { type: 'makelar', side: 'right' }] },
        { when: 1, enemies: [{ type: 'tikus', side: 'right' }, { type: 'tikus', side: 'left' }, { type: 'jaksa_palsu', side: 'right' }] },
      ],
    },
    {
      camX: 3100,
      waves: [
        { enemies: [{ type: 'jaksa_palsu', side: 'right' }, { type: 'makelar', side: 'left' }, { type: 'ajudan', side: 'right' }] },
        { when: 1, enemies: [{ type: 'tikus', side: 'right' }, { type: 'ajudan', side: 'left' }, { type: 'jaksa_palsu', side: 'left' }] },
      ],
    },
    {
      camX: 3920,
      tutorial: 'tut_pejabat',
      boss: true,
      waves: [{ enemies: [{ type: 'pejabat_tinggi', side: 'right', y: 218 }] }],
    },
    {
      camX: 3920,
      requires: 'kala',
      tutorial: 'tut_kala',
      boss: true,
      waves: [{ enemies: [{ type: 'batara_kala', side: 'right', y: 216 }] }],
    },
  ],
};
