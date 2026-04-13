import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Lock, Unlock, Sparkles, HelpCircle, CheckCircle2, Send } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const NODE_COLORS = { Water: '#3B82F6', Air: '#A855F7', Fire: '#EF4444', Earth: '#22C55E', Ether: '#FCD34D' };

export default function CrypticQuestNodes() {
  const { authHeaders, token } = useAuth();
  const navigate = useNavigate();
  const [nodes, setNodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeNode, setActiveNode] = useState(null);
  const [answer, setAnswer] = useState('');
  const [solving, setSolving] = useState(false);

  const fetchNodes = useCallback(async () => {
    if (!token) { setLoading(false); return; }
    try {
      const { data } = await axios.get(`${API}/gaming/quest/nodes`, { headers: authHeaders });
      setNodes(data.nodes);
    } catch { toast.error('Failed to load quest nodes'); }
    finally { setLoading(false); }
  }, [authHeaders, token]);

  useEffect(() => { fetchNodes(); }, [fetchNodes]);
  useEffect(() => { if (typeof window.__workAccrue === 'function') window.__workAccrue('oracle_reading', 12); }, []);

  const handleSolve = async () => {
    if (!activeNode || !answer.trim()) return;
    setSolving(true);
    try {
      const { data } = await axios.post(`${API}/gaming/quest/solve`, { node_id: activeNode.id, answer }, { headers: authHeaders });
      if (data.correct) {
        toast.success(`Solved "${data.node_name}"! +${data.dust_earned} Dust`);
        setActiveNode(null);
        setAnswer('');
        fetchNodes();
      } else {
        toast.error(`Incorrect. Hint: ${data.hint}`);
      }
    } catch (e) { toast.error(e.response?.data?.detail || 'Failed'); }
    finally { setSolving(false); }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center" style={{ background: '#030308' }}><Sparkles className="animate-spin" color="#FCD34D" /></div>;

  const solved = nodes.filter(n => n.solved).length;

  return (
    <div className="min-h-screen pb-24" style={{ background: '#030308' }} data-testid="cryptic-quest-page">
      <div className="flex items-center justify-between px-4 py-3 sticky top-0 z-40" style={{ background: 'rgba(3,3,8,0.9)', backdropFilter: 'blur(20px)' }}>
        <button onClick={() => navigate(-1)} className="p-2 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)' }} data-testid="quest-back-btn"><ArrowLeft size={16} color="#F8FAFC" /></button>
        <h1 className="text-sm font-bold" style={{ color: '#F8FAFC' }}>Cryptic Quest Nodes</h1>
        <div className="text-[10px]" style={{ color: '#FCD34D' }}>{solved}/{nodes.length}</div>
      </div>
      <div className="px-4 pt-2">
        <div className="space-y-3">
          {nodes.map(node => {
            const color = NODE_COLORS[node.element] || '#A855F7';
            const isActive = activeNode?.id === node.id;
            return (
              <motion.div key={node.id} layout
                className="rounded-2xl p-4 transition-all" style={{ background: node.solved ? `${color}08` : 'rgba(255,255,255,0.03)', border: `1px solid ${node.solved ? `${color}25` : node.locked ? 'rgba(255,255,255,0.04)' : `${color}15`}`, opacity: node.locked ? 0.5 : 1 }}>
                <div className="flex items-center justify-between mb-2 cursor-pointer" onClick={() => !node.locked && !node.solved && setActiveNode(isActive ? null : node)}>
                  <div className="flex items-center gap-2">
                    {node.solved ? <CheckCircle2 size={14} color={color} /> : node.locked ? <Lock size={14} color="#666" /> : <Unlock size={14} color={color} />}
                    <span className="text-sm font-bold" style={{ color: node.solved ? color : '#F8FAFC' }}>{node.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] px-2 py-0.5 rounded-md" style={{ background: `${color}15`, color }}>{node.element}</span>
                    <span className="text-[9px]" style={{ color: '#A855F7' }}>+{node.dust_reward}</span>
                  </div>
                </div>
                {node.solved && <div className="text-[10px]" style={{ color: `${color}80` }}>Completed</div>}
                {!node.solved && !node.locked && (
                  <div className="text-[10px] flex items-center gap-1" style={{ color: 'rgba(248,250,252,0.4)' }}>
                    <HelpCircle size={10} /> {node.hint}
                  </div>
                )}
                <AnimatePresence>
                  {isActive && !node.solved && !node.locked && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="mt-3 flex gap-2">
                      <input value={answer} onChange={e => setAnswer(e.target.value)} placeholder="Your answer..."
                        className="flex-1 px-3 py-2 rounded-lg text-xs outline-none" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#F8FAFC' }}
                        onKeyDown={e => e.key === 'Enter' && handleSolve()} data-testid="quest-answer-input" />
                      <button onClick={handleSolve} disabled={solving} className="px-3 py-2 rounded-lg" style={{ background: `${color}15`, border: `1px solid ${color}30`, color }} data-testid="quest-submit-btn">
                        <Send size={14} />
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
