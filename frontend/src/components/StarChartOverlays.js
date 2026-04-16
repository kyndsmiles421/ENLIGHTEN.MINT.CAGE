import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Loader2, Star, X, Sparkles, ChevronRight, Eye, BookOpen, Scroll, Volume2, Play, Pause, Share2 } from 'lucide-react';
import { toast } from 'sonner';
import { CosmicNarrator } from './StarChartAudio';
import { AstrologyReadingButton } from './AstrologyReading';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const ELEMENT_COLORS = { Fire: '#EF4444', Water: '#3B82F6', Air: '#A78BFA', Earth: '#22C55E' };

/* ── Birth Constellation Toast ── */
export function BirthConstellationToast({ info, onClose }) {
  if (!info) return null;
  const color = ELEMENT_COLORS[info.element] || '#D8B4FE';
  return (
    <motion.div initial={{ opacity: 0, y: 30, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.95 }}
      transition={{ duration: 0.6 }}
      className="absolute bottom-20 left-1/2 -translate-x-1/2 z-20 w-80 max-w-[90vw] rounded-2xl p-5 text-center"
      style={{ background: 'rgba(0,0,0,0)', border: `1px solid ${color}30`, backdropFilter: 'none', boxShadow: `0 0 40px ${color}15` }}
      data-testid="birth-constellation-toast">
      <button onClick={onClose} className="absolute top-2 right-2 p-1 rounded-lg hover:bg-white/5"><X size={12} style={{ color: 'rgba(255,255,255,0.65)' }} /></button>
      <div className="text-2xl mb-1">{info.symbol}</div>
      <p className="text-xs uppercase tracking-[0.25em] mb-1" style={{ color }}>Your Constellation</p>
      <p className="text-base font-semibold" style={{ color: '#F8FAFC', fontFamily: 'Cormorant Garamond, serif' }}>{info.name}</p>
      <p className="text-[11px] mt-2 leading-relaxed" style={{ color: 'rgba(255,255,255,0.8)' }}>{info.meaning}</p>
      <div className="mt-3 flex items-center justify-center gap-1"><Sparkles size={10} style={{ color }} /><span className="text-[10px]" style={{ color }}>Aligned with your cosmic path</span></div>
    </motion.div>
  );
}

/* ── Mythology Detail Panel ── */
export function MythologyPanel({ constellation, onClose, onReadingReady }) {
  const navigate = useNavigate();
  const { token, authHeaders } = useAuth();
  const [showMyth, setShowMyth] = useState(true);
  const [sharing, setSharing] = useState(false);

  if (!constellation) return null;
  const color = ELEMENT_COLORS[constellation.element] || '#A78BFA';
  const myth = constellation.mythology;

  const shareToFeed = async () => {
    if (!token) return;
    setSharing(true);
    try {
      await axios.post(`${API}/community/posts`, {
        post_type: 'shared_constellation',
        content: `Exploring the constellation ${constellation.name} — ${myth?.figure || constellation.symbol}. ${myth?.origin_story?.slice(0, 100) || ''}...`,
      }, { headers: authHeaders });
      toast.success('Shared to community feed!');
    } catch { toast.error('Failed to share'); }
    finally { setSharing(false); }
  };

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
      className="absolute top-20 right-4 w-96 max-w-[85vw] max-h-[75vh] overflow-y-auto rounded-2xl z-20"
      style={{ background: 'rgba(0,0,0,0)', border: `1px solid ${color}20`, backdropFilter: 'none', boxShadow: `0 0 30px ${color}08` }}
      data-testid="mythology-panel">
      {/* Header */}
      <div className="sticky top-0 z-10 px-5 pt-5 pb-3" style={{ background: 'rgba(0,0,0,0)' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-xl">{constellation.symbol}</div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em]" style={{ color }}>{constellation.element} Sign</p>
              <p className="text-lg font-semibold" style={{ color: '#F8FAFC', fontFamily: 'Cormorant Garamond, serif' }}>{constellation.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/5" data-testid="close-mythology-panel">
            <X size={14} style={{ color: 'rgba(255,255,255,0.65)' }} />
          </button>
        </div>
      </div>

      {myth ? (
        <div className="px-5 pb-5">
          {/* Mythological figure */}
          <div className="flex items-center gap-3 py-3 mb-3" style={{ borderBottom: `1px solid ${color}10` }}>
            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: `${color}10`, border: `1px solid ${color}20` }}>
              <Star size={16} style={{ color }} />
            </div>
            <div>
              <p className="text-sm font-medium" style={{ color: '#F8FAFC' }}>{myth.figure}</p>
              <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.7)' }}>Mythological Figure</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mb-3">
            <button onClick={() => setShowMyth(true)}
              className="px-3 py-1.5 rounded-lg text-[10px] font-medium"
              style={{ background: showMyth ? `${color}12` : 'transparent', color: showMyth ? color : 'rgba(255,255,255,0.65)', border: `1px solid ${showMyth ? `${color}20` : 'rgba(248,250,252,0.06)'}` }}
              data-testid="myth-tab">
              <BookOpen size={10} className="inline mr-1" /> Story
            </button>
            <button onClick={() => setShowMyth(false)}
              className="px-3 py-1.5 rounded-lg text-[10px] font-medium"
              style={{ background: !showMyth ? `${color}12` : 'transparent', color: !showMyth ? color : 'rgba(255,255,255,0.65)', border: `1px solid ${!showMyth ? `${color}20` : 'rgba(248,250,252,0.06)'}` }}>
              <Eye size={10} className="inline mr-1" /> Wisdom
            </button>
          </div>

          {showMyth ? (
            <>
              <p className="text-sm leading-relaxed mb-4" style={{ color: 'rgba(255,255,255,0.85)' }}>{myth.origin_story}</p>
              {/* TTS Narrator */}
              <CosmicNarrator text={myth.origin_story} constellationName={constellation.name} color={color} authHeaders={authHeaders} token={token} ELEMENT_COLORS={ELEMENT_COLORS} />
            </>
          ) : (
            <div>
              <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color }}>Key Wisdom</p>
              <div className="space-y-2 mb-4">
                {(myth.spiritual_meaning || []).map((w, i) => (
                  <div key={i} className="flex items-start gap-2 py-1.5">
                    <Sparkles size={10} style={{ color, marginTop: 3, flexShrink: 0 }} />
                    <p className="text-[11px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.8)' }}>{w}</p>
                  </div>
                ))}
              </div>
              {myth.ritual_use && (
                <>
                  <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color }}>Ritual Use</p>
                  <p className="text-[11px] leading-relaxed mb-3" style={{ color: 'rgba(255,255,255,0.75)' }}>{myth.ritual_use}</p>
                </>
              )}
              {myth.best_viewing && (
                <div className="p-3 mt-3">
                  <p className="text-[10px] uppercase tracking-wider mb-1" style={{ color: 'rgba(255,255,255,0.65)' }}>Best Viewing</p>
                  <p className="text-xs" style={{ color: 'rgba(255,255,255,0.85)' }}>{myth.best_viewing}</p>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2 mt-4 pt-3 flex-wrap" style={{ borderTop: `1px solid ${color}10` }}>
            {onReadingReady && (
              <AstrologyReadingButton constellation={constellation} onReadingReady={onReadingReady} />
            )}
            <button onClick={shareToFeed} disabled={sharing}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[10px] font-medium"
              style={{ background: 'rgba(192,132,252,0.08)', border: '1px solid rgba(192,132,252,0.15)', color: '#C084FC' }}
              data-testid="share-constellation-btn">
              <Share2 size={10} /> {sharing ? 'Sharing...' : 'Share'}
            </button>
            <button onClick={() => navigate('/star-chart')}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[10px]"
              style={{ background: 'rgba(248,250,252,0.03)', border: '1px solid rgba(248,250,252,0.06)', color: 'rgba(255,255,255,0.65)' }}>
              <ChevronRight size={10} /> More Stories
            </button>
          </div>
        </div>
      ) : (
        <div className="px-5 pb-5 text-center py-8">
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.65)' }}>No mythology data available for this constellation.</p>
        </div>
      )}
    </motion.div>
  );
}

/* ── Stargazing Journey Overlay ── */
export function JourneyOverlay({ constellations, active, currentIdx, phase, onPlay, onPause, onSkip, onStop, isPaused }) {
  if (!active) return null;
  const current = constellations[currentIdx];
  const color = current ? (ELEMENT_COLORS[current.element] || '#A78BFA') : '#818CF8';
  const progress = constellations.length > 0 ? ((currentIdx + (phase === 'narrating' ? 0.5 : phase === 'moving' ? 0.2 : 0)) / constellations.length) * 100 : 0;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
      className="absolute bottom-0 left-0 right-0 z-20" data-testid="journey-overlay">
      <div className="h-24 pointer-events-none" style={{ background: 'linear-gradient(transparent, rgba(0,0,0,0))' }} />
      <div className="px-6 pb-6 pt-2" style={{ background: 'rgba(0,0,0,0)' }}>
        {current && (
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${color}12`, border: `1px solid ${color}20` }}>
              <Star size={14} style={{ color }} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold truncate" style={{ color: '#F8FAFC' }}>{current.name}</p>
                <span className="text-[9px] px-1.5 py-0.5 rounded" style={{ background: `${color}10`, color, border: `1px solid ${color}20` }}>
                  {currentIdx + 1}/{constellations.length}
                </span>
              </div>
              <p className="text-[10px] truncate" style={{ color: 'rgba(255,255,255,0.7)' }}>
                {phase === 'moving' ? 'Navigating to constellation...' : phase === 'narrating' ? 'Listening to the story...' : phase === 'waiting' ? 'Preparing next story...' : current.mythology?.figure || current.symbol}
              </p>
            </div>
          </div>
        )}
        <div className="flex items-center gap-1 mb-3 overflow-x-auto pb-1">
          {constellations.map((c, i) => {
            const cColor = ELEMENT_COLORS[c.element] || '#A78BFA';
            const done = i < currentIdx;
            const isCurrent = i === currentIdx;
            return (
              <div key={c.id} className="flex flex-col items-center gap-0.5 flex-shrink-0" style={{ width: 28 }}>
                <div className="w-3 h-3 rounded-full transition-all" style={{
                  background: done ? cColor : isCurrent ? cColor : 'rgba(248,250,252,0.08)',
                  boxShadow: isCurrent ? `0 0 8px ${cColor}60` : 'none',
                  border: `1px solid ${done || isCurrent ? cColor + '60' : 'rgba(248,250,252,0.06)'}`,
                  transform: isCurrent ? 'scale(1.3)' : 'scale(1)',
                }} />
                <span className="text-[7px] leading-none truncate w-full text-center" style={{ color: done || isCurrent ? cColor : 'rgba(248,250,252,0.15)' }}>
                  {c.name.length > 4 ? c.name.slice(0, 4) : c.name}
                </span>
              </div>
            );
          })}
        </div>
        <div className="w-full h-1 rounded-full mb-3 overflow-hidden" style={{ background: 'rgba(248,250,252,0.04)' }}>
          <motion.div className="h-full rounded-full" animate={{ width: `${progress}%` }} transition={{ duration: 0.5 }}
            style={{ background: 'linear-gradient(90deg, #818CF8, #A78BFA, #C084FC)' }} />
        </div>
        <div className="flex items-center justify-center gap-4">
          <button onClick={onStop} data-testid="journey-stop-btn"
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(248,250,252,0.04)', border: '1px solid rgba(248,250,252,0.08)' }}>
            <X size={12} style={{ color: 'rgba(255,255,255,0.7)' }} />
          </button>
          <button onClick={isPaused ? onPlay : onPause} data-testid="journey-play-pause-btn"
            className="w-12 h-12 rounded-full flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, rgba(129,140,248,0.2), rgba(167,139,250,0.2))', border: '1px solid rgba(167,139,250,0.3)', boxShadow: '0 0 20px rgba(167,139,250,0.15)' }}>
            {isPaused ? <Play size={16} style={{ color: '#A78BFA' }} /> : <Pause size={16} style={{ color: '#A78BFA' }} />}
          </button>
          <button onClick={onSkip} data-testid="journey-skip-btn"
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(248,250,252,0.04)', border: '1px solid rgba(248,250,252,0.08)' }}>
            <ChevronRight size={14} style={{ color: 'rgba(255,255,255,0.7)' }} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

/* ── Journey Complete Card ── */
export function JourneyComplete({ count, onClose, authHeaders, token }) {
  const [shared, setShared] = useState(false);

  const shareJourney = async () => {
    if (!token) return;
    try {
      await axios.post(`${API}/community/posts`, {
        post_type: 'shared_journey',
        content: `Completed a Stargazing Journey through ${count} constellations, listening to their ancient mythology stories. The cosmos has shared its wisdom.`,
        milestone_type: 'stargazing_journey',
        milestone_value: count,
      }, { headers: authHeaders });
      setShared(true);
      toast.success('Journey shared to community!');
    } catch { toast.error('Failed to share'); }
  };

  return (
    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
      className="absolute inset-0 z-30 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0)', backdropFilter: 'none'}}
      data-testid="journey-complete">
      <div className="text-center max-w-sm px-6">
        <div className="text-4xl mb-3">&#10024;</div>
        <p className="text-lg font-bold mb-1" style={{ color: '#F8FAFC', fontFamily: 'Cormorant Garamond, serif' }}>Journey Complete</p>
        <p className="text-xs mb-4" style={{ color: 'rgba(255,255,255,0.75)' }}>
          You've traversed {count} constellations and heard their ancient stories. The cosmos has shared its wisdom with you.
        </p>
        <div className="flex gap-2 justify-center">
          <button onClick={onClose} data-testid="journey-complete-close"
            className="px-6 py-2 rounded-xl text-xs font-medium"
            style={{ background: 'linear-gradient(135deg, rgba(129,140,248,0.2), rgba(167,139,250,0.2))', border: '1px solid rgba(167,139,250,0.3)', color: '#A78BFA' }}>
            Return to the Stars
          </button>
          {!shared && (
            <button onClick={shareJourney} data-testid="share-journey-btn"
              className="px-4 py-2 rounded-xl text-xs font-medium flex items-center gap-1"
              style={{ background: 'rgba(192,132,252,0.1)', border: '1px solid rgba(192,132,252,0.25)', color: '#C084FC' }}>
              <Share2 size={12} /> Share
            </button>
          )}
          {shared && <span className="text-[10px] py-2" style={{ color: '#22C55E' }}>Shared!</span>}
        </div>
      </div>
    </motion.div>
  );
}

/* ── Celestial Badges Panel ── */
const BADGE_ICONS = {
  star: Star, telescope: Eye, globe: BookOpen, book: BookOpen, scroll: Scroll,
  flame: Sparkles, droplet: Volume2, leaf: Sparkles, wind: Sparkles,
  music: Volume2, rocket: Eye, crown: Star,
};
const BADGE_ELEMENT_COLORS = { Fire: '#EF4444', Water: '#3B82F6', Air: '#A78BFA', Earth: '#22C55E', universal: '#C084FC' };

export function CelestialBadgesPanel({ onClose, token, authHeaders }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    axios.get(`${API}/badges/celestial`, { headers: authHeaders })
      .then(r => setData(r.data))
      .catch(() => toast.error('Failed to load badges'))
      .finally(() => setLoading(false));
  }, [token, authHeaders]);

  return (
    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
      data-testid="badges-panel"
      className="absolute top-20 left-4 w-80 max-h-[75vh] overflow-y-auto rounded-2xl z-20"
      style={{ background: 'rgba(0,0,0,0)', border: '1px solid rgba(192,132,252,0.15)', backdropFilter: 'none', boxShadow: '0 0 30px rgba(192,132,252,0.08)' }}>
      <div className="sticky top-0 z-10 px-5 pt-5 pb-3" style={{ background: 'rgba(0,0,0,0)' }}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(192,132,252,0.12)', border: '1px solid rgba(192,132,252,0.25)' }}>
              <Star size={14} style={{ color: '#C084FC' }} />
            </div>
            <div>
              <p className="text-sm font-bold" style={{ color: '#F8FAFC' }}>Celestial Badges</p>
              {data && <p className="text-[10px]" style={{ color: '#C084FC' }}>{data.total_earned}/{data.total_badges} earned</p>}
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/5"><X size={12} style={{ color: 'rgba(255,255,255,0.65)' }} /></button>
        </div>
        {data && (
          <div className="flex gap-3 text-[9px]" style={{ color: 'rgba(255,255,255,0.65)' }}>
            <span>{data.stats.constellations_explored} explored</span>
            <span>{data.stats.stories_listened} stories</span>
            <span>{data.stats.journeys_completed} journeys</span>
          </div>
        )}
      </div>
      <div className="px-5 pb-5">
        {loading ? (
          <div className="flex justify-center py-8"><Loader2 className="animate-spin" size={20} style={{ color: '#C084FC' }} /></div>
        ) : data?.badges?.map(badge => {
          const Icon = BADGE_ICONS[badge.icon] || Star;
          const color = BADGE_ELEMENT_COLORS[badge.element] || '#C084FC';
          const pct = badge.target > 0 ? (badge.progress / badge.target) * 100 : 0;
          return (
            <div key={badge.id} data-testid={`badge-${badge.id}`}
              className="flex items-center gap-3 py-3" style={{ borderBottom: '1px solid rgba(248,250,252,0.03)' }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all"
                style={{
                  background: badge.earned ? `${color}18` : 'rgba(248,250,252,0.02)',
                  border: `1px solid ${badge.earned ? `${color}35` : 'rgba(248,250,252,0.04)'}`,
                  boxShadow: badge.earned ? `0 0 12px ${color}20` : 'none',
                  opacity: badge.earned ? 1 : 0.4,
                }}>
                <Icon size={16} style={{ color: badge.earned ? color : 'rgba(255,255,255,0.6)' }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="text-[11px] font-semibold truncate" style={{ color: badge.earned ? '#F8FAFC' : 'rgba(255,255,255,0.65)' }}>{badge.name}</p>
                  {badge.earned && <span className="text-[8px] px-1.5 py-0.5 rounded-full" style={{ background: `${color}15`, color, border: `1px solid ${color}25` }}>Earned</span>}
                </div>
                <p className="text-[9px] truncate" style={{ color: 'rgba(255,255,255,0.6)' }}>{badge.description}</p>
                {!badge.earned && (
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: 'rgba(248,250,252,0.04)' }}>
                      <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
                    </div>
                    <span className="text-[8px]" style={{ color: 'rgba(255,255,255,0.6)' }}>{badge.progress}/{badge.target}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
