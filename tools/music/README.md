# Music workshop / Bengkel musik

Gamelan music for Kalabendu, made with code. No samples, no recordings: every
saron, bonang, gong and kendang hit is calculated from maths in `gamelan.py`.

*Bahasa Indonesia di bawah.*

## Files
| File | What it is |
|---|---|
| `gamelan.py` | The orchestra: scales (pelog, slendro), instruments (saron, demung, slenthem, peking, bonang, gender, kenong, kempul, gong, kendang, suling, rebab), horror colours (drone, reversed gong, bowed metal, whisper), the timeline (`Track`) and the final mix (`finish`: hall echo, compressor, limiter, seamless loop) |
| `songs/menu.py` | "Fajar di Marcapada": calm slendro menu theme, 64-second loop |
| `songs/kala.py` | "Batara Kala": dark pelog boss theme, 36-second loop (dark intro, then the band rushes) |
| `render.py` | Turns a song into `out/<song>.wav` and `out/<song>.mp3` |
| `look.py` | Draws `out/<song>.png`: loudness and a spectrogram, to check a track by eye |
| `out/` | The latest renders (MP3 + picture; WAV files are not kept in git) |

## How to use
```
pip install -r tools/music/requirements.txt     # numpy, scipy, pedalboard (+ matplotlib for look.py)
python3 tools/music/render.py menu              # render the menu theme
python3 tools/music/render.py kala --install     # render and copy into assets/music/kala.mp3
python3 tools/music/look.py kala                # draw it
```
ffmpeg must be installed (for the MP3).

## How a song is written
A song is a Python file with a `render()` function. Gamelan is cyclic, so the
songs are written like gamelan notation: a line of numbers is the balungan
(core melody), one number per beat, `.` is a rest:

```python
A = '2 1 2 6  2 1 2 6  3 3 . .  6 5 3 2'   # slendro, 16 beats, gong on the last beat
```

Then a loop goes beat by beat and places the instruments: saron on the
melody, bonang and peking decorating it, kenong every 4th beat, kempul on
6/10/14, the big gong at the end of the cycle, kendang keeping time.
Change the numbers, a tempo (`BEAT`, `SLOW`, `FAST`) or a `gain=` and render
again.

## Ideas to try
- New stage music: copy `songs/menu.py`, change the balungan and the tempo.
- Scarier: more `bowed_metal`, `whisper`, notes a half step apart (pelog 1 + 2).
- Brighter: slendro, higher `BASE`, more peking.

---

## Bahasa Indonesia

Musik gamelan untuk Kalabendu, dibuat dengan kode. Tanpa sampel dan rekaman:
setiap pukulan saron, bonang, gong, dan kendang dihitung di `gamelan.py`.

- `gamelan.py`: orkesnya (laras pelog dan slendro, semua instrumen, efek seram, gema pendopo, loop tanpa jeda).
- `songs/menu.py`: "Fajar di Marcapada", tema menu slendro yang tenang (64 detik).
- `songs/kala.py`: "Batara Kala", tema bos pelog yang gelap (36 detik).
- `render.py`: membuat MP3; `--install` menyalinnya ke `assets/music/`.
- `look.py`: menggambar grafik lagu untuk dicek dengan mata.

Cara menulis lagu: notasi balungan seperti biasa (`'2 1 2 6  2 1 2 6 ...'`, titik = diam),
lalu ganti angka, tempo, atau `gain=` dan render lagi.
