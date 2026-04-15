"""
scene_gen.py — AI Scene Generator for Light Therapy
Generates immersive background images from color/mood data via Gemini Nano Banana.
"""
import os
import uuid
import base64
from fastapi import APIRouter
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import Optional
from dotenv import load_dotenv

load_dotenv()

router = APIRouter(prefix="/scene-gen", tags=["scene-gen"])

EMERGENT_KEY = os.environ.get("EMERGENT_LLM_KEY")
SCENE_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "static", "scenes")
os.makedirs(SCENE_DIR, exist_ok=True)


MOOD_DESCRIPTORS = {
    "spectral": "ethereal ghostly glows, translucent aurora layers, bioluminescent mist",
    "winter": "frosted crystalline structures, ice cavern, cool blue tones, frozen lake",
    "ember": "smoldering coals, warm deep reds, volcanic rock, ember particles",
    "jade": "lush jade forest, emerald light filtering through canopy, mossy stones",
    "aurora": "northern lights curtains, shimmering greens and violets in dark sky",
    "solar": "golden sun rays, warm lens flares, radiant desert horizon",
    "lunar": "silver moonlight, gentle crater landscape, luminous night sky",
    "obsidian": "dark volcanic glass, deep black reflective surfaces, obsidian cave",
    "crystal": "faceted quartz formations, prismatic light refractions, crystal geode",
    "opal": "iridescent shifting colors, milky translucent stone, rainbow fire",
    "kinetic": "flowing energy streams, dynamic particle trails, electric motion",
    "ethereal": "soft dreamlike atmosphere, floating particles, gentle white mist",
    "radiant": "brilliant light burst, radiant beams, luminous energy center",
    "primal": "ancient earth tones, raw stone textures, primordial forest floor",
    "harmonic": "gentle wave patterns, resonant ripples, balanced sacred geometry",
    "serene": "calm still water, gentle twilight sky, peaceful meadow",
    "cosmic": "deep space nebula, distant stars, cosmic dust clouds",
    "sacred": "temple interior, candlelight, ancient stone arches, golden motes",
    "void": "absolute darkness with subtle distant lights, deep space emptiness",
    "ocean": "underwater light rays, coral formations, deep blue water",
}


class SceneRequest(BaseModel):
    resonance_name: Optional[str] = None
    colors: list  # List of hex color strings
    mood: Optional[str] = None
    source_prompt: Optional[str] = None


def build_scene_prompt(resonance_name, colors, mood):
    """Build a rich visual prompt from mood/color data."""
    base = "immersive atmospheric environment, ultra wide angle, no text, no people, no faces, no watermarks, cinematic lighting, high resolution, 16:9 aspect ratio"

    # Color context
    color_str = ", ".join(colors) if colors else ""
    color_desc = f"dominant color palette: {color_str}" if color_str else ""

    # Mood traits from name
    traits = []
    if resonance_name:
        for key, desc in MOOD_DESCRIPTORS.items():
            if key in resonance_name.lower():
                traits.append(desc)
    if mood:
        for key, desc in MOOD_DESCRIPTORS.items():
            if key in mood.lower():
                traits.append(desc)

    if not traits:
        traits.append("soft ambient glow, abstract flowing forms, meditative atmosphere")

    trait_str = ", ".join(traits[:3])

    # Combine
    parts = [base, color_desc, trait_str]
    if resonance_name:
        parts.append(f"inspired by the concept of '{resonance_name}'")
    return ", ".join(p for p in parts if p)


@router.post("/generate")
async def generate_scene(req: SceneRequest):
    if not EMERGENT_KEY:
        return {"error": "LLM key not configured", "image_url": None}

    prompt = build_scene_prompt(req.resonance_name, req.colors, req.mood)
    if req.source_prompt:
        prompt = f"{prompt}, {req.source_prompt}"

    try:
        from emergentintegrations.llm.chat import LlmChat, UserMessage

        chat = LlmChat(
            api_key=EMERGENT_KEY,
            session_id=f"scene-{uuid.uuid4().hex[:8]}",
            system_message="You are a visual scene generator. Create the described environment as an image.",
        ).with_model("gemini", "gemini-3.1-flash-image-preview").with_params(modalities=["image", "text"])

        msg = UserMessage(text=f"Generate this scene: {prompt}")
        text_resp, images = await chat.send_message_multimodal_response(msg)

        if images and len(images) > 0:
            img_data = images[0]
            img_bytes = base64.b64decode(img_data["data"])
            filename = f"scene_{uuid.uuid4().hex[:10]}.png"
            filepath = os.path.join(SCENE_DIR, filename)
            with open(filepath, "wb") as f:
                f.write(img_bytes)

            image_url = f"/api/scene-gen/image/{filename}"

            return {
                "image_url": image_url,
                "prompt_used": prompt[:200],
                "resonance_name": req.resonance_name,
            }
        else:
            return {"error": "No image generated", "image_url": None, "text": text_resp}

    except Exception as e:
        return {"error": str(e), "image_url": None}


@router.get("/image/{filename}")
async def serve_scene_image(filename: str):
    filepath = os.path.join(SCENE_DIR, filename)
    if not os.path.exists(filepath):
        return {"error": "Image not found"}
    return FileResponse(filepath, media_type="image/png")
