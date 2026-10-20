import { createHero, updateHero } from './entities/fighter.js';
import { HEROES } from './entities/heroes.js';

export const VIEW_W = 480;
export const VIEW_H = 270;
const EDGE = 14;

// The whole simulation. Input arrives as messages; renderer and audio read
// state and drain `events`.
export class Game {
  constructor(stage) {
    this.stage = stage;
    this.heroes = new Map();
    this.entities = [];
    this.events = [];
    this.camera = { x: 0 };
    this.hitstop = 0;
    this.time = 0;
  }

  addHero(playerId, heroId) {
    const { x, y } = this.stage.spawn;
    const hero = createHero(HEROES[heroId], playerId, x + this.heroes.size * 30, y + this.heroes.size * 14);
    this.heroes.set(playerId, hero);
    this.entities.push(hero);
    return hero;
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
    for (const hero of this.heroes.values()) {
      updateHero(hero, this, dt);
      hero.input.pressed = 0;
    }
    for (const e of this.entities) this.keepOnStage(e);
    this.updateCamera(dt);
  }

  keepOnStage(e) {
    const { floorTop, floorBottom, width } = this.stage;
    e.y = Math.max(floorTop, Math.min(floorBottom, e.y));
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
