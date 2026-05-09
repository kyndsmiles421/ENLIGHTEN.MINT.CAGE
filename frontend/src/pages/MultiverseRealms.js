import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Globe, Volume2, Sparkles, ChevronRight, Orbit,
  TreeDeciduous, Waves, Flame, Wind,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useMixer, FREQUENCIES as MIXER_FREQUENCIES, SOUNDS as MIXER_SOUNDS, INSTRUMENT_DRONES } from '../context/MixerContext';
import { CosmicInlineLoader, CosmicError, getCosmicErrorMessage } from '../components/CosmicFeedback';
import { commit as busCommit } from '../state/ContextBus';
import { useProcessorState } from '../state/ProcessorState';
import CompanionChip from '../components/CompanionChip';
import RitualChainPanel from '../components/RitualChainPanel';
import { toast } from 'sonner';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

// V1.0.8 — Realm Practices → MODULE_REGISTRY map. Each backend practice
// string (e.g. "void_meditation", "crystal_resonance") resolves to a
// real engine the user can `pull()` straight into the matrix slot.
// Practices with no direct 1:1 engine fall back to the closest generic
// engine (meditation, mantras, etc.) so EVERY practice card is
// clickable — no dead tiles. Source of truth for engine IDs is
// MODULE_REGISTRY in state/ProcessorState.js; if an ID ever moves,
// the `dispatchPractice` fallback below degrades to a navigate().
const PRACTICE_TO_MODULE = {
  // Astral Garden — earth
  grounding:               'MEDITATION',
  plant_resonance:         'HERBOLOGY',
  earth_attunement:        'HERBOLOGY',
  // Crystal Caverns — spirit
  crystal_resonance:       'CRYSTALS',
  sound_bath:              'SOUNDSCAPES',
  past_life:               'AKASHIC',
  // Celestial Ocean — water
  water_attunement:        'FREQUENCIES',
  emotional_release:       'JOURNAL',
  dream_work:              'DREAM_VIZ',
  // Solar Temple — fire
  fire_ceremony:           'RITUALS',
  transmutation:           'AFFIRMATIONS',
  willpower:               'AFFIRMATIONS',
  // Void Sanctum — void
  void_meditation:         'MEDITATION',
  ego_death:               'JOURNAL',
  rebirth:                 'MANTRAS',
  // Aurora Bridge — light
  chakra_alignment:        'YOGA',
  timeline_attunement:     'COSMIC_CALENDAR',
  interdimensional:        'STAR_CHART',
};
const PRACTICE_TO_ROUTE = {
  grounding: '/meditation',
  plant_resonance: '/herbology',
  earth_attunement: '/herbology',
  crystal_resonance: '/crystals',
  sound_bath: '/soundscapes',
  past_life: '/akashic-records',
  water_attunement: '/frequencies',
  emotional_release: '/journal',
  dream_work: '/dreams',
  fire_ceremony: '/rituals',
  transmutation: '/affirmations',
  willpower: '/affirmations',
  void_meditation: '/meditation',
  ego_death: '/journal',
  rebirth: '/mantras',
  chakra_alignment: '/yoga',
  timeline_attunement: '/cosmic-calendar',
  interdimensional: '/star-chart',
};

// V68.95 — ELEMENT → COMPANION CONCEPT BRIDGE.
// Each realm carries an `element` from the backend. The Companion
// Engine (V68.92/V68.93) groups ordained cross-tradition scriptures
// by concept. We map element → concept so the realm view auto-surfaces
// the multi-tradition substrate beneath it. Mapping is grounded in
// what the bridges actually contain — verified, not inferred:
//
//   earth  → stewardship  (Genesis 2 garden, Hopi Koyaanisqatsi,
//                          Lakota Mitakuye Oyasin, Aboriginal Country)
//   water  → creation     (Genesis 1 deep, Kumulipo Pō, Atum from Nun,
//                          Norse Ginnungagap, Popol Vuh primordial sea)
//   fire   → purification (Asha vs Druj, Tapas, Inipi sweat lodge,
//                          Buddhaghosa Visuddhimagga)
//   ether  → emptiness    (Heart Sutra, Diamond Sutra, Tao, Anatta)
//   air    → sacred_sound (Aum, Saman melodies, Mool Mantar, Logos
//                          John 1, Rumi reed flute)
const ELEMENT_CONCEPT_MAP = {
  earth: 'stewardship',
  water: 'creation',
  fire:  'purification',
  ether: 'emptiness',
  air:   'sacred_sound',
};

// V68.95 — Distinct iconography per element. Replaces the generic
// <Globe> facade so users SEE which world they're stepping into
// before they tap. Names map to lucide-react components.
const ELEMENT_ICON_MAP = {
  earth: TreeDeciduous,
  water: Waves,
  fire:  Flame,
  ether: Sparkles,
  air:   Wind,
};
const elementIcon = (el) => ELEMENT_ICON_MAP[el] || Globe;

// V68.5 — Realm → 3D Scene portal mapping.
// Each realm launches its actual THREE.js / WebGL experience.
// Mapping is element/ambience-driven: the backend realms don't yet carry
// a `scene_route` field, so we map by ID with sensible fallbacks.
const REALM_TO_SCENE = {
  astral_garden:   { route: '/vr/celestial-dome', label: 'Celestial Dome (VR)',      icon: Orbit },
  crystal_caverns: { route: '/tesseract',         label: 'Tesseract Core (4D)',       icon: Sparkles },
  celestial_ocean: { route: '/observatory',       label: 'Observatory (Sonified Sky)',icon: Orbit },
  solar_temple:    { route: '/enlightenment-os',  label: 'Enlightenment OS',          icon: Sparkles },
  void_sanctum:    { route: '/dimensional-space', label: 'Dimensional Space',         icon: Globe },
  aurora_bridge:   { route: '/star-chart',        label: 'Star Chart (Live)',         icon: Orbit },
};
// Fallback for any future realm
const DEFAULT_SCENE = { route: '/vr', label: 'VR Sanctuary', icon: Orbit };

export default function MultiverseRealms() {
  useEffect(() => { if (typeof window.__workAccrue === 'function') window.__workAccrue('multiverse', 8); }, []);

  const navigate = useNavigate();
  const { authHeaders } = useAuth();
  const { toggleFreq, toggleSound, toggleDrone, activeFreqs, activeSounds, activeDrones, stopAll } = useMixer();
  const [realms, setRealms] = useState([]);
  const [activeRealm, setActiveRealm] = useState(null);
  const [visitStats, setVisitStats] = useState([]);
  const [entering, setEntering] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    setInitialLoading(true);
    setFetchError(null);
    // V1.0.8 — Pass auth so the backend can compute is_locked per user.
    // Public fallback still works (is_locked defaults to based on lvl 0).
    axios.get(`${API}/realms/`, { headers: authHeaders || {} })
      .then(r => setRealms(r.data))
      .catch(err => {
        const cosmic = getCosmicErrorMessage(err);
        setFetchError(cosmic);
      })
      .finally(() => setInitialLoading(false));
    if (authHeaders?.Authorization) {
      axios.get(`${API}/realms/visits/stats`, { headers: authHeaders }).then(r => setVisitStats(r.data)).catch(() => {});
    }
  }, [authHeaders]);

  const getVisitCount = useCallback((realmId) => {
    const stat = visitStats.find(s => s.realm_id === realmId);
    return stat?.visits || 0;
  }, [visitStats]);

  // V1.0.8 — Realm practice dispatcher. Resolves a backend practice
  // string (e.g. "void_meditation") to a real engine via MODULE_REGISTRY
  // and pull()s it into the matrix slot. Falls back to navigate() for
  // any practice that lacks a direct engine binding so no practice
  // card is ever a dead tile. On pull, we also commit the realm's
  // worldMetadata to the ContextBus so the engine inherits the realm's
  // element/biome — matches the Starseed adventure pattern.
  const processor = useProcessorState();
  const dispatchPractice = useCallback((practiceKey, realm) => {
    const moduleId = PRACTICE_TO_MODULE[practiceKey];
    try {
      busCommit('worldMetadata', {
        realm_id: realm?.id,
        realm_name: realm?.name,
        biome: realm?.element || realm?.name,
        frequency: realm?.frequency,
        practice: practiceKey,
        ts: Date.now(),
      }, { moduleId: moduleId || 'REALM' });
    } catch (e) { if (process.env.NODE_ENV !== 'production') console.warn(e); }
    if (moduleId && processor && typeof processor.pull === 'function') {
      processor.pull(moduleId);
      toast.success(`${practiceKey.replace(/_/g, ' ')} activated`);
      try { window.scrollTo({ top: 0, behavior: 'smooth' }); } catch (e) { if (process.env.NODE_ENV !== 'production') console.warn(e); }
      return;
    }
    const route = PRACTICE_TO_ROUTE[practiceKey];
    if (route) { navigate(route); return; }
    toast.info(`${practiceKey.replace(/_/g, ' ')} — practice coming soon`);
  }, [processor, navigate]);

  const enterRealm = useCallback(async (realm) => {
    if (!authHeaders?.Authorization) { toast('Sign in to enter realms'); return; }
    // V1.0.8 — Client-side lock gate. Server enforces too (returns 403
    // with realm_locked code), but short-circuiting here avoids the
    // round-trip and shows a clear, friendly message immediately.
    if (realm.is_locked) {
      toast.error(`Locked · unlock at level ${realm.unlock_level}`, {
        description: `You're at level ${realm.user_level || 0}. Keep practicing to open this realm.`,
      });
      return;
    }
    setEntering(true);
    try {
      const res = await axios.post(`${API}/realms/${realm.id}/enter`, {}, { headers: authHeaders });
      setActiveRealm(res.data);

      // Activate the realm's soundscape via MixerContext
      stopAll();
      const freq = MIXER_FREQUENCIES.find(f => f.hz === realm.frequency) || { hz: realm.frequency, label: `${realm.frequency} Hz`, color: realm.color };
      if (!activeFreqs.has(realm.frequency)) await toggleFreq(freq);
      const sound = MIXER_SOUNDS.find(s => s.id === realm.ambient);
      if (sound && !activeSounds.has(realm.ambient)) await toggleSound(sound);
      const drone = INSTRUMENT_DRONES.find(d => d.id === realm.drone);
      if (drone && !activeDrones.has(realm.drone)) await toggleDrone(drone);

      // V68.95 — Lattice ripple. The Hub's CrystallineLattice3D listens
      // for `sovereign:pulse` events fired by ContextBus.commit. By
      // committing the realm's metadata here, the analyzer derives a
      // pulse vector from the realm's name + element + description
      // (ResonanceAnalyzer's lexicon catches "void", "fire", "light",
      // "crystal", etc.). Result: entering Void Sanctum → bass+sacred
      // surge → dark sparse lattice. Entering Astral Garden → treble
      // surge → bright luminous lattice. No special-casing needed —
      // the existing analyzer + listener chain does all the work.
      try {
        busCommit('worldMetadata', {
          biome: realm.element,
          locale: realm.name,
          frequency: realm.frequency,
          ambient: realm.ambient,
          desc: realm.desc,
          color: realm.color,
        }, { moduleId: 'MULTIVERSE_REALMS' });
      } catch { /* graceful — bus is best-effort */ }

      toast(`Entered ${realm.name}`, { description: realm.subtitle });

      // Refresh stats
      axios.get(`${API}/realms/visits/stats`, { headers: authHeaders }).then(r => setVisitStats(r.data)).catch(() => {});
    } catch (err) {
      const msg = getCosmicErrorMessage(err);
      toast.error(msg.title);
    }
    setEntering(false);
  }, [authHeaders, stopAll, toggleFreq, toggleSound, toggleDrone, activeFreqs, activeSounds, activeDrones]);

  const leaveRealm = useCallback(() => {
    stopAll();
    setActiveRealm(null);
    toast('Returned from the realm');
  }, [stopAll]);

  return (
    <div className="min-h-screen pb-40" style={{ background: activeRealm ? `linear-gradient(135deg, ${activeRealm.realm.gradient[0]}, ${activeRealm.realm.gradient[1]})` : 'radial-gradient(ellipse at 50% 20%, rgba(129,140,248,0.05) 0%, transparent 50%), var(--bg-primary)', transition: 'background 1s ease' }}>
      <div className="px-4 pt-4 max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => activeRealm ? leaveRealm() : navigate(-1)} className="p-2 rounded-lg hover:bg-white/5 transition-all" data-testid="realms-back">
            <ArrowLeft size={18} style={{ color: activeRealm ? 'rgba(255,255,255,0.7)' : 'var(--text-muted)' }} />
          </button>
          <div>
            <h1 className="text-2xl font-light" style={{ color: activeRealm ? '#F8FAFC' : 'var(--text-primary)', fontFamily: 'Cormorant Garamond, serif' }}>
              {activeRealm ? activeRealm.realm.name : 'Multiverse Realms'}
            </h1>
            <p className="text-[10px]" style={{ color: activeRealm ? 'rgba(255,255,255,0.4)' : 'var(--text-muted)' }}>
              {activeRealm ? activeRealm.realm.subtitle : 'Travel between dimensions of consciousness'}
            </p>
          </div>
        </div>

        {/* Loading / Error States */}
        {initialLoading && (
          <CosmicInlineLoader message="Opening dimensional gateways..." />
        )}
        {fetchError && !initialLoading && (
          <CosmicError
            title={fetchError.title}
            message={fetchError.message}
            onRetry={() => window.location.reload()}
          />
        )}
        {!initialLoading && !fetchError && (
        <AnimatePresence mode="wait">
          {/* ─── REALM LIST ─── */}
          {!activeRealm && (
            <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {entering && (
                <CosmicInlineLoader message="Entering dimensional gateway..." />
              )}
              <div className="space-y-3" style={{ opacity: entering ? 0.4 : 1, transition: 'opacity 0.3s' }}>
                {realms.map((realm, i) => {
                  const visits = getVisitCount(realm.id);
                  const RealmIcon = elementIcon(realm.element);
                  return (
                    <motion.button key={realm.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                      onClick={() => enterRealm(realm)} disabled={entering}
                      className="w-full p-4 rounded-2xl text-left group transition-all relative overflow-hidden"
                      style={{
                        background: `linear-gradient(135deg, ${realm.gradient[0]}30, ${realm.gradient[1]}20)`,
                        border: `1px solid ${realm.is_locked ? 'rgba(255,255,255,0.08)' : realm.color + '15'}`,
                        opacity: realm.is_locked ? 0.6 : 1,
                        filter: realm.is_locked ? 'saturate(0.4)' : 'none',
                        cursor: realm.is_locked ? 'not-allowed' : 'pointer',
                      }}
                      onMouseOver={(e) => { if (!realm.is_locked) e.currentTarget.style.transform = 'scale(1.01)'; }}
                      onMouseOut={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
                      data-testid={`realm-${realm.id}`}
                      data-element={realm.element}
                      data-locked={realm.is_locked ? 'true' : 'false'}
                      aria-disabled={realm.is_locked || undefined}
                    >
                      {/* V1.0.8 — Locked realm ribbon. Inline, same
                          plane as the card, respects Flatland rules.
                          Glass pill in the corner — no overlay, no
                          fixed positioning, no ghost click capture. */}
                      {realm.is_locked && (
                        <div
                          data-testid={`realm-lock-${realm.id}`}
                          style={{
                            position: 'absolute', top: 10, right: 10,
                            display: 'inline-flex', alignItems: 'center', gap: 5,
                            padding: '4px 10px',
                            borderRadius: 999,
                            background: 'rgba(10,10,18,0.55)',
                            border: '1px solid rgba(255,255,255,0.14)',
                            color: 'rgba(255,255,255,0.88)',
                            fontSize: 9,
                            letterSpacing: '0.18em',
                            fontFamily: 'monospace',
                            textTransform: 'uppercase',
                            pointerEvents: 'none',
                          }}
                        >
                          <span aria-hidden="true">🔒</span>
                          LVL {realm.unlock_level}
                        </div>
                      )}
                      <div className="flex items-start gap-3.5">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{ background: `${realm.color}12`, border: `1px solid ${realm.color}20` }}>
                          <RealmIcon size={20} style={{ color: realm.color }} data-testid={`realm-icon-${realm.element}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <p className="text-sm font-medium" style={{ color: realm.color }}>{realm.name}</p>
                            {visits > 0 && (
                              <span className="text-[8px] px-1.5 py-0.5 rounded-full" style={{ background: `${realm.color}10`, color: `${realm.color}80` }}>
                                {visits}x visited
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] mb-1.5" style={{ color: 'rgba(255,255,255,0.7)' }}>{realm.subtitle}</p>
                          <p className="text-[10px] leading-relaxed line-clamp-2" style={{ color: 'rgba(255,255,255,0.65)' }}>{realm.desc}</p>
                          <div className="flex items-center gap-3 mt-2">
                            <span className="text-[8px] px-2 py-0.5 rounded-full" style={{ background: `${realm.color}08`, color: `${realm.color}70`, border: `1px solid ${realm.color}10` }}>
                              {realm.frequency} Hz
                            </span>
                            <span className="text-[8px]" style={{ color: 'rgba(255,255,255,0.6)' }}>{realm.element}</span>
                          </div>
                        </div>
                        <ChevronRight size={14} style={{ color: 'rgba(248,250,252,0.15)' }} className="mt-1 group-hover:translate-x-1 transition-all flex-shrink-0" />
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* ─── INSIDE REALM ─── */}
          {activeRealm && (
            <motion.div key="inside" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.6 }}>
              {/* Realm Description */}
              <div className="p-5 rounded-2xl mb-6" style={{ background: 'transparent', backdropFilter: 'none', border: `1px solid ${activeRealm.realm.color}15` }}>
                <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.7)', lineHeight: 1.8 }}>
                  {activeRealm.realm.desc}
                </p>
              </div>

              {/* V68.95 — Cross-Tradition Substrate. Maps the realm's
                  `element` to a Companion Engine concept and surfaces
                  ordained scriptures from across traditions. Earth →
                  stewardship, Water → creation, Fire → purification,
                  Ether → emptiness, Air → sacred_sound. CompanionChip
                  hides itself if the API returns no matches (Flatland
                  graceful empty), so the realm view degrades cleanly
                  when offline. */}
              {ELEMENT_CONCEPT_MAP[activeRealm.realm.element] && (
                <div
                  className="p-4 rounded-xl mb-4"
                  style={{
                    background: 'rgba(168,85,247,0.05)',
                    border: '1px solid rgba(168,85,247,0.15)',
                  }}
                  data-testid="realm-cross-tradition"
                  data-element={activeRealm.realm.element}
                  data-concept={ELEMENT_CONCEPT_MAP[activeRealm.realm.element]}
                >
                  <p
                    className="text-[9px] uppercase tracking-widest mb-2"
                    style={{ color: '#C4B5FD' }}
                  >
                    Cross-Tradition · {activeRealm.realm.element}
                  </p>
                  {/* CompanionChip's `textId` accepts a concept name and
                      reuses the same /api/companions/{id} fetch pattern.
                      We reach the multi-tradition list via the concept-
                      bridge endpoint by passing the concept directly. */}
                  <CompanionChip
                    textId={ELEMENT_CONCEPT_MAP[activeRealm.realm.element]}
                  />
                </div>
              )}

              {/* Active Soundscape */}
              <div className="p-4 rounded-xl mb-4" style={{ background: `${activeRealm.realm.color}08`, border: `1px solid ${activeRealm.realm.color}12` }}>
                <p className="text-[9px] uppercase tracking-widest mb-2" style={{ color: activeRealm.realm.color }}>Realm Soundscape</p>
                <div className="flex flex-wrap gap-2">
                  <span className="flex items-center gap-1.5 text-[10px] px-2.5 py-1 rounded-full"
                    style={{ background: `${activeRealm.realm.color}10`, color: activeRealm.realm.color, border: `1px solid ${activeRealm.realm.color}15` }}>
                    <Volume2 size={10} className="animate-pulse" /> {activeRealm.realm.frequency} Hz
                  </span>
                  <span className="text-[10px] px-2.5 py-1 rounded-full"
                    style={{ background: 'rgba(59,130,246,0.08)', color: '#3B82F6', border: '1px solid rgba(59,130,246,0.12)' }}>
                    {activeRealm.realm.ambient}
                  </span>
                  <span className="text-[10px] px-2.5 py-1 rounded-full"
                    style={{ background: 'rgba(245,158,11,0.08)', color: '#F59E0B', border: '1px solid rgba(245,158,11,0.12)' }}>
                    {activeRealm.realm.drone}
                  </span>
                </div>
              </div>

              {/* Practices — V1.0.8: each tile is now a real button
                  that pulls the mapped engine into the matrix slot
                  (or navigates to the engine's page if the engine
                  isn't yet registered). No dead tiles. */}
              <div className="mb-6">
                <p className="text-[9px] uppercase tracking-widest mb-2" style={{ color: 'rgba(255,255,255,0.65)' }}>Realm Practices</p>
                <div className="grid grid-cols-3 gap-2">
                  {(activeRealm.realm.practices || []).map(p => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => dispatchPractice(p, activeRealm.realm)}
                      data-testid={`realm-practice-${p}`}
                      className="p-3 rounded-xl text-center transition-all"
                      style={{
                        background: 'rgba(0,0,0,0.2)',
                        border: `1px solid ${activeRealm.realm.color}33`,
                        cursor: 'pointer',
                      }}
                      onMouseOver={e => { e.currentTarget.style.background = `${activeRealm.realm.color}22`; }}
                      onMouseOut={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.2)'; }}
                    >
                      <Sparkles size={14} style={{ color: activeRealm.realm.color }} className="mx-auto mb-1" />
                      <p className="text-[9px] capitalize" style={{ color: 'rgba(255,255,255,0.72)' }}>{p.replace(/_/g, ' ')}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* V1.0.9 — Ritual Chain Forge. Intent-to-Ritual Sage
                  agent + Background Runner. Renders inline below the
                  practice grid so the realm offers BOTH manual
                  practice picks and AI-orchestrated chains. */}
              <RitualChainPanel
                realm={activeRealm.realm}
                accentColor={activeRealm.realm.color}
              />

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="p-3 rounded-xl" style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <p className="text-[9px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.65)' }}>Total Visits</p>
                  <p className="text-xl font-light mt-1" style={{ color: activeRealm.realm.color }}>{activeRealm.total_visits}</p>
                </div>
                <div className="p-3 rounded-xl" style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <p className="text-[9px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.65)' }}>This Realm</p>
                  <p className="text-xl font-light mt-1" style={{ color: activeRealm.realm.color }}>{activeRealm.realm_visits}</p>
                </div>
              </div>

              {/* Leave Button + V68.5 Launch 3D Scene */}
              {(() => {
                const scene = REALM_TO_SCENE[activeRealm.realm.id] || DEFAULT_SCENE;
                const SceneIcon = scene.icon;
                const launch = () => {
                  toast(`Entering ${scene.label}`);
                  try { window.SovereignUniverse?.checkQuestLogic(`realm:enter:${activeRealm.realm.id}`, 'multiverse'); } catch (e) { if (process.env.NODE_ENV !== 'production') console.warn(e); }
                  navigate(scene.route);
                };
                return (
                  <>
                    <button onClick={launch}
                      className="w-full py-3.5 rounded-xl text-sm flex items-center justify-center gap-2 transition-all hover:scale-[1.01] mb-3"
                      style={{
                        background: `linear-gradient(135deg, ${activeRealm.realm.color}25, ${activeRealm.realm.color}0a)`,
                        border: `1px solid ${activeRealm.realm.color}55`,
                        color: activeRealm.realm.color,
                        boxShadow: `0 0 22px ${activeRealm.realm.color}22, inset 0 0 14px ${activeRealm.realm.color}10`,
                      }}
                      data-testid="realm-launch-3d"
                    >
                      <SceneIcon size={15} />
                      <span className="font-medium">Enter {scene.label}</span>
                      <ChevronRight size={14} />
                    </button>
                    <button onClick={leaveRealm}
                      className="w-full py-3 rounded-xl text-xs flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
                      style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)' }}
                      data-testid="leave-realm-btn">
                      <ArrowLeft size={14} /> Return to the Multiverse
                    </button>
                  </>
                );
              })()}
            </motion.div>
          )}
        </AnimatePresence>
        )}
      </div>
    </div>
  );
}
