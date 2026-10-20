# Kalabendu — notes for Claude

## How to work in this repo
- New chat? Read NEXT.md first (what is done, what is left, in order).
- The game is a pencak silat beat 'em up (since 2026-10-20). The old sandbox version lives on branch `sandbox-v0.3.1`; don't build on it.
- Build one milestone at a time. Each must be playable before starting the next.
- After each milestone: tell the user how to run and test it, update NEXT.md, commit with a clear message, push.
- Plain JavaScript ES modules + HTML5 Canvas. No frameworks, no Three.js, no build step, no external assets.
- Game logic separate from rendering. Player actions are input messages ({type:'input', playerId, held, pressed}) applied by the game, ready for online co-op later.
- Renderer and audio only read game state and game.events; they never change game state.
- All UI text lives in src/core/i18n.js (Bahasa Indonesia default, English option).
- All characters, companies and places are fictional. No real people, politicians, company names or logos.
- Every push that changes the game: bump "version" in version.json and rewrite its "notes" (id + en, short, newest changes). The in-game Update button compares this file.
- Push to master (the user's choice; never main). Tag pushes are blocked by the proxy; use a branch to keep a snapshot.
- Answer the user briefly; they don't like long waits. Start working, give short updates.

## Run
Online (one-click updates): GitHub Pages at https://seskiramadhan.github.io/Kalabendu/ once Pages is enabled (Settings → Pages → Deploy from branch → master / root).
Local:
```
python3 -m http.server 8000
```
Then open http://localhost:8000 (on a phone: http://<laptop-ip>:8000 on the same Wi-Fi).


## Original request (user, 2026-10-20, verbatim) — beat 'em up, updated stage list

Build "Kalabendu", a 2D side-scrolling beat 'em up with an Indonesian theme and a social and environmental message, in plain JavaScript using HTML5 Canvas (no frameworks, no Three.js). It must run in the browser on PC and phones. Inspired by Streets of Rage 4, TMNT: Shredder's Revenge, and River City Girls, with pencak silat as the core fighting style.

Repository:
- Use the GitHub repo seskiramadhan/Kalabendu
- Commit after each milestone with a clear message

Meaning of the name:
- In Javanese tradition (Serat Kalatidha by Ranggawarsita and the Jayabaya prophecies), Kalabendu is the "age of curse": leaders are corrupt, law can be bought, truth is twisted, nature turns against people, and the honest are pushed aside. It is followed by Kalasuba, an age of peace and prosperity.

Story:
- The land of Marcapada has fallen into Kalabendu: burning forests and haze, palm oil (sawit) swallowing the land, factories closing, the rupiah collapsing, prices rising, protests in the streets, and corrupt officials profiting from it all.
- Ordinary villagers trained in pencak silat rise up and fight their way from the burning forest to the corrupt tower at the top, bringing the world into Kalasuba.
- Story arc: nature suffers → people suffer → you find who profits → people unite → you face the source.
- All characters, companies, and places are fictional. No real people, politicians, company names, or logos. Use satire and symbols.
- Tone: energetic, funny satire with heart, not depressing. Treat Indonesian culture and pencak silat respectfully.
- Short story scenes between stages: dialogue boxes with character portraits and wayang-style silhouette cutscenes.

Playable heroes (each with different stats and a special move):
- Bayu: young pesilat, balanced, fast combos
- Sri: rice farmer, strong sweeping attacks with a cangkul
- Ujang: ojol driver, fast dashes and a motorcycle charge special
- Mak Inah: fisherwoman, slow but heavy hits and a net throw that holds enemies
- Start with Bayu only; add the others in later milestones

Combat (most important, make it feel good):
- Belt-scroll movement: left/right and up/down on a 2.5D floor plane, depth sorting by Y
- Light combo (3-4 hits), heavy attack, jump, jump attack, grab and throw, dodge/roll
- Silat-inspired moves with names like "Tendangan Sabit" and "Kuncian"
- Special move using a "Semangat" meter filled by dealing and taking damage
- Hitboxes and hurtboxes, hitstop, screen shake, knockback, juggles, knockdown, get-up invincibility
- Enemy health bars, combo counter, score
- Pickups: nasi bungkus and es teh to heal; weapons: bambu runcing, golok, ember, kursi plastik
- Breakables: gerobak, drums, boxes that drop items or coins
- Enemy AI: approach, keep distance, surround the player, take turns attacking so the player isn't overwhelmed

Stages (in this order, each harder than the last):

Stage 0 - Kampung Saat Fajar (tutorial)
- Scene: the hero's village at dawn, rice fields and warung, smoke rising from the forest in the distance
- Enemies: Preman (basic thugs)
- Boss: Preman Kampung (bigger thug), teaches grab and special move
- Purpose: learn the controls

Stage 1 - Environment: Hutan Terbakar → Kebun Sawit
- Scene: burning rainforest full of orange haze, fading into endless sawit rows, ending at a muddy flooded river
- Enemies: Asap (haze spirits that reduce vision and poison on contact), Pembakar Lahan (arsonists with torches), Penebang Liar (chainsaw loggers), Buldoser Liar (charging bulldozers, mini-boss)
- Boss: Raja Sawit, a giant of palm fronds, logs, and money bags that sets fires and summons bulldozers

Stage 2 - Jobs: Pabrik Tutup
- Scene: dark shoe and ceramic factory at night, silent conveyor belts, "PHK" notices on the gate
- Enemies: Satpam Bayaran (hired guards with shields, teach grabs and heavy attacks), Mandor Kejam (foremen with whips of paperwork), Robot Pengganti (replacement machines)
- Boss: Juragan Outsourcing, a factory boss in a giant mech made of machines and contracts; laid-off workers join as allies during the fight

Stage 3 - Economy: Pasar Rakyat → Lantai Bursa
- Scene: crowded traditional market with prices flipping on chalkboards, leading into a glowing trading floor with falling red charts
- Enemies: Spekulan (suited traders throwing coins from range), Penimbun (hoarders hiding behind rice sacks), Rentenir (loan sharks with debt chains that pull you), falling red candlestick bars as hazards
- Boss: Hantu Bursa, a ghost of crashing charts and shredded rupiah notes; the screen shakes as the "index" falls

Stage 4 - Society: Jalan Raya Demo
- Scene: city streets packed with protesters, burning tires, water cannon trucks, students and ojol drivers fighting alongside you
- Enemies: Preman Bayaran (paid thugs breaking up the protest), Provokator (turns crowd NPCs hostile), Buzzer (floating phones that spam and stun)
- Boss: Komandan Preman, a huge thug leader riding a water cannon truck; beating him lets the crowd march to the tower

Stage 5 - Corruption: Gedung Pejabat
- Scene: luxurious glass tower, elevator fight up to a vault full of gold bars and cash
- Enemies: Tikus Berdasi (rats in neckties that steal coins and run), Ajudan (bodyguards), Makelar Kasus (case brokers who heal the boss), Jaksa Palsu (fake prosecutors who freeze you with "fines")
- Boss: Pejabat Tinggi (the corrupt official who offered bribes all game)
- True final boss: Batara Kala, the embodiment of Kalabendu, only reachable if the player refused every bribe

Each stage has 3-4 "go arrow" sections where enemies spawn before scrolling continues, then a boss.

Era system:
- World meter from Kalabendu to Kalasuba, rising as stages are cleared and villagers are saved
- Backgrounds change with the era: Kalabendu is grey-orange haze and dull colors; as the era improves, skies clear and greens get vivid
- Show the era on stage select and announce changes with a wayang-style title card

Moral choice:
- Before stages 1 to 5, the fictional "Pejabat" offers a bribe (suap): accept for a strong power-up and money, or refuse
- Accepting keeps the world closer to Kalabendu and leads to the bad ending
- Refusing and collecting evidence (bukti) dropped by enemies unlocks Batara Kala and the good ending (Kalasuba)

Economy touch:
- Coins (rupiah) buy healing and upgrades at warung between stages
- Prices rise each stage (inflation), and faster if the player accepted bribes

Graphics and audio:
- No external assets for now. Draw characters with simple procedural pixel art or shapes in code, ready to swap for sprite sheets later (animation states: idle, walk, attack1-3, heavy, jump, hurt, knockdown, getup, grab, throw, special)
- Parallax backgrounds per stage with Indonesian details: warung, angkot, gerobak bakso, rice terraces, sawit rows, factory gates, pasar stalls, trading screens, protest banners, glass tower
- Batik border patterns on menus and HUD
- Simple sound effects with the Web Audio API; keep code ready for gamelan-style music later

Players and multiplayer:
- Single player first, then local co-op for 2 players (keyboard or Gamepad API)
- Keep game logic separate from rendering and design player actions as input messages, so online co-op (PeerJS/WebRTC host-and-join) can be added later

Screen and controls:
- Responsive canvas for landscape (main) and portrait (stage letterboxed, controls in the extra space below)
- Fixed internal resolution (480x270) scaled with crisp pixels, using devicePixelRatio
- Desktop: arrows/WASD move, J light, K heavy, L jump, I special, Shift dodge; player 2 on numpad or gamepad
- Gamepad support for all players
- Mobile: virtual joystick left, attack/heavy/jump/special buttons right, positioned for portrait vs landscape
- UI text in Bahasa Indonesia with an English option (all text in one language file)

Save:
- Save progress, unlocked heroes, era, coins, and bribe choices to localStorage or IndexedDB
- Menu: Mulai (Start), Lanjutkan (Continue), Pilih Jagoan (Character Select), Pengaturan (Settings)

Project setup:
- index.html, style.css, and ES modules in /src
- No build step; runs with a simple local server
- Structure: core (loop, input, audio, save, i18n), combat (hitboxes, damage, combos), entities (player, enemies, bosses, pickups), ai, stages (data-driven stage files), render (camera, parallax, sprites, effects), ui (HUD, menus, dialogue, shop), systems (era, choices, economy)
- Stages, enemies, bosses, and dialogue defined as data so new content is easy to add
- Fixed timestep loop with requestAnimationFrame, 60 FPS on mid-range phones
- Debug toggle (F3) for FPS and hitboxes

Milestones (each must be playable before the next):
1. Bayu moving on a 2.5D floor, light combo, jump, placeholder art, camera
2. Hitboxes, hitstop, knockback, knockdown, Preman enemy with basic AI
3. Stage 0 complete: scrolling sections, waves, pickups, breakables, Preman Kampung boss
4. HUD, health, Semangat meter, special move, combo counter, game over and continue
5. Mobile controls, gamepad, portrait/landscape, Indonesian/English, menus, save
6. Stage 1 (Environment) with Raja Sawit, era system and background changes
7. Stage 2 (Jobs) and Stage 3 (Economy) with their enemies and bosses, warung shop and inflation
8. Story scenes, Pejabat bribe choices, evidence collection, endings
9. Stage 4 (Society) and Stage 5 (Corruption), Pejabat Tinggi and Batara Kala
10. Extra heroes (Sri, Ujang, Mak Inah) and local 2-player co-op

After each milestone, tell me how to run and test it, and commit. Add a README in English and Indonesian explaining the structure, controls, stage list, the meaning of Kalabendu and the eras, the game's message, and how online co-op could be added later.
