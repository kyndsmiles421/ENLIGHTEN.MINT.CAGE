import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const STEPS = [
  {
    title: 'Welcome to ENLIGHTEN.MINT.CAFE',
    text: 'Your sovereign spiritual instrument is divided into 7 core pillars. Tap any pillar to expand, then tap a module to dive deep.',
  },
  {
    title: 'The Mixer Controls Everything',
    text: 'The persistent mixer at the bottom of every page lets you control all 58 modules. Switch between Strip and Orbital Sphere modes.',
  },
  {
    title: 'The Sovereign Engine is Active',
    text: 'Your engine accrues Digital Dust as you engage. The longer you stay, the higher your resonance multiplier climbs.',
  },
];

export default function Onboarding() {
  const [step, setStep] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem('onboardingComplete')) {
      setVisible(true);
    }
  }, []);

  if (!visible) return null;

  const advance = () => {
    if (step < STEPS.length - 1) {
      setStep(step + 1);
    } else {
      localStorage.setItem('onboardingComplete', 'true');
      setVisible(false);
    }
  };

  const skip = () => {
    localStorage.setItem('onboardingComplete', 'true');
    setVisible(false);
  };

  // V57.10 — INLINE row, no floating card aesthetic. Matches the page
  // rhythm of the surrounding mission/wallet rows so the tutorial reads
  // as the next item in the document, not as an overlay sitting on top.
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="px-5 py-3"
          data-testid="onboarding-card"
        >
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.22 }}
            className="flex items-start gap-3"
          >
            <span
              aria-hidden="true"
              className="mt-1 flex-shrink-0 w-1 h-12 rounded-full"
              style={{ background: 'linear-gradient(180deg, #2DD4BF, rgba(45,212,191,0.1))' }}
            />
            <div className="flex-1 min-w-0">
              <p className="text-[9px] font-mono uppercase tracking-[0.2em] mb-1.5" style={{ color: 'rgba(45,212,191,0.6)' }}>
                Tour · {step + 1}/{STEPS.length}
              </p>
              <h3 className="text-sm font-medium mb-1.5" style={{ color: 'rgba(255,255,255,0.92)' }}>
                {STEPS[step].title}
              </h3>
              <p className="text-xs leading-relaxed mb-3" style={{ color: 'rgba(255,255,255,0.55)' }}>
                {STEPS[step].text}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={advance}
                  className="px-3 py-1 rounded-md text-[10px] font-mono uppercase tracking-wider transition-colors"
                  style={{ background: 'rgba(45,212,191,0.12)', border: '1px solid rgba(45,212,191,0.32)', color: '#2DD4BF' }}
                  data-testid="onboarding-next"
                >
                  {step < STEPS.length - 1 ? 'Next ›' : 'Got it'}
                </button>
                <button
                  onClick={skip}
                  className="text-[10px] font-mono uppercase tracking-wider"
                  style={{ color: 'rgba(255,255,255,0.32)' }}
                  data-testid="onboarding-skip"
                >
                  Skip tour
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
