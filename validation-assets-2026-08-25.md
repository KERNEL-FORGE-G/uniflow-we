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
