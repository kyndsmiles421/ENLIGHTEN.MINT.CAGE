import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import axios from 'axios';
import { Footprints, Sparkles, Play, Target, BookOpen, Clock, Info, ArrowRight, CheckCircle2 } from 'lucide-react';
import HolographicChamber from '../components/HolographicChamber';
import FootMap from '../components/reflexology/FootMap';
import { FOOT_ZONES, STARTER_ROUTINE, ELEMENT_COLOR } from '../data/reflexologyData';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const ACCENT = '#F4D58D';

/**
 * Tiny Web Audio chime — reused across modes. 528Hz for mastery,
 * 396Hz for "gentle nudge" (wrong answer).
 */
function playChime(hz = 528, durMs = 400, gain = 0.08) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = hz;
    g.gain.setValueAtTime(0, ctx.currentTime);
    g.gain.linearRampToValueAtTime(gain, ctx.currentTime + 0.02);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + durMs / 1000);
    osc.connect(g).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + durMs / 1000 + 0.05);
  } catch (_) { /* silenced — Silence Shield respects */ }
}

export default function Reflexology() {
  const [mode, setMode] = useState('study'); // 'study' | 'locate' | 'routine'
  const [activeZone, setActiveZone] = useState(null);

  // Locate-game state
  const [targetId, setTargetId] = useState(null);
  const [streak, setStreak] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [attemptFeedback, setAttemptFeedback] = useState(null); // 'correct' | 'wrong'

  // Routine state
  const [routineStep, setRoutineStep] = useState(0);
  const [routineSecondsLeft, setRoutineSecondsLeft] = useState(0);
  const [routineActive, setRoutineActive] = useState(false);
  const tickRef = useRef(null);

  // Accrue Dust passively while the page is open (house convention)
  useEffect(() => {
    if (typeof window.__workAccrue === 'function') window.__workAccrue('reflexology', 8);
  }, []);

  // ── Mode: Locate Zone ──────────────────────────────────────
  const nextTarget = useCallback(() => {
    // Pick a random zone that's in the atlas, biased toward the routine set at low streaks
    const pool = streak < 3 ? STARTER_ROUTINE : FOOT_ZONES.map(z => z.id);
    const pick = pool[Math.floor(Math.random() * pool.length)];
    setTargetId(pick);
    setAttemptFeedback(null);
  }, [streak]);

  // ── Mode: Guided Routine ───────────────────────────────────
  const startRoutine = useCallback(() => {
    setRoutineStep(0);
    setRoutineActive(true);
    const firstZone = FOOT_ZONES.find(z => z.id === STARTER_ROUTINE[0]);
    setRoutineSecondsLeft(firstZone?.duration || 30);
  }, []);

  const advanceRoutine = useCallback(() => {
    const nextIdx = routineStep + 1;
    if (nextIdx >= STARTER_ROUTINE.length) {
      setRoutineActive(false);
      playChime(528, 700, 0.1);
      toast.success('Routine complete — resonance sealed.', { icon: <Sparkles size={14} /> });
      if (typeof window.__workAccrue === 'function') {
        window.__workAccrue('reflexology', 40); // bonus Dust for full routine
      }
      return;
    }
    setRoutineStep(nextIdx);
    const nextZone = FOOT_ZONES.find(z => z.id === STARTER_ROUTINE[nextIdx]);
    setRoutineSecondsLeft(nextZone?.duration || 30);
    playChime(417, 200, 0.05);
  }, [routineStep, correctCount]);

  useEffect(() => {
    if (!routineActive) return;
    clearInterval(tickRef.current);
    tickRef.current = setInterval(() => {
      setRoutineSecondsLeft(s => {
        if (s <= 1) {
          clearInterval(tickRef.current);
          advanceRoutine();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(tickRef.current);
  }, [routineActive, routineStep, advanceRoutine]);

  const currentRoutineZone = routineActive
    ? FOOT_ZONES.find(z => z.id === STARTER_ROUTINE[routineStep])
    : null;

  // ── Handle a zone tap — behavior depends on mode ──
  const handleZoneClick = useCallback((zone) => {
    if (mode === 'study') {
      setActiveZone(zone);
      playChime(zone.solfeggio, 250, 0.05);
    } else if (mode === 'locate') {
      if (zone.id === targetId) {
        setAttemptFeedback('correct');
        setActiveZone(zone);
        setStreak(s => s + 1);
        setCorrectCount(c => c + 1);
        playChime(528, 500, 0.09);
        if (typeof window.__workAccrue === 'function') window.__workAccrue('reflexology', 6);
        setTimeout(() => nextTarget(), 1400);
      } else {
        setAttemptFeedback('wrong');
        setStreak(0);
        playChime(396, 220, 0.04);
        // Reveal correct after a beat so it's educational, not punishing
        setTimeout(() => {
          const tgt = FOOT_ZONES.find(z => z.id === targetId);
          setActiveZone(tgt);
        }, 600);
      }
    } else if (mode === 'routine') {
      setActiveZone(zone);
    }
  }, [mode, targetId, nextTarget]);

  // Start a target when entering locate mode
  useEffect(() => {
    if (mode === 'locate' && !targetId) nextTarget();
    if (mode !== 'locate') setAttemptFeedback(null);
  }, [mode, targetId, nextTarget]);

  const targetZone = targetId ? FOOT_ZONES.find(z => z.id === targetId) : null;

  return (
    <HolographicChamber
      chamberId="reflexology"
      title="The Reflex Sanctuary"
      subtitle="Foot-mapped bodywork · 32 zones · Solfeggio paired"
    >
      <div className="max-w-5xl mx-auto px-4 pt-20 pb-32" data-testid="reflexology-page">

        {/* Mode tabs */}
        <div className="flex flex-wrap gap-2 mb-6 justify-center">
          {[
            { id: 'study', label: 'Study', icon: BookOpen, desc: 'Explore every zone' },
            { id: 'locate', label: 'Locate', icon: Target, desc: 'Gamified zone-ID' },
            { id: 'routine', label: 'Routine', icon: Play, desc: '8-zone guided sequence' },
          ].map(m => {
            const Icon = m.icon;
            const active = mode === m.id;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => setMode(m.id)}
                data-testid={`reflex-mode-${m.id}`}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all"
                style={{
                  background: active ? `${ACCENT}18` : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${active ? `${ACCENT}55` : 'rgba(255,255,255,0.08)'}`,
                  color: active ? ACCENT : 'rgba(255,255,255,0.6)',
                }}
              >
                <Icon size={14} />
                <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 15 }}>{m.label}</span>
                <span className="hidden sm:inline text-[9px] opacity-60" style={{ fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.15em', textTransform: 'uppercase' }}>{m.desc}</span>
              </button>
            );
          })}
        </div>

        {/* Mode-specific header panel */}
        {mode === 'locate' && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-5 rounded-2xl px-5 py-4 text-center"
            style={{ background: 'rgba(244,213,141,0.06)', border: '1px solid rgba(244,213,141,0.2)' }}
            data-testid="reflex-locate-panel"
          >
            <p className="text-[10px] uppercase tracking-[0.28em]" style={{ color: 'rgba(244,213,141,0.55)', fontFamily: 'JetBrains Mono, monospace' }}>
              Find the Zone · Streak {streak}
            </p>
            <p className="mt-1 text-2xl" style={{ color: ACCENT, fontFamily: 'Cormorant Garamond, serif' }}>
              {targetZone ? targetZone.name : '—'}
            </p>
            <p className="mt-1 text-[11px]" style={{ color: 'rgba(255,255,255,0.55)' }}>
              {targetZone?.sideOnly ? `${targetZone.sideOnly === 'left' ? 'Left foot only' : 'Right foot only'}` : 'Either foot works'}
            </p>
            {attemptFeedback === 'correct' && (
              <p className="mt-2 text-xs" style={{ color: '#22C55E' }}>
                <CheckCircle2 size={12} className="inline mr-1" /> Correct · +6 Dust
              </p>
            )}
            {attemptFeedback === 'wrong' && (
              <p className="mt-2 text-xs" style={{ color: '#F87171' }}>
                Not quite — the correct zone is now highlighted. Try the next one.
              </p>
            )}
          </motion.div>
        )}

        {mode === 'routine' && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-5 rounded-2xl px-5 py-4"
            style={{ background: 'rgba(244,213,141,0.06)', border: '1px solid rgba(244,213,141,0.2)' }}
            data-testid="reflex-routine-panel"
          >
            {!routineActive ? (
              <div className="text-center">
                <p className="text-[10px] uppercase tracking-[0.28em] mb-2" style={{ color: 'rgba(244,213,141,0.55)', fontFamily: 'JetBrains Mono, monospace' }}>
                  Starter Routine · 8 zones · ~8 min
                </p>
                <p className="mb-3" style={{ color: 'rgba(255,255,255,0.7)', fontFamily: 'Cormorant Garamond, serif', fontSize: 17 }}>
                  A guided bodywork sequence. Follow the pulse. Complete the full arc for +40 Dust.
                </p>
                <button
                  type="button"
                  onClick={startRoutine}
                  data-testid="reflex-routine-start"
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-medium"
                  style={{ background: ACCENT, color: '#0B0C15', fontFamily: 'Cormorant Garamond, serif' }}
                >
                  <Play size={14} /> Begin Routine
                </button>
              </div>
            ) : currentRoutineZone && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] uppercase tracking-[0.28em]" style={{ color: 'rgba(244,213,141,0.55)', fontFamily: 'JetBrains Mono, monospace' }}>
                    Step {routineStep + 1} / {STARTER_ROUTINE.length}
                  </span>
                  <span className="text-[10px] flex items-center gap-1" style={{ color: ACCENT, fontFamily: 'JetBrains Mono, monospace' }}>
                    <Clock size={10} /> {routineSecondsLeft}s
                  </span>
                </div>
                <p className="text-2xl mb-1" style={{ color: ACCENT, fontFamily: 'Cormorant Garamond, serif' }}>
                  {currentRoutineZone.name}
                </p>
                <p className="text-xs" style={{ color: 'rgba(255,255,255,0.7)' }}>
                  {currentRoutineZone.technique}
                </p>
                <div className="mt-3 h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
                  <motion.div
                    key={routineStep}
                    initial={{ width: '100%' }}
                    animate={{ width: '0%' }}
                    transition={{ duration: currentRoutineZone.duration, ease: 'linear' }}
                    style={{ height: '100%', background: ACCENT }}
                  />
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Foot map */}
        <FootMap
          onZoneClick={handleZoneClick}
          highlightZoneId={mode === 'routine' && currentRoutineZone ? currentRoutineZone.id : activeZone?.id}
          practiceTargetId={mode === 'locate' ? targetId : null}
          revealAll={mode === 'study'}
        />

        {/* Active zone info sheet */}
        <AnimatePresence>
          {activeZone && (
            <motion.div
              key={activeZone.id}
              initial={{ opacity: 0, y: 12, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: 12, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-6 rounded-2xl overflow-hidden"
              style={{
                background: `${ELEMENT_COLOR[activeZone.element]}06`,
                border: `1px solid ${ELEMENT_COLOR[activeZone.element]}25`,
              }}
              data-testid="reflex-zone-sheet"
            >
              <div className="px-5 py-4">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <p className="text-[9px] uppercase tracking-[0.28em]" style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'JetBrains Mono, monospace' }}>
                      {activeZone.system} · {activeZone.organ}
                    </p>
                    <h3 className="text-2xl mt-1" style={{ color: ELEMENT_COLOR[activeZone.element], fontFamily: 'Cormorant Garamond, serif' }}>
                      {activeZone.name}
                    </h3>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'JetBrains Mono, monospace' }}>Solfeggio</p>
                    <p className="text-lg" style={{ color: ACCENT, fontFamily: 'JetBrains Mono, monospace' }}>{activeZone.solfeggio} Hz</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3 text-[10px]" style={{ color: 'var(--text-muted)' }}>
                  <div>
                    <div className="uppercase tracking-wider text-[8px] mb-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>Element</div>
                    <div style={{ color: ELEMENT_COLOR[activeZone.element] }}>{activeZone.element}</div>
                  </div>
                  <div>
                    <div className="uppercase tracking-wider text-[8px] mb-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>Duration</div>
                    <div style={{ color: ACCENT }}>{activeZone.duration}s</div>
                  </div>
                  <div>
                    <div className="uppercase tracking-wider text-[8px] mb-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>Side</div>
                    <div>{activeZone.sideOnly ? activeZone.sideOnly : 'both'}</div>
                  </div>
                  <div>
                    <div className="uppercase tracking-wider text-[8px] mb-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>System</div>
                    <div>{activeZone.system}</div>
                  </div>
                </div>

                <p className="mt-4 leading-relaxed" style={{ color: 'rgba(255,255,255,0.82)', fontFamily: 'Cormorant Garamond, serif', fontSize: 17 }}>
                  <span className="block text-[9px] uppercase tracking-[0.28em] mb-1" style={{ color: 'rgba(255,255,255,0.35)', fontFamily: 'JetBrains Mono, monospace' }}>
                    Technique
                  </span>
                  {activeZone.technique}
                </p>

                <div className="mt-4">
                  <p className="text-[9px] uppercase tracking-[0.28em] mb-2" style={{ color: 'rgba(255,255,255,0.35)', fontFamily: 'JetBrains Mono, monospace' }}>
                    Benefits
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {activeZone.benefits.map(b => (
                      <span key={b} className="text-[10px] px-2 py-0.5 rounded-full"
                        style={{
                          background: `${ELEMENT_COLOR[activeZone.element]}10`,
                          color: 'rgba(255,255,255,0.75)',
                          border: `1px solid ${ELEMENT_COLOR[activeZone.element]}20`,
                        }}>
                        {b}
                      </span>
                    ))}
                  </div>
                </div>

                {mode === 'locate' && attemptFeedback === 'correct' && (
                  <button
                    type="button"
                    onClick={nextTarget}
                    data-testid="reflex-next-target"
                    className="mt-4 inline-flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs"
                    style={{ background: `${ACCENT}18`, color: ACCENT, border: `1px solid ${ACCENT}44`, fontFamily: 'Cormorant Garamond, serif' }}
                  >
                    Next Zone <ArrowRight size={12} />
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer: Sovereign note */}
        <div className="mt-8 text-center text-[10px]" style={{ color: 'rgba(255,255,255,0.3)', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.2em' }}>
          EDUCATIONAL · NOT MEDICAL ADVICE · HONOR YOUR BODY
        </div>
      </div>
    </HolographicChamber>
  );
}
