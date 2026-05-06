/**
 * useAITexture — V1.1.0 Generative Texture Hook
 *
 * Fetches a photoreal AI texture from `/api/ai-visuals/mesh-texture` and
 * returns it as a `THREE.Texture` ready to drop into a `material.map`.
 *
 * Pipeline:
 *   1. Check process-local Map cache (instant for repeat mounts)
 *   2. Check localStorage (persists across reloads)
 *   3. Fetch backend (which itself hits MongoDB cache, then OpenAI, then Gemini)
 *   4. Decode base64 → THREE.Texture
 *
 * Failure mode: returns null. Consumers should fall back to procedural
 * material as if no texture exists. NEVER blocks the render path.
 */
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

// In-memory texture cache (THREE.Texture objects, lives for session)
const _textureCache = new Map();
// In-flight fetches keyed by cache key — prevents duplicate network calls
const _inflight = new Map();
const LS_PREFIX = 'sov_tex_';
const LS_VERSION = 'v1';

function _lsKey(category, refId) {
  return `${LS_PREFIX}${LS_VERSION}_${category}_${refId}`;
}

function _decodeToTexture(dataUrl) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const tex = new THREE.Texture(img);
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.wrapS = THREE.RepeatWrapping;
        tex.wrapT = THREE.RepeatWrapping;
        tex.anisotropy = 4;
        tex.needsUpdate = true;
        resolve(tex);
      } catch (e) {
        reject(e);
      }
    };
    img.onerror = () => reject(new Error('Image decode failed'));
    img.src = dataUrl;
  });
}

async function _fetchTexture(category, refId, prompt) {
  const cacheKey = `${category}|${refId}`;

  // Process cache hit
  if (_textureCache.has(cacheKey)) return _textureCache.get(cacheKey);

  // De-dupe in-flight
  if (_inflight.has(cacheKey)) return _inflight.get(cacheKey);

  const promise = (async () => {
    // localStorage hit?
    let dataUrl = null;
    try {
      dataUrl = localStorage.getItem(_lsKey(category, refId));
    } catch {}

    if (!dataUrl) {
      // Network — public endpoint, auth optional
      const token = localStorage.getItem('zen_token');
      const headers = { 'Content-Type': 'application/json' };
      if (token && token !== 'guest_token') headers.Authorization = `Bearer ${token}`;
      const body = { category, ref_id: refId };
      if (prompt) body.prompt = prompt;
      const resp = await fetch(`${API}/ai-visuals/mesh-texture`, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      });
      if (!resp.ok) throw new Error(`mesh-texture ${resp.status}`);
      const j = await resp.json();
      dataUrl = j.data_url;
      // Persist to LS for next page-load. ~1MB PNGs may exceed quota
      // on heavy users — wrap in try/catch and silently skip on failure.
      try {
        if (dataUrl) localStorage.setItem(_lsKey(category, refId), dataUrl);
      } catch {}
    }

    if (!dataUrl) throw new Error('No data_url in response');
    const tex = await _decodeToTexture(dataUrl);
    _textureCache.set(cacheKey, tex);
    return tex;
  })();

  _inflight.set(cacheKey, promise);
  try {
    const tex = await promise;
    return tex;
  } finally {
    _inflight.delete(cacheKey);
  }
}

/**
 * @param {Object} args
 * @param {string} args.category — "relic" | "rock"
 * @param {string} args.refId — entity id (e.g. "lilikoi-fudge", "geology")
 * @param {string} [args.prompt] — optional explicit prompt override
 * @param {boolean} [args.enabled=true] — gate to defer fetch
 * @returns {{ texture: THREE.Texture|null, loading: boolean, error: Error|null }}
 */
export function useAITexture({ category, refId, prompt, enabled = true }) {
  const [texture, setTexture] = useState(() => {
    const k = `${category}|${refId}`;
    return _textureCache.get(k) || null;
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const cancelRef = useRef(false);

  useEffect(() => {
    cancelRef.current = false;
    if (!enabled || !category || !refId) return undefined;
    const k = `${category}|${refId}`;
    if (_textureCache.has(k)) {
      setTexture(_textureCache.get(k));
      return undefined;
    }
    setLoading(true);
    setError(null);
    _fetchTexture(category, refId, prompt)
      .then((tex) => {
        if (cancelRef.current) return;
        setTexture(tex);
      })
      .catch((e) => {
        if (cancelRef.current) return;
        setError(e);
      })
      .finally(() => {
        if (cancelRef.current) return;
        setLoading(false);
      });
    return () => { cancelRef.current = true; };
  }, [category, refId, prompt, enabled]);

  return { texture, loading, error };
}

export default useAITexture;
