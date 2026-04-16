/**
 * OmniBridge.js — Cross-Cultural Intelligence Component
 * 
 * Embeds in any module page. When activated, pulls contextual insights
 * from the OmniCultural Intelligence — connecting Lakota Sky Mythology,
 * Sacred Geometry, Eastern traditions, and modern science.
 * 
 * Every module talks to every other module through this bridge.
 */
import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Compass, Loader2, Star, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';

const API = process.env.REACT_APP_BACKEND_URL;

export default function OmniBridge({ module = 'general', topic = '', context = '' }) {
  const [insight, setInsight] = useState(null);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [error, setError] = useState(null);

  const fetchInsight = useCallback(async () => {
    if (!topic) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API}/api/omni-bridge/insight`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ module, topic, context }),
      });
      if (!res.ok) throw new Error('Bridge failed');
      const data = await res.json();
      setInsight(data);
      setExpanded(true);
    } catch (e) {
      setError('Could not reach the OmniBridge');
    } finally {
      setLoading(false);
    }
  }, [module, topic, context]);

  return (
    <div data-testid="omni-bridge" className="mt-3">
      {/* Trigger */}
      {!expanded && !insight && (
        <button
          onClick={fetchInsight}
          disabled={loading || !topic}
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs w-full justify-center group"
          style={{
            background: 'rgba(217,70,239,0.04)',
            border: '1px solid rgba(217,70,239,0.1)',
            color: '#D946EF',
            opacity: topic ? 1 : 0.4,
          }}
          data-testid="omni-bridge-trigger"
        >
          {loading ? (
            <Loader2 size={12} className="animate-spin" />
          ) : (
            <Compass size={12} className="group-hover:rotate-45 transition-transform" />
          )}
          {loading ? 'Bridging traditions...' : 'Cross-Cultural Insight'}
        </button>
      )}

      {/* Error */}
      {error && (
        <p className="text-[10px] mt-1 text-center" style={{ color: 'rgba(239,68,68,0.7)' }}>{error}</p>
      )}

      {/* Insight Display */}
      <AnimatePresence>
        {insight && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-2 rounded-xl p-4"
              style={{ background: 'rgba(217,70,239,0.03)', border: '1px solid rgba(217,70,239,0.08)' }}>
              {/* Header */}
              <button
                onClick={() => setExpanded(!expanded)}
                className="flex items-center justify-between w-full mb-2"
              >
                <div className="flex items-center gap-2">
                  <Compass size={12} style={{ color: '#D946EF' }} />
                  <span className="text-[9px] font-bold uppercase tracking-[0.2em]" style={{ color: '#D946EF' }}>
                    OmniBridge
                  </span>
                </div>
                {expanded ? <ChevronUp size={12} style={{ color: 'rgba(255,255,255,0.3)' }} /> : <ChevronDown size={12} style={{ color: 'rgba(255,255,255,0.3)' }} />}
              </button>

              {expanded && (
                <>
                  {/* Main insight text */}
                  <div className="text-xs leading-relaxed mb-3 whitespace-pre-line"
                    style={{ color: 'rgba(255,255,255,0.75)' }}
                    data-testid="omni-bridge-insight">
                    {insight.insight}
                  </div>

                  {/* Lakota connections */}
                  {insight.lakota_connections?.length > 0 && (
                    <div className="mb-3">
                      <p className="text-[8px] font-bold uppercase tracking-wider mb-1.5"
                        style={{ color: 'rgba(255,255,255,0.4)' }}>
                        Lakota Star Knowledge
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {insight.lakota_connections.map((lk, i) => (
                          <span key={i} className="text-[9px] px-2 py-1 rounded-full flex items-center gap-1"
                            style={{ background: 'rgba(217,70,239,0.06)', color: '#D8B4FE', border: '1px solid rgba(217,70,239,0.12)' }}>
                            <Star size={8} /> {lk.lakota} ({lk.english})
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Thread connections */}
                  <div className="grid grid-cols-2 gap-2">
                    {insight.eastern_thread && (
                      <div className="rounded-lg p-2" style={{ background: 'rgba(255,255,255,0.015)' }}>
                        <p className="text-[7px] font-bold uppercase tracking-wider mb-1" style={{ color: '#FBBF24' }}>Eastern</p>
                        <p className="text-[9px] line-clamp-3" style={{ color: 'rgba(255,255,255,0.5)' }}>{insight.eastern_thread}</p>
                      </div>
                    )}
                    {insight.geometry_thread && (
                      <div className="rounded-lg p-2" style={{ background: 'rgba(255,255,255,0.015)' }}>
                        <p className="text-[7px] font-bold uppercase tracking-wider mb-1" style={{ color: '#2DD4BF' }}>Science</p>
                        <p className="text-[9px] line-clamp-3" style={{ color: 'rgba(255,255,255,0.5)' }}>{insight.geometry_thread}</p>
                      </div>
                    )}
                  </div>

                  {/* Regenerate */}
                  <button onClick={fetchInsight} className="mt-2 text-[9px] flex items-center gap-1"
                    style={{ color: 'rgba(217,70,239,0.5)' }} data-testid="omni-bridge-refresh">
                    <Sparkles size={9} /> New insight
                  </button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
