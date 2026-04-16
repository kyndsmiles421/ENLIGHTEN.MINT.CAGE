import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Sparkles, Music } from 'lucide-react';
import DeepDive from '../components/DeepDive';
import NarrationPlayer from '../components/NarrationPlayer';
import FeaturedVideos from '../components/FeaturedVideos';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

function MantraItem({ mantra, index }) {
  const [expanded, setExpanded] = useState(false);
  const [xpShown, setXpShown] = useState(false);
  const color = mantra.energy === 'power' ? '#EF4444' : mantra.energy === 'memory' ? '#8B5CF6' : mantra.energy === 'adventure' ? '#FB923C' : mantra.energy === 'love' ? '#F472B6' : '#FCD34D';

  const handleTap = () => {
    if (!expanded) { setXpShown(true); setTimeout(() => setXpShown(false), 2000); if (typeof window.__workAccrue === 'function') window.__workAccrue('mantras', 5); }
    setExpanded(!expanded);
  };

  return (
    <div style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
      <button onClick={handleTap} className="w-full text-left py-4 flex items-start gap-3 active:opacity-80" data-testid={`mantra-${index}`}>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${color}15`, border: `1px solid ${color}20` }}>
          <Music size={14} style={{ color }} />
        </div>
        <div className="flex-1">
          <p className="text-base font-light italic text-white" style={{ fontFamily: 'Cormorant Garamond, serif' }}>"{mantra.text}"</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: `${color}12`, color, border: `1px solid ${color}20` }}>{mantra.category}</span>
            <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.4)' }}>{mantra.energy}</span>
            <AnimatePresence>{xpShown && <motion.span initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="text-[10px] font-bold" style={{color:'#22C55E'}}><Sparkles size={9} className="inline"/> +5 XP</motion.span>}</AnimatePresence>
          </div>
        </div>
        <ChevronDown size={14} style={{ color: expanded ? color : 'rgba(255,255,255,0.2)', transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', marginTop: 6 }} />
      </button>
      <AnimatePresence>
        {expanded && (
          <motion.div initial={{height:0,opacity:0}} animate={{height:'auto',opacity:1}} exit={{height:0,opacity:0}} className="overflow-hidden">
            <div className="pb-4 pl-11">
              <div className="flex items-center gap-2 flex-wrap">
                <NarrationPlayer text={mantra.text} label="Chant" color={color} context="mantras" />
                <DeepDive topic={mantra.text} category="mantras" context={mantra.category} color={color} label="Explore meaning" />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Mantras() {
  const [mantras, setMantras] = useState([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => { if (typeof window.__workAccrue === 'function') window.__workAccrue('mantras', 8); }, []);
  useEffect(() => {
    axios.get(`${API}/mantras`).then(res => setMantras(res.data.mantras || [])).catch(() => toast.error('Could not load mantras'));
  }, []);

  const categories = [...new Set(mantras.map(m => m.category).filter(Boolean))];
  const filtered = filter === 'all' ? mantras : mantras.filter(m => m.category === filter);

  return (
    <div className="min-h-screen pt-20 pb-24 px-5 max-w-3xl mx-auto" data-testid="mantras-page">
      <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}}>
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] mb-1" style={{color:'#FCD34D'}}>🕉 Sacred Vibration</p>
        <h1 className="text-3xl font-light mb-2" style={{fontFamily:'Cormorant Garamond, serif',color:'#fff'}}>Mantra Hall</h1>
        <p className="text-sm mb-6" style={{color:'rgba(255,255,255,0.6)'}}>Sacred words that reshape reality through vibration</p>

        <div className="flex gap-2 mb-6 overflow-x-auto pb-1" style={{scrollbarWidth:'none'}}>
          <button onClick={() => setFilter('all')} className="px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap"
            style={{ background: filter === 'all' ? 'rgba(252,211,77,0.2)' : 'rgba(255,255,255,0.03)', border: `1px solid ${filter === 'all' ? 'rgba(252,211,77,0.4)' : 'rgba(255,255,255,0.06)'}`, color: filter === 'all' ? '#FCD34D' : 'rgba(255,255,255,0.5)' }}>All ({mantras.length})</button>
          {categories.map(c => (
            <button key={c} onClick={() => setFilter(c)} className="px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap capitalize"
              style={{ background: filter === c ? 'rgba(252,211,77,0.2)' : 'rgba(255,255,255,0.03)', border: `1px solid ${filter === c ? 'rgba(252,211,77,0.4)' : 'rgba(255,255,255,0.06)'}`, color: filter === c ? '#FCD34D' : 'rgba(255,255,255,0.5)' }}>{c} ({mantras.filter(m=>m.category===c).length})</button>
          ))}
        </div>

        {filtered.map((m, i) => <MantraItem key={i} mantra={m} index={i} />)}

        <FeaturedVideos category="mantras" color="#FCD34D" title="Mantra Practice Videos" />
      </motion.div>
    </div>
  );
}
