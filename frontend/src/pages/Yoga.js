import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Sparkles } from 'lucide-react';
import DeepDive from '../components/DeepDive';
import NarrationPlayer from '../components/NarrationPlayer';
import FeaturedVideos from '../components/FeaturedVideos';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

function PoseItem({ pose, color, styleName }) {
  const [expanded, setExpanded] = useState(false);
  const [xpShown, setXpShown] = useState(false);

  const handleTap = () => {
    if (!expanded) { setXpShown(true); setTimeout(() => setXpShown(false), 2000); if (typeof window.__workAccrue === 'function') window.__workAccrue('yoga', 5); }
    setExpanded(!expanded);
  };

  return (
    <div style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
      <button onClick={handleTap} className="w-full text-left py-4 flex items-start gap-3 active:opacity-80" data-testid={`pose-${pose.name?.replace(/\s/g,'-').toLowerCase()}`}>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${color}20`, border: `1px solid ${color}30` }}>
          <span style={{ color, fontSize: 18 }}>🧘</span>
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <p className="text-base font-semibold text-white">{pose.name}</p>
            <AnimatePresence>{xpShown && <motion.span initial={{opacity:0,y:5}} animate={{opacity:1,y:0}} exit={{opacity:0}} className="text-[10px] font-bold" style={{color:'#22C55E'}}><Sparkles size={10} className="inline"/> +5 XP</motion.span>}</AnimatePresence>
          </div>
          {pose.sanskrit && <p className="text-xs mt-0.5" style={{ color }}>{pose.sanskrit}</p>}
          {pose.duration && <p className="text-[10px] mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>{pose.duration}</p>}
        </div>
        <ChevronDown size={14} style={{ color: expanded ? color : 'rgba(255,255,255,0.2)', transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', marginTop: 6 }} />
      </button>
      <AnimatePresence>
        {expanded && (
          <motion.div initial={{height:0,opacity:0}} animate={{height:'auto',opacity:1}} exit={{height:0,opacity:0}} className="overflow-hidden">
            <div className="pb-4 pl-[52px]">
              {pose.description && <p className="text-sm leading-relaxed mb-3" style={{color:'rgba(255,255,255,0.75)'}}>{pose.description}</p>}
              {pose.benefits && (
                <div className="mb-3">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-2" style={{color}}>Benefits</p>
                  <div className="flex flex-wrap gap-1.5">
                    {(Array.isArray(pose.benefits) ? pose.benefits : [pose.benefits]).map((b,i) => (
                      <span key={i} className="text-xs px-2.5 py-1 rounded-full" style={{background:`${color}12`,color,border:`1px solid ${color}20`}}>{b}</span>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex items-center gap-2 flex-wrap mt-2">
                <NarrationPlayer text={`${pose.name}. ${pose.description || ''}`} label="Listen" color={color} context="yoga" />
                <DeepDive topic={`${pose.name} yoga pose`} category="yoga" context={styleName} color={color} label={`Explore ${pose.name}`} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StyleCard({ style, onSelect, active }) {
  return (
    <button onClick={() => onSelect(style)} className="w-full text-left py-4 active:opacity-80"
      style={{ borderBottom: `1px solid ${active?.id === style.id ? style.color + '30' : 'rgba(255,255,255,0.06)'}` }}
      data-testid={`style-${style.id}`}>
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: `${style.color}20`, border: `1px solid ${style.color}30` }}>
          <span style={{ fontSize: 22 }}>🕉</span>
        </div>
        <div className="flex-1">
          <p className="text-base font-semibold text-white">{style.name}</p>
          <p className="text-xs" style={{ color: style.color }}>{style.subtitle}</p>
          <p className="text-sm mt-1 line-clamp-2" style={{ color: 'rgba(255,255,255,0.6)' }}>{style.desc?.substring(0,100)}...</p>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {(style.benefits || []).slice(0,3).map((b,i) => (
              <span key={i} className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: `${style.color}12`, color: style.color, border: `1px solid ${style.color}20` }}>{b}</span>
            ))}
          </div>
          <div className="flex items-center gap-3 mt-2 text-[10px]" style={{ color: 'rgba(255,255,255,0.4)' }}>
            <span>{style.difficulty}</span>
            <span>{style.duration_range}</span>
            <span>{style.sequences?.length || style.poses?.length || 0} sequences</span>
          </div>
        </div>
      </div>
    </button>
  );
}

export default function Yoga() {
  const [styles, setStyles] = useState([]);
  const [activeStyle, setActiveStyle] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { if (typeof window.__workAccrue === 'function') window.__workAccrue('yoga', 8); }, []);
  useEffect(() => {
    axios.get(`${API}/yoga/styles`).then(r => setStyles(r.data.styles || []))
      .catch(() => toast.error('Could not load yoga styles'))
      .finally(() => setLoading(false));
  }, []);

  const selectStyle = async (style) => {
    if (activeStyle?.id === style.id) { setActiveStyle(null); return; }
    try {
      const res = await axios.get(`${API}/yoga/style/${style.id}`);
      setActiveStyle(res.data);
    } catch {
      setActiveStyle(style);
    }
  };

  return (
    <div className="min-h-screen pt-20 pb-24 px-5 max-w-3xl mx-auto" data-testid="yoga-page">
      <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}}>
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] mb-1" style={{color:'#FCD34D'}}>🕉 Sacred Movement</p>
        <h1 className="text-3xl font-light mb-2" style={{fontFamily:'Cormorant Garamond, serif',color:'#fff'}}>Yoga Studio</h1>
        <p className="text-sm mb-8" style={{color:'rgba(255,255,255,0.6)'}}>Ancient paths of movement, breath, and awakening</p>

        {/* Active style detail + poses */}
        <AnimatePresence>
          {activeStyle && (
            <motion.div initial={{height:0,opacity:0}} animate={{height:'auto',opacity:1}} exit={{height:0,opacity:0}} className="overflow-hidden mb-6">
              <div className="pb-4" style={{borderBottom:`1px solid ${activeStyle.color}20`}}>
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h2 className="text-xl font-bold text-white">{activeStyle.name}</h2>
                    <p className="text-xs" style={{color:activeStyle.color}}>{activeStyle.subtitle}</p>
                  </div>
                  <button onClick={() => setActiveStyle(null)} className="text-xs px-3 py-1 rounded-full" style={{color:'rgba(255,255,255,0.4)',border:'1px solid rgba(255,255,255,0.08)'}}>Back</button>
                </div>
                <p className="text-sm mb-4" style={{color:'rgba(255,255,255,0.7)'}}>{activeStyle.desc}</p>
                {(activeStyle.sequences || []).map((seq, si) => (
                  <div key={si} className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{color:activeStyle.color}}>{seq.name}</p>
                      <span className="text-[10px]" style={{color:'rgba(255,255,255,0.3)'}}>{seq.duration}min · {seq.level} · {seq.poses?.length || 0} poses</span>
                    </div>
                    {(seq.poses || []).map((pose, i) => (
                      <PoseItem key={i} pose={pose} color={activeStyle.color} styleName={activeStyle.name} />
                    ))}
                  </div>
                ))}
                <div className="mt-4">
                  <DeepDive topic={`${activeStyle.name} yoga`} category="yoga" context={activeStyle.subtitle} color={activeStyle.color} label={`Explore ${activeStyle.name} deeper`} />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Style list */}
        {!activeStyle && styles.map(s => <StyleCard key={s.id} style={s} onSelect={selectStyle} active={activeStyle} />)}

        <FeaturedVideos category="exercises" color="#FCD34D" title="Yoga Practice Videos" />
      </motion.div>
    </div>
  );
}
