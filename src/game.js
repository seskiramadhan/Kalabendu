import { createFighter, updateFighter } from './entities/fighter.js';
import { HEROES } from './entities/heroes.js';
import { ENEMIES } from './entities/enemies.js';
import { resolveHits } from './combat/hits.js';
import { thinkBrawler } from './ai/brawler.js';

export const VIEW_W = 480;
export const VIEW_H = 270;
const EDGE = 14;
const BRAINS = { brawler: thinkBrawler };

function rng(seed) {
  let s = seed >>> 0 || 1;
  return () => {
    s = (Math.imul(s ^ (s >>> 15), 2246822507) + 0x9e3779b9) >>> 0;
    return s / 4294967296;
  };
}

// The whole simulation. Input arrives as messages; renderer and audio read
// state and drain `events`.
export class Game {
  constructor(stage, seed = 1) {
    this.stage = stage;
    this.heroes = new Map();
    this.entities = [];
    this.events = [];
    this.camera = { x: 0 };
    this.hitstop = 0;
    this.time = 0;
    this.rand = rng(seed);
    this.ai = { engaged: new Set() };
    this.spawnTimer = 1;
  }

  addHero(playerId, heroId) {
    const { x, y } = this.stage.spawn;
    const hero = createFighter(HEROES[heroId], 'hero', x + this.heroes.size * 30, y + this.heroes.size * 14);
    hero.playerId = playerId;
    this.heroes.set(playerId, hero);
    this.entities.push(hero);
    return hero;
  }

  spawnEnemy(type, x, y) {
    const e = createFighter(ENEMIES[type], 'enemy', x, y);
    e.facing = -1;
    this.entities.push(e);
    return e;
  }

  get enemies() {
    return this.entities.filter((e) => e.team === 'enemy');
  }

  applyInput(msg) {
    const hero = this.heroes.get(msg.playerId);
    if (!hero) return;
    hero.input.held = msg.held;
    hero.input.pressed |= msg.pressed;
  }

  emit(event) {
    this.events.push(event);
  }

  step(dt) {
    this.time += dt;
    if (this.hitstop > 0) {
      this.hitstop -= dt;
      return;
    }
    for (const e of this.entities) {
      if (e.team === 'enemy') BRAINS[e.def.ai]?.(e, this, dt, this.rand);
      updateFighter(e, this, dt);
      e.input.pressed = 0;
    }
    resolveHits(this);
    this.separateEnemies();
    for (const e of this.entities) this.keepOnStage(e);
    for (const h of this.heroes.values()) {
      // Placeholder until game over arrives in milestone 4.
      if (h.state === 'dead') {
        h.hp = h.def.maxHp;
        h.state = 'getup';
        h.t = 0;
        h.invuln = 1.5;
      }
    }
    for (const e of this.entities) if (e.remove) this.ai.engaged.delete(e.uid);
    this.entities = this.entities.filter((e) => !e.remove);
    this.updateCamera(dt);
    this.updateSpawner(dt);
  }

  updateSpawner(dt) {
    const wanted = this.stage.training?.enemies ?? 0;
    if (this.enemies.length >= wanted) return;
    this.spawnTimer -= dt;
    if (this.spawnTimer > 0) return;
    this.spawnTimer = 1.5;
    const { floorTop, floorBottom } = this.stage;
    const left = this.rand() < 0.5;
    const x = left ? this.camera.x - 20 : this.camera.x + VIEW_W + 20;
    const y = floorTop + 10 + this.rand() * (floorBottom - floorTop - 20);
    const e = this.spawnEnemy('preman', x, y);
    e.facing = left ? 1 : -1;
    e.entering = true;
  }

  separateEnemies() {
    const list = this.enemies;
    for (let i = 0; i < list.length; i++) {
      for (let j = i + 1; j < list.length; j++) {
        const a = list[i];
        const b = list[j];
        const dx = b.x - a.x;
        const dy = (b.y - a.y) * 2;
        const d = Math.hypot(dx, dy);
        if (d >= 20 || d === 0) continue;
        const push = (20 - d) / 2;
        a.x -= (dx / d) * push;
        b.x += (dx / d) * push;
      }
    }
  }

  keepOnStage(e) {
    const { floorTop, floorBottom, width } = this.stage;
    e.y = Math.max(floorTop, Math.min(floorBottom, e.y));
    if (e.entering) {
      if (e.x > this.camera.x + EDGE && e.x < this.camera.x + VIEW_W - EDGE) e.entering = false;
      return;
    }
    const left = Math.max(EDGE, this.camera.x + EDGE);
    const right = Math.min(width - EDGE, this.camera.x + VIEW_W - EDGE);
    e.x = Math.max(left, Math.min(right, e.x));
  }

  updateCamera(dt) {
    if (!this.heroes.size) return;
    let sum = 0;
    for (const h of this.heroes.values()) sum += h.x + h.facing * 24;
    const target = sum / this.heroes.size - VIEW_W / 2;
    this.camera.x += (target - this.camera.x) * Math.min(1, dt * 5);
    this.camera.x = Math.max(0, Math.min(this.stage.width - VIEW_W, this.camera.x));
  }
}
