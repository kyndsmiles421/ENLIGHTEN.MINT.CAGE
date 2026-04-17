const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

function generateIcon(size, outputPath) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  const cx = size / 2;
  const cy = size / 2;

  // Background: deep obsidian
  ctx.fillStyle = '#0A0A12';
  ctx.fillRect(0, 0, size, size);

  // Radial glow behind infinity
  const bgGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, size * 0.45);
  bgGlow.addColorStop(0, 'rgba(139,92,246,0.12)');
  bgGlow.addColorStop(0.5, 'rgba(212,175,55,0.06)');
  bgGlow.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = bgGlow;
  ctx.fillRect(0, 0, size, size);

  // Draw infinity symbol
  const s = size * 0.18; // lobe radius
  const gap = size * 0.14; // distance from center to lobe center
  ctx.lineWidth = size * 0.035;

  // Gradient stroke for infinity
  const infGrad = ctx.createLinearGradient(cx - gap - s, cy, cx + gap + s, cy);
  infGrad.addColorStop(0, '#A78BFA');
  infGrad.addColorStop(0.3, '#D4AF37');
  infGrad.addColorStop(0.5, '#EF4444');
  infGrad.addColorStop(0.7, '#D4AF37');
  infGrad.addColorStop(1, '#A78BFA');
  ctx.strokeStyle = infGrad;

  // Left lobe
  ctx.beginPath();
  ctx.arc(cx - gap, cy, s, 0, Math.PI * 2);
  ctx.stroke();

  // Right lobe
  ctx.beginPath();
  ctx.arc(cx + gap, cy, s, 0, Math.PI * 2);
  ctx.stroke();

  // Center crossing: draw an X through the overlap
  ctx.lineWidth = size * 0.04;
  const crossSize = size * 0.06;
  ctx.beginPath();
  ctx.moveTo(cx - crossSize, cy - crossSize);
  ctx.lineTo(cx + crossSize, cy + crossSize);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx + crossSize, cy - crossSize);
  ctx.lineTo(cx - crossSize, cy + crossSize);
  ctx.stroke();

  // Crown above: 3 peaks
  const crownY = cy - s - size * 0.12;
  const crownW = size * 0.22;
  const crownH = size * 0.08;
  const crownGrad = ctx.createLinearGradient(cx - crownW, crownY, cx + crownW, crownY);
  crownGrad.addColorStop(0, '#D4AF37');
  crownGrad.addColorStop(0.5, '#FBBF24');
  crownGrad.addColorStop(1, '#D4AF37');

  ctx.strokeStyle = crownGrad;
  ctx.lineWidth = size * 0.02;
  ctx.beginPath();
  // Base line
  ctx.moveTo(cx - crownW, crownY + crownH);
  // Left peak
  ctx.lineTo(cx - crownW * 0.6, crownY);
  // Left valley
  ctx.lineTo(cx - crownW * 0.2, crownY + crownH * 0.5);
  // Center peak (tallest)
  ctx.lineTo(cx, crownY - crownH * 0.3);
  // Right valley
  ctx.lineTo(cx + crownW * 0.2, crownY + crownH * 0.5);
  // Right peak
  ctx.lineTo(cx + crownW * 0.6, crownY);
  // End
  ctx.lineTo(cx + crownW, crownY + crownH);
  ctx.stroke();

  // Crown gems: 3 small circles at peaks
  const gemColors = ['#EF4444', '#D4AF37', '#A78BFA'];
  const gemPositions = [
    [cx - crownW * 0.6, crownY],
    [cx, crownY - crownH * 0.3],
    [cx + crownW * 0.6, crownY]
  ];
  gemPositions.forEach((pos, i) => {
    ctx.beginPath();
    ctx.arc(pos[0], pos[1], size * 0.012, 0, Math.PI * 2);
    ctx.fillStyle = gemColors[i];
    ctx.fill();
    // Glow
    const glow = ctx.createRadialGradient(pos[0], pos[1], 0, pos[0], pos[1], size * 0.04);
    glow.addColorStop(0, gemColors[i] + '40');
    glow.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = glow;
    ctx.fillRect(pos[0] - size * 0.05, pos[1] - size * 0.05, size * 0.1, size * 0.1);
  });

  // Outer glow ring
  ctx.lineWidth = 1;
  const ringGrad = ctx.createRadialGradient(cx, cy, size * 0.36, cx, cy, size * 0.38);
  ringGrad.addColorStop(0, 'rgba(212,175,55,0.15)');
  ringGrad.addColorStop(1, 'rgba(212,175,55,0)');
  ctx.strokeStyle = ringGrad;
  ctx.beginPath();
  ctx.arc(cx, cy, size * 0.37, 0, Math.PI * 2);
  ctx.stroke();

  // Save
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(outputPath, buffer);
  console.log(`Icon generated: ${outputPath} (${size}x${size})`);
}

function generateFeatureGraphic(outputPath) {
  const w = 1024, h = 500;
  const canvas = createCanvas(w, h);
  const ctx = canvas.getContext('2d');

  // Background
  ctx.fillStyle = '#0A0A12';
  ctx.fillRect(0, 0, w, h);

  // Radial glow
  const bg = ctx.createRadialGradient(w * 0.3, h * 0.5, 0, w * 0.5, h * 0.5, w * 0.6);
  bg.addColorStop(0, 'rgba(139,92,246,0.08)');
  bg.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  // 7 domain orbs
  const orbs = [
    { x: 0.12, y: 0.35, color: '#FBBF24', label: 'Trade' },
    { x: 0.22, y: 0.65, color: '#22C55E', label: 'Healing' },
    { x: 0.08, y: 0.6, color: '#A78BFA', label: 'Mind' },
    { x: 0.18, y: 0.42, color: '#3B82F6', label: 'Science' },
    { x: 0.1, y: 0.48, color: '#EC4899', label: 'Creative' },
    { x: 0.25, y: 0.5, color: '#F97316', label: 'Explore' },
    { x: 0.15, y: 0.55, color: '#D4AF37', label: 'Sacred' },
  ];

  // Draw connecting lines
  ctx.lineWidth = 0.5;
  ctx.strokeStyle = 'rgba(212,175,55,0.08)';
  for (let i = 0; i < orbs.length; i++) {
    for (let j = i + 1; j < orbs.length; j++) {
      ctx.beginPath();
      ctx.moveTo(orbs[i].x * w, orbs[i].y * h);
      ctx.lineTo(orbs[j].x * w, orbs[j].y * h);
      ctx.stroke();
    }
  }

  // Draw orbs
  orbs.forEach(orb => {
    const ox = orb.x * w, oy = orb.y * h;
    // Glow
    const glow = ctx.createRadialGradient(ox, oy, 0, ox, oy, 30);
    glow.addColorStop(0, orb.color + '30');
    glow.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = glow;
    ctx.fillRect(ox - 30, oy - 30, 60, 60);
    // Dot
    ctx.beginPath();
    ctx.arc(ox, oy, 4, 0, Math.PI * 2);
    ctx.fillStyle = orb.color;
    ctx.fill();
  });

  // Title text
  ctx.fillStyle = '#E0E7FF';
  ctx.font = '600 52px serif';
  ctx.textAlign = 'center';
  ctx.fillText('INFINITY', w * 0.62, h * 0.38);

  ctx.fillStyle = '#D4AF37';
  ctx.font = '300 52px serif';
  ctx.fillText('SOVEREIGN', w * 0.62, h * 0.52);

  // Subtitle
  ctx.fillStyle = 'rgba(248,250,252,0.3)';
  ctx.font = '300 14px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('27 Workshops  |  162 Materials  |  243 Tools  |  791KB', w * 0.62, h * 0.66);

  // Tagline
  ctx.fillStyle = 'rgba(167,139,250,0.4)';
  ctx.font = '300 11px sans-serif';
  ctx.fillText('A Sovereign Wellness Engine', w * 0.62, h * 0.76);

  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(outputPath, buffer);
  console.log(`Feature graphic generated: ${outputPath} (${w}x${h})`);
}

// Generate all sizes
const outDir = '/app/frontend/public/store-assets';
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

generateIcon(512, path.join(outDir, 'icon-512.png'));
generateIcon(192, path.join(outDir, 'icon-192.png'));
generateIcon(48, path.join(outDir, 'icon-48.png'));
generateFeatureGraphic(path.join(outDir, 'feature-graphic-1024x500.png'));

console.log('\nAll store assets generated in:', outDir);
