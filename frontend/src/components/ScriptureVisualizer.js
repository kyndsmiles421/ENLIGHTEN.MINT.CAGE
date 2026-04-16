import React, { useRef, useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Sparkles, Flame, Droplets, Wind, Mountain, Star, Sun, Moon as MoonIcon } from 'lucide-react';

const SCENE_KEYWORDS = {
  water: ['sea', 'water', 'flood', 'river', 'ocean', 'rain', 'waves', 'baptize', 'baptism', 'wash', 'drink', 'well', 'stream', 'tears', 'wudu', 'ablution'],
  fire: ['fire', 'flame', 'burn', 'blaze', 'torch', 'furnace', 'pillar of fire', 'bush', 'smoke', 'lightning', 'hellfire', 'jahannam'],
  light: ['light', 'dawn', 'sun', 'glory', 'shine', 'radiant', 'bright', 'illuminate', 'star', 'lamp', 'nur', 'ohr', 'sunrise', 'morning'],
  darkness: ['dark', 'night', 'shadow', 'void', 'abyss', 'deep', 'cave', 'tomb', 'grave', 'death', 'layl'],
  creation: ['create', 'creation', 'beginning', 'form', 'made', 'earth', 'heaven', 'cosmos', 'universe', 'world', 'bereishit', 'khalq'],
  mountain: ['mountain', 'sinai', 'mount', 'hill', 'rock', 'stone', 'cliff', 'tur', 'horeb', 'zion', 'carmel'],
  garden: ['garden', 'tree', 'fruit', 'seed', 'plant', 'vine', 'flower', 'eden', 'paradise', 'jannah', 'pardes'],
  sky: ['sky', 'heaven', 'cloud', 'angel', 'wing', 'ascend', 'above', 'throne', 'celestial', 'samawat', 'malakh'],
  storm: ['storm', 'wind', 'thunder', 'earthquake', 'tempest', 'whirlwind', 'tornado', 'cyclone'],
  peace: ['peace', 'calm', 'rest', 'still', 'quiet', 'mercy', 'love', 'compassion', 'gentle', 'salam', 'shalom', 'chesed'],
  battle: ['battle', 'war', 'army', 'sword', 'fight', 'victory', 'enemy', 'conquer', 'destroy', 'smite', 'jihad'],
  journey: ['journey', 'walk', 'path', 'road', 'wilderness', 'desert', 'wander', 'exile', 'travel', 'hijra', 'exodus'],
  divine: ['god', 'lord', 'holy', 'sacred', 'divine', 'spirit', 'soul', 'pray', 'worship', 'allah', 'hashem', 'adonai', 'elohim'],
  mystical: ['sefirot', 'zohar', 'kabbalah', 'mystical', 'hidden', 'secret', 'veil', 'revelation', 'vision', 'prophecy', 'dream'],
};

function detectScenes(text) {
  if (!text) return ['divine', 'light'];
  const lower = text.toLowerCase();
  const scores = {};
  for (const [scene, keywords] of Object.entries(SCENE_KEYWORDS)) {
    let score = 0;
    for (const kw of keywords) {
      const regex = new RegExp(`\\b${kw}\\b`, 'gi');
      const matches = lower.match(regex);
      if (matches) score += matches.length;
    }
    if (score > 0) scores[scene] = score;
  }
  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  return sorted.length > 0 ? sorted.slice(0, 3).map(s => s[0]) : ['divine', 'light'];
}

const TRADITION_PALETTES = {
  'old-testament': { primary: [215, 135, 6], secondary: [180, 100, 20], accent: [255, 200, 80] },
  'new-testament': { primary: [220, 38, 38], secondary: [180, 60, 60], accent: [255, 200, 200] },
  'deuterocanonical': { primary: [124, 58, 237], secondary: [100, 50, 180], accent: [200, 160, 255] },
  'lost-apocryphal': { primary: [8, 145, 178], secondary: [20, 100, 140], accent: [100, 220, 255] },
  'torah-talmud': { primary: [37, 99, 235], secondary: [30, 70, 180], accent: [120, 180, 255] },
  'kabbalah': { primary: [232, 121, 249], secondary: [180, 80, 200], accent: [255, 180, 255] },
  'quran': { primary: [5, 150, 105], secondary: [10, 120, 80], accent: [100, 255, 180] },
};

class Particle {
  constructor(canvas, type, palette) {
    this.canvas = canvas;
    this.type = type;
    this.palette = palette;
    this.reset();
  }

  reset() {
    const w = this.canvas.width;
    const h = this.canvas.height;
    this.x = Math.random() * w;
    this.y = Math.random() * h;
    this.size = Math.random() * 3 + 1;
    this.speedX = (Math.random() - 0.5) * 0.5;
    this.speedY = (Math.random() - 0.5) * 0.5;
    this.life = 1;
    this.decay = Math.random() * 0.003 + 0.001;
    this.opacity = Math.random() * 0.6 + 0.2;

    switch (this.type) {
      case 'fire':
        this.y = h + 10;
        this.speedY = -(Math.random() * 2 + 0.5);
        this.speedX = (Math.random() - 0.5) * 1.2;
        this.size = Math.random() * 5 + 2;
        this.decay = Math.random() * 0.008 + 0.004;
        break;
      case 'water':
        this.y = -10;
        this.speedY = Math.random() * 1.5 + 0.3;
        this.speedX = (Math.random() - 0.5) * 0.3;
        this.size = Math.random() * 3 + 1;
        break;
      case 'light':
        this.size = Math.random() * 8 + 3;
        this.speedX = 0;
        this.speedY = -(Math.random() * 0.3 + 0.1);
        this.decay = Math.random() * 0.002 + 0.001;
        break;
      case 'storm':
        this.speedX = (Math.random() - 0.3) * 4;
        this.speedY = Math.random() * 3 + 1;
        this.size = Math.random() * 2 + 0.5;
        break;
      case 'garden':
        this.speedY = Math.random() * 0.3 + 0.05;
        this.speedX = Math.sin(this.x * 0.01) * 0.5;
        this.size = Math.random() * 4 + 2;
        break;
      case 'mystical':
        this.angle = Math.random() * Math.PI * 2;
        this.radius = Math.random() * 100 + 50;
        this.angularSpeed = (Math.random() - 0.5) * 0.02;
        this.centerX = w / 2;
        this.centerY = h / 2;
        this.size = Math.random() * 3 + 1;
        break;
      default:
        this.speedY = -(Math.random() * 0.3 + 0.05);
        break;
    }
  }

  update() {
    if (this.type === 'mystical') {
      this.angle += this.angularSpeed;
      this.x = this.centerX + Math.cos(this.angle) * this.radius;
      this.y = this.centerY + Math.sin(this.angle) * this.radius;
      this.radius += 0.1;
    } else {
      this.x += this.speedX;
      this.y += this.speedY;
    }
    this.life -= this.decay;
    if (this.life <= 0 || this.y < -20 || this.y > this.canvas.height + 20 || this.x < -20 || this.x > this.canvas.width + 20) {
      this.reset();
    }
  }

  draw(ctx, time) {
    const alpha = this.life * this.opacity;
    if (alpha <= 0) return;
    const [r, g, b] = this.palette.primary;
    const [ar, ag, ab] = this.palette.accent;

    ctx.save();
    switch (this.type) {
      case 'fire': {
        const flicker = Math.sin(time * 0.01 + this.x) * 0.3 + 0.7;
        const grad = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size * 2);
        grad.addColorStop(0, `rgba(255, 200, 50, ${alpha * flicker})`);
        grad.addColorStop(0.5, `rgba(${r}, ${g * 0.5}, 0, ${alpha * 0.5 * flicker})`);
        grad.addColorStop(1, `rgba(${r}, 0, 0, 0)`);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * 2, 0, Math.PI * 2);
        ctx.fill();
        break;
      }
      case 'water': {
        ctx.fillStyle = `rgba(${ar * 0.6}, ${ag * 0.8}, ${ab}, ${alpha * 0.6})`;
        ctx.beginPath();
        ctx.ellipse(this.x, this.y, this.size * 0.5, this.size * 1.5, 0, 0, Math.PI * 2);
        ctx.fill();
        break;
      }
      case 'light': {
        const pulse = Math.sin(time * 0.002 + this.x * 0.01) * 0.3 + 0.7;
        const grad = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size * 3);
        grad.addColorStop(0, `rgba(${ar}, ${ag}, ${ab}, ${alpha * pulse * 0.4})`);
        grad.addColorStop(0.5, `rgba(${r}, ${g}, ${b}, ${alpha * pulse * 0.15})`);
        grad.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * 3, 0, Math.PI * 2);
        ctx.fill();
        break;
      }
      case 'mystical': {
        const pulse = Math.sin(time * 0.003 + this.angle * 3) * 0.5 + 0.5;
        ctx.fillStyle = `rgba(${ar}, ${ag}, ${ab}, ${alpha * pulse * 0.5})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * (1 + pulse), 0, Math.PI * 2);
        ctx.fill();
        // Connection lines
        ctx.strokeStyle = `rgba(${ar}, ${ag}, ${ab}, ${alpha * 0.08})`;
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(this.centerX, this.centerY);
        ctx.lineTo(this.x, this.y);
        ctx.stroke();
        break;
      }
      case 'garden': {
        const sway = Math.sin(time * 0.001 + this.x * 0.02) * 3;
        ctx.fillStyle = `rgba(${50 + Math.random() * 50}, ${150 + Math.random() * 80}, ${50}, ${alpha * 0.5})`;
        ctx.beginPath();
        ctx.arc(this.x + sway, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        break;
      }
      default: {
        ctx.fillStyle = `rgba(${ar}, ${ag}, ${ab}, ${alpha * 0.4})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();
  }
}

function drawSceneBackground(ctx, w, h, scenes, palette, time) {
  const [r, g, b] = palette.primary;
  const [sr, sg, sb] = palette.secondary;

  // Base gradient
  const baseGrad = ctx.createLinearGradient(0, 0, 0, h);
  baseGrad.addColorStop(0, `rgba(${Math.floor(r * 0.08)}, ${Math.floor(g * 0.08)}, ${Math.floor(b * 0.08)}, 0.95)`);
  baseGrad.addColorStop(1, `rgba(${Math.floor(sr * 0.05)}, ${Math.floor(sg * 0.05)}, ${Math.floor(sb * 0.05)}, 0.95)`);
  ctx.fillStyle = baseGrad;
  ctx.fillRect(0, 0, w, h);

  for (const scene of scenes) {
    switch (scene) {
      case 'mountain': {
        ctx.fillStyle = `rgba(${sr * 0.3}, ${sg * 0.3}, ${sb * 0.3}, 0.3)`;
        ctx.beginPath();
        ctx.moveTo(0, h);
        for (let x = 0; x <= w; x += 40) {
          const peak = Math.sin(x * 0.005 + 1) * 80 + Math.sin(x * 0.012) * 40;
          ctx.lineTo(x, h * 0.55 - peak);
        }
        ctx.lineTo(w, h);
        ctx.closePath();
        ctx.fill();
        break;
      }
      case 'sky': {
        const skyPulse = Math.sin(time * 0.0005) * 0.1 + 0.15;
        const skyGrad = ctx.createRadialGradient(w * 0.5, 0, 0, w * 0.5, 0, h * 0.8);
        skyGrad.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${skyPulse})`);
        skyGrad.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
        ctx.fillStyle = skyGrad;
        ctx.fillRect(0, 0, w, h * 0.6);
        break;
      }
      case 'creation': {
        const expand = (Math.sin(time * 0.0008) + 1) * 0.5;
        const creationGrad = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w * 0.4 * (expand + 0.3));
        creationGrad.addColorStop(0, `rgba(255, 255, 200, ${0.08 + expand * 0.06})`);
        creationGrad.addColorStop(0.5, `rgba(${r}, ${g}, ${b}, ${0.04 + expand * 0.03})`);
        creationGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = creationGrad;
        ctx.fillRect(0, 0, w, h);
        break;
      }
      case 'darkness': {
        const vignette = ctx.createRadialGradient(w / 2, h / 2, w * 0.2, w / 2, h / 2, w * 0.7);
        vignette.addColorStop(0, 'rgba(0, 0, 0, 0)');
        vignette.addColorStop(1, 'rgba(0, 0, 0, 0.4)');
        ctx.fillStyle = vignette;
        ctx.fillRect(0, 0, w, h);
        break;
      }
      case 'journey': {
        ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, 0.08)`;
        ctx.lineWidth = 2;
        ctx.setLineDash([8, 12]);
        ctx.beginPath();
        ctx.moveTo(0, h * 0.7);
        for (let x = 0; x <= w; x += 5) {
          ctx.lineTo(x, h * 0.7 + Math.sin(x * 0.01 + time * 0.0005) * 30);
        }
        ctx.stroke();
        ctx.setLineDash([]);
        break;
      }
      case 'battle': {
        if (Math.random() < 0.02) {
          const lx = Math.random() * w;
          ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${Math.random() * 0.15})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(lx, 0);
          let ly = 0;
          while (ly < h * 0.4) {
            ly += Math.random() * 20 + 5;
            ctx.lineTo(lx + (Math.random() - 0.5) * 30, ly);
          }
          ctx.stroke();
        }
        break;
      }
      case 'peace': {
        const breathe = Math.sin(time * 0.001) * 0.03 + 0.06;
        const peaceGrad = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w * 0.5);
        peaceGrad.addColorStop(0, `rgba(255, 230, 180, ${breathe})`);
        peaceGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = peaceGrad;
        ctx.fillRect(0, 0, w, h);
        break;
      }
      default:
        break;
    }
  }
}

export function ScriptureVisualizer({ text, category, themes, isActive }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const particlesRef = useRef([]);
  const scenesRef = useRef(['divine', 'light']);

  useEffect(() => {
    if (!isActive || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const palette = TRADITION_PALETTES[category] || TRADITION_PALETTES['old-testament'];

    const resize = () => {
      canvas.width = canvas.offsetWidth * (window.devicePixelRatio > 1 ? 1.5 : 1);
      canvas.height = canvas.offsetHeight * (window.devicePixelRatio > 1 ? 1.5 : 1);
    };
    resize();
    window.addEventListener('resize', resize);

    // Detect scenes from text
    const detected = detectScenes(text);
    scenesRef.current = detected;

    // Create particles based on detected scenes
    const particleCount = 60;
    const particles = [];
    for (let i = 0; i < particleCount; i++) {
      const sceneType = detected[i % detected.length];
      particles.push(new Particle(canvas, sceneType, palette));
    }
    particlesRef.current = particles;

    let startTime = performance.now();

    const animate = (timestamp) => {
      const time = timestamp - startTime;
      const w = canvas.width;
      const h = canvas.height;

      // Clear
      ctx.clearRect(0, 0, w, h);

      // Draw scene background
      drawSceneBackground(ctx, w, h, detected, palette, time);

      // Draw & update particles
      for (const p of particles) {
        p.update();
        p.draw(ctx, time);
      }

      animRef.current = requestAnimationFrame(animate);
    };

    animRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', resize);
    };
  }, [isActive, text, category]);

  if (!isActive) return null;

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 0, opacity: 0.85 }}
      data-testid="scripture-visualizer"
    />
  );
}

export function VisionModeToggle({ isActive, onToggle, scenes }) {
  const SCENE_ICONS = {
    fire: Flame, water: Droplets, light: Sun, darkness: MoonIcon,
    mountain: Mountain, sky: Wind, creation: Sparkles, storm: Wind,
    garden: Sparkles, mystical: Star, divine: Star, peace: Sun,
    battle: Flame, journey: Wind,
  };

  return (
    <button
      onClick={onToggle}
      data-testid="vision-mode-toggle"
      className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[10px] font-medium transition-all"
      style={{
        background: isActive
          ? 'linear-gradient(135deg, rgba(232,121,249,0.15), rgba(129,140,248,0.15))'
          : 'rgba(248,250,252,0.04)',
        border: `1px solid ${isActive ? 'rgba(232,121,249,0.3)' : 'rgba(248,250,252,0.08)'}`,
        color: isActive ? '#E879F9' : 'rgba(255,255,255,0.7)',
        boxShadow: isActive ? '0 0 12px rgba(232,121,249,0.1)' : 'none',
      }}
    >
      {isActive ? <Eye size={12} /> : <EyeOff size={12} />}
      Vision Mode
      {isActive && scenes && scenes.length > 0 && (
        <span className="flex items-center gap-0.5 ml-1">
          {scenes.slice(0, 2).map((s, i) => {
            const Icon = SCENE_ICONS[s] || Sparkles;
            return <Icon key={i} size={9} />;
          })}
        </span>
      )}
    </button>
  );
}

export { detectScenes };
