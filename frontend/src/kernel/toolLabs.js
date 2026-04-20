/**
 * toolLabs.js — Lab configurations bound to specific tool IDs.
 *
 * The LabStage reads this registry to determine which lab to run when a
 * Sovereign taps an unlocked blade. Tools without a lab entry fire the
 * Kernel interact directly (back-compat) — over time every blade should
 * have a lab attached so no Sparks are ever minted without Proof-of-Work.
 */

export const TOOL_LABS = {
  'geology.identify': {
    toolId: 'geology.identify',
    domain: 'geology',
    title: 'Identify the Quartz Signature',
    prompt: 'Which mineral signature belongs to pure quartz?',
    choices: ['SiO₂ · hexagonal lattice', 'CaCO₃ · rhombohedral', 'Fe₂O₃ · trigonal oxide'],
    correctIndex: 0,
    targetSec: 14,
    sparks: 4,
  },
  'geology.pluck': {
    toolId: 'geology.pluck',
    domain: 'geology',
    title: 'Pluck the Raw Crystal',
    prompt: 'Which strike angle safely cleaves a hexagonal quartz from its matrix?',
    choices: ['Perpendicular to the C-axis', 'Along the natural cleavage plane', 'Parallel to host vein'],
    correctIndex: 1,
    targetSec: 12,
    sparks: 3,
  },
  'masonry.chisel': {
    toolId: 'masonry.chisel',
    domain: 'masonry',
    title: 'Strike the First Cut',
    prompt: 'At what angle should the chisel meet the stone to begin a true cut?',
    choices: ['Straight 90° perpendicular', '15° undercut, bevel facing away', '45° direct with full mallet weight'],
    correctIndex: 1,
    targetSec: 15,
    sparks: 3,
  },
  'herbology.brew': {
    toolId: 'herbology.brew',
    domain: 'herbology',
    title: 'Set the Brew Ratio',
    prompt: 'For a warming chamomile decoction, what water-to-herb ratio preserves the volatile oils?',
    choices: ['10:1 · low concentration', '4:1 · balanced', '1:1 · saturated paste'],
    correctIndex: 1,
    targetSec: 18,
    sparks: 4,
  },
  'meditation.breathe': {
    toolId: 'meditation.breathe',
    domain: 'meditation',
    title: 'Align the Breath Ratio',
    prompt: 'Which inhale:hold:exhale ratio most reliably engages the parasympathetic (vagal) response?',
    choices: ['4:4:4 equal box', '4:7:8 longer exhale', '6:2:4 breath-held peak'],
    correctIndex: 1,
    targetSec: 15,
    sparks: 4,
  },
  'physics.resonate': {
    toolId: 'physics.resonate',
    domain: 'physics',
    title: 'Tune to Resonance',
    prompt: 'A string 0.6m long anchored both ends resonates at its fundamental. Which wavelength is correct?',
    choices: ['0.6 m', '1.2 m', '0.3 m'],
    correctIndex: 1,
    targetSec: 20,
    sparks: 5,
  },
  'culinary.reduce': {
    toolId: 'culinary.reduce',
    domain: 'culinary',
    title: 'Reduce with Purpose',
    prompt: 'What fraction of volume remains in a proper demi-glace reduction?',
    choices: ['Half (1/2)', 'One-third (1/3)', 'One-tenth (1/10)'],
    correctIndex: 1,
    targetSec: 14,
    sparks: 4,
  },
  'astronomy.align-scope': {
    toolId: 'astronomy.align-scope',
    domain: 'astronomy',
    title: 'Align the Scope',
    prompt: 'Which star, visible from the northern hemisphere, is closest to the celestial pole?',
    choices: ['Vega', 'Polaris', 'Sirius'],
    correctIndex: 1,
    targetSec: 10,
    sparks: 3,
  },
};

export function getLabFor(toolId) {
  return TOOL_LABS[toolId] || null;
}
