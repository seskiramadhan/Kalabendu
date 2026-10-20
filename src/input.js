const LEFT = new Set(['KeyA', 'ArrowLeft']);
const RIGHT = new Set(['KeyD', 'ArrowRight']);
const JUMP = new Set(['Space', 'KeyW', 'ArrowUp']);

export class Input {
  constructor(canvas) {
    this.down = new Set();
    this.mouse = { x: 0, y: 0, inside: false, left: false, right: false };
    this.events = [];
    this.onToggleFps = null;

    window.addEventListener('keydown', (e) => {
      if (e.code === 'F3') {
        e.preventDefault();
        if (!e.repeat) this.onToggleFps?.();
        return;
      }
      const digit = /^Digit([1-9])$/.exec(e.code);
      if (digit) this.events.push({ kind: 'slot', slot: Number(digit[1]) - 1 });
      if (LEFT.has(e.code) || RIGHT.has(e.code) || JUMP.has(e.code)) e.preventDefault();
      this.down.add(e.code);
    });
    window.addEventListener('keyup', (e) => this.down.delete(e.code));
    window.addEventListener('blur', () => {
      this.down.clear();
      this.mouse.left = this.mouse.right = false;
    });

    canvas.addEventListener('contextmenu', (e) => e.preventDefault());
    canvas.addEventListener('pointermove', (e) => this.trackMouse(e));
    canvas.addEventListener('pointerdown', (e) => {
      if (e.pointerType !== 'mouse') return;
      this.trackMouse(e);
      if (e.button === 0) this.mouse.left = true;
      if (e.button === 2) this.mouse.right = true;
    });
    window.addEventListener('pointerup', (e) => {
      if (e.pointerType !== 'mouse') return;
      if (e.button === 0) this.mouse.left = false;
      if (e.button === 2) this.mouse.right = false;
    });
    canvas.addEventListener('pointerleave', () => (this.mouse.inside = false));
    canvas.addEventListener(
      'wheel',
      (e) => {
        e.preventDefault();
        if (e.deltaY !== 0) this.events.push({ kind: 'wheel', dir: Math.sign(e.deltaY) });
      },
      { passive: false },
    );
  }

  trackMouse(e) {
    if (e.pointerType !== 'mouse') return;
    this.mouse.x = e.clientX;
    this.mouse.y = e.clientY;
    this.mouse.inside = true;
  }

  anyDown(set) {
    for (const code of set) if (this.down.has(code)) return true;
    return false;
  }

  takeEvents() {
    const out = this.events;
    this.events = [];
    return out;
  }

  // pointerTile: tile under the mouse, or null.
  intent(playerId, pointerTile) {
    const move = (this.anyDown(RIGHT) ? 1 : 0) - (this.anyDown(LEFT) ? 1 : 0);
    return {
      type: 'intent',
      playerId,
      move,
      jump: this.anyDown(JUMP),
      mine: this.mouse.left && pointerTile ? pointerTile : null,
      place: this.mouse.right && !this.mouse.left && pointerTile ? pointerTile : null,
    };
  }
}
