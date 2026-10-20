import { Game } from './game.js';
import { Keyboard } from './core/input.js';
import { startLoop } from './core/loop.js';
import { audio } from './core/audio.js';
import { t } from './core/i18n.js';
import { Renderer } from './render/renderer.js';
import { TouchControls, isTouchDevice } from './core/touch.js';
import { Menu, fetchVersion } from './ui/menu.js';
import { PADEPOKAN } from './stages/padepokan.js';
import { STAGE0 } from './stages/stage0_kampung.js';

const STAGES = { padepokan: PADEPOKAN, stage0: STAGE0 };
const stageId = new URLSearchParams(location.search).get('stage');

if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}

const canvas = document.getElementById('game');
const hint = document.getElementById('hint');
const moveLabel = document.getElementById('move-label');
const renderer = new Renderer(canvas);
const keyboard = new Keyboard();
const touch = isTouchDevice() ? new TouchControls(document.getElementById('ui')) : null;
if (touch) document.body.classList.add('is-touch');
renderer.touch = !!touch;
const againBtn = document.getElementById('again');
const continueBtn = document.getElementById('continue');
let continueQueued = false;

let game;
function newGame() {
  game = new Game(STAGES[stageId] ?? STAGE0, (Math.random() * 1e9) >>> 0);
  game.addHero('p1', 'bayu');
  againBtn.hidden = true;
  continueBtn.hidden = true;
  renderer.setStage(game.stage);
  globalThis.kalabendu = { game, renderer, keyboard, menu, loop };
}

let paused = false;
let debug = false;
let moveLabelTimer = 0;

const menu = new Menu(document.getElementById('ui'), {
  running: await fetchVersion(),
  onResume: () => {
    paused = false;
    loop.resetClock();
  },
  onRestart: () => {
    newGame();
    menu.close();
  },
  onLanguage: () => {
    hint.textContent = t(touch ? 'hintTouch' : 'hintDesktop');
    touch?.labels();
  },
});

function openMenu() {
  paused = true;
  keyboard.releaseAll();
  touch?.releaseAll();
  menu.open();
}
menu.button.addEventListener('click', () => {
  if (menu.isOpen) {
    paused = true;
    keyboard.releaseAll();
    touch?.releaseAll();
  }
});

keyboard.onKey = (e) => {
  if (e.code === 'Escape') {
    if (!e.repeat) menu.isOpen ? menu.close() : openMenu();
    return true;
  }
  if (e.code === 'F3') {
    if (!e.repeat) debug = !debug;
    return true;
  }
  return false;
};

function resize() {
  const { portrait, stageBottomCss } = renderer.resize();
  document.body.classList.toggle('portrait', portrait);
  document.documentElement.style.setProperty('--stage-bottom', stageBottomCss + 'px');
}
window.addEventListener('resize', resize);
window.addEventListener('orientationchange', resize);
resize();

const loop = startLoop({
  isPaused: () => paused,
  update(dt) {
    const msg = keyboard.message('p1');
    if (touch) {
      const tin = touch.take();
      msg.held |= tin.held;
      msg.pressed |= tin.pressed;
    }
    if (game.over && (continueQueued || msg.pressed & 16)) game.applyInput({ type: 'continue', playerId: 'p1' });
    continueQueued = false;
    game.applyInput(msg);
    game.step(dt);
  },
  render(time, dt) {
    renderer.draw(game, time, dt, debug);
    for (const ev of game.events) {
      if (ev.type === 'sfx') audio.play(ev.name, ev.power ?? 1);
      if (ev.type === 'noSemangat') audio.play('deny');
      const label = ev.type === 'label' ? ev.key : ev.type === 'swing' ? ev.move.nameKey : null;
      if (label && ev.who.kind === 'hero') {
        moveLabel.textContent = t(label);
        moveLabel.style.opacity = '1';
        moveLabelTimer = 0.9;
      }
    }
    game.events.length = 0;
    const showAgain = game.cleared || game.finished;
    if (againBtn.hidden === showAgain) {
      againBtn.textContent = t('playAgain');
      againBtn.hidden = !showAgain;
    }
    const showContinue = game.over && !game.finished;
    if (continueBtn.hidden === showContinue) {
      continueBtn.textContent = t('continueBtn');
      continueBtn.hidden = !showContinue;
    }
    moveLabelTimer -= dt;
    if (moveLabelTimer <= 0) moveLabel.style.opacity = '0';
    if (debug) {
      const h = game.heroes.get('p1');
      renderer.drawText([`FPS ${loop.stats.fps}`, `x ${h.x.toFixed(0)} y ${h.y.toFixed(0)} z ${h.z.toFixed(0)}`, h.state]);
    }
  },
});

againBtn.addEventListener('click', () => newGame());
continueBtn.addEventListener('click', () => (continueQueued = true));
newGame();
hint.textContent = t(touch ? 'hintTouch' : 'hintDesktop');
setTimeout(() => (hint.style.opacity = '0'), 10000);
