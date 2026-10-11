<script lang="ts">
  import type { Sighting } from '../types';
  import { reverseGeocode } from '../geo';
  import MapPicker from './MapPicker.svelte';
  import Icon from './Icon.svelte';

  type Draft = Omit<Sighting, 'id' | 'createdAt' | 'speciesId'>;

  let {
    initial,
    submitLabel = 'Save sighting',
    onsubmit,
    oncancel
  }: {
    initial?: Partial<Draft>;
    submitLabel?: string;
    onsubmit: (d: Draft) => void;
    oncancel: () => void;
  } = $props();

  const today = () => new Date().toLocaleDateString('en-CA'); // yyyy-mm-dd in local time

  // Form fields are seeded once from `initial`; later prop changes are ignored on purpose.
  // svelte-ignore state_referenced_locally
  let date = $state(initial?.date ?? today());
  // svelte-ignore state_referenced_locally
  let locationName = $state(initial?.locationName ?? '');
  // svelte-ignore state_referenced_locally
  let lat = $state<number | undefined>(initial?.lat);
  // svelte-ignore state_referenced_locally
  let lng = $state<number | undefined>(initial?.lng);
  // svelte-ignore state_referenced_locally
  let notes = $state(initial?.notes ?? '');

  let locating = $state(false);
  let geoError = $state('');
  // Once the user types a name themselves, stop auto-filling it from the map.
  // svelte-ignore state_referenced_locally
  let nameTouched = $state(!!initial?.locationName);
  let naming = $state(false);
  let nameAbort: AbortController | undefined;

  /** Sets the coordinates and, unless the user has typed a name, suggests one. */
  async function setPoint(newLat: number, newLng: number, name?: string) {
    lat = newLat;
    lng = newLng;
    if (nameTouched) return;
    nameAbort?.abort();
    if (name) {
      locationName = name;
      return;
    }
    nameAbort = new AbortController();
    const signal = nameAbort.signal;
    naming = true;
    const found = await reverseGeocode(newLat, newLng, signal);
    if (!signal.aborted) {
      locationName = found ?? `${newLat}, ${newLng}`;
      naming = false;
    }
  }

  /**
   * Uses the browser Geolocation API. In a Capacitor iOS build this can be
   * swapped for @capacitor/geolocation; remember NSLocationWhenInUseUsageDescription.
   */
  function useMyLocation() {
    if (!('geolocation' in navigator)) {
      geoError = 'Location is not available on this device.';
      return;
    }
    locating = true;
    geoError = '';
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        locating = false;
        setPoint(+pos.coords.latitude.toFixed(5), +pos.coords.longitude.toFixed(5));
      },
      (err) => {
        geoError =
          err.code === err.PERMISSION_DENIED
            ? 'Location permission was denied. You can still type a place name.'
            : 'Could not get your location. Try again or type a place name.';
        locating = false;
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 }
    );
  }

  function clearCoords() {
    nameAbort?.abort();
    naming = false;
    lat = lng = undefined;
  }

  function submit(e: SubmitEvent) {
    e.preventDefault();
    onsubmit({
      date,
      locationName: locationName.trim() || (lat != null ? `${lat}, ${lng}` : 'Unknown location'),
      lat,
      lng,
      notes: notes.trim() || undefined
    });
  }
</script>

<form onsubmit={submit}>
  <label class="field">
    Date
    <input type="date" bind:value={date} max={today()} required />
  </label>

  <label class="field">
    Where did you see it?
    <input
      type="text"
      bind:value={locationName}
      oninput={() => (nameTouched = locationName.trim() !== '')}
      placeholder={naming ? 'Looking up place name…' : 'e.g. Maasai Mara, near Mara River'}
      autocomplete="off"
    />
  </label>

  <MapPicker {lat} {lng} onpick={setPoint} />

  <div class="geo">
    <button type="button" class="btn small" onclick={useMyLocation} disabled={locating}>
      <Icon name="locate" size={16} />
      {locating ? 'Locating…' : 'Use my current location'}
    </button>
    {#if lat != null && lng != null}
      <span class="coords">
        <Icon name="pin" size={14} />
        {lat}, {lng}
        <button type="button" class="link" onclick={clearCoords} aria-label="Remove coordinates">
          <Icon name="close" size={14} />
        </button>
      </span>
    {/if}
  </div>
  {#if geoError}<p class="error">{geoError}</p>{/if}

  <label class="field">
    Notes (optional)
    <textarea bind:value={notes} placeholder="Behaviour, group size, who you were with…"></textarea>
  </label>

  <div class="actions">
    <button type="button" class="btn" onclick={oncancel}>Cancel</button>
    <button type="submit" class="btn primary">
      <Icon name="check" size={18} />
      {submitLabel}
    </button>
  </div>
</form>

<style>
  form {
    display: grid;
    gap: 12px;
  }
  .geo {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 10px;
  }
  .coords {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: 13px;
    color: var(--text-muted);
    font-variant-numeric: tabular-nums;
  }
  .link {
    display: inline-grid;
    place-items: center;
    border: 0;
    background: none;
    padding: 4px;
    color: var(--text-muted);
  }
  .error {
    margin: 0;
    color: var(--danger);
    font-size: 13px;
  }
  .actions {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
  }
</style>
