"""
ENLIGHTEN.MINT.CAFE - Promotional Video Generator
Architect: Steven Michael | Terminal: kyndsmiles@gmail.com
Purpose: Generate 90-second promotional video using Sora 2
Aesthetic: Crystal & Refracted Rainbow with Obsidian Void
"""

import asyncio
import sys
import os
import time
from datetime import datetime
from dotenv import load_dotenv

# Load environment variables FIRST
load_dotenv()

from emergentintegrations.llm.openai.video_generation import OpenAIVideoGeneration

# ═══════════════════════════════════════════════════════════════════════════
# VIDEO CONFIGURATION
# ═══════════════════════════════════════════════════════════════════════════

OUTPUT_DIR = "/app/promo_videos"
FINAL_VIDEO_NAME = "enlighten_cafe_promo"

# Each segment is 12 seconds max - we'll create multiple clips
# Total target: ~90 seconds = 8 clips x 12 seconds = 96 seconds

VIDEO_SEGMENTS = [
    {
        "name": "01_obsidian_void_awakening",
        "prompt": """
        Cinematic establishing shot: Deep obsidian black void slowly awakening with golden light particles.
        Tiny gold rutilation threads emerge from the darkness, weaving intricate geometric sacred patterns.
        The camera slowly pushes forward through an infinite crystalline lattice structure.
        Mystical atmosphere, 4K quality, ethereal lighting, macro crystal photography style.
        Brand: ENLIGHTEN.MINT.CAFE wellness sanctuary.
        """,
        "duration": 12,
        "size": "1280x720"
    },
    {
        "name": "02_crystal_rainbow_refraction",
        "prompt": """
        Mesmerizing close-up of a massive Herkimer diamond crystal rotating slowly in space.
        Rainbow light refracts through the crystal, creating prismatic aurora patterns.
        Selenite pillars emerge from below, glowing with soft white luminescence.
        Colors shift between deep purple, electric blue, gold, and rose quartz pink.
        Cinematic slow motion, ethereal mystical atmosphere, meditation sanctuary aesthetic.
        """,
        "duration": 12,
        "size": "1280x720"
    },
    {
        "name": "03_digital_oracle_interface",
        "prompt": """
        Futuristic holographic interface materializes from golden mist.
        Tarot cards, astrological symbols, and I Ching hexagrams float in 3D space.
        Digital particles form constellations and sacred geometry patterns.
        A glowing orb pulses at the center with 963Hz frequency visualization.
        Cyberpunk meets ancient mysticism, dark obsidian background, neon gold accents.
        """,
        "duration": 12,
        "size": "1280x720"
    },
    {
        "name": "04_wellness_transformation",
        "prompt": """
        Smooth transition from digital space to organic wellness environment.
        Fresh vibrant ingredients - green matcha powder, golden turmeric, purple acai - 
        swirl together in slow motion forming a cosmic spiral.
        Steam rises in ethereal wisps, catching rainbow light.
        Vegan superfood bowls arranged like mandala art, plant-based elegance.
        High-end culinary photography meets mystical atmosphere.
        """,
        "duration": 12,
        "size": "1280x720"
    },
    {
        "name": "05_mobile_sanctuary_reveal",
        "prompt": """
        Cinematic reveal of a sleek, futuristic food truck wrapped in obsidian black.
        Gold geometric patterns and crystal motifs decorate the exterior.
        The truck transforms, panels opening to reveal a glowing wellness bar inside.
        Soft purple and gold lighting emanates from within.
        Urban setting at golden hour, ethereal mist surrounds the scene.
        Brand: ENLIGHTEN.MINT.CAFE mobile experience.
        """,
        "duration": 12,
        "size": "1280x720"
    },
    {
        "name": "06_immersive_experience",
        "prompt": """
        First-person perspective entering an immersive sensory dome.
        Walls pulse with bioluminescent patterns and aurora borealis effects.
        Floating crystal formations reflect infinite mirrors of light.
        Sound visualization waves ripple through the space in gold and violet.
        Meditation sanctuary, binaural frequency visualization, cosmic cocoon atmosphere.
        """,
        "duration": 12,
        "size": "1280x720"
    },
    {
        "name": "07_community_connection",
        "prompt": """
        Diverse group of people in a mystical gathering space.
        They hold glowing crystals that connect with golden light threads.
        The threads form a beautiful network of sacred geometry in the air.
        Faces illuminated by warm golden light, expressions of peace and wonder.
        Community wellness ritual, collective consciousness visualization.
        """,
        "duration": 12,
        "size": "1280x720"
    },
    {
        "name": "08_brand_finale",
        "prompt": """
        Final cinematic shot: All elements converge - crystals, golden threads, rainbow refractions.
        They spiral together forming a luminous lotus flower that blooms.
        The flower transforms into the text "ENLIGHTEN.MINT.CAFE" in elegant gold typography.
        Tagline materializes below: "Nourish Body. Illuminate Mind. Elevate Spirit."
        Obsidian background, gold particles drift gently, mystical brand reveal.
        """,
        "duration": 12,
        "size": "1280x720"
    }
]

# ═══════════════════════════════════════════════════════════════════════════
# VIDEO GENERATION FUNCTIONS
# ═══════════════════════════════════════════════════════════════════════════

def ensure_output_dir():
    """Create output directory if it doesn't exist"""
    if not os.path.exists(OUTPUT_DIR):
        os.makedirs(OUTPUT_DIR)
        print(f"[SORA2] Created output directory: {OUTPUT_DIR}")

def generate_single_segment(segment: dict, segment_num: int, total: int) -> str:
    """Generate a single video segment using Sora 2"""
    
    print(f"\n{'═' * 60}")
    print(f"[SORA2] Generating Segment {segment_num}/{total}: {segment['name']}")
    print(f"[SORA2] Duration: {segment['duration']}s | Size: {segment['size']}")
    print(f"{'═' * 60}")
    
    output_path = f"{OUTPUT_DIR}/{segment['name']}.mp4"
    
    # Create fresh instance for each generation
    video_gen = OpenAIVideoGeneration(api_key=os.environ['EMERGENT_LLM_KEY'])
    
    # Clean up prompt (remove extra whitespace)
    clean_prompt = " ".join(segment['prompt'].split())
    
    print(f"[SORA2] Prompt: {clean_prompt[:100]}...")
    print(f"[SORA2] Starting generation (this may take 3-8 minutes)...")
    
    start_time = time.time()
    
    try:
        video_bytes = video_gen.text_to_video(
            prompt=clean_prompt,
            model="sora-2",
            size=segment['size'],
            duration=segment['duration'],
            max_wait_time=900  # 15 minutes max wait
        )
        
        elapsed = time.time() - start_time
        
        if video_bytes:
            video_gen.save_video(video_bytes, output_path)
            print(f"[SORA2] ✅ Segment saved: {output_path}")
            print(f"[SORA2] Generation time: {elapsed:.1f} seconds")
            return output_path
        else:
            print(f"[SORA2] ❌ Failed to generate segment: {segment['name']}")
            return None
            
    except Exception as e:
        elapsed = time.time() - start_time
        print(f"[SORA2] ❌ Error generating {segment['name']}: {str(e)}")
        print(f"[SORA2] Time elapsed before error: {elapsed:.1f} seconds")
        return None

def generate_all_segments():
    """Generate all video segments"""
    
    ensure_output_dir()
    
    print("\n" + "═" * 70)
    print("  ENLIGHTEN.MINT.CAFE - PROMOTIONAL VIDEO GENERATION")
    print("  Architect: Steven Michael | Terminal: kyndsmiles@gmail.com")
    print("  Total Segments: " + str(len(VIDEO_SEGMENTS)))
    print("  Target Duration: ~96 seconds (8 x 12s clips)")
    print("═" * 70 + "\n")
    
    # Check API key
    api_key = os.environ.get('EMERGENT_LLM_KEY')
    if not api_key:
        print("[SORA2] ❌ ERROR: EMERGENT_LLM_KEY not found in environment!")
        return []
    
    print(f"[SORA2] API Key configured: {api_key[:15]}...")
    
    generated_files = []
    total = len(VIDEO_SEGMENTS)
    
    for i, segment in enumerate(VIDEO_SEGMENTS, 1):
        result = generate_single_segment(segment, i, total)
        if result:
            generated_files.append(result)
        
        # Brief pause between generations to avoid rate limiting
        if i < total:
            print(f"[SORA2] Pausing 5 seconds before next segment...")
            time.sleep(5)
    
    # Summary
    print("\n" + "═" * 70)
    print("  GENERATION COMPLETE")
    print(f"  Successfully generated: {len(generated_files)}/{total} segments")
    print("═" * 70)
    
    if generated_files:
        print("\n📁 Generated video files:")
        for f in generated_files:
            print(f"   • {f}")
        
        print(f"\n📍 All files saved in: {OUTPUT_DIR}")
        print("\n💡 To combine clips into one video, use:")
        print(f"   ffmpeg -f concat -safe 0 -i filelist.txt -c copy {OUTPUT_DIR}/{FINAL_VIDEO_NAME}.mp4")
    
    return generated_files

def generate_single_demo():
    """Generate just one segment for quick testing"""
    
    ensure_output_dir()
    
    print("\n[SORA2] Quick Demo - Generating single 12-second clip...")
    
    # Use the brand finale as demo
    demo_segment = {
        "name": "demo_enlighten_cafe",
        "prompt": """
        Cinematic mystical scene: Deep obsidian black void with golden light particles emerging.
        A massive crystal slowly rotates, refracting rainbow aurora light patterns.
        Gold rutilation threads weave sacred geometry patterns through the space.
        Text "ENLIGHTEN.MINT.CAFE" materializes in elegant gold typography.
        Ethereal, mystical wellness sanctuary atmosphere, 4K cinematic quality.
        """,
        "duration": 12,
        "size": "1280x720"
    }
    
    result = generate_single_segment(demo_segment, 1, 1)
    
    if result:
        print(f"\n✅ Demo video ready: {result}")
    else:
        print("\n❌ Demo generation failed")
    
    return result

# ═══════════════════════════════════════════════════════════════════════════
# MAIN EXECUTION
# ═══════════════════════════════════════════════════════════════════════════

if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description="Generate ENLIGHTEN.MINT.CAFE promotional video")
    parser.add_argument("--demo", action="store_true", help="Generate single 12s demo clip")
    parser.add_argument("--full", action="store_true", help="Generate all 8 segments (~96s total)")
    parser.add_argument("--segment", type=int, help="Generate specific segment number (1-8)")
    
    args = parser.parse_args()
    
    if args.demo:
        generate_single_demo()
    elif args.segment:
        if 1 <= args.segment <= len(VIDEO_SEGMENTS):
            ensure_output_dir()
            segment = VIDEO_SEGMENTS[args.segment - 1]
            generate_single_segment(segment, args.segment, len(VIDEO_SEGMENTS))
        else:
            print(f"Invalid segment number. Choose 1-{len(VIDEO_SEGMENTS)}")
    elif args.full:
        generate_all_segments()
    else:
        # Default: generate demo
        print("Usage:")
        print("  python generate_promo_video.py --demo    # Quick 12s demo clip")
        print("  python generate_promo_video.py --full    # All 8 segments (~96s)")
        print("  python generate_promo_video.py --segment 3  # Specific segment")
        print("\nRunning demo mode by default...")
        generate_single_demo()
