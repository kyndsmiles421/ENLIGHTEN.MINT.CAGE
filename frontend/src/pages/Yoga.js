import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Clock, Flame, ChevronRight, Check, Heart, Wind, Sparkles, Star, Moon } from 'lucide-react';
import GuidedExperience from '../components/GuidedExperience';
import NarrationPlayer from '../components/NarrationPlayer';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const STYLE_ICONS = { hatha: Star, vinyasa: Flame, kundalini: Sparkles, yin: Moon, restorative: Heart, pranayama: Wind, nidra: Moon };

function StyleCard({ style, onClick }) {
  const Icon = STYLE_ICONS[style.id] || Star;
  return (
    <motion.button
      whileHover={{ y: -4 }}
      onClick={onClick}
      className="glass-card glass-card-hover p-6 text-left w-full"
      data-testid={`yoga-style-${style.id}`}
    >
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: `${style.color}12`, border: `1px solid ${style.color}15` }}>
          <Icon size={22} style={{ color: style.color }} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-medium mb-0.5" style={{ color: 'var(--text-primary)' }}>{style.name}</h3>
          <p className="text-xs mb-2" style={{ color: style.color }}>{style.subtitle}</p>
          <p className="text-xs leading-relaxed line-clamp-2" style={{ color: 'var(--text-muted)' }}>{style.desc}</p>
          <div className="flex gap-3 mt-3 flex-wrap">
            <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: 'rgba(255,255,255,0.03)', color: 'var(--text-muted)' }}>
              <Clock size={8} className="inline mr-1" /> {style.duration_range}
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full capitalize" style={{ background: `${style.color}08`, color: style.color }}>
              {style.difficulty}
            </span>
          </div>
        </div>
        <ChevronRight size={16} style={{ color: 'var(--text-muted)' }} className="flex-shrink-0 mt-1" />
      </div>
    </motion.button>
  );
}

function SequenceView({ style, sequence, onBack, authHeaders }) {
  const [currentPose, setCurrentPose] = useState(null);
  const [completedPoses, setCompletedPoses] = useState(new Set());
  const [sessionComplete, setSessionComplete] = useState(false);

  const markComplete = async () => {
    try {
      await axios.post(`${API}/yoga/complete`, {
        style_id: style.id,
        sequence_id: sequence.id,
        duration: sequence.duration,
      }, { headers: authHeaders });
      setSessionComplete(true);
    } catch {}
  };

  const togglePose = (idx) => {
    setCurrentPose(currentPose === idx ? null : idx);
  };

  const completePose = (idx) => {
    setCompletedPoses(prev => new Set([...prev, idx]));
    if (completedPoses.size + 1 >= sequence.poses.length) {
      markComplete();
    }
  };

  return (
    <div data-testid="yoga-sequence-view">
      <button onClick={onBack} className="flex items-center gap-2 text-xs mb-6 group"
        style={{ color: 'var(--text-muted)' }} data-testid="yoga-back-btn">
        <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> Back to {style.name}
      </button>

      <div className="flex items-center gap-4 mb-6">
        <div className="w-14 h-14 rounded-xl flex items-center justify-center"
          style={{ background: `${style.color}12` }}>
          {React.createElement(STYLE_ICONS[style.id] || Star, { size: 26, style: { color: style.color } })}
        </div>
        <div>
          <h2 className="text-xl font-light" style={{ fontFamily: 'Cormorant Garamond, serif', color: 'var(--text-primary)' }}>
            {sequence.name}
          </h2>
          <div className="flex gap-3 mt-1">
            <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}><Clock size={9} className="inline mr-1" /> {sequence.duration} min</span>
            <span className="text-[10px] capitalize" style={{ color: style.color }}>{sequence.level}</span>
            <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{sequence.poses.length} poses</span>
          </div>
        </div>
      </div>

      {/* Guided Experience */}
      <div className="mb-6">
        <GuidedExperience
          practiceName={`${style.name}: ${sequence.name}`}
          description={style.desc}
          instructions={sequence.poses.map(p => `${p.name}: ${p.instruction}. Breath: ${p.breath}.`)}
          category="yoga"
          color={style.color}
          durationMinutes={sequence.duration}
        />
      </div>

      {/* Progress */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)' }}>
          <div className="h-full rounded-full transition-all duration-500"
            style={{ background: style.color, width: `${(completedPoses.size / sequence.poses.length) * 100}%` }} />
        </div>
        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
          {completedPoses.size}/{sequence.poses.length}
        </span>
      </div>

      {sessionComplete && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6 mb-6 text-center" style={{ borderColor: `${style.color}15` }}>
          <Check size={32} className="mx-auto mb-2" style={{ color: style.color }} />
          <p className="text-lg font-light" style={{ fontFamily: 'Cormorant Garamond, serif' }}>Session Complete</p>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Namaste. Your practice has been recorded.</p>
        </motion.div>
      )}

      {/* Pose List */}
      <div className="space-y-3" data-testid="yoga-pose-list">
        {sequence.poses.map((pose, i) => {
          const isActive = currentPose === i;
          const done = completedPoses.has(i);
          return (
            <motion.div key={i} layout className="glass-card overflow-hidden" style={{ borderColor: done ? `${style.color}20` : 'rgba(255,255,255,0.06)' }}>
              <button onClick={() => togglePose(i)} className="w-full p-4 flex items-center gap-3 text-left"
                data-testid={`yoga-pose-${i}`}>
                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold"
                  style={{ background: done ? `${style.color}15` : 'rgba(255,255,255,0.03)', color: done ? style.color : 'var(--text-muted)' }}>
                  {done ? <Check size={14} /> : i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium" style={{ color: done ? style.color : 'var(--text-primary)' }}>{pose.name}</p>
                  <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                    <Clock size={8} className="inline mr-1" /> {Math.floor(pose.duration / 60)}:{String(pose.duration % 60).padStart(2, '0')} min
                  </p>
                </div>
                <ChevronRight size={14} style={{ color: 'var(--text-muted)', transform: isActive ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }} />
              </button>

              <AnimatePresence>
                {isActive && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 pt-0 border-t" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
                      <p className="text-sm leading-relaxed mt-3 mb-3" style={{ color: 'var(--text-secondary)' }}>{pose.instruction}</p>
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="glass-card p-3">
                          <p className="text-[10px] uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Breath</p>
                          <p className="text-xs mt-1" style={{ color: style.color }}>{pose.breath}</p>
                        </div>
                        <div className="glass-card p-3">
                          <p className="text-[10px] uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Focus</p>
                          <p className="text-xs mt-1" style={{ color: style.color }}>{pose.focus}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <NarrationPlayer
                          text={`${pose.name}. ${pose.instruction}. Breath cue: ${pose.breath}. Focus on ${pose.focus}.`}
                          label="Listen"
                          color={style.color}
                        />
                        {!done && (
                          <button onClick={() => completePose(i)}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium"
                            style={{ background: `${style.color}12`, color: style.color, border: `1px solid ${style.color}20` }}
                            data-testid={`complete-pose-${i}`}>
                            <Check size={11} /> Done
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

function StyleDetail({ style, onBack, authHeaders }) {
  const [sequences, setSequences] = useState(null);
  const [activeSeq, setActiveSeq] = useState(null);
  const Icon = STYLE_ICONS[style.id] || Star;

  useEffect(() => {
    axios.get(`${API}/yoga/style/${style.id}`).then(r => setSequences(r.data.sequences)).catch(() => {});
  }, [style.id]);

  if (activeSeq && sequences) {
    return <SequenceView style={style} sequence={activeSeq} onBack={() => setActiveSeq(null)} authHeaders={authHeaders} />;
  }

  return (
    <div data-testid="yoga-style-detail">
      <button onClick={onBack} className="flex items-center gap-2 text-xs mb-6 group" style={{ color: 'var(--text-muted)' }}>
        <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> All Yoga Styles
      </button>

      <div className="flex items-start gap-5 mb-8">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0"
          style={{ background: `${style.color}12`, border: `1px solid ${style.color}15` }}>
          <Icon size={30} style={{ color: style.color }} />
        </div>
        <div className="flex-1">
          <h2 className="text-2xl font-light mb-1" style={{ fontFamily: 'Cormorant Garamond, serif', color: 'var(--text-primary)' }}>
            {style.name}
          </h2>
          <p className="text-sm italic mb-3" style={{ color: style.color }}>{style.subtitle}</p>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{style.desc}</p>
        </div>
      </div>

      {/* Benefits */}
      <div className="grid grid-cols-2 gap-3 mb-8">
        {style.benefits.map((b, i) => (
          <div key={i} className="glass-card p-4 flex items-start gap-2">
            <Check size={12} style={{ color: style.color }} className="flex-shrink-0 mt-0.5" />
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{b}</p>
          </div>
        ))}
      </div>

      {/* Sequences */}
      <p className="text-xs font-bold uppercase tracking-[0.2em] mb-4" style={{ color: 'var(--text-muted)' }}>Sequences</p>
      <div className="space-y-3">
        {sequences ? sequences.map(seq => (
          <button key={seq.id} onClick={() => setActiveSeq(seq)}
            className="glass-card glass-card-hover p-5 w-full text-left flex items-center gap-4"
            data-testid={`yoga-seq-${seq.id}`}>
            <div className="flex-1">
              <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{seq.name}</p>
              <div className="flex gap-3 mt-1">
                <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}><Clock size={8} className="inline mr-1" /> {seq.duration} min</span>
                <span className="text-[10px] capitalize" style={{ color: style.color }}>{seq.level}</span>
                <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{seq.poses.length} poses</span>
              </div>
            </div>
            <ChevronRight size={14} style={{ color: 'var(--text-muted)' }} />
          </button>
        )) : (
          <p className="text-xs text-center py-8" style={{ color: 'var(--text-muted)' }}>Loading sequences...</p>
        )}
      </div>
    </div>
  );
}

export default function Yoga() {
  const { authHeaders } = useAuth();
  const [styles, setStyles] = useState([]);
  const [activeStyle, setActiveStyle] = useState(null);

  useEffect(() => {
    axios.get(`${API}/yoga/styles`).then(r => setStyles(r.data.styles)).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen px-6 md:px-12 lg:px-24 py-12" style={{ background: 'transparent' }} data-testid="yoga-page">
      <div className="max-w-4xl mx-auto relative z-10">
        <AnimatePresence mode="wait">
          {activeStyle ? (
            <motion.div key={activeStyle.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <StyleDetail style={activeStyle} onBack={() => setActiveStyle(null)} authHeaders={authHeaders} />
            </motion.div>
          ) : (
            <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <p className="text-xs font-bold uppercase tracking-[0.3em] mb-2" style={{ color: '#FB923C' }}>
                  <Star size={14} className="inline mr-2" /> Yoga
                </p>
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-light tracking-tight mb-3" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                  The Path of Union
                </h1>
                <p className="text-base mb-10" style={{ color: 'var(--text-secondary)' }}>
                  Seven paths, one destination. Choose the practice that calls to you — from dynamic Vinyasa flows to the deep stillness of Yoga Nidra.
                </p>
              </motion.div>

              <div className="space-y-4">
                {styles.map((style, i) => (
                  <motion.div key={style.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                    <StyleCard style={style} onClick={() => setActiveStyle(style)} />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
