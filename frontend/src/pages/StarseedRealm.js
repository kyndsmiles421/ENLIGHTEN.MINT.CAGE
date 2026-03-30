import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';
import { useSensory } from '../context/SensoryContext';
import {
  Star, Users, Trophy, Swords, Shield, Heart, Eye, Brain,
  ChevronRight, Loader2, Sparkles, Zap, Globe, Crown,
  ArrowLeft, Plus, Clock, Flame, UserPlus, Send, Skull,
  Target, AlertTriangle, MessageCircle, Package
} from 'lucide-react';
import { LootDropReveal, AvatarBadge } from '../components/StarseedInventory';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const STAT_ICONS = { wisdom: Brain, courage: Swords, compassion: Heart, intuition: Eye, resilience: Shield };
const ORIGIN_COLORS = {
  pleiadian: '#818CF8', sirian: '#38BDF8', arcturian: '#A855F7',
  lyran: '#F59E0B', andromedan: '#0EA5E9', orion: '#DC2626',
};
const ENCOUNTER_TYPE_ICONS = { alliance: Users, challenge: Swords, revelation: Eye, trade: Star, trial: Shield };

/* ─── Realm Star Map Canvas ─── */
function RealmStarMap({ players, onPlayerClick, reduceParticles }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const [hoveredPlayer, setHoveredPlayer] = useState(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.offsetWidth;
    const H = canvas.offsetHeight;
    canvas.width = W;
    canvas.height = H;

    // Star background
    const bgStars = Array.from({ length: reduceParticles ? 30 : 80 }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      r: Math.random() * 1.2 + 0.3,
      twinkle: Math.random() * 0.015 + 0.003,
      phase: Math.random() * Math.PI * 2,
    }));

    // Place players in a constellation pattern
    const playerPositions = players.map((p, i) => {
      const angle = (i / Math.max(1, players.length)) * Math.PI * 2 - Math.PI / 2;
      const radius = Math.min(W, H) * 0.3;
      return {
        ...p,
        x: W / 2 + Math.cos(angle) * radius + (Math.random() - 0.5) * 40,
        y: H / 2 + Math.sin(angle) * radius + (Math.random() - 0.5) * 40,
        pulsePhase: Math.random() * Math.PI * 2,
      };
    });

    const animate = (time) => {
      ctx.clearRect(0, 0, W, H);

      // Draw background stars
      bgStars.forEach(s => {
        const opacity = 0.2 + Math.sin(time * s.twinkle + s.phase) * 0.3;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${Math.max(0, opacity)})`;
        ctx.fill();
      });

      // Draw connection lines between players
      if (playerPositions.length > 1) {
        ctx.strokeStyle = 'rgba(255,255,255,0.03)';
        ctx.lineWidth = 0.5;
        for (let i = 0; i < playerPositions.length; i++) {
          for (let j = i + 1; j < playerPositions.length; j++) {
            const dist = Math.hypot(playerPositions[i].x - playerPositions[j].x, playerPositions[i].y - playerPositions[j].y);
            if (dist < 250) {
              ctx.beginPath();
              ctx.moveTo(playerPositions[i].x, playerPositions[i].y);
              ctx.lineTo(playerPositions[j].x, playerPositions[j].y);
              ctx.stroke();
            }
          }
        }
      }

      // Draw player nodes
      playerPositions.forEach((p, i) => {
        const color = p.color || '#818CF8';
        const pulse = 1 + Math.sin(time * 0.003 + p.pulsePhase) * 0.15;
        const baseR = p.is_self ? 12 : 8;
        const r = baseR * pulse;

        // Outer glow
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r * 3);
        grad.addColorStop(0, `${color}30`);
        grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad;
        ctx.fillRect(p.x - r * 3, p.y - r * 3, r * 6, r * 6);

        // Core
        ctx.beginPath();
        ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
        ctx.fillStyle = `${color}80`;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(p.x, p.y, r * 0.6, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();

        // Name label
        ctx.font = `${p.is_self ? 'bold' : ''} 10px system-ui`;
        ctx.fillStyle = `${color}CC`;
        ctx.textAlign = 'center';
        ctx.fillText(p.character_name || 'Traveler', p.x, p.y + r + 14);
        ctx.font = '8px system-ui';
        ctx.fillStyle = 'rgba(255,255,255,0.4)';
        ctx.fillText(`Lvl ${p.level} ${p.origin_name}`, p.x, p.y + r + 26);
      });

      animRef.current = requestAnimationFrame(animate);
    };
    animRef.current = requestAnimationFrame(animate);

    // Click handler
    const handleClick = (e) => {
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      for (const p of playerPositions) {
        if (Math.hypot(p.x - mx, p.y - my) < 20 && !p.is_self) {
          onPlayerClick?.(p);
          return;
        }
      }
    };
    canvas.addEventListener('click', handleClick);

    return () => {
      cancelAnimationFrame(animRef.current);
      canvas.removeEventListener('click', handleClick);
    };
  }, [players, onPlayerClick, reduceParticles]);

  return (
    <div className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden" data-testid="realm-star-map"
      style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.06)' }}>
      <canvas ref={canvasRef} className="w-full h-full" />
      {players.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>No other adventurers in the realm right now</p>
        </div>
      )}
    </div>
  );
}

/* ─── World Event Banner ─── */
function WorldEventBanner({ event }) {
  if (!event) return null;
  const atm = { mystical: '#818CF8', epic: '#F59E0B', dark: '#DC2626', peaceful: '#2DD4BF', ethereal: '#C084FC' };
  const color = atm[event.atmosphere] || '#818CF8';

  return (
    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-2xl p-5 mb-6 border"
      style={{ background: `linear-gradient(135deg, ${color}08, rgba(0,0,0,0.3))`, borderColor: `${color}20` }}
      data-testid="world-event-banner">
      <div className="absolute inset-0 opacity-[0.04]"
        style={{ background: `radial-gradient(ellipse at 20% 50%, ${color}, transparent 70%)` }} />
      <div className="relative flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: `${color}15`, border: `1px solid ${color}25` }}>
          <Globe size={22} style={{ color }} />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[8px] px-2 py-0.5 rounded-full font-bold uppercase"
              style={{ background: `${color}15`, color, border: `1px solid ${color}20` }}>
              World Event
            </span>
            <span className="text-[9px] flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
              <Clock size={9} /> {event.time_remaining} remaining
            </span>
          </div>
          <h3 className="text-lg font-light mb-1" style={{ fontFamily: 'Cormorant Garamond, serif', color }}>{event.title}</h3>
          <p className="text-xs leading-relaxed mb-1.5" style={{ color: 'var(--text-secondary)' }}>{event.description}</p>
          <span className="text-[9px] px-2 py-0.5 rounded-full" style={{ background: 'rgba(252,211,77,0.08)', color: '#FCD34D' }}>
            <Zap size={8} className="inline mr-1" />{event.bonus}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Encounter Scene ─── */
function EncounterScene({ encounter, onChoice, loading, onBack }) {
  const scene = encounter?.scene;
  const p1 = encounter?.player_1;
  const p2 = encounter?.player_2;
  const etIcon = ENCOUNTER_TYPE_ICONS[scene?.encounter_type] || Star;
  const EncTypeIcon = etIcon;

  if (!scene) return null;

  const atm = { mystical: '#818CF8', epic: '#F59E0B', dark: '#DC2626', peaceful: '#2DD4BF', ethereal: '#C084FC', tense: '#EF4444', triumphant: '#FCD34D' };
  const color = atm[scene.atmosphere] || '#818CF8';

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative z-10" data-testid="encounter-scene">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <button onClick={onBack} className="flex items-center gap-1.5 text-xs group" style={{ color: 'var(--text-muted)' }}
          data-testid="encounter-back-btn">
          <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" /> Back to Realm
        </button>
        <span className="text-[9px] px-3 py-1 rounded-full uppercase font-bold flex items-center gap-1.5"
          style={{ background: `${color}10`, color, border: `1px solid ${color}20` }}>
          <EncTypeIcon size={10} /> {scene.encounter_type}
        </span>
      </div>

      {/* Encounter Participants */}
      <div className="flex items-center justify-center gap-6 mb-6">
        <div className="text-center">
          <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-1"
            style={{ background: `${ORIGIN_COLORS[p1?.origin_id] || '#818CF8'}15`, border: `2px solid ${ORIGIN_COLORS[p1?.origin_id] || '#818CF8'}40` }}>
            <Star size={22} style={{ color: ORIGIN_COLORS[p1?.origin_id] || '#818CF8' }} />
          </div>
          <p className="text-xs font-medium" style={{ color: ORIGIN_COLORS[p1?.origin_id] || '#818CF8' }}>{p1?.character_name}</p>
          <p className="text-[9px]" style={{ color: 'var(--text-muted)' }}>Lvl {p1?.level}</p>
        </div>
        <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 2, repeat: Infinity }}>
          <Swords size={24} style={{ color }} />
        </motion.div>
        <div className="text-center">
          <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-1"
            style={{ background: `${ORIGIN_COLORS[p2?.origin_id] || '#DC2626'}15`, border: `2px solid ${ORIGIN_COLORS[p2?.origin_id] || '#DC2626'}40` }}>
            <Star size={22} style={{ color: ORIGIN_COLORS[p2?.origin_id] || '#DC2626' }} />
          </div>
          <p className="text-xs font-medium" style={{ color: ORIGIN_COLORS[p2?.origin_id] || '#DC2626' }}>
            {p2?.character_name} {p2?.is_npc && <span className="text-[8px] opacity-60">(NPC)</span>}
          </p>
          <p className="text-[9px]" style={{ color: 'var(--text-muted)' }}>Lvl {p2?.level}</p>
        </div>
      </div>

      {/* Scene Title */}
      <p className="text-xs font-bold uppercase tracking-[0.3em] text-center mb-3" style={{ color }}>{scene.scene_title}</p>

      {/* Narrative */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.8 }}
        className="rounded-2xl p-6 md:p-8 mb-8 relative overflow-hidden"
        style={{ background: 'rgba(0,0,0,0.25)', border: `1px solid ${color}12`, backdropFilter: 'blur(12px)' }}
        data-testid="encounter-narrative">
        <div className="absolute top-0 left-0 w-24 h-24 pointer-events-none"
          style={{ background: `radial-gradient(circle, ${color}10, transparent)` }} />
        <p className="text-base md:text-lg leading-loose relative" style={{
          fontFamily: 'Cormorant Garamond, serif', color: 'var(--text-primary)', fontSize: '18px', lineHeight: '2',
        }}>{scene.narrative}</p>
      </motion.div>

      {/* Choices */}
      <div className="space-y-3" data-testid="encounter-choices">
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="h-px flex-1" style={{ background: `linear-gradient(90deg, transparent, ${color}30, transparent)` }} />
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] px-3" style={{ color }}>Choose Your Path</p>
          <div className="h-px flex-1" style={{ background: `linear-gradient(90deg, transparent, ${color}30, transparent)` }} />
        </div>
        {scene.choices?.map((choice, i) => {
          const statKey = Object.keys(choice.stat_effect || {})[0];
          const StatIcon = STAT_ICONS[statKey] || Star;
          const statDelta = choice.stat_effect?.[statKey] || 0;

          return (
            <motion.button key={i}
              initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 + i * 0.12 }}
              onClick={() => !loading && onChoice(i)}
              disabled={loading}
              className="w-full relative overflow-hidden rounded-xl p-4 md:p-5 text-left transition-all hover:scale-[1.01] group border"
              style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.05)', opacity: loading ? 0.5 : 1 }}
              data-testid={`encounter-choice-${i}`}>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(255,255,255,0.04)' }}>
                  <span className="text-sm font-bold" style={{ color }}>{String.fromCharCode(65 + i)}</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>{choice.text}</p>
                  <div className="flex items-center gap-2.5">
                    <span className="text-[9px] px-2 py-0.5 rounded-full flex items-center gap-1 font-bold"
                      style={{ background: `${color}12`, color }}>
                      <StatIcon size={9} /> +{statDelta} {statKey?.toUpperCase()?.slice(0, 3)}
                    </span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(252,211,77,0.08)', color: '#FCD34D' }}>
                      +{choice.xp || 20} XP
                    </span>
                    <span className="text-[9px] italic" style={{ color: 'var(--text-muted)' }}>{choice.outcome_hint}</span>
                  </div>
                </div>
                <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" style={{ color }} />
              </div>
            </motion.button>
          );
        })}
      </div>

      {loading && (
        <div className="flex items-center justify-center py-8 gap-3">
          <Loader2 className="animate-spin" size={16} style={{ color }} />
          <span className="text-xs" style={{ color }}>Resolving encounter...</span>
        </div>
      )}
    </motion.div>
  );
}

/* ─── Encounter Result ─── */
function EncounterResult({ result, onContinue }) {
  if (!result) return null;
  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
      className="rounded-2xl p-8 text-center" style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(252,211,77,0.15)' }}
      data-testid="encounter-result">
      <motion.div animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 0.5 }}>
        <Trophy size={32} className="mx-auto mb-3" style={{ color: '#FCD34D' }} />
      </motion.div>
      <h3 className="text-xl font-light mb-2" style={{ fontFamily: 'Cormorant Garamond, serif', color: '#FCD34D' }}>Encounter Resolved</h3>
      <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>{result.result}</p>
      <div className="flex items-center justify-center gap-4 mb-4">
        {Object.entries(result.stat_changes || {}).map(([stat, delta]) => {
          const Icon = STAT_ICONS[stat] || Star;
          return (
            <span key={stat} className="text-xs px-2 py-1 rounded-lg flex items-center gap-1"
              style={{ background: 'rgba(74,222,128,0.08)', color: '#4ADE80' }}>
              <Icon size={11} /> +{delta} {stat}
            </span>
          );
        })}
        <span className="text-xs px-2 py-1 rounded-lg" style={{ background: 'rgba(252,211,77,0.08)', color: '#FCD34D' }}>
          +{result.xp_earned} XP
        </span>
      </div>
      {result.leveled_up && (
        <p className="text-sm font-bold mb-3" style={{ color: '#FCD34D' }}>Level Up! Now Level {result.new_level}</p>
      )}
      {result.new_achievements?.map(a => (
        <div key={a.id} className="flex items-center justify-center gap-2 mb-2">
          <Trophy size={12} style={{ color: '#C084FC' }} />
          <span className="text-xs" style={{ color: '#C084FC' }}>{a.title} — {a.desc}</span>
        </div>
      ))}
      <button onClick={onContinue} className="mt-4 px-6 py-2.5 rounded-xl text-sm font-medium transition-all hover:scale-105"
        style={{ background: 'rgba(252,211,77,0.1)', border: '1px solid rgba(252,211,77,0.2)', color: '#FCD34D' }}
        data-testid="encounter-continue-btn">
        Return to Realm
      </button>
    </motion.div>
  );
}

/* ─── Main Realm Page ─── */
/* ─── Alliance Chat ─── */
function AllianceChat({ allianceId, authHeaders, userId }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const chatEndRef = useRef(null);
  const pollRef = useRef(null);

  const loadMessages = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/starseed/realm/chat/${allianceId}`, { headers: authHeaders });
      setMessages(res.data.messages || []);
    } catch {}
  }, [allianceId, authHeaders]);

  useEffect(() => {
    loadMessages();
    pollRef.current = setInterval(loadMessages, 8000);
    return () => clearInterval(pollRef.current);
  }, [loadMessages]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!text.trim() || sending) return;
    setSending(true);
    try {
      await axios.post(`${API}/starseed/realm/chat/send`, {
        text: text.trim(), type: 'message',
      }, { headers: authHeaders });
      setText('');
      loadMessages();
    } catch (err) {
      toast.error('Could not send message');
    } finally {
      setSending(false);
    }
  };

  return (
    <div data-testid="alliance-chat">
      <div className="flex items-center gap-2 mb-2">
        <MessageCircle size={11} style={{ color: '#C084FC' }} />
        <span className="text-[9px] font-bold uppercase tracking-widest" style={{ color: 'rgba(192,132,252,0.6)' }}>Alliance Chat</span>
      </div>
      <div className="rounded-xl p-3 mb-2 overflow-y-auto" style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.04)', maxHeight: 240, minHeight: 120 }}>
        {messages.length === 0 && (
          <p className="text-[10px] text-center py-4" style={{ color: 'var(--text-muted)' }}>No messages yet. Start the conversation!</p>
        )}
        {messages.map((msg, i) => {
          const isSelf = msg.user_id === userId;
          const color = ORIGIN_COLORS[msg.origin_id] || '#818CF8';
          return (
            <div key={msg.id || i} className={`mb-2 ${isSelf ? 'text-right' : ''}`}>
              <div className={`inline-block max-w-[85%] rounded-xl px-3 py-2 text-left ${isSelf ? 'ml-auto' : ''}`}
                style={{ background: isSelf ? `${color}12` : 'rgba(255,255,255,0.03)', border: `1px solid ${isSelf ? color + '20' : 'rgba(255,255,255,0.04)'}` }}>
                {!isSelf && (
                  <p className="text-[8px] font-bold mb-0.5" style={{ color }}>{msg.character_name}</p>
                )}
                <p className="text-xs leading-relaxed" style={{ color: 'var(--text-primary)' }}>{msg.text}</p>
                <p className="text-[7px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
                  {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={chatEndRef} />
      </div>
      <div className="flex gap-2">
        <input type="text" placeholder="Message your alliance..." maxLength={500}
          value={text} onChange={e => setText(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && sendMessage()}
          className="flex-1 px-3 py-2 rounded-lg text-xs"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-primary)', outline: 'none' }}
          data-testid="chat-input" />
        <button onClick={sendMessage} disabled={sending || !text.trim()}
          className="px-3 py-2 rounded-lg transition-all hover:scale-105"
          style={{ background: 'rgba(192,132,252,0.1)', border: '1px solid rgba(192,132,252,0.2)', color: '#C084FC', opacity: (!text.trim() || sending) ? 0.4 : 1 }}
          data-testid="chat-send-btn">
          <Send size={12} />
        </button>
      </div>
    </div>
  );
}

/* ─── Boss Encounter Panel ─── */
function BossEncounterPanel({ activeOrigin, authHeaders, userId }) {
  const [bosses, setBosses] = useState([]);
  const [activeBattle, setActiveBattle] = useState(null);
  const [battleResult, setBattleResult] = useState(null);
  const [lootDrop, setLootDrop] = useState(null);
  const [loading, setLoading] = useState(false);
  const [initLoading, setInitLoading] = useState(true);

  useEffect(() => {
    axios.get(`${API}/starseed/realm/bosses`, { headers: authHeaders })
      .then(r => setBosses(r.data.bosses))
      .catch(() => {})
      .finally(() => setInitLoading(false));
  }, [authHeaders]);

  const initiateBoss = useCallback(async (bossId) => {
    if (!activeOrigin || loading) return;
    setLoading(true);
    setBattleResult(null);
    try {
      const res = await axios.post(`${API}/starseed/realm/boss/initiate`, {
        boss_id: bossId, origin_id: activeOrigin,
      }, { headers: authHeaders });
      setActiveBattle(res.data);
      toast.success('Boss encounter initiated!');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Could not start boss fight');
    } finally {
      setLoading(false);
    }
  }, [activeOrigin, authHeaders, loading]);

  const bossAction = useCallback(async (choiceIndex) => {
    if (!activeBattle || loading) return;
    setLoading(true);
    try {
      const res = await axios.post(`${API}/starseed/realm/boss/action`, {
        battle_id: activeBattle.id, choice_index: choiceIndex,
      }, { headers: authHeaders });

      if (res.data.battle_over) {
        setBattleResult(res.data);
        setActiveBattle(null);
        if (res.data.boss_defeated && res.data.reward?.loot_drop) {
          setLootDrop(res.data.reward.loot_drop);
        }
      } else {
        // Show color-coded combat feedback
        const equipBonus = res.data.equipment_bonus || 0;
        const resMult = res.data.resonance_multiplier || 1.0;
        const gemFx = res.data.active_gem_effects || [];
        const dmg = res.data.damage_dealt || 0;

        // Resonance hit — gold/purple shimmer
        if (resMult > 1.0) {
          toast(`RESONANCE x${resMult}`, {
            description: `${dmg} damage dealt${equipBonus > 0 ? ` (+${equipBonus} gear)` : ''}${gemFx.length > 0 ? ` — ${gemFx.join(', ')} glowing` : ''}`,
            style: {
              background: 'linear-gradient(135deg, rgba(168,85,247,0.92), rgba(252,211,77,0.88))',
              border: '1px solid rgba(252,211,77,0.5)',
              color: '#FFF',
              boxShadow: '0 0 24px rgba(168,85,247,0.4), 0 0 60px rgba(252,211,77,0.15)',
              animation: 'pulse 1.5s ease-in-out',
            },
          });
        }
        // Weakness hit — red glow
        else if (res.data.was_weakness) {
          toast(`WEAKNESS HIT!`, {
            description: `${dmg} damage dealt${equipBonus > 0 ? ` (+${equipBonus} gear)` : ''}`,
            style: {
              background: 'rgba(220,38,38,0.92)',
              border: '1px solid rgba(239,68,68,0.5)',
              color: '#FFF',
              boxShadow: '0 0 24px rgba(220,38,38,0.4)',
            },
          });
        }
        // Equipment-boosted hit — cyan
        else if (equipBonus > 0) {
          toast(`${dmg} damage dealt`, {
            description: `+${equipBonus} from gear${gemFx.length > 0 ? ` — ${gemFx.join(', ')} active` : ''}`,
            style: {
              background: 'rgba(56,189,248,0.15)',
              border: '1px solid rgba(56,189,248,0.3)',
              color: '#E0F2FE',
              boxShadow: '0 0 16px rgba(56,189,248,0.2)',
            },
          });
        }
        // Standard hit
        else {
          toast.success(`${dmg} damage dealt${gemFx.length > 0 ? ` — ${gemFx.join(', ')} active` : ''}`);
        }

        setActiveBattle(prev => ({
          ...prev,
          boss_current_hp: res.data.boss_hp,
          phase: res.data.phase,
          current_scene: res.data.next_scene,
        }));
      }
    } catch (err) {
      toast.error('Action failed');
    } finally {
      setLoading(false);
    }
  }, [activeBattle, authHeaders, loading]);

  if (initLoading) return <div className="flex justify-center py-8"><Loader2 className="animate-spin" size={20} style={{ color: '#DC2626' }} /></div>;

  // Loot Drop Overlay (renders on top of any state)
  const lootOverlay = (
    <AnimatePresence>
      {lootDrop && <LootDropReveal loot={lootDrop} onClose={() => setLootDrop(null)} />}
    </AnimatePresence>
  );

  // Battle Result Screen
  if (battleResult) {
    const won = battleResult.boss_defeated;
    return (
      <>
        {lootOverlay}
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="rounded-2xl p-8 text-center" style={{ background: won ? 'rgba(252,211,77,0.05)' : 'rgba(220,38,38,0.05)', border: `1px solid ${won ? 'rgba(252,211,77,0.2)' : 'rgba(220,38,38,0.2)'}` }}
        data-testid="boss-result">
        <motion.div animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 0.5 }}>
          {won ? <Trophy size={36} className="mx-auto mb-3" style={{ color: '#FCD34D' }} /> : <Skull size={36} className="mx-auto mb-3" style={{ color: '#DC2626' }} />}
        </motion.div>
        <h3 className="text-2xl font-light mb-2" style={{ fontFamily: 'Cormorant Garamond, serif', color: won ? '#FCD34D' : '#DC2626' }}>
          {won ? 'Victory!' : 'Defeat'}
        </h3>
        <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
          {won ? 'The cosmic threat has been vanquished! Your power echoes across the realm.' : 'The enemy proved too powerful this time. Regroup and try again.'}
        </p>
        {battleResult.reward && (
          <div className="flex items-center justify-center gap-3 mb-4 flex-wrap">
            <span className="text-xs px-2 py-1 rounded-lg" style={{ background: 'rgba(252,211,77,0.08)', color: '#FCD34D' }}>
              +{battleResult.reward.xp_earned} XP
            </span>
            {battleResult.reward.stat_bonus && (
              <span className="text-xs px-2 py-1 rounded-lg" style={{ background: 'rgba(74,222,128,0.08)', color: '#4ADE80' }}>
                {battleResult.reward.stat_bonus}
              </span>
            )}
            {battleResult.reward.leveled_up && (
              <span className="text-xs px-2 py-1 rounded-lg font-bold" style={{ background: 'rgba(252,211,77,0.12)', color: '#FCD34D' }}>
                Level Up! Lvl {battleResult.reward.new_level}
              </span>
            )}
          </div>
        )}
        {/* Equipment & Resonance Combat Summary */}
        {(battleResult.equipment_bonus > 0 || battleResult.resonance_multiplier > 1.0 || (battleResult.active_gem_effects?.length > 0)) && (
          <div className="rounded-xl p-3 mb-4 text-center"
            style={{ background: 'rgba(192,132,252,0.04)', border: '1px solid rgba(192,132,252,0.1)' }}>
            <p className="text-[8px] font-bold uppercase tracking-widest mb-2" style={{ color: '#C084FC' }}>Combat Resonance</p>
            <div className="flex items-center justify-center gap-2 flex-wrap">
              {battleResult.equipment_bonus > 0 && (
                <span className="text-[9px] px-2 py-0.5 rounded-full" style={{ background: 'rgba(56,189,248,0.08)', color: '#38BDF8' }}>
                  +{battleResult.equipment_bonus} Gear Bonus
                </span>
              )}
              {battleResult.resonance_multiplier > 1.0 && (
                <span className="text-[9px] px-2 py-0.5 rounded-full" style={{ background: 'rgba(168,85,247,0.08)', color: '#A855F7' }}>
                  x{battleResult.resonance_multiplier} Resonance
                </span>
              )}
              {battleResult.active_gem_effects?.map((gem, i) => (
                <motion.span key={i}
                  animate={{ boxShadow: ['0 0 4px rgba(192,132,252,0.2)', '0 0 12px rgba(192,132,252,0.4)', '0 0 4px rgba(192,132,252,0.2)'] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-[9px] px-2 py-0.5 rounded-full"
                  style={{ background: 'rgba(240,171,252,0.08)', color: '#F0ABFC' }}>
                  {gem}
                </motion.span>
              ))}
            </div>
          </div>
        )}
        {battleResult.reward?.new_achievements?.map(a => (
          <div key={a.id} className="flex items-center justify-center gap-2 mb-2">
            <Trophy size={12} style={{ color: '#C084FC' }} />
            <span className="text-xs" style={{ color: '#C084FC' }}>{a.title} — {a.desc}</span>
          </div>
        ))}
        <button onClick={() => setBattleResult(null)}
          className="mt-4 px-6 py-2.5 rounded-xl text-sm font-medium transition-all hover:scale-105"
          style={{ background: 'rgba(192,132,252,0.1)', border: '1px solid rgba(192,132,252,0.2)', color: '#C084FC' }}
          data-testid="boss-return-btn">
          Return to Bosses
        </button>
      </motion.div>
      </>
    );
  }

  // Active Battle
  if (activeBattle) {
    const scene = activeBattle.current_scene || {};
    const hpPct = (activeBattle.boss_current_hp / activeBattle.boss_hp) * 100;
    const bossColor = activeBattle.boss_color || '#DC2626';
    const atm = { epic: '#F59E0B', dark: '#DC2626', tense: '#EF4444', triumphant: '#FCD34D', mystical: '#818CF8' };
    const sceneColor = atm[scene.atmosphere] || '#DC2626';

    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} data-testid="boss-battle">
        {/* Boss Header */}
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => setActiveBattle(null)} className="text-xs flex items-center gap-1 group" style={{ color: 'var(--text-muted)' }}
            data-testid="boss-exit-btn">
            <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" /> Exit
          </button>
          <span className="text-[9px] px-3 py-1 rounded-full uppercase font-bold"
            style={{ background: `${bossColor}10`, color: bossColor, border: `1px solid ${bossColor}20` }}>
            Phase {activeBattle.phase}/{activeBattle.max_phases}
          </span>
        </div>

        {/* Boss HP Bar */}
        <div className="mb-6 p-4 rounded-2xl" style={{ background: 'rgba(0,0,0,0.3)', border: `1px solid ${bossColor}15` }}
          data-testid="boss-hp-bar">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Skull size={16} style={{ color: bossColor }} />
              <span className="text-sm font-bold" style={{ color: bossColor }}>{activeBattle.boss_name}</span>
            </div>
            <span className="text-xs tabular-nums" style={{ color: bossColor }}>
              {activeBattle.boss_current_hp}/{activeBattle.boss_hp} HP
            </span>
          </div>
          <div className="h-3 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
            <motion.div className="h-full rounded-full" animate={{ width: `${hpPct}%` }} transition={{ duration: 0.8 }}
              style={{
                background: hpPct > 50 ? `linear-gradient(90deg, ${bossColor}80, ${bossColor})` : hpPct > 25 ? 'linear-gradient(90deg, #F59E0B80, #F59E0B)' : 'linear-gradient(90deg, #EF444480, #EF4444)',
                boxShadow: `0 0 12px ${bossColor}30`,
              }} />
          </div>
        </div>

        {/* Party */}
        <div className="flex items-center justify-center gap-3 mb-5 flex-wrap">
          {activeBattle.participants?.map((p, i) => (
            <div key={i} className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-[9px]"
              style={{ background: `${ORIGIN_COLORS[p.origin_id] || '#818CF8'}08`, border: `1px solid ${ORIGIN_COLORS[p.origin_id] || '#818CF8'}15` }}>
              <Star size={8} style={{ color: ORIGIN_COLORS[p.origin_id] || '#818CF8' }} />
              <span style={{ color: ORIGIN_COLORS[p.origin_id] || '#818CF8' }}>{p.character_name}</span>
              {p.is_npc && <span className="opacity-40">(NPC)</span>}
            </div>
          ))}
        </div>

        {/* Phase Title */}
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-center mb-3" style={{ color: sceneColor }}>
          {scene.phase_title}
        </p>

        {/* Boss Action */}
        {scene.boss_action && (
          <div className="rounded-xl p-3 mb-4 flex items-center gap-3"
            style={{ background: `${bossColor}08`, border: `1px solid ${bossColor}12` }}>
            <AlertTriangle size={14} style={{ color: bossColor }} />
            <p className="text-xs" style={{ color: bossColor }}>{scene.boss_action}</p>
            <span className="text-[9px] ml-auto px-1.5 py-0.5 rounded" style={{ background: `${bossColor}15`, color: bossColor }}>
              -{scene.boss_damage_to_party} DMG
            </span>
          </div>
        )}

        {/* Narrative */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.8 }}
          className="rounded-2xl p-6 md:p-8 mb-6 relative overflow-hidden"
          style={{ background: 'rgba(0,0,0,0.25)', border: `1px solid ${sceneColor}12`, backdropFilter: 'blur(12px)' }}
          data-testid="boss-narrative">
          <p className="text-base md:text-lg leading-loose" style={{
            fontFamily: 'Cormorant Garamond, serif', color: 'var(--text-primary)', fontSize: '18px', lineHeight: '2',
          }}>{scene.narrative}</p>
        </motion.div>

        {/* Choices */}
        <div className="space-y-3" data-testid="boss-choices">
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="h-px flex-1" style={{ background: `linear-gradient(90deg, transparent, ${sceneColor}30, transparent)` }} />
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] px-3" style={{ color: sceneColor }}>Rally Your Forces</p>
            <div className="h-px flex-1" style={{ background: `linear-gradient(90deg, transparent, ${sceneColor}30, transparent)` }} />
          </div>
          {scene.choices?.map((choice, i) => {
            const StatIcon = STAT_ICONS[choice.stat_used] || Star;
            return (
              <motion.button key={i}
                initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 + i * 0.1 }}
                onClick={() => !loading && bossAction(i)}
                disabled={loading}
                className="w-full rounded-xl p-4 text-left transition-all hover:scale-[1.01] group border"
                style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.05)', opacity: loading ? 0.5 : 1 }}
                data-testid={`boss-choice-${i}`}>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(255,255,255,0.04)' }}>
                    <span className="text-sm font-bold" style={{ color: sceneColor }}>{String.fromCharCode(65 + i)}</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>{choice.text}</p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[9px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1"
                        style={{ background: 'rgba(239,68,68,0.08)', color: '#EF4444' }}>
                        <Target size={8} /> {choice.damage} DMG
                      </span>
                      {choice.team_heal > 0 && (
                        <span className="text-[9px] px-2 py-0.5 rounded-full flex items-center gap-1"
                          style={{ background: 'rgba(74,222,128,0.08)', color: '#4ADE80' }}>
                          <Heart size={8} /> +{choice.team_heal} HEAL
                        </span>
                      )}
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full flex items-center gap-1"
                        style={{ background: `rgba(255,255,255,0.04)` }}>
                        <StatIcon size={8} /> {choice.stat_used}
                      </span>
                      <span className="text-[9px] italic" style={{ color: 'var(--text-muted)' }}>{choice.outcome_hint}</span>
                    </div>
                  </div>
                  <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: sceneColor }} />
                </div>
              </motion.button>
            );
          })}
        </div>

        {loading && (
          <div className="flex items-center justify-center py-6 gap-3">
            <Loader2 className="animate-spin" size={16} style={{ color: bossColor }} />
            <span className="text-xs" style={{ color: bossColor }}>Resolving battle phase...</span>
          </div>
        )}
      </motion.div>
    );
  }

  // Boss Selection Grid
  return (
    <div data-testid="boss-select">
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-4 flex items-center gap-2" style={{ color: '#DC2626' }}>
        <Skull size={11} /> Cosmic Threats
      </p>
      <div className="space-y-3">
        {bosses.map((boss, i) => (
          <motion.div key={boss.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
            className="rounded-2xl p-5 border relative overflow-hidden group"
            style={{ background: `linear-gradient(135deg, ${boss.color}06, rgba(0,0,0,0.3))`, borderColor: `${boss.color}15` }}
            data-testid={`boss-card-${boss.id}`}>
            <div className="absolute inset-0 opacity-[0.03]"
              style={{ background: `radial-gradient(ellipse at 20% 50%, ${boss.color}, transparent 60%)` }} />
            <div className="relative flex items-start gap-4">
              <div className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: `${boss.color}12`, border: `1px solid ${boss.color}20` }}>
                <Skull size={24} style={{ color: boss.color }} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-sm font-semibold" style={{ color: boss.color }}>{boss.name}</h3>
                  <span className="text-[8px] px-1.5 py-0.5 rounded-full uppercase font-bold"
                    style={{ background: `${boss.color}10`, color: boss.color, border: `1px solid ${boss.color}15` }}>
                    {boss.difficulty}
                  </span>
                </div>
                <p className="text-xs leading-relaxed mb-2" style={{ color: 'var(--text-secondary)' }}>{boss.description}</p>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-[9px] flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
                    <Heart size={8} /> HP: {boss.hp}
                  </span>
                  <span className="text-[9px] flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
                    <Flame size={8} /> {boss.element}
                  </span>
                  <span className="text-[9px] flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
                    <Target size={8} /> {boss.phases} phases
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[8px] px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(74,222,128,0.08)', color: '#4ADE80' }}>
                    Weak: {boss.weakness}
                  </span>
                  <span className="text-[8px] px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(239,68,68,0.08)', color: '#EF4444' }}>
                    Resists: {boss.resistance}
                  </span>
                </div>
              </div>
              <motion.button whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.95 }}
                onClick={() => initiateBoss(boss.id)}
                disabled={loading || !activeOrigin}
                className="px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all flex-shrink-0 mt-1"
                style={{
                  background: `linear-gradient(135deg, ${boss.color}20, ${boss.color}10)`,
                  border: `1px solid ${boss.color}30`,
                  color: boss.color,
                  opacity: (loading || !activeOrigin) ? 0.4 : 1,
                }}
                data-testid={`boss-fight-${boss.id}`}>
                <Swords size={12} /> Fight
              </motion.button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export default function StarseedRealm() {
  const { user, authHeaders, loading: authLoading } = useAuth();
  const { reduceParticles } = useSensory();
  const navigate = useNavigate();

  const [players, setPlayers] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [worldEvent, setWorldEvent] = useState(null);
  const [myAlliance, setMyAlliance] = useState(null);
  const [alliances, setAlliances] = useState([]);
  const [encounter, setEncounter] = useState(null);
  const [encounterResult, setEncounterResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [initLoading, setInitLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('realm'); // realm | leaderboard | alliances
  const [myCharacters, setMyCharacters] = useState([]);
  const [activeOrigin, setActiveOrigin] = useState(null);
  const [allianceName, setAllianceName] = useState('');

  // Load data
  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate('/auth'); return; }

    Promise.all([
      axios.get(`${API}/starseed/realm/world-event`).then(r => setWorldEvent(r.data)).catch(() => {}),
      axios.get(`${API}/starseed/realm/active-players`, { headers: authHeaders }).then(r => setPlayers(r.data.players)).catch(() => {}),
      axios.get(`${API}/starseed/realm/leaderboard`, { headers: authHeaders }).then(r => setLeaderboard(r.data.leaderboard)).catch(() => {}),
      axios.get(`${API}/starseed/realm/my-alliance`, { headers: authHeaders }).then(r => setMyAlliance(r.data.alliance)).catch(() => {}),
      axios.get(`${API}/starseed/realm/alliances`, { headers: authHeaders }).then(r => setAlliances(r.data.alliances)).catch(() => {}),
      axios.get(`${API}/starseed/my-characters`, { headers: authHeaders }).then(r => {
        setMyCharacters(r.data.characters);
        if (r.data.characters.length > 0) setActiveOrigin(r.data.characters[0].origin_id);
      }).catch(() => {}),
    ]).finally(() => setInitLoading(false));
  }, [user, authLoading, authHeaders, navigate]);

  // Send heartbeat
  useEffect(() => {
    if (!user || !activeOrigin) return;
    const sendHeartbeat = () => {
      const ch = myCharacters.find(c => c.origin_id === activeOrigin);
      axios.post(`${API}/starseed/realm/heartbeat`, {
        origin_id: activeOrigin,
        chapter: ch?.chapter || 1,
        scene: ch?.scene || 0,
      }, { headers: authHeaders }).catch(() => {});
    };
    sendHeartbeat();
    const interval = setInterval(sendHeartbeat, 60000);
    return () => clearInterval(interval);
  }, [user, activeOrigin, myCharacters, authHeaders]);

  const requestEncounter = useCallback(async (targetUserId) => {
    if (!activeOrigin || loading) return;
    setLoading(true);
    try {
      const res = await axios.post(`${API}/starseed/realm/encounter/request`, {
        origin_id: activeOrigin,
        target_user_id: targetUserId || null,
      }, { headers: authHeaders });
      setEncounter(res.data);
      toast.success('Encounter initiated!');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Could not start encounter');
    } finally {
      setLoading(false);
    }
  }, [activeOrigin, authHeaders, loading]);

  const resolveEncounter = useCallback(async (choiceIndex) => {
    if (!encounter || loading) return;
    setLoading(true);
    try {
      const res = await axios.post(`${API}/starseed/realm/encounter/resolve`, {
        encounter_id: encounter.id,
        choice_index: choiceIndex,
      }, { headers: authHeaders });
      setEncounterResult(res.data);
      setEncounter(null);
    } catch (err) {
      toast.error('Failed to resolve encounter');
    } finally {
      setLoading(false);
    }
  }, [encounter, authHeaders, loading]);

  const createAlliance = useCallback(async () => {
    if (!allianceName.trim()) return;
    try {
      const res = await axios.post(`${API}/starseed/realm/alliance/create`, {
        name: allianceName.trim(),
      }, { headers: authHeaders });
      setMyAlliance(res.data);
      setAllianceName('');
      toast.success('Alliance created!');
      // Refresh alliances
      axios.get(`${API}/starseed/realm/alliances`, { headers: authHeaders }).then(r => setAlliances(r.data.alliances)).catch(() => {});
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Could not create alliance');
    }
  }, [allianceName, authHeaders]);

  const joinAlliance = useCallback(async (allianceId) => {
    try {
      const res = await axios.post(`${API}/starseed/realm/alliance/join`, {
        alliance_id: allianceId,
      }, { headers: authHeaders });
      setMyAlliance(res.data);
      toast.success('Joined alliance!');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Could not join alliance');
    }
  }, [authHeaders]);

  if (authLoading || initLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin" size={24} style={{ color: '#C084FC' }} />
      </div>
    );
  }

  if (myCharacters.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <Star size={32} className="mx-auto mb-3" style={{ color: '#C084FC' }} />
          <h2 className="text-2xl font-light mb-2" style={{ fontFamily: 'Cormorant Garamond, serif' }}>Enter the Realm</h2>
          <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>Create a starseed character first to join the Cosmic Realm.</p>
          <button onClick={() => navigate('/starseed-adventure')} className="px-6 py-2.5 rounded-xl text-sm"
            style={{ background: 'rgba(192,132,252,0.1)', border: '1px solid rgba(192,132,252,0.2)', color: '#C084FC' }}
            data-testid="realm-create-character-btn">
            Create Character
          </button>
        </div>
      </div>
    );
  }

  const TABS = [
    { id: 'realm', label: 'Realm', icon: Globe },
    { id: 'bosses', label: 'Bosses', icon: Skull },
    { id: 'leaderboard', label: 'Ranks', icon: Trophy },
    { id: 'alliances', label: 'Alliances', icon: Users },
  ];

  return (
    <div className="min-h-screen px-4 md:px-12 lg:px-24 py-10" data-testid="starseed-realm-page">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <button onClick={() => navigate('/starseed-adventure')} className="text-xs flex items-center gap-1"
              style={{ color: 'var(--text-muted)' }}>
              <ArrowLeft size={12} /> Adventure
            </button>
          </div>
          <p className="text-xs font-bold uppercase tracking-[0.3em] mb-1" style={{ color: '#C084FC' }}>The Cosmic Realm</p>
          <h1 className="text-3xl sm:text-4xl font-light" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
            Multiplayer Starfield
          </h1>
        </motion.div>

        {/* Active Character Selector */}
        {myCharacters.length > 1 && (
          <div className="flex items-center justify-center gap-2 mb-6 flex-wrap">
            {myCharacters.map(ch => (
              <button key={ch.origin_id} onClick={() => setActiveOrigin(ch.origin_id)}
                className="text-[10px] px-3 py-1.5 rounded-full font-medium transition-all"
                style={{
                  background: activeOrigin === ch.origin_id ? `${ORIGIN_COLORS[ch.origin_id]}20` : 'rgba(255,255,255,0.03)',
                  color: ORIGIN_COLORS[ch.origin_id],
                  border: `1px solid ${activeOrigin === ch.origin_id ? ORIGIN_COLORS[ch.origin_id] + '40' : 'rgba(255,255,255,0.06)'}`,
                }}
                data-testid={`realm-char-${ch.origin_id}`}>
                {ch.character_name} (Lvl {ch.level})
              </button>
            ))}
          </div>
        )}

        {/* World Event */}
        <WorldEventBanner event={worldEvent} />

        {/* Encounter View */}
        <AnimatePresence mode="wait">
          {encounter && (
            <motion.div key="encounter" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <EncounterScene encounter={encounter} onChoice={resolveEncounter} loading={loading}
                onBack={() => setEncounter(null)} />
            </motion.div>
          )}
          {encounterResult && !encounter && (
            <motion.div key="result" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <EncounterResult result={encounterResult} onContinue={() => setEncounterResult(null)} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tabs (only when not in encounter) */}
        {!encounter && !encounterResult && (
          <>
            <div className="flex items-center gap-1 mb-6 p-1 rounded-xl mx-auto w-fit"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
              {TABS.map(tab => {
                const Icon = tab.icon;
                return (
                  <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium transition-all"
                    style={{
                      background: activeTab === tab.id ? 'rgba(192,132,252,0.1)' : 'transparent',
                      color: activeTab === tab.id ? '#C084FC' : 'var(--text-muted)',
                    }}
                    data-testid={`realm-tab-${tab.id}`}>
                    <Icon size={12} /> {tab.label}
                  </button>
                );
              })}
            </div>

            <AnimatePresence mode="wait">
              {activeTab === 'realm' && (
                <motion.div key="realm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  {/* Star Map */}
                  <RealmStarMap players={players} reduceParticles={reduceParticles}
                    onPlayerClick={p => requestEncounter(p.user_id)} />

                  {/* Encounter Button */}
                  <div className="flex justify-center mt-6 mb-6">
                    <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                      onClick={() => requestEncounter(null)}
                      disabled={loading}
                      className="px-8 py-3 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all"
                      style={{
                        background: 'linear-gradient(135deg, rgba(192,132,252,0.15), rgba(129,140,248,0.15))',
                        border: '1px solid rgba(192,132,252,0.25)',
                        color: '#C084FC',
                        boxShadow: '0 4px 20px rgba(192,132,252,0.1)',
                        opacity: loading ? 0.6 : 1,
                      }}
                      data-testid="find-encounter-btn">
                      {loading ? <Loader2 size={14} className="animate-spin" /> : <Swords size={14} />}
                      {loading ? 'Searching...' : 'Find Cross-Path Encounter'}
                    </motion.button>
                  </div>

                  {/* Active Players List */}
                  <div className="mb-8">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-3" style={{ color: 'var(--text-muted)' }}>
                      Adventurers in the Realm ({players.length})
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {players.map((p, i) => (
                        <motion.div key={p.user_id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                          className="rounded-xl p-3 flex items-center gap-3 border transition-all"
                          style={{ background: p.is_self ? `${p.color}08` : 'rgba(255,255,255,0.02)', borderColor: p.is_self ? `${p.color}20` : 'rgba(255,255,255,0.04)' }}
                          data-testid={`realm-player-${i}`}>
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                            style={{ background: `${p.color}12` }}>
                            <Star size={14} style={{ color: p.color }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium truncate" style={{ color: p.color }}>
                              {p.character_name} {p.is_self && <span className="text-[8px] opacity-50">(You)</span>}
                            </p>
                            <p className="text-[9px]" style={{ color: 'var(--text-muted)' }}>
                              {p.origin_name} &middot; Lvl {p.level} &middot; Ch.{p.chapter}
                            </p>
                          </div>
                          {!p.is_self && (
                            <button onClick={() => requestEncounter(p.user_id)}
                              className="text-[9px] px-2 py-1 rounded-lg transition-all hover:scale-105"
                              style={{ background: `${p.color}10`, color: p.color, border: `1px solid ${p.color}15` }}>
                              <Swords size={10} />
                            </button>
                          )}
                        </motion.div>
                      ))}
                      {players.length === 0 && (
                        <p className="text-xs col-span-2 text-center py-6" style={{ color: 'var(--text-muted)' }}>
                          The realm is quiet. Click "Find Cross-Path Encounter" to meet an NPC starseed!
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'leaderboard' && (
                <motion.div key="leaderboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  data-testid="realm-leaderboard">
                  <div className="space-y-2">
                    {leaderboard.map((entry, i) => (
                      <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
                        className="rounded-xl p-3 flex items-center gap-3 border"
                        style={{
                          background: entry.is_self ? `${entry.color}08` : 'rgba(255,255,255,0.02)',
                          borderColor: entry.is_self ? `${entry.color}20` : 'rgba(255,255,255,0.04)',
                        }}>
                        <div className="w-8 text-center">
                          {i < 3 ? (
                            <Crown size={16} style={{ color: ['#FCD34D', '#C0C0C0', '#CD7F32'][i], margin: '0 auto' }} />
                          ) : (
                            <span className="text-xs tabular-nums font-bold" style={{ color: 'var(--text-muted)' }}>#{entry.rank}</span>
                          )}
                        </div>
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{ background: `${entry.color}12` }}>
                          <Star size={14} style={{ color: entry.color }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium truncate" style={{ color: entry.color }}>
                            {entry.character_name} {entry.is_self && <span className="text-[8px] opacity-50">(You)</span>}
                          </p>
                          <p className="text-[9px]" style={{ color: 'var(--text-muted)' }}>
                            {entry.origin_name} &middot; Ch.{entry.chapter} &middot; {entry.achievements} achievements
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-bold" style={{ color: '#FCD34D' }}>Lvl {entry.level}</span>
                        </div>
                      </motion.div>
                    ))}
                    {leaderboard.length === 0 && (
                      <p className="text-xs text-center py-8" style={{ color: 'var(--text-muted)' }}>No adventurers yet. Be the first!</p>
                    )}
                  </div>
                </motion.div>
              )}

              {activeTab === 'bosses' && (
                <motion.div key="bosses" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  data-testid="realm-bosses">
                  <BossEncounterPanel
                    activeOrigin={activeOrigin}
                    authHeaders={authHeaders}
                    userId={user?.id}
                  />
                </motion.div>
              )}

              {activeTab === 'alliances' && (
                <motion.div key="alliances" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  data-testid="realm-alliances">
                  {/* My Alliance */}
                  {myAlliance ? (
                    <div className="rounded-2xl p-5 mb-6 border"
                      style={{ background: 'rgba(192,132,252,0.04)', borderColor: 'rgba(192,132,252,0.15)' }}>
                      <div className="flex items-center gap-2 mb-3">
                        <Users size={14} style={{ color: '#C084FC' }} />
                        <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#C084FC' }}>Your Alliance</span>
                      </div>
                      <h3 className="text-lg font-light mb-3" style={{ fontFamily: 'Cormorant Garamond, serif' }}>{myAlliance.name}</h3>
                      <div className="space-y-2 mb-4">
                        {myAlliance.member_details?.map((m, i) => (
                          <div key={i} className="flex items-center gap-2 text-xs">
                            <Star size={10} style={{ color: ORIGIN_COLORS[m.origin_id] || '#818CF8' }} />
                            <span style={{ color: ORIGIN_COLORS[m.origin_id] || '#818CF8' }}>{m.character_name}</span>
                            <span className="text-[9px]" style={{ color: 'var(--text-muted)' }}>Lvl {m.level}</span>
                            {m.role === 'leader' && <Crown size={9} style={{ color: '#FCD34D' }} />}
                          </div>
                        ))}
                      </div>
                      {/* Alliance Chat */}
                      <AllianceChat allianceId={myAlliance.id} authHeaders={authHeaders} userId={user?.id} />
                    </div>
                  ) : (
                    <div className="rounded-2xl p-5 mb-6 border"
                      style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.05)' }}>
                      <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--text-muted)' }}>Create Alliance</p>
                      <div className="flex gap-2">
                        <input type="text" placeholder="Alliance name..." maxLength={30}
                          value={allianceName} onChange={e => setAllianceName(e.target.value)}
                          className="flex-1 px-3 py-2 rounded-lg text-sm"
                          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-primary)', outline: 'none' }}
                          data-testid="alliance-name-input" />
                        <button onClick={createAlliance}
                          className="px-4 py-2 rounded-lg text-xs font-medium flex items-center gap-1"
                          style={{ background: 'rgba(192,132,252,0.1)', border: '1px solid rgba(192,132,252,0.2)', color: '#C084FC' }}
                          data-testid="create-alliance-btn">
                          <Plus size={12} /> Create
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Available Alliances */}
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-3" style={{ color: 'var(--text-muted)' }}>
                    Open Alliances
                  </p>
                  <div className="space-y-2">
                    {alliances.map((a, i) => (
                      <div key={a.id} className="rounded-xl p-3 flex items-center gap-3 border"
                        style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.04)' }}>
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{ background: 'rgba(192,132,252,0.08)' }}>
                          <Users size={14} style={{ color: '#C084FC' }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium truncate" style={{ color: 'var(--text-primary)' }}>{a.name}</p>
                          <p className="text-[9px]" style={{ color: 'var(--text-muted)' }}>{a.members?.length || 0}/6 members</p>
                        </div>
                        {!myAlliance && (
                          <button onClick={() => joinAlliance(a.id)}
                            className="text-[9px] px-2 py-1 rounded-lg flex items-center gap-1"
                            style={{ background: 'rgba(192,132,252,0.08)', color: '#C084FC', border: '1px solid rgba(192,132,252,0.15)' }}
                            data-testid={`join-alliance-${a.id}`}>
                            <UserPlus size={9} /> Join
                          </button>
                        )}
                      </div>
                    ))}
                    {alliances.length === 0 && (
                      <p className="text-xs text-center py-6" style={{ color: 'var(--text-muted)' }}>No alliances yet. Create the first one!</p>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </div>
    </div>
  );
}
