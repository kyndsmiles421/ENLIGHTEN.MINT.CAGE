import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronUp } from 'lucide-react';

export default function BackToTop() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const handler = () => setShow(window.scrollY > 400);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-6 right-6 z-40 w-10 h-10 rounded-full flex items-center justify-center transition-all"
          style={{
            background: 'rgba(22, 24, 38, 0.9)',
            border: '1px solid rgba(192,132,252,0.15)',
            backdropFilter: 'blur(12px)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
          }}
          whileHover={{ scale: 1.1, boxShadow: '0 0 20px rgba(192,132,252,0.2)' }}
          data-testid="back-to-top"
        >
          <ChevronUp size={16} style={{ color: '#C084FC' }} />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
