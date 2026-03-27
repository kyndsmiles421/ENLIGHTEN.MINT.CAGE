import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Compass, Loader2, Sparkles, ArrowRight, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

function SuggestionCard({ feat, index }) {
  const navigate = useNavigate();
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.12 }}
      whileHover={{ scale: 1.03, y: -4 }} whileTap={{ scale: 0.98 }}
      onClick={() => navigate(feat.path)}
      className="cursor-pointer rounded-2xl p-5 transition-all group"
      data-testid={`suggestion-${feat.id}`}
      style={{ background: 'rgba(15,17,28,0.6)', border: `1px solid ${feat.color}15`, backdropFilter: 'blur(12px)' }}>
      <div className="flex items-center gap-3 mb-3">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center"
          style={{ background: `${feat.color}15`, boxShadow: `0 0 25px ${feat.color}10` }}>
          <Sparkles size={20} style={{ color: feat.color }} />
        </div>
        <div className="flex-1">
          <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{feat.name}</p>
          <p className="text-[10px] uppercase tracking-wider" style={{ color: feat.color }}>{feat.category}</p>
        </div>
        <ArrowRight size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: feat.color }} />
      </div>
      <p className="text-xs" style={{ color: 'rgba(248,250,252,0.5)' }}>{feat.desc}</p>
    </motion.div>
  );
}

export default function TrySomethingNew() {
  const { token, authHeaders } = useAuth();
  const [suggestions, setSuggestions] = useState([]);
  const [personalized, setPersonalized] = useState(null);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) { setLoading(false); return; }
    Promise.all([
      axios.get(`${API}/discover/suggestions`, { headers: authHeaders }),
      axios.get(`${API}/discover/personalized`, { headers: authHeaders }),
    ]).then(([sRes, pRes]) => {
      setSuggestions(sRes.data.suggestions);
      setStats({ explored: sRes.data.explored, total: sRes.data.total_features, unexplored: sRes.data.unexplored, percent: sRes.data.exploration_percent });
      setPersonalized(pRes.data);
    }).catch(() => toast.error('Failed to load'))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center pt-20">
      <Loader2 className="animate-spin" size={28} style={{ color: '#E879F9' }} />
    </div>
  );

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 max-w-5xl mx-auto" data-testid="discover-page">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="text-center mb-8">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] mb-2" style={{ color: '#E879F9' }}>
            <Compass size={12} className="inline mr-1" /> Discovery Engine
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
            Try Something New
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Expand your practice with unexplored features
          </p>
        </div>

        {!token ? (
          <p className="text-center text-sm py-12" style={{ color: 'rgba(248,250,252,0.4)' }}>Sign in to get personalized suggestions</p>
        ) : (
          <>
            {/* Exploration Progress */}
            <div className="max-w-md mx-auto mb-8 rounded-2xl p-5"
              style={{ background: 'rgba(15,17,28,0.6)', border: '1px solid rgba(232,121,249,0.1)', backdropFilter: 'blur(12px)' }}>
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>Your Exploration Journey</p>
                <span className="text-xs font-bold" style={{ color: '#E879F9' }}>{stats.percent || 0}%</span>
              </div>
              <div className="w-full h-2 rounded-full overflow-hidden mb-2" style={{ background: 'rgba(248,250,252,0.06)' }}>
                <motion.div initial={{ width: 0 }} animate={{ width: `${stats.percent || 0}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className="h-full rounded-full"
                  style={{ background: 'linear-gradient(90deg, #E879F9, #818CF8)' }} />
              </div>
              <p className="text-[10px]" style={{ color: 'rgba(248,250,252,0.35)' }}>
                {stats.explored || 0} of {stats.total || 0} features explored | {stats.unexplored || 0} waiting for you
              </p>
            </div>

            {/* Mood-Based Recommendation */}
            {personalized && (
              <div className="mb-8">
                <p className="text-xs font-medium mb-3 flex items-center gap-2" style={{ color: 'rgba(248,250,252,0.5)' }}>
                  <TrendingUp size={14} style={{ color: '#E879F9' }} />
                  {personalized.reason}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {(personalized.recommended || []).map((feat, i) => (
                    <SuggestionCard key={feat.id} feat={feat} index={i} />
                  ))}
                </div>
              </div>
            )}

            {/* Unexplored Features */}
            {suggestions.length > 0 && (
              <div>
                <p className="text-xs font-medium mb-3" style={{ color: 'rgba(248,250,252,0.5)' }}>
                  <Compass size={14} className="inline mr-1" style={{ color: '#E879F9' }} />
                  Unexplored — waiting for you
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {suggestions.map((feat, i) => (
                    <SuggestionCard key={feat.id} feat={feat} index={i + 3} />
                  ))}
                </div>
              </div>
            )}

            {suggestions.length === 0 && (
              <div className="text-center py-12">
                <Sparkles size={32} className="mx-auto mb-3" style={{ color: '#E879F9' }} />
                <p className="text-sm" style={{ color: 'rgba(248,250,252,0.5)' }}>
                  You've explored everything! You are a true cosmic explorer.
                </p>
              </div>
            )}
          </>
        )}
      </motion.div>
    </div>
  );
}
