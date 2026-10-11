/**
 * Thin persistence layer. Uses localStorage on the web.
 *
 * When wrapping with Capacitor for iOS, swap the implementation for
 * `@capacitor/preferences` (iOS may evict WebView localStorage under storage
 * pressure). Everything else in the app goes through these two functions.
 */
export function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function save<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error('Failed to save', key, err);
  }
}
