# Suivi des améliorations UniFlow Web

- [x] Auditer les pages académiques, administratives et personnelles restantes afin de relever les erreurs Appwrite, les états de chargement prolongés et les actions incomplètes.
- [x] Réduire les délais de chargement initiaux des répertoires administratifs sans masquer les erreurs ni utiliser de données fictives, en réutilisant un état de session déjà validé pendant une même navigation.
- [x] Afficher les adresses email réelles des étudiants et enseignants dans les tableaux administratifs sans exposer de mots de passe ni réaliser de requête vers un backend legacy.
- [x] Vérifier les parcours d’administration des comptes, de présence QR, de planning et de notifications avec les données Appwrite réelles.
- [x] Corriger les écarts fonctionnels prioritaires identifiés pendant l’audit.
- [x] Exécuter TypeScript, lint, build et contrôles de production avant publication sur main.
- [x] Documenter et publier les améliorations validées.
- [ ] Auditer l’inscription universitaire UY1 / ICT4D et vérifier qu’elle crée un profil, une entrée annuaire et les inscriptions académiques nécessaires.
- [ ] Relier les nouveaux apprenants ICT4D aux listes de présence utilisées par les délégués et enseignants, sans donnée simulée.
- [ ] Relier les listes d’apprenants inscrits aux interfaces d’évaluation des enseignants avec contrôle d’affectation de cours.
- [ ] Calculer les moyennes et états de notes uniquement à partir des évaluations Appwrite réelles, avec valeurs explicites quand aucune note n’existe.
- [ ] Exécuter les tests de création de compte, présence, saisie de notes et vérification production avant publication.
