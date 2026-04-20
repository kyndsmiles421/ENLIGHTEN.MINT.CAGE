import React, { useEffect, useMemo, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, CircleAlert, Clock, Flame } from 'lucide-react';
import SovereignKernel from '../kernel/SovereignKernel';
import MasteryLedger from '../kernel/MasteryLedger';
import LabAudio from '../kernel/LabAudio';

/**
 * LabStage — the Proof-of-Work gate of ENLIGHTEN.MINT.CAFE.
 *
 * Every Spark minting must pass through here. The Sovereign is presented
 * with a question rooted in the tool's domain, times themselves, picks
 * the correct answer, and only then does MasteryLedger.record() persist
 * and SovereignKernel.interact() fire the sparks ripple to the Hub HUD.
 *
 * API:
 *   <LabStage
 *     open
 *     lab={{
 *       toolId: 'geology.identify',
 *       domain: 'geology',
 *       title: 'Identify the Quartz Signature',
 *       prompt: 'Which of these mineral signatures belongs to pure quartz?',
 *       choices: ['SiO₂ hexagonal', 'CaCO₃ rhombic', 'Fe₂O₃ cubic'],
 *       correctIndex: 0,
 *       targetSec: 18,
 *       sparks: 4,
 *     }}
 *     onClose={...}
 *   />
 */

export default function LabStage({ open, lab, onClose }) {
  const [selected, setSelected] = useState(null);
  const [submitted, setSubmitted] = useState(null); // 'pass' | 'fail' | null
  const [streak, setStreak] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [glitch, setGlitch] = useState(false);
  const startedAt = useRef(null);
  const timerRef = useRef(null);

  // Reset when a new lab opens
  useEffect(() => {
    if (!open) return;
    setSelected(null); setSubmitted(null); setElapsed(0); setGlitch(false);
    startedAt.current = Date.now();
    timerRef.current = setInterval(() => {
      setElapsed(Math.max(0, Math.round((Date.now() - startedAt.current) / 1000)));
    }, 250);
    return () => clearInterval(timerRef.current);
  }, [open, lab?.toolId]);

  if (!open || !lab) return null;

  const targetSec = lab.targetSec || 20;
  const sparksAvailable = lab.sparks ?? 3;

  const submit = () => {
    if (selected === null) return;
    const durationSec = Math.max(1, Math.round((Date.now() - startedAt.current) / 1000));
    const correct = selected === lab.correctIndex;

    // Record into MasteryLedger — this is the sole gate for sparks.
    MasteryLedger.record({
      toolId: lab.toolId,
      domain: lab.domain,
      correct,
      durationSec,
      targetSec,
    });

    if (correct) {
      const nextStreak = streak + 1;
      setStreak(nextStreak);
      setSubmitted('pass');
      LabAudio.playSuccess();
      if (nextStreak >= 2) LabAudio.playStreak(nextStreak);

      // Fire the Sovereign Kernel interact event — sparks ripple to HUD.
      try {
        SovereignKernel.interact(lab.toolId, {
          sparks: sparksAvailable * (1 + 0.25 * (nextStreak - 1)),
          resonance: 'lab-pass',
          context: `lab:${lab.toolId}`,
          durationSec,
          correct: true,
        });
      } catch (e) { /* unregistered tool is still a bug but UI keeps going */ console.warn(e); }
    } else {
      setSubmitted('fail');
      setStreak(0);                     // Fractal Reset — streak dies
      setGlitch(true);
      LabAudio.playFail();
      setTimeout(() => setGlitch(false), 800);
    }
  };

  const retry = () => {
    setSelected(null); setSubmitted(null); setElapsed(0);
    startedAt.current = Date.now();
  };

  // Speed score (for visible telemetry — same formula MasteryLedger uses)
  const speedScore = Math.max(0, 1 - Math.min(1, elapsed / targetSec));

  return ReactDOM.createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        style={{
          position: 'fixed', inset: 0, zIndex: 9998,
          background: 'rgba(4,6,15,0.95)', backdropFilter: 'blur(18px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 20,
        }}
        data-testid="lab-stage"
      >
        <motion.div
          animate={glitch ? { x: [0, -4, 4, -3, 2, 0], filter: ['hue-rotate(0deg)', 'hue-rotate(40deg)', 'hue-rotate(0deg)'] } : {}}
          transition={{ duration: 0.45 }}
          className="relative rounded-2xl max-w-2xl w-full p-6 sm:p-8"
          style={{
            background: 'linear-gradient(135deg, rgba(22,22,36,0.95), rgba(10,10,20,0.95))',
            border: `1px solid ${submitted === 'pass' ? 'rgba(34,197,94,0.45)' : submitted === 'fail' ? 'rgba(248,113,113,0.45)' : 'rgba(192,132,252,0.22)'}`,
            boxShadow: submitted === 'pass' ? '0 40px 120px rgba(34,197,94,0.18)' : '0 40px 120px rgba(192,132,252,0.12)',
          }}
        >
          <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/5 transition" data-testid="lab-stage-close">
            <X size={18} style={{ color: '#cbd5e1' }} />
          </button>

          <div className="flex items-center gap-2 mb-1">
            <Flame size={14} style={{ color: '#FBBF24' }} />
            <p className="text-[10px] uppercase tracking-[0.32em] sov-telemetry" style={{ color: '#FBBF24' }}>
              Lab · {lab.domain} · {lab.toolId}
            </p>
          </div>
          <h2
            className="text-3xl font-light mt-0.5 mb-1"
            style={{ fontFamily: 'Cormorant Garamond, serif', color: '#fff' }}
          >
            {lab.title}
          </h2>
          <p className="text-base mb-6" style={{ color: 'var(--text-secondary)', fontFamily: 'Cormorant Garamond, serif', fontSize: 18, lineHeight: 1.5 }}>
            {lab.prompt}
          </p>

          {/* Live telemetry strip */}
          <div className="flex items-center gap-4 mb-5 pb-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="flex items-center gap-1.5">
              <Clock size={12} style={{ color: 'var(--text-muted)' }} />
              <span className="text-[11px] sov-telemetry" style={{ color: 'var(--text-muted)' }}>
                {elapsed}s / {targetSec}s target
              </span>
            </div>
            <div className="h-1 flex-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
              <div style={{
                width: `${Math.min(100, (elapsed / targetSec) * 100)}%`,
                height: '100%',
                background: `linear-gradient(90deg, #22D3EE, ${speedScore < 0.3 ? '#F87171' : '#FBBF24'})`,
                transition: 'width 250ms linear',
              }} />
            </div>
            <span className="text-[11px] sov-telemetry" style={{ color: '#22D3EE' }}>
              +{Math.round(sparksAvailable * (1 + 0.25 * Math.max(0, streak)))}◆
            </span>
            {streak > 0 && (
              <span className="text-[11px] sov-telemetry px-2 py-0.5 rounded" style={{ background: 'rgba(251,191,36,0.14)', color: '#FCD34D' }}>
                🔥 {streak}×
              </span>
            )}
          </div>

          {/* Choices */}
          <div className="space-y-2" data-testid="lab-choices">
            {lab.choices.map((c, i) => {
              const isSelected = selected === i;
              const isCorrect = submitted && i === lab.correctIndex;
              const isWrong = submitted === 'fail' && isSelected && i !== lab.correctIndex;
              return (
                <motion.button
                  key={i}
                  whileHover={!submitted ? { x: 3 } : {}}
                  whileTap={!submitted ? { scale: 0.98 } : {}}
                  onClick={() => !submitted && setSelected(i)}
                  disabled={!!submitted}
                  data-testid={`lab-choice-${i}`}
                  className="w-full text-left rounded-xl px-4 py-3 transition-all"
                  style={{
                    background: isCorrect
                      ? 'rgba(34,197,94,0.14)'
                      : isWrong
                        ? 'rgba(248,113,113,0.14)'
                        : isSelected
                          ? 'rgba(192,132,252,0.12)'
                          : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${isCorrect ? 'rgba(34,197,94,0.5)' : isWrong ? 'rgba(248,113,113,0.5)' : isSelected ? 'rgba(192,132,252,0.45)' : 'rgba(255,255,255,0.08)'}`,
                    color: '#F1F5F9',
                    cursor: submitted ? 'default' : 'pointer',
                  }}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="inline-flex items-center justify-center rounded-full text-[11px] font-bold sov-telemetry"
                      style={{
                        width: 24, height: 24,
                        background: isSelected ? 'rgba(192,132,252,0.3)' : 'rgba(255,255,255,0.06)',
                        color: isSelected ? '#F0ABFC' : 'var(--text-muted)',
                      }}
                    >
                      {String.fromCharCode(65 + i)}
                    </span>
                    <span className="text-sm" style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 16 }}>{c}</span>
                    {isCorrect && <Check size={16} className="ml-auto" style={{ color: '#22C55E' }} />}
                    {isWrong && <CircleAlert size={16} className="ml-auto" style={{ color: '#F87171' }} />}
                  </div>
                </motion.button>
              );
            })}
          </div>

          {/* Footer — Submit / Pass banner / Fail banner */}
          <div className="mt-6 pt-5" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            {!submitted && (
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-[0.28em] sov-telemetry" style={{ color: 'var(--text-muted)' }}>
                  Pick a choice · submit to mint sparks
                </span>
                <button
                  onClick={submit}
                  disabled={selected === null}
                  data-testid="lab-submit"
                  className="px-5 py-2.5 rounded-full text-[11px] uppercase tracking-[0.28em] font-bold transition-all"
                  style={{
                    background: selected === null ? 'rgba(255,255,255,0.05)' : 'rgba(192,132,252,0.25)',
                    border: `1px solid ${selected === null ? 'rgba(255,255,255,0.08)' : 'rgba(192,132,252,0.55)'}`,
                    color: selected === null ? 'var(--text-muted)' : '#E9D5FF',
                    cursor: selected === null ? 'not-allowed' : 'pointer',
                  }}
                >
                  Submit lab
                </button>
              </div>
            )}
            {submitted === 'pass' && (
              <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} data-testid="lab-result-pass" className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.28em]" style={{ color: '#22C55E' }}>Passed · mastery recorded</p>
                  <p className="text-sm mt-0.5 sov-telemetry" style={{ color: 'var(--text-secondary)' }}>
                    +{Math.round(sparksAvailable * (1 + 0.25 * Math.max(0, streak - 1)))}◆ sparks · {elapsed}s / {targetSec}s · precision 100%
                  </p>
                </div>
                <button onClick={onClose} className="px-5 py-2.5 rounded-full text-[11px] uppercase tracking-[0.28em] font-bold" style={{ background: 'rgba(34,197,94,0.2)', border: '1px solid rgba(34,197,94,0.5)', color: '#86EFAC' }} data-testid="lab-done">
                  Continue
                </button>
              </motion.div>
            )}
            {submitted === 'fail' && (
              <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} data-testid="lab-result-fail" className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.28em]" style={{ color: '#F87171' }}>Fractal Reset · streak cleared</p>
                  <p className="text-sm mt-0.5 sov-telemetry" style={{ color: 'var(--text-secondary)' }}>
                    No sparks minted · no Dust lost · re-calibrate and try again
                  </p>
                </div>
                <button onClick={retry} className="px-5 py-2.5 rounded-full text-[11px] uppercase tracking-[0.28em] font-bold" style={{ background: 'rgba(248,113,113,0.18)', border: '1px solid rgba(248,113,113,0.5)', color: '#FCA5A5' }} data-testid="lab-retry">
                  Retry
                </button>
              </motion.div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
}
