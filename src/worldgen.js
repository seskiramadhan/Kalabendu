import { World } from './world.js';
import { T } from './tiles.js';

// Small flat test world with a strip of every material near spawn.
export function generateFlatWorld(w = 256, h = 96) {
  const world = new World(w, h);
  const ground = h - 40;

  for (let x = 0; x < w; x++) {
    world.set(x, ground, T.RUMPUT);
    for (let y = ground + 1; y < h; y++) {
      let id = T.BATU;
      if (y < ground + 4) id = T.TANAH;
      else if (y < ground + 8) id = T.TANAH_LIAT;
      world.set(x, y, id);
    }
  }

  const ores = [T.TEMBAGA, T.BATU_BARA, T.PERAK, T.BELERANG, T.EMAS];
  ores.forEach((id, i) => {
    for (let dx = 0; dx < 3; dx++)
      for (let dy = 0; dy < 2; dy++) world.set(14 + i * 6 + dx, ground + 10 + i * 2 + dy, id);
  });

  for (let x = 44; x < 54; x++) {
    world.set(x, ground, T.PASIR);
    world.set(x, ground + 1, T.PASIR);
  }
  for (let x = 56; x < 62; x++) world.set(x, ground, T.LUMPUR);

  for (let x = 66; x < 82; x += 3) world.set(x, ground - 1, T.POHON_SAWIT);
  world.set(86, ground - 1, T.TUNGGUL);
  world.set(89, ground - 1, T.BIBIT);
  world.set(91, ground - 1, T.BIBIT);

  const platform = (x0, y, len, id = T.RUMPUT) => {
    for (let x = x0; x < x0 + len; x++) world.set(x, y, id);
  };
  platform(100, ground - 4, 6, T.KAYU_JATI);
  platform(110, ground - 8, 6, T.BAMBU);
  platform(118, ground - 12, 8, T.BATU_CANDI);
  for (let x = 118; x < 126; x++) world.set(x, ground - 13, T.DAUN_KELAPA);

  for (let i = 0; i < 6; i++) {
    for (let y = ground - i; y < ground; y++) world.set(140 + i, y, T.TANAH);
    world.set(140 + i, ground - i - 1, T.RUMPUT);
  }

  for (let y = ground - 5; y < ground; y++) {
    world.set(160, y, T.BATA_MERAH);
    world.set(161, y, T.BATA_MERAH);
  }

  return { world, spawn: { x: 6, y: ground } };
}
