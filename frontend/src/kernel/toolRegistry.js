/**
 * toolRegistry.js — seed entries for the SovereignBridge.
 *
 * This file registers the CURRENT production tools. Any new tool MUST be
 * added here (or via a domain-specific registry that imports registerTool)
 * before it can fire `SovereignKernel.interact(...)`. The Bridge Rule is
 * enforced at runtime by `assertRegistered(toolId)`.
 *
 * Imported once from /app/frontend/src/index.js so registration happens
 * before any React component mounts.
 */

import { registerMany } from './SovereignBridge';

registerMany([
  /* ── Layer 2 · Workshops (seed set, expand as workshops onboard) ── */
  { id: 'geology.pluck',       layer: 2, domain: 'geology',      unlocks: ['crystal_fragment'],       requires: [],                       sparks: 2, purpose: 'Identify and collect a raw mineral from the substrate.' },
  { id: 'geology.chisel',      layer: 2, domain: 'geology',      unlocks: ['quartz_key'],             requires: ['crystal_fragment'],     sparks: 3, purpose: 'Refine a fragment into a Quartz Key usable in the Observatory.' },
  { id: 'herbology.pluck',     layer: 2, domain: 'herbology',    unlocks: ['raw_herb'],               requires: [],                       sparks: 2, purpose: 'Collect a raw herb from its growing zone.' },
  { id: 'herbology.brew',      layer: 2, domain: 'herbology',    unlocks: ['elixir_base'],            requires: ['raw_herb'],             sparks: 3, purpose: 'Break and grind herbs into an elixir base.' },
  { id: 'herbology.dose',      layer: 2, domain: 'herbology',    unlocks: ['completed_elixir'],       requires: ['elixir_base'],          sparks: 4, purpose: 'PHI-aligned dosing of the elixir to activate its resonance.' },
  { id: 'masonry.chisel',      layer: 2, domain: 'masonry',      unlocks: ['carved_block'],           requires: [],                       sparks: 2, purpose: 'Carve a raw stone block into geometric form.' },
  { id: 'masonry.mallet',      layer: 2, domain: 'masonry',      unlocks: ['struck_stone'],           requires: ['carved_block'],         sparks: 2, purpose: 'Align and seat the carved block with rhythmic strikes.' },
  { id: 'masonry.trowel',      layer: 2, domain: 'masonry',      unlocks: ['set_stone'],              requires: ['struck_stone'],         sparks: 3, purpose: 'Bind the stone into the cathedral course.' },
  { id: 'masonry.level',       layer: 2, domain: 'masonry',      unlocks: ['true_course'],            requires: ['set_stone'],            sparks: 3, purpose: 'Verify alignment — triggers the Quest Bridge for sacred geometry.' },
  { id: 'aromatherapy.diffuse',layer: 2, domain: 'aromatherapy', unlocks: ['scent_resonance'],        requires: ['completed_elixir'],     sparks: 3, purpose: 'Release an aromatic signature that resonates with a solfeggio band.' },
  { id: 'meditation.breathe',  layer: 2, domain: 'meditation',   unlocks: ['breath_coherence'],       requires: [],                       sparks: 2, purpose: 'PHI-paced breath cycles that deepen HRV coherence.' },
  { id: 'meditation.bell',     layer: 2, domain: 'meditation',   unlocks: ['bell_tone'],              requires: ['breath_coherence'],     sparks: 2, purpose: 'Strike the bell at a 528Hz sub-harmonic to anchor the session.' },
  { id: 'meditation.mandala',  layer: 2, domain: 'meditation',   unlocks: ['mandala_completion'],     requires: ['bell_tone'],            sparks: 4, purpose: 'Complete a mandala cycle — unlocks the Crystalline dome.' },

  /* ── Reflexology blades (v68.40) ─────────────────────────────
   * Foot-mapped bodywork pillar. Each blade corresponds to a mode
   * in the Reflex Sanctuary page (/reflexology). `atlas-study` is
   * the free-exploration entry; the others gate on real engagement.
   */
  { id: 'reflexology.atlas-study',  layer: 2, domain: 'reflexology', unlocks: ['reflex_atlas_read'],         requires: [],                          sparks: 2, purpose: 'Study the 32-zone foot atlas. Unlocks tactile practice.' },
  { id: 'reflexology.locate-zone',  layer: 2, domain: 'reflexology', unlocks: ['reflex_locate_mastery'],     requires: ['reflex_atlas_read'],       sparks: 3, purpose: 'Identify a zone on cue. 3-in-a-row streak seals the mastery.' },
  { id: 'reflexology.press',        layer: 2, domain: 'reflexology', unlocks: ['reflex_press_release'],      requires: ['reflex_locate_mastery'],   sparks: 3, purpose: 'Apply technique-appropriate pressure to a chosen zone.' },
  { id: 'reflexology.routine',      layer: 2, domain: 'reflexology', unlocks: ['reflex_routine_complete'],   requires: ['reflex_press_release'],    sparks: 6, purpose: 'Complete the 8-zone starter routine (~8 minutes).' },
  { id: 'reflexology.meridian-align', layer: 3, domain: 'reflexology', unlocks: ['reflex_meridian_seal'],    requires: ['reflex_routine_complete'], sparks: 5, purpose: 'Cross-reference reflex zones with acupressure meridians for whole-body attunement.' },
  { id: 'reflexology.solfeggio-pair', layer: 3, domain: 'reflexology', unlocks: ['reflex_solfeggio_seal'],   requires: ['reflex_routine_complete'], sparks: 5, purpose: 'Pair each reflex zone to its resonant Solfeggio frequency in the Mixer.' },

  /* ── Layer 3 · Quest Bridge (interconnects that consume Layer-2 unlocks) ── */
  { id: 'bridge.quartz-to-observatory', layer: 3, domain: 'observatory', unlocks: ['tesseract_access'],   requires: ['quartz_key'],            sparks: 5, purpose: 'Use a Quartz Key to unlock the Tesseract in the Observatory.' },
  { id: 'bridge.elixir-to-alchemy',     layer: 3, domain: 'alchemy',     unlocks: ['alchemy_seat'],        requires: ['completed_elixir'],      sparks: 5, purpose: 'Present a completed elixir to earn a seat at the Alchemy circle.' },
  { id: 'bridge.mandala-to-dome',       layer: 3, domain: 'dome',        unlocks: ['dome_access'],         requires: ['mandala_completion'],    sparks: 5, purpose: 'Cross the threshold into the Crystalline Dome.' },

  /* ── Layer 4 · VR / Gamified Realms (merit-gated) ── */
  { id: 'starseed.begin-adventure',     layer: 4, domain: 'starseed',    unlocks: ['adventure_active'],    requires: [],                        sparks: 8, purpose: 'Begin a channelled starseed adventure with GPT-5.2.' },
  { id: 'starseed.resume',              layer: 4, domain: 'starseed',    unlocks: ['adventure_active'],    requires: ['adventure_active'],      sparks: 2, purpose: 'Resume an in-progress starseed adventure.' },
  { id: 'starseed.make-choice',         layer: 4, domain: 'starseed',    unlocks: ['scene_progress'],      requires: ['adventure_active'],      sparks: 3, purpose: 'Make a choice that shapes the adventure narrative.' },
  { id: 'vr.observatory',               layer: 4, domain: 'observatory', unlocks: ['celestial_nav'],       requires: ['tesseract_access'],      sparks: 10, purpose: 'Enter the Observatory VR realm with celestial navigation.' },
  { id: 'vr.crystalline-dome',          layer: 4, domain: 'dome',        unlocks: ['dome_synthesis'],      requires: ['dome_access'],           sparks: 10, purpose: 'Enter the Crystalline Dome VR realm for synthesis.' },
]);


// Scaffold the remaining 222+ tools AFTER the real registrations so the
// scaffold's `isRegistered(id)` check correctly skips real entries. This
// makes the Tool Drawer render the full 243-blade silhouette from day one.
import registerScaffold from './toolScaffold';
registerScaffold();
