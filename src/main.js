import { generateFlatWorld } from './worldgen.js';
import { Game } from './game.js';
import { Input } from './input.js';
import { Camera } from './camera.js';
import { Renderer } from './render.js';
import { Hud } from './ui.js';
import { t } from './i18n.js';
import { HOTBAR_SIZE } from './inventory.js';

const STEP = 1 / 60;
const MAX_STEPS = 5;
const LOCAL_ID = 'local';

const canvas = document.getElementById('game');
const renderer = new Renderer(canvas);
const camera = new Camera();
const input = new Input(canvas);

const { world, spawn } = generateFlatWorld();
const game = new Game(world, spawn);
const player = game.addPlayer(LOCAL_ID);
const hud = new Hud(document.getElementById('ui'), renderer.atlas, (slot) =>
  game.applyAction({ type: 'select', playerId: LOCAL_ID, slot }),
);
globalThis.kalabendu = { game, camera, renderer, input };

let showFps = false;
input.onToggleFps = () => (showFps = !showFps);
document.getElementById('hint').textContent = t('hintDesktop');

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
  renderer.draw(game, camera, LOCAL_ID, hoverInfo(pointerTile()));
  hud.update(player, elapsed);

  frames++;
  fpsTime += elapsed;
  if (fpsTime >= 0.5) {
    fps = Math.round(frames / fpsTime);
    frames = 0;
    fpsTime = 0;
  }
  if (showFps) renderer.drawFps(fps);

  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
