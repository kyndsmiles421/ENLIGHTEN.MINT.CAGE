import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Maximize2, Minimize2, Wind, Timer, Flame, Star, Eye, BookOpen, Volume2, VolumeX } from 'lucide-react';
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
  const audioCtxRef = useRef(null);
  const audioNodesRef = useRef([]);
  const mouseRef = useRef({ x: 0, y: 0 });
  const raycasterRef = useRef(new THREE.Raycaster());
  const pointerRef = useRef(new THREE.Vector2());

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
          navigate(pm.data.path);
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
      camera.position.x = Math.sin(orbitAngle) * orbitRadius;
      camera.position.z = Math.cos(orbitAngle) * orbitRadius;
      camera.position.y = orbitY;
      camera.lookAt(0, 2, 0);

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

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      mountRef.current?.parentElement?.requestFullscreen();
      setFullscreen(true);
    } else {
      document.exitFullscreen();
      setFullscreen(false);
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
