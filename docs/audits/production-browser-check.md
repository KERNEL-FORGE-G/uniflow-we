# Vérification navigateur de production — 14 août 2026

La page publique https://uniflow.kernelforge.codes/ répond correctement et affiche la mention honnête « Les métriques de campus apparaissent après connexion à un compte universitaire autorisé. ». Aucun appel public à `stats/overview` n’est désormais nécessaire pour afficher la landing page.

Le tableau de bord Vercel sandbox n’est pas authentifié dans la session disponible ; la page redirige vers `vercel.com/login`. Les paramètres de variables d’environnement Vercel ne peuvent donc pas être inspectés depuis cette session.

Les routes publiques du backend personnel répondent désormais HTTP 503 pour `/api/v1/subscription/plans`, `/api/v1/subscription/pricing?countryCode=CM` et `/api/v1/auth/academic-options`, tandis que `/` et `/api/docs-json` répondent HTTP 200. Le bootstrap NestJS est donc accessible mais une dépendance Prisma/Neon échoue pendant les requêtes de données. Le filtre backend publié dans `13d6ade` transforme le 500 générique en état de service indisponible. La vérification de la variable de connexion Neon et/ou de l’état de la base dans Vercel reste nécessaire pour rétablir les lectures et écritures.
