# Validation des assets — 25 août 2026

## Constat initial en production

L’accueil UniFlow charge l’illustration héro distante. Le logo local référencé par le rendu sous `/assets/logo-AxSqrPR9.png` apparaît toutefois comme un contenu de secours dans l’en-tête et le pied de page, ce qui indique un asset local manquant, obsolète ou incorrectement référencé. Les autres images et ressources doivent être vérifiées avant correction.

Le logo répond `200 image/png` sur le domaine public, mais le navigateur indique une largeur et une hauteur naturelles nulles alors que l’illustration héro se décode correctement. La politique CSP n’émet pas d’erreur ; le correctif doit donc viser le fichier logo ou son import, et non élargir les origines autorisées.

Les PNG corrompus comportent des dizaines de milliers de caractères de remplacement et ne sont donc pas récupérables par une simple correction de signature. Deux sources locales valides sont disponibles : l’icône UniFlow 512×512 pour les icônes et logos compacts, et l’image sociale UniFlow 800×420 pour les formats horizontaux et métadonnées. Aucun nouvel élément visuel n’est nécessaire.
