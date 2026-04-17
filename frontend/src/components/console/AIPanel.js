/**
 * AIPanel.js — Sage AI Prompt-to-FX engine panel
 * Extracted from UnifiedCreatorConsole.js
 * Contains Sage FX presets, AI prompt handling, and Atmosphere Journal integration.
 * 
 * V57.0 — NEURAL CONTEXT SIGNAL: Tracks module journey for cross-cell intelligence.
 * The AI now remembers what you were doing in the previous module.
 */
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { Save, BookOpen, Sparkles } from 'lucide-react';
import axios from 'axios';
import { AtmosphereJournal, saveAtmosphere } from '../AtmosphereJournal';
import { DEFAULT_FILTERS } from '../ConsoleConstants';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// NEURAL CONTEXT SIGNAL — Cross-Cell Memory
// Tracks the user's last 5 module visits for contextual AI generation.
// The organism remembers the journey, not just the destination.
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const MAX_JOURNEY_LENGTH = 5;

// Module relationship map — siblings that share knowledge
const MODULE_SIBLINGS = {
  'masonry workbench': ['carpentry workbench', 'workshop', 'trade circle', 'architecture'],
  'carpentry workbench': ['masonry workbench', 'workshop', 'trade circle', 'fabricator'],
  'herbology': ['aromatherapy', 'elixirs', 'nourishment', 'botany'],
  'aromatherapy': ['herbology', 'elixirs', 'crystals', 'healing'],
  'meditation': ['breathing', 'yoga', 'mantras', 'soundscapes', 'zen garden'],
  'breathing': ['meditation', 'yoga', 'frequencies'],
  'crystals': ['crystal skins', 'rock hounding', 'masonry workbench'],
  'yoga': ['meditation', 'breathing', 'mudras', 'acupressure'],
  'oracle': ['star chart', 'numerology', 'cardology', 'cosmic profile'],
  'quantum field': ['fractal engine', 'physics lab', 'dimensional space'],
  'workshop': ['masonry workbench', 'carpentry workbench', 'fabricator'],
};

function getJourneyContext(currentModule) {
  const journey = window.__moduleJourney || [];
  if (journey.length === 0) return '';

  const recent = journey.slice(-3);
  const siblings = MODULE_SIBLINGS[currentModule] || [];
  const relevantPrev = recent.filter(m => m !== currentModule);

  if (relevantPrev.length === 0) return '';

  const lastModule = relevantPrev[relevantPrev.length - 1];
  const isSibling = siblings.includes(lastModule);

  if (isSibling) {
    return `The user just came from the "${lastModule}" module, which is closely related to "${currentModule}". Connect the knowledge — reference what they may have learned there. `;
  }
  return `The user's recent journey: ${relevantPrev.join(' → ')} → ${currentModule}. If relevant, weave in connections to their previous exploration. `;
}

function recordModuleVisit(moduleName) {
  if (!moduleName || moduleName === 'sovereign hub') return;
  if (!window.__moduleJourney) window.__moduleJourney = [];
  const journey = window.__moduleJourney;
  if (journey[journey.length - 1] === moduleName) return; // Already recorded
  journey.push(moduleName);
  if (journey.length > MAX_JOURNEY_LENGTH) journey.shift();
}

export const SAGE_FX_PRESETS = {
  sunset:    { blur: 0, brightness: 120, contrast: 110, hueRotate: 15, saturate: 140, sepia: 30, invert: 0 },
  sunrise:   { blur: 0, brightness: 130, contrast: 105, hueRotate: 340, saturate: 130, sepia: 15, invert: 0 },
  focus:     { blur: 1, brightness: 90, contrast: 120, hueRotate: 200, saturate: 80, sepia: 0, invert: 0 },
  calm:      { blur: 2, brightness: 95, contrast: 90, hueRotate: 180, saturate: 70, sepia: 10, invert: 0 },
  dream:     { blur: 3, brightness: 110, contrast: 80, hueRotate: 270, saturate: 120, sepia: 20, invert: 0 },
  night:     { blur: 0, brightness: 60, contrast: 130, hueRotate: 240, saturate: 60, sepia: 0, invert: 0 },
  fire:      { blur: 0, brightness: 120, contrast: 140, hueRotate: 0, saturate: 200, sepia: 40, invert: 0 },
  ocean:     { blur: 1, brightness: 100, contrast: 100, hueRotate: 190, saturate: 130, sepia: 0, invert: 0 },
  crystal:   { blur: 0, brightness: 140, contrast: 120, hueRotate: 280, saturate: 150, sepia: 0, invert: 0 },
  void:      { blur: 0, brightness: 30, contrast: 150, hueRotate: 0, saturate: 0, sepia: 0, invert: 0 },
  sacred:    { blur: 1, brightness: 110, contrast: 100, hueRotate: 45, saturate: 110, sepia: 25, invert: 0 },
  energy:    { blur: 0, brightness: 130, contrast: 130, hueRotate: 90, saturate: 180, sepia: 0, invert: 0 },
  meditation:{ blur: 2, brightness: 85, contrast: 90, hueRotate: 220, saturate: 70, sepia: 15, invert: 0 },
  reset:     { ...DEFAULT_FILTERS },
};

export default function AIPanel({ monitorFilters, setMonitorFilters, handleNav, currentRoute }) {
  const [sagePrompt, setSagePrompt] = useState('');
  const [sageLoading, setSageLoading] = useState(false);
  const [lastMood, setLastMood] = useState(null);
  const [journalOpen, setJournalOpen] = useState(false);
  const [genResult, setGenResult] = useState(null);
  const [genLoading, setGenLoading] = useState(false);

  // Determine current module context for generators
  const currentModule = currentRoute?.replace(/^\//, '').replace(/-/g, ' ') || 'sovereign hub';

  // V57.0 — Record module visit for Neural Context Signal
  const prevModuleRef = useRef(null);
  useEffect(() => {
    if (currentModule && currentModule !== prevModuleRef.current) {
      recordModuleVisit(currentModule);
      prevModuleRef.current = currentModule;
    }
  }, [currentModule]);

  // Build journey context for AI generation
  const journeyContext = getJourneyContext(currentModule);

  const handleGenerate = useCallback(async (toolType) => {
    setGenLoading(true);
    setGenResult(null);
    try {
      const res = await axios.post(`${API}/knowledge/deep-dive`, {
        topic: `${toolType} for ${currentModule}`,
        category: toolType === 'script' ? 'spiritual' : toolType === 'game' ? 'wellness' : 'general',
        context: `Generate a ${toolType} specifically for the ${currentModule} module. The user is currently inside the ${currentModule} room. ${journeyContext}Make it practical and immediately usable. fresh`,
      }, { timeout: 90000 });
      setGenResult({ type: toolType, content: res.data?.content || 'No content generated' });
      // Award XP — games give more because they trigger quest logic
      const xpAmount = toolType === 'game' ? 25 : 15;
      if (typeof window.__workAccrue === 'function') window.__workAccrue(`generator_${toolType}`, xpAmount);
      toast.success(`${toolType} generated for ${currentModule}`);

      // If game type, also fire RPG quest completion
      if (toolType === 'game') {
        try {
          await axios.post(`${API}/rpg/character/gain-xp`, {
            amount: 25,
            source: `game_generator_${currentModule.replace(/\s+/g, '_')}`,
          }, { headers: { Authorization: `Bearer ${localStorage.getItem('auth_token')}` } });
        } catch {} // Non-fatal
      }
    } catch {
      toast.error('Generator unavailable. Try again.');
    }
    setGenLoading(false);
  }, [currentModule, journeyContext]);

  const handleSagePrompt = useCallback(async (prompt) => {
    const words = prompt.toLowerCase().trim().split(/\s+/);
    for (const word of words) {
      if (SAGE_FX_PRESETS[word]) {
        setMonitorFilters(SAGE_FX_PRESETS[word]);
        setLastMood({ name: word.charAt(0).toUpperCase() + word.slice(1), filters: SAGE_FX_PRESETS[word], prompt });
        toast.success(`Sage: "${word}" atmosphere applied`);
        return;
      }
    }
    for (const [key, preset] of Object.entries(SAGE_FX_PRESETS)) {
      if (prompt.toLowerCase().includes(key)) {
        setMonitorFilters(preset);
        setLastMood({ name: key.charAt(0).toUpperCase() + key.slice(1), filters: preset, prompt });
        toast.success(`Sage: "${key}" atmosphere applied`);
        return;
      }
    }
    setSageLoading(true);
    try {
      const res = await axios.post(`${API}/sage-fx/prompt-to-fx`, { prompt });
      if (res.data?.filters) {
        setMonitorFilters(res.data.filters);
        setLastMood({ name: res.data.mood || 'Applied', filters: res.data.filters, prompt });
        toast.success(`Sage: "${res.data.mood || 'Applied'}" atmosphere created`);
      } else {
        toast(`Sage: ${res.data?.error || 'Could not interpret that atmosphere'}`);
      }
    } catch {
      toast(`Sage: Try descriptive phrases like "twilight forest" or "golden sunrise"`);
    } finally {
      setSageLoading(false);
    }
  }, [setMonitorFilters]);

  const handleSaveAtmosphere = useCallback(async () => {
    if (!lastMood) { toast('Apply an atmosphere first'); return; }
    try {
      await saveAtmosphere(lastMood.name, lastMood.filters, lastMood.prompt);
      toast.success(`Saved "${lastMood.name}" to your journal`);
    } catch { toast.error('Could not save atmosphere'); }
  }, [lastMood]);

  const handleApplyFromJournal = useCallback((atm) => {
    if (atm.filters) {
      setMonitorFilters(atm.filters);
      setLastMood({ name: atm.name, filters: atm.filters, prompt: atm.source_prompt });
      toast.success(`Restored: "${atm.name}"`);
    }
  }, [setMonitorFilters]);

  return (
    <div className="p-3 space-y-2">
      <div className="flex items-center justify-between mb-1">
        <div className="text-[8px] text-white/30 uppercase tracking-wider">Sage Prompt-to-FX — AI Powered</div>
        <div className="flex items-center gap-1.5">
          {lastMood && (
            <button onClick={handleSaveAtmosphere}
              className="flex items-center gap-1 px-2 py-1 rounded-lg text-[8px] active:scale-95 transition-all"
              style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)', color: '#22C55E' }}
              data-testid="sage-save-btn">
              <Save size={9} /> Save
            </button>
          )}
          <button onClick={() => setJournalOpen(p => !p)}
            className="flex items-center gap-1 px-2 py-1 rounded-lg text-[8px] active:scale-95 transition-all"
            style={{ background: journalOpen ? 'rgba(251,146,60,0.12)' : 'rgba(255,255,255,0.02)', border: `1px solid ${journalOpen ? 'rgba(251,146,60,0.3)' : 'rgba(255,255,255,0.06)'}`, color: journalOpen ? '#FB923C' : 'rgba(255,255,255,0.3)' }}
            data-testid="sage-journal-btn">
            <BookOpen size={9} /> Journal
          </button>
        </div>
      </div>
      <AnimatePresence>
        {journalOpen && (
          <AtmosphereJournal isOpen={journalOpen} onClose={() => setJournalOpen(false)} onApply={handleApplyFromJournal} />
        )}
      </AnimatePresence>
      {!journalOpen && (
        <>
          <div className="flex gap-2">
            <input
              type="text"
              value={sagePrompt}
              onChange={(e) => setSagePrompt(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && sagePrompt.trim() && !sageLoading) { handleSagePrompt(sagePrompt); setSagePrompt(''); } }}
              placeholder="Describe any atmosphere: twilight forest, golden temple..."
              className="flex-1 p-2 rounded-lg text-[11px] text-white/70"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', outline: 'none' }}
              disabled={sageLoading}
              data-testid="sage-prompt-input" />
            <button onClick={() => { if (sagePrompt.trim() && !sageLoading) { handleSagePrompt(sagePrompt); setSagePrompt(''); } }}
              className="px-3 py-2 rounded-lg text-[10px] font-bold active:scale-95"
              style={{ background: sageLoading ? 'rgba(251,146,60,0.06)' : 'rgba(251,146,60,0.12)', border: '1px solid rgba(251,146,60,0.25)', color: '#FB923C', opacity: sageLoading ? 0.5 : 1 }}
              data-testid="sage-apply-btn">{sageLoading ? '...' : 'Apply'}</button>
          </div>
          {lastMood && (
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg" style={{ background: 'rgba(255,255,255,0.02)' }}>
              <div className="w-3 h-3 rounded-full" style={{
                filter: `hue-rotate(${lastMood.filters?.hueRotate || 0}deg) brightness(${(lastMood.filters?.brightness || 100) / 100})`,
                background: 'linear-gradient(135deg, #8B5CF6, #3B82F6)',
              }} />
              <span className="text-[9px]" style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'Cormorant Garamond, serif' }}>
                {lastMood.name}
              </span>
            </div>
          )}
          <div className="flex flex-wrap gap-1.5 mt-1">
            {Object.keys(SAGE_FX_PRESETS).filter(k => k !== 'reset').map(preset => (
              <button key={preset} onClick={() => {
                setMonitorFilters(SAGE_FX_PRESETS[preset]);
                setLastMood({ name: preset.charAt(0).toUpperCase() + preset.slice(1), filters: SAGE_FX_PRESETS[preset], prompt: preset });
                toast.success(`Sage: "${preset}"`);
              }}
                className="px-2 py-1 rounded-lg text-[8px] font-bold active:scale-95 capitalize"
                style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.4)' }}
                data-testid={`sage-preset-${preset}`}>{preset}</button>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-2 mt-3">
            {[{ label: 'Image to Video', color: '#E879F9', route: '/vr' }, { label: 'AI Art', color: '#8B5CF6', route: '/creation-stories' }, { label: 'Text to Image', color: '#3B82F6', route: '/avatar' },
              { label: 'Text to Speech', color: '#2DD4BF', route: '/mantras' }, { label: 'AI Music', color: '#22C55E', route: '/soundscapes' }, { label: 'AI Avatar', color: '#FB923C', route: '/avatar' }].map(ai => (
              <button key={ai.label} onClick={() => handleNav(ai.route)} className="p-2 rounded-xl text-center active:scale-95"
                style={{ background: `${ai.color}08`, border: `1px solid ${ai.color}18` }} data-testid={`ai-${ai.label.toLowerCase().replace(/\s+/g, '-')}`}>
                <div className="text-[8px] font-bold" style={{ color: ai.color }}>{ai.label}</div>
              </button>
            ))}
          </div>

          {/* GLOBAL GENERATORS — Context-aware, works from any module */}
          <div className="mt-3 pt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
            <div className="flex items-center gap-1.5 mb-1">
              <Sparkles size={9} style={{ color: '#FBBF24' }} />
              <span className="text-[7px] font-bold uppercase tracking-wider" style={{ color: '#FBBF24' }}>
                Generators — {currentModule}
              </span>
            </div>
            {/* V57.0 Neural Context — show journey thread */}
            {window.__moduleJourney && window.__moduleJourney.length > 1 && (
              <div className="flex items-center gap-1 mb-2 px-1" data-testid="journey-context">
                <span className="text-[7px]" style={{ color: 'rgba(255,255,255,0.25)' }}>Journey:</span>
                {window.__moduleJourney.slice(-3).map((m, i, arr) => (
                  <span key={`${m}-${i}`} className="text-[7px]" style={{ color: i === arr.length - 1 ? '#FBBF24' : 'rgba(255,255,255,0.3)' }}>
                    {m}{i < arr.length - 1 ? ' → ' : ''}
                  </span>
                ))}
              </div>
            )}
            <div className="grid grid-cols-4 gap-1.5">
              {[
                { type: 'script', label: 'Script', color: '#C084FC' },
                { type: 'lesson', label: 'Lesson', color: '#38BDF8' },
                { type: 'game', label: 'Game', color: '#EF4444' },
                { type: 'ritual', label: 'Ritual', color: '#22C55E' },
              ].map(gen => (
                <button key={gen.type} onClick={() => handleGenerate(gen.type)}
                  disabled={genLoading}
                  className="p-2 rounded-lg text-center active:scale-95"
                  style={{
                    background: genLoading ? 'rgba(255,255,255,0.01)' : `${gen.color}08`,
                    border: `1px solid ${gen.color}18`,
                    opacity: genLoading ? 0.4 : 1,
                  }}
                  data-testid={`gen-${gen.type}`}>
                  <div className="text-[8px] font-bold" style={{ color: gen.color }}>{gen.label}</div>
                </button>
              ))}
            </div>
            {genLoading && (
              <div className="flex items-center gap-2 mt-2 p-2 rounded-lg" style={{ background: 'rgba(251,191,36,0.04)' }}>
                <div className="w-3 h-3 border border-yellow-500/40 border-t-yellow-500 rounded-full animate-spin" />
                <span className="text-[9px]" style={{ color: 'rgba(255,255,255,0.5)' }}>Generating for {currentModule}...</span>
              </div>
            )}
            {genResult && !genLoading && (
              <div className="mt-2 p-2.5 rounded-lg max-h-32 overflow-y-auto" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[8px] font-bold uppercase" style={{ color: '#FBBF24' }}>{genResult.type} — {currentModule}</span>
                  <button onClick={() => setGenResult(null)} className="text-[8px]" style={{ color: 'rgba(255,255,255,0.3)' }}>Close</button>
                </div>
                <p className="text-[10px] leading-relaxed whitespace-pre-wrap" style={{ color: 'rgba(255,255,255,0.7)' }}>
                  {genResult.content.substring(0, 800)}{genResult.content.length > 800 ? '...' : ''}
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
