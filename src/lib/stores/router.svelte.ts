import type { Category } from '../types';

/**
 * Minimal hash router. Hash routing needs no server config, so it works the
 * same from a static host, file:// or inside a Capacitor iOS WebView.
 *
 *   #/fish            section list
 *   #/fish/whale-shark  species detail (shown as a sheet over the list)
 *   #/log             my sightings
 */
export type Tab = Category | 'log';
const TABS: Tab[] = ['fish', 'birds', 'animals', 'log'];

function parse(hash: string): { tab: Tab; speciesId: string | null } {
  const [tab, id] = hash.replace(/^#\/?/, '').split('/');
  return {
    tab: TABS.includes(tab as Tab) ? (tab as Tab) : 'animals',
    speciesId: id ? decodeURIComponent(id) : null
  };
}

class Router {
  tab = $state<Tab>('animals');
  speciesId = $state<string | null>(null);

  constructor() {
    const sync = () => Object.assign(this, parse(location.hash));
    sync();
    addEventListener('hashchange', sync);
  }

  go(tab: Tab, speciesId?: string) {
    location.hash = speciesId ? `/${tab}/${encodeURIComponent(speciesId)}` : `/${tab}`;
  }

  closeDetail() {
    // Prefer going back so the browser/iOS swipe history stays tidy.
    if (history.length > 1 && this.speciesId) history.back();
    else this.go(this.tab);
  }
}

export const router = new Router();
