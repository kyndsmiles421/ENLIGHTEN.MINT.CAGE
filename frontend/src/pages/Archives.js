import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Lock, Volume2, Globe, Layers, Radio, ChevronRight } from 'lucide-react';
import { StrokeTracer } from '../components/StrokeTracer';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const LANG_COLORS = {
  sanskrit: '#F59E0B', chinese: '#EF4444', aramaic: '#60A5FA',
  hebrew: '#818CF8', egyptian: '#FBBF24', greek: '#2DD4BF',
  hopi: '#34D399', latin: '#C084FC',
};

const CATEGORY_LABELS = {
  vedic: 'Vedic', chinese: 'Chinese', semitic: 'Semitic',
  egyptian: 'Egyptian', hermetic: 'Hermetic', sacred_geometry: 'Sacred Geometry',
};

export default function Archives() {
  const navigate = useNavigate();
  const { authHeaders, loading, token } = useAuth();
  const [entries, setEntries] = useState([]);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [activeLayer, setActiveLayer] = useState('origin');
  const [selectedLang, setSelectedLang] = useState(null);
  const [selectedCharIdx, setSelectedCharIdx] = useState(0);
  const [unlockedChars, setUnlockedChars] = useState(new Set());
  const [linguistics, setLinguistics] = useState([]);
  const [selectedConcept, setSelectedConcept] = useState(null);
  const [conceptData, setConceptData] = useState(null);

  // Silent dust accrual on page visit
  useEffect(() => { if (typeof window.__workAccrue === 'function') window.__workAccrue('archive_save', 6); }, []);

  const audioCtxRef = useRef(null);

  useEffect(() => {
    if (loading || !token) return;
    axios.get(`${API}/archives/entries`, { headers: authHeaders })
      .then(r => {
        setEntries(r.data.entries || []);
        if (r.data.unlocked_characters) setUnlockedChars(new Set(r.data.unlocked_characters));
      }).catch(() => {});
    axios.get(`${API}/archives/linguistics`, { headers: authHeaders })
      .then(r => setLinguistics(r.data.concepts || [])).catch(() => {});
  }, [loading, token, authHeaders]);

  const loadEntry = useCallback((id) => {
    axios.get(`${API}/archives/entry/${id}`, { headers: authHeaders })
      .then(r => {
        setSelectedEntry(r.data);
        const langs = Object.keys(r.data.scripts || {});
        setSelectedLang(langs[0] || null);
        setSelectedCharIdx(0);
        setActiveLayer('origin');
      }).catch(() => {});
  }, [authHeaders]);

  const loadConcept = useCallback((id) => {
    axios.get(`${API}/archives/linguistics/${id}`, { headers: authHeaders })
      .then(r => { setConceptData(r.data); setSelectedConcept(id); }).catch(() => {});
  }, [authHeaders]);

  const playFrequency = useCallback((hz) => {
    try {
      if (!audioCtxRef.current) audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = hz;
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.06, ctx.currentTime + 0.3);
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 2.2);
    } catch {}
  }, []);

  const handleTraceComplete = useCallback((accuracy) => {
    if (!selectedEntry || !selectedLang) return;
    axios.post(`${API}/archives/trace`, {
      entry_id: selectedEntry.id, language: selectedLang,
      char_index: selectedCharIdx, accuracy,
    }, { headers: authHeaders }).then(r => {
      if (r.data.unlocked) {
        setUnlockedChars(prev => new Set([...prev, r.data.character_id]));
        playFrequency(r.data.frequency);
      }
    }).catch(() => {});
  }, [selectedEntry, selectedLang, selectedCharIdx, authHeaders, playFrequency]);

  const scripts = selectedEntry?.scripts || {};
  const langKeys = Object.keys(scripts);
  const currentScript = selectedLang ? scripts[selectedLang] : null;
  const currentChars = currentScript?.characters || [];
  const currentChar = currentChars[selectedCharIdx];

  return (
    <div className="min-h-screen shadow-void-container" style={{ background: 'transparent', paddingTop: '70px' }} data-testid="archives-page">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => navigate('/hub')} className="p-2 rounded-full"
            style={{ background: 'rgba(248,250,252,0.04)', border: '1px solid rgba(248,250,252,0.06)' }}
            data-testid="archives-back-btn">
            <ArrowLeft size={16} style={{ color: 'rgba(248,250,252,0.4)' }} />
          </button>
          <div>
            <h1 className="text-xl font-light tracking-[0.2em] uppercase"
              style={{ color: 'rgba(248,250,252,0.3)', fontFamily: 'Cormorant Garamond, serif' }}>
              The Deep-Dive Archives
            </h1>
            <p className="text-[9px] mt-0.5" style={{ color: 'rgba(248,250,252,0.15)' }}>
              Trinity View &middot; Trace to Unlock &middot; {entries.length} Entries
            </p>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-4" style={{ minHeight: 'calc(100vh - 120px)' }}>
          {/* Left — Entry List */}
          <div className="col-span-3 space-y-2 overflow-y-auto pr-2" style={{ maxHeight: 'calc(100vh - 140px)' }}>
            <p className="text-[9px] font-medium tracking-[0.15em] uppercase mb-3"
              style={{ color: 'rgba(248,250,252,0.2)' }}>Archives</p>
            {entries.map(entry => (
              <motion.button key={entry.id}
                className="w-full text-left p-3 rounded-lg transition-all"
                style={{
                  background: selectedEntry?.id === entry.id ? 'rgba(248,250,252,0.06)' : 'rgba(248,250,252,0.02)',
                  border: `1px solid ${selectedEntry?.id === entry.id ? 'rgba(248,250,252,0.1)' : 'rgba(248,250,252,0.03)'}`,
                }}
                whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                onClick={() => entry.unlocked ? loadEntry(entry.id) : null}
                data-testid={`archive-entry-${entry.id}`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium" style={{ color: entry.unlocked ? 'rgba(248,250,252,0.6)' : 'rgba(248,250,252,0.2)' }}>
                    {entry.title}
                  </span>
                  {!entry.unlocked ? <Lock size={10} style={{ color: 'rgba(248,250,252,0.15)' }} /> : <ChevronRight size={10} style={{ color: 'rgba(248,250,252,0.15)' }} />}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[8px] px-1.5 py-0.5 rounded-full"
                    style={{ background: 'rgba(248,250,252,0.04)', color: 'rgba(248,250,252,0.25)' }}>
                    {CATEGORY_LABELS[entry.category] || entry.category}
                  </span>
                  <span className="text-[8px] font-mono" style={{ color: 'rgba(248,250,252,0.15)' }}>
                    {entry.frequency}Hz
                  </span>
                </div>
                {Object.entries(entry.scripts_preview || {}).map(([lang, data]) => (
                  <span key={lang} className="text-[10px] mr-2" style={{ color: LANG_COLORS[lang] || 'rgba(248,250,252,0.3)' }}>
                    {data.original}
                  </span>
                ))}
              </motion.button>
            ))}

            {/* Comparative Linguistics */}
            <p className="text-[9px] font-medium tracking-[0.15em] uppercase mt-6 mb-3"
              style={{ color: 'rgba(248,250,252,0.2)' }}>Comparative Linguistics</p>
            {linguistics.map(c => (
              <button key={c.id}
                className="w-full text-left p-3 rounded-lg mb-1"
                style={{
                  background: selectedConcept === c.id ? 'rgba(192,132,252,0.08)' : 'rgba(248,250,252,0.02)',
                  border: `1px solid ${selectedConcept === c.id ? 'rgba(192,132,252,0.15)' : 'rgba(248,250,252,0.03)'}`,
                }}
                onClick={() => loadConcept(c.id)}
                data-testid={`linguistics-${c.id}`}
              >
                <span className="text-xs" style={{ color: 'rgba(248,250,252,0.5)' }}>{c.concept}</span>
                <span className="text-[8px] ml-2 font-mono" style={{ color: 'rgba(248,250,252,0.2)' }}>
                  {c.language_count} languages
                </span>
              </button>
            ))}
          </div>

          {/* Center — Trinity View */}
          <div className="col-span-6">
            {selectedEntry && !selectedEntry.locked ? (
              <div className="rounded-xl p-5" style={{
                background: 'rgba(0,0,0,0)', backdropFilter: 'none',
                border: '1px solid rgba(248,250,252,0.04)',
              }}>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base font-medium" style={{ color: 'rgba(248,250,252,0.7)', fontFamily: 'Cormorant Garamond, serif' }}>
                    {selectedEntry.title}
                  </h2>
                  <span className="text-[8px] px-2 py-1 rounded-full font-mono"
                    style={{ background: 'rgba(248,250,252,0.04)', color: 'rgba(248,250,252,0.3)' }}>
                    Mass: {selectedEntry.gravity_mass}
                  </span>
                </div>

                {/* Trinity Layer Tabs */}
                <div className="flex gap-1 mb-5">
                  {[
                    { id: 'origin', label: 'Origin', icon: Globe },
                    { id: 'synthesis', label: 'Synthesis', icon: Layers },
                    { id: 'frequency', label: 'Frequency', icon: Radio },
                  ].map(tab => (
                    <button key={tab.id}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[9px] font-medium tracking-wider uppercase transition-all"
                      style={{
                        background: activeLayer === tab.id ? 'rgba(192,132,252,0.12)' : 'rgba(248,250,252,0.03)',
                        color: activeLayer === tab.id ? '#C084FC' : 'rgba(248,250,252,0.25)',
                        border: `1px solid ${activeLayer === tab.id ? 'rgba(192,132,252,0.2)' : 'rgba(248,250,252,0.04)'}`,
                      }}
                      onClick={() => setActiveLayer(tab.id)}
                      data-testid={`trinity-tab-${tab.id}`}
                    >
                      <tab.icon size={10} />
                      {tab.label}
                    </button>
                  ))}
                </div>

                <AnimatePresence mode="wait">
                  {activeLayer === 'origin' && (
                    <motion.div key="origin" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                      <p className="text-xs leading-relaxed mb-4" style={{ color: 'rgba(248,250,252,0.55)' }}>
                        {selectedEntry.trinity?.origin?.text}
                      </p>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-[8px] px-2 py-0.5 rounded-full"
                          style={{ background: 'rgba(248,250,252,0.04)', color: 'rgba(248,250,252,0.3)' }}>
                          {selectedEntry.trinity?.origin?.language}
                        </span>
                        <span className="text-[8px]" style={{ color: 'rgba(248,250,252,0.2)' }}>
                          {selectedEntry.trinity?.origin?.script}
                        </span>
                      </div>

                      {/* Language selector */}
                      <div className="flex gap-2 mt-4">
                        {langKeys.map(lang => (
                          <button key={lang}
                            className="px-3 py-1.5 rounded-full text-[9px] font-medium tracking-wider uppercase"
                            style={{
                              background: selectedLang === lang ? `${LANG_COLORS[lang]}15` : 'rgba(248,250,252,0.03)',
                              color: selectedLang === lang ? LANG_COLORS[lang] : 'rgba(248,250,252,0.25)',
                              border: `1px solid ${selectedLang === lang ? `${LANG_COLORS[lang]}30` : 'rgba(248,250,252,0.04)'}`,
                            }}
                            onClick={() => { setSelectedLang(lang); setSelectedCharIdx(0); }}
                            data-testid={`lang-btn-${lang}`}
                          >
                            {lang}
                          </button>
                        ))}
                      </div>

                      {currentScript && (
                        <div className="mt-3 p-3 rounded-lg" style={{ background: 'rgba(248,250,252,0.02)' }}>
                          <p className="text-3xl mb-1" style={{ color: LANG_COLORS[selectedLang], fontFamily: 'serif' }}>
                            {currentScript.original}
                          </p>
                          <p className="text-[10px] font-mono" style={{ color: 'rgba(248,250,252,0.3)' }}>
                            {currentScript.transliteration}
                          </p>
                          {currentScript.evolution && (
                            <div className="flex items-center gap-2 mt-2">
                              {currentScript.evolution.map((era, i) => (
                                <React.Fragment key={i}>
                                  <span className="text-[7px]" style={{ color: 'rgba(248,250,252,0.2)' }}>{era}</span>
                                  {i < currentScript.evolution.length - 1 && <ChevronRight size={8} style={{ color: 'rgba(248,250,252,0.1)' }} />}
                                </React.Fragment>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </motion.div>
                  )}

                  {activeLayer === 'synthesis' && (
                    <motion.div key="synthesis" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                      <p className="text-xs leading-relaxed mb-4" style={{ color: 'rgba(248,250,252,0.55)' }}>
                        {selectedEntry.trinity?.synthesis?.text}
                      </p>
                      {selectedEntry.trinity?.synthesis?.connections?.length > 0 && (
                        <div className="mt-3">
                          <p className="text-[8px] font-medium tracking-wider uppercase mb-2"
                            style={{ color: 'rgba(248,250,252,0.2)' }}>Connected Nodes</p>
                          <div className="flex flex-wrap gap-2">
                            {selectedEntry.trinity.synthesis.connections.map(c => (
                              <button key={c} className="px-2.5 py-1 rounded-full text-[9px]"
                                style={{ background: 'rgba(192,132,252,0.08)', color: '#C084FC', border: '1px solid rgba(192,132,252,0.15)' }}
                                onClick={() => loadEntry(c)}
                                data-testid={`connection-${c}`}
                              >
                                {c}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}

                  {activeLayer === 'frequency' && (
                    <motion.div key="frequency" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { label: 'Primary Frequency', value: `${selectedEntry.trinity?.frequency?.hz}Hz` },
                          { label: 'Nearest Solfeggio', value: selectedEntry.trinity?.frequency?.solfeggio_nearest },
                          { label: 'Chakra', value: selectedEntry.trinity?.frequency?.chakra },
                          { label: 'Element', value: selectedEntry.trinity?.frequency?.element },
                        ].map(item => (
                          <div key={item.label} className="p-3 rounded-lg" style={{ background: 'rgba(248,250,252,0.02)', border: '1px solid rgba(248,250,252,0.03)' }}>
                            <p className="text-[8px] uppercase tracking-wider" style={{ color: 'rgba(248,250,252,0.2)' }}>{item.label}</p>
                            <p className="text-sm font-mono mt-1" style={{ color: 'rgba(248,250,252,0.5)' }}>{item.value}</p>
                          </div>
                        ))}
                      </div>
                      <button className="mt-4 flex items-center gap-2 px-4 py-2 rounded-full"
                        style={{ background: 'rgba(192,132,252,0.1)', border: '1px solid rgba(192,132,252,0.2)' }}
                        onClick={() => playFrequency(selectedEntry.trinity?.frequency?.hz)}
                        data-testid="play-frequency-btn"
                      >
                        <Volume2 size={12} style={{ color: '#C084FC' }} />
                        <span className="text-[10px] font-medium" style={{ color: '#C084FC' }}>Play {selectedEntry.trinity?.frequency?.hz}Hz</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : selectedEntry?.locked ? (
              <div className="rounded-xl p-8 flex flex-col items-center justify-center" style={{
                background: 'rgba(0,0,0,0)', backdropFilter: 'none',
                border: '1px solid rgba(248,250,252,0.04)', minHeight: 400,
              }}>
                <Lock size={32} style={{ color: 'rgba(248,250,252,0.1)' }} />
                <p className="text-sm mt-4" style={{ color: 'rgba(248,250,252,0.3)' }}>{selectedEntry.title}</p>
                <p className="text-[10px] mt-2" style={{ color: 'rgba(248,250,252,0.15)' }}>{selectedEntry.locked_reason}</p>
              </div>
            ) : conceptData ? (
              <div className="rounded-xl p-5" style={{
                background: 'rgba(0,0,0,0)', backdropFilter: 'none',
                border: '1px solid rgba(248,250,252,0.04)',
              }}>
                <h2 className="text-base font-medium mb-4" style={{ color: 'rgba(248,250,252,0.7)', fontFamily: 'Cormorant Garamond, serif' }}>
                  {conceptData.concept}
                </h2>
                <p className="text-[9px] mb-4" style={{ color: 'rgba(248,250,252,0.2)' }}>
                  One concept, many civilizations. Click to hear the phonetic frequency.
                </p>
                <div className="space-y-2">
                  {Object.entries(conceptData.languages || {}).map(([lang, data]) => (
                    <motion.button key={lang}
                      className="w-full flex items-center justify-between p-3 rounded-lg"
                      style={{ background: 'rgba(248,250,252,0.02)', border: `1px solid ${LANG_COLORS[lang] || 'rgba(248,250,252,0.04)'}15` }}
                      whileHover={{ scale: 1.01, backgroundColor: 'rgba(248,250,252,0.04)' }}
                      onClick={() => playFrequency(data.frequency)}
                      data-testid={`ling-${lang}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-lg" style={{ color: LANG_COLORS[lang] || '#A78BFA', fontFamily: 'serif' }}>
                          {data.word}
                        </span>
                        <div className="text-left">
                          <p className="text-[10px] font-medium" style={{ color: 'rgba(248,250,252,0.5)' }}>{data.transliteration}</p>
                          <p className="text-[8px] uppercase tracking-wider" style={{ color: LANG_COLORS[lang] || 'rgba(248,250,252,0.2)' }}>{lang}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-mono" style={{ color: 'rgba(248,250,252,0.25)' }}>{data.frequency}Hz</span>
                        <Volume2 size={10} style={{ color: 'rgba(248,250,252,0.2)' }} />
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="rounded-xl p-8 flex flex-col items-center justify-center" style={{
                background: 'rgba(0,0,0,0)', border: '1px dashed rgba(248,250,252,0.05)', minHeight: 400,
              }}>
                <Globe size={32} style={{ color: 'rgba(248,250,252,0.08)' }} />
                <p className="text-xs mt-4" style={{ color: 'rgba(248,250,252,0.15)' }}>Select an archive entry to explore</p>
              </div>
            )}
          </div>

          {/* Right — Stroke Tracer */}
          <div className="col-span-3">
            {currentChar ? (
              <div className="rounded-xl p-4" style={{
                background: 'rgba(0,0,0,0)', backdropFilter: 'none',
                border: '1px solid rgba(248,250,252,0.04)',
              }}>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-[9px] font-medium tracking-wider uppercase" style={{ color: 'rgba(248,250,252,0.2)' }}>
                      Stroke Tracing
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: LANG_COLORS[selectedLang] || '#A78BFA' }}>
                      {currentChar.name}
                    </p>
                  </div>
                  <span className="text-[8px] font-mono px-2 py-0.5 rounded-full"
                    style={{ background: 'rgba(248,250,252,0.04)', color: 'rgba(248,250,252,0.25)' }}>
                    {currentChar.frequency}Hz
                  </span>
                </div>

                <p className="text-[9px] mb-3" style={{ color: 'rgba(248,250,252,0.25)' }}>
                  {currentChar.meaning}
                </p>

                <StrokeTracer
                  character={currentChar.char}
                  strokes={currentChar.strokes}
                  size={260}
                  onComplete={handleTraceComplete}
                  color={LANG_COLORS[selectedLang] || '#A78BFA'}
                />

                {currentChars.length > 1 && (
                  <div className="flex gap-1 mt-3 justify-center">
                    {currentChars.map((c, i) => (
                      <button key={i}
                        className="px-2 py-1 rounded text-[9px]"
                        style={{
                          background: i === selectedCharIdx ? `${LANG_COLORS[selectedLang]}15` : 'rgba(248,250,252,0.03)',
                          color: i === selectedCharIdx ? LANG_COLORS[selectedLang] : 'rgba(248,250,252,0.2)',
                        }}
                        onClick={() => setSelectedCharIdx(i)}
                      >
                        {c.char}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="rounded-xl p-6 flex flex-col items-center justify-center"
                style={{ background: 'rgba(0,0,0,0)', border: '1px dashed rgba(248,250,252,0.05)', minHeight: 380 }}>
                <p className="text-[10px]" style={{ color: 'rgba(248,250,252,0.12)' }}>
                  Select an entry to trace characters
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
