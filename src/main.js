import { Game } from './game.js';
import { Keyboard, BTN, P2_KEYS } from './core/input.js';
import { Gamepads } from './core/gamepad.js';
import { startLoop } from './core/loop.js';
import { audio } from './core/audio.js';
import { music } from './core/music.js';
import { loadSheets } from './render/sprites/sheets.js';
import { hostRoom, joinRoom } from './net/net.js';
import { packSnapshot, Mirror } from './net/snapshot.js';
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
import { STAGE4 } from './stages/stage4_demo.js';
import { STAGE5 } from './stages/stage5_gedung.js';
import { buy, applyToHero, applyUpgrades } from './systems/economy.js';
import { HERO_UNLOCKS, ROSTER } from './entities/heroes.js';
import { Story } from './ui/story.js';
import { STORY, ENDINGS, JOIN_SCENES, endingFor, canFaceKala, totalEvidence } from './story/story.js';
import { SPECIAL_COST } from './entities/fighter.js';

const STAGES = { padepokan: PADEPOKAN, stage0: STAGE0, stage1: STAGE1, stage2: STAGE2, stage3: STAGE3, stage4: STAGE4, stage5: STAGE5 };
const STAGE_ORDER = ['stage0', 'stage1', 'stage2', 'stage3', 'stage4', 'stage5'];
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
const keyboard2 = new Keyboard(P2_KEYS);
const pads = new Gamepads();
const touch = isTouchDevice() ? new TouchControls(ui) : null;
if (touch) document.body.classList.add('is-touch');
if (touch) blockBrowserZoom();
renderer.touch = !!touch;

await loadSheets();
let save = loadSave();
syncHeroes();
// Extra players (P2–P4). A seat stays taken across stages until the menu.
// source: 'local' (numpad / gamepad on this device) or 'remote' (an online guest).
const SLOTS = ['p2', 'p3', 'p4'];
const seats = new Map();
let joinQueue = [];
// Online co-op: net = { role: 'host' | 'guest', room, connected, code }.
let net = null;
const remote = { sentHeld: -1, me: 'p2' };
let netEvents = [];
let snapClock = 0;
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
  if (music.on !== (s.music !== false)) music.setEnabled(s.music !== false);
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
  renderer.hud.p2Hint = !touch && !preview;
  if (!preview) for (const id of seats.keys()) addPlayer(id, false);
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
  music.play(game.stage.id, { era: game.era });
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
  music.play('story', { era: save.era });
  renderer.showHud = false;
  document.body.classList.add('in-menu');
  newGame(stageId, { rupiah: save.rupiah, preview: true });
  story.play(scene, {
    hero: save.hero,
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
  music.play('story', { era: save.era });
  story.play(ENDINGS[type], { hero: save.hero, onDone: () => toMenu() });
}

function toMenu() {
  if (mode === 'guest') leaveOnline();
  mode = 'menu';
  music.play('menu', { era: save.era });
  for (const [id, seat] of seats) if (seat.source === 'local') seats.delete(id);
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

// Heroes join the roster as the story reaches them (see HERO_UNLOCKS).
function syncHeroes() {
  const fresh = [];
  for (const [id, stage] of Object.entries(HERO_UNLOCKS)) {
    if (save.heroes.includes(id)) continue;
    if (save.unlocked.includes(nextStageOf(stage))) {
      save.heroes.push(id);
      fresh.push(id);
    }
  }
  return fresh;
}

// Colour swaps for a player who gets a hero someone already plays.
const ALT_LOOKS = {
  p2: { sash: '#3a7ad8', udeng: '#3a5a9a', top: '#2a3448', pants: '#2a3448', sleeve: '#2a3448', kerudung: '#7a3a6a', helmet: '#3a7ad8', bandana: '#3a7ad8' },
  p3: { sash: '#3aa05a', udeng: '#2f7a3a', top: '#24402c', pants: '#24402c', sleeve: '#24402c', kerudung: '#3a7a5a', helmet: '#3aa05a', bandana: '#3aa05a' },
  p4: { sash: '#e0b252', udeng: '#a8862e', top: '#4a3a1a', pants: '#4a3a1a', sleeve: '#4a3a1a', kerudung: '#a8862e', helmet: '#e0b252', bandana: '#e0b252' },
};

// A new player takes the next unlocked hero nobody is playing; if all are
// taken, a colour-swapped copy.
function addPlayer(id, dropIn) {
  if (game.heroes.has(id)) return;
  const taken = new Set([...game.heroes.values()].map((h) => h.def.id));
  const pick = ROSTER.map((r) => r.id).find((h) => !taken.has(h) && save.heroes.includes(h));
  const hero = game.addHero(id, pick ?? save.hero, { look: pick ? undefined : ALT_LOOKS[id] });
  applyUpgrades(hero, save);
  if (dropIn) {
    hero.x = game.heroes.get('p1').x;
    game.respawn(hero);
    game.emit({ type: 'tutorial', key: 'joined_' + id });
  }
  renderer.hud.p2Hint = false;
}

function removePlayer(id) {
  const h = game.heroes.get(id);
  if (h) {
    h.remove = true;
    game.heroes.delete(id);
  }
  seats.delete(id);
}

// Gamepad for each local seat: the 2nd pad drives P2, 3rd P3, 4th P4
// (or one lower when P2 is set to the 1st pad and P1 plays on the keyboard).
function padIndexFor(id) {
  return SLOTS.indexOf(id) + ((save.settings.p2pad ?? 1) === 0 ? 0 : 1);
}

function releaseInputs() {
  keyboard.releaseAll();
  keyboard2.releaseAll();
  touch?.releaseAll();
}

function persist() {
  writeSave(save);
}

const screens = new Screens(ui, {
  getSave: () => save,
  onHostOnline: () => hostOnline(),
  onJoinOnline: (code) => joinOnline(code),
  onLeaveOnline: () => {
    leaveOnline();
    screens.netStatus = '';
    screens.render();
  },
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
    if (mode === 'guest') paused = false;
    if (mode !== 'play') return;
    paused = false;
    loop.resetClock();
  },
  onRestart: () => {
    menu.close();
    if (mode === 'guest') return;
    play(game.stage.id, { rupiah: save.rupiah });
  },
  onQuit: () => toMenu(),
  onLanguage: () => {
    hint.textContent = t(touch ? 'hintTouch' : 'hintDesktop');
    touch?.labels();
  },
});

function openPause() {
  if ((mode !== 'play' && mode !== 'guest') || menu.isOpen) return;
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
    else if (mode === 'play' || mode === 'guest') openPause();
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
  const fresh = syncHeroes();
  joinQueue = fresh.slice();
  if (fresh.length) {
    hint.textContent = fresh.map((id) => t('heroUnlocked').replace('{name}', t(`hero_${id}`))).join(' · ');
    hint.style.opacity = '1';
    setTimeout(() => (hint.style.opacity = '0'), 7000);
  }
  persist();
}

// ---- Online co-op ----
// The host runs the game; the guest sends its buttons and draws snapshots.
const mirror = new Mirror(STAGES);
const waitBox = document.createElement('div');
waitBox.className = 'net-wait';
waitBox.hidden = true;
ui.append(waitBox);

function remoteCount() {
  return [...seats.values()].filter((x) => x.source === 'remote').length;
}

function hostSend(dt) {
  netEvents.push(...game.events);
  snapClock += dt;
  if (snapClock < 1 / 20) return;
  snapClock = 0;
  net.room.send(packSnapshot(game, netEvents, mode === 'play' ? 'play' : 'wait'));
  netEvents = [];
}

function guestInput(msg) {
  if (!net?.connected) return;
  if (msg.held !== remote.sentHeld || msg.pressed) {
    net.room.send({ type: 'input', held: msg.held, pressed: msg.pressed });
    remote.sentHeld = msg.held;
  }
  if (continueQueued) net.room.send({ type: 'continue' });
  continueQueued = false;
}

function guestRender(time, dt) {
  pollPadMenus(dt);
  const g = mirror.game;
  const playing = g && mirror.mode === 'play';
  waitBox.hidden = playing;
  if (!playing) waitBox.textContent = t(net?.connected ? 'netWaitHost' : 'netConnecting');
  if (!g) return;
  renderer.draw(g, time, dt, debug);
  for (const ev of g.events) {
    if (ev.type === 'sfx') audio.play(ev.name, ev.power ?? 1);
    if (ev.type === 'boss') music.setBoss(ev.who?.def?.id === 'batara_kala' ? 'kala' : true);
    if (ev.type === 'clear') music.play('story', { era: g.eraAfter });
  }
  g.events.length = 0;
  const me = g.heroes.get(remote.me);
  touch?.setReady(me && me.semangat >= SPECIAL_COST);
  const showContinue = playing && (g.over || me?.out);
  if (continueBtn.hidden === showContinue) {
    continueBtn.textContent = t('continueBtn');
    continueBtn.hidden = !showContinue;
  }
  document.body.classList.toggle('choosing', !!showContinue);
}

function netStatus(text) {
  screens.netStatus = text;
  if (screens.current === 'online') screens.render();
}

// Plain-language reason for a failed connection (the code in brackets helps debugging).
function netErrorText(why) {
  const key = {
    'peer-unavailable': 'netNoRoom',
    timeout: 'netBlocked',
    'ice-failed': 'netBlocked',
    link: 'netBlocked',
    'server-timeout': 'netNoServer',
    network: 'netNoServer',
    'server-error': 'netNoServer',
    'socket-error': 'netNoServer',
    'socket-closed': 'netNoServer',
    'unavailable-id': 'netCodeTaken',
  }[why] ?? 'netError';
  return `${t(key)} (${why})`;
}

async function hostOnline() {
  leaveOnline();
  netStatus(t('netCreating'));
  try {
    const room = await hostRoom({
      onOpen: (guest) => {
        // The friend takes the first free seat (P2, P3, P4).
        const id = SLOTS.find((s) => !seats.has(s));
        if (!id) {
          net.room.sendTo(guest, { type: 'full' });
          return;
        }
        seats.set(id, { source: 'remote', guest, held: 0, pressed: 0, cont: false });
        net.room.sendTo(guest, { type: 'seat', playerId: id });
        if (mode === 'play') addPlayer(id, true);
        netStatus(t('netFriendIn').replace('{n}', remoteCount()));
        audio.play('combo');
      },
      onMessage: (m, guest) => {
        const seat = [...seats.values()].find((x) => x.guest === guest);
        if (!seat) return;
        if (m.type === 'input') {
          seat.held = m.held;
          seat.pressed |= m.pressed;
        } else if (m.type === 'continue') seat.cont = true;
      },
      onClose: (guest) => {
        if (!net) return;
        for (const [id, seat] of seats) if (seat.guest === guest) removePlayer(id);
        netStatus(t('netFriendLeft'));
      },
      onError: (why) => netStatus(netErrorText(why)),
      onStatus: (key) => netStatus(t(key)),
    });
    net = { role: 'host', room, code: room.code };
    screens.netCode = room.code;
    if (!screens.netStatus || screens.netStatus === t('netCreating')) netStatus(t('netServer'));
  } catch {
    netStatus(t('netNoLib'));
  }
}

async function joinOnline(code) {
  leaveOnline();
  if (!code) return;
  netStatus(t('netConnecting'));
  try {
    const room = await joinRoom(code, {
      onOpen: () => {
        net.connected = true;
        mode = 'guest';
        paused = false;
        screens.hide();
        document.body.classList.remove('in-menu');
        renderer.showHud = true;
        renderer.hud.p2Hint = false;
      },
      onMessage: (m) => {
        if (m.type === 'seat') remote.me = m.playerId;
        if (m.type === 'full') {
          netStatus(t('netFull'));
          leaveOnline();
          return;
        }
        if (m.type !== 'snap') return;
        const was = mirror.mode;
        mirror.apply(m, (g) => {
          renderer.setStage(g.stage);
          renderer.hud.p2Hint = false;
        });
        if (mirror.mode !== was || !music.track) music.play(mirror.mode === 'play' ? m.stage : 'story', { era: m.g.era });
      },
      onClose: () => {
        if (mode === 'guest') {
          leaveOnline();
          toMenu();
          hint.textContent = t('netFriendLeft');
          hint.style.opacity = '1';
          setTimeout(() => (hint.style.opacity = '0'), 5000);
        }
      },
      onError: (why) => netStatus(netErrorText(why)),
      onStatus: (key) => netStatus(t(key)),
    });
    net = { role: 'guest', room, connected: false, code: room.code };
  } catch {
    netStatus(t('netNoLib'));
  }
}

function leaveOnline() {
  if (!net) return;
  const n = net;
  net = null;
  n.room.close();
  waitBox.hidden = true;
  mirror.game = null;
  if (n.role === 'guest' && mode === 'guest') mode = 'menu';
  if (n.role === 'host') for (const [id, seat] of seats) if (seat.source === 'remote') removePlayer(id);
  screens.netCode = null;
}

// Closing the tab tells the others right away instead of timing out.
window.addEventListener('pagehide', () => leaveOnline());

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
    if (mode === 'guest') {
      guestInput(msg);
      return;
    }
    // Players 2–4: numpad (P2) and gamepads on this device, or online guests.
    const numpad = keyboard2.message('p2');
    const p2pad = save.settings.p2pad ?? 1;
    const msgs = [['p1', msg]];
    const canJoin = mode === 'play' && !game.cleared && !game.over;
    for (const id of SLOTS) {
      const seat = seats.get(id);
      if (seat?.source === 'remote') {
        const m = { type: 'input', playerId: id, held: seat.held, pressed: seat.pressed };
        seat.pressed = 0;
        if (seat.cont) {
          seat.cont = false;
          m.pressed |= BTN.LIGHT;
        }
        msgs.push([id, m]);
        continue;
      }
      const i = padIndexFor(id);
      const pad_ = i === 0 ? pad : pads.poll(i);
      const m = { type: 'input', playerId: id, held: pad_?.held ?? 0, pressed: pad_?.pressed ?? 0 };
      if (id === 'p2') {
        m.held |= numpad.held;
        m.pressed |= numpad.pressed;
      }
      // P2 on the first pad: that pad stops driving P1.
      if (i === 0 && pad && (seat || pad.pressed)) {
        msg.held &= ~pad.held;
        msg.pressed &= ~pad.pressed;
      }
      if (!seat) {
        if (canJoin && (m.pressed || pad_?.start)) {
          seats.set(id, { source: 'local' });
          addPlayer(id, true);
        }
        continue;
      }
      msgs.push([id, m]);
    }
    if (game.over && (continueQueued || msgs.some(([, m]) => m.pressed & BTN.LIGHT))) game.applyInput({ type: 'continue', playerId: 'p1' });
    continueQueued = false;
    for (const [id, m] of msgs) {
      if (game.heroes.get(id)?.out && m.pressed & BTN.LIGHT) game.applyInput({ type: 'continue', playerId: id });
    }
    for (const [, m] of msgs) game.applyInput(m);
    game.step(dt);
  },
  render(time, dt) {
    if (mode === 'guest') {
      guestRender(time, dt);
      return;
    }
    if (paused) pollPadMenus(dt);
    renderer.draw(game, time, dt, debug);
    const hero = game.heroes.get('p1');
    for (const ev of game.events) {
      if (ev.type === 'sfx') audio.play(ev.name, ev.power ?? 1);
      if (ev.type === 'noSemangat') audio.play('deny');
      if (ev.type === 'boss') music.setBoss(ev.who?.def?.id === 'batara_kala' ? 'kala' : true);
      if (ev.type === 'clear') music.play('story', { era: game.eraAfter });
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
    if (net?.role === 'host' && remoteCount()) hostSend(dt);
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
    document.body.classList.toggle('choosing', showAgain || showNext || showContinue);
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
  // Between stages: a new hero's scene (if one just unlocked), the warung, then the next stage.
  paused = true;
  releaseInputs();
  nextBtn.hidden = true;
  againBtn.hidden = true;
  renderer.showHud = false;
  document.body.classList.add('in-menu');
  const openShop = () => {
    mode = 'shop';
    screens.show('shop');
  };
  const lines = joinQueue.flatMap((id) => JOIN_SCENES[id] ?? []);
  joinQueue = [];
  if (lines.length) {
    mode = 'story';
    story.play(lines, { hero: save.hero, onDone: openShop });
  } else openShop();
});

newGame(urlStage ?? 'stage0', { preview: !urlStage });
if (urlStage) play(urlStage);
else {
  document.body.classList.add('in-menu');
  renderer.showHud = false;
  screens.show('title');
  music.play('menu', { era: save.era });
}
