# Recorded music (optional)

The game makes its gamelan music in code. To use recorded tracks instead:

1. Put the files here, e.g. `explore.mp3` (plays during stages) and `boss.mp3` (plays in boss fights). They loop.
2. Create `manifest.json` in this folder:
   ```json
   { "explore": "explore.mp3", "boss": "boss.mp3" }
   ```
   You can list only one; the other stays code-made.
3. Only use music you may share: CC0 / public domain, or a licence that allows games (credit the author below if the licence asks).

## Credits
| File | Track | Artist | Source | Licence |
|---|---|---|---|---|
| explore.mp3 | Jedag-Jedug Gamelan | fiikuri | https://pixabay.com/music/upbeat-jedag-jedug-gamelan-free-for-use-328514/ | Pixabay Content License |
| boss.mp3 | Free Gamelan Horror Music | fiikuri | https://pixabay.com/music/folk-free-gamelan-horror-music-spiritual-and-energetic-background-music-339847/ | Pixabay Content License |

Both re-encoded to 128 kbps MP3 for phones. Menu and story scenes still use the code-made gamelan.
