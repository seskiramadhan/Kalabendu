import { t } from '../core/i18n.js';

const TUTORIAL_TIME = 7;

// Drawn on the full-resolution canvas, aligned to the stage rectangle, so
// text stays sharp. u = screen pixels per game pixel.
export class Hud {
  constructor() {
    this.tutorial = null;
    this.tutorialTime = 0;
    this.touch = false;
    this.bossShown = false;
  }

  handle(ev) {
    if (ev.type === 'tutorial') {
      const touchKey = ev.key + '_touch';
      this.tutorial = this.touch && t(touchKey) !== touchKey ? touchKey : ev.key;
      this.tutorialTime = TUTORIAL_TIME;
    }
  }

  draw(ctx, game, view, dt, time) {
    this.tutorialTime = Math.max(0, this.tutorialTime - dt);
    const u = view.scale;
    const X = (v) => Math.round(view.x + v * u);
    const Y = (v) => Math.round(view.y + v * u);
    ctx.save();
    ctx.textBaseline = 'middle';

    const hero = game.heroes.get('p1');
    if (hero) this.drawHeroPanel(ctx, hero, game, X, Y, u);
    if (game.boss && !game.boss.entering && game.boss.state !== 'dead' && game.boss.hp > 0) this.drawBossBar(ctx, game.boss, X, Y, u);
    if (game.go && Math.floor(time * 3) % 2 === 0) this.drawGo(ctx, X, Y, u);
    if (this.tutorialTime > 0 && this.tutorial) this.drawTutorial(ctx, X, Y, u);
    if (game.cleared) this.drawClear(ctx, game, X, Y, u);
    ctx.restore();
  }

  drawHeroPanel(ctx, hero, game, X, Y, u) {
    batikBox(ctx, X(6), Y(6), 120 * u, 30 * u, u);
    // portrait: Bayu's face with udeng
    ctx.fillStyle = '#3a2619';
    ctx.fillRect(X(10), Y(10), 22 * u, 22 * u);
    ctx.fillStyle = hero.def.look.skin;
    ctx.fillRect(X(14), Y(15), 14 * u, 14 * u);
    ctx.fillStyle = hero.def.look.udeng ?? '#444';
    ctx.fillRect(X(13), Y(13), 16 * u, 5 * u);
    ctx.fillStyle = '#120c0a';
    ctx.fillRect(X(23), Y(21), 2 * u, 2 * u);

    ctx.fillStyle = '#f3e3c3';
    ctx.font = `bold ${Math.round(8 * u)}px system-ui, sans-serif`;
    ctx.fillText(t(hero.def.nameKey).toUpperCase(), X(36), Y(13));
    bar(ctx, X(36), Y(18), 84 * u, 5 * u, hero.hp / hero.def.maxHp, '#4aa03c', u);
    ctx.font = `${Math.round(6.5 * u)}px system-ui, sans-serif`;
    ctx.fillStyle = '#e0b252';
    ctx.fillText(`${t('score')} ${String(game.score).padStart(6, '0')}`, X(36), Y(29));
    ctx.fillText(`Rp ${game.rupiah.toLocaleString('id-ID')}`, X(88), Y(29));
  }

  drawBossBar(ctx, boss, X, Y, u) {
    const w = 220;
    batikBox(ctx, X(240 - w / 2 - 4), Y(244), (w + 8) * u, 20 * u, u);
    ctx.fillStyle = '#f3e3c3';
    ctx.font = `bold ${Math.round(7 * u)}px system-ui, sans-serif`;
    ctx.fillText(t(boss.def.nameKey).toUpperCase(), X(240 - w / 2), Y(251));
    bar(ctx, X(240 - w / 2), Y(256), w * u, 4 * u, boss.hp / boss.def.maxHp, '#e8571e', u);
  }

  drawGo(ctx, X, Y, u) {
    ctx.fillStyle = '#f2c94c';
    ctx.strokeStyle = '#120c0a';
    ctx.lineWidth = 2 * u;
    ctx.font = `900 ${Math.round(16 * u)}px system-ui, sans-serif`;
    const label = t('go');
    ctx.strokeText(label, X(380), Y(110));
    ctx.fillText(label, X(380), Y(110));
    ctx.beginPath();
    ctx.moveTo(X(440), Y(100));
    ctx.lineTo(X(458), Y(110));
    ctx.lineTo(X(440), Y(120));
    ctx.closePath();
    ctx.stroke();
    ctx.fill();
  }

  drawTutorial(ctx, X, Y, u) {
    const text = t(this.tutorial);
    ctx.font = `bold ${Math.round(7.5 * u)}px system-ui, sans-serif`;
    const lines = wrap(ctx, text, 300 * u);
    const h = (lines.length * 10 + 8) * u;
    const w = Math.max(...lines.map((l) => ctx.measureText(l).width)) + 16 * u;
    const x = X(240) - w / 2;
    const y = Y(46);
    const alpha = Math.min(1, this.tutorialTime * 2);
    ctx.globalAlpha = alpha;
    batikBox(ctx, x, y, w, h, u);
    ctx.fillStyle = '#f3e3c3';
    ctx.textAlign = 'center';
    lines.forEach((l, i) => ctx.fillText(l, X(240), y + (9 + i * 10) * u));
    ctx.textAlign = 'left';
    ctx.globalAlpha = 1;
  }

  drawClear(ctx, game, X, Y, u) {
    ctx.fillStyle = 'rgba(18,12,10,0.55)';
    ctx.fillRect(X(0), Y(80), 480 * u, 90 * u);
    ctx.textAlign = 'center';
    ctx.fillStyle = '#f2c94c';
    ctx.strokeStyle = '#120c0a';
    ctx.lineWidth = 3 * u;
    ctx.font = `900 ${Math.round(22 * u)}px system-ui, sans-serif`;
    ctx.strokeText(t('stage0_clear'), X(240), Y(108));
    ctx.fillText(t('stage0_clear'), X(240), Y(108));
    ctx.font = `bold ${Math.round(9 * u)}px system-ui, sans-serif`;
    ctx.fillStyle = '#f3e3c3';
    ctx.fillText(`${t('score')} ${game.score}  ·  Rp ${game.rupiah.toLocaleString('id-ID')}`, X(240), Y(130));
    ctx.font = `${Math.round(7 * u)}px system-ui, sans-serif`;
    ctx.fillText(t('stage0_clear_sub'), X(240), Y(146));
    ctx.textAlign = 'left';
  }
}

function bar(ctx, x, y, w, h, k, color, u) {
  ctx.fillStyle = '#120c0a';
  ctx.fillRect(x - u, y - u, w + 2 * u, h + 2 * u);
  ctx.fillStyle = '#5a1a14';
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = color;
  ctx.fillRect(x, y, Math.max(0, w * k), h);
  ctx.fillStyle = 'rgba(255,255,255,0.25)';
  ctx.fillRect(x, y, Math.max(0, w * k), Math.max(1, h * 0.3));
}

// Small batik frame: brown box with a dotted gold-and-terracotta border.
function batikBox(ctx, x, y, w, h, u) {
  ctx.fillStyle = 'rgba(43,29,20,0.88)';
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = '#6b3f23';
  ctx.fillRect(x, y, w, u * 2);
  ctx.fillRect(x, y + h - u * 2, w, u * 2);
  ctx.fillRect(x, y, u * 2, h);
  ctx.fillRect(x + w - u * 2, y, u * 2, h);
  const step = 6 * u;
  for (let i = 0; i * step < w; i++) {
    ctx.fillStyle = i % 2 ? '#a4452a' : '#e0b252';
    ctx.fillRect(x + i * step + u * 2, y + u * 0.5, u, u);
    ctx.fillRect(x + i * step + u * 2, y + h - u * 1.5, u, u);
  }
}

function wrap(ctx, text, maxW) {
  const words = text.split(' ');
  const lines = [];
  let line = '';
  for (const w of words) {
    const test = line ? line + ' ' + w : w;
    if (ctx.measureText(test).width > maxW && line) {
      lines.push(line);
      line = w;
    } else line = test;
  }
  if (line) lines.push(line);
  return lines;
}
