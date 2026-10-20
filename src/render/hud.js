import { t } from '../core/i18n.js';

const TUTORIAL_TIME = 7;
const TARGET_TIME = 3;
const BOSS_LAYER_HP = 100;
const LAYER_COLORS = ['#f2c94c', '#f08a2a', '#e0402a', '#b02a6a'];

// Drawn on the full-resolution canvas, aligned to the stage rectangle, so
// text stays sharp. u = screen pixels per game pixel.
export class Hud {
  constructor() {
    this.tutorial = null;
    this.tutorialTime = 0;
    this.touch = false;
    this.target = null;
    this.targetTime = 0;
    this.trailHp = 0;
  }

  handle(ev) {
    // Streets of Rage style: the last enemy you hit shows under your panel.
    if (ev.type === 'hit' && ev.target?.kind === 'enemy' && ev.attacker && isHeroSide(ev.attacker)) {
      if (this.target !== ev.target) this.trailHp = ev.target.hp + (ev.damage ?? 0);
      this.target = ev.target;
      this.targetTime = TARGET_TIME;
    }
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
    this.updateTarget(game, dt);
    if (this.target) this.drawTargetBar(ctx, this.target, X, Y, u);
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

  updateTarget(game, dt) {
    const boss = game.boss;
    const bossActive = boss && !boss.entering && boss.state !== 'dead' && !boss.killed;
    // A boss in the fight stays pinned; regular enemies fade after a few seconds.
    if (bossActive && (!this.target || this.target === boss || this.targetTime <= 0)) {
      if (this.target !== boss) this.trailHp = boss.hp;
      this.target = boss;
      this.targetTime = TARGET_TIME;
    }
    if (!this.target) return;
    this.targetTime -= dt;
    const e = this.target;
    this.trailHp = Math.max(e.hp, this.trailHp - Math.max(8, (this.trailHp - e.hp) * 3) * dt);
    const gone = e.killed && this.trailHp <= e.hp + 0.5;
    if (this.targetTime <= -0.4 || (gone && this.targetTime < TARGET_TIME - 0.8)) this.target = null;
  }

  drawTargetBar(ctx, e, X, Y, u) {
    const fade = Math.max(0, Math.min(1, (this.targetTime + 0.4) / 0.4));
    ctx.globalAlpha = fade;
    const w = 112;
    batikBox(ctx, X(6), Y(38), (w + 8) * u, 19 * u, u);
    ctx.fillStyle = '#f3e3c3';
    ctx.font = `bold ${Math.round(6.5 * u)}px system-ui, sans-serif`;
    ctx.fillText(t(e.def.nameKey).toUpperCase(), X(10), Y(44));

    const max = e.def.maxHp;
    const layered = e.def.boss && max > BOSS_LAYER_HP;
    const per = layered ? BOSS_LAYER_HP : max;
    const hpLayer = Math.max(0, Math.ceil(e.hp / per) - 1);
    const inLayer = e.hp <= 0 ? 0 : (e.hp - hpLayer * per) / per;
    const trailLayer = Math.max(0, Math.ceil(this.trailHp / per) - 1);
    const trailIn = trailLayer > hpLayer ? 1 : this.trailHp <= 0 ? 0 : (this.trailHp - hpLayer * per) / per;
    const x = X(10);
    const y = Y(49);
    const bw = w * u;
    const bh = 4 * u;
    ctx.fillStyle = '#120c0a';
    ctx.fillRect(x - u, y - u, bw + 2 * u, bh + 2 * u);
    // under this layer: the next layer's colour (or empty)
    ctx.fillStyle = layered && hpLayer > 0 ? LAYER_COLORS[(hpLayer - 1) % LAYER_COLORS.length] : '#3a1410';
    ctx.fillRect(x, y, bw, bh);
    ctx.fillStyle = '#f6f2e4';
    ctx.fillRect(x, y, bw * trailIn, bh);
    ctx.fillStyle = layered ? LAYER_COLORS[hpLayer % LAYER_COLORS.length] : enemyColor(inLayer);
    ctx.fillRect(x, y, bw * inLayer, bh);
    ctx.fillStyle = 'rgba(255,255,255,0.25)';
    ctx.fillRect(x, y, bw * inLayer, Math.max(1, bh * 0.3));
    if (layered && hpLayer > 0) {
      ctx.fillStyle = '#f2c94c';
      ctx.font = `900 ${Math.round(7 * u)}px system-ui, sans-serif`;
      ctx.textAlign = 'right';
      ctx.fillText(`x${hpLayer + 1}`, X(122), Y(44));
      ctx.textAlign = 'left';
    }
    ctx.globalAlpha = 1;
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
    const y = Y(64);
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

function isHeroSide(e) {
  return e.team === 'hero' || e.thrown || (e.kind === 'projectile' && e.team === 'hero');
}

// Yellow when healthy, through orange, to red when nearly beaten.
function enemyColor(k) {
  if (k > 0.5) return '#f2c94c';
  if (k > 0.25) return '#f08a2a';
  return '#e0402a';
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
