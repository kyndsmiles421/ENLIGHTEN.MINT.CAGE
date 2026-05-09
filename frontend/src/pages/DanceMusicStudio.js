import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useSplitScreen, COSMIC_PAIRS } from '../components/SplitScreen';
import {
  Music, Disc3, Play, Square, Circle, Save, Trash2, Download, ArrowLeft,
  Pause, RotateCcw, ChevronRight, Clock, Globe, Sparkles, Layers,
  Volume2, VolumeX, Mic, Search, X, Columns
} from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

// ─── World Instruments with Synthesis Parameters ───
const INSTRUMENTS = [
  // India
  { id: 'sitar', name: 'Sitar', origin: 'India', category: 'Strings', color: '#F59E0B',
    synth: { type: 'custom', wave: 'sawtooth', filter: 'bandpass', filterFreq: 1200, filterQ: 8, attack: 0.02, decay: 0.3, sustain: 0.4, release: 1.2, vibratoRate: 5, vibratoDepth: 8, detune: -5 } },
  { id: 'tabla', name: 'Tabla', origin: 'India', category: 'Percussion', color: '#DC2626',
    synth: { type: 'percussion', wave: 'triangle', filter: 'lowpass', filterFreq: 400, filterQ: 2, attack: 0.001, decay: 0.25, sustain: 0, release: 0.3, pitchDrop: 80 } },
  { id: 'tanpura', name: 'Tanpura', origin: 'India', category: 'Strings', color: '#EA580C',
    synth: { type: 'drone', wave: 'sawtooth', filter: 'bandpass', filterFreq: 600, filterQ: 3, attack: 0.5, decay: 0.2, sustain: 0.8, release: 2, vibratoRate: 2, vibratoDepth: 3 } },
  // Native American
  { id: 'cedar-flute', name: 'Cedar Flute', origin: 'Native American', category: 'Wind', color: '#059669',
    synth: { type: 'custom', wave: 'sine', filter: 'lowpass', filterFreq: 2000, filterQ: 1, attack: 0.15, decay: 0.1, sustain: 0.7, release: 0.8, vibratoRate: 4.5, vibratoDepth: 12, breathNoise: 0.03 } },
  { id: 'native-drum', name: 'Pow Wow Drum', origin: 'Native American', category: 'Percussion', color: '#7C2D12',
    synth: { type: 'percussion', wave: 'sine', filter: 'lowpass', filterFreq: 200, filterQ: 1, attack: 0.001, decay: 0.6, sustain: 0, release: 0.8, pitchDrop: 40 } },
  // Africa
  { id: 'djembe', name: 'Djembe', origin: 'West Africa', category: 'Percussion', color: '#B91C1C',
    synth: { type: 'percussion', wave: 'triangle', filter: 'lowpass', filterFreq: 500, filterQ: 3, attack: 0.001, decay: 0.2, sustain: 0, release: 0.4, pitchDrop: 60 } },
  { id: 'kalimba', name: 'Kalimba', origin: 'Africa', category: 'Strings', color: '#0891B2',
    synth: { type: 'custom', wave: 'sine', filter: 'highpass', filterFreq: 300, filterQ: 1, attack: 0.001, decay: 0.05, sustain: 0.3, release: 2.5, harmonics: [1, 0.5, 0.25] } },
  { id: 'kora', name: 'Kora', origin: 'West Africa', category: 'Strings', color: '#D97706',
    synth: { type: 'custom', wave: 'triangle', filter: 'bandpass', filterFreq: 1500, filterQ: 2, attack: 0.005, decay: 0.1, sustain: 0.3, release: 1.5, vibratoRate: 3, vibratoDepth: 4 } },
  // East Asia
  { id: 'singing-bowl', name: 'Singing Bowl', origin: 'Tibet', category: 'Resonant', color: '#7C3AED',
    synth: { type: 'custom', wave: 'sine', filter: 'bandpass', filterFreq: 800, filterQ: 12, attack: 0.3, decay: 0.1, sustain: 0.9, release: 4, vibratoRate: 1.5, vibratoDepth: 2, harmonics: [1, 0.6, 0.3, 0.15] } },
  { id: 'shamisen', name: 'Shamisen', origin: 'Japan', category: 'Strings', color: '#BE123C',
    synth: { type: 'custom', wave: 'square', filter: 'bandpass', filterFreq: 1000, filterQ: 5, attack: 0.005, decay: 0.15, sustain: 0.2, release: 0.6, vibratoRate: 6, vibratoDepth: 5 } },
  { id: 'erhu', name: 'Erhu', origin: 'China', category: 'Strings', color: '#E11D48',
    synth: { type: 'custom', wave: 'sawtooth', filter: 'lowpass', filterFreq: 2500, filterQ: 4, attack: 0.08, decay: 0.05, sustain: 0.7, release: 0.5, vibratoRate: 5.5, vibratoDepth: 15 } },
  // Middle East
  { id: 'oud', name: 'Oud', origin: 'Middle East', category: 'Strings', color: '#92400E',
    synth: { type: 'custom', wave: 'triangle', filter: 'bandpass', filterFreq: 900, filterQ: 3, attack: 0.01, decay: 0.2, sustain: 0.35, release: 1.0, vibratoRate: 4, vibratoDepth: 6 } },
  { id: 'darbuka', name: 'Darbuka', origin: 'Middle East', category: 'Percussion', color: '#A16207',
    synth: { type: 'percussion', wave: 'triangle', filter: 'bandpass', filterFreq: 700, filterQ: 5, attack: 0.001, decay: 0.15, sustain: 0, release: 0.3, pitchDrop: 100 } },
  // Global
  { id: 'didgeridoo', name: 'Didgeridoo', origin: 'Australia', category: 'Wind', color: '#78350F',
    synth: { type: 'drone', wave: 'sawtooth', filter: 'lowpass', filterFreq: 300, filterQ: 6, attack: 0.3, decay: 0.1, sustain: 0.9, release: 1.5, vibratoRate: 2, vibratoDepth: 5, detune: -1200 } },
  { id: 'pan-flute', name: 'Pan Flute', origin: 'Andes', category: 'Wind', color: '#065F46',
    synth: { type: 'custom', wave: 'sine', filter: 'lowpass', filterFreq: 3000, filterQ: 0.5, attack: 0.1, decay: 0.05, sustain: 0.6, release: 0.4, breathNoise: 0.05, vibratoRate: 5, vibratoDepth: 8 } },
  { id: 'hang-drum', name: 'Hang Drum', origin: 'Switzerland', category: 'Resonant', color: '#4338CA',
    synth: { type: 'custom', wave: 'sine', filter: 'bandpass', filterFreq: 600, filterQ: 8, attack: 0.002, decay: 0.08, sustain: 0.5, release: 3, harmonics: [1, 0.4, 0.2] } },
  { id: 'rain-stick', name: 'Rain Stick', origin: 'South America', category: 'Resonant', color: '#0E7490',
    synth: { type: 'noise', filter: 'bandpass', filterFreq: 3000, filterQ: 2, attack: 0.5, decay: 0.3, sustain: 0.4, release: 2 } },
];

const SCALES = {
  pentatonic: { name: 'Pentatonic', intervals: [0, 2, 4, 7, 9] },
  raga_yaman: { name: 'Raga Yaman', intervals: [0, 2, 4, 6, 7, 9, 11] },
  arabic: { name: 'Arabic Maqam', intervals: [0, 1, 4, 5, 7, 8, 11] },
  japanese: { name: 'Japanese In', intervals: [0, 1, 5, 7, 8] },
  blues: { name: 'Blues', intervals: [0, 3, 5, 6, 7, 10] },
  chromatic: { name: 'Chromatic', intervals: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] },
};

// ─── Spiritual Dances ───
const DANCES = [
  {
    id: 'sufi-whirling', name: 'Sufi Whirling (Sema)', origin: 'Turkey / Persia',
    tradition: 'Sufism', color: '#7C3AED',
    description: 'The Mevlevi Order\'s sacred spinning ceremony, where dervishes whirl in ecstatic meditation. The right hand reaches to the sky to receive divine grace, while the left hand points to the earth to channel it. The turning represents the soul\'s mystical journey toward truth and perfection.',
    movements: ['Standing meditation', 'Slow rotation beginning', 'Arms extend outward', 'Accelerating whirl', 'Right palm up, left palm down', 'Eyes half-closed in divine union', 'Gradual slowing', 'Prostration in gratitude'],
    music: 'Ney flute, rebab, kudüm drums',
    significance: 'Union with the Divine through sacred movement',
  },
  {
    id: 'bharatanatyam', name: 'Bharatanatyam', origin: 'Tamil Nadu, India',
    tradition: 'Hindu Temple Dance', color: '#DC2626',
    description: 'One of the oldest classical dance forms, originally performed in Hindu temples as a devotional offering. Every gesture (mudra), expression (abhinaya), and footwork pattern carries spiritual meaning, telling stories of gods, cosmic cycles, and spiritual truths.',
    movements: ['Aramandi (half-sitting position)', 'Nritta (pure rhythmic dance)', 'Mudra hand gestures', 'Adavu footwork patterns', 'Facial expressions (Nava Rasa)', 'Temple bell ankle movements', 'Cosmic wheel turns'],
    music: 'Mridangam, veena, nattuvangam',
    significance: 'Devotional expression through sacred geometry of the body',
  },
  {
    id: 'powwow', name: 'Pow Wow Dance', origin: 'North America',
    tradition: 'Native American', color: '#059669',
    description: 'Sacred ceremonial gatherings honoring Native traditions through dance, song, and community. Each style—Fancy Dance, Jingle Dress, Grass Dance, Traditional—carries specific spiritual medicine and prayers. The drumbeat represents the heartbeat of Mother Earth.',
    movements: ['Grand Entry procession', 'Traditional stomp', 'Fancy footwork', 'Jingle dress ceremonial steps', 'Grass dance flowing movements', 'Eagle feather gestures', 'Honor beats', 'Closing circle'],
    music: 'Pow wow drum, voice chanting, rattles',
    significance: 'Honoring ancestors and connecting with Mother Earth',
  },
  {
    id: 'capoeira', name: 'Capoeira', origin: 'Brazil / West Africa',
    tradition: 'Afro-Brazilian', color: '#F59E0B',
    description: 'A martial art disguised as dance, created by enslaved Africans in Brazil. Practiced in a roda (circle), it combines acrobatics, music, and spiritual elements from Candomblé. The ginga (swaying) represents the constant flow of energy and resistance.',
    movements: ['Ginga (base sway)', 'Au (cartwheel)', 'Meia lua (half moon kick)', 'Negativa (low escape)', 'Roda circle formation', 'Berimbau rhythm response', 'Volta ao mundo'],
    music: 'Berimbau, atabaque, pandeiro, agogô',
    significance: 'Freedom, resistance, and ancestral spiritual connection',
  },
  {
    id: 'butoh', name: 'Butoh', origin: 'Japan',
    tradition: 'Post-war Avant-garde', color: '#6B7280',
    description: 'Born from the ashes of post-WWII Japan, Butoh explores darkness, transformation, and the primordial body. Dancers often paint themselves white and move with extreme slowness or sudden bursts, channeling states between life and death, human and nature.',
    movements: ['White body preparation', 'Extreme slow motion walking', 'Flower seed germination', 'Decay and decomposition', 'Insect transformation', 'Wind-blown emptiness', 'Ancestral memory recall'],
    music: 'Ambient soundscapes, silence, experimental',
    significance: 'Confronting darkness to find transformation and rebirth',
  },
  {
    id: 'ecstatic-dance', name: 'Ecstatic Dance', origin: 'Global',
    tradition: 'Neo-Shamanic / Conscious Movement', color: '#C084FC',
    description: 'A free-form, substance-free practice where participants dance without choreography, conversation, or shoes. Guided by a DJ or live musicians through a wave of energy—from gentle to peak intensity and back. Roots in 5Rhythms, Gabrielle Roth, and shamanic traditions.',
    movements: ['Arriving stillness', 'Flowing warm-up', 'Staccato sharp movements', 'Chaos wild expression', 'Lyrical lightness', 'Stillness integration', 'Contact improvisation'],
    music: 'World bass, tribal beats, ambient, silence',
    significance: 'Liberation through uninhibited movement meditation',
  },
  {
    id: 'kecak', name: 'Kecak Fire Dance', origin: 'Bali, Indonesia',
    tradition: 'Hindu-Balinese', color: '#EA580C',
    description: 'A mesmerizing ceremony where 50-100 men sit in concentric circles, chanting "cak-cak-cak" in interlocking rhythms while enacting the Ramayana epic. Performed at sunset around a fire, it originated from the trance ritual Sanghyang.',
    movements: ['Circular formation', 'Synchronized arm waves', 'Rhythmic chanting (cak-cak)', 'Trance induction', 'Fire dance leaping', 'Story enactment', 'Mass rhythm crescendo'],
    music: 'Human voice choir only (no instruments)',
    significance: 'Communal trance and divine storytelling through rhythm',
  },
  {
    id: 'dervish-zikr', name: 'Dhikr / Zikr', origin: 'Islamic World',
    tradition: 'Sufism', color: '#0891B2',
    description: 'Rhythmic remembrance of God through repetitive chanting, breathing, and swaying. Communities gather in circles, synchronizing breath and movement as they repeat sacred names. The practice induces states of divine ecstasy (wajd) and spiritual presence.',
    movements: ['Standing circle formation', 'Rhythmic head turning', 'Synchronized breathing', 'Swaying acceleration', 'Chest percussion', 'Ecstatic shaking', 'Collective stillness'],
    music: 'Voice chanting, frame drum, ney flute',
    significance: 'Remembrance of the Divine through rhythm and breath',
  },
];

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export default function DanceMusicStudio() {
  useEffect(() => { if (typeof window.__workAccrue === 'function') window.__workAccrue('dance_music', 8); }, []);

  const { user, authHeaders } = useAuth();
  const splitScreen = useSplitScreen();
  const [activeTab, setActiveTab] = useState('instruments');
  const [selectedInstrument, setSelectedInstrument] = useState(INSTRUMENTS[0]);
  const [selectedScale, setSelectedScale] = useState('pentatonic');
  const [baseOctave, setBaseOctave] = useState(4);
  const [volume, setVolume] = useState(0.7);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedNotes, setRecordedNotes] = useState([]);
  const [recordings, setRecordings] = useState([]);
  const [playingRecording, setPlayingRecording] = useState(null);
  const [selectedDance, setSelectedDance] = useState(null);
  const [activePads, setActivePads] = useState({});

  const audioCtxRef = useRef(null);
  const recordStartRef = useRef(null);
  const playTimeoutsRef = useRef([]);

  useEffect(() => {
    if (authHeaders) {
      axios.get(`${API}/music/recordings`, { headers: authHeaders })
        .then(r => setRecordings(r.data.recordings || []))
        .catch(() => {});
    }
    return () => {
      playTimeoutsRef.current.forEach(clearTimeout);
      if (audioCtxRef.current) audioCtxRef.current.close();
    };
  }, [authHeaders]);

  const getAudioCtx = useCallback(() => {
    if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') {
      audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  }, []);

  // ─── Synthesis Engine ───
  const playNote = useCallback((noteIndex, freq) => {
    const ctx = getAudioCtx();
    const inst = selectedInstrument;
    const s = inst.synth;
    const now = ctx.currentTime;

    const masterGain = ctx.createGain();
    masterGain.gain.value = volume;
    masterGain.connect(ctx.destination);

    if (s.type === 'noise') {
      // Noise-based (rain stick)
      const bufferSize = ctx.sampleRate * (s.attack + s.decay + s.sustain + s.release);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * 0.3;
      const src = ctx.createBufferSource();
      src.buffer = buffer;
      const filter = ctx.createBiquadFilter();
      filter.type = s.filter;
      filter.frequency.value = s.filterFreq;
      filter.Q.value = s.filterQ;
      const env = ctx.createGain();
      env.gain.setValueAtTime(0, now);
      env.gain.linearRampToValueAtTime(0.5, now + s.attack);
      env.gain.linearRampToValueAtTime(0.2, now + s.attack + s.decay);
      env.gain.linearRampToValueAtTime(0, now + s.attack + s.decay + s.release);
      src.connect(filter);
      filter.connect(env);
      env.connect(masterGain);
      src.start(now);
      src.stop(now + s.attack + s.decay + s.release + 0.1);
      return;
    }

    // Create oscillator(s)
    const oscs = [];
    const harmonics = s.harmonics || [1];

    harmonics.forEach((amp, i) => {
      const osc = ctx.createOscillator();
      osc.type = s.wave;
      osc.frequency.value = freq * (i + 1);
      if (s.detune) osc.detune.value = s.detune;

      const oscGain = ctx.createGain();
      oscGain.gain.value = amp;

      osc.connect(oscGain);
      oscs.push({ osc, gain: oscGain, output: oscGain });
    });

    // Filter
    const filter = ctx.createBiquadFilter();
    filter.type = s.filter;
    filter.frequency.value = s.filterFreq;
    filter.Q.value = s.filterQ;

    // Envelope
    const envelope = ctx.createGain();
    envelope.gain.setValueAtTime(0, now);
    envelope.gain.linearRampToValueAtTime(1, now + s.attack);
    envelope.gain.linearRampToValueAtTime(s.sustain, now + s.attack + s.decay);
    envelope.gain.linearRampToValueAtTime(0, now + s.attack + s.decay + s.release);

    // Connect
    oscs.forEach(o => o.output.connect(filter));
    filter.connect(envelope);
    envelope.connect(masterGain);

    // Vibrato
    if (s.vibratoRate && s.vibratoDepth) {
      const lfo = ctx.createOscillator();
      lfo.type = 'sine';
      lfo.frequency.value = s.vibratoRate;
      const lfoGain = ctx.createGain();
      lfoGain.gain.value = s.vibratoDepth;
      lfo.connect(lfoGain);
      oscs.forEach(o => lfoGain.connect(o.osc.frequency));
      lfo.start(now);
      lfo.stop(now + s.attack + s.decay + s.release + 0.2);
    }

    // Percussion pitch drop
    if (s.type === 'percussion' && s.pitchDrop) {
      oscs.forEach(o => {
        o.osc.frequency.setValueAtTime(freq + s.pitchDrop, now);
        o.osc.frequency.exponentialRampToValueAtTime(freq, now + 0.15);
      });
    }

    // Breath noise for wind instruments
    if (s.breathNoise) {
      const noiseLen = ctx.sampleRate * 0.5;
      const noiseBuf = ctx.createBuffer(1, noiseLen, ctx.sampleRate);
      const nd = noiseBuf.getChannelData(0);
      for (let i = 0; i < noiseLen; i++) nd[i] = (Math.random() * 2 - 1) * s.breathNoise;
      const noiseSrc = ctx.createBufferSource();
      noiseSrc.buffer = noiseBuf;
      const noiseFilter = ctx.createBiquadFilter();
      noiseFilter.type = 'highpass';
      noiseFilter.frequency.value = 2000;
      noiseSrc.connect(noiseFilter);
      noiseFilter.connect(envelope);
      noiseSrc.start(now);
      noiseSrc.stop(now + 0.5);
    }

    // Start and stop
    const stopTime = now + s.attack + s.decay + s.release + 0.2;
    oscs.forEach(o => { o.osc.start(now); o.osc.stop(stopTime); });

    // Record
    if (isRecording) {
      const elapsed = (Date.now() - recordStartRef.current) / 1000;
      setRecordedNotes(prev => [...prev, { noteIndex, freq, time: elapsed }]);
    }

    // Visual feedback
    setActivePads(prev => ({ ...prev, [noteIndex]: true }));
    setTimeout(() => setActivePads(prev => { const n = { ...prev }; delete n[noteIndex]; return n; }), 300);
  }, [selectedInstrument, volume, isRecording, getAudioCtx]);

  // ─── Recording Controls ───
  const startRecording = () => {
    setRecordedNotes([]);
    recordStartRef.current = Date.now();
    setIsRecording(true);
  };

  const stopRecording = () => {
    setIsRecording(false);
  };

  const playRecordedNotes = (notes) => {
    playTimeoutsRef.current.forEach(clearTimeout);
    playTimeoutsRef.current = [];
    notes.forEach(note => {
      const timeout = setTimeout(() => playNote(note.noteIndex, note.freq), note.time * 1000);
      playTimeoutsRef.current.push(timeout);
    });
  };

  const saveRecording = async () => {
    if (recordedNotes.length === 0) return;
    try {
      const r = await axios.post(`${API}/music/recordings`, {
        title: `${selectedInstrument.name} - ${new Date().toLocaleDateString()}`,
        instrument: selectedInstrument.id,
        duration: recordedNotes[recordedNotes.length - 1]?.time || 0,
        notes: recordedNotes,
      }, { headers: authHeaders });
      setRecordings(prev => [{ id: r.data.id, title: r.data.title, instrument: selectedInstrument.id, notes: recordedNotes, duration: recordedNotes[recordedNotes.length - 1]?.time || 0, created_at: new Date().toISOString() }, ...prev]);
    } catch {}
  };

  const deleteRecording = async (id) => {
    try {
      await axios.delete(`${API}/music/recordings/${id}`, { headers: authHeaders });
      setRecordings(prev => prev.filter(r => r.id !== id));
    } catch {}
  };

  // ─── Build Scale Notes ───
  const scale = SCALES[selectedScale];
  const scaleNotes = [];
  for (let octave = baseOctave; octave <= baseOctave + 1; octave++) {
    scale.intervals.forEach(interval => {
      const midiNote = 12 * octave + interval;
      const freq = 440 * Math.pow(2, (midiNote - 69) / 12);
      const noteName = NOTE_NAMES[interval % 12];
      scaleNotes.push({ noteIndex: midiNote, freq, name: `${noteName}${octave}`, interval });
    });
  }

  const TABS = [
    { id: 'instruments', label: 'World Instruments', icon: Music },
    { id: 'dances', label: 'Sacred Dances', icon: Disc3 },
    { id: 'recordings', label: 'My Recordings', icon: Save },
  ];

  return (
    <div className="min-h-screen pb-40" style={{ background: 'var(--bg-primary)' }} data-testid="dance-music-studio">
      {/* Header */}
      <div className="px-6 pt-8 pb-4">
        <motion.h1 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="text-2xl sm:text-3xl font-light mb-1"
          style={{ fontFamily: 'Cormorant Garamond, serif', color: 'var(--text-primary)' }}>
          Dance & Music Studio
        </motion.h1>
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
          Play world instruments, explore sacred dances, record your cosmic tunes
        </p>
      </div>

      {/* Tabs */}
      <div className="px-6 mb-6 flex items-center gap-2 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
        {TABS.map(tab => {
          const TIcon = tab.icon;
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium transition-all whitespace-nowrap"
              style={{
                background: activeTab === tab.id ? 'rgba(192,132,252,0.1)' : 'rgba(248,250,252,0.02)',
                border: `1px solid ${activeTab === tab.id ? 'rgba(192,132,252,0.2)' : 'rgba(248,250,252,0.04)'}`,
                color: activeTab === tab.id ? '#C084FC' : 'var(--text-muted)',
              }}
              data-testid={`studio-tab-${tab.id}`}>
              <TIcon size={12} /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* Cosmic Pairs — multi-sensory combos */}
      {splitScreen && (
        <div className="px-6 mb-5" data-testid="cosmic-pairs-section">
          <p className="text-[9px] font-bold uppercase tracking-[0.2em] mb-2.5 flex items-center gap-1.5"
            style={{ color: '#C084FC' }}>
            <Sparkles size={9} /> Cosmic Pairs — Launch a multi-sensory experience
          </p>
          <div className="flex gap-2.5 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
            {COSMIC_PAIRS.map((pair, i) => (
              <motion.button
                key={pair.id}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => splitScreen.openSplit(pair.pages[1])}
                className="flex-shrink-0 w-48 p-3.5 rounded-xl text-left transition-all hover:scale-[1.02] group"
                style={{
                  background: `linear-gradient(135deg, ${pair.colors[0]}08, ${pair.colors[1]}08)`,
                  border: `1px solid ${pair.colors[0]}15`,
                }}
                data-testid={`cosmic-pair-${pair.id}`}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="flex -space-x-1">
                    {pair.colors.map((c, ci) => (
                      <div key={ci} className="w-3 h-3 rounded-full ring-1 ring-black/40" style={{ background: c }} />
                    ))}
                  </div>
                  <Columns size={9} style={{ color: 'var(--text-muted)' }} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <p className="text-[10px] font-medium mb-0.5" style={{ color: 'var(--text-primary)' }}>{pair.name}</p>
                <p className="text-[8px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>{pair.description}</p>
              </motion.button>
            ))}
          </div>
        </div>
      )}

      <AnimatePresence mode="wait">
        {activeTab === 'instruments' && (
          <motion.div key="inst" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="px-6">
            <InstrumentPanel
              instruments={INSTRUMENTS}
              selected={selectedInstrument}
              onSelect={setSelectedInstrument}
              scale={selectedScale}
              onScaleChange={setSelectedScale}
              baseOctave={baseOctave}
              onOctaveChange={setBaseOctave}
              scaleNotes={scaleNotes}
              onPlayNote={playNote}
              activePads={activePads}
              volume={volume}
              onVolumeChange={setVolume}
              isRecording={isRecording}
              recordedNotes={recordedNotes}
              onStartRecording={startRecording}
              onStopRecording={stopRecording}
              onPlayRecorded={() => playRecordedNotes(recordedNotes)}
              onSaveRecording={saveRecording}
              onClearRecording={() => setRecordedNotes([])}
            />
          </motion.div>
        )}
        {activeTab === 'dances' && (
          <motion.div key="dance" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="px-6">
            <DanceExplorer dances={DANCES} selected={selectedDance} onSelect={setSelectedDance} />
          </motion.div>
        )}
        {activeTab === 'recordings' && (
          <motion.div key="rec" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="px-6">
            <RecordingsPanel
              recordings={recordings}
              instruments={INSTRUMENTS}
              onPlay={(notes) => playRecordedNotes(notes)}
              onDelete={deleteRecording}
              playingId={playingRecording}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Instrument Panel ───
function InstrumentPanel({ instruments, selected, onSelect, scale, onScaleChange, baseOctave, onOctaveChange, scaleNotes, onPlayNote, activePads, volume, onVolumeChange, isRecording, recordedNotes, onStartRecording, onStopRecording, onPlayRecorded, onSaveRecording, onClearRecording }) {
  const [instrumentSearch, setInstrumentSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState(null);
  const categories = [...new Set(instruments.map(i => i.origin))];

  const filteredInstruments = instruments.filter(inst => {
    const matchesCategory = !activeCategory || inst.origin === activeCategory;
    if (!instrumentSearch.trim()) return matchesCategory;
    const q = instrumentSearch.toLowerCase();
    return matchesCategory && (inst.name.toLowerCase().includes(q) || inst.origin.toLowerCase().includes(q) || inst.category.toLowerCase().includes(q));
  });

  return (
    <div className="space-y-5">
      {/* Instrument Selector */}
      <div className="p-5" data-testid="instrument-selector">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: 'var(--text-muted)' }}>
            Select Instrument
          </p>
          <div className="relative" data-testid="instrument-search-wrapper">
            <Search size={11} className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--text-muted)' }} />
            <input
              type="text"
              value={instrumentSearch}
              onChange={e => setInstrumentSearch(e.target.value)}
              placeholder="Search instruments..."
              className="pl-7 pr-7 py-1.5 rounded-lg text-[10px] outline-none w-44"
              style={{ background: 'rgba(248,250,252,0.03)', border: '1px solid rgba(248,250,252,0.06)', color: 'var(--text-primary)' }}
              data-testid="instrument-search-input"
            />
            {instrumentSearch && (
              <button onClick={() => setInstrumentSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2" data-testid="instrument-search-clear">
                <X size={10} style={{ color: 'var(--text-muted)' }} />
              </button>
            )}
          </div>
        </div>
        {/* Category filter chips */}
        <div className="flex flex-wrap gap-1.5 mb-3" data-testid="instrument-category-chips">
          <button
            onClick={() => setActiveCategory(null)}
            className="px-2.5 py-1 rounded-lg text-[9px] font-medium transition-all"
            style={{
              background: !activeCategory ? 'rgba(192,132,252,0.1)' : 'rgba(248,250,252,0.02)',
              border: `1px solid ${!activeCategory ? 'rgba(192,132,252,0.2)' : 'rgba(248,250,252,0.04)'}`,
              color: !activeCategory ? '#C084FC' : 'var(--text-muted)',
            }}
            data-testid="cat-chip-all"
          >All</button>
          {categories.map(cat => (
            <button key={cat}
              onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
              className="px-2.5 py-1 rounded-lg text-[9px] font-medium transition-all"
              style={{
                background: activeCategory === cat ? 'rgba(192,132,252,0.1)' : 'rgba(248,250,252,0.02)',
                border: `1px solid ${activeCategory === cat ? 'rgba(192,132,252,0.2)' : 'rgba(248,250,252,0.04)'}`,
                color: activeCategory === cat ? '#C084FC' : 'var(--text-muted)',
              }}
              data-testid={`cat-chip-${cat.toLowerCase().replace(/\s+/g, '-')}`}
            >{cat}</button>
          ))}
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
          {filteredInstruments.length === 0 ? (
            <div className="col-span-full py-4 text-center">
              <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>No instruments found{instrumentSearch ? ` for "${instrumentSearch}"` : ''}{activeCategory ? ` in ${activeCategory}` : ''}</p>
            </div>
          ) : filteredInstruments.map(inst => (
            <motion.button key={inst.id} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={() => onSelect(inst)}
              className="p-3 rounded-xl text-center transition-all"
              style={{
                background: selected.id === inst.id ? `${inst.color}15` : 'rgba(248,250,252,0.02)',
                border: `1px solid ${selected.id === inst.id ? `${inst.color}30` : 'rgba(248,250,252,0.04)'}`,
                boxShadow: selected.id === inst.id ? `0 0 15px ${inst.color}10` : 'none',
              }}
              data-testid={`inst-${inst.id}`}>
              <p className="text-[10px] font-medium" style={{ color: selected.id === inst.id ? inst.color : 'var(--text-secondary)' }}>
                {inst.name}
              </p>
              <p className="text-[7px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{inst.origin}</p>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Scale & Octave Controls */}
      <div className="flex flex-wrap gap-3">
        <div className="p-4 flex-1 min-w-[200px]">
          <p className="text-[9px] font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>Scale</p>
          <div className="flex flex-wrap gap-1.5">
            {Object.entries(SCALES).map(([key, s]) => (
              <button key={key} onClick={() => onScaleChange(key)}
                className="px-2.5 py-1 rounded-lg text-[9px] transition-all"
                style={{
                  background: scale === key ? `${selected.color}12` : 'rgba(248,250,252,0.02)',
                  border: `1px solid ${scale === key ? `${selected.color}25` : 'rgba(248,250,252,0.04)'}`,
                  color: scale === key ? selected.color : 'var(--text-muted)',
                }}
                data-testid={`scale-${key}`}>
                {s.name}
              </button>
            ))}
          </div>
        </div>
        <div className="p-4">
          <p className="text-[9px] font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>Octave</p>
          <div className="flex items-center gap-2">
            {[2, 3, 4, 5].map(o => (
              <button key={o} onClick={() => onOctaveChange(o)}
                className="w-8 h-8 rounded-lg text-[10px] font-medium transition-all"
                style={{
                  background: baseOctave === o ? `${selected.color}15` : 'rgba(248,250,252,0.02)',
                  border: `1px solid ${baseOctave === o ? `${selected.color}25` : 'rgba(248,250,252,0.04)'}`,
                  color: baseOctave === o ? selected.color : 'var(--text-muted)',
                }}>
                {o}
              </button>
            ))}
          </div>
        </div>
        <div className="p-4">
          <p className="text-[9px] font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>Volume</p>
          <input type="range" min="0" max="1" step="0.05" value={volume} onChange={e => onVolumeChange(parseFloat(e.target.value))}
            className="w-24" style={{ accentColor: selected.color }} data-testid="volume-slider" />
        </div>
      </div>

      {/* Play Pads */}
      <div className="p-5" data-testid="play-pads">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-xs font-medium" style={{ color: selected.color }}>{selected.name}</p>
            <p className="text-[9px]" style={{ color: 'var(--text-muted)' }}>{selected.origin} | {selected.category}</p>
          </div>
          {isRecording && (
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#EF4444' }} />
              <span className="text-[9px] font-medium" style={{ color: '#EF4444' }}>REC ({recordedNotes.length} notes)</span>
            </div>
          )}
        </div>
        <div className="grid grid-cols-5 sm:grid-cols-7 md:grid-cols-10 gap-2">
          {scaleNotes.map((note, i) => (
            <motion.button key={`${note.noteIndex}-${i}`}
              whileTap={{ scale: 0.9 }}
              onClick={() => onPlayNote(note.noteIndex, note.freq)}
              className="aspect-square rounded-xl flex flex-col items-center justify-center transition-all"
              style={{
                background: activePads[note.noteIndex] ? `${selected.color}30` : `${selected.color}08`,
                border: `1px solid ${activePads[note.noteIndex] ? `${selected.color}60` : `${selected.color}15`}`,
                boxShadow: activePads[note.noteIndex] ? `0 0 20px ${selected.color}30, inset 0 0 15px ${selected.color}15` : 'none',
                transform: activePads[note.noteIndex] ? 'scale(0.95)' : 'scale(1)',
              }}
              data-testid={`pad-${note.noteIndex}`}>
              <span className="text-[10px] font-bold" style={{ color: activePads[note.noteIndex] ? selected.color : 'var(--text-secondary)' }}>
                {note.name}
              </span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Recording Controls */}
      <div className="p-4 flex items-center justify-between flex-wrap gap-2" data-testid="recording-controls">
        <div className="flex items-center gap-2">
          {!isRecording ? (
            <button onClick={onStartRecording}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[10px] font-medium transition-all hover:scale-105"
              style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#EF4444' }}
              data-testid="rec-start">
              <Circle size={10} fill="currentColor" /> Record
            </button>
          ) : (
            <button onClick={onStopRecording}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[10px] font-medium transition-all hover:scale-105"
              style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#EF4444' }}
              data-testid="rec-stop">
              <Square size={10} fill="currentColor" /> Stop
            </button>
          )}
          {recordedNotes.length > 0 && (
            <>
              <button onClick={onPlayRecorded}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-medium transition-all hover:scale-105"
                style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', color: '#22C55E' }}
                data-testid="rec-play">
                <Play size={10} /> Play ({recordedNotes.length} notes)
              </button>
              <button onClick={onSaveRecording}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-medium transition-all hover:scale-105"
                style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', color: '#3B82F6' }}
                data-testid="rec-save">
                <Save size={10} /> Save
              </button>
              <button onClick={onClearRecording}
                className="p-2 rounded-xl hover:bg-white/5 transition-all" data-testid="rec-clear">
                <RotateCcw size={10} style={{ color: 'var(--text-muted)' }} />
              </button>
            </>
          )}
        </div>
        <p className="text-[8px]" style={{ color: 'var(--text-muted)' }}>
          Tap pads to play | Record to save your compositions
        </p>
      </div>
    </div>
  );
}

// ─── Dance Explorer ───
function DanceExplorer({ dances, selected, onSelect }) {
  const [danceSearch, setDanceSearch] = useState('');
  const filteredDances = dances.filter(d => {
    if (!danceSearch.trim()) return true;
    const q = danceSearch.toLowerCase();
    return d.name.toLowerCase().includes(q) || d.origin.toLowerCase().includes(q) || d.tradition.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-4" data-testid="dance-explorer">
      {!selected ? (
        <>
          <div className="relative" data-testid="dance-search-wrapper">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--text-muted)' }} />
            <input
              type="text"
              value={danceSearch}
              onChange={e => setDanceSearch(e.target.value)}
              placeholder="Search sacred dances..."
              className="w-full pl-9 pr-9 py-2.5 rounded-xl text-xs outline-none"
              style={{ background: 'rgba(248,250,252,0.03)', border: '1px solid rgba(248,250,252,0.06)', color: 'var(--text-primary)' }}
              data-testid="dance-search-input"
            />
            {danceSearch && (
              <button onClick={() => setDanceSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2" data-testid="dance-search-clear">
                <X size={12} style={{ color: 'var(--text-muted)' }} />
              </button>
            )}
          </div>
          {filteredDances.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>No dances match "{danceSearch}"</p>
            </div>
          ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filteredDances.map((dance, i) => (
            <motion.button key={dance.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => onSelect(dance)}
              className="p-5 text-left group transition-all hover:scale-[1.01]"
              style={{
                borderColor: `${dance.color}15`,
              }}
              data-testid={`dance-${dance.id}`}>
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="text-sm font-medium" style={{ color: dance.color }}>{dance.name}</p>
                  <p className="text-[9px]" style={{ color: 'var(--text-muted)' }}>
                    {dance.origin} | {dance.tradition}
                  </p>
                </div>
                <ChevronRight size={12} style={{ color: 'var(--text-muted)' }} className="group-hover:translate-x-0.5 transition-transform" />
              </div>
              <p className="text-[10px] line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
                {dance.description}
              </p>
              <div className="mt-2 flex items-center gap-1.5">
                <Globe size={8} style={{ color: 'var(--text-muted)' }} />
                <span className="text-[8px]" style={{ color: 'var(--text-muted)' }}>{dance.significance}</span>
              </div>
            </motion.button>
          ))}
          </div>
          )}
        </>
      ) : (
        <DanceDetail dance={selected} onBack={() => onSelect(null)} />
      )}
    </div>
  );
}

function DanceDetail({ dance, onBack }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} data-testid="dance-detail">
      <button onClick={onBack} className="flex items-center gap-1.5 mb-4 text-xs hover:opacity-80 transition-all"
        style={{ color: 'var(--text-muted)' }} data-testid="dance-back">
        <ArrowLeft size={12} /> Back to all dances
      </button>

      <div className="p-6">
        <div className="mb-4" style={{ borderBottom: `2px solid ${dance.color}20`, paddingBottom: 16 }}>
          <h2 className="text-xl font-light mb-1" style={{ fontFamily: 'Cormorant Garamond, serif', color: dance.color }}>{dance.name}</h2>
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-[10px] px-2.5 py-1 rounded-full" style={{ background: `${dance.color}10`, color: dance.color, border: `1px solid ${dance.color}20` }}>
              {dance.origin}
            </span>
            <span className="text-[10px] px-2.5 py-1 rounded-full" style={{ background: 'rgba(248,250,252,0.03)', color: 'var(--text-muted)', border: '1px solid rgba(248,250,252,0.06)' }}>
              {dance.tradition}
            </span>
          </div>
        </div>

        <p className="text-sm leading-relaxed mb-5" style={{ color: 'var(--text-secondary)' }}>{dance.description}</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl" style={{ background: 'rgba(248,250,252,0.02)', border: '1px solid rgba(248,250,252,0.04)' }}>
            <p className="text-[9px] font-bold uppercase tracking-wider mb-3" style={{ color: dance.color }}>Sacred Movements</p>
            <div className="space-y-1.5">
              {dance.movements.map((move, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="text-[8px] w-4 h-4 flex-shrink-0 rounded-full flex items-center justify-center mt-0.5"
                    style={{ background: `${dance.color}12`, color: dance.color }}>{i + 1}</span>
                  <span className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>{move}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <div className="p-4 rounded-xl" style={{ background: 'rgba(248,250,252,0.02)', border: '1px solid rgba(248,250,252,0.04)' }}>
              <p className="text-[9px] font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>Traditional Music</p>
              <p className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>{dance.music}</p>
            </div>
            <div className="p-4 rounded-xl" style={{ background: `${dance.color}05`, border: `1px solid ${dance.color}12` }}>
              <p className="text-[9px] font-bold uppercase tracking-wider mb-2" style={{ color: dance.color }}>Spiritual Significance</p>
              <p className="text-[10px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{dance.significance}</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Recordings Panel ───
function RecordingsPanel({ recordings, instruments, onPlay, onDelete }) {
  if (recordings.length === 0) {
    return (
      <div className="p-12 text-center" data-testid="recordings-empty">
        <Music size={32} style={{ color: 'rgba(248,250,252,0.1)', margin: '0 auto 12px' }} />
        <p className="text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>No recordings yet</p>
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Play some instruments and hit Record to save your cosmic tunes</p>
      </div>
    );
  }

  return (
    <div className="space-y-2" data-testid="recordings-list">
      {recordings.map((rec, i) => {
        const inst = instruments.find(i => i.id === rec.instrument);
        return (
          <motion.div key={rec.id}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            className="px-4 py-3 flex items-center justify-between"
            data-testid={`recording-${rec.id}`}>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: `${inst?.color || '#C084FC'}10` }}>
                <Music size={12} style={{ color: inst?.color || '#C084FC' }} />
              </div>
              <div>
                <p className="text-[10px] font-medium" style={{ color: 'var(--text-primary)' }}>{rec.title}</p>
                <p className="text-[8px]" style={{ color: 'var(--text-muted)' }}>
                  {(rec.notes?.length || 0)} notes | {(rec.duration || 0).toFixed(1)}s
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <button onClick={() => onPlay(rec.notes || [])}
                className="p-2 rounded-lg hover:bg-white/5 transition-all" data-testid={`play-rec-${rec.id}`}>
                <Play size={12} style={{ color: '#22C55E' }} />
              </button>
              <button onClick={() => onDelete(rec.id)}
                className="p-2 rounded-lg hover:bg-white/5 transition-all" data-testid={`delete-rec-${rec.id}`}>
                <Trash2 size={12} style={{ color: '#EF4444' }} />
              </button>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
