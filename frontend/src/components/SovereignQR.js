/**
 * SovereignQR.js — QR code generator + inline sheet.
 *
 * V68.30 — Replaced the custom SVG encoder (which produced invalid format-
 * info bits, causing scanners to reject the code) with the battle-tested
 * `qrcode` library. Keeps the same public API, same Om emblem, same
 * Metabolic-Seal footprint (<40KB gzipped).
 *
 * API:
 *   <QRSvg value="..." size={240} fg="#A78BFA" bg="transparent" />
 *   <MyQRSheet open={bool} onClose={fn} />
 */

import React, { useEffect, useMemo, useState } from 'react';
import ReactDOM from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import QRCode from 'qrcode';
import { X, Copy, Check, Share2 } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

/* ─── React components ─── */

export function QRSvg({ value, size = 240, fg = '#100018', bg = 'transparent', centerGlyph = 'ॐ', centerColor = '#C084FC', centerBg = '#FFFFFF', centerSize = 0.18 }) {
  const [svgMarkup, setSvgMarkup] = useState(null);

  useEffect(() => {
    if (!value) { setSvgMarkup(null); return; }
    let cancelled = false;
    // ECC-H (30% recovery) — comfortably accommodates the Om emblem and
    // any optical print/screen degradation. The qrcode lib returns a
    // compact SVG string we directly embed.
    QRCode.toString(value, {
      type: 'svg',
      errorCorrectionLevel: 'H',
      margin: 1,
      color: { dark: fg, light: '#00000000' },
    })
      .then(svg => { if (!cancelled) setSvgMarkup(svg); })
      .catch(() => { if (!cancelled) setSvgMarkup(null); });
    return () => { cancelled = true; };
  }, [value, fg]);

  const emblemPx = useMemo(() => size * centerSize, [size, centerSize]);

  if (!svgMarkup) {
    return (
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} xmlns="http://www.w3.org/2000/svg" data-testid="qr-svg">
        <rect width={size} height={size} fill={bg} />
      </svg>
    );
  }

  // Extract the inner content of the library SVG and wrap with our own
  // viewBox so we can overlay the emblem.
  return (
    <div
      data-testid="qr-svg"
      style={{ width: size, height: size, position: 'relative', background: bg }}
    >
      <div
        style={{ width: '100%', height: '100%' }}
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: svgMarkup.replace('<svg ', `<svg width="${size}" height="${size}" style="display:block" `) }}
      />
      {centerGlyph && (
        <div
          style={{
            position: 'absolute',
            top: '50%', left: '50%',
            width: emblemPx, height: emblemPx,
            transform: 'translate(-50%, -50%)',
            background: centerBg,
            borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: "'Noto Sans Devanagari', 'Noto Sans', system-ui, sans-serif",
            fontSize: emblemPx * 0.72,
            fontWeight: 600,
            color: centerColor,
            lineHeight: 1,
            userSelect: 'none',
          }}
        >
          {centerGlyph}
        </div>
      )}
    </div>
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

  // V68.30: While the QR sheet is open, mark <html> with `qr-sheet-open` so
  // any portaled ChamberProp (BREATHE / RING BELL / MANDALA) hides behind
  // the backdrop and can't corrupt the QR's finder patterns.
  useEffect(() => {
    if (typeof document === 'undefined') return;
    if (open) document.documentElement.classList.add('qr-sheet-open');
    else document.documentElement.classList.remove('qr-sheet-open');
    return () => document.documentElement.classList.remove('qr-sheet-open');
  }, [open]);

  const absoluteUrl = share
    ? `${(process.env.REACT_APP_PUBLIC_URL || (typeof window !== 'undefined' && window.location.origin) || 'https://enlighten-mint-cafe.me').replace(/\/$/, '')}${share.share_path}`
    : '';

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
  if (typeof document === 'undefined') return null;
  return ReactDOM.createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(16px)',
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
    </AnimatePresence>,
    document.body
  );
}
