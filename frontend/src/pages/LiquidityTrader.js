import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';
import {
  ArrowLeft, ArrowRightLeft, Gem, Coins, Zap, Star, Shield,
  TrendingUp, Clock, FileText, Lock, ChevronRight, Sparkles,
  Activity, Layers, BarChart3, Hexagon, Share2, FlaskConical
} from 'lucide-react';
import { subscribeBuffer, getBufferState } from '../hooks/useWorkAccrual';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const TIER_COLORS = { SEED: '#6B7280', ARTISAN: '#818CF8', SOVEREIGN: '#2DD4BF' };
const TIER_ICONS = { SEED: Gem, ARTISAN: Hexagon, SOVEREIGN: Star };
const SPECTRUM = ['#EF4444', '#F97316', '#EAB308', '#22C55E', '#3B82F6', '#6366F1', '#8B5CF6'];

const DEFAULT_REWARDS = {
  streak_bonus: 30, blueprint_generation: 25, forge_creation: 20,
  frequency_mix: 18, trade_listing: 16, meditation_session: 15,
  constellation_trace: 14, oracle_reading: 12, task_completion: 10,
  daily_login: 10, journal_entry: 8, breathing_exercise: 7,
  archive_save: 6, mood_log: 5, module_interaction: 3, kinetic_movement: 2,
};

function StatusCard({ dust, gems, fans, tier, tierName, exchangeRate, baseRate }) {
  const TierIcon = TIER_ICONS[tierName] || Gem;
  const tierColor = TIER_COLORS[tierName] || '#6B7280';
  return (
    <div className="rounded-2xl p-4 mb-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }} data-testid="transmuter-status-card">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${tierColor}18` }}>
            <TierIcon size={16} color={tierColor} />
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wider" style={{ color: 'rgba(248,250,252,0.4)' }}>Transmuter Tier</div>
            <div className="text-sm font-bold" style={{ color: tierColor }}>{tierName}</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-[10px] uppercase tracking-wider" style={{ color: 'rgba(248,250,252,0.4)' }}>Phi Cap Rate</div>
          <div className="text-sm font-bold flex items-center gap-1" style={{ color: '#FCD34D' }}>
            <Activity size={12} />
            {exchangeRate} Dust = 1 Fan
          </div>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <BalancePill label="Digital Dust" value={dust} icon={Sparkles} color="#A855F7" testId="dust-balance" />
        <BalancePill label="Gems" value={gems} icon={Gem} color="#2DD4BF" testId="gems-balance" />
        <BalancePill label="Fans" value={fans} icon={Coins} color="#FCD34D" testId="fans-balance" />
      </div>
    </div>
  );
}

function BalancePill({ label, value, icon: Icon, color, testId }) {
  return (
    <div className="rounded-xl p-2.5 text-center" style={{ background: `${color}08`, border: `1px solid ${color}15` }} data-testid={testId}>
      <Icon size={14} color={color} className="mx-auto mb-1" />
      <div className="text-lg font-bold" style={{ color }}>{(value || 0).toLocaleString()}</div>
      <div className="text-[9px] uppercase tracking-wider" style={{ color: 'rgba(248,250,252,0.4)' }}>{label}</div>
    </div>
  );
}

function TradePanel({ dust, exchangeRate, onTrade, loading }) {
  const [amount, setAmount] = useState('');
  const numAmount = parseInt(amount) || 0;
  const fansPreview = numAmount >= exchangeRate ? Math.floor(numAmount / exchangeRate) : 0;
  const dustConsumed = fansPreview * exchangeRate;
  const canTrade = numAmount >= exchangeRate && numAmount <= dust && !loading;

  return (
    <div className="rounded-2xl p-4 mb-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }} data-testid="trade-panel">
      <div className="flex items-center gap-2 mb-3">
        <ArrowRightLeft size={16} color="#FCD34D" />
        <h2 className="text-sm font-bold" style={{ color: '#F8FAFC' }}>Liquidity Controller</h2>
      </div>
      <div className="text-xs mb-3" style={{ color: 'rgba(248,250,252,0.5)' }}>
        Convert Digital Dust into Fans via the Phi Cap exchange. The scavenger's loop — every fragment has value.
      </div>
      <div className="relative mb-3">
        <input
          type="number"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          placeholder={`Min: ${exchangeRate} Dust`}
          className="w-full px-4 py-3 rounded-xl text-sm font-medium outline-none"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#F8FAFC' }}
          data-testid="dust-trade-input"
        />
        <button
          onClick={() => setAmount(String(dust))}
          className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 rounded-lg text-[10px] font-bold"
          style={{ background: 'rgba(168,85,247,0.15)', color: '#A855F7' }}
          data-testid="trade-max-btn"
        >MAX</button>
      </div>
      {numAmount > 0 && (
        <div className="rounded-xl p-3 mb-3" style={{ background: 'rgba(252,211,77,0.04)', border: '1px solid rgba(252,211,77,0.1)' }}>
          <div className="flex justify-between text-xs mb-1">
            <span style={{ color: 'rgba(248,250,252,0.5)' }}>Dust consumed</span>
            <span style={{ color: '#A855F7' }}>{dustConsumed.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-xs mb-1">
            <span style={{ color: 'rgba(248,250,252,0.5)' }}>Fans received</span>
            <span style={{ color: '#FCD34D' }} data-testid="fans-preview">{fansPreview}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span style={{ color: 'rgba(248,250,252,0.5)' }}>Dust remaining</span>
            <span style={{ color: 'rgba(248,250,252,0.6)' }}>{(dust - dustConsumed).toLocaleString()}</span>
          </div>
        </div>
      )}
      <button
        onClick={() => { if (canTrade) onTrade(numAmount); }}
        disabled={!canTrade}
        className="w-full py-3 rounded-xl text-sm font-bold transition-all"
        style={{
          background: canTrade ? 'linear-gradient(135deg, rgba(252,211,77,0.15), rgba(168,85,247,0.15))' : 'rgba(255,255,255,0.03)',
          border: `1px solid ${canTrade ? 'rgba(252,211,77,0.3)' : 'rgba(255,255,255,0.05)'}`,
          color: canTrade ? '#FCD34D' : 'rgba(248,250,252,0.3)',
          cursor: canTrade ? 'pointer' : 'not-allowed',
        }}
        data-testid="execute-trade-btn"
      >
        {loading ? 'Transmuting...' : `Convert ${fansPreview > 0 ? `${numAmount.toLocaleString()} Dust to ${fansPreview} Fan${fansPreview > 1 ? 's' : ''}` : 'Dust to Fans'}`}
      </button>
    </div>
  );
}

function BlueprintPanel({ tier, tierName, onGenerate, loading, lastBlueprint }) {
  const [length, setLength] = useState('12');
  const [width, setWidth] = useState('12');
  const [tradeType, setTradeType] = useState('Carpentry');
  const tradeTypes = ['Carpentry', 'Masonry', 'Electrical', 'Plumbing', 'Landscaping'];
  const tierColor = TIER_COLORS[tierName] || '#6B7280';

  return (
    <div className="rounded-2xl p-4 mb-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }} data-testid="blueprint-panel">
      <div className="flex items-center gap-2 mb-3">
        <FileText size={16} color="#2DD4BF" />
        <h2 className="text-sm font-bold" style={{ color: '#F8FAFC' }}>Sacred Blueprint Generator</h2>
      </div>
      <div className="text-xs mb-3" style={{ color: 'rgba(248,250,252,0.5)' }}>
        Process physical construction data into Sacred Blueprints. Higher tiers unlock Phi Optimization and White Light Encryption.
      </div>
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div>
          <label className="text-[10px] uppercase tracking-wider mb-1 block" style={{ color: 'rgba(248,250,252,0.4)' }}>Length</label>
          <input type="number" value={length} onChange={e => setLength(e.target.value)}
            className="w-full px-3 py-2 rounded-lg text-xs outline-none"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#F8FAFC' }}
            data-testid="blueprint-length-input" />
        </div>
        <div>
          <label className="text-[10px] uppercase tracking-wider mb-1 block" style={{ color: 'rgba(248,250,252,0.4)' }}>Width</label>
          <input type="number" value={width} onChange={e => setWidth(e.target.value)}
            className="w-full px-3 py-2 rounded-lg text-xs outline-none"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#F8FAFC' }}
            data-testid="blueprint-width-input" />
        </div>
      </div>
      <div className="mb-3">
        <label className="text-[10px] uppercase tracking-wider mb-1 block" style={{ color: 'rgba(248,250,252,0.4)' }}>Trade Type</label>
        <div className="flex gap-1.5 flex-wrap">
          {tradeTypes.map(t => (
            <button key={t} onClick={() => setTradeType(t)}
              className="px-2.5 py-1.5 rounded-lg text-[10px] font-medium transition-all"
              style={{
                background: tradeType === t ? 'rgba(45,212,191,0.12)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${tradeType === t ? 'rgba(45,212,191,0.25)' : 'rgba(255,255,255,0.06)'}`,
                color: tradeType === t ? '#2DD4BF' : 'rgba(248,250,252,0.5)',
              }}
              data-testid={`trade-type-${t.toLowerCase()}`}>{t}</button>
          ))}
        </div>
      </div>
      <button
        onClick={() => onGenerate(parseFloat(length) || 12, parseFloat(width) || 12, tradeType)}
        disabled={loading}
        className="w-full py-3 rounded-xl text-sm font-bold transition-all mb-3"
        style={{
          background: 'linear-gradient(135deg, rgba(45,212,191,0.12), rgba(99,102,241,0.12))',
          border: '1px solid rgba(45,212,191,0.2)',
          color: '#2DD4BF',
        }}
        data-testid="generate-blueprint-btn"
      >
        {loading ? 'Generating...' : 'Generate Sacred Blueprint'}
      </button>
      {lastBlueprint && (
        <BlueprintDisplay blueprint={lastBlueprint} tierName={tierName} tierColor={tierColor} />
      )}
    </div>
  );
}

function BlueprintDisplay({ blueprint, tierName, tierColor }) {
  const bp = blueprint.blueprint || blueprint;
  const hasRefraction = !!bp.refraction_key;
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
      data-testid="blueprint-result">
      <div className="flex items-center justify-between mb-2">
        <div className="text-xs font-bold" style={{ color: tierColor }}>{bp.tier} Blueprint</div>
        <div className="text-[9px] px-2 py-0.5 rounded-md" style={{ background: `${tierColor}15`, color: tierColor }}>{bp.dimensions}</div>
      </div>
      <div className="space-y-1 text-[11px]" style={{ color: 'rgba(248,250,252,0.6)' }}>
        <div>Studs: {bp.standard_cuts}</div>
        <div>Trade: {bp.trade_type}</div>
        {bp.phi_optimized && <div style={{ color: '#818CF8' }}>Phi Optimized: {bp.phi_optimized}</div>}
        {bp.masonry_ratio && <div style={{ color: '#818CF8' }}>Masonry Ratio: {bp.masonry_ratio}</div>}
        {bp.golden_area && <div style={{ color: '#818CF8' }}>Golden Area: {bp.golden_area}</div>}
        {bp.sacred_geometry && <div style={{ color: '#2DD4BF' }}>Geometry: {bp.sacred_geometry}</div>}
        {bp.resonant_frequency && <div style={{ color: '#2DD4BF' }}>Resonance: {bp.resonant_frequency} Hz</div>}
      </div>
      {hasRefraction && (
        <div className="mt-2 pt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <div className="text-[9px] uppercase tracking-wider mb-1.5" style={{ color: 'rgba(248,250,252,0.3)' }}>White Light Encryption</div>
          <div className="flex gap-1">
            {SPECTRUM.map((color, i) => {
              const keys = Object.keys(bp.refraction_key);
              return (
                <motion.div key={i}
                  initial={{ scale: 0 }} animate={{ scale: 1 }}
                  transition={{ delay: i * 0.08 }}
                  className="flex-1 h-5 rounded-md relative group"
                  style={{ background: `${color}30`, border: `1px solid ${color}50` }}
                  title={keys[i] ? `${keys[i]}: ${bp.refraction_key[keys[i]]}` : ''}>
                  <div className="absolute inset-0 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ background: `${color}60` }} />
                </motion.div>
              );
            })}
          </div>
        </div>
      )}
    </motion.div>
  );
}

function RewardsList({ rewards }) {
  const entries = Object.entries(rewards || {}).sort((a, b) => b[1] - a[1]);
  return (
    <div className="rounded-2xl p-4 mb-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }} data-testid="rewards-panel">
      <div className="flex items-center gap-2 mb-3">
        <BarChart3 size={16} color="#A855F7" />
        <h2 className="text-sm font-bold" style={{ color: '#F8FAFC' }}>Dust Complexity Rewards</h2>
      </div>
      <div className="text-xs mb-3" style={{ color: 'rgba(248,250,252,0.5)' }}>
        Every interaction sweeps up value. Higher complexity actions yield more Dust.
      </div>
      <div className="space-y-1">
        {entries.map(([action, base]) => (
          <div key={action} className="flex items-center justify-between py-1.5 px-2 rounded-lg"
            style={{ background: 'rgba(255,255,255,0.02)' }}>
            <span className="text-[11px] capitalize" style={{ color: 'rgba(248,250,252,0.6)' }}>
              {action.replace(/_/g, ' ')}
            </span>
            <span className="text-[11px] font-bold" style={{ color: '#A855F7' }}>+{base} Dust</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function TransactionHistory({ entries }) {
  if (!entries || entries.length === 0) return null;
  return (
    <div className="rounded-2xl p-4 mb-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }} data-testid="transaction-history">
      <div className="flex items-center gap-2 mb-3">
        <Clock size={16} color="#818CF8" />
        <h2 className="text-sm font-bold" style={{ color: '#F8FAFC' }}>Recent Transmutations</h2>
      </div>
      <div className="space-y-1.5">
        {entries.map((tx, i) => (
          <div key={tx.id || i} className="flex items-center justify-between py-2 px-2 rounded-lg"
            style={{ background: 'rgba(255,255,255,0.02)' }}>
            <div className="flex items-center gap-2">
              {tx.type === 'dust_to_fans' ? <ArrowRightLeft size={12} color="#FCD34D" /> :
               tx.type === 'dust_accrual' ? <Sparkles size={12} color="#A855F7" /> :
               <FileText size={12} color="#2DD4BF" />}
              <div>
                <div className="text-[11px] font-medium" style={{ color: '#F8FAFC' }}>
                  {tx.type === 'dust_to_fans' ? `Converted ${tx.dust_consumed} Dust` :
                   tx.type === 'dust_accrual' ? `+${tx.dust_earned} Dust (${tx.action?.replace(/_/g, ' ')})` :
                   'Blueprint Generated'}
                </div>
                <div className="text-[9px]" style={{ color: 'rgba(248,250,252,0.3)' }}>
                  {tx.created_at ? new Date(tx.created_at).toLocaleString() : ''}
                </div>
              </div>
            </div>
            {tx.type === 'dust_to_fans' && (
              <span className="text-[11px] font-bold" style={{ color: '#FCD34D' }}>+{tx.fans_earned} Fan{tx.fans_earned > 1 ? 's' : ''}</span>
            )}
            {tx.type === 'dust_accrual' && (
              <span className="text-[11px] font-bold" style={{ color: '#A855F7' }}>+{tx.dust_earned}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function AlchemyPanel({ dust, tier, tierName, tierDynamics, onTransmute, loading, lastResult }) {
  const [amount, setAmount] = useState('100');
  const numAmount = parseInt(amount) || 0;
  const dynamics = tierDynamics || { ratio: 0.236, tax: 0.15, label: 'Scholarship' };
  const tierColor = TIER_COLORS[tierName] || '#6B7280';

  // Preview calculation
  const grossOutput = numAmount * (1 + dynamics.ratio);
  const cappedOutput = Math.min(grossOutput, numAmount * 1.618);
  const taxAmount = cappedOutput * dynamics.tax;
  const netResult = cappedOutput - taxAmount;

  const handleShare = async () => {
    const shareData = {
      title: 'Sovereign Hub Achievement',
      text: `I just achieved a ${(dynamics.ratio * 100).toFixed(1)}% yield in the Master Transmuter on Enlighten.Mint.Cafe!`,
      url: window.location.href,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
        toast.success('Shared successfully');
      } else {
        await navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`);
        toast.success('Achievement copied to clipboard');
      }
    } catch (err) {
      if (err.name !== 'AbortError') toast.error('Share failed');
    }
  };

  return (
    <div className="space-y-3">
      {/* Tier Dynamics Card */}
      <div className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }} data-testid="alchemy-panel">
        <div className="flex items-center gap-2 mb-3">
          <FlaskConical size={16} color={tierColor} />
          <h2 className="text-sm font-bold" style={{ color: '#F8FAFC' }}>Sovereign Engine Alchemy</h2>
        </div>
        <div className="text-xs mb-3" style={{ color: 'rgba(248,250,252,0.5)' }}>
          Transmute Dust through the Fibonacci accrual engine. Phi Cap ceiling protects value.
        </div>

        {/* Tier Dynamics Display */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          <div className="rounded-xl p-2 text-center" style={{ background: `${tierColor}08`, border: `1px solid ${tierColor}15` }}>
            <div className="text-lg font-bold" style={{ color: tierColor }}>{(dynamics.ratio * 100).toFixed(1)}%</div>
            <div className="text-[9px] uppercase tracking-wider" style={{ color: 'rgba(248,250,252,0.4)' }}>Accrual Rate</div>
          </div>
          <div className="rounded-xl p-2 text-center" style={{ background: 'rgba(252,211,77,0.06)', border: '1px solid rgba(252,211,77,0.12)' }}>
            <div className="text-lg font-bold" style={{ color: '#FCD34D' }}>{(dynamics.tax * 100).toFixed(1)}%</div>
            <div className="text-[9px] uppercase tracking-wider" style={{ color: 'rgba(248,250,252,0.4)' }}>
              {dynamics.tax > 0 ? 'Scholarship Tax' : 'Zero Tax'}
            </div>
          </div>
          <div className="rounded-xl p-2 text-center" style={{ background: 'rgba(45,212,191,0.06)', border: '1px solid rgba(45,212,191,0.12)' }}>
            <div className="text-lg font-bold" style={{ color: '#2DD4BF' }}>1.618</div>
            <div className="text-[9px] uppercase tracking-wider" style={{ color: 'rgba(248,250,252,0.4)' }}>Phi Cap</div>
          </div>
        </div>

        {/* Input */}
        <div className="relative mb-3">
          <input type="number" value={amount} onChange={e => setAmount(e.target.value)}
            placeholder="Dust amount to transmute"
            className="w-full px-4 py-3 rounded-xl text-sm font-medium outline-none"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#F8FAFC' }}
            data-testid="alchemy-input" />
          <button onClick={() => setAmount(String(dust))}
            className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 rounded-lg text-[10px] font-bold"
            style={{ background: `${tierColor}20`, color: tierColor }}
            data-testid="alchemy-max-btn">MAX</button>
        </div>

        {/* Preview */}
        {numAmount > 0 && (
          <div className="rounded-xl p-3 mb-3" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div className="flex justify-between text-xs mb-1">
              <span style={{ color: 'rgba(248,250,252,0.5)' }}>Input</span>
              <span style={{ color: '#A855F7' }}>{numAmount.toLocaleString()} Dust</span>
            </div>
            <div className="flex justify-between text-xs mb-1">
              <span style={{ color: 'rgba(248,250,252,0.5)' }}>Gross ({(dynamics.ratio * 100).toFixed(1)}% accrual)</span>
              <span style={{ color: 'rgba(248,250,252,0.6)' }}>{Math.round(grossOutput).toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-xs mb-1">
              <span style={{ color: 'rgba(248,250,252,0.5)' }}>After Phi Cap</span>
              <span style={{ color: '#2DD4BF' }}>{Math.round(cappedOutput).toLocaleString()}</span>
            </div>
            {dynamics.tax > 0 && (
              <div className="flex justify-between text-xs mb-1">
                <span style={{ color: 'rgba(248,250,252,0.5)' }}>Scholarship Tax ({(dynamics.tax * 100).toFixed(1)}%)</span>
                <span style={{ color: '#FCD34D' }}>-{Math.round(taxAmount).toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between text-xs font-bold pt-1" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
              <span style={{ color: '#F8FAFC' }}>Net Result</span>
              <span style={{ color: tierColor }} data-testid="alchemy-net-preview">{Math.round(netResult).toLocaleString()} Dust</span>
            </div>
          </div>
        )}

        {/* Execute */}
        <div className="flex gap-2">
          <button
            onClick={() => { if (numAmount > 0 && numAmount <= dust) onTransmute(numAmount); }}
            disabled={loading || numAmount <= 0 || numAmount > dust}
            className="flex-1 py-3 rounded-xl text-sm font-bold transition-all"
            style={{
              background: numAmount > 0 && numAmount <= dust
                ? `linear-gradient(135deg, ${tierColor}20, rgba(168,85,247,0.15))`
                : 'rgba(255,255,255,0.03)',
              border: `1px solid ${numAmount > 0 && numAmount <= dust ? `${tierColor}40` : 'rgba(255,255,255,0.05)'}`,
              color: numAmount > 0 && numAmount <= dust ? tierColor : 'rgba(248,250,252,0.3)',
            }}
            data-testid="execute-alchemy-btn"
          >
            {loading ? 'Transmuting...' : 'Execute Alchemy'}
          </button>
          <button onClick={handleShare}
            className="px-4 py-3 rounded-xl text-sm font-bold transition-all"
            style={{
              background: 'rgba(34,197,94,0.08)',
              border: '1px solid rgba(34,197,94,0.2)',
              color: '#22C55E',
            }}
            data-testid="share-yield-btn">
            <Share2 size={16} />
          </button>
        </div>
      </div>

      {/* Last Alchemy Result */}
      {lastResult && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
          data-testid="alchemy-result">
          <div className="text-[10px] uppercase tracking-wider mb-2" style={{ color: 'rgba(248,250,252,0.4)' }}>Last Transmutation</div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div><span style={{ color: 'rgba(248,250,252,0.5)' }}>Input:</span> <span style={{ color: '#A855F7' }}>{lastResult.input_amount}</span></div>
            <div><span style={{ color: 'rgba(248,250,252,0.5)' }}>Net:</span> <span className="font-bold" style={{ color: '#2DD4BF' }}>{lastResult.net_result}</span></div>
            <div><span style={{ color: 'rgba(248,250,252,0.5)' }}>Tax:</span> <span style={{ color: '#FCD34D' }}>{lastResult.tax_amount}</span></div>
            <div><span style={{ color: 'rgba(248,250,252,0.5)' }}>Ratio:</span> <span style={{ color: '#818CF8' }}>{(lastResult.tier_ratio * 100).toFixed(1)}%</span></div>
          </div>
          {lastResult.phi_cap_applied && (
            <div className="mt-2 text-[10px] px-2 py-1 rounded-md inline-block" style={{ background: 'rgba(252,211,77,0.08)', color: '#FCD34D' }}>
              Phi Cap Applied
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}

export default function LiquidityTrader() {
  const { authHeaders, user } = useAuth();
  const navigate = useNavigate();
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [trading, setTrading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [lastBlueprint, setLastBlueprint] = useState(null);
  const [transmuting, setTransmuting] = useState(false);
  const [lastAlchemy, setLastAlchemy] = useState(null);
  const [tab, setTab] = useState('alchemy');
  const [heartbeatBuffer, setHeartbeatBuffer] = useState(0);

  // Subscribe to global dust buffer for heartbeat indicator
  useEffect(() => {
    const { buffer } = getBufferState();
    setHeartbeatBuffer(buffer);
    return subscribeBuffer(val => setHeartbeatBuffer(val));
  }, []);

  const fetchStatus = useCallback(async () => {
    try {
      const { data } = await axios.get(`${API}/transmuter/status`, { headers: authHeaders() });
      setStatus(data);
    } catch (err) {
      toast.error('Failed to load Transmuter status');
    } finally {
      setLoading(false);
    }
  }, [authHeaders]);

  useEffect(() => { fetchStatus(); }, [fetchStatus]);

  const handleTrade = async (dustAmount) => {
    setTrading(true);
    try {
      const { data } = await axios.post(`${API}/transmuter/trade-dust-to-fans`, { dust_amount: dustAmount }, { headers: authHeaders() });
      toast.success(`Transmuted ${data.dust_consumed.toLocaleString()} Dust into ${data.fans_earned} Fan${data.fans_earned > 1 ? 's' : ''}`);
      fetchStatus();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Conversion failed');
    } finally {
      setTrading(false);
    }
  };

  const handleGenerateBlueprint = async (length, width, tradeType) => {
    setGenerating(true);
    try {
      const { data } = await axios.post(`${API}/transmuter/generate-blueprint`, { length, width, trade_type: tradeType }, { headers: authHeaders() });
      setLastBlueprint(data);
      toast.success(`Sacred Blueprint generated! +${data.dust_rewarded} Dust`);
      fetchStatus();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Blueprint generation failed');
    } finally {
      setGenerating(false);
    }
  };

  const handleTransmute = async (inputAmount) => {
    setTransmuting(true);
    try {
      const { data } = await axios.post(`${API}/transmuter/transmute`, { input_amount: inputAmount }, { headers: authHeaders() });
      setLastAlchemy(data);
      toast.success(`Alchemy complete! Net: ${data.net_result} Dust (${data.tier_name} @ ${(data.tier_ratio * 100).toFixed(1)}%)`);
      fetchStatus();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Transmutation failed');
    } finally {
      setTransmuting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#030308' }}>
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}>
          <Sparkles size={24} color="#A855F7" />
        </motion.div>
      </div>
    );
  }

  const tabs = [
    { id: 'alchemy', label: 'Alchemy', icon: FlaskConical },
    { id: 'trade', label: 'Trade', icon: ArrowRightLeft },
    { id: 'blueprint', label: 'Blueprints', icon: FileText },
    { id: 'rewards', label: 'Rewards', icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen pb-24" style={{ background: '#030308' }} data-testid="liquidity-trader-page">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 sticky top-0 z-40" style={{ background: 'rgba(3,3,8,0.9)', backdropFilter: 'blur(20px)' }}>
        <button onClick={() => navigate(-1)} className="p-2 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)' }} data-testid="trader-back-btn">
          <ArrowLeft size={16} color="#F8FAFC" />
        </button>
        <h1 className="text-sm font-bold" style={{ color: '#F8FAFC' }}>Marketplace Trader</h1>
        <div className="flex items-center gap-2">
          {/* Heartbeat Indicator — alpha-wave pulse */}
          {heartbeatBuffer > 0 && (
            <div className="flex items-center gap-1 px-2 py-1 rounded-lg" style={{ background: 'rgba(45,212,191,0.06)', border: '1px solid rgba(45,212,191,0.12)' }} data-testid="heartbeat-indicator">
              <motion.div
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: '#2DD4BF' }}
                animate={{ opacity: [0.2, 0.8, 0.2] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              />
              <span className="text-[9px] font-bold" style={{ color: '#2DD4BF' }}>+{heartbeatBuffer}</span>
            </div>
          )}
          <div className="flex items-center gap-1 px-2 py-1 rounded-lg" style={{ background: 'rgba(252,211,77,0.08)', border: '1px solid rgba(252,211,77,0.15)' }}>
            <Sparkles size={10} color="#A855F7" />
            <span className="text-[10px] font-bold" style={{ color: '#A855F7' }}>{(status?.dust_balance || 0).toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div className="px-4 pt-2">
        {/* Status Overview */}
        <StatusCard
          dust={status?.dust_balance || 0}
          gems={status?.gems_balance || 0}
          fans={status?.fans_balance || 0}
          tier={status?.tier || 1}
          tierName={status?.tier_name || 'SEED'}
          exchangeRate={status?.exchange_rate || 1618}
          baseRate={status?.base_exchange_rate || 1618}
        />

        {/* Tabs */}
        <div className="flex gap-1 mb-4">
          {tabs.map(t => {
            const Icon = t.icon;
            const active = tab === t.id;
            return (
              <button key={t.id} onClick={() => setTab(t.id)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-medium transition-all"
                style={{
                  background: active ? 'rgba(168,85,247,0.1)' : 'rgba(255,255,255,0.02)',
                  border: `1px solid ${active ? 'rgba(168,85,247,0.2)' : 'rgba(255,255,255,0.04)'}`,
                  color: active ? '#A855F7' : 'rgba(248,250,252,0.4)',
                }}
                data-testid={`trader-tab-${t.id}`}>
                <Icon size={12} />
                {t.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {tab === 'alchemy' && (
            <motion.div key="alchemy" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <AlchemyPanel
                dust={status?.dust_balance || 0}
                tier={status?.tier || 1}
                tierName={status?.tier_name || 'SEED'}
                tierDynamics={status?.tier_dynamics}
                onTransmute={handleTransmute}
                loading={transmuting}
                lastResult={lastAlchemy}
              />
            </motion.div>
          )}
          {tab === 'trade' && (
            <motion.div key="trade" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <TradePanel
                dust={status?.dust_balance || 0}
                exchangeRate={status?.exchange_rate || 1618}
                onTrade={handleTrade}
                loading={trading}
              />
              <TransactionHistory entries={status?.recent_transactions || []} />
            </motion.div>
          )}
          {tab === 'blueprint' && (
            <motion.div key="blueprint" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <BlueprintPanel
                tier={status?.tier || 1}
                tierName={status?.tier_name || 'SEED'}
                onGenerate={handleGenerateBlueprint}
                loading={generating}
                lastBlueprint={lastBlueprint}
              />
            </motion.div>
          )}
          {tab === 'rewards' && (
            <motion.div key="rewards" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <RewardsList rewards={status?.complexity_rewards || DEFAULT_REWARDS} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
