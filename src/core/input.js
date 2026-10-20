export const BTN = {
  LEFT: 1,
  RIGHT: 2,
  UP: 4,
  DOWN: 8,
  LIGHT: 16,
  HEAVY: 32,
  JUMP: 64,
  SPECIAL: 128,
  DODGE: 256,
};

const P1_KEYS = {
  ArrowLeft: BTN.LEFT,
  KeyA: BTN.LEFT,
  ArrowRight: BTN.RIGHT,
  KeyD: BTN.RIGHT,
  ArrowUp: BTN.UP,
  KeyW: BTN.UP,
  ArrowDown: BTN.DOWN,
  KeyS: BTN.DOWN,
  KeyJ: BTN.LIGHT,
  KeyK: BTN.HEAVY,
  KeyL: BTN.JUMP,
  Space: BTN.JUMP,
  KeyI: BTN.SPECIAL,
  ShiftLeft: BTN.DODGE,
  ShiftRight: BTN.DODGE,
};

// Player 2 on the numpad: 8/4/5/6 move, 1 punch, 2 kick, 3 jump, 0 dodge,
// Enter jurus (and joins the game).
export const P2_KEYS = {
  Numpad4: BTN.LEFT,
  Numpad6: BTN.RIGHT,
  Numpad8: BTN.UP,
  Numpad5: BTN.DOWN,
  Numpad2: BTN.HEAVY,
  Numpad1: BTN.LIGHT,
  Numpad3: BTN.JUMP,
  Numpad0: BTN.DODGE,
  NumpadDecimal: BTN.DODGE,
  NumpadEnter: BTN.SPECIAL,
  NumpadAdd: BTN.SPECIAL,
};

// Collects key state and turns it into input messages:
// { type: 'input', playerId, held, pressed } — presses are latched so a
// quick tap between two logic ticks is never lost.
export class Keyboard {
  constructor(keys = P1_KEYS) {
    this.keys = keys;
    this.held = 0;
    this.latched = 0;
    this.onKey = null;

    window.addEventListener('keydown', (e) => {
      if (this.onKey?.(e)) {
        e.preventDefault();
        return;
      }
      const bit = this.keys[e.code];
      if (!bit) return;
      e.preventDefault();
      if (!(this.held & bit)) this.latched |= bit;
      this.held |= bit;
    });
    window.addEventListener('keyup', (e) => {
      const bit = this.keys[e.code];
      if (bit) this.held &= ~bit;
    });
    window.addEventListener('blur', () => this.releaseAll());
  }

  releaseAll() {
    this.held = 0;
    this.latched = 0;
  }

  message(playerId) {
    const msg = { type: 'input', playerId, held: this.held, pressed: this.latched };
    this.latched = 0;
    return msg;
  }
}
