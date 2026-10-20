// Story data. A scene is a list of lines:
//   { wayang: sceneId, textKey }  — shadow-puppet picture with narration
//   { speaker: id, textKey }      — dialogue with a portrait
//   { bribe: amount }             — the Pejabat's offer (choice)
export const SPEAKERS = {
  dalang: { nameKey: 'sp_dalang' },
  bayu: { nameKey: 'hero_bayu', hero: 'bayu' },
  mbah: { nameKey: 'sp_mbah', look: { skin: '#a8744a', top: '#e6e0cc', pants: '#4a3a2a', sleeve: '#e6e0cc', clothLight: '#f6f2e4', sash: '#8a5a2b', headgear: 'peci', hair: '#d8d8d8' } },
  warga: { nameKey: 'sp_warga', look: { skin: '#b07a4f', top: '#5a8a6a', pants: '#6a4a2a', sleeve: '#b07a4f', clothLight: '#7aa08a', sash: '#a4452a', headgear: 'caping', hair: '#1a1210' } },
  buruh: { nameKey: 'ally_buruh', look: { skin: '#a8744a', top: '#3a5a8a', pants: '#2a3a5a', sleeve: '#3a5a8a', clothLight: '#5a7aaa', sash: '#e0b252', headgear: 'helmet', helmet: '#e6e0cc', hair: '#1a1210' } },
  inah: { nameKey: 'hero_inah', look: { skin: '#9a6a44', top: '#3a7a8a', pants: '#8a3a4a', sleeve: '#3a7a8a', clothLight: '#5a9aaa', sash: '#e0b252', headgear: 'kerudung', kerudung: '#c8a050', hair: '#1a1210' } },
  mahasiswa: { nameKey: 'ally_mahasiswa', look: { skin: '#b07a4f', top: '#e0b252', pants: '#2a2a3a', sleeve: '#e0b252', clothLight: '#f2d27a', sash: '#2a2a3a', headgear: 'bandana', bandana: '#f6f2e4', hair: '#1a1210' } },
  pejabat: { nameKey: 'sp_pejabat', look: { skin: '#c8946a', top: '#c8a050', pants: '#8a7040', sleeve: '#c8a050', clothLight: '#e0c070', sash: '#5a3a1a', headgear: 'peci', chain: '#f2c94c', hair: '#1a1210' } },
};

export const STORY = {
  stage0: {
    intro: [
      { wayang: 'kalabendu', textKey: 'st0_w1' },
      { wayang: 'village', textKey: 'st0_w2' },
      { speaker: 'mbah', textKey: 'st0_1' },
      { speaker: 'bayu', textKey: 'st0_2' },
    ],
  },
  stage1: {
    intro: [
      { wayang: 'forest', textKey: 'st1_w1' },
      { speaker: 'warga', textKey: 'st1_1' },
      { speaker: 'bayu', textKey: 'st1_2' },
      { speaker: 'pejabat', textKey: 'st1_bribe' },
      { bribe: 20000 },
    ],
  },
  stage2: {
    intro: [
      { wayang: 'factory', textKey: 'st2_w1' },
      { speaker: 'buruh', textKey: 'st2_1' },
      { speaker: 'bayu', textKey: 'st2_2' },
      { speaker: 'pejabat', textKey: 'st2_bribe' },
      { bribe: 30000 },
    ],
  },
  stage3: {
    intro: [
      { wayang: 'market', textKey: 'st3_w1' },
      { speaker: 'inah', textKey: 'st3_1' },
      { speaker: 'bayu', textKey: 'st3_2' },
      { speaker: 'pejabat', textKey: 'st3_bribe' },
      { bribe: 40000 },
    ],
  },
  stage4: {
    intro: [
      { wayang: 'demo', textKey: 'st4_w1' },
      { speaker: 'mahasiswa', textKey: 'st4_1' },
      { speaker: 'bayu', textKey: 'st4_2' },
      { speaker: 'pejabat', textKey: 'st4_bribe' },
      { bribe: 60000 },
    ],
  },
  stage5: {
    intro: [
      { wayang: 'tower', textKey: 'st5_w1' },
      { speaker: 'bayu', textKey: 'st5_1' },
      { speaker: 'pejabat', textKey: 'st5_bribe' },
      { bribe: 100000 },
    ],
  },
};

export const ENDINGS = {
  good: [
    { wayang: 'kalasuba', textKey: 'end_good_w1' },
    { wayang: 'kalasuba', textKey: 'end_good_w2' },
    { speaker: 'mbah', textKey: 'end_good_1' },
    { speaker: 'bayu', textKey: 'end_good_2' },
    { wayang: 'kalasuba', textKey: 'end_good_title' },
  ],
  neutral: [
    { wayang: 'dawn', textKey: 'end_neutral_w1' },
    { speaker: 'bayu', textKey: 'end_neutral_1' },
    { wayang: 'dawn', textKey: 'end_neutral_title' },
  ],
  bad: [
    { wayang: 'darkruin', textKey: 'end_bad_w1' },
    { speaker: 'pejabat', textKey: 'end_bad_1' },
    { wayang: 'darkruin', textKey: 'end_bad_title' },
  ],
};

// Evidence needed (with no bribes taken) to reach Batara Kala.
export const EVIDENCE_NEEDED = 8;

export function endingFor(save, beatKala) {
  if (save.bribes.length) return 'bad';
  return beatKala ? 'good' : 'neutral';
}

export function totalEvidence(save) {
  return Object.values(save.evidenceBy ?? {}).reduce((a, b) => a + b, 0);
}

export function canFaceKala(save) {
  return save.bribes.length === 0 && totalEvidence(save) >= EVIDENCE_NEEDED;
}
