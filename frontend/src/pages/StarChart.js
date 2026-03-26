import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as THREE from 'three';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Loader2, MapPin, Star, X, Compass, Sparkles, ChevronRight, Eye, BookOpen, Scroll, Volume2, VolumeX, Play, Pause } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const ELEMENT_COLORS = { Fire: '#EF4444', Water: '#3B82F6', Air: '#A78BFA', Earth: '#22C55E' };
const ELEMENT_HEX = { Fire: 0xEF4444, Water: 0x3B82F6, Air: 0xA78BFA, Earth: 0x22C55E };

function raDecToXYZ(ra, dec, radius = 50) {
  const raRad = (ra / 24) * 2 * Math.PI;
  const decRad = (dec / 180) * Math.PI;
  return new THREE.Vector3(
    radius * Math.cos(decRad) * Math.cos(raRad),
    radius * Math.sin(decRad),
    -radius * Math.cos(decRad) * Math.sin(raRad),
  );
}

/* Star glow sprite texture */
function createStarTexture(color = '#ffffff', size = 128) {
  const canvas = document.createElement('canvas');
  canvas.width = size; canvas.height = size;
  const ctx = canvas.getContext('2d');
  const cx = size / 2, cy = size / 2;
  const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, size / 2);
  grad.addColorStop(0, color);
  grad.addColorStop(0.15, color + 'CC');
  grad.addColorStop(0.35, color + '44');
  grad.addColorStop(0.7, color + '08');
  grad.addColorStop(1, 'transparent');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);
  ctx.globalCompositeOperation = 'screen';
  ctx.strokeStyle = color + '60'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(cx, 0); ctx.lineTo(cx, size); ctx.moveTo(0, cy); ctx.lineTo(size, cy); ctx.stroke();
  const tex = new THREE.CanvasTexture(canvas); tex.needsUpdate = true; return tex;
}

/* Nebula cloud sprite texture */
function createNebulaTexture(color, size = 256) {
  const canvas = document.createElement('canvas');
  canvas.width = size; canvas.height = size;
  const ctx = canvas.getContext('2d');
  const cx = size / 2, cy = size / 2;
  const grad = ctx.createRadialGradient(cx * 0.8, cy * 1.1, 0, cx, cy, size / 2);
  grad.addColorStop(0, color + '18'); grad.addColorStop(0.4, color + '0A');
  grad.addColorStop(0.8, color + '03'); grad.addColorStop(1, 'transparent');
  ctx.fillStyle = grad; ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(canvas); tex.needsUpdate = true; return tex;
}

/* Mythology figure outline paths (simplified line art) */
const MYTHOLOGY_PATHS = {
  aries: [[0,-1.8],[0.3,-1.2],[0.8,-0.3],[0.5,0.3],[0.2,0.8],[-0.3,1.2],[-0.8,0.8],[-0.6,0.2],[-0.2,-0.4],[0.5,-0.8],[1.2,-0.5],[1.5,0],[1.2,0.6],[0.7,0.4]], // Ram horns
  taurus: [[-1.5,0],[-0.8,0.4],[-0.2,0.6],[0.3,0.4],[0.8,0.8],[1.2,1.5],[0.8,0.8],[1.5,0.2],[1.8,-0.3],[1.5,0.2],[0.8,-0.2],[0.3,-0.5],[-0.2,-0.3],[-0.8,-0.5],[-1.2,-0.2],[-1.5,0]], // Bull head
  gemini: [[-0.5,1.5],[-0.5,0.5],[-0.5,-0.5],[-0.5,-1.5],[-0.5,-0.5],[0.5,-0.5],[0.5,0.5],[0.5,1.5],[0.5,0.5],[-0.5,0.5]], // Twin figures
  cancer: [[-0.8,0.8],[-0.2,0.3],[0.2,0.3],[0.8,0.8],[0.4,0.2],[0.2,-0.2],[0,-0.6],[-0.2,-0.2],[-0.4,0.2],[-0.8,0.8]], // Crab shape
  leo: [[-1.2,0.5],[-0.6,1],[0,1.2],[0.6,1],[1,0.5],[1.2,0],[1,-0.5],[0.5,-0.8],[0,-0.5],[-0.5,-0.8],[-1,-0.5],[-1.2,0],[-1.2,0.5]], // Lion
  virgo: [[0,1.8],[0,0.8],[0,0],[-0.5,-0.5],[-1,-1],[0,0],[0.5,-0.5],[1,-1],[0,0],[0,-1],[0.3,-1.5],[0.6,-1.8]], // Maiden
  libra: [[-1,0.5],[0,1],[1,0.5],[0,1],[0,-0.5],[-1,-1],[1,-1],[0,-0.5]], // Scales
  scorpio: [[-1.5,0],[-1,0.3],[-0.5,0.2],[0,0],[0.5,-0.2],[1,-0.5],[1.3,-0.8],[1.5,-0.5],[1.2,-0.2],[1.5,0.2]], // Scorpion tail
  sagittarius: [[-0.5,-1],[-0.3,0],[0,0.8],[0.3,0],[-0.3,0],[0.8,0.5],[1.2,0.8],[0.8,0.5],[0.8,-0.2]], // Archer
  capricorn: [[-1,0.5],[-0.5,0.8],[0,0.5],[0.5,0],[0.8,-0.3],[1,-0.8],[0.8,-1.2],[0.5,-1],[0.2,-0.8],[0,-0.5],[-0.3,-0.3],[-0.7,0],[-1,0.5]], // Sea-goat
  aquarius: [[0,1.5],[0,0.5],[0,0],[-0.8,-0.5],[-0.3,-1],[0.3,-0.5],[0.8,-1],[1.3,-0.5]], // Water pouring
  pisces: [[-1.2,0.5],[-0.8,0.8],[-0.4,0.5],[-0.1,0],[0.1,0],[0.4,-0.5],[0.8,-0.8],[1.2,-0.5],[0.8,-0.2],[0.4,0],[0.1,0],[-0.1,0],[-0.4,0.2],[-0.8,0.5]], // Two fish
  orion: [[-0.3,2],[0,1.5],[0.3,2],[0,1.5],[0,0.8],[-0.6,0.3],[-1.2,0.5],[0,0.8],[0.6,0.3],[1.2,0.5],[0,0.8],[0,0],[-0.2,-0.1],[0.2,-0.1],[0,0],[0,-0.8],[-0.4,-1.5],[0,-0.8],[0.4,-1.5]], // Hunter figure
  ursa_major: [[-1.5,0.5],[-0.8,0.3],[-0.3,0.5],[0,0],[0.5,0.3],[1,0.2],[1.5,-0.3]], // Big Dipper
  lyra: [[0,1],[-0.6,0.3],[-0.4,-0.6],[0,-0.8],[0.4,-0.6],[0.6,0.3],[0,1]], // Lyre
  cygnus: [[0,1.5],[0,0.5],[0,-0.5],[0,-1.5],[0,0],[-1,0.3],[0,0],[1,0.3]], // Cross/Swan
};

/* Canvas-drawn mythology figure texture */
function createMythologyTexture(constellationId, color, size = 256) {
  const canvas = document.createElement('canvas');
  canvas.width = size; canvas.height = size;
  const ctx = canvas.getContext('2d');
  const cx = size / 2, cy = size / 2;
  const scale = size / 5;

  const path = MYTHOLOGY_PATHS[constellationId];
  if (!path || path.length < 2) return null;

  // Outer glow
  ctx.shadowColor = color;
  ctx.shadowBlur = 15;
  ctx.strokeStyle = color + '50';
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(cx + path[0][0] * scale, cy - path[0][1] * scale);
  for (let i = 1; i < path.length; i++) {
    ctx.lineTo(cx + path[i][0] * scale, cy - path[i][1] * scale);
  }
  ctx.stroke();

  // Inner line
  ctx.shadowBlur = 8;
  ctx.strokeStyle = color + '90';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(cx + path[0][0] * scale, cy - path[0][1] * scale);
  for (let i = 1; i < path.length; i++) {
    ctx.lineTo(cx + path[i][0] * scale, cy - path[i][1] * scale);
  }
  ctx.stroke();

  // Dot at joints
  ctx.shadowBlur = 6;
  ctx.fillStyle = color + '80';
  path.forEach(p => {
    ctx.beginPath();
    ctx.arc(cx + p[0] * scale, cy - p[1] * scale, 2, 0, Math.PI * 2);
    ctx.fill();
  });

  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}

function ThreeStarChart({ data, containerRef, onSelectConstellation, onBirthMessage, mythologyMode }) {
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const frameRef = useRef(null);
  const spherical = useRef({ theta: 0.5, phi: Math.PI / 3, radius: 60 });
  const isDragging = useRef(false);
  const prevMouse = useRef({ x: 0, y: 0 });
  const constellationMeshes = useRef([]);
  const animState = useRef({ startTime: 0, lineGroups: [] });
  const mythSprites = useRef([]);
  const mythModeRef = useRef(mythologyMode);

  useEffect(() => { mythModeRef.current = mythologyMode; }, [mythologyMode]);

  useEffect(() => {
    if (!containerRef.current || !data) return;
    const container = containerRef.current;
    const w = container.clientWidth, h = container.clientHeight;

    const scene = new THREE.Scene();
    sceneRef.current = scene;
    const camera = new THREE.PerspectiveCamera(55, w / h, 0.1, 500);
    cameraRef.current = camera;
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000005, 1);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // ── DEEP SPACE BACKGROUND ──
    const bgStarCount = 6000;
    const bgGeo = new THREE.BufferGeometry();
    const bgPos = new Float32Array(bgStarCount * 3);
    const bgSz = new Float32Array(bgStarCount);
    const bgCol = new Float32Array(bgStarCount * 3);
    const tints = [[1,1,1],[0.85,0.9,1],[1,0.95,0.8],[0.8,0.85,1],[1,0.85,0.75]];
    for (let i = 0; i < bgStarCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 100 + Math.random() * 80;
      bgPos[i*3] = r * Math.sin(phi) * Math.cos(theta);
      bgPos[i*3+1] = r * Math.sin(phi) * Math.sin(theta);
      bgPos[i*3+2] = r * Math.cos(phi);
      bgSz[i] = 0.08 + Math.random() * 0.25;
      const t = tints[Math.floor(Math.random() * tints.length)];
      bgCol[i*3]=t[0]; bgCol[i*3+1]=t[1]; bgCol[i*3+2]=t[2];
    }
    bgGeo.setAttribute('position', new THREE.BufferAttribute(bgPos, 3));
    bgGeo.setAttribute('aSize', new THREE.BufferAttribute(bgSz, 1));
    bgGeo.setAttribute('color', new THREE.BufferAttribute(bgCol, 3));
    const bgMat = new THREE.ShaderMaterial({
      vertexShader: `attribute float aSize; varying vec3 vColor; varying float vBr;
        void main() { vColor = color; vBr = aSize; vec4 mv = modelViewMatrix * vec4(position,1.0);
        gl_PointSize = aSize * (300.0 / -mv.z); gl_Position = projectionMatrix * mv; }`,
      fragmentShader: `varying vec3 vColor; varying float vBr;
        void main() { float d = length(gl_PointCoord - 0.5) * 2.0;
        float a = smoothstep(1.0, 0.0, d) * vBr * 2.0; gl_FragColor = vec4(vColor, a); }`,
      transparent: true, vertexColors: true, depthWrite: false, blending: THREE.AdditiveBlending,
    });
    const bgStars = new THREE.Points(bgGeo, bgMat);
    scene.add(bgStars);

    // ── NEBULA CLOUDS ──
    ['#4338CA','#7C3AED','#1E40AF','#164E63','#6D28D9'].forEach((c, i) => {
      const tex = createNebulaTexture(c, 512);
      const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, opacity: 0.35, blending: THREE.AdditiveBlending, depthWrite: false });
      const sp = new THREE.Sprite(mat);
      const a = (i / 5) * Math.PI * 2 + Math.random() * 0.5;
      sp.position.set(Math.cos(a)*70, (Math.random()-0.5)*80, Math.sin(a)*70);
      sp.scale.set(60+Math.random()*40, 40+Math.random()*30, 1);
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

      // Stars with glow sprites
      c.stars.forEach(s => {
        const pos = raDecToXYZ(s.ra, s.dec);
        const brightness = Math.max(0.4, 1 - s.mag / 5);
        const baseSize = Math.max(0.3, (5 - s.mag) / 5 * 0.9);
        const starMesh = new THREE.Mesh(
          new THREE.SphereGeometry(baseSize * 0.5, 8, 8),
          new THREE.MeshBasicMaterial({ color: isAligned || isBirth ? hexColor : 0xE8E8FF, transparent: true, opacity: brightness })
        );
        starMesh.position.copy(pos); scene.add(starMesh);
        meshMap.push({ mesh: starMesh, constellation: c });

        const starTex = createStarTexture(isBirth ? '#D8B4FE' : isAligned ? color : '#C8CCFF', 128);
        const spMat = new THREE.SpriteMaterial({ map: starTex, transparent: true, opacity: brightness * (isBirth ? 1.0 : isAligned ? 0.85 : 0.5), blending: THREE.AdditiveBlending, depthWrite: false });
        const sp = new THREE.Sprite(spMat);
        sp.position.copy(pos); sp.scale.set(baseSize*4, baseSize*4, 1);
        if (isBirth) { sp.userData.isBirthStar = true; sp.userData.baseScale = baseSize * 4; }
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

    // ── CONTROLS ──
    const onPointerDown = (e) => { isDragging.current = true; prevMouse.current = { x: e.clientX, y: e.clientY }; };
    const onPointerUp = () => { isDragging.current = false; };
    const onPointerMove = (e) => {
      if (!isDragging.current) return;
      spherical.current.theta -= (e.clientX - prevMouse.current.x) * 0.004;
      spherical.current.phi = Math.max(0.1, Math.min(Math.PI - 0.1, spherical.current.phi - (e.clientY - prevMouse.current.y) * 0.004));
      prevMouse.current = { x: e.clientX, y: e.clientY };
    };
    const onWheel = (e) => { spherical.current.radius = Math.max(12, Math.min(120, spherical.current.radius + e.deltaY * 0.04)); };
    const onTouchStart = (e) => { if (e.touches.length === 1) { isDragging.current = true; prevMouse.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }; } };
    const onTouchEnd = () => { isDragging.current = false; };
    const onTouchMove = (e) => {
      if (!isDragging.current || e.touches.length !== 1) return;
      spherical.current.theta -= (e.touches[0].clientX - prevMouse.current.x) * 0.004;
      spherical.current.phi = Math.max(0.1, Math.min(Math.PI - 0.1, spherical.current.phi - (e.touches[0].clientY - prevMouse.current.y) * 0.004));
      prevMouse.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    };
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    const onClick = (e) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
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
    el.addEventListener('touchmove', onTouchMove, { passive: true });
    el.addEventListener('click', onClick);
    const onResize = () => { const nw = container.clientWidth, nh = container.clientHeight; camera.aspect = nw/nh; camera.updateProjectionMatrix(); renderer.setSize(nw, nh); };
    window.addEventListener('resize', onResize);

    // ── ANIMATION LOOP ──
    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      const now = performance.now();
      const elapsed = (now - animState.current.startTime) / 1000;
      const { theta, phi, radius } = spherical.current;
      camera.position.set(radius * Math.sin(phi) * Math.cos(theta), radius * Math.cos(phi), radius * Math.sin(phi) * Math.sin(theta));
      camera.lookAt(0, 0, 0);
      bgStars.rotation.y += 0.00008;

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

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(frameRef.current);
      el.removeEventListener('pointerdown', onPointerDown); el.removeEventListener('pointerup', onPointerUp);
      el.removeEventListener('pointermove', onPointerMove); el.removeEventListener('wheel', onWheel);
      el.removeEventListener('touchstart', onTouchStart); el.removeEventListener('touchend', onTouchEnd);
      el.removeEventListener('touchmove', onTouchMove); el.removeEventListener('click', onClick);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement);
    };
  }, [data, containerRef, onSelectConstellation, onBirthMessage]);

  return null;
}

function BirthConstellationToast({ info, onClose }) {
  if (!info) return null;
  const color = ELEMENT_COLORS[info.element] || '#D8B4FE';
  return (
    <motion.div initial={{ opacity: 0, y: 30, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.95 }}
      transition={{ duration: 0.6 }}
      className="absolute bottom-20 left-1/2 -translate-x-1/2 z-20 w-80 max-w-[90vw] rounded-2xl p-5 text-center"
      style={{ background: 'rgba(8,10,18,0.92)', border: `1px solid ${color}30`, backdropFilter: 'blur(24px)', boxShadow: `0 0 40px ${color}15` }}
      data-testid="birth-constellation-toast">
      <button onClick={onClose} className="absolute top-2 right-2 p-1 rounded-lg hover:bg-white/5"><X size={12} style={{ color: 'rgba(248,250,252,0.3)' }} /></button>
      <div className="text-2xl mb-1">{info.symbol}</div>
      <p className="text-xs uppercase tracking-[0.25em] mb-1" style={{ color }}>Your Constellation</p>
      <p className="text-base font-semibold" style={{ color: '#F8FAFC', fontFamily: 'Cormorant Garamond, serif' }}>{info.name}</p>
      <p className="text-[11px] mt-2 leading-relaxed" style={{ color: 'rgba(248,250,252,0.55)' }}>{info.meaning}</p>
      <div className="mt-3 flex items-center justify-center gap-1"><Sparkles size={10} style={{ color }} /><span className="text-[10px]" style={{ color }}>Aligned with your cosmic path</span></div>
    </motion.div>
  );
}

/* ── Ambient Cosmic Drone Generator (Web Audio API) ── */
function useCosmicAmbient() {
  const ctxRef = useRef(null);
  const nodesRef = useRef([]);
  const gainRef = useRef(null);
  const activeRef = useRef(false);

  const start = useCallback(() => {
    if (activeRef.current) return;
    activeRef.current = true;
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    ctxRef.current = ctx;
    const master = ctx.createGain();
    master.gain.setValueAtTime(0, ctx.currentTime);
    master.gain.linearRampToValueAtTime(0.08, ctx.currentTime + 2);
    master.connect(ctx.destination);
    gainRef.current = master;

    // Base drone (deep C2)
    const drone = ctx.createOscillator();
    drone.type = 'sine';
    drone.frequency.setValueAtTime(65.41, ctx.currentTime);
    const droneGain = ctx.createGain();
    droneGain.gain.setValueAtTime(0.3, ctx.currentTime);
    drone.connect(droneGain).connect(master);
    drone.start();
    nodesRef.current.push(drone);

    // Fifth harmonic (G2)
    const fifth = ctx.createOscillator();
    fifth.type = 'sine';
    fifth.frequency.setValueAtTime(98.0, ctx.currentTime);
    const fifthGain = ctx.createGain();
    fifthGain.gain.setValueAtTime(0.15, ctx.currentTime);
    fifth.connect(fifthGain).connect(master);
    fifth.start();
    nodesRef.current.push(fifth);

    // Ethereal pad (slow LFO modulated)
    const pad = ctx.createOscillator();
    pad.type = 'triangle';
    pad.frequency.setValueAtTime(196.0, ctx.currentTime);
    const lfo = ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(0.1, ctx.currentTime);
    const lfoGain = ctx.createGain();
    lfoGain.gain.setValueAtTime(3, ctx.currentTime);
    lfo.connect(lfoGain).connect(pad.frequency);
    lfo.start();
    const padGain = ctx.createGain();
    padGain.gain.setValueAtTime(0.06, ctx.currentTime);
    pad.connect(padGain).connect(master);
    pad.start();
    nodesRef.current.push(pad, lfo);

    // Shimmer (high sine with slow sweep)
    const shimmer = ctx.createOscillator();
    shimmer.type = 'sine';
    shimmer.frequency.setValueAtTime(523.25, ctx.currentTime);
    shimmer.frequency.linearRampToValueAtTime(659.25, ctx.currentTime + 20);
    const shimGain = ctx.createGain();
    shimGain.gain.setValueAtTime(0.03, ctx.currentTime);
    shimmer.connect(shimGain).connect(master);
    shimmer.start();
    nodesRef.current.push(shimmer);
  }, []);

  const stop = useCallback(() => {
    if (!activeRef.current) return;
    activeRef.current = false;
    if (gainRef.current && ctxRef.current) {
      gainRef.current.gain.linearRampToValueAtTime(0, ctxRef.current.currentTime + 1.5);
      setTimeout(() => {
        nodesRef.current.forEach(n => { try { n.stop(); } catch {} });
        nodesRef.current = [];
        try { ctxRef.current.close(); } catch {}
        ctxRef.current = null;
      }, 2000);
    }
  }, []);

  useEffect(() => () => { if (activeRef.current) stop(); }, [stop]);
  return { start, stop };
}

/* ── Constellation Story Narrator ── */
function CosmicNarrator({ text, constellationName, color }) {
  const [state, setState] = useState('idle'); // idle, loading, playing, paused
  const [progress, setProgress] = useState(0);
  const [waveData, setWaveData] = useState(new Array(20).fill(0.3));
  const audioRef = useRef(null);
  const analyserRef = useRef(null);
  const animFrameRef = useRef(null);
  const ambient = useCosmicAmbient();

  const fullText = `The story of ${constellationName}. ${text}`;

  const play = async () => {
    if (state === 'paused' && audioRef.current) {
      audioRef.current.play();
      ambient.start();
      setState('playing');
      return;
    }
    setState('loading');
    try {
      const res = await axios.post(`${API}/tts/narrate`, { text: fullText, voice: 'fable', speed: 0.9 });
      const audio = new Audio(`data:audio/mp3;base64,${res.data.audio}`);
      audioRef.current = audio;

      // Analyser for waveform
      const actx = new (window.AudioContext || window.webkitAudioContext)();
      const source = actx.createMediaElementSource(audio);
      const analyser = actx.createAnalyser();
      analyser.fftSize = 64;
      source.connect(analyser).connect(actx.destination);
      analyserRef.current = analyser;

      audio.onended = () => { setState('idle'); setProgress(0); ambient.stop(); };
      audio.ontimeupdate = () => { if (audio.duration) setProgress(audio.currentTime / audio.duration); };
      audio.play();
      ambient.start();
      setState('playing');

      // Waveform animation
      const updateWave = () => {
        if (!analyserRef.current) return;
        const data = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(data);
        const bars = [];
        const step = Math.floor(data.length / 20);
        for (let i = 0; i < 20; i++) bars.push((data[i * step] || 0) / 255);
        setWaveData(bars);
        animFrameRef.current = requestAnimationFrame(updateWave);
      };
      updateWave();
    } catch {
      toast.error('Failed to generate narration');
      setState('idle');
    }
  };

  const pause = () => {
    if (audioRef.current) audioRef.current.pause();
    ambient.stop();
    setState('paused');
  };

  const stop = () => {
    if (audioRef.current) { audioRef.current.pause(); audioRef.current.currentTime = 0; }
    ambient.stop();
    setState('idle');
    setProgress(0);
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
  };

  useEffect(() => () => { stop(); }, []);

  return (
    <div className="rounded-xl overflow-hidden" style={{ background: `${color}06`, border: `1px solid ${color}12` }} data-testid="cosmic-narrator">
      {/* Waveform visualization */}
      {(state === 'playing' || state === 'paused') && (
        <div className="flex items-end justify-center gap-[2px] h-8 px-3 pt-2">
          {waveData.map((v, i) => (
            <motion.div key={i}
              animate={{ height: state === 'playing' ? `${Math.max(8, v * 100)}%` : '20%' }}
              transition={{ duration: 0.1 }}
              className="w-[3px] rounded-full"
              style={{ background: `${color}${state === 'playing' ? '80' : '30'}`, minHeight: 3 }}
            />
          ))}
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center gap-2 px-3 py-2">
        {state === 'idle' ? (
          <button onClick={play} data-testid="narrator-play-btn"
            className="flex items-center gap-1.5 text-[10px] font-medium"
            style={{ color }}>
            <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: `${color}15`, border: `1px solid ${color}30` }}>
              <Volume2 size={10} />
            </div>
            Listen to Story
          </button>
        ) : state === 'loading' ? (
          <div className="flex items-center gap-1.5 text-[10px]" style={{ color: 'rgba(248,250,252,0.4)' }}>
            <Loader2 size={12} className="animate-spin" style={{ color }} />
            Channeling the cosmos...
          </div>
        ) : (
          <>
            <button onClick={state === 'playing' ? pause : play}
              data-testid="narrator-pause-btn"
              className="w-6 h-6 rounded-full flex items-center justify-center"
              style={{ background: `${color}15`, border: `1px solid ${color}30` }}>
              {state === 'playing' ? <Pause size={10} style={{ color }} /> : <Play size={10} style={{ color }} />}
            </button>
            {/* Progress bar */}
            <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: `${color}10` }}>
              <motion.div className="h-full rounded-full" style={{ background: color }} animate={{ width: `${progress * 100}%` }} transition={{ duration: 0.2 }} />
            </div>
            <button onClick={stop} className="text-[9px] px-1.5 py-0.5 rounded" style={{ color: 'rgba(248,250,252,0.3)' }}>
              <VolumeX size={10} />
            </button>
          </>
        )}
      </div>

      {/* Ambient indicator */}
      {(state === 'playing' || state === 'paused') && (
        <div className="px-3 pb-2 flex items-center gap-1">
          <div className="w-1 h-1 rounded-full animate-pulse" style={{ background: color }} />
          <span className="text-[8px]" style={{ color: 'rgba(248,250,252,0.2)' }}>Cosmic ambient active</span>
        </div>
      )}
    </div>
  );
}

/* Mythology Detail Panel — the rich storytelling view */
function MythologyPanel({ constellation, onClose }) {
  const navigate = useNavigate();
  const [showMyth, setShowMyth] = useState(true);

  if (!constellation) return null;
  const color = ELEMENT_COLORS[constellation.element] || '#A78BFA';
  const myth = constellation.mythology;

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
      data-testid="constellation-detail"
      className="absolute top-20 right-4 w-80 max-h-[75vh] overflow-y-auto rounded-2xl z-20"
      style={{ background: 'rgba(8,10,18,0.96)', border: `1px solid ${color}20`, backdropFilter: 'blur(24px)', boxShadow: `0 0 30px ${color}10` }}>
      <button onClick={onClose} className="absolute top-3 right-3 p-1 rounded-lg hover:bg-white/5 z-10"><X size={14} style={{ color: 'rgba(248,250,252,0.3)' }} /></button>

      {/* Header with constellation art visualization */}
      <div className="relative overflow-hidden rounded-t-2xl p-5 pb-4" style={{ background: `linear-gradient(180deg, ${color}08 0%, transparent 100%)` }}>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${color}15`, border: `1px solid ${color}25` }}>
            <Star size={16} style={{ color }} />
          </div>
          <div>
            <p className="text-sm font-bold" style={{ color: '#F8FAFC' }}>{constellation.name}</p>
            <p className="text-[10px]" style={{ color }}>{constellation.symbol} | {constellation.element}</p>
          </div>
        </div>

        {/* Alignment badges */}
        {constellation.alignment_reason?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-2">
            {constellation.alignment_reason.map((r, i) => (
              <span key={i} className="text-[9px] px-2 py-0.5 rounded-full flex items-center gap-1" style={{ background: `${color}10`, color, border: `1px solid ${color}20` }}>
                <Sparkles size={8} /> {r}
              </span>
            ))}
          </div>
        )}
        <p className="text-xs leading-relaxed" style={{ color: 'rgba(248,250,252,0.55)' }}>{constellation.meaning}</p>
      </div>

      {/* Tab toggle */}
      <div className="flex gap-1 px-5 pt-3">
        <button onClick={() => setShowMyth(true)}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] transition-all"
          style={{ background: showMyth ? `${color}12` : 'transparent', color: showMyth ? color : 'rgba(248,250,252,0.35)', border: `1px solid ${showMyth ? `${color}25` : 'transparent'}` }}
          data-testid="tab-mythology">
          <Scroll size={10} /> Mythology
        </button>
        <button onClick={() => setShowMyth(false)}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] transition-all"
          style={{ background: !showMyth ? `${color}12` : 'transparent', color: !showMyth ? color : 'rgba(248,250,252,0.35)', border: `1px solid ${!showMyth ? `${color}25` : 'transparent'}` }}
          data-testid="tab-stars">
          <Star size={10} /> Stars
        </button>
      </div>

      <div className="px-5 pb-5 pt-3">
        <AnimatePresence mode="wait">
          {showMyth && myth ? (
            <motion.div key="myth" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}>
              {/* Mythology figure card */}
              <div className="rounded-xl p-4 mb-3" style={{ background: `${color}06`, border: `1px solid ${color}10` }}>
                <p className="text-[9px] uppercase tracking-[0.2em] mb-1" style={{ color: 'rgba(248,250,252,0.25)' }}>Figure</p>
                <p className="text-sm font-semibold mb-0.5" style={{ color, fontFamily: 'Cormorant Garamond, serif' }}>{myth.figure}</p>
                <div className="flex gap-3 text-[10px] mt-1" style={{ color: 'rgba(248,250,252,0.35)' }}>
                  <span>Origin: {myth.origin}</span>
                  <span>Deity: {myth.deity}</span>
                </div>
              </div>

              {/* Story */}
              <div className="mb-3">
                <p className="text-[9px] uppercase tracking-[0.15em] mb-1.5 flex items-center gap-1" style={{ color: 'rgba(248,250,252,0.25)' }}>
                  <BookOpen size={9} /> The Story
                </p>
                <p className="text-xs leading-relaxed" style={{ color: 'rgba(248,250,252,0.6)', fontFamily: 'Cormorant Garamond, serif', fontSize: '13px' }}>
                  {myth.story}
                </p>
              </div>

              {/* Narration Player */}
              <div className="mb-3">
                <CosmicNarrator text={`${myth.story} The cosmic lesson: ${myth.lesson}`} constellationName={constellation.name} color={color} />
              </div>

              {/* Cosmic Lesson */}
              <div className="rounded-xl p-3" style={{ background: `${color}06`, border: `1px solid ${color}12` }}>
                <p className="text-[9px] uppercase tracking-[0.2em] mb-1.5" style={{ color }}>Cosmic Lesson</p>
                <p className="text-xs leading-relaxed italic" style={{ color: 'rgba(248,250,252,0.7)', fontFamily: 'Cormorant Garamond, serif' }}>
                  "{myth.lesson}"
                </p>
              </div>
            </motion.div>
          ) : (
            <motion.div key="stars" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}>
              <p className="text-[9px] uppercase tracking-wider mb-2" style={{ color: 'rgba(248,250,252,0.25)' }}>Stars</p>
              <div className="space-y-1.5">
                {constellation.stars?.map((s, i) => (
                  <div key={i} className="flex items-center gap-2 text-[11px] py-1" style={{ color: 'rgba(248,250,252,0.5)' }}>
                    <div className="w-2 h-2 rounded-full" style={{ background: color, boxShadow: `0 0 4px ${color}60` }} />
                    <span className="font-medium" style={{ color: 'rgba(248,250,252,0.7)' }}>{s.name}</span>
                    <span className="ml-auto text-[10px]" style={{ color: 'rgba(248,250,252,0.3)' }}>mag {s.mag}</span>
                  </div>
                ))}
              </div>
              {constellation.altitude !== undefined && (
                <p className="text-[10px] mt-3 pt-2" style={{ color: 'rgba(248,250,252,0.25)', borderTop: '1px solid rgba(248,250,252,0.04)' }}>
                  Altitude: {constellation.altitude}° | {constellation.above_horizon ? 'Above horizon' : 'Below horizon'}
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <button onClick={() => navigate('/cosmic-calendar')}
          className="w-full flex items-center justify-center gap-1 py-2 mt-4 rounded-lg text-[10px] font-medium"
          style={{ background: `${color}08`, border: `1px solid ${color}15`, color }}
          data-testid="view-calendar-btn">
          View in Cosmic Calendar <ChevronRight size={10} />
        </button>
      </div>
    </motion.div>
  );
}

export default function StarChart() {
  const { token, authHeaders } = useAuth();
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
  const canvasContainerRef = useRef(null);

  const fetchChart = useCallback((lat, lng) => {
    if (!token) { setLoading(false); return; }
    setLoading(true); setBirthMsg(null);
    axios.get(`${API}/star-chart/constellations?lat=${lat}&lng=${lng}`, { headers: authHeaders })
      .then(r => setData(r.data))
      .catch(() => toast.error('Failed to load star chart'))
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

  const handleSelect = useCallback((c) => setSelected(c), []);
  const handleBirthMessage = useCallback((info) => setBirthMsg(info), []);
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

  if (!token) return (
    <div className="min-h-screen flex items-center justify-center pt-20">
      <p className="text-sm" style={{ color: 'rgba(248,250,252,0.4)' }}>Sign in to explore the cosmic star chart</p>
    </div>
  );

  return (
    <div className="min-h-screen pt-16 relative overflow-hidden" data-testid="star-chart-page">
      {/* Header */}
      <div className="absolute top-16 left-0 right-0 z-10 px-4 py-4 pointer-events-none">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold flex items-center gap-2" style={{ color: '#F8FAFC' }}>
              <Star size={16} style={{ color: '#818CF8' }} /> Constellation Chart
            </h1>
            <p className="text-[10px]" style={{ color: 'rgba(248,250,252,0.3)' }}>Drag to rotate | Scroll to zoom | Click stars for details</p>
          </div>
          <div className="flex items-center gap-2 pointer-events-auto">
            {/* Mythology Mode toggle */}
            <button onClick={() => setMythologyMode(!mythologyMode)} data-testid="mythology-toggle"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] transition-all"
              style={{
                background: mythologyMode ? 'rgba(167,139,250,0.15)' : 'rgba(8,10,18,0.8)',
                border: `1px solid ${mythologyMode ? 'rgba(167,139,250,0.4)' : 'rgba(248,250,252,0.06)'}`,
                color: mythologyMode ? '#A78BFA' : 'rgba(248,250,252,0.5)',
                backdropFilter: 'blur(12px)',
                boxShadow: mythologyMode ? '0 0 20px rgba(167,139,250,0.15)' : 'none',
              }}>
              <Scroll size={10} /> {mythologyMode ? 'Mythology On' : 'Mythology'}
            </button>
            <button onClick={() => setShowLocationPicker(!showLocationPicker)} data-testid="location-btn"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px]"
              style={{ background: 'rgba(8,10,18,0.8)', border: '1px solid rgba(248,250,252,0.06)', color: 'rgba(248,250,252,0.5)', backdropFilter: 'blur(12px)' }}>
              <MapPin size={10} /> {locationName}
            </button>
            {data && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px]"
                style={{ background: 'rgba(8,10,18,0.8)', border: '1px solid rgba(129,140,248,0.15)', color: '#818CF8', backdropFilter: 'blur(12px)' }}>
                <Eye size={10} /> {data.constellations?.length} visible
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Location Picker */}
      <AnimatePresence>
        {showLocationPicker && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="absolute top-28 right-4 z-20 w-64 rounded-2xl p-4" data-testid="location-picker"
            style={{ background: 'rgba(8,10,18,0.96)', border: '1px solid rgba(248,250,252,0.06)', backdropFilter: 'blur(24px)' }}>
            <p className="text-[10px] font-bold uppercase tracking-wider mb-3" style={{ color: 'rgba(248,250,252,0.4)' }}>Set Location</p>
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
                  className="px-2 py-1 rounded text-[9px]" style={{ background: 'rgba(248,250,252,0.04)', border: '1px solid rgba(248,250,252,0.06)', color: 'rgba(248,250,252,0.4)' }}>{loc.name}</button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Element Legend */}
      {data && (
        <div className="absolute bottom-4 left-4 z-10 flex flex-wrap gap-2 pointer-events-none">
          {Object.entries(ELEMENT_COLORS).map(([elem, col]) => (
            <div key={elem} className="flex items-center gap-1 px-2 py-1 rounded-lg text-[9px]"
              style={{ background: 'rgba(8,10,18,0.8)', border: `1px solid ${col}20`, color: col, backdropFilter: 'blur(8px)' }}>
              <div className="w-2 h-2 rounded-full" style={{ background: col, boxShadow: `0 0 6px ${col}80` }} /> {elem}
            </div>
          ))}
          {data.user_zodiac && (
            <div className="flex items-center gap-1 px-2 py-1 rounded-lg text-[9px]"
              style={{ background: 'rgba(8,10,18,0.8)', border: '1px solid rgba(216,180,254,0.2)', color: '#D8B4FE', backdropFilter: 'blur(8px)' }}>
              <div className="w-2 h-2 rounded-full" style={{ background: '#D8B4FE', boxShadow: '0 0 6px rgba(216,180,254,0.8)' }} /> Your Constellation
            </div>
          )}
        </div>
      )}

      {/* Mayan badge */}
      {data && (
        <div className="absolute bottom-4 right-4 z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] pointer-events-none"
          style={{ background: 'rgba(8,10,18,0.8)', border: '1px solid rgba(167,139,250,0.15)', color: '#A78BFA', backdropFilter: 'blur(8px)' }}>
          <Compass size={10} /> Today: {data.mayan_glyph} ({data.mayan_element})
        </div>
      )}

      {/* Detail Panel (with Mythology) */}
      <AnimatePresence>
        {selected && <MythologyPanel constellation={selected} onClose={() => setSelected(null)} />}
      </AnimatePresence>

      {/* Birth Message */}
      <AnimatePresence>
        {birthMsg && <BirthConstellationToast info={birthMsg} onClose={() => setBirthMsg(null)} />}
      </AnimatePresence>

      {/* Mythology Mode indicator */}
      <AnimatePresence>
        {mythologyMode && !selected && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-16 left-1/2 -translate-x-1/2 z-10 px-4 py-2 rounded-xl text-center pointer-events-none"
            style={{ background: 'rgba(8,10,18,0.85)', border: '1px solid rgba(167,139,250,0.2)', backdropFilter: 'blur(12px)' }}>
            <p className="text-[10px] flex items-center gap-1.5" style={{ color: '#A78BFA' }}>
              <Scroll size={10} /> Mythology figures visible | Click a constellation for its story
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3D Canvas */}
      <div ref={canvasContainerRef} className="w-full h-[calc(100vh-4rem)]" data-testid="star-chart-canvas" style={{ background: '#000005' }}>
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Loader2 className="animate-spin mx-auto mb-3" size={28} style={{ color: '#818CF8' }} />
              <p className="text-xs" style={{ color: 'rgba(248,250,252,0.3)' }}>Mapping the celestial sphere...</p>
            </div>
          </div>
        ) : data ? (
          <ThreeStarChart data={data} containerRef={canvasContainerRef} onSelectConstellation={handleSelect} onBirthMessage={handleBirthMessage} mythologyMode={mythologyMode} />
        ) : null}
      </div>
    </div>
  );
}
