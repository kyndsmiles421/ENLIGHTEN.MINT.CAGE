"""Build 3 premium Play Store screenshots (1080x1920).

Each frame: cosmic-nebula full background + rounded phone panel in the
center showing the live app capture + gold headline above + tagline below.
"""
from PIL import Image, ImageDraw, ImageFilter, ImageFont
import os, random

OUT = "/app/frontend/public/store-assets"
F_SERIF = "/usr/share/fonts/truetype/liberation/LiberationSerif-Bold.ttf"
F_BOLD  = "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf"
F_REG   = "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf"

GOLD      = (240, 196, 112)
GOLD_SOFT = (255, 222, 150)
AMBER     = (255, 180, 80)
WHITE     = (245, 240, 230)


def nebula(w, h, seed):
    rng = random.Random(seed)
    img = Image.new("RGB", (w, h), (6, 4, 14))
    clouds = Image.new("RGB", (w, h), (0, 0, 0))
    cd = ImageDraw.Draw(clouds)
    palette = [(90, 40, 140), (60, 30, 120), (140, 60, 160),
               (40, 30, 100), (160, 90, 170), (70, 40, 130), (50, 20, 100)]
    for _ in range(50):
        r = rng.randint(180, 520)
        x = rng.randint(-120, w + 120)
        y = rng.randint(-120, h + 120)
        cd.ellipse([x-r, y-r, x+r, y+r], fill=rng.choice(palette))
    clouds = clouds.filter(ImageFilter.GaussianBlur(160))
    img = Image.blend(img, clouds, 0.82)

    # gold center aura
    aura = Image.new("RGB", (w, h), (0, 0, 0))
    ad = ImageDraw.Draw(aura)
    cx, cy = w // 2, int(h * 0.48)
    for r in range(int(h * 0.55), 80, -20):
        v = max(0, 255 - (int(h * 0.55) - r))
        ad.ellipse([cx-r, cy-r, cx+r, cy+r], fill=(min(v,130), min(v,70), 20))
    aura = aura.filter(ImageFilter.GaussianBlur(140))
    img = Image.blend(img, aura, 0.35)

    # stars
    d = ImageDraw.Draw(img)
    for _ in range(int(w * h / 1800)):
        x = rng.randint(0, w-1); y = rng.randint(0, h-1)
        s = rng.choice([1,1,1,2,2,3]); br = rng.randint(170, 255)
        d.ellipse([x, y, x+s, y+s], fill=(br, br, br))
    # sparkle stars
    for _ in range(20):
        x = rng.randint(0, w-1); y = rng.randint(0, h-1)
        sp = Image.new("RGBA", (44, 44), (0,0,0,0))
        sd = ImageDraw.Draw(sp)
        sd.line([(0, 22), (44, 22)], fill=(255, 235, 190, 210), width=1)
        sd.line([(22, 0), (22, 44)], fill=(255, 235, 190, 210), width=1)
        sp = sp.filter(ImageFilter.GaussianBlur(1))
        img.paste(sp, (x-22, y-22), sp)

    # vignette
    vg = Image.new("L", (w, h), 0)
    vd = ImageDraw.Draw(vg)
    for r in range(max(w,h), 100, -20):
        v = max(0, 255 - (max(w,h) - r) // 3)
        vd.ellipse([w//2-r, h//2-r, w//2+r, h//2+r], fill=v)
    vg = vg.filter(ImageFilter.GaussianBlur(100))
    black = Image.new("RGB", (w, h), (0, 0, 0))
    img = Image.composite(img, black, vg)
    return img.convert("RGBA")


def shadow_text(base, xy, text, font, fill, offset=3, blur=5, alpha=240):
    sh = Image.new("RGBA", base.size, (0,0,0,0))
    ImageDraw.Draw(sh).text((xy[0]+offset, xy[1]+offset), text, font=font, fill=(0,0,0,alpha))
    base.alpha_composite(sh.filter(ImageFilter.GaussianBlur(blur)))
    ImageDraw.Draw(base).text(xy, text, font=font, fill=fill)


def centered_x(draw, y, text, font, W):
    return (int((W - draw.textlength(text, font=font)) // 2), y)


def rounded_mask(w, h, r=60):
    m = Image.new("L", (w, h), 0)
    ImageDraw.Draw(m).rounded_rectangle([0, 0, w, h], radius=r, fill=255)
    return m


def build(capture_path, out_path, headline_lines, subline, tagline, seed=11):
    W, H = 1080, 1920
    frame = nebula(W, H, seed)
    d = ImageDraw.Draw(frame)

    # ── Phone panel holding the captured app screen
    panel_w, panel_h = 820, 1080
    panel_x, panel_y = (W - panel_w) // 2, 460

    # gold glow behind panel
    glow = Image.new("RGBA", (panel_w + 120, panel_h + 120), (0,0,0,0))
    gd = ImageDraw.Draw(glow)
    for i, a in enumerate([20, 34, 48]):
        gd.rounded_rectangle([i*20, i*20, panel_w+120-i*20, panel_h+120-i*20],
                             radius=80, fill=(240, 196, 112, a))
    glow = glow.filter(ImageFilter.GaussianBlur(32))
    frame.alpha_composite(glow, (panel_x - 60, panel_y - 60))

    if capture_path and os.path.exists(capture_path):
        shot = Image.open(capture_path).convert("RGB")
        # Preserve aspect — fit width and crop vertically centered
        src_w, src_h = shot.size
        aspect_target = panel_w / panel_h  # 820/1080 ≈ 0.76
        aspect_src = src_w / src_h
        if aspect_src > aspect_target:
            new_h = src_h
            new_w = int(src_h * aspect_target)
            left = (src_w - new_w) // 2
            shot = shot.crop((left, 0, left + new_w, new_h))
        else:
            new_w = src_w
            new_h = int(src_w / aspect_target)
            top = 0  # anchor to top so Hub title stays visible
            shot = shot.crop((0, top, new_w, top + new_h))
        shot = shot.resize((panel_w, panel_h), Image.LANCZOS).convert("RGBA")
        shot.putalpha(rounded_mask(panel_w, panel_h, r=60))
        frame.alpha_composite(shot, (panel_x, panel_y))
    # gold border
    bd = Image.new("RGBA", (panel_w + 8, panel_h + 8), (0,0,0,0))
    ImageDraw.Draw(bd).rounded_rectangle([0, 0, panel_w + 7, panel_h + 7],
                                         radius=64, outline=(240, 196, 112, 230), width=4)
    frame.alpha_composite(bd, (panel_x - 4, panel_y - 4))

    # ── Headline (top)
    y = 130
    for ln in headline_lines:
        for sz in range(86, 44, -2):
            f = ImageFont.truetype(F_SERIF, sz)
            if d.textlength(ln, font=f) <= W - 120: break
        shadow_text(frame, centered_x(d, y, ln, f, W), ln, f, GOLD_SOFT, blur=6)
        y += sz + 8
    # divider
    d.rectangle([W//2 - 140, y + 14, W//2 + 140, y + 18], fill=GOLD)
    # subline
    for sz in range(36, 22, -2):
        fs = ImageFont.truetype(F_REG, sz)
        if d.textlength(subline, font=fs) <= W - 160: break
    shadow_text(frame, centered_x(d, y + 36, subline, fs, W), subline, fs, WHITE)

    # ── Tagline (bottom)
    for sz in range(64, 32, -2):
        ft = ImageFont.truetype(F_BOLD, sz)
        if d.textlength(tagline, font=ft) <= W - 120: break
    shadow_text(frame, centered_x(d, H - 230, tagline, ft, W), tagline, ft, WHITE, blur=5)
    foot = "by INFINITY SOVEREIGN  ·  ENLIGHTEN.MINT.CAFE"
    ff = ImageFont.truetype(F_REG, 28)
    shadow_text(frame, centered_x(d, H - 150, foot, ff, W), foot, ff, AMBER)

    frame.convert("RGB").save(out_path, "PNG", optimize=True)
    print(f"✓ {os.path.basename(out_path)}")


# ── Build 3 Play Store screens
build("/app/frontend/public/store-assets/_captures/cap_hub2.png", f"{OUT}/playstore-1-hub.png",
      ["176+ Sovereign", "Nodules. Zero Hidden."],
      "Every module surfaced — Practice · Divination · Cosmos · Creators.",
      "THE SOVEREIGN UNIFIED ENGINE",
      seed=11)

build("/app/frontend/public/store-assets/_captures/cap_tesseract.png", f"{OUT}/playstore-2-observatory.png",
      ["Meditative", "Immersion."],
      "Tesseract · Dream Realms · Solfeggio tones · 60-second stillness rewards.",
      "EARN SPARKS IN STILLNESS",
      seed=23)

# Frame 3: emblem-focused (no capture — the emblem IS the subject)
# Reuse the logo tile as the panel
build(f"{OUT}/app-icon-512.png", f"{OUT}/playstore-3-lattice.png",
      ["9×9 Crystalline", "Lattice."],
      "Your path traced. Your resonance earned. Your Council stacked.",
      "HARMONIC INTERFERENCE",
      seed=37)

for f in ["playstore-1-hub.png", "playstore-2-observatory.png", "playstore-3-lattice.png"]:
    p = f"{OUT}/{f}"
    kb = os.path.getsize(p) / 1024
    print(f"  {f}: {Image.open(p).size}  {kb:.1f} KB")
