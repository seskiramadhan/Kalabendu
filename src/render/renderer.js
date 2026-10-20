import { VIEW_W, VIEW_H } from '../game.js';
import { buildStageArt } from './parallax.js';
import { Effects } from './effects.js';
import { drawFigure } from './sprites/skeleton.js';
import { poseFor, animState } from './sprites/poses.js';
import { FRAME } from '../entities/fighter.js';

// Draws the game into a fixed 480x270 buffer, then scales it to the screen
// with nearest-neighbour pixels.
export class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { alpha: false });
    this.buffer = document.createElement('canvas');
    this.buffer.width = VIEW_W;
    this.buffer.height = VIEW_H;
    this.bctx = this.buffer.getContext('2d');
    this.effects = new Effects();
    this.art = null;
    this.view = { x: 0, y: 0, scale: 1 };
  }

  setStage(stage) {
    this.art = buildStageArt(stage);
  }

  resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 3);
    this.canvas.width = Math.round(window.innerWidth * dpr);
    this.canvas.height = Math.round(window.innerHeight * dpr);
    const fit = Math.min(this.canvas.width / VIEW_W, this.canvas.height / VIEW_H);
    const scale = fit >= 2 ? Math.floor(fit) : fit;
    const w = VIEW_W * scale;
    const h = VIEW_H * scale;
    // Portrait: stage at the top, leaving room below for touch controls.
    const portrait = this.canvas.height > this.canvas.width;
    this.view = {
      scale,
      x: Math.round((this.canvas.width - w) / 2),
      y: portrait ? Math.round(Math.min((this.canvas.height - h) / 2, this.canvas.height * 0.08)) : Math.round((this.canvas.height - h) / 2),
      dpr,
    };
  }

  draw(game, time, dt, debug) {
    for (const ev of game.events) this.effects.handle(ev);
    this.effects.update(dt);

    const ctx = this.bctx;
    const camX = Math.round(game.camera.x);
    ctx.drawImage(this.art.sky, 0, 0);
    for (const layer of this.art.layers) {
      ctx.drawImage(layer.canvas, -Math.round(camX * layer.factor), layer.y);
    }

    const sorted = [...game.entities].sort((a, b) => a.y - b.y);
    for (const e of sorted) this.drawShadow(ctx, e, camX);
    for (const e of sorted) {
      const pose = poseFor(e, time);
      drawFigure(ctx, pose, e.def.look, e.x - camX, e.y, e.z, e.facing);
    }
    this.effects.draw(ctx, camX);
    if (debug) this.drawDebugBoxes(ctx, game, camX);

    const main = this.ctx;
    main.imageSmoothingEnabled = false;
    main.fillStyle = '#120c0a';
    main.fillRect(0, 0, this.canvas.width, this.canvas.height);
    const { x, y, scale } = this.view;
    main.drawImage(this.buffer, x, y, VIEW_W * scale, VIEW_H * scale);
  }

  drawShadow(ctx, e, camX) {
    const k = Math.max(0.4, 1 - e.z / 120);
    ctx.fillStyle = `rgba(30,18,10,${0.45 * k})`;
    const w = Math.round(18 * k);
    ctx.fillRect(Math.round(e.x - camX - w), Math.round(e.y - 1), w * 2, 3);
    ctx.fillRect(Math.round(e.x - camX - w + 3), Math.round(e.y - 2), w * 2 - 6, 5);
  }

  drawDebugBoxes(ctx, game, camX) {
    for (const e of game.entities) {
      ctx.fillStyle = 'rgba(80,160,255,0.35)';
      ctx.fillRect(Math.round(e.x - camX - 10), Math.round(e.y - e.z - 60), 20, 60);
      const m = e.move;
      if (m && (e.state === 'attack' || e.state === 'jumpAttack')) {
        const s = m.startup * FRAME;
        const active = e.state === 'jumpAttack' || (e.t >= s && e.t < s + m.active * FRAME);
        if (!active) continue;
        const h = m.hit;
        const x0 = e.facing > 0 ? e.x + h.x : e.x - h.x - h.w;
        ctx.fillStyle = 'rgba(255,60,40,0.45)';
        ctx.fillRect(Math.round(x0 - camX), Math.round(e.y - e.z - h.z - h.h), h.w, h.h);
      }
      ctx.fillStyle = '#fff';
      ctx.font = '8px monospace';
      ctx.fillText(animState(e), Math.round(e.x - camX - 14), Math.round(e.y + 10));
    }
  }

  drawText(lines) {
    const ctx = this.ctx;
    const dpr = this.view.dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.font = '13px monospace';
    ctx.textBaseline = 'middle';
    const w = Math.max(...lines.map((l) => ctx.measureText(l).width)) + 12;
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(8, 56, w, lines.length * 17 + 6);
    ctx.fillStyle = '#f3e3c3';
    lines.forEach((l, i) => ctx.fillText(l, 14, 67 + i * 17));
    ctx.setTransform(1, 0, 0, 1, 0, 0);
  }
}
