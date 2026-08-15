# Audit de l’espace PERSONAL vide

L’inscription d’un compte indépendant crée uniquement le compte `User` et son profil `PersonalUser`. Le service backend ne crée aucune matière, aucun créneau, aucune note et aucune tâche par défaut.

Les formulaires frontend PERSONAL démarrent désormais avec des champs de saisie vides. Les valeurs de jour, heure, type de séance, priorité, statut, note maximale et coefficient ne sont plus préremplies. Les champs optionnels non renseignés sont omis du payload envoyé à l’API ; une matière sans crédits explicites n’envoie plus `credits: 0`, valeur rejetée par la validation backend.

Les indicateurs du tableau de bord restent calculés à partir des tableaux retournés par Neon. Pour un compte neuf, ils affichent zéro, un tiret ou un état vide explicite. Aucun contenu académique fictif n’est utilisé pour remplir l’espace indépendant.
