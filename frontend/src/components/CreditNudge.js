import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, X, CreditCard, ArrowRight } from 'lucide-react';
import { useCreditsContext } from '../context/CreditContext';
import { useAuth } from '../context/AuthContext';

export default function CreditNudge() {
  const { user } = useAuth();
  const { creditInfo } = useCreditsContext();
  const [dismissed, setDismissed] = useState(false);
  const [show, setShow] = useState(false);
  const location = useLocation();

  useEffect(() => {
    if (!user || !creditInfo || dismissed) { setShow(false); return; }
    // Hide on hub, auth, landing
    if (location.pathname === '/hub' || location.pathname === '/' || location.pathname === '/auth') { setShow(false); return; }
    // Don't show for unlimited tiers
    if (creditInfo.credits_per_month === -1 && creditInfo.subscription_active) { setShow(false); return; }
    // Show when balance <= 10
    if (creditInfo.balance <= 10) {
      setShow(true);
    } else {
      setShow(false);
    }
  }, [user, creditInfo, dismissed, location.pathname]);

  // Reset dismiss when credits change significantly
  useEffect(() => {
    if (creditInfo?.balance > 10) setDismissed(false);
  }, [creditInfo?.balance]);

  if (!show) return null;

  const isZero = creditInfo.balance <= 0;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 60 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="fixed bottom-20 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-sm z-[100]"
        data-testid="credit-nudge"
      >
        <div className="rounded-xl overflow-hidden"
          style={{
            background: isZero ? 'rgba(127, 29, 29, 0.95)' : 'rgba(30, 27, 50, 0.95)',
            border: `1px solid ${isZero ? 'rgba(239,68,68,0.25)' : 'rgba(234,179,8,0.2)'}`,
            backdropFilter: 'blur(20px)',
            boxShadow: `0 20px 60px rgba(0,0,0,0.5), 0 0 30px ${isZero ? 'rgba(239,68,68,0.08)' : 'rgba(234,179,8,0.06)'}`,
          }}>
          <div className="p-4 flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{
                background: isZero ? 'rgba(239,68,68,0.12)' : 'rgba(234,179,8,0.12)',
                border: `1px solid ${isZero ? 'rgba(239,68,68,0.2)' : 'rgba(234,179,8,0.2)'}`,
              }}>
              {isZero ? <Zap size={16} style={{ color: '#EF4444' }} /> : <CreditCard size={16} style={{ color: '#EAB308' }} />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium mb-0.5" style={{ color: 'var(--text-primary)' }}>
                {isZero ? 'Credits depleted' : 'Credits running low'}
              </p>
              <p className="text-[10px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                {isZero
                  ? 'You\'ve used all your AI credits. Top up or upgrade to keep exploring.'
                  : `Only ${creditInfo.balance} credit${creditInfo.balance !== 1 ? 's' : ''} remaining. Top up or upgrade for uninterrupted cosmic guidance.`
                }
              </p>
              <div className="flex items-center gap-2 mt-2.5">
                <Link to="/pricing" onClick={() => setDismissed(true)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-medium transition-all hover:scale-105"
                  style={{
                    background: isZero ? 'rgba(239,68,68,0.15)' : 'rgba(234,179,8,0.15)',
                    color: isZero ? '#EF4444' : '#EAB308',
                    border: `1px solid ${isZero ? 'rgba(239,68,68,0.25)' : 'rgba(234,179,8,0.25)'}`,
                  }}
                  data-testid="credit-nudge-upgrade-btn">
                  Upgrade <ArrowRight size={10} />
                </Link>
                <Link to="/pricing" onClick={() => setDismissed(true)}
                  className="px-3 py-1.5 rounded-lg text-[10px] transition-all hover:scale-105"
                  style={{ color: 'var(--text-secondary)', border: '1px solid rgba(248,250,252,0.08)' }}
                  data-testid="credit-nudge-topup-btn">
                  Top Up Credits
                </Link>
              </div>
            </div>
            <button onClick={() => setDismissed(true)}
              className="p-1 rounded hover:bg-white/5 flex-shrink-0"
              data-testid="credit-nudge-dismiss">
              <X size={12} style={{ color: 'var(--text-muted)' }} />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
