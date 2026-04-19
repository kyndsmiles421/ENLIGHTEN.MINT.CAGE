import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { ArrowLeft, ChevronRight, Search, Sparkles, Compass, Feather } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

function TotemCard({ totem, onClick }) {
  return (
    <motion.button whileHover={{ y: -3 }} onClick={onClick} className="p-5 text-left w-full" data-testid={`totem-${totem.id}`}>
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center text-lg" style={{ background: `${totem.color}12`, border: `1px solid ${totem.color}20` }}>
          <Feather size={20} style={{ color: totem.color }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{totem.name}</p>
          <p className="text-[10px]" style={{ color: totem.color }}>{totem.dates} &middot; {totem.element}</p>
          <p className="text-xs mt-1 line-clamp-1" style={{ color: 'var(--text-muted)' }}>{totem.power?.slice(0, 80)}...</p>
        </div>
        <ChevronRight size={14} style={{ color: 'var(--text-muted)' }} />
      </div>
    </motion.button>
  );
}

function SpiritCard({ animal, onClick }) {
  return (
    <motion.button whileHover={{ y: -2 }} onClick={() => onClick(animal)} className="p-4 text-left" data-testid={`spirit-${animal.id}`}>
      <Feather size={16} className="mb-2" style={{ color: animal.color }} />
      <p className="text-sm font-medium mb-0.5" style={{ color: 'var(--text-primary)' }}>{animal.name}</p>
      <p className="text-[10px]" style={{ color: animal.color }}>{animal.element}</p>
    </motion.button>
  );
}

function AnimalDetail({ animal, onBack, isBirthTotem, companion, challenger }) {
  return (
    <div data-testid="animal-detail">
      <button onClick={onBack} className="flex items-center gap-2 text-xs mb-6 group" style={{ color: 'var(--text-muted)' }} data-testid="totem-back-btn">
        <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> All Totems
      </button>
      <div className="flex items-start gap-5 mb-6">
        <div className="w-20 h-20 rounded-2xl flex items-center justify-center" style={{ background: `${animal.color}12`, border: `1px solid ${animal.color}20` }}>
          <Feather size={32} style={{ color: animal.color }} />
        </div>
        <div>
          <h2 className="text-2xl font-light" style={{ fontFamily: 'Cormorant Garamond, serif', color: 'var(--text-primary)' }}>{animal.name}</h2>
          {animal.dates && <p className="text-xs" style={{ color: animal.color }}>{animal.dates}</p>}
          <div className="flex gap-2 mt-2 flex-wrap">
            {animal.element && <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: `${animal.color}08`, color: animal.color }}>{animal.element}</span>}
            {animal.direction && <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: 'rgba(255,255,255,0.03)', color: 'var(--text-muted)' }}>{animal.direction}</span>}
            {animal.clan && <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: 'rgba(255,255,255,0.03)', color: 'var(--text-muted)' }}>{animal.clan} Clan</span>}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {[
          { label: 'Power & Gift', content: animal.power, color: '#22C55E' },
          { label: 'Shadow', content: animal.shadow, color: '#FB923C' },
          { label: 'Medicine', content: animal.medicine, color: animal.color },
          { label: 'When This Spirit Appears', content: animal.when_appears, color: '#A78BFA' },
          { label: 'Dream Meaning', content: animal.dream_meaning, color: '#3B82F6' },
        ].filter(s => s.content).map(section => (
          <div key={section.label} className="p-5" style={{ borderColor: `${section.color}10` }}>
            <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: section.color }}>{section.label}</p>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{section.content}</p>
          </div>
        ))}
      </div>

      {animal.stone && (
        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="p-4">
            <p className="text-[10px] uppercase tracking-widest mb-1" style={{ color: 'var(--text-muted)' }}>Sacred Stone</p>
            <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{animal.stone}</p>
          </div>
          <div className="p-4">
            <p className="text-[10px] uppercase tracking-widest mb-1" style={{ color: 'var(--text-muted)' }}>Plant Ally</p>
            <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{animal.plant}</p>
          </div>
        </div>
      )}

      {(companion || challenger) && (
        <div className="grid grid-cols-2 gap-3 mt-4">
          {companion && (
            <div className="p-4" style={{ borderColor: `${companion.color}10` }}>
              <p className="text-[10px] uppercase tracking-widest mb-1" style={{ color: '#22C55E' }}>Complementary Totem</p>
              <p className="text-sm" style={{ color: companion.color }}>{companion.name}</p>
            </div>
          )}
          {challenger && (
            <div className="p-4" style={{ borderColor: `${challenger.color}10` }}>
              <p className="text-[10px] uppercase tracking-widest mb-1" style={{ color: '#FB923C' }}>Challenging Totem</p>
              <p className="text-sm" style={{ color: challenger.color }}>{challenger.name}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function BirthTotemCalc({ totems, onSelect }) {
  const [month, setMonth] = useState('');
  const [day, setDay] = useState('');
  const [result, setResult] = useState(null);

  const calculate = async () => {
    if (!month || !day) return;
    try {
      const r = await axios.get(`${API}/animal-totems/birth?month=${month}&day=${day}`);
      setResult(r.data);
    } catch {}
  };

  return (
    <div className="p-6 mb-8" data-testid="birth-totem-calc">
      <p className="text-xs font-bold uppercase tracking-[0.2em] mb-3" style={{ color: '#22C55E' }}>
        <Compass size={12} className="inline mr-1" /> Find Your Birth Totem
      </p>
      <div className="flex gap-3 items-end flex-wrap mb-4">
        <div>
          <p className="text-[10px] uppercase tracking-widest mb-1" style={{ color: 'var(--text-muted)' }}>Month</p>
          <select value={month} onChange={e => setMonth(e.target.value)} className="input-glass text-sm" data-testid="totem-month">
            <option value="">--</option>
            {['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'].map((m,i) => <option key={i+1} value={i+1}>{m}</option>)}
          </select>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-widest mb-1" style={{ color: 'var(--text-muted)' }}>Day</p>
          <select value={day} onChange={e => setDay(e.target.value)} className="input-glass text-sm" data-testid="totem-day">
            <option value="">--</option>
            {Array.from({length:31},(_,i) => <option key={i+1} value={i+1}>{i+1}</option>)}
          </select>
        </div>
        <button onClick={calculate} className="px-5 py-2.5 rounded-xl text-xs font-medium" style={{ background:'rgba(34,197,94,0.1)', color:'#22C55E', border:'1px solid rgba(34,197,94,0.15)' }} data-testid="totem-calculate">
          <Sparkles size={12} className="inline mr-1" /> Reveal
        </button>
      </div>
      {result && (
        <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} className="p-5 cursor-pointer" style={{borderColor:`${result.totem.color}15`}} onClick={() => onSelect(result.totem)}>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl flex items-center justify-center" style={{background:`${result.totem.color}12`}}>
              <Feather size={24} style={{color:result.totem.color}} />
            </div>
            <div>
              <p className="text-lg font-light" style={{fontFamily:'Cormorant Garamond, serif', color:'var(--text-primary)'}}>{result.totem.name}</p>
              <p className="text-xs" style={{color:result.totem.color}}>{result.totem.dates} &middot; {result.totem.element} &middot; {result.totem.clan} Clan</p>
              <p className="text-xs mt-1" style={{color:'var(--text-muted)'}}>{result.totem.power?.slice(0,100)}...</p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

export default function AnimalTotems() {
  const [totems, setTotems] = useState([]);
  const [spirits, setSpirits] = useState([]);
  const [active, setActive] = useState(null);
  const [companion, setCompanion] = useState(null);
  const [challenger, setChallenger] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => { if (typeof window.__workAccrue === 'function') window.__workAccrue('animal_totems', 8); }, []);
  useEffect(() => {
    axios.get(`${API}/animal-totems/all`).then(r => { setTotems(r.data.birth_totems); setSpirits(r.data.spirit_animals); }).catch(() => {});
  }, []);

  const selectAnimal = (animal) => {
    setActive(animal);
    setCompanion(animal.complementary ? totems.find(t => t.id === animal.complementary) : null);
    setChallenger(animal.challenging ? totems.find(t => t.id === animal.challenging) : null);
  };

  const filtered = search ? totems.filter(t => t.name.toLowerCase().includes(search.toLowerCase())) : totems;

  return (
    <div className="min-h-screen pt-20 pb-40 px-5" data-testid="animal-totems-page">
      <div className="max-w-4xl mx-auto relative z-10">
        <AnimatePresence mode="wait">
          {active ? (
            <motion.div key={active.id} initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-20}}>
              <AnimalDetail animal={active} onBack={() => setActive(null)} companion={companion} challenger={challenger} />
            </motion.div>
          ) : (
            <motion.div key="list" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
              <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}}>
                <p className="text-xs font-bold uppercase tracking-[0.3em] mb-2" style={{color:'#22C55E'}}>
                  <Feather size={14} className="inline mr-2" /> Animal Speak
                </p>
                <h1 className="text-3xl md:text-3xl font-light tracking-tight mb-3" style={{fontFamily:'Cormorant Garamond, serif'}}>
                  Spirit Animal Totems
                </h1>
                <p className="text-base mb-8" style={{color:'var(--text-secondary)'}}>
                  Discover your birth totem from the Native American Medicine Wheel, explore spirit animal wisdom, and learn what messages the animal kingdom has for you.
                </p>
              </motion.div>

              <BirthTotemCalc totems={totems} onSelect={selectAnimal} />

              <div className="flex items-center gap-3 mb-6">
                <div className="flex-1 relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{color:'var(--text-muted)'}} />
                  <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search animals..."
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm bg-transparent" style={{border:'1px solid rgba(255,255,255,0.06)', color:'var(--text-primary)'}} data-testid="totem-search" />
                </div>
              </div>

              <p className="text-xs font-bold uppercase tracking-[0.2em] mb-4" style={{color:'var(--text-muted)'}}>Medicine Wheel — 12 Birth Totems</p>
              <div className="space-y-3 mb-10">
                {filtered.map((t, i) => (
                  <motion.div key={t.id} initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{delay:i*0.03}}>
                    <TotemCard totem={t} onClick={() => selectAnimal(t)} />
                  </motion.div>
                ))}
              </div>

              <p className="text-xs font-bold uppercase tracking-[0.2em] mb-4" style={{color:'var(--text-muted)'}}>Spirit Animal Guides</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {spirits.map(a => <SpiritCard key={a.id} animal={a} onClick={selectAnimal} />)}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
