import { T, SOLID } from './tiles.js';

export const TILE = 16;
export const CHUNK = 32;

export const BIOME = {
  PANTAI: 0,
  HUTAN: 1,
  SAWAH: 2,
  BAMBU: 3,
  GUNUNG: 4,
  KAMPUNG: 5,
  SAWIT: 6,
};

export class World {
  constructor(w, h, seed = 0) {
    this.w = w;
    this.h = h;
    this.seed = seed;
    this.tiles = new Uint8Array(w * h);
    this.surface = new Int16Array(w);
    this.biome = new Uint8Array(w);
    this.kampungs = [];
    this.listeners = [];
  }

  inBounds(x, y) {
    return x >= 0 && y >= 0 && x < this.w && y < this.h;
  }

  get(x, y) {
    if (!this.inBounds(x, y)) return y < 0 ? T.AIR : T.BATU;
    return this.tiles[y * this.w + x];
  }

  set(x, y, id) {
    if (!this.inBounds(x, y)) return;
    const i = y * this.w + x;
    if (this.tiles[i] === id) return;
    this.tiles[i] = id;
    for (const fn of this.listeners) fn(x, y, id);
  }

  onChange(fn) {
    this.listeners.push(fn);
  }

  isSolid(x, y) {
    if (x < 0 || x >= this.w) return true;
    return SOLID[this.get(x, y)] === 1;
  }

  get pixelWidth() {
    return this.w * TILE;
  }

  get pixelHeight() {
    return this.h * TILE;
  }
}
