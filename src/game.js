import { createPlayer, updatePlayer } from './player.js';

// All state changes go through applyAction, so a network host can later
// relay the same messages from remote players.
export class Game {
  constructor(world, spawn) {
    this.world = world;
    this.spawn = spawn;
    this.players = new Map();
    this.tick = 0;
  }

  addPlayer(id) {
    const p = createPlayer(id, this.spawn.x, this.spawn.y);
    this.players.set(id, p);
    return p;
  }

  applyAction(action) {
    const p = this.players.get(action.playerId);
    if (!p) return;
    switch (action.type) {
      case 'intent':
        p.intent.move = Math.max(-1, Math.min(1, action.move | 0));
        p.intent.jump = !!action.jump;
        break;
    }
  }

  step(dt) {
    this.tick++;
    for (const p of this.players.values()) updatePlayer(p, this.world, dt);
  }
}
