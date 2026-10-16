# Audit du déploiement Web UniFlow — 16 août 2026

URL contrôlée : https://uniflow.kernelforge.codes/

Le projet Vercel `uniflow-web` (`prj_3JweOmK8ryfioyh4kXFYTOvDo7UC`) est associé à l’équipe `team_trxnDoCh5xdfUeqttrEFWu3c`. Le dernier déploiement de production contrôlé est `dpl_3FUjpy1PVZKJmtzGK7PrEqu9ww8F`, en état READY, et ses métadonnées indiquent le dépôt GitHub `KERNEL-FORGE-G/uniflow-we`, branche `main`, commit `e476fc133472b342a3b5d7ee200e6cdaffe0be83`.

Le bundle live courant contient les textes `Appwrite Cloud` dans les formulaires Connexion/Inscription. Il ne contient plus le texte exact `Backend Université`, mais il contient encore les constantes historiques `https://api-uniflow.kernelforge.codes/` et `https://api2-uniflow.kernelforge.codes/` dans le bundle, issues de `src/lib/api.ts`. Ces références doivent être supprimées des appels métier frontend pour respecter l’architecture Appwrite-exclusive.

Source : métadonnées Vercel retournées par l’API Vercel MCP et bundle JavaScript obtenu depuis le domaine live le 16 août 2026.
