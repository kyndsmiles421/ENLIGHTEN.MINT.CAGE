/**
 * useResonanceCapture.js — Resonance Camera Capture Pipeline
 * 
 * Records the ParticleField canvas visuals + MixerContext audio output
 * into a single WebM file. Uses canvas.captureStream() for video and
 * MediaStreamAudioDestinationNode for audio, muxed via MediaRecorder.
 * 
 * Pipeline:
 *   Canvas → captureStream(30fps) → videoTrack ─┐
 *                                                 ├→ MediaRecorder → WebM/VP9+Opus
 *   AudioContext → MediaStreamDestination → audioTrack ─┘
 * 
 * Usage:
 *   const capture = useResonanceCapture(particleFieldRef, audioMixerCtxRef, audioMixerMasterGainRef);
 *   capture.start();  // begin recording
 *   capture.stop();   // finish → previewUrl available
 */
import { useState, useCallback, useRef } from 'react';
import { toast } from 'sonner';

export function useResonanceCapture(canvasComponentRef, audioCtxRef, masterGainRef) {
  const [isCapturing, setIsCapturing] = useState(false);
  const [duration, setDuration] = useState(0);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [previewBlob, setPreviewBlob] = useState(null);
  const recorderRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);
  const audioDestRef = useRef(null);
  const startTimeRef = useRef(0);

  const start = useCallback(() => {
    // Get canvas element from ParticleField ref
    const canvas = canvasComponentRef?.current?.getCanvas?.();
    if (!canvas) {
      toast.error('Open the Orbit panel to use Resonance Camera');
      return;
    }

    // Clean up previous recording
    if (previewUrl) { URL.revokeObjectURL(previewUrl); setPreviewUrl(null); }
    setPreviewBlob(null);
    chunksRef.current = [];

    try {
      // Video track from canvas at 30fps
      const canvasStream = canvas.captureStream(30);
      const videoTrack = canvasStream.getVideoTracks()[0];

      // Audio track from MixerContext's audio pipeline
      const audioCtx = audioCtxRef?.current;
      const masterGain = masterGainRef?.current;
      let audioTrack = null;

      if (audioCtx && masterGain && audioCtx.state === 'running') {
        // Create a MediaStreamDestination node and connect masterGain to it
        const dest = audioCtx.createMediaStreamDestination();
        masterGain.connect(dest);
        audioDestRef.current = dest;
        audioTrack = dest.stream.getAudioTracks()[0];
      }

      // Mux video + audio into one stream
      const tracks = [videoTrack];
      if (audioTrack) tracks.push(audioTrack);
      const muxedStream = new MediaStream(tracks);

      // Choose codec: VP9 for quality, VP8 as fallback
      const mimeOptions = [
        'video/webm;codecs=vp9,opus',
        'video/webm;codecs=vp8,opus',
        'video/webm',
      ];
      const mimeType = mimeOptions.find(m => MediaRecorder.isTypeSupported(m)) || '';

      const recorder = new MediaRecorder(muxedStream, {
        mimeType,
        videoBitsPerSecond: 2_500_000, // 2.5 Mbps for crisp particle trails
      });

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        // Disconnect the audio destination node
        if (audioDestRef.current && masterGain) {
          try { masterGain.disconnect(audioDestRef.current); } catch (e) { if (process.env.NODE_ENV !== 'production') console.warn(e); }
          audioDestRef.current = null;
        }

        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        setPreviewUrl(url);
        setPreviewBlob(blob);
        setIsCapturing(false);
        clearInterval(timerRef.current);

        const sizeMB = (blob.size / (1024 * 1024)).toFixed(1);
        toast.success(`Resonance captured (${sizeMB}MB)`);
      };

      recorderRef.current = recorder;
      recorder.start(500); // collect chunks every 500ms
      setIsCapturing(true);
      startTimeRef.current = Date.now();
      setDuration(0);

      // Duration timer
      timerRef.current = setInterval(() => {
        setDuration(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }, 1000);

      toast.success('Resonance Camera recording...');
    } catch (e) {
      toast.error(`Capture failed: ${e.message}`);
    }
  }, [canvasComponentRef, audioCtxRef, masterGainRef, previewUrl]);

  const stop = useCallback(() => {
    if (recorderRef.current && recorderRef.current.state !== 'inactive') {
      recorderRef.current.stop();
    }
    clearInterval(timerRef.current);
  }, []);

  const download = useCallback(() => {
    if (!previewUrl) return;
    const a = document.createElement('a');
    a.href = previewUrl;
    a.download = `resonance_${Date.now()}.webm`;
    a.click();
  }, [previewUrl]);

  const share = useCallback(async () => {
    if (!previewBlob) return;
    try {
      if (navigator.share && navigator.canShare) {
        const file = new File([previewBlob], `resonance_${Date.now()}.webm`, { type: 'video/webm' });
        const shareData = {
          title: 'My Resonance — ENLIGHTEN.MINT.CAFE',
          text: 'Watch my frequency signature come alive',
          files: [file],
        };
        if (navigator.canShare(shareData)) {
          await navigator.share(shareData);
          return;
        }
      }
      // Fallback: copy link
      download();
      toast.success('Downloaded — share from your device');
    } catch {
      download();
    }
  }, [previewBlob, download]);

  const discard = useCallback(() => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setPreviewBlob(null);
    setDuration(0);
  }, [previewUrl]);

  return { start, stop, download, share, discard, isCapturing, duration, previewUrl };
}
