/**
 * StoryGenEngine.js — Render-Mode Adapter
 *
 * Pulls the Creation Stories generator into the matrix slot.
 * No new logic — just a doorway from the engine to existing
 * tooling that already lived in the codebase.
 */
import React from 'react';
import CreationStories from '../pages/CreationStories';

export default function StoryGenEngine() {
  return <CreationStories />;
}
