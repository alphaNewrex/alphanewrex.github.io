# Regenerate: python3 scripts/make-og-image.py src/images/profile/harsh.jpeg public/og.png
# Needs Pillow and the macOS system fonts (Arial, Menlo); update the text below if your title changes.
# 1200x630 social preview card in the site's dot-matrix style.
import sys
from PIL import Image, ImageDraw, ImageFont, ImageOps
photo_path, out = sys.argv[1:]
W, H, K = 1200, 630, 2  # draw at 2x, downsample
img = Image.new("RGB", (W * K, H * K), (255, 255, 255))
d = ImageDraw.Draw(img)
INK, MUTED, ACCENT, DOT = (11, 11, 12), (91, 91, 99), (255, 106, 61), (215, 215, 218)

# Background dot grid (same 24px pitch as the site).
for y in range(12, H, 24):
    for x in range(12, W, 24):
        r = 1.3 * K
        d.ellipse((x * K - r, y * K - r, x * K + r, y * K + r), fill=DOT)

# Card.
pad = 48
d.rounded_rectangle((pad * K, pad * K, (W - pad) * K, (H - pad) * K), 28 * K, fill=(255, 255, 255), outline=(200, 200, 204), width=2 * K)

# Dot-matrix H mark.
GRID = ["X...X", "X...X", "XXOXX", "X...X", "X...X"]
ox, oy, p = 104, 108, 16
for r, row in enumerate(GRID):
    for c, ch in enumerate(row):
        cx, cy = (ox + c * p) * K, (oy + r * p) * K
        if ch == ".":
            rr, col = 2.4 * K, (220, 220, 224)
        else:
            rr, col = 6.4 * K, ACCENT if ch == "O" else INK
        d.ellipse((cx - rr, cy - rr, cx + rr, cy + rr), fill=col)

bold = "/System/Library/Fonts/Supplemental/Arial Bold.ttf"
regular = "/System/Library/Fonts/Supplemental/Arial.ttf"
mono = "/System/Library/Fonts/Menlo.ttc"
f_name = ImageFont.truetype(bold, 74 * K)
f_role = ImageFont.truetype(bold, 34 * K)
f_sub = ImageFont.truetype(regular, 26 * K)
f_url = ImageFont.truetype(mono, 22 * K)
tx = 96
d.text((tx * K, 212 * K), "Harsh Gujarathi", font=f_name, fill=INK)
d.text((tx * K, 312 * K), "Software Engineer and", font=f_role, fill=INK)
d.text((tx * K, 356 * K), "ML Systems Researcher", font=f_role, fill=INK)
d.text((tx * K, 420 * K), "Graduate Student Researcher at Georgia Tech", font=f_sub, fill=MUTED)
d.text((tx * K, 456 * K), "Previously Software Engineer at Microsoft", font=f_sub, fill=MUTED)
d.text((tx * K, 520 * K), "harshgujarathi.com", font=f_url, fill=ACCENT)

# Round photo with a dotted ring.
size, cx, cy = 300, 900, 315
photo = ImageOps.fit(Image.open(photo_path).convert("RGB"), (size * K, size * K), centering=(0.5, 0.32))
mask = Image.new("L", (size * K, size * K), 0)
ImageDraw.Draw(mask).ellipse((0, 0, size * K, size * K), fill=255)
img.paste(photo, ((cx - size // 2) * K, (cy - size // 2) * K), mask)
import math
for i in range(56):
    a = i / 56 * math.tau
    rr = (3.4 if i % 4 == 0 else 2.2) * K
    x, y = (cx + 172 * math.cos(a)) * K, (cy + 172 * math.sin(a)) * K
    d.ellipse((x - rr, y - rr, x + rr, y + rr), fill=INK if i % 4 else ACCENT)

img.resize((W, H), Image.LANCZOS).save(out, optimize=True)
print(out)
