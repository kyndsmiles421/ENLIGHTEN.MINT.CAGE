import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Zap, TrendingUp, Radio } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const API = process.env.REACT_APP_BACKEND_URL;

const CLUSTER_NAMES = ['Security', 'Location', 'Finance', 'Evolution'];
const CLUSTER_COLORS = ['#22C55E', '#3B82F6', '#FBBF24', '#EF4444'];

// ─── WebGL Shader Sources ───
const VERTEX_SHADER = `
  attribute vec2 a_position;
  attribute vec2 a_texCoord;
  varying vec2 v_texCoord;
  void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
    v_texCoord = a_texCoord;
  }
`;

const FRAGMENT_SHADER = `
  precision mediump float;
  varying vec2 v_texCoord;
  uniform sampler2D u_heatmap;
  uniform float u_time;
  uniform float u_surgeActive;

  vec3 heatColor(float t) {
    // Deep indigo → violet → gold → emerald
    vec3 c0 = vec3(0.06, 0.04, 0.12);   // void
    vec3 c1 = vec3(0.30, 0.20, 0.50);   // low resonance
    vec3 c2 = vec3(0.75, 0.52, 0.99);   // medium (violet)
    vec3 c3 = vec3(0.98, 0.75, 0.14);   // high (gold)
    vec3 c4 = vec3(0.13, 0.77, 0.37);   // peak (emerald)

    if (t < 0.25) return mix(c0, c1, t * 4.0);
    if (t < 0.5) return mix(c1, c2, (t - 0.25) * 4.0);
    if (t < 0.75) return mix(c2, c3, (t - 0.5) * 4.0);
    return mix(c3, c4, (t - 0.75) * 4.0);
  }

  void main() {
    vec4 data = texture2D(u_heatmap, v_texCoord);
    float intensity = data.r;

    // Pulse effect: cells breathe based on their intensity
    float pulse = sin(u_time * 2.0 + intensity * 6.28) * 0.08;
    intensity = clamp(intensity + pulse, 0.0, 1.0);

    // Surge glow: when active, add a golden shimmer
    float surgeGlow = u_surgeActive * sin(u_time * 3.0) * 0.15;

    vec3 color = heatColor(intensity);
    color += vec3(surgeGlow * 0.8, surgeGlow * 0.6, surgeGlow * 0.1);

    // Grid lines at cluster boundaries (every 6 cells in a 24×24 grid)
    float gridX = fract(v_texCoord.x * 4.0);
    float gridY = fract(v_texCoord.y * 4.0);
    float line = step(0.97, gridX) + step(0.97, gridY);
    color += vec3(line * 0.08);

    gl_FragColor = vec4(color, 0.95);
  }
`;

function ResonanceCanvas({ matrix, surgeActive }) {
  const canvasRef = useRef(null);
  const glRef = useRef(null);
  const programRef = useRef(null);
  const timeRef = useRef(0);
  const animRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl', { alpha: true, premultipliedAlpha: false });
    if (!gl) return;
    glRef.current = gl;

    // Compile shaders
    const vs = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vs, VERTEX_SHADER);
    gl.compileShader(vs);

    const fs = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fs, FRAGMENT_SHADER);
    gl.compileShader(fs);

    const program = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    programRef.current = program;

    // Quad geometry (fullscreen)
    const positions = new Float32Array([-1,-1, 1,-1, -1,1, 1,1]);
    const texCoords = new Float32Array([0,1, 1,1, 0,0, 1,0]);

    const posBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuf);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
    const posLoc = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    const texBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, texBuf);
    gl.bufferData(gl.ARRAY_BUFFER, texCoords, gl.STATIC_DRAW);
    const texLoc = gl.getAttribLocation(program, 'a_texCoord');
    gl.enableVertexAttribArray(texLoc);
    gl.vertexAttribPointer(texLoc, 2, gl.FLOAT, false, 0, 0);

    // Create heatmap texture
    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
    };
  }, []);

  // Update texture when matrix changes
  useEffect(() => {
    const gl = glRef.current;
    if (!gl || !matrix || matrix.length === 0) return;

    const n = matrix.length;
    const pixels = new Uint8Array(n * n * 4);
    let maxVal = 0;
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        if (matrix[i][j] > maxVal) maxVal = matrix[i][j];
      }
    }

    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        const idx = (i * n + j) * 4;
        const normalized = maxVal > 0 ? Math.min(matrix[i][j] / maxVal, 1) : 0;
        pixels[idx] = Math.floor(normalized * 255);     // R = intensity
        pixels[idx + 1] = Math.floor(normalized * 200);  // G
        pixels[idx + 2] = Math.floor(normalized * 150);  // B
        pixels[idx + 3] = 255;                            // A
      }
    }

    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, n, n, 0, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
  }, [matrix]);

  // Animation loop
  useEffect(() => {
    const gl = glRef.current;
    const program = programRef.current;
    if (!gl || !program || !matrix) return;

    const timeLoc = gl.getUniformLocation(program, 'u_time');
    const surgeLoc = gl.getUniformLocation(program, 'u_surgeActive');

    const render = () => {
      timeRef.current += 0.016;
      gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.useProgram(program);
      gl.uniform1f(timeLoc, timeRef.current);
      gl.uniform1f(surgeLoc, surgeActive ? 1.0 : 0.0);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      animRef.current = requestAnimationFrame(render);
    };

    render();
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [matrix, surgeActive]);

  return (
    <canvas
      ref={canvasRef}
      width={240}
      height={240}
      className="rounded-lg"
      style={{ width: '100%', aspectRatio: '1', imageRendering: 'pixelated' }}
      data-testid="resonance-webgl-canvas"
    />
  );
}

export default function CollectiveResonance({ isOpen, onClose }) {
  const { token, authHeaders } = useAuth();
  const [globalData, setGlobalData] = useState(null);
  const [globalMatrix, setGlobalMatrix] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchGlobal = useCallback(async () => {
    setLoading(true);
    try {
      const headers = token ? authHeaders : {};
      const [resGlobal, resMatrix] = await Promise.all([
        fetch(`${API}/api/resonance/global`, { headers }),
        token ? fetch(`${API}/api/resonance/matrix`, { headers: authHeaders }) : Promise.resolve(null),
      ]);
      const dataGlobal = await resGlobal.json();
      setGlobalData(dataGlobal);

      if (resMatrix && resMatrix.ok) {
        const dataMatrix = await resMatrix.json();
        setGlobalMatrix(dataMatrix?.matrix || null);
      }
    } catch {}
    setLoading(false);
  }, [token, authHeaders]);

  useEffect(() => {
    if (isOpen) fetchGlobal();
  }, [isOpen, fetchGlobal]);

  // Auto-refresh every 30 seconds when panel is open
  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(fetchGlobal, 30000);
    return () => clearInterval(interval);
  }, [isOpen, fetchGlobal]);

  const surgeActive = globalData?.surge?.active || false;

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="rounded-xl overflow-hidden"
      style={{
        background: 'rgba(11,12,21,0.98)',
        border: `1px solid ${surgeActive ? 'rgba(251,191,36,0.2)' : 'rgba(192,132,252,0.1)'}`,
        maxHeight: '80vh',
      }}
      data-testid="collective-resonance-panel"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
        <div className="flex items-center gap-2">
          <Radio size={14} style={{ color: surgeActive ? '#FBBF24' : '#C084FC' }} />
          <span className="text-xs font-medium" style={{ color: '#F8FAFC' }}>
            Collective Resonance
          </span>
          {surgeActive && (
            <motion.span
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-[8px] px-2 py-0.5 rounded-full font-semibold"
              style={{ background: 'rgba(251,191,36,0.15)', color: '#FBBF24', border: '1px solid rgba(251,191,36,0.25)' }}
              data-testid="surge-indicator"
            >
              HARMONY SURGE
            </motion.span>
          )}
        </div>
        <span className="text-[8px]" style={{ color: 'rgba(248,250,252,0.2)' }}>
          {globalData?.total_users_in_matrix || 0} users
        </span>
      </div>

      <div className="overflow-y-auto px-4 py-3" style={{ maxHeight: 'calc(80vh - 48px)' }}>
        {/* Global Density + Surge Summary */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="rounded-lg p-2.5 text-center" style={{
            background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)',
          }}>
            <div className="text-lg font-semibold" style={{
              color: (globalData?.global_density || 0) >= 0.85 ? '#22C55E' : '#C084FC'
            }}>
              {((globalData?.global_density || 0) * 100).toFixed(1)}%
            </div>
            <div className="text-[7px] uppercase" style={{ color: 'rgba(248,250,252,0.25)' }}>Global Density</div>
          </div>
          <div className="rounded-lg p-2.5 text-center" style={{
            background: surgeActive ? 'rgba(251,191,36,0.04)' : 'rgba(255,255,255,0.02)',
            border: `1px solid ${surgeActive ? 'rgba(251,191,36,0.1)' : 'rgba(255,255,255,0.04)'}`,
          }}>
            <div className="text-lg font-semibold" style={{ color: surgeActive ? '#FBBF24' : '#6B7280' }}>
              {surgeActive ? 'Active' : 'Dormant'}
            </div>
            <div className="text-[7px] uppercase" style={{ color: 'rgba(248,250,252,0.25)' }}>Surge State</div>
          </div>
        </div>

        {/* Surge Effects (when active) */}
        {surgeActive && globalData?.surge?.effects && (
          <div className="rounded-lg p-2.5 mb-3" style={{
            background: 'rgba(251,191,36,0.04)',
            border: '1px solid rgba(251,191,36,0.1)',
          }}>
            <div className="flex items-center gap-1.5 mb-2">
              <Zap size={10} style={{ color: '#FBBF24' }} />
              <span className="text-[9px] font-semibold" style={{ color: '#FBBF24' }}>Surge Effects Active</span>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              <div className="rounded-lg p-2" style={{ background: 'rgba(0,0,0,0.2)' }}>
                <div className="text-[7px]" style={{ color: 'rgba(248,250,252,0.3)' }}>Commerce Fee</div>
                <div className="text-[11px] font-semibold" style={{ color: '#22C55E' }}>
                  {globalData.surge.effects.commerce_fee_override}%
                  <span className="text-[7px] line-through ml-1" style={{ color: '#6B7280' }}>2%</span>
                </div>
              </div>
              <div className="rounded-lg p-2" style={{ background: 'rgba(0,0,0,0.2)' }}>
                <div className="text-[7px]" style={{ color: 'rgba(248,250,252,0.3)' }}>Transmute Cost</div>
                <div className="text-[11px] font-semibold" style={{ color: '#22C55E' }}>
                  -40%
                  <span className="text-[7px] ml-1" style={{ color: '#6B7280' }}>discount</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* WebGL Heatmap Shader */}
        {globalMatrix && (
          <div className="mb-3">
            <div className="flex items-center gap-1.5 mb-1.5">
              <Activity size={10} style={{ color: 'rgba(248,250,252,0.3)' }} />
              <span className="text-[8px] uppercase tracking-wider" style={{ color: 'rgba(248,250,252,0.25)' }}>
                Interference Field (Live)
              </span>
            </div>
            <ResonanceCanvas matrix={globalMatrix} surgeActive={surgeActive} />
            {/* Cluster axis labels */}
            <div className="flex mt-1">
              {CLUSTER_NAMES.map((name, i) => (
                <div key={name} className="flex-1 text-center text-[6px]" style={{ color: CLUSTER_COLORS[i] }}>
                  {name.charAt(0)}
                </div>
              ))}
            </div>
          </div>
        )}

        {!globalMatrix && !loading && (
          <div className="rounded-lg p-3 mb-3 text-center" style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.04)',
          }}>
            <p className="text-[9px]" style={{ color: 'rgba(248,250,252,0.3)' }}>
              Collective matrix forming as users resolve their H² states...
            </p>
          </div>
        )}

        {/* 4×4 Cluster Heatmap */}
        {globalData?.cluster_heatmap && (
          <div className="mb-3">
            <div className="text-[8px] uppercase tracking-wider mb-1.5" style={{ color: 'rgba(248,250,252,0.25)' }}>
              Cluster Resonance Map
            </div>
            <div className="grid grid-cols-4 gap-0.5">
              {globalData.cluster_heatmap.map((row, ri) =>
                row.map((cell, ci) => {
                  const intensity = Math.min(cell / 1.5, 1);
                  return (
                    <div
                      key={`${ri}-${ci}`}
                      className="rounded aspect-square flex items-center justify-center"
                      style={{
                        background: `rgba(${ri === ci ? '34,197,94' : '192,132,252'}, ${0.05 + intensity * 0.4})`,
                        border: `1px solid rgba(${ri === ci ? '34,197,94' : '192,132,252'}, ${0.05 + intensity * 0.15})`,
                      }}
                      title={`${CLUSTER_NAMES[ri]} × ${CLUSTER_NAMES[ci]}: ${cell.toFixed(3)}`}
                      data-testid={`cluster-cell-${ri}-${ci}`}
                    >
                      <span className="text-[7px] font-mono" style={{
                        color: `rgba(248,250,252, ${0.2 + intensity * 0.6})`
                      }}>
                        {(cell * 100).toFixed(0)}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
            <div className="flex mt-1">
              {CLUSTER_NAMES.map((name, i) => (
                <div key={name} className="flex-1 text-center text-[6px]" style={{ color: CLUSTER_COLORS[i] }}>
                  {name}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Cross-Cluster Resonance Bars */}
        {globalData?.cross_cluster_resonance && (
          <div className="rounded-lg p-2.5" style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.04)',
          }}>
            <div className="text-[8px] uppercase tracking-wider mb-2" style={{ color: 'rgba(248,250,252,0.25)' }}>
              Global Cross-Cluster Resonance
            </div>
            <div className="space-y-1">
              {Object.entries(globalData.cross_cluster_resonance).map(([key, value]) => {
                const isAboveThreshold = value >= 0.85;
                return (
                  <div key={key} className="flex items-center justify-between">
                    <span className="text-[9px]" style={{ color: 'rgba(248,250,252,0.4)' }}>{key}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
                        <motion.div
                          className="h-full rounded-full"
                          style={{
                            background: isAboveThreshold ? '#FBBF24' : value > 0.5 ? '#22C55E' : value > 0.3 ? '#818CF8' : '#EF4444',
                          }}
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(value * 100, 100)}%` }}
                          transition={{ duration: 0.5 }}
                        />
                      </div>
                      <span className="text-[8px] font-mono w-7 text-right" style={{
                        color: isAboveThreshold ? '#FBBF24' : value > 0.5 ? '#22C55E' : '#818CF8',
                      }}>
                        {(value * 100).toFixed(0)}%
                      </span>
                      {isAboveThreshold && <Zap size={8} style={{ color: '#FBBF24' }} />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
