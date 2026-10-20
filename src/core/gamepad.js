import { BTN } from './input.js';

const DEAD = 0.45;
// Standard mapping: A jump, B special, X light, Y heavy, bumpers/triggers dodge.
const MAP = [
  [0, BTN.JUMP],
  [1, BTN.SPECIAL],
  [2, BTN.LIGHT],
  [3, BTN.HEAVY],
  [4, BTN.DODGE],
  [5, BTN.DODGE],
  [6, BTN.DODGE],
  [7, BTN.DODGE],
  [12, BTN.UP],
  [13, BTN.DOWN],
  [14, BTN.LEFT],
  [15, BTN.RIGHT],
];
const START = 9;
const BACK = 8;

export class Gamepads {
  constructor() {
    this.prev = new Map();
    this.prevMenu = new Map();
  }

  // Returns { held, pressed, start, back } for pad `index`, or null.
  poll(index) {
    const pad = navigator.getGamepads?.()[index];
    if (!pad || !pad.connected) return null;
    let held = 0;
    for (const [b, bit] of MAP) if (pad.buttons[b]?.pressed) held |= bit;
    const [ax = 0, ay = 0] = pad.axes;
    if (ax > DEAD) held |= BTN.RIGHT;
    if (ax < -DEAD) held |= BTN.LEFT;
    if (ay > DEAD) held |= BTN.DOWN;
    if (ay < -DEAD) held |= BTN.UP;
    const prev = this.prev.get(index) ?? 0;
    this.prev.set(index, held);
    const menuNow = (pad.buttons[START]?.pressed ? 1 : 0) | (pad.buttons[BACK]?.pressed ? 2 : 0);
    const menuPrev = this.prevMenu.get(index) ?? 0;
    this.prevMenu.set(index, menuNow);
    return {
      held,
      pressed: held & ~prev,
      start: !!(menuNow & 1 && !(menuPrev & 1)),
      back: !!(menuNow & 2 && !(menuPrev & 2)),
    };
  }
}
