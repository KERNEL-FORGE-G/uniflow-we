# UniFlow — état du projet

> Fichier de reprise. Il existe pour qu'une session qui démarre sans contexte
> sache **où en est le travail** sans avoir à le redécouvrir. À lire en premier,
> à mettre à jour en dernier.
>
> Le détail tâche par tâche, avec la marche à suivre, est dans
> **`TRAVAUX-RESTANTS.md`**.
>
> Dernière mise à jour : **2026-10-15** (après-midi) — **Transition Desktop2 vers React + TypeScript + Tailwind CSS & Premier Logo** :
> 1. **Transition Réussie de Desktop2 (`independant/desktop2`) vers React + TypeScript + Tailwind CSS** :
>     - Remplacement complet de la stack Slint/Rust par l'architecture moderne demandée : **React 18 + TypeScript + Vite + Tailwind CSS + Lucide Icons**.
>     - Éradication de l'erreur 404 sur `main.tsx` avec point d'entrée déclaratif et composants de bureau modulaires.
>     - **Restauration intégrale du premier logo officiel UniFlow** (écusson 1024×1024, bandeau horizontal et favicon).
>     - **5 modules majeurs implémentés** : Tableau de bord adaptatif aux 3 rôles (Étudiant, Délégué, Enseignant), Feuilles d'appel QR dynamique et exports Excel/PDF, Moteur Z-Library mondial avec cache local, Catalogue des 250 quêtes avec les 6 badges d'honneur, et Galerie des 10 membres KERNEL FORGE avec commutateur interactif Photos Réelles ⟷ Avatars Anime.
>     - **Qualité & Tests** : Suite Vitest validée à 100% (`pnpm test`), compilation `pnpm run build` réussie avec 0 erreur en 2.51s, et serveur de dev actif sur `http://localhost:1420/` (HTTP 200 OK en 170ms). Commit `83519ef` sans co-auteur.
> 2. **Restauration du Premier Logo sur l'ensemble des dépôts** : Mobile (`independant/uniflow-mobile`), Desktop Flutter (`independant/uniflow-desktop`), Desktop2 (`independant/desktop2`) et Web (`independant/web2`).
> 3. **Production Vidéo Motion Design 25 Minutes (`output/uniflow_motion_design_25min.mp4`)** : 1500,2 secondes réelles (25 minutes complètes) en Full HD 1080p (1920×1080), 16 chapitres narratifs complets avec voix off française intégrale, mascottes officielles et encodage H.264/AAC haute fidélité (taille : 29,26 Mo).
>
> Précédemment au **2026-10-15** (matin) — **Validation CI Mobile 100% Verte (895/895 tests), Production Vidéo Motion Design 15min** :
> 1. **Perfectionnement & 100% Succès CI Mobile Flutter (`independant/uniflow-mobile`)** : Suite de 895/895 tests réussie, CI GitHub Actions validée avec succès, commit `9427528` sans co-auteur.
> 2. **Production Vidéo Motion Design 15 Minutes (`output/uniflow_motion_design_15min.mp4`)** : 900s Full HD 1080p, voix off française, 10 chapitres narratifs fidèles au modèle.
>
> Précédemment au **2026-10-14** — **Consolidation Mobile Flutter, Prompt Lovar Planches Web, Poussés sur GitHub** :
> 1. **Perfectionnement Mobile Flutter (`independant/uniflow-mobile`)** :
>     - **Harmonisation universelle de la bannière Hero (`dashboard.dart`)** : Déploiement de `_DashHeroBanner` avec mascotte Uni sur tous les profils (étudiant, personnel autonome, enseignant, administrateur, délégué) avec adaptation dynamique des salutations, sous-titres et boutons d'action rapide (ex: « Mon agenda », « Mes devoirs », « Gérer les comptes », « Mon emploi du temps »).
>     - **Bibliothèque Z-Library exclusive (`library.dart`)** : Clarification et valorisation du mode numérique avec libellé explicite `Uni Book (Z-Lib)`, badge dynamique du nombre d'ouvrages Z-Library et sous-titre mettant en avant le catalogue mondial et le cache permanent Appwrite Storage.
>     - **Nettoyage et linter** : Résolution des avertissements de constantes (`const Border`, `const PhosphorIcon`).
>     - **Qualité et tests** : 0 erreur à `flutter analyze --no-fatal-infos`, 21/21 tests unitaires validés avec succès (`test/team_test.dart`).
>     - **Commits Git** : `132e4cf`, `b3e47ba` et `fcdd39f` poussés sur `origin/main` sans aucune mention de co-auteur.
> 2. **Prompt Lovar pour Planches UI/UX complètes (`PROMPT_LOVAR_PLANCHES_WEB.md`)** : Document exhaustif créé à la racine pour générer 3 planches haute fidélité (Vitrine Publique & Sentinelle, Espaces Connectés des 3 rôles & Z-Library/Présences, Administration & Assistant Groq IA) sans omission d'aucune page ou interface.
> 3. **Consolidation Desktop Flutter (`independant/uniflow-desktop`)** : Correction responsive du commutateur interactif Photos Réelles ⟷ Avatars Anime de l'équipe (`teams_screen.dart`), `flutter analyze` 0 erreur, suite de tests validée (`test/team_test.dart` 20/20 passés). Commit `13f604b` poussé sur `origin/feature/frontend-uniflow-app`.
> 4. **Validation Web2 (`independant/web2`)** : Ajout de la dépendance `esbuild` en devDependencies, 230 tests passés avec succès (`pnpm test`), compilation `pnpm run build` réussie avec 0 erreur en 20.73s.
>
> Précédemment au **2026-10-13** — **Création de `independant/web2`, Finalisation 100% Indépendant, Logo Hibou UniFlow, Groq IA & Switch Équipe** :
> 1. **Création du projet complet `independant/web2`** : Création d'un dossier autonome `independant/web2` structuré, moderne, complet et adapté aux nouvelles directives (trois rôles indépendants : Étudiant libre, Délégué de promotion/groupe, Enseignant indépendant). Dépendances installées via pnpm, build TypeScript/Vite validé avec succès (0 erreur, `dist/` généré).
> 2. **Logo UniFlow avec Animal (Chouette / Hibou de la Sagesse + Boucle d'Infini)** : Généré et déployé en multi-résolutions sur Web (`public/logos/icon-512.png`, `icon-192.png`, `apple-touch-icon.png`, `logo.png`, `uniflow-wordmark.png`), Mobile et Desktop.
> 3. **Switch Photos Réelles vs Avatars Anime sur la page Équipe (`/teams`)** : Ajout d'une barre de contrôle interactive permettant de basculer instantanément entre les photographies réelles des membres et leurs avatars anime générés. Création des avatars anime haute définition pour **SINENG KENGNI JUVENAL** (Frontend Developer · Multiplateforme), **Tessoh pekam marcel** (Chef branche marketing) et **DJOMGUE Miguel** (Desktop Developer · Frontend Desktop) avec bascule bidirectionnelle garantie.
> 4. **Mise en avant complète de toute l'équipe KERNEL FORGE** : Sur la page d'accueil (`LandingPage.tsx`), la page À Propos (`AboutPage.tsx`) et la page Équipe (`TeamsPage.tsx`), les 10 membres sont mis à l'honneur (Ravel, Hassane, Sandra, William, Mokam, Aliya, Judith, Juvenal, Tessoh Marcel, Miguel) avec leurs avatars et rôles respectifs.
> 5. **Assistant Uni propulsé par Groq (`groqAssistantService.ts`)** : Intégration du moteur ultra-rapide Llama 3.3 70B Versatile via l'API Groq configurée dans `.env`, avec repli automatique et transparent vers la fonction Appwrite.
> 6. **Illustration dédiée pour l'inscription (`RegisterPage.tsx`)** : Différenciation de la page d'inscription avec une illustration dédiée (`/illustrations/hero.jpg`) distincte de la page de connexion (`/illustrations/login.jpg`).
> 7. **Refonte structurelle de la Landing Page (`LandingPage.tsx`)** : 100% orientée vers l'apprentissage autonome et les 3 rôles indépendants (Étudiant autonome, Délégué de groupe, Enseignant indépendant), valorisant le nouveau logo hibou, la bibliothèque libre et l'équipe.
> 8. **Feuille d'appel & Export pour profs/délégués indépendants (`AttendanceManagePage.tsx`)** : Ajout de la saisie libre de participants non enregistrés, émargement instantané et export direct PDF/Excel.
> 9. **Images et Design Sublimés de la Page Sentinelle (`SentinellePage.tsx`)** : Remplacement des images génériques par trois rendus 3D/Edge AI réalistes sur mesure (`/illustrations/sentinelle_patrol.jpg` pour le Kiosque motorisé omnidirectionnel avec LiDAR, `/illustrations/sentinelle_health.jpg` pour le scan médical sans contact, et `/illustrations/sentinelle_vigie.jpg` pour le centre de supervision Vigie Edge AI).
> 10. **API Book 100% Z-Library Exclusif (`api/books.ts` et `openLibraryService.ts`)** : Restriction exclusive et totale du moteur de recherche de livres numériques à Z-Library (VPS / miroir) avec mise en cache Appwrite dans le bucket `uniflow_assets`. Retrait des sources tierces.
> 11. **Validation des builds et analyses** : `pnpm run build` Web réussi dans `independant/web2` (0 erreur, 27.62s), validation sans régression.
> 11. **Synchronisation et Push des Trois Dépôts (Web, Mobile, Desktop)** :
>     - **Web (`uniflow-we`)** : Poussé avec succès sur `origin/main` (`42cc616`). Secrets nettoyés (zéro clé en clair dans le code), intégration de tous les avatars d'équipe anime et réels.
>     - **Mobile (`uniflow-mobile`)** : Poussé avec succès sur `origin/main` (`50cbe16`). Commutateur photos réelles / avatars anime intégré dans `teams.dart` avec design responsive adaptatif et tests `flutter test test/team_test.dart` (21/21 tests passés avec succès).
>     - **Desktop (`uniflow-desktop`)** : Poussé avec succès sur `origin/feature/frontend-uniflow-app` (`f541827`). Intégration du bandeau hero, des 10 membres avec photos réelles et avatars anime et du commutateur interactif (`teams_screen.dart`), `flutter analyze` 0 erreur.
> 12. **Nouveau Logo Professionnel Épuré (Hibou Tech Anime & Boucle d'Infini Vectorielle)** :
>     - Logo haut de gamme combinant les ailes et regard perçant du hibou savant dans une boucle de flux infini géométrique tech (bleu roi `#1E3A8A`, turquoise `#0D9488`, or subtil).
>     - Découpé en transparence vectorielle : `assets/brand/uniflow_marque.png` (icône emblème 512x512) et `assets/brand/uniflow_logo_horizontal.png` (bandeau horizontal avec typographie soignée).
>     - Remplacé et validé sur **Mobile**, **Desktop** et **Web** puis poussé sur GitHub sans trailer `Co-authored-by`.
> Avant cela, fin de journée du 21/09 (≈17:00–18:30) : **l'équipe
> passe à dix membres** (pôle marketing dirigé par Tessoh Pekam Marcel, saisi
> par le propriétaire depuis Réglages > Équipe ; **DJOMGUE Miguel**, second
> développeur desktop, ajouté par le seed, `760b2d1` du web), et
> **`PROMPT-CLAUDE-PLAN-7-JOURS.md`** à la racine — prompt pour obtenir de
> Claude un plan de travail du 22 au 28/09 en trois groupes (desktop :
> Alia + Miguel ; marketing : Tessoh + anciens du frontend web ; tests
> mobile/web : le reste de l'équipe avec le propriétaire), livré aussi dans
> `PLAN-7-JOURS-UNIFLOW.zip` avec les deux mascottes et le logo. Détail au
> §2, bloc « Fin de journée ».
> Avant cela, session de l'après-midi
> (≈12:00–16:45) : **icônes Phosphor sur les trois clients**, présentation
> mobile à chaque lancement, **Uni ne recouvre plus aucune commande** (mobile et
> desktop), **première release Android publiée sur GitHub** et **liens de
> téléchargement dynamiques** (collection `app_releases`, page web `/download`,
> réglage depuis l'administration). **L'historique des trois dépôts a été
> réécrit** avec l'accord du propriétaire : plus aucun trailer
> `Co-authored-by` ; **tous les hashs cités dans ce fichier et dans
> `TRAVAUX-RESTANTS.md` ont été convertis** vers la nouvelle histoire — un clone
> antérieur doit faire `git fetch && git reset --hard origin/main`. Tout est au
> §2, bloc « Session du 2026-09-21, après-midi ».
> La session du matin (≈10:00–11:20 : inscription qui ne bloque plus, emplois du
> temps fictifs ICT4D L2/L3, authentification mobile redessinée, badges) et ce
> qui s'est passé entre 05:00 et 09:40 restent au §2 dans leurs blocs datés.
> Les sessions précédentes du 21/09 (03:45–04:45 : Archlord, groupe WhatsApp,
> salle de classe ICT4D L1, tableau de bord réel ; puis 20/09 midi → 21/09 03:00)
> restent au §2 dans leurs blocs datés.
> La migration vers Appwrite Cloud du 2026-09-20 est au §0. Le §1 et le bas du
> §2 (« Ce qui fonctionne », première partie, et une partie des points de
> vigilance) décrivent encore **l'ancien serveur auto-hébergé, mort** ; là où
> ils contredisent le §0 et les blocs datés, **le §0 et les blocs datés font foi**.

---

## 0. Migration vers Appwrite Cloud — 2026-09-20

Le serveur auto-hébergé `appwrite.kernelforge.codes` (1.6.1) est **mort avec sa
montée en 2.2.0** et n'est plus joignable. Le propriétaire a tranché : « je veux
quitter l'Appwrite auto-hébergé pour l'Appwrite officiel ». Fait ce jour :

| Élément | Valeur |
|---|---|
| Endpoint | `https://fra.cloud.appwrite.io/v1` (région Francfort, serveur 2.2.0) |
| Projet | `uniflow` (organisation `6a2e769200255cbc1e80`) |
| Base | `uniflow` — 31 collections, conformes au schéma (`verify-appwrite-schema.mjs` : 0 divergence) |
| Bucket | **un seul**, `uniflow_assets` — l'offre gratuite n'en permet qu'un ; documents, avatars et pièces jointes y cohabitent, droits posés **fichier par fichier** |
| Functions | **deux** (limite de l'offre) : `uniflow-api` (routeur : le chemin `/messaging`, `/team-roster`, `/attendance-secure`, `/academic-grades`, `/academic-registration`, `/admin-directory`, `/forum-reactions`, `/contact-messages`, `/subscription-payments` choisit le service) et `notification-alerts` (événements) ; runtime `node-22`, clé dynamique `x-appwrite-key` |
| Plateformes | web, Android, Linux, macOS, Windows déclarées |
| Clé serveur | nouvelle clé « standard », dans `uniflow-backend/.env` (non versionné) ; l'ancienne clé compromise appartient à un serveur mort |
| Comptes | `scripts/seed-accounts.mjs` : `kernel@forge.codes` (depuis la matinée : compte `PLATFORM`, labels `ADMIN` + `superadmin`, voir §2), `administration.ict4d@uniflow.test` (`uy1-administration`, « Administration — Faculté des Sciences », ADMIN), `enseignant.ict4d@uniflow.test` (TEACHER), `delegue.ict4d.l1@uniflow.test` (DELEGATE), `etudiant.ict4d.l1@uniflow.test` (L1), `etudiant.ict4d.l2@uniflow.test` (L2), `independant@uniflow.test` (PERSONAL). Mots de passe générés dans `uniflow-backend/.comptes-demo.local` (hors Git) |
| Données | `seed-academic-demo.mjs` (6 cours, emploi du temps, notes, 6 documents, 3 devoirs), `seed-team-members.mjs` (8 membres après le retrait de `0a526a3`), logo public téléversé ; **puis, dans la matinée, `seed-academic-reference-data.mjs` : le référentiel UY1 complet** (12 filières, 296 UE, 527 séances — voir §2) |
| Clients | les trois `.env` pointent vers le Cloud ; le `.env` web est **sorti du versionnement** ; ceux des clients Flutter restent versionnés (valeurs publiques, embarqués comme asset) |
| Web | `executeService(path, payload)` remplace les neuf identifiants de Function ; **Firebase retiré** (notifications par Appwrite Realtime) ; `test-team-roster-function.mjs` **18/18** contre le Cloud |
| Schéma | `users.level` accepte `L1`–`L3` (et `M1`, `M2` depuis `f554aa1`, voir §2) ; collections `academic_enrollments`, `academic_assignments`, `academic_submissions`, `attendance_sessions`, `subscription_plans`, `subscription_statuses` intégrées au schéma (elles n'existaient que dans des seeds) ; `academic_assignments` a des chaînes réduites (limite de taille de ligne MariaDB atteinte à la création) |
| Rangement | racine de l'espace de travail et des quatre dépôts rangée (`docs/`, `assets/`), README refaits, `README.md` racine ajouté |

Ce qui a été appris sur le Cloud : la limite d'une base / d'un bucket répond
**403 avant le 409** d'idempotence — le provisionnement vérifie donc l'existence
avant de créer ; les variables `APPWRITE_*` d'un `.env` sourcé écrasent la
session de l'Appwrite CLI (`unset` avant les commandes `projects`/`organizations`) ;
la console (`/projects/…/keys`) exige `keyId: "unique()"`.

**Suite de la journée** : la refonte des trois clients par les agents
`uniflow-web`, `uniflow-mobile`, `uniflow-desktop` a continué toute la matinée ;
ce qui est établi est consigné au §2 (« Matinée du 2026-09-20 »). À 11:40 les
trois agents travaillent **encore en parallèle** : arbres de travail web
(7 fichiers modifiés, 4 nouveaux — pages admin) et mobile (64 fichiers, 5
nouveaux) sales, desktop propre et poussé (`092b885`). Ne rien commiter à leur
place.

---

## 1. Ce qu'est UniFlow

Une plateforme universitaire en quatre dépôts qui partagent **un seul backend,
Appwrite Cloud** (voir §0 ; ce qui suit décrit l'organisation générale).

| Dossier | Rôle | Dépôt / branche |
|---|---|---|
| `uniflow-we` | Application web (source de vérité du schéma Appwrite) | `KERNEL-FORGE-G/uniflow-we` — branche `fix/avatar-bucket-et-roles` |
| `uniflow-mobile` | Application Flutter Android — le dépôt ne porte que `android/`, pas de `ios/` | `KERNEL-FORGE-G/uniflow-mobile` — branche `team-fronted-dev-mo` |
| `uniflow-desktop` | Application Flutter bureau | `KERNEL-FORGE-G/uniflow-desktop` — branche `feature/frontend-uniflow-app` |
| `uniflow-backend` | Scripts et `.env` de configuration. **Pas de serveur applicatif** : le desktop embarque le serveur LiveKit et signe lui-même ses jetons. | — |

### Serveur Appwrite

> **Caduc depuis le 2026-09-20** : ce qui suit décrit le serveur auto-hébergé,
> mort. Les valeurs en vigueur (Cloud, région Francfort, projet `uniflow`) sont
> au §0 ; `uniflow-backend/.env` reste l'endroit où vivent endpoint, projet et
> clé. Les « contraintes apprises à la dure » ci-dessous valaient pour 1.6.1
> auto-hébergé ; sur le Cloud 2.2.0 : runtime `node-22`, bucket à 50 Mo, une
> base et un bucket au plus, deux Functions au plus.

- Endpoint : `https://appwrite.kernelforge.codes/v1`
- Projet : `6a959096002a64d9d4e6`
- Base : `uniflow`
- Version : 1.6.1, auto-hébergée
- La configuration (endpoint, projet, clé) vit dans `uniflow-backend/.env`.
  `uniflow-we/scripts/appwrite-env.mjs` la lit et **refuse de démarrer** si elle
  manque — un script qui provisionne le mauvais projet en silence a déjà coûté
  une session de débogage.

### Contraintes du serveur, apprises à la dure

| Contrainte | Détail |
|---|---|
| Taille des fichiers | Plafonnée par `_APP_STORAGE_LIMIT` = **30 000 000 octets**. Toute valeur supérieure est refusée à la création du bucket. Pour 50 Mo : relever cette variable dans le `.env` du serveur puis redémarrer Appwrite. |
| Runtimes de Function | Seul **`node-16.0`** est exposé. `scripts/appwrite-env.mjs` interroge `/functions/runtimes` au lieu de coder une version en dur. |
| Permissions de bucket | Se mettent à jour en **`PUT`**, pas `PATCH` (404 `general_route_not_found`). |
| Téléversement multipart | Attend des champs **répétés** `permissions[]`, pas un tableau sérialisé en JSON. |
| En-têtes d'exécution de Function | L'API refuse tout en-tête commençant par `x-appwrite`. Pour tester une Function en local, créer une session via `POST /users/{id}/sessions` et appeler avec `X-Appwrite-Session`. |
| Identifiant de bucket ≠ nom | Le bucket d'avatars s'appelle `uniflow_avatars` mais a été créé sous `6aa81b840031e6a34dc3`. Appwrite résout par identifiant : utiliser le nom renvoie un 404. |
| Déploiement d'une Function | Les quatre `scripts/deploy-*-function.mjs` publiaient l'archive trouvée dans `/tmp` **sans jamais la reconstruire** : ils annonçaient « Déploiement prêt » et un nouvel identifiant de déploiement tout en exécutant l'ancien code. Une correction de la messagerie a ainsi été annoncée déployée deux fois sans l'être. Seul `deploy-messaging-function.mjs` construit désormais son archive depuis `functions/<id>/`. |
| Multipart | Un envoi `multipart/form-data` vers Appwrite ne doit **pas** porter d'en-tête `content-type: application/json` : la bibliothèque n'analyse alors plus le corps et Appwrite répond « Param `fileId` is not optional ». |

---

## 2. État actuel

### Session du 2026-10-02 — Gamification (100 badges + 300 quêtes) + Design clean white Lovart

Mise à jour : **2026-10-02**.

#### Mobile (`uniflow-mobile`, branche `feat/messaging-redesign-dark`)

Commits récents : `e310598`, `73561f0` (badges Appwrite + quêtes + corrections).

- ✅ `lib/models/gamification.dart` : modèles complets (BadgeDefinition, UserBadge, BadgeWithProgress, QuestDefinition, UserQuestProgress, QuestWithProgress, XpLevel, LeaderboardEntry) — 446 lignes
- ✅ `lib/services/gamification_service.dart` : service Appwrite badges + quêtes (3000) + leaderboard + providers Riverpod
- ✅ `lib/screens/badges.dart` : migré vers BadgeWithProgress (100 badges depuis Appwrite + images bucket `badges_assets`)
- ✅ `lib/screens/quests.dart` : créé (3000 quêtes paginées, countdown reset, top 3 leaderboard)
- ✅ `lib/screens/onboarding.dart` : redesigné (MascotDialogue Archlord+Uni, logo image, taille fixe, placeholders mascottes Lovart)
- ✅ `functions/morning-greetings` : push notifications bonjour personnalisées (cron quotidien)
- ✅ **Planches Lovart reçues** (2026-10-02) — design clean white à appliquer :
  - Planche 1 : Splash + Onboarding 4 pages + Login (fond blanc, dégradés bleu/teal par page)
  - Planche 2 : Dashboard + Emploi du temps + Profil + Notifications (cards blanches, bottom nav 5 items)
  - Planche 3 : Gamification + Messagerie
- 🔄 Design clean white en cours d'application (sous-agent mobile actif)

#### Web (`uniflow-we`)

Commit : `1b85fbc` (gamification schemas + seeds + fonctions Appwrite).

- ✅ `scripts/appwrite-schema.mjs` : +6 collections (badges_catalog, user_badges, quests_catalog, user_quest_progress, user_xp, leaderboard)
- ✅ `scripts/seed-badges-part1.mjs` + `seed-badges-part2.mjs` : 100 badges, chacun avec imageFileId unique dans bucket `badges_assets`
- ✅ `scripts/seed-quests.mjs` : 300 quêtes dynamiques (hebdo/mensuel/annuel/spécial)
- ✅ `functions/morning-greetings/src/main.js` : push notif bonjour personnalisées (297 lignes)
- ✅ `functions/quest-reset/src/main.js` : auto-reset quêtes par période, cron hebdo/mensuel/annuel (285 lignes)
- ✅ `src/lib/gamification.ts` : service TypeScript badges + quêtes + leaderboard + XP
- ✅ `src/pages/GamificationPage.tsx` : page Badges+Quêtes, design clean white UniFlow (415 lignes)
- ✅ Route `/app/badges-quetes` dans `App.tsx`
- 🔄 Vérification TypeScript + lien navigation en cours (sous-agent web actif)
- ⚠️ **Commit local uniquement** — pas de push avant validation du propriétaire

#### Desktop (`uniflow-desktop`)

Commit récent : `d4a3940` (onboarding desktop + analyse zéro erreur).

- ✅ `lib/screens/onboarding_screen.dart` : onboarding desktop créé
- ✅ `lib/services/gamification_service.dart` : service gamification desktop
- 🔄 Design clean white en cours d'application (sous-agent desktop actif)

#### Système Gamification — Architecture Appwrite

| Élément | État |
|---|---|
| Bucket `badges_assets` | À créer sur Appwrite Cloud — images des 100 badges |
| Collection `badges_catalog` | Schéma ✅, seed 100 badges ✅ |
| Collection `user_badges` | Schéma ✅ |
| Collection `quests_catalog` | Schéma ✅, seed 300 quêtes ✅ |
| Collection `user_quest_progress` | Schéma ✅ |
| Collection `user_xp` + `leaderboard` | Schéma ✅ |
| Function `morning-greetings` | Code ✅, pas encore déployé |
| Function `quest-reset` | Code ✅, pas encore déployé |

**À faire avant de passer en production :**
1. Créer bucket `badges_assets` sur Appwrite Cloud
2. Uploader les 100 images de badges dans ce bucket
3. Mettre à jour les `imageFileId` dans le seed-badges
4. Lancer `node scripts/appwrite-schema.mjs` (provision nouvelles collections)
5. Lancer `node scripts/seed-badges-part1.mjs` + `seed-badges-part2.mjs` + `seed-quests.mjs`
6. Déployer les fonctions `morning-greetings` et `quest-reset`
7. Configurer les crons Appwrite pour les fonctions

---

### Session des 2026-09-25 et 26 — l'assistant passe par n8n (vérifié dans le code et par tests ; **rien n'est déployé ni activé**)

Le propriétaire a tranché le 25/09 : « au lieu d'utiliser Gemini, qu'il soit lié
à un workflow n8n que je possède sur mon propre VPS », puis « remplace Ollama
partout par le provider Gemini et le modèle Gemini 3.1 Flash Lite », et enfin
« agis en autonomie en prenant le meilleur choix ». Périmètre retenu après
questions : **étape 1 puis étape 2** (la Function garde l'ancrage dans les
données réelles, n8n devient le fournisseur de génération ; étape 2 = n8n
déclenche les automatisations), et **n8n ne lit jamais la base UniFlow** —
« zéro clé Appwrite dans n8n ».

- **Service `/assistant`** (`functions/uniflow-api`) : l'appel direct à Google a
  disparu. `src/lib/assistant.js` ne connote plus l'API de Gemini — il produit
  la charge utile de la passerelle (`toN8nRequest`, `extractN8nReply`,
  `N8N_DEFAULT_PATH`, `N8N_TOKEN_HEADER`) ; `GEMINI_ENDPOINT`,
  `toGeminiRequest` et `extractGeminiText` sont supprimés. Dans
  `src/services/assistant.js`, `askGemini` → `askN8n`, garde `N8N_WEBHOOK_URL`
  (ou `N8N_HOST` + chemin connu) **et** `N8N_WEBHOOK_TOKEN`, échelle de secours
  `n8n → Mistral` conservée. `GEMINI_API_KEY` n'est plus lu par la Function.
  **Le contrat des trois clients est inchangé** : `provider` reste `'gemini'`,
  donc `UniAssistant.tsx`, `uni_assistant.dart` (mobile et desktop) et
  `appwrite.ts` ne bougent pas. Timeout Function laissé à 25 s, le nœud HTTP de
  n8n étant réglé à 20 s pour décrocher le premier.
- **Trois workflows livrés**, dans `uniflow-we/docs/n8n/` (installation pas à
  pas dans `docs/n8n/README.md`, daté du 26/09) : `uni-gabarit-html` (seul
  producteur du HTML et du pied de page avec la **photo d'Uni**, exigence du
  25/09), `uni-bienvenue-inscrit` (webhook Appwrite `users.create` → HMAC-SHA1 →
  **email sans modèle**, parce que le texte énonce des règles du produit),
  `uni-passerelle-assistant` (webhook Header Auth → `generateContent` verrouillé
  sur `gemini-3.1-flash-lite` → texte). Ollama n'apparaît nulle part.
- **Tests** : `scripts/n8n-workflows.test.mjs` exécute les nœuds Code et
  l'expression HTTP des trois JSON (15 tests, dans `npm test`) — corps Gemini
  conforme à ce que produisait la Function, HMAC accepté/rejeté, seeds `.test` /
  `.local` / `.invalid` filtrés, déduplication sur Appwrite qui rejoue, nom
  piégé `<img onerror=…>` neutralisé, PNG et liens en route hash, poids
  < 20 Ko. `src/lib/assistant.test.js` porté à 15 tests. Les deux passent.
- **Sonde** : `scripts/measure-n8n-assistant.mjs` réécrit, plus d'Ollama ni de
  `num_ctx` — `--gateway`, `--direct`, `--compare`, `--payload`, pour séparer ce
  que coûte Google de ce que coûte n8n. Sondule le 26/09 : la Function répond
  bien, `POST /webhook/uniflow-assistant` renvoie le **404 « webhook not
  registered »** de n8n, preuve que l'instance est joignable et que le workflow
  n'est pas encore importé.
- **Ce qui reste entre les mains du propriétaire** (aucun de ces gestes n'est
  faisable depuis le dépôt) : importer les trois JSON, créer le credential
  Header Auth, poser `APPWRITE_WEBHOOK_SECRET` et
  `N8N_BLOCK_ENV_ACCESS_IN_NODE=false` sur le VPS, déclarer le webhook
  `users.create` dans la console Appwrite, renseigner `N8N_WEBHOOK_URL` /
  `N8N_WEBHOOK_TOKEN` sur la Function, remplacer `REMPLACER_APRES_IMPORT`,
  puis activer. (L'avatar du pied de page n'est pas de ceux-là :
  `uniflow.kernelforge.codes/assistant/uni-avatar.png` répond déjà 200 en
  `image/png`, vérifié le 26/09 — c'est un asset statique du site web.)
- **À peser avant d'activer** : la main sur le modèle, donc la facture, est
  désormais dans la console n8n ; les emails de bienvenue partiront pour de vrai
  vers les comptes réels déjà créés (`@facsciences-uy1.cm` et trois Gmail),
  seuls les TLD réservés étant filtrés.
- **Non fait, volontairement**, à cette date : la moitié « dans l'application »
  de la bienvenue (la ligne `notifications` écrite par `notification-alerts`),
  les sous-agents Telegram et PDF, le recâblage de l'orchestrateur à sous-agents
  sur le chat étudiant (≥ 4 allers-retours de modèle, et un 8B appelle mal ses
  outils — la conversation doit rester déterministe), et les textes légaux qui
  nomment Google comme sous-traitant.

### Fin de journée du 2026-09-21 (≈17:00–18:30) — vérifié sur le Cloud et dans Git

- **L'équipe compte dix membres** (`team_members`, vérifié par lecture
  publique) : le propriétaire a créé le **pôle marketing** depuis Réglages >
  Équipe — **Tessoh Pekam Marcel**, « Chef branche marketing », sous-équipe
  MARKETING, avec photo — et corrigé depuis la même page le compte GitHub de
  Hassane (`Hawadja`) et l'accent de sa propre carte (`cyan`). **DJOMGUE
  Miguel** (« Desktop Developer », sous-équipe Frontend Desktop, sans photo
  ni contact pour l'instant) a été ajouté par `scripts/seed-team-members.mjs`
  pour travailler en binôme avec Aliyatou sur le rattrapage du desktop.
- **Le seed équipe rapproche désormais par `slug`** (web `760b2d1`, sur
  `main`) : les membres créés depuis la page d'administration ont un `$id`
  aléatoire, et l'ancienne comparaison sur `$id` aurait **supprimé Tessoh et
  sa photo** au prochain lancement pour le recréer sans photo. Le seed reflète
  aussi les valeurs choisies depuis l'administration pour ne pas les écraser.
  Lancé une fois : 9 mis à jour (Tessoh en place, photo conservée), 1 créé.
- **`PROMPT-CLAUDE-PLAN-7-JOURS.md`** (racine, ~23 Ko) : prompt à coller dans
  Claude pour obtenir un plan de travail du **22 au 28/09** en trois groupes
  — desktop (Alia + Miguel : publication d'un binaire, hors ligne transposé
  du mobile, écrans manquants, devoirs enseignant, essai visio à deux
  machines), marketing (Tessoh + Juvenal + autres anciens du frontend web :
  nouvelle vidéo web/mobile 16:9 et 9:16, calendrier de diffusion, chaîne
  TikTok avec cinq vidéos), tests mobile/web (Ravel, Judith, Sandra, William,
  Hassane, Ange : campagne de simulations ordonnée que Claude doit produire,
  modèle de rapport de bogue, triage quotidien). Les faits qu'il contient
  (état des trois clients, comptes de démo sans mot de passe, écarts du
  desktop) ont été relevés dans les dépôts et sur le Cloud ce jour ; les
  disponibilités et le canal de coordination sont laissés `[À COMPLÉTER]`.
  Livré aussi dans **`PLAN-7-JOURS-UNIFLOW.zip`** (racine, 1,5 Mo) avec
  `uni_wave`, `archlord_wave`, `archlord_uni_fistbump` et le logo principal
  (PNG + SVG), pris dans `IMAGES-UNIFLOW/`.

### Session du 2026-09-21, après-midi (≈12:00–16:45) — vérifié dans Git et sur le Cloud

**Où en sont les dépôts (16:45).** Les trois branches de travail sont **au même
commit que `origin/main`** et les trois arbres sont **propres** : web `555dc14`
(`fix/avatar-bucket-et-roles`), mobile `a58f3de` (`team-fronted-dev-mo`),
desktop `8f0c8d9` (`feature/frontend-uniflow-app`). Aucun sous-agent ne tourne
plus (demande du propriétaire à 15:50 : « arrête tout ce qui tourne »).

- **Historique réécrit, plus aucun co-auteur** (16:35–16:40). Avec l'accord du
  propriétaire, `git filter-repo` a retiré la seule ligne
  `Co-authored-by: Cursor <cursoragent@cursor.com>` de `main` et de la branche
  de travail des trois dépôts, sur des clones frais : web **49 → 0** trailers
  (236 commits), mobile **31 → 0** (62), desktop **26 → 0** (51) ; arbres,
  auteurs, dates et messages identiques (vérifié : même `tree` avant/après,
  même nombre de commits), `push --force-with-lease`, dépôts locaux remis sur
  la nouvelle histoire. **Tous les hashs cités dans ce fichier et dans
  `TRAVAUX-RESTANTS.md` ont été convertis** avec les cartes de réécriture (157
  remplacements ; seul `dbf4f97a`, du backend, n'a pas changé). Les branches des
  coéquipiers (`DevFrontendMobile`, `oceanne_mobile`, `master` mobile ;
  `agent/…`, `chore/…`, `backup/…` web) n'ont **pas** été touchées : elles
  gardent l'ancienne histoire, un `rebase` sur le nouveau `main` verra les
  mêmes patchs déjà appliqués. Pour l'avenir : réglage `attribution` désactivé
  dans `~/.cursor/cli-config.json` et crochet `tools/git-hooks/commit-msg`
  installé dans les trois `.git/hooks/` (voir `CLAUDE.md`).
- **Icônes Phosphor sur les trois clients** (web `af164e5` + `f4935f8`, mobile
  `e89b426` puis `0eaa769`→`7dd97a8`, desktop `715ae75`) : icône et couleur de
  matière **dérivées du nom** (`subjectIcon`), tuiles `IconTile`, plus aucune
  icône Material dans `lib/` (test dédié sur le mobile, `7dd97a8`). Spécification
  commune dans `docs/icones-uniflow.md`.
- **Mobile : présentation (onboarding) affichée à chaque lancement** puis
  tableau de bord ou connexion (`86b3e61`) — demande du propriétaire.
- **Uni ne recouvre plus aucune commande.** Mobile `338125f` : table
  `lib/router/shell_pages.dart` qui déclare le **bord inférieur** de chaque
  page (`free`, `fab`, `composer`) ; le lanceur passe à gauche devant un FAB,
  disparaît devant un composeur ; marge basse partagée `uniClearance` (88 px)
  sur 19 listes ; `test/uni_dock_test.dart` monte chaque page pour chaque rôle
  et deux tailles et échoue si Uni croise une commande. Desktop `8f0c8d9` et web
  `1e0e512` (`CornerStack`) : même principe. Symptôme d'origine : Uni cachait
  le bouton **Envoyer** et le bouton **Nouvelle conversation** de la messagerie.
- **Première release Android publiée** : le propriétaire a construit l'APK et
  l'a mis dans les releases GitHub de `KERNEL-FORGE-G/uniflow-apps` (tag
  `uniflow`, `app-release.apk`, **87,2 Mo**, SHA-256 `2804af7c…e11773`,
  versionName 1.0.0, minSdk 24, targetSdk 36, **signature debug** — voir
  vigilance). Procédure complète dans `uniflow-mobile/docs/publication-android.md`
  (`a58f3de`).
- **Liens de téléchargement dynamiques et page `/download`** (web `555dc14`,
  déployé sur `main`). Collection **`app_releases`** (`$id` = plateforme :
  `android`, `windows`, `linux`, `macos` ; `read("any")`, **aucune écriture
  côté client**), service **`/app-releases`** de `uniflow-api` (`list` public,
  `upsert` réservé au label `superadmin` — 11/11 vérifications contre le Cloud
  par `scripts/test-app-releases-function.mjs`), carte **Paramètres ›
  Applications à télécharger** dans l'administration (superadmin ; les autres
  administrations lisent une note), section « Télécharger » de la landing et
  liens des deux pieds de page, script `scripts/set-app-release.mjs`. Nouvelle
  page publique **`/download`** (entrée « Télécharger » en pastille dans la
  barre de navigation, désormais repliée en menu sous 1024 px ; sitemap, SEO) :
  héros, trois cartes illustrées **Android / bureau / navigateur**, la version
  de bureau ayant **déjà sa place**, ligne par système, affichée « bientôt »
  tant que l'admin n'a pas publié de lien ; installation en trois étapes,
  empreinte SHA-256 copiable, notes de version, FAQ. Quatre illustrations
  générées (`src/assets/illustrations/telecharger-*.webp`, 17 à 55 Ko). Le
  document `android` est **publié** (1.0.0, 87 184 725 octets, lecture publique
  vérifiée par sonde REST à 16:15). Logique pure `downloadPageModel.ts` (12
  tests) ; suite web **214/214**.
- **Incident et correction** : une exécution du script QA
  `test-app-releases-function.mjs` (écrit pour une collection vide) a **écrasé
  puis effacé le document `android` réel** pendant quelques minutes (16:05) ;
  republié aussitôt par `set-app-release.mjs`, et le script sauvegarde
  désormais le document existant au départ et le **restaure** à la fin
  (rejoué : `1.0.0` restauré, publié).
- **Vérifié à 16:55 en production** : `https://uniflow.kernelforge.codes/#/download`
  affiche « Télécharger pour Android — Version 1.0.0 · 83,1 Mo · publiée le
  21 septembre 2026 » avec l'URL GitHub de l'APK (lue depuis `app_releases`),
  le bureau « bientôt » ligne par ligne, le sitemap déployé contient
  `/download`.
- **Carte de partage sociale** (`bdccbe8`) : `public/og-card.jpg` (1200×630,
  70 Ko — logo, « La plateforme universitaire tout-en-un », pastilles Web /
  Android / Desktop, signature KERNEL FORGE) déclarée en `og:image` et
  `twitter:image` à la place du PNG du logo servi depuis Appwrite (1711×531,
  recadré en vignette illisible par LinkedIn et WhatsApp). Pour l'annonce de
  la v1 : `POST-LINKEDIN-UNIFLOW.md` réécrit (v1, APK téléchargeable, emplois
  du temps de la Faculté des Sciences de l'UY1, comptes indépendants).
- **Comptes indépendants vérifiés de bout en bout contre le Cloud** (16:50,
  sonde REST jetable reproduisant le web) : inscription libre → session →
  profil `users` `accountType: PERSONAL` créé avec la seule session de
  l'utilisateur (aucun label, donc aucun rôle universitaire) → matière et
  tâche personnelles créées, relues (1/1), tâche passée `DONE` →
  `/account delete-self` **200** et connexion ensuite refusée ; les
  `personal_*` du compte supprimé sont bien purgés (0 restant). **10/10.**
- **Audit Lighthouse de la production** (avant `/download`) : performance
  **32 mobile / 39 desktop**, accessibilité et SEO élevés. Causes mesurées :
  rechargement forcé par le service worker à la première visite (≈10,9 s de
  « redirection »), paquet principal 1,3 Mo minifié (Phosphor 338 Ko, GSAP
  113 Ko, mascottes inlinées 119 Ko, textes légaux), logo LCP de 470 Ko servi
  depuis Appwrite, polices Google. Plan de la « vague 2 » au §3.
- **Nettoyage machine** (demande du propriétaire, 15:50) : démon Gradle inactif
  (1,7 Go) et serveurs de développement d'autres espaces de travail arrêtés ;
  certains ont été relancés par d'autres conversations, à arrêter depuis
  celles-ci.

### Session du 2026-09-21, matin (≈10:00–11:20) — vérifié dans Git et sur le Cloud

**Où en sont les dépôts (mesuré à 11:25).** Les trois branches de travail sont
**au même commit que `origin/main`** et les trois arbres de travail sont
**propres** : web `7a2f3fe` (`fix/avatar-bucket-et-roles`), mobile `11be25e`
(`team-fronted-dev-mo`), desktop `dddf1a9` (`feature/frontend-uniflow-app`).
Backend : `dbf4f97a`, propre. Le point de vigilance « le desktop est en cours de
modification par un sous-agent » est caduc — **mais à 12:06 les trois arbres
sont de nouveau sales** : un chantier « jeu d'icônes » a démarré en parallèle
du journal (web : `src/components/ui/UniIcon.tsx`, `src/lib/subjectIcon.ts` et
leurs tests, `package.json`, `src/index.css` ; mobile et desktop :
`lib/widgets/uni_icons.dart`, `app_shell`, `user_role.dart` /
`app_destination.dart`, `pubspec.yaml`). Il n'est pas commité ; **ne rien
commiter à sa place**. Les chiffres de tests ci-dessous ont été mesurés
**avant** ces modifications Dart (web 11:30, mobile 11:50, desktop 11:55 ;
fichiers Dart modifiés à partir de 12:02).

**Le Cloud, mesuré à 11:35 par le journal** (sonde REST en lecture seule) :
`academic_courses` **312** (296 + 16), `academic_schedules` **557** (527 + 30),
`academic_enrollments` **89** (73 + 16), `academic_directory` 18, **22
utilisateurs** (21 + un premier compte étudiant **réel**, voir plus bas).
ICT4D : **6 cours L1 / 8 L2 / 8 L3**, **10 / 15 / 15 séances** — exactement ce
que la session annonçait. Function `uniflow-api` : déploiement actif
**`6ab1030a5b6c713307a0`** (`ready`, 2026-09-21 10:12 UTC), précédé de
`6ab10226bd15b473c127` à 10:08 UTC — elle a bien été redéployée deux fois ce
matin.

- **L'inscription ne bloque plus sur une filière sans cours** (web `9b9e608`,
  mobile `11be25e`, desktop `dddf1a9`). Symptôme : un étudiant ICT4D L2 ou L3
  lisait « Compte créé, mais les cours … ne sont pas encore disponibles » et
  restait devant le formulaire alors que compte et session existaient ; la
  Function répondait 409 et refusait M1/M2 (422). Désormais
  `/academic-registration` crée l'entrée d'annuaire et répond `ok: true,
  coursesReady: false` ; les niveaux M1 et M2 du schéma sont acceptés. Les
  trois clients ne lèvent plus si le raccordement échoue et rejouent
  `provision` (idempotent) à la connexion — `retryAcademicProvisioning` dans
  `src/lib/appwrite.ts` / `useAuth.ts` (web), `auth_repository.dart` (mobile
  et desktop). Mobile et desktop entrent **directement dans le tableau de
  bord** après la création (mot de bienvenue en toast) : plus d'écran « Entrer
  dans l'application » (mobile) ni « Compte créé » + retour à la connexion
  (desktop, `pushAndRemoveUntil(MainShell)`). Le web redirigeait déjà vers
  `/app`. Tests : `test/registration_test.dart` étendu (mobile),
  `test/academic_provisioning_retry_test.dart` (desktop, 4 tests).
- **`/account delete-self` efface aussi `academic_enrollments`** : les
  inscriptions survivaient au compte et laissaient un étudiant fantôme dans les
  listes d'appel — constaté par le nouveau test de bout en bout.
- **`scripts/test-registration-flow.mjs`** (nouveau) : inscription avec les
  droits d'un client (compte → session → `users` → provision), filière avec
  cours (ICT4D L3) et sans cours (ICT4D M1), idempotence, suppression via
  `delete-self`. **23 vérifications passées** contre le Cloud d'après la
  session ; non rejoué par le journal (le script **écrit** sur le Cloud : il
  crée puis supprime un compte).
- **`scripts/appwrite-env.mjs` réessaie les 502/503/504** : le CDN d'Appwrite
  Cloud a rendu « 503 first byte timeout » au milieu d'un seed. Effet de bord à
  connaître : un POST parti en 503 puis réessayé revient en 409, et le
  compteur « créé / mis à jour » du seed le compte comme « mis à jour ».
- **Emplois du temps fictifs et provisoires ICT4D L2 et L3** (`7a2f3fe`,
  `scripts/data/fs-uy1-2026-2027.mjs`) : 8 UE et 15 séances par niveau, codes
  `ICT201`–`ICT208` / `ICT301`–`ICT308`, marqués **`provisional: true`**,
  salles du référentiel plus deux nouvelles (`INFO1`, `INFO2`) ; la L1 garde
  son jeu de démonstration (`ict101`…`ict106`, 10 séances). `TEACHER_ACCOUNTS`
  rattache Pr. Fouda / Dr. Nkolo / M. Essomba (`uy1-teacher-01..03`) aux cours
  par `teacherId`. `seed-academic-reference-data.mjs` inscrit aussi les
  apprenants de l'annuaire aux cours de leur filière et niveau
  (`enrollDirectoryLearners`) ; exécuté : l'étudiant L2 de démonstration
  (`uy1-student-l2`, **8 inscriptions**, vérifié) et l'étudiant L3 réel (8
  inscriptions d'après la session ; 73 → 89 au total, cohérent). Test
  `scripts/data/fs-uy1-2026-2027.test.mjs` (5 tests : chevauchements, salles,
  codes, CM, enseignants). **Ces données sont inventées** : à remplacer par
  l'officiel dès réception (voir §3).
- **Premier compte étudiant réel sur la plateforme** : un étudiant ICT4D L3
  (Rachid A.) s'est inscrit avant la publication des cours de sa filière — c'est
  lui qui a révélé le blocage ci-dessus. Il n'est **pas** un compte de
  démonstration : les seeds et `--prune` ne doivent pas le toucher, et son nom
  complet n'a pas sa place dans un fichier versionné.
- **Suite web : `node --test` complet → 162/162**, rejoué par le journal à
  11:30 avec la commande du README (`functions/uniflow-api/src/**/*.test.js`,
  `src/**/*.test.ts`, `src/**/*.test.mjs`, `scripts/**/*.test.mjs`). Toujours
  **pas de script `npm test`**. README : lignes ajoutées pour
  `seed-academic-reference-data.mjs`, `test-registration-flow.mjs` et cette
  commande.
- **Mobile — authentification redessinée d'après la maquette du propriétaire**
  (`11be25e`) : bandeau dégradé avec accroche et mascotte Uni, feuille blanche
  qui remonte pour le formulaire, sélecteur de type de compte, confirmation du
  mot de passe, **plus de boutons sociaux** (aucun OAuth configuré) — connexion,
  inscription, mot de passe oublié (`lib/widgets/auth_widgets.dart`,
  `login.dart`, `register.dart`, `forgot_password.dart`). **Badges de
  réussite** : six médailles (Premier pas, Assidu, Ponctuel, Major, Entraide,
  Sans faute) calculées depuis présences, notes, devoirs et forum —
  `lib/models/badges.dart`, `providers/badges_provider.dart`,
  `widgets/badges.dart`, `screens/badges.dart`, route `/badges`, images
  `assets/badges/*.webp` (sources dans `IMAGES-UNIFLOW/badges/`, **non
  décrites dans son README**). **Tableau de bord par rôle** (apprenant,
  enseignant, administration, compte personnel) au lieu d'une vue étudiante
  pour tous ; `ShimmerList` en `shrinkWrap` (écran rouge « unbounded height »
  en test). Tests ajoutés : `auth_layout_test.dart`, `badges_test.dart`.
  **`flutter test` → 585/585, « All tests passed »**, rejoué par le journal à
  11:55 sur l'arbre propre à `11be25e` (521 à 04:49, 563 à `9cdae36`).
- **Desktop `flutter test` → 585/585, « All tests passed »** (rapporteur JSON :
  585 tests visibles, 62 hooks `setUpAll`/`tearDownAll` cachés, 0 échec),
  rejoué par le journal à 12:00 sur l'arbre propre à `dddf1a9` — le premier
  chiffre desktop fiable depuis le 162/162 du 2026-09-15 (462 à `3ba7bdd`
  d'après son message de commit). La session annonçait 581 ; le chiffre
  mesuré est 585.

### Du 2026-09-21 05:00 à 09:40 — d'après l'historique Git, non rejoué

Entre la fin du journal précédent (04:50) et la session du matin, trois séries
de commits par dépôt, jamais consignées. Ce que les commits établissent :

- **Web** (`81eed13` → `31505cd`, 05:11–07:10) : **hors ligne web**
  (`9297327` : `useApi` sur `useQuery`, cache react-query persisté dans
  IndexedDB 24 h, `OfflineBanner` avec Uni endormi, file d'écritures
  `writeQueue` pour messages et feuilles de présence rejouée au retour du
  réseau, `public/sw.js` avec identifiant de build et précache généré au build ;
  `src/lib/offline/offlineModel.test.ts`). **Logo vectorisé** (`08f7df2`,
  quatre SVG tracés depuis les PNG, favicon SVG) et **PNG / icônes PWA
  régénérés depuis le vecteur** (`f6fbd24`, zone sûre « maskable »). **Espace
  enseignant réel** (`cfa061b`) : l'onglet Devoirs de `TeacherCoursesPage.tsx`
  lit `academic_assignments` et `academic_submissions`, publication et
  suppression d'énoncés, téléversement des supports dans `uniflow_assets` puis
  `academic_library` — **la maquette codée en dur (« Quiz Algorithmique »,
  45/23) a disparu**, vérifié par le journal ; testé par la session avec Dr
  Nkolo. **Bandeau « Aucun abonnement actif » réservé aux comptes `PERSONAL`**
  et à la page Abonnement (`7952f69`, `shouldHideMissingSubscription` dans
  `src/lib/paymentsModel.ts`) — les comptes universitaires sont couverts par
  leur établissement. **Mon profil** sur données réelles (`002fda8`, plus de
  « 80 séances, 1 200 points »). **Page Plateforme de l'administration**
  fondée sur `/public-stats` et un ping Appwrite réel (`31505cd`), plus d'uptime
  inventé. Pastilles du tableau de bord enseignant / délégué calculées
  (`81eed13`).
- **Mobile** (`b40edbf` → `9cdae36`, 05:12–09:36) : **icône Android** refaite
  (tuile claire, couches monochrome et ronde, glyphe de barre d'état ;
  `tools/generer-icones-uniflow.py` reste le seul propriétaire du jeu), **écran
  de lancement** de marque, libellé « UniFlow », retour prédictif, raccourcis
  statiques et schéma `uniflow://` (`af6bdc7`), **icône de notification
  blanche** (`3e46523` — l'icône couleur donnait un carré gris), **bord à
  bord** Android 15 (`93a509f`), **release signée par `android/key.properties`
  (hors dépôt), R8 et réduction des ressources** (`7390c5b` : APK par ABI
  28,8–35,4 Mo, bundle 77 Mo, `keep.xml` pour l'icône de barre d'état).
  **Plus aucune trace de l'ancienne API intermédiaire** (`0cbee95` : client
  `dio` retiré, `academic_enrollments` lu pour de vrai, fiches UE/enseignant
  réelles, test live 9/9 contre le Cloud). **Écusson net** (`b2236e9` :
  `assets/brand/uniflow_marque.png` rastérisé depuis le SVG en 1024 px,
  `FilterQuality.high`) — mais `uniflow_logo_horizontal.png` est **toujours
  celui du 15/09**. **CI verte** (`9cdae36`, `dart format`, 563 tests à ce
  commit).
- **Desktop** (`ebd916b` → `b4bbc00`, 05:11–09:33) : fin du chantier
  « planches » — palette centralisée, `AppDataTable` sur tous les annuaires et
  tableaux, `AppButton` partout, derniers SnackBar en toasts (`ebd916b`,
  `d59a14b`, `1743112`, `74610e8`, `3ba7bdd`, `b277dc6` ; PNG de marque
  rastérisés depuis le vecteur). **Visioconférence : feuille de présence**
  (`422d030` modèle et persistance JSON atomique dans
  `~/.uniflow/conference/presences` ; `d1cdb2e` alimentée par les **webhooks
  signés de `livekit-server`** et les tickets de jonction ; `ee865b0` **exports
  PDF et Excel** dans `Documents/UniFlow/Présences` ; `3552904` panneau de
  présence en direct dans l'écran Conférences). **Créer une réunion ouvre la
  salle** (`97f58d3` : hôte dans la salle `livekit_client`, adresse LAN choisie
  par classement des interfaces — le pont Docker `172.17.0.1` était annoncé —,
  page navigateur `http://IP:port/join/CODE` pour les participants sans
  application, « Rejoindre une réunion »). **ADR-001** complété (`73b1e1e`).
  Placements d'Archlord vérifiés en 1280×800, 1440×900 et 1920×1080
  (`730bf1b`). **CI verte** (`b4bbc00` : `dart format` sur 51 fichiers) et
  **`test_live/conference_host_live_test.dart`** : « Créer une réunion » puis
  « Rejoindre » avec le vrai `livekit-server` — jeton signé accepté par
  `/rtc/validate`, jeton forgé refusé, page `/join/CODE` servie sur le LAN.
  C'est la **première preuve exécutable** de la visioconférence embarquée ;
  elle reste un test sur un seul poste, pas un essai à deux machines.

### Session du 2026-09-21, 03:45–04:45 — vérifié dans le code et sur le Cloud

**Où en sont les dépôts (mesuré à 04:50).** Les trois branches de travail sont
**au même commit que `origin/main`** : web `8a76c88` (branche
`fix/avatar-bucket-et-roles`, Vercel déploie `main`), mobile `a26dc2c`
(`team-fronted-dev-mo`), desktop `659270c` (`feature/frontend-uniflow-app`).
Arbres de travail : web et mobile **propres** ; desktop **10 fichiers modifiés
et 1 nouveau** (`lib/ui/table_action_icon.dart`, pastilles et tableaux) — le
sous-agent desktop travaille encore, ne rien commiter à sa place. Le
sous-agent web a commité ses exports PDF/Excel (`8a76c88`, `src/lib/exports/`,
`src/components/exports/`, test `exportModel.test.ts`) à 04:47, après la fin de
la session.

**Le Cloud, mesuré à 04:50** (`verify-appwrite-schema.mjs` : **conforme, 0
divergence**, va jusqu'au bout — le défaut qui le faisait mourir sur une
collection absente est caduc) : **33 collections**, un bucket `uniflow_assets`
à 50 000 000 octets, 21 utilisateurs (21 pseudos uniques, 1 photo de profil).
Compteurs : `academic_courses` 296, `academic_schedules` 527 (le référentiel UY1
du 20/09), `academic_enrollments` 73, `academic_assignments` 3,
`academic_submissions` 15, `attendance_sessions` 15, `attendance_records` 150,
`academic_grades` 198, `chat_conversations` 6, `chat_messages` 14,
`forum_posts` 5, `notifications` 61, `subscription_plans` 7. Plus aucun compte
`qa-*@example.invalid`.

- **Archlord, la mascotte du fondateur** (style Duolingo, comme Uni) — web :
  six poses détourées `src/assets/mascot/archlord-{explain,laptop,pointing,
  thinking,thumbs,wave}.webp` + la scène à deux `archlord-uni-fistbump.webp` ;
  métadonnées `src/components/mascot/archlord.ts` ; composants `ArchlordMascot`,
  `ArchlordAndUni` (poing contre poing) et `MascotDialogue` dans
  `src/components/mascot/ArchlordMascot.tsx` ; l'enchaînement des répliques est
  une logique pure, `dialogueModel.ts`, testée (`dialogueModel.test.ts`,
  **5/5** rejoués par le journal). Posé sur À propos (section KERNEL FORGE +
  appel final), Équipe (hero), Landing (section « Deux mots du fondateur », à la
  place du placeholder témoignages), Présentation (intro vidéo) et Contact
  (Archlord seul). Les sources détourées sont dans `IMAGES-UNIFLOW/mascotte-archlord/`
  (README de ce dossier à jour). Mobile (`87d1ba0`, `e80a5d7` :
  `lib/widgets/uni/archlord_mascot.dart`, `mascot_dialogue.dart`, 7 assets,
  test `archlord_mascot_test.dart`) : utilisé dans l'onboarding, l'écran
  À propos et la section Réglages hors ligne. Desktop (`5d2f0f4`, mêmes
  widgets, tests `archlord_mascot_test.dart` et `archlord_placements_test.dart`)
  : utilisé dans `management_screens.dart` (À propos, note Conférences) et
  `auth_chrome.dart`. La cohérence des placements entre les trois clients n'a
  pas été relue (voir §3).
- **Groupe WhatsApp KERNEL FORGE** : `KERNEL_FORGE_WHATSAPP_GROUP_URL` (et
  `KERNEL_FORGE_GITHUB_URL`) dans `src/lib/contactInfo.ts`, affiché dans les
  deux pieds de page (`LandingLayout.tsx`, `Footer.tsx`), sur Équipe (bouton
  vert) et Contact ; repris dans `MESSAGE-WHATSAPP-UNIFLOW.md` et
  `POST-LINKEDIN-UNIFLOW.md` à la racine, et dans `uniflow-mobile/lib/app_info.dart`.
- **Salle de classe de démonstration** — `scripts/seed-classroom.mjs`
  (idempotent, exécuté sur le Cloud) : ICT4D L1 / UY1 / Faculté des Sciences.
  Deux enseignants de plus, `uy1-teacher-02` Dr. Nkolo (ICT102) et
  `uy1-teacher-03` M. Essomba (ICT105) — Pr. Fouda `uy1-teacher-01` garde ICT101
  et ICT104 ; ICT103 (Dr. Atangana) n'a **pas** de compte enseignant. Huit
  étudiants `uy1-l1-etu-03..10` (Amina Ngo Bassong, Boris Tchoupo, Clarisse
  Mbianda, Dieudonné Fotso, Esther Nkeng, Franck Abega, Grâce Ewane, Hervé
  Kamdem ; `prenom.nom@uniflow.test`, matricules `UY1-ICT4D-L1-2026-0xx`),
  60 inscriptions, `teacherId` réels posés sur cours et devoirs (les permissions
  des rendus visaient l'identifiant fictif `seed-teacher-ict4d` : les
  enseignants ne voyaient rien), 15 séances de présence sur trois semaines et
  150 relevés (identifiants déterministes identiques à ceux de
  `attendance-secure`), 15 rendus dans `academic_submissions` (7 TD dont 4
  corrigés, 6 quiz corrigés, 2 PDF), 144 notes, 4 conversations / 11 messages,
  4 publications de forum avec réactions, 23 notifications. Option
  `--purge-qa` / `--only-purge-qa` : les trois comptes `qa-*@example.invalid`
  (ADMIN, restes d'anciennes vérifications) ont été supprimés.
  `seed-academic-demo.mjs` pose désormais les vrais identifiants enseignants.
  **Mots de passe dans `uniflow-backend/.comptes-classe.local`**, hors Git —
  mais voir le point de vigilance : ce fichier **n'est pas dans le `.gitignore`**.
- **Tableau de bord web branché sur le réel.** Le web ignorait les énoncés
  publiés (modèle `teacherId`/`audience` + `academic_submissions`) et affichait
  « Devoirs à rendre : 0 ». Corrigé dans `src/lib/api.ts`
  (`universityAssignments`) avec `src/lib/assignmentModel.ts` (audience
  filière/niveau, statut du rendu, taux de présence ; `assignmentModel.test.ts`
  **6/6**). `DashboardPage.tsx` : taux de présence réel
  (`attendanceApi.myRecords`/`myRate`), séances du jour, jours du mois avec
  cours, courbe hebdomadaire sur 6 semaines, distribution des notes, moyennes par
  type pour l'enseignant, activité récente depuis les notifications — logique
  pure dans `src/lib/dashboardModel.ts` (`dashboardModel.test.ts` **8/8**).
  Effectif réel « Étudiants enregistrés » (`studentsApi.countForMyCourses`).
  « Bonjour, Pr. » corrigé (un titre en tête n'est pas un prénom).
  `AssignmentsPage.tsx` : dates ISO formatées, « Nouveau devoir » réservé aux
  comptes `PERSONAL`. Vérifié dans le navigateur par la session (serveur local,
  non rejoué par le journal) : Amina → 6 cours, 87 % de présence, 3 devoirs
  (2 notés, 1 soumis), séances du lundi ; Pr. Fouda → 2 cours, 11 inscrits,
  66 notes, moyenne 12,9.
- **Function `notification-alerts`** : « Retard enregistrée » → « Retard
  enregistré », type `retard` (`functions/notification-alerts/src/main.js`).
  Redéployée : déploiement actif **`6ab0a5c8cb211352aab8`**, `ready`,
  2026-09-21 03:34 UTC, `node-22`, `enabled: true` — lu sur le Cloud par le
  journal.
- **Le web a une suite de tests unitaires** (le « aucune suite web » des
  versions précédentes est caduc) : 20 fichiers `node:test` (`src/**/*.test.ts`,
  `*.render.test.mjs`), **sans script `npm test`** — se lancent un par un avec
  `node --test <fichier>` (Node 24 exécute le TypeScript directement).
- **Mobile : `flutter test` → 521/521, « All tests passed »** sur l'arbre propre
  à `a26dc2c`, rejoué par le journal à 04:49 (2 min 25). Desktop : **non
  rejoué**, l'arbre est en cours de modification par le sous-agent.

### Du 2026-09-20 midi au 2026-09-21 03:00 — d'après l'historique Git, non rejoué

Ce bloc remplace le « Matinée du 2026-09-20 » annoncé et jamais écrit. Il dit
ce que les commits établissent, pas ce que chaque commit a changé.

- **Web** : Structure académique et UE calculées depuis la base, sélecteur
  filière → niveau, plus aucun « ICT4D · L1 » codé en dur ; un étudiant ne voit
  que l'emploi du temps de sa filière et de son niveau, ou rien. **Mascotte Uni**
  (`src/components/mascot/UniMascot.tsx`, `UniScenes.tsx`, `poses.ts`) et
  **assistant Uni** (`src/components/assistant/`, `src/lib/assistant.ts`,
  service `assistant.js` côté `uniflow-api` — Gemini, voix, avatar animé),
  suppression de compte réelle (service `account.js`), pages légales
  (`src/data/legal.ts`, `pages/legal/`), mesure d'audience maison
  (`src/lib/metrics.ts`, services `metrics.js` et `public-stats.js`, collections
  `site_visits`, `site_metrics_daily`, page `AdminAudiencePage`), landing et
  À propos refaites avec des chiffres réels, KERNEL FORGE présenté comme une
  entreprise de logiciel, logos sans halo. **Facturation** (`52c698a`) :
  catalogue de formules en base (`subscription_plans`, 7 documents,
  `seed-subscription-plans.mjs`), université sur les demandes, page Abonnement
  (`PricingPage`, `SubscriptionFlowPage`, `src/lib/pricingModel.ts`). Le routeur
  `uniflow-api` compte **13 services** (les neuf du §0 plus `account`,
  `assistant`, `metrics`, `public-stats`). 16 pages `src/pages/admin/`, dont
  `AdminUsersPage` qui **crée des comptes avec leur rôle** (STUDENT, DELEGATE,
  TEACHER, ADMIN) via `/admin-directory`.
- **Mobile** : **hors ligne local-first** (`lib/offline/` — base locale,
  outbox, synchronisation delta paginée, session chiffrée, démarrage sans
  réseau, écrans « cache d'abord », bandeau et section Réglages) ; toutes les
  filières, admin `PLATFORM` sans périmètre, déconnexion et suppression de
  compte ; écran d'inscription natif `lib/screens/register.dart` (miroir de
  `/register` du web, avec lien `url_launcher` vers la page web) ; **Uni** et
  l'assistant Uni (`lib/widgets/uni/`) ; onboarding illustré au premier
  lancement, écran À propos, états d'erreur unifiés ; CI GitHub en un workflow à
  trois jobs chaînés, Flutter 3.47.1 épinglé. Les écrans morts d'avant
  (`presence.dart`, `library.dart`, `forum.dart`) sont **réparés** — leurs
  commentaires d'en-tête décrivent le symptôme corrigé.
- **Desktop** (la pause est levée depuis le 2026-09-20) : type de compte
  `PLATFORM` et faculté, parcours complet des collections ; connexion et
  **inscription** plein écran (`register_screen.dart`, natif + lien web) ;
  `MainShell` délègue à `AppShell` (`lib/ui/app_shell.dart` : en-tête,
  recherche, état de sync, menu de compte, **destinations filtrées par rôle et
  type de compte** — `visibleDestinations`) ; emploi du temps filtré par
  filière/niveau ; **Uni** et l'assistant Uni ; **tableau de bord par rôle
  aligné sur le web** (`549fd81`), barre latérale claire conforme aux planches ;
  états vide/chargement/erreur et pastilles unifiés (`7076904`), tableau
  Enseignants `AppDataTable` (`659270c`) ; CI en un workflow à jobs chaînés,
  analyse statique sans remontée ; `assets/images/logo.png` (872 Ko) **retiré**
  du dépôt. La visioconférence embarquée (`lib/services/conference/` : processus
  LiveKit, jetons, serveur hôte) est présente dans le code, **jamais éprouvée
  par le journal**.
- **Racine / agents** : `CLAUDE.md` présente désormais les quatre agents ;
  `.claude/agents/*.md` déclarent toujours `model: deepseek-v4-flash` (voir
  §3, outillage).

### Ce qui fonctionne

> Cette première partie date d'**avant la migration** (2026-09-15) : les
> chiffres de collections, de runtime (`node-16.0`) et de déploiement qu'elle
> cite sont ceux du serveur auto-hébergé, mort. Ce qui reste vrai : les
> corrections de code qu'elle décrit (SDK Dart, pièces jointes, icônes).

- **Connexion** sur les trois clients (web, mobile, desktop).
- **Messagerie mobile — débloquée, et vérifiée sur un appareil réel.** Le
  diagnostic des deux sessions précédentes est clos : l'écran ne tombait pas sur
  le serveur, mais sur `Execution.fromMap` du SDK Dart 26.2.0, qui réclame un
  champ `resourceType` absent du document d'exécution d'Appwrite 1.6.1 — un
  `firstWhere` sans `orElse`, donc « Bad state: No element » sur **chaque** appel
  de Function. `_execute` passe désormais par `client.call` et
  `decodeExecutionPayload` (fonction pure, testée). Établi sur le téléphone
  `25028RN03A` (Android 15) le 2026-09-15 : `SONDE list -> error=null`,
  `SONDE search -> error=null`, et un aller-retour complet entre deux comptes —
  conversation `conv_9ee57772c48a18c54c94d42dc934`, pièce jointe
  `6aa91d49c41855da12b7`, 70 octets, destinataire compris. **C'est la première
  validation de la messagerie sur un vrai téléphone dans l'histoire du projet.**
- **Function de messagerie côté serveur** : déployée, `enabled: true`,
  `execute: ["users"]`, runtime `node-16.0`, et **désormais à jour de sa
  source**. Le déploiement actif `6aa91ae624121090e546` (2026-09-15 11:16
  locale) porte une archive identique octet pour octet à
  `functions/messaging/` — vérifié en la dépaquetant et en la comparant. Le
  point de vigilance « en retard d'un commit » des versions précédentes de ce
  fichier est caduc : le `userId` ajouté par `589419a` est bien en service.
- **Envoi de pièces jointes — chaîne complète vérifiée de bout en bout.**
  Trois défauts se masquaient mutuellement et sont corrigés : le téléversement
  mobile (`storage.createFile` → `chunkedUpload` + `decodeUploadedFileId`, car
  `File.fromMap` réclame un `sizeActual` que 1.6.1 ne renvoie pas), l'appel
  `storage.updateFile` de la Function (objet en 3e position au lieu de
  `(bucket, id, name, permissions)` — Appwrite répondait « Invalid `name`
  param » et **tout** envoi de pièce jointe échouait en `MESSAGING_ERROR`), et
  le script de déploiement qui publiait une archive figée. Établi sur le serveur
  en service le 2026-09-15 : `node scripts/test-messaging-attachment.mjs` →
  **11/11** (dont la contre-épreuve « le destinataire ne peut pas lire le
  fichier *avant* l'envoi »), et la pièce jointe réellement déposée par la sonde
  porte `read("user:sondea20260915")` **et** `read("user:sondeb20260915")`,
  `update`/`delete` restant à l'expéditeur.
- **Données académiques** : les sept collections `academic_*` existent sur le
  serveur et sont peuplées — `academic_courses` 6 documents,
  `academic_assignments` 3, `academic_schedules` 10, `academic_directory` 11,
  `academic_grades` 126, `academic_library` 6, `academic_submissions` 0
  (mesuré sur le serveur le 2026-09-15). Le serveur porte **23 collections**.
- **Suites de tests**, mesurées le 2026-09-15 : desktop **162/162** et mobile
  **222/222** (`flutter test`, `All tests passed` — le mobile est passé de 213 à
  222, dont 3 nouveaux tests sur `decodeUploadedFileId`). Sur mobile,
  `flutter analyze` rend **47 remarques, 0 erreur** (45 `info`, 2 `warning`,
  recompté aujourd'hui). La suite web n'a pas été rejouée : le dépôt n'a **pas
  de tests unitaires**, seulement `scripts/run-uy1-e2e.mjs`, un E2E qui écrit
  sur le serveur et exige la clé API. Le « web 100 % » des versions précédentes
  de ce fichier n'était pas fondé sur une suite web.
- **Icônes de marque** : les deux applis Flutter les génèrent avec le même
  script `tools/generer-icones-uniflow.py`, à partir de `assets/brand/`
  (`uniflow_marque.png` = écusson carré, `uniflow_logo_horizontal.png` =
  logotype long, tous deux détourés par le propriétaire) — desktop 25 icônes
  (Android, macOS, Windows, web), mobile 12 icônes Android seulement (ce dépôt
  n'a ni `ios/` ni `web/`).
- **Comptes réels sur le serveur** : la collection `users` contient
  **11 documents** — 7 comptes étudiants, 1 compte d'administration et
  3 comptes de sonde jetables (voir « Comptes notables » et les points de
  vigilance).
- **Organisation en agents** : `.claude/agents/` contient un agent par périmètre
  — `journal-projet` (tient ce fichier), `uniflow-web`, `uniflow-mobile`,
  `uniflow-desktop` — et un `README.md`. Tous démarrent depuis le 2026-09-15. Ils
  ne sont découverts que si la session est lancée depuis la racine du projet.

### Comptes notables (Appwrite Cloud, 22 comptes au 2026-09-21 11:35)

Les comptes de sonde de l'ancien serveur (`sonde*20260915`) ont disparu avec
lui. Aucun mot de passe n'est dans un fichier versionné.

| Compte | Rôle | Remarque |
|---|---|---|
| Étudiant ICT4D L3 réel (Rachid A.) | STUDENT | **Premier compte non fictif** de la plateforme, inscrit le 21/09 avant la publication des cours de sa filière ; 8 inscriptions posées par le seed. Ni seed ni `--prune` ne doivent le toucher. |
| `kernel@forge.codes` | PLATFORM, labels `ADMIN` + `superadmin` | Admin de la plateforme. Seul lui crée des comptes `ADMIN`. Mot de passe dans `uniflow-backend/.comptes-demo.local` (hors Git). |
| `administration.ict4d@uniflow.test` | ADMIN | `uy1-administration`, « Administration — Faculté des Sciences ». |
| `enseignant.ict4d@uniflow.test` | TEACHER | `uy1-teacher-01`, Pr. Fouda — ICT101, ICT104. |
| `enseignant.nkolo@uniflow.test`, `enseignant.essomba@uniflow.test` | TEACHER | `uy1-teacher-02` Dr. Nkolo (ICT102), `uy1-teacher-03` M. Essomba (ICT105). Créés par `seed-classroom.mjs` ; mots de passe dans `uniflow-backend/.comptes-classe.local`. |
| `delegue.ict4d.l1@uniflow.test` | DELEGATE | Délégué de la L1 ICT4D. |
| `etudiant.ict4d.l1@uniflow.test`, `etudiant.ict4d.l2@uniflow.test` | STUDENT | L1 et L2 de démonstration (`seed-accounts.mjs`). |
| `uy1-l1-etu-03` … `uy1-l1-etu-10` (`prenom.nom@uniflow.test`) | STUDENT | Les huit étudiants de la salle de classe ICT4D L1 (Amina Ngo Bassong … Hervé Kamdem). Mots de passe dans `.comptes-classe.local`. |
| `independant@uniflow.test` | PERSONAL | Compte hors université (seul type autorisé à créer ses propres devoirs). |
| `qa-*@example.invalid` | — | **Supprimés** le 2026-09-21 (`seed-classroom.mjs --only-purge-qa`) ; vérifié : 0 restant. |

### Points de vigilance

- ~~**Presque tous les commits depuis la migration portent
  `Co-authored-by: Cursor`**~~ — **réglé le 2026-09-21 à 16:40** : historique
  des trois `main` réécrit avec l'accord du propriétaire (0 trailer, arbres
  identiques), hashs du journal convertis, réglage `attribution` désactivé et
  crochet `commit-msg` en place. Reste à surveiller : **vérifier après chaque
  commit** (`git show -s --format=%B HEAD`) que le crochet a bien agi, et
  prévenir les coéquipiers qu'un clone antérieur au 21/09 16:40 doit faire
  `git fetch && git reset --hard origin/main` (leurs branches propres ne sont
  pas touchées).
- **L'APK publié (`uniflow-apps`, tag `uniflow`, 1.0.0) est signé avec la clé
  de débogage** et son nom de fichier est `app-release.apk` : une prochaine
  version signée avec la clé de release (`android/key.properties`, procédure
  dans `uniflow-mobile/docs/publication-android.md`) **ne s'installera pas
  par-dessus** — l'utilisateur devra désinstaller. Prévoir de le dire dans les
  notes de la version suivante, et nommer les fichiers `uniflow-<version>.apk`.
- **`scripts/test-app-releases-function.mjs` écrit dans la collection de
  production** (document `android`) : il le sauvegarde et le restaure, mais ne
  le lancer que si l'on accepte quelques secondes de lien « dépublié » sur le
  site ; jamais en parallèle d'un `set-app-release.mjs`.
- **Les emplois du temps ICT4D L2 et L3 en base sont inventés**
  (`provisional: true`). Un étudiant réel de L3 les voit comme s'ils étaient
  vrais. À remplacer dès réception de l'officiel ; d'ici là, ne pas les
  présenter comme des données de l'université.
- **Le compteur « créé / mis à jour » de `seed-academic-reference-data.mjs` est
  trompeur derrière le CDN** : un POST en 503 réessayé revient en 409 et passe
  pour une mise à jour. Se fier aux compteurs de collections, pas au résumé.
- ~~`TeacherCoursesPage.tsx`, onglet Devoirs, est encore une maquette~~ —
  **réglé par `cfa061b`** (06:40) : énoncés réels, rendus, publication,
  supports ; plus aucun titre codé en dur (vérifié par le journal).
- **Les trois dépôts sont en cours de modification (chantier « jeu
  d'icônes », 12:06)** : `UniIcon.tsx` / `subjectIcon.ts` côté web,
  `uni_icons.dart` côté mobile et desktop, plus `pubspec.yaml` /
  `package.json`. Ne pas commiter, ne pas reformater, ne pas mesurer `main`
  avec ces arbres. Les suites devront être rejouées quand ce chantier sera
  commité.
- ~~`uniflow-backend/.comptes-classe.local` n'était pas ignoré par Git~~ —
  **réglé le 2026-09-21 à 05:05** (commit `dbf4f97a` : `.comptes-classe.local`
  et motif `.comptes-*.local` dans le `.gitignore`). Le fichier n'a jamais été
  commité. Leçon : un script qui écrit un fichier de mots de passe ajoute la
  règle `.gitignore` dans le même commit.
- **Le hors ligne (mobile et, depuis `9297327`, web), la visioconférence
  desktop et l'assistant Uni n'ont jamais été éprouvés sur un appareil réel ou
  à deux machines** depuis la migration : ce sont des faits de code (commits,
  tests unitaires, un test live sur un seul poste pour la visio), pas des
  faits d'usage. Le release Android signé (`7390c5b`) n'a pas non plus été
  installé sur un téléphone à la connaissance du journal.
- **Le tableau de bord web n'a été vérifié qu'en local** (`vite`, serveur de
  développement) ; le déploiement Vercel de `main` n'a pas été ouvert par la
  session.
- Les points qui suivent datent d'**avant la migration** (clé compromise,
  `.env` web versionné, scripts `deploy-*`, comptes de sonde, `users.level`,
  attributs `enum`, collections manquantes, sonde qui plante, Firebase) : ils
  sont **clos** — voir `TRAVAUX-RESTANTS.md` §0. Restent vrais : les `.env`
  Flutter versionnés (à dessein, valeurs publiques), l'absence de vraies
  notifications push (décision : pas de Firebase), et le contraste de
  l'écusson desktop, jamais tranché.

- **La clé API Appwrite du serveur est publiée dans un dépôt GitHub public.**
  Vérifié le 2026-09-15 : `uniflow-we/.env` est **versionné** (aucune entrée
  `.env` dans son `.gitignore`) et contient la clé sous le nom
  `UNIFLOW_API_TOKEN` — c'est la **même valeur** que `APPWRITE_API_KEY` de
  `uniflow-backend/.env` (revérifié le 2026-09-15 : les deux empreintes SHA-256
  tronquées valent `52a10a6184694e8f`). Autrement dit, **la clé que le
  propriétaire a fournie pour cette session est celle-là même qui est
  compromise** : la rotation reste à faire. Le fichier a été ajouté par
  `b30035c`, touché de nouveau par `5a7a6e5`, toujours présent à la tête de
  `fix/avatar-bucket-et-roles`, et cette tête est poussée sur `origin`, qui est
  **public**. La même clé dort
  aussi dans l'**historique** de `uniflow-mobile` (`a22be3d`, `f946bcf` ; dépôt
  public) et de `uniflow-desktop` (`aab6d10`, `9b72a37` ; dépôt privé). Elle est
  absente des trois têtes de branche sauf `uniflow-we`, et `uniflow-backend/.env`
  n'a jamais été versionné. **La rotation n'est plus une hygiène, c'est une
  urgence** : purger l'historique ne suffit pas, la clé a été publique. Elle ne
  doit **jamais** revenir dans le `.env` des clients Flutter : Flutter embarque
  ce fichier en clair dans le binaire. Les commits qui l'en ont retirée ne
  doivent pas être annulés.
- **Les trois `.env` clients sont versionnés** (`uniflow-we`, `uniflow-mobile`,
  `uniflow-desktop`), contrairement à la règle du projet. Ceux des deux applis
  Flutter ne contiennent aujourd'hui que l'endpoint, l'identifiant de projet et
  les identifiants de buckets — rien de secret — mais un secret qui y serait
  recollé serait publié, et embarqué en clair dans le binaire. À sortir du
  versionnement, comme le fait déjà `uniflow-backend` (`.env` dans son
  `.gitignore`).
- **La plateforme Flutter est déclarée**, d'après le propriétaire (nom
  `uniflow mobile`, paquet `com.uniflow.kernelforge`), et les deux applis se
  connectent. **Non vérifié par cette session** : la clé serveur n'a pas les
  périmètres Console — `GET /projects/{id}` et `/platforms` répondent `401
  missing scope (projects.read)` et `(platforms.read)`. C'est une **déclaration
  du propriétaire**, pas un fait établi ; elle est néanmoins à retenir, car elle
  **élimine l'hypothèse « plateforme non déclarée »** dans la panne de
  messagerie mobile (§3).
- **Le mot de passe du compte ADMIN reste à changer.** Il était écrit en clair
  en valeur par défaut du `--dart-define=PASSWORD` de
  `uniflow-mobile/integration_test/messaging_probe_test.dart`, introduit par
  `1da592e` et poussé sur `origin/team-fronted-dev-mo`. Le commit `1217401` l'a
  **retiré du fichier** : les deux constantes n'ont plus de valeur par défaut et
  une garde en tête de test échoue avec la commande exacte à recopier. **Cela ne
  répare pas la fuite** : la valeur est toujours dans l'historique Git du dépôt,
  qui est public. **Le mot de passe doit être changé.** Toute sonde doit lire
  l'identifiant hors dépôt, jamais le contenir.
- **Les agents ne peuvent déclarer que `model: deepseek-v4-flash`.** Cette machine
  passe par une passerelle tierce (`ANTHROPIC_BASE_URL=https://agentrouter.org/`)
  qui ne sert qu'un seul modèle : `sonnet` → `403`, `haiku` → `403`, `inherit` →
  `403` (il retombe sur Sonnet au lieu d'hériter). C'est ce qui bloquait
  « faire tourner l'agent une première fois ». À repasser sur `sonnet` le jour où
  la passerelle servira des modèles Anthropic ; détail et message d'erreur dans
  `.claude/agents/README.md`.
- **La correction d'avatar du desktop est désormais commitée**, plus rien
  n'attend dans l'arbre de travail : `55fddff` porte le passage de
  `uniflow_avatars` à son identifiant `6aa81b840031e6a34dc3` dans
  `lib/utils/avatar.dart` (le nom renvoyait un 404 sur chaque photo), et il est
  poussé. Depuis, trois commits de marque et de commentaire l'ont suivi
  (`85706c5`, `c16fc23`, `9edc8ef`), également poussés. Les trois dépôts étaient
  **propres** le 2026-09-15 (revérifié : `git status --short` vide partout) — le
  point de vigilance précédent, qui annonçait une modification non commitée à ne
  pas perdre, est caduc.
- **`uniflow-desktop/assets/images/logo.png` est toujours versionné** (872 643
  octets), alors que `c16fc23` l'a retiré des assets embarqués et que le mobile a
  **supprimé** son équivalent. Il n'est plus livré dans le binaire, mais il reste
  dans le dépôt. Même sort à lui réserver que côté mobile.
- **Le contraste de l'écusson sur l'écran de connexion du desktop n'est pas
  tranché.** L'écusson détouré `#104090` est posé sans plaque de fond depuis
  `c16fc23`, dont le commentaire affirme qu'il « reste lisible » sur le voile de
  connexion. Mesuré en ΔE76 : 40,7 sur le marine de la sidebar `#151E32` (bien
  détaché), mais **3,6 au début du dégradé `#1E3A8A` et 9,9 à 14,3 à l'endroit
  réel du logo** — à la limite de la confusion. Le mobile, sur le même écusson,
  pose une plaque blanche explicite (`ColoredBox` blanc dans `login.dart` et
  `dashboard.dart`). **Desktop en pause : ne rien modifier**, c'est au
  propriétaire de trancher.
- **Trois scripts de déploiement publient encore une archive figée.** Le
  défaut corrigé dans `deploy-messaging-function.mjs` — publier
  `/tmp/uniflow-*.tar.gz` sans jamais le reconstruire — est **toujours présent**
  dans `deploy-forum-reactions-function.mjs`, `deploy-contact-messages-function.mjs`
  et `deploy-subscription-payments-function.mjs` (vérifié : aucun d'eux
  n'appelle `tar`, ils se contentent de `readFile(archivePath)`). Tant qu'ils ne
  sont pas corrigés, tout déploiement de ces trois Functions peut être annoncé
  « prêt » avec un nouvel identifiant **sans que le nouveau code soit publié**.
  C'est exactement le piège qui a fait croire deux fois que la messagerie était
  corrigée.
- **`users.level` n'accepte que `L1` dans le schéma.** `scripts/appwrite-schema.mjs`
  déclare `enumeration('level', ['L1'], false)` pourtant la filière ICT va de
  **Licence 1 à Licence 3**. Le serveur, lui, porte encore `level` comme
  `string` (les éléments d'énumération y survivent sans être appliqués) : un
  compte L2 ou L3 passe donc **aujourd'hui**, mais repasser
  `provision-appwrite-selfhosted.mjs` appliquerait l'énumération et rendrait
  L2/L3 impossibles. À traiter **avant** toute reprovision, pas après.
- **Trois comptes de sonde traînent sur le serveur** : `sondea20260915` et
  `sondeb20260915` (sonde d'aller-retour mobile) et `sonde20260915`, orphelin
  d'une vérification manuelle antérieure. Ils figurent aussi dans
  `academic_directory`, et la messagerie porte **2 conversations et 16 messages
  de test** (« Son texte … », `sonde-uniflow.png`…), dont un message orphelin
  laissé par chaque exécution de `test-messaging-attachment.mjs` : le script
  supprime bien ses deux comptes jetables et sa conversation, mais **pas** le
  message qu'il a écrit — constaté 15 → 16 après une exécution le 2026-09-15.
  Ces comptes sont à supprimer, et la sonde à corriger pour qu'elle nettoie
  aussi ses messages.
- **Divergence schéma / serveur, non traitée** : neuf attributs sont des `string`
  là où le schéma attend un `enum` — `users.accountType`, `users.role`,
  `users.level`, `contact_messages.status`, `attendance_records.verificationMethod`
  et `.proximityStatus`, `subscription_payment_requests.billingCycle`, `.currency`
  et `.status`. La sonde les signale `MANQUANT` ; rien n'est venu les corriger.
- **Trois collections attendues manquent toujours** (interrogées directement le
  2026-09-15) : `courses` (404), `enrollments` (404) et, pour le desktop,
  `academic_enrollments` (404). `subscription_plans`, elle, **existe** (13
  attributs) — c'est le seul des trois noms de `referencedCollections` qui soit
  provisionné. C'est `courses` qui fait planter la sonde : tant qu'elle manque,
  le contrôle des buckets, des identités et de la messagerie ne s'exécute pas.
- **Les buckets sont conformes au schéma** (relevé direct, la sonde n'y arrive
  pas) : `uniflow_assets` 10 485 760 octets, `6aa81b840031e6a34dc3`
  (« UniFlow Avatars ») 5 242 880, `uniflow_chat_files` 30 000 000 — soit
  exactement les plafonds de `bucketDefinitions`. Le plafond de 30 Mo des pièces
  jointes est bien celui de `_APP_STORAGE_LIMIT`.
- **`verify-appwrite-schema.mjs` ne va pas au bout.** Lancé le 2026-09-15, il
  s'arrête sur une exception à la collection `courses` (404) : `request()`
  (`appwrite-env.mjs:142`) lève sur tout statut non-OK, donc le garde
  `if (response.status === 404) return null` de `listCollection` ne s'applique
  jamais et la collection absente fait planter la sonde au lieu d'être listée. Le
  contrôle des buckets et tout ce qui suit ne sont donc pas exécutés. Il ne couvre
  par ailleurs que `schemas`, pas `academicSchemas` : **les collections
  académiques ne sont jamais vérifiées**, alors que le serveur en porte sept,
  correctement attributées (23 collections au total). D'ici là, ne pas conclure
  « tout est conforme » du code de sortie de cette sonde — et ne pas conclure
  non plus qu'elle est en échec : elle meurt avant d'avoir tout dit.
- **Les notifications ne sont pas de vraies push.** L'alerte est déclenchée par
  l'application, via le canal temps réel d'Appwrite. Elle n'arrive donc que si
  l'application est ouverte ou en arrière-plan récent. Une alerte application
  fermée exige un projet Firebase et le fichier `google-services.json`, que
  seul le propriétaire du projet peut créer.

---

## 3. Travail restant

Le détail, tâche par tâche, est dans `TRAVAUX-RESTANTS.md` (§8 pour les
sessions du 2026-09-21). Ici, l'essentiel.

### Priorité demandée par le propriétaire

La pause du desktop est **levée depuis le 2026-09-20** : les trois clients se
développent en parallèle. Priorité desktop : visioconférence embarquée hors
ligne et restriction par rôle (`CLAUDE.md`).

### En tête de liste (2026-09-21, 16:50)

- [x] ~~Faire cesser le trailer `Co-authored-by: Cursor`~~ — réglage
      désactivé, crochet `commit-msg`, **historique des trois `main` réécrit**
      (0 trailer) et hashs du journal convertis, 16:40.
- [ ] **Web, « vague 2 » de performance** (Lighthouse 32/39 avant) : service
      worker sans rechargement forcé à la première visite
      (`controllerchange` dans `pushNotificationService.ts`), régime du paquet
      (GSAP → framer-motion ou chargement différé, mascottes hors du paquet,
      Phosphor et textes légaux à la demande, `manualChunks`), logo LCP local
      et léger, polices auto-hébergées, `account.get()` silencieux pour les
      anonymes, libellé du bouton de menu et contrastes du pied de page.
      Rejouer Lighthouse après déploiement et consigner avant/après.
- [ ] **Publier la version de bureau** dès qu'un binaire existe : release
      GitHub `uniflow-apps`, puis `node scripts/set-app-release.mjs windows|linux|macos …`
      (ou Administration › Paramètres › Applications) — la page `/download`
      et la landing basculent seules.
- [ ] **Prochain APK signé avec la clé de release**, nommé
      `uniflow-<version>.apk`, notes prévenant qu'il faut désinstaller la 1.0.0
      (signature debug) ; publier par `set-app-release.mjs android --from <apk>`.
- [ ] **Web : `HashRouter` → `BrowserRouter`** (URLs propres, redirection des
      `#/…`, `vercel.json`, service worker) — après la vague 2.
- [ ] **Web : script `npm test` en CI GitHub Actions** (le dépôt n'a pas de
      workflow ; mobile et desktop en ont).
- [ ] **Remplacer les emplois du temps fictifs ICT4D L2 et L3 par les
      officiels** dès réception : éditer les deux entrées `provisional: true`
      de `scripts/data/fs-uy1-2026-2027.mjs`, puis
      `node scripts/seed-academic-reference-data.mjs --prune` (retire les
      séances devenues orphelines). Vérifier ensuite que l'étudiant L3 réel
      garde ses inscriptions.
- [ ] **Attendre la fin du chantier « jeu d'icônes »** (arbres sales à 12:06
      sur les trois dépôts) puis rejouer les trois suites et consigner les
      chiffres ; ceux du §2 datent d'avant ces modifications.
- [ ] **Éprouver la visioconférence desktop à deux machines** : hôte + un
      participant desktop + un participant navigateur par le lien
      `http://IP:port/join/CODE` ; vérifier que la **feuille de présence** se
      remplit (webhooks) et que les **exports PDF / Excel** sortent dans
      `Documents/UniFlow/Présences`. Le test live (`b4bbc00`) ne prouve que le
      poste seul.
- [ ] **Relire la cohérence des placements d'Archlord** entre web, mobile et
      desktop (le desktop a vérifié ses trois placements en trois tailles,
      `730bf1b` ; la relecture **croisée** reste à faire).
- [ ] **`IMAGES-UNIFLOW/README.md`** : décrire le dossier `badges/` (six
      médailles WebP + PNG + `originaux-generes/`), absent du README.
- [ ] **Mobile : `assets/brand/uniflow_logo_horizontal.png`** est encore le
      PNG du 15/09 (l'écusson, lui, est refait depuis le SVG par `b2236e9`) ;
      le rastériser depuis le vecteur comme le desktop (`3ba7bdd`).
- [x] ~~`TeacherCoursesPage.tsx`, onglet Devoirs~~ — fait par `cfa061b`.
- [x] ~~Rejouer `flutter test` desktop~~ — **585/585** à 12:00 (voir §2).
- [x] ~~Ouvrir le déploiement Vercel~~ — fait le 2026-09-21 à 05:15
      (`TRAVAUX-RESTANTS.md` §8, point 5).
- [x] ~~`.comptes-classe.local` dans le `.gitignore`~~ — `dbf4f97a`.

### Mobile

- [x] Messagerie (résolue et vérifiée sur appareil le 2026-09-15).
- [x] Écran d'inscription (`lib/screens/register.dart`, natif, miroir de
      `/register` du web + lien `url_launcher` vers la page web). Nuance : le
      propriétaire demandait un **renvoi** vers le web ; l'implémentation est
      native avec le web en secours — à lui de dire si cela lui convient.
- [x] Écrans morts (`presence.dart`, `library.dart`, `forum.dart`) réparés.
- [x] Refonte du design : Uni, onboarding, états d'erreur unifiés, palette,
      **authentification redessinée d'après la maquette** et **badges de
      réussite** (`11be25e`), icône et écran de lancement Android, bord à bord.
- [x] Inscription : entrée directe dans le tableau de bord, raccordement
      académique différé et rejoué à la connexion (`11be25e`).
- [x] Release Android signée (`android/key.properties` hors dépôt), R8,
      réduction des ressources (`7390c5b`) — **construite, pas installée** sur
      un téléphone à la connaissance du journal.
- [ ] **Valider sur un appareil réel, depuis la migration** : connexion au
      Cloud, inscription directe, messagerie, **hors ligne** (démarrage sans
      réseau, outbox, resynchronisation), bascule d'urgence, alertes temps réel
      et **notifications en release** (icône `ic_stat_uniflow`, `keep.xml`).
      Rien de tout cela n'a été rejoué sur téléphone depuis le 2026-09-15 (et
      le serveur a changé depuis).
- [ ] **Logotype horizontal net** depuis le SVG (voir « En tête de liste »).
- [ ] **Notifications pour les autres événements** : `notification-alerts`
      couvre absences/retards ; devoirs, notes et annonces — à vérifier côté
      mobile (le seed pose des notifications `ASSIGNMENT`, `SCHEDULE`,
      `SUBMISSION`, `ATTENDANCE` qui permettent de tester l'affichage).

### Web

- [x] `fix/avatar-bucket-et-roles` et `main` sont au même commit (`7a2f3fe`) ;
      Vercel déploie `main`. Plus rien à fusionner.
- [x] Inscription sans blocage sur une filière sans cours, `delete-self`
      complet, `test-registration-flow.mjs` (`9b9e608`).
- [x] Emplois du temps ICT4D L2/L3 en base — **fictifs, provisoires**
      (`7a2f3fe`) ; le remplacement est en tête de liste.
- [x] Hors ligne web (`9297327`), espace enseignant réel (`cfa061b`), profil et
      page Plateforme réels (`002fda8`, `31505cd`), bandeau « Aucun abonnement
      actif » réservé aux comptes `PERSONAL` (`7952f69`), logo vectorisé
      (`08f7df2`, `f6fbd24`).
- [x] Rôles gérés dans l'interface : `AdminUsersPage` crée les comptes avec
      leur rôle via `/admin-directory` (STUDENT, DELEGATE, TEACHER ; ADMIN
      réservé au `superadmin`).
- [x] Suite de tests unitaires : **162 tests** `node:test` (11:30, commande du
      README). Pas de script `npm test` — à ajouter pour que la CI puisse les
      lancer d'un coup.
- [x] Référentiel UY1 complet en base (12 filières, 312 UE dont 16 fictives,
      557 séances dont 30 fictives) et salle de classe ICT4D L1 de
      démonstration. Le JSON du propriétaire n'est jamais arrivé : le
      référentiel a été construit par `seed-academic-reference-data.mjs` — à
      faire relire par lui.
- [x] ~~`TeacherCoursesPage.tsx`, onglet Devoirs~~ — `cfa061b`.
- [ ] **Un script `npm test`** (`package.json` n'en a toujours pas) qui lance la
      commande `node --test` du README, et une CI (`uniflow-we` n'a pas de
      `.github/workflows/`).
- [ ] **Compte enseignant pour ICT103** (Dr. Atangana) : le cours a un
      `teacherName` mais un `teacherId` vide ; ses rendus n'auraient aucun
      lecteur côté enseignant.

### Desktop (pause levée le 2026-09-20)

- [x] Écran d'inscription (`register_screen.dart`, natif + lien web) — même
      nuance que côté mobile.
- [x] `academic_enrollments` provisionnée (73 documents).
- [x] Restriction par rôle et type de compte : `visibleDestinations` dans
      `lib/ui/app_shell.dart`, tableau de bord par rôle (`549fd81`).
- [x] `assets/images/logo.png` retiré du dépôt ; en-tête de `layout_test.dart`
      et `_sizes` cohérents (cinq largeurs).
- [x] Inscription : entrée directe dans `MainShell`, raccordement rejoué à la
      connexion, `academic_provisioning_retry_test.dart` (`dddf1a9`).
- [x] Refonte « planches » terminée et commitée (`ebd916b` → `b277dc6`) ;
      `flutter test` **585/585** rejoué par le journal le 2026-09-21 à 12:00.
- [x] **Visioconférence : feuille de présence** (modèle, webhooks LiveKit,
      exports PDF/Excel, panneau en direct), **salle ouverte à la création**,
      adresse LAN, page `/join/CODE`, **test live sur le poste**
      (`422d030` → `b4bbc00`). Code et preuve locale ; l'essai à deux machines
      reste à faire (« En tête de liste »).
- [ ] **Remontée des présences de visio vers `course_attendances`** :
      volontairement laissée de côté (ADR-001, `73b1e1e`) — attend le
      rattachement d'une réunion à une séance et une file hors ligne.
- [ ] **Gestion des devoirs côté enseignant** : l'ébauche
      (`academic_management_screens.dart`) n'a pas été revue depuis le 15/09.
- [ ] **Trancher le contraste de l'écusson** sur l'écran de connexion (ΔE76
      3,6 à 14,3 sur le dégradé) : décision du propriétaire, toujours pas prise
      — les PNG ont été refaits depuis le vecteur (`3ba7bdd`), pas la question
      de la plaque de fond.

### Outillage / agents

- [x] `CLAUDE.md` présente les quatre agents et la règle « un agent par dépôt ».
- [x] `verify-appwrite-schema.mjs` va au bout et rend « conforme » sur le Cloud.
- [ ] **Repasser les agents à `model: sonnet`** le jour où la passerelle servira
      des modèles Anthropic ; les quatre fichiers `.claude/agents/*.md` déclarent
      encore `deepseek-v4-flash`. Sous Cursor ce champ est ignoré : ne pas s'en
      inquiéter tant que l'on ne relance pas Claude Code.
- [ ] **Anciens scripts à réécrire ou supprimer** : `seed-uniflow-demo.mjs`,
      `normalize-appwrite-level-schema.mjs`, `provision-qr-test-delegate.mjs`,
      `reset-qr-test-passwords.mjs` (créent leur propre schéma ou visent
      d'anciens comptes) ; `run-uy1-e2e.mjs` et `test-forum-contact-functions.mjs`
      à confronter au routeur `uniflow-api`.

### Serveur / infrastructure

- [x] Tout ce qui concernait le serveur auto-hébergé (clé compromise, `.env`
      web, `deploy-*`, sondes, `users.level`, `enum`, collections manquantes,
      `_APP_STORAGE_LIMIT`, plateforme Flutter) est **clos par la migration** —
      `TRAVAUX-RESTANTS.md` §0.
- [x] `notification-alerts` redéployée le 2026-09-21 (déploiement
      `6ab0a5c8cb211352aab8`, `ready`).
- [x] `uniflow-api` redéployée deux fois le 2026-09-21 matin ; déploiement
      actif `6ab1030a5b6c713307a0` (`ready`, 10:12 UTC), lu sur le Cloud par le
      journal.
- [x] **`.comptes-classe.local` dans le `.gitignore`** (fait, commit `dbf4f97a`).
- [x] `appwrite-env.mjs` réessaie les 502/503/504 du CDN (`9b9e608`).
- [ ] **Compteur du seed trompeur derrière le CDN** (503 réessayé → 409 →
      « mis à jour ») : distinguer le cas dans `tally`, ou ne plus afficher de
      résumé créé / mis à jour.
- [ ] **Purger l'historique Git public** de l'ancienne clé (hygiène : elle
      n'ouvre plus qu'un serveur mort).
- [ ] **Vercel** : confirmer que les variables `VITE_APPWRITE_*` du projet
      pointent bien vers `fra.cloud.appwrite.io` (le tableau de bord n'a été vu
      qu'en local).
- [ ] **Pas de Firebase** : décision du propriétaire, les alertes application
      fermée ne sont pas au programme. Ne pas rouvrir.

---

## 4. Conventions du projet

- **Langue** : le propriétaire écrit en français, les échanges et les commits
  sont en français. Les commentaires de code expliquent **pourquoi**, pas quoi :
  chaque correction non évidente est accompagnée du symptôme observé.
- **Commits** : un commit par ensemble cohérent, message détaillé, **sans
  mention de co-auteur** (consigne du 2026-09-20). Pousser après chaque
  modification importante.
- **Tests** : toute correction de mise en page ou de logique ajoute un test. Le
  test de mise en page balaie chaque écran sur plusieurs largeurs et deux
  échelles de texte — **cinq** largeurs sur les deux clients Flutter
  (`test/layout_test.dart`, vérifié le 2026-09-21) — et échoue dès qu'un
  `RenderFlex` déborde.
- **Schéma Appwrite** : `uniflow-we/scripts/appwrite-schema.mjs` est la source
  unique. Toute modification passe par lui, puis par
  `node scripts/provision-appwrite-selfhosted.mjs` (idempotent).

---

## 5. Commandes utiles

```bash
# Provisionner ou réconcilier le schéma Appwrite
cd uniflow-we && node scripts/provision-appwrite-selfhosted.mjs

# Vérifier l'état réel du serveur
cd uniflow-we && node scripts/verify-appwrite-schema.mjs

# Repeupler les données académiques de démonstration (idempotent)
cd uniflow-we && node scripts/seed-academic-demo.mjs

# Référentiel UY1 (filières, salles, cours, emplois du temps) + inscriptions
# des apprenants de l'annuaire. --prune retire les séances devenues
# orphelines (à utiliser en remplaçant les emplois du temps fictifs L2/L3).
cd uniflow-we && node scripts/seed-academic-reference-data.mjs [--dry-run] [--prune]

# Inscription de bout en bout contre le Cloud (crée puis supprime un compte)
cd uniflow-we && node scripts/test-registration-flow.mjs

# Salle de classe ICT4D L1 de démonstration (idempotent ; --purge-qa supprime
# les comptes qa-*@example.invalid). Mots de passe écrits dans
# uniflow-backend/.comptes-classe.local — à garder hors Git.
cd uniflow-we && node scripts/seed-classroom.mjs

# Déployer une Function (les scripts deploy-*-function.mjs n'existent plus) :
cd uniflow-we && appwrite push function      # appwrite.config.json

# Tests
cd uniflow-we && node --test "functions/uniflow-api/src/**/*.test.js" "src/**/*.test.ts" "src/**/*.test.mjs" "scripts/**/*.test.mjs"   # 162 tests ; pas de `npm test`
cd uniflow-mobile   && flutter test && flutter analyze
cd uniflow-desktop  && flutter test

# Sonde réseau de la messagerie — SUR L'APPAREIL, pas `flutter test`.
# Les identifiants sont fournis au lancement : ils ne sont plus dans le fichier.
cd uniflow-mobile && flutter test integration_test/messaging_probe_test.dart \
  -d <appareil> --dart-define=EMAIL=<compte> --dart-define=PASSWORD=<mot de passe>

# Aller-retour complet entre DEUX comptes, pièce jointe comprise — l'épreuve
# qui a validé la messagerie sur appareil réel le 2026-09-15.
cd uniflow-mobile && flutter test integration_test/messaging_roundtrip_test.dart \
  -d <appareil> \
  --dart-define=EMAIL_A=<compte A> --dart-define=PASSWORD_A=<mot de passe> \
  --dart-define=EMAIL_B=<compte B> --dart-define=PASSWORD_B=<mot de passe>

# Chaîne d'envoi de pièce jointe côté serveur (comptes jetables qu'il crée
# puis supprime), à lancer depuis uniflow-we :
#   APPWRITE_SELF_HOSTED_API_KEY=<clé> node scripts/test-messaging-attachment.mjs
# La clé est celle de uniflow-backend/.env — la faire passer par
# l'environnement, jamais par un fichier versionné.
```
