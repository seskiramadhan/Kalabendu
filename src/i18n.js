const STRINGS = {
  id: {
    hintDesktop: 'A/D jalan · Spasi lompat · Klik kiri gali · Klik kanan pasang · 1-9 / roda pilih · F3 FPS',
    fps: 'FPS',
    hp: 'Nyawa',
    tile_rumput: 'Rumput',
    tile_tanah: 'Tanah',
    tile_batu_andesit: 'Batu Andesit',
    tile_tanah_liat: 'Tanah Liat',
    tile_pasir: 'Pasir',
    tile_kayu_jati: 'Kayu Jati',
    tile_bambu: 'Bambu',
    tile_daun_kelapa: 'Daun Kelapa',
    tile_bata_merah: 'Bata Merah',
    tile_emas: 'Emas',
    tile_perak: 'Perak',
    tile_tembaga: 'Tembaga',
    tile_batu_bara: 'Batu Bara',
    tile_belerang: 'Belerang',
    tile_pohon_sawit: 'Pohon Sawit',
    tile_tunggul: 'Tunggul',
    tile_lumpur: 'Lumpur',
    tile_bibit: 'Bibit',
    tile_batu_candi: 'Batu Candi',
  },
  en: {
    hintDesktop: 'A/D walk · Space jump · Left click mine · Right click place · 1-9 / wheel select · F3 FPS',
    fps: 'FPS',
    hp: 'Health',
    tile_rumput: 'Grass',
    tile_tanah: 'Soil',
    tile_batu_andesit: 'Andesite Stone',
    tile_tanah_liat: 'Clay',
    tile_pasir: 'Sand',
    tile_kayu_jati: 'Teak Wood',
    tile_bambu: 'Bamboo',
    tile_daun_kelapa: 'Coconut Leaves',
    tile_bata_merah: 'Red Brick',
    tile_emas: 'Gold',
    tile_perak: 'Silver',
    tile_tembaga: 'Copper',
    tile_batu_bara: 'Coal',
    tile_belerang: 'Sulfur',
    tile_pohon_sawit: 'Oil Palm',
    tile_tunggul: 'Tree Stump',
    tile_lumpur: 'Mud',
    tile_bibit: 'Seedling',
    tile_batu_candi: 'Temple Stone',
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

export function formatRupiah(n) {
  return 'Rp ' + Math.round(n).toLocaleString('id-ID');
}
