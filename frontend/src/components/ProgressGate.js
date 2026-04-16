/**
 * ProgressGate.js — V56.1 Progressive Content Gating
 * 
 * Wraps content that requires a milestone to be unlocked.
 * Shows a locked state with progress toward the requirement.
 * Once the milestone is met, content renders normally.
 */
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Lock, ChevronRight } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

// Gate definitions — which milestones unlock which content
const GATE_REQUIREMENTS = {
  'dream-realms': { milestone: 'dream_realms_access', source: 'dream_journal', count: 3, label: 'Dream Realms', hint: 'Record 3 dream journal entries' },
  'frequencies-advanced': { milestone: 'sound_weaver', source: 'frequencies', count: 5, label: 'Advanced Frequencies', hint: 'Explore 5 frequency sessions' },
  'numerology-deep': { milestone: 'mystic_cloak_001', source: 'oracle_reading', count: 3, label: 'Deep Numerology', hint: 'Complete 3 oracle readings' },
  'starseed-adventure': { milestone: 'crystal_skin_001', source: 'meditation_session', count: 5, label: 'Starseed Adventure', hint: 'Complete 5 meditation sessions' },
};

export default function ProgressGate({ gateId, children, color = '#A78BFA' }) {
  const { user, authHeaders } = useAuth();
  const [unlocked, setUnlocked] = useState(true); // Default to unlocked if no gate
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(true);

  const gate = GATE_REQUIREMENTS[gateId];

  useEffect(() => {
    if (!gate || !user) { setLoading(false); return; }
    
    const checkGate = async () => {
      try {
        const res = await axios.get(`${API}/rpg/milestones`, { headers: authHeaders() });
        const milestones = res.data?.milestones || [];
        const m = milestones.find(ms => ms.id === gate.milestone);
        if (m) {
          setUnlocked(m.completed);
          setProgress(m.progress || 0);
        } else {
          setUnlocked(true); // If milestone not found, don't block
        }
      } catch {
        setUnlocked(true); // On error, don't block
      }
      setLoading(false);
    };
    checkGate();
  }, [gate, user, authHeaders]);

  if (loading) return null;
  if (!gate || unlocked) return <>{children}</>;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center py-16 px-8 text-center"
      data-testid={`gate-${gateId}`}
    >
      <motion.div
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 3, repeat: Infinity }}
        className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6"
        style={{
          background: `${color}10`,
          border: `2px solid ${color}20`,
          boxShadow: `0 0 30px ${color}10`,
        }}
      >
        <Lock size={28} style={{ color: `${color}60` }} />
      </motion.div>

      <h3 className="text-lg font-semibold mb-2" style={{ fontFamily: 'Cormorant Garamond, serif', color: '#fff' }}>
        {gate.label} — Locked
      </h3>
      <p className="text-sm mb-4" style={{ color: 'rgba(255,255,255,0.5)' }}>
        {gate.hint}
      </p>

      {/* Progress bar */}
      <div className="w-48 mb-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] font-mono" style={{ color }}>
            {progress}/{gate.count}
          </span>
          <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.3)' }}>
            {Math.round((progress / gate.count) * 100)}%
          </span>
        </div>
        <div className="h-2 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
          <motion.div
            className="h-full rounded-full"
            style={{ background: color }}
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(100, (progress / gate.count) * 100)}%` }}
            transition={{ duration: 0.8 }}
          />
        </div>
      </div>

      <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.3)' }}>
        Continue your journey to unlock this realm
      </p>
    </motion.div>
  );
}

export { GATE_REQUIREMENTS };
