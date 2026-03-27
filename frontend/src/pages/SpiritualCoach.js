import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { MessageCircle, Loader2, Send, Plus, Trash2, ChevronLeft, Sparkles, Moon, Eye, Star, X, Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

function ModeSelector({ modes, onSelect }) {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-6">
        <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
          style={{ background: 'rgba(216,180,254,0.1)', boxShadow: '0 0 60px rgba(216,180,254,0.1)' }}>
          <Sparkles size={28} style={{ color: '#D8B4FE' }} />
        </div>
        <p className="text-sm mb-1" style={{ color: 'rgba(248,250,252,0.6)' }}>
          Choose how Sage can guide you today
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {modes.map(mode => (
          <motion.button key={mode.id} whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }}
            onClick={() => onSelect(mode.id)}
            data-testid={`mode-${mode.id}`}
            className="rounded-2xl p-5 text-left transition-all"
            style={{ background: 'rgba(15,17,28,0.6)', border: `1px solid ${mode.color}15`, backdropFilter: 'blur(12px)' }}>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: `${mode.color}15` }}>
                {mode.id === 'dream_oracle' ? <Moon size={14} style={{ color: mode.color }} /> :
                 <Sparkles size={14} style={{ color: mode.color }} />}
              </div>
              <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{mode.name}</p>
            </div>
            <p className="text-xs" style={{ color: 'rgba(248,250,252,0.4)' }}>{mode.desc}</p>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

function DreamPicker({ dreams, onSelect, onBack, loading }) {
  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="animate-spin" size={28} style={{ color: '#818CF8' }} />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <button onClick={onBack} className="flex items-center gap-1 mb-4 text-xs" style={{ color: 'rgba(248,250,252,0.4)' }}>
        <ChevronLeft size={14} /> Back to modes
      </button>
      <div className="text-center mb-6">
        <div className="w-14 h-14 rounded-2xl mx-auto mb-3 flex items-center justify-center"
          style={{ background: 'rgba(129,140,248,0.1)', boxShadow: '0 0 40px rgba(129,140,248,0.08)' }}>
          <Moon size={24} style={{ color: '#818CF8' }} />
        </div>
        <h2 className="text-lg font-bold mb-1" style={{ color: 'var(--text-primary)' }}>Select a Dream to Analyze</h2>
        <p className="text-xs" style={{ color: 'rgba(248,250,252,0.4)' }}>
          The Dream Oracle will interpret it through your cosmic profile
        </p>
      </div>

      {dreams.length === 0 ? (
        <div className="text-center py-8 rounded-2xl"
          style={{ background: 'rgba(15,17,28,0.5)', border: '1px solid rgba(248,250,252,0.06)' }}>
          <Moon size={32} className="mx-auto mb-3" style={{ color: 'rgba(129,140,248,0.25)' }} />
          <p className="text-sm mb-1" style={{ color: 'rgba(248,250,252,0.5)' }}>No dreams logged yet</p>
          <p className="text-xs" style={{ color: 'rgba(248,250,252,0.3)' }}>
            Log your dreams in the Dream Journal first, then return here for deep analysis
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {dreams.map(dream => (
            <motion.button
              key={dream.id}
              whileHover={{ scale: 1.01, y: -1 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => onSelect(dream)}
              data-testid={`dream-pick-${dream.id}`}
              className="w-full rounded-xl p-4 text-left transition-all"
              style={{ background: 'rgba(15,17,28,0.5)', border: '1px solid rgba(129,140,248,0.08)' }}>
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ background: 'rgba(129,140,248,0.1)' }}>
                  <Eye size={14} style={{ color: '#818CF8' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{dream.title || 'Untitled Dream'}</p>
                    {dream.lucid && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full flex-shrink-0"
                        style={{ background: 'rgba(216,180,254,0.15)', color: '#D8B4FE' }}>Lucid</span>
                    )}
                  </div>
                  <p className="text-[11px] line-clamp-2 mb-2" style={{ color: 'rgba(248,250,252,0.4)' }}>
                    {dream.content?.substring(0, 120)}{dream.content?.length > 120 ? '...' : ''}
                  </p>
                  <div className="flex items-center gap-3 text-[10px]" style={{ color: 'rgba(248,250,252,0.25)' }}>
                    {dream.moon_phase && <span className="flex items-center gap-1"><Moon size={10} />{dream.moon_phase}</span>}
                    <span>Mood: {dream.mood}</span>
                    <span>Vivid: {dream.vividness}/10</span>
                    <span>{new Date(dream.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      )}
    </div>
  );
}

function CosmicProfileBadge({ profile }) {
  if (!profile || (!profile.aura_color && !profile.life_path && !profile.moon_phase)) return null;
  return (
    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
      className="rounded-xl p-3 mb-4 flex flex-wrap gap-3 items-center justify-center"
      data-testid="cosmic-profile-badge"
      style={{ background: 'rgba(129,140,248,0.05)', border: '1px solid rgba(129,140,248,0.12)' }}>
      <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'rgba(248,250,252,0.3)' }}>
        Dream Lens:
      </span>
      {profile.aura_color && (
        <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full"
          style={{ background: 'rgba(216,180,254,0.1)', color: '#D8B4FE' }}>
          <Star size={9} /> Aura: {profile.aura_color}
        </span>
      )}
      {profile.moon_phase && (
        <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full"
          style={{ background: 'rgba(129,140,248,0.1)', color: '#818CF8' }}>
          <Moon size={9} /> {profile.moon_phase}
        </span>
      )}
      {profile.life_path && (
        <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full"
          style={{ background: 'rgba(252,211,77,0.1)', color: '#FCD34D' }}>
          Life Path: {profile.life_path}
        </span>
      )}
      {profile.birth_card && (
        <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full"
          style={{ background: 'rgba(34,197,94,0.1)', color: '#22C55E' }}>
          {profile.birth_card}
        </span>
      )}
    </motion.div>
  );
}

function ChatBubble({ msg, isUser, onPlayAudio, playingId, currentMsgId }) {
  if (msg.role === 'system_context') {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        className="flex justify-center mb-4">
        <div className="rounded-full px-4 py-1.5 flex items-center gap-2"
          style={{ background: 'rgba(129,140,248,0.08)', border: '1px solid rgba(129,140,248,0.12)' }}>
          <Moon size={11} style={{ color: '#818CF8' }} />
          <span className="text-[10px]" style={{ color: 'rgba(248,250,252,0.4)' }}>{msg.text}</span>
        </div>
      </motion.div>
    );
  }
  const isPlaying = playingId === currentMsgId;
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      {!isUser && (
        <div className="w-7 h-7 rounded-full flex items-center justify-center mr-2 mt-1 flex-shrink-0"
          style={{ background: 'rgba(216,180,254,0.15)' }}>
          <Sparkles size={12} style={{ color: '#D8B4FE' }} />
        </div>
      )}
      <div className="max-w-[80%] rounded-2xl px-4 py-3"
        data-testid={isUser ? 'user-message' : 'coach-message'}
        style={{
          background: isUser ? 'rgba(99,102,241,0.15)' : 'rgba(15,17,28,0.6)',
          border: `1px solid ${isUser ? 'rgba(99,102,241,0.2)' : 'rgba(248,250,252,0.06)'}`,
        }}>
        {msg.voice && isUser && (
          <div className="flex items-center gap-1.5 mb-1.5">
            <Mic size={10} style={{ color: 'rgba(248,250,252,0.35)' }} />
            <span className="text-[9px]" style={{ color: 'rgba(248,250,252,0.3)' }}>Voice message</span>
          </div>
        )}
        <p className="text-xs leading-relaxed whitespace-pre-wrap" style={{ color: 'rgba(248,250,252,0.8)' }}>
          {msg.text}
        </p>
        <div className="flex items-center justify-between mt-1.5">
          {!isUser && msg.voice && msg.audio_base64 && onPlayAudio && (
            <button onClick={() => onPlayAudio(msg.audio_base64, currentMsgId)}
              data-testid={`play-audio-${currentMsgId}`}
              className="flex items-center gap-1 px-2 py-0.5 rounded-full transition-all"
              style={{ background: isPlaying ? 'rgba(216,180,254,0.2)' : 'rgba(216,180,254,0.08)' }}>
              {isPlaying ? (
                <>
                  <span className="flex gap-0.5 items-end h-3">
                    {[0, 100, 200].map(d => (
                      <span key={d} className="w-0.5 bg-purple-300 rounded-full animate-pulse" 
                        style={{ height: `${8 + Math.random() * 4}px`, animationDelay: `${d}ms` }} />
                    ))}
                  </span>
                  <span className="text-[9px] ml-1" style={{ color: '#D8B4FE' }}>Playing...</span>
                </>
              ) : (
                <>
                  <Volume2 size={10} style={{ color: '#D8B4FE' }} />
                  <span className="text-[9px]" style={{ color: '#D8B4FE' }}>Listen</span>
                </>
              )}
            </button>
          )}
          <p className="text-[9px] text-right flex-1" style={{ color: 'rgba(248,250,252,0.2)' }}>
            {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

function SessionList({ sessions, onSelect, onNew, onDelete, modes }) {
  return (
    <div className="max-w-md mx-auto">
      <button onClick={onNew} data-testid="new-session-btn"
        className="w-full mb-4 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all"
        style={{ background: 'rgba(216,180,254,0.1)', border: '1px solid rgba(216,180,254,0.2)', color: '#D8B4FE' }}>
        <Plus size={16} /> New Conversation
      </button>
      {sessions.length === 0 ? (
        <p className="text-center text-sm py-8" style={{ color: 'rgba(248,250,252,0.3)' }}>No conversations yet. Start one!</p>
      ) : (
        <div className="space-y-2">
          {sessions.map(s => {
            const mode = modes.find(m => m.id === s.mode);
            return (
              <div key={s.id} className="rounded-xl p-4 flex items-center justify-between group"
                style={{ background: 'rgba(15,17,28,0.5)', border: '1px solid rgba(248,250,252,0.06)' }}>
                <button onClick={() => onSelect(s.id)} className="flex-1 text-left" data-testid={`session-${s.id}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-5 h-5 rounded flex items-center justify-center"
                      style={{ background: `${mode?.color || '#D8B4FE'}15` }}>
                      {s.mode === 'dream_oracle' ? <Moon size={10} style={{ color: mode?.color || '#818CF8' }} /> :
                       <Sparkles size={10} style={{ color: mode?.color || '#D8B4FE' }} />}
                    </div>
                    <span className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>{mode?.name || s.mode}</span>
                    <span className="text-[10px]" style={{ color: 'rgba(248,250,252,0.25)' }}>
                      {s.message_count} msgs
                    </span>
                  </div>
                  {s.preview && (
                    <p className="text-[10px] truncate" style={{ color: 'rgba(248,250,252,0.35)' }}>{s.preview}</p>
                  )}
                </button>
                <button onClick={() => onDelete(s.id)}
                  className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/5">
                  <Trash2 size={12} style={{ color: 'rgba(248,250,252,0.25)' }} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function SpiritualCoach() {
  const { token, authHeaders } = useAuth();
  const [modes, setModes] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [view, setView] = useState('list'); // list, mode_select, dream_picker, chat
  const [loading, setLoading] = useState(true);
  const [dreams, setDreams] = useState([]);
  const [dreamsLoading, setDreamsLoading] = useState(false);
  const [cosmicProfile, setCosmicProfile] = useState(null);
  const [pendingDreamMode, setPendingDreamMode] = useState(false);
  const chatEndRef = useRef(null);

  // Voice state
  const [isRecording, setIsRecording] = useState(false);
  const [voiceProcessing, setVoiceProcessing] = useState(false);
  const [playingAudioId, setPlayingAudioId] = useState(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const currentAudioRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    axios.get(`${API}/coach/modes`).then(r => setModes(r.data.modes)).catch(() => {});
    if (token) fetchSessions();
    else setLoading(false);
  }, [token]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchSessions = () => {
    axios.get(`${API}/coach/sessions`, { headers: authHeaders })
      .then(r => setSessions(r.data.sessions))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  const fetchDreams = async () => {
    setDreamsLoading(true);
    try {
      const r = await axios.get(`${API}/coach/dreams`, { headers: authHeaders });
      setDreams(r.data.dreams || []);
    } catch { toast.error('Failed to load dreams'); }
    setDreamsLoading(false);
  };

  const startNew = () => setView('mode_select');

  const createSession = async (mode) => {
    if (mode === 'dream_oracle') {
      // For dream oracle, first create session then show dream picker
      try {
        const r = await axios.post(`${API}/coach/sessions`, { mode }, { headers: authHeaders });
        setActiveSession(r.data.session_id);
        setMessages([]);
        setPendingDreamMode(true);
        fetchSessions();
        await fetchDreams();
        setView('dream_picker');
      } catch { toast.error('Failed to start session'); }
      return;
    }
    try {
      const r = await axios.post(`${API}/coach/sessions`, { mode }, { headers: authHeaders });
      setActiveSession(r.data.session_id);
      setMessages([]);
      setView('chat');
      fetchSessions();
    } catch { toast.error('Failed to start session'); }
  };

  const selectDreamForAnalysis = async (dream) => {
    if (!activeSession) return;
    setSending(true);
    setView('chat');
    setMessages([{
      role: 'system_context',
      text: `[Dream Selected: "${dream.title || 'Untitled'}"] ${dream.content?.substring(0, 200)}...`,
      timestamp: new Date().toISOString(),
    }]);
    try {
      const r = await axios.post(`${API}/coach/analyze-dream`, {
        dream_id: dream.id, session_id: activeSession,
      }, { headers: authHeaders });
      setCosmicProfile(r.data.cosmic_profile || null);
      setMessages(prev => [...prev, {
        role: 'assistant', text: r.data.reply, timestamp: new Date().toISOString(),
      }]);
      fetchSessions();
    } catch {
      toast.error('Dream analysis failed');
      setMessages(prev => [...prev, {
        role: 'assistant',
        text: 'The dream veil is thick right now. Please try again.',
        timestamp: new Date().toISOString(),
      }]);
    }
    setSending(false);
    setPendingDreamMode(false);
  };

  const openSession = async (id) => {
    try {
      const r = await axios.get(`${API}/coach/sessions/${id}`, { headers: authHeaders });
      setActiveSession(id);
      setMessages(r.data.messages || []);
      setCosmicProfile(null);
      // Check if this is a dream oracle session with a dream_id
      if (r.data.mode === 'dream_oracle' && r.data.dream_id) {
        // Could fetch cosmic profile here if needed
      }
      setView('chat');
    } catch { toast.error('Failed to load'); }
  };

  const deleteSession = async (id) => {
    try {
      await axios.delete(`${API}/coach/sessions/${id}`, { headers: authHeaders });
      if (activeSession === id) { setView('list'); setActiveSession(null); }
      fetchSessions();
    } catch { toast.error('Failed'); }
  };

  const sendMessage = async () => {
    if (!input.trim() || sending) return;
    const text = input.trim();
    setInput('');
    const userMsg = { role: 'user', text, timestamp: new Date().toISOString() };
    setMessages(prev => [...prev, userMsg]);
    setSending(true);
    try {
      const r = await axios.post(`${API}/coach/chat`, {
        session_id: activeSession, message: text,
      }, { headers: authHeaders });
      const assistantMsg = { role: 'assistant', text: r.data.reply, timestamp: new Date().toISOString() };
      setMessages(prev => [...prev, assistantMsg]);
    } catch {
      toast.error('Failed to get response');
    }
    setSending(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  // --- Voice functions ---
  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      audioChunksRef.current = [];

      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/webm')
          ? 'audio/webm'
          : 'audio/mp4';

      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        stream.getTracks().forEach(t => t.stop());
        streamRef.current = null;
        const blob = new Blob(audioChunksRef.current, { type: mimeType });
        if (blob.size < 1000) {
          toast.error('Recording too short. Hold longer to speak.');
          setIsRecording(false);
          return;
        }
        await sendVoiceMessage(blob, mimeType);
      };

      recorder.start(250); // collect in 250ms chunks
      setIsRecording(true);
    } catch (err) {
      console.error('Mic access error:', err);
      toast.error('Microphone access denied. Please allow mic access.');
    }
  }, [activeSession]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  }, []);

  const sendVoiceMessage = async (blob, mimeType) => {
    if (!activeSession) return;
    setVoiceProcessing(true);
    setSending(true);

    // Show a placeholder user message
    const placeholderMsg = { role: 'user', text: 'Listening...', timestamp: new Date().toISOString(), voice: true, placeholder: true };
    setMessages(prev => [...prev, placeholderMsg]);

    try {
      const ext = mimeType.includes('webm') ? 'webm' : 'mp4';
      const formData = new FormData();
      formData.append('audio', blob, `voice.${ext}`);
      formData.append('session_id', activeSession);

      const r = await axios.post(`${API}/coach/voice-chat`, formData, {
        headers: { ...authHeaders, 'Content-Type': 'multipart/form-data' },
        timeout: 60000,
      });

      const { reply, transcribed_text, audio_base64 } = r.data;

      // Replace placeholder with actual transcription
      setMessages(prev => {
        const updated = [...prev];
        const placeholderIdx = updated.findIndex(m => m.placeholder);
        if (placeholderIdx !== -1) {
          updated[placeholderIdx] = {
            role: 'user', text: transcribed_text, timestamp: new Date().toISOString(), voice: true,
          };
        }
        updated.push({
          role: 'assistant', text: reply, timestamp: new Date().toISOString(), voice: true, audio_base64,
        });
        return updated;
      });

      // Auto-play Sage's response
      if (audio_base64) {
        playAudioBase64(audio_base64, `auto-${Date.now()}`);
      }
    } catch (err) {
      console.error('Voice chat error:', err);
      toast.error(err?.response?.data?.detail || 'Voice chat failed');
      // Remove placeholder
      setMessages(prev => prev.filter(m => !m.placeholder));
    }
    setSending(false);
    setVoiceProcessing(false);
  };

  const playAudioBase64 = useCallback((b64, msgId) => {
    // Stop any currently playing audio
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
    }

    if (playingAudioId === msgId) {
      setPlayingAudioId(null);
      return;
    }

    try {
      const audio = new Audio(`data:audio/mp3;base64,${b64}`);
      currentAudioRef.current = audio;
      setPlayingAudioId(msgId);

      audio.onended = () => {
        setPlayingAudioId(null);
        currentAudioRef.current = null;
      };
      audio.onerror = () => {
        setPlayingAudioId(null);
        currentAudioRef.current = null;
        toast.error('Audio playback failed');
      };
      audio.play();
    } catch {
      toast.error('Audio playback failed');
      setPlayingAudioId(null);
    }
  }, [playingAudioId]);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (currentAudioRef.current) currentAudioRef.current.pause();
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    };
  }, []);

  const activeMode = activeSession ? sessions.find(s => s.id === activeSession)?.mode : null;
  const modeInfo = modes.find(m => m.id === activeMode);
  const isDreamOracle = activeMode === 'dream_oracle';

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 max-w-3xl mx-auto" data-testid="coach-page">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="text-center mb-6">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] mb-2"
            style={{ color: view === 'dream_picker' || isDreamOracle ? '#818CF8' : '#D8B4FE' }}>
            {isDreamOracle || view === 'dream_picker' ?
              <><Moon size={12} className="inline mr-1" /> Dream Oracle</> :
              <><MessageCircle size={12} className="inline mr-1" /> AI Spiritual Coach</>}
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
            {view === 'dream_picker' ? 'Dream Oracle' :
             view === 'chat' && modeInfo ? modeInfo.name : 'Sage'}
          </h1>
          {view !== 'chat' && view !== 'dream_picker' && (
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              Your personal spiritual and life guide
            </p>
          )}
        </div>

        {!token ? (
          <p className="text-center text-sm py-12" style={{ color: 'rgba(248,250,252,0.4)' }}>Sign in to speak with Sage</p>
        ) : loading ? (
          <div className="flex justify-center py-12"><Loader2 className="animate-spin" size={28} style={{ color: '#D8B4FE' }} /></div>
        ) : (
          <>
            {view === 'chat' && (
              <button onClick={() => { setView('list'); setActiveSession(null); setCosmicProfile(null); }}
                data-testid="back-to-list"
                className="flex items-center gap-1 mb-4 text-xs"
                style={{ color: 'rgba(248,250,252,0.4)' }}>
                <ChevronLeft size={14} /> All conversations
              </button>
            )}

            {view === 'list' && <SessionList sessions={sessions} onSelect={openSession} onNew={startNew} onDelete={deleteSession} modes={modes} />}
            {view === 'mode_select' && <ModeSelector modes={modes} onSelect={createSession} />}
            {view === 'dream_picker' && (
              <DreamPicker
                dreams={dreams}
                loading={dreamsLoading}
                onSelect={selectDreamForAnalysis}
                onBack={() => { setView('mode_select'); setPendingDreamMode(false); }}
              />
            )}

            {view === 'chat' && (
              <div className="flex flex-col">
                {/* Cosmic Profile Badge for dream sessions */}
                {isDreamOracle && cosmicProfile && <CosmicProfileBadge profile={cosmicProfile} />}

                {/* Messages */}
                <div className="rounded-2xl p-4 mb-4 min-h-[300px] max-h-[55vh] overflow-y-auto"
                  data-testid="chat-messages"
                  style={{ background: 'rgba(15,17,28,0.4)', border: '1px solid rgba(248,250,252,0.04)' }}>
                  {messages.length === 0 && (
                    <div className="text-center py-12">
                      {isDreamOracle ?
                        <Moon size={24} className="mx-auto mb-3" style={{ color: 'rgba(129,140,248,0.3)' }} /> :
                        <Sparkles size={24} className="mx-auto mb-3" style={{ color: 'rgba(216,180,254,0.3)' }} />}
                      <p className="text-xs" style={{ color: 'rgba(248,250,252,0.3)' }}>
                        {isDreamOracle ? 'Select a dream to begin the analysis...' : 'Share what\'s on your mind. Sage is here to listen.'}
                      </p>
                      <p className="text-[10px] mt-2" style={{ color: 'rgba(248,250,252,0.2)' }}>
                        Tap the mic to speak or type below
                      </p>
                    </div>
                  )}
                  {messages.map((msg, i) => (
                    <ChatBubble key={i} msg={msg} isUser={msg.role === 'user'}
                      onPlayAudio={playAudioBase64} playingId={playingAudioId} currentMsgId={`msg-${i}`} />
                  ))}
                  {(sending || voiceProcessing) && (
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center"
                        style={{ background: isDreamOracle ? 'rgba(129,140,248,0.15)' : 'rgba(216,180,254,0.15)' }}>
                        {voiceProcessing ? <Volume2 size={12} style={{ color: '#D8B4FE' }} className="animate-pulse" /> :
                         isDreamOracle ? <Moon size={12} style={{ color: '#818CF8' }} /> :
                         <Sparkles size={12} style={{ color: '#D8B4FE' }} />}
                      </div>
                      <div className="flex gap-1">
                        {[0, 150, 300].map(delay => (
                          <span key={delay} className="w-2 h-2 rounded-full animate-pulse"
                            style={{ background: voiceProcessing ? '#A78BFA' : (isDreamOracle ? '#818CF8' : '#D8B4FE'), animationDelay: `${delay}ms` }} />
                        ))}
                      </div>
                      {voiceProcessing && <span className="text-[10px] ml-2" style={{ color: 'rgba(248,250,252,0.25)' }}>Sage is listening and composing a response...</span>}
                      {isDreamOracle && !voiceProcessing && <span className="text-[10px] ml-2" style={{ color: 'rgba(248,250,252,0.25)' }}>Interpreting through your cosmic lens...</span>}
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>

                {/* Input with Voice */}
                <div className="flex gap-2 items-end">
                  {/* Voice record button */}
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={isRecording ? stopRecording : startRecording}
                    disabled={sending && !isRecording}
                    data-testid="voice-record-btn"
                    className="relative px-3 py-3 rounded-xl transition-all flex items-center justify-center flex-shrink-0"
                    style={{
                      background: isRecording ? 'rgba(239,68,68,0.2)' : 'rgba(216,180,254,0.1)',
                      border: `1px solid ${isRecording ? 'rgba(239,68,68,0.4)' : 'rgba(216,180,254,0.2)'}`,
                      color: isRecording ? '#EF4444' : '#D8B4FE',
                    }}>
                    {isRecording ? (
                      <>
                        <MicOff size={16} />
                        <motion.span
                          className="absolute inset-0 rounded-xl"
                          style={{ border: '2px solid rgba(239,68,68,0.4)' }}
                          animate={{ opacity: [1, 0.3, 1] }}
                          transition={{ repeat: Infinity, duration: 1.2 }}
                        />
                      </>
                    ) : <Mic size={16} />}
                  </motion.button>

                  {isRecording ? (
                    <div className="flex-1 flex items-center gap-3 px-4 py-3 rounded-xl"
                      data-testid="recording-indicator"
                      style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)' }}>
                      <span className="flex gap-0.5 items-end h-4">
                        {[0, 80, 160, 240, 320].map(d => (
                          <motion.span key={d} className="w-1 bg-red-400 rounded-full"
                            animate={{ height: ['6px', '16px', '6px'] }}
                            transition={{ repeat: Infinity, duration: 0.8, delay: d / 1000 }}
                          />
                        ))}
                      </span>
                      <span className="text-xs" style={{ color: 'rgba(248,250,252,0.6)' }}>
                        Recording... Tap mic to stop
                      </span>
                    </div>
                  ) : (
                    <>
                      <textarea value={input} onChange={e => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={isDreamOracle ? "Ask about your dream's symbols, themes, or deeper meaning..." : "Share your thoughts with Sage..."}
                        rows={1}
                        data-testid="coach-input"
                        className="flex-1 px-4 py-3 rounded-xl text-xs resize-none"
                        style={{ background: 'rgba(15,17,28,0.6)', border: '1px solid rgba(248,250,252,0.08)', color: '#F8FAFC', outline: 'none' }} />
                      <button onClick={sendMessage} disabled={sending || !input.trim()}
                        data-testid="send-message-btn"
                        className="px-4 py-3 rounded-xl transition-all flex items-center justify-center"
                        style={{
                          background: input.trim() ? (isDreamOracle ? 'rgba(129,140,248,0.15)' : 'rgba(216,180,254,0.15)') : 'rgba(15,17,28,0.4)',
                          border: `1px solid ${input.trim() ? (isDreamOracle ? 'rgba(129,140,248,0.3)' : 'rgba(216,180,254,0.3)') : 'rgba(248,250,252,0.06)'}`,
                          color: input.trim() ? (isDreamOracle ? '#818CF8' : '#D8B4FE') : 'rgba(248,250,252,0.2)',
                        }}>
                        <Send size={16} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </motion.div>
    </div>
  );
}
