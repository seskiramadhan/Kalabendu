import { generateFlatWorld } from './worldgen.js';
import { Game } from './game.js';
import { Input } from './input.js';
import { Camera } from './camera.js';
import { Renderer } from './render.js';
import { t } from './i18n.js';

const STEP = 1 / 60;
const MAX_STEPS = 5;
const LOCAL_ID = 'local';

const canvas = document.getElementById('game');
const renderer = new Renderer(canvas);
const camera = new Camera();
const input = new Input();

const { world, spawn } = generateFlatWorld();
const game = new Game(world, spawn);
const player = game.addPlayer(LOCAL_ID);
globalThis.kalabendu = { game, camera, renderer };

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

let last = performance.now();
let acc = 0;
let frames = 0;
let fpsTime = 0;
let fps = 0;

function frame(now) {
  const elapsed = Math.min((now - last) / 1000, 0.25);
  last = now;
  acc += elapsed;

  let steps = 0;
  while (acc >= STEP && steps < MAX_STEPS) {
    game.applyAction(input.intent(LOCAL_ID));
    game.step(STEP);
    acc -= STEP;
    steps++;
  }
  if (steps === MAX_STEPS) acc = 0;

  camera.follow(player, world);
  renderer.draw(game, camera, LOCAL_ID);

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
