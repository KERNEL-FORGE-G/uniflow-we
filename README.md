# 🌐 UniFlow Web — Le Portail Universitaire Central

![UniFlow Logo](logo.png)

UniFlow Web est le cœur battant de l'écosystème UniFlow. Il s'agit d'une **PWA (Progressive Web App)** moderne, développée avec **React, TypeScript et Vite**, servant de point d'entrée universel pour tous les types de comptes (Étudiants, Enseignants, Indépendants et Administrateurs).

## 💡 Concept "PWA & Offline-First"
Le web UniFlow n'est pas un simple site, c'est une application installable qui fonctionne parfaitement hors-ligne grâce à une stratégie agressive de mise en cache et à l'utilisation d'**IndexedDB** pour la persistence locale des sessions et données.

## 🚀 Architecture Cloud-Native (Appwrite)
L'application repose intégralement sur **Appwrite** pour ses services backend :
- **Realtime** : Mise à jour instantanée des notifications et messages.
- **Functions** : Logique métier sécurisée pour l'émargement et les notes.
- **Storage** : Gestion des ressources pédagogiques multimédias.
- **Database** : Structure de données unifiée pour Mobile et Desktop.

## ✨ Modules de la Plateforme

### 1. Espaces Utilisateurs Personnalisés
- **Dashboard Académique** : Vue d'ensemble pour les étudiants inscrits à l'Université de Yaoundé I.
- **Espace Indépendant (UniFlow Personnel)** : Workspace dédié aux utilisateurs souhaitant gérer leurs études de manière autonome, hors cadre institutionnel.
- **Portail Enseignant** : Gestion des cours et émargement par QR Code.

### 2. Fonctionnalités Phares
- **Visioconférence Intégrée** : Salles de cours virtuelles avec support LAN/Internet.
- **Forum & Social** : Réseau social académique complet.
- **Bibliothèque Interactive** : Visionneuse intégrée pour les supports de cours.
- **Paiements WhatsApp** : Flux de souscription aux plans premium via validation manuelle.

### 3. Sentinelle IoT Monitoring
- Dashboard de monitoring des constantes vitales et des flux Vigie IA pour les responsables de sécurité.

## 🛠️ Stack Technique
- **Frontend** : React 18, TypeScript, Tailwind CSS, Framer Motion.
- **Build Tool** : Vite.
- **BaaS** : Appwrite (Cloud & Self-Hosted).
- **IA** : Intégration Gemini API pour l'assistance intelligente.
- **3D** : Three.js (React Three Fiber) pour les éléments visuels immersifs.

## 📦 Déploiement
L'application est optimisée pour un déploiement sur **Vercel** ou tout serveur statique supportant les PWA.
```bash
npm install
npm run build
```

---
© 2026 **KERNEL FORGE** — Une plateforme, une infinité de possibilités.
