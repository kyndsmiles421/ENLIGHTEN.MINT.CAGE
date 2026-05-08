/**
 * SageVoiceCommand.jsx — V1.1.14 Talk-to-Text Sovereign Command Layer
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Inline mic pill (Flatland-clean — sits in document flow, no overlay)
 * that wires Web Speech API into the Sovereign nervous system:
 *
 *   1. User taps the pill → browser prompts mic permission once.
 *   2. SpeechRecognition fires `onresult` with a transcript.
 *   3. Intent matcher resolves transcript → route (e.g. "open the
 *      evolution lab" → /evolution-lab).
 *   4. We call prewarmRoute() to kick the chunk fetch, dispatchUnlock()
 *      so the 81-node Helix ripples in acknowledgment, then navigate.
 *   5. Sage speaks back ("opening evolution lab") via SageVoice.speak().
 *
 * Flatland Rules respected:
 *   - No position:fixed, no modal, no toast spam.
 *   - Active state shown by an inline animated dot inside the same pill.
 *   - Errors (no mic permission, browser unsupported) collapse the pill
 *     silently — never a yellow Check-Engine sticker.
 *
 * Browser support: Chrome / Edge / Safari (webkitSpeechRecognition).
 * Firefox lacks the API → we hide the pill entirely instead of crashing.
 */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic, MicOff } from 'lucide-react';
import { prewarmRoute } from '../utils/PrewarmRoutes';
import { dispatchUnlock } from '../utils/UnlockBus';
import * as SageVoice from '../services/SageVoiceController';
import { useLanguage } from '../context/LanguageContext';

// Shallow language code → BCP47 locale for SpeechRecognition.lang.
// Maps the LanguageContext registry codes onto Web Speech API
// expectations. Falls back to en-US if a code lacks a known locale.
const STT_LOCALE = {
  en:  'en-US',
  haw: 'en-US',          // Hawaiian Pidgin → English STT base + phonetic accent
  zh:  'zh-CN',
  yue: 'zh-HK',
  hi:  'hi-IN',
  ur:  'ur-PK',
  es:  'es-ES',
  fr:  'fr-FR',
  ja:  'ja-JP',
  ar:  'ar-SA',
  pt:  'pt-BR',
};

// Phrase → route. Multiple aliases per route so the user doesn't have
// to memorize exact wording. Matched longest-first so "evolution lab"
// beats "evolution".
const INTENT_MAP = [
  { phrases: ['evolution lab', 'lab', 'polish gem', 'evolution'],         route: '/evolution-lab' },
  { phrases: ['vault', 'tesseract vault', 'open vault', 'relic vault'],   route: '/vault' },
  { phrases: ['tesseract', 'hypercube', 'four d cube'],                   route: '/tesseract' },
  { phrases: ['forgotten languages', 'glyphs', 'languages'],              route: '/forgotten-languages' },
  { phrases: ['pricing', 'tiers', 'subscribe', 'upgrade'],                route: '/pricing' },
  { phrases: ['observatory', 'sky', 'astronomy'],                         route: '/observatory' },
  { phrases: ['spiritual coach', 'sage chat', 'coach'],                   route: '/spiritual-coach' },
  { phrases: ['meditation', 'meditate'],                                  route: '/meditation' },
  { phrases: ['breathing', 'breath work', 'pranayama'],                   route: '/breathing' },
  { phrases: ['herbology', 'herbs', 'plants'],                            route: '/herbology' },
  { phrases: ['oracle', 'reading', 'divination'],                         route: '/oracle' },
  { phrases: ['hub', 'home', 'sovereign hub', 'main'],                    route: '/sovereign-hub' },
  { phrases: ['black hills', 'pactola', 'reservoir', 'bathymetry'],       route: '/vault' },
];

// Resolve a transcript to a route. Returns null if no intent matches.
function matchIntent(transcript) {
  if (!transcript) return null;
  const lower = transcript.toLowerCase().trim().replace(/[.,!?]/g, '');
  // Sort phrases longest-first within and across rules.
  const all = [];
  for (const { phrases, route } of INTENT_MAP) {
    for (const p of phrases) all.push({ p, route });
  }
  all.sort((a, b) => b.p.length - a.p.length);
  for (const { p, route } of all) {
    if (lower.includes(p)) return { route, phrase: p };
  }
  return null;
}

function getSpeechRecognitionCtor() {
  if (typeof window === 'undefined') return null;
  return window.SpeechRecognition || window.webkitSpeechRecognition || null;
}

/**
 * @param {Object} props
 * @param {string} [props.size='compact'] — 'compact' | 'full'
 */
export default function SageVoiceCommand({ size = 'compact' }) {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [supported, setSupported] = useState(true);
  const [listening, setListening] = useState(false);
  const [lastHeard, setLastHeard] = useState('');
  const recognitionRef = useRef(null);
  const langRef = useRef(language);
  // Keep langRef current so the SpeechRecognition handler always uses
  // the latest LanguageBar selection without re-instantiating.
  useEffect(() => { langRef.current = language; }, [language]);

  // Detect support once on mount. If the browser lacks the API,
  // collapse the pill entirely (no error stamping).
  useEffect(() => {
    const Ctor = getSpeechRecognitionCtor();
    if (!Ctor) {
      setSupported(false);
      return undefined;
    }
    const rec = new Ctor();
    rec.continuous = false;
    rec.interimResults = false;
    rec.lang = STT_LOCALE[language] || 'en-US';
    rec.maxAlternatives = 1;
    rec.onresult = (e) => {
      try {
        const transcript = e.results[0]?.[0]?.transcript || '';
        setLastHeard(transcript);
        const intent = matchIntent(transcript);
        if (intent) {
          // 1. Pre-warm the chunk so navigation is zero-latency.
          prewarmRoute(intent.route);
          // 2. Ripple the 81-node Helix lattice in acknowledgment.
          try {
            dispatchUnlock({
              kind: 'voice',
              id: intent.route,
              color: '#A78BFA',
            });
          } catch { /* noop */ }
          // 3. Sage acknowledges aloud (best-effort, non-blocking) in
          //    the active LanguageBar language so the OS feels native
          //    to the user's selection.
          try {
            SageVoice.speak(`Opening ${intent.phrase}`, {
              language: langRef.current,
            }).catch(() => {});
          } catch { /* noop */ }
          // 4. Navigate.
          navigate(intent.route);
        }
      } catch { /* noop */ }
    };
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    recognitionRef.current = rec;
    return () => {
      try { rec.stop(); } catch { /* noop */ }
      recognitionRef.current = null;
    };
  }, [navigate]);

  const toggle = useCallback(() => {
    const rec = recognitionRef.current;
    if (!rec) return;
    if (listening) {
      try { rec.stop(); } catch { /* noop */ }
      setListening(false);
    } else {
      // Apply the current LanguageBar selection just before starting
      // so a user who switches languages sees STT match instantly.
      try { rec.lang = STT_LOCALE[langRef.current] || 'en-US'; } catch { /* noop */ }
      try {
        rec.start();
        setListening(true);
      } catch {
        // Browser refused (already started, no permission). Silent fallback.
        setListening(false);
      }
    }
  }, [listening]);

  if (!supported) return null;

  const isCompact = size === 'compact';
  return (
    <button
      type="button"
      onClick={toggle}
      data-testid="sage-voice-command"
      data-listening={listening ? 'true' : 'false'}
      title={listening ? 'Listening — say "open the vault"' : 'Sage voice command'}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: isCompact ? '5px 9px' : '7px 12px',
        borderRadius: 999,
        background: listening ? 'rgba(167,139,250,0.18)' : 'rgba(167,139,250,0.06)',
        border: `1px solid ${listening ? 'rgba(167,139,250,0.55)' : 'rgba(167,139,250,0.22)'}`,
        color: listening ? '#C4B5FD' : 'rgba(167,139,250,0.85)',
        fontFamily: 'monospace',
        fontSize: isCompact ? 9 : 10,
        letterSpacing: '0.18em',
        textTransform: 'uppercase',
        cursor: 'pointer',
        transition: 'background 200ms, border-color 200ms, color 200ms',
      }}
    >
      {listening
        ? <Mic size={isCompact ? 10 : 12} className="animate-pulse" />
        : <MicOff size={isCompact ? 10 : 12} />}
      <span>{listening ? 'listening' : 'sage'}</span>
      {/* Inline transcript echo — Flatland-clean, no toast.
          Auto-clears next time the user toggles. */}
      {lastHeard && !listening && (
        <span
          style={{
            opacity: 0.5,
            fontSize: isCompact ? 8 : 9,
            marginLeft: 4,
            maxWidth: 120,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            textTransform: 'lowercase',
            letterSpacing: 0,
          }}
          data-testid="sage-voice-last-heard"
        >
          · {lastHeard}
        </span>
      )}
    </button>
  );
}
