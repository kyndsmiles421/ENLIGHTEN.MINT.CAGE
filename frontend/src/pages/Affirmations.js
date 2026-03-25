import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { RefreshCw, Sparkles, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';
import NarrationPlayer from '../components/NarrationPlayer';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const THEMES = [
  { name: 'Inner Peace', value: 'inner peace and tranquility' },
  { name: 'Abundance', value: 'abundance and prosperity' },
  { name: 'Self Love', value: 'self love and acceptance' },
  { name: 'Courage', value: 'courage and strength' },
  { name: 'Gratitude', value: 'gratitude and appreciation' },
  { name: 'Healing', value: 'healing and restoration' },
  { name: 'Consciousness', value: 'expanded consciousness and enlightenment' },
  { name: 'Energy', value: 'vital energy and life force' },
];

export default function Affirmations() {
  const [daily, setDaily] = useState(null);
  const [generated, setGenerated] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState(THEMES[0]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    axios.get(`${API}/affirmations/daily`)
      .then(res => setDaily(res.data))
      .catch(() => {});
  }, []);

  const generate = async () => {
    setLoading(true);
    try {
      const res = await axios.post(`${API}/affirmations/generate`, { theme: selectedTheme.value });
      setGenerated(res.data);
    } catch {
      toast.error('Could not generate affirmation');
    } finally {
      setLoading(false);
    }
  };

  const copyText = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Copied to your heart');
    setTimeout(() => setCopied(false), 2000);
  };

  const displayText = generated?.text || daily?.text || '';

  return (
    <div className="min-h-screen px-6 md:px-12 lg:px-24 py-12" style={{ background: 'var(--bg-default)' }}>
      <div className="max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-xs font-bold uppercase tracking-[0.25em] mb-4" style={{ color: 'var(--accent-gold)' }}>
            <Sparkles size={14} className="inline mr-2" />
            Affirmations
          </p>
          <h1 className="text-4xl md:text-5xl font-light tracking-tight mb-4" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
            Words of Power
          </h1>
          <p className="text-base mb-16" style={{ color: 'var(--text-secondary)' }}>
            Let these words resonate through every cell of your being.
          </p>
        </motion.div>

        {/* Main Affirmation Display */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-12 md:p-16 text-center mb-16 relative overflow-hidden"
        >
          <div className="absolute inset-0 opacity-10"
            style={{ background: 'radial-gradient(circle at 30% 50%, #C084FC 0%, transparent 50%), radial-gradient(circle at 70% 50%, #2DD4BF 0%, transparent 50%)' }}
          />
          <div className="relative z-10">
            <AnimatePresence mode="wait">
              <motion.p
                key={displayText}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-2xl md:text-4xl font-light leading-relaxed mb-8"
                style={{ fontFamily: 'Cormorant Garamond, serif', color: 'var(--text-primary)' }}
                data-testid="affirmation-text"
              >
                {displayText || 'Loading your daily wisdom...'}
              </motion.p>
            </AnimatePresence>
            {displayText && (
              <div className="flex items-center gap-3 flex-wrap">
                <button
                  onClick={() => copyText(displayText)}
                  className="btn-glass px-6 py-2 text-sm inline-flex items-center gap-2"
                  data-testid="copy-affirmation-btn"
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
                <NarrationPlayer
                  text={displayText}
                  label="Speak Affirmation"
                  color="#FCD34D"
                />
              </div>
            )}
          </div>
        </motion.div>

        {/* AI Generation */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] mb-4" style={{ color: 'var(--text-muted)' }}>Choose a Theme</p>
            <div className="grid grid-cols-2 gap-2">
              {THEMES.map(t => (
                <button
                  key={t.name}
                  onClick={() => setSelectedTheme(t)}
                  className="glass-card p-3 text-sm text-left"
                  style={{
                    borderColor: selectedTheme.name === t.name ? 'rgba(252,211,77,0.3)' : 'rgba(255,255,255,0.08)',
                    color: selectedTheme.name === t.name ? 'var(--text-primary)' : 'var(--text-muted)',
                    transition: 'border-color 0.3s, color 0.3s',
                  }}
                  data-testid={`theme-${t.name.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  {t.name}
                </button>
              ))}
            </div>
          </div>
          <div className="flex flex-col items-start justify-center">
            <p className="text-xs font-bold uppercase tracking-[0.2em] mb-4" style={{ color: 'var(--text-muted)' }}>AI-Powered Generation</p>
            <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
              Let artificial intelligence channel cosmic wisdom tailored to your chosen theme.
            </p>
            <button
              onClick={generate}
              disabled={loading}
              className="btn-glass glow-primary flex items-center gap-3"
              data-testid="generate-affirmation-btn"
              style={{ opacity: loading ? 0.6 : 1 }}
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              {loading ? 'Channeling...' : 'Generate Affirmation'}
            </button>
            {generated && (
              <p className="text-xs mt-4" style={{ color: 'var(--text-muted)' }}>
                Theme: {generated.theme} {generated.generated ? '(AI generated)' : '(curated)'}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
