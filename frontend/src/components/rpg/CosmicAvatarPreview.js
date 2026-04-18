/**
 * CosmicAvatarPreview — inline stylized humanoid silhouette that glows with
 * your equipped gear's rarity colors. Pure SVG, zero WebGL, instant render.
 *
 * Slots mapped:
 *   head     → glowing halo ring around the head
 *   body     → torso fill + shoulder highlight
 *   conduit  → orbiting ring at the heart/hands
 *   trinket  → floating gem beside the shoulder
 *
 * If a slot is empty, that element rests in a muted base color so the user
 * sees visible "progression" as they equip each piece.
 */
import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

const BASE = '#4B5568';       // Unequipped slot default (cool grey)
const BG_GRAD = 'radial-gradient(circle at 50% 55%, rgba(129,140,248,0.12) 0%, rgba(6,3,18,0.9) 72%)';

export default function CosmicAvatarPreview({ equipped = {}, size = 260 }) {
  const c = useMemo(() => ({
    head:    equipped?.head?.rarity_color    || BASE,
    body:    equipped?.body?.rarity_color    || BASE,
    conduit: equipped?.conduit?.rarity_color || BASE,
    trinket: equipped?.trinket?.rarity_color || BASE,
  }), [equipped]);

  const equippedCount = ['head','body','conduit','trinket'].filter(s => equipped?.[s]).length;

  return (
    <div
      data-testid="cosmic-avatar-preview"
      className="relative"
      style={{
        width: size, height: size, margin: '0 auto 12px',
        borderRadius: 16, overflow: 'hidden',
        background: BG_GRAD,
        border: '1px solid rgba(129,140,248,0.2)',
      }}
    >
      {/* Star field */}
      <svg
        viewBox="0 0 260 260" width="100%" height="100%"
        style={{ display: 'block' }}
        aria-label="Cosmic avatar preview"
      >
        <defs>
          <radialGradient id="halo" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0%"  stopColor={c.head} stopOpacity="0.9" />
            <stop offset="70%" stopColor={c.head} stopOpacity="0" />
          </radialGradient>
          <radialGradient id="body-grad" cx="0.5" cy="0.3" r="0.7">
            <stop offset="0%"  stopColor={c.body} stopOpacity="0.95" />
            <stop offset="100%" stopColor={c.body} stopOpacity="0.45" />
          </radialGradient>
          <filter id="soft-glow" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="4" />
          </filter>
          <filter id="sharp-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="1.2" />
          </filter>
        </defs>

        {/* Ambient stars */}
        {Array.from({ length: 28 }).map((_, i) => {
          // Deterministic pseudo-random so layout is stable across renders
          const seed = i * 9301 + 49297;
          const x = (seed % 250) + 5;
          const y = ((seed * 3) % 250) + 5;
          const r = 0.4 + ((seed * 7) % 10) / 12;
          const o = 0.3 + ((seed * 11) % 70) / 100;
          return <circle key={i} cx={x} cy={y} r={r} fill="#FFF" opacity={o} />;
        })}

        {/* Halo (head slot) */}
        <motion.circle
          cx="130" cy="76" r="56"
          fill="url(#halo)"
          animate={{ opacity: equipped?.head ? [0.75, 1, 0.75] : 0.35 }}
          transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Conduit ring (orbits at heart level) */}
        <motion.g
          style={{ transformOrigin: '130px 140px' }}
          animate={{ rotate: equipped?.conduit ? 360 : 0 }}
          transition={{ duration: equipped?.conduit ? 12 : 0, repeat: equipped?.conduit ? Infinity : 0, ease: 'linear' }}
        >
          <ellipse
            cx="130" cy="140" rx="62" ry="14"
            fill="none"
            stroke={c.conduit}
            strokeWidth={equipped?.conduit ? 2.4 : 1.4}
            strokeDasharray={equipped?.conduit ? '3 5' : '1 4'}
            opacity={equipped?.conduit ? 0.9 : 0.35}
            filter="url(#sharp-glow)"
          />
        </motion.g>

        {/* Body — torso + shoulders + arms */}
        <g>
          {/* Torso */}
          <path
            d="M 130 90 C 105 96 92 120 92 170 L 92 210 C 92 220 104 226 130 226 C 156 226 168 220 168 210 L 168 170 C 168 120 155 96 130 90 Z"
            fill="url(#body-grad)"
            stroke={c.body} strokeWidth="1.2" strokeOpacity="0.6"
          />
          {/* Shoulder crystals — glow from body rarity */}
          <circle cx="95" cy="124" r="6" fill={c.body} opacity={equipped?.body ? 0.8 : 0.3} filter="url(#sharp-glow)" />
          <circle cx="165" cy="124" r="6" fill={c.body} opacity={equipped?.body ? 0.8 : 0.3} filter="url(#sharp-glow)" />
        </g>

        {/* Head */}
        <circle cx="130" cy="76" r="22" fill={c.head} opacity={equipped?.head ? 0.95 : 0.7} />
        <circle cx="130" cy="76" r="22" fill="none" stroke={c.head} strokeWidth="1.2" strokeOpacity="0.9" />
        {/* Head accent gem */}
        {equipped?.head && (
          <motion.circle
            cx="130" cy="65" r="2.5" fill="#FFF"
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 2.4, repeat: Infinity }}
          />
        )}

        {/* Trinket — floating gem */}
        <motion.g
          animate={equipped?.trinket ? { y: [-3, 3, -3] } : { y: 0 }}
          transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
        >
          <polygon
            points="205,108 214,115 205,135 196,115"
            fill={c.trinket}
            opacity={equipped?.trinket ? 0.95 : 0.35}
            filter="url(#sharp-glow)"
          />
          <polygon
            points="205,108 214,115 205,135 196,115"
            fill="none"
            stroke={c.trinket} strokeWidth="0.8" strokeOpacity="0.9"
          />
        </motion.g>

        {/* Progress pip bar bottom */}
        <g transform="translate(76, 244)">
          {[0,1,2,3].map(i => (
            <rect
              key={i} x={i * 27} y="0" width="22" height="4" rx="2"
              fill={i < equippedCount ? '#F0C470' : 'rgba(255,255,255,0.12)'}
              opacity={i < equippedCount ? 0.95 : 0.6}
            />
          ))}
        </g>
      </svg>

      {/* Overlay label */}
      <div
        className="absolute top-2 left-3 text-[9px] uppercase tracking-widest"
        style={{ color: 'rgba(240,196,112,0.75)' }}
      >
        {equippedCount} / 4 attuned
      </div>
    </div>
  );
}
