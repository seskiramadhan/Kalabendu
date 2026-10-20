import { TILE } from './world.js';
import { T } from './tiles.js';
import { buildAtlas, variantAt } from './textures.js';

export class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { alpha: false });
    this.atlas = buildAtlas();
    this.zoom = 2;
    this.dpr = 1;
    this.cssW = 0;
    this.cssH = 0;
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
  draw(game, camera, localId, hover) {
    const ctx = this.ctx;
    const scale = this.dpr * this.zoom;
    const camX = Math.round(camera.x * scale) / scale;
    const camY = Math.round(camera.y * scale) / scale;

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    const sky = ctx.createLinearGradient(0, 0, 0, this.canvas.height);
    sky.addColorStop(0, '#8ec5e8');
    sky.addColorStop(1, '#f2d9a8');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    ctx.setTransform(scale, 0, 0, scale, -camX * scale, -camY * scale);
    ctx.imageSmoothingEnabled = false;
    this.drawTiles(game.world, camX, camY);
    for (const p of game.players.values()) this.drawPlayer(p, p.id === localId);

    const local = game.players.get(localId);
    if (local?.mining) this.drawCrack(local.mining);
    if (hover) this.drawHover(hover);
  }

  drawTiles(world, camX, camY) {
    const ctx = this.ctx;
    const atlas = this.atlas;
    const x0 = Math.max(0, Math.floor(camX / TILE));
    const y0 = Math.max(0, Math.floor(camY / TILE));
    const x1 = Math.min(world.w - 1, Math.floor((camX + this.viewW) / TILE));
    const y1 = Math.min(world.h - 1, Math.floor((camY + this.viewH) / TILE));

    for (let y = y0; y <= y1; y++) {
      for (let x = x0; x <= x1; x++) {
        const id = world.get(x, y);
        if (id === T.AIR) continue;
        ctx.drawImage(atlas, variantAt(x, y) * TILE, id * TILE, TILE, TILE, x * TILE, y * TILE, TILE, TILE);
      }
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

  drawPlayer(p, isLocal) {
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
    const armUp = p.mining ? Math.round(Math.sin(performance.now() / 60) * 2) : 0;
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

  drawFps(fps) {
    const ctx = this.ctx;
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(8, 48, 74, 22);
    ctx.fillStyle = '#f3e3c3';
    ctx.font = '14px monospace';
    ctx.textBaseline = 'middle';
    ctx.fillText(`FPS ${fps}`, 14, 59);
  }
}
