/**
 * ShareCardService.js
 * Generates high-res aesthetic share cards from Atmosphere Journal entries.
 * 1080x1920 story format with Crystal Seal (real SHA-256).
 */

async function sha256(str) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

function hexToRgb(hex) {
  const h = hex.replace('#', '');
  return { r: parseInt(h.substring(0, 2), 16), g: parseInt(h.substring(2, 4), 16), b: parseInt(h.substring(4, 6), 16) };
}

function darkenHex(hex, factor = 0.4) {
  const { r, g, b } = hexToRgb(hex);
  const d = v => Math.round(v * factor);
  return `rgb(${d(r)},${d(g)},${d(b)})`;
}

/**
 * Generate a shareable card image from an atmosphere entry.
 * @param {Object} entry - { name, filters, source_prompt, created_at, id }
 * @param {string[]} [colorHexes] - color hex values for gradient
 * @returns {Promise<string>} data URL of the generated PNG
 */
export async function generateShareCard(entry, colorHexes) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = 1080;
  canvas.height = 1920;

  const colors = colorHexes?.length ? colorHexes : ['#8B5CF6', '#3B82F6'];
  const f = entry.filters || {};

  // ── Background Gradient ──
  const grad = ctx.createLinearGradient(0, 0, canvas.width * 0.3, canvas.height);
  grad.addColorStop(0, darkenHex(colors[0], 0.35));
  grad.addColorStop(0.5, darkenHex(colors[1] || colors[0], 0.25));
  grad.addColorStop(1, '#0a0a0a');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1080, 1920);

  // ── Radial glow center ──
  const radGrad = ctx.createRadialGradient(540, 850, 50, 540, 850, 600);
  radGrad.addColorStop(0, `${colors[0]}30`);
  radGrad.addColorStop(0.5, `${colors[1] || colors[0]}12`);
  radGrad.addColorStop(1, 'transparent');
  ctx.fillStyle = radGrad;
  ctx.fillRect(0, 0, 1080, 1920);

  // ── Noise/grain overlay ──
  for (let i = 0; i < 12000; i++) {
    const x = Math.random() * 1080;
    const y = Math.random() * 1920;
    const a = Math.random() * 0.03;
    ctx.fillStyle = `rgba(255,255,255,${a})`;
    ctx.fillRect(x, y, 1, 1);
  }

  // ── Color orbs ──
  colors.forEach((c, i) => {
    const cx = 540 + (i - (colors.length - 1) / 2) * 100;
    const orbGrad = ctx.createRadialGradient(cx, 680, 10, cx, 680, 60);
    orbGrad.addColorStop(0, `${c}99`);
    orbGrad.addColorStop(0.6, `${c}30`);
    orbGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = orbGrad;
    ctx.beginPath();
    ctx.arc(cx, 680, 60, 0, Math.PI * 2);
    ctx.fill();

    // Solid core
    ctx.fillStyle = c;
    ctx.beginPath();
    ctx.arc(cx, 680, 16, 0, Math.PI * 2);
    ctx.fill();
  });

  // ── Divider line ──
  const lineGrad = ctx.createLinearGradient(200, 0, 880, 0);
  lineGrad.addColorStop(0, 'transparent');
  lineGrad.addColorStop(0.5, `${colors[0]}40`);
  lineGrad.addColorStop(1, 'transparent');
  ctx.strokeStyle = lineGrad;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(200, 770);
  ctx.lineTo(880, 770);
  ctx.stroke();

  // ── Top label ──
  ctx.textAlign = 'center';
  ctx.fillStyle = `${colors[0]}88`;
  ctx.font = '500 22px "JetBrains Mono", monospace';
  ctx.letterSpacing = '8px';
  ctx.fillText('C H R O M O T H E R A P Y', 540, 580);

  // ── Resonance Name (main title) ──
  ctx.fillStyle = '#F8FAFC';
  ctx.font = '300 78px "Cormorant Garamond", serif';
  const name = entry.name || 'Untitled';
  // Word wrap for long names
  const words = name.split(' ');
  if (words.length > 2) {
    ctx.font = '300 62px "Cormorant Garamond", serif';
    ctx.fillText(words.slice(0, 2).join(' '), 540, 880);
    ctx.fillText(words.slice(2).join(' '), 540, 955);
  } else {
    ctx.fillText(name, 540, 900);
  }

  // ── Frequency/Filters info ──
  ctx.font = '400 26px "JetBrains Mono", monospace';
  ctx.fillStyle = 'rgba(248,250,252,0.3)';
  const filterStr = [];
  if (f.hueRotate) filterStr.push(`${f.hueRotate}° hue`);
  if (f.brightness && f.brightness !== 100) filterStr.push(`${f.brightness}% bright`);
  if (f.saturate && f.saturate !== 100) filterStr.push(`${f.saturate}% sat`);
  if (f.contrast && f.contrast !== 100) filterStr.push(`${f.contrast}% contrast`);
  ctx.fillText(filterStr.join(' · ') || 'Pure Spectrum', 540, 1020);

  // ── Source prompt ──
  if (entry.source_prompt && entry.source_prompt !== 'Manual Adjustment') {
    ctx.font = 'italic 24px "Cormorant Garamond", serif';
    ctx.fillStyle = 'rgba(248,250,252,0.18)';
    const prompt = entry.source_prompt.length > 50 ? entry.source_prompt.substring(0, 50) + '...' : entry.source_prompt;
    ctx.fillText(`"${prompt}"`, 540, 1080);
  }

  // ── Date ──
  const dateStr = entry.created_at ? new Date(entry.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '';
  if (dateStr) {
    ctx.font = '400 20px "Inter", sans-serif';
    ctx.fillStyle = 'rgba(248,250,252,0.12)';
    ctx.fillText(dateStr, 540, 1140);
  }

  // ── Crystal Seal (SHA-256) ──
  const sealData = `${entry.id}:${entry.name}:${JSON.stringify(f)}:${entry.created_at || ''}`;
  const hash = await sha256(sealData);

  ctx.textAlign = 'left';
  ctx.font = '400 16px "JetBrains Mono", monospace';
  ctx.fillStyle = 'rgba(248,250,252,0.1)';
  ctx.fillText(`CRYSTAL SEAL · SHA-256`, 60, 1780);
  ctx.font = '400 13px "JetBrains Mono", monospace';
  ctx.fillStyle = 'rgba(248,250,252,0.06)';
  ctx.fillText(hash, 60, 1805);

  // ── Trust branding ──
  ctx.textAlign = 'center';
  ctx.font = '500 24px "Cormorant Garamond", serif';
  ctx.fillStyle = 'rgba(248,250,252,0.15)';
  ctx.fillText('ENLIGHTEN.MINT.CAFE', 540, 1870);
  ctx.font = '300 16px "Cormorant Garamond", serif';
  ctx.fillStyle = 'rgba(248,250,252,0.08)';
  ctx.fillText('Sovereign Trust · Chromatic Resonance', 540, 1900);

  return canvas.toDataURL('image/png');
}

/**
 * Download a share card as PNG.
 */
export function downloadShareCard(dataUrl, name) {
  const link = document.createElement('a');
  link.download = `${(name || 'atmosphere').replace(/\s+/g, '_').toLowerCase()}_card.png`;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
