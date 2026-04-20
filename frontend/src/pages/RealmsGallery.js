/**
 * RealmsGallery.js — V68.23 Gamified Universe Showcase
 *
 * The user pointed out (correctly): the app already contains a full
 * gamified virtual-reality universe — AI-scene story RPGs, multiverse
 * star maps, dream realms, cryptic quests, mini-game arcades, character
 * progression — but it was buried as small text labels in the Hub menus.
 *
 * This page puts ALL of it front-and-center with large visual cards,
 * giving users a single "⚔ REALMS" destination to play everything.
 * Every card routes to a page that already exists and already works:
 *
 *   ⚔  /starseed-adventure  → AI-generated scene RPG with character select
 *   🌌  /starseed-worlds     → Multiverse star-map realm explorer
 *   ⟲  /starseed-realm      → Single-realm deep explore
 *   ♾  /multiverse-realms   → Multiverse gateway
 *   ☾  /dream-realms        → Dream-state adventure
 *   ◈  /cryptic-quest       → Hidden terminal quest nodes
 *   ⚙  /rpg                 → Character sheet + XP + equipment
 *   ▲  /starseed            → Origin story
 *   🎮  /games               → Arcade mini-games (Memory, Brain, etc.)
 *
 * Data-testids are added to every card so QA + testing agents can verify.
 */
import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Swords, Globe, Orbit, Infinity as InfIcon, Moon,
  Gem, Gamepad2, User, Sparkles, Compass, Zap,
} from 'lucide-react';

const REALMS = [
  {
    id: 'starseed-adventure',
    title: 'Starseed Adventure',
    tagline: 'AI-Scene Story RPG',
    description: 'Pick a character, enter an AI-generated scene, make choices that shape the cosmos.',
    route: '/starseed-adventure',
    color: '#A855F7',
    Icon: Swords,
    featured: true,
  },
  {
    id: 'starseed-worlds',
    title: 'Starseed Worlds',
    tagline: 'Multiverse Star-Map',
    description: 'Explore every Starseed realm in an interactive star map. Unlock realms, collect relics.',
    route: '/starseed-worlds',
    color: '#38BDF8',
    Icon: Globe,
    featured: true,
  },
  {
    id: 'dream-realms',
    title: 'Dream Realms',
    tagline: 'Lucid Dream Adventures',
    description: 'Enter the dreamscape. Symbolic quests, subconscious discoveries, XP for deep work.',
    route: '/dream-realms',
    color: '#C084FC',
    Icon: Moon,
  },
  {
    id: 'cryptic-quest',
    title: 'Cryptic Quests',
    tagline: 'Hidden Terminal Nodes',
    description: 'Decode cryptic terminal glyphs scattered across the app. Each solved node = rare loot.',
    route: '/cryptic-quest',
    color: '#22C55E',
    Icon: Compass,
  },
  {
    id: 'multiverse-realms',
    title: 'Multiverse Realms',
    tagline: 'Dimensional Gateway',
    description: 'Step between parallel realms. Each has its own physics, lore, and combat.',
    route: '/multiverse-realms',
    color: '#EC4899',
    Icon: InfIcon,
  },
  {
    id: 'rpg',
    title: 'Character Sheet',
    tagline: 'Your Sovereign Build',
    description: 'Your stats, equipment, classes, and XP progression. The anchor of your journey.',
    route: '/rpg',
    color: '#F59E0B',
    Icon: User,
  },
  {
    id: 'games',
    title: 'Arcade',
    tagline: 'Mini-Games',
    description: 'Memory match, breath rhythm, color harmony, brain challenges. Earn Sparks by play.',
    route: '/games',
    color: '#FB923C',
    Icon: Gamepad2,
  },
  {
    id: 'starseed',
    title: 'Origin Story',
    tagline: 'Where It All Began',
    description: 'The creation myth of the Sovereign Universe. Read it, live it, remember.',
    route: '/starseed',
    color: '#D4AF37',
    Icon: Sparkles,
  },
  {
    id: 'starseed-realm',
    title: 'Realm: Deep Focus',
    tagline: 'Single-Realm Dive',
    description: 'Pick one realm and stay. Deeper chains of quests, rarer drops, weekly rotations.',
    route: '/starseed-realm',
    color: '#2DD4BF',
    Icon: Orbit,
  },
];

export default function RealmsGallery() {
  const navigate = useNavigate();
  const featured = useMemo(() => REALMS.filter(r => r.featured), []);
  const rest = useMemo(() => REALMS.filter(r => !r.featured), []);

  return (
    <div
      data-testid="realms-gallery-page"
      style={{
        minHeight: '100vh',
        background: 'radial-gradient(ellipse at top, #1a0033 0%, #050510 40%, #000 100%)',
        color: '#fff',
        paddingBottom: 180,
      }}
    >
      {/* Header */}
      <div style={{ padding: '24px 20px 8px 20px', display: 'flex', alignItems: 'center', gap: 14, maxWidth: 1200, margin: '0 auto' }}>
        <button
          type="button"
          onClick={() => navigate('/sovereign-hub')}
          data-testid="realms-back"
          style={{
            background: 'transparent', border: '1px solid rgba(168,85,247,0.4)',
            color: '#C084FC', padding: '6px 12px', borderRadius: 6, cursor: 'pointer',
            display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11,
            fontFamily: 'monospace', letterSpacing: '1.5px',
          }}
        >
          <ArrowLeft size={14} /> HUB
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Zap size={18} style={{ color: '#C084FC' }} />
          <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 28, letterSpacing: 2, margin: 0, fontWeight: 300 }}>
            REALMS
          </h1>
        </div>
      </div>
      <div style={{ padding: '0 20px 20px 20px', maxWidth: 1200, margin: '0 auto' }}>
        <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13, maxWidth: 640, fontFamily: 'monospace' }}>
          The gamified universe. Story RPGs, dream quests, multiverse explorers, arcade challenges — all earning Sparks ✨ toward your sovereign rank. <em style={{ opacity: 0.6 }}>(Sparks are XP, never currency.)</em>
        </p>
      </div>

      {/* Featured (large 2-up) */}
      <div style={{ padding: '0 20px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16, marginBottom: 28 }}>
          {featured.map((r) => (
            <RealmCard key={r.id} realm={r} onClick={() => navigate(r.route)} featured />
          ))}
        </div>

        {/* Remaining (grid) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
          {rest.map((r) => (
            <RealmCard key={r.id} realm={r} onClick={() => navigate(r.route)} />
          ))}
        </div>
      </div>
    </div>
  );
}

function RealmCard({ realm, onClick, featured = false }) {
  const { Icon } = realm;
  return (
    <motion.button
      type="button"
      onClick={onClick}
      data-testid={`realm-card-${realm.id}`}
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 300, damping: 22 }}
      style={{
        position: 'relative',
        background: `linear-gradient(135deg, ${realm.color}22 0%, rgba(0,0,0,0.6) 70%)`,
        border: `1px solid ${realm.color}66`,
        borderRadius: 14,
        padding: featured ? '26px 22px' : '20px 16px',
        minHeight: featured ? 180 : 160,
        color: '#fff',
        textAlign: 'left',
        cursor: 'pointer',
        boxShadow: `0 6px 32px ${realm.color}20`,
        overflow: 'hidden',
      }}
    >
      {/* Accent sheen */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: `radial-gradient(circle at 100% 0%, ${realm.color}33 0%, transparent 45%)`,
      }} />
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          <div style={{
            width: featured ? 44 : 36, height: featured ? 44 : 36,
            borderRadius: 10, background: `${realm.color}26`, border: `1px solid ${realm.color}99`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: `0 0 14px ${realm.color}55`,
          }}>
            <Icon size={featured ? 22 : 18} color={realm.color} />
          </div>
          <span style={{ fontSize: 9, letterSpacing: '2px', color: realm.color, fontFamily: 'monospace', textTransform: 'uppercase' }}>
            {realm.tagline}
          </span>
        </div>
        <h3 style={{
          fontSize: featured ? 24 : 18,
          fontFamily: 'Cormorant Garamond, serif',
          fontWeight: 300, letterSpacing: 0.5,
          margin: 0, marginBottom: 8, color: '#fff',
        }}>
          {realm.title}
        </h3>
        <p style={{
          fontSize: 12, lineHeight: 1.55, color: 'rgba(255,255,255,0.65)',
          margin: 0, flex: 1,
        }}>
          {realm.description}
        </p>
        <div style={{
          marginTop: 12, fontSize: 10, letterSpacing: 2, fontFamily: 'monospace',
          color: realm.color, display: 'inline-flex', alignItems: 'center', gap: 5, fontWeight: 700,
        }}>
          ENTER <span style={{ fontSize: 14 }}>→</span>
        </div>
      </div>
    </motion.button>
  );
}
