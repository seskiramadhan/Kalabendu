import { t, getLang, setLang } from '../core/i18n.js';
import { HEROES, ROSTER, HERO_UNLOCKS } from '../entities/heroes.js';
import { drawFigure } from '../render/sprites/skeleton.js';
import { POSES } from '../render/sprites/poses.js';
import { ERAS, eraOf } from '../systems/era.js';
import { SHOP_ITEMS, priceOf, canBuy, ownedCount, inflation } from '../systems/economy.js';

// Title / main menu, character select and settings, as DOM overlays.
export class Screens {
  constructor(root, handlers) {
    this.h = handlers;
    this.el = document.createElement('div');
    this.el.className = 'screens';
    this.el.hidden = true;
    root.append(this.el);
    this.current = null;
  }

  get isOpen() {
    return !this.el.hidden;
  }

  show(name) {
    this.current = name;
    this.el.hidden = false;
    this.render();
  }

  hide() {
    this.el.hidden = true;
    this.current = null;
  }

  back() {
    if (this.current && this.current !== 'title') this.show('title');
  }

  render() {
    const save = this.h.getSave();
    this.el.innerHTML = '';
    if (this.current === 'title') this.renderTitle(save);
    else if (this.current === 'heroes') this.renderHeroes(save);
    else if (this.current === 'settings') this.renderSettings(save);
    else if (this.current === 'stages') this.renderStages(save);
    else if (this.current === 'shop') this.renderShop(save);
    this.el.querySelector('button:not(:disabled)')?.focus({ preventScroll: true });
  }

  renderTitle(save) {
    const wrap = div('title-screen');
    const art = document.createElement('canvas');
    art.width = 120;
    art.height = 150;
    art.className = 'gunungan';
    drawGunungan(art.getContext('2d'));
    const logo = div('logo');
    logo.append(art, h('h1', 'KALABENDU'), h('p', t('tagline'), 'tagline'));
    const panel = div('menu-panel batik-frame title-menu');
    panel.append(
      btn(t('start'), () => this.h.onStart(), 'primary'),
      btn(save.started ? `${t('continueGame')} · Rp ${save.rupiah.toLocaleString('id-ID')}` : t('continueGame'), () => this.h.onContinue(), '', !save.started),
      btn(t('stageSelect'), () => this.show('stages'), '', !save.started),
      btn(t('heroSelect'), () => this.show('heroes')),
      btn(t('settings'), () => this.show('settings')),
    );
    wrap.append(logo, panel, h('div', t('menuNavHint'), 'muted small nav-hint'));
    this.el.append(wrap);
  }

  renderShop(save) {
    const panel = div('menu-panel batik-frame shop-panel');
    panel.append(h('h2', t('shopTitle')));
    const rise = Math.round((inflation(save) - 1) * 100);
    panel.append(h('div', `Rp ${save.rupiah.toLocaleString('id-ID')}`, 'shop-money'), h('div', rise > 0 ? t('shopInflation').replace('{n}', rise) : t('shopNoInflation'), 'muted small'));
    for (const item of SHOP_ITEMS) {
      const owned = ownedCount(item, save);
      const max = item.max ?? 1;
      const card = btn('', () => {
        if (this.h.onBuy(item)) this.render();
      }, 'shop-card', !canBuy(item, save));
      card.append(
        h('b', `${t(item.nameKey)}${max > 1 ? ` (${owned}/${max})` : owned ? ' ✓' : ''}`),
        h('span', t(item.descKey), 'muted'),
        h('span', owned >= max ? t('shopOwned') : `Rp ${priceOf(item, save).toLocaleString('id-ID')}`, 'shop-price'),
      );
      panel.append(card);
    }
    panel.append(btn(t('shopDone'), () => this.h.onShopDone(), 'primary'));
    this.el.append(center(panel));
  }

  renderStages(save) {
    const panel = div('menu-panel batik-frame stage-panel');
    panel.append(h('h2', t('stageSelect')));
    const era = eraOf(save.era);
    const meter = div('era-meter');
    const fill = div('era-fill');
    fill.style.width = `${save.era}%`;
    meter.append(fill);
    panel.append(h('div', `${t('worldEra')}: ${t(era.nameKey)} (${Math.round(save.era)})`, 'era-name'), meter);
    const labels = div('era-labels');
    for (const e of ERAS) labels.append(h('span', t(e.nameKey)));
    panel.append(labels);
    for (const s of this.h.getStages()) {
      const card = btn('', () => this.h.onPickStage(s.id), 'stage-card', !s.unlocked);
      card.append(h('b', t(s.stage.nameKey)), h('span', s.unlocked ? t(s.stage.subtitleKey) : t('locked'), 'muted'));
      if (s.best) card.append(h('span', `${t('best')} ${s.best}`, 'muted'));
      panel.append(card);
    }
    panel.append(btn(t('back'), () => this.show('title')));
    this.el.append(center(panel));
  }

  renderHeroes(save) {
    const panel = div('menu-panel batik-frame hero-panel');
    panel.append(h('h2', t('heroSelect')));
    const grid = div('hero-grid');
    for (const r of ROSTER) {
      const unlocked = save.heroes.includes(r.id);
      const card = document.createElement('button');
      card.type = 'button';
      card.className = 'hero-card' + (save.hero === r.id ? ' active' : '') + (unlocked ? '' : ' locked');
      card.disabled = !unlocked;
      const c = document.createElement('canvas');
      c.width = 64;
      c.height = 80;
      const ctx = c.getContext('2d');
      const look = HEROES[r.id]?.look ?? silhouette();
      drawFigure(ctx, POSES.stance, unlocked ? look : silhouette(), 30, 76, 0, 1);
      card.append(c, h('b', t(r.nameKey ?? HEROES[r.id].nameKey)), h('span', unlocked ? t(r.descKey) : t('unlockAfter').replace('{stage}', t(`${HERO_UNLOCKS[r.id]}_name`)), 'muted'));
      if (unlocked) card.addEventListener('click', () => this.h.onPickHero(r.id));
      grid.append(card);
    }
    panel.append(grid, btn(t('back'), () => this.show('title')));
    this.el.append(center(panel));
  }

  renderSettings(save) {
    const s = save.settings;
    const panel = div('menu-panel batik-frame');
    panel.append(h('h2', t('settings')));

    const lang = div('menu-row');
    lang.append(h('span', t('language')));
    for (const [code, label] of [['id', 'Bahasa Indonesia'], ['en', 'English']]) {
      lang.append(btn(label, () => {
        setLang(code);
        this.h.onLanguage();
        this.render();
      }, code === getLang() ? 'chip active' : 'chip'));
    }

    const vol = div('menu-row');
    const range = document.createElement('input');
    range.type = 'range';
    range.min = '0';
    range.max = '1';
    range.step = '0.1';
    range.value = String(s.volume);
    range.addEventListener('input', () => this.h.onSetting('volume', Number(range.value)));
    vol.append(h('span', t('volume')), range);

    const toggle = (key, label) => {
      const row = div('menu-row');
      row.append(h('span', t(label)));
      row.append(btn(s[key] ? t('on') : t('off'), () => {
        this.h.onSetting(key, !s[key]);
        this.render();
      }, s[key] ? 'chip active' : 'chip'));
      return row;
    };

    const size = div('menu-row');
    size.append(h('span', t('buttonSize')));
    for (const v of ['small', 'normal', 'large']) {
      size.append(btn(t('size_' + v), () => {
        this.h.onSetting('buttons', v);
        this.render();
      }, s.buttons === v ? 'chip active' : 'chip'));
    }

    const pad2 = div('menu-row desktop-only');
    pad2.append(h('span', t('p2pad')));
    for (const v of [1, 0]) {
      pad2.append(btn(t('p2pad_' + v), () => {
        this.h.onSetting('p2pad', v);
        this.render();
      }, (s.p2pad ?? 1) === v ? 'chip active' : 'chip'));
    }

    panel.append(lang, vol, toggle('vibrate', 'vibrate'), toggle('tips', 'tips'), size, pad2,
      btn(t('resetData'), () => {
        if (confirm(t('resetConfirm'))) {
          this.h.onReset();
          this.render();
        }
      }, 'danger'),
      btn(t('back'), () => this.show('title')));
    this.el.append(center(panel));
  }
}

function silhouette() {
  const k = '#0c0806';
  return { skin: k, top: k, pants: k, sleeve: k, clothLight: k, sash: k, headgear: 'none', hair: k };
}

// Wayang gunungan (kayon): the tree-of-life shape that opens a shadow play.
function drawGunungan(ctx) {
  const w = 120;
  const hgt = 150;
  const cx = w / 2;
  const shape = () => {
    ctx.beginPath();
    ctx.moveTo(cx, 4);
    ctx.bezierCurveTo(cx + 30, 30, cx + 58, 80, cx + 54, 128);
    ctx.lineTo(cx + 40, 146);
    ctx.lineTo(cx - 40, 146);
    ctx.lineTo(cx - 54, 128);
    ctx.bezierCurveTo(cx - 58, 80, cx - 30, 30, cx, 4);
    ctx.closePath();
  };
  ctx.clearRect(0, 0, w, hgt);
  shape();
  ctx.fillStyle = '#1a100b';
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = '#e0b252';
  ctx.stroke();
  ctx.save();
  shape();
  ctx.clip();
  ctx.strokeStyle = '#a4452a';
  ctx.lineWidth = 2;
  // trunk and branches
  ctx.beginPath();
  ctx.moveTo(cx, 120);
  ctx.lineTo(cx, 22);
  for (let i = 0; i < 6; i++) {
    const y = 104 - i * 14;
    const spread = 14 + (5 - i) * 6;
    ctx.moveTo(cx, y);
    ctx.quadraticCurveTo(cx + spread * 0.6, y - 10, cx + spread, y - 4);
    ctx.moveTo(cx, y);
    ctx.quadraticCurveTo(cx - spread * 0.6, y - 10, cx - spread, y - 4);
  }
  ctx.stroke();
  ctx.fillStyle = '#e0b252';
  for (let i = 0; i < 26; i++) {
    const a = i * 2.4;
    const r = 8 + (i % 7) * 5;
    ctx.fillRect(Math.round(cx + Math.cos(a) * r * 0.9), Math.round(70 - Math.sin(a) * r * 1.1), 2, 2);
  }
  // the gate at the foot
  ctx.fillStyle = '#6b3f23';
  ctx.fillRect(cx - 18, 118, 36, 28);
  ctx.fillStyle = '#e0b252';
  ctx.fillRect(cx - 14, 124, 12, 22);
  ctx.fillRect(cx + 2, 124, 12, 22);
  ctx.fillStyle = '#1a100b';
  ctx.fillRect(cx - 1, 124, 2, 22);
  ctx.restore();
}

function div(cls) {
  const e = document.createElement('div');
  e.className = cls;
  return e;
}

function center(child) {
  const c = div('screen-center');
  c.append(child);
  return c;
}

function h(tag, text, cls) {
  const e = document.createElement(tag);
  e.textContent = text;
  if (cls) e.className = cls;
  return e;
}

function btn(label, onClick, cls = '', disabled = false) {
  const b = document.createElement('button');
  b.type = 'button';
  b.textContent = label;
  b.className = 'menu-btn ' + cls;
  b.disabled = disabled;
  if (onClick) b.addEventListener('click', onClick);
  return b;
}

// Moves focus between visible buttons with arrows / d-pad.
export function navigate(container, dir) {
  const items = [...container.querySelectorAll('button:not(:disabled), input')].filter((e) => e.offsetParent !== null);
  if (!items.length) return;
  const i = items.indexOf(document.activeElement);
  const next = i < 0 ? 0 : (i + dir + items.length) % items.length;
  items[next].focus({ preventScroll: true });
}
