import { VIEW_W } from '../core/view.js';

// Runs a stage's sections: scroll to a lock point, fight its waves, then
// show GO and unlock the next part. The last section holds the boss.
export class Director {
  constructor(game) {
    this.game = game;
    this.sections = game.stage.sections;
    this.index = 0;
    this.phase = 'scroll';
    this.wave = 0;
    this.waveDelay = 0;
    this.done = false;
    game.camera.lockRight = this.section.camX;
  }

  get section() {
    return this.sections[this.index];
  }

  step(dt) {
    if (this.done) return;
    const g = this.game;
    const sec = this.section;
    if (this.phase === 'scroll') {
      g.camera.lockRight = sec.camX;
      if (g.camera.x >= sec.camX - 2) {
        this.phase = 'fight';
        this.wave = 0;
        this.waveDelay = 0.5;
        g.go = false;
        if (sec.tutorial) g.emit({ type: 'tutorial', key: sec.tutorial });
      }
      return;
    }
    const alive = g.enemies.filter((e) => e.state !== 'dead').length;
    if (this.wave < sec.waves.length) {
      const w = sec.waves[this.wave];
      if (alive <= (w.when ?? 0)) {
        this.waveDelay -= dt;
        if (this.waveDelay <= 0) {
          this.spawnWave(w);
          this.wave++;
          this.waveDelay = 0.9;
        }
      }
      return;
    }
    if (alive > 0) return;
    this.index++;
    if (this.index >= this.sections.length) {
      this.done = true;
      g.stageClear();
      return;
    }
    this.phase = 'scroll';
    g.go = true;
    g.camera.lockRight = this.section.camX;
    g.emit({ type: 'go' });
  }

  spawnWave(w) {
    const g = this.game;
    const { floorTop, floorBottom } = g.stage;
    w.enemies.forEach((spec, i) => {
      const left = spec.side === 'left';
      const x = left ? g.camera.x - 30 - i * 18 : g.camera.x + VIEW_W + 30 + i * 18;
      const y = spec.y ?? floorTop + 12 + g.rand() * (floorBottom - floorTop - 24);
      const e = g.spawnEnemy(spec.type, x, y);
      e.facing = left ? 1 : -1;
      e.entering = true;
      if (e.def.boss) g.emit({ type: 'boss', who: e });
    });
  }
}
