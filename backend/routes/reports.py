from fastapi import APIRouter, HTTPException, Depends, Body
from deps import db, get_current_user, logger, EMERGENT_LLM_KEY
from datetime import datetime, timezone, timedelta
import os

router = APIRouter()

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  COSMIC INSIGHTS — Featured Reports & Analytics
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ZODIAC_SEASONS = [
    {"sign": "Capricorn", "element": "Earth", "start": (12, 22), "end": (1, 19)},
    {"sign": "Aquarius", "element": "Air", "start": (1, 20), "end": (2, 18)},
    {"sign": "Pisces", "element": "Water", "start": (2, 19), "end": (3, 20)},
    {"sign": "Aries", "element": "Fire", "start": (3, 21), "end": (4, 19)},
    {"sign": "Taurus", "element": "Earth", "start": (4, 20), "end": (5, 20)},
    {"sign": "Gemini", "element": "Air", "start": (5, 21), "end": (6, 20)},
    {"sign": "Cancer", "element": "Water", "start": (6, 21), "end": (7, 22)},
    {"sign": "Leo", "element": "Fire", "start": (7, 23), "end": (8, 22)},
    {"sign": "Virgo", "element": "Earth", "start": (8, 23), "end": (9, 22)},
    {"sign": "Libra", "element": "Air", "start": (9, 23), "end": (10, 22)},
    {"sign": "Scorpio", "element": "Water", "start": (10, 23), "end": (11, 21)},
    {"sign": "Sagittarius", "element": "Fire", "start": (11, 22), "end": (12, 21)},
]

ELEMENT_STATS = {
    "Fire": {"resonance": 10, "focus": 5},
    "Water": {"harmony": 10, "wisdom": 5},
    "Earth": {"vitality": 10, "harmony": 5},
    "Air": {"wisdom": 10, "focus": 5},
}

ELEMENT_MIXER_ADVICE = {
    "Fire": {"freq": "528Hz", "sound": "Crackling Fire", "tip": "Channel transformative energy with 528Hz healing frequencies"},
    "Water": {"freq": "432Hz", "sound": "Ocean Waves", "tip": "Flow with lunar rhythms using 432Hz and water sounds"},
    "Earth": {"freq": "396Hz", "sound": "Forest Rain", "tip": "Ground yourself with 396Hz liberation frequencies"},
    "Air": {"freq": "741Hz", "sound": "Wind Chimes", "tip": "Expand consciousness with 741Hz intuition frequencies"},
}

ELEMENT_TEXT_ADVICE = {
    "Fire": "Bhagavad Gita or Book of Revelation — texts of transformation and divine fire",
    "Water": "Psalms, Sufi poetry, or Tao Te Ching — texts of flow and surrender",
    "Earth": "Proverbs, Dhammapada, or I Ching — texts of wisdom and stability",
    "Air": "Upanishads, Gospel of Thomas, or Rumi — texts of transcendence and breath",
}


def get_current_zodiac():
    now = datetime.now(timezone.utc)
    m, d = now.month, now.day
    for z in ZODIAC_SEASONS:
        sm, sd = z["start"]
        em, ed = z["end"]
        if sm > em:  # Wraps around year (Capricorn)
            if (m == sm and d >= sd) or (m == em and d <= ed) or m > sm or m < em:
                return z
        else:
            if (m == sm and d >= sd) or (m == em and d <= ed) or (sm < m < em):
                return z
    return ZODIAC_SEASONS[0]


def get_lunar_phase():
    """Approximate lunar phase from date."""
    now = datetime.now(timezone.utc)
    known_new = datetime(2024, 1, 11, tzinfo=timezone.utc)
    days_since = (now - known_new).days
    cycle_day = days_since % 29.53
    if cycle_day < 1.85:
        return {"phase": "New Moon", "icon": "new_moon", "energy": "intention setting", "xp_bonus": 0}
    elif cycle_day < 7.38:
        return {"phase": "Waxing Crescent", "icon": "waxing_crescent", "energy": "building momentum", "xp_bonus": 5}
    elif cycle_day < 9.23:
        return {"phase": "First Quarter", "icon": "first_quarter", "energy": "taking action", "xp_bonus": 10}
    elif cycle_day < 14.76:
        return {"phase": "Waxing Gibbous", "icon": "waxing_gibbous", "energy": "refinement", "xp_bonus": 10}
    elif cycle_day < 16.61:
        return {"phase": "Full Moon", "icon": "full_moon", "energy": "manifestation & release", "xp_bonus": 25}
    elif cycle_day < 22.15:
        return {"phase": "Waning Gibbous", "icon": "waning_gibbous", "energy": "gratitude", "xp_bonus": 10}
    elif cycle_day < 24.0:
        return {"phase": "Last Quarter", "icon": "last_quarter", "energy": "letting go", "xp_bonus": 5}
    else:
        return {"phase": "Waning Crescent", "icon": "waning_crescent", "energy": "rest & reflection", "xp_bonus": 0}


@router.get("/reports/cosmic-weather")
async def get_cosmic_weather(user=Depends(get_current_user)):
    """Daily cosmic weather — free tier transit alert + tool recommendations."""
    zodiac = get_current_zodiac()
    lunar = get_lunar_phase()
    element = zodiac["element"]
    mixer = ELEMENT_MIXER_ADVICE.get(element, ELEMENT_MIXER_ADVICE["Fire"])
    text = ELEMENT_TEXT_ADVICE.get(element, ELEMENT_TEXT_ADVICE["Fire"])
    stats = ELEMENT_STATS.get(element, {})

    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")

    # Check if AI forecast already generated today
    cached = await db.cosmic_weather_cache.find_one(
        {"date": today}, {"_id": 0}
    )

    if cached and cached.get("forecast"):
        ai_forecast = cached["forecast"]
    else:
        try:
            from emergentintegrations.llm.chat import LlmChat, UserMessage
            import uuid as _uuid
            chat = LlmChat(
                api_key=EMERGENT_LLM_KEY,
                session_id=f"weather-{today}-{_uuid.uuid4().hex[:6]}",
                system_message=(
                    f"You are the Cosmic Oracle for The Cosmic Collective wellness app. "
                    f"Today the Sun is in {zodiac['sign']} ({element} element) and the Moon is in its {lunar['phase']} phase. "
                    f"Write a brief, mystical yet practical daily cosmic weather report in 3-4 sentences. "
                    f"Include: 1) The overall energy theme, 2) A specific wellness recommendation, "
                    f"3) What RPG activities are boosted today. Keep it warm and encouraging."
                ),
            )
            chat.with_model("gemini", "gemini-3-flash-preview")
            import asyncio
            ai_forecast = await asyncio.wait_for(
                chat.send_message(UserMessage(text=f"Generate today's cosmic weather for {today}")),
                timeout=15,
            )
            ai_forecast = ai_forecast.strip()
        except Exception as e:
            logger.error(f"Cosmic weather AI error: {e}")
            ai_forecast = (
                f"The {element} energy of {zodiac['sign']} season fills the cosmos today. "
                f"The {lunar['phase']} amplifies {lunar['energy']}. "
                f"Focus your practice on {mixer['tip'].lower()}."
            )

        await db.cosmic_weather_cache.update_one(
            {"date": today},
            {"$set": {"date": today, "forecast": ai_forecast, "zodiac": zodiac["sign"],
                      "element": element, "lunar": lunar["phase"]}},
            upsert=True,
        )

    # Elemental affinities for RPG
    reset_pulse = element in ("Fire", "Water") and lunar["phase"] in ("Full Moon", "New Moon")

    return {
        "date": today,
        "zodiac": zodiac,
        "lunar": lunar,
        "element": element,
        "forecast": ai_forecast,
        "tool_recommendations": {
            "mixer": mixer,
            "sacred_text": text,
            "reset_pulse": reset_pulse,
            "reset_reason": f"{lunar['phase']} in {zodiac['sign']} — high emotional intensity" if reset_pulse else None,
        },
        "rpg_bonuses": {
            "element": element,
            "stat_boosts": stats,
            "lunar_xp_bonus": lunar["xp_bonus"],
            "description": f"{element}-element gear gains +{list(stats.values())[0]}% to {list(stats.keys())[0]} this season",
        },
    }


@router.get("/reports/insights")
async def get_cosmic_insights(user=Depends(get_current_user)):
    """Weekly cosmic insights — free tier data aggregation."""
    uid = user["id"]
    now = datetime.now(timezone.utc)
    week_ago = (now - timedelta(days=7)).isoformat()
    month_ago = (now - timedelta(days=30)).isoformat()

    # Mood data (last 7 days)
    moods = await db.moods.find(
        {"user_id": uid, "created_at": {"$gte": week_ago}}, {"_id": 0}
    ).to_list(200)

    mood_summary = {}
    hourly_activity = {}
    for m in moods:
        mood_summary[m["mood"]] = mood_summary.get(m["mood"], 0) + 1
        try:
            hour = datetime.fromisoformat(m["created_at"]).hour
            hourly_activity[hour] = hourly_activity.get(hour, 0) + 1
        except Exception:
            pass

    top_mood = max(mood_summary, key=mood_summary.get) if mood_summary else "balanced"
    peak_hours = sorted(hourly_activity.items(), key=lambda x: -x[1])[:3]

    # Meditation data
    meditations = await db.custom_meditations.find(
        {"user_id": uid, "created_at": {"$gte": week_ago}}, {"_id": 0}
    ).to_list(100)
    total_meditation_mins = sum(m.get("duration_minutes", 0) for m in meditations)
    meditation_count = len(meditations)

    # Journal entries
    journals = await db.journal.find(
        {"user_id": uid, "created_at": {"$gte": week_ago}}, {"_id": 0}
    ).to_list(50)
    journal_count = len(journals)
    journal_moods = {}
    for j in journals:
        jm = j.get("mood", "reflective")
        journal_moods[jm] = journal_moods.get(jm, 0) + 1

    # Soundscape mixes
    mixes = await db.custom_soundscapes.find(
        {"user_id": uid, "created_at": {"$gte": week_ago}}, {"_id": 0}
    ).to_list(50)
    sound_frequency = {}
    for mix in mixes:
        for sound_name in mix.get("volumes", {}).keys():
            sound_frequency[sound_name] = sound_frequency.get(sound_name, 0) + 1
    top_sounds = sorted(sound_frequency.items(), key=lambda x: -x[1])[:5]

    # Scripture progress
    scripture = await db.scripture_journey_progress.find(
        {"user_id": uid}, {"_id": 0}
    ).to_list(20)
    scripture_steps = sum(len(s.get("completed_steps", [])) for s in scripture)

    # Quest streaks
    streak_doc = await db.rpg_streaks.find_one({"user_id": uid}, {"_id": 0})
    streak_days = streak_doc.get("days", 0) if streak_doc else 0

    # RPG character
    char = await db.rpg_characters.find_one({"user_id": uid}, {"_id": 0})
    level = char.get("level", 1) if char else 1

    # Build highlights
    highlights = []
    if meditation_count > 0:
        highlights.append({
            "type": "meditation",
            "title": f"{total_meditation_mins} Minutes of Stillness",
            "subtitle": f"{meditation_count} sessions this week",
            "action": "/meditation",
            "action_label": "Meditate",
            "color": "#818CF8",
        })
    if len(top_sounds) > 0:
        highlights.append({
            "type": "soundscape",
            "title": f"Top Sound: {top_sounds[0][0]}",
            "subtitle": f"Used in {top_sounds[0][1]} mixes this week",
            "action": "/soundscapes",
            "action_label": "Open Mixer",
            "color": "#22C55E",
        })
    if mood_summary:
        highlights.append({
            "type": "mood",
            "title": f"Dominant Mood: {top_mood.title()}",
            "subtitle": f"{len(moods)} check-ins this week",
            "action": "/wellness",
            "action_label": "Log Mood",
            "color": "#F59E0B",
        })
    if streak_days > 0:
        highlights.append({
            "type": "streak",
            "title": f"{streak_days}-Day Quest Streak",
            "subtitle": "Keep the momentum going!",
            "action": "/rpg",
            "action_label": "View Quests",
            "color": "#EF4444",
        })

    return {
        "period": "weekly",
        "generated_at": now.isoformat(),
        "highlights": highlights[:4],
        "mood_report": {
            "total_checkins": len(moods),
            "distribution": mood_summary,
            "top_mood": top_mood,
            "peak_hours": [{"hour": h, "count": c} for h, c in peak_hours],
        },
        "meditation_report": {
            "total_minutes": total_meditation_mins,
            "session_count": meditation_count,
            "avg_duration": round(total_meditation_mins / meditation_count, 1) if meditation_count else 0,
        },
        "soundscape_report": {
            "mixes_created": len(mixes),
            "top_sounds": [{"sound": s, "count": c} for s, c in top_sounds],
        },
        "journal_report": {
            "entries": journal_count,
            "mood_themes": journal_moods,
        },
        "scripture_report": {
            "steps_completed": scripture_steps,
            "active_journeys": len(scripture),
        },
        "rpg_summary": {
            "level": level,
            "streak_days": streak_days,
        },
    }


@router.get("/reports/deep-dive")
async def get_deep_dive(user=Depends(get_current_user)):
    """Monthly deep-dive analytics — gem-locked premium report."""
    uid = user["id"]
    now = datetime.now(timezone.utc)
    month_ago = (now - timedelta(days=30)).isoformat()

    # Check if user has premium or purchased this report
    user_doc = await db.users.find_one({"id": uid}, {"_id": 0, "tier": 1, "trial_active": 1})
    is_premium = user_doc and user_doc.get("tier") in ("plus", "premium")
    is_trial = user_doc and user_doc.get("trial_active", False)

    # Check gem purchase
    purchased = await db.rpg_purchases.find_one(
        {"user_id": uid, "item_id": "deep_dive_monthly",
         "purchased_at": {"$gte": (now - timedelta(days=30)).isoformat()}}
    )

    if not is_premium and not is_trial and not purchased:
        # Return locked state with preview
        return {
            "locked": True,
            "cost": 50,
            "currency": "gems",
            "preview": {
                "title": "Deep-Dive Monthly Analysis",
                "features": [
                    "AI-powered habit predictions",
                    "Optimal wellness schedule",
                    "Soundscape synergy correlations",
                    "Mood trend forecasting",
                    "Personalized growth recommendations",
                ],
            },
        }

    # Full report for premium/trial/purchased users
    moods = await db.moods.find(
        {"user_id": uid, "created_at": {"$gte": month_ago}}, {"_id": 0}
    ).to_list(500)

    meditations = await db.custom_meditations.find(
        {"user_id": uid, "created_at": {"$gte": month_ago}}, {"_id": 0}
    ).to_list(200)

    journals = await db.journal.find(
        {"user_id": uid, "created_at": {"$gte": month_ago}}, {"_id": 0}
    ).to_list(100)

    mixes = await db.custom_soundscapes.find(
        {"user_id": uid, "created_at": {"$gte": month_ago}}, {"_id": 0}
    ).to_list(100)

    # Compute weekly trends
    weekly_moods = {}
    mood_by_day = {}
    for m in moods:
        try:
            dt = datetime.fromisoformat(m["created_at"])
            week = dt.isocalendar()[1]
            day = dt.strftime("%A")
            weekly_moods.setdefault(week, []).append(m.get("intensity", 5))
            mood_by_day.setdefault(day, []).append(m.get("intensity", 5))
        except Exception:
            pass

    day_averages = {d: round(sum(v)/len(v), 1) for d, v in mood_by_day.items()}
    best_day = max(day_averages, key=day_averages.get) if day_averages else "Tuesday"
    worst_day = min(day_averages, key=day_averages.get) if day_averages else "Monday"

    # Sound-mood correlation
    sound_mood_map = {}
    for mix in mixes:
        try:
            mix_dt = datetime.fromisoformat(mix["created_at"])
            nearby_moods = [m for m in moods
                           if abs((datetime.fromisoformat(m["created_at"]) - mix_dt).total_seconds()) < 7200]
            if nearby_moods:
                avg_intensity = sum(m.get("intensity", 5) for m in nearby_moods) / len(nearby_moods)
                for sound in mix.get("volumes", {}).keys():
                    sound_mood_map.setdefault(sound, []).append(avg_intensity)
        except Exception:
            pass

    synergy = {s: round(sum(v)/len(v), 1) for s, v in sound_mood_map.items() if len(v) >= 2}
    top_synergy = sorted(synergy.items(), key=lambda x: -x[1])[:5]

    # AI prediction
    try:
        from emergentintegrations.llm.chat import LlmChat, UserMessage
        import uuid as _uuid
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=f"deepdive-{uid[:8]}-{_uuid.uuid4().hex[:6]}",
            system_message=(
                "You are the Cosmic Oracle analytics AI. Based on user wellness data, "
                "generate 3 brief, specific predictions/recommendations. Be mystical yet data-driven. "
                "Format each as: '[Prediction]: [Brief explanation]'. Keep total under 150 words."
            ),
        )
        chat.with_model("gemini", "gemini-3-flash-preview")
        data_summary = (
            f"User data (30 days): {len(moods)} mood logs (best day: {best_day}, worst: {worst_day}), "
            f"{len(meditations)} meditations, {len(journals)} journal entries, {len(mixes)} soundscape sessions. "
            f"Top mood: {max((m.get('mood','calm') for m in moods), default='calm')}. "
            f"Top synergy sounds: {', '.join(s for s,_ in top_synergy[:3])}."
        )
        import asyncio
        predictions = await asyncio.wait_for(
            chat.send_message(UserMessage(text=f"Analyze this wellness data and predict: {data_summary}")),
            timeout=20,
        )
        predictions = predictions.strip()
    except Exception as e:
        logger.error(f"Deep dive AI error: {e}")
        predictions = (
            f"Peak Performance: Your {best_day}s show highest emotional resonance — "
            f"schedule important reflections then.\n"
            f"Sound Healing: Your most effective soundscape combinations align with "
            f"{'water-based' if synergy else 'ambient'} frequencies.\n"
            f"Growth Path: Increase journal consistency to unlock deeper self-awareness patterns."
        )

    return {
        "locked": False,
        "period": "monthly",
        "generated_at": now.isoformat(),
        "mood_trends": {
            "total": len(moods),
            "best_day": best_day,
            "worst_day": worst_day,
            "day_averages": day_averages,
            "weekly_trend": {str(w): round(sum(v)/len(v), 1) for w, v in weekly_moods.items()},
        },
        "soundscape_synergy": {
            "correlations": [{"sound": s, "avg_mood": v} for s, v in top_synergy],
            "total_sessions": len(mixes),
        },
        "meditation_depth": {
            "sessions": len(meditations),
            "total_minutes": sum(m.get("duration_minutes", 0) for m in meditations),
        },
        "journal_analysis": {
            "entries": len(journals),
            "consistency": f"{len(set(j.get('created_at','')[:10] for j in journals))}/30 days",
        },
        "ai_predictions": predictions,
    }


@router.post("/reports/unlock-deep-dive")
async def unlock_deep_dive(user=Depends(get_current_user)):
    """Purchase deep-dive access with Celestial Gems."""
    uid = user["id"]
    cost = 50

    currencies = await db.rpg_currencies.find_one({"user_id": uid}, {"_id": 0})
    gems = currencies.get("stardust_shards", 0) if currencies else 0
    if gems < cost:
        raise HTTPException(402, f"Need {cost} Celestial Gems (you have {gems})")

    await db.rpg_currencies.update_one(
        {"user_id": uid}, {"$inc": {"stardust_shards": -cost}}
    )
    await db.rpg_purchases.insert_one({
        "user_id": uid,
        "item_id": "deep_dive_monthly",
        "item_name": "Deep-Dive Monthly Analysis",
        "cost": cost,
        "currency": "gems",
        "purchased_at": datetime.now(timezone.utc).isoformat(),
    })
    return {"unlocked": True, "cost": cost}


@router.post("/reports/scholar-bonus")
async def claim_scholar_bonus(user=Depends(get_current_user)):
    """Claim +25 XP for viewing the weekly report."""
    uid = user["id"]
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    week_num = datetime.now(timezone.utc).isocalendar()[1]
    bonus_key = f"scholar_{datetime.now(timezone.utc).year}_{week_num}"

    existing = await db.rpg_quest_log.find_one(
        {"user_id": uid, "quest_id": bonus_key}
    )
    if existing:
        raise HTTPException(400, "Scholar's Bonus already claimed this week")

    xp_amount = 25
    await db.rpg_quest_log.insert_one({
        "user_id": uid,
        "quest_id": bonus_key,
        "date": today,
        "xp_awarded": xp_amount,
        "multiplier": 1.0,
        "completed_at": datetime.now(timezone.utc).isoformat(),
    })
    await db.rpg_characters.update_one(
        {"user_id": uid}, {"$inc": {"xp": xp_amount}}, upsert=True
    )

    return {"xp_awarded": xp_amount, "bonus": "Scholar's Bonus"}


@router.get("/reports/elemental-affinities")
async def get_elemental_affinities(user=Depends(get_current_user)):
    """Current elemental affinities for RPG stat boosts."""
    zodiac = get_current_zodiac()
    lunar = get_lunar_phase()
    element = zodiac["element"]
    stats = ELEMENT_STATS.get(element, {})

    # Get user's equipped items that match element
    equipped = await db.rpg_equipped.find(
        {"user_id": user["id"]}, {"_id": 0}
    ).to_list(8)

    boosted_items = []
    for item in equipped:
        item_element = item.get("element")
        if item_element and item_element.lower() == element.lower():
            boosted_items.append({"name": item["name"], "slot": item["slot"]})

    return {
        "current_season": zodiac["sign"],
        "element": element,
        "stat_boosts": stats,
        "lunar": lunar,
        "boosted_items": boosted_items,
        "description": f"During {zodiac['sign']} season, {element}-element gear gains bonus stats",
    }
