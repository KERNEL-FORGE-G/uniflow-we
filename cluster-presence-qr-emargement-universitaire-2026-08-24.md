# Cluster SEO — Présence QR code université et émargement universitaire

**Objectif :** organiser un ensemble de pages qui répondent aux intentions de recherche sur l’appel, l’émargement et la présence universitaire, en reliant chaque promesse à un comportement UniFlow déjà contrôlé.  
**Périmètre fonctionnel à respecter :** Université de Yaoundé I / ICT4D / L1 pour le cycle académique validé ; séance, jeton QR temporaire, contrôle d’inscription, révocation et historique horodaté. La géolocalisation, la livraison de push FCM distante et un paiement automatisé ne doivent pas être annoncés comme disponibles.

## Architecture cible

| Rôle de page | URL proposée | Intention principale | Contenu à couvrir | Statut éditorial |
|---|---|---|---|---|
| Pilier | `/presence-qr-code-universite` | Comprendre une solution de présence QR à l’université | Définition, rôles, séance, QR temporaire, contrôle d’inscription, historique et limites. | Page publique existante à enrichir. |
| Support 1 | `/emargement-universitaire` | Comprendre l’émargement universitaire | Différence appel / émargement, responsabilités, traçabilité, erreurs à éviter et parcours UniFlow. | À créer. |
| Support 2 | `/appel-etudiant-qr-code` | Savoir comment organiser un appel par QR | Préparation de séance, émission QR, scan, contrôle, statut de présence, annulation ou révocation. | À créer. |
| Support 3 | `/historique-presence-etudiant` | Consulter ou expliquer la traçabilité | Ce qu’un historique horodaté contient, accès par rôle, conservation et limites de consultation. | À créer après validation du contenu public. |
| Support 4 | `/securiser-emargement-qr-code` | Évaluer la sécurité d’un QR d’émargement | Expiration, révocation, inscription au cours, règles d’accès, risques de partage et contrôles réellement disponibles. | À créer ; ne pas revendiquer géolocalisation si elle n’est pas active. |
| Support 5 | `/comment-faire-appel-universite` | Rechercher une méthode opérationnelle | Checklist de séance, rôles, consentement, relevé et suivi administratif. | À créer comme guide neutre et actionnable. |

## Carte de maillage interne

La page pilier doit relier vers les cinq pages de support avec des ancres descriptives, notamment « organiser un émargement universitaire », « appel étudiant par QR code » et « consulter l’historique de présence ». Chaque page de support doit remonter vers le pilier et renvoyer, lorsqu’il est pertinent, vers l’[emploi du temps universitaire](https://uniflow.kernelforge.codes/emploi-du-temps-universitaire) — afin de relier le créneau à la séance — et vers la [plateforme de gestion universitaire](https://uniflow.kernelforge.codes/plateforme-gestion-universitaire) pour le contexte produit.

| Depuis | Vers | Raison du lien |
|---|---|---|
| Pilier présence QR | Emargement, appel QR, historique, sécurité, guide méthode | Distribuer l’autorité thématique et guider les lecteurs par niveau de détail. |
| Appel QR | Emploi du temps universitaire | Expliquer que la séance se rattache à un cours et à un créneau, sans faire de promesse d’automatisation non démontrée. |
| Sécurité QR | Historique de présence | Expliquer la continuité entre validation du scan, état de présence et trace administrative. |
| Guide méthode | Page pilier et plateforme | Ramener le lecteur vers la solution et les fonctions contextuelles, sans forcer une conversion. |

## Brief du pilier : « Présence QR code université »

**Title suggéré :** Présence QR code à l’université : organiser un émargement traçable | UniFlow  
**Meta description suggérée :** Découvrez comment UniFlow structure la présence universitaire : séance, QR code temporaire, contrôle d’inscription, révocation et historique horodaté.  
**H1 :** Gérer la présence universitaire avec un QR code lié à une séance.

| Section | Message principal | Preuve ou limite à inclure |
|---|---|---|
| Pourquoi numériser l’émargement ? | Réduire la saisie manuelle et conserver un relevé lié à une séance. | Ne pas promettre une réduction chiffrée de fraude ou de temps sans mesure. |
| Comment fonctionne le parcours ? | Séance → QR temporaire → scan → contrôle de l’inscription → relevé. | Décrire les contrôles Appwrite validés dans UniFlow. |
| Quels rôles interviennent ? | Délégué ou enseignant habilité, étudiant inscrit, administration. | Ne pas exposer de liste d’utilisateurs ni de données d’étudiants. |
| Que peut-on consulter ? | Séances et historique horodaté selon les droits. | Préciser que l’accès dépend des permissions. |
| Quelles limites ? | Un QR n’est pas à lui seul une preuve de proximité physique. | Géolocalisation et push distant ne sont pas déclarés actifs. |

## Brief des pages de support

### 1. Émargement universitaire : définition, rôles et traçabilité

Cette page doit commencer par distinguer l’**appel** — action de relever une présence — de l’**émargement** — trace associée à une séance. Elle présente ensuite les rôles, les informations minimales à conserver, les cas d’exception et la place de l’historique. Le texte doit rester général avant de présenter un encadré « Comment UniFlow le structure ».

### 2. Appel étudiant par QR code : déroulé d’une séance

Le guide suit cinq étapes : préparer le cours, ouvrir une séance, générer un QR temporaire, scanner avec un compte inscrit, vérifier le relevé. Une FAQ doit répondre à « Que faire si le QR expire ? », « Peut-on annuler un QR ? » et « Que voit un étudiant ? ». Toute réponse doit correspondre à une règle effectivement implémentée.

### 3. Historique de présence étudiant : quelles informations et quels droits ?

Cette page explique la valeur d’un horodatage, la différence entre une vue de suivi et une liste publique, ainsi que les contrôles d’accès. Elle ne doit jamais afficher un exemple avec une identité, un e-mail ou un relevé réel.

### 4. Sécuriser un émargement QR code à l’université

Le texte couvre les limites du QR statique, la durée de vie, la révocation, l’inscription préalable et les permissions. Il doit dire explicitement que la sécurité dépend du paramétrage global et que les contrôles hors périmètre ne sont pas disponibles par défaut.

### 5. Comment faire l’appel à l’université : checklist opérationnelle

Le format est une checklist avant / pendant / après séance : vérifier la liste d’inscrits, identifier l’émetteur habilité, ouvrir la séance, afficher le QR temporaire, suivre les exceptions et contrôler l’historique. La page vise l’intention informationnelle et renvoie vers le pilier pour la solution.

## Standards de publication

Chaque page doit comporter un H1 unique, une URL stable, une canonical, une introduction directement utile, une réponse aux limites, des liens internes descriptifs et une date de mise à jour. Les données personnelles, exemples de connexions et QR réels doivent être exclus des illustrations. Les contenus concurrents associent fréquemment présence, planning et reporting ; UniFlow peut couvrir ces intentions sans reprendre leurs promesses commerciales ni leurs chiffres. [1] [2]

## Références de contexte concurrentiel

[1] [MyScol — Gestion de l’enseignement supérieur](https://myscol.com/logiciel-de-gestion-enseignement-superieur/)  
[2] [Jibble — Suivi des présences pour écoles et universités](https://www.jibble.io/fr/logiciel-de-suivi-des-presences-des-etudiants-et-des-enseignants)
