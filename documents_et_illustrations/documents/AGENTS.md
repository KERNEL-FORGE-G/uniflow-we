# UniFlow — consignes de travail

Ce dossier contient quatre dépôts qui partagent un seul backend, **Appwrite
Cloud** (projet `uniflow`, région Francfort) : `uniflow-we` (web, et source du
schéma, des Functions et des scripts), `uniflow-mobile` et `uniflow-desktop`
(Flutter), `uniflow-backend` (ancien NestJS hors service ; son `.env` non
versionné porte la clé serveur). `README.md` à la racine est la carte du
projet. Aucun autre service tiers : **pas de Firebase**, uniquement Appwrite.

## Au début de chaque session

**Lis `ETAT-DU-PROJET.md`** (racine). Il dit où en est le projet, ce qui a été
appris à la dure sur le serveur, et ce qui reste. **Lis `TRAVAUX-RESTANTS.md`**
ensuite : c'est la reprise détaillée, tâche par tâche.

Ne redécouvre pas l'état du projet par toi-même : il est écrit là.

## Avant de terminer

**Mets les deux fichiers à jour.** Coche ce qui est fini, ajoute ce qui est
apparu, et date la modification. C'est ce qui permet à la session suivante —
qui n'a aucun contexte — de continuer sans repartir de zéro.

Pour cela, l'agent `journal-projet` (`.Codex/agents/journal-projet.md`) fait le
travail : il relit l'historique Git, vérifie les faits et corrige le journal.
Invoque-le après un ensemble de modifications.

## Agents par application

`.Codex/agents/` contient un agent par dépôt : `uniflow-web`, `uniflow-mobile`,
`uniflow-desktop`. Chacun ne travaille que dans son dépôt ; confier une tâche
web, mobile ou desktop à l'agent correspondant, et lancer les trois en
parallèle quand les tâches sont indépendantes.

## Règles du projet

- **Langue** : travailler et répondre en français.
- **Commentaires** : expliquer **pourquoi**, pas quoi. Chaque correction non
  évidente cite le symptôme observé — c'est ce qui évite de la défaire plus tard.
- **Commits** : un commit par ensemble cohérent, poussé après chaque
  modification importante, message en français (sujet + pourquoi).
  **Aucune mention de co-auteur** (ni Codex, ni Cursor, ni aucun agent) dans les messages de commit ou de PR — consigne du propriétaire du 2026-09-20.
  Attention : le harnais Cursor ajoute de lui-même un trailer
  `Co-authored-by: Cursor` à chaque `git commit` d'un agent. Le crochet
  `tools/git-hooks/commit-msg` le retire ; il doit être présent dans
  `.git/hooks/` de chaque dépôt (voir son en-tête pour l'installer après un
  clone) et **vérifier après chaque commit** : `git show -s --format=%B HEAD`.
- **Comptes universitaires** : l'inscription libre ne crée que des
  **étudiants** ; les comptes administration (`ADMIN`) sont créés uniquement
  par l'admin de la plateforme (label `superadmin`, `kernel@forge.codes`) ;
  une administration crée les enseignants, délégués et étudiants de son
  université. La preuve du rôle est le **label Appwrite** de l'utilisateur
  (`ADMIN`, `TEACHER`, `DELEGATE`, `superadmin` ; rien = étudiant), posé par
  les Functions avec la clé serveur ; `users.role` n'est qu'un miroir.
- **Visioconférence** : desktop uniquement (serveur LiveKit local). Le web et
  le mobile n'en portent aucune ; le desktop diffuse un lien navigateur local
  pour les participants sans application.
- **Tests** : toute correction de logique ou de mise en page ajoute un test.
- **Secrets** : aucun identifiant, clé ou jeton dans un fichier versionné, ni
  dans le `.env` des clients Flutter (il est embarqué en clair dans le binaire).
- **Schéma Appwrite** : `uniflow-we/scripts/appwrite-schema.mjs` est la source
  unique. Toute modification passe par lui, puis par
  `node scripts/provision-appwrite-selfhosted.mjs`.
- **Périmètre** : les trois clients se développent en parallèle (la pause du
  desktop a été levée le 2026-09-20). Priorité desktop : visioconférence
  embarquée hors ligne et restriction par rôle.
- **Rangement** : la documentation va dans `docs/` de chaque dépôt (et
  `docs/` à la racine pour le pitch) ; aucun rapport, image ou script ne traîne
  à la racine d'un dépôt.
- **Appwrite Cloud, offre gratuite** : une base, un bucket (`uniflow_assets`,
  droits par fichier), deux Functions (`uniflow-api` routeur +
  `notification-alerts`). Tout nouveau service HTTP est un fichier de
  `uniflow-we/functions/uniflow-api/src/services/`.
