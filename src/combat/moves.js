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
  // Jurus Badai Sabit: spinning double crescent kick, hits both sides twice.
  bayu_special: {
    nameKey: 'move_special', anim: 'spin', special: true,
    startup: 6, active: 24, recovery: 14, step: 18, rehit: 12, invulnFrames: 34,
    damage: 12, push: 170, launch: 250, knockdown: true,
    hit: { x: -44, w: 88, z: 0, h: 60, depth: 18 }, sfx: 'whooshBig', shake: 4, hitstop: 0.08,
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


  // Sri: rice farmer with a cangkul — longer reach, wide sweeps.
  sri_l1: {
    nameKey: 'move_cangkul', anim: 'palm',
    startup: 5, active: 4, recovery: 11, step: 5,
    damage: 5, push: 50, stun: 18, next: 'sri_l2', weapon: false,
    hit: { x: 10, w: 36, z: 28, h: 22, depth: 11 }, sfx: 'whoosh',
  },
  sri_l2: {
    nameKey: 'move_sapu', anim: 'sabit',
    startup: 6, active: 5, recovery: 12, step: 6,
    damage: 6, push: 60, stun: 20, next: 'sri_l3',
    hit: { x: -6, w: 52, z: 20, h: 26, depth: 13 }, sfx: 'whoosh',
  },
  sri_l3: {
    nameKey: 'move_bajak', anim: 'throwPose',
    startup: 9, active: 5, recovery: 20, step: 10,
    damage: 11, push: 140, launch: 240, knockdown: true,
    hit: { x: 8, w: 40, z: 0, h: 50, depth: 13 }, sfx: 'whooshBig', shake: 3,
  },
  sri_heavy: {
    nameKey: 'move_sapuan_sawah', anim: 'sweep',
    startup: 10, active: 6, recovery: 20, step: 6,
    damage: 9, push: 110, launch: 140, knockdown: true,
    hit: { x: -40, w: 86, z: 0, h: 16, depth: 14 }, sfx: 'whooshBig', shake: 2,
  },
  sri_special: {
    nameKey: 'move_sri_special', anim: 'spin', special: true,
    startup: 8, active: 30, recovery: 14, step: 10, rehit: 10, invulnFrames: 40,
    damage: 10, push: 190, launch: 220, knockdown: true,
    hit: { x: -56, w: 112, z: 0, h: 40, depth: 22 }, sfx: 'whooshBig', shake: 4, hitstop: 0.08,
  },

  // Ujang: ojol driver — quick jabs, dash punch, motorcycle charge.
  ujang_l1: {
    nameKey: 'move_jab', anim: 'jab',
    startup: 2, active: 3, recovery: 7, step: 5,
    damage: 3, push: 30, stun: 14, next: 'ujang_l2',
    hit: { x: 8, w: 25, z: 35, h: 16, depth: 10 }, sfx: 'whoosh',
  },
  ujang_l2: {
    nameKey: 'move_jab', anim: 'palm',
    startup: 2, active: 3, recovery: 7, step: 5,
    damage: 3, push: 30, stun: 14, next: 'ujang_l3',
    hit: { x: 8, w: 25, z: 33, h: 18, depth: 10 }, sfx: 'whoosh',
  },
  ujang_l3: {
    nameKey: 'move_frontkick', anim: 'frontkick',
    startup: 3, active: 3, recovery: 9, step: 8,
    damage: 4, push: 40, stun: 16, next: 'ujang_l4',
    hit: { x: 10, w: 32, z: 8, h: 30, depth: 11 }, sfx: 'whoosh',
  },
  ujang_l4: {
    nameKey: 'move_tendangan_kilat', anim: 'sabit',
    startup: 5, active: 4, recovery: 16, step: 16,
    damage: 8, push: 160, launch: 220, knockdown: true,
    hit: { x: 5, w: 40, z: 25, h: 35, depth: 12 }, sfx: 'whooshBig', shake: 2,
  },
  ujang_heavy: {
    nameKey: 'move_salip', anim: 'jab', lunge: 260,
    startup: 6, active: 12, recovery: 16, step: 0,
    damage: 8, push: 140, launch: 120, knockdown: true,
    hit: { x: 6, w: 30, z: 4, h: 46, depth: 12 }, sfx: 'whooshBig', shake: 2,
  },
  ujang_special: {
    nameKey: 'move_ujang_special', anim: 'ride', special: true, ride: true, lunge: 340,
    startup: 10, active: 48, recovery: 14, step: 0, rehit: 14, invulnFrames: 60,
    damage: 9, push: 230, launch: 260, knockdown: true,
    hit: { x: -10, w: 52, z: 0, h: 46, depth: 18 }, sfx: 'horn', shake: 3, hitstop: 0.06,
  },

  // Mak Inah: fisherwoman — slow, heavy hits, a net that holds enemies.
  inah_l1: {
    nameKey: 'move_tampar', anim: 'palm',
    startup: 6, active: 4, recovery: 13, step: 5,
    damage: 7, push: 60, stun: 22, next: 'inah_l2',
    hit: { x: 8, w: 30, z: 30, h: 20, depth: 11 }, sfx: 'whoosh',
  },
  inah_l2: {
    nameKey: 'move_tampar', anim: 'jab',
    startup: 6, active: 4, recovery: 13, step: 6,
    damage: 8, push: 70, stun: 22, next: 'inah_l3',
    hit: { x: 8, w: 30, z: 32, h: 18, depth: 11 }, sfx: 'whoosh',
  },
  inah_l3: {
    nameKey: 'move_dayung', anim: 'throwPose',
    startup: 11, active: 5, recovery: 22, step: 8,
    damage: 15, push: 190, launch: 220, knockdown: true,
    hit: { x: 6, w: 40, z: 0, h: 52, depth: 13 }, sfx: 'whooshBig', shake: 4, hitstop: 0.08,
  },
  inah_heavy: {
    nameKey: 'move_sweep', anim: 'sweep',
    startup: 12, active: 6, recovery: 22, step: 8,
    damage: 13, push: 120, launch: 160, knockdown: true,
    hit: { x: 0, w: 54, z: 0, h: 16, depth: 13 }, sfx: 'whooshBig', shake: 3,
  },
  inah_special: {
    nameKey: 'move_jala', anim: 'throwPose', special: true, shoot: 'jaring',
    startup: 10, active: 2, recovery: 22, step: 0, invulnFrames: 30, hit: null, sfx: 'whooshBig',
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

  // Stage 1 enemies
  obor_l1: {
    anim: 'palm', weapon: true,
    startup: 12, active: 4, recovery: 20, step: 6,
    damage: 7, push: 80, stun: 20,
    hit: { x: 8, w: 34, z: 26, h: 22, depth: 9 }, sfx: 'whoosh',
  },
  pembakar_fire: {
    anim: 'throwPose', telegraph: true, spawnFire: 3,
    startup: 24, active: 4, recovery: 26, step: 0, hit: null,
  },
  gergaji_l1: {
    anim: 'jab', weapon: true, telegraph: true, rehit: 5,
    startup: 16, active: 22, recovery: 22, step: 14,
    damage: 3, push: 25, stun: 12,
    hit: { x: 10, w: 40, z: 22, h: 22, depth: 10 }, sfx: 'saw',
  },
  dozer_charge: {
    anim: 'none', telegraph: true, lunge: 250, dizzyAfter: 2.2,
    startup: 48, active: 110, recovery: 4, step: 0,
    damage: 16, push: 220, launch: 260, knockdown: true,
    hit: { x: 20, w: 30, z: 0, h: 44, depth: 18 }, sfx: 'horn', shake: 5,
  },
  raja_smash: {
    anim: 'none', telegraph: true, dizzyAfter: 1.9,
    startup: 32, active: 6, recovery: 10, step: 0,
    damage: 18, push: 200, launch: 260, knockdown: true,
    hit: { x: 10, w: 80, z: 0, h: 40, depth: 22 }, sfx: 'whooshBig', shake: 7,
  },
  raja_firewave: {
    anim: 'none', telegraph: true, spawnFire: 6,
    startup: 30, active: 4, recovery: 34, step: 0, hit: null,
  },
  raja_bag: {
    anim: 'none', telegraph: true, throwsBag: true,
    startup: 22, active: 4, recovery: 26, step: 0, hit: null,
  },
  raja_bag_hit: { damage: 10, push: 140, launch: 160, knockdown: true, hit: { x: -12, w: 24, z: -10, h: 22, depth: 14 }, shake: 3 },
  // Stage 2 — Pabrik Tutup
  pentungan_l1: {
    anim: 'jab', weapon: true, startup: 11, active: 3, recovery: 16, step: 6,
    damage: 6, push: 50, stun: 18, next: 'pentungan_l2', hit: { x: 8, w: 32, z: 30, h: 16, depth: 9 }, sfx: 'whoosh',
  },
  pentungan_l2: {
    anim: 'palm', weapon: true, startup: 9, active: 3, recovery: 22, step: 8,
    damage: 8, push: 110, stun: 22, hit: { x: 8, w: 34, z: 26, h: 20, depth: 9 }, sfx: 'whoosh',
  },
  cambuk_l1: {
    anim: 'palm', weapon: true, telegraph: true, startup: 13, active: 4, recovery: 20, step: 4,
    damage: 7, push: 70, stun: 20, hit: { x: 10, w: 62, z: 28, h: 16, depth: 9 }, sfx: 'whoosh',
  },
  robot_punch: {
    anim: 'none', telegraph: true, startup: 18, active: 5, recovery: 22, step: 10,
    damage: 11, push: 140, launch: 160, knockdown: true, hit: { x: 8, w: 34, z: 30, h: 24, depth: 10 }, sfx: 'whooshBig', shake: 2,
  },
  mech_stamp: {
    anim: 'none', telegraph: true, dizzyAfter: 1.7, startup: 30, active: 6, recovery: 10, step: 0,
    damage: 16, push: 180, launch: 240, knockdown: true, hit: { x: 0, w: 76, z: 0, h: 50, depth: 20 }, sfx: 'whooshBig', shake: 6,
  },
  mech_kontrak: { anim: 'none', telegraph: true, shoot: 'kontrak', startup: 18, active: 2, recovery: 20, step: 0, hit: null },
  mech_robot: { anim: 'none', telegraph: true, summon: ['robot'], startup: 22, active: 2, recovery: 26, step: 0, hit: null },

  // Stage 3 — Pasar Rakyat -> Lantai Bursa
  spekulan_shot: { anim: 'throwPose', shoot: 'koin_lempar', startup: 14, active: 2, recovery: 18, step: 0, hit: null },
  rentenir_chain: { anim: 'throwPose', telegraph: true, shoot: 'rantai', startup: 16, active: 2, recovery: 24, step: 0, hit: null },
  karung_slam: {
    anim: 'palm', telegraph: true, startup: 16, active: 5, recovery: 24, step: 8,
    damage: 11, push: 150, launch: 170, knockdown: true, hit: { x: 6, w: 40, z: 10, h: 30, depth: 11 }, sfx: 'whooshBig', shake: 2,
  },
  hantu_dash: {
    anim: 'none', telegraph: true, lunge: 320, dizzyAfter: 1.5, startup: 30, active: 40, recovery: 6, step: 0,
    damage: 12, push: 190, launch: 220, knockdown: true, hit: { x: -10, w: 50, z: -20, h: 70, depth: 16 }, sfx: 'whooshBig', shake: 4,
  },
  hantu_candles: { anim: 'none', telegraph: true, candles: 5, startup: 20, active: 2, recovery: 30, step: 0, hit: null, shake: 4 },
  hantu_notes: { anim: 'none', telegraph: true, shoot: 'uang_kertas', startup: 16, active: 2, recovery: 26, step: 0, hit: null },

  // Stage 4 — Jalan Raya Demo
  provokasi: { anim: 'throwPose', telegraph: true, summon: ['massa'], startup: 20, active: 2, recovery: 24, step: 0, hit: null },
  buzzer_spam: { anim: 'none', shoot: 'spam', startup: 14, active: 2, recovery: 20, step: 0, hit: null },
  truk_semprot: { anim: 'none', telegraph: true, shoot: 'semprotan', startup: 22, active: 2, recovery: 16, step: 0, hit: null },
  truk_tabrak: {
    anim: 'none', telegraph: true, lunge: 240, dizzyAfter: 1.8, startup: 44, active: 90, recovery: 4, step: 0,
    damage: 15, push: 220, launch: 250, knockdown: true, hit: { x: 30, w: 30, z: 0, h: 50, depth: 18 }, sfx: 'horn', shake: 5,
  },
  truk_preman: { anim: 'none', telegraph: true, summon: ['preman_bayaran', 'preman_bayaran'], startup: 20, active: 2, recovery: 30, step: 0, hit: null },

  // Stage 5 — Gedung Pejabat
  koper_l1: {
    anim: 'palm', weapon: true, startup: 12, active: 4, recovery: 18, step: 6,
    damage: 7, push: 90, stun: 20, hit: { x: 6, w: 32, z: 24, h: 20, depth: 9 }, sfx: 'whoosh',
  },
  makelar_heal: { anim: 'throwPose', heal: 20, startup: 24, active: 2, recovery: 20, step: 0, hit: null },
  jaksa_denda: { anim: 'throwPose', telegraph: true, shoot: 'kertas_denda', startup: 16, active: 2, recovery: 22, step: 0, hit: null },
  pejabat_duit: { anim: 'throwPose', shoot: 'duit', startup: 14, active: 2, recovery: 16, step: 0, hit: null },
  pejabat_slam: {
    anim: 'sweep', telegraph: true, dizzyAfter: 1.6, startup: 26, active: 6, recovery: 10, step: 18,
    damage: 15, push: 190, launch: 230, knockdown: true, hit: { x: -10, w: 60, z: 0, h: 30, depth: 18 }, sfx: 'whooshBig', shake: 5,
  },
  pejabat_ajudan: { anim: 'throwPose', telegraph: true, summon: ['ajudan'], startup: 20, active: 2, recovery: 26, step: 0, hit: null },
  kala_slam: {
    anim: 'none', telegraph: true, dizzyAfter: 1.7, startup: 34, active: 6, recovery: 10, step: 0,
    damage: 18, push: 210, launch: 260, knockdown: true, hit: { x: 10, w: 90, z: 0, h: 40, depth: 24 }, sfx: 'whooshBig', shake: 8,
  },
  kala_breath: { anim: 'none', telegraph: true, shoot: 'napas_kala', startup: 24, active: 2, recovery: 20, step: 0, hit: null },
  kala_eclipse: { anim: 'none', telegraph: true, darkness: 6, candles: 4, startup: 30, active: 2, recovery: 30, step: 0, hit: null, shake: 6 },
  kala_fire: { anim: 'none', telegraph: true, spawnFire: 6, startup: 28, active: 2, recovery: 26, step: 0, hit: null },

  fire_burn: { damage: 5, push: 70, stun: 14, hitstop: 0.04, shake: 1 },
};

for (const [id, m] of Object.entries(MOVES)) m.id = id;
