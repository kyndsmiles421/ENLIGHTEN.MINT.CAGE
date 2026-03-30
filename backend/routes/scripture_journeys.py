from datetime import datetime, timezone
from fastapi import APIRouter, Depends, Body, HTTPException, Query
from deps import db, get_current_user, logger

router = APIRouter()

SCRIPTURE_JOURNEYS = [
    {
        "id": "life-of-moses",
        "title": "The Life of Moses",
        "subtitle": "Across Three Traditions",
        "description": "Follow Moses from his birth in the Nile to the burning bush, the Exodus, Sinai, and beyond — as told by the Bible, Quran, and Kabbalah.",
        "color": "#D97706",
        "traditions": ["Bible", "Quran", "Kabbalah"],
        "difficulty": "beginner",
        "estimated_hours": 4,
        "steps": [
            {"book_id": "exodus", "chapter": 1, "label": "Moses' Birth & the Nile", "tradition": "Bible"},
            {"book_id": "exodus", "chapter": 2, "label": "Adopted by Pharaoh's Daughter", "tradition": "Bible"},
            {"book_id": "exodus", "chapter": 3, "label": "The Burning Bush", "tradition": "Bible"},
            {"book_id": "ta-ha", "chapter": 1, "label": "Ta-Ha: Moses in the Quran", "tradition": "Quran"},
            {"book_id": "ta-ha", "chapter": 2, "label": "The Staff and the White Hand", "tradition": "Quran"},
            {"book_id": "exodus", "chapter": 14, "label": "Parting the Red Sea", "tradition": "Bible"},
            {"book_id": "al-qasas", "chapter": 1, "label": "Al-Qasas: The Full Story", "tradition": "Quran"},
            {"book_id": "exodus", "chapter": 20, "label": "The Ten Commandments", "tradition": "Bible"},
            {"book_id": "zohar", "chapter": 3, "label": "The Zohar on Moses' Light", "tradition": "Kabbalah"},
            {"book_id": "deuteronomy", "chapter": 34, "label": "Moses' Final Blessing & Death", "tradition": "Bible"},
        ],
    },
    {
        "id": "creation-stories",
        "title": "In the Beginning",
        "subtitle": "Creation Across All Traditions",
        "description": "How did everything begin? Explore the creation narrative from Genesis, the Quran, the Zohar's mystical cosmology, and the Midrash.",
        "color": "#818CF8",
        "traditions": ["Bible", "Quran", "Kabbalah", "Torah & Talmud"],
        "difficulty": "beginner",
        "estimated_hours": 3,
        "steps": [
            {"book_id": "genesis", "chapter": 1, "label": "Genesis: Let There Be Light", "tradition": "Bible"},
            {"book_id": "genesis", "chapter": 2, "label": "The Garden of Eden", "tradition": "Bible"},
            {"book_id": "genesis", "chapter": 3, "label": "The Fall", "tradition": "Bible"},
            {"book_id": "sefer-yetzirah", "chapter": 1, "label": "Sefer Yetzirah: 32 Paths of Creation", "tradition": "Kabbalah"},
            {"book_id": "zohar", "chapter": 1, "label": "The Zohar on Bereishit", "tradition": "Kabbalah"},
            {"book_id": "midrash-rabbah-genesis", "chapter": 1, "label": "Midrash Rabbah: Hidden Meanings", "tradition": "Torah & Talmud"},
            {"book_id": "al-baqarah", "chapter": 1, "label": "Al-Baqarah: Adam & the Angels", "tradition": "Quran"},
            {"book_id": "book-of-adam-and-eve", "chapter": 1, "label": "Life After Eden", "tradition": "Lost Text"},
        ],
    },
    {
        "id": "mary-and-jesus",
        "title": "Mary & Jesus",
        "subtitle": "The Shared Sacred Story",
        "description": "The miraculous birth and ministry of Jesus through Christian Gospels, the Quran's Surah Maryam, and the Gnostic gospels.",
        "color": "#DC2626",
        "traditions": ["Bible", "Quran", "Lost Texts"],
        "difficulty": "intermediate",
        "estimated_hours": 5,
        "steps": [
            {"book_id": "luke", "chapter": 1, "label": "The Annunciation", "tradition": "Bible"},
            {"book_id": "luke", "chapter": 2, "label": "The Birth of Jesus", "tradition": "Bible"},
            {"book_id": "maryam", "chapter": 1, "label": "Surah Maryam: Mary's Miracle", "tradition": "Quran"},
            {"book_id": "matthew", "chapter": 5, "label": "The Sermon on the Mount", "tradition": "Bible"},
            {"book_id": "john", "chapter": 1, "label": "In the Beginning Was the Word", "tradition": "Bible"},
            {"book_id": "al-imran", "chapter": 1, "label": "Family of Imran: Jesus in Islam", "tradition": "Quran"},
            {"book_id": "gospel-of-thomas", "chapter": 1, "label": "Secret Sayings of Jesus", "tradition": "Lost Text"},
            {"book_id": "gospel-of-mary", "chapter": 1, "label": "Mary Magdalene's Vision", "tradition": "Lost Text"},
            {"book_id": "infancy-gospel-thomas", "chapter": 1, "label": "The Child Jesus' Miracles", "tradition": "Lost Text"},
            {"book_id": "john", "chapter": 20, "label": "The Resurrection", "tradition": "Bible"},
        ],
    },
    {
        "id": "wisdom-seekers",
        "title": "The Wisdom Seekers",
        "subtitle": "Solomon, Proverbs & Divine Knowledge",
        "description": "Explore wisdom literature from Proverbs and Ecclesiastes, through the Quran's Solomon, to Kabbalah's hidden knowledge.",
        "color": "#F59E0B",
        "traditions": ["Bible", "Quran", "Kabbalah"],
        "difficulty": "intermediate",
        "estimated_hours": 4,
        "steps": [
            {"book_id": "proverbs", "chapter": 1, "label": "The Beginning of Wisdom", "tradition": "Bible"},
            {"book_id": "proverbs", "chapter": 8, "label": "Wisdom Was There at Creation", "tradition": "Bible"},
            {"book_id": "ecclesiastes", "chapter": 1, "label": "Vanity of Vanities", "tradition": "Bible"},
            {"book_id": "wisdom-of-solomon", "chapter": 1, "label": "Wisdom of Solomon", "tradition": "Deuterocanonical"},
            {"book_id": "an-naml", "chapter": 1, "label": "Solomon, the Ants & the Hoopoe", "tradition": "Quran"},
            {"book_id": "testament-of-solomon", "chapter": 1, "label": "Solomon's Ring of Power", "tradition": "Lost Text"},
            {"book_id": "shaarei-orah", "chapter": 1, "label": "Gates of Light: Divine Names", "tradition": "Kabbalah"},
            {"book_id": "pirke-avot", "chapter": 1, "label": "Ethics of the Fathers", "tradition": "Torah & Talmud"},
        ],
    },
    {
        "id": "night-journeys",
        "title": "Night Journeys & Visions",
        "subtitle": "Mystical Ascensions",
        "description": "From Muhammad's Night Journey to Enoch's heavenly ascent, Jacob's Ladder, and kabbalistic worlds — explore the human encounter with the divine.",
        "color": "#0891B2",
        "traditions": ["Quran", "Bible", "Kabbalah", "Lost Texts"],
        "difficulty": "advanced",
        "estimated_hours": 5,
        "steps": [
            {"book_id": "al-isra", "chapter": 1, "label": "Al-Isra: The Night Journey", "tradition": "Quran"},
            {"book_id": "al-isra", "chapter": 2, "label": "Ascension Through the Heavens", "tradition": "Quran"},
            {"book_id": "genesis", "chapter": 28, "label": "Jacob's Ladder", "tradition": "Bible"},
            {"book_id": "book-of-enoch", "chapter": 1, "label": "Enoch: Journey to Heaven", "tradition": "Lost Text"},
            {"book_id": "book-of-enoch", "chapter": 10, "label": "The Watchers & the Fallen", "tradition": "Lost Text"},
            {"book_id": "ezekiel", "chapter": 1, "label": "Ezekiel's Chariot Vision", "tradition": "Bible"},
            {"book_id": "revelation", "chapter": 1, "label": "John's Apocalyptic Vision", "tradition": "Bible"},
            {"book_id": "etz-chaim", "chapter": 1, "label": "The Tree of Life: Four Worlds", "tradition": "Kabbalah"},
            {"book_id": "apocalypse-of-peter", "chapter": 1, "label": "Peter's Vision of Heaven & Hell", "tradition": "Lost Text"},
            {"book_id": "al-qadr", "chapter": 1, "label": "The Night of Power", "tradition": "Quran"},
        ],
    },
    {
        "id": "divine-love",
        "title": "The Path of Divine Love",
        "subtitle": "Love, Mercy & Compassion",
        "description": "A journey through the most beautiful expressions of divine love — from the Song of Solomon to Ar-Rahman, from the Psalms to the Odes of Solomon.",
        "color": "#EC4899",
        "traditions": ["Bible", "Quran", "Lost Texts"],
        "difficulty": "beginner",
        "estimated_hours": 3,
        "steps": [
            {"book_id": "song-of-solomon", "chapter": 1, "label": "The Song of Songs", "tradition": "Bible"},
            {"book_id": "psalms", "chapter": 23, "label": "The Lord Is My Shepherd", "tradition": "Bible"},
            {"book_id": "1-corinthians", "chapter": 13, "label": "Love Is Patient, Love Is Kind", "tradition": "Bible"},
            {"book_id": "ar-rahman", "chapter": 1, "label": "The Most Merciful", "tradition": "Quran"},
            {"book_id": "hosea", "chapter": 1, "label": "God's Unfailing Love", "tradition": "Bible"},
            {"book_id": "odes-of-solomon", "chapter": 1, "label": "Odes: Mystical Songs of Joy", "tradition": "Lost Text"},
            {"book_id": "ad-duha", "chapter": 1, "label": "Your Lord Has Not Forsaken You", "tradition": "Quran"},
            {"book_id": "ash-sharh", "chapter": 1, "label": "With Hardship Comes Ease", "tradition": "Quran"},
        ],
    },
]


@router.get("/scripture-journeys")
async def get_journeys(user=Depends(get_current_user)):
    uid = user["id"]
    progress_docs = await db.scripture_journey_progress.find(
        {"user_id": uid}, {"_id": 0}
    ).to_list(50)
    progress_map = {p["journey_id"]: p for p in progress_docs}

    result = []
    for j in SCRIPTURE_JOURNEYS:
        prog = progress_map.get(j["id"], {})
        completed_steps = prog.get("completed_steps", [])
        total = len(j["steps"])
        result.append({
            "id": j["id"],
            "title": j["title"],
            "subtitle": j["subtitle"],
            "description": j["description"],
            "color": j["color"],
            "traditions": j["traditions"],
            "difficulty": j["difficulty"],
            "estimated_hours": j["estimated_hours"],
            "total_steps": total,
            "completed_steps": len(completed_steps),
            "progress_pct": round(len(completed_steps) / total * 100) if total > 0 else 0,
            "started": len(completed_steps) > 0,
            "completed": len(completed_steps) >= total,
        })
    return {"journeys": result}


@router.get("/scripture-journeys/{journey_id}")
async def get_journey_detail(journey_id: str, user=Depends(get_current_user)):
    journey = next((j for j in SCRIPTURE_JOURNEYS if j["id"] == journey_id), None)
    if not journey:
        raise HTTPException(status_code=404, detail="Journey not found")

    uid = user["id"]
    prog = await db.scripture_journey_progress.find_one(
        {"user_id": uid, "journey_id": journey_id}, {"_id": 0}
    )
    completed_steps = prog.get("completed_steps", []) if prog else []

    steps_with_status = []
    for i, step in enumerate(journey["steps"]):
        steps_with_status.append({
            **step,
            "index": i,
            "completed": i in completed_steps,
            "unlocked": i == 0 or (i - 1) in completed_steps,
        })

    return {
        **{k: v for k, v in journey.items() if k != "steps"},
        "steps": steps_with_status,
        "completed_steps": completed_steps,
        "total_steps": len(journey["steps"]),
        "progress_pct": round(len(completed_steps) / len(journey["steps"]) * 100),
    }


@router.post("/scripture-journeys/{journey_id}/complete-step")
async def complete_journey_step(
    journey_id: str,
    data: dict = Body(...),
    user=Depends(get_current_user),
):
    journey = next((j for j in SCRIPTURE_JOURNEYS if j["id"] == journey_id), None)
    if not journey:
        raise HTTPException(status_code=404, detail="Journey not found")

    step_index = data.get("step_index", -1)
    if step_index < 0 or step_index >= len(journey["steps"]):
        raise HTTPException(status_code=400, detail="Invalid step index")

    uid = user["id"]
    now = datetime.now(timezone.utc).isoformat()

    prog = await db.scripture_journey_progress.find_one(
        {"user_id": uid, "journey_id": journey_id}, {"_id": 0}
    )

    if prog:
        completed = prog.get("completed_steps", [])
        if step_index not in completed:
            completed.append(step_index)
            await db.scripture_journey_progress.update_one(
                {"user_id": uid, "journey_id": journey_id},
                {"$set": {"completed_steps": completed, "updated_at": now}},
            )
    else:
        await db.scripture_journey_progress.insert_one({
            "user_id": uid,
            "journey_id": journey_id,
            "completed_steps": [step_index],
            "started_at": now,
            "updated_at": now,
        })

    total = len(journey["steps"])
    completed_count = len((prog or {}).get("completed_steps", [])) + (1 if not prog or step_index not in (prog or {}).get("completed_steps", []) else 0)
    is_complete = completed_count >= total

    if is_complete:
        existing = await db.achievements.find_one(
            {"user_id": uid, "type": "journey", "ref_id": journey_id}, {"_id": 0}
        )
        if not existing:
            await db.achievements.insert_one({
                "user_id": uid,
                "type": "journey",
                "ref_id": journey_id,
                "title": f"Completed: {journey['title']}",
                "description": f"Finished the {journey['title']} scripture journey",
                "earned_at": now,
            })

    return {
        "step_index": step_index,
        "completed": is_complete,
        "progress_pct": round(completed_count / total * 100),
        "achievement_earned": is_complete,
    }
