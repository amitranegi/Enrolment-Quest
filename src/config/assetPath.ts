/** Resolves public/ asset URLs built at runtime (Vite only rewrites static ones). */

/*
 * The bundle is emitted into <site-root>/assets/, so its own URL locates the
 * site root even when the page is opened without a trailing slash — which is
 * where document.baseURI would resolve incorrectly. This keeps assets working
 * under a sub-path deploy as well as at the domain root.
 */
const SITE_ROOT = import.meta.env.DEV
  ? new URL(import.meta.env.BASE_URL, window.location.origin).href
  : new URL('../', import.meta.url).href;

/** `assetPath('sprites/cloud.png')` → absolute URL inside the deployed folder. */
export function assetPath(path: string): string {
  return new URL(path.replace(/^\/+/, ''), SITE_ROOT).href;
}
