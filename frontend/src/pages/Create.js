import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import NarrationPlayer from '../components/NarrationPlayer';
import {
  Sparkles, Plus, Loader2, Trash2, Share2, Heart, BookOpen,
  Wind, Sun, Music, Flame, PenTool, Eye, EyeOff
} from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const TYPES = [
  { id: 'affirmation', label: 'Affirmation', icon: Sun, color: '#FCD34D', placeholder: 'I am filled with radiant light and infinite peace...' },
  { id: 'meditation', label: 'Meditation', icon: Eye, color: '#D8B4FE', placeholder: 'Close your eyes. Take three deep breaths. Visualize a golden light...' },
  { id: 'breathwork', label: 'Breathwork', icon: Wind, color: '#2DD4BF', placeholder: 'Inhale for 4 counts, hold for 7, exhale for 8...' },
  { id: 'mantra', label: 'Mantra', icon: Music, color: '#FDA4AF', placeholder: 'Om Shanti Shanti Shanti — I am peace, I radiate peace...' },
  { id: 'ritual', label: 'Ritual', icon: Flame, color: '#FB923C', placeholder: 'Morning: Light a candle. 5 minutes Gyan Mudra. Chant Om 21 times...' },
];

export default function Create() {
  const { user, authHeaders } = useAuth();
  const [tab, setTab] = useState('create');
  const [type, setType] = useState('affirmation');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [saving, setSaving] = useState(false);
  const [myCreations, setMyCreations] = useState([]);
  const [sharedCreations, setSharedCreations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [aiIntention, setAiIntention] = useState('');
  const [aiGenerating, setAiGenerating] = useState(false);
  const [filterType, setFilterType] = useState('all');

  const typeConfig = TYPES.find(t => t.id === type) || TYPES[0];

  const loadData = useCallback(async () => {
    try {
      const promises = [axios.get(`${API}/creations/shared`)];
      if (user) promises.push(axios.get(`${API}/creations/my`, { headers: authHeaders }));
      const results = await Promise.all(promises);
      setSharedCreations(results[0].data);
      if (user && results[1]) setMyCreations(results[1].data);
    } catch {} finally { setLoading(false); }
  }, [user, authHeaders]);

  useEffect(() => { loadData(); }, [loadData]);

  const save = async () => {
    if (!user) { toast.error('Sign in to save'); return; }
    if (!title.trim() || !content.trim()) { toast.error('Title and content required'); return; }
    setSaving(true);
    try {
      await axios.post(`${API}/creations`, {
        type, title: title.trim(), content: content.trim(),
        tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      }, { headers: authHeaders });
      toast.success('Creation saved!');
      setTitle(''); setContent(''); setTags('');
      await loadData();
    } catch { toast.error('Could not save'); } finally { setSaving(false); }
  };

  const aiGenerate = async () => {
    if (!user) { toast.error('Sign in to use AI'); return; }
    if (!aiIntention.trim()) { toast.error('Describe your intention'); return; }
    setAiGenerating(true);
    try {
      const res = await axios.post(`${API}/creations/ai-generate`, {
        type, intention: aiIntention.trim(),
      }, { headers: authHeaders, timeout: 60000 });
      setContent(res.data.content);
      setTitle(`${typeConfig.label}: ${aiIntention.trim().substring(0, 40)}`);
      toast.success('AI created your practice!');
    } catch { toast.error('AI generation failed — try again'); } finally { setAiGenerating(false); }
  };

  const deleteCreation = async (id) => {
    try {
      await axios.delete(`${API}/creations/${id}`, { headers: authHeaders });
      toast.success('Deleted');
      await loadData();
    } catch { toast.error('Could not delete'); }
  };

  const toggleShare = async (id) => {
    try {
      const res = await axios.put(`${API}/creations/${id}/share`, {}, { headers: authHeaders });
      toast.success(res.data.shared ? 'Shared with community!' : 'Unshared');
      await loadData();
    } catch { toast.error('Could not update'); }
  };

  const likeCreation = async (id) => {
    try {
      await axios.put(`${API}/creations/${id}/like`);
      toast.success('Liked!');
      await loadData();
    } catch {}
  };

  const filteredShared = filterType === 'all' ? sharedCreations : sharedCreations.filter(c => c.type === filterType);

  return (
    <div className="min-h-screen immersive-page px-6 md:px-12 lg:px-24 py-12" style={{ background: 'transparent' }}>
      <div className="max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-xs font-bold uppercase tracking-[0.25em] mb-4" style={{ color: '#E879F9' }}>
            <PenTool size={14} className="inline mr-2" /> Creation Studio
          </p>
          <h1 className="text-4xl md:text-5xl font-light tracking-tight mb-4" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
            Create Your Practice
          </h1>
          <p className="text-base mb-8" style={{ color: 'var(--text-secondary)' }}>
            Write your own affirmations, meditations, breathwork, mantras, and rituals — or let AI craft them from your intention.
          </p>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-2 mb-10">
          {[{ id: 'create', label: 'Create New' }, { id: 'mine', label: 'My Creations' }, { id: 'community', label: 'Community' }].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className="px-5 py-2 rounded-full text-sm"
              style={{
                background: tab === t.id ? 'rgba(232,121,249,0.1)' : 'transparent',
                border: `1px solid ${tab === t.id ? 'rgba(232,121,249,0.3)' : 'rgba(255,255,255,0.06)'}`,
                color: tab === t.id ? '#E879F9' : 'var(--text-muted)',
              }}
              data-testid={`create-tab-${t.id}`}>
              {t.label}
              {t.id === 'mine' && myCreations.length > 0 && <span className="ml-1.5 opacity-60">({myCreations.length})</span>}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {tab === 'create' && (
            <motion.div key="create" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {/* Type Selector */}
              <div className="flex gap-2 mb-8 flex-wrap">
                {TYPES.map(t => {
                  const Icon = t.icon;
                  return (
                    <button key={t.id} onClick={() => setType(t.id)}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-full text-sm"
                      style={{
                        background: type === t.id ? `${t.color}15` : 'rgba(255,255,255,0.02)',
                        border: `1px solid ${type === t.id ? `${t.color}30` : 'rgba(255,255,255,0.06)'}`,
                        color: type === t.id ? t.color : 'var(--text-muted)',
                      }}
                      data-testid={`type-${t.id}`}>
                      <Icon size={14} />
                      {t.label}
                    </button>
                  );
                })}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Manual Creation */}
                <div className="p-6">
                  <p className="text-xs font-bold uppercase tracking-[0.15em] mb-4" style={{ color: 'var(--text-muted)' }}>
                    <PenTool size={12} className="inline mr-1" /> Write Your Own
                  </p>
                  <input
                    value={title} onChange={e => setTitle(e.target.value)}
                    placeholder={`Title for your ${typeConfig.label.toLowerCase()}`}
                    className="w-full bg-transparent border-b py-3 text-sm mb-4 outline-none"
                    style={{ borderColor: 'rgba(255,255,255,0.08)', color: 'var(--text-primary)' }}
                    data-testid="create-title"
                  />
                  <textarea
                    value={content} onChange={e => setContent(e.target.value)}
                    placeholder={typeConfig.placeholder}
                    rows={8}
                    className="w-full bg-transparent rounded-lg p-4 text-sm outline-none resize-none"
                    style={{ border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-secondary)' }}
                    data-testid="create-content"
                  />
                  <input
                    value={tags} onChange={e => setTags(e.target.value)}
                    placeholder="Tags (comma separated): peace, morning, healing"
                    className="w-full bg-transparent border-b py-3 text-xs mt-3 mb-4 outline-none"
                    style={{ borderColor: 'rgba(255,255,255,0.06)', color: 'var(--text-muted)' }}
                    data-testid="create-tags"
                  />
                  <div className="flex items-center gap-3">
                    <button onClick={save} disabled={saving || !user}
                      className="btn-glass px-6 py-2.5 text-sm flex items-center gap-2"
                      style={{ borderColor: `${typeConfig.color}30` }}
                      data-testid="create-save-btn">
                      {saving ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                      {!user ? 'Sign in to Save' : saving ? 'Saving...' : 'Save Creation'}
                    </button>
                    {content && (
                      <NarrationPlayer text={content} label="Preview Voice" color={typeConfig.color} context="knowledge" />
                    )}
                  </div>
                </div>

                {/* AI Generation */}
                <div className="p-6" style={{ borderColor: `${typeConfig.color}10` }}>
                  <p className="text-xs font-bold uppercase tracking-[0.15em] mb-4" style={{ color: typeConfig.color }}>
                    <Sparkles size={12} className="inline mr-1" /> AI-Powered Creation
                  </p>
                  <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
                    Describe your intention and AI will craft a personalized {typeConfig.label.toLowerCase()} for you.
                  </p>
                  <textarea
                    value={aiIntention} onChange={e => setAiIntention(e.target.value)}
                    placeholder={`What's your intention? e.g. "Finding inner peace during a difficult transition" or "Building confidence for a new career" or "Healing from grief and loss"`}
                    rows={4}
                    className="w-full bg-transparent rounded-lg p-4 text-sm outline-none resize-none mb-4"
                    style={{ border: `1px solid ${typeConfig.color}20`, color: 'var(--text-secondary)' }}
                    data-testid="ai-intention"
                  />
                  <button onClick={aiGenerate} disabled={aiGenerating || !user}
                    className="btn-glass glow-primary px-6 py-2.5 text-sm flex items-center gap-2 w-full justify-center"
                    style={{ borderColor: `${typeConfig.color}30` }}
                    data-testid="ai-generate-btn">
                    {aiGenerating ? <><Loader2 size={14} className="animate-spin" /> Creating with AI...</> : <><Sparkles size={14} /> Generate {typeConfig.label}</>}
                  </button>
                  {aiGenerating && (
                    <p className="text-xs text-center mt-3" style={{ color: 'var(--text-muted)' }}>
                      AI is crafting something unique for you...
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {tab === 'mine' && (
            <motion.div key="mine" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {!user ? (
                <div className="p-12 text-center">
                  <p className="text-lg" style={{ fontFamily: 'Cormorant Garamond, serif', color: 'var(--text-muted)' }}>Sign in to see your creations</p>
                </div>
              ) : myCreations.length === 0 ? (
                <div className="p-12 text-center">
                  <PenTool size={32} style={{ color: 'var(--text-muted)', opacity: 0.3, margin: '0 auto 16px' }} />
                  <p className="text-lg" style={{ fontFamily: 'Cormorant Garamond, serif', color: 'var(--text-muted)' }}>No creations yet</p>
                  <p className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>Create your first affirmation, meditation, or ritual above.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {myCreations.map(c => {
                    const tc = TYPES.find(t => t.id === c.type) || TYPES[0];
                    const Icon = tc.icon;
                    return (
                      <div key={c.id} className="p-6" data-testid={`creation-${c.id}`}>
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: `${tc.color}15` }}>
                              <Icon size={16} style={{ color: tc.color }} />
                            </div>
                            <div>
                              <h3 className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{c.title}</h3>
                              <p className="text-xs" style={{ color: tc.color }}>{tc.label}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button onClick={() => toggleShare(c.id)} className="p-1.5 rounded-full"
                              style={{ color: c.shared ? '#2DD4BF' : 'var(--text-muted)', background: c.shared ? 'rgba(45,212,191,0.1)' : 'transparent' }}
                              title={c.shared ? 'Shared — click to unshare' : 'Share with community'}
                              data-testid={`share-${c.id}`}>
                              {c.shared ? <Eye size={14} /> : <EyeOff size={14} />}
                            </button>
                            <button onClick={() => deleteCreation(c.id)} className="p-1.5 rounded-full"
                              style={{ color: 'var(--text-muted)' }} data-testid={`delete-${c.id}`}>
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                        <p className="text-sm leading-relaxed whitespace-pre-wrap mb-3" style={{ color: 'var(--text-secondary)' }}>
                          {c.content}
                        </p>
                        <div className="flex items-center gap-3 flex-wrap">
                          <NarrationPlayer text={c.content} label="Listen" color={tc.color} context="knowledge" />
                          {c.tags?.length > 0 && c.tags.map(t => (
                            <span key={t} className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(255,255,255,0.04)', color: 'var(--text-muted)' }}>{t}</span>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}

          {tab === 'community' && (
            <motion.div key="community" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="flex gap-2 mb-8 flex-wrap">
                <button onClick={() => setFilterType('all')} className="px-4 py-2 rounded-full text-xs"
                  style={{ background: filterType === 'all' ? 'rgba(255,255,255,0.08)' : 'transparent', border: '1px solid rgba(255,255,255,0.06)', color: filterType === 'all' ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                  All
                </button>
                {TYPES.map(t => (
                  <button key={t.id} onClick={() => setFilterType(t.id)} className="px-4 py-2 rounded-full text-xs"
                    style={{ background: filterType === t.id ? `${t.color}10` : 'transparent', border: `1px solid ${filterType === t.id ? `${t.color}25` : 'rgba(255,255,255,0.06)'}`, color: filterType === t.id ? t.color : 'var(--text-muted)' }}>
                    {t.label}
                  </button>
                ))}
              </div>

              {filteredShared.length === 0 ? (
                <div className="p-12 text-center">
                  <Share2 size={32} style={{ color: 'var(--text-muted)', opacity: 0.3, margin: '0 auto 16px' }} />
                  <p className="text-lg" style={{ fontFamily: 'Cormorant Garamond, serif', color: 'var(--text-muted)' }}>No shared creations yet</p>
                  <p className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>Be the first to share your practice with the community.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredShared.map(c => {
                    const tc = TYPES.find(t => t.id === c.type) || TYPES[0];
                    const Icon = tc.icon;
                    return (
                      <div key={c.id} className="p-6" data-testid={`shared-${c.id}`}>
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: `${tc.color}15` }}>
                              <Icon size={16} style={{ color: tc.color }} />
                            </div>
                            <div>
                              <h3 className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{c.title}</h3>
                              <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-muted)' }}>
                                <span style={{ color: tc.color }}>{tc.label}</span>
                                <span>by {c.user_name || 'Anonymous'}</span>
                              </div>
                            </div>
                          </div>
                          <button onClick={() => likeCreation(c.id)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs"
                            style={{ background: 'rgba(255,255,255,0.04)', color: 'var(--text-muted)', border: '1px solid rgba(255,255,255,0.06)' }}>
                            <Heart size={12} /> {c.likes || 0}
                          </button>
                        </div>
                        <p className="text-sm leading-relaxed whitespace-pre-wrap mb-3" style={{ color: 'var(--text-secondary)' }}>
                          {c.content}
                        </p>
                        <NarrationPlayer text={c.content} label="Listen" color={tc.color} context="knowledge" />
                      </div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
