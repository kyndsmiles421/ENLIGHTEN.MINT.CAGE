import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  Compass, Palette, Brain, Sparkles, Zap, Lock,
  ChevronRight, CheckCircle, HelpCircle, Send,
  BookOpen, Eye, Atom, Star, Grid3X3, HeartPulse,
  Footprints, Bike, Dumbbell, Flower2, Shield,
  FlaskConical, Scroll, ShoppingBag, ChevronDown,
  Wrench, Hammer, Package, MapPin
} from 'lucide-react';
import BotanicalLabPanel from '../components/avenues/BotanicalLabPanel';
import EBikePanel from '../components/avenues/EBikePanel';
import HistoryPanel from '../components/avenues/HistoryPanel';
import CircularEconomyPanel from '../components/avenues/CircularEconomyPanel';
import ForgePanel from '../components/avenues/ForgePanel';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

// ━━━━ Avenue Theme System ━━━━
const AVENUE_THEMES = {
  material: {
    name: 'The Material Avenue',
    subtitle: 'Engineering & Economy',
    hue: '#F59E0B',
    hueDim: 'rgba(245,158,11,',
    glassBg: 'rgba(30,22,10,0.6)',
    glassCollapsed: 'rgba(30,22,10,0.2)',
    edgeGlow: 'rgba(245,158,11,0.35)',
    icon: Wrench,
    pillars: ['science_ebike', 'economy'],
    currency: 'Kinetic Dust',
  },
  living: {
    name: 'The Living Avenue',
    subtitle: 'Biology & Wellness',
    hue: '#2DD4BF',
    hueDim: 'rgba(45,212,191,',
    glassBg: 'rgba(10,28,25,0.6)',
    glassCollapsed: 'rgba(10,28,25,0.2)',
    edgeGlow: 'rgba(45,212,191,0.35)',
    icon: Flower2,
    pillars: ['science_botanical', 'biometrics', 'art'],
    currency: 'Science Resonance',
  },
  ancestral: {
    name: 'The Ancestral Avenue',
    subtitle: 'Knowledge & Spirit',
    hue: '#8B5CF6',
    hueDim: 'rgba(139,92,246,',
    glassBg: 'rgba(18,10,30,0.6)',
    glassCollapsed: 'rgba(18,10,30,0.2)',
    edgeGlow: 'rgba(139,92,246,0.35)',
    icon: Scroll,
    pillars: ['history', 'mathematics', 'thought'],
    currency: 'Science Resonance',
  },
};

const AVENUE_ICONS = {
  mathematics: Compass, art: Palette, thought: Brain, biometrics: HeartPulse,
  science: FlaskConical, history: Scroll,
};

// ━━━━ Glass Panel Wrapper ━━━━
function GlassPanel({ children, theme, expanded, onClick, testId }) {
  return (
    <motion.div
      layout
      className="rounded-2xl overflow-hidden transition-all"
      style={{
        background: expanded ? theme.glassBg : theme.glassCollapsed,
        backdropFilter: expanded ? 'blur(8px)' : 'blur(10px)',
        WebkitBackdropFilter: expanded ? 'blur(8px)' : 'blur(10px)',
        borderLeft: `2px solid ${theme.edgeGlow}`,
        border: '1px solid ' + theme.hueDim + (expanded ? '0.12)' : '0.06)'),
        boxShadow: expanded ? ('0 8px 32px ' + theme.hueDim + '0.08), inset 0 1px 0 ' + theme.hueDim + '0.05)') : 'none',
      }}
      data-testid={testId}
    >
      {children}
    </motion.div>
  );
}

// ━━━━ Integrated Avenue Shop ━━━━
function AvenueShop({ avenue, authHeaders }) {
  const [packs, setPacks] = useState([]);
  const [balances, setBalances] = useState({});
  const [purchasing, setPurchasing] = useState(null);
  const [showShop, setShowShop] = useState(false);
  const theme = AVENUE_THEMES[avenue];

  const fetchPacks = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/science-history/economy/education-packs?avenue=${avenue}`, { headers: authHeaders });
      setPacks(res.data.packs || []);
      setBalances(res.data.balances || {});
    } catch (e) { console.error('Packs fetch failed', e); }
  }, [avenue, authHeaders]);

  useEffect(() => { if (showShop) fetchPacks(); }, [showShop, fetchPacks]);

  const handlePurchase = async (packId) => {
    setPurchasing(packId);
    try {
      await axios.post(`${API}/science-history/economy/purchase-pack`, { pack_id: packId }, { headers: authHeaders });
      fetchPacks();
    } catch (e) { alert(e.response?.data?.detail || 'Purchase failed'); }
    setPurchasing(null);
  };

  const RARITY_COLORS = { common: '#94A3B8', uncommon: '#2DD4BF', rare: '#8B5CF6', legendary: '#FBBF24' };

  return (
    <div className="mt-3">
      <button onClick={() => setShowShop(!showShop)}
        className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-[8px] uppercase tracking-widest transition-all"
        style={{
          background: `${theme.hueDim}0.04)`,
          border: `1px solid ${theme.hueDim}0.08)`,
          color: theme.hue,
        }}
        data-testid={`shop-toggle-${avenue}`}
      >
        <span className="flex items-center gap-1.5">
          <Package size={9} /> Education Packs
        </span>
        <ChevronDown size={10} style={{ transform: showShop ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
      </button>

      <AnimatePresence>
        {showShop && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="space-y-2 pt-2">
              {packs.map(pack => {
                const rarCol = RARITY_COLORS[pack.rarity] || '#94A3B8';
                const cost = pack.scaled_cost;
                const bal = pack.currency === 'kinetic_dust' ? balances.kinetic_dust : balances.science_resonance;
                const canAfford = bal >= cost;
                return (
                  <div key={pack.id} className="rounded-lg p-2.5"
                    style={{
                      background: pack.owned ? (theme.hueDim + '0.03)') : 'rgba(248,250,252,0.015)',
                      border: '1px solid ' + (pack.owned ? (theme.hueDim + '0.1)') : 'rgba(248,250,252,0.04)'),
                    }}
                    data-testid={`pack-${pack.id}`}
                  >
                    <div className="flex items-start gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[9px] font-medium" style={{ color: pack.owned ? '#2DD4BF' : 'var(--text-primary)' }}>
                            {pack.name}
                          </span>
                          <span className="text-[6px] uppercase px-1 py-0.5 rounded-full" style={{ background: `${rarCol}12`, color: rarCol }}>
                            {pack.rarity}
                          </span>
                        </div>
                        <p className="text-[7px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{pack.description}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[7px] font-mono" style={{ color: canAfford ? theme.hue : '#EF4444' }}>
                            {cost} {pack.currency === 'kinetic_dust' ? 'Dust' : 'Res'}
                          </span>
                          {pack.scaling !== 'flat' && (
                            <span className="text-[6px] uppercase" style={{ color: 'var(--text-muted)' }}>
                              Lv{pack.user_level} scaling
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="shrink-0">
                        {pack.owned ? (
                          <span className="text-[7px] px-1.5 py-0.5 rounded flex items-center gap-0.5"
                            style={{ background: 'rgba(45,212,191,0.08)', color: '#2DD4BF' }}>
                            <CheckCircle size={7} /> Owned
                          </span>
                        ) : canAfford ? (
                          <button onClick={() => handlePurchase(pack.id)}
                            disabled={purchasing === pack.id}
                            className="text-[7px] px-2 py-1 rounded transition-all"
                            style={{ background: theme.hueDim + '0.1)', color: theme.hue, border: '1px solid ' + theme.hueDim + '0.15)' }}
                            data-testid={`buy-pack-${pack.id}`}
                          >
                            {purchasing === pack.id ? '...' : 'Acquire'}
                          </button>
                        ) : (
                          <span className="text-[7px] px-1.5 py-0.5 rounded flex items-center gap-0.5"
                            style={{ color: 'var(--text-muted)' }}>
                            <Lock size={7} />
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              {packs.length === 0 && (
                <p className="text-[8px] text-center py-2" style={{ color: 'var(--text-muted)' }}>No packs available</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ━━━━ Inline Sub-Panels (kept from original) ━━━━

function MathChallengePanel({ challenges, onSolve }) {
  const [activeId, setActiveId] = useState(null);
  const [answer, setAnswer] = useState('');

  const handleSubmit = async (challengeId) => {
    const result = await onSolve(challengeId, answer);
    if (result?.correct) { setActiveId(null); setAnswer(''); }
  };

  return (
    <div className="space-y-2" data-testid="math-challenges">
      <div className="flex items-center gap-2 mb-1">
        <Compass size={11} style={{ color: '#8B5CF6' }} />
        <span className="text-[9px] uppercase tracking-widest font-bold" style={{ color: '#8B5CF6' }}>
          Sacred Geometry Proofs
        </span>
      </div>
      {challenges.map(c => (
        <div key={c.id} className="rounded-lg p-2.5"
          style={{
            background: c.completed ? 'rgba(139,92,246,0.03)' : 'rgba(248,250,252,0.015)',
            border: `1px solid ${c.completed ? 'rgba(139,92,246,0.1)' : 'rgba(248,250,252,0.04)'}`,
          }}
          data-testid={`challenge-${c.id}`}
        >
          <div className="flex items-center gap-2">
            {c.completed ? <CheckCircle size={10} style={{ color: '#2DD4BF' }} /> : <HelpCircle size={10} style={{ color: '#8B5CF6' }} />}
            <span className="text-[10px] font-medium flex-1" style={{ color: c.completed ? '#2DD4BF' : 'var(--text-primary)' }}>
              {c.name}
            </span>
            <span className="text-[7px]" style={{ color: '#8B5CF6' }}>+{c.resonance} res</span>
          </div>
          {!c.completed && (
            <>
              <p className="text-[8px] mt-1 ml-5" style={{ color: 'var(--text-muted)' }}>{c.question}</p>
              {activeId === c.id ? (
                <div className="flex gap-1.5 mt-1.5 ml-5">
                  <input value={answer} onChange={e => setAnswer(e.target.value)}
                    placeholder="Your answer..." className="flex-1 px-2 py-1 rounded text-[9px] outline-none"
                    style={{ background: 'rgba(248,250,252,0.04)', border: '1px solid rgba(248,250,252,0.08)', color: 'var(--text-primary)' }}
                    data-testid={`answer-input-${c.id}`} onKeyDown={e => e.key === 'Enter' && handleSubmit(c.id)} />
                  <button onClick={() => handleSubmit(c.id)} className="px-2 py-1 rounded text-[8px]"
                    style={{ background: 'rgba(139,92,246,0.1)', color: '#8B5CF6' }} data-testid={`submit-${c.id}`}>
                    <Send size={10} />
                  </button>
                </div>
              ) : (
                <button onClick={() => { setActiveId(c.id); setAnswer(''); }} className="text-[8px] mt-1 ml-5" style={{ color: '#8B5CF6' }}>
                  Attempt →
                </button>
              )}
            </>
          )}
        </div>
      ))}
    </div>
  );
}

function ThoughtQuestPanel({ quests, onReflect }) {
  const [activeId, setActiveId] = useState(null);
  const [reflection, setReflection] = useState('');
  const handleSubmit = async (questId) => {
    if (reflection.trim().length < 10) { alert('Reflection must be at least 10 characters'); return; }
    const result = await onReflect(questId, reflection);
    if (result?.success) { setActiveId(null); setReflection(''); }
  };
  return (
    <div className="space-y-2" data-testid="thought-quests">
      <div className="flex items-center gap-2 mb-1">
        <Brain size={11} style={{ color: '#8B5CF6' }} />
        <span className="text-[9px] uppercase tracking-widest font-bold" style={{ color: '#8B5CF6' }}>Integration Quests</span>
      </div>
      {quests.map(q => (
        <div key={q.id} className="rounded-lg p-2.5"
          style={{ background: q.completed ? 'rgba(139,92,246,0.03)' : 'rgba(248,250,252,0.015)', border: `1px solid ${q.completed ? 'rgba(139,92,246,0.1)' : 'rgba(248,250,252,0.04)'}` }}
          data-testid={`quest-${q.id}`}>
          <div className="flex items-center gap-2">
            {q.completed ? <CheckCircle size={10} style={{ color: '#2DD4BF' }} /> : <BookOpen size={10} style={{ color: '#8B5CF6' }} />}
            <span className="text-[10px] font-medium flex-1" style={{ color: q.completed ? '#2DD4BF' : 'var(--text-primary)' }}>{q.name}</span>
            <span className="text-[7px] capitalize px-1 rounded" style={{ background: 'rgba(248,250,252,0.03)', color: 'var(--text-muted)' }}>{q.archetype}</span>
          </div>
          {!q.completed && (
            <>
              <p className="text-[8px] mt-1 ml-5 italic" style={{ color: 'var(--text-muted)' }}>"{q.prompt}"</p>
              {activeId === q.id ? (
                <div className="mt-1.5 ml-5 space-y-1">
                  <textarea value={reflection} onChange={e => setReflection(e.target.value)}
                    placeholder="Your reflection..." rows={3}
                    className="w-full px-2 py-1.5 rounded text-[9px] outline-none resize-none"
                    style={{ background: 'rgba(248,250,252,0.04)', border: '1px solid rgba(248,250,252,0.08)', color: 'var(--text-primary)' }}
                    data-testid={`reflection-input-${q.id}`} />
                  <button onClick={() => handleSubmit(q.id)} className="px-3 py-1 rounded text-[8px] flex items-center gap-1"
                    style={{ background: 'rgba(139,92,246,0.1)', color: '#8B5CF6' }} data-testid={`submit-reflection-${q.id}`}>
                    <Send size={8} /> Submit Reflection
                  </button>
                </div>
              ) : (
                <button onClick={() => { setActiveId(q.id); setReflection(''); }} className="text-[8px] mt-1 ml-5" style={{ color: '#8B5CF6' }}>
                  Begin Integration →
                </button>
              )}
            </>
          )}
        </div>
      ))}
    </div>
  );
}

function ArtPromptPanel({ prompts, onCreate }) {
  const [activeId, setActiveId] = useState(null);
  const [creation, setCreation] = useState('');
  const handleSubmit = async (promptId) => {
    if (creation.trim().length < 10) { alert('Creation must be at least 10 characters'); return; }
    const result = await onCreate(promptId, creation);
    if (result?.success) { setActiveId(null); setCreation(''); }
  };
  return (
    <div className="space-y-2" data-testid="art-prompts">
      <div className="flex items-center gap-2 mb-1">
        <Palette size={11} style={{ color: '#2DD4BF' }} />
        <span className="text-[9px] uppercase tracking-widest font-bold" style={{ color: '#2DD4BF' }}>Visual Resonance Prompts</span>
      </div>
      {prompts.map(p => (
        <div key={p.id} className="rounded-lg p-2.5"
          style={{ background: p.completed ? 'rgba(45,212,191,0.03)' : 'rgba(248,250,252,0.015)', border: `1px solid ${p.completed ? 'rgba(45,212,191,0.1)' : 'rgba(248,250,252,0.04)'}` }}
          data-testid={`art-${p.id}`}>
          <div className="flex items-center gap-2">
            {p.completed ? <CheckCircle size={10} style={{ color: '#2DD4BF' }} /> : <Palette size={10} style={{ color: '#2DD4BF' }} />}
            <span className="text-[10px] font-medium flex-1" style={{ color: p.completed ? '#2DD4BF' : 'var(--text-primary)' }}>{p.name}</span>
            <span className="text-[7px]" style={{ color: '#2DD4BF' }}>+{p.resonance} res</span>
          </div>
          {!p.completed && (
            <>
              <p className="text-[8px] mt-1 ml-5 italic" style={{ color: 'var(--text-muted)' }}>"{p.prompt}"</p>
              {activeId === p.id ? (
                <div className="mt-1.5 ml-5 space-y-1">
                  <textarea value={creation} onChange={e => setCreation(e.target.value)}
                    placeholder="Your creation..." rows={3}
                    className="w-full px-2 py-1.5 rounded text-[9px] outline-none resize-none"
                    style={{ background: 'rgba(248,250,252,0.04)', border: '1px solid rgba(248,250,252,0.08)', color: 'var(--text-primary)' }}
                    data-testid={`creation-input-${p.id}`} />
                  <button onClick={() => handleSubmit(p.id)} className="px-3 py-1 rounded text-[8px] flex items-center gap-1"
                    style={{ background: 'rgba(45,212,191,0.1)', color: '#2DD4BF' }} data-testid={`submit-creation-${p.id}`}>
                    <Send size={8} /> Submit Vision
                  </button>
                </div>
              ) : (
                <button onClick={() => { setActiveId(p.id); setCreation(''); }} className="text-[8px] mt-1 ml-5" style={{ color: '#2DD4BF' }}>
                  Create →
                </button>
              )}
            </>
          )}
        </div>
      ))}
    </div>
  );
}

const ACTIVITY_ICONS = {
  walking: Footprints, cycling: Bike, running: Zap, yoga: Flower2,
  martial_arts: Shield, dance: Sparkles, gym: Dumbbell, meditation: Brain,
};

function BiometricsPanel({ activities, onLog, bioStats }) {
  const [activeId, setActiveId] = useState(null);
  const [value, setValue] = useState('');
  const [heartRate, setHeartRate] = useState('');
  const [duration, setDuration] = useState('');

  const handleSubmit = async (actId) => {
    if (!value || parseFloat(value) <= 0) { alert('Enter a positive value'); return; }
    const result = await onLog(actId, parseFloat(value), heartRate ? parseInt(heartRate) : null, duration ? parseInt(duration) : null);
    if (result?.success) { setActiveId(null); setValue(''); setHeartRate(''); setDuration(''); }
  };

  return (
    <div className="space-y-3" data-testid="biometrics-panel">
      <div className="flex items-center gap-2 mb-1">
        <HeartPulse size={11} style={{ color: '#2DD4BF' }} />
        <span className="text-[9px] uppercase tracking-widest font-bold" style={{ color: '#2DD4BF' }}>Physical Activities — The Sentinel</span>
      </div>
      {bioStats && (
        <div className="grid grid-cols-3 gap-2 mb-2">
          <div className="text-center p-2 rounded-lg" style={{ background: 'rgba(45,212,191,0.04)', border: '1px solid rgba(45,212,191,0.08)' }}>
            <p className="text-[10px] font-mono" style={{ color: '#2DD4BF' }}>{bioStats.total_sessions}</p>
            <p className="text-[6px] uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Sessions</p>
          </div>
          <div className="text-center p-2 rounded-lg" style={{ background: 'rgba(245,158,11,0.04)', border: '1px solid rgba(245,158,11,0.08)' }}>
            <p className="text-[10px] font-mono" style={{ color: '#F59E0B' }}>{bioStats.kinetic_dust_total?.toFixed(1)}</p>
            <p className="text-[6px] uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Kinetic Dust</p>
          </div>
          <div className="text-center p-2 rounded-lg" style={{ background: 'rgba(45,212,191,0.04)', border: '1px solid rgba(45,212,191,0.08)' }}>
            <p className="text-[10px] font-mono" style={{ color: '#2DD4BF' }}>{bioStats.resonance}</p>
            <p className="text-[6px] uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Resonance</p>
          </div>
        </div>
      )}
      {activities?.map(a => {
        const Icon = ACTIVITY_ICONS[a.id] || HeartPulse;
        return (
          <div key={a.id} className="rounded-lg p-2.5"
            style={{ background: 'rgba(248,250,252,0.015)', border: '1px solid rgba(248,250,252,0.04)' }}
            data-testid={`activity-${a.id}`}>
            <div className="flex items-center gap-2">
              <Icon size={12} style={{ color: '#2DD4BF' }} />
              <span className="text-[10px] font-medium flex-1" style={{ color: 'var(--text-primary)' }}>{a.name}</span>
              <span className="text-[7px] capitalize px-1 rounded" style={{ background: 'rgba(45,212,191,0.06)', color: '#2DD4BF' }}>
                {a.category?.replace('_', ' ')}
              </span>
              <span className="text-[7px]" style={{ color: 'var(--text-muted)' }}>{a.sessions_completed} sessions</span>
            </div>
            <p className="text-[8px] mt-0.5 ml-5" style={{ color: 'var(--text-muted)' }}>{a.description}</p>
            <div className="flex gap-2 mt-1 ml-5">
              <span className="text-[7px]" style={{ color: '#F59E0B' }}>{a.kinetic_dust_per_unit} dust/{a.unit}</span>
              <span className="text-[7px]" style={{ color: '#2DD4BF' }}>+{a.resonance_per_session} res/session</span>
              <span className="text-[7px]" style={{ color: '#FBBF24' }}>BPM: {a.target_bpm?.min}-{a.target_bpm?.max}</span>
            </div>
            {activeId === a.id ? (
              <div className="mt-2 ml-5 space-y-1.5">
                <div className="flex gap-1.5">
                  <input value={value} onChange={e => setValue(e.target.value)} placeholder={`${a.unit}...`} type="number"
                    className="flex-1 px-2 py-1 rounded text-[9px] outline-none"
                    style={{ background: 'rgba(248,250,252,0.04)', border: '1px solid rgba(248,250,252,0.08)', color: 'var(--text-primary)' }}
                    data-testid={`value-input-${a.id}`} />
                  <input value={heartRate} onChange={e => setHeartRate(e.target.value)} placeholder="BPM" type="number"
                    className="w-16 px-2 py-1 rounded text-[9px] outline-none"
                    style={{ background: 'rgba(248,250,252,0.04)', border: '1px solid rgba(248,250,252,0.08)', color: 'var(--text-primary)' }} />
                  <input value={duration} onChange={e => setDuration(e.target.value)} placeholder="mins" type="number"
                    className="w-16 px-2 py-1 rounded text-[9px] outline-none"
                    style={{ background: 'rgba(248,250,252,0.04)', border: '1px solid rgba(248,250,252,0.08)', color: 'var(--text-primary)' }} />
                </div>
                <button onClick={() => handleSubmit(a.id)}
                  className="px-3 py-1 rounded text-[8px] flex items-center gap-1"
                  style={{ background: 'rgba(45,212,191,0.1)', color: '#2DD4BF' }}
                  data-testid={`submit-activity-${a.id}`}>
                  <Send size={8} /> Log Activity
                </button>
              </div>
            ) : (
              <button onClick={() => { setActiveId(a.id); setValue(''); setHeartRate(''); setDuration(''); }}
                className="text-[8px] mt-1 ml-5" style={{ color: '#2DD4BF' }}>
                Log Session →
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}


// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  MAIN COMPONENT: Three Avenues Hub
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export default function MasteryAvenues() {
  const { authHeaders } = useAuth();
  const navigate = useNavigate();
  const [avenues, setAvenues] = useState([]);
  const [totalResonance, setTotalResonance] = useState(0);
  const [combinedTier, setCombinedTier] = useState('Seeker');
  const [dustBalance, setDustBalance] = useState(0);
  const [sciRes, setSciRes] = useState(0);
  const [expandedAvenue, setExpandedAvenue] = useState(null);
  const [activePillar, setActivePillar] = useState(null);

  // Sub-panel data
  const [challenges, setChallenges] = useState([]);
  const [quests, setQuests] = useState([]);
  const [artPrompts, setArtPrompts] = useState([]);
  const [bioActivities, setBioActivities] = useState([]);
  const [bioStats, setBioStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [decayStatus, setDecayStatus] = useState(null);
  const [covenData, setCovenData] = useState(null);

  const fetchOverview = useCallback(async () => {
    try {
      const [aRes, shopRes, decayRes, covenRes] = await Promise.all([
        axios.get(`${API}/avenues/overview`, { headers: authHeaders }),
        axios.get(`${API}/science-history/economy/shop`, { headers: authHeaders }).catch(() => ({ data: { balances: {} } })),
        axios.get(`${API}/cosmic-map/decay-status`, { headers: authHeaders }).catch(() => ({ data: null })),
        axios.get(`${API}/sync/covens/my`, { headers: authHeaders }).catch(() => ({ data: { in_coven: false } })),
      ]);
      setAvenues(aRes.data.avenues || []);
      setTotalResonance(aRes.data.total_resonance);
      setCombinedTier(aRes.data.combined_tier_name);
      setDustBalance(shopRes.data.balances?.kinetic_dust || 0);
      setSciRes(shopRes.data.balances?.science_resonance || 0);
      if (decayRes.data) setDecayStatus(decayRes.data);
      setCovenData(covenRes.data?.in_coven ? covenRes.data : null);
    } catch (e) { console.error('Avenues fetch failed', e); }
    setLoading(false);
  }, [authHeaders]);

  useEffect(() => { fetchOverview(); }, [fetchOverview]);

  // Avenue pillar groupings
  const getAvenueData = (avenueKey) => {
    const mapping = {
      material: ['science'],
      living: ['biometrics', 'science', 'art'],
      ancestral: ['history', 'mathematics', 'thought'],
    };
    return (mapping[avenueKey] || []).map(id => avenues.find(a => a.id === id)).filter(Boolean);
  };

  const getAvenueResonance = (avenueKey) => {
    return getAvenueData(avenueKey).reduce((sum, a) => sum + (a.resonance || 0), 0);
  };

  const toggleAvenue = (key) => {
    setExpandedAvenue(prev => prev === key ? null : key);
    setActivePillar(null);
  };

  // Load pillar data
  const loadPillar = async (pillarId) => {
    setActivePillar(pillarId);
    try {
      if (pillarId === 'mathematics') {
        const res = await axios.get(`${API}/avenues/mathematics/challenges`, { headers: authHeaders });
        setChallenges(res.data.challenges || []);
      } else if (pillarId === 'thought') {
        const res = await axios.get(`${API}/avenues/thought/quests`, { headers: authHeaders });
        setQuests(res.data.quests || []);
      } else if (pillarId === 'art') {
        const res = await axios.get(`${API}/avenues/art/prompts`, { headers: authHeaders });
        setArtPrompts(res.data.prompts || []);
      } else if (pillarId === 'biometrics') {
        const [actRes, statRes] = await Promise.all([
          axios.get(`${API}/avenues/biometrics/activities`, { headers: authHeaders }),
          axios.get(`${API}/avenues/biometrics/stats`, { headers: authHeaders }),
        ]);
        setBioActivities(actRes.data.activities || []);
        setBioStats(statRes.data);
      }
    } catch (e) { console.error('Pillar load failed', e); }
  };

  const handleSolve = async (challengeId, answer) => {
    try {
      const res = await axios.post(`${API}/avenues/mathematics/solve`, { challenge_id: challengeId, answer }, { headers: authHeaders });
      if (res.data.correct) { fetchOverview(); const r = await axios.get(`${API}/avenues/mathematics/challenges`, { headers: authHeaders }); setChallenges(r.data.challenges || []); }
      return res.data;
    } catch (e) { alert(e.response?.data?.detail || 'Failed'); return null; }
  };

  const handleReflect = async (questId, reflection) => {
    try {
      const res = await axios.post(`${API}/avenues/thought/reflect`, { quest_id: questId, reflection }, { headers: authHeaders });
      fetchOverview(); const r = await axios.get(`${API}/avenues/thought/quests`, { headers: authHeaders }); setQuests(r.data.quests || []);
      return res.data;
    } catch (e) { alert(e.response?.data?.detail || 'Failed'); return null; }
  };

  const handleCreate = async (promptId, creation) => {
    try {
      const res = await axios.post(`${API}/avenues/art/create`, { prompt_id: promptId, creation }, { headers: authHeaders });
      fetchOverview(); const r = await axios.get(`${API}/avenues/art/prompts`, { headers: authHeaders }); setArtPrompts(r.data.prompts || []);
      return res.data;
    } catch (e) { alert(e.response?.data?.detail || 'Failed'); return null; }
  };

  const handleLogActivity = async (activityId, value, heartRate, duration) => {
    try {
      const body = { activity_id: activityId, value };
      if (heartRate) body.heart_rate = heartRate;
      if (duration) body.duration_minutes = duration;
      const res = await axios.post(`${API}/avenues/biometrics/log`, body, { headers: authHeaders });
      fetchOverview();
      const [actRes, statRes] = await Promise.all([
        axios.get(`${API}/avenues/biometrics/activities`, { headers: authHeaders }),
        axios.get(`${API}/avenues/biometrics/stats`, { headers: authHeaders }),
      ]);
      setBioActivities(actRes.data.activities || []);
      setBioStats(statRes.data);
      return res.data;
    } catch (e) { alert(e.response?.data?.detail || 'Failed'); return null; }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 2, repeat: Infinity }}>
          <Star size={28} style={{ color: '#FBBF24' }} />
        </motion.div>
      </div>
    );
  }

  // Pillar rendering within an avenue
  const renderPillarButtons = (avenueKey) => {
    const theme = AVENUE_THEMES[avenueKey];
    const pillarConfigs = {
      material: [
        { id: 'ebike', label: 'E-Bike Engineering', icon: Bike },
        { id: 'economy', label: 'Circular Economy', icon: ShoppingBag },
      ],
      living: [
        { id: 'botanical', label: 'Botanical Lab', icon: FlaskConical },
        { id: 'biometrics', label: 'Heart Rate Sync', icon: HeartPulse },
        { id: 'art', label: 'Visual Resonance', icon: Palette },
      ],
      ancestral: [
        { id: 'history', label: 'History & Alchemy', icon: Scroll },
        { id: 'mathematics', label: 'Sacred Geometry', icon: Compass },
        { id: 'thought', label: 'Integration Quests', icon: Brain },
      ],
    };

    return (
      <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
        {(pillarConfigs[avenueKey] || []).map(p => {
          const isActive = activePillar === p.id;
          return (
            <button key={p.id}
              onClick={() => {
                if (isActive) { setActivePillar(null); return; }
                if (['mathematics', 'thought', 'art', 'biometrics'].includes(p.id)) loadPillar(p.id);
                setActivePillar(p.id);
              }}
              className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-[8px] transition-all"
              style={{
                background: isActive ? (theme.hueDim + '0.12)') : (theme.hueDim + '0.03)'),
                border: '1px solid ' + (isActive ? (theme.hueDim + '0.2)') : (theme.hueDim + '0.06)')),
                color: isActive ? theme.hue : 'var(--text-muted)',
              }}
              data-testid={`pillar-${p.id}`}
            >
              <p.icon size={10} /> {p.label}
            </button>
          );
        })}
      </div>
    );
  };

  const renderActivePillar = (avenueKey) => {
    if (!activePillar) return null;

    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 8 }}
        className="mt-3"
      >
        {/* Material */}
        {avenueKey === 'material' && activePillar === 'ebike' && <EBikePanel />}
        {avenueKey === 'material' && activePillar === 'economy' && <CircularEconomyPanel />}

        {/* Living */}
        {avenueKey === 'living' && activePillar === 'botanical' && <BotanicalLabPanel />}
        {avenueKey === 'living' && activePillar === 'biometrics' && <BiometricsPanel activities={bioActivities} onLog={handleLogActivity} bioStats={bioStats} />}
        {avenueKey === 'living' && activePillar === 'art' && <ArtPromptPanel prompts={artPrompts} onCreate={handleCreate} />}

        {/* Ancestral */}
        {avenueKey === 'ancestral' && activePillar === 'history' && <HistoryPanel />}
        {avenueKey === 'ancestral' && activePillar === 'mathematics' && <MathChallengePanel challenges={challenges} onSolve={handleSolve} />}
        {avenueKey === 'ancestral' && activePillar === 'thought' && <ThoughtQuestPanel quests={quests} onReflect={handleReflect} />}
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen px-4 pt-20 pb-32 max-w-2xl mx-auto space-y-4" data-testid="mastery-avenues-page">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-1">
        <h1 className="text-xl font-light tracking-wide"
          style={{ color: 'var(--text-primary)', fontFamily: 'Cormorant Garamond, serif' }}>
          Three Avenues of Flow
        </h1>
        <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
          Material, Living, Ancestral
        </p>
      </motion.div>

      {/* Global Pinned Tickers */}
      <div className="rounded-xl p-3"
        style={{
          background: 'rgba(15,15,25,0.6)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          border: '1px solid rgba(248,250,252,0.05)',
        }}
        data-testid="global-tickers"
      >
        <div className="grid grid-cols-4 gap-2 text-center">
          <div>
            <p className="text-[11px] font-mono" style={{ color: '#FBBF24' }}>{totalResonance}</p>
            <p className="text-[6px] uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Resonance</p>
          </div>
          <div>
            <p className="text-[11px] font-mono" style={{ color: '#F59E0B' }}>{dustBalance}</p>
            <p className="text-[6px] uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Kinetic Dust</p>
          </div>
          <div>
            <p className="text-[11px] font-mono" style={{ color: '#2DD4BF' }}>{sciRes}</p>
            <p className="text-[6px] uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Sci Resonance</p>
          </div>
          <div>
            <p className="text-[11px] font-mono" style={{ color: '#8B5CF6' }}>{combinedTier}</p>
            <p className="text-[6px] uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Tier</p>
          </div>
        </div>
      </div>

      {/* Decay Warning */}
      {decayStatus?.at_risk && (
        <motion.div
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: decayStatus.pulse_speed || 1.5, repeat: Infinity }}
          className="rounded-xl px-3 py-2"
          style={{
            background: 'rgba(239,68,68,0.08)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(239,68,68,0.15)',
          }}
          data-testid="decay-warning"
        >
          <p className="text-[8px] text-center" style={{ color: '#EF4444' }}>
            Resonance Decay: {decayStatus.days_inactive?.toFixed(1)} days inactive — projected loss: Sci -{decayStatus.science_resonance - decayStatus.projected_science}, Hist -{decayStatus.history_resonance - decayStatus.projected_history}
          </p>
        </motion.div>
      )}

      {/* Three Avenue Accordions */}
      {Object.entries(AVENUE_THEMES).map(([key, theme]) => {
        const Icon = theme.icon;
        const isExpanded = expandedAvenue === key;
        const avenueRes = getAvenueResonance(key);
        const avenueData = getAvenueData(key);
        const totalMax = avenueData.reduce((s, a) => s + (a.max_resonance || 200), 0);
        const pct = totalMax > 0 ? Math.round((avenueRes / totalMax) * 100) : 0;

        return (
          <GlassPanel key={key} theme={theme} expanded={isExpanded} testId={`avenue-${key}`}>
            {/* Accordion Header (Closed = Level 1 Glance) */}
            <div className="px-4 py-3 cursor-pointer select-none" onClick={() => toggleAvenue(key)}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: `${theme.hueDim}0.08)`, border: `1px solid ${theme.hueDim}0.15)` }}>
                  <Icon size={16} style={{ color: theme.hue }} />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-[11px] font-medium tracking-wide" style={{ color: 'var(--text-primary)' }}>
                    {theme.name}
                  </h2>
                  <p className="text-[8px]" style={{ color: theme.hue }}>{theme.subtitle}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-[10px] font-mono" style={{ color: theme.hue }}>{avenueRes}</p>
                  <p className="text-[6px] uppercase" style={{ color: 'var(--text-muted)' }}>{pct}% Efficiency</p>
                </div>
                <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
                  <ChevronDown size={14} style={{ color: theme.hue }} />
                </motion.div>
              </div>

              {/* Mini progress bar */}
              <div className="mt-2 h-0.5 rounded-full" style={{ background: `${theme.hueDim}0.06)` }}>
                <motion.div className="h-full rounded-full"
                  animate={{ width: `${pct}%` }}
                  style={{ background: theme.hue }} />
              </div>
            </div>

            {/* Expanded Content (Level 2 Active) */}
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="px-4 pb-4 space-y-3">
                    {/* Pillar navigation */}
                    {renderPillarButtons(key)}

                    {/* Active pillar content */}
                    <AnimatePresence mode="wait">
                      {renderActivePillar(key)}
                    </AnimatePresence>

                    {/* Integrated shop */}
                    <AvenueShop avenue={key} authHeaders={authHeaders} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </GlassPanel>
        );
      })}

      {/* Resonance Forge */}
      <ForgePanel authHeaders={authHeaders} covenData={covenData} />

      {/* Cosmic Map nav */}
      <button onClick={() => navigate('/cosmic-map')}
        className="w-full py-2.5 rounded-lg text-[9px] flex items-center justify-center gap-1.5 transition-all hover:scale-[1.01]"
        style={{
          background: 'rgba(15,15,25,0.6)',
          backdropFilter: 'blur(8px)',
          color: '#FBBF24',
          border: '1px solid rgba(251,191,36,0.1)',
        }}
        data-testid="nav-cosmic-map">
        <MapPin size={10} /> Cosmic Map — GPS Nodes
      </button>

      {/* Quick nav */}
      <button onClick={() => navigate('/fractal-engine')}
        className="w-full py-2 rounded-lg text-[9px] flex items-center justify-center gap-1 transition-all hover:scale-[1.01]"
        style={{
          background: 'rgba(15,15,25,0.6)',
          backdropFilter: 'blur(8px)',
          color: '#8B5CF6',
          border: '1px solid rgba(139,92,246,0.1)',
        }}
        data-testid="nav-fractal">
        <Grid3X3 size={10} /> Fractal Engine
      </button>
    </div>
  );
}
