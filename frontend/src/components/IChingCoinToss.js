/**
 * IChing CoinToss.js — V56.1 Interactive Hexagram Builder
 * 
 * Yarrow stalk probability model (traditional):
 *   Old Yin (6):   1/16 = 6.25%   — broken, changing
 *   Young Yang (7): 5/16 = 31.25%  — solid, stable
 *   Young Yin (8):  7/16 = 43.75%  — broken, stable
 *   Old Yang (9):   3/16 = 18.75%  — solid, changing
 * 
 * The user tosses 3 coins per line × 6 lines = 18 coin tosses.
 * Each toss animates with 3D coin flip. Lines build bottom-up.
 * After 6 lines, the hexagram is complete and the reading fires.
 */
import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Coins, RotateCcw } from 'lucide-react';

const PHI = 1.618033988749895;

// Yarrow stalk probabilities (more authentic than coin)
function yarrowLine() {
  const r = Math.random();
  if (r < 0.0625) return 6;       // Old Yin — broken, changing
  if (r < 0.0625 + 0.3125) return 7;  // Young Yang — solid, stable
  if (r < 0.0625 + 0.3125 + 0.4375) return 8; // Young Yin — broken, stable
  return 9;                        // Old Yang — solid, changing
}

// Visual coin that flips
function CoinFlip({ result, index, tossing }) {
  const isHeads = result === 3; // heads = 3, tails = 2
  return (
    <motion.div
      initial={{ rotateX: 0, scale: 0.5, opacity: 0 }}
      animate={tossing ? {
        rotateX: [0, 720, 1080, 1440],
        scale: [0.5, 1.2, 1.1, 1],
        opacity: 1,
        y: [0, -30, -10, 0],
      } : { rotateX: 0, scale: 1, opacity: 1 }}
      transition={{ duration: tossing ? 0.8 : 0.3, delay: index * 0.15 }}
      className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm"
      style={{
        background: isHeads
          ? 'linear-gradient(135deg, #FCD34D, #FBBF24, #F59E0B)'
          : 'linear-gradient(135deg, #9CA3AF, #6B7280, #4B5563)',
        border: `2px solid ${isHeads ? '#FCD34D60' : '#6B728060'}`,
        boxShadow: isHeads
          ? '0 0 15px rgba(252,211,77,0.3), inset 0 -2px 4px rgba(0,0,0,0.2)'
          : '0 0 10px rgba(107,114,128,0.2), inset 0 -2px 4px rgba(0,0,0,0.3)',
        color: isHeads ? '#1a1a2e' : '#e5e7eb',
        transformStyle: 'preserve-3d',
      }}
      data-testid={`coin-${index}`}
    >
      {result !== null ? (isHeads ? '☰' : '☷') : '?'}
    </motion.div>
  );
}

// A single hexagram line (solid or broken)
function HexagramLine({ value, index, active, total }) {
  const yang = value === 7 || value === 9;
  const changing = value === 6 || value === 9;
  const lineColor = changing ? '#FBBF24' : '#2DD4BF';
  const opacity = active ? 1 : value ? 0.6 : 0.15;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity, x: 0 }}
      transition={{ delay: (total - 1 - index) * 0.1, duration: 0.4 }}
      className="flex items-center gap-2"
      data-testid={`hex-line-${index}`}
    >
      <span className="text-[8px] font-mono w-4 text-right" style={{ color: 'rgba(255,255,255,0.3)' }}>
        {index + 1}
      </span>
      {yang ? (
        <div className="flex-1 h-4 rounded-full" style={{
          background: lineColor,
          boxShadow: active ? `0 0 12px ${lineColor}50` : 'none',
          maxWidth: 180,
        }} />
      ) : (
        <div className="flex-1 flex gap-3" style={{ maxWidth: 180 }}>
          <div className="flex-1 h-4 rounded-full" style={{
            background: lineColor,
            boxShadow: active ? `0 0 12px ${lineColor}50` : 'none',
          }} />
          <div className="flex-1 h-4 rounded-full" style={{
            background: lineColor,
            boxShadow: active ? `0 0 12px ${lineColor}50` : 'none',
          }} />
        </div>
      )}
      {changing && value !== null && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="text-[9px] font-bold"
          style={{ color: '#FBBF24' }}
        >
          *
        </motion.span>
      )}
      {value !== null && (
        <span className="text-[8px] font-mono ml-1" style={{ color: 'rgba(255,255,255,0.3)' }}>
          {value === 6 ? 'Old Yin' : value === 7 ? 'Yang' : value === 8 ? 'Yin' : 'Old Yang'}
        </span>
      )}
    </motion.div>
  );
}

/**
 * IChingCoinToss — Full interactive hexagram builder
 * 
 * Props:
 *   onComplete(lines) — called when all 6 lines are cast
 *   color — accent color
 */
export default function IChingCoinToss({ onComplete, color = '#2DD4BF' }) {
  const [lines, setLines] = useState([null, null, null, null, null, null]);
  const [currentLine, setCurrentLine] = useState(0);
  const [coins, setCoins] = useState([null, null, null]);
  const [tossing, setTossing] = useState(false);
  const [phase, setPhase] = useState('ready'); // ready | tossing | line-done | complete

  const tossCoins = useCallback(() => {
    if (tossing || currentLine >= 6) return;
    setTossing(true);
    setPhase('tossing');

    // Simulate 3 coin tosses (heads=3, tails=2)
    const tosses = [
      Math.random() > 0.5 ? 3 : 2,
      Math.random() > 0.5 ? 3 : 2,
      Math.random() > 0.5 ? 3 : 2,
    ];

    // Animate coins appearing
    setCoins([null, null, null]);
    setTimeout(() => setCoins([tosses[0], null, null]), 200);
    setTimeout(() => setCoins([tosses[0], tosses[1], null]), 400);
    setTimeout(() => {
      setCoins(tosses);

      // Use yarrow stalk probabilities for the line value
      const lineValue = yarrowLine();

      setTimeout(() => {
        setLines(prev => {
          const next = [...prev];
          next[currentLine] = lineValue;
          return next;
        });
        setCurrentLine(c => c + 1);
        setTossing(false);
        setPhase(currentLine + 1 >= 6 ? 'complete' : 'line-done');

        // If complete, fire callback
        if (currentLine + 1 >= 6) {
          const finalLines = [...lines];
          finalLines[currentLine] = lineValue;
          setTimeout(() => onComplete?.(finalLines), 800);
        }

        // Reset coins after a beat
        setTimeout(() => setCoins([null, null, null]), 1500);
      }, 600);
    }, 600);
  }, [tossing, currentLine, lines, onComplete]);

  const reset = () => {
    setLines([null, null, null, null, null, null]);
    setCurrentLine(0);
    setCoins([null, null, null]);
    setTossing(false);
    setPhase('ready');
  };

  return (
    <div className="space-y-6" data-testid="iching-coin-toss">
      {/* Hexagram building from bottom up */}
      <div className="flex flex-col-reverse gap-2 py-4">
        {lines.map((value, i) => (
          <HexagramLine
            key={i}
            value={value}
            index={i}
            active={i === currentLine}
            total={6}
          />
        ))}
      </div>

      {/* Coin toss area */}
      <div className="flex flex-col items-center gap-4">
        <div className="flex items-center gap-4">
          {coins.map((c, i) => (
            <CoinFlip key={i} result={c} index={i} tossing={tossing && c !== null} />
          ))}
        </div>

        <p className="text-[10px] font-mono" style={{ color: 'rgba(255,255,255,0.4)' }}>
          {phase === 'ready' && `Line ${currentLine + 1} of 6 — Toss the coins`}
          {phase === 'tossing' && 'The coins are in the air...'}
          {phase === 'line-done' && `Line ${currentLine} cast — ${currentLine < 6 ? `${6 - currentLine} remaining` : ''}`}
          {phase === 'complete' && 'The hexagram is complete'}
        </p>

        {phase !== 'complete' ? (
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={tossCoins}
            disabled={tossing}
            className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-medium"
            style={{
              background: tossing ? 'rgba(255,255,255,0.03)' : `${color}15`,
              border: `1px solid ${tossing ? 'rgba(255,255,255,0.06)' : `${color}30`}`,
              color: tossing ? 'rgba(255,255,255,0.3)' : color,
              boxShadow: tossing ? 'none' : `0 0 20px ${color}15`,
              cursor: tossing ? 'not-allowed' : 'pointer',
            }}
            data-testid="toss-coins-btn"
          >
            <Coins size={16} />
            {tossing ? 'Tossing...' : `Cast Line ${currentLine + 1}`}
          </motion.button>
        ) : (
          <div className="flex items-center gap-3">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="px-4 py-2 rounded-xl text-xs font-bold"
              style={{ background: `${color}15`, border: `1px solid ${color}30`, color }}
            >
              Hexagram Cast — Reading the Oracle...
            </motion.div>
            <button onClick={reset} className="p-2 rounded-lg" style={{ color: 'rgba(255,255,255,0.4)' }}>
              <RotateCcw size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
