import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Home } from 'lucide-react';

export default function NotFound() {
  const navigate = useNavigate();
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
          This path does not exist... yet
        </h1>
        <p className="text-sm mb-8" style={{ color: 'var(--text-secondary)' }}>
          Perhaps the universe is guiding you elsewhere.
        </p>
        <button
          onClick={() => navigate('/')}
          className="btn-glass glow-primary inline-flex items-center gap-2"
          data-testid="not-found-home-btn"
        >
          <Home size={16} />
          Return to Sanctuary
        </button>
      </motion.div>
    </div>
  );
}
