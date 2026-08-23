# UniFlow — constats de stabilisation du 23 août 2026

## Sources externes vérifiées

- Production UniFlow : https://uniflow.kernelforge.codes/
- API Appwrite certifiée : https://appwrite.kernelforge.codes/v1
- Projet Appwrite : `6a885ccc000ddfbb3bb9`

## Résultats Appwrite

- Le compte `admin.uy1.ict4d@uniflow.test` correspond à l’utilisateur `demo_uy1_admin_01`.
- Le document `academic_directory/directory_demo_uy1_admin_01` existe et porte `role=ADMIN`, `university=Université de Yaoundé I`, `program=ICT4D`, `level=L1`.
- La Function `attendance_secure` renvoyait `PROFILE_REQUIRED` car son API key serveur n’était pas présente dans les variables de la Function. Après ajout de la variable protégée `APPWRITE_FUNCTION_API_KEY` et nouveau déploiement, l’audit admin est passé en HTTP 200.
- Audit final : `healthy=true`, 10 cours, 40 inscriptions, 10 créneaux, 11 séances, 21 relevés, 1 jeton QR, 0 géorepère, 0 doublon, 0 orphelin, 0 relevé invalide.
- Une séance QA en doublon (`6a8ac5ff0028c57f0eae`) et ses deux relevés (`6a8ac618003cbc532bd1`, `6a8ac6190025ee34efaa`) ont été supprimés après vérification de l’absence de QR/géorepère ; la séance QR `qrsessmt5t3b95` a été conservée.

## Scénarios QR validés

- Issue délégué : HTTP 200, jeton et expiration retournés.
- Scan étudiant inscrit à la position autorisée : HTTP 200.
- Rejeu du même scan : HTTP 200, `idempotent=true`, message « Présence déjà enregistrée. ».
- Scan à environ 2,6 km : HTTP 403, `PROXIMITY_DENIED`, distance 2623 m.
- Révocation par l’émetteur : HTTP 200.
- Scan après révocation : HTTP 422, `TOKEN_INVALID`.

## Production navigateur

La page d’accueil et l’écran de connexion de https://uniflow.kernelforge.codes/ se chargent. La connexion admin a redirigé vers `#/admin`; le tableau de bord affichait les données Appwrite réelles (4 utilisateurs étudiants/délégués, 82 % de présence, 11 séances, filière ICT4D). La page `#/admin/securite` s’est chargée sans erreur console visible.

## Code en cours

- `functions/attendance-secure/src/main.js` normalise `user:` et utilise la clé serveur.
- Nouvelle Function locale `functions/admin-directory/src/main.js` pour CRUD admin UY1/ICT4D/L1, avec garde-fou contre suppressions de comptes possédant des références académiques.
- `src/lib/appwrite.ts` expose `executeAdminDirectoryAction`.
- `src/lib/api.ts` branche `studentsApi` et `teachersApi` sur cette Function.
- Les pages admin étudiants/enseignants demandent un mot de passe initial explicite au lieu d’un secret codé en dur.
- La Function `admin_directory` a été créée dans Appwrite, mais l’ajout de sa variable `APPWRITE_FUNCTION_API_KEY` a expiré côté réseau et doit être vérifié/rejoué idempotemment avant déploiement et test CRUD.
## CRUD administrateur et alertes

La Function `admin_directory` a été créée avec exécution réservée aux utilisateurs authentifiés, clé serveur protégée et portée fixe UY1 / ICT4D / L1. Après correction de la signature `Users.create` et séparation des attributs `users`/`academic_directory`, un cycle create/update/delete éphémère a été exécuté en production ; aucun mot de passe n’a été retourné et la recherche des comptes QA n’a laissé que le compte QA VPS préexistant.

La Function `notification_alerts` est maintenant déployée avec les événements Appwrite de présence et de planning. Un créneau personnel QA a déclenché une notification réelle dans `notifications` (`type=system`, `scheduleId=alertqa1787496794`, `eventKey` idempotente), puis le créneau et la notification ont été supprimés avec HTTP 204. Le canal est donc fonctionnel pour les notifications in-app Appwrite ; la livraison push distante reste conditionnée à la configuration FCM.
## Vérification navigateur après publication

Après le push `3b290cb` sur `main`, l’URL canonique `https://uniflow.kernelforge.codes/` sert le nouveau bundle Vercel. La navigation vers `#/admin/securite` a affiché l’administration et la page Sécurité & Accès sans erreur console visible. Depuis l’accueil, le lien « Accéder à l’application » a reconnu la session persistante et affiché « Connecté / Mon espace ».

Le tableau de bord connecté affiche toutefois des états « Aucune donnée » pour les indicateurs qui ne sont pas chargés sur cette route dans cette session, sans valeurs fictives. La console n’a signalé aucune erreur ; les pages spécialisées restent la source des listes Appwrite réelles. Ce point doit être conservé comme état à surveiller plutôt que remplacé par des nombres inventés.
## Test CRUD depuis l’interface

Après invalidation du cache PWA de la session de test, la production a servi `index-CBbtjtiE.js` et affiché « Appwrite · CRUD sécurisé », le bouton « Ajouter un étudiant » ainsi que les actions modifier/supprimer. Le formulaire a créé le compte QA `qa.crud.1641853@kernelforge.codes` ; l’exécution `admin_directory` correspondante est terminée avec HTTP 200 et les collections contenaient bien le profil UY1 / ICT4D / L1. Le compte Auth et son document `academic_directory` ont ensuite été supprimés avec HTTP 204. Aucun artefact de test n’est conservé.
## Vérification Enseignants

La page `#/admin/enseignants` de production affiche désormais « Appwrite · CRUD sécurisé », le bouton « Ajouter un enseignant » et les actions de modification/suppression sur la ligne existante. Le formulaire d’ajout expose prénom, nom, email et mot de passe initial, puis a été fermé sans créer de donnée supplémentaire. Le chargement initial du répertoire peut prendre quelques secondes pendant la résolution de session Appwrite, mais il se termine et présente les données réelles.

## Répertoire administratif sécurisé — complément

La Function `admin_directory` expose désormais une action `list` réservée à un administrateur UY1 / ICT4D / L1. Elle joint les profils et le répertoire uniquement côté serveur afin de transmettre les emails réels aux pages Étudiants et Enseignants sans étendre les permissions de lecture du navigateur. La version production affiche les quatre apprenants existants et leurs contacts Appwrite réels. Les requêtes de répertoire sont dédupliquées en mémoire pendant 60 secondes et le cache est invalidé après toute création, mise à jour ou suppression.
