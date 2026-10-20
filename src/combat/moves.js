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
};

for (const [id, m] of Object.entries(MOVES)) m.id = id;
