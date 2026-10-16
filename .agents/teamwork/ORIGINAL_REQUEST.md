# Original User Request

## 2026-10-13T10:55:51Z

Refonte globale et harmonisation des interfaces, systèmes fonctionnels et assets graphiques/images à travers les trois clients UniFlow (Web2, Mobile Flutter, Desktop Flutter) selon la nouvelle directive 100% autonome et indépendante.

Working directory: /home/ravel/Documents/Projet KERNEL FORGE
Integrity mode: development

## Requirements

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

## Acceptance Criteria

### Critères de Qualité et Compilation
- [ ] Le build `pnpm run build` dans `independant/web2` compile avec 0 erreur.
- [ ] `flutter analyze --no-fatal-infos` dans `uniflow-mobile` ne renvoie aucune erreur bloquante.
- [ ] `flutter analyze --no-fatal-infos` dans `uniflow-desktop` ne renvoie aucune erreur bloquante.
- [ ] Les tests de régression (`flutter test`, `pnpm test`) s'exécutent avec succès.
- [ ] Les flux fonctionnels clés sont opérationnels : recherche Z-Library, assistant Groq, feuille d'appel avec export PDF/Excel.
- [ ] La bascule interactive Photos Réelles ⟷ Avatars Anime est validée sur la page Équipe sur Web, Mobile et Desktop.
- [ ] Zéro clé API ou secret versionné en clair ; aucun trailer `Co-authored-by` dans l'historique Git.

## 2026-10-13T11:13:38Z

Le serveur a redémarré. Reprends l'exécution de l'orchestration teamwork pour la refonte des interfaces, systèmes et images sur Web2, Mobile et Desktop.
