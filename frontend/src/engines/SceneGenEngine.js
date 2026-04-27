/**
 * SceneGenEngine.js — Render-Mode Adapter
 *
 * Pulls the existing SceneGenerator component (visual scene
 * compositor) into the matrix slot via Direct State Substitution.
 * The SceneGenerator already lives in /components — no new logic.
 */
import React from 'react';
import SceneGenerator from '../components/SceneGenerator';

export default function SceneGenEngine() {
  return (
    <div style={{ padding: '12px 16px' }}>
      <SceneGenerator />
    </div>
  );
}
