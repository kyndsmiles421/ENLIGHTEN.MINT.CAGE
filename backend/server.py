from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware
import os
from deps import client

from routes.auth import router as auth_router
from routes.wellness import router as wellness_router
from routes.dashboard import router as dashboard_router
from routes.challenges import router as challenges_router
from routes.profiles import router as profiles_router
from routes.oracle import router as oracle_router
from routes.practices import router as practices_router
from routes.media import router as media_router
from routes.meditations import router as meditations_router
from routes.journey import router as journey_router
from routes.knowledge import router as knowledge_router
from routes.community import router as community_router
from routes.rituals import router as rituals_router
from routes.plants import router as plants_router
from routes.plants import reset_plant_watering
from routes.recommendations import router as recommendations_router
from routes.learning import router as learning_router
from routes.gamification import router as gamification_router
from routes.avatar_yoga import router as avatar_yoga_router
from routes.mayan import router as mayan_router
from routes.cardology import router as cardology_router
from routes.daily_challenges import router as daily_challenges_router
from routes.social import router as social_router
from routes.teachings import router as teachings_router
from routes.numerology import router as numerology_router
from routes.nature import router as nature_router
from routes.aromatherapy import router as aromatherapy_router
from routes.herbology import router as herbology_router
from routes.elixirs import router as elixirs_router
from routes.meals import router as meals_router
from routes.acupressure import router as acupressure_router
from routes.reiki import router as reiki_router
from routes.discover import router as discover_router
from routes.daily_ritual import router as daily_ritual_router
from routes.cosmic_calendar import router as cosmic_calendar_router
from routes.wellness_reports import router as wellness_reports_router
from routes.meditation_history import router as meditation_history_router
from routes.uploads import router as uploads_router
from routes.coach import router as coach_router
from routes.cosmic_context import router as cosmic_context_router
from routes.daily_briefing import router as daily_briefing_router
from routes.forecasts import router as forecasts_router
from routes.cosmic_profile import router as cosmic_profile_router
from routes.star_cultures import router as star_cultures_router
from routes.creation_stories import router as creation_stories_router

app = FastAPI()

all_routers = [
    auth_router, wellness_router, dashboard_router, challenges_router,
    profiles_router, oracle_router, practices_router, media_router,
    meditations_router, journey_router, knowledge_router, community_router,
    rituals_router, plants_router, recommendations_router, learning_router,
    gamification_router, avatar_yoga_router, mayan_router, cardology_router,
    daily_challenges_router, social_router, teachings_router,
    numerology_router, nature_router,
    aromatherapy_router, herbology_router, elixirs_router, meals_router,
    acupressure_router, reiki_router, discover_router, daily_ritual_router,
    cosmic_calendar_router, wellness_reports_router, meditation_history_router,
    uploads_router, coach_router, cosmic_context_router, daily_briefing_router,
    forecasts_router,
    cosmic_profile_router,
    star_cultures_router,
    creation_stories_router,
]

for r in all_routers:
    app.include_router(r, prefix="/api")

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_tasks():
    await reset_plant_watering()

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
