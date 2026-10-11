<script lang="ts">
  import type { Sighting } from '../types';
  import { log } from '../stores/log.svelte';
  import { fmtDate } from '../meta';
  import SightingForm from './SightingForm.svelte';
  import Icon from './Icon.svelte';

  let { sighting, showSpecies }: { sighting: Sighting; showSpecies?: string } = $props();

  let editing = $state(false);

  function remove() {
    if (confirm('Delete this sighting?')) log.remove(sighting.id);
  }
</script>

<div class="item">
  {#if editing}
    <SightingForm
      initial={sighting}
      submitLabel="Update"
      onsubmit={(d) => {
        log.update(sighting.id, d);
        editing = false;
      }}
      oncancel={() => (editing = false)}
    />
  {:else}
    <div class="row">
      <Icon name="pin" size={18} />
      <div class="info">
        {#if showSpecies}<strong class="species">{showSpecies}</strong>{/if}
        <span class="place">{sighting.locationName}</span>
        <span class="meta">
          {fmtDate(sighting.date)}
          {#if sighting.lat != null && sighting.lng != null}
            ·
            <a
              href="https://www.openstreetmap.org/?mlat={sighting.lat}&mlon={sighting.lng}#map=13/{sighting.lat}/{sighting.lng}"
              target="_blank"
              rel="noopener">Map</a
            >
          {/if}
        </span>
        {#if sighting.notes}<p class="notes">{sighting.notes}</p>{/if}
      </div>
      <div class="actions">
        <button onclick={() => (editing = true)} aria-label="Edit sighting"><Icon name="edit" size={16} /></button>
        <button onclick={remove} aria-label="Delete sighting"><Icon name="trash" size={16} /></button>
      </div>
    </div>
  {/if}
</div>

<style>
  .item {
    padding: 10px 12px;
    border-radius: 10px;
    background: var(--surface-2);
  }
  .row {
    display: flex;
    gap: 10px;
    align-items: flex-start;
  }
  .row > :global(svg) {
    flex-shrink: 0;
    margin-top: 2px;
    color: var(--spotted);
  }
  .info {
    flex: 1;
    min-width: 0;
    display: grid;
    gap: 2px;
  }
  .species {
    font-size: 15px;
  }
  .place {
    font-weight: 600;
    font-size: 14px;
    overflow-wrap: anywhere;
  }
  .species + .place {
    font-weight: 400;
  }
  .meta {
    font-size: 13px;
    color: var(--text-muted);
  }
  .notes {
    margin: 4px 0 0;
    font-size: 14px;
    white-space: pre-wrap;
  }
  .actions {
    display: flex;
    gap: 2px;
  }
  .actions button {
    display: grid;
    place-items: center;
    width: 34px;
    height: 34px;
    border: 0;
    border-radius: 8px;
    background: transparent;
    color: var(--text-muted);
  }
  .actions button:hover {
    background: var(--surface);
  }
</style>
