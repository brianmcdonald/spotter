<script lang="ts">
  import type { Category, Sighting } from '../types';
  import { speciesByCategory, speciesById } from '../data';
  import { CATEGORY_LABEL, fmtDate } from '../meta';
  import { log } from '../stores/log.svelte';
  import { router } from '../stores/router.svelte';
  import { exportCsv, exportJson, readJsonFile } from '../export';
  import SightingItem from './SightingItem.svelte';
  import SpeciesImage from './SpeciesImage.svelte';
  import Icon from './Icon.svelte';

  const categories: Category[] = ['fish', 'birds', 'animals'];

  const stats = $derived(
    categories.map((c) => ({
      category: c,
      total: speciesByCategory[c].length,
      spotted: speciesByCategory[c].filter((s) => log.isSpotted(s.id)).length
    }))
  );

  let filter = $state<Category | 'all'>('all');

  const sorted = $derived(
    [...log.sightings]
      .filter((s) => filter === 'all' || speciesById.get(s.speciesId)?.category === filter)
      .sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt))
  );

  /** Sightings grouped by month for a readable timeline. */
  const groups = $derived.by(() => {
    const out: { label: string; items: Sighting[] }[] = [];
    for (const s of sorted) {
      const label = fmtDate(s.date, { month: 'long', year: 'numeric' });
      const last = out.at(-1);
      if (last?.label === label) last.items.push(s);
      else out.push({ label, items: [s] });
    }
    return out;
  });

  let fileInput: HTMLInputElement;
  let importMode = $state<'merge' | 'replace'>('merge');
  let message = $state<{ kind: 'ok' | 'error'; text: string } | null>(null);

  async function onFile(e: Event) {
    const file = (e.currentTarget as HTMLInputElement).files?.[0];
    (e.currentTarget as HTMLInputElement).value = '';
    if (!file) return;
    try {
      const data = await readJsonFile(file);
      if (importMode === 'replace' && log.sightings.length && !confirm('Replace your entire log with this file?')) return;
      const { added, skipped } = log.import(data, importMode);
      message = {
        kind: 'ok',
        text: `Imported ${added} sighting${added === 1 ? '' : 's'}${skipped ? ` (${skipped} skipped as duplicates or invalid)` : ''}.`
      };
    } catch (err) {
      message = { kind: 'error', text: (err as Error).message };
    }
  }

  function clearAll() {
    if (confirm(`Delete all ${log.sightings.length} sightings? Consider exporting first — this can't be undone.`)) {
      log.clear();
    }
  }
</script>

<section>
  <h2>My Spotting Log</h2>

  <div class="stats">
    {#each stats as s (s.category)}
      <button class="stat" onclick={() => router.go(s.category)}>
        <span class="num">{s.spotted}<small>/{s.total}</small></span>
        <span class="label">{CATEGORY_LABEL[s.category]}</span>
        <span class="bar"><span style:width="{(s.spotted / s.total) * 100}%"></span></span>
      </button>
    {/each}
  </div>

  <div class="card">
    <h3>Backup & share</h3>
    <p class="hint">Your log is stored on this device. Export it to keep a backup or move it to another device.</p>
    <div class="buttons">
      <button class="btn primary" onclick={() => exportJson(log.toExport())} disabled={!log.sightings.length}>
        <Icon name="download" size={18} /> Export log (JSON)
      </button>
      <button class="btn" onclick={() => exportCsv(log.toExport())} disabled={!log.sightings.length}>
        <Icon name="download" size={18} /> Export CSV
      </button>
    </div>
    <div class="import">
      <div class="seg-group" role="radiogroup" aria-label="Import mode">
        <label><input type="radio" bind:group={importMode} value="merge" /> Merge with my log</label>
        <label><input type="radio" bind:group={importMode} value="replace" /> Replace my log</label>
      </div>
      <button class="btn" onclick={() => fileInput.click()}>
        <Icon name="upload" size={18} /> Import log…
      </button>
      <input bind:this={fileInput} type="file" accept="application/json,.json" onchange={onFile} hidden />
    </div>
    {#if message}
      <p class="message {message.kind}" role="status">{message.text}</p>
    {/if}
  </div>

  <div class="list-head">
    <h3>Sightings <span class="muted">({log.sightings.length})</span></h3>
    <select bind:value={filter} aria-label="Filter sightings by category">
      <option value="all">All</option>
      {#each categories as c (c)}<option value={c}>{CATEGORY_LABEL[c]}</option>{/each}
    </select>
  </div>

  {#if groups.length}
    {#each groups as g (g.label)}
      <h4>{g.label}</h4>
      <ul>
        {#each g.items as s (s.id)}
          {@const sp = speciesById.get(s.speciesId)!}
          <li class="entry">
            <button class="thumb" onclick={() => router.go(sp.category, sp.id)} aria-label="Open {sp.name}">
              <SpeciesImage species={sp} />
            </button>
            <SightingItem sighting={s} showSpecies={sp.name} />
          </li>
        {/each}
      </ul>
    {/each}
    <button class="btn danger small clear" onclick={clearAll}><Icon name="trash" size={16} /> Delete all sightings</button>
  {:else}
    <div class="empty">
      <p>No sightings yet.</p>
      <p class="muted">Open any fish, bird or animal and tap <strong>Mark as spotted</strong>.</p>
    </div>
  {/if}
</section>

<style>
  section {
    display: grid;
    gap: 14px;
  }
  h2 {
    font-size: 24px;
  }
  h3 {
    font-size: 17px;
  }
  h4 {
    margin: 4px 0 -4px;
    font-size: 13px;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: var(--text-muted);
  }
  .muted {
    color: var(--text-muted);
    font-weight: 400;
  }
  .stats {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
  }
  .stat {
    display: grid;
    gap: 4px;
    padding: 12px;
    border-radius: var(--radius);
    border: 1px solid var(--border);
    background: var(--surface);
    text-align: left;
  }
  .num {
    font-size: 26px;
    font-weight: 700;
    font-variant-numeric: tabular-nums;
  }
  .num small {
    font-size: 14px;
    color: var(--text-muted);
    font-weight: 500;
  }
  .label {
    font-size: 13px;
    color: var(--text-muted);
  }
  .bar {
    height: 5px;
    border-radius: 3px;
    background: var(--surface-2);
    overflow: hidden;
  }
  .bar span {
    display: block;
    height: 100%;
    background: var(--spotted);
  }
  .card {
    display: grid;
    gap: 10px;
    padding: 14px;
    border-radius: var(--radius);
    border: 1px solid var(--border);
    background: var(--surface);
  }
  .hint {
    margin: 0;
    font-size: 14px;
    color: var(--text-muted);
  }
  .buttons,
  .import {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    align-items: center;
  }
  .import {
    justify-content: space-between;
    padding-top: 10px;
    border-top: 1px solid var(--border);
  }
  .seg-group {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    font-size: 14px;
  }
  .seg-group label {
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }
  .seg-group input {
    accent-color: var(--brand);
  }
  .message {
    margin: 0;
    font-size: 14px;
  }
  .message.ok {
    color: var(--spotted);
  }
  .message.error {
    color: var(--danger);
  }
  .list-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 6px;
  }
  .list-head select {
    padding: 6px 10px;
    border-radius: 8px;
    border: 1px solid var(--border);
    background: var(--surface);
    font-size: 15px;
  }
  ul {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    gap: 8px;
  }
  .entry {
    display: flex;
    gap: 10px;
    align-items: flex-start;
  }
  .entry > :global(.item) {
    flex: 1;
    min-width: 0;
  }
  .thumb {
    position: relative;
    flex-shrink: 0;
    width: 56px;
    height: 56px;
    padding: 0;
    border: 0;
    border-radius: 10px;
    overflow: hidden;
    background: var(--surface-2);
  }
  .empty {
    text-align: center;
    padding: 30px 0;
  }
  .empty p {
    margin: 4px 0;
  }
  .clear {
    justify-self: center;
    margin-top: 8px;
  }
</style>
