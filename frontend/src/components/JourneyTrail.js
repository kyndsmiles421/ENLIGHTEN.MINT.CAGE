/**
 * JourneyTrail.js — V68.6 Sovereign Journey
 *
 * Horizontal breadcrumb rail mounted on the Sovereign Hub above the pillars.
 * Displays the last 5 visited routes/scenes. One-tap re-entry restores the
 * user to their previous session (the route itself keeps its state).
 *
 * Respects the Flatland Rule: pure inline component, no modals/overlays.
 * Zero bundle bloat — reads a single localStorage key, no backend calls.
 */
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Footprints, ArrowRight } from 'lucide-react';
import { useSovereignJourney } from '../context/JourneyContext';

// Friendly display names for common routes — short, sovereign-styled
const ROUTE_LABELS = {
  '/sovereign-hub': 'Hub',
  '/academy': 'Academy',
  '/meditation': 'Meditation',
  '/breathing': 'Breathwork',
  '/soundscapes': 'Soundscapes',
  '/mudras': 'Mudras',
  '/crystals': 'Crystals',
  '/herbology': 'Herbology',
  '/elixirs': 'Elixirs',
  '/reiki': 'Reiki',
  '/aromatherapy': 'Aromatherapy',
  '/acupressure': 'Acupressure',
  '/nourishment': 'Nourishment',
  '/oracle': 'Oracle',
  '/multiverse-realms': 'Multiverse Realms',
  '/multiverse-map': 'Multiverse Map',
  '/dream-realms': 'Dream Realms',
  '/dimensional-space': 'Dimensional Space',
  '/tesseract': 'Tesseract',
  '/vr': 'VR Sanctuary',
  '/vr/celestial-dome': 'Celestial Dome',
  '/observatory': 'Observatory',
  '/star-chart': 'Star Chart',
  '/enlightenment-os': 'Enlightenment OS',
  '/trade-passport': 'Passport',
  '/membership': 'Membership',
  '/evolution-lab': 'Evolution Lab',
};

const ROUTE_COLORS = {
  '/tesseract': '#8B5CF6',
  '/vr/celestial-dome': '#3B82F6',
  '/observatory': '#D4AF37',
  '/vr': '#06B6D4',
  '/enlightenment-os': '#A78BFA',
  '/dream-realms': '#C084FC',
  '/star-chart': '#FBBF24',
  '/multiverse-realms': '#818CF8',
  '/dimensional-space': '#8B5CF6',
  '/mudras': '#22C55E',
  '/crystals': '#8B5CF6',
  '/herbology': '#22C55E',
  '/meditation': '#22C55E',
  '/breathing': '#10B981',
  '/soundscapes': '#F472B6',
  '/academy': '#FBBF24',
  '/oracle': '#C084FC',
};

function labelFor(path) {
  if (ROUTE_LABELS[path]) return ROUTE_LABELS[path];
  // /workshop/geology → "Geology Workshop"
  if (path.startsWith('/workshop/')) {
    const slug = path.slice('/workshop/'.length);
    return `${slug.charAt(0).toUpperCase()}${slug.slice(1)} Workshop`;
  }
  // fallback: last segment, Title Case
  const last = path.split('/').filter(Boolean).pop() || path;
  return last.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

function colorFor(path) {
  if (ROUTE_COLORS[path]) return ROUTE_COLORS[path];
  if (path.startsWith('/workshop/')) return '#D97706';
  return '#A78BFA';
}

export default function JourneyTrail() {
  const { trail } = useSovereignJourney();

  // Don't render if user has only been on the Hub
  if (!trail || trail.length === 0) return null;

  return (
    <div className="px-4 py-3" data-testid="journey-trail">
      <div className="flex items-center gap-2 mb-2 justify-center">
        <Footprints size={11} style={{ color: 'rgba(255,255,255,0.35)' }} />
        <span className="text-[9px] uppercase tracking-[0.22em]" style={{ color: 'rgba(255,255,255,0.4)' }}>
          Your Journey
        </span>
      </div>
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 justify-start md:justify-center"
        style={{ scrollbarWidth: 'none' }}>
        {trail.map((entry, i) => {
          const color = colorFor(entry.path);
          const isLast = i === trail.length - 1;
          return (
            <React.Fragment key={`${entry.path}-${i}`}>
              <motion.div
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <Link
                  to={entry.path}
                  className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-medium transition-all active:scale-[0.96] whitespace-nowrap"
                  style={{
                    background: `${color}0c`,
                    border: `1px solid ${color}26`,
                    color: color,
                    boxShadow: isLast ? `0 0 10px ${color}22` : 'none',
                  }}
                  data-testid={`journey-node-${i}`}
                  title={entry.path}
                >
                  <span>{labelFor(entry.path)}</span>
                  {entry.minutes > 0 && (
                    <span className="text-[8px] opacity-60">· {entry.minutes}m</span>
                  )}
                </Link>
              </motion.div>
              {!isLast && (
                <ArrowRight size={9} style={{ color: 'rgba(255,255,255,0.2)', flexShrink: 0 }} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
