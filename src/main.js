import { generateWorld } from './worldgen.js';
import { Game } from './game.js';
import { Input } from './input.js';
import { Camera } from './camera.js';
import { Renderer } from './render.js';
import { Hud } from './ui.js';
import { t } from './i18n.js';
import { HOTBAR_SIZE } from './inventory.js';
import { TILE } from './world.js';

const STEP = 1 / 60;
const MAX_STEPS = 5;
const LOCAL_ID = 'local';

const canvas = document.getElementById('game');
const hint = document.getElementById('hint');
const renderer = new Renderer(canvas);
const camera = new Camera();
const input = new Input(canvas);

hint.textContent = t('loading');
await new Promise((r) => requestAnimationFrame(() => setTimeout(r, 0)));

const seedParam = new URLSearchParams(location.search).get('seed');
const genStart = performance.now();
const { world, spawn } = generateWorld(seedParam ? Number(seedParam) >>> 0 : undefined);
const genMs = Math.round(performance.now() - genStart);

const game = new Game(world, spawn);
const player = game.addPlayer(LOCAL_ID);
renderer.setWorld(world);
const hud = new Hud(document.getElementById('ui'), renderer.atlas, (slot) =>
  game.applyAction({ type: 'select', playerId: LOCAL_ID, slot }),
);
globalThis.kalabendu = { game, camera, renderer, input, genMs };

let showDebug = false;
input.onToggleFps = () => (showDebug = !showDebug);
hint.textContent = t('hintDesktop');
setTimeout(() => (hint.style.opacity = '0'), 8000);

function resize() {
  renderer.resize();
  camera.setView(renderer.viewW, renderer.viewH);
  camera.follow(player, world, true);
}
window.addEventListener('resize', resize);
window.addEventListener('orientationchange', resize);
resize();

function pointerTile() {
  if (!input.mouse.inside) return null;
  return renderer.screenToTile(camera, input.mouse.x, input.mouse.y);
}

function handleInputEvents() {
  for (const ev of input.takeEvents()) {
    let slot = player.inventory.selected;
    if (ev.kind === 'slot') slot = ev.slot;
    if (ev.kind === 'wheel') slot = (slot + ev.dir + HOTBAR_SIZE) % HOTBAR_SIZE;
    game.applyAction({ type: 'select', playerId: LOCAL_ID, slot });
  }
}

function hoverInfo(tile) {
  if (!tile) return null;
  const item = player.inventory.selectedItem;
  const ok = game.canMine(player, tile.x, tile.y) || (item && game.canPlace(player, item.id, tile.x, tile.y));
  return { ...tile, ok };
}

let last = performance.now();
let acc = 0;
let frames = 0;
let fpsTime = 0;
let fps = 0;

function frame(now) {
  const elapsed = Math.min((now - last) / 1000, 0.25);
  last = now;
  acc += elapsed;

  handleInputEvents();
  let steps = 0;
  while (acc >= STEP && steps < MAX_STEPS) {
    game.applyAction(input.intent(LOCAL_ID, pointerTile()));
    game.step(STEP);
    acc -= STEP;
    steps++;
  }
  if (steps === MAX_STEPS) acc = 0;

  camera.follow(player, world);
  renderer.draw(game, camera, LOCAL_ID, hoverInfo(pointerTile()), now / 1000);
  hud.update(player, elapsed);

  frames++;
  fpsTime += elapsed;
  if (fpsTime >= 0.5) {
    fps = Math.round(frames / fpsTime);
    frames = 0;
    fpsTime = 0;
  }
  if (showDebug) {
    const tx = Math.floor((player.x + player.w / 2) / TILE);
    const ty = Math.floor((player.y + player.h) / TILE);
    renderer.drawDebug([
      `FPS ${fps}`,
      `x ${tx}  y ${ty}`,
      t('biome_' + world.biome[Math.max(0, Math.min(world.w - 1, tx))]),
      `seed ${world.seed}`,
    ]);
  }

  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
