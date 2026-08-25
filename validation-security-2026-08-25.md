# Validation de robustesse et sécurité — 25 août 2026

## Contrôles réussis avant publication

| Contrôle | Résultat |
|---|---|
| TypeScript et build Vite | Réussis ; les avertissements de taille de chunk restent non bloquants. |
| E2E UY1 / Appwrite | Réussi avec nettoyage ; inscription, 10 inscriptions, appel, notes, messagerie, abonnement manuel et audit d’intégrité validés. |
| Forum et Contact | Réussi avec un contrôle auto-nettoyant des Functions. |
| En-têtes Vercel | CSP, Permissions-Policy, COOP, CORP, HSTS, Referrer-Policy, `nosniff` et protection de cadrage sont servis par le domaine public. |

## Point à diagnostiquer

Le premier chargement de la présence sous les nouveaux en-têtes rend l’interface, mais la session de démonstration précédemment active n’est pas restaurée dans le navigateur de contrôle. Aucune action d’écriture ni de scan QR n’a été réalisée. Ce point bloque la validation finale de la persistance de session en production.

## Nettoyage local vérifié

Après publication du commit `f226cd0`, un chargement sans session a supprimé les caches locaux personnels historiques. Seule la préférence d’interface non personnelle est restée dans `localStorage`; aucun instantané de profil ni cache de matières, planning, tâches ou notes n’est resté présent. Une clé de récupération de déploiement, bornée dans le temps, reste en `sessionStorage` pour prévenir les imports Vite périmés.
