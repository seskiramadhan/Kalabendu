import { BTN } from './input.js';
import { t } from './i18n.js';

const DEAD = 0.3;

// Virtual joystick + buttons. Same held/latched interface as Keyboard.
export class TouchControls {
  constructor(root) {
    this.held = 0;
    this.latched = 0;
    this.stickBits = 0;
    this.buttonBits = 0;
    this.stickId = null;

    this.el = document.createElement('div');
    this.el.className = 'touch';
    this.el.innerHTML = `
      <div class="stick"><div class="knob"></div></div>
      <div class="pad">
        <button data-btn="LIGHT" class="tbtn light"></button>
        <button data-btn="HEAVY" class="tbtn heavy"></button>
        <button data-btn="JUMP" class="tbtn jump"></button>
        <button data-btn="DODGE" class="tbtn dodge"></button>
        <button data-btn="SPECIAL" class="tbtn special"></button>
      </div>`;
    root.append(this.el);
    this.stick = this.el.querySelector('.stick');
    this.knob = this.el.querySelector('.knob');
    this.labels();

    this.stick.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      this.stickId = e.pointerId;
      this.stick.setPointerCapture(e.pointerId);
      this.moveStick(e);
    });
    this.stick.addEventListener('pointermove', (e) => {
      if (e.pointerId === this.stickId) this.moveStick(e);
    });
    const endStick = (e) => {
      if (e.pointerId !== this.stickId) return;
      this.stickId = null;
      this.stickBits = 0;
      this.knob.style.transform = '';
      this.sync();
    };
    this.stick.addEventListener('pointerup', endStick);
    this.stick.addEventListener('pointercancel', endStick);

    for (const b of this.el.querySelectorAll('.tbtn')) {
      const bit = BTN[b.dataset.btn];
      b.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        b.setPointerCapture(e.pointerId);
        b.classList.add('down');
        if (!(this.buttonBits & bit)) this.latched |= bit;
        this.buttonBits |= bit;
        this.sync();
      });
      const up = () => {
        b.classList.remove('down');
        this.buttonBits &= ~bit;
        this.sync();
      };
      b.addEventListener('pointerup', up);
      b.addEventListener('pointercancel', up);
    }
    this.el.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  labels() {
    const set = (cls, key) => (this.el.querySelector('.' + cls).textContent = t(key));
    set('light', 'btnLight');
    set('heavy', 'btnHeavy');
    set('jump', 'btnJump');
    set('dodge', 'btnDodge');
    set('special', 'btnSpecial');
  }

  moveStick(e) {
    const r = this.stick.getBoundingClientRect();
    const radius = r.width / 2;
    let dx = (e.clientX - (r.left + radius)) / radius;
    let dy = (e.clientY - (r.top + radius)) / radius;
    const len = Math.hypot(dx, dy);
    if (len > 1) {
      dx /= len;
      dy /= len;
    }
    this.knob.style.transform = `translate(${dx * radius * 0.55}px, ${dy * radius * 0.55}px)`;
    let bits = 0;
    if (dx > DEAD) bits |= BTN.RIGHT;
    if (dx < -DEAD) bits |= BTN.LEFT;
    if (dy > DEAD) bits |= BTN.DOWN;
    if (dy < -DEAD) bits |= BTN.UP;
    this.stickBits = bits;
    this.sync();
  }

  sync() {
    this.held = this.stickBits | this.buttonBits;
  }

  releaseAll() {
    this.stickBits = 0;
    this.buttonBits = 0;
    this.held = 0;
    this.latched = 0;
    this.stickId = null;
    this.knob.style.transform = '';
    for (const b of this.el.querySelectorAll('.tbtn')) b.classList.remove('down');
  }

  take() {
    const out = { held: this.held, pressed: this.latched };
    this.latched = 0;
    return out;
  }
}

export function isTouchDevice() {
  return matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window;
}
