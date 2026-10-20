export const HOTBAR_SIZE = 9;
export const MAX_STACK = 999;

export class Inventory {
  constructor(size = HOTBAR_SIZE) {
    this.slots = new Array(size).fill(null);
    this.selected = 0;
    this.version = 0;
  }

  // Returns how many could not fit.
  add(id, count = 1) {
    for (const s of this.slots) {
      if (count === 0) break;
      if (s && s.id === id && s.count < MAX_STACK) {
        const n = Math.min(count, MAX_STACK - s.count);
        s.count += n;
        count -= n;
      }
    }
    for (let i = 0; i < this.slots.length && count > 0; i++) {
      if (this.slots[i]) continue;
      const n = Math.min(count, MAX_STACK);
      this.slots[i] = { id, count: n };
      count -= n;
    }
    this.version++;
    return count;
  }

  takeFromSlot(i, count = 1) {
    const s = this.slots[i];
    if (!s || s.count < count) return false;
    s.count -= count;
    if (s.count === 0) this.slots[i] = null;
    this.version++;
    return true;
  }

  select(i) {
    if (i < 0 || i >= this.slots.length || i === this.selected) return;
    this.selected = i;
    this.version++;
  }

  get selectedItem() {
    return this.slots[this.selected];
  }

  toJSON() {
    return { slots: this.slots, selected: this.selected };
  }
}
