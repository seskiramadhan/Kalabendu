const STRINGS = {
  id: {
    hintDesktop: 'A/D atau ←/→ jalan · Spasi lompat · F3 FPS',
    fps: 'FPS',
  },
  en: {
    hintDesktop: 'A/D or ←/→ walk · Space jump · F3 FPS',
    fps: 'FPS',
  },
};

let lang = 'id';

export function setLang(code) {
  if (STRINGS[code]) lang = code;
}

export function getLang() {
  return lang;
}

export function t(key) {
  return STRINGS[lang][key] ?? STRINGS.id[key] ?? key;
}
