import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { Play, X, Loader2, Sparkles, Volume2, VolumeX } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function IntroVideo() {
  const [videoUrl, setVideoUrl] = useState(null);
  const [status, setStatus] = useState('checking'); // checking, not_generated, generating, ready
  const [isOpen, setIsOpen] = useState(false);
  const [muted, setMuted] = useState(true);
  const videoRef = useRef(null);
  const pollRef = useRef(null);

  useEffect(() => {
    checkVideo();
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, []);

  const checkVideo = async () => {
    try {
      const res = await axios.get(`${API}/ai-visuals/intro-video`);
      if (res.data.status === 'ready') {
        setVideoUrl(res.data.video_url);
        setStatus('ready');
      } else if (res.data.status === 'generating' || res.data.status === 'queued') {
        setStatus('generating');
        startPolling(res.data.job_id);
      } else {
        setStatus('not_generated');
      }
    } catch {
      setStatus('not_generated');
    }
  };

  const startPolling = (jobId) => {
    if (!jobId) return;
    pollRef.current = setInterval(async () => {
      try {
        const res = await axios.get(`${API}/ai-visuals/intro-video`);
        if (res.data.status === 'ready') {
          setVideoUrl(res.data.video_url);
          setStatus('ready');
          clearInterval(pollRef.current);
        }
      } catch {}
    }, 10000);
  };

  const openPlayer = () => {
    if (videoUrl) {
      setIsOpen(true);
    }
  };

  const toggleMute = (e) => {
    e.stopPropagation();
    e.preventDefault();
    if (videoRef.current) {
      const next = !muted;
      videoRef.current.muted = next;
      setMuted(next);
      // If unmuting, ensure video is still playing (some browsers pause on unmute)
      if (!next && videoRef.current.paused) {
        videoRef.current.play().catch(() => {});
      }
    }
  };

  const handleVideoReady = () => {
    if (videoRef.current && isOpen) {
      // Force muted property on DOM node (React muted prop is unreliable)
      videoRef.current.muted = muted;
      videoRef.current.play().catch(() => {});
    }
  };

  const closePlayer = () => {
    setIsOpen(false);
    if (videoRef.current) videoRef.current.pause();
  };

  // Don't render anything if no video available
  if (status === 'checking' || status === 'not_generated') return null;

  return (
    <>
      {/* Teaser Button */}
      <motion.button
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        onClick={openPlayer}
        disabled={status !== 'ready'}
        data-testid="intro-video-btn"
        className="group flex items-center gap-3 rounded-2xl px-5 py-3 transition-all hover:scale-[1.02]"
        style={{
          background: 'linear-gradient(135deg, rgba(216,180,254,0.08), rgba(129,140,248,0.06))',
          border: '1px solid rgba(216,180,254,0.15)',
          backdropFilter: 'blur(12px)',
        }}>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{
            background: 'rgba(216,180,254,0.12)',
            boxShadow: '0 0 20px rgba(216,180,254,0.1)',
          }}>
          {status === 'generating' ? (
            <Loader2 size={16} className="animate-spin" style={{ color: '#D8B4FE' }} />
          ) : (
            <Play size={16} style={{ color: '#D8B4FE' }} />
          )}
        </div>
        <div className="text-left">
          <p className="text-xs font-medium" style={{ color: '#F8FAFC' }}>
            {status === 'generating' ? 'Creating Cosmic Vision...' : 'Watch the Cosmic Journey'}
          </p>
          <p className="text-[10px]" style={{ color: 'rgba(248,250,252,0.4)' }}>
            {status === 'generating' ? 'AI is crafting your video' : 'Cinematic intro powered by Sora 2'}
          </p>
        </div>
      </motion.button>

      {/* Fullscreen Player — portaled to body to escape transform parents */}
      {createPortal(
        <AnimatePresence>
          {isOpen && videoUrl && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-[9998] flex items-center justify-center"
              style={{ background: 'rgba(3,4,10,0.95)', backdropFilter: 'blur(24px)' }}
              onClick={closePlayer}
              data-testid="intro-video-player">
              <div onClick={e => e.stopPropagation()} className="relative w-full max-w-4xl mx-4">
                {/* Close */}
                <button onClick={closePlayer} data-testid="intro-video-close"
                  className="absolute -top-12 right-0 p-2 rounded-xl transition-all hover:bg-white/5 z-10"
                  style={{ color: 'rgba(248,250,252,0.5)' }}>
                  <X size={20} />
                </button>

                {/* Video */}
                <div className="rounded-2xl overflow-hidden relative" style={{ border: '1px solid rgba(216,180,254,0.1)' }}>
                  <video ref={(el) => {
                      videoRef.current = el;
                      // Imperatively set muted on DOM node — React muted prop is unreliable
                      if (el) el.muted = muted;
                    }}
                    src={`${process.env.REACT_APP_BACKEND_URL}${videoUrl}`}
                    loop
                    playsInline
                    autoPlay
                    onCanPlay={handleVideoReady}
                    onError={() => {}}
                    className="w-full"
                    style={{ maxHeight: '70vh' }}
                    data-testid="intro-video-element" />

                  {/* Mute toggle */}
                  <button onClick={toggleMute}
                    onTouchEnd={(e) => { e.preventDefault(); toggleMute(e); }}
                    data-testid="intro-video-mute-toggle"
                    className="absolute bottom-4 right-4 p-3 rounded-xl transition-all hover:scale-110 active:scale-95"
                    style={{
                      background: 'rgba(0,0,0,0.7)',
                      backdropFilter: 'blur(8px)',
                      border: '1px solid rgba(255,255,255,0.12)',
                      touchAction: 'manipulation',
                      zIndex: 30,
                      pointerEvents: 'auto',
                      position: 'absolute',
                    }}>
                    {muted ? <VolumeX size={18} style={{ color: '#F8FAFC' }} /> : <Volume2 size={18} style={{ color: '#D8B4FE' }} />}
                  </button>

                  {/* Title overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-6"
                    style={{ background: 'linear-gradient(transparent, rgba(3,4,10,0.8))', pointerEvents: 'none' }}>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-1" style={{ color: '#D8B4FE' }}>
                      The Cosmic Collective
                    </p>
                    <p className="text-xs" style={{ color: 'rgba(248,250,252,0.5)' }}>
                      A cinematic vision powered by Sora 2 AI
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}
