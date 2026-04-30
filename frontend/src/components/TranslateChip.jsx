/**
 * TranslateChip.jsx — V68.86 Reader-Translator Bridge
 *
 * Tiny inline pill that drops next to any text block (Bible verses,
 * Sacred-Texts paragraphs, Oracle hexagram readings) and translates it
 * into the user's selected language using the existing V68.84
 * /api/translator/translate endpoint.
 *
 * Why this lives as its own component:
 *   • Flatland-compliant: no overlay, just an inline button + a
 *     swap-in-place result.
 *   • Self-contained loading + error state.
 *   • Re-clicking toggles back to the original (no duplicate work).
 *
 * Usage:
 *   <p>
 *     {translated ?? originalText}
 *     <TranslateChip text={originalText} onSwap={setTranslated} />
 *   </p>
 *
 * Reads from useVoiceInteraction().translate so the same backend
 * pipeline used for auto-narration powers the inline reader bridge.
 */
import React, { useState, useCallback } from 'react';
import { Languages, Loader2, RotateCcw, BookOpen } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useVoiceInteraction } from '../context/VoiceInteractionContext';
import { toast } from 'sonner';

export default function TranslateChip({ text, onSwap, sacred = false, compact = false }) {
  const { language, deepProfile } = useLanguage();
  const { translate, features, speak } = useVoiceInteraction();
  const [loading, setLoading] = useState(false);
  const [translatedText, setTranslatedText] = useState(null);
  const [sacredNote, setSacredNote] = useState(null);

  const wantSacred = sacred && features.sacred_language_mode;
  const isToggled = translatedText !== null;
  const flickerGlyph = deepProfile?.zeroPoint?.flickerGlyph;

  const handleClick = useCallback(async () => {
    if (loading) return;
    if (isToggled) {
      // Toggle back to the original text.
      setTranslatedText(null);
      setSacredNote(null);
      onSwap?.(null);
      return;
    }
    if (language === 'en') {
      toast.info('Already English — pick another language to translate.');
      return;
    }
    setLoading(true);
    try {
      const r = await translate(text, language, wantSacred);
      setTranslatedText(r.translation);
      setSacredNote(r.sacred_note || null);
      onSwap?.(r.translation);
      // Auto-narrate if user has Narrative/Interactive mode on.
      speak(r.translation, language).catch(() => {});
    } catch (e) {
      toast.error('Translation failed. Try again or pick another language.');
    } finally {
      setLoading(false);
    }
  }, [loading, isToggled, language, text, wantSacred, translate, onSwap, speak]);

  const Icon = loading ? Loader2 : isToggled ? RotateCcw : Languages;

  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginLeft: 6 }}>
      <button
        type="button"
        data-testid="translate-chip"
        data-active={isToggled || undefined}
        onClick={handleClick}
        disabled={loading}
        title={
          isToggled
            ? 'Show original'
            : `Translate to ${language.toUpperCase()}${wantSacred ? ' · Sacred Mode' : ''}`
        }
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 5,
          padding: compact ? '2px 8px' : '4px 10px',
          borderRadius: 999,
          background: isToggled
            ? 'rgba(244,114,182,0.14)'
            : 'rgba(34,211,238,0.10)',
          border: `1px solid ${isToggled ? 'rgba(244,114,182,0.42)' : 'rgba(34,211,238,0.34)'}`,
          color: isToggled ? '#F9A8D4' : '#67E8F9',
          fontSize: compact ? 9 : 10,
          fontFamily: 'monospace',
          letterSpacing: '0.10em',
          textTransform: 'uppercase',
          cursor: loading ? 'wait' : 'pointer',
          verticalAlign: 'middle',
          opacity: loading ? 0.7 : 1,
          transition: 'background-color 180ms ease, color 180ms ease',
        }}
      >
        <Icon size={compact ? 9 : 10} className={loading ? 'animate-spin' : ''} />
        {flickerGlyph && !compact && (
          <span aria-hidden="true" style={{ opacity: 0.85 }}>{flickerGlyph}</span>
        )}
        {language.toUpperCase()}
        {wantSacred && !compact && <BookOpen size={9} style={{ marginLeft: 2 }} />}
      </button>
      {sacredNote && !compact && (
        <span
          data-testid="translate-chip-sacred-note"
          style={{
            fontSize: 10,
            color: '#F9A8D4',
            fontStyle: 'italic',
            maxWidth: 320,
            opacity: 0.88,
          }}
        >
          {sacredNote}
        </span>
      )}
    </span>
  );
}
