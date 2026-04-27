/**
 * ForecastsEngine.js — Render-Mode Adapter
 *
 * Pulls the Forecasts page directly into the matrix render slot.
 * Same engine, same Resonance Field, only the render-mode changes.
 */
import React from 'react';
import Forecasts from '../pages/Forecasts';

export default function ForecastsEngine() {
  return <Forecasts />;
}
