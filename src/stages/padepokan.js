// Training yard of a silat school at dawn. Pure data: the renderer turns
// `theme` and `props` into art.
export const PADEPOKAN = {
  id: 'padepokan',
  nameKey: 'stage_padepokan',
  width: 1680,
  floorTop: 172,
  floorBottom: 262,
  spawn: { x: 90, y: 215 },
  theme: 'padepokan',
  // Training: keep this many Preman sparring partners on screen.
  training: { enemies: 3 },
  sky: ['#f6c58a', '#f2a46b', '#b8705a'],
  props: [
    { type: 'pendopo', x: 260 },
    { type: 'kentongan', x: 540 },
    { type: 'pendopo', x: 900 },
    { type: 'banner', x: 1180 },
    { type: 'pendopo', x: 1420 },
  ],
};
