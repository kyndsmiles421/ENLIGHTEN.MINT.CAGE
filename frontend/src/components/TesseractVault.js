/**
 * TesseractVault.js — V1.0.19 4D Hypercube Relic Vault
 *
 * 3D gallery for "Hawaiian Imports" (or any user-imported relics).
 * Renders a tesseract (4D hypercube projected to 3D) with relics
 * floating in/around the inner cube. Each relic is a clickable
 * mesh with metadata (lilikoi fudge, lychee, koa wood, etc.).
 *
 * Tesseract math: outer cube + inner cube + 8 connecting struts.
 * The inner cube rotates on its own axis (4D rotation projection)
 * to give the impossible-geometry feel.
 *
 * Flatland: NO position:fixed, NO floating UI. Inline document flow.
 * Relic detail panel unfolds BELOW the canvas (sequential).
 */
import React, { Suspense, useMemo, useRef, useState, useEffect, useCallback } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float, Html, Environment } from '@react-three/drei';
import * as THREE from 'three';
import { ChevronUp, Gem, Package, Info, Lock, Plus, X as XIcon } from 'lucide-react';
import { toast } from 'sonner';
import { PHI } from '../utils/SovereignMath';
import { useAITexture } from '../hooks/useAITexture';
import ClimbLadderPill from './ClimbLadderPill';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

// Default relic catalogue — Hawaiian imports from user's actual business
const DEFAULT_RELICS = [
  { id: 'lilikoi-fudge', label: 'Lilikoi Fudge', origin: 'Maui · Family Recipe', color: '#FBBF24', tier: 'sovereign' },
  { id: 'lychee', label: 'Lychee', origin: 'Big Island Orchards', color: '#F472B6', tier: 'all' },
  { id: 'macadamia', label: 'Macadamia Nuts', origin: 'Kona Roastery', color: '#A78BFA', tier: 'all' },
  { id: 'koa-wood', label: 'Koa Wood Carving', origin: 'Hawaii Heritage', color: '#92400E', tier: 'architect' },
  { id: 'kona-coffee', label: 'Kona Coffee', origin: 'South Kona Slopes', color: '#7C2D12', tier: 'all' },
  { id: 'sea-salt', label: 'Black Hawaiian Salt', origin: 'Molokai Salt Pans', color: '#1F2937', tier: 'all' },
  { id: 'taro', label: 'Taro Chips', origin: 'Kauai Fields', color: '#7C3AED', tier: 'all' },
  { id: 'spam-musubi', label: 'Spam Musubi Kit', origin: 'Honolulu Diner', color: '#EF4444', tier: 'all' },
];

// Tesseract structure — outer cube vertices + inner cube vertices + struts
function TesseractWireframe({ size = 1.4, innerScale = 0.55, color = '#FCD34D' }) {
  const innerRef = useRef();
  const outerRef = useRef();

  // Outer cube edge geometry
  const outerEdges = useMemo(() => {
    const geo = new THREE.BoxGeometry(size, size, size);
    return new THREE.EdgesGeometry(geo);
  }, [size]);

  // Inner cube edge geometry
  const innerEdges = useMemo(() => {
    const geo = new THREE.BoxGeometry(size * innerScale, size * innerScale, size * innerScale);
    return new THREE.EdgesGeometry(geo);
  }, [size, innerScale]);

  // 8 connecting struts (corner-to-corner outer→inner)
  const strutLines = useMemo(() => {
    const half = size / 2;
    const innerHalf = (size * innerScale) / 2;
    const corners = [
      [-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1],
      [-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1],
    ];
    const points = [];
    corners.forEach((c) => {
      points.push(new THREE.Vector3(c[0] * half, c[1] * half, c[2] * half));
      points.push(new THREE.Vector3(c[0] * innerHalf, c[1] * innerHalf, c[2] * innerHalf));
    });
    const geo = new THREE.BufferGeometry().setFromPoints(points);
    return geo;
  }, [size, innerScale]);

  // The 4D-projection illusion: rotate inner cube on different axes than outer
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (outerRef.current) {
      outerRef.current.rotation.x = Math.sin(t * 0.3) * 0.2;
      outerRef.current.rotation.y = t * 0.15;
    }
    if (innerRef.current) {
      innerRef.current.rotation.x = -Math.cos(t * 0.5) * 0.3;
      innerRef.current.rotation.y = -t * 0.4 * PHI;
      innerRef.current.rotation.z = Math.sin(t * 0.25) * 0.2;
    }
  });

  return (
    <group>
      <lineSegments ref={outerRef} geometry={outerEdges}>
        <lineBasicMaterial color={color} transparent opacity={0.6} />
      </lineSegments>
      <lineSegments ref={innerRef} geometry={innerEdges}>
        <lineBasicMaterial color={color} transparent opacity={0.85} />
      </lineSegments>
      <lineSegments geometry={strutLines}>
        <lineBasicMaterial color={color} transparent opacity={0.25} />
      </lineSegments>
    </group>
  );
}

// A single relic — floating mesh inside the tesseract
function Relic({ relic, position, isSelected, onSelect }) {
  const ref = useRef();
  // V1.1.0 — Each relic gets a bespoke AI-generated texture (Hawaiian Imports).
  // Cached on backend so subsequent visitors see it instantly.
  const { texture: aiTex } = useAITexture({ category: 'relic', refId: relic.id });
  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;
    // Gentle bob using PHI-derived frequency
    ref.current.position.y = position[1] + Math.sin(t * PHI + position[0]) * 0.04;
    ref.current.rotation.y = t * 0.2 + position[0];
    // Selected = pulse
    const target = isSelected ? 1.5 : 1;
    ref.current.scale.lerp(new THREE.Vector3(target, target, target), 0.15);
  });
  return (
    <group ref={ref} position={position}>
      <mesh
        onPointerOver={() => { document.body.style.cursor = 'pointer'; }}
        onPointerOut={() => { document.body.style.cursor = 'default'; }}
        onClick={(e) => { e.stopPropagation(); onSelect(relic); }}
      >
        <icosahedronGeometry args={[0.10, 0]} />
        <meshStandardMaterial
          color={aiTex ? '#ffffff' : relic.color}
          map={aiTex || null}
          emissive={relic.color}
          emissiveIntensity={isSelected ? 1.4 : 0.7}
          metalness={aiTex ? 0.45 : 0.7}
          roughness={aiTex ? 0.4 : 0.25}
        />
      </mesh>
      {isSelected && (
        <Html center distanceFactor={6} style={{ pointerEvents: 'none' }}>
          <div style={{
            padding: '4px 8px',
            fontSize: 10,
            fontFamily: 'monospace',
            color: relic.color,
            background: 'rgba(2,6,18,0.85)',
            border: `1px solid ${relic.color}55`,
            borderRadius: 4,
            letterSpacing: 1,
            whiteSpace: 'nowrap',
            transform: 'translate3d(0,-26px,0)',
          }}>
            {relic.label}
          </div>
        </Html>
      )}
    </group>
  );
}

export default function TesseractVault({ onClose, relics = DEFAULT_RELICS }) {
  const [selected, setSelected] = useState(null);
  // V1.1.1 — Hawaiian Imports storage rights (Sparks → slots).
  // Vault state hydrates from /api/tesseract-vault/state when authed;
  // guests still see the catalogue rendered inline (no claim affordance).
  const [vaultState, setVaultState] = useState(null);
  const [loadingClaim, setLoadingClaim] = useState(null);
  const fetchVault = useCallback(async () => {
    const token = localStorage.getItem('zen_token');
    if (!token || token === 'guest_token') return;
    try {
      const r = await fetch(`${API}/tesseract-vault/state`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (r.ok) setVaultState(await r.json());
    } catch {}
  }, []);
  useEffect(() => { fetchVault(); }, [fetchVault]);

  const claimedIds = useMemo(() => {
    if (!vaultState) return new Set();
    return new Set((vaultState.claims || []).map((c) => c.relic_id));
  }, [vaultState]);

  const claimRelic = useCallback(async (relicId) => {
    const token = localStorage.getItem('zen_token');
    if (!token || token === 'guest_token') {
      toast('Sign in to claim relics into your vault');
      return;
    }
    setLoadingClaim(relicId);
    try {
      const r = await fetch(`${API}/tesseract-vault/claim/${relicId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (r.ok) {
        const j = await r.json();
        toast.success(`✦ ${relicId.replace(/-/g, ' ')} claimed · ${j.slots_used}/${j.slots_total} slots`);
        await fetchVault();
      } else {
        const j = await r.json().catch(() => ({}));
        const detail = typeof j.detail === 'object' ? j.detail.message : (j.detail || 'Claim failed');
        toast.error(detail);
      }
    } catch (e) {
      toast.error('Network error');
    } finally {
      setLoadingClaim(null);
    }
  }, [fetchVault]);

  const releaseRelic = useCallback(async (relicId) => {
    const token = localStorage.getItem('zen_token');
    if (!token || token === 'guest_token') return;
    setLoadingClaim(relicId);
    try {
      const r = await fetch(`${API}/tesseract-vault/release/${relicId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (r.ok) {
        toast(`Released · ${relicId.replace(/-/g, ' ')}`);
        await fetchVault();
      }
    } catch {}
    finally { setLoadingClaim(null); }
  }, [fetchVault]);

  // Position relics around the inner cube — golden-spiral on a sphere
  const relicPositions = useMemo(() => {
    const n = relics.length;
    const positions = [];
    const phi = Math.PI * (3 - Math.sqrt(5));  // golden angle
    for (let i = 0; i < n; i++) {
      const y = 1 - (i / (n - 1)) * 2;  // -1..1
      const radius = Math.sqrt(1 - y * y);
      const theta = phi * i;
      const x = Math.cos(theta) * radius;
      const z = Math.sin(theta) * radius;
      positions.push([x * 1.0, y * 0.55, z * 1.0]);
    }
    return positions;
  }, [relics]);

  return (
    <div
      data-testid="tesseract-vault"
      style={{
        position: 'relative',
        width: '100%',
        minHeight: 520,
        borderRadius: 16,
        overflow: 'hidden',
        background: 'radial-gradient(circle at 50% 30%, rgba(252,211,77,0.10) 0%, rgba(2,6,18,0.98) 70%)',
        border: '1px solid rgba(252,211,77,0.22)',
        marginBottom: 16,
      }}
    >
      <div style={{
        padding: '14px 16px 10px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
        borderBottom: '1px solid rgba(252,211,77,0.15)', gap: 8, flexWrap: 'wrap',
      }}>
        <div style={{ fontFamily: 'monospace', color: '#FCD34D' }}>
          <div style={{ fontSize: 11, letterSpacing: 2 }}>TESSERACT RELIC VAULT</div>
          <div style={{ fontSize: 9, letterSpacing: 1.5, opacity: 0.65, marginTop: 2 }}>
            <Gem size={9} style={{ verticalAlign: 'middle' }} /> 4D HYPERCUBE · {relics.length} RELICS
          </div>
        </div>
        <div style={{ display: 'inline-flex', gap: 8, fontFamily: 'monospace', fontSize: 9, color: '#FCD34Dcc', alignItems: 'center', flexWrap: 'wrap' }}>
          <Package size={10} /> HAWAIIAN IMPORTS
          {vaultState?.quota && (
            <span data-testid="vault-slot-quota" style={{
              padding: '3px 8px',
              borderRadius: 999,
              fontSize: 9,
              background: 'rgba(252,211,77,0.10)',
              border: '1px solid rgba(252,211,77,0.25)',
              color: '#FCD34D',
              letterSpacing: 1.2,
            }}>
              {vaultState.slots_used}/{vaultState.quota.total_slots} SLOTS
              {vaultState.quota.bonus_slots > 0 && (
                <span style={{ marginLeft: 4, opacity: 0.7 }}>(+{vaultState.quota.bonus_slots} ✦)</span>
              )}
            </span>
          )}
        </div>
      </div>

      <div style={{
        padding: '4px 16px 6px',
        textAlign: 'center', fontFamily: 'monospace',
        fontSize: 9, letterSpacing: 2, color: 'rgba(252,211,77,0.7)',
      }}>
        DRAG TO ORBIT · TAP RELIC TO INSPECT
      </div>

      <div style={{ width: '100%', height: 380 }}>
        <Canvas camera={{ position: [0, 0.4, 2.6], fov: 50 }} dpr={[1, 1.75]} data-testid="tesseract-canvas">
          <ambientLight intensity={0.45} />
          <pointLight position={[2, 2, 2]} intensity={0.9} color="#FCD34D" />
          <pointLight position={[-2, -1, 2]} intensity={0.5} color="#FB923C" />
          <Suspense fallback={null}>
            <Environment preset="night" />
          </Suspense>
          <Float speed={0.4} rotationIntensity={0.15} floatIntensity={0.2}>
            <TesseractWireframe size={1.6} innerScale={0.55} color="#FCD34D" />
            {relics.map((r, i) => (
              <Relic
                key={r.id}
                relic={r}
                position={relicPositions[i]}
                isSelected={selected && selected.id === r.id}
                onSelect={(rel) => setSelected(selected && selected.id === rel.id ? null : rel)}
              />
            ))}
          </Float>
          <OrbitControls
            enablePan={false}
            minDistance={1.8}
            maxDistance={5}
            enableDamping
            dampingFactor={0.08}
            autoRotate={!selected}
            autoRotateSpeed={0.4}
          />
        </Canvas>
      </div>

      {/* Selected relic detail panel — INLINE, pushes content down (Flatland clean) */}
      {selected && (
        <div data-testid="relic-detail-panel" style={{
          padding: '12px 16px',
          borderTop: '1px solid rgba(252,211,77,0.18)',
          background: `${selected.color}08`,
          fontFamily: 'monospace',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 6 }}>
            <div>
              <div style={{ fontSize: 12, color: selected.color, letterSpacing: 1.5 }}>{selected.label.toUpperCase()}</div>
              <div style={{ fontSize: 10, color: 'rgba(248,250,252,0.65)', marginTop: 3 }}>
                <Info size={9} style={{ verticalAlign: 'middle' }} /> {selected.origin}
              </div>
            </div>
            <span style={{
              padding: '3px 8px',
              borderRadius: 999,
              fontSize: 8.5,
              letterSpacing: 1.5,
              border: `1px solid ${selected.color}55`,
              background: `${selected.color}15`,
              color: selected.color,
            }}>
              {selected.tier === 'all' ? 'ALL TIERS' : `${selected.tier.toUpperCase()}+ ONLY`}
            </span>
          </div>
          {/* V1.1.1 — Claim / Release. Only when authed (vaultState exists). */}
          {vaultState && (() => {
            const isClaimed = claimedIds.has(selected.id);
            const cataItem = (vaultState.catalogue || []).find((c) => c.id === selected.id);
            const eligible = cataItem ? cataItem.tier_eligible : true;
            const lockReason = cataItem?.lock_reason;
            const slotsFull = !isClaimed && vaultState.slots_available <= 0;
            const isLoading = loadingClaim === selected.id;
            return (
              <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                {isClaimed ? (
                  <button
                    type="button"
                    onClick={() => releaseRelic(selected.id)}
                    disabled={isLoading}
                    data-testid={`vault-release-${selected.id}`}
                    style={{
                      padding: '6px 12px',
                      borderRadius: 999,
                      background: 'rgba(248,250,252,0.04)',
                      border: '1px solid rgba(248,250,252,0.20)',
                      color: 'rgba(248,250,252,0.85)',
                      fontFamily: 'monospace',
                      fontSize: 9,
                      letterSpacing: 1.5,
                      cursor: isLoading ? 'wait' : 'pointer',
                      display: 'inline-flex', alignItems: 'center', gap: 6,
                    }}
                  >
                    <XIcon size={10} /> RELEASE
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => eligible && !slotsFull && claimRelic(selected.id)}
                    disabled={!eligible || slotsFull || isLoading}
                    data-testid={`vault-claim-${selected.id}`}
                    style={{
                      padding: '6px 12px',
                      borderRadius: 999,
                      background: !eligible || slotsFull
                        ? 'rgba(248,250,252,0.03)'
                        : `${selected.color}25`,
                      border: `1px solid ${!eligible || slotsFull ? 'rgba(248,250,252,0.10)' : selected.color + '55'}`,
                      color: !eligible || slotsFull ? 'rgba(248,250,252,0.40)' : selected.color,
                      fontFamily: 'monospace',
                      fontSize: 9,
                      letterSpacing: 1.5,
                      cursor: !eligible || slotsFull || isLoading ? 'not-allowed' : 'pointer',
                      display: 'inline-flex', alignItems: 'center', gap: 6,
                    }}
                  >
                    {!eligible ? <Lock size={10} /> : <Plus size={10} />}
                    {!eligible ? lockReason || 'TIER LOCKED' : slotsFull ? 'VAULT FULL' : 'CLAIM TO VAULT'}
                  </button>
                )}
                <span style={{ fontSize: 9, color: 'rgba(248,250,252,0.5)', letterSpacing: 1 }}>
                  {isClaimed ? '✦ in your vault' : `${vaultState.slots_available || 0} slots free · earn sparks for more`}
                </span>
                {/* V1.1.4 — All-Time Upsell. When the relic is tier-locked,
                    surface the buy-up pill inline so the user has a one-tap
                    path to unlock instead of a dead-end disabled button. */}
                {!isClaimed && !eligible && cataItem && (
                  <ClimbLadderPill
                    requiredTier={cataItem.tier}
                    context={`vault-${selected.id}`}
                    featureLabel={selected.label}
                    variant="compact"
                  />
                )}
              </div>
            );
          })()}
        </div>
      )}

      {onClose && (
        <div style={{ padding: '8px 16px 12px', textAlign: 'center', borderTop: '1px solid rgba(252,211,77,0.10)' }}>
          <button
            type="button"
            onClick={onClose}
            data-testid="tesseract-vault-fold"
            style={{
              background: 'transparent',
              border: '1px solid rgba(252,211,77,0.3)',
              color: 'rgba(252,211,77,0.85)',
              padding: '5px 12px',
              borderRadius: 999,
              fontFamily: 'monospace',
              fontSize: 8.5,
              letterSpacing: 2,
              cursor: 'pointer',
              display: 'inline-flex', alignItems: 'center', gap: 6,
            }}
          >
            <ChevronUp size={10} /> FOLD VAULT
          </button>
        </div>
      )}
    </div>
  );
}
