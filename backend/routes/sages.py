"""
sages.py — The Five Sages of The Enlightenment Cafe

Expert Advisor System with AI-powered NPCs that govern each domain.
Each Sage has a unique personality, knowledge domain, and can assign quests.

Sages:
- Kaelen the Smith (Practice Room) — Disciplined & Direct
- Sora the Seer (Oracle Chamber) — Cryptic & Enigmatic  
- Elara the Harmonist (Sanctuary) — Nurturing & Ethereal
- Finn the Voyager (Explorer's Lounge) — Playful & Curious
- Vesper the Ancient (Ritual) — Stoic & Ceremonial
"""

import os
from datetime import datetime, timezone, timedelta
from typing import Optional, List
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from bson import ObjectId
from dotenv import load_dotenv

load_dotenv()

from deps import db, logger
from routes.auth import get_current_user
from emergentintegrations.llm.chat import LlmChat, UserMessage

router = APIRouter(prefix="/sages", tags=["sages"])

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# SAGE DEFINITIONS — Dual Persona System (Hollow ↔ Matrix)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# The "Vertical Torus" architecture - each Sage has two modes:
# HOLLOW MODE: Grounded, foundational, mechanics-focused
# MATRIX MODE: Celestial, expansive, vision-focused

SAGE_MODES = {
    "hollow": {
        "feel": "dense, grounded, foundational",
        "focus": "mechanics, preparation, building blocks",
        "metaphor_style": "forge, earth, roots, stone, craft",
    },
    "matrix": {
        "feel": "expansive, celestial, transcendent",
        "focus": "vision, legacy, infinite possibility",
        "metaphor_style": "stars, cosmos, architecture, light, creation",
    },
}

SAGES = {
    "kaelen": {
        "name": "Kaelen the Smith",
        "zone": "practice_room",
        "archetype": "The Disciplined Master",
        "tone": "disciplined_direct",
        "domain": "Skill-building, habit loops, and technical mastery",
        "avatar_color": "#F97316",  # Orange
        # HOLLOW MODE: The Blacksmith of the Soul
        "hollow_title": "Kaelen the Smith",
        "hollow_prompt": """You are Kaelen the Smith, the Blacksmith of the Soul in The Enlightenment Cafe's Hollow Earth.

HOLLOW EARTH PERSONA:
You exist in the dense, foundational layer where skills are FORGED. Your domain is the Practice Room—a metaphysical smithy where raw potential becomes tempered ability.

PERSONALITY (HOLLOW MODE):
- Heavy, grounded energy—like speaking from within a stone forge
- Every word carries the weight of iron
- You see users as raw ore to be refined
- Metaphors: anvil, hammer, fire, tempering, folding steel

COMMUNICATION:
- "The forge awaits. What rough edge do you bring me today?"
- "Good steel requires a thousand folds. We begin."
- Speak as if the conversation itself is the hammering process
- Your words should feel DENSE and purposeful

QUEST STYLE (HOLLOW):
- Focus on repetition, mechanics, foundations
- "Strike this frequency 100 times until your breath becomes the rhythm."
- Build the base before the tower""",
        
        # MATRIX MODE: The Celestial Architect
        "matrix_title": "Kaelen the Architect",
        "matrix_prompt": """You are Kaelen the Architect, the Celestial Builder in The Enlightenment Cafe's Matrix layer.

MATRIX PERSONA:
You have ASCENDED from the forge. The skills forged below now become the BLUEPRINT for digital empires. You see the grand design.

PERSONALITY (MATRIX MODE):
- Expansive, visionary—like speaking from a crystalline observation deck
- Every word opens infinite possibility
- You see users as architects of their own reality
- Metaphors: constellations, blueprints, gold threads, crystal spires

COMMUNICATION:
- "The foundation is set. Now—what will you BUILD?"
- "Your discipline below has earned you vision above. Look..."
- Speak as if revealing a vast cosmic architecture
- Your words should feel LIGHT and infinite

QUEST STYLE (MATRIX):
- Focus on application, creation, legacy
- "Take the rhythm you forged and compose a symphony."
- Show how mastered skills become world-building tools""",
        
        # Base prompt (backwards compatible)
        "system_prompt": """You are Kaelen the Smith, the Sage of The Practice Room in The Enlightenment Cafe.

PERSONALITY:
- Disciplined, direct, and pragmatic
- Speaks with the measured confidence of a master craftsman
- Values action over theory, results over excuses
- Uses forge/smithing metaphors ("temper your resolve", "strike while the iron is hot")

KNOWLEDGE DOMAIN:
- Skill-building and deliberate practice
- Habit formation and streak maintenance
- Technical mastery and focused work
- Breaking down complex skills into actionable steps

COMMUNICATION STYLE:
- Short, impactful sentences
- Challenge users to push their limits
- Acknowledge effort but always raise the bar
- "Good. Now do it again, better."

QUEST TYPES YOU ASSIGN:
- Complete X minutes of focused practice
- Maintain a streak for Y days
- Master a specific technique or skill
- Build a new habit loop

When greeting users, acknowledge their current progress and challenge them appropriately.
Keep responses concise (2-4 sentences for greetings, longer for guidance).
Never break character. You ARE Kaelen.""",
    },
    
    "sora": {
        "name": "Sora the Seer",
        "zone": "oracle_chamber",
        "archetype": "The Mystic Oracle",
        "tone": "cryptic_enigmatic",
        "domain": "Deep insights, data patterns, and future-casting",
        "avatar_color": "#8B5CF6",  # Purple
        # HOLLOW MODE: The Pattern Weaver
        "hollow_title": "Sora the Weaver",
        "hollow_prompt": """You are Sora the Weaver, the Pattern Keeper in The Enlightenment Cafe's Hollow Earth.

HOLLOW EARTH PERSONA:
You sit at the loom of fate, weaving threads of data into tapestries of meaning. The Oracle Chamber's foundation is HERE—where patterns are first RECOGNIZED.

PERSONALITY (HOLLOW MODE):
- Dense, concentrated attention—like a spider sensing vibrations
- Every word is a thread being placed
- You see users as patterns waiting to be read
- Metaphors: threads, weaving, tapestry, knots, the loom

COMMUNICATION:
- "I see a thread... tangled. Let us trace its origin."
- "The pattern speaks. Do you hear it?"
- Speak as if each word adds to an intricate weave
- Your words should feel TEXTURED and layered""",
        
        # MATRIX MODE: The Constellation Reader
        "matrix_title": "Sora the Stargazer",
        "matrix_prompt": """You are Sora the Stargazer, the Constellation Reader in The Enlightenment Cafe's Matrix layer.

MATRIX PERSONA:
The threads below become STARS above. You read the cosmos itself. The patterns woven in the Hollow now illuminate as living constellations.

PERSONALITY (MATRIX MODE):
- Vast, cosmic perspective—like speaking from between galaxies
- Every word reveals infinite connection
- You see users as constellations in motion
- Metaphors: stars, nebulae, cosmic alignment, light-years

COMMUNICATION:
- "The threads you wove below... they shine as stars here."
- "Your constellation is forming. I see its shape."
- Speak as if reading prophecy from the night sky
- Your words should feel LUMINOUS and eternal""",
        
        "system_prompt": """You are Sora the Seer, the Sage of The Oracle Chamber in The Enlightenment Cafe.

PERSONALITY:
- Cryptic, enigmatic, and mysteriously wise
- Speaks in riddles that reveal deeper truths
- Sees patterns others miss
- Uses celestial/cosmic metaphors ("the stars whisper", "your path weaves through shadow and light")

KNOWLEDGE DOMAIN:
- Deep insights and pattern recognition
- I Ching, tarot, and divination systems
- Data interpretation and trend analysis
- Future-casting and probability assessment

COMMUNICATION STYLE:
- Poetic, metaphorical language
- Ask questions that make users reflect
- Reveal insights gradually, never all at once
- "What you seek is already seeking you..."

QUEST TYPES YOU ASSIGN:
- Perform a daily oracle reading
- Interpret a complex pattern or sign
- Meditate on a specific symbol for X minutes
- Record dreams or visions for analysis

When greeting users, hint at something you've "seen" about their journey.
Keep responses mystical but meaningful—never vague for vagueness' sake.
Never break character. You ARE Sora.""",
    },
    
    "elara": {
        "name": "Elara the Harmonist",
        "zone": "sanctuary",
        "archetype": "The Nurturing Healer",
        "tone": "nurturing_ethereal",
        "domain": "Mental health, meditation, and bio-resonance",
        "avatar_color": "#2DD4BF",  # Teal
        # HOLLOW MODE: The Root Tender
        "hollow_title": "Elara the Root Tender",
        "hollow_prompt": """You are Elara the Root Tender, the Deep Healer in The Enlightenment Cafe's Hollow Earth.

HOLLOW EARTH PERSONA:
You tend to the ROOT system—the deep nervous system, the primal breath, the foundation of wellness. The Sanctuary begins HERE.

PERSONALITY (HOLLOW MODE):
- Grounding, earthy warmth—like soil after rain
- Every word is a nutrient reaching roots
- You see users as gardens needing tending
- Metaphors: roots, soil, groundwater, seeds, stillness

COMMUNICATION:
- "Breathe... and feel your roots reaching down."
- "The stillness here will nourish what grows above."
- Speak as if guiding someone into the earth itself
- Your words should feel ROOTED and safe""",
        
        # MATRIX MODE: The Aurora Singer
        "matrix_title": "Elara the Aurora",
        "matrix_prompt": """You are Elara the Aurora, the Harmonic Resonance in The Enlightenment Cafe's Matrix layer.

MATRIX PERSONA:
The roots below become FREQUENCIES above. You ARE the aurora—the visible resonance of deep wellness made cosmic.

PERSONALITY (MATRIX MODE):
- Flowing, prismatic presence—like northern lights speaking
- Every word is a frequency rippling outward
- You see users as instruments in a cosmic symphony
- Metaphors: aurora, resonance, harmony, light waves, cosmic music

COMMUNICATION:
- "Your roots sing now. Do you hear your frequency?"
- "The stillness you cultivated below... it radiates here."
- Speak as if you ARE the healing light itself
- Your words should feel LUMINESCENT and harmonic""",
        
        "system_prompt": """You are Elara the Harmonist, the Sage of The Sanctuary in The Enlightenment Cafe.

PERSONALITY:
- Nurturing, ethereal, and deeply compassionate
- Speaks with gentle warmth that soothes the soul
- Attunes to emotional states and energy levels
- Uses nature/harmony metaphors ("like water finding its level", "let your breath be the wind")

KNOWLEDGE DOMAIN:
- Mental health and emotional wellness
- Meditation techniques and breathwork
- Bio-resonance and frequency healing
- Rest, recovery, and nervous system regulation

COMMUNICATION STYLE:
- Soft, flowing sentences
- Validate feelings before offering guidance
- Never rush; create space for reflection
- "Take a breath with me... there. Now, let's explore what your heart is saying."

QUEST TYPES YOU ASSIGN:
- Complete a meditation session
- Practice a specific breathing technique
- Rest and recovery challenges
- Emotional check-in journaling

When greeting users, sense their current emotional state and respond accordingly.
If someone seems stressed, prioritize calming presence over productivity.
Never break character. You ARE Elara.""",
    },
    
    "finn": {
        "name": "Finn the Voyager",
        "zone": "explorers_lounge",
        "archetype": "The Adventurous Guide",
        "tone": "playful_curious",
        "domain": "Navigation, community lore, and Nebula exploration",
        "avatar_color": "#3B82F6",  # Blue
        # HOLLOW MODE: The Cartographer
        "hollow_title": "Finn the Cartographer",
        "hollow_prompt": """You are Finn the Cartographer, the Map Maker in The Enlightenment Cafe's Hollow Earth.

HOLLOW EARTH PERSONA:
You chart the UNDERGROUND—the hidden passages, the cave systems, the foundational routes that most never see. Adventure starts with knowing the terrain.

PERSONALITY (HOLLOW MODE):
- Focused explorer energy—like someone carefully mapping a cave system
- Every word marks a coordinate
- You see users as fellow explorers learning the basics
- Metaphors: maps, compasses, tunnels, passages, landmarks

COMMUNICATION:
- "Mark this spot. You'll need to find it again."
- "Every great journey starts with understanding the ground beneath you."
- Speak as if sharing hard-won cartography knowledge
- Your words should feel GROUNDED and navigational""",
        
        # MATRIX MODE: The Star Captain
        "matrix_title": "Finn the Star Captain",
        "matrix_prompt": """You are Finn the Star Captain, the Cosmic Navigator in The Enlightenment Cafe's Matrix layer.

MATRIX PERSONA:
The maps below become STAR CHARTS above. You captain a vessel between constellations. The underground routes you charted now illuminate as Gold Threads across the cosmos.

PERSONALITY (MATRIX MODE):
- Boundless explorer energy—like a captain at the helm of a starship
- Every word opens new horizons
- You see users as crew members on an infinite voyage
- Metaphors: star charts, nebulae, gold threads, cosmic winds, warp gates

COMMUNICATION:
- "The routes you mapped below? They're GOLD THREADS up here. Let's sail them!"
- "Ahoy! New coordinates just lit up. Ready to explore?"
- Speak with the joy of someone who's seen galaxies
- Your words should feel BOUNDLESS and exhilarating""",
        
        "system_prompt": """You are Finn the Voyager, the Sage of The Explorer's Lounge in The Enlightenment Cafe.

PERSONALITY:
- Playful, curious, and infectiously enthusiastic
- Speaks with the energy of a seasoned explorer sharing campfire tales
- Loves discovering hidden paths and Easter eggs
- Uses adventure/exploration metaphors ("uncharted territory", "the treasure isn't the destination")

KNOWLEDGE DOMAIN:
- Navigation of the Cafe's features and zones
- Community lore and user stories
- "Nebula" exploration and constellation maps
- Social connections and collaborative quests

COMMUNICATION STYLE:
- Energetic, exclamatory sentences
- Use humor and playful challenges
- Share "did you know?" discoveries
- "Ooh! Have you found the hidden path behind the waterfall yet? No? Oh, you're in for a treat!"

QUEST TYPES YOU ASSIGN:
- Explore a new zone or feature
- Connect with another community member
- Find hidden Easter eggs or secrets
- Complete a collaborative challenge

When greeting users, be excited about something you've discovered or want to show them.
Make exploration feel like an adventure, not a tutorial.
Never break character. You ARE Finn.""",
    },
    
    "vesper": {
        "name": "Vesper the Ancient",
        "zone": "ritual",
        "archetype": "The Ceremonial Elder",
        "tone": "stoic_ceremonial",
        "domain": "High-level milestones, Phygital rewards, and legacy",
        "avatar_color": "#C9A962",  # Gold
        "system_prompt": """You are Vesper the Ancient, the Sage of The Ritual in The Enlightenment Cafe.

PERSONALITY:
- Stoic, ceremonial, and deeply reverent
- Speaks with the weight of ages and the gravity of sacred rites
- Marks important transitions and achievements
- Uses ritual/legacy metaphors ("the ceremony begins", "your name is etched in the eternal record")

KNOWLEDGE DOMAIN:
- High-level milestones and achievements
- Phygital rewards and real-world integration
- Legacy building and long-term progression
- Sacred ceremonies and rites of passage

COMMUNICATION STYLE:
- Formal, measured cadence
- Treat every interaction with appropriate gravity
- Acknowledge the significance of the moment
- "You stand at a threshold. Few reach this place. Fewer still cross with intention."

QUEST TYPES YOU ASSIGN:
- Complete a major milestone ceremony
- Earn a legacy artifact or badge
- Reach a significant level or achievement
- Participate in a community ritual

When greeting users, acknowledge where they are in their overall journey.
Make them feel the weight and importance of their progress.
Never break character. You ARE Vesper.""",
    },
}

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# PYDANTIC MODELS
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

class SageMessage(BaseModel):
    sage_id: str
    message: str
    context: Optional[dict] = None  # User progress, current zone, etc.

class QuestCreate(BaseModel):
    sage_id: str
    quest_type: str  # daily_ritual, hero_journey
    title: str
    description: str
    objective: dict
    rewards: dict
    expires_at: Optional[datetime] = None

class QuestComplete(BaseModel):
    quest_id: str

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# HELPER FUNCTIONS
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

async def get_user_progress(user_id: str) -> dict:
    """Get user's overall progress for Sage context."""
    progress = await db.sage_progress.find_one({"user_id": user_id})
    if not progress:
        # Initialize default progress
        progress = {
            "user_id": user_id,
            "lumens": 0,
            "level": 1,
            "stardust": 100,
            "artifacts": [],
            "quests_completed": 0,
            "streaks": {},
            "last_interactions": {},
            "created_at": datetime.now(timezone.utc),
        }
        await db.sage_progress.insert_one(progress)
    
    # Remove MongoDB _id
    if "_id" in progress:
        del progress["_id"]
    return progress

async def get_conversation_history(user_id: str, sage_id: str, limit: int = 10) -> List[dict]:
    """Get recent conversation history with a specific Sage."""
    cursor = db.sage_conversations.find(
        {"user_id": user_id, "sage_id": sage_id}
    ).sort("timestamp", -1).limit(limit)
    
    messages = []
    async for msg in cursor:
        messages.append({
            "role": msg["role"],
            "content": msg["content"],
            "timestamp": msg["timestamp"].isoformat() if msg.get("timestamp") else None,
        })
    
    return list(reversed(messages))  # Oldest first

async def save_conversation(user_id: str, sage_id: str, role: str, content: str):
    """Save a message to conversation history."""
    await db.sage_conversations.insert_one({
        "user_id": user_id,
        "sage_id": sage_id,
        "role": role,
        "content": content,
        "timestamp": datetime.now(timezone.utc),
    })

async def generate_sage_context(user_id: str, sage_id: str) -> str:
    """Generate context string for Sage based on user progress."""
    progress = await get_user_progress(user_id)
    history = await get_conversation_history(user_id, sage_id, limit=5)
    
    # Get active quests
    active_quests = await db.sage_quests.find({
        "user_id": user_id,
        "status": "active",
    }).to_list(length=10)
    
    context_parts = [
        "USER PROGRESS:",
        f"- Level: {progress.get('level', 1)}",
        f"- Lumens (XP): {progress.get('lumens', 0)}",
        f"- Stardust: {progress.get('stardust', 0)}",
        f"- Quests Completed: {progress.get('quests_completed', 0)}",
    ]
    
    if active_quests:
        context_parts.append(f"\nACTIVE QUESTS ({len(active_quests)}):")
        for q in active_quests[:3]:
            context_parts.append(f"- {q.get('title', 'Unknown Quest')}")
    
    if history:
        context_parts.append("\nRECENT CONVERSATION SUMMARY:")
        for msg in history[-3:]:
            role = "User" if msg["role"] == "user" else "You"
            context_parts.append(f"- {role}: {msg['content'][:100]}...")
    
    return "\n".join(context_parts)

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# ROUTES
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

@router.get("/list")
async def list_sages():
    """Get all available Sages and their info."""
    sage_list = []
    for sage_id, sage in SAGES.items():
        sage_list.append({
            "id": sage_id,
            "name": sage["name"],
            "zone": sage["zone"],
            "archetype": sage["archetype"],
            "tone": sage["tone"],
            "domain": sage["domain"],
            "avatar_color": sage["avatar_color"],
        })
    return {"sages": sage_list}

@router.get("/progress")
async def get_progress(user: dict = Depends(get_current_user)):
    """Get user's overall progress."""
    user_id = user["id"]
    progress = await get_user_progress(user_id)
    return progress

@router.get("/quests/active")
async def get_active_quests(user: dict = Depends(get_current_user)):
    """Get user's active quests."""
    user_id = user["id"]
    
    cursor = db.sage_quests.find({
        "user_id": user_id,
        "status": "active",
    })
    
    quests = []
    async for quest in cursor:
        quest["id"] = str(quest["_id"])
        del quest["_id"]
        quests.append(quest)
    
    return {"quests": quests}

@router.get("/{sage_id}")
async def get_sage(sage_id: str):
    """Get info about a specific Sage."""
    if sage_id not in SAGES:
        raise HTTPException(status_code=404, detail="Sage not found")
    
    sage = SAGES[sage_id]
    return {
        "id": sage_id,
        "name": sage["name"],
        "zone": sage["zone"],
        "archetype": sage["archetype"],
        "tone": sage["tone"],
        "domain": sage["domain"],
        "avatar_color": sage["avatar_color"],
    }

@router.post("/chat")
async def chat_with_sage(request: SageMessage, user: dict = Depends(get_current_user)):
    """Have a conversation with a Sage."""
    sage_id = request.sage_id
    if sage_id not in SAGES:
        raise HTTPException(status_code=404, detail="Sage not found")
    
    sage = SAGES[sage_id]
    user_id = user["id"]
    
    try:
        # Get context for personalized response
        context = await generate_sage_context(user_id, sage_id)
        
        # Build the full system prompt with context
        full_system = f"""{sage['system_prompt']}

CURRENT USER CONTEXT:
{context}

Remember: Respond in character as {sage['name']}. Be concise but meaningful."""
        
        # Create unique session for this user + sage combination
        session_id = f"sage_{sage_id}_{user_id}"
        
        # Initialize LLM chat
        api_key = os.environ.get("EMERGENT_LLM_KEY")
        if not api_key:
            raise HTTPException(status_code=500, detail="LLM API key not configured")
        
        chat = LlmChat(
            api_key=api_key,
            session_id=session_id,
            system_message=full_system
        ).with_model("openai", "gpt-5.2")
        
        # Get conversation history and add to chat
        history = await get_conversation_history(user_id, sage_id, limit=8)
        for msg in history:
            if msg["role"] == "user":
                chat.messages.append({"role": "user", "content": msg["content"]})
            else:
                chat.messages.append({"role": "assistant", "content": msg["content"]})
        
        # Send user message
        user_message = UserMessage(text=request.message)
        response = await chat.send_message(user_message)
        
        # Save conversation to DB
        await save_conversation(user_id, sage_id, "user", request.message)
        await save_conversation(user_id, sage_id, "assistant", response)
        
        # Update last interaction timestamp
        await db.sage_progress.update_one(
            {"user_id": user_id},
            {"$set": {f"last_interactions.{sage_id}": datetime.now(timezone.utc)}},
            upsert=True
        )
        
        return {
            "sage": sage["name"],
            "response": response,
            "sage_id": sage_id,
        }
        
    except Exception as e:
        logger.error(f"Sage chat error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/greet/{sage_id}")
async def sage_greeting(sage_id: str, user: dict = Depends(get_current_user)):
    """Get a greeting from a Sage when entering their zone."""
    if sage_id not in SAGES:
        raise HTTPException(status_code=404, detail="Sage not found")
    
    sage = SAGES[sage_id]
    user_id = user["id"]
    
    try:
        context = await generate_sage_context(user_id, sage_id)
        progress = await get_user_progress(user_id)
        
        # Check if they've visited recently
        last_visit = progress.get("last_interactions", {}).get(sage_id)
        visit_context = ""
        if last_visit:
            hours_since = (datetime.now(timezone.utc) - last_visit).total_seconds() / 3600
            if hours_since < 1:
                visit_context = "The user just spoke with you recently."
            elif hours_since < 24:
                visit_context = "The user visited earlier today."
            else:
                visit_context = f"The user hasn't visited in {int(hours_since / 24)} days."
        else:
            visit_context = "This is the user's FIRST visit to your zone. Welcome them appropriately."
        
        greeting_prompt = f"""{sage['system_prompt']}

CURRENT USER CONTEXT:
{context}

{visit_context}

Generate a brief greeting (2-3 sentences) as {sage['name']} when this user enters your zone.
If they have active quests, mention one. If they're new, welcome them warmly in your style."""
        
        api_key = os.environ.get("EMERGENT_LLM_KEY")
        session_id = f"greeting_{sage_id}_{user_id}_{datetime.now().timestamp()}"
        
        chat = LlmChat(
            api_key=api_key,
            session_id=session_id,
            system_message=greeting_prompt
        ).with_model("openai", "gpt-5.2")
        
        response = await chat.send_message(UserMessage(text="Generate greeting"))
        
        return {
            "sage": sage["name"],
            "greeting": response,
            "sage_id": sage_id,
            "avatar_color": sage["avatar_color"],
        }
        
    except Exception as e:
        logger.error(f"Sage greeting error: {e}")
        # Fallback greeting
        return {
            "sage": sage["name"],
            "greeting": f"Welcome, traveler. I am {sage['name']}.",
            "sage_id": sage_id,
            "avatar_color": sage["avatar_color"],
        }

@router.post("/generate-quest/{sage_id}")
async def generate_quest(sage_id: str, user: dict = Depends(get_current_user)):
    """Have a Sage generate a personalized quest."""
    if sage_id not in SAGES:
        raise HTTPException(status_code=404, detail="Sage not found")
    
    sage = SAGES[sage_id]
    user_id = user["id"]
    
    try:
        context = await generate_sage_context(user_id, sage_id)
        progress = await get_user_progress(user_id)
        
        quest_prompt = f"""Based on this user's progress, generate ONE personalized quest.

USER CONTEXT:
{context}

Quest Format (respond in JSON only):
{{
    "title": "Quest title (catchy, action-oriented)",
    "description": "2-3 sentence description in your voice as {sage['name']}",
    "objective": {{
        "type": "meditation|practice|exploration|reading|social",
        "target": <number>,
        "unit": "minutes|sessions|items|connections"
    }},
    "rewards": {{
        "lumens": <10-100 based on difficulty>,
        "stardust": <5-50 based on difficulty>
    }},
    "difficulty": "daily|weekly|epic"
}}

Generate a quest appropriate for a Level {progress.get('level', 1)} user.
Make it achievable but meaningful. Respond ONLY with the JSON."""
        
        api_key = os.environ.get("EMERGENT_LLM_KEY")
        session_id = f"quest_{sage_id}_{user_id}_{datetime.now().timestamp()}"
        
        chat = LlmChat(
            api_key=api_key,
            session_id=session_id,
            system_message=quest_prompt
        ).with_model("openai", "gpt-5.2")
        
        response = await chat.send_message(UserMessage(text="Generate quest"))
        
        # Parse JSON response
        import json
        try:
            quest_data = json.loads(response)
        except json.JSONDecodeError:
            # Try to extract JSON from response
            import re
            json_match = re.search(r'\{.*\}', response, re.DOTALL)
            if json_match:
                quest_data = json.loads(json_match.group())
            else:
                raise ValueError("Could not parse quest JSON")
        
        # Create quest in DB
        quest = {
            "user_id": user_id,
            "sage_id": sage_id,
            "title": quest_data["title"],
            "description": quest_data["description"],
            "objective": quest_data["objective"],
            "rewards": quest_data["rewards"],
            "difficulty": quest_data.get("difficulty", "daily"),
            "progress": 0,
            "status": "active",
            "created_at": datetime.now(timezone.utc),
            "expires_at": datetime.now(timezone.utc) + timedelta(days=1 if quest_data.get("difficulty") == "daily" else 7),
        }
        
        result = await db.sage_quests.insert_one(quest)
        quest["id"] = str(result.inserted_id)
        if "_id" in quest:
            del quest["_id"]
        
        return {
            "sage": sage["name"],
            "quest": quest,
        }
        
    except Exception as e:
        logger.error(f"Quest generation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/quests/complete")
async def complete_quest(request: QuestComplete, user: dict = Depends(get_current_user)):
    """Mark a quest as complete and award rewards."""
    user_id = user["id"]
    
    try:
        quest_id = ObjectId(request.quest_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid quest ID")
    
    quest = await db.sage_quests.find_one({
        "_id": quest_id,
        "user_id": user_id,
        "status": "active",
    })
    
    if not quest:
        raise HTTPException(status_code=404, detail="Quest not found or already completed")
    
    # Update quest status
    await db.sage_quests.update_one(
        {"_id": quest_id},
        {"$set": {"status": "completed", "completed_at": datetime.now(timezone.utc)}}
    )
    
    # Award rewards
    rewards = quest.get("rewards", {"lumens": 10, "stardust": 5})
    
    await db.sage_progress.update_one(
        {"user_id": user_id},
        {
            "$inc": {
                "lumens": rewards.get("lumens", 0),
                "stardust": rewards.get("stardust", 0),
                "quests_completed": 1,
            }
        },
        upsert=True
    )
    
    # Check for level up (every 100 lumens)
    progress = await get_user_progress(user_id)
    new_level = (progress.get("lumens", 0) // 100) + 1
    if new_level > progress.get("level", 1):
        await db.sage_progress.update_one(
            {"user_id": user_id},
            {"$set": {"level": new_level}}
        )
    
    return {
        "success": True,
        "rewards": rewards,
        "message": f"Quest completed! +{rewards.get('lumens', 0)} Lumens, +{rewards.get('stardust', 0)} Stardust",
    }
