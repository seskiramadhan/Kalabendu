# Sprite sheets (optional)

Every fighter is drawn in code until a sheet exists here.

1. Run the game locally and open `tools/sheet.html`. It draws a template sheet for each hero and enemy from the code poses.
2. Paint over the template (same grid: 64×80 frames, feet at y = 76, one row per animation, facing right).
3. Save it here as `<id>.png` (for example `bayu.png`) and add the id to `manifest.json`, e.g. `["bayu"]`.

The game loads the sheets at start and uses them instead of the code drawing. Row order: see `LAYOUT` in `src/render/sprites/sheets.js`.
