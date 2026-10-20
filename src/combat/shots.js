// Ranged shots. Each fires as a projectile; `move` is the hit it deals.
// fall: drops from the sky near the target instead of flying sideways.
const box = (w, h) => ({ x: -w / 2, w, z: -h / 2, h, depth: 12 });

export const SHOTS = {
  koin_lempar: { speed: 230, z: 36, life: 1.6, draw: 'coin', move: { damage: 5, push: 60, stun: 16, hit: box(12, 12) } },
  rantai: { speed: 300, z: 34, life: 0.55, draw: 'chain', move: { damage: 4, push: 0, stun: 26, effect: 'pull', fine: 0.05, hit: box(16, 10) } },
  kertas_denda: { speed: 200, z: 38, life: 1.8, draw: 'paper', move: { damage: 2, push: 0, stun: 10, effect: 'freeze', freeze: 1.2, fine: 0.08, hit: box(14, 14) } },
  spam: { speed: 140, z: 52, life: 2.4, draw: 'spam', move: { damage: 2, push: 10, stun: 40, hit: box(16, 14) } },
  kontrak: { speed: 250, z: 40, life: 1.8, draw: 'contract', move: { damage: 8, push: 130, launch: 150, knockdown: true, hit: box(18, 16) } },
  uang_kertas: { fall: true, count: 5, spread: 120, draw: 'note', move: { damage: 4, push: 20, stun: 14, hit: box(14, 14) } },
  semprotan: { speed: 330, z: 40, life: 0.9, draw: 'water', move: { damage: 6, push: 240, stun: 22, unblockable: true, hit: box(36, 18) } },
  napas_kala: { speed: 260, z: 44, life: 1.6, draw: 'flame', move: { damage: 10, push: 160, launch: 180, knockdown: true, hit: box(28, 24) } },
  jaring: { speed: 230, z: 30, life: 1.3, draw: 'net', move: { damage: 6, push: 0, stun: 10, effect: 'net', freeze: 2.8, pierce: true, unblockable: true, hit: box(34, 44) } },
  duit: { speed: 240, z: 46, life: 1.6, draw: 'cash', move: { damage: 7, push: 90, stun: 18, hit: box(16, 12) } },
};
