# UniFlow — Plateforme Académique & Apprentissage Autonome

> **Collectif KERNEL FORGE** (`https://kernelforge.codes`)  
> **Serveur Appwrite Production (v2.3.0)** : `https://vps.kernelforge.codes/v1` (Projet : `uniflow`)

---

## 1. État Actuel du Projet (Octobre 2026)

Le dépôt principal a été réorganisé et structuré à la racine pour centraliser l'ensemble des ressources, du branding, de l'équipe, de la configuration backend et des nouvelles interfaces :

### Arborescence de la Racine

- **`documents_et_illustrations/`** :
  - `documents/` : Cahier des charges (`UniFlow_Cahier_des_Charges_v2_Cameroun-3.docx`), Pitch Decks (`UniFlow_Pitch_Deck_EN_v3.pdf`, script), dossier FrancoTech 2026, spécifications UI/Gamification (`DESIGN-SPEC-GAMIFICATION-UI.md`), prompts Lovar (`PROMPT_LOVAR_PLANCHES_WEB.md`) et journaux historiques (`ETAT-DU-PROJET.md`, `TRAVAUX-RESTANTS.md`).
  - `logos_et_marques/` : Logo officiel final d'UniFlow (`uniflow_logo_final.png`, `uniflow_logo_horizontal.png`, icônes multi-résolutions).
  - `mascottes_uni_archlord/` : Les 22 poses WebP d'Uni et d'Archlord + nouveaux rendus 3D.
  - `badges_gamification/` : Les 6 badges d'honneur officiels.
  - `illustrations_systeme/` : Illustrations d'onboarding, Sentinelle (LiDAR, Scan Médical, Vigie Edge AI) et captures système.
  - `videos_motion_design/` : Vidéos motion design complètes en Full HD 1080p (`25min` et `15min`).
  - `design_references/` : Planches de référence historiques.
- **`team_info/`** :
  - `TEAM_MEMBERS.md` & `team_manifest.json` : Fiches complètes des **10 membres de KERNEL FORGE** (Ravel, Hassane, Sandra, William, Mokam, Aliya, Judith, Juvenal, Marcel, Miguel).
  - `photos_reelles/` & `avatars_anime/` : Photographies originales et avatars anime haute définition pour le switch interactif.
  - `membres/` : Dossiers individuels (`01_RAVEL` à `10_MIGUEL`) contenant CVs, diplômes et certifications.
- **`new_design_andinterface/`** :
  - `logo final uniflow.png` : Nouveau logo officiel final (1254×1254 RGBA).
  - `extracted/roles_et_specs/` : Les 3 planches maîtresses couvrant 100 % des écrans (`Planche 1 : Public, Tarifs et Comptes`, `Planche 2 : Application Étudiant et Enseignant`, `Planche 3 : Rôles, Abonnement et Console Admin`).
  - `extracted/planches_web/` : Les 9 planches détaillées de l'application Web.
  - `extracted/planches_desktop/` : Les 4 planches détaillées de l'application Desktop (16 vues).
  - `extracted/planches_mobile/` : Les planches et screenshots Play Store de l'application Mobile.
  - `extracted/mascottes_et_memes/` : Planches d'émotions, réactions, actions de la mascotte Uni et mascottes OS (Android, iOS, Windows, Linux).
- **`brand_assets/`** : Icônes redimensionnées (`16px` à `1024px`), `favicon.ico`, logo horizontal et mascottes prêtes à l'emploi.
- **`config/`** :
  - `appwrite.ts` : Configuration unifiée pointant sur le serveur de production `https://vps.kernelforge.codes/v1` (2 bases de données : `uniflow` avec 40 collections et `independant` avec 25 collections, 6 buckets de stockage).
  - `seed-team-members.mjs` : Script de synchronisation des 10 membres KERNEL FORGE (déjà exécuté et synchronisé en production).
- **`web/`** : Socle React 19 + TypeScript + Vite + Tailwind CSS v4 + Appwrite SDK initialisé avec tous les assets publics (`public/brand`, `public/team`, `public/mascot`, `public/badges`, `public/planches`).
- **`mobile/`** : Socle Flutter (`codes.kernelforge.uniflow_mobile`) initialisé.

---

## 2. Infrastructure Backend Appwrite (`https://vps.kernelforge.codes/v1`)

Le serveur Appwrite auto-hébergé (version **2.3.0**) est actif et provisionné avec :
- **Projet** : `uniflow`
- **Bases de données** :
  - `uniflow` (**40 collections** actives : `users`, `academic_courses` [318], `academic_schedules` [572], `academic_library` [77], `badges_catalog` [100], `quests_catalog` [500], `team_members` [10], `classrooms` [36], `subscription_plans` [7], etc.)
  - `independant` (**25 collections** dédiées aux apprenants et enseignants autonomes)
- **Buckets Storage (6)** :
  - `uniflow_assets`, `uniflow_badges`, `uniflow_quests`, `uniflow_academic`, `uniflow_avatars`, `uniflow_assignments`

---

## 3. Ce qu'il faut faire ensuite (Feuille de Route)

### Étape 1 — Finaliser l'Interface Web (`/web` — React.js + TypeScript + Tailwind CSS)
Implémenter l'ensemble des pages en suivant fidèlement les planches `UniFlow_Planche1`, `UniFlow_Planche2` et `UniFlow_Planche3` :
1. **Portail Public (`Planche 1`)** :
   - `LandingPage` (Hero bleu `#1E3A8A` avec mascotte Uni, KPIs, fonctionnalités, partenaires).
   - `PricingPage` (Gratuit 0€, Standard 9,90€, Établissement sur devis + tableau comparatif).
   - `DownloadPage` (Android APK, Windows MSI/Store, Linux, Extension navigateur).
   - `LoginPage` (Split-screen avec switch `Universitaire | Indépendant`), `RegisterPage` (Stepper 3 étapes), `ForgotPasswordPage`, `ResetPasswordPage`.
   - `AboutPage` & `TeamsPage` (Switch interactif Photos Réelles ⟷ Avatars Anime des 10 membres KERNEL FORGE + timeline), `ContactPage`, `HelpPage`, `LegalDocumentPage`, `403` & `404`.
2. **Espace Apprenant & Enseignant (`Planche 2`)** :
   - `DashboardPage` (KPIs, Prochains cours, Progression circulaire, Badges récents).
   - `CoursesPage` & `CourseDetailPage` (Vue maître-détail avec onglets Description, Ressources, Devoirs, Notes, Participants).
   - `SchedulePage` (Grille hebdomadaire interactive + vue liste).
   - `AttendancePage` & `AttendanceManagePage` (Jauge d'assiduité, feuille d'appel interactive Présent/Absent/Retard, QR Code dynamique et export PDF/Excel).
   - `GradesPage` (Moyenne générale, classement, tableau coefficienté, graphiques).
   - `AssignmentsPage` (À rendre / Rendus / En retard + zone de dépôt de fichiers).
   - `LibraryPage` (Moteur Z-Library & catalogue Appwrite, lecture et téléchargement).
   - `ForumPage`, `MessagingPage` (Chat 3 colonnes), `GamificationPage` (Quêtes XP & Badges).
3. **Rôles Autonomes, Assistant IA & Console Admin (`Planche 3`)** :
   - `IndependentWorkspacePage` (Parcours libre sans sélecteur d'université).
   - `TeacherCoursesPage` & `PromotionPage` (Gestion de classes, annonces, promotion).
   - `UniAssistant` (Chat IA fond sombre `#081220` avec mascotte Uni et réponses intelligentes).
   - `SubscriptionFlowPage` & `BillingPage` (Tunnel 3 étapes et historique de facturation).
   - `AdminDashboardPage` (Console sombre `#081220` : Utilisateurs, Cours, Finances, Sécurité, Activité, Audience, Paramètres).

### Étape 2 — Finaliser l'Application Mobile (`/mobile` — Flutter)
1. Intégrer les assets (`brand_assets`, `mascottes`, `badges`, `team`) dans `pubspec.yaml`.
2. Créer l'**Onboarding animé** avec les mascottes Uni et transitions fluides.
3. Implémenter l'authentification et les écrans conformes aux maquettes mobiles :
   - **Accueil Étudiant** (Bannière Bonjour + mascotte, Mes Cours avec barres de progression, Emploi du temps du jour, Devoirs à venir avec tags d'urgence, Jauge de progression).
   - **Mes Notes & Bulletins** (Moyenne générale, courbe d'évolution S1–S4, détail par matière, export bulletin PDF, badges).
   - **Communication & Messagerie** (Filtres Toutes/Cours/Groupes/Privées, partage de PDF, réactions, carte de visioconférence).
   - **Présences QR, Bibliothèque Z-Lib & Équipe KERNEL FORGE**.

### Étape 3 — Créer et Finaliser l'Application Desktop (`/desktop` — Rust + Tauri v2)
1. Initialiser le projet Rust/Tauri v2 dans `/desktop` optimisé pour Windows et Linux.
2. Implémenter les **16 écrans des 4 planches Desktop** :
   - Fenêtre de connexion, Dashboard Admin, Gestion des Étudiants & Fiche détail, Gestion des Enseignants, Arborescence Programmes/Facultés, Gestion des UE, Gestion des Salles, Constructeur d'emploi du temps (drag & drop), Suivi des Présences + QR, Gestion des Visioconférences (En ligne & LAN LiveKit), Statistiques avancées, Centre de Communications & Annonces, Paramètres système & Profil.
3. Configurer le bundler **WiX / MSI** et le manifeste **Microsoft Store** dans `src-tauri/tauri.conf.json`.
