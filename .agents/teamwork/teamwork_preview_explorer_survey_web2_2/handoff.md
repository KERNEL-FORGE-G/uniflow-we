# Handoff Report — Survey & Vérification Web2 (`independant/web2`)

**Auteur** : teamwork_preview_explorer_survey_web2_2 (Agent Explorateur Web2 UniFlow)  
**Date** : 2026-10-13T11:40:00Z  
**Type** : Hard handoff (Mission d'exploration et de vérification achevée)  
**Destinataire** : Orchestrateur (`826ccee2-01d4-4a5f-b738-89b46da702e6`)

---

## 1. Observation

### 1.1 Compilation et Build (`pnpm run build`)
- **Commande exécutée** : `pnpm run build` dans `/home/ravel/Documents/Projet KERNEL FORGE/independant/web2`
- **Résultat** : Code de sortie **0**, 0 erreur de compilation TypeScript ou Vite.
- **Délai** : 30.57s.
- **Artefacts générés** : 7712 modules transformés dans `dist/assets/`, bundle complet produit avec succès.

### 1.2 Suite de Tests (`pnpm test`)
- **Commande exécutée** : `pnpm test` (`node --test "functions/uniflow-api/src/**/*.test.js" "src/**/*.test.ts" "src/**/*.test.mjs" "scripts/**/*.test.mjs"`)
- **Résultat global** : 229 tests exécutés, **227 réussis**, **2 échoués**.
- **Erreurs constatées** :
  1. `src/components/team/TeamGrid.render.test.mjs:15`
  2. `src/components/ui/UniIcon.render.test.mjs:14`
  - Message d'erreur verbatim :
    ```
    Error [ERR_MODULE_NOT_FOUND]: Cannot find package 'esbuild' imported from /home/ravel/Documents/Projet KERNEL FORGE/independant/web2/src/components/team/TeamGrid.render.test.mjs
    Error [ERR_MODULE_NOT_FOUND]: Cannot find package 'esbuild' imported from /home/ravel/Documents/Projet KERNEL FORGE/independant/web2/src/components/ui/UniIcon.render.test.mjs
    ```
  - Dans `/home/ravel/Documents/Projet KERNEL FORGE/independant/web2/package.json`, la dépendance `esbuild` est absente de `devDependencies` (Vite installe `esbuild` de manière imbriquée sous `.pnpm/`, ce qui empêche son import direct sous le gestionnaire pnpm strict).

### 1.3 Exigence R1 : UI/UX Multi-plateforme & 3 Profils Autonomes
- **Navigation latérale** : Dans `src/components/layout/navConfig.ts` (l. 25-43), les routes sont découpées par profils `['student', 'delegate', 'teacher']` sous les groupes « Apprendre », « Animer mon groupe », « Échanger » et « Mon compte ».
- **Tableau de bord multi-rôles** : Dans `src/pages/independent/RoleDashboard.tsx` (l. 36-40, 147-170) :
  - `student` : En-tête « Votre progression du jour », KPIs (Cours suivis, Devoirs à faire, Moyenne, Séances aujourd'hui).
  - `delegate` : En-tête « Votre groupe d’étude », KPIs (Membres du groupe, Présence, Séances aujourd'hui, Annonces).
  - `teacher` : En-tête « Votre atelier », KPIs (Cours animés, Élèves, Devoirs à suivre, Moyenne des élèves).
- **Profil & Résolution** : Dans `src/utils/userRole.tsx` (l. 80-100), détection native des types de compte `PERSONAL` et isolation du périmètre académique sans notion universitaire obligatoire.

### 1.4 Exigence R2 : Systèmes Fonctionnels Consolidés
- **Présences, saisie libre & exports** dans `src/pages/AttendanceManagePage.tsx` :
  - Saisie libre d'apprenants (l. 372-420) : Modal/formulaire inline « + Ajouter un participant libre » avec génération de matricule libre `IND-xxxx`.
  - Émission QR dynamique (l. 194-208, 505-526) : Appel `attendanceApi.openQrSession` avec géolocalisation sécurisée et composant `QRCodeSVG`.
  - Exports immédiats (l. 10, 210-225, 261-265) : Intégration de `ExportButtons` branché sur `todayRollExport` (feuille du jour) et `courseHistoryExport` (historique complet du cours) générant PDF et Excel via `jspdf` et `exceljs`.
  - Persistance hors ligne : En cas de coupure réseau, la feuille est mise en file d'attente via `queueAttendanceRoll` (l. 160-169).
- **Bibliothèque Z-Library & Cache Appwrite** :
  - Dans `api/books.ts` (l. 589-626), recherche distante exclusivement dirigée vers le VPS Z-Library (`https://vps.kernelforge.codes/zlib/api/books/search?q=...&lang=french`).
  - Dans `src/lib/openLibraryService.ts` (l. 463-526), requêtage en priorité de l'API `/api/books` avec repli direct Z-Library.
  - Dans `src/lib/openLibraryService.ts` (l. 364-421), méthode `cacheBookToBucket` stockant le document dans le bucket Appwrite `uniflow_assets` et mettant à jour le `fileId` dans la base `academic_library`.
- **Assistant IA Uni Groq Llama-3.3-70b** :
  - Dans `src/lib/groqAssistantService.ts` (l. 3-5), connexion directe à `https://api.groq.com/openai/v1/chat/completions` sur le modèle `llama-3.3-70b-versatile`.
  - Dans `src/components/assistant/UniAssistant.tsx` (l. 212-221), bascule automatique transparente : appel `askGroq` en premier, et repli vers le routeur Appwrite `executeAssistantAction` en cas d'erreur.
- **Offline-First & Rejeu** :
  - Dans `src/lib/offline/writeQueue.ts` (l. 58-100), file IndexedDB `uniflow-offline` rejouant les écritures automatiquement au retour du réseau via `replayOfflineWrites()`.
  - Dans `src/lib/offline/queryPersistence.ts` (l. 13-53), persistance TanStack Query dans IndexedDB sur 7 jours.

### 1.5 Exigence R3 : Images, Galerie Équipe & Rendu 3D
- **Logos & Identité** : `public/logos` contient 24 fichiers complets (`logo.png`, `logo.svg`, `uniflow-emblem.svg`, `uniflow-wordmark.svg`, `kernel-forge.png`).
- **Galerie Équipe KERNEL FORGE** :
  - `src/pages/TeamsPage.tsx` (l. 156-190) : Switch interactif « 📸 Photos réelles » vs « ✨ Avatars Anime » pilotant `useAvatars`.
  - `src/lib/teamModel.ts` (l. 65-215) : 10 membres KERNEL FORGE complets dans `DEFAULT_TEAM_ROSTER`.
  - `public/team/` : 21 assets présents (les 10 photos réelles + les 10 avatars correspondants).
  - **Anomalie détectée dans `src/components/team/TeamMemberAvatar.tsx` (l. 48-49)** :
    ```typescript
    // Extrait de LOCAL_MASCOT_FALLBACKS :
    'aliyatou rachid oumou tourab': '/team/aliya.jpg',
    'mandeng judith oceanne': '/team/judith.jpg',
    ```
    Alors que les fichiers `/team/avatar_aliya_anime.jpg` et `/team/avatar_judith_anime.jpg` existent bel et bien dans `public/team/`.
- **Rendus 3D / Illustrations** :
  - Présentes dans `public/illustrations/` : `sentinelle_health.jpg`, `sentinelle_vigie.jpg`, `sentinelle_patrol.jpg`, `library.jpg`, `hero.jpg`, `login.jpg`, `grades.jpg`, `schedule.jpg`, `presence.jpg`, `community.jpg`.
  - **Anomalie de nommage dans les dashboards** : `src/pages/DashboardPage.tsx` (l. 149-153) et `src/pages/DashboardCompactPage.tsx` (l. 29-33) référencent `/illustrations/course_schedule.jpg`, `/illustrations/course_books.jpg`, `/illustrations/course_grades.jpg`, `/illustrations/hero_books.jpg` qui n'existent pas dans `public/illustrations/`.

---

## 2. Logic Chain

1. **Build Validé** :
   - L'exécution de `pnpm run build` transforme 7712 modules sans aucune erreur TypeScript ni avertissement bloquant. Le code applicatif de `independant/web2` est donc strictement compilable en l'état.
2. **Échec des 2 tests isolé et maîtrisé** :
   - 227 tests sur 229 passent avec succès.
   - Les 2 tests échoués (`TeamGrid.render.test.mjs` et `UniIcon.render.test.mjs`) échouent uniquement à l'import de `esbuild` car pnpm n'expose pas les dépendances transitives de Vite à la racine de `node_modules`.
   - Il ne s'agit pas d'un bug de logique métier, mais d'une dépendance de développement manquante dans `package.json` (`"esbuild"`).
3. **Exigence R1 Conforme** :
   - Les 3 profils autonomes (Étudiant, Délégué, Enseignant) disposent chacun de leur vue adaptée dans `RoleDashboard.tsx` et d'une navigation dédiée dans `navConfig.ts`.
4. **Exigence R2 Conforme** :
   - La saisie libre d'apprenants, le QR code dynamique, les exports immédiats PDF/Excel, le moteur Z-Library exclusif avec cache Appwrite Storage, le moteur Groq Llama-3.3-70b avec bascule transparente et la file IndexedDB offline-first sont tous concrètement implémentés et fonctionnels dans le code.
5. **Exigence R3 Quasiment Conforme (2 ajustements mineurs requis)** :
   - Le switch interactif 10 membres est opérationnel dans `TeamsPage.tsx`.
   - Le mapping erroné dans `TeamMemberAvatar.tsx` (l. 48-49) fait que 2 des 10 membres affichent leur photo réelle même en mode « Avatars Anime ».
   - Les illustrations 3D Sentinelle, Library, Login, Hero, Grades sont bien déployées, mais les chemins résiduels dans `DashboardPage.tsx` pointent vers d'anciens noms de fichiers.

---

## 3. Caveats

- **Mode d'exécution lecture seule** : Conformément à la directive d'exploration (`read-only investigation`), aucune modification directe n'a été apportée aux fichiers sources (`package.json`, `TeamMemberAvatar.tsx`, `DashboardPage.tsx`).
- **Exécution hors ligne du VPS Z-Library** : Le serveur VPS distant `https://vps.kernelforge.codes/zlib` est configuré dans le code, mais sa disponibilité en temps réel dépend du réseau externe. Le code web2 intègre déjà le repli et les timeouts nécessaires.
- **Clé API Groq** : Dépend de la variable d'environnement `VITE_GROQ_API_KEY`. En son absence, le code bascule silencieusement sur la Function Appwrite.

---

## 4. Conclusion

L'application Web2 (`independant/web2`) est en excellent état structurel et répond de façon quasi-intégrale aux exigences R1, R2 et R3 :
1. **Compilation** : `pnpm run build` compile à 100% avec **0 erreur**.
2. **Tests** : 227 tests sur 229 passent.
3. **Actions correctives recommandées pour la phase de correction/implémentation** :
   - **Fix 1 (Tests)** : Ajouter `"esbuild": "^0.25.0"` dans `devDependencies` de `independant/web2/package.json` et exécuter `pnpm install` pour faire passer les tests à 229/229 (100%).
   - **Fix 2 (Avatars R3)** : Dans `src/components/team/TeamMemberAvatar.tsx` (l. 48-49), corriger :
     - `'aliyatou rachid oumou tourab': '/team/avatar_aliya_anime.jpg'`
     - `'mandeng judith oceanne': '/team/avatar_judith_anime.jpg'`
   - **Fix 3 (Images Dashboards R3)** : Dans `src/pages/DashboardPage.tsx` et `src/pages/DashboardCompactPage.tsx`, remplacer les chemins inexistants (`course_schedule.jpg`, `course_books.jpg`, `course_grades.jpg`, `hero_books.jpg`) par les illustrations existantes correspondantes (`schedule.jpg`, `grades.jpg`, `presence.jpg`, `library.jpg`).

---

## 5. Verification Method

Pour reproduire et vérifier de manière indépendante ces conclusions :

1. **Vérification du Build** :
   ```bash
   cd "/home/ravel/Documents/Projet KERNEL FORGE/independant/web2"
   pnpm run build
   ```
   *Critère d'acceptation* : Sortie avec code 0 et zéro erreur.

2. **Vérification des Tests** :
   ```bash
   cd "/home/ravel/Documents/Projet KERNEL FORGE/independant/web2"
   pnpm test
   ```
   *Observation attendue* : 227 pass, 2 fail (manque `esbuild`).

3. **Vérification de l'Anomalie des Avatars** :
   Inspecter les lignes 48-49 de `src/components/team/TeamMemberAvatar.tsx` et comparer avec le contenu de `public/team/`.
