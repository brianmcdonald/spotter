import { load, save } from '../storage';
import { speciesById } from '../data';
import type { LogExport, Sighting } from '../types';

const KEY = 'kenya-spotter:sightings';

function uid(): string {
  return crypto.randomUUID?.() ?? `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

function isSighting(x: unknown): x is Sighting {
  const s = x as Sighting;
  return (
    !!s &&
    typeof s.id === 'string' &&
    typeof s.speciesId === 'string' &&
    typeof s.date === 'string' &&
    typeof s.locationName === 'string' &&
    (s.lat === undefined || typeof s.lat === 'number') &&
    (s.lng === undefined || typeof s.lng === 'number')
  );
}

class SightingLog {
  sightings = $state<Sighting[]>(load<Sighting[]>(KEY, []));

  /** speciesId -> sightings, newest first. */
  bySpecies = $derived.by(() => {
    const map = new Map<string, Sighting[]>();
    for (const s of this.sightings) {
      const list = map.get(s.speciesId) ?? [];
      list.push(s);
      map.set(s.speciesId, list);
    }
    for (const list of map.values()) list.sort((a, b) => b.date.localeCompare(a.date));
    return map;
  });

  isSpotted(speciesId: string): boolean {
    return this.bySpecies.has(speciesId);
  }

  add(entry: Omit<Sighting, 'id' | 'createdAt'>): void {
    this.sightings.push({ ...entry, id: uid(), createdAt: new Date().toISOString() });
    this.persist();
  }

  update(id: string, patch: Partial<Omit<Sighting, 'id' | 'speciesId'>>): void {
    const s = this.sightings.find((x) => x.id === id);
    if (s) Object.assign(s, patch);
    this.persist();
  }

  remove(id: string): void {
    this.sightings = this.sightings.filter((s) => s.id !== id);
    this.persist();
  }

  clear(): void {
    this.sightings = [];
    this.persist();
  }

  toExport(): LogExport {
    return {
      app: 'kenya-spotter',
      version: 1,
      exportedAt: new Date().toISOString(),
      sightings: $state.snapshot(this.sightings)
    };
  }

  /**
   * Imports sightings from an export file. In "merge" mode, entries with an id
   * that already exists are skipped. Returns counts for user feedback.
   */
  import(data: unknown, mode: 'merge' | 'replace'): { added: number; skipped: number } {
    const list = Array.isArray(data) ? data : (data as LogExport)?.sightings;
    if (!Array.isArray(list)) throw new Error('This file does not look like a Kenya Spotter log.');

    const valid = list.filter((s) => isSighting(s) && speciesById.has(s.speciesId)) as Sighting[];
    let skipped = list.length - valid.length;

    let added = valid;
    if (mode === 'replace') {
      this.sightings = valid;
    } else {
      const existing = new Set(this.sightings.map((s) => s.id));
      added = valid.filter((s) => !existing.has(s.id));
      skipped += valid.length - added.length;
      this.sightings.push(...added);
    }
    this.persist();
    return { added: added.length, skipped };
  }

  private persist() {
    save(KEY, $state.snapshot(this.sightings));
  }
}

export const log = new SightingLog();
