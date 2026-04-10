import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeftRight, Star, Sliders, Settings, Play, Pause, Plus, Volume2, VolumeX, Layers, Music, Film, Code, Printer, BookOpen } from 'lucide-react';

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * V47.0 SOVEREIGN FABRICATOR — MULTI-TRACK REALITY ENGINE
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * ARCHITECT: Steven Michael
 * ENGINE: ENLIGHTEN.MINT.CAFE
 * 
 * Track 1: CODE WRITER (Indigo) - Generates functional logic for nodules
 * Track 2: PRINTER (Cyan) - Prints visual UI and 3D assets
 * Track 3: READER (Gold) - Manipulates existing data to fit frequency
 * Track 4: VIDEO OUTPUT (Prismatic) - Final container where video/sound merge
 * 
 * FORMULA: z^xr2 * z^xr2 (+)(-) n^xr2 (+)(-) y^xr2 {π}{√7.3}
 * ═══════════════════════════════════════════════════════════════════════════════
 */

// Solfeggio frequencies for track mapping
const SOLFEGGIO = [174, 285, 396, 417, 528, 639, 741, 852, 963];

const SovereignFabricator = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  
  // The 4-Track Faders
  const [faders, setFaders] = useState({
    codeWriter: 528,    // Indigo - Logic generation
    printer: 639,       // Cyan - UI/3D printing
    reader: 741,        // Gold - Data manipulation
    videoOutput: 852    // Prismatic - Final output
  });

  // Track configuration
  const tracks = [
    { 
      id: 'codeWriter', 
      label: 'CODE WRITER', 
      icon: Code,
      color: 'from-indigo-600 via-purple-500 to-indigo-400',
      glowColor: 'rgba(99, 102, 241, 0.6)',
      description: 'Logic Generator'
    },
    { 
      id: 'printer', 
      label: 'PRINTER', 
      icon: Printer,
      color: 'from-cyan-500 via-blue-400 to-cyan-300',
      glowColor: 'rgba(6, 182, 212, 0.6)',
      description: 'UI/3D Output'
    },
    { 
      id: 'reader', 
      label: 'READER', 
      icon: BookOpen,
      color: 'from-amber-500 via-yellow-400 to-amber-300',
      glowColor: 'rgba(245, 158, 11, 0.6)',
      description: 'Data Manipulator'
    },
    { 
      id: 'videoOutput', 
      label: 'VIDEO OUT', 
      icon: Film,
      color: 'from-pink-500 via-purple-400 to-cyan-400',
      glowColor: 'rgba(236, 72, 153, 0.6)',
      description: 'Prismatic Merge'
    }
  ];

  // V43.0 Kinetic Snap
  const triggerHapticSnap = () => {
    if (navigator.vibrate) {
      navigator.vibrate([80, 50, 120]);
    }
    console.log('[V47.0] KINETIC_RECEIPT: [80, 50, 120]');
  };

  const handleFaderChange = (track, value) => {
    setFaders(prev => ({ ...prev, [track]: parseInt(value) }));
    triggerHapticSnap();
  };

  // Calculate resonance force
  const resonanceForce = Math.sqrt(7.3) * Math.PI;
  const totalOutput = Object.values(faders).reduce((a, b) => a + b, 0) / 4;

  return (
    <div 
      className="min-h-screen bg-black text-white overflow-hidden"
      style={{ fontFamily: "'JetBrains Mono', 'Fira Code', monospace" }}
    >
      {/* HEADER BAR - PowerDirector Style */}
      <header className="flex items-center justify-between px-4 py-3 bg-zinc-900/80 border-b border-zinc-800">
        <div className="flex items-center gap-4">
          <Link to="/hub" className="p-2 hover:bg-zinc-800 rounded-lg transition-colors">
            <Home size={20} className="text-zinc-400" />
          </Link>
          <div className="flex gap-2">
            <button className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-500">←</button>
            <button className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-500">→</button>
          </div>
        </div>
        
        <h1 className="text-sm font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-cyan-400 to-amber-400">
          SOVEREIGN FABRICATOR
        </h1>
        
        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-zinc-800 rounded-lg">
            <Settings size={18} className="text-zinc-400" />
          </button>
          <button className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 rounded-lg text-sm font-bold transition-colors">
            Export
          </button>
        </div>
      </header>

      {/* MAIN PREVIEW AREA */}
      <div className="relative h-[45vh] bg-zinc-950 flex items-center justify-center border-b border-zinc-800">
        {/* Iridescent Background Effect */}
        <div 
          className="absolute inset-0 opacity-30"
          style={{
            background: `radial-gradient(ellipse at center, ${tracks[0].glowColor} 0%, transparent 50%)`,
            animation: 'pulse 4s ease-in-out infinite'
          }}
        />
        
        {/* Crystal Lattice Preview */}
        <div className="relative z-10 flex flex-col items-center">
          <div 
            className="w-64 h-64 rounded-2xl border border-zinc-700 bg-black/50 flex items-center justify-center overflow-hidden"
            style={{
              boxShadow: `0 0 60px ${tracks[Math.floor(totalOutput / 250) % 4].glowColor}`
            }}
          >
            {/* Animated Lattice */}
            <div className="relative w-48 h-48">
              {[...Array(9)].map((_, i) => (
                <div
                  key={i}
                  className="absolute rounded-full border"
                  style={{
                    width: `${(i + 1) * 20}%`,
                    height: `${(i + 1) * 20}%`,
                    left: `${50 - (i + 1) * 10}%`,
                    top: `${50 - (i + 1) * 10}%`,
                    borderColor: `hsl(${(totalOutput / 4) + i * 40}, 70%, 60%)`,
                    opacity: 0.3 + (i * 0.07),
                    animation: `spin ${10 + i * 2}s linear infinite ${i % 2 === 0 ? '' : 'reverse'}`
                  }}
                />
              ))}
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">
                  {resonanceForce.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
          
          <p className="mt-4 text-xs text-zinc-500 tracking-widest">
            8.4881 CRYSTAL LATTICE • {totalOutput.toFixed(0)}Hz COMPOSITE
          </p>
          
          {/* Add Media Button */}
          <button 
            className="mt-6 px-6 py-3 bg-cyan-600/20 border border-cyan-500/50 rounded-xl text-cyan-400 text-sm font-medium hover:bg-cyan-600/30 transition-all flex items-center gap-2"
            onClick={triggerHapticSnap}
          >
            <Plus size={18} />
            Tap to insert media on main track
          </button>
        </div>
      </div>

      {/* TIMELINE CONTROLS */}
      <div className="flex items-center justify-between px-4 py-2 bg-zinc-900/50 border-b border-zinc-800">
        <button 
          className="p-2 hover:bg-zinc-800 rounded-lg"
          onClick={() => setIsMuted(!isMuted)}
        >
          {isMuted ? <VolumeX size={18} className="text-zinc-500" /> : <Volume2 size={18} className="text-cyan-400" />}
        </button>
        
        <div className="flex items-center gap-4">
          <span className="text-xs text-zinc-500 font-mono">00:00 / 00:00</span>
          <button 
            className="p-3 bg-zinc-800 hover:bg-zinc-700 rounded-full transition-colors"
            onClick={() => {
              setIsPlaying(!isPlaying);
              triggerHapticSnap();
            }}
          >
            {isPlaying ? <Pause size={20} /> : <Play size={20} className="ml-0.5" />}
          </button>
        </div>
        
        <button className="p-2 hover:bg-zinc-800 rounded-lg">
          <Layers size={18} className="text-zinc-400" />
        </button>
      </div>

      {/* TIMELINE RULER */}
      <div className="h-6 bg-zinc-900 border-b border-zinc-800 flex items-end px-4">
        {[...Array(12)].map((_, i) => (
          <div key={i} className="flex-1 border-l border-zinc-700 h-3 relative">
            <span className="absolute -top-4 left-0 text-[8px] text-zinc-600">
              {String(i).padStart(2, '0')}:00
            </span>
          </div>
        ))}
      </div>

      {/* 4-TRACK IRIDESCENT MIXER */}
      <div className="flex-1 bg-zinc-950">
        {tracks.map((track, idx) => {
          const Icon = track.icon;
          const value = faders[track.id];
          const percentage = (value / 963) * 100;
          
          return (
            <div 
              key={track.id}
              className="flex items-center h-16 border-b border-zinc-800/50 group hover:bg-zinc-900/30 transition-colors"
            >
              {/* Track Label */}
              <div className="w-24 px-3 flex items-center gap-2 border-r border-zinc-800">
                <Icon size={14} style={{ color: track.glowColor }} />
                <div>
                  <p className="text-[9px] font-bold tracking-wider" style={{ color: track.glowColor }}>
                    {track.label}
                  </p>
                  <p className="text-[8px] text-zinc-600">{track.description}</p>
                </div>
              </div>
              
              {/* Fader Track */}
              <div className="flex-1 h-full relative px-2 flex items-center">
                {/* Background Grid */}
                <div className="absolute inset-0 opacity-10">
                  {[...Array(24)].map((_, i) => (
                    <div 
                      key={i} 
                      className="absolute top-0 bottom-0 w-px bg-zinc-600"
                      style={{ left: `${(i / 24) * 100}%` }}
                    />
                  ))}
                </div>
                
                {/* Frequency Bar */}
                <div 
                  className="h-8 rounded relative overflow-hidden transition-all duration-150"
                  style={{ 
                    width: `${percentage}%`,
                    background: `linear-gradient(90deg, ${track.glowColor}22, ${track.glowColor}66)`,
                    boxShadow: `0 0 20px ${track.glowColor}`,
                    minWidth: '40px'
                  }}
                >
                  {/* Iridescent Shimmer */}
                  <div 
                    className="absolute inset-0 opacity-50"
                    style={{
                      background: `linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)`,
                      animation: 'shimmer 2s infinite'
                    }}
                  />
                  
                  {/* Frequency Label */}
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    <span className="text-[10px] font-bold text-white drop-shadow-lg">
                      {value}Hz
                    </span>
                  </div>
                </div>
                
                {/* Hidden Range Input */}
                <input
                  type="range"
                  min="174"
                  max="963"
                  value={value}
                  onChange={(e) => handleFaderChange(track.id, e.target.value)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize"
                />
              </div>
              
              {/* Track Controls */}
              <div className="w-16 px-2 flex items-center justify-center gap-1 border-l border-zinc-800">
                <button className="p-1 hover:bg-zinc-800 rounded text-zinc-500 hover:text-white">
                  <Music size={12} />
                </button>
                <button className="p-1 hover:bg-zinc-800 rounded text-zinc-500 hover:text-white">
                  <Layers size={12} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* BOTTOM TOOLBAR - PowerDirector Style */}
      <div className="h-16 bg-zinc-900 border-t border-zinc-800 flex items-center justify-around px-4">
        {[
          { icon: Film, label: 'Edit', active: false },
          { icon: Music, label: 'Audio', active: true },
          { icon: Code, label: 'Text', active: false },
          { icon: Layers, label: 'Overlay', active: false },
          { icon: Sliders, label: 'Effects', active: false },
        ].map((item, idx) => {
          const Icon = item.icon;
          return (
            <button 
              key={idx}
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors ${
                item.active ? 'text-cyan-400' : 'text-zinc-500 hover:text-white'
              }`}
              onClick={triggerHapticSnap}
            >
              <Icon size={20} />
              <span className="text-[9px] font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
};

export default SovereignFabricator;
