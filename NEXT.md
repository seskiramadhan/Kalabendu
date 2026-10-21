# NEXT — Kalabendu (beat 'em up) plan

Status line: **Everything in the plan is done (v0.15.0). Waiting for the user's real-device online test and playtest** (2026-10-21)

## Milestones (each playable before the next)
| # | Milestone | Status |
|---|---|---|
| 1 | Bayu on a 2.5D floor, light combo, heavy, jump + air attacks, dodge, pose art, camera | done (v0.4.0) |
| 2 | Hitboxes/hurtboxes, hitstop, shake, knockback, juggles, knockdown + get-up invuln, Preman AI | done (v0.5.0) |
| 3 | Stage 0 Kampung Saat Fajar: go-arrow sections, waves, pickups (nasi bungkus, es teh, coins, weapons), breakables (gerobak, drum, kardus), grab + throw (Kuncian), Preman Kampung boss, tutorial hints, basic HUD | done (v0.6.0) |
| 4 | Full HUD, Semangat meter + special move, combo counter, score, game over + continue | done (v0.7.0; enemy bars SoR-style v0.6.1) |
| 5 | Gamepad, menus (Mulai, Lanjutkan, Pilih Jagoan, Pengaturan), save; touch + ID/EN | done (v0.8.0; money spill v0.7.1) |
| 6 | Stage 1 Hutan Terbakar → Kebun Sawit: Asap, Pembakar Lahan, Penebang Liar, Buldoser Liar, Raja Sawit; era system + background changes; karhutla flames/haze | done (v0.9.0) |
| 7 | Stage 2 Pabrik Tutup (Satpam Bayaran, Mandor Kejam, Robot Pengganti, Juragan Outsourcing + worker allies) and Stage 3 Pasar Rakyat → Lantai Bursa (Spekulan, Penimbun, Rentenir, candlestick hazards, Hantu Bursa); warung shop + inflation | done (v0.10.0) |
| 8 | Story scenes (dialogue + wayang silhouettes), Pejabat bribes before stages 1-5, bukti, endings | done (v0.11.0) |
| 9 | Stage 4 Jalan Raya Demo (Preman Bayaran, Provokator, Buzzer, Komandan Preman) and Stage 5 Gedung Pejabat (Tikus Berdasi, Ajudan, Makelar Kasus, Jaksa Palsu, Pejabat Tinggi, Batara Kala) | done (v0.12.0) |
| 10 | Sri, Ujang, Mak Inah; local 2-player co-op | done (v0.13.0) |
| — | README in English + Indonesian | done |

## Done after the review (2026-10-21, v0.13.2 – v0.15.0)
| # | Item | Result |
|---|---|---|
| 1 | Balance | Pejabat Tinggi 380 → 330 hp, Batara Kala 520 → 460 hp; era climb slowed (v0.13.1) |
| 2 | Story names Bayu only | Story uses the chosen hero ({hero} in text, speaker 'hero'); a side character who is the hero hands the line to a villager |
| 3 | Hero intro scenes | JOIN_SCENES in story.js, shown before the warung after the unlocking stage |
| 4 | Music | src/core/music.js: gamelan cycle (saron, bonang, kenong, kempul, gong, kendang), pelog below era 40, slendro above; faster in boss fights; Settings toggle |
| 5 | Sprite sheets | src/render/sprites/sheets.js + tools/sheet.html templates + assets/sprites/manifest.json (empty = code art) |
| 6 | Online co-op | src/net/net.js (PeerJS from jsDelivr, BroadcastChannel with ?net=local) + src/net/snapshot.js (host snapshots 20/s, guest mirror) |
| 7 | Snapshot branch | snapshot-v0.13.1 |
| — | Clear buttons overlapped touch buttons (user screenshot) | touch buttons hide while choosing; portrait buttons sit under the stage (v0.13.2) |
| — | Own music (v0.18.0) | tools/music/ (Python: gamelan.py instruments, songs/*.py, render.py, look.py). Tracks: menu, story, stage0–5, boss, kala in assets/music/ via manifest.json. fiikuri tracks removed at the user's request (2026-10-21). Two <audio> players crossfade; primed with a silent MP3 on the first tap for iPhone |
| — | Language | Bahasa / English chips on the title screen; README opens with a language switch |

## Pending
| # | Item | Why |
|---|---|---|
| 1 | Confirm online play between two real devices | The sandbox blocks the PeerJS CDN and server, so only the two-tab test (?net=local) ran |
| 2 | Playtest feedback from the user | Bots only so far; tune bosses, prices, music volume if asked |
| 3 | Painted sprite art | Pipeline is ready; needs art (an outside asset, only if the user wants it) |

## Questions for the user
- Did online play connect between your phone and a friend's? If not, tell me the error text on the Play Online screen.
- Review the 10 own tracks (drafts): which to change? Too loud/quiet? (file music gain = FILE_GAIN 0.45 in music.js)

## Already in place
- Touch controls (joystick + Pukul/Tendang/Lompat/Hindar/Jurus) and phone scaling (v0.4.1).
- Esc / ☰ menu with language switch and one-click Update (version.json + sw.js network-first).
- GitHub Pages is live: https://seskiramadhan.github.io/Kalabendu/

## Notes
- Story: src/story/story.js (STORY per stage, ENDINGS, EVIDENCE_NEEDED=8), src/story/wayang.js (scenes), src/ui/story.js. Ending chosen after FINAL_STAGE (stage5): bad if any bribe, good if Batara Kala beaten (section requires flag kala = no bribes + evidence), else neutral.
- Shared engine (M7): blocking (def.block), shots (combat/shots.js, effects freeze/pull/fine), allies (entities/allies.js, kind ally), candle hazards, generic AIs in ai/common.js (ranged, ally, thief, support, provokator, boss with def.attacks + def.summons).
- Shop: systems/economy.js; save.upgrades (permanent), save.boosts (next stage only), inflation from stages cleared and bribes.
- Stages register in main.js STAGES + STAGE_ORDER; clearing one unlocks the next and sets save.stage. Era gain per stage = stage.eraGain (8/12/10/10/8/18 since v0.13.1, so Kalasuba lands at the end) + 2 per villager saved (systems/era.js; save.era starts at 10).
- Stage 1 systems: systems/environment.js (fire hazards, ember douses fire, Asap poison, haze level, mud slow via stage.zones[].slow, rescue NPCs), ai/stage1.js (arsonist, haze, dozer, rajaSawit).
- Bot playthrough scripts lived in the session scratchpad (lost with the session; rebuild from CLAUDE.md's testing note); a real player clears Stage 1 faster than the bot (bot took ~9 min game time).
- Save (localStorage kalabendu.save.v1): started, stage, unlocked, heroes, hero, era, rupiah, bribes, best, settings. Written on stage clear and on settings change; Lanjutkan starts save.stage with save.rupiah.
- Gamepad: A jump, B special, X light, Y heavy, bumpers/triggers dodge, Start pause. Player 2 = second pad by default (setting p2pad: 1 = second pad, 0 = first pad while P1 uses the keyboard).
- Co-op (M10): P2 joins mid-stage with numpad Enter or any button on their pad (main.js addPlayer2) and stays for later stages until the menu. P2 takes the next unlocked hero, else a colour-swapped copy (hero.look). A player out of lives sits out (hero.out) and presses Punch to come back; game over only when both are out. Numpad: 8/4/5/6 move, 1 punch, 2 kick, 3 jump, 0 dodge, Enter jurus.
- Heroes (M10): HERO_UNLOCKS in entities/heroes.js (unlock when that stage is cleared; main.js syncHeroes). Sri has def.tool (cangkul drawn when no weapon), Ujang dodgeMul + ride move (motorbike drawn in renderer), Mak Inah's jala shot (effect 'net', pierce) holds enemies; light hits don't free them.
- Continue is an input message {type:'continue', playerId} so online co-op can send it too.
- Stage clear shows "Main lagi" and the next-stage button (warung first); on stage5 it shows "see ending".
- Full request: CLAUDE.md. Old sandbox game: branch sandbox-v0.3.1.
- Stage 4/5 (M9): boss sections can repeat the same camX (truck then Komandan; Pejabat then Batara Kala with requires:'kala', no GO arrow). Pejabat is shielded (KEBAL) while a Makelar lives (game.updateShields). Move summons are capped at 4 alive non-boss enemies; bosses heal at 25%. Kala's eclipse sets game.darkness (renderer spotlight).
- The padepokan training yard stays reachable with ?stage=padepokan.
- Online (v0.15.0): main.js hostOnline/joinOnline/leaveOnline; host mode stays 'play', guest mode is 'guest' (no game.step, renders mirror.game). Guest input → {type:'input'} to host = remote p2. Snapshot leaves out zero/false fields; Mirror starts entities from ZEROES. Waiting text when the host is in menu/story/shop.
- Music: main.js calls music.play(track) on play/story/menu/clear; 'boss' event → setBoss(true) crossfades to the horror boss track (drone, heartbeat kendang, pelog clusters, whispers). assets/music/manifest.json maps track ids (menu, story, stageN, boss, kala) to files; 'boss' event with batara_kala → setBoss('kala').
