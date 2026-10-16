# PROMPT DE GÉNÉRATION D'IMAGES — PLANCHES UI / UX WEB UNIFLOW (LOVAR)

Ce document contient les instructions et prompts ultra-détaillés destinés à **Lovar** (ou Midjourney v6 / Flux.1 / DALL-E 3 / Stable Diffusion XL) pour générer **3 planches graphiques complètes et magnifiques** présentant l'intégralité des interfaces de la plateforme web UniFlow.

---

## 🎨 Direction Artistique & Charte Visuelle Générale

- **Identité** : SaaS EdTech haut de gamme, moderne, épuré, d'envergure internationale.
- **Palette chromatique** :
  - **Bleu Profond Institutionnel** : `#1E3A8A` (Deep Navy) & `#2563EB` (Royal Blue)
  - **Teal / Émeraude Lumineux** : `#0D9488` & `#14B8A8` (Tech, Vitalité, Savoir)
  - **Ambre / Or Subtil** : `#F59E0B` (Éléments d'accent, badges, réussite)
  - **Fonds** : Blanc pur `#FFFFFF`, gris ardoise ultra-léger `#F8FAFC`, touches de verre dépoli (*glassmorphism*, `backdrop-blur`).
- **Logo** : Hibou stylisé géométrique moderne combiné avec une boucle d'infini technologique (*Owl + Infinite loop emblem*).
- **Mascottes & Présence** : Mascotte « Uni » (chouette tech intelligente) et « Archlord » (mentor tech).
- **Typographie** : Sans-serif géométrique premium (Inter / Plus Jakarta Sans style), hiérarchie limpide, chiffres gras et aérés.
- **Style de rendu** : Planche de présentation UI/UX Behance / Dribbble Award, vue isométrique 2.5D ou grille modulaire élégante à plat, légères ombres portées douces (`box-shadow: 0 20px 40px rgba(0,0,0,0.06)`), bordures fines (`border: 1px solid rgba(226,232,240,0.8)`).
- **Format** : Haute résolution panoramique 16:9 (`--ar 16:9` ou `--ar 21:9`), 8K, ultra-détaillé.

---

##  planche 1 : Portail Public, Découverte & Vitrine Technologique

### 📋 Interfaces Couvertes (100% sans omission) :
1. **Landing Page (`/` - `LandingPage.tsx`)** : Hero banner avec dégradé bleu/teal, proposition de valeur pour l'apprentissage autonome, aperçu des 3 profils, indicateurs clés en direct, CTA « Accéder à l'application ».
2. **Page À Propos (`/about` - `AboutPage.tsx`)** : Mission de KERNEL FORGE, souveraineté numérique africaine, architecture offline-first.
3. **Page Présentation & Démo (`/presentation`, `/demo`)** : Visite guidée interactive, visite vidéo et simulation de flux.
4. **Page Équipe KERNEL FORGE (`/teams` - `TeamsPage.tsx`)** : Grille des 10 membres avec switch interactif visible « Photos Réelles ⟷ Avatars Anime », badges de pôle (Frontend, Backend, Mobile, Desktop, Marketing).
5. **Page Sentinelle (`/sentinelle` - `SentinellePage.tsx`)** : Kiosque de santé motorisé omnidirectionnel avec LiDAR, scan médical sans contact, console de surveillance Vigie Edge AI en temps réel.
6. **Page Tarifs & Formules (`/pricing` - `PricingPage.tsx`)** : Grille tarifaire claire avec switch mensuel/annuel, cartes Étudiant libre, Délégué et Enseignant.
7. **Page Téléchargement (`/download` - `DownloadPage.tsx`)** : Liens directs APK Android, binaire Windows/macOS/Linux et PWA.
8. **Page Forum Public (`/forum` - `ForumPage.tsx`)** : Espaces d'entraide, questions/réponses académiques et sujets communautaires.
9. **Page Contact (`/contact` - `ContactPage.tsx`)** : Formulaire de contact direct et liens de communauté (WhatsApp, GitHub).
10. **Pages Juridiques (`/legal/:slug` - `LegalDocumentPage.tsx`)** : Conditions d'utilisation, politique de confidentialité RGPD/locale.
11. **Page 404 & Accès Refusé (`NotFoundPage.tsx`, `AccessDeniedPage.tsx`)** : Illustrations soignées avec la mascotte Uni.

### 📝 Prompt Lovar / Midjourney pour la Planche 1 :
```text
Behance award-winning UI/UX design showcase board, Sheet 1: "UniFlow Public & Discovery Portal". Modern EdTech web design, clean white and slate background with deep navy blue (#1E3A8A) and radiant teal (#0D9488) accents. High-resolution multi-screen composition featuring:
1. Ultra-clean Hero Landing Page with geometric owl emblem, bold typography "Apprenez librement, maîtrisez votre parcours", sleek CTA buttons, and interactive 3-persona tabs.
2. Teams Page showcasing 10 modern profile cards with an interactive toggle switch "Photos Réelles vs Avatars Anime", member badges, and vibrant status dots.
3. Sentinelle Edge AI page with futuristic dark mode dashboard, autonomous medical kiosk 3D render, LiDAR telemetry, and live health vital scan cards (SpO2, BPM).
4. Pricing & Plans comparison matrix with rounded cards and gold highlight badges.
5. Download portal with Android APK & Desktop app mockup screens.
6. Community Forum and Help Center cards.
Perspective display, subtle soft floating drop shadows, frosted glass cards (glassmorphism), ultra-detailed vector icons, pristine UI typography, crisp 8k render, trending on Dribbble, Figma prototype aesthetic --ar 16:9 --v 6.1 --q 2 --style raw
```

---

## 📱 Planche 2 : Cœur Apprenant & Espaces Connectés des 3 Rôles Autonomes

### 📋 Interfaces Couvertes (100% sans omission) :
1. **Shell Authentification (`/login`, `/register`, `/forgot-password`, `/reset-password`)** : Double panneau avec illustration inspirante, formulaire de connexion fluide, sélecteur des 3 profils indépendants à l'inscription.
2. **Dashboard Étudiant Libre (`/app` - `RoleDashboard.tsx` & `IndependentDashboardPage.tsx`)** : Salutation dynamique « Bonjour ! 👋 », 4 tuiles KPI (Matières, Devoirs, Moyenne pondérée /20, Séances du jour), planning de la semaine, graphique d'évolution des notes.
3. **Dashboard Délégué de Groupe (`/app`)** : Vue centrée sur l'animation du groupe, gestion des annonces, taux de présence global et créneaux planifiés.
4. **Dashboard Enseignant Indépendant (`/app`)** : Vue atelier avec cours animés, nombre d'apprenants, devoirs à corriger et moyenne de classe.
5. **Gestion de l'Emploi du Temps (`/app/emploi-du-temps` - `SchedulePage.tsx` & `IndependentSchedulePage.tsx`)** : Calendrier hebdomadaire interactif, création libre de créneaux sans contrainte universitaire.
6. **Gestion des Cours & Matières (`/app/cours`, `/app/cours/:id` - `CoursesPage.tsx`, `CourseDetailPage.tsx`, `IndependentCoursesPage.tsx`, `TeacherCoursesPage.tsx`)** : Fiches de cours enrichies, documents associés, syllabus et suivi de progression.
7. **Suivi des Devoirs & Tâches (`/app/devoirs` - `AssignmentsPage.tsx` & `IndependentAssignmentsPage.tsx`)** : Tableau Kanban / Liste des livrables (À faire, En cours, Terminé), alertes d'échéances colorées.
8. **Carnet de Notes & Résultats (`/app/notes` - `GradesPage.tsx` & `IndependentGradesPage.tsx`)** : Tableau des évaluations, calcul automatique de moyenne pondérée avec coefficients, appréciations et mentions.
9. **Gestion des Présences & Liste d'Appel (`/app/gestion-presences` - `AttendanceManagePage.tsx`, `AttendancePage.tsx`)** : Générateur de QR Code dynamique en direct, tableau d'émargement en un clic (Présent/Absent/Retard/Excusé), bouton « + Ajouter un participant libre », et boutons d'export immédiat PDF et Excel.
10. **Bibliothèque Numérique Z-Library (`/app/bibliotheque` - `LibraryPage.tsx`)** : Moteur de recherche académique filtré par domaine, grille de livres avec couvertures haute définition, badges de format PDF/EPUB, indicateur de cache bucket Appwrite, bouton de lecture directe et téléchargement.
11. **Espaces d'Étude & Rencontres (`/app/espaces-etude` - `ClassroomsPage.tsx`, `PromotionPage.tsx`)** : Salles de travail virtuelles, groupes d'échange.
12. **Messagerie & Entraide (`/app/messages` - `MessagingPage.tsx`)** : Fils de discussion en temps réel, bulles de messages claires.
13. **Gamification & Badges (`/app/badges` - `GamificationPage.tsx`)** : Badges débloqués (Assidu, Ponctuel, Major, Entraide), jauge de niveau et points d'apprentissage.

### 📝 Prompt Lovar / Midjourney pour la Planche 2 :
```text
Dribbble portfolio top-tier showcase board, Sheet 2: "UniFlow Connected Workspaces & Learning Core". Modular multi-panel layout showing comprehensive web application interfaces:
1. Role-Adaptive Personal Dashboard: Elegant dark blue hero banner with greeting "Bonjour !", 4 glowing metric KPI cards (Courses, Assignments, 16.4/20 GPA gauge, Schedule), and weekly timetable grid.
2. Full Attendance & Roll-Call Management interface: Interactive student roster table with status pills (Present in emerald, Absent in crimson, Late in amber), "+ Ajouter participant libre" quick form, dynamic QR code modal, and green "Exporter en Excel / PDF" action bar.
3. Digital Z-Library Academic Browser: Search bar with category chips (Informatique, Mathématiques, Sciences), rich book cards with high-res covers, PDF badges, and instant reading view drawer.
4. Clean Kanban board for student Assignments with priority color coding.
5. Gamification screen with shiny vector achievement badges and level XP bar.
6. Split authentication screen with modern illustration and 3-profile registration selector.
Polished software UI layout, soft shadows, pristine white and blue surface materials, highly organized grid presentation, ultra-crisp interface elements, 8k --ar 16:9 --v 6.1 --q 2 --style raw
```

---

## ⚙️ Planche 3 : Administration, Paramètres, Assistant IA & Système Global

### 📋 Interfaces Couvertes (100% sans omission) :
1. **Assistant Intelligent Uni IA (`UniAssistant.tsx`)** : Tiroir d'assistance conversationnelle propulsé par Groq Llama 3.3 70B, bulles de chat instantanées, suggestions de questions contextuelles, mode voix et réponses enrichies.
2. **Tableau de Bord Administrateur (`/admin` - `AdminDashboardPage.tsx`)** : Métriques globales de la plateforme (utilisateurs actifs, requêtes IA, stockage bucket, santé globale du système).
3. **Gestion des Utilisateurs Admin (`/admin/users` - `AdminUsersPage.tsx`)** : Liste des comptes, gestion des rôles et statuts d'accès.
4. **Administration des Paiements & Abonnements (`/admin/paiements` - `AdminPaymentsPage.tsx`, `/app/abonnement`, `/app/facturation`)** : Suivi des transactions, activation des formules, factures et exports financiers.
5. **Sécurité & Contrôle d'Accès (`/admin/securite` - `AdminSecurityPage.tsx`)** : Journaux de connexions, sessions actives, politique de mots de passe, conformité RGPD.
6. **Journal d'Activité Système (`/admin/activite` - `AdminActivityPage.tsx`)** : Flux d'événements en direct, horodatage et traçabilité.
7. **Rapports & Statistiques Avancées (`/admin/rapports`, `/admin/audience` - `AdminReportsPage.tsx`, `AdminAudiencePage.tsx`)** : Graphiques Recharts interactifs, courbes de fréquentation, taux de rétention.
8. **Annonces & Notifications Plateforme (`/admin/actualites`, `/app/notifications` - `AdminNewsAndNotificationsPage.tsx`, `NotificationsPage.tsx`)** : Centre de notifications push et gestion des annonces globales.
9. **Gestion de l'Équipe Admin (`/admin/equipe` - `AdminTeamPage.tsx`)** : Gestion des fiches membres, ordre d'affichage, synchronisation base Appwrite.
10. **Catalogue Global des Cours Admin (`/admin/cours` - `AdminCoursesPage.tsx`)** : Supervision des matières publiées.
11. **Paramètres & Profil Utilisateur (`/app/profil`, `/app/parametres`, `/admin/reglages` - `ProfilePage.tsx`, `SettingsPage.tsx`, `AdminSettingsPage.tsx`)** : Édition d'avatar, préférences de thème (Clair/Sombre), choix de langue (FR/EN), bascule « Mode hors-ligne », gestion des clés d'API.
12. **Bandeau de Connectivité & Toast Hors-Ligne (`GlobalNetworkToast.tsx`)** : Indicateur d'état en direct « En ligne » (vert) / « Mode hors-ligne » (ambre) avec compteur de requêtes en attente de synchronisation.

### 📝 Prompt Lovar / Midjourney pour la Planche 3 :
```text
State-of-the-art SaaS admin & design system presentation board, Sheet 3: "UniFlow Admin, AI Intelligence & System Architecture". Sophisticated enterprise UI showcase featuring:
1. Floating AI Assistant "Uni" chat panel overlay with glowing purple/teal avatar, lightning-fast response bubbles, code syntax highlighting, and voice waveform indicator.
2. Platform Admin Dashboard: Deep analytics with smooth spline area charts, audience retention curves, active accounts counter, and real-time server telemetry.
3. User & Access Control Management table with status chips, role badges, and action dropdowns.
4. Payments & Billing management screen with subscription tier cards and transaction invoices.
5. Live System Activity feed with color-coded event pills (Security, Sync, Auth).
6. User Profile & Settings interface displaying avatar upload, language toggle (FR/EN), and prominent "Offline-First Sync Status" toggle switch with green connected badge.
7. Global Network Toast alert showing automated background synchronization.
Ultra-high quality isometric layout, elegant dark & light mode juxtaposition, glassmorphism panels, pixel-perfect alignment, Dribbble trending design award aesthetic, 8k resolution --ar 16:9 --v 6.1 --q 2 --style raw
```

---

## 📌 Guide d'Utilisation Recommandé pour Lovar

1. **Génération par planche** : Utilisez chacun des 3 blocs de prompt indépendamment pour générer les 3 visuels en haute fidélité (`--ar 16:9`).
2. **Cohérence du style** : Si Lovar supporte les seeds ou images de référence, vous pouvez lui fournir le logo officiel `public/logos/uniflow-wordmark.png` et les couleurs HEX `#1E3A8A` et `#0D9488`.
3. **Export & Présentation** : Les 3 planches réunies constituent le portfolio de présentation complet de l'écosystème web UniFlow (Vitrine publique, Application connectée métier, Administration et IA).
