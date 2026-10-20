const LEFT = new Set(['KeyA', 'ArrowLeft']);
const RIGHT = new Set(['KeyD', 'ArrowRight']);
const JUMP = new Set(['Space', 'KeyW', 'ArrowUp']);

export class Input {
  constructor() {
    this.down = new Set();
    this.onToggleFps = null;

    window.addEventListener('keydown', (e) => {
      if (e.code === 'F3') {
        e.preventDefault();
        if (!e.repeat) this.onToggleFps?.();
        return;
      }
      if (LEFT.has(e.code) || RIGHT.has(e.code) || JUMP.has(e.code)) e.preventDefault();
      this.down.add(e.code);
    });
    window.addEventListener('keyup', (e) => this.down.delete(e.code));
    window.addEventListener('blur', () => this.down.clear());
  }

  anyDown(set) {
    for (const code of set) if (this.down.has(code)) return true;
    return false;
  }

  intent(playerId) {
    const move = (this.anyDown(RIGHT) ? 1 : 0) - (this.anyDown(LEFT) ? 1 : 0);
    return { type: 'intent', playerId, move, jump: this.anyDown(JUMP) };
  }
}
