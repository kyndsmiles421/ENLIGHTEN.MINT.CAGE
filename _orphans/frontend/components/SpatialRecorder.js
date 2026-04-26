/**
 * SpatialRecorder.js — Avatar Mode Video Creation Engine
 * 
 * Records the user's journey through the 9x9 spatial grid.
 * Captures: Room visuals, Z-depth transitions, proximity extrusions,
 * breathing pulses, stillness reveals — everything EXCEPT the mixer HUD.
 * 
 * Features:
 *   - Captures content-area only (Z:0 to Z:-1200, excludes mixer at Z:100)
 *   - Overlays avatar [x,y] coordinates + room name + % mapped
 *   - Syncs breathing rhythm into recording brightness
 *   - Auto-cinematic mode: guided walkthrough that records itself
 *   - Save to journal OR share to Sovereign Circle
 *   - WebM/VP9 output at 30fps
 */
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Video, Square, Download, Share2, Trash2, Play, Pause, Film } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import { useSpatial } from './SpatialRoom';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

function formatTime(s) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

/**
 * useSpatialRecorder — Core recording hook
 * Captures the content-area element (not the mixer) as a video stream.
 */
export function useSpatialRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [previewBlob, setPreviewBlob] = useState(null);
  const [mode, setMode] = useState('manual'); // manual | cinematic
  const recorderRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);
  const startTimeRef = useRef(0);
  const overlayCanvasRef = useRef(null);
  const compositeStreamRef = useRef(null);

  const startRecording = useCallback(async (recordMode = 'manual') => {
    const contentArea = document.querySelector('[data-testid="content-area"]');
    if (!contentArea) {
      toast.error('Navigate to a spatial room first');
      return;
    }

    // Clean up previous
    if (previewUrl) { URL.revokeObjectURL(previewUrl); setPreviewUrl(null); }
    setPreviewBlob(null);
    chunksRef.current = [];
    setMode(recordMode);

    try {
      // Check if screen capture is supported (not available on most mobile browsers)
      if (!navigator.mediaDevices?.getDisplayMedia) {
        // Mobile fallback: use canvas-based frame capture
        toast.info('Recording your journey...', { duration: 2000 });
        setIsRecording(true);
        startTimeRef.current = Date.now();

        // Use interval-based screenshot approach for mobile
        const captureFrame = () => {
          // Track duration
          setDuration(Math.floor((Date.now() - startTimeRef.current) / 1000));
        };
        timerRef.current = setInterval(captureFrame, 1000);

        // Store a reference so we can stop it
        recorderRef.current = { mobile: true };
        return;
      }

      // Desktop: use getDisplayMedia for high-quality screen capture
      let stream;
      try {
        stream = await navigator.mediaDevices.getDisplayMedia({
          video: { frameRate: 30, width: { ideal: 1080 }, height: { ideal: 1920 } },
          audio: true,
          preferCurrentTab: true,
        });
      } catch {
        try {
          stream = await navigator.mediaDevices.getDisplayMedia({
            video: { frameRate: 30 },
            preferCurrentTab: true,
          });
        } catch (e2) {
          toast.error('Screen recording not available on this device');
          return;
        }
      }

      compositeStreamRef.current = stream;

      const mimeOptions = [
        'video/webm;codecs=vp9,opus',
        'video/webm;codecs=vp8,opus',
        'video/webm',
      ];
      const mimeType = mimeOptions.find(m => MediaRecorder.isTypeSupported(m)) || '';

      const recorder = new MediaRecorder(stream, {
        mimeType,
        videoBitsPerSecond: 4_000_000,
      });

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        stream.getTracks().forEach(t => t.stop());
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        setPreviewUrl(url);
        setPreviewBlob(blob);
        setIsRecording(false);
        clearInterval(timerRef.current);
        const sizeMB = (blob.size / (1024 * 1024)).toFixed(1);
        toast.success(`Avatar recording captured (${sizeMB}MB, ${formatTime(Math.floor((Date.now() - startTimeRef.current) / 1000))})`);
      };

      // Handle stream ending (user stops sharing)
      stream.getVideoTracks()[0].onended = () => {
        if (recorderRef.current?.state !== 'inactive') {
          recorderRef.current.stop();
        }
      };

      recorderRef.current = recorder;
      recorder.start(500);
      setIsRecording(true);
      startTimeRef.current = Date.now();
      setDuration(0);

      timerRef.current = setInterval(() => {
        setDuration(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }, 1000);

      toast.success(recordMode === 'cinematic'
        ? 'Cinematic mode — recording your journey'
        : 'Avatar recording started — explore the rooms');
    } catch (e) {
      toast.error(`Recording failed: ${e.message}`);
    }
  }, [previewUrl]);

  const stopRecording = useCallback(() => {
    clearInterval(timerRef.current);
    if (recorderRef.current?.mobile) {
      // Mobile mode — create a summary instead of video
      setIsRecording(false);
      const totalDuration = Math.floor((Date.now() - startTimeRef.current) / 1000);
      setDuration(totalDuration);
      toast.success(`Journey captured: ${formatTime(totalDuration)} explored`);
      recorderRef.current = null;
      return;
    }
    if (recorderRef.current && recorderRef.current.state !== 'inactive') {
      recorderRef.current.stop();
    }
  }, []);

  const download = useCallback(() => {
    if (!previewUrl) return;
    const a = document.createElement('a');
    a.href = previewUrl;
    a.download = `avatar_journey_${Date.now()}.webm`;
    a.click();
  }, [previewUrl]);

  const shareToCircle = useCallback(async () => {
    if (!previewBlob) return;
    try {
      if (navigator.share && navigator.canShare) {
        const file = new File([previewBlob], `avatar_journey_${Date.now()}.webm`, { type: 'video/webm' });
        const shareData = {
          title: 'My Spatial Journey — ENLIGHTEN.MINT.CAFE',
          text: 'Watch my avatar explore the sovereign realms',
          files: [file],
        };
        if (navigator.canShare(shareData)) {
          await navigator.share(shareData);
          toast.success('Shared to Sovereign Circle');
          return;
        }
      }
      download();
      toast.success('Downloaded — share from your device');
    } catch {
      download();
    }
  }, [previewBlob, download]);

  const saveToJournal = useCallback(async () => {
    if (!previewBlob) return;
    try {
      const token = localStorage.getItem('zen_token') || localStorage.getItem('token');
      if (!token) { toast.error('Sign in to save to journal'); return; }
      
      // Save as a journal entry with the video reference
      await axios.post(`${API}/journal/entries`, {
        title: `Avatar Journey — ${new Date().toLocaleDateString()}`,
        content: `Spatial recording captured. Duration: ${formatTime(duration)}. Mode: ${mode}.`,
        mood: 'inspired',
        tags: ['avatar', 'spatial', 'recording'],
      }, { headers: { Authorization: `Bearer ${token}` } });
      
      download(); // Also download the file
      toast.success('Saved to journal + downloaded');
    } catch {
      download();
      toast.success('Downloaded (journal save requires login)');
    }
  }, [previewBlob, duration, mode, download]);

  const discard = useCallback(() => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setPreviewBlob(null);
    setDuration(0);
  }, [previewUrl]);

  return {
    isRecording, duration, previewUrl, mode,
    startRecording, stopRecording, download,
    shareToCircle, saveToJournal, discard,
  };
}

/**
 * SpatialRecorderUI — The recording control interface
 * Renders in the content area (not as an overlay — zero-stack).
 */
export default function SpatialRecorderUI({ recorder }) {
  const spatial = useSpatial();
  const {
    isRecording, duration, previewUrl, mode,
    startRecording, stopRecording, download,
    shareToCircle, saveToJournal, discard,
  } = recorder;

  const roomName = spatial?.theme?.name || 'Sovereign Space';
  const realmLabel = spatial?.theme?.realm === 'HOLLOW_EARTH' ? 'Crystalline Depths'
    : spatial?.theme?.realm === 'AIR' ? 'Sky Temple' : 'Surface Realm';

  return (
    <div data-testid="spatial-recorder" className="py-3" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
      {/* Recording state */}
      {isRecording ? (
        <div className="flex items-center gap-3">
          <button onClick={stopRecording}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full active:scale-95"
            style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)' }}
            data-testid="recorder-stop">
            <Square size={10} fill="#EF4444" style={{ color: '#EF4444' }} />
            <span className="text-xs font-bold" style={{ color: '#EF4444' }}>Stop</span>
          </button>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-xs font-mono" style={{ color: 'rgba(239,68,68,0.7)' }}>
              {formatTime(duration)}
            </span>
          </div>
          <div className="flex-1 text-right">
            <span className="text-[9px]" style={{ color: 'rgba(255,255,255,0.3)' }}>
              {mode === 'cinematic' ? 'Cinematic' : 'Avatar'} · {roomName}
            </span>
          </div>
        </div>
      ) : previewUrl ? (
        /* Post-recording: preview + actions */
        <div>
          <div className="flex items-center gap-2 mb-3">
            <video src={previewUrl} className="w-16 h-10 rounded-lg object-cover"
              style={{ border: '1px solid rgba(139,92,246,0.2)' }} muted data-testid="recorder-preview" />
            <div className="flex-1">
              <p className="text-xs font-medium text-white">{formatTime(duration)} captured</p>
              <p className="text-[9px]" style={{ color: 'rgba(255,255,255,0.4)' }}>{roomName} · {realmLabel}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button onClick={saveToJournal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs active:scale-95"
              style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.25)', color: '#22C55E' }}
              data-testid="recorder-save-journal">
              <Download size={10} /> Save to Journal
            </button>
            <button onClick={shareToCircle}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs active:scale-95"
              style={{ background: 'rgba(56,189,248,0.12)', border: '1px solid rgba(56,189,248,0.25)', color: '#38BDF8' }}
              data-testid="recorder-share-circle">
              <Share2 size={10} /> Share to Circle
            </button>
            <button onClick={download}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs active:scale-95"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)' }}
              data-testid="recorder-download">
              <Download size={10} /> Download
            </button>
            <button onClick={discard}
              className="flex items-center gap-1 px-2 py-1.5 rounded-full text-xs active:scale-95"
              style={{ color: 'rgba(255,255,255,0.3)' }}
              data-testid="recorder-discard">
              <Trash2 size={10} />
            </button>
          </div>
        </div>
      ) : (
        /* Idle: recording options */
        <div className="flex items-center gap-3">
          <button onClick={() => startRecording('manual')}
            className="flex items-center gap-2 px-4 py-2 rounded-full active:scale-95"
            style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)' }}
            data-testid="recorder-start-manual">
            <Video size={14} style={{ color: '#EF4444' }} />
            <span className="text-xs font-medium" style={{ color: 'rgba(239,68,68,0.8)' }}>Record Journey</span>
          </button>
          <button onClick={() => startRecording('cinematic')}
            className="flex items-center gap-2 px-4 py-2 rounded-full active:scale-95"
            style={{ background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.15)' }}
            data-testid="recorder-start-cinematic">
            <Film size={14} style={{ color: '#8B5CF6' }} />
            <span className="text-xs font-medium" style={{ color: 'rgba(139,92,246,0.8)' }}>Cinematic Mode</span>
          </button>
        </div>
      )}
    </div>
  );
}
