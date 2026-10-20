# Kalabendu — notes for Claude

## How to work in this repo
- New chat? Read NEXT.md first (what is done, what is left, in order).
- Build one milestone at a time. Each must be playable before starting the next.
- After each milestone: tell the user how to run and test it, update NEXT.md, commit with a clear message, push.
- Plain JavaScript ES modules + HTML5 Canvas. No frameworks, no Three.js, no build step, no external assets.
- Game logic separate from rendering. Every player action is an action message applied to world state (ready for multiplayer later).
- All UI text lives in src/i18n.js (Bahasa Indonesia default, English option).
- All characters, companies and places are fictional. No real people, politicians, company names or logos.
- Every push that changes the game: bump "version" in version.json and rewrite its "notes" (id + en, short, newest changes). The in-game Update button compares this file.
- Push to master (the user's choice; never main).
- Answer the user briefly; they don't like long waits. Start working, give short updates.

## Run
Online (one-click updates): GitHub Pages at https://seskiramadhan.github.io/Kalabendu/ once Pages is enabled (Settings → Pages → Deploy from branch → master / root).
Local:
```
python3 -m http.server 8000
```
Then open http://localhost:8000 (on a phone: http://<laptop-ip>:8000 on the same Wi-Fi).

## Original request (user, 2026-10-20, verbatim)

Build "Kalabendu", a 2D sandbox game like Terraria with an Indonesian theme and a social and environmental message, in plain JavaScript using HTML5 Canvas (no frameworks, no Three.js). It must run in the browser on PC and phones.

Repository:
- Use the GitHub repo seskiramadhan/Kalabendu (new and empty)
- Commit after each milestone with a clear message

Meaning of the name:
- In Javanese tradition (Serat Kalatidha by Ranggawarsita and the Jayabaya prophecies), Kalabendu is the "age of curse": leaders are corrupt, law can be bought, truth is twisted, nature turns against people, and the honest are pushed aside. It is followed by Kalasuba, an age of peace and prosperity.
- The game is built around this cycle of three eras:
  1. Kalatidha: age of doubt, the world starts to decay
  2. Kalabendu: age of curse, damage and corruption peak
  3. Kalasuba: age of prosperity, reached only through the player's actions

Story:
- The world of Marcapada (the human world) is falling into Kalabendu: corrupt officials, endless palm oil (sawit) monoculture, illegal logging, floods, rising prices, and suffering villages.
- The player is an ordinary villager who restores forests, helps the kampung, and exposes corruption to bring the world into Kalasuba.
- All characters, companies, and places are fictional. Do not use real people, real politicians, real company names, or real logos. Use satire and symbols.
- Tone: hopeful and playful satire, not depressing. Treat Javanese and Indonesian culture respectfully.

Era system (core mechanic):
- A world "Era meter" from Kalabendu (0) to Kalasuba (100), calculated from forest health, kampung wellbeing, and corruption level
- The current era changes visuals: Kalabendu has hazy grey-orange skies, dull colors, more enemies and disasters; Kalasuba has clear skies, vivid green, rich wildlife, and peaceful villages
- Show the current era name on the HUD and announce era changes with a short wayang-style title card

World layers (top to bottom):
- Sky: clouds, floating islands, candi-like ruins
- Surface: rice terraces, tropical rainforest, bamboo groves, beaches, volcanoes, kampung villages, and spreading sawit plantations
- Underground: red clay, andesite stone, limestone caves, coal seams
- Deep: hot volcanic rock near magma

Indonesian tiles and items:
- tanah, tanah liat, batu andesit, pasir, kayu jati, bambu, daun kelapa, bata merah, emas, perak, tembaga, batu bara, belerang, pohon sawit, tunggul (tree stump), lumpur (mud), bibit (seedling)
- Generate pixel textures in code (no external assets): warm earthy colors, terracotta, teak brown, jungle green, sawit's dull uniform green, volcanic black, subtle batik patterns on decorative blocks

Social and environmental systems (simple and data-driven so they can grow later):
- Forest health: each surface region tracks how much natural forest remains
- Sawit spread: plantations slowly expand into nearby forest, replacing diverse trees with uniform rows; wildlife and rare items disappear there
- Floods and landslides: hillsides with too little forest can trigger mud floods or landslides during heavy rain, damaging the kampung
- Haze (asap): forest fires near sawit areas create haze that lowers vision and health
- Replanting: plant bibit to restore forest and stop sawit spread
- Kampung wellbeing: affected by floods, haze, prices, and forest health; happier villages unlock helpful NPCs and trades
- Prices: shop prices in rupiah rise slowly over time (inflation), faster during Kalabendu
- Corruption: a fictional "Pejabat" (official) offers bribes (suap) to look away from illegal logging. Accepting gives quick money but raises corruption and pushes the world toward Kalabendu. Refusing and collecting evidence (bukti) lets the player expose them later.

Enemies and bosses (fictional satire plus folklore):
- Tikus Berdasi (rats in neckties) that steal coins and items from chests
- Buldoser Liar (wild bulldozers) that clear forest tiles
- Asap (haze spirits) from forest fires
- Night and cave folklore enemies: tuyul (steals coins), genderuwo, kuntilanak
- Future boss: Raja Sawit, a giant made of palm fronds and money bags
- Future boss: Batara Kala, the embodiment of the cursed age, fought to end Kalabendu

Project setup:
- index.html, style.css, and ES modules in /src
- No build step needed; runs with a simple local server
- Clean structure: world, worldgen, player, physics, input, render, camera, inventory, save, ui, i18n, systems (era, forest, sawit, weather, economy, kampung, corruption)
- Keep world/game logic separate from rendering, so multiplayer can be added later (host-and-join with PeerJS/WebRTC). Design all player actions as "input/action messages" that update world state.

World:
- Tile-based, large long world (start with 4200 x 1200 tiles)
- Typed arrays (Uint8Array), split into 32x32 chunks
- Only draw visible chunks; pre-render each chunk to an offscreen canvas, redraw only when a tile changes
- Seeded noise world generation with the biomes above, caves, ores by depth, and starting sawit plantations on one side
- Slow world systems (sawit spread, forest health, era) update in small batches per tick to stay fast

Player:
- Walk, jump, gravity, smooth tile collision
- Camera follows player and clamps to world edges
- Mine and place tiles within range
- Health and money (rupiah)

Inventory:
- Hotbar with 9 slots, item stacks
- Mined blocks go into inventory; selected block can be placed

Save/Load:
- IndexedDB (only changed chunks if possible), plus all world system state
- Auto-save every 60 seconds and on page hide
- Menu: Dunia Baru (New World), Muat Dunia (Load World)

Screen and controls:
- Responsive canvas in portrait and landscape, resizes on window resize and orientation change
- Consistent tile size; the camera shows more or fewer tiles
- Desktop: WASD/arrows, Space jump, mouse left mine, right place, 1-9 / wheel hotbar
- Mobile: joystick (left), jump and mine/place toggle (right), tap a tile to mine or place
- Reposition UI for portrait vs landscape so it never covers the player
- devicePixelRatio for sharp rendering
- Batik border patterns on menus and hotbar, wayang-style silhouette title screen with the title "KALABENDU"
- UI text in Bahasa Indonesia with an English option (all text in one language file)
- HUD shows era, forest health, kampung wellbeing, and rupiah

Performance:
- 60 FPS on mid-range phones
- Fixed timestep loop with requestAnimationFrame
- FPS counter (toggle F3)

Milestones (each must be playable before the next):
1. Small flat world, movement, jumping, collision, camera
2. Mining and placing, hotbar, Indonesian tile set
3. Full generated world with biomes, kampung, sawit, chunks
4. Save/load with IndexedDB
5. Mobile controls, portrait/landscape, batik UI, Indonesian/English
6. Forest health, sawit spread, replanting, rain with floods/landslides, haze
7. Era system (Kalatidha, Kalabendu, Kalasuba) with visual changes
8. Kampung wellbeing, rupiah economy with inflation, simple shop NPC
9. Tikus Berdasi and Buldoser Liar enemies, Pejabat bribe choice and evidence system

After each milestone, tell me how to run and test it, and commit. Add a README in English and Indonesian explaining the structure, the meaning of Kalabendu and the three eras, the game's message, and how multiplayer could be added later.

Future ideas (keep code ready, don't build yet):
- Folklore enemies, Raja Sawit and Batara Kala bosses
- Crafting: keris, golok, obor, bibit, cangkul
- Gamelan-style music that changes by era
- Endings based on the final era and whether the player took bribes
