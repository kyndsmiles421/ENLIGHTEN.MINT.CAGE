import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import {
  Star, Swords, ArrowLeft, Loader2, Globe, Trophy, Skull,
  Users, Crown, UserPlus, Plus, Heart, Sparkles, Award
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSensory } from '../context/SensoryContext';
import {
  ORIGIN_COLORS,
  RealmStarMap,
  WorldEventBanner,
  EncounterScene,
  EncounterResult,
  AllianceChat,
  BossEncounterPanel,
} from '../components/starseed';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function StarseedRealm() {
  useEffect(() => { if (typeof window.__workAccrue === 'function') window.__workAccrue('starseed_realm', 8); }, []);

  const { user, authHeaders, loading: authLoading } = useAuth();
  const { reduceParticles } = useSensory();
  const navigate = useNavigate();

  const [players, setPlayers] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [brightestAura, setBrightestAura] = useState([]);
  const [mostHelpful, setMostHelpful] = useState([]);
  const [founders, setFounders] = useState([]);
  const [founderStatus, setFounderStatus] = useState(null);
  const [worldEvent, setWorldEvent] = useState(null);
  const [myAlliance, setMyAlliance] = useState(null);
  const [alliances, setAlliances] = useState([]);
  const [encounter, setEncounter] = useState(null);
  const [encounterResult, setEncounterResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [initLoading, setInitLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('realm');
  const [myCharacters, setMyCharacters] = useState([]);
  const [activeOrigin, setActiveOrigin] = useState(null);
  const [allianceName, setAllianceName] = useState('');
  const [leaderCategory, setLeaderCategory] = useState('shining');

  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate('/auth'); return; }

    Promise.all([
      axios.get(`${API}/starseed/realm/world-event`).then(r => setWorldEvent(r.data)).catch(() => {}),
      axios.get(`${API}/starseed/realm/active-players`, { headers: authHeaders }).then(r => setPlayers(r.data.players)).catch(() => {}),
      axios.get(`${API}/starseed/realm/leaderboard`, { headers: authHeaders }).then(r => {
        setLeaderboard(r.data.leaderboard || []);
        setBrightestAura(r.data.brightest_aura || []);
        setMostHelpful(r.data.most_helpful || []);
        setFounders(r.data.founders || []);
      }).catch(() => {}),
      axios.get(`${API}/starseed/realm/my-alliance`, { headers: authHeaders }).then(r => setMyAlliance(r.data.alliance)).catch(() => {}),
      axios.get(`${API}/starseed/realm/alliances`, { headers: authHeaders }).then(r => setAlliances(r.data.alliances)).catch(() => {}),
      axios.get(`${API}/starseed/realm/founder-status`, { headers: authHeaders }).then(r => setFounderStatus(r.data)).catch(() => {}),
      axios.get(`${API}/starseed/my-characters`, { headers: authHeaders }).then(r => {
        setMyCharacters(r.data.characters);
        if (r.data.characters.length > 0) setActiveOrigin(r.data.characters[0].origin_id);
      }).catch(() => {}),
    ]).finally(() => setInitLoading(false));
  }, [user, authLoading, authHeaders, navigate]);

  useEffect(() => {
    if (!user || !activeOrigin) return;
    const sendHeartbeat = () => {
      const ch = myCharacters.find(c => c.origin_id === activeOrigin);
      axios.post(`${API}/starseed/realm/heartbeat`, {
        origin_id: activeOrigin,
        chapter: ch?.chapter || 1,
        scene: ch?.scene || 0,
      }, { headers: authHeaders }).catch(() => {});
    };
    sendHeartbeat();
    const interval = setInterval(sendHeartbeat, 60000);
    return () => clearInterval(interval);
  }, [user, activeOrigin, myCharacters, authHeaders]);

  const requestEncounter = useCallback(async (targetUserId) => {
    if (!activeOrigin || loading) return;
    setLoading(true);
    try {
      const res = await axios.post(`${API}/starseed/realm/encounter/request`, {
        origin_id: activeOrigin,
        target_user_id: targetUserId || null,
      }, { headers: authHeaders });
      setEncounter(res.data);
      toast.success('Encounter initiated!');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Could not start encounter');
    } finally {
      setLoading(false);
    }
  }, [activeOrigin, authHeaders, loading]);

  const resolveEncounter = useCallback(async (choiceIndex) => {
    if (!encounter || loading) return;
    setLoading(true);
    try {
      const res = await axios.post(`${API}/starseed/realm/encounter/resolve`, {
        encounter_id: encounter.id,
        choice_index: choiceIndex,
      }, { headers: authHeaders });
      setEncounterResult(res.data);
      setEncounter(null);
    } catch {
      toast.error('Failed to resolve encounter');
    } finally {
      setLoading(false);
    }
  }, [encounter, authHeaders, loading]);

  const createAlliance = useCallback(async () => {
    if (!allianceName.trim()) return;
    try {
      const res = await axios.post(`${API}/starseed/realm/alliance/create`, {
        name: allianceName.trim(),
      }, { headers: authHeaders });
      setMyAlliance(res.data);
      setAllianceName('');
      toast.success('Alliance created!');
      axios.get(`${API}/starseed/realm/alliances`, { headers: authHeaders }).then(r => setAlliances(r.data.alliances)).catch(() => {});
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Could not create alliance');
    }
  }, [allianceName, authHeaders]);

  const claimFounderBadge = useCallback(async () => {
    try {
      const res = await axios.post(`${API}/starseed/realm/claim-founder`, {}, { headers: authHeaders });
      if (res.data.status === 'claimed') {
        setFounderStatus({ is_founder: true, badge: res.data.badge, exclusive_frequency: res.data.exclusive_frequency });
        toast('Cosmic Founder Badge Claimed!', {
          description: 'You now have access to the exclusive Founder\'s Harmonic frequency',
          style: {
            background: 'linear-gradient(135deg, rgba(252,211,77,0.15), rgba(0,0,0,0))',
            border: '1px solid rgba(252,211,77,0.3)',
            color: '#FCD34D',
            boxShadow: '0 0 30px rgba(252,211,77,0.15)',
          },
        });
        if (res.data.badge?.haptic_pattern) navigator.vibrate?.(res.data.badge.haptic_pattern);
      } else if (res.data.status === 'already_claimed') {
        toast.info('You already have the Founder badge!');
      } else {
        toast.error(res.data.reason || 'Not eligible yet');
      }
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Could not claim badge');
    }
  }, [authHeaders]);

  const joinAlliance = useCallback(async (allianceId) => {
    try {
      const res = await axios.post(`${API}/starseed/realm/alliance/join`, {
        alliance_id: allianceId,
      }, { headers: authHeaders });
      setMyAlliance(res.data);
      toast.success('Joined alliance!');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Could not join alliance');
    }
  }, [authHeaders]);

  if (authLoading || initLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin" size={24} style={{ color: '#C084FC' }} />
      </div>
    );
  }

  if (myCharacters.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <Star size={32} className="mx-auto mb-3" style={{ color: '#C084FC' }} />
          <h2 className="text-2xl font-light mb-2" style={{ fontFamily: 'Cormorant Garamond, serif' }}>Enter the Realm</h2>
          <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>Create a starseed character first to join the Cosmic Realm.</p>
          <button onClick={() => navigate('/starseed-adventure')} className="px-6 py-2.5 rounded-xl text-sm"
            style={{ background: 'rgba(192,132,252,0.1)', border: '1px solid rgba(192,132,252,0.2)', color: '#C084FC' }}
            data-testid="realm-create-character-btn">
            Create Character
          </button>
        </div>
      </div>
    );
  }

  const TABS = [
    { id: 'realm', label: 'Realm', icon: Globe },
    { id: 'bosses', label: 'Bosses', icon: Skull },
    { id: 'leaderboard', label: 'Ranks', icon: Trophy },
    { id: 'alliances', label: 'Alliances', icon: Users },
  ];

  return (
    <div className="min-h-screen px-4 md:px-12 lg:px-24 py-10" data-testid="starseed-realm-page">
      <div className="max-w-3xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <button onClick={() => navigate('/starseed-adventure')} className="text-xs flex items-center gap-1"
              style={{ color: 'var(--text-muted)' }}>
              <ArrowLeft size={12} /> Adventure
            </button>
          </div>
          <p className="text-xs font-bold uppercase tracking-[0.3em] mb-1" style={{ color: '#C084FC' }}>The Cosmic Realm</p>
          <h1 className="text-3xl sm:text-4xl font-light" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
            Multiplayer Starfield
          </h1>
        </motion.div>

        {myCharacters.length > 1 && (
          <div className="flex items-center justify-center gap-2 mb-6 flex-wrap">
            {myCharacters.map(ch => (
              <button key={ch.origin_id} onClick={() => setActiveOrigin(ch.origin_id)}
                className="text-[10px] px-3 py-1.5 rounded-full font-medium transition-all"
                style={{
                  background: activeOrigin === ch.origin_id ? `${ORIGIN_COLORS[ch.origin_id]}20` : 'rgba(255,255,255,0.03)',
                  color: ORIGIN_COLORS[ch.origin_id],
                  border: `1px solid ${activeOrigin === ch.origin_id ? ORIGIN_COLORS[ch.origin_id] + '40' : 'rgba(255,255,255,0.06)'}`,
                }}
                data-testid={`realm-char-${ch.origin_id}`}>
                {ch.character_name} (Lvl {ch.level})
              </button>
            ))}
          </div>
        )}

        <WorldEventBanner event={worldEvent} />

        <AnimatePresence mode="wait">
          {encounter && (
            <motion.div key="encounter" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <EncounterScene encounter={encounter} onChoice={resolveEncounter} loading={loading}
                onBack={() => setEncounter(null)} />
            </motion.div>
          )}
          {encounterResult && !encounter && (
            <motion.div key="result" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <EncounterResult result={encounterResult} onContinue={() => setEncounterResult(null)} />
            </motion.div>
          )}
        </AnimatePresence>

        {!encounter && !encounterResult && (
          <>
            <div className="flex items-center gap-1 mb-6 p-1 rounded-xl mx-auto w-fit"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
              {TABS.map(tab => {
                const Icon = tab.icon;
                return (
                  <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium transition-all"
                    style={{
                      background: activeTab === tab.id ? 'rgba(192,132,252,0.1)' : 'transparent',
                      color: activeTab === tab.id ? '#C084FC' : 'var(--text-muted)',
                    }}
                    data-testid={`realm-tab-${tab.id}`}>
                    <Icon size={12} /> {tab.label}
                  </button>
                );
              })}
            </div>

            <AnimatePresence mode="wait">
              {activeTab === 'realm' && (
                <motion.div key="realm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <RealmStarMap players={players} reduceParticles={reduceParticles}
                    onPlayerClick={p => requestEncounter(p.user_id)} />

                  <div className="flex justify-center mt-6 mb-6">
                    <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                      onClick={() => requestEncounter(null)}
                      disabled={loading}
                      className="px-8 py-3 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all"
                      style={{
                        background: 'linear-gradient(135deg, rgba(192,132,252,0.15), rgba(129,140,248,0.15))',
                        border: '1px solid rgba(192,132,252,0.25)',
                        color: '#C084FC',
                        boxShadow: '0 4px 20px rgba(192,132,252,0.1)',
                        opacity: loading ? 0.6 : 1,
                      }}
                      data-testid="find-encounter-btn">
                      {loading ? <Loader2 size={14} className="animate-spin" /> : <Swords size={14} />}
                      {loading ? 'Searching...' : 'Find Cross-Path Encounter'}
                    </motion.button>
                  </div>

                  <div className="mb-8">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-3" style={{ color: 'var(--text-muted)' }}>
                      Adventurers in the Realm ({players.length})
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {players.map((p, i) => (
                        <motion.div key={p.user_id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                          className="rounded-xl p-3 flex items-center gap-3 border transition-all"
                          style={{ background: p.is_self ? `${p.color}08` : 'rgba(255,255,255,0.02)', borderColor: p.is_self ? `${p.color}20` : 'rgba(255,255,255,0.04)' }}
                          data-testid={`realm-player-${i}`}>
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                            style={{ background: `${p.color}12` }}>
                            <Star size={14} style={{ color: p.color }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium truncate" style={{ color: p.color }}>
                              {p.character_name} {p.is_self && <span className="text-[8px] opacity-50">(You)</span>}
                            </p>
                            <p className="text-[9px]" style={{ color: 'var(--text-muted)' }}>
                              {p.origin_name} &middot; Lvl {p.level} &middot; Ch.{p.chapter}
                            </p>
                          </div>
                          {!p.is_self && (
                            <button onClick={() => requestEncounter(p.user_id)}
                              className="text-[9px] px-2 py-1 rounded-lg transition-all hover:scale-105"
                              style={{ background: `${p.color}10`, color: p.color, border: `1px solid ${p.color}15` }}>
                              <Swords size={10} />
                            </button>
                          )}
                        </motion.div>
                      ))}
                      {players.length === 0 && (
                        <p className="text-xs col-span-2 text-center py-6" style={{ color: 'var(--text-muted)' }}>
                          The realm is quiet. Click "Find Cross-Path Encounter" to meet an NPC starseed!
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'leaderboard' && (
                <motion.div key="leaderboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  data-testid="realm-leaderboard">

                  {/* Founder Badge Claim */}
                  {founderStatus && !founderStatus.is_founder && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                      className="rounded-2xl p-5 mb-6 border text-center"
                      style={{ background: 'linear-gradient(135deg, rgba(252,211,77,0.04), rgba(0,0,0,0.3))', borderColor: 'rgba(252,211,77,0.15)' }}>
                      <Award size={24} className="mx-auto mb-2" style={{ color: '#FCD34D' }} />
                      <h3 className="text-sm font-medium mb-1" style={{ color: '#FCD34D' }}>Become a Cosmic Founder</h3>
                      <p className="text-[10px] mb-3 max-w-sm mx-auto" style={{ color: 'var(--text-secondary)' }}>
                        Early explorers earn an exclusive badge, unique aura color, and access to the secret Founder's Harmonic frequency.
                      </p>
                      <button onClick={claimFounderBadge}
                        className="px-5 py-2 rounded-xl text-xs font-medium transition-all hover:scale-105"
                        style={{ background: 'rgba(252,211,77,0.1)', border: '1px solid rgba(252,211,77,0.25)', color: '#FCD34D' }}
                        data-testid="claim-founder-btn">
                        <Sparkles size={12} className="inline mr-1.5" />Claim Founder Badge
                      </button>
                    </motion.div>
                  )}
                  {founderStatus?.is_founder && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      className="rounded-2xl p-4 mb-6 flex items-center gap-3 border"
                      style={{ background: 'linear-gradient(135deg, rgba(252,211,77,0.06), rgba(0,0,0,0.2))', borderColor: 'rgba(252,211,77,0.2)' }}
                      data-testid="founder-badge-display">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center"
                        style={{ background: 'rgba(252,211,77,0.12)', border: '1px solid rgba(252,211,77,0.3)' }}>
                        <Award size={18} style={{ color: '#FCD34D' }} />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-medium" style={{ color: '#FCD34D' }}>Cosmic Founder</p>
                        <p className="text-[9px]" style={{ color: 'var(--text-muted)' }}>Exclusive Founder's Harmonic unlocked in Mixer</p>
                      </div>
                      <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#FCD34D', boxShadow: '0 0 8px rgba(252,211,77,0.5)' }} />
                    </motion.div>
                  )}

                  {/* Category Tabs */}
                  <div className="flex items-center gap-1 mb-5 p-1 rounded-xl overflow-x-auto scrollbar-hide"
                    style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
                    {[
                      { id: 'shining', label: 'Shining Brightest', icon: Star, color: '#FCD34D' },
                      { id: 'aura', label: 'Brightest Aura', icon: Heart, color: '#EC4899' },
                      { id: 'helpful', label: 'Most Helpful', icon: Users, color: '#2DD4BF' },
                      { id: 'founders', label: 'Founders', icon: Award, color: '#FCD34D' },
                    ].map(cat => {
                      const Icon = cat.icon;
                      return (
                        <button key={cat.id} onClick={() => setLeaderCategory(cat.id)}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[9px] font-medium transition-all whitespace-nowrap flex-shrink-0"
                          style={{
                            background: leaderCategory === cat.id ? `${cat.color}12` : 'transparent',
                            color: leaderCategory === cat.id ? cat.color : 'var(--text-muted)',
                          }}
                          data-testid={`leader-cat-${cat.id}`}>
                          <Icon size={11} /> {cat.label}
                        </button>
                      );
                    })}
                  </div>

                  {/* Shining Brightest */}
                  {leaderCategory === 'shining' && (
                    <div className="space-y-2">
                      {leaderboard.map((entry, i) => (
                        <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
                          className="rounded-xl p-3 flex items-center gap-3 border"
                          style={{ background: entry.is_self ? `${entry.color}08` : 'rgba(255,255,255,0.02)', borderColor: entry.is_self ? `${entry.color}20` : 'rgba(255,255,255,0.04)' }}>
                          <div className="w-8 text-center">
                            {i < 3 ? <Crown size={16} style={{ color: ['#FCD34D', '#C0C0C0', '#CD7F32'][i], margin: '0 auto' }} /> : <span className="text-xs tabular-nums font-bold" style={{ color: 'var(--text-muted)' }}>#{entry.rank}</span>}
                          </div>
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${entry.color}12` }}>
                            <Star size={14} style={{ color: entry.color }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <p className="text-xs font-medium truncate" style={{ color: entry.color }}>
                                {entry.character_name} {entry.is_self && <span className="text-[8px] opacity-50">(You)</span>}
                              </p>
                              {entry.is_founder && <Award size={10} style={{ color: '#FCD34D' }} />}
                            </div>
                            <p className="text-[9px]" style={{ color: 'var(--text-muted)' }}>{entry.origin_name} &middot; Ch.{entry.chapter} &middot; {entry.achievements} achievements</p>
                          </div>
                          <span className="text-xs font-bold" style={{ color: '#FCD34D' }}>Lvl {entry.level}</span>
                        </motion.div>
                      ))}
                      {leaderboard.length === 0 && <p className="text-xs text-center py-8" style={{ color: 'var(--text-muted)' }}>No adventurers yet. Be the first!</p>}
                    </div>
                  )}

                  {/* Brightest Aura */}
                  {leaderCategory === 'aura' && (
                    <div className="space-y-2">
                      <p className="text-[10px] mb-3 text-center" style={{ color: 'var(--text-secondary)' }}>
                        Starseeds whose creations radiate the most love across the Gallery
                      </p>
                      {brightestAura.map((entry, i) => (
                        <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
                          className="rounded-xl p-3 flex items-center gap-3 border"
                          style={{ background: entry.is_self ? 'rgba(236,72,153,0.06)' : 'rgba(255,255,255,0.02)', borderColor: entry.is_self ? 'rgba(236,72,153,0.15)' : 'rgba(255,255,255,0.04)' }}>
                          <div className="w-8 text-center">
                            {i < 3 ? <Crown size={16} style={{ color: ['#FCD34D', '#C0C0C0', '#CD7F32'][i], margin: '0 auto' }} /> : <span className="text-xs tabular-nums font-bold" style={{ color: 'var(--text-muted)' }}>#{entry.rank}</span>}
                          </div>
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${entry.color}12` }}>
                            <Heart size={14} style={{ color: '#EC4899' }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <p className="text-xs font-medium truncate" style={{ color: entry.color }}>{entry.character_name}</p>
                              {entry.is_founder && <Award size={10} style={{ color: '#FCD34D' }} />}
                            </div>
                            <p className="text-[9px]" style={{ color: 'var(--text-muted)' }}>{entry.origin_name} &middot; Lvl {entry.level}</p>
                          </div>
                          <div className="flex items-center gap-1">
                            <Heart size={11} style={{ color: '#EC4899' }} />
                            <span className="text-xs font-bold tabular-nums" style={{ color: '#EC4899' }}>{entry.radiates}</span>
                          </div>
                        </motion.div>
                      ))}
                      {brightestAura.length === 0 && <p className="text-xs text-center py-8" style={{ color: 'var(--text-muted)' }}>No radiates yet. Share your avatar in the Gallery!</p>}
                    </div>
                  )}

                  {/* Most Helpful */}
                  {leaderCategory === 'helpful' && (
                    <div className="space-y-2">
                      <p className="text-[10px] mb-3 text-center" style={{ color: 'var(--text-secondary)' }}>
                        The most supportive souls in alliance chats and cooperative battles
                      </p>
                      {mostHelpful.map((entry, i) => (
                        <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
                          className="rounded-xl p-3 flex items-center gap-3 border"
                          style={{ background: entry.is_self ? 'rgba(45,212,191,0.06)' : 'rgba(255,255,255,0.02)', borderColor: entry.is_self ? 'rgba(45,212,191,0.15)' : 'rgba(255,255,255,0.04)' }}>
                          <div className="w-8 text-center">
                            {i < 3 ? <Crown size={16} style={{ color: ['#FCD34D', '#C0C0C0', '#CD7F32'][i], margin: '0 auto' }} /> : <span className="text-xs tabular-nums font-bold" style={{ color: 'var(--text-muted)' }}>#{entry.rank}</span>}
                          </div>
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(45,212,191,0.08)' }}>
                            <Users size={14} style={{ color: '#2DD4BF' }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <p className="text-xs font-medium truncate" style={{ color: entry.color }}>{entry.character_name}</p>
                              {entry.is_founder && <Award size={10} style={{ color: '#FCD34D' }} />}
                            </div>
                            <p className="text-[9px]" style={{ color: 'var(--text-muted)' }}>{entry.origin_name} &middot; Lvl {entry.level}</p>
                          </div>
                          <span className="text-xs font-bold tabular-nums" style={{ color: '#2DD4BF' }}>{entry.contributions} msgs</span>
                        </motion.div>
                      ))}
                      {mostHelpful.length === 0 && <p className="text-xs text-center py-8" style={{ color: 'var(--text-muted)' }}>Join an alliance and start chatting to appear here!</p>}
                    </div>
                  )}

                  {/* Founders */}
                  {leaderCategory === 'founders' && (
                    <div className="space-y-2">
                      <p className="text-[10px] mb-3 text-center" style={{ color: 'var(--text-secondary)' }}>
                        The first starseeds to explore the portals — bearers of the sacred Founder's Harmonic
                      </p>
                      {founders.map((entry, i) => (
                        <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
                          className="rounded-xl p-3 flex items-center gap-3 border"
                          style={{
                            background: entry.is_self ? 'rgba(252,211,77,0.06)' : 'rgba(255,255,255,0.02)',
                            borderColor: entry.is_self ? 'rgba(252,211,77,0.15)' : 'rgba(255,255,255,0.04)',
                          }}>
                          <div className="w-8 text-center">
                            <span className="text-xs tabular-nums font-bold" style={{ color: '#FCD34D' }}>#{entry.rank}</span>
                          </div>
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                            style={{ background: 'rgba(252,211,77,0.1)', border: '1px solid rgba(252,211,77,0.2)' }}>
                            <Award size={14} style={{ color: '#FCD34D' }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium truncate" style={{ color: entry.color || '#FCD34D' }}>
                              {entry.character_name} {entry.is_self && <span className="text-[8px] opacity-50">(You)</span>}
                            </p>
                            <p className="text-[9px]" style={{ color: 'var(--text-muted)' }}>
                              {entry.origin_name}{entry.first_portal ? ` &middot; First: ${entry.first_portal}` : ''}
                            </p>
                          </div>
                          <div className="w-2 h-2 rounded-full" style={{ background: entry.aura_color || '#FCD34D', boxShadow: `0 0 6px ${entry.aura_color || '#FCD34D'}50` }} />
                        </motion.div>
                      ))}
                      {founders.length === 0 && <p className="text-xs text-center py-8" style={{ color: 'var(--text-muted)' }}>No founders yet. Claim your badge above!</p>}
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === 'bosses' && (
                <motion.div key="bosses" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  data-testid="realm-bosses">
                  <BossEncounterPanel activeOrigin={activeOrigin} authHeaders={authHeaders} userId={user?.id} />
                </motion.div>
              )}

              {activeTab === 'alliances' && (
                <motion.div key="alliances" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  data-testid="realm-alliances">
                  {myAlliance ? (
                    <div className="rounded-2xl p-5 mb-6 border"
                      style={{ background: 'rgba(192,132,252,0.04)', borderColor: 'rgba(192,132,252,0.15)' }}>
                      <div className="flex items-center gap-2 mb-3">
                        <Users size={14} style={{ color: '#C084FC' }} />
                        <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#C084FC' }}>Your Alliance</span>
                      </div>
                      <h3 className="text-lg font-light mb-3" style={{ fontFamily: 'Cormorant Garamond, serif' }}>{myAlliance.name}</h3>
                      <div className="space-y-2 mb-4">
                        {myAlliance.member_details?.map((m, i) => (
                          <div key={i} className="flex items-center gap-2 text-xs">
                            <Star size={10} style={{ color: ORIGIN_COLORS[m.origin_id] || '#818CF8' }} />
                            <span style={{ color: ORIGIN_COLORS[m.origin_id] || '#818CF8' }}>{m.character_name}</span>
                            <span className="text-[9px]" style={{ color: 'var(--text-muted)' }}>Lvl {m.level}</span>
                            {m.role === 'leader' && <Crown size={9} style={{ color: '#FCD34D' }} />}
                          </div>
                        ))}
                      </div>
                      <AllianceChat allianceId={myAlliance.id} authHeaders={authHeaders} userId={user?.id} />
                    </div>
                  ) : (
                    <div className="rounded-2xl p-5 mb-6 border"
                      style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.05)' }}>
                      <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--text-muted)' }}>Create Alliance</p>
                      <div className="flex gap-2">
                        <input type="text" placeholder="Alliance name..." maxLength={30}
                          value={allianceName} onChange={e => setAllianceName(e.target.value)}
                          className="flex-1 px-3 py-2 rounded-lg text-sm"
                          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-primary)', outline: 'none' }}
                          data-testid="alliance-name-input" />
                        <button onClick={createAlliance}
                          className="px-4 py-2 rounded-lg text-xs font-medium flex items-center gap-1"
                          style={{ background: 'rgba(192,132,252,0.1)', border: '1px solid rgba(192,132,252,0.2)', color: '#C084FC' }}
                          data-testid="create-alliance-btn">
                          <Plus size={12} /> Create
                        </button>
                      </div>
                    </div>
                  )}

                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-3" style={{ color: 'var(--text-muted)' }}>
                    Open Alliances
                  </p>
                  <div className="space-y-2">
                    {alliances.map((a) => (
                      <div key={a.id} className="rounded-xl p-3 flex items-center gap-3 border"
                        style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.04)' }}>
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{ background: 'rgba(192,132,252,0.08)' }}>
                          <Users size={14} style={{ color: '#C084FC' }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium truncate" style={{ color: 'var(--text-primary)' }}>{a.name}</p>
                          <p className="text-[9px]" style={{ color: 'var(--text-muted)' }}>{a.members?.length || 0}/6 members</p>
                        </div>
                        {!myAlliance && (
                          <button onClick={() => joinAlliance(a.id)}
                            className="text-[9px] px-2 py-1 rounded-lg flex items-center gap-1"
                            style={{ background: 'rgba(192,132,252,0.08)', color: '#C084FC', border: '1px solid rgba(192,132,252,0.15)' }}
                            data-testid={`join-alliance-${a.id}`}>
                            <UserPlus size={9} /> Join
                          </button>
                        )}
                      </div>
                    ))}
                    {alliances.length === 0 && (
                      <p className="text-xs text-center py-6" style={{ color: 'var(--text-muted)' }}>No alliances yet. Create the first one!</p>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </div>
    </div>
  );
}
