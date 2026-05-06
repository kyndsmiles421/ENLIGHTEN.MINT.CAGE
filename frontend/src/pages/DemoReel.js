/**
 * DemoReel.js — V1.0.20 60-Second Auto-Walk Demo Reel
 *
 * Renders all 5 new 3D experiences in a single scrolling take:
 *   1. HelixNav3D (10s)
 *   2. Chamber3DGame (Geology, break mode) (12s)
 *   3. Forge3D + LOX (CRUISE→BOOST→HYPER→MAXIMUM) (15s)
 *   4. TesseractVault (relic auto-cycle) (12s)
 *   5. BlackHillsBathymetry (Pactola) (11s)
 *
 * Total: 60 seconds. Use any browser screen-recorder (Chrome
 * built-in, Loom, OBS) starting on /demo-reel to capture the
 * complete walkthrough as a single asset for the Play Store.
 *
 * Each scene auto-transitions via setTimeout. Manual override
 * available via the SKIP / RESTART pills at the top.
 */
import React, { Suspense, lazy, useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, RotateCcw, ChevronRight, Pause } from 'lucide-react';

const HelixNav3D = lazy(() => import('../components/HelixNav3D'));
const Chamber3DGame = lazy(() => import('../components/games/Chamber3DGame'));
const Forge3D = lazy(() => import('../components/Forge3D'));
const TesseractVault = lazy(() => import('../components/TesseractVault'));
const BlackHillsBathymetry = lazy(() => import('../components/BlackHillsBathymetry'));

const SCENES = [
  { id: 'helix',    label: 'Sovereign Helix',    duration: 10, color: '#C4B5FD', subtitle: '81 NODES · GOLDEN SPIRAL · VECTOR-SHIFT NAV' },
  { id: 'geology',  label: 'Geology Workshop',   duration: 12, color: '#FBBF24', subtitle: 'FFT VERTEX DISPLACEMENT · CENTRIFUGAL SHARDS' },
  { id: 'forge',    label: 'The Forge',          duration: 15, color: '#FB7185', subtitle: 'GEAR RATIOS · ω₂ = ω₁·(N₁/N₂) · LOX VAPOR' },
  { id: 'vault',    label: 'Tesseract Vault',    duration: 12, color: '#FCD34D', subtitle: '4D HYPERCUBE · 8 HAWAIIAN RELICS' },
  { id: 'pactola',  label: 'Pactola Reservoir',  duration: 11, color: '#93C5FD', subtitle: 'BLACK HILLS BATHYMETRY · 150ft · MAN-MADE 1956' },
];

export default function DemoReel() {
  const [sceneIdx, setSceneIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const [elapsed, setElapsed] = useState(0);  // within current scene
  const [done, setDone] = useState(false);
  const timerRef = useRef(null);

  const scene = SCENES[sceneIdx];
  const totalDuration = SCENES.reduce((s, x) => s + x.duration, 0);
  const overallElapsed = SCENES.slice(0, sceneIdx).reduce((s, x) => s + x.duration, 0) + elapsed;
  const progress = overallElapsed / totalDuration;

  useEffect(() => {
    if (done || paused) return;
    timerRef.current = setInterval(() => {
      setElapsed((e) => {
        if (e + 0.1 >= scene.duration) {
          if (sceneIdx + 1 >= SCENES.length) {
            setDone(true);
            return scene.duration;
          }
          setSceneIdx((i) => i + 1);
          return 0;
        }
        return e + 0.1;
      });
    }, 100);
    return () => clearInterval(timerRef.current);
  }, [sceneIdx, paused, scene.duration, done]);

  const restart = () => {
    setSceneIdx(0);
    setElapsed(0);
    setDone(false);
    setPaused(false);
  };
  const skip = () => {
    setElapsed(0);
    if (sceneIdx + 1 >= SCENES.length) {
      setDone(true);
    } else {
      setSceneIdx((i) => i + 1);
    }
  };

  return (
    <div
      data-testid="demo-reel-page"
      style={{
        minHeight: '100vh',
        padding: '20px 16px 80px',
        background: 'var(--bg-primary, #02060f)',
        color: 'var(--text-primary, #e2e8f0)',
        maxWidth: 1100,
        margin: '0 auto',
      }}
    >
      {/* Title bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 6, gap: 10, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 300, fontSize: '1.75rem', margin: 0 }}>
            Sovereign Engine · Demo Reel
          </h1>
          <p style={{ fontSize: 11, letterSpacing: 1.5, color: 'var(--text-muted, #94a3b8)', margin: '2px 0 0' }}>
            60-SECOND AUTO-WALK · {SCENES.length} ROUTES · SCREEN-RECORD READY
          </p>
        </div>
        <div style={{ display: 'inline-flex', gap: 6 }}>
          <button
            type="button"
            onClick={() => setPaused((p) => !p)}
            data-testid="demo-reel-pause"
            style={pillStyle(scene.color, false)}
          >
            {paused ? <Play size={11} /> : <Pause size={11} />} {paused ? 'RESUME' : 'PAUSE'}
          </button>
          <button
            type="button"
            onClick={skip}
            disabled={done}
            data-testid="demo-reel-skip"
            style={pillStyle(scene.color, false)}
          >
            SKIP <ChevronRight size={11} />
          </button>
          <button
            type="button"
            onClick={restart}
            data-testid="demo-reel-restart"
            style={pillStyle(scene.color, false)}
          >
            <RotateCcw size={11} /> RESTART
          </button>
        </div>
      </div>

      {/* Scene chips (sequential row, inline) */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
        {SCENES.map((s, i) => (
          <span
            key={s.id}
            data-testid={`demo-chip-${s.id}`}
            style={{
              padding: '4px 10px',
              borderRadius: 999,
              fontFamily: 'monospace',
              fontSize: 9,
              letterSpacing: 1.5,
              border: `1px solid ${i === sceneIdx ? s.color : `${s.color}33`}`,
              background: i === sceneIdx ? `${s.color}15` : 'transparent',
              color: i === sceneIdx ? s.color : `${s.color}99`,
              opacity: i < sceneIdx ? 0.5 : 1,
            }}
          >
            {i + 1}. {s.label}
          </span>
        ))}
      </div>

      {/* Overall progress bar */}
      <div style={{
        height: 3,
        borderRadius: 2,
        background: 'rgba(255,255,255,0.05)',
        overflow: 'hidden',
        marginBottom: 14,
      }}>
        <motion.div
          animate={{ width: `${progress * 100}%` }}
          transition={{ duration: 0.1 }}
          style={{
            height: '100%',
            background: `linear-gradient(90deg, ${scene.color}aa, ${scene.color})`,
          }}
        />
      </div>

      {/* Scene caption */}
      <AnimatePresence mode="wait">
        <motion.div
          key={scene.id + '-caption'}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.4 }}
          style={{
            padding: '10px 14px',
            borderRadius: 10,
            background: `${scene.color}08`,
            border: `1px solid ${scene.color}22`,
            marginBottom: 14,
            fontFamily: 'monospace',
          }}
        >
          <div style={{ fontSize: 11, letterSpacing: 2, color: scene.color }}>
            SCENE {sceneIdx + 1} · {scene.label.toUpperCase()}
          </div>
          <div style={{ fontSize: 10, letterSpacing: 1.5, color: `${scene.color}aa`, marginTop: 3 }}>
            {scene.subtitle}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Active scene */}
      <AnimatePresence mode="wait">
        <motion.div
          key={scene.id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.5 }}
        >
          <Suspense fallback={<SceneFallback color={scene.color} />}>
            {scene.id === 'helix' && <HelixNav3D height={520} autoRotate />}
            {scene.id === 'geology' && (
              <Chamber3DGame
                open
                onClose={() => {}}
                color="#FBBF24"
                mode="break"
                title="STRIKE THE FORMATION"
                verb="STRIKE"
                targetCount={3}
                hitsPerTarget={2}
                zone="demo_geology"
                completionMsg="CRYSTAL REVEALED"
                completionXP={6}
              />
            )}
            {scene.id === 'forge' && <Forge3D running />}
            {scene.id === 'vault' && <TesseractVault />}
            {scene.id === 'pactola' && <BlackHillsBathymetry />}
          </Suspense>
        </motion.div>
      </AnimatePresence>

      {done && (
        <div data-testid="demo-reel-done" style={{
          marginTop: 18,
          padding: '14px 16px',
          borderRadius: 12,
          background: 'rgba(124,58,237,0.08)',
          border: '1px solid rgba(124,58,237,0.25)',
          fontFamily: 'monospace',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: 12, letterSpacing: 2, color: '#C4B5FD' }}>
            DEMO REEL COMPLETE · {totalDuration}s
          </div>
          <div style={{ fontSize: 10, letterSpacing: 1.5, color: 'rgba(196,181,253,0.7)', marginTop: 3 }}>
            STOP YOUR SCREEN RECORDER · SAVE FOR PLAY STORE LISTING
          </div>
          <button
            type="button"
            onClick={restart}
            data-testid="demo-reel-replay"
            style={{ ...pillStyle('#C4B5FD', true), marginTop: 10 }}
          >
            <RotateCcw size={11} /> REPLAY
          </button>
        </div>
      )}
    </div>
  );
}

function SceneFallback({ color }) {
  return (
    <div style={{
      width: '100%',
      height: 480,
      borderRadius: 16,
      background: `${color}05`,
      border: `1px solid ${color}22`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'monospace',
      fontSize: 10,
      letterSpacing: 2,
      color,
    }}>
      LOADING SCENE...
    </div>
  );
}

function pillStyle(color, filled) {
  return {
    padding: '5px 11px',
    borderRadius: 999,
    fontFamily: 'monospace',
    fontSize: 9,
    letterSpacing: 1.5,
    cursor: 'pointer',
    border: `1px solid ${color}55`,
    background: filled ? `${color}18` : 'transparent',
    color,
    display: 'inline-flex',
    alignItems: 'center',
    gap: 5,
  };
}
