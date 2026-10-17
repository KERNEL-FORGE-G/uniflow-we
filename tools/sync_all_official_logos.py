#!/usr/bin/env python3
"""
Synchronise et régénère tous les logos, icônes, favicons et marques sur le Web,
Desktop et Mobile à partir du logo officiel final d'UniFlow :
`new_design_andinterface/logo final uniflow.png` (sha256 46c0e7c5bd42482c1998eb7f163155adbf5e26ac412634562e779ac325958b7b).
"""

import os
import shutil
import base64
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OFFICIAL_LOGO = os.path.join(ROOT, "new_design_andinterface", "logo final uniflow.png")

assert os.path.isfile(OFFICIAL_LOGO), f"Official logo not found: {OFFICIAL_LOGO}"

im_full = Image.open(OFFICIAL_LOGO).convert("RGBA")

# 1. Exact 1:1 copies of the official full logo PNG
exact_copies = [
    # Web
    "web/public/logo.png",
    "web/public/logo_1.png",
    "web/public/logo-principal.png",
    "web/public/assets/logo.png",
    "web/public/logos/logo.png",
    "web/public/logos/logo_1.png",
    "web/public/logos/logo-alt.png",
    "web/public/logos/logo-principal.png",
    "web/public/logos/uniflow_logo_final.png",
    "web/public/logos/uniflow-wordmark.png",
    "web/public/logos/uniflow-primary-original.png",
    "web/public/logos/UniFlow_Logo_Principal.png",
    "web/public/brand/logo.png",
    "web/public/brand/logo_principal.png",
    "web/public/brand/uniflow_logo_final.png",
    "web/public/brand/uniflow_store_logo.png",
    "web/public/brand/uniflow_logo_horizontal.png",
    "web/src/assets/logo.png",
    "web/src/assets/logo_1.png",
    # Desktop
    "desktop/assets/logos/logo.png",
    "desktop/assets/logos/logo_1.png",
    "desktop/assets/logos/logo-alt.png",
    "desktop/assets/logos/logo-principal.png",
    "desktop/assets/logos/uniflow_logo_final.png",
    "desktop/assets/logos/uniflow_logo_horizontal.png",
    "desktop/assets/brand/logo.png",
    "desktop/assets/brand/logo_principal.png",
    "desktop/assets/brand/uniflow_logo_final.png",
    "desktop/assets/brand/uniflow_store_logo.png",
    "desktop/assets/brand/uniflow_logo_horizontal.png",
    # Mobile
    "mobile/assets/logos/logo.png",
    "mobile/assets/logos/logo_1.png",
    "mobile/assets/logos/logo-alt.png",
    "mobile/assets/logos/logo-principal.png",
    "mobile/assets/logos/uniflow_logo_final.png",
    "mobile/assets/logos/uniflow_logo_horizontal.png",
    "mobile/assets/brand/logo.png",
    "mobile/assets/brand/logo_principal.png",
    "mobile/assets/brand/uniflow_logo_final.png",
    "mobile/assets/brand/uniflow_store_logo.png",
    "mobile/assets/brand/uniflow_logo_horizontal.png",
]

for rel_path in exact_copies:
    dest = os.path.join(ROOT, rel_path)
    os.makedirs(os.path.dirname(dest), exist_ok=True)
    shutil.copyfile(OFFICIAL_LOGO, dest)
    print(f"Copied exact logo -> {rel_path}")

# 2. Resized clean PNG icons
resized_targets = [
    (1024, ["web/public/brand/icon_1024.png"]),
    (512, [
        "web/public/logos/icon-512.png",
        "web/public/brand/icon-512.png",
        "web/public/brand/icon_512.png",
    ]),
    (256, ["web/public/brand/icon_256.png"]),
    (192, [
        "web/public/logos/icon-192.png",
        "web/public/brand/icon-192.png",
        "web/public/brand/icon_192.png",
    ]),
    (180, [
        "web/public/apple-touch-icon.png",
        "web/public/logos/apple-touch-icon.png",
    ]),
    (128, ["web/public/brand/icon_128.png"]),
    (64, ["web/public/brand/icon_64.png"]),
    (48, ["web/public/brand/icon_48.png"]),
    (32, [
        "web/public/brand/icon_32.png",
        "web/public/brand/favicon-32x32.png",
    ]),
    (16, ["web/public/brand/icon_16.png"]),
]

for size, targets in resized_targets:
    resized_im = im_full.resize((size, size), Image.Resampling.LANCZOS)
    for rel_path in targets:
        dest = os.path.join(ROOT, rel_path)
        os.makedirs(os.path.dirname(dest), exist_ok=True)
        resized_im.save(dest, format="PNG", optimize=True)
        print(f"Generated {size}x{size} icon -> {rel_path}")

# 3. Multi-resolution ICO favicons
ico_sizes = [(16, 16), (24, 24), (32, 32), (48, 48), (64, 64)]
ico_destinations = [
    "web/public/favicon.ico",
    "web/public/brand/favicon.ico",
]
for rel_path in ico_destinations:
    dest = os.path.join(ROOT, rel_path)
    im_full.save(dest, format="ICO", sizes=ico_sizes)
    print(f"Generated multi-size ICO -> {rel_path}")

# 4. Generate SVG embedding the official 512x512 logo
im_512 = im_full.resize((512, 512), Image.Resampling.LANCZOS)
import io
buf = io.BytesIO()
im_512.save(buf, format="PNG", optimize=True)
b64_png = base64.b64encode(buf.getvalue()).decode("utf-8")

svg_content = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <image href="data:image/png;base64,{b64_png}" width="512" height="512" />
</svg>
"""

svg_targets = [
    "web/public/favicon.svg",
    "web/public/logo.svg",
    "web/public/logo_1.svg",
    "web/public/logos/logo.svg",
    "web/public/logos/logo_1.svg",
    "web/public/logos/uniflow-emblem.svg",
    "web/public/logos/uniflow-emblem-white.svg",
    "web/public/logos/uniflow-wordmark.svg",
    "web/public/logos/uniflow-wordmark-white.svg",
    "desktop/assets/logos/logo.svg",
    "desktop/assets/logos/logo_1.svg",
    "desktop/assets/logos/uniflow-emblem.svg",
    "desktop/assets/logos/uniflow-emblem-white.svg",
    "mobile/assets/logos/logo.svg",
    "mobile/assets/logos/logo_1.svg",
    "mobile/assets/logos/uniflow-emblem.svg",
    "mobile/assets/logos/uniflow-emblem-white.svg",
]

for rel_path in svg_targets:
    dest = os.path.join(ROOT, rel_path)
    os.makedirs(os.path.dirname(dest), exist_ok=True)
    with open(dest, "w", encoding="utf-8") as f:
        f.write(svg_content)
    print(f"Generated embedded SVG -> {rel_path}")

print("Logo and branding synchronization complete!")
