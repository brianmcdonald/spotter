<script lang="ts">
  import type { Species } from '../types';
  import { imageFor } from '../meta';
  import Icon from './Icon.svelte';

  let { species, eager = false }: { species: Species; eager?: boolean } = $props();

  const img = $derived(imageFor(species));
  let failed = $state(false);
  const icon = $derived(species.category === 'fish' ? 'fish' : species.category === 'birds' ? 'bird' : 'paw');
</script>

{#if img && !failed}
  <img
    src={img.src}
    alt={species.name}
    width={img.width}
    height={img.height}
    loading={eager ? 'eager' : 'lazy'}
    decoding="async"
    onerror={() => (failed = true)}
  />
{:else}
  <div class="placeholder" aria-label="No photo available">
    <Icon name={icon} size={40} />
  </div>
{/if}

<style>
  /* Fills the nearest positioned ancestor, which sets the aspect ratio. */
  img,
  .placeholder {
    position: absolute;
    inset: 0;
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  .placeholder {
    display: grid;
    place-items: center;
    background: var(--surface-2);
    color: var(--text-muted);
  }
</style>
