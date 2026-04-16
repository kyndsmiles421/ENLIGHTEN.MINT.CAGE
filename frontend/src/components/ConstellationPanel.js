import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, Download, Heart, X, Globe, Lock, ShoppingBag, ChevronDown, Loader2, Star, Coins } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTreasury } from '../context/TreasuryContext';
import { getModuleById, checkSynergy } from '../config/moduleRegistry';
import { scanContent } from '../utils/sentinel';

const API = process.env.REACT_APP_BACKEND_URL;

/* ══════════════════════════════════════════════
   CONSTELLATION PANEL
   Save / Browse / Load orbital mixer recipes
   ══════════════════════════════════════════════ */
export default function ConstellationPanel({ activeModuleIds, onLoadConstellation, isOpen, onClose }) {
  const { token, authHeaders } = useAuth();
  const { balance, purchaseConstellation } = useTreasury();
  const [tab, setTab] = useState('save'); // 'save' | 'my' | 'community' | 'marketplace'
  const [myRecipes, setMyRecipes] = useState([]);
  const [communityRecipes, setCommunityRecipes] = useState([]);
  const [marketRecipes, setMarketRecipes] = useState([]);
  const [loading, setLoading] = useState(false);

  // Save form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [isForSale, setIsForSale] = useState(false);
  const [price, setPrice] = useState(0);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [scanError, setScanError] = useState(null);

  // Compute synergies from active modules
  const computeSynergies = useCallback(() => {
    const mods = activeModuleIds.map(id => getModuleById(id)).filter(Boolean);
    const synergies = [];
    for (let i = 0; i < mods.length; i++) {
      for (let j = i + 1; j < mods.length; j++) {
        const result = checkSynergy(mods[i], mods[j]);
        if (result.synergy) {
          synergies.push({
            a: mods[i].id,
            b: mods[j].id,
            shared: result.shared,
            score: result.score,
          });
        }
      }
    }
    return synergies;
  }, [activeModuleIds]);

  const fetchMyRecipes = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/constellations/mine`, { headers: authHeaders });
      const data = await res.json();
      setMyRecipes(Array.isArray(data) ? data : []);
    } catch {}
    setLoading(false);
  }, [token, authHeaders]);

  const fetchCommunity = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/constellations/community`);
      const data = await res.json();
      setCommunityRecipes(Array.isArray(data) ? data : []);
    } catch {}
    setLoading(false);
  }, []);

  const fetchMarketplace = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/constellations/marketplace`);
      const data = await res.json();
      setMarketRecipes(Array.isArray(data) ? data : []);
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    if (tab === 'my') fetchMyRecipes();
    if (tab === 'community') fetchCommunity();
    if (tab === 'marketplace') fetchMarketplace();
  }, [isOpen, tab, fetchMyRecipes, fetchCommunity, fetchMarketplace]);

  const handleSave = async () => {
    if (!token || !name.trim() || activeModuleIds.length === 0) return;
    setSaving(true);
    setScanError(null);
    try {
      // Sentinel scan: check name + description before saving
      const textToScan = `${name.trim()} ${description.trim()}`;
      const scanResult = await scanContent(textToScan, 'constellation', authHeaders);
      if (!scanResult.clean && scanResult.blocked) {
        setScanError(scanResult.message || 'Content blocked by the Collective Sentinel');
        setSaving(false);
        return;
      }

      const synergies = computeSynergies();
      const res = await fetch(`${API}/api/constellations`, {
        method: 'POST',
        headers: { ...authHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim(),
          module_ids: activeModuleIds,
          synergies,
          is_public: isPublic,
          is_for_sale: isForSale,
          price: isForSale ? price : 0,
          tags: synergies.flatMap(s => s.shared).filter((v, i, a) => a.indexOf(v) === i),
        }),
      });
      if (res.ok) {
        setSaveSuccess(true);
        setName('');
        setDescription('');
        setTimeout(() => setSaveSuccess(false), 2000);
      }
    } catch {}
    setSaving(false);
  };

  const handleLoad = async (constellation) => {
    try {
      const res = await fetch(`${API}/api/constellations/${constellation.id}/load`, {
        method: 'POST',
        headers: token ? authHeaders : {},
      });
      const data = await res.json();
      if (data.module_ids) {
        onLoadConstellation(data.module_ids);
      }
    } catch {}
  };

  const handleLike = async (id) => {
    if (!token) return;
    try {
      await fetch(`${API}/api/constellations/${id}/like`, {
        method: 'POST',
        headers: authHeaders,
      });
      if (tab === 'community') fetchCommunity();
      if (tab === 'marketplace') fetchMarketplace();
    } catch {}
  };

  const handleDelete = async (id) => {
    if (!token) return;
    try {
      await fetch(`${API}/api/constellations/${id}`, {
        method: 'DELETE',
        headers: authHeaders,
      });
      fetchMyRecipes();
    } catch {}
  };

  const handlePurchase = async (recipe) => {
    const result = await purchaseConstellation(recipe.id);
    if (result && !result.error && result.module_ids) {
      onLoadConstellation(result.module_ids);
    }
    fetchMarketplace();
  };

  if (!isOpen) return null;

  const TABS = [
    { id: 'save', label: 'Save', icon: Save },
    { id: 'my', label: 'Mine', icon: Star },
    { id: 'community', label: 'Community', icon: Globe },
    { id: 'marketplace', label: 'Market', icon: ShoppingBag },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="rounded-xl overflow-hidden"
      style={{
        background: 'rgba(11,12,21,0.97)',
        border: '1px solid rgba(192,132,252,0.1)',
        backdropFilter: 'none',
        maxHeight: 320,
      }}
      data-testid="constellation-panel"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2" style={{ borderBottom: '1px solid rgba(248,250,252,0.04)' }}>
        <span className="text-[10px] uppercase tracking-widest font-medium" style={{ color: 'rgba(192,132,252,0.7)' }}>
          Constellations
        </span>
        <div className="flex items-center gap-2">
          {token && (
            <span className="text-[9px] flex items-center gap-1" style={{ color: 'rgba(251,191,36,0.6)' }} data-testid="constellation-balance">
              <Coins size={9} /> {balance}
            </span>
          )}
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/5">
            <X size={11} style={{ color: 'rgba(248,250,252,0.4)' }} />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex px-2 pt-2 gap-1">
        {TABS.map(t => {
          const Icon = t.icon;
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-[9px] transition-all"
              style={{
                background: active ? 'rgba(192,132,252,0.08)' : 'transparent',
                color: active ? '#C084FC' : 'rgba(248,250,252,0.3)',
                border: `1px solid ${active ? 'rgba(192,132,252,0.15)' : 'transparent'}`,
              }}
              data-testid={`constellation-tab-${t.id}`}
            >
              <Icon size={10} />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="p-3 overflow-y-auto" style={{ maxHeight: 230 }}>
        {/* ── Save Tab ── */}
        {tab === 'save' && (
          <div className="space-y-2.5">
            {activeModuleIds.length === 0 ? (
              <p className="text-[10px] text-center py-4" style={{ color: 'rgba(248,250,252,0.25)' }}>
                Activate modules in the playground to save a constellation
              </p>
            ) : (
              <>
                <div className="flex items-center gap-1.5 mb-1">
                  {activeModuleIds.slice(0, 8).map(id => {
                    const mod = getModuleById(id);
                    return mod ? (
                      <div key={id} className="w-4 h-4 rounded-full" style={{ background: mod.color, opacity: 0.7 }} title={mod.name} />
                    ) : null;
                  })}
                  <span className="text-[9px] ml-1" style={{ color: 'rgba(248,250,252,0.3)' }}>{activeModuleIds.length} modules</span>
                </div>

                <input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Constellation name..."
                  className="w-full text-[11px] py-1.5 px-2.5 rounded-lg"
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    color: '#F8FAFC',
                    outline: 'none',
                  }}
                  data-testid="constellation-name-input"
                />

                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Describe this constellation..."
                  rows={2}
                  className="w-full text-[10px] py-1.5 px-2.5 rounded-lg resize-none"
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    color: '#F8FAFC',
                    outline: 'none',
                  }}
                  data-testid="constellation-desc-input"
                />

                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input type="checkbox" checked={isPublic} onChange={e => setIsPublic(e.target.checked)}
                      className="w-3 h-3 rounded accent-purple-500" />
                    <span className="text-[9px]" style={{ color: 'rgba(248,250,252,0.4)' }}>Public</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input type="checkbox" checked={isForSale} onChange={e => setIsForSale(e.target.checked)}
                      className="w-3 h-3 rounded accent-purple-500" />
                    <span className="text-[9px]" style={{ color: 'rgba(248,250,252,0.4)' }}>Sell</span>
                  </label>
                  {isForSale && (
                    <input type="number" value={price} onChange={e => setPrice(parseInt(e.target.value) || 0)} min={0}
                      className="w-14 text-[9px] py-0.5 px-1.5 rounded"
                      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', color: '#F8FAFC' }}
                      placeholder="Credits"
                    />
                  )}
                </div>

                <button
                  onClick={handleSave}
                  disabled={saving || !name.trim() || !token}
                  className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg text-[10px] font-medium transition-all"
                  style={{
                    background: saveSuccess ? 'rgba(34,197,94,0.1)' : scanError ? 'rgba(239,68,68,0.1)' : 'rgba(192,132,252,0.1)',
                    border: `1px solid ${saveSuccess ? 'rgba(34,197,94,0.2)' : scanError ? 'rgba(239,68,68,0.2)' : 'rgba(192,132,252,0.2)'}`,
                    color: saveSuccess ? '#22C55E' : scanError ? '#EF4444' : '#C084FC',
                    opacity: (saving || !name.trim() || !token) ? 0.4 : 1,
                    cursor: (saving || !name.trim() || !token) ? 'not-allowed' : 'pointer',
                  }}
                  data-testid="constellation-save-btn"
                >
                  {saving ? <Loader2 size={10} className="animate-spin" /> : saveSuccess ? <>Saved!</> : <><Save size={10} /> Save Constellation</>}
                </button>

                {scanError && (
                  <p className="text-[9px] text-center mt-1" style={{ color: '#EF4444' }} data-testid="sentinel-scan-error">
                    {scanError}
                  </p>
                )}

                {!token && (
                  <p className="text-[9px] text-center" style={{ color: 'rgba(248,250,252,0.2)' }}>Sign in to save</p>
                )}
              </>
            )}
          </div>
        )}

        {/* ── My Recipes / Community / Marketplace ── */}
        {(tab === 'my' || tab === 'community' || tab === 'marketplace') && (
          <div className="space-y-2">
            {loading ? (
              <div className="flex justify-center py-6">
                <Loader2 size={14} className="animate-spin" style={{ color: 'rgba(192,132,252,0.4)' }} />
              </div>
            ) : (
              <>
                {(tab === 'my' ? myRecipes : tab === 'community' ? communityRecipes : marketRecipes).length === 0 ? (
                  <p className="text-[10px] text-center py-4" style={{ color: 'rgba(248,250,252,0.25)' }}>
                    {tab === 'my' ? 'No saved constellations yet' : 'No constellations shared yet'}
                  </p>
                ) : (
                  (tab === 'my' ? myRecipes : tab === 'community' ? communityRecipes : marketRecipes).map(c => (
                    <RecipeCard
                      key={c.id}
                      recipe={c}
                      onLoad={() => handleLoad(c)}
                      onLike={() => handleLike(c.id)}
                      onDelete={tab === 'my' ? () => handleDelete(c.id) : null}
                      onPurchase={tab === 'marketplace' ? handlePurchase : null}
                      showCreator={tab !== 'my'}
                      balance={balance}
                    />
                  ))
                )}
              </>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}

function RecipeCard({ recipe, onLoad, onLike, onDelete, onPurchase, showCreator, balance }) {
  const moduleCount = recipe.module_ids?.length || 0;
  const mods = (recipe.module_ids || []).map(id => getModuleById(id)).filter(Boolean);
  const isForSale = recipe.is_for_sale && recipe.price > 0;
  const canAfford = balance >= (recipe.price || 0);

  return (
    <div
      className="rounded-xl p-2.5"
      style={{
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.04)',
      }}
      data-testid={`constellation-card-${recipe.id}`}
    >
      <div className="flex items-start justify-between mb-1.5">
        <div>
          <h4 className="text-[11px] font-medium" style={{ color: '#F8FAFC' }}>{recipe.name}</h4>
          {showCreator && (
            <span className="text-[8px]" style={{ color: 'rgba(248,250,252,0.3)' }}>by {recipe.creator_name}</span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {recipe.is_for_sale && recipe.price > 0 && (
            <span className="text-[8px] px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(251,191,36,0.1)', color: '#FBBF24' }}>
              {recipe.price} cr
            </span>
          )}
        </div>
      </div>

      {/* Module dots */}
      <div className="flex items-center gap-1 mb-1.5">
        {mods.slice(0, 6).map(m => (
          <div key={m.id} className="w-3 h-3 rounded-full" style={{ background: m.color, opacity: 0.6 }} title={m.name} />
        ))}
        {moduleCount > 6 && (
          <span className="text-[8px]" style={{ color: 'rgba(248,250,252,0.3)' }}>+{moduleCount - 6}</span>
        )}
      </div>

      {recipe.description && (
        <p className="text-[9px] mb-2 line-clamp-2" style={{ color: 'rgba(248,250,252,0.3)' }}>{recipe.description}</p>
      )}

      {/* Actions */}
      <div className="flex items-center gap-1.5">
        {isForSale && onPurchase ? (
          <button
            onClick={() => onPurchase(recipe)}
            disabled={!canAfford}
            className="flex items-center gap-1 px-2 py-1 rounded-md text-[9px] transition-all"
            style={{
              background: canAfford ? 'rgba(251,191,36,0.1)' : 'rgba(255,255,255,0.03)',
              border: `1px solid ${canAfford ? 'rgba(251,191,36,0.2)' : 'rgba(255,255,255,0.06)'}`,
              color: canAfford ? '#FBBF24' : 'rgba(248,250,252,0.2)',
              cursor: canAfford ? 'pointer' : 'not-allowed',
              opacity: canAfford ? 1 : 0.5,
            }}
            data-testid={`constellation-buy-${recipe.id}`}
          >
            <Coins size={9} /> {recipe.price} cr
          </button>
        ) : (
          <button
            onClick={onLoad}
            className="flex items-center gap-1 px-2 py-1 rounded-md text-[9px] transition-all"
            style={{
              background: 'rgba(192,132,252,0.08)',
              border: '1px solid rgba(192,132,252,0.15)',
              color: '#C084FC',
              cursor: 'pointer',
            }}
            data-testid={`constellation-load-${recipe.id}`}
          >
            <Download size={9} /> Load
          </button>
        )}
        <button
          onClick={onLike}
          className="flex items-center gap-1 px-2 py-1 rounded-md text-[9px] transition-all"
          style={{
            background: 'rgba(239,68,68,0.06)',
            border: '1px solid rgba(239,68,68,0.12)',
            color: 'rgba(239,68,68,0.6)',
            cursor: 'pointer',
          }}
        >
          <Heart size={9} /> {recipe.like_count || 0}
        </button>
        {onDelete && (
          <button
            onClick={onDelete}
            className="ml-auto px-2 py-1 rounded-md text-[9px]"
            style={{ color: 'rgba(248,250,252,0.2)', cursor: 'pointer' }}
          >
            <X size={9} />
          </button>
        )}
        <span className="ml-auto text-[8px]" style={{ color: 'rgba(248,250,252,0.2)' }}>
          {recipe.load_count || 0} loads
        </span>
      </div>
    </div>
  );
}
