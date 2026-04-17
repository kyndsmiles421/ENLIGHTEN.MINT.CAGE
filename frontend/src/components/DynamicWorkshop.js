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
import { Zap, Droplets, Leaf, Heart, BookOpen, Baby, Flame, Car, Apple, Brain, HandHeart, Wrench, Wind, Cpu, Cross, Eye, Hammer, Axe } from 'lucide-react';
import UniversalWorkshop from './UniversalWorkshop';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

// Icon map — resolves string icon names from the registry to Lucide components
const ICON_MAP = {
  Zap, Droplets, Leaf, Heart, BookOpen, Baby, Flame, Car, Apple, Brain, HandHeart, Wrench, Wind, Cpu, Cross, Eye, Hammer, Axe,
};

export default function DynamicWorkshop() {
  const { moduleId } = useParams();
  const [config, setConfig] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    setConfig(null);
    setError(false);
    axios.get(`${API}/workshop/registry`)
      .then(res => {
        const mod = res.data?.modules?.find(m => m.id === moduleId);
        if (mod) setConfig(mod);
        else setError(true);
      })
      .catch(() => setError(true));
  }, [moduleId]);

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
