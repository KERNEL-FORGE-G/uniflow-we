# Travaux restants — note pour la prochaine session

> Écrit le **2026-09-14**, en fin de session, à la demande du propriétaire.
> Mis à jour le **2026-09-15** : section 2 (agents), section 6 (secrets), et
> l'ensemble confronté à l'historique Git réel des trois dépôts — la clé API
> s'est révélée publiée dans un dépôt public, ce que la version précédente
> présentait comme une simple hygiène.
> **Mis à jour de nouveau le 2026-09-15 (fin de session, correctifs de
> messagerie)** : la panne « Messagerie indisponible » est **résolue et validée
> sur appareil réel** — le §1 qui la décrivait a été réduit à un compte rendu de
> clôture. Les demandes du propriétaire qui n'ont jamais été satisfaites sont
> regroupées au §7.
> **Mis à jour le 2026-09-20 — migration vers Appwrite Cloud.** Le serveur
> auto-hébergé est mort ; tout ce qui, ci-dessous, parle de `_APP_STORAGE_LIMIT`,
> de redémarrage du serveur, de la clé compromise ou de Firebase est **caduc** :
> le §0 liste ce qui est clos par la migration et ce qui reste vraiment.
> **Mis à jour le 2026-09-21, 04:50 — session 03:45–04:45** (Archlord, groupe
> WhatsApp, salle de classe ICT4D L1, tableau de bord réel) : les §3 à §7 ont été
> confrontés au code et à l'historique Git des trois dépôts — beaucoup de cases
> ont été cochées par le travail du 20/09 après-midi et de la nuit ; ce qui
> reste de cette session est au **§8**. Le premier geste de la prochaine
> session est au §8, point 1 (un mot de passe hors Git mais pas hors `git add`).
> **Mis à jour le 2026-09-21, 12:05 — session du matin** (inscription sans
> blocage sur les trois clients, emplois du temps fictifs ICT4D L2/L3,
> authentification mobile redessinée et badges) **et rattrapage de la période
> 05:00–09:40** jamais consignée (hors ligne web, espace enseignant réel,
> feuille de présence de la visio desktop, release Android). Les §3 à §8 ont
> été confrontés à l'historique Git ; les suites ont été rejouées (web 162,
> mobile 585, desktop 585).
> **Mis à jour le 2026-09-21 à 16:55** : le trailer `Co-authored-by` est
> **réglé** (historique des trois `main` réécrit, hashs de ce fichier
> convertis — §8, point 8) ; l'APK 1.0.0 est publié et la page web
> `/download` lit les liens depuis `app_releases` (§4, §8 point 16) ; le
> **premier geste de la prochaine session est au §8, point 15** (performance
> web, vague 2), puis le point 16 (version de bureau à publier).
> **Mis à jour le 2026-09-21 à 18:30** : l'équipe passe à dix membres (pôle
> marketing, second développeur desktop — §8, point 20) et le propriétaire
> dispose de `PROMPT-CLAUDE-PLAN-7-JOURS.md` pour faire produire par Claude
> le plan de la semaine du 22 au 28/09 ; **le point 17 (version de bureau) et
> le rattrapage du desktop (§5) reviennent au binôme Alia + Miguel**, le
> point 16 (performance web) reste au propriétaire.
> **Mis à jour le 2026-10-15 (suite)** : **Transition Desktop2 vers React + TypeScript + Tailwind CSS & Premier Logo**.
> - Desktop2 (`independant/desktop2`) : Remplacement du moteur Slint/Rust par la stack moderne **React 18 + TypeScript + Vite + Tailwind CSS + Lucide Icons**. Erreur 404 sur `main.tsx` corrigée avec architecture déclarative complète. Tests Vitest 100% au vert (3/3), `pnpm run build` validé avec 0 erreur en 2.51s, et serveur de dev actif sur `http://localhost:1420/`.
> - Premier Logo Officiel Restauré : Écusson 1024×1024 pixel-perfect, bandeau horizontal et wordmark réintégrés sur Mobile, Desktop Flutter, Desktop2 et Web.
> - Vidéo Motion Design 25 Minutes (`output/uniflow_motion_design_25min.mp4`) : 1500 secondes réelles (25 minutes) en Full HD 1080p, 16 chapitres détaillés avec voix off française, orbe lumineux de marque, grille en perspective, métriques glassmorphism et mascottes officielles.
> - Desktop (`independant/uniflow-desktop`) : Éradication définitive du débordement RenderFlex de 41px sur QuestsScreen (`gamification_screens.dart`), harmonisation du hero banner sans duplication de salutation ni virgule orpheline sans nom (`dashboard_screen.dart`), actualisation des 4 étapes d'onboarding (`onboarding_screen_test.dart`), et ajout des overrides de providers asynchrones (`layout_test_support.dart`). 850/850 tests validés avec succès localement, job Qualité GitHub Actions validé au vert en 2m41s et builds Linux, Windows et Android générés. Commit `23ad0bd` poussé sur `origin/feature/frontend-uniflow-app`.
> Compagnon de `ETAT-DU-PROJET.md` (qui décrit le projet et son état).
> Ce fichier-ci ne décrit que **ce qui n'est pas fini**, avec assez de détail
> pour reprendre sans rien redécouvrir.

---

## 0. Migration Appwrite Cloud (2026-09-20) — ce qu'elle clôt, ce qu'elle ouvre

**Clos par la migration** (ne plus y revenir) :

- §6 clé API compromise → l'ancienne clé ne donne accès qu'à un serveur mort ;
  une nouvelle clé vit dans `uniflow-backend/.env`. Reste : purger l'historique
  Git des dépôts publics si on y tient (hygiène, plus urgence).
- §6 `.env` web versionné → sorti du versionnement (`5af4eb0`). Les `.env`
  Flutter restent versionnés à dessein (asset, valeurs publiques).
- §6 `_APP_STORAGE_LIMIT`, redémarrage serveur → sans objet sur le Cloud ; le
  bucket accepte 50 Mo.
- §6 Firebase → **abandonné** : le projet n'utilise que Appwrite (décision du
  propriétaire). Les alertes application fermée ne sont pas au programme.
- §6 scripts `deploy-*-function.mjs` → supprimés ; déploiement par
  `appwrite push function` (`appwrite.config.json`).
- §6 comptes de sonde et résidus → disparus avec le serveur.
- §6 `users.level` L1–L3 et neuf attributs `enum` → schéma corrigé et
  provisionné ; la sonde ne signale plus de divergence.
- §5 `academic_enrollments` manquante → provisionnée.
- §4 mot de passe ADMIN → compte recréé avec un mot de passe généré.

**Ouvert par la migration** :

- [ ] Les seeds (`seed-uniflow-demo.mjs`, `normalize-appwrite-level-schema.mjs`,
      `provision-qr-test-delegate.mjs`, `reset-qr-test-passwords.mjs`) créent
      encore leur propre schéma ou visent d'anciens comptes : à réécrire sur
      `seed-accounts.mjs` ou à supprimer.
- [ ] `run-uy1-e2e.mjs` et `test-forum-contact-functions.mjs` appellent-ils
      encore d'anciens identifiants de Function ? À vérifier puis relancer.
- [x] Vercel : variables `VITE_APPWRITE_*` — **confirmé le 2026-09-21 à
      05:05** : le bundle de production contient l'endpoint Cloud
      `fra.cloud.appwrite.io`, et le tableau de bord de Pr. Fouda ouvert sur
      `uniflow.kernelforge.codes` montre les chiffres de la salle de classe
      (2 cours, 11 inscrits, 66 notes, 12,9/20).
- [x] Reporter ici le compte rendu des agents web / mobile / desktop lancés le
      2026-09-20 — fait le 2026-09-21 d'après l'historique Git, dans
      `ETAT-DU-PROJET.md` §2 (« Du 2026-09-20 midi au 2026-09-21 03:00 ») ; les
      cases correspondantes des §3 à §5 ci-dessous sont cochées.

---

## 1. CLOS — « Messagerie indisponible » sur mobile

**Résolu le 2026-09-15, et vérifié sur un appareil réel.** Compte rendu, pour
que le diagnostic ne soit pas refait :

- **Symptôme** : l'écran Messagerie affichait « Messagerie indisponible » suivi
  de « Bad state: No element », sur tous les comptes, alors que la Function
  répondait `ok:true`.
- **Cause** : le SDK Dart `appwrite` 26.2.0 vise Appwrite 2.0.x, le serveur est
  en 1.6.1. Le document d'exécution de 1.6.1 ne porte pas `resourceType`, et
  `Execution.fromMap` fait un `firstWhere` **sans `orElse`** : *chaque* appel de
  Function levait un `StateError`, que `_invoke` laissait remonter brut.
  Redéployer la Function n'y aurait rien changé — d'où une piste introuvable
  pendant deux sessions.
- **Correction** : `a17044c` — `client.call` au lieu de
  `functions.createExecution`, `decodeExecutionPayload` (fonction pure, six
  tests), `X-Appwrite-Project` reposé à chaque requête (`setProject` ne pose
  aucun en-tête : sans lui, 403), `_invoke` traduit les erreurs non-Appwrite,
  `_InboxError` affiche le type et le code.
- **Pièces jointes** : `c4c3c5a` — `chunkedUpload` + `decodeUploadedFileId`
  (le SDK réclame `sizeActual`, absent en 1.6.1, alors que le fichier était bien
  déposé) ; et côté Function, `a9a825f` — `storage.updateFile` appelé en
  positionnels `(bucket, id, name, permissions)`, contrôle de propriété du
  fichier, et le script de déploiement reconstruit son archive.
- **Preuves** : sur le téléphone `25028RN03A`,
  `SONDE list -> error=null conversations=[]` puis un aller-retour complet entre
  deux comptes (`conv_9ee57772c48a18c54c94d42dc934`,
  pièce `6aa91d49c41855da12b7`, 70 octets, destinataire compris) ;
  `node scripts/test-messaging-attachment.mjs` **11/11** sur le serveur en
  service, contre-épreuve comprise.

**Ce qui reste de ce chantier** (voir §3 et §7) :

- les **notifications et la bascule d'urgence** n'ont **pas** été validées sur
  appareil réel — et, depuis la migration du 2026-09-20, **la messagerie
  elle-même n'a pas été rejouée sur un téléphone** contre le Cloud (la
  validation du 15/09 visait le serveur mort). Les comptes de sonde
  `sondea/sondeb20260915` n'existent plus : pour relancer
  `messaging_roundtrip_test.dart`, prendre deux comptes de la salle de classe
  (`.comptes-classe.local`) ;
- les trois autres points (comptes de sonde, message orphelin de
  `test-messaging-attachment.mjs`, scripts `deploy-*` menteurs) sont **clos**
  par la migration (§0).

---

## 2. Le journal de projet — à terminer

Le propriétaire a demandé un agent qui tienne l'historique des modifications et
des tâches, pour que le travail reprenne normalement d'une session à l'autre.

- [x] `ETAT-DU-PROJET.md` — état du projet (racine).
- [x] `TRAVAUX-RESTANTS.md` — ce fichier.
- [x] `.claude/agents/journal-projet.md` — l'agent qui met le journal à jour.
- [x] **`CLAUDE.md` à la racine** — présent : il fait lire `ETAT-DU-PROJET.md`
      puis `TRAVAUX-RESTANTS.md` au début de chaque session, et fait mettre les
      deux à jour avant de terminer. *Sans ce fichier, rien de tout cela n'est lu
      automatiquement.*
- [x] **Vérifier que les agents sont bien pris en compte** — ils le sont : les
      lancements du 2026-09-15 ont bien atteint les agents (c'est le modèle qui a
      été refusé, pas la découverte). Attention, ils ne sont découverts que si la
      session est lancée depuis la racine du projet.
- [x] **Faire tourner l'agent une première fois** — fait le 2026-09-15. La case
      était restée décochée parce que l'agent ne pouvait pas démarrer (voir
      ci-dessous), pas parce qu'il était absent.

### Ce qui est apparu depuis

- [x] **Un agent par application** — `.claude/agents/uniflow-web.md`,
      `uniflow-mobile.md` et `uniflow-desktop.md`, plus un `README.md` qui porte
      la contrainte de modèle ci-dessous. `uniflow-desktop` respecte la pause
      imposée par le propriétaire.
- [x] **`journal-projet` a été relancé le 2026-09-15** sur l'historique Git réel
      des trois dépôts. Il a corrigé deux chiffres faux — la suite desktop
      n'était pas à 161 mais à 160 avant les ajouts d'icônes (162 après), et la
      suite mobile n'était pas à 204 mais à 213 — et il a établi que la clé API
      est publiée dans un dépôt public (§6).
- [x] **`journal-projet` relancé une seconde fois le 2026-09-15**, après les
      correctifs de messagerie. Il a vérifié par lui-même, sur le serveur, que le
      déploiement actif de la Function `messaging` est identique à sa source ;
      que `test-messaging-attachment.mjs` passe **11/11** en service ; que les
      suites sont à **222/222** (mobile) et **162/162** (desktop) ; et que les
      trois autres `deploy-*-function.mjs` portent encore le défaut d'archive
      figée. Il a aussi constaté trois comptes de sonde et un message orphelin
      laissé par la sonde de pièces jointes.
- [x] **`journal-projet` relancé le 2026-09-21 à 04:45**, après la session
      Archlord / salle de classe. Il a constaté que le bloc « Matinée du
      2026-09-20 » promis par l'en-tête précédent d'`ETAT-DU-PROJET.md`
      n'existait pas, et l'a remplacé par un bloc écrit d'après l'historique
      Git ; il a rejoué les trois tests `node:test` de la session (5/5, 6/6,
      8/8), la suite mobile (**521/521**) et `verify-appwrite-schema.mjs`
      (conforme, 33 collections) ; il a trouvé que `.comptes-classe.local`
      n'est **pas** dans le `.gitignore` de `uniflow-backend` (§8).
- [x] **`journal-projet` relancé le 2026-09-21 à 11:20**, après la session du
      matin. Il a constaté qu'une période entière (05:00–09:40, une trentaine
      de commits sur les trois dépôts) n'avait jamais été consignée et l'a
      rattrapée d'après Git ; il a mesuré le Cloud en lecture seule (312 cours,
      557 séances, 89 inscriptions, 22 comptes, ICT4D 6/8/8 cours et 10/15/15
      séances, `uniflow-api` redéployée deux fois) ; rejoué web **162/162**,
      mobile **585/585**, desktop **585/585** (la session annonçait 581) ; et
      trouvé que **presque tous les commits depuis le 20/09 portaient
      `Co-authored-by: Cursor`** — réglé le 21/09 à 16:40 (§6, §8).
- [ ] **Repasser les agents à `model: sonnet`** le jour où la passerelle servira
      des modèles Anthropic. Sous Cursor, le champ est ignoré.

### Pourquoi les agents déclarent `model: deepseek-v4-flash`

Incident du 2026-09-15. Cette machine n'appelle pas l'API Anthropic directement :
elle passe par une passerelle tierce (`ANTHROPIC_BASE_URL=https://agentrouter.org/`)
qui **ne sert qu'un seul modèle**, `deepseek-v4-flash`. Toute demande d'un modèle
Anthropic est refusée en `403`. Constaté sur quatre lancements :

| Déclaration | Modèle réellement demandé | Résultat |
|---|---|---|
| `model: sonnet` | `claude-sonnet-5` | 403 |
| `model: haiku` | `claude-haiku-4-5-20251001` | 403 |
| `model: inherit` | `claude-sonnet-5` | 403 |
| `model: deepseek-v4-flash` | `deepseek-v4-flash` | fonctionne |

Deux pièges : **`model: inherit` ne protège de rien** (il ne reprend pas le
modèle de la session parente, il retombe sur un défaut Sonnet), et **les alias
`sonnet` / `haiku` ne marchent pas** — seul un identifiant littéral passe. C'est
la cause probable de la case restée décochée ci-dessus. Détail complet dans
`.claude/agents/README.md`.

- [x] **`CLAUDE.md` présente les quatre agents** (section « Agents par
      application ») et demande de les lancer en parallèle quand les tâches sont
      indépendantes — c'est ainsi que la session du 2026-09-21 a travaillé.

---

## 3. Mobile — le reste

- [x] **Messagerie validée sur appareil réel** (2026-09-15, `25028RN03A`) :
      connexion, `list`, `search`, envoi de texte, envoi de pièce jointe et
      **lecture de cette pièce jointe par le destinataire**. Voir §1.
      `integration_test/messaging_roundtrip_test.dart` a besoin de **deux
      comptes réels** (fournis par `--dart-define=EMAIL_A/PASSWORD_A/EMAIL_B/PASSWORD_B`,
      jamais écrits dans le fichier). Les comptes utilisés le 2026-09-15 sont
      `sondea20260915` / `sondeb20260915` : **si on les supprime (§6), recréer
      une paire équivalente avant de relancer la sonde**.
- [ ] **Bascule d'urgence et notifications : toujours pas validées sur
      appareil.** Elles n'ont été éprouvées que par tests automatisés et appels
      directs à la Function. Le canal temps réel d'Appwrite ne se teste pas
      comme une requête : il faut deux téléphones, ou un téléphone et le web,
      avec l'application ouverte puis en arrière-plan. **Depuis la migration,
      rien du mobile n'a été rejoué sur un téléphone** — ni la connexion au
      Cloud, ni la messagerie, ni le hors ligne (`lib/offline/` : démarrage sans
      réseau, outbox, resynchronisation). Les comptes de la salle de classe
      (`.comptes-classe.local`) permettent un aller-retour réaliste entre deux
      étudiants ou un étudiant et le délégué.
- [x] **Parcours d'inscription** — `lib/screens/register.dart` existe (commits
      du 2026-09-20) : inscription **native**, miroir de `/register` du web,
      avec un lien `url_launcher` vers la page web en secours. Le propriétaire
      demandait un *renvoi* vers le web ; l'implémentation va plus loin — à lui
      de confirmer que cela lui convient (§7). **Depuis `11be25e` (21/09
      matin)** : le compte créé entre **directement** dans le tableau de bord
      (mot de bienvenue en toast), le raccordement académique est différé au
      lieu de faire échouer l'inscription, et la connexion le rejoue
      (`retryAcademicProvisioning`). Écrans connexion / inscription / mot de
      passe oublié **redessinés d'après la maquette** (plus de boutons sociaux).
- [x] **Badges de réussite** (`11be25e`) : six médailles calculées depuis
      présences, notes, devoirs et forum ; route `/badges`, rangée sur
      l'accueil. Les sources sont dans `IMAGES-UNIFLOW/badges/`, **non décrites
      dans son README** (§8).
- [x] **Release Android publiable** (`7390c5b`) : signature par
      `android/key.properties` (hors dépôt), R8, réduction des ressources,
      `keep.xml` pour l'icône de barre d'état. APK par ABI 28,8–35,4 Mo.
      **Construit, jamais installé sur un téléphone** à la connaissance du
      journal — à faire avec la validation sur appareil ci-dessous.
- [ ] **`assets/brand/uniflow_logo_horizontal.png` est encore le PNG du 15/09**
      (68 Ko, halo) : `b2236e9` n'a refait que l'écusson `uniflow_marque.png`
      depuis le SVG. Rastériser le logotype horizontal depuis le vecteur (le
      desktop l'a fait dans `3ba7bdd` : `uniflow-wordmark` 2400 px), puis
      regénérer ce qui en dépend avec `tools/generer-icones-uniflow.py`.
- [x] **Boutons et écrans morts** — réparés : les en-têtes de `presence.dart`
      et `forum.dart` décrivent le symptôme corrigé, `library.dart` ne porte
      plus le faux SnackBar (vérifié le 2026-09-21).
- [ ] **Notifications pour les autres événements** : `notification-alerts`
      produit absences et retards ; le seed de la salle de classe pose aussi des
      notifications `ASSIGNMENT`, `SCHEDULE`, `SUBMISSION`, `ATTENDANCE` — de
      quoi vérifier que le mobile les **affiche** correctement. Reste à
      établir quels événements en **génèrent** réellement côté Functions.
- [ ] **50 Mo de pièce jointe** — le serveur ne bloque plus : le bucket
      `uniflow_assets` est à 50 000 000 octets (mesuré le 2026-09-21). Mais le
      mobile plafonne encore lui-même à 30 Mo : `chatAttachmentMaxBytes =
      30 * 1000 * 1000` (`lib/repositories/messaging_repository.dart:517`).
      À relever à 50 Mo (et son test) si le propriétaire tient aux 50 Mo.
- [x] **Vraies notifications push** — abandonnées : pas de Firebase, décision du
      propriétaire (§0).
- [x] **Refonte du design** — engagée et commitée : Uni et l'assistant Uni,
      onboarding illustré, écran À propos, états d'erreur unifiés, palette
      (`1c55869` … `a26dc2c`). Ce qui manque relève désormais du sous-agent
      mobile, écran par écran.

---

## 4. Web

- [x] **`fix/avatar-bucket-et-roles` et `main` sont au même commit** (`7a2f3fe`
      le 2026-09-21 à 11:25 ; Vercel déploie `main`). Le travail continue sur la
      branche et est poussé sur `main` à chaque fois — plus rien à fusionner.
- [x] **Inscription sans blocage** (`9b9e608`) : `/academic-registration` rend
      `ok: true, coursesReady: false` au lieu d'un 409 quand la filière n'a pas
      de cours publiés, accepte M1/M2 ; `createAccount` ne lève plus, la
      connexion rejoue `provision` ; `delete-self` efface aussi les
      inscriptions ; `scripts/test-registration-flow.mjs` (23 vérifications
      d'après la session — **écrit sur le Cloud**, crée puis supprime un compte).
- [ ] **Emplois du temps ICT4D L2 et L3 : remplacer le fictif par l'officiel.**
      `7a2f3fe` a posé 8 UE + 15 séances par niveau, `provisional: true`, dans
      `scripts/data/fs-uy1-2026-2027.mjs` (bloc « DONNÉES FICTIVES
      PROVISOIRES »), en base depuis le 21/09 matin (vérifié : 8/8 cours,
      15/15 séances). Dès réception de l'officiel : éditer les deux entrées,
      `node scripts/seed-academic-reference-data.mjs --dry-run` puis `--prune`,
      relancer `scripts/data/fs-uy1-2026-2027.test.mjs`, et vérifier que
      l'étudiant L3 réel garde ses inscriptions (`enrollDirectoryLearners` les
      recalcule depuis l'annuaire).
- [ ] **Compteur « créé / mis à jour » du seed trompeur derrière le CDN** :
      `appwrite-env.mjs` réessaie les 502/503/504 (`9b9e608`) ; un POST parti
      en 503 mais exécuté côté serveur revient en 409 au réessai et `tally` le
      compte « mis à jour ». Vérifier par les compteurs de collections, ou
      distinguer le cas dans le résumé.
- [x] **Espace enseignant réel, hors ligne web, profil et Plateforme réels,
      bandeau abonnement** — voir `ETAT-DU-PROJET.md` §2, bloc « Du 2026-09-21
      05:00 à 09:40 » (`cfa061b`, `9297327`, `002fda8`, `31505cd`, `7952f69`).
      Le bandeau « Aucun abonnement actif » n'apparaît plus que pour les
      comptes `PERSONAL` et sur la page Abonnement
      (`shouldHideMissingSubscription`) ; mobile et desktop n'ont aucun bandeau
      équivalent (vérifié : la chaîne n'existe que dans le web).
- [x] **Rôles gérés dans l'interface** : `src/pages/admin/AdminUsersPage.tsx`
      crée et modifie les comptes avec leur rôle (STUDENT, DELEGATE, TEACHER ;
      ADMIN réservé au `superadmin`) par la Function `/admin-directory`, qui
      porte la matrice de droits. 16 pages d'administration au total.
- [x] **Une suite de tests web existe** : **162 tests** `node:test` (Function,
      `src/`, scripts), lancés d'un coup par la commande du README —
      `node --test "functions/uniflow-api/src/**/*.test.js" "src/**/*.test.ts"
      "src/**/*.test.mjs" "scripts/**/*.test.mjs"` — rejouée par le journal le
      21/09 à 11:30. Il n'y a toujours **pas de script `npm test`** dans
      `package.json` (`test:e2e:uy1` seulement), et aucune CI (`uniflow-we` n'a
      pas de `.github/workflows/`).
- [ ] **Ajouter `npm test`** (la commande ci-dessus) et une CI qui la lance.
- [x] **Données académiques** : le JSON du propriétaire n'est jamais arrivé ;
      le référentiel UY1 (12 filières, 296 UE, 527 séances) a été construit par
      `seed-academic-reference-data.mjs` le 2026-09-20 et la salle de classe
      ICT4D L1 par `seed-classroom.mjs` le 2026-09-21 ; les 16 UE et 30 séances
      ICT4D L2/L3 du 21/09 matin sont **explicitement fictives**. **À faire
      relire par le propriétaire** : ces données sont plausibles, pas
      officielles.
- [x] ~~**`TeacherCoursesPage.tsx`, onglet Devoirs**~~ — fait par `cfa061b`
      (21/09, 06:40) : énoncés réels depuis `academic_assignments`, rendus,
      publication / suppression, supports dans `uniflow_assets` +
      `academic_library`. Vérifié par le journal : plus aucun titre codé en dur.
- [ ] **Compte enseignant pour ICT103** (Dr. Atangana) : `seed-classroom.mjs`
      lui laisse `teacherId: ''` ; le cours n'a donc pas d'enseignant connecté et
      ses éventuels rendus n'auraient aucun lecteur côté enseignant.

---

## 5. Desktop — pause **levée le 2026-09-20**

> L'ancienne consigne (« laisse d'abord le desktop ») ne vaut plus : les trois
> clients avancent en parallèle. Priorité desktop d'après `CLAUDE.md` :
> **visioconférence embarquée hors ligne** et **restriction par rôle**.

- [ ] **Écran de gestion des devoirs côté enseignant** — l'ébauche de
      `lib/screens/academic_management_screens.dart` n'a pas été revue depuis le
      2026-09-15 (le tableau de bord par rôle `549fd81` ne la couvre pas).
- [x] **`academic_enrollments`** provisionnée sur le Cloud (73 documents le
      2026-09-21).
- [x] **Restriction par rôle et type de compte** : `visibleDestinations(role,
      accountType)` dans `lib/ui/app_shell.dart` filtre les destinations ;
      tableau de bord par rôle aligné sur le web (`549fd81`). Reste à
      **éprouver** avec les comptes de la salle de classe (un étudiant, un
      enseignant, l'administration) que chacun ne voit que ce qui le concerne
      — jamais fait.
- [x] **Écran d'inscription** : `lib/screens/register_screen.dart` (natif, même
      séquence que `createAccount` du web, lien web en secours), plein écran
      depuis `16cbb0f`. Même nuance que côté mobile (§3). **Depuis `dddf1a9`
      (21/09 matin)** : entrée directe dans `MainShell` avec toast de
      bienvenue (plus d'écran « Compte créé » ni de retour à la connexion), et
      `retryAcademicProvisioning` à la connexion
      (`test/academic_provisioning_retry_test.dart`, 4 tests).
- [x] **Visioconférence : le code a maintenant une preuve exécutable.**
      Entre 06:36 et 09:33 le 21/09 (`422d030` → `b4bbc00`) : **feuille de
      présence** (modèle avec cumul des reconnexions et seuil Présent /
      Partiel / Absent, JSON atomique dans `~/.uniflow/conference/presences`),
      alimentée par les **webhooks signés HS256 de `livekit-server`** et les
      tickets de jonction ; **exports PDF (Inter embarquée) et Excel** dans
      `Documents/UniFlow/Présences` ; **panneau de présence en direct** dans
      Conférences ; **créer une réunion ouvre la salle** (`livekit_client`,
      adresse LAN classée — le pont Docker était annoncé avant —, page
      navigateur `/join/CODE`, « Rejoindre une réunion ») ;
      `test_live/conference_host_live_test.dart` rejoue créer + rejoindre
      contre le vrai binaire (jeton signé accepté par `/rtc/validate`, jeton
      forgé refusé). ADR-001 (`73b1e1e`) fixe la décision et ce qui est
      volontairement laissé de côté.
- [ ] **Visioconférence — l'essai à deux machines reste à faire** : un hôte,
      un participant desktop, un participant navigateur par le lien LAN ;
      vérifier que la feuille de présence se remplit par les webhooks et que
      les exports PDF / Excel sortent. Le test live ne prouve que le poste
      seul, sans caméra ni second appareil.
- [ ] **Remontée des présences de visio vers `course_attendances`** —
      volontairement différée (ADR-001) : attend le rattachement d'une réunion
      à une séance et une file hors ligne.
- [x] **Refonte du design** — terminée et commitée : Uni, Archlord, AppShell,
      barre latérale claire, états unifiés, palette centralisée, `AppDataTable`
      et `AppButton` partout, toasts (`93677e8` … `b277dc6`). **`flutter test`
      → 585/585** le 21/09 à 12:00 (journal, rapporteur JSON) ; arbre propre à
      `dddf1a9`. Placements d'Archlord vérifiés en trois tailles (`730bf1b`).
- [ ] **Contraste de l'écusson sur l'écran de connexion — à trancher.** Depuis
      `c16fc23`, `UniFlowIcon` n'a plus de plaque de fond, et son commentaire
      affirme que la marque « reste lisible » sur les deux fonds. Mesuré en ΔE76
      sur l'écusson `#104090` : 40,7 sur le marine de la sidebar `#151E32`
      (détaché, l'affirmation tient), mais **3,6 au début du dégradé de
      connexion `#1E3A8A` et 9,9 à 14,3 à la position réelle du logo** — à la
      limite de la confusion. Le mobile résout le même cas par une plaque blanche
      explicite (`ColoredBox` blanc dans `login.dart` et `dashboard.dart`). **Ne
      rien modifier** : c'est au propriétaire de choisir — la refonte de
      `auth_chrome.dart` (`5d2f0f4`) n'a pas tranché la question, à revérifier
      sur l'écran refait.
- [x] **`test/layout_test.dart`** : l'en-tête dit « cinq largeurs » et `_sizes`
      en contient cinq (`420×620`, `760×640`, `1024×720`, `1280×800`,
      `1440×900`) — cohérent (vérifié le 2026-09-21).
- [x] **`assets/images/logo.png`** n'est plus dans le dépôt (vérifié le
      2026-09-21).

---

## 6. Sécurité, serveur et infrastructure

Presque tout ce paragraphe a été **clos par la migration du 2026-09-20** (§0) ;
le détail des anciens constats (clé publiée, `.env` web versionné, scripts
`deploy-*` menteurs, sondes, `users.level`, `enum`) est dans l'historique Git de
ce fichier si quelqu'un en a besoin. État au 2026-09-21 :

- [x] **Clé API compromise** — l'ancienne n'ouvre plus qu'un serveur mort ; la
      nouvelle vit dans `uniflow-backend/.env` (non versionné). Reste, en
      hygiène seulement : purger l'historique public de `uniflow-we` et
      `uniflow-mobile` (`b30035c`, `a22be3d`, `f946bcf`).
- [x] **`uniflow-we/.env`** sorti du versionnement (`.env` dans son
      `.gitignore`). Les `.env` de `uniflow-mobile` et `uniflow-desktop` restent
      **versionnés à dessein** (asset embarqué, valeurs publiques : endpoint,
      projet, bucket). Règle inchangée : jamais de secret dedans.
- [x] **Mot de passe ADMIN** — compte `kernel@forge.codes` recréé sur le Cloud
      avec un mot de passe généré (`seed-accounts.mjs`, `.comptes-demo.local`).
- [x] **Plateformes** web, Android, Linux, macOS, Windows déclarées sur le
      projet Cloud (§0 d'`ETAT-DU-PROJET.md`).
- [x] **`_APP_STORAGE_LIMIT`**, Firebase, scripts `deploy-*`, comptes de sonde,
      `test-messaging-attachment.mjs` qui laissait un message orphelin,
      `users.level`, neuf attributs `enum` — sans objet ou corrigés ;
      `verify-appwrite-schema.mjs` rend « conforme » (33 collections, 1 bucket)
      le 2026-09-21.
- [x] **`uniflow-backend/.comptes-classe.local` dans le `.gitignore`** — fait
      le 2026-09-21 (commit `dbf4f97a`), voir §8, point 1.
- [x] ~~**Trailer `Co-authored-by: Cursor` sur presque tous les commits depuis
      la migration**~~ — **réglé le 2026-09-21 à 16:40** : réglage
      `attribution` désactivé, crochet `tools/git-hooks/commit-msg` dans les
      trois `.git/hooks/`, et **historique des trois `main` réécrit** avec
      l'accord du propriétaire (`git filter-repo`, web 49 → 0, mobile 31 → 0,
      desktop 26 → 0, arbres identiques, `push --force-with-lease`). Les hashs
      cités ici et dans `ETAT-DU-PROJET.md` sont ceux de la **nouvelle**
      histoire. Voir §8, point 8.
- [ ] **Un premier compte étudiant réel existe** (ICT4D L3, inscrit le 21/09).
      Ses données sont personnelles : ne pas le copier dans les seeds, ne pas
      écrire son nom complet dans les fichiers du projet, et s'assurer que
      `--prune` ne touche que les séances (pas les inscriptions ni l'annuaire).
- [x] **Vercel** : confirmé le 2026-09-21 à 05:05 — le bundle de production
      (`index-BXVSS3Uz.js`) contient `https://fra.cloud.appwrite.io/v1`, et le
      tableau de bord de Pr. Fouda ouvert sur `uniflow.kernelforge.codes`
      affiche 2 cours, 11 inscrits, 1 devoir, 66 notes, 12,9/20.
- [ ] **Anciens scripts** à réécrire ou supprimer (§0 : `seed-uniflow-demo.mjs`,
      `normalize-appwrite-level-schema.mjs`, `provision-qr-test-delegate.mjs`,
      `reset-qr-test-passwords.mjs`) ; `run-uy1-e2e.mjs`,
      `test-forum-contact-functions.mjs` et `test-messaging-attachment.mjs` à
      confronter au routeur `uniflow-api` avant de s'y fier.

---

## 7. Demandes du propriétaire — état

Ce qu'il a demandé, et où en est chaque demande. Aucune ne doit être oubliée
parce qu'elle n'était pas dans un dépôt Git.

| Demande | État | Où |
|---|---|---|
| JSON de données à injecter en base : noms des filières UY1 et emplois du temps des filières autres qu'ICT4D | **CONTOURNÉ** — jamais fourni ; référentiel construit par `seed-academic-reference-data.mjs` (12 filières, 296 UE, 527 séances) et salle de classe ICT4D L1 par `seed-classroom.mjs`. **À faire relire par le propriétaire.** | §4 |
| `ICT` va de Licence 1 à Licence 3 | **FAIT** — `users.level` accepte L1–L3, M1, M2 ; provisionné sur le Cloud. | §0 |
| Les pages d'inscription (mobile **et** desktop) renvoient vers la page web, qui enregistre le compte et connecte l'utilisateur | **FAIT, autrement** — inscription **native** dans les deux clients (miroir du web) avec lien vers la page web en secours ; depuis le 21/09 matin, le compte créé **entre directement** dans l'application et une filière sans cours ne bloque plus. À valider par le propriétaire. | §3, §5 |
| Un vrai système de compte et de restriction sur le desktop (« chaque utilisateur ne doit voir que ceux qui le concernent ») | **EN PLACE, NON ÉPROUVÉ** — destinations filtrées par rôle et type de compte, tableau de bord par rôle ; jamais vérifié compte par compte. | §5 |
| Refonte à zéro du design de toutes les pages, mobile et desktop (plugins, icônes, animations) | **FAIT pour l'essentiel** — Uni, Archlord, onboarding, AppShell, états unifiés, palette, tableaux et boutons du design system commités sur les deux clients ; mobile : authentification redessinée d'après la maquette, badges, icône et écran de lancement Android. Restes : logotype horizontal mobile flou, contraste de l'écusson desktop à trancher. | §3, §5 |
| Emplois du temps et inscriptions pour les étudiants ICT4D L2 et L3 « dès maintenant » (2026-09-21) | **FAIT, PROVISOIRE** — données **fictives** marquées `provisional: true`, en base ; à remplacer par l'officiel dès réception. | §4 |
| Écrans connexion / inscription mobile d'après la maquette (2026-09-21) | **FAIT** (`11be25e`) — à faire valider sur téléphone. | §3 |
| Mobile fonctionnel à 100 % avant de reprendre le desktop | **CADUC** — pause desktop levée le 2026-09-20 ; les trois clients avancent en parallèle. | — |
| Rendre la messagerie fonctionnelle (écran « Messagerie indisponible ») | **FAIT** le 2026-09-15, validé sur appareil réel (ancien serveur) ; **pas rejoué sur téléphone depuis la migration**. | §1, §3 |
| Trousseau serveur en sécurité (clé API, mot de passe ADMIN) | **FAIT** par la migration — nouvelle clé hors Git, compte admin recréé ; `.comptes-classe.local` ignoré depuis `dbf4f97a`. | §6 |
| Aucune mention de co-auteur dans les commits (consigne du 2026-09-20) | **FAIT le 2026-09-21** — historique des trois `main` réécrit (0 trailer), crochet `commit-msg` pour la suite ; vérifier chaque nouveau commit. | §6, §8 |
| Lien de téléchargement de l'APK sur le web, modifiable depuis l'administration ; page « Télécharger » avec place pour le desktop (2026-09-21) | **FAIT** — collection `app_releases`, service `/app-releases`, Paramètres › Applications (superadmin), page `/download`, APK 1.0.0 publié. Version de bureau : « bientôt » tant qu'aucun lien n'est publié. | §4, §8 |
| Mascotte du fondateur (Archlord) et lien du groupe WhatsApp KERNEL FORGE (2026-09-21) | **FAIT** sur les trois clients ; placements desktop vérifiés en trois tailles (`730bf1b`) ; relecture croisée web/mobile/desktop à faire. | §8 |
| Visioconférence embarquée hors ligne sur le desktop (priorité `CLAUDE.md`) | **CODE + FEUILLE DE PRÉSENCE + TEST LIVE SUR UN POSTE** (`422d030` → `b4bbc00`) ; essai à deux machines jamais fait. | §5 |
| Pas de Firebase, uniquement Appwrite | **RESPECTÉ** — Firebase retiré du web le 2026-09-20. | §0 |

---

## 8. Sessions du 2026-09-21 — ce qui reste

Ce que les sessions ont fait est dans `ETAT-DU-PROJET.md` §2 (blocs « Session
du 2026-09-21, matin », « Du 2026-09-21 05:00 à 09:40 » et « Session du
2026-09-21, 03:45–04:45 »). Ici, ce qu'elles ont laissé. **Ordre de reprise
conseillé (21/09, 16:55) : 16, 17, 15, 9, 10, 11, 18, 19, 3, 6, 7, 12, 13, 14.**

1. [x] **`uniflow-backend/.gitignore` : ajouter `.comptes-classe.local`.**
       Fait le 2026-09-21 à 05:05 (commit `dbf4f97a` du backend, motif
       `.comptes-*.local` pour les prochains scripts) ; le fichier n'a jamais
       été commité (`git log` vide sur ce chemin). L'en-tête de
       `seed-classroom.mjs` est donc redevenu exact.
2. [x] **`uniflow-we/src/pages/TeacherCoursesPage.tsx`, onglet « Devoirs ».**
       Fait par `cfa061b` (21/09, 06:40) : énoncés réels (`academic_assignments`,
       modèle « publié »), rendus depuis `academic_submissions`, publication et
       suppression, supports téléversés dans `uniflow_assets` + `academic_library`,
       « Progression » = part d'apprenants évalués. Vérifié par le journal : plus
       aucun titre codé en dur dans `src/`. Testé par la session avec Dr Nkolo
       (ICT102).
3. [ ] **Archlord : relire la cohérence des placements** entre le web
       (`ArchlordMascot.tsx` : À propos, Équipe, Landing « Deux mots du
       fondateur », Présentation, Contact), le mobile (`87d1ba0`, `e80a5d7` :
       onboarding, écran À propos, section Réglages hors ligne) et le desktop
       (`5d2f0f4` : `management_screens.dart` À propos et note Conférences,
       `auth_chrome.dart`). Même nom et même rôle (`ARCHLORD_NAME`,
       `ARCHLORD_ROLE` côté web), mêmes poses de parole (Archlord `explain`, Uni
       `pointing`), répliques dans le même ton ; le desktop doit rester le seul à
       parler de visioconférence. Le desktop a vérifié **ses** trois placements
       en 1280×800, 1440×900 et 1920×1080 (`730bf1b`) ; la relecture **croisée**
       n'a pas été faite.
4. [x] **Rejouer `flutter test` sur le desktop** — fait par le journal le 21/09
       à 12:00 sur l'arbre propre à `dddf1a9` : **585/585** (rapporteur JSON,
       62 hooks cachés, 0 échec). Mobile : **585/585** à `11be25e`, 11:55.
5. [x] **Ouvrir le déploiement Vercel** de `main` avec un compte de la salle de
       classe — fait le 2026-09-21 à 05:15 avec Pr. Fouda (2 cours, 11 inscrits,
       1 devoir, 66 notes, 12,9/20) **et** Amina (6 cours, 3 devoirs dont 0 à
       rendre, 18 notes, 13,17/20, 87 % de présence sur 15 séances, courbe
       S36–S38) : identique au local. Chiffres attendus rappelés : 6 cours, 87 % de présence, 3 devoirs (2 notés, 1 soumis) ; 2
       cours, 11 inscrits, 66 notes, moyenne 12,9.
6. [ ] **Compte enseignant pour ICT103** (Dr. Atangana, `teacherId: ''` dans
       `seed-classroom.mjs` ligne 79 — toujours vide le 21/09 à 11:30), ou
       retirer le cours de la démonstration.
7. [ ] **Un script `npm test`** dans `uniflow-we/package.json` — la commande
       existe dans le README (`node --test` sur quatre motifs, 162 tests), il ne
       manque que l'entrée `scripts.test` et une CI qui l'appelle.
8. [x] **Faire cesser le trailer `Co-authored-by: Cursor`.** Fait le 21/09 :
       réglage `attribution` désactivé (`~/.cursor/cli-config.json`), crochet
       `tools/git-hooks/commit-msg` installé dans les trois dépôts (à réinstaller
       après un clone, voir `CLAUDE.md`), puis, **avec l'accord du
       propriétaire**, réécriture des trois `main` et branches de travail à
       16:40 (`git filter-repo` sur clones frais ; trailers web 49 → 0, mobile
       31 → 0, desktop 26 → 0 ; arbres, auteurs, dates préservés ;
       `push --force-with-lease`). Tous les hashs de ce fichier et
       d'`ETAT-DU-PROJET.md` ont été convertis avec les cartes de réécriture.
       **Reste** : prévenir les coéquipiers (clone antérieur → `git fetch &&
       git reset --hard origin/main` ; leurs branches ne sont pas touchées) et
       vérifier chaque nouveau commit par `git show -s --format=%B HEAD`.
9. [ ] **Remplacer les emplois du temps fictifs ICT4D L2 et L3** par les
       officiels dès réception (§4) : `scripts/data/fs-uy1-2026-2027.mjs`, bloc
       « DONNÉES FICTIVES PROVISOIRES », puis
       `node scripts/seed-academic-reference-data.mjs --dry-run` et `--prune`.
       Tant qu'ils sont là, **ne pas les présenter comme officiels** : un
       étudiant réel de L3 les voit.
10. [ ] **Visioconférence desktop à deux machines** (§5) : hôte + participant
        desktop + participant navigateur par `http://IP:port/join/CODE` ;
        feuille de présence remplie par les webhooks ; exports PDF et Excel
        dans `Documents/UniFlow/Présences` ouverts et lus. Consigner le
        résultat, quel qu'il soit.
11. [ ] **Mobile sur un téléphone, en release** (§3) : installer l'APK signé
        (`flutter build apk --release --split-per-abi`, `android/key.properties`
        à fournir hors dépôt), vérifier connexion, inscription directe, badges,
        notification en release (icône `ic_stat_uniflow`), hors ligne.
12. [ ] **`IMAGES-UNIFLOW/README.md`** : ajouter la section `badges/` (six
        médailles `badge_*.webp` + `.png`, `originaux-generes/`, usage : rangée
        de l'accueil mobile et page `/badges`). Le dossier existe depuis le
        21/09 matin, le README ne le mentionne pas.
13. [ ] **Mobile : `assets/brand/uniflow_logo_horizontal.png`** à rastériser
        depuis le SVG (§3) ; l'écusson l'est déjà (`b2236e9`).
14. [ ] **Compteur du seed trompeur derrière le CDN** (§4) : 503 réessayé →
        409 → compté « mis à jour ».
15. [~] **Chantier « jeu d'icônes »** — **commité et poussé** le 21/09
        après-midi (web `af164e5`, `f4935f8` ; mobile `e89b426` → `7dd97a8` ;
        desktop `715ae75`), avec un test mobile « plus aucune icône Material
        dans `lib/` ». Suite web rejouée à 16:20 : **214/214**. **Reste** :
        rejouer `flutter test` mobile et desktop sur les arbres finaux
        (`a58f3de`, `8f0c8d9`) et consigner les chiffres — les 585 / 585
        datent d'avant les icônes et l'ancrage d'Uni.
16. [ ] **Web, performance « vague 2 »** (Lighthouse production avant
        `/download` : **32 mobile / 39 desktop**). Dans l'ordre : (a) service
        worker — `controllerchange` dans `src/services/pushNotificationService.ts`
        recharge la page à la première visite (≈10,9 s comptés en
        « redirection ») : ne recharger qu'à la demande de l'utilisateur ;
        (b) paquet principal 1,3 Mo minifié — GSAP (113 Ko) remplacé par
        framer-motion ou chargé à la demande, mascottes sorties du paquet
        (119 Ko inlinés) vers des fichiers précachés, Phosphor et textes
        légaux à la demande, `build.rollupOptions.output.manualChunks` ;
        (c) logo LCP : 470 Ko en PNG depuis Appwrite → WebP local léger ;
        (d) polices Inter auto-hébergées ; (e) `account.get()` silencieux pour
        un visiteur anonyme (401 en console) ; (f) accessibilité : contraste
        du pied de page, un `<main>` par page, ordre des titres. Puis rejouer
        Lighthouse et consigner avant/après dans `ETAT-DU-PROJET.md`.
17. [ ] **Publier la version de bureau** quand un binaire existe : release
        GitHub `KERNEL-FORGE-G/uniflow-apps`, puis
        `node scripts/set-app-release.mjs windows|linux|macos --url … --version … --from <fichier>`
        (ou Administration › Paramètres › Applications à télécharger, compte
        `kernel@forge.codes`). La page `/download`, la landing et les pieds de
        page basculent seuls de « bientôt » au bouton.
18. [ ] **Prochain APK** : signé avec la clé de release
        (`android/key.properties`, `uniflow-mobile/docs/publication-android.md`),
        nommé `uniflow-<version>.apk`, notes prévenant qu'il faut désinstaller
        la 1.0.0 (signature debug, mise à jour par-dessus impossible) ;
        publication par `set-app-release.mjs android --from <apk>` (taille et
        SHA-256 calculés).
19. [ ] **Web : `HashRouter` → `BrowserRouter`** (URLs sans `#/`, redirection
        des anciennes, `vercel.json` rewrites, service worker), après le
        point 16. Puis **CI GitHub Actions** appelant `npm test` et `npm run
        build` (le web n'a pas de workflow).
20. [ ] **Équipe à dix — compléter la fiche de DJOMGUE Miguel** (contact,
        compte GitHub, photo) depuis Réglages > Équipe ou dans
        `scripts/seed-team-members.mjs` ; le seed rapproche désormais par
        `slug`, donc les membres saisis depuis l'administration (Tessoh)
        survivent à un re-run — **relancer le seed écrase toutefois les champs
        qu'il connaît** (rôle, badge, accent…) avec ses propres valeurs : y
        reporter d'abord toute modification faite depuis l'administration.
        Le plan de la semaine du 22 au 28/09 sort de
        `PROMPT-CLAUDE-PLAN-7-JOURS.md` (racine) : renseigner les
        `[À COMPLÉTER]` (disponibilités, canal, autres anciens du frontend
        web) avant de le coller dans Claude ; le zip
        `PLAN-7-JOURS-UNIFLOW.zip` porte le même prompt avec les mascottes et
        le logo pour l'équipe.


---

## 10. Session du 2026-10-02 — Gamification + Design Lovart + Super-agent

**Ordre de reprise conseillé : A (Appwrite bucket+seed), B (tests design), C (super-agent), D (deploy fonctions).**

### A. Appwrite Cloud — à faire manuellement (console)

- [ ] **Créer le bucket `badges_assets`** sur le projet `uniflow` (Appwrite Cloud)
- [ ] **Uploader les 100 images de badges** dans ce bucket (PNG/WebP 256×256 minimum)
- [ ] **Mettre à jour les `imageFileId`** dans `scripts/seed-badges-part1.mjs` et `seed-badges-part2.mjs` avec les vrais IDs du bucket
- [ ] **Provisionner les nouvelles collections** : `node scripts/appwrite-schema.mjs` (ou `provision-appwrite-selfhosted.mjs`)
- [ ] **Lancer les seeds** : `seed-badges-part1.mjs` + `seed-badges-part2.mjs` + `seed-quests.mjs`

### B. Design Lovart — appliquer sur les 3 clients (sous-agents actifs le 2026-10-02)

Planches Lovart validées par le propriétaire (2026-10-02). Design **clean white** :
- Fond `#F0F6FF`, cards `#FFFFFF` + ombres douces, primaire `#1E3A8A`, teal `#0D9488`
- **Zéro glassmorphism** (backdrop-filter, bg-white/X, fond sombre `#0B0F1A`)

- [ ] **Mobile** : appliquer theme clean white sur onboarding, login, dashboard, badges, quêtes (sous-agent `5ad9b4b8`)
- [ ] **Web** : GamificationPage fonctionnelle + TypeScript propre + lien navigation (sous-agent `71b2b8ff`)
- [ ] **Desktop** : appliquer theme clean white (sous-agent `c68db190`)
- [ ] **Valider les builds** sur émulateur Genymotion (mobile) et Chrome (web)
- [ ] **Planche 3 (Messagerie)** : redesign de MessagingPage mobile selon le design Lovart — bulles rondes colorées, avatars circulaires, FAB, couleurs UniFlow

### C. Super-agent UniFlow (demandé le 2026-10-01)

Basé sur le workflow n8n `Assistant_IA_-_3_Sous-Agents___Image_HF___Notion___API_Webhook` fourni par le propriétaire.

- [ ] **Analyser le workflow JSON** : `/home/ravel/.kiro/crew/uploads/a2af287e227b44b08c2a7290ac06f070_Assistant_IA_-_3_Sous-Agents___Image_HF___Notion___API_Webhook___Arch_FAQ_Telegram___Accueil_KERNEL_FORGE__v5_.json`
- [ ] **Créer le super-agent UniFlow** dans la Function `uniflow-api` : orchestre 3 sous-agents (Image HF, Notion, FAQ Telegram)
- [ ] **Intégrer dans UniAssistant** (mobile + desktop + web) : le bouton chat Uni déclenche le super-agent

### D. Déployer les nouvelles Functions Appwrite

- [ ] **`morning-greetings`** : déployer + cron `0 7 * * *` (7h chaque matin, fuseau Cameroun WAT = UTC+1 → `0 6 * * *` UTC)
- [ ] **`quest-reset`** : déployer + 3 crons : hebdo `0 0 * * 1`, mensuel `0 0 1 * *`, annuel `0 0 1 1 *`

### E. Validations en attente

- [ ] **Push web** : commit local `feat(web): GamificationPage + clean white` — à pusher après validation visuelle du propriétaire
- [ ] **Test émulateur** : lancer l'app mobile sur Genymotion (127.0.0.1:6555), parcourir onboarding → login → dashboard → badges → quêtes
- [ ] **Test web Chrome** : `npm run dev` dans `uniflow-we`, parcourir `/app/badges-quetes`

---

## 9. Suite n8n de l'assistant — écrite, testée, **jamais installée** (2026-09-26)

Le code est au dépôt (`uniflow-we/docs/n8n/`, `uniflow-we/scripts/`,
`functions/uniflow-api/src/{lib,services}/assistant.js`) et validé par
`npm test`. Rien de tout cela ne tourne sur `n8n.kernelforge.codes` : la sonde
du 26/09 y reçoit un **404 « webhook not registered »**, le message de n8n quand
le workflow n'est pas activé. La procédure complète, avec les valeurs exactes,
tient dans `uniflow-we/docs/n8n/README.md` ; en dessous, les gestes qui ne
peuvent être faits **que** depuis une console — Appwrite, n8n ou le VPS.

- [ ] **A. Importer les trois workflows, dans l'ordre** : `uni-gabarit-html`,
        puis `uni-bienvenue-inscrit` (ouvrir le nœud `Gabarit Uni` et remplacer
        `REMPLACER_APRES_IMPORT` par l'ID du gabarit), puis
        `uni-passerelle-assistant`. Ils s'importent inactifs : ne pas activer
        avant D.
- [ ] **B. Credential Header Auth** `UniFlow · Jeton passerelle` sur n8n — Name
        `x-uniflow-token`, Value `openssl rand -hex 32` — affecté au nœud
        `Webhook UniFlow` (le JSON porte `"A_CREER"` tant qu'il n'existe pas).
        La clé Gemini vit dans le credential `Google Gemini(PaLM) Api` déjà
        présent ; le Gmail OAuth2 de la bienvenue aussi.
- [ ] **C. Variables du VPS** : `APPWRITE_WEBHOOK_SECRET=<secretcommun>` et
        `N8N_BLOCK_ENV_ACCESS_IN_NODE=false` (sans la seconde, `$env` est vide
        et le webhook de bienvenue **refuse toute livraison par construction**),
        puis redémarrer n8n.
- [ ] **D. Webhook Appwrite Cloud** (projet `uniflow`) : URL
        `https://n8n.kernelforge.codes/webhook/appwrite-users`, User Auth **off**,
        événements `users.create` seul, secret = celle de C, activé. La signature
        attendue est un HMAC-SHA1 de `(URL + corps brut)` : le nœud Webhook porte
        `options.rawBody: true`, **à ne pas « nettoyer »** — sans le corps brut,
        le HMAC ne concorde jamais et le symptôme est un 403 permanent.
- [ ] **E. Variables de la Function `uniflow-api`** : `N8N_WEBHOOK_URL` (ou
        `N8N_HOST`, hôte seul) et `N8N_WEBHOOK_TOKEN` = le jeton de B. Garder
        `MISTRAL_API_KEY` (c'est le secours). **Retirer `GEMINI_API_KEY`** : la
        Function ne la lit plus, et la laisser signerait deux factures pour une
        seule conversation.
- [ ] **F. Activer les deux workflows d'entrée** (bienvenue et passerelle), puis
        vérifier dans l'ordre : `node scripts/measure-n8n-assistant.mjs --gateway
        --runs 5` (surcoût et latence réels), `--compare` avec `GEMINI_API_KEY`
        pour soustraire ce que Google paie de ce que n8n ajoute, une réponse dans
        le chat web, puis **la sortie du nœud Webhook de la bienvenue** sur une
        vraie inscription — la doc Appwrite ne garantit ni l'enveloppe du payload
        ni l'en-tête d'événement, c'est le seul point qui peut demander un
        correctif dans `Vérifier la signature`.
- [ ] **G. Avant F, avertir qui de droit** : les emails partiront pour de vrai.
        Seuls les TLD réservés (`.test`, `.local`, `.invalid`, `@example.*`) sont
        filtrés ; les comptes réels déjà en base — `@facsciences-uy1.cm` et trois
        Gmail — recevront la bienvenue s'ils se ré-inscrivent.
- [ ] **H. Reste à construire** dans la même suite, par ordre d'utilité :
        la **moitié « dans l'application » de la bienvenue** (une ligne dans
        `notifications` écrite par la Function `notification-alerts` ; le
        §2 d'`ETAT-DU-PROJET.md` note qu'elle n'est pas faite) ; un sous-workflow
        **Telegram** et un sous-workflow **PDF**, tous deux branchés sur le
        gabarit HTML ; puis, le jour où l'étape 2 du plan du propriétaire sera
        venue (n8n déclenche les automatisations), les appels croisés entre
        workflows. **Ne pas** câbler
        l'orchestrateur à sous-agents sur la conversation étudiante : quatre
        allers-retours de modèle minimum pour un message, et un petit modèle
        appelle mal ses outils — la passerelle actuelle est déterministe et rend
        la consigne exacte de la Function.
- [ ] **I. Textes à mettre en conformité** : la confidentialité, l'à-propos et
        les CGU doivent nommer Google (via n8n) comme sous-traitant de la
        conversation, puisque la clé et les prompts quittent l'infrastructure
        UniFlow pour le VPS KERNEL FORGE.
