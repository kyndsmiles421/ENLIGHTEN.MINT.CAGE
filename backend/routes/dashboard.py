from fastapi import APIRouter, HTTPException, Depends, Body
from deps import db, get_current_user, get_current_user_optional, EMERGENT_LLM_KEY, logger
from datetime import datetime, timezone, timedelta
import uuid

router = APIRouter()
import asyncio

# --- Dashboard Stats ---
@router.get("/dashboard/stats")
async def get_dashboard_stats(user=Depends(get_current_user)):
    # Run all queries concurrently for speed
    uid = user["id"]
    mood_count_t, journal_count_t, recent_moods_t, all_moods_t, all_journals_t = await asyncio.gather(
        db.moods.count_documents({"user_id": uid}),
        db.journal.count_documents({"user_id": uid}),
        db.moods.find({"user_id": uid}, {"_id": 0}).sort("created_at", -1).to_list(7),
        db.moods.find({"user_id": uid}, {"_id": 0, "created_at": 1}).sort("created_at", -1).to_list(365),
        db.journal.find({"user_id": uid}, {"_id": 0, "created_at": 1}).sort("created_at", -1).to_list(365),
    )
    
    today = datetime.now(timezone.utc).date()
    dates_active = set()
    for m in all_moods_t:
        dates_active.add(datetime.fromisoformat(m["created_at"]).date())
    for j in all_journals_t:
        dates_active.add(datetime.fromisoformat(j["created_at"]).date())
    
    streak = 0
    check_date = today
    while check_date in dates_active:
        streak += 1
        check_date -= timedelta(days=1)
    
    return {
        "mood_count": mood_count_t,
        "journal_count": journal_count_t,
        "streak": streak,
        "recent_moods": recent_moods_t
    }


