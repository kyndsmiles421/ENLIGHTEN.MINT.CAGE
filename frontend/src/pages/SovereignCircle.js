/**
 * ENLIGHTEN.MINT.CAFE | Sovereign Circle — Master Module
 * Integrated: WebSocket sync, Orbital Peer UI, Host Controls, Share Cards
 * One file. One source of truth. No piecemeal.
 */
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Radio, Users, Crown, Copy, Share2, Play, Pause, Volume2, VolumeX,
  ArrowLeft, Loader, Plus, X, Eye, Zap
} from 'lucide-react';
import { toast } from 'sonner';
import { generateShareCard, downloadShareCard } from '../components/ShareCardService';
import { useChaosOscillator } from '../lib/ChaosEngine';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const WS_BASE = `${process.env.REACT_APP_BACKEND_URL.replace('https://', 'wss://').replace('http://', 'ws://')}/api/ws/sovereign-circle`;

const PHI = 1.618033988749895;
const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));
const DEFAULT_NODE = { id: 'rapid-city', name: 'Rapid City — Black Hills', lat: 44.0805, lng: -103.2310 };

const SOLFEGGIO = [
  { hz: 174, label: 'Foundation', color: '#EF4444' },
  { hz: 285, label: 'Renewal', color: '#FB923C' },
  { hz: 396, label: 'Liberation', color: '#FCD34D' },
  { hz: 417, label: 'Change', color: '#22C55E' },
  { hz: 528, label: 'Miracles', color: '#3B82F6' },
  { hz: 639, label: 'Connection', color: '#6366F1' },
  { hz: 741, label: 'Awakening', color: '#A855F7' },
  { hz: 852, label: 'Intuition', color: '#EC4899' },
  { hz: 963, label: 'Oneness', color: '#F8FAFC' },
];

const CIRCLE_COLORS = ['#EF4444', '#FB923C', '#FCD34D', '#22C55E', '#3B82F6', '#6366F1', '#A855F7'];

/* ── WebSocket Hook ──────────────────────────────────────── */
function useSovereignSocket(roomId, peerId) {
  const wsRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const [peerCount, setPeerCount] = useState(0);
  const [atmosphere, setAtmosphere] = useState(null);
  const [isHost, setIsHost] = useState(false);
  const reconnectRef = useRef(null);
  const connect = useCallback(() => {
    if (!roomId || !peerId) return;
    const url = `${WS_BASE}?room=${roomId}&peer=${peerId}`;
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      setConnected(true);
      ws.send(JSON.stringify({ type: 'ping' }));
    };

    ws.onmessage = (e) => {
      try {
        const msg = JSON.parse(e.data);
        if (msg.type === 'peer_count') {
          setPeerCount(msg.count);
          if (msg.count === 1) setIsHost(true);
        }
        if (msg.type === 'pong') setPeerCount(msg.peers);
        if (msg.type === 'atmosphere_sync') setAtmosphere(msg.payload);
      } catch {}
    };

    ws.onclose = () => {
      setConnected(false);
      reconnectRef.current = setTimeout(() => connect(), 3000);
    };

    ws.onerror = () => ws.close();
  }, [roomId, peerId]);

  const disconnect = useCallback(() => {
    clearTimeout(reconnectRef.current);
    wsRef.current?.close();
    wsRef.current = null;
    setConnected(false);
  }, []);

  const broadcastAtmosphere = useCallback((payload) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'atmosphere_sync', payload }));
    }
  }, []);

  useEffect(() => () => disconnect(), [disconnect]);

  return { connect, disconnect, connected, peerCount, atmosphere, isHost, setIsHost, broadcastAtmosphere };
}

/* ── Audio handled by ChaosEngine globally ───────────────── */

/* ── Orbital Canvas ──────────────────────────────────────── */
function OrbitalPeers({ peerCount, activeColor, isHost }) {
  const canvasRef = useRef(null);
  const frameRef = useRef(null);
  const tickRef = useRef(0);

  useEffect(() => {
    const c = canvasRef.current; if (!c) return;
    const ctx = c.getContext('2d');
    const w = c.width; const h = c.height;
    const cx = w / 2; const cy = h / 2;

    const draw = () => {
      tickRef.current++;
      const t = tickRef.current;
      ctx.clearRect(0, 0, w, h);

      // Orbital rings
      [35, 55, 80].forEach((r, i) => {
        ctx.beginPath();
        ctx.strokeStyle = `${activeColor}${(8 + i * 4).toString(16).padStart(2, '0')}`;
        ctx.lineWidth = 0.5;
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.stroke();
      });

      // Central node (host/self)
      const coreR = 14;
      const coreGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreR + 6);
      coreGrad.addColorStop(0, `${activeColor}88`);
      coreGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = coreGrad;
      ctx.beginPath(); ctx.arc(cx, cy, coreR + 6, 0, Math.PI * 2); ctx.fill();

      ctx.fillStyle = activeColor;
      ctx.beginPath(); ctx.arc(cx, cy, coreR, 0, Math.PI * 2); ctx.fill();

      if (isHost) {
        ctx.fillStyle = '#000';
        ctx.font = 'bold 8px monospace'; ctx.textAlign = 'center';
        ctx.fillText('HOST', cx, cy + 3);
      }

      // Peer nodes orbiting
      const peers = Math.max(0, peerCount - 1);
      for (let i = 0; i < peers; i++) {
        const orbitR = 40 + (i % 3) * 18;
        const angle = i * GOLDEN_ANGLE + t * 0.008 * (1 + i * 0.1);
        const x = cx + Math.cos(angle) * orbitR;
        const y = cy + Math.sin(angle) * orbitR * 0.75;
        const color = CIRCLE_COLORS[i % CIRCLE_COLORS.length];

        // Glow
        const glow = ctx.createRadialGradient(x, y, 0, x, y, 12);
        glow.addColorStop(0, `${color}40`);
        glow.addColorStop(1, 'transparent');
        ctx.fillStyle = glow;
        ctx.beginPath(); ctx.arc(x, y, 12, 0, Math.PI * 2); ctx.fill();

        // Node
        ctx.fillStyle = `${color}CC`;
        ctx.beginPath(); ctx.arc(x, y, 5 + Math.sin(t * 0.03 + i) * 1.5, 0, Math.PI * 2); ctx.fill();
      }

      // Count label
      ctx.fillStyle = 'rgba(255,255,255,0.3)';
      ctx.font = '8px monospace'; ctx.textAlign = 'center';
      ctx.fillText(`${peerCount} node${peerCount !== 1 ? 's' : ''}`, cx, h - 6);

      frameRef.current = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(frameRef.current);
  }, [peerCount, activeColor, isHost]);

  return (
    <canvas ref={canvasRef} width={200} height={200}
      className="mx-auto" style={{ touchAction: 'none' }}
      data-testid="sovereign-orbital-canvas" />
  );
}

/* ── Host Controls ───────────────────────────────────────── */
function HostControls({ onColorChange, onFreqChange, activeColor, activeFreq, onShare }) {
  return (
    <div className="space-y-4" data-testid="sovereign-host-controls">
      <div>
        <p className="text-[8px] font-bold uppercase tracking-widest mb-2" style={{ color: 'rgba(255,255,255,0.25)' }}>
          Broadcast Color
        </p>
        <div className="flex flex-wrap gap-2 justify-center">
          {CIRCLE_COLORS.map(c => (
            <button key={c} onClick={() => onColorChange(c)}
              className="w-8 h-8 rounded-full transition-all active:scale-90"
              style={{
                background: c,
                boxShadow: activeColor === c ? `0 0 20px ${c}60, 0 0 40px ${c}30` : 'none',
                border: activeColor === c ? '2px solid rgba(255,255,255,0.4)' : '2px solid transparent',
              }}
              data-testid={`host-color-${c.replace('#', '')}`} />
          ))}
        </div>
      </div>
      <div>
        <p className="text-[8px] font-bold uppercase tracking-widest mb-2" style={{ color: 'rgba(255,255,255,0.25)' }}>
          Solfeggio Frequency
        </p>
        <div className="grid grid-cols-3 gap-1.5">
          {SOLFEGGIO.map(s => (
            <button key={s.hz} onClick={() => onFreqChange(s.hz)}
              className="py-1.5 px-2 rounded-lg text-center active:scale-95 transition-all"
              style={{
                background: activeFreq === s.hz ? `${s.color}18` : 'rgba(255,255,255,0.02)',
                border: `1px solid ${activeFreq === s.hz ? `${s.color}40` : 'rgba(255,255,255,0.06)'}`,
                color: activeFreq === s.hz ? s.color : 'rgba(255,255,255,0.25)',
              }}
              data-testid={`host-freq-${s.hz}`}>
              <span className="text-[10px] font-bold">{s.hz}Hz</span>
              <span className="text-[7px] block" style={{ opacity: 0.6 }}>{s.label}</span>
            </button>
          ))}
        </div>
      </div>
      <button onClick={onShare}
        className="w-full py-2 rounded-xl text-xs flex items-center justify-center gap-2 active:scale-95 transition-all"
        style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.25)', color: '#3B82F6' }}
        data-testid="sovereign-share-moment">
        <Share2 size={12} /> Capture This Moment
      </button>
    </div>
  );
}

/* ── Main Component ──────────────────────────────────────── */
export default function SovereignCircle() {
  const navigate = useNavigate();
  const [screen, setScreen] = useState('lobby');
  const [roomId, setRoomId] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [roomName, setRoomName] = useState('');
  const [creating, setCreating] = useState(false);
  const [activeColor, setActiveColor] = useState('#6366F1');
  const [activeFreq, setActiveFreq] = useState(528);
  const [audioOn, setAudioOn] = useState(false);
  const [rooms, setRooms] = useState([]);

  const peerId = useMemo(() => `peer_${Date.now().toString(36)}`, []);
  const socket = useSovereignSocket(roomId, peerId);
  const chaosAudio = useChaosOscillator({ chaosCoeff: 1.0, driftRange: 3, chaosEnabled: true });

  // Apply received atmosphere
  useEffect(() => {
    if (socket.atmosphere) {
      if (socket.atmosphere.color) setActiveColor(socket.atmosphere.color);
      if (socket.atmosphere.freq) setActiveFreq(socket.atmosphere.freq);
    }
  }, [socket.atmosphere]);

  // Fetch active rooms on lobby
  useEffect(() => {
    if (screen === 'lobby') {
      fetch(`${API}/sovereign-live/rooms`).then(r => r.json()).then(d => setRooms(d.rooms || [])).catch(() => {});
    }
  }, [screen]);

  const createRoom = useCallback(async () => {
    setCreating(true);
    try {
      const res = await fetch(`${API}/sovereign-live/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: roomName || 'Sovereign Circle', node: 'rapid-city' }),
      });
      const data = await res.json();
      setRoomId(data.room_id);
      setScreen('session');
      socket.setIsHost(true);
      setTimeout(() => socket.connect(), 100);
      toast.success(`Circle "${data.name}" created`);
    } catch { toast.error('Could not create circle'); }
    setCreating(false);
  }, [roomName, socket]);

  const joinRoom = useCallback((id) => {
    setRoomId(id);
    setScreen('session');
    setTimeout(() => socket.connect(), 100);
  }, [socket]);

  const leaveRoom = useCallback(() => {
    socket.disconnect();
    setRoomId('');
    setScreen('lobby');
    setAudioOn(false);
  }, [socket]);

  const handleColorChange = useCallback((c) => {
    setActiveColor(c);
    socket.broadcastAtmosphere({ color: c, freq: activeFreq });
  }, [socket, activeFreq]);

  const handleFreqChange = useCallback((hz) => {
    setActiveFreq(hz);
    if (chaosAudio.activeName) {
      chaosAudio.toggle(hz, `solfeggio-${hz}`);
    }
    socket.broadcastAtmosphere({ color: activeColor, freq: hz });
  }, [socket, activeColor, chaosAudio]);

  const handleShare = useCallback(async () => {
    const entry = {
      id: roomId,
      name: roomName || 'Sovereign Circle',
      filters: { hueRotate: 0, brightness: 100, saturate: 100, contrast: 100 },
      source_prompt: `Live Session · ${activeFreq}Hz`,
      created_at: new Date().toISOString(),
    };
    const card = await generateShareCard(entry, [activeColor]);
    downloadShareCard(card, `sovereign_${roomId}`);
    toast.success('Moment captured');
  }, [roomId, roomName, activeColor, activeFreq]);

  // ── Lobby Screen ──
  if (screen === 'lobby') {
    return (
      <div className="min-h-screen px-5 py-8 max-w-lg mx-auto" data-testid="sovereign-lobby">
        <button onClick={() => navigate('/hub')} className="flex items-center gap-2 mb-6 text-xs"
          style={{ color: 'rgba(255,255,255,0.4)' }}>
          <ArrowLeft size={14} /> Hub
        </button>

        <p className="text-[10px] font-bold uppercase tracking-[0.3em] mb-2" style={{ color: '#6366F1' }}>
          <Radio size={12} className="inline mr-1.5" /> Sovereign Circle
        </p>
        <h1 className="text-3xl font-light tracking-tight mb-2" style={{ fontFamily: 'Cormorant Garamond, serif', color: 'rgba(248,250,252,0.85)' }}>
          Live Sessions
        </h1>
        <p className="text-xs mb-8" style={{ color: 'rgba(248,250,252,0.3)' }}>
          Share atmosphere in real-time. One host, infinite nodes.
        </p>

        {/* Default node */}
        <div className="rounded-xl p-3 mb-6 flex items-center gap-3"
          style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)' }}>
          <div className="w-2 h-2 rounded-full" style={{ background: '#22C55E', boxShadow: '0 0 8px #22C55E60' }} />
          <div>
            <p className="text-[10px] font-bold" style={{ color: '#6366F1' }}>{DEFAULT_NODE.name}</p>
            <p className="text-[8px]" style={{ color: 'rgba(255,255,255,0.2)' }}>
              Default Local Node · {DEFAULT_NODE.lat.toFixed(2)}°N, {Math.abs(DEFAULT_NODE.lng).toFixed(2)}°W
            </p>
          </div>
        </div>

        {/* Create */}
        <div className="rounded-xl p-4 mb-4" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <p className="text-[9px] font-bold uppercase tracking-widest mb-3" style={{ color: 'rgba(255,255,255,0.2)' }}>Create Circle</p>
          <input
            type="text" value={roomName} onChange={e => setRoomName(e.target.value)}
            placeholder="Circle name (optional)"
            className="w-full p-2.5 rounded-lg text-xs mb-3"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', color: '#F8FAFC', outline: 'none' }}
            data-testid="sovereign-room-name-input" />
          <button onClick={createRoom} disabled={creating}
            className="w-full py-2.5 rounded-xl text-xs font-medium flex items-center justify-center gap-2 active:scale-95 transition-all"
            style={{ background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.3)', color: '#6366F1', opacity: creating ? 0.5 : 1 }}
            data-testid="sovereign-create-btn">
            {creating ? <Loader size={12} className="animate-spin" /> : <Plus size={12} />}
            {creating ? 'Creating...' : 'Create Sovereign Circle'}
          </button>
        </div>

        {/* Join by code */}
        <div className="rounded-xl p-4 mb-6" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <p className="text-[9px] font-bold uppercase tracking-widest mb-3" style={{ color: 'rgba(255,255,255,0.2)' }}>Join Circle</p>
          <div className="flex gap-2">
            <input
              type="text" value={joinCode} onChange={e => setJoinCode(e.target.value)}
              placeholder="Enter room code (sc_...)"
              className="flex-1 p-2.5 rounded-lg text-xs"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', color: '#F8FAFC', outline: 'none' }}
              data-testid="sovereign-join-input" />
            <button onClick={() => joinCode.trim() && joinRoom(joinCode.trim())}
              className="px-4 py-2.5 rounded-lg text-xs font-bold active:scale-95"
              style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)', color: '#22C55E' }}
              data-testid="sovereign-join-btn">
              Join
            </button>
          </div>
        </div>

        {/* Active rooms */}
        {rooms.length > 0 && (
          <div>
            <p className="text-[9px] font-bold uppercase tracking-widest mb-3" style={{ color: 'rgba(255,255,255,0.2)' }}>
              Active Circles
            </p>
            <div className="space-y-2">
              {rooms.map(r => (
                <button key={r.id} onClick={() => joinRoom(r.id)}
                  className="w-full p-3 rounded-xl text-left flex items-center justify-between active:scale-[0.98] transition-all"
                  style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
                  data-testid={`sovereign-room-${r.id}`}>
                  <div className="flex items-center gap-2.5">
                    <div className="w-2 h-2 rounded-full" style={{ background: r.has_atmosphere ? '#22C55E' : '#FB923C', boxShadow: `0 0 8px ${r.has_atmosphere ? '#22C55E' : '#FB923C'}40` }} />
                    <div>
                      <p className="text-xs font-medium" style={{ color: 'rgba(248,250,252,0.7)' }}>{r.name}</p>
                      <p className="text-[8px]" style={{ color: 'rgba(255,255,255,0.2)' }}>{r.peer_count} node{r.peer_count !== 1 ? 's' : ''}</p>
                    </div>
                  </div>
                  <Users size={12} style={{ color: 'rgba(255,255,255,0.15)' }} />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── Session Screen ──
  const freqData = SOLFEGGIO.find(s => s.hz === activeFreq) || SOLFEGGIO[4];

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: '#000' }}
      data-testid="sovereign-session">
      {/* Atmospheric background */}
      <motion.div className="absolute inset-0" animate={{
        background: [
          `radial-gradient(ellipse at 50% 40%, ${activeColor}20 0%, transparent 70%)`,
          `radial-gradient(ellipse at 40% 60%, ${activeColor}28 0%, transparent 70%)`,
          `radial-gradient(ellipse at 60% 40%, ${activeColor}20 0%, transparent 70%)`,
        ],
      }} transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }} />

      <div className="relative z-10 px-5 py-6 max-w-lg mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <button onClick={leaveRoom} className="flex items-center gap-1.5 text-xs"
            style={{ color: 'rgba(255,255,255,0.4)' }} data-testid="sovereign-leave-btn">
            <ArrowLeft size={14} /> Leave
          </button>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ background: socket.connected ? '#22C55E' : '#EF4444', boxShadow: `0 0 8px ${socket.connected ? '#22C55E' : '#EF4444'}60` }} />
            <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.3)' }}>
              {socket.connected ? 'Connected' : 'Connecting...'}
            </span>
          </div>
          <button onClick={() => {
            setAudioOn(p => {
              const next = !p;
              if (next) chaosAudio.toggle(activeFreq, `solfeggio-${activeFreq}`);
              else chaosAudio.stopAll();
              return next;
            });
          }}
            className="p-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.04)' }}
            data-testid="sovereign-audio-toggle">
            {audioOn ? <Volume2 size={14} style={{ color: activeColor }} /> : <VolumeX size={14} style={{ color: 'rgba(255,255,255,0.2)' }} />}
          </button>
        </div>

        {/* Room info */}
        <div className="text-center mb-2">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em]" style={{ color: `${activeColor}88` }}>
            {socket.isHost ? 'Hosting' : 'Synced to'} Sovereign Circle
          </p>
          <h2 className="text-xl font-light mt-1" style={{ fontFamily: 'Cormorant Garamond, serif', color: 'rgba(248,250,252,0.8)' }}>
            {roomName || 'Sovereign Circle'}
          </h2>
          {/* Room code copy */}
          <button onClick={() => { navigator.clipboard?.writeText(roomId); toast.success('Room code copied'); }}
            className="inline-flex items-center gap-1.5 mt-1.5 px-2.5 py-1 rounded-full text-[9px] active:scale-95"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.25)' }}
            data-testid="sovereign-copy-code">
            <Copy size={9} /> {roomId}
          </button>
        </div>

        {/* Orbital Peers */}
        <OrbitalPeers peerCount={socket.peerCount} activeColor={activeColor} isHost={socket.isHost} />

        {/* Active frequency */}
        <div className="text-center mb-4">
          <motion.p key={activeFreq}
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            className="text-2xl font-light" style={{ fontFamily: 'Cormorant Garamond, serif', color: activeColor }}>
            {activeFreq}Hz
          </motion.p>
          <p className="text-[10px]" style={{ color: `${activeColor}66` }}>{freqData.label} Frequency</p>
        </div>

        {/* Host Controls OR Peer View */}
        {socket.isHost ? (
          <HostControls
            onColorChange={handleColorChange}
            onFreqChange={handleFreqChange}
            activeColor={activeColor}
            activeFreq={activeFreq}
            onShare={handleShare}
          />
        ) : (
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2 py-3 rounded-xl"
              style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <Eye size={12} style={{ color: 'rgba(255,255,255,0.2)' }} />
              <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.25)' }}>
                Synced to host atmosphere
              </span>
            </div>
            <button onClick={handleShare}
              className="w-full py-2 rounded-xl text-xs flex items-center justify-center gap-2 active:scale-95"
              style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.25)', color: '#3B82F6' }}
              data-testid="sovereign-share-moment">
              <Share2 size={12} /> Capture This Moment
            </button>
          </div>
        )}

        {/* Node info */}
        <div className="mt-6 text-center">
          <p className="text-[8px]" style={{ color: 'rgba(255,255,255,0.1)' }}>
            {DEFAULT_NODE.name} · {socket.peerCount} node{socket.peerCount !== 1 ? 's' : ''} · Privacy-neutral sync
          </p>
        </div>
      </div>
    </div>
  );
}
