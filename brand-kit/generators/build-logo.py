#!/usr/bin/env python3
"""
build-logo.py — generates the Pattaya.Gym logo system as real SVG.

The wordmark is emitted as OUTLINED PATHS, not live <text>. A logo that relies
on font-family renders as a fallback face on any machine without Space Grotesk —
which is every machine that is not this one. Outlines are what makes the file
safe to hand to a journalist, a partner, or a print shop.

Mark: a volt tile with a dark inner rule. Read as a boxing ring from above,
which is literally what the site indexes.

SCOPE: pattaya-gym.com only. The colours and geometry below are this site's,
hardcoded on purpose. Do not add a site switch and do not copy this out.
"""
import json, os
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont
from fontTools.pens.svgPathPen import SVGPathPen

VOLT = "#cbff3c"
INK = "#14180f"
BRAND_INK = "#3f6212"
BRIGHT = "#cbff3c"
WHITE = "#ffffff"

OUT = "assets"
os.makedirs(OUT, exist_ok=True)

# ---------------------------------------------------------------- the mark
def mark_svg(size=64, tile=VOLT, rule=INK, title="Pattaya.Gym"):
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="{size}" height="{size}" role="img" aria-label="{title}">
  <title>{title}</title>
  <rect width="64" height="64" rx="15" fill="{tile}"/>
  <rect x="9.5" y="9.5" width="45" height="45" rx="7.5" fill="none" stroke="{rule}" stroke-width="7"/>
</svg>
'''

# Favicon variant: heavier rule so the ring survives 16px rasterisation.
def favicon_svg():
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" role="img" aria-label="Pattaya.Gym">
  <title>Pattaya.Gym</title>
  <rect width="64" height="64" rx="13" fill="{VOLT}"/>
  <rect x="12" y="12" width="40" height="40" rx="6" fill="none" stroke="{INK}" stroke-width="10"/>
</svg>
'''

# Maskable icon: Android crops to a circle of 80% diameter, so the ring has to
# sit inside the safe zone and the volt has to bleed to the full canvas.
def maskable_svg():
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" role="img" aria-label="Pattaya.Gym">
  <rect width="64" height="64" fill="{VOLT}"/>
  <rect x="14" y="14" width="36" height="36" rx="6" fill="none" stroke="{INK}" stroke-width="9"/>
</svg>
'''

# ------------------------------------------------------------ the wordmark
def load_font(weight=700):
    f = TTFont("space-grotesk.woff2")
    if "fvar" in f:
        f = instantiateVariableFont(f, {"wght": weight}, inplace=False, updateFontNames=False)
    return f

def wordmark_paths(text, tracking_em=-0.03, weight=700):
    """Return (list of (path_d, char), total_advance) in 1000-upem units."""
    f = load_font(weight)
    upem = f["head"].unitsPerEm
    cmap = f.getBestCmap()
    gs = f.getGlyphSet()
    hmtx = f["hmtx"]
    out, x = [], 0.0
    track = tracking_em * upem
    for ch in text:
        gname = cmap[ord(ch)]
        pen = SVGPathPen(gs)
        gs[gname].draw(pen)
        d = pen.getCommands()
        adv = hmtx[gname][0]
        if d:
            out.append((d, x, ch))
        x += adv + track
    return out, x - track, upem

def build_wordmark_svg(ink=INK, dot=BRAND_INK, height=120):
    """pattaya.gym — 'pattaya' and 'gym' in ink, the dot in the brand colour."""
    glyphs, total, upem = wordmark_paths("pattaya.gym")
    # cap/asc bounds: use a fixed box so every variant aligns identically
    asc, desc = 760, -220          # visual bounds for lowercase + descenders
    vb_h = asc - desc
    scale = height / vb_h
    w = round(total * scale, 2)
    parts = []
    for d, x, ch in glyphs:
        fill = dot if ch == "." else ink
        parts.append(f'    <path d="{d}" fill="{fill}" transform="translate({round(x,2)} 0)"/>')
    body = "\n".join(parts)
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {round(total,2)} {vb_h}" width="{w}" height="{height}" role="img" aria-label="Pattaya.Gym">
  <title>Pattaya.Gym</title>
  <g transform="translate(0 {asc}) scale(1 -1)">
{body}
  </g>
</svg>
'''

def build_lockup_svg(ink=INK, dot=BRAND_INK, bg=None, pad=None):
    """Mark + wordmark on one baseline — the horizontal lockup."""
    glyphs, total, upem = wordmark_paths("pattaya.gym")
    asc, desc = 760, -220
    vb_h = asc - desc
    MARK = 1000.0                     # mark drawn at 1000x1000 then placed
    gap = 260.0
    mark_y = (vb_h - MARK) / 2
    W = MARK + gap + total
    H = vb_h
    pad_x = pad if pad is not None else 0
    total_w = W + pad_x * 2
    total_h = H + pad_x * 2
    bg_rect = f'<rect width="{round(total_w,2)}" height="{round(total_h,2)}" rx="{round(total_h*0.14,2)}" fill="{bg}"/>' if bg else ""
    parts = []
    for d, x, ch in glyphs:
        fill = dot if ch == "." else ink
        parts.append(f'      <path d="{d}" fill="{fill}" transform="translate({round(x,2)} 0)"/>')
    body = "\n".join(parts)
    s = MARK / 64.0
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {round(total_w,2)} {round(total_h,2)}" width="{round(total_w/10,1)}" height="{round(total_h/10,1)}" role="img" aria-label="Pattaya.Gym">
  <title>Pattaya.Gym</title>
  {bg_rect}
  <g transform="translate({pad_x} {pad_x})">
    <g transform="translate(0 {round(mark_y,2)}) scale({round(s,4)})">
      <rect width="64" height="64" rx="15" fill="{VOLT}"/>
      <rect x="9.5" y="9.5" width="45" height="45" rx="7.5" fill="none" stroke="{INK}" stroke-width="7"/>
    </g>
    <g transform="translate({round(MARK+gap,2)} {asc}) scale(1 -1)">
{body}
    </g>
  </g>
</svg>
'''

files = {
  "logo-mark.svg":            mark_svg(512),
  "logo-mark-on-dark.svg":    mark_svg(512, tile=VOLT, rule="#171c11"),
  "logo-wordmark-ink.svg":    build_wordmark_svg(ink=INK,  dot=BRAND_INK),
  "logo-wordmark-white.svg":  build_wordmark_svg(ink=WHITE, dot=BRIGHT),
  "logo-lockup-light.svg":    build_lockup_svg(ink=INK,  dot=BRAND_INK, bg=None,      pad=120),
  "logo-lockup-dark.svg":     build_lockup_svg(ink=WHITE, dot=BRIGHT,   bg="#171c11", pad=120),
  "favicon.svg":              favicon_svg(),
  "icon-maskable.svg":        maskable_svg(),
}
for name, data in files.items():
    with open(os.path.join(OUT, name), "w", encoding="utf-8") as fh:
        fh.write(data)
    print(f"  {len(data):6d} B  {name}")
print(f"\n{len(files)} SVG files written to {OUT}/")
