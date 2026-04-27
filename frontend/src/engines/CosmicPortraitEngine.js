/**
 * CosmicPortraitEngine.js — Render-Mode Adapter
 *
 * Direct State Substitution: the matrix slot pulls the existing
 * CosmicProfile page body directly into the engine's stacking
 * context. No URL change. No DOM teardown. The Hub stays mounted;
 * only its render-mode mutates to project the cosmic portrait
 * onto the same coordinate system.
 */
import React from 'react';
import CosmicProfile from '../pages/CosmicProfile';

export default function CosmicPortraitEngine() {
  return <CosmicProfile />;
}
