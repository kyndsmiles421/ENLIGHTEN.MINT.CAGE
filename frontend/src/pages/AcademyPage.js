import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Award, Castle, Flame, Microscope, Waves, CheckCircle, Clock, Lock, Zap, ChevronRight, Trophy, Beaker } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useModality } from '../context/ModalityContext';

const API = process.env.REACT_APP_BACKEND_URL;

const MODALITY_ICONS = {
  architect: Castle,
  chef: Flame,
  researcher: Microscope,
  voyager: Waves,
};

const TYPE_ICONS = {
  lesson: BookOpen,
  lab: Beaker,
  test: Trophy,
};

export default function AcademyPage() {
  const { token, authHeaders } = useAuth();
  const { modality, modalityData, switchModality } = useModality();
  const [programs, setPrograms] = useState([]);
  const [accreditation, setAccreditation] = useState(null);
  const [activeModule, setActiveModule] = useState(null);
  const [forgeData, setForgeData] = useState(null);
  const [completing, setCompleting] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchPrograms = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API}/api/academy/programs`, { headers: authHeaders });
      const data = await res.json();
      setPrograms(data.programs || []);
    } catch {}
  }, [token, authHeaders]);

  const fetchAccreditation = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API}/api/academy/accreditation`, { headers: authHeaders });
      const data = await res.json();
      setAccreditation(data);
    } catch {}
  }, [token, authHeaders]);

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchPrograms(), fetchAccreditation()]).then(() => setLoading(false));
  }, [fetchPrograms, fetchAccreditation]);

  // Refetch when modality changes
  useEffect(() => { fetchPrograms(); }, [modality, fetchPrograms]);

  const beginModule = async (programId, moduleId) => {
    try {
      const res = await fetch(`${API}/api/academy/begin`, {
        method: 'POST',
        headers: { ...authHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({ program_id: programId, module_id: moduleId }),
      });
      const data = await res.json();
      setActiveModule({ programId, moduleId, ...data });

      // If it's a lab or test, fetch forge data
      if (data.module?.type === 'lab' || data.module?.type === 'test') {
        const forgeRes = await fetch(`${API}/api/academy/forge/${programId}/${moduleId}`, {
          headers: authHeaders,
        });
        const fd = await forgeRes.json();
        setForgeData(fd);
      }
    } catch {}
  };

  const completeModule = async () => {
    if (!activeModule) return;
    setCompleting(true);
    try {
      const res = await fetch(`${API}/api/academy/complete`, {
        method: 'POST',
        headers: { ...authHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          program_id: activeModule.programId,
          module_id: activeModule.moduleId,
          focus_minutes: activeModule.module?.duration_min || 15,
        }),
      });
      const data = await res.json();
      setActiveModule(prev => ({ ...prev, result: data }));
      fetchPrograms();
      fetchAccreditation();
    } catch {}
    setCompleting(false);
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0B0C15' }}>
        <p className="text-sm" style={{ color: 'rgba(248,250,252,0.3)' }}>Sign in to access the Academy</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-6 max-w-4xl mx-auto" style={{ background: '#0B0C15' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold" style={{ color: '#F8FAFC' }} data-testid="academy-title">
            Academy
          </h1>
          <p className="text-xs mt-0.5" style={{ color: 'rgba(248,250,252,0.3)' }}>
            Omni-Modality Learning & Accreditation
          </p>
        </div>
        {accreditation?.mastery_level && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full" style={{
            background: `${accreditation.mastery_level.color}10`,
            border: `1px solid ${accreditation.mastery_level.color}25`,
          }} data-testid="mastery-badge">
            <Award size={14} style={{ color: accreditation.mastery_level.color }} />
            <span className="text-xs font-medium" style={{ color: accreditation.mastery_level.color }}>
              {accreditation.mastery_level.tier}
            </span>
          </div>
        )}
      </div>

      {/* Modality Switch */}
      <div className="mb-6" data-testid="modality-switch">
        <div className="text-[9px] uppercase tracking-wider mb-2" style={{ color: 'rgba(248,250,252,0.25)' }}>
          Learning Framework
        </div>
        <div className="grid grid-cols-4 gap-1.5">
          {['architect', 'chef', 'researcher', 'voyager'].map(mid => {
            const Icon = MODALITY_ICONS[mid];
            const active = modality === mid;
            const colors = { architect: '#FBBF24', chef: '#EF4444', researcher: '#3B82F6', voyager: '#C084FC' };
            const labels = { architect: 'Architect', chef: 'Chef', researcher: 'Researcher', voyager: 'Voyager' };
            return (
              <motion.button
                key={mid}
                whileTap={{ scale: 0.95 }}
                onClick={() => switchModality(mid)}
                className="flex flex-col items-center gap-1.5 py-3 rounded-xl transition-all"
                style={{
                  background: active ? `${colors[mid]}10` : 'rgba(255,255,255,0.02)',
                  border: `1px solid ${active ? `${colors[mid]}25` : 'rgba(255,255,255,0.04)'}`,
                  cursor: 'pointer',
                }}
                data-testid={`modality-${mid}`}
              >
                <Icon size={18} style={{ color: active ? colors[mid] : 'rgba(248,250,252,0.25)' }} />
                <span className="text-[9px] font-medium" style={{ color: active ? colors[mid] : 'rgba(248,250,252,0.35)' }}>
                  {labels[mid]}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Accreditation Stats */}
      {accreditation && (
        <div className="grid grid-cols-4 gap-2 mb-6">
          {[
            { label: 'Resonance', value: accreditation.resonance_score, color: '#C084FC' },
            { label: 'Focus Time', value: `${accreditation.total_focus_minutes}m`, color: '#3B82F6' },
            { label: 'Modules', value: accreditation.modules_completed, color: '#22C55E' },
            { label: 'Certs', value: accreditation.programs_completed, color: '#FBBF24' },
          ].map(s => (
            <div key={s.label} className="rounded-xl p-2.5 text-center" style={{
              background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)',
            }}>
              <div className="text-sm font-semibold" style={{ color: s.color }}>{s.value}</div>
              <div className="text-[7px] uppercase" style={{ color: 'rgba(248,250,252,0.25)' }}>{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Programs */}
      <div className="space-y-4">
        {programs.map(prog => (
          <div key={prog.id} className="rounded-xl overflow-hidden" style={{
            background: 'rgba(255,255,255,0.02)',
            border: `1px solid ${prog.completed ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.04)'}`,
          }} data-testid={`program-${prog.id}`}>
            {/* Program Header */}
            <div className="px-4 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium" style={{ color: '#F8FAFC' }}>{prog.name}</h3>
                  <p className="text-[10px] mt-0.5" style={{ color: 'rgba(248,250,252,0.3)' }}>{prog.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-12 h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
                    <div className="h-full rounded-full" style={{
                      width: `${prog.progress * 100}%`,
                      background: prog.completed ? '#22C55E' : '#C084FC',
                    }} />
                  </div>
                  <span className="text-[9px]" style={{ color: prog.completed ? '#22C55E' : 'rgba(248,250,252,0.3)' }}>
                    {(prog.progress * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
            </div>

            {/* Modules */}
            <div className="px-3 py-2 space-y-1">
              {prog.modules.map((mod, mi) => {
                const Icon = TYPE_ICONS[mod.type] || BookOpen;
                const skinColor = modalityData?.color || '#C084FC';
                return (
                  <motion.button
                    key={mod.id}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => !mod.completed && beginModule(prog.id, mod.id)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-left"
                    style={{
                      background: mod.completed ? 'rgba(34,197,94,0.04)' : 'rgba(255,255,255,0.02)',
                      border: `1px solid ${mod.completed ? 'rgba(34,197,94,0.08)' : 'rgba(255,255,255,0.03)'}`,
                      cursor: mod.completed ? 'default' : 'pointer',
                      opacity: mod.completed ? 0.7 : 1,
                    }}
                    data-testid={`module-${mod.id}`}
                  >
                    <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{
                      background: mod.completed ? 'rgba(34,197,94,0.1)' : `${skinColor}08`,
                    }}>
                      {mod.completed
                        ? <CheckCircle size={12} style={{ color: '#22C55E' }} />
                        : <Icon size={12} style={{ color: skinColor }} />
                      }
                    </div>
                    <div className="flex-1">
                      <div className="text-[10px] font-medium" style={{ color: mod.completed ? '#22C55E' : '#F8FAFC' }}>
                        {mod.title}
                      </div>
                      <div className="text-[8px] flex items-center gap-2 mt-0.5" style={{ color: 'rgba(248,250,252,0.25)' }}>
                        <span>{mod.display_label}</span>
                        <Clock size={7} /> <span>{mod.duration_min}m</span>
                        <span>Complexity: {(mod.complexity * 100).toFixed(0)}%</span>
                      </div>
                    </div>
                    {!mod.completed && <ChevronRight size={12} style={{ color: 'rgba(248,250,252,0.15)' }} />}
                  </motion.button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Active Module / Forge Lab Modal */}
      <AnimatePresence>
        {activeModule && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center px-4"
            style={{ background: 'rgba(0,0,0,0.8)' }}
            data-testid="forge-lab-modal"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="rounded-2xl p-6 max-w-md w-full"
              style={{ background: '#0B0C15', border: '1px solid rgba(192,132,252,0.15)' }}
            >
              {!activeModule.result ? (
                <>
                  <div className="flex items-center gap-2 mb-4">
                    <Beaker size={18} style={{ color: modalityData?.color || '#C084FC' }} />
                    <h2 className="text-sm font-semibold" style={{ color: '#F8FAFC' }}>
                      {activeModule.module?.type === 'lab' ? (modalityData?.lab_label || 'Lab') :
                       activeModule.module?.type === 'test' ? (modalityData?.test_label || 'Test') :
                       (modalityData?.lesson_label || 'Lesson')}
                    </h2>
                  </div>

                  <h3 className="text-base font-medium mb-2" style={{ color: '#F8FAFC' }}>
                    {activeModule.module?.title}
                  </h3>

                  <p className="text-xs mb-4" style={{ color: 'rgba(248,250,252,0.4)' }}>
                    Duration: {activeModule.module?.duration_min} min | Complexity: {((activeModule.module?.complexity || 0) * 100).toFixed(0)}%
                  </p>

                  {/* Forge Lab H² Status */}
                  {forgeData?.simulation && (
                    <div className="rounded-xl p-3 mb-4" style={{
                      background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)',
                    }}>
                      <div className="text-[8px] uppercase tracking-wider mb-2" style={{ color: 'rgba(248,250,252,0.25)' }}>
                        Forge Validation
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 rounded-full" style={{
                            background: forgeData.simulation.h2_state.determinant_positive ? '#22C55E' : '#EF4444',
                          }} />
                          <span className="text-[9px]" style={{
                            color: forgeData.simulation.h2_state.determinant_positive ? '#22C55E' : '#EF4444',
                          }}>
                            Determinant: {forgeData.simulation.h2_state.determinant_positive ? 'Positive' : 'Negative'}
                          </span>
                        </div>
                        <span className="text-[9px]" style={{ color: '#818CF8' }}>
                          Alignment: {(forgeData.simulation.h2_state.alignment * 100).toFixed(0)}%
                        </span>
                      </div>
                      <p className="text-[8px] mt-1.5" style={{ color: 'rgba(248,250,252,0.2)' }}>
                        {forgeData.simulation.validation_rule}
                      </p>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={() => { setActiveModule(null); setForgeData(null); }}
                      className="flex-1 py-2.5 rounded-xl text-xs"
                      style={{
                        background: 'rgba(255,255,255,0.03)', color: 'rgba(248,250,252,0.4)',
                        border: '1px solid rgba(255,255,255,0.06)', cursor: 'pointer',
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={completeModule}
                      disabled={completing}
                      className="flex-1 py-2.5 rounded-xl text-xs font-medium"
                      style={{
                        background: `${modalityData?.color || '#C084FC'}15`,
                        color: modalityData?.color || '#C084FC',
                        border: `1px solid ${modalityData?.color || '#C084FC'}25`,
                        cursor: completing ? 'wait' : 'pointer',
                        opacity: completing ? 0.5 : 1,
                      }}
                      data-testid="complete-module-btn"
                    >
                      {completing ? 'Validating...' : 'Complete Module'}
                    </button>
                  </div>
                </>
              ) : (
                /* Result Screen */
                <div className="text-center">
                  {activeModule.result.status === 'completed' ? (
                    <>
                      <CheckCircle size={32} style={{ color: '#22C55E', margin: '0 auto 12px' }} />
                      <h3 className="text-sm font-semibold mb-1" style={{ color: '#22C55E' }}>Module Complete</h3>
                      <div className="grid grid-cols-3 gap-2 my-4">
                        <div className="rounded-lg p-2" style={{ background: 'rgba(192,132,252,0.05)' }}>
                          <div className="text-sm font-semibold" style={{ color: '#C084FC' }}>{activeModule.result.resonance_points}</div>
                          <div className="text-[7px]" style={{ color: 'rgba(248,250,252,0.25)' }}>Resonance</div>
                        </div>
                        <div className="rounded-lg p-2" style={{ background: 'rgba(251,191,36,0.05)' }}>
                          <div className="text-sm font-semibold" style={{ color: '#FBBF24' }}>+{activeModule.result.dust_earned}</div>
                          <div className="text-[7px]" style={{ color: 'rgba(248,250,252,0.25)' }}>Dust</div>
                        </div>
                        <div className="rounded-lg p-2" style={{ background: 'rgba(59,130,246,0.05)' }}>
                          <div className="text-sm font-semibold" style={{ color: '#3B82F6' }}>{activeModule.result.weighted_focus_time}m</div>
                          <div className="text-[7px]" style={{ color: 'rgba(248,250,252,0.25)' }}>Focus</div>
                        </div>
                      </div>

                      {/* Certification Issued */}
                      {activeModule.result.certification && (
                        <div className="rounded-xl p-3 mt-3 mb-4" style={{
                          background: 'rgba(251,191,36,0.05)', border: '1px solid rgba(251,191,36,0.15)',
                        }} data-testid="cert-issued">
                          <Award size={20} style={{ color: '#FBBF24', margin: '0 auto 6px' }} />
                          <p className="text-xs font-semibold" style={{ color: '#FBBF24' }}>Fractal Certificate Issued</p>
                          <p className="text-[9px] font-mono mt-1" style={{ color: '#FBBF24' }}>
                            {activeModule.result.certification.fractal_fingerprint}
                          </p>
                          <p className="text-[8px] mt-1" style={{ color: 'rgba(248,250,252,0.3)' }}>
                            {activeModule.result.certification.program_name}
                          </p>
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      <Lock size={32} style={{ color: '#EF4444', margin: '0 auto 12px' }} />
                      <h3 className="text-sm font-semibold mb-1" style={{ color: '#EF4444' }}>Validation Failed</h3>
                      <p className="text-xs mb-3" style={{ color: 'rgba(248,250,252,0.4)' }}>
                        {activeModule.result.reason}
                      </p>
                      {activeModule.result.hint && (
                        <p className="text-[9px] px-3 py-2 rounded-lg mb-3" style={{
                          background: 'rgba(251,191,36,0.05)', color: '#FBBF24',
                        }}>
                          {activeModule.result.hint}
                        </p>
                      )}
                    </>
                  )}

                  <button
                    onClick={() => { setActiveModule(null); setForgeData(null); }}
                    className="mt-2 px-6 py-2 rounded-xl text-xs"
                    style={{
                      background: 'rgba(255,255,255,0.05)', color: 'rgba(248,250,252,0.5)',
                      border: '1px solid rgba(255,255,255,0.06)', cursor: 'pointer',
                    }}
                    data-testid="close-result-btn"
                  >
                    Continue
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Certifications */}
      {accreditation?.certifications?.length > 0 && (
        <div className="mt-6 rounded-xl p-4" style={{
          background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)',
        }}>
          <div className="flex items-center gap-2 mb-3">
            <Award size={14} style={{ color: '#FBBF24' }} />
            <span className="text-xs font-medium" style={{ color: '#F8FAFC' }}>Fractal Certifications</span>
          </div>
          <div className="space-y-2">
            {accreditation.certifications.map(cert => (
              <div key={cert.id} className="flex items-center justify-between px-3 py-2 rounded-lg" style={{
                background: 'rgba(251,191,36,0.03)', border: '1px solid rgba(251,191,36,0.06)',
              }} data-testid={`cert-${cert.program_id}`}>
                <div>
                  <div className="text-[10px] font-medium" style={{ color: '#FBBF24' }}>{cert.program_name}</div>
                  <div className="text-[8px] font-mono" style={{ color: 'rgba(248,250,252,0.3)' }}>
                    {cert.fractal_fingerprint}
                  </div>
                </div>
                <div className="text-[8px]" style={{ color: 'rgba(248,250,252,0.2)' }}>
                  {new Date(cert.issued_at).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
