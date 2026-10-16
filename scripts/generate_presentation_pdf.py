#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
UniFlow — Générateur du Dossier & Support de Présentation Officiel (PDF)
Créé pour KERNEL FORGE / Université de Yaoundé I (UY1)
Format : Slides Paysage 16:9 Haute Définition (960 x 540 pt)
"""

import os
import sys
import qrcode
from PIL import Image

from reportlab.lib import colors
from reportlab.lib.colors import HexColor
from reportlab.lib.pagesizes import landscape
from reportlab.pdfgen import canvas
from reportlab.platypus import Paragraph
from reportlab.lib.styles import ParagraphStyle

# Palette officielle UniFlow
PRIMARY_NAVY = HexColor("#0F172A")       # Ardoise nuit très sombre
PRIMARY_BLUE = HexColor("#1E3A8A")       # Bleu royal profond
ELECTRIC_BLUE = HexColor("#2563EB")      # Bleu vif électrique
TEAL_ACCENT = HexColor("#0D9488")        # Vert émeraude / Teal
AMBER_ACCENT = HexColor("#F59E0B")       # Ambre / Or
CORAL_ACCENT = HexColor("#EA580C")       # Orange corail vif
PURPLE_ACCENT = HexColor("#6366F1")      # Indigo / Violet tech
BG_LIGHT = HexColor("#F8FAFC")           # Fond clair ultra propre
CARD_BG = HexColor("#FFFFFF")            # Blanc pur
BORDER_COLOR = HexColor("#E2E8F0")       # Bordure douce
TEXT_DARK = HexColor("#0F172A")          # Texte sombre principal
TEXT_MUTED = HexColor("#64748B")         # Texte gris secondaire
TEXT_LIGHT = HexColor("#F8FAFC")         # Texte blanc/ivoire

PAGE_WIDTH = 960
PAGE_HEIGHT = 540
TOTAL_SLIDES = 7

ROOT_DIR = "/root/uniflow"
TEMP_DIR = "/tmp/uniflow_pdf_assets"
OUTPUT_DOCS = os.path.join(ROOT_DIR, "docs/UniFlow_Presentation_Officielle_KERNEL_FORGE.pdf")
OUTPUT_WEB = os.path.join(ROOT_DIR, "web/public/docs/UniFlow_Presentation_Officielle.pdf")

os.makedirs(TEMP_DIR, exist_ok=True)
os.makedirs(os.path.dirname(OUTPUT_DOCS), exist_ok=True)
os.makedirs(os.path.dirname(OUTPUT_WEB), exist_ok=True)

# Générer les QR codes utiles
def generate_qr(url, filename, fill_color="black", back_color="white"):
    path = os.path.join(TEMP_DIR, filename)
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_M,
        box_size=10,
        border=1,
    )
    qr.add_data(url)
    qr.make(fit=True)
    img = qr.make_image(fill_color=fill_color, back_color=back_color)
    img.save(path)
    return path

QR_WEB = generate_qr("https://uniflow.kernelforge.codes", "qr_web.png", fill_color="#1E3A8A")
QR_YOUTUBE = generate_qr("https://www.youtube.com/watch?v=cIXm0cJJH18", "qr_yt.png", fill_color="#DC2626")

class SlideDeck:
    def __init__(self, filename):
        self.filename = filename
        self.c = canvas.Canvas(filename, pagesize=(PAGE_WIDTH, PAGE_HEIGHT))
        self.c.setTitle("UniFlow — Présentation Officielle KERNEL FORGE")
        self.c.setAuthor("KERNEL FORGE — Université de Yaoundé I")
        self.c.setSubject("Système d'Exploitation Académique & Campus Connecté Offline-First")
        self.c.setKeywords("UniFlow, KERNEL FORGE, UY1, Cameroun, EdTech, Offline-First, IoT, WebRTC")
        self.current_slide = 0

    def draw_top_nav(self, category="PRÉSENTATION OFFICIELLE"):
        self.current_slide += 1
        slide_idx = self.current_slide
        c = self.c

        # Fond général
        c.setFillColor(BG_LIGHT)
        c.rect(0, 0, PAGE_WIDTH, PAGE_HEIGHT, fill=1, stroke=0)

        # Barre supérieure sombre
        c.setFillColor(PRIMARY_NAVY)
        c.rect(0, PAGE_HEIGHT - 48, PAGE_WIDTH, 48, fill=1, stroke=0)

        # Ligne d'accentuation dynamique
        c.setFillColor(ELECTRIC_BLUE)
        progress_width = (PAGE_WIDTH * slide_idx) / TOTAL_SLIDES
        c.rect(0, PAGE_HEIGHT - 51, progress_width, 3, fill=1, stroke=0)

        # Logo / Titre Header
        c.setFillColor(HexColor("#38BDF8"))
        c.setFont("Helvetica-Bold", 14)
        c.drawString(32, PAGE_HEIGHT - 30, "UNIFLOW")
        c.setFillColor(TEXT_LIGHT)
        c.setFont("Helvetica", 11)
        c.drawString(108, PAGE_HEIGHT - 30, "•   Campus Connecté & Système Académique Résilient")

        # Catégorie & Slide Tracker
        c.setFillColor(HexColor("#94A3B8"))
        c.setFont("Helvetica-Bold", 9)
        c.drawRightString(PAGE_WIDTH - 100, PAGE_HEIGHT - 30, category.upper())

        c.setFillColor(HexColor("#38BDF8"))
        c.setFont("Helvetica-Bold", 10)
        c.drawRightString(PAGE_WIDTH - 32, PAGE_HEIGHT - 30, f"{slide_idx:02d} / {TOTAL_SLIDES:02d}")

        # Pied de page discret
        c.setFillColor(TEXT_MUTED)
        c.setFont("Helvetica", 8)
        c.drawString(32, 16, "UniFlow v2.4  |  Conçu & Développé par KERNEL FORGE  |  Licence Universitaire UY1")
        c.drawRightString(PAGE_WIDTH - 32, 16, "Plateforme en ligne : https://uniflow.kernelforge.codes")

        # Lien hypertexte pied de page
        c.linkURL("https://uniflow.kernelforge.codes", (PAGE_WIDTH - 320, 10, PAGE_WIDTH - 32, 25), relative=0)

    def draw_card(self, x, y, w, h, bg=CARD_BG, border=BORDER_COLOR, corner=12, shadow=True):
        c = self.c
        if shadow:
            c.setFillColor(HexColor("#CBD5E1"))
            c.roundRect(x + 2, y - 2, w, h, corner, fill=1, stroke=0)
        c.setFillColor(bg)
        c.setStrokeColor(border)
        c.setLineWidth(1)
        c.roundRect(x, y, w, h, corner, fill=1, stroke=1)

    def draw_badge(self, x, y, text, bg=HexColor("#DBEAFE"), fg=HexColor("#1E3A8A"), font_size=8, pad_x=8, pad_y=4):
        c = self.c
        c.setFont("Helvetica-Bold", font_size)
        text_w = c.stringWidth(text, "Helvetica-Bold", font_size)
        w = text_w + pad_x * 2
        h = font_size + pad_y * 2
        c.setFillColor(bg)
        c.roundRect(x, y, w, h, 6, fill=1, stroke=0)
        c.setFillColor(fg)
        c.drawString(x + pad_x, y + pad_y + 1, text)
        return w

    # =========================================================================
    # SLIDE 1 : COUVERTURE & VISION MAJEURE
    # =========================================================================
    def build_slide_1(self):
        c = self.c
        self.current_slide += 1
        slide_idx = self.current_slide

        # Fond dégradé subtil
        c.setFillColor(PRIMARY_NAVY)
        c.rect(0, 0, PAGE_WIDTH, PAGE_HEIGHT, fill=1, stroke=0)

        # Cercle d'ambiance lumineux en arrière-plan
        c.setFillColor(HexColor("#1E293B"))
        c.circle(PAGE_WIDTH - 120, PAGE_HEIGHT - 80, 220, fill=1, stroke=0)
        c.setFillColor(HexColor("#1E3A8A"))
        c.circle(PAGE_WIDTH - 140, PAGE_HEIGHT - 60, 150, fill=1, stroke=0)

        # Ligne de couleur top
        c.setFillColor(ELECTRIC_BLUE)
        c.rect(0, PAGE_HEIGHT - 6, PAGE_WIDTH, 6, fill=1, stroke=0)

        # Logo UniFlow
        logo_path = os.path.join(ROOT_DIR, "web/public/brand/uniflow_logo_final.png")
        if os.path.exists(logo_path):
            try:
                c.drawImage(logo_path, 48, PAGE_HEIGHT - 120, width=80, height=80, mask='auto', preserveAspectRatio=True)
            except Exception:
                pass

        # Surtitre / Badges
        c.setFillColor(TEAL_ACCENT)
        c.setFont("Helvetica-Bold", 12)
        c.drawString(145, PAGE_HEIGHT - 75, "INNOVATION ACADÉMIQUE & NUMÉRIQUE • UNIVERSITÉ DE YAOUNDÉ I")

        c.setFillColor(HexColor("#38BDF8"))
        c.setFont("Helvetica-Bold", 10)
        c.drawString(145, PAGE_HEIGHT - 95, "Dossier Exécutif & Pitch Deck Officiel — KERNEL FORGE")

        # Titre Principal Majestueux
        c.setFillColor(TEXT_LIGHT)
        c.setFont("Helvetica-Bold", 34)
        c.drawString(48, PAGE_HEIGHT - 175, "UniFlow : Le Campus Connecté")

        c.setFillColor(HexColor("#93C5FD"))
        c.setFont("Helvetica-Bold", 23)
        c.drawString(48, PAGE_HEIGHT - 212, "Offline-First & Système Académique Intégré")

        # Baseline explicative
        c.setFillColor(HexColor("#CBD5E1"))
        c.setFont("Helvetica", 13)
        c.drawString(48, PAGE_HEIGHT - 252, "La réponse technologique complète aux défis de l'enseignement supérieur en Afrique :")
        c.setFillColor(HexColor("#F8FAFC"))
        c.setFont("Helvetica-Bold", 13)
        c.drawString(48, PAGE_HEIGHT - 275, "Zéro coupure, émargement certifié QR SHA-256, visio P2P sans Internet & IA locale Flo.")

        # 3 Cartes piliers en bas à gauche
        card_w = 180
        cards_data = [
            ("100% OFFLINE-FIRST", "Fonctionne sans Internet permanent, synchro P2P automatique.", ELECTRIC_BLUE),
            ("ÉMARGEMENT T-OTP", "QR Code certifié SHA-256 résistant à la triche & aux captures.", TEAL_ACCENT),
            ("Z-LIBRARY & VISIO", "10M+ livres intégrés et visioconférence locale WebRTC zéro-install.", AMBER_ACCENT),
        ]
        start_x = 48
        for title, desc, col in cards_data:
            c.setFillColor(HexColor("#1E293B"))
            c.setStrokeColor(HexColor("#334155"))
            c.roundRect(start_x, 80, card_w, 115, 10, fill=1, stroke=1)

            # Barre couleur
            c.setFillColor(col)
            c.rect(start_x, 80 + 115 - 4, card_w, 4, fill=1, stroke=0)

            c.setFillColor(col)
            c.setFont("Helvetica-Bold", 9)
            c.drawString(start_x + 12, 80 + 90, title)

            c.setFillColor(HexColor("#E2E8F0"))
            c.setFont("Helvetica", 8)
            # découper le desc
            words = desc.split()
            line1 = " ".join(words[:4])
            line2 = " ".join(words[4:9])
            line3 = " ".join(words[9:])
            c.drawString(start_x + 12, 80 + 68, line1)
            c.drawString(start_x + 12, 80 + 52, line2)
            c.drawString(start_x + 12, 80 + 36, line3)

            start_x += card_w + 14

        # Cadre interactif à droite : QR Code & Accès Direct
        c.setFillColor(HexColor("#1E293B"))
        c.setStrokeColor(HexColor("#475569"))
        c.roundRect(PAGE_WIDTH - 280, 80, 232, 280, 14, fill=1, stroke=1)

        c.setFillColor(TEXT_LIGHT)
        c.setFont("Helvetica-Bold", 13)
        c.drawCentredString(PAGE_WIDTH - 164, 325, "TESTER LA PLATEFORME")

        c.setFillColor(HexColor("#38BDF8"))
        c.setFont("Helvetica", 9)
        c.drawCentredString(PAGE_WIDTH - 164, 310, "Scannez ou cliquez pour ouvrir")

        # QR Code image
        c.drawImage(QR_WEB, PAGE_WIDTH - 239, 150, width=150, height=150)
        c.linkURL("https://uniflow.kernelforge.codes", (PAGE_WIDTH - 239, 150, PAGE_WIDTH - 89, 300), relative=0)

        # URL cliquable
        c.setFillColor(HexColor("#38BDF8"))
        c.setFont("Helvetica-Bold", 10)
        c.drawCentredString(PAGE_WIDTH - 164, 128, "uniflow.kernelforge.codes")

        c.setFillColor(HexColor("#94A3B8"))
        c.setFont("Helvetica", 8)
        c.drawCentredString(PAGE_WIDTH - 164, 105, "Accessible sur Mobile, Tablette & PC")

        # Footer slide 1
        c.setFillColor(HexColor("#64748B"))
        c.setFont("Helvetica", 8)
        c.drawString(48, 30, "Document officiel KERNEL FORGE • Présentation académique UY1 • Tous droits réservés 2026")
        c.drawRightString(PAGE_WIDTH - 48, 30, "Octobre 2026 • Version 2.4")

        c.showPage()

    # =========================================================================
    # SLIDE 2 : LE CONSTAT TERRAIN & LA PROBLÉMATIQUE UNIVERSITAIRE
    # =========================================================================
    def build_slide_2(self):
        c = self.c
        self.draw_top_nav(category="CONTEXTE & ENJEUX CRITIQUES")

        # Titre de la slide
        c.setFillColor(TEXT_DARK)
        c.setFont("Helvetica-Bold", 22)
        c.drawString(32, PAGE_HEIGHT - 85, "Les Défis Critiques de l'Enseignement Supérieur en Afrique")

        c.setFillColor(TEXT_MUTED)
        c.setFont("Helvetica", 11)
        c.drawString(32, PAGE_HEIGHT - 105, "Retour d'expérience et analyse terrain menée à l'Université de Yaoundé I (UY1 Ngoa-Ekellé).")

        # Colonne de Gauche : 4 Problématiques Terrains
        issues = [
            ("Amphis Saturés & Émargement Primitif", 
             "Des promotions de 400 à 1 200 étudiants où la feuille papier circule pendant 1 heure, générant signatures frauduleuses, pertes de listes et contestations de notes de TD/TP."),
            ("Fracture Numérique & Coupures Réseau",
             "La connectivité Internet est instable et coûteuse pour les étudiants. Les plateformes Cloud traditionnelles deviennent inaccessibles dès que la connexion flanche."),
            ("Dispersion Anarchique des Informations",
             "Emplois du temps mouvants, annonces de salles et reports de cours diffusés par des canaux informels (WhatsApp non sécurisés) créant rumeurs et cours manqués."),
            ("Pénurie de Manuels & Ressources Scientifiques",
             "Bibliothèques universitaires saturées et budgets d'ouvrages limités pour les étudiants face à des ouvrages de référence inaccessibles.")
        ]

        card_y = PAGE_HEIGHT - 135
        card_h = 75
        for i, (title, text) in enumerate(issues):
            self.draw_card(32, card_y - card_h, 450, card_h, bg=CARD_BG, border=BORDER_COLOR)

            # Numéro pastille
            c.setFillColor(HexColor("#FEE2E2"))
            c.circle(54, card_y - 35, 14, fill=1, stroke=0)
            c.setFillColor(HexColor("#DC2626"))
            c.setFont("Helvetica-Bold", 10)
            c.drawCentredString(54, card_y - 38, f"0{i+1}")

            c.setFillColor(TEXT_DARK)
            c.setFont("Helvetica-Bold", 11)
            c.drawString(78, card_y - 25, title)

            c.setFillColor(TEXT_MUTED)
            c.setFont("Helvetica", 8.5)
            # Texte sur 2 lignes
            words = text.split()
            l1 = " ".join(words[:11])
            l2 = " ".join(words[11:22])
            l3 = " ".join(words[22:])
            c.drawString(78, card_y - 40, l1)
            c.drawString(78, card_y - 52, l2)
            if l3:
                c.drawString(78, card_y - 64, l3)

            card_y -= (card_h + 10)

        # Colonne de Droite : La Réponse Radicale d'UniFlow
        right_x = 505
        right_w = 423
        self.draw_card(right_x, 60, right_w, PAGE_HEIGHT - 195, bg=HexColor("#F0FDF4"), border=HexColor("#86EFAC"))

        # En-tête réponse
        c.setFillColor(HexColor("#166534"))
        c.setFont("Helvetica-Bold", 14)
        c.drawString(right_x + 20, PAGE_HEIGHT - 165, "La Réponse UniFlow : Zéro Compromis")

        c.setFillColor(HexColor("#15803D"))
        c.setFont("Helvetica", 10)
        c.drawString(right_x + 20, PAGE_HEIGHT - 182, "Une architecture pensée pour le terrain, résiliente et souveraine.")

        solutions = [
            ("Architecture 100% Offline-First", "Stockage local SQLite/IndexedDB. L'app fonctionne intégralement sans connexion Internet."),
            ("Émargement Électronique SHA-256", "QR Code dynamique renouvelé toutes les 15s. Signature cryptographique infalsifiable."),
            ("Visio-Conférence P2P Zéro-Install", "WebRTC direct sur le réseau local ou Wi-Fi du campus sans consommer de data externe."),
            ("Bibliothèque Mondiale Z-Library", "Moteur de recherche mondial intégré avec téléchargement direct de PDF scientifiques."),
            ("Sentinelle IoT & IA Edge", "Borne physique autonome pour la prise de constantes santé et l'assiduité en amphi.")
        ]

        sol_y = PAGE_HEIGHT - 208
        for title, desc in solutions:
            # Puce verte
            c.setFillColor(TEAL_ACCENT)
            c.circle(right_x + 28, sol_y - 2, 4.5, fill=1, stroke=0)

            c.setFillColor(TEXT_DARK)
            c.setFont("Helvetica-Bold", 9.5)
            c.drawString(right_x + 42, sol_y + 2, title)

            c.setFillColor(TEXT_MUTED)
            c.setFont("Helvetica", 7.8)
            words = desc.split()
            c.drawString(right_x + 42, sol_y - 11, " ".join(words[:9]))
            c.drawString(right_x + 42, sol_y - 21, " ".join(words[9:]))

            sol_y -= 41

        # Image d'illustration en médaillon
        campus_img = os.path.join(ROOT_DIR, "web/public/illustrations/about_campus_hero.png")
        if os.path.exists(campus_img):
            try:
                c.drawImage(campus_img, right_x + 24, 70, width=right_w - 48, height=72, preserveAspectRatio=True)
            except Exception:
                pass

        c.showPage()

    # =========================================================================
    # SLIDE 3 : LES 4 ESPACES DÉDIÉS AUX ACTEURS DU CAMPUS
    # =========================================================================
    def build_slide_3(self):
        c = self.c
        self.draw_top_nav(category="ÉCOSYSTÈME MULTI-RÔLES")

        c.setFillColor(TEXT_DARK)
        c.setFont("Helvetica-Bold", 22)
        c.drawString(32, PAGE_HEIGHT - 85, "Une Plateforme Unique, 4 Espaces Dédiés Sur-Mesure")

        c.setFillColor(TEXT_MUTED)
        c.setFont("Helvetica", 11)
        c.drawString(32, PAGE_HEIGHT - 105, "Chaque profil dispose d'un espace optimisé répondant avec précision à ses missions quotidiennes.")

        cards = [
            ("Espace Étudiant", "Apprentissage & Autonomie", PRIMARY_BLUE, [
                "Emploi du temps en direct & alertes de salles",
                "Calcul automatique des moyennes LMD & crédits",
                "Bibliothèque 10M+ livres Z-Library intégrée",
                "Assistance IA Flo disponible 24h/24 hors-ligne",
                "Scan instantané de présence en amphi"
            ]),
            ("Espace Enseignant", "Gestion de Classe & Pédagogie", TEAL_ACCENT, [
                "Création & projection de sessions d'émargement QR",
                "Saisie ultra-rapide des notes de TD/TP & examens",
                "Visioconférence locale WebRTC zéro installation",
                "Messagerie de cours officielle & partage de supports",
                "Statistiques d'assiduité par promotion"
            ]),
            ("Espace Délégué", "Coordination de Promotion", AMBER_ACCENT, [
                "Scan des étudiants n'ayant pas de smartphone",
                "Export immédiat des feuilles d'émargement PDF/Excel",
                "Transmission officielle des consignes & rattrapages",
                "Pointage manuel certifié par signature locale",
                "Synchronisation P2P avec le PC du professeur"
            ]),
            ("Espace Administration", "Supervision & Gouvernance", PURPLE_ACCENT, [
                "Tableau de bord institutionnel en temps réel",
                "Audit d'occupation des amphithéâtres & salles",
                "Contrôle d'accès RBAC & journalisation d'activités",
                "Gestion centralisée des maquettes de cours LMD",
                "Export des procès-verbaux pour le Décanat"
            ])
        ]

        card_w = 210
        gap = 14
        start_x = 32
        for title, subtitle, col, points in cards:
            self.draw_card(start_x, 60, card_w, PAGE_HEIGHT - 185, bg=CARD_BG, border=BORDER_COLOR)

            # En-tête couleur
            c.setFillColor(col)
            c.rect(start_x, PAGE_HEIGHT - 130, card_w, 5, fill=1, stroke=0)

            c.setFillColor(col)
            c.setFont("Helvetica-Bold", 13)
            c.drawString(start_x + 14, PAGE_HEIGHT - 150, title)

            c.setFillColor(TEXT_MUTED)
            c.setFont("Helvetica", 8)
            c.drawString(start_x + 14, PAGE_HEIGHT - 164, subtitle)

            # Ligne de séparation
            c.setStrokeColor(BORDER_COLOR)
            c.setLineWidth(1)
            c.line(start_x + 14, PAGE_HEIGHT - 172, start_x + card_w - 14, PAGE_HEIGHT - 172)

            # Liste de points clés
            pt_y = PAGE_HEIGHT - 195
            for pt in points:
                # Puce
                c.setFillColor(col)
                c.circle(start_x + 20, pt_y + 3, 3, fill=1, stroke=0)

                c.setFillColor(TEXT_DARK)
                c.setFont("Helvetica", 8)
                words = pt.split()
                c.drawString(start_x + 28, pt_y, " ".join(words[:4]))
                c.drawString(start_x + 28, pt_y - 11, " ".join(words[4:]))

                pt_y -= 32

            # Badge bas de carte
            c.setFillColor(HexColor("#F1F5F9"))
            c.roundRect(start_x + 14, 75, card_w - 28, 24, 6, fill=1, stroke=0)
            c.setFillColor(col)
            c.setFont("Helvetica-Bold", 8)
            c.drawCentredString(start_x + (card_w / 2), 83, "Interface Testée & Prête")

            start_x += card_w + gap

        c.showPage()

    # =========================================================================
    # SLIDE 4 : PILIERS TECHNOLOGIQUES & INNOVATIONS DE RUPTURE
    # =========================================================================
    def build_slide_4(self):
        c = self.c
        self.draw_top_nav(category="INGÉNIERIE & TECHNOLOGIES")

        c.setFillColor(TEXT_DARK)
        c.setFont("Helvetica-Bold", 22)
        c.drawString(32, PAGE_HEIGHT - 85, "Les 4 Piliers Technologiques d'UniFlow")

        c.setFillColor(TEXT_MUTED)
        c.setFont("Helvetica", 11)
        c.drawString(32, PAGE_HEIGHT - 105, "Une architecture robuste associant Offline-First, Cryptographie SHA-256, WebRTC et Edge AI.")

        pillars = [
            ("01", "Architecture Offline-First & Synchro P2P", ELECTRIC_BLUE,
             "Moteur SQLite local couplé à IndexedDB.",
             "Toutes les opérations d'émargement, de consultation d'emplois du temps et de cours s'effectuent sans aucune latence même sans Internet. Dès reconnexion ou croisement P2P en amphi, les registres se synchronisent sans conflit grâce à un algorithme CRDT éprouvé."),
            ("02", "Émargement SHA-256 à QR Dynamique (T-OTP)", TEAL_ACCENT,
             "Protocole de jeton tournant toutes les 15 secondes.",
             "Le QR Code projeté par l'enseignant intègre un horodatage chiffré et un sel cryptographique. Impossible de transférer une capture d'écran à distance. La validation hors-ligne certifie l'étudiant avec signature mathématique infalsifiable."),
            ("03", "Visioconférence Mesh WebRTC Zéro-Install", CORAL_ACCENT,
             "Communication vidéo P2P native dans le navigateur et l'app.",
             "Pas besoin de compte Zoom, Microsoft Teams ou de plugin lourd. Fonctionne directement sur le réseau Wi-Fi local ou intranet du campus universitaire avec une qualité ultra-fluide même lors de coupures des dorsales sous-marines nationales."),
            ("04", "Intelligence Artificielle Flo & Sentinelle IoT", PURPLE_ACCENT,
             "Groq Llama-3 70B & Station Matérielle Autonome.",
             "Flo assiste chaque étudiant dans ses révisions en respectant le programme camerounais. La borne connectée Sentinelle (ESP32/Edge AI) assure le diagnostic santé rapide (tension, oxygène) et surveille l'assiduité du campus.")
        ]

        top_y = PAGE_HEIGHT - 135
        card_w = 435
        card_h = 160

        positions = [
            (32, top_y - card_h),
            (492, top_y - card_h),
            (32, top_y - card_h * 2 - 20),
            (492, top_y - card_h * 2 - 20)
        ]

        for i, (num, title, col, subtitle, body) in enumerate(pillars):
            x, y = positions[i]
            self.draw_card(x, y, card_w, card_h, bg=CARD_BG, border=BORDER_COLOR)

            # Badge Numéro
            c.setFillColor(col)
            c.roundRect(x + 16, y + card_h - 38, 36, 24, 6, fill=1, stroke=0)
            c.setFillColor(TEXT_LIGHT)
            c.setFont("Helvetica-Bold", 11)
            c.drawCentredString(x + 34, y + card_h - 31, num)

            # Titre
            c.setFillColor(TEXT_DARK)
            c.setFont("Helvetica-Bold", 12)
            c.drawString(x + 60, y + card_h - 26, title)

            c.setFillColor(col)
            c.setFont("Helvetica-Bold", 9)
            c.drawString(x + 60, y + card_h - 40, subtitle)

            # Ligne de séparation
            c.setStrokeColor(BORDER_COLOR)
            c.setLineWidth(0.5)
            c.line(x + 16, y + card_h - 50, x + card_w - 16, y + card_h - 50)

            # Descriptif
            c.setFillColor(TEXT_MUTED)
            c.setFont("Helvetica", 8.5)
            words = body.split()
            c.drawString(x + 16, y + card_h - 70, " ".join(words[:11]))
            c.drawString(x + 16, y + card_h - 85, " ".join(words[11:22]))
            c.drawString(x + 16, y + card_h - 100, " ".join(words[22:33]))
            c.drawString(x + 16, y + card_h - 115, " ".join(words[33:]))

            # Barre couleur inférieure
            c.setFillColor(col)
            c.rect(x + 16, y + 10, card_w - 32, 2, fill=1, stroke=0)

        c.showPage()

    # =========================================================================
    # SLIDE 5 : VISIOMÉTIQUE, Z-LIBRARY & ACCÈS AU SAVOIR MONDIAL
    # =========================================================================
    def build_slide_5(self):
        c = self.c
        self.draw_top_nav(category="OUTILS INTÉGRÉS & SAVOIR")

        c.setFillColor(TEXT_DARK)
        c.setFont("Helvetica-Bold", 22)
        c.drawString(32, PAGE_HEIGHT - 85, "Accès Universel au Savoir & Collaboration Sans Barrières")

        c.setFillColor(TEXT_MUTED)
        c.setFont("Helvetica", 11)
        c.drawString(32, PAGE_HEIGHT - 105, "Z-Library intégrée, Visioconférence autonome et Tuteur Intelligent IA.")

        # Volet Gauche : Bibliothèque Numérique Z-Library
        left_w = 435
        self.draw_card(32, 60, left_w, PAGE_HEIGHT - 185, bg=CARD_BG, border=BORDER_COLOR)

        c.setFillColor(PRIMARY_BLUE)
        c.rect(32, PAGE_HEIGHT - 130, left_w, 4, fill=1, stroke=0)

        c.setFillColor(PRIMARY_BLUE)
        c.setFont("Helvetica-Bold", 14)
        c.drawString(52, PAGE_HEIGHT - 155, "Bibliothèque Mondiale Z-Library Intégrée")

        c.setFillColor(TEXT_MUTED)
        c.setFont("Helvetica", 9)
        c.drawString(52, PAGE_HEIGHT - 170, "Plus de 10 millions d'ouvrages et 84 millions d'articles scientifiques.")

        # Puces Z-Library
        z_points = [
            ("Recherche Multi-Critères", "Recherche par titre, auteur, ISBN, matière académique (Informatique, Mathématiques, Physique, Droit, Médecine)."),
            ("Filtre Linguistique Instantané", "Sélection par langue (Français, Anglais, etc.) avec autocomplétion intelligente des codes de langues."),
            ("Téléchargement Direct Réel", "Téléchargement immédiat de PDF/EPUB lisibles hors-ligne sur mobile et ordinateur."),
            ("Rayon Virtuel & Partage", "Constitution d'une bibliothèque personnelle pour les cours sans data supplémentaire.")
        ]
        z_y = PAGE_HEIGHT - 205
        for t, d in z_points:
            c.setFillColor(ELECTRIC_BLUE)
            c.circle(60, z_y + 3, 3, fill=1, stroke=0)
            c.setFillColor(TEXT_DARK)
            c.setFont("Helvetica-Bold", 9.5)
            c.drawString(72, z_y, t)

            c.setFillColor(TEXT_MUTED)
            c.setFont("Helvetica", 8)
            words = d.split()
            c.drawString(72, z_y - 12, " ".join(words[:10]))
            c.drawString(72, z_y - 23, " ".join(words[10:]))
            z_y -= 44

        # Volet Droite : Visioconférence Embarquée & Flo IA
        right_x = 492
        right_w = 435
        self.draw_card(right_x, 60, right_w, PAGE_HEIGHT - 185, bg=CARD_BG, border=BORDER_COLOR)

        c.setFillColor(TEAL_ACCENT)
        c.rect(right_x, PAGE_HEIGHT - 130, right_w, 4, fill=1, stroke=0)

        c.setFillColor(TEAL_ACCENT)
        c.setFont("Helvetica-Bold", 14)
        c.drawString(right_x + 20, PAGE_HEIGHT - 155, "Visioconférence & Assistant IA Flo")

        c.setFillColor(TEXT_MUTED)
        c.setFont("Helvetica", 9)
        c.drawString(right_x + 20, PAGE_HEIGHT - 170, "Zéro logiciel à installer, sécurisé et accéléré par Groq.")

        right_points = [
            ("Visio Sans Logiciel Externe", "L'étudiant clique et entre dans l'amphi virtuel. Partage d'écran, micro, caméra et chat intégrés avec zéro configuration."),
            ("Réseau Local & Résilience", "Capable de fonctionner sur le Wi-Fi local du campus même en cas d'isolement d'Internet."),
            ("Tuteur IA Académique Flo", "Propulsé par le modèle Llama-3 70B via l'API ultra-rapide Groq (500+ jetons/seconde)."),
            ("Aligné sur le Programme UY1", "Flo maîtrise les UE camerounaises, résout des algorithmes, synthétise des polycopiés et n'hallucine pas.")
        ]
        r_y = PAGE_HEIGHT - 205
        for t, d in right_points:
            c.setFillColor(TEAL_ACCENT)
            c.circle(right_x + 28, r_y + 3, 3, fill=1, stroke=0)
            c.setFillColor(TEXT_DARK)
            c.setFont("Helvetica-Bold", 9.5)
            c.drawString(right_x + 40, r_y, t)

            c.setFillColor(TEXT_MUTED)
            c.setFont("Helvetica", 8)
            words = d.split()
            c.drawString(right_x + 40, r_y - 12, " ".join(words[:10]))
            c.drawString(right_x + 40, r_y - 23, " ".join(words[10:]))
            r_y -= 44

        # Image équipe / démo en bas si dispo
        team_img = os.path.join(ROOT_DIR, "web/public/illustrations/team_avatars_landscape.jpg")
        if os.path.exists(team_img):
            try:
                c.drawImage(team_img, right_x + 20, 75, width=right_w - 40, height=80, preserveAspectRatio=True)
            except Exception:
                pass

        c.showPage()

    # =========================================================================
    # SLIDE 6 : MODÈLE ÉCONOMIQUE, TARIFS & INTÉGRATION LOCALE
    # =========================================================================
    def build_slide_6(self):
        c = self.c
        self.draw_top_nav(category="MODÈLE ÉCONOMIQUE & TARIFICATION")

        c.setFillColor(TEXT_DARK)
        c.setFont("Helvetica-Bold", 22)
        c.drawString(32, PAGE_HEIGHT - 85, "Modèle Économique : Accessibilité Radicale & Pérennité")

        c.setFillColor(TEXT_MUTED)
        c.setFont("Helvetica", 11)
        c.drawString(32, PAGE_HEIGHT - 105, "Une tarification pensée pour le pouvoir d'achat étudiant et les universités africaines.")

        plans = [
            ("UY1 Académique", "GRATUIT", "0 FCFA", PRIMARY_BLUE, [
                "100% Inclus pour étudiants UY1",
                "Emploi du temps & relevés LMD",
                "Émargement QR en amphi",
                "Bibliothèque de cours de base",
                "Messagerie de promotion"
            ]),
            ("Pass Personnel", "POPULAIRE", "100 FCFA / mois", TEAL_ACCENT, [
                "Synchronisation Cloud multi-appareils",
                "Tuteur IA Flo illimité (Groq 70B)",
                "Z-Library 10M+ livres en illimité",
                "Mode révision avec flashcards",
                "Sauvegarde cryptée des notes"
            ]),
            ("Enseignant Pro", "AVANCÉ", "500 FCFA / mois", AMBER_ACCENT, [
                "Générateur de sessions QR illimité",
                "Visioconférence HD prioritaire",
                "Exports certifiés PDF / Excel",
                "Statistiques d'assiduité globales",
                "Support WhatsApp dédié KERNEL"
            ]),
            ("Campus Institution", "SUR DEVIS", "Partenariat UY1", PURPLE_ACCENT, [
                "Déploiement sur serveurs locaux UY1",
                "Intégration SI / Décanat & Scolarité",
                "Borne connectée Sentinelle IoT",
                "Formation du corps professoral",
                "SLA & Support technique sur site"
            ])
        ]

        card_w = 210
        gap = 14
        start_x = 32
        for title, badge, price, col, perks in plans:
            self.draw_card(start_x, 60, card_w, PAGE_HEIGHT - 185, bg=CARD_BG, border=BORDER_COLOR)

            # Badge haut
            c.setFillColor(col)
            c.roundRect(start_x + 14, PAGE_HEIGHT - 148, 80, 18, 4, fill=1, stroke=0)
            c.setFillColor(TEXT_LIGHT)
            c.setFont("Helvetica-Bold", 8)
            c.drawCentredString(start_x + 54, PAGE_HEIGHT - 142, badge)

            c.setFillColor(TEXT_DARK)
            c.setFont("Helvetica-Bold", 13)
            c.drawString(start_x + 14, PAGE_HEIGHT - 172, title)

            c.setFillColor(col)
            c.setFont("Helvetica-Bold", 12)
            c.drawString(start_x + 14, PAGE_HEIGHT - 192, price)

            # Ligne de séparation
            c.setStrokeColor(BORDER_COLOR)
            c.setLineWidth(1)
            c.line(start_x + 14, PAGE_HEIGHT - 202, start_x + card_w - 14, PAGE_HEIGHT - 202)

            # Liste d'avantages
            p_y = PAGE_HEIGHT - 225
            for p in perks:
                c.setFillColor(col)
                c.circle(start_x + 20, p_y + 3, 3, fill=1, stroke=0)

                c.setFillColor(TEXT_DARK)
                c.setFont("Helvetica", 8)
                words = p.split()
                c.drawString(start_x + 28, p_y, " ".join(words[:4]))
                c.drawString(start_x + 28, p_y - 11, " ".join(words[4:]))

                p_y -= 32

            # Paiements acceptés
            c.setFillColor(HexColor("#F8FAFC"))
            c.roundRect(start_x + 10, 72, card_w - 20, 36, 6, fill=1, stroke=0)
            c.setFillColor(TEXT_MUTED)
            c.setFont("Helvetica", 7.5)
            c.drawCentredString(start_x + card_w / 2, 92, "Paiements pris en charge :")
            c.setFillColor(TEXT_DARK)
            c.setFont("Helvetica-Bold", 8)
            c.drawCentredString(start_x + card_w / 2, 79, "MTN MoMo • Orange Money • CB")

            start_x += card_w + gap

        c.showPage()

    # =========================================================================
    # SLIDE 7 : ÉQUIPE KERNEL FORGE, ROADMAP & CONTACTS OFFICIELS
    # =========================================================================
    def build_slide_7(self):
        c = self.c
        self.draw_top_nav(category="ÉQUIPE, ROADMAP & ENGAGEMENT")

        c.setFillColor(TEXT_DARK)
        c.setFont("Helvetica-Bold", 22)
        c.drawString(32, PAGE_HEIGHT - 85, "KERNEL FORGE : L'Ingénierie au Service de l'Excellence")

        c.setFillColor(TEXT_MUTED)
        c.setFont("Helvetica", 11)
        c.drawString(32, PAGE_HEIGHT - 105, "Une équipe passionnée résolue à transformer l'université camerounaise et africaine.")

        # Bloc Gauche : L'équipe & Les Fondateurs
        left_w = 435
        self.draw_card(32, 60, left_w, PAGE_HEIGHT - 185, bg=CARD_BG, border=BORDER_COLOR)

        c.setFillColor(PRIMARY_BLUE)
        c.rect(32, PAGE_HEIGHT - 130, left_w, 4, fill=1, stroke=0)

        c.setFillColor(PRIMARY_BLUE)
        c.setFont("Helvetica-Bold", 14)
        c.drawString(52, PAGE_HEIGHT - 155, "L'Équipe Fondatrice — KERNEL FORGE")

        c.setFillColor(TEXT_MUTED)
        c.setFont("Helvetica", 9)
        c.drawString(52, PAGE_HEIGHT - 170, "Étudiants-ingénieurs et chercheurs de l'Université de Yaoundé I.")

        team_info = [
            ("Vision & Architecture", "Conception conjointe par des ingénieurs camerounais immergés dans le quotidien des amphis."),
            ("Rigueur Cryptographique", "Protocoles de signature SHA-256 et architecture Offline-First garantissant l'intégrité absolue."),
            ("Engagement Souverain", "Code auditable, serveurs hébergeables sur le sol national, indépendance technologique totale."),
            ("Support Communautaire", "Assistance WhatsApp 24/7 et déploiement direct auprès des délégués et enseignants.")
        ]
        t_y = PAGE_HEIGHT - 200
        for ti, de in team_info:
            c.setFillColor(PRIMARY_BLUE)
            c.circle(60, t_y + 3, 3, fill=1, stroke=0)

            c.setFillColor(TEXT_DARK)
            c.setFont("Helvetica-Bold", 9.5)
            c.drawString(72, t_y, ti)

            c.setFillColor(TEXT_MUTED)
            c.setFont("Helvetica", 8)
            words = de.split()
            c.drawString(72, t_y - 12, " ".join(words[:10]))
            c.drawString(72, t_y - 23, " ".join(words[10:]))
            t_y -= 44

        # Bloc Droite : Roadmap & QR Codes Démo
        right_x = 492
        right_w = 435
        self.draw_card(right_x, 60, right_w, PAGE_HEIGHT - 185, bg=CARD_BG, border=BORDER_COLOR)

        c.setFillColor(TEAL_ACCENT)
        c.rect(right_x, PAGE_HEIGHT - 130, right_w, 4, fill=1, stroke=0)

        c.setFillColor(TEAL_ACCENT)
        c.setFont("Helvetica-Bold", 14)
        c.drawString(right_x + 20, PAGE_HEIGHT - 155, "Déploiement & Accès Officiels")

        # Roadmap rapide
        c.setFillColor(TEXT_DARK)
        c.setFont("Helvetica-Bold", 9)
        c.drawString(right_x + 20, PAGE_HEIGHT - 180, "FEUILLE DE ROUTE :")

        milestones = [
            "T4 2026 : Déploiement pilote Faculté des Sciences (UY1 Ngoa-Ekellé)",
            "T1 2027 : Extension École Nationale Supérieure Polytechnique (ENSPY)",
            "T2 2027 : Ouverture aux universités de Douala, Dschang et sous-région CEMAC"
        ]
        m_y = PAGE_HEIGHT - 198
        for m in milestones:
            c.setFillColor(TEAL_ACCENT)
            c.circle(right_x + 28, m_y + 3, 2.5, fill=1, stroke=0)
            c.setFillColor(TEXT_MUTED)
            c.setFont("Helvetica", 8)
            c.drawString(right_x + 36, m_y, m)
            m_y -= 16

        # Bandeau Contact & Support
        c.setFillColor(HexColor("#F0FDF4"))
        c.setStrokeColor(HexColor("#BBF7D0"))
        c.roundRect(right_x + 20, 205, right_w - 40, 36, 6, fill=1, stroke=1)

        c.setFillColor(HexColor("#166534"))
        c.setFont("Helvetica-Bold", 8)
        c.drawString(right_x + 30, 224, "CONTACT INSTITUTIONNEL & SUPPORT DIRECT :")

        c.setFillColor(HexColor("#15803D"))
        c.setFont("Helvetica", 7.5)
        c.drawString(right_x + 30, 212, "WhatsApp & Tél : +237 690 00 00 00   •   Email : contact@kernelforge.codes")

        # 2 QR Codes en bas : Web et YouTube
        qr_y = 75
        qr_size = 90

        # QR Web
        c.setFillColor(HexColor("#F1F5F9"))
        c.roundRect(right_x + 20, qr_y, 185, 120, 8, fill=1, stroke=0)
        c.drawImage(QR_WEB, right_x + 30, qr_y + 20, width=80, height=80)
        c.linkURL("https://uniflow.kernelforge.codes", (right_x + 30, qr_y + 20, right_x + 110, qr_y + 100), relative=0)

        c.setFillColor(PRIMARY_BLUE)
        c.setFont("Helvetica-Bold", 9)
        c.drawString(right_x + 118, qr_y + 80, "DÉMO WEB")
        c.setFillColor(TEXT_MUTED)
        c.setFont("Helvetica", 7.5)
        c.drawString(right_x + 118, qr_y + 65, "Scannez pour")
        c.drawString(right_x + 118, qr_y + 53, "tester en ligne")
        c.setFillColor(ELECTRIC_BLUE)
        c.setFont("Helvetica-Bold", 7.5)
        c.drawString(right_x + 118, qr_y + 35, "uniflow.kernelforge.codes")

        # QR Vidéo YouTube
        c.setFillColor(HexColor("#F1F5F9"))
        c.roundRect(right_x + 225, qr_y, 185, 120, 8, fill=1, stroke=0)
        c.drawImage(QR_YOUTUBE, right_x + 235, qr_y + 20, width=80, height=80)
        c.linkURL("https://www.youtube.com/watch?v=cIXm0cJJH18", (right_x + 235, qr_y + 20, right_x + 315, qr_y + 100), relative=0)

        c.setFillColor(HexColor("#DC2626"))
        c.setFont("Helvetica-Bold", 9)
        c.drawString(right_x + 322, qr_y + 80, "VIDÉO DÉMO")
        c.setFillColor(TEXT_MUTED)
        c.setFont("Helvetica", 7.5)
        c.drawString(right_x + 322, qr_y + 65, "Visionnez le")
        c.drawString(right_x + 322, qr_y + 53, "pitch YouTube")
        c.setFillColor(HexColor("#DC2626"))
        c.setFont("Helvetica-Bold", 7.5)
        c.drawString(right_x + 322, qr_y + 35, "Lien YouTube")

        c.showPage()

    def generate(self):
        print("Génération de la Slide 1 : Couverture & Vision...")
        self.build_slide_1()
        print("Génération de la Slide 2 : Problématique Universitaire...")
        self.build_slide_2()
        print("Génération de la Slide 3 : Les 4 Espaces Dédiés...")
        self.build_slide_3()
        print("Génération de la Slide 4 : Piliers Technologiques...")
        self.build_slide_4()
        print("Génération de la Slide 5 : Visio & Z-Library...")
        self.build_slide_5()
        print("Génération de la Slide 6 : Modèle Économique & Tarifs...")
        self.build_slide_6()
        print("Génération de la Slide 7 : Équipe & Roadmap...")
        self.build_slide_7()
        self.c.save()
        print(f"PDF généré avec succès : {self.filename}")

if __name__ == "__main__":
    deck = SlideDeck(OUTPUT_DOCS)
    deck.generate()

    # Copier également vers le dossier web/public/docs pour téléchargement direct
    import shutil
    shutil.copy2(OUTPUT_DOCS, OUTPUT_WEB)
    print(f"PDF copié vers le serveur Web : {OUTPUT_WEB}")
