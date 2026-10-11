<script lang="ts">
  import { onMount } from 'svelte';
  import type { Map as LMap, Marker } from 'leaflet';
  import { KENYA_CENTER, round, searchPlaces, type Place } from '../geo';
  import Icon from './Icon.svelte';

  let {
    lat,
    lng,
    onpick
  }: {
    lat?: number;
    lng?: number;
    /** Called when the user chooses a point. `name` is set when picked from search results. */
    onpick: (lat: number, lng: number, name?: string) => void;
  } = $props();

  let container: HTMLDivElement;
  let map: LMap | undefined;
  let marker: Marker | undefined;
  let L: typeof import('leaflet') | undefined;
  let pinIcon: import('leaflet').DivIcon;
  let loadError = $state(false);

  let query = $state('');
  let results = $state<Place[]>([]);
  let searching = $state(false);
  let searchError = $state('');
  let searchAbort: AbortController | undefined;

  onMount(() => {
    let ro: ResizeObserver | undefined;
    (async () => {
      try {
        const mod = await import('../leaflet');
        L = mod.default;
        pinIcon = mod.pinIcon;
      } catch {
        loadError = true;
        return;
      }
      const has = lat != null && lng != null;
      map = L.map(container, { zoomControl: true, attributionControl: true }).setView(
        has ? [lat!, lng!] : KENYA_CENTER,
        has ? 13 : 6
      );
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      }).addTo(map);
      map.on('click', (e) => onpick(round(e.latlng.lat), round(e.latlng.lng)));
      syncMarker();

      // The map is created inside an animating sheet; recalc size whenever the box changes.
      ro = new ResizeObserver(() => map?.invalidateSize());
      ro.observe(container);
    })();

    return () => {
      ro?.disconnect();
      searchAbort?.abort();
      map?.remove();
    };
  });

  // Keep the marker in step with the coordinates (map taps, GPS, search, clearing).
  $effect(() => {
    lat;
    lng;
    syncMarker();
  });

  function syncMarker() {
    if (!map || !L) return;
    if (lat == null || lng == null) {
      marker?.remove();
      marker = undefined;
      return;
    }
    if (!marker) {
      marker = L.marker([lat, lng], { icon: pinIcon, draggable: true, keyboard: false }).addTo(map);
      marker.on('dragend', () => {
        const p = marker!.getLatLng();
        onpick(round(p.lat), round(p.lng));
      });
    } else {
      marker.setLatLng([lat, lng]);
    }
    if (!map.getBounds().pad(-0.1).contains([lat, lng])) {
      map.setView([lat, lng], Math.max(map.getZoom(), 12));
    }
  }

  async function search(e: Event) {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    searchAbort?.abort();
    searchAbort = new AbortController();
    searching = true;
    searchError = '';
    try {
      results = await searchPlaces(q, searchAbort.signal);
      if (!results.length) searchError = 'No places found.';
    } catch (err) {
      if ((err as Error).name !== 'AbortError') searchError = 'Search is unavailable — are you online?';
    } finally {
      searching = false;
    }
  }

  function choose(p: Place) {
    results = [];
    query = p.name;
    map?.setView([p.lat, p.lng], 13);
    onpick(p.lat, p.lng, p.name);
  }
</script>

<div class="picker">
  <!-- A div, not a <form>: this sits inside the sighting form and forms can't nest. -->
  <div class="search" role="search">
    <Icon name="search" size={16} />
    <input
      type="search"
      bind:value={query}
      placeholder="Search for a place, e.g. Watamu"
      aria-label="Search for a place"
      enterkeyhint="search"
      onkeydown={(e) => e.key === 'Enter' && search(e)}
    />
    <button type="button" class="btn small" onclick={search} disabled={searching || !query.trim()}>
      {searching ? '…' : 'Find'}
    </button>
  </div>

  {#if results.length}
    <ul class="results">
      {#each results as r (r.detail)}
        <li>
          <button type="button" onclick={() => choose(r)}>
            <strong>{r.name}</strong>
            <span>{r.detail}</span>
          </button>
        </li>
      {/each}
    </ul>
  {/if}
  {#if searchError}<p class="error">{searchError}</p>{/if}

  <div class="map" bind:this={container}>
    {#if loadError}
      <p class="offline">The map couldn't load. You can still type a place name.</p>
    {/if}
  </div>
  <p class="hint">Tap the map to drop a pin, or drag the pin to adjust it.</p>
</div>

<style>
  .picker {
    display: grid;
    gap: 8px;
  }
  .search {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 4px 4px 4px 12px;
    border: 1px solid var(--border);
    border-radius: 10px;
    background: var(--surface);
    color: var(--text-muted);
  }
  .search:focus-within {
    border-color: var(--brand);
  }
  .search input {
    flex: 1;
    min-width: 0;
    border: 0;
    outline: 0;
    background: transparent;
    font-size: 16px;
    color: var(--text);
    padding: 6px 0;
  }
  .results {
    list-style: none;
    margin: 0;
    padding: 4px;
    border: 1px solid var(--border);
    border-radius: 10px;
    background: var(--surface);
    max-height: 220px;
    overflow-y: auto;
  }
  .results button {
    display: grid;
    gap: 2px;
    width: 100%;
    padding: 8px 10px;
    border: 0;
    border-radius: 8px;
    background: none;
    text-align: left;
  }
  .results button:hover,
  .results button:focus-visible {
    background: var(--surface-2);
  }
  .results span {
    font-size: 12px;
    color: var(--text-muted);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .map {
    position: relative;
    isolation: isolate; /* keep Leaflet's z-indexed panes inside the map */
    height: 240px;
    border-radius: 12px;
    overflow: hidden;
    border: 1px solid var(--border);
    background: var(--surface-2);
  }
  .offline {
    position: absolute;
    inset: 0;
    display: grid;
    place-items: center;
    margin: 0;
    padding: 16px;
    text-align: center;
    font-size: 14px;
    color: var(--text-muted);
  }
  .hint {
    margin: 0;
    font-size: 12px;
    color: var(--text-muted);
  }
  .error {
    margin: 0;
    font-size: 13px;
    color: var(--danger);
  }
  :global(.map-pin) {
    background: none;
    border: 0;
  }
  :global(.map-pin svg) {
    filter: drop-shadow(0 2px 2px rgb(0 0 0 / 0.35));
  }
</style>
