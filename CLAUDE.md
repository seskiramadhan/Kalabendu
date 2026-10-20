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

## Original request (user, 2026-10-20, verbatim) — beat 'em up

Build "Kalabendu", a 2D side-scrolling beat 'em up with an Indonesian theme and a social and environmental message, in plain JavaScript using HTML5 Canvas (no frameworks, no Three.js). It must run in the browser on PC and phones. Inspired by Streets of Rage 4, TMNT: Shredder's Revenge, and River City Girls, with pencak silat as the core fighting style.

Repository:
- Use the GitHub repo seskiramadhan/Kalabendu
- Commit after each milestone with a clear message

Meaning of the name:
- In Javanese tradition (Serat Kalatidha by Ranggawarsita and the Jayabaya prophecies), Kalabendu is the "age of curse": leaders are corrupt, law can be bought, truth is twisted, nature turns against people, and the honest are pushed aside. It is followed by Kalasuba, an age of peace and prosperity.

Story:
- The land of Marcapada has fallen into Kalabendu: corrupt officials, palm oil (sawit) companies swallowing forests, illegal logging causing floods, haze, rising prices, and suffering villages.
- Ordinary villagers trained in pencak silat rise up to fight back, stage by stage, and bring the world into Kalasuba.
- All characters, companies, and places are fictional. No real people, politicians, company names, or logos. Use satire and symbols.
- Tone: energetic, funny satire with heart, not depressing. Treat Indonesian culture and pencak silat respectfully.
- Short story scenes between stages: dialogue boxes with character portraits, plus wayang-style silhouette cutscenes.

Playable heroes (each with different stats and special move):
- Bayu: young pesilat, balanced, fast combos
- Sri: rice farmer, strong sweeping attacks with a cangkul
- Ujang: ojol driver, fast dashes and a motorcycle charge special
- Mak Inah: fisherwoman, slow but heavy hits and a net throw that holds enemies
- Start with Bayu only; add the others in later milestones

Combat (the most important part, make it feel good):
- Belt-scroll movement: left/right and up/down on a 2.5D floor plane, with depth sorting by Y
- Light attack combo (3-4 hits), heavy attack, jump, jump attack, grab and throw, dodge/roll
- Silat-inspired moves: sweeps, palm strikes, kicks, takedowns (named moves like "Tendangan Sabit", "Kuncian")
- Special move that uses a "Semangat" (spirit) meter filled by dealing and taking damage
- Hitboxes and hurtboxes, hit pause (hitstop), screen shake, knockback, juggles, knockdown and get-up invincibility
- Enemy health bars, combo counter, score
- Pickups: nasi bungkus and es teh to heal, weapons to pick up (bambu runcing, golok, ember, kursi plastik)
- Breakable objects: gerobak, drums, boxes that drop items or coins

Enemies (fictional satire plus folklore):
- Preman (thugs): basic, some with sticks
- Satpam Bayaran (hired guards): block attacks
- Tikus Berdasi (rats in neckties): fast, steal your coins and run
- Buldoser Liar (wild bulldozers): mini-boss, charges across the screen
- Asap (haze spirits): reduce visibility, poison on contact
- Folklore enemies at night stages: tuyul (steals coins), genderuwo (big and strong), kuntilanak (floating, screams to stun)
- Each enemy type has simple AI: approach, keep distance, surround the player, wait their turn so the player isn't overwhelmed

Stages (each tells part of the story):
1. Kampung Diserbu: thugs raid the village at dawn
2. Hutan Terbakar: burning forest full of haze
3. Kebun Sawit: endless sawit rows, Buldoser Liar mini-boss
4. Kota Banjir: flooded town after a landslide, wading slows movement
5. Pasar Malam: night market, folklore creatures appear
6. Gedung Pejabat: corrupt office tower, Tikus Berdasi everywhere, elevator fight
7. Final: Raja Sawit (giant of palm fronds and money bags), then true final boss Batara Kala if the player refused all bribes
- Each stage ends with a boss and has 3-4 "go arrow" sections where enemies spawn before the screen continues scrolling

Era system:
- World meter from Kalabendu to Kalasuba, rising as stages are cleared and villagers are saved
- Backgrounds and colors change with the era: Kalabendu is grey-orange haze and dull colors; as the era improves, skies clear and greens get vivid
- Show era name on stage select and announce changes with a wayang-style title card

Moral choice:
- Before some stages, a fictional "Pejabat" offers a bribe (suap): accept for a strong power-up and money, or refuse
- Accepting keeps the world closer to Kalabendu and leads to a bad ending
- Refusing and collecting evidence (bukti) dropped by enemies unlocks the true final boss and the good ending (Kalasuba)

Graphics and audio:
- No external assets for now. Draw characters with simple procedural pixel art or shapes in code, built so sprite sheets can replace them later (keep an animation system with named states: idle, walk, attack1-3, heavy, jump, hurt, knockdown, getup, grab, throw, special)
- Parallax backgrounds per stage with Indonesian details: warung, angkot, gerobak bakso, rice terraces, sawit rows, flooded streets, neon night market, glass tower
- Batik border patterns on menus and HUD
- Simple sound effects generated with the Web Audio API (hits, whooshes, pickups); keep code ready for gamelan-style music later

Players and multiplayer:
- Single player first
- Then local co-op for 2 players on one keyboard or with gamepads (Gamepad API)
- Keep game logic separate from rendering and design player actions as input messages, so online co-op (PeerJS/WebRTC host-and-join) can be added later

Screen and controls:
- Responsive canvas that works in landscape (main) and portrait (show the stage letterboxed with controls in the extra space below)
- Fixed internal resolution (for example 480x270) scaled up with crisp pixels, using devicePixelRatio
- Desktop: arrows/WASD move, J light, K heavy, L jump, I special, Shift dodge; second player on numpad or gamepad
- Gamepad support for all players
- Mobile: virtual joystick on the left, attack/heavy/jump/special buttons on the right, positioned for portrait vs landscape
- UI text in Bahasa Indonesia with an English option (all text in one language file)

Save:
- Save progress, unlocked heroes, era, and bribe choices to localStorage or IndexedDB
- Menu: Mulai (Start), Lanjutkan (Continue), Pilih Jagoan (Character Select), Pengaturan (Settings)

Project setup:
- index.html, style.css, and ES modules in /src
- No build step; runs with a simple local server
- Clean structure: core (loop, input, audio, save, i18n), combat (hitboxes, damage, combos), entities (player, enemies, bosses, pickups), ai, stages (data-driven stage files), render (camera, parallax, sprites, effects), ui (HUD, menus, dialogue), systems (era, choices)
- Stages, enemies, and dialogue defined as data so new content is easy to add
- Fixed timestep loop with requestAnimationFrame, target 60 FPS on mid-range phones
- Debug toggle (F3) to show FPS and hitboxes

Milestones (each must be playable before the next):
1. Bayu moving on a 2.5D floor, light combo, jump, simple placeholder art, camera
2. Hitboxes, hitstop, knockback, knockdown, one Preman enemy with basic AI
3. Stage 1 with scrolling sections, enemy waves, pickups, breakables, boss
4. HUD, health, Semangat meter, special move, combo counter, game over and continue
5. Mobile touch controls, gamepad, portrait/landscape, Indonesian/English, menus, save
6. Stages 2-4, new enemies, Buldoser Liar mini-boss, era system with background changes
7. Story scenes, Pejabat bribe choices, evidence collection, endings
8. Stages 5-7, folklore enemies, Raja Sawit and Batara Kala bosses
9. Extra heroes (Sri, Ujang, Mak Inah) and local 2-player co-op

After each milestone, tell me how to run and test it, and commit. Add a README in English and Indonesian explaining the structure, controls, the meaning of Kalabendu and the eras, the game's message, and how online co-op could be added later.
