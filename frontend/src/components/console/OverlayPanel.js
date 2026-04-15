/**
 * OverlayPanel.js — Image/logo overlay controls
 * Extracted from UnifiedCreatorConsole.js
 */
import React from 'react';
import { toast } from 'sonner';

export default function OverlayPanel({ imageOverlays, setImageOverlays }) {
  return (
    <div className="p-3 space-y-2">
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'Image', desc: 'Add photo', action: () => document.getElementById('img-import')?.click() },
          { label: 'Logo', desc: 'Brand mark', action: () => document.getElementById('img-import')?.click() },
          { label: 'Frame', desc: 'Border', action: () => { setImageOverlays(prev => [...prev, { id: Date.now(), isFrame: true }]); toast.success('Frame added'); } },
        ].map(o => (
          <button key={o.label} onClick={o.action} className="p-2.5 rounded-xl text-center active:scale-95"
            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
            data-testid={`overlay-${o.label.toLowerCase()}`}>
            <div className="text-[10px] font-medium text-white/60">{o.label}</div>
            <div className="text-[7px] text-white/25">{o.desc}</div>
          </button>
        ))}
      </div>
      <input type="file" id="img-import" accept="image/*" className="hidden" onChange={(e) => {
        const file = e.target.files?.[0];
        if (file) {
          const url = URL.createObjectURL(file);
          setImageOverlays(prev => [...prev, { id: Date.now(), url, name: file.name, x: 5 + Math.random() * 50, y: 5 + Math.random() * 30, width: 180, opacity: 0.85 }]);
          toast.success(`Overlay: ${file.name}`);
        }
      }} />
      {imageOverlays.length > 0 && (
        <div className="flex items-center justify-between p-1.5 rounded-lg" style={{ background: 'rgba(248,250,252,0.02)' }}>
          <span className="text-[9px] text-white/40">{imageOverlays.length} layer(s)</span>
          <button onClick={() => { imageOverlays.forEach(o => o.url && URL.revokeObjectURL(o.url)); setImageOverlays([]); }}
            className="text-[8px] text-red-400/70 font-bold px-2 py-0.5 rounded active:scale-95" style={{ background: 'rgba(239,68,68,0.06)' }} data-testid="overlay-clear-all">Clear All</button>
        </div>
      )}
    </div>
  );
}
