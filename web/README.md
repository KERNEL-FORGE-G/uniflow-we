# UniFlow Web

Application web d'UniFlow (PWA installable, utilisable hors connexion) et
**dépôt de référence du backend Appwrite** : le schéma, les Functions et les
scripts de provisionnement des trois clients vivent ici.

- Production : https://uniflow.kernelforge.codes (Vercel)
- Backend : Appwrite Cloud, projet `uniflow`, région Francfort

## Sommaire

1. [Fonctionnalités](#fonctionnalités)
2. [Installation](#installation)
3. [Configuration](#configuration)
4. [Backend Appwrite](#backend-appwrite)
5. [Scripts](#scripts)
6. [Tests](#tests)
7. [Organisation du dépôt](#organisation-du-dépôt)

## Fonctionnalités

| Espace | Pages |
| --- | --- |
| Public | Accueil, présentation, tarifs, à propos, contact, aide, pages SEO (présence QR, emploi du temps, gestion universitaire) |
| Authentification | Connexion et inscription **universitaire** (université, filière, niveau L1–L3) ou **indépendante**, mot de passe oublié |
| Étudiant / délégué | Tableau de bord, emploi du temps, cours et détail de cours, notes et relevé, devoirs (rendu de fichiers, quiz), bibliothèque, présence QR (scan), forum, messagerie, notifications, équipes, visioconférence |
| Enseignant | Mes cours, saisie et publication des notes, création de devoirs, appel (émission du QR, liste, justificatifs) |
| Administration | Annuaire (création, modification, suppression de comptes), structure académique, salles, abonnements, équipe KERNEL FORGE |
| Indépendant | Espace de travail personnel (matières, tâches, documents, agenda) |
| Compte | Profil, photo de profil, paramètres, notifications temps réel (Appwrite Realtime, sans Firebase) |

### Design

Thème **clean premium UniFlow** (refonte 2026-10) :

- **Palette** : fond `#F0F7FF` (blanc-bleu pâle), accents bleu `#1E3A8A` et teal `#0D9488`
- **Cartes** : arrondies `16 px`, ombre `rgba(30,58,138,0.08)` bleue douce
- **Logos** : SVG vectorisés (wordmark + emblem) servis depuis `/logos/`. Les PNG racine (`logo_1.png`, `logo.png`…) sont des doublons conservés pour compatibilité ascendante ; les fallbacks d'avatar pointent tous vers `/logos/logo_1.png`
- **Mascotte Uni** : poses `.webp` importées via `@/assets/mascot/`, `UniMascot` + `ArchlordMascot` avec dialogues contextuels et transitions CSS `cubic-bezier`
- **Notifications push** : Appwrite Realtime (temps réel quand l'onglet est ouvert) ; aucun Firebase côté web (retiré intentionnellement)
- **Images orphelines** : `landing.png`, `Image 1.png`, `mascotte.png` à la racine de `/public/` sont des résidus ; ne pas y référencer de nouveau code

## Installation

Prérequis : Node.js 22 ou plus récent, pnpm (`corepack enable`).

```bash
pnpm install
cp .env.example .env      # valeurs publiques d'Appwrite Cloud, déjà renseignées
pnpm dev                   # http://localhost:3000
pnpm build                 # tsc -b && vite build → dist/
```

## Configuration

`.env` n'est **pas versionné** (il a contenu un jeton serveur par le passé).
`.env.example` contient les valeurs publiques attendues :

```env
VITE_APPWRITE_ENDPOINT=https://fra.cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=uniflow
VITE_APPWRITE_DATABASE_ID=uniflow
VITE_APPWRITE_STORAGE_BUCKET_ID=uniflow_assets
VITE_APPWRITE_AVATAR_BUCKET_ID=uniflow_assets
VITE_APPWRITE_API_FUNCTION_ID=uniflow-api
VITE_APP_URL=https://uniflow.kernelforge.codes
```

Les scripts (`scripts/*.mjs`) lisent en plus une clé serveur depuis
`../uniflow-backend/.env` (`APPWRITE_API_KEY`) ou depuis l'environnement
(`APPWRITE_SELF_HOSTED_API_KEY`). Cette clé ne doit jamais entrer dans un
fichier versionné.

## Backend Appwrite

L'offre gratuite d'Appwrite Cloud impose une base, un bucket et deux Functions.
Le projet est donc organisé ainsi :

- **Base `uniflow`** — une trentaine de collections : `users`,
  `academic_courses`, `academic_schedules`, `academic_grades`,
  `academic_assignments`, `academic_submissions`, `academic_library`,
  `academic_directory`, `academic_enrollments`, `attendance_sessions`,
  `attendance_records`, `conversations`, `messages`, `forum_*`,
  `notifications`, `team_members`, `subscription_*`, `personal_*`,
  `app_releases` (liens de téléchargement des applications, un document par
  plateforme, `$id` = `android` | `windows` | `linux` | `macos`)…
  Tout est déclaré dans `scripts/appwrite-schema.mjs`.
- **Bucket `uniflow_assets`** — documents, photos de profil et pièces jointes ;
  les droits sont posés fichier par fichier (`read("any")` pour un logo ou un
  avatar, `read("user:…")` pour une pièce jointe).
- **Function `uniflow-api`** (`functions/uniflow-api/`) — routeur HTTP : le
  chemin de la requête choisit le service (`/academic-grades`,
  `/academic-registration`, `/account`, `/admin-directory`, `/app-releases`,
  `/assistant`, `/attendance-secure`, `/contact-messages`, `/forum-reactions`,
  `/messaging`, `/metrics`, `/public-stats`, `/subscription-payments`,
  `/team-roster`). Chaque service vérifie le rôle de l'appelant côté serveur.
  - `/app-releases` : `list` (public, releases publiées ; toutes pour le
    superadmin avec `all: true`) et `upsert` (label `superadmin` uniquement).
    C'est ce qui alimente le bouton « Télécharger pour Android (APK) » de la
    page d'accueil et la carte « Applications à télécharger » de
    Administration → Paramètres.
- **Function `notification-alerts`** — déclenchée par les événements de la
  base, crée les notifications.

Déploiement des Functions (Appwrite CLI connecté au projet) :

```bash
appwrite push function          # lit appwrite.config.json
```

## Scripts

| Commande | Effet |
| --- | --- |
| `node scripts/provision-appwrite-selfhosted.mjs` | Crée ou réconcilie base, collections, attributs, index et bucket depuis le schéma. Idempotent. |
| `node scripts/verify-appwrite-schema.mjs` | Compare le serveur au schéma et signale toute divergence. |
| `node scripts/seed-accounts.mjs` | Crée un compte par rôle (ADMIN, administration, enseignant, délégué, étudiants L1/L2) et un compte indépendant ; mots de passe dans `../uniflow-backend/.comptes-demo.local`. |
| `node scripts/seed-academic-demo.mjs` | Cours, emploi du temps, notes, bibliothèque et devoirs de démonstration pour les étudiants ICT4D existants. |
| `node scripts/seed-academic-reference-data.mjs [--dry-run] [--prune]` | Référentiel UY1 / Faculté des Sciences : filières, salles, cours et emplois du temps du semestre (`scripts/data/fs-uy1-2026-2027.mjs`), puis inscription des apprenants de l'annuaire à leurs cours. ICT4D L2 et L3 y sont **fictifs et provisoires** (`provisional: true`) jusqu'à l'emploi du temps officiel. |
| `node scripts/seed-team-members.mjs` | Les dix membres de l'équipe KERNEL FORGE (page Équipe) ; rapproche par `slug` les membres saisis depuis Réglages > Équipe. |
| `node scripts/upload-public-appwrite-assets.mjs` | Téléverse le logo public (`assets/brand/`). |
| `node scripts/set-app-release.mjs android --url … --version … [--file …] [--size …] [--sha256 …] [--notes …]` | Publie ou met à jour le lien de téléchargement d'une plateforme (`android`, `windows`, `linux`, `macos`) dans `app_releases`, avec la clé serveur. `--size` accepte des octets ou « 42,3 Mo » ; `--from <fichier local>` calcule nom, taille et SHA-256 ; `--disable` enregistre sans publier ; `--dry-run` n'écrit rien. Équivalent en ligne de commande de la carte « Applications à télécharger ». |
| `node scripts/build-store-msix.mjs` | Fabrique le paquet Microsoft Store de la PWA (produit **UNIFLOW WEB**) : `.msixbundle` + `.classic.appxbundle` dans `dist/msix/`, puis relit l'identité gravée dans l'`AppxManifest.xml`. Voir `docs/deploiement/MICROSOFT_STORE.md` et l'identité à utiliser plus bas. |
| `node scripts/test-team-roster-function.mjs` | Test de bout en bout du service Équipe (droits, photos, suppression). |
| `node scripts/test-app-releases-function.mjs` | Service `/app-releases` contre la Function déployée : `list` public, `upsert` refusé sans label `superadmin` (401/403), validation, upsert sans doublon ; laisse la collection vide. |
| `node scripts/test-attendance-secure-function.mjs` | Émission, scan et audit d'une session de présence QR. |
| `node scripts/test-messaging-attachment.mjs` | Pièce jointe de messagerie : droits par fichier. |
| `node scripts/test-registration-flow.mjs` | Inscription de bout en bout avec les droits d'un client : filière avec et sans cours publiés, idempotence, puis suppression du compte par `delete-self`. |
| `pnpm test:e2e:uy1` | Parcours complet UY1 : inscription, appel, notes, relevé. |

### Identité Microsoft Store de la version web

Les trois valeurs ci-dessous viennent de l'Espace partenaires (Produits › *UNIFLOW
WEB* › View app identity details), sont sensibles à la casse et sont gravées dans
le paquet : un écart d'un caractère fait rejeter le téléversement. Ce ne sont pas
des secrets — le `Publisher ID` figure au manifeste `AppxManifest.xml` de
l'application.

```bash
node scripts/build-store-msix.mjs \
  --package-id "UniFlow.KernelForge" \
  --publisher-id "CN=3a54a224-05dd-42aa-85bd-3f3c1478fdca" \
  --publisher-display "KERNEL FORGE"
```

| Valeur | Gravée comme | Remarque |
| --- | --- | --- |
| `UniFlow.KernelForge` | `Identity Name` | **sans** le suffixe de 13 caractères, qui est le *package family name* |
| `CN=3a54a224-05dd-42aa-85bd-3f3c1478fdca` | `Identity Publisher` | le service relit `CN=…, OID.2.25.…=1` : la clause `OID` est ajoutée par lui, pas par nous |
| `KERNEL FORGE` | `PublisherDisplayName` | |

Sans `--package-id` et `--publisher-id` le script s'arrête avant d'appeler le
service ; les valeurs peuvent aussi venir de `STORE_PACKAGE_ID` et
`STORE_PUBLISHER_ID`. Le paquet obtenu porte la version `1.0.1.0` (le quatrième
segment est réservé au Store, qui le remplace à la certification).

## Tests

```bash
pnpm typecheck                                   # TypeScript strict
node --test "functions/uniflow-api/src/**/*.test.js" "src/**/*.test.ts" "src/**/*.test.mjs" "scripts/**/*.test.mjs"
```

Les tests unitaires (services des Functions, modèles du front, données du
référentiel) s'exécutent avec `node --test` ; les scripts `test-*.mjs` sont des
tests de bout en bout contre Appwrite Cloud (clé serveur requise).
Toute correction de logique ou de mise en page s'accompagne d'un test.

## Organisation du dépôt

```
uniflow-we/
├── src/                 pages, composants, hooks, lib/appwrite.ts (accès Appwrite)
├── public/              PWA (manifest, sw.js), logos, pages SEO statiques
├── functions/           Functions Appwrite : uniflow-api (routeur + services), notification-alerts
├── scripts/             schéma, provisionnement, seeds, tests de bout en bout, outils
├── assets/brand/        logo source
├── docs/
│   ├── technique/       diagnostics Appwrite, persistance de session IndexedDB
│   ├── deploiement/     Vercel, Microsoft Store (PWA empaquetée)
│   ├── audits/          audits et validations datés (sécurité, e2e, médias…)
│   ├── seo/             recherches et plan SEO
│   ├── communication/   fiche Devpost
│   ├── historique/      suivi des améliorations
│   └── legacy/          spécifications et schémas SQL de l'ancien backend
├── appwrite.config.json configuration Appwrite CLI (projet uniflow, région fra)
└── vercel.json          en-têtes et réécritures de production
```
