/**
 * LanguageBar.jsx — V1.0.8 Global Page Translator
 *
 * One pill, mounted ONCE in App.js (top-right, fixed). Behaviour:
 *   • Tap the pill → dropdown shows the 11 languages from
 *     LanguageContext + a SACRED MODE toggle.
 *   • Pick a non-English language → toggles AUTO-TRANSLATE ON for the
 *     whole session. Persists in localStorage. Walks every page the
 *     user navigates to and translates the AI-generated text inline.
 *   • Pick English (or tap "Show original") → reverts every swapped
 *     node back to its source text and stops following navigation.
 *
 * Design rules (per user mandate):
 *   • NO per-module chips, NO duplicates of yesterday's TranslateChip.
 *     Reuses `useLanguage()` from existing LanguageContext and the
 *     existing /api/translator/translate endpoint — zero new backend.
 *   • Flatland-aware: position fixed top-right corner, 220px wide,
 *     never crosses the centre column, never traps clicks (uses
 *     pointer-events:none on its outer wrapper, only the pill itself
 *     receives input).
 *   • Skips chrome (nav / button / [data-no-translate]) so it never
 *     translates the back button or the bar itself.
 *   • Concurrency-throttled (3 in-flight) so it cannot stall the
 *     preview ingress while the chamber LEARN button is also working.
 *
 * The whole thing lives in this single file so a future agent can
 * grep `LanguageBar` and find every line of the feature in one place.
 */
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';
import { Languages, Loader2, X, BookOpen, RotateCcw, Wand2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { useLocation } from 'react-router-dom';
import { useLanguage, LANGUAGES } from '../context/LanguageContext';
import { useProcessorState } from '../state/ProcessorState';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const STORAGE_KEY = 'sovereign_language_bar_v1';

// Tunables. Tight enough that the bar can't outrun the preview ingress.
const MIN_CHARS = 18;            // skip "Hub", "X", labels, dates
const MAX_NODES = 80;            // hard cap per page traversal
const TRANSLATE_TIMEOUT_MS = 18000;
const CONCURRENCY = 3;
const NAV_DEBOUNCE_MS = 700;     // wait for the new page to render

/**
 * Walk the active page and collect translatable text-bearing nodes.
 * Strategy: prefer marked containers (`[data-translatable="true"]`,
 * <main>, <article>); fall back to the body but skip chrome.
 */
function collectNodes() {
  const root =
    document.querySelector('[data-translatable="true"]') ||
    document.querySelector('main') ||
    document.querySelector('article') ||
    document.body;
  if (!root) return [];
  const candidates = root.querySelectorAll(
    'p, li, h1, h2, h3, h4, h5, h6, blockquote, [data-translate-text]',
  );
  const out = [];
  for (const el of candidates) {
    if (out.length >= MAX_NODES) break;
    if (el.closest('[data-no-translate]')) continue;
    if (el.closest('nav, button')) continue;
    if (el.dataset.translatorOriginal != null) continue;
    const txt = (el.textContent || '').trim();
    if (txt.length < MIN_CHARS) continue;
    if (/^[\d\s\-:./]+$/.test(txt)) continue; // pure dates/numbers
    out.push(el);
  }
  return out;
}

function revertAll() {
  const els = document.querySelectorAll('[data-translator-original]');
  els.forEach((el) => {
    const original = el.dataset.translatorOriginal;
    if (original != null) {
      el.textContent = original;
      delete el.dataset.translatorOriginal;
    }
  });
}

async function translateOne(text, target, sacred) {
  let token = null;
  try { token = localStorage.getItem('zen_token'); } catch { /* noop */ }
  const headers = token && token !== 'guest_token' ? { Authorization: `Bearer ${token}` } : {};
  const res = await axios.post(
    `${API}/translator/translate`,
    { text, target_lang: target, sacred: !!sacred },
    { timeout: TRANSLATE_TIMEOUT_MS, headers },
  );
  return res.data?.translation || null;
}

async function pooledMap(items, fn, limit = CONCURRENCY) {
  const results = new Array(items.length);
  let idx = 0;
  async function worker() {
    while (idx < items.length) {
      const my = idx++;
      try { results[my] = await fn(items[my], my); } catch { results[my] = null; }
    }
  }
  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, worker),
  );
  return results;
}

export default function LanguageBar() {
  const { language, setLanguage } = useLanguage();
  const location = useLocation();
  const { startRitualChain, ritualChain } = useProcessorState();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  // V1.0.9 — Wand / Intent mode. When the user hits the wand pill, a
  // separate intent panel opens (sibling to the translator panel).
  // POSTs the intent to /api/forge/ritual-chain and dispatches
  // `ritual:chain-start` so ProcessorState's Background Agent Runner
  // takes over from anywhere in the app — Tesseract, Forge, Hub.
  const [wandOpen, setWandOpen] = useState(false);
  const [intent, setIntent] = useState('');
  const [forging, setForging] = useState(false);
  const [forgeError, setForgeError] = useState(null);

  // Hydrate the auto-follow flag + sacred mode from localStorage so
  // the choice survives reloads.
  const [autoFollow, setAutoFollow] = useState(() => {
    try {
      const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
      return !!(raw && raw.autoFollow);
    } catch { return false; }
  });
  const [sacred, setSacred] = useState(() => {
    try {
      const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
      return !!(raw && raw.sacred);
    } catch { return false; }
  });

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ autoFollow, sacred }),
      );
    } catch { /* noop */ }
  }, [autoFollow, sacred]);

  const cur = useMemo(
    () => LANGUAGES.find((l) => l.code === language) || LANGUAGES[0],
    [language],
  );

  // Core: translate all visible candidate nodes on the current page.
  const runTranslation = useCallback(async () => {
    if (busy) return 0;
    if (language === 'en' && !sacred) return 0;
    const nodes = collectNodes();
    if (!nodes.length) return 0;
    setBusy(true);
    let swapped = 0;
    try {
      const texts = nodes.map((n) => (n.textContent || '').trim());
      const translations = await pooledMap(
        texts,
        (t) => translateOne(t, language, sacred),
      );
      nodes.forEach((el, i) => {
        const t = translations[i];
        if (t && typeof t === 'string') {
          el.dataset.translatorOriginal = el.textContent;
          el.textContent = t;
          swapped += 1;
        }
      });
    } finally {
      setBusy(false);
    }
    return swapped;
  }, [busy, language, sacred]);

  // Manual button: explicit "Translate this page now".
  const handleTranslateNow = useCallback(async () => {
    if (busy) return;
    if (language === 'en' && !sacred) {
      toast.info('Pick a non-English language first.');
      return;
    }
    const swapped = await runTranslation();
    if (swapped === 0) {
      toast.info('No translatable text found on this page yet.');
    } else {
      toast.success(`${swapped} passage${swapped === 1 ? '' : 's'} → ${cur.label}`);
    }
  }, [busy, language, sacred, runTranslation, cur]);

  const handleStop = useCallback(() => {
    revertAll();
    setAutoFollow(false);
  }, []);

  // V1.0.9 — Forge a ritual chain from the wand panel and hand it off
  // to the Background Agent Runner. Lives here (rather than in a
  // separate component) so the wand stays glued to the LanguageBar
  // pill — one Omni-Agent surface, no extra sticky chrome.
  const handleForgeIntent = useCallback(async () => {
    const text = intent.trim();
    if (text.length < 5) {
      setForgeError('Tell the forge what you want — at least 5 characters.');
      return;
    }
    let token = null;
    try { token = localStorage.getItem('zen_token'); } catch { /* noop */ }
    if (!token || token === 'guest_token') {
      setForgeError('Sign in to forge a ritual chain.');
      return;
    }
    setForging(true);
    setForgeError(null);
    try {
      const res = await axios.post(
        `${API}/forge/ritual-chain`,
        { intent: text, max_steps: 4 },
        { headers: { Authorization: `Bearer ${token}` }, timeout: 30000 },
      );
      const chain = res.data;
      if (!chain?.steps?.length) {
        setForgeError('The Sage couldn\'t map your intent. Try rephrasing.');
        return;
      }
      startRitualChain(chain);
      setWandOpen(false);
      setIntent('');
      toast.success(`Forged · ${chain.ritual_title}`, {
        description: `${chain.steps.length} steps · agent running`,
      });
    } catch (err) {
      const msg = err?.response?.data?.detail || 'The forge faltered. Try again.';
      setForgeError(msg);
    } finally {
      setForging(false);
    }
  }, [intent, startRitualChain]);

  // Auto-follow the user across pages. Whenever the route changes and
  // autoFollow is on, wait for the new page to render then translate.
  const navTimerRef = useRef(null);
  useEffect(() => {
    if (!autoFollow || language === 'en') return;
    if (navTimerRef.current) clearTimeout(navTimerRef.current);
    navTimerRef.current = setTimeout(() => {
      runTranslation();
    }, NAV_DEBOUNCE_MS);
    return () => {
      if (navTimerRef.current) clearTimeout(navTimerRef.current);
    };
  }, [location.pathname, autoFollow, language, sacred, runTranslation]);

  // Re-run when async content lands AFTER the initial nav-debounce
  // (e.g. forecast finishes generating 8s later). Lightweight
  // MutationObserver listens for added text nodes inside the main
  // content root and re-translates only the new ones.
  useEffect(() => {
    if (!autoFollow || language === 'en') return;
    let pending = false;
    const obs = new MutationObserver(() => {
      if (pending || busy) return;
      pending = true;
      setTimeout(async () => {
        pending = false;
        await runTranslation();
      }, NAV_DEBOUNCE_MS);
    });
    const target =
      document.querySelector('main') ||
      document.querySelector('article') ||
      document.body;
    if (target) {
      obs.observe(target, { childList: true, subtree: true, characterData: false });
    }
    return () => obs.disconnect();
  }, [autoFollow, language, busy, runTranslation]);

  return (
    <div
      data-testid="language-bar"
      data-no-translate
      style={{
        // V1.0.8 — Flatland-safe inline mount. The previous version
        // used position:fixed which created a ghost-button capture
        // zone in the top-right corner. Now this component is a
        // simple inline-flex element that sits in the BackToHub
        // sticky strip and only occupies the space its own button
        // takes. No fixed positioning, no full-corner overlay,
        // no chance of trapping clicks aimed at content beneath it.
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: 6,
        fontFamily: 'monospace',
        marginLeft: 'auto',
      }}
    >
      <div style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}>
        <button
          type="button"
          data-testid="language-bar-toggle"
          onClick={() => { setOpen((v) => !v); if (wandOpen) setWandOpen(false); }}
          title={autoFollow ? `Auto-translate ${cur.label} · ON` : 'Open language bar'}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '6px 10px',
            borderRadius: 999,
            background: autoFollow ? 'rgba(244,114,182,0.18)' : 'rgba(34,211,238,0.12)',
            border: `1px solid ${autoFollow ? 'rgba(244,114,182,0.55)' : 'rgba(34,211,238,0.45)'}`,
            color: autoFollow ? '#F9A8D4' : '#67E8F9',
            fontSize: 10,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            cursor: 'pointer',
          }}
        >
          {busy ? <Loader2 size={12} className="animate-spin" /> : <Languages size={12} />}
          {cur.flag}
          {autoFollow && <span style={{ fontSize: 9, opacity: 0.85 }}>· LIVE</span>}
        </button>

        {/* V1.0.9 — Omni-Agent Wand. Sibling pill to the translator.
            Opens an intent panel; on submit hits /api/forge/ritual-chain
            and hands the chain to the Background Agent Runner. The
            wand glows when a chain is currently running so the user
            knows the agent is alive. */}
        <button
          type="button"
          data-testid="language-bar-wand"
          onClick={() => { setWandOpen((v) => !v); if (open) setOpen(false); }}
          title={ritualChain ? 'Ritual running · open intent forge' : 'Forge a ritual from intent'}
          aria-pressed={wandOpen}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            padding: '6px 10px',
            borderRadius: 999,
            background: ritualChain
              ? 'rgba(167,139,250,0.22)'
              : wandOpen
              ? 'rgba(167,139,250,0.18)'
              : 'rgba(167,139,250,0.10)',
            border: `1px solid ${ritualChain ? 'rgba(167,139,250,0.7)' : 'rgba(167,139,250,0.45)'}`,
            color: '#C4B5FD',
            fontSize: 10,
            letterSpacing: '0.18em',
            cursor: 'pointer',
          }}
        >
          <Wand2 size={12} />
          {ritualChain && <span style={{ fontSize: 9, opacity: 0.9 }}>· LIVE</span>}
        </button>
      </div>

      {open && (
        <div
          data-testid="language-bar-panel"
          data-no-translate
          style={{
            background: 'rgba(10, 10, 18, 0.95)',
            border: '1px solid rgba(255,255,255,0.10)',
            borderRadius: 12,
            padding: 12,
            width: 240,
            color: 'rgba(255,255,255,0.85)',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 8,
            }}
          >
            <span style={{ fontSize: 9, letterSpacing: '0.24em', opacity: 0.55 }}>
              UNIVERSAL TRANSLATOR
            </span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              data-testid="language-bar-close"
              style={{
                background: 'transparent',
                border: 'none',
                color: 'rgba(255,255,255,0.55)',
                cursor: 'pointer',
                padding: 0,
              }}
            >
              <X size={12} />
            </button>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 4,
              marginBottom: 10,
            }}
          >
            {LANGUAGES.map((l) => (
              <button
                key={l.code}
                type="button"
                onClick={() => {
                  setLanguage(l.code);
                  // English always means "show original".
                  if (l.code === 'en') {
                    revertAll();
                    setAutoFollow(false);
                  }
                }}
                data-testid={`lang-${l.code}`}
                aria-pressed={language === l.code}
                title={l.native}
                style={{
                  padding: '6px 4px',
                  borderRadius: 6,
                  background:
                    language === l.code ? 'rgba(34,211,238,0.18)' : 'transparent',
                  border: `1px solid ${
                    language === l.code
                      ? 'rgba(34,211,238,0.55)'
                      : 'rgba(255,255,255,0.10)'
                  }`,
                  color: language === l.code ? '#67E8F9' : 'rgba(255,255,255,0.78)',
                  fontSize: 9,
                  letterSpacing: '0.10em',
                  cursor: 'pointer',
                  lineHeight: 1.2,
                }}
              >
                {l.flag}
              </button>
            ))}
          </div>

          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 9,
              letterSpacing: '0.18em',
              opacity: 0.82,
              cursor: 'pointer',
              marginBottom: 8,
            }}
          >
            <input
              type="checkbox"
              checked={sacred}
              onChange={(e) => setSacred(e.target.checked)}
              data-testid="language-bar-sacred"
              style={{ accentColor: '#F472B6' }}
            />
            <BookOpen size={10} /> SACRED MODE (Sovereign tier)
          </label>

          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 9,
              letterSpacing: '0.18em',
              opacity: 0.95,
              cursor: 'pointer',
              marginBottom: 10,
              padding: '6px 8px',
              borderRadius: 6,
              background: autoFollow ? 'rgba(244,114,182,0.10)' : 'rgba(255,255,255,0.04)',
              border: `1px solid ${autoFollow ? 'rgba(244,114,182,0.40)' : 'rgba(255,255,255,0.08)'}`,
            }}
          >
            <input
              type="checkbox"
              checked={autoFollow}
              onChange={(e) => {
                const next = e.target.checked;
                setAutoFollow(next);
                if (next && language !== 'en') {
                  // Run immediately on first activation
                  setTimeout(() => runTranslation(), 100);
                } else if (!next) {
                  revertAll();
                }
              }}
              data-testid="language-bar-auto"
              style={{ accentColor: '#F472B6' }}
            />
            FOLLOW ME EVERYWHERE
          </label>

          <button
            type="button"
            onClick={autoFollow ? handleStop : handleTranslateNow}
            disabled={busy}
            data-testid="language-bar-action"
            style={{
              width: '100%',
              padding: '8px 10px',
              borderRadius: 8,
              background: autoFollow
                ? 'rgba(244,114,182,0.18)'
                : 'rgba(34,211,238,0.16)',
              border: `1px solid ${
                autoFollow ? 'rgba(244,114,182,0.55)' : 'rgba(34,211,238,0.55)'
              }`,
              color: autoFollow ? '#F9A8D4' : '#67E8F9',
              fontSize: 10,
              letterSpacing: '0.18em',
              fontFamily: 'monospace',
              cursor: busy ? 'wait' : 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
            }}
          >
            {busy && <Loader2 size={11} className="animate-spin" />}
            {!busy && autoFollow && <RotateCcw size={11} />}
            {!busy && !autoFollow && <Languages size={11} />}
            {busy
              ? 'TRANSLATING…'
              : autoFollow
              ? 'STOP · SHOW ORIGINAL'
              : `TRANSLATE THIS PAGE → ${cur.flag}`}
          </button>

          <p
            style={{
              fontSize: 8.5,
              letterSpacing: '0.12em',
              opacity: 0.5,
              marginTop: 8,
              lineHeight: 1.4,
            }}
          >
            One pick · works everywhere · readings · lessons · oracle · Sage
          </p>
        </div>
      )}

      {/* V1.0.9 — Wand intent panel. Sibling to the translator panel.
          Sage forges a ritual chain from the user's natural-language
          intent; the chain is then handed to the Background Agent
          Runner inside ProcessorState. */}
      {wandOpen && (
        <div
          data-testid="language-bar-wand-panel"
          data-no-translate
          style={{
            background: 'rgba(10, 10, 18, 0.95)',
            border: '1px solid rgba(167,139,250,0.30)',
            borderRadius: 12,
            padding: 12,
            width: 260,
            color: 'rgba(255,255,255,0.85)',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 8,
            }}
          >
            <span
              style={{
                fontSize: 9,
                letterSpacing: '0.24em',
                opacity: 0.85,
                color: '#C4B5FD',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <Wand2 size={10} /> RITUAL FORGE · INTENT
            </span>
            <button
              type="button"
              onClick={() => setWandOpen(false)}
              data-testid="language-bar-wand-close"
              style={{
                background: 'transparent',
                border: 'none',
                color: 'rgba(255,255,255,0.55)',
                cursor: 'pointer',
                padding: 0,
              }}
            >
              <X size={12} />
            </button>
          </div>

          <textarea
            data-testid="language-bar-wand-intent"
            value={intent}
            onChange={(e) => setIntent(e.target.value.slice(0, 400))}
            placeholder="What do you want? e.g. 'Ground me, breathe deep, capture one insight'"
            rows={3}
            style={{
              width: '100%',
              padding: 8,
              borderRadius: 8,
              background: 'rgba(0,0,0,0.30)',
              border: '1px solid rgba(167,139,250,0.25)',
              color: 'rgba(255,255,255,0.85)',
              fontSize: 11,
              fontFamily: 'monospace',
              outline: 'none',
              resize: 'none',
              boxSizing: 'border-box',
            }}
          />
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: 6,
              fontSize: 9,
              color: 'rgba(255,255,255,0.4)',
            }}
          >
            <span>{intent.length}/400</span>
            <span style={{ letterSpacing: '0.10em' }}>
              {ritualChain ? 'agent running' : 'agent idle'}
            </span>
          </div>

          {forgeError && (
            <p
              data-testid="language-bar-wand-error"
              style={{
                fontSize: 10,
                color: '#FCA5A5',
                marginTop: 6,
                lineHeight: 1.4,
              }}
            >
              {forgeError}
            </p>
          )}

          <button
            type="button"
            onClick={handleForgeIntent}
            disabled={forging || intent.trim().length < 5}
            data-testid="language-bar-wand-forge"
            style={{
              width: '100%',
              padding: '8px 10px',
              borderRadius: 8,
              background: 'rgba(167,139,250,0.18)',
              border: '1px solid rgba(167,139,250,0.55)',
              color: '#C4B5FD',
              fontSize: 10,
              letterSpacing: '0.18em',
              fontFamily: 'monospace',
              cursor: forging || intent.trim().length < 5 ? 'not-allowed' : 'pointer',
              opacity: forging || intent.trim().length < 5 ? 0.55 : 1,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              marginTop: 8,
            }}
          >
            {forging ? <Loader2 size={11} className="animate-spin" /> : <Sparkles size={11} />}
            {forging ? 'FORGING…' : 'FORGE & RUN'}
          </button>

          <p
            style={{
              fontSize: 8.5,
              letterSpacing: '0.12em',
              opacity: 0.5,
              marginTop: 8,
              lineHeight: 1.4,
            }}
          >
            The agent runs steps in the background · skip / end from the HUD
          </p>
        </div>
      )}
    </div>
  );
}
