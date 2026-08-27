# Validation des assets — 25 août 2026

## Constat initial en production

L’accueil UniFlow charge l’illustration héro distante. Le logo local référencé par le rendu sous `/assets/logo-AxSqrPR9.png` apparaît toutefois comme un contenu de secours dans l’en-tête et le pied de page, ce qui indique un asset local manquant, obsolète ou incorrectement référencé. Les autres images et ressources doivent être vérifiées avant correction.

Le logo répond `200 image/png` sur le domaine public, mais le navigateur indique une largeur et une hauteur naturelles nulles alors que l’illustration héro se décode correctement. La politique CSP n’émet pas d’erreur ; le correctif doit donc viser le fichier logo ou son import, et non élargir les origines autorisées.

Les PNG corrompus comportent des dizaines de milliers de caractères de remplacement et ne sont donc pas récupérables par une simple correction de signature. Deux sources locales valides sont disponibles : l’icône UniFlow 512×512 pour les icônes et logos compacts, et l’image sociale UniFlow 800×420 pour les formats horizontaux et métadonnées. Aucun nouvel élément visuel n’est nécessaire.

Le déploiement Vercel `f2d5afc` est `READY`. Après rechargement complet, le logo vectoriel UniFlow est rendu dans l’en-tête et l’illustration héro se charge normalement. Aucun contenu de secours n’est visible pour ces assets.

## Restauration du logo original et distribution Appwrite

Le fichier fourni `UniFlow_Logo_Principal.png` a été vérifié comme un PNG valide de 1 711 × 531 pixels et 872 643 octets. Il remplace le substitut vectoriel précédemment rendu dans la navigation et le pied de page. Une copie locale strictement identique est conservée sous `/logos/uniflow-primary-original.png` comme repli de disponibilité ; aucune image générée ou générique n’est utilisée comme repli de marque.

Le fichier de marque est publié dans le bucket existant `uniflow_assets` avec l’identifiant déterministe `uniflow_primary_logo`. Le bucket garde `fileSecurity: true` et seul ce fichier public reçoit `read("any")` : aucun accès public n’est accordé à l’ensemble du bucket ni aux ressources académiques. L’URL de vue Appwrite répond sans clé en `200 image/png` et se décode bien en 1 711 × 531 pixels.

L’inventaire confirme que les autres images réellement utilisées sont modestes (au plus environ 0,16 Mo) et restent locales lorsqu’elles correspondent à des icônes ou repli légers. Les deux copies de la vidéo de présentation pèsent chacune environ 12,91 Mo, au-delà de la limite actuelle de 10 Mo du bucket ; elles ne sont donc pas déplacées dans cette itération. La CSP Vercel accepte désormais exclusivement `https://appwrite.kernelforge.codes` pour `img-src`, sans autorisation générique supplémentaire.

La révision `5fce01f` a été publiée en production avec l’état Vercel `READY`. Sur `https://uniflow.kernelforge.codes/`, les deux images de marque contrôlées (en-tête et pied de page) chargent directement depuis l’URL Appwrite, avec `naturalWidth: 1711`, `naturalHeight: 531` et sans activation du repli local. L’en-tête HTTP de production confirme également la présence du seul domaine Appwrite requis dans `img-src`.

## Illustration d’accueil

L’accueil utilisait encore l’URL externe `i.imgur.com/35YpEbS.png`, qui ne correspond pas à la source suivie par le projet. Le visuel d’accueil validé dans le dépôt est `landing.png` (1 448 × 1 086 pixels) ; il porte l’identité UniFlow et a été ajouté dans l’historique du projet comme image d’accueil. L’asset `Image 1.png` est une mascotte 3D distincte et ne remplace pas ce visuel héro.

Le visuel d’accueil est désormais servi par `/logos/uniflow-landing-original.webp`, une version WebP fidèle de 1 200 × 900 pixels pour environ 121 Ko. Les essais d’upload de l’illustration dans l’instance Storage actuelle ont reçu `201` mais créé un fichier vide (`sizeOriginal: 0`, `application/x-empty`) malgré une requête multipart non vide ; cette source n’est donc volontairement pas utilisée côté client. Le logo horizontal, lui, reste correctement distribué depuis Appwrite. Le visuel d’accueil local est servi comme asset statique léger, sans image externe ni substitution générée.
