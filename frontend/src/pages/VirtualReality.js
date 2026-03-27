import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Maximize2, Minimize2, Wind, Timer, Flame, Star, Eye, BookOpen, Volume2, VolumeX, Compass, Play, X, Film, Loader2, SkipForward, SkipBack, Pause } from 'lucide-react';
import * as THREE from 'three';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const PORTALS = [
  { id: 'meditation', label: 'Meditation', icon: Timer, color: '#C084FC', path: '/meditation', desc: 'Enter the stillness' },
  { id: 'breathing', label: 'Breathwork', icon: Wind, color: '#2DD4BF', path: '/breathing', desc: 'Master your breath' },
  { id: 'yoga', label: 'Yoga', icon: Flame, color: '#FB923C', path: '/yoga', desc: 'Move with intention' },
  { id: 'starchart', label: 'Star Chart', icon: Star, color: '#FCD34D', path: '/star-chart', desc: 'Explore the cosmos' },
  { id: 'oracle', label: 'Oracle', icon: Eye, color: '#6366F1', path: '/oracle', desc: 'Seek divine guidance' },
  { id: 'teachings', label: 'Teachings', icon: BookOpen, color: '#22C55E', path: '/teachings', desc: 'Ancient wisdom' },
];

const hexToRgb = (hex) => {
  const h = hex || '#C084FC';
  return [parseInt(h.slice(1, 3), 16) / 255, parseInt(h.slice(3, 5), 16) / 255, parseInt(h.slice(5, 7), 16) / 255];
};

export default function VirtualReality() {
  const mountRef = useRef(null);
  const sceneRef = useRef({});
  const { authHeaders } = useAuth();
  const navigate = useNavigate();
  const [energyState, setEnergyState] = useState(null);
  const [avatarConfig, setAvatarConfig] = useState(null);
  const [hoveredPortal, setHoveredPortal] = useState(null);
  const [fullscreen, setFullscreen] = useState(false);
  const [ambientAudio, setAmbientAudio] = useState(false);
  const [vrMeditation, setVrMeditation] = useState(null); // { phase, step, elapsed, total }
  const vrMedRef = useRef(null);
  const audioCtxRef = useRef(null);
  const audioNodesRef = useRef([]);
  const mouseRef = useRef({ x: 0, y: 0 });
  const raycasterRef = useRef(new THREE.Raycaster());
  const pointerRef = useRef(new THREE.Vector2());

  // Constellation Journey state
  const [showJourneyPicker, setShowJourneyPicker] = useState(false);
  const [activeJourney, setActiveJourney] = useState(null); // { journey, step, elapsed, total }
  const journeyCamRef = useRef({ active: false, target: null, lookTarget: null });
  const journeyGroupRef = useRef(null);

  // VR Story Theater state
  const [showTheaterPicker, setShowTheaterPicker] = useState(false);
  const [theaterStories, setTheaterStories] = useState([]);
  const [vrTheater, setVrTheater] = useState(null);
  const theaterAudioRef = useRef(null);

  // Load data
  useEffect(() => {
    axios.get(`${API}/avatar`, { headers: authHeaders }).then(r => setAvatarConfig(r.data)).catch(() => {});
    axios.get(`${API}/avatar/energy-state`, { headers: authHeaders }).then(r => setEnergyState(r.data)).catch(() => {});
  }, [authHeaders]);

  // Ambient cosmic audio
  const toggleAudio = useCallback(() => {
    if (ambientAudio) {
      audioNodesRef.current.forEach(n => { try { n.stop?.(); n.disconnect?.(); } catch {} });
      audioNodesRef.current = [];
      if (audioCtxRef.current) { audioCtxRef.current.close(); audioCtxRef.current = null; }
      setAmbientAudio(false);
      return;
    }
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    audioCtxRef.current = ctx;
    const nodes = [];

    // Deep cosmic drone
    const drone = ctx.createOscillator();
    drone.type = 'sine';
    drone.frequency.value = 65.41; // C2
    const droneGain = ctx.createGain();
    droneGain.gain.value = 0.06;
    drone.connect(droneGain).connect(ctx.destination);
    drone.start();
    nodes.push(drone);

    // Fifth harmonic
    const fifth = ctx.createOscillator();
    fifth.type = 'sine';
    fifth.frequency.value = 98;
    const fifthGain = ctx.createGain();
    fifthGain.gain.value = 0.03;
    fifth.connect(fifthGain).connect(ctx.destination);
    fifth.start();
    nodes.push(fifth);

    // Shimmer pad
    const shimmer = ctx.createOscillator();
    shimmer.type = 'triangle';
    shimmer.frequency.value = 523.25;
    const shimGain = ctx.createGain();
    shimGain.gain.value = 0.008;
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.15;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 0.005;
    lfo.connect(lfoGain).connect(shimGain.gain);
    lfo.start();
    shimmer.connect(shimGain).connect(ctx.destination);
    shimmer.start();
    nodes.push(shimmer, lfo);

    audioNodesRef.current = nodes;
    setAmbientAudio(true);
  }, [ambientAudio]);

  useEffect(() => {
    return () => {
      audioNodesRef.current.forEach(n => { try { n.stop?.(); n.disconnect?.(); } catch {} });
      if (audioCtxRef.current) audioCtxRef.current.close();
    };
  }, []);

  // Three.js scene
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x030308, 0.0008);

    const camera = new THREE.PerspectiveCamera(60, container.clientWidth / container.clientHeight, 0.1, 5000);
    camera.position.set(0, 2, 18);
    camera.lookAt(0, 1, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.8;
    container.appendChild(renderer.domElement);

    // ===== ENVIRONMENT =====

    // Starfield
    const starGeo = new THREE.BufferGeometry();
    const starCount = 8000;
    const starPos = new Float32Array(starCount * 3);
    const starSizes = new Float32Array(starCount);
    const starColors = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 200 + Math.random() * 2000;
      starPos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      starPos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      starPos[i * 3 + 2] = r * Math.cos(phi);
      starSizes[i] = Math.random() * 2.5 + 0.3;
      const temp = Math.random();
      if (temp > 0.9) { starColors[i * 3] = 0.7; starColors[i * 3 + 1] = 0.8; starColors[i * 3 + 2] = 1; }
      else if (temp > 0.75) { starColors[i * 3] = 1; starColors[i * 3 + 1] = 0.9; starColors[i * 3 + 2] = 0.7; }
      else { starColors[i * 3] = 1; starColors[i * 3 + 1] = 1; starColors[i * 3 + 2] = 1; }
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    starGeo.setAttribute('size', new THREE.BufferAttribute(starSizes, 1));
    starGeo.setAttribute('color', new THREE.BufferAttribute(starColors, 3));
    const starMat = new THREE.PointsMaterial({ size: 1.5, vertexColors: true, transparent: true, opacity: 0.9, sizeAttenuation: true });
    const stars = new THREE.Points(starGeo, starMat);
    scene.add(stars);

    // Nebula clouds
    const nebulaGroup = new THREE.Group();
    const nebulaColors = [0x3b1261, 0x1a0a3e, 0x0c2461, 0x1a0033, 0x0a1628];
    for (let i = 0; i < 12; i++) {
      const nebulaGeo = new THREE.PlaneGeometry(120 + Math.random() * 200, 120 + Math.random() * 200);
      const nebulaMat = new THREE.MeshBasicMaterial({
        color: nebulaColors[i % nebulaColors.length],
        transparent: true, opacity: 0.04 + Math.random() * 0.04,
        side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending,
      });
      const nebula = new THREE.Mesh(nebulaGeo, nebulaMat);
      nebula.position.set((Math.random() - 0.5) * 300, (Math.random() - 0.5) * 100, -100 - Math.random() * 400);
      nebula.rotation.z = Math.random() * Math.PI;
      nebulaGroup.add(nebula);
    }
    scene.add(nebulaGroup);

    // ===== COSMIC DUST PARTICLES =====
    const dustGeo = new THREE.BufferGeometry();
    const dustCount = 3000;
    const dustPos = new Float32Array(dustCount * 3);
    const dustVel = new Float32Array(dustCount * 3);
    for (let i = 0; i < dustCount; i++) {
      dustPos[i * 3] = (Math.random() - 0.5) * 80;
      dustPos[i * 3 + 1] = (Math.random() - 0.5) * 40;
      dustPos[i * 3 + 2] = (Math.random() - 0.5) * 80;
      dustVel[i * 3] = (Math.random() - 0.5) * 0.01;
      dustVel[i * 3 + 1] = (Math.random() - 0.5) * 0.005;
      dustVel[i * 3 + 2] = (Math.random() - 0.5) * 0.01;
    }
    dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
    const dustMat = new THREE.PointsMaterial({ color: 0xaa88ee, size: 0.2, transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending, depthWrite: false });
    const dust = new THREE.Points(dustGeo, dustMat);
    scene.add(dust);

    // ===== AVATAR FIGURE =====
    const avatarGroup = new THREE.Group();
    avatarGroup.position.set(0, 0, 0);

    // Avatar body - ethereal glowing pillar
    const bodyGeo = new THREE.CylinderGeometry(0.3, 0.5, 3.5, 16, 1, true);
    const bodyMat = new THREE.MeshBasicMaterial({ color: 0x7c3aed, transparent: true, opacity: 0.4, side: THREE.DoubleSide, depthWrite: false });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 1.75;
    avatarGroup.add(body);

    // Avatar head
    const headGeo = new THREE.SphereGeometry(0.45, 24, 24);
    const headMat = new THREE.MeshBasicMaterial({ color: 0xc084fc, transparent: true, opacity: 0.45, depthWrite: false });
    const head = new THREE.Mesh(headGeo, headMat);
    head.position.y = 3.85;
    avatarGroup.add(head);

    // Avatar aura sphere
    const auraGeo = new THREE.SphereGeometry(2.8, 32, 32);
    const auraMat = new THREE.MeshBasicMaterial({ color: 0xc084fc, transparent: true, opacity: 0.07, side: THREE.BackSide, depthWrite: false, blending: THREE.AdditiveBlending });
    const aura = new THREE.Mesh(auraGeo, auraMat);
    aura.position.y = 2;
    avatarGroup.add(aura);

    // Inner aura glow
    const innerAuraGeo = new THREE.SphereGeometry(1.8, 32, 32);
    const innerAuraMat = new THREE.MeshBasicMaterial({ color: 0xc084fc, transparent: true, opacity: 0.1, side: THREE.BackSide, depthWrite: false, blending: THREE.AdditiveBlending });
    const innerAura = new THREE.Mesh(innerAuraGeo, innerAuraMat);
    innerAura.position.y = 2;
    avatarGroup.add(innerAura);

    // Chakra points on avatar
    const chakraColors = [0xef4444, 0xfb923c, 0xfcd34d, 0x22c55e, 0x3b82f6, 0x6366f1, 0xc084fc];
    const chakraMeshes = [];
    for (let i = 0; i < 7; i++) {
      const cGeo = new THREE.SphereGeometry(0.1, 12, 12);
      const cMat = new THREE.MeshBasicMaterial({ color: chakraColors[i], transparent: true, opacity: 0.8 });
      const cMesh = new THREE.Mesh(cGeo, cMat);
      cMesh.position.y = 0.6 + i * 0.5;
      avatarGroup.add(cMesh);
      chakraMeshes.push(cMesh);
    }

    // Energy rings
    const ringMeshes = [];
    for (let i = 0; i < 3; i++) {
      const rGeo = new THREE.TorusGeometry(2 + i * 0.8, 0.02, 8, 64);
      const rMat = new THREE.MeshBasicMaterial({ color: 0xc084fc, transparent: true, opacity: 0.2 - i * 0.04, blending: THREE.AdditiveBlending, depthWrite: false });
      const ring = new THREE.Mesh(rGeo, rMat);
      ring.position.y = 2;
      ring.rotation.x = Math.PI / 2 + (i - 1) * 0.15;
      avatarGroup.add(ring);
      ringMeshes.push(ring);
    }

    scene.add(avatarGroup);

    // ===== PORTAL ORBS =====
    const portalMeshes = [];
    const portalGroup = new THREE.Group();
    PORTALS.forEach((p, i) => {
      const angle = (i / PORTALS.length) * Math.PI * 2 - Math.PI / 2;
      const radius = 9;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const [r, g, b] = hexToRgb(p.color);

      // Outer glow
      const glowGeo = new THREE.SphereGeometry(1.4, 24, 24);
      const glowMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(r, g, b), transparent: true, opacity: 0.1, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.BackSide });
      const glow = new THREE.Mesh(glowGeo, glowMat);

      // Core
      const coreGeo = new THREE.SphereGeometry(0.6, 24, 24);
      const coreMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(r, g, b), transparent: true, opacity: 0.55 });
      const core = new THREE.Mesh(coreGeo, coreMat);

      // Inner bright
      const innerGeo = new THREE.SphereGeometry(0.3, 16, 16);
      const innerMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(Math.min(1, r * 1.5), Math.min(1, g * 1.5), Math.min(1, b * 1.5)), transparent: true, opacity: 0.8 });
      const inner = new THREE.Mesh(innerGeo, innerMat);

      const group = new THREE.Group();
      group.add(glow);
      group.add(core);
      group.add(inner);
      group.position.set(x, 2.5 + Math.sin(i * 1.2) * 0.5, z);
      group.userData = { portalId: p.id, path: p.path, baseY: group.position.y };
      portalGroup.add(group);
      portalMeshes.push({ group, core, glow, inner, data: p });
    });
    scene.add(portalGroup);

    // ===== GROUND PLANE (energy grid) =====
    const gridGeo = new THREE.PlaneGeometry(100, 100, 40, 40);
    const gridMat = new THREE.MeshBasicMaterial({ color: 0x2a1a5e, transparent: true, opacity: 0.2, wireframe: true, depthWrite: false });
    const grid = new THREE.Mesh(gridGeo, gridMat);
    grid.rotation.x = -Math.PI / 2;
    grid.position.y = -0.5;
    scene.add(grid);

    // ===== LIGHTING (ambient point lights) =====
    const ambLight = new THREE.AmbientLight(0x221133, 0.8);
    scene.add(ambLight);
    const pointLight = new THREE.PointLight(0xc084fc, 2, 40);
    pointLight.position.set(0, 5, 0);
    scene.add(pointLight);

    // Store refs
    sceneRef.current = { scene, camera, renderer, stars, dust, dustPos, dustVel, dustCount, avatarGroup, aura, innerAura, body, head, bodyMat, headMat, auraMat, innerAuraMat, chakraMeshes, ringMeshes, portalMeshes, portalGroup, grid, pointLight, nebulaGroup };

    // Camera orbit
    let orbitAngle = 0;
    let orbitRadius = 18;
    let orbitY = 4;
    let targetAngle = 0;
    let targetRadius = 18;
    let targetY = 4;
    let isDragging = false;
    let lastMouse = { x: 0, y: 0 };

    const onMouseDown = (e) => { isDragging = true; lastMouse = { x: e.clientX, y: e.clientY }; };
    const onMouseUp = () => { isDragging = false; };
    const onMouseMove = (e) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
      if (isDragging) {
        const dx = e.clientX - lastMouse.x;
        const dy = e.clientY - lastMouse.y;
        targetAngle -= dx * 0.005;
        targetY = Math.max(1, Math.min(12, targetY + dy * 0.03));
        lastMouse = { x: e.clientX, y: e.clientY };
      }
      // Raycasting for portal hover
      const rect = renderer.domElement.getBoundingClientRect();
      pointerRef.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointerRef.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    };
    const onWheel = (e) => {
      targetRadius = Math.max(8, Math.min(30, targetRadius + e.deltaY * 0.01));
    };
    const onClick = (e) => {
      const rect = renderer.domElement.getBoundingClientRect();
      pointerRef.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointerRef.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycasterRef.current.setFromCamera(pointerRef.current, camera);
      for (const pm of portalMeshes) {
        const hits = raycasterRef.current.intersectObject(pm.core);
        if (hits.length > 0) {
          if (pm.data.id === 'meditation') {
            // Start VR meditation instead of navigating
            startVrMeditation();
          } else {
            navigate(pm.data.path);
          }
          return;
        }
      }
    };

    renderer.domElement.addEventListener('mousedown', onMouseDown);
    renderer.domElement.addEventListener('mouseup', onMouseUp);
    renderer.domElement.addEventListener('mousemove', onMouseMove);
    renderer.domElement.addEventListener('wheel', onWheel);
    renderer.domElement.addEventListener('click', onClick);

    // Animation
    let frameId;
    const clock = new THREE.Clock();

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      // Smooth camera orbit
      orbitAngle += (targetAngle - orbitAngle) * 0.03;
      orbitRadius += (targetRadius - orbitRadius) * 0.03;
      orbitY += (targetY - orbitY) * 0.03;

      // If journey is active, lerp camera to journey waypoint
      if (journeyCamRef.current.active && journeyCamRef.current.target) {
        const tgt = journeyCamRef.current.target;
        const lookTgt = journeyCamRef.current.lookTarget;
        camera.position.lerp(tgt, 0.015);
        const curLook = new THREE.Vector3();
        camera.getWorldDirection(curLook);
        curLook.multiplyScalar(10).add(camera.position);
        curLook.lerp(lookTgt, 0.02);
        camera.lookAt(curLook);
      } else {
        camera.position.x = Math.sin(orbitAngle) * orbitRadius;
        camera.position.z = Math.cos(orbitAngle) * orbitRadius;
        camera.position.y = orbitY;
        camera.lookAt(0, 2, 0);
      }

      // Slow auto-rotate if not dragging
      if (!isDragging) {
        targetAngle += 0.0008;
      }

      // Stars slow rotation
      stars.rotation.y = t * 0.005;
      stars.rotation.x = Math.sin(t * 0.002) * 0.02;

      // Cosmic dust flow
      const dPos = dust.geometry.attributes.position.array;
      for (let i = 0; i < dustCount; i++) {
        dPos[i * 3] += dustVel[i * 3] + Math.sin(t * 0.5 + i * 0.01) * 0.002;
        dPos[i * 3 + 1] += dustVel[i * 3 + 1];
        dPos[i * 3 + 2] += dustVel[i * 3 + 2];
        if (Math.abs(dPos[i * 3]) > 40) dPos[i * 3] *= -0.95;
        if (Math.abs(dPos[i * 3 + 1]) > 20) dPos[i * 3 + 1] *= -0.95;
        if (Math.abs(dPos[i * 3 + 2]) > 40) dPos[i * 3 + 2] *= -0.95;
      }
      dust.geometry.attributes.position.needsUpdate = true;

      // Avatar breathing
      const breath = Math.sin(t * 0.8) * 0.5 + 0.5;
      aura.scale.setScalar(1 + breath * 0.15);
      innerAura.scale.setScalar(1 + breath * 0.1);
      auraMat.opacity = 0.03 + breath * 0.03;
      innerAuraMat.opacity = 0.05 + breath * 0.04;

      // Chakra pulsing
      chakraMeshes.forEach((c, i) => {
        const pulse = Math.sin(t * 2 + i * 0.9) * 0.5 + 0.5;
        c.scale.setScalar(0.8 + pulse * 0.6);
        c.material.opacity = 0.4 + pulse * 0.4;
      });

      // Energy rings rotation
      ringMeshes.forEach((r, i) => {
        r.rotation.z = t * (0.1 + i * 0.08);
        r.rotation.x = Math.PI / 2 + Math.sin(t * 0.3 + i) * 0.2;
      });

      // Portal float & pulse
      let newHovered = null;
      raycasterRef.current.setFromCamera(pointerRef.current, camera);
      portalMeshes.forEach((pm) => {
        const g = pm.group;
        g.position.y = g.userData.baseY + Math.sin(t * 0.7 + g.position.x) * 0.3;
        pm.core.rotation.y = t * 0.5;
        pm.inner.rotation.y = -t * 0.8;

        // Check hover
        const hits = raycasterRef.current.intersectObject(pm.core);
        if (hits.length > 0) {
          newHovered = pm.data.id;
          pm.glow.scale.setScalar(1.4 + Math.sin(t * 3) * 0.15);
          pm.core.scale.setScalar(1.2);
          pm.glow.material.opacity = 0.15;
        } else {
          pm.glow.scale.setScalar(1 + Math.sin(t * 1.5 + pm.data.id.length) * 0.08);
          pm.core.scale.setScalar(1);
          pm.glow.material.opacity = 0.06;
        }
      });
      setHoveredPortal(prev => prev !== newHovered ? newHovered : prev);

      // Nebula drift
      nebulaGroup.children.forEach((n, i) => {
        n.rotation.z += 0.00005 * (i % 2 === 0 ? 1 : -1);
        n.material.opacity = 0.03 + Math.sin(t * 0.1 + i) * 0.015;
      });

      renderer.render(scene, camera);
    };
    animate();

    // Resize handler
    const handleResize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('mousedown', onMouseDown);
      renderer.domElement.removeEventListener('mouseup', onMouseUp);
      renderer.domElement.removeEventListener('mousemove', onMouseMove);
      renderer.domElement.removeEventListener('wheel', onWheel);
      renderer.domElement.removeEventListener('click', onClick);
      renderer.dispose();
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement);
    };
  }, [navigate]);

  // Update avatar visuals when energy state or config loads
  useEffect(() => {
    const s = sceneRef.current;
    if (!s.auraMat || !energyState) return;

    const energy = energyState.current_energy || 0.5;
    const chakraColor = energyState.dominant_chakra?.color || '#C084FC';
    const [cr, cg, cb] = hexToRgb(chakraColor);
    const chakraIdx = energyState.dominant_chakra?.index ?? 6;

    // Update aura color
    s.auraMat.color.setRGB(cr, cg, cb);
    s.innerAuraMat.color.setRGB(cr, cg, cb);

    // Update aura opacity based on energy
    s.auraMat.opacity = 0.02 + energy * 0.06;
    s.innerAuraMat.opacity = 0.04 + energy * 0.08;

    // Scale aura with energy
    s.aura.scale.setScalar(0.8 + energy * 0.5);

    // Highlight dominant chakra
    s.chakraMeshes.forEach((c, i) => {
      if (i === chakraIdx) {
        c.scale.setScalar(1.8);
        c.material.opacity = 0.9;
      }
    });

    // Ring brightness with energy
    s.ringMeshes.forEach((r, i) => {
      r.material.opacity = (0.08 + energy * 0.15) - i * 0.03;
      r.material.color.setRGB(cr, cg, cb);
    });

    // Point light color
    s.pointLight.color.setRGB(cr, cg, cb);
    s.pointLight.intensity = 0.5 + energy * 1.5;

    // Body & head tint
    if (avatarConfig?.aura_color) {
      const [ar, ag, ab] = hexToRgb(avatarConfig.aura_color);
      s.bodyMat.color.setRGB(ar * 0.5, ag * 0.5, ab * 0.5);
      s.headMat.color.setRGB(ar * 0.7, ag * 0.7, ab * 0.7);
    }
  }, [energyState, avatarConfig]);

  // ===== VR MEDITATION MODE =====
  const VR_MED_STEPS = [
    { text: 'Close your eyes. Feel the cosmos around you.', duration: 8 },
    { text: 'Breathe in slowly... filling your lungs with starlight.', duration: 6 },
    { text: 'Hold... let the light settle in your chest.', duration: 4 },
    { text: 'Breathe out... releasing all tension into the void.', duration: 6 },
    { text: 'Feel your energy body expanding with each breath.', duration: 6 },
    { text: 'Breathe in... drawing cosmic energy through your crown.', duration: 6 },
    { text: 'Hold... feel it flowing through each chakra.', duration: 4 },
    { text: 'Breathe out... your aura grows brighter.', duration: 6 },
    { text: 'You are one with the stars. One with the light.', duration: 6 },
    { text: 'Breathe in... peace. Breathe out... love.', duration: 6 },
    { text: 'Hold this sacred space within you.', duration: 5 },
    { text: 'Slowly return. Carry this light with you always.', duration: 7 },
  ];

  const startVrMeditation = useCallback(() => {
    setVrMeditation({ step: 0, elapsed: 0, total: VR_MED_STEPS.reduce((a, s) => a + s.duration, 0) });
  }, []);

  useEffect(() => {
    if (!vrMeditation) return;
    const interval = setInterval(() => {
      setVrMeditation(prev => {
        if (!prev) return null;
        const newElapsed = prev.elapsed + 1;
        let cumulative = 0;
        let newStep = prev.step;
        for (let i = 0; i < VR_MED_STEPS.length; i++) {
          cumulative += VR_MED_STEPS[i].duration;
          if (newElapsed < cumulative) { newStep = i; break; }
          if (i === VR_MED_STEPS.length - 1 && newElapsed >= cumulative) {
            return null; // Meditation complete
          }
        }
        return { ...prev, step: newStep, elapsed: newElapsed };
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [vrMeditation]);

  // Sync VR meditation with 3D scene visuals
  useEffect(() => {
    const s = sceneRef.current;
    if (!s.auraMat) return;
    if (vrMeditation) {
      const progress = vrMeditation.elapsed / vrMeditation.total;
      // Intensify aura during meditation
      s.auraMat.opacity = 0.08 + progress * 0.1;
      s.innerAuraMat.opacity = 0.1 + progress * 0.12;
      s.aura.scale.setScalar(1.2 + Math.sin(vrMeditation.elapsed * 0.3) * 0.3 + progress * 0.5);
      s.pointLight.intensity = 1.5 + progress * 2;
      // Chakras pulse faster
      s.chakraMeshes.forEach((c, i) => {
        c.scale.setScalar(1 + Math.sin(vrMeditation.elapsed * 0.5 + i * 0.8) * 0.8);
        c.material.opacity = 0.6 + Math.sin(vrMeditation.elapsed * 0.5 + i) * 0.3;
      });
      // Rings expand
      s.ringMeshes.forEach((r, i) => {
        r.material.opacity = 0.15 + progress * 0.15;
        r.scale.setScalar(1 + progress * 0.3);
      });
    }
  }, [vrMeditation]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      mountRef.current?.parentElement?.requestFullscreen();
      setFullscreen(true);
    } else {
      document.exitFullscreen();
      setFullscreen(false);
    }
  };

  // ===== GUIDED CONSTELLATION JOURNEYS =====
  const JOURNEYS = [
    {
      id: 'heroes_path',
      name: "The Hero's Path",
      color: '#FCD34D',
      description: 'Follow the trail of mythological heroes across the sky — from Orion the Hunter to the Great Bear.',
      waypoints: [
        { pos: [20, 5, -15], look: [25, 3, -20], text: "We begin at the celestial gateway... the first stars ancient navigators learned to read.", duration: 8 },
        { pos: [10, 8, -25], look: [5, 6, -30], text: "Orion rises — the great hunter, belt gleaming with three ancient stars aligned.", duration: 8 },
        { pos: [-15, 10, -20], look: [-20, 8, -25], text: "The bear constellation watches from the north, eternal guardian circling the pole star.", duration: 8 },
        { pos: [-10, 6, 15], look: [-15, 4, 20], text: "The hero's journey always returns home — through trials of fire, water, and starlight.", duration: 8 },
        { pos: [0, 12, 0], look: [0, 2, 0], text: "You stand at the center of all paths. The hero's journey is your own.", duration: 7 },
      ],
    },
    {
      id: 'cosmic_river',
      name: 'The Cosmic River',
      color: '#2DD4BF',
      description: 'Drift along the Milky Way, following the celestial river that every civilization has seen and named.',
      waypoints: [
        { pos: [25, 3, 10], look: [30, 1, 15], text: "The river of stars begins its flow... the Milky Way, backbone of the night sky.", duration: 8 },
        { pos: [15, 7, -10], look: [20, 5, -15], text: "Ancient Egyptians saw the Nile reflected here — as above, so below.", duration: 8 },
        { pos: [-5, 10, -20], look: [-10, 8, -25], text: "The Maya called it Xibalba Be — the road to the underworld, paved with stars.", duration: 8 },
        { pos: [-20, 6, 5], look: [-25, 4, 10], text: "Aboriginal Australians see the emu in the dark lanes — wisdom in the spaces between.", duration: 8 },
        { pos: [0, 15, 0], look: [0, 2, 0], text: "All rivers lead to the ocean. All star-paths lead to the light within.", duration: 7 },
      ],
    },
    {
      id: 'zodiac_circle',
      name: 'The Zodiac Circle',
      color: '#C084FC',
      description: 'Travel the ecliptic ring — the path the sun traces through the twelve zodiac constellations.',
      waypoints: [
        { pos: [20, 4, 0], look: [25, 2, 0], text: "The ecliptic begins — the sun's path through the heavens, marked by twelve gatekeepers.", duration: 8 },
        { pos: [14, 6, 14], look: [18, 4, 18], text: "Aries to Cancer — the fire of new beginnings meets the waters of the soul.", duration: 8 },
        { pos: [-14, 8, 14], look: [-18, 6, 18], text: "Leo to Scorpio — the lion's courage faces the scorpion's transforming sting.", duration: 8 },
        { pos: [-14, 6, -14], look: [-18, 4, -18], text: "Sagittarius to Pisces — the archer's arrow flies toward the ocean of dreams.", duration: 8 },
        { pos: [0, 14, 0], look: [0, 2, 0], text: "The wheel turns eternal. You carry all twelve signs within you.", duration: 7 },
      ],
    },
  ];

  const startJourney = useCallback((journey) => {
    const total = journey.waypoints.reduce((a, w) => a + w.duration, 0);
    setActiveJourney({ journey, step: 0, elapsed: 0, total });
    setShowJourneyPicker(false);
    journeyCamRef.current.active = true;

    // Create journey constellation markers in the scene
    const s = sceneRef.current;
    if (s.scene) {
      // Clean previous journey markers
      if (journeyGroupRef.current) {
        s.scene.remove(journeyGroupRef.current);
        journeyGroupRef.current.traverse(c => { if (c.geometry) c.geometry.dispose(); if (c.material) c.material.dispose(); });
      }
      const group = new THREE.Group();
      const color = new THREE.Color(journey.color);

      journey.waypoints.forEach((wp, i) => {
        // Constellation marker glow
        const geo = new THREE.SphereGeometry(1.5, 16, 16);
        const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.08, blending: THREE.AdditiveBlending, depthWrite: false });
        const sphere = new THREE.Mesh(geo, mat);
        sphere.position.set(wp.look[0], wp.look[1], wp.look[2]);
        group.add(sphere);

        // Inner marker
        const innerGeo = new THREE.SphereGeometry(0.4, 12, 12);
        const innerMat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.3 });
        const inner = new THREE.Mesh(innerGeo, innerMat);
        inner.position.copy(sphere.position);
        group.add(inner);

        // Connection line to next waypoint
        if (i < journey.waypoints.length - 1) {
          const next = journey.waypoints[i + 1];
          const points = [
            new THREE.Vector3(wp.look[0], wp.look[1], wp.look[2]),
            new THREE.Vector3(next.look[0], next.look[1], next.look[2]),
          ];
          const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
          const lineMat = new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.12 });
          const line = new THREE.Line(lineGeo, lineMat);
          group.add(line);
        }
      });

      s.scene.add(group);
      journeyGroupRef.current = group;
    }
  }, []);

  const stopJourney = useCallback(() => {
    setActiveJourney(null);
    journeyCamRef.current.active = false;
    // Remove journey markers
    const s = sceneRef.current;
    if (s.scene && journeyGroupRef.current) {
      s.scene.remove(journeyGroupRef.current);
      journeyGroupRef.current.traverse(c => { if (c.geometry) c.geometry.dispose(); if (c.material) c.material.dispose(); });
      journeyGroupRef.current = null;
    }
  }, []);

  // Journey timer
  useEffect(() => {
    if (!activeJourney) return;
    const interval = setInterval(() => {
      setActiveJourney(prev => {
        if (!prev) return null;
        const newElapsed = prev.elapsed + 1;
        let cumulative = 0;
        let newStep = prev.step;
        for (let i = 0; i < prev.journey.waypoints.length; i++) {
          cumulative += prev.journey.waypoints[i].duration;
          if (newElapsed < cumulative) { newStep = i; break; }
          if (i === prev.journey.waypoints.length - 1 && newElapsed >= cumulative) {
            journeyCamRef.current.active = false;
            // Remove markers
            const s = sceneRef.current;
            if (s.scene && journeyGroupRef.current) {
              s.scene.remove(journeyGroupRef.current);
              journeyGroupRef.current = null;
            }
            return null; // Journey complete
          }
        }
        // Update camera target
        const wp = prev.journey.waypoints[newStep];
        journeyCamRef.current.target = new THREE.Vector3(wp.pos[0], wp.pos[1], wp.pos[2]);
        journeyCamRef.current.lookTarget = new THREE.Vector3(wp.look[0], wp.look[1], wp.look[2]);
        return { ...prev, step: newStep, elapsed: newElapsed };
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [activeJourney]);

  // Load creation stories for VR Theater
  useEffect(() => {
    axios.get(`${API}/creation-stories`).then(r => {
      setTheaterStories((r.data.stories || []).slice(0, 6));
    }).catch(() => {});
  }, []);

  const startTheater = async (story) => {
    setShowTheaterPicker(false);
    setVrTheater({ story, scene: 0, scenes: [], loading: true, narrating: false, paused: false });
    try {
      // Fetch full story
      const storyRes = await axios.get(`${API}/creation-stories/${story.id}`);
      const fullStory = storyRes.data;
      // Fetch cached scenes
      const scenesRes = await axios.post(`${API}/ai-visuals/story-scenes/${story.id}`, {}, { headers: authHeaders, timeout: 10000 });
      const scenes = scenesRes.data.scenes || [];
      // Generate missing scenes
      for (let i = 0; i < scenes.length; i++) {
        if (!scenes[i].image_b64) {
          try {
            const gen = await axios.post(`${API}/ai-visuals/generate-scene`, { story_id: story.id, scene_index: i }, { headers: authHeaders, timeout: 120000 });
            scenes[i] = { ...scenes[i], image_b64: gen.data.image_b64 };
          } catch {}
        }
      }
      setVrTheater(prev => prev ? { ...prev, scenes, fullStory, loading: false } : null);
    } catch {
      setVrTheater(prev => prev ? { ...prev, loading: false } : null);
    }
  };

  const theaterNarrate = async () => {
    if (!vrTheater?.story) return;
    setVrTheater(prev => prev ? { ...prev, narrating: true, scene: 0 } : null);
    try {
      const r = await axios.post(`${API}/creation-stories/${vrTheater.story.id}/narrate`, {}, { headers: authHeaders, timeout: 90000 });
      const audio = new Audio(`data:audio/mp3;base64,${r.data.audio}`);
      theaterAudioRef.current = audio;
      const totalScenes = vrTheater.scenes?.length || 3;
      audio.onplay = () => {};
      audio.ontimeupdate = () => {
        if (audio.duration && audio.currentTime) {
          const pct = audio.currentTime / audio.duration;
          setVrTheater(prev => prev ? { ...prev, scene: Math.min(Math.floor(pct * totalScenes), totalScenes - 1) } : null);
        }
      };
      audio.onended = () => setVrTheater(prev => prev ? { ...prev, narrating: false } : null);
      audio.play();
    } catch {
      setVrTheater(prev => prev ? { ...prev, narrating: false } : null);
    }
  };


  const hoveredData = hoveredPortal ? PORTALS.find(p => p.id === hoveredPortal) : null;

  return (
    <div className="fixed inset-0 z-40" style={{ background: '#030308' }} data-testid="vr-page">
      {/* 3D Scene */}
      <div ref={mountRef} className="w-full h-full" data-testid="vr-canvas-container" />

      {/* Top HUD */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none z-50">
        <div className="flex items-center gap-3 pointer-events-auto">
          <button onClick={() => navigate(-1)}
            className="p-2.5 rounded-xl transition-all"
            style={{ background: 'rgba(10,10,20,0.6)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.06)', color: 'var(--text-secondary)' }}
            data-testid="vr-back-btn">
            <ArrowLeft size={16} />
          </button>
          <div className="px-4 py-2 rounded-xl" style={{ background: 'rgba(10,10,20,0.6)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: '#C084FC' }}>Cosmic Sanctuary</span>
          </div>
        </div>

        <div className="flex items-center gap-2 pointer-events-auto">
          <button onClick={() => setShowTheaterPicker(!showTheaterPicker)}
            className="p-2.5 rounded-xl transition-all"
            style={{ background: vrTheater ? 'rgba(249,115,22,0.15)' : 'rgba(10,10,20,0.6)', backdropFilter: 'blur(12px)', border: `1px solid ${vrTheater ? 'rgba(249,115,22,0.2)' : 'rgba(255,255,255,0.06)'}`, color: vrTheater ? '#F97316' : 'var(--text-secondary)' }}
            data-testid="vr-theater-btn">
            <Film size={16} />
          </button>
          <button onClick={() => setShowJourneyPicker(!showJourneyPicker)}
            className="p-2.5 rounded-xl transition-all"
            style={{ background: activeJourney ? 'rgba(252,211,77,0.15)' : 'rgba(10,10,20,0.6)', backdropFilter: 'blur(12px)', border: `1px solid ${activeJourney ? 'rgba(252,211,77,0.2)' : 'rgba(255,255,255,0.06)'}`, color: activeJourney ? '#FCD34D' : 'var(--text-secondary)' }}
            data-testid="vr-journey-btn">
            <Compass size={16} />
          </button>
          <button onClick={toggleAudio}
            className="p-2.5 rounded-xl transition-all"
            style={{ background: ambientAudio ? 'rgba(192,132,252,0.15)' : 'rgba(10,10,20,0.6)', backdropFilter: 'blur(12px)', border: `1px solid ${ambientAudio ? 'rgba(192,132,252,0.2)' : 'rgba(255,255,255,0.06)'}`, color: ambientAudio ? '#C084FC' : 'var(--text-secondary)' }}
            data-testid="vr-audio-btn">
            {ambientAudio ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>
          <button onClick={toggleFullscreen}
            className="p-2.5 rounded-xl transition-all"
            style={{ background: 'rgba(10,10,20,0.6)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.06)', color: 'var(--text-secondary)' }}
            data-testid="vr-fullscreen-btn">
            {fullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
        </div>
      </div>

      {/* Energy HUD */}
      {energyState && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="absolute top-20 right-4 w-52 pointer-events-none z-50"
        >
          <div className="rounded-xl p-3" style={{ background: 'rgba(10,10,20,0.55)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[9px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Energy</span>
              <span className="text-sm font-light" style={{ color: energyState.dominant_chakra?.color || '#C084FC', fontFamily: 'Cormorant Garamond, serif' }}>
                {Math.round(energyState.current_energy * 100)}%
              </span>
            </div>
            <div className="h-1 rounded-full overflow-hidden mb-2" style={{ background: 'rgba(255,255,255,0.05)' }}>
              <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${energyState.current_energy * 100}%`, background: energyState.dominant_chakra?.color || '#C084FC' }} />
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: energyState.dominant_chakra?.color, boxShadow: `0 0 6px ${energyState.dominant_chakra?.color}` }} />
              <span className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>{energyState.dominant_chakra?.name} Chakra</span>
            </div>
            <p className="text-[10px] mt-1.5 capitalize" style={{ color: 'var(--text-muted)' }}>Mood: {energyState.current_mood}</p>
          </div>
        </motion.div>
      )}

      {/* Portal tooltip */}
      <AnimatePresence>
        {hoveredData && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-24 left-1/2 -translate-x-1/2 pointer-events-none z-50"
          >
            <div className="px-5 py-3 rounded-xl text-center" style={{ background: 'rgba(10,10,20,0.7)', backdropFilter: 'blur(16px)', border: `1px solid ${hoveredData.color}30` }}>
              <p className="text-sm font-medium mb-0.5" style={{ color: hoveredData.color }}>{hoveredData.label}</p>
              <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{hoveredData.desc}</p>
              <p className="text-[9px] mt-1 uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Click to enter</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* VR Story Theater Picker */}
      <AnimatePresence>
        {showTheaterPicker && !vrTheater && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
            className="absolute top-20 right-4 w-64 z-50 pointer-events-auto"
            data-testid="vr-theater-picker">
            <div className="rounded-xl p-4" style={{ background: 'rgba(10,10,20,0.9)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Film size={12} style={{ color: '#F97316' }} />
                  <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'rgba(248,250,252,0.5)' }}>Story Theater</span>
                </div>
                <button onClick={() => setShowTheaterPicker(false)} className="p-1 rounded hover:bg-white/5">
                  <X size={10} style={{ color: 'rgba(248,250,252,0.3)' }} />
                </button>
              </div>
              <p className="text-[9px] mb-3 leading-relaxed" style={{ color: 'rgba(248,250,252,0.3)' }}>
                Immersive AI-generated cinematic creation stories in VR
              </p>
              <div className="space-y-2">
                {theaterStories.map(s => (
                  <button key={s.id} onClick={() => startTheater(s)}
                    data-testid={`vr-theater-${s.id}`}
                    className="w-full text-left rounded-lg px-3 py-2 transition-all hover:bg-white/5"
                    style={{ background: 'rgba(248,250,252,0.02)', border: '1px solid rgba(248,250,252,0.04)' }}>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ background: s.color, boxShadow: `0 0 6px ${s.color}80` }} />
                      <span className="text-[11px] font-medium" style={{ color: 'rgba(248,250,252,0.7)' }}>{s.culture}</span>
                    </div>
                    <p className="text-[9px] pl-4 mt-0.5 truncate" style={{ color: 'rgba(248,250,252,0.25)' }}>{s.title}</p>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* VR Story Theater Overlay */}
      <AnimatePresence>
        {vrTheater && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 pointer-events-none" data-testid="vr-theater-overlay">
            {/* Scene image as floating panel in VR space */}
            <div className="absolute inset-0 flex items-center justify-center">
              {vrTheater.loading ? (
                <div className="flex flex-col items-center gap-3 pointer-events-auto">
                  <Loader2 className="animate-spin" size={28} style={{ color: vrTheater.story?.color }} />
                  <p className="text-xs" style={{ color: 'rgba(248,250,252,0.5)' }}>Generating cinematic scenes...</p>
                </div>
              ) : (
                <motion.div
                  className="relative rounded-2xl overflow-hidden pointer-events-auto"
                  style={{ width: '60vw', maxWidth: 800, aspectRatio: '16/9', boxShadow: `0 0 60px ${vrTheater.story?.color || '#F97316'}20` }}
                >
                  <AnimatePresence mode="wait">
                    {vrTheater.scenes?.[vrTheater.scene]?.image_b64 ? (
                      <motion.img
                        key={vrTheater.scene}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1.2 }}
                        src={`data:image/png;base64,${vrTheater.scenes[vrTheater.scene].image_b64}`}
                        className="w-full h-full object-cover"
                        style={{ filter: 'brightness(0.8) saturate(1.1)' }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center" style={{ background: 'rgba(10,10,20,0.9)' }}>
                        <Sparkles size={24} style={{ color: vrTheater.story?.color }} className="animate-pulse" />
                      </div>
                    )}
                  </AnimatePresence>
                  <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, transparent 50%, rgba(0,0,0,0.7) 100%)' }} />

                  {/* Story text overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <p className="text-[10px] uppercase tracking-[0.2em] mb-1" style={{ color: vrTheater.story?.color }}>
                      {vrTheater.story?.culture} Creation Story
                    </p>
                    <p className="text-sm leading-relaxed" style={{ color: 'rgba(248,250,252,0.8)', fontFamily: 'Cormorant Garamond, serif', textShadow: '0 2px 8px rgba(0,0,0,0.9)' }}>
                      {vrTheater.fullStory?.story?.split('\n\n')[vrTheater.scene] || ''}
                    </p>
                  </div>

                  {/* Scene dots */}
                  <div className="absolute top-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {vrTheater.scenes?.map((_, i) => (
                      <div key={i} className="rounded-full transition-all"
                        style={{ width: i === vrTheater.scene ? 14 : 5, height: 5, background: i === vrTheater.scene ? vrTheater.story?.color : 'rgba(255,255,255,0.2)' }} />
                    ))}
                  </div>
                </motion.div>
              )}
            </div>

            {/* Theater controls */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3 pointer-events-auto">
              <button onClick={() => setVrTheater(prev => prev ? { ...prev, scene: Math.max(0, prev.scene - 1) } : null)}
                className="p-2 rounded-full" style={{ background: 'rgba(10,10,20,0.6)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <SkipBack size={14} style={{ color: 'rgba(255,255,255,0.5)' }} />
              </button>
              {!vrTheater.narrating ? (
                <button onClick={theaterNarrate} disabled={vrTheater.loading}
                  className="flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-medium"
                  style={{ background: `${vrTheater.story?.color || '#F97316'}15`, border: `1px solid ${vrTheater.story?.color || '#F97316'}30`, color: vrTheater.story?.color || '#F97316' }}>
                  <Volume2 size={12} /> Narrate
                </button>
              ) : (
                <button onClick={() => { if (theaterAudioRef.current) { theaterAudioRef.current.pause(); setVrTheater(prev => prev ? { ...prev, narrating: false } : null); } }}
                  className="flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-medium"
                  style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#EF4444' }}>
                  <Pause size={12} /> Stop
                </button>
              )}
              <button onClick={() => setVrTheater(prev => prev ? { ...prev, scene: Math.min((prev.scenes?.length || 1) - 1, prev.scene + 1) } : null)}
                className="p-2 rounded-full" style={{ background: 'rgba(10,10,20,0.6)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <SkipForward size={14} style={{ color: 'rgba(255,255,255,0.5)' }} />
              </button>
              <button onClick={() => { if (theaterAudioRef.current) theaterAudioRef.current.pause(); setVrTheater(null); }}
                className="px-3 py-2 rounded-full text-[10px]"
                style={{ background: 'rgba(10,10,20,0.6)', border: '1px solid rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.4)' }}
                data-testid="vr-theater-close">
                Exit Theater
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Constellation Journey Picker */}
      <AnimatePresence>
        {showJourneyPicker && !activeJourney && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
            className="absolute top-20 right-4 w-64 z-50 pointer-events-auto"
            data-testid="vr-journey-picker">
            <div className="rounded-xl p-4" style={{ background: 'rgba(10,10,20,0.9)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Compass size={12} style={{ color: '#FCD34D' }} />
                  <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'rgba(248,250,252,0.5)' }}>Star Journeys</span>
                </div>
                <button onClick={() => setShowJourneyPicker(false)} className="p-1 rounded hover:bg-white/5">
                  <X size={10} style={{ color: 'rgba(248,250,252,0.3)' }} />
                </button>
              </div>
              <p className="text-[9px] mb-3 leading-relaxed" style={{ color: 'rgba(248,250,252,0.3)' }}>
                Guided flights through the cosmos with narrated constellation stories
              </p>
              <div className="space-y-2">
                {JOURNEYS.map(j => (
                  <button key={j.id} onClick={() => startJourney(j)}
                    data-testid={`vr-journey-${j.id}`}
                    className="w-full text-left rounded-lg px-3 py-2.5 transition-all hover:bg-white/5"
                    style={{ background: 'rgba(248,250,252,0.02)', border: `1px solid rgba(248,250,252,0.04)` }}>
                    <div className="flex items-center gap-2 mb-0.5">
                      <div className="w-2 h-2 rounded-full" style={{ background: j.color, boxShadow: `0 0 6px ${j.color}80` }} />
                      <span className="text-[11px] font-medium" style={{ color: 'rgba(248,250,252,0.7)' }}>{j.name}</span>
                    </div>
                    <p className="text-[9px] pl-4" style={{ color: 'rgba(248,250,252,0.3)' }}>{j.description}</p>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active Journey Narration Overlay */}
      <AnimatePresence>
        {activeJourney && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-end justify-center pb-24 pointer-events-none"
            data-testid="vr-journey-overlay"
          >
            {/* Narration text */}
            <div className="text-center px-8 max-w-2xl">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeJourney.step}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 1.2 }}
                >
                  <div className="flex items-center justify-center gap-2 mb-3">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: activeJourney.journey.color, boxShadow: `0 0 8px ${activeJourney.journey.color}` }} />
                    <span className="text-[10px] uppercase tracking-[0.3em] font-bold" style={{ color: activeJourney.journey.color }}>
                      {activeJourney.journey.name}
                    </span>
                    <span className="text-[9px]" style={{ color: 'rgba(248,250,252,0.3)' }}>
                      {activeJourney.step + 1} / {activeJourney.journey.waypoints.length}
                    </span>
                  </div>
                  <p className="text-lg md:text-xl font-light leading-relaxed"
                    style={{
                      color: 'rgba(248,250,252,0.85)',
                      fontFamily: 'Cormorant Garamond, serif',
                      textShadow: `0 0 30px ${activeJourney.journey.color}40`,
                    }}>
                    {activeJourney.journey.waypoints[activeJourney.step]?.text}
                  </p>
                </motion.div>
              </AnimatePresence>

              {/* Progress bar */}
              <div className="mt-6 w-48 mx-auto">
                <div className="h-0.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: `${activeJourney.journey.color}80`, width: `${(activeJourney.elapsed / activeJourney.total) * 100}%` }}
                  />
                </div>
                <p className="text-[9px] mt-2 uppercase tracking-widest" style={{ color: 'rgba(248,250,252,0.25)' }}>
                  {Math.floor((activeJourney.total - activeJourney.elapsed) / 60)}:{String((activeJourney.total - activeJourney.elapsed) % 60).padStart(2, '0')} remaining
                </p>
              </div>
            </div>

            {/* End journey button */}
            <button onClick={stopJourney}
              className="absolute top-20 right-4 px-3 py-1.5 rounded-lg text-[10px] pointer-events-auto"
              style={{ background: 'rgba(10,10,20,0.6)', backdropFilter: 'blur(12px)', border: `1px solid ${activeJourney.journey.color}20`, color: activeJourney.journey.color }}
              data-testid="vr-journey-close">
              End Journey
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom portal legend */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3 pointer-events-none z-50">
        {PORTALS.map(p => (
          <div key={p.id} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all"
            style={{ background: hoveredPortal === p.id ? `${p.color}15` : 'rgba(10,10,20,0.4)', border: `1px solid ${hoveredPortal === p.id ? `${p.color}30` : 'rgba(255,255,255,0.04)'}`, backdropFilter: 'blur(8px)' }}>
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: p.color, boxShadow: `0 0 6px ${p.color}60` }} />
            <span className="text-[10px]" style={{ color: hoveredPortal === p.id ? p.color : 'var(--text-muted)' }}>{p.label}</span>
          </div>
        ))}
      </div>

      {/* VR Meditation Overlay */}
      <AnimatePresence>
        {vrMeditation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none"
            data-testid="vr-meditation-overlay"
          >
            {/* Breathing ring */}
            <motion.div
              animate={{
                scale: [1, 1.3, 1.3, 1],
                opacity: [0.3, 0.6, 0.6, 0.3],
              }}
              transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute rounded-full"
              style={{ width: 300, height: 300, border: '1px solid rgba(192,132,252,0.15)', boxShadow: '0 0 60px rgba(192,132,252,0.08)' }}
            />
            <motion.div
              animate={{
                scale: [1, 1.2, 1.2, 1],
                opacity: [0.2, 0.4, 0.4, 0.2],
              }}
              transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
              className="absolute rounded-full"
              style={{ width: 400, height: 400, border: '1px solid rgba(192,132,252,0.08)' }}
            />

            {/* Text */}
            <div className="text-center px-8 max-w-lg">
              <AnimatePresence mode="wait">
                <motion.p
                  key={vrMeditation.step}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 1 }}
                  className="text-lg md:text-xl font-light leading-relaxed"
                  style={{ color: 'rgba(248,250,252,0.8)', fontFamily: 'Cormorant Garamond, serif', textShadow: '0 0 30px rgba(192,132,252,0.3)' }}
                >
                  {VR_MED_STEPS[vrMeditation.step]?.text}
                </motion.p>
              </AnimatePresence>

              {/* Progress */}
              <div className="mt-8 w-48 mx-auto">
                <div className="h-0.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: 'rgba(192,132,252,0.5)', width: `${(vrMeditation.elapsed / vrMeditation.total) * 100}%` }}
                  />
                </div>
                <p className="text-[9px] mt-2 uppercase tracking-widest" style={{ color: 'rgba(248,250,252,0.3)' }}>
                  {Math.floor((vrMeditation.total - vrMeditation.elapsed) / 60)}:{String((vrMeditation.total - vrMeditation.elapsed) % 60).padStart(2, '0')} remaining
                </p>
              </div>
            </div>

            {/* Close button */}
            <button onClick={() => setVrMeditation(null)}
              className="absolute top-20 right-4 px-3 py-1.5 rounded-lg text-[10px] pointer-events-auto"
              style={{ background: 'rgba(10,10,20,0.6)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.06)', color: 'var(--text-muted)' }}
              data-testid="vr-meditation-close">
              End Session
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Instructions overlay */}
      <motion.div
        initial={{ opacity: 1 }}
        animate={{ opacity: 0 }}
        transition={{ delay: 4, duration: 1.5 }}
        className="absolute bottom-20 left-1/2 -translate-x-1/2 pointer-events-none z-50"
      >
        <p className="text-[11px] tracking-wider" style={{ color: 'var(--text-muted)' }}>
          Drag to orbit &middot; Scroll to zoom &middot; Click portals to enter
        </p>
      </motion.div>
    </div>
  );
}
