# Dispatch — Worker M1 Web2

Vous êtes le Worker d'implémentation Web2 (`teamwork_preview_worker`).
Votre répertoire de travail dédié est : `/home/ravel/Documents/Projet KERNEL FORGE/.agents/teamwork/teamwork_preview_worker_m1_web2`.
La demande officielle est : `/home/ravel/Documents/Projet KERNEL FORGE/.agents/teamwork/ORIGINAL_REQUEST.md`.
Le projet de référence est : `/home/ravel/Documents/Projet KERNEL FORGE/.agents/teamwork/PROJECT.md`.
Le rapport d'exploration est : `/home/ravel/Documents/Projet KERNEL FORGE/.agents/teamwork/teamwork_preview_explorer_survey_web2_2/handoff.md`.

## Avertissement d'Intégrité Obligatoire
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

## Périmètre exclusif d'écriture (Write Ownership)
Vous avez l'exclusivité d'écriture sur le dépôt Web2 : `/home/ravel/Documents/Projet KERNEL FORGE/independant/web2/`.
Interdiction formelle de modifier les fichiers des dépôts mobile ou desktop.

## Tâches d'implémentation
1. **Fix 1 (Tests & Dépendance esbuild)** :
   - Ajouter `"esbuild": "^0.25.0"` dans `devDependencies` de `/home/ravel/Documents/Projet KERNEL FORGE/independant/web2/package.json`.
   - Exécuter `pnpm install` dans `independant/web2`.
   - Exécuter `pnpm test` et s'assurer que 100% des tests passent (229/229).
2. **Fix 2 (Avatars R3)** :
   - Dans `src/components/team/TeamMemberAvatar.tsx` (lignes 48-49), corriger le mapping de `LOCAL_MASCOT_FALLBACKS` pour pointer vers les avatars anime existants :
     - `'aliyatou rachid oumou tourab': '/team/avatar_aliya_anime.jpg'`
     - `'mandeng judith oceanne': '/team/avatar_judith_anime.jpg'`
3. **Fix 3 (Images Dashboards R3)** :
   - Dans `src/pages/DashboardPage.tsx` et `src/pages/DashboardCompactPage.tsx`, remplacer les chemins d'illustrations résiduels inexistants par les illustrations 3D réelles présentes dans `/illustrations/` (`schedule.jpg`, `grades.jpg`, `presence.jpg`, `library.jpg`).
4. **Vérification finale** :
   - Lancer `pnpm run build` dans `independant/web2` et vérifier que le build compile avec **0 erreur**.
   - Lancer `pnpm test` et documenter les commandes et résultats dans votre rapport `handoff.md`.
5. **Règles Git & Qualité** :
   - Aucun secret ni clé API en clair.
   - Aucun trailer `Co-authored-by` dans les commits Git.

À la fin de vos travaux, rédigez `handoff.md` dans votre dossier et envoyez un message au parent `826ccee2-01d4-4a5f-b738-89b46da702e6`.


## 2026-10-13T11:46:40Z

Vous êtes le Worker d'implémentation Web2 (M1_WEB2). Votre répertoire de travail est /home/ravel/Documents/Projet KERNEL FORGE/.agents/teamwork/teamwork_preview_worker_m1_web2. Lisez impérativement /home/ravel/Documents/Projet KERNEL FORGE/.agents/teamwork/ORIGINAL_REQUEST.md et /home/ravel/Documents/Projet KERNEL FORGE/.agents/teamwork/teamwork_preview_worker_m1_web2/DISPATCH.md.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Votre périmètre d'écriture exclusif est independant/web2.
Exécutez les fix (esbuild devDependencies, mapping avatars Aliyatou/Judith dans TeamMemberAvatar.tsx, chemins 3D dashboard), vérifiez pnpm run build (0 erreur) et pnpm test (100% succès). Rédigez handoff.md et notifiez le parent 826ccee2-01d4-4a5f-b738-89b46da702e6.
