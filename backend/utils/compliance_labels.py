"""
backend/utils/compliance_labels.py — V1.2.4 Boundary Translation Layer
═══════════════════════════════════════════════════════════════════════

Single source of truth for translating canonical, internally-stable
domain keys / module IDs / legacy-authored strings into user-visible,
Play-Store-safe labels at the API serialization boundary.

Why translate at the boundary instead of renaming the canonical keys?
-------------------------------------------------------------------
"Healing Arts" is referenced by:
  • SKILL_DOMAINS registry         (rpg.py)
  • Hybrid-title quest requirements (rpg.py)
  • Historical mastery DB rows     (per-user mastery records)
  • Workshop module metadata        (workshop_v60.py)
  • Test fixtures                  (test_v57_passport.py, test_v64_oracle_search.py)

Renaming the canonical key would silently break every existing player's
quest progress and cached client state. Boundary translation is the
non-destructive, auditable solution.

Usage
-----
    from utils.compliance_labels import display_domain, display_text

    return {
        "domain": display_domain(meta["domain"]),
        "subtitle": display_text(meta["subtitle"]),
        ...
    }
"""

# Canonical-domain → display-label map.
DOMAIN_DISPLAY = {
    "Healing Arts": "Resonant Arts",
    "healing arts": "Resonant Arts",
    "healing_arts": "Resonant Arts",
}

# Module ID → display label (for "Aromatherapy", "Light Therapy" cards).
MODULE_NAME_DISPLAY = {
    "Aromatherapy": "Aromatic Resonance",
    "Light Therapy": "Light Resonance",
    "Sound Healing": "Sound Resonance",
    "Crystal Healing": "Crystal Resonance",
    "Reiki Healing": "Reiki Alignment",
    "Frequency Therapy": "Frequency Alignment",
    "Chromotherapy": "Chromatic Resonance",
}

# Substring replacements applied to long-form copy / subtitles / descriptions.
# Preserves canonical keys (won't touch a field literally equal to "Healing Arts"
# since DOMAIN_DISPLAY handles that path; this one runs on free-form text).
TEXT_REPLACEMENTS = (
    ("Healing Arts Cell", "Resonant Arts Cell"),
    ("Healing Arts",      "Resonant Arts"),
    ("Healing Pillar",    "Resonance Pillar"),
    ("Sound Healing",     "Sound Resonance"),
    ("sound healing",     "sound resonance"),
    ("Crystal Healing",   "Crystal Resonance"),
    ("crystal healing",   "crystal resonance"),
    ("Reiki Healing",     "Reiki Alignment"),
    ("Frequency Therapy", "Frequency Alignment"),
    ("frequency therapy", "frequency alignment"),
    ("Chromotherapy",     "Chromatic Resonance"),
    ("chromotherapy",     "chromatic resonance"),
    ("Sound healing",     "Sound resonance"),
    ("Light Therapy",     "Light Resonance"),
    ("light therapy",     "light resonance"),
    ("Aromatherapy",      "Aromatic Resonance"),
    ("aromatherapy",      "aromatic resonance"),
    ("therapeutic modality", "resonant practice"),
    ("therapeutic modalities", "resonant practices"),
    ("heal the land",     "regenerate the land"),
)

def display_domain(domain: str) -> str:
    """Translate a canonical domain key to a user-visible display label."""
    if not isinstance(domain, str):
        return domain
    return DOMAIN_DISPLAY.get(domain, domain)

def display_text(s: str) -> str:
    """
    Apply user-facing text replacements without changing canonical keys.
    Pass any subtitle / description / long-form copy through this before
    serializing to the API response.
    """
    if not isinstance(s, str) or not s:
        return s
    out = s
    for old, new in TEXT_REPLACEMENTS:
        out = out.replace(old, new)
    return out

def display_module_name(name: str) -> str:
    """Translate a module display name (e.g., 'Aromatherapy' → 'Aromatic Resonance')."""
    if not isinstance(name, str):
        return name
    return MODULE_NAME_DISPLAY.get(name, name)

def safe_module(d: dict, fields=("name", "title", "subtitle", "desc", "description", "label", "tagline", "category")) -> dict:
    """
    Return a shallow copy of dict `d` with any string in the given fields
    passed through `display_text` and `display_module_name`. Use for
    serializing module/recommendation/discovery cards.
    """
    if not isinstance(d, dict):
        return d
    out = dict(d)
    for k in fields:
        if k in out:
            v = out[k]
            if isinstance(v, str):
                out[k] = display_module_name(display_text(v))
    if "domain" in out and isinstance(out["domain"], str):
        out["domain"] = display_domain(out["domain"])
    return out
