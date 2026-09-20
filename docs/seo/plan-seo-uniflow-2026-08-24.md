# Plan de référencement SEO — UniFlow

**Date :** 24 août 2026  
**Périmètre :** `https://uniflow.kernelforge.codes/`  
**Objectif :** améliorer la découverte de la marque **UniFlow** et la compréhension par les moteurs des cas d’usage universitaires, sans promettre de position ni de délai de classement.

## Diagnostic actuel

La visibilité organique mesurable n’est pas encore disponible dans cette session : Google Search Console redirige vers la connexion et l’activation du navigateur personnel n’a pas été acceptée. Les métriques de clics, impressions, position moyenne, requêtes, URL indexées et Core Web Vitals restent donc **non disponibles**. Une requête publique `site:uniflow.kernelforge.codes` effectuée le 24 août n’a renvoyé aucun document ; c’est un signal d’alerte utile, mais non une preuve définitive d’absence d’indexation. Seule Search Console fournit le statut d’indexation de référence. [1]

Le diagnostic technique a révélé que plusieurs URL marketing annoncées dans l’ancien sitemap, dont `/about`, retournaient une erreur 404. Les pages statiques publiques, leurs métadonnées, canonicals, données structurées légères et leur maillage interne sont désormais servies directement sur des URL propres. Le sitemap ne déclare plus les parcours de connexion et d’inscription ; les parcours privés reçoivent une consigne `noindex` une fois l’application chargée. Un sitemap aide Google à découvrir des URL mais ne garantit ni crawl ni indexation. [2]

| Élément de découverte | État observé le 24 août | Décision |
|---|---|---|
| Fichier de propriété Google | Accessible à la racine | Conserver et cliquer sur « Vérifier » dans Search Console |
| `robots.txt` | Autorise l’exploration et référence le sitemap | Conserver et surveiller |
| Sitemap XML | Sept URL publiques, toutes servies | Soumettre dans Search Console |
| Pages marketing | HTML statique avec H1, description et canonical | Inspecter et demander l’indexation une fois la propriété vérifiée |
| Espaces authentifiés | Non destinés à la recherche | Maintenir hors du sitemap et en `noindex` |

## Requêtes cibles et pages associées

Les expressions suivantes sont des **cibles éditoriales**, non des volumes de recherche mesurés. Elles servent à cadrer les contenus et seront affinées avec les données de requêtes Search Console après vérification de la propriété.

| Intention | Requêtes à suivre | Page de référence | Preuve de réussite |
|---|---|---|---|
| Naviguer vers la marque | `UniFlow`, `UniFlow KERNEL FORGE`, `uniflow kernelforge` | `/`, `/about` | Impressions et clics de requêtes de marque dans Search Console |
| Comprendre l’offre | `plateforme de gestion universitaire`, `gestion académique` | `/plateforme-gestion-universitaire` | URL découverte, indexée puis impressions non liées à la marque |
| Résoudre un besoin de planning | `emploi du temps universitaire`, `planning étudiant` | `/emploi-du-temps-universitaire` | Impressions sur la page et requêtes associées |
| Résoudre un besoin de présence | `présence QR code université`, `émargement étudiant` | `/presence-qr-code-universite` | Inspection valide, impressions et clics pour le cluster |

## Priorités d’exécution

1. **Vérifier la propriété et soumettre le sitemap.** Dans Search Console, vérifier `https://uniflow.kernelforge.codes/`, soumettre `https://uniflow.kernelforge.codes/sitemap.xml`, puis utiliser l’outil d’inspection pour la page d’accueil et les six pages publiques. L’outil d’inspection indique la version connue par Google et permet de tester l’indexabilité ; une demande n’assure pas l’indexation. [3]

2. **Mesurer avant d’optimiser le contenu.** Après collecte de données, exporter les 28 puis 90 derniers jours de Performance par requête et par page. Suivre séparément les termes de marque et les requêtes génériques. Sans ces exports, aucun volume, taux de clic ou position ne doit être présenté comme un fait.

3. **Faire vivre les pages publiques.** Les pages de découverte doivent rester factuelles, liées depuis la navigation marketing et mises à jour uniquement lorsqu’une fonctionnalité est réellement disponible. Ajouter ensuite des ressources éditoriales utiles telles qu’un guide d’implémentation de planning, une explication de l’émargement QR et une page de présentation du référentiel UY1 / ICT4D / L1, sans inventer de résultats institutionnels.

4. **Consolider le signal de marque.** Utiliser un nom de produit cohérent — « UniFlow » et « KERNEL FORGE » — dans les profils officiels, annonces de projet et vidéos réellement contrôlées par l’équipe. Lier ces ressources au domaine officiel et éviter les annuaires ou liens artificiels.

5. **Suivre l’expérience de page.** Consulter les rapports d’indexation et d’expérience de Search Console après accumulation de données. Les avertissements de build sur certains bundles JavaScript volumineux doivent être traités comme une piste de performance ; aucune dégradation de Core Web Vitals n’est affirmée sans mesure réelle.

## Cadence de contrôle

| Fréquence | Contrôle | Résultat attendu |
|---|---|---|
| Après validation de la propriété | Sitemap et inspection URL | Sitemap reçu et statut de chaque URL consigné |
| Hebdomadaire pendant le lancement | Pages indexées et erreurs d’exploration | Nouveaux problèmes corrigés avant extension de contenu |
| Mensuelle | Performance par requête, page, pays et appareil | Choix éditoriaux fondés sur impressions, clics et position |
| Trimestrielle | Contenu, liens internes et expérience de page | Priorités techniques et éditoriales mises à jour |

## Limites et cadre de décision

> La présence des fichiers, du sitemap et des pages statiques rend les URL découvrables. Elle ne force pas leur apparition immédiate dans les résultats Google et ne garantit pas un classement sur une requête donnée.

Le premier jalon opérationnel est la validation effective de la propriété Search Console puis la collecte d’au moins quelques semaines de données. Les prochaines décisions de contenu doivent s’appuyer sur les pages réellement indexées, les requêtes qui déclenchent des impressions et les besoins que les utilisateurs recherchent, plutôt que sur des listes génériques de mots-clés.

## Références

[1] [Google Search Console — rapports de performance et inspection d’URL](https://search.google.com/search-console/about)  
[2] [Google Search Central — rôle d’un sitemap](https://developers.google.com/search/docs/crawling-indexing/sitemaps/overview)  
[3] [Google Search Console Help — URL Inspection tool](https://support.google.com/webmasters/answer/9012289)  
[4] [Google Search Central — JavaScript SEO](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics)
