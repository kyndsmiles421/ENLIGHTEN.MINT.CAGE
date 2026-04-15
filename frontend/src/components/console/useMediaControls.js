/**
 * useMediaControls.js — Media recorder hook
 * Extracted from UnifiedCreatorConsole.js
 * Handles video, audio, and screen recording with toggle-based controls.
 */
import { useState, useCallback, useRef } from 'react';
import { toast } from 'sonner';

export function useMediaControls() {
  const [isRecVideo, setRecVideo] = useState(false);
  const [isRecAudio, setRecAudio] = useState(false);
  const [isRecScreen, setRecScreen] = useState(false);
  const recorderRef = useRef(null);
  const streamRef = useRef(null);
  const chunksRef = useRef([]);

  const stopAll = useCallback(() => {
    if (recorderRef.current && recorderRef.current.state !== 'inactive') recorderRef.current.stop();
    if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    streamRef.current = null; recorderRef.current = null;
    setRecVideo(false); setRecAudio(false); setRecScreen(false);
  }, []);

  const startRecording = useCallback(async (type) => {
    try {
      stopAll();
      let stream;
      if (type === 'screen') stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
      else if (type === 'video') stream = await navigator.mediaDevices.getUserMedia({ video: { width: { ideal: 640 }, height: { ideal: 480 }, frameRate: { ideal: 24 } }, audio: true });
      else stream = await navigator.mediaDevices.getUserMedia({ audio: { sampleRate: { ideal: 44100 }, echoCancellation: true, noiseSuppression: true } });
      streamRef.current = stream; chunksRef.current = [];
      const mimeType = type === 'audio' ? 'audio/webm;codecs=opus' : 'video/webm;codecs=vp9,opus';
      const recorder = new MediaRecorder(stream, { mimeType: MediaRecorder.isTypeSupported(mimeType) ? mimeType : undefined });
      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      recorder.onstop = () => {
        stream.getTracks().forEach(t => t.stop());
        const blob = new Blob(chunksRef.current, { type: type === 'audio' ? 'audio/webm' : 'video/webm' });
        const url = URL.createObjectURL(blob); const a = document.createElement('a');
        a.href = url; a.download = `enlighten_${type}_${Date.now()}.webm`; a.click();
        URL.revokeObjectURL(url);
        toast.success(`${type} saved (${(blob.size / 1024).toFixed(0)}KB)`);
        setRecVideo(false); setRecAudio(false); setRecScreen(false);
      };
      recorderRef.current = recorder; recorder.start(1000);
      if (type === 'video') setRecVideo(true); else if (type === 'audio') setRecAudio(true); else setRecScreen(true);
      toast.success(`${type} recording started`);
    } catch (e) { toast.error(`Permission denied: ${e.message}`); }
  }, [stopAll]);

  return { isRecVideo, isRecAudio, isRecScreen, startRecording, stopAll, isRecording: isRecVideo || isRecAudio || isRecScreen };
}
