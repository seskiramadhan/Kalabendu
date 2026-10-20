# NEXT — Kalabendu plan

Status line: **Milestone 3 done, Milestone 4 next** (2026-10-20)

## Milestones (each playable before the next)
| # | Milestone | Status |
|---|---|---|
| 1 | Small flat world, movement, jumping, collision, camera, fixed-timestep loop, F3 FPS | done |
| 2 | Mining and placing, 9-slot hotbar with stacks, Indonesian tile set with code-made pixel textures | done |
| 3 | Full generated world 4200x1200 (seeded noise): biomes, caves, ores by depth, kampung, sawit; 32x32 chunks pre-rendered offscreen | done |
| 4 | Save/load with IndexedDB (changed chunks + system state), autosave 60 s + on page hide, menu Dunia Baru / Muat Dunia | todo |
| 5 | Mobile controls (joystick, jump, mine/place toggle, tap), portrait/landscape layout, batik UI, wayang title screen, ID/EN | todo |
| 6 | Forest health per region, sawit spread, bibit replanting, rain + floods/landslides, karhutla (forest fires that start near sawit and spread) + haze | todo |
| 7 | Era meter (Kalatidha / Kalabendu / Kalasuba), era visuals, wayang title card on era change | todo |
| 8 | Kampung wellbeing, rupiah economy with inflation, shop NPC | todo |
| 9 | Tikus Berdasi + Buldoser Liar enemies, Pejabat bribe choice, bukti (evidence) and exposing | todo |
| — | README in English + Indonesian (structure, meaning, eras, message, multiplayer plan) | todo (with M9 or earlier) |

## Extra (user asked, 2026-10-20)
| What | Status |
|---|---|
| Esc / ☰ menu: resume, new world, language, version + update button with what's new (version.json, sw.js network-first) | done (v0.3.1) |
| GitHub Pages hosting so Update works without git pull | waiting for user to enable Pages |

## Future (keep code ready, don't build yet)
- Folklore enemies (tuyul, genderuwo, kuntilanak), bosses Raja Sawit and Batara Kala
- Crafting: keris, golok, obor, bibit, cangkul
- Gamelan-style music by era
- Endings by final era and whether the player took bribes
- Multiplayer host-and-join (PeerJS/WebRTC) using the action-message design

## Notes
- World: west beach → forest → kampung Sukamakmur (spawn) → sawah → bambu → forest → volcano → … → kampung Tirtamulya next to the sawit side (east) → beach. Biome per column in world.biome, surface in world.surface, kampung list in world.kampungs.
- Test a fixed world with ?seed=12345 in the URL. F3 shows FPS, position, biome, seed.
- Full original request: CLAUDE.md.
