import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { toast } from 'sonner';
import {
  Shield, Truck, PackageCheck, AlertTriangle, CheckCircle2,
  Clock, ChevronDown, ChevronUp, Send, XCircle, Lock, Coins, Copy
} from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const STATE_CONFIG = {
  committed: { label: 'Committed', color: '#818CF8', icon: Lock, desc: 'Digital assets locked. Awaiting shipment.' },
  shipped: { label: 'Shipped', color: '#FB923C', icon: Truck, desc: 'Physical item in transit.' },
  received: { label: 'Received', color: '#22C55E', icon: PackageCheck, desc: 'Delivery confirmed.' },
  released: { label: 'Released', color: '#22C55E', icon: CheckCircle2, desc: 'Trade complete. Credits released.' },
  disputed: { label: 'Disputed', color: '#EF4444', icon: AlertTriangle, desc: 'Frozen. Under admin review.' },
  cancelled: { label: 'Cancelled', color: '#94A3B8', icon: XCircle, desc: 'Trade was cancelled.' },
};

function EscrowStateTimeline({ stateHistory }) {
  if (!stateHistory || stateHistory.length === 0) return null;
  return (
    <div className="space-y-1.5 mt-3" data-testid="escrow-timeline">
      {stateHistory.map((s, i) => {
        const cfg = STATE_CONFIG[s.state] || STATE_CONFIG.committed;
        const Icon = cfg.icon;
        return (
          <div key={i} className="flex items-start gap-2">
            <div className="flex flex-col items-center">
              <div className="w-5 h-5 rounded-full flex items-center justify-center"
                style={{ background: `${cfg.color}15`, border: `1px solid ${cfg.color}30` }}>
                <Icon size={10} style={{ color: cfg.color }} />
              </div>
              {i < stateHistory.length - 1 && (
                <div className="w-px h-4" style={{ background: 'rgba(248,250,252,0.08)' }} />
              )}
            </div>
            <div className="flex-1 min-w-0 pb-1">
              <p className="text-[10px] font-medium" style={{ color: cfg.color }}>{cfg.label}</p>
              <p className="text-[9px]" style={{ color: 'var(--text-muted)' }}>
                {new Date(s.at).toLocaleString()}
                {s.tracking && <span className="ml-1" style={{ color: '#FB923C' }}>Tracking: {s.tracking}</span>}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function EscrowCard({ escrow, userId, authHeaders, onRefresh }) {
  const [expanded, setExpanded] = useState(false);
  const [trackingId, setTrackingId] = useState('');
  const [acting, setActing] = useState(false);

  const isSender = escrow.sender_id === userId;
  const isReceiver = escrow.receiver_id === userId;
  const cfg = STATE_CONFIG[escrow.state] || STATE_CONFIG.committed;
  const Icon = cfg.icon;

  const handleShip = async () => {
    setActing(true);
    try {
      await axios.post(`${API}/trade-circle/escrow/ship`, {
        escrow_id: escrow.id,
        tracking_id: trackingId,
      }, { headers: authHeaders });
      toast.success('Shipment recorded!');
      onRefresh();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to record shipment');
    }
    setActing(false);
  };

  const handleConfirmReceipt = async () => {
    setActing(true);
    try {
      const res = await axios.post(`${API}/trade-circle/escrow/confirm-receipt`, {
        escrow_id: escrow.id,
      }, { headers: authHeaders });
      toast.success(res.data.message || 'Receipt confirmed! Escrow released.');
      onRefresh();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Confirmation failed');
    }
    setActing(false);
  };

  const handleDispute = async () => {
    const reason = window.prompt('Describe the issue:');
    if (!reason) return;
    setActing(true);
    try {
      await axios.post(`${API}/trade-circle/escrow/dispute`, {
        escrow_id: escrow.id, reason,
      }, { headers: authHeaders });
      toast.success('Dispute filed. Escrow frozen.');
      onRefresh();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Dispute failed');
    }
    setActing(false);
  };

  const copyCode = () => {
    navigator.clipboard.writeText(escrow.resonance_code);
    toast.success('Resonance Code copied');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      className="rounded-xl overflow-hidden"
      style={{ background: 'rgba(248,250,252,0.02)', border: `1px solid ${cfg.color}15` }}
      data-testid={`escrow-card-${escrow.id}`}
    >
      {/* Header */}
      <div className="p-4 cursor-pointer flex items-center gap-3" onClick={() => setExpanded(!expanded)}>
        <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: `${cfg.color}10`, border: `1px solid ${cfg.color}20` }}>
          <Icon size={16} style={{ color: cfg.color }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <p className="text-xs font-medium truncate" style={{ color: 'var(--text-primary)' }}>
              {escrow.physical_description}
            </p>
            <span className="text-[8px] px-1.5 py-0.5 rounded-full flex-shrink-0"
              style={{ background: `${cfg.color}12`, color: cfg.color, border: `1px solid ${cfg.color}25` }}>
              {cfg.label}
            </span>
          </div>
          <p className="text-[10px] flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
            <Coins size={9} /> {escrow.digital_amount} {escrow.digital_asset_type}
            <span style={{ color: '#EF4444' }}>+{escrow.resonance_fee} fee</span>
            <span>&middot;</span>
            {isSender ? 'You ship' : 'You receive'}
          </p>
        </div>
        {expanded ? <ChevronUp size={14} style={{ color: 'var(--text-muted)' }} /> : <ChevronDown size={14} style={{ color: 'var(--text-muted)' }} />}
      </div>

      {/* Expanded */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-3" style={{ borderTop: '1px solid rgba(248,250,252,0.04)' }}>
              {/* Resonance Code */}
              <div className="flex items-center justify-between mt-3 rounded-lg p-2.5"
                style={{ background: 'rgba(234,179,8,0.04)', border: '1px solid rgba(234,179,8,0.1)' }}>
                <div>
                  <p className="text-[9px] uppercase tracking-widest font-bold" style={{ color: 'var(--text-muted)' }}>Resonance Code</p>
                  <p className="text-sm font-mono" style={{ color: '#EAB308' }}>{escrow.resonance_code}</p>
                </div>
                <button onClick={copyCode} className="p-1.5 rounded hover:bg-white/5" data-testid="copy-resonance-code">
                  <Copy size={12} style={{ color: 'var(--text-muted)' }} />
                </button>
              </div>

              {/* Tracking */}
              {escrow.tracking_id && (
                <div className="rounded-lg p-2.5" style={{ background: 'rgba(251,146,60,0.04)', border: '1px solid rgba(251,146,60,0.1)' }}>
                  <p className="text-[9px] uppercase tracking-widest font-bold" style={{ color: 'var(--text-muted)' }}>Tracking ID</p>
                  <p className="text-xs font-mono" style={{ color: '#FB923C' }}>{escrow.tracking_id}</p>
                </div>
              )}

              {/* Timeline */}
              <EscrowStateTimeline stateHistory={escrow.state_history} />

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                {/* Sender: Mark as Shipped */}
                {isSender && escrow.state === 'committed' && (
                  <div className="flex-1 space-y-2">
                    <input value={trackingId} onChange={e => setTrackingId(e.target.value)}
                      placeholder="Tracking ID (optional)"
                      className="w-full px-3 py-1.5 rounded-lg text-[11px] outline-none"
                      style={{ background: 'rgba(248,250,252,0.03)', color: 'var(--text-primary)', border: '1px solid rgba(248,250,252,0.08)' }}
                      data-testid="tracking-input" />
                    <button onClick={handleShip} disabled={acting}
                      className="w-full py-2 rounded-lg text-[11px] font-medium flex items-center justify-center gap-1.5 transition-all"
                      style={{ background: 'rgba(251,146,60,0.1)', color: '#FB923C', border: '1px solid rgba(251,146,60,0.2)' }}
                      data-testid="ship-btn">
                      <Send size={12} /> {acting ? 'Recording...' : 'Mark as Shipped'}
                    </button>
                  </div>
                )}

                {/* Receiver: Confirm Receipt */}
                {isReceiver && escrow.state === 'shipped' && (
                  <button onClick={handleConfirmReceipt} disabled={acting}
                    className="flex-1 py-2 rounded-lg text-[11px] font-medium flex items-center justify-center gap-1.5 transition-all"
                    style={{ background: 'rgba(34,197,94,0.1)', color: '#22C55E', border: '1px solid rgba(34,197,94,0.2)' }}
                    data-testid="confirm-receipt-btn">
                    <PackageCheck size={12} /> {acting ? 'Confirming...' : 'Confirm Receipt'}
                  </button>
                )}

                {/* Either: Dispute */}
                {!['released', 'cancelled'].includes(escrow.state) && (
                  <button onClick={handleDispute} disabled={acting}
                    className="py-2 px-3 rounded-lg text-[11px] flex items-center gap-1.5 transition-all"
                    style={{ color: '#EF4444', border: '1px solid rgba(239,68,68,0.12)' }}
                    data-testid="dispute-btn">
                    <AlertTriangle size={12} /> Dispute
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function CreateEscrowModal({ onClose, authHeaders, onCreated }) {
  const [offerId, setOfferId] = useState('');
  const [assetType, setAssetType] = useState('credits');
  const [amount, setAmount] = useState(10);
  const [description, setDescription] = useState('');
  const [creating, setCreating] = useState(false);
  const [acceptedOffers, setAcceptedOffers] = useState([]);

  useEffect(() => {
    axios.get(`${API}/trade-circle/my-offers`, { headers: authHeaders })
      .then(r => {
        const all = [...(r.data.sent || []), ...(r.data.received || [])];
        setAcceptedOffers(all.filter(o => o.status === 'accepted'));
      })
      .catch(() => {});
  }, [authHeaders]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!offerId || !description) { toast.error('Select a trade and describe the physical item'); return; }
    setCreating(true);
    try {
      const res = await axios.post(`${API}/trade-circle/escrow/create`, {
        offer_id: offerId,
        digital_asset_type: assetType,
        digital_amount: amount,
        physical_description: description,
      }, { headers: authHeaders });
      toast.success(`Escrow created! Code: ${res.data.resonance_code}`);
      onCreated();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to create escrow');
    }
    setCreating(false);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}>
      <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }}
        className="w-full max-w-md rounded-xl overflow-hidden max-h-[80vh] overflow-y-auto"
        style={{ background: 'var(--bg-secondary)', border: '1px solid rgba(248,250,252,0.06)' }}
        onClick={e => e.stopPropagation()}
        data-testid="create-escrow-modal">
        <div className="px-5 py-4 flex items-center justify-between sticky top-0"
          style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid rgba(248,250,252,0.04)', zIndex: 1 }}>
          <h3 className="text-sm font-medium flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <Shield size={14} style={{ color: '#818CF8' }} /> Create Escrow
          </h3>
          <button onClick={onClose} className="p-1 rounded hover:bg-white/5">
            <XCircle size={14} style={{ color: 'var(--text-muted)' }} />
          </button>
        </div>
        <form onSubmit={handleCreate} className="p-5 space-y-4">
          <div>
            <label className="text-[10px] uppercase tracking-widest font-bold mb-1.5 block" style={{ color: 'var(--text-muted)' }}>
              Accepted Trade
            </label>
            {acceptedOffers.length === 0 ? (
              <p className="text-xs py-2" style={{ color: 'var(--text-muted)' }}>No accepted trades available. Accept a trade offer first.</p>
            ) : (
              <select value={offerId} onChange={e => setOfferId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                style={{ background: 'rgba(248,250,252,0.03)', color: 'var(--text-primary)', border: '1px solid rgba(248,250,252,0.08)' }}
                data-testid="escrow-offer-select">
                <option value="">Select a trade...</option>
                {acceptedOffers.map(o => (
                  <option key={o.id} value={o.id}>{o.listing_title} — {o.offer_items}</option>
                ))}
              </select>
            )}
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-widest font-bold mb-1.5 block" style={{ color: 'var(--text-muted)' }}>
              Physical Item Description
            </label>
            <textarea value={description} onChange={e => setDescription(e.target.value)}
              placeholder="Describe the physical item being shipped..."
              rows={2}
              className="w-full px-3 py-2 rounded-lg text-sm outline-none resize-none"
              style={{ background: 'rgba(248,250,252,0.03)', color: 'var(--text-primary)', border: '1px solid rgba(248,250,252,0.08)' }}
              data-testid="escrow-description-input" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] uppercase tracking-widest font-bold mb-1.5 block" style={{ color: 'var(--text-muted)' }}>
                Digital Asset
              </label>
              <select value={assetType} onChange={e => setAssetType(e.target.value)}
                className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                style={{ background: 'rgba(248,250,252,0.03)', color: 'var(--text-primary)', border: '1px solid rgba(248,250,252,0.08)' }}
                data-testid="escrow-asset-select">
                <option value="credits">Credits</option>
                <option value="dust">Dust</option>
                <option value="gems">Gems</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-widest font-bold mb-1.5 block" style={{ color: 'var(--text-muted)' }}>
                Amount
              </label>
              <input type="number" value={amount} onChange={e => setAmount(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                style={{ background: 'rgba(248,250,252,0.03)', color: 'var(--text-primary)', border: '1px solid rgba(248,250,252,0.08)' }}
                data-testid="escrow-amount-input" />
            </div>
          </div>
          <div className="rounded-lg p-2.5 text-center" style={{ background: 'rgba(129,140,248,0.04)', border: '1px solid rgba(129,140,248,0.1)' }}>
            <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
              A <span style={{ color: '#EF4444' }}>5% Resonance Fee</span> will be added. The receiver's wallet will be debited {amount} + {Math.max(1, Math.floor(amount * 0.05))} = <span style={{ color: '#818CF8' }}>{amount + Math.max(1, Math.floor(amount * 0.05))}</span> total.
            </p>
          </div>
          <button type="submit" disabled={creating || !offerId || !description}
            className="w-full py-2.5 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-all"
            style={{ background: 'rgba(129,140,248,0.12)', color: '#818CF8', border: '1px solid rgba(129,140,248,0.2)' }}
            data-testid="create-escrow-btn">
            <Shield size={14} /> {creating ? 'Creating...' : 'Create Escrow'}
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
}

export default function EscrowDashboard({ authHeaders, userId }) {
  const [escrows, setEscrows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [filter, setFilter] = useState('all');

  const fetchEscrows = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/trade-circle/escrows`, { headers: authHeaders });
      setEscrows(res.data.escrows || []);
    } catch {}
    setLoading(false);
  }, [authHeaders]);

  useEffect(() => { fetchEscrows(); }, [fetchEscrows]);

  const filtered = filter === 'all' ? escrows : escrows.filter(e => e.state === filter);
  const counts = {
    all: escrows.length,
    committed: escrows.filter(e => e.state === 'committed').length,
    shipped: escrows.filter(e => e.state === 'shipped').length,
    released: escrows.filter(e => e.state === 'released').length,
    disputed: escrows.filter(e => e.state === 'disputed').length,
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="w-6 h-6 border-2 rounded-full animate-spin" style={{ borderColor: 'rgba(129,140,248,0.2)', borderTopColor: '#818CF8' }} />
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} data-testid="escrow-dashboard">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-lg font-light flex items-center gap-2" style={{ color: 'var(--text-primary)', fontFamily: 'Cormorant Garamond, serif' }}>
            <Shield size={18} style={{ color: '#818CF8' }} />
            Shipping Bridge
          </h2>
          <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
            Secure phygital escrow — digital assets locked until physical delivery verified
          </p>
        </div>
        <button onClick={() => setShowCreate(true)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[11px] font-medium transition-all hover:scale-105"
          style={{ background: 'rgba(129,140,248,0.1)', color: '#818CF8', border: '1px solid rgba(129,140,248,0.2)' }}
          data-testid="new-escrow-btn">
          <Shield size={12} /> New Escrow
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-1 mb-5 overflow-x-auto pb-1">
        {[
          { id: 'all', label: 'All' },
          { id: 'committed', label: 'Committed' },
          { id: 'shipped', label: 'In Transit' },
          { id: 'released', label: 'Complete' },
          { id: 'disputed', label: 'Disputed' },
        ].map(f => (
          <button key={f.id} onClick={() => setFilter(f.id)}
            className="px-3 py-1.5 rounded-lg text-[10px] whitespace-nowrap transition-all flex items-center gap-1"
            style={{
              background: filter === f.id ? 'rgba(129,140,248,0.08)' : 'transparent',
              color: filter === f.id ? '#818CF8' : 'var(--text-muted)',
              border: `1px solid ${filter === f.id ? 'rgba(129,140,248,0.15)' : 'rgba(248,250,252,0.06)'}`,
            }}
            data-testid={`escrow-filter-${f.id}`}>
            {f.label}
            {counts[f.id] > 0 && (
              <span className="w-4 h-4 rounded-full flex items-center justify-center text-[8px]"
                style={{ background: `${STATE_CONFIG[f.id === 'all' ? 'committed' : f.id]?.color || '#818CF8'}15` }}>
                {counts[f.id]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Escrow List */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <Shield size={24} className="mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
          <p className="text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>No escrows yet</p>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Create one from an accepted trade to start a secure exchange</p>
        </div>
      ) : (
        <div className="space-y-3" data-testid="escrow-list">
          {filtered.map(e => (
            <EscrowCard key={e.id} escrow={e} userId={userId} authHeaders={authHeaders} onRefresh={fetchEscrows} />
          ))}
        </div>
      )}

      <AnimatePresence>
        {showCreate && <CreateEscrowModal onClose={() => setShowCreate(false)} authHeaders={authHeaders} onCreated={fetchEscrows} />}
      </AnimatePresence>
    </motion.div>
  );
}
