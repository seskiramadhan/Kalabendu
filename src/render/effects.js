import { t } from '../core/i18n.js';

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
    } else if (ev.type === 'hit') {
      this.items.push({ kind: 'spark', x: ev.x, y: ev.y, z: ev.z, heavy: ev.heavy, age: 0, life: ev.heavy ? 0.2 : 0.14, rot: Math.random() });
      for (let i = 0; i < (ev.heavy ? 8 : 4); i++) {
        const a = Math.random() * Math.PI * 2;
        const sp = 60 + Math.random() * (ev.heavy ? 140 : 80);
        this.items.push({ kind: 'chip', x: ev.x, y: ev.y, z: ev.z, vx: Math.cos(a) * sp, vz: Math.sin(a) * sp, age: 0, life: 0.25 });
      }
    } else if (ev.type === 'break') {
      const n = ev.big ? 14 : 7;
      for (let i = 0; i < n; i++) {
        const a = -Math.random() * Math.PI;
        const sp = 60 + Math.random() * 120;
        this.items.push({
          kind: 'debris', x: ev.x, y: ev.y, z: ev.z ?? 10, vx: Math.cos(a) * sp, vz: -Math.sin(a) * sp + 60,
          color: ev.colors[i % ev.colors.length], size: 2 + Math.floor(Math.random() * 3), age: 0, life: 0.7,
        });
      }
    } else if (ev.type === 'steam') {
      for (let i = 0; i < 6; i++) {
        this.items.push({ kind: 'dust', x: ev.x + (Math.random() - 0.5) * 16, y: ev.y, vx: (Math.random() - 0.5) * 20, vz: 30 + Math.random() * 30, z: 4, life: 0.8, age: 0, r: 2 + Math.floor(Math.random() * 2), steam: true });
      }
    } else if (ev.type === 'saved') {
      this.items.push({ kind: 'popup', x: ev.x - 10, y: ev.y, z: 60, text: t('saved'), color: '#7ce07a', age: 0, life: 1.6 });
    } else if (ev.type === 'special') {
      this.items.push({ kind: 'ring', who: ev.who, age: 0, life: 0.45 });
    } else if (ev.type === 'pickup') {
      const lost = ev.rupiah < 0 || ev.snatched;
      const amount = ev.rupiah ? `Rp ${Math.abs(ev.rupiah).toLocaleString('id-ID')}` : `+${ev.amount}`;
      const text = lost ? `-${amount}` : amount;
      const color = lost ? '#ff6a4a' : ev.rupiah ? '#f2c94c' : '#7ce07a';
      this.items.push({ kind: 'popup', x: ev.x, y: ev.y, z: 24, text, color, age: 0, life: 0.9 });
    } else if (ev.type === 'swing') {
      this.items.push({ kind: 'swing', who: ev.who, move: ev.move, age: 0, life: 0.12 });
    }
  }

  update(dt) {
    for (const e of this.items) {
      e.age += dt;
      if (e.kind === 'dust' || e.kind === 'chip' || e.kind === 'debris') {
        e.x += e.vx * dt;
        e.z += e.vz * dt;
        if (e.kind !== 'dust') e.vz -= 500 * dt;
        if (e.kind === 'debris' && e.z < 0) {
          e.z = 0;
          e.vz = 0;
          e.vx *= 0.8;
        }
      }
      if (e.kind === 'popup') e.z += 30 * dt;
    }
    this.items = this.items.filter((e) => e.age < e.life);
  }

  draw(ctx, camX) {
    for (const e of this.items) {
      const k = 1 - e.age / e.life;
      if (e.kind === 'dust') {
        ctx.fillStyle = e.steam ? `rgba(240,240,240,${0.7 * k})` : `rgba(214,190,150,${0.7 * k})`;
        ctx.fillRect(Math.round(e.x - camX - e.r), Math.round(e.y - e.z - e.r), e.r * 2, e.r * 2);
      } else if (e.kind === 'spark') {
        const x = Math.round(e.x - camX);
        const y = Math.round(e.y - e.z);
        const r = Math.round((e.heavy ? 14 : 9) * (0.6 + 0.4 * (1 - k)));
        ctx.fillStyle = `rgba(255,255,255,${k})`;
        ctx.fillRect(x - 2, y - 2, 5, 5);
        ctx.fillStyle = `rgba(255,214,90,${k})`;
        for (let i = 0; i < 8; i++) {
          const a = e.rot * 6 + (i * Math.PI) / 4;
          const len = i % 2 ? r * 0.55 : r;
          for (let d = 3; d < len; d++) ctx.fillRect(Math.round(x + Math.cos(a) * d), Math.round(y + Math.sin(a) * d), 2, 2);
        }
      } else if (e.kind === 'debris') {
        ctx.globalAlpha = Math.min(1, k * 2);
        ctx.fillStyle = e.color;
        ctx.fillRect(Math.round(e.x - camX), Math.round(e.y - e.z), e.size, e.size);
        ctx.globalAlpha = 1;
      } else if (e.kind === 'popup') {
        ctx.font = 'bold 8px monospace';
        ctx.globalAlpha = Math.min(1, k * 2);
        ctx.fillStyle = '#120c0a';
        ctx.fillText(e.text, Math.round(e.x - camX - 10 + 1), Math.round(e.y - e.z + 1));
        ctx.fillStyle = e.color;
        ctx.fillText(e.text, Math.round(e.x - camX - 10), Math.round(e.y - e.z));
        ctx.globalAlpha = 1;
      } else if (e.kind === 'ring') {
        const rad = 10 + (e.age / e.life) * 60;
        ctx.strokeStyle = `rgba(242,201,76,${k})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(Math.round(e.who.x - camX), Math.round(e.who.y - 2), rad, rad * 0.35, 0, 0, Math.PI * 2);
        ctx.stroke();
      } else if (e.kind === 'chip') {
        ctx.fillStyle = `rgba(255,236,170,${k})`;
        ctx.fillRect(Math.round(e.x - camX), Math.round(e.y - e.z), 2, 2);
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
