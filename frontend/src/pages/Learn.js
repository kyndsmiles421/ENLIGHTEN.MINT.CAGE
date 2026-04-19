import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useSensory } from '../context/SensoryContext';
import { toast } from 'sonner';
import NarrationPlayer from '../components/NarrationPlayer';
import CelebrationBurst from '../components/CelebrationBurst';
import {
  GraduationCap, Layers, Zap, Waves, Crown, Lock,
  CheckCircle2, ChevronRight, BookOpen, Clock, ArrowLeft,
  Sparkles, ExternalLink
} from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const ICON_MAP = {
  layers: Layers, zap: Zap, waves: Waves, crown: Crown,
};

function ModuleCard({ mod, onClick }) {
  const Icon = ICON_MAP[mod.icon] || Layers;
  const progress = mod.total_lessons > 0 ? (mod.completed_count / mod.total_lessons) * 100 : 0;

  return (
    <motion.button
      onClick={() => mod.unlocked && onClick(mod)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-6 text-left w-full relative overflow-hidden group transition-all duration-300 ${mod.unlocked ? 'hover:scale-[1.02] cursor-pointer' : 'opacity-50 cursor-not-allowed'}`}
      data-testid={`module-card-${mod.id}`}
    >
      {/* Glow */}
      <div className="absolute top-0 right-0 w-40 h-40 rounded-full" style={{
        background: `radial-gradient(circle, ${mod.color}08 0%, transparent 70%)`,
        filter: 'blur(30px)',
      }} />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: `${mod.color}15`, border: `1px solid ${mod.color}25` }}>
              {mod.unlocked ? <Icon size={18} style={{ color: mod.color }} /> : <Lock size={18} style={{ color: 'var(--text-muted)' }} />}
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-[0.2em] font-bold" style={{ color: mod.color }}>
                Level {mod.level}
              </span>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{mod.duration}</p>
            </div>
          </div>
          {mod.completed && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold"
              style={{ background: `${mod.color}15`, color: mod.color }}>
              <CheckCircle2 size={11} /> Complete
            </div>
          )}
        </div>

        <h3 className="text-lg font-medium mb-1" style={{ color: 'var(--text-primary)', fontFamily: 'Cormorant Garamond, serif' }}>
          {mod.title}
        </h3>
        <p className="text-xs mb-4" style={{ color: 'var(--text-secondary)' }}>{mod.subtitle}</p>

        {/* Progress bar */}
        <div className="h-1.5 rounded-full overflow-hidden mb-2" style={{ background: 'rgba(255,255,255,0.04)' }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="h-full rounded-full"
            style={{ background: `linear-gradient(90deg, ${mod.color}60, ${mod.color})` }}
          />
        </div>
        <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
          {mod.completed_count} / {mod.total_lessons} lessons
        </p>
      </div>
    </motion.button>
  );
}

function LessonView({ lesson, moduleColor, onComplete, isCompleted }) {
  const [celebrating, setCelebrating] = useState(false);
  const { playChime } = useSensory();
  const navigate = useNavigate();

  const handleComplete = () => {
    if (!isCompleted) {
      playChime();
      setCelebrating(true);
      onComplete(lesson.id);
    }
  };

  return (
    <div className="max-w-3xl mx-auto" data-testid={`lesson-view-${lesson.id}`}>
      <CelebrationBurst active={celebrating} onComplete={() => setCelebrating(false)} />

      {/* Lesson header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-[10px] uppercase tracking-[0.2em] px-2.5 py-1 rounded-full font-bold"
            style={{ background: `${moduleColor}12`, color: moduleColor, border: `1px solid ${moduleColor}20` }}>
            {lesson.type === 'theory' ? 'Theory' : 'Practice'}
          </span>
          <span className="flex items-center gap-1 text-[10px]" style={{ color: 'var(--text-muted)' }}>
            <Clock size={10} /> {lesson.duration} min
          </span>
        </div>
        <h2 className="text-2xl md:text-3xl font-light mb-3" style={{ fontFamily: 'Cormorant Garamond, serif', color: 'var(--text-primary)' }}>
          {lesson.title}
        </h2>
      </div>

      {/* Narration */}
      <div className="mb-6">
        <NarrationPlayer text={lesson.content.substring(0, 500)} context="knowledge" />
      </div>

      {/* Content */}
      <div className="p-6 md:p-8 mb-6">
        <div className="prose prose-invert max-w-none">
          {lesson.content.split('\n\n').map((paragraph, i) => (
            <p key={i} className="text-sm leading-relaxed mb-4" style={{ color: 'var(--text-secondary)' }}>
              {paragraph}
            </p>
          ))}
        </div>
      </div>

      {/* Tool link */}
      {lesson.tool_link && (
        <button
          onClick={() => navigate(lesson.tool_link)}
          className="w-full p-4 flex items-center justify-between group hover:scale-[1.01] transition-transform mb-6"
          data-testid={`lesson-tool-link-${lesson.id}`}
        >
          <div className="flex items-center gap-3">
            <ExternalLink size={16} style={{ color: moduleColor }} />
            <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Practice this tool now</span>
          </div>
          <ChevronRight size={16} style={{ color: 'var(--text-muted)' }} className="group-hover:translate-x-1 transition-transform" />
        </button>
      )}

      {/* Complete button */}
      <button
        onClick={handleComplete}
        disabled={isCompleted}
        className="w-full py-3.5 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2"
        style={{
          background: isCompleted ? 'rgba(255,255,255,0.03)' : `${moduleColor}15`,
          color: isCompleted ? 'var(--text-muted)' : moduleColor,
          border: `1px solid ${isCompleted ? 'rgba(255,255,255,0.06)' : `${moduleColor}30`}`,
          cursor: isCompleted ? 'default' : 'pointer',
        }}
        data-testid={`lesson-complete-${lesson.id}`}
      >
        {isCompleted ? <><CheckCircle2 size={15} /> Lesson Completed</> : <><Sparkles size={15} /> Mark as Complete</>}
      </button>
    </div>
  );
}

export default function Learn() {
  useEffect(() => { if (typeof window.__workAccrue === 'function') window.__workAccrue('learning', 8); }, []);

  const { user, authHeaders, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedModule, setSelectedModule] = useState(null);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [completedLessons, setCompletedLessons] = useState([]);

  const loadModules = useCallback(async () => {
    if (!user) return;
    try {
      const res = await axios.get(`${API}/learning/modules`, { headers: authHeaders });
      setModules(res.data.modules);
      const allCompleted = [];
      res.data.modules.forEach(m => m.lessons.forEach(l => {
        if (res.data.modules.find(mod => mod.id === m.id)?.completed_count > 0) {
          // We need the actual completed lesson IDs from the backend
        }
      }));
      // Extract completed lessons from module data
      const completed = [];
      res.data.modules.forEach(mod => {
        mod.lessons.forEach((lesson, idx) => {
          if (idx < mod.completed_count) completed.push(lesson.id);
        });
      });
      setCompletedLessons(completed);
    } catch {
      toast.error('Could not load modules');
    } finally {
      setLoading(false);
    }
  }, [user, authHeaders]);

  useEffect(() => {
    if (!authLoading && !user) { navigate('/auth'); return; }
    if (user) loadModules();
  }, [user, authLoading, navigate, loadModules]);

  const completeLesson = async (lessonId) => {
    try {
      const res = await axios.post(`${API}/learning/complete-lesson`, { lesson_id: lessonId }, { headers: authHeaders });
      setCompletedLessons(res.data.completed_lessons);
      toast.success('Lesson completed!');
      loadModules();
    } catch {
      toast.error('Could not save progress');
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'transparent' }}>
        <p style={{ color: 'var(--text-muted)' }}>Preparing your learning path...</p>
      </div>
    );
  }

  // Lesson view
  if (selectedLesson) {
    return (
      <div className="min-h-screen pt-20 pb-40 px-5" style={{ background: 'transparent' }}>
        <div className="max-w-3xl mx-auto relative z-10">
          <button
            onClick={() => setSelectedLesson(null)}
            className="flex items-center gap-2 text-xs mb-8 group"
            style={{ color: 'var(--text-muted)' }}
            data-testid="lesson-back-btn"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
            Back to {selectedModule?.title}
          </button>
          <LessonView
            lesson={selectedLesson}
            moduleColor={selectedModule?.color || '#D8B4FE'}
            onComplete={completeLesson}
            isCompleted={completedLessons.includes(selectedLesson.id)}
          />
        </div>
      </div>
    );
  }

  // Module detail view
  if (selectedModule) {
    return (
      <div className="min-h-screen pt-20 pb-40 px-5" style={{ background: 'transparent' }}>
        <div className="max-w-3xl mx-auto relative z-10">
          <button
            onClick={() => setSelectedModule(null)}
            className="flex items-center gap-2 text-xs mb-8 group"
            style={{ color: 'var(--text-muted)' }}
            data-testid="module-back-btn"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
            All Modules
          </button>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="text-[10px] uppercase tracking-[0.2em] font-bold" style={{ color: selectedModule.color }}>
              Level {selectedModule.level}
            </span>
            <h1 className="text-3xl md:text-4xl font-light mt-2 mb-2" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
              {selectedModule.title}
            </h1>
            <p className="text-sm mb-8 max-w-2xl" style={{ color: 'var(--text-secondary)' }}>
              {selectedModule.description}
            </p>
          </motion.div>

          <div className="space-y-3">
            {selectedModule.lessons.map((lesson, i) => {
              const isDone = completedLessons.includes(lesson.id);
              const isLocked = i > 0 && !completedLessons.includes(selectedModule.lessons[i - 1].id) && !isDone;
              return (
                <motion.button
                  key={lesson.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => !isLocked && setSelectedLesson(lesson)}
                  className={`w-full p-5 flex items-center gap-4 text-left transition-all group ${isLocked ? 'opacity-40 cursor-not-allowed' : 'hover:scale-[1.01] cursor-pointer'}`}
                  data-testid={`lesson-card-${lesson.id}`}
                >
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{
                      background: isDone ? `${selectedModule.color}20` : 'rgba(255,255,255,0.03)',
                      border: `1px solid ${isDone ? `${selectedModule.color}30` : 'rgba(255,255,255,0.06)'}`,
                    }}>
                    {isLocked ? <Lock size={14} style={{ color: 'var(--text-muted)' }} /> :
                      isDone ? <CheckCircle2 size={14} style={{ color: selectedModule.color }} /> :
                        <span className="text-xs font-bold" style={{ color: 'var(--text-muted)' }}>{i + 1}</span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: isDone ? selectedModule.color : 'var(--text-primary)' }}>
                      {lesson.title}
                    </p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                        {lesson.type}
                      </span>
                      <span className="text-[10px] flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
                        <Clock size={9} /> {lesson.duration} min
                      </span>
                    </div>
                  </div>
                  <ChevronRight size={16} style={{ color: 'var(--text-muted)' }}
                    className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Module list view
  const totalCompleted = modules.reduce((s, m) => s + m.completed_count, 0);
  const totalLessons = modules.reduce((s, m) => s + m.total_lessons, 0);

  return (
    <div className="min-h-screen pt-20 pb-40 px-5" style={{ background: 'transparent' }} data-testid="learn-page">
      <div className="max-w-3xl mx-auto relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-xs font-bold uppercase tracking-[0.3em] mb-4" style={{ color: '#E879F9' }}>
            <GraduationCap size={14} className="inline mr-2" /> Progressive Learning
          </p>
          <h1 className="text-3xl font-light tracking-tight mb-4" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
            Advanced Modules
          </h1>
          <p className="text-base mb-4 max-w-xl" style={{ color: 'var(--text-secondary)' }}>
            Deepen your practice through structured, progressive learning. Each module builds upon the last, transforming understanding into embodied mastery.
          </p>

          {/* Overall progress */}
          <div className="p-5 mb-10 flex items-center gap-6">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Overall Progress</span>
                <span className="text-xs" style={{ color: '#E879F9' }}>{totalCompleted} / {totalLessons}</span>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)' }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${totalLessons > 0 ? (totalCompleted / totalLessons) * 100 : 0}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className="h-full rounded-full"
                  style={{ background: 'linear-gradient(90deg, #2DD4BF, #8B5CF6, #E879F9, #FCD34D)' }}
                />
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-light" style={{ fontFamily: 'Cormorant Garamond, serif', color: 'var(--text-primary)' }}>
                {modules.filter(m => m.completed).length}/{modules.length}
              </p>
              <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>modules done</p>
            </div>
          </div>
        </motion.div>

        {/* Module grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {modules.map((mod, i) => (
            <motion.div key={mod.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.08 }}>
              <ModuleCard mod={mod} onClick={setSelectedModule} />
            </motion.div>
          ))}
        </div>

        {/* Learning path visualization */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 p-6"
        >
          <p className="text-xs font-bold uppercase tracking-[0.2em] mb-6" style={{ color: 'var(--text-muted)' }}>
            <BookOpen size={12} className="inline mr-2" /> Your Learning Path
          </p>
          <div className="flex items-center justify-between gap-2 overflow-x-auto pb-2">
            {modules.map((mod, i) => (
              <React.Fragment key={mod.id}>
                <div className="flex flex-col items-center gap-2 min-w-[80px]">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${mod.completed ? 'ring-2' : ''}`}
                    style={{
                      background: mod.completed ? `${mod.color}20` : mod.unlocked ? `rgba(255,255,255,0.04)` : 'rgba(255,255,255,0.02)',
                      borderColor: mod.color,
                      ringColor: mod.color,
                    }}>
                    {mod.completed ? <CheckCircle2 size={18} style={{ color: mod.color }} /> :
                      mod.unlocked ? <span className="text-sm font-bold" style={{ color: mod.color }}>{mod.level}</span> :
                        <Lock size={14} style={{ color: 'var(--text-muted)' }} />}
                  </div>
                  <p className="text-[10px] text-center" style={{ color: mod.unlocked ? 'var(--text-secondary)' : 'var(--text-muted)' }}>
                    {mod.title.split(' ').slice(0, 2).join(' ')}
                  </p>
                </div>
                {i < modules.length - 1 && (
                  <div className="flex-1 h-px min-w-[20px]"
                    style={{ background: modules[i + 1].unlocked ? `linear-gradient(90deg, ${mod.color}40, ${modules[i + 1].color}40)` : 'rgba(255,255,255,0.06)' }} />
                )}
              </React.Fragment>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
