import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Headphones, X, Pause, Play } from 'lucide-react';

const FREQUENCIES = [
  { name: '432Hz Calm', freq: 432, color: '#D8B4FE' },
  { name: '528Hz Love', freq: 528, color: '#FDA4AF' },
  { name: '396Hz Release', freq: 396, color: '#2DD4BF' },
  { name: '741Hz Intuition', freq: 741, color: '#3B82F6' },
];

export default function QuickMeditationWidget() {
  const [open, setOpen] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(null);
  const [countdown, setCountdown] = useState(30);
  const audioCtxRef = useRef(null);
  const nodesRef = useRef(null);
  const timerRef = useRef(null);

  const stop = useCallback(() => {
    if (nodesRef.current) {
      nodesRef.current.gain.gain.linearRampToValueAtTime(0, (audioCtxRef.current?.currentTime || 0) + 0.3);
      setTimeout(() => {
        try { nodesRef.current?.osc.stop(); } catch {}
        try { nodesRef.current?.osc2.stop(); } catch {}
        nodesRef.current = null;
      }, 400);
    }
    clearInterval(timerRef.current);
    setPlaying(false);
    setCurrent(null);
    setCountdown(30);
  }, []);

  const play = useCallback((freq) => {
    stop();
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    audioCtxRef.current = ctx;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.08, ctx.currentTime + 1);
    gain.connect(ctx.destination);

    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq.freq, ctx.currentTime);
    osc.connect(gain);
    osc.start();

    // Subtle binaural-like second oscillator
    const osc2 = ctx.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(freq.freq + 4, ctx.currentTime);
    const gain2 = ctx.createGain();
    gain2.gain.setValueAtTime(0.03, ctx.currentTime);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start();

    nodesRef.current = { osc, osc2, gain };
    setCurrent(freq);
    setPlaying(true);
    setCountdown(30);

    timerRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          stop();
          return 30;
        }
        return prev - 1;
      });
    }, 1000);
  }, [stop]);

  useEffect(() => {
    return () => { stop(); };
  }, [stop]);

  return (
    <div className="fixed bottom-6 right-4 z-[88]" data-testid="quick-meditation-widget">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            className="absolute bottom-16 right-0 w-64 rounded-2xl overflow-hidden mb-2"
            style={{
              background: 'rgba(12, 14, 24, 0.98)',
              border: '1px solid rgba(255,255,255,0.08)',
              backdropFilter: 'blur(24px)',
              boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
            }}
          >
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-bold uppercase tracking-[0.15em]" style={{ color: 'var(--text-muted)' }}>Quick Frequency</p>
                <button onClick={() => { stop(); setOpen(false); }} className="p-1 rounded-md" style={{ color: 'var(--text-muted)' }}>
                  <X size={12} />
                </button>
              </div>

              {playing && current ? (
                <div className="text-center py-3">
                  <motion.div
                    animate={{ scale: [1, 1.2, 1], opacity: [0.6, 1, 0.6] }}
                    transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                    className="w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center"
                    style={{ background: `${current.color}15`, border: `1px solid ${current.color}25` }}
                  >
                    <Headphones size={22} style={{ color: current.color }} />
                  </motion.div>
                  <p className="text-sm font-medium mb-1" style={{ color: current.color }}>{current.name}</p>
                  <p className="text-2xl font-light mb-3" style={{ fontFamily: 'Cormorant Garamond, serif', color: 'var(--text-primary)' }}>
                    0:{String(countdown).padStart(2, '0')}
                  </p>
                  <button onClick={stop}
                    className="flex items-center gap-1.5 mx-auto px-4 py-2 rounded-full text-xs"
                    style={{ background: 'rgba(255,255,255,0.04)', color: 'var(--text-muted)', border: '1px solid rgba(255,255,255,0.08)' }}
                    data-testid="quick-meditation-stop">
                    <Pause size={11} /> Stop
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-[10px] mb-2" style={{ color: 'var(--text-muted)' }}>30-second calming frequency</p>
                  {FREQUENCIES.map(f => (
                    <button key={f.freq} onClick={() => play(f)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all hover:scale-[1.01]"
                      style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}
                      data-testid={`quick-freq-${f.freq}`}>
                      <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ background: `${f.color}12` }}>
                        <Headphones size={13} style={{ color: f.color }} />
                      </div>
                      <div>
                        <p className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>{f.name}</p>
                        <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{f.freq}Hz</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main floating button */}
      <motion.button
        onClick={() => setOpen(o => !o)}
        animate={playing ? { scale: [1, 1.05, 1] } : {}}
        transition={playing ? { duration: 2, repeat: Infinity } : {}}
        className="w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-all"
        style={{
          background: playing ? `${current?.color || '#D8B4FE'}20` : 'rgba(22, 24, 38, 0.9)',
          border: `1px solid ${playing ? `${current?.color || '#D8B4FE'}30` : 'rgba(255,255,255,0.08)'}`,
          backdropFilter: 'blur(12px)',
          boxShadow: playing ? `0 0 30px ${current?.color || '#D8B4FE'}15` : '0 4px 24px rgba(0,0,0,0.3)',
        }}
        data-testid="quick-meditation-btn"
      >
        <Headphones size={18} style={{ color: playing ? current?.color : 'var(--text-muted)' }} />
      </motion.button>
    </div>
  );
}
