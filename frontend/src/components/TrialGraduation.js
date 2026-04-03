import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight, X, Heart, MessageCircle, Music, BookOpen, Smile, Compass, Star, Globe } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCreditsContext } from '../context/CreditContext';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const DISMISSED_KEY = 'trial_graduation_dismissed';
const SOVEREIGN_TRIAL_KEY = 'sovereign_trial_complete'; // Universal once-per-profile flag

const ICON_MAP = {
  sage: Heart,
  chat: MessageCircle,
  mixer: Music,
  journal: BookOpen,
  mood: Smile,
  meditate: Compass,
  oracle: Star,
  star: Sparkles,
  realm: Globe,
};

function HighlightCard({ highlight, index }) {
  const Icon = ICON_MAP[highlight.icon] || Star;
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 + index * 0.08 }}
      className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
      style={{
        background: 'rgba(129,140,248,0.04)',
        border: '1px solid rgba(129,140,248,0.06)',
      }}
    >
      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ background: 'rgba(192,132,252,0.08)' }}>
        <Icon size={14} style={{ color: '#C084FC' }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-medium" style={{ color: 'var(--text-primary)' }}>
          {highlight.feature}
        </p>
      </div>
      <p className="text-sm font-semibold" style={{ color: '#818CF8' }}>
        {highlight.count}
      </p>
    </motion.div>
  );
}

export default function TrialGraduation() {
  const { authHeaders, user } = useAuth();
  const { creditInfo } = useCreditsContext();
  const navigate = useNavigate();
  const [show, setShow] = useState(false);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  // Once-per-profile check: if sovereign_trial_complete is set, never show again
  useEffect(() => {
    if (!user || !authHeaders?.Authorization) return;
    if (!creditInfo?.trial?.expired) return;

    // Sovereign once-per-profile lock — permanent dismiss
    try {
      if (localStorage.getItem(SOVEREIGN_TRIAL_KEY) === 'true') return;
      // Also check the old dismiss key for backward compatibility
      const dismissed = localStorage.getItem(DISMISSED_KEY);
      if (dismissed && dismissed !== 'false') return;
    } catch {}

    // Fetch trial summary
    setLoading(true);
    axios.get(`${API}/subscriptions/trial-summary`, { headers: authHeaders })
      .then(r => {
        if (r.data.has_trial && r.data.trial_expired) {
          setSummary(r.data);
          setShow(true);
          // Track view for sovereign analytics
          axios.post(`${API}/treasury/trial-event`, { event: 'view' }, { headers: authHeaders }).catch(() => {});
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user, authHeaders, creditInfo]);

  const handleDismiss = useCallback(() => {
    setShow(false);
    // Set both keys for permanent dismiss
    try {
      localStorage.setItem(SOVEREIGN_TRIAL_KEY, 'true');
      localStorage.setItem(DISMISSED_KEY, 'true');
    } catch {}
    // Track dismiss for sovereign analytics
    axios.post(`${API}/treasury/trial-event`, { event: 'dismiss' }, { headers: authHeaders }).catch(() => {});
  }, [authHeaders]);

  const handleUpgrade = useCallback(() => {
    // Track conversion for sovereign analytics
    axios.post(`${API}/treasury/trial-event`, { event: 'upgrade_click' }, { headers: authHeaders }).catch(() => {});
    handleDismiss();
    navigate('/pricing?from=trial&highlight=plus');
  }, [handleDismiss, navigate, authHeaders]);

  if (!show || !summary || loading) return null;

  return createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[10000] flex items-center justify-center px-4"
        style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
        data-testid="trial-graduation-overlay"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          transition={{ type: 'spring', damping: 28, stiffness: 300 }}
          className="w-full max-w-md rounded-2xl overflow-hidden"
          style={{
            background: 'rgba(8,8,16,0.98)',
            border: '1px solid rgba(129,140,248,0.12)',
            boxShadow: '0 24px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(129,140,248,0.04)',
          }}
          data-testid="trial-graduation-modal"
        >
          {/* Header */}
          <div className="relative px-6 pt-6 pb-4">
            <button
              onClick={handleDismiss}
              className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-white/5 transition-all"
              data-testid="trial-graduation-close"
            >
              <X size={14} style={{ color: 'var(--text-muted)' }} />
            </button>

            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
              className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{
                background: 'linear-gradient(135deg, rgba(129,140,248,0.1), rgba(192,132,252,0.08))',
                border: '1px solid rgba(129,140,248,0.12)',
              }}
            >
              <Sparkles size={24} style={{ color: '#C084FC' }} />
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="text-center text-lg font-light mb-1"
              style={{ color: 'var(--text-primary)', fontFamily: 'Cormorant Garamond, serif' }}
            >
              Your cosmic trial has concluded
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-center text-[11px]"
              style={{ color: 'var(--text-muted)' }}
            >
              Here's what you explored on your 7-day journey
            </motion.p>
          </div>

          {/* Activity Summary */}
          <div className="px-6 pb-4">
            {/* Total activities pill */}
            {summary.total_activities > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="flex items-center justify-center gap-2 mb-4 py-2 rounded-full"
                style={{ background: 'rgba(129,140,248,0.06)', border: '1px solid rgba(129,140,248,0.08)' }}
              >
                <span className="text-lg font-semibold" style={{ color: '#818CF8' }}>
                  {summary.total_activities}
                </span>
                <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                  total cosmic interactions
                </span>
              </motion.div>
            )}

            {/* Highlight cards */}
            {summary.highlights.length > 0 ? (
              <div className="space-y-2 max-h-48 overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
                {summary.highlights.map((h, i) => (
                  <HighlightCard key={h.feature} highlight={h} index={i} />
                ))}
              </div>
            ) : (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-center text-[11px] py-4"
                style={{ color: 'var(--text-muted)' }}
              >
                Your cosmic journey is just beginning — there's so much more to explore.
              </motion.p>
            )}

            {/* Credits used */}
            {summary.credits_used > 0 && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-center text-[9px] mt-3"
                style={{ color: 'var(--text-muted)' }}
              >
                You used {summary.credits_used} AI credits during your trial
              </motion.p>
            )}
          </div>

          {/* CTA */}
          <div className="px-6 pb-6 pt-2">
            <motion.button
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleUpgrade}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-all"
              style={{
                background: 'linear-gradient(135deg, rgba(129,140,248,0.15), rgba(192,132,252,0.1))',
                border: '1px solid rgba(129,140,248,0.2)',
                color: '#818CF8',
              }}
              data-testid="trial-graduation-upgrade"
            >
              Keep your Plus access <ArrowRight size={14} />
            </motion.button>

            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              onClick={handleDismiss}
              className="w-full mt-2 py-2 text-center text-[10px] transition-all hover:opacity-80"
              style={{ color: 'var(--text-muted)' }}
              data-testid="trial-graduation-dismiss"
            >
              Continue with free plan
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
}
