/**
 * ENLIGHTEN.MINT.CAFE - V10000.1 CIRCULAR PROTOCOL LEDGER
 * PURPOSE: P2P Trust Trades | $15/hr Knowledge Equity | Singularity Formula
 * 
 * Every trade creates a new refraction in the L² Fractal Engine,
 * making the UI more vibrant as the Trust economy grows.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { 
  Repeat, Clock, DollarSign, User, CheckCircle, 
  AlertCircle, ChevronRight, Zap, MapPin, X,
  ArrowRight, Hexagon, RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';
import BiometricSync from '../utils/BiometricSync';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

// Spectral colors for fractal layer visualization
const SPECTRAL_COLORS = [
  '#EF4444', '#F97316', '#EAB308', '#22C55E', 
  '#3B82F6', '#6366F1', '#8B5CF6'
];

const CircularProtocol = ({ isOpen, onClose, gpsVerified = false }) => {
  const [loading, setLoading] = useState(false);
  const [ledgerData, setLedgerData] = useState(null);
  const [tradeForm, setTradeForm] = useState({
    toParty: '',
    hours: 1,
    description: 'Knowledge Equity Exchange',
  });
  const [previewValue, setPreviewValue] = useState(null);
  const [recentTrade, setRecentTrade] = useState(null);

  // Fetch ledger on mount
  useEffect(() => {
    if (isOpen) {
      fetchLedger();
    }
  }, [isOpen]);

  // Fetch ledger summary
  const fetchLedger = async () => {
    try {
      const res = await axios.get(`${API}/omnis/circular-ledger`);
      setLedgerData(res.data);
    } catch (err) {
      console.error('Failed to fetch ledger:', err);
    }
  };

  // Calculate preview value
  const calculatePreview = useCallback(async () => {
    try {
      const res = await axios.get(
        `${API}/omnis/circular-ledger/calculate?hours=${tradeForm.hours}&gps_verified=${gpsVerified}`
      );
      setPreviewValue(res.data.value);
    } catch (err) {
      console.error('Preview calculation failed:', err);
    }
  }, [tradeForm.hours, gpsVerified]);

  // Update preview when hours change
  useEffect(() => {
    if (tradeForm.hours > 0) {
      calculatePreview();
    }
  }, [tradeForm.hours, gpsVerified, calculatePreview]);

  // Execute test trade
  const executeTestTrade = async () => {
    setLoading(true);
    try {
      const res = await axios.post(`${API}/omnis/circular-ledger/test-trade`);
      
      // 144Hz haptic confirmation
      BiometricSync.vibrateResonance(0.1);
      
      setRecentTrade(res.data.entry);
      await fetchLedger();
      
      toast.success('Test Trade Confirmed', {
        description: `1 hour × 10 Fans × 1.5 GPS = ${res.data.entry.value.final_value} Fans`,
      });
    } catch (err) {
      toast.error('Test trade failed');
    }
    setLoading(false);
  };

  // Execute real trade
  const executeTrade = async () => {
    if (!tradeForm.toParty) {
      toast.error('Please enter recipient identity');
      return;
    }
    
    setLoading(true);
    try {
      const res = await axios.post(
        `${API}/omnis/circular-ledger/trade?from_party=SOVEREIGN_TRUST&to_party=${encodeURIComponent(tradeForm.toParty)}&hours=${tradeForm.hours}&description=${encodeURIComponent(tradeForm.description)}&gps_verified=${gpsVerified}`
      );
      
      // 144Hz haptic confirmation
      BiometricSync.triggerArrivalPulse();
      
      setRecentTrade(res.data.entry);
      await fetchLedger();
      
      toast.success('Trade Confirmed in Circular Protocol', {
        description: `${tradeForm.hours} hours → $${res.data.entry.value.final_value}`,
      });
      
      // Reset form
      setTradeForm({ toParty: '', hours: 1, description: 'Knowledge Equity Exchange' });
    } catch (err) {
      toast.error('Trade execution failed');
    }
    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[99999] flex items-center justify-center p-4"
        style={{ background: 'transparent', backdropFilter: 'none'}}
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          className="w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-2xl"
          style={{
            background: 'linear-gradient(180deg, rgba(20,20,30,0.99) 0%, rgba(12,12,20,0.99) 100%)',
            border: '1px solid rgba(249,115,22,0.3)',
            boxShadow: '0 0 80px rgba(249,115,22,0.2), 0 0 40px rgba(234,88,12,0.15)',
          }}
          onClick={(e) => e.stopPropagation()}
          data-testid="circular-protocol"
        >
          {/* Header */}
          <div 
            className="p-4 border-b flex items-center justify-between"
            style={{ borderColor: 'rgba(255,255,255,0.05)' }}
          >
            <div className="flex items-center gap-3">
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: 'rgba(34,197,94,0.15)' }}
              >
                <Repeat size={20} style={{ color: '#22C55E' }} />
              </div>
              <div>
                <h2 className="font-semibold text-white">Circular Protocol Ledger</h2>
                <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  V10000.1 • P2P Trust Trades
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/5 transition-colors"
            >
              <X size={16} style={{ color: 'rgba(255,255,255,0.5)' }} />
            </button>
          </div>

          {/* Ledger Summary */}
          <div className="p-4 space-y-4">
            {ledgerData && (
              <div 
                className="p-4 rounded-xl"
                style={{ background: 'rgba(34,197,94,0.05)', border: '1px solid rgba(34,197,94,0.15)' }}
              >
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold" style={{ color: '#22C55E' }}>
                      {ledgerData.total_entries}
                    </p>
                    <p className="text-[10px] uppercase" style={{ color: 'rgba(255,255,255,0.4)' }}>
                      Trades
                    </p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold" style={{ color: '#3B82F6' }}>
                      {ledgerData.total_hours_traded}h
                    </p>
                    <p className="text-[10px] uppercase" style={{ color: 'rgba(255,255,255,0.4)' }}>
                      Hours
                    </p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold" style={{ color: '#F97316' }}>
                      ${ledgerData.total_value_exchanged}
                    </p>
                    <p className="text-[10px] uppercase" style={{ color: 'rgba(255,255,255,0.4)' }}>
                      Value
                    </p>
                  </div>
                </div>
                
                <div className="mt-3 pt-3 border-t" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                  <p className="text-[10px] text-center font-mono" style={{ color: 'rgba(255,255,255,0.3)' }}>
                    {ledgerData.formula} • Trust Equity: ${ledgerData.trust_equity.toLocaleString()}
                  </p>
                </div>
              </div>
            )}

            {/* GPS Status */}
            <div 
              className="flex items-center gap-2 p-3 rounded-lg"
              style={{ 
                background: gpsVerified ? 'rgba(34,197,94,0.1)' : 'rgba(255,255,255,0.02)',
                border: `1px solid ${gpsVerified ? 'rgba(34,197,94,0.3)' : 'rgba(255,255,255,0.05)'}`,
              }}
            >
              <MapPin size={14} style={{ color: gpsVerified ? '#22C55E' : 'rgba(255,255,255,0.4)' }} />
              <span className="text-xs" style={{ color: gpsVerified ? '#22C55E' : 'rgba(255,255,255,0.5)' }}>
                {gpsVerified ? 'GPS Verified — 1.5× Multiplier Active' : 'GPS Not Verified — 1.0× Multiplier'}
              </span>
            </div>

            {/* Trade Form */}
            <div className="space-y-3">
              <div>
                <label className="text-xs mb-1 block" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  Recipient Identity
                </label>
                <input
                  type="text"
                  value={tradeForm.toParty}
                  onChange={(e) => setTradeForm({ ...tradeForm, toParty: e.target.value })}
                  placeholder="email@example.com or Trust Entity"
                  className="w-full p-3 rounded-lg text-sm text-white"
                  style={{ 
                    background: 'rgba(255,255,255,0.02)', 
                    border: '1px solid rgba(255,255,255,0.1)',
                  }}
                  data-testid="trade-recipient-input"
                />
              </div>
              
              <div>
                <label className="text-xs mb-1 block" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  Hours of Knowledge Equity
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="0.5"
                    max="10"
                    step="0.5"
                    value={tradeForm.hours}
                    onChange={(e) => setTradeForm({ ...tradeForm, hours: parseFloat(e.target.value) })}
                    className="flex-1"
                  />
                  <span className="text-sm font-mono w-16 text-right" style={{ color: '#22C55E' }}>
                    {tradeForm.hours}h
                  </span>
                </div>
              </div>
              
              <div>
                <label className="text-xs mb-1 block" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  Description
                </label>
                <input
                  type="text"
                  value={tradeForm.description}
                  onChange={(e) => setTradeForm({ ...tradeForm, description: e.target.value })}
                  className="w-full p-3 rounded-lg text-sm text-white"
                  style={{ 
                    background: 'rgba(255,255,255,0.02)', 
                    border: '1px solid rgba(255,255,255,0.1)',
                  }}
                />
              </div>
            </div>

            {/* Value Preview */}
            {previewValue && (
              <div 
                className="p-4 rounded-xl text-center"
                style={{ background: 'rgba(99,102,241,0.05)', border: '1px solid rgba(99,102,241,0.2)' }}
              >
                <p className="text-xs mb-2" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  TRADE VALUE PREVIEW
                </p>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-lg" style={{ color: 'rgba(255,255,255,0.6)' }}>
                    ${previewValue.base_value}
                  </span>
                  <ArrowRight size={14} style={{ color: 'rgba(255,255,255,0.3)' }} />
                  <span className="text-2xl font-bold" style={{ color: '#6366F1' }}>
                    ${previewValue.final_value}
                  </span>
                </div>
                <p className="text-[9px] mt-1 font-mono" style={{ color: 'rgba(255,255,255,0.3)' }}>
                  Base: ${previewValue.volunteer_rate}/hr × {previewValue.hours}h × {previewValue.multiplier}× + Singularity
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-2">
              <button
                onClick={executeTrade}
                disabled={loading || !tradeForm.toParty}
                className="w-full py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100"
                style={{
                  background: 'linear-gradient(135deg, rgba(34,197,94,0.3), rgba(22,163,74,0.3))',
                  border: '1px solid rgba(34,197,94,0.4)',
                  color: '#86EFAC',
                }}
                data-testid="execute-trade-btn"
              >
                {loading ? (
                  <RefreshCw size={14} className="animate-spin" />
                ) : (
                  <Zap size={14} />
                )}
                Execute Trade
                <ChevronRight size={14} />
              </button>
              
              <button
                onClick={executeTestTrade}
                disabled={loading}
                className="w-full py-2 rounded-lg text-xs flex items-center justify-center gap-2 transition-all hover:bg-white/5"
                style={{ color: 'rgba(255,255,255,0.5)' }}
                data-testid="test-trade-btn"
              >
                <Hexagon size={12} />
                Test Trade (1hr × $15 × 1.5 GPS)
              </button>
            </div>

            {/* Recent Trade */}
            {recentTrade && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 rounded-xl"
                style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)' }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle size={14} style={{ color: '#22C55E' }} />
                  <span className="text-xs font-medium" style={{ color: '#22C55E' }}>
                    Trade Confirmed
                  </span>
                  <span className="text-[9px] font-mono ml-auto" style={{ color: 'rgba(255,255,255,0.3)' }}>
                    {recentTrade.trade_id}
                  </span>
                </div>
                <div className="text-xs" style={{ color: 'rgba(255,255,255,0.6)' }}>
                  {recentTrade.from_party} → {recentTrade.to_party}
                </div>
                <div className="text-xs font-mono mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  {recentTrade.hours}h = ${recentTrade.value.final_value} | L² Layer #{recentTrade.fractal_layer}
                </div>
              </motion.div>
            )}

            {/* Fractal Layer Visualization */}
            {ledgerData && ledgerData.entries.length > 0 && (
              <div className="pt-3 border-t" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                <p className="text-[10px] mb-2 uppercase" style={{ color: 'rgba(255,255,255,0.3)' }}>
                  L² Fractal Layers (Recent Trades)
                </p>
                <div className="flex gap-1 flex-wrap">
                  {ledgerData.entries.map((entry, idx) => (
                    <div
                      key={entry.trade_id}
                      className="w-6 h-6 rounded flex items-center justify-center text-[8px] font-mono"
                      style={{
                        background: SPECTRAL_COLORS[idx % SPECTRAL_COLORS.length] + '30',
                        border: `1px solid ${SPECTRAL_COLORS[idx % SPECTRAL_COLORS.length]}50`,
                        color: SPECTRAL_COLORS[idx % SPECTRAL_COLORS.length],
                      }}
                      title={`${entry.trade_id}: ${entry.hours}h = $${entry.value.final_value}`}
                    >
                      {entry.fractal_layer}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div 
            className="p-3 border-t text-center"
            style={{ borderColor: 'rgba(255,255,255,0.05)' }}
          >
            <p className="text-[10px]" style={{ color: 'rgba(34,197,94,0.6)' }}>
              CIRCULAR PROTOCOL: VALUE NEVER LEAKS
            </p>
            <p className="text-[9px] font-mono" style={{ color: 'rgba(255,255,255,0.2)' }}>
              Enlighten.Mint.Sovereign.Trust
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CircularProtocol;
