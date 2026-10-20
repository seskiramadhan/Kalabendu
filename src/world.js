export const TILE = 16;

export const T = {
  AIR: 0,
  RUMPUT: 1,
  TANAH: 2,
  BATU: 3,
};

const SOLID = new Uint8Array(256);
SOLID[T.RUMPUT] = 1;
SOLID[T.TANAH] = 1;
SOLID[T.BATU] = 1;

export class World {
  constructor(w, h) {
    this.w = w;
    this.h = h;
    this.tiles = new Uint8Array(w * h);
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
    this.tiles[y * this.w + x] = id;
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
