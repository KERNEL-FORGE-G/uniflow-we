# Diagnostic des requêtes Appwrite

Le 22 août 2026, la documentation Appwrite a été consultée pour confirmer que les lectures de collections prennent un tableau de chaînes `queries` généré par `Query`, avec notamment `Query.orderAsc("attribute")`, `Query.orderDesc("attribute")` et `Query.limit(n)`.

Source : <https://appwrite.io/docs/products/databases/legacy/queries>

L’instance auto-hébergée UniFlow (`1.6.1`) a retourné `400 general_query_invalid` sur une requête REST contenant `orderAsc("code")`. Les lectures académiques doivent donc rester dépourvues de filtres/tri tant que la compatibilité précise entre son API REST et le SDK installé n’est pas validée. L’accès sans paramètre de requête a été confirmé avec un total de dix cours.
