import React, { createContext, useContext, useState, useRef, useCallback, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const VoiceCommandContext = createContext(null);

export function VoiceCommandProvider({ children }) {
  const { user } = useAuth();
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [wakeWordEnabled, setWakeWordEnabled] = useState(false);
  const [lastCommand, setLastCommand] = useState(null);
  const [lastResponse, setLastResponse] = useState(null);
  const [commandHistory, setCommandHistory] = useState([]);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const streamRef = useRef(null);
  const recognitionRef = useRef(null);
  const authHeaders = user ? { Authorization: `Bearer ${localStorage.getItem('zen_token')}` } : {};

  // Wake word detection using Web Speech API
  const startWakeWordDetection = useCallback(() => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript.toLowerCase().trim();
        if (transcript.includes('hey cosmos') || transcript.includes('hey cosmic') || transcript.includes('a cosmos')) {
          recognition.stop();
          setWakeWordEnabled(true);
          startRecording();
          break;
        }
      }
    };

    recognition.onerror = () => {
      setTimeout(() => {
        if (wakeWordEnabled) {
          try { recognition.start(); } catch {}
        }
      }, 1000);
    };

    recognition.onend = () => {
      if (wakeWordEnabled && !isRecording) {
        try { recognition.start(); } catch {}
      }
    };

    recognitionRef.current = recognition;
    try { recognition.start(); setIsListening(true); } catch {}
  }, [wakeWordEnabled, isRecording]);

  const stopWakeWordDetection = useCallback(() => {
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch {}
      recognitionRef.current = null;
    }
    setIsListening(false);
  }, []);

  const toggleWakeWord = useCallback(() => {
    if (wakeWordEnabled) {
      setWakeWordEnabled(false);
      stopWakeWordDetection();
    } else {
      setWakeWordEnabled(true);
      startWakeWordDetection();
    }
  }, [wakeWordEnabled, startWakeWordDetection, stopWakeWordDetection]);

  // Re-start wake word when enabled changes
  useEffect(() => {
    if (wakeWordEnabled && !isRecording) {
      startWakeWordDetection();
    }
    return () => { if (!wakeWordEnabled) stopWakeWordDetection(); };
  }, [wakeWordEnabled]);

  // Hold-to-talk recording
  const startRecording = useCallback(async () => {
    if (isRecording || isProcessing) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        stream.getTracks().forEach(t => t.stop());
        streamRef.current = null;
        await processVoiceCommand(audioBlob);
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Mic access denied:', err);
    }
  }, [isRecording, isProcessing]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  }, []);

  // Process voice command
  const processVoiceCommand = useCallback(async (audioBlob) => {
    setIsProcessing(true);
    try {
      // Convert blob to base64
      const reader = new FileReader();
      const base64 = await new Promise((resolve, reject) => {
        reader.onloadend = () => resolve(reader.result.split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(audioBlob);
      });

      const res = await axios.post(`${API}/voice/command`, {
        audio_base64: base64,
        context: 'full_app',
      }, { headers: authHeaders });

      const result = res.data;
      setLastCommand(result.transcript);
      setLastResponse(result);
      setCommandHistory(prev => [...prev.slice(-9), {
        transcript: result.transcript,
        intent: result.intent,
        response: result.response_text,
        timestamp: Date.now(),
      }]);

      // Speak the response if there is one
      if (result.response_audio) {
        const audio = new Audio(`data:audio/mp3;base64,${result.response_audio}`);
        audio.volume = 0.8;
        audio.play().catch(() => {});
      }

      return result;
    } catch (err) {
      console.error('Voice command error:', err);
      setLastResponse({ error: true, response_text: 'Could not process voice command' });
      return null;
    } finally {
      setIsProcessing(false);
      // Resume wake word if enabled
      if (wakeWordEnabled) {
        setTimeout(() => startWakeWordDetection(), 500);
      }
    }
  }, [authHeaders, wakeWordEnabled, startWakeWordDetection]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopWakeWordDetection();
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    };
  }, []);

  const contextValue = useMemo(() => ({
    isListening, isRecording, isProcessing,
    wakeWordEnabled, toggleWakeWord,
    startRecording, stopRecording,
    lastCommand, lastResponse, commandHistory,
  }), [
    isListening, isRecording, isProcessing, wakeWordEnabled, toggleWakeWord,
    startRecording, stopRecording, lastCommand, lastResponse, commandHistory
  ]);

  return (
    <VoiceCommandContext.Provider value={contextValue}>
      {children}
    </VoiceCommandContext.Provider>
  );
}

export function useVoiceCommand() {
  const ctx = useContext(VoiceCommandContext);
  if (!ctx) return {
    isListening: false, isRecording: false, isProcessing: false,
    wakeWordEnabled: false, toggleWakeWord: () => {},
    startRecording: () => {}, stopRecording: () => {},
    lastCommand: null, lastResponse: null, commandHistory: [],
  };
  return ctx;
}
