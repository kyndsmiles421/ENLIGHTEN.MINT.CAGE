import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import {
  ArrowLeft, Link2, Users, Play, Check, Star, Clock,
  Loader2, Heart, Eye, Zap, Plus, X, Sparkles
} from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

function MeditationCard({ med, onSelect }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      className="p-4 cursor-pointer transition-all hover:scale-[1.02]"
      onClick={() => onSelect(med)}
      data-testid={`meditation-${med.id}`}>
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: `${med.color}12`, border: `1px solid ${med.color}25` }}>
          <Link2 size={16} style={{ color: med.color }} />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{med.name}</p>
          <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{med.description}</p>
          <div className="flex items-center gap-3 mt-2">
            <span className="text-[8px] flex items-center gap-1" style={{ color: med.color }}>
              <Clock size={8} /> {med.duration} min
            </span>
            <span className="text-[8px]" style={{ color: 'var(--text-muted)' }}>{med.chakra} Chakra</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function SessionCard({ session, userId, onJoin, onComplete }) {
  const isHost = session.host_id === userId;
  const isPartner = session.partner_id === userId;
  const colors = { waiting: '#EAB308', active: '#22C55E', completed: '#818CF8' };

  return (
    <div className="p-3" data-testid={`session-${session.id}`}>
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ background: colors[session.status] }} />
          <p className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>{session.meditation_name}</p>
        </div>
        <span className="text-[8px] px-1.5 py-0.5 rounded capitalize"
          style={{ background: `${colors[session.status]}10`, color: colors[session.status] }}>{session.status}</span>
      </div>
      <div className="flex items-center justify-between">
        <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
          <span style={{ color: 'var(--text-secondary)' }}>{session.host_name}</span>
          {session.partner_name && <> + <span style={{ color: 'var(--text-secondary)' }}>{session.partner_name}</span></>}
        </div>
        {session.status === 'waiting' && !isHost && (
          <button onClick={() => onJoin(session.id)}
            className="px-2.5 py-1 rounded text-[10px] font-medium transition-all hover:scale-105"
            style={{ background: 'rgba(34,197,94,0.1)', color: '#22C55E', border: '1px solid rgba(34,197,94,0.2)' }}
            data-testid={`join-session-${session.id}`}>
            Join
          </button>
        )}
        {session.status === 'active' && (isHost || isPartner) && (
          <button onClick={() => onComplete(session.id)}
            className="px-2.5 py-1 rounded text-[10px] font-medium transition-all hover:scale-105"
            style={{ background: 'rgba(192,132,252,0.1)', color: '#C084FC', border: '1px solid rgba(192,132,252,0.2)' }}
            data-testid={`complete-session-${session.id}`}>
            Complete
          </button>
        )}
        {session.status === 'waiting' && isHost && (
          <span className="text-[9px]" style={{ color: 'var(--text-muted)' }}>Waiting for partner...</span>
        )}
      </div>
    </div>
  );
}

export default function Entanglement() {
  useEffect(() => { if (typeof window.__workAccrue === 'function') window.__workAccrue('entanglement', 8); }, []);

  const navigate = useNavigate();
  const [tab, setTab] = useState('meditations');
  const [meditations, setMeditations] = useState([]);
  const [openSessions, setOpenSessions] = useState([]);
  const [mySessions, setMySessions] = useState({ sessions: [], stats: {} });
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const token = localStorage.getItem('zen_token');
  const authHeaders = { Authorization: `Bearer ${token}` };
  const userId = JSON.parse(atob(token?.split('.')[1] || 'e30=') || '{}').sub || '';

  const fetchAll = useCallback(async () => {
    try {
      const [medRes, openRes, myRes] = await Promise.all([
        axios.get(`${API}/entanglement/meditations`, { headers: authHeaders }),
        axios.get(`${API}/entanglement/open-sessions`, { headers: authHeaders }),
        axios.get(`${API}/entanglement/my-sessions`, { headers: authHeaders }),
      ]);
      setMeditations(medRes.data.meditations);
      setOpenSessions(openRes.data.sessions);
      setMySessions(myRes.data);
    } catch (e) { if (process.env.NODE_ENV !== 'production') console.warn(e); }
    setLoading(false);
  }, [token]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const createSession = async (medId) => {
    setCreating(true);
    try {
      await axios.post(`${API}/entanglement/invite`, { meditation_id: medId }, { headers: authHeaders });
      toast.success('Entanglement session created! Waiting for a partner.');
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to create session');
    }
    setCreating(false);
  };

  const joinSession = async (sessionId) => {
    try {
      const res = await axios.post(`${API}/entanglement/join/${sessionId}`, {}, { headers: authHeaders });
      toast.success(`Joined! Begin ${res.data.meditation} together.`);
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to join');
    }
  };

  const completeSession = async (sessionId) => {
    try {
      await axios.post(`${API}/entanglement/complete/${sessionId}`, { rating: 5, note: '' }, { headers: authHeaders });
      toast.success('Entanglement session complete! Your energies are aligned.');
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to complete');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
        <Loader2 className="animate-spin" size={24} style={{ color: 'var(--text-muted)' }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-40" style={{ background: 'var(--bg-primary)' }}>
      <div className="px-4 pt-4 max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-white/5"
            data-testid="entanglement-back-btn">
            <ArrowLeft size={18} style={{ color: 'var(--text-muted)' }} />
          </button>
          <div>
            <h1 className="text-2xl md:text-3xl font-light" style={{ color: 'var(--text-primary)', fontFamily: 'Cormorant Garamond, serif' }}>
              Quantum Entanglement
            </h1>
            <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Paired meditations - connect your energy with others</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {[
            { label: 'Sessions', value: mySessions.stats.total || 0, color: '#C084FC' },
            { label: 'Completed', value: mySessions.stats.completed || 0, color: '#22C55E' },
            { label: 'Open Now', value: openSessions.length, color: '#EAB308' },
          ].map(s => (
            <div key={s.label} className="p-2.5 text-center">
              <p className="text-lg font-light" style={{ color: s.color, fontFamily: 'Cormorant Garamond, serif' }}>{s.value}</p>
              <p className="text-[8px] uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-4">
          {[
            { id: 'meditations', label: 'Start Session' },
            { id: 'open', label: `Join (${openSessions.length})` },
            { id: 'history', label: 'My Sessions' },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className="flex-1 py-1.5 rounded-lg text-[10px] transition-all"
              style={{
                background: tab === t.id ? 'rgba(192,132,252,0.1)' : 'rgba(248,250,252,0.03)',
                color: tab === t.id ? '#C084FC' : 'var(--text-muted)',
                border: `1px solid ${tab === t.id ? 'rgba(192,132,252,0.2)' : 'rgba(248,250,252,0.04)'}`,
              }}
              data-testid={`entanglement-tab-${t.id}`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Start Session */}
        {tab === 'meditations' && (
          <div className="space-y-3">
            <p className="text-[10px] uppercase tracking-widest font-bold" style={{ color: 'var(--text-muted)' }}>Choose a paired meditation</p>
            {meditations.map(med => (
              <div key={med.id} className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: `${med.color}12`, border: `1px solid ${med.color}25` }}>
                    <Link2 size={16} style={{ color: med.color }} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{med.name}</p>
                    <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{med.description}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-[8px] flex items-center gap-1" style={{ color: med.color }}>
                        <Clock size={8} /> {med.duration} min
                      </span>
                      <span className="text-[8px]" style={{ color: 'var(--text-muted)' }}>{med.chakra} Chakra</span>
                    </div>
                  </div>
                  <button onClick={() => createSession(med.id)} disabled={creating}
                    className="px-3 py-1.5 rounded-lg text-[10px] font-medium transition-all hover:scale-105"
                    style={{ background: `${med.color}12`, color: med.color, border: `1px solid ${med.color}25` }}
                    data-testid={`create-session-${med.id}`}>
                    {creating ? <Loader2 size={10} className="animate-spin" /> : 'Create'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Open Sessions */}
        {tab === 'open' && (
          <div className="space-y-2">
            {openSessions.length === 0 ? (
              <div className="text-center py-8">
                <Users size={20} className="mx-auto mb-2" style={{ color: 'var(--text-muted)' }} />
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>No open sessions right now</p>
                <p className="text-[10px] mt-1" style={{ color: 'var(--text-muted)' }}>Create one and wait for a partner!</p>
              </div>
            ) : (
              openSessions.map(s => (
                <SessionCard key={s.id} session={s} userId={userId} onJoin={joinSession} onComplete={completeSession} />
              ))
            )}
          </div>
        )}

        {/* History */}
        {tab === 'history' && (
          <div className="space-y-2">
            {mySessions.sessions.length === 0 ? (
              <div className="text-center py-8">
                <Link2 size={20} className="mx-auto mb-2" style={{ color: 'var(--text-muted)' }} />
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>No sessions yet</p>
              </div>
            ) : (
              mySessions.sessions.map(s => (
                <SessionCard key={s.id} session={s} userId={userId} onJoin={joinSession} onComplete={completeSession} />
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
