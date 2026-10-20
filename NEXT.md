# NEXT — Kalabendu (beat 'em up) plan

Status line: **All 10 milestones + README done; full review done (v0.13.1). Waiting for the user's playtest; see Pending and Questions below** (2026-10-20)

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

## Pending (found in the final review, not started)
| # | Item | Why |
|---|---|---|
| 1 | Balance from the user's playtest: boss length, enemy damage, warung prices | Only bots have played; bosses (Pejabat Tinggi, Batara Kala) may feel long |
| 2 | Story dialogue always names Bayu, even when Sri, Ujang or Mak Inah is played | Story lines in story.js / i18n are written for Bayu |
| 3 | Short intro lines when Sri, Ujang and Mak Inah unlock | Now only a hint text says they joined |
| 4 | Music: gamelan-style loop per stage (Web Audio, no files) | Request said "keep code ready for gamelan music later"; only sound effects exist |
| 5 | Sprite sheets instead of code-drawn figures | Request: "ready to swap for sprite sheets later"; pose names already match animation states |
| 6 | Online co-op (PeerJS / WebRTC host and join) | Plan written in README; not built |
| 7 | Snapshot branch for v0.13.1 (tags are blocked by the proxy) | Like sandbox-v0.3.1, if the user wants a saved copy |

## Questions for the user (ask before doing the matching item)
- After playing: which bosses or stages feel too long or too hard? (item 1)
- Should the story change its words for each hero, or stay Bayu's story with friends? (item 2)
- Want gamelan music next, or online co-op, or sprite art? Which first? (items 4–6)
- Two players on one phone is not supported (one touch screen). Is PC-only co-op OK?

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
