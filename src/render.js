import { TILE, T } from './world.js';

const TILE_COLORS = {
  [T.TANAH]: ['#7a4a2a', '#6b3f23'],
  [T.BATU]: ['#5c5a58', '#4d4b49'],
  [T.RUMPUT]: ['#7a4a2a', '#6b3f23'],
};

export class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { alpha: false });
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
    this.ctx.imageSmoothingEnabled = false;
  }

  get viewW() {
    return this.cssW / this.zoom;
  }

  get viewH() {
    return this.cssH / this.zoom;
  }

  draw(game, camera, localId) {
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
    this.drawTiles(game.world, camX, camY);
    for (const p of game.players.values()) this.drawPlayer(p, p.id === localId);
  }

  drawTiles(world, camX, camY) {
    const ctx = this.ctx;
    const x0 = Math.max(0, Math.floor(camX / TILE));
    const y0 = Math.max(0, Math.floor(camY / TILE));
    const x1 = Math.min(world.w - 1, Math.floor((camX + this.viewW) / TILE));
    const y1 = Math.min(world.h - 1, Math.floor((camY + this.viewH) / TILE));

    for (let y = y0; y <= y1; y++) {
      for (let x = x0; x <= x1; x++) {
        const id = world.get(x, y);
        if (id === T.AIR) continue;
        const [a, b] = TILE_COLORS[id];
        const px = x * TILE;
        const py = y * TILE;
        ctx.fillStyle = (x + y) & 1 ? a : b;
        ctx.fillRect(px, py, TILE, TILE);
        if (id === T.RUMPUT) {
          ctx.fillStyle = '#4f9a3a';
          ctx.fillRect(px, py, TILE, 5);
          ctx.fillStyle = '#6cbf4a';
          ctx.fillRect(px, py, TILE, 2);
        }
      }
    }
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
    // head
    ctx.fillStyle = '#b07a4f';
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
    ctx.fillRect(8, 8, 74, 22);
    ctx.fillStyle = '#f3e3c3';
    ctx.font = '14px monospace';
    ctx.textBaseline = 'middle';
    ctx.fillText(`FPS ${fps}`, 14, 19);
  }
}
