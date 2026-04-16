import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';
import { useSensory } from '../context/SensoryContext';
import {
  ArrowLeft, Sparkles, Star, Loader2, RotateCcw, Download,
  Eye, Check, ChevronLeft, ChevronRight, Gem, Shield, Heart, User
} from 'lucide-react';
import {
  EvolutionBar, OptionCard, AvatarPreviewPanel,
} from '../components/starseed';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const STEP_ICONS = [Star, Gem, Shield, Heart, Eye, Sparkles];

/* Background Canvas */
function CosmicBg({ reduceParticles }) {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || reduceParticles) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.offsetWidth; const H = canvas.offsetHeight;
    canvas.width = W; canvas.height = H;
    const stars = Array.from({ length: 60 }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      r: Math.random() * 1.2 + 0.2, speed: Math.random() * 0.3 + 0.1,
    }));
    let frame;
    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      stars.forEach(s => {
        s.y += s.speed;
        if (s.y > H) { s.y = 0; s.x = Math.random() * W; }
        ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(192,132,252,${0.1 + Math.random() * 0.15})`; ctx.fill();
      });
      frame = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(frame);
  }, [reduceParticles]);
  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none opacity-40" />;
}

export default function SpiritualAvatarCreator() {
  const { user, authHeaders, loading: authLoading } = useAuth();
  const { reduceParticles } = useSensory();
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [stages, setStages] = useState([]);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [currentStep, setCurrentStep] = useState(0);
  const [selections, setSelections] = useState({});
  const [customNotes, setCustomNotes] = useState('');
  const [generatedAvatar, setGeneratedAvatar] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [savedAvatar, setSavedAvatar] = useState(null);

  useEffect(() => {
    if (!authHeaders?.Authorization) return;
    const load = async () => {
      try {
        const [catalogRes, avatarRes] = await Promise.all([
          axios.get(`${API}/starseed/avatar-builder/catalog`, { headers: authHeaders }),
          axios.get(`${API}/starseed/avatar-builder/my-avatar`, { headers: authHeaders }),
        ]);
        setCategories(catalogRes.data.categories);
        setStages(catalogRes.data.evolution_stages);
        setCurrentLevel(catalogRes.data.current_level);
        if (avatarRes.data.avatar) {
          setSavedAvatar(avatarRes.data.avatar);
          if (avatarRes.data.avatar.selections) setSelections(avatarRes.data.avatar.selections);
          if (avatarRes.data.avatar.avatar_base64) setGeneratedAvatar(avatarRes.data.avatar.avatar_base64);
          if (avatarRes.data.avatar.custom_notes) setCustomNotes(avatarRes.data.avatar.custom_notes);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [authHeaders]);

  const currentCategory = categories[currentStep];

  const handleSelect = useCallback((optionId) => {
    if (!currentCategory) return;
    const isMulti = currentCategory.multi_select;
    const maxSel = currentCategory.max_selections || 99;
    setSelections(prev => {
      if (isMulti) {
        const current = prev[currentCategory.id] || [];
        if (current.includes(optionId)) return { ...prev, [currentCategory.id]: current.filter(id => id !== optionId) };
        if (current.length >= maxSel) { toast.error(`Maximum ${maxSel} selections for ${currentCategory.name}`); return prev; }
        return { ...prev, [currentCategory.id]: [...current, optionId] };
      }
      return { ...prev, [currentCategory.id]: prev[currentCategory.id] === optionId ? null : optionId };
    });
  }, [currentCategory]);

  const generateAvatar = useCallback(async () => {
    if (generating) return;
    if (!selections.base_form) { toast.error('Please select a base form first'); return; }
    setGenerating(true);
    try {
      const res = await axios.post(`${API}/starseed/avatar-builder/generate`, {
        selections, custom_notes: customNotes.trim(),
      }, { headers: authHeaders });
      if (res.data.avatar_base64) {
        setGeneratedAvatar(res.data.avatar_base64);
        toast.success('Your spiritual avatar has been manifested!');
      }
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Generation failed. Try again.');
    } finally {
      setGenerating(false);
    }
  }, [selections, customNotes, authHeaders, generating]);

  const resetSelections = () => { setSelections({}); setGeneratedAvatar(null); setCustomNotes(''); setCurrentStep(0); };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
        <Loader2 className="animate-spin" size={24} style={{ color: '#C084FC' }} />
      </div>
    );
  }

  if (!user) { navigate('/'); return null; }

  const totalSteps = categories.length;
  const hasSelections = Object.values(selections).some(v => v && (Array.isArray(v) ? v.length > 0 : true));

  return (
    <div className="min-h-screen pb-24 relative" style={{ background: 'var(--bg-primary)' }}>
      <CosmicBg reduceParticles={reduceParticles} />

      {/* Header */}
      <div className="sticky top-0 z-30 px-4 py-3 flex items-center gap-3"
        style={{ background: 'rgba(10,10,15,0.88)', backdropFilter: 'none', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
        <button onClick={() => navigate(-1)} className="p-2 rounded-xl transition-all hover:scale-105"
          style={{ background: 'rgba(255,255,255,0.04)' }} data-testid="avatar-builder-back">
          <ArrowLeft size={16} style={{ color: 'var(--text-secondary)' }} />
        </button>
        <div className="flex-1">
          <h1 className="text-base font-light" style={{ fontFamily: 'Cormorant Garamond, serif', color: 'var(--text-primary)' }}>
            Spiritual Avatar Creator
          </h1>
          <p className="text-[9px] uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
            Design Your Cosmic Being
          </p>
        </div>
        <button onClick={resetSelections} className="p-2 rounded-xl transition-all hover:scale-105"
          style={{ background: 'rgba(255,255,255,0.04)' }} data-testid="avatar-reset">
          <RotateCcw size={14} style={{ color: 'var(--text-muted)' }} />
        </button>
        <button onClick={() => navigate('/avatar-gallery')}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-medium transition-all hover:scale-105"
          style={{ background: 'rgba(252,211,77,0.08)', border: '1px solid rgba(252,211,77,0.15)', color: '#FCD34D' }}
          data-testid="gallery-link">
          <Eye size={11} /> Gallery
        </button>
      </div>

      <div className="max-w-3xl mx-auto px-4 pt-6 relative z-10">
        <div className="mb-6">
          <EvolutionBar stages={stages} currentLevel={currentLevel} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {/* Step Navigation */}
            <div className="flex items-center gap-1.5 mb-5 overflow-x-auto pb-2 scrollbar-hide">
              {categories.map((cat, i) => {
                const StepIcon = STEP_ICONS[i] || Star;
                const hasSelection = selections[cat.id] && (Array.isArray(selections[cat.id]) ? selections[cat.id].length > 0 : true);
                const isActive = i === currentStep;
                return (
                  <button key={cat.id} onClick={() => setCurrentStep(i)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all whitespace-nowrap flex-shrink-0"
                    style={{
                      background: isActive ? 'rgba(192,132,252,0.12)' : hasSelection ? 'rgba(74,222,128,0.06)' : 'rgba(255,255,255,0.03)',
                      color: isActive ? '#C084FC' : hasSelection ? '#4ADE80' : 'var(--text-muted)',
                      border: `1px solid ${isActive ? 'rgba(192,132,252,0.2)' : hasSelection ? 'rgba(74,222,128,0.1)' : 'rgba(255,255,255,0.05)'}`,
                    }}
                    data-testid={`step-${cat.id}`}>
                    {hasSelection ? <Check size={10} /> : <StepIcon size={10} />}
                    {cat.name}
                  </button>
                );
              })}
            </div>

            {/* Category Content */}
            <AnimatePresence mode="wait">
              {currentCategory && (
                <motion.div key={currentCategory.id}
                  initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-lg font-light" style={{ fontFamily: 'Cormorant Garamond, serif', color: 'var(--text-primary)' }}>
                        {currentCategory.name}
                      </h2>
                      <p className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>
                        {currentCategory.description}
                        {currentCategory.multi_select && (
                          <span style={{ color: '#C084FC' }}> (Select up to {currentCategory.max_selections})</span>
                        )}
                      </p>
                    </div>
                    <span className="text-[9px] px-2 py-1 rounded-full"
                      style={{ background: 'rgba(192,132,252,0.08)', color: '#C084FC' }}>
                      Step {currentStep + 1}/{totalSteps}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-6">
                    {currentCategory.options.map((option, i) => (
                      <motion.div key={option.id}
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.03 }}>
                        <OptionCard option={option}
                          selected={selections[currentCategory.id]}
                          onToggle={handleSelect}
                          multiSelect={currentCategory.multi_select} />
                      </motion.div>
                    ))}
                  </div>
                  <div className="flex items-center justify-between">
                    <button onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                      disabled={currentStep === 0}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs transition-all hover:scale-105"
                      style={{ background: 'rgba(255,255,255,0.04)', color: 'var(--text-secondary)', opacity: currentStep === 0 ? 0.3 : 1 }}
                      data-testid="prev-step">
                      <ChevronLeft size={14} /> Previous
                    </button>
                    {currentStep < totalSteps - 1 ? (
                      <button onClick={() => setCurrentStep(currentStep + 1)}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium transition-all hover:scale-105"
                        style={{ background: 'rgba(192,132,252,0.1)', border: '1px solid rgba(192,132,252,0.2)', color: '#C084FC' }}
                        data-testid="next-step">
                        Next <ChevronRight size={14} />
                      </button>
                    ) : (
                      <div />
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Custom Notes & Generate */}
            <div className="mt-6 pt-6" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
              <p className="text-[9px] font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>
                Custom Description (Optional)
              </p>
              <textarea value={customNotes} onChange={e => setCustomNotes(e.target.value)}
                placeholder="Add any extra details about your avatar's appearance, personality, or energy..."
                maxLength={500}
                className="w-full px-4 py-3 rounded-xl text-xs mb-4 resize-none"
                rows={3}
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-primary)', outline: 'none' }}
                data-testid="custom-notes" />
              <motion.button
                whileHover={!generating && hasSelections ? { scale: 1.02 } : {}}
                whileTap={!generating && hasSelections ? { scale: 0.98 } : {}}
                animate={hasSelections && !generating ? {
                  boxShadow: ['0 0 20px rgba(192,132,252,0.08)', '0 0 40px rgba(192,132,252,0.15)', '0 0 20px rgba(192,132,252,0.08)']
                } : {}}
                transition={{ duration: 2.5, repeat: Infinity }}
                onClick={generateAvatar}
                disabled={generating || !hasSelections}
                className="w-full py-4 rounded-xl text-sm font-medium flex items-center justify-center gap-2.5 transition-all relative overflow-hidden"
                style={{
                  background: hasSelections
                    ? 'linear-gradient(135deg, rgba(192,132,252,0.15), rgba(129,140,248,0.15))'
                    : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${hasSelections ? 'rgba(192,132,252,0.25)' : 'rgba(255,255,255,0.06)'}`,
                  color: hasSelections ? '#C084FC' : 'var(--text-muted)',
                  opacity: generating ? 0.5 : 1,
                }}
                data-testid="generate-avatar-btn">
                {hasSelections && !generating && (
                  <motion.div className="absolute inset-0 opacity-30"
                    animate={{ x: ['-100%', '200%'] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', repeatDelay: 2 }}
                    style={{ background: 'linear-gradient(90deg, transparent, rgba(192,132,252,0.15), transparent)', width: '50%' }} />
                )}
                {generating ? (
                  <><Loader2 size={16} className="animate-spin" /> Manifesting Your Avatar...</>
                ) : (
                  <><Sparkles size={16} /> Manifest Spiritual Avatar</>
                )}
              </motion.button>
            </div>
          </div>

          {/* Preview Panel */}
          <div className="lg:col-span-1">
            <div className="sticky top-20">
              <AvatarPreviewPanel selections={selections} categories={categories}
                generatedAvatar={generatedAvatar} generating={generating} />
              {generatedAvatar && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  className="mt-3 flex items-center gap-2">
                  <button onClick={generateAvatar} disabled={generating}
                    className="flex-1 py-2 rounded-xl text-[10px] font-medium flex items-center justify-center gap-1.5 transition-all hover:scale-105"
                    style={{ background: 'rgba(192,132,252,0.1)', border: '1px solid rgba(192,132,252,0.2)', color: '#C084FC' }}
                    data-testid="regenerate-btn">
                    <RotateCcw size={10} /> Regenerate
                  </button>
                  <button
                    className="flex-1 py-2 rounded-xl text-[10px] font-medium flex items-center justify-center gap-1.5 transition-all hover:scale-105"
                    style={{ background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.2)', color: '#4ADE80' }}
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = `data:image/png;base64,${generatedAvatar}`;
                      link.download = 'spiritual-avatar.png';
                      link.click();
                      toast.success('Avatar downloaded!');
                    }}
                    data-testid="download-avatar">
                    <Download size={10} /> Download
                  </button>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
