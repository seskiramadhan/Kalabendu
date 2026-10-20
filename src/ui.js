import { TILES } from './tiles.js';
import { iconDataURL } from './textures.js';
import { t, formatRupiah } from './i18n.js';

export class Hud {
  constructor(root, atlas, onSelect) {
    this.atlas = atlas;
    this.icons = new Map();
    this.lastVersion = -1;
    this.lastStats = '';

    this.stats = el('div', 'hud-stats');
    this.label = el('div', 'hud-label');
    this.hotbar = el('div', 'hotbar');
    this.slots = [];
    for (let i = 0; i < 9; i++) {
      const slot = el('button', 'slot');
      slot.type = 'button';
      slot.innerHTML = `<span class="key">${i + 1}</span><img alt=""><span class="count"></span>`;
      slot.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        onSelect(i);
      });
      this.hotbar.append(slot);
      this.slots.push(slot);
    }
    root.append(this.stats, this.label, this.hotbar);
    this.labelTimer = 0;
  }

  refreshText() {
    this.lastVersion = -1;
    this.lastStats = '';
    this.lastSelected = undefined;
  }

  icon(id) {
    if (!this.icons.has(id)) this.icons.set(id, iconDataURL(this.atlas, id));
    return this.icons.get(id);
  }

  update(player, dt) {
    const inv = player.inventory;
    if (inv.version !== this.lastVersion) {
      const prevSelected = this.lastSelected;
      inv.slots.forEach((s, i) => {
        const slot = this.slots[i];
        const img = slot.querySelector('img');
        const count = slot.querySelector('.count');
        slot.classList.toggle('selected', i === inv.selected);
        if (s) {
          img.src = this.icon(s.id);
          img.style.visibility = 'visible';
          count.textContent = s.count > 1 ? s.count : '';
          slot.title = t('tile_' + TILES[s.id].key);
        } else {
          img.style.visibility = 'hidden';
          count.textContent = '';
          slot.title = '';
        }
      });
      if (prevSelected !== inv.selected || this.lastVersion < 0) {
        const s = inv.selectedItem;
        this.label.textContent = s ? t('tile_' + TILES[s.id].key) : '';
        this.labelTimer = 2;
      }
      this.lastSelected = inv.selected;
      this.lastVersion = inv.version;
    }

    this.labelTimer = Math.max(0, this.labelTimer - dt);
    this.label.style.opacity = this.labelTimer > 0 ? Math.min(1, this.labelTimer * 2) : 0;

    const stats = `${t('hp')} ${player.hp}/${player.maxHp} · ${formatRupiah(player.rupiah)}`;
    if (stats !== this.lastStats) {
      this.stats.textContent = stats;
      this.lastStats = stats;
    }
  }
}

function el(tag, cls) {
  const e = document.createElement(tag);
  e.className = cls;
  return e;
}
