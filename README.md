# 🎓 UniFlow — Plateforme Intégrée de Gestion Universitaire

UniFlow est une solution web moderne, rapide et responsive dédiée à la gestion académique et administrative dans l'enseignement supérieur. Conçue pour offrir une expérience fluide aux étudiants, enseignants et administrateurs.

---

## 🚀 Fonctionnalités Principales

- **📊 Tableaux de bord personnalisés** : Espaces dédiés selon le rôle (Étudiant, Enseignant, Administrateur).
- **📚 Gestion Pédagogique** : Consultation des cours, emplois du temps, notes et requêtes académiques.
- **🔊 Effets Sonores Interactifs (Web Audio API)** : Feedback sonore subtil lors du clic sur les boutons et lors des retours d'actions (succès, avertissement, erreur).
- **🌙 Mode Sombre & Clair Optimisé** : Palette de couleurs soigneusement ajustée pour offrir une lisibilité maximale et un confort visuel sans fatigue.
- **⚡ Navigation Réactive (HashRouter)** : Routage robuste adapté à tous les environnements d'hébergement.
- **🌐 Moteur Réseau Performant** : Intégration Axios optimisée avec pré-connexion DNS (`api.uniflow.kernelforge.codes`), intercepteurs de requêtes et gestion des toasts.

---

## 🛠️ Stack Technique

- **Frontend** : React 18, TypeScript, Vite
- **Styling & UI** : Tailwind CSS, Lucide React Icons
- **Routage** : React Router DOM (`HashRouter`)
- **HTTP Client** : Axios avec intercepteurs
- **Effets Sonores** : Web Audio API (synthétiseur léger sans dépendance externe)

---

## 📁 Structure du Projet

```text
src/
├── components/       # Composants UI réutilisables, modales et mise en page
│   ├── layout/       # AppLayout, AdminLayout, Navbar, Sidebar
│   └── ui/           # Toast, boutons, cartes, etc.
├── pages/            # Pages de l'application (Dashboard, Cours, Notes, Profil)
├── lib/              # Configuration API Axios et utilitaires réseau
├── utils/            # Utilitaires (sound.ts, theme.ts, useToast.tsx)
└── main.tsx          # Point d'entrée de l'application React
```

---

## 💻 Démarrage Rapide

### Prérequis
- Node.js (v18 ou supérieur)
- npm ou yarn

### Installation

1. Installez les dépendances :
```bash
npm install
```

2. Lancez le serveur de développement :
```bash
npm run dev
```

3. Ouvrez votre navigateur à l'adresse : `http://localhost:3000`

---

## 🏗️ Build pour la Production

Pour compiler l'application pour la production :

```bash
npm run build
```

Pour vérifier le typage et le linting :

```bash
npm run lint
```

### Configuration réseau et mode démonstration

Copiez `.env.example` vers `.env` puis adaptez les URLs des backends selon votre environnement. Le délai maximal des requêtes API est configurable avec `VITE_API_TIMEOUT_MS` et vaut 8 secondes par défaut.

Les boutons « Connexion rapide (démo) » activent explicitement un compte local de démonstration lorsque le backend distant est indisponible. Une connexion saisie manuellement ne bascule jamais automatiquement vers un compte mock : une erreur d’authentification reste une erreur et n’ouvre pas de session locale.

Le service worker et le manifeste utilisent les routes `HashRouter` de l’application, par exemple `/#/app`, `/#/app/emploi-du-temps` et `/#/app/presences`. Après modification des assets ou des règles de cache, désinstallez puis réinstallez la PWA afin de forcer l’activation du nouveau cache.

---

## 📄 Licence

Ce projet est sous licence MIT. Tous droits réservés.
