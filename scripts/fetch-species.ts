/**
 * Builds the species catalogue from iNaturalist (and eBird, for birds) using
 * Kenya-only data, and writes:
 *   src/lib/data/species.json   – catalogue bundled into the app
 *   public/data/summaries.json  – Wikipedia summaries, loaded on demand
 *   public/data/photos.json     – extra openly licensed photos per species, loaded on demand
 *
 *   npm run species
 *   EBIRD_API_KEY=xxxx npm run species   # also enrich birds from eBird (or put it in .env)
 *
 * iNaturalist: species with research-grade observations in Kenya (place 7042),
 * excluding species iNaturalist lists as introduced there. Rarity is derived
 * from how often each species is observed in Kenya relative to others in its
 * section. eBird (optional, needs a free key from https://ebird.org/api/keygen):
 * adds birds on eBird's Kenya checklist missing from iNaturalist, uses eBird
 * family names, bases bird rarity on how many Kenyan hotspots have recorded the
 * species, and lists hotspots to see it.
 *
 * Kenyan fish from Coastal Fishes of the Western Indian Ocean that iNaturalist
 * has no Kenyan records of (src/lib/data/book-species.json, written by
 * scripts/extract-books.py) are added too, with iNaturalist photos and status.
 */
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { curated } from '../src/lib/data/curated.ts';
import type { Category, Conservation, Photo, Species } from '../src/lib/types.ts';

const KENYA_PLACE_ID = 7042;
const KENYA_REGION = 'KE';
const UA = 'KenyaSpotter/0.1 (species catalogue builder; contact via project repository)';
const EBIRD_KEY = process.env.EBIRD_API_KEY;
/** How many of Kenya's richest eBird hotspots to sample for rarity and "where to see". */
const HOTSPOT_SAMPLE = 60;

const SECTIONS: { category: Category; taxa: { id: number; label: string }[] }[] = [
  { category: 'birds', taxa: [{ id: 3, label: 'Birds' }] },
  {
    category: 'fish',
    taxa: [
      { id: 47178, label: 'Ray-finned fishes' },
      { id: 47273, label: 'Sharks and rays' }
    ]
  },
  {
    category: 'animals',
    taxa: [
      { id: 40151, label: 'Mammals' },
      { id: 26036, label: 'Reptiles' },
      { id: 20978, label: 'Amphibians' }
    ]
  }
];

// Kenyan usage where iNaturalist's English name differs.
const NAME_OVERRIDES: Record<string, string> = {
  'Damaliscus lunatus': 'Topi',
  'Mellivora capensis': 'Honey Badger'
};
/** Photos per species kept for the gallery (the first is the card photo). */
const GALLERY_SIZE = 6;

// Licences that allow reuse with attribution ("all rights reserved" photos have none).
const OPEN_LICENSES = new Set(['cc0', 'cc-by', 'cc-by-sa', 'cc-by-nc', 'cc-by-nc-sa', 'cc-by-nd', 'cc-by-nc-nd']);

// ---------------------------------------------------------------------------

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const chunk = <T>(arr: T[], n: number) =>
  Array.from({ length: Math.ceil(arr.length / n) }, (_, i) => arr.slice(i * n, i * n + n));
const slug = (s: string) =>
  (s ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
/** Genus + species epithet, so subspecies and author strings still match. */
const binomial = (s: string) => s.trim().split(/\s+/).slice(0, 2).join(' ').toLowerCase();
const stripHtml = (s?: string | null) =>
  (s ?? '')
    .replace(/<[^>]*>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();

// Responses are cached for a day so an interrupted run can resume without
// re-requesting everything. Delete .cache/ (or wait a day) to refresh.
const CACHE_DIR = '.cache/api';
const CACHE_TTL = 24 * 60 * 60 * 1000;
mkdirSync(CACHE_DIR, { recursive: true });

let lastCall = 0;
/** GET JSON with caching, polite pacing (≥1.1s between calls) and retries. */
async function getJson(url: string, headers: Record<string, string> = {}, attempt = 0): Promise<any> {
  const file = `${CACHE_DIR}/${createHash('sha1').update(url).digest('hex')}.json`;
  if (existsSync(file) && Date.now() - statSync(file).mtimeMs < CACHE_TTL) {
    return JSON.parse(readFileSync(file, 'utf8'));
  }

  const wait = lastCall + 1100 - Date.now();
  if (wait > 0) await sleep(wait);
  lastCall = Date.now();

  const retry = async (why: string) => {
    if (attempt >= 5) throw new Error(`${why} — ${url}`);
    const backoff = 5000 * 2 ** attempt;
    console.log(`  … ${why}, retrying in ${backoff / 1000}s`);
    await sleep(backoff);
    return getJson(url, headers, attempt + 1);
  };

  let res: Response;
  try {
    res = await fetch(url, { headers: { 'User-Agent': UA, Accept: 'application/json', ...headers } });
  } catch (err) {
    return retry(`network error (${(err as Error).message})`);
  }
  if (res.status === 429 || res.status >= 500) return retry(`HTTP ${res.status}`);
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} — ${url}`);
  const data = await res.json();
  writeFileSync(file, JSON.stringify(data));
  return data;
}

const inat = (path: string, params: Record<string, string | number | boolean>) =>
  getJson(
    `https://api.inaturalist.org/v1/${path}?${new URLSearchParams(
      Object.entries(params).map(([k, v]) => [k, String(v)])
    )}`
  );

const ebird = (path: string) =>
  getJson(`https://api.ebird.org/v2/${path}`, { 'X-eBirdApiToken': EBIRD_KEY! });

// ---------------------------------------------------------------------------
// iNaturalist

interface Count {
  taxon: any;
  count: number;
}

async function speciesCounts(taxonId: number, extra: Record<string, string | boolean> = {}): Promise<Count[]> {
  const out: Count[] = [];
  for (let page = 1; ; page++) {
    const res = await inat('observations/species_counts', {
      place_id: KENYA_PLACE_ID,
      taxon_id: taxonId,
      quality_grade: 'research',
      per_page: 500,
      page,
      locale: 'en',
      ...extra
    });
    out.push(...res.results.filter((r: Count) => r.taxon.rank === 'species'));
    if (page * 500 >= res.total_results) return out;
  }
}

function normaliseStatus(raw?: string): Conservation | undefined {
  if (!raw) return;
  const s = raw.toLowerCase().replace(/[^a-z]/g, '');
  const map: Record<string, Conservation> = {
    lc: 'LC', leastconcern: 'LC',
    nt: 'NT', nearthreatened: 'NT',
    vu: 'VU', vulnerable: 'VU',
    en: 'EN', endangered: 'EN',
    cr: 'CR', criticallyendangered: 'CR',
    dd: 'DD', datadeficient: 'DD'
  };
  return map[s];
}

/** Prefer a Kenya-specific assessment, then the global IUCN Red List status. */
function conservationOf(t: any): Conservation {
  const statuses: any[] = t.conservation_statuses ?? [];
  const kenya = statuses.find((c) => c.place?.id === KENYA_PLACE_ID && normaliseStatus(c.status));
  const iucn = statuses.find((c) => !c.place && /iucn/i.test(c.authority ?? '') && normaliseStatus(c.status));
  return (
    normaliseStatus(kenya?.status) ??
    normaliseStatus(iucn?.status) ??
    (!t.conservation_status?.place ? normaliseStatus(t.conservation_status?.status) : undefined) ??
    'NE'
  );
}

/** Openly licensed photos, default photo first, without duplicates. */
function photosOf(t: any): Photo[] {
  const candidates = [t.default_photo, ...(t.taxon_photos ?? []).map((tp: any) => tp.photo)].filter(Boolean);
  const seen = new Set<number>();
  return candidates
    .filter((ph: any) => OPEN_LICENSES.has(ph.license_code) && !seen.has(ph.id) && seen.add(ph.id))
    .slice(0, GALLERY_SIZE)
    .map((p: any) => ({
      src: p.medium_url ?? p.url?.replace(/\/(square|small|thumb)\./, '/medium.'),
      attribution: p.attribution ?? 'iNaturalist contributor',
      license: (p.license_code as string).toUpperCase().replace(/^CC-/, 'CC '),
      sourceUrl: `https://www.inaturalist.org/photos/${p.id}`
    }));
}

const ancestorName = (t: any, rank: string) => {
  const a = (t.ancestors ?? []).find((x: any) => x.rank === rank);
  return a ? (a.preferred_common_name ?? a.name) : undefined;
};

const capitalise = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

// ---------------------------------------------------------------------------

type Draft = Species & { _summary?: string; _gallery?: Photo[] };

/** Splits a section into rarity bands by rank of a score (higher = more common). */
function assignRarityByRank(list: Draft[], score: (s: Draft) => number) {
  const sorted = [...list].sort((a, b) => score(b) - score(a));
  sorted.forEach((s, i) => {
    const pct = i / sorted.length;
    s.rarity = pct < 0.2 ? 'Common' : pct < 0.5 ? 'Uncommon' : pct < 0.8 ? 'Rare' : 'Very Rare';
  });
}

async function main() {
  const drafts: Draft[] = [];
  const bySci = new Map<string, Draft>();

  for (const section of SECTIONS) {
    for (const group of section.taxa) {
      console.log(`iNaturalist: ${group.label} in Kenya…`);
      const counts = await speciesCounts(group.id, { introduced: false });
      const endemic = new Set((await speciesCounts(group.id, { endemic: true })).map((c) => c.taxon.id));
      console.log(`  ${counts.length} species (${endemic.size} endemic)`);

      // Full taxon records: summaries, photo choices, ancestry, conservation statuses.
      const details = new Map<number, any>();
      for (const ids of chunk(
        counts.map((c) => c.taxon.id),
        30
      )) {
        // No preferred_place_id: with Kenya set, iNaturalist returns local names ("Chui", "Nyati").
        const res = await inat(`taxa/${ids.join(',')}`, { locale: 'en' });
        for (const t of res.results) details.set(t.id, t);
        process.stdout.write('.');
      }
      process.stdout.write('\n');

      for (const { taxon, count } of counts) {
        const t = { ...taxon, ...details.get(taxon.id) };
        const photos = photosOf(t);
        const d: Draft = {
          id: slug(t.name),
          category: section.category,
          name: NAME_OVERRIDES[t.name] ?? (t.preferred_common_name ? capitalise(t.preferred_common_name) : t.name),
          scientificName: t.name,
          rarity: 'Common',
          conservation: conservationOf(t),
          group:
            section.category === 'birds'
              ? ancestorName(t, 'family')
              : ancestorName(t, 'order') ?? ancestorName(t, 'class'),
          observations: count,
          inatId: t.id,
          endemic: endemic.has(t.id) || undefined,
          photo: photos[0],
          _summary: stripHtml(t.wikipedia_summary) || undefined,
          _gallery: photos.length > 1 ? photos.slice(1) : undefined
        };
        if (bySci.has(binomial(d.scientificName))) continue;
        drafts.push(d);
        bySci.set(binomial(d.scientificName), d);
      }
    }
  }

  for (const section of SECTIONS) {
    assignRarityByRank(
      drafts.filter((d) => d.category === section.category),
      (d) => d.observations ?? 0
    );
  }

  await addBookSpecies(drafts, bySci);

  if (EBIRD_KEY) await enrichFromEbird(drafts, bySci);
  else console.log('\neBird: skipped (set EBIRD_API_KEY to enrich birds from eBird).');

  // Curated entries keep their ids so existing sighting logs stay valid.
  // Names that differ (taxonomy changes) are resolved through iNaturalist's synonym search.
  const byInatId = new Map(drafts.filter((d) => d.inatId).map((d) => [d.inatId!, d]));
  const unmatched: string[] = [];
  for (const c of curated) {
    let d = bySci.get(binomial(c.scientificName));
    if (!d) {
      const res = await inat('taxa', { q: c.scientificName, per_page: 5, locale: 'en' });
      const hit = (res.results ?? []).find((t: any) => byInatId.has(t.id));
      d = hit && byInatId.get(hit.id);
    }
    if (d) d.id = c.id;
    else unmatched.push(`${c.id} (${c.scientificName})`);
  }

  // Disambiguate any id collisions.
  const seen = new Set<string>();
  for (const d of drafts) {
    while (seen.has(d.id)) d.id = `${d.id}-${d.inatId ?? 'x'}`;
    seen.add(d.id);
  }

  const summaries: Record<string, string> = {};
  const gallery: Record<string, Photo[]> = {};
  const species = drafts
    .map(({ _summary, _gallery, ...s }) => {
      if (_summary) summaries[s.id] = _summary;
      if (_gallery) gallery[s.id] = _gallery;
      return s;
    })
    .sort((a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name));

  writeFileSync('src/lib/data/species.json', JSON.stringify(species) + '\n');
  mkdirSync('public/data', { recursive: true });
  writeFileSync('public/data/summaries.json', JSON.stringify(summaries) + '\n');
  writeFileSync('public/data/photos.json', JSON.stringify(gallery) + '\n');

  const tally = (c: Category) => species.filter((s) => s.category === c).length;
  console.log(
    `\nWrote ${species.length} species — birds ${tally('birds')}, fish ${tally('fish')}, animals ${tally('animals')}.`
  );
  console.log(`${species.filter((s) => s.photo).length} with photos, ${Object.keys(summaries).length} with summaries.`);
  if (unmatched.length) {
    console.log(`Curated entries not found in the Kenya data (kept as-is):\n  ${unmatched.join('\n  ')}`);
  }
}

// ---------------------------------------------------------------------------
// Field guide species

interface BookSpecies {
  id: string;
  scientificName: string;
  name?: string;
  family?: string;
  rarity: Species['rarity'];
  inatId?: number;
}

/** Kenyan fish documented in Coastal Fishes of the WIO but missing from iNaturalist's Kenya data. */
async function addBookSpecies(drafts: Draft[], bySci: Map<string, Draft>) {
  const file = 'src/lib/data/book-species.json';
  if (!existsSync(file)) return;
  const list: BookSpecies[] = JSON.parse(readFileSync(file, 'utf8'));
  const byInatId = new Map(drafts.filter((d) => d.inatId).map((d) => [d.inatId!, d]));
  const fresh = list.filter((b) => !bySci.has(binomial(b.scientificName)) && !(b.inatId && byInatId.has(b.inatId)));
  console.log(`Field guide: ${fresh.length} Kenyan fish not in iNaturalist's Kenya data — fetching details…`);

  const details = new Map<number, any>();
  for (const ids of chunk(
    fresh.filter((b) => b.inatId).map((b) => b.inatId!),
    30
  )) {
    const res = await inat(`taxa/${ids.join(',')}`, { locale: 'en' });
    for (const t of res.results) details.set(t.id, t);
  }

  for (const b of fresh) {
    const t = b.inatId ? details.get(b.inatId) : undefined;
    const photos = t ? photosOf(t) : [];
    const d: Draft = {
      id: b.id,
      category: 'fish',
      name:
        NAME_OVERRIDES[b.scientificName] ??
        capitalise(t?.preferred_common_name ?? b.name ?? b.scientificName),
      scientificName: b.scientificName,
      rarity: b.rarity,
      conservation: t ? conservationOf(t) : 'NE',
      group: (t && (ancestorName(t, 'order') ?? ancestorName(t, 'class'))) ?? b.family,
      inatId: t?.id,
      photo: photos[0],
      fromBook: true,
      _summary: stripHtml(t?.wikipedia_summary) || undefined,
      _gallery: photos.length > 1 ? photos.slice(1) : undefined
    };
    drafts.push(d);
    bySci.set(binomial(d.scientificName), d);
  }
}

// ---------------------------------------------------------------------------
// eBird

async function enrichFromEbird(drafts: Draft[], bySci: Map<string, Draft>) {
  console.log('\neBird: Kenya checklist, taxonomy and hotspots…');
  const codes: string[] = await ebird(`product/spplist/${KENYA_REGION}`);
  const taxonomy: any[] = await ebird('ref/taxonomy/ebird?fmt=json&cat=species&locale=en');
  const tax = new Map(taxonomy.map((t) => [t.speciesCode, t]));
  const hotspots: any[] = (await ebird(`ref/hotspot/${KENYA_REGION}?fmt=json`))
    .filter((h: any) => h.numSpeciesAllTime)
    .sort((a: any, b: any) => b.numSpeciesAllTime - a.numSpeciesAllTime)
    .slice(0, HOTSPOT_SAMPLE);

  // Species code -> hotspots (richest first) where it has been recorded.
  const seenAt = new Map<string, string[]>();
  for (const h of hotspots) {
    const list: string[] = await ebird(`product/spplist/${h.locId}`);
    for (const code of list) {
      const arr = seenAt.get(code) ?? [];
      arr.push(h.locName.replace(/\s*--\s*/g, ' – '));
      seenAt.set(code, arr);
    }
    process.stdout.write('.');
  }
  process.stdout.write('\n');

  // Birds iNaturalist lists as introduced in Kenya stay out of the catalogue.
  const introduced = new Set(
    (await speciesCounts(3, { introduced: true })).map((c) => binomial(c.taxon.name))
  );

  const added: Draft[] = [];
  for (const code of codes) {
    const t = tax.get(code);
    if (!t || introduced.has(binomial(t.sciName))) continue;
    let d = bySci.get(binomial(t.sciName));
    if (!d) {
      d = {
        id: slug(t.sciName),
        category: 'birds',
        name: t.comName,
        scientificName: t.sciName,
        rarity: 'Very Rare',
        conservation: 'NE'
      };
      added.push(d);
      drafts.push(d);
      bySci.set(binomial(t.sciName), d);
    }
    d.ebirdCode = code;
    d.group = t.familyComName ?? d.group;
    const spots = seenAt.get(code) ?? [];
    if (spots.length) d.whereToSee = spots.slice(0, 4);
  }

  // Look up photos, summaries and IUCN status on iNaturalist for eBird-only birds.
  if (added.length) console.log(`eBird: ${added.length} Kenyan birds not on iNaturalist — fetching details…`);
  for (const d of added) {
    try {
      const res = await inat('taxa', { q: d.scientificName, rank: 'species', per_page: 1, locale: 'en' });
      const hit = res.results?.[0];
      if (hit && binomial(hit.name) === binomial(d.scientificName)) {
        const full = (await inat(`taxa/${hit.id}`, { locale: 'en' })).results?.[0] ?? hit;
        d.inatId = full.id;
        const photos = photosOf(full);
        d.photo = photos[0];
        d._gallery = photos.length > 1 ? photos.slice(1) : undefined;
        d.conservation = conservationOf(full);
        d._summary = stripHtml(full.wikipedia_summary) || undefined;
      }
    } catch (err) {
      console.warn(`  ✗ ${d.scientificName}: ${(err as Error).message}`);
    }
  }

  // Bird rarity from the share of sampled hotspots that have recorded the species.
  const birds = drafts.filter((d) => d.category === 'birds');
  for (const d of birds) {
    if (!d.ebirdCode) continue; // keep the iNaturalist-based rarity
    const share = (seenAt.get(d.ebirdCode)?.length ?? 0) / hotspots.length;
    d.rarity = share >= 0.5 ? 'Common' : share >= 0.2 ? 'Uncommon' : share >= 0.05 ? 'Rare' : 'Very Rare';
  }
  console.log(`eBird: ${codes.length} species on the Kenya checklist; ${hotspots.length} hotspots sampled.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
