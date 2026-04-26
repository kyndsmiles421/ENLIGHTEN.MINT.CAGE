/**
 * ENLIGHTEN.MINT.CAFE: GRAND FINALE COORDINATOR
 * Triggers Universal Alignment when all nodules are activated.
 * 
 * Features:
 * - Divine Alignment Chord (528Hz + 963Hz)
 * - Heartbeat Haptic Sequence
 * - Karma Particle Explosion
 * - Visual Bloom Overlay
 */

import React, { useEffect, useState, useMemo, useCallback, useRef } from 'react';

// Audio Engine Hook
const useSolfeggio = () => {
  const audioCtxRef = useRef(null);
  const masterGainRef = useRef(null);

  const initAudio = useCallback(async () => {
    if (audioCtxRef.current) return;
    audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    masterGainRef.current = audioCtxRef.current.createGain();
    masterGainRef.current.gain.setValueAtTime(0.3, audioCtxRef.current.currentTime);
    masterGainRef.current.connect(audioCtxRef.current.destination);
  }, []);

  const playSolfeggioChord = useCallback(async (frequencies, options = {}) => {
    await initAudio();
    const ctx = audioCtxRef.current;
    if (ctx.state === 'suspended') await ctx.resume();

    const { volume = 0.5, attack = 0.5, sustain = 3, release = 2 } = options;
    const duration = attack + sustain + release;

    frequencies.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const panner = ctx.createStereoPanner();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      // Slight detune for richness
      osc.detune.setValueAtTime((i - frequencies.length / 2) * 5, ctx.currentTime);

      // Stereo spread
      panner.pan.setValueAtTime((i - frequencies.length / 2) * 0.3, ctx.currentTime);

      // ADSR Envelope
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + attack);
      gain.gain.setValueAtTime(volume * 0.8, ctx.currentTime + attack + sustain);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(panner);
      panner.connect(masterGainRef.current);

      osc.start();
      osc.stop(ctx.currentTime + duration);
    });

    console.log(`[Solfeggio] Chord: ${frequencies.join('Hz + ')}Hz`);
  }, [initAudio]);

  const shiftEnvironmentPitch = useCallback(async (semitones, duration = 2) => {
    // This would affect all active oscillators
    console.log(`[Solfeggio] Environment shift: ${semitones} semitones over ${duration}s`);
  }, []);

  return { playSolfeggioChord, shiftEnvironmentPitch };
};

// Resonance Engine Hook
const useResonance = () => {
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);
  const animationRef = useRef(null);

  const triggerHaptics = useCallback((patterns) => {
    if (!navigator.vibrate) return;

    // Convert pattern objects to vibration array
    const vibrationPattern = [];
    patterns.forEach(p => {
      if (p.duration) vibrationPattern.push(p.duration);
      if (p.interval) vibrationPattern.push(p.interval);
    });

    try {
      navigator.vibrate(vibrationPattern);
      console.log(`[Haptics] Pattern: ${vibrationPattern.join(', ')}ms`);
    } catch (e) {
      console.warn('[Haptics] Not available');
    }
  }, []);

  const emitKarmaParticles = useCallback((options = {}) => {
    const {
      count = 100,
      velocity = 10,
      colors = ['#00FFC2', '#FFD700', '#A855F7'],
      lifespan = 3000,
      x = window.innerWidth / 2,
      y = window.innerHeight / 2,
    } = options;

    // Create or get canvas
    let canvas = document.getElementById('karma-canvas');
    if (!canvas) {
      canvas = document.createElement('canvas');
      canvas.id = 'karma-canvas';
      canvas.style.cssText = `
        position: fixed;
        inset: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 9999;
        mix-blend-mode: screen;
      `;
      document.body.appendChild(canvas);
    }

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Generate particles
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
      const speed = velocity * (0.5 + Math.random());
      
      particlesRef.current.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1.0,
        decay: 1 / (lifespan / 16), // 60fps
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 2 + Math.random() * 4,
      });
    }

    // Animate
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const p = particlesRef.current[i];
        
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.1; // Gravity
        p.vx *= 0.99; // Friction
        p.vy *= 0.99;
        p.life -= p.decay;

        if (p.life > 0) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = p.life;
          ctx.fill();
        } else {
          particlesRef.current.splice(i, 1);
        }
      }

      if (particlesRef.current.length > 0) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        // Cleanup
        canvas.remove();
      }
    };

    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    animate();

    console.log(`[Particles] Emitted ${count} karma particles`);
  }, []);

  return { triggerHaptics, emitKarmaParticles };
};

/**
 * GRAND FINALE COORDINATOR
 * Triggers when all 15 nodules are extracted.
 */
const GrandFinaleCoordinator = ({ 
  noduleCount = 0, 
  totalNodules = 15,
  onAlignmentComplete,
}) => {
  const [isResonating, setIsResonating] = useState(false);
  const [alignmentPhase, setAlignmentPhase] = useState(0); // 0-3 phases
  const hasTriggeredRef = useRef(false);
  
  const { triggerHaptics, emitKarmaParticles } = useResonance();
  const { playSolfeggioChord, shiftEnvironmentPitch } = useSolfeggio();

  // The "Divine Alignment" Chord: 528Hz (Love/DNA) + 963Hz (Divine Consciousness)
  const finalChord = useMemo(() => [528, 963], []);
  
  // Extended chord with more harmonics
  const fullAlignmentChord = useMemo(() => [396, 528, 639, 741, 963], []);

  const triggerCriticalMass = useCallback(async () => {
    if (hasTriggeredRef.current) return;
    hasTriggeredRef.current = true;
    setIsResonating(true);

    console.log("🌌 ENLIGHTEN.MINT.CAFE: Initiating Universal Alignment...");

    // PHASE 1: Initial Resonance (0-2s)
    setAlignmentPhase(1);
    
    // Initial chord swell
    playSolfeggioChord(finalChord, { 
      volume: 0.6, 
      attack: 1.5, 
      sustain: 3, 
      release: 2,
    });

    // Light haptic pulse
    triggerHaptics([
      { duration: 100, interval: 50 },
      { duration: 100, interval: 50 },
      { duration: 200 },
    ]);

    // Initial particle burst
    emitKarmaParticles({
      count: 100,
      velocity: 8,
      colors: ['#00FFC2'],
      lifespan: 2000,
    });

    // PHASE 2: Building (2-5s)
    setTimeout(() => {
      setAlignmentPhase(2);
      
      // Add more frequencies
      playSolfeggioChord([639, 741], { 
        volume: 0.5, 
        attack: 1, 
        sustain: 4, 
        release: 2,
      });

      // Heavier haptic
      triggerHaptics([
        { duration: 200, interval: 100 },
        { duration: 300, interval: 80 },
        { duration: 400 },
      ]);

      // Gold particles
      emitKarmaParticles({
        count: 150,
        velocity: 12,
        colors: ['#00FFC2', '#FFD700'],
        lifespan: 3000,
      });
    }, 2000);

    // PHASE 3: Critical Mass (5-8s)
    setTimeout(() => {
      setAlignmentPhase(3);
      
      // Full alignment chord
      playSolfeggioChord(fullAlignmentChord, { 
        volume: 0.8, 
        attack: 0.5, 
        sustain: 5, 
        release: 3,
      });

      // Heavy "heartbeat" haptic sequence
      triggerHaptics([
        { duration: 200, interval: 100 },
        { duration: 400, interval: 50 },
        { duration: 800, interval: 100 },
        { duration: 1000 },
      ]);

      // Massive particle explosion
      emitKarmaParticles({
        count: 300,
        velocity: 20,
        colors: ['#00FFC2', '#FFD700', '#A855F7'],
        lifespan: 5000,
      });

      console.log("🌌 ENLIGHTEN.MINT.CAFE: Universal Alignment Achieved!");
    }, 5000);

    // PHASE 4: Resolution (8-12s)
    setTimeout(() => {
      setAlignmentPhase(4);
      
      // Resonance complete callback
      if (onAlignmentComplete) {
        onAlignmentComplete();
      }

      // Fade out
      setTimeout(() => {
        setIsResonating(false);
        setAlignmentPhase(0);
        hasTriggeredRef.current = false;
      }, 4000);
    }, 8000);

  }, [finalChord, fullAlignmentChord, playSolfeggioChord, triggerHaptics, emitKarmaParticles, onAlignmentComplete]);

  // Watch for critical mass
  useEffect(() => {
    if (noduleCount >= totalNodules && !isResonating && !hasTriggeredRef.current) {
      triggerCriticalMass();
    }
  }, [noduleCount, totalNodules, isResonating, triggerCriticalMass]);

  // Progress indicator (for partial alignment)
  const alignmentProgress = Math.min(noduleCount / totalNodules, 1);

  return (
    <>
      {/* Alignment Overlay */}
      <div className={`singularity-overlay phase-${alignmentPhase} ${isResonating ? 'active-bloom' : ''}`}>
        {/* Progress Ring (shows before full alignment) */}
        {!isResonating && alignmentProgress > 0 && alignmentProgress < 1 && (
          <div className="alignment-progress">
            <svg viewBox="0 0 100 100">
              <circle 
                cx="50" cy="50" r="45" 
                fill="none" 
                stroke="rgba(0,255,195,0.1)" 
                strokeWidth="2"
              />
              <circle 
                cx="50" cy="50" r="45" 
                fill="none" 
                stroke="#00FFC2" 
                strokeWidth="2"
                strokeDasharray={`${alignmentProgress * 283} 283`}
                strokeLinecap="round"
                transform="rotate(-90 50 50)"
              />
            </svg>
            <span className="progress-text">{Math.round(alignmentProgress * 100)}%</span>
          </div>
        )}
      </div>

      <style>{`
        .singularity-overlay {
          position: fixed;
          inset: 0;
          pointer-events: none;
          transition: all 2s ease-in-out;
          z-index: 9998;
        }

        .singularity-overlay.active-bloom {
          background: radial-gradient(circle at center, rgba(0,255,195,0.1) 0%, transparent 70%);
        }

        .singularity-overlay.phase-1 {
          background: radial-gradient(circle at center, rgba(0,255,195,0.15) 0%, transparent 60%);
          backdrop-filter: brightness(1.1);
        }

        .singularity-overlay.phase-2 {
          background: radial-gradient(circle at center, rgba(251,192,45,0.15) 0%, rgba(0,255,195,0.1) 40%, transparent 70%);
          backdrop-filter: brightness(1.2) saturate(1.2);
        }

        .singularity-overlay.phase-3 {
          background: radial-gradient(circle at center, rgba(168,85,247,0.2) 0%, rgba(251,192,45,0.15) 30%, rgba(0,255,195,0.1) 60%, transparent 80%);
          backdrop-filter: brightness(1.4) saturate(1.8) blur(2px);
          animation: critical-mass 4s ease-in-out infinite;
        }

        .singularity-overlay.phase-4 {
          background: radial-gradient(circle at center, rgba(255,255,255,0.1) 0%, transparent 50%);
          backdrop-filter: brightness(1.2);
        }

        @keyframes critical-mass {
          0%, 100% { 
            filter: hue-rotate(0deg) brightness(1); 
            transform: scale(1);
          }
          50% { 
            filter: hue-rotate(15deg) brightness(1.3); 
            transform: scale(1.02);
          }
        }

        .alignment-progress {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 120px;
          height: 120px;
          opacity: 0.6;
        }

        .alignment-progress svg {
          width: 100%;
          height: 100%;
          animation: progress-pulse 2s ease-in-out infinite;
        }

        @keyframes progress-pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.8; }
        }

        .progress-text {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          font-size: 14px;
          font-weight: 700;
          color: #00FFC2;
          font-family: 'JetBrains Mono', monospace;
        }
      `}</style>
    </>
  );
};

// Export hooks for external use
export { useSolfeggio, useResonance };
export default GrandFinaleCoordinator;
