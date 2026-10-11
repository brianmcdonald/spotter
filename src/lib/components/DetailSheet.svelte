<script lang="ts">
  import type { BookEntry, BookSource, GalleryItem, Photo, Species } from '../types';
  import { CONSERVATION, fmtDate, imageFor } from '../meta';
  import { log } from '../stores/log.svelte';
  import { loadBookEntries, loadGallery, loadSummary } from '../data';
  import { router } from '../stores/router.svelte';
  import Gallery from './Gallery.svelte';
  import SourceBlock from './SourceBlock.svelte';
  import SightingForm from './SightingForm.svelte';
  import SightingItem from './SightingItem.svelte';
  import Icon from './Icon.svelte';

  let { species }: { species: Species } = $props();

  const sightings = $derived(log.bySpecies.get(species.id) ?? []);
  const img = $derived(imageFor(species));

  // Wikipedia summary, extra photos and field guide accounts all load on demand.
  let summary = $state<string | undefined>();
  let extraPhotos = $state<Photo[]>([]);
  let books = $state<(BookEntry & { book: BookSource })[]>([]);
  let loading = $state(true);
  $effect(() => {
    const id = species.id;
    summary = undefined;
    extraPhotos = [];
    books = [];
    loading = true;
    Promise.all([loadSummary(id), loadGallery(id), loadBookEntries(id)]).then(([text, photos, entries]) => {
      if (species.id !== id) return; // navigated away meanwhile
      summary = text;
      extraPhotos = photos;
      books = entries;
      loading = false;
    });
  });

  const credit = (p: Photo) => `Photo: ${p.attribution}${p.attribution.includes(p.license) ? '' : ` · ${p.license}`}`;

  const gallery = $derived<GalleryItem[]>([
    ...[img, ...extraPhotos]
      .filter((p): p is NonNullable<typeof img> => !!p)
      .map((p) => ({ src: p.src, width: p.width, height: p.height, credit: credit(p), href: p.sourceUrl })),
    ...books.flatMap((e) =>
      e.images.map((im) => ({
        src: im.src,
        width: im.width,
        height: im.height,
        caption: im.caption,
        credit: `${e.book.title} · ${e.book.authors}`,
        contain: e.source !== 'safari', // plates, fish photos and drawings: show whole
        full: im.full?.src
      }))
    )
  ]);

  const kenyaUrl = $derived(
    species.inatId ? `https://www.inaturalist.org/taxa/${species.inatId}?place_id=7042` : undefined
  );
  const ebirdUrl = $derived(species.ebirdCode ? `https://ebird.org/species/${species.ebirdCode}/KE` : undefined);
  let adding = $state(false);
  let sheet: HTMLElement;

  $effect(() => {
    // Reset when navigating between species and move focus into the dialog.
    species.id;
    adding = false;
    sheet?.focus();
  });

  function onkeydown(e: KeyboardEvent) {
    if (e.key === 'Escape' && !e.defaultPrevented) router.closeDetail();
  }
</script>

<svelte:window {onkeydown} />

<div class="backdrop" onclick={() => router.closeDetail()} aria-hidden="true"></div>

<div
  class="sheet"
  role="dialog"
  aria-modal="true"
  aria-labelledby="detail-title"
  tabindex="-1"
  bind:this={sheet}
>
  <div class="top">
    <Gallery items={gallery} alt={species.name} category={species.category} />
    <button class="close" onclick={() => router.closeDetail()} aria-label="Close">
      <Icon name="close" />
    </button>
  </div>

  <div class="content">
    <header>
      <h2 id="detail-title">{species.name}</h2>
      <p class="sci">{species.scientificName}</p>
      <div class="tags">
        <span class="badge rarity-{species.rarity.replace(' ', '-')}">{species.rarity} in Kenya</span>
        <span class="badge cons-{species.conservation}">{CONSERVATION[species.conservation].label}</span>
        {#if species.endemic}<span class="badge endemic">Endemic</span>{/if}
      </div>
    </header>

    <div class="spot-box" class:spotted={sightings.length}>
      {#if adding}
        <h3>Log a sighting</h3>
        <SightingForm
          onsubmit={(d) => {
            log.add({ ...d, speciesId: species.id });
            adding = false;
          }}
          oncancel={() => (adding = false)}
        />
      {:else}
        <div class="spot-head">
          <div>
            {#if sightings.length}
              <strong><Icon name="check" size={16} /> Spotted {sightings.length}×</strong>
              <span>Last seen {fmtDate(sightings[0].date)}</span>
            {:else}
              <strong>Not spotted yet</strong>
              <span>Seen one? Log where and when.</span>
            {/if}
          </div>
          <button class="btn primary" onclick={() => (adding = true)}>
            <Icon name={sightings.length ? 'plus' : 'eye'} size={18} />
            {sightings.length ? 'Add sighting' : 'Mark as spotted'}
          </button>
        </div>
      {/if}

      {#if sightings.length}
        <ul class="sightings">
          {#each sightings as s (s.id)}
            <li><SightingItem sighting={s} /></li>
          {/each}
        </ul>
      {/if}
    </div>

    {#if species.description}
      <p class="description">{species.description}</p>
    {/if}

    {#if species.funFact}
      <aside class="fact">
        <Icon name="star" size={18} />
        <p>{species.funFact}</p>
      </aside>
    {/if}

    <dl>
      {#if species.group}
        <dt>{species.category === 'birds' ? 'Family' : 'Group'}</dt>
        <dd>{species.group}</dd>
      {/if}
      {#if species.size}<dt>Size</dt><dd>{species.size}</dd>{/if}
      {#if species.diet}<dt>Diet</dt><dd>{species.diet}</dd>{/if}
      {#if species.habitats?.length}<dt>Habitat</dt><dd>{species.habitats.join(', ')}</dd>{/if}
      {#if species.whereToSee?.length}<dt>Where to see it</dt><dd>{species.whereToSee.join(' · ')}</dd>{/if}
      <dt>IUCN status</dt>
      <dd>{CONSERVATION[species.conservation].label} ({species.conservation})</dd>
      {#if species.fromBook}
        <dt>Kenya records</dt>
        <dd>Recorded from Kenya in <i>Coastal Fishes of the Western Indian Ocean</i>; no research-grade iNaturalist observations in Kenya yet</dd>
      {:else if species.observations != null}
        <dt>Kenya records</dt>
        <dd>{species.observations.toLocaleString()} research-grade iNaturalist observations</dd>
      {/if}
    </dl>

    <section class="about">
      <h3>Descriptions</h3>
      {#if summary}
        <SourceBlock
          title="Wikipedia"
          cite="Summary of the English Wikipedia article · CC BY-SA"
          sections={[{ heading: '', text: summary }]}
        />
      {/if}
      {#each books as e (e.source + e.ref)}
        <SourceBlock
          title={e.book.title}
          cite="{e.book.authors} · {e.book.edition} · {e.ref}{e.source === 'safari' ? '' : `, PDF p. ${e.page}`}"
          sections={e.sections}
          preview={e.source === 'safari' ? 2 : 3}
        />
      {/each}
      {#if loading}
        <p class="muted">Loading descriptions…</p>
      {:else if !summary && !books.length}
        <p class="muted">{species.description ? 'No other sources yet.' : 'No description available yet.'}</p>
      {/if}
    </section>

    {#if kenyaUrl || ebirdUrl}
      <div class="links">
        {#if kenyaUrl}<a class="btn small" href={kenyaUrl} target="_blank" rel="noopener">iNaturalist (Kenya)</a>{/if}
        {#if ebirdUrl}<a class="btn small" href={ebirdUrl} target="_blank" rel="noopener">eBird (Kenya)</a>{/if}
      </div>
    {/if}
  </div>
</div>

<style>
  .backdrop {
    position: fixed;
    inset: 0;
    background: rgb(0 0 0 / 0.45);
    z-index: 20;
    animation: fade 0.2s ease;
  }
  .sheet {
    position: fixed;
    z-index: 21;
    left: 0;
    right: 0;
    bottom: 0;
    max-height: calc(100dvh - var(--safe-top) - 24px);
    overflow-y: auto;
    overscroll-behavior: contain;
    background: var(--bg);
    border-radius: 20px 20px 0 0;
    outline: none;
    animation: slide-up 0.25s cubic-bezier(0.2, 0.9, 0.3, 1);
  }
  @media (min-width: 720px) {
    .sheet {
      left: 50%;
      right: auto;
      bottom: auto;
      top: 50%;
      width: min(640px, 92vw);
      max-height: 90dvh;
      transform: translate(-50%, -50%);
      border-radius: 20px;
      animation: fade 0.2s ease;
    }
  }
  .top {
    position: relative;
  }
  .close {
    position: absolute;
    z-index: 1;
    top: 12px;
    right: 12px;
    width: 36px;
    height: 36px;
    display: grid;
    place-items: center;
    border: 0;
    border-radius: 50%;
    background: rgb(0 0 0 / 0.55);
    color: #fff;
  }
  .content {
    display: grid;
    gap: 18px;
    padding: 18px 18px calc(24px + var(--safe-bottom));
  }
  h2 {
    font-size: 26px;
  }
  .sci {
    margin: 4px 0 10px;
    font-style: italic;
    color: var(--text-muted);
  }
  .tags {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }
  .endemic {
    color: var(--accent);
  }
  .spot-box {
    display: grid;
    gap: 12px;
    padding: 14px;
    border-radius: var(--radius);
    background: var(--surface);
    border: 1px solid var(--border);
  }
  .spot-box.spotted {
    border-color: color-mix(in srgb, var(--spotted) 50%, transparent);
  }
  .spot-box h3 {
    font-size: 17px;
  }
  .spot-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    flex-wrap: wrap;
  }
  .spot-head div {
    display: grid;
    gap: 2px;
  }
  .spot-head strong {
    display: inline-flex;
    align-items: center;
    gap: 4px;
  }
  .spotted .spot-head strong {
    color: var(--spotted);
  }
  .spot-head span {
    font-size: 13px;
    color: var(--text-muted);
  }
  .sightings {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    gap: 8px;
  }
  .description {
    margin: 0;
    line-height: 1.55;
    font-size: 16px;
  }
  .muted {
    color: var(--text-muted);
  }
  .about {
    display: grid;
    gap: 10px;
  }
  .about h3 {
    font-size: 17px;
  }
  .about .muted {
    margin: 0;
    font-size: 14px;
  }
  .links {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
  .links a {
    text-decoration: none;
    color: var(--brand);
  }
  .fact {
    display: flex;
    gap: 10px;
    padding: 12px 14px;
    border-radius: var(--radius);
    background: color-mix(in srgb, var(--accent) 14%, var(--surface));
    color: var(--text);
  }
  .fact :global(svg) {
    flex-shrink: 0;
    color: var(--accent);
    margin-top: 2px;
  }
  .fact p {
    margin: 0;
    line-height: 1.45;
  }
  dl {
    display: grid;
    grid-template-columns: max-content 1fr;
    gap: 8px 16px;
    margin: 0;
    font-size: 15px;
  }
  dt {
    color: var(--text-muted);
    font-weight: 600;
  }
  dd {
    margin: 0;
  }
  @keyframes fade {
    from {
      opacity: 0;
    }
  }
  @keyframes slide-up {
    from {
      transform: translateY(100%);
    }
  }
</style>
