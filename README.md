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

---

## 📄 Licence

Ce projet est sous licence MIT. Tous droits réservés.
