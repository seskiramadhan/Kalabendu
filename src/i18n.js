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
    tile_batang_jati: 'Batang Jati',
    tile_daun_hutan: 'Daun Hutan',
    tile_batang_kelapa: 'Batang Kelapa',
    tile_batang_bambu: 'Batang Bambu',
    tile_padi: 'Padi',
    tile_batu_vulkanik: 'Batu Vulkanik',
    tile_magma: 'Magma',
    tile_batu_kapur: 'Batu Kapur',
    tile_dinding_anyaman: 'Dinding Anyaman',
    tile_genteng: 'Genteng',
    tile_batang_sawit: 'Batang Sawit',
    tile_daun_sawit: 'Pelepah Sawit',
    loading: 'Membuat dunia Marcapada…',
    biome_0: 'Pantai',
    biome_1: 'Hutan Hujan',
    biome_2: 'Sawah',
    biome_3: 'Hutan Bambu',
    biome_4: 'Gunung Api',
    biome_5: 'Kampung',
    biome_6: 'Kebun Sawit',
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
    tile_batang_jati: 'Teak Trunk',
    tile_daun_hutan: 'Forest Leaves',
    tile_batang_kelapa: 'Coconut Trunk',
    tile_batang_bambu: 'Bamboo Stalk',
    tile_padi: 'Rice',
    tile_batu_vulkanik: 'Volcanic Rock',
    tile_magma: 'Magma',
    tile_batu_kapur: 'Limestone',
    tile_dinding_anyaman: 'Woven Wall',
    tile_genteng: 'Roof Tile',
    tile_batang_sawit: 'Oil Palm Trunk',
    tile_daun_sawit: 'Oil Palm Frond',
    loading: 'Creating the world of Marcapada…',
    biome_0: 'Beach',
    biome_1: 'Rainforest',
    biome_2: 'Rice Terraces',
    biome_3: 'Bamboo Grove',
    biome_4: 'Volcano',
    biome_5: 'Kampung',
    biome_6: 'Oil Palm Plantation',
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
