import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { useMixer } from '../context/MixerContext';
import { Orbit } from 'lucide-react';
import MissionControl from './MissionControl';

export default function OrbCorner() {
  const navigate = useNavigate();
  const location = useLocation();
  const { activeFrequencies } = useMixer();
  const [missionControlOpen, setMissionControlOpen] = useState(false);

  // Hide on hub page itself, landing, and auth
  const hiddenPaths = ['/hub', '/', '/auth', '/intro'];
  if (hiddenPaths.includes(location.pathname)) return null;

  const pulseColor = activeFrequencies?.length > 0 ? '#A78BFA' : '#2DD4BF';

  return (
    <>
      <motion.button
        className="fixed z-[45] rounded-full flex items-center justify-center"
        style={{
          bottom: 80,
          left: 20,
          width: 44,
          height: 44,
          background: `radial-gradient(circle at 40% 35%, ${pulseColor}25, rgba(10,10,18,0.85) 70%)`,
          border: `1px solid ${pulseColor}20`,
          boxShadow: `0 0 20px ${pulseColor}10`,
          backdropFilter: 'blur(12px)',
        }}
        animate={{
          scale: [1, 1.04, 1],
          boxShadow: [
            `0 0 15px ${pulseColor}10`,
            `0 0 25px ${pulseColor}18`,
            `0 0 15px ${pulseColor}10`,
          ],
        }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        onClick={() => navigate('/hub')}
        onContextMenu={(e) => { e.preventDefault(); setMissionControlOpen(true); }}
        whileHover={{ scale: 1.12 }}
        whileTap={{ scale: 0.92 }}
        data-testid="orb-corner"
        title="Return to Hub (right-click for Mission Control)"
      >
        <Orbit size={18} style={{ color: pulseColor, opacity: 0.8 }} />
      </motion.button>

      <MissionControl
        isOpen={missionControlOpen}
        onClose={() => setMissionControlOpen(false)}
      />
    </>
  );
}
