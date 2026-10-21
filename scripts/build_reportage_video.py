#!/usr/bin/env python3
import os
import subprocess

BASE_DIR = "/root/uniflow"
IMG1 = f"{BASE_DIR}/web/public/illustrations/reportage_scene_1.jpg"
IMG2 = f"{BASE_DIR}/web/public/illustrations/reportage_scene_2.jpg"
IMG3 = f"{BASE_DIR}/web/public/illustrations/reportage_scene_4.jpg" # Lab IoT & Sentinelle
IMG4 = f"{BASE_DIR}/web/public/illustrations/reportage_scene_5.jpg" # Multiplateforme & Etudiants
IMG5 = f"{BASE_DIR}/web/public/illustrations/reportage_scene_3.jpg" # Coucher de soleil célébration

OUT_DIR = f"{BASE_DIR}/web/public/videos"
os.makedirs(OUT_DIR, exist_ok=True)

CLIP1 = f"{OUT_DIR}/reportage_clip_1.mp4"
CLIP2 = f"{OUT_DIR}/reportage_clip_2.mp4"
CLIP3 = f"{OUT_DIR}/reportage_clip_3.mp4"
CLIP4 = f"{OUT_DIR}/reportage_clip_4.mp4"
CLIP5 = f"{OUT_DIR}/reportage_clip_5.mp4"
FINAL_VIDEO = f"{OUT_DIR}/uniflow_presentation_reportage_complete.mp4"

FONT = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"

print("=== Phase 1 : Génération de la bande sonore académique et dynamique (30 secondes) ===")
AUDIO_PATH = f"{OUT_DIR}/audio_theme_30s.mp3"
# Synthèse d'un thème musical dynamique de 30 secondes avec harmoniques douces et montée en puissance
expr = (
    "0.16*sin(2*PI*220*t)*exp(-0.12*mod(t,2)) + "
    "0.11*sin(2*PI*330*t)*exp(-0.15*mod(t,2)) + "
    "0.09*sin(2*PI*440*t)*exp(-0.2*mod(t,1)) + "
    "0.06*sin(2*PI*554.37*t)*exp(-0.25*mod(t,1)) + "
    "0.07*sin(2*PI*659.25*t)*exp(-0.1*mod(t,4)) + "
    "0.04*sin(2*PI*880*t)*exp(-0.3*mod(t,0.5)) + "
    "0.02*sin(2*PI*1108.7*t)*exp(-0.4*mod(t,0.5))"
)
audio_cmd = [
    "ffmpeg", "-y", "-f", "lavfi",
    "-i", f"aevalsrc=exprs='{expr}':sample_rate=48000:duration=30",
    "-filter:a", "afade=t=in:ss=0:d=1,afade=t=out:st=28:d=2.0,volume=1.3",
    "-c:a", "libmp3lame", "-b:a", "192k",
    AUDIO_PATH
]
subprocess.run(audio_cmd, check=True)
print("✓ Audio 30s généré avec succès")

scenes = [
    {
        "clip": CLIP1,
        "img": IMG1,
        "zoom": "min(zoom+0.0006,1.08)",
        "x": "iw/2-(iw/zoom/2)",
        "y": "ih/2-(ih/zoom/2)",
        "badge": "EN DIRECT DU CAMPUS",
        "badge_color": "red",
        "topic": "EDITION SPECIALE · KERNEL FORGE",
        "bar_color": "0x0D9488",
        "title": "GRAND REPORTAGE : PRESENTATION OFFICIELLE UNIFLOW",
        "subtitle": "Mascottes Uni et Arclord en direct avec l equipe KERNEL FORGE",
        "title_color": "0xBAE6FD"
    },
    {
        "clip": CLIP2,
        "img": IMG2,
        "zoom": "1.08-0.0004*on",
        "x": "(iw-iw/zoom)*(1-on/180)",
        "y": "ih/2-(ih/zoom/2)",
        "badge": "EN DIRECT AMPHITHEATRE",
        "badge_color": "red",
        "topic": "DEMONSTRATION EN CONDITIONS REELLES",
        "bar_color": "0x2563EB",
        "title": "INNOVATIONS CLES : EMARGEMENT QR, VISIO HD ET BIBLIOTHEQUE VPS",
        "subtitle": "Les representants KERNEL FORGE et les etudiants en plein test grandeur nature",
        "title_color": "0xBAE6FD"
    },
    {
        "clip": CLIP3,
        "img": IMG3,
        "zoom": "min(zoom+0.0005,1.07)",
        "x": "iw/2-(iw/zoom/2)",
        "y": "ih/2-(ih/zoom/2)",
        "badge": "LABORATOIRE IOT & ROBOTIQUE",
        "badge_color": "0x0D9488",
        "topic": "SUPERVISION CAMPUS SENTINELLE & COPILOTE IA",
        "bar_color": "0x14B8A6",
        "title": "SENTINELLE IOT : SECURITE CAMPUS ET BORNES EDGE AI CONNECTEES",
        "subtitle": "Uni et Arclord presentent les bornes interactives intelligentes du campus",
        "title_color": "0x99F6E4"
    },
    {
        "clip": CLIP4,
        "img": IMG4,
        "zoom": "1.07-0.00035*on",
        "x": "(iw-iw/zoom)*(on/180)",
        "y": "ih/2-(ih/zoom/2)",
        "badge": "ADOPTION ETUDIANTE MASSIVE",
        "badge_color": "0x2563EB",
        "topic": "EXPERIENCE MULTI-PLATEFORME FLUIDE",
        "bar_color": "0x7C3AED",
        "title": "MOBILE, DESKTOP ET WEB : SYNCHRONISATION EN TEMPS REEL",
        "subtitle": "Emploi du temps LMD, messagerie UniMail et consultation instantanee hors-ligne",
        "title_color": "0xDDD6FE"
    },
    {
        "clip": CLIP5,
        "img": IMG5,
        "zoom": "min(zoom+0.0005,1.08)",
        "x": "iw/2-(iw/zoom/2)",
        "y": "ih*0.4-(ih*0.4/zoom)",
        "badge": "CONCLUSION DU REPORTAGE",
        "badge_color": "0x14B8A6",
        "topic": "VISION ET AMBITION DE KERNEL FORGE",
        "bar_color": "0xF59E0B",
        "title": "REUSSITE CONFIRMEE : LE NOUVEAU STANDARD UNIVERSITAIRE",
        "subtitle": "KERNEL FORGE x UniFlow · Propulse par nos mascottes et notre communaute",
        "title_color": "0xFDE68A"
    }
]

for idx, s in enumerate(scenes, 1):
    print(f"=== Rendu cinématographique du Clip {idx}/5 ===")
    vf = (
        "scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,"
        f"zoompan=z='{s['zoom']}':x='{s['x']}':y='{s['y']}':d=180:s=1920x1080:fps=30,"
        "drawbox=y=0:color=black@0.45:width=1920:height=70:t=fill,"
        f"drawtext=fontfile='{FONT}':text='{s['badge']}':fontcolor={s['badge_color']}:fontsize=24:x=60:y=24,"
        f"drawtext=fontfile='{FONT}':text='{s['topic']}':fontcolor=white:fontsize=22:x=460:y=25,"
        "drawbox=y=920:color=0x0B132B@0.85:width=1920:height=130:t=fill,"
        f"drawbox=y=920:color={s['bar_color']}:width=1920:height=6:t=fill,"
        f"drawtext=fontfile='{FONT}':text='{s['title']}':fontcolor={s['title_color']}:fontsize=28:x=60:y=940,"
        f"drawtext=fontfile='{FONT}':text='{s['subtitle']}':fontcolor=white:fontsize=22:x=60:y=985,"
        "fade=t=in:st=0:d=0.7,fade=t=out:st=5.3:d=0.7"
    )
    cmd = [
        "ffmpeg", "-y", "-loop", "1", "-i", s['img'],
        "-t", "6", "-vf", vf,
        "-c:v", "libx264", "-pix_fmt", "yuv420p", "-r", "30",
        s['clip']
    ]
    subprocess.run(cmd, check=True)
    print(f"✓ Clip {idx}/5 rendu")

print("=== Phase 6 : Fusion / Concaténation des 5 clips et mixage audio ===")
concat_list_file = f"{OUT_DIR}/concat_list_5s.txt"
with open(concat_list_file, "w") as f:
    for s in scenes:
        f.write(f"file '{s['clip']}'\n")

merge_cmd = [
    "ffmpeg", "-y",
    "-f", "concat", "-safe", "0", "-i", concat_list_file,
    "-i", AUDIO_PATH,
    "-c:v", "copy",
    "-c:a", "aac", "-b:a", "192k",
    "-shortest",
    FINAL_VIDEO
]
subprocess.run(merge_cmd, check=True)
print(f"✓ Montage final 30s réalisé avec succès : {FINAL_VIDEO}")

size_mb = os.path.getsize(FINAL_VIDEO) / (1024 * 1024)
print(f"Taille du montage final : {size_mb:.2f} Mo")
