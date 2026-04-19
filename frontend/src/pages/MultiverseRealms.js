import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Globe, Play, Volume2, Lock, Sparkles, ChevronRight, Orbit } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useMixer, FREQUENCIES as MIXER_FREQUENCIES, SOUNDS as MIXER_SOUNDS, INSTRUMENT_DRONES } from '../context/MixerContext';
import { CosmicInlineLoader, CosmicError, getCosmicErrorMessage } from '../components/CosmicFeedback';
import { toast } from 'sonner';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

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
    axios.get(`${API}/realms/`)
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

  const enterRealm = useCallback(async (realm) => {
    if (!authHeaders?.Authorization) { toast('Sign in to enter realms'); return; }
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
                  return (
                    <motion.button key={realm.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                      onClick={() => enterRealm(realm)} disabled={entering}
                      className="w-full p-4 rounded-2xl text-left group hover:scale-[1.01] transition-all"
                      style={{
                        background: `linear-gradient(135deg, ${realm.gradient[0]}30, ${realm.gradient[1]}20)`,
                        border: `1px solid ${realm.color}15`,
                      }}
                      data-testid={`realm-${realm.id}`}
                    >
                      <div className="flex items-start gap-3.5">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{ background: `${realm.color}12`, border: `1px solid ${realm.color}20` }}>
                          <Globe size={20} style={{ color: realm.color }} />
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

              {/* Practices */}
              <div className="mb-6">
                <p className="text-[9px] uppercase tracking-widest mb-2" style={{ color: 'rgba(255,255,255,0.65)' }}>Realm Practices</p>
                <div className="grid grid-cols-3 gap-2">
                  {(activeRealm.realm.practices || []).map(p => (
                    <div key={p} className="p-3 rounded-xl text-center"
                      style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <Sparkles size={14} style={{ color: activeRealm.realm.color }} className="mx-auto mb-1" />
                      <p className="text-[9px] capitalize" style={{ color: 'rgba(255,255,255,0.5)' }}>{p.replace(/_/g, ' ')}</p>
                    </div>
                  ))}
                </div>
              </div>

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
                  try { window.SovereignUniverse?.checkQuestLogic(`realm:enter:${activeRealm.realm.id}`, 'multiverse'); } catch {}
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
