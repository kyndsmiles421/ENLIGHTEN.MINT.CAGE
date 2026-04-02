import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AbyssSatellite } from './AbyssSatellite';
import { WEATHER_EFFECTS } from './constants';

export function CentralOrb({ pulseColor, abyssOpen, dormantSats, onActivate, dormantCount, weatherCategory }) {
  const viewMin = Math.min(window.innerWidth, window.innerHeight);
  const abyssRadius = abyssOpen ? Math.min(560, Math.max(340, viewMin * 0.35)) : 0;
  const orbSize = abyssOpen ? abyssRadius * 2 : 130;

  const wx = WEATHER_EFFECTS[weatherCategory] || { pulseSpeed: 5, tint: pulseColor };
  const pSpeed = wx.pulseSpeed;

  return (
    <motion.div
      className="relative cursor-pointer"
      data-testid="central-orb"
      animate={{ width: orbSize, height: orbSize }}
      transition={{ type: 'spring', stiffness: 80, damping: 18 }}
      style={{ marginLeft: -(orbSize / 2), marginTop: -(orbSize / 2) }}
    >
      <AnimatePresence>
        {abyssOpen && (
          <motion.div
            className="absolute rounded-full"
            style={{ inset: 0 }}
            initial={{ opacity: 0, scale: 0.3 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.3 }}
            transition={{ type: 'spring', stiffness: 60, damping: 16 }}
          >
            <div className="absolute inset-0 rounded-full"
              style={{
                background: `radial-gradient(circle, rgba(10,10,18,0.85) 30%, ${pulseColor}08 60%, transparent 80%)`,
                border: `1px solid ${pulseColor}10`,
                boxShadow: `inset 0 0 80px ${pulseColor}08, 0 0 60px ${pulseColor}06`,
              }} />

            {/* Sacred geometry rings */}
            {[0.25, 0.45, 0.65].map((r, i) => (
              <motion.div key={i} className="absolute rounded-full"
                style={{
                  left: `${50 - r * 50}%`, top: `${50 - r * 50}%`,
                  width: `${r * 100}%`, height: `${r * 100}%`,
                  border: `1px dashed ${pulseColor}08`,
                }}
                animate={{ rotate: i % 2 === 0 ? 360 : -360 }}
                transition={{ duration: 60 + i * 20, repeat: Infinity, ease: 'linear' }}
              />
            ))}

            {/* Surface tension ring */}
            <motion.div className="absolute rounded-full pointer-events-none"
              style={{
                left: '5%', top: '5%', width: '90%', height: '90%',
                border: `1px solid rgba(192,132,252,0.06)`,
              }}
              animate={{ scale: [1, 1.02, 1], opacity: [0.4, 0.8, 0.4] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            />

            {/* Dormant satellites in Fibonacci spiral */}
            {dormantSats.map((sat, i) => (
              <AbyssSatellite key={sat.id} sat={sat} index={i} total={dormantSats.length}
                onActivate={onActivate} abyssRadius={abyssRadius} />
            ))}

            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <p className="text-[9px] font-medium tracking-[0.2em] uppercase"
                  style={{ color: `${pulseColor}50` }}>The Abyss</p>
                <p className="text-[7px] mt-0.5" style={{ color: 'rgba(248,250,252,0.15)' }}>
                  Drag a module out to activate
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!abyssOpen && (
        <>
          <motion.div className="absolute inset-0 rounded-full"
            animate={{ boxShadow: [`0 0 40px ${pulseColor}15`, `0 0 60px ${pulseColor}25`, `0 0 40px ${pulseColor}15`] }}
            transition={{ duration: pSpeed, repeat: Infinity, ease: 'easeInOut' }} />

          <motion.div className="absolute rounded-full" style={{ inset: 6, border: `1px solid ${pulseColor}18` }}
            animate={{ rotate: 360 }} transition={{ duration: 40, repeat: Infinity, ease: 'linear' }} />

          <motion.div className="absolute rounded-full" style={{ inset: 14, border: `1px dashed ${pulseColor}10` }}
            animate={{ rotate: -360 }} transition={{ duration: 25, repeat: Infinity, ease: 'linear' }} />

          <motion.div className="absolute rounded-full flex items-center justify-center"
            style={{ inset: 22, background: `radial-gradient(circle at 38% 32%, ${pulseColor}35, ${pulseColor}10 55%, rgba(10,10,18,0.92) 85%)`, border: `1.5px solid ${pulseColor}25` }}
            animate={{ scale: [1, 1.04, 1] }} transition={{ duration: pSpeed, repeat: Infinity, ease: 'easeInOut' }}>
            {dormantSats.slice(0, 7).map((sat, i) => {
              const a = (i / 7) * Math.PI * 2;
              const dr = 14 + (i % 2) * 5;
              return (
                <motion.div key={sat.id} className="absolute rounded-full"
                  style={{ width: 3, height: 3, background: sat.color, left: '50%', top: '50%', marginLeft: -1.5, marginTop: -1.5 }}
                  animate={{ x: Math.cos(a) * dr, y: Math.sin(a) * dr, opacity: [0.2, 0.6, 0.2], scale: [0.7, 1.2, 0.7] }}
                  transition={{ duration: 3 + i * 0.5, repeat: Infinity, ease: 'easeInOut' }}
                />
              );
            })}
          </motion.div>

          <div className="absolute text-center w-full" style={{ bottom: -22 }}>
            <p className="text-[8px] font-medium tracking-[0.2em] uppercase" style={{ color: `${pulseColor}60` }}>
              Mission Control
            </p>
            {dormantCount > 0 && (
              <p className="text-[7px] font-mono" style={{ color: 'rgba(248,250,252,0.2)' }}>
                {dormantCount} dormant
              </p>
            )}
          </div>
        </>
      )}
    </motion.div>
  );
}
