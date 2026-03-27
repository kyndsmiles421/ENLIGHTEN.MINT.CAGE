import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, BookOpen, Quote, Sparkles, Loader2, ChevronRight, Search, Heart, Play, Pause } from 'lucide-react';
import NarrationPlayer from '../components/NarrationPlayer';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const TRADITION_ICONS = {
  'Buddhism': '&#9784;',
  'Christianity / Mystical Christianity': '&#10013;',
  'Islam / Sufism': '&#9774;',
  'Hinduism / Bhagavad Gita': '&#2384;',
  'Taoism': '&#9775;',
  'Sufism / Islamic Mysticism': '&#10038;',
  'Zen Buddhism / Engaged Buddhism': '&#9784;',
  'Kriya Yoga / Vedanta': '&#2384;',
  'Hindu-inspired / Universal Spirituality': '&#10084;',
  'Zen / Comparative Mysticism': '&#8734;',
  'Ancient Egyptian Mysticism / Hermeticism': '&#9883;',
};

function TeacherCard({ teacher, onClick }) {
  return (
    <motion.button
      whileHover={{ y: -4 }}
      onClick={onClick}
      className="glass-card glass-card-hover p-6 text-left w-full"
      data-testid={`teacher-card-${teacher.id}`}
    >
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 rounded-2xl overflow-hidden flex-shrink-0 relative"
          style={{ border: `1px solid ${teacher.color}20` }}>
          <div className="w-full h-full" style={{ background: `linear-gradient(135deg, ${teacher.color}20, ${teacher.color}08)` }} />
          <div className="absolute inset-0 flex items-center justify-center text-2xl" style={{ color: teacher.color }}
            dangerouslySetInnerHTML={{ __html: TRADITION_ICONS[teacher.tradition] || '&#10024;' }} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-medium mb-0.5" style={{ color: 'var(--text-primary)' }}>{teacher.name}</h3>
          <p className="text-xs mb-1.5" style={{ color: teacher.color }}>{teacher.tradition}</p>
          <p className="text-xs leading-relaxed line-clamp-2" style={{ color: 'var(--text-muted)' }}>{teacher.core_principle}</p>
          <div className="flex gap-3 mt-2.5">
            <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: 'rgba(255,255,255,0.03)', color: 'var(--text-muted)' }}>
              {teacher.era}
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: `${teacher.color}08`, color: teacher.color }}>
              {teacher.teaching_count} teachings
            </span>
          </div>
        </div>
        <ChevronRight size={16} style={{ color: 'var(--text-muted)' }} className="flex-shrink-0 mt-1" />
      </div>
    </motion.button>
  );
}

function ContemplationModal({ contemplation, teacher, teaching, color, onClose }) {
  if (!contemplation) return null;
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(5,5,12,0.9)', backdropFilter: 'blur(12px)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }}
        className="glass-card max-w-2xl w-full max-h-[80vh] overflow-y-auto p-8"
        style={{ borderColor: `${color}15` }}
        onClick={e => e.stopPropagation()}
        data-testid="contemplation-modal"
      >
        <p className="text-xs font-bold uppercase tracking-[0.2em] mb-2" style={{ color }}>
          Guided Contemplation
        </p>
        <h3 className="text-xl font-light mb-1" style={{ fontFamily: 'Cormorant Garamond, serif', color: 'var(--text-primary)' }}>
          {teaching}
        </h3>
        <p className="text-xs mb-6" style={{ color: 'var(--text-muted)' }}>Inspired by {teacher}</p>
        <div className="text-sm leading-relaxed whitespace-pre-line mb-6" style={{ color: 'var(--text-secondary)' }}>
          {contemplation}
        </div>
        <div className="flex items-center gap-3">
          <NarrationPlayer text={contemplation} label="Listen" color={color} />
          <button onClick={onClose} className="px-4 py-2 rounded-full text-xs" style={{ color: 'var(--text-muted)' }}>
            Close
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function TeachingCard({ teaching, teacher, color, authHeaders }) {
  const [expanded, setExpanded] = useState(false);
  const [contemplation, setContemplation] = useState(null);
  const [loading, setLoading] = useState(false);

  const generateContemplation = async () => {
    setLoading(true);
    try {
      const r = await axios.post(`${API}/teachings/contemplate`, {
        teacher_id: teacher.id, teaching_id: teaching.id,
      }, { headers: authHeaders });
      setContemplation(r.data);
    } catch {
      toast.error('Could not generate contemplation');
    }
    setLoading(false);
  };

  return (
    <>
      <motion.div layout className="glass-card overflow-hidden" style={{ borderColor: expanded ? `${color}15` : 'rgba(255,255,255,0.06)' }}>
        <button onClick={() => setExpanded(!expanded)} className="w-full p-5 text-left flex items-start gap-3"
          data-testid={`teaching-${teaching.id}`}>
          <BookOpen size={16} className="flex-shrink-0 mt-0.5" style={{ color }} />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{teaching.title}</p>
          </div>
          <ChevronRight size={14} style={{ color: 'var(--text-muted)', transform: expanded ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }} />
        </button>
        <AnimatePresence>
          {expanded && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
              <div className="px-5 pb-5 border-t" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
                <div className="text-sm leading-relaxed mt-4 mb-4 whitespace-pre-line" style={{ color: 'var(--text-secondary)' }}>
                  {teaching.content}
                </div>
                {teaching.practice && (
                  <div className="glass-card p-4 mb-4" style={{ borderColor: `${color}10` }}>
                    <p className="text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color }}>Practice</p>
                    <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{teaching.practice}</p>
                  </div>
                )}
                <div className="flex items-center gap-2 flex-wrap">
                  <NarrationPlayer text={`${teaching.title}. ${teaching.content}`} label="Listen" color={color} />
                  <button onClick={generateContemplation} disabled={loading}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium"
                    style={{ background: `${color}12`, color, border: `1px solid ${color}20` }}
                    data-testid={`contemplate-${teaching.id}`}>
                    {loading ? <Loader2 size={11} className="animate-spin" /> : <Sparkles size={11} />}
                    {loading ? 'Generating...' : 'AI Contemplation'}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
      <AnimatePresence>
        {contemplation && (
          <ContemplationModal
            contemplation={contemplation.contemplation}
            teacher={contemplation.teacher}
            teaching={contemplation.teaching}
            color={color}
            onClose={() => setContemplation(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}

function TeacherDetail({ teacher, onBack, authHeaders }) {
  const [full, setFull] = useState(null);
  const [activeQuote, setActiveQuote] = useState(0);

  useEffect(() => {
    axios.get(`${API}/teachings/teacher/${teacher.id}`).then(r => setFull(r.data)).catch(() => {});
  }, [teacher.id]);

  useEffect(() => {
    if (!full) return;
    const interval = setInterval(() => {
      setActiveQuote(prev => (prev + 1) % full.quotes.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [full]);

  if (!full) return <div className="flex justify-center py-20"><Loader2 className="animate-spin" style={{ color: teacher.color }} /></div>;

  return (
    <div data-testid="teacher-detail-view">
      <button onClick={onBack} className="flex items-center gap-2 text-xs mb-6 group" style={{ color: 'var(--text-muted)' }} data-testid="teachings-back-btn">
        <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> All Teachers
      </button>

      <div className="flex items-start gap-5 mb-8">
        <div className="w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0 relative"
          style={{ border: `1px solid ${full.color}20` }}>
          <div className="w-full h-full" style={{ background: `linear-gradient(135deg, ${full.color}25, ${full.color}08)` }} />
          <div className="absolute inset-0 flex items-center justify-center text-3xl" style={{ color: full.color }}
            dangerouslySetInnerHTML={{ __html: TRADITION_ICONS[full.tradition] || '&#10024;' }} />
        </div>
        <div className="flex-1">
          <h2 className="text-2xl font-light mb-1" style={{ fontFamily: 'Cormorant Garamond, serif', color: 'var(--text-primary)' }}>
            {full.name}
          </h2>
          <p className="text-xs mb-1" style={{ color: full.color }}>{full.tradition} &middot; {full.era}</p>
          <p className="text-sm leading-relaxed mt-2" style={{ color: 'var(--text-secondary)' }}>{full.bio}</p>
        </div>
      </div>

      {/* Core Principle */}
      <div className="glass-card p-5 mb-8" style={{ borderColor: `${full.color}15` }}>
        <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: full.color }}>Core Principle</p>
        <p className="text-sm leading-relaxed italic" style={{ color: 'var(--text-primary)' }}>{full.core_principle}</p>
      </div>

      {/* Rotating Quote */}
      <div className="mb-8 relative min-h-[80px]">
        <AnimatePresence mode="wait">
          <motion.div key={activeQuote} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="glass-card p-5" style={{ borderColor: `${full.color}10` }}>
            <Quote size={16} className="mb-2" style={{ color: `${full.color}40` }} />
            <p className="text-sm italic leading-relaxed" style={{ color: 'var(--text-primary)' }}>
              "{full.quotes[activeQuote]}"
            </p>
            <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>— {full.name}</p>
          </motion.div>
        </AnimatePresence>
        <div className="flex justify-center gap-1.5 mt-3">
          {full.quotes.map((_, i) => (
            <button key={i} onClick={() => setActiveQuote(i)}
              className="w-1.5 h-1.5 rounded-full transition-all"
              style={{ background: i === activeQuote ? full.color : 'rgba(255,255,255,0.1)' }} />
          ))}
        </div>
      </div>

      {/* Teachings */}
      <p className="text-xs font-bold uppercase tracking-[0.2em] mb-4" style={{ color: 'var(--text-muted)' }}>
        <BookOpen size={12} className="inline mr-2" /> Teachings
      </p>
      <div className="space-y-3 mb-8" data-testid="teachings-list">
        {full.teachings.map(teaching => (
          <TeachingCard key={teaching.id} teaching={teaching} teacher={full} color={full.color} authHeaders={authHeaders} />
        ))}
      </div>

      {/* All Quotes */}
      <p className="text-xs font-bold uppercase tracking-[0.2em] mb-4" style={{ color: 'var(--text-muted)' }}>
        <Quote size={12} className="inline mr-2" /> Wisdom
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {full.quotes.map((q, i) => (
          <div key={i} className="glass-card p-4">
            <p className="text-xs italic leading-relaxed" style={{ color: 'var(--text-secondary)' }}>"{q}"</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ThemeView({ themes, teachers, onSelectTeacher }) {
  return (
    <div className="space-y-6" data-testid="themes-view">
      {Object.entries(themes).map(([key, theme]) => (
        <div key={key}>
          <p className="text-xs font-bold uppercase tracking-[0.15em] mb-3" style={{ color: theme.color }}>
            {theme.label}
          </p>
          <div className="flex gap-2 flex-wrap">
            {theme.teachers.map(tid => {
              const t = teachers.find(te => te.id === tid);
              if (!t) return null;
              return (
                <button key={tid} onClick={() => onSelectTeacher(t)}
                  className="px-3 py-1.5 rounded-lg text-xs transition-all glass-card glass-card-hover"
                  style={{ color: t.color, borderColor: `${t.color}15` }}
                  data-testid={`theme-teacher-${tid}`}>
                  {t.name}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function Teachings() {
  const { authHeaders } = useAuth();
  const [teachers, setTeachers] = useState([]);
  const [themes, setThemes] = useState({});
  const [activeTeacher, setActiveTeacher] = useState(null);
  const [view, setView] = useState('teachers'); // 'teachers' | 'themes'
  const [search, setSearch] = useState('');

  useEffect(() => {
    axios.get(`${API}/teachings/teachers`).then(r => setTeachers(r.data.teachers)).catch(() => {});
    axios.get(`${API}/teachings/themes`).then(r => setThemes(r.data.themes)).catch(() => {});
  }, []);

  const filtered = search
    ? teachers.filter(t => t.name.toLowerCase().includes(search.toLowerCase()) || t.tradition.toLowerCase().includes(search.toLowerCase()))
    : teachers;

  return (
    <div className="min-h-screen px-6 md:px-12 lg:px-24 py-12" data-testid="teachings-page">
      <div className="max-w-4xl mx-auto relative z-10">
        <AnimatePresence mode="wait">
          {activeTeacher ? (
            <motion.div key={activeTeacher.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <TeacherDetail teacher={activeTeacher} onBack={() => setActiveTeacher(null)} authHeaders={authHeaders} />
            </motion.div>
          ) : (
            <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <p className="text-xs font-bold uppercase tracking-[0.3em] mb-2" style={{ color: '#A78BFA' }}>
                  <BookOpen size={14} className="inline mr-2" /> Spiritual Teachings
                </p>
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-light tracking-tight mb-3" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                  Wisdom of the Ages
                </h1>
                <p className="text-base mb-8" style={{ color: 'var(--text-secondary)' }}>
                  Study the teachings of humanity's greatest spiritual and quantum-conscious masters. From ancient wisdom to modern insight — all paths converge at the same truth.
                </p>
              </motion.div>

              {/* Search & View Toggle */}
              <div className="flex items-center gap-3 mb-8">
                <div className="flex-1 relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                  <input
                    type="text" value={search} onChange={e => setSearch(e.target.value)}
                    placeholder="Search teachers or traditions..."
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm bg-transparent"
                    style={{ border: '1px solid rgba(255,255,255,0.06)', color: 'var(--text-primary)' }}
                    data-testid="teachings-search"
                  />
                </div>
                <div className="flex rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
                  <button onClick={() => setView('teachers')}
                    className="px-4 py-2.5 text-xs font-medium transition-all"
                    style={{ background: view === 'teachers' ? 'rgba(167,139,250,0.12)' : 'transparent', color: view === 'teachers' ? '#A78BFA' : 'var(--text-muted)' }}
                    data-testid="view-teachers-btn">
                    Teachers
                  </button>
                  <button onClick={() => setView('themes')}
                    className="px-4 py-2.5 text-xs font-medium transition-all"
                    style={{ background: view === 'themes' ? 'rgba(167,139,250,0.12)' : 'transparent', color: view === 'themes' ? '#A78BFA' : 'var(--text-muted)' }}
                    data-testid="view-themes-btn">
                    Themes
                  </button>
                </div>
              </div>

              {view === 'teachers' ? (
                <div className="space-y-4">
                  {filtered.map((teacher, i) => (
                    <motion.div key={teacher.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                      <TeacherCard teacher={teacher} onClick={() => setActiveTeacher(teacher)} />
                    </motion.div>
                  ))}
                  {filtered.length === 0 && (
                    <p className="text-center py-12 text-sm" style={{ color: 'var(--text-muted)' }}>No teachers found matching "{search}"</p>
                  )}
                </div>
              ) : (
                <ThemeView themes={themes} teachers={teachers} onSelectTeacher={setActiveTeacher} />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
