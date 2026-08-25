# Suivi des améliorations UniFlow Web

- [x] Auditer les pages académiques, administratives et personnelles restantes afin de relever les erreurs Appwrite, les états de chargement prolongés et les actions incomplètes.
- [x] Réduire les délais de chargement initiaux des répertoires administratifs sans masquer les erreurs ni utiliser de données fictives, en réutilisant un état de session déjà validé pendant une même navigation.
- [x] Afficher les adresses email réelles des étudiants et enseignants dans les tableaux administratifs sans exposer de mots de passe ni réaliser de requête vers un backend legacy.
- [x] Vérifier les parcours d’administration des comptes, de présence QR, de planning et de notifications avec les données Appwrite réelles.
- [x] Corriger les écarts fonctionnels prioritaires identifiés pendant l’audit.
- [x] Exécuter TypeScript, lint, build et contrôles de production avant publication sur main.
- [x] Documenter et publier les améliorations validées.
- [x] Auditer l’inscription universitaire UY1 / ICT4D et vérifier qu’elle crée un profil, une entrée annuaire et les inscriptions académiques nécessaires.
- [x] Relier les nouveaux apprenants ICT4D aux listes de présence utilisées par les délégués et enseignants, sans donnée simulée.
- [x] Relier les listes d’apprenants inscrits aux interfaces d’évaluation des enseignants avec contrôle d’affectation de cours.
- [x] Calculer les moyennes et états de notes uniquement à partir des évaluations Appwrite réelles, avec valeurs explicites quand aucune note n’existe.
- [x] Exécuter les tests de création de compte, présence, saisie de notes et vérification production avant publication.
- [x] Mesurer les temps de réponse, erreurs et comportements idempotents de la Function de présence sous charge Appwrite contrôlée.
- [x] Créer et exécuter une suite E2E automatisée couvrant le parcours UY1 : inscription, inscriptions, appel, notes et relevé.
- [x] Produire une présentation synthétique du cycle ICT4D destinée à l’équipe pédagogique à partir des résultats mesurés.
- [x] Auditer les collections, permissions et composants de messagerie afin d’identifier les données actuellement absentes ou simulées.
- [x] Implémenter les conversations et messages universitaires réels dans Appwrite, avec lecture, envoi et autorisations par utilisateur.
- [x] Valider depuis l’interface de production un échange réel entre comptes universitaires, puis documenter le résultat.
- [x] Corriger le marquage lu Appwrite afin que le compteur de messages se mette à jour après l’ouverture effective d’une conversation.
- [x] Créer des captures représentatives de la production UniFlow et préparer une publication LinkedIn avec description et hashtags.
- [x] Créer des captures d’interfaces utilisateur UniFlow réelles, anonymisées et adaptées au carrousel LinkedIn.
- [x] Exclure de toutes les captures LinkedIn les écrans de connexion, adresses e-mail, mots de passe et identifiants saisis.
- [x] Héberger le fichier de validation Google fourni à la racine du domaine UniFlow et vérifier son accès en production.
- [x] Vérifier les données d’indexation et de performance Google Search Console disponibles pour UniFlow (rapports privés non accessibles dans cette session ; limite documentée).
- [x] Auditer puis renforcer les fondations SEO techniques et sémantiques des pages publiques UniFlow.
- [x] Rédiger un plan SEO priorisé fondé sur les données observables, sans promesse de classement.
- [x] Créer une présentation de configuration et référencement Google destinée à l’équipe UniFlow.
- [x] Analyser les mots-clés concurrents et les opportunités de positionnement du marché des logiciels de gestion universitaire pour UniFlow.
- [x] Documenter les opportunités de mots-clés francophones à partir de résultats publics, sans inventer de volume, trafic ou position concurrentielle.
- [x] Définir la structure éditoriale des pages cibles « présence QR code université » et « émargement universitaire ».
- [x] Rédiger le guide comparatif « SIS vs logiciel de gestion scolaire » avec périmètre factuel UniFlow.
- [x] Créer une présentation de synthèse de l’analyse concurrentielle des mots-clés pour l’équipe UniFlow.
- [x] Préparer les textes, technologies, liens et médias anonymisés pour le brouillon Devpost UniFlow.
- [ ] Renseigner le brouillon Devpost et fournir des captures de contrôle sans effectuer la soumission publique.
- [x] Fournir un lot Devpost prêt à copier, incluant textes publics complets et captures UniFlow anonymisées au format compatible.
- [x] Exécuter une vérification E2E complète des derniers flux Appwrite et contrôler les pages concernées sur Vercel.
- [x] Recharger proprement le client lorsqu’un import Vite périmé est détecté après un déploiement Vercel.
- [x] Vérifier le contenu et les captures réelles Devpost pour produire un lot final sans retouche ni données d’accès.
- [x] Auditer les contrôles client, Functions et en-têtes HTTP pour identifier les risques de robustesse et de sécurité prioritaires.
- [x] Renforcer les protections prioritaires sans modifier le périmètre Appwrite ni ajouter de données simulées.
- [x] Vérifier et purger les caches locaux historiques qui peuvent contenir des données personnelles d’anciens comptes.
- [x] Remplacer les promesses de connexion obsolètes par une explication exacte de la session Appwrite et des limites hors ligne.
- [x] Exécuter les tests de non-régression, vérifier la production Vercel et documenter les limites résiduelles.
- [x] Auditer les images, vidéos, logos et autres assets qui ne chargent plus sur UniFlow en production.
- [x] Corriger les références, politiques de contenu et fichiers assets défaillants sans remplacer les contenus validés par des éléments fictifs.
- [x] Tester les assets corrigés sur Vercel et documenter la validation de production.
- [x] Retrouver et restaurer exclusivement le logo UniFlow d’origine, sans substitution visuelle générée ou générique.
- [x] Vérifier le rendu du logo restauré sur Vercel et retirer les remplacements non souhaités.
- [x] Inventorier les images et médias lourds réellement utilisés afin de les distribuer depuis le bucket Appwrite sans déplacer les icônes légères.
- [x] Téléverser les médias validés vers le bucket Appwrite et relier le client à des URL de prévisualisation publiques contrôlées.
- [x] Vérifier les fallbacks locaux, le poids de distribution et le rendu Vercel après externalisation des assets lourds.
- [x] Fournir uniquement des captures brutes de l’interface UniFlow depuis le navigateur, sans image générée, retouche IA, identifiant ni écran de connexion.
- [x] Retirer les bordures ajoutées autour des captures Devpost en conservant l’interface réelle plein cadre.
- [x] Vérifier et restructurer le README GitHub UniFlow pour en faire un lien de référence Devpost fiable.
- [x] Identifier, appliquer et valider des améliorations prioritaires du projet compatibles avec Appwrite.
- [x] Auditer, corriger et tester le parcours Forum avec des données Appwrite réelles et des permissions contrôlées.
- [x] Auditer, corriger et tester le parcours Contact sans inventer de coordonnées ni exposer de données sensibles.
- [x] Empêcher les auto-réactions sur les publications Forum et vérifier ce contrôle par un test Appwrite auto-nettoyant.
- [x] Auditer les plans, statuts et écrans d’abonnement Appwrite afin d’identifier les actions indisponibles ou simulées.
- [x] Enregistrer une demande d’abonnement Appwrite avec référence unique, statut en attente et lien WhatsApp prérempli vers le numéro fourni.
- [x] Ajouter le contrôle administratif manuel qui confirme ou rejette une demande après vérification externe de la preuve de paiement.
- [x] Tester le parcours de demande depuis l’interface sans confirmer automatiquement de paiement, puis documenter sa limite de validation manuelle.
- [x] Vérifier l’écran administrateur de paiement WhatsApp et nettoyer les demandes ainsi que les comptes QA créés pour le contrôle d’interface.
- [x] Auditer puis corriger la restauration de session Appwrite depuis IndexedDB, sans stocker de secret ou de jeton réutilisable dans IndexedDB.
- [x] Permettre une navigation explicite entre l’espace authentifié et l’accueil sans déconnexion, avec un retour cohérent vers le bon tableau de bord.
- [x] Évaluer Stripe et confirmer son retrait du périmètre : aucun secret, code Stripe, webhook ou paiement carte n’est activé dans UniFlow.
- [x] Tester les parcours de session, navigation et WhatsApp avant publication, sans effectuer de transaction financière réelle pendant les tests.

- [x] Créer des commentaires de contrôle dans le Forum depuis le parcours Appwrite réel et vérifier leur lecture.
- [x] Tester une demande d’abonnement WhatsApp Appwrite sans confirmer de paiement réel.
- [x] Nettoyer les données de test créées et documenter les résultats ainsi que les éventuelles limites de permissions.

## Historique — contrôle forum et abonnement du 25 août 2026

- [x] Validation demandée et confirmée par l’utilisateur pour les écritures de test dans Appwrite.

## Fin de l’historique

Les éléments ci-dessus seront cochés après vérification effective, sans exposer de compte de test ni de secret.

- [x] Simuler la validation administrative d’une demande de souscription et vérifier la transition `PENDING` vers `CONFIRMED`/actif.
- [x] Mesurer sous concurrence contrôlée les flux Forum et abonnement Appwrite avec des données de test isolées.
- [x] Nettoyer toutes les données et comptes de charge puis documenter les résultats, erreurs et limites observées.

- [x] Étendre le test de charge Forum et abonnement à 50 utilisateurs Appwrite simultanés et mesurer p50/p95/max ainsi que les échecs.
- [x] Vérifier l’intégrité post-nettoyage des collections Appwrite : absence des données éphémères, unicité des références et conservation des volumes de référence.
- [x] Documenter la limite observée et conserver le scénario de charge reproductible sans secrets ni données persistantes.
