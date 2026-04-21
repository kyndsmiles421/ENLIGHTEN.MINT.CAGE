import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useSensory } from '../context/SensoryContext';
import { Loader2, MapPin, Star, X, Compass, Sparkles, ChevronRight, Eye, BookOpen, Scroll, Volume2, VolumeX, Play, Pause, Share2, Smartphone, Globe, Plus, Minus, Search, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import CultureLayerPanel from '../components/CultureLayerPanel';
import { useNavigate } from 'react-router-dom';
import { useCosmicAmbient, CosmicNarrator } from '../components/StarChartAudio';
import { BirthConstellationToast, MythologyPanel, JourneyOverlay, JourneyComplete, CelestialBadgesPanel } from '../components/StarChartOverlays';
import { AstrologyReadingPanel } from '../components/AstrologyReading';
import { NanoGuide } from '../components/NanoGuide';
import { DeepLorePanel } from '../components/DeepLorePanel';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const ELEMENT_COLORS = { Fire: '#EF4444', Water: '#3B82F6', Air: '#A78BFA', Earth: '#22C55E' };
const ELEMENT_HEX = { Fire: 0xEF4444, Water: 0x3B82F6, Air: 0xA78BFA, Earth: 0x22C55E };

function raDecToXYZ(ra, dec, radius = 50) {
  const safeRa = isFinite(ra) ? ra : 0;
  const safeDec = isFinite(dec) ? dec : 0;
  const safeRadius = isFinite(radius) && radius > 0 ? radius : 50;
  const raRad = (safeRa / 24) * 2 * Math.PI;
  const decRad = (safeDec / 180) * Math.PI;
  return new THREE.Vector3(
    safeRadius * Math.cos(decRad) * Math.cos(raRad),
    safeRadius * Math.sin(decRad),
    -safeRadius * Math.cos(decRad) * Math.sin(raRad),
  );
}

/* Star glow sprite texture — enhanced diffraction spikes */
function createStarTexture(color = '#ffffff', size = 128) {
  const canvas = document.createElement('canvas');
  canvas.width = size; canvas.height = size;
  const ctx = canvas.getContext('2d');
  const cx = size / 2, cy = size / 2;
  // Core glow
  const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, size / 2);
  grad.addColorStop(0, color);
  grad.addColorStop(0.08, color + 'E0');
  grad.addColorStop(0.2, color + '80');
  grad.addColorStop(0.4, color + '30');
  grad.addColorStop(0.7, color + '08');
  grad.addColorStop(1, 'transparent');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);
  // 4-point diffraction spikes
  ctx.globalCompositeOperation = 'screen';
  ctx.strokeStyle = color + '50'; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(cx, 2); ctx.lineTo(cx, size - 2); ctx.moveTo(2, cy); ctx.lineTo(size - 2, cy); ctx.stroke();
  // Diagonal spikes (fainter)
  ctx.strokeStyle = color + '25'; ctx.lineWidth = 0.8;
  const d = size * 0.35;
  ctx.beginPath();
  ctx.moveTo(cx - d, cy - d); ctx.lineTo(cx + d, cy + d);
  ctx.moveTo(cx + d, cy - d); ctx.lineTo(cx - d, cy + d);
  ctx.stroke();
  const tex = new THREE.CanvasTexture(canvas); tex.needsUpdate = true; return tex;
}

/* Milky Way band texture */
function createMilkyWayTexture(size = 512) {
  const canvas = document.createElement('canvas');
  canvas.width = size; canvas.height = size;
  const ctx = canvas.getContext('2d');
  // Build up a misty band with random noise
  for (let i = 0; i < 3000; i++) {
    const x = Math.random() * size;
    const y = (size / 2) + (Math.random() - 0.5) * size * 0.35 + Math.sin(x / size * Math.PI * 2) * size * 0.08;
    const r = Math.random() * 3 + 0.5;
    const a = Math.random() * 0.04 + 0.01;
    const colors = ['180,180,220', '200,190,240', '160,180,255', '220,200,180'];
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${colors[Math.floor(Math.random() * colors.length)]}, ${a})`;
    ctx.fill();
  }
  // Gaussian-like center brightness
  const grad = ctx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size * 0.4);
  grad.addColorStop(0, 'rgba(200,190,230,0.03)');
  grad.addColorStop(0.5, 'rgba(180,170,220,0.015)');
  grad.addColorStop(1, 'transparent');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(canvas); tex.needsUpdate = true; return tex;
}

/* Nebula cloud sprite texture — enhanced multi-layer */
function createNebulaTexture(color, size = 512) {
  const canvas = document.createElement('canvas');
  canvas.width = size; canvas.height = size;
  const ctx = canvas.getContext('2d');
  const cx = size / 2, cy = size / 2;
  // Primary cloud
  const grad = ctx.createRadialGradient(cx * 0.8, cy * 1.1, 0, cx, cy, size / 2);
  grad.addColorStop(0, color + '22'); grad.addColorStop(0.3, color + '12');
  grad.addColorStop(0.6, color + '06'); grad.addColorStop(1, 'transparent');
  ctx.fillStyle = grad; ctx.fillRect(0, 0, size, size);
  // Secondary wisps
  const grad2 = ctx.createRadialGradient(cx * 1.3, cy * 0.7, 0, cx, cy, size * 0.4);
  grad2.addColorStop(0, color + '14'); grad2.addColorStop(0.5, color + '06'); grad2.addColorStop(1, 'transparent');
  ctx.fillStyle = grad2; ctx.fillRect(0, 0, size, size);
  // Noise particles
  for (let i = 0; i < 200; i++) {
    const x = cx + (Math.random() - 0.5) * size * 0.6;
    const y = cy + (Math.random() - 0.5) * size * 0.6;
    ctx.beginPath(); ctx.arc(x, y, Math.random() * 2, 0, Math.PI * 2);
    ctx.fillStyle = color + '08'; ctx.fill();
  }
  const tex = new THREE.CanvasTexture(canvas); tex.needsUpdate = true; return tex;
}

/* Mythology figure outline paths — multi-stroke for richer illustrations */
const MYTHOLOGY_PATHS = {
  aries: {
    strokes: [
      [[0.6,1.4],[0.3,1.2],[0,0.9],[-0.1,0.5],[0,0.1],[0.1,-0.3],[0.2,-0.7],[0.1,-1.2]], // Body
      [[0,0.9],[0.4,1.3],[0.8,1.5],[1.0,1.2],[0.9,0.8]], // Right horn
      [[0,0.9],[-0.4,1.3],[-0.8,1.5],[-1.0,1.2],[-0.9,0.8]], // Left horn
      [[0.1,-0.3],[0.5,-0.6],[0.5,-1.2]], // Front leg
      [[0.2,-0.7],[-0.3,-0.8],[-0.3,-1.3]], // Back leg
    ]
  },
  taurus: {
    strokes: [
      [[-0.3,0],[0,0.2],[0.5,0.3],[0.8,0.2],[1.0,0],[0.8,-0.2],[0.3,-0.3],[-0.1,-0.2],[-0.3,0]], // Head
      [[1.0,0],[1.3,0.6],[1.2,1.1]], // Right horn
      [[0.8,0.2],[0.5,0.8],[0.3,1.2]], // Left horn
      [[-0.3,0],[-0.8,-0.1],[-1.2,-0.3],[-1.5,-0.2]], // Neck/body
      [[0.3,-0.3],[0.2,-0.5],[0.3,-0.8]], // Nostril/chin
      [[-0.1,0.1],[0.1,0.05],[0.25,0.15]], // Eye
    ]
  },
  gemini: {
    strokes: [
      [[-0.4,1.5],[-0.4,0.8],[-0.4,0],[-0.4,-0.5],[-0.5,-1.2]], // Left twin body
      [[0.4,1.5],[0.4,0.8],[0.4,0],[0.4,-0.5],[0.5,-1.2]], // Right twin body
      [[-0.4,0.8],[-0.8,0.4]], // Left arm out
      [[0.4,0.8],[0.8,0.4]], // Right arm out
      [[-0.4,0.5],[0.4,0.5]], // Holding hands
      [[-0.6,1.5],[-0.4,1.7],[-0.2,1.5]], // Left head
      [[0.2,1.5],[0.4,1.7],[0.6,1.5]], // Right head
    ]
  },
  cancer: {
    strokes: [
      [[-0.2,0],[0.2,0]], // Body center
      [[-0.2,0],[-0.6,0.3],[-1.0,0.6],[-1.2,1.0]], // Left claw upper
      [[-0.6,0.3],[-1.0,0.1],[-1.1,0.5]], // Left claw lower
      [[0.2,0],[0.6,0.3],[1.0,0.6],[1.2,1.0]], // Right claw upper
      [[0.6,0.3],[1.0,0.1],[1.1,0.5]], // Right claw lower
      [[-0.2,0],[-0.5,-0.4],[-0.8,-0.7]], // Left legs
      [[0.2,0],[0.5,-0.4],[0.8,-0.7]], // Right legs
      [[-0.3,-0.2],[-0.6,-0.5]], // Extra legs
      [[0.3,-0.2],[0.6,-0.5]], // Extra legs
    ]
  },
  leo: {
    strokes: [
      [[0.8,0.8],[0.5,1.0],[0.1,1.1],[-0.3,1.0],[-0.6,0.8],[-0.7,0.5],[-0.6,0.2],[-0.3,0.1],[0,0.2],[0.3,0.1],[0.5,0]], // Mane
      [[0.5,0],[0.4,-0.3],[0.2,-0.5],[0,-0.4],[-0.3,-0.5],[-0.6,-0.3],[-0.8,-0.1]], // Body
      [[-0.8,-0.1],[-1.0,-0.5],[-1.1,-0.9]], // Back leg
      [[0.4,-0.3],[0.5,-0.7],[0.6,-1.0]], // Front leg
      [[-0.8,-0.1],[-1.1,0],[-1.3,0.2],[-1.4,0.5],[-1.2,0.4]], // Tail
      [[0.8,0.8],[1.0,0.6],[1.0,0.3]], // Ear
    ]
  },
  virgo: {
    strokes: [
      [[0,1.6],[0,1.2],[0,0.6],[0,0],[-0.1,-0.5],[0,-1.0],[0.1,-1.4]], // Body/dress
      [[0,0.6],[-0.5,0.3],[-0.9,0.5],[-1.1,0.8]], // Left arm with wheat
      [[0,0.6],[0.5,0.3],[0.8,0.1]], // Right arm
      [[-1.1,0.8],[-1.0,1.1],[-0.9,0.9]], // Wheat sheaf
      [[-1.1,0.8],[-1.2,1.0],[-1.0,1.0]], // Wheat
      [[-0.2,1.6],[0,1.8],[0.2,1.6]], // Head crown
      [[-0.1,-1.0],[-0.4,-1.3]], // Left foot
      [[0.1,-1.0],[0.4,-1.3]], // Right foot
    ]
  },
  libra: {
    strokes: [
      [[0,0.3],[0,-0.8]], // Central post
      [[-1.0,-0.8],[1.0,-0.8]], // Base
      [[-0.7,0.3],[0.7,0.3]], // Beam
      [[-0.7,0.3],[-0.9,0.6],[-0.7,0.9],[-0.5,0.6],[-0.7,0.3]], // Left pan
      [[0.7,0.3],[0.5,0.6],[0.7,0.9],[0.9,0.6],[0.7,0.3]], // Right pan
      [[-0.7,0.3],[-0.7,0.1]], // Left chain
      [[0.7,0.3],[0.7,0.1]], // Right chain
    ]
  },
  scorpio: {
    strokes: [
      [[-1.3,0],[-0.9,0.2],[-0.5,0.1],[-0.1,0],[0.3,-0.1],[0.7,-0.3],[1.0,-0.5]], // Body
      [[1.0,-0.5],[1.2,-0.8],[1.4,-0.5],[1.3,-0.2]], // Stinger curl
      [[-1.3,0],[-1.5,0.4],[-1.7,0.2]], // Left claw
      [[-1.3,0],[-1.5,-0.3],[-1.7,-0.1]], // Right claw
      [[-0.5,0.1],[-0.6,-0.4]], // Leg pair 1
      [[-0.1,0],[-0.2,-0.5]], // Leg pair 2
      [[0.3,-0.1],[0.2,-0.5]], // Leg pair 3
      [[0.7,-0.3],[0.6,-0.7]], // Leg pair 4
    ]
  },
  sagittarius: {
    strokes: [
      [[0,0.5],[0,0],[-0.2,-0.5],[-0.5,-0.8],[-0.3,-1.2]], // Upper body + front legs
      [[0,0],[0.3,-0.3],[0.7,-0.5],[0.8,-0.9],[0.6,-1.2]], // Back body + hind legs
      [[0,0.5],[-0.4,0.8],[-0.8,1.2]], // Bow arm
      [[0,0.5],[0.3,0.9],[0.5,1.3]], // Arrow arm up
      [[-0.8,1.2],[0.5,1.3]], // Bow string
      [[0.5,1.3],[1.0,1.5],[1.5,1.7]], // Arrow
      [[-0.1,0.8],[0,1.0],[0.1,0.8]], // Head
    ]
  },
  capricorn: {
    strokes: [
      [[-0.8,0.8],[-0.4,0.6],[0,0.4],[0.3,0.2],[0.5,0]], // Upper goat body
      [[0.5,0],[0.7,-0.3],[0.8,-0.6],[0.6,-0.9],[0.3,-1.1],[0,-1.0],[-0.2,-0.8]], // Fish tail curl
      [[-0.8,0.8],[-1.0,1.0],[-0.8,1.2],[-0.6,1.0],[-0.8,0.8]], // Head
      [[-0.6,1.0],[-0.4,1.3]], // Horn
      [[0,0.4],[-0.1,-0.1],[-0.2,-0.5]], // Front leg
      [[0.3,0.2],[0.2,-0.2],[0.1,-0.5]], // Mid leg
      [[-0.2,-0.8],[-0.4,-0.6]], // Tail fin
    ]
  },
  aquarius: {
    strokes: [
      [[0,1.6],[0,1.0],[0,0.4],[0,-0.2]], // Body standing
      [[0,1.0],[-0.5,0.8],[-0.8,0.5],[-0.8,0.2]], // Left arm holding urn
      [[-0.8,0.2],[-1.0,0],[-0.8,-0.2]], // Urn
      [[-0.8,0.2],[-0.6,-0.3],[-0.3,-0.7],[0,-1.0],[0.3,-1.2],[0.7,-1.0],[0.5,-0.7]], // Water stream flowing
      [[0,1.0],[0.5,0.7],[0.7,0.5]], // Right arm
      [[-0.1,1.6],[0,1.8],[0.1,1.6]], // Head
      [[-0.1,-0.2],[-0.3,-0.8]], // Left leg
      [[0.1,-0.2],[0.3,-0.8]], // Right leg
    ]
  },
  pisces: {
    strokes: [
      [[-0.8,0.6],[-0.6,0.8],[-0.3,0.7],[-0.5,0.5],[-0.8,0.6]], // Upper fish body
      [[-0.3,0.7],[-0.1,0.5]], // Upper fish tail
      [[0.8,-0.6],[0.6,-0.8],[0.3,-0.7],[0.5,-0.5],[0.8,-0.6]], // Lower fish body
      [[0.3,-0.7],[0.1,-0.5]], // Lower fish tail
      [[-0.1,0.5],[0,0.3],[0,-0.1],[0,-0.3],[0.1,-0.5]], // Connecting cord
      [[-0.6,0.8],[-0.9,0.9]], // Upper fish fin
      [[0.6,-0.8],[0.9,-0.9]], // Lower fish fin
    ]
  },
  orion: {
    strokes: [
      [[-0.1,1.8],[0,2.0],[0.1,1.8]], // Head
      [[0,1.8],[0,1.2],[0,0.5],[0,0]], // Torso
      [[0,1.2],[-0.6,1.0],[-1.0,1.3],[-1.2,1.6]], // Left arm (raised with club)
      [[0,1.2],[0.5,0.9],[0.9,0.6],[1.0,0.3]], // Right arm (holding shield)
      [[1.0,0.3],[1.1,0.8],[0.9,1.1],[1.1,0.8]], // Shield
      [[-0.2,0.1],[0.2,0.1]], // Belt
      [[0,0],[-0.3,-0.5],[-0.4,-1.2]], // Left leg
      [[0,0],[0.3,-0.5],[0.4,-1.2]], // Right leg
      [[-1.2,1.6],[-1.0,1.8],[-1.3,1.9]], // Club
    ]
  },
  ursa_major: {
    strokes: [
      [[-0.3,0.5],[0.2,0.6],[0.6,0.4],[0.8,0.1],[0.6,-0.2],[0.2,-0.3],[-0.2,-0.2],[-0.5,0],[-0.3,0.5]], // Body
      [[-0.5,0],[-0.8,0.2],[-1.0,0.4],[-0.9,0.7]], // Head
      [[-0.9,0.7],[-1.0,0.9]], // Ear
      [[0.8,0.1],[1.1,0.2],[1.4,0.1],[1.6,-0.1]], // Tail
      [[-0.2,-0.2],[-0.3,-0.6],[-0.4,-0.9]], // Front left leg
      [[0.2,-0.3],[0.1,-0.7],[0,-1.0]], // Front right leg
      [[0.6,-0.2],[0.5,-0.6],[0.4,-0.9]], // Back left leg
      [[0.6,0.4],[0.7,0],[0.8,-0.3],[0.9,-0.6]], // Back right leg
    ]
  },
  lyra: {
    strokes: [
      [[0,1.2],[-0.3,0.8],[-0.5,0.3],[-0.4,-0.2],[-0.2,-0.6],[0,-0.8],[0.2,-0.6],[0.4,-0.2],[0.5,0.3],[0.3,0.8],[0,1.2]], // Lyre frame
      [[-0.3,0.8],[0.3,0.8]], // Cross bar
      [[-0.2,0.8],[-0.1,-0.5]], // String 1
      [[0,0.8],[0,-0.6]], // String 2
      [[0.2,0.8],[0.1,-0.5]], // String 3
    ]
  },
  cygnus: {
    strokes: [
      [[0,1.5],[0,0.8],[0,0],[0,-0.5],[0,-1.2]], // Body (vertical)
      [[0,0.3],[-0.8,0.7],[-1.3,0.9]], // Left wing
      [[0,0.3],[0.8,0.7],[1.3,0.9]], // Right wing
      [[-0.8,0.7],[-1.0,0.5]], // Left wing tip
      [[0.8,0.7],[1.0,0.5]], // Right wing tip
      [[-0.1,1.5],[0,1.7],[0.1,1.5]], // Head
      [[0,-1.2],[-0.2,-1.4],[0.2,-1.4]], // Tail feathers
    ]
  },
};

/* Canvas-drawn mythology figure texture — multi-stroke rendering */
function createMythologyTexture(constellationId, color, size = 256) {
  const canvas = document.createElement('canvas');
  canvas.width = size; canvas.height = size;
  const ctx = canvas.getContext('2d');
  const cx = size / 2, cy = size / 2;
  const scale = size / 5;

  const figData = MYTHOLOGY_PATHS[constellationId];
  if (!figData) return null;
  const strokes = figData.strokes || [];
  if (strokes.length === 0) return null;

  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // Draw each stroke with glow
  strokes.forEach((path, si) => {
    if (path.length < 2) return;

    // Outer glow pass
    ctx.save();
    ctx.shadowColor = color;
    ctx.shadowBlur = 12;
    ctx.strokeStyle = color + '35';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(cx + path[0][0] * scale, cy - path[0][1] * scale);
    for (let i = 1; i < path.length; i++) {
      ctx.lineTo(cx + path[i][0] * scale, cy - path[i][1] * scale);
    }
    ctx.stroke();
    ctx.restore();

    // Inner bright line
    ctx.save();
    ctx.shadowColor = color;
    ctx.shadowBlur = 6;
    ctx.strokeStyle = color + '70';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(cx + path[0][0] * scale, cy - path[0][1] * scale);
    for (let i = 1; i < path.length; i++) {
      ctx.lineTo(cx + path[i][0] * scale, cy - path[i][1] * scale);
    }
    ctx.stroke();
    ctx.restore();
  });

  // Dot at key joints (first and last of each stroke)
  ctx.fillStyle = color + '60';
  ctx.shadowColor = color;
  ctx.shadowBlur = 4;
  strokes.forEach(path => {
    if (path.length < 1) return;
    [path[0], path[path.length - 1]].forEach(p => {
      ctx.beginPath();
      ctx.arc(cx + p[0] * scale, cy - p[1] * scale, 1.5, 0, Math.PI * 2);
      ctx.fill();
    });
  });

  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}

function ThreeStarChart({ data, containerRef, onSelectConstellation, onSelectCulturalConst, onBirthMessage, mythologyMode, journeyTarget, onJourneyArrived, gyroEnabled, cultureData, zoomDelta, zoomKey, authHeaders }) {
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const composerRef = useRef(null);
  const frameRef = useRef(null);
  const spherical = useRef({ theta: 0.5, phi: Math.PI / 3, radius: 55 });
  const velocity = useRef({ theta: 0, phi: 0 }); // Camera momentum
  const isDragging = useRef(false);
  const prevMouse = useRef({ x: 0, y: 0 });
  const constellationMeshes = useRef([]);
  const animState = useRef({ startTime: 0, lineGroups: [] });
  const mythSprites = useRef([]);
  const mythModeRef = useRef(mythologyMode);
  const journeyTargetRef = useRef(null);
  const onJourneyArrivedRef = useRef(onJourneyArrived);
  const matrixKeyframesRef = useRef(null);
  const gyroEnabledRef = useRef(gyroEnabled);
  const gyroOffset = useRef({ alpha: null, beta: null });
  const cultureGroupRef = useRef(null);
  const cultureLabelSprites = useRef([]);
  const pinchDistRef = useRef(null);
  const cultureDataRef = useRef(cultureData);

  useEffect(() => { gyroEnabledRef.current = gyroEnabled; }, [gyroEnabled]);

  useEffect(() => { cultureDataRef.current = cultureData; }, [cultureData]);

  // Cultural overlay management — add/remove lines when cultureData changes
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    // Remove existing cultural overlays
    if (cultureGroupRef.current) {
      scene.remove(cultureGroupRef.current);
      cultureGroupRef.current.traverse(child => {
        if (child.geometry) child.geometry.dispose();
        if (child.material) {
          if (child.material.map) child.material.map.dispose();
          child.material.dispose();
        }
      });
      cultureGroupRef.current = null;
    }
    cultureLabelSprites.current = [];

    if (!cultureData || !cultureData.constellations) return;

    const group = new THREE.Group();
    group.userData.isCultureOverlay = true;
    const cColor = cultureData.color || '#FFFFFF';
    const hexColor = new THREE.Color(cColor).getHex();
    const labelSprites = [];

    cultureData.constellations.forEach(c => {
      // Draw constellation lines between stars
      if (c.lines && c.stars) {
        c.lines.forEach(([fromIdx, toIdx]) => {
          if (fromIdx >= c.stars.length || toIdx >= c.stars.length) return;
          const from = raDecToXYZ(c.stars[fromIdx].ra, c.stars[fromIdx].dec);
          const to = raDecToXYZ(c.stars[toIdx].ra, c.stars[toIdx].dec);
          const n = 40;
          const positions = new Float32Array(n * 3);
          for (let k = 0; k < n; k++) {
            const t = k / (n - 1);
            positions[k * 3] = from.x + (to.x - from.x) * t;
            positions[k * 3 + 1] = from.y + (to.y - from.y) * t;
            positions[k * 3 + 2] = from.z + (to.z - from.z) * t;
          }
          const geo = new THREE.BufferGeometry();
          geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
          // Bright cultural line
          const mat = new THREE.LineBasicMaterial({ color: hexColor, transparent: true, opacity: 0.7, linewidth: 1 });
          const line = new THREE.Line(geo, mat);
          group.add(line);
          // Glow line
          const glowMat = new THREE.LineBasicMaterial({ color: hexColor, transparent: true, opacity: 0.25, linewidth: 1 });
          const glowLine = new THREE.Line(geo.clone(), glowMat);
          group.add(glowLine);
        });
      }

      // Cultural mythology figure sprite (using paths from cultural data)
      if (c.paths) {
        const canvas = document.createElement('canvas');
        canvas.width = 256; canvas.height = 256;
        const ctx = canvas.getContext('2d');
        const cx = 128, cy = 128, scale = 256 / 5;
        ctx.lineCap = 'round'; ctx.lineJoin = 'round';
        c.paths.forEach(path => {
          if (path.length < 2) return;
          ctx.save();
          ctx.shadowColor = cColor; ctx.shadowBlur = 10;
          ctx.strokeStyle = cColor + '50'; ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.moveTo(cx + path[0][0] * scale, cy - path[0][1] * scale);
          for (let i = 1; i < path.length; i++) ctx.lineTo(cx + path[i][0] * scale, cy - path[i][1] * scale);
          ctx.stroke(); ctx.restore();
          ctx.save();
          ctx.shadowColor = cColor; ctx.shadowBlur = 5;
          ctx.strokeStyle = cColor + '80'; ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.moveTo(cx + path[0][0] * scale, cy - path[0][1] * scale);
          for (let i = 1; i < path.length; i++) ctx.lineTo(cx + path[i][0] * scale, cy - path[i][1] * scale);
          ctx.stroke(); ctx.restore();
        });
        const tex = new THREE.CanvasTexture(canvas);
        tex.needsUpdate = true;
        const spMat = new THREE.SpriteMaterial({ map: tex, transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending, depthWrite: false });
        const sp = new THREE.Sprite(spMat);
        const center = raDecToXYZ(c.ra, c.dec, 49);
        sp.position.copy(center);
        sp.scale.set(12, 12, 1);
        sp.userData.culturalConst = c;
        group.add(sp);
      }

      // Name label sprite
      const labelCanvas = document.createElement('canvas');
      labelCanvas.width = 256; labelCanvas.height = 64;
      const lctx = labelCanvas.getContext('2d');
      lctx.fillStyle = cColor;
      lctx.font = 'bold 18px Arial';
      lctx.textAlign = 'center';
      lctx.textBaseline = 'middle';
      lctx.shadowColor = cColor; lctx.shadowBlur = 8;
      lctx.fillText(c.name, 128, 32);
      const labelTex = new THREE.CanvasTexture(labelCanvas);
      labelTex.needsUpdate = true;
      const labelMat = new THREE.SpriteMaterial({ map: labelTex, transparent: true, opacity: 0.8, depthWrite: false });
      const labelSp = new THREE.Sprite(labelMat);
      const labelPos = raDecToXYZ(c.ra, c.dec, 46);
      labelSp.position.copy(labelPos);
      labelSp.scale.set(8, 2, 1);
      labelSp.userData.culturalConst = c;
      group.add(labelSp);
      labelSprites.push(labelSp);

      // Highlight stars with cultural color ring
      if (c.stars) {
        c.stars.forEach(s => {
          const pos = raDecToXYZ(s.ra, s.dec);
          const ring = new THREE.Mesh(
            new THREE.RingGeometry(0.6, 0.9, 16),
            new THREE.MeshBasicMaterial({ color: hexColor, transparent: true, opacity: 0.5, side: THREE.DoubleSide })
          );
          ring.position.copy(pos);
          ring.lookAt(0, 0, 0);
          group.add(ring);
        });
      }
    });

    scene.add(group);
    cultureGroupRef.current = group;
    cultureLabelSprites.current = labelSprites;
  }, [cultureData]);

  useEffect(() => { mythModeRef.current = mythologyMode; }, [mythologyMode]);
  useEffect(() => { onJourneyArrivedRef.current = onJourneyArrived; }, [onJourneyArrived]);
  // Handle zoom button presses from parent
  useEffect(() => {
    if (zoomKey > 0 && zoomDelta !== null && spherical.current) {
      spherical.current.radius = Math.max(10, Math.min(130, spherical.current.radius + zoomDelta));
    }
  }, [zoomKey, zoomDelta]);
  useEffect(() => {
    if (journeyTarget) {
      const pos = raDecToXYZ(journeyTarget.ra, journeyTarget.dec, 50);
      const len = Math.sqrt(pos.x*pos.x + pos.y*pos.y + pos.z*pos.z);
      journeyTargetRef.current = {
        theta: Math.atan2(pos.z, pos.x),
        phi: Math.acos(pos.y / len),
        radius: 35,
        id: journeyTarget.id,
      };
      matrixKeyframesRef.current = null;
      // Fetch Rodrigues rotation keyframes for cinematic traverse
      const srcTheta = spherical.current.theta;
      const srcPhi = spherical.current.phi;
      const srcRA = (srcTheta / (2 * Math.PI)) * 24;
      const srcDec = ((srcPhi / Math.PI) * 180) - 90;
      axios.post(`${API}/math/matrix-transform`, {
        source_ra: srcRA, source_dec: srcDec,
        target_ra: journeyTarget.ra, target_dec: journeyTarget.dec,
        radius: 50, steps: 30,
      }, { headers: typeof authHeaders === 'function' ? authHeaders() : (authHeaders || {}) }).then(res => {
        matrixKeyframesRef.current = { frames: res.data.keyframes, idx: 0 };
      }).catch(() => {});
    } else {
      journeyTargetRef.current = null;
      matrixKeyframesRef.current = null;
    }
  }, [journeyTarget]);

  useEffect(() => {
    if (!containerRef.current || !data) return;
    const container = containerRef.current;
    const w = container.clientWidth, h = container.clientHeight;

    const scene = new THREE.Scene();
    sceneRef.current = scene;
    const camera = new THREE.PerspectiveCamera(60, w / h, 0.1, 500);
    cameraRef.current = camera;
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000003, 1);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.4;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // ── BLOOM POST-PROCESSING ──
    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(w, h),
      0.8,   // strength
      0.4,   // radius
      0.85   // threshold
    );
    composer.addPass(bloomPass);
    composer.addPass(new OutputPass());
    composerRef.current = composer;

    // ── DEEP SPACE BACKGROUND — 15000 stars ──
    const bgStarCount = 15000;
    const bgGeo = new THREE.BufferGeometry();
    const bgPos = new Float32Array(bgStarCount * 3);
    const bgSz = new Float32Array(bgStarCount);
    const bgCol = new Float32Array(bgStarCount * 3);
    // Spectral class colors: O(blue), B(blue-white), A(white), F(yellow-white), G(yellow), K(orange), M(red)
    const spectralColors = [
      [0.6,0.7,1.0],[0.75,0.82,1.0],[0.95,0.95,1.0],[1.0,0.98,0.9],
      [1.0,0.95,0.8],[1.0,0.85,0.6],[1.0,0.7,0.5],[0.85,0.85,1.0],
      [0.7,0.8,1.0],[1.0,0.9,0.95]
    ];
    for (let i = 0; i < bgStarCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 90 + Math.random() * 100;
      bgPos[i*3] = r * Math.sin(phi) * Math.cos(theta);
      bgPos[i*3+1] = r * Math.sin(phi) * Math.sin(theta);
      bgPos[i*3+2] = r * Math.cos(phi);
      // Magnitude distribution — most stars dim, few bright
      const mag = Math.pow(Math.random(), 2.5);
      bgSz[i] = 0.05 + mag * 0.4;
      const t = spectralColors[Math.floor(Math.random() * spectralColors.length)];
      const bright = 0.5 + mag * 0.5;
      bgCol[i*3]=t[0]*bright; bgCol[i*3+1]=t[1]*bright; bgCol[i*3+2]=t[2]*bright;
    }
    bgGeo.setAttribute('position', new THREE.BufferAttribute(bgPos, 3));
    bgGeo.setAttribute('aSize', new THREE.BufferAttribute(bgSz, 1));
    bgGeo.setAttribute('color', new THREE.BufferAttribute(bgCol, 3));
    const bgMat = new THREE.ShaderMaterial({
      vertexShader: `
        attribute float aSize;
        varying vec3 vColor;
        varying float vBr;
        void main() {
          vColor = color;
          vBr = aSize;
          vec4 mv = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = aSize * (350.0 / -mv.z);
          gl_Position = projectionMatrix * mv;
        }`,
      fragmentShader: `
        varying vec3 vColor;
        varying float vBr;
        void main() {
          float d = length(gl_PointCoord - 0.5) * 2.0;
          float core = smoothstep(1.0, 0.0, d) * vBr * 2.5;
          float halo = exp(-d * d * 3.0) * vBr * 0.5;
          float a = core + halo;
          gl_FragColor = vec4(vColor * (1.0 + halo * 0.3), a);
        }`,
      transparent: true, vertexColors: true, depthWrite: false, blending: THREE.AdditiveBlending,
    });
    const bgStars = new THREE.Points(bgGeo, bgMat);
    scene.add(bgStars);

    // ── MILKY WAY BAND ──
    const mwTex = createMilkyWayTexture(1024);
    const mwMat = new THREE.SpriteMaterial({ map: mwTex, transparent: true, opacity: 0.25, blending: THREE.AdditiveBlending, depthWrite: false });
    // Two overlapping panels for the galactic plane
    for (let i = 0; i < 3; i++) {
      const mwSprite = new THREE.Sprite(mwMat.clone());
      mwSprite.material.opacity = 0.15 + i * 0.05;
      mwSprite.position.set(Math.cos(i * 2.1) * 10, (i - 1) * 5, Math.sin(i * 2.1) * 10);
      mwSprite.scale.set(200 + i * 20, 50 + i * 8, 1);
      mwSprite.rotation.z = -0.3 + i * 0.15;
      mwSprite.userData.milkyWay = true;
      scene.add(mwSprite);
    }

    // ── NEBULA CLOUDS — 10 vibrant clouds ──
    const nebulaColors = ['#4338CA','#7C3AED','#1E40AF','#164E63','#6D28D9','#BE185D','#B45309','#047857','#7E22CE','#0369A1'];
    nebulaColors.forEach((c, i) => {
      const tex = createNebulaTexture(c, 512);
      const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, opacity: 0.4, blending: THREE.AdditiveBlending, depthWrite: false });
      const sp = new THREE.Sprite(mat);
      const a = (i / nebulaColors.length) * Math.PI * 2 + Math.random() * 0.5;
      const dist = 60 + Math.random() * 30;
      sp.position.set(Math.cos(a)*dist, (Math.random()-0.5)*90, Math.sin(a)*dist);
      sp.scale.set(70+Math.random()*50, 50+Math.random()*35, 1);
      sp.userData.nebulaDrift = { x: (Math.random()-0.5)*0.01, y: (Math.random()-0.5)*0.006 };
      scene.add(sp);
    });

    // ── CONSTELLATION STARS, LINES & MYTHOLOGY SPRITES ──
    const meshMap = [];
    const lineAnimGroups = [];
    const mythSpriteList = [];
    const birthConstellation = data.user_zodiac ? data.constellations.find(c => c.id === data.user_zodiac) : null;

    data.constellations.forEach((c, ci) => {
      const color = ELEMENT_COLORS[c.element] || '#A78BFA';
      const hexColor = ELEMENT_HEX[c.element] || 0xA78BFA;
      const isAligned = c.aligned || c.alignment_reason?.length > 0;
      const isBirth = birthConstellation && c.id === birthConstellation.id;

      // Stars with enhanced glow sprites
      c.stars.forEach(s => {
        const pos = raDecToXYZ(s.ra, s.dec);
        const safeMag = isFinite(s.mag) ? s.mag : 3;
        const brightness = Math.max(0.5, 1 - safeMag / 5);
        const baseSize = Math.max(0.4, (5 - safeMag) / 5 * 1.1);
        const starMesh = new THREE.Mesh(
          new THREE.SphereGeometry(baseSize * 0.5, 12, 12),
          new THREE.MeshBasicMaterial({ color: isAligned || isBirth ? hexColor : 0xE8E8FF, transparent: true, opacity: brightness })
        );
        starMesh.position.copy(pos); scene.add(starMesh);
        meshMap.push({ mesh: starMesh, constellation: c });

        // Enhanced glow sprite — larger halo with bloom interaction
        const starTex = createStarTexture(isBirth ? '#E8D0FF' : isAligned ? color : '#D0D4FF', 128);
        const spMat = new THREE.SpriteMaterial({ map: starTex, transparent: true, opacity: brightness * (isBirth ? 1.0 : isAligned ? 0.9 : 0.6), blending: THREE.AdditiveBlending, depthWrite: false });
        const sp = new THREE.Sprite(spMat);
        sp.position.copy(pos); sp.scale.set(baseSize*5, baseSize*5, 1);
        if (isBirth) { sp.userData.isBirthStar = true; sp.userData.baseScale = baseSize * 5; }
        scene.add(sp);
      });

      // Constellation lines (animated)
      if (c.stars.length >= 2) {
        const points = c.stars.map(s => raDecToXYZ(s.ra, s.dec));
        const segments = [];
        for (let i = 0; i < points.length - 1; i++) segments.push({ from: points[i], to: points[i+1] });
        const lineGroup = new THREE.Group();
        const segLines = [];
        const makeSeg = (seg, clr, op) => {
          const n = 30;
          const fp = new Float32Array(n * 3);
          for (let k = 0; k < n; k++) {
            const t = k / (n - 1);
            fp[k*3] = seg.from.x + (seg.to.x - seg.from.x)*t;
            fp[k*3+1] = seg.from.y + (seg.to.y - seg.from.y)*t;
            fp[k*3+2] = seg.from.z + (seg.to.z - seg.from.z)*t;
          }
          const geo = new THREE.BufferGeometry();
          geo.setAttribute('position', new THREE.BufferAttribute(fp, 3));
          geo.setDrawRange(0, 0);
          const mat = new THREE.LineBasicMaterial({ color: clr, transparent: true, opacity: op, linewidth: 1 });
          const line = new THREE.Line(geo, mat);
          lineGroup.add(line);
          segLines.push({ line, totalPoints: n });
        };
        segments.forEach(seg => makeSeg(seg, isBirth ? 0xD8B4FE : isAligned ? hexColor : 0x3A3A5A, isBirth ? 0.9 : isAligned ? 0.55 : 0.2));
        if (isBirth || isAligned) segments.forEach(seg => makeSeg(seg, isBirth ? 0xE8D0FF : hexColor, isBirth ? 0.35 : 0.2));
        scene.add(lineGroup);
        lineAnimGroups.push({ group: lineGroup, segLines, delay: ci * 0.12, isBirth });
      }

      // Mythology figure sprite (hidden until mythology mode)
      const mythTex = createMythologyTexture(c.id, color, 256);
      if (mythTex) {
        const mythMat = new THREE.SpriteMaterial({ map: mythTex, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false });
        const mythSprite = new THREE.Sprite(mythMat);
        const cCenter = raDecToXYZ(c.ra, c.dec, 49);
        mythSprite.position.copy(cCenter);
        mythSprite.scale.set(12, 12, 1);
        mythSprite.userData.mythId = c.id;
        mythSprite.userData.targetOpacity = 0;
        scene.add(mythSprite);
        mythSpriteList.push(mythSprite);
      }
    });

    constellationMeshes.current = meshMap;
    animState.current = { startTime: performance.now(), lineGroups: lineAnimGroups };
    mythSprites.current = mythSpriteList;

    // ── BIRTH CONSTELLATION AVATAR ──
    if (birthConstellation) {
      const aColor = data.aura_color === 'blue' ? 0x3B82F6 : data.aura_color === 'green' ? 0x22C55E : data.aura_color === 'purple' ? 0xA855F7 : data.aura_color === 'gold' ? 0xEAB308 : 0xD8B4FE;
      const avatarPos = raDecToXYZ(birthConstellation.ra, birthConstellation.dec, 48);
      [2.2, 3.0].forEach((rr, ri) => {
        const ring = new THREE.Mesh(new THREE.TorusGeometry(rr, 0.06, 8, 48), new THREE.MeshBasicMaterial({ color: aColor, transparent: true, opacity: 0.5 - ri*0.2 }));
        ring.position.copy(avatarPos); ring.rotation.x = ri * Math.PI/3;
        ring.userData.isRing = true; ring.userData.ringSpeed = 0.015 + ri*0.008;
        scene.add(ring);
      });
      const core = new THREE.Mesh(new THREE.SphereGeometry(0.45, 16, 16), new THREE.MeshBasicMaterial({ color: aColor, transparent: true, opacity: 0.9 }));
      core.position.copy(avatarPos); core.userData.isBirthCore = true; scene.add(core);
      const aura = new THREE.Mesh(new THREE.SphereGeometry(5, 16, 16), new THREE.MeshBasicMaterial({ color: aColor, transparent: true, opacity: 0.03, side: THREE.BackSide }));
      aura.position.copy(avatarPos); aura.userData.isBirthAura = true; scene.add(aura);
      setTimeout(() => { if (onBirthMessage) onBirthMessage({ name: birthConstellation.name, symbol: birthConstellation.symbol, element: birthConstellation.element, meaning: birthConstellation.meaning }); }, 3500);
    }

    // ── CONTROLS WITH MOMENTUM ──
    const onPointerDown = (e) => { isDragging.current = true; velocity.current = { theta: 0, phi: 0 }; prevMouse.current = { x: e.clientX, y: e.clientY }; };
    const onPointerUp = () => { isDragging.current = false; };
    const onPointerMove = (e) => {
      if (!isDragging.current) return;
      const dx = (e.clientX - prevMouse.current.x) * 0.004;
      const dy = (e.clientY - prevMouse.current.y) * 0.004;
      spherical.current.theta -= dx;
      spherical.current.phi = Math.max(0.1, Math.min(Math.PI - 0.1, spherical.current.phi - dy));
      velocity.current = { theta: -dx, phi: -dy };
      prevMouse.current = { x: e.clientX, y: e.clientY };
    };
    const onWheel = (e) => { spherical.current.radius = Math.max(10, Math.min(130, spherical.current.radius + e.deltaY * 0.04)); };
    const onTouchStart = (e) => {
      if (e.touches.length === 2) {
        // Pinch start — record initial distance
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        pinchDistRef.current = Math.sqrt(dx * dx + dy * dy);
        isDragging.current = false;
      } else if (e.touches.length === 1) {
        isDragging.current = true;
        velocity.current = { theta: 0, phi: 0 };
        prevMouse.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        pinchDistRef.current = null;
      }
    };
    const onTouchEnd = () => { isDragging.current = false; pinchDistRef.current = null; };
    const onTouchMove = (e) => {
      if (e.touches.length === 2 && pinchDistRef.current !== null) {
        // Pinch-to-zoom
        e.preventDefault();
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const delta = pinchDistRef.current - dist;
        spherical.current.radius = Math.max(10, Math.min(130, spherical.current.radius + delta * 0.15));
        pinchDistRef.current = dist;
        return;
      }
      if (!isDragging.current || e.touches.length !== 1) return;
      const dx = (e.touches[0].clientX - prevMouse.current.x) * 0.004;
      const dy = (e.touches[0].clientY - prevMouse.current.y) * 0.004;
      spherical.current.theta -= dx;
      spherical.current.phi = Math.max(0.1, Math.min(Math.PI - 0.1, spherical.current.phi - dy));
      velocity.current = { theta: -dx, phi: -dy };
      prevMouse.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    };
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    const onSelectCulturalConstRef = { current: null };
    const onClick = (e) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);

      // Check cultural constellation sprites first (when a culture is active)
      if (cultureDataRef.current && cultureGroupRef.current) {
        const cultureSprites = [];
        cultureGroupRef.current.traverse(child => {
          if (child.isSprite && child.userData.culturalConst) cultureSprites.push(child);
        });
        if (cultureSprites.length > 0) {
          const cHits = raycaster.intersectObjects(cultureSprites);
          if (cHits.length > 0) {
            const hitSprite = cHits[0].object;
            if (hitSprite.userData.culturalConst && onSelectCulturalConst) {
              onSelectCulturalConst(hitSprite.userData.culturalConst);
              return;
            }
          }
        }
      }

      // Fallback to Western constellations
      const intersects = raycaster.intersectObjects(meshMap.map(m => m.mesh));
      if (intersects.length > 0) {
        const hit = meshMap.find(m => m.mesh === intersects[0].object);
        if (hit) onSelectConstellation(hit.constellation);
      }
    };

    const el = renderer.domElement;
    el.addEventListener('pointerdown', onPointerDown);
    el.addEventListener('pointerup', onPointerUp);
    el.addEventListener('pointermove', onPointerMove);
    el.addEventListener('wheel', onWheel, { passive: true });
    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchend', onTouchEnd);
    el.addEventListener('touchmove', onTouchMove, { passive: false });
    el.addEventListener('click', onClick);
    const onResize = () => { const nw = container.clientWidth, nh = container.clientHeight; camera.aspect = nw/nh; camera.updateProjectionMatrix(); renderer.setSize(nw, nh); composer.setSize(nw, nh); };
    window.addEventListener('resize', onResize);

    // ── GYROSCOPE / DEVICE ORIENTATION ──
    const onDeviceOrientation = (e) => {
      if (!gyroEnabledRef.current) return;
      if (isDragging.current) return;
      const alpha = e.alpha || 0; // compass heading (0-360)
      const beta = e.beta || 0;   // front-back tilt (-180 to 180)
      const gamma = e.gamma || 0; // left-right tilt (-90 to 90)

      // Capture initial offset on first reading
      if (gyroOffset.current.alpha === null) {
        gyroOffset.current = { alpha, beta };
      }

      // Map device orientation to spherical coordinates
      // Alpha = compass direction → theta (horizontal rotation)
      const deltaAlpha = alpha - gyroOffset.current.alpha;
      const targetTheta = (deltaAlpha * Math.PI / 180);

      // Beta = tilt forward/back → phi (vertical angle)
      // When phone is held up at ~45-90 degrees, map to looking up at sky
      const clampedBeta = Math.max(0, Math.min(90, beta));
      const targetPhi = ((90 - clampedBeta) / 90) * Math.PI * 0.8 + 0.1;

      // Smooth interpolation
      spherical.current.theta += (targetTheta - spherical.current.theta) * 0.08;
      spherical.current.phi += (targetPhi - spherical.current.phi) * 0.08;
    };
    window.addEventListener('deviceorientation', onDeviceOrientation);

    // ── ANIMATION LOOP WITH BLOOM ──
    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      const now = performance.now();
      const elapsed = (now - animState.current.startTime) / 1000;

      // Apply camera momentum when not dragging
      if (!isDragging.current) {
        spherical.current.theta += velocity.current.theta;
        spherical.current.phi = Math.max(0.1, Math.min(Math.PI - 0.1, spherical.current.phi + velocity.current.phi));
        velocity.current.theta *= 0.96; // Friction
        velocity.current.phi *= 0.96;
        if (Math.abs(velocity.current.theta) < 0.00001) velocity.current.theta = 0;
        if (Math.abs(velocity.current.phi) < 0.00001) velocity.current.phi = 0;
      }

      const { theta, phi, radius } = spherical.current;
      camera.position.set(radius * Math.sin(phi) * Math.cos(theta), radius * Math.cos(phi), radius * Math.sin(phi) * Math.sin(theta));
      camera.lookAt(0, 0, 0);
      bgStars.rotation.y += 0.00005;

      // Star twinkling effect via shader uniform time (approximate with size attribute)
      const sizeArr = bgGeo.attributes.aSize.array;
      for (let i = 0; i < bgStarCount; i += 50) { // Twinkle every 50th star for perf
        const base = 0.05 + Math.pow(i / bgStarCount, 2.5) * 0.4;
        sizeArr[i] = base * (0.8 + 0.4 * Math.sin(now * 0.002 + i));
      }
      bgGeo.attributes.aSize.needsUpdate = true;

      // Nebula drift
      scene.traverse(obj => {
        if (obj.userData.nebulaDrift) {
          obj.position.x += obj.userData.nebulaDrift.x;
          obj.position.y += obj.userData.nebulaDrift.y;
        }
      });

      // Journey camera animation — DOLLY ZOOM (zoom out → rotate → zoom in)
      const jt = journeyTargetRef.current;
      if (jt) {
        if (!jt._phase) jt._phase = 'pullback';
        if (!jt._startRadius) jt._startRadius = spherical.current.radius;
        const pullbackRadius = Math.min(120, jt._startRadius * 1.8);

        if (jt._phase === 'pullback') {
          // Phase 1: Zoom out with background blur effect
          const lerpSpeed = 0.04;
          spherical.current.radius += (pullbackRadius - spherical.current.radius) * lerpSpeed;
          if (Math.abs(pullbackRadius - spherical.current.radius) < 1) {
            jt._phase = 'traverse';
          }
        } else if (jt._phase === 'traverse') {
          // Phase 2: Rotate to target — use Rodrigues keyframes if available
          const mk = matrixKeyframesRef.current;
          if (mk && mk.frames && mk.idx < mk.frames.length) {
            // Matrix-guided traverse using 4x4 Rodrigues rotation
            const frame = mk.frames[mk.idx];
            const pos = frame.position;
            const len = Math.sqrt(pos[0]*pos[0] + pos[1]*pos[1] + pos[2]*pos[2]);
            if (len > 0.01) {
              spherical.current.theta = Math.atan2(-pos[2], pos[0]);
              spherical.current.phi = Math.acos(Math.max(-1, Math.min(1, pos[1] / len)));
            }
            mk.idx++;
            if (mk.idx >= mk.frames.length) {
              jt._phase = 'approach';
            }
          } else {
            // Fallback: ad-hoc lerp
            const lerpSpeed = 0.035;
            let dTheta = jt.theta - spherical.current.theta;
            if (dTheta > Math.PI) dTheta -= Math.PI * 2;
            if (dTheta < -Math.PI) dTheta += Math.PI * 2;
            const dPhi = jt.phi - spherical.current.phi;
            spherical.current.theta += dTheta * lerpSpeed;
            spherical.current.phi += dPhi * lerpSpeed;
            if (Math.abs(dTheta) < 0.05 && Math.abs(dPhi) < 0.05) {
              jt._phase = 'approach';
            }
          }
        } else if (jt._phase === 'approach') {
          // Phase 3: Zoom in to target radius
          const lerpSpeed = 0.03;
          const dR = jt.radius - spherical.current.radius;
          spherical.current.radius += dR * lerpSpeed;
          if (Math.abs(dR) < 0.5) {
            if (onJourneyArrivedRef.current) onJourneyArrivedRef.current(jt.id);
            journeyTargetRef.current = null;
          }
        }
      }

      // Constellation line drawing
      const drawSpeed = 2.5;
      animState.current.lineGroups.forEach(lg => {
        const lt = elapsed - lg.delay;
        if (lt < 0) return;
        const p = Math.min(lt / drawSpeed, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        lg.segLines.forEach((sl, si) => {
          const sc = lg.segLines.length;
          const total = lg.isBirth ? sc / 2 : sc;
          const idx = si % total;
          const segS = idx / total, segE = (idx + 1) / total;
          const segP = Math.max(0, Math.min(1, (eased - segS) / (segE - segS)));
          sl.line.geometry.setDrawRange(0, Math.floor(segP * sl.totalPoints));
        });
      });

      // Mythology sprites fade in/out
      const mythMode = mythModeRef.current;
      mythSprites.current.forEach(sp => {
        sp.userData.targetOpacity = mythMode ? 0.7 : 0;
        const diff = sp.userData.targetOpacity - sp.material.opacity;
        sp.material.opacity += diff * 0.04;
        // Gentle floating
        if (mythMode) {
          sp.position.y += Math.sin(now * 0.001 + sp.position.x) * 0.002;
        }
      });

      // Birth constellation pulsing
      scene.traverse(obj => {
        if (obj.userData.isRing) { obj.rotation.y += obj.userData.ringSpeed || 0.015; obj.rotation.z += 0.005; }
        if (obj.userData.isBirthStar) { const pulse = 1 + Math.sin(now * 0.003) * 0.15; const s = obj.userData.baseScale * pulse; obj.scale.set(s, s, 1); }
        if (obj.userData.isBirthCore) { obj.material.opacity = 0.7 + Math.sin(now * 0.004) * 0.3; }
        if (obj.userData.isBirthAura) { obj.material.opacity = 0.02 + Math.sin(now * 0.002) * 0.015; }
      });

      composer.render();
    };
    animate();

    return () => {
      cancelAnimationFrame(frameRef.current);
      el.removeEventListener('pointerdown', onPointerDown); el.removeEventListener('pointerup', onPointerUp);
      el.removeEventListener('pointermove', onPointerMove); el.removeEventListener('wheel', onWheel);
      el.removeEventListener('touchstart', onTouchStart); el.removeEventListener('touchend', onTouchEnd);
      el.removeEventListener('touchmove', onTouchMove); el.removeEventListener('click', onClick);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('deviceorientation', onDeviceOrientation);
      composer.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement);
    };
  }, [data, containerRef, onSelectConstellation, onBirthMessage]);

  return null;
}

/* Components extracted to:
   ../components/StarChartOverlays.js (BirthConstellationToast, MythologyPanel, JourneyOverlay, JourneyComplete, CelestialBadgesPanel)
   ../components/StarChartAudio.js (useCosmicAmbient, CosmicNarrator)
*/

export default function StarChart() {
  const { token, authHeaders } = useAuth();
  const { showParticles, showAnimations, animationSpeed } = useSensory();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [birthMsg, setBirthMsg] = useState(null);
  const [mythologyMode, setMythologyMode] = useState(false);
  const [locationName, setLocationName] = useState('New York');
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [latInput, setLatInput] = useState('40.7');
  const [lngInput, setLngInput] = useState('-74.0');
  const [error, setError] = useState(null);

  // Silent dust accrual
  useEffect(() => { if (typeof window.__workAccrue === 'function') window.__workAccrue('constellation_trace', 14); }, []);
  const canvasContainerRef = useRef(null);

  // Journey state
  const [journeyActive, setJourneyActive] = useState(false);
  const [journeyIdx, setJourneyIdx] = useState(0);
  const [journeyPhase, setJourneyPhase] = useState('idle'); // idle, moving, narrating, waiting, complete
  const [journeyPaused, setJourneyPaused] = useState(false);
  const [journeyTarget, setJourneyTarget] = useState(null);
  const [journeyComplete, setJourneyComplete] = useState(false);
  const [showBadges, setShowBadges] = useState(false);
  const [gyroEnabled, setGyroEnabled] = useState(false);
  const journeyAudioRef = useRef(null);
  const journeyAmbient = useCosmicAmbient();
  const journeyPausedRef = useRef(false);

  // Multi-cultural sky state
  const [cultures, setCultures] = useState([]);
  const [activeCulture, setActiveCulture] = useState(null);
  const [cultureData, setCultureData] = useState(null);
  const [showCulturePicker, setShowCulturePicker] = useState(false);
  const [cultureLoading, setCultureLoading] = useState(false);
  const [selectedCulturalConst, setSelectedCulturalConst] = useState(null);
  const [zoomCounter, setZoomCounter] = useState(0);
  const [lastZoomDelta, setLastZoomDelta] = useState(null);
  const [astrologyReading, setAstrologyReading] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [showDeepLore, setShowDeepLore] = useState(false);

  const handleZoom = useCallback((delta) => {
    setLastZoomDelta(delta);
    setZoomCounter(c => c + 1);
  }, []);

  useEffect(() => { journeyPausedRef.current = journeyPaused; }, [journeyPaused]);

  const toggleGyro = useCallback(async () => {
    if (gyroEnabled) {
      setGyroEnabled(false);
      return;
    }
    // iOS 13+ requires permission
    if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
      try {
        const perm = await DeviceOrientationEvent.requestPermission();
        if (perm !== 'granted') { toast.error('Gyroscope permission denied'); return; }
      } catch { toast.error('Could not request gyroscope permission'); return; }
    }
    setGyroEnabled(true);
    toast.success('Gyroscope active — move your phone to explore the sky');
    if (typeof window.__workAccrue === 'function') window.__workAccrue('constellation_trace', 14);
  }, [gyroEnabled]);

  const fetchChart = useCallback((lat, lng) => {
    if (!token) { setLoading(false); setError('Please sign in to view the star chart'); return; }
    setLoading(true); setBirthMsg(null); setError(null);
    axios.get(`${API}/star-chart/constellations?lat=${lat}&lng=${lng}`, { headers: authHeaders })
      .then(r => setData(r.data))
      .catch((err) => { 
        console.error('Star Chart fetch error:', err);
        setError('Failed to load star chart. Please try refreshing the page.');
        toast.error('Failed to load star chart');
      })
      .finally(() => setLoading(false));
  }, [token, authHeaders]);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => { setLatInput(pos.coords.latitude.toFixed(1)); setLngInput(pos.coords.longitude.toFixed(1)); setLocationName('Your Location'); fetchChart(pos.coords.latitude, pos.coords.longitude); },
        () => fetchChart(40.7, -74.0), { timeout: 5000 }
      );
    } else { fetchChart(40.7, -74.0); }
  }, [token]);

  // Fetch available cultures - V55.0 uses omnis/cultures with Lakota as foundational
  useEffect(() => {
    axios.get(`${API}/omnis/cultures`)
      .then(r => {
        setCultures(r.data.cultures || []);
        // Auto-select Lakota as foundational layer if no culture is active
        if (!activeCulture && r.data.foundational_culture) {
          // Delay to allow initial render
          setTimeout(() => {
            selectCulture(r.data.foundational_culture);
          }, 500);
        }
      })
      .catch(() => {
        // Fallback to original endpoint
        axios.get(`${API}/star-chart/cultures`).then(r => setCultures(r.data.cultures || [])).catch(() => {});
      });
  }, []);

  // Fetch culture constellation data when a culture is selected
  const selectCulture = useCallback(async (cultureId) => {
    if (activeCulture === cultureId) {
      setActiveCulture(null);
      setCultureData(null);
      setSelectedCulturalConst(null);
      setShowCulturePicker(false);
      return;
    }
    setCultureLoading(true);
    setSelectedCulturalConst(null);
    try {
      const r = await axios.get(`${API}/star-chart/cultures/${cultureId}`);
      setActiveCulture(cultureId);
      setCultureData(r.data);
      setShowCulturePicker(false);
    } catch {
      toast.error('Failed to load cultural sky data');
    }
    setCultureLoading(false);
  }, [activeCulture]);

  const handleSelect = useCallback((c) => {
    setSelected(c);
    // Award XP for exploring constellation
    if (token) {
      axios.post(`${API}/star-chart/award-xp`, { action: 'constellation_explored', constellation_name: c.name }, { headers: authHeaders }).catch(() => {});
      // Award Sparks for constellation identification
      axios.post(`${API}/sparks/earn`, { action: 'constellation_identify', context: c.id || c.name?.toLowerCase() }, { headers: authHeaders }).catch(() => {});
    }
  }, [token, authHeaders]);
  const handleBirthMessage = useCallback((info) => setBirthMsg(info), []);

  const [readingLoading, setReadingLoading] = useState(false);
  const getMyReading = useCallback(async () => {
    if (!data || !token || readingLoading) return;
    const zodiac = data.user_zodiac;
    const myConst = zodiac ? data.constellations.find(c => c.id === zodiac) : data.constellations[0];
    if (!myConst) { toast.error('No constellation data available'); return; }
    setReadingLoading(true);
    try {
      const res = await axios.post(`${API}/star-chart/astrology-reading`, {
        constellation_id: myConst.id,
        constellation_name: myConst.name,
        constellation_element: myConst.element,
        constellation_meaning: myConst.meaning || '',
      }, { headers: authHeaders });
      setAstrologyReading(res.data);
    } catch { toast.error('Could not generate reading'); }
    setReadingLoading(false);
  }, [data, token, authHeaders, readingLoading]);
  const updateLocation = () => {
    const lat = parseFloat(latInput), lng = parseFloat(lngInput);
    if (isNaN(lat) || isNaN(lng)) { toast.error('Invalid coordinates'); return; }
    setLocationName(`${lat.toFixed(1)}, ${lng.toFixed(1)}`); setShowLocationPicker(false); fetchChart(lat, lng);
  };
  const presetLocations = [
    { name: 'New York', lat: 40.7, lng: -74.0 }, { name: 'London', lat: 51.5, lng: -0.1 },
    { name: 'Tokyo', lat: 35.7, lng: 139.7 }, { name: 'Sydney', lat: -33.9, lng: 151.2 },
    { name: 'Cairo', lat: 30.0, lng: 31.2 }, { name: 'Sao Paulo', lat: -23.5, lng: -46.6 },
  ];

  // ── Journey Control Functions ──
  // Compute the constellation list for Journey mode — uses cultural constellations when active
  const journeyConstellations = activeCulture && cultureData?.constellations?.length
    ? cultureData.constellations
    : data?.constellations || [];

  const startJourney = useCallback(() => {
    if (!journeyConstellations.length) return;
    setJourneyActive(true);
    setJourneyIdx(0);
    setJourneyPhase('moving');
    setJourneyPaused(false);
    setJourneyComplete(false);
    setSelected(null);
    setSelectedCulturalConst(null);
    setMythologyMode(true);
    journeyAmbient.start();
    const first = journeyConstellations[0];
    setJourneyTarget({ ra: first.ra, dec: first.dec, id: first.id });
  }, [journeyConstellations, journeyAmbient]);

  const narrateRef = useRef(null);
  const advanceRef = useRef(null);

  const narrateConstellation = useCallback(async (idx) => {
    if (!journeyConstellations[idx]) return;
    const c = journeyConstellations[idx];

    // If it's a cultural constellation, open the cultural panel; otherwise open the Western panel
    if (activeCulture && cultureData) {
      setSelectedCulturalConst(c);
      setSelected(null);
    } else {
      setSelected(c);
      setSelectedCulturalConst(null);
    }
    setJourneyPhase('narrating');

    const myth = c.mythology;
    if (!myth) { if (advanceRef.current) advanceRef.current(idx); return; }
    // Build story text — cultural data uses 'story' and 'lesson', Western uses 'origin_story'
    const storyText = myth.story
      ? `${c.name}. ${myth.figure}. ${myth.story} The cosmic lesson: ${myth.lesson}`
      : myth.origin_story
        ? `${c.name}. ${myth.figure}. ${myth.origin_story}`
        : `${c.name}. ${myth.figure}.`;

    try {
      const res = await axios.post(`${API}/tts/narrate`, { text: storyText, context: 'constellation' });
      const audio = new Audio(`data:audio/mp3;base64,${res.data.audio}`);
      journeyAudioRef.current = audio;
      audio.onended = () => {
        if (!journeyPausedRef.current && advanceRef.current) advanceRef.current(idx);
      };
      if (!journeyPausedRef.current) audio.play();
    } catch {
      setTimeout(() => { if (!journeyPausedRef.current && advanceRef.current) advanceRef.current(idx); }, 3000);
    }
  }, [journeyConstellations, activeCulture, cultureData]);

  const advanceJourney = useCallback((fromIdx) => {
    const nextIdx = fromIdx + 1;
    if (nextIdx >= journeyConstellations.length) {
      setJourneyPhase('complete');
      setJourneyActive(false);
      setJourneyComplete(true);
      journeyAmbient.stop();
      setSelected(null);
      setSelectedCulturalConst(null);
      if (token) {
        axios.post(`${API}/star-chart/award-xp`, { action: 'journey_completed', constellation_name: '' }, { headers: authHeaders }).catch(() => {});
      }
      return;
    }
    setJourneyIdx(nextIdx);
    setJourneyPhase('moving');
    setSelected(null);
    setSelectedCulturalConst(null);
    const next = journeyConstellations[nextIdx];
    setJourneyTarget({ ra: next.ra, dec: next.dec, id: next.id });
  }, [journeyConstellations, journeyAmbient]);

  useEffect(() => { narrateRef.current = narrateConstellation; }, [narrateConstellation]);
  useEffect(() => { advanceRef.current = advanceJourney; }, [advanceJourney]);

  const handleJourneyArrived = useCallback((id) => {
    const idx = journeyConstellations.findIndex(c => c.id === id);
    if (idx >= 0 && narrateRef.current) narrateRef.current(idx);
  }, [journeyConstellations]);

  const pauseJourney = useCallback(() => {
    setJourneyPaused(true);
    if (journeyAudioRef.current) journeyAudioRef.current.pause();
  }, []);

  const resumeJourney = useCallback(() => {
    setJourneyPaused(false);
    if (journeyAudioRef.current && journeyPhase === 'narrating') journeyAudioRef.current.play();
  }, [journeyPhase]);

  const skipJourney = useCallback(() => {
    if (journeyAudioRef.current) { journeyAudioRef.current.pause(); journeyAudioRef.current = null; }
    if (advanceRef.current) advanceRef.current(journeyIdx);
  }, [journeyIdx]);

  const stopJourney = useCallback(() => {
    if (journeyAudioRef.current) { journeyAudioRef.current.pause(); journeyAudioRef.current = null; }
    journeyAmbient.stop();
    setJourneyActive(false);
    setJourneyPhase('idle');
    setJourneyTarget(null);
    setSelected(null);
    setJourneyPaused(false);
  }, [journeyAmbient]);

  // Fuzzy search — matches partial, misspelled constellation names
  const fuzzyMatch = useCallback((query, name) => {
    const q = query.toLowerCase().trim();
    const n = name.toLowerCase();
    if (n.includes(q)) return 3; // direct substring
    if (n.startsWith(q.slice(0, 2))) return 2; // starts similar
    // Levenshtein-lite: allow 1-2 char typos for short queries
    let matches = 0;
    const shorter = q.length < n.length ? q : n;
    const longer = q.length < n.length ? n : q;
    for (let i = 0; i < shorter.length; i++) {
      if (longer.includes(shorter[i])) matches++;
    }
    const ratio = matches / longer.length;
    return ratio > 0.6 ? 1 : 0;
  }, []);

  const searchResults = searchQuery.length >= 2
    ? [
        ...(data?.constellations || []).map(c => ({ ...c, type: 'western', score: fuzzyMatch(searchQuery, c.name) })),
        ...(cultureData?.constellations || []).map(c => ({ ...c, type: 'cultural', score: fuzzyMatch(searchQuery, c.name) })),
      ].filter(c => c.score > 0).sort((a, b) => b.score - a.score).slice(0, 8)
    : [];

  if (!token) return (
    <div className="min-h-screen flex items-center justify-center pt-20">
      <p className="text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>Sign in to explore the cosmic star chart</p>
    </div>
  );

  return (
    <div className="min-h-screen pt-16 relative overflow-hidden" data-testid="star-chart-page">
      {/* Header */}
      <div className="absolute top-16 left-0 right-0 z-10 px-4 py-3 pointer-events-none">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h1 className="text-lg font-bold flex items-center gap-2" style={{ color: '#F8FAFC' }}>
                <Star size={16} style={{ color: '#818CF8' }} /> Constellation Chart
                <NanoGuide guideId="star-chart" position="top-right" />
              </h1>
              <p className="text-[10px] hidden sm:block" style={{ color: 'rgba(255,255,255,0.65)' }}>Drag to rotate | Scroll/pinch to zoom | Click constellations for stories</p>
            </div>
            {data && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] pointer-events-auto flex-shrink-0"
                style={{ background: 'rgba(0,0,0,0)', border: '1px solid rgba(129,140,248,0.15)', color: '#818CF8', backdropFilter: 'none'}}>
                <Eye size={10} /> {data.constellations?.length} visible
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 pointer-events-auto overflow-x-auto pb-1" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}>
            {/* Multi-Cultural Sky toggle — prominent position */}
            <button onClick={() => setShowCulturePicker(!showCulturePicker)} data-testid="culture-toggle"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] transition-all flex-shrink-0 whitespace-nowrap"
              style={{
                background: activeCulture ? `${cultures.find(c => c.id === activeCulture)?.color || '#818CF8'}18` : 'rgba(0,0,0,0)',
                border: `1px solid ${activeCulture ? `${cultures.find(c => c.id === activeCulture)?.color || '#818CF8'}40` : 'rgba(248,250,252,0.06)'}`,
                color: activeCulture ? (cultures.find(c => c.id === activeCulture)?.color || '#818CF8') : 'rgba(255,255,255,0.75)',
                backdropFilter: 'none',
                boxShadow: activeCulture ? `0 0 15px ${cultures.find(c => c.id === activeCulture)?.color || '#818CF8'}15` : 'none',
              }}>
              <Globe size={10} /> {activeCulture ? cultures.find(c => c.id === activeCulture)?.name || 'Culture' : 'World Skies'}
            </button>
            {/* Stargazing Journey button */}
            {data && !journeyActive && (
              <button onClick={startJourney} data-testid="journey-start-btn"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] transition-all flex-shrink-0 whitespace-nowrap"
                style={{ background: 'linear-gradient(135deg, rgba(129,140,248,0.12), rgba(192,132,252,0.12))', border: '1px solid rgba(167,139,250,0.3)', color: '#C084FC', backdropFilter: 'none', boxShadow: '0 0 15px rgba(192,132,252,0.1)' }}>
                <Compass size={10} /> {activeCulture && cultureData ? `${cultureData.name} Journey` : 'Stargazing Journey'}
              </button>
            )}
            {/* Astrology Reading button */}
            {data && (
              <button onClick={getMyReading} disabled={readingLoading} data-testid="my-reading-btn"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] transition-all flex-shrink-0 whitespace-nowrap"
                style={{
                  background: astrologyReading ? 'rgba(236,72,153,0.15)' : 'linear-gradient(135deg, rgba(236,72,153,0.1), rgba(129,140,248,0.1))',
                  border: `1px solid ${astrologyReading ? 'rgba(236,72,153,0.35)' : 'rgba(236,72,153,0.2)'}`,
                  color: astrologyReading ? '#EC4899' : '#F472B6',
                  backdropFilter: 'none',
                  boxShadow: astrologyReading ? '0 0 15px rgba(236,72,153,0.1)' : 'none',
                }}>
                {readingLoading ? <Loader2 size={10} className="animate-spin" /> : <Sparkles size={10} />}
                {readingLoading ? 'Reading...' : 'My Reading'}
              </button>
            )}
            {/* Mythology Mode toggle */}
            <button onClick={() => setMythologyMode(!mythologyMode)} data-testid="mythology-toggle"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] transition-all flex-shrink-0 whitespace-nowrap"
              style={{
                background: mythologyMode ? 'rgba(167,139,250,0.15)' : 'rgba(0,0,0,0)',
                border: `1px solid ${mythologyMode ? 'rgba(167,139,250,0.4)' : 'rgba(248,250,252,0.06)'}`,
                color: mythologyMode ? '#A78BFA' : 'rgba(255,255,255,0.75)',
                backdropFilter: 'none',
                boxShadow: mythologyMode ? '0 0 20px rgba(167,139,250,0.15)' : 'none',
              }}>
              <Scroll size={10} /> {mythologyMode ? 'Mythology On' : 'Mythology'}
            </button>
            <button onClick={() => setShowBadges(!showBadges)} data-testid="badges-toggle"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] transition-all flex-shrink-0 whitespace-nowrap"
              style={{
                background: showBadges ? 'rgba(192,132,252,0.15)' : 'rgba(0,0,0,0)',
                border: `1px solid ${showBadges ? 'rgba(192,132,252,0.4)' : 'rgba(248,250,252,0.06)'}`,
                color: showBadges ? '#C084FC' : 'rgba(255,255,255,0.75)',
                backdropFilter: 'none',
              }}>
              <Star size={10} /> Badges
            </button>
            {/* Search */}
            <button onClick={() => setShowSearch(!showSearch)} data-testid="star-search-toggle"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] transition-all flex-shrink-0 whitespace-nowrap"
              style={{
                background: showSearch ? 'rgba(45,212,191,0.15)' : 'rgba(0,0,0,0)',
                border: `1px solid ${showSearch ? 'rgba(45,212,191,0.4)' : 'rgba(248,250,252,0.06)'}`,
                color: showSearch ? '#2DD4BF' : 'rgba(255,255,255,0.75)',
                backdropFilter: 'none',
              }}>
              <Search size={10} /> Search
            </button>
            <button onClick={() => setShowLocationPicker(!showLocationPicker)} data-testid="location-btn"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] flex-shrink-0 whitespace-nowrap"
              style={{ background: 'rgba(0,0,0,0)', border: '1px solid rgba(248,250,252,0.06)', color: 'rgba(255,255,255,0.75)', backdropFilter: 'none'}}>
              <MapPin size={10} /> {locationName}
            </button>
            {/* Gyroscope toggle */}
            <button onClick={toggleGyro} data-testid="gyro-toggle"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] transition-all flex-shrink-0 whitespace-nowrap"
              style={{
                background: gyroEnabled ? 'rgba(45,212,191,0.15)' : 'rgba(0,0,0,0)',
                border: `1px solid ${gyroEnabled ? 'rgba(45,212,191,0.4)' : 'rgba(248,250,252,0.06)'}`,
                color: gyroEnabled ? '#2DD4BF' : 'rgba(255,255,255,0.75)',
                backdropFilter: 'none',
                boxShadow: gyroEnabled ? '0 0 20px rgba(45,212,191,0.15)' : 'none',
              }}>
              <Smartphone size={10} /> {gyroEnabled ? 'Gyro On' : 'Gyro'}
            </button>
          </div>
        </div>
      </div>

      {/* Location Picker */}
      <AnimatePresence>
        {showLocationPicker && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="absolute top-28 right-4 z-20 w-64 rounded-2xl p-4" data-testid="location-picker"
            style={{ background: 'rgba(0,0,0,0)', border: '1px solid rgba(248,250,252,0.06)', backdropFilter: 'none'}}>
            <p className="text-[10px] font-bold uppercase tracking-wider mb-3" style={{ color: 'rgba(255,255,255,0.7)' }}>Set Location</p>
            <div className="flex gap-2 mb-3">
              <input type="text" value={latInput} onChange={e => setLatInput(e.target.value)} placeholder="Lat" data-testid="lat-input"
                className="flex-1 px-2 py-1.5 rounded-lg text-[10px]" style={{ background: 'rgba(248,250,252,0.04)', border: '1px solid rgba(248,250,252,0.08)', color: '#F8FAFC', outline: 'none' }} />
              <input type="text" value={lngInput} onChange={e => setLngInput(e.target.value)} placeholder="Lng" data-testid="lng-input"
                className="flex-1 px-2 py-1.5 rounded-lg text-[10px]" style={{ background: 'rgba(248,250,252,0.04)', border: '1px solid rgba(248,250,252,0.08)', color: '#F8FAFC', outline: 'none' }} />
              <button onClick={updateLocation} data-testid="update-location-btn"
                className="px-3 py-1.5 rounded-lg text-[10px] font-medium"
                style={{ background: 'rgba(129,140,248,0.15)', border: '1px solid rgba(129,140,248,0.3)', color: '#818CF8' }}>Go</button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {presetLocations.map(loc => (
                <button key={loc.name} onClick={() => { setLatInput(loc.lat.toString()); setLngInput(loc.lng.toString()); setLocationName(loc.name); setShowLocationPicker(false); fetchChart(loc.lat, loc.lng); }}
                  data-testid={`preset-${loc.name.toLowerCase().replace(/\s/g, '-')}`}
                  className="px-2 py-1 rounded text-[9px]" style={{ background: 'rgba(248,250,252,0.04)', border: '1px solid rgba(248,250,252,0.06)', color: 'rgba(255,255,255,0.7)' }}>{loc.name}</button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Constellation Search */}
      <AnimatePresence>
        {showSearch && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="absolute top-28 left-4 z-20 w-72 rounded-2xl p-4" data-testid="star-search-panel"
            style={{ background: 'rgba(0,0,0,0)', border: '1px solid rgba(45,212,191,0.12)', backdropFilter: 'none'}}>
            <div className="flex items-center gap-2 mb-3">
              <Search size={12} style={{ color: '#2DD4BF' }} />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search constellations..."
                autoFocus
                className="flex-1 text-[11px] bg-transparent outline-none placeholder:text-white/15"
                style={{ color: '#F8FAFC' }}
                data-testid="star-search-input"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="p-0.5">
                  <X size={10} style={{ color: 'rgba(255,255,255,0.65)' }} />
                </button>
              )}
            </div>
            {searchQuery.length >= 2 ? (
              searchResults.length > 0 ? (
                <div className="space-y-1 max-h-48 overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
                  {searchResults.map((c, i) => (
                    <button key={`${c.type}-${c.id || c.name}-${i}`}
                      onClick={() => {
                        if (c.type === 'cultural') {
                          setSelectedCulturalConst(c);
                          setSelected(null);
                        } else {
                          setSelected(c);
                          setSelectedCulturalConst(null);
                        }
                        setShowSearch(false);
                        setSearchQuery('');
                      }}
                      className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-left transition-all hover:bg-white/3"
                      style={{ border: '1px solid rgba(248,250,252,0.03)' }}
                      data-testid={`search-result-${c.name?.toLowerCase().replace(/\s/g, '-')}`}>
                      <div className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0"
                        style={{ background: `${ELEMENT_COLORS[c.element] || '#818CF8'}15` }}>
                        <Star size={9} style={{ color: ELEMENT_COLORS[c.element] || '#818CF8' }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] truncate" style={{ color: '#F8FAFC' }}>{c.name}</p>
                        <p className="text-[8px]" style={{ color: 'rgba(255,255,255,0.65)' }}>
                          {c.type === 'cultural' ? `Cultural` : c.element || 'Star'}
                          {c.meaning && ` · ${c.meaning.slice(0, 30)}`}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-[10px] text-center py-3" style={{ color: 'rgba(255,255,255,0.6)' }}>
                  No constellations found — try a different spelling
                </p>
              )
            ) : (
              <p className="text-[9px] text-center py-2" style={{ color: 'rgba(255,255,255,0.6)' }}>
                Type at least 2 characters to search
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Multi-Cultural Sky Picker */}
      <AnimatePresence>
        {showCulturePicker && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="absolute top-28 right-4 z-20 w-72 rounded-2xl p-4" data-testid="culture-picker"
            style={{ background: 'rgba(0,0,0,0)', border: '1px solid rgba(248,250,252,0.08)', backdropFilter: 'none'}}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Globe size={12} style={{ color: '#818CF8' }} />
                <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.75)' }}>World Sky Views</p>
              </div>
              <button onClick={() => setShowCulturePicker(false)} className="p-1 rounded hover:bg-white/5">
                <X size={10} style={{ color: 'rgba(255,255,255,0.65)' }} />
              </button>
            </div>
            <p className="text-[9px] mb-3 leading-relaxed" style={{ color: 'rgba(255,255,255,0.65)' }}>
              Explore how different civilizations mapped the same stars into their own mythologies
            </p>
            {cultureLoading && (
              <div className="flex justify-center py-3">
                <Loader2 className="animate-spin" size={16} style={{ color: '#818CF8' }} />
              </div>
            )}
            <div className="space-y-1.5">
              {/* Clear selection option */}
              {activeCulture && (
                <button onClick={() => { setActiveCulture(null); setCultureData(null); setSelectedCulturalConst(null); setShowCulturePicker(false); }}
                  data-testid="culture-clear"
                  className="w-full text-left rounded-xl px-3 py-2.5 text-[10px] transition-all"
                  style={{ background: 'rgba(248,250,252,0.04)', border: '1px solid rgba(248,250,252,0.06)', color: 'rgba(255,255,255,0.7)' }}>
                  Show Western (Default)
                </button>
              )}
              {cultures.map(c => {
                const isActive = activeCulture === c.id;
                return (
                  <button key={c.id} onClick={() => selectCulture(c.id)}
                    data-testid={`culture-${c.id}`}
                    className="w-full text-left rounded-xl px-3 py-2.5 transition-all"
                    style={{
                      background: isActive ? `${c.color}12` : 'rgba(248,250,252,0.02)',
                      border: `1px solid ${isActive ? `${c.color}35` : 'rgba(248,250,252,0.04)'}`,
                      boxShadow: isActive ? `0 0 12px ${c.color}10` : 'none',
                    }}>
                    <div className="flex items-center gap-2 mb-0.5">
                      <div className="w-2 h-2 rounded-full" style={{ background: c.color, boxShadow: `0 0 6px ${c.color}80` }} />
                      <span className="text-[11px] font-semibold" style={{ color: isActive ? c.color : 'rgba(255,255,255,0.9)' }}>{c.name}</span>
                      <span className="text-[9px] ml-auto" style={{ color: 'rgba(255,255,255,0.6)' }}>{c.constellation_count} patterns</span>
                    </div>
                    <p className="text-[9px] pl-4 leading-relaxed" style={{ color: 'rgba(255,255,255,0.65)' }}>{c.description?.substring(0, 80)}...</p>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Element Legend */}
      {data && (
        <div className="absolute bottom-4 left-4 z-10 flex flex-wrap gap-2 pointer-events-none">
          {Object.entries(ELEMENT_COLORS).map(([elem, col]) => (
            <div key={elem} className="flex items-center gap-1 px-2 py-1 rounded-lg text-[9px]"
              style={{ background: 'rgba(0,0,0,0)', border: `1px solid ${col}20`, color: col, backdropFilter: 'none'}}>
              <div className="w-2 h-2 rounded-full" style={{ background: col, boxShadow: `0 0 6px ${col}80` }} /> {elem}
            </div>
          ))}
          {data.user_zodiac && (
            <div className="flex items-center gap-1 px-2 py-1 rounded-lg text-[9px]"
              style={{ background: 'rgba(0,0,0,0)', border: '1px solid rgba(216,180,254,0.2)', color: '#D8B4FE', backdropFilter: 'none'}}>
              <div className="w-2 h-2 rounded-full" style={{ background: '#D8B4FE', boxShadow: '0 0 6px rgba(216,180,254,0.8)' }} /> Your Constellation
            </div>
          )}
          {activeCulture && cultureData && (
            <div className="flex items-center gap-1 px-2 py-1 rounded-lg text-[9px]"
              style={{ background: 'rgba(0,0,0,0)', border: `1px solid ${cultureData.color}25`, color: cultureData.color, backdropFilter: 'none'}}>
              <div className="w-2 h-2 rounded-full" style={{ background: cultureData.color, boxShadow: `0 0 6px ${cultureData.color}80` }} /> {cultureData.name}
            </div>
          )}
        </div>
      )}

      {/* Mayan badge */}
      {data && (
        <div className="absolute bottom-4 right-4 z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] pointer-events-none"
          style={{ background: 'rgba(0,0,0,0)', border: '1px solid rgba(167,139,250,0.15)', color: '#A78BFA', backdropFilter: 'none'}}>
          <Compass size={10} /> Today: {data.mayan_glyph} ({data.mayan_element})
        </div>
      )}

      {/* Badges Panel */}
      <AnimatePresence>
        {showBadges && <CelestialBadgesPanel onClose={() => setShowBadges(false)} token={token} authHeaders={authHeaders} />}
      </AnimatePresence>

      {/* Civilization Culture Layers — Hopi/Egyptian/Vedic teachings */}
      <div className="absolute top-28 left-4 z-10 w-52">
        <CultureLayerPanel onLayerData={(layerId, data) => {
          if (data) { selectCulture(layerId); }
          else { setActiveCulture(null); setCultureData(null); }
        }} />
      </div>

      {/* Detail Panel (with Mythology) */}
      <AnimatePresence>
        {selected && <MythologyPanel constellation={selected} onClose={() => setSelected(null)} onReadingReady={(data) => { setAstrologyReading(data); }} />}
      </AnimatePresence>

      {/* Astrology Reading Panel */}
      <AnimatePresence>
        {astrologyReading && <AstrologyReadingPanel readingData={astrologyReading} onClose={() => setAstrologyReading(null)} />}
      </AnimatePresence>

      {/* Birth Message */}
      <AnimatePresence>
        {birthMsg && <BirthConstellationToast info={birthMsg} onClose={() => setBirthMsg(null)} />}
      </AnimatePresence>

      {/* Mythology Mode indicator */}
      <AnimatePresence>
        {mythologyMode && !selected && !journeyActive && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-16 left-1/2 -translate-x-1/2 z-10 px-4 py-2 rounded-xl text-center pointer-events-none"
            style={{ background: 'rgba(0,0,0,0)', border: '1px solid rgba(167,139,250,0.2)', backdropFilter: 'none'}}>
            <p className="text-[10px] flex items-center gap-1.5" style={{ color: '#A78BFA' }}>
              <Scroll size={10} /> Mythology figures visible | Click a constellation for its story
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cultural Sky Overlay indicator — clickable */}
      <AnimatePresence>
        {activeCulture && cultureData && !journeyActive && !selectedCulturalConst && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-16 left-1/2 -translate-x-1/2 z-10 px-4 py-2 rounded-xl text-center cursor-pointer"
            onClick={() => setSelectedCulturalConst(cultureData.constellations?.[0] || null)}
            data-testid="culture-overlay-indicator"
            style={{ background: 'rgba(0,0,0,0)', border: `1px solid ${cultureData.color}25`, backdropFilter: 'none'}}>
            <p className="text-[10px] flex items-center gap-1.5" style={{ color: cultureData.color }}>
              <Globe size={10} /> {cultureData.name} — {cultureData.constellations?.length} patterns | Tap to explore stories
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cultural Story Explorer Panel */}
      <AnimatePresence>
        {selectedCulturalConst && cultureData && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
            className="absolute top-20 right-4 w-80 max-h-[75vh] overflow-y-auto rounded-2xl z-20"
            data-testid="cultural-story-panel"
            style={{ background: 'rgba(0,0,0,0)', border: `1px solid ${cultureData.color}20`, backdropFilter: 'none', boxShadow: `0 0 30px ${cultureData.color}10` }}>
            <button onClick={() => setSelectedCulturalConst(null)} className="absolute top-3 right-3 p-1 rounded-lg hover:bg-white/5 z-10" data-testid="close-cultural-story">
              <X size={14} style={{ color: 'rgba(255,255,255,0.65)' }} />
            </button>

            {/* Culture header */}
            <div className="p-5 pb-3" style={{ background: `linear-gradient(180deg, ${cultureData.color}08 0%, transparent 100%)` }}>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: cultureData.color, boxShadow: `0 0 8px ${cultureData.color}80` }} />
                <p className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: cultureData.color }}>{cultureData.name}</p>
              </div>
              <p className="text-[11px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.7)' }}>{cultureData.description}</p>
            </div>

            {/* Constellation tabs */}
            <div className="flex gap-1 px-4 pb-2 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
              {cultureData.constellations?.map(c => {
                const isActive = selectedCulturalConst?.id === c.id;
                return (
                  <button key={c.id} onClick={() => setSelectedCulturalConst(c)}
                    data-testid={`cultural-tab-${c.id}`}
                    className="flex-shrink-0 px-2.5 py-1 rounded-lg text-[9px] transition-all whitespace-nowrap"
                    style={{
                      background: isActive ? `${cultureData.color}15` : 'transparent',
                      border: `1px solid ${isActive ? `${cultureData.color}30` : 'rgba(248,250,252,0.04)'}`,
                      color: isActive ? cultureData.color : 'rgba(255,255,255,0.65)',
                    }}>
                    {c.name.split('(')[0].trim()}
                  </button>
                );
              })}
            </div>

            {/* Selected constellation story */}
            <div className="px-5 pb-5 pt-2">
              <AnimatePresence mode="wait">
                <motion.div key={selectedCulturalConst.id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${cultureData.color}12`, border: `1px solid ${cultureData.color}20` }}>
                      <Star size={14} style={{ color: cultureData.color }} />
                    </div>
                    <div>
                      <p className="text-sm font-bold" style={{ color: '#F8FAFC' }}>{selectedCulturalConst.name}</p>
                      <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.65)' }}>
                        {selectedCulturalConst.element} element &middot; {selectedCulturalConst.stars?.length || 0} stars
                      </p>
                    </div>
                  </div>

                  {/* CONSTELLATION STAR PATTERN — Visual of the actual stars */}
                  {selectedCulturalConst.stars && selectedCulturalConst.stars.length > 0 && (
                    <div className="mb-3 rounded-xl overflow-hidden" style={{ border: `1px solid ${cultureData.color}15` }}>
                      <canvas
                        ref={el => {
                          if (!el) return;
                          const ctx = el.getContext('2d');
                          const w = el.width = 280;
                          const h = el.height = 180;
                          const stars = selectedCulturalConst.stars;
                          const col = cultureData.color;
                          
                          // Clear
                          ctx.fillStyle = 'rgba(0,0,0,0.3)';
                          ctx.fillRect(0, 0, w, h);
                          
                          // Normalize star positions to canvas
                          const ras = stars.map(s => s.ra || 0);
                          const decs = stars.map(s => s.dec || 0);
                          const minRa = Math.min(...ras), maxRa = Math.max(...ras);
                          const minDec = Math.min(...decs), maxDec = Math.max(...decs);
                          const rangeRa = maxRa - minRa || 1;
                          const rangeDec = maxDec - minDec || 1;
                          const pad = 30;
                          
                          const positions = stars.map(s => ({
                            x: pad + ((s.ra || 0) - minRa) / rangeRa * (w - pad * 2),
                            y: pad + (1 - ((s.dec || 0) - minDec) / rangeDec) * (h - pad * 2),
                            mag: s.magnitude || 3,
                            name: s.name || '',
                          }));
                          
                          // Draw connecting lines
                          if (positions.length > 1) {
                            ctx.strokeStyle = col + '40';
                            ctx.lineWidth = 1;
                            ctx.setLineDash([4, 4]);
                            ctx.beginPath();
                            positions.forEach((p, i) => {
                              if (i === 0) ctx.moveTo(p.x, p.y);
                              else ctx.lineTo(p.x, p.y);
                            });
                            ctx.stroke();
                            ctx.setLineDash([]);
                          }
                          
                          // Draw stars
                          positions.forEach(p => {
                            const size = Math.max(2, 6 - p.mag);
                            const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, size * 3);
                            grad.addColorStop(0, col);
                            grad.addColorStop(0.3, col + 'AA');
                            grad.addColorStop(0.7, col + '30');
                            grad.addColorStop(1, 'transparent');
                            ctx.fillStyle = grad;
                            ctx.beginPath();
                            ctx.arc(p.x, p.y, size * 3, 0, Math.PI * 2);
                            ctx.fill();
                            // Core
                            ctx.fillStyle = '#fff';
                            ctx.beginPath();
                            ctx.arc(p.x, p.y, size * 0.6, 0, Math.PI * 2);
                            ctx.fill();
                          });
                          
                          // Label
                          ctx.fillStyle = col + '80';
                          ctx.font = '9px Manrope, sans-serif';
                          ctx.textAlign = 'center';
                          ctx.fillText(selectedCulturalConst.name.split('(')[0].trim(), w / 2, h - 8);
                        }}
                        style={{ width: '100%', height: 180, display: 'block' }}
                        data-testid="constellation-visual"
                      />
                    </div>
                  )}

                  {selectedCulturalConst.mythology && (
                    <>
                      {/* Figure card */}
                      <div className="rounded-xl p-3 mb-3" style={{ background: `${cultureData.color}06`, border: `1px solid ${cultureData.color}10` }}>
                        <p className="text-[9px] uppercase tracking-[0.2em] mb-1" style={{ color: 'rgba(255,255,255,0.6)' }}>Figure</p>
                        <p className="text-sm font-semibold" style={{ color: cultureData.color, fontFamily: 'Cormorant Garamond, serif' }}>{selectedCulturalConst.mythology.figure}</p>
                        <div className="flex gap-3 text-[10px] mt-1" style={{ color: 'rgba(255,255,255,0.65)' }}>
                          <span>Origin: {selectedCulturalConst.mythology.origin}</span>
                          <span>Deity: {selectedCulturalConst.mythology.deity}</span>
                        </div>
                      </div>

                      {/* Story */}
                      <div className="mb-3">
                        <p className="text-[9px] uppercase tracking-[0.15em] mb-1.5 flex items-center gap-1" style={{ color: 'rgba(255,255,255,0.6)' }}>
                          <BookOpen size={9} /> The Story
                        </p>
                        <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.85)', fontFamily: 'Cormorant Garamond, serif', fontSize: '13px' }}>
                          {selectedCulturalConst.mythology.story}
                        </p>
                      </div>

                      {/* Lesson */}
                      <div className="rounded-xl p-3" style={{ background: `${cultureData.color}06`, border: `1px solid ${cultureData.color}12` }}>
                        <p className="text-[9px] uppercase tracking-[0.2em] mb-1.5" style={{ color: cultureData.color }}>Cosmic Lesson</p>
                        <p className="text-xs leading-relaxed italic" style={{ color: 'rgba(255,255,255,0.9)', fontFamily: 'Cormorant Garamond, serif' }}>
                          "{selectedCulturalConst.mythology.lesson}"
                        </p>
                      </div>

                      {/* Voice narration */}
                      <div className="mt-3">
                        <CosmicNarrator
                          text={`${selectedCulturalConst.mythology.story} The cosmic lesson: ${selectedCulturalConst.mythology.lesson}`}
                          constellationName={selectedCulturalConst.name}
                          color={cultureData.color}
                          authHeaders={authHeaders}
                          token={token}
                        />
                      </div>

                      {/* Go Deeper Button - V55.0 Deep Lore */}
                      <button
                        onClick={() => setShowDeepLore(true)}
                        className="mt-4 w-full py-2.5 rounded-xl text-xs font-medium flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
                        style={{
                          background: `linear-gradient(135deg, ${cultureData.color}20, ${cultureData.color}08)`,
                          border: `1px solid ${cultureData.color}30`,
                          color: cultureData.color,
                        }}
                        data-testid="go-deeper-btn"
                      >
                        <Sparkles size={12} />
                        Go Deeper → Sacred Layers
                      </button>
                    </>
                  )}

                  {/* Stars list */}
                  {selectedCulturalConst.stars && (
                    <div className="mt-3 pt-3" style={{ borderTop: '1px solid rgba(248,250,252,0.04)' }}>
                      <p className="text-[9px] uppercase tracking-wider mb-2" style={{ color: 'rgba(255,255,255,0.6)' }}>Stars</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedCulturalConst.stars.map((s, i) => (
                          <div key={i} className="flex items-center gap-1.5 px-2 py-1 rounded-lg" style={{ background: `${cultureData.color}06`, border: `1px solid ${cultureData.color}08` }}>
                            <div className="w-1.5 h-1.5 rounded-full" style={{ background: cultureData.color }} />
                            <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.75)' }}>{s.name}</span>
                            <span className="text-[9px]" style={{ color: 'rgba(255,255,255,0.6)' }}>m{s.mag}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Deep Lore Panel - V55.0 Multi-layer mythology explorer */}
      <AnimatePresence>
        {showDeepLore && selectedCulturalConst && cultureData && (
          <DeepLorePanel
            cultureId={activeCulture}
            constellationId={selectedCulturalConst.id}
            cultureColor={cultureData.color}
            onClose={() => setShowDeepLore(false)}
            onNavigateConstellation={(cId, constId) => {
              // Navigate to a related constellation
              if (cId !== activeCulture) {
                selectCulture(cId);
              }
              // Find the constellation in the new culture data
              axios.get(`${API}/star-chart/cultures/${cId}`).then(r => {
                const newConst = r.data.constellations?.find(c => c.id === constId);
                if (newConst) {
                  setSelectedCulturalConst(newConst);
                  setCultureData(r.data);
                  setActiveCulture(cId);
                }
              }).catch(() => {});
            }}
          />
        )}
      </AnimatePresence>

      {/* Journey Overlay */}
      <AnimatePresence>
        {journeyActive && data && (
          <JourneyOverlay
            constellations={journeyConstellations}
            active={journeyActive}
            currentIdx={journeyIdx}
            phase={journeyPhase}
            isPaused={journeyPaused}
            onPlay={resumeJourney}
            onPause={pauseJourney}
            onSkip={skipJourney}
            onStop={stopJourney}
          />
        )}
      </AnimatePresence>

      {/* Journey Complete */}
      <AnimatePresence>
        {journeyComplete && data && (
          <JourneyComplete count={journeyConstellations.length} onClose={() => setJourneyComplete(false)} authHeaders={authHeaders} token={token} />
        )}
      </AnimatePresence>

      {/* 3D Canvas */}
      <div ref={canvasContainerRef} className="w-full h-[calc(100vh-4rem)]" data-testid="star-chart-canvas" style={{ background: 'transparent' }}>
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Loader2 className="animate-spin mx-auto mb-3" size={28} style={{ color: '#818CF8' }} />
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.65)' }}>Mapping the celestial sphere...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center px-6">
              <AlertCircle className="mx-auto mb-3" size={32} style={{ color: '#F87171' }} />
              <p className="text-sm mb-2" style={{ color: 'rgba(255,255,255,0.9)' }}>{error}</p>
              <button onClick={() => fetchChart(parseFloat(latInput), parseFloat(lngInput))}
                className="mt-3 px-4 py-2 rounded-lg text-xs"
                style={{ background: 'rgba(124,58,237,0.2)', border: '1px solid rgba(124,58,237,0.3)', color: '#A78BFA' }}>
                Try Again
              </button>
            </div>
          </div>
        ) : data ? (
          <ThreeStarChart data={data} containerRef={canvasContainerRef} onSelectConstellation={handleSelect} onSelectCulturalConst={(c) => setSelectedCulturalConst(c)} onBirthMessage={handleBirthMessage} mythologyMode={mythologyMode} journeyTarget={journeyTarget} onJourneyArrived={handleJourneyArrived} gyroEnabled={gyroEnabled} cultureData={cultureData} zoomDelta={lastZoomDelta} zoomKey={zoomCounter} authHeaders={authHeaders} />
        ) : null}
      </div>

      {/* Zoom Controls — always visible on the map */}
      {data && !journeyActive && (
        <div className="absolute bottom-20 right-4 z-10 flex flex-col gap-1.5" data-testid="zoom-controls">
          <button onClick={() => handleZoom(-8)}
            className="w-10 h-10 rounded-xl flex items-center justify-center transition-all active:scale-90"
            style={{ background: 'rgba(0,0,0,0)', border: '1px solid rgba(248,250,252,0.08)', backdropFilter: 'none', color: 'rgba(255,255,255,0.85)' }}
            data-testid="zoom-in-btn"
            aria-label="Zoom In">
            <Plus size={16} />
          </button>
          <button onClick={() => handleZoom(8)}
            className="w-10 h-10 rounded-xl flex items-center justify-center transition-all active:scale-90"
            style={{ background: 'rgba(0,0,0,0)', border: '1px solid rgba(248,250,252,0.08)', backdropFilter: 'none', color: 'rgba(255,255,255,0.85)' }}
            data-testid="zoom-out-btn"
            aria-label="Zoom Out">
            <Minus size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
