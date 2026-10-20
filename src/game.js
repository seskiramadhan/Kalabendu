import { createPlayer, updatePlayer } from './player.js';
import { TILE } from './world.js';
import { T, TILES, isFertile } from './tiles.js';
import { Inventory } from './inventory.js';

export const REACH_TILES = 5.5;
const PLACE_COOLDOWN = 0.12;

// All state changes go through applyAction, so a network host can later
// relay the same messages from remote players.
export class Game {
  constructor(world, spawn) {
    this.world = world;
    this.spawn = spawn;
    this.players = new Map();
    this.tick = 0;
    this.rngState = (world.seed ^ 0x5bd1e995) >>> 0;
  }

  addPlayer(id) {
    const p = createPlayer(id, this.spawn.x, this.spawn.y);
    p.inventory = new Inventory();
    p.inventory.add(T.BIBIT, 10);
    p.inventory.add(T.BATA_MERAH, 30);
    p.inventory.add(T.KAYU_JATI, 30);
    p.inventory.add(T.BATU_CANDI, 20);
    p.mining = null;
    p.placeCooldown = 0;
    this.players.set(id, p);
    return p;
  }

  applyAction(action) {
    const p = this.players.get(action.playerId);
    if (!p) return;
    switch (action.type) {
      case 'intent':
        p.intent.move = Math.max(-1, Math.min(1, action.move | 0));
        p.intent.jump = !!action.jump;
        p.intent.mine = action.mine ? { x: action.mine.x | 0, y: action.mine.y | 0 } : null;
        p.intent.place = action.place ? { x: action.place.x | 0, y: action.place.y | 0 } : null;
        break;
      case 'select':
        p.inventory.select(action.slot | 0);
        break;
    }
  }

  step(dt) {
    this.tick++;
    for (const p of this.players.values()) {
      updatePlayer(p, this.world, dt);
      this.updateMining(p, dt);
      this.updatePlacing(p, dt);
    }
  }

  inReach(p, tx, ty) {
    const dx = (tx + 0.5) * TILE - (p.x + p.w / 2);
    const dy = (ty + 0.5) * TILE - (p.y + p.h / 2);
    return dx * dx + dy * dy <= (REACH_TILES * TILE) ** 2;
  }

  canMine(p, tx, ty) {
    return this.world.inBounds(tx, ty) && TILES[this.world.get(tx, ty)].mineable && this.inReach(p, tx, ty);
  }

  updateMining(p, dt) {
    const target = p.intent.mine;
    if (!target || !this.canMine(p, target.x, target.y)) {
      p.mining = null;
      return;
    }
    if (!p.mining || p.mining.x !== target.x || p.mining.y !== target.y) {
      p.mining = { x: target.x, y: target.y, progress: 0 };
    }
    const def = TILES[this.world.get(target.x, target.y)];
    p.mining.progress += dt / Math.max(def.hardness, 0.05);
    if (p.mining.progress >= 1) {
      this.breakTile(p, target.x, target.y);
      p.mining = null;
    }
  }

  breakTile(p, tx, ty) {
    const id = this.world.get(tx, ty);
    if (!TILES[id].mineable) return;
    if (TILES[id].tree) {
      this.fellTree(p, tx, ty);
      return;
    }
    this.world.set(tx, ty, T.AIR);
    const drop = TILES[id].drop;
    if (drop) p.inventory.add(drop, 1);
    const above = this.world.get(tx, ty - 1);
    if (TILES[above].needsGround || TILES[above].tree) this.breakTile(p, tx, ty - 1);
  }

  // Removes the connected trunk and canopy. A felled teak leaves a stump.
  fellTree(p, tx, ty) {
    const world = this.world;
    const seen = new Set();
    const stack = [[tx, ty]];
    let base = null;
    let jati = false;
    while (stack.length && seen.size < 300) {
      const [x, y] = stack.pop();
      const key = y * world.w + x;
      if (seen.has(key) || Math.abs(x - tx) > 5) continue;
      const id = world.get(x, y);
      if (!TILES[id]?.tree) continue;
      seen.add(key);
      world.set(x, y, T.AIR);
      if (id === T.BATANG_JATI) jati = true;
      if (!base || y > base.y) base = { x, y, id };
      if (id === T.DAUN_HUTAN || id === T.DAUN_KELAPA) {
        if (this.chance(0.05)) p.inventory.add(T.BIBIT, 1);
      } else if (TILES[id].drop) {
        p.inventory.add(TILES[id].drop, 1);
      }
      for (let dy = -1; dy <= 1; dy++)
        for (let dx = -1; dx <= 1; dx++) if (dx || dy) stack.push([x + dx, y + dy]);
    }
    if (jati && base && isFertile(world.get(base.x, base.y + 1))) world.set(base.x, base.y, T.TUNGGUL);
  }

  // Deterministic per tick so a host and its clients agree.
  chance(p) {
    this.rngState = (Math.imul(this.rngState ^ (this.rngState >>> 15), 2246822507) + 0x9e3779b9) >>> 0;
    return this.rngState / 4294967296 < p;
  }

  canPlace(p, id, tx, ty) {
    const world = this.world;
    if (!world.inBounds(tx, ty) || world.get(tx, ty) !== T.AIR || !this.inReach(p, tx, ty)) return false;
    const def = TILES[id];
    if (def.needsGround) return isFertile(world.get(tx, ty + 1));
    const touching =
      world.get(tx - 1, ty) !== T.AIR ||
      world.get(tx + 1, ty) !== T.AIR ||
      world.get(tx, ty - 1) !== T.AIR ||
      world.get(tx, ty + 1) !== T.AIR;
    if (!touching) return false;
    if (def.solid) {
      for (const other of this.players.values()) if (overlapsTile(other, tx, ty)) return false;
    }
    return true;
  }

  updatePlacing(p, dt) {
    p.placeCooldown = Math.max(0, p.placeCooldown - dt);
    const target = p.intent.place;
    if (!target || p.placeCooldown > 0) return;
    const item = p.inventory.selectedItem;
    if (!item || !TILES[item.id]) return;
    if (!this.canPlace(p, item.id, target.x, target.y)) return;
    p.inventory.takeFromSlot(p.inventory.selected, 1);
    this.world.set(target.x, target.y, item.id);
    p.placeCooldown = PLACE_COOLDOWN;
  }
}

function overlapsTile(b, tx, ty) {
  const x = tx * TILE;
  const y = ty * TILE;
  return b.x < x + TILE && b.x + b.w > x && b.y < y + TILE && b.y + b.h > y;
}
