import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import {
  ArrowLeft, Volume2, VolumeX, Eye, Palette, Sparkles, Monitor,
  Moon, Sun, TreePine, Zap, Shield, Bell, ChevronRight
} from 'lucide-react';
import { useSensory } from '../context/SensoryContext';

function Section({ title, children }) {
  return (
    <div className="mb-6">
      <p className="text-[10px] uppercase tracking-widest font-bold mb-3 px-1"
        style={{ color: 'var(--text-muted)' }}>{title}</p>
      <div className="rounded-xl overflow-hidden"
        style={{ background: 'rgba(248,250,252,0.02)', border: '1px solid rgba(248,250,252,0.04)' }}>
        {children}
      </div>
    </div>
  );
}

function Toggle({ label, description, checked, onChange, testId, icon: Icon }) {
  return (
    <div className="flex items-center justify-between px-4 py-3"
      style={{ borderBottom: '1px solid rgba(248,250,252,0.03)' }}>
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {Icon && <Icon size={14} style={{ color: 'var(--text-muted)' }} />}
        <div>
          <p className="text-xs" style={{ color: 'var(--text-primary)' }}>{label}</p>
          {description && <p className="text-[9px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{description}</p>}
        </div>
      </div>
      <button
        onClick={() => onChange(!checked)}
        className="w-10 h-5 rounded-full relative transition-all flex-shrink-0"
        style={{
          background: checked ? 'rgba(192,132,252,0.3)' : 'rgba(248,250,252,0.06)',
          border: `1px solid ${checked ? 'rgba(192,132,252,0.4)' : 'rgba(248,250,252,0.1)'}`,
        }}
        data-testid={testId}>
        <div className="w-3.5 h-3.5 rounded-full absolute top-0.5 transition-all"
          style={{
            left: checked ? '22px' : '2px',
            background: checked ? '#C084FC' : 'var(--text-muted)',
          }} />
      </button>
    </div>
  );
}

function Slider({ label, value, min, max, onChange, testId, icon: Icon, suffix }) {
  return (
    <div className="px-4 py-3"
      style={{ borderBottom: '1px solid rgba(248,250,252,0.03)' }}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {Icon && <Icon size={14} style={{ color: 'var(--text-muted)' }} />}
          <p className="text-xs" style={{ color: 'var(--text-primary)' }}>{label}</p>
        </div>
        <span className="text-[10px] font-medium" style={{ color: 'var(--primary)' }}>{value}{suffix}</span>
      </div>
      <input
        type="range" min={min} max={max} value={value}
        onChange={e => onChange(parseInt(e.target.value))}
        className="w-full h-1 rounded-full appearance-none cursor-pointer"
        style={{
          background: `linear-gradient(to right, var(--primary) 0%, var(--primary) ${((value - min) / (max - min)) * 100}%, rgba(248,250,252,0.08) ${((value - min) / (max - min)) * 100}%, rgba(248,250,252,0.08) 100%)`,
        }}
        data-testid={testId}
      />
    </div>
  );
}

export default function Settings() {
  const navigate = useNavigate();
  const { ambientOn, toggleAmbient, prefs, updatePref, themes } = useSensory();

  return (
    <div className="min-h-screen pb-24" style={{ background: 'var(--bg-primary)' }}>
      <div className="px-4 pt-4 max-w-lg mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-white/5 transition-all"
            data-testid="settings-back-btn">
            <ArrowLeft size={18} style={{ color: 'var(--text-muted)' }} />
          </button>
          <div>
            <h1 className="text-2xl font-light" style={{ color: 'var(--text-primary)', fontFamily: 'Cormorant Garamond, serif' }}>
              Settings
            </h1>
            <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Customize your experience</p>
          </div>
        </div>

        {/* Sound & Audio */}
        <Section title="Sound & Audio">
          <Toggle
            label="Ambient Soundscape"
            description="Cosmic drone background audio"
            checked={ambientOn}
            onChange={toggleAmbient}
            testId="toggle-ambient"
            icon={ambientOn ? Volume2 : VolumeX}
          />
          <Toggle
            label="Sound Effects"
            description="Click, chime, and celebration sounds"
            checked={prefs.soundEffects}
            onChange={v => updatePref('soundEffects', v)}
            testId="toggle-sound-effects"
            icon={Zap}
          />
          <Slider
            label="Ambient Volume"
            value={prefs.ambientVolume}
            min={0} max={100}
            onChange={v => updatePref('ambientVolume', v)}
            testId="slider-ambient-volume"
            icon={Volume2}
            suffix="%"
          />
        </Section>

        {/* Visual & Display */}
        <Section title="Visual & Display">
          <div className="px-4 py-3" style={{ borderBottom: '1px solid rgba(248,250,252,0.03)' }}>
            <div className="flex items-center gap-2 mb-3">
              <Palette size={14} style={{ color: 'var(--text-muted)' }} />
              <p className="text-xs" style={{ color: 'var(--text-primary)' }}>Color Theme</p>
            </div>
            <div className="grid grid-cols-2 gap-2" data-testid="theme-picker">
              {Object.entries(themes).map(([id, t]) => {
                const active = prefs.theme === id;
                const icons = { cosmic: Moon, midnight: Moon, earth: Sun, forest: TreePine };
                const ThemeIcon = icons[id] || Moon;
                return (
                  <button key={id}
                    onClick={() => { updatePref('theme', id); toast.success(`Theme: ${t.label}`); }}
                    className="flex items-center gap-2 p-2.5 rounded-lg text-left transition-all hover:scale-[1.02]"
                    style={{
                      background: active ? `${t.primary}12` : 'rgba(248,250,252,0.02)',
                      border: `1px solid ${active ? `${t.primary}30` : 'rgba(248,250,252,0.06)'}`,
                    }}
                    data-testid={`theme-${id}`}>
                    <div className="w-6 h-6 rounded-full flex items-center justify-center"
                      style={{ background: t.bg, border: `2px solid ${t.primary}` }}>
                      <ThemeIcon size={10} style={{ color: t.primary }} />
                    </div>
                    <div>
                      <p className="text-[10px] font-medium" style={{ color: active ? t.primary : 'var(--text-secondary)' }}>{t.label}</p>
                      <div className="flex gap-0.5 mt-0.5">
                        <div className="w-2 h-2 rounded-full" style={{ background: t.primary }} />
                        <div className="w-2 h-2 rounded-full" style={{ background: t.textPrimary }} />
                        <div className="w-2 h-2 rounded-full" style={{ background: t.bg, border: '1px solid rgba(255,255,255,0.2)' }} />
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
          <Toggle
            label="Reduce Motion"
            description="Minimize animations and transitions"
            checked={prefs.reduceMotion}
            onChange={v => updatePref('reduceMotion', v)}
            testId="toggle-reduce-motion"
            icon={Monitor}
          />
          <Toggle
            label="Reduce Particles"
            description="Fewer stars, nebula effects, and background elements"
            checked={prefs.reduceParticles}
            onChange={v => updatePref('reduceParticles', v)}
            testId="toggle-reduce-particles"
            icon={Sparkles}
          />
          <Toggle
            label="Reduce Flashing"
            description="Disable shooting stars, twinkling, and pulsing effects"
            checked={prefs.reduceFlashing}
            onChange={v => updatePref('reduceFlashing', v)}
            testId="toggle-reduce-flashing"
            icon={Shield}
          />
        </Section>

        {/* Quick Links */}
        <Section title="Account">
          {[
            { label: 'Subscription & Credits', path: '/pricing', icon: Sparkles },
            { label: 'Notification Preferences', path: '/dashboard', icon: Bell, note: 'Via notification bell' },
            { label: 'Profile & Avatar', path: '/profile', icon: Eye },
          ].map(item => (
            <button key={item.path}
              onClick={() => navigate(item.path)}
              className="w-full flex items-center justify-between px-4 py-3 text-left transition-all hover:bg-white/[0.02]"
              style={{ borderBottom: '1px solid rgba(248,250,252,0.03)' }}
              data-testid={`settings-link-${item.label.toLowerCase().replace(/\s/g, '-')}`}>
              <div className="flex items-center gap-3">
                <item.icon size={14} style={{ color: 'var(--text-muted)' }} />
                <div>
                  <p className="text-xs" style={{ color: 'var(--text-primary)' }}>{item.label}</p>
                  {item.note && <p className="text-[8px]" style={{ color: 'var(--text-muted)' }}>{item.note}</p>}
                </div>
              </div>
              <ChevronRight size={12} style={{ color: 'var(--text-muted)' }} />
            </button>
          ))}
        </Section>

        {/* Reset */}
        <div className="text-center mt-4">
          <button
            onClick={() => {
              updatePref('theme', 'cosmic');
              updatePref('reduceMotion', false);
              updatePref('reduceParticles', false);
              updatePref('reduceFlashing', false);
              updatePref('soundEffects', true);
              updatePref('ambientVolume', 15);
              toast.success('Settings reset to defaults');
            }}
            className="text-[10px] px-4 py-2 rounded-lg transition-all hover:bg-white/5"
            style={{ color: 'var(--text-muted)', border: '1px solid rgba(248,250,252,0.06)' }}
            data-testid="reset-settings-btn">
            Reset to Defaults
          </button>
        </div>
      </div>
    </div>
  );
}
