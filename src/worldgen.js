import { World, T } from './world.js';

export function generateFlatWorld(w = 256, h = 96) {
  const world = new World(w, h);
  const ground = h - 32;

  for (let x = 0; x < w; x++) {
    world.set(x, ground, T.RUMPUT);
    for (let y = ground + 1; y < h; y++) {
      world.set(x, y, y < ground + 6 ? T.TANAH : T.BATU);
    }
  }

  const platform = (x0, y, len) => {
    for (let x = x0; x < x0 + len; x++) world.set(x, y, T.RUMPUT);
  };
  platform(40, ground - 4, 6);
  platform(52, ground - 8, 6);
  platform(64, ground - 12, 8);

  for (let i = 0; i < 6; i++) {
    for (let y = ground - i; y < ground; y++) world.set(100 + i, y, T.TANAH);
    world.set(100 + i, ground - i - 1, T.RUMPUT);
  }

  for (let y = ground - 5; y < ground; y++) world.set(140, y, T.BATU);

  return { world, spawn: { x: 20, y: ground - 3 } };
}
