import type { BookEntry, BookFacts, BookSource, Category, Photo, Species } from '../types';
import generated from './species.json';
import facts from './book-facts.json';
import { curated } from './curated.ts';

/**
 * The catalogue = generated Kenya data (iNaturalist + eBird, see
 * scripts/fetch-species.ts) with curated entries layered on top. Data-driven
 * fields (rarity, conservation, observations, endemism) come from the
 * generated data, except rarity: observation counts track where people go
 * (sanctuary rhinos look "common"), so hand-set rarity wins, then the field
 * guide's abundance for Kenya (book-facts.json, birds), then the data.
 */
const curatedById = new Map(curated.map((c) => [c.id, c]));
const bookFacts = facts as Record<string, BookFacts>;

function merge(g: Species): Species {
  const c = curatedById.get(g.id);
  const f = bookFacts[g.id];
  if (!c) return f ? { ...g, size: g.size ?? f.size, rarity: f.rarity ?? g.rarity } : g;
  return {
    ...c,
    ...g,
    name: c.name,
    description: c.description,
    habitats: c.habitats,
    size: c.size ?? f?.size,
    diet: c.diet,
    funFact: c.funFact,
    wiki: c.wiki,
    whereToSee: c.whereToSee?.length ? c.whereToSee : g.whereToSee,
    rarity: c.rarity,
    conservation: g.conservation === 'NE' ? c.conservation : g.conservation,
    endemic: g.endemic || c.endemic
  };
}

const generatedIds = new Set((generated as Species[]).map((g) => g.id));

export const allSpecies: Species[] = [
  ...(generated as Species[]).map(merge),
  // Curated species with no Kenyan records in the generated data (e.g. deep-sea fish).
  ...curated.filter((c) => !generatedIds.has(c.id))
];

export const speciesByCategory: Record<Category, Species[]> = {
  fish: allSpecies.filter((s) => s.category === 'fish'),
  birds: allSpecies.filter((s) => s.category === 'birds'),
  animals: allSpecies.filter((s) => s.category === 'animals')
};

export const speciesById = new Map(allSpecies.map((s) => [s.id, s]));

/** Fetches a JSON file once, retrying on a later call if it failed (e.g. offline). */
function lazyJson<T extends object>(url: string, empty: T) {
  let pending: Promise<T> | undefined;
  return (): Promise<T> =>
    (pending ??= fetch(url)
      .then((r) => (r.ok ? r.json() : empty))
      .catch(() => {
        pending = undefined;
        return empty;
      }));
}

const summaries = lazyJson<Record<string, string>>('data/summaries.json', {});
const gallery = lazyJson<Record<string, Photo[]>>('data/photos.json', {});
// Field guide content (public/books/, from scripts/extract-books.py; optional)
// is loaded on demand; the PDFs themselves are never committed.
const books = lazyJson<{ sources: Record<string, BookSource>; entries: Record<string, BookEntry[]> }>(
  'books/books.json',
  { sources: {}, entries: {} }
);

/** Wikipedia summary for generated species, loaded once on first use. */
export async function loadSummary(id: string): Promise<string | undefined> {
  return (await summaries())[id];
}

/** Extra iNaturalist photos beyond the card photo. */
export async function loadGallery(id: string): Promise<Photo[]> {
  return (await gallery())[id] ?? [];
}

/** Field guide accounts for a species, with their book details. */
export async function loadBookEntries(id: string): Promise<(BookEntry & { book: BookSource })[]> {
  if (!__HAS_BOOKS__) return [];
  const { sources, entries } = await books();
  return (entries[id] ?? []).filter((e) => sources[e.source]).map((e) => ({ ...e, book: sources[e.source] }));
}
