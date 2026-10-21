import { t } from '../core/i18n.js';

// The controls page (title menu and pause menu): which key does what.
const ROWS = [
  ['ctlUp', ['W'], ['↑'], ['8'], 'ctlPadUp'],
  ['ctlLeft', ['A'], ['←'], ['4'], 'ctlPadLeft'],
  ['ctlDown', ['S'], ['↓'], ['5'], 'ctlPadDown'],
  ['ctlRight', ['D'], ['→'], ['6'], 'ctlPadRight'],
  ['ctlPunch', ['J'], null, ['1'], 'X'],
  ['ctlKick', ['K'], null, ['2'], 'Y'],
  ['ctlJump', ['L'], ['Space'], ['3'], 'A'],
  ['ctlSpecial', ['I'], null, ['Enter'], 'B'],
  ['ctlDodge', ['Shift'], null, ['0'], 'LB / RB'],
  ['ctlMenu', ['Esc'], null, null, 'Start'],
];

const TIPS = ['ctlTipGrab', 'ctlTipWeapon', 'ctlTipAir', 'ctlTipJoin'];

function el(tag, cls, text) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text !== undefined) e.textContent = text;
  return e;
}

function keys(list, alt) {
  const cell = el('td');
  if (!list) {
    cell.textContent = '—';
    return cell;
  }
  for (const k of list) cell.append(el('kbd', null, k));
  if (alt) {
    cell.append(el('span', 'muted', ` ${t('ctlOr')} `));
    for (const k of alt) cell.append(el('kbd', null, k));
  }
  return cell;
}

export function controlsTable() {
  const wrap = el('div', 'controls');
  const table = el('table', 'controls-table');
  const head = el('tr');
  for (const k of ['ctlAction', 'ctlKeyboard', 'ctlNumpad', 'ctlGamepad']) head.append(el('th', null, t(k)));
  table.append(head);
  for (const [name, kb, kbAlt, num, pad] of ROWS) {
    const tr = el('tr');
    tr.append(el('td', 'ctl-name', t(name)), keys(kb, kbAlt), keys(num), el('td', null, pad.startsWith('ctl') ? t(pad) : pad));
    table.append(tr);
  }
  const tips = el('ul', 'controls-tips');
  for (const k of TIPS) tips.append(el('li', null, t(k)));
  wrap.append(table, tips);
  return wrap;
}
