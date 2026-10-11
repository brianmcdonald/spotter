<script lang="ts">
  import type { Species } from '../types';
  import { log } from '../stores/log.svelte';
  import { router } from '../stores/router.svelte';
  import SpeciesImage from './SpeciesImage.svelte';
  import Icon from './Icon.svelte';

  let { species }: { species: Species } = $props();

  const count = $derived(log.bySpecies.get(species.id)?.length ?? 0);
</script>

<button class="card" onclick={() => router.go(species.category, species.id)}>
  <div class="photo">
    <SpeciesImage {species} />
    {#if count}
      <span class="spotted" title="Spotted {count}×">
        <Icon name="check" size={14} />
        {count > 1 ? count : ''}
      </span>
    {/if}
  </div>
  <div class="body">
    <h3>{species.name}</h3>
    <p class="sci">{species.scientificName}</p>
    <div class="tags">
      <span class="badge rarity-{species.rarity.replace(' ', '-')}">{species.rarity}</span>
      <span class="badge cons-{species.conservation}" title="IUCN status">{species.conservation}</span>
      {#if species.endemic}<span class="badge endemic">Endemic</span>{/if}
    </div>
  </div>
</button>

<style>
  .card {
    display: flex;
    flex-direction: column;
    padding: 0;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    background: var(--surface);
    box-shadow: var(--shadow);
    overflow: hidden;
    text-align: left;
    transition: transform 0.12s ease;
  }
  .card:active {
    transform: scale(0.98);
  }
  .photo {
    position: relative;
    aspect-ratio: 4 / 3;
    overflow: hidden;
    background: var(--surface-2);
  }
  .spotted {
    position: absolute;
    z-index: 1;
    top: 8px;
    right: 8px;
    display: inline-flex;
    align-items: center;
    gap: 2px;
    min-width: 26px;
    height: 26px;
    padding: 0 6px;
    justify-content: center;
    border-radius: 999px;
    background: var(--spotted);
    color: #fff;
    font-size: 12px;
    font-weight: 700;
    box-shadow: 0 1px 4px rgb(0 0 0 / 0.3);
  }
  .body {
    padding: 10px 12px 12px;
    display: grid;
    gap: 4px;
  }
  h3 {
    font-size: 15px;
  }
  .sci {
    margin: 0;
    font-size: 13px;
    font-style: italic;
    color: var(--text-muted);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .tags {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    margin-top: 4px;
  }
  .endemic {
    color: var(--accent);
  }
</style>
