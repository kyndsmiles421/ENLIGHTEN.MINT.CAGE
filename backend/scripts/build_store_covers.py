"""Build Google Play Store + Social cover assets for ENLIGHTEN.MINT.CAFE.

Source logic:
  - The zip user uploaded (`appstore-images (1).zip`) actually contains
    screenshots of the tile, not clean PNGs. We locate the highest-res clean
    TILE (with "ENLIGHTEN.MINT.CAFE" + "by INFINITY SOVEREIGN" arched text) by
    scanning the windows/LargeTile.scale-400.png for the non-chrome region.
  - Cosmic nebula backgrounds are built procedurally (purple/indigo gradient +
    stars + soft gold aura) so they stay sharp at 1024×500 and 1200×630.
"""
from PIL import Image, ImageDraw, ImageFilter, ImageFont
import numpy as np
import os, random, math

OUT = "/app/frontend/public/store-assets"
os.makedirs(OUT, exist_ok=True)

F_BOLD  = "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf"
F_REG   = "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf"
F_SERIF = "/usr/share/fonts/truetype/liberation/LiberationSerif-Bold.ttf"

GOLD       = (240, 196, 112)
GOLD_SOFT  = (255, 222, 150)
AMBER      = (255, 180, 80)
WHITE_SOFT = (245, 240, 230)

# ─── Extract the clean TILE from the highest-resolution source ────────
def extract_tile(path):
    im = Image.open(path).convert('RGB')
    a = np.array(im)
    sat    = a.max(axis=2) - a.min(axis=2)
    bright = a.mean(axis=2)
    mask   = (sat > 25) & (bright > 15) & (bright < 230)
    rows = np.any(mask, axis=1); cols = np.any(mask, axis=0)
    y0,y1 = int(np.argmax(rows)), int(len(rows) - np.argmax(rows[::-1]))
    x0,x1 = int(np.argmax(cols)), int(len(cols) - np.argmax(cols[::-1]))
    return im.crop((x0, y0, x1, y1))

tile = extract_tile('/tmp/appstore/windows/LargeTile.scale-400.png')
print("raw tile:", tile.size)
# The tile has the rounded-square artwork. Resize to 1024 square with sharpening
tile_hi = tile.resize((1024, 1024), Image.LANCZOS).filter(ImageFilter.SHARPEN)

# Save a STANDALONE hi-res app icon (just the tile + transparent-safe edges)
tile_hi.save(f"{OUT}/app-icon-1024.png", "PNG", optimize=True)
tile_hi.resize((512, 512), Image.LANCZOS).save(f"{OUT}/app-icon-512.png", "PNG", optimize=True)
print("✓ app-icon-1024.png & app-icon-512.png")

# ─── Procedural cosmic nebula background ─────────────────────────────
def nebula(w, h, seed=7):
    rng = random.Random(seed)
    img = Image.new("RGB", (w, h), (6, 4, 14))
    # paint soft radial clouds
    clouds = Image.new("RGB", (w, h), (0, 0, 0))
    cd = ImageDraw.Draw(clouds)
    palette = [(90, 40, 140), (60, 30, 120), (140, 60, 160),
               (40, 30, 100), (160, 90, 170), (70, 40, 130)]
    for _ in range(38):
        r = rng.randint(140, 420)
        x = rng.randint(-80, w + 80)
        y = rng.randint(-80, h + 80)
        c = rng.choice(palette)
        cd.ellipse([x - r, y - r, x + r, y + r], fill=c)
    clouds = clouds.filter(ImageFilter.GaussianBlur(120))
    # blend
    img = Image.blend(img, clouds, 0.85)
    # gold aura in the emblem region (left third)
    aura = Image.new("RGB", (w, h), (0, 0, 0))
    ad = ImageDraw.Draw(aura)
    cx, cy = w // 4, h // 2
    for r in range(int(h * 0.7), 60, -20):
        v = max(0, 255 - (int(h * 0.7) - r))
        ad.ellipse([cx - r, cy - r, cx + r, cy + r],
                   fill=(min(v, 120), min(v, 60), 20))
    aura = aura.filter(ImageFilter.GaussianBlur(120))
    img = Image.eval(Image.blend(img, aura, 0.30), lambda v: v)
    # stars
    d = ImageDraw.Draw(img)
    for _ in range(int(w * h / 2200)):
        x = rng.randint(0, w - 1); y = rng.randint(0, h - 1)
        s = rng.choice([1, 1, 1, 2, 2, 3])
        br = rng.randint(160, 255)
        d.ellipse([x, y, x + s, y + s], fill=(br, br, br))
    # a few large sparkle stars
    for _ in range(12):
        x = rng.randint(0, w - 1); y = rng.randint(0, h - 1)
        spark = Image.new("RGBA", (40, 40), (0, 0, 0, 0))
        sd = ImageDraw.Draw(spark)
        sd.line([(0, 20), (40, 20)], fill=(255, 230, 180, 200), width=1)
        sd.line([(20, 0), (20, 40)], fill=(255, 230, 180, 200), width=1)
        spark = spark.filter(ImageFilter.GaussianBlur(1))
        img.paste(spark, (x - 20, y - 20), spark)
    # darken edges (vignette)
    vg = Image.new("L", (w, h), 0)
    vd = ImageDraw.Draw(vg)
    for r in range(max(w, h), 100, -20):
        v = max(0, 255 - (max(w, h) - r) // 3)
        vd.ellipse([w//2 - r, h//2 - r, w//2 + r, h//2 + r], fill=v)
    vg = vg.filter(ImageFilter.GaussianBlur(80))
    black = Image.new("RGB", (w, h), (0, 0, 0))
    img = Image.composite(img, black, vg)
    return img.convert("RGBA")


def shadow_text(base, xy, text, font, fill, shadow=(0, 0, 0, 230), offset=3, blur=4):
    w, h = base.size
    sh = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    ImageDraw.Draw(sh).text((xy[0] + offset, xy[1] + offset), text, font=font, fill=shadow)
    base.alpha_composite(sh.filter(ImageFilter.GaussianBlur(blur)))
    ImageDraw.Draw(base).text(xy, text, font=font, fill=fill)


# ─── Extract emblem only (no arched text) for overlay compositions ───
# The tile's central region is the Sri Yantra + nebula without arched text;
# crop the central 62% square of the tile.
w0, h0 = tile.size
side = min(w0, h0)
cxy = (w0 // 2, h0 // 2)
half = int(side * 0.31)  # 62%/2
emblem_src = tile.crop((cxy[0] - half, cxy[1] - half,
                        cxy[0] + half, cxy[1] + half))


# ═══ 1024 × 500 FEATURE GRAPHIC ═══════════════════════════════════════
FW, FH = 1024, 500
bg = nebula(FW, FH, seed=11)

emb = emblem_src.resize((440, 440), Image.LANCZOS).convert("RGBA")
# soft circular fade at edges (vignette the emblem)
mask = Image.new("L", emb.size, 0)
ImageDraw.Draw(mask).ellipse([10, 10, emb.size[0]-10, emb.size[1]-10], fill=255)
mask = mask.filter(ImageFilter.GaussianBlur(18))
emb.putalpha(mask)

# gold glow
glow = Image.new("RGBA", (540, 540), (0, 0, 0, 0))
gd = ImageDraw.Draw(glow)
for i, a in enumerate([20, 34, 50]):
    gd.ellipse([i * 14, i * 14, 540 - i * 14, 540 - i * 14],
               fill=(240, 196, 112, a))
glow = glow.filter(ImageFilter.GaussianBlur(30))

ex, ey = 36, (FH - 440) // 2
bg.paste(glow, (ex - 50, ey - 50), glow)
bg.paste(emb, (ex, ey), emb)

# Text column on the right
tx = 505
avail = FW - tx - 24
# auto-fit title font size
title_text = "ENLIGHTEN.MINT.CAFE"
probe_draw = ImageDraw.Draw(bg)
for size in range(66, 28, -2):
    f_title = ImageFont.truetype(F_SERIF, size)
    if probe_draw.textlength(title_text, font=f_title) <= avail:
        break
f_tag     = ImageFont.truetype(F_BOLD, 32)
f_sub     = ImageFont.truetype(F_REG, 20)
f_micro   = ImageFont.truetype(F_REG, 14)

shadow_text(bg, (tx, 135), title_text, f_title, GOLD_SOFT)
ImageDraw.Draw(bg).rectangle([tx, 215, tx + 340, 218], fill=GOLD)
shadow_text(bg, (tx, 232), "THE SOVEREIGN",  f_tag, WHITE_SOFT)
shadow_text(bg, (tx, 274), "UNIFIED ENGINE", f_tag, WHITE_SOFT)
shadow_text(bg, (tx, 334), "by INFINITY SOVEREIGN", f_sub, AMBER)

micro = "Sovereign PWA  ·  176+ Nodules  ·  9×9 Crystalline Lattice"
mw = ImageDraw.Draw(bg).textlength(micro, font=f_micro)
ImageDraw.Draw(bg).text((FW - mw - 26, FH - 28), micro, font=f_micro, fill=(200, 180, 140, 230))

bg.convert("RGB").save(f"{OUT}/feature-graphic-1024x500.png", "PNG", optimize=True)
print("✓ feature-graphic-1024x500.png")

# ═══ 1200 × 630 OPEN-GRAPH SOCIAL CARD ═══════════════════════════════
OW, OH = 1200, 630
og = nebula(OW, OH, seed=17)
og_em = emblem_src.resize((560, 560), Image.LANCZOS).convert("RGBA")
omask = Image.new("L", og_em.size, 0)
ImageDraw.Draw(omask).ellipse([10, 10, og_em.size[0]-10, og_em.size[1]-10], fill=255)
omask = omask.filter(ImageFilter.GaussianBlur(24))
og_em.putalpha(omask)

og_glow = Image.new("RGBA", (660, 660), (0, 0, 0, 0))
gd = ImageDraw.Draw(og_glow)
for i, a in enumerate([18, 30, 44]):
    gd.ellipse([i * 16, i * 16, 660 - i * 16, 660 - i * 16],
               fill=(240, 196, 112, a))
og_glow = og_glow.filter(ImageFilter.GaussianBlur(36))
ex, ey = 50, (OH - 560) // 2
og.paste(og_glow, (ex - 50, ey - 50), og_glow)
og.paste(og_em, (ex, ey), og_em)

ogtx = 680
avail_og = OW - ogtx - 30
og_title_text = "ENLIGHTEN.MINT.CAFE"
probe = ImageDraw.Draw(og)
for size in range(88, 40, -2):
    ogf_title = ImageFont.truetype(F_SERIF, size)
    if probe.textlength(og_title_text, font=ogf_title) <= avail_og:
        break
ogf_tag   = ImageFont.truetype(F_BOLD, 42)
ogf_sub   = ImageFont.truetype(F_REG, 26)
ogf_micro = ImageFont.truetype(F_REG, 18)

shadow_text(og, (ogtx, 170), og_title_text, ogf_title, GOLD_SOFT)
ImageDraw.Draw(og).rectangle([ogtx, 270, ogtx + 420, 274], fill=GOLD)
shadow_text(og, (ogtx, 300), "THE SOVEREIGN",  ogf_tag, WHITE_SOFT)
shadow_text(og, (ogtx, 355), "UNIFIED ENGINE", ogf_tag, WHITE_SOFT)
shadow_text(og, (ogtx, 430), "by INFINITY SOVEREIGN", ogf_sub, AMBER)

ogmicro = "Sovereign PWA  ·  176+ Nodules  ·  9×9 Crystalline Lattice"
omw = ImageDraw.Draw(og).textlength(ogmicro, font=ogf_micro)
ImageDraw.Draw(og).text((OW - omw - 30, OH - 36), ogmicro, font=ogf_micro, fill=(200, 180, 140, 230))

og.convert("RGB").save(f"{OUT}/og-cover-1200x630.png", "PNG", optimize=True)
print("✓ og-cover-1200x630.png")

# ═══ Report ═══════════════════════════════════════════════════════════
for f in ["feature-graphic-1024x500.png", "app-icon-512.png", "app-icon-1024.png", "og-cover-1200x630.png"]:
    p = f"{OUT}/{f}"
    if os.path.exists(p):
        kb = os.path.getsize(p) / 1024
        im = Image.open(p)
        print(f"  {f}: {im.size}  {kb:.1f} KB")
