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
