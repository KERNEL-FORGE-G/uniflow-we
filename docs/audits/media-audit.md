# Audit média UniFlow — 14 août 2026

## Diagnostic

Le lecteur de `PresentationPage` utilisait `/video/uniflow-presentation.mp4`. La copie publiée avant le correctif faisait 3 783 373 octets et était invalide : `ffprobe` signalait `moov atom not found`. La copie source `uniflow-presentation.mp4` à la racine du dépôt est valide, en H.264 Baseline 1024×576 avec audio AAC, durée 129,13 secondes.

## Correctif

Les copies `public/video/uniflow-presentation.mp4` et `public/uniflow-presentation.mp4` ont été remplacées par la copie valide. Le fichier `public/video/demo.mp4`, ancien média démo inutilisé et invalide, a été supprimé. `PresentationPage` utilise désormais un poster local (`/logos/landing.png`), un état React d’erreur lisible et un lien direct vers le fichier au lieu de manipuler le DOM à la main.

## Vérifications

En local, Vite preview sert le fichier avec `Content-Type: video/mp4`, `Content-Length: 13532128`, `Accept-Ranges: bytes` et une réponse `206 Partial Content` pour une requête Range. En production après le commit `d6fa763`, Vercel sert le même fichier avec `Content-Length: 13532128`, `Content-Type: video/mp4`, `Accept-Ranges: bytes` et une réponse Range `206` valide. La page `#/presentation` se rend correctement et le lecteur YouTube principal est visible ; la vidéo locale est disponible via le second élément du carousel.

## Contrôle visuel production

Après le déploiement `d6fa763`, la page `#/presentation` se charge sans page blanche. La sélection de la deuxième carte du carousel rend bien le lecteur HTML5 local avec ses contrôles, au lieu du fichier absent ou tronqué. Le texte de secours placé dans l’élément `<video>` peut apparaître dans l’extraction textuelle du navigateur, mais il n’est pas affiché comme un bloc d’erreur lorsque le lecteur est présent ; le fallback React n’est activé qu’en cas d’événement `error` du média.

## Vérification du lecteur HTML5

Dans le navigateur de production, l’élément vidéo utilise `https://uniflow.kernelforge.codes/video/uniflow-presentation.mp4`, avec `duration: 129.133333`, `readyState: 4`, `networkState: 1` et `error: null`. Le fichier est donc correctement téléchargé et décodé par Chromium ; l’affichage à `0:00` observé avant le chargement des métadonnées se met ensuite à jour à `2:09`.
