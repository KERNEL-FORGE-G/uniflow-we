# Dispatch — Worker M3 Mobile (Gen 2)

Vous êtes le Worker d'implémentation Mobile Flutter (`teamwork_preview_worker`).
Votre répertoire de travail dédié est : `/home/ravel/Documents/Projet KERNEL FORGE/.agents/teamwork/teamwork_preview_worker_m3_mobile_gen2`.
La demande officielle est : `/home/ravel/Documents/Projet KERNEL FORGE/.agents/teamwork/ORIGINAL_REQUEST.md`.
Le projet de référence est : `/home/ravel/Documents/Projet KERNEL FORGE/.agents/teamwork/PROJECT.md`.
Le rapport d'exploration est : `/home/ravel/Documents/Projet KERNEL FORGE/.agents/teamwork/teamwork_preview_explorer_survey_mobile_2/handoff.md`.

## Avertissement d'Intégrité Obligatoire
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

## Périmètre exclusif d'écriture (Write Ownership)
Vous avez l'exclusivité d'écriture sur le dépôt Mobile : `/home/ravel/Documents/Projet KERNEL FORGE/independant/uniflow-mobile/`.
Interdiction formelle de modifier les fichiers des dépôts web ou desktop.

## Tâches d'implémentation (Résolution des 62 tests en échec)
1. **Fix 1 (Débordement badge auth : résout 34 tests)** :
   - Dans `lib/widgets/auth_widgets.dart:117` : Envelopper le `Row` du badge technologique dans un `FittedBox(fit: BoxFit.scaleDown, child: Row(...))` et remplacer `Icon(Icons.verified_outlined, ...)` par `PhosphorIcon(PhosphorIconsBold.sealCheck, ...)`.
2. **Fix 2 (Rôle `personal` : résout `user_role_test.dart`)** :
   - Dans `lib/models/user_role.dart:104` (ou ligne correspondante) : Remplacer le retour erroné `UniFlowRole.student` par `UniFlowRole.personal` lorsque `accountType == 'PERSONAL'`.
3. **Fix 3 (Barre système : résout `system_ui_test.dart`)** :
   - Dans `lib/theme/app_theme.dart:40` (`AppSystemUi.surBleu`) : Configurer `systemNavigationBarIconBrightness: Brightness.dark`.
4. **Fix 4 (Retour prédictif : résout `android_natif_test.dart`)** :
   - Dans `lib/widgets/app_shell.dart:112` : Ne pas bloquer le pop (`canPop: true`) pour respecter le retour prédictif Android natif.
5. **Fix 5 (Mock dotenv : résout 10 tests de `uni_dock_test.dart`)** :
   - Dans `test/layout_test_support.dart` (ou `test/uni_dock_test.dart`) : Initialiser le mock dotenv avec `dotenv.testLoad(fileContent: 'APPWRITE_DATABASE_ID=uniflow\nAPPWRITE_ENDPOINT=https://fra.cloud.appwrite.io/v1\n');`.
6. **Fix 6 (Icônes Phosphor : résout `uni_icons_test.dart`)** :
   - Remplacer les 26 icônes Material résiduelles (`Icons.xxx`) par des `PhosphorIconsBold` / `PhosphorIconsRegular` dans `lib/screens/quests.dart`, `lib/screens/messages.dart`, `lib/screens/conversation.dart`, `lib/screens/badges.dart`, `lib/widgets/gamification/badge_highlight_widget.dart`, `lib/widgets/timetable_scan_sheet.dart`, `lib/widgets/app_shell.dart`.
7. **Vérification finale** :
   - Lancer `flutter analyze --no-fatal-infos` dans `independant/uniflow-mobile` (doit renvoyer **0 erreur**).
   - Lancer `flutter test` dans `independant/uniflow-mobile` (100% des tests doivent passer, 895/895).
   - Documenter les commandes et résultats dans votre rapport `handoff.md`.
8. **Règles Git & Qualité** :
   - Aucun secret en clair, aucun trailer `Co-authored-by`.

À la fin de vos travaux, rédigez `handoff.md` dans votre dossier et envoyez un message au parent `826ccee2-01d4-4a5f-b738-89b46da702e6`.
