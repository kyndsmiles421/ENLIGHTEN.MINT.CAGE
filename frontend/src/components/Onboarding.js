import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const STEPS = [
  {
    title: 'Welcome to ENLIGHTEN.MINT.CAFE',
    text: 'Your sovereign wellness engine is divided into 7 core pillars. Tap any pillar to expand, then tap a module to dive deep.',
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

  // INLINE card — NOT an overlay. Flows with page content.
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, height: 0, marginBottom: 0 }}
          className="mx-4 mb-4 rounded-xl overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(10,10,20,0.95), rgba(18,18,30,0.95))',
            border: '1px solid rgba(45,212,191,0.15)',
          }}
          data-testid="onboarding-card"
        >
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.25 }}
            className="p-5"
          >
            <p className="text-[9px] font-mono uppercase tracking-wider mb-2" style={{ color: 'rgba(45,212,191,0.5)' }}>
              {step + 1}/{STEPS.length}
            </p>
            <h3 className="text-base font-semibold mb-2" style={{ color: '#fff' }}>
              {STEPS[step].title}
            </h3>
            <p className="text-xs leading-relaxed mb-4" style={{ color: 'rgba(255,255,255,0.6)' }}>
              {STEPS[step].text}
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={advance}
                className="px-5 py-2 rounded-lg text-xs font-medium"
                style={{ background: 'rgba(45,212,191,0.15)', border: '1px solid rgba(45,212,191,0.3)', color: '#2DD4BF' }}
                data-testid="onboarding-next"
              >
                {step < STEPS.length - 1 ? 'Next' : 'Got It'}
              </button>
              <button onClick={skip} className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}
                data-testid="onboarding-skip">
                Skip
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
