import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Star, Hash, CreditCard, Globe, Sun, Layers, Loader2, ChevronRight, Sparkles, Trash2, Clock, Zap, Heart, ArrowLeft, Share2, Check, Image } from 'lucide-react';
import { toast } from 'sonner';
import { commit as busCommit } from '../state/ContextBus';
import { useResonance } from '../hooks/useResonance';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const SYSTEM_ICONS = { star: Star, layers: Layers, hash: Hash, creditCard: CreditCard, globe: Globe, sun: Sun };

const PERIOD_LABELS = {
  daily: { label: 'Daily', desc: 'Today\'s cosmic weather' },
  weekly: { label: 'Weekly', desc: 'This week\'s forecast' },
  monthly: { label: 'Monthly', desc: 'The month ahead' },
  yearly: { label: 'Yearly', desc: 'Your year overview' },
};

const ENERGY_LABELS = {
  positive: { color: '#22C55E', label: 'Positive' },
  neutral: { color: '#94A3B8', label: 'Neutral' },
  challenging: { color: '#FB923C', label: 'Challenging' },
  transformative: { color: '#C084FC', label: 'Transformative' },
};

function ForecastCard({ forecast, onDelete, onShare }) {
  const [expanded, setExpanded] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [shared, setShared] = useState(false);
  const [aiVisual, setAiVisual] = useState(null);
  const [genVisual, setGenVisual] = useState(false);
  const { authHeaders } = useAuth();
  const fc = forecast.forecast;
  const color = forecast.system_color || '#C084FC';
  const Icon = SYSTEM_ICONS[Object.values(SYSTEM_ICONS).find(i => i) ? 'star' : 'star'] || Star;

  const handleShare = async (e) => {
    e.stopPropagation();
    if (sharing || shared) return;
    setSharing(true);
    const success = await onShare(forecast);
    setSharing(false);
    if (success) setShared(true);
  };

  const generateVisual = async (e) => {
    e.stopPropagation();
    if (genVisual || aiVisual) return;
    setGenVisual(true);
    try {
      const r = await axios.post(`${API}/ai-visuals/forecast`, {
        system: forecast.system_name,
        period: forecast.period,
        summary: (fc?.summary || '').slice(0, 200),
      }, { headers: authHeaders, timeout: 120000 });
      setAiVisual(r.data.image_b64);
    } catch {
      toast.error('Failed to generate cosmic visual');
    }
    setGenVisual(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="overflow-hidden group"
      data-testid={`forecast-card-${forecast.id}`}
    >
      {/* Header */}
      <div className="p-5 cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${color}12`, border: `1px solid ${color}15` }}>
              <Star size={16} style={{ color }} />
            </div>
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{fc?.title || forecast.system_name}</p>
              <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                {forecast.system_name} &middot; {PERIOD_LABELS[forecast.period]?.label} &middot; {forecast.period_desc}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {fc?.overall_energy && (
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-full" style={{ background: `${color}10` }}>
                <Zap size={10} style={{ color }} />
                <span className="text-[10px] font-medium" style={{ color }}>{fc.overall_energy}/10</span>
              </div>
            )}
            {/* Share button */}
            <button onClick={handleShare} disabled={sharing || shared}
              data-testid={`share-forecast-${forecast.id}`}
              className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] transition-all opacity-0 group-hover:opacity-100"
              style={{
                background: shared ? 'rgba(34,197,94,0.1)' : `${color}08`,
                border: `1px solid ${shared ? 'rgba(34,197,94,0.2)' : `${color}15`}`,
                color: shared ? '#22C55E' : color,
              }}>
              {sharing ? <Loader2 size={10} className="animate-spin" /> : shared ? <Check size={10} /> : <Share2 size={10} />}
              {shared ? 'Shared' : 'Share'}
            </button>
            <button onClick={(e) => { e.stopPropagation(); onDelete(forecast.id); }}
              className="opacity-0 group-hover:opacity-100 transition-opacity p-1"
              data-testid={`delete-forecast-${forecast.id}`}>
              <Trash2 size={12} style={{ color: 'var(--text-muted)' }} />
            </button>
            <ChevronRight size={14} style={{ color: 'var(--text-muted)', transform: expanded ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }} />
          </div>
        </div>

        {/* Summary */}
        <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{fc?.summary}</p>

        {/* Affirmation */}
        {fc?.affirmation && (
          <p className="text-[11px] italic mt-2 px-3 py-2 rounded-lg" style={{ background: `${color}06`, color: `${color}CC`, border: `1px solid ${color}10` }}>
            &ldquo;{fc.affirmation}&rdquo;
          </p>
        )}
      </div>

      {/* Expanded sections */}
      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="px-5 pb-5 space-y-3" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
              {/* AI Cosmic Visual */}
              {aiVisual ? (
                <div className="rounded-xl overflow-hidden mt-3" style={{ border: `1px solid ${color}15` }}>
                  <img src={`data:image/png;base64,${aiVisual}`} alt="Cosmic visual" className="w-full h-32 object-cover" style={{ filter: 'saturate(1.1)' }} />
                </div>
              ) : (
                <button onClick={generateVisual} disabled={genVisual}
                  data-testid={`gen-visual-${forecast.id}`}
                  className="flex items-center gap-2 w-full mt-3 px-3 py-2 rounded-xl text-[10px] transition-all"
                  style={{ background: `${color}06`, border: `1px solid ${color}10`, color: color }}>
                  {genVisual ? <Loader2 size={10} className="animate-spin" /> : <Image size={10} />}
                  {genVisual ? 'Generating cosmic visual...' : 'Generate AI Cosmic Visual'}
                </button>
              )}
              {/* Sections */}
              {fc?.sections?.map((s, i) => {
                const energy = ENERGY_LABELS[s.energy] || ENERGY_LABELS.neutral;
                return (
                  <div key={i} className="pt-3">
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className="w-1.5 h-1.5 rounded-full" style={{ background: energy.color }} />
                      <span className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>{s.heading}</span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full" style={{ background: `${energy.color}12`, color: energy.color }}>{energy.label}</span>
                    </div>
                    <p className="text-[12px] leading-relaxed pl-4" style={{ color: 'var(--text-secondary)' }}>{s.content}</p>
                  </div>
                );
              })}

              {/* Lucky details */}
              {fc?.lucky && (
                <div className="flex flex-wrap gap-3 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                  {fc.lucky.numbers && (
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg" style={{ background: 'rgba(252,211,77,0.06)', border: '1px solid rgba(252,211,77,0.1)' }}>
                      <Hash size={10} style={{ color: '#FCD34D' }} />
                      <span className="text-[10px]" style={{ color: '#FCD34D' }}>{fc.lucky.numbers.join(', ')}</span>
                    </div>
                  )}
                  {fc.lucky.colors && (
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg" style={{ background: 'rgba(192,132,252,0.06)', border: '1px solid rgba(192,132,252,0.1)' }}>
                      <Sparkles size={10} style={{ color: '#C084FC' }} />
                      <span className="text-[10px]" style={{ color: '#C084FC' }}>{fc.lucky.colors.join(', ')}</span>
                    </div>
                  )}
                  {fc.lucky.crystal && (
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg" style={{ background: 'rgba(45,212,191,0.06)', border: '1px solid rgba(45,212,191,0.1)' }}>
                      <Heart size={10} style={{ color: '#2DD4BF' }} />
                      <span className="text-[10px]" style={{ color: '#2DD4BF' }}>{fc.lucky.crystal}</span>
                    </div>
                  )}
                  {fc.lucky.element && (
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg" style={{ background: 'rgba(251,146,60,0.06)', border: '1px solid rgba(251,146,60,0.1)' }}>
                      <Sun size={10} style={{ color: '#FB923C' }} />
                      <span className="text-[10px]" style={{ color: '#FB923C' }}>{fc.lucky.element}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function Forecasts() {
  const { user, authHeaders } = useAuth();
  const forecastResonance = useResonance();
  const [systems, setSystems] = useState({});
  const [selectedSystem, setSelectedSystem] = useState('astrology');
  const [selectedPeriod, setSelectedPeriod] = useState('daily');
  const [generating, setGenerating] = useState(false);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeForecast, setActiveForecast] = useState(null);

  const load = useCallback(async () => {
    if (!user) { setLoading(false); return; }
    try {
      const [sysRes, histRes] = await Promise.all([
        axios.get(`${API}/forecasts/systems`),
        axios.get(`${API}/forecasts/history`, { headers: authHeaders }),
      ]);
      setSystems(sysRes.data.systems || {});
      setHistory(histRes.data || []);
    } catch {}
    setLoading(false);
  }, [user, authHeaders]);

  useEffect(() => { if (typeof window.__workAccrue === 'function') window.__workAccrue('forecasts', 8); }, []);
  useEffect(() => { load(); }, [load]);

  const generate = async () => {
    setGenerating(true);
    try {
      const res = await axios.post(`${API}/forecasts/generate`, {
        system: selectedSystem,
        period: selectedPeriod,
      }, { headers: authHeaders });
      setActiveForecast(res.data);
      setHistory(prev => {
        const filtered = prev.filter(h => h.id !== res.data.id);
        return [res.data, ...filtered];
      });
      toast.success(`${PERIOD_LABELS[selectedPeriod].label} ${systems[selectedSystem]?.name} forecast ready`);

      // V68.52 — commit forecast to bus + paint the field.
      try {
        const fc = res.data?.forecast || {};
        busCommit('narrativeContext', {
          type: 'forecast',
          system: selectedSystem,
          period: selectedPeriod,
          summary: fc.summary || fc.headline || res.data?.title || '',
          themes: fc.themes || fc.areas || [],
          energy: fc.energy_quality || null,
        }, { moduleId: 'FORECASTS' });
        forecastResonance.triggerPulse(
          (fc.summary || '') + ' ' + JSON.stringify(fc.themes || []),
          'FORECASTS',
        );
      } catch { /* noop */ }
    } catch {
      toast.error('Could not generate forecast. Please try again.');
    }
    setGenerating(false);
  };

  const deleteForecast = async (id) => {
    try {
      await axios.delete(`${API}/forecasts/${id}`, { headers: authHeaders });
      setHistory(prev => prev.filter(h => h.id !== id));
      if (activeForecast?.id === id) setActiveForecast(null);
      toast.success('Forecast removed');
    } catch {}
  };

  const shareForecast = async (forecast) => {
    try {
      const fc = forecast.forecast;
      const periodLabel = PERIOD_LABELS[forecast.period]?.label || forecast.period;
      const content = `${fc?.title || forecast.system_name}\n\n${fc?.summary || ''}\n\n${fc?.affirmation ? `"${fc.affirmation}"` : ''}`;

      await axios.post(`${API}/community/posts`, {
        post_type: 'forecast',
        content: content.trim(),
        ritual_data: {
          system: forecast.system_name,
          period: periodLabel,
          energy: fc?.overall_energy,
          system_color: forecast.system_color,
        },
      }, { headers: authHeaders });
      toast.success(`${periodLabel} forecast shared to community`);
      return true;
    } catch {
      toast.error('Failed to share forecast');
      return false;
    }
  };

  // Filter history by current system
  const filteredHistory = history.filter(h => h.system === selectedSystem);

  if (!user) return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="p-12 text-center max-w-md">
        <Star size={32} style={{ color: 'rgba(192,132,252,0.3)', margin: '0 auto 12px' }} />
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Sign in to access cosmic forecasts.</p>
      </div>
    </div>
  );

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="animate-spin" size={24} style={{ color: 'var(--text-muted)' }} />
    </div>
  );

  const currentSystem = systems[selectedSystem];
  const sysColor = currentSystem?.color || '#C084FC';

  return (
    <div className="min-h-screen pt-20 pb-40 px-5" data-testid="forecasts-page">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-xs font-bold uppercase tracking-[0.3em] mb-2" style={{ color: sysColor }}>
            <Sparkles size={14} className="inline mr-2" />Cosmic Forecasts
          </p>
          <h1 className="text-3xl md:text-4xl font-light tracking-tight mb-2" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
            Divination & Prophecy
          </h1>
          <p className="text-sm mb-8" style={{ color: 'var(--text-secondary)' }}>
            Receive personalized guidance across ancient wisdom traditions. Daily, weekly, monthly, or yearly — the cosmos speaks.
          </p>
        </motion.div>

        {/* System Selector */}
        <div className="flex gap-2 mb-6 flex-wrap" data-testid="forecast-system-selector">
          {Object.entries(systems).map(([key, sys]) => {
            const Icon = SYSTEM_ICONS[sys.icon] || Star;
            const sel = selectedSystem === key;
            return (
              <button key={key} onClick={() => { setSelectedSystem(key); setActiveForecast(null); }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs transition-all"
                style={{
                  background: sel ? `${sys.color}12` : 'rgba(255,255,255,0.02)',
                  color: sel ? sys.color : 'var(--text-muted)',
                  border: `1px solid ${sel ? `${sys.color}25` : 'rgba(255,255,255,0.06)'}`,
                }}
                data-testid={`forecast-system-${key}`}>
                <Icon size={13} /> {sys.name}
              </button>
            );
          })}
        </div>

        {/* Period Selector */}
        <div className="flex gap-2 mb-8" data-testid="forecast-period-selector">
          {Object.entries(PERIOD_LABELS).map(([key, p]) => {
            const sel = selectedPeriod === key;
            return (
              <button key={key} onClick={() => { setSelectedPeriod(key); setActiveForecast(null); }}
                className="flex-1 py-2.5 rounded-xl text-xs text-center transition-all"
                style={{
                  background: sel ? `${sysColor}12` : 'rgba(255,255,255,0.02)',
                  color: sel ? sysColor : 'var(--text-muted)',
                  border: `1px solid ${sel ? `${sysColor}25` : 'rgba(255,255,255,0.06)'}`,
                }}
                data-testid={`forecast-period-${key}`}>
                <span className="font-medium">{p.label}</span>
                <span className="block text-[9px] mt-0.5 opacity-60">{p.desc}</span>
              </button>
            );
          })}
        </div>

        {/* Generate Button */}
        <motion.button
          onClick={generate}
          disabled={generating}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          className="w-full py-4 rounded-2xl text-sm font-medium flex items-center justify-center gap-2 mb-8 transition-all"
          style={{
            background: `linear-gradient(135deg, ${sysColor}15, ${sysColor}08)`,
            color: sysColor,
            border: `1px solid ${sysColor}25`,
          }}
          data-testid="generate-forecast-btn"
        >
          {generating ? (
            <><Loader2 size={16} className="animate-spin" /> Reading the cosmic currents...</>
          ) : (
            <><Sparkles size={16} /> Generate {PERIOD_LABELS[selectedPeriod].label} {currentSystem?.name} Forecast</>
          )}
        </motion.button>

        {/* Active Forecast */}
        {activeForecast && (
          <div className="mb-8">
            <ForecastCard forecast={activeForecast} onDelete={deleteForecast} onShare={shareForecast} />
          </div>
        )}

        {/* History */}
        {filteredHistory.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Clock size={12} style={{ color: 'var(--text-muted)' }} />
              <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                Previous {currentSystem?.name} Forecasts
              </span>
            </div>
            <div className="space-y-3">
              {filteredHistory.filter(h => h.id !== activeForecast?.id).slice(0, 10).map((f, i) => (
                <ForecastCard key={f.id} forecast={f} onDelete={deleteForecast} onShare={shareForecast} />
              ))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {filteredHistory.length === 0 && !activeForecast && (
          <div className="p-12 text-center">
            <Star size={28} style={{ color: `${sysColor}30`, margin: '0 auto 12px' }} />
            <p className="text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>No {currentSystem?.name} forecasts yet</p>
            <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Generate your first forecast to receive cosmic guidance</p>
          </div>
        )}
      </div>
    </div>
  );
}
