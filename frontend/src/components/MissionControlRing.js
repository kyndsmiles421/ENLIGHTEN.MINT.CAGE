import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Zap, Headphones, BookOpen, Sliders, X, Heart, Compass } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

/**
 * MissionControlRing — Radial arrangement of important action buttons
 * around a central hub, replacing cluttered bottom-right stacking.
 * 
 * This component provides quick access to key features in a
 * visually organized circular layout.
 * 
 * Only shows on /dashboard to replace the cluttered floating buttons.
 */

const RING_ACTIONS = [
  { id: 'assistant', icon: MessageCircle, label: 'Cosmos', color: '#818CF8', description: 'AI Assistant' },
  { id: 'command', icon: Zap, label: 'Command', color: '#8B5CF6', description: 'Quick Actions' },
  { id: 'frequency', icon: Headphones, label: 'Frequency', color: '#2DD4BF', description: '30s Calm' },
  { id: 'journal', icon: BookOpen, label: 'Journal', color: '#86EFAC', description: 'Quick Entry' },
  { id: 'mood', icon: Heart, label: 'Mood', color: '#FDA4AF', description: 'How you feel' },
  { id: 'mixer', icon: Sliders, label: 'Mixer', color: '#FB923C', description: 'Sound Layers' },
];

export default function MissionControlRing({ onOpenAssistant, onOpenCommand, onOpenFrequency, onOpenMixer }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [expanded, setExpanded] = useState(false);
  const [hoveredAction, setHoveredAction] = useState(null);

  const handleAction = useCallback((id) => {
    switch (id) {
      case 'assistant':
        onOpenAssistant?.();
        break;
      case 'command':
        onOpenCommand?.();
        break;
      case 'frequency':
        onOpenFrequency?.();
        break;
      case 'mixer':
        onOpenMixer?.();
        break;
      case 'journal':
        navigate('/journal');
        break;
      case 'mood':
        navigate('/mood');
        break;
      default:
        break;
    }
    setExpanded(false);
  }, [onOpenAssistant, onOpenCommand, onOpenFrequency, onOpenMixer, navigate]);

  // Calculate radial positions
  const getPosition = (index, total, radius) => {
    const startAngle = -Math.PI / 2; // Start from top
    const angle = startAngle + (index / total) * Math.PI * 2;
    return {
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius,
    };
  };

  const ringRadius = 70; // pixels from center

  // Only show on dashboard
  if (location.pathname !== '/dashboard') return null;

  return (
    <div 
      className="fixed z-[102]"
      style={{
        bottom: 140,
        right: 24,
      }}
      data-testid="mission-control-ring"
    >
      {/* Expanded Ring */}
      <AnimatePresence>
        {expanded && (
          <>
            {/* Background blur overlay */}
            <motion.div
              className="fixed inset-0 z-[94]"
              style={{ background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(4px)' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setExpanded(false)}
            />

            {/* Orbital ring guide */}
            <motion.div
              className="absolute rounded-full pointer-events-none"
              style={{
                width: ringRadius * 2 + 52,
                height: ringRadius * 2 + 52,
                left: -ringRadius - 26 + 26,
                top: -ringRadius - 26 + 26,
                border: '1px dashed rgba(192,132,252,0.15)',
              }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
            />

            {/* Action buttons in ring */}
            {RING_ACTIONS.map((action, idx) => {
              const pos = getPosition(idx, RING_ACTIONS.length, ringRadius);
              const Icon = action.icon;
              const isHovered = hoveredAction === action.id;

              return (
                <motion.button
                  key={action.id}
                  className="absolute z-[96] w-11 h-11 rounded-full flex items-center justify-center"
                  style={{
                    left: pos.x + 26 - 22,
                    top: pos.y + 26 - 22,
                    background: isHovered ? `${action.color}25` : 'rgba(12,14,24,0.95)',
                    border: `1.5px solid ${isHovered ? action.color : action.color + '40'}`,
                    boxShadow: isHovered
                      ? `0 0 20px ${action.color}30, 0 4px 16px rgba(0,0,0,0.4)`
                      : '0 4px 16px rgba(0,0,0,0.4)',
                    backdropFilter: 'blur(16px)',
                  }}
                  initial={{ opacity: 0, scale: 0, x: -pos.x, y: -pos.y }}
                  animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
                  exit={{ opacity: 0, scale: 0, x: -pos.x, y: -pos.y }}
                  transition={{ 
                    type: 'spring', 
                    stiffness: 400, 
                    damping: 20,
                    delay: idx * 0.04 
                  }}
                  onClick={() => handleAction(action.id)}
                  onMouseEnter={() => setHoveredAction(action.id)}
                  onMouseLeave={() => setHoveredAction(null)}
                  data-testid={`ring-${action.id}`}
                >
                  <Icon size={18} style={{ color: action.color }} />
                </motion.button>
              );
            })}

            {/* Tooltip */}
            <AnimatePresence>
              {hoveredAction && (
                <motion.div
                  className="absolute z-[97] px-3 py-1.5 rounded-lg pointer-events-none"
                  style={{
                    left: 26 - 50,
                    top: -ringRadius - 40,
                    background: 'rgba(12,14,24,0.95)',
                    border: '1px solid rgba(248,250,252,0.1)',
                    backdropFilter: 'blur(12px)',
                    minWidth: 100,
                    textAlign: 'center',
                  }}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                >
                  <p className="text-[10px] font-medium" style={{ color: RING_ACTIONS.find(a => a.id === hoveredAction)?.color }}>
                    {RING_ACTIONS.find(a => a.id === hoveredAction)?.label}
                  </p>
                  <p className="text-[8px]" style={{ color: 'rgba(248,250,252,0.4)' }}>
                    {RING_ACTIONS.find(a => a.id === hoveredAction)?.description}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </AnimatePresence>

      {/* Central Hub Button */}
      <motion.button
        className="relative z-[96] w-[52px] h-[52px] rounded-full flex items-center justify-center"
        style={{
          background: expanded 
            ? 'rgba(239,68,68,0.15)' 
            : 'linear-gradient(135deg, rgba(192,132,252,0.2), rgba(129,140,248,0.15))',
          border: expanded 
            ? '1.5px solid rgba(239,68,68,0.4)' 
            : '1.5px solid rgba(192,132,252,0.25)',
          boxShadow: expanded
            ? '0 0 24px rgba(239,68,68,0.2), 0 4px 20px rgba(0,0,0,0.4)'
            : '0 0 24px rgba(192,132,252,0.15), 0 4px 20px rgba(0,0,0,0.4)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
        }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        onClick={() => setExpanded(!expanded)}
        data-testid="mission-control-hub"
      >
        <AnimatePresence mode="wait">
          {expanded ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <X size={22} style={{ color: '#EF4444' }} />
            </motion.div>
          ) : (
            <motion.div
              key="open"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <Compass size={22} style={{ color: '#C084FC' }} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pulse ring when collapsed */}
        {!expanded && (
          <motion.div
            className="absolute inset-0 rounded-full pointer-events-none"
            style={{ border: '1px solid rgba(192,132,252,0.3)' }}
            animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0, 0.4] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          />
        )}
      </motion.button>

      {/* Small label below hub */}
      <motion.p
        className="text-center mt-1.5 pointer-events-none"
        style={{ fontSize: 8, color: 'rgba(248,250,252,0.25)', letterSpacing: '0.1em' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        ACTIONS
      </motion.p>
    </div>
  );
}
