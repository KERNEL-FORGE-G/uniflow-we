# 📐 Configuration Vercel - UniFlow (Frontend & Backend)

Ce document récapitule la configuration complète pour déployer **UniFlow Web Frontend** et le **Second Backend (API SaaS Personnel)** sur **Vercel**.

---

## 🎨 1. Configuration du Frontend React (Vite)

### Parameter Settings sur le Dashboard Vercel

* **Framework Preset** : `Vite`
* **Root Directory** : `./`
* **Build Command** : `npm run build`
* **Output Directory** : `dist`
* **Install Command** : `npm install`

### Variables d'Environnement Frontend (Vercel > Settings > Environment Variables)

```env
# URL du Backend 1 (Université / Institutionnel)
VITE_UNIVERSITY_API_URL=https://api-uni.uniflow.edu

# URL du Backend 2 (Personnel / SaaS Indépendant sur Vercel)
VITE_PERSONAL_API_URL=https://uniflow-personal-backend.vercel.app

# URL de fallback pour l'application
VITE_API_URL=https://api-uni.uniflow.edu
VITE_APP_URL=https://uniflow.edu
```

### Fichier `vercel.json` pour le Frontend (Routage SPA React)

Pour éviter les erreurs 404 lors du rafraîchissement des pages React Router :

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ]
}
```

---

## ⚡ 2. Configuration du Backend 2 (Express Serverless SaaS)

Si vous hébergez le second backend dans un projet Vercel séparé (`uniflow-personal-backend`) :

### Fichier `vercel.json` (Backend Serverless)

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

### Variables d'Environnement Backend (Vercel > Settings > Environment Variables)

```env
DATABASE_URL=postgres://postgres:password@ep-xxx.neon.tech/uniflow_personal
JWT_SECRET=votre_cle_secrete_jwt_super_securisee
NOTCHPAY_PUBLIC_KEY=pk.test.xxxxxx
NOTCHPAY_SECRET_KEY=sb.test.xxxxxx
STRIPE_SECRET_KEY=sk_live_xxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxx
```

---

## 🚀 3. Commandes de Déploiement Vercel CLI

```bash
# Se connecter à Vercel
vercel login

# Déployer en environnement de Preview
vercel

# Déployer en Production
vercel --prod
```
