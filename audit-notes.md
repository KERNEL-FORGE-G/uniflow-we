# Notes d’audit initial

## Dépôt
- Dépôt analysé : `KERNEL-FORGE-G/uniflow-we`
- Branche : `main`
- Le dépôt contient une application React + TypeScript + Vite, avec Tailwind CSS, React Router DOM et Axios.
- Le dépôt cloné est propre au moment de l’audit (`main...origin/main`).

## Vérifications locales
- `npm ci` / installation des dépendances : terminé.
- `npm run typecheck` : réussi.
- `npm run build` : réussi.
- Le serveur Vite démarre sur `http://localhost:3000/`.

## Vérification navigateur
- La page d’accueil se charge après rendu et affiche une landing page UniFlow en français.
- Les liens utilisent un `HashRouter` (`#/about`, `#/app`, `#/login`, etc.).
- Les parcours visibles comprennent : À propos, Équipe, Sentinelle, Tarifs, Présentation, Forum, Contact, Connexion et Démo gratuite.
- La page contient un calculateur d’impact avec curseur, une sélection d’espaces par rôle et une FAQ accordéon.
- La première capture affichait un écran blanc alors que l’extraction textuelle signalait déjà le contenu ; une seconde vérification a confirmé le rendu visuel complet. À surveiller comme possible délai de rendu/performance.
- Les métriques affichées passent de valeurs marketing sur la landing à des valeurs dynamiques plus faibles dans la vue locale (`5+` étudiants, `4+` enseignants), ce qui suggère une dépendance API ou un fallback de démonstration à documenter.

## Suite prévue
1. Inspecter `src/App.tsx`, `src/lib/api`, les hooks et les pages principales.
2. Vérifier les routes et les parcours de connexion/démonstration.
3. Examiner la configuration PWA, le service worker, les variables d’environnement et la gestion offline.
4. Reproduire les erreurs réseau ou d’interface puis appliquer les corrections prioritaires.

## Parcours de connexion observé

- La page de connexion propose quatre boutons de démonstration : Étudiant, Délégué, Enseignant et Admin.
- Le bouton Étudiant préremplit `emma.martin@uniflow.edu` et `password123`.
- Après soumission, le bouton passe à « Connexion en cours… » et la route reste sur `#/login` au moment de l’observation. Cela peut être un délai API réel, un blocage réseau/CORS ou un fallback local mal déclenché ; il faut vérifier les journaux et la logique de login.

## Résultat après attente

- La connexion de démonstration finit par rediriger vers `#/app` et charge le tableau de bord étudiant.
- Le tableau de bord affiche les modules principaux, les cinq cours locaux, les devoirs, les notes, le calendrier, les actions rapides et les statistiques.
- La console signale explicitement `[API Auth] Fallback local mode pour démonstration de connexion.` ; le parcours repose donc sur un mécanisme de secours local quand l’API distante ne répond pas immédiatement ou n’est pas disponible.
- Aucun message d’erreur JavaScript bloquant n’a été relevé dans la dernière sortie de console.
- Point d’amélioration prioritaire : rendre le fallback local plus explicite et plus rapide, ou afficher un état réseau clair afin d’éviter l’impression d’un blocage pendant la connexion.

## Validation après correction

Le test avec `inconnu@example.invalid` et un mot de passe invalide reste sur `#/login` et affiche `Erreur API HTTP 400`. Aucune redirection vers le tableau de bord ni création de compte mock n’a été observée. Le mode local est donc désormais réservé au bouton de démonstration explicite.

Le bouton Étudiant de démonstration continue de rediriger vers `#/app` après soumission. Le tableau de bord se charge sans erreur bloquante. Le profil local affichait toutefois un état de compte indépendant dans cette session navigateur, signe que le stockage local persiste des choix précédents ; ce point devra être réinitialisé ou mieux isolé entre scénarios de démonstration.

Après attente, la démo redirige bien vers `#/app` et affiche le profil étudiant avec les données locales attendues (5 cours, 4 devoirs, moyenne 15,6/20). Le stockage local contrôlé juste avant la transition ne contenait pas de token, ce qui confirme que l’extraction intermédiaire était transitoire ; après la transition, le tableau de bord est stable.

La modale d’expiration de session a été déclenchée par événement et s’affiche correctement au-dessus du tableau de bord, avec un titre explicite, un texte de protection des données, une fermeture et un bouton « Se reconnecter ».

## Observations externes de production

Source : https://uniflow.kernelforge.codes/

Le site déployé est accessible et sert la landing page UniFlow avec un HashRouter. La route publique `/` rend correctement les liens `#/login`, `#/register`, `#/app` et les pages marketing.

Source backend testée : https://api-uniflow.kernelforge.codes/

`GET /auth/academic-options` a répondu HTTP 200 avec une enveloppe `success/data` contenant des niveaux et spécialités réels. `GET /courses` a répondu HTTP 401 sans jeton. Les chemins `/api/auth/academic-options`, `/api/courses` et `/api/subscription/plans` ne correspondent pas aux chemins actifs observés ; la couche frontend doit donc utiliser les chemins racine (`/auth/...`, `/courses`, etc.) avec l’enveloppe `success/data`.

`https://api-uni.uniflow.edu` ne résout pas dans l’environnement de test. `https://uniflow-personal-backend.vercel.app` répond `DEPLOYMENT_NOT_FOUND`. L’exemple d’environnement a été corrigé pour le backend universitaire actif et le backend personnel est désormais vide tant qu’un déploiement réel n’est pas fourni.

Source backend documentaire : https://github.com/KERNEL-FORGE-G/uniflow-we/blob/main/API_UNIVERSITY.md

La documentation décrit notamment `POST /api/auth/login`, `GET /api/courses/mine`, `POST /api/attendance/scan` et `GET /api/grades/my-grades`, mais les réponses observées en production utilisent les chemins racine correspondants. Cette divergence devra être clarifiée dans la documentation avant la finalisation.
