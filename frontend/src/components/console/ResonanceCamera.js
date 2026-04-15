/**
 * ResonanceCamera.js — Capture UI for the Resonance Camera
 * 
 * A compact control strip that appears in the Orbit panel:
 *   [Record] — starts canvas + audio capture
 *   [Stop] — finishes recording, shows preview
 *   [Download] [Share] [Discard] — post-capture actions
 * 
 * Pulsing indicator + timer during capture. Preview thumbnail after stop.
 */
import React from 'react';
import { Video, Square, Download, Share2, Trash2 } from 'lucide-react';

export default function ResonanceCamera({ capture }) {
  const { start, stop, download, share, discard, isCapturing, duration, previewUrl } = capture;

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center gap-2 px-3 py-2" style={{ borderTop: '1px solid rgba(239,68,68,0.08)' }} data-testid="resonance-camera">
      {/* Recording state */}
      {isCapturing ? (
        <>
          <button onClick={stop}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg active:scale-95 transition-all"
            style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)' }}
            data-testid="resonance-stop">
            <Square size={10} fill="#EF4444" style={{ color: '#EF4444' }} />
            <span className="text-[9px] font-bold text-red-400">STOP</span>
          </button>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-[9px] font-mono text-red-400/70">{formatTime(duration)}</span>
          </div>
          <span className="text-[7px] text-white/20 ml-auto">Resonance Camera</span>
        </>
      ) : previewUrl ? (
        /* Post-capture: preview + actions */
        <>
          <video src={previewUrl} className="w-12 h-8 rounded object-cover" style={{ border: '1px solid rgba(139,92,246,0.2)' }} muted data-testid="resonance-preview" />
          <div className="flex items-center gap-1.5">
            <button onClick={download}
              className="flex items-center gap-1 px-2 py-1 rounded-lg active:scale-95"
              style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)' }}
              data-testid="resonance-download">
              <Download size={10} style={{ color: '#22C55E' }} />
              <span className="text-[8px] font-bold text-green-400">Save</span>
            </button>
            <button onClick={share}
              className="flex items-center gap-1 px-2 py-1 rounded-lg active:scale-95"
              style={{ background: 'rgba(56,189,248,0.1)', border: '1px solid rgba(56,189,248,0.2)' }}
              data-testid="resonance-share">
              <Share2 size={10} style={{ color: '#38BDF8' }} />
              <span className="text-[8px] font-bold text-sky-400">Share</span>
            </button>
            <button onClick={discard}
              className="flex items-center gap-1 px-2 py-1 rounded-lg active:scale-95"
              style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
              data-testid="resonance-discard">
              <Trash2 size={10} style={{ color: 'rgba(255,255,255,0.3)' }} />
            </button>
          </div>
          <span className="text-[7px] text-white/20 ml-auto">{formatTime(duration)}</span>
        </>
      ) : (
        /* Idle: record button */
        <>
          <button onClick={start}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg active:scale-95 transition-all"
            style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)' }}
            data-testid="resonance-record">
            <Video size={12} style={{ color: '#EF4444' }} />
            <span className="text-[9px] font-bold text-red-400/80">Resonance Camera</span>
          </button>
          <span className="text-[7px] text-white/15 ml-auto">Capture your frequency signature</span>
        </>
      )}
    </div>
  );
}
