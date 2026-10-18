import math
import os
from PIL import Image, ImageDraw, ImageFilter, ImageFont

MASCOT_DIR = "/root/uniflow/mobile/assets/mascot"
DESKTOP_DIR = "/root/uniflow/desktop/assets/mascot"
WEB_DIR = "/root/uniflow/web/public/mascot"
ICONS_DIR = "/root/uniflow/mobile/assets/icons/nav"

def create_fire_streak():
    """Generates uni_duo_streak_fire.png with an intense Duolingo streak flame aura."""
    canvas = Image.new("RGBA", (512, 512), (0, 0, 0, 0))
    
    # 1. Background radial warm glow
    glow = Image.new("RGBA", (512, 512), (0, 0, 0, 0))
    draw_glow = ImageDraw.Draw(glow)
    for r in range(180, 0, -10):
        alpha = int(45 * (1 - r / 180.0))
        draw_glow.ellipse(
            [256 - r, 256 - r + 30, 256 + r, 256 + r + 30],
            fill=(255, 110, 0, alpha)
        )
    glow = glow.filter(ImageFilter.GaussianBlur(25))
    canvas.alpha_composite(glow)

    # 2. Uni mascot (sorry / dramatic face)
    uni = Image.open(os.path.join(MASCOT_DIR, "uni_sorry.webp")).convert("RGBA")
    uni_ratio = uni.width / uni.height
    new_h = 390
    new_w = int(new_h * uni_ratio)
    uni_resized = uni.resize((new_w, new_h), Image.Resampling.LANCZOS)
    canvas.alpha_composite(uni_resized, ((512 - new_w) // 2 - 25, 512 - new_h - 20))

    # 3. Floating 3D Flame element on the right/center
    flame = Image.new("RGBA", (220, 260), (0, 0, 0, 0))
    fdraw = ImageDraw.Draw(flame)
    
    # Outer fire aura
    fdraw.polygon([(110, 10), (190, 100), (180, 210), (110, 250), (40, 210), (30, 100)], fill=(255, 69, 0, 230))
    # Mid flame
    fdraw.polygon([(110, 50), (170, 120), (160, 200), (110, 235), (60, 200), (50, 120)], fill=(255, 153, 0, 240))
    # Inner flame
    fdraw.polygon([(110, 95), (150, 150), (140, 190), (110, 220), (80, 190), (70, 150)], fill=(255, 235, 59, 255))
    # Core white hot
    fdraw.polygon([(110, 140), (130, 175), (110, 205), (90, 175)], fill=(255, 255, 255, 255))
    
    flame = flame.filter(ImageFilter.GaussianBlur(3))
    
    # Add fiery sparks around
    sparkle = Image.new("RGBA", (512, 512), (0, 0, 0, 0))
    sdraw = ImageDraw.Draw(sparkle)
    sparks = [(360, 200, 14), (410, 250, 10), (330, 150, 16), (390, 130, 12), (440, 310, 14), (280, 180, 8)]
    for x, y, size in sparks:
        sdraw.ellipse([x - size, y - size, x + size, y + size], fill=(255, 200, 50, 220))
        sdraw.ellipse([x - size//2, y - size//2, x + size//2, y + size//2], fill=(255, 255, 255, 255))
    
    # Composite flame on lower right
    canvas.alpha_composite(flame, (280, 220))
    canvas.alpha_composite(sparkle)
    
    # 4. Streak badge pill "STREAK 14j"
    badge = Image.new("RGBA", (190, 56), (0, 0, 0, 0))
    bdraw = ImageDraw.Draw(badge)
    bdraw.rounded_rectangle([0, 0, 190, 56], radius=28, fill=(234, 88, 12, 240), outline=(255, 237, 74, 255), width=3)
    bdraw.text((38, 14), "STREAK 🔥", fill=(255, 255, 255, 255))
    
    return canvas

def create_class_rush():
    """Generates uni_duo_class_rush.png with urgent running pose and 3D schedule/alarm clock."""
    canvas = Image.new("RGBA", (512, 512), (0, 0, 0, 0))
    
    # Speed lines
    slines = Image.new("RGBA", (512, 512), (0, 0, 0, 0))
    sdraw = ImageDraw.Draw(slines)
    for y in [180, 230, 290, 350, 410]:
        sdraw.line([(30, y), (140, y)], fill=(14, 165, 233, 160), width=6)
        sdraw.line([(50, y + 15), (110, y + 15)], fill=(14, 165, 233, 100), width=4)
    canvas.alpha_composite(slines)
    
    # Uni pointing / running
    uni = Image.open(os.path.join(MASCOT_DIR, "uni_pointing.webp")).convert("RGBA")
    uni_ratio = uni.width / uni.height
    new_h = 400
    new_w = int(new_h * uni_ratio)
    uni_resized = uni.resize((new_w, new_h), Image.Resampling.LANCZOS)
    canvas.alpha_composite(uni_resized, (30, 512 - new_h - 10))

    # Floating 3D schedule / clock icon
    sched = Image.open(os.path.join(ICONS_DIR, "schedule.png")).convert("RGBA")
    sched = sched.resize((190, 190), Image.Resampling.LANCZOS)
    
    # Halo under schedule
    halo = Image.new("RGBA", (512, 512), (0, 0, 0, 0))
    hdraw = ImageDraw.Draw(halo)
    hdraw.ellipse([310, 110, 490, 290], fill=(245, 158, 11, 70))
    halo = halo.filter(ImageFilter.GaussianBlur(18))
    canvas.alpha_composite(halo)
    
    canvas.alpha_composite(sched, (315, 115))

    # Urgent alarm ripples
    alarm = Image.new("RGBA", (512, 512), (0, 0, 0, 0))
    adraw = ImageDraw.Draw(alarm)
    adraw.arc([300, 90, 500, 290], start=-60, end=-10, fill=(239, 68, 68, 220), width=6)
    adraw.arc([290, 75, 515, 305], start=-60, end=-10, fill=(239, 68, 68, 140), width=5)
    canvas.alpha_composite(alarm)

    return canvas

def create_assignment_due():
    """Generates uni_duo_assignment.png with Uni thinking & 3D checklist/clipboard."""
    canvas = Image.new("RGBA", (512, 512), (0, 0, 0, 0))
    
    # Soft purple-indigo halo
    halo = Image.new("RGBA", (512, 512), (0, 0, 0, 0))
    hdraw = ImageDraw.Draw(halo)
    hdraw.ellipse([240, 150, 480, 390], fill=(124, 58, 237, 50))
    halo = halo.filter(ImageFilter.GaussianBlur(25))
    canvas.alpha_composite(halo)

    # Uni thinking
    uni = Image.open(os.path.join(MASCOT_DIR, "uni_thinking.webp")).convert("RGBA")
    uni_ratio = uni.width / uni.height
    new_h = 420
    new_w = int(new_h * uni_ratio)
    uni_resized = uni.resize((new_w, new_h), Image.Resampling.LANCZOS)
    canvas.alpha_composite(uni_resized, (40, 512 - new_h - 15))

    # 3D assignments icon
    assign = Image.open(os.path.join(ICONS_DIR, "assignments.png")).convert("RGBA")
    assign = assign.resize((210, 210), Image.Resampling.LANCZOS)
    canvas.alpha_composite(assign, (290, 150))

    # Glowing checkmarks burst
    burst = Image.new("RGBA", (512, 512), (0, 0, 0, 0))
    bdraw = ImageDraw.Draw(burst)
    checks = [(270, 140, 12), (480, 180, 10), (330, 100, 14), (470, 340, 12)]
    for cx, cy, sz in checks:
        bdraw.ellipse([cx - sz, cy - sz, cx + sz, cy + sz], fill=(16, 185, 129, 230))
        bdraw.line([(cx - sz//2, cy), (cx - 1, cy + sz//2), (cx + sz//2 + 1, cy - sz//2)], fill=(255, 255, 255, 255), width=3)
    canvas.alpha_composite(burst)

    return canvas

def create_qr_scan():
    """Generates uni_duo_qr_scan.png with Uni holding shield & 3D attendance QR scanner."""
    canvas = Image.new("RGBA", (512, 512), (0, 0, 0, 0))

    # Emerald scanner halo
    halo = Image.new("RGBA", (512, 512), (0, 0, 0, 0))
    hdraw = ImageDraw.Draw(halo)
    hdraw.ellipse([240, 140, 480, 380], fill=(16, 185, 129, 65))
    halo = halo.filter(ImageFilter.GaussianBlur(25))
    canvas.alpha_composite(halo)

    # Uni with shield
    uni = Image.open(os.path.join(MASCOT_DIR, "uni_shield.webp")).convert("RGBA")
    uni_ratio = uni.width / uni.height
    new_h = 410
    new_w = int(new_h * uni_ratio)
    uni_resized = uni.resize((new_w, new_h), Image.Resampling.LANCZOS)
    canvas.alpha_composite(uni_resized, (30, 512 - new_h - 15))

    # 3D Attendance icon
    att = Image.open(os.path.join(ICONS_DIR, "attendance.png")).convert("RGBA")
    att = att.resize((210, 210), Image.Resampling.LANCZOS)
    canvas.alpha_composite(att, (285, 150))

    # Laser scan line over QR
    laser = Image.new("RGBA", (512, 512), (0, 0, 0, 0))
    ldraw = ImageDraw.Draw(laser)
    ldraw.line([(290, 255), (485, 255)], fill=(52, 211, 153, 240), width=4)
    ldraw.line([(310, 255), (465, 255)], fill=(255, 255, 255, 255), width=2)
    canvas.alpha_composite(laser)

    return canvas

def create_night_rest():
    """Generates uni_duo_night_rest.png with Uni sleeping peacefully under the moon."""
    canvas = Image.new("RGBA", (512, 512), (0, 0, 0, 0))

    # Night twilight halo
    halo = Image.new("RGBA", (512, 512), (0, 0, 0, 0))
    hdraw = ImageDraw.Draw(halo)
    hdraw.ellipse([260, 60, 460, 260], fill=(14, 165, 233, 40))
    hdraw.ellipse([100, 180, 420, 500], fill=(59, 130, 246, 30))
    halo = halo.filter(ImageFilter.GaussianBlur(25))
    canvas.alpha_composite(halo)

    # Uni sleeping
    uni = Image.open(os.path.join(MASCOT_DIR, "uni_sleeping.webp")).convert("RGBA")
    uni_ratio = uni.width / uni.height
    new_h = 390
    new_w = int(new_h * uni_ratio)
    uni_resized = uni.resize((new_w, new_h), Image.Resampling.LANCZOS)
    canvas.alpha_composite(uni_resized, (40, 512 - new_h - 10))

    # Golden Crescent Moon
    moon = Image.new("RGBA", (140, 140), (0, 0, 0, 0))
    mdraw = ImageDraw.Draw(moon)
    mdraw.ellipse([0, 0, 130, 130], fill=(251, 191, 36, 255))
    mdraw.ellipse([35, -5, 145, 105], fill=(0, 0, 0, 0))
    canvas.alpha_composite(moon, (340, 80))

    # Night stars and Zzz
    stars = Image.new("RGBA", (512, 512), (0, 0, 0, 0))
    sdraw = ImageDraw.Draw(stars)
    star_pts = [(300, 100, 6), (460, 110, 8), (430, 220, 6), (330, 190, 7), (260, 170, 5)]
    for sx, sy, sr in star_pts:
        sdraw.line([(sx - sr, sy), (sx + sr, sy)], fill=(253, 224, 71, 230), width=2)
        sdraw.line([(sx, sy - sr), (sx, sy + sr)], fill=(253, 224, 71, 230), width=2)
        sdraw.ellipse([sx - 2, sy - 2, sx + 2, sy + 2], fill=(255, 255, 255, 255))
    canvas.alpha_composite(stars)

    return canvas

def create_celebrate_streak():
    """Generates uni_duo_celebrate_streak.png with Uni celebrating + 3D trophy & confetti."""
    canvas = Image.new("RGBA", (512, 512), (0, 0, 0, 0))

    # Golden celebration glow
    halo = Image.new("RGBA", (512, 512), (0, 0, 0, 0))
    hdraw = ImageDraw.Draw(halo)
    hdraw.ellipse([240, 130, 480, 370], fill=(245, 158, 11, 70))
    halo = halo.filter(ImageFilter.GaussianBlur(25))
    canvas.alpha_composite(halo)

    # Uni celebrating
    uni = Image.open(os.path.join(MASCOT_DIR, "uni_celebrate.webp")).convert("RGBA")
    uni_ratio = uni.width / uni.height
    new_h = 420
    new_w = int(new_h * uni_ratio)
    uni_resized = uni.resize((new_w, new_h), Image.Resampling.LANCZOS)
    canvas.alpha_composite(uni_resized, (25, 512 - new_h - 10))

    # 3D Golden trophy (gamification.png)
    trophy = Image.open(os.path.join(ICONS_DIR, "gamification.png")).convert("RGBA")
    trophy = trophy.resize((210, 210), Image.Resampling.LANCZOS)
    canvas.alpha_composite(trophy, (285, 140))

    # Confetti particles
    conf = Image.new("RGBA", (512, 512), (0, 0, 0, 0))
    cdraw = ImageDraw.Draw(conf)
    confettis = [
        (260, 90, 8, (239, 68, 68, 255)),
        (330, 70, 7, (59, 130, 246, 255)),
        (400, 85, 9, (16, 185, 129, 255)),
        (470, 110, 6, (245, 158, 11, 255)),
        (480, 200, 8, (168, 85, 247, 255)),
        (300, 140, 6, (236, 72, 153, 255)),
        (450, 310, 8, (14, 165, 233, 255)),
        (260, 230, 7, (250, 204, 21, 255)),
    ]
    for x, y, r, col in confettis:
        cdraw.rectangle([x - r, y - r//2, x + r, y + r//2], fill=col)
    canvas.alpha_composite(conf)

    return canvas

def main():
    generators = {
        "uni_duo_streak_fire.png": create_fire_streak,
        "uni_duo_class_rush.png": create_class_rush,
        "uni_duo_assignment.png": create_assignment_due,
        "uni_duo_qr_scan.png": create_qr_scan,
        "uni_duo_night_rest.png": create_night_rest,
        "uni_duo_celebrate_streak.png": create_celebrate_streak,
    }

    target_dirs = [MASCOT_DIR]
    if os.path.exists(DESKTOP_DIR):
        target_dirs.append(DESKTOP_DIR)
    if os.path.exists(WEB_DIR):
        target_dirs.append(WEB_DIR)
    else:
        # Create web mascot dir if not present
        os.makedirs(WEB_DIR, exist_ok=True)
        target_dirs.append(WEB_DIR)

    for filename, fn in generators.items():
        img = fn()
        for d in target_dirs:
            out_path = os.path.join(d, filename)
            img.save(out_path, format="PNG")
            print(f"Saved: {out_path} ({img.size})")

if __name__ == "__main__":
    main()
