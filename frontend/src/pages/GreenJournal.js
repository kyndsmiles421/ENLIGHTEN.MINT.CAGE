import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Leaf, Sparkles, Loader2, Trash2, Calendar, Plus, Cloud, Sun, Droplets, Wind } from 'lucide-react';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const ENTRY_TYPES = ['observation', 'plant spirit', 'animal encounter', 'weather', 'gratitude', 'seasonal reflection'];
const SEASONS = ['spring', 'summer', 'autumn', 'winter'];
const WEATHER_OPTIONS = ['sunny', 'cloudy', 'rainy', 'windy', 'stormy', 'snowy', 'misty', 'clear night'];
const NATURE_PROMPTS = [
  "What did the wind tell you today?",
  "Which plant caught your eye and why?",
  "Describe a pattern in nature you noticed.",
  "What season does your soul feel it is right now?",
  "If the earth had a message for you today, what would it say?",
  "What animal crossed your path and what might it mean?",
  "Describe the quality of light you experienced today.",
  "What are you grateful for in the natural world right now?",
];

function NewGreenEntry({ onSaved, moonPhase }) {
  const { authHeaders } = useAuth();
  const [entryType, setEntryType] = useState('observation');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [plants, setPlants] = useState('');
  const [animals, setAnimals] = useState('');
  const [weather, setWeather] = useState('');
  const [season, setSeason] = useState('');
  const [gratitude, setGratitude] = useState('');
  const [saving, setSaving] = useState(false);
  const [prompt, setPrompt] = useState('');

  useEffect(() => { if (typeof window.__workAccrue === 'function') window.__workAccrue('green_journal', 8); }, []);
  useEffect(() => { setPrompt(NATURE_PROMPTS[Math.floor(Math.random() * NATURE_PROMPTS.length)]); }, []);

  const save = async () => {
    if (!content.trim()) { toast.error('Write something about nature'); return; }
    setSaving(true);
    try {
      await axios.post(`${API}/green-journal`, {
        entry_type: entryType, title: title.trim() || prompt, content: content.trim(),
        plants: plants ? plants.split(',').map(p => p.trim()).filter(Boolean) : [],
        animals_seen: animals ? animals.split(',').map(a => a.trim()).filter(Boolean) : [],
        weather, season, gratitude: gratitude.trim(),
      }, { headers: authHeaders });
      toast.success('Entry saved');
      setTitle(''); setContent(''); setPlants(''); setAnimals(''); setGratitude('');
      setPrompt(NATURE_PROMPTS[Math.floor(Math.random() * NATURE_PROMPTS.length)]);
      onSaved();
    } catch { toast.error('Failed to save'); }
    setSaving(false);
  };

  return (
    <div className="p-6 mb-8" style={{ borderColor: 'rgba(34,197,94,0.1)' }} data-testid="green-journal-form">
      <p className="text-xs font-bold uppercase tracking-[0.2em] mb-1" style={{ color: '#22C55E' }}>
        <Leaf size={12} className="inline mr-1" /> New Entry
      </p>
      {moonPhase && (
        <p className="text-[10px] mb-4" style={{ color: 'var(--text-muted)' }}>Moon: {moonPhase.name} &middot; {moonPhase.meaning}</p>
      )}

      <p className="text-sm italic mb-4" style={{ color: 'rgba(34,197,94,0.7)' }}>"{prompt}"</p>

      <div className="flex gap-3 flex-wrap mb-4">
        <div>
          <p className="text-[10px] uppercase tracking-widest mb-1" style={{ color: 'var(--text-muted)' }}>Type</p>
          <select value={entryType} onChange={e => setEntryType(e.target.value)} className="input-glass text-sm" data-testid="green-entry-type">
            {ENTRY_TYPES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
          </select>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-widest mb-1" style={{ color: 'var(--text-muted)' }}>Weather</p>
          <select value={weather} onChange={e => setWeather(e.target.value)} className="input-glass text-sm" data-testid="green-weather">
            <option value="">--</option>
            {WEATHER_OPTIONS.map(w => <option key={w} value={w}>{w.charAt(0).toUpperCase() + w.slice(1)}</option>)}
          </select>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-widest mb-1" style={{ color: 'var(--text-muted)' }}>Season</p>
          <select value={season} onChange={e => setSeason(e.target.value)} className="input-glass text-sm" data-testid="green-season">
            <option value="">--</option>
            {SEASONS.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
          </select>
        </div>
      </div>

      <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Title (optional)"
        className="w-full px-4 py-2.5 rounded-xl text-sm bg-transparent mb-3"
        style={{ border: '1px solid rgba(255,255,255,0.06)', color: 'var(--text-primary)' }} data-testid="green-title" />

      <textarea value={content} onChange={e => setContent(e.target.value)} placeholder="What did you observe in nature today? Describe colors, textures, sounds, smells..."
        rows={4} className="w-full px-4 py-3 rounded-xl text-sm bg-transparent resize-none leading-relaxed mb-3"
        style={{ border: '1px solid rgba(255,255,255,0.06)', color: 'var(--text-primary)' }} data-testid="green-content" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
        <input type="text" value={plants} onChange={e => setPlants(e.target.value)} placeholder="Plants noticed (comma-separated)"
          className="w-full px-4 py-2.5 rounded-xl text-sm bg-transparent"
          style={{ border: '1px solid rgba(255,255,255,0.06)', color: 'var(--text-primary)' }} data-testid="green-plants" />
        <input type="text" value={animals} onChange={e => setAnimals(e.target.value)} placeholder="Animals seen (comma-separated)"
          className="w-full px-4 py-2.5 rounded-xl text-sm bg-transparent"
          style={{ border: '1px solid rgba(255,255,255,0.06)', color: 'var(--text-primary)' }} data-testid="green-animals" />
      </div>

      <textarea value={gratitude} onChange={e => setGratitude(e.target.value)} placeholder="What are you grateful for in nature today?"
        rows={2} className="w-full px-4 py-3 rounded-xl text-sm bg-transparent resize-none leading-relaxed mb-4"
        style={{ border: '1px solid rgba(255,255,255,0.06)', color: 'var(--text-primary)' }} data-testid="green-gratitude" />

      <button onClick={save} disabled={saving || !content.trim()}
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-medium"
        style={{ background: 'rgba(34,197,94,0.1)', color: '#22C55E', border: '1px solid rgba(34,197,94,0.15)', opacity: content.trim() ? 1 : 0.4 }}
        data-testid="green-save-btn">
        {saving ? <Loader2 size={12} className="animate-spin" /> : <Plus size={12} />}
        {saving ? 'Saving...' : 'Save Entry'}
      </button>
    </div>
  );
}

function GreenEntry({ entry, onDelete }) {
  const date = new Date(entry.created_at);
  const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const typeColors = { observation: '#22C55E', 'plant spirit': '#86EFAC', 'animal encounter': '#FB923C', weather: '#3B82F6', gratitude: '#FCD34D', 'seasonal reflection': '#A78BFA' };
  const weatherIcons = { sunny: Sun, cloudy: Cloud, rainy: Droplets, windy: Wind, stormy: Cloud, snowy: Sparkles, misty: Cloud, 'clear night': Sparkles };
  const WeatherIcon = weatherIcons[entry.weather] || Leaf;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-5" data-testid={`green-entry-${entry.id}`}>
      <div className="flex items-start justify-between mb-2">
        <div>
          <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{entry.title || 'Nature Note'}</p>
          <div className="flex gap-2 mt-1 flex-wrap">
            <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: `${typeColors[entry.entry_type] || '#22C55E'}10`, color: typeColors[entry.entry_type] || '#22C55E' }}>{entry.entry_type}</span>
            <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}><Calendar size={9} className="inline mr-1" />{dateStr}</span>
            {entry.moon_phase && <span className="text-[10px]" style={{ color: '#FCD34D' }}>{entry.moon_phase}</span>}
            {entry.weather && <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}><WeatherIcon size={9} className="inline mr-1" />{entry.weather}</span>}
            {entry.season && <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{entry.season}</span>}
          </div>
        </div>
        <button onClick={() => onDelete(entry.id)} className="p-1 rounded-full hover:bg-red-500/10" style={{ color: 'var(--text-muted)' }} data-testid={`delete-green-${entry.id}`}>
          <Trash2 size={12} />
        </button>
      </div>
      <p className="text-sm leading-relaxed mt-3 whitespace-pre-line" style={{ color: 'var(--text-secondary)' }}>{entry.content}</p>
      {(entry.plants?.length > 0 || entry.animals_seen?.length > 0) && (
        <div className="flex gap-1.5 mt-3 flex-wrap">
          {entry.plants?.map(p => <span key={p} className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: 'rgba(34,197,94,0.08)', color: '#22C55E' }}>{p}</span>)}
          {entry.animals_seen?.map(a => <span key={a} className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: 'rgba(251,146,60,0.08)', color: '#FB923C' }}>{a}</span>)}
        </div>
      )}
      {entry.gratitude && (
        <div className="mt-3 pl-3" style={{ borderLeft: '2px solid rgba(252,211,77,0.2)' }}>
          <p className="text-xs italic" style={{ color: '#FCD34D' }}>{entry.gratitude}</p>
        </div>
      )}
    </motion.div>
  );
}

export default function GreenJournal() {
  const { authHeaders, user } = useAuth();
  const [entries, setEntries] = useState([]);
  const [moonPhase, setMoonPhase] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = () => {
    Promise.all([
      axios.get(`${API}/green-journal`, { headers: authHeaders }).then(r => setEntries(r.data.entries)),
      axios.get(`${API}/moon-phase`).then(r => setMoonPhase(r.data.phase)),
    ]).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { if (user) load(); }, [user]);

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API}/green-journal/${id}`, { headers: authHeaders });
      setEntries(prev => prev.filter(e => e.id !== id));
      toast.success('Entry deleted');
    } catch { toast.error('Failed to delete'); }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin" style={{ color: 'var(--text-muted)' }} /></div>;

  return (
    <div className="min-h-screen pt-20 pb-40 px-5" data-testid="green-journal-page">
      <div className="max-w-3xl mx-auto relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-xs font-bold uppercase tracking-[0.3em] mb-2" style={{ color: '#22C55E' }}>
            <Leaf size={14} className="inline mr-2" /> Green Journal
          </p>
          <h1 className="text-3xl md:text-3xl font-light tracking-tight mb-3" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
            Nature Connection Diary
          </h1>
          <p className="text-base mb-10" style={{ color: 'var(--text-secondary)' }}>
            Record your encounters with the natural world. Track plants, animals, weather, seasons, and moon phases. Let nature be your teacher.
          </p>
        </motion.div>

        <NewGreenEntry onSaved={load} moonPhase={moonPhase} />

        <p className="text-xs font-bold uppercase tracking-[0.2em] mb-4" style={{ color: 'var(--text-muted)' }}>
          {entries.length} Entr{entries.length !== 1 ? 'ies' : 'y'}
        </p>
        <div className="space-y-4" data-testid="green-entries-list">
          <AnimatePresence>
            {entries.map(e => <GreenEntry key={e.id} entry={e} onDelete={handleDelete} />)}
          </AnimatePresence>
          {entries.length === 0 && <p className="text-center py-12 text-sm" style={{ color: 'var(--text-muted)' }}>Your green journal is empty. Start by observing nature today.</p>}
        </div>
      </div>
    </div>
  );
}
