import React, { useRef, useEffect, useCallback } from 'react';
import * as THREE from 'three';

const GRID_RES = 64;
const GRID_SIZE = 12;

export function GravityField({ nodes }) {
  const canvasRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const meshRef = useRef(null);
  const basePositions = useRef(null);
  const wellsGroup = useRef(null);
  const starsRef = useRef(null);
  const animId = useRef(null);

  const initScene = useCallback((canvas) => {
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    renderer.setClearColor(0x000000, 0);
    rendererRef.current = renderer;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(55, canvas.clientWidth / canvas.clientHeight, 0.1, 100);
    camera.position.set(0, 7, 6);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    scene.add(new THREE.AmbientLight(0xffffff, 0.08));
    const dirLight = new THREE.DirectionalLight(0x6366F1, 0.12);
    dirLight.position.set(5, 8, 3);
    scene.add(dirLight);

    const planeGeo = new THREE.PlaneGeometry(GRID_SIZE, GRID_SIZE, GRID_RES, GRID_RES);
    planeGeo.rotateX(-Math.PI / 2);
    basePositions.current = new Float32Array(planeGeo.attributes.position.array);

    const planeMat = new THREE.MeshStandardMaterial({
      color: 0x1a1a2e,
      wireframe: true,
      transparent: true,
      opacity: 0.12,
      emissive: 0x4c1d95,
      emissiveIntensity: 0.15,
    });
    const mesh = new THREE.Mesh(planeGeo, planeMat);
    scene.add(mesh);
    meshRef.current = mesh;

    const starsGeo = new THREE.BufferGeometry();
    const starPositions = new Float32Array(200 * 3);
    for (let i = 0; i < 200; i++) {
      starPositions[i * 3] = (Math.random() - 0.5) * 28;
      starPositions[i * 3 + 1] = Math.random() * 8 + 2;
      starPositions[i * 3 + 2] = (Math.random() - 0.5) * 28;
    }
    starsGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const starsMat = new THREE.PointsMaterial({ color: 0xC084FC, size: 0.04, transparent: true, opacity: 0.25, sizeAttenuation: true });
    const stars = new THREE.Points(starsGeo, starsMat);
    scene.add(stars);
    starsRef.current = stars;

    const wells = new THREE.Group();
    scene.add(wells);
    wellsGroup.current = wells;
  }, []);

  const updateWells = useCallback((nodeData) => {
    if (!wellsGroup.current || !sceneRef.current) return;
    while (wellsGroup.current.children.length > 0) {
      const child = wellsGroup.current.children[0];
      wellsGroup.current.remove(child);
      child.traverse(c => { if (c.geometry) c.geometry.dispose(); if (c.material) c.material.dispose(); });
    }
    if (!nodeData || nodeData.length === 0) return;

    for (const node of nodeData) {
      const depth = node.mass * 1.5;
      const color = new THREE.Color(node.color || '#A78BFA');
      const group = new THREE.Group();
      group.position.set(node.x, -depth, node.z);

      const light = new THREE.PointLight(color, node.mass * 2, 3 + node.mass * 2, 2);
      group.add(light);

      const sphere = new THREE.Mesh(
        new THREE.SphereGeometry(0.06 + node.mass * 0.08, 8, 8),
        new THREE.MeshStandardMaterial({
          color,
          emissive: color,
          emissiveIntensity: 0.8,
          transparent: true,
          opacity: 0.6 + node.mass * 0.3,
        })
      );
      group.add(sphere);
      wellsGroup.current.add(group);
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      initScene(canvas);
    } catch {
      return;
    }

    const handleResize = () => {
      if (!rendererRef.current || !cameraRef.current || !canvas) return;
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      rendererRef.current.setSize(w, h);
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
    };
    window.addEventListener('resize', handleResize);

    const animate = () => {
      animId.current = requestAnimationFrame(animate);
      const time = performance.now() * 0.001;

      if (meshRef.current && basePositions.current) {
        const pos = meshRef.current.geometry.attributes.position;
        const bp = basePositions.current;
        const nodeData = nodes || [];

        for (let i = 0; i < pos.count; i++) {
          const bx = bp[i * 3];
          const bz = bp[i * 3 + 2];
          let sag = 0;

          for (let j = 0; j < nodeData.length; j++) {
            const n = nodeData[j];
            const dx = bx - n.x;
            const dz = bz - n.z;
            const dist = dx * dx + dz * dz;
            sag -= (n.mass * 1.8) / (dist + 0.6);
          }

          const wave = Math.sin(bx * 0.5 + time * 0.3) * Math.cos(bz * 0.4 + time * 0.2) * 0.03;
          pos.setY(i, sag + wave);
        }
        pos.needsUpdate = true;
        meshRef.current.geometry.computeVertexNormals();
      }

      if (starsRef.current) {
        starsRef.current.rotation.y = time * 0.004;
      }

      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };
    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animId.current) cancelAnimationFrame(animId.current);
      if (rendererRef.current) {
        rendererRef.current.dispose();
        rendererRef.current = null;
      }
    };
  }, [initScene, nodes]);

  useEffect(() => {
    updateWells(nodes);
  }, [nodes, updateWells]);

  return (
    <div className="absolute inset-0" style={{ zIndex: 0 }} data-testid="gravity-field">
      <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
    </div>
  );
}
