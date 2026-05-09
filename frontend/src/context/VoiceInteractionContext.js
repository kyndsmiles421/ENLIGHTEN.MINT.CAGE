/**
 * VoiceInteractionContext.js — V68.84
 *
 * The "Talk-to-Pillar" bridge. Wraps three responsibilities:
 *   1. voiceMode toggle  ('tactile' | 'narrative' | 'interactive')
 *   2. Browser TTS       (free tier — speak any text in any language)
 *   3. Tier features     (fetched from /api/voice/tier-features)
 *
 * Flatland-compliant: no provider-rendered UI. Just state + helpers.
 * Consumers (Arsenal, pillars, settings) render their own controls.
 *
 * ──────────────────────────────────────────────────────────────────
 * Why this lives separate from VoiceCommandContext (STT) and
 * LanguageContext (UI strings)? Because dwell-aware spiritual
 * narration is its own concern: it reads spiritual content out loud
 * in the user's chosen `target_lang`, gates by gilded tier, and
 * respects accessibility modes (silent / narrative / interactive).
 * ──────────────────────────────────────────────────────────────────
 */
import React, {
  createContext, useCallback, useContext, useEffect, useMemo, useRef, useState,
} from 'react';
import axios from 'axios';

const VoiceInteractionContext = createContext(null);

const STORAGE_VOICE_MODE = 'voice_interaction_mode';

const DEFAULT_FEATURES = {
  voice_modes: ['tactile', 'narrative'],
  tts_quality: 'browser',
  translation_text: true,
  translation_voice: false,
  sacred_language_mode: false,
  stt_listening: false,
};

// Browser SpeechSynthesis voice-language hint map.
// Browsers don't ship native Hawaiian/Cantonese/Urdu voices on most
// devices — fallbacks chosen to give the closest pronunciation envelope.
const SYNTH_LANG_MAP = {
  en:  'en-US',
  haw: 'en-US', // closest Polynesian-English approximation
  zh:  'zh-CN', // Mandarin — Simplified
  yue: 'zh-HK', // Cantonese — Traditional, Hong Kong locale
  hi:  'hi-IN',
  ur:  'ur-PK', // Urdu — Pakistan locale (Nastaliq)
  es:  'es-ES',
  fr:  'fr-FR',
  ja:  'ja-JP',
  ar:  'ar-SA',
  pt:  'pt-BR',
};

export function VoiceInteractionProvider({ children }) {
  const [voiceMode, setVoiceModeState] = useState(() => {
    try { return localStorage.getItem(STORAGE_VOICE_MODE) || 'tactile'; }
    catch { return 'tactile'; }
  });
  const [tier, setTier] = useState('discovery');
  const [features, setFeatures] = useState(DEFAULT_FEATURES);
  const [supportedLangs, setSupportedLangs] = useState([]);
  const [speaking, setSpeaking] = useState(false);
  const [lastError, setLastError] = useState(null);
  const utteranceRef = useRef(null);

  // Persist voiceMode whenever it flips.
  useEffect(() => {
    try { localStorage.setItem(STORAGE_VOICE_MODE, voiceMode); } catch (e) { if (process.env.NODE_ENV !== 'production') console.warn(e); }
  }, [voiceMode]);

  // Fetch tier features once auth is ready.
  useEffect(() => {
    const token = (() => {
      try { return localStorage.getItem('zen_token'); } catch { return null; }
    })();
    if (!token || token === 'guest_token') return;
    const url = `${process.env.REACT_APP_BACKEND_URL}/api/voice/tier-features`;
    axios.get(url, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => {
        if (r.data) {
          setTier(r.data.tier || 'discovery');
          setFeatures({ ...DEFAULT_FEATURES, ...(r.data.features || {}) });
          setSupportedLangs(r.data.supported_languages || []);
        }
      })
      .catch(() => { /* silent — keep defaults */ });
  }, []);

  const setVoiceMode = useCallback((m) => {
    if (!features.voice_modes.includes(m)) {
      setLastError(`'${m}' requires a higher gilded tier`);
      return false;
    }
    setVoiceModeState(m);
    setLastError(null);
    return true;
  }, [features.voice_modes]);

  // speak(text, lang) — browser TTS. Returns a promise that resolves
  // when speech ends (or rejects if interrupted/blocked).
  const speak = useCallback((text, lang = 'en') => new Promise((resolve, reject) => {
    if (voiceMode === 'tactile') return resolve(false); // silent honored
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      setLastError('Speech synthesis unavailable on this device');
      return reject(new Error('no-speech-synthesis'));
    }
    try {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(String(text || '').slice(0, 4000));
      u.lang = SYNTH_LANG_MAP[lang] || 'en-US';
      u.rate = 0.95;
      u.pitch = 1.0;
      u.volume = 1.0;
      u.onstart = () => setSpeaking(true);
      u.onend = () => { setSpeaking(false); resolve(true); };
      u.onerror = (e) => { setSpeaking(false); reject(e.error || e); };
      utteranceRef.current = u;
      window.speechSynthesis.speak(u);
    } catch (e) {
      setSpeaking(false);
      reject(e);
    }
  }), [voiceMode]);

  const stopSpeaking = useCallback(() => {
    try {
      if (window.speechSynthesis) window.speechSynthesis.cancel();
      setSpeaking(false);
    } catch (e) { if (process.env.NODE_ENV !== 'production') console.warn(e); }
  }, []);

  // translate(text, target_lang, sacred?) — async POST to backend.
  const translate = useCallback(async (text, targetLang, sacred = false) => {
    const token = localStorage.getItem('zen_token');
    if (!token || token === 'guest_token') {
      throw new Error('Translator requires sign-in');
    }
    const url = `${process.env.REACT_APP_BACKEND_URL}/api/translator/translate`;
    const r = await axios.post(
      url,
      { text, target_lang: targetLang, sacred: !!sacred },
      { headers: { Authorization: `Bearer ${token}` }, timeout: 35000 },
    );
    return r.data;
  }, []);

  const value = useMemo(() => ({
    voiceMode,
    setVoiceMode,
    speak,
    stopSpeaking,
    speaking,
    translate,
    tier,
    features,
    supportedLangs,
    lastError,
  }), [voiceMode, setVoiceMode, speak, stopSpeaking, speaking, translate, tier, features, supportedLangs, lastError]);

  return (
    <VoiceInteractionContext.Provider value={value}>
      {children}
    </VoiceInteractionContext.Provider>
  );
}

export function useVoiceInteraction() {
  const ctx = useContext(VoiceInteractionContext);
  if (!ctx) {
    // Safe fallback so consumers never crash if mounted outside provider.
    return {
      voiceMode: 'tactile',
      setVoiceMode: () => false,
      speak: async () => false,
      stopSpeaking: () => {},
      speaking: false,
      translate: async () => ({ translation: '', tier: 'discovery' }),
      tier: 'discovery',
      features: DEFAULT_FEATURES,
      supportedLangs: [],
      lastError: null,
    };
  }
  return ctx;
}
