import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useAvatar } from '../context/AvatarContext';
import {
  ArrowLeft, Send, Users, Radio, Crown, Timer, Heart, Sparkles,
  MessageCircle, X, Play, Square, Volume2, VolumeX, Smile,
  Hand, Star, Flame, Moon, Sun, Zap, Wind, ChevronUp, ChevronDown,
  Mic, MicOff, Video, VideoOff
} from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const WS_URL = `${process.env.REACT_APP_BACKEND_URL.replace('https://', 'wss://').replace('http://', 'ws://')}/api/live/ws`;

const REACTIONS = [
  { emoji: '🙏', label: 'Namaste' },
  { emoji: '✨', label: 'Sparkle' },
  { emoji: '💜', label: 'Love' },
  { emoji: '🔥', label: 'Fire' },
  { emoji: '🌊', label: 'Wave' },
  { emoji: '🕯️', label: 'Candle' },
  { emoji: '🌙', label: 'Moon' },
  { emoji: '☀️', label: 'Sun' },
];

const HOST_COMMANDS = [
  { id: 'begin', label: 'Begin Practice', icon: Play, color: '#22C55E' },
  { id: 'breathe-in', label: 'Breathe In', icon: Wind, color: '#2DD4BF' },
  { id: 'breathe-out', label: 'Breathe Out', icon: Wind, color: '#3B82F6' },
  { id: 'hold', label: 'Hold', icon: Hand, color: '#FCD34D' },
  { id: 'focus', label: 'Focus', icon: Star, color: '#C084FC' },
  { id: 'release', label: 'Release & Let Go', icon: Sparkles, color: '#FDA4AF' },
  { id: 'om', label: 'Om', icon: Moon, color: '#8B5CF6' },
  { id: 'end', label: 'End Practice', icon: Square, color: '#EF4444' },
];

export default function LiveRoom() {
  const { sessionId } = useParams();
  const { user, authHeaders } = useAuth();
  const { avatarB64 } = useAvatar();
  const navigate = useNavigate();

  const [session, setSession] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [messages, setMessages] = useState([]);
  const [connected, setConnected] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [showChat, setShowChat] = useState(true);
  const [showReactions, setShowReactions] = useState(false);
  const [floatingReactions, setFloatingReactions] = useState([]);
  const [hostCommand, setHostCommand] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const [showParticipants, setShowParticipants] = useState(true);

  const wsRef = useRef(null);
  const chatEndRef = useRef(null);
  const reconnectRef = useRef(null);
  const timerRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const videoRef = useRef(null);
  const videoStreamRef = useRef(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingStatus, setRecordingStatus] = useState('');
  const [isVideoOn, setIsVideoOn] = useState(false);

  const isHost = session?.host_id === user?.id;

  // Load session details + add self
  useEffect(() => {
    if (!user) { navigate('/auth'); return; }
    axios.get(`${API}/live/sessions/${sessionId}`, { headers: authHeaders })
      .then(r => {
        setSession(r.data);
        // Ensure current user appears in participants
        const existing = (r.data.participants || []);
        if (!existing.find(p => p.user_id === user.id)) {
          setParticipants([...existing, { user_id: user.id, name: user.name || 'You', avatar: '' }]);
        } else {
          setParticipants(existing);
        }
      })
      .catch(() => navigate('/live'));
  }, [sessionId, user, authHeaders, navigate]);

  // WebSocket connection
  const connectWS = useCallback(() => {
    if (!user || !sessionId) return;
    const token = localStorage.getItem('token');
    if (!token) return;

    const ws = new WebSocket(`${WS_URL}/${sessionId}`);
    wsRef.current = ws;

    ws.onopen = () => {
      ws.send(JSON.stringify({ type: 'auth', token }));
    };

    ws.onmessage = (e) => {
      try {
        const msg = JSON.parse(e.data);
        switch (msg.type) {
          case 'connected':
            setConnected(true);
            setParticipants(msg.participants || []);
            setMessages(msg.chat_history || []);
            break;
          case 'user_joined':
            setParticipants(prev => {
              if (prev.find(p => p.user_id === msg.user_id)) return prev;
              return [...prev, { user_id: msg.user_id, name: msg.name, avatar: msg.avatar }];
            });
            setMessages(prev => [...prev, { type: 'system', text: `${msg.name} joined the circle`, timestamp: new Date().toISOString() }]);
            break;
          case 'user_left':
            setParticipants(prev => prev.filter(p => p.user_id !== msg.user_id));
            setMessages(prev => [...prev, { type: 'system', text: `${msg.name} left`, timestamp: new Date().toISOString() }]);
            break;
          case 'chat':
            setMessages(prev => [...prev, msg]);
            break;
          case 'reaction':
            addFloatingReaction(msg.emoji, msg.name);
            break;
          case 'host_command':
            setHostCommand(msg);
            setTimeout(() => setHostCommand(null), 5000);
            break;
          case 'session_started':
            setSession(prev => prev ? { ...prev, status: 'active' } : prev);
            setMessages(prev => [...prev, { type: 'system', text: msg.message, timestamp: new Date().toISOString() }]);
            break;
          case 'session_ended':
            setMessages(prev => [...prev, { type: 'system', text: msg.message, timestamp: new Date().toISOString() }]);
            setTimeout(() => navigate('/live'), 3000);
            break;
          default:
            break;
        }
      } catch {}
    };

    ws.onclose = () => {
      setConnected(false);
      // Only reconnect if still on this page
      if (document.location.pathname.includes(sessionId)) {
        reconnectRef.current = setTimeout(connectWS, 5000);
      }
    };

    ws.onerror = () => {
      // WS may not be supported in preview env — fallback to REST polling
      setConnected(false);
      // Add self as participant from REST data
      if (session) {
        setParticipants(prev => {
          if (prev.find(p => p.user_id === user?.id)) return prev;
          return [...prev, { user_id: user?.id, name: user?.name || 'You', avatar: '' }];
        });
      }
    };
  }, [user, sessionId, navigate]);

  useEffect(() => {
    connectWS();
    return () => {
      if (wsRef.current) wsRef.current.close();
      if (reconnectRef.current) clearTimeout(reconnectRef.current);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [connectWS]);

  // Timer
  useEffect(() => {
    if (session?.status === 'active') {
      timerRef.current = setInterval(() => setElapsed(e => e + 1), 1000);
      return () => clearInterval(timerRef.current);
    }
  }, [session?.status]);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendChat = () => {
    if (!chatInput.trim() || !wsRef.current) return;
    wsRef.current.send(JSON.stringify({ type: 'chat', text: chatInput }));
    setChatInput('');
  };

  const sendReaction = (emoji) => {
    if (!wsRef.current) return;
    wsRef.current.send(JSON.stringify({ type: 'reaction', emoji }));
    addFloatingReaction(emoji, 'You');
  };

  const sendHostCommand = (cmd) => {
    if (!wsRef.current || !isHost) return;
    wsRef.current.send(JSON.stringify({ type: 'host_command', command: cmd.id, data: { label: cmd.label } }));
  };

  const startSession = async () => {
    try {
      await axios.post(`${API}/live/sessions/${sessionId}/start`, {}, { headers: authHeaders });
    } catch {}
  };

  const endSession = async () => {
    try {
      // Stop recording first if active
      if (mediaRecorderRef.current && isRecording) {
        await stopRecording(true);
      }
      // Stop video if active
      if (videoStreamRef.current) {
        videoStreamRef.current.getTracks().forEach(t => t.stop());
        videoStreamRef.current = null;
        setIsVideoOn(false);
      }
      await axios.post(`${API}/live/sessions/${sessionId}/end`, {}, { headers: authHeaders });
    } catch {}
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      audioChunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        stream.getTracks().forEach(t => t.stop());
      };
      recorder.start(1000); // collect data every second
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
      setRecordingStatus('recording');
    } catch (err) {
      console.error('Could not start recording:', err);
    }
  };

  const stopRecording = async (autoUpload = false) => {
    if (!mediaRecorderRef.current) return;
    return new Promise((resolve) => {
      mediaRecorderRef.current.onstop = async () => {
        mediaRecorderRef.current.stream?.getTracks().forEach(t => t.stop());
        setIsRecording(false);
        if (autoUpload && audioChunksRef.current.length > 0) {
          await uploadAudio();
        }
        setRecordingStatus(autoUpload ? 'done' : '');
        resolve();
      };
      mediaRecorderRef.current.stop();
    });
  };

  const uploadAudio = async () => {
    if (audioChunksRef.current.length === 0) return;
    setRecordingStatus('uploading');
    try {
      const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      const formData = new FormData();
      formData.append('audio', blob, `session_${sessionId}.webm`);
      await axios.post(`${API}/live/sessions/${sessionId}/upload-audio`, formData, {
        headers: { ...authHeaders, 'Content-Type': 'multipart/form-data' },
      });
      setRecordingStatus('done');
    } catch (err) {
      console.error('Upload error:', err);
      setRecordingStatus('');
    }
  };

  const toggleVideo = async () => {
    if (isVideoOn) {
      // Turn off
      if (videoStreamRef.current) {
        videoStreamRef.current.getTracks().forEach(t => t.stop());
        videoStreamRef.current = null;
      }
      if (videoRef.current) videoRef.current.srcObject = null;
      setIsVideoOn(false);
    } else {
      // Turn on
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 320, height: 240, facingMode: 'user' } });
        videoStreamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
        setIsVideoOn(true);
      } catch (err) {
        console.error('Could not access camera:', err);
      }
    }
  };

  // Cleanup video on unmount
  useEffect(() => {
    return () => {
      if (videoStreamRef.current) {
        videoStreamRef.current.getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  const addFloatingReaction = (emoji, name) => {
    const id = Date.now() + Math.random();
    setFloatingReactions(prev => [...prev, { id, emoji, name, x: 20 + Math.random() * 60 }]);
    setTimeout(() => setFloatingReactions(prev => prev.filter(r => r.id !== id)), 3000);
  };

  const formatTime = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p style={{ color: 'var(--text-muted)' }}>Entering the circle...</p>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden relative" style={{ background: '#0A0B14' }} data-testid="live-room">
      {/* Scene Background */}
      <div className="absolute inset-0 z-0">
        <SceneBackground session={session} />
      </div>

      {/* Floating Reactions */}
      <div className="absolute inset-0 z-30 pointer-events-none overflow-hidden">
        <AnimatePresence>
          {floatingReactions.map(r => (
            <motion.div key={r.id}
              initial={{ opacity: 1, y: '100vh', x: `${r.x}%` }}
              animate={{ opacity: 0, y: '10vh' }}
              exit={{ opacity: 0 }}
              transition={{ duration: 2.5, ease: 'easeOut' }}
              className="absolute text-2xl">
              {r.emoji}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Host Command Overlay */}
      <AnimatePresence>
        {hostCommand && (
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
            className="absolute inset-0 z-40 flex items-center justify-center pointer-events-none">
            <div className="text-center">
              <p className="text-4xl md:text-6xl font-light mb-2" style={{ fontFamily: 'Cormorant Garamond, serif', color: '#F8FAFC', textShadow: '0 0 40px rgba(192,132,252,0.4)' }}>
                {hostCommand.data?.label || hostCommand.command}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Video Preview (PiP) */}
      <AnimatePresence>
        {isVideoOn && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute z-50"
            style={{ bottom: 90, right: 16 }}
            data-testid="video-preview-container">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl"
              style={{ width: 200, height: 150, border: '2px solid rgba(59,130,246,0.3)', boxShadow: '0 0 30px rgba(59,130,246,0.15)' }}>
              <video ref={videoRef} autoPlay playsInline muted
                className="w-full h-full object-cover"
                style={{ transform: 'scaleX(-1)' }}
                data-testid="video-preview" />
              <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-full"
                style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)' }}>
                <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#3B82F6' }} />
                <span className="text-[8px] font-medium" style={{ color: '#93C5FD' }}>LIVE</span>
              </div>
              <button onClick={toggleVideo}
                className="absolute top-2 right-2 p-1 rounded-full transition-all hover:scale-110"
                style={{ background: 'rgba(0,0,0,0.5)' }}
                data-testid="video-preview-close">
                <X size={10} style={{ color: '#F8FAFC' }} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Bar */}
      <div className="relative z-20 px-4 py-3 flex items-center justify-between" style={{ background: 'rgba(10,11,20,0.6)', backdropFilter: 'blur(12px)' }}>
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/live')} className="p-1.5 rounded-lg hover:bg-white/5" data-testid="live-room-back">
            <ArrowLeft size={16} style={{ color: 'rgba(248,250,252,0.6)' }} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              {session.status === 'active' && <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />}
              <h1 className="text-sm font-medium" style={{ color: '#F8FAFC' }}>{session.title}</h1>
            </div>
            <div className="flex items-center gap-2 text-[9px]" style={{ color: 'rgba(248,250,252,0.4)' }}>
              <span className="flex items-center gap-1"><Crown size={8} /> {session.host_name}</span>
              <span>•</span>
              <span className="flex items-center gap-1"><Users size={8} /> {participants.length}</span>
              {session.status === 'active' && <><span>•</span><span className="flex items-center gap-1"><Timer size={8} /> {formatTime(elapsed)}</span></>}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {connected && <div className="w-2 h-2 rounded-full" style={{ background: '#22C55E', boxShadow: '0 0 6px #22C55E' }} />}
          <button onClick={() => setShowParticipants(!showParticipants)}
            className="p-1.5 rounded-lg hover:bg-white/5" data-testid="toggle-participants">
            <Users size={14} style={{ color: showParticipants ? '#C084FC' : 'rgba(248,250,252,0.5)' }} />
          </button>
          <button onClick={() => setShowChat(!showChat)}
            className="p-1.5 rounded-lg hover:bg-white/5" data-testid="toggle-chat">
            <MessageCircle size={14} style={{ color: showChat ? '#C084FC' : 'rgba(248,250,252,0.5)' }} />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 relative z-10 flex overflow-hidden">
        {/* Center — Avatar Circle */}
        <div className="flex-1 flex items-center justify-center relative">
          <AvatarCircle participants={participants} currentUserId={user?.id} myAvatar={avatarB64} />

          {/* Host Controls */}
          {isHost && (
            <div className="absolute bottom-4 left-4 right-4 z-20" data-testid="host-controls">
              {session.status === 'scheduled' && (
                <button onClick={startSession}
                  className="w-full py-3 rounded-xl text-sm font-medium mb-2 transition-all hover:scale-[1.01]"
                  style={{ background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)', color: '#22C55E' }}
                  data-testid="start-session-btn">
                  <Play size={14} className="inline mr-2" /> Start Session
                </button>
              )}
              {session.status === 'active' && (
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-1.5">
                    {HOST_COMMANDS.map(cmd => {
                      const CIcon = cmd.icon;
                      return (
                        <button key={cmd.id} onClick={() => sendHostCommand(cmd)}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[9px] font-medium transition-all hover:scale-105"
                          style={{ background: `${cmd.color}12`, border: `1px solid ${cmd.color}20`, color: cmd.color }}
                          data-testid={`host-cmd-${cmd.id}`}>
                          <CIcon size={10} /> {cmd.label}
                        </button>
                      );
                    })}
                    {/* Audio Recording Toggle */}
                    <button onClick={() => isRecording ? stopRecording() : startRecording()}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[9px] font-medium transition-all hover:scale-105"
                      style={{
                        background: isRecording ? 'rgba(239,68,68,0.15)' : 'rgba(234,179,8,0.12)',
                        border: `1px solid ${isRecording ? 'rgba(239,68,68,0.3)' : 'rgba(234,179,8,0.2)'}`,
                        color: isRecording ? '#EF4444' : '#EAB308',
                      }}
                      data-testid="toggle-recording">
                      {isRecording ? <><MicOff size={10} /> Stop Rec</> : <><Mic size={10} /> Record</>}
                    </button>
                    {/* Video Toggle */}
                    <button onClick={toggleVideo}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[9px] font-medium transition-all hover:scale-105"
                      style={{
                        background: isVideoOn ? 'rgba(59,130,246,0.15)' : 'rgba(148,163,184,0.12)',
                        border: `1px solid ${isVideoOn ? 'rgba(59,130,246,0.3)' : 'rgba(148,163,184,0.15)'}`,
                        color: isVideoOn ? '#3B82F6' : '#94A3B8',
                      }}
                      data-testid="toggle-video">
                      {isVideoOn ? <><VideoOff size={10} /> Cam Off</> : <><Video size={10} /> Cam On</>}
                    </button>
                  </div>
                  {recordingStatus === 'recording' && (
                    <div className="flex items-center gap-2 px-2 py-1">
                      <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#EF4444' }} />
                      <span className="text-[9px]" style={{ color: '#EF4444' }}>Recording audio...</span>
                    </div>
                  )}
                  {recordingStatus === 'uploading' && (
                    <div className="flex items-center gap-2 px-2 py-1">
                      <span className="text-[9px]" style={{ color: '#EAB308' }}>Uploading recording...</span>
                    </div>
                  )}
                  {recordingStatus === 'done' && (
                    <div className="flex items-center gap-2 px-2 py-1">
                      <span className="text-[9px]" style={{ color: '#22C55E' }}>Audio saved</span>
                    </div>
                  )}
                  <button onClick={endSession}
                    className="w-full py-2 rounded-xl text-[10px] font-medium"
                    style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#EF4444' }}
                    data-testid="end-session-btn">
                    End Session
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Sidebar — Participants + Chat */}
        <AnimatePresence>
          {(showChat || showParticipants) && (
            <motion.div initial={{ width: 0, opacity: 0 }} animate={{ width: 320, opacity: 1 }} exit={{ width: 0, opacity: 0 }}
              className="flex flex-col overflow-hidden flex-shrink-0"
              style={{ background: 'rgba(10,11,20,0.8)', backdropFilter: 'blur(16px)', borderLeft: '1px solid rgba(248,250,252,0.04)' }}>

              {/* Participants Panel */}
              {showParticipants && (
                <div className="px-3 py-3" style={{ borderBottom: '1px solid rgba(248,250,252,0.04)' }}>
                  <p className="text-[9px] font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>
                    In the Circle ({participants.length})
                  </p>
                  <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                    {participants.map(p => (
                      <div key={p.user_id} className="flex items-center gap-1.5 px-2 py-1 rounded-full"
                        style={{ background: 'rgba(248,250,252,0.04)', border: '1px solid rgba(248,250,252,0.06)' }}>
                        {p.avatar ? (
                          <img src={`data:image/png;base64,${p.avatar}`} alt="" className="w-4 h-4 rounded-full object-cover" />
                        ) : (
                          <div className="w-4 h-4 rounded-full flex items-center justify-center text-[7px]"
                            style={{ background: 'rgba(192,132,252,0.2)', color: '#D8B4FE' }}>{p.name?.charAt(0)}</div>
                        )}
                        <span className="text-[9px]" style={{ color: 'var(--text-secondary)' }}>
                          {p.name?.split(' ')[0]}
                          {p.user_id === session?.host_id && <Crown size={7} className="inline ml-0.5" style={{ color: '#EAB308' }} />}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Chat */}
              {showChat && (
                <div className="flex-1 flex flex-col overflow-hidden">
                  <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1" style={{ scrollbarWidth: 'thin' }}>
                    {messages.map((msg, i) => (
                      <div key={i} className={msg.type === 'system' ? 'text-center py-1' : ''}>
                        {msg.type === 'system' ? (
                          <span className="text-[9px] italic" style={{ color: 'rgba(248,250,252,0.3)' }}>{msg.text}</span>
                        ) : (
                          <div>
                            <span className="text-[9px] font-medium mr-1.5" style={{ color: msg.user_id === user?.id ? '#C084FC' : '#2DD4BF' }}>
                              {msg.user_id === user?.id ? 'You' : msg.name}
                            </span>
                            <span className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>{msg.text}</span>
                          </div>
                        )}
                      </div>
                    ))}
                    <div ref={chatEndRef} />
                  </div>

                  {/* Reactions */}
                  <div className="px-3 py-1.5 flex items-center gap-1" style={{ borderTop: '1px solid rgba(248,250,252,0.03)' }}>
                    {REACTIONS.map(r => (
                      <button key={r.emoji} onClick={() => sendReaction(r.emoji)}
                        className="text-sm p-1 rounded-lg hover:bg-white/5 transition-all hover:scale-125"
                        title={r.label}>
                        {r.emoji}
                      </button>
                    ))}
                  </div>

                  {/* Chat Input */}
                  <div className="px-3 py-2 flex items-center gap-2" style={{ borderTop: '1px solid rgba(248,250,252,0.04)' }}>
                    <input value={chatInput} onChange={e => setChatInput(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && sendChat()}
                      placeholder="Share a thought..."
                      className="flex-1 px-3 py-2 rounded-xl text-[10px]"
                      style={{ background: 'rgba(248,250,252,0.03)', border: '1px solid rgba(248,250,252,0.06)', color: 'var(--text-primary)', outline: 'none' }}
                      data-testid="chat-input" />
                    <button onClick={sendChat} className="p-2 rounded-xl" style={{ background: 'rgba(192,132,252,0.1)' }} data-testid="chat-send">
                      <Send size={12} style={{ color: '#C084FC' }} />
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ─── Avatar Circle ─── */
function AvatarCircle({ participants, currentUserId, myAvatar }) {
  const count = participants.length;
  const radius = Math.min(200, 80 + count * 15);

  return (
    <div className="relative" style={{ width: radius * 2 + 80, height: radius * 2 + 80 }}>
      {/* Center glow */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.35, 0.2] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="w-20 h-20 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(192,132,252,0.3), transparent 70%)' }} />
      </div>

      {/* Connecting lines */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity: 0.1 }}>
        {participants.map((_, i) => {
          const angle = (i / count) * Math.PI * 2 - Math.PI / 2;
          const cx = radius + 40;
          const cy = radius + 40;
          const x = cx + Math.cos(angle) * radius;
          const y = cy + Math.sin(angle) * radius;
          return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="#C084FC" strokeWidth="0.5" />;
        })}
      </svg>

      {/* Avatars arranged in circle */}
      {participants.map((p, i) => {
        const angle = (i / Math.max(count, 1)) * Math.PI * 2 - Math.PI / 2;
        const x = radius + 40 + Math.cos(angle) * radius - 24;
        const y = radius + 40 + Math.sin(angle) * radius - 24;
        const isMe = p.user_id === currentUserId;
        const avatarSrc = isMe && myAvatar ? myAvatar : p.avatar;

        return (
          <motion.div key={p.user_id}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1, type: 'spring' }}
            className="absolute flex flex-col items-center"
            style={{ left: x, top: y }}>
            <motion.div
              animate={{ y: [0, -3, 0] }}
              transition={{ duration: 3 + i * 0.5, repeat: Infinity, ease: 'easeInOut' }}
              className="relative">
              <div className="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center"
                style={{
                  border: `2px solid ${isMe ? '#C084FC' : 'rgba(248,250,252,0.15)'}`,
                  background: 'rgba(13,14,26,0.8)',
                  boxShadow: isMe ? '0 0 20px rgba(192,132,252,0.3)' : '0 0 10px rgba(0,0,0,0.3)',
                }}>
                {avatarSrc ? (
                  <img src={`data:image/png;base64,${avatarSrc}`} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-sm font-bold" style={{ color: '#D8B4FE' }}>{p.name?.charAt(0)?.toUpperCase()}</span>
                )}
              </div>
              {/* Glow ring for active breathing */}
              <motion.div
                animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0, 0.3] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: i * 0.3 }}
                className="absolute inset-0 rounded-full"
                style={{ border: `1px solid ${isMe ? '#C084FC' : 'rgba(248,250,252,0.1)'}` }} />
            </motion.div>
            <span className="text-[8px] mt-1 px-1.5 py-0.5 rounded-full max-w-16 truncate"
              style={{ background: 'rgba(0,0,0,0.5)', color: isMe ? '#C084FC' : 'rgba(248,250,252,0.6)', backdropFilter: 'blur(4px)' }}>
              {isMe ? 'You' : p.name?.split(' ')[0]}
            </span>
          </motion.div>
        );
      })}

      {/* Empty state */}
      {count === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Waiting for seekers to join...</p>
        </div>
      )}
    </div>
  );
}

/* ─── Scene Background ─── */
function SceneBackground({ session }) {
  const sceneId = session?.scene || 'cosmic-temple';

  const SCENE_CONFIGS = {
    'cosmic-temple': { bg: 'radial-gradient(ellipse at 50% 30%, rgba(139,92,246,0.12), rgba(10,11,20,1))', particleColor: '#C084FC' },
    'zen-garden': { bg: 'radial-gradient(ellipse at 50% 60%, rgba(34,197,94,0.08), rgba(10,11,20,1))', particleColor: '#22C55E' },
    'ocean-shore': { bg: 'radial-gradient(ellipse at 50% 70%, rgba(6,182,212,0.1), rgba(10,11,20,1))', particleColor: '#06B6D4' },
    'mountain-peak': { bg: 'radial-gradient(ellipse at 50% 40%, rgba(245,158,11,0.08), rgba(10,11,20,1))', particleColor: '#F59E0B' },
    'sacred-fire': { bg: 'radial-gradient(ellipse at 50% 60%, rgba(239,68,68,0.08), rgba(10,11,20,1))', particleColor: '#EF4444' },
    'aurora': { bg: 'radial-gradient(ellipse at 50% 20%, rgba(45,212,191,0.1), rgba(10,11,20,1))', particleColor: '#2DD4BF' },
  };

  const config = SCENE_CONFIGS[sceneId] || SCENE_CONFIGS['cosmic-temple'];

  return (
    <div className="w-full h-full relative">
      <div className="absolute inset-0" style={{ background: config.bg }} />
      {/* Floating particles */}
      {[...Array(20)].map((_, i) => (
        <motion.div key={i}
          className="absolute rounded-full"
          style={{
            width: 1 + Math.random() * 2,
            height: 1 + Math.random() * 2,
            background: config.particleColor,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            opacity: 0.1 + Math.random() * 0.3,
          }}
          animate={{
            y: [0, -30 - Math.random() * 40, 0],
            opacity: [0.1, 0.4, 0.1],
          }}
          transition={{
            duration: 5 + Math.random() * 5,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: Math.random() * 5,
          }} />
      ))}
    </div>
  );
}
