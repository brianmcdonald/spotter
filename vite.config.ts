import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { existsSync } from 'node:fs';

// Relative base so the built bundle works when loaded from a file:// or
// capacitor:// origin inside a native iOS wrapper.
export default defineConfig({
  base: './',
  plugins: [svelte()],
  // Field guide content exists only where scripts/extract-books.py has run; builds
  // without it (e.g. CI) skip the request instead of logging a 404.
  define: { __HAS_BOOKS__: JSON.stringify(existsSync('public/books/books.json')) },
  // The bundled Kenya species catalogue (~2,000 entries) makes the main chunk ~1 MB raw / ~180 KB gzipped.
  build: { chunkSizeWarningLimit: 1500 }
});
