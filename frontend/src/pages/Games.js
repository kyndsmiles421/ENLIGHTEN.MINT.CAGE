import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useSensory } from '../context/SensoryContext';
import { toast } from 'sonner';
import {
  Gamepad2, Brain, Wind, Palette, Sparkles, ArrowLeft,
  Trophy, RotateCcw, Clock, Star, ChevronRight, Zap
} from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

// ============ MEMORY MATCH GAME ============
const MEMORY_SYMBOLS = ['Om', 'Lotus', 'Moon', 'Sun', 'Star', 'Wave', 'Eye', 'Heart', 'Flame', 'Leaf', 'Cloud', 'Bell'];
const MEMORY_COLORS = ['#2DD4BF', '#D8B4FE', '#FCD34D', '#FB923C', '#3B82F6', '#22C55E', '#EF4444', '#FDA4AF', '#8B5CF6', '#86EFAC', '#38BDF8', '#E879F9'];

function MemoryMatch({ onScore }) {
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [moves, setMoves] = useState(0);
  const [started, setStarted] = useState(false);
  const [time, setTime] = useState(0);
  const [complete, setComplete] = useState(false);
  const timerRef = useRef(null);
  const { playChime } = useSensory();

  const initGame = useCallback(() => {
    const pairs = 8;
    const symbols = MEMORY_SYMBOLS.slice(0, pairs);
    const deck = [...symbols, ...symbols].map((symbol, i) => ({
      id: i,
      symbol,
      color: MEMORY_COLORS[symbols.indexOf(symbol)],
    }));
    // Shuffle
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    setCards(deck);
    setFlipped([]);
    setMatched([]);
    setMoves(0);
    setTime(0);
    setStarted(false);
    setComplete(false);
    clearInterval(timerRef.current);
  }, []);

  useEffect(() => { initGame(); return () => clearInterval(timerRef.current); }, [initGame]);

  useEffect(() => {
    if (matched.length === cards.length && cards.length > 0) {
      clearInterval(timerRef.current);
      setComplete(true);
      playChime();
      const score = Math.max(0, 1000 - moves * 10 - time * 2);
      onScore(score);
    }
  }, [matched, cards, moves, time, onScore, playChime]);

  const flipCard = (id) => {
    if (flipped.length === 2 || flipped.includes(id) || matched.includes(id)) return;
    if (!started) {
      setStarted(true);
      timerRef.current = setInterval(() => setTime(t => t + 1), 1000);
    }
    const next = [...flipped, id];
    setFlipped(next);
    if (next.length === 2) {
      setMoves(m => m + 1);
      const [a, b] = next;
      if (cards[a].symbol === cards[b].symbol) {
        setTimeout(() => { setMatched(m => [...m, a, b]); setFlipped([]); }, 400);
      } else {
        setTimeout(() => setFlipped([]), 800);
      }
    }
  };

  return (
    <div data-testid="memory-match-game">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <span className="text-xs flex items-center gap-1" style={{ color: 'var(--text-muted)' }}><Clock size={11} /> {time}s</span>
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Moves: {moves}</span>
        </div>
        <button onClick={initGame} className="text-xs flex items-center gap-1 px-3 py-1.5 rounded-lg" style={{ color: '#2DD4BF', background: 'rgba(45,212,191,0.08)' }}>
          <RotateCcw size={11} /> Reset
        </button>
      </div>
      <div className="grid grid-cols-4 gap-2.5 max-w-md mx-auto">
        {cards.map((card, i) => {
          const isFlipped = flipped.includes(i) || matched.includes(i);
          const isMatched = matched.includes(i);
          return (
            <motion.button key={i} onClick={() => flipCard(i)}
              whileTap={{ scale: 0.95 }}
              className="aspect-square rounded-xl flex items-center justify-center text-sm font-medium transition-all duration-300"
              style={{
                background: isFlipped ? `${card.color}15` : 'rgba(255,255,255,0.03)',
                border: `1px solid ${isFlipped ? `${card.color}30` : 'rgba(255,255,255,0.06)'}`,
                color: isFlipped ? card.color : 'transparent',
                boxShadow: isMatched ? `0 0 15px ${card.color}20` : 'none',
                cursor: isFlipped && !isMatched ? 'default' : 'pointer',
              }}
              data-testid={`memory-card-${i}`}>
              {isFlipped ? card.symbol : '?'}
            </motion.button>
          );
        })}
      </div>
      {complete && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6 text-center mt-6">
          <Sparkles size={24} style={{ color: '#FCD34D', margin: '0 auto 8px' }} />
          <p className="text-lg font-light mb-1" style={{ fontFamily: 'Cormorant Garamond, serif' }}>Matched!</p>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{moves} moves in {time}s</p>
        </motion.div>
      )}
    </div>
  );
}

// ============ BREATHING BUBBLE GAME ============
function BreathingBubble({ onScore }) {
  const canvasRef = useRef(null);
  const [score, setScore] = useState(0);
  const [phase, setPhase] = useState('idle'); // idle, inhale, hold, exhale
  const [bubbleSize, setBubbleSize] = useState(40);
  const [targetSize, setTargetSize] = useState(40);
  const [rounds, setRounds] = useState(0);
  const [complete, setComplete] = useState(false);
  const totalRounds = 5;
  const holdRef = useRef(false);
  const animRef = useRef(null);
  const { playChime } = useSensory();

  const startRound = useCallback(() => {
    if (rounds >= totalRounds) {
      setComplete(true);
      playChime();
      return;
    }
    setPhase('inhale');
    setTargetSize(80 + Math.random() * 60);
    setBubbleSize(40);
  }, [rounds, playChime]);

  useEffect(() => {
    if (phase === 'inhale') {
      holdRef.current = true;
      const grow = () => {
        if (!holdRef.current) return;
        setBubbleSize(s => {
          const newSize = Math.min(s + 0.5, 180);
          return newSize;
        });
        animRef.current = requestAnimationFrame(grow);
      };
      animRef.current = requestAnimationFrame(grow);
      // Auto transition after 4 seconds
      const timer = setTimeout(() => {
        holdRef.current = false;
        cancelAnimationFrame(animRef.current);
        setPhase('hold');
      }, 4000);
      return () => { clearTimeout(timer); holdRef.current = false; cancelAnimationFrame(animRef.current); };
    }
    if (phase === 'hold') {
      const timer = setTimeout(() => setPhase('exhale'), 2000);
      return () => clearTimeout(timer);
    }
    if (phase === 'exhale') {
      const shrink = () => {
        setBubbleSize(s => {
          if (s <= 40) {
            // Score based on how close bubble was to target
            setBubbleSize(prev => {
              const accuracy = Math.max(0, 100 - Math.abs(prev - targetSize));
              setScore(sc => sc + Math.round(accuracy));
              return 40;
            });
            setRounds(r => r + 1);
            setPhase('idle');
            return 40;
          }
          return s - 1;
        });
        animRef.current = requestAnimationFrame(shrink);
      };
      animRef.current = requestAnimationFrame(shrink);
      return () => cancelAnimationFrame(animRef.current);
    }
  }, [phase, targetSize]);

  useEffect(() => {
    if (complete) onScore(score);
  }, [complete, score, onScore]);

  useEffect(() => {
    if (phase === 'idle' && rounds < totalRounds && rounds > 0) {
      const t = setTimeout(startRound, 1000);
      return () => clearTimeout(t);
    }
  }, [phase, rounds, startRound]);

  const releaseBreath = () => {
    if (phase === 'inhale') {
      holdRef.current = false;
      cancelAnimationFrame(animRef.current);
      setPhase('hold');
    }
  };

  const phaseColor = phase === 'inhale' ? '#2DD4BF' : phase === 'hold' ? '#FCD34D' : phase === 'exhale' ? '#D8B4FE' : 'var(--text-muted)';

  return (
    <div className="text-center" data-testid="breathing-bubble-game">
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Round {Math.min(rounds + 1, totalRounds)}/{totalRounds}</span>
        <span className="text-xs" style={{ color: '#FCD34D' }}>Score: {score}</span>
      </div>

      <div className="relative w-64 h-64 mx-auto mb-6 flex items-center justify-center">
        {/* Target ring */}
        <div className="absolute rounded-full border border-dashed transition-all duration-500"
          style={{ width: targetSize * 2, height: targetSize * 2, borderColor: `${phaseColor}30` }} />
        {/* Bubble */}
        <motion.div className="rounded-full" animate={{ width: bubbleSize * 2, height: bubbleSize * 2 }}
          transition={{ type: 'spring', stiffness: 100, damping: 15 }}
          style={{ background: `radial-gradient(circle, ${phaseColor}30, ${phaseColor}08)`, border: `2px solid ${phaseColor}40`, boxShadow: `0 0 ${bubbleSize / 2}px ${phaseColor}15` }} />
      </div>

      <p className="text-sm font-medium capitalize mb-2" style={{ color: phaseColor }}>
        {phase === 'idle' && rounds === 0 ? 'Press Start' : phase === 'idle' ? 'Next round...' : phase}
      </p>
      <p className="text-[10px] mb-4" style={{ color: 'var(--text-muted)' }}>
        {phase === 'inhale' ? 'Breathing in... release to hold' : phase === 'hold' ? 'Hold steady...' : phase === 'exhale' ? 'Releasing...' : 'Match the bubble to the target ring'}
      </p>

      {phase === 'idle' && !complete && (
        <button onClick={startRound} className="btn-glass text-sm" style={{ color: '#2DD4BF', borderColor: 'rgba(45,212,191,0.2)' }}
          data-testid="breathing-start-btn">
          {rounds === 0 ? 'Start Breathing' : 'Continue'}
        </button>
      )}
      {phase === 'inhale' && (
        <button onClick={releaseBreath} className="btn-glass text-sm" style={{ color: phaseColor, borderColor: `${phaseColor}20` }}>
          Release
        </button>
      )}
      {complete && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-6 mt-4">
          <Sparkles size={24} style={{ color: '#FCD34D', margin: '0 auto 8px' }} />
          <p className="text-lg font-light" style={{ fontFamily: 'Cormorant Garamond, serif' }}>Deep Calm Achieved</p>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Score: {score} / 500</p>
        </motion.div>
      )}
    </div>
  );
}

// ============ COLOR HARMONY GAME ============
const COLOR_PALETTES = [
  { name: 'Sunrise', colors: ['#FF6B6B', '#FFA07A', '#FFD700', '#FFEAA7'], mood: 'uplifting' },
  { name: 'Ocean', colors: ['#0077B6', '#00B4D8', '#48CAE4', '#90E0EF'], mood: 'calm' },
  { name: 'Forest', colors: ['#1B4332', '#2D6A4F', '#40916C', '#74C69D'], mood: 'grounding' },
  { name: 'Twilight', colors: ['#240046', '#5A189A', '#9D4EDD', '#E0AAFF'], mood: 'mystical' },
  { name: 'Ember', colors: ['#6A040F', '#D00000', '#E85D04', '#FAA307'], mood: 'energizing' },
  { name: 'Moonlit', colors: ['#22223B', '#4A4E69', '#9A8C98', '#C9ADA7'], mood: 'peaceful' },
];

function ColorHarmony({ onScore }) {
  const [round, setRound] = useState(0);
  const [palette, setPalette] = useState(null);
  const [shuffled, setShuffled] = useState([]);
  const [userOrder, setUserOrder] = useState([]);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [complete, setComplete] = useState(false);
  const totalRounds = 5;
  const { playChime, playClick } = useSensory();

  const startRound = useCallback(() => {
    const p = COLOR_PALETTES[Math.floor(Math.random() * COLOR_PALETTES.length)];
    setPalette(p);
    const s = [...p.colors].sort(() => Math.random() - 0.5);
    setShuffled(s);
    setUserOrder([]);
    setShowResult(false);
  }, []);

  useEffect(() => { startRound(); }, [startRound]);

  const selectColor = (color) => {
    if (userOrder.includes(color) || showResult) return;
    playClick();
    const next = [...userOrder, color];
    setUserOrder(next);
    if (next.length === palette.colors.length) {
      // Score
      let correct = 0;
      palette.colors.forEach((c, i) => { if (next[i] === c) correct++; });
      const roundScore = Math.round((correct / palette.colors.length) * 100);
      setScore(s => s + roundScore);
      setShowResult(true);
      if (correct === palette.colors.length) playChime();
      setTimeout(() => {
        if (round + 1 >= totalRounds) {
          setComplete(true);
          onScore(score + roundScore);
        } else {
          setRound(r => r + 1);
          startRound();
        }
      }, 1500);
    }
  };

  if (!palette) return null;

  return (
    <div data-testid="color-harmony-game">
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Round {round + 1}/{totalRounds}</span>
        <span className="text-xs" style={{ color: '#FCD34D' }}>Score: {score}</span>
      </div>
      <p className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
        Arrange the <span style={{ color: palette.colors[0] }}>{palette.name}</span> palette from darkest to lightest
      </p>
      <p className="text-[10px] mb-4" style={{ color: 'var(--text-muted)' }}>Mood: {palette.mood}</p>

      {/* Target order preview (briefly) */}
      <div className="flex gap-2 mb-6 justify-center">
        {palette.colors.map((c, i) => (
          <div key={i} className="w-10 h-10 rounded-lg" style={{ background: `${c}20`, border: `1px solid ${c}30` }}>
            {userOrder[i] && <div className="w-full h-full rounded-lg" style={{ background: userOrder[i] }} />}
          </div>
        ))}
      </div>

      {/* Shuffled colors to pick from */}
      <div className="flex gap-3 justify-center flex-wrap">
        {shuffled.map((c, i) => (
          <motion.button key={c + '-' + i} onClick={() => selectColor(c)}
            whileTap={{ scale: 0.9 }}
            className="w-14 h-14 rounded-xl transition-all"
            style={{
              background: c,
              opacity: userOrder.includes(c) ? 0.2 : 1,
              cursor: userOrder.includes(c) ? 'default' : 'pointer',
              boxShadow: `0 4px 15px ${c}30`,
            }}
            data-testid={`color-${i}`}
          />
        ))}
      </div>

      {showResult && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center text-xs mt-4"
          style={{ color: 'var(--text-muted)' }}>
          {userOrder.every((c, i) => c === palette.colors[i]) ? 'Perfect harmony!' : 'Close — keep training your eye!'}
        </motion.p>
      )}

      {complete && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-6 text-center mt-6">
          <Sparkles size={24} style={{ color: '#FCD34D', margin: '0 auto 8px' }} />
          <p className="text-lg font-light" style={{ fontFamily: 'Cormorant Garamond, serif' }}>Color Master</p>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Score: {score + (userOrder.every((c, i) => c === palette?.colors[i]) ? 100 : 0)} / 500</p>
        </motion.div>
      )}
    </div>
  );
}

// ============ MINDFUL PATTERN GAME ============
function MindfulPattern({ onScore }) {
  const [pattern, setPattern] = useState([]);
  const [userPattern, setUserPattern] = useState([]);
  const [showingPattern, setShowingPattern] = useState(false);
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [activeCell, setActiveCell] = useState(null);
  const gridSize = 9;
  const { playChime, playClick } = useSensory();

  const cellColors = ['#2DD4BF', '#D8B4FE', '#FCD34D', '#3B82F6', '#EF4444', '#22C55E', '#FB923C', '#E879F9', '#FDA4AF'];

  const generatePattern = useCallback((len) => {
    const p = [];
    for (let i = 0; i < len; i++) {
      let next;
      do { next = Math.floor(Math.random() * gridSize); } while (p[p.length - 1] === next);
      p.push(next);
    }
    return p;
  }, []);

  const startLevel = useCallback(() => {
    const len = level + 2; // 3, 4, 5, 6...
    const p = generatePattern(len);
    setPattern(p);
    setUserPattern([]);
    setShowingPattern(true);

    // Show pattern with delays
    let i = 0;
    const show = () => {
      if (i < p.length) {
        setActiveCell(p[i]);
        setTimeout(() => { setActiveCell(null); i++; setTimeout(show, 200); }, 600);
      } else {
        setShowingPattern(false);
      }
    };
    setTimeout(show, 500);
  }, [level, generatePattern]);

  useEffect(() => { startLevel(); }, [startLevel]);

  const tapCell = (index) => {
    if (showingPattern || gameOver) return;
    playClick();
    setActiveCell(index);
    setTimeout(() => setActiveCell(null), 200);

    const next = [...userPattern, index];
    setUserPattern(next);

    // Check
    const pos = next.length - 1;
    if (next[pos] !== pattern[pos]) {
      setGameOver(true);
      const finalScore = (level - 1) * 100 + score;
      onScore(finalScore);
      return;
    }

    if (next.length === pattern.length) {
      playChime();
      const levelScore = level * 50;
      setScore(s => s + levelScore);
      setTimeout(() => setLevel(l => l + 1), 800);
    }
  };

  return (
    <div data-testid="mindful-pattern-game">
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Level {level}</span>
        <span className="text-xs" style={{ color: '#FCD34D' }}>Score: {score}</span>
      </div>
      <p className="text-sm mb-4 text-center" style={{ color: 'var(--text-secondary)' }}>
        {showingPattern ? 'Watch the pattern...' : gameOver ? 'Game over!' : 'Repeat the pattern'}
      </p>

      <div className="grid grid-cols-3 gap-2.5 max-w-[240px] mx-auto mb-6">
        {Array.from({ length: gridSize }).map((_, i) => (
          <motion.button key={i} onClick={() => tapCell(i)}
            whileTap={!showingPattern && !gameOver ? { scale: 0.9 } : {}}
            className="aspect-square rounded-xl transition-all duration-200"
            style={{
              background: activeCell === i ? `${cellColors[i]}30` : 'rgba(255,255,255,0.03)',
              border: `1px solid ${activeCell === i ? `${cellColors[i]}50` : 'rgba(255,255,255,0.06)'}`,
              boxShadow: activeCell === i ? `0 0 20px ${cellColors[i]}20` : 'none',
            }}
            data-testid={`pattern-cell-${i}`}
          />
        ))}
      </div>

      <div className="flex justify-center gap-1">
        {pattern.map((_, i) => (
          <div key={i} className="w-2 h-2 rounded-full" style={{
            background: i < userPattern.length
              ? (userPattern[i] === pattern[i] ? '#22C55E' : '#EF4444')
              : 'rgba(255,255,255,0.1)',
          }} />
        ))}
      </div>

      {gameOver && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-6 text-center mt-6">
          <p className="text-lg font-light mb-1" style={{ fontFamily: 'Cormorant Garamond, serif' }}>Mindful Focus</p>
          <p className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>Reached level {level} — Score: {(level - 1) * 100 + score}</p>
          <button onClick={() => { setLevel(1); setScore(0); setGameOver(false); }}
            className="text-xs flex items-center gap-1 mx-auto px-3 py-1.5 rounded-lg"
            style={{ color: '#2DD4BF', background: 'rgba(45,212,191,0.08)' }}
            data-testid="pattern-retry-btn">
            <RotateCcw size={11} /> Try Again
          </button>
        </motion.div>
      )}
    </div>
  );
}

// ============ GAME CATALOG ============
const GAMES = [
  {
    id: 'memory-match',
    title: 'Sacred Symbols',
    subtitle: 'Memory Match',
    desc: 'Flip cards to find matching sacred symbols. Trains memory, focus, and pattern recognition.',
    benefit: 'Enhances Memory',
    icon: Brain,
    color: '#D8B4FE',
    Component: MemoryMatch,
  },
  {
    id: 'breathing-bubble',
    title: 'Breath of Life',
    subtitle: 'Breathing Bubble',
    desc: 'Match your breath to expand a bubble to the target size. Deepens body awareness and relaxation.',
    benefit: 'Deep Relaxation',
    icon: Wind,
    color: '#2DD4BF',
    Component: BreathingBubble,
  },
  {
    id: 'color-harmony',
    title: 'Color Harmony',
    subtitle: 'Palette Sorter',
    desc: 'Arrange color gradients from dark to light. Sharpens visual perception and lifts mood.',
    benefit: 'Uplifts Mood',
    icon: Palette,
    color: '#FCD34D',
    Component: ColorHarmony,
  },
  {
    id: 'mindful-pattern',
    title: 'Inner Rhythm',
    subtitle: 'Pattern Recall',
    desc: 'Watch and repeat increasingly complex patterns. Builds focused attention and reduces mental noise.',
    benefit: 'Reduces Stress',
    icon: Zap,
    color: '#FB923C',
    Component: MindfulPattern,
  },
];

// ============ MAIN PAGE ============
export default function Games() {
  const { user, authHeaders, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [activeGame, setActiveGame] = useState(null);
  const [scores, setScores] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) { navigate('/auth'); return; }
    if (user) {
      axios.get(`${API}/games/scores`, { headers: authHeaders }).then(r => setScores(r.data.scores)).catch(() => {});
      // Auto check-in streak
      axios.post(`${API}/streak/checkin`, {}, { headers: authHeaders }).catch(() => {});
    }
  }, [user, authLoading, navigate, authHeaders]);

  const saveScore = useCallback(async (score) => {
    if (!activeGame || saving) return;
    setSaving(true);
    try {
      const res = await axios.post(`${API}/games/score`, { game_id: activeGame.id, score }, { headers: authHeaders });
      setScores(s => ({ ...s, [activeGame.id]: { best_score: res.data.best_score, total_plays: res.data.total_plays } }));
      if (score >= (scores[activeGame.id]?.best_score || 0)) {
        toast.success(`New best score: ${score}!`);
      }
    } catch {
      /* ignore */
    } finally {
      setSaving(false);
    }
  }, [activeGame, authHeaders, saving, scores]);

  if (authLoading) return null;

  // Game view
  if (activeGame) {
    const GameComponent = activeGame.Component;
    return (
      <div className="min-h-screen px-6 md:px-12 lg:px-24 py-12" style={{ background: 'transparent' }}>
        <div className="max-w-2xl mx-auto relative z-10">
          <button onClick={() => setActiveGame(null)}
            className="flex items-center gap-2 text-xs mb-8 group" style={{ color: 'var(--text-muted)' }}
            data-testid="game-back-btn">
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> All Games
          </button>
          <div className="mb-6">
            <span className="text-[10px] uppercase tracking-[0.2em] font-bold" style={{ color: activeGame.color }}>{activeGame.benefit}</span>
            <h2 className="text-2xl md:text-3xl font-light mt-1" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
              {activeGame.title}
            </h2>
            {scores[activeGame.id] && (
              <p className="text-xs mt-1 flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
                <Trophy size={11} style={{ color: '#FCD34D' }} /> Best: {scores[activeGame.id].best_score} | Played: {scores[activeGame.id].total_plays}x
              </p>
            )}
          </div>
          <GameComponent onScore={saveScore} />
        </div>
      </div>
    );
  }

  // Game list
  return (
    <div className="min-h-screen px-6 md:px-12 lg:px-24 py-12" style={{ background: 'transparent' }} data-testid="games-page">
      <div className="max-w-5xl mx-auto relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-xs font-bold uppercase tracking-[0.3em] mb-4" style={{ color: '#FCD34D' }}>
            <Gamepad2 size={14} className="inline mr-2" /> Wellness Games
          </p>
          <h1 className="text-4xl md:text-5xl font-light tracking-tight mb-4" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
            Play Your Way to Peace
          </h1>
          <p className="text-base mb-10 max-w-xl" style={{ color: 'var(--text-secondary)' }}>
            Games designed to sharpen your mind, deepen your breath, and brighten your mood. Each one is a mini-meditation in disguise.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {GAMES.map((game, i) => {
            const Icon = game.icon;
            const s = scores[game.id];
            return (
              <motion.button key={game.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.08 }}
                onClick={() => setActiveGame(game)}
                className="glass-card p-6 text-left group hover:scale-[1.02] transition-all"
                data-testid={`game-card-${game.id}`}>
                <div className="flex items-start justify-between mb-4">
                  <div className="w-11 h-11 rounded-2xl flex items-center justify-center"
                    style={{ background: `${game.color}12`, border: `1px solid ${game.color}20` }}>
                    <Icon size={20} style={{ color: game.color }} />
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-bold"
                    style={{ background: `${game.color}10`, color: game.color }}>
                    {game.benefit}
                  </span>
                </div>
                <h3 className="text-lg font-light mb-0.5" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                  {game.title}
                </h3>
                <p className="text-[10px] mb-2" style={{ color: game.color }}>{game.subtitle}</p>
                <p className="text-xs mb-4" style={{ color: 'var(--text-secondary)' }}>{game.desc}</p>
                <div className="flex items-center justify-between">
                  {s ? (
                    <span className="text-[10px] flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
                      <Trophy size={10} style={{ color: '#FCD34D' }} /> Best: {s.best_score} | {s.total_plays}x played
                    </span>
                  ) : (
                    <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Not played yet</span>
                  )}
                  <ChevronRight size={14} style={{ color: 'var(--text-muted)' }}
                    className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
