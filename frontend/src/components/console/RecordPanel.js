/**
 * RecordPanel.js — Media recording controls
 * Extracted from UnifiedCreatorConsole.js
 */
import React from 'react';

export default function RecordPanel({ media }) {
  return (
    <div className="p-3 space-y-2">
      <div className="grid grid-cols-3 gap-2">
        {[
          { key: 'video', label: 'Video', desc: 'Camera + Mic', active: media.isRecVideo, color: '#EF4444' },
          { key: 'audio', label: 'Audio', desc: 'Mic Only', active: media.isRecAudio, color: '#F59E0B' },
          { key: 'screen', label: 'Screen', desc: 'Screen Capture', active: media.isRecScreen, color: '#8B5CF6' },
        ].map(r => (
          <button key={r.key} onClick={() => r.active ? media.stopAll() : media.startRecording(r.key)}
            className="p-3 rounded-xl text-center active:scale-95"
            style={{ background: r.active ? `${r.color}20` : 'rgba(255,255,255,0.02)', border: `1px solid ${r.active ? `${r.color}40` : 'rgba(255,255,255,0.06)'}` }}
            data-testid={`rec-${r.key}`}>
            {r.active && <div className="w-3 h-3 rounded-full mx-auto mb-1 animate-pulse" style={{ background: r.color }} />}
            <div className="text-[10px] font-bold" style={{ color: r.active ? r.color : 'rgba(255,255,255,0.6)' }}>{r.active ? 'STOP' : r.label}</div>
            <div className="text-[7px] text-white/25">{r.desc}</div>
          </button>
        ))}
      </div>
      {media.isRecording && (
        <div className="flex items-center gap-2 p-2 rounded-lg" style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)' }}>
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span className="text-[9px] text-red-400/70">Recording — tap STOP to save</span>
        </div>
      )}
    </div>
  );
}
