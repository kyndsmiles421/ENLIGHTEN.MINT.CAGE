/**
 * cdnAssets.js — CDN URL resolver (V68.57)
 *
 * Lets the app fetch heavy media (videos, hero images, audio) from a
 * CDN instead of bundling them. Single source of truth so individual
 * components don't hardcode URLs.
 *
 * Configuration: set REACT_APP_CDN_BASE_URL in `.env` (e.g.
 * `https://cdn.enlighten.cafe` or your CloudFront / Cloudinary host).
 * When unset, the helper falls back to the local `/public` path so
 * the app works in development without a CDN.
 *
 *   import { cdnUrl } from '../services/cdnAssets';
 *   <video src={cdnUrl('showcase.mp4', '/showcase.mp4')} />
 *
 * Future: add per-asset cache-busting via a build-time hash in env.
 * Today: trust the CDN's own cache invalidation strategy.
 */

const BASE = (process.env.REACT_APP_CDN_BASE_URL || '').replace(/\/+$/, '');

/**
 * Resolve a CDN URL.
 * @param {string} path     Relative path under the CDN bucket
 *                          (e.g. "showcase.mp4", "videos/hero.webm")
 * @param {string} [fallback]  Local path to use when the CDN env var
 *                             is not set. Defaults to `/${path}`.
 * @returns {string}
 */
export function cdnUrl(path, fallback) {
  if (!path) return fallback || '/';
  const clean = String(path).replace(/^\/+/, '');
  if (!BASE) return fallback || `/${clean}`;
  return `${BASE}/${clean}`;
}

/** Whether a CDN base is configured (use to gate optional remote fetches). */
export const isCdnConfigured = () => Boolean(BASE);
