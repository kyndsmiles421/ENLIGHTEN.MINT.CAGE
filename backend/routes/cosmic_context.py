from fastapi import APIRouter, Depends
from deps import db, get_current_user, logger
from datetime import datetime, timezone
from collections import Counter
import asyncio

router = APIRouter()


@router.get("/cosmic-context")
async def get_cosmic_context(user=Depends(get_current_user)):
    """Unified cosmic snapshot for the current user — consumed by every page for cross-system interconnection."""
    uid = user["id"]

    # Gather all cosmic data in parallel
    (
        profile_doc, aura_doc, streak_doc,
        recent_moods, dream_count, recent_dreams,
        yoga_ct, meditation_ct, reiki_ct, acu_ct,
        oils, herbs, journal_ct,
    ) = await asyncio.gather(
        db.profiles.find_one({"user_id": uid}, {"_id": 0}),
        db.aura_readings.find_one({"user_id": uid}, {"_id": 0}, sort=[("created_at", -1)]),
        db.streaks.find_one({"user_id": uid}, {"_id": 0}),
        db.moods.find({"user_id": uid}, {"_id": 0, "mood": 1, "intensity": 1}).sort("created_at", -1).to_list(10),
        db.dreams.count_documents({"user_id": uid}),
        db.dreams.find({"user_id": uid}, {"_id": 0, "id": 1, "title": 1, "mood": 1, "moon_phase": 1, "symbols": 1, "created_at": 1}).sort("created_at", -1).to_list(5),
        db.yoga_sessions.count_documents({"user_id": uid}),
        db.custom_meditations.count_documents({"user_id": uid}),
        db.reiki_sessions.count_documents({"user_id": uid}),
        db.acupressure_sessions.count_documents({"user_id": uid}),
        db.aroma_favorites.find({"user_id": uid}, {"_id": 0, "oil_id": 1}).to_list(10),
        db.herb_cabinet.find({"user_id": uid}, {"_id": 0, "herb_id": 1}).to_list(10),
        db.journal.count_documents({"user_id": uid}),
    )

    # Compute today's cosmic alignment
    today = datetime.now(timezone.utc).date()

    # Moon phase
    from routes.cosmic_calendar import _personal_year, _personal_month, _personal_day, PERSONAL_YEAR_MEANINGS
    import math
    year, month, day = today.year, today.month, today.day
    if month <= 2:
        y_calc = year - 1
        m_calc = month + 12
    else:
        y_calc = year
        m_calc = month
    A = y_calc // 100
    B = A // 4
    C = 2 - A + B
    E = int(365.25 * (y_calc + 4716))
    F = int(30.6001 * (m_calc + 1))
    JD = C + day + E + F - 1524.5
    days_since = JD - 2451550.1
    new_moons = days_since / 29.530588853
    phase_frac = new_moons - int(new_moons)
    moon_age = phase_frac * 29.530588853
    phases = [
        (1.85, "New Moon", "new_moon"), (5.53, "Waxing Crescent", "waxing_crescent"),
        (9.22, "First Quarter", "first_quarter"), (12.91, "Waxing Gibbous", "waxing_gibbous"),
        (16.61, "Full Moon", "full_moon"), (20.30, "Waning Gibbous", "waning_gibbous"),
        (23.99, "Last Quarter", "last_quarter"), (27.68, "Waning Crescent", "waning_crescent"),
        (29.54, "New Moon", "new_moon"),
    ]
    moon_name, moon_code = "New Moon", "new_moon"
    for threshold, name, code in phases:
        if moon_age < threshold:
            moon_name, moon_code = name, code
            break

    # Mayan today
    from routes.mayan import get_mayan_sign
    mayan_today = get_mayan_sign(today.year, today.month, today.day)

    # Numerology (use birth date from profile if available)
    birth_date = profile_doc.get("birth_date", "") if profile_doc else ""
    numerology = None
    if birth_date:
        try:
            parts = birth_date.split("-")
            by, bm, bd = int(parts[0]), int(parts[1]), int(parts[2])
            py = _personal_year(bm, bd, today.year)
            pm = _personal_month(py, today.month)
            pd = _personal_day(pm, today.day)
            py_info = PERSONAL_YEAR_MEANINGS.get(py, PERSONAL_YEAR_MEANINGS.get(1, {}))
            pd_info = PERSONAL_YEAR_MEANINGS.get(pd, PERSONAL_YEAR_MEANINGS.get(1, {}))
            numerology = {
                "personal_year": {"number": py, "theme": py_info.get("theme", ""), "color": py_info.get("color", "#FCD34D")},
                "personal_day": {"number": pd, "theme": pd_info.get("theme", ""), "color": pd_info.get("color", "#FCD34D")},
                "life_path": profile_doc.get("life_path", ""),
            }
        except Exception:
            pass

    # Aura
    aura_color = aura_doc.get("aura_color", "") if aura_doc else ""

    # Streak & mood
    streak = streak_doc.get("current_streak", 0) if streak_doc else 0
    moods = [m.get("mood", "") for m in recent_moods]
    dominant_mood = max(set(moods), key=moods.count) if moods else "neutral"

    # Practice counts
    practices = {
        "yoga": yoga_ct, "meditation": meditation_ct, "reiki": reiki_ct,
        "acupressure": acu_ct, "journal": journal_ct, "dreams": dream_count,
    }

    # Dream symbols aggregate
    all_symbols = []
    for d in recent_dreams:
        all_symbols.extend(d.get("symbols", []))
    recurring_symbols = [s for s, c in Counter(all_symbols).most_common(5) if c > 0]

    # Build practice suggestions based on cosmic alignment
    suggestions = _build_suggestions(mayan_today, moon_name, dominant_mood, aura_color, practices)

    return {
        "date": today.isoformat(),
        "moon": {"phase": moon_name, "code": moon_code},
        "mayan": {
            "kin": mayan_today["kin"],
            "glyph": mayan_today["sign"]["glyph"],
            "sign_name": mayan_today["sign"]["name"],
            "tone": mayan_today["tone"]["name"],
            "element": mayan_today["sign"]["element"],
            "galactic_signature": mayan_today["galactic_signature"],
            "meaning": mayan_today["sign"]["meaning"],
        },
        "numerology": numerology,
        "aura_color": aura_color,
        "streak": streak,
        "dominant_mood": dominant_mood,
        "practices": practices,
        "recent_dreams": recent_dreams,
        "recurring_symbols": recurring_symbols,
        "suggestions": suggestions,
    }


def _build_suggestions(mayan, moon_phase, mood, aura, practices):
    """Generate personalized practice suggestions based on current cosmic alignment."""
    suggestions = []
    element = mayan["sign"]["element"]
    glyph = mayan["sign"]["glyph"]

    # Element-based suggestions
    element_map = {
        "Fire": {"yoga": "Sun Salutation Flow", "oil": "Cinnamon or Ginger", "herb": "Ginger Root", "acupoint": "LI4 (Hegu)"},
        "Water": {"yoga": "Moon Salutation Flow", "oil": "Chamomile or Ylang Ylang", "herb": "Passionflower", "acupoint": "KD1 (Yongquan)"},
        "Air": {"yoga": "Breath of Fire Pranayama", "oil": "Eucalyptus or Peppermint", "herb": "Ginkgo Biloba", "acupoint": "LU7 (Lieque)"},
        "Earth": {"yoga": "Grounding Warrior Sequence", "oil": "Vetiver or Patchouli", "herb": "Ashwagandha", "acupoint": "ST36 (Zu San Li)"},
    }
    em = element_map.get(element, element_map["Earth"])
    suggestions.append({"type": "yoga", "text": f"{em['yoga']} — aligned with today's {element} energy ({glyph})", "link": "/exercises"})
    suggestions.append({"type": "aromatherapy", "text": f"{em['oil']} essential oil — resonates with {element} element", "link": "/aromatherapy"})
    suggestions.append({"type": "herbology", "text": f"{em['herb']} — supports your {element} alignment today", "link": "/herbology"})
    suggestions.append({"type": "acupressure", "text": f"Press {em['acupoint']} — harmonizes {element} energy flow", "link": "/acupressure"})

    # Moon-based suggestions
    if "New" in moon_phase:
        suggestions.append({"type": "journal", "text": "Set intentions in your journal — New Moon energy supports new beginnings", "link": "/journal"})
    elif "Full" in moon_phase:
        suggestions.append({"type": "meditation", "text": "Full Moon meditation — release what no longer serves you", "link": "/meditation"})
        suggestions.append({"type": "dreams", "text": "Log your dreams tonight — Full Moon amplifies dream vividness", "link": "/dreams"})
    elif "Waning" in moon_phase:
        suggestions.append({"type": "reiki", "text": "Reiki self-healing — waning moon supports energy clearing", "link": "/reiki"})

    # Mood-based
    if mood in ["stressed", "anxious"]:
        suggestions.append({"type": "breathing", "text": "4-7-8 Calming Breath — ease your current energy state", "link": "/breathing"})
    elif mood in ["tired", "low"]:
        suggestions.append({"type": "elixir", "text": "Golden Milk elixir — restore your vitality", "link": "/elixirs"})

    return suggestions[:8]


@router.get("/dreams/patterns")
async def get_dream_patterns(user=Depends(get_current_user)):
    """Analyze recurring dream patterns across the user's dream journal."""
    uid = user["id"]
    dreams = await db.dreams.find(
        {"user_id": uid}, {"_id": 0}
    ).sort("created_at", -1).to_list(200)

    if not dreams:
        return {"total": 0, "patterns": {}, "insights": [], "symbol_frequency": {}, "moon_correlations": {}, "mood_timeline": []}

    # Symbol frequency
    symbol_counts = Counter()
    for d in dreams:
        for s in d.get("symbols", []):
            symbol_counts[s] += 1
    top_symbols = dict(symbol_counts.most_common(15))

    # Moon phase correlations
    moon_symbol_map = {}
    moon_mood_map = {}
    for d in dreams:
        mp = d.get("moon_phase", "Unknown")
        mood = d.get("mood", "neutral")
        if mp not in moon_mood_map:
            moon_mood_map[mp] = []
        moon_mood_map[mp].append(mood)
        for s in d.get("symbols", []):
            key = f"{s}|{mp}"
            if key not in moon_symbol_map:
                moon_symbol_map[key] = 0
            moon_symbol_map[key] += 1

    # Find notable moon-symbol correlations
    moon_correlations = []
    for key, count in sorted(moon_symbol_map.items(), key=lambda x: -x[1]):
        if count >= 2:
            symbol, phase = key.split("|")
            moon_correlations.append({"symbol": symbol, "moon_phase": phase, "count": count})
    moon_correlations = moon_correlations[:10]

    # Mood timeline (last 20 dreams)
    mood_timeline = []
    for d in dreams[:20]:
        mood_timeline.append({
            "date": d.get("created_at", ""),
            "mood": d.get("mood", "neutral"),
            "vividness": d.get("vividness", 5),
            "moon_phase": d.get("moon_phase", ""),
            "title": d.get("title", "Untitled"),
        })

    # Moon phase mood analysis
    moon_moods = {}
    for phase, moods in moon_mood_map.items():
        dominant = max(set(moods), key=moods.count) if moods else "neutral"
        moon_moods[phase] = {"dominant_mood": dominant, "count": len(moods)}

    # Lucid dream stats
    lucid_count = sum(1 for d in dreams if d.get("lucid"))
    avg_vividness = sum(d.get("vividness", 5) for d in dreams) / len(dreams)

    # Generate insights
    insights = _generate_dream_insights(dreams, top_symbols, moon_correlations, moon_moods, lucid_count, avg_vividness)

    return {
        "total": len(dreams),
        "symbol_frequency": top_symbols,
        "moon_correlations": moon_correlations,
        "moon_moods": moon_moods,
        "mood_timeline": mood_timeline,
        "lucid_count": lucid_count,
        "avg_vividness": round(avg_vividness, 1),
        "insights": insights,
    }


def _generate_dream_insights(dreams, symbols, moon_corr, moon_moods, lucid_ct, avg_vivid):
    """Generate textual insights from dream pattern data."""
    insights = []

    if len(dreams) >= 5:
        insights.append({
            "type": "milestone",
            "title": f"Dream Archive: {len(dreams)} Dreams",
            "text": f"You've logged {len(dreams)} dreams — your subconscious map is growing richer with each entry.",
            "color": "#818CF8",
        })

    # Top symbol insight
    if symbols:
        top_sym = list(symbols.keys())[0]
        top_ct = list(symbols.values())[0]
        if top_ct >= 3:
            insights.append({
                "type": "recurring_symbol",
                "title": f"Recurring Symbol: {top_sym.title()}",
                "text": f"{top_sym.title()} has appeared in {top_ct} of your dreams. This symbol is calling for your attention — it carries a message your psyche is trying to deliver.",
                "color": "#A78BFA",
            })

    # Moon correlation insight
    if moon_corr:
        mc = moon_corr[0]
        insights.append({
            "type": "moon_pattern",
            "title": f"{mc['symbol'].title()} + {mc['moon_phase']}",
            "text": f"{mc['symbol'].title()} has appeared {mc['count']} times during the {mc['moon_phase']}. The lunar cycle is amplifying this symbol's presence in your dreamscape.",
            "color": "#93C5FD",
        })

    # Moon mood insight
    for phase, data in moon_moods.items():
        if data["count"] >= 3:
            insights.append({
                "type": "moon_mood",
                "title": f"{phase} Dreams: {data['dominant_mood'].title()}",
                "text": f"During the {phase}, your dreams tend to feel {data['dominant_mood']}. This lunar phase activates specific emotional frequencies in your subconscious.",
                "color": "#FCD34D",
            })
            break

    # Lucid dreaming
    if lucid_ct > 0:
        pct = round((lucid_ct / len(dreams)) * 100)
        insights.append({
            "type": "lucid",
            "title": f"Lucid Awareness: {pct}%",
            "text": f"{lucid_ct} of your {len(dreams)} dreams were lucid ({pct}%). Your consciousness is expanding into the dream state — a sign of growing spiritual awareness.",
            "color": "#22C55E",
        })

    # Vividness
    if avg_vivid >= 7:
        insights.append({
            "type": "vividness",
            "title": "Vivid Dreamer",
            "text": f"Your average dream vividness is {avg_vivid}/10 — you have an exceptionally rich inner visual world. Your third eye chakra is active.",
            "color": "#D8B4FE",
        })

    return insights
