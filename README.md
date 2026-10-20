# Kalabendu

A 2D side-scrolling beat 'em up with pencak silat at its heart, set in the fictional land of Marcapada.
Plain JavaScript + HTML5 Canvas, no frameworks, no build step, no external assets. Runs in the browser on PC and phones.

*Bahasa Indonesia ada di bawah.*

**Play:** https://seskiramadhan.github.io/Kalabendu/

---

## English

### The name
In Javanese tradition (Ranggawarsita's *Serat Kalatidha* and the Jayabaya prophecies), **Kalabendu** is the "age of curse":
leaders are corrupt, law can be bought, truth is twisted, nature turns against people and the honest are pushed aside.
It is followed by **Kalasuba**, an age of peace and prosperity. Between them sits **Kalatidha**, the age of doubt.

### The story and its message
Marcapada has fallen into Kalabendu: burning forests and haze, palm-oil plantations swallowing the land, factories closing,
the rupiah collapsing, prices rising, protests in the streets, and corrupt officials profiting from all of it.
Ordinary villagers trained in pencak silat rise up and fight their way from the burning forest to the corrupt tower.

The arc: **nature suffers → people suffer → you find who profits → people unite → you face the source.**
The game is satire with heart: no single hero fixes things, the farmers, workers, traders, students and ojol drivers do it together,
and the most important fight is saying **no** to the bribe. All characters, companies and places are fictional.

### Eras
A world meter runs from 0 (Kalabendu) to 100 (Kalasuba). It starts at 10.
- **Kalabendu** (0–39): grey-orange haze and dull colours.
- **Kalatidha** (40–79): hope begins to grow, the sky starts to clear.
- **Kalasuba** (80–100): clear skies, vivid green.

Clearing a stage and saving villagers raises the era; accepting a bribe lowers it. Backgrounds are colour-graded by the era,
and each change is announced with a wayang card.

### Bribes, evidence and endings
Before stages 1–5 the Pejabat offers a bribe (suap). Accept: money and +30% attack for that stage, but the era sinks and prices climb.
Refuse: the era rises a little. Enemies and bosses drop **bukti** (evidence).
- Any bribe accepted → bad ending (Kalabendu goes on).
- Every bribe refused and enough evidence (8) → **Batara Kala** appears after the Pejabat Tinggi → good ending (Kalasuba).
- Otherwise → the halfway ending.

### Stages
| # | Stage | Theme | Enemies | Boss |
|---|---|---|---|---|
| 0 | Kampung Saat Fajar | tutorial | Preman | Preman Kampung |
| 1 | Hutan Terbakar → Kebun Sawit | environment | Asap, Pembakar Lahan, Penebang Liar, Buldoser Liar (mini-boss) | Raja Sawit |
| 2 | Pabrik Tutup | jobs | Satpam Bayaran, Mandor Kejam, Robot Pengganti | Juragan Outsourcing (laid-off workers help) |
| 3 | Pasar Rakyat → Lantai Bursa | economy | Spekulan, Penimbun, Rentenir, falling red candlesticks | Hantu Bursa |
| 4 | Jalan Raya Demo | society | Preman Bayaran, Provokator, Buzzer (students and ojol drivers help) | Komandan Preman on a water-cannon truck |
| 5 | Gedung Pejabat | corruption | Tikus Berdasi, Ajudan, Makelar Kasus, Jaksa Palsu | Pejabat Tinggi, then Batara Kala (true final boss) |

Between stages: a story scene with wayang silhouettes, the Pejabat's offer, and the **warung** where rupiah buys healing and upgrades.
Prices rise every stage (inflation), faster if you took bribes.

### Heroes
| Hero | Style | Jurus (special) | Unlocks |
|---|---|---|---|
| Bayu | young pesilat, balanced, fast combos | Badai Sabit (spinning crescent kicks) | start |
| Sri | rice farmer, wide sweeps with a cangkul | Badai Padi (spinning sweep) | after Stage 1 |
| Ujang | ojol driver, fast dashes | Ojol Ngebut (motorbike charge) | after Stage 2 |
| Mak Inah | fisherwoman, slow but heavy hits | Lempar Jala (net that holds enemies) | after Stage 3 |

The Jurus costs half the **Semangat** meter, which fills by dealing and taking damage.

### Controls
| Action | Keyboard (P1) | Numpad (P2) | Gamepad | Touch |
|---|---|---|---|---|
| Move | Arrows / WASD | 8 4 5 6 | stick / d-pad | left joystick |
| Punch (light combo) | J | 1 | X | Pukul |
| Kick (heavy) | K | 2 | Y | Tendang |
| Jump | L / Space | 3 | A | Lompat |
| Jurus (special) | I | Enter | B | Jurus |
| Dodge | Shift | 0 | bumpers / triggers | Hindar |
| Menu | Esc | | Start | ☰ |

- Grab (Kuncian): walk into an enemy (a boss only when it is dizzy); punch for knee strikes, kick (or away + punch) to throw.
- Jump + punch/kick for air attacks. Pick up weapons with punch (bambu runcing, golok, ember, kursi plastik); kick throws them.
- **2 players:** Player 2 presses numpad Enter or any button on the second gamepad to join (settings can switch P2 to the first gamepad).
  If one player runs out of lives, they press Punch to come back while the other keeps fighting.
- F3 shows FPS and hitboxes.

### Run it
```
python3 -m http.server 8000
```
Open http://localhost:8000 (on a phone on the same Wi-Fi: http://<laptop-ip>:8000).
Add `?stage=stage3` (or any stage id) to jump straight into a stage; `?stage=padepokan` is a training yard.
The in-game Update button compares `version.json` with the running version.

### Code structure
```
index.html, style.css, sw.js, version.json
src/
  main.js        app flow: menus, story, bribes, shop, saving, input routing (P1/P2)
  game.js        the Game: entities, hits, drops, money, co-op, camera, stage clear
  core/          loop (fixed 60 Hz), input (keyboard), gamepad, touch, audio (Web Audio), save (localStorage), i18n (all text, ID + EN), view
  combat/        moves (frame data), hits (hitboxes, damage, block, juggles), weapons, shots
  entities/      fighter (shared state machine), heroes, enemies, allies, items, props
  ai/            brawler, bosses, stage-specific and shared brains (ranged, support, thief, ally…)
  stages/        one data file per stage: sections, waves, props, items, zones
  systems/       director (GO arrows, waves), environment (fire, haze, rescues), era, economy (shop, inflation)
  story/         story scenes, endings, wayang scene drawings
  render/        renderer, parallax backgrounds, HUD, effects, sprites (pose skeleton, monsters, objects)
  ui/            pause menu, screens (title, heroes, stages, settings, shop), story overlay
```
Rules the code follows:
- Game logic is separate from rendering and audio. The renderer and audio only read the game state and `game.events`.
- Every player action is an input message `{type:'input', playerId, held, pressed}` (bit flags from `BTN`), plus `{type:'continue', playerId}`.
- Stages, enemies, bosses, moves and dialogue are data, so new content is mostly new entries in those files.
- Characters are drawn in code with a pose skeleton (idle, walk, attacks, jump, hurt, knockdown, getup, grab, throw, special…),
  ready to be swapped for sprite sheets later.

### Adding online co-op later
The pieces are already shaped for it:
1. **Inputs are messages.** Local co-op already feeds `p1` and `p2` messages into `game.applyInput`. Online, the guest sends its
   messages over a WebRTC data channel (for example PeerJS: the host shares a room code, the guest connects with it).
2. **Host runs the game.** The host applies both players' messages, steps the game at a fixed 60 Hz, and sends the guest a compact
   snapshot (positions, states, hp, timers, events) 15–20 times a second. The guest only renders snapshots, smoothing between them.
3. **Deterministic option.** The game uses a seeded random generator (`game.rand`), so a lockstep or rollback model (both sides
   simulate, only inputs are sent) is possible too; it needs the frame number on every input message.
4. **Menus and story** stay on the host; the guest gets a "waiting for host" screen and the host's choices (bribe, shop) as events.

---

## Bahasa Indonesia

### Arti nama
Dalam tradisi Jawa (*Serat Kalatidha* karya Ranggawarsita dan ramalan Jayabaya), **Kalabendu** adalah "zaman kutukan":
pemimpin korup, hukum bisa dibeli, kebenaran diputarbalikkan, alam murka, dan orang jujur tersingkir.
Sesudahnya datang **Kalasuba**, zaman damai dan makmur. Di antaranya ada **Kalatidha**, zaman ragu.

### Cerita dan pesannya
Marcapada jatuh ke zaman Kalabendu: hutan terbakar dan kabut asap, kebun sawit menelan tanah, pabrik tutup, rupiah anjlok,
harga naik, demo di jalan, dan pejabat korup mengambil untung dari semuanya.
Warga biasa yang berlatih pencak silat bangkit dan bertarung dari hutan yang terbakar sampai menara para koruptor.

Alurnya: **alam menderita → rakyat menderita → kau temukan siapa yang untung → rakyat bersatu → kau hadapi sumbernya.**
Gamenya satire yang hangat: bukan satu jagoan yang menyelamatkan, tapi petani, buruh, pedagang, mahasiswa, dan ojol bersama-sama,
dan pertarungan terpenting adalah berani bilang **tidak** pada suap. Semua tokoh, perusahaan, dan tempat adalah fiksi.

### Zaman
Meter dunia dari 0 (Kalabendu) sampai 100 (Kalasuba), mulai dari 10.
- **Kalabendu** (0–39): kabut abu-oranye, warna kusam.
- **Kalatidha** (40–79): harapan tumbuh, langit mulai cerah.
- **Kalasuba** (80–100): langit bersih, hijau segar.

Menamatkan stage dan menyelamatkan warga menaikkan zaman; menerima suap menurunkannya. Warna latar mengikuti zaman,
dan setiap pergantian zaman diumumkan dengan kartu wayang.

### Suap, bukti, dan akhir cerita
Sebelum stage 1–5, Pak Pejabat menawarkan suap. Terima: uang dan serangan +30% untuk stage itu, tapi zaman makin gelap dan harga naik.
Tolak: zaman naik sedikit. Musuh dan bos menjatuhkan **bukti**.
- Pernah menerima suap → akhir buruk (Kalabendu berlanjut).
- Semua suap ditolak dan bukti cukup (8) → **Batara Kala** muncul setelah Pejabat Tinggi → akhir baik (Kalasuba).
- Selain itu → akhir setengah jalan.

### Stage
| # | Stage | Tema | Musuh | Bos |
|---|---|---|---|---|
| 0 | Kampung Saat Fajar | tutorial | Preman | Preman Kampung |
| 1 | Hutan Terbakar → Kebun Sawit | lingkungan | Asap, Pembakar Lahan, Penebang Liar, Buldoser Liar (bos kecil) | Raja Sawit |
| 2 | Pabrik Tutup | pekerjaan | Satpam Bayaran, Mandor Kejam, Robot Pengganti | Juragan Outsourcing (buruh PHK membantu) |
| 3 | Pasar Rakyat → Lantai Bursa | ekonomi | Spekulan, Penimbun, Rentenir, lilin merah jatuh | Hantu Bursa |
| 4 | Jalan Raya Demo | sosial | Preman Bayaran, Provokator, Buzzer (mahasiswa dan ojol membantu) | Komandan Preman di truk air |
| 5 | Gedung Pejabat | korupsi | Tikus Berdasi, Ajudan, Makelar Kasus, Jaksa Palsu | Pejabat Tinggi, lalu Batara Kala (bos terakhir sejati) |

Di antara stage: adegan cerita dengan wayang, tawaran Pak Pejabat, dan **warung** tempat membeli makanan dan peningkatan dengan rupiah.
Harga naik tiap stage (inflasi), lebih cepat kalau kau menerima suap.

### Jagoan
| Jagoan | Gaya | Jurus | Terbuka |
|---|---|---|---|
| Bayu | pesilat muda, seimbang, combo cepat | Badai Sabit (tendangan sabit berputar) | dari awal |
| Sri | petani padi, sapuan lebar dengan cangkul | Badai Padi (sapuan berputar) | setelah Stage 1 |
| Ujang | ojol, lari cepat | Ojol Ngebut (seruduk motor) | setelah Stage 2 |
| Mak Inah | nelayan, lambat tapi pukulannya berat | Lempar Jala (jala yang menahan musuh) | setelah Stage 3 |

Jurus memakai setengah meter **Semangat**, yang terisi saat memukul dan terkena pukulan.

### Kontrol
| Aksi | Keyboard (P1) | Numpad (P2) | Gamepad | Layar sentuh |
|---|---|---|---|---|
| Gerak | Panah / WASD | 8 4 5 6 | stik / d-pad | joystick kiri |
| Pukul (combo ringan) | J | 1 | X | Pukul |
| Tendang (berat) | K | 2 | Y | Tendang |
| Lompat | L / Spasi | 3 | A | Lompat |
| Jurus | I | Enter | B | Jurus |
| Menghindar | Shift | 0 | bumper / trigger | Hindar |
| Menu | Esc | | Start | ☰ |

- Kuncian: jalan menabrak musuh (bos hanya saat pusing); pukul untuk dengkul, tendang (atau arah menjauh + pukul) untuk membanting.
- Lompat + pukul/tendang untuk serangan udara. Ambil senjata dengan pukul (bambu runcing, golok, ember, kursi plastik); tendang untuk melempar.
- **Main berdua:** Pemain 2 tekan Enter numpad atau tombol apa saja di gamepad ke-2 untuk ikut (di Pengaturan bisa diganti ke gamepad ke-1).
  Kalau satu pemain habis nyawa, tekan Pukul untuk kembali selama temannya masih bertarung.
- F3 menampilkan FPS dan hitbox.

### Menjalankan
```
python3 -m http.server 8000
```
Buka http://localhost:8000 (di HP dalam Wi-Fi yang sama: http://<ip-laptop>:8000).
Tambahkan `?stage=stage3` (atau id stage lain) untuk langsung ke stage itu; `?stage=padepokan` adalah tempat latihan.
Tombol Update di dalam game membandingkan `version.json` dengan versi yang sedang jalan.

### Struktur kode
Lihat bagian *Code structure* di atas. Intinya: logika game terpisah dari gambar dan suara, setiap aksi pemain adalah pesan input,
dan stage, musuh, bos, jurus, serta dialog ditulis sebagai data sehingga konten baru mudah ditambahkan.

### Menambah co-op online nanti
1. **Input sudah berupa pesan.** Co-op lokal sudah mengirim pesan `p1` dan `p2` ke `game.applyInput`. Untuk online, tamu mengirim
   pesannya lewat WebRTC (misalnya PeerJS: tuan rumah membagikan kode ruang, tamu tersambung dengan kode itu).
2. **Tuan rumah menjalankan game.** Tuan rumah memproses input kedua pemain pada 60 Hz dan mengirim potongan keadaan game
   (posisi, status, nyawa, event) 15–20 kali per detik. Tamu hanya menggambar dan menghaluskan gerakannya.
3. **Pilihan deterministik.** Game memakai angka acak dengan seed (`game.rand`), jadi model lockstep atau rollback juga mungkin
   (kedua sisi menjalankan simulasi, yang dikirim hanya input beserta nomor frame).
4. **Menu dan cerita** tetap di tuan rumah; tamu melihat layar "menunggu tuan rumah" dan menerima pilihan tuan rumah (suap, warung) sebagai event.
