import { defineConfig } from 'vite';

export default defineConfig({
  // Relative to index.html rather than rooted at /, so the build also works
  // when served from a sub-path rather than a domain root.
  base: './',
  server: {
    port: 5280,
    strictPort: true,
    // Bind IPv4 so http://127.0.0.1:5280/ works (macOS localhost often prefers ::1).
    host: '127.0.0.1',
  },
  preview: {
    port: 5280,
    strictPort: true,
    host: '127.0.0.1',
  },
});
