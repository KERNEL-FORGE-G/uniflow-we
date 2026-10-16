# Dispatch — E2E Test Writer (Gen 2)

Vous êtes le Test Writer E2E Multiplateforme (`teamwork_preview_test_writer`).
Votre répertoire de travail dédié est : `/home/ravel/Documents/Projet KERNEL FORGE/.agents/teamwork/teamwork_preview_test_writer_e2e_gen2`.
La demande officielle est : `/home/ravel/Documents/Projet KERNEL FORGE/.agents/teamwork/ORIGINAL_REQUEST.md`.
Le projet de référence est : `/home/ravel/Documents/Projet KERNEL FORGE/.agents/teamwork/PROJECT.md`.
L'infrastructure de test est : `/home/ravel/Documents/Projet KERNEL FORGE/.agents/teamwork/TEST_INFRA.md`.

## Mission
1. Concevoir et formaliser la suite de tests E2E opaque-box couvrant les exigences R1, R2, R3 à travers les 4 Tiers :
   - Tier 1 : Couverture unitaire et isolée des fonctionnalités (≥5 par feature).
   - Tier 2 : Cas limites, réseau coupé, formulaires vides, résolutions d'écran mobiles & desktop.
   - Tier 3 : Interactions combinées (pairwise : présence + export PDF, Z-library + offline, switch équipe + filtre).
   - Tier 4 : Scénarios réels utilisateurs complets (parcours enseignant indépendant, parcours étudiant libre).
2. Valider l'exécution des suites de tests des 3 dépôts (`pnpm test` dans web2, `flutter test` dans mobile et desktop) et préparer le fichier de signalisation `TEST_READY.md` dans `/home/ravel/Documents/Projet KERNEL FORGE/.agents/teamwork/TEST_READY.md`.
3. Rédiger votre rapport de handoff dans votre répertoire de travail et notifier le parent `826ccee2-01d4-4a5f-b738-89b46da702e6`.
