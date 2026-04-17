import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';
import useGameController from '../hooks/useGameController';
import GameModuleWrapper from '../components/game/GameModuleWrapper';
import { CosmicInlineLoader } from '../components/CosmicFeedback';
import {
  ArrowLeft, Lock, Unlock, BookOpen, Wind, Eye, Star,
  Sparkles, ChevronRight, Award, Zap, Volume2
} from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const EL_COLORS = { wood: '#22C55E', fire: '#EF4444', earth: '#F59E0B', metal: '#94A3B8', water: '#3B82F6' };

// ── Procedural Glyph Renderer ──
// Generates geometric SVG shapes from a seed number, reactive to element
function GlyphCanvas({ seed, element, size = 80, decoded, difficulty, animating }) {
  const color = EL_COLORS[element] || '#F59E0B';
  const rng = useMemo(() => {
    let s = seed;
    return () => { s = (s * 16807 + 0) % 2147483647; return s / 2147483647; };
  }, [seed]);

  const paths = useMemo(() => {
    const r = rng;
    const cx = size / 2, cy = size / 2;
    const radius = size * 0.38;
    const lines = [];
    const points = 3 + Math.floor(r() * (difficulty + 2));

    // Outer polygon
    const outerPts = [];
    for (let i = 0; i < points; i++) {
      const angle = (Math.PI * 2 * i) / points - Math.PI / 2;
      const rad = radius * (0.8 + r() * 0.4);
      outerPts.push([cx + Math.cos(angle) * rad, cy + Math.sin(angle) * rad]);
    }
    lines.push(outerPts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ') + ' Z');

    // Inner connections
    for (let i = 0; i < Math.min(difficulty + 1, points); i++) {
      const j = (i + 2) % points;
      lines.push(`M${outerPts[i][0].toFixed(1)},${outerPts[i][1].toFixed(1)} L${outerPts[j][0].toFixed(1)},${outerPts[j][1].toFixed(1)}`);
    }

    // Inner circle
    if (difficulty > 2) {
      const ir = radius * 0.3;
      lines.push(`M${cx},${cy - ir} A${ir},${ir} 0 1 1 ${cx},${cy + ir} A${ir},${ir} 0 1 1 ${cx},${cy - ir}`);
    }

    // Central dot
    lines.push(`M${cx - 2},${cy} a2,2 0 1,0 4,0 a2,2 0 1,0 -4,0`);

    return lines;
  }, [rng, size, difficulty]);

  return (
    <motion.svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}
      className="overflow-visible"
      animate={animating ? { rotate: [0, 5, -5, 0], scale: [1, 1.05, 1] } : {}}
      transition={{ duration: 1.5, ease: 'easeInOut' }}>
      {/* Glow */}
      <defs>
        <filter id={`glow-${seed}`}>
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      {paths.map((d, i) => (
        <motion.path key={i} d={d}
          fill="none"
          stroke={decoded ? color : 'rgba(255,255,255,0.15)'}
          strokeWidth={i === 0 ? 1.5 : 0.8}
          filter={decoded ? `url(#glow-${seed})` : undefined}
          initial={decoded ? { pathLength: 0, opacity: 0 } : { opacity: 0.3 }}
          animate={decoded ? { pathLength: 1, opacity: 1 } : { opacity: [0.15, 0.35, 0.15] }}
          transition={decoded
            ? { pathLength: { duration: 1.2, delay: i * 0.15 }, opacity: { duration: 0.3 } }
            : { duration: 3, repeat: Infinity }
          }
          style={{ strokeLinecap: 'round' }}
        />
      ))}
    </motion.svg>
  );
}

// ── Breath Cycle Visualizer ──
function BreathCycle({ pattern, color, active, onComplete }) {
  const [phase, setPhase] = useState('idle');
  const [timer, setTimer] = useState(0);
  const [cycleCount, setCycleCount] = useState(0);
  const intervalRef = useRef(null);

  const parts = useMemo(() => {
    const p = pattern.split('-');
    const parsed = [];
    for (let i = 0; i < p.length; i += 2) {
      parsed.push({ action: p[i], duration: parseInt(p[i + 1]) || 4 });
    }
    return parsed;
  }, [pattern]);

  const startBreathCycle = useCallback(() => {
    let step = 0;
    let count = 0;

    const runStep = () => {
      if (step >= parts.length) {
        count++;
        setCycleCount(count);
        if (count >= 3) {
          setPhase('complete');
          clearInterval(intervalRef.current);
          onComplete?.();
          return;
        }
        step = 0;
      }
      const part = parts[step];
      setPhase(part.action);
      setTimer(part.duration);
      let remaining = part.duration;

      clearInterval(intervalRef.current);
      intervalRef.current = setInterval(() => {
        remaining--;
        setTimer(remaining);
        if (remaining <= 0) {
          clearInterval(intervalRef.current);
          step++;
          runStep();
        }
      }, 1000);
    };

    runStep();
  }, [parts, onComplete]);

  useEffect(() => {
    if (active) startBreathCycle();
    return () => clearInterval(intervalRef.current);
  }, [active, startBreathCycle]);

  const phaseLabel = { inhale: 'Breathe In', exhale: 'Breathe Out', hold: 'Hold', idle: 'Ready', complete: 'Decoded' };
  const scale = phase === 'inhale' ? 1.3 : phase === 'exhale' ? 0.85 : 1;

  return (
    <div className="flex flex-col items-center gap-2" data-testid="breath-cycle">
      <motion.div
        className="w-16 h-16 rounded-full flex items-center justify-center"
        animate={{ scale }}
        transition={{ duration: timer || 1, ease: 'easeInOut' }}
        style={{
          background: `${color}10`,
          border: `2px solid ${color}40`,
          boxShadow: phase !== 'idle' ? `0 0 30px ${color}20` : 'none',
        }}>
        {phase === 'complete' ? (
          <Sparkles size={20} style={{ color }} />
        ) : (
          <Wind size={20} style={{ color: phase === 'idle' ? 'var(--text-muted)' : color }} />
        )}
      </motion.div>
      <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: phase === 'idle' ? 'var(--text-muted)' : color }}>
        {phaseLabel[phase] || phase} {timer > 0 && phase !== 'complete' ? timer : ''}
      </p>
      <div className="flex items-center gap-1">
        {[0, 1, 2].map(i => (
          <div key={i} className="w-1.5 h-1.5 rounded-full" style={{
            background: i < cycleCount ? color : 'rgba(255,255,255,0.08)',
          }} />
        ))}
      </div>
    </div>
  );
}

// ── Glyph Card ──
function GlyphCard({ glyph, scriptColor, onDecode, decoding }) {
  const [breathing, setBreathing] = useState(false);
  const [revealed, setRevealed] = useState(glyph.decoded);

  const handleStartDecode = () => {
    if (revealed) return;
    setBreathing(true);
  };

  const handleBreathComplete = () => {
    setBreathing(false);
    setRevealed(true);
    onDecode(glyph.id);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay: glyph.difficulty * 0.06 }}
      className="rounded-xl p-4 relative overflow-hidden"
      style={{
        background: revealed ? `${scriptColor}04` : 'rgba(255,255,255,0.015)',
        border: `1px solid ${revealed ? `${scriptColor}15` : 'rgba(255,255,255,0.04)'}`,
      }}
      data-testid={`glyph-${glyph.id}`}>
      {/* Decoded shimmer */}
      {revealed && (
        <motion.div className="absolute inset-0"
          animate={{ backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'] }}
          transition={{ duration: 6, repeat: Infinity }}
          style={{
            background: `linear-gradient(135deg, transparent 30%, ${scriptColor}06 50%, transparent 70%)`,
            backgroundSize: '200% 200%',
          }} />
      )}
      <div className="relative z-10">
        <div className="flex gap-3">
          <div className="flex-shrink-0">
            <GlyphCanvas
              seed={glyph.geo_seed}
              element={glyph.element}
              size={64}
              decoded={revealed}
              difficulty={glyph.difficulty}
              animating={breathing}
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-1">
              <p className="text-sm font-bold" style={{
                color: revealed ? scriptColor : 'var(--text-secondary)',
                fontFamily: 'Cormorant Garamond, serif',
              }}>
                {glyph.name}
              </p>
              <span className="text-[6px] px-1.5 py-0.5 rounded-full uppercase font-bold"
                style={{
                  background: revealed ? `${scriptColor}12` : 'rgba(255,255,255,0.04)',
                  color: revealed ? scriptColor : 'var(--text-muted)',
                }}>
                Tier {glyph.difficulty}
              </span>
            </div>

            {/* Phonetic */}
            <p className="text-[8px] font-mono mb-1" style={{ color: revealed ? scriptColor : 'var(--text-muted)' }}>
              /{glyph.phonetic}/
            </p>

            {/* Meaning (only when decoded) */}
            <AnimatePresence>
              {revealed && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0 }}
                  className="text-[9px] italic"
                  style={{ color: 'var(--text-secondary)', fontFamily: 'Cormorant Garamond, serif' }}>
                  "{glyph.meaning}"
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Breath decode zone */}
        {!revealed && !breathing && (
          <button onClick={handleStartDecode} disabled={decoding}
            className="mt-3 w-full flex items-center justify-center gap-1.5 py-2 rounded-lg text-[9px] font-medium"
            style={{ background: `${scriptColor}06`, color: scriptColor, border: `1px solid ${scriptColor}10` }}
            data-testid={`decode-btn-${glyph.id}`}>
            <Wind size={10} /> Begin Breath Cycle to Decode
          </button>
        )}

        {breathing && (
          <div className="mt-3 flex justify-center">
            <BreathCycle
              pattern={glyph.element === 'fire' ? 'inhale-2-exhale-4-hold-1' :
                       glyph.element === 'wood' ? 'inhale-4-hold-2-exhale-6' :
                       glyph.element === 'water' ? 'inhale-4-exhale-8-hold-2' :
                       glyph.element === 'metal' ? 'inhale-3-hold-3-exhale-3' :
                       'inhale-6-hold-4-exhale-8'}
              color={scriptColor}
              active={true}
              onComplete={handleBreathComplete}
            />
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ── Tier Progress ──
function TierProgressBar({ tiers, currentTier }) {
  return (
    <div className="mb-4" data-testid="tier-progress">
      <div className="flex items-center justify-between mb-1.5">
        <p className="text-[8px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
          Script Mastery Tiers
        </p>
        <p className="text-[8px] font-semibold" style={{ color: '#A855F7' }}>
          {tiers.find(t => t.current)?.name}
        </p>
      </div>
      <div className="flex gap-1">
        {tiers.map(t => (
          <div key={t.tier} className="flex-1 rounded-full h-1.5" style={{
            background: t.unlocked
              ? (t.current ? '#A855F7' : 'rgba(168,85,247,0.3)')
              : 'rgba(255,255,255,0.04)',
          }} />
        ))}
      </div>
      <div className="flex justify-between mt-1">
        {tiers.map(t => (
          <div key={t.tier} className="text-center" style={{ flex: 1 }}>
            <p className="text-[6px]" style={{ color: t.unlocked ? '#A855F7' : 'var(--text-muted)' }}>
              {t.unlocked ? <Unlock size={6} className="inline" /> : <Lock size={6} className="inline" />}
              {' '}{t.harmony_required}H
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Mastery Element Card ──
function MasteryCard({ element, data, scriptName }) {
  const color = EL_COLORS[element] || '#F59E0B';
  return (
    <div className="rounded-xl p-3" style={{ background: `${color}04`, border: `1px solid ${color}10` }}>
      <div className="flex items-center justify-between mb-1">
        <p className="text-[10px] font-bold" style={{ color, fontFamily: 'Cormorant Garamond, serif' }}>
          {scriptName}
        </p>
        <span className="text-[7px] px-1.5 py-0.5 rounded-lg" style={{ background: `${color}08`, color }}>
          +{data.modifier_value} {element}
        </span>
      </div>
      <div className="flex items-center gap-3 text-[7px]" style={{ color: 'var(--text-muted)' }}>
        <span>Decoded: {data.total_decoded}</span>
        <span>XP: {data.total_xp}</span>
      </div>
    </div>
  );
}


// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  MAIN PAGE — Forgotten Languages
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export default function ForgottenLanguages() {
  useEffect(() => { if (typeof window.__workAccrue === 'function') window.__workAccrue('languages', 8); }, []);

  const navigate = useNavigate();
  const { authHeaders } = useAuth();
  const headers = authHeaders;
  const controller = useGameController('forgotten_languages');

  const [daily, setDaily] = useState(null);
  const [mastery, setMastery] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('cipher');
  const [decoding, setDecoding] = useState(false);
  const [mantraRipple, setMantraRipple] = useState(false);

  const fetchDaily = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/forgotten-languages/daily`, { headers });
      setDaily(res.data);
    } catch {}
    setLoading(false);
  }, [headers]);

  const fetchMastery = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/forgotten-languages/mastery`, { headers });
      setMastery(res.data);
    } catch {}
  }, [headers]);

  useEffect(() => { fetchDaily(); }, [fetchDaily]);
  useEffect(() => { if (tab === 'mastery') fetchMastery(); }, [tab, fetchMastery]);

  const handleDecode = async (glyphId) => {
    setDecoding(true);
    setMantraRipple(true);
    setTimeout(() => setMantraRipple(false), 2000);
    try {
      const res = await axios.post(`${API}/forgotten-languages/decode`, { glyph_id: glyphId }, { headers });
      const { rewards, progress, streak } = res.data;
      const streakText = streak?.current > 0 ? ` (${streak.multiplier}x streak!)` : '';
      toast(`Decoded! +${rewards.xp} XP${rewards.bonus_xp > 0 ? ` (+${rewards.bonus_xp} bonus)` : ''}, ${rewards.modifier}${streakText}`);
      controller.refreshState();

      // Update local state
      setDaily(prev => ({
        ...prev,
        decoded_count: progress.decoded_count,
        glyphs: prev.glyphs.map(g => g.id === glyphId ? { ...g, decoded: true } : g),
      }));

      if (progress.all_decoded) {
        toast('All glyphs decoded today! Return tomorrow for new scripts.');
      }
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Decode failed');
    }
    setDecoding(false);
  };

  if (loading || controller.loading) return (
    <GameModuleWrapper harmonyScore={50} dominantElement="earth" dominantPercentage={20}
      moduleName="forgotten_languages" showEntropyIndicator={false}>
      <div className="min-h-screen flex items-center justify-center">
        <CosmicInlineLoader message="Channeling ancient scripts..." />
      </div>
    </GameModuleWrapper>
  );

  const scriptColor = daily?.script?.color || '#A855F7';
  const element = daily?.element || 'earth';

  return (
    <GameModuleWrapper
      harmonyScore={controller.harmonyScore}
      dominantElement={controller.dominantElement}
      dominantPercentage={controller.dominantPercentage}
      harmonyCycle={controller.harmonyCycle}
      decayActivity={controller.decayActivity}
      mantraActive={mantraRipple}
      mantraColor={scriptColor}
      moduleName="forgotten_languages"
      layerData={controller.layerData}
      activeLayer={controller.activeLayer}
      visualDirectives={controller.visualDirectives}
      biomeContext={controller.biomeContext}>

      <div className="pb-24" data-testid="forgotten-languages-page">
        {/* Header */}
        <div className="px-4 pt-4 pb-3 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.03)' }} data-testid="fl-back-btn">
            <ArrowLeft size={16} style={{ color: 'var(--text-muted)' }} />
          </button>
          <div className="flex-1">
            <h1 className="text-base font-semibold" style={{ color: 'var(--text-primary)', fontFamily: 'Cormorant Garamond, serif' }}>
              Forgotten Languages
            </h1>
            <p className="text-[8px]" style={{ color: 'var(--text-muted)' }}>
              Decode ancient scripts. Each glyph feeds your {element} resonance.
            </p>
          </div>
          <button onClick={() => navigate('/nexus')} className="text-[8px] px-2 py-1 rounded-lg"
            style={{ background: `${scriptColor}06`, color: scriptColor, border: `1px solid ${scriptColor}10` }}
            data-testid="fl-nexus-link">Nexus</button>
        </div>

        {/* Tabs */}
        <div className="px-4 flex gap-2 mb-4" data-testid="fl-tabs">
          {[
            { id: 'cipher', label: 'Daily Cipher', icon: Eye },
            { id: 'mastery', label: 'Mastery', icon: Award },
            { id: 'scripts', label: 'Scripts', icon: BookOpen },
          ].map(t => {
            const TIcon = t.icon;
            return (
              <button key={t.id} onClick={() => setTab(t.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[9px] font-medium"
                style={{
                  background: tab === t.id ? `${scriptColor}12` : 'rgba(255,255,255,0.02)',
                  color: tab === t.id ? scriptColor : 'var(--text-muted)',
                  border: `1px solid ${tab === t.id ? `${scriptColor}20` : 'rgba(255,255,255,0.04)'}`,
                }}
                data-testid={`fl-tab-${t.id}`}><TIcon size={10} /> {t.label}</button>
            );
          })}
        </div>

        <div className="px-4">
          {/* Daily Cipher tab */}
          {tab === 'cipher' && daily && (
            <DailyCipherTab
              daily={daily}
              scriptColor={scriptColor}
              element={element}
              decoding={decoding}
              onDecode={handleDecode}
              controller={controller}
            />
          )}

          {/* Mastery tab */}
          {tab === 'mastery' && (
            <MasteryTab mastery={mastery} fetchMastery={fetchMastery} />
          )}

          {/* Scripts encyclopedia tab */}
          {tab === 'scripts' && (
            <ScriptsTab />
          )}
        </div>
      </div>
    </GameModuleWrapper>
  );
}

function DailyCipherTab({ daily, scriptColor, element, decoding, onDecode, controller }) {
  return (
    <div data-testid="daily-cipher-tab">
      {/* Script Header Card */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl p-4 mb-4 relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, rgba(15,15,30,0.95), ${scriptColor}08)`,
          border: `1px solid ${scriptColor}15`,
        }}
        data-testid="script-header">
        <motion.div className="absolute inset-0"
          animate={{ opacity: [0.02, 0.05, 0.02] }}
          transition={{ duration: 4, repeat: Infinity }}
          style={{ background: `radial-gradient(circle at 30% 30%, ${scriptColor}15, transparent 60%)` }} />
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className="text-sm font-bold" style={{ color: scriptColor, fontFamily: 'Cormorant Garamond, serif' }}>
                {daily.script.name}
              </h2>
              <p className="text-[7px] italic" style={{ color: 'var(--text-muted)', fontFamily: 'Cormorant Garamond, serif' }}>
                {daily.script.origin}
              </p>
            </div>
            <div className="text-center">
              <p className="text-[7px] uppercase" style={{ color: 'var(--text-muted)' }}>Harmony</p>
              <p className="text-sm font-bold" style={{ color: controller.harmonyScore > 50 ? '#22C55E' : '#F59E0B' }}>
                {controller.harmonyScore}
              </p>
            </div>
          </div>
          <p className="text-[9px] mb-3" style={{ color: 'var(--text-secondary)' }}>{daily.script.description}</p>

          {/* Breath Pattern Info */}
          <div className="flex items-center gap-3 rounded-lg p-2"
            style={{ background: `${scriptColor}06`, border: `1px solid ${scriptColor}08` }}>
            <Wind size={12} style={{ color: scriptColor }} />
            <div className="flex-1">
              <p className="text-[8px] font-semibold" style={{ color: scriptColor }}>{daily.breath.label}</p>
              <p className="text-[7px] font-mono" style={{ color: 'var(--text-muted)' }}>{daily.breath.pattern}</p>
            </div>
            <div className="flex items-center gap-1 text-[7px]" style={{ color: 'var(--text-muted)' }}>
              <Volume2 size={8} /> {daily.breath.hz}Hz
            </div>
            <p className="text-[8px] italic" style={{ color: scriptColor }}>{daily.breath.mantra}</p>
          </div>
        </div>
      </motion.div>

      {/* Tier & Progress */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5">
          <Star size={10} style={{ color: '#A855F7' }} />
          <span className="text-[8px] font-bold" style={{ color: '#A855F7' }}>{daily.tier_name}</span>
          <span className="text-[7px]" style={{ color: 'var(--text-muted)' }}>Tier {daily.tier}</span>
        </div>
        <div className="flex items-center gap-2">
          {daily.streak?.current > 0 && (
            <span className="text-[8px] px-2 py-0.5 rounded-lg" style={{ background: 'rgba(252,211,77,0.08)', color: '#FCD34D' }}
              data-testid="streak-badge">
              {daily.streak.current} day streak ({daily.streak.multiplier}x)
            </span>
          )}
          <span className="text-[8px] px-2 py-0.5 rounded-lg" style={{ background: `${scriptColor}08`, color: scriptColor }}>
            {daily.decoded_count}/{daily.total_glyphs} Decoded
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full h-1.5 rounded-full mb-4" style={{ background: 'rgba(255,255,255,0.04)' }}>
        <motion.div initial={{ width: 0 }} animate={{ width: `${(daily.decoded_count / daily.total_glyphs) * 100}%` }}
          className="h-full rounded-full" style={{ background: scriptColor }} />
      </div>

      {/* Reward info */}
      <div className="flex items-center gap-3 mb-4 text-[7px]" style={{ color: 'var(--text-muted)' }}>
        <span className="px-2 py-0.5 rounded-lg" style={{ background: 'rgba(252,211,77,0.06)', color: '#FCD34D' }}>
          +{daily.rewards_per_glyph.xp} XP/glyph
        </span>
        <span className="px-2 py-0.5 rounded-lg" style={{ background: 'rgba(139,92,246,0.06)', color: '#8B5CF6' }}>
          +{daily.rewards_per_glyph.dust} Dust/glyph
        </span>
        <span className="px-2 py-0.5 rounded-lg" style={{ background: `${scriptColor}06`, color: scriptColor }}>
          +{daily.rewards_per_glyph.modifier} {element}/glyph
        </span>
      </div>

      {/* Glyph Cards */}
      <p className="text-[8px] uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>
        Today's Glyphs
      </p>
      <div className="space-y-3">
        {daily.glyphs.map(g => (
          <GlyphCard key={g.id} glyph={g} scriptColor={scriptColor}
            onDecode={onDecode} decoding={decoding} />
        ))}
      </div>
    </div>
  );
}

function MasteryTab({ mastery, fetchMastery }) {
  useEffect(() => { if (!mastery) fetchMastery(); }, [mastery, fetchMastery]);

  if (!mastery) return <CosmicInlineLoader message="Loading mastery..." />;

  return (
    <div data-testid="mastery-tab">
      <TierProgressBar tiers={mastery.tiers} currentTier={mastery.current_tier} />

      <div className="flex items-center justify-between mb-3">
        <p className="text-[8px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
          Total Decoded: {mastery.total_decoded}
        </p>
        <p className="text-[8px]" style={{ color: '#A855F7' }}>
          {mastery.current_tier_name}
        </p>
      </div>

      {/* Per-element mastery */}
      <div className="space-y-2 mb-4">
        {Object.entries(mastery.by_element).map(([el, data]) => (
          <MasteryCard key={el} element={el} data={data}
            scriptName={mastery.scripts[el]?.name || el} />
        ))}
      </div>

      {Object.keys(mastery.by_element).length === 0 && (
        <div className="text-center py-12">
          <BookOpen size={24} className="mx-auto mb-2" style={{ color: 'var(--text-muted)' }} />
          <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
            Begin decoding glyphs in the Daily Cipher to build mastery.
          </p>
        </div>
      )}

      {/* Active Nexus Modifiers */}
      {Object.keys(mastery.modifiers).length > 0 && (
        <div className="mt-4">
          <p className="text-[8px] uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>
            Permanent Nexus Modifiers
          </p>
          <div className="grid grid-cols-5 gap-2">
            {Object.entries(mastery.modifiers).map(([el, val]) => (
              <div key={el} className="text-center rounded-lg p-2"
                style={{ background: `${EL_COLORS[el]}06`, border: `1px solid ${EL_COLORS[el]}10` }}>
                <p className="text-sm font-bold" style={{ color: EL_COLORS[el] }}>+{val}</p>
                <p className="text-[6px] uppercase" style={{ color: 'var(--text-muted)' }}>{el}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ScriptsTab() {
  const { authHeaders } = useAuth();
  const [scripts, setScripts] = useState(null);

  useEffect(() => {
    axios.get(`${API}/forgotten-languages/scripts`, { headers: authHeaders })
      .then(r => setScripts(r.data.scripts)).catch(() => {});
  }, [authHeaders]);

  if (!scripts) return <CosmicInlineLoader message="Loading scripts..." />;

  return (
    <div data-testid="scripts-tab">
      <p className="text-[8px] uppercase tracking-widest mb-3" style={{ color: 'var(--text-muted)' }}>
        The Five Elemental Scripts
      </p>
      <div className="space-y-3">
        {Object.entries(scripts).map(([el, s]) => {
          const color = EL_COLORS[el] || '#F59E0B';
          return (
            <div key={el} className="rounded-xl p-4" style={{ background: `${color}04`, border: `1px solid ${color}10` }}>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: `${color}10` }}>
                  <BookOpen size={14} style={{ color }} />
                </div>
                <div>
                  <p className="text-sm font-bold" style={{ color, fontFamily: 'Cormorant Garamond, serif' }}>{s.name}</p>
                  <p className="text-[7px] italic" style={{ color: 'var(--text-muted)' }}>{s.origin}</p>
                </div>
              </div>
              <p className="text-[9px] mb-2" style={{ color: 'var(--text-secondary)' }}>{s.description}</p>
              <div className="flex items-center gap-3 text-[7px]" style={{ color: 'var(--text-muted)' }}>
                <span className="flex items-center gap-1"><Wind size={8} /> {s.breath.label}</span>
                <span className="font-mono">{s.breath.pattern}</span>
                <span>{s.breath.hz}Hz</span>
                <span className="italic" style={{ color }}>{s.breath.mantra}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
