import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import {
  Star, Swords, ArrowLeft, Loader2, Globe, Trophy, Skull,
  Users, Crown, UserPlus, Plus
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
  const { user, authHeaders, loading: authLoading } = useAuth();
  const { reduceParticles } = useSensory();
  const navigate = useNavigate();

  const [players, setPlayers] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
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

  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate('/auth'); return; }

    Promise.all([
      axios.get(`${API}/starseed/realm/world-event`).then(r => setWorldEvent(r.data)).catch(() => {}),
      axios.get(`${API}/starseed/realm/active-players`, { headers: authHeaders }).then(r => setPlayers(r.data.players)).catch(() => {}),
      axios.get(`${API}/starseed/realm/leaderboard`, { headers: authHeaders }).then(r => setLeaderboard(r.data.leaderboard)).catch(() => {}),
      axios.get(`${API}/starseed/realm/my-alliance`, { headers: authHeaders }).then(r => setMyAlliance(r.data.alliance)).catch(() => {}),
      axios.get(`${API}/starseed/realm/alliances`, { headers: authHeaders }).then(r => setAlliances(r.data.alliances)).catch(() => {}),
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
      <div className="max-w-5xl mx-auto">
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
                  <div className="space-y-2">
                    {leaderboard.map((entry, i) => (
                      <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
                        className="rounded-xl p-3 flex items-center gap-3 border"
                        style={{
                          background: entry.is_self ? `${entry.color}08` : 'rgba(255,255,255,0.02)',
                          borderColor: entry.is_self ? `${entry.color}20` : 'rgba(255,255,255,0.04)',
                        }}>
                        <div className="w-8 text-center">
                          {i < 3 ? (
                            <Crown size={16} style={{ color: ['#FCD34D', '#C0C0C0', '#CD7F32'][i], margin: '0 auto' }} />
                          ) : (
                            <span className="text-xs tabular-nums font-bold" style={{ color: 'var(--text-muted)' }}>#{entry.rank}</span>
                          )}
                        </div>
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{ background: `${entry.color}12` }}>
                          <Star size={14} style={{ color: entry.color }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium truncate" style={{ color: entry.color }}>
                            {entry.character_name} {entry.is_self && <span className="text-[8px] opacity-50">(You)</span>}
                          </p>
                          <p className="text-[9px]" style={{ color: 'var(--text-muted)' }}>
                            {entry.origin_name} &middot; Ch.{entry.chapter} &middot; {entry.achievements} achievements
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-bold" style={{ color: '#FCD34D' }}>Lvl {entry.level}</span>
                        </div>
                      </motion.div>
                    ))}
                    {leaderboard.length === 0 && (
                      <p className="text-xs text-center py-8" style={{ color: 'var(--text-muted)' }}>No adventurers yet. Be the first!</p>
                    )}
                  </div>
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
