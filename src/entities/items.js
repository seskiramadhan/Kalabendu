let nextUid = 1_000_000;

export const ITEMS = {
  nasi_bungkus: { kind: 'food', heal: 45, nameKey: 'item_nasi' },
  es_teh: { kind: 'food', heal: 18, nameKey: 'item_esteh' },
  koin: { kind: 'coin', rupiah: 500, score: 100 },
  uang: { kind: 'coin', rupiah: 2000, score: 300 },
  bukti: { kind: 'evidence', nameKey: 'item_bukti' },
  bambu_runcing: { kind: 'weapon', weapon: 'bambu_runcing' },
  kursi_plastik: { kind: 'weapon', weapon: 'kursi_plastik' },
  ember: { kind: 'weapon', weapon: 'ember' },
  golok: { kind: 'weapon', weapon: 'golok' },
  tongkat: { kind: 'weapon', weapon: 'tongkat' },
};

const GRAVITY = 700;
const COIN_LIFE = 14;
const LOST_COIN_LIFE = 6;

export function createItem(type, x, y, { z = 0, vx = 0, vz = 0, durability, value, lost = false } = {}) {
  return {
    uid: nextUid++,
    kind: 'item',
    type,
    def: ITEMS[type],
    x,
    y,
    z,
    vx,
    vz,
    t: 0,
    durability,
    value: value ?? ITEMS[type].rupiah,
    lost,
    remove: false,
  };
}

export function updateItem(it, dt) {
  it.t += dt;
  if (it.z > 0 || it.vz > 0) {
    it.vz -= GRAVITY * dt;
    it.z += it.vz * dt;
    it.x += it.vx * dt;
    if (it.z <= 0) {
      it.z = 0;
      it.vz = Math.abs(it.vz) > 80 ? -it.vz * 0.35 : 0;
      it.vx *= 0.5;
    }
  }
  if (it.def.kind === 'coin' && it.t > (it.lost ? LOST_COIN_LIFE : COIN_LIFE)) it.remove = true;
}
