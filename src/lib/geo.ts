/**
 * Place search and reverse geocoding via OpenStreetMap Nominatim.
 * Usage policy: max ~1 request/second, which user-triggered calls stay well under.
 * https://operations.osmfoundation.org/policies/nominatim/
 */
const NOMINATIM = 'https://nominatim.openstreetmap.org';

/** Rough bounding box of Kenya, used to bias search results (lon1,lat1,lon2,lat2). */
const KENYA_VIEWBOX = '33.9,5.1,41.95,-4.8';

export const KENYA_CENTER: [number, number] = [0.25, 37.9];

export interface Place {
  name: string;
  detail: string;
  lat: number;
  lng: number;
}

export const round = (n: number) => Math.round(n * 1e5) / 1e5;

export async function searchPlaces(query: string, signal?: AbortSignal): Promise<Place[]> {
  const url = new URL(`${NOMINATIM}/search`);
  url.search = new URLSearchParams({
    q: query,
    format: 'jsonv2',
    limit: '6',
    viewbox: KENYA_VIEWBOX,
    'accept-language': navigator.language || 'en'
  }).toString();
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error('Place search failed');
  const rows: { name: string; display_name: string; lat: string; lon: string }[] = await res.json();
  return rows.map((r) => ({
    name: r.name || r.display_name.split(',')[0],
    detail: r.display_name,
    lat: round(+r.lat),
    lng: round(+r.lon)
  }));
}

/** Returns a short, human-friendly name for a coordinate, or null if none is found. */
export async function reverseGeocode(lat: number, lng: number, signal?: AbortSignal): Promise<string | null> {
  const url = new URL(`${NOMINATIM}/reverse`);
  url.search = new URLSearchParams({
    lat: String(lat),
    lon: String(lng),
    format: 'jsonv2',
    zoom: '14',
    'accept-language': navigator.language || 'en'
  }).toString();
  try {
    const res = await fetch(url, { signal });
    if (!res.ok) return null;
    const r = await res.json();
    const a = r.address ?? {};
    const local =
      r.name || a.national_park || a.nature_reserve || a.protected_area || a.village || a.suburb || a.town || a.hamlet;
    const wider = a.city || a.town || a.county || a.state;
    const parts = [local, wider].filter((p, i, arr) => p && arr.indexOf(p) === i);
    return parts.length ? parts.join(', ') : (r.display_name?.split(',').slice(0, 2).join(',') ?? null);
  } catch {
    return null;
  }
}
