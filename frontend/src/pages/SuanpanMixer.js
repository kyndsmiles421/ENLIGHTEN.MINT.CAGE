import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSensory } from '../context/SensoryContext';
import { useSovereign } from '../context/SovereignContext';
import axios from 'axios';
import { toast } from 'sonner';
import {
  ArrowLeft, Plus, Save, FolderOpen, Sliders, Crown,
  Layers, Music, Eye, X, Loader2, Play, Square,
  Package, Compass, Wand2, Moon, Sun, Heart, Brain, Anchor,
  Layout, Camera, Mic, Cpu, StopCircle, Circle, Sparkles, Lock,
} from 'lucide-react';
import { NanoGuide } from '../components/NanoGuide';

// Domain imports — Triple-Domain Decomposition
import {
  TRACK_TYPE_META, SUB_COLORS, TIER_DISPLAY,
  SuanpanSource, TrackRow,
} from './SuanpanCore';
import { SpeedBridgeModal, BonusPackCard, RecommendationCard } from './SuanpanSovereign';
import { SacredAssemblyLoader } from './SuanpanVfx';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

// ━━━ DIVINE DIRECTOR — Main Orchestrator ━━━
export default function SuanpanMixer() {
  const navigate = useNavigate();
  const { authHeaders, loading: authLoading, token } = useAuth();
  const { playConfirmation, isMuted } = useSensory();
  const { enqueue, publishEvent, eventBus } = useSovereign();

  const [subTier, setSubTier] = useState('discovery');
  const [tierConfig, setTierConfig] = useState(null);
  const [aiCredits, setAiCredits] = useState(0);
  const [speedBonus, setSpeedBonus] = useState(0);

  const [tracks, setTracks] = useState([]);
  const [projectName, setProjectName] = useState('Untitled Session');
  const [projects, setProjects] = useState([]);
  const [saving, setSaving] = useState(false);

  const [suanpanOpen, setSuanpanOpen] = useState(false);
  const [sourcesOpen, setSourcesOpen] = useState(false);
  const [packsOpen, setPacksOpen] = useState(false);
  const [sources, setSources] = useState([]);
  const [bonusPacks, setBonusPacks] = useState([]);
  const [purchasingPack, setPurchasingPack] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [hexagramInfo, setHexagramInfo] = useState(null);
  const [showSpeedBridge, setShowSpeedBridge] = useState(false);
  const [showProjects, setShowProjects] = useState(false);
  const [showAssembly, setShowAssembly] = useState(false);
  const [ripplingIndices, setRipplingIndices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [autoComposeOpen, setAutoComposeOpen] = useState(false);
  const [composing, setComposing] = useState(false);
  const [composeGoals, setComposeGoals] = useState([]);
  const [templatesOpen, setTemplatesOpen] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [mediaOpen, setMediaOpen] = useState(false);
  const [recordingConfig, setRecordingConfig] = useState(null);
  const [aiGenOpen, setAiGenOpen] = useState(false);
  const [aiCapabilities, setAiCapabilities] = useState(null);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiDuration, setAiDuration] = useState(10);
  const [generating, setGenerating] = useState(false);
  const [isRecordingVideo, setIsRecordingVideo] = useState(false);
  const [isRecordingAudio, setIsRecordingAudio] = useState(false);
  const mediaRecorderRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const recordedChunksRef = useRef([]);

  const [isPlaying, setIsPlaying] = useState(false);
  const ctxRef = useRef(null);
  const nodesRef = useRef([]);

  const layerCap = tierConfig?.layer_cap || 3;
  const atCap = layerCap > 0 && tracks.length >= layerCap;
  const tierColor = SUB_COLORS[subTier] || '#94A3B8';
  const matDelay = tierConfig?.materialization_delay || 20;
  const keyframesEnabled = tierConfig?.keyframe_automation || false;

  const ghostTracks = sources.filter(s => s.locked).slice(0, 3).map(s => ({
    type: s.type, source_label: s.label, volume: 0.5, locked: true, frequency: s.frequency,
  }));

  // ━━━ EventBus listeners for cross-component commands ━━━
  useEffect(() => { if (typeof window.__workAccrue === 'function') window.__workAccrue('suanpan_mixer', 12); }, []);
  useEffect(() => {
    const unsub = eventBus.subscribe('mixer_command', (data) => {
      if (data?.action === 'add_track' && data.source) addTrack(data.source);
      if (data?.action === 'auto_compose' && data.goal) handleAutoCompose(data.goal);
      if (data?.action === 'apply_template' && data.templateId) handleApplyTemplate(data.templateId);

      // Sphere merge — cross-domain injection from NebulaPlayground
      if (data?.action === 'sphere_merge') {
        const injectionHandlers = {
          starchart_injection: () => {
            // Re-tune active frequencies to planetary alignments
            setTracks(prev => prev.map(t => t.frequency ? {
              ...t, frequency: Math.round(t.frequency * 1.059463 * 100) / 100,
              source_label: `${t.source_label} [Star Aligned]`,
            } : t));
            toast.success('Star Chart frequencies aligned to planetary positions');
          },
          trade_injection: () => {
            // Activate NPU Burst mode visual indicator
            setSpeedBonus(prev => prev + 10);
            toast.success('Trade injection: +10% NPU speed boost activated');
          },
          meditation_injection: () => {
            // Inject 8D binaural stellar wash track
            if (!atCap) {
              setTracks(prev => [...prev, {
                type: 'phonic_tone', source_id: 'stellar-wash', source_label: '8D Stellar Wash',
                volume: 0.6, muted: false, solo: false, start_time: 0, duration: 120,
                frequency: 432, color: '#60A5FA', locked: false, ripple_locked: false,
              }]);
            }
            toast.success('Meditation layer: 8D Binaural Stellar Wash injected');
          },
          wellness_injection: () => {
            // Sync AI phonic resonance
            setTracks(prev => prev.map(t => t.frequency ? {
              ...t, volume: Math.min(1, t.volume + 0.05),
            } : t));
            toast.success('Phonic resonance: AI harmonics synchronized');
          },
        };
        const handler = injectionHandlers[data.injection_type];
        if (handler) handler();
      }
    });
    return unsub;
  }, [eventBus]);

  // Load data — Priority 1 (critical UI initialization)
  useEffect(() => {
    if (authLoading || !token) return;
    const load = async () => {
      try {
        const [subRes, srcRes, projRes, packRes, recRes, goalsRes, tplRes, recCfgRes, aiCapRes] = await Promise.all([
          axios.get(`${API}/mixer/subscription`, { headers: authHeaders }),
          axios.get(`${API}/mixer/sources`, { headers: authHeaders }),
          axios.get(`${API}/mixer/projects`, { headers: authHeaders }),
          axios.get(`${API}/mixer/bonus-packs`, { headers: authHeaders }),
          axios.get(`${API}/mixer/recommendations`, { headers: authHeaders }),
          axios.get(`${API}/mixer/auto-compose/goals`).catch(() => ({ data: { goals: [] } })),
          axios.get(`${API}/mixer/templates`, { headers: authHeaders }).catch(() => ({ data: { templates: [], categories: [] } })),
          axios.get(`${API}/mixer/recording/config`, { headers: authHeaders }).catch(() => ({ data: null })),
          axios.get(`${API}/mixer/ai/capabilities`, { headers: authHeaders }).catch(() => ({ data: null })),
        ]);
        setSubTier(subRes.data.tier);
        setTierConfig(subRes.data.tier_config);
        setAiCredits(subRes.data.ai_credits_remaining);
        setSpeedBonus(subRes.data.speed_bonus_pct);
        setSources(srcRes.data.sources || []);
        setProjects(projRes.data.projects || []);
        setBonusPacks(packRes.data.packs || []);
        setRecommendations(recRes.data.recommendations || []);
        setHexagramInfo(recRes.data.hexagram || null);
        setComposeGoals(goalsRes.data.goals || []);
        setTemplates(tplRes.data.templates || []);
        setRecordingConfig(recCfgRes.data);
        setAiCapabilities(aiCapRes.data);
      } catch {} finally { setLoading(false); }
    };
    load();
  }, [authHeaders, authLoading, token]);

  const reloadAll = useCallback(async () => {
    try {
      const [subRes, srcRes, projRes, packRes, recRes] = await Promise.all([
        axios.get(`${API}/mixer/subscription`, { headers: authHeaders }),
        axios.get(`${API}/mixer/sources`, { headers: authHeaders }),
        axios.get(`${API}/mixer/projects`, { headers: authHeaders }),
        axios.get(`${API}/mixer/bonus-packs`, { headers: authHeaders }),
        axios.get(`${API}/mixer/recommendations`, { headers: authHeaders }),
      ]);
      setSubTier(subRes.data.tier);
      setTierConfig(subRes.data.tier_config);
      setAiCredits(subRes.data.ai_credits_remaining);
      setSpeedBonus(subRes.data.speed_bonus_pct);
      setSources(srcRes.data.sources || []);
      setProjects(projRes.data.projects || []);
      setBonusPacks(packRes.data.packs || []);
      setRecommendations(recRes.data.recommendations || []);
      setHexagramInfo(recRes.data.hexagram || null);
    } catch {}
  }, [authHeaders]);

  const addTrack = useCallback((source) => {
    if (source.locked) { setShowSpeedBridge(true); return; }
    if (atCap) { setShowSpeedBridge(true); return; }
    if (matDelay > 10 && source.tier !== 'discovery') {
      setShowAssembly(true);
      setTimeout(() => {
        setTracks(prev => [...prev, {
          type: source.type || 'custom', source_id: source.id || '',
          source_label: source.label || 'New Track', volume: 0.8,
          muted: false, solo: false, start_time: 0, duration: 60,
          frequency: source.frequency || null, color: source.color || '#94A3B8', locked: false, ripple_locked: false,
        }]);
        setShowAssembly(false);
        if (!isMuted) playConfirmation(660, 'medium');
      }, matDelay * 1000);
      return;
    }
    setTracks(prev => [...prev, {
      type: source.type || 'custom', source_id: source.id || '',
      source_label: source.label || 'New Track', volume: 0.8,
      muted: false, solo: false, start_time: 0, duration: 60,
      frequency: source.frequency || null, color: source.color || '#94A3B8', locked: false, ripple_locked: false,
    }]);
    if (!isMuted) playConfirmation(660, 'medium');
    setSourcesOpen(false);
  }, [atCap, isMuted, playConfirmation, matDelay]);

  const addSuanpanTrack = useCallback((hz) => {
    if (atCap) { setShowSpeedBridge(true); return; }
    setTracks(prev => [...prev, {
      type: 'suanpan', source_id: `suanpan-${hz}`, source_label: `Suanpan ${hz.toFixed(1)} Hz`,
      volume: 0.8, muted: false, solo: false, start_time: 0, duration: 60,
      frequency: hz, color: '#EAB308', locked: false, ripple_locked: false,
    }]);
    if (!isMuted) playConfirmation(hz > 500 ? 880 : 440, 'medium');
    setSuanpanOpen(false);
  }, [atCap, isMuted, playConfirmation]);

  const addBonusPackTracks = useCallback(async (packId) => {
    try {
      const owned = await axios.get(`${API}/mixer/bonus-packs/owned`, { headers: authHeaders });
      const pack = (owned.data.owned_packs || []).find(p => p.pack_id === packId);
      if (!pack) return;
      const newTracks = (pack.tracks || []).map(t => ({
        type: t.type || 'bonus_pack', source_id: packId,
        source_label: t.source_label || 'Pack Track', volume: 0.8,
        muted: false, solo: false, start_time: 0, duration: 60,
        frequency: t.frequency || null, color: t.color || '#F472B6', locked: false, ripple_locked: false,
      }));
      const remaining = layerCap > 0 ? layerCap - tracks.length : 50;
      setTracks(prev => [...prev, ...newTracks.slice(0, remaining)]);
      toast.success(`Added ${Math.min(newTracks.length, remaining)} tracks from pack`);
    } catch {}
  }, [authHeaders, tracks.length, layerCap]);

  const purchasePack = useCallback(async (packId) => {
    setPurchasingPack(packId);
    try {
      const res = await axios.post(`${API}/mixer/bonus-packs/purchase`, { packId }, { headers: authHeaders });
      toast.success(`${res.data.purchased} - ${res.data.bonus_activated}`);
      if (!isMuted) playConfirmation(1046.5, 'high');
      publishEvent('purchase_complete', { packId, context: 'mixer' });
      reloadAll();
      addBonusPackTracks(packId);
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Purchase failed');
    } finally { setPurchasingPack(null); }
  }, [authHeaders, reloadAll, isMuted, playConfirmation, addBonusPackTracks, publishEvent]);

  const updateTrack = useCallback((index, updates) => {
    setTracks(prev => prev.map((t, i) => i === index ? { ...t, ...updates } : t));
  }, []);

  const removeTrack = useCallback((index) => {
    setTracks(prev => prev.filter((_, i) => i !== index));
  }, []);

  const totalDuration = Math.max(60, ...tracks.map(t => (t.start_time || 0) + (t.duration || 60)));

  const handleRipple = useCallback((changedIdx, oldDur, newDur, oldStart, newStart) => {
    const delta = newDur - oldDur;
    if (delta === 0) return;
    setTracks(prev => prev.map((t, i) => {
      if (i <= changedIdx) return t;
      if (t.ripple_locked) return t;
      return { ...t, start_time: Math.max(0, (t.start_time || 0) + delta) };
    }));
    const shifted = tracks
      .map((t, i) => (i > changedIdx && !t.ripple_locked) ? i : -1)
      .filter(i => i >= 0);
    setRipplingIndices(shifted);
    setTimeout(() => setRipplingIndices([]), 700);
    if (!isMuted) playConfirmation(delta > 0 ? 523 : 392, 'low');
  }, [tracks, isMuted, playConfirmation]);

  // Auto-compose via Priority Queue — Priority 2 (sensory stream)
  const handleAutoCompose = useCallback(async (goalKey) => {
    setComposing(true);
    const execute = async () => {
      try {
        const res = await axios.post(`${API}/mixer/auto-compose`, { goal: goalKey }, { headers: authHeaders });
        const composed = res.data;
        setTracks(composed.tracks || []);
        setProjectName(`${composed.goal_label} Session`);
        setAiCredits(prev => Math.max(0, prev - 1));
        setAutoComposeOpen(false);
        toast.success(`${composed.goal_label} - ${composed.track_count} tracks composed (${Math.round(composed.total_duration_seconds)}s)`);
        if (!isMuted) playConfirmation(880, 'high');
        publishEvent('auto_compose_complete', { goal: goalKey });
      } catch (e) {
        toast.error(e.response?.data?.detail || 'Auto-compose failed');
      } finally { setComposing(false); }
    };
    enqueue({ execute, label: `auto-compose-${goalKey}` }, 'experience');
  }, [authHeaders, isMuted, playConfirmation, enqueue, publishEvent]);

  const handleApplyTemplate = useCallback(async (templateId) => {
    try {
      const res = await axios.post(`${API}/mixer/templates/apply`, { template_id: templateId }, { headers: authHeaders });
      setTracks(res.data.tracks || []);
      setProjectName(`${res.data.template_name}`);
      setTemplatesOpen(false);
      toast.success(`Template "${res.data.template_name}" applied - ${res.data.track_count} tracks`);
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Template failed');
    }
  }, [authHeaders]);

  const handleStartRecording = useCallback(async (type) => {
    try {
      const constraints = type === 'video'
        ? { video: { width: { ideal: recordingConfig?.video?.max_resolution?.width || 640 }, height: { ideal: recordingConfig?.video?.max_resolution?.height || 480 }, frameRate: { ideal: recordingConfig?.video?.max_fps || 24 } }, audio: true }
        : { audio: { sampleRate: { ideal: recordingConfig?.audio?.sample_rate || 44100 }, channelCount: recordingConfig?.audio?.channels || 1, echoCancellation: recordingConfig?.audio?.echo_cancellation || true, noiseSuppression: recordingConfig?.audio?.noise_suppression || false } };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      mediaStreamRef.current = stream;
      recordedChunksRef.current = [];

      const mimeType = type === 'video' ? 'video/webm;codecs=vp9,opus' : 'audio/webm;codecs=opus';
      const recorder = new MediaRecorder(stream, { mimeType: MediaRecorder.isTypeSupported(mimeType) ? mimeType : undefined });

      recorder.ondataavailable = (e) => { if (e.data.size > 0) recordedChunksRef.current.push(e.data); };
      recorder.onstop = async () => {
        stream.getTracks().forEach(t => t.stop());
        const blob = new Blob(recordedChunksRef.current, { type: type === 'video' ? 'video/webm' : 'audio/webm' });
        const formData = new FormData();
        formData.append('file', blob, `recording.webm`);
        // Upload via Priority 3 (background orbit)
        enqueue({
          execute: async () => {
            try {
              const res = await axios.post(`${API}/mixer/recording/upload`, formData, {
                headers: { ...authHeaders, 'Content-Type': 'multipart/form-data' },
              });
              toast.success(`${type === 'video' ? 'Video' : 'Audio'} recorded & uploaded (${(blob.size / 1024).toFixed(0)}KB)`);
              if (type === 'audio') {
                setTracks(prev => [...prev, {
                  type: 'recording', source_id: res.data.id, source_label: `Recording ${res.data.id}`,
                  volume: 0.7, muted: false, solo: false, start_time: 0,
                  duration: 60, color: '#F472B6', locked: false, ripple_locked: false,
                }]);
              }
            } catch { toast.error('Upload failed'); }
          },
          label: 'recording-upload',
        }, 'background');
        setIsRecordingVideo(false);
        setIsRecordingAudio(false);
      };

      mediaRecorderRef.current = recorder;
      recorder.start(1000);
      if (type === 'video') setIsRecordingVideo(true);
      else setIsRecordingAudio(true);
      toast.success(`${type === 'video' ? 'Camera' : 'Mic'} recording started (${recordingConfig?.[type]?.label || 'Standard'})`);
    } catch (e) {
      toast.error(`Permission denied or device unavailable: ${e.message}`);
    }
  }, [authHeaders, recordingConfig, enqueue]);

  const handleStopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
  }, []);

  // AI Generate via Priority Queue — Priority 2 (sensory stream)
  const handleAiGenerate = useCallback(async () => {
    if (!aiPrompt.trim()) { toast.error('Enter a prompt'); return; }
    setGenerating(true);
    enqueue({
      execute: async () => {
        try {
          const res = await axios.post(`${API}/mixer/ai/generate-mix`, {
            prompt: aiPrompt, duration_minutes: aiDuration,
          }, { headers: authHeaders });
          setTracks(res.data.tracks || []);
          setProjectName(`AI: ${aiPrompt.slice(0, 30)}`);
          setAiCredits(prev => Math.max(0, prev - (res.data.credits_used || 0)));
          setAiGenOpen(false);
          toast.success(`AI generated ${res.data.track_count} tracks (${res.data.generated_by})`);
          publishEvent('ai_generation_complete', { prompt: aiPrompt });
        } catch (e) {
          toast.error(e.response?.data?.detail || 'AI generation failed');
        } finally { setGenerating(false); }
      },
      label: 'ai-generate',
    }, 'experience');
  }, [authHeaders, aiPrompt, aiDuration, enqueue, publishEvent]);

  // Save — Priority 3 (background orbit)
  const saveProject = useCallback(async () => {
    setSaving(true);
    enqueue({
      execute: async () => {
        try {
          await axios.post(`${API}/mixer/projects`, { name: projectName, tracks }, { headers: authHeaders });
          toast.success(`"${projectName}" saved`);
          const r = await axios.get(`${API}/mixer/projects`, { headers: authHeaders });
          setProjects(r.data.projects || []);
          publishEvent('project_saved', { name: projectName });
        } catch (e) {
          const d = e.response?.data?.detail || 'Save failed';
          if (d.includes('Layer cap')) setShowSpeedBridge(true);
          toast.error(d);
        } finally { setSaving(false); }
      },
      label: 'save-project',
    }, 'background');
  }, [projectName, tracks, authHeaders, enqueue, publishEvent]);

  const loadProject = useCallback(async (pid) => {
    try {
      const r = await axios.get(`${API}/mixer/projects/${pid}`, { headers: authHeaders });
      setTracks(r.data.tracks || []);
      setProjectName(r.data.name || 'Loaded Session');
      setShowProjects(false);
      toast.success(`Loaded: ${r.data.name}`);
    } catch { toast.error('Load failed'); }
  }, [authHeaders]);

  const handleUpgrade = useCallback(async (tier) => {
    try {
      const r = await axios.post(`${API}/mixer/subscription/upgrade`, { tier }, { headers: authHeaders });
      setSubTier(r.data.tier);
      setTierConfig(r.data.tier_config);
      setShowSpeedBridge(false);
      toast.success(r.data.message);
      publishEvent('subscription_upgraded', { tier });
      reloadAll();
    } catch (e) { toast.error(e.response?.data?.detail || 'Upgrade failed'); }
  }, [authHeaders, reloadAll, publishEvent]);

  const togglePlayAll = useCallback(() => {
    if (isPlaying) {
      nodesRef.current.forEach(n => { try { n.stop(); } catch {} });
      nodesRef.current = [];
      setIsPlaying(false);
      return;
    }
    if (tracks.length === 0) return;
    try {
      if (!ctxRef.current) ctxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      const ctx = ctxRef.current;
      if (ctx.state === 'suspended') ctx.resume();
      const hasSolo = tracks.some(t => t.solo);
      const playable = tracks.filter(t => !t.muted && t.frequency && (!hasSolo || t.solo));
      playable.forEach(t => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = t.frequency;
        gain.gain.setValueAtTime(0, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(t.volume * 0.04, ctx.currentTime + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime);
        nodesRef.current.push(osc);
      });
      setIsPlaying(true);
    } catch {}
  }, [isPlaying, tracks]);

  useEffect(() => { return () => { nodesRef.current.forEach(n => { try { n.stop(); } catch {} }); }; }, []);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center" style={{ background: '#06060e' }}>
      <Loader2 size={24} className="animate-spin" style={{ color: 'rgba(248,250,252,0.15)' }} />
    </div>;
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#06060e' }} data-testid="divine-director-page">

      {/* ━━━ HEADER ━━━ */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b z-[10000]"
        style={{ borderColor: 'rgba(248,250,252,0.05)', background: 'rgba(6,6,14,0.96)', backdropFilter: 'none'}}>
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/hub')} className="p-1.5 rounded-lg"
            style={{ background: 'rgba(248,250,252,0.03)' }} data-testid="director-back-btn">
            <ArrowLeft size={13} style={{ color: 'rgba(255,255,255,0.65)' }} />
          </button>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-sm font-light tracking-[0.15em] uppercase"
                style={{ color: 'rgba(255,255,255,0.65)', fontFamily: 'Cormorant Garamond, serif' }}>
                Divine Director
              </h1>
              <NanoGuide guideId="divine-director" position="top-right" />
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[6px] px-1.5 py-0.5 rounded-full uppercase tracking-wider font-medium"
                style={{ background: `${tierColor}12`, color: tierColor, border: `1px solid ${tierColor}20` }}>
                {TIER_DISPLAY[subTier] || subTier}
              </span>
              <span className="text-[7px] font-mono" style={{ color: 'rgba(255,255,255,0.6)' }}>
                {aiCredits} AI &middot; {speedBonus > 0 ? `+${speedBonus}% speed` : ''}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <input type="text" value={projectName} onChange={e => setProjectName(e.target.value)}
            className="text-[9px] px-2 py-1 rounded-lg w-32 text-right"
            style={{ background: 'rgba(248,250,252,0.025)', border: '1px solid rgba(248,250,252,0.05)', color: '#F8FAFC', outline: 'none' }}
            data-testid="project-name-input" />
          <motion.button className="p-1.5 rounded-lg cursor-pointer" style={{ background: 'rgba(248,250,252,0.03)' }}
            whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
            onClick={() => setShowProjects(!showProjects)} data-testid="open-projects-btn">
            <FolderOpen size={12} style={{ color: 'rgba(255,255,255,0.65)' }} />
          </motion.button>
          <motion.button className="p-1.5 rounded-lg cursor-pointer"
            style={{ background: saving ? `${tierColor}12` : 'rgba(248,250,252,0.03)' }}
            whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
            onClick={saveProject} disabled={saving} data-testid="save-project-btn">
            {saving ? <Loader2 size={12} className="animate-spin" style={{ color: tierColor }} />
              : <Save size={12} style={{ color: 'rgba(255,255,255,0.65)' }} />}
          </motion.button>
          <motion.button className="p-1.5 rounded-lg cursor-pointer" style={{ background: 'rgba(248,250,252,0.03)' }}
            whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
            onClick={() => setShowSpeedBridge(true)} data-testid="tier-info-btn">
            <Crown size={12} style={{ color: tierColor }} />
          </motion.button>
        </div>
      </div>

      {/* ━━━ MAIN ━━━ */}
      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 flex flex-col overflow-hidden">

          {/* Transport */}
          <div className="flex items-center gap-2 px-4 py-2 border-b" style={{ borderColor: 'rgba(248,250,252,0.03)' }}>
            <motion.button className="p-1.5 rounded-lg cursor-pointer"
              style={{
                background: isPlaying ? 'rgba(239,68,68,0.1)' : `${tierColor}08`,
                border: `1px solid ${isPlaying ? 'rgba(239,68,68,0.2)' : `${tierColor}15`}`,
              }}
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={togglePlayAll} data-testid="play-all-btn">
              {isPlaying ? <Square size={11} style={{ color: '#EF4444' }} /> : <Play size={11} style={{ color: tierColor }} />}
            </motion.button>

            <div className="flex-1 flex items-center gap-2">
              <Layers size={10} style={{ color: 'rgba(248,250,252,0.15)' }} />
              <p className="text-[8px] font-mono" style={{ color: 'rgba(255,255,255,0.6)' }}>
                {tracks.length}{layerCap > 0 ? `/${layerCap}` : ''} layers
              </p>
              {atCap && <span className="text-[6px] px-1.5 py-0.5 rounded-full"
                style={{ background: 'rgba(239,68,68,0.1)', color: '#EF4444' }}>CAP</span>}
              {speedBonus > 0 && <span className="text-[6px] px-1.5 py-0.5 rounded-full"
                style={{ background: 'rgba(34,197,94,0.1)', color: '#22C55E' }}>+{speedBonus}%</span>}
            </div>

            <div className="flex items-center gap-1">
              <motion.button className="flex items-center gap-1 px-2 py-1 rounded-lg cursor-pointer text-[7px]"
                style={{ background: 'rgba(248,250,252,0.03)', border: '1px solid rgba(248,250,252,0.04)', color: 'rgba(255,255,255,0.65)' }}
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                onClick={() => setSourcesOpen(!sourcesOpen)} data-testid="add-source-btn">
                <Plus size={9} /> Sources
              </motion.button>
              <motion.button className="flex items-center gap-1 px-2 py-1 rounded-lg cursor-pointer text-[7px]"
                style={{ background: 'rgba(234,179,8,0.06)', border: '1px solid rgba(234,179,8,0.1)', color: '#EAB308' }}
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                onClick={() => setSuanpanOpen(!suanpanOpen)} data-testid="add-suanpan-btn">
                <Sliders size={9} /> Suanpan
              </motion.button>
              <motion.button className="flex items-center gap-1 px-2 py-1 rounded-lg cursor-pointer text-[7px]"
                style={{ background: 'rgba(244,114,182,0.06)', border: '1px solid rgba(244,114,182,0.1)', color: '#F472B6' }}
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                onClick={() => setPacksOpen(!packsOpen)} data-testid="open-packs-btn">
                <Package size={9} /> Packs
              </motion.button>
              <motion.button className="flex items-center gap-1 px-2 py-1 rounded-lg cursor-pointer text-[7px]"
                style={{ background: 'rgba(192,132,252,0.08)', border: '1px solid rgba(192,132,252,0.15)', color: '#C084FC' }}
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                onClick={() => setAutoComposeOpen(!autoComposeOpen)} data-testid="auto-compose-btn">
                {composing ? <Loader2 size={9} className="animate-spin" /> : <Wand2 size={9} />} DJ Auto
              </motion.button>
              <motion.button className="flex items-center gap-1 px-2 py-1 rounded-lg cursor-pointer text-[7px]"
                style={{ background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.12)', color: '#FBBF24' }}
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                onClick={() => setTemplatesOpen(!templatesOpen)} data-testid="templates-btn">
                <Layout size={9} /> Templates
              </motion.button>
              <motion.button className="flex items-center gap-1 px-2 py-1 rounded-lg cursor-pointer text-[7px]"
                style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.12)', color: isRecordingVideo || isRecordingAudio ? '#EF4444' : '#FB7185' }}
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                onClick={() => setMediaOpen(!mediaOpen)} data-testid="media-record-btn">
                {isRecordingVideo || isRecordingAudio ? <StopCircle size={9} className="animate-pulse" /> : <Camera size={9} />} Record
              </motion.button>
              <motion.button className="flex items-center gap-1 px-2 py-1 rounded-lg cursor-pointer text-[7px]"
                style={{ background: 'rgba(96,165,250,0.06)', border: '1px solid rgba(96,165,250,0.12)', color: '#60A5FA' }}
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                onClick={() => setAiGenOpen(!aiGenOpen)} data-testid="ai-gen-btn">
                {generating ? <Loader2 size={9} className="animate-spin" /> : <Cpu size={9} />} AI Gen
              </motion.button>
            </div>
          </div>

          {/* Collapsible panels */}
          <AnimatePresence>
            {suanpanOpen && (
              <motion.div className="border-b overflow-hidden"
                style={{ borderColor: 'rgba(248,250,252,0.03)', background: 'rgba(234,179,8,0.015)' }}
                initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
                <SuanpanSource onFrequencySet={addSuanpanTrack} color="#EAB308" />
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {sourcesOpen && (
              <motion.div className="border-b overflow-hidden"
                style={{ borderColor: 'rgba(248,250,252,0.03)', background: 'rgba(248,250,252,0.008)' }}
                initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
                <div className="p-3 max-h-44 overflow-y-auto">
                  <p className="text-[7px] tracking-wider uppercase mb-2" style={{ color: 'rgba(248,250,252,0.15)' }}>Track Sources</p>
                  <div className="grid grid-cols-3 gap-1">
                    {sources.map(s => {
                      const m = TRACK_TYPE_META[s.type] || TRACK_TYPE_META.custom;
                      return (
                        <motion.button key={s.id}
                          className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-left cursor-pointer"
                          style={{
                            background: s.locked ? 'rgba(248,250,252,0.008)' : `${m.color}05`,
                            border: `1px solid ${s.locked ? 'rgba(248,250,252,0.03)' : `${m.color}10`}`,
                            opacity: s.locked ? 0.45 : 1,
                          }}
                          whileHover={s.locked ? {} : { scale: 1.02 }} whileTap={s.locked ? {} : { scale: 0.98 }}
                          onClick={() => addTrack(s)} data-testid={`source-${s.id}`}>
                          {s.locked ? <Lock size={8} style={{ color: 'rgba(248,250,252,0.15)' }} />
                            : <m.icon size={8} style={{ color: m.color }} />}
                          <span className="text-[7px] truncate" style={{ color: s.locked ? 'rgba(248,250,252,0.15)' : 'rgba(255,255,255,0.75)' }}>
                            {s.label}
                          </span>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {packsOpen && (
              <motion.div className="border-b overflow-hidden"
                style={{ borderColor: 'rgba(248,250,252,0.03)', background: 'rgba(244,114,182,0.01)' }}
                initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
                <div className="p-3 max-h-60 overflow-y-auto">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[7px] tracking-wider uppercase" style={{ color: 'rgba(248,250,252,0.15)' }}>
                      Bonus Wrapped Packs
                    </p>
                    <p className="text-[7px] font-mono" style={{ color: '#F472B6' }}>
                      Purchases grant permanent speed bonuses
                    </p>
                  </div>
                  {bonusPacks.map(p => (
                    <BonusPackCard key={p.id} pack={p}
                      onPurchase={purchasePack}
                      purchasing={purchasingPack === p.id} />
                  ))}
                  {recommendations.length > 0 && (
                    <div className="mt-3 pt-3 border-t" style={{ borderColor: 'rgba(248,250,252,0.04)' }}>
                      <div className="flex items-center gap-1.5 mb-2">
                        <Compass size={9} style={{ color: hexagramInfo ? '#C084FC' : 'rgba(255,255,255,0.6)' }} />
                        <p className="text-[7px] tracking-wider uppercase" style={{ color: 'rgba(248,250,252,0.15)' }}>
                          Hexagram Recommendations
                        </p>
                        {hexagramInfo && (
                          <span className="text-[6px] px-1 py-0.5 rounded-full font-mono"
                            style={{ background: 'rgba(192,132,252,0.08)', color: '#C084FC' }}>
                            #{hexagramInfo.number} {hexagramInfo.chinese}
                          </span>
                        )}
                      </div>
                      {hexagramInfo && (
                        <p className="text-[7px] mb-2" style={{ color: 'rgba(255,255,255,0.6)' }}>
                          Lower: {hexagramInfo.lower_trigram?.name} ({hexagramInfo.lower_trigram?.quality}) &middot;
                          Upper: {hexagramInfo.upper_trigram?.name} ({hexagramInfo.upper_trigram?.quality})
                        </p>
                      )}
                      {recommendations.map((rec, i) => (
                        <RecommendationCard key={`rec-${i}`} rec={rec}
                          onPurchase={purchasePack}
                          purchasing={purchasingPack === rec.pack_id} />
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Auto-Compose DJ Panel */}
          <AnimatePresence>
            {autoComposeOpen && (
              <motion.div className="border-b overflow-hidden"
                style={{ borderColor: 'rgba(248,250,252,0.03)', background: 'rgba(192,132,252,0.015)' }}
                initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
                <div className="p-3" data-testid="auto-compose-panel">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5">
                      <Wand2 size={10} style={{ color: '#C084FC' }} />
                      <p className="text-[8px] tracking-wider uppercase font-medium" style={{ color: '#C084FC' }}>
                        Mantra DJ Auto-Compose
                      </p>
                    </div>
                    <p className="text-[6px]" style={{ color: 'rgba(255,255,255,0.6)' }}>
                      {aiCredits} AI credits remaining
                    </p>
                  </div>
                  <p className="text-[7px] mb-3" style={{ color: 'rgba(255,255,255,0.6)' }}>
                    Select a wellness goal. The DJ will arrange frequencies, mantras, and ambience with intelligent cross-fading.
                  </p>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(composeGoals.length > 0 ? composeGoals : [
                      { key: 'deep_sleep', label: 'Deep Sleep', description: 'Delta & theta waves' },
                      { key: 'focus', label: 'Laser Focus', description: 'Alpha-beta entrainment' },
                      { key: 'energy', label: 'Energy Surge', description: 'High-frequency activation' },
                      { key: 'healing', label: 'Sacred Healing', description: 'Solfeggio cascade' },
                      { key: 'meditation', label: 'Deep Meditation', description: 'Theta-alpha bridge' },
                      { key: 'grounding', label: 'Earth Grounding', description: 'Sub-bass resonance' },
                    ]).map(g => {
                      const icons = { deep_sleep: Moon, focus: Brain, energy: Sun, healing: Heart, meditation: Sparkles, grounding: Anchor };
                      const GoalIcon = icons[g.key] || Wand2;
                      const colors = { deep_sleep: '#818CF8', focus: '#60A5FA', energy: '#EAB308', healing: '#22C55E', meditation: '#C084FC', grounding: '#FB923C' };
                      const c = colors[g.key] || '#C084FC';
                      return (
                        <motion.button key={g.key}
                          className="flex flex-col items-center gap-1 px-2 py-2.5 rounded-xl cursor-pointer"
                          style={{ background: `${c}06`, border: `1px solid ${c}15` }}
                          whileHover={{ scale: 1.04, borderColor: `${c}30` }}
                          whileTap={{ scale: 0.96 }}
                          onClick={() => handleAutoCompose(g.key)}
                          disabled={composing || aiCredits <= 0}
                          data-testid={`compose-goal-${g.key}`}>
                          {composing ? <Loader2 size={14} className="animate-spin" style={{ color: c }} />
                            : <GoalIcon size={14} style={{ color: c }} />}
                          <span className="text-[8px] font-medium" style={{ color: c }}>{g.label}</span>
                          <span className="text-[5px] text-center leading-tight" style={{ color: 'rgba(255,255,255,0.6)' }}>
                            {g.description}
                          </span>
                        </motion.button>
                      );
                    })}
                  </div>
                  {aiCredits <= 0 && (
                    <p className="text-[7px] text-center mt-2" style={{ color: '#EF4444' }}>
                      No AI credits remaining. Upgrade your tier for more.
                    </p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Templates Panel */}
          <AnimatePresence>
            {templatesOpen && (
              <motion.div className="border-b overflow-hidden"
                style={{ borderColor: 'rgba(248,250,252,0.03)', background: 'rgba(251,191,36,0.01)' }}
                initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
                <div className="p-3" data-testid="templates-panel">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5">
                      <Layout size={10} style={{ color: '#FBBF24' }} />
                      <p className="text-[8px] tracking-wider uppercase font-medium" style={{ color: '#FBBF24' }}>Mix Templates</p>
                    </div>
                    <p className="text-[6px]" style={{ color: 'rgba(255,255,255,0.6)' }}>{templates.filter(t => !t.locked).length}/{templates.length} available</p>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5 max-h-48 overflow-y-auto">
                    {templates.map(tpl => {
                      const tierColors = { discovery: '#22C55E', player: '#3B82F6', ultra_player: '#A78BFA', sovereign: '#FBBF24' };
                      const tierLabels = { discovery: 'Free', player: 'Player', ultra_player: 'Ultra', sovereign: 'Sovereign' };
                      return (
                        <motion.button key={tpl.id}
                          className="flex flex-col p-2 rounded-xl cursor-pointer text-left relative"
                          style={{ background: `${tpl.color}08`, border: `1px solid ${tpl.color}15`, opacity: tpl.locked ? 0.4 : 1 }}
                          whileHover={!tpl.locked ? { scale: 1.03, borderColor: `${tpl.color}30` } : {}}
                          whileTap={!tpl.locked ? { scale: 0.97 } : {}}
                          onClick={() => !tpl.locked ? handleApplyTemplate(tpl.id) : toast.error(`Requires ${tierLabels[tpl.tier]} tier`)}
                          data-testid={`template-${tpl.id}`}>
                          {tpl.locked && <Lock size={10} className="absolute top-1.5 right-1.5" style={{ color: 'var(--text-muted)' }} />}
                          <span className="text-[8px] font-semibold mb-0.5" style={{ color: tpl.color }}>{tpl.name}</span>
                          <span className="text-[6px] mb-1 leading-tight" style={{ color: 'rgba(255,255,255,0.6)' }}>{tpl.description}</span>
                          <div className="flex items-center gap-1 mt-auto">
                            <span className="text-[6px] px-1 py-0.5 rounded" style={{ background: `${tierColors[tpl.tier]}15`, color: tierColors[tpl.tier] }}>{tierLabels[tpl.tier]}</span>
                            <span className="text-[6px]" style={{ color: 'rgba(248,250,252,0.15)' }}>{tpl.duration_minutes}m - {tpl.track_count} tracks</span>
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Recording Panel */}
          <AnimatePresence>
            {mediaOpen && recordingConfig && (
              <motion.div className="border-b overflow-hidden"
                style={{ borderColor: 'rgba(248,250,252,0.03)', background: 'rgba(239,68,68,0.01)' }}
                initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
                <div className="p-3" data-testid="recording-panel">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5">
                      <Camera size={10} style={{ color: '#FB7185' }} />
                      <p className="text-[8px] tracking-wider uppercase font-medium" style={{ color: '#FB7185' }}>Record Media</p>
                    </div>
                    <span className="text-[6px] px-1.5 py-0.5 rounded" style={{ background: 'rgba(251,191,36,0.1)', color: '#FBBF24' }}>{recordingConfig.tier}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <div className="p-2 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <Camera size={11} style={{ color: '#F472B6' }} />
                        <span className="text-[8px] font-semibold" style={{ color: '#F472B6' }}>Camera</span>
                      </div>
                      <div className="space-y-0.5 mb-2">
                        <p className="text-[7px]" style={{ color: 'rgba(255,255,255,0.6)' }}>Resolution: <span style={{ color: '#F472B6' }}>{recordingConfig.video?.res_label}</span></p>
                        <p className="text-[7px]" style={{ color: 'rgba(255,255,255,0.6)' }}>FPS: <span style={{ color: '#F472B6' }}>{recordingConfig.video?.max_fps}</span></p>
                        <p className="text-[7px]" style={{ color: 'rgba(255,255,255,0.6)' }}>Bitrate: <span style={{ color: '#F472B6' }}>{recordingConfig.video?.bitrate_label}</span></p>
                        <p className="text-[7px]" style={{ color: 'rgba(255,255,255,0.6)' }}>Max: <span style={{ color: '#F472B6' }}>{Math.round(recordingConfig.video?.max_duration_sec / 60)}min</span></p>
                      </div>
                      {isRecordingVideo ? (
                        <motion.button className="w-full flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg text-[8px] cursor-pointer"
                          style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#EF4444' }}
                          animate={{ opacity: [1, 0.5, 1] }} transition={{ repeat: Infinity, duration: 1 }}
                          onClick={handleStopRecording} data-testid="stop-video-btn">
                          <StopCircle size={10} /> Stop Recording
                        </motion.button>
                      ) : (
                        <motion.button className="w-full flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg text-[8px] cursor-pointer"
                          style={{ background: 'rgba(244,114,182,0.08)', border: '1px solid rgba(244,114,182,0.15)', color: '#F472B6' }}
                          whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                          onClick={() => handleStartRecording('video')} data-testid="start-video-btn">
                          <Circle size={10} /> Start Camera
                        </motion.button>
                      )}
                    </div>
                    <div className="p-2 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <Mic size={11} style={{ color: '#2DD4BF' }} />
                        <span className="text-[8px] font-semibold" style={{ color: '#2DD4BF' }}>Microphone</span>
                      </div>
                      <div className="space-y-0.5 mb-2">
                        <p className="text-[7px]" style={{ color: 'rgba(255,255,255,0.6)' }}>Quality: <span style={{ color: '#2DD4BF' }}>{recordingConfig.audio?.sample_label}</span></p>
                        <p className="text-[7px]" style={{ color: 'rgba(255,255,255,0.6)' }}>Channels: <span style={{ color: '#2DD4BF' }}>{recordingConfig.audio?.channel_label}</span></p>
                        <p className="text-[7px]" style={{ color: 'rgba(255,255,255,0.6)' }}>Depth: <span style={{ color: '#2DD4BF' }}>{recordingConfig.audio?.bit_depth}-bit</span></p>
                        <p className="text-[7px]" style={{ color: 'rgba(255,255,255,0.6)' }}>Max: <span style={{ color: '#2DD4BF' }}>{Math.round(recordingConfig.audio?.max_duration_sec / 60)}min</span></p>
                      </div>
                      {isRecordingAudio ? (
                        <motion.button className="w-full flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg text-[8px] cursor-pointer"
                          style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#EF4444' }}
                          animate={{ opacity: [1, 0.5, 1] }} transition={{ repeat: Infinity, duration: 1 }}
                          onClick={handleStopRecording} data-testid="stop-audio-btn">
                          <StopCircle size={10} /> Stop Recording
                        </motion.button>
                      ) : (
                        <motion.button className="w-full flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg text-[8px] cursor-pointer"
                          style={{ background: 'rgba(45,212,191,0.08)', border: '1px solid rgba(45,212,191,0.15)', color: '#2DD4BF' }}
                          whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                          onClick={() => handleStartRecording('audio')} data-testid="start-audio-btn">
                          <Circle size={10} /> Start Mic
                        </motion.button>
                      )}
                    </div>
                  </div>
                  <div className="rounded-lg p-2" style={{ background: 'rgba(255,255,255,0.015)' }}>
                    <p className="text-[7px] mb-1.5 font-medium" style={{ color: 'rgba(255,255,255,0.65)' }}>Recording Quality by Tier</p>
                    <div className="grid grid-cols-4 gap-1">
                      {['discovery', 'player', 'ultra_player', 'sovereign'].map(t => {
                        const v = recordingConfig.all_video_tiers?.[t] || {};
                        const a = recordingConfig.all_audio_tiers?.[t] || {};
                        const tierColors = { discovery: '#22C55E', player: '#3B82F6', ultra_player: '#A78BFA', sovereign: '#FBBF24' };
                        const active = t === recordingConfig.tier;
                        return (
                          <div key={t} className="p-1.5 rounded-lg" style={{
                            background: active ? `${tierColors[t]}10` : 'transparent',
                            border: `1px solid ${active ? tierColors[t] + '30' : 'rgba(255,255,255,0.03)'}`,
                          }}>
                            <p className="text-[6px] font-bold mb-0.5" style={{ color: tierColors[t] }}>{v.label || t}</p>
                            <p className="text-[5px]" style={{ color: 'rgba(255,255,255,0.6)' }}>{v.res_label} {v.max_fps}fps</p>
                            <p className="text-[5px]" style={{ color: 'rgba(255,255,255,0.6)' }}>{a.sample_label} {a.channel_label}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* AI Generation Panel */}
          <AnimatePresence>
            {aiGenOpen && aiCapabilities && (
              <motion.div className="border-b overflow-hidden"
                style={{ borderColor: 'rgba(248,250,252,0.03)', background: 'rgba(96,165,250,0.01)' }}
                initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
                <div className="p-3" data-testid="ai-gen-panel">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5">
                      <Cpu size={10} style={{ color: '#60A5FA' }} />
                      <p className="text-[8px] tracking-wider uppercase font-medium" style={{ color: '#60A5FA' }}>AI Mix Generator</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[6px]" style={{ color: 'rgba(255,255,255,0.6)' }}>
                        {aiCapabilities.credits_remaining} credits - {aiCapabilities.capabilities?.credits_per_mix}/mix
                      </span>
                      <span className="text-[6px] px-1 py-0.5 rounded" style={{ background: 'rgba(96,165,250,0.1)', color: '#60A5FA' }}>
                        {aiCapabilities.capabilities?.label}
                      </span>
                    </div>
                  </div>
                  <p className="text-[7px] mb-2" style={{ color: 'rgba(255,255,255,0.6)' }}>
                    {aiCapabilities.capabilities?.description}. Max {aiCapabilities.capabilities?.max_tracks_gen} tracks.
                  </p>
                  <div className="flex gap-1.5 mb-2">
                    <input value={aiPrompt} onChange={e => setAiPrompt(e.target.value)}
                      placeholder="e.g. Deep forest meditation with flowing water..."
                      className="flex-1 px-2 py-1.5 rounded-lg text-[8px] outline-none"
                      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', color: '#F8FAFC' }}
                      data-testid="ai-prompt-input" />
                    <select value={aiDuration} onChange={e => setAiDuration(parseInt(e.target.value))}
                      className="px-2 py-1.5 rounded-lg text-[8px] outline-none cursor-pointer"
                      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', color: '#F8FAFC' }}
                      data-testid="ai-duration-select">
                      <option value={5}>5 min</option>
                      <option value={10}>10 min</option>
                      <option value={20}>20 min</option>
                      <option value={30}>30 min</option>
                      <option value={45}>45 min</option>
                      <option value={60}>60 min</option>
                    </select>
                  </div>
                  <div className="flex gap-1.5">
                    <motion.button className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg text-[8px] cursor-pointer"
                      style={{ background: 'rgba(96,165,250,0.1)', border: '1px solid rgba(96,165,250,0.2)', color: '#60A5FA' }}
                      whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                      onClick={handleAiGenerate} disabled={generating || aiCapabilities.credits_remaining < (aiCapabilities.capabilities?.credits_per_mix || 1)}
                      data-testid="ai-generate-btn">
                      {generating ? <Loader2 size={10} className="animate-spin" /> : <Cpu size={10} />}
                      {generating ? 'Generating...' : 'Generate Mix'}
                    </motion.button>
                    {aiCapabilities.capabilities?.video_gen && (
                      <span className="flex items-center gap-0.5 px-2 py-1 rounded-lg text-[7px]"
                        style={{ background: 'rgba(168,139,250,0.08)', color: '#A78BFA' }}>
                        <Camera size={8} /> Video Gen Available
                      </span>
                    )}
                  </div>
                  <div className="mt-2 rounded-lg p-2" style={{ background: 'rgba(255,255,255,0.015)' }}>
                    <p className="text-[7px] mb-1.5 font-medium" style={{ color: 'rgba(255,255,255,0.65)' }}>AI by Tier</p>
                    <div className="grid grid-cols-4 gap-1">
                      {['discovery', 'player', 'ultra_player', 'sovereign'].map(t => {
                        const ai = aiCapabilities.all_tiers?.[t] || {};
                        const tierColors = { discovery: '#22C55E', player: '#3B82F6', ultra_player: '#A78BFA', sovereign: '#FBBF24' };
                        const active = t === aiCapabilities.tier;
                        return (
                          <div key={t} className="p-1.5 rounded-lg" style={{
                            background: active ? `${tierColors[t]}10` : 'transparent',
                            border: `1px solid ${active ? tierColors[t] + '30' : 'rgba(255,255,255,0.03)'}`,
                          }}>
                            <p className="text-[6px] font-bold mb-0.5" style={{ color: tierColors[t] }}>{ai.label || t}</p>
                            <p className="text-[5px]" style={{ color: 'rgba(255,255,255,0.6)' }}>Max {ai.max_tracks_gen} trks</p>
                            <p className="text-[5px]" style={{ color: 'rgba(255,255,255,0.6)' }}>
                              {ai.video_gen ? 'Video' : '-'} {ai.voice_clone ? '+ Voice' : ''}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Timeline ruler */}
          {tracks.length > 0 && (
            <div className="px-4 pt-1 pb-0">
              <div className="flex items-center h-4 relative" style={{ background: 'rgba(248,250,252,0.01)' }}>
                {Array.from({ length: Math.ceil(totalDuration / 15) + 1 }).map((_, i) => {
                  const t = i * 15;
                  const pct = totalDuration > 0 ? (t / totalDuration) * 100 : 0;
                  return (
                    <div key={i} className="absolute flex flex-col items-center" style={{ left: `${pct}%` }}>
                      <div className="w-[1px] h-2" style={{ background: 'rgba(248,250,252,0.06)' }} />
                      <span className="text-[5px] font-mono" style={{ color: 'rgba(248,250,252,0.12)' }}>
                        {t}s
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Track list */}
          <div className="flex-1 overflow-y-auto px-4 py-2">
            <AnimatePresence>
              {tracks.map((t, i) => (
                <TrackRow key={`t-${i}-${t.source_label}`} track={t} index={i}
                  onUpdate={updateTrack} onRemove={removeTrack} isGhost={false}
                  showKeyframes={keyframesEnabled} onRipple={handleRipple}
                  totalDuration={totalDuration} isRippling={ripplingIndices.includes(i)} />
              ))}
            </AnimatePresence>

            {tierConfig?.shadow_tracks && ghostTracks.length > 0 && (
              <div className="mt-3">
                <p className="text-[6px] tracking-wider uppercase mb-1" style={{ color: 'rgba(248,250,252,0.1)' }}>
                  Unlock with upgrade
                </p>
                {ghostTracks.map((gt, i) => (
                  <TrackRow key={`g-${i}`} track={gt} index={tracks.length + i}
                    onUpdate={() => {}} onRemove={() => {}} isGhost={true}
                    onGhostClick={() => setShowSpeedBridge(true)} />
                ))}
              </div>
            )}

            {tracks.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Layers size={24} style={{ color: 'rgba(248,250,252,0.06)' }} />
                <p className="text-[10px] mt-3" style={{ color: 'rgba(248,250,252,0.15)' }}>No tracks yet</p>
                <p className="text-[8px] mt-1 max-w-xs" style={{ color: 'rgba(248,250,252,0.08)' }}>
                  Add tones, mantras, and ambient layers from Sources, the Suanpan abacus, or Bonus Packs.
                </p>
                <div className="flex gap-2 mt-4">
                  <motion.button className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[8px] cursor-pointer"
                    style={{ background: `${tierColor}08`, border: `1px solid ${tierColor}15`, color: tierColor }}
                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    onClick={() => setSourcesOpen(true)}>
                    <Plus size={9} /> Sources
                  </motion.button>
                  <motion.button className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[8px] cursor-pointer"
                    style={{ background: 'rgba(234,179,8,0.06)', border: '1px solid rgba(234,179,8,0.1)', color: '#EAB308' }}
                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    onClick={() => setSuanpanOpen(true)}>
                    <Sliders size={9} /> Suanpan
                  </motion.button>
                  <motion.button className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[8px] cursor-pointer"
                    style={{ background: 'rgba(244,114,182,0.05)', border: '1px solid rgba(244,114,182,0.1)', color: '#F472B6' }}
                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    onClick={() => setPacksOpen(true)}>
                    <Package size={9} /> Packs
                  </motion.button>
                  <motion.button className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[8px] cursor-pointer"
                    style={{ background: 'rgba(192,132,252,0.06)', border: '1px solid rgba(192,132,252,0.12)', color: '#C084FC' }}
                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    onClick={() => setAutoComposeOpen(true)} data-testid="empty-auto-compose-btn">
                    <Wand2 size={9} /> DJ Auto
                  </motion.button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Projects slide-over */}
      <AnimatePresence>
        {showProjects && (
          <motion.div className="fixed top-0 right-0 h-full z-[10001] w-64 flex flex-col"
            style={{ background: 'rgba(6,6,14,0.97)', backdropFilter: 'none', borderLeft: '1px solid rgba(248,250,252,0.05)' }}
            initial={{ x: 260 }} animate={{ x: 0 }} exit={{ x: 260 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }} data-testid="projects-panel">
            <div className="flex items-center justify-between p-3 border-b" style={{ borderColor: 'rgba(248,250,252,0.05)' }}>
              <p className="text-[9px] font-medium tracking-wider uppercase" style={{ color: 'rgba(255,255,255,0.65)' }}>Projects</p>
              <button className="p-1 rounded" onClick={() => setShowProjects(false)} data-testid="close-projects-btn">
                <X size={11} style={{ color: 'rgba(255,255,255,0.6)' }} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-1">
              {projects.map(p => (
                <motion.button key={p.id} className="w-full text-left px-3 py-2 rounded-lg cursor-pointer"
                  style={{ background: 'rgba(248,250,252,0.015)', border: '1px solid rgba(248,250,252,0.03)' }}
                  whileHover={{ scale: 1.02 }} onClick={() => loadProject(p.id)} data-testid={`project-item-${p.id}`}>
                  <p className="text-[9px] font-medium" style={{ color: 'rgba(255,255,255,0.75)' }}>{p.name}</p>
                  <p className="text-[7px] mt-0.5" style={{ color: 'rgba(248,250,252,0.15)' }}>
                    {p.track_count} tracks &middot; {new Date(p.updated_at).toLocaleDateString()}
                  </p>
                </motion.button>
              ))}
              {projects.length === 0 && <p className="text-[8px] text-center py-6" style={{ color: 'rgba(248,250,252,0.1)' }}>No projects</p>}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Speed Bridge */}
      <AnimatePresence>
        {showSpeedBridge && (
          <SpeedBridgeModal currentTier={subTier} onUpgrade={handleUpgrade} onClose={() => setShowSpeedBridge(false)} />
        )}
      </AnimatePresence>

      {/* Sacred Assembly */}
      <AnimatePresence>
        {showAssembly && (
          <SacredAssemblyLoader delay={matDelay} onComplete={() => setShowAssembly(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}
