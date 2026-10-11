import type { Category, Conservation, Rarity, Species } from '../types';
import { CONSERVATION, RARITIES } from '../meta';
import { log } from './log.svelte';

export type SortKey = 'name' | 'observed' | 'rarity' | 'conservation';
export type Status = 'all' | 'spotted' | 'unspotted';

export class Filters {
  query = $state('');
  rarities = $state<Rarity[]>([]);
  conservation = $state<Conservation[]>([]);
  group = $state('');
  status = $state<Status>('all');
  endemicOnly = $state(false);
  sort = $state<SortKey>('name');

  get activeCount() {
    return (
      this.rarities.length +
      this.conservation.length +
      (this.group ? 1 : 0) +
      (this.status !== 'all' ? 1 : 0) +
      (this.endemicOnly ? 1 : 0)
    );
  }

  reset() {
    this.query = '';
    this.rarities = [];
    this.conservation = [];
    this.group = '';
    this.status = 'all';
    this.endemicOnly = false;
  }

  apply(list: Species[]): Species[] {
    const q = this.query.trim().toLowerCase();
    const out = list.filter((s) => {
      if (q) {
        const hay = [s.name, s.scientificName, s.group, ...(s.whereToSee ?? []), ...(s.habitats ?? [])]
          .join(' ')
          .toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (this.rarities.length && !this.rarities.includes(s.rarity)) return false;
      if (this.conservation.length && !this.conservation.includes(s.conservation)) return false;
      if (this.group && s.group !== this.group) return false;
      if (this.endemicOnly && !s.endemic) return false;
      if (this.status !== 'all' && log.isSpotted(s.id) !== (this.status === 'spotted')) return false;
      return true;
    });

    const byName = (a: Species, b: Species) => a.name.localeCompare(b.name);
    const cmp: Record<SortKey, (a: Species, b: Species) => number> = {
      name: byName,
      observed: (a, b) => (b.observations ?? 0) - (a.observations ?? 0) || byName(a, b),
      rarity: (a, b) => RARITIES.indexOf(b.rarity) - RARITIES.indexOf(a.rarity) || byName(a, b),
      conservation: (a, b) =>
        CONSERVATION[b.conservation].order - CONSERVATION[a.conservation].order || byName(a, b)
    };
    return out.sort(cmp[this.sort]);
  }
}

/** One filter set per section, kept for the session so switching tabs doesn't lose them. */
export const filters: Record<Category, Filters> = {
  fish: new Filters(),
  birds: new Filters(),
  animals: new Filters()
};

export function toggle<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}
