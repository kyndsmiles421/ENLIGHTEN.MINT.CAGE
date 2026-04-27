/**
 * DreamVizEngine.js — Render-Mode Adapter
 *
 * Pulls the Dreams page (journal + visualization) into the matrix
 * slot via Direct State Substitution.
 */
import React from 'react';
import Dreams from '../pages/Dreams';

export default function DreamVizEngine() {
  return <Dreams />;
}
