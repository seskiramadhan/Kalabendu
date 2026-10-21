# Music

All music in Kalabendu is our own gamelan, written in code with the music
workshop in `tools/music/` (no samples, no recordings, no outside music).

| File | Plays | Song script |
|---|---|---|
| menu.mp3 | title screen | tools/music/songs/menu.py — "Fajar di Marcapada" |
| story.mp3 | story scenes, warung, endings | songs/story.py — "Wayang Malam" |
| stage0.mp3 | Stage 0 and the training yard | songs/stage0.py — "Pagi di Kampung" |
| stage1.mp3 | Stage 1 | songs/stage1.py — "Api di Hulu" |
| stage2.mp3 | Stage 2 | songs/stage2.py — "Mesin Mati" |
| stage3.mp3 | Stage 3 | songs/stage3.py — "Harga Naik" |
| stage4.mp3 | Stage 4 | songs/stage4.py — "Rakyat Bersatu" |
| stage5.mp3 | Stage 5 | songs/stage5.py — "Menara Kaca" |
| boss.mp3 | every boss fight | songs/boss.py — "Amuk" |
| kala.mp3 | Batara Kala | songs/kala.py — "Batara Kala" |

To change one: edit its song script, then `python3 tools/music/render.py <song> --install`.
`manifest.json` maps each game track to a file; a track missing from it uses the live code gamelan in `src/core/music.js`.
