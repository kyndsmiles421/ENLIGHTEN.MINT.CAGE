from pydantic import BaseModel, Field
from typing import List, Optional


class UserCreate(BaseModel):
    name: str
    email: str
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class MoodCreate(BaseModel):
    mood: str
    intensity: int = Field(ge=1, le=10)
    note: Optional[str] = None
    moods: Optional[list[str]] = None  # Multi-select: list of mood IDs

class JournalCreate(BaseModel):
    title: str
    content: str
    mood: Optional[str] = None

class AffirmationRequest(BaseModel):
    theme: Optional[str] = "general"

class AIGenerateRequest(BaseModel):
    topic: Optional[str] = "general"

class RitualStep(BaseModel):
    type: str
    name: str
    duration: int
    config: Optional[dict] = None

class RitualCreate(BaseModel):
    name: str
    time_of_day: str = "morning"
    steps: List[RitualStep]

class RitualComplete(BaseModel):
    duration_seconds: int
    steps_completed: int

class CommunityPostCreate(BaseModel):
    post_type: str
    content: str
    ritual_data: Optional[dict] = None
    affirmation_text: Optional[str] = None
    milestone_type: Optional[str] = None
    milestone_value: Optional[int] = None

class CommentCreate(BaseModel):
    text: str

class ChallengeCheckin(BaseModel):
    note: Optional[str] = None

class ProfileCustomize(BaseModel):
    display_name: Optional[str] = None
    bio: Optional[str] = None
    vibe_status: Optional[str] = None
    favorite_quote: Optional[str] = None
    cover_image: Optional[str] = None
    avatar_style: Optional[str] = None
    avatar_url: Optional[str] = None
    theme_color: Optional[str] = None
    music_choice: Optional[str] = None
    music_frequency: Optional[float] = None
    show_stats: Optional[bool] = True
    show_activity: Optional[bool] = True
    visibility: Optional[str] = None
    message_privacy: Optional[str] = None

class ReadingRequest(BaseModel):
    reading_type: str
    spread: Optional[str] = None
    zodiac_sign: Optional[str] = None
    birth_year: Optional[int] = None
    question: Optional[str] = None
    # V68.61 — Resonance Cross-Pollination. Optional snapshot of the
    # ContextBus state from other active modules (Forecast, Avatar,
    # Story, Scene). Spliced into the system prompt so the Tarot /
    # I Ching / etc. reading reflects the user's current engine state.
    context_primer: Optional[str] = None

class ClassEnroll(BaseModel):
    class_id: str

class LessonComplete(BaseModel):
    class_id: str
    lesson_id: str

class NarrationRequest(BaseModel):
    text: str
    speed: Optional[float] = None
    voice: Optional[str] = None
    context: Optional[str] = None

class KnowledgeRequest(BaseModel):
    topic: str
    category: str
    context: Optional[str] = None
    # V1.0.8 — `mode` lets callers request a fast chamber-friendly
    # lesson (~500 words, gpt-4o-mini, <=25s wall clock) instead of
    # the full deep-dive (gpt-5.2, ~1500 words, 45-90s). The preview
    # ingress kills requests at 60s, so the chamber LEARN button hung
    # at "TEACHING…" forever. mode='quick' is the chamber path.
    mode: Optional[str] = None

class CustomCreation(BaseModel):
    type: str
    title: str
    content: str
    tags: Optional[list] = []

class AICreateRequest(BaseModel):
    type: str
    intention: str

class PlantCreate(BaseModel):
    plant_type: str

class GuidedMeditationRequest(BaseModel):
    intention: str
    duration: int = 10
    focus: str = "general"
    name: Optional[str] = None

class AvatarConfig(BaseModel):
    body_type: str = "balanced"
    aura_color: str = "#D8B4FE"
    aura_intensity: float = 0.6
    silhouette: str = "default"
    robe_style: str = "flowing"
    robe_color: str = "#1E1B4B"
    chakra_emphasis: str = "all"
    particle_density: str = "medium"
    glow_style: str = "soft"
    energy_trails: bool = True

class WaitlistEntry(BaseModel):
    email: str
    name: Optional[str] = None
