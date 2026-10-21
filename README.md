# Kalabendu

**Language / Bahasa:** [English](#english) · [Bahasa Indonesia](#bahasa-indonesia)

### ▶ Play now / Main sekarang: **https://seskiramadhan.github.io/Kalabendu/**

Works in the browser on phones and computers. No install. / Jalan di browser HP dan komputer, tanpa instal.

---

## English

### About the game
**Kalabendu** is a 2D side-scrolling beat 'em up with **pencak silat** at its heart, inspired by Streets of Rage 4,
TMNT: Shredder's Revenge and River City Girls.

In Javanese tradition (Ranggawarsita's *Serat Kalatidha* and the Jayabaya prophecies), *Kalabendu* is the "age of curse":
leaders are corrupt, law can be bought, nature turns against people. After it comes *Kalasuba*, an age of peace.

The fictional land of Marcapada has fallen into Kalabendu: burning forests and haze, palm oil swallowing the land,
factories closing, prices rising, hired thugs in the streets, and officials profiting from it all.
Ordinary villagers who train in silat fight their way from the burning forest to the corrupt tower.
It is funny satire with heart: the people win together, and the hardest fight is saying **no** to a bribe.
All characters, companies and places are fictional.

### Suitable age
**10 and up** (our own estimate, not an official rating; about PG / E10+).
Cartoon-style fighting with no blood, no bad language. A scary demon boss and satire about corruption,
bribes and protests: younger kids may want an adult nearby.

### How to play
1. Open the link above. On a phone, turn it sideways for a bigger picture, or keep it upright with the buttons below.
2. Tap **Mulai** (Start). The first stage teaches the controls.
3. Walk right, beat every wave, follow the **GO →** arrow, and defeat the boss at the end.

| Action | Phone | Keyboard | Gamepad |
|---|---|---|---|
| Move (left/right and up/down the street) | left joystick | Arrows / WASD | stick / d-pad |
| Punch (tap again for a combo) | Pukul | J | X |
| Kick (heavy, knocks down) | Tendang | K | Y |
| Jump (+ punch/kick in the air) | Lompat | L / Space | A |
| Dodge roll | Hindar | Shift | bumpers |
| Jurus (special, uses Semangat) | Jurus | I | B |
| Menu / pause | ☰ | Esc | Start |

**Tips**
- **Kuncian (grab):** walk into an enemy. Punch for knee strikes, kick to throw them into others.
- **Semangat** (blue bar) fills when you hit and get hit. When half full, **Jurus** glows: use it to clear a crowd.
- Punch on top of a weapon to pick it up (bambu runcing, golok, ember, kursi plastik). Kick throws it.
- Break carts, drums and boxes for **nasi bungkus** and **es teh** (health), coins and **bukti** (evidence).
- Getting hit makes you drop some rupiah. Grab it back before the thieves do!
- Between stages, spend rupiah at **Warung Mak Inah**. Prices rise every stage.
- Before stages 1–5 an official offers you a **bribe**. Taking it gives money and power, but the world gets darker.
  **Your choices matter. Maybe there is more than one ending…**
- New heroes join as the story goes: **Sri** (after Stage 1), **Ujang** (after Stage 2), **Mak Inah** (after Stage 3).
  Pick them in **Pilih Jagoan** (Character Select).
- Press **☰ → Update** when a new version is out.

**Playing with a friend**
- **Same computer:** Player 2 presses numpad **Enter** (or any button on a second gamepad) to join.
  Numpad: 8/4/5/6 move, 1 punch, 2 kick, 3 jump, 0 dodge, Enter jurus.
- **Online (two phones or computers):** **Main Online → Create room**, send the code to your friend,
  they type it under **Join**. Then the host starts the game as usual.
- If one of you runs out of lives, press Punch to jump back in while the other keeps fighting.

### Stages
| # | Stage | Boss |
|---|---|---|
| 0 | Kampung Saat Fajar (village at dawn, tutorial) | Preman Kampung |
| 1 | Hutan Terbakar → Kebun Sawit (burning forest, palm plantation, flooded river) | Raja Sawit |
| 2 | Pabrik Tutup (closed factory) | Juragan Outsourcing in a giant mech |
| 3 | Pasar Rakyat → Lantai Bursa (market, then trading floor) | Hantu Bursa |
| 4 | Jalan Raya Demo (protest street) | Komandan Preman on a water-cannon truck |
| 5 | Gedung Pejabat (official's glass tower) | Pejabat Tinggi… or is he the last? |

### Heroes
| Hero | Style | Jurus | Represents |
|---|---|---|---|
| Bayu | young pesilat, balanced, fast combos | Badai Sabit (spinning crescent kicks) | Young people with character and culture, the ones who refuse bribes, speak up against corruption, and demand leaders who answer to the law |
| Sri | rice farmer with a cangkul, wide sweeps | Badai Padi (spinning sweep) | Farmers and the land, the ones who guard the forests from burning, keep land in the hands of small farmers, and grow the food we eat |
| Ujang | ojol driver, very fast | Ojol Ngebut (motorbike charge) | Gig and informal workers, the ones who keep the city moving and deserve fair pay, job security, and real protection |
| Mak Inah | fisherwoman, slow but very strong | Lempar Jala (net that holds enemies) | Mothers, women and coastal communities, the ones who hold families together through cooperatives, local markets, and helping each other against hoarders and loan sharks |
| All together | — | — | The people united, the ones who stand together for honest leaders, a protected land, fair work, and strong communities |

### Eras and endings
The world meter goes from **Kalabendu** (0) through **Kalatidha** (40) to **Kalasuba** (80+).
Clearing stages and saving villagers raises it, bribes lower it, and the colours of the world follow it.
How the story ends depends on you. Your choices matter. Maybe there is more than one ending…

### For developers
- Plain JavaScript ES modules + HTML5 Canvas, no frameworks, no build step, no outside art or sound.
- Music: our own gamelan written in code (`tools/music/`, Python): a theme per stage, menu, story, bosses and the final boss.
  Render with `python3 tools/music/render.py <song> --install`; see `tools/music/README.md`.
- Run locally: `python3 -m http.server 8000`, open http://localhost:8000. `?stage=stage3` jumps to a stage,
  `?stage=padepokan` is a training yard, `?net=local` tests online play between two tabs. F3 shows FPS and hitboxes.
- Code: `src/core` (loop, input, gamepad, touch, audio, music, save, i18n), `src/combat` (moves, hits, weapons, shots),
  `src/entities` (fighters, heroes, enemies, allies, items, props), `src/ai`, `src/stages` (one data file per stage),
  `src/systems` (director, environment, era, economy), `src/story`, `src/render` (renderer, parallax, HUD, sprites),
  `src/ui` (menus, screens, story), `src/net` (online rooms and snapshots).
- Game logic is separate from drawing; every player action is an input message `{type:'input', playerId, held, pressed}`.
- Online: the host runs the game and sends snapshots ~20 times a second over WebRTC (PeerJS, loaded only when used);
  the guest sends its buttons and draws the snapshots.
- Sprite sheets: open `tools/sheet.html` for templates; see `assets/sprites/README.md`.
- All text is in `src/core/i18n.js` (Bahasa Indonesia and English).

---

## Bahasa Indonesia

### Tentang game ini
**Kalabendu** adalah game beat 'em up 2D dengan **pencak silat** sebagai jiwanya, terinspirasi Streets of Rage 4,
TMNT: Shredder's Revenge, dan River City Girls.

Dalam tradisi Jawa (*Serat Kalatidha* karya Ranggawarsita dan ramalan Jayabaya), *Kalabendu* adalah "zaman kutukan":
pemimpin korup, hukum bisa dibeli, alam murka. Sesudahnya datang *Kalasuba*, zaman damai dan makmur.

Tanah Marcapada (fiksi) jatuh ke zaman Kalabendu: hutan terbakar dan kabut asap, sawit menelan tanah, pabrik tutup,
harga naik, preman bayaran di jalan, dan pejabat yang mengambil untung dari semuanya.
Warga biasa yang berlatih silat bertarung dari hutan yang terbakar sampai menara para koruptor.
Satire lucu yang hangat: rakyat menang bersama-sama, dan pertarungan tersulit adalah berani bilang **tidak** pada suap.
Semua tokoh, perusahaan, dan tempat adalah fiksi.

### Usia yang cocok
**10 tahun ke atas** (perkiraan kami sendiri, bukan rating resmi; kira-kira PG / E10+).
Perkelahian bergaya kartun tanpa darah dan tanpa kata kasar. Ada bos iblis yang seram dan satire tentang korupsi,
suap, dan demo: anak yang lebih kecil sebaiknya ditemani orang dewasa.

### Cara bermain
1. Buka link di atas. Di HP, miringkan layar untuk gambar lebih besar, atau tetap tegak dengan tombol di bawah.
2. Tekan **Mulai**. Stage pertama mengajarkan kontrolnya.
3. Jalan ke kanan, kalahkan setiap gelombang musuh, ikuti panah **GO →**, dan kalahkan bos di akhir.

| Aksi | HP | Keyboard | Gamepad |
|---|---|---|---|
| Gerak (kiri/kanan dan naik/turun jalan) | joystick kiri | Panah / WASD | stik / d-pad |
| Pukul (tekan lagi untuk combo) | Pukul | J | X |
| Tendang (berat, menjatuhkan) | Tendang | K | Y |
| Lompat (+ pukul/tendang di udara) | Lompat | L / Spasi | A |
| Menghindar (berguling) | Hindar | Shift | bumper |
| Jurus (memakai Semangat) | Jurus | I | B |
| Menu / jeda | ☰ | Esc | Start |

**Tips**
- **Kuncian:** jalan menabrak musuh. Pukul untuk dengkul, tendang untuk membanting dia ke musuh lain.
- **Semangat** (bar biru) terisi saat memukul dan terkena pukulan. Saat setengah penuh, tombol **Jurus** menyala: pakai untuk menyapu keroyokan.
- Pukul di atas senjata untuk mengambilnya (bambu runcing, golok, ember, kursi plastik). Tendang untuk melempar.
- Hancurkan gerobak, drum, dan kardus untuk **nasi bungkus** dan **es teh** (nyawa), koin, dan **bukti**.
- Saat terkena pukulan, sebagian rupiahmu jatuh. Ambil lagi sebelum diambil maling!
- Di antara stage, belanja di **Warung Mak Inah**. Harga naik setiap stage.
- Sebelum stage 1–5, Pak Pejabat menawarkan **suap**. Menerimanya memberi uang dan kekuatan, tapi dunia makin gelap.
  **Pilihanmu menentukan. Mungkin akhir ceritanya tidak hanya satu…**
- Jagoan baru bergabung seiring cerita: **Sri** (setelah Stage 1), **Ujang** (setelah Stage 2), **Mak Inah** (setelah Stage 3).
  Pilih di **Pilih Jagoan**.
- Tekan **☰ → Update** saat ada versi baru.

**Main bersama teman**
- **Satu komputer:** Pemain 2 tekan **Enter** di numpad (atau tombol apa saja di gamepad ke-2) untuk ikut.
  Numpad: 8/4/5/6 gerak, 1 pukul, 2 tendang, 3 lompat, 0 menghindar, Enter jurus.
- **Online (dua HP atau komputer):** **Main Online → Buat Ruang**, kirim kodenya ke teman,
  dia mengetiknya di kolom **Gabung**. Lalu tuan rumah memulai game seperti biasa.
- Kalau salah satu kehabisan nyawa, tekan Pukul untuk kembali selama temannya masih bertarung.

### Stage
| # | Stage | Bos |
|---|---|---|
| 0 | Kampung Saat Fajar (tutorial) | Preman Kampung |
| 1 | Hutan Terbakar → Kebun Sawit (hutan terbakar, kebun sawit, sungai banjir) | Raja Sawit |
| 2 | Pabrik Tutup | Juragan Outsourcing dengan robot raksasa |
| 3 | Pasar Rakyat → Lantai Bursa | Hantu Bursa |
| 4 | Jalan Raya Demo | Komandan Preman di truk penyemprot air |
| 5 | Gedung Pejabat (menara kaca) | Pejabat Tinggi… atau masih ada lagi? |

### Jagoan
| Jagoan | Gaya | Jurus | Mewakili |
|---|---|---|---|
| Bayu | pesilat muda, seimbang, combo cepat | Badai Sabit (tendangan sabit berputar) | Anak muda yang berkarakter dan berbudaya, mereka yang menolak suap, bersuara melawan korupsi, dan menuntut pemimpin yang tunduk pada hukum |
| Sri | petani padi dengan cangkul, sapuan lebar | Badai Padi (sapuan berputar) | Petani dan tanah, mereka yang menjaga hutan dari api, mempertahankan tanah di tangan petani kecil, dan menanam pangan yang kita makan |
| Ujang | ojol, sangat cepat | Ojol Ngebut (seruduk motor) | Pekerja lepas dan informal, mereka yang membuat kota terus bergerak dan layak mendapat upah adil, kepastian kerja, dan perlindungan nyata |
| Mak Inah | nelayan, lambat tapi sangat kuat | Lempar Jala (jala yang menahan musuh) | Ibu, perempuan, dan masyarakat pesisir, mereka yang menyatukan keluarga lewat koperasi, pasar lokal, dan saling bantu melawan penimbun dan rentenir |
| Semua bersama | — | — | Rakyat yang bersatu, mereka yang berdiri bersama untuk pemimpin yang jujur, tanah yang terjaga, kerja yang adil, dan masyarakat yang kuat |

### Zaman dan akhir cerita
Meter dunia bergerak dari **Kalabendu** (0), lewat **Kalatidha** (40), sampai **Kalasuba** (80+).
Menamatkan stage dan menyelamatkan warga menaikkannya, suap menurunkannya, dan warna dunia ikut berubah.
Akhir cerita tergantung padamu. Pilihanmu menentukan. Mungkin akhir ceritanya tidak hanya satu…

### Untuk pengembang
- JavaScript murni (ES modules) + HTML5 Canvas, tanpa framework, tanpa build, tanpa gambar/suara dari luar.
- Musik: gamelan buatan sendiri yang ditulis dengan kode (`tools/music/`, Python): satu lagu per stage, menu, cerita, bos, dan bos terakhir.
- Jalankan lokal: `python3 -m http.server 8000`, buka http://localhost:8000. `?stage=stage3` langsung ke stage itu,
  `?stage=padepokan` tempat latihan, `?net=local` menguji main online di dua tab. F3 menampilkan FPS dan hitbox.
- Struktur kode: lihat bagian *For developers* di atas. Semua teks ada di `src/core/i18n.js` (Bahasa Indonesia dan English).
