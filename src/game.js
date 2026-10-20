import { createFighter, updateFighter, SPECIAL_COST } from './entities/fighter.js';
import { HEROES } from './entities/heroes.js';
import { ENEMIES } from './entities/enemies.js';
import { createItem, updateItem } from './entities/items.js';
import { createProp } from './entities/props.js';
import { WEAPONS } from './combat/weapons.js';
import { MOVES } from './combat/moves.js';
import { resolveHits, react } from './combat/hits.js';
import { thinkBrawler } from './ai/brawler.js';
import { thinkBossPreman } from './ai/boss_preman.js';
import { Director } from './systems/director.js';
import { VIEW_W } from './core/view.js';

const EDGE = 14;
const BRAINS = { brawler: thinkBrawler, bossPreman: thinkBossPreman };
const PICKUP_X = 16;
const PICKUP_Y = 9;
const GRAB_X = 24;
const GRAB_Y = 7;
const COMBO_WINDOW = 1.4;
const CONTINUE_TIME = 10;
const RESPAWN_DELAY = 1.1;
const SEMANGAT_DEAL = 0.9;
const SEMANGAT_TAKE = 0.7;
let nextProjectileUid = 3_000_000;

function rng(seed) {
  let s = seed >>> 0 || 1;
  return () => {
    s = (Math.imul(s ^ (s >>> 15), 2246822507) + 0x9e3779b9) >>> 0;
    return s / 4294967296;
  };
}

const isFighter = (e) => e.kind === 'hero' || e.kind === 'enemy';

// The whole simulation. Input arrives as messages; renderer and audio read
// state and drain `events`.
export class Game {
  constructor(stage, seed = 1) {
    this.stage = stage;
    this.heroes = new Map();
    this.entities = [];
    this.events = [];
    this.camera = { x: 0, minX: 0, lockRight: Infinity };
    this.hitstop = 0;
    this.time = 0;
    this.rand = rng(seed);
    this.ai = { engaged: new Set() };
    this.spawnTimer = 1;
    this.score = 0;
    this.rupiah = 0;
    this.go = false;
    this.cleared = false;
    this.boss = null;
    this.combo = { count: 0, timer: 0, best: 0 };
    this.over = false;
    this.continueTimer = 0;
    this.taughtSpecial = false;
    for (const p of stage.props ?? []) this.entities.push(createProp(p.type, p.x, p.y, p.drops));
    for (const it of stage.items ?? []) this.entities.push(createItem(it.type, it.x, it.y));
    this.director = stage.sections ? new Director(this) : null;
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
    if (e.def.boss) this.boss = e;
    return e;
  }

  get enemies() {
    return this.entities.filter((e) => e.kind === 'enemy');
  }

  byUid(uid) {
    return this.entities.find((e) => e.uid === uid) ?? null;
  }

  applyInput(msg) {
    const hero = this.heroes.get(msg.playerId);
    if (!hero) return;
    if (msg.type === 'continue') {
      this.continueGame(hero);
      return;
    }
    hero.input.held = msg.held;
    hero.input.pressed |= msg.pressed;
  }

  emit(event) {
    this.events.push(event);
  }

  addScore(n) {
    this.score += Math.round(n);
  }

  step(dt) {
    this.time += dt;
    if (this.over) {
      this.continueTimer = Math.max(0, this.continueTimer - dt);
      for (const h of this.heroes.values()) h.input.pressed = 0;
      return;
    }
    if (this.hitstop > 0) {
      this.hitstop -= dt;
      return;
    }
    for (const e of this.entities) {
      if (isFighter(e)) {
        if (e.kind === 'enemy' && !this.cleared) BRAINS[e.def.ai]?.(e, this, dt, this.rand);
        updateFighter(e, this, dt);
        if (e.kind === 'enemy') e.input.pressed = 0;
      } else if (e.kind === 'item') updateItem(e, dt);
      else if (e.kind === 'projectile') this.updateProjectile(e, dt);
    }
    for (const h of this.heroes.values()) h.input.pressed = 0;
    resolveHits(this);
    this.collectTouching();
    this.separateEnemies();
    for (const e of this.entities) if (isFighter(e)) this.keepOnStage(e);
    for (const h of this.heroes.values()) this.checkHeroDown(h);
    this.updateCombo(dt);
    for (const e of this.entities) if (e.remove) this.ai.engaged.delete(e.uid);
    this.entities = this.entities.filter((e) => !e.remove);
    this.updateCamera(dt);
    this.director?.step(dt);
    this.updateTrainingSpawner(dt);
  }

  heroLanded(hero, m) {
    this.addScore(m.damage * 10);
    if (!m.special) {
      const before = hero.semangat;
      hero.semangat = Math.min(100, hero.semangat + m.damage * SEMANGAT_DEAL);
      if (!this.taughtSpecial && before < SPECIAL_COST && hero.semangat >= SPECIAL_COST) {
        this.taughtSpecial = true;
        this.emit({ type: 'tutorial', key: 'tut_special' });
      }
    }
    this.combo.count++;
    this.combo.timer = COMBO_WINDOW;
    this.combo.best = Math.max(this.combo.best, this.combo.count);
    this.emit({ type: 'combo', count: this.combo.count });
  }

  heroHurt(hero, m) {
    hero.semangat = Math.min(100, hero.semangat + m.damage * SEMANGAT_TAKE);
    this.endCombo();
    this.emit({ type: 'heroHurt', who: hero });
  }

  updateCombo(dt) {
    if (this.combo.count === 0) return;
    this.combo.timer -= dt;
    if (this.combo.timer <= 0) this.endCombo();
  }

  // Long combos pay a bonus when they end.
  endCombo() {
    const n = this.combo.count;
    this.combo.count = 0;
    this.combo.timer = 0;
    if (n >= 5) {
      const bonus = n * n * 5;
      this.addScore(bonus);
      this.emit({ type: 'comboEnd', count: n, bonus });
      this.emit({ type: 'sfx', name: 'combo' });
    }
  }

  checkHeroDown(h) {
    if (h.state !== 'dead' || h.t < RESPAWN_DELAY || this.over) return;
    if (h.lives > 0) {
      h.lives--;
      this.respawn(h);
    } else {
      this.over = true;
      this.continueTimer = CONTINUE_TIME;
      this.endCombo();
      this.emit({ type: 'gameOver' });
    }
  }

  // Drops the hero in from above; landing knocks nearby enemies away.
  respawn(h) {
    h.hp = h.def.maxHp;
    h.semangat = Math.max(h.semangat, SPECIAL_COST);
    h.state = 'jump';
    h.t = 0;
    h.z = 170;
    h.vz = 0;
    h.vx = 0;
    h.vy = 0;
    h.airAttacked = true;
    h.invuln = 3;
    h.move = null;
    h.weapon = null;
    h.killed = false;
    h.juggles = 0;
    h.respawnDrop = true;
    h.x = Math.max(this.camera.x + 60, Math.min(this.camera.x + 420, h.x));
    this.emit({ type: 'respawn', who: h });
  }

  shockwave(h) {
    this.emit({ type: 'shake', amount: 5 });
    this.emit({ type: 'sfx', name: 'hitHeavy' });
    this.emit({ type: 'dust', x: h.x, y: h.y, size: 3 });
    for (const e of this.enemies) {
      if (e.state === 'dead' || Math.abs(e.x - h.x) > 110 || Math.abs(e.y - h.y) > 40) continue;
      const dir = e.x >= h.x ? 1 : -1;
      e.state = 'airborne';
      e.t = 0;
      e.z = Math.max(e.z, 1);
      e.vz = 200;
      e.vx = dir * 160;
      e.bounced = false;
      e.move = null;
      this.ai.engaged.delete(e.uid);
    }
  }

  continueGame(h) {
    if (!this.over || this.continueTimer <= 0) return;
    this.over = false;
    this.score = 0;
    h.lives = 3;
    h.semangat = 100;
    this.respawn(h);
    this.emit({ type: 'continued' });
  }

  get finished() {
    return this.over && this.continueTimer <= 0;
  }

  // Food and coins are picked up by walking over them.
  collectTouching() {
    for (const h of this.heroes.values()) {
      if (h.state === 'dead' || h.z > 0) continue;
      for (const it of this.entities) {
        if (it.kind !== 'item' || it.remove || it.def.kind === 'weapon' || it.z > 6) continue;
        if (Math.abs(it.x - h.x) > PICKUP_X || Math.abs(it.y - h.y) > PICKUP_Y) continue;
        it.remove = true;
        if (it.def.kind === 'food') {
          h.hp = Math.min(h.def.maxHp, h.hp + it.def.heal);
          this.emit({ type: 'pickup', x: it.x, y: it.y, key: it.def.nameKey, amount: it.def.heal });
        } else {
          this.rupiah += it.def.rupiah;
          this.addScore(it.def.score);
          this.emit({ type: 'pickup', x: it.x, y: it.y, rupiah: it.def.rupiah });
        }
        this.emit({ type: 'sfx', name: 'pickup' });
      }
    }
  }

  // Weapons need a press of the light attack button while standing on them.
  tryPickup(h) {
    const it = this.entities.find(
      (e) => e.kind === 'item' && !e.remove && e.def.kind === 'weapon' && e.z <= 6 && Math.abs(e.x - h.x) <= PICKUP_X && Math.abs(e.y - h.y) <= PICKUP_Y,
    );
    if (!it) return false;
    if (h.weapon) this.dropWeapon(h);
    it.remove = true;
    const id = it.def.weapon;
    h.weapon = { id, durability: it.durability ?? WEAPONS[id].durability };
    this.emit({ type: 'label', who: h, key: WEAPONS[id].nameKey });
    this.emit({ type: 'sfx', name: 'pickup' });
    return true;
  }

  dropWeapon(f) {
    if (!f.weapon) return;
    const it = createItem(f.weapon.id, f.x, f.y, { z: 20, vz: 120, vx: -f.facing * 40, durability: f.weapon.durability });
    this.entities.push(it);
    f.weapon = null;
  }

  throwWeapon(f) {
    if (!f.weapon) return;
    const w = WEAPONS[f.weapon.id];
    this.entities.push({
      uid: nextProjectileUid++,
      kind: 'projectile',
      team: f.team,
      ownerUid: f.uid,
      weaponId: f.weapon.id,
      move: MOVES[w.throwMove],
      x: f.x + f.facing * 14,
      y: f.y,
      z: 30,
      vx: f.facing * 330,
      facing: f.facing,
      t: 0,
      hitIds: new Set(),
      spent: false,
      remove: false,
    });
    f.weapon = null;
    this.emit({ type: 'sfx', name: 'whooshBig' });
  }

  updateProjectile(p, dt) {
    p.t += dt;
    p.x += p.vx * dt;
    const out = p.x < this.camera.x - 40 || p.x > this.camera.x + VIEW_W + 40;
    if (p.spent || p.t > 1.2 || out) {
      p.remove = true;
      this.emit({ type: 'break', x: p.x, y: p.y, z: p.z, colors: [WEAPONS[p.weaponId].color, '#7a4e24'] });
    }
  }

  findGrabTarget(h, dirX) {
    for (const e of this.entities) {
      if (e.kind !== 'enemy') continue;
      const ok = e.def.boss ? e.state === 'dizzy' : e.state === 'idle' || e.state === 'walk' || e.state === 'hurt';
      if (!ok || e.z > 0 || e.entering) continue;
      const dx = e.x - h.x;
      if (Math.sign(dx) !== dirX || Math.abs(dx) > GRAB_X * (e.def.size ?? 1) || Math.abs(e.y - h.y) > GRAB_Y) continue;
      return e;
    }
    return null;
  }

  directHit(attacker, target, move, opts) {
    const scale = target.def.size ?? 1;
    react(this, attacker, target, move, { x: target.x - attacker.facing * 6, z: 36 * scale }, opts);
  }

  onKill(e) {
    if (e.killed) return;
    e.killed = true;
    this.ai.engaged.delete(e.uid);
    if (e.kind !== 'enemy') return;
    this.addScore(e.def.score ?? 100);
    for (const [type, chance] of Object.entries(e.def.drops ?? {})) {
      if (this.rand() < chance) {
        this.entities.push(createItem(type, e.x, e.y, { z: 20, vz: 160, vx: (this.rand() - 0.5) * 80 }));
      }
    }
    if (e.weapon) this.dropWeapon(e);
    if (e.def.boss) this.emit({ type: 'bossDown', who: e });
  }

  breakProp(prop) {
    prop.remove = true;
    this.emit({ type: 'break', x: prop.x, y: prop.y, z: prop.def.h / 2, colors: prop.def.debris, big: true });
    this.emit({ type: 'sfx', name: 'hitHeavy' });
    this.emit({ type: 'shake', amount: 2 });
    this.addScore(50);
    prop.drops.forEach((type, i) => {
      const vx = (i - (prop.drops.length - 1) / 2) * 50 + (this.rand() - 0.5) * 20;
      this.entities.push(createItem(type, prop.x, prop.y + 2, { z: 16, vz: 170 + this.rand() * 60, vx }));
    });
  }

  stageClear() {
    this.cleared = true;
    this.emit({ type: 'clear' });
  }

  updateTrainingSpawner(dt) {
    const wanted = this.stage.training?.enemies ?? 0;
    if (!wanted || this.enemies.length >= wanted) return;
    this.spawnTimer -= dt;
    if (this.spawnTimer > 0) return;
    this.spawnTimer = 1.5;
    const { floorTop, floorBottom } = this.stage;
    const left = this.rand() < 0.5;
    const x = left ? this.camera.x - 20 : this.camera.x + VIEW_W + 20;
    const y = floorTop + 10 + this.rand() * (floorBottom - floorTop - 20);
    const e = this.spawnEnemy(this.rand() < 0.3 ? 'preman_tongkat' : 'preman', x, y);
    e.facing = left ? 1 : -1;
    e.entering = true;
  }

  separateEnemies() {
    const list = this.enemies.filter((e) => e.state !== 'grabbed' && e.state !== 'dead');
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
    const cam = this.camera;
    cam.x += (target - cam.x) * Math.min(1, dt * 5);
    const maxX = Math.min(this.stage.width - VIEW_W, cam.lockRight);
    cam.x = Math.max(cam.minX, Math.min(maxX, cam.x));
    // No walking back to earlier sections.
    if (this.director) cam.minX = Math.max(cam.minX, cam.x);
  }
}
