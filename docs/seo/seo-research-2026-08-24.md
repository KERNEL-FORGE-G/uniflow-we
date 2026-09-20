# Constats externes SEO — UniFlow — 24 août 2026

## Accès et présence publique

- L’accès direct à Google Search Console a redirigé vers la page publique de connexion Google ; aucune métrique privée (clics, impressions, position ou couverture) n’a donc été disponible dans cette session. L’activation du connecteur de navigateur personnel a été proposée mais non acceptée.
- Une requête publique Google `site:uniflow.kernelforge.codes` a affiché « did not match any documents » le 24 août 2026. Ce contrôle est indicatif : seul Search Console peut confirmer l’état d’indexation et les performances mesurées.
- Les résultats de recherche web pour les requêtes de marque ont principalement renvoyé des résultats tiers et GitHub, plutôt qu’une page UniFlow du domaine de production. Cela confirme que la visibilité de marque est actuellement limitée dans l’échantillon public observé.

## Pages et crawl observés

- `https://uniflow.kernelforge.codes/about` répondait `404 NOT_FOUND` le 24 août 2026, alors que l’URL figure dans le sitemap public. Les autres URL marketing `/pricing` et `/presentation` n’ont pas fourni de contenu à l’extraction textuelle.
- Le domaine sert `robots.txt`, `sitemap.xml` et le fichier de validation Google à la racine. Le fichier de validation a été confirmé en production avant cet audit.

## Références officielles

1. Google Search Central, *Understand JavaScript SEO Basics* : https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics
2. Google Search Central, *What Is a Sitemap* : https://developers.google.com/search/docs/crawling-indexing/sitemaps/overview
3. Google Search Central, *Build and Submit a Sitemap* : https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap
4. Google Search Console Help, *URL Inspection tool* : https://support.google.com/webmasters/answer/9012289
5. Vercel, *React Router* : https://vercel.com/docs/frameworks/frontend/react-router
