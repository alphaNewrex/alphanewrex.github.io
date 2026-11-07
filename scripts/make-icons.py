# Regenerate: python3 scripts/make-icons.py public   (needs Pillow)
# Dot-matrix "H" favicon set: SVG (theme-aware) + PNG/ICO fallbacks.
import sys
from PIL import Image, ImageDraw
out = sys.argv[1]
GRID = ["X...X", "X...X", "XXOXX", "X...X", "X...X"]
INK_LIGHT, INK_DARK, ACCENT = "#0b0b0c", "#f4f4f5", "#ff6a3d"

# --- SVG: 50x50 units, pitch 10; lit r=4, unlit r=2.4 at low opacity.
dots = []
for r, row in enumerate(GRID):
    for c, ch in enumerate(row):
        cx, cy = c * 10 + 5, r * 10 + 5
        if ch == "X":
            dots.append(f'<circle class="on" cx="{cx}" cy="{cy}" r="4.7"/>')
        elif ch == "O":
            dots.append(f'<circle class="accent" cx="{cx}" cy="{cy}" r="4.7"/>')
        else:
            dots.append(f'<circle class="off" cx="{cx}" cy="{cy}" r="2.4"/>')
svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50">
<style>
.on{{fill:{INK_LIGHT}}}.off{{fill:{INK_LIGHT};opacity:.16}}.accent{{fill:{ACCENT}}}
@media (prefers-color-scheme:dark){{.on,.off{{fill:{INK_DARK}}}}}
</style>
{''.join(dots)}
</svg>
'''
open(f"{out}/favicon.svg", "w").write(svg)

# --- Raster: draw at 8x then downsample for smooth dots.
def raster(size, bg=None, pad=0.0, ink=INK_LIGHT, off_alpha=46):
    S = size * 8
    # Draw dots on their own layer and composite, so translucent dots blend with the tile.
    im = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    inner = S * (1 - 2 * pad)
    pitch = inner / 5
    o = S * pad
    ink_rgb = tuple(int(ink[i:i + 2], 16) for i in (1, 3, 5))
    acc = tuple(int(ACCENT[i:i + 2], 16) for i in (1, 3, 5))
    for r, row in enumerate(GRID):
        for c, ch in enumerate(row):
            cx, cy = o + (c + 0.5) * pitch, o + (r + 0.5) * pitch
            if ch == ".":
                rad, col = pitch * 0.2, ink_rgb + (off_alpha,)
            else:
                rad, col = pitch * 0.46, (acc if ch == "O" else ink_rgb) + (255,)
            d.ellipse((cx - rad, cy - rad, cx + rad, cy + rad), fill=col)
    if bg is not None:
        im = Image.alpha_composite(Image.new("RGBA", (S, S), bg), im)
    return im.resize((size, size), Image.LANCZOS)

dark_bg = (11, 11, 12, 255)
# Browser fallbacks: transparent background, ink dots (most tab bars are light).
ico = [raster(s) for s in (16, 32, 48)]
ico[2].save(f"{out}/favicon.ico", sizes=[(16, 16), (32, 32), (48, 48)], append_images=ico[:2])
# Home-screen / app icons: solid ink tile with light dots and safe padding.
raster(180, dark_bg, 0.2, INK_DARK, 34).convert("RGB").save(f"{out}/apple-touch-icon.png")
raster(192, dark_bg, 0.2, INK_DARK, 34).save(f"{out}/icon-192.png")
raster(512, dark_bg, 0.2, INK_DARK, 34).save(f"{out}/icon-512.png")
print("ok")
