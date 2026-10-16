# KERNEL FORGE · UNIFLOW
## Plan de travail & Plan marketing
### Comment exécuter, où aller, et comment obtenir des retours réellement exploitables.

---

**Projet :** UniFlow — plateforme universitaire offline-first  
**Site :** [uniflow.kernelforge.codes](https://uniflow.kernelforge.codes)  
**Éditeur :** KERNEL FORGE, Université de Yaoundé I  
**Document établi le :** 29 septembre 2026 — **mis à jour le 29 septembre 2026**  
**Horizon :** 90 jours

---

> **Ce que ce document corrige par rapport à la version précédente**
>
> Plusieurs affirmations du document du 29/09 étaient déjà dépassées au moment
> de sa rédaction. Les corrections sont signalées en note dans le texte.
> - La page `/download` fonctionne depuis le 21/09 (elle n'est plus en 404).
> - Les liens de téléchargement de la page d'accueil sont corrigés depuis le 21/09.
> - L'équipe compte **10 membres**, pas 8.
> - Le produit Desktop cible Windows et Linux — **pas macOS**.
> - L'APK 1.0.0 existe et est téléchargeable, mais porte une **signature debug**.
> - Le backend repose sur **Appwrite Cloud** (Frankfurt), pas sur un serveur auto-hébergé.

---

## Sommaire

- [Résumé exécutif — les 6 décisions qui structurent les 90 jours](#résumé-exécutif)
- [Partie A — Plan de travail](#partie-a--plan-de-travail)
  - [A1. Principe directeur et objectifs à 90 jours](#a1-principe-directeur-et-objectifs-à-90-jours)
  - [A2. Sprint 0 — Les correctifs bloquants (semaine 1)](#a2-sprint-0--les-correctifs-bloquants-semaine-1)
  - [A3. Sprint 1 — Socle technique et commercial (semaines 2 à 4)](#a3-sprint-1--socle-technique-et-commercial-semaines-2-à-4)
  - [A4. Sprint 2 — Preuve terrain (mois 2)](#a4-sprint-2--preuve-terrain-mois-2)
  - [A5. Sprint 3 — Industrialisation (mois 3)](#a5-sprint-3--industrialisation-mois-3)
  - [A6. Organisation de l'équipe et rituels](#a6-organisation-de-léquipe-et-rituels)
- [Partie B — Plan marketing](#partie-b--plan-marketing)
  - [B1. Positionnement et cibles prioritaires](#b1-positionnement-et-cibles-prioritaires)
  - [B2. OÙ ALLER — les 10 lieux de diffusion](#b2-où-aller--les-10-lieux-de-diffusion)
  - [B3. COMMENT PARTAGER pour obtenir des retours RÉELS](#b3-comment-partager-pour-obtenir-des-retours-réels)
  - [B4. Du retour brut au témoignage exploitable](#b4-du-retour-brut-au-témoignage-exploitable)
  - [B5. Calendrier éditorial sur 4 semaines](#b5-calendrier-éditorial-sur-4-semaines)
  - [B6. Indicateurs, budget et alertes](#b6-indicateurs-budget-et-alertes)
- [Annexes — scripts prêts à copier](#annexes--scripts-prêts-à-copier)

---

## Résumé exécutif

Ce document répond à deux questions : que fait-on, dans quel ordre, et qui le fait (partie A) ; et où va-t-on parler du projet, et comment obtient-on des retours qui valent quelque chose (partie B).

UniFlow a un produit réel, un socle technique solide, une équipe de **10 personnes** et un accès terrain que personne d'autre n'a : vous êtes étudiants de l'université que vous ciblez. Le problème n'est ni la technologie ni la motivation — il est dans l'ordre des opérations et dans l'absence de boucle de retour.

### Les 6 décisions qui structurent les 90 jours

**1. On corrige avant de promouvoir.**
Plusieurs défauts du site restent ouverts (performance, rendu sans JavaScript, captures vides). Promouvoir avant de les corriger revient à payer pour diffuser des défauts.

**2. On se vend comme la plateforme qui marche sans réseau, pas comme un logiciel de gestion universitaire.**
Le second terrain est déjà occupé par des acteurs installés avec des tarifs publics. Sur le terrain du hors-ligne et de la présence par QR code, aucun concurrent identifié ne se positionne — c'est l'avantage structurel du projet.

**3. On cible d'abord l'intérieur du campus et les instituts privés, pas les universités d'État.**
Cycle de vente de 2 à 6 semaines contre 12 à 24 mois.

**4. On ne demande jamais « vos avis ». On demande une action précise, mesurable, à une personne nommée, avec une échéance.**
C'est la seule méthode qui produit des retours réels.

**5. On sépare l'adoption de la facturation.**
Gratuit pour les étudiants, licence annuelle pour l'établissement. Cette phrase doit être identique partout.

**6. On mesure l'usage, pas les intentions.**
Un retour déclaré vaut zéro si les données d'usage disent le contraire.

### Le piège à éviter absolument

Diffuser largement avant d'avoir une boucle de retour instrumentée. Vous obtiendrez des « c'est bien, bravo » sur WhatsApp — polis, inutilisables, impossibles à citer. Un projet étudiant qui communique beaucoup et ne collecte rien finit avec 500 abonnés et zéro utilisateur.

---

## Partie A — Plan de travail

### A1. Principe directeur et objectifs à 90 jours

**Principe directeur :** un seul produit commercialisé (UniFlow), trois clients payants, une boucle de retour qui tourne. Tout le reste est du service facturé, pas de la recherche.

| Horizon | Objectif de sortie | Critère de réussite, vérifiable |
|---|---|---|
| Semaine 1 | Le site ne contredit plus le produit | Zéro lien cassé, zéro compteur à zéro, captures réelles, moyen de contact visible |
| Mois 1 | Le site est trouvable et capte des contacts | Page d'accueil avec contenu en HTML (sans JavaScript) ; 1 formulaire de lead en ligne ; 30 emails collectés |
| Mois 2 | Preuve terrain et premiers pilotes | 12 démos réalisées ; 3 pilotes signés (écrit, daté, prix de continuation fixé) ; 30 testeurs instrumentés |
| Mois 3 | Capacité de livrer sans se disperser | 1 procédure de reprise de données écrite ; 4 sessions de formation types ; 3 témoignages signés publiés |

---

### A2. Sprint 0 — Les correctifs bloquants (semaine 1)

Un sprint d'une semaine. Chaque ligne a un critère de sortie binaire : soit c'est fait, soit ce ne l'est pas.

> **État au 29/09/2026 :** Les correctifs #1 et #2 (page `/download` et liens de téléchargement) ont été réalisés le 21/09. Le Sprint 0 ne porte donc plus que les points #3 à #7.

| # | Correctif | Pourquoi c'est bloquant | Responsable | Effort |
|---|---|---|---|---|
| ~~1~~ | ~~Réparer la page /download~~ | ~~Renvoie une 404 déclarée en priorité 0.9 dans le sitemap~~ | ~~Backend / web~~ | ~~Fait le 21/09~~ |
| ~~2~~ | ~~Corriger les liens de téléchargement~~ | ~~Les trois boutons de la page d'accueil étaient inopérants~~ | ~~Frontend~~ | ~~Fait le 21/09~~ |
| 3 | Initialiser les compteurs avec les vraies valeurs | Les 4 compteurs « UniFlow en chiffres » partent de 0 avant animation — la section de preuve ne doit jamais pouvoir afficher zéro | Frontend + backend | 3h |
| 4 | Remplacer les écrans vides de l'aperçu par 4 captures réelles | « Aucune séance chargée », « connectez-vous » : vous demandez au visiteur de croire au produit, puis vous lui montrez un écran vide | Frontend + design | 1j |
| 5 | Masquer la section témoignages tant qu'elle est vide | Une section vide coûte plus cher en crédibilité qu'une section absente | Frontend | 30 min |
| 6 | Ajouter un WhatsApp cliquable et une adresse email sur la page d'accueil | Il n'existe aujourd'hui aucun moyen de vous contacter depuis la page d'accueil. WhatsApp est le canal de conversion dominant au Cameroun | Produit | 2h |
| 7 | Réécrire la promesse en une phrase et l'appliquer partout | La page d'accueil dit « 100 % Gratuit », la page offres décrit un accès payant. Aucun établissement ne peut acheter : il ne sait pas s'il doit payer | Produit + rédaction | 2h |

**La phrase à écrire, telle quelle :**

> « UniFlow est gratuit pour les étudiants et les enseignants. L'établissement prend une licence annuelle pour héberger et administrer son campus. »

Cette phrase se place en haut de la page d'accueil, en haut de la page offres, dans le manifeste de l'application et dans la première ligne de votre message de prospection. La même, partout.

#### Deux détails d'exécution supplémentaires

**Sur l'APK Android :** La version 1.0.0 est téléchargeable (87,2 Mo, SHA-256 : `2804af7c…e11773`). Elle porte une **signature debug**, pas une signature de production. Un responsable informatique qui vérifie le certificat avant d'autoriser une installation sur le réseau de l'établissement verra cette différence. Publier le hash SHA-256 complet avec un bouton « copier » est un bon signal de sérieux ; préciser « version de test, signature debug » est plus honnête que de laisser l'installer croire à une version finale.

**Sur la carte Desktop :** La carte annonce Windows et macOS. UniFlow Desktop est disponible sur **Windows** (paquet MSIX soumis au Microsoft Store) et **Linux**. macOS n'est pas dans la feuille de route actuelle. Corriger la carte pour éviter une déception à l'installation.

#### Répartition du Sprint 0 sur la semaine

| Jour | Frontend / web | Backend / infra |
|---|---|---|
| Lundi | Captures d'écran réelles des 4 rôles + cadrage des emplacements | Vérification de la cohérence des chiffres affichés et des chiffres en base |
| Mardi | Initialisation des compteurs avec les valeurs réelles servies par la base | Test de la chaîne de contact de bout en bout (le message arrive bien quelque part) |
| Mercredi | Masquage de la section témoignages + intégration WhatsApp et email | Correction de la carte Desktop (Windows + Linux, sans macOS) |
| Jeudi | Captures d'écran intégrées dans les aperçus | Publication du hash SHA-256 complet de l'APK avec bouton copier |
| Vendredi | Rédaction et déploiement de la phrase de positionnement — page d'accueil, page offres, manifeste — puis revue collective de 45 minutes : parcours d'un visiteur qui ne connaît rien au projet, du début à la fin, sur un téléphone | |

---

### A3. Sprint 1 — Socle technique et commercial (semaines 2 à 4)

Trois semaines. Objectif : le site devient trouvable et capte des contacts, sans ajouter une seule fonctionnalité métier au produit.

#### Chantier 1 — Rendre la page d'accueil lisible par les robots (priorité absolue)

**La constatation qui justifie tout ce chantier :**

Le corps de la page d'accueil contient uniquement `<div id="root"></div>`. Aucune balise de titre, aucun contenu, aucun repli sans JavaScript. Google sait exécuter du JavaScript ; Bing, les aperçus de liens WhatsApp, Facebook et LinkedIn, et les moteurs de recherche d'IA ne le font pas. Vous perdez donc la totalité de votre diffusion hors Google — dans un contexte où WhatsApp est votre canal principal.

Mesure Lighthouse au 21/09 : **performance 32 mobile / 39 desktop**. Causes identifiées : service worker qui force un rechargement à la première visite (≈ 10,9 s), paquet JavaScript principal à 1,31 Mo minifié (441 Ko compressé en un seul fichier), logo LCP de 470 Ko servi depuis Appwrite, polices Google.

| Tâche | Ce qu'on fait concrètement | Critère de sortie |
|---|---|---|
| Pré-rendu de la page d'accueil | Générer le HTML des sections statiques au moment du build. Le contenu doit être présent dans la réponse HTML, sans exécuter de JavaScript | `curl` sur la page d'accueil renvoie un titre de niveau 1 et le texte des fonctionnalités |
| Balise de repli | Insérer un bloc `<noscript>` contenant le titre, les 6 fonctionnalités clés et un contact | Un navigateur sans JavaScript affiche le message essentiel |
| Données structurées | Ajouter un balisage FAQPage (5 questions) et BreadcrumbList | Validation sans erreur dans l'outil de test de Google |
| Aperçus sociaux par page | Générer une carte d'aperçu 1 200 × 630 par page, dimensions déclarées | Chaque page partagée affiche une carte dédiée, pas le logo générique |
| Poids du chargement | Découper le paquet JavaScript (chargement différé des routes) | Moins de 150 Ko compressé pour le premier affichage de la page d'accueil |

#### Chantier 2 — Brancher le tunnel de contact

Il n'existe aujourd'hui aucune capture de contact : ni formulaire, ni adresse email, ni WhatsApp sur la page d'accueil. Le calculateur d'impact campus affiche « — » tant qu'on n'a rien saisi et ne produit aucun livrable.

| Ajout | Conception | Pourquoi ça marche |
|---|---|---|
| Formulaire « Demander une démonstration » | 4 champs : établissement, nombre d'étudiants, votre rôle, WhatsApp ou email. Pas de champ « message » obligatoire | Un directeur remplit 4 champs ; il abandonne à 8 |
| Calculateur d'impact → contre email | Le résultat s'affiche flouté, un rapport PDF daté est envoyé après saisie de l'email. Afficher aussi la formule de calcul sous le résultat | Le calcul devient une contrepartie, pas une décoration |
| Réponse en moins de 15 minutes | Une personne d'astreinte par jour ouvrée, désignée au planning, avec une alerte sur mobile | VersityLife affiche un délai moyen de 11 minutes — c'est le standard à tenir |

#### Chantier 3 — Profondeur des pages de contenu

Les six pages statiques indexables (à propos, offres, présentation, plateforme de gestion universitaire, emploi du temps universitaire, présence QR code) sont bien construites mais courtes — environ 2 400 à 2 700 octets chacune. Elles ne peuvent pas se classer durablement sur des requêtes concurrentielles.

- Porter chaque page à plus de 1 200 mots : un problème concret de terrain, un comparatif « avant / après », une capture d'écran, une foire aux questions de 5 à 8 entrées balisées.
- Ajouter trois pages sur des intentions non couvertes : gestion des présences à l'université, bulletins et système LMD au Cameroun, plateforme universitaire qui fonctionne hors ligne.
- Une seule règle de vérité : chaque page doit dire la même chose sur le modèle gratuit / payant.

---

### A4. Sprint 2 — Preuve terrain (mois 2)

Le mois 1 a rendu le site présentable. Le mois 2 fabrique la seule chose qui fait acheter dans ce secteur : la preuve que ça marche dans une vraie salle de cours.

| Objectif | Actions | Critère de réussite |
|---|---|---|
| 12 démonstrations | 3 démos par semaine pendant 4 semaines, sur un ordinateur portable et un téléphone, avec les données réelles de votre faculté — jamais une base vide. Durée : 20 minutes dont 12 de manipulation par la personne à qui vous parlez | 12 démos réalisées, une fiche remplie par démo (qui, quand, réaction, objection, suite) |
| 3 pilotes signés | Offre pilote unique : une faculté ou un département, 6 mois, montant d'entrée modeste, date de fin écrite, périmètre écrit, prix de continuation écrit, signés dès le départ | 3 documents signés avec les trois mentions ci-dessus, dont la date de fin |
| 30 testeurs instrumentés | 10 étudiants, 10 enseignants, 10 délégués ou administrateurs, chacun inscrit nommément avec son accord. Suivi de l'usage réel dans la base de données, pas des impressions | 30 comptes actifs identifiés, avec taux d'usage mesurable par personne |
| Un cycle complet tenu | Tenir l'appel par QR code sur au moins 20 séances réelles, du début à la fin, sans intervention manuelle de secours | 20 séances où l'enseignant n'a pas eu à rattraper le système à la main |

**La règle des 20 minutes :** dans une démonstration, celui qui doit être impressionné, c'est celui qui tient le téléphone. Vous parlez 8 minutes, il manipule 12. Vous ne démontrez pas une fonctionnalité, vous faites faire une tâche qu'il fait déjà mal : faire l'appel, publier un devoir, consulter sa moyenne. À la fin, la seule question à poser : « Qu'est-ce qui vous empêcherait de l'utiliser la semaine prochaine ? » — pas « qu'est-ce que vous en pensez ».

---

### A5. Sprint 3 — Industrialisation (mois 3)

Objectif : arrêter de livrer à la main, et éviter que chaque nouveau client consomme toute l'équipe.

| Livrable | Contenu | Effet attendu |
|---|---|---|
| Procédure de reprise de données | Un document de 2 pages : formats acceptés, nettoyage, vérification, validation par le client avant mise en service. Un script de reprise depuis un tableur | Une reprise passe de 3 jours d'ingénieur à 3 heures |
| 4 sessions de formation types | Une par rôle : étudiants, délégués, enseignants, administration. Support écrit + enregistrement vidéo réutilisable | La formation cesse d'être un événement à préparer |
| Modèle de contrat et de devis | Un modèle unique avec palier, périmètre, durée, prix de continuation, clause de restitution des données | Chaque vente ne redémarre plus de zéro |
| Politique de données | Où sont hébergées les données (Appwrite Cloud, région Frankfurt), qui y accède, fréquence des sauvegardes, procédure de restitution en cas de départ | Répond à la seule objection qui bloque les responsables informatiques |
| Permission de publication | Formulaires de consentement signés pour chaque témoignage : nom, filière ou fonction, photo, autorisation d'usage public | 3 témoignages publiables et non contestables |

---

### A6. Organisation de l'équipe et rituels

10 membres, 4 pôles. Le risque n'est pas le manque de compétences — c'est la dispersion. Une règle : un seul produit commercialisé, le reste est du service facturé avec un périmètre et une facture.

#### Les 4 pôles et leur mission des 90 jours

**Frontend / web** (2 personnes)
Sprint 0 en totalité, pré-rendu de la page d'accueil, découpage du paquet JavaScript, 4 captures d'écran réelles, correction de la carte Desktop.

**Mobile** (2–3 personnes)
APK avec signature de production (pas debug), empreinte SHA-256 complète publiée, corrections issues des 30 testeurs, canal de mise à jour.

**Backend / infra** (2 personnes)
Route de téléchargement cohérente, chiffres affichés vs chiffres en base, sauvegardes Appwrite Cloud, tableaux de bord d'usage (le vrai moteur de la boucle de retour). Activer les workflows n8n (assistant Uni, emails de bienvenue) — livrés en code depuis le 26/09, jamais déployés.

**Architecture / produit + marketing** (3 personnes dont Tessoh Pekam Marcel)
Contrats, tarifs, procédure de reprise de données, conduite des 12 démonstrations, calendrier éditorial, tenue de la boucle de retour.

#### Trois rituels, pas plus

**1. Point de 15 minutes, tous les lundis.**
Chaque pôle dit uniquement : fait la semaine dernière, fait cette semaine, bloqué par quoi. Pas de présentation, pas de démonstration.

**2. Revue de code, deux fois par semaine.**
Une heure. Obligatoire avant toute mise en production : c'est ce qui protège un produit utilisé par de vrais étudiants.

**3. Revue des retours, chaque vendredi.**
On lit les retours collectés dans la semaine, on en sort au maximum trois corrections pour la semaine suivante, on les annonce publiquement. Non négociable : une personne est désignée pour répondre à chaque personne qui a donné un retour — même pour dire « pas retenu, voici pourquoi ». C'est ce qui fait revenir les testeurs.

#### La règle de la définition de « terminé »

Une tâche n'est terminée que si (1) elle fonctionne sur un téléphone d'entrée de gamme, (2) elle a été utilisée par une personne qui n'est pas l'auteur du code, et (3) son comportement est écrit quelque part. Tout le reste est « en cours ».

---

## Partie B — Plan marketing

### B1. Positionnement et cibles prioritaires

#### Le positionnement, en deux phrases, à répéter partout

> **UniFlow — la plateforme de campus qui fonctionne quand le réseau ne fonctionne pas.**
> Présence par QR code, emploi du temps, notes et cours accessibles hors ligne. Gratuit pour les étudiants ; licencié à l'établissement.

**Plateformes disponibles :** Android, navigateur web, Windows (Microsoft Store), Linux. macOS n'est pas dans la feuille de route.

**Pourquoi ce positionnement et pas « logiciel de gestion universitaire » :** le terrain de la gestion universitaire complète est déjà occupé au Cameroun par des acteurs installés qui publient leurs tarifs et revendiquent des déploiements en production. Sur ce terrain, UniFlow arrive en retard. Sur le terrain du fonctionnement hors ligne, de la présence par QR code et de la gratuité côté étudiant, aucun des acteurs identifiés ne se positionne.

#### Ordre de ciblage

| Ordre | Segment | Pourquoi en premier | Cycle de vente | Décideur |
|---|---|---|---|---|
| 1 | Votre propre faculté (département pilote) | Vous y êtes inscrits, vous avez la légitimité et l'accès. Aucun autre segment ne peut produire une référence aussi vite | 1 à 3 mois | Chef de département, appui du délégué |
| 2 | Instituts et écoles privées d'enseignement supérieur (Yaoundé, puis Douala) | Décideur unique — le fondateur ou le directeur. Budget réel, douleur forte sur la présence et les bulletins, aucun comité d'achat | 2 à 6 semaines | Directeur ou fondateur |
| 3 | Grandes écoles privées (500 à 2 000 étudiants) | Ticket plus élevé et besoin de différenciation marketing : ils achètent un argument de rentrée, pas seulement un outil | 1 à 4 mois | Direction générale + responsable informatique |
| 4 | Universités d'État (au-delà du pilote) | Volume considérable mais cycle long, appels d'offres, exigences de conformité. Objectif réaliste : un pilote financé, pas un déploiement | 12 à 24 mois | Rectorat, direction informatique |
| 5 | Univers francophone hors Cameroun | Même produit, même problème d'infrastructure, concurrence locale plus faible. À ouvrir seulement après 3 clients camerounais satisfaits | 3 à 9 mois | Direction |

---

### B2. OÙ ALLER — les 10 lieux de diffusion

Classés par rendement attendu. Les cinq premiers sont sur votre campus et ne coûtent rien — ils doivent occuper 80 % de votre temps ce trimestre.

| # | Lieu / canal | Quoi y faire | Fréquence | Ce que vous en tirez |
|---|---|---|---|---|
| 1 | La salle des professeurs de votre faculté | Solliciter 15 minutes en fin de réunion de département. Tenir l'appel par QR code devant eux, en 40 secondes. Laisser l'application installée sur un téléphone de prêt | 2 fois par semaine | Des enseignants convaincus par l'usage. Ce sont eux qui portent le sujet en conseil de faculté |
| 2 | Les amphis et les délégués de filière | Recruter 1 délégué par filière comme utilisateur pilote, avec une formation de 30 minutes et un avantage visible (mention dans l'application, accès anticipé). Il installe l'application pour sa promotion | 1 nouvelle filière par semaine | Jusqu'à 200 étudiants par délégué recruté, sans budget d'acquisition |
| 3 | Démonstrations en classe, pendant un cours réel | Obtenir 5 minutes en début de cours pour faire tenir l'appel par QR code à toute la salle. Faire constater le temps gagné à voix haute | 3 séances par semaine | 120 personnes voient la fonctionnalité marcher en même temps |
| 4 | Associations et amicales étudiantes du campus | Présenter en 10 minutes lors d'une réunion. Proposer une contrepartie claire : l'association communique, l'application affiche son nom et ses annonces | 1 par mois | Une caution interne et une diffusion qui ne ressemble pas à de la publicité |
| 5 | Instituts et écoles privées de Yaoundé | Une liste nominative de 20 établissements, avec le nom du directeur. Demander un rendez-vous de 20 minutes par appel, puis une démo sur leurs propres données (fichier d'effectifs anonymisé) | 3 rendez-vous par semaine | Vos pilotes payants. Le segment où l'offre se transforme en revenu le plus vite |
| 6 | Groupes WhatsApp de filières et de promotions | Ne jamais publier un lien nu. Publier une preuve : capture d'écran de l'appel pris en 40 secondes, 2 phrases, 1 lien | 2 publications par semaine | Canal le plus rapide pour recruter des testeurs — à condition d'y montrer, pas d'y annoncer |
| 7 | Les canaux du collectif (Discord, Telegram, WhatsApp, LinkedIn, YouTube) | Diffuser une annonce par semaine, structurée : ce qu'on a corrigé, ce qu'on cherche, comment aider. Reconvertir un canal d'annonce en canal de recrutement de testeurs | 1 par semaine | Une audience déjà acquise et un historique public de progression — ce que regarde un décideur avant de vous parler |
| 8 | LinkedIn — canal décideurs | Trois publications par mois : le problème (la photo d'emploi du temps sur WhatsApp), la solution démontrée, le résultat chiffré. Cibler explicitement les directeurs d'établissements privés et les responsables informatiques | 3 par mois | Des conversations entrantes avec des décideurs qui ne sont pas sur TikTok |
| 9 | TikTok, Facebook, YouTube — canal adoption étudiante | Format court, caméra au téléphone, sans montage : « l'appel en amphi en 40 secondes », « notre emploi du temps changeait 3 fois par semaine ». Montrer l'écran, pas la personne qui parle | 3 vidéos par semaine | De l'adoption étudiante, donc de la pression sur les établissements |
| 10 | Dépôts de code, communautés open source | Publier le dépôt avec un fichier de contribution clair, une licence explicite et une liste de tâches accessibles aux débutants. Répondre publiquement aux issues | En continu | Les retours techniques les plus durs et les plus utiles, plus des contributions gratuites et une crédibilité à long terme |

**Deux conseils d'exécution :**

Ne diffusez jamais la même chose aux étudiants et aux directions. Un étudiant veut voir la fonctionnalité. Un directeur veut une date, un prix, un périmètre et une personne responsable. Deux discours, deux canaux, aucun mélange.

Un canal ne vaut que s'il est tenu. Mieux vaut 3 canaux alimentés chaque semaine que 7 canaux actifs dix jours puis abandonnés.

---

### B3. COMMENT PARTAGER pour obtenir des retours RÉELS

#### La règle d'or, en une phrase

> Ne demandez jamais « vos avis » ; demandez à une personne nommée de faire une action précise dans un délai précis, puis regardez si elle l'a faite.

« Qu'est-ce que vous pensez d'UniFlow ? » ne produit rien. « Peux-tu tenir l'appel de ton cours de mercredi avec l'application, et me dire vendredi ce qui t'a gêné ? » produit un retour exploitable.

#### Le protocole de retour, en 6 étapes

**1. Recruter 30 testeurs nommés, par écrit, répartis en 3 groupes**

10 étudiants, 10 enseignants, 10 délégués ou personnels administratifs. Chaque recrutement passe par un message qui dit trois choses : ce qu'on attend d'eux, combien de temps cela prend, et ce qu'ils y gagnent. Un formulaire d'inscription avec nom, rôle, filière et numéro WhatsApp. Sans liste nominative, pas de boucle de retour.

**2. Instrumenter l'usage avant d'écouter les opinions**

Avant toute question, mesurer : quel testeur s'est connecté, combien de fois, a-t-il tenu un appel, a-t-il consulté son emploi du temps, a-t-il rendu un devoir ? Ces données sont votre seul instrument de vérification. Un testeur qui dit « c'est très bien » sans s'être connecté depuis huit jours ne produit pas un retour : il produit une politesse.

**3. Poser 5 questions, jamais plus, et jamais « aimez-vous »**

Les questions portent sur le dernier usage réel, pas sur l'opinion générale. Le script complet est en annexe 3. Règle absolue : on note les mots exacts du testeur, on ne les reformule pas. C'est dans les mots exacts que se trouve la formulation de vos futures pages de vente.

**4. Trier les retours en trois seaux, dans un délai de 48 heures**

- **Bug** (ça ne marche pas) → correction technique, responsable nommé, échéance.
- **Friction** (ça marche mais c'est pénible) → priorité produit.
- **Souhait** (ce serait bien que) → on note, on ne promet rien.

Tout retour non trié sous 48 heures est un retour perdu.

**5. Corriger en public, puis prévenir personnellement chaque testeur**

Chaque vendredi, annoncer ce qui a été corrigé grâce aux retours de la semaine, avec le prénom du testeur si celui-ci est d'accord. Puis lui envoyer un message individuel : « ce que tu as signalé est corrigé ». C'est cette étape qui transforme un testeur ponctuel en utilisateur durable.

**6. Publier les chiffres d'usage, y compris quand ils sont mauvais**

Nombre de séances tenues par QR code, nombre d'étudiants actifs, nombre de bugs corrigés. Publier un mauvais chiffre accompagné d'un plan est infiniment plus crédible que publier une réussite invérifiable.

#### Les 6 pièges qui font échouer une campagne de retours

| Piège | Ce qui se passe réellement | La parade |
|---|---|---|
| Demander « vos avis » dans un groupe WhatsApp | 12 réponses polies, 0 retour exploitable. Le groupe est un espace social : personne n'y critique | Passer en message privé, avec une demande d'action datée |
| Recruter des testeurs anonymes | Impossible de savoir qui a essayé, qui a abandonné, et pourquoi | Liste nominative, avec accord écrit |
| Ne compter que les téléchargements | On confond curiosité et usage. Un pic de téléchargements masque un abandon total en trois semaines | Mesurer l'usage hebdomadaire, pas l'installation |
| Traiter les retours critiques comme des attaques | Les testeurs les plus exigeants se taisent. Il ne reste que les amis, donc plus aucun signal | Remercier explicitement les retours négatifs, nommément |
| Ne jamais refermer la boucle | Les testeurs concluent que leur avis ne sert à rien et arrêtent de répondre dès la deuxième semaine | Répondre à 100 % des retours, même pour refuser |
| Demander un témoignage avant d'avoir un résultat | On doit rédiger soi-même le témoignage, et il ne convainc personne | Attendre 6 à 8 semaines d'usage, puis demander une citation courte et signée |

---

### B4. Du retour brut au témoignage exploitable

Un témoignage ne vaut que s'il est précis, signé et vérifiable.

| Élément | Exigence | Exemple de ce qu'il faut obtenir |
|---|---|---|
| Une situation avant / après | Le testeur décrit un problème passé, daté, et ce qui a changé | « Avant, je mettais 8 minutes à faire l'appel. Maintenant c'est réglé en moins d'une minute. » |
| Une identité vérifiable | Prénom et nom, rôle, filière ou établissement, photo si accordée | Enseignant, faculté des sciences — avec accord écrit (annexe 4) |
| Un chiffre d'usage adossé | Le témoignage est adossé à une donnée réelle, pas à une impression | « 20 séances tenues avec l'application » — vérifiable dans la base |
| Ce qu'il faut refuser | Aucune citation achetée, aucune reformulation par vous, aucun témoignage de personne n'ayant pas utilisé le produit | Si vous n'avez que 2 témoignages honnêtes, publiez 2 témoignages |

**Pourquoi c'est votre meilleur argument de vente :** dans ce secteur, la peur n°1 d'un directeur n'est pas le prix. C'est de signer pour un outil que personne n'utilisera et qu'il devra justifier. Un témoignage précis et signé d'un enseignant, adossé à 20 séances réelles, répond exactement à cette peur. Trois témoignages de ce type valent mieux qu'une refonte graphique du site.

---

### B5. Calendrier éditorial sur 4 semaines

Format : une publication = une preuve + un appel à l'action.

| Semaine | Lundi — canaux du collectif | Mercredi — étudiants | Vendredi — LinkedIn / directions | Objectif |
|---|---|---|---|---|
| S1 | « Les défauts de notre site que vous nous avez signalés — et ce qu'on a corrigé. » Avec captures avant / après | Capture d'écran : l'appel tenu en 40 secondes sur un cours réel. 2 phrases, 1 lien | « Pourquoi nous avons arrêté de dire que notre logiciel gère tout. » Poster les correctifs | Prouver que les retours changent le produit |
| S2 | Appel public : « 30 testeurs, 3 groupes, 6 semaines. » Formulaire d'inscription ouvert | Publier le formulaire dans les groupes de filières, avec une contrepartie claire pour les délégués | « Nous cherchons 5 établissements pour un pilote de 6 mois. Périmètre, prix, calendrier. » | Recruter 30 testeurs nommés |
| S3 | Vidéo de 45 secondes : un vrai appel dans une vraie salle, sans montage | Partager la vidéo avec « qui veut essayer dans sa filière cette semaine ? » | « Ce que nous avons appris en instrumentant 30 utilisateurs la première semaine. » Chiffres d'usage réels | Convertir les testeurs en utilisateurs réguliers |
| S4 | Premier retour publié, signé, adossé à un chiffre d'usage. Plus la liste de ce qui a été corrigé grâce à lui | « 20 séances tenues par QR code cette semaine. » Publier le chiffre, même imparfait | « Un pilote signé. Voici exactement comment ça s'est passé, étape par étape. » | Obtenir le premier témoignage publiable |

**Le format qui fonctionne sur le campus :** la publication qui performe n'est jamais une annonce. C'est une preuve visuelle d'un problème connu de tous. La photo floue d'un emploi du temps qui circule sur WhatsApp, la file d'attente à l'émargement, l'appel qui mange dix minutes de cours. Montrez le problème que tout le monde reconnaît, puis montrez-le résolu en 40 secondes.

---

### B6. Indicateurs, budget et alertes

#### Les 6 chiffres à suivre chaque vendredi

| Indicateur | Cible | Échéance |
|---|---|---|
| Testeurs nommés | 30 | 30 jours |
| Testeurs actifs la semaine précédente | ≥ 40 % des 30 | En continu |
| Séances tenues par QR code | 20 / semaine | 60 jours |
| Démonstrations réalisées | 12 | 60 jours |
| Pilotes signés | 3 | 90 jours |
| Témoignages signés publiés | 3 | 90 jours |
| Délai de première réponse | < 15 min | Immédiat |

#### Budget de la phase (hors temps de l'équipe)

**Indispensable — faible coût :**
- Nom de domaine et hébergement pour les pages d'atterrissage
- Un téléphone Android d'entrée de gamme dédié aux démonstrations
- Impression de 100 fiches de démonstration A4
- Transport pour les visites d'établissements

**Utile si un budget existe :**
- Impression de 200 autocollants « UniFlow » pour les salles informatiques
- 50 affiches A3 pour les tableaux d'affichage des facultés

**À éviter :** publicité payante en ligne avant d'avoir 3 témoignages. Vous achèteriez du trafic pour une page dont les démonstrations sont vides — et vous ne sauriez pas si l'échec vient du site ou de la campagne.

#### Trois alertes à surveiller

- **Moins de 40 % des testeurs reviennent la deuxième semaine** → le problème est l'utilité perçue, pas la communication. Arrêtez la diffusion et parlez à ceux qui sont partis.
- **Une démonstration sur trois se termine sans question** → vous démontrez des fonctionnalités, pas des problèmes résolus. Changez le script, pas le produit.
- **Aucun pilote signé au bout de 6 semaines de démonstrations** → vérifiez d'abord le prix, puis le périmètre, puis la personne à qui vous parlez. Dans cet ordre.

---

## Annexes — scripts prêts à copier

### Annexe 1 — Message de recrutement des 30 testeurs

À envoyer en message privé, jamais dans un groupe. Personnaliser chaque message.

---

Salut [Prénom],

Je suis [ton prénom], étudiant en [filière] à [faculté].

Nous construisons UniFlow, une application qui gère l'emploi du temps,
les présences par QR code, les devoirs et les notes — et qui marche
même quand il n'y a pas de réseau sur le campus.

Je te sollicite pour une chose précise, pas pour un avis général :
→ tenir l'appel de [ton cours de mercredi] avec l'application,
   mercredi prochain,
→ puis me dire vendredi, en 5 minutes au téléphone, ce qui t'a gêné.

Concrètement : 10 minutes d'installation aujourd'hui, une utilisation
normale mercredi, 5 minutes de retour vendredi.

Ce que tu y gagnes : tu participes aux décisions avant tout le monde,
et ton nom apparaît dans la liste des premiers utilisateurs si tu le
souhaites. Et quand quelque chose ne marche pas, c'est corrigé dans la
semaine — je te préviens personnellement.

Je t'envoie le lien d'installation ?

[ton prénom]

---

**Les 3 éléments qui rendent ce message efficace :** une action précise (tenir l'appel de mercredi), un coût total annoncé (15 minutes en tout), et une contrepartie réelle. Ne jamais écrire « dis-moi ce que tu en penses ».

---

### Annexe 2 — Publication LinkedIn pour recruter un pilote

---

Un emploi du temps qui change trois fois par semaine et circule en
photo floue sur WhatsApp. Un appel qui prend dix minutes sur un cours
d'une heure. Des bulletins qui arrivent avec plusieurs semaines de retard.

Ce n'est pas un problème de logiciel. C'est un problème de réseau :
la plupart des outils de gestion universitaire supposent une connexion
permanente. Sur nos campus, cette hypothèse ne tient pas.

Nous avons construit UniFlow pour ça :
• fonctionne hors ligne et se synchronise au retour du réseau ;
• présence par QR code, prise en moins d'une minute en amphi ;
• emploi du temps, devoirs, notes et bulletins au même endroit ;
• gratuit pour les étudiants et les enseignants.

Disponible sur Android, navigateur web et Windows.

Nous ouvrons 5 places de pilote pour cette année académique.
Ce qui est inclus : configuration, reprise de vos données existantes,
formation de vos équipes, hébergement sur Appwrite Cloud, support.
Ce qui est demandé : un département ou une faculté, et un référent
côté administration pendant 6 semaines.

Coordonnées : [WhatsApp] · [email]
Le programme détaillé : [lien]

---

### Annexe 3 — Les 5 questions d'entretien

Durée : 5 minutes. À poser au téléphone, pas par écrit. Noter les mots exacts, sans reformuler.

| # | Question | Ce qu'elle cherche à faire sortir |
|---|---|---|
| 1 | « Raconte-moi la dernière fois que tu as ouvert l'application. Qu'est-ce que tu voulais faire ? » | L'usage réel, et s'il existe. Si la personne ne se souvient pas, elle ne l'a pas utilisée |
| 2 | « Qu'est-ce qui t'a fait perdre du temps ou t'a énervé, à ce moment-là ? » | La friction concrète, dans ses mots. Les gens se souviennent de ce qui les agace, pas de ce qui fonctionne |
| 3 | « Comment tu faisais pour cette même tâche avant ? » | La situation de référence. Sans elle, aucun gain ne peut être mesuré ni raconté dans un témoignage |
| 4 | « Si l'application disparaissait demain, qu'est-ce que tu ferais ? » | La vraie dépendance. « Je reprendrais mes notes papier » est un signal faible ; « je serais bloqué mercredi » est un signal fort |
| 5 | « À qui tu le montrerais, et qu'est-ce que tu lui dirais ? » | Le message que les utilisateurs transmettent eux-mêmes — la meilleure source pour écrire vos pages de vente |

**Après l'entretien, deux obligations :**
1. Trier le retour sous 48 heures dans l'un des trois seaux — bug, friction, souhait — avec un responsable et une échéance pour les deux premiers.
2. Répondre à la personne, même si le retour n'est pas retenu, en expliquant pourquoi.

---

### Annexe 4 — Autorisation d'usage d'un témoignage

---

**Autorisation d'usage de témoignage**

Je soussigné(e) [Nom et prénom], [rôle : étudiant / enseignant /
personnel administratif], à [établissement ou faculté], autorise
KERNEL FORGE à publier, sur le site d'UniFlow et sur les réseaux
sociaux du collectif, la citation suivante :

« [citation, dans mes propres mots] »

Cette autorisation couvre mon prénom, mon nom, mon rôle, ma filière
ou mon établissement : [préciser].

Photographie : autorisée ☐  non autorisée ☐

Durée : sans limitation ☐  jusqu'au [date] ☐

Cette autorisation est libre, accordée sans contrepartie financière,
et peut être retirée à tout moment par simple demande écrite.

Fait à [lieu], le [date].

Signature :

---

### Annexe 5 — Fiche de démonstration

À imprimer, une par rendez-vous.

| Champ | À remplir |
|---|---|
| Établissement / département | |
| Date et heure | |
| Personne rencontrée / rôle | |
| Effectif annoncé | |
| Ce qu'ils utilisent aujourd'hui | |
| Le problème qu'ils citent en premier | |
| Objection principale | |
| Qui utilise le téléphone pendant la démonstration | |
| Qu'est-ce qui les empêcherait de l'utiliser la semaine prochaine ? | |
| Suite convenue, avec date | |

Au bout de 12 fiches remplies, les objections se répètent et les pages de vente s'écrivent toutes seules, avec les mots de vos clients.

---

### Annexe 6 — Sources et vérifications

Les chiffres concernant les concurrents proviennent de leurs sites publics consultés le 29 septembre 2026 et sont susceptibles d'évoluer. À revérifier avant toute utilisation dans un document commercial.

| Chiffre ou fait cité | Source | Statut |
|---|---|---|
| Délai moyen de réponse de 11 minutes | Page tarifs publique de VersityLife — « 24/7 WhatsApp · Average response: 11 minutes » | Relevé le 29/09/2026 — à vérifier avant usage |
| Tarifs publics de 400 000 FCFA/an (jusqu'à 300 étudiants) et 700 000 FCFA/an (301 à 1 000 étudiants) | Page tarifs publique de VersityLife | Relevé le 29/09/2026 — à vérifier avant usage |
| « 2 000+ étudiants en production » | Page d'accueil publique de VersityLife | Relevé le 29/09/2026 — à vérifier avant usage |
| Plancher de prix observé sur le marché scolaire camerounais, à partir de 200 000 FCFA | Document commercial d'un éditeur de logiciel de gestion scolaire, consulté via un dépôt public de documents | Source secondaire, faible fiabilité — à ne pas citer sans revérification |
| Page `/download` fonctionnelle ; liens de téléchargement corrigés | Mesures sur uniflow.kernelforge.codes — vérifiées le 21/09/2026 puis le 29/09/2026 | Vérifié |
| Performance Lighthouse : 32 mobile / 39 desktop | Audit Lighthouse sur uniflow.kernelforge.codes le 21/09/2026 | Vérifié — à remesurer après les optimisations du Sprint 1 |
| APK 1.0.0 — 87,2 Mo, SHA-256 `2804af7c…e11773`, signature debug | Release GitHub `KERNEL-FORGE-G/uniflow-apps`, tag `uniflow` | Vérifié — la signature debug est un point de vigilance pour la distribution en établissement |
| Suites de tests au 21/09 : web 162/162, mobile 585/585, desktop 585/585 | Lanceurs `node --test` (web) et `flutter test` (mobile, desktop) rejoués par le journal de projet le 21/09 | Vérifié le 21/09 — à remesurer à chaque sprint |
| Canaux publics du collectif | Pages de projet, canaux Discord, Telegram, WhatsApp, LinkedIn, YouTube, dépôt de publications Android | Vérifié |

#### Ce que ce document ne prétend pas être

Aucun objectif de chiffre d'affaires n'est fixé ici. Il manque trois données que seul le terrain peut fournir : l'effectif réel de votre faculté pilote, le nombre de facultés de votre université, et le nombre d'établissements privés ciblables à Yaoundé. Remplissez ces trois chiffres avant de fixer un objectif commercial.

---

*UniFlow — Plan de travail & Plan marketing · KERNEL FORGE · 29 septembre 2026 (révisé le 29 septembre 2026) · Document de travail interne*
