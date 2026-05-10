/**
 * useVoicePersona — V1.2.7 unified voice/language persona hook.
 *
 * Single source of truth for "who's speaking and in what language."
 * Replaces the two divergent localStorage keys
 * (`cosmiccollective_voice_prefs` from NarrationPlayer +
 * `sovereign_language_bar_v1` from LanguageBar) with one persona that
 * survives reloads and is read by every voice consumer:
 *   • LanguageBar voice translator   → SageVoiceController.speak(opts.voiceId)
 *   • NarrationPlayer module narrate → narrationSystem.playVoice(opts.voice)
 *   • Sage chat / oracle replies     → SageVoiceController.speak(opts.voiceId)
 *
 * Per the architect's "Handshake protocol" mandate (2026-02-10):
 *   - One picker in one panel; no two-step toggling between language and voice.
 *   - When language changes, surface voices best tuned for that phonology
 *     instead of letting the user pair (e.g.) Coral with Mandarin and
 *     hit the "uncanny valley" effect.
 *   - Single state → bundled instruction → one round-trip to the engine.
 *
 * Voice metadata (ids/labels/desc) lives here so both the picker and
 * the playback paths read the SAME list. No more drift between the
 * inline NarrationPlayer grid and the translator panel.
 */
import { useCallback, useEffect, useState } from 'react';

const PERSONA_KEY = 'sovereign_voice_persona_v1';
// Legacy keys kept ONLY for one-time migration so users don't lose their pick.
const LEGACY_NARRATION_KEY = 'cosmiccollective_voice_prefs';

export const VOICES = [
  { id: 'nova',    label: 'Nova',    desc: 'Warm feminine',        gender: 'female',  accent: 'American' },
  { id: 'shimmer', label: 'Shimmer', desc: 'Soft feminine',        gender: 'female',  accent: 'American' },
  { id: 'coral',   label: 'Coral',   desc: 'Bright feminine',      gender: 'female',  accent: 'American' },
  { id: 'sage',    label: 'Sage',    desc: 'Wise masculine',       gender: 'male',    accent: 'American' },
  { id: 'ash',     label: 'Ash',     desc: 'Warm masculine',       gender: 'male',    accent: 'American' },
  { id: 'onyx',    label: 'Onyx',    desc: 'Deep masculine',       gender: 'male',    accent: 'American' },
  { id: 'echo',    label: 'Echo',    desc: 'Smooth masculine',     gender: 'male',    accent: 'American' },
  { id: 'fable',   label: 'Fable',   desc: 'Expressive storyteller', gender: 'male',  accent: 'British' },
  { id: 'alloy',   label: 'Alloy',   desc: 'Balanced neutral',     gender: 'neutral', accent: 'Neutral' },
];

// Language→voice affinity. Voices listed here are the ones whose
// phonology profile sits closest to the target language; others still
// work but are flagged as "may sound off" in the picker so the user
// isn't surprised by a Coral-tries-Mandarin moment.
const AFFINITY = {
  en:  ['nova', 'shimmer', 'coral', 'sage', 'ash', 'onyx', 'echo', 'fable', 'alloy'],
  es:  ['nova', 'shimmer', 'coral', 'sage', 'ash', 'onyx', 'echo', 'alloy'],
  fr:  ['nova', 'shimmer', 'coral', 'sage', 'fable', 'alloy'],
  pt:  ['nova', 'coral', 'sage', 'ash', 'onyx', 'alloy'],
  zh:  ['sage', 'onyx', 'nova', 'alloy'],
  yue: ['sage', 'onyx', 'nova', 'alloy'],
  ja:  ['sage', 'shimmer', 'onyx', 'alloy'],
  hi:  ['onyx', 'sage', 'fable', 'alloy'],
  ur:  ['onyx', 'sage', 'alloy'],
  ar:  ['onyx', 'sage', 'alloy'],
  haw: ['nova', 'sage', 'alloy', 'fable'],
};

const SPEEDS = [
  { value: 0.8,  label: 'Slow' },
  { value: 1.0,  label: 'Normal' },
  { value: 1.15, label: 'Brisk' },
];

const DEFAULTS = { voice: 'sage', speed: 1.0 };

function loadPersona() {
  try {
    const raw = localStorage.getItem(PERSONA_KEY);
    if (raw) return { ...DEFAULTS, ...JSON.parse(raw) };
    // One-time migration from legacy NarrationPlayer prefs.
    const legacy = localStorage.getItem(LEGACY_NARRATION_KEY);
    if (legacy) {
      const parsed = JSON.parse(legacy);
      if (parsed?.voice) return { ...DEFAULTS, voice: parsed.voice, speed: parsed.speed || 1.0 };
    }
  } catch (e) {
    if (process.env.NODE_ENV !== 'production') console.warn('[useVoicePersona] load failed', e);
  }
  return { ...DEFAULTS };
}

function savePersona(p) {
  try { localStorage.setItem(PERSONA_KEY, JSON.stringify(p)); } catch (e) {
    if (process.env.NODE_ENV !== 'production') console.warn('[useVoicePersona] save failed', e);
  }
  // Mirror to legacy key so any stragglers still reading the old key
  // see the new pick. Drop in a future cleanup pass once nobody reads it.
  try { localStorage.setItem(LEGACY_NARRATION_KEY, JSON.stringify({ voice: p.voice, speed: p.speed })); } catch (e) {
    if (process.env.NODE_ENV !== 'production') console.warn(e);
  }
}

// Cross-tab + cross-component sync. When ANY component updates the
// persona, the others re-render with the same voice.
const SYNC_EVENT = 'voice-persona:change';

export function useVoicePersona() {
  const [persona, setPersona] = useState(loadPersona);

  useEffect(() => {
    const onSync = (ev) => {
      if (ev.detail) setPersona(ev.detail);
      else setPersona(loadPersona());
    };
    const onStorage = (ev) => {
      if (ev.key === PERSONA_KEY) setPersona(loadPersona());
    };
    window.addEventListener(SYNC_EVENT, onSync);
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener(SYNC_EVENT, onSync);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  const setVoice = useCallback((voiceId) => {
    setPersona((prev) => {
      const next = { ...prev, voice: voiceId };
      savePersona(next);
      window.dispatchEvent(new CustomEvent(SYNC_EVENT, { detail: next }));
      return next;
    });
  }, []);

  const setSpeed = useCallback((speedValue) => {
    setPersona((prev) => {
      const next = { ...prev, speed: speedValue };
      savePersona(next);
      window.dispatchEvent(new CustomEvent(SYNC_EVENT, { detail: next }));
      return next;
    });
  }, []);

  return {
    voice: persona.voice,
    speed: persona.speed,
    setVoice,
    setSpeed,
    VOICES,
    SPEEDS,
    /**
     * affinityFor(langCode) → { recommended: Voice[], discouraged: Voice[] }
     * Lets the picker show two clusters: tuned-for-this-language vs.
     * may-sound-off. Falls back to "all recommended" for unknown langs.
     */
    affinityFor(langCode) {
      const code = (langCode || 'en').toLowerCase();
      const recIds = AFFINITY[code] || AFFINITY.en;
      const recSet = new Set(recIds);
      return {
        recommended: VOICES.filter((v) => recSet.has(v.id)),
        discouraged: VOICES.filter((v) => !recSet.has(v.id)),
      };
    },
  };
}
