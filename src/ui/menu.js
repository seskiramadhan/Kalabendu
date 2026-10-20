import { t, getLang, setLang } from '../core/i18n.js';

const CHECK_EVERY_MS = 5 * 60 * 1000;

export async function fetchVersion() {
  try {
    const res = await fetch('version.json', { cache: 'no-store' });
    return res.ok ? await res.json() : null;
  } catch {
    return null;
  }
}

export class Menu {
  constructor(root, { running, onResume, onRestart, onQuit, onLanguage }) {
    this.running = running;
    this.latest = null;
    this.isOpen = false;
    this.handlers = { onResume, onRestart, onQuit, onLanguage };

    this.button = document.createElement('button');
    this.button.type = 'button';
    this.button.className = 'menu-button';
    this.button.addEventListener('click', () => this.toggle());

    this.overlay = document.createElement('div');
    this.overlay.className = 'menu-overlay';
    this.overlay.hidden = true;
    this.overlay.addEventListener('pointerdown', (e) => {
      if (e.target === this.overlay) this.close();
    });

    root.append(this.button, this.overlay);
    this.render();
    this.checkForUpdate();
    setInterval(() => this.checkForUpdate(), CHECK_EVERY_MS);
  }

  get hasUpdate() {
    return !!(this.latest && this.running && this.latest.version !== this.running.version);
  }

  async checkForUpdate() {
    const v = await fetchVersion();
    if (v) this.latest = v;
    this.render();
  }

  toggle() {
    this.isOpen ? this.close() : this.open();
  }

  open() {
    this.isOpen = true;
    this.overlay.hidden = false;
    this.render();
    this.checkForUpdate();
  }

  close() {
    if (!this.isOpen) return;
    this.isOpen = false;
    this.overlay.hidden = true;
    this.handlers.onResume();
  }

  render() {
    this.button.textContent = '☰';
    this.button.classList.toggle('has-update', this.hasUpdate);
    this.button.title = t('menu');
    if (!this.isOpen) return;

    const lang = getLang();
    const running = this.running?.version ?? '?';
    const notes = (this.hasUpdate ? this.latest : this.running)?.notes?.[lang] ?? [];

    this.overlay.innerHTML = '';
    const panel = div('menu-panel batik-frame');
    panel.append(h('h2', t('menuTitle')));

    panel.append(
      btn(t('resume'), () => this.close(), 'primary'),
      btn(t('restart'), () => {
        if (confirm(t('restartConfirm'))) this.handlers.onRestart();
      }),
      btn(t('mainMenu'), () => this.handlers.onQuit()),
    );

    const langRow = div('menu-row');
    langRow.append(h('span', t('language')));
    for (const [code, label] of [['id', 'Bahasa Indonesia'], ['en', 'English']]) {
      const b = btn(label, () => {
        setLang(code);
        this.handlers.onLanguage();
        this.render();
      }, code === lang ? 'chip active' : 'chip');
      langRow.append(b);
    }
    panel.append(langRow);

    const upd = div('menu-update');
    upd.append(h('div', `${t('version')} ${running}`, 'muted'));
    if (this.hasUpdate) {
      upd.append(
        h('div', `${t('updateAvailable')} ${this.latest.version}`, 'update-title'),
        btn(t('updateNow'), () => location.reload(), 'primary update'),
      );
    } else {
      upd.append(btn(t('checkUpdate'), () => this.checkForUpdate().then(() => {
        if (!this.hasUpdate) this.flash(t('upToDate'));
      })));
    }
    if (notes.length) {
      const ul = document.createElement('ul');
      for (const n of notes) ul.append(h('li', n));
      upd.append(h('div', t('whatsNew'), 'muted'), ul);
    }
    this.flashEl = h('div', '', 'flash');
    upd.append(this.flashEl);
    panel.append(upd, h('div', t('menuHint'), 'muted small'));
    this.overlay.append(panel);
    panel.querySelector('button')?.focus({ preventScroll: true });
  }

  flash(text) {
    if (!this.flashEl) return;
    this.flashEl.textContent = text;
    setTimeout(() => this.flashEl && (this.flashEl.textContent = ''), 2500);
  }
}

function div(cls) {
  const e = document.createElement('div');
  e.className = cls;
  return e;
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
