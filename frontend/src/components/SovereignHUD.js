import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSovereign } from '../context/SovereignContext';
import { Zap, Activity, Cpu, Radio } from 'lucide-react';

const CHANNEL_META = {
  0: { label: 'Nexus Path', color: '#EAB308', icon: Zap },
  1: { label: 'Sensory Stream', color: '#C084FC', icon: Radio },
  2: { label: 'Background Orbit', color: '#60A5FA', icon: Cpu },
};

// ━━━ Sovereign NPU HUD — Priority Queue Visibility ━━━
export default function SovereignHUD() {
  const { getQueueStats, eventBus, tier } = useSovereign();
  const [stats, setStats] = useState({ enqueued: 0, completed: 0, errors: 0, pending: 0, active: 0, npu_burst: false });
  const [recentTasks, setRecentTasks] = useState([]);
  const [expanded, setExpanded] = useState(false);
  const [pulseActive, setPulseActive] = useState(false);
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const dataRef = useRef({ streams: [[], [], []] });

  // Subscribe to queue events
  useEffect(() => {
    const refresh = () => setStats(getQueueStats());
    const interval = setInterval(refresh, 500);

    const unsub1 = eventBus.subscribe('task_enqueued', (data) => {
      refresh();
      setRecentTasks(prev => [{ ...data, ts: Date.now(), type: 'enqueued' }, ...prev].slice(0, 8));
      // Animate stream
      const ch = data.priority ?? 2;
      dataRef.current.streams[ch].push({ value: 1, age: 0 });
    });

    const unsub2 = eventBus.subscribe('task_complete', (data) => {
      refresh();
      setRecentTasks(prev => [{ ...data, ts: Date.now(), type: 'complete' }, ...prev].slice(0, 8));
    });

    const unsub3 = eventBus.subscribe('npu_burst', (data) => {
      setPulseActive(data.active);
      refresh();
    });

    const unsub4 = eventBus.subscribe('task_error', (data) => {
      refresh();
      setRecentTasks(prev => [{ ...data, ts: Date.now(), type: 'error' }, ...prev].slice(0, 8));
    });

    return () => { clearInterval(interval); unsub1(); unsub2(); unsub3(); unsub4(); };
  }, [eventBus, getQueueStats]);

  // Canvas data stream visualization
  const drawStreams = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);

    // Draw 3 priority streams converging to center
    const centerX = w / 2;
    const centerY = h;

    [0, 1, 2].forEach(ch => {
      const meta = CHANNEL_META[ch];
      const stream = dataRef.current.streams[ch];

      // Draw stream line
      const startX = (ch / 2) * w;
      const startY = 0;

      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.quadraticCurveTo(startX, h * 0.6, centerX, centerY);
      ctx.strokeStyle = `${meta.color}15`;
      ctx.lineWidth = 1;
      ctx.stroke();

      // Animate data packets flowing down stream
      stream.forEach((packet, i) => {
        packet.age += 0.02;
        if (packet.age > 1) return;

        const t = packet.age;
        const px = startX + (centerX - startX) * t * t;
        const py = startY + (centerY - startY) * t;

        ctx.beginPath();
        ctx.arc(px, py, 2 + (1 - t) * 2, 0, Math.PI * 2);
        ctx.fillStyle = `${meta.color}${Math.round((1 - t) * 180).toString(16).padStart(2, '0')}`;
        ctx.fill();
      });

      // Clean old packets
      dataRef.current.streams[ch] = stream.filter(p => p.age < 1);
    });

    // Center convergence glow
    const grad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 12);
    grad.addColorStop(0, `rgba(234,179,8,${stats.active > 0 ? 0.3 : 0.05})`);
    grad.addColorStop(1, 'transparent');
    ctx.fillStyle = grad;
    ctx.fillRect(centerX - 15, centerY - 15, 30, 30);

    animRef.current = requestAnimationFrame(drawStreams);
  }, [stats.active]);

  useEffect(() => {
    if (expanded) {
      drawStreams();
      return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
    }
  }, [expanded, drawStreams]);

  const tierColors = {
    standard: '#94A3B8', apprentice: '#2DD4BF', artisan: '#C084FC', sovereign: '#EAB308',
  };
  const hColor = tierColors[tier] || '#94A3B8';

  return (
    <motion.div
      className="fixed bottom-20 left-4 z-[150]"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 1, duration: 0.5 }}
      data-testid="sovereign-hud"
    >
      {/* Compact widget */}
      <motion.button
        className="relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl cursor-pointer"
        style={{
          background: stats.npu_burst ? 'rgba(234,179,8,0.12)' : 'rgba(6,6,14,0.85)',
          backdropFilter: 'blur(12px)',
          border: `1px solid ${stats.npu_burst ? 'rgba(234,179,8,0.3)' : 'rgba(248,250,252,0.06)'}`,
          boxShadow: stats.npu_burst ? `0 0 20px rgba(234,179,8,0.15)` : 'none',
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setExpanded(!expanded)}
        data-testid="hud-toggle"
      >
        {/* NPU pulse indicator */}
        {stats.npu_burst && (
          <motion.div
            className="absolute inset-0 rounded-xl"
            style={{ border: '1px solid rgba(234,179,8,0.4)' }}
            animate={{ scale: [1, 1.15, 1], opacity: [0.6, 0, 0.6] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        )}

        <Activity size={9} style={{ color: stats.active > 0 ? '#EAB308' : 'rgba(248,250,252,0.2)' }} />
        <span className="text-[7px] font-mono" style={{ color: stats.active > 0 ? hColor : 'rgba(248,250,252,0.25)' }}>
          {stats.active > 0 ? `${stats.active} active` : 'idle'}
        </span>
        {stats.pending > 0 && (
          <span className="text-[6px] px-1 py-0.5 rounded-full font-mono"
            style={{ background: `${hColor}15`, color: hColor }}>
            +{stats.pending}
          </span>
        )}
      </motion.button>

      {/* Expanded panel */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            className="absolute bottom-full left-0 mb-2 w-56 rounded-xl overflow-hidden"
            style={{
              background: 'rgba(6,6,14,0.95)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(248,250,252,0.06)',
            }}
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            data-testid="hud-panel"
          >
            {/* Header */}
            <div className="px-3 py-2 border-b" style={{ borderColor: 'rgba(248,250,252,0.04)' }}>
              <div className="flex items-center justify-between">
                <p className="text-[7px] tracking-wider uppercase font-medium" style={{ color: hColor }}>
                  Sovereign NPU
                </p>
                {stats.npu_burst && (
                  <motion.span
                    className="text-[6px] px-1.5 py-0.5 rounded-full font-bold"
                    style={{ background: 'rgba(234,179,8,0.15)', color: '#EAB308' }}
                    animate={{ opacity: [1, 0.5, 1] }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                  >
                    NPU BURST
                  </motion.span>
                )}
              </div>
            </div>

            {/* Stream visualization */}
            <div className="relative h-20">
              <canvas
                ref={canvasRef}
                width={224}
                height={80}
                className="w-full h-full"
              />
              {/* Channel labels overlaid */}
              <div className="absolute top-1 left-0 right-0 flex justify-between px-2">
                {[0, 1, 2].forEach(() => null)}
                {Object.entries(CHANNEL_META).map(([ch, meta]) => {
                  const ChannelIcon = meta.icon;
                  return (
                    <div key={ch} className="flex items-center gap-0.5">
                      <ChannelIcon size={6} style={{ color: `${meta.color}60` }} />
                      <span className="text-[5px] font-mono" style={{ color: `${meta.color}40` }}>
                        {meta.label.split(' ')[0]}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Stats grid */}
            <div className="px-3 py-2 grid grid-cols-3 gap-2 border-t" style={{ borderColor: 'rgba(248,250,252,0.03)' }}>
              <div className="text-center">
                <p className="text-[10px] font-mono font-bold" style={{ color: '#22C55E' }}>{stats.completed}</p>
                <p className="text-[5px] uppercase tracking-wider" style={{ color: 'rgba(248,250,252,0.15)' }}>Done</p>
              </div>
              <div className="text-center">
                <p className="text-[10px] font-mono font-bold" style={{ color: '#EAB308' }}>{stats.pending}</p>
                <p className="text-[5px] uppercase tracking-wider" style={{ color: 'rgba(248,250,252,0.15)' }}>Queue</p>
              </div>
              <div className="text-center">
                <p className="text-[10px] font-mono font-bold" style={{ color: stats.errors > 0 ? '#EF4444' : 'rgba(248,250,252,0.2)' }}>{stats.errors}</p>
                <p className="text-[5px] uppercase tracking-wider" style={{ color: 'rgba(248,250,252,0.15)' }}>Errors</p>
              </div>
            </div>

            {/* Recent tasks feed */}
            {recentTasks.length > 0 && (
              <div className="px-3 py-1.5 border-t max-h-24 overflow-y-auto" style={{ borderColor: 'rgba(248,250,252,0.03)' }}>
                <p className="text-[5px] uppercase tracking-wider mb-1" style={{ color: 'rgba(248,250,252,0.1)' }}>
                  Recent
                </p>
                {recentTasks.slice(0, 5).map((task, i) => {
                  const meta = CHANNEL_META[task.priority] || CHANNEL_META[2];
                  return (
                    <div key={`${task.id}-${i}`} className="flex items-center gap-1 mb-0.5">
                      <div className="w-1 h-1 rounded-full" style={{
                        background: task.type === 'complete' ? '#22C55E' : task.type === 'error' ? '#EF4444' : meta.color,
                      }} />
                      <span className="text-[5px] font-mono truncate flex-1" style={{ color: 'rgba(248,250,252,0.3)' }}>
                        {task.label || task.channel}
                      </span>
                      <span className="text-[5px] font-mono" style={{ color: 'rgba(248,250,252,0.1)' }}>
                        {task.type === 'complete' ? 'done' : task.type === 'error' ? 'err' : 'queued'}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
