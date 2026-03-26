import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as THREE from 'three';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Loader2, MapPin, Star, X, Compass, Moon, Sparkles, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const ELEMENT_COLORS = { Fire: '#EF4444', Water: '#3B82F6', Air: '#A78BFA', Earth: '#22C55E' };

function raDecToXYZ(ra, dec, radius = 50) {
  const raRad = (ra / 24) * 2 * Math.PI;
  const decRad = (dec / 180) * Math.PI;
  return new THREE.Vector3(
    radius * Math.cos(decRad) * Math.cos(raRad),
    radius * Math.sin(decRad),
    -radius * Math.cos(decRad) * Math.sin(raRad),
  );
}

function ThreeStarChart({ data, containerRef, onSelectConstellation }) {
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const frameRef = useRef(null);
  const spherical = useRef({ theta: 0.5, phi: Math.PI / 3, radius: 70 });
  const isDragging = useRef(false);
  const prevMouse = useRef({ x: 0, y: 0 });
  const labelsRef = useRef([]);
  const constellationMeshes = useRef([]);

  useEffect(() => {
    if (!containerRef.current || !data) return;
    const container = containerRef.current;
    const w = container.clientWidth;
    const h = container.clientHeight;

    // Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(60, w / h, 0.1, 200);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Background star field
    const starGeo = new THREE.BufferGeometry();
    const starCount = 2500;
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 80 + Math.random() * 40;
      starPositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      starPositions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      starPositions[i * 3 + 2] = r * Math.cos(phi);
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const stars = new THREE.Points(starGeo, new THREE.PointsMaterial({ size: 0.15, color: 0xE8E8FF, transparent: true, opacity: 0.6 }));
    scene.add(stars);

    // Nebula glow
    const elementColor = ELEMENT_COLORS[data.mayan_element] || '#D8B4FE';
    const nebulaGeo = new THREE.SphereGeometry(35, 32, 32);
    const nebulaMat = new THREE.MeshBasicMaterial({ color: elementColor, transparent: true, opacity: 0.03, side: THREE.BackSide });
    const nebula = new THREE.Mesh(nebulaGeo, nebulaMat);
    scene.add(nebula);

    // Constellations
    const meshMap = [];
    data.constellations.forEach(c => {
      const color = ELEMENT_COLORS[c.element] || '#A78BFA';
      const isAligned = c.aligned || c.alignment_reason?.length > 0;

      // Constellation lines
      if (c.stars.length >= 2) {
        const points = c.stars.map(s => raDecToXYZ(s.ra, s.dec));
        const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
        const lineMat = new THREE.LineBasicMaterial({
          color: isAligned ? color : '#4A4A6A',
          transparent: true,
          opacity: isAligned ? 0.5 : 0.15,
        });
        scene.add(new THREE.Line(lineGeo, lineMat));
      }

      // Stars
      c.stars.forEach(s => {
        const pos = raDecToXYZ(s.ra, s.dec);
        const brightness = Math.max(0.3, 1 - s.mag / 5);
        const size = Math.max(0.2, (5 - s.mag) / 5 * 0.8);

        const starMesh = new THREE.Mesh(
          new THREE.SphereGeometry(size, 8, 8),
          new THREE.MeshBasicMaterial({ color: isAligned ? color : '#E8E8FF', transparent: true, opacity: brightness })
        );
        starMesh.position.copy(pos);
        scene.add(starMesh);

        // Glow
        const glowMesh = new THREE.Mesh(
          new THREE.SphereGeometry(size * 2.5, 8, 8),
          new THREE.MeshBasicMaterial({ color: isAligned ? color : '#B8B8FF', transparent: true, opacity: brightness * 0.15 })
        );
        glowMesh.position.copy(pos);
        scene.add(glowMesh);

        meshMap.push({ mesh: starMesh, constellation: c });
      });

      // Label position (center of constellation for 2D projection)
      labelsRef.current.push({
        id: c.id,
        name: c.name,
        pos3D: raDecToXYZ(c.ra, c.dec, 52),
        aligned: isAligned,
        element: c.element,
      });
    });
    constellationMeshes.current = meshMap;

    // Avatar marker at user's zodiac constellation
    if (data.user_zodiac) {
      const zodiacC = data.constellations.find(c => c.id === data.user_zodiac);
      if (zodiacC) {
        const aColor = data.aura_color === 'blue' ? '#3B82F6' : data.aura_color === 'green' ? '#22C55E' : data.aura_color === 'purple' ? '#A855F7' : data.aura_color === 'gold' ? '#EAB308' : '#D8B4FE';
        const avatarPos = raDecToXYZ(zodiacC.ra, zodiacC.dec, 48);

        // Holographic rings
        const ring1 = new THREE.Mesh(
          new THREE.TorusGeometry(2.5, 0.08, 8, 32),
          new THREE.MeshBasicMaterial({ color: aColor, transparent: true, opacity: 0.6 })
        );
        ring1.position.copy(avatarPos);
        ring1.userData.isRing = true;
        scene.add(ring1);

        const ring2 = new THREE.Mesh(
          new THREE.TorusGeometry(2.5, 0.05, 8, 32),
          new THREE.MeshBasicMaterial({ color: aColor, transparent: true, opacity: 0.3 })
        );
        ring2.position.copy(avatarPos);
        ring2.rotation.x = Math.PI / 2;
        scene.add(ring2);

        // Core
        const core = new THREE.Mesh(
          new THREE.SphereGeometry(0.6, 16, 16),
          new THREE.MeshBasicMaterial({ color: aColor, transparent: true, opacity: 0.8 })
        );
        core.position.copy(avatarPos);
        scene.add(core);

        const aura = new THREE.Mesh(
          new THREE.SphereGeometry(4, 16, 16),
          new THREE.MeshBasicMaterial({ color: aColor, transparent: true, opacity: 0.04 })
        );
        aura.position.copy(avatarPos);
        scene.add(aura);
      }
    }

    // Controls
    const onPointerDown = (e) => { isDragging.current = true; prevMouse.current = { x: e.clientX, y: e.clientY }; };
    const onPointerUp = () => { isDragging.current = false; };
    const onPointerMove = (e) => {
      if (!isDragging.current) return;
      spherical.current.theta -= (e.clientX - prevMouse.current.x) * 0.005;
      spherical.current.phi = Math.max(0.1, Math.min(Math.PI - 0.1, spherical.current.phi - (e.clientY - prevMouse.current.y) * 0.005));
      prevMouse.current = { x: e.clientX, y: e.clientY };
    };
    const onWheel = (e) => { spherical.current.radius = Math.max(15, Math.min(120, spherical.current.radius + e.deltaY * 0.05)); };
    const onTouchStart = (e) => { if (e.touches.length === 1) { isDragging.current = true; prevMouse.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }; } };
    const onTouchEnd = () => { isDragging.current = false; };
    const onTouchMove = (e) => {
      if (!isDragging.current || e.touches.length !== 1) return;
      spherical.current.theta -= (e.touches[0].clientX - prevMouse.current.x) * 0.005;
      spherical.current.phi = Math.max(0.1, Math.min(Math.PI - 0.1, spherical.current.phi - (e.touches[0].clientY - prevMouse.current.y) * 0.005));
      prevMouse.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    };

    // Click detection for constellations
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    const onClick = (e) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      const meshes = meshMap.map(m => m.mesh);
      const intersects = raycaster.intersectObjects(meshes);
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

    // Resize handler
    const onResize = () => {
      const nw = container.clientWidth, nh = container.clientHeight;
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
    };
    window.addEventListener('resize', onResize);

    // Animate
    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      const { theta, phi, radius } = spherical.current;
      camera.position.set(
        radius * Math.sin(phi) * Math.cos(theta),
        radius * Math.cos(phi),
        radius * Math.sin(phi) * Math.sin(theta),
      );
      camera.lookAt(0, 0, 0);

      // Rotate star field
      stars.rotation.y += 0.0001;
      nebula.rotation.z += 0.00005;

      // Animate rings
      scene.traverse(obj => {
        if (obj.userData.isRing) obj.rotation.y += 0.02;
      });

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(frameRef.current);
      el.removeEventListener('pointerdown', onPointerDown);
      el.removeEventListener('pointerup', onPointerUp);
      el.removeEventListener('pointermove', onPointerMove);
      el.removeEventListener('wheel', onWheel);
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchend', onTouchEnd);
      el.removeEventListener('touchmove', onTouchMove);
      el.removeEventListener('click', onClick);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement);
    };
  }, [data, containerRef, onSelectConstellation]);

  return null;
}

function ConstellationDetail({ constellation, onClose }) {
  const navigate = useNavigate();
  if (!constellation) return null;
  const color = ELEMENT_COLORS[constellation.element] || '#A78BFA';
  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
      data-testid="constellation-detail"
      className="absolute top-20 right-4 w-72 max-h-[70vh] overflow-y-auto rounded-2xl p-5 z-20"
      style={{ background: 'rgba(10,12,20,0.92)', border: `1px solid ${color}25`, backdropFilter: 'blur(24px)' }}>
      <button onClick={onClose} className="absolute top-3 right-3 p-1 rounded-lg hover:bg-white/5"><X size={14} style={{ color: 'rgba(248,250,252,0.3)' }} /></button>
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${color}15` }}><Star size={14} style={{ color }} /></div>
        <div>
          <p className="text-sm font-bold" style={{ color: '#F8FAFC' }}>{constellation.name}</p>
          <p className="text-[10px]" style={{ color }}>{constellation.symbol} | {constellation.element}</p>
        </div>
      </div>
      {constellation.alignment_reason?.length > 0 && (
        <div className="rounded-lg p-2 mb-3" style={{ background: `${color}08`, border: `1px solid ${color}15` }}>
          {constellation.alignment_reason.map((r, i) => (
            <p key={i} className="text-[10px] flex items-center gap-1" style={{ color }}><Sparkles size={9} /> {r}</p>
          ))}
        </div>
      )}
      <p className="text-xs leading-relaxed mb-3" style={{ color: 'rgba(248,250,252,0.6)' }}>{constellation.meaning}</p>
      <div className="mb-3">
        <p className="text-[9px] uppercase tracking-wider mb-1.5" style={{ color: 'rgba(248,250,252,0.25)' }}>Stars</p>
        {constellation.stars?.map((s, i) => (
          <div key={i} className="flex items-center gap-2 text-[10px]" style={{ color: 'rgba(248,250,252,0.45)' }}>
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: color }} /><span>{s.name}</span><span className="ml-auto">mag {s.mag}</span>
          </div>
        ))}
      </div>
      {constellation.altitude !== undefined && (
        <p className="text-[10px] mb-3" style={{ color: 'rgba(248,250,252,0.3)' }}>
          Altitude: {constellation.altitude} | {constellation.above_horizon ? 'Above horizon' : 'Below horizon'}
        </p>
      )}
      <button onClick={() => navigate('/cosmic-calendar')}
        className="w-full flex items-center justify-center gap-1 py-2 rounded-lg text-[10px] font-medium"
        style={{ background: `${color}10`, border: `1px solid ${color}20`, color }}>
        View in Cosmic Calendar <ChevronRight size={10} />
      </button>
    </motion.div>
  );
}

export default function StarChart() {
  const { token, authHeaders } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [locationName, setLocationName] = useState('New York');
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [latInput, setLatInput] = useState('40.7');
  const [lngInput, setLngInput] = useState('-74.0');
  const canvasContainerRef = useRef(null);

  const fetchChart = useCallback((lat, lng) => {
    if (!token) { setLoading(false); return; }
    setLoading(true);
    axios.get(`${API}/star-chart/constellations?lat=${lat}&lng=${lng}`, { headers: authHeaders })
      .then(r => setData(r.data))
      .catch(() => toast.error('Failed to load star chart'))
      .finally(() => setLoading(false));
  }, [token, authHeaders]);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLatInput(pos.coords.latitude.toFixed(1));
          setLngInput(pos.coords.longitude.toFixed(1));
          setLocationName('Your Location');
          fetchChart(pos.coords.latitude, pos.coords.longitude);
        },
        () => fetchChart(40.7, -74.0),
        { timeout: 5000 }
      );
    } else {
      fetchChart(40.7, -74.0);
    }
  }, [token]);

  const handleSelect = useCallback((c) => setSelected(c), []);

  const updateLocation = () => {
    const lat = parseFloat(latInput), lng = parseFloat(lngInput);
    if (isNaN(lat) || isNaN(lng)) { toast.error('Invalid coordinates'); return; }
    setLocationName(`${lat.toFixed(1)}, ${lng.toFixed(1)}`);
    setShowLocationPicker(false);
    fetchChart(lat, lng);
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
    <div className="min-h-screen pt-16 relative" data-testid="star-chart-page">
      {/* Header */}
      <div className="absolute top-16 left-0 right-0 z-10 px-4 py-4 pointer-events-none">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold" style={{ color: '#F8FAFC' }}>
              <Star size={16} className="inline mr-2" style={{ color: '#818CF8' }} />
              Constellation Chart
            </h1>
            <p className="text-[10px]" style={{ color: 'rgba(248,250,252,0.35)' }}>Drag to rotate | Scroll to zoom | Click stars for details</p>
          </div>
          <div className="flex items-center gap-2 pointer-events-auto">
            <button onClick={() => setShowLocationPicker(!showLocationPicker)} data-testid="location-btn"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px]"
              style={{ background: 'rgba(15,17,28,0.7)', border: '1px solid rgba(248,250,252,0.08)', color: 'rgba(248,250,252,0.5)', backdropFilter: 'blur(12px)' }}>
              <MapPin size={10} /> {locationName}
            </button>
            {data && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px]"
                style={{ background: 'rgba(15,17,28,0.7)', border: '1px solid rgba(129,140,248,0.15)', color: '#818CF8', backdropFilter: 'blur(12px)' }}>
                <Compass size={10} /> {data.constellations?.length} visible
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
            style={{ background: 'rgba(10,12,20,0.95)', border: '1px solid rgba(248,250,252,0.08)', backdropFilter: 'blur(24px)' }}>
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

      {/* Legend */}
      {data && (
        <div className="absolute bottom-4 left-4 z-10 flex flex-wrap gap-2 pointer-events-none">
          {Object.entries(ELEMENT_COLORS).map(([elem, col]) => (
            <div key={elem} className="flex items-center gap-1 px-2 py-1 rounded-lg text-[9px]"
              style={{ background: 'rgba(10,12,20,0.7)', border: `1px solid ${col}20`, color: col, backdropFilter: 'blur(8px)' }}>
              <div className="w-2 h-2 rounded-full" style={{ background: col }} /> {elem}
            </div>
          ))}
          {data.user_zodiac && (
            <div className="flex items-center gap-1 px-2 py-1 rounded-lg text-[9px]"
              style={{ background: 'rgba(10,12,20,0.7)', border: '1px solid rgba(216,180,254,0.2)', color: '#D8B4FE', backdropFilter: 'blur(8px)' }}>
              <div className="w-2 h-2 rounded-full" style={{ background: '#D8B4FE' }} /> Your Constellation
            </div>
          )}
        </div>
      )}

      {/* Mayan badge */}
      {data && (
        <div className="absolute bottom-4 right-4 z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] pointer-events-none"
          style={{ background: 'rgba(10,12,20,0.7)', border: '1px solid rgba(167,139,250,0.15)', color: '#A78BFA', backdropFilter: 'blur(8px)' }}>
          <Compass size={10} /> Today: {data.mayan_glyph} ({data.mayan_element})
        </div>
      )}

      {/* Detail Panel */}
      <AnimatePresence>
        {selected && <ConstellationDetail constellation={selected} onClose={() => setSelected(null)} />}
      </AnimatePresence>

      {/* 3D Canvas Container */}
      <div ref={canvasContainerRef} className="w-full h-[calc(100vh-4rem)]" data-testid="star-chart-canvas"
        style={{ background: 'radial-gradient(ellipse at center, #0A0C14 0%, #000000 100%)' }}>
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Loader2 className="animate-spin mx-auto mb-3" size={28} style={{ color: '#818CF8' }} />
              <p className="text-xs" style={{ color: 'rgba(248,250,252,0.3)' }}>Mapping the celestial sphere...</p>
            </div>
          </div>
        ) : data ? (
          <ThreeStarChart data={data} containerRef={canvasContainerRef} onSelectConstellation={handleSelect} />
        ) : null}
      </div>
    </div>
  );
}
