# NEXT — Kalabendu (beat 'em up) plan

Status line: **Milestone 4 done, Milestone 5 next** (2026-10-20; stage list updated by the user the same day)

## Milestones (each playable before the next)
| # | Milestone | Status |
|---|---|---|
| 1 | Bayu on a 2.5D floor, light combo, heavy, jump + air attacks, dodge, pose art, camera | done (v0.4.0) |
| 2 | Hitboxes/hurtboxes, hitstop, shake, knockback, juggles, knockdown + get-up invuln, Preman AI | done (v0.5.0) |
| 3 | Stage 0 Kampung Saat Fajar: go-arrow sections, waves, pickups (nasi bungkus, es teh, coins, weapons), breakables (gerobak, drum, kardus), grab + throw (Kuncian), Preman Kampung boss, tutorial hints, basic HUD | done (v0.6.0) |
| 4 | Full HUD, Semangat meter + special move, combo counter, score, game over + continue | done (v0.7.0; enemy bars SoR-style v0.6.1) |
| 5 | Gamepad, menus (Mulai, Lanjutkan, Pilih Jagoan, Pengaturan), save; touch + ID/EN already partly done | todo |
| 6 | Stage 1 Hutan Terbakar → Kebun Sawit: Asap, Pembakar Lahan, Penebang Liar, Buldoser Liar, Raja Sawit; era system + background changes; karhutla flames/haze | todo |
| 7 | Stage 2 Pabrik Tutup (Satpam Bayaran, Mandor Kejam, Robot Pengganti, Juragan Outsourcing + worker allies) and Stage 3 Pasar Rakyat → Lantai Bursa (Spekulan, Penimbun, Rentenir, candlestick hazards, Hantu Bursa); warung shop + inflation | todo |
| 8 | Story scenes (dialogue + wayang silhouettes), Pejabat bribes before stages 1-5, bukti, endings | todo |
| 9 | Stage 4 Jalan Raya Demo (Preman Bayaran, Provokator, Buzzer, Komandan Preman) and Stage 5 Gedung Pejabat (Tikus Berdasi, Ajudan, Makelar Kasus, Jaksa Palsu, Pejabat Tinggi, Batara Kala) | todo |
| 10 | Sri, Ujang, Mak Inah; local 2-player co-op | todo |
| — | README in English + Indonesian | todo |

## Already in place
- Touch controls (joystick + Pukul/Tendang/Lompat/Hindar/Jurus) and phone scaling (v0.4.1).
- Esc / ☰ menu with language switch and one-click Update (version.json + sw.js network-first).
- GitHub Pages is live: https://seskiramadhan.github.io/Kalabendu/

## Notes
- Continue is an input message {type:'continue', playerId} so online co-op can send it too.
- Stage clear shows "Main lagi"; going on to Stage 1 comes with M6.
- Full request: CLAUDE.md. Old sandbox game: branch sandbox-v0.3.1.
- The padepokan training yard stays reachable with ?stage=padepokan.
