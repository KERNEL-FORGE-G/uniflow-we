# 🚀 Guide de Configuration du Second Backend (SaaS) sur Vercel

Ce guide explique étape par étape comment déployer le **Backend 2 (Comptes Indépendants / SaaS)** sur **Vercel**, et comment le relier à l'application frontend React d'UniFlow.

---

## 🏗️ 1. Architecture du Second Backend (`uniflow-personal-backend`)

Le second backend est un serveur **Node.js Express Serverless** optimisé pour tourner sur Vercel Edge/Serverless Functions.

### Arborescence recommandée du projet Backend 2 :
```
uniflow-personal-backend/
├── api/
│   └── index.ts          # Express App + Endpoints Serverless
├── .env.example          # Variables d'environnement de dev
├── package.json          # Dépendances Node.js / Express
├── tsconfig.json         # Configuration TypeScript
└── vercel.json           # Fichier de routage Vercel
```

---

## 📜 2. Fichiers de Configuration Vercel

### Fichier `vercel.json` (Routage Vercel)
Créez ce fichier à la racine de votre projet backend pour rediriger toutes les requêtes d'API :

```json
{
  "version": 2,
  "builds": [
    {
      "src": "api/index.ts",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "api/index.ts"
    }
  ]
}
```

### Fichier `package.json`
```json
{
  "name": "uniflow-personal-backend",
  "version": "1.0.0",
  "main": "api/index.ts",
  "scripts": {
    "dev": "tsx watch api/index.ts",
    "build": "tsc"
  },
  "dependencies": {
    "cors": "^2.8.5",
    "dotenv": "^16.4.5",
    "express": "^4.19.2",
    "jsonwebtoken": "^9.0.2",
    "pg": "^8.11.5"
  },
  "devDependencies": {
    "@types/cors": "^2.8.17",
    "@types/express": "^4.17.21",
    "@types/node": "^20.12.7",
    "@vercel/node": "^3.0.24",
    "typescript": "^5.4.5"
  }
}
```

---

## 🛠️ 3. Étapes de Déploiement sur Vercel

### Option A : Déploiement via Vercel CLI (Ligne de commande)

1. **Installer la CLI Vercel** :
   ```bash
   npm install -g vercel
   ```

2. **Connexion à votre compte Vercel** :
   ```bash
   vercel login
   ```

3. **Déployer en mode Preview** :
   Positionnez-vous dans le dossier de votre second backend et lancez :
   ```bash
   vercel
   ```

4. **Déployer en Production** :
   ```bash
   vercel --prod
   ```
   Vous obtiendrez votre URL d'API de production :  
   `https://uniflow-personal-backend.vercel.app`

---

### Option B : Déploiement via GitHub & Interface Web Vercel

1. Publiez le dossier `uniflow-personal-backend` sur un dépôt GitHub (ex: `github.com/votre-compte/uniflow-personal-backend`).
2. Rendez-vous sur [dashboard.vercel.com](https://dashboard.vercel.com) et cliquez sur **Add New > Project**.
3. Importez votre dépôt GitHub.
4. Dans les paramètres du projet, configurez les variables d'environnement.
5. Cliquez sur **Deploy**.

---

## 🔐 4. Configuration des Variables d'Environnement (Vercel Dashboard)

Dans l'interface Vercel (**Settings > Environment Variables**), ajoutez les clés suivantes :

| Clé | Description | Exemple de Valeur |
| :--- | :--- | :--- |
| `DATABASE_URL` | URL de connexion PostgreSQL (Neon, Supabase ou ElephantSQL) | `postgres://user:pass@ep-xxx.neon.tech/uniflow_personal` |
| `JWT_SECRET` | Clé secrète pour signer les jetons d'authentification | `super_secret_jwt_key_uniflow_2026` |
| `NOTCHPAY_PUBLIC_KEY` | Clé API NotchPay pour les 100 FCFA Mobile Money (Cameroun) | `pk.test.xxxxxx` |
| `NOTCHPAY_SECRET_KEY` | Clé secrète NotchPay pour valider les webhooks | `sb.test.xxxxxx` |
| `STRIPE_SECRET_KEY` | Clé secrète Stripe pour les abonnements 1,00 € (International) | `sk_live_xxxxxx` |
| `STRIPE_WEBHOOK_SECRET` | Clé Webhook Stripe | `whsec_xxxxxx` |

---

## 🌐 5. Liaison du Frontend React avec le Second Backend

Dans le frontend React de UniFlow, les deux backends sont gérés simultanément grâce au fichier `.env` :

```env
# .env dans le projet Frontend React
VITE_UNIVERSITY_API_URL=https://api-uni.uniflow.edu
VITE_PERSONAL_API_URL=https://uniflow-personal-backend.vercel.app
```

Le client API React (`src/lib/api.ts`) commute automatiquement l'URL cible lors de chaque requête selon le type du compte connecté :
- Si `user.accountType === 'PERSONAL'` ➔ Les requêtes vont vers `VITE_PERSONAL_API_URL`
- Si `user.accountType === 'UNIVERSITY'` ➔ Les requêtes vont vers `VITE_UNIVERSITY_API_URL`
