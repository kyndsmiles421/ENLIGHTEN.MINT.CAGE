/**
 * AvatarGeneratorEngine.js — Render-Mode Adapter
 *
 * Direct State Substitution: when the processor is in AVATAR_GEN mode,
 * the matrix renders this component instead of the MiniLattice. We do
 * NOT rewrite AvatarCreator — we mount the existing page body directly
 * inside the matrix's stacking context. Same React tree, same coordinate
 * system, same ResonanceField backdrop.
 *
 * The lazy chunk for AvatarCreator was already split out by webpack via
 * App.js's `const AvatarCreator = lazy(...)`, so this adapter doesn't
 * add any bundle weight to the IDLE path.
 */
import React from 'react';
import AvatarCreator from '../pages/AvatarCreator';

export default function AvatarGeneratorEngine() {
  return <AvatarCreator />;
}
