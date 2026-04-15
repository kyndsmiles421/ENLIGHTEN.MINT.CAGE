/**
 * TextPanel.js — Text overlay controls
 * Extracted from UnifiedCreatorConsole.js
 */
import React, { useRef } from 'react';
import { toast } from 'sonner';

export default function TextPanel({ textOverlays, setTextOverlays }) {
  const textInputRef = useRef(null);

  return (
    <div className="p-3 space-y-2">
      <textarea ref={textInputRef} placeholder="Type your text, then tap a style..." rows={2}
        className="w-full p-2 rounded-lg text-[11px] text-white/70 resize-none"
        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', outline: 'none' }}
        data-testid="text-input" />
      <div className="grid grid-cols-3 gap-2">
        {[
          { type: 'Title', style: { fontSize: '32px', fontWeight: 'bold', fontFamily: 'Cormorant Garamond, serif' } },
          { type: 'Subtitle', style: { fontSize: '20px', fontWeight: '500', fontFamily: 'Cormorant Garamond, serif' } },
          { type: 'Caption', style: { fontSize: '14px', fontWeight: '400' } },
          { type: 'Quote', style: { fontSize: '18px', fontStyle: 'italic', fontFamily: 'Cormorant Garamond, serif' } },
          { type: 'Label', style: { fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '3px' } },
          { type: 'Watermark', style: { fontSize: '48px', fontWeight: 'bold', opacity: 0.15 } },
        ].map(t => (
          <button key={t.type} onClick={() => {
            const text = textInputRef.current?.value?.trim() || t.type;
            setTextOverlays(prev => [...prev, { id: Date.now(), text, style: t.style, x: 10 + Math.random() * 60, y: 5 + Math.random() * 40 }]);
            toast.success(`${t.type} placed on screen`);
            if (textInputRef.current) textInputRef.current.value = '';
          }}
            className="p-2 rounded-xl text-center active:scale-95"
            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
            data-testid={`text-${t.type.toLowerCase()}`}>
            <div className="text-[10px] font-medium text-white/60">{t.type}</div>
          </button>
        ))}
      </div>
      {textOverlays.length > 0 && (
        <div className="flex items-center justify-between p-1.5 rounded-lg" style={{ background: 'rgba(248,250,252,0.02)' }}>
          <span className="text-[9px] text-white/40">{textOverlays.length} overlay(s)</span>
          <button onClick={() => setTextOverlays([])} className="text-[8px] text-red-400/70 font-bold px-2 py-0.5 rounded active:scale-95" style={{ background: 'rgba(239,68,68,0.06)' }} data-testid="text-clear-all">Clear All</button>
        </div>
      )}
    </div>
  );
}
