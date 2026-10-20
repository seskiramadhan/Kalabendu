const KEY = 'kalabendu.save.v1';

const DEFAULT = {
  started: false,
  stage: 'stage0',
  unlocked: ['stage0'],
  heroes: ['bayu'],
  hero: 'bayu',
  era: 10,
  rupiah: 0,
  bribes: [],
  best: {},
  settings: { volume: 0.6, vibrate: true, tips: true, buttons: 'normal' },
};

const clone = (o) => JSON.parse(JSON.stringify(o));

// Progress lives in localStorage; a private window or blocked storage just
// means nothing is remembered.
export function loadSave() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return clone(DEFAULT);
    const data = JSON.parse(raw);
    return { ...clone(DEFAULT), ...data, settings: { ...DEFAULT.settings, ...data.settings } };
  } catch {
    return clone(DEFAULT);
  }
}

export function writeSave(save) {
  try {
    localStorage.setItem(KEY, JSON.stringify(save));
  } catch {}
}

export function resetSave() {
  try {
    localStorage.removeItem(KEY);
  } catch {}
  return clone(DEFAULT);
}
