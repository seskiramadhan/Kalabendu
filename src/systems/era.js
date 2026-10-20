// World meter from Kalabendu (0) to Kalasuba (100).
export const ERAS = [
  { id: 'kalabendu', min: 0, nameKey: 'era_kalabendu', descKey: 'era_kalabendu_desc', color: '#c8643a' },
  { id: 'kalatidha', min: 40, nameKey: 'era_kalatidha', descKey: 'era_kalatidha_desc', color: '#c8a050' },
  { id: 'kalasuba', min: 80, nameKey: 'era_kalasuba', descKey: 'era_kalasuba_desc', color: '#5aa84a' },
];

export const START_ERA = 10;

export function eraOf(value) {
  let era = ERAS[0];
  for (const e of ERAS) if (value >= e.min) era = e;
  return era;
}

// Kalabendu: grey-orange haze and dull colours. Kalasuba: clear and vivid.
export function applyEraGrade(ctx, value, w, h) {
  const k = Math.max(0, Math.min(1, value / 100));
  ctx.save();
  const dull = 0.45 * (1 - k);
  if (dull > 0.01) {
    ctx.globalCompositeOperation = 'saturation';
    ctx.fillStyle = `rgba(128,128,128,${dull})`;
    ctx.fillRect(0, 0, w, h);
    ctx.globalCompositeOperation = 'multiply';
    ctx.fillStyle = `rgba(255,${Math.round(200 + 55 * k)},${Math.round(160 + 95 * k)},${0.5 * (1 - k)})`;
    ctx.fillRect(0, 0, w, h);
  }
  if (k > 0.75) {
    ctx.globalCompositeOperation = 'saturation';
    ctx.fillStyle = `rgba(255,0,0,${(k - 0.75) * 0.5})`;
    ctx.fillRect(0, 0, w, h);
  }
  ctx.restore();
}
