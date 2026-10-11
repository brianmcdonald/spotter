/**
 * Downloads a photo for every hand-curated species from Wikipedia/Wikimedia Commons into
 * public/images and records attribution in src/lib/data/images.json.
 *
 * Bundling images locally keeps the app fully usable offline (important once
 * it is wrapped as an iPhone app). Re-run after adding species:
 *   npm run images            # only fetches missing images
 *   npm run images -- --force # re-fetch everything
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { writeFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { curated as allSpecies } from '../src/lib/data/curated.ts';
import type { Species, SpeciesImage } from '../src/lib/types.ts';

const OUT_DIR = 'public/images';
const MANIFEST = 'src/lib/data/images.json';
// Wikimedia serves a fixed set of pre-rendered thumbnail widths; others are throttled.
const WIDTH = 960;
const UA = 'KenyaSpotter/0.1 (offline image bundler; contact via project repository)';
const force = process.argv.includes('--force');

mkdirSync(OUT_DIR, { recursive: true });
const manifest: Record<string, SpeciesImage> = existsSync(MANIFEST)
  ? JSON.parse(readFileSync(MANIFEST, 'utf8'))
  : {};

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const stripHtml = (s = '') => s.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
const chunk = <T>(arr: T[], n: number) =>
  Array.from({ length: Math.ceil(arr.length / n) }, (_, i) => arr.slice(i * n, i * n + n));

/** fetch() with retry + backoff on 429/5xx. */
async function get(url: string | URL, attempt = 0): Promise<Response> {
  const res = await fetch(url, { headers: { 'User-Agent': UA } });
  if ((res.status === 429 || res.status >= 500) && attempt < 6) {
    const wait = Number(res.headers.get('retry-after')) * 1000 || 2000 * 2 ** attempt;
    console.log(`  … ${res.status}, retrying in ${Math.round(wait / 1000)}s`);
    await sleep(wait);
    return get(url, attempt + 1);
  }
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return res;
}

async function api(params: Record<string, string>) {
  const url = new URL('https://en.wikipedia.org/w/api.php');
  url.search = new URLSearchParams({ format: 'json', formatversion: '2', ...params }).toString();
  return (await get(url)).json();
}

/** Resolves titles through redirects/normalisation back to the original title. */
function titleMap(query: any): Map<string, string> {
  const m = new Map<string, string>();
  for (const n of query.normalized ?? []) m.set(n.to, n.from);
  for (const r of query.redirects ?? []) m.set(r.to, m.get(r.from) ?? r.from);
  return m;
}

const todo = allSpecies.filter((s) => s.wiki && (force || !manifest[s.id] || !existsSync(`${OUT_DIR}/${s.id}.jpg`)));
console.log(`Fetching images for ${todo.length} species…`);

// 1. Article title -> lead image file name (batched, 50 titles per request).
const fileFor = new Map<Species, string>();
for (const batch of chunk(todo, 50)) {
  const res = await api({
    action: 'query',
    prop: 'pageimages',
    piprop: 'name',
    redirects: '1',
    titles: batch.map((s) => s.wiki).join('|')
  });
  const back = titleMap(res.query);
  for (const p of res.query.pages) {
    const original = back.get(p.title) ?? p.title;
    const s = batch.find((x) => x.wiki === original);
    if (s && p.pageimage) fileFor.set(s, p.pageimage);
  }
}

// 2. File name -> thumbnail URL + licence metadata (batched).
const infoFor = new Map<string, any>();
for (const batch of chunk([...new Set(fileFor.values())], 50)) {
  const res = await api({
    action: 'query',
    prop: 'imageinfo',
    iiprop: 'url|extmetadata',
    iiurlwidth: String(WIDTH),
    titles: batch.map((f) => `File:${f}`).join('|')
  });
  const back = titleMap(res.query);
  for (const p of res.query.pages) {
    const title = back.get(p.title) ?? p.title;
    if (p.imageinfo?.[0]) infoFor.set(title.replace(/^File:/, '').replace(/_/g, ' '), p.imageinfo[0]);
  }
}

/**
 * On macOS, re-encode as a compact JPEG (max 800px, q60) with the built-in
 * `sips` tool to keep the app bundle small. Elsewhere the file is kept as-is.
 */
function shrink(file: string): { width: number; height: number } | undefined {
  if (process.platform !== 'darwin') return;
  execFileSync('sips', ['-s', 'format', 'jpeg', '-s', 'formatOptions', '60', '-Z', '800', file, '--out', file], {
    stdio: 'ignore'
  });
  const info = execFileSync('sips', ['-g', 'pixelWidth', '-g', 'pixelHeight', file], { encoding: 'utf8' });
  return {
    width: Number(/pixelWidth: (\d+)/.exec(info)?.[1]),
    height: Number(/pixelHeight: (\d+)/.exec(info)?.[1])
  };
}

// 3. Download thumbnails one at a time.
for (const s of todo) {
  const fileName = fileFor.get(s);
  const ii = fileName && infoFor.get(fileName.replace(/_/g, ' '));
  if (!ii) {
    console.warn(`✗ ${s.id}: no lead image for "${s.wiki}"`);
    continue;
  }
  const meta = ii.extmetadata ?? {};
  const license = stripHtml(meta.LicenseShortName?.value);
  if (/fair use|non-free/i.test(license)) {
    console.warn(`✗ ${s.id}: image not freely licensed (${license})`);
    continue;
  }
  try {
    const img = await get(ii.thumburl);
    const out = `${OUT_DIR}/${s.id}.jpg`;
    await writeFile(out, Buffer.from(await img.arrayBuffer()));
    const { width, height } = shrink(out) ?? { width: ii.thumbwidth, height: ii.thumbheight };
    manifest[s.id] = {
      src: `images/${s.id}.jpg`,
      width,
      height,
      artist: stripHtml(meta.Artist?.value) || 'Unknown',
      license: license || 'See source',
      sourceUrl: ii.descriptionurl
    };
    console.log(`✓ ${s.id}`);
    writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2) + '\n');
  } catch (err) {
    console.warn(`✗ ${s.id}: ${(err as Error).message}`);
  }
  await sleep(1000);
}

console.log(`\n${Object.keys(manifest).length}/${allSpecies.length} species have images.`);
