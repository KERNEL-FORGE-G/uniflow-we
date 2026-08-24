# UniFlow

> **Plateforme web de gestion universitaire centrée sur les parcours académiques réels : cours, emploi du temps, présence QR, notes et messagerie.**

[Tester la démonstration](https://uniflow.kernelforge.codes/) · [Consulter le code source](https://github.com/KERNEL-FORGE-G/uniflow-we) · [Ouvrir ce README pour Devpost](https://github.com/KERNEL-FORGE-G/uniflow-we#readme)

UniFlow est une application web développée par **KERNEL FORGE**. Sa référence fonctionnelle actuellement validée est volontairement limitée à **l’Université de Yaoundé I (UY1), la filière ICT4D et le niveau L1**. Cette limite permet de privilégier des parcours testés, des permissions explicites et des données Appwrite persistantes plutôt que des écrans de démonstration fictifs.

## Essayer UniFlow

| Lien Devpost | Adresse | Usage |
|---|---|---|
| Démonstration publique | <https://uniflow.kernelforge.codes/> | Découvrir l’accueil et les parcours publics de la plateforme. |
| Code source | <https://github.com/KERNEL-FORGE-G/uniflow-we> | Examiner l’implémentation React et Appwrite. |
| Documentation du projet | <https://github.com/KERNEL-FORGE-G/uniflow-we#readme> | Vérifier le périmètre, l’architecture, les tests et les limites connues. |

Pour Devpost, utiliser le **domaine de démonstration** et le **lien vers ce README** parmi les liens « Essayez-le ». Aucun lien vers une vidéo ne doit être ajouté avant qu’une vidéo publique compatible ne soit effectivement publiée.

## Périmètre fonctionnel validé

| Module | Fonctionnalité réellement raccordée | Données et contrôle |
|---|---|---|
| Accès et profils | Inscription, connexion, restauration de session et navigation accueil ↔ espace utilisateur | Authentification Appwrite ; IndexedDB ne conserve que des métadonnées de session non sensibles. |
| Référentiel académique | UY1 / ICT4D / L1, cours et créneaux académiques | Collections Appwrite avec inscription académique idempotente. |
| Emploi du temps | Grille académique construite depuis les créneaux enregistrés | Données `academic_schedules` Appwrite. |
| Présence | Appel, QR temporaire, scan, expiration, révocation et historique horodaté | Function Appwrite sécurisée ; contrôle d’inscription au cours. |
| Notes | Saisie, modification, suppression et moyennes pondérées | Function Appwrite sécurisée, avec liste d’apprenants inscrits. |
| Messagerie | Conversations autorisées, envoi et marquage lu persistant | Function Appwrite sécurisée et contrôle des participants. |
| Bibliothèque | Consultation de ressources académiques | Collections Appwrite et bucket unique `uniflow_assets`. |
| Abonnement | Demande avec référence persistante et lien WhatsApp prérempli | La décision reste manuelle après contrôle externe par un administrateur. |

## Architecture

UniFlow est un frontend **React 18 + TypeScript + Vite**, mis en forme avec **Tailwind CSS** et routé avec React Router. Les données, l’authentification, le stockage et les opérations sensibles utilisent exclusivement une instance **Appwrite auto-hébergée**. Le navigateur ne contacte pas les anciens backends universitaires ou personnels.

```text
Navigateur React / Vite
        │
        ├── Appwrite Account      → authentification et session
        ├── Appwrite Databases    → profils, cours, planning, notes, forum, etc.
        ├── Appwrite Storage      → bucket uniflow_assets
        └── Appwrite Functions    → présence QR, notes, messagerie,
                                     inscription académique et abonnement
```

Les opérations qui requièrent des autorisations renforcées passent par des Functions Appwrite. Les clés d’API serveur n’appartiennent jamais au bundle Vite ni aux fichiers de configuration publics.

## Démarrer en local

### Prérequis

| Élément | Version ou accès attendu |
|---|---|
| Node.js | 18 ou version ultérieure |
| Gestionnaire de paquets | `pnpm` recommandé |
| Appwrite | Une instance avec le projet, la base, le bucket, les collections et les Functions UniFlow provisionnés |

```bash
git clone https://github.com/KERNEL-FORGE-G/uniflow-we.git
cd uniflow-we
pnpm install
cp .env.example .env
pnpm dev
```

Vite sert ensuite l’application sur `http://localhost:3000` par défaut. Avant de créer un compte ou d’effectuer un appel, ajouter cette origine web aux plateformes autorisées du projet Appwrite.

### Variables d’environnement publiques

Copier `.env.example` puis adapter les valeurs à l’environnement. Les variables préfixées `VITE_` sont visibles par le navigateur : elles ne doivent contenir **aucune clé serveur, aucun mot de passe, aucun JWT et aucun secret FCM**.

| Variable | Rôle |
|---|---|
| `VITE_APPWRITE_ENDPOINT` | Endpoint HTTPS de l’instance Appwrite, terminé par `/v1`. |
| `VITE_APPWRITE_PROJECT_ID` | Identifiant public du projet Appwrite. |
| `VITE_APPWRITE_DATABASE_ID` | Identifiant de la base UniFlow. |
| `VITE_APPWRITE_STORAGE_BUCKET_ID` | Identifiant du bucket unique des ressources. |
| `VITE_APP_URL` | URL publique de l’interface web. |
| `VITE_APPWRITE_*_FUNCTION_ID` | Identifiants publics des Functions utilisées par l’interface. |
| `VITE_APPWRITE_PUSH_PROVIDER_ID` et `VITE_FIREBASE_*` | Optionnels ; à renseigner uniquement si un fournisseur push distant est provisionné dans Appwrite. |

## Vérifications

Exécuter les contrôles avant toute publication :

```bash
pnpm run lint
pnpm run build
pnpm run test:e2e:uy1
```

La suite E2E UY1 couvre le cycle d’inscription, les inscriptions aux cours, la présence, les notes, la messagerie et la demande d’abonnement. Elle utilise l’environnement Appwrite prévu pour les contrôles et doit être exécutée sans publier ni communiquer les identifiants temporaires générés.

## Déploiement

La production est servie par Vercel à l’adresse <https://uniflow.kernelforge.codes/>. Pour déployer une évolution :

1. Exécuter les contrôles de la section précédente.
2. Vérifier que les variables publiques Vercel pointent vers le domaine HTTPS Appwrite certifié.
3. Publier la modification sur la branche `main`.
4. Attendre l’état de déploiement prêt, puis contrôler les parcours concernés sur le domaine de production.

Les pages marketing indexables sont livrées sous `public/`. Les routes d’authentification et les espaces privés sont explicitement exclus de l’indexation ; le sitemap ne contient que les pages publiques pertinentes.

## Limites explicites

| Sujet | État actuel |
|---|---|
| Périmètre institutionnel | Validé pour UY1 / ICT4D / L1 ; toute extension nécessite une validation fonctionnelle et institutionnelle distincte. |
| Paiement | Il ne s’agit pas d’un paiement automatisé : une demande est créée, puis un administrateur confirme ou rejette manuellement après vérification externe via WhatsApp. |
| Stripe | Non intégré : aucun code Stripe, secret Stripe ou webhook Stripe ne fait partie du projet. |
| Notifications push distantes | Non activées tant qu’un fournisseur FCM n’est pas configuré dans Appwrite. |
| Géolocalisation de présence | Non présentée comme disponible sans validation technique et métier supplémentaire. |
| Référencement Google | Les fondations SEO sont publiées, mais l’indexation et le positionnement dépendent des processus de crawl et de Search Console. |

## Sécurité et contribution

Signaler une vulnérabilité sans publier de secret, de compte de test, de cookie, de JWT ou de clé d’API dans une issue. Toute contribution doit conserver l’architecture **Appwrite comme unique backend**, préserver les contrôles de rôle et documenter les validations réalisées.

Avant une demande de fusion, vérifier au minimum le typage, le build et le parcours fonctionnel impacté. Les données de démonstration ne doivent jamais être présentées comme des données de production ou des résultats académiques réels.

## Licence

Aucune licence open source n’est actuellement publiée dans ce dépôt. Les droits d’utilisation et de redistribution doivent donc être confirmés auprès de KERNEL FORGE avant toute réutilisation.
