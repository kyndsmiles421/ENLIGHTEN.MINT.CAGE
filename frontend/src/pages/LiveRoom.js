import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useAvatar } from '../context/AvatarContext';
import {
  ArrowLeft, Send, Users, Radio, Crown, Timer, Heart, Sparkles,
  MessageCircle, X, Play, Square, Volume2, VolumeX, Smile,
  Hand, Star, Flame, Moon, Sun, Zap, Wind, ChevronUp, ChevronDown,
  Mic, MicOff, Video, VideoOff, Settings, Monitor, UserCheck, Layers
} from 'lucide-react';
import { useVirtualBackground } from '../hooks/useVirtualBackground';
import BackgroundPicker from '../components/BackgroundPicker';
import FractalVisualizer from '../components/FractalVisualizer';
import { LIGHT_MODES, VIDEO_OVERLAYS, FRACTAL_TYPES, VISUAL_FILTERS } from '../components/VisualLayersMixer';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const WS_URL = `${process.env.REACT_APP_BACKEND_URL.replace('https://', 'wss://').replace('http://', 'ws://')}/api/live/ws`;

const RTC_CONFIG = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
};

const HOST_COMMANDS = [
  { id: 'begin', label: 'Begin Practice', icon: Play, color: '#22C55E' },
  { id: 'breathe_in', label: 'Breathe In', icon: Sparkles, color: '#C084FC' },
  { id: 'breathe_out', label: 'Breathe Out', icon: Wind, color: '#2DD4BF' },
  { id: 'hold', label: 'Hold', icon: Timer, color: '#F59E0B' },
  { id: 'focus', label: 'Focus', icon: Star, color: '#3B82F6' },
  { id: 'release', label: 'Release & Let Go', icon: Moon, color: '#8B5CF6' },
  { id: 'om', label: 'Om', icon: Sun, color: '#F97316' },
  { id: 'end_practice', label: 'End Practice', icon: Square, color: '#EF4444' },
];

const REACTIONS = [
  { emoji: '\u{1F64F}', label: 'Namaste' },
  { emoji: '\u2728', label: 'Sparkles' },
  { emoji: '\u{1F49C}', label: 'Love' },
  { emoji: '\u{1F525}', label: 'Fire' },
  { emoji: '\u{1F44B}', label: 'Wave' },
  { emoji: '\u{1F31F}', label: 'Star' },
  { emoji: '\u{1F31C}', label: 'Moon' },
  { emoji: '\u{1F9D8}', label: 'Meditate' },
];

const VIDEO_MODES = {
  everyone: { label: 'Everyone', icon: Users, desc: 'All participants can share video' },
  host_only: { label: 'Host Only', icon: Crown, desc: 'Only host can share video' },
  off: { label: 'Video Off', icon: VideoOff, desc: 'No video in this session' },
};

export default function LiveRoom() {
  useEffect(() => { if (typeof window.__workAccrue === 'function') window.__workAccrue('live_session', 8); }, []);

  const { sessionId } = useParams();
  const { user, authHeaders } = useAuth();
  const { avatarB64 } = useAvatar();
  const navigate = useNavigate();

  const [session, setSession] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [messages, setMessages] = useState([]);
  const [connected, setConnected] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [showChat, setShowChat] = useState(true);
  const [showReactions, setShowReactions] = useState(false);
  const [floatingReactions, setFloatingReactions] = useState([]);
  const [hostCommand, setHostCommand] = useState(null);
  const [liveMixerState, setLiveMixerState] = useState(null); // Received from host's mixer_sync
  const [showLiveMixer, setShowLiveMixer] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [showParticipants, setShowParticipants] = useState(true);

  // Audio recording
  const wsRef = useRef(null);
  const chatEndRef = useRef(null);
  const reconnectRef = useRef(null);
  const timerRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingStatus, setRecordingStatus] = useState('');

  // Video / WebRTC
  const localVideoRef = useRef(null);
  const localStreamRef = useRef(null);
  const peerConnectionsRef = useRef({}); // { peerId: RTCPeerConnection }
  const [isVideoOn, setIsVideoOn] = useState(false);
  const [isMicOn, setIsMicOn] = useState(false);
  const [videoMode, setVideoMode] = useState('everyone');
  const [remoteStreams, setRemoteStreams] = useState({}); // { peerId: MediaStream }
  const [cameraStates, setCameraStates] = useState({}); // { peerId: boolean }
  const [showVideoSettings, setShowVideoSettings] = useState(false);

  // Screen sharing
  const screenStreamRef = useRef(null);
  const screenPeersRef = useRef({});
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [screenSharer, setScreenSharer] = useState(null); // user_id of person sharing
  const [remoteScreenStream, setRemoteScreenStream] = useState(null);

  // Virtual background
  const virtualBg = useVirtualBackground();
  const [showBgPicker, setShowBgPicker] = useState(false);
  const hiddenVideoRef = useRef(null);

  const isHost = session?.host_id === user?.id;

  // Whether current user can share video
  const canShareVideo = videoMode === 'everyone' || (videoMode === 'host_only' && isHost);

  // Load session
  useEffect(() => {
    if (!user) { navigate('/auth'); return; }
    axios.get(`${API}/live/sessions/${sessionId}`, { headers: authHeaders })
      .then(r => {
        setSession(r.data);
        const existing = r.data.participants || [];
        if (!existing.find(p => p.user_id === user.id)) {
          setParticipants([...existing, { user_id: user.id, name: user.name || 'You', avatar: '' }]);
        } else {
          setParticipants(existing);
        }
      })
      .catch(() => navigate('/live'));
  }, [sessionId, user, authHeaders, navigate]);

  // WebSocket
  const connectWS = useCallback(() => {
    if (!user || !sessionId) return;
    const token = localStorage.getItem('token');
    if (!token) return;
    const ws = new WebSocket(`${WS_URL}/${sessionId}`);
    wsRef.current = ws;

    ws.onopen = () => { ws.send(JSON.stringify({ type: 'auth', token })); };

    ws.onmessage = (e) => {
      try {
        const msg = JSON.parse(e.data);
        switch (msg.type) {
          case 'connected':
            setConnected(true);
            setParticipants(msg.participants || []);
            setMessages(msg.chat_history || []);
            if (msg.video_mode) setVideoMode(msg.video_mode);
            // Init camera states from participants
            const camStates = {};
            (msg.participants || []).forEach(p => { camStates[p.user_id] = p.camera_on || false; });
            setCameraStates(camStates);
            break;
          case 'user_joined':
            setParticipants(prev => {
              if (prev.find(p => p.user_id === msg.user_id)) return prev;
              return [...prev, { user_id: msg.user_id, name: msg.name, avatar: msg.avatar }];
            });
            setCameraStates(prev => ({ ...prev, [msg.user_id]: false }));
            setMessages(prev => [...prev, { type: 'system', text: `${msg.name} joined the circle`, timestamp: new Date().toISOString() }]);
            break;
          case 'user_left':
            setParticipants(prev => prev.filter(p => p.user_id !== msg.user_id));
            setCameraStates(prev => { const n = { ...prev }; delete n[msg.user_id]; return n; });
            // Close peer connection for that user
            closePeerConnection(msg.user_id);
            setRemoteStreams(prev => { const n = { ...prev }; delete n[msg.user_id]; return n; });
            setMessages(prev => [...prev, { type: 'system', text: `${msg.name} left`, timestamp: new Date().toISOString() }]);
            break;
          case 'chat':
            setMessages(prev => [...prev, msg]);
            break;
          case 'reaction':
            addFloatingReaction(msg.emoji, msg.name);
            break;
          case 'host_command':
            setHostCommand(msg);
            setTimeout(() => setHostCommand(null), 5000);
            break;
          case 'mixer_sync':
            setLiveMixerState(msg);
            break;
          case 'session_started':
            setSession(prev => prev ? { ...prev, status: 'active' } : prev);
            setMessages(prev => [...prev, { type: 'system', text: msg.message, timestamp: new Date().toISOString() }]);
            break;
          case 'session_ended':
            setMessages(prev => [...prev, { type: 'system', text: msg.message, timestamp: new Date().toISOString() }]);
            cleanupAllPeers();
            setTimeout(() => navigate('/live'), 3000);
            break;
          // WebRTC signaling
          case 'camera_toggle':
            setCameraStates(prev => ({ ...prev, [msg.user_id]: msg.camera_on }));
            if (msg.camera_on && msg.user_id !== user.id && isVideoOn) {
              // Remote user turned on camera — create offer to them
              createPeerOffer(msg.user_id);
            }
            if (!msg.camera_on && msg.user_id !== user.id) {
              closePeerConnection(msg.user_id);
              setRemoteStreams(prev => { const n = { ...prev }; delete n[msg.user_id]; return n; });
            }
            break;
          case 'video_mode':
            setVideoMode(msg.mode);
            if (msg.mode === 'off') {
              if (isVideoOn) toggleLocalVideo(false);
              if (isScreenSharing) stopScreenShare();
              cleanupAllPeers();
              setRemoteStreams({});
              setRemoteScreenStream(null);
              setScreenSharer(null);
            }
            break;
          case 'screen_share':
            if (msg.sharing) {
              setScreenSharer(msg.user_id);
              // If we have camera on, create offer to screen sharer for their screen stream
              if (msg.user_id !== user.id && isVideoOn) {
                createPeerOffer(msg.user_id);
              }
            } else {
              if (screenSharer === msg.user_id) {
                setScreenSharer(null);
                setRemoteScreenStream(null);
              }
            }
            break;
          case 'rtc_offer':
            handleRTCOffer(msg.from, msg.offer);
            break;
          case 'rtc_answer':
            handleRTCAnswer(msg.from, msg.answer);
            break;
          case 'ice_candidate':
            handleICECandidate(msg.from, msg.candidate);
            break;
          default:
            break;
        }
      } catch {}
    };

    ws.onclose = () => {
      setConnected(false);
      reconnectRef.current = setTimeout(connectWS, 3000);
    };
    ws.onerror = () => ws.close();
  }, [user, sessionId]);

  useEffect(() => {
    connectWS();
    return () => {
      if (wsRef.current) wsRef.current.close();
      if (reconnectRef.current) clearTimeout(reconnectRef.current);
      cleanupAllPeers();
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(t => t.stop());
      }
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach(t => t.stop());
      }
      Object.values(screenPeersRef.current).forEach(pc => pc.close());
    };
  }, [connectWS]);

  // Timer
  useEffect(() => {
    if (session?.status === 'active') {
      timerRef.current = setInterval(() => setElapsed(p => p + 1), 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [session?.status]);

  // Auto-scroll chat
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  // ─── WebRTC Functions ───

  const createPeerConnection = useCallback((peerId) => {
    if (peerConnectionsRef.current[peerId]) return peerConnectionsRef.current[peerId];

    const pc = new RTCPeerConnection(RTC_CONFIG);

    // Add local tracks
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => {
        pc.addTrack(track, localStreamRef.current);
      });
    }

    // Handle remote tracks
    pc.ontrack = (event) => {
      const stream = event.streams[0];
      if (stream) {
        setRemoteStreams(prev => ({ ...prev, [peerId]: stream }));
      }
    };

    // Handle ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate && wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
          type: 'ice_candidate',
          target: peerId,
          candidate: event.candidate.toJSON(),
        }));
      }
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
        closePeerConnection(peerId);
        setRemoteStreams(prev => { const n = { ...prev }; delete n[peerId]; return n; });
      }
    };

    peerConnectionsRef.current[peerId] = pc;
    return pc;
  }, []);

  const createPeerOffer = useCallback(async (peerId) => {
    try {
      const pc = createPeerConnection(peerId);
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
          type: 'rtc_offer',
          target: peerId,
          offer: pc.localDescription.toJSON(),
        }));
      }
    } catch (err) {
      console.error('Create offer error:', err);
    }
  }, [createPeerConnection]);

  const handleRTCOffer = useCallback(async (fromId, offer) => {
    try {
      // Only handle if we have local video on
      if (!localStreamRef.current) return;
      const pc = createPeerConnection(fromId);
      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
          type: 'rtc_answer',
          target: fromId,
          answer: pc.localDescription.toJSON(),
        }));
      }
    } catch (err) {
      console.error('Handle offer error:', err);
    }
  }, [createPeerConnection]);

  const handleRTCAnswer = useCallback(async (fromId, answer) => {
    try {
      const pc = peerConnectionsRef.current[fromId];
      if (pc) {
        await pc.setRemoteDescription(new RTCSessionDescription(answer));
      }
    } catch (err) {
      console.error('Handle answer error:', err);
    }
  }, []);

  const handleICECandidate = useCallback(async (fromId, candidate) => {
    try {
      const pc = peerConnectionsRef.current[fromId];
      if (pc && candidate) {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      }
    } catch (err) {
      console.error('ICE candidate error:', err);
    }
  }, []);

  const closePeerConnection = useCallback((peerId) => {
    const pc = peerConnectionsRef.current[peerId];
    if (pc) {
      pc.close();
      delete peerConnectionsRef.current[peerId];
    }
  }, []);

  const cleanupAllPeers = useCallback(() => {
    Object.keys(peerConnectionsRef.current).forEach(closePeerConnection);
    peerConnectionsRef.current = {};
    setRemoteStreams({});
  }, [closePeerConnection]);

  // ─── Camera / Mic Toggle ───

  const toggleLocalVideo = useCallback(async (forceOff) => {
    const shouldTurnOff = forceOff === true || isVideoOn;

    if (shouldTurnOff) {
      if (localStreamRef.current) {
        localStreamRef.current.getVideoTracks().forEach(t => t.stop());
        localStreamRef.current.getAudioTracks().forEach(t => t.stop());
        localStreamRef.current = null;
      }
      virtualBg.stopProcessing();
      if (localVideoRef.current) localVideoRef.current.srcObject = null;
      cleanupAllPeers();
      setIsVideoOn(false);
      setIsMicOn(false);
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: 'camera_toggle', camera_on: false }));
      }
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
          audio: true,
        });

        // If virtual background is active, process through segmenter
        if (virtualBg.currentBg) {
          // Create hidden video element to feed to segmenter
          const hiddenVideo = hiddenVideoRef.current || document.createElement('video');
          hiddenVideoRef.current = hiddenVideo;
          hiddenVideo.srcObject = stream;
          hiddenVideo.muted = true;
          hiddenVideo.autoplay = true;
          hiddenVideo.playsInline = true;
          await hiddenVideo.play();
          // Wait for video to have dimensions
          await new Promise(resolve => {
            if (hiddenVideo.videoWidth > 0) resolve();
            else hiddenVideo.onloadeddata = resolve;
          });

          const processedStream = await virtualBg.startProcessing(hiddenVideo, virtualBg.currentBg);
          if (processedStream) {
            // Add audio track from original stream to processed stream
            stream.getAudioTracks().forEach(t => processedStream.addTrack(t));
            localStreamRef.current = processedStream;
            // Keep reference to raw stream for cleanup
            localStreamRef.current._rawStream = stream;
          } else {
            localStreamRef.current = stream;
          }
        } else {
          localStreamRef.current = stream;
        }

        if (localVideoRef.current) localVideoRef.current.srcObject = localStreamRef.current;
        setIsVideoOn(true);
        setIsMicOn(true);

        if (wsRef.current?.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({ type: 'camera_toggle', camera_on: true }));
        }

        Object.entries(cameraStates).forEach(([peerId, camOn]) => {
          if (camOn && peerId !== user.id) {
            createPeerOffer(peerId);
          }
        });
      } catch (err) {
        console.error('Camera access error:', err);
      }
    }
  }, [isVideoOn, cleanupAllPeers, cameraStates, user, createPeerOffer, virtualBg]);

  const toggleMic = useCallback(() => {
    if (localStreamRef.current) {
      const audioTracks = localStreamRef.current.getAudioTracks();
      audioTracks.forEach(t => { t.enabled = !t.enabled; });
      setIsMicOn(prev => !prev);
    }
  }, []);

  const changeVideoMode = useCallback((mode) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'video_mode', mode }));
    }
    setShowVideoSettings(false);
  }, []);

  // ─── Screen Sharing ───

  const startScreenShare = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { cursor: 'always', width: { ideal: 1920 }, height: { ideal: 1080 } },
        audio: true,
      });

      screenStreamRef.current = stream;
      setIsScreenSharing(true);
      setScreenSharer(user.id);

      // Notify others
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: 'screen_share', sharing: true }));
      }

      // Create screen-sharing peer connections to all peers with camera on
      Object.entries(cameraStates).forEach(([peerId, camOn]) => {
        if (camOn && peerId !== user.id) {
          const pc = new RTCPeerConnection(RTC_CONFIG);
          stream.getTracks().forEach(track => pc.addTrack(track, stream));

          pc.onicecandidate = (event) => {
            if (event.candidate && wsRef.current?.readyState === WebSocket.OPEN) {
              wsRef.current.send(JSON.stringify({
                type: 'ice_candidate',
                target: peerId,
                candidate: event.candidate.toJSON(),
              }));
            }
          };

          pc.createOffer().then(offer => {
            pc.setLocalDescription(offer);
            if (wsRef.current?.readyState === WebSocket.OPEN) {
              wsRef.current.send(JSON.stringify({
                type: 'rtc_offer',
                target: peerId,
                offer: offer,
              }));
            }
          });

          screenPeersRef.current[peerId] = pc;
        }
      });

      // Listen for when user stops sharing via browser UI
      stream.getVideoTracks()[0].onended = () => {
        stopScreenShare();
      };
    } catch (err) {
      console.error('Screen share error:', err);
    }
  }, [cameraStates, user]);

  const stopScreenShare = useCallback(() => {
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach(t => t.stop());
      screenStreamRef.current = null;
    }
    Object.values(screenPeersRef.current).forEach(pc => pc.close());
    screenPeersRef.current = {};

    setIsScreenSharing(false);
    if (screenSharer === user?.id) {
      setScreenSharer(null);
    }

    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'screen_share', sharing: false }));
    }
  }, [screenSharer, user]);

  // Handle background selection
  const handleBgSelect = useCallback(async (bgConfig) => {
    if (!bgConfig) {
      // Remove background
      virtualBg.stopProcessing();
      // If camera is on, revert to raw stream
      if (isVideoOn && localStreamRef.current?._rawStream) {
        localStreamRef.current = localStreamRef.current._rawStream;
        if (localVideoRef.current) localVideoRef.current.srcObject = localStreamRef.current;
      }
      setShowBgPicker(false);
      return;
    }

    if (isVideoOn) {
      // Camera already on — apply/change background live
      await virtualBg.changeBackground(bgConfig);

      // If not already processing, start processing
      if (!virtualBg.isActive && hiddenVideoRef.current) {
        const processedStream = await virtualBg.startProcessing(hiddenVideoRef.current, bgConfig);
        if (processedStream) {
          const rawStream = localStreamRef.current?._rawStream || localStreamRef.current;
          rawStream?.getAudioTracks().forEach(t => processedStream.addTrack(t));
          localStreamRef.current = processedStream;
          localStreamRef.current._rawStream = rawStream;
          if (localVideoRef.current) localVideoRef.current.srcObject = localStreamRef.current;
        }
      }
    }
    // Store the selection so it applies when camera turns on
    setShowBgPicker(false);
  }, [isVideoOn, virtualBg]);

  // ─── Existing Functions ───

  const sendChat = () => {
    if (!chatInput.trim() || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
    wsRef.current.send(JSON.stringify({ type: 'chat', text: chatInput.trim() }));
    setChatInput('');
  };

  const sendReaction = (emoji) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'reaction', emoji }));
    }
  };

  const sendHostCommand = (cmd) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'host_command', command: cmd.id, data: { label: cmd.label, color: cmd.color } }));
    }
  };

  const startSession = async () => {
    try { await axios.post(`${API}/live/sessions/${sessionId}/start`, {}, { headers: authHeaders }); } catch {}
  };

  const endSession = async () => {
    try {
      if (mediaRecorderRef.current && isRecording) await stopRecording(true);
      if (isScreenSharing) stopScreenShare();
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(t => t.stop());
        localStreamRef.current = null;
        setIsVideoOn(false);
      }
      cleanupAllPeers();
      await axios.post(`${API}/live/sessions/${sessionId}/end`, {}, { headers: authHeaders });
    } catch {}
  };

  // Audio recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      audioChunksRef.current = [];
      recorder.ondataavailable = (e) => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };
      recorder.onstop = () => { stream.getTracks().forEach(t => t.stop()); };
      recorder.start(1000);
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
      setRecordingStatus('recording');
    } catch (err) { console.error('Recording error:', err); }
  };

  const stopRecording = async (autoUpload = false) => {
    if (!mediaRecorderRef.current) return;
    return new Promise((resolve) => {
      mediaRecorderRef.current.onstop = async () => {
        mediaRecorderRef.current.stream?.getTracks().forEach(t => t.stop());
        setIsRecording(false);
        if (autoUpload && audioChunksRef.current.length > 0) await uploadAudio();
        setRecordingStatus(autoUpload ? 'done' : '');
        resolve();
      };
      mediaRecorderRef.current.stop();
    });
  };

  const uploadAudio = async () => {
    if (audioChunksRef.current.length === 0) return;
    setRecordingStatus('uploading');
    try {
      const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      const formData = new FormData();
      formData.append('audio', blob, `session_${sessionId}.webm`);
      await axios.post(`${API}/live/sessions/${sessionId}/upload-audio`, formData, {
        headers: { ...authHeaders, 'Content-Type': 'multipart/form-data' },
      });
      setRecordingStatus('done');
    } catch { setRecordingStatus(''); }
  };

  const addFloatingReaction = (emoji, name) => {
    const id = Date.now() + Math.random();
    setFloatingReactions(prev => [...prev, { id, emoji, name, x: 20 + Math.random() * 60 }]);
    setTimeout(() => setFloatingReactions(prev => prev.filter(r => r.id !== id)), 3000);
  };

  const formatTime = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  // ─── Count active videos ───
  const activeVideoCount = Object.values(cameraStates).filter(Boolean).length;
  const hasAnyVideo = activeVideoCount > 0 || isVideoOn || screenSharer;

  if (!session) {
    return (
      <div className="h-screen flex items-center justify-center" style={{ background: '#0A0B14' }}>
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}>
          <Sparkles size={24} style={{ color: '#C084FC' }} />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex flex-col overflow-hidden" style={{ background: '#0A0B14', height: 'calc(100vh - 56px)', position: 'relative', zIndex: 30 }} data-testid="live-room">
      {/* Scene Background */}
      <div className="absolute inset-0 z-0">
        <SceneBackground session={session} />
      </div>

      {/* Floating Reactions */}
      <div className="absolute inset-0 z-30 pointer-events-none overflow-hidden">
        {/* Host Mixer Visual Overlays (received via WebSocket) */}
        {liveMixerState?.visual_layers?.filter(l => l.visible).map((layer, i) => {
          if (layer.type === 'light') {
            const mode = LIGHT_MODES.find(m => m.id === layer.itemId);
            if (!mode) return null;
            return (
              <div key={`live-${layer.type}-${layer.itemId}-${i}`} className="absolute inset-0" style={{ opacity: (layer.opacity || 60) / 100 }}>
                <LiveLightOverlay mode={mode} />
              </div>
            );
          }
          if (layer.type === 'video') {
            const vid = VIDEO_OVERLAYS.find(v => v.id === layer.itemId);
            if (!vid) return null;
            return (
              <div key={`live-${layer.type}-${layer.itemId}-${i}`} className="absolute inset-0 overflow-hidden" style={{ opacity: (layer.opacity || 40) / 100 }}>
                <video src={vid.url} autoPlay loop muted playsInline className="w-full h-full object-cover" style={{ mixBlendMode: 'screen' }} />
              </div>
            );
          }
          if (layer.type === 'fractal') {
            return (
              <div key={`live-${layer.type}-${layer.itemId}-${i}`} className="absolute inset-0" style={{ opacity: (layer.opacity || 60) / 100 }}>
                <FractalVisualizer type={layer.itemId} opacity={1} />
              </div>
            );
          }
          return null;
        })}
        <AnimatePresence>
          {floatingReactions.map(r => (
            <motion.div key={r.id}
              initial={{ opacity: 1, y: '100vh', x: `${r.x}%` }}
              animate={{ opacity: 0, y: '10vh' }}
              exit={{ opacity: 0 }}
              transition={{ duration: 2.5, ease: 'easeOut' }}
              className="absolute text-2xl">
              {r.emoji}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Host Command Overlay */}
      <AnimatePresence>
        {hostCommand && (
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
            className="absolute inset-0 z-40 flex items-center justify-center pointer-events-none">
            <div className="text-center">
              <p className="text-4xl md:text-6xl font-light mb-2" style={{ fontFamily: 'Cormorant Garamond, serif', color: '#F8FAFC', textShadow: '0 0 40px rgba(192,132,252,0.4)' }}>
                {hostCommand.data?.label || hostCommand.command}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Bar */}
      <div className="relative z-20 px-4 py-3 flex items-center justify-between" style={{ background: 'rgba(10,11,20,0.6)', backdropFilter: 'none'}}>
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/live')} className="p-1.5 rounded-lg hover:bg-white/5" data-testid="live-room-back">
            <ArrowLeft size={16} style={{ color: 'rgba(255,255,255,0.85)' }} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              {session.status === 'active' && <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#EF4444' }} />}
              <h1 className="text-sm font-medium" style={{ color: '#F8FAFC' }}>{session.title}</h1>
            </div>
            <p className="text-[9px] flex items-center gap-2" style={{ color: 'rgba(255,255,255,0.7)' }}>
              <Crown size={8} style={{ color: '#EAB308' }} /> {session.host_name}
              <span style={{ color: 'rgba(248,250,252,0.15)' }}>|</span>
              <Users size={8} /> {participants.length}
              {session.status === 'active' && <>
                <span style={{ color: 'rgba(248,250,252,0.15)' }}>|</span>
                <Timer size={8} /> {formatTime(elapsed)}
              </>}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Video mode indicator */}
          <div className="flex items-center gap-1 px-2 py-1 rounded-lg" style={{ background: 'rgba(248,250,252,0.04)' }}>
            {videoMode === 'everyone' && <Users size={10} style={{ color: '#22C55E' }} />}
            {videoMode === 'host_only' && <Crown size={10} style={{ color: '#EAB308' }} />}
            {videoMode === 'off' && <VideoOff size={10} style={{ color: '#EF4444' }} />}
            <span className="text-[8px]" style={{ color: 'var(--text-muted)' }}>{VIDEO_MODES[videoMode]?.label}</span>
          </div>

          {isHost && session.status === 'active' && (
            <div className="relative">
              <button onClick={() => setShowVideoSettings(!showVideoSettings)}
                className="p-1.5 rounded-lg hover:bg-white/5 transition-all"
                data-testid="video-settings-btn">
                <Settings size={14} style={{ color: 'rgba(255,255,255,0.75)' }} />
              </button>
              <AnimatePresence>
                {showVideoSettings && (
                  <motion.div initial={{ opacity: 0, y: -5, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -5, scale: 0.95 }}
                    className="absolute right-0 top-10 z-50 w-56 rounded-xl overflow-hidden"
                    style={{ background: 'rgba(20,22,40,0.95)', border: '1px solid rgba(248,250,252,0.08)', backdropFilter: 'none', boxShadow: '0 20px 40px rgba(0,0,0,0.15)' }}
                    data-testid="video-settings-dropdown">
                    <div className="p-2">
                      <p className="text-[9px] font-bold uppercase tracking-wider px-2 pb-2" style={{ color: 'var(--text-muted)' }}>Video Mode</p>
                      {Object.entries(VIDEO_MODES).map(([key, mode]) => {
                        const MIcon = mode.icon;
                        return (
                          <button key={key} onClick={() => changeVideoMode(key)}
                            className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-left transition-all hover:bg-white/5"
                            style={{
                              background: videoMode === key ? 'rgba(192,132,252,0.08)' : 'transparent',
                              border: videoMode === key ? '1px solid rgba(192,132,252,0.15)' : '1px solid transparent',
                            }}
                            data-testid={`video-mode-${key}`}>
                            <MIcon size={12} style={{ color: videoMode === key ? '#C084FC' : 'var(--text-muted)' }} />
                            <div>
                              <p className="text-[10px] font-medium" style={{ color: videoMode === key ? '#C084FC' : 'var(--text-secondary)' }}>{mode.label}</p>
                              <p className="text-[8px]" style={{ color: 'var(--text-muted)' }}>{mode.desc}</p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          <button onClick={() => setShowParticipants(!showParticipants)} className="p-1.5 rounded-lg hover:bg-white/5">
            <Users size={14} style={{ color: showParticipants ? '#C084FC' : 'rgba(255,255,255,0.75)' }} />
          </button>
          <button onClick={() => setShowChat(!showChat)} className="p-1.5 rounded-lg hover:bg-white/5">
            <MessageCircle size={14} style={{ color: showChat ? '#C084FC' : 'rgba(255,255,255,0.75)' }} />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden relative z-10 min-h-0">

        {/* Center Area */}
        <div className="flex-1 flex flex-col relative">

          {/* Video Grid (when any video is active) */}
          {hasAnyVideo && videoMode !== 'off' && (
            <div className="flex-1 p-3 overflow-hidden" data-testid="video-grid">
              <VideoGrid
                localStream={localStreamRef.current}
                localVideoRef={localVideoRef}
                remoteStreams={remoteStreams}
                cameraStates={cameraStates}
                participants={participants}
                currentUserId={user?.id}
                isVideoOn={isVideoOn}
                myAvatar={avatarB64}
                hostId={session?.host_id}
                screenSharer={screenSharer}
                screenStream={isScreenSharing ? screenStreamRef.current : null}
                remoteScreenStream={remoteScreenStream}
              />
            </div>
          )}

          {/* Avatar Circle (when no video) */}
          {(!hasAnyVideo || videoMode === 'off') && (
            <div className="flex-1 flex items-center justify-center">
              <AvatarCircle participants={participants} currentUserId={user?.id} myAvatar={avatarB64} />
            </div>
          )}

          {/* Bottom Controls Bar */}
          <div className="relative z-20 px-4 py-3 flex items-center justify-center gap-2" style={{ background: 'rgba(10,11,20,0.7)', backdropFilter: 'none', borderTop: '1px solid rgba(248,250,252,0.04)' }}
            data-testid="bottom-controls">

            {/* Camera Toggle (all users when allowed) */}
            {canShareVideo && session.status === 'active' && (
              <button onClick={() => toggleLocalVideo()}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-medium transition-all hover:scale-105"
                style={{
                  background: isVideoOn ? 'rgba(59,130,246,0.15)' : 'rgba(148,163,184,0.08)',
                  border: `1px solid ${isVideoOn ? 'rgba(59,130,246,0.3)' : 'rgba(148,163,184,0.1)'}`,
                  color: isVideoOn ? '#3B82F6' : '#94A3B8',
                }}
                data-testid="toggle-video">
                {isVideoOn ? <><VideoOff size={12} /> Cam Off</> : <><Video size={12} /> Cam On</>}
              </button>
            )}

            {/* Mic Toggle (when camera is on) */}
            {isVideoOn && (
              <button onClick={toggleMic}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-medium transition-all hover:scale-105"
                style={{
                  background: isMicOn ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)',
                  border: `1px solid ${isMicOn ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}`,
                  color: isMicOn ? '#22C55E' : '#EF4444',
                }}
                data-testid="toggle-mic">
                {isMicOn ? <><Mic size={12} /> Mic On</> : <><MicOff size={12} /> Muted</>}
              </button>
            )}

            {/* Screen Share Toggle */}
            {canShareVideo && session.status === 'active' && (
              <button onClick={() => isScreenSharing ? stopScreenShare() : startScreenShare()}
                disabled={screenSharer && screenSharer !== user?.id}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-medium transition-all hover:scale-105"
                style={{
                  background: isScreenSharing ? 'rgba(234,179,8,0.15)' : 'rgba(148,163,184,0.08)',
                  border: `1px solid ${isScreenSharing ? 'rgba(234,179,8,0.3)' : 'rgba(148,163,184,0.1)'}`,
                  color: isScreenSharing ? '#EAB308' : '#94A3B8',
                  opacity: (screenSharer && screenSharer !== user?.id) ? 0.4 : 1,
                }}
                data-testid="toggle-screen-share">
                {isScreenSharing ? <><X size={12} /> Stop Share</> : <><Monitor size={12} /> Share Screen</>}
              </button>
            )}

            {/* Virtual Background Button */}
            {canShareVideo && session.status === 'active' && (
              <button onClick={() => setShowBgPicker(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-medium transition-all hover:scale-105"
                style={{
                  background: virtualBg.currentBg ? 'rgba(192,132,252,0.15)' : 'rgba(148,163,184,0.08)',
                  border: `1px solid ${virtualBg.currentBg ? 'rgba(192,132,252,0.3)' : 'rgba(148,163,184,0.1)'}`,
                  color: virtualBg.currentBg ? '#C084FC' : '#94A3B8',
                }}
                data-testid="toggle-virtual-bg">
                <Layers size={12} /> {virtualBg.currentBg ? 'BG Active' : 'Background'}
              </button>
            )}

            {/* Host Commands */}
            {isHost && session.status === 'active' && (
              <>
                {HOST_COMMANDS.map(cmd => {
                  const CIcon = cmd.icon;
                  return (
                    <button key={cmd.id} onClick={() => sendHostCommand(cmd)}
                      className="flex items-center gap-1 px-2.5 py-2 rounded-xl text-[9px] font-medium transition-all hover:scale-105"
                      style={{ background: `${cmd.color}10`, border: `1px solid ${cmd.color}18`, color: cmd.color }}
                      data-testid={`host-cmd-${cmd.id}`}>
                      <CIcon size={10} /> {cmd.label}
                    </button>
                  );
                })}

                {/* Record */}
                <button onClick={() => isRecording ? stopRecording() : startRecording()}
                  className="flex items-center gap-1 px-2.5 py-2 rounded-xl text-[9px] font-medium transition-all hover:scale-105"
                  style={{
                    background: isRecording ? 'rgba(239,68,68,0.15)' : 'rgba(234,179,8,0.12)',
                    border: `1px solid ${isRecording ? 'rgba(239,68,68,0.3)' : 'rgba(234,179,8,0.2)'}`,
                    color: isRecording ? '#EF4444' : '#EAB308',
                  }}
                  data-testid="toggle-recording">
                  {isRecording ? <><MicOff size={10} /> Stop Rec</> : <><Mic size={10} /> Record</>}
                </button>
              </>
            )}

            {/* Start / End Session (Host) */}
            {isHost && session.status === 'scheduled' && (
              <button onClick={startSession}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-medium transition-all hover:scale-105"
                style={{ background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)', color: '#22C55E' }}
                data-testid="start-session-btn">
                <Play size={14} /> Start Session
              </button>
            )}

            {isHost && session.status === 'active' && (
              <button onClick={endSession}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-medium transition-all hover:scale-105"
                style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#EF4444' }}
                data-testid="end-session-btn">
                <Square size={10} /> End
              </button>
            )}
          </div>

          {/* Recording Status */}
          {recordingStatus && (
            <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 px-3 py-1.5 rounded-full"
              style={{ background: 'transparent', backdropFilter: 'none'}}>
              {recordingStatus === 'recording' && <>
                <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#EF4444' }} />
                <span className="text-[9px]" style={{ color: '#EF4444' }}>Recording...</span>
              </>}
              {recordingStatus === 'uploading' && <span className="text-[9px]" style={{ color: '#EAB308' }}>Uploading...</span>}
              {recordingStatus === 'done' && <span className="text-[9px]" style={{ color: '#22C55E' }}>Saved</span>}
            </div>
          )}
        </div>

        {/* Right Sidebar — Participants + Chat */}
        <AnimatePresence>
          {(showChat || showParticipants) && (
            <motion.div initial={{ width: 0, opacity: 0 }} animate={{ width: 320, opacity: 1 }} exit={{ width: 0, opacity: 0 }}
              className="flex flex-col overflow-hidden flex-shrink-0 min-h-0"
              style={{ background: 'rgba(10,11,20,0.8)', backdropFilter: 'none', borderLeft: '1px solid rgba(248,250,252,0.04)' }}>

              {/* Participants Panel */}
              {showParticipants && (
                <div className="px-3 py-3" style={{ borderBottom: '1px solid rgba(248,250,252,0.04)' }}>
                  <p className="text-[9px] font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>
                    In the Circle ({participants.length})
                  </p>
                  <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                    {participants.map(p => (
                      <div key={p.user_id} className="flex items-center gap-1.5 px-2 py-1 rounded-full"
                        style={{ background: 'rgba(248,250,252,0.04)', border: '1px solid rgba(248,250,252,0.06)' }}>
                        {p.avatar ? (
                          <img src={`data:image/png;base64,${p.avatar}`} alt="" className="w-4 h-4 rounded-full object-cover" />
                        ) : (
                          <div className="w-4 h-4 rounded-full flex items-center justify-center text-[7px]"
                            style={{ background: 'rgba(192,132,252,0.2)', color: '#D8B4FE' }}>{p.name?.charAt(0)}</div>
                        )}
                        <span className="text-[9px]" style={{ color: 'var(--text-secondary)' }}>
                          {p.name?.split(' ')[0]}
                          {p.user_id === session?.host_id && <Crown size={7} className="inline ml-0.5" style={{ color: '#EAB308' }} />}
                        </span>
                        {cameraStates[p.user_id] && (
                          <Video size={7} style={{ color: '#3B82F6' }} />
                        )}
                        {screenSharer === p.user_id && (
                          <Monitor size={7} style={{ color: '#EAB308' }} />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Chat */}
              {showChat && (
                <div className="flex-1 flex flex-col overflow-hidden">
                  <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1" style={{ scrollbarWidth: 'thin' }}>
                    {messages.map((msg, i) => (
                      <div key={i} className={msg.type === 'system' ? 'text-center py-1' : ''}>
                        {msg.type === 'system' ? (
                          <span className="text-[9px] italic" style={{ color: 'rgba(255,255,255,0.65)' }}>{msg.text}</span>
                        ) : (
                          <div>
                            <span className="text-[9px] font-medium mr-1.5" style={{ color: msg.user_id === user?.id ? '#C084FC' : '#2DD4BF' }}>
                              {msg.user_id === user?.id ? 'You' : msg.name}
                            </span>
                            <span className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>{msg.text}</span>
                          </div>
                        )}
                      </div>
                    ))}
                    <div ref={chatEndRef} />
                  </div>

                  {/* Reactions */}
                  <div className="px-3 py-1.5 flex items-center gap-1" style={{ borderTop: '1px solid rgba(248,250,252,0.03)' }}>
                    {REACTIONS.map(r => (
                      <button key={r.emoji} onClick={() => sendReaction(r.emoji)}
                        className="text-sm p-1 rounded-lg hover:bg-white/5 transition-all hover:scale-125"
                        title={r.label}>
                        {r.emoji}
                      </button>
                    ))}
                  </div>

                  {/* Chat Input */}
                  <div className="px-3 py-2 flex items-center gap-2" style={{ borderTop: '1px solid rgba(248,250,252,0.04)' }}>
                    <input value={chatInput} onChange={e => setChatInput(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && sendChat()}
                      placeholder="Share a thought..."
                      className="flex-1 px-3 py-2 rounded-xl text-[10px]"
                      style={{ background: 'rgba(248,250,252,0.03)', border: '1px solid rgba(248,250,252,0.06)', color: 'var(--text-primary)', outline: 'none' }}
                      data-testid="chat-input" />
                    <button onClick={sendChat} className="p-2 rounded-xl" style={{ background: 'rgba(192,132,252,0.1)' }} data-testid="chat-send">
                      <Send size={12} style={{ color: '#C084FC' }} />
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Background Picker Modal */}
      <BackgroundPicker
        isOpen={showBgPicker}
        onClose={() => setShowBgPicker(false)}
        onSelect={handleBgSelect}
        currentBg={virtualBg.currentBg}
        isLoading={virtualBg.isLoading}
      />
    </div>
  );
}

/* ─── Video Grid ─── */
function VideoGrid({ localStream, localVideoRef, remoteStreams, cameraStates, participants, currentUserId, isVideoOn, myAvatar, hostId, screenSharer, screenStream, remoteScreenStream }) {
  const tiles = [];

  // Local video first
  if (isVideoOn) {
    tiles.push({
      id: currentUserId,
      name: 'You',
      isLocal: true,
      stream: localStream,
      isHost: currentUserId === hostId,
    });
  }

  // Remote videos
  participants.forEach(p => {
    if (p.user_id !== currentUserId && cameraStates[p.user_id] && remoteStreams[p.user_id]) {
      tiles.push({
        id: p.user_id,
        name: p.name?.split(' ')[0] || 'Peer',
        isLocal: false,
        stream: remoteStreams[p.user_id],
        avatar: p.avatar,
        isHost: p.user_id === hostId,
      });
    }
  });

  // Determine if there's an active screen share
  const activeScreenStream = screenStream || remoteScreenStream;
  const sharerName = screenSharer === currentUserId ? 'You' :
    (participants.find(p => p.user_id === screenSharer)?.name?.split(' ')[0] || 'Someone');

  // Grid layout
  const count = tiles.length;
  let gridCols = 1;
  if (count === 2) gridCols = 2;
  else if (count <= 4) gridCols = 2;
  else if (count <= 9) gridCols = 3;
  else gridCols = 4;

  return (
    <div className="w-full h-full flex flex-col gap-2" data-testid="video-grid-container">
      {/* Screen Share (featured, top, full width) */}
      {activeScreenStream && screenSharer && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          className="relative rounded-2xl overflow-hidden flex-shrink-0"
          style={{
            background: 'rgba(13,14,26,0.9)',
            border: '2px solid rgba(234,179,8,0.25)',
            boxShadow: '0 0 30px rgba(234,179,8,0.1)',
            height: tiles.length > 0 ? '55%' : '100%',
            minHeight: 200,
          }}
          data-testid="screen-share-tile">
          <ScreenShareTile stream={activeScreenStream} sharerName={sharerName} />
        </motion.div>
      )}

      {/* Camera tiles grid */}
      {tiles.length > 0 && (
        <div className="flex-1 grid gap-2 min-h-0"
          style={{
            gridTemplateColumns: `repeat(${gridCols}, 1fr)`,
            gridAutoRows: '1fr',
          }}>
          {tiles.map(tile => (
            <VideoTile key={tile.id} tile={tile} localVideoRef={tile.isLocal ? localVideoRef : null} />
          ))}
        </div>
      )}

      {tiles.length === 0 && !activeScreenStream && (
        <div className="flex items-center justify-center h-full">
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>No active cameras</p>
        </div>
      )}
    </div>
  );
}

/* ─── Video Tile ─── */
function VideoTile({ tile, localVideoRef }) {
  const videoEl = useRef(null);

  useEffect(() => {
    const el = tile.isLocal ? localVideoRef?.current : videoEl.current;
    if (el && tile.stream) {
      el.srcObject = tile.stream;
    }
  }, [tile.stream, tile.isLocal, localVideoRef]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative rounded-2xl overflow-hidden"
      style={{
        background: 'rgba(13,14,26,0.9)',
        border: '1px solid rgba(248,250,252,0.08)',
        boxShadow: tile.isLocal ? '0 0 20px rgba(59,130,246,0.1)' : '0 0 20px rgba(0,0,0,0.3)',
        minHeight: 120,
      }}
      data-testid={`video-tile-${tile.id}`}>
      <video
        ref={tile.isLocal ? localVideoRef : videoEl}
        autoPlay
        playsInline
        muted={tile.isLocal}
        className="w-full h-full object-cover absolute inset-0"
        style={{ transform: tile.isLocal ? 'scaleX(-1)' : 'none' }}
      />

      {/* Name badge */}
      <div className="absolute bottom-2 left-2 flex items-center gap-1.5 px-2 py-1 rounded-lg"
        style={{ background: 'transparent', backdropFilter: 'none'}}>
        <span className="text-[9px] font-medium" style={{ color: '#F8FAFC' }}>
          {tile.name}
        </span>
        {tile.isHost && <Crown size={8} style={{ color: '#EAB308' }} />}
      </div>

      {/* Live indicator */}
      <div className="absolute top-2 left-2 flex items-center gap-1 px-1.5 py-0.5 rounded-full"
        style={{ background: 'transparent' }}>
        <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#3B82F6' }} />
        <span className="text-[7px] font-medium" style={{ color: '#93C5FD' }}>LIVE</span>
      </div>
    </motion.div>
  );
}


/* ─── Screen Share Tile ─── */
function ScreenShareTile({ stream, sharerName }) {
  const videoEl = useRef(null);

  useEffect(() => {
    if (videoEl.current && stream) {
      videoEl.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <div className="relative w-full h-full" data-testid="screen-share-video">
      <video
        ref={videoEl}
        autoPlay
        playsInline
        className="w-full h-full object-contain absolute inset-0"
        style={{ background: 'transparent' }}
      />
      <div className="absolute bottom-3 left-3 flex items-center gap-2 px-3 py-1.5 rounded-lg"
        style={{ background: 'transparent', backdropFilter: 'none'}}>
        <Monitor size={12} style={{ color: '#EAB308' }} />
        <span className="text-[10px] font-medium" style={{ color: '#FDE68A' }}>
          {sharerName}'s screen
        </span>
      </div>
      <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2 py-1 rounded-full"
        style={{ background: 'rgba(234,179,8,0.15)', border: '1px solid rgba(234,179,8,0.2)' }}>
        <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#EAB308' }} />
        <span className="text-[8px] font-bold" style={{ color: '#EAB308' }}>SCREEN SHARE</span>
      </div>
    </div>
  );
}

/* ─── Avatar Circle ─── */
function AvatarCircle({ participants, currentUserId, myAvatar }) {
  const count = participants.length;
  const radius = Math.min(200, 80 + count * 15);

  return (
    <div className="relative" style={{ width: radius * 2 + 80, height: radius * 2 + 80 }}>
      {/* Center glow */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.35, 0.2] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="w-20 h-20 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(192,132,252,0.3), transparent 70%)' }} />
      </div>

      {/* Connecting lines */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity: 0.1 }}>
        {participants.map((_, i) => {
          const angle = (i / count) * Math.PI * 2 - Math.PI / 2;
          const cx = radius + 40;
          const cy = radius + 40;
          const x = cx + Math.cos(angle) * radius;
          const y = cy + Math.sin(angle) * radius;
          return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="#C084FC" strokeWidth="0.5" />;
        })}
      </svg>

      {/* Avatars arranged in circle */}
      {participants.map((p, i) => {
        const angle = (i / Math.max(count, 1)) * Math.PI * 2 - Math.PI / 2;
        const x = radius + 40 + Math.cos(angle) * radius - 24;
        const y = radius + 40 + Math.sin(angle) * radius - 24;
        const isMe = p.user_id === currentUserId;
        const avatarSrc = isMe && myAvatar ? myAvatar : p.avatar;

        return (
          <motion.div key={p.user_id}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1, type: 'spring' }}
            className="absolute flex flex-col items-center"
            style={{ left: x, top: y }}>
            <motion.div
              animate={{ y: [0, -3, 0] }}
              transition={{ duration: 3 + i * 0.5, repeat: Infinity, ease: 'easeInOut' }}
              className="relative">
              <div className="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center"
                style={{
                  border: `2px solid ${isMe ? '#C084FC' : 'rgba(248,250,252,0.15)'}`,
                  background: 'rgba(13,14,26,0.8)',
                  boxShadow: isMe ? '0 0 20px rgba(192,132,252,0.3)' : '0 0 10px rgba(0,0,0,0.3)',
                }}>
                {avatarSrc ? (
                  <img src={`data:image/png;base64,${avatarSrc}`} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-sm font-bold" style={{ color: '#D8B4FE' }}>{p.name?.charAt(0)?.toUpperCase()}</span>
                )}
              </div>
              <motion.div
                animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0, 0.3] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: i * 0.3 }}
                className="absolute inset-0 rounded-full"
                style={{ border: `1px solid ${isMe ? '#C084FC' : 'rgba(248,250,252,0.1)'}` }} />
            </motion.div>
            <span className="text-[8px] mt-1 px-1.5 py-0.5 rounded-full max-w-16 truncate"
              style={{ background: 'transparent', color: isMe ? '#C084FC' : 'rgba(255,255,255,0.85)', backdropFilter: 'none'}}>
              {isMe ? 'You' : p.name?.split(' ')[0]}
            </span>
          </motion.div>
        );
      })}

      {count === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Waiting for seekers to join...</p>
        </div>
      )}
    </div>
  );
}

/* ─── Scene Background ─── */
function SceneBackground({ session }) {
  const sceneId = session?.scene || 'cosmic-temple';

  const SCENE_CONFIGS = {
    'cosmic-temple': { bg: 'radial-gradient(ellipse at 50% 30%, rgba(139,92,246,0.12), rgba(10,11,20,1))', particleColor: '#C084FC' },
    'zen-garden': { bg: 'radial-gradient(ellipse at 50% 60%, rgba(34,197,94,0.08), rgba(10,11,20,1))', particleColor: '#22C55E' },
    'ocean-shore': { bg: 'radial-gradient(ellipse at 50% 70%, rgba(6,182,212,0.1), rgba(10,11,20,1))', particleColor: '#06B6D4' },
    'mountain-peak': { bg: 'radial-gradient(ellipse at 50% 40%, rgba(245,158,11,0.08), rgba(10,11,20,1))', particleColor: '#F59E0B' },
    'sacred-fire': { bg: 'radial-gradient(ellipse at 50% 60%, rgba(239,68,68,0.08), rgba(10,11,20,1))', particleColor: '#EF4444' },
    'aurora': { bg: 'radial-gradient(ellipse at 50% 20%, rgba(45,212,191,0.1), rgba(10,11,20,1))', particleColor: '#2DD4BF' },
  };

  const config = SCENE_CONFIGS[sceneId] || SCENE_CONFIGS['cosmic-temple'];

  return (
    <div className="w-full h-full relative">
      <div className="absolute inset-0" style={{ background: config.bg }} />
      {[...Array(20)].map((_, i) => (
        <motion.div key={i}
          className="absolute rounded-full"
          style={{
            width: 1 + Math.random() * 2,
            height: 1 + Math.random() * 2,
            background: config.particleColor,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            opacity: 0.1 + Math.random() * 0.3,
          }}
          animate={{
            y: [0, -30 - Math.random() * 40, 0],
            opacity: [0.1, 0.4, 0.1],
          }}
          transition={{
            duration: 5 + Math.random() * 5,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: Math.random() * 5,
          }} />
      ))}
    </div>
  );
}


function LiveLightOverlay({ mode }) {
  const [idx, setIdx] = React.useState(0);
  React.useEffect(() => {
    const iv = setInterval(() => setIdx(i => (i + 1) % mode.colors.length), mode.speed);
    return () => clearInterval(iv);
  }, [mode]);
  const c = mode.colors[idx];
  const n = mode.colors[(idx + 1) % mode.colors.length];
  return (
    <div className="w-full h-full" style={{
      background: `radial-gradient(ellipse at 50% 40%, ${c}55 0%, ${n}30 40%, transparent 75%)`,
      transition: `background ${mode.speed / 1000}s ease-in-out`,
    }} />
  );
}
