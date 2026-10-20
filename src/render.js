import { TILE, CHUNK } from './world.js';
import { T } from './tiles.js';
import { buildAtlas, variantAt } from './textures.js';

const CHUNK_PX = CHUNK * TILE;
const MAX_CACHED = 48;
const BACKDROP_DEPTH = 3;

// Pre-renders 32x32 tile chunks to offscreen canvases; a chunk is redrawn
// only after one of its tiles changes.
class ChunkCache {
  constructor(world, atlas) {
    this.world = world;
    this.atlas = atlas;
    this.cols = Math.ceil(world.w / CHUNK);
    this.canvases = new Map();
    this.empty = new Set();
    this.dirty = new Set();
    this.pool = [];
    this.builtThisFrame = 0;
    world.onChange((x, y) => {
      const key = this.key(Math.floor(x / CHUNK), Math.floor(y / CHUNK));
      this.empty.delete(key);
      if (this.canvases.has(key)) this.dirty.add(key);
    });
  }

  key(cx, cy) {
    return cy * this.cols + cx;
  }

  get(cx, cy) {
    const key = this.key(cx, cy);
    if (this.empty.has(key)) return null;
    let canvas = this.canvases.get(key);
    if (canvas && !this.dirty.has(key)) {
      this.canvases.delete(key);
      this.canvases.set(key, canvas);
      return canvas;
    }
    if (!canvas) canvas = this.pool.pop() ?? makeCanvas();
    const drewSomething = this.build(canvas, cx, cy);
    this.dirty.delete(key);
    this.canvases.delete(key);
    if (!drewSomething) {
      this.pool.push(canvas);
      this.empty.add(key);
      return null;
    }
    this.canvases.set(key, canvas);
    this.evict();
    return canvas;
  }

  evict() {
    while (this.canvases.size > MAX_CACHED) {
      const [oldKey, old] = this.canvases.entries().next().value;
      this.canvases.delete(oldKey);
      this.dirty.delete(oldKey);
      this.pool.push(old);
    }
  }

  build(canvas, cx, cy) {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, CHUNK_PX, CHUNK_PX);
    ctx.imageSmoothingEnabled = false;
    const world = this.world;
    const x0 = cx * CHUNK;
    const y0 = cy * CHUNK;
    let any = false;
    for (let ly = 0; ly < CHUNK; ly++) {
      const y = y0 + ly;
      if (y >= world.h) break;
      for (let lx = 0; lx < CHUNK; lx++) {
        const x = x0 + lx;
        if (x >= world.w) break;
        const id = world.tiles[y * world.w + x];
        const underground = y > world.surface[x] + BACKDROP_DEPTH;
        if (underground && id !== T.MAGMA && !isOpaque(id)) {
          ctx.fillStyle = variantAt(x, y) & 1 ? '#2a1c13' : '#2e2016';
          ctx.fillRect(lx * TILE, ly * TILE, TILE, TILE);
          any = true;
        }
        if (id === T.AIR) continue;
        ctx.drawImage(this.atlas, variantAt(x, y) * TILE, id * TILE, TILE, TILE, lx * TILE, ly * TILE, TILE, TILE);
        any = true;
      }
    }
    this.builtThisFrame++;
    return any;
  }
}

const TRANSPARENT = new Set([
  T.AIR, T.DAUN_KELAPA, T.POHON_SAWIT, T.TUNGGUL, T.BIBIT, T.BATANG_JATI, T.DAUN_HUTAN,
  T.BATANG_KELAPA, T.BATANG_BAMBU, T.PADI, T.BATANG_SAWIT, T.DAUN_SAWIT,
]);

function isOpaque(id) {
  return !TRANSPARENT.has(id);
}

function makeCanvas() {
  const c = document.createElement('canvas');
  c.width = CHUNK_PX;
  c.height = CHUNK_PX;
  return c;
}

export class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { alpha: false });
    this.atlas = buildAtlas();
    this.zoom = 2;
    this.dpr = 1;
    this.cssW = 0;
    this.cssH = 0;
    this.chunks = null;
    this.clouds = Array.from({ length: 18 }, (_, i) => ({
      x: (i * 997) % 4000,
      y: (40 + ((i * 131) % 260)) * TILE,
      w: 60 + ((i * 53) % 90),
      speed: 4 + (i % 5),
    }));
  }

  setWorld(world) {
    this.chunks = new ChunkCache(world, this.atlas);
  }

  resize() {
    this.dpr = Math.min(window.devicePixelRatio || 1, 3);
    this.cssW = window.innerWidth;
    this.cssH = window.innerHeight;
    this.canvas.width = Math.round(this.cssW * this.dpr);
    this.canvas.height = Math.round(this.cssH * this.dpr);
  }

  get viewW() {
    return this.cssW / this.zoom;
  }

  get viewH() {
    return this.cssH / this.zoom;
  }

  screenToTile(camera, sx, sy) {
    return {
      x: Math.floor((camera.x + sx / this.zoom) / TILE),
      y: Math.floor((camera.y + sy / this.zoom) / TILE),
    };
  }

  // hover: { x, y, ok } tile under the pointer, or null.
  draw(game, camera, localId, hover, time) {
    const ctx = this.ctx;
    const scale = this.dpr * this.zoom;
    const camX = Math.round(camera.x * scale) / scale;
    const camY = Math.round(camera.y * scale) / scale;

    this.drawSky(game.world, camX, camY, scale, time);

    ctx.setTransform(scale, 0, 0, scale, -camX * scale, -camY * scale);
    ctx.imageSmoothingEnabled = false;
    this.drawChunks(game.world, camX, camY);
    for (const p of game.players.values()) this.drawPlayer(p, p.id === localId, time);

    const local = game.players.get(localId);
    if (local?.mining) this.drawCrack(local.mining);
    if (hover) this.drawHover(hover);
  }

  drawSky(world, camX, camY, scale, time) {
    const ctx = this.ctx;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    const midX = Math.max(0, Math.min(world.w - 1, Math.floor((camX + this.viewW / 2) / TILE)));
    const surfacePx = (world.surface[midX] + 8) * TILE;
    const depth = Math.max(0, Math.min(1, (camY + this.viewH / 2 - surfacePx) / (50 * TILE)));
    const sky = ctx.createLinearGradient(0, 0, 0, this.canvas.height);
    sky.addColorStop(0, mix('#8ec5e8', '#1b120c', depth));
    sky.addColorStop(1, mix('#f2d9a8', '#1b120c', depth));
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    if (depth >= 1) return;

    ctx.setTransform(scale, 0, 0, scale, 0, 0);
    ctx.globalAlpha = 0.85 * (1 - depth);
    ctx.fillStyle = '#fbf6ec';
    const wrap = 4000;
    for (const c of this.clouds) {
      let x = (c.x + time * c.speed - camX * 0.3) % wrap;
      if (x < 0) x += wrap;
      if (x > this.viewW + c.w) continue;
      const y = c.y - camY;
      if (y < -20 || y > this.viewH + 20) continue;
      ctx.fillRect(Math.round(x), Math.round(y), c.w, 10);
      ctx.fillRect(Math.round(x + c.w * 0.2), Math.round(y - 6), c.w * 0.5, 8);
    }
    ctx.globalAlpha = 1;
  }

  drawChunks(world, camX, camY) {
    const ctx = this.ctx;
    const cx0 = Math.max(0, Math.floor(camX / CHUNK_PX));
    const cy0 = Math.max(0, Math.floor(camY / CHUNK_PX));
    const cx1 = Math.min(Math.ceil(world.w / CHUNK) - 1, Math.floor((camX + this.viewW) / CHUNK_PX));
    const cy1 = Math.min(Math.ceil(world.h / CHUNK) - 1, Math.floor((camY + this.viewH) / CHUNK_PX));
    this.chunks.builtThisFrame = 0;
    for (let cy = cy0; cy <= cy1; cy++)
      for (let cx = cx0; cx <= cx1; cx++) {
        const canvas = this.chunks.get(cx, cy);
        if (canvas) ctx.drawImage(canvas, cx * CHUNK_PX, cy * CHUNK_PX);
      }
  }

  drawCrack(m) {
    const ctx = this.ctx;
    const px = m.x * TILE;
    const py = m.y * TILE;
    const stage = Math.min(4, Math.floor(m.progress * 5));
    ctx.fillStyle = `rgba(0,0,0,${0.12 + stage * 0.08})`;
    ctx.fillRect(px, py, TILE, TILE);
    ctx.fillStyle = 'rgba(20,12,8,0.85)';
    const lines = [
      [7, 2, 1, 5], [8, 7, 4, 1], [3, 8, 4, 1], [11, 8, 1, 5], [4, 10, 1, 4],
    ];
    for (let i = 0; i <= stage && i < lines.length; i++) {
      const [x, y, w, h] = lines[i];
      ctx.fillRect(px + x, py + y, w, h);
    }
  }

  drawHover(h) {
    const ctx = this.ctx;
    ctx.strokeStyle = h.ok ? 'rgba(255,240,200,0.9)' : 'rgba(255,90,60,0.6)';
    ctx.lineWidth = 1;
    ctx.strokeRect(h.x * TILE + 0.5, h.y * TILE + 0.5, TILE - 1, TILE - 1);
  }

  drawPlayer(p, isLocal, time) {
    const ctx = this.ctx;
    const x = Math.round(p.x);
    const y = Math.round(p.y);
    const bob = p.walkTime > 0 ? Math.round(Math.sin(p.walkTime * 18)) : 0;

    // legs
    ctx.fillStyle = '#3b2a20';
    ctx.fillRect(x + 2, y + 20, 3, 8 + bob);
    ctx.fillRect(x + 7, y + 20, 3, 8 - bob);
    // batik shirt
    ctx.fillStyle = '#8c3b1f';
    ctx.fillRect(x + 1, y + 10, 10, 11);
    ctx.fillStyle = '#d9a441';
    ctx.fillRect(x + 3, y + 13, 2, 2);
    ctx.fillRect(x + 7, y + 16, 2, 2);
    // arm, swings while mining
    ctx.fillStyle = '#b07a4f';
    const armUp = p.mining ? Math.round(Math.sin(time * 16) * 2) : 0;
    ctx.fillRect(p.facing > 0 ? x + 10 : x - 1, y + 12 + armUp, 3, 6);
    // head
    ctx.fillRect(x + 2, y + 3, 8, 7);
    ctx.fillStyle = '#1f140d';
    ctx.fillRect(p.facing > 0 ? x + 7 : x + 3, y + 6, 2, 2);
    // caping (conical hat)
    ctx.fillStyle = isLocal ? '#d8b56a' : '#b9a27a';
    ctx.beginPath();
    ctx.moveTo(x - 4, y + 4);
    ctx.lineTo(x + 6, y - 2);
    ctx.lineTo(x + 16, y + 4);
    ctx.closePath();
    ctx.fill();
  }

  drawDebug(lines) {
    const ctx = this.ctx;
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    ctx.font = '13px monospace';
    ctx.textBaseline = 'middle';
    const w = Math.max(...lines.map((l) => ctx.measureText(l).width)) + 12;
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(8, 48, w, lines.length * 17 + 6);
    ctx.fillStyle = '#f3e3c3';
    lines.forEach((l, i) => ctx.fillText(l, 14, 59 + i * 17));
  }
}

function mix(a, b, t) {
  const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16));
  const pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
  return `rgb(${pa.map((v, i) => Math.round(v + (pb[i] - v) * t)).join(',')})`;
}
