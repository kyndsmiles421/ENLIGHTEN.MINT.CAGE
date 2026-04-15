/**
 * AudioPanel.js — Audio controls panel
 * Extracted from UnifiedCreatorConsole.js
 */
import React from 'react';
import { toast } from 'sonner';

export default function AudioPanel({ media, masterLevel, setMasterLevel }) {
  return (
    <div className="p-3 space-y-2">
      <div className="grid grid-cols-2 gap-2">
        <button onClick={() => media.isRecAudio ? media.stopAll() : media.startRecording('audio')}
          className="p-2.5 rounded-xl text-left active:scale-95"
          style={{ background: media.isRecAudio ? 'rgba(239,68,68,0.08)' : 'rgba(255,255,255,0.02)', border: `1px solid ${media.isRecAudio ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.06)'}` }}
          data-testid="audio-record-voice">
          <div className="text-[10px] font-medium" style={{ color: media.isRecAudio ? '#EF4444' : 'rgba(255,255,255,0.6)' }}>{media.isRecAudio ? 'Stop Recording' : 'Record Voice'}</div>
        </button>
        <button onClick={() => document.getElementById('audio-import')?.click()}
          className="p-2.5 rounded-xl text-left active:scale-95" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
          data-testid="audio-import-btn">
          <div className="text-[10px] font-medium text-white/60">Import Audio</div>
        </button>
      </div>
      <input type="file" id="audio-import" accept="audio/*" className="hidden" onChange={(e) => { if (e.target.files?.[0]) toast.success(`Audio: ${e.target.files[0].name}`); }} />
      <div className="flex items-center justify-between">
        <span className="text-[8px] text-white/30 uppercase">Master Volume</span>
        <span className="text-[8px] font-mono text-white/20">{masterLevel}%</span>
      </div>
      <input type="range" min="0" max="100" value={masterLevel} onChange={(e) => setMasterLevel(Number(e.target.value))}
        className="w-full h-1.5 rounded-full cursor-pointer" style={{ accentColor: '#38BDF8' }} data-testid="audio-master-volume" />
    </div>
  );
}
