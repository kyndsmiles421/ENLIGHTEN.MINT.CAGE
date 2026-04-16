import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { BookOpen, Quote, Trash2, Loader2, PenTool, ChevronRight, Plus, Calendar } from 'lucide-react';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

function NewEntryForm({ onSaved, teachers }) {
  const { authHeaders } = useAuth();
  const [teacher, setTeacher] = useState('');
  const [teaching, setTeaching] = useState('');
  const [quote, setQuote] = useState('');
  const [reflection, setReflection] = useState('');
  const [saving, setSaving] = useState(false);
  const [teacherData, setTeacherData] = useState(null);

  useEffect(() => { if (typeof window.__workAccrue === 'function') window.__workAccrue('wisdom_journal', 8); }, []);
  useEffect(() => {
    if (teacher) {
      axios.get(`${API}/teachings/teacher/${teacher}`).then(r => setTeacherData(r.data)).catch(() => {});
    } else {
      setTeacherData(null);
      setTeaching('');
      setQuote('');
    }
  }, [teacher]);

  const save = async () => {
    if (!reflection.trim()) { toast.error('Write a reflection first'); return; }
    setSaving(true);
    try {
      const td = teacherData || {};
      const te = td.teachings?.find(t => t.id === teaching);
      await axios.post(`${API}/wisdom-journal`, {
        teacher_id: teacher,
        teacher_name: td.name || 'Personal Reflection',
        teaching_id: teaching,
        teaching_title: te?.title || '',
        quote,
        reflection: reflection.trim(),
      }, { headers: authHeaders });
      toast.success('Reflection saved');
      setTeacher(''); setTeaching(''); setQuote(''); setReflection('');
      onSaved();
    } catch { toast.error('Failed to save'); }
    setSaving(false);
  };

  const selectedColor = teacherData?.color || '#A78BFA';

  return (
    <div className="p-6 mb-8" style={{ borderColor: `${selectedColor}15` }} data-testid="wisdom-journal-form">
      <p className="text-xs font-bold uppercase tracking-[0.2em] mb-4" style={{ color: selectedColor }}>
        <PenTool size={12} className="inline mr-2" /> New Reflection
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="text-[10px] uppercase tracking-widest block mb-1.5" style={{ color: 'var(--text-muted)' }}>Teacher (optional)</label>
          <select value={teacher} onChange={e => setTeacher(e.target.value)}
            className="w-full px-3 py-2 rounded-lg text-sm bg-transparent"
            style={{ border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-primary)' }}
            data-testid="journal-teacher-select">
            <option value="" style={{ background: 'transparent' }}>Personal Reflection</option>
            {teachers.map(t => (
              <option key={t.id} value={t.id} style={{ background: 'transparent' }}>{t.name}</option>
            ))}
          </select>
        </div>
        {teacherData && (
          <div>
            <label className="text-[10px] uppercase tracking-widest block mb-1.5" style={{ color: 'var(--text-muted)' }}>Teaching</label>
            <select value={teaching} onChange={e => setTeaching(e.target.value)}
              className="w-full px-3 py-2 rounded-lg text-sm bg-transparent"
              style={{ border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-primary)' }}
              data-testid="journal-teaching-select">
              <option value="" style={{ background: 'transparent' }}>General</option>
              {teacherData.teachings.map(t => (
                <option key={t.id} value={t.id} style={{ background: 'transparent' }}>{t.title}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {teacherData && (
        <div className="mb-4">
          <label className="text-[10px] uppercase tracking-widest block mb-1.5" style={{ color: 'var(--text-muted)' }}>Inspiring Quote (optional)</label>
          <select value={quote} onChange={e => setQuote(e.target.value)}
            className="w-full px-3 py-2 rounded-lg text-sm bg-transparent"
            style={{ border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-primary)' }}
            data-testid="journal-quote-select">
            <option value="" style={{ background: 'transparent' }}>None</option>
            {teacherData.quotes.map((q, i) => (
              <option key={i} value={q} style={{ background: 'transparent' }}>{q.slice(0, 60)}...</option>
            ))}
          </select>
        </div>
      )}

      <div className="mb-4">
        <label className="text-[10px] uppercase tracking-widest block mb-1.5" style={{ color: 'var(--text-muted)' }}>Your Reflection</label>
        <textarea value={reflection} onChange={e => setReflection(e.target.value)}
          placeholder="What does this teaching mean to you? How does it connect to your life right now?"
          rows={4}
          className="w-full px-4 py-3 rounded-xl text-sm bg-transparent resize-none leading-relaxed"
          style={{ border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-primary)' }}
          data-testid="journal-reflection-input" />
      </div>

      <button onClick={save} disabled={saving || !reflection.trim()}
        className="flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-medium"
        style={{ background: `${selectedColor}12`, color: selectedColor, border: `1px solid ${selectedColor}20`, opacity: reflection.trim() ? 1 : 0.4 }}
        data-testid="journal-save-btn">
        {saving ? <Loader2 size={12} className="animate-spin" /> : <Plus size={12} />}
        {saving ? 'Saving...' : 'Save Reflection'}
      </button>
    </div>
  );
}

function JournalEntry({ entry, onDelete }) {
  const color = entry.teacher_id ? '#A78BFA' : '#86EFAC';
  const date = new Date(entry.created_at);
  const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      className="p-5" data-testid={`journal-entry-${entry.id}`}>
      <div className="flex items-start justify-between mb-3">
        <div>
          {entry.teacher_name && entry.teacher_name !== 'Personal Reflection' && (
            <p className="text-xs font-medium mb-0.5" style={{ color }}>{entry.teacher_name}</p>
          )}
          {entry.teaching_title && (
            <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{entry.teaching_title}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
            <Calendar size={9} className="inline mr-1" />{dateStr}
          </span>
          <button onClick={() => onDelete(entry.id)} className="p-1 rounded-full transition-all hover:bg-red-500/10"
            style={{ color: 'var(--text-muted)' }} data-testid={`delete-entry-${entry.id}`}>
            <Trash2 size={12} />
          </button>
        </div>
      </div>
      {entry.quote && (
        <div className="mb-3 pl-3" style={{ borderLeft: `2px solid ${color}30` }}>
          <p className="text-xs italic" style={{ color: 'var(--text-secondary)' }}>"{entry.quote}"</p>
        </div>
      )}
      <p className="text-sm leading-relaxed whitespace-pre-line" style={{ color: 'var(--text-primary)' }}>
        {entry.reflection}
      </p>
    </motion.div>
  );
}

export default function WisdomJournal() {
  const { authHeaders, user } = useAuth();
  const [entries, setEntries] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    Promise.all([
      axios.get(`${API}/wisdom-journal`, { headers: authHeaders }).then(r => setEntries(r.data.entries)),
      axios.get(`${API}/teachings/teachers`).then(r => setTeachers(r.data.teachers)),
    ]).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { if (user) load(); }, [user]);

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API}/wisdom-journal/${id}`, { headers: authHeaders });
      setEntries(prev => prev.filter(e => e.id !== id));
      toast.success('Entry deleted');
    } catch { toast.error('Failed to delete'); }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin" style={{ color: 'var(--text-muted)' }} /></div>;

  return (
    <div className="min-h-screen px-6 md:px-12 lg:px-24 py-12 immersive-page" data-testid="wisdom-journal-page">
      <div className="max-w-3xl mx-auto relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-xs font-bold uppercase tracking-[0.3em] mb-2" style={{ color: '#A78BFA' }}>
            <BookOpen size={14} className="inline mr-2" /> Wisdom Journal
          </p>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-light tracking-tight mb-3" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
            Your Sacred Study Log
          </h1>
          <p className="text-base mb-10" style={{ color: 'var(--text-secondary)' }}>
            Link universal wisdom to your personal journey. Reflect on teachings, capture insights, and watch your understanding deepen over time.
          </p>
        </motion.div>

        <NewEntryForm onSaved={load} teachers={teachers} />

        <p className="text-xs font-bold uppercase tracking-[0.2em] mb-4" style={{ color: 'var(--text-muted)' }}>
          {entries.length} Reflection{entries.length !== 1 ? 's' : ''}
        </p>

        <div className="space-y-4" data-testid="journal-entries-list">
          <AnimatePresence>
            {entries.map(entry => (
              <JournalEntry key={entry.id} entry={entry} onDelete={handleDelete} />
            ))}
          </AnimatePresence>
          {entries.length === 0 && (
            <div className="text-center py-16">
              <Quote size={32} className="mx-auto mb-4" style={{ color: 'rgba(255,255,255,0.06)' }} />
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Your journal is empty. Start by reflecting on a teaching above.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
