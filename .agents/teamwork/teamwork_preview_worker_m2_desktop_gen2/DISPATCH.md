# Dispatch — Worker M2 Desktop (Gen 2)

Vous êtes le Worker d'implémentation Desktop Flutter (`teamwork_preview_worker`).
Votre répertoire de travail dédié est : `/home/ravel/Documents/Projet KERNEL FORGE/.agents/teamwork/teamwork_preview_worker_m2_desktop_gen2`.
La demande officielle est : `/home/ravel/Documents/Projet KERNEL FORGE/.agents/teamwork/ORIGINAL_REQUEST.md`.
Le projet de référence est : `/home/ravel/Documents/Projet KERNEL FORGE/.agents/teamwork/PROJECT.md`.
Le rapport d'exploration est : `/home/ravel/Documents/Projet KERNEL FORGE/.agents/teamwork/teamwork_preview_explorer_survey_desktop_2/handoff.md`.

## Avertissement d'Intégrité Obligatoire
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

## Périmètre exclusif d'écriture (Write Ownership)
Vous avez l'exclusivité d'écriture sur le dépôt Desktop : `/home/ravel/Documents/Projet KERNEL FORGE/independant/uniflow-desktop/`.
Interdiction formelle de modifier les fichiers des dépôts web ou mobile.

## Tâches d'implémentation (Résolution des 21 tests en échec)
1. **Fix 1 (Écran Équipe & Débordement 420px)** :
   - Dans `lib/screens/teams_screen.dart` :
     - Pour `test/team_test.dart:217` : S'assurer que le mode d'affichage initial respecte les membres sans photo (silhouette neutre quand avatarFileId est vide).
     - Pour `test/layout_test.dart:113` : Dans le Row du commutateur Réel/Anime, envelopper le texte ou le bouton dans `Flexible` avec `TextOverflow.ellipsis` ou `FittedBox` pour éviter l'overflow de 87px en 420×620 et facteur d'agrandissement 1.3x.
2. **Fix 2 (Libellés Onboarding)** :
   - Dans `test/onboarding_screen_test.dart` (lignes 33 et 54) : Synchroniser les assertions de test avec les libellés autonomes réels de `lib/screens/onboarding_screen.dart` (`'Votre apprentissage,\nvotre maîtrise'` et `'Créez et organisez\nvos cours'`).
3. **Fix 3 (Dashboard Name Fallback)** :
   - Dans `lib/screens/dashboard_screen.dart:286` : Nettoyer `firstName` pour éviter la virgule orpheline quand `user?.name` est vide (`final rawName = (user?.name ?? '').trim(); final firstName = rawName.isNotEmpty ? rawName.split(' ').first : 'vous';`).
   - Ajuster `test/dashboard_test.dart:219` si nécessaire pour cibler précisément l'en-tête.
4. **Fix 4 (Débordement Quêtes dans la coquille)** :
   - Dans `lib/screens/gamification_screens.dart:1607` (`QuestsDesktopScreen`) : Remplacer le `Row` d'en-tête non contraint par un `Wrap(spacing: 8, runSpacing: 4, ...)` ou un `Flexible` avec `TextOverflow.ellipsis` pour éliminer le débordement de 307px à 1024×700.
5. **Vérification finale** :
   - Lancer `flutter analyze --no-fatal-infos` dans `independant/uniflow-desktop` (doit renvoyer **0 erreur**).
   - Lancer `flutter test` dans `independant/uniflow-desktop` (100% des tests doivent passer, 850/850).
   - Documenter les commandes et résultats dans votre rapport `handoff.md`.
6. **Règles Git & Qualité** :
   - Aucun secret en clair, aucun trailer `Co-authored-by`.

À la fin de vos travaux, rédigez `handoff.md` dans votre dossier et envoyez un message au parent `826ccee2-01d4-4a5f-b738-89b46da702e6`.
