import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { toast } from 'sonner';
import { Sparkles, Loader2, RotateCcw, Star, Sun, Moon, Hexagon, Triangle } from 'lucide-react';
import NarrationPlayer from '../components/NarrationPlayer';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const TABS = [
  { id: 'tarot', label: 'Tarot', icon: Star, color: '#D8B4FE' },
  { id: 'astrology', label: 'Astrology', icon: Sun, color: '#FCD34D' },
  { id: 'chinese', label: 'Chinese Astrology', icon: Moon, color: '#EF4444' },
  { id: 'iching', label: 'I Ching', icon: Hexagon, color: '#2DD4BF' },
  { id: 'geometry', label: 'Sacred Geometry', icon: Triangle, color: '#8B5CF6' },
];

function TarotCard({ card, index, revealed }) {
  return (
    <motion.div
      initial={{ rotateY: 180, opacity: 0 }}
      animate={{ rotateY: revealed ? 0 : 180, opacity: 1 }}
      transition={{ delay: index * 0.3, duration: 0.6 }}
      className="glass-card p-5 text-center w-40 md:w-48 flex-shrink-0"
      style={{
        borderColor: card.reversed ? 'rgba(239,68,68,0.2)' : 'rgba(216,180,254,0.2)',
        boxShadow: `0 0 30px ${card.reversed ? 'rgba(239,68,68,0.1)' : 'rgba(216,180,254,0.1)'}`,
      }}
      data-testid={`tarot-card-${index}`}
    >
      <div className="text-4xl mb-3" style={{ fontFamily: 'Cormorant Garamond, serif', color: card.reversed ? '#EF4444' : '#D8B4FE' }}>
        {card.name === 'The Fool' ? 'O' : card.name.match(/\d+/) ? card.name.match(/\d+/)[0] : String.fromCharCode(9812 + index)}
      </div>
      <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>{card.name}</p>
      {card.reversed && <p className="text-xs mb-1" style={{ color: '#EF4444' }}>Reversed</p>}
      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{card.element}</p>
      <p className="text-xs mt-2 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{card.keywords}</p>
    </motion.div>
  );
}

function IChingHexagram({ lines }) {
  return (
    <div className="flex flex-col items-center gap-2 my-4" data-testid="iching-hexagram">
      {[...lines].reverse().map((line, i) => {
        const yang = line === 7 || line === 9;
        const changing = line === 6 || line === 9;
        return (
          <div key={i} className="flex items-center gap-1">
            {yang ? (
              <div className="w-32 h-3 rounded-full" style={{ background: changing ? '#FCD34D' : 'var(--text-primary)', boxShadow: changing ? '0 0 10px rgba(252,211,77,0.4)' : 'none' }} />
            ) : (
              <div className="flex gap-3">
                <div className="w-14 h-3 rounded-full" style={{ background: changing ? '#2DD4BF' : 'var(--text-secondary)', boxShadow: changing ? '0 0 10px rgba(45,212,191,0.4)' : 'none' }} />
                <div className="w-14 h-3 rounded-full" style={{ background: changing ? '#2DD4BF' : 'var(--text-secondary)', boxShadow: changing ? '0 0 10px rgba(45,212,191,0.4)' : 'none' }} />
              </div>
            )}
            {changing && <span className="text-xs ml-2" style={{ color: '#FCD34D' }}>*</span>}
          </div>
        );
      })}
    </div>
  );
}

function GeometryPattern({ pattern }) {
  const patterns = {
    'flower-of-life': <svg viewBox="0 0 100 100" className="w-32 h-32">{[50,25,75,25,75,50].map((_, i) => <circle key={i} cx={50 + 20*Math.cos(i*Math.PI/3)} cy={50 + 20*Math.sin(i*Math.PI/3)} r="20" fill="none" stroke={pattern.color} strokeWidth="0.5" opacity="0.6"/>)}<circle cx="50" cy="50" r="20" fill="none" stroke={pattern.color} strokeWidth="0.5" opacity="0.8"/></svg>,
    'sri-yantra': <svg viewBox="0 0 100 100" className="w-32 h-32">{[0,1,2,3].map(i => <polygon key={`u${i}`} points={`50,${15+i*5} ${25+i*3},${75-i*5} ${75-i*3},${75-i*5}`} fill="none" stroke={pattern.color} strokeWidth="0.5" opacity={0.8-i*0.1}/>)}{[0,1,2,3,4].map(i => <polygon key={`d${i}`} points={`50,${85-i*5} ${30+i*2},${30+i*5} ${70-i*2},${30+i*5}`} fill="none" stroke="#FDA4AF" strokeWidth="0.5" opacity={0.8-i*0.1}/>)}</svg>,
    'merkaba': <svg viewBox="0 0 100 100" className="w-32 h-32"><polygon points="50,10 85,70 15,70" fill="none" stroke={pattern.color} strokeWidth="0.8" opacity="0.7"/><polygon points="50,90 15,30 85,30" fill="none" stroke="#2DD4BF" strokeWidth="0.8" opacity="0.7"/></svg>,
  };
  return patterns[pattern.id] || <svg viewBox="0 0 100 100" className="w-32 h-32"><circle cx="50" cy="50" r="40" fill="none" stroke={pattern.color} strokeWidth="0.8" opacity="0.6"/><circle cx="50" cy="50" r="25" fill="none" stroke={pattern.color} strokeWidth="0.5" opacity="0.4"/></svg>;
}

export default function Oracle() {
  const [tab, setTab] = useState('tarot');
  const [question, setQuestion] = useState('');
  const [reading, setReading] = useState(null);
  const [loading, setLoading] = useState(false);
  const [zodiacSigns, setZodiacSigns] = useState([]);
  const [chineseZodiac, setChineseZodiac] = useState([]);
  const [sacredGeometry, setSacredGeometry] = useState([]);
  const [selectedSign, setSelectedSign] = useState('');
  const [birthYear, setBirthYear] = useState('');
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    axios.get(`${API}/oracle/zodiac`).then(r => setZodiacSigns(r.data)).catch(() => {});
    axios.get(`${API}/oracle/chinese-zodiac`).then(r => setChineseZodiac(r.data)).catch(() => {});
    axios.get(`${API}/oracle/sacred-geometry`).then(r => setSacredGeometry(r.data)).catch(() => {});
  }, []);

  const getReading = async () => {
    setLoading(true);
    setReading(null);
    setRevealed(false);
    try {
      const payload = {
        reading_type: tab === 'chinese' ? 'chinese_astrology' : tab === 'geometry' ? 'sacred_geometry' : tab,
        spread: tab === 'tarot' ? 'three_card' : null,
        zodiac_sign: tab === 'astrology' ? selectedSign : null,
        birth_year: tab === 'chinese' ? (parseInt(birthYear) || null) : null,
        question: question || null,
      };
      const res = await axios.post(`${API}/oracle/reading`, payload);
      setReading(res.data);
      setTimeout(() => setRevealed(true), 300);
    } catch { toast.error('The oracle is silent. Try again.'); } finally { setLoading(false); }
  };

  const reset = () => { setReading(null); setQuestion(''); setRevealed(false); };

  return (
    <div className="min-h-screen px-6 md:px-12 lg:px-24 py-12 immersive-page" style={{ background: 'transparent' }}>
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-xs font-bold uppercase tracking-[0.25em] mb-4" style={{ color: '#D8B4FE' }}>
            <Sparkles size={14} className="inline mr-2" /> Divination Oracle
          </p>
          <h1 className="text-4xl md:text-5xl font-light tracking-tight mb-4" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
            Seek the Oracle
          </h1>
          <p className="text-base mb-12" style={{ color: 'var(--text-secondary)' }}>
            Tarot, Astrology, I Ching, and Sacred Geometry — ancient wisdom channeled through AI.
          </p>
        </motion.div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-10">
          {TABS.map(t => {
            const Icon = t.icon;
            return (
              <button key={t.id} onClick={() => { setTab(t.id); reset(); }}
                className="flex items-center gap-2 px-4 py-2 rounded-full text-sm"
                style={{
                  background: tab === t.id ? `${t.color}15` : 'transparent',
                  border: `1px solid ${tab === t.id ? t.color + '30' : 'rgba(255,255,255,0.06)'}`,
                  color: tab === t.id ? t.color : 'var(--text-muted)',
                  transition: 'background 0.3s, border-color 0.3s, color 0.3s',
                }}
                data-testid={`oracle-tab-${t.id}`}>
                <Icon size={14} /> {t.label}
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Input Panel */}
          <div className="space-y-6">
            {tab === 'astrology' && (
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] mb-3" style={{ color: 'var(--text-muted)' }}>Your Zodiac Sign</p>
                <div className="grid grid-cols-3 gap-1.5 max-h-72 overflow-y-auto pr-1">
                  {zodiacSigns.map(s => (
                    <button key={s.sign} onClick={() => setSelectedSign(s.sign)}
                      className="glass-card p-2 text-center text-xs"
                      style={{ borderColor: selectedSign === s.sign ? `${s.color}40` : 'rgba(255,255,255,0.08)', color: selectedSign === s.sign ? s.color : 'var(--text-muted)', transition: 'border-color 0.3s, color 0.3s' }}
                      data-testid={`zodiac-${s.sign.toLowerCase()}`}>
                      <p className="font-medium">{s.sign}</p>
                      <p style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>{s.dates}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {tab === 'chinese' && (
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] mb-3" style={{ color: 'var(--text-muted)' }}>Birth Year</p>
                <input type="number" value={birthYear} onChange={(e) => setBirthYear(e.target.value)}
                  className="input-glass w-full" placeholder="e.g., 1990" data-testid="birth-year-input" />
                {birthYear && parseInt(birthYear) > 1900 && (
                  <div className="mt-3">
                    {(() => {
                      const y = parseInt(birthYear);
                      const animals = ["Rat","Ox","Tiger","Rabbit","Dragon","Snake","Horse","Goat","Monkey","Rooster","Dog","Pig"];
                      const animal = animals[(y - 4) % 12];
                      const elements = ["Wood","Fire","Earth","Metal","Water"];
                      const element = elements[((y - 4) % 10) >> 1];
                      const z = chineseZodiac.find(a => a.animal === animal);
                      return z ? (
                        <div className="glass-card p-4" style={{ borderColor: `${z.color}20` }}>
                          <p className="text-lg font-light" style={{ fontFamily: 'Cormorant Garamond, serif', color: z.color }}>{element} {animal}</p>
                          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{z.traits}</p>
                        </div>
                      ) : null;
                    })()}
                  </div>
                )}
              </div>
            )}

            {tab === 'geometry' && (
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] mb-3" style={{ color: 'var(--text-muted)' }}>Sacred Patterns</p>
                <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                  {sacredGeometry.map(g => (
                    <div key={g.id} className="glass-card p-4" data-testid={`geometry-${g.id}`}>
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full" style={{ background: g.color }} />
                        <div>
                          <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{g.name}</p>
                          <p className="text-xs" style={{ color: g.color }}>{g.meaning}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] mb-3" style={{ color: 'var(--text-muted)' }}>
                {tab === 'iching' ? 'Your Question for the Oracle' : 'Focus Area (optional)'}
              </p>
              <textarea value={question} onChange={(e) => setQuestion(e.target.value)}
                className="input-glass w-full h-24 resize-none"
                placeholder={tab === 'iching' ? "What guidance do you seek from the I Ching?" : tab === 'tarot' ? "What does the universe want me to know?" : "What aspect of your life needs insight?"}
                data-testid="oracle-question-input" />
            </div>

            <button onClick={getReading} disabled={loading || (tab === 'astrology' && !selectedSign) || (tab === 'chinese' && !birthYear)}
              className="btn-glass w-full glow-primary flex items-center justify-center gap-3 py-4"
              data-testid="oracle-reading-btn"
              style={{ opacity: loading ? 0.6 : 1 }}>
              {loading ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
              {loading ? 'Consulting the Oracle...' : tab === 'tarot' ? 'Draw Cards' : tab === 'iching' ? 'Cast Hexagram' : tab === 'geometry' ? 'Receive Pattern' : 'Get Reading'}
            </button>

            {reading && (
              <button onClick={reset} className="btn-glass w-full text-sm flex items-center justify-center gap-2" data-testid="oracle-reset-btn">
                <RotateCcw size={14} /> New Reading
              </button>
            )}
          </div>

          {/* Reading Display */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {reading ? (
                <motion.div key="reading" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="glass-card p-8 md:p-10">

                  {/* Tarot */}
                  {reading.type === 'tarot' && (
                    <>
                      <p className="text-xs font-bold uppercase tracking-[0.2em] mb-6" style={{ color: '#D8B4FE' }}>
                        <Star size={12} className="inline mr-1" /> Your Tarot Reading
                      </p>
                      <div className="flex gap-4 justify-center mb-8 overflow-x-auto pb-2">
                        {reading.cards?.map((card, i) => (
                          <TarotCard key={i} card={card} index={i} revealed={revealed} />
                        ))}
                      </div>
                      <div className="border-t border-white/5 pt-6">
                        <p className="text-xs font-bold uppercase tracking-[0.2em] mb-4" style={{ color: 'var(--text-muted)' }}>Interpretation</p>
                        <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--text-secondary)' }} data-testid="tarot-interpretation">
                          {reading.interpretation}
                        </p>
                        <div className="mt-4">
                          <NarrationPlayer text={`Your Tarot Reading. ${reading.cards?.map(c => c.name).join(', ')}. ${reading.interpretation}`} label="Hear Your Reading" color="#D8B4FE" context="tarot" />
                        </div>
                      </div>
                    </>
                  )}

                  {/* Astrology */}
                  {reading.type === 'astrology' && (
                    <>
                      <div className="flex items-center gap-4 mb-6">
                        <div className="w-14 h-14 rounded-full flex items-center justify-center"
                          style={{ background: `${reading.sign?.color}20`, border: `1px solid ${reading.sign?.color}30` }}>
                          <Sun size={24} style={{ color: reading.sign?.color }} />
                        </div>
                        <div>
                          <p className="text-2xl font-light" style={{ fontFamily: 'Cormorant Garamond, serif', color: reading.sign?.color }}>
                            {reading.sign?.sign}
                          </p>
                          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                            {reading.sign?.element} &middot; {reading.sign?.ruler} &middot; {reading.sign?.symbol}
                          </p>
                        </div>
                      </div>
                      <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--text-secondary)' }} data-testid="astrology-reading">
                        {reading.reading}
                      </p>
                      <div className="mt-4">
                        <NarrationPlayer text={`${reading.sign?.sign}. ${reading.reading}`} label="Hear Your Reading" color={reading.sign?.color || '#FCD34D'} context="oracle" />
                      </div>
                    </>
                  )}

                  {/* Chinese Astrology */}
                  {reading.type === 'chinese_astrology' && (
                    <>
                      <div className="flex items-center gap-4 mb-6">
                        <div className="w-14 h-14 rounded-full flex items-center justify-center"
                          style={{ background: `${reading.animal?.color}20`, border: `1px solid ${reading.animal?.color}30` }}>
                          <Moon size={24} style={{ color: reading.animal?.color }} />
                        </div>
                        <div>
                          <p className="text-2xl font-light" style={{ fontFamily: 'Cormorant Garamond, serif', color: reading.animal?.color }}>
                            {reading.element} {reading.animal?.animal}
                          </p>
                          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                            Born {reading.year} &middot; {reading.animal?.traits}
                          </p>
                        </div>
                      </div>
                      <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--text-secondary)' }} data-testid="chinese-reading">
                        {reading.reading}
                      </p>
                      <div className="mt-4">
                        <NarrationPlayer text={`The ${reading.element} ${reading.animal?.animal}. ${reading.reading}`} label="Hear Your Reading" color={reading.animal?.color || '#EF4444'} context="oracle" />
                      </div>
                    </>
                  )}

                  {/* I Ching */}
                  {reading.type === 'iching' && (
                    <>
                      <p className="text-xs font-bold uppercase tracking-[0.2em] mb-4" style={{ color: '#2DD4BF' }}>
                        <Hexagon size={12} className="inline mr-1" /> Hexagram #{reading.hexagram_number}
                      </p>
                      <div className="flex justify-center">
                        <IChingHexagram lines={reading.lines || []} />
                      </div>
                      <div className="text-center mb-6">
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                          Lines: {reading.lines?.join(', ')} {reading.changing && '(* = changing lines)'}
                        </p>
                      </div>
                      <div className="border-t border-white/5 pt-6">
                        <p className="text-xs font-bold uppercase tracking-[0.2em] mb-4" style={{ color: 'var(--text-muted)' }}>Oracle Speaks</p>
                        <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--text-secondary)' }} data-testid="iching-interpretation">
                          {reading.interpretation}
                        </p>
                        <div className="mt-4">
                          <NarrationPlayer text={`Hexagram number ${reading.hexagram_number}. ${reading.interpretation}`} label="Hear the Oracle" color="#2DD4BF" context="oracle" />
                        </div>
                      </div>
                    </>
                  )}

                  {/* Sacred Geometry */}
                  {reading.type === 'sacred_geometry' && (
                    <>
                      <div className="flex flex-col items-center mb-6">
                        <GeometryPattern pattern={reading.pattern || {}} />
                        <p className="text-2xl font-light mt-4" style={{ fontFamily: 'Cormorant Garamond, serif', color: reading.pattern?.color }}>
                          {reading.pattern?.name}
                        </p>
                        <p className="text-xs mt-1" style={{ color: reading.pattern?.color }}>{reading.pattern?.meaning}</p>
                      </div>
                      <p className="text-xs leading-relaxed mb-6" style={{ color: 'var(--text-muted)' }}>
                        {reading.pattern?.description}
                      </p>
                      <div className="border-t border-white/5 pt-6">
                        <p className="text-xs font-bold uppercase tracking-[0.2em] mb-4" style={{ color: 'var(--text-muted)' }}>Meditation</p>
                        <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--text-secondary)' }} data-testid="geometry-meditation">
                          {reading.meditation}
                        </p>
                        <div className="mt-4">
                          <NarrationPlayer text={`${reading.pattern?.name}. ${reading.pattern?.meaning}. ${reading.meditation}`} label="Guided Meditation" color={reading.pattern?.color || '#D8B4FE'} context="oracle" />
                        </div>
                      </div>
                    </>
                  )}
                </motion.div>
              ) : (
                <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="glass-card p-12 flex flex-col items-center justify-center min-h-[400px] text-center">
                  <div className="relative mb-6">
                    {[0, 1, 2].map(i => (
                      <motion.div key={i}
                        animate={{ rotate: 360, scale: [1, 1.1, 1] }}
                        transition={{ duration: 8 + i * 3, repeat: Infinity, ease: 'linear' }}
                        className="absolute rounded-full border"
                        style={{ width: `${80 + i * 40}px`, height: `${80 + i * 40}px`, top: `${-(i * 20)}px`, left: `${-(i * 20)}px`, borderColor: `rgba(216,180,254,${0.15 - i * 0.03})` }} />
                    ))}
                    <Sparkles size={32} style={{ color: 'var(--text-muted)', opacity: 0.4, position: 'relative', zIndex: 1, margin: '24px' }} />
                  </div>
                  <p className="text-lg" style={{ fontFamily: 'Cormorant Garamond, serif', color: 'var(--text-muted)' }}>
                    {tab === 'tarot' ? 'The cards await your question' :
                     tab === 'iching' ? 'The hexagram waits to be cast' :
                     tab === 'geometry' ? 'Sacred patterns hold your answer' :
                     'The cosmos is ready to speak'}
                  </p>
                  <p className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>
                    Focus your intention, then consult the oracle
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
