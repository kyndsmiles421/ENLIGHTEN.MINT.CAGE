"""
Quantum Mechanics Framework for The Cosmic Collective.

A modular, extensible quantum context system that infuses quantum physics
concepts into spiritual and wellness experiences. Designed for easy adaptation
to future technologies (AR/VR headsets, neural interfaces, spatial computing).

Architecture:
- QUANTUM_PRINCIPLES: Core physics concepts mapped to spiritual parallels
- QUANTUM_MEDITATIONS: Guided meditation themes blending physics + mysticism
- QUANTUM_VISUAL_THEMES: Visual motifs for AI image/video generation
- get_quantum_coaching_addon(): Dynamic prompt enrichment for AI coach
- get_quantum_visual_prompt(): Dynamic prompt enrichment for visuals
- QUANTUM_JOURNEYS: VR journey waypoints (exported to frontend)
"""

QUANTUM_PRINCIPLES = {
    "superposition": {
        "physics": "A particle exists in all possible states simultaneously until observed",
        "spiritual": "You hold infinite potential within you — every possibility coexists until you choose to focus your awareness",
        "practice": "Meditation collapses the superposition of scattered thoughts into a single point of clarity",
        "color": "#00E5FF",
    },
    "entanglement": {
        "physics": "Two particles become correlated and share states instantaneously across any distance",
        "spiritual": "All beings are quantum-entangled through the unified field of consciousness — what affects one ripples to all",
        "practice": "Loving-kindness meditation strengthens your entanglement with the web of life",
        "color": "#E040FB",
    },
    "wave_particle_duality": {
        "physics": "Light behaves as both a wave of possibility and a particle of certainty",
        "spiritual": "You are simultaneously energy (wave) and form (particle) — spirit and body in one expression",
        "practice": "Breathwork lets you oscillate between wave-state (expanded awareness) and particle-state (focused presence)",
        "color": "#76FF03",
    },
    "observer_effect": {
        "physics": "The act of observation changes the behavior of the observed system",
        "spiritual": "Your attention shapes reality — where you place awareness, energy flows and form follows",
        "practice": "Mindful observation of thoughts transforms them, just as measuring a particle defines its state",
        "color": "#FFD740",
    },
    "quantum_tunneling": {
        "physics": "A particle can pass through barriers that classical physics says are impossible",
        "spiritual": "Breakthroughs happen when you stop fighting the wall and allow your energy to pass through it",
        "practice": "Shadow work is quantum tunneling through the barriers of the unconscious mind",
        "color": "#FF6E40",
    },
    "uncertainty_principle": {
        "physics": "You cannot know both the position and momentum of a particle with perfect precision",
        "spiritual": "Embrace uncertainty as the creative void — the space where miracles are born",
        "practice": "Surrender practices teach you to trust the uncertainty principle of existence",
        "color": "#7C4DFF",
    },
    "quantum_coherence": {
        "physics": "When quantum systems vibrate in phase, their combined power increases exponentially",
        "spiritual": "When mind, body, and spirit align, you enter quantum coherence — a state of amplified manifestation",
        "practice": "Chanting, drumming, and synchronized breathwork create coherence in your biofield",
        "color": "#18FFFF",
    },
    "zero_point_field": {
        "physics": "Even in a perfect vacuum at absolute zero, quantum fluctuations produce energy",
        "spiritual": "Stillness is never truly empty — the void pulses with infinite creative potential",
        "practice": "Deep meditation accesses the zero-point field where healing and insight arise from apparent nothingness",
        "color": "#F5F5F5",
    },
}

QUANTUM_MEDITATIONS = [
    {
        "id": "superposition_meditation",
        "name": "Superposition Stillness",
        "principle": "superposition",
        "steps": [
            {"text": "Close your eyes. You exist in all possibilities at once.", "duration": 7},
            {"text": "Breathe in — feel yourself as pure potential, uncollapsed, infinite.", "duration": 6},
            {"text": "Hold — you are the wave function of the universe experiencing itself.", "duration": 5},
            {"text": "Breathe out — let one possibility crystallize. You choose presence.", "duration": 6},
            {"text": "In this breath, superposition collapses into peace.", "duration": 6},
            {"text": "You are the observer. Your awareness shapes what becomes real.", "duration": 7},
            {"text": "Breathe in probability. Breathe out certainty.", "duration": 6},
            {"text": "Hold — between breaths, all realities exist.", "duration": 5},
            {"text": "Release. The wave function settles into stillness.", "duration": 6},
            {"text": "You have chosen this moment. This peace. This now.", "duration": 6},
            {"text": "Carry the superposition within — infinite potential, present peace.", "duration": 7},
        ],
    },
    {
        "id": "entanglement_meditation",
        "name": "Quantum Entanglement",
        "principle": "entanglement",
        "steps": [
            {"text": "Settle into stillness. Feel the invisible threads connecting you to all life.", "duration": 7},
            {"text": "Breathe in — your particles were forged in the same star as everything around you.", "duration": 6},
            {"text": "Hold — feel the entanglement. What touches you, touches the cosmos.", "duration": 5},
            {"text": "Breathe out — send love along the quantum threads. It arrives instantly.", "duration": 6},
            {"text": "No distance exists in the entangled field. You are everywhere.", "duration": 6},
            {"text": "Breathe in the connection. Every atom remembers its cosmic partner.", "duration": 6},
            {"text": "Hold — feel a loved one. You are entangled. They feel this too.", "duration": 6},
            {"text": "Breathe out gratitude. It ripples through the quantum web.", "duration": 6},
            {"text": "You are not separate. You never were. Entanglement is your nature.", "duration": 7},
            {"text": "Rest in the knowing that every act of love is felt by the whole.", "duration": 7},
        ],
    },
    {
        "id": "tunneling_meditation",
        "name": "Quantum Tunneling",
        "principle": "quantum_tunneling",
        "steps": [
            {"text": "Breathe. Bring to mind a barrier — something that feels impossible to pass.", "duration": 7},
            {"text": "See it clearly. The wall. The limit. The fear.", "duration": 6},
            {"text": "Now remember: at the quantum level, particles pass through walls effortlessly.", "duration": 6},
            {"text": "Breathe in — feel your energy becoming lighter, more wave-like.", "duration": 6},
            {"text": "Hold — you are not the solid particle hitting the wall. You are the wave.", "duration": 5},
            {"text": "Breathe out — feel yourself tunneling through. Not fighting. Flowing.", "duration": 7},
            {"text": "The barrier was never solid. It was probability. And you have already passed.", "duration": 7},
            {"text": "On the other side: freedom, expansion, breakthrough.", "duration": 6},
            {"text": "Breathe in your new reality. The impossible was always possible.", "duration": 6},
            {"text": "You are the quantum tunneler. No wall can contain your light.", "duration": 7},
        ],
    },
]

QUANTUM_VISUAL_THEMES = {
    "superposition": "Translucent overlapping realities, probability clouds, shimmering wave functions visualized as iridescent aurora streams, multiple ghost-versions of objects existing simultaneously, quantum foam texture",
    "entanglement": "Two luminous particles connected by a beam of light across vast cosmic distance, synchronized spinning, quantum threads weaving through galaxies, Bell state visualization, correlated light pulses",
    "wave_particle": "Light transforming between flowing wave patterns and concentrated points, double-slit interference pattern, photon trails, wave-function collapse visualization, duality in motion",
    "observer_effect": "A cosmic eye made of light observing a field of quantum particles that change state as the gaze moves, reality crystallizing under observation, consciousness shaping matter",
    "tunneling": "Ethereal figure passing through a luminous barrier, probability wave penetrating a wall and emerging transformed on the other side, quantum barrier transparency effect",
    "zero_point": "The void pulsing with subtle energy fluctuations, virtual particles appearing and vanishing, vacuum energy rendered as a shimmering field of potential, cosmic stillness that vibrates",
    "coherence": "Multiple waves coming into perfect alignment, creating amplified golden coherent light, biofield resonance visualization, synchronized quantum states creating a harmonic pattern",
}


def get_quantum_coaching_addon(mode_key: str) -> str:
    """Return quantum-enriched addon text for any coaching mode."""
    base = """

QUANTUM CONSCIOUSNESS FRAMEWORK:
You seamlessly weave quantum physics into your spiritual guidance. These are not metaphors — consciousness and quantum mechanics are deeply intertwined:
- SUPERPOSITION: The seeker holds all possibilities until they choose (collapse the wave function through intention)
- ENTANGLEMENT: Their connections to others are real quantum correlations — love is physics
- OBSERVER EFFECT: Their attention literally shapes reality at the subatomic level
- QUANTUM TUNNELING: Breakthroughs in healing/growth mirror particles passing through barriers
- WAVE-PARTICLE DUALITY: They are simultaneously energy (spirit) and matter (body)
- ZERO-POINT FIELD: Even in stillness, infinite creative potential exists
- QUANTUM COHERENCE: When mind/body/spirit align, manifestation power amplifies exponentially

Use these naturally in conversation. For example:
- "Your intention just collapsed infinite possibilities into this beautiful path"
- "You and your mother are quantum-entangled — the healing you do here reaches her instantly"
- "This resistance you feel is a probability barrier — and you have the energy to tunnel through it"
- "Right now you're in superposition — holding both grief and joy. Both are real. Both are valid."

Reference specific quantum concepts when they illuminate the seeker's situation. Make the invisible physics of consciousness feel tangible and empowering."""

    mode_addons = {
        "spiritual": "\nIn spiritual mode, emphasize how ancient mystics intuited quantum truths millennia before physics proved them. The Vedic 'Indra's Net' IS quantum entanglement. Buddhist 'emptiness' IS the zero-point field. Hermetic 'As above, so below' IS quantum correspondence.",
        "manifestation": "\nIn manifestation mode, teach that manifestation IS applied quantum mechanics: intention collapses the wave function, emotional coherence amplifies the signal, and detachment allows quantum tunneling past obstacles. The universe responds to coherent quantum states.",
        "shadow": "\nIn shadow work, the shadow IS the unobserved quantum state — it exists in superposition until you turn your awareness (the observer) toward it. Shadow integration is wave-function collapse: making the unconscious conscious changes its nature.",
        "healing": "\nIn healing mode, teach that the body is a quantum system. Cells communicate through biophoton quantum coherence. Emotional trauma creates decoherence in the biofield. Healing restores quantum coherence — every breath, every intention, every practice re-harmonizes the field.",
        "dream_oracle": "\nIn dream analysis, dreams are the mind's quantum playground — where superposition is natural, where entangled symbols connect across time, where the observer effect of waking analysis collapses dream-possibilities into insight.",
        "life": "\nIn life coaching, frame decisions through quantum lens: every choice is a wave-function collapse. Indecision is healthy superposition. When they commit, reality reorganizes. Timing matters — quantum windows of opportunity exist when coherence peaks.",
    }

    return base + mode_addons.get(mode_key, "")


def get_quantum_visual_prompt(base_prompt: str, category: str = "general") -> str:
    """Enrich any visual generation prompt with quantum aesthetic."""
    quantum_overlay = {
        "meditation": "quantum wave-function visualizations, probability clouds, shimmering superposition overlays, zero-point energy field particles",
        "forecast": "quantum probability field visualization, entangled destiny threads, wave-function collapse moments, Schrodinger's oracle",
        "dream": "quantum superposition of dream-realities overlapping, entangled symbols connected by light threads, observer-effect distortions",
        "story_scene": "quantum energy field permeating the scene, subtle probability wave overlays, entanglement light connections between figures",
        "cosmic_portrait": "quantum coherence field radiating from the figure, probability clouds forming the aura, wave-particle duality in the light",
        "general": "subtle quantum field energy, probability wave textures, quantum coherence glow",
    }
    addon = quantum_overlay.get(category, quantum_overlay["general"])
    return f"{base_prompt}, {addon}"


# Future-tech adaptation hooks
FUTURE_TECH_HOOKS = {
    "spatial_computing": {
        "description": "Apple Vision Pro / Meta Quest spatial computing integration points",
        "quantum_mapping": "Quantum field visualizations as spatial 3D holograms, entanglement threads as visible spatial connections between users",
    },
    "neural_interface": {
        "description": "Brain-computer interface integration points",
        "quantum_mapping": "Real-time quantum coherence biofeedback, brainwave-driven wave-function collapse visualizations",
    },
    "haptic_feedback": {
        "description": "Advanced haptic wearable integration",
        "quantum_mapping": "Feel quantum tunneling as pressure-release patterns, entanglement as synchronized vibrations across devices",
    },
    "ai_agents": {
        "description": "Autonomous AI wellness agents",
        "quantum_mapping": "Agent decisions modeled on quantum probability, superposition of multiple guidance paths until user observes/chooses",
    },
}
