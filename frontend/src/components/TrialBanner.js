import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Clock, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCreditsContext } from '../context/CreditContext';

export default function TrialBanner() {
  const { creditInfo } = useCreditsContext();
  const navigate = useNavigate();

  if (!creditInfo?.trial?.active) return null;

  const daysLeft = creditInfo.trial.days_left;
  const urgency = daysLeft <= 2;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full rounded-xl px-4 py-3 flex items-center justify-between gap-3 cursor-pointer group"
        onClick={() => navigate('/pricing?from=trial&highlight=plus')}
        style={{
          background: urgency
            ? 'linear-gradient(135deg, rgba(239,68,68,0.08), rgba(249,115,22,0.06))'
            : 'linear-gradient(135deg, rgba(129,140,248,0.08), rgba(192,132,252,0.06))',
          border: urgency
            ? '1px solid rgba(239,68,68,0.12)'
            : '1px solid rgba(129,140,248,0.12)',
        }}
        data-testid="trial-banner"
      >
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{
              background: urgency ? 'rgba(239,68,68,0.1)' : 'rgba(129,140,248,0.1)',
            }}
          >
            {urgency ? <Clock size={16} style={{ color: '#EF4444' }} /> : <Sparkles size={16} style={{ color: '#818CF8' }} />}
          </div>
          <div>
            <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
              {urgency
                ? `Only ${daysLeft} day${daysLeft !== 1 ? 's' : ''} left on your Plus trial`
                : `${daysLeft} day${daysLeft !== 1 ? 's' : ''} remaining on your free Plus trial`}
            </p>
            <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
              {urgency
                ? 'Upgrade now to keep AI Blends, Translation & more'
                : 'Enjoying AI Frequency Blends, Translation & 300 credits'}
            </p>
          </div>
        </div>
        <ArrowRight
          size={16}
          className="transition-transform group-hover:translate-x-1"
          style={{ color: urgency ? '#EF4444' : '#818CF8' }}
        />
      </motion.div>
    </AnimatePresence>
  );
}
