import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, Sparkles, ChevronRight, Play, RotateCcw, Trophy, Volume2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useMixer, FREQUENCIES as MIXER_FREQUENCIES } from '../context/MixerContext';
import { CosmicInlineLoader, CosmicError, getCosmicErrorMessage } from '../components/CosmicFeedback';
import { toast } from 'sonner';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function Starseed() {
  useEffect(() => { if (typeof window.__workAccrue === 'function') window.__workAccrue('starseed', 8); }, []);

  const navigate = useNavigate();
  const { authHeaders } = useAuth();
  const { toggleFreq, activeFreqs } = useMixer();
  const [phase, setPhase] = useState('intro');
  const [origins, setOrigins] = useState([]);
  const [chapter, setChapter] = useState(null);
  const [loading, setLoading] = useState(false);
  const [path, setPath] = useState([]);
  const [myOrigin, setMyOrigin] = useState(null);
  const [journeys, setJourneys] = useState([]);
  const [fetchError, setFetchError] = useState(null);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    setInitialLoading(true);
    setFetchError(null);
    axios.get(`${API}/starseed/origins`)
      .then(r => setOrigins(r.data))
      .catch(err => {
        const cosmic = getCosmicErrorMessage(err);
        setFetchError(cosmic);
      })
      .finally(() => setInitialLoading(false));
    if (authHeaders?.Authorization) {
      axios.get(`${API}/starseed/my-origin`, { headers: authHeaders }).then(r => setMyOrigin(r.data)).catch(() => {});
      axios.get(`${API}/starseed/my-journeys`, { headers: authHeaders }).then(r => setJourneys(r.data)).catch(() => {});
    }
  }, [authHeaders]);

  const startJourney = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/starseed/chapter/awakening`);
      setChapter(res.data);
      setPath(['awakening']);
      setPhase('adventure');
    } catch (err) {
      const msg = getCosmicErrorMessage(err);
      toast.error(msg.title);
    }
    setLoading(false);
  }, []);

  const makeChoice = useCallback(async (choice) => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/starseed/chapter/${choice.leads_to}`);
      setChapter(res.data);
      setPath(p => [...p, choice.leads_to]);
      if (res.data.ending) setPhase('ending');
    } catch (err) {
      const msg = getCosmicErrorMessage(err);
      toast.error(msg.message);
    }
    setLoading(false);
  }, []);

  const playEndingFrequency = useCallback(async () => {
    if (!chapter?.frequency) return;
    const freq = MIXER_FREQUENCIES.find(f => f.hz === chapter.frequency) || { hz: chapter.frequency, label: `${chapter.frequency} Hz`, color: '#C084FC' };
    await toggleFreq(freq);
  }, [chapter, toggleFreq]);

  const saveJourney = useCallback(async () => {
    if (!chapter?.origin_result || !authHeaders?.Authorization) return;
    try {
      await axios.post(`${API}/starseed/save-journey`, {
        origin_id: chapter.origin_result,
        origin_name: chapter.origin?.name,
        gift: chapter.gift,
        path,
        frequency: chapter.frequency,
      }, { headers: authHeaders });
      toast.success('Journey Saved', { description: `You are ${chapter.origin?.name}` });
      setMyOrigin({ origin: chapter.origin, gift: chapter.gift });
    } catch {}
  }, [chapter, path, authHeaders]);

  const restart = () => { setPhase('intro'); setChapter(null); setPath([]); };

  return (
    <div className="min-h-screen pb-40" style={{ background: 'radial-gradient(ellipse at 30% 20%, rgba(129,140,248,0.06) 0%, transparent 60%), radial-gradient(ellipse at 70% 80%, rgba(192,132,252,0.04) 0%, transparent 50%), var(--bg-primary)' }}>
      <div className="px-4 pt-4 max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-white/5 transition-all" data-testid="starseed-back">
            <ArrowLeft size={18} style={{ color: 'var(--text-muted)' }} />
          </button>
          <div>
            <h1 className="text-2xl font-light" style={{ color: 'var(--text-primary)', fontFamily: 'Cormorant Garamond, serif' }}>
              Starseed Journey
            </h1>
            <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Discover your cosmic origin</p>
          </div>
        </div>

        {/* Initial Loading / Error States */}
        {initialLoading && (
          <CosmicInlineLoader message="Channeling starseed origins..." />
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
          {/* ─── INTRO PHASE ─── */}
          {phase === 'intro' && (
            <motion.div key="intro" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {/* Current Origin Badge */}
              {myOrigin?.origin && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                  className="mb-6 p-4 rounded-2xl" data-testid="my-origin-badge"
                  style={{ background: `${myOrigin.origin.color}08`, border: `1px solid ${myOrigin.origin.color}15` }}>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: `${myOrigin.origin.color}12` }}>
                      <Star size={20} style={{ color: myOrigin.origin.color }} />
                    </div>
                    <div>
                      <p className="text-[9px] uppercase tracking-widest" style={{ color: myOrigin.origin.color }}>Your Origin</p>
                      <p className="text-lg font-light" style={{ color: 'var(--text-primary)', fontFamily: 'Cormorant Garamond, serif' }}>{myOrigin.origin.name}</p>
                      <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Gift: {myOrigin.gift}</p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Origin Gallery */}
              <p className="text-[10px] uppercase tracking-widest mb-3" style={{ color: 'var(--text-muted)' }}>Star Nations</p>
              <div className="grid grid-cols-2 gap-2.5 mb-6">
                {origins.map((o, i) => (
                  <motion.div key={o.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                    className="p-3 rounded-xl" data-testid={`origin-${o.id}`}
                    style={{ background: `${o.color}04`, border: `1px solid ${o.color}10` }}>
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: `${o.color}12` }}>
                        <Star size={11} style={{ color: o.color }} />
                      </div>
                      <span className="text-xs font-medium" style={{ color: o.color }}>{o.name}</span>
                    </div>
                    <p className="text-[9px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>{o.desc}</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {o.traits.map(t => (
                        <span key={t} className="text-[8px] px-1.5 py-0.5 rounded-full" style={{ background: `${o.color}06`, color: `${o.color}80`, border: `1px solid ${o.color}10` }}>{t}</span>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Start Button */}
              <motion.button
                onClick={startJourney} disabled={loading}
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                className="w-full py-4 rounded-2xl text-sm font-medium flex items-center justify-center gap-2.5 transition-all"
                style={{
                  background: 'linear-gradient(135deg, rgba(129,140,248,0.1), rgba(192,132,252,0.08))',
                  border: '1px solid rgba(129,140,248,0.2)',
                  color: '#818CF8',
                  boxShadow: '0 4px 20px rgba(129,140,248,0.1)',
                }}
                data-testid="start-journey-btn"
              >
                <Sparkles size={16} /> {myOrigin?.origin ? 'Begin New Journey' : 'Begin Your Journey'}
              </motion.button>

              {/* Past Journeys */}
              {journeys.length > 0 && (
                <div className="mt-6">
                  <p className="text-[10px] uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>Past Journeys</p>
                  <div className="space-y-1.5">
                    {journeys.slice(0, 5).map(j => {
                      const origin = origins.find(o => o.id === j.origin_id);
                      return (
                        <div key={j.id} className="flex items-center gap-2.5 p-2.5 rounded-lg" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
                          <Trophy size={11} style={{ color: origin?.color || '#818CF8' }} />
                          <span className="text-[10px] flex-1" style={{ color: 'var(--text-secondary)' }}>{origin?.name || j.origin_name}</span>
                          <span className="text-[9px]" style={{ color: 'var(--text-muted)' }}>{j.gift}</span>
                          <span className="text-[8px]" style={{ color: 'var(--text-muted)' }}>{new Date(j.completed_at).toLocaleDateString()}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* ─── ADVENTURE PHASE ─── */}
          {phase === 'adventure' && chapter && (
            <motion.div key={`chapter-${chapter.id}`} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.4 }}>
              <div className="mb-8">
                <p className="text-[9px] uppercase tracking-widest mb-2" style={{ color: '#818CF8' }}>Chapter {path.length}</p>
                <h2 className="text-xl font-light mb-4" style={{ color: 'var(--text-primary)', fontFamily: 'Cormorant Garamond, serif' }}>
                  {chapter.title}
                </h2>
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
                  className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)', lineHeight: 1.8 }}>
                  {chapter.narration}
                </motion.p>
              </div>

              <div className="space-y-3">
                <p className="text-[9px] uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Choose your path</p>
                {loading ? (
                  <CosmicInlineLoader message="The cosmos is revealing your path..." />
                ) : (
                chapter.choices.map((c, i) => (
                  <motion.button key={c.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.1 }}
                    onClick={() => makeChoice(c)} disabled={loading}
                    className="w-full p-4 rounded-xl text-left flex items-start gap-3 group hover:scale-[1.01] transition-all"
                    style={{
                      background: 'rgba(129,140,248,0.03)',
                      border: '1px solid rgba(129,140,248,0.08)',
                    }}
                    data-testid={`choice-${c.id}`}
                  >
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{ background: 'rgba(129,140,248,0.06)' }}>
                      <Sparkles size={13} style={{ color: '#818CF8' }} />
                    </div>
                    <p className="text-xs leading-relaxed flex-1" style={{ color: 'var(--text-primary)' }}>{c.text}</p>
                    <ChevronRight size={14} style={{ color: 'var(--text-muted)' }} className="mt-1 opacity-0 group-hover:opacity-100 transition-all flex-shrink-0" />
                  </motion.button>
                ))
                )}
              </div>

              <button onClick={restart} className="mt-6 flex items-center gap-1.5 text-[10px] mx-auto" style={{ color: 'var(--text-muted)' }}>
                <RotateCcw size={10} /> Start over
              </button>
            </motion.div>
          )}

          {/* ─── ENDING PHASE ─── */}
          {phase === 'ending' && chapter && (
            <motion.div key="ending" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6 }}>
              {/* Origin Result */}
              <div className="text-center mb-8">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3, type: 'spring' }}
                  className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center"
                  style={{ background: `${chapter.origin?.color || '#818CF8'}12`, border: `2px solid ${chapter.origin?.color || '#818CF8'}25`, boxShadow: `0 0 40px ${chapter.origin?.color || '#818CF8'}15` }}>
                  <Star size={32} style={{ color: chapter.origin?.color || '#818CF8' }} />
                </motion.div>
                <p className="text-[9px] uppercase tracking-widest mb-1" style={{ color: chapter.origin?.color || '#818CF8' }}>Your Starseed Origin</p>
                <h2 className="text-3xl font-light mb-1" style={{ color: 'var(--text-primary)', fontFamily: 'Cormorant Garamond, serif' }}>
                  {chapter.origin?.name}
                </h2>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{chapter.origin?.desc}</p>
              </div>

              {/* Chapter Narration */}
              <div className="p-5 rounded-2xl mb-4" style={{ background: `${chapter.origin?.color || '#818CF8'}04`, border: `1px solid ${chapter.origin?.color || '#818CF8'}10` }}>
                <h3 className="text-sm font-medium mb-2" style={{ color: 'var(--text-primary)', fontFamily: 'Cormorant Garamond, serif' }}>{chapter.title}</h3>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)', lineHeight: 1.8 }}>{chapter.narration}</p>
              </div>

              {/* Gift & Frequency */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="p-3 rounded-xl" style={{ background: 'rgba(192,132,252,0.04)', border: '1px solid rgba(192,132,252,0.1)' }}>
                  <p className="text-[9px] uppercase tracking-widest mb-1" style={{ color: '#C084FC' }}>Your Gift</p>
                  <p className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>{chapter.gift}</p>
                </div>
                <button onClick={playEndingFrequency}
                  className="p-3 rounded-xl text-left transition-all hover:scale-[1.02]"
                  style={{
                    background: activeFreqs.has(chapter.frequency) ? `${chapter.origin?.color || '#818CF8'}10` : 'rgba(129,140,248,0.04)',
                    border: `1px solid ${activeFreqs.has(chapter.frequency) ? `${chapter.origin?.color || '#818CF8'}20` : 'rgba(129,140,248,0.1)'}`,
                  }}
                  data-testid="ending-play-freq"
                >
                  <p className="text-[9px] uppercase tracking-widest mb-1" style={{ color: '#818CF8' }}>Soul Frequency</p>
                  <div className="flex items-center gap-1.5">
                    {activeFreqs.has(chapter.frequency)
                      ? <Volume2 size={12} className="animate-pulse" style={{ color: chapter.origin?.color }} />
                      : <Play size={12} style={{ color: '#818CF8' }} />}
                    <span className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>{chapter.frequency} Hz</span>
                  </div>
                </button>
              </div>

              {/* Traits */}
              <div className="flex flex-wrap gap-1.5 mb-6 justify-center">
                {(chapter.origin?.traits || []).map(t => (
                  <span key={t} className="text-[9px] px-2.5 py-1 rounded-full"
                    style={{ background: `${chapter.origin?.color}08`, color: `${chapter.origin?.color}CC`, border: `1px solid ${chapter.origin?.color}15` }}>{t}</span>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="space-y-2.5">
                <button onClick={saveJourney}
                  className="w-full py-3 rounded-xl text-xs font-medium flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
                  style={{ background: `${chapter.origin?.color || '#818CF8'}10`, border: `1px solid ${chapter.origin?.color || '#818CF8'}20`, color: chapter.origin?.color || '#818CF8' }}
                  data-testid="save-journey-btn">
                  <Trophy size={14} /> Save My Origin
                </button>
                <button onClick={restart}
                  className="w-full py-3 rounded-xl text-xs flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
                  style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', color: 'var(--text-muted)' }}
                  data-testid="restart-journey-btn">
                  <RotateCcw size={14} /> Journey Again
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        )}
      </div>
    </div>
  );
}
