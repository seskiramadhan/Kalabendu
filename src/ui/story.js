import { t } from '../core/i18n.js';
import { SPEAKERS } from '../story/story.js';
import { drawWayang } from '../story/wayang.js';
import { HEROES } from '../entities/heroes.js';
import { drawFigure } from '../render/sprites/skeleton.js';
import { POSES } from '../render/sprites/poses.js';

// Story scenes between stages: wayang pictures with narration, dialogue
// with portraits, and the Pejabat's bribe choice.
export class Story {
  constructor(root) {
    this.el = document.createElement('div');
    this.el.className = 'story';
    this.el.hidden = true;
    root.append(this.el);
    this.lines = [];
    this.i = 0;
    this.raf = 0;
  }

  get isOpen() {
    return !this.el.hidden;
  }

  play(lines, { onDone, onBribe }) {
    this.lines = lines;
    this.i = 0;
    this.onDone = onDone;
    this.onBribe = onBribe;
    this.el.hidden = false;
    this.show();
  }

  close() {
    cancelAnimationFrame(this.raf);
    this.el.hidden = true;
    this.onDone?.();
  }

  next() {
    this.i++;
    if (this.i >= this.lines.length) this.close();
    else this.show();
  }

  // Skip jumps to the bribe choice if the scene has one: it must be answered.
  skip() {
    const bribe = this.lines.findIndex((l, k) => k > this.i && l.bribe);
    if (bribe >= 0) {
      this.i = bribe;
      this.show();
    } else this.close();
  }

  show() {
    cancelAnimationFrame(this.raf);
    const line = this.lines[this.i];
    this.el.innerHTML = '';
    const box = div('story-box batik-frame');
    if (line.wayang) {
      const c = document.createElement('canvas');
      c.width = 480;
      c.height = 200;
      c.className = 'wayang';
      const ctx = c.getContext('2d');
      const start = performance.now();
      const loop = (now) => {
        drawWayang(ctx, line.wayang, 480, 200, (now - start) / 1000);
        this.raf = requestAnimationFrame(loop);
      };
      this.raf = requestAnimationFrame(loop);
      box.append(c, h('div', t('sp_dalang'), 'speaker'), h('p', t(line.textKey), 'line'));
    } else if (line.speaker) {
      const sp = SPEAKERS[line.speaker];
      const row = div('dialogue');
      row.append(portrait(sp), wrap(h('div', t(sp.nameKey), 'speaker'), h('p', t(line.textKey), 'line')));
      box.append(row);
    } else if (line.bribe) {
      box.append(this.bribeChoice(line.bribe));
    }
    const nav = div('story-nav');
    if (!line.bribe) {
      nav.append(btn(t('skip'), () => this.skip(), 'chip'), btn(`${t('storyNext')} ▶`, () => this.next(), 'primary'));
    }
    box.append(nav);
    this.el.append(box);
    (box.querySelector('.primary') ?? box.querySelector('button'))?.focus({ preventScroll: true });
  }

  bribeChoice(amount) {
    const wrapEl = div('bribe');
    const envelope = h('div', `✉ Rp ${amount.toLocaleString('id-ID')}`, 'envelope');
    wrapEl.append(h('div', t('bribeTitle'), 'speaker'), envelope);
    const accept = btn(t('bribeAccept'), () => {
      this.onBribe?.(true, amount);
      this.next();
    }, 'danger');
    accept.append(h('small', t('bribeAcceptDesc')));
    const refuse = btn(t('bribeRefuse'), () => {
      this.onBribe?.(false, amount);
      this.next();
    }, 'primary');
    refuse.append(h('small', t('bribeRefuseDesc')));
    const row = div('bribe-row');
    row.append(refuse, accept);
    wrapEl.append(row);
    return wrapEl;
  }
}

function portrait(sp) {
  const look = sp.hero ? HEROES[sp.hero].look : sp.look;
  const tmp = document.createElement('canvas');
  tmp.width = 64;
  tmp.height = 100;
  drawFigure(tmp.getContext('2d'), POSES.stance, look, 30, 96, 0, 1);
  const c = document.createElement('canvas');
  c.width = 40;
  c.height = 40;
  c.className = 'portrait';
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#3a2619';
  ctx.fillRect(0, 0, 40, 40);
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(tmp, 12, 20, 40, 40, 0, 0, 40, 40);
  return c;
}

function div(cls) {
  const e = document.createElement('div');
  e.className = cls;
  return e;
}

function wrap(...children) {
  const e = div('dialogue-text');
  e.append(...children);
  return e;
}

function h(tag, text, cls) {
  const e = document.createElement(tag);
  e.textContent = text;
  if (cls) e.className = cls;
  return e;
}

function btn(label, onClick, cls = '') {
  const b = document.createElement('button');
  b.type = 'button';
  b.textContent = label;
  b.className = 'menu-btn ' + cls;
  b.addEventListener('click', onClick);
  return b;
}
