import type { Category, Conservation, Rarity } from './types';
import images from './data/images.json';
import type { Photo, Species, SpeciesImage } from './types';

const bundled = images as Record<string, SpeciesImage>;

/** Bundled curated photo (works offline) if there is one, else the remote iNaturalist photo. */
export function imageFor(s: Species): (Photo & { width?: number; height?: number }) | undefined {
  const b = bundled[s.id];
  if (b) return { src: b.src, width: b.width, height: b.height, attribution: `${b.artist}`, license: b.license, sourceUrl: b.sourceUrl };
  return s.photo;
}

export const CATEGORY_LABEL: Record<Category, string> = {
  fish: 'Fish',
  birds: 'Birds',
  animals: 'Animals'
};

export const RARITIES: Rarity[] = ['Common', 'Uncommon', 'Rare', 'Very Rare'];

export const CONSERVATION: Record<Conservation, { label: string; order: number }> = {
  NE: { label: 'Not Evaluated', order: -2 },
  DD: { label: 'Data Deficient', order: -1 },
  LC: { label: 'Least Concern', order: 0 },
  NT: { label: 'Near Threatened', order: 1 },
  VU: { label: 'Vulnerable', order: 2 },
  EN: { label: 'Endangered', order: 3 },
  CR: { label: 'Critically Endangered', order: 4 }
};

/** Formats a yyyy-mm-dd date in local time (avoids the UTC-midnight off-by-one). */
export function fmtDate(iso: string, opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' }) {
  return new Date(`${iso}T00:00:00`).toLocaleDateString(undefined, opts);
}
