import { Game } from './game.js';
import { Keyboard, BTN } from './core/input.js';
import { Gamepads } from './core/gamepad.js';
import { startLoop } from './core/loop.js';
import { audio } from './core/audio.js';
import { t } from './core/i18n.js';
import { loadSave, writeSave, resetSave } from './core/save.js';
import { Renderer } from './render/renderer.js';
import { TouchControls, isTouchDevice, blockBrowserZoom } from './core/touch.js';
import { Menu, fetchVersion } from './ui/menu.js';
import { Screens, navigate } from './ui/screens.js';
import { PADEPOKAN } from './stages/padepokan.js';
import { STAGE0 } from './stages/stage0_kampung.js';
import { STAGE1 } from './stages/stage1_hutan.js';
import { STAGE2 } from './stages/stage2_pabrik.js';
import { STAGE3 } from './stages/stage3_pasar.js';
import { buy, applyToHero } from './systems/economy.js';
import { Story } from './ui/story.js';
import { STORY, ENDINGS, endingFor, canFaceKala, totalEvidence } from './story/story.js';
import { SPECIAL_COST } from './entities/fighter.js';

const STAGES = { padepokan: PADEPOKAN, stage0: STAGE0, stage1: STAGE1, stage2: STAGE2, stage3: STAGE3 };
const STAGE_ORDER = ['stage0', 'stage1', 'stage2', 'stage3'];
const nextStageOf = (id) => STAGE_ORDER[STAGE_ORDER.indexOf(id) + 1] ?? null;
const FINAL_STAGE = 'stage5';
const urlStage = new URLSearchParams(location.search).get('stage');

if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}

const ui = document.getElementById('ui');
const canvas = document.getElementById('game');
const hint = document.getElementById('hint');
const moveLabel = document.getElementById('move-label');
const againBtn = document.getElementById('again');
const continueBtn = document.getElementById('continue');
const nextBtn = document.getElementById('next');
const renderer = new Renderer(canvas);
const keyboard = new Keyboard();
const pads = new Gamepads();
const touch = isTouchDevice() ? new TouchControls(ui) : null;
if (touch) document.body.classList.add('is-touch');
if (touch) blockBrowserZoom();
renderer.touch = !!touch;

let save = loadSave();
let mode = 'menu';
let paused = true;
let debug = false;
let moveLabelTimer = 0;
let continueQueued = false;
let savedThisClear = false;
let game;

function applySettings() {
  const s = save.settings;
  audio.setVolume(s.volume);
  renderer.hud.tips = s.tips;
  document.body.dataset.buttons = s.buttons;
}

function newGame(stageId, { rupiah = 0, preview = false } = {}) {
  game = new Game(STAGES[stageId] ?? STAGE0, (Math.random() * 1e9) >>> 0, { era: save.era, flags: { kala: canFaceKala(save) } });
  const hero = game.addHero('p1', save.hero);
  // A preview (behind a story scene) must not use up one-stage boosts.
  if (!preview) {
    applyToHero(hero, save);
    persist();
  }
  game.rupiah = rupiah;
  renderer.setStage(game.stage);
  applySettings();
  againBtn.hidden = true;
  continueBtn.hidden = true;
  nextBtn.hidden = true;
  savedThisClear = false;
  globalThis.kalabendu = { game, renderer, keyboard, menu, screens, loop, save, story, totalEvidence };
}

function play(stageId, opts) {
  newGame(stageId, opts);
  mode = 'play';
  paused = false;
  document.body.classList.remove('in-menu');
  renderer.showHud = true;
  screens.hide();
  loop.resetClock();
  hint.textContent = t(touch ? 'hintTouch' : 'hintDesktop');
  hint.style.opacity = '1';
  setTimeout(() => (hint.style.opacity = '0'), 8000);
}

// Opens a stage with its story scene (and the Pejabat's offer, if any).
function startStage(stageId, opts = {}) {
  const scene = STORY[stageId]?.intro;
  if (!scene || opts.skipStory) {
    play(stageId, { rupiah: save.rupiah });
    return;
  }
  mode = 'story';
  paused = true;
  releaseInputs();
  screens.hide();
  renderer.showHud = false;
  document.body.classList.add('in-menu');
  newGame(stageId, { rupiah: save.rupiah, preview: true });
  story.play(scene, {
    onBribe: (accept, amount) => applyBribe(stageId, accept, amount),
    onDone: () => play(stageId, { rupiah: save.rupiah }),
  });
}

// Accepting: money and +30% attack for the stage, but the era sinks and
// prices climb. Refusing: the era rises a little.
function applyBribe(stageId, accept, amount) {
  save.bribes = save.bribes.filter((id) => id !== stageId);
  save.refused = save.refused.filter((id) => id !== stageId);
  if (accept) {
    save.bribes.push(stageId);
    save.rupiah += amount;
    save.bribePower = true;
    save.era = Math.max(0, save.era - 8);
    audio.play('pickup');
  } else {
    save.refused.push(stageId);
    save.bribePower = false;
    save.era = Math.min(100, save.era + 3);
    audio.play('combo');
  }
  persist();
}

function showEnding() {
  const type = endingFor(save, game.beatKala);
  save.ending = type;
  persist();
  mode = 'story';
  paused = true;
  renderer.showHud = false;
  document.body.classList.add('in-menu');
  nextBtn.hidden = true;
  againBtn.hidden = true;
  story.play(ENDINGS[type], { onDone: () => toMenu() });
}

function toMenu() {
  mode = 'menu';
  document.body.classList.add('in-menu');
  renderer.showHud = false;
  newGame(save.stage, { preview: true });
  paused = true;
  releaseInputs();
  if (menu.isOpen) menu.close();
  againBtn.hidden = true;
  continueBtn.hidden = true;
  nextBtn.hidden = true;
  screens.show('title');
}

function releaseInputs() {
  keyboard.releaseAll();
  touch?.releaseAll();
}

function persist() {
  writeSave(save);
}

const screens = new Screens(ui, {
  getSave: () => save,
  onStart: () => {
    if (save.started && !confirm(t('startConfirm'))) return;
    const settings = save.settings;
    const hero = save.hero;
    save = resetSave();
    save.settings = settings;
    save.hero = hero;
    save.started = true;
    persist();
    startStage(urlStage ?? 'stage0');
  },
  onContinue: () => startStage(save.stage),
  getStages: () =>
    STAGE_ORDER.map((id) => ({ id, stage: STAGES[id], unlocked: save.unlocked.includes(id), best: save.best[id] ?? 0 })),
  onPickStage: (id) => {
    save.started = true;
    persist();
    startStage(id);
  },
  onPickHero: (id) => {
    save.hero = id;
    persist();
    screens.show('title');
  },
  onSetting: (key, value) => {
    save.settings[key] = value;
    persist();
    applySettings();
  },
  onLanguage: () => touch?.labels(),
  onBuy: (item) => {
    const ok = buy(item, save);
    if (ok) {
      persist();
      audio.play('pickup');
    } else audio.play('deny');
    return ok;
  },
  onShopDone: () => startStage(save.stage),
  onReset: () => {
    save = resetSave();
    applySettings();
  },
});

const story = new Story(ui);

const menu = new Menu(ui, {
  running: await fetchVersion(),
  onResume: () => {
    if (mode !== 'play') return;
    paused = false;
    loop.resetClock();
  },
  onRestart: () => {
    menu.close();
    play(game.stage.id, { rupiah: save.rupiah });
  },
  onQuit: () => toMenu(),
  onLanguage: () => {
    hint.textContent = t(touch ? 'hintTouch' : 'hintDesktop');
    touch?.labels();
  },
});

function openPause() {
  if (mode !== 'play' || menu.isOpen) return;
  paused = true;
  releaseInputs();
  menu.open();
}
menu.button.addEventListener('click', () => {
  if (menu.isOpen) {
    paused = true;
    releaseInputs();
  }
});

function activeOverlay() {
  if (story.isOpen) return story.el;
  if (menu.isOpen) return menu.overlay;
  if (screens.isOpen) return screens.el;
  return null;
}

// Arrow keys / d-pad move between buttons; Enter, Space, J or A presses.
function menuInput(action) {
  const overlay = activeOverlay();
  if (!overlay) return false;
  if (action === 'up' || action === 'left') navigate(overlay, -1);
  else if (action === 'down' || action === 'right') navigate(overlay, 1);
  else if (action === 'ok') {
    const el = document.activeElement;
    if (el && overlay.contains(el) && el.tagName === 'BUTTON') el.click();
    else navigate(overlay, 1);
  } else if (action === 'back') {
    if (menu.isOpen) menu.close();
    else screens.back();
  }
  return true;
}

const MENU_KEYS = {
  ArrowUp: 'up', KeyW: 'up', ArrowDown: 'down', KeyS: 'down', ArrowLeft: 'left', KeyA: 'left',
  ArrowRight: 'right', KeyD: 'right', Enter: 'ok', Space: 'ok', KeyJ: 'ok', Backspace: 'back',
};

keyboard.onKey = (e) => {
  if (e.code === 'F3') {
    if (!e.repeat) debug = !debug;
    return true;
  }
  if (e.code === 'Escape') {
    if (e.repeat) return true;
    if (story.isOpen) story.skip();
    else if (menu.isOpen) menu.close();
    else if (mode === 'play') openPause();
    else screens.back();
    return true;
  }
  if (activeOverlay()) {
    const action = MENU_KEYS[e.code];
    // Let range sliders keep their own arrow keys.
    if (action && !(document.activeElement?.type === 'range' && (action === 'left' || action === 'right'))) {
      if (!e.repeat || action !== 'ok') menuInput(action);
      return true;
    }
    return false;
  }
  return false;
};

document.addEventListener('visibilitychange', () => {
  if (document.hidden) openPause();
});

function resize() {
  const { portrait, stageBottomCss } = renderer.resize();
  document.body.classList.toggle('portrait', portrait);
  document.documentElement.style.setProperty('--stage-bottom', stageBottomCss + 'px');
}
window.addEventListener('resize', resize);
window.addEventListener('orientationchange', resize);
resize();

let padRepeat = 0;
function pollPadMenus(dt) {
  const p = pads.poll(0);
  if (!p) return null;
  if (p.start) {
    if (mode === 'play' && !menu.isOpen) openPause();
    else if (menu.isOpen) menu.close();
  }
  if (activeOverlay()) {
    padRepeat -= dt;
    const dir = p.held & BTN.UP ? 'up' : p.held & BTN.DOWN ? 'down' : p.held & BTN.LEFT ? 'left' : p.held & BTN.RIGHT ? 'right' : null;
    const fresh = p.pressed & (BTN.UP | BTN.DOWN | BTN.LEFT | BTN.RIGHT);
    if (dir && (fresh || padRepeat <= 0)) {
      menuInput(dir);
      padRepeat = fresh ? 0.35 : 0.15;
    }
    if (p.pressed & (BTN.JUMP | BTN.LIGHT)) menuInput('ok');
    if (p.pressed & BTN.SPECIAL || p.back) menuInput('back');
    return null;
  }
  return p;
}

function onClear() {
  if (savedThisClear) return;
  savedThisClear = true;
  save.started = true;
  save.rupiah = game.rupiah;
  save.best[game.stage.id] = Math.max(save.best[game.stage.id] ?? 0, game.score);
  save.era = game.eraAfter;
  save.evidenceBy ??= {};
  save.evidenceBy[game.stage.id] = Math.max(save.evidenceBy[game.stage.id] ?? 0, game.evidence);
  save.bribePower = false;
  const next = nextStageOf(game.stage.id);
  if (next) {
    if (!save.unlocked.includes(next)) save.unlocked.push(next);
    save.stage = next;
  }
  persist();
}

const loop = startLoop({
  isPaused: () => paused,
  update(dt) {
    const msg = keyboard.message('p1');
    if (touch) {
      const tin = touch.take();
      msg.held |= tin.held;
      msg.pressed |= tin.pressed;
    }
    const pad = pollPadMenus(dt);
    if (pad) {
      msg.held |= pad.held;
      msg.pressed |= pad.pressed;
    }
    if (game.over && (continueQueued || msg.pressed & BTN.LIGHT)) game.applyInput({ type: 'continue', playerId: 'p1' });
    continueQueued = false;
    game.applyInput(msg);
    game.step(dt);
  },
  render(time, dt) {
    if (paused) pollPadMenus(dt);
    renderer.draw(game, time, dt, debug);
    const hero = game.heroes.get('p1');
    for (const ev of game.events) {
      if (ev.type === 'sfx') audio.play(ev.name, ev.power ?? 1);
      if (ev.type === 'noSemangat') audio.play('deny');
      if (save.settings.vibrate && navigator.vibrate) {
        if (ev.type === 'heroHurt') navigator.vibrate(40);
        else if (ev.type === 'special') navigator.vibrate(25);
      }
      const label = ev.type === 'label' ? ev.key : ev.type === 'swing' ? ev.move.nameKey : null;
      if (label && ev.who.kind === 'hero') {
        moveLabel.textContent = t(label);
        moveLabel.style.opacity = '1';
        moveLabelTimer = 0.9;
      }
    }
    game.events.length = 0;
    if (game.cleared) onClear();
    touch?.setReady(hero && hero.semangat >= SPECIAL_COST);
    const playing = mode === 'play';
    const showAgain = playing && (game.cleared || game.finished);
    if (againBtn.hidden === showAgain) {
      againBtn.textContent = t('playAgain');
      againBtn.hidden = !showAgain;
    }
    const next = nextStageOf(game.stage.id);
    const isFinal = game.stage.id === FINAL_STAGE;
    const showNext = playing && game.cleared && (!!next || isFinal);
    if (nextBtn.hidden === showNext) {
      nextBtn.textContent = isFinal ? `${t('seeEnding')} →` : next ? `${t('nextStage')}: ${t(STAGES[next].nameKey)} →` : '';
      nextBtn.hidden = !showNext;
    }
    const showContinue = playing && game.over && !game.finished;
    if (continueBtn.hidden === showContinue) {
      continueBtn.textContent = t('continueBtn');
      continueBtn.hidden = !showContinue;
    }
    moveLabelTimer -= dt;
    if (moveLabelTimer <= 0) moveLabel.style.opacity = '0';
    if (debug && hero) {
      renderer.drawText([`FPS ${loop.stats.fps}`, `x ${hero.x.toFixed(0)} y ${hero.y.toFixed(0)} z ${hero.z.toFixed(0)}`, hero.state]);
    }
  },
});

againBtn.addEventListener('click', () => startStage(game.stage.id, { skipStory: true }));
continueBtn.addEventListener('click', () => (continueQueued = true));
nextBtn.addEventListener('click', () => {
  if (game.stage.id === FINAL_STAGE) {
    showEnding();
    return;
  }
  // Between stages: the warung, then the next stage.
  mode = 'shop';
  paused = true;
  releaseInputs();
  nextBtn.hidden = true;
  againBtn.hidden = true;
  renderer.showHud = false;
  document.body.classList.add('in-menu');
  screens.show('shop');
});

newGame(urlStage ?? 'stage0', { preview: !urlStage });
if (urlStage) play(urlStage);
else {
  document.body.classList.add('in-menu');
  renderer.showHud = false;
  screens.show('title');
}
