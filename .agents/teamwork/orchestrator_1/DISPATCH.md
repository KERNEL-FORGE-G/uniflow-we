# Dispatch Record

## 2026-10-13T10:57:25Z
From: bc27bc49-63f6-45ed-b786-77da510767ab (Sentinel)

Vous êtes l'Orchestrateur de Projet (teamwork_preview_orchestrator).

Votre répertoire de travail dédié est : `/home/ravel/Documents/Projet KERNEL FORGE/.agents/teamwork/orchestrator_1`.
Le fichier officiel de la demande utilisateur est : `/home/ravel/Documents/Projet KERNEL FORGE/.agents/teamwork/ORIGINAL_REQUEST.md`.

## Mission
Orchestrer et exécuter la refonte globale et l'harmonisation des interfaces, systèmes fonctionnels et assets graphiques/images à travers les trois clients UniFlow :
1. Web2 (`/home/ravel/Documents/Projet KERNEL FORGE/independant/web2`)
2. Mobile Flutter (`/home/ravel/Documents/Projet KERNEL FORGE/uniflow-mobile`)
3. Desktop Flutter (`/home/ravel/Documents/Projet KERNEL FORGE/uniflow-desktop`)

Consultez impérativement au préalable `AGENTS.md`, `ETAT-DU-PROJET.md`, et `TRAVAUX-RESTANTS.md` à la racine du projet.

## Exigences (Requirements)

### R1. Refonte & Cohérence des Interfaces (UI/UX Multi-plateforme)
- Harmoniser le langage visuel professionnel (style moderne épuré, navigation latérale fluide, badges de profil et indicateurs d'état) sur Web (`independant/web2`), Mobile (`uniflow-mobile`) et Desktop (`uniflow-desktop`).
- Adapter tous les écrans aux 3 profils autonomes (Étudiant libre, Délégué de groupe, Enseignant indépendant) sans notion universitaire obligatoire.

### R2. Refonte & Consolidation des Systèmes Fonctionnels
- **Gestion des présences & listes d'appel** : Saisie libre d'apprenants, génération QR dynamique hors ligne et exports PDF/Excel immédiats.
- **Bibliothèque numérique** : Moteur de recherche et consultation exclusivement Z-Library avec cache permanent Appwrite Storage.
- **Assistant IA Uni** : Connexion au moteur Groq Llama-3.3-70b avec bascule transparente offline/Appwrite.
- **Synchronisation Offline-First** : Persistance locale et file de rejeu automatique lors du retour du réseau.

### R3. Harmonisation des Images, Avatars et Assets Visuels
- Déploiement unifié du nouveau logo hibou professionnel & boucle d'infini sur tous les formats (icônes d'application, bannières, splash screens, favicons).
- Intégration complète de la galerie d'équipe KERNEL FORGE (10 membres) avec switch interactif instantané entre photos réelles et avatars anime haute définition.
- Remplacement de toutes les illustrations système résiduelles par des rendus 3D / Edge AI modernes (Sentinelle, Hero, Auth, Bibliothèque, Planning).

## Critères d'Acceptation (Acceptance Criteria)
- [ ] Le build `pnpm run build` dans `independant/web2` compile avec 0 erreur.
- [ ] `flutter analyze --no-fatal-infos` dans `uniflow-mobile` ne renvoie aucune erreur bloquante.
- [ ] `flutter analyze --no-fatal-infos` dans `uniflow-desktop` ne renvoie aucune erreur bloquante.
- [ ] Les tests de régression (`flutter test`, `pnpm test`) s'exécutent avec succès.
- [ ] Les flux fonctionnels clés sont opérationnels : recherche Z-Library, assistant Groq, feuille d'appel avec export PDF/Excel.
- [ ] La bascule interactive Photos Réelles ⟷ Avatars Anime est validée sur la page Équipe sur Web, Mobile et Desktop.
- [ ] Zéro clé API ou secret versionné en clair ; aucun trailer `Co-authored-by` dans l'historique Git.

## 2026-10-13T11:14:38Z
From: bc27bc49-63f6-45ed-b786-77da510767ab (Sentinel)

Le serveur a redémarré. Tous les sous-agents et tâches ont été réinitialisés à l'état idle. Reprends immédiatement l'orchestration du projet : vérifie l'état de tes explorateurs (Web2, Mobile, Desktop), relance-les si nécessaire en leur envoyant un message ou poursuis la phase de Survey / Milestones pour la refonte globale des interfaces, systèmes et images sur Web2, Mobile et Desktop selon ORIGINAL_REQUEST.md.
