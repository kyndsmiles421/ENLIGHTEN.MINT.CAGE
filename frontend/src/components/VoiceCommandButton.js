import React, { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Radio, X, Volume2, Loader2, Navigation2, MessageCircle } from 'lucide-react';
import { useVoiceCommand } from '../context/VoiceCommandContext';
import { useNavigate } from 'react-router-dom';
import { useTempo } from '../context/TempoContext';
import { useAuth } from '../context/AuthContext';

const INTENT_ICONS = {
  mixer_play: Volume2,
  mixer_stop: MicOff,
  mixer_volume: Volume2,
  mixer_tempo: Radio,
  navigate: Navigation2,
  sage_query: MessageCircle,
};

export default function VoiceCommandButton() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { setBpm, stopTempo } = useTempo();
  const {
    isListening, isRecording, isProcessing,
    wakeWordEnabled, toggleWakeWord,
    startRecording, stopRecording,
    lastResponse, commandHistory,
  } = useVoiceCommand();

  const [showPanel, setShowPanel] = useState(false);
  const [holdActive, setHoldActive] = useState(false);
  const holdTimeoutRef = useRef(null);

  // Execute the parsed intent
  const executeIntent = useCallback((response) => {
    if (!response || response.error) return;
    const { intent, params } = response;

    switch (intent) {
      case 'navigate':
        if (params?.destination) {
          const dest = params.destination.startsWith('/') ? params.destination : `/${params.destination}`;
          navigate(dest);
        }
        break;
      case 'mixer_tempo':
        if (params?.action === 'stop') {
          stopTempo();
        } else if (params?.value) {
          setBpm(Number(params.value));
        }
        break;
      case 'mixer_play':
      case 'mixer_stop':
      case 'mixer_volume':
      case 'mixer_multi':
        window.dispatchEvent(new CustomEvent('cosmic-voice-command', { detail: response }));
        break;
      default:
        break;
    }
  }, [navigate, setBpm, stopTempo]);

  // Auto-execute when response comes in
  useEffect(() => {
    if (lastResponse && !lastResponse.error) {
      executeIntent(lastResponse);
    }
  }, [lastResponse, executeIntent]);

  // Hold-to-talk handlers
  const handlePointerDown = useCallback((e) => {
    e.preventDefault();
    setHoldActive(true);
    holdTimeoutRef.current = setTimeout(() => {
      startRecording();
    }, 150);
  }, [startRecording]);

  const handlePointerUp = useCallback((e) => {
    e.preventDefault();
    setHoldActive(false);
    if (holdTimeoutRef.current) clearTimeout(holdTimeoutRef.current);
    if (isRecording) stopRecording();
  }, [isRecording, stopRecording]);

  if (!user) return null;

  const IntentIcon = lastResponse?.intent ? INTENT_ICONS[lastResponse.intent] || MessageCircle : MessageCircle;

  return (
    <>
      {/* Floating Voice Button */}
      <motion.div
        className="fixed z-50"
        style={{ bottom: 90, left: 20 }}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 300 }}
        data-testid="voice-command-container"
      >
        {/* Main mic button — hold to talk */}
        <motion.button
          className="relative flex items-center justify-center rounded-full shadow-lg"
          style={{
            width: 48, height: 48,
            background: isRecording
              ? 'linear-gradient(135deg, rgba(239,68,68,0.9), rgba(220,38,38,0.9))'
              : isProcessing
                ? 'linear-gradient(135deg, rgba(168,85,247,0.9), rgba(139,92,246,0.9))'
                : holdActive
                  ? 'linear-gradient(135deg, rgba(59,130,246,0.9), rgba(37,99,235,0.9))'
                  : 'rgba(10,10,18,0.85)',
            border: `1.5px solid ${isRecording ? 'rgba(239,68,68,0.4)' : isProcessing ? 'rgba(168,85,247,0.3)' : 'rgba(192,132,252,0.15)'}`,
            backdropFilter: 'blur(20px)',
            cursor: 'pointer',
          }}
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          whileTap={{ scale: 0.9 }}
          data-testid="voice-command-btn"
        >
          {isProcessing ? (
            <Loader2 size={20} className="animate-spin" style={{ color: '#E9D5FF' }} />
          ) : isRecording ? (
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 0.8 }}
            >
              <Mic size={20} style={{ color: '#FCA5A5' }} />
            </motion.div>
          ) : (
            <Mic size={20} style={{ color: 'rgba(192,132,252,0.7)' }} />
          )}

          {/* Recording pulse ring */}
          {isRecording && (
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{ border: '2px solid rgba(239,68,68,0.4)' }}
              animate={{ scale: [1, 1.5, 1], opacity: [0.6, 0, 0.6] }}
              transition={{ repeat: Infinity, duration: 1.2 }}
            />
          )}

          {/* Wake word indicator */}
          {wakeWordEnabled && !isRecording && (
            <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full" style={{ background: '#22C55E', border: '2px solid rgba(10,10,18,0.9)' }} />
          )}
        </motion.button>

        {/* Quick controls row */}
        <div className="flex items-center gap-1.5 mt-2">
          {/* Wake word toggle */}
          <motion.button
            onClick={toggleWakeWord}
            className="flex items-center justify-center rounded-full"
            style={{
              width: 28, height: 28,
              background: wakeWordEnabled ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.03)',
              border: `1px solid ${wakeWordEnabled ? 'rgba(34,197,94,0.3)' : 'rgba(255,255,255,0.06)'}`,
            }}
            whileTap={{ scale: 0.9 }}
            data-testid="wake-word-toggle"
            title={wakeWordEnabled ? '"Hey Cosmos" active' : 'Enable "Hey Cosmos"'}
          >
            <Radio size={12} style={{ color: wakeWordEnabled ? '#22C55E' : 'rgba(255,255,255,0.3)' }} />
          </motion.button>

          {/* Toggle history panel */}
          <motion.button
            onClick={() => setShowPanel(p => !p)}
            className="flex items-center justify-center rounded-full"
            style={{
              width: 28, height: 28,
              background: showPanel ? 'rgba(192,132,252,0.15)' : 'rgba(255,255,255,0.03)',
              border: `1px solid ${showPanel ? 'rgba(192,132,252,0.3)' : 'rgba(255,255,255,0.06)'}`,
            }}
            whileTap={{ scale: 0.9 }}
            data-testid="voice-history-toggle"
          >
            <MessageCircle size={12} style={{ color: showPanel ? '#C084FC' : 'rgba(255,255,255,0.3)' }} />
          </motion.button>
        </div>
      </motion.div>

      {/* Response toast */}
      <AnimatePresence>
        {lastResponse && !lastResponse.error && !showPanel && (
          <motion.div
            key="voice-toast"
            initial={{ opacity: 0, y: 20, x: -50 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="fixed z-50 rounded-2xl shadow-xl"
            style={{
              bottom: 155, left: 20, maxWidth: 280,
              background: 'rgba(10,10,18,0.92)',
              border: '1px solid rgba(192,132,252,0.15)',
              backdropFilter: 'blur(24px)',
              padding: '10px 14px',
            }}
            data-testid="voice-response-toast"
          >
            <div className="flex items-start gap-2">
              <IntentIcon size={14} style={{ color: '#C084FC', marginTop: 2, flexShrink: 0 }} />
              <div>
                {lastResponse.transcript && (
                  <p className="text-[10px] mb-1" style={{ color: 'rgba(255,255,255,0.35)' }}>
                    "{lastResponse.transcript}"
                  </p>
                )}
                <p className="text-xs" style={{ color: 'rgba(248,250,252,0.85)' }}>
                  {lastResponse.response_text}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* History Panel */}
      <AnimatePresence>
        {showPanel && (
          <motion.div
            key="voice-panel"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="fixed z-50 rounded-2xl shadow-xl overflow-hidden"
            style={{
              bottom: 155, left: 20, width: 300, maxHeight: 360,
              background: 'rgba(10,10,18,0.95)',
              border: '1px solid rgba(192,132,252,0.12)',
              backdropFilter: 'blur(28px)',
            }}
            data-testid="voice-history-panel"
          >
            <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <div className="flex items-center gap-2">
                <Mic size={14} style={{ color: '#C084FC' }} />
                <span className="text-xs font-medium" style={{ color: 'rgba(248,250,252,0.8)' }}>Voice Commands</span>
              </div>
              <button onClick={() => setShowPanel(false)} data-testid="close-voice-panel">
                <X size={14} style={{ color: 'rgba(255,255,255,0.3)' }} />
              </button>
            </div>

            <div className="px-4 py-3 space-y-1" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.4)' }}>Hold mic button to speak, or say "Hey Cosmos"</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {['Play ocean', 'Add 528 Hz', 'Set tempo 60', 'Stop all', 'Go to star chart'].map(cmd => (
                  <span key={cmd} className="text-[9px] px-2 py-0.5 rounded-full" style={{ background: 'rgba(192,132,252,0.08)', color: 'rgba(192,132,252,0.5)', border: '1px solid rgba(192,132,252,0.1)' }}>
                    "{cmd}"
                  </span>
                ))}
              </div>
            </div>

            <div className="overflow-y-auto px-4 py-2 space-y-2" style={{ maxHeight: 220, scrollbarWidth: 'thin' }}>
              {commandHistory.length === 0 ? (
                <p className="text-[10px] text-center py-4" style={{ color: 'rgba(255,255,255,0.2)' }}>
                  No commands yet. Hold the mic and speak.
                </p>
              ) : (
                [...commandHistory].reverse().map((cmd, i) => {
                  const CmdIcon = INTENT_ICONS[cmd.intent] || MessageCircle;
                  return (
                    <div key={i} className="rounded-xl px-3 py-2" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
                      <div className="flex items-center gap-1.5 mb-1">
                        <CmdIcon size={10} style={{ color: '#C084FC' }} />
                        <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.35)' }}>
                          "{cmd.transcript}"
                        </span>
                      </div>
                      <p className="text-[11px]" style={{ color: 'rgba(248,250,252,0.75)' }}>{cmd.response}</p>
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
