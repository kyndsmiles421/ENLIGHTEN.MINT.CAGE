import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import { GraduationCap, BookOpen, Clock, ChevronRight, CheckCircle, Lock, Award, ArrowLeft, Loader2, User } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

function CertificateBadge({ cert }) {
  return (
    <div className="glass-card p-6 text-center" data-testid={`cert-${cert.class_id}`}
      style={{ borderColor: 'rgba(252,211,77,0.2)', background: 'rgba(252,211,77,0.03)' }}>
      <div className="w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center"
        style={{ background: 'linear-gradient(135deg, #FCD34D, #FB923C)', boxShadow: '0 0 30px rgba(252,211,77,0.2)' }}>
        <Award size={28} style={{ color: 'white' }} />
      </div>
      <p className="text-sm font-medium" style={{ color: '#FCD34D' }}>{cert.class_title}</p>
      <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Certified by {cert.instructor}</p>
      <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
        {new Date(cert.issued_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
      </p>
    </div>
  );
}

export default function Classes() {
  const { user, authHeaders } = useAuth();
  const [classes, setClasses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [certs, setCerts] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [classDetail, setClassDetail] = useState(null);
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
    try {
      const res = await axios.get(`${API}/classes/${classId}`);
      setClassDetail(res.data);
    } catch { toast.error('Could not load class details'); }
  };

  const enroll = async (classId) => {
    if (!user) { toast.error('Sign in to enroll'); return; }
    setEnrolling(true);
    try {
      await axios.post(`${API}/classes/enroll`, { class_id: classId }, { headers: authHeaders });
      toast.success('Enrolled successfully!');
      await loadData();
    } catch { toast.error('Could not enroll'); } finally { setEnrolling(false); }
  };

  const completeLesson = async (classId, lessonId) => {
    setCompleting(lessonId);
    try {
      const res = await axios.post(`${API}/classes/complete-lesson`, { class_id: classId, lesson_id: lessonId }, { headers: authHeaders });
      if (res.data.certified) {
        toast.success('Congratulations! You earned a certification!');
      } else {
        toast.success('Lesson completed!');
      }
      await loadData();
    } catch { toast.error('Could not complete lesson'); } finally { setCompleting(null); }
  };

  const getEnrollment = (classId) => enrollments.find(e => e.class_id === classId);

  if (loading) return <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-default)' }}><p style={{ color: 'var(--text-muted)' }}>Loading classes...</p></div>;

  return (
    <div className="min-h-screen px-6 md:px-12 lg:px-24 py-12" style={{ background: 'var(--bg-default)' }}>
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

        {/* View Toggle */}
        <div className="flex gap-2 mb-10">
          {[{ id: 'catalog', label: 'All Classes' }, { id: 'enrolled', label: 'My Classes' }, { id: 'certs', label: 'Certifications' }].map(v => (
            <button key={v.id} onClick={() => { setView(v.id); setSelectedClass(null); setClassDetail(null); }}
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
          {/* Class Detail View */}
          {selectedClass && classDetail ? (
            <motion.div key="detail" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <button onClick={() => { setSelectedClass(null); setClassDetail(null); }}
                className="text-sm mb-6 flex items-center gap-1" style={{ color: 'var(--text-muted)' }}
                data-testid="classes-back-btn">
                <ArrowLeft size={14} /> Back to classes
              </button>
              <div className="glass-card overflow-hidden">
                <div className="relative h-48">
                  <img src={classDetail.thumbnail} alt={classDetail.title} className="w-full h-full object-cover" style={{ filter: 'brightness(0.5)' }} />
                  <div className="absolute inset-0 p-8 flex flex-col justify-end" style={{ background: 'linear-gradient(to top, rgba(11,12,21,0.95), transparent)' }}>
                    <h2 className="text-3xl font-light" style={{ fontFamily: 'Cormorant Garamond, serif' }}>{classDetail.title}</h2>
                    <div className="flex items-center gap-4 mt-2 text-xs" style={{ color: 'var(--text-muted)' }}>
                      <span className="flex items-center gap-1"><User size={10} /> {classDetail.instructor}</span>
                      <span className="flex items-center gap-1"><Clock size={10} /> {classDetail.duration}</span>
                      <span>{classDetail.level}</span>
                      <span>{classDetail.lessons.length} lessons</span>
                    </div>
                  </div>
                </div>

                <div className="p-8">
                  <p className="text-sm leading-relaxed mb-8" style={{ color: 'var(--text-secondary)' }}>{classDetail.description}</p>

                  {!getEnrollment(classDetail.id) ? (
                    <button onClick={() => enroll(classDetail.id)} disabled={enrolling || !user}
                      className="btn-glass glow-primary px-8 py-3 mb-8 flex items-center gap-2"
                      data-testid="enroll-btn">
                      {enrolling ? <Loader2 size={16} className="animate-spin" /> : <BookOpen size={16} />}
                      {!user ? 'Sign in to Enroll' : enrolling ? 'Enrolling...' : 'Enroll in This Class'}
                    </button>
                  ) : (
                    <div className="mb-8">
                      {(() => {
                        const enrollment = getEnrollment(classDetail.id);
                        const completed = enrollment?.completed_lessons?.length || 0;
                        const total = classDetail.lessons.length;
                        const pct = Math.round((completed / total) * 100);
                        return (
                          <div className="glass-card p-4 flex items-center gap-4" style={{ borderColor: enrollment?.certified ? 'rgba(252,211,77,0.3)' : 'rgba(255,255,255,0.08)' }}>
                            {enrollment?.certified ? <Award size={20} style={{ color: '#FCD34D' }} /> : <BookOpen size={20} style={{ color: '#2DD4BF' }} />}
                            <div className="flex-1">
                              <div className="flex justify-between text-xs mb-1">
                                <span style={{ color: enrollment?.certified ? '#FCD34D' : 'var(--text-secondary)' }}>
                                  {enrollment?.certified ? 'Certified!' : `${completed}/${total} lessons completed`}
                                </span>
                                <span style={{ color: 'var(--text-muted)' }}>{pct}%</span>
                              </div>
                              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                                <div className="h-full rounded-full" style={{ width: `${pct}%`, background: enrollment?.certified ? '#FCD34D' : '#2DD4BF', transition: 'width 0.5s' }} />
                              </div>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  )}

                  <p className="text-xs font-bold uppercase tracking-[0.2em] mb-4" style={{ color: 'var(--text-muted)' }}>Lessons</p>
                  <div className="space-y-3">
                    {classDetail.lessons.sort((a, b) => a.order - b.order).map(lesson => {
                      const enrollment = getEnrollment(classDetail.id);
                      const isCompleted = enrollment?.completed_lessons?.includes(lesson.id);
                      const isEnrolled = !!enrollment;
                      return (
                        <div key={lesson.id} className="glass-card p-5 flex items-center gap-4"
                          style={{ borderColor: isCompleted ? 'rgba(45,212,191,0.2)' : 'rgba(255,255,255,0.06)' }}
                          data-testid={`lesson-${lesson.id}`}>
                          <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold"
                            style={{
                              background: isCompleted ? 'rgba(45,212,191,0.15)' : 'rgba(255,255,255,0.04)',
                              color: isCompleted ? '#2DD4BF' : 'var(--text-muted)',
                              border: `1px solid ${isCompleted ? 'rgba(45,212,191,0.3)' : 'rgba(255,255,255,0.08)'}`,
                            }}>
                            {isCompleted ? <CheckCircle size={16} /> : lesson.order}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium" style={{ color: isCompleted ? '#2DD4BF' : 'var(--text-primary)' }}>{lesson.title}</p>
                            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{lesson.description}</p>
                            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{lesson.duration}</span>
                          </div>
                          {isEnrolled && !isCompleted && (
                            <button onClick={() => completeLesson(classDetail.id, lesson.id)}
                              disabled={completing === lesson.id}
                              className="btn-glass px-4 py-2 text-xs flex items-center gap-1.5"
                              data-testid={`complete-${lesson.id}`}>
                              {completing === lesson.id ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle size={12} />}
                              Complete
                            </button>
                          )}
                          {!isEnrolled && (
                            <Lock size={14} style={{ color: 'var(--text-muted)', opacity: 0.4 }} />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </motion.div>
          ) : view === 'certs' ? (
            <motion.div key="certs" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {certs.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {certs.map(c => <CertificateBadge key={c.id} cert={c} />)}
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
                const total = cls.lesson_count || cls.lessons?.length || 0;
                return (
                  <motion.div key={cls.id}
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className="glass-card overflow-hidden cursor-pointer"
                    onClick={() => openClass(cls.id)}
                    data-testid={`class-${cls.id}`}>
                    <div className="relative h-40">
                      <img src={cls.thumbnail} alt={cls.title} className="w-full h-full object-cover" style={{ filter: 'brightness(0.6)' }} />
                      <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(11,12,21,0.9), transparent 60%)' }} />
                      <div className="absolute bottom-3 left-4 right-4">
                        <h3 className="text-lg font-light" style={{ fontFamily: 'Cormorant Garamond, serif', color: 'var(--text-primary)' }}>{cls.title}</h3>
                      </div>
                      {enrollment?.certified && (
                        <div className="absolute top-3 right-3">
                          <Award size={20} style={{ color: '#FCD34D', filter: 'drop-shadow(0 0 6px rgba(252,211,77,0.5))' }} />
                        </div>
                      )}
                    </div>
                    <div className="p-5">
                      <p className="text-xs mb-3" style={{ color: 'var(--text-secondary)' }}>{cls.description?.substring(0, 100)}...</p>
                      <div className="flex items-center justify-between text-xs" style={{ color: 'var(--text-muted)' }}>
                        <span>{cls.instructor}</span>
                        <span>{total} lessons</span>
                      </div>
                      {enrollment && (
                        <div className="mt-3 h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                          <div className="h-full rounded-full" style={{ width: `${Math.round((completed / total) * 100)}%`, background: enrollment.certified ? '#FCD34D' : '#2DD4BF' }} />
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
                  <p className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>Browse the catalog and enroll in a class to begin your journey.</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
