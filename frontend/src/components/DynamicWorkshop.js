/**
 * DynamicWorkshop.js — V62.0 Ghost Router
 * 
 * ONE ROUTE, INFINITE MODULES.
 * Reads moduleId from URL params, fetches config from the Master Registry,
 * and renders the UniversalWorkshop with the correct DNA.
 * 
 * Route: /workshop/:moduleId
 * No manual page files needed. Just add data to the registry.
 */
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Zap, Droplets, Leaf, Heart, BookOpen, Baby, Flame, Car, Apple, Brain, HandHeart, Wrench, Wind, Cpu, Cross, Eye, Hammer, Axe, Mic, Scale, GraduationCap, Activity, Cog } from 'lucide-react';
import UniversalWorkshop from './UniversalWorkshop';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

// Icon map — resolves string icon names from the registry to Lucide components
const ICON_MAP = {
  Zap, Droplets, Leaf, Heart, BookOpen, Baby, Flame, Car, Apple, Brain, HandHeart, Wrench, Wind, Cpu, Cross, Eye, Hammer, Axe, Mic, Scale, GraduationCap, Activity, Cog,
};

export default function DynamicWorkshop() {
  const { moduleId } = useParams();
  const [config, setConfig] = useState(null);
  const [error, setError] = useState(false);

  // V68.27 — Slug aliases keep friendlier URLs working without forcing
  // the backend registry to grow duplicates. Culinary / cooking /
  // baking all resolve to the Nutrition module (food + biochemistry),
  // which the UniversalWorkshop then themes with the KNEAD / STIR /
  // SHAPE mini-game via MODULE_GAME_THEME.
  const MODULE_ALIAS = {
    culinary: 'nutrition',
    cooking: 'nutrition',
    baking: 'nutrition',
    gardening: 'landscaping',
    herbalism: 'landscaping',
  };
  const effectiveId = MODULE_ALIAS[moduleId] || moduleId;

  useEffect(() => {
    setConfig(null);
    setError(false);
    axios.get(`${API}/workshop/registry`)
      .then(res => {
        const mod = res.data?.modules?.find(m => m.id === effectiveId);
        if (mod) {
          // Preserve the user's typed slug on the displayed title when
          // aliased, so "Culinary" reads as Culinary not Nutrition.
          const displayTitle = moduleId !== effectiveId
            ? `${moduleId.charAt(0).toUpperCase()}${moduleId.slice(1)} Workshop`
            : mod.title;
          setConfig({ ...mod, title: displayTitle, _themeId: moduleId });
        } else {
          setError(true);
        }
      })
      .catch(() => setError(true));
  }, [moduleId, effectiveId]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" data-testid="workshop-not-found">
        <div className="text-center">
          <p className="text-lg mb-2" style={{ color: 'var(--text-primary)', fontFamily: 'Cormorant Garamond, serif' }}>
            Module Not Found
          </p>
          <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
            The workshop "{moduleId}" is not in the registry.
          </p>
        </div>
      </div>
    );
  }

  if (!config) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border border-yellow-500/30 border-t-yellow-500 rounded-full animate-spin" />
      </div>
    );
  }

  const IconComp = ICON_MAP[config.icon] || Wrench;

  return (
    <UniversalWorkshop
      moduleId={moduleId}
      dataModuleId={effectiveId}
      title={config.title}
      subtitle={config.subtitle}
      icon={IconComp}
      accentColor={config.accentColor}
      skillKey={config.skillKey}
      matLabel={config.matLabel}
      storageKey={`emcafe_${moduleId}_actions`}
    />
  );
}
