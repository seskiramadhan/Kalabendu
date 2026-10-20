import { VIEW_W, VIEW_H } from '../core/view.js';
import { buildStageArt } from './parallax.js';
import { Effects } from './effects.js';
import { Hud } from './hud.js';
import { drawFigure } from './sprites/skeleton.js';
import { poseFor, animState } from './sprites/poses.js';
import { drawProp, drawItem, drawProjectile, drawHeldWeapon } from './sprites/objects.js';
import { activeHitbox, hurtbox } from '../combat/hits.js';

const FIG = 120;

// Draws the game into a fixed 480x270 buffer, then scales it to the screen
// with nearest-neighbour pixels. HUD text is drawn afterwards at full size.
export class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { alpha: false });
    this.buffer = document.createElement('canvas');
    this.buffer.width = VIEW_W;
    this.buffer.height = VIEW_H;
    this.bctx = this.buffer.getContext('2d');
    this.fig = document.createElement('canvas');
    this.fig.width = FIG;
    this.fig.height = FIG;
    this.fctx = this.fig.getContext('2d');
    this.effects = new Effects();
    this.hud = new Hud();
    this.touch = false;
    this.art = null;
    this.view = { x: 0, y: 0, scale: 1 };
    this.shake = 0;
  }

  setStage(stage) {
    this.art = buildStageArt(stage);
    this.effects = new Effects();
    this.hud = new Hud();
    this.hud.touch = this.touch;
  }

  resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 3);
    this.canvas.width = Math.round(window.innerWidth * dpr);
    this.canvas.height = Math.round(window.innerHeight * dpr);
    const fit = Math.min(this.canvas.width / VIEW_W, this.canvas.height / VIEW_H);
    // Whole-number scaling is sharpest, but only when it doesn't waste much screen.
    const scale = fit >= 2 && fit - Math.floor(fit) < 0.2 ? Math.floor(fit) : fit;
    const w = Math.round(VIEW_W * scale);
    const h = Math.round(VIEW_H * scale);
    const portrait = this.canvas.height > this.canvas.width * 1.1;
    const top = Math.round(Math.max(60 * dpr, this.canvas.height * 0.1));
    this.view = {
      scale,
      w,
      h,
      x: Math.round((this.canvas.width - w) / 2),
      y: portrait ? Math.min(top, this.canvas.height - h) : Math.round((this.canvas.height - h) / 2),
      dpr,
      portrait,
    };
    return { portrait, stageBottomCss: (this.view.y + h) / dpr };
  }

  draw(game, time, dt, debug) {
    for (const ev of game.events) {
      this.effects.handle(ev);
      this.hud.handle(ev);
      if (ev.type === 'shake') this.shake = Math.max(this.shake, ev.amount);
    }
    this.effects.update(dt);
    this.shake = Math.max(0, this.shake - dt * 18);

    const ctx = this.bctx;
    const camX = Math.round(game.camera.x);
    ctx.drawImage(this.art.sky, 0, 0);
    for (const layer of this.art.layers) {
      ctx.drawImage(layer.canvas, -Math.round(camX * layer.factor), layer.y);
    }

    const sorted = [...game.entities].sort((a, b) => a.y - b.y);
    for (const e of sorted) if (e.kind !== 'projectile') this.drawShadow(ctx, e, camX);
    for (const e of sorted) {
      if (e.kind === 'prop') drawProp(ctx, e, camX, game.time);
      else if (e.kind === 'item') drawItem(ctx, e, camX, time);
      else if (e.kind === 'projectile') drawProjectile(ctx, e, camX, time);
      else this.drawFighter(ctx, e, game, camX, time);
    }
    for (const e of sorted) if (e.kind === 'enemy' && !e.def.boss) this.drawEnemyBar(ctx, e, game, camX);
    this.effects.draw(ctx, camX);
    if (debug) this.drawDebugBoxes(ctx, game, camX);

    const main = this.ctx;
    main.imageSmoothingEnabled = false;
    main.fillStyle = '#120c0a';
    main.fillRect(0, 0, this.canvas.width, this.canvas.height);
    const { x, y, scale } = this.view;
    const sx = this.shake > 0 ? Math.round((Math.random() * 2 - 1) * this.shake) * scale : 0;
    const sy = this.shake > 0 ? Math.round((Math.random() * 2 - 1) * this.shake) * scale : 0;
    main.drawImage(this.buffer, x + sx, y + sy, this.view.w, this.view.h);
    this.hud.draw(main, game, this.view, dt, time);
  }

  drawFighter(ctx, e, game, camX, time) {
    const blinking = (e.invuln > 0 && e.state !== 'dodge') || (e.state === 'dead' && e.t > 0.5);
    if (blinking && Math.floor(time * 20) % 2) return;
    const pose = poseFor(e, time);
    const jitter = game.hitstop > 0 && game.time - e.lastHitAt < 0.15 ? (Math.floor(time * 60) % 2 ? 1 : -1) : 0;
    const size = e.def.size ?? 1;
    const fx = e.x - camX + jitter;
    if (size === 1) {
      const pts = drawFigure(ctx, pose, e.def.look, fx, e.y, e.z, e.facing);
      if (e.weapon) drawHeldWeapon(ctx, pts, e.weapon.id, e.facing);
    } else {
      // Bigger fighters: draw at normal size, then scale up the pixels.
      const f = this.fctx;
      f.clearRect(0, 0, FIG, FIG);
      const pts = drawFigure(f, pose, e.def.look, FIG / 2, FIG - 4, 0, e.facing);
      if (e.weapon) drawHeldWeapon(f, pts, e.weapon.id, e.facing);
      const w = Math.round(FIG * size);
      ctx.drawImage(this.fig, Math.round(fx - w / 2), Math.round(e.y - e.z - (FIG - 4) * size), w, w);
    }
    const headY = e.y - e.z - 70 * size;
    const m = e.move;
    if (m?.telegraph && e.state === 'attack' && e.t < m.startup / 60 && Math.floor(time * 12) % 2) {
      ctx.fillStyle = '#120c0a';
      ctx.fillRect(Math.round(fx - 3), Math.round(headY - 14), 6, 13);
      ctx.fillStyle = '#e8571e';
      ctx.fillRect(Math.round(fx - 2), Math.round(headY - 13), 4, 8);
      ctx.fillRect(Math.round(fx - 2), Math.round(headY - 3), 4, 3);
    }
    if (e.state === 'dizzy') {
      for (let i = 0; i < 3; i++) {
        const a = time * 5 + (i * Math.PI * 2) / 3;
        ctx.fillStyle = '#f2c94c';
        ctx.fillRect(Math.round(fx + Math.cos(a) * 12 - 1), Math.round(headY + Math.sin(a) * 4 - 1), 3, 3);
      }
    }
  }

  drawEnemyBar(ctx, e, game, camX) {
    if (game.time - e.lastHitAt > 2.5 || e.state === 'dead') return;
    const w = 26;
    const x = Math.round(e.x - camX - w / 2);
    const y = Math.round(e.y - e.z - 76);
    ctx.fillStyle = '#120c0a';
    ctx.fillRect(x - 1, y - 1, w + 2, 5);
    ctx.fillStyle = '#5a1a14';
    ctx.fillRect(x, y, w, 3);
    ctx.fillStyle = '#e8571e';
    ctx.fillRect(x, y, Math.round((w * e.hp) / e.def.maxHp), 3);
  }

  drawShadow(ctx, e, camX) {
    const k = Math.max(0.4, 1 - e.z / 120);
    const base = e.kind === 'prop' ? e.def.w / 2 + 2 : e.kind === 'item' ? 7 : 18 * (e.def.size ?? 1);
    ctx.fillStyle = `rgba(30,18,10,${0.45 * k})`;
    const w = Math.round(base * k);
    ctx.fillRect(Math.round(e.x - camX - w), Math.round(e.y - 1), w * 2, 3);
    ctx.fillRect(Math.round(e.x - camX - w + 3), Math.round(e.y - 2), Math.max(0, w * 2 - 6), 5);
  }

  drawDebugBoxes(ctx, game, camX) {
    for (const e of game.entities) {
      const hb = hurtbox(e);
      if (hb) {
        ctx.fillStyle = 'rgba(80,160,255,0.35)';
        ctx.fillRect(Math.round(hb.x0 - camX), Math.round(e.y - hb.z1), Math.round(hb.x1 - hb.x0), Math.round(hb.z1 - hb.z0));
      }
      const ab = activeHitbox(e);
      if (ab) {
        ctx.fillStyle = 'rgba(255,60,40,0.5)';
        ctx.fillRect(Math.round(ab.x0 - camX), Math.round(e.y - ab.z1), Math.round(ab.x1 - ab.x0), Math.round(ab.z1 - ab.z0));
      }
      if (e.kind === 'hero' || e.kind === 'enemy') {
        ctx.fillStyle = '#fff';
        ctx.font = '8px monospace';
        ctx.fillText(animState(e), Math.round(e.x - camX - 14), Math.round(e.y + 10));
      }
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
    ctx.fillRect(8, 110, w, lines.length * 17 + 6);
    ctx.fillStyle = '#f3e3c3';
    lines.forEach((l, i) => ctx.fillText(l, 14, 121 + i * 17));
    ctx.setTransform(1, 0, 0, 1, 0, 0);
  }
}
