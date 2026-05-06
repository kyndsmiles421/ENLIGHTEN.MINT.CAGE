/**
 * HelixNavPage.js — V1.0.17 entry point for the 9×9 Sovereign Helix.
 *
 * Renders the 3D HelixNav3D component inline + a 2D fallback list of
 * routes underneath for accessibility/SEO and for users who can't (or
 * don't want to) interact with the WebGL canvas.
 */
import React from 'react';
import { Link } from 'react-router-dom';
import HelixNav3D from '../components/HelixNav3D';
import { MapPin, ChevronRight } from 'lucide-react';

const FALLBACK_LINKS = [
  ['/workshop/geology', 'Geology Workshop'],
  ['/workshop/carpentry', 'Carpentry Workshop'],
  ['/workshop/masonry', 'Masonry Workshop'],
  ['/workshop/culinary', 'Culinary Workshop'],
  ['/workshop/electrical', 'Electrical Workshop'],
  ['/workshop/plumbing', 'Plumbing Workshop'],
  ['/herbology', 'Herbology'],
  ['/aromatherapy', 'Aromatherapy'],
  ['/workshop/bible', 'Bible Study'],
  ['/academy', 'Academy'],
  ['/forge', 'The Forge'],
  ['/pricing', 'Sovereign Tiers'],
  ['/sovereign-hub', 'Sovereign Hub'],
  ['/starseed-adventure', 'Starseed'],
];

export default function HelixNavPage() {
  return (
    <div
      data-testid="helix-nav-page"
      style={{
        minHeight: '100vh',
        padding: '20px 16px 80px',
        background: 'var(--bg-primary, #02060f)',
        color: 'var(--text-primary, #e2e8f0)',
        maxWidth: 980,
        margin: '0 auto',
      }}
    >
      <h1 style={{
        fontFamily: 'Cormorant Garamond, serif',
        fontWeight: 300,
        fontSize: '1.75rem',
        marginBottom: 4,
      }}>
        9×9 Sovereign Helix
      </h1>
      <p style={{
        fontSize: 11,
        letterSpacing: 1.5,
        color: 'var(--text-muted, #94a3b8)',
        marginBottom: 20,
      }}>
        81-NODE NAVIGATION GRAPH · DRAG TO ORBIT · TAP NODE TO VECTOR-SHIFT
      </p>

      <HelixNav3D height={520} autoRotate />

      <div style={{ marginTop: 24 }}>
        <p style={{
          fontSize: 10,
          letterSpacing: 2,
          color: 'var(--text-muted, #94a3b8)',
          marginBottom: 10,
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
        }}>
          <MapPin size={11} /> ACCESSIBLE LIST FALLBACK
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 6 }}>
          {FALLBACK_LINKS.map(([route, label]) => (
            <Link
              key={route}
              to={route}
              data-testid={`helix-link-${route.replace(/\//g, '-')}`}
              style={{
                padding: '10px 12px',
                borderRadius: 8,
                background: 'rgba(196,181,253,0.04)',
                border: '1px solid rgba(196,181,253,0.12)',
                color: 'var(--text-secondary, #cbd5e1)',
                fontSize: 12,
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontFamily: 'monospace',
              }}
            >
              <span>{label}</span>
              <ChevronRight size={12} style={{ color: '#C4B5FD' }} />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
