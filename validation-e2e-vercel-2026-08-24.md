# Validation E2E Vercel — 24 août 2026

## Contrôle de production en cours

| Parcours | URL | Observation | État |
|---|---|---|---|
| Tableau de bord authentifié | `/#/app` | Le navigateur a d’abord affiché le squelette de chargement, puis une page blanche sans élément interactif après cinq secondes. | À diagnostiquer avant validation finale. |
| Rechargement du tableau de bord | `/#/app?validation=20260824` | La page blanche est reproduite après navigation vers une URL distincte ; ce n’est donc pas seulement l’état de navigation précédent. La console navigateur ne fournit aucune erreur. | Bloquant pour la validation Vercel. |

L’inspection de la page blanche indique que `document.readyState` est `complete`, que le bundle `https://uniflow.kernelforge.codes/assets/index-DCpXlq19.js` est chargé, mais que le conteneur `#root` est vide. Le diagnostic doit donc vérifier le démarrage du bundle et le cache PWA, pas seulement le chargement HTML.

Le navigateur de contrôle possède un service worker actif sur la portée entière du domaine et un cache nommé `uniflow-pwa-cache-v8`. Une validation avec ce cache neutralisé est requise avant d’attribuer la panne au code de l’espace authentifié.

Le service worker et ce cache ont été supprimés uniquement dans la session de test, puis la page a été rechargée. Le navigateur est ensuite devenu momentanément indisponible ; le contrôle de rendu doit être repris dans une nouvelle session de navigation avant toute conclusion.

Après reprise de la navigation sans cache PWA, le tableau de bord a de nouveau affiché un squelette, puis un conteneur `#root` vide. Le cache PWA n’est donc pas la cause unique ; la validation Vercel reste bloquée tant que le rendu de l’espace authentifié n’est pas fiabilisé.

## Résolution du contrôle de rendu

Un rechargement complet avec un paramètre placé avant le fragment (`/?validation=latest-20260824#/app`) a récupéré le `index.html` Vercel actuel et a rendu le tableau de bord avec sa navigation, ses actions rapides et ses états Appwrite. Le contrôle HTTP a confirmé que le document actuel référence `assets/index-Dk0zsMo2.js`, alors qu’un ancien document observé dans le navigateur référençait un bundle supprimé. Les pages blanches précédentes correspondaient à une navigation HashRouter restant attachée à ce document obsolète, non à un échec du dernier bundle sur Vercel.

| Emploi du temps authentifié | `/?validation=schedule-20260824#/app/emploi-du-temps` | Le shell authentifié, la navigation et le pied de page se rendent, mais la zone centrale de la page reste vide après hydratation. | Défaut de composant à diagnostiquer et corriger avant la validation finale. |

Un collecteur d’erreurs JavaScript a été installé dans la session de navigateur de contrôle avant de remonter le composant, afin de conserver toute exception de rendu ou promesse non traitée sans publier de donnée de test.

Le tableau de bord a été rechargé correctement dans cette session, puis la route emploi du temps a été remontée avec le collecteur actif. Le résultat de cette remontée sera contrôlé séparément afin de ne pas confondre navigation et état d’affichage.

Le remontage a affiché correctement la grille Appwrite : 10 créneaux, 20 heures hebdomadaires et les cours ICT101 à ICT110 répartis du lundi au vendredi. Le collecteur d’erreurs est resté vide. La zone vide observée auparavant était donc un état de chargement transitoire dans la session de navigation, pas une régression reproductible du composant livré.

| Mes notes | `/?validation=grades-20260824#/app/notes` | L’écran s’est chargé sur Vercel avec « moyenne actuelle — » et aucune évaluation enregistrée pour le profil de contrôle. | Validé : état vide explicite, sans moyenne inventée. |
| Messagerie | `/?validation=messages-20260824#/app/messages` | Après le démarrage de la Function Appwrite, la page affiche l’état réel sans conversation et les actions « Nouveau » / « Ajouter par e-mail ». Aucun message n’a été créé pendant le contrôle. | Validé, avec latence de démarrage observée. |
| Présences | `/?validation=attendance-20260824#/app/presences` | Les dix matières ICT4D L1, le scanner QR et les compteurs à zéro sont visibles pour le profil sans relevé persistant. | Validé : état Appwrite explicite, aucun scan ni relevé créé. |

Les tests Appwrite automatisés restent distincts du rendu Vercel : cette observation concerne le bundle web publié et la restauration de session dans le navigateur de production.
