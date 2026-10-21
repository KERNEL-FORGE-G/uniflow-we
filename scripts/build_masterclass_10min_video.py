#!/usr/bin/env python3
"""
Générateur de la Masterclass Vidéo de Présentation UniFlow (10 minutes 15 secondes).
10 Chapitres ultra-complets couvrant tous les aspects d'UniFlow avec :
- Synthèse d'une bande-son musicale riche (615 secondes) avec nappe harmonique et pulsation dynamique.
- Transitions, panoramique Ken Burns et habillage TV broadcast professionnel.
- Bannières chapitrées, sous-titres descriptifs et barre de progression dynamique.
- Format 1080p cinématographique 16:9 H.264 / AAC stéréo.
"""

import os
import sys
import math
import struct
import wave
import subprocess

OUT_DIR = "/root/uniflow/web/public/videos"
os.makedirs(OUT_DIR, exist_ok=True)
WAV_FILE = os.path.join(OUT_DIR, "masterclass_audio_theme.wav")
FINAL_MP4 = os.path.join(OUT_DIR, "uniflow_masterclass_10min.mp4")

SAMPLE_RATE = 44100
TOTAL_DURATION = 615.0 # 10m 15s
CHAPTER_DURATION = 61.5 # 10 chapitres de 61.5s

CHAPTERS = [
    {
        "num": 1,
        "title": "CHAPITRE 1 : VISION, ENJEUX & MISSION KERNEL FORGE",
        "sub": "Mascottes Uni & Arclord · Modernisation du Campus Africain",
        "desc": "UniFlow repense la gouvernance universitaire : architecture sobre, offline-first et haute disponibilit\\xC3\\xA9.",
        "image": "/root/uniflow/web/public/illustrations/reportage_scene_1.jpg",
    },
    {
        "num": 2,
        "title": "CHAPITRE 2 : EMPLOI DU TEMPS LMD & S\\xC3\\x89ANCES EN TEMPS R\\xC3\\x89EL",
        "sub": "Fili\\xC3\\xA8res ICT4D & SIGL · Notifications & Gestion des Salles",
        "desc": "Synchronisation instantan\\xC3\\xA9e des plannings, salles d'amphi et alertes de report sans confusion.",
        "image": "/root/uniflow/web/public/illustrations/schedule_calendar_hero_3d.png",
    },
    {
        "num": 3,
        "title": "CHAPITRE 3 : \\xC3\\x89MARGEMENT QR CRYPTOGRAPHIQUE & PR\\xC3\\x89SENCES",
        "sub": "R\\xC3\\xB4les Enseignant & D\\xC3\\xA9l\\xC3\\xA9gu\\xC3\\xA9 · R\\xC3\\xA9silience 100% Hors-Ligne",
        "desc": "QR code dynamique rotatif \\xC3\\xA0 signature ECDSA horodat\\xC3\\xA9e emp\\xC3\\xAAchant toute falsification.",
        "image": "/root/uniflow/web/public/illustrations/reportage_scene_2.jpg",
    },
    {
        "num": 4,
        "title": "CHAPITRE 4 : GESTION DES DEVOIRS, NOTES & RELEV\\xC3\\x89S DE CR\\xC3\\x89DITS",
        "sub": "D\\xC3\\xA9p\\xC3\\xB4t Num\\xC3\\xA9rique · Formules LMD · Bar\\xC3\\xA8mes Pond\\xC3\\xA9r\\xC3\\xA9s",
        "desc": "Calcul automatique des moyennes semestrielles, relev\\xC3\\xA9s ECTS t\\xC3\\xA9l\\xC3\\xA9chargeables et feedback instantan\\xC3\\xA9.",
        "image": "/root/uniflow/web/public/illustrations/course_study_hero_3d.jpg",
    },
    {
        "num": 5,
        "title": "CHAPITRE 5 : Z-LIBRARY INT\\xC3\\x89GR\\xC3\\x89E & BIBLIOTH\\xC3\\x88QUE ACAD\\xC3\\x89MIQUE",
        "sub": "Recherche Rapide · Polycopi\\xC3\\xA9s & Manuels en T\\xC3\\xA9l\\xC3\\xA9chargement Direct",
        "desc": "Acc\\xC3\\xA8s r\\xC3\\xA9silient \\xC3\\xA0 des millions d'ouvrages acad\\xC3\\xA9miques, streaming PDF int\\xC3\\xA9gral et mise en cache locale.",
        "image": "/root/uniflow/web/public/illustrations/library.jpg",
    },
    {
        "num": 6,
        "title": "CHAPITRE 6 : VISIOCONF\\xC3\\x89RENCE HD LOCALE & SALONS DE CLASSE",
        "sub": "Diffusion Peer-to-Peer S\\xC3\\xA9curis\\xC3\\xA9e · Sans Plugin Requis",
        "desc": "Visio interactive WebRTC int\\xC3\\xA9gr\\xC3\\xA9e, partage d'\\xC3\\xA9cran et chat en direct optimis\\xC3\\xA9s pour r\\xC3\\xA9seau campus.",
        "image": "/root/uniflow/web/public/illustrations/community.jpg",
    },
    {
        "num": 7,
        "title": "CHAPITRE 7 : MESSAGERIE OFFICIELLE UNIMAIL @UNIFLOW.CM",
        "sub": "Signature \\xC3\\x89lectronique · Bo\\xC3\\xAEte S\\xC3\\xA9curis\\xC3\\xA9e & Anti-Spam Campus",
        "desc": "Identit\\xC3\\xA9 acad\\xC3\\xA9mique d\\xC3\\xA9di\\xC3\\xA9e, synchronisation IMAP/SMTP et cryptage bout-en-bout.",
        "image": "/root/uniflow/web/public/illustrations/uni_copilot_3d.jpg",
    },
    {
        "num": 8,
        "title": "CHAPITRE 8 : BORNE SENTINELLE IOT & CAPTEURS EDGE AI",
        "sub": "T\\xC3\\xA9l\\xC3\\xA9m\\xC3\\xA9trie Campus · Contr\\xC3\\xB4le Biom\\xC3\\xA9trique & S\\xC3\\xA9curit\\xC3\\xA9",
        "desc": "Hardware autonome con\\xC3\\xA7u par KERNEL FORGE avec cam\\xC3\\xA9ras Edge AI, analyse d'affluence et pr\\xC3\\xA9-diagnostic sant\\xC3\\xA9.",
        "image": "/root/uniflow/web/public/illustrations/reportage_scene_4.jpg",
    },
    {
        "num": 9,
        "title": "CHAPITRE 9 : \\xC3\\x89COSYST\\xC3\\x88ME MULTIPLATEFORME : WEB, DESKTOP & MOBILE",
        "sub": "Widgets Dynamiques Duolingo · Synchronisation Universelle",
        "desc": "Exp\\xC3\\xA9rience unifi\\xC3\\xA9e : PWA Web, Desktop fluide et Mobile Flutter avec widgets 3D d'assiduit\\xC3\\xA9.",
        "image": "/root/uniflow/web/public/illustrations/reportage_scene_5.jpg",
    },
    {
        "num": 10,
        "title": "CHAPITRE 10 : ADMINISTRATION CENTRALE, AUDIT & PERSPECTIVES",
        "sub": "Pilotage Strat\\xC3\\xA9gique · Solution D\\xC3\\xA9velopp\\xC3\\xA9e par KERNEL FORGE",
        "desc": "Tableau de bord de direction, contr\\xC3\\xB4le des effectifs, logs de s\\xC3\\xA9curit\\xC3\\xA9 et vision pour l'universit\\xC3\\xA9 de demain.",
        "image": "/root/uniflow/web/public/illustrations/reportage_scene_3.jpg",
    },
]

def generate_soundtrack():
    print(f"[*] Synthèse de la bande-son ({TOTAL_DURATION}s)...")
    total_samples = int(TOTAL_DURATION * SAMPLE_RATE)

    # Chords (Dm -> Bb -> F -> C)
    chord_freqs = [
        [146.83, 174.61, 220.00, 261.63], # Dm7
        [116.54, 146.83, 174.61, 233.08], # Bbmaj7
        [174.61, 220.00, 261.63, 349.23], # Fmaj7
        [130.81, 164.81, 196.00, 246.94], # Cmaj
    ]
    arp_notes = [220.0, 261.63, 293.66, 329.63, 349.23, 392.0, 440.0, 523.25]

    bpm = 110.0
    beat_sec = 60.0 / bpm
    bar_sec = beat_sec * 4.0 # ~2.18s

    with wave.open(WAV_FILE, "wb") as wf:
        wf.setnchannels(2)
        wf.setsampwidth(2)
        wf.setframerate(SAMPLE_RATE)

        chunk_size = 44100 * 5 # 5s chunks
        samples_done = 0

        while samples_done < total_samples:
            n_samples = min(chunk_size, total_samples - samples_done)
            raw = bytearray()

            for i in range(n_samples):
                t = (samples_done + i) / SAMPLE_RATE

                # Chord selection
                chord_idx = int(t / bar_sec) % len(chord_freqs)
                chord = chord_freqs[chord_idx]

                # Warm Pad
                pad_val = 0.0
                for f in chord:
                    pad_val += 0.08 * math.sin(2.0 * math.pi * f * t)
                    pad_val += 0.03 * math.sin(4.0 * math.pi * f * t)

                # Arpeggio
                arp_step = int(t / (beat_sec / 2.0))
                arp_f = arp_notes[arp_step % len(arp_notes)]
                arp_phase = (t % (beat_sec / 2.0)) / (beat_sec / 2.0)
                arp_env = math.exp(-3.5 * arp_phase)
                arp_val = 0.09 * math.sin(2.0 * math.pi * arp_f * t) * arp_env

                # Soft Kick & Hat pulse
                beat_phase = (t % beat_sec) / beat_sec
                # Kick on beat 0 and 2
                beat_num = int(t / beat_sec) % 4
                kick = 0.0
                if beat_num in (0, 2):
                    kick_env = math.exp(-12.0 * beat_phase)
                    kick = 0.16 * math.sin(2.0 * math.pi * (65.0 - 30.0 * beat_phase) * t) * kick_env

                # Soft hi-hat on half-beats
                hat_phase = (t % (beat_sec / 2.0)) / (beat_sec / 2.0)
                hat = 0.02 * math.sin(2.0 * math.pi * 3200.0 * t) * math.exp(-25.0 * hat_phase)

                # Master Fade-in and Fade-out
                vol = 1.0
                if t < 3.0:
                    vol = t / 3.0
                elif t > TOTAL_DURATION - 4.0:
                    vol = max(0.0, (TOTAL_DURATION - t) / 4.0)

                sample_l = int((pad_val + arp_val * 0.9 + kick + hat * 0.7) * vol * 24000.0)
                sample_r = int((pad_val + arp_val * 1.1 + kick + hat * 0.9) * vol * 24000.0)

                sample_l = max(-32767, min(32767, sample_l))
                sample_r = max(-32767, min(32767, sample_r))

                raw.extend(struct.pack("<hh", sample_l, sample_r))

            wf.writeframes(raw)
            samples_done += n_samples

    print(f"[✓] Audio généré : {WAV_FILE}")

def render_chapters():
    clip_files = []
    print(f"[*] Rendu des 10 chapitres vidéo ({CHAPTER_DURATION}s chacun)...")

    for ch in CHAPTERS:
        clip_path = os.path.join(OUT_DIR, f"masterclass_ch_{ch['num']:02d}.mp4")
        clip_files.append(clip_path)

        # Pan & Zoom Ken Burns parameters
        if ch['num'] % 2 == 1:
            zoom_expr = "zoom+0.00015"
            x_expr = "iw/2-(iw/zoom/2)"
            y_expr = "ih/2-(ih/zoom/2)"
        else:
            zoom_expr = "if(eq(on,1),1.18,zoom-0.00015)"
            x_expr = "iw/2-(iw/zoom/2)"
            y_expr = "ih/2-(ih/zoom/2)"

        # Text strings cleaned for drawtext
        title_txt = ch['title'].replace(":", "\\:").replace("'", " ")
        sub_txt = ch['sub'].replace(":", "\\:").replace("'", " ")
        desc_txt = ch['desc'].replace(":", "\\:").replace("'", " ")

        # Progress width calculation
        start_pct = ((ch['num'] - 1) / 10.0)
        end_pct = (ch['num'] / 10.0)

        vf = (
            f"scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,"
            f"zoompan=z='{zoom_expr}':d={int(CHAPTER_DURATION * 30)}:x='{x_expr}':y='{y_expr}':s=1920x1080:fps=30,"
            # Top Banner
            f"drawbox=x=0:y=0:w=1920:h=90:color=black@0.75:t=fill,"
            f"drawbox=x=0:y=86:w=1920:h=4:color=#0D9488@0.9:t=fill,"
            f"drawtext=text='UNIFLOW \\xc2\\xb7 MASTERCLASS VID\\xc3\\x89O OFFICIELLE (10 MIN) \\xc2\\xb7 KERNEL FORGE':"
            f"fontcolor=white:fontsize=28:x=45:y=30,"
            f"drawtext=text='ACTE {ch['num']:02d}/10':"
            f"fontcolor=#38BDF8:fontsize=26:x=1740:y=31,"
            # Lower-Third Box
            f"drawbox=x=60:y=840:w=1800:h=180:color=#0B132B@0.88:t=fill,"
            f"drawbox=x=60:y=840:w=10:h=180:color=#38BDF8@1.0:t=fill,"
            f"drawtext=text='{title_txt}':fontcolor=white:fontsize=34:x=95:y=860,"
            f"drawtext=text='{sub_txt}':fontcolor=#38BDF8:fontsize=24:x=95:y=910,"
            f"drawtext=text='{desc_txt}':fontcolor=#CBD5E1:fontsize=22:x=95:y=955,"
            # Progress Bar Track & Fill
            f"drawbox=x=0:y=1068:w=1920:h=12:color=black@0.8:t=fill,"
            f"drawbox=x=0:y=1068:w='1920*({start_pct}+({end_pct}-{start_pct})*t/{CHAPTER_DURATION})':h=12:color=#10B981@0.95:t=fill"
        )

        cmd = [
            "ffmpeg", "-y",
            "-loop", "1", "-i", ch["image"],
            "-t", str(CHAPTER_DURATION),
            "-vf", vf,
            "-c:v", "libx264", "-preset", "veryfast", "-crf", "22",
            "-pix_fmt", "yuv420p",
            clip_path
        ]
        print(f"[*] Rendu Chapitre {ch['num']}/10...")
        res = subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.PIPE, text=True)
        if res.returncode != 0:
            print(f"[!] Erreur chapitre {ch['num']}:\n{res.stderr[-500:]}")
            sys.exit(1)

    print("[✓] Tous les 10 chapitres ont été rendus avec succès !")
    return clip_files

def assemble_masterclass(clips):
    print("[*] Concaténation et mixage final de la vidéo complète de 10 minutes...")
    concat_list = os.path.join(OUT_DIR, "concat_masterclass.txt")
    with open(concat_list, "w") as f:
        for c in clips:
            f.write(f"file '{c}'\n")

    cmd = [
        "ffmpeg", "-y",
        "-f", "concat", "-safe", "0", "-i", concat_list,
        "-i", WAV_FILE,
        "-c:v", "copy",
        "-c:a", "aac", "-b:a", "192k",
        "-shortest",
        "-movflags", "+faststart",
        FINAL_MP4
    ]
    res = subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.PIPE, text=True)
    if res.returncode != 0:
        print(f"[!] Erreur assemblage:\n{res.stderr[-500:]}")
        sys.exit(1)

    size_mb = os.path.getsize(FINAL_MP4) / (1024 * 1024)
    print(f"[✓] MASTERCLASS 10 MIN RENDUE : {FINAL_MP4} ({size_mb:.2f} MB)")

if __name__ == "__main__":
    generate_soundtrack()
    clips = render_chapters()
    assemble_masterclass(clips)
