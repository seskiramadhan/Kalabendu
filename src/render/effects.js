// Visual-only particles fed by game events. Never touches game state.
export class Effects {
  constructor() {
    this.items = [];
  }

  handle(ev) {
    if (ev.type === 'dust') {
      for (let i = 0; i < 3 + ev.size * 2; i++) {
        this.items.push({
          kind: 'dust',
          x: ev.x + (Math.random() - 0.5) * 10,
          y: ev.y,
          vx: (Math.random() - 0.5) * 40,
          vz: 10 + Math.random() * 20,
          z: 0,
          life: 0.35 + Math.random() * 0.2,
          age: 0,
          r: 1 + Math.floor(Math.random() * 2) + (ev.size > 1 ? 1 : 0),
        });
      }
    } else if (ev.type === 'swing') {
      this.items.push({ kind: 'swing', who: ev.who, move: ev.move, age: 0, life: 0.12 });
    }
  }

  update(dt) {
    for (const e of this.items) {
      e.age += dt;
      if (e.kind === 'dust') {
        e.x += e.vx * dt;
        e.z += e.vz * dt;
      }
    }
    this.items = this.items.filter((e) => e.age < e.life);
  }

  draw(ctx, camX) {
    for (const e of this.items) {
      const k = 1 - e.age / e.life;
      if (e.kind === 'dust') {
        ctx.fillStyle = `rgba(214,190,150,${0.7 * k})`;
        ctx.fillRect(Math.round(e.x - camX - e.r), Math.round(e.y - e.z - e.r), e.r * 2, e.r * 2);
      } else if (e.kind === 'swing') {
        const f = e.who;
        const h = e.move.hit;
        const cx = f.x - camX + f.facing * (h.x + h.w * 0.55);
        const cy = f.y - f.z - h.z - h.h / 2;
        ctx.strokeStyle = `rgba(255,248,225,${0.85 * k})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        const start = f.facing > 0 ? -1.1 : Math.PI + 1.1;
        ctx.arc(cx - f.facing * 8, cy, 10 + h.h * 0.25, start, start + f.facing * 2.2, f.facing < 0);
        ctx.stroke();
      }
    }
  }
}
