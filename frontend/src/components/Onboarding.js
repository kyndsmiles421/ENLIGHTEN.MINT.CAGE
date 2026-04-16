import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const STEPS = [
  {
    title: 'Welcome to ENLIGHTEN.MINT.CAFE',
    text: 'Your sovereign wellness engine is divided into 7 core pillars. Tap any pillar to expand, then tap a module to dive deep.',
  },
  {
    title: 'The Mixer Controls Everything',
    text: 'The persistent mixer at the bottom of every page lets you control all 58 modules. Switch between Strip and Orbital Sphere modes. Collapse it anytime.',
  },
  {
    title: 'The Sovereign Engine is Active',
    text: 'Your engine accrues Digital Dust as you engage. The longer you stay, the higher your resonance multiplier climbs — up to 4.24x.',
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

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: 'fixed', inset: 0, zIndex: 2147483647,
            background: 'transparent', backdropFilter: 'none',
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            padding: '20px',
          }}
          data-testid="onboarding-overlay"
        >
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            style={{
              background: 'linear-gradient(135deg, #0a0a14, #12121e)',
              border: '1px solid rgba(45,212,191,0.2)',
              borderRadius: '16px',
              padding: '32px 24px',
              maxWidth: '360px',
              width: '100%',
              textAlign: 'center',
              boxShadow: '0 0 40px rgba(45,212,191,0.08)',
            }}
          >
            {/* Step indicator */}
            <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'center', gap: '8px' }}>
              {STEPS.map((_, i) => (
                <div key={i} style={{
                  width: i === step ? '24px' : '8px',
                  height: '8px',
                  borderRadius: '4px',
                  background: i === step ? '#2DD4BF' : i < step ? 'rgba(45,212,191,0.4)' : 'rgba(255,255,255,0.1)',
                  transition: 'all 0.3s',
                }} />
              ))}
            </div>

            <h2 style={{
              fontSize: '20px',
              fontWeight: 700,
              color: '#F8FAFC',
              marginBottom: '12px',
              fontFamily: 'Cormorant Garamond, serif',
              letterSpacing: '0.02em',
            }}>
              {STEPS[step].title}
            </h2>

            <p style={{
              fontSize: '14px',
              color: 'rgba(248,250,252,0.55)',
              lineHeight: 1.6,
              marginBottom: '28px',
            }}>
              {STEPS[step].text}
            </p>

            <button
              onClick={advance}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '10px',
                border: 'none',
                background: 'linear-gradient(135deg, #2DD4BF, #14B8A6)',
                color: '#000',
                fontSize: '14px',
                fontWeight: 700,
                cursor: 'pointer',
                letterSpacing: '0.05em',
              }}
              data-testid="onboarding-next"
            >
              {step === STEPS.length - 1 ? 'Begin Journey' : 'Next'}
            </button>

            {step === 0 && (
              <button
                onClick={skip}
                style={{
                  marginTop: '12px',
                  background: 'none',
                  border: 'none',
                  color: 'rgba(248,250,252,0.25)',
                  fontSize: '12px',
                  cursor: 'pointer',
                }}
                data-testid="onboarding-skip"
              >
                Skip
              </button>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
