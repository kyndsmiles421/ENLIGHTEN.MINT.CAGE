/**
 * toolScaffold.js — Full 243 Swiss Army Knife silhouette.
 *
 * Scaffolds the entire known tool universe so the Tool Drawer shows the
 * Sovereign's full arsenal on day one — most blades LOCKED in dark
 * charcoal, a handful gleaming as Refracted Crystal where the 21 real
 * tools from `toolRegistry.js` already live.
 *
 * Every stub is a registered entry that honors the Bridge Rule. When a
 * stub is replaced with a real implementation, just update its entry in
 * toolRegistry.js — `registerMany` overwrites silently.
 *
 * Distribution: 27 workshops × 9 tools = 243 blades.
 */

import { isRegistered, registerMany } from './SovereignBridge';

// 27 canonical workshops — the full Sovereign Flow Map Layer 2 catalogue.
// Each gets a layer assignment and a baseline resonance/purpose template.
const WORKSHOPS = [
  // Already have real tools (don't double-register those)
  { domain: 'geology',      layer: 2, blade: 'educational',   tools: ['survey','identify','sledgehammer','pickaxe','loupe','cleave','lattice-map','polish','resonance-test'] },
  { domain: 'masonry',      layer: 2, blade: 'educational',   tools: ['chisel','mallet','trowel','level','plumbline','float','rasp','block-shape','keystone-set'] },
  { domain: 'herbology',    layer: 2, blade: 'educational',   tools: ['pluck','brew','dose','wash','dry','tincture','press','distill','catalogue'] },
  { domain: 'aromatherapy', layer: 2, blade: 'educational',   tools: ['diffuse','blend','extract','bottle','label','roller','mist','inhale','carrier-mix'] },
  { domain: 'meditation',   layer: 2, blade: 'educational',   tools: ['breathe','bell','mandala','mantra','mudra','sit','chant','gaze','silent-hold'] },
  // 22 new workshops — mostly stubs, fully tier-ordered via requires chain
  { domain: 'carpentry',    layer: 2, blade: 'educational',   tools: ['saw','plane','joinery','dovetail','sand','finish','groove','lathe-turn','glue-bind'] },
  { domain: 'culinary',     layer: 2, blade: 'educational',   tools: ['knead','ferment','reduce','whip','sear','proof','julienne','emulsify','plate'] },
  { domain: 'physics',      layer: 2, blade: 'educational',   tools: ['measure','graph','oscillate','resonate','tune-fork','spring','pendulum','magnet-field','gyro'] },
  { domain: 'academy',      layer: 2, blade: 'educational',   tools: ['read','annotate','summarise','cross-ref','cite','debate','teach-back','quiz','synthesize'] },
  { domain: 'astronomy',    layer: 2, blade: 'educational',   tools: ['observe','ephemeris','transit-chart','align-scope','log-event','doppler','spectra','lunar-map','parallax'] },
  { domain: 'forestry',     layer: 2, blade: 'educational',   tools: ['identify-tree','bark-sample','seedling','prune','grafts','measure-girth','track-growth','canopy-map','soil-check'] },
  { domain: 'anatomy',      layer: 2, blade: 'educational',   tools: ['palpate','chart-meridian','reflex','pulse-read','breath-count','align-posture','stretch','gait','balance'] },
  { domain: 'cardology',    layer: 2, blade: 'educational',   tools: ['draw','interpret','cross-layout','reverse-read','shuffle','burn-card','cleanse','align-suit','seal-reading'] },
  { domain: 'yoga',         layer: 2, blade: 'educational',   tools: ['asana-align','pranayama','dhyana','drishti','bandha','surya','chandra','savasana','flow-link'] },
  { domain: 'acupressure',  layer: 2, blade: 'educational',   tools: ['locate-point','press','release','trace-meridian','warm','cool','tap','hold','seal'] },
  { domain: 'alchemy',      layer: 2, blade: 'educational',   tools: ['calcinate','dissolve','separate','conjoin','ferment-alch','distill-alch','coagulate','seal-vessel','multiply'] },
  { domain: 'numerology',   layer: 2, blade: 'educational',   tools: ['reduce-number','chart-path','karmic-debt','expression','soul-urge','birthday','pinnacle','challenge','personal-year'] },
  { domain: 'botany',       layer: 2, blade: 'educational',   tools: ['classify','propagate','photosynth-log','trace-root','leaf-morph','bloom-cycle','pollinate','harvest','preserve'] },
  { domain: 'music',        layer: 2, blade: 'educational',   tools: ['tune','scale-walk','chord-stack','rhythm-lock','harmonise','transpose','solfege','ear-train','compose'] },
  { domain: 'elixirs',      layer: 2, blade: 'educational',   tools: ['select-base','infuse','charge','seal-bottle','test-potency','label-batch','age','decant','share-vial'] },
  { domain: 'reiki',        layer: 2, blade: 'educational',   tools: ['attune-self','scan-field','palm-over','symbol-draw','send-distance','ground','close-field','log-session','self-heal'] },
  { domain: 'mudras',       layer: 2, blade: 'educational',   tools: ['gyan','prana','apana','shuni','surya','buddhi','vayu','akash','ksepana'] },
  { domain: 'breathwork',   layer: 2, blade: 'educational',   tools: ['box-breath','wim-hof','bhastrika','kapalabhati','nadi-shodhana','ujjayi','4-7-8','holotropic','coherence'] },
  { domain: 'sacred-texts', layer: 2, blade: 'educational',   tools: ['read-verse','cross-scripture','translate','meditate-word','chant-passage','memorize','illuminate','cite','teach-line'] },
  { domain: 'observatory',  layer: 2, blade: 'educational',   tools: ['tesseract-open','project-map','time-fold','zodiac-mark','planet-pin','eclipse-pred','tide-chart','aurora-log','star-id'] },
  { domain: 'biorhythm',    layer: 2, blade: 'educational',   tools: ['chart-physical','emotional-cycle','intellectual-cycle','intuitive-cycle','log-day','predict','align-action','rest-plan','peak-use'] },
  { domain: 'cosmic-ledger',layer: 3, blade: 'utility',       tools: ['deposit-sparks','withdraw-dust','trade','audit','broadcast','convert','escrow','refund','freeze'] },
];

/* ───────────── Build stubs ───────────── */
const stubs = [];
for (const ws of WORKSHOPS) {
  for (let i = 0; i < ws.tools.length; i++) {
    const id = `${ws.domain}.${ws.tools[i]}`;
    if (isRegistered(id)) continue; // don't overwrite real entries
    // Requires chain: tool n requires the previous tool's unlock, so
    // the Sovereign must traverse the workshop end-to-end.
    const requires = i === 0 ? [] : [`${ws.domain}_tier_${i}`];
    const unlocks = [`${ws.domain}_tier_${i + 1}`];
    stubs.push({
      id,
      layer: ws.layer,
      domain: ws.domain,
      unlocks,
      requires,
      sparks: 2 + Math.floor(i / 2),       // 2→6 as the blade sharpens
      purpose: `${ws.domain} · blade ${i + 1} of ${ws.tools.length} — ${ws.tools[i]} (scaffold).`,
      scaffold: true,                       // marks "not yet implemented"
      blade: ws.blade,                      // entertainment | educational | utility
    });
  }
}

// Add Layer-4 Entertainment blades tied to the VR realms (already have starseed.*)
const L4 = [
  { id: 'vr.starseed-mintakan',  domain: 'starseed',    requires: ['starseed_active'],    unlocks: ['mintakan_realm'],    sparks: 12, purpose: 'Enter the Mintakan VR realm — aquatic crystalline oceans.' },
  { id: 'vr.starseed-lyran',     domain: 'starseed',    requires: ['starseed_active'],    unlocks: ['lyran_realm'],       sparks: 12, purpose: 'Enter the Lyran VR realm — primal fire origins.' },
  { id: 'vr.starseed-andromedan',domain: 'starseed',    requires: ['starseed_active'],    unlocks: ['andromedan_realm'],  sparks: 12, purpose: 'Enter the Andromedan VR realm — freedom through void.' },
  { id: 'vr.starseed-arcturian', domain: 'starseed',    requires: ['starseed_active'],    unlocks: ['arcturian_realm'],   sparks: 12, purpose: 'Enter the Arcturian VR realm — sacred geometry sanctum.' },
  { id: 'vr.starseed-sirian',    domain: 'starseed',    requires: ['starseed_active'],    unlocks: ['sirian_realm'],      sparks: 12, purpose: 'Enter the Sirian VR realm — akashic library.' },
  { id: 'vr.starseed-orion',     domain: 'starseed',    requires: ['starseed_active'],    unlocks: ['orion_realm'],       sparks: 12, purpose: 'Enter the Orion VR realm — shadow alchemy.' },
  { id: 'vr.starseed-pleiadian', domain: 'starseed',    requires: ['starseed_active'],    unlocks: ['pleiadian_realm'],   sparks: 12, purpose: 'Enter the Pleiadian VR realm — healing choir.' },
  { id: 'vr.starseed-venusian',  domain: 'starseed',    requires: ['starseed_active'],    unlocks: ['venusian_realm'],    sparks: 12, purpose: 'Enter the Venusian VR realm — divine beauty.' },
].map(t => ({ ...t, layer: 4, blade: 'entertainment', scaffold: true }));

registerMany([...stubs, ...L4]);
