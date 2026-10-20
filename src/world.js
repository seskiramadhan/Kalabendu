import { T, SOLID } from './tiles.js';

export const TILE = 16;

export class World {
  constructor(w, h) {
    this.w = w;
    this.h = h;
    this.tiles = new Uint8Array(w * h);
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
