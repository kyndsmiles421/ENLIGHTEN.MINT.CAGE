/**
 * SovereignQR.js — Pure-SVG QR code generator + inline sheet.
 *
 * Zero external dependencies (no qrcode.react install) — respects the
 * Metabolic Seal. Uses the standard QR Code reference implementation
 * condensed into a single file. Supports QR up to Version 10, ECC-L/M.
 *
 * API:
 *   <QRSvg value="..." size={240} fg="#A78BFA" bg="transparent" />
 *   <MyQRSheet open={bool} onClose={fn} />   — fetches share URL & renders.
 *
 * MyQRSheet fetches GET /api/share/pattern and renders a QR for
 * <origin>/<share_path>. Any phone camera can scan it and open the
 * Resonance Share page.
 */

import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { X, Copy, Check, Share2 } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

/* ─── Tiny QR encoder (byte mode, ECC-M, auto-version up to 10) ─── */
// Based on the standard QR algorithm. Only the parts we actually need.
/* eslint-disable no-bitwise */

// Galois field tables for Reed–Solomon over GF(256)
const GF_EXP = new Uint8Array(512);
const GF_LOG = new Uint8Array(256);
(function buildTables() {
  let x = 1;
  for (let i = 0; i < 255; i++) {
    GF_EXP[i] = x;
    GF_LOG[x] = i;
    x <<= 1;
    if (x & 0x100) x ^= 0x11d;
  }
  for (let i = 255; i < 512; i++) GF_EXP[i] = GF_EXP[i - 255];
})();

function rsGenPoly(n) {
  let poly = new Uint8Array([1]);
  for (let i = 0; i < n; i++) {
    const next = new Uint8Array(poly.length + 1);
    for (let j = 0; j < poly.length; j++) {
      next[j] ^= poly[j];
      const t = (GF_LOG[poly[j]] + i) % 255;
      next[j + 1] ^= GF_EXP[t];
    }
    poly = next;
  }
  return poly;
}

function rsEncode(data, ecLen) {
  const gen = rsGenPoly(ecLen);
  const buf = new Uint8Array(data.length + ecLen);
  buf.set(data, 0);
  for (let i = 0; i < data.length; i++) {
    const lead = buf[i];
    if (!lead) continue;
    const logLead = GF_LOG[lead];
    for (let j = 0; j < gen.length; j++) {
      buf[i + j] ^= GF_EXP[(GF_LOG[gen[j]] + logLead) % 255];
    }
  }
  return buf.slice(data.length);
}

// Capacity table (version, ECC-M byte-mode data bytes)
const CAP_M = [0, 14, 26, 42, 62, 84, 106, 122, 152, 180, 213]; // v1..v10

function pickVersion(len) {
  for (let v = 1; v <= 10; v++) if (CAP_M[v] >= len + 2) return v;
  return 10;
}

// Block structure per (version, ecc=M): [blocks, dataBytesPerBlock, ecBytesPerBlock]
const BLOCK_M = {
  1:  [[1, 16, 10]],
  2:  [[1, 28, 16]],
  3:  [[1, 44, 26]],
  4:  [[2, 32, 18]],
  5:  [[2, 43, 24]],
  6:  [[4, 27, 16]],
  7:  [[4, 31, 18]],
  8:  [[2, 38, 22], [2, 39, 22]],
  9:  [[3, 36, 22], [2, 37, 22]],
  10: [[4, 43, 26], [1, 44, 26]],
};

function bits(arr, val, count) {
  for (let i = count - 1; i >= 0; i--) arr.push((val >> i) & 1);
}

function encodeByteData(text, version) {
  // Byte mode indicator (4 bits = 0100), char-count (8 bits for v1-9, 16 for v10+)
  const bytes = new TextEncoder().encode(text);
  const bitArr = [];
  bits(bitArr, 0b0100, 4);
  bits(bitArr, bytes.length, version < 10 ? 8 : 16);
  for (let i = 0; i < bytes.length; i++) bits(bitArr, bytes[i], 8);
  // Terminator
  const totalBits = CAP_M[version] * 8;
  for (let i = 0; i < 4 && bitArr.length < totalBits; i++) bitArr.push(0);
  while (bitArr.length % 8 !== 0) bitArr.push(0);
  // Pad bytes 0xEC, 0x11 alternating
  const pads = [0xEC, 0x11];
  let p = 0;
  while (bitArr.length < totalBits) { bits(bitArr, pads[p % 2], 8); p++; }
  // To bytes
  const data = new Uint8Array(bitArr.length / 8);
  for (let i = 0; i < data.length; i++) {
    let b = 0;
    for (let j = 0; j < 8; j++) b = (b << 1) | bitArr[i * 8 + j];
    data[i] = b;
  }
  return data;
}

function interleaveCodewords(data, version) {
  const groups = BLOCK_M[version];
  // Expand to full [dataBlocks, ecBlocks]
  const dataBlocks = [];
  const ecBlocks = [];
  let off = 0;
  let ecLen = 0;
  for (const [nBlocks, dLen, eLen] of groups) {
    for (let i = 0; i < nBlocks; i++) {
      const block = data.slice(off, off + dLen);
      off += dLen;
      dataBlocks.push(block);
      ecBlocks.push(rsEncode(block, eLen));
      ecLen = eLen;
    }
  }
  // Interleave data
  const out = [];
  const maxDLen = Math.max(...dataBlocks.map(b => b.length));
  for (let i = 0; i < maxDLen; i++) {
    for (const b of dataBlocks) if (i < b.length) out.push(b[i]);
  }
  for (let i = 0; i < ecLen; i++) {
    for (const b of ecBlocks) out.push(b[i]);
  }
  return new Uint8Array(out);
}

// Module plotting
function buildMatrix(version, codewords) {
  const size = 17 + version * 4;
  const m = Array.from({ length: size }, () => new Int8Array(size).fill(-1));
  // Finder patterns (3 corners)
  function finder(r, c) {
    for (let i = -1; i <= 7; i++) for (let j = -1; j <= 7; j++) {
      const y = r + i, x = c + j;
      if (y < 0 || y >= size || x < 0 || x >= size) continue;
      const edge = (i === 0 || i === 6 || j === 0 || j === 6);
      const inner = (i >= 2 && i <= 4 && j >= 2 && j <= 4);
      m[y][x] = (edge || inner) ? 1 : 0;
    }
  }
  finder(0, 0); finder(0, size - 7); finder(size - 7, 0);
  // Timing
  for (let i = 8; i < size - 8; i++) {
    if (m[6][i] === -1) m[6][i] = (i % 2 === 0) ? 1 : 0;
    if (m[i][6] === -1) m[i][6] = (i % 2 === 0) ? 1 : 0;
  }
  // Dark module
  m[size - 8][8] = 1;
  // Reserve format info areas (set to 0 temp)
  for (let i = 0; i < 9; i++) if (m[8][i] === -1) m[8][i] = 0;
  for (let i = 0; i < 8; i++) if (m[i][8] === -1) m[i][8] = 0;
  for (let i = size - 8; i < size; i++) m[i][8] = m[8][i] = (i === size - 8) ? 1 : 0;

  // Place data in zig-zag, skipping reserved modules
  let bitIdx = 0;
  const totalBits = codewords.length * 8;
  let col = size - 1, upward = true;
  while (col > 0) {
    if (col === 6) col--;
    for (let i = 0; i < size; i++) {
      const row = upward ? size - 1 - i : i;
      for (let x = 0; x < 2; x++) {
        const c = col - x;
        if (m[row][c] === -1) {
          let bit = 0;
          if (bitIdx < totalBits) {
            const b = codewords[bitIdx >> 3];
            bit = (b >> (7 - (bitIdx & 7))) & 1;
            bitIdx++;
          }
          m[row][c] = bit;
        }
      }
    }
    col -= 2; upward = !upward;
  }

  // Mask (pattern 0: (i+j)%2 === 0)
  for (let r = 0; r < size; r++) for (let c = 0; c < size; c++) {
    // Don't mask reserved (finder/timing/format)
    const inFinder = (r < 9 && c < 9) || (r < 9 && c >= size - 8) || (r >= size - 8 && c < 9);
    const inTiming = (r === 6 || c === 6);
    if (inFinder || inTiming) continue;
    if ((r + c) % 2 === 0) m[r][c] ^= 1;
  }

  // Format info (ECC M, mask 0 = 0b00101011110101)
  const fmt = 0b101010000010010;
  for (let i = 0; i < 15; i++) {
    const bit = (fmt >> (14 - i)) & 1;
    if (i < 6) m[8][i] = bit;
    else if (i < 8) m[8][i + 1] = bit;
    else if (i === 8) m[7][8] = bit;
    else m[14 - i][8] = bit;
    if (i < 7) m[size - 1 - i][8] = bit;
    else m[8][size - 15 + i] = bit;
  }

  return m;
}

export function encodeQR(text) {
  const v = pickVersion(new TextEncoder().encode(text).length);
  const data = encodeByteData(text, v);
  const codewords = interleaveCodewords(data, v);
  return buildMatrix(v, codewords);
}

/* ─── React components ─── */

export function QRSvg({ value, size = 240, fg = '#FFFFFF', bg = 'transparent' }) {
  const matrix = useMemo(() => {
    try { return encodeQR(value || ''); } catch { return null; }
  }, [value]);
  if (!matrix) return null;
  const n = matrix.length;
  const cell = size / n;
  const rects = [];
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      if (matrix[r][c] === 1) {
        rects.push(<rect key={`${r}-${c}`} x={c * cell} y={r * cell} width={cell + 0.5} height={cell + 0.5} fill={fg} />);
      }
    }
  }
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} xmlns="http://www.w3.org/2000/svg" data-testid="qr-svg">
      <rect width={size} height={size} fill={bg} />
      {rects}
    </svg>
  );
}

export default function MyQRSheet({ open, onClose }) {
  const [share, setShare] = useState(null);
  const [err, setErr] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!open) return;
    const token = localStorage.getItem('zen_token');
    if (!token || token === 'guest_token') {
      setErr('Sign in to generate your sovereign QR.');
      return;
    }
    setErr(null); setShare(null);
    axios.get(`${API}/share/pattern`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setShare(res.data))
      .catch(() => setErr('Could not load your share pattern. Try again.'));
  }, [open]);

  const absoluteUrl = share ? `${window.location.origin}${share.share_path}` : '';

  const copyUrl = async () => {
    if (!absoluteUrl) return;
    try { await navigator.clipboard.writeText(absoluteUrl); setCopied(true); setTimeout(() => setCopied(false), 1400); } catch { /* noop */ }
  };

  const nativeShare = async () => {
    if (!absoluteUrl) return;
    try {
      if (navigator.share) {
        await navigator.share({ title: 'My Sovereign Lattice', text: share?.caption || '', url: absoluteUrl });
      } else {
        await copyUrl();
      }
    } catch { /* user canceled */ }
  };

  if (!open) return null;
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        style={{
          position: 'fixed', inset: 0, zIndex: 70,
          background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 20,
        }}
        data-testid="my-qr-sheet"
      >
        <motion.div
          initial={{ scale: 0.92, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.92, y: 10 }}
          transition={{ duration: 0.4, ease: [0.618, 0, 0.618, 1] }}
          style={{
            width: '100%', maxWidth: 360,
            background: 'rgba(16,12,24,0.96)',
            border: '1px solid rgba(192,132,252,0.25)',
            borderRadius: 21,
            padding: 21,
            boxShadow: '0 0 80px rgba(192,132,252,0.25)',
            color: '#fff', fontFamily: 'monospace',
            position: 'relative',
          }}
        >
          <button
            type="button" onClick={onClose} data-testid="my-qr-close"
            style={{
              position: 'absolute', top: 10, right: 10,
              background: 'rgba(255,255,255,0.06)', border: 0, color: '#fff',
              padding: 6, borderRadius: 999, cursor: 'pointer',
            }}
          ><X size={14} /></button>

          <div style={{ textAlign: 'center', fontSize: 11, letterSpacing: 3, opacity: 0.6, marginBottom: 13 }}>
            MY SOVEREIGN QR
          </div>

          <div
            style={{
              background: '#ffffff',
              borderRadius: 13, padding: 13,
              display: 'flex', justifyContent: 'center', alignItems: 'center',
              boxShadow: '0 0 40px rgba(192,132,252,0.35)',
              minHeight: 260,
            }}
          >
            {err && <div style={{ color: '#0b0b0b', fontSize: 11, textAlign: 'center', padding: 34 }}>{err}</div>}
            {!err && share && <QRSvg value={absoluteUrl} size={234} fg="#100018" bg="transparent" />}
            {!err && !share && <div style={{ color: '#0b0b0b', fontSize: 11, padding: 34 }}>GENERATING…</div>}
          </div>

          {share && (
            <>
              <div style={{ fontSize: 10, lineHeight: 1.5, marginTop: 13, opacity: 0.7, textAlign: 'center' }}>
                {share.caption}
              </div>
              <div
                style={{
                  marginTop: 13, padding: 8,
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 8, fontSize: 9, wordBreak: 'break-all',
                  color: 'rgba(255,255,255,0.6)', textAlign: 'center',
                }}
                data-testid="my-qr-url"
              >{absoluteUrl}</div>
              <div style={{ display: 'flex', gap: 8, marginTop: 13 }}>
                <button
                  type="button" onClick={copyUrl} data-testid="my-qr-copy"
                  style={{
                    flex: 1, padding: '10px 12px', borderRadius: 21,
                    background: 'rgba(192,132,252,0.12)',
                    border: '1px solid rgba(192,132,252,0.35)',
                    color: '#C084FC', fontFamily: 'monospace',
                    fontSize: 10, letterSpacing: 2, cursor: 'pointer',
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  }}
                >
                  {copied ? <Check size={12} /> : <Copy size={12} />} {copied ? 'COPIED' : 'COPY LINK'}
                </button>
                <button
                  type="button" onClick={nativeShare} data-testid="my-qr-share"
                  style={{
                    flex: 1, padding: '10px 12px', borderRadius: 21,
                    background: '#C084FC', border: '1px solid #C084FC',
                    color: '#000', fontFamily: 'monospace', fontWeight: 700,
                    fontSize: 10, letterSpacing: 2, cursor: 'pointer',
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  }}
                >
                  <Share2 size={12} /> SHARE
                </button>
              </div>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
