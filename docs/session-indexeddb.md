# Persistance de session Appwrite avec IndexedDB

**Date :** 17 août 2026  
**Portée :** UniFlow Web uniquement.

La continuité d’interface est conservée dans IndexedDB, dans la base `uniflow-auth` et le magasin `session`. Le snapshot contient uniquement l’identifiant, l’adresse e-mail, le nom, le rôle et le type de compte. Il ne contient jamais de mot de passe, de JWT, de refresh token ou de secret de session.

Au démarrage, UniFlow tente d’abord de valider la session avec Appwrite via `account.get()`. Lorsque la session est encore valide, l’utilisateur est hydraté, l’accueil affiche l’état **Connecté** et les liens deviennent **Mon espace** et **Reprendre mon espace**. Lorsque la session n’est plus valide en ligne, le snapshot IndexedDB est supprimé et l’utilisateur est renvoyé vers la connexion au prochain accès protégé. Hors ligne, le snapshot permet la continuité de consultation, tandis que les données personnelles déjà lues depuis Appwrite restent disponibles dans leur cache local existant.

Les opérations de l’espace indépendant résolvent désormais l’identifiant propriétaire depuis la session Appwrite validée, avec un recours au snapshot uniquement pour la consultation hors ligne. Elles ne dépendent plus de `uniflow_user` dans localStorage. Le service worker utilise le cache `uniflow-pwa-cache-v5` pour invalider les anciens bundles qui ne connaissent pas cette règle.

La production a été vérifiée avec le compte QA : après rechargement de `https://uniflow.kernelforge.codes/#/app`, l’espace a récupéré une matière, un créneau, une tâche et une note Appwrite réelle, avec une moyenne calculée à 16,00/20.
