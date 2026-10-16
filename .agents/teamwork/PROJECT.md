# Project: UniFlow — Refonte & Harmonisation Globale

## Architecture
Le projet UniFlow est composé de trois clients applicatifs autonomes et indépendants partageant le backend Appwrite Cloud (région Francfort) et une architecture Offline-First :
1. **Web2** (`independant/web2`) : Application web React 18, Vite 6, TypeScript 5.7, Tailwind 4, TanStack Query 5.
2. **Mobile** (`independant/uniflow-mobile`) : Application mobile Flutter Android, Drift SQLite, Riverpod, architecture offline-first.
3. **Desktop** (`independant/uniflow-desktop`) : Application desktop Flutter (Linux/macOS/Windows), LiveKit WebRTC embarqué, exports PDF/Excel natifs.

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | R1-Web2: 3 Rôles Autonomes | Navigation & dashboards adaptés (Étudiant, Délégué, Enseignant) sans contrainte universitaire | M1_WEB2 | Survey |
| 2 | R2-Web2: Présences & Exports | Saisie libre d'apprenants, QR code dynamique offline, exports PDF/Excel | M1_WEB2 | Survey |
| 3 | R2-Web2: Z-Library & Cache | Moteur Z-Library exclusif avec mise en cache permanente Appwrite Storage | M1_WEB2 | Survey |
| 4 | R2-Web2: Groq Assistant | Assistant Uni Groq Llama-3.3-70b avec repli Appwrite Cloud | M1_WEB2 | Survey |
| 5 | R2-Web2: Offline-First | Persistance TanStack Query IndexedDB et file de rejeu `writeQueue` | M1_WEB2 | Survey |
| 6 | R3-Web2: Assets & Switch Équipe | Logo hibou/infini, galerie 10 membres avec switch interactif réel ⟷ anime et fix mapping Aliyatou/Judith | M1_WEB2 | Survey |
| 7 | Q-Web2: Build & Tests 100% | Résolution dépendance `esbuild` dans devDependencies pour 229/229 tests passés | M1_WEB2 | Survey |
| 8 | R1-Desktop: 3 Rôles Autonomes | Navigation latérale `AppSidebar` repliable et profils autonomes sans université requise | M2_DESKTOP | Survey |
| 9 | R2-Desktop: Visioconférence LiveKit & Présences | LiveKit local, feuille de présence et exports PDF/Excel immédiats | M2_DESKTOP | Survey |
| 10 | R2-Desktop: Z-Library & Assistant Groq | Moteur Z-Library exclusif avec cache Appwrite et assistant Groq avec repli hors-ligne | M2_DESKTOP | Survey |
| 11 | R3-Desktop: Assets & Switch Équipe | Logo hibou/infini, commutateur interactif 10 membres réel ⟷ anime, illustrations 3D | M2_DESKTOP | Survey |
| 12 | Q-Desktop: Tests 100% (21 fix) | Résolution des 21 tests (overflow team switch 420px, texte onboarding, virgule dashboard, overflow quêtes) | M2_DESKTOP | Survey |
| 13 | R1-Mobile: 3 Rôles Autonomes | Support complet des 3 profils autonomes dans `user_role.dart` et `dashboard.dart` | M3_MOBILE | Survey |
| 14 | R2-Mobile: Présences & Exports | Module de présences autonome avec saisie libre, QR hors-ligne et exports PDF/Excel | M3_MOBILE | Survey |
| 15 | R2-Mobile: Z-Library & Groq | Unification Z-Library exclusif avec cache Appwrite et client Groq Llama-3.3-70b avec repli | M3_MOBILE | Survey |
| 16 | R2-Mobile: Offline-First Drift | Validation de la base Drift SQLite et file de synchronisation outbox | M3_MOBILE | Survey |
| 17 | R3-Mobile: Assets & Switch Équipe | Logo hibou/infini, switch interactif photos réelles ⟷ avatars anime 10 membres validé | M3_MOBILE | Survey |
| 18 | Q-Mobile: Tests 100% (62 fix) | Résolution des 62 tests (FittedBox auth badge, rôle `personal`, 26 icônes Phosphor, navbar, dotenv mock) | M3_MOBILE | Survey |
| 19 | Final E2E: Validation Multiplateforme | Vérification intégrée de tous les critères d'acceptation et flux fonctionnels clés | M4_FINAL | Survey |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 1 | M1_WEB2 | Correction `esbuild`, mapping avatars Aliyatou/Judith, 3D dashboards, tests 100% | none | PLANNED |
| 2 | M2_DESKTOP | Correction des 21 tests (overflows, assertions onboarding, prénom virgule, quêtes), validation 100% | none | PLANNED |
| 3 | M3_MOBILE | Correction des 62 tests (FittedBox badge, rôle personal, 26 Phosphor icons, navbar, dotenv), enrichissement présences & Groq | none | PLANNED |
| 4 | M4_FINAL | Validation complète de bout en bout, tests E2E multiplateformes et vérification des critères d'acceptation | M1_WEB2, M2_DESKTOP, M3_MOBILE | PLANNED |

## Interface Contracts
### Web2 ↔ Appwrite Backend
- Endpoint : `https://fra.cloud.appwrite.io/v1`
- Bucket : `uniflow_assets` (fichiers mis en cache avec permissions de lecture publique)
- Collection `team_members` : 10 membres avec slugs, rôles, tags et `avatarFileId`
- Switch mode : booléen local `useAvatars` dans `TeamsPage.tsx` basculant entre `/team/<slug>.jpg` et `/team/avatar_<slug>_anime.jpg`

### Desktop ↔ Mobile ↔ Appwrite
- Modèle de rôle : `UniFlowRole` (`student`, `delegate`, `teacher`, `admin`, `personal`)
- Modèle d'équipe : `TeamMember` (10 membres identiques aux 3 plateformes)
- Switch mode : commutateur interactif instantané Réel ⟷ Anime avec assets locaux et fallback Appwrite Storage

## Code Layout
- Web2 : `/home/ravel/Documents/Projet KERNEL FORGE/independant/web2`
- Desktop : `/home/ravel/Documents/Projet KERNEL FORGE/independant/uniflow-desktop`
- Mobile : `/home/ravel/Documents/Projet KERNEL FORGE/independant/uniflow-mobile`
- Assets partagés : `public/logos/`, `public/team/`, `assets/brand/`, `assets/team/`, `assets/illustrations/`
