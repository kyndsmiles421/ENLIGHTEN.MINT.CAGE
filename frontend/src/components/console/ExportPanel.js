/**
 * ExportPanel.js — Export, broadcast, and print controls
 * Extracted from UnifiedCreatorConsole.js
 */
import React from 'react';
import { toast } from 'sonner';

export default function ExportPanel({ selectedAspectRatio, setSelectedAspectRatio, handlePrintModule, handlePrintLedger }) {
  return (
    <div className="p-3 space-y-3">
      <div>
        <div className="text-[8px] text-white/30 uppercase tracking-wider mb-1.5">Aspect Ratio</div>
        <div className="flex gap-1.5">
          {['16:9', '9:16', '1:1', '4:3', '4:5'].map(r => (
            <button key={r} onClick={() => setSelectedAspectRatio(r)} className="flex-1 py-2 rounded-lg text-center active:scale-95 transition-all"
              style={{ background: selectedAspectRatio === r ? 'rgba(34,197,94,0.12)' : 'rgba(255,255,255,0.02)', border: `1px solid ${selectedAspectRatio === r ? 'rgba(34,197,94,0.3)' : 'rgba(255,255,255,0.06)'}`, color: selectedAspectRatio === r ? '#22C55E' : 'rgba(255,255,255,0.4)' }}
              data-testid={`ratio-${r.replace(':', 'x')}`}>
              <div className="text-[10px] font-bold">{r}</div>
            </button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <button onClick={() => toast.success(`Export: ${selectedAspectRatio}`)} className="p-3 rounded-xl text-center active:scale-95"
          style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)' }} data-testid="export-video">
          <div className="text-[10px] font-bold text-green-400">Export</div>
        </button>
        <button onClick={() => { navigator.share?.({ title: 'ENLIGHTEN.MINT.CAFE', text: 'Created with the Sovereign Engine', url: window.location.origin }).catch(() => {}); }}
          className="p-3 rounded-xl text-center active:scale-95" style={{ background: 'rgba(56,189,248,0.08)', border: '1px solid rgba(56,189,248,0.2)' }} data-testid="broadcast-btn">
          <div className="text-[10px] font-bold text-sky-400">Broadcast</div>
        </button>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <button onClick={handlePrintModule} className="p-2.5 rounded-xl text-center active:scale-95"
          style={{ background: 'rgba(192,132,252,0.08)', border: '1px solid rgba(192,132,252,0.2)' }} data-testid="print-btn">
          <div className="text-[10px] font-bold text-purple-400">Print Page</div>
          <div className="text-[7px] text-white/20">Module content</div>
        </button>
        <button onClick={handlePrintLedger} className="p-2.5 rounded-xl text-center active:scale-95"
          style={{ background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.2)' }} data-testid="ledger-btn">
          <div className="text-[10px] font-bold" style={{ color: '#D4AF37' }}>Sovereign Ledger</div>
          <div className="text-[7px] text-white/20">Math + Bank snapshot</div>
        </button>
      </div>
    </div>
  );
}
