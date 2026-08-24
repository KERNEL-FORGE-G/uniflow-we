# Fiche Devpost — UniFlow

Ce document fournit des textes prêts à copier dans la fiche Devpost. Il décrit uniquement les capacités UniFlow validées dans le périmètre **Université de Yaoundé I / ICT4D / L1**.

## Informations générales

| Champ Devpost | Valeur à copier |
|---|---|
| Nom du projet | `UniFlow` |
| Slogan | `Une plateforme universitaire qui centralise cours, emploi du temps, présence QR, notes et messagerie.` |
| URL de démonstration | `https://uniflow.kernelforge.codes/` |
| URL du code source | `https://github.com/KERNEL-FORGE-G/uniflow-we` |
| URL README à ajouter dans « Essayez-le » | `https://github.com/KERNEL-FORGE-G/uniflow-we#readme` |
| Lien vidéo | Laisser vide tant qu’une vidéo de démonstration publiée sur YouTube, Vimeo, Facebook ou Youku n’existe pas. Ne pas insérer une URL non vérifiée. |

## Histoire du projet — à coller dans « À propos du projet »

```markdown
## Inspiration

Les équipes universitaires jonglent souvent entre listes de cours, emplois du temps, relevés de présence, notes et canaux de communication séparés. Nous avons imaginé **UniFlow** pour rassembler ces parcours dans une expérience académique cohérente, adaptée aux rôles des étudiants, délégués, enseignants et administrateurs.

Le projet a été structuré et validé sur un périmètre concret : **Université de Yaoundé I / ICT4D / L1**. Cette limite nous a permis de privilégier des flux réellement testés plutôt qu’une promesse de plateforme universelle.

## Ce que fait UniFlow

UniFlow centralise les cours, la grille d’emploi du temps, les notes pondérées, la messagerie et le suivi de présence.

Le parcours de présence s’appuie sur une séance, un QR code temporaire, un contrôle d’inscription au cours et un historique horodaté. Les rôles universitaires accèdent uniquement aux actions correspondant à leurs permissions.

La plateforme inclut aussi une messagerie universitaire persistante, avec conversations entre utilisateurs autorisés et marquage explicite des messages lus. Pour les comptes personnels, une demande d’abonnement crée une référence Appwrite en attente ; la confirmation reste manuelle après vérification externe via WhatsApp.

## Comment nous l’avons construit

Nous avons construit l’interface avec **React**, **TypeScript**, **Vite** et **Tailwind CSS**. Les données, l’authentification, les fonctions sécurisées et le stockage s’appuient exclusivement sur une instance **Appwrite** auto-hébergée.

Nous avons utilisé des fonctions Appwrite pour les opérations sensibles, notamment la présence QR, la messagerie et les demandes d’abonnement. La session utilisateur conserve seulement des métadonnées non sensibles dans IndexedDB ; Appwrite reste l’autorité d’authentification.

## Défis rencontrés

Le défi principal consistait à relier des fonctions académiques distinctes sans utiliser de données fictives : un étudiant inscrit doit apparaître dans les cours, la présence et les notes avec des permissions cohérentes.

Nous avons également traité la persistance de session lors de la navigation entre accueil et espace utilisateur, le marquage lu de la messagerie, ainsi que le cycle de vie d’un QR de présence — émission, expiration, révocation et contrôle d’inscription.

## Réalisations dont nous sommes fiers

- Une référence académique réelle et limitée à UY1 / ICT4D / L1, plutôt qu’un démonstrateur générique.
- Un appel QR lié à une séance et contrôlé par inscription, avec historique horodaté.
- Des notes pondérées, une grille d’emploi du temps et une messagerie persistante raccordées à Appwrite.
- Des validations E2E réalisées sur les parcours d’inscription, présence, notes, messagerie et demande d’abonnement.
- Une navigation qui conserve la session sans stocker de mot de passe, jeton ou cookie dans IndexedDB.

## Ce que nous avons appris

Nous avons appris que la confiance dans une plateforme académique vient autant de la qualité des permissions, de la traçabilité et des limites explicites que de la liste de fonctionnalités. Nous avons aussi appris à séparer les capacités démontrées des idées futures et à fonder les améliorations sur des contrôles reproductibles.

## Et maintenant ?

Nous souhaitons poursuivre l’amélioration des contenus d’aide et des parcours académiques, mesurer l’usage réel, et élargir le périmètre uniquement après validation institutionnelle et fonctionnelle. Les fonctions non activées — comme les notifications push distantes, la géolocalisation d’émargement ou les paiements automatisés — ne sont pas présentées comme disponibles.
```

## Étiquettes « Construit avec »

Saisir les étiquettes suivantes, séparément, jusqu’à la limite Devpost :

`React` · `TypeScript` · `JavaScript` · `Vite` · `Tailwind CSS` · `Appwrite` · `Node.js` · `Progressive Web App` · `IndexedDB` · `QR Code` · `Vercel` · `GitHub`

## Projet médias

Téléverser les captures fournies dans le dossier `captures-devpost/` dans cet ordre :

1. `01-emploi-du-temps-uniflow.png` — grille de planning étudiant.
2. `02-mes-cours-uniflow.png` — cours universitaires associés au parcours.
3. `03-accueil-uniflow.png` — page publique de présentation.

Les captures sont anonymisées : elles ne montrent aucun écran de connexion, mot de passe, adresse e-mail ou identifiant saisi.

## Vérification avant d’enregistrer le brouillon

| Élément | Contrôle |
|---|---|
| Description | Aucun résultat chiffré non sourcé et aucune promesse de paiement automatisé. |
| Technologies | Seulement les composants présents dans le projet web publié. |
| Liens | Domaine UniFlow et dépôt GitHub exacts. |
| Médias | PNG, fichier inférieur à 5 Mo, sans données de connexion. Devpost recommande le 3:2, mais les captures réelles conservent leur cadrage natif pour éviter toute bordure ou recadrage artificiel. |
| Vidéo | Laisser vide tant qu’une URL vidéo compatible n’est pas disponible. |

## État du lot final

Les tests Appwrite et les contrôles de production Vercel du 24 août 2026 ont validé le parcours UY1 / ICT4D / L1, le Forum, Contact, la messagerie, les notes, les présences et l’emploi du temps. Le lot peut être téléversé sans ajouter d’image générée, de bordure, de recadrage artificiel ou de donnée de connexion.
