import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { RefreshCw, Sparkles, Copy, Check, Wand2, Save, Trash2, Play, Loader2, ChevronRight, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';
import NarrationPlayer from '../components/NarrationPlayer';
import { ProximityItem } from '../components/SpatialRoom';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const THEMES = [
  { name: 'Inner Peace', value: 'inner peace and tranquility' },
  { name: 'Abundance', value: 'abundance and prosperity' },
  { name: 'Self Love', value: 'self love and acceptance' },
  { name: 'Courage', value: 'courage and strength' },
  { name: 'Gratitude', value: 'gratitude and appreciation' },
  { name: 'Healing', value: 'healing and restoration' },
  { name: 'Consciousness', value: 'expanded consciousness and enlightenment' },
  { name: 'Energy', value: 'vital energy and life force' },
];

const BUILD_COLORS = ['#FCD34D', '#D8B4FE', '#2DD4BF', '#FDA4AF', '#86EFAC', '#FB923C', '#3B82F6', '#E879F9'];

function BuildYourOwn() {
  const { user, authHeaders } = useAuth();
  const [step, setStep] = useState(1);
  const [goal, setGoal] = useState('');
  const [name, setName] = useState('');
  const [color, setColor] = useState('#FCD34D');
  const [generatedAffirmations, setGeneratedAffirmations] = useState([]);
  const [generating, setGenerating] = useState(false);
  const [editIdx, setEditIdx] = useState(null);
  const [editText, setEditText] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState([]);
  const [viewingSet, setViewingSet] = useState(null);
  const [currentAffIdx, setCurrentAffIdx] = useState(0);

  const loadSaved = useCallback(async () => {
    if (!user) return;
    try {
      const res = await axios.get(`${API}/affirmations/my-sets`, { headers: authHeaders });
      setSaved(res.data);
    } catch {}
  }, [user, authHeaders]);

  useEffect(() => { if (typeof window.__workAccrue === 'function') window.__workAccrue('affirmations', 8); }, []);
  useEffect(() => { loadSaved(); }, [loadSaved]);

  const generate = async () => {
    if (!goal.trim()) { toast.error('Please describe your goal or intention'); return; }
    setGenerating(true);
    setStep(2);
    try {
      const res = await axios.post(`${API}/affirmations/generate-set`, { goal: goal.trim(), count: 7 }, { headers: authHeaders });
      setGeneratedAffirmations(res.data.affirmations);
      setStep(3);
    } catch {
      toast.error('Could not generate affirmations. Please try again.');
      setStep(1);
    } finally { setGenerating(false); }
  };

  const saveSet = async () => {
    setSaving(true);
    try {
      const res = await axios.post(`${API}/affirmations/save-set`, {
        name: name || `${goal.substring(0, 40)} affirmations`,
        goal, affirmations: generatedAffirmations, color,
      }, { headers: authHeaders });
      setSaved(prev => [res.data, ...prev]);
      toast.success('Affirmation set saved!');
      setStep(1); setGoal(''); setName(''); setGeneratedAffirmations([]);
    } catch { toast.error('Could not save'); }
    setSaving(false);
  };

  const deleteSet = async (id) => {
    try {
      await axios.delete(`${API}/affirmations/set/${id}`, { headers: authHeaders });
      setSaved(prev => prev.filter(s => s.id !== id));
      if (viewingSet?.id === id) setViewingSet(null);
      toast.success('Deleted');
    } catch {}
  };

  const startEdit = (i) => { setEditIdx(i); setEditText(generatedAffirmations[i]); };
  const saveEdit = () => {
    if (editIdx === null) return;
    setGeneratedAffirmations(prev => prev.map((a, i) => i === editIdx ? editText : a));
    setEditIdx(null);
  };

  if (!user) return (
    <div className="p-12 text-center">
      <Wand2 size={32} style={{ color: 'rgba(252,211,77,0.3)', margin: '0 auto 12px' }} />
      <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Sign in to create personalized affirmation sets with AI.</p>
    </div>
  );

  // Viewing a saved set
  if (viewingSet) {
    const aff = viewingSet.affirmations[currentAffIdx];
    return (
      <div className="space-y-8">
        <button onClick={() => { setViewingSet(null); setCurrentAffIdx(0); }}
          className="text-xs flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
          <ArrowLeft size={14} /> Back to sets
        </button>
        <div className="p-10 md:p-16 text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-10"
            style={{ background: `radial-gradient(circle at 50% 50%, ${viewingSet.color || '#FCD34D'} 0%, transparent 60%)` }} />
          <p className="text-xs font-bold uppercase tracking-[0.2em] mb-6 relative z-10" style={{ color: viewingSet.color || '#FCD34D' }}>
            {viewingSet.name} — {currentAffIdx + 1} of {viewingSet.affirmations.length}
          </p>
          <AnimatePresence mode="wait">
            <motion.p key={currentAffIdx}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="text-2xl md:text-3xl font-light leading-relaxed mb-8 relative z-10"
              style={{ fontFamily: 'Cormorant Garamond, serif', color: 'var(--text-primary)' }}
              data-testid="viewing-affirmation-text">
              {aff}
            </motion.p>
          </AnimatePresence>
          <div className="flex items-center justify-center gap-3 relative z-10 flex-wrap">
            <button onClick={() => setCurrentAffIdx(prev => Math.max(0, prev - 1))}
              disabled={currentAffIdx === 0}
              className="btn-glass px-4 py-2 text-sm" style={{ opacity: currentAffIdx === 0 ? 0.3 : 1 }}
              data-testid="viewing-prev-btn">
              Previous
            </button>
            <button onClick={() => setCurrentAffIdx(prev => Math.min(viewingSet.affirmations.length - 1, prev + 1))}
              disabled={currentAffIdx === viewingSet.affirmations.length - 1}
              className="btn-glass px-4 py-2 text-sm" style={{ opacity: currentAffIdx === viewingSet.affirmations.length - 1 ? 0.3 : 1 }}
              data-testid="viewing-next-btn">
              Next
            </button>
            <NarrationPlayer text={aff} label="Speak" color={viewingSet.color || '#FCD34D'} context="affirmations" />
          </div>
          {/* Progress dots */}
          <div className="flex justify-center gap-1.5 mt-6 relative z-10">
            {viewingSet.affirmations.map((_, i) => (
              <button key={i} onClick={() => setCurrentAffIdx(i)}
                className="w-2 h-2 rounded-full transition-all"
                style={{
                  background: i === currentAffIdx ? (viewingSet.color || '#FCD34D') : 'rgba(255,255,255,0.1)',
                  boxShadow: i === currentAffIdx ? `0 0 6px ${viewingSet.color || '#FCD34D'}` : 'none',
                }} />
            ))}
          </div>
        </div>
        {/* Full list */}
        <div className="space-y-2">
          {viewingSet.affirmations.map((a, i) => (
            <div key={i} className="p-4 flex items-start gap-3 cursor-pointer" onClick={() => setCurrentAffIdx(i)}
              style={{ borderColor: i === currentAffIdx ? `${viewingSet.color || '#FCD34D'}30` : 'rgba(255,255,255,0.06)' }}>
              <span className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-bold"
                style={{ background: `${viewingSet.color || '#FCD34D'}15`, color: viewingSet.color || '#FCD34D' }}>
                {i + 1}
              </span>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{a}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Saved Sets */}
      {saved.length > 0 && step === 1 && (
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] mb-4" style={{ color: 'var(--text-muted)' }}>Your Affirmation Sets</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {saved.map((s, i) => (
              <motion.div key={s.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                className="p-5 group" data-testid={`saved-affirmation-set-${s.id}`}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{s.name}</h4>
                    <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{s.affirmations?.length || 0} affirmations</p>
                  </div>
                  <button onClick={() => deleteSet(s.id)} className="opacity-0 group-hover:opacity-100 transition-opacity p-1"
                    data-testid={`delete-affirmation-set-${s.id}`}>
                    <Trash2 size={14} style={{ color: 'var(--text-muted)' }} />
                  </button>
                </div>
                <p className="text-xs line-clamp-2 mb-3" style={{ color: 'var(--text-secondary)' }}>{s.goal}</p>
                <button onClick={() => { setViewingSet(s); setCurrentAffIdx(0); }}
                  className="w-full py-2 rounded-xl text-xs font-medium flex items-center justify-center gap-2 transition-all"
                  style={{ background: `${s.color || '#FCD34D'}12`, color: s.color || '#FCD34D', border: `1px solid ${s.color || '#FCD34D'}25` }}
                  data-testid={`view-affirmation-set-${s.id}`}>
                  <Play size={12} fill={s.color || '#FCD34D'} /> View & Practice
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Builder */}
      <div className="p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 rounded-full" style={{
          background: `radial-gradient(circle, ${color}08 0%, transparent 70%)`, filter: 'blur(30px)',
        }} />

        {/* Step indicator */}
        <div className="flex items-center gap-3 mb-8 relative z-10">
          {[1, 2, 3].map(s => (
            <div key={s} className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-medium transition-all"
                style={{
                  background: step >= s ? `${color}20` : 'rgba(255,255,255,0.03)',
                  color: step >= s ? color : 'var(--text-muted)',
                  border: `1px solid ${step >= s ? `${color}40` : 'rgba(255,255,255,0.06)'}`,
                }}>
                {s}
              </div>
              {s < 3 && <div className="w-8 h-px" style={{ background: step > s ? `${color}30` : 'rgba(255,255,255,0.06)' }} />}
            </div>
          ))}
          <span className="text-xs ml-2" style={{ color: 'var(--text-muted)' }}>
            {step === 1 && 'Set Your Goal'}{step === 2 && 'Generating...'}{step === 3 && 'Review & Save'}
          </span>
        </div>

        {/* Step 1: Goal */}
        {step === 1 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 relative z-10">
            <div>
              <label className="text-xs font-semibold uppercase tracking-widest block mb-3" style={{ color: 'var(--text-muted)' }}>
                What do you want to affirm?
              </label>
              <textarea
                value={goal}
                onChange={e => setGoal(e.target.value)}
                placeholder="I want to feel more confident at work... / I'm healing from heartbreak and need self-love... / I want to attract abundance into my life..."
                className="input-glass w-full h-28 resize-none text-sm leading-relaxed"
                data-testid="build-affirmation-goal"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-widest block mb-3" style={{ color: 'var(--text-muted)' }}>
                Set Name (optional)
              </label>
              <input value={name} onChange={e => setName(e.target.value)}
                placeholder="My Morning Power Words"
                className="input-glass w-full text-sm" data-testid="build-affirmation-name" />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-widest block mb-3" style={{ color: 'var(--text-muted)' }}>Theme Color</label>
              <div className="flex gap-2">
                {BUILD_COLORS.map(c => (
                  <button key={c} onClick={() => setColor(c)}
                    className="w-8 h-8 rounded-full transition-all"
                    style={{
                      background: c, border: color === c ? '2px solid #fff' : '2px solid transparent',
                      boxShadow: color === c ? `0 0 12px ${c}60` : 'none',
                      transform: color === c ? 'scale(1.15)' : 'scale(1)',
                    }}
                    data-testid={`build-affirmation-color-${c}`} />
                ))}
              </div>
            </div>
            <div className="flex justify-end">
              <button onClick={generate}
                className="btn-glass px-6 py-2.5 text-sm flex items-center gap-2"
                style={{ background: `${color}12`, borderColor: `${color}30`, color }}
                data-testid="build-affirmation-generate">
                <Wand2 size={14} /> Generate My Affirmations
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 2: Generating */}
        {step === 2 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-16 text-center relative z-10">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              className="w-12 h-12 mx-auto mb-6 rounded-full"
              style={{ border: `2px solid ${color}30`, borderTopColor: color }} />
            <p className="text-base" style={{ fontFamily: 'Cormorant Garamond, serif', color: 'var(--text-secondary)' }}>
              Channeling your affirmations...
            </p>
          </motion.div>
        )}

        {/* Step 3: Review */}
        {step === 3 && generatedAffirmations.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 relative z-10">
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              {generatedAffirmations.length} affirmations generated. Tap any to edit.
            </p>
            <div className="space-y-2 max-h-96 overflow-y-auto pr-2" data-testid="build-affirmation-list">
              {generatedAffirmations.map((a, i) => (
                <div key={i} className="p-4 rounded-xl transition-all cursor-pointer group"
                  style={{ background: editIdx === i ? `${color}08` : 'rgba(255,255,255,0.02)', border: `1px solid ${editIdx === i ? `${color}20` : 'rgba(255,255,255,0.04)'}` }}
                  onClick={() => editIdx !== i && startEdit(i)}
                  data-testid={`build-affirmation-item-${i}`}>
                  <div className="flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-bold mt-0.5"
                      style={{ background: `${color}15`, color }}>
                      {i + 1}
                    </span>
                    {editIdx === i ? (
                      <div className="flex-1">
                        <textarea value={editText} onChange={e => setEditText(e.target.value)}
                          className="input-glass w-full text-sm h-16 resize-none" autoFocus
                          data-testid={`build-affirmation-edit-${i}`} />
                        <div className="flex gap-2 mt-2">
                          <button onClick={saveEdit} className="text-xs px-3 py-1 rounded-full"
                            style={{ background: `${color}15`, color }}>Save</button>
                          <button onClick={() => setEditIdx(null)} className="text-xs px-3 py-1 rounded-full"
                            style={{ color: 'var(--text-muted)' }}>Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm leading-relaxed flex-1" style={{ color: 'var(--text-secondary)' }}>
                        {a}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-3 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <button onClick={() => { setStep(1); setGeneratedAffirmations([]); }}
                className="text-xs flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
                <ArrowLeft size={14} /> Start Over
              </button>
              <button onClick={generate}
                className="text-xs flex items-center gap-1 px-3 py-1.5 rounded-full"
                style={{ background: 'rgba(255,255,255,0.04)', color: 'var(--text-muted)' }}
                data-testid="build-affirmation-regenerate">
                <RefreshCw size={12} /> Regenerate
              </button>
              <div className="ml-auto">
                <button onClick={saveSet} disabled={saving}
                  className="btn-glass px-5 py-2 text-sm flex items-center gap-2"
                  style={{ background: `${color}15`, borderColor: `${color}30`, color }}
                  data-testid="build-affirmation-save">
                  {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                  Save Affirmation Set
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default function Affirmations() {
  const [mode, setMode] = useState('daily');
  const [daily, setDaily] = useState(null);
  const [generated, setGenerated] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState(THEMES[0]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    axios.get(`${API}/affirmations/daily`)
      .then(res => setDaily(res.data))
      .catch(() => {});
  }, []);

  const generateSingle = async () => {
    setLoading(true);
    try {
      const res = await axios.post(`${API}/affirmations/generate`, { theme: selectedTheme.value });
      setGenerated(res.data);
    } catch {
      toast.error('Could not generate affirmation');
    } finally {
      setLoading(false);
    }
  };

  const copyText = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Copied to your heart');
    setTimeout(() => setCopied(false), 2000);
  };

  const displayText = generated?.text || daily?.text || '';

  return (
    <div className="min-h-screen pt-20 pb-24 px-5 max-w-3xl mx-auto" style={{ background: 'transparent' }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-2 mb-1">
          <Sparkles size={14} style={{ color: '#FCD34D' }} />
          <p className="text-[10px] font-bold uppercase tracking-[0.3em]" style={{ color: '#FCD34D' }}>Affirmations</p>
        </div>
        <h1 className="text-3xl font-light mb-2" style={{ fontFamily: 'Cormorant Garamond, serif', color: '#fff' }}>
          Words of Power
        </h1>

        

        <p className="text-sm mb-6" style={{ color: 'rgba(255,255,255,0.6)' }}>
          Let these words resonate through every cell of your being.
        </p>

        {/* Mode Toggle */}
        <div className="flex gap-2 mb-8 flex-wrap" data-testid="affirmation-mode-toggle">
          {[
            { id: 'daily', label: 'Daily Affirmation' },
            { id: 'build', label: 'Build Your Own Set' },
          ].map(m => (
            <button key={m.id} onClick={() => setMode(m.id)}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-xs transition-all"
              style={{
                background: mode === m.id ? 'rgba(252,211,77,0.12)' : 'rgba(255,255,255,0.03)',
                color: mode === m.id ? '#FCD34D' : 'rgba(255,255,255,0.5)',
                border: `1px solid ${mode === m.id ? 'rgba(252,211,77,0.3)' : 'rgba(255,255,255,0.06)'}`,
              }}
              data-testid={`affirmation-mode-${m.id}`}>
              {m.id === 'build' && <Wand2 size={14} />} {m.label}
            </button>
          ))}
        </div>

        {mode === 'build' ? (
          <BuildYourOwn />
        ) : (
          <>
            {/* Main Affirmation Display */}
            <ProximityItem index={0} totalItems={3}>
              <div className="py-10 text-center mb-8 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10"
                  style={{ background: 'radial-gradient(circle at 30% 50%, #C084FC 0%, transparent 50%), radial-gradient(circle at 70% 50%, #2DD4BF 0%, transparent 50%)' }}
                />
                <div className="relative z-10">
                  <AnimatePresence mode="wait">
                    <motion.p
                      key={displayText}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="text-2xl md:text-3xl font-light leading-relaxed mb-6"
                      style={{ fontFamily: 'Cormorant Garamond, serif', color: '#fff' }}
                      data-testid="affirmation-text"
                    >
                      {displayText || 'Loading your daily wisdom...'}
                    </motion.p>
                  </AnimatePresence>
                  {displayText && (
                    <div className="flex items-center justify-center gap-3 flex-wrap">
                      <button
                        onClick={() => copyText(displayText)}
                        className="px-4 py-2 rounded-xl text-xs inline-flex items-center gap-2"
                        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.7)' }}
                        data-testid="copy-affirmation-btn"
                      >
                        {copied ? <Check size={12} /> : <Copy size={12} />}
                        {copied ? 'Copied' : 'Copy'}
                      </button>
                      <NarrationPlayer text={displayText} label="Speak Affirmation" color="#FCD34D" context="affirmations" />
                    </div>
                  )}
                </div>
              </div>
            </ProximityItem>

            {/* Theme Selection */}
            <ProximityItem index={1} totalItems={3}>
              <div className="mb-6">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-3" style={{ color: 'rgba(255,255,255,0.5)' }}>Choose a Theme</p>
                <div className="flex flex-wrap gap-2">
                  {THEMES.map(t => (
                    <button
                      key={t.name}
                      onClick={() => setSelectedTheme(t)}
                      className="px-3 py-2 rounded-full text-xs"
                      style={{
                        background: selectedTheme.name === t.name ? 'rgba(252,211,77,0.1)' : 'rgba(255,255,255,0.03)',
                        border: `1px solid ${selectedTheme.name === t.name ? 'rgba(252,211,77,0.3)' : 'rgba(255,255,255,0.06)'}`,
                        color: selectedTheme.name === t.name ? '#FCD34D' : 'rgba(255,255,255,0.5)',
                      }}
                      data-testid={`theme-${t.name.toLowerCase().replace(/\s+/g, '-')}`}
                    >
                      {t.name}
                    </button>
                  ))}
                </div>
              </div>
            </ProximityItem>

            {/* AI Generation */}
            <ProximityItem index={2} totalItems={3}>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-3" style={{ color: 'rgba(255,255,255,0.5)' }}>AI-Powered Generation</p>
                <p className="text-sm mb-4" style={{ color: 'rgba(255,255,255,0.6)' }}>
                  Let artificial intelligence channel cosmic wisdom tailored to your chosen theme.
                </p>
                <button
                  onClick={generateSingle}
                  disabled={loading}
                  className="px-5 py-2.5 rounded-xl text-xs flex items-center gap-2"
                  style={{ background: 'rgba(252,211,77,0.1)', border: '1px solid rgba(252,211,77,0.2)', color: '#FCD34D', opacity: loading ? 0.6 : 1 }}
                  data-testid="generate-affirmation-btn"
                >
                  <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                  {loading ? 'Channeling...' : 'Generate Affirmation'}
                </button>
                {generated && (
                  <p className="text-xs mt-3" style={{ color: 'rgba(255,255,255,0.4)' }}>
                    Theme: {generated.theme} {generated.generated ? '(AI generated)' : '(curated)'}
                  </p>
                )}
              </div>
            </ProximityItem>
          </>
        )}
      </motion.div>
    </div>
  );
}
