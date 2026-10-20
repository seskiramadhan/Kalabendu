// Frame data at 60 fps. hit = hitbox relative to the attacker's feet:
// x = distance in front, w = width, z = height above the floor, h = height,
// depth = how far apart on the floor plane (y) a target may still be hit.
// push = knockback speed, launch = upward speed (juggle), stun = hitstun frames.
export const MOVES = {
  bayu_l1: {
    nameKey: 'move_jab', anim: 'jab',
    startup: 3, active: 3, recovery: 9, step: 4,
    damage: 4, push: 40, stun: 16, next: 'bayu_l2',
    hit: { x: 8, w: 27, z: 35, h: 16, depth: 10 }, sfx: 'whoosh',
  },
  bayu_l2: {
    nameKey: 'move_palm', anim: 'palm',
    startup: 4, active: 3, recovery: 10, step: 6,
    damage: 5, push: 45, stun: 18, next: 'bayu_l3',
    hit: { x: 8, w: 30, z: 32, h: 19, depth: 10 }, sfx: 'whoosh',
  },
  bayu_l3: {
    nameKey: 'move_frontkick', anim: 'frontkick',
    startup: 5, active: 4, recovery: 12, step: 8,
    damage: 6, push: 55, stun: 20, next: 'bayu_l4',
    hit: { x: 11, w: 35, z: 19, h: 22, depth: 11 }, sfx: 'whoosh',
  },
  bayu_l4: {
    nameKey: 'move_sabit', anim: 'sabit',
    startup: 7, active: 5, recovery: 20, step: 12,
    damage: 10, push: 150, launch: 230, knockdown: true,
    hit: { x: 5, w: 40, z: 27, h: 35, depth: 12 }, sfx: 'whooshBig', shake: 3,
  },
  bayu_heavy: {
    nameKey: 'move_sweep', anim: 'sweep',
    startup: 9, active: 5, recovery: 20, step: 10,
    damage: 9, push: 70, launch: 150, knockdown: true,
    hit: { x: 3, w: 46, z: 0, h: 14, depth: 12 }, sfx: 'whooshBig', shake: 2,
  },
  bayu_air_punch: {
    nameKey: 'move_airpunch', anim: 'airpunch',
    startup: 3, active: 600, recovery: 0,
    damage: 6, push: 70, stun: 20, air: true,
    hit: { x: 6, w: 24, z: 18, h: 22, depth: 11 }, sfx: 'whoosh',
  },
  bayu_air: {
    nameKey: 'move_airkick', anim: 'airkick',
    startup: 3, active: 600, recovery: 0,
    damage: 8, push: 130, launch: 120, knockdown: true, air: true,
    hit: { x: 5, w: 30, z: 5, h: 24, depth: 11 }, sfx: 'whoosh',
  },

  // Preman: slower, telegraphed so the player can react.
  preman_l1: {
    anim: 'jab',
    startup: 11, active: 3, recovery: 16, step: 6,
    damage: 6, push: 50, stun: 18, next: 'preman_l2',
    hit: { x: 8, w: 26, z: 34, h: 16, depth: 9 }, sfx: 'whoosh',
  },
  preman_l2: {
    anim: 'palm',
    startup: 9, active: 3, recovery: 24, step: 8,
    damage: 7, push: 90, stun: 22,
    hit: { x: 8, w: 28, z: 30, h: 18, depth: 9 }, sfx: 'whoosh',
  },
  preman_heavy: {
    anim: 'frontkick',
    startup: 18, active: 4, recovery: 26, step: 10,
    damage: 10, push: 140, launch: 190, knockdown: true,
    hit: { x: 10, w: 34, z: 16, h: 22, depth: 10 }, sfx: 'whooshBig', shake: 2,
  },

  // Weapons (see combat/weapons.js)
  bambu_l1: {
    nameKey: 'move_tusuk', anim: 'jab', weapon: true,
    startup: 5, active: 4, recovery: 12, step: 6,
    damage: 7, push: 60, stun: 18, next: 'bambu_l2',
    hit: { x: 10, w: 48, z: 30, h: 14, depth: 11 }, sfx: 'whoosh',
  },
  bambu_l2: {
    nameKey: 'move_tusuk', anim: 'jab', weapon: true,
    startup: 6, active: 5, recovery: 18, step: 10,
    damage: 9, push: 130, launch: 160, knockdown: true,
    hit: { x: 10, w: 50, z: 28, h: 16, depth: 12 }, sfx: 'whooshBig', shake: 2,
  },
  kursi_l1: {
    nameKey: 'move_kursi', anim: 'palm', weapon: true,
    startup: 9, active: 5, recovery: 20, step: 8,
    damage: 15, push: 150, launch: 190, knockdown: true,
    hit: { x: 4, w: 42, z: 14, h: 40, depth: 13 }, sfx: 'whooshBig', shake: 4,
  },
  ember_l1: {
    nameKey: 'move_ember', anim: 'palm', weapon: true,
    startup: 6, active: 4, recovery: 12, step: 6,
    damage: 7, push: 70, stun: 20, next: 'ember_l2',
    hit: { x: 6, w: 34, z: 26, h: 22, depth: 11 }, sfx: 'whoosh',
  },
  ember_l2: {
    nameKey: 'move_ember', anim: 'palm', weapon: true,
    startup: 7, active: 4, recovery: 18, step: 8,
    damage: 9, push: 130, launch: 170, knockdown: true,
    hit: { x: 6, w: 36, z: 22, h: 26, depth: 12 }, sfx: 'whooshBig', shake: 2,
  },
  golok_l1: {
    nameKey: 'move_golok', anim: 'jab', weapon: true,
    startup: 4, active: 3, recovery: 9, step: 5,
    damage: 7, push: 45, stun: 18, next: 'golok_l2',
    hit: { x: 6, w: 36, z: 28, h: 18, depth: 11 }, sfx: 'whoosh',
  },
  golok_l2: {
    nameKey: 'move_golok', anim: 'palm', weapon: true,
    startup: 4, active: 3, recovery: 10, step: 6,
    damage: 7, push: 50, stun: 18, next: 'golok_l3',
    hit: { x: 6, w: 36, z: 26, h: 20, depth: 11 }, sfx: 'whoosh',
  },
  golok_l3: {
    nameKey: 'move_golok', anim: 'palm', weapon: true,
    startup: 6, active: 4, recovery: 16, step: 8,
    damage: 10, push: 140, launch: 180, knockdown: true,
    hit: { x: 6, w: 38, z: 24, h: 24, depth: 12 }, sfx: 'whooshBig', shake: 2,
  },
  tongkat_l1: {
    anim: 'jab', weapon: true,
    startup: 13, active: 4, recovery: 18, step: 6,
    damage: 7, push: 60, stun: 18, next: 'tongkat_l2',
    hit: { x: 10, w: 40, z: 30, h: 14, depth: 9 }, sfx: 'whoosh',
  },
  tongkat_l2: {
    anim: 'palm', weapon: true,
    startup: 10, active: 4, recovery: 24, step: 8,
    damage: 8, push: 110, stun: 22,
    hit: { x: 8, w: 40, z: 26, h: 20, depth: 9 }, sfx: 'whoosh',
  },
  // Thrown weapons fly as projectiles.
  throw_anim: { nameKey: 'move_lempar', anim: 'palm', startup: 5, active: 2, recovery: 12, step: 0, hit: null, throws: true },
  throw_bambu: { damage: 12, push: 150, launch: 170, knockdown: true, hit: { x: -14, w: 28, z: -6, h: 14, depth: 12 }, shake: 2 },
  throw_kursi: { damage: 16, push: 160, launch: 190, knockdown: true, hit: { x: -12, w: 24, z: -10, h: 20, depth: 13 }, shake: 3 },
  throw_ember: { damage: 11, push: 150, launch: 170, knockdown: true, hit: { x: -10, w: 20, z: -8, h: 16, depth: 12 }, shake: 2 },
  throw_golok: { damage: 13, push: 150, launch: 170, knockdown: true, hit: { x: -10, w: 20, z: -4, h: 10, depth: 12 }, shake: 2 },

  // Kuncian (grab): knee strikes and the Bantingan throw. Applied directly.
  kuncian_knee: { nameKey: 'move_knee', damage: 5, push: 0, stun: 20, hitstop: 0.07, shake: 1 },
  bantingan: { nameKey: 'move_bantingan', damage: 12, push: 0, launch: 230, knockdown: true, shake: 3 },
  thrown_body: { damage: 10, push: 160, launch: 190, knockdown: true, shake: 3, hit: { x: -18, w: 36, z: 0, h: 30, depth: 14 } },

  // Preman Kampung (Stage 0 boss)
  boss_l1: {
    anim: 'jab', telegraph: true,
    startup: 14, active: 4, recovery: 14, step: 8,
    damage: 9, push: 70, stun: 20, next: 'boss_l2',
    hit: { x: 10, w: 36, z: 44, h: 22, depth: 12 }, sfx: 'whooshBig',
  },
  boss_l2: {
    anim: 'palm',
    startup: 10, active: 4, recovery: 26, step: 10,
    damage: 11, push: 170, launch: 200, knockdown: true,
    hit: { x: 10, w: 40, z: 40, h: 26, depth: 12 }, sfx: 'whooshBig', shake: 3,
  },
  boss_stomp: {
    anim: 'sweep', telegraph: true,
    startup: 26, active: 6, recovery: 30, step: 0,
    damage: 12, push: 120, launch: 220, knockdown: true,
    hit: { x: -40, w: 80, z: 0, h: 14, depth: 22 }, sfx: 'whooshBig', shake: 6,
  },
  boss_rush: {
    anim: 'sabit', telegraph: true, lunge: 290, dizzyAfter: 1.7,
    startup: 34, active: 48, recovery: 8, step: 0,
    damage: 14, push: 190, launch: 220, knockdown: true,
    hit: { x: -6, w: 40, z: 10, h: 60, depth: 14 }, sfx: 'whooshBig', shake: 4,
  },
};

for (const [id, m] of Object.entries(MOVES)) m.id = id;
