import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import {
  ArrowLeft, Search, X, Gem, Heart, Shield, Sparkles, Eye,
  Zap, Plus, ChevronRight, Star, Loader2, Mountain, Waves,
  Flame, Wind, Filter, BookOpen, Pickaxe, Trophy
} from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

function CrystalCard({ crystal, onClick }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      className="glass-card p-4 cursor-pointer transition-all hover:scale-[1.02]"
      onClick={() => onClick(crystal)}
      data-testid={`crystal-card-${crystal.id}`}>
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: `${crystal.color}15`, border: `1px solid ${crystal.color}30` }}>
          <Gem size={18} style={{ color: crystal.color }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{crystal.name}</p>
          <p className="text-[9px] italic" style={{ color: crystal.color }}>{crystal.aka}</p>
          <p className="text-[10px] mt-1 line-clamp-2" style={{ color: 'var(--text-muted)' }}>{crystal.description}</p>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <span className="text-[8px] px-1.5 py-0.5 rounded-full" style={{ background: `${crystal.color}10`, color: crystal.color }}>{crystal.chakra}</span>
            <span className="text-[8px] px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(248,250,252,0.04)', color: 'var(--text-muted)' }}>{crystal.element}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function CrystalDetail({ crystal, onClose, authHeaders, onCollected }) {
  const [adding, setAdding] = useState(false);

  const addToCollection = async () => {
    setAdding(true);
    try {
      await axios.post(`${API}/crystals/collection/add`, { crystal_id: crystal.id }, { headers: authHeaders });
      toast.success(`${crystal.name} added to your collection!`);
      if (onCollected) onCollected();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to add');
    }
    setAdding(false);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(10px)' }}
      onClick={onClose}>
      <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }}
        className="w-full max-w-md max-h-[80vh] overflow-y-auto rounded-xl"
        style={{ background: 'var(--bg-secondary)', border: `1px solid ${crystal.color}20` }}
        onClick={e => e.stopPropagation()}
        data-testid="crystal-detail-modal">
        <div className="p-5 text-center" style={{ borderBottom: `1px solid ${crystal.color}10` }}>
          <div className="w-16 h-16 rounded-2xl mx-auto mb-3 flex items-center justify-center"
            style={{ background: `${crystal.color}12`, border: `2px solid ${crystal.color}30` }}>
            <Gem size={28} style={{ color: crystal.color }} />
          </div>
          <h2 className="text-xl font-light" style={{ color: 'var(--text-primary)', fontFamily: 'Cormorant Garamond, serif' }}>{crystal.name}</h2>
          <p className="text-xs italic" style={{ color: crystal.color }}>{crystal.aka}</p>
          <button onClick={onClose} className="absolute top-4 right-4 p-1 rounded hover:bg-white/5"><X size={14} style={{ color: 'var(--text-muted)' }} /></button>
        </div>
        <div className="p-5 space-y-4">
          <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{crystal.description}</p>

          <div className="grid grid-cols-3 gap-2 text-center">
            {[
              { label: 'Chakra', value: crystal.chakra, icon: Eye },
              { label: 'Element', value: crystal.element, icon: Wind },
              { label: 'Hardness', value: `${crystal.hardness}/10`, icon: Shield },
            ].map(s => (
              <div key={s.label} className="rounded-lg p-2" style={{ background: 'rgba(248,250,252,0.02)' }}>
                <s.icon size={12} className="mx-auto mb-1" style={{ color: crystal.color }} />
                <p className="text-[10px] font-medium" style={{ color: 'var(--text-primary)' }}>{s.value}</p>
                <p className="text-[7px]" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
              </div>
            ))}
          </div>

          <div>
            <p className="text-[10px] uppercase tracking-widest font-bold mb-1.5" style={{ color: 'var(--text-muted)' }}>Spiritual Significance</p>
            <p className="text-[11px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{crystal.spiritual}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest font-bold mb-1.5" style={{ color: 'var(--text-muted)' }}>Healing Properties</p>
            <p className="text-[11px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{crystal.healing}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest font-bold mb-1.5" style={{ color: 'var(--text-muted)' }}>Best Used For</p>
            <div className="flex flex-wrap gap-1.5">
              {crystal.uses.map(u => (
                <span key={u} className="text-[9px] px-2 py-1 rounded-full" style={{ background: `${crystal.color}08`, color: crystal.color, border: `1px solid ${crystal.color}15` }}>{u}</span>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-between text-[9px]" style={{ color: 'var(--text-muted)' }}>
            <span>Zodiac: {crystal.zodiac}</span>
            <span className="capitalize">Rarity: {crystal.rarity}</span>
          </div>
          <button onClick={addToCollection} disabled={adding}
            className="w-full py-2.5 rounded-lg text-xs font-medium transition-all hover:scale-[1.02]"
            style={{ background: `${crystal.color}12`, color: crystal.color, border: `1px solid ${crystal.color}25` }}
            data-testid="add-to-collection-btn">
            {adding ? <Loader2 size={14} className="animate-spin mx-auto" /> : 'Add to My Collection'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function RockHoundGame({ authHeaders, onFound }) {
  const [environments, setEnvironments] = useState([]);
  const [selectedEnv, setSelectedEnv] = useState(null);
  const [digging, setDigging] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    axios.get(`${API}/crystals/rockhound/environments`, { headers: authHeaders })
      .then(r => setEnvironments(r.data.environments))
      .catch(() => {});
  }, [authHeaders]);

  const dig = async (envId) => {
    setDigging(true);
    setResult(null);
    setSelectedEnv(envId);
    await new Promise(r => setTimeout(r, 1500));
    try {
      const res = await axios.post(`${API}/crystals/rockhound/dig`, { environment_id: envId }, { headers: authHeaders });
      setResult(res.data);
      if (res.data.found) {
        toast.success(`Found ${res.data.crystal.name}!`);
        if (onFound) onFound();
      } else {
        toast('Nothing this time... try another spot!');
      }
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Dig failed');
    }
    setDigging(false);
  };

  const envIcons = { riverbed: Waves, volcanic: Flame, ocean: Waves, mountain: Mountain };

  return (
    <div data-testid="rockhound-game">
      <div className="text-center mb-4">
        <Pickaxe size={20} className="mx-auto mb-2" style={{ color: '#D97706' }} />
        <h3 className="text-base font-light" style={{ color: 'var(--text-primary)', fontFamily: 'Cormorant Garamond, serif' }}>Rock Hounding</h3>
        <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>3 digs per day - discover hidden crystals</p>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-4">
        {environments.map(env => {
          const EnvIcon = envIcons[env.id] || Mountain;
          const colors = { easy: '#22C55E', medium: '#EAB308', hard: '#EF4444' };
          return (
            <button key={env.id} onClick={() => dig(env.id)} disabled={digging}
              className="glass-card p-3 text-left transition-all hover:scale-[1.02] disabled:opacity-50"
              data-testid={`dig-env-${env.id}`}>
              <EnvIcon size={16} className="mb-1.5" style={{ color: colors[env.difficulty] }} />
              <p className="text-[11px] font-medium" style={{ color: 'var(--text-primary)' }}>{env.name}</p>
              <p className="text-[8px]" style={{ color: 'var(--text-muted)' }}>{env.description}</p>
              <span className="text-[7px] px-1 py-0.5 rounded mt-1 inline-block capitalize"
                style={{ background: `${colors[env.difficulty]}10`, color: colors[env.difficulty] }}>{env.difficulty}</span>
            </button>
          );
        })}
      </div>

      <AnimatePresence>
        {digging && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-6">
            <Pickaxe size={24} className="mx-auto mb-2 animate-bounce" style={{ color: '#D97706' }} />
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Digging...</p>
          </motion.div>
        )}
        {result && !digging && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="glass-card p-4 text-center" data-testid="dig-result">
            {result.found ? (
              <>
                <Gem size={24} className="mx-auto mb-2" style={{ color: result.crystal.color }} />
                <p className="text-sm font-medium" style={{ color: result.crystal.color }}>{result.crystal.name}</p>
                <p className="text-[9px] italic" style={{ color: 'var(--text-muted)' }}>{result.crystal.aka}</p>
                {result.is_new && <p className="text-[8px] mt-1 font-bold" style={{ color: '#22C55E' }}>NEW DISCOVERY!</p>}
                <p className="text-[10px] mt-2" style={{ color: 'var(--text-secondary)' }}>{result.digs_remaining} digs remaining today</p>
              </>
            ) : (
              <>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Nothing found this time</p>
                <p className="text-[10px] mt-1" style={{ color: 'var(--text-secondary)' }}>{result.digs_remaining} digs remaining today</p>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Crystals() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('encyclopedia');
  const [crystals, setCrystals] = useState([]);
  const [collection, setCollection] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCrystal, setSelectedCrystal] = useState(null);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem('zen_token');
  const authHeaders = { Authorization: `Bearer ${token}` };

  const fetchCrystals = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (category !== 'all') params.set('category', category);
      if (search) params.set('search', search);
      const res = await axios.get(`${API}/crystals?${params}`);
      setCrystals(res.data.crystals);
      setCategories(res.data.categories);
    } catch {}
    setLoading(false);
  }, [category, search]);

  const fetchCollection = useCallback(async () => {
    if (!token) return;
    try {
      const res = await axios.get(`${API}/crystals/collection/mine`, { headers: authHeaders });
      setCollection(res.data.collection);
    } catch {}
  }, [token]);

  useEffect(() => { fetchCrystals(); }, [fetchCrystals]);
  useEffect(() => { if (tab === 'collection' || tab === 'rockhound') fetchCollection(); }, [tab, fetchCollection]);

  return (
    <div className="min-h-screen immersive-page pb-24" style={{ background: 'var(--bg-primary)' }}>
      <div className="px-4 pt-4 max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-white/5"
            data-testid="crystals-back-btn">
            <ArrowLeft size={18} style={{ color: 'var(--text-muted)' }} />
          </button>
          <div>
            <h1 className="text-2xl md:text-3xl font-light" style={{ color: 'var(--text-primary)', fontFamily: 'Cormorant Garamond, serif' }}>
              Crystals & Stones
            </h1>
            <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Discover their spiritual significance</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-4 overflow-x-auto pb-1" data-testid="crystals-tabs">
          {[
            { id: 'encyclopedia', label: 'Encyclopedia', icon: BookOpen },
            { id: 'collection', label: `My Collection (${collection.length})`, icon: Gem },
            { id: 'rockhound', label: 'Rock Hounding', icon: Pickaxe },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] whitespace-nowrap transition-all"
              style={{
                background: tab === t.id ? 'rgba(192,132,252,0.1)' : 'rgba(248,250,252,0.03)',
                color: tab === t.id ? '#C084FC' : 'var(--text-muted)',
                border: `1px solid ${tab === t.id ? 'rgba(192,132,252,0.2)' : 'rgba(248,250,252,0.04)'}`,
              }}
              data-testid={`crystals-tab-${t.id}`}>
              <t.icon size={10} /> {t.label}
            </button>
          ))}
        </div>

        {/* Encyclopedia */}
        {tab === 'encyclopedia' && (
          <>
            <div className="flex gap-2 mb-4">
              <div className="flex-1 relative">
                <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                <input value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Search crystals..."
                  className="w-full pl-8 pr-3 py-2 rounded-lg text-xs outline-none"
                  style={{ background: 'rgba(248,250,252,0.03)', color: 'var(--text-primary)', border: '1px solid rgba(248,250,252,0.06)' }}
                  data-testid="crystals-search" />
              </div>
              <select value={category} onChange={e => setCategory(e.target.value)}
                className="px-3 py-2 rounded-lg text-xs outline-none capitalize"
                style={{ background: 'rgba(248,250,252,0.03)', color: 'var(--text-primary)', border: '1px solid rgba(248,250,252,0.06)' }}
                data-testid="crystals-category-filter">
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {crystals.map(c => <CrystalCard key={c.id} crystal={c} onClick={setSelectedCrystal} />)}
            </div>
            {crystals.length === 0 && !loading && (
              <p className="text-center text-xs py-8" style={{ color: 'var(--text-muted)' }}>No crystals found</p>
            )}
          </>
        )}

        {/* Collection */}
        {tab === 'collection' && (
          <div>
            {collection.length === 0 ? (
              <div className="text-center py-12">
                <Gem size={24} className="mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Your collection is empty</p>
                <p className="text-[10px] mt-1" style={{ color: 'var(--text-muted)' }}>Browse the encyclopedia or go rock hounding!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" data-testid="crystal-collection">
                {collection.map(entry => {
                  const crystal = crystals.find(c => c.id === entry.crystal_id);
                  if (!crystal) return null;
                  return (
                    <div key={entry.id} className="glass-card p-3 flex items-center gap-3 cursor-pointer hover:scale-[1.01] transition-all"
                      onClick={() => setSelectedCrystal(crystal)} data-testid={`collection-${entry.crystal_id}`}>
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ background: `${crystal.color}12`, border: `1px solid ${crystal.color}25` }}>
                        <Gem size={14} style={{ color: crystal.color }} />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>{crystal.name}</p>
                        <p className="text-[8px]" style={{ color: 'var(--text-muted)' }}>Found via {entry.found_via}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Rock Hounding */}
        {tab === 'rockhound' && (
          <RockHoundGame authHeaders={authHeaders} onFound={fetchCollection} />
        )}
      </div>

      <AnimatePresence>
        {selectedCrystal && (
          <CrystalDetail crystal={selectedCrystal} onClose={() => setSelectedCrystal(null)}
            authHeaders={authHeaders} onCollected={fetchCollection} />
        )}
      </AnimatePresence>
    </div>
  );
}
