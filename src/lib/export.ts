import type { LogExport } from './types';
import { speciesById } from './data';

function download(filename: string, content: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = Object.assign(document.createElement('a'), { href: url, download: filename });
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

const stamp = () => new Date().toISOString().slice(0, 10);

/**
 * Note for iOS: in a Capacitor build, replace `download` with
 * @capacitor/filesystem + @capacitor/share so the file goes to the share sheet.
 */
export function exportJson(data: LogExport) {
  download(`kenya-spotter-log-${stamp()}.json`, JSON.stringify(data, null, 2), 'application/json');
}

export function exportCsv(data: LogExport) {
  const esc = (v: unknown) => {
    const s = v == null ? '' : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const rows = [
    ['date', 'category', 'name', 'scientific_name', 'location', 'latitude', 'longitude', 'notes'],
    ...data.sightings.map((s) => {
      const sp = speciesById.get(s.speciesId);
      return [s.date, sp?.category, sp?.name ?? s.speciesId, sp?.scientificName, s.locationName, s.lat, s.lng, s.notes];
    })
  ];
  download(`kenya-spotter-log-${stamp()}.csv`, rows.map((r) => r.map(esc).join(',')).join('\n'), 'text/csv');
}

export async function readJsonFile(file: File): Promise<unknown> {
  try {
    return JSON.parse(await file.text());
  } catch {
    throw new Error('Could not read that file — is it a JSON export from Kenya Spotter?');
  }
}
