import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSovereign } from '../context/SovereignContext';
import axios from 'axios';
import { toast } from 'sonner';
import {
  ArrowLeft, Award, CheckCircle, Lock, ChevronRight,
  Sparkles, Coffee, Code, Zap, Shield, Star,
  BookOpen, Loader2, ExternalLink,
} from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const AVENUE_ICONS = { sparkles: Sparkles, coffee: Coffee, code: Code };

// ━━━ Tier Progress Ring (SVG) ━━━
function TierRing({ tier, maxTier, color, size = 100 }) {
  const radius = (size - 10) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = tier / maxTier;
  const offset = circumference * (1 - progress);

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle cx={size / 2} cy={size / 2} r={radius}
        fill="none" stroke="rgba(248,250,252,0.04)" strokeWidth="4" />
      <motion.circle cx={size / 2} cy={size / 2} r={radius}
        fill="none" stroke={color} strokeWidth="4" strokeLinecap="round"
        strokeDasharray={circumference} strokeDashoffset={offset}
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1.5, ease: 'easeOut' }}
        style={{ filter: `drop-shadow(0 0 6px ${color}40)` }} />
    </svg>
  );
}

// ━━━ Certificate Card ━━━
function CertificateCard({ cert }) {
  return (
    <motion.div className="rounded-xl p-4 relative overflow-hidden"
      style={{
        background: `${cert.color}06`,
        border: `1px solid ${cert.color}20`,
      }}
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      data-testid={`certificate-${cert.id}`}>
      <motion.div className="absolute inset-0 pointer-events-none"
        style={{ background: `linear-gradient(135deg, ${cert.color}05 0%, transparent 50%)` }} />
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-2">
          <Award size={16} style={{ color: cert.color }} />
          <span className="text-[6px] font-mono px-2 py-0.5 rounded-full"
            style={{ background: 'rgba(248,250,252,0.03)', color: 'rgba(255,255,255,0.6)' }}>
            {cert.verification_code}
          </span>
        </div>
        <p className="text-[11px] font-semibold mb-0.5" style={{ color: '#F8FAFC' }}>
          {cert.certificate_title}
        </p>
        <p className="text-[8px]" style={{ color: `${cert.color}80` }}>{cert.avenue_name}</p>
        <div className="flex items-center justify-between mt-2">
          <span className="text-[7px]" style={{ color: 'rgba(255,255,255,0.6)' }}>
            {new Date(cert.issued_at).toLocaleDateString()}
          </span>
          <span className="text-[7px] font-mono" style={{ color: '#22C55E' }}>
            {cert.total_xp} XP
          </span>
        </div>
      </div>
    </motion.div>
  );
}

// ━━━ Avenue Curriculum Card ━━━
function AvenueCard({ avenue, onCompleteLesson, completing }) {
  const [expanded, setExpanded] = useState(false);
  const AvIcon = AVENUE_ICONS[avenue.icon] || BookOpen;
  const pct = avenue.progress_pct || 0;

  return (
    <motion.div className="rounded-xl overflow-hidden"
      style={{
        background: `${avenue.color}04`,
        border: `1px solid ${avenue.color}${avenue.certified ? '30' : '12'}`,
      }}
      initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      data-testid={`avenue-card-${avenue.id}`}>

      {avenue.certified && (
        <motion.div className="absolute inset-0 rounded-xl pointer-events-none"
          style={{ boxShadow: `inset 0 0 20px ${avenue.color}08` }}
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 3, repeat: Infinity }} />
      )}

      <button className="w-full p-4 flex items-center gap-3 text-left cursor-pointer"
        onClick={() => setExpanded(!expanded)} data-testid={`avenue-toggle-${avenue.id}`}>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: `${avenue.color}12`, border: `1px solid ${avenue.color}20` }}>
          <AvIcon size={16} style={{ color: avenue.color }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-[11px] font-semibold" style={{ color: '#F8FAFC' }}>{avenue.name}</p>
            {avenue.certified && <CheckCircle size={12} style={{ color: '#22C55E' }} />}
          </div>
          <p className="text-[8px] mt-0.5" style={{ color: 'rgba(255,255,255,0.65)' }}>
            {avenue.certificate_title}
          </p>
          <div className="flex items-center gap-2 mt-1.5">
            <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: 'rgba(248,250,252,0.04)' }}>
              <motion.div className="h-full rounded-full"
                style={{ background: avenue.color, width: `${pct}%` }}
                initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                transition={{ duration: 1, ease: 'easeOut' }} />
            </div>
            <span className="text-[7px] font-mono" style={{ color: avenue.color }}>{pct}%</span>
            <span className="text-[6px]" style={{ color: 'rgba(248,250,252,0.15)' }}>{avenue.earned_xp} XP</span>
          </div>
        </div>
        <ChevronRight size={14} style={{
          color: 'rgba(248,250,252,0.15)',
          transform: expanded ? 'rotate(90deg)' : 'none',
          transition: 'transform 0.2s',
        }} />
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div className="px-4 pb-4 space-y-1.5"
            initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}>
            <p className="text-[8px] mb-2" style={{ color: 'rgba(255,255,255,0.6)' }}>
              {avenue.description}
            </p>
            {avenue.curriculum.map((lesson, i) => {
              const done = (avenue.completed_lessons || []).includes(lesson.id);
              const prevDone = i === 0 || (avenue.completed_lessons || []).includes(avenue.curriculum[i - 1].id);
              const locked = !prevDone && !done;
              return (
                <div key={lesson.id}
                  className="flex items-center gap-2 p-2 rounded-lg"
                  style={{
                    background: done ? `${avenue.color}06` : 'rgba(248,250,252,0.01)',
                    border: `1px solid ${done ? `${avenue.color}15` : 'rgba(248,250,252,0.03)'}`,
                    opacity: locked ? 0.4 : 1,
                  }}
                  data-testid={`lesson-${lesson.id}`}>
                  <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: done ? `${avenue.color}15` : 'rgba(248,250,252,0.03)' }}>
                    {done ? <CheckCircle size={10} style={{ color: '#22C55E' }} />
                      : locked ? <Lock size={10} style={{ color: 'rgba(248,250,252,0.15)' }} />
                      : <span className="text-[8px] font-mono" style={{ color: avenue.color }}>{i + 1}</span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[9px] font-medium" style={{ color: done ? 'rgba(255,255,255,0.75)' : '#F8FAFC' }}>
                      {lesson.title}
                    </p>
                    <p className="text-[7px]" style={{ color: 'rgba(255,255,255,0.6)' }}>{lesson.description}</p>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <span className="text-[7px] font-mono" style={{ color: `${avenue.color}60` }}>{lesson.xp} XP</span>
                    {!done && !locked && (
                      <motion.button
                        className="px-2 py-0.5 rounded-lg text-[7px] font-medium cursor-pointer"
                        style={{ background: `${avenue.color}12`, color: avenue.color, border: `1px solid ${avenue.color}20` }}
                        whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                        onClick={() => onCompleteLesson(avenue.id, lesson.id)}
                        disabled={completing}
                        data-testid={`complete-${lesson.id}`}>
                        {completing ? <Loader2 size={8} className="animate-spin" /> : 'Complete'}
                      </motion.button>
                    )}
                  </div>
                </div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ━━━ MASTERY PATH PAGE ━━━
export default function MasteryPath() {
  const navigate = useNavigate();
  const { authHeaders, token, loading: authLoading } = useAuth();
  const { publishEvent } = useSovereign();

  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const [tab, setTab] = useState('overview'); // overview | avenues | certificates

  const load = useCallback(async () => {
    if (authLoading || !token) return;
    try {
      const res = await axios.get(`${API}/sovereign-mastery/status`, { headers: authHeaders });
      setStatus(res.data);
    } catch {} finally { setLoading(false); }
  }, [authHeaders, authLoading, token]);

  useEffect(() => { load(); }, [load]);

  const handleCompleteLesson = useCallback(async (avenueId, lessonId) => {
    setCompleting(true);
    try {
      const res = await axios.post(`${API}/sovereign-mastery/record`, {
        action: 'lesson_complete', avenue_id: avenueId, lesson_id: lessonId,
      }, { headers: authHeaders });
      toast.success(res.data.detail);
      if (res.data.tier_advanced) {
        toast.success(`Tier Advanced: ${res.data.tier_info?.name}`, { duration: 5000 });
        publishEvent('mastery_tier_advanced', { tier: res.data.current_tier });
      }
      load();
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Failed');
    } finally { setCompleting(false); }
  }, [authHeaders, load, publishEvent]);

  const handleCoreOrientation = useCallback(async () => {
    try {
      const res = await axios.post(`${API}/sovereign-mastery/record`, {
        action: 'core_orientation',
      }, { headers: authHeaders });
      toast.success(res.data.detail);
      if (res.data.tier_advanced) {
        toast.success(`Welcome, ${res.data.tier_info?.name}!`, { duration: 5000 });
      }
      load();
    } catch (e) { toast.error(e.response?.data?.detail || 'Failed'); }
  }, [authHeaders, load]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center" style={{ background: '#06060e' }}>
      <Loader2 size={24} className="animate-spin" style={{ color: 'rgba(248,250,252,0.15)' }} />
    </div>;
  }

  const tier = status?.current_tier || 0;
  const tierInfo = status?.tier_info;
  const nextTier = status?.next_tier;
  const nextReq = status?.next_requirement;
  const tierColor = tierInfo?.color || '#94A3B8';
  const avenues = status?.avenues || {};
  const certs = status?.certificates || [];

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#06060e' }} data-testid="mastery-path-page">

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b"
        style={{ borderColor: 'rgba(248,250,252,0.05)', background: 'rgba(6,6,14,0.96)', backdropFilter: 'none'}}>
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/hub')} className="p-1.5 rounded-lg"
            style={{ background: 'rgba(248,250,252,0.03)' }} data-testid="mastery-back-btn">
            <ArrowLeft size={13} style={{ color: 'rgba(255,255,255,0.65)' }} />
          </button>
          <div>
            <h1 className="text-sm font-light tracking-[0.15em] uppercase"
              style={{ color: 'rgba(255,255,255,0.65)', fontFamily: 'Cormorant Garamond, serif' }}>
              Sovereign Mastery
            </h1>
            {tierInfo && (
              <span className="text-[7px] px-2 py-0.5 rounded-full font-medium"
                style={{ background: `${tierColor}12`, color: tierColor, border: `1px solid ${tierColor}20` }}>
                Tier {tier}: {tierInfo.name}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[8px] font-mono" style={{ color: 'rgba(255,255,255,0.6)' }}>
            {status?.total_xp || 0} XP
          </span>
          <span className="text-[7px] font-mono px-1.5 py-0.5 rounded"
            style={{ background: 'rgba(34,197,94,0.08)', color: '#22C55E' }}>
            {certs.length} Cert{certs.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 px-4 py-2 border-b" style={{ borderColor: 'rgba(248,250,252,0.03)' }}>
        {['overview', 'avenues', 'certificates'].map(t => (
          <button key={t}
            className="px-3 py-1 rounded-lg text-[8px] tracking-wider uppercase cursor-pointer"
            style={{
              background: tab === t ? `${tierColor}10` : 'transparent',
              color: tab === t ? tierColor : 'rgba(255,255,255,0.6)',
              border: `1px solid ${tab === t ? `${tierColor}20` : 'transparent'}`,
            }}
            onClick={() => setTab(t)} data-testid={`mastery-tab-${t}`}>
            {t}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {tab === 'overview' && (
          <div className="space-y-4">
            {/* Tier Progress */}
            <div className="flex items-center gap-6 p-5 rounded-2xl"
              style={{ background: 'rgba(248,250,252,0.015)', border: '1px solid rgba(248,250,252,0.04)' }}
              data-testid="tier-overview">
              <div className="relative">
                <TierRing tier={tier} maxTier={4} color={tierColor} size={90} />
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <p className="text-lg font-bold" style={{ color: tierColor }}>{tier}</p>
                  <p className="text-[5px] uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.6)' }}>of 4</p>
                </div>
              </div>
              <div className="flex-1">
                <p className="text-[12px] font-semibold" style={{ color: '#F8FAFC' }}>
                  {tier > 0 ? tierInfo?.name : 'Unranked'}
                </p>
                {tier > 0 && <p className="text-[8px] mt-0.5" style={{ color: `${tierColor}80` }}>{tierInfo?.codename}</p>}
                <p className="text-[8px] mt-1" style={{ color: 'rgba(255,255,255,0.6)' }}>
                  {tier > 0 ? tierInfo?.reward : 'Complete Core Orientation to begin your path'}
                </p>

                {/* Next requirement */}
                {nextReq && (
                  <div className="mt-3 p-2 rounded-lg" style={{ background: 'rgba(248,250,252,0.02)', border: '1px solid rgba(248,250,252,0.04)' }}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[7px] uppercase tracking-wider" style={{ color: nextTier?.color || 'rgba(255,255,255,0.6)' }}>
                        Next: {nextTier?.name || 'Max'}
                      </span>
                      <span className="text-[7px] font-mono" style={{ color: 'rgba(255,255,255,0.65)' }}>
                        {nextReq.current}/{nextReq.target}
                      </span>
                    </div>
                    <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(248,250,252,0.04)' }}>
                      <div className="h-full rounded-full" style={{
                        width: `${Math.min(100, (nextReq.current / nextReq.target) * 100)}%`,
                        background: nextTier?.color || '#94A3B8',
                      }} />
                    </div>
                    <p className="text-[6px] mt-1" style={{ color: 'rgba(248,250,252,0.15)' }}>{nextReq.action}</p>
                  </div>
                )}

                {/* Core Orientation button for Tier 0 */}
                {tier === 0 && (
                  <motion.button className="mt-3 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[8px] font-medium cursor-pointer"
                    style={{ background: 'rgba(96,165,250,0.1)', border: '1px solid rgba(96,165,250,0.2)', color: '#60A5FA' }}
                    whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                    onClick={handleCoreOrientation} data-testid="core-orientation-btn">
                    <Zap size={10} /> Begin Core Orientation
                  </motion.button>
                )}
              </div>
            </div>

            {/* Weighted Authority */}
            <div className="p-4 rounded-xl" style={{ background: 'rgba(248,250,252,0.01)', border: '1px solid rgba(248,250,252,0.04)' }}
              data-testid="weighted-authority">
              <p className="text-[8px] tracking-wider uppercase mb-2" style={{ color: 'rgba(248,250,252,0.15)' }}>
                Weighted Authority
              </p>
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2 rounded-lg" style={{ background: 'rgba(248,250,252,0.015)' }}>
                  <p className="text-[7px] uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.6)' }}>Gravity</p>
                  <p className="text-[14px] font-mono font-bold" style={{ color: tierColor }}>
                    {status?.gravity_multiplier?.toFixed(1) || '1.0'}x
                  </p>
                </div>
                <div className="p-2 rounded-lg" style={{ background: 'rgba(248,250,252,0.015)' }}>
                  <p className="text-[7px] uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.6)' }}>Bloom</p>
                  <p className="text-[14px] font-mono font-bold" style={{ color: tierColor }}>
                    {status?.bloom_multiplier?.toFixed(1) || '1.0'}x
                  </p>
                </div>
              </div>
            </div>

            {/* 4-Tier Scale */}
            <div className="space-y-1.5" data-testid="tier-scale">
              {(status?.all_tiers || []).map((t, i) => {
                const isActive = i + 1 === tier;
                const isLocked = i + 1 > tier;
                return (
                  <div key={t.tier} className="flex items-center gap-3 p-3 rounded-xl"
                    style={{
                      background: isActive ? `${t.color}08` : 'rgba(248,250,252,0.01)',
                      border: `1px solid ${isActive ? `${t.color}20` : 'rgba(248,250,252,0.03)'}`,
                      opacity: isLocked ? 0.4 : 1,
                    }}
                    data-testid={`tier-row-${t.tier}`}>
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ background: `${t.color}12` }}>
                      {isLocked ? <Lock size={12} style={{ color: 'rgba(255,255,255,0.6)' }} />
                        : isActive ? <Star size={12} style={{ color: t.color }} />
                        : <CheckCircle size={12} style={{ color: '#22C55E' }} />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[7px] font-mono" style={{ color: t.color }}>T{t.tier}</span>
                        <p className="text-[9px] font-medium" style={{ color: isActive ? '#F8FAFC' : 'rgba(255,255,255,0.7)' }}>
                          {t.name}
                        </p>
                      </div>
                      <p className="text-[7px] mt-0.5" style={{ color: 'rgba(255,255,255,0.6)' }}>{t.requirement}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[7px]" style={{ color: isLocked ? 'rgba(248,250,252,0.1)' : `${t.color}60` }}>
                        {t.reward}
                      </p>
                      <p className="text-[6px] font-mono mt-0.5" style={{ color: 'rgba(248,250,252,0.1)' }}>
                        Gravity {t.gravity_multiplier}x
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {tab === 'avenues' && (
          <div className="space-y-3">
            <p className="text-[8px] tracking-wider uppercase mb-1" style={{ color: 'rgba(248,250,252,0.15)' }}>
              Avenue Curricula — Complete all lessons to earn certification
            </p>
            {Object.values(avenues).map(av => (
              <AvenueCard key={av.id} avenue={av}
                onCompleteLesson={handleCompleteLesson} completing={completing} />
            ))}
          </div>
        )}

        {tab === 'certificates' && (
          <div className="space-y-3">
            <p className="text-[8px] tracking-wider uppercase mb-1" style={{ color: 'rgba(248,250,252,0.15)' }}>
              Earned Certificates — Digital proof of mastery
            </p>
            {certs.length === 0 ? (
              <div className="text-center py-12">
                <Shield size={24} style={{ color: 'rgba(248,250,252,0.06)' }} className="mx-auto" />
                <p className="text-[10px] mt-3" style={{ color: 'rgba(248,250,252,0.15)' }}>No certificates yet</p>
                <p className="text-[8px] mt-1" style={{ color: 'rgba(248,250,252,0.08)' }}>
                  Complete an avenue curriculum to earn your first certificate
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {certs.map(c => <CertificateCard key={c.id} cert={c} />)}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
