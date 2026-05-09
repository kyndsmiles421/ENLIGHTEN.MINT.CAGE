import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Home } from 'lucide-react';

/**
 * NotFound — V1.1.25 hardened for shared-link recipients.
 * If a Messenger / iMessage / Twitter share rewrites the path, the
 * recipient should NOT land on a dead end. We auto-redirect home
 * after 4 seconds and show a visible countdown so the user knows
 * something is happening.
 */
export default function NotFound() {
  const navigate = useNavigate();
  const [seconds, setSeconds] = useState(4);

  useEffect(() => {
    const tick = setInterval(() => {
      setSeconds((s) => Math.max(0, s - 1));
    }, 1000);
    const redirect = setTimeout(() => navigate('/', { replace: true }), 4000);
    return () => { clearInterval(tick); clearTimeout(redirect); };
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center px-6" style={{ background: 'transparent' }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-md"
      >
        <p className="text-8xl font-light mb-4" style={{ fontFamily: 'Cormorant Garamond, serif', color: 'var(--primary)' }}>
          404
        </p>
        <h1 className="text-2xl font-light mb-4" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
          This path drifted
        </h1>
        <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
          Returning you to the sanctuary in {seconds}…
        </p>
        <button
          onClick={() => navigate('/', { replace: true })}
          className="btn-glass glow-primary inline-flex items-center gap-2"
          data-testid="not-found-home-btn"
        >
          <Home size={16} />
          Return Now
        </button>
      </motion.div>
    </div>
  );
}
