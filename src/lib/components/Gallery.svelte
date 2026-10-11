<script lang="ts">
  import type { Category, GalleryItem } from '../types';
  import { portal } from '../portal';
  import Icon from './Icon.svelte';

  let { items, alt, category }: { items: GalleryItem[]; alt: string; category: Category } = $props();

  let track = $state<HTMLDivElement>();
  let index = $state(0);
  let failed = $state<Record<string, boolean>>({});
  let viewing = $state<number | null>(null);
  let zoomed = $state(false);

  const shown = $derived(items.filter((i) => !failed[i.src]));
  const current = $derived(shown[Math.min(index, shown.length - 1)]);
  const icon = $derived(category === 'fish' ? 'fish' : category === 'birds' ? 'bird' : 'paw');

  function onscroll() {
    if (track) index = Math.round(track.scrollLeft / track.clientWidth);
  }

  function go(i: number) {
    track?.scrollTo({ left: i * track.clientWidth, behavior: 'smooth' });
  }

  function open(i: number) {
    viewing = i;
    zoomed = false;
  }

  function step(d: number) {
    if (viewing == null) return;
    viewing = (viewing + d + shown.length) % shown.length;
    zoomed = false;
  }

  // While the viewer is open it owns the keyboard (Escape must not close the detail sheet too).
  $effect(() => {
    if (viewing == null) return;
    const onkey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') viewing = null;
      else if (e.key === 'ArrowLeft') step(-1);
      else if (e.key === 'ArrowRight') step(1);
      else return;
      e.preventDefault();
      e.stopPropagation();
    };
    window.addEventListener('keydown', onkey, true);
    return () => window.removeEventListener('keydown', onkey, true);
  });
</script>

<div class="hero">
  {#if shown.length}
    <div class="track" bind:this={track} {onscroll}>
      {#each shown as item, i (item.src)}
        <button class="slide" class:contain={item.contain} onclick={() => open(i)} aria-label="View picture {i + 1} larger">
          <img
            src={item.src}
            alt={item.caption ?? alt}
            width={item.width}
            height={item.height}
            loading={i === 0 ? 'eager' : 'lazy'}
            decoding="async"
            onerror={() => (failed[item.src] = true)}
          />
        </button>
      {/each}
    </div>
    {#if shown.length > 1}
      <span class="count">{index + 1} / {shown.length}</span>
      <button class="nav prev" onclick={() => go(index - 1)} disabled={index === 0} aria-label="Previous picture">
        <Icon name="left" />
      </button>
      <button
        class="nav next"
        onclick={() => go(index + 1)}
        disabled={index >= shown.length - 1}
        aria-label="Next picture"><Icon name="right" /></button
      >
    {/if}
  {:else}
    <div class="placeholder" aria-label="No photo available"><Icon name={icon} size={48} /></div>
  {/if}
</div>

{#if current}
  <p class="credit">
    {#if current.caption}<span class="caption">{current.caption}</span>{/if}
    <span>
      {current.credit}{#if current.href}{' · '}<a href={current.href} target="_blank" rel="noopener">Source</a>{/if}
    </span>
  </p>
{/if}

{#if viewing != null && shown[viewing]}
  {@const item = shown[viewing]}
  <div class="viewer" use:portal role="dialog" aria-modal="true" aria-label="Picture viewer">
    <div class="stage" class:zoomed>
      <button class="zoom" onclick={() => (zoomed = !zoomed)} aria-label={zoomed ? 'Fit to screen' : 'Zoom in'}>
        <img src={item.full ?? item.src} alt={item.caption ?? alt} class:light={item.contain} />
      </button>
    </div>
    <div class="bar">
      <span>{item.caption ?? alt}{shown.length > 1 ? ` · ${viewing + 1}/${shown.length}` : ''}</span>
      <div>
        {#if shown.length > 1}
          <button onclick={() => step(-1)} aria-label="Previous picture"><Icon name="left" /></button>
          <button onclick={() => step(1)} aria-label="Next picture"><Icon name="right" /></button>
        {/if}
        <button onclick={() => (zoomed = !zoomed)} aria-label={zoomed ? 'Fit to screen' : 'Zoom in'}>
          <Icon name="expand" />
        </button>
        <button onclick={() => (viewing = null)} aria-label="Close viewer"><Icon name="close" /></button>
      </div>
    </div>
  </div>
{/if}

<style>
  .hero {
    position: relative;
    aspect-ratio: 16 / 10;
    overflow: hidden;
    background: var(--surface-2);
  }
  .track {
    display: flex;
    height: 100%;
    overflow-x: auto;
    scroll-snap-type: x mandatory;
    scrollbar-width: none;
    overscroll-behavior-x: contain;
  }
  .track::-webkit-scrollbar {
    display: none;
  }
  .slide {
    flex: 0 0 100%;
    position: relative;
    scroll-snap-align: start;
    border: 0;
    padding: 0;
    background: none;
    cursor: zoom-in;
  }
  .slide img,
  .placeholder {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  /* Plates and illustrations: show the whole picture on paper white. */
  .slide.contain {
    background: #f7f5ef;
  }
  .slide.contain img {
    object-fit: contain;
  }
  .placeholder {
    display: grid;
    place-items: center;
    color: var(--text-muted);
  }
  .count {
    position: absolute;
    left: 12px;
    bottom: 12px;
    padding: 2px 8px;
    border-radius: 999px;
    background: rgb(0 0 0 / 0.55);
    color: #fff;
    font-size: 12px;
    font-weight: 600;
    pointer-events: none;
  }
  .nav {
    position: absolute;
    top: 50%;
    width: 36px;
    height: 36px;
    margin-top: -18px;
    display: grid;
    place-items: center;
    border: 0;
    border-radius: 50%;
    background: rgb(0 0 0 / 0.45);
    color: #fff;
  }
  .nav:disabled {
    display: none;
  }
  .prev {
    left: 10px;
  }
  .next {
    right: 10px;
  }
  @media (hover: none) {
    .nav {
      display: none;
    }
  }
  .credit {
    display: grid;
    gap: 2px;
    margin: 0;
    padding: 8px 18px 0;
    font-size: 12px;
    color: var(--text-muted);
  }
  .caption {
    color: var(--text);
    font-size: 13px;
  }
  .viewer {
    position: fixed;
    inset: 0;
    z-index: 40;
    display: grid;
    grid-template-rows: 1fr auto;
    background: #000;
    color: #fff;
  }
  .stage {
    overflow: auto;
    display: grid;
    place-items: center;
    min-height: 0;
  }
  .zoom {
    border: 0;
    padding: 0;
    background: none;
    line-height: 0;
  }
  .stage img {
    max-width: 100vw;
    max-height: calc(100dvh - 64px - var(--safe-bottom));
    object-fit: contain;
    cursor: zoom-in;
  }
  .stage img.light {
    background: #f7f5ef;
  }
  .stage.zoomed {
    place-items: start;
  }
  .stage.zoomed img {
    max-width: none;
    max-height: none;
    width: 200vw;
    cursor: zoom-out;
  }
  @media (min-width: 900px) {
    .stage.zoomed img {
      width: auto;
    }
  }
  .bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 10px 12px calc(10px + var(--safe-bottom));
    font-size: 13px;
  }
  .bar div {
    display: flex;
    gap: 4px;
    flex-shrink: 0;
  }
  .bar button {
    width: 40px;
    height: 40px;
    display: grid;
    place-items: center;
    border: 0;
    border-radius: 50%;
    background: rgb(255 255 255 / 0.15);
    color: #fff;
  }
</style>
