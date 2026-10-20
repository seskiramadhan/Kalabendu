const STRINGS = {
  id: {
    hintDesktop: 'Panah/WASD gerak · J pukul · K tendang berat · L lompat · Shift menghindar · Esc menu · F3 debug',
    loading: 'Memuat…',
    hero_bayu: 'Bayu',
    stage_padepokan: 'Padepokan — Latihan',
    move_jab: 'Pukulan Lurus',
    move_palm: 'Tamparan Telapak',
    move_frontkick: 'Tendangan Depan',
    move_sabit: 'Tendangan Sabit',
    move_sweep: 'Sapuan Kaki',
    move_airkick: 'Tendangan Terbang',
    move_airpunch: 'Pukulan Melayang',
    enemy_preman: 'Preman',
    menu: 'Menu (Esc)',
    menuTitle: 'KALABENDU',
    resume: 'Lanjutkan',
    restart: 'Ulangi Stage',
    restartConfirm: 'Ulangi stage dari awal?',
    loadWorld: 'Pilih Jagoan',
    soon: 'segera',
    language: 'Bahasa',
    version: 'Versi',
    updateAvailable: 'Update baru tersedia:',
    updateNow: 'Update sekarang',
    checkUpdate: 'Cek update',
    upToDate: 'Sudah versi terbaru.',
    whatsNew: 'Yang baru:',
    menuHint: 'Esc untuk buka / tutup menu',
    hintTouch: 'Joystick kiri untuk gerak · tombol kanan untuk bertarung',
    btnLight: 'Pukul',
    btnHeavy: 'Tendang',
    btnJump: 'Lompat',
    btnDodge: 'Hindar',
    btnSpecial: 'Jurus',
  },
  en: {
    hintDesktop: 'Arrows/WASD move · J punch · K heavy kick · L jump · Shift dodge · Esc menu · F3 debug',
    loading: 'Loading…',
    hero_bayu: 'Bayu',
    stage_padepokan: 'Padepokan — Training',
    move_jab: 'Straight Punch (Pukulan Lurus)',
    move_palm: 'Palm Strike (Tamparan Telapak)',
    move_frontkick: 'Front Kick (Tendangan Depan)',
    move_sabit: 'Crescent Kick (Tendangan Sabit)',
    move_sweep: 'Leg Sweep (Sapuan Kaki)',
    move_airkick: 'Flying Kick (Tendangan Terbang)',
    move_airpunch: 'Air Punch (Pukulan Melayang)',
    enemy_preman: 'Thug (Preman)',
    menu: 'Menu (Esc)',
    menuTitle: 'KALABENDU',
    resume: 'Resume',
    restart: 'Restart Stage',
    restartConfirm: 'Restart the stage from the beginning?',
    loadWorld: 'Character Select',
    soon: 'coming soon',
    language: 'Language',
    version: 'Version',
    updateAvailable: 'New update available:',
    updateNow: 'Update now',
    checkUpdate: 'Check for update',
    upToDate: 'You have the newest version.',
    whatsNew: "What's new:",
    menuHint: 'Esc to open / close the menu',
    hintTouch: 'Left stick to move · right buttons to fight',
    btnLight: 'Punch',
    btnHeavy: 'Kick',
    btnJump: 'Jump',
    btnDodge: 'Dodge',
    btnSpecial: 'Special',
  },
};

const LANG_KEY = 'kalabendu.lang';
let lang = 'id';
try {
  const saved = localStorage.getItem(LANG_KEY);
  if (STRINGS[saved]) lang = saved;
} catch {}
document.documentElement.lang = lang;

export function setLang(code) {
  if (!STRINGS[code]) return;
  lang = code;
  document.documentElement.lang = code;
  try {
    localStorage.setItem(LANG_KEY, code);
  } catch {}
}

export function getLang() {
  return lang;
}

export function t(key) {
  return STRINGS[lang][key] ?? STRINGS.id[key] ?? key;
}
