import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Sparkles, Star, ChevronRight, Loader2,
  Trophy, Zap, Gem, Crown, Volume2, VolumeX, Square,
} from 'lucide-react';
import { useSensory } from '../../context/SensoryContext';
import { STAT_CONFIG, ATMOSPHERE_THEMES } from './constants';
import { StatBar } from './StatBar';
import { XPBar } from './XPBar';
import { SceneImage } from './SceneImage';
import {
  speak as sageSpeak,
  stop as sageStop,
  subscribe as sageSubscribe,
} from '../../services/SageVoiceController';

// V1.0.13 — Scene narration speaker. Wraps the existing SageVoice
// service (already shipped V1.0.11/12) so the user can hear the
// scene narrated. Inline pill — Flatland-safe. Click to play, click
// again to stop. Reads/falls-back to the same controller state stream
// the global HUD uses, so visual feedback stays consistent.
function SceneNarrationSpeaker({ text, accentColor }) {
  const [vs, setVs] = useState({ state: 'idle' });
  useEffect(() => sageSubscribe(setVs), []);
  const speaking = vs.state === 'speaking' || vs.state === 'loading';
  const unavailable = vs.state === 'unavailable';
  const onTap = () => {
    if (speaking) { sageStop(); return; }
    if (unavailable) return;
    if (text) sageSpeak(text);
  };
  return (
    <button
      type="button"
      onClick={onTap}
      data-testid="scene-narration-speaker"
      data-voice-state={vs.state}
      title={
        unavailable ? 'Sage Voice unavailable — set ELEVENLABS_API_KEY'
        : speaking ? 'Stop narration'
        : 'Read scene aloud'
      }
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        padding: '4px 10px',
        borderRadius: 999,
        background: speaking ? `${accentColor}28` : `${accentColor}10`,
        border: `1px solid ${unavailable ? 'rgba(252,165,165,0.35)' : `${accentColor}55`}`,
        color: unavailable ? '#FCA5A5' : accentColor,
        fontSize: 9,
        letterSpacing: '0.18em',
        textTransform: 'uppercase',
        cursor: unavailable ? 'not-allowed' : 'pointer',
        marginBottom: 12,
      }}
    >
      {vs.state === 'loading' ? <Loader2 size={10} className="animate-spin" />
        : speaking ? <Square size={10} />
        : unavailable ? <VolumeX size={10} />
        : <Volume2 size={10} />}
      {speaking ? 'Stop' : unavailable ? 'No Voice Key' : 'Read Aloud'}
    </button>
  );
}

export function GameScene({ scene, character, origin, onChoice, loading, onBack, sceneImage, imageLoading }) {
  const { reduceMotion } = useSensory();
  // V68.34 — Start revealed to guarantee the narrative and choices are
  // always visible the moment the scene arrives. Users reported "dead
  // scene" because a 800ms opacity fade + opacity:0.15 pre-reveal hid
  // the text and choices while the scene was already fully loaded.
  const [revealed, setRevealed] = useState(true);
  const [choiceHover, setChoiceHover] = useState(null);
  const [prevStats, setPrevStats] = useState(null);
  const theme = ATMOSPHERE_THEMES[scene?.atmosphere] || ATMOSPHERE_THEMES.mystical;

  // Ensure revealed is true on every scene change (no hidden reveal timer)
  useEffect(() => { setRevealed(true); }, [scene?.narrative]);

  useEffect(() => {
    if (character?.stats) {
      const t = setTimeout(() => setPrevStats({ ...character.stats }), 2000);
      return () => clearTimeout(t);
    }
  }, [character?.stats]);

  // V68.31 — While the scene is being channeled by GPT-5.2 (takes 5–10s),
  // render a cinematic progress screen instead of a blank page. This is
  // what the user sees immediately after tapping "Begin Adventure".
  if (!scene) return <ChannelingStage origin={origin} onBack={onBack} />;

  const stats = character?.stats || {};

  return (
    <div className="relative z-10" data-testid="game-scene">
      {/* Top Bar */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-5">
        <button onClick={onBack} className="flex items-center gap-1.5 text-xs transition-all hover:gap-2.5 group"
          style={{ color: 'var(--text-muted)' }} data-testid="scene-back-btn">
          <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" /> Exit
        </button>
        <div className="flex items-center gap-2">
          <div className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest"
            style={{ background: `${origin.color}10`, color: origin.color, border: `1px solid ${origin.color}20` }}>
            {origin.name}
          </div>
          <div className="px-3 py-1 rounded-full text-[10px] font-medium"
            style={{ background: `${theme.glow}10`, color: theme.glow, border: `1px solid ${theme.glow}20` }}>
            Ch.{character.chapter} &middot; Scene {character.scene_num}
          </div>
        </div>
      </motion.div>

      {/* XP Bar */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="mb-4">
        <XPBar xp={character.xp} xpToNext={character.xp_to_next} level={character.level} />
      </motion.div>

      {/* Stats Row */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}
        className="grid grid-cols-5 gap-1 mb-5 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
        {Object.entries(stats).map(([key, val]) => (
          <StatBar key={key} statKey={key} value={val} prevValue={prevStats?.[key]} compact />
        ))}
      </motion.div>

      {/* Scene Image */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <SceneImage imageUrl={sceneImage} loading={imageLoading} atmosphere={scene.atmosphere} originColor={origin.color} />
      </motion.div>

      {/* Scene Title — always visible */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}
        className="text-center mb-3">
        <p className="text-xs font-bold uppercase tracking-[0.3em]" style={{ color: theme.glow }}>
          {scene.scene_title || scene.title || `Chapter ${character.chapter} · Scene ${character.scene_num}`}
        </p>
      </motion.div>

      {/* Narrative — always visible, no opacity tricks. V1.0.13:
          Added inline speaker pill that calls the SageVoice service
          (already shipped) so the player can hear the scene narrated. */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative rounded-2xl p-6 md:p-8 mb-8 overflow-hidden"
        style={{ background: 'rgba(0,0,0,0.25)', border: `1px solid ${theme.glow}12`, backdropFilter: 'blur(12px)' }}
        data-testid="scene-narrative">
        <div className="absolute top-0 left-0 w-24 h-24 pointer-events-none"
          style={{ background: `radial-gradient(circle, ${theme.glow}10, transparent)` }} />
        <div className="absolute bottom-0 right-0 w-32 h-32 pointer-events-none"
          style={{ background: `radial-gradient(circle, ${origin.color}08, transparent)` }} />
        <div className="relative">
          <SceneNarrationSpeaker text={scene.narrative} accentColor={theme.glow} />
          <p className="text-base md:text-lg leading-loose" style={{
            fontFamily: 'Cormorant Garamond, serif',
            color: 'var(--text-primary)',
            fontSize: '18px',
            lineHeight: '2',
          }}>
            {scene.narrative || 'The cosmos reshapes around you…'}
          </p>
        </div>
      </motion.div>

      {/* Choices — always render if present, no reveal gate */}
      <AnimatePresence>
        {!loading && Array.isArray(scene.choices) && scene.choices.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}
            className="space-y-3 mb-8" data-testid="scene-choices">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="h-px flex-1" style={{ background: `linear-gradient(90deg, transparent, ${theme.glow}30, transparent)` }} />
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] px-3" style={{ color: theme.glow }}>
                What do you do?
              </p>
              <div className="h-px flex-1" style={{ background: `linear-gradient(90deg, transparent, ${theme.glow}30, transparent)` }} />
            </div>
            {scene.choices?.map((choice, i) => {
              const statKey = Object.keys(choice.stat_effect || {})[0];
              const statCfg = STAT_CONFIG[statKey];
              const statDelta = choice.stat_effect?.[statKey] || 0;
              const isHovered = choiceHover === i;
              const isResonance = !!(choice.resonance_element || (choice.text && choice.text.includes('(Resonance)')));
              const isLegendary = !!(choice.legendary_path || (choice.text && choice.text.includes('(Legendary)')));

              return (
                <motion.button key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + i * 0.12 }}
                  onClick={() => !loading && onChoice(i)}
                  onMouseEnter={() => setChoiceHover(i)}
                  onMouseLeave={() => setChoiceHover(null)}
                  disabled={loading}
                  className="w-full relative overflow-hidden rounded-xl p-4 md:p-5 text-left transition-all group border"
                  style={{
                    background: isLegendary
                      ? `linear-gradient(135deg, rgba(252,211,77,0.08), rgba(0,0,0,0.3))`
                      : isResonance
                        ? `linear-gradient(135deg, rgba(192,132,252,0.06), rgba(0,0,0,0.3))`
                        : isHovered
                          ? `linear-gradient(135deg, ${statCfg?.color || theme.glow}10, rgba(0,0,0,0.3))`
                          : 'rgba(255,255,255,0.02)',
                    borderColor: isLegendary ? 'rgba(252,211,77,0.25)' : isResonance ? 'rgba(192,132,252,0.2)' : isHovered ? `${statCfg?.color || theme.glow}30` : 'rgba(255,255,255,0.05)',
                    transform: isHovered ? 'scale(1.01)' : 'scale(1)',
                    boxShadow: isLegendary ? '0 0 25px rgba(252,211,77,0.08)' : isResonance ? '0 0 20px rgba(192,132,252,0.06)' : isHovered ? `0 0 25px ${statCfg?.color || theme.glow}10` : 'none',
                  }}
                  data-testid={`choice-${i}`}>
                  {(isResonance || isLegendary) && (
                    <motion.div
                      animate={{ x: ['-100%', '200%'] }}
                      transition={{ duration: isLegendary ? 3 : 4, repeat: Infinity, ease: 'easeInOut', repeatDelay: isLegendary ? 1.5 : 3 }}
                      className="absolute inset-0 pointer-events-none opacity-20"
                      style={{ background: `linear-gradient(90deg, transparent, ${isLegendary ? 'rgba(252,211,77,0.2)' : 'rgba(192,132,252,0.15)'}, transparent)`, width: '40%' }} />
                  )}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ background: `radial-gradient(ellipse at 0% 50%, ${statCfg?.color || '#fff'}08, transparent 60%)` }} />
                  <div className="relative flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all"
                      style={{
                        background: isLegendary ? 'rgba(252,211,77,0.15)' : isResonance ? 'rgba(192,132,252,0.12)' : isHovered ? `${statCfg?.color || '#fff'}15` : 'rgba(255,255,255,0.04)',
                        border: `1px solid ${isLegendary ? 'rgba(252,211,77,0.35)' : isResonance ? 'rgba(192,132,252,0.3)' : isHovered ? (statCfg?.color || '#fff') + '30' : 'rgba(255,255,255,0.06)'}`,
                      }}>
                      {isLegendary ? (
                        <Crown size={14} style={{ color: '#FCD34D' }} />
                      ) : isResonance ? (
                        <Gem size={14} style={{ color: '#C084FC' }} />
                      ) : (
                        <span className="text-sm font-bold" style={{ color: statCfg?.color || '#fff' }}>
                          {String.fromCharCode(65 + i)}
                        </span>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium mb-1.5 leading-relaxed" style={{ color: isLegendary ? '#FDE68A' : isResonance ? '#D8C5F5' : 'var(--text-primary)' }}>
                        {choice.text}
                      </p>
                      <div className="flex items-center gap-2.5 flex-wrap">
                        {isLegendary && (
                          <motion.span
                            animate={{ boxShadow: ['0 0 4px rgba(252,211,77,0.2)', '0 0 10px rgba(252,211,77,0.4)', '0 0 4px rgba(252,211,77,0.2)'] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="text-[9px] px-2 py-0.5 rounded-full flex items-center gap-1 font-bold"
                            style={{ background: 'rgba(252,211,77,0.12)', color: '#FCD34D', border: '1px solid rgba(252,211,77,0.2)' }}>
                            <Crown size={8} /> Legendary Path
                          </motion.span>
                        )}
                        {isResonance && (
                          <span className="text-[9px] px-2 py-0.5 rounded-full flex items-center gap-1 font-bold"
                            style={{ background: 'rgba(192,132,252,0.1)', color: '#C084FC', border: '1px solid rgba(192,132,252,0.15)' }}>
                            <Gem size={8} /> Gem Resonance
                          </span>
                        )}
                        {statCfg && (
                          <span className="text-[9px] px-2 py-0.5 rounded-full flex items-center gap-1 font-bold"
                            style={{ background: `${statCfg.color}12`, color: statCfg.color, border: `1px solid ${statCfg.color}15` }}>
                            {React.createElement(statCfg.icon, { size: 9 })} +{statDelta} {statCfg.label}
                          </span>
                        )}
                        <AnimatePresence>
                          {isHovered && choice.preview && (
                            <motion.span initial={{ opacity: 0, x: -5 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                              className="text-[9px] italic" style={{ color: 'var(--text-muted)' }}>
                              {choice.preview}
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                    <ChevronRight size={16} className="flex-shrink-0 mt-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all"
                      style={{ color: isResonance ? '#C084FC' : statCfg?.color || 'var(--text-muted)' }} />
                  </div>
                </motion.button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading state */}
      {loading && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-12 gap-4">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}>
            <div className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{ background: `radial-gradient(circle, ${origin.color}20, transparent)`, border: `1px solid ${origin.color}20` }}>
              <Sparkles size={24} style={{ color: origin.color }} />
            </div>
          </motion.div>
          <p className="text-sm font-medium" style={{ color: origin.color }}>The cosmos reshapes around you...</p>
          <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Generating your next scene with AI</p>
        </motion.div>
      )}

      {/* Level Up */}
      <AnimatePresence>
        {character.leveled_up && (
          <motion.div initial={{ opacity: 0, scale: 0.8, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 rounded-2xl p-6 text-center"
            style={{
              background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(20px)',
              border: '1px solid rgba(252,211,77,0.3)', boxShadow: '0 0 60px rgba(252,211,77,0.15)',
            }}
            data-testid="level-up-toast">
            <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 0.5 }}>
              <Zap size={28} className="mx-auto mb-2" style={{ color: '#FCD34D' }} />
            </motion.div>
            <p className="text-lg font-light mb-1" style={{ fontFamily: 'Cormorant Garamond, serif', color: '#FCD34D' }}>Level Up!</p>
            <p className="text-sm" style={{ color: 'rgba(252,211,77,0.8)' }}>You reached Level {character.level}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Achievement */}
      <AnimatePresence>
        {character.new_achievements?.map(ach => (
          <motion.div key={ach.id} initial={{ opacity: 0, y: 30, x: '-50%' }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="fixed bottom-8 left-1/2 z-50 rounded-xl p-4 flex items-center gap-3"
            style={{
              background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(16px)',
              border: '1px solid rgba(192,132,252,0.2)',
            }}>
            <Trophy size={20} style={{ color: '#C084FC' }} />
            <div>
              <p className="text-xs font-bold" style={{ color: '#C084FC' }}>{ach.title}</p>
              <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{ach.desc}</p>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   ChannelingStage — V68.31
   Shown while the GPT-5.2 narrative is being generated (5–10s). Gives the
   user cinematic, obviously-alive feedback so "Begin Adventure" never
   looks dead again. Uses pure Motion + origin color theming. No 3D deps.
   ───────────────────────────────────────────────────────────────────── */
function ChannelingStage({ origin, onBack }) {
  const color = origin?.color || '#C084FC';
  const name = origin?.name || 'Starseed';
  const [elapsed, setElapsed] = useState(0);
  const [phase, setPhase] = useState(0);

  const phases = [
    `Aligning your ${name} resonance…`,
    `Pulling threads of memory from ${origin?.home_system || 'your home constellation'}…`,
    'Composing the opening scene with GPT-5.2…',
    'Weaving your choices and gem resonance into the narrative…',
    'Almost there — the cosmos is finding its voice…',
  ];

  useEffect(() => {
    const t = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => clearInterval(t);
  }, []);
  useEffect(() => {
    setPhase(Math.min(phases.length - 1, Math.floor(elapsed / 2.2)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [elapsed]);

  return (
    <div
      className="relative z-10 min-h-[70vh] flex flex-col items-center justify-center px-6"
      data-testid="channeling-stage"
    >
      {/* Exit always reachable so the button is never a trap */}
      <button
        onClick={onBack}
        className="absolute top-2 left-2 flex items-center gap-1.5 text-xs transition-all hover:gap-2.5 group"
        style={{ color: 'var(--text-muted)' }}
        data-testid="channeling-back-btn"
      >
        <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" /> Exit
      </button>

      {/* Pulsing concentric rings, themed by origin color */}
      <div className="relative flex items-center justify-center mb-10" style={{ width: 180, height: 180 }}>
        {[0, 1, 2].map(i => (
          <motion.div
            key={i}
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: [0.6, 1.3, 0.6], opacity: [0, 0.45, 0] }}
            transition={{ duration: 2.618, repeat: Infinity, delay: i * 0.618, ease: 'easeInOut' }}
            className="absolute inset-0 rounded-full"
            style={{ border: `2px solid ${color}`, boxShadow: `0 0 42px ${color}80 inset, 0 0 60px ${color}55` }}
          />
        ))}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
          className="relative flex items-center justify-center rounded-full"
          style={{
            width: 120, height: 120,
            background: `radial-gradient(circle at center, ${color}33 0%, ${color}11 45%, transparent 70%)`,
            border: `1px solid ${color}66`,
          }}
        >
          <Sparkles size={40} style={{ color }} />
        </motion.div>
      </div>

      <p className="text-[11px] font-bold uppercase tracking-[0.32em] mb-3" style={{ color }}>
        Channeling {name}
      </p>
      <h2
        className="text-3xl sm:text-4xl font-light tracking-tight mb-5 text-center"
        style={{
          fontFamily: 'Cormorant Garamond, serif',
          background: `linear-gradient(135deg, #fff, ${color})`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}
      >
        The stars are composing your opening scene
      </h2>

      <AnimatePresence mode="wait">
        <motion.p
          key={phase}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.45 }}
          className="text-sm text-center max-w-md"
          style={{ color: 'var(--text-secondary)', fontFamily: 'Cormorant Garamond, serif', fontSize: 17 }}
        >
          {phases[phase]}
        </motion.p>
      </AnimatePresence>

      {/* Progress — honest numbers, not a lie. Scales 0→100 across ~12s.  */}
      <div className="mt-8 w-full max-w-sm">
        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
          <motion.div
            initial={{ width: '0%' }}
            animate={{ width: `${Math.min(96, (elapsed / 12) * 96)}%` }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            style={{ height: '100%', background: `linear-gradient(90deg, ${color}, #fff)` }}
          />
        </div>
        <div className="mt-2 flex justify-between text-[10px] uppercase tracking-[0.3em]" style={{ color: 'var(--text-muted)' }}>
          <span>{elapsed}s elapsed</span>
          <span>gpt-5.2 channeling…</span>
        </div>
      </div>
    </div>
  );
}

