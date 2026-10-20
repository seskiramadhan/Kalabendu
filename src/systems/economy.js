// Warung between stages. Prices climb with every stage cleared (inflation),
// and faster for every bribe accepted.
export const SHOP_ITEMS = [
  { id: 'jamu', nameKey: 'shop_jamu', descKey: 'shop_jamu_desc', base: 3000, kind: 'upgrade', stat: 'hp', max: 3 },
  { id: 'sabuk', nameKey: 'shop_sabuk', descKey: 'shop_sabuk_desc', base: 4000, kind: 'upgrade', stat: 'dmg', max: 3 },
  { id: 'kopi', nameKey: 'shop_kopi', descKey: 'shop_kopi_desc', base: 1500, kind: 'boost', boost: 'semangat' },
  { id: 'nasipadang', nameKey: 'shop_nasipadang', descKey: 'shop_nasipadang_desc', base: 2500, kind: 'boost', boost: 'life', max: 2 },
  { id: 'masker', nameKey: 'shop_masker', descKey: 'shop_masker_desc', base: 1000, kind: 'boost', boost: 'mask' },
];

export const HP_PER_JAMU = 15;
export const DMG_PER_SABUK = 0.1;

export function inflation(save) {
  const cleared = Math.max(0, save.unlocked.length - 1);
  return (1 + 0.2 * cleared) * (1 + 0.25 * save.bribes.length);
}

export function priceOf(item, save) {
  return Math.round((item.base * inflation(save)) / 500) * 500;
}

export function ownedCount(item, save) {
  if (item.kind === 'upgrade') return save.upgrades?.[item.stat] ?? 0;
  if (item.boost === 'life') return save.boosts?.life ?? 0;
  return save.boosts?.[item.boost] ? 1 : 0;
}

export function canBuy(item, save) {
  const max = item.max ?? 1;
  return save.rupiah >= priceOf(item, save) && ownedCount(item, save) < max;
}

export function buy(item, save) {
  if (!canBuy(item, save)) return false;
  save.rupiah -= priceOf(item, save);
  save.upgrades ??= { hp: 0, dmg: 0 };
  save.boosts ??= {};
  if (item.kind === 'upgrade') save.upgrades[item.stat] = (save.upgrades[item.stat] ?? 0) + 1;
  else if (item.boost === 'life') save.boosts.life = (save.boosts.life ?? 0) + 1;
  else save.boosts[item.boost] = true;
  return true;
}

// Applies upgrades and one-stage boosts to a fresh hero; boosts are used up.
export function applyToHero(hero, save) {
  const up = save.upgrades ?? {};
  hero.def = { ...hero.def, maxHp: hero.def.maxHp + (up.hp ?? 0) * HP_PER_JAMU };
  hero.hp = hero.def.maxHp;
  hero.dmgMul = 1 + (up.dmg ?? 0) * DMG_PER_SABUK + (save.bribePower ? 0.3 : 0);
  const b = save.boosts ?? {};
  if (b.semangat) hero.semangat = 100;
  if (b.life) hero.lives += b.life;
  if (b.mask) hero.poisonImmune = true;
  save.boosts = {};
}
