<script lang="ts">
  import { router, type Tab } from './lib/stores/router.svelte';
  import { speciesById } from './lib/data';
  import { log } from './lib/stores/log.svelte';
  import SectionView from './lib/components/SectionView.svelte';
  import LogView from './lib/components/LogView.svelte';
  import DetailSheet from './lib/components/DetailSheet.svelte';
  import Icon from './lib/components/Icon.svelte';

  const tabs: { id: Tab; label: string; icon: 'fish' | 'bird' | 'paw' | 'book' }[] = [
    { id: 'fish', label: 'Fish', icon: 'fish' },
    { id: 'birds', label: 'Birds', icon: 'bird' },
    { id: 'animals', label: 'Animals', icon: 'paw' },
    { id: 'log', label: 'My Log', icon: 'book' }
  ];

  const detail = $derived(router.speciesId ? speciesById.get(router.speciesId) : undefined);

  // Scroll to top when switching sections.
  $effect(() => {
    router.tab;
    window.scrollTo({ top: 0 });
  });

  // Lock background scroll while the detail sheet is open.
  $effect(() => {
    document.documentElement.style.overflow = detail ? 'hidden' : '';
  });
</script>

<header class="app-header">
  <div class="inner">
    <h1>
      <svg viewBox="0 0 64 64" width="26" height="26" aria-hidden="true"
        ><circle cx="32" cy="32" r="14" fill="none" stroke="currentColor" stroke-width="6" /><circle
          cx="32"
          cy="32"
          r="4"
          fill="currentColor"
        /></svg
      >
      Kenya Spotter
    </h1>
    <span class="total">{log.bySpecies.size} species spotted</span>
  </div>
</header>

<main>
  {#key router.tab}
    {#if router.tab === 'log'}
      <LogView />
    {:else}
      <SectionView category={router.tab} />
    {/if}
  {/key}
</main>

<nav class="tabbar" aria-label="Sections">
  {#each tabs as t (t.id)}
    <button
      class:active={router.tab === t.id}
      aria-current={router.tab === t.id ? 'page' : undefined}
      onclick={() => router.go(t.id)}
    >
      <Icon name={t.icon} size={24} />
      <span>{t.label}</span>
    </button>
  {/each}
</nav>

{#if detail}
  <DetailSheet species={detail} />
{/if}

<style>
  .app-header {
    position: sticky;
    top: 0;
    z-index: 10;
    padding-top: var(--safe-top);
    background: var(--header-bg);
    color: var(--header-text);
  }
  .inner {
    max-width: 1100px;
    margin: 0 auto;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px;
  }
  h1 {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 20px;
    letter-spacing: -0.01em;
  }
  h1 svg {
    color: var(--accent);
  }
  .total {
    font-size: 13px;
    opacity: 0.85;
  }
  main {
    max-width: 1100px;
    margin: 0 auto;
    padding: 16px 16px calc(var(--tabbar-h) + var(--safe-bottom) + 24px);
  }
  .tabbar {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 10;
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    height: calc(var(--tabbar-h) + var(--safe-bottom));
    padding-bottom: var(--safe-bottom);
    background: color-mix(in srgb, var(--surface) 88%, transparent);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border-top: 1px solid var(--border);
  }
  .tabbar button {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 2px;
    border: 0;
    background: none;
    color: var(--text-muted);
    font-size: 11px;
    font-weight: 600;
  }
  .tabbar button.active {
    color: var(--brand);
  }
</style>
