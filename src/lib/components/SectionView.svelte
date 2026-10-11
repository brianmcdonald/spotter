<script lang="ts">
  import type { Category } from '../types';
  import { speciesByCategory } from '../data';
  import { CATEGORY_LABEL, CONSERVATION, RARITIES } from '../meta';
  import { filters, toggle, type SortKey, type Status } from '../stores/filters.svelte';
  import { log } from '../stores/log.svelte';
  import SpeciesCard from './SpeciesCard.svelte';
  import Icon from './Icon.svelte';

  let { category }: { category: Category } = $props();

  const all = $derived(speciesByCategory[category]);
  const f = $derived(filters[category]);
  const results = $derived(f.apply(all));
  const groups = $derived(
    [...new Set(all.map((s) => s.group).filter((g): g is string => !!g))].sort((a, b) => a.localeCompare(b))
  );

  // Render in pages so sections with hundreds of species stay fast; more load on scroll.
  const PAGE = 48;
  let shown = $state(PAGE);
  let sentinel = $state<HTMLElement>();
  const visible = $derived(results.slice(0, shown));

  $effect(() => {
    // Back to the first page whenever the result set changes.
    results;
    shown = PAGE;
  });

  $effect(() => {
    if (!sentinel) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) shown += PAGE;
      },
      { rootMargin: '800px' }
    );
    io.observe(sentinel);
    return () => io.disconnect();
  });
  const spottedCount = $derived(all.filter((s) => log.isSpotted(s.id)).length);

  let showFilters = $state(false);

  const statuses: { value: Status; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'spotted', label: 'Spotted' },
    { value: 'unspotted', label: 'Not yet' }
  ];
</script>

<section>
  <div class="intro">
    <h2>{CATEGORY_LABEL[category]} of Kenya</h2>
    <p>
      <strong>{spottedCount}</strong> of {all.length} spotted
      <span class="bar"><span style:width="{(spottedCount / all.length) * 100}%"></span></span>
    </p>
  </div>

  <div class="toolbar">
    <label class="search">
      <Icon name="search" size={18} />
      <span class="visually-hidden">Search {CATEGORY_LABEL[category].toLowerCase()}</span>
      <input
        type="search"
        placeholder="Search name, family or place"
        bind:value={f.query}
        autocomplete="off"
        enterkeyhint="search"
      />
    </label>
    <button
      class="btn filter-btn"
      class:active={showFilters || f.activeCount > 0}
      aria-expanded={showFilters}
      onclick={() => (showFilters = !showFilters)}
    >
      <Icon name="filter" size={18} />
      Filters{#if f.activeCount}<span class="count">{f.activeCount}</span>{/if}
    </button>
  </div>

  <div class="status-row" role="radiogroup" aria-label="Spotted status">
    {#each statuses as s (s.value)}
      <button
        class="seg"
        role="radio"
        aria-checked={f.status === s.value}
        onclick={() => (f.status = s.value)}>{s.label}</button
      >
    {/each}
  </div>

  {#if showFilters}
    <div class="panel">
      <fieldset>
        <legend>Rarity</legend>
        <div class="chips">
          {#each RARITIES as r (r)}
            <button
              class="chip rarity-{r.replace(' ', '-')}"
              aria-pressed={f.rarities.includes(r)}
              onclick={() => (f.rarities = toggle(f.rarities, r))}>{r}</button
            >
          {/each}
        </div>
      </fieldset>

      <fieldset>
        <legend>Conservation status (IUCN)</legend>
        <div class="chips">
          {#each Object.entries(CONSERVATION) as [code, c] (code)}
            <button
              class="chip cons-{code}"
              aria-pressed={f.conservation.includes(code as never)}
              onclick={() => (f.conservation = toggle(f.conservation, code as never))}>{c.label}</button
            >
          {/each}
        </div>
      </fieldset>

      <div class="row">
        <label class="field">
          {category === 'birds' ? 'Family' : 'Group'}
          <select bind:value={f.group}>
            <option value="">All ({groups.length})</option>
            {#each groups as g (g)}<option value={g}>{g}</option>{/each}
          </select>
        </label>
        <label class="field">
          Sort by
          <select bind:value={f.sort as SortKey}>
            <option value="name">Name</option>
            <option value="observed">Most observed in Kenya</option>
            <option value="rarity">Rarest first</option>
            <option value="conservation">Most threatened first</option>
          </select>
        </label>
      </div>

      <label class="toggle">
        <input type="checkbox" bind:checked={f.endemicOnly} />
        Found only in Kenya (endemic)
      </label>

      <div class="panel-actions">
        <button class="btn small" onclick={() => f.reset()} disabled={!f.activeCount && !f.query}>Clear all</button>
        <button class="btn small primary" onclick={() => (showFilters = false)}>Show {results.length} results</button>
      </div>
    </div>
  {/if}

  {#if results.length}
    <p class="result-count">{results.length} {results.length === 1 ? 'result' : 'results'}</p>
    <div class="grid">
      {#each visible as s (s.id)}
        <SpeciesCard species={s} />
      {/each}
    </div>
    {#if shown < results.length}
      <div bind:this={sentinel} class="more">
        <button class="btn" onclick={() => (shown += PAGE)}>Show more ({results.length - shown} left)</button>
      </div>
    {/if}
  {:else}
    <div class="empty">
      <p>No {CATEGORY_LABEL[category].toLowerCase()} match your search.</p>
      <button class="btn" onclick={() => f.reset()}>Clear search & filters</button>
    </div>
  {/if}
</section>

<style>
  section {
    display: grid;
    gap: 12px;
  }
  .intro h2 {
    font-size: 24px;
  }
  .intro p {
    display: flex;
    align-items: center;
    gap: 10px;
    margin: 6px 0 0;
    color: var(--text-muted);
    font-size: 14px;
  }
  .bar {
    flex: 1;
    max-width: 200px;
    height: 6px;
    border-radius: 3px;
    background: var(--surface-2);
    overflow: hidden;
  }
  .bar span {
    display: block;
    height: 100%;
    background: var(--spotted);
    transition: width 0.3s ease;
  }
  .toolbar {
    display: flex;
    gap: 8px;
  }
  .search {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 0 12px;
    border: 1px solid var(--border);
    border-radius: 12px;
    background: var(--surface);
    color: var(--text-muted);
  }
  .search input {
    flex: 1;
    min-width: 0;
    height: 44px;
    border: 0;
    outline: 0;
    background: transparent;
    font-size: 16px;
    color: var(--text);
  }
  .search:focus-within {
    border-color: var(--brand);
  }
  .filter-btn.active {
    border-color: var(--brand);
    color: var(--brand);
  }
  .count {
    display: inline-grid;
    place-items: center;
    min-width: 20px;
    height: 20px;
    border-radius: 10px;
    background: var(--brand);
    color: var(--brand-contrast);
    font-size: 12px;
  }
  .status-row {
    display: flex;
    padding: 3px;
    border-radius: 10px;
    background: var(--surface-2);
    width: fit-content;
  }
  .seg {
    border: 0;
    background: transparent;
    padding: 6px 14px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 600;
    color: var(--text-muted);
  }
  .seg[aria-checked='true'] {
    background: var(--surface);
    color: var(--text);
    box-shadow: var(--shadow);
  }
  .panel {
    display: grid;
    gap: 14px;
    padding: 14px;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    background: var(--surface);
  }
  fieldset {
    border: 0;
    margin: 0;
    padding: 0;
  }
  legend {
    padding: 0;
    margin-bottom: 8px;
    font-size: 14px;
    font-weight: 600;
    color: var(--text-muted);
  }
  .chips {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }
  .chip {
    padding: 6px 12px;
    border-radius: 999px;
    border: 1px solid currentColor;
    background: transparent;
    font-size: 13px;
    font-weight: 600;
  }
  .chip[aria-pressed='true'] {
    background: color-mix(in srgb, currentColor 18%, transparent);
    box-shadow: inset 0 0 0 1px currentColor;
  }
  .chip[aria-pressed='true']::before {
    content: '✓ ';
  }
  .row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
  }
  .toggle {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
  }
  .toggle input {
    width: 20px;
    height: 20px;
    accent-color: var(--brand);
  }
  .panel-actions {
    display: flex;
    justify-content: space-between;
    gap: 8px;
  }
  .result-count {
    margin: 0;
    font-size: 13px;
    color: var(--text-muted);
  }
  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 12px;
  }
  .more {
    display: flex;
    justify-content: center;
    padding: 8px 0;
  }
  .empty {
    text-align: center;
    padding: 40px 0;
    color: var(--text-muted);
  }
  @media (max-width: 380px) {
    .grid {
      grid-template-columns: 1fr 1fr;
      gap: 10px;
    }
  }
</style>
