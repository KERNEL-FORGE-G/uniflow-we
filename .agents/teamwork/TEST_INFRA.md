# E2E Test Infra: UniFlow Multi-plateforme

## Test Philosophy
- Opaque-box, requirement-driven. Dérivé des exigences officielles dans `ORIGINAL_REQUEST.md`.
- Méthodologie 4 Tiers :
  - **Tier 1 - Feature Coverage (≥5 par feature)** : Vérification isolée de chaque fonctionnalité (authentification, rôles, présences, Z-Library, assistant Groq, switch équipe).
  - **Tier 2 - Boundary & Corner Cases (≥5 par feature)** : Saisie hors ligne, formats d'écran extrêmes (320px, 420px, 1366px), réseau déconnecté/reconnecté, entrées vides.
  - **Tier 3 - Cross-Feature Combinations (couverture pairwise)** : Saisie libre d'apprenants + export PDF immédiat ; recherche Z-Library + mise en cache offline ; bascule switch équipe + filtre par pôle.
  - **Tier 4 - Real-World Application Scenarios** : Parcours complet enseignant indépendant (création session, émargement QR, export Excel) ; parcours étudiant autonome (consultation Z-Library hors-ligne, quête accomplie, question à l'assistant Groq).

## Feature Inventory & Couverture
| # | Feature | Exigence | Tier 1 | Tier 2 | Tier 3 |
|---|---------|----------|:------:|:------:|:------:|
| 1 | Navigation & 3 Rôles Autonomes | R1 | 5 | 5 | ✓ |
| 2 | Présences, QR offline & Exports PDF/Excel | R2 | 5 | 5 | ✓ |
| 3 | Recherche & Cache Z-Library Exclusif | R2 | 5 | 5 | ✓ |
| 4 | Assistant IA Groq Llama-3.3-70b | R2 | 5 | 5 | ✓ |
| 5 | Persistance Locale & Synchronisation Offline | R2 | 5 | 5 | ✓ |
| 6 | Nouveau Logo Hibou & Infini | R3 | 5 | 5 | ✓ |
| 7 | Galerie Équipe 10 Membres & Switch Réel ⟷ Anime | R3 | 5 | 5 | ✓ |
| 8 | Rendu 3D Sentinelle, Hero, Auth, Bibliothèque | R3 | 5 | 5 | ✓ |

## Test Runners & Commandes
- **Web2** :
  - Compilation : `pnpm run build` dans `independant/web2` (code 0)
  - Tests : `pnpm test` dans `independant/web2` (229/229 tests attendus)
- **Desktop** :
  - Analyse : `flutter analyze --no-fatal-infos` dans `independant/uniflow-desktop` (0 erreur)
  - Tests : `flutter test` dans `independant/uniflow-desktop` (850/850 tests attendus)
- **Mobile** :
  - Analyse : `flutter analyze --no-fatal-infos` dans `independant/uniflow-mobile` (0 erreur)
  - Tests : `flutter test` dans `independant/uniflow-mobile` (895/895 tests attendus)
- **Validation Globale E2E** :
  - Vérification intégrée des 3 clients et passage de tous les critères d'acceptation.
