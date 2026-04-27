/**
 * StarseedRPGEngine.js — Render-Mode Adapter
 *
 * Pulls the Starseed Adventure RPG into the matrix slot. The RPG
 * runs in the same coordinate space as the lattice — no portal,
 * no overlay, no separate page chrome.
 */
import React from 'react';
import StarseedAdventure from '../pages/StarseedAdventure';

export default function StarseedRPGEngine() {
  return <StarseedAdventure />;
}
