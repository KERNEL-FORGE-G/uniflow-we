
## Inscription

Le bouton `Créer un compte` ouvre bien `#/register`. En mode `Université (BD)`, le formulaire affiche l’université et la destination backend universitaire. Après sélection de `Indépendant`, ces champs disparaissent et la destination devient `Backend Indépendant (SaaS) — https://api2-uniflow.kernelforge.codes/`. Le formulaire conserve uniquement prénom, nom, email et rôle étudiant/enseignant, ce qui correspond au parcours PERSONAL sans affiliation.

Le bouton `Continuer` mène à une étape dédiée `Sécurité du compte indépendant`. Cette étape ne demande ni université, ni niveau, ni spécialité ; elle demande seulement le pays de facturation et les mots de passe. Le formulaire est cohérent avec un compte PERSONAL autonome.

Le formulaire PERSONAL a été rempli avec un compte de test dédié et soumis depuis le navigateur. Le bouton passe à `Création en cours…`, mais le backend personnel de production reste indisponible avec HTTP 503 ; l’inscription ne peut donc pas être finalisée tant que la connexion Neon Vercel n’est pas rétablie.

Le navigateur affiche correctement l’erreur backend : « La base de données est temporairement indisponible. Vérifiez la connexion Neon du backend puis réessayez. » après la soumission PERSONAL. Le lien `Se connecter` ramène correctement à `#/login` et le mode universitaire réaffiche le backend universitaire.

Le compte universitaire de test a été saisi dans le navigateur et la soumission a été déclenchée. Le bouton affiche `Connexion en cours…`; la réponse finale de l’API universitaire doit encore être observée.

Lors du premier test universitaire, le navigateur a affiché une ancienne notification `Session fermée (30 min d’inactivité)`. La session locale a été nettoyée puis la page rechargée ; le formulaire est revenu à son état initial. Cette notification provenait de l’état local du navigateur et non d’une réponse d’authentification actuelle.
