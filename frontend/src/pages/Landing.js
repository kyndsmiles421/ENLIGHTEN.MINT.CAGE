import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import {
  Wind, Timer, Sun, Heart, BookOpen, Headphones, ArrowRight, Sparkles, Sunrise, Zap,
  Leaf, Radio, Users, Flame, Hand, Triangle, Play, GraduationCap, PenTool, Volume2,
  Lightbulb, Sprout, ChevronRight, Quote, MapPin, Mail, Shield, X,
  Brain, Battery, Moon, Frown, Target, Music, HeartHandshake, Map
} from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const FEATURES = [
  { icon: Wind, title: 'Breathing', desc: 'Guided breathwork to center your being', path: '/breathing', color: '#2DD4BF' },
  { icon: Timer, title: 'Meditation', desc: 'Timed sessions with ambient sound', path: '/meditation', color: '#D8B4FE' },
  { icon: Headphones, title: 'Soundscapes', desc: 'Layer ambient sounds into your sanctuary', path: '/soundscapes', color: '#38BDF8' },
  { icon: Lightbulb, title: 'Light Therapy', desc: 'Immersive chromotherapy color healing', path: '/light-therapy', color: '#A855F7' },
  { icon: Sprout, title: 'Zen Garden', desc: 'Nurture plants, feed koi, release lanterns', path: '/zen-garden', color: '#22C55E' },
  { icon: Radio, title: 'Frequencies', desc: 'Solfeggio & biometric healing tones', path: '/frequencies', color: '#8B5CF6' },
  { icon: Hand, title: 'Mudras', desc: 'Sacred hand gestures for healing', path: '/mudras', color: '#FDA4AF' },
  { icon: Triangle, title: 'Yantras', desc: 'Sacred geometric meditation diagrams', path: '/yantra', color: '#EF4444' },
  { icon: Flame, title: 'Tantra', desc: 'Expand consciousness through energy work', path: '/tantra', color: '#FCD34D' },
  { icon: Sparkles, title: 'Oracle', desc: 'Tarot, I Ching, astrology & divination', path: '/oracle', color: '#E879F9' },
  { icon: PenTool, title: 'Create', desc: 'Write your own meditations & affirmations', path: '/create', color: '#E879F9' },
  { icon: Zap, title: 'Exercises', desc: 'Qigong & Tai Chi energy cultivation', path: '/exercises', color: '#FB923C' },
  { icon: Sunrise, title: 'Daily Rituals', desc: 'Build your personalized daily practice', path: '/rituals', color: '#FCD34D' },
  { icon: Sun, title: 'Affirmations', desc: 'AI-powered mantras for your soul', path: '/affirmations', color: '#93C5FD' },
  { icon: Heart, title: 'Mood Tracker', desc: 'Map your emotional landscape', path: '/mood', color: '#F87171' },
  { icon: BookOpen, title: 'Journal', desc: 'Sacred space for your thoughts', path: '/journal', color: '#86EFAC' },
  { icon: Music, title: 'Mantras', desc: 'Sacred chanting for vibrational healing', path: '/mantras', color: '#FB923C' },
  { icon: HeartHandshake, title: "Ho'oponopono", desc: 'Hawaiian forgiveness practice', path: '/hooponopono', color: '#E879F9' },
  { icon: Map, title: 'Journey', desc: 'Guided beginner pathway', path: '/journey', color: '#2DD4BF' },
  { icon: GraduationCap, title: 'Learn', desc: 'Advanced progressive modules', path: '/learn', color: '#E879F9' },
  { icon: Users, title: 'Community', desc: 'Share, connect, and inspire others', path: '/community', color: '#FDA4AF' },
  { icon: Play, title: 'Videos', desc: 'Guided practices from masters', path: '/videos', color: '#2DD4BF' },
  { icon: Leaf, title: 'Nourishment', desc: 'Foods that uplift energy & spirit', path: '/nourishment', color: '#22C55E' },
];

const FEELINGS = [
  { id: 'happy', label: 'Happy', icon: Sparkles, color: '#FCD34D' },
  { id: 'peaceful', label: 'Peaceful', icon: Sun, color: '#2DD4BF' },
  { id: 'energized', label: 'Energized', icon: Zap, color: '#FB923C' },
  { id: 'grateful', label: 'Grateful', icon: Heart, color: '#FDA4AF' },
  { id: 'curious', label: 'Curious', icon: Target, color: '#8B5CF6' },
  { id: 'stressed', label: 'Stressed', icon: Brain, color: '#EF4444' },
  { id: 'anxious', label: 'Anxious', icon: Wind, color: '#FB923C' },
  { id: 'tired', label: 'Low Energy', icon: Battery, color: '#FCD34D' },
  { id: 'sad', label: 'Down', icon: Frown, color: '#3B82F6' },
  { id: 'unfocused', label: 'Unfocused', icon: Target, color: '#8B5CF6' },
  { id: 'restless', label: "Can't Sleep", icon: Moon, color: '#2DD4BF' },
];

const TESTIMONIALS = [
  { name: 'Steve R.', role: 'Beta Tester', text: "Noticed my focus doubled after using the 528Hz frequency during my morning coffee. It's like a reset button for my brain.", color: '#2DD4BF' },
  { name: 'Maya K.', role: 'Early Adopter', text: "The Zen Garden became my evening ritual. Releasing lanterns with my worries written on them — sounds silly, but it genuinely helps me sleep.", color: '#D8B4FE' },
  { name: 'James T.', role: 'Beta Tester', text: "Box breathing before meetings changed my entire work life. 4 seconds in, 4 hold, 4 out. Simple, but the guided tool makes it easy.", color: '#FCD34D' },
  { name: 'Priya S.', role: 'Beta Tester', text: "I was skeptical about mudras until I felt the actual tingling during Gyan Mudra. Combined with the frequency player — incredible.", color: '#FDA4AF' },
  { name: 'Alex M.', role: 'Early Adopter', text: "The Beginner's Journey walked me through everything without overwhelm. Now I have a daily practice that actually sticks.", color: '#86EFAC' },
  { name: 'Devon L.', role: 'Community Member', text: "Golden Milk recipe from the Nourishment section + 396Hz frequency = best sleep of my life. The science behind it makes sense.", color: '#FB923C' },
];

function FeatureCard({ feature, index }) {
  const navigate = useNavigate();
  const Icon = feature.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ delay: index * 0.03, duration: 0.5 }}
      onClick={() => navigate(feature.path)}
      className="glass-card glass-card-hover p-7 cursor-pointer group"
      data-testid={`feature-card-${feature.title.toLowerCase()}`}
    >
      <div className="flex items-start justify-between mb-5">
        <div className="w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-110"
          style={{ background: `${feature.color}12` }}>
          <Icon size={20} style={{ color: feature.color, transition: 'filter 0.3s' }} className="group-hover:drop-shadow-lg" />
        </div>
        <ArrowRight size={16} className="transition-all duration-300" style={{ color: 'rgba(255,255,255,0.1)' }} />
      </div>
      <h3 className="text-lg font-normal mb-1.5 transition-all duration-300" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
        {feature.title}
      </h3>
      <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{feature.desc}</p>
    </motion.div>
  );
}

/* ========== QUICK RESET MODAL ========== */
function QuickResetModal({ open, onClose }) {
  const navigate = useNavigate();
  const [feeling, setFeeling] = useState(null);
  const [flow, setFlow] = useState(null);
  const [loading, setLoading] = useState(false);

  const selectFeeling = async (f) => {
    setFeeling(f);
    setLoading(true);
    try {
      const res = await axios.get(`${API}/quick-reset/${f.id}`);
      setFlow(res.data);
    } catch {
      toast.error('Could not load reset flow');
    } finally {
      setLoading(false);
    }
  };

  const reset = () => { setFeeling(null); setFlow(null); };

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center px-4"
        style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(12px)' }}
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="glass-card w-full max-w-lg p-8 relative"
          data-testid="quick-reset-modal"
        >
          <button onClick={() => { onClose(); reset(); }} className="absolute top-4 right-4" style={{ color: 'var(--text-muted)' }}>
            <X size={18} />
          </button>

          {!feeling ? (
            <>
              <p className="text-xs font-bold uppercase tracking-[0.2em] mb-2" style={{ color: '#2DD4BF' }}>Quick Reset</p>
              <h2 className="text-2xl font-light mb-2" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                How are you feeling right now?
              </h2>
              <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
                We'll build a personalized 5-minute reset just for you.
              </p>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {FEELINGS.map(f => {
                  const Icon = f.icon;
                  return (
                    <button key={f.id} onClick={() => selectFeeling(f)}
                      className="glass-card p-3 flex flex-col items-center gap-1.5 hover:scale-[1.03] transition-all"
                      style={{ border: `1px solid ${f.color}15` }}
                      data-testid={`feeling-${f.id}`}>
                      <Icon size={20} style={{ color: f.color }} />
                      <span className="text-[10px] font-medium" style={{ color: 'var(--text-primary)' }}>{f.label}</span>
                    </button>
                  );
                })}
              </div>
            </>
          ) : loading ? (
            <div className="text-center py-12">
              <div className="w-10 h-10 rounded-full animate-pulse mx-auto mb-4" style={{ background: `${feeling.color}20` }} />
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Building your reset...</p>
            </div>
          ) : flow ? (
            <>
              <button onClick={reset} className="text-xs flex items-center gap-1 mb-4" style={{ color: 'var(--text-muted)' }}>
                <ChevronRight size={12} className="rotate-180" /> Change feeling
              </button>
              <p className="text-xs font-bold uppercase tracking-[0.2em] mb-1" style={{ color: feeling.color }}>
                Your 5-Minute Reset
              </p>
              <h2 className="text-xl font-light mb-6" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                Feeling {flow.label}? Try this:
              </h2>

              <div className="space-y-3">
                {/* Frequency */}
                <button onClick={() => { navigate(flow.frequency.path); onClose(); reset(); }}
                  className="w-full glass-card p-4 flex items-start gap-3 text-left hover:scale-[1.01] transition-all group"
                  data-testid="reset-frequency">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: `${feeling.color}12` }}>
                    <Radio size={16} style={{ color: feeling.color }} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{flow.frequency.name}</p>
                    <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-secondary)' }}>{flow.frequency.desc}</p>
                  </div>
                  <ChevronRight size={14} style={{ color: 'var(--text-muted)' }} className="mt-1 opacity-0 group-hover:opacity-100 transition-all" />
                </button>

                {/* Tool */}
                <button onClick={() => { navigate(flow.tool.path); onClose(); reset(); }}
                  className="w-full glass-card p-4 flex items-start gap-3 text-left hover:scale-[1.01] transition-all group"
                  data-testid="reset-tool">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(45,212,191,0.1)' }}>
                    <Wind size={16} style={{ color: '#2DD4BF' }} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{flow.tool.name}</p>
                    <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-secondary)' }}>{flow.tool.desc}</p>
                  </div>
                  <ChevronRight size={14} style={{ color: 'var(--text-muted)' }} className="mt-1 opacity-0 group-hover:opacity-100 transition-all" />
                </button>

                {/* Nourishment */}
                <button onClick={() => { navigate('/nourishment'); onClose(); reset(); }}
                  className="w-full glass-card p-4 flex items-start gap-3 text-left hover:scale-[1.01] transition-all group"
                  data-testid="reset-nourishment">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(34,197,94,0.1)' }}>
                    <Leaf size={16} style={{ color: '#22C55E' }} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{flow.nourishment.name}</p>
                    <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-secondary)' }}>{flow.nourishment.desc}</p>
                  </div>
                  <ChevronRight size={14} style={{ color: 'var(--text-muted)' }} className="mt-1 opacity-0 group-hover:opacity-100 transition-all" />
                </button>
              </div>
            </>
          ) : null}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

/* ========== WAITLIST SECTION ========== */
function WaitlistSection() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [status, setStatus] = useState(null);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    axios.get(`${API}/waitlist/count`).then(res => setCount(res.data.count)).catch(() => {});
  }, []);

  const join = async () => {
    if (!email.trim()) { toast.error('Please enter your email'); return; }
    setLoading(true);
    try {
      const res = await axios.post(`${API}/waitlist/join`, { email, name });
      setStatus(res.data);
      if (res.data.status === 'joined') setCount(res.data.position);
      toast.success(res.data.message);
    } catch {
      toast.error('Could not join waitlist');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative z-10 px-6 md:px-12 lg:px-24 py-24" data-testid="waitlist-section">
      <div className="max-w-3xl mx-auto text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <div className="flex items-center justify-center gap-2 mb-4">
            <MapPin size={14} style={{ color: '#FB923C' }} />
            <span className="text-xs font-bold uppercase tracking-[0.2em]" style={{ color: '#FB923C' }}>Coming Soon</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-light mb-4" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
            Bringing <span style={{ color: '#2DD4BF' }}>Positive Energy</span> to Your City
          </h2>
          <p className="text-sm md:text-base mb-2 max-w-lg mx-auto" style={{ color: 'var(--text-secondary)' }}>
            The Cosmic Collective Enlightenment Cafe — a physical sanctuary where frequencies, nourishment, and community converge. Opening Late 2026.
          </p>
          <p className="text-xs mb-8" style={{ color: 'var(--text-muted)' }}>
            Join the Founding 100 for exclusive updates, early access events, and mobile unit schedules.
          </p>

          {status?.status === 'joined' || status?.status === 'already_joined' ? (
            <div className="glass-card p-6 max-w-md mx-auto">
              <Sparkles size={24} style={{ color: '#FCD34D', margin: '0 auto 12px' }} />
              <p className="text-base font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                {status.status === 'joined' ? "You're in!" : "You're already on the list!"}
              </p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                {count > 0 ? `${count} souls and counting` : "Welcome to the founding crew"}
              </p>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                value={name} onChange={e => setName(e.target.value)}
                placeholder="Your name (optional)"
                className="input-glass text-sm flex-1"
                data-testid="waitlist-name"
              />
              <input
                value={email} onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com"
                type="email"
                className="input-glass text-sm flex-1"
                data-testid="waitlist-email"
              />
              <button onClick={join} disabled={loading}
                className="btn-glass px-6 flex items-center justify-center gap-2 text-sm whitespace-nowrap"
                style={{ background: 'rgba(45,212,191,0.1)', borderColor: 'rgba(45,212,191,0.2)', color: '#2DD4BF' }}
                data-testid="waitlist-join-btn">
                <Mail size={14} /> {loading ? 'Joining...' : 'Join Founding 100'}
              </button>
            </div>
          )}
          {count > 0 && !status && (
            <p className="text-[11px] mt-4" style={{ color: 'var(--text-muted)' }}>{count} already joined</p>
          )}
        </motion.div>
      </div>
    </div>
  );
}

/* ========== FOOTER ========== */
function Footer() {
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(false);

  return (
    <>
      <footer className="relative z-10 px-6 md:px-12 lg:px-24 py-12 border-t" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-full" style={{ background: 'radial-gradient(circle, rgba(192,132,252,0.6), rgba(124,58,237,0.2))' }} />
            <span className="text-sm font-light" style={{ fontFamily: 'Cormorant Garamond, serif', color: 'var(--text-secondary)' }}>
              The Cosmic Collective &copy; {new Date().getFullYear()}
            </span>
          </div>
          <div className="flex items-center gap-6">
            <button onClick={() => setShowPrivacy(true)} className="text-xs hover:underline" style={{ color: 'var(--text-muted)' }}
              data-testid="privacy-link">
              <Shield size={10} className="inline mr-1" /> Privacy Policy
            </button>
            <button onClick={() => setShowDisclaimer(true)} className="text-xs hover:underline" style={{ color: 'var(--text-muted)' }}
              data-testid="disclaimer-link">
              Wellness Disclaimer
            </button>
          </div>
        </div>
      </footer>

      {/* Privacy Modal */}
      <AnimatePresence>
        {showPrivacy && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center px-4"
            style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
            onClick={(e) => e.target === e.currentTarget && setShowPrivacy(false)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="glass-card w-full max-w-lg p-8 max-h-[80vh] overflow-y-auto relative">
              <button onClick={() => setShowPrivacy(false)} className="absolute top-4 right-4" style={{ color: 'var(--text-muted)' }}><X size={18} /></button>
              <Shield size={24} style={{ color: '#2DD4BF', marginBottom: 12 }} />
              <h2 className="text-2xl font-light mb-4" style={{ fontFamily: 'Cormorant Garamond, serif' }}>Privacy Policy</h2>
              <div className="space-y-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
                <p><strong style={{ color: 'var(--text-primary)' }}>Your Data is Sacred.</strong> We treat your personal information with the same care we bring to every tool on this platform.</p>
                <p><strong style={{ color: 'var(--text-primary)' }}>What We Collect:</strong> Account info (name, email), mood logs, journal entries, and practice history. This data powers personalized recommendations and progress tracking.</p>
                <p><strong style={{ color: 'var(--text-primary)' }}>What We Don't Do:</strong> We never sell your data. We never share your journal entries, mood logs, or personal reflections with third parties. Your inner world stays private.</p>
                <p><strong style={{ color: 'var(--text-primary)' }}>Security:</strong> All data is encrypted in transit and at rest. Authentication uses industry-standard JWT tokens. Passwords are bcrypt-hashed and never stored in plain text.</p>
                <p><strong style={{ color: 'var(--text-primary)' }}>AI Features:</strong> When you use AI-powered features (affirmations, guided meditations), your prompts are processed by our AI partner to generate content. We do not store or train on these interactions beyond delivering the immediate response.</p>
                <p><strong style={{ color: 'var(--text-primary)' }}>Your Rights:</strong> You can request deletion of your account and all associated data at any time by contacting us.</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Disclaimer Modal */}
      <AnimatePresence>
        {showDisclaimer && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center px-4"
            style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
            onClick={(e) => e.target === e.currentTarget && setShowDisclaimer(false)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="glass-card w-full max-w-lg p-8 max-h-[80vh] overflow-y-auto relative">
              <button onClick={() => setShowDisclaimer(false)} className="absolute top-4 right-4" style={{ color: 'var(--text-muted)' }}><X size={18} /></button>
              <Heart size={24} style={{ color: '#FDA4AF', marginBottom: 12 }} />
              <h2 className="text-2xl font-light mb-4" style={{ fontFamily: 'Cormorant Garamond, serif' }}>Digital Wellness Disclaimer</h2>
              <div className="space-y-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
                <p><strong style={{ color: 'var(--text-primary)' }}>For Wellness & Relaxation Only.</strong> The Cosmic Collective provides tools for personal wellness, stress relief, and relaxation. These tools are not medical devices and are not intended to diagnose, treat, cure, or prevent any disease or medical condition.</p>
                <p><strong style={{ color: 'var(--text-primary)' }}>Not a Substitute for Professional Care.</strong> If you are experiencing a mental health crisis, severe anxiety, depression, or any medical condition, please seek professional help immediately. Our tools complement — but never replace — professional medical or psychological care.</p>
                <p><strong style={{ color: 'var(--text-primary)' }}>Frequency & Light Therapy:</strong> Some users may be sensitive to certain frequencies or light patterns. If you experience discomfort, dizziness, or any adverse effects, discontinue use immediately. Those with photosensitive epilepsy should consult a healthcare provider before using light therapy features.</p>
                <p><strong style={{ color: 'var(--text-primary)' }}>Nourishment Information:</strong> Recipe and nutritional information is provided for educational purposes. Individual dietary needs vary. Consult a healthcare provider or registered dietitian for personalized nutrition advice, especially if you have food allergies or medical conditions.</p>
                <p><strong style={{ color: 'var(--text-primary)' }}>The Engineer's Promise:</strong> Every tool on this platform is designed with care, precision, and genuine intention to help. We built this because we believe in the power of these practices — and we want to share them responsibly.</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/* ========== MAIN LANDING ========== */
export default function Landing() {
  const navigate = useNavigate();
  const [breathScale, setBreathScale] = useState(1);
  const [showQuickReset, setShowQuickReset] = useState(false);
  const animRef = useRef(null);

  const animateBreath = useCallback(() => {
    const duration = 8000;
    const start = performance.now();
    const tick = (now) => {
      const elapsed = (now - start) % duration;
      const progress = elapsed / duration;
      const scale = 1 + 0.5 * Math.sin(progress * Math.PI * 2);
      setBreathScale(scale);
      animRef.current = requestAnimationFrame(tick);
    };
    animRef.current = requestAnimationFrame(tick);
  }, []);

  useEffect(() => {
    animateBreath();
    return () => cancelAnimationFrame(animRef.current);
  }, [animateBreath]);

  return (
    <div className="min-h-screen relative" style={{ background: 'transparent' }}>
      <QuickResetModal open={showQuickReset} onClose={() => setShowQuickReset(false)} />

      {/* Aurora gradient overlay */}
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full animate-aurora"
          style={{ background: 'radial-gradient(ellipse, rgba(192,132,252,0.08) 0%, transparent 70%)', filter: 'blur(80px)' }} />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full"
          style={{ background: 'radial-gradient(ellipse, rgba(45,212,191,0.06) 0%, transparent 70%)', filter: 'blur(80px)', animation: 'aurora 12s ease-in-out infinite reverse' }} />
      </div>

      {/* Hero */}
      <div className="relative z-10 px-6 md:px-12 lg:px-24 pt-32 pb-24">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}>
            <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="text-xs font-bold uppercase tracking-[0.3em] mb-6" style={{ color: 'var(--secondary)' }}>
              <Sparkles size={14} className="inline mr-2" style={{ color: 'var(--accent-gold)' }} />
              A Gathering Place for Conscious Minds
            </motion.p>
            <h1 className="text-5xl md:text-7xl font-light tracking-tight leading-none mb-8" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
              <motion.span initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>The Cosmic</motion.span>
              <motion.span initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
                className="block animate-text-shimmer" style={{ lineHeight: 1.2 }}>Collective</motion.span>
            </h1>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}
              className="text-base md:text-lg leading-relaxed max-w-md mb-10" style={{ color: 'var(--text-secondary)' }}>
              A sacred digital space for breathing, meditation, journaling, sound healing, and expanding your awareness alongside like-minded souls.
            </motion.p>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }}
              className="flex flex-wrap gap-4">
              <button onClick={() => setShowQuickReset(true)}
                className="btn-glass glow-primary group"
                data-testid="quick-reset-btn">
                <span className="relative z-10 flex items-center gap-2">
                  Quick Reset
                  <Zap size={16} className="transition-transform duration-300 group-hover:scale-110" />
                </span>
              </button>
              <button onClick={() => navigate('/journey')}
                className="btn-glass group"
                style={{ background: 'rgba(45,212,191,0.06)', borderColor: 'rgba(45,212,191,0.15)' }}
                data-testid="begin-journey-btn">
                <span className="flex items-center gap-2" style={{ color: '#2DD4BF' }}>
                  Begin Journey <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
                </span>
              </button>
              <button onClick={() => navigate('/auth')} className="btn-glass"
                style={{ background: 'transparent', borderColor: 'rgba(255,255,255,0.08)' }}
                data-testid="sign-in-btn">
                Sign In
              </button>
            </motion.div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }}
              className="flex items-center gap-2 mt-8">
              <Volume2 size={12} style={{ color: 'var(--text-muted)' }} />
              <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Enable ambient sound for the full experience</span>
            </motion.div>
          </motion.div>

          {/* Breathing orb */}
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-center justify-center">
            <div className="relative w-72 h-72 md:w-96 md:h-96 flex items-center justify-center">
              {Array.from({ length: 12 }).map((_, i) => {
                const angle = (i / 12) * Math.PI * 2;
                const radius = 48;
                return (
                  <motion.div key={i} className="absolute w-1 h-1 rounded-full"
                    style={{
                      background: i % 3 === 0 ? '#D8B4FE' : i % 3 === 1 ? '#2DD4BF' : '#FCD34D',
                      left: `calc(50% + ${Math.cos(angle) * radius}%)`,
                      top: `calc(50% + ${Math.sin(angle) * radius}%)`,
                    }}
                    animate={{ opacity: [0.2, 0.8, 0.2], scale: [0.8, 1.2, 0.8] }}
                    transition={{ duration: 3 + i * 0.3, repeat: Infinity, delay: i * 0.2 }} />
                );
              })}
              {[0.3, 0.5, 0.7, 1].map((opacity, i) => (
                <div key={i} className="absolute rounded-full"
                  style={{
                    width: `${60 + i * 20}%`, height: `${60 + i * 20}%`,
                    background: `radial-gradient(circle, rgba(192,132,252,${opacity * 0.12}) 0%, transparent 70%)`,
                    border: `1px solid rgba(192,132,252,${opacity * 0.08})`,
                    transform: `scale(${breathScale * (0.9 + i * 0.05)})`, transition: 'transform 0.1s linear',
                  }} />
              ))}
              <div className="relative z-10 w-20 h-20 rounded-full"
                style={{
                  background: 'radial-gradient(circle, rgba(192,132,252,0.7) 0%, rgba(192,132,252,0.15) 60%, transparent 100%)',
                  boxShadow: `0 0 ${40 + breathScale * 30}px rgba(192,132,252,${0.2 + breathScale * 0.15}), 0 0 ${80 + breathScale * 40}px rgba(192,132,252,0.08)`,
                  transform: `scale(${breathScale})`, transition: 'transform 0.1s linear',
                }} />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Social Proof / Testimonials */}
      <div className="relative z-10 px-6 md:px-12 lg:px-24 py-20" data-testid="testimonials-section">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-12">
            <p className="text-xs font-bold uppercase tracking-[0.3em] mb-3" style={{ color: 'var(--text-muted)' }}>
              <Quote size={12} className="inline mr-2" /> What Beta Testers Are Saying
            </p>
            <h2 className="text-2xl md:text-3xl font-light" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
              Real Results from Real Practice
            </h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {TESTIMONIALS.map((t, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-30px' }}
                transition={{ delay: i * 0.06 }}
                className="glass-card p-6 relative"
              >
                <div className="absolute top-4 right-4 opacity-10">
                  <Quote size={28} style={{ color: t.color }} />
                </div>
                <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--text-secondary)' }}>
                  "{t.text}"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                    style={{ background: `${t.color}15`, color: t.color }}>
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>{t.name}</p>
                    <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="relative z-10 px-6 md:px-12 lg:px-24 pb-16">
        <div className="max-w-7xl mx-auto">
          <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            className="text-xs font-bold uppercase tracking-[0.3em] mb-12" style={{ color: 'var(--text-muted)' }}>
            Explore Your Path
          </motion.p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f, i) => (
              <FeatureCard key={f.title} feature={f} index={i} />
            ))}
          </div>
        </div>
      </div>

      {/* Waitlist */}
      <WaitlistSection />

      {/* Footer */}
      <Footer />
    </div>
  );
}
