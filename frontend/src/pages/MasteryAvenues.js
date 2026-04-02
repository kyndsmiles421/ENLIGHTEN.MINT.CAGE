import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  Compass, Palette, Brain, Sparkles, Zap, Lock,
  ChevronRight, CheckCircle, HelpCircle, Send,
  BookOpen, Eye, Atom, Star, Grid3X3
} from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const AVENUE_ICONS = { mathematics: Compass, art: Palette, thought: Brain };
const TIER_COLORS = ['#94A3B8', '#2DD4BF', '#8B5CF6', '#FBBF24', '#F472B6'];

function AvenueCard({ avenue, onSelect }) {
  const Icon = AVENUE_ICONS[avenue.id] || Sparkles;
  const tierColor = TIER_COLORS[avenue.tier] || '#94A3B8';

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      onClick={() => onSelect(avenue.id)}
      className="rounded-xl p-4 cursor-pointer transition-all"
      style={{ background: `${avenue.color}04`, border: `1px solid ${avenue.color}10` }}
      data-testid={`avenue-card-${avenue.id}`}
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: `${avenue.color}10`, border: `1px solid ${avenue.color}20` }}>
          <Icon size={18} style={{ color: avenue.color }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-[11px] font-medium" style={{ color: 'var(--text-primary)' }}>{avenue.name}</h3>
          </div>
          <p className="text-[8px] italic" style={{ color: avenue.color }}>{avenue.title}</p>
          <p className="text-[8px] mt-1" style={{ color: 'var(--text-muted)' }}>{avenue.description}</p>

          {/* Resonance bar */}
          <div className="mt-2 flex items-center gap-2">
            <div className="flex-1 h-1.5 rounded-full" style={{ background: `${avenue.color}10` }}>
              <div className="h-full rounded-full transition-all" style={{
                width: `${avenue.pct}%`, background: avenue.color,
              }} />
            </div>
            <span className="text-[8px] font-mono shrink-0" style={{ color: avenue.color }}>
              {avenue.resonance}/{avenue.max_resonance}
            </span>
          </div>

          <div className="flex items-center gap-2 mt-1.5">
            <span className="text-[7px] px-1.5 py-0.5 rounded-full" style={{ background: `${tierColor}12`, color: tierColor }}>
              {avenue.tier_name}
            </span>
            <span className="text-[7px]" style={{ color: 'var(--text-muted)' }}>
              {avenue.completed_count} completed
            </span>
            {avenue.equilibrium_reached && (
              <span className="text-[7px] px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(251,191,36,0.1)', color: '#FBBF24' }}>
                Equilibrium
              </span>
            )}
          </div>
        </div>
        <ChevronRight size={12} className="shrink-0 mt-3" style={{ color: 'var(--text-muted)' }} />
      </div>
    </motion.div>
  );
}

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
        <Compass size={11} style={{ color: '#06B6D4' }} />
        <span className="text-[9px] uppercase tracking-widest font-bold" style={{ color: '#06B6D4' }}>
          Sacred Geometry Proofs
        </span>
      </div>
      {challenges.map(c => (
        <div key={c.id} className="rounded-lg p-2.5"
          style={{
            background: c.completed ? 'rgba(45,212,191,0.03)' : 'rgba(248,250,252,0.015)',
            border: `1px solid ${c.completed ? 'rgba(45,212,191,0.1)' : 'rgba(248,250,252,0.04)'}`,
          }}
          data-testid={`challenge-${c.id}`}
        >
          <div className="flex items-center gap-2">
            {c.completed ? (
              <CheckCircle size={10} style={{ color: '#2DD4BF' }} />
            ) : (
              <HelpCircle size={10} style={{ color: '#06B6D4' }} />
            )}
            <span className="text-[10px] font-medium flex-1" style={{ color: c.completed ? '#2DD4BF' : 'var(--text-primary)' }}>
              {c.name}
            </span>
            <span className="text-[7px]" style={{ color: '#06B6D4' }}>+{c.resonance} res</span>
          </div>

          {!c.completed && (
            <>
              <p className="text-[8px] mt-1 ml-5" style={{ color: 'var(--text-muted)' }}>{c.question}</p>
              {activeId === c.id ? (
                <div className="flex gap-1.5 mt-1.5 ml-5">
                  <input
                    value={answer}
                    onChange={e => setAnswer(e.target.value)}
                    placeholder="Your answer..."
                    className="flex-1 px-2 py-1 rounded text-[9px] outline-none"
                    style={{ background: 'rgba(248,250,252,0.04)', border: '1px solid rgba(248,250,252,0.08)', color: 'var(--text-primary)' }}
                    data-testid={`answer-input-${c.id}`}
                    onKeyDown={e => e.key === 'Enter' && handleSubmit(c.id)}
                  />
                  <button onClick={() => handleSubmit(c.id)}
                    className="px-2 py-1 rounded text-[8px]"
                    style={{ background: 'rgba(6,182,212,0.1)', color: '#06B6D4' }}
                    data-testid={`submit-${c.id}`}>
                    <Send size={10} />
                  </button>
                </div>
              ) : (
                <button onClick={() => { setActiveId(c.id); setAnswer(''); }}
                  className="text-[8px] mt-1 ml-5" style={{ color: '#06B6D4' }}>
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
        <Brain size={11} style={{ color: '#FBBF24' }} />
        <span className="text-[9px] uppercase tracking-widest font-bold" style={{ color: '#FBBF24' }}>
          Integration Quests
        </span>
      </div>
      {quests.map(q => (
        <div key={q.id} className="rounded-lg p-2.5"
          style={{
            background: q.completed ? 'rgba(45,212,191,0.03)' : 'rgba(248,250,252,0.015)',
            border: `1px solid ${q.completed ? 'rgba(45,212,191,0.1)' : 'rgba(248,250,252,0.04)'}`,
          }}
          data-testid={`quest-${q.id}`}
        >
          <div className="flex items-center gap-2">
            {q.completed ? <CheckCircle size={10} style={{ color: '#2DD4BF' }} /> : <BookOpen size={10} style={{ color: '#FBBF24' }} />}
            <span className="text-[10px] font-medium flex-1" style={{ color: q.completed ? '#2DD4BF' : 'var(--text-primary)' }}>
              {q.name}
            </span>
            <span className="text-[7px] capitalize px-1 rounded" style={{ background: 'rgba(248,250,252,0.03)', color: 'var(--text-muted)' }}>
              {q.archetype}
            </span>
          </div>

          {!q.completed && (
            <>
              <p className="text-[8px] mt-1 ml-5 italic" style={{ color: 'var(--text-muted)' }}>"{q.prompt}"</p>
              {activeId === q.id ? (
                <div className="mt-1.5 ml-5 space-y-1">
                  <textarea
                    value={reflection}
                    onChange={e => setReflection(e.target.value)}
                    placeholder="Your reflection..."
                    rows={3}
                    className="w-full px-2 py-1.5 rounded text-[9px] outline-none resize-none"
                    style={{ background: 'rgba(248,250,252,0.04)', border: '1px solid rgba(248,250,252,0.08)', color: 'var(--text-primary)' }}
                    data-testid={`reflection-input-${q.id}`}
                  />
                  <button onClick={() => handleSubmit(q.id)}
                    className="px-3 py-1 rounded text-[8px] flex items-center gap-1"
                    style={{ background: 'rgba(251,191,36,0.1)', color: '#FBBF24' }}
                    data-testid={`submit-reflection-${q.id}`}>
                    <Send size={8} /> Submit Reflection
                  </button>
                </div>
              ) : (
                <button onClick={() => { setActiveId(q.id); setReflection(''); }}
                  className="text-[8px] mt-1 ml-5" style={{ color: '#FBBF24' }}>
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
        <Palette size={11} style={{ color: '#F472B6' }} />
        <span className="text-[9px] uppercase tracking-widest font-bold" style={{ color: '#F472B6' }}>
          Visual Resonance Prompts
        </span>
      </div>
      {prompts.map(p => (
        <div key={p.id} className="rounded-lg p-2.5"
          style={{
            background: p.completed ? 'rgba(45,212,191,0.03)' : 'rgba(248,250,252,0.015)',
            border: `1px solid ${p.completed ? 'rgba(45,212,191,0.1)' : 'rgba(248,250,252,0.04)'}`,
          }}
          data-testid={`art-${p.id}`}
        >
          <div className="flex items-center gap-2">
            {p.completed ? <CheckCircle size={10} style={{ color: '#2DD4BF' }} /> : <Palette size={10} style={{ color: '#F472B6' }} />}
            <span className="text-[10px] font-medium flex-1" style={{ color: p.completed ? '#2DD4BF' : 'var(--text-primary)' }}>
              {p.name}
            </span>
            <span className="text-[7px]" style={{ color: '#F472B6' }}>+{p.resonance} res</span>
          </div>

          {!p.completed && (
            <>
              <p className="text-[8px] mt-1 ml-5 italic" style={{ color: 'var(--text-muted)' }}>"{p.prompt}"</p>
              {activeId === p.id ? (
                <div className="mt-1.5 ml-5 space-y-1">
                  <textarea
                    value={creation}
                    onChange={e => setCreation(e.target.value)}
                    placeholder="Your creation..."
                    rows={3}
                    className="w-full px-2 py-1.5 rounded text-[9px] outline-none resize-none"
                    style={{ background: 'rgba(248,250,252,0.04)', border: '1px solid rgba(248,250,252,0.08)', color: 'var(--text-primary)' }}
                    data-testid={`creation-input-${p.id}`}
                  />
                  <button onClick={() => handleSubmit(p.id)}
                    className="px-3 py-1 rounded text-[8px] flex items-center gap-1"
                    style={{ background: 'rgba(244,114,182,0.1)', color: '#F472B6' }}
                    data-testid={`submit-creation-${p.id}`}>
                    <Send size={8} /> Submit Vision
                  </button>
                </div>
              ) : (
                <button onClick={() => { setActiveId(p.id); setCreation(''); }}
                  className="text-[8px] mt-1 ml-5" style={{ color: '#F472B6' }}>
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

export default function MasteryAvenues() {
  const { authHeaders } = useAuth();
  const navigate = useNavigate();
  const [avenues, setAvenues] = useState([]);
  const [totalResonance, setTotalResonance] = useState(0);
  const [combinedTier, setCombinedTier] = useState('Seeker');
  const [activeAvenue, setActiveAvenue] = useState(null);
  const [challenges, setChallenges] = useState([]);
  const [quests, setQuests] = useState([]);
  const [artPrompts, setArtPrompts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOverview = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/avenues/overview`, { headers: authHeaders });
      setAvenues(res.data.avenues || []);
      setTotalResonance(res.data.total_resonance);
      setCombinedTier(res.data.combined_tier_name);
    } catch (e) { console.error('Avenues fetch failed', e); }
    setLoading(false);
  }, [authHeaders]);

  useEffect(() => { fetchOverview(); }, [fetchOverview]);

  const loadAvenue = async (avenueId) => {
    setActiveAvenue(avenueId);
    try {
      if (avenueId === 'mathematics') {
        const res = await axios.get(`${API}/avenues/mathematics/challenges`, { headers: authHeaders });
        setChallenges(res.data.challenges || []);
      } else if (avenueId === 'thought') {
        const res = await axios.get(`${API}/avenues/thought/quests`, { headers: authHeaders });
        setQuests(res.data.quests || []);
      } else if (avenueId === 'art') {
        const res = await axios.get(`${API}/avenues/art/prompts`, { headers: authHeaders });
        setArtPrompts(res.data.prompts || []);
      }
    } catch (e) { console.error('Avenue load failed', e); }
  };

  const handleSolve = async (challengeId, answer) => {
    try {
      const res = await axios.post(`${API}/avenues/mathematics/solve`, { challenge_id: challengeId, answer }, { headers: authHeaders });
      if (res.data.correct) {
        fetchOverview();
        const r = await axios.get(`${API}/avenues/mathematics/challenges`, { headers: authHeaders });
        setChallenges(r.data.challenges || []);
      }
      return res.data;
    } catch (e) { alert(e.response?.data?.detail || 'Failed'); return null; }
  };

  const handleReflect = async (questId, reflection) => {
    try {
      const res = await axios.post(`${API}/avenues/thought/reflect`, { quest_id: questId, reflection }, { headers: authHeaders });
      fetchOverview();
      const r = await axios.get(`${API}/avenues/thought/quests`, { headers: authHeaders });
      setQuests(r.data.quests || []);
      return res.data;
    } catch (e) { alert(e.response?.data?.detail || 'Failed'); return null; }
  };

  const handleCreate = async (promptId, creation) => {
    try {
      const res = await axios.post(`${API}/avenues/art/create`, { prompt_id: promptId, creation }, { headers: authHeaders });
      fetchOverview();
      const r = await axios.get(`${API}/avenues/art/prompts`, { headers: authHeaders });
      setArtPrompts(r.data.prompts || []);
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

  return (
    <div className="min-h-screen px-4 pt-20 pb-32 max-w-2xl mx-auto space-y-5" data-testid="mastery-avenues-page">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-1">
        <h1 className="text-xl font-light tracking-wide"
          style={{ color: 'var(--text-primary)', fontFamily: 'Cormorant Garamond, serif' }}>
          Mastery Avenues
        </h1>
        <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
          Three Paths of Dimensional Navigation
        </p>
      </motion.div>

      {/* Combined resonance */}
      <div className="rounded-xl p-3 text-center" style={{ background: 'rgba(251,191,36,0.04)', border: '1px solid rgba(251,191,36,0.08)' }}>
        <p className="text-[8px] uppercase tracking-widest mb-1" style={{ color: 'var(--text-muted)' }}>Combined Resonance</p>
        <p className="text-lg font-light" style={{ color: '#FBBF24', fontFamily: 'Cormorant Garamond, serif' }}>
          {totalResonance}
        </p>
        <p className="text-[8px]" style={{ color: '#FBBF24' }}>{combinedTier}</p>
      </div>

      {/* Avenue cards */}
      {!activeAvenue ? (
        <div className="space-y-2">
          {avenues.map(a => <AvenueCard key={a.id} avenue={a} onSelect={loadAvenue} />)}
        </div>
      ) : (
        <>
          <button onClick={() => setActiveAvenue(null)}
            className="text-[9px] flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
            ← Back to Avenues
          </button>

          {activeAvenue === 'mathematics' && <MathChallengePanel challenges={challenges} onSolve={handleSolve} />}
          {activeAvenue === 'thought' && <ThoughtQuestPanel quests={quests} onReflect={handleReflect} />}
          {activeAvenue === 'art' && <ArtPromptPanel prompts={artPrompts} onCreate={handleCreate} />}
        </>
      )}

      {/* Quick nav */}
      <button onClick={() => navigate('/fractal-engine')}
        className="w-full py-2 rounded-lg text-[9px] flex items-center justify-center gap-1 transition-all hover:scale-[1.01]"
        style={{ background: 'rgba(139,92,246,0.06)', color: '#8B5CF6', border: '1px solid rgba(139,92,246,0.1)' }}
        data-testid="nav-fractal">
        <Grid3X3 size={10} /> Fractal Engine
      </button>
    </div>
  );
}
