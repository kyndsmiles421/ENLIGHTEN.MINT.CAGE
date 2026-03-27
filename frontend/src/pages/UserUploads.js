import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Upload, Loader2, Trash2, Play, Pause, Music, Video, FileAudio } from 'lucide-react';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

function UploadForm({ onUploaded, authHeaders }) {
  const fileRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [type, setType] = useState('audio');
  const [tags, setTags] = useState('');

  const upload = async () => {
    const file = fileRef.current?.files?.[0];
    if (!file) { toast.error('Select a file'); return; }
    if (file.size > 50 * 1024 * 1024) { toast.error('Max file size: 50MB'); return; }
    setUploading(true);
    const fd = new FormData();
    fd.append('file', file);
    fd.append('title', title || file.name);
    fd.append('description', desc);
    fd.append('media_type', type);
    fd.append('tags', tags);
    try {
      await axios.post(`${API}/uploads/media`, fd, { headers: { ...authHeaders, 'Content-Type': 'multipart/form-data' } });
      toast.success('Uploaded!');
      setTitle(''); setDesc(''); setTags('');
      if (fileRef.current) fileRef.current.value = '';
      onUploaded();
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Upload failed');
    }
    setUploading(false);
  };

  const inputStyle = { background: 'rgba(15,17,28,0.5)', border: '1px solid rgba(248,250,252,0.08)', color: '#F8FAFC', outline: 'none' };

  return (
    <div className="rounded-2xl p-5 mb-6" data-testid="upload-form"
      style={{ background: 'rgba(15,17,28,0.6)', border: '1px solid rgba(59,130,246,0.1)' }}>
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-4" style={{ color: '#3B82F6' }}>
        <Upload size={12} className="inline mr-1" /> Upload Media
      </p>
      <div className="grid grid-cols-2 gap-3 mb-3">
        <input type="text" value={title} onChange={e => setTitle(e.target.value)}
          placeholder="Title" className="px-3 py-2 rounded-xl text-xs" style={inputStyle} data-testid="upload-title" />
        <select value={type} onChange={e => setType(e.target.value)} data-testid="upload-type"
          className="px-3 py-2 rounded-xl text-xs" style={inputStyle}>
          <option value="audio">Audio</option>
          <option value="video">Video</option>
        </select>
      </div>
      <input type="text" value={desc} onChange={e => setDesc(e.target.value)}
        placeholder="Description" className="w-full px-3 py-2 rounded-xl text-xs mb-3" style={inputStyle} data-testid="upload-desc" />
      <input type="text" value={tags} onChange={e => setTags(e.target.value)}
        placeholder="Tags (comma-separated)" className="w-full px-3 py-2 rounded-xl text-xs mb-3" style={inputStyle} data-testid="upload-tags" />
      <div className="flex items-center gap-3">
        <input ref={fileRef} type="file" accept="audio/*,video/*" data-testid="upload-file-input"
          className="text-xs flex-1" style={{ color: 'rgba(248,250,252,0.5)' }} />
        <button onClick={upload} disabled={uploading} data-testid="upload-submit-btn"
          className="px-4 py-2 rounded-xl text-xs font-medium flex items-center gap-2"
          style={{ background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.3)', color: '#3B82F6' }}>
          {uploading ? <Loader2 size={14} className="animate-spin" /> : <><Upload size={14} />Upload</>}
        </button>
      </div>
    </div>
  );
}

function MediaCard({ item, onDelete }) {
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef(null);
  const isAudio = item.media_type === 'audio';
  const isVideo = item.media_type === 'video';
  const fileUrl = `${API}/uploads/file/${item.filename}`;

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (playing) { audioRef.current.pause(); } else { audioRef.current.play(); }
    setPlaying(!playing);
  };

  return (
    <div className="rounded-xl p-4" data-testid={`media-${item.id}`}
      style={{ background: 'rgba(15,17,28,0.5)', border: '1px solid rgba(248,250,252,0.06)' }}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {isAudio ? <FileAudio size={14} style={{ color: '#3B82F6' }} /> : <Video size={14} style={{ color: '#8B5CF6' }} />}
          <p className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>{item.title}</p>
          <span className="text-[10px] px-2 py-0.5 rounded-full"
            style={{ background: isAudio ? 'rgba(59,130,246,0.1)' : 'rgba(139,92,246,0.1)', color: isAudio ? '#3B82F6' : '#8B5CF6' }}>
            {item.media_type}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px]" style={{ color: 'rgba(248,250,252,0.25)' }}>
            {new Date(item.created_at).toLocaleDateString()}
          </span>
          <button onClick={() => onDelete(item.id)} className="p-1 rounded-lg hover:bg-white/5">
            <Trash2 size={12} style={{ color: 'rgba(248,250,252,0.25)' }} />
          </button>
        </div>
      </div>
      {item.description && <p className="text-[10px] mb-2" style={{ color: 'rgba(248,250,252,0.35)' }}>{item.description}</p>}
      {item.tags?.length > 0 && (
        <div className="flex gap-1 mb-2 flex-wrap">
          {item.tags.map(t => (
            <span key={t} className="text-[9px] px-1.5 py-0.5 rounded-full"
              style={{ background: 'rgba(248,250,252,0.05)', color: 'rgba(248,250,252,0.3)' }}>{t}</span>
          ))}
        </div>
      )}
      {isAudio && (
        <div className="flex items-center gap-3">
          <button onClick={togglePlay} className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.3)' }}>
            {playing ? <Pause size={14} style={{ color: '#3B82F6' }} /> : <Play size={14} style={{ color: '#3B82F6' }} />}
          </button>
          <audio ref={audioRef} src={fileUrl} onEnded={() => setPlaying(false)} preload="none" />
          <span className="text-[10px]" style={{ color: 'rgba(248,250,252,0.3)' }}>{(item.file_size / 1024 / 1024).toFixed(1)} MB</span>
        </div>
      )}
      {isVideo && (
        <video src={fileUrl} controls className="w-full rounded-lg mt-1" style={{ maxHeight: 200 }} preload="none" />
      )}
    </div>
  );
}

export default function UserUploads() {
  const { token, authHeaders } = useAuth();
  const [uploads, setUploads] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetch = () => {
    if (!token) { setLoading(false); return; }
    axios.get(`${API}/uploads/my`, { headers: authHeaders })
      .then(r => setUploads(r.data.uploads || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetch(); }, [token]);

  const deleteFile = async (id) => {
    try {
      await axios.delete(`${API}/uploads/${id}`, { headers: authHeaders });
      toast.success('Deleted');
      fetch();
    } catch { toast.error('Failed'); }
  };

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 max-w-3xl mx-auto" data-testid="uploads-page">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="text-center mb-6">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] mb-2" style={{ color: '#3B82F6' }}>
            <Music size={12} className="inline mr-1" /> Your Collection
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
            Media Library
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Upload personal meditations, mantras, and healing sounds
          </p>
        </div>

        {!token ? (
          <p className="text-center text-sm py-12" style={{ color: 'rgba(248,250,252,0.4)' }}>Sign in to manage your media</p>
        ) : (
          <>
            <UploadForm onUploaded={fetch} authHeaders={authHeaders} />
            {loading ? (
              <div className="flex justify-center py-8"><Loader2 className="animate-spin" size={24} style={{ color: '#3B82F6' }} /></div>
            ) : uploads.length > 0 ? (
              <div className="space-y-3" data-testid="uploads-list">
                {uploads.map(u => <MediaCard key={u.id} item={u} onDelete={deleteFile} />)}
              </div>
            ) : (
              <p className="text-center text-sm py-8" style={{ color: 'rgba(248,250,252,0.3)' }}>No uploads yet. Share your sacred sounds!</p>
            )}
          </>
        )}
      </motion.div>
    </div>
  );
}
