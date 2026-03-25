import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import { GraduationCap, BookOpen, Clock, CheckCircle, Lock, Award, ArrowLeft, Loader2, User, Play, ChevronDown } from 'lucide-react';
import NarrationPlayer from '../components/NarrationPlayer';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function Classes() {
  const { user, authHeaders } = useAuth();
  const [classes, setClasses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [certs, setCerts] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [classDetail, setClassDetail] = useState(null);
  const [openLesson, setOpenLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [completing, setCompleting] = useState(null);
  const [view, setView] = useState('catalog');

  const loadData = useCallback(async () => {
    try {
      const [classesRes, ...authRes] = await Promise.all([
        axios.get(`${API}/classes`),
        ...(user ? [
          axios.get(`${API}/classes/my/enrollments`, { headers: authHeaders }),
          axios.get(`${API}/certifications/my`, { headers: authHeaders }),
        ] : []),
      ]);
      setClasses(classesRes.data);
      if (user) {
        setEnrollments(authRes[0]?.data || []);
        setCerts(authRes[1]?.data || []);
      }
    } catch {} finally { setLoading(false); }
  }, [user, authHeaders]);

  useEffect(() => { loadData(); }, [loadData]);

  const openClass = async (classId) => {
    setSelectedClass(classId);
    setOpenLesson(null);
    try {
      const res = await axios.get(`${API}/classes/${classId}`);
      setClassDetail(res.data);
    } catch { toast.error('Could not load class'); }
  };

  const enroll = async (classId) => {
    if (!user) { toast.error('Sign in to enroll'); return; }
    setEnrolling(true);
    try {
      await axios.post(`${API}/classes/enroll`, { class_id: classId }, { headers: authHeaders });
      toast.success('Enrolled! Start your first lesson.');
      await loadData();
    } catch { toast.error('Could not enroll'); } finally { setEnrolling(false); }
  };

  const completeLesson = async (classId, lessonId) => {
    setCompleting(lessonId);
    try {
      const res = await axios.post(`${API}/classes/complete-lesson`, { class_id: classId, lesson_id: lessonId }, { headers: authHeaders });
      if (res.data.certified) {
        toast.success('You earned a certification!');
      } else {
        toast.success('Lesson completed!');
      }
      await loadData();
    } catch { toast.error('Could not complete lesson'); } finally { setCompleting(null); }
  };

  const getEnrollment = (classId) => enrollments.find(e => e.class_id === classId);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'transparent' }}>
      <Loader2 size={24} className="animate-spin" style={{ color: 'var(--text-muted)' }} />
    </div>
  );

  // Lesson detail view
  if (selectedClass && classDetail && openLesson) {
    const lesson = classDetail.lessons.find(l => l.id === openLesson);
    const enrollment = getEnrollment(classDetail.id);
    const isCompleted = enrollment?.completed_lessons?.includes(lesson.id);
    const lessonIndex = classDetail.lessons.findIndex(l => l.id === openLesson);
    const nextLesson = classDetail.lessons[lessonIndex + 1];

    return (
      <div className="min-h-screen px-6 md:px-12 lg:px-24 py-12" style={{ background: 'transparent' }}>
        <div className="max-w-4xl mx-auto">
          <button onClick={() => setOpenLesson(null)}
            className="text-sm mb-6 flex items-center gap-1" style={{ color: 'var(--text-muted)' }}
            data-testid="lesson-back-btn">
            <ArrowLeft size={14} /> Back to {classDetail.title}
          </button>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            {/* Lesson header */}
            <div className="flex items-center gap-3 mb-2">
              <span className="text-xs px-3 py-1 rounded-full" style={{ background: `${classDetail.color}15`, color: classDetail.color, border: `1px solid ${classDetail.color}25` }}>
                Lesson {lesson.order} of {classDetail.lessons.length}
              </span>
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}><Clock size={10} className="inline mr-1" />{lesson.duration}</span>
              {isCompleted && <span className="text-xs flex items-center gap-1" style={{ color: '#2DD4BF' }}><CheckCircle size={12} /> Completed</span>}
            </div>
            <h1 className="text-3xl md:text-4xl font-light mb-2" style={{ fontFamily: 'Cormorant Garamond, serif' }}>{lesson.title}</h1>
            <p className="text-sm mb-8" style={{ color: 'var(--text-secondary)' }}>{lesson.description}</p>

            {/* Video */}
            {lesson.video_url && (
              <div className="glass-card overflow-hidden mb-8">
                <div className="relative w-full" style={{ paddingBottom: '56.25%', background: '#000' }}>
                  <iframe src={lesson.video_url} title={lesson.title}
                    className="absolute inset-0 w-full h-full" style={{ border: 'none' }}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
                </div>
              </div>
            )}

            {/* Lesson content */}
            <div className="glass-card p-6 md:p-8 mb-8">
              <div className="flex items-center justify-between mb-6">
                <p className="text-xs font-bold uppercase tracking-[0.2em]" style={{ color: classDetail.color }}>
                  <BookOpen size={12} className="inline mr-2" /> Lesson Content
                </p>
                <NarrationPlayer text={lesson.content} label="Listen" color={classDetail.color} />
              </div>
              <div className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--text-secondary)' }}>
                {lesson.content}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4">
              {enrollment && !isCompleted && (
                <button onClick={() => completeLesson(classDetail.id, lesson.id)}
                  disabled={completing === lesson.id}
                  className="flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium"
                  style={{ background: `${classDetail.color}15`, border: `1px solid ${classDetail.color}30`, color: classDetail.color }}
                  data-testid={`complete-lesson-${lesson.id}`}>
                  {completing === lesson.id ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
                  Mark as Complete
                </button>
              )}
              {isCompleted && nextLesson && (
                <button onClick={() => setOpenLesson(nextLesson.id)}
                  className="flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-primary)' }}
                  data-testid="next-lesson-btn">
                  Next: {nextLesson.title} <ChevronDown size={14} style={{ transform: 'rotate(-90deg)' }} />
                </button>
              )}
              {isCompleted && !nextLesson && (
                <p className="text-sm" style={{ color: '#FCD34D' }}>
                  <Award size={14} className="inline mr-1" /> You've completed the final lesson!
                </p>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // Class detail view
  if (selectedClass && classDetail) {
    const enrollment = getEnrollment(classDetail.id);
    const completed = enrollment?.completed_lessons?.length || 0;
    const total = classDetail.lessons.length;
    const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

    return (
      <div className="min-h-screen px-6 md:px-12 lg:px-24 py-12" style={{ background: 'transparent' }}>
        <div className="max-w-4xl mx-auto">
          <button onClick={() => { setSelectedClass(null); setClassDetail(null); }}
            className="text-sm mb-6 flex items-center gap-1" style={{ color: 'var(--text-muted)' }}
            data-testid="classes-back-btn">
            <ArrowLeft size={14} /> Back to classes
          </button>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            {/* Class header */}
            <div className="glass-card overflow-hidden mb-8">
              <div className="relative h-48 md:h-56">
                <img src={classDetail.thumbnail} alt={classDetail.title} className="w-full h-full object-cover" style={{ filter: 'brightness(0.4)' }} />
                <div className="absolute inset-0 p-8 flex flex-col justify-end" style={{ background: 'linear-gradient(to top, rgba(11,12,21,0.95), transparent)' }}>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-xs px-3 py-1 rounded-full" style={{ background: `${classDetail.color}15`, color: classDetail.color, border: `1px solid ${classDetail.color}25` }}>
                      {classDetail.level}
                    </span>
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}><Clock size={10} className="inline mr-1" />{classDetail.duration}</span>
                  </div>
                  <h2 className="text-3xl md:text-4xl font-light" style={{ fontFamily: 'Cormorant Garamond, serif' }}>{classDetail.title}</h2>
                  <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}><User size={10} className="inline mr-1" /> {classDetail.instructor} &middot; {total} lessons</p>
                </div>
              </div>
              <div className="p-6 md:p-8">
                <p className="text-sm leading-relaxed mb-6" style={{ color: 'var(--text-secondary)' }}>{classDetail.description}</p>

                {!enrollment ? (
                  <button onClick={() => enroll(classDetail.id)} disabled={enrolling || !user}
                    className="flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium"
                    style={{ background: `${classDetail.color}15`, border: `1px solid ${classDetail.color}30`, color: classDetail.color }}
                    data-testid="enroll-btn">
                    {enrolling ? <Loader2 size={14} className="animate-spin" /> : <BookOpen size={14} />}
                    {!user ? 'Sign in to Enroll' : enrolling ? 'Enrolling...' : 'Start This Course — Free'}
                  </button>
                ) : (
                  <div className="flex items-center gap-4">
                    {enrollment.certified ? <Award size={18} style={{ color: '#FCD34D' }} /> : <BookOpen size={18} style={{ color: '#2DD4BF' }} />}
                    <div className="flex-1">
                      <div className="flex justify-between text-xs mb-1.5">
                        <span style={{ color: enrollment.certified ? '#FCD34D' : 'var(--text-secondary)' }}>
                          {enrollment.certified ? 'Certified!' : `${completed}/${total} lessons completed`}
                        </span>
                        <span style={{ color: 'var(--text-muted)' }}>{pct}%</span>
                      </div>
                      <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: enrollment.certified ? '#FCD34D' : '#2DD4BF', transition: 'width 0.5s' }} />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Lessons list */}
            <p className="text-xs font-bold uppercase tracking-[0.2em] mb-5" style={{ color: 'var(--text-muted)' }}>Course Lessons</p>
            <div className="space-y-3">
              {classDetail.lessons.sort((a, b) => a.order - b.order).map(lesson => {
                const isCompleted = enrollment?.completed_lessons?.includes(lesson.id);
                const isEnrolled = !!enrollment;
                return (
                  <div key={lesson.id}
                    className={`glass-card p-5 flex items-center gap-4 ${isEnrolled ? 'cursor-pointer' : ''}`}
                    onClick={() => isEnrolled && setOpenLesson(lesson.id)}
                    style={{ borderColor: isCompleted ? 'rgba(45,212,191,0.2)' : 'rgba(255,255,255,0.06)' }}
                    data-testid={`lesson-${lesson.id}`}>
                    <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold"
                      style={{
                        background: isCompleted ? 'rgba(45,212,191,0.15)' : `${classDetail.color}08`,
                        color: isCompleted ? '#2DD4BF' : classDetail.color,
                        border: `1px solid ${isCompleted ? 'rgba(45,212,191,0.3)' : `${classDetail.color}20`}`,
                      }}>
                      {isCompleted ? <CheckCircle size={18} /> : lesson.order}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium" style={{ color: isCompleted ? '#2DD4BF' : 'var(--text-primary)' }}>{lesson.title}</p>
                      <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--text-muted)' }}>{lesson.description}</p>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{lesson.duration}</span>
                      {lesson.video_url && <Play size={12} style={{ color: classDetail.color }} />}
                      {isEnrolled ? (
                        <ChevronDown size={16} style={{ color: 'var(--text-muted)', transform: 'rotate(-90deg)' }} />
                      ) : (
                        <Lock size={14} style={{ color: 'var(--text-muted)', opacity: 0.3 }} />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {!enrollment && (
              <p className="text-xs text-center mt-6" style={{ color: 'var(--text-muted)' }}>
                <Lock size={10} className="inline mr-1" /> Enroll to unlock all lessons and earn your certification
              </p>
            )}
          </motion.div>
        </div>
      </div>
    );
  }

  // Catalog / My Classes / Certifications
  return (
    <div className="min-h-screen px-6 md:px-12 lg:px-24 py-12" style={{ background: 'transparent' }}>
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-xs font-bold uppercase tracking-[0.25em] mb-4" style={{ color: '#FCD34D' }}>
            <GraduationCap size={14} className="inline mr-2" /> Learn & Certify
          </p>
          <h1 className="text-4xl md:text-5xl font-light tracking-tight mb-4" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
            Classes
          </h1>
          <p className="text-base mb-8" style={{ color: 'var(--text-secondary)' }}>
            Structured courses with expert instruction. Complete all lessons to earn your certification.
          </p>
        </motion.div>

        <div className="flex gap-2 mb-10">
          {[{ id: 'catalog', label: 'All Classes' }, { id: 'enrolled', label: 'My Classes' }, { id: 'certs', label: 'Certifications' }].map(v => (
            <button key={v.id} onClick={() => setView(v.id)}
              className="px-4 py-2 rounded-full text-sm"
              style={{
                background: view === v.id ? 'rgba(252,211,77,0.1)' : 'transparent',
                border: `1px solid ${view === v.id ? 'rgba(252,211,77,0.3)' : 'rgba(255,255,255,0.06)'}`,
                color: view === v.id ? '#FCD34D' : 'var(--text-muted)',
              }}
              data-testid={`classes-tab-${v.id}`}>
              {v.label}
              {v.id === 'certs' && certs.length > 0 && <span className="ml-1.5 text-xs opacity-70">({certs.length})</span>}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {view === 'certs' ? (
            <motion.div key="certs" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {certs.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {certs.map(c => (
                    <div key={c.id} className="glass-card p-6 text-center" style={{ borderColor: 'rgba(252,211,77,0.2)', background: 'rgba(252,211,77,0.03)' }}>
                      <div className="w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center"
                        style={{ background: 'linear-gradient(135deg, #FCD34D, #FB923C)', boxShadow: '0 0 30px rgba(252,211,77,0.2)' }}>
                        <Award size={28} style={{ color: 'white' }} />
                      </div>
                      <p className="text-sm font-medium" style={{ color: '#FCD34D' }}>{c.class_title}</p>
                      <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Certified by {c.instructor}</p>
                      <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                        {new Date(c.issued_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="glass-card p-12 text-center">
                  <Award size={40} style={{ color: 'var(--text-muted)', opacity: 0.3, margin: '0 auto 16px' }} />
                  <p className="text-lg" style={{ fontFamily: 'Cormorant Garamond, serif', color: 'var(--text-muted)' }}>No certifications yet</p>
                  <p className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>Complete all lessons in a class to earn your certification.</p>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div key="catalog" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(view === 'enrolled' ? classes.filter(c => getEnrollment(c.id)) : classes).map((cls, i) => {
                const enrollment = getEnrollment(cls.id);
                const completed = enrollment?.completed_lessons?.length || 0;
                const total = cls.lesson_count || 0;
                const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
                return (
                  <motion.div key={cls.id}
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className="glass-card overflow-hidden cursor-pointer group"
                    onClick={() => openClass(cls.id)}
                    data-testid={`class-${cls.id}`}>
                    <div className="relative h-40 overflow-hidden">
                      <img src={cls.thumbnail} alt={cls.title} className="w-full h-full object-cover group-hover:scale-105"
                        style={{ filter: 'brightness(0.5)', transition: 'transform 0.5s' }} loading="lazy" />
                      <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(11,12,21,0.95), transparent 50%)' }} />
                      <div className="absolute bottom-3 left-4 right-4">
                        <h3 className="text-xl font-light" style={{ fontFamily: 'Cormorant Garamond, serif' }}>{cls.title}</h3>
                        <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{cls.instructor} &middot; {total} lessons</p>
                      </div>
                      {enrollment?.certified && (
                        <div className="absolute top-3 right-3"><Award size={20} style={{ color: '#FCD34D', filter: 'drop-shadow(0 0 6px rgba(252,211,77,0.5))' }} /></div>
                      )}
                    </div>
                    <div className="p-5">
                      <p className="text-xs mb-3 line-clamp-2" style={{ color: 'var(--text-secondary)' }}>{cls.description}</p>
                      <div className="flex items-center justify-between text-xs" style={{ color: 'var(--text-muted)' }}>
                        <span>{cls.level}</span>
                        <span>{cls.duration}</span>
                      </div>
                      {enrollment && (
                        <div className="mt-3">
                          <div className="flex justify-between text-xs mb-1">
                            <span style={{ color: enrollment.certified ? '#FCD34D' : 'var(--text-muted)' }}>
                              {enrollment.certified ? 'Certified' : `${completed}/${total}`}
                            </span>
                            <span style={{ color: 'var(--text-muted)' }}>{pct}%</span>
                          </div>
                          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                            <div className="h-full rounded-full" style={{ width: `${pct}%`, background: enrollment.certified ? '#FCD34D' : '#2DD4BF' }} />
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
              {view === 'enrolled' && classes.filter(c => getEnrollment(c.id)).length === 0 && (
                <div className="col-span-full glass-card p-12 text-center">
                  <BookOpen size={40} style={{ color: 'var(--text-muted)', opacity: 0.3, margin: '0 auto 16px' }} />
                  <p className="text-lg" style={{ fontFamily: 'Cormorant Garamond, serif', color: 'var(--text-muted)' }}>No enrolled classes yet</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
