"""
V68.86 — Frequency Dial + Reader-Translator Pillar Bridge.

Audit-first execution: USES existing infrastructure rather than
building parallel systems.

Locks:
  • LanguageContext exposes useLanguageFrequency() — one-line consumer
    for any component that wants the active language's base Hz +
    waveform without re-importing the deep registry.
  • usePhoneticSynthesizer recognizes the new lyrical_flow (Urdu) and
    aloha_breath (Hawaiian) phonetic characters.
  • TranslateChip component exists and is wired into Bible.js (the
    sacred-text pillar most likely to be read by Sovereign owners).
  • TranslateChip uses the V68.84 translate() pipeline — no new
    backend route, no parallel translator.
"""
import pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent.parent  # /app


def _read(rel: str) -> str:
    return (ROOT / rel).read_text(encoding="utf-8")


def test_use_language_frequency_helper_exists():
    js = _read("frontend/src/context/LanguageContext.js")
    assert "export function useLanguageFrequency" in js, \
        "useLanguageFrequency hook must be exported from LanguageContext"
    assert "baseFrequency" in js
    assert "resonantPeaks" in js


def test_phonetic_synth_handles_lyrical_and_aloha():
    js = _read("frontend/src/hooks/usePhoneticSynthesizer.js")
    # The two new phonetic characters (V68.85) must be reachable from
    # the switch statement so playPhoneticBurst doesn't fall through
    # silently to an unintended branch.
    assert "'lyrical_flow'" in js, "Urdu lyrical_flow must be a recognized character"
    assert "'aloha_breath'" in js, "Hawaiian aloha_breath must be a recognized character"


def test_translate_chip_component_exists():
    js = _read("frontend/src/components/TranslateChip.jsx")
    assert "export default function TranslateChip" in js
    # Must use existing V68.84 plumbing, not a parallel translator.
    assert "useVoiceInteraction" in js, \
        "TranslateChip must use the existing translate() helper"
    assert "useLanguage" in js, \
        "TranslateChip must read the active language from LanguageContext"
    # Flatland-compliant — inline span, no overlay/portal.
    assert "<span" in js
    # Sacred-mode passthrough so Sovereign owners see etymology.
    assert "sacred" in js


def test_bible_pillar_imports_translate_chip():
    js = _read("frontend/src/pages/Bible.js")
    assert "import TranslateChip from '../components/TranslateChip'" in js, \
        "Bible.js must import TranslateChip"
    # All three sections (retelling, key_verses, commentary) get a chip.
    assert js.count("<TranslateChip") >= 3, \
        "Bible.js must render TranslateChip for retelling, key_verses, and commentary"
    # State plumbing for the swap-in-place result.
    assert "translatedRetelling" in js
    assert "translatedVerses" in js
    assert "translatedCommentary" in js


def test_bible_clears_translations_on_chapter_swap():
    """A user navigating to chapter N+1 should NOT see chapter N's
    translation pinned to fresh source text. Reset on chapter change."""
    js = _read("frontend/src/pages/Bible.js")
    # The reset block lives in the chapter-fetch effect.
    assert "setTranslatedRetelling(null)" in js
    assert "setTranslatedVerses(null)" in js
    assert "setTranslatedCommentary(null)" in js


def test_translate_chip_does_not_introduce_parallel_translator_route():
    """Audit-first guard: the chip must NOT call /api/translate or any
    new endpoint — only the V68.84 useVoiceInteraction.translate()
    helper which routes through /api/translator/translate. This keeps
    the dual-translator contract clean (public/paid/cached vs sovereign)."""
    js = _read("frontend/src/components/TranslateChip.jsx")
    assert "/api/translate" not in js, \
        "TranslateChip must not bypass the V68.84 translate() helper"
    # Should call the helper, not axios directly.
    assert "axios" not in js, \
        "TranslateChip must use translate() helper, not raw axios"
