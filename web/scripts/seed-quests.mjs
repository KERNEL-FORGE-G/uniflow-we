/**
 * Seed — 300 quêtes dynamiques UniFlow.
 *
 * Catégories de périodes :
 *   weekly   = reset chaque lundi à 00h00
 *   monthly  = reset le 1er du mois à 00h00
 *   annual   = reset le 1er janvier à 00h00
 *   special  = quêtes ponctuelles (événements)
 *
 * La fonction Appwrite `quest-reset` parcourt ces définitions et crée les
 * entrées user_quest_progress à chaque période.
 *
 * node scripts/seed-quests.mjs
 */
import { Client, Databases, ID } from 'node-appwrite'
import dotenv from 'dotenv'
dotenv.config()

const client = new Client()
  .setEndpoint(process.env.APPWRITE_ENDPOINT)
  .setProject(process.env.APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY)

const db = new Databases(client)
const DATABASE_ID   = 'uniflow'
const COLLECTION_ID = 'quests_catalog'

// ─── Constructeur de quête ───────────────────────────────────────────────────

let ord = 1
function q(period, category, criteriaType, target, title, description, xpReward, roles = ['student'], isActive = true) {
  return {
    sortOrder: ord++,
    period,
    category,
    criteriaType,
    targetValue: String(target),
    title,
    description,
    xpReward,
    targetRoles: roles,
    isActive,
    iconName: `quest_${criteriaType}`,
  }
}

// ─── 300 quêtes ──────────────────────────────────────────────────────────────

const quests = [

  // ════════════════════════════════════════════════════════════════════════════
  // HEBDOMADAIRES (1-120)
  // ════════════════════════════════════════════════════════════════════════════

  // ── Assiduité hebdo ──────────────────────────────────────────────────────
  q('weekly','assiduite','attendance_count',    1, 'Présent(e) cette semaine',   'Assister à au moins 1 séance cette semaine.',                     20),
  q('weekly','assiduite','attendance_count',    3, 'Assidu(e) x3',               'Assister à 3 séances cette semaine.',                             50),
  q('weekly','assiduite','attendance_count',    5, 'Présence parfaite',          'Assister à toutes les séances de la semaine (5).',               100),
  q('weekly','assiduite','on_time_arrivals',    3, 'Toujours à l\'heure x3',     'Arriver à l\'heure à 3 séances cette semaine.',                   40),
  q('weekly','assiduite','on_time_arrivals',    5, 'Ponctualité parfaite',       'Arriver à l\'heure à toutes les séances de la semaine.',          80),
  q('weekly','assiduite','app_open_streak',     5, 'Actif 5 jours de suite',     'Ouvrir UniFlow 5 jours consécutifs cette semaine.',               60),
  q('weekly','assiduite','app_open_streak',     7, 'Actif tous les jours',       'Ouvrir UniFlow chaque jour de la semaine.',                      100),

  // ── Académique hebdo ─────────────────────────────────────────────────────
  q('weekly','academique','assignments_submitted', 1, 'Devoir rendu',            'Rendre au moins 1 devoir cette semaine.',                         25),
  q('weekly','academique','assignments_submitted', 3, '3 devoirs rendus',        'Rendre 3 devoirs cette semaine.',                                 60),
  q('weekly','academique','quizzes_completed',  1, 'Quiz du jour',               'Compléter 1 quiz cette semaine.',                                 20),
  q('weekly','academique','quizzes_completed',  3, 'Quiz en série',              'Compléter 3 quiz cette semaine.',                                 55),
  q('weekly','academique','quizzes_completed',  5, 'Quiz mania',                 'Compléter 5 quiz cette semaine.',                                100),
  q('weekly','academique','quiz_avg_score',    75, 'Bonne moyenne quiz',         'Obtenir une moyenne ≥ 75% sur tous les quiz de la semaine.',       70),
  q('weekly','academique','quiz_avg_score',    90, 'Excellente moyenne quiz',    'Obtenir une moyenne ≥ 90% sur tous les quiz de la semaine.',      120),
  q('weekly','academique','study_time_minutes',120,'2h de révision',             'Accumuler 2h de temps d\'étude actif cette semaine.',             50),
  q('weekly','academique','study_time_minutes',300,'5h de révision',             'Accumuler 5h de temps d\'étude actif cette semaine.',            120),
  q('weekly','academique','notes_created',      3, 'Prise de notes x3',          'Créer 3 notes de cours cette semaine.',                           35),
  q('weekly','academique','courses_progress',  25, '25% d\'un cours',            'Progresser de 25% dans un cours cette semaine.',                  40),
  q('weekly','academique','courses_progress',  50, '50% d\'un cours',            'Progresser de 50% dans un cours cette semaine.',                  80),
  q('weekly','academique','courses_completed',  1, 'Cours bouclé',               'Terminer un cours complet cette semaine.',                        150),

  // ── Social hebdo ─────────────────────────────────────────────────────────
  q('weekly','social','forum_post_count',       1, 'Premier post de la semaine', 'Publier au moins 1 message sur le forum.',                        15),
  q('weekly','social','forum_post_count',       5, '5 messages forum',           'Publier 5 messages sur le forum cette semaine.',                  40),
  q('weekly','social','forum_post_count',      10, '10 messages forum',          'Publier 10 messages sur le forum cette semaine.',                 80),
  q('weekly','social','help_replies',           2, 'Aide x2',                    'Répondre à 2 questions d\'autres apprenants.',                    30),
  q('weekly','social','help_replies',           5, 'Aide en série',              'Répondre à 5 questions d\'autres apprenants.',                    70),
  q('weekly','social','likes_given',            5, 'Généreux x5',                'Liker 5 publications de la communauté.',                          10),
  q('weekly','social','resources_shared',       1, 'Partage ressource',          'Partager 1 ressource pédagogique cette semaine.',                 25),
  q('weekly','social','resources_shared',       3, 'Partage x3',                 'Partager 3 ressources pédagogiques cette semaine.',               60),
  q('weekly','social','comments_count',         5, '5 commentaires',             'Laisser 5 commentaires sur des publications.',                    20),

  // ── Communauté hebdo ─────────────────────────────────────────────────────
  q('weekly','communaute','leaderboard_points', 100, 'Gagner 100 points hebdo',  'Accumuler 100 points de classement cette semaine.',               50),
  q('weekly','communaute','leaderboard_points', 300, 'Gagner 300 points hebdo',  'Accumuler 300 points de classement cette semaine.',              120),
  q('weekly','communaute','badges_earned',        1, 'Badge débloqué',           'Débloquer au moins 1 badge cette semaine.',                       40),
  q('weekly','communaute','xp_earned',           50,'50 XP cette semaine',       'Gagner 50 XP cette semaine.',                                     30),
  q('weekly','communaute','xp_earned',          150,'150 XP cette semaine',      'Gagner 150 XP cette semaine.',                                    80),
  q('weekly','communaute','login_days',           5, 'Connexion 5 jours',        'Se connecter sur 5 jours distincts cette semaine.',               45),
  q('weekly','communaute','notifications_read',   5, '5 notifs lues',            'Lire 5 notifications cette semaine.',                             10),

  // ── Santé & habitudes hebdo ───────────────────────────────────────────────
  q('weekly','habitudes','morning_login',         3, 'Matinal x3',               'Se connecter avant 9h du matin 3 fois cette semaine.',            30),
  q('weekly','habitudes','evening_review',        3, 'Révision du soir x3',      'Accéder à UniFlow après 19h 3 fois cette semaine.',               30),
  q('weekly','habitudes','profile_update',        1, 'Profil à jour',            'Mettre à jour au moins 1 info de profil cette semaine.',          15),
  q('weekly','habitudes','goal_set',              1, 'Objectif posé',            'Définir ou réviser un objectif personnel cette semaine.',         20),
  q('weekly','habitudes','reminder_used',         3, 'Rappel x3',                'Utiliser la fonctionnalité rappel 3 fois cette semaine.',          15),

  // Enseignants — hebdo
  q('weekly','formateur','sessions_held',         2, 'Formateur actif',          'Animer au moins 2 séances cette semaine.',                        60, ['teacher']),
  q('weekly','formateur','assignments_graded',    5, '5 devoirs corrigés',       'Corriger 5 devoirs cette semaine.',                               70, ['teacher']),
  q('weekly','formateur','announcements_posted',  1, 'Annonce publiée',          'Publier au moins 1 annonce cette semaine.',                       25, ['teacher']),
  q('weekly','formateur','feedback_given',        5, '5 retours donnés',         'Donner 5 retours personnalisés aux apprenants.',                   80, ['teacher']),

  // Admins — hebdo
  q('weekly','admin','reports_viewed',            3, '3 rapports consultés',     'Consulter 3 rapports d\'activité cette semaine.',                  30, ['admin']),
  q('weekly','admin','users_onboarded',           2, '2 nouveaux membres guidés','Accompagner 2 nouveaux membres cette semaine.',                    50, ['admin']),

  // Quêtes spéciales hebdo (variables)
  q('weekly','special','top_poster',              1, 'Meilleur posteur de la semaine','Être le membre avec le plus de posts du forum cette semaine.',200),
  q('weekly','special','top_helper',              1, 'Meilleur aide de la semaine',   'Être le membre avec le plus de réponses d\'aide cette semaine.',180),
  q('weekly','special','mystery_bonus',           1, 'Défi mystère hebdo',       'Compléter le défi surprise de la semaine (annoncé lundi).',       150),
  q('weekly','special','quiz_streak',             3, 'Série quiz 3 jours',        'Compléter au moins 1 quiz chaque jour pendant 3 jours.',          90),
  q('weekly','special','perfect_week',            1, 'Semaine parfaite',         'Compléter toutes les quêtes hebdo obligatoires.',                 300),

  // Quêtes légères (petites actions quotidiennes tracées à la semaine)
  q('weekly','micro','message_read',             10, '10 messages lus',          'Lire 10 messages ou annonces dans l\'app.',                       10),
  q('weekly','micro','calendar_check',            3, 'Agenda x3',                'Consulter l\'agenda 3 fois dans la semaine.',                      10),
  q('weekly','micro','library_visit',             2, 'Bibliothèque x2',          'Visiter la section bibliothèque 2 fois.',                          10),
  q('weekly','micro','search_used',               3, 'Recherche x3',             'Utiliser la barre de recherche 3 fois.',                           10),
  q('weekly','micro','settings_check',            1, 'Paramètres revisités',     'Ouvrir les paramètres une fois cette semaine.',                     5),

  // Nouvelles catégories hebdo pour atteindre 120
  q('weekly','challenge','daily_challenge',       5, '5 défis quotidiens',       'Compléter 5 défis quotidiens dans la semaine.',                    80),
  q('weekly','challenge','streak_maintained',     7, 'Streak 7 jours',           'Maintenir son streak de connexion toute la semaine.',             100),
  q('weekly','challenge','no_late_submission',    3, '3 devoirs dans les délais','Rendre 3 devoirs avant la date limite.',                           60),
  q('weekly','challenge','peer_review',           2, '2 évaluations pairs',      'Évaluer les travaux de 2 autres apprenants.',                      50),
  q('weekly','challenge','video_watched',         3, '3 vidéos regardées',       'Regarder 3 vidéos de cours jusqu\'au bout.',                       35),
  q('weekly','challenge','flashcard_reviewed',   10, '10 flashcards',            'Réviser 10 flashcards cette semaine.',                             30),
  q('weekly','challenge','mind_map_created',      1, 'Carte mentale créée',      'Créer une carte mentale pour un cours.',                           40),
  q('weekly','challenge','summary_written',       1, 'Résumé rédigé',            'Rédiger un résumé de cours.',                                      35),
  q('weekly','challenge','group_session',         1, 'Session de groupe',        'Participer à une session d\'étude de groupe.',                     45),
  q('weekly','challenge','voice_note',            1, 'Note vocale',              'Enregistrer une note vocale pour révision.',                       20),

  // Parents hebdo
  q('weekly','parent','child_progress_check',     3, 'Suivi x3',                 'Consulter la progression de votre enfant 3 fois.',                 30, ['parent']),
  q('weekly','parent','parent_message',           1, 'Message envoyé',           'Envoyer un message à l\'équipe pédagogique.',                      20, ['parent']),

  // Mix rôles hebdo pour 120
  q('weekly','mixte','react_to_announcement',     1, 'Réaction à l\'annonce',    'Réagir à une annonce de la semaine.',                             10, ['student','teacher','parent']),
  q('weekly','mixte','complete_poll',             1, 'Sondage complété',         'Répondre à un sondage hebdomadaire.',                              15, ['student','teacher','parent']),
  q('weekly','mixte','update_status',             1, 'Statut mis à jour',        'Mettre à jour son statut ou sa disponibilité.',                    10, ['student','teacher']),
  q('weekly','mixte','read_newsletter',           1, 'Newsletter lue',           'Lire la newsletter hebdomadaire UniFlow.',                         10, ['student','teacher','parent','admin']),

  // ════════════════════════════════════════════════════════════════════════════
  // MENSUELLES (121-240)
  // ════════════════════════════════════════════════════════════════════════════

  // Assiduité mensuelle
  q('monthly','assiduite','attendance_count',   15, 'Présent(e) 15 fois',        'Assister à 15 séances ce mois.',                                  80),
  q('monthly','assiduite','attendance_count',   20, 'Présent(e) 20 fois',        'Assister à 20 séances ce mois.',                                 150),
  q('monthly','assiduite','attendance_rate',    90, 'Taux de présence 90%',      'Avoir un taux de présence ≥ 90% ce mois.',                       200),
  q('monthly','assiduite','on_time_rate',       85, 'Ponctualité 85%',           'Arriver à l\'heure dans 85% des séances ce mois.',               120),
  q('monthly','assiduite','app_open_streak',   20, 'Actif 20 jours',             'Ouvrir UniFlow au moins 20 jours ce mois.',                      100),
  q('monthly','assiduite','no_absence',          1, 'Zéro absence',              'Aucune absence non justifiée ce mois.',                          200),

  // Académique mensuel
  q('monthly','academique','assignments_submitted',8,'8 devoirs rendus',         'Rendre 8 devoirs ce mois.',                                       120),
  q('monthly','academique','assignments_on_time',  5,'5 devoirs dans les délais','Rendre 5 devoirs avant la deadline.',                             100),
  q('monthly','academique','quizzes_completed',   15,'15 quiz ce mois',          'Compléter 15 quiz ce mois.',                                      150),
  q('monthly','academique','quiz_avg_score',       80,'Moyenne quiz 80%',        'Maintenir une moyenne ≥ 80% sur tous les quiz du mois.',          180),
  q('monthly','academique','courses_completed',    2,'2 cours terminés',         'Compléter 2 cours ce mois.',                                      250),
  q('monthly','academique','study_time_minutes', 1200,'20h de révision',         'Accumuler 20h de révision ce mois.',                             200),
  q('monthly','academique','notes_created',       12,'12 notes de cours',        'Créer 12 notes de cours ce mois.',                                80),
  q('monthly','academique','perfect_assignment',   1,'Devoir parfait',           'Obtenir la note maximale sur un devoir.',                         120),
  q('monthly','academique','grade_improvement',    1,'Progression de notes',     'Améliorer sa moyenne par rapport au mois précédent.',            150),
  q('monthly','academique','all_assignments',      1,'Tous les devoirs rendus',  'Rendre tous les devoirs du mois sans exception.',                 300),

  // Social mensuel
  q('monthly','social','forum_post_count',       20,'20 messages forum',          'Publier 20 messages sur le forum ce mois.',                      100),
  q('monthly','social','forum_post_count',       50,'50 messages forum',          'Publier 50 messages sur le forum ce mois.',                      250),
  q('monthly','social','help_replies',           15,'15 aides ce mois',           'Répondre à 15 questions d\'autres apprenants.',                  150),
  q('monthly','social','resources_shared',        8,'8 ressources partagées',     'Partager 8 ressources pédagogiques ce mois.',                    120),
  q('monthly','social','new_connections',        10,'10 nouvelles connexions',    'Se connecter avec 10 nouveaux membres ce mois.',                  80),
  q('monthly','social','comments_count',         20,'20 commentaires',            'Laisser 20 commentaires sur des publications.',                   60),
  q('monthly','social','likes_received',         30,'30 likes reçus',             'Recevoir 30 likes sur ses publications ce mois.',                 80),
  q('monthly','social','events_attended',         2,'2 événements',               'Participer à 2 événements organisés par la communauté.',          60),

  // Communauté mensuelle
  q('monthly','communaute','leaderboard_points',1000,'1 000 points mensuels',    'Accumuler 1 000 points de classement ce mois.',                  200),
  q('monthly','communaute','leaderboard_points',3000,'3 000 points mensuels',    'Accumuler 3 000 points de classement ce mois.',                  500),
  q('monthly','communaute','xp_earned',          500,'500 XP ce mois',           'Gagner 500 XP ce mois.',                                         150),
  q('monthly','communaute','xp_earned',         1000,'1 000 XP ce mois',         'Gagner 1 000 XP ce mois.',                                       350),
  q('monthly','communaute','badges_earned',        3,'3 badges ce mois',         'Débloquer 3 badges ce mois.',                                    150),
  q('monthly','communaute','weekly_quests_done',   3,'3 semaines de quêtes',     'Compléter toutes les quêtes hebdo pendant 3 semaines.',           200),
  q('monthly','communaute','top10_monthly',        1,'Top 10 du mois',           'Finir dans le top 10 du classement mensuel.',                    300),
  q('monthly','communaute','top3_monthly',         1,'Podium du mois',           'Finir dans le top 3 du classement mensuel.',                     500),

  // Spécial mensuel
  q('monthly','special','best_student_month',     1,'Meilleur apprenant du mois','Être élu meilleur apprenant du mois par la communauté.',         500),
  q('monthly','special','best_teacher_month',     1,'Meilleur formateur du mois','Être élu meilleur formateur du mois.',                           500, ['teacher']),
  q('monthly','special','streak_30',              1,'Streak 30 jours',           'Maintenir un streak de connexion de 30 jours.',                  400),
  q('monthly','special','perfect_month',          1,'Mois parfait',              'Compléter toutes les quêtes mensuelles obligatoires.',           800),
  q('monthly','special','mystery_monthly',        1,'Défi mystère mensuel',      'Compléter le défi surprise du mois (annoncé le 1er).',           400),
  q('monthly','special','content_creator',        3,'Créateur de contenu x3',   'Créer 3 contenus pédagogiques originaux ce mois.',               200),
  q('monthly','special','mentor_month',           5,'5 filleuls guidés',         'Guider 5 nouveaux membres durant leur premier mois.',            250),

  // Formateurs — mensuel
  q('monthly','formateur','sessions_held',       10,'10 séances animées',        'Animer au moins 10 séances ce mois.',                            200, ['teacher']),
  q('monthly','formateur','assignments_graded',  20,'20 devoirs corrigés',       'Corriger 20 devoirs ce mois.',                                   180, ['teacher']),
  q('monthly','formateur','student_satisfaction', 4,'Note satisfaction ≥ 4/5',  'Obtenir une note de satisfaction ≥ 4/5 ce mois.',                300, ['teacher']),
  q('monthly','formateur','course_created',       1,'Nouveau cours créé',        'Créer ou mettre à jour un cours ce mois.',                       250, ['teacher']),

  // Admins — mensuel
  q('monthly','admin','active_users_growth',     10,'10 nouveaux actifs',        'Accueillir 10 nouveaux utilisateurs actifs ce mois.',             150, ['admin']),
  q('monthly','admin','reports_generated',        4,'4 rapports générés',        'Générer 4 rapports d\'activité ce mois.',                         80, ['admin']),

  // Parents — mensuel
  q('monthly','parent','monthly_review',          1,'Bilan mensuel',             'Participer au bilan mensuel de progression de votre enfant.',      60, ['parent']),
  q('monthly','parent','parent_meeting',          1,'Réunion parents',           'Assister à une réunion parents-formateurs.',                       80, ['parent']),

  // Habitudes mensuelles
  q('monthly','habitudes','morning_login',       15,'Matinal 15 jours',          'Se connecter avant 9h du matin 15 fois ce mois.',                 80),
  q('monthly','habitudes','goals_achieved',       3,'3 objectifs atteints',      'Atteindre 3 objectifs personnels ce mois.',                      150),
  q('monthly','habitudes','feedback_given',       5,'5 retours donnés',          'Laisser 5 évaluations ou retours ce mois.',                       60),

  // Supplémentaires pour atteindre 240 mensuelles
  q('monthly','challenge','speed_learner',        1,'Apprenant rapide',          'Terminer un cours en moins de 3 jours.',                         200),
  q('monthly','challenge','night_owl',            5,'Hibou x5',                  'Se connecter après 22h pendant 5 nuits ce mois.',                 50),
  q('monthly','challenge','early_bird',           5,'Lève-tôt x5',               'Se connecter avant 7h pendant 5 matins ce mois.',                 50),
  q('monthly','challenge','no_skip',              1,'Aucune séance sautée',      'Ne sauter aucune séance planifiée ce mois.',                     250),
  q('monthly','challenge','quiz_king',            1,'Roi du quiz',               'Avoir le meilleur score de quiz de sa promo ce mois.',           300),
  q('monthly','challenge','forum_thread',         2,'2 fils de discussion créés','Créer 2 fils de discussion originaux ce mois.',                   80),
  q('monthly','challenge','peer_tutor',           3,'3 tutoriels',               'Créer 3 tutoriels ou guides pour ses pairs.',                    150),
  q('monthly','challenge','consistent_10',        1,'10 semaines consécutives',  'Être actif 10 semaines consécutives (cumul).',                   350),
  q('monthly','challenge','all_categories',       1,'Toutes les catégories',     'Progresser dans toutes les catégories de cours ce mois.',        200),
  q('monthly','challenge','comeback',             1,'Retour en force',           'Revenir après une absence et compléter 3 quêtes hebdo.',          120),

  // Extra mensuelles — diversité des critères
  q('monthly','academique','flashcard_mastered', 50,'50 flashcards maîtrisées', 'Maîtriser 50 flashcards ce mois.',                                80),
  q('monthly','academique','concept_map',         2,'2 cartes conceptuelles',   'Créer 2 cartes conceptuelles ce mois.',                            60),
  q('monthly','academique','video_watched',      10,'10 vidéos regardées',       'Regarder 10 vidéos de cours ce mois.',                            70),
  q('monthly','academique','live_session',        2,'2 sessions live',           'Participer à 2 sessions en direct ce mois.',                      90),
  q('monthly','academique','exam_passed',         1,'Examen réussi',             'Réussir au moins 1 examen ce mois.',                             150),
  q('monthly','social','group_project',           1,'Projet de groupe',          'Compléter un projet de groupe ce mois.',                         120),
  q('monthly','social','study_group',             3,'3 groupes d\'étude',        'Rejoindre ou créer 3 groupes d\'étude ce mois.',                   80),
  q('monthly','social','testimonial_written',     1,'Témoignage rédigé',         'Rédiger un témoignage ou retour d\'expérience.',                   40),
  q('monthly','social','poll_created',            1,'Sondage créé',              'Créer un sondage pour la communauté ce mois.',                     50),
  q('monthly','social','event_organized',         1,'Événement organisé',        'Organiser un événement communautaire ce mois.',                  100),
  q('monthly','habitudes','goal_achieved',        2,'2 objectifs atteints',      'Atteindre 2 objectifs personnels fixés en début de mois.',       100),
  q('monthly','habitudes','week_plan',            4,'4 semaines planifiées',     'Planifier ses activités dès le début de chaque semaine.',          60),
  q('monthly','habitudes','profile_enriched',     1,'Profil enrichi',            'Ajouter une compétence ou certification au profil ce mois.',       30),
  q('monthly','habitudes','journal_entry',        4,'4 entrées de journal',      'Écrire 4 entrées de journal de bord ce mois.',                    50),
  q('monthly','habitudes','mindfulness_check',    5,'5 bilans perso',            'Faire 5 bilans personnels de progression ce mois.',               40),
  q('monthly','communaute','referral_sent',       2,'2 invitations envoyées',    'Inviter 2 personnes à rejoindre UniFlow ce mois.',                60),
  q('monthly','communaute','quest_streak_4',      1,'4 semaines de quêtes',      'Compléter les quêtes hebdo les 4 semaines du mois.',             300),
  q('monthly','communaute','level_up',            1,'Niveau supérieur',          'Monter d\'au moins 1 niveau XP ce mois.',                         80),
  q('monthly','communaute','badge_collection',    5,'5 badges ce mois',          'Débloquer 5 badges ce mois.',                                    250),
  q('monthly','special','hackathon',              1,'Hackathon du mois',         'Participer au hackathon mensuel UniFlow.',                        300),
  q('monthly','special','sprint_winner',          1,'Sprint winner',             'Terminer 1er d\'un sprint pédagogique organisé.',                 400),
  q('monthly','special','review_star',            1,'Étoile critique',           'Avoir la meilleure note de satisfaction formateur ce mois.',     300, ['teacher']),
  q('monthly','special','parent_award',           1,'Parent actif du mois',      'Être le parent le plus engagé sur la plateforme ce mois.',       200, ['parent']),
  q('monthly','special','admin_efficiency',       1,'Admin efficace',            'Réduire le temps de réponse moyen sous 2h ce mois.',             250, ['admin']),
  q('monthly','mixte','cross_platform',           3,'3 plateformes utilisées',   'Accéder à UniFlow depuis web, mobile et desktop ce mois.',        50),
  q('monthly','mixte','offline_sync',             1,'Synchro hors-ligne',        'Utiliser UniFlow hors-ligne puis synchroniser.',                   30),
  q('monthly','mixte','dark_light_switch',        2,'2 changements de thème',    'Basculer entre mode sombre et clair 2 fois.',                     10),
  q('monthly','micro','widget_used',             10,'10 widgets consultés',      'Consulter 10 widgets du tableau de bord.',                        15),
  q('monthly','micro','search_advanced',          3,'3 recherches avancées',     'Utiliser des filtres avancés dans la recherche 3 fois.',           15),
  q('monthly','micro','help_center',              2,'2 visites aide',            'Visiter le centre d\'aide 2 fois ce mois.',                       10),
  q('monthly','micro','changelog_read',           1,'Nouveautés lues',           'Lire le changelog des mises à jour du mois.',                     10),
  q('monthly','micro','feedback_submitted',       1,'Feedback soumis',           'Soumettre un feedback sur une fonctionnalité.',                   20),
  q('monthly','micro','settings_customized',      2,'2 personnalisations',       'Personnaliser 2 paramètres de l\'interface.',                     10),
  q('monthly','micro','notification_managed',     5,'5 notifs gérées',           'Gérer (lire ou archiver) 5 notifications ce mois.',               10),
  q('monthly','challenge','binge_learner',        1,'Binge learner',             'Compléter 3 modules en une seule journée.',                      150),
  q('monthly','challenge','comeback_hero',        1,'Héros du retour',           'Reprendre après 2 semaines d\'absence et rattraper son retard.', 200),
  q('monthly','challenge','leaderboard_climb',   10,'Monter de 10 places',       'Améliorer sa position au classement de 10 places ce mois.',      100),
  q('monthly','challenge','social_butterfly',     1,'Papillon social',           'Interagir avec 20 membres différents ce mois.',                  120),
  q('monthly','challenge','resource_guru',        5,'5 ressources top-likées',   'Avoir 5 ressources partagées qui reçoivent chacune ≥ 3 likes.',  150),
  q('monthly','challenge','night_session',        2,'2 sessions nocturnes',      'Compléter une session d\'étude après minuit 2 fois.',              60),
  q('monthly','challenge','weekend_warrior',      4,'4 weekends actifs',         'Être actif les 4 weekends du mois.',                              80),
  q('monthly','challenge','multilingual',         1,'Multilingue',               'Accéder à UniFlow dans une langue différente.',                   20),
  q('monthly','challenge','ultra_quiz',           1,'Ultra quiz',                'Compléter 5 quiz en moins d\'une heure avec ≥ 80% chacun.',      250),
  q('monthly','challenge','monthly_marathon',     1,'Marathon mensuel',          'Être actif chaque jour ouvrable du mois.',                        500),

  // ── Hebdomadaires supplémentaires pour atteindre 120 hebdo ──────────────
  q('weekly','academique','lesson_completed',     2,'2 leçons terminées',        'Terminer 2 leçons cette semaine.',                                25),
  q('weekly','academique','exercise_solved',      5,'5 exercices résolus',       'Résoudre 5 exercices pratiques cette semaine.',                    35),
  q('weekly','academique','revision_card',        8,'8 fiches de révision',      'Créer 8 fiches de révision cette semaine.',                        30),
  q('weekly','academique','formula_memorized',    5,'5 formules mémorisées',     'Mémoriser 5 formules ou définitions cette semaine.',               20),
  q('weekly','social','dm_sent',                  3,'3 DMs envoyés',             'Envoyer 3 messages directs à des pairs cette semaine.',            15),
  q('weekly','social','group_joined',             1,'Groupe rejoint',            'Rejoindre un groupe d\'étude cette semaine.',                      20),
  q('weekly','social','review_written',           1,'Avis rédigé',               'Rédiger un avis sur un cours ou formateur cette semaine.',         25),
  q('weekly','social','story_shared',             1,'Histoire partagée',         'Partager son expérience d\'apprentissage.',                        20),
  q('weekly','communaute','rank_check',           1,'Classement consulté',       'Consulter son classement au moins une fois cette semaine.',        10),
  q('weekly','communaute','achievement_shared',   1,'Succès partagé',            'Partager un badge ou succès sur le fil d\'actualité.',             15),
  q('weekly','micro','daily_tip',                 3,'3 astuces lues',            'Lire 3 astuces du jour dans l\'application.',                       8),
  q('weekly','micro','app_rated',                 1,'App évaluée',               'Évaluer l\'application cette semaine (1 fois/semaine max).',        5),
  q('weekly','habitudes','screen_break',          3,'3 pauses actives',          'Faire 3 pauses actives de 5 min lors de ses sessions.',            12),
  q('weekly','habitudes','hydration_log',         5,'5 check-ins hydratation',   'Logger 5 rappels hydratation/santé cette semaine.',                 8),
  q('weekly','habitudes','focus_session',         2,'2 sessions focus',          'Compléter 2 sessions focus (Pomodoro) cette semaine.',             25),
  q('weekly','challenge','duo_quiz',              1,'Quiz en duo',               'Faire un quiz en binôme avec un pair cette semaine.',              40),
  q('weekly','challenge','challenge_friend',      1,'Défier un ami',             'Inviter un ami à relever un défi de la semaine.',                  30),
  q('weekly','challenge','speed_read',            2,'2 articles lus vite',       'Lire 2 articles pédagogiques en moins de 10 min chacun.',          20),
  q('weekly','challenge','coding_challenge',      1,'Challenge code',            'Résoudre un exercice de code cette semaine.',                      45),
  q('weekly','challenge','vocabulary_10',        10,'10 nouveaux mots',          'Apprendre 10 nouveaux termes du glossaire cette semaine.',         20),
  q('weekly','challenge','mind_map_weekly',       1,'Carte mentale hebdo',       'Créer une carte mentale récapitulative de la semaine.',            30),
  q('weekly','challenge','topic_mastery',         1,'Sujet maîtrisé',            'Avoir 100% de progression sur un sujet entier.',                  80),
  q('weekly','challenge','essay_submitted',       1,'Dissertation soumise',      'Soumettre une dissertation ou rédaction longue.',                  60),
  q('weekly','formateur','quiz_created',          1,'Quiz créé',                 'Créer un quiz pour ses apprenants cette semaine.',                 50, ['teacher']),
  q('weekly','formateur','live_qna',              1,'Q&A en direct',             'Animer une session Q&A en direct cette semaine.',                  70, ['teacher']),
  q('weekly','parent','child_message',            2,'2 messages enfant',        'Envoyer 2 messages d\'encouragement à son enfant via l\'app.',     25, ['parent']),
  q('weekly','mixte','multi_session',             3,'3 sessions distinctes',    'Ouvrir l\'app lors de 3 sessions distinctes cette semaine.',        15),
  q('weekly','mixte','feature_explored',          2,'2 nouvelles fonctions',    'Explorer 2 fonctionnalités différentes de l\'app.',                 12),
  q('weekly','micro','badge_checked',             1,'Badges consultés',         'Consulter sa collection de badges cette semaine.',                   5),
  q('weekly','micro','quest_log_viewed',          3,'3 vues journal quêtes',    'Consulter son journal de quêtes 3 fois.',                            5),

  // ── Mensuelles supplémentaires pour 240 ─────────────────────────────────
  q('monthly','academique','all_quizzes_passed',  1,'Tous les quiz réussis',     'Réussir tous les quiz proposés ce mois.',                         300),
  q('monthly','academique','bonus_work',          2,'2 travaux bonus',           'Rendre 2 travaux facultatifs ce mois.',                           120),
  q('monthly','academique','tutor_session',       2,'2 sessions tutorat',        'Participer à 2 sessions de tutorat individuel.',                  100),
  q('monthly','academique','reading_marathon',    3,'3 lectures complètes',      'Lire 3 textes ou articles académiques en entier.',                 80),
  q('monthly','social','collaboration_award',     1,'Meilleure collaboration',   'Être reconnu(e) meilleur(e) collaborateur(trice) du mois.',       200),
  q('monthly','social','community_post',          5,'5 publications communauté', 'Publier 5 contenus originaux dans le fil communautaire.',         100),
  q('monthly','habitudes','sleep_schedule',       3,'3 semaines de régularité',  'Maintenir des horaires de connexion réguliers 3 semaines.',        80),
  q('monthly','habitudes','reading_habit',        8,'8 lectures',                'Lire 8 contenus éducatifs dans l\'app ce mois.',                   60),
  q('monthly','communaute','invite_accepted',     3,'3 invitations acceptées',   'Voir 3 de ses invitations UniFlow acceptées ce mois.',             90),
  q('monthly','challenge','improvement_week',     2,'2 semaines d\'amélioration','Améliorer son score hebdo 2 fois consécutives.',                  150),
  q('monthly','challenge','all_lessons',          1,'Toutes les leçons du mois', 'Compléter 100% des leçons planifiées ce mois.',                   400),
  q('monthly','special','student_spotlight',      1,'Étudiant à la une',         'Être mis en avant sur la page d\'accueil UniFlow.',               350),
  q('monthly','mixte','cross_device',             3,'3 appareils différents',    'Se connecter depuis 3 appareils distincts ce mois.',               30),
  q('monthly','micro','onboarding_helper',        1,'Guide d\'accueil',          'Aider un nouveau membre à faire ses premiers pas.',                50),
  q('monthly','micro','bug_report',               1,'Rapport de bug',            'Signaler un bug ou problème via l\'app ce mois.',                  30),

  // ════════════════════════════════════════════════════════════════════════════
  // ANNUELLES (241-300)
  // ════════════════════════════════════════════════════════════════════════════

  // Assiduité annuelle
  q('annual','assiduite','attendance_count',    150,'150 présences cette année',  'Assister à 150 séances dans l\'année.',                          500),
  q('annual','assiduite','attendance_rate',      95,'Taux de présence 95%',       'Avoir un taux de présence ≥ 95% sur l\'année.',                  800),
  q('annual','assiduite','app_open_streak',     180,'Actif 180 jours',            'Ouvrir UniFlow au moins 180 jours dans l\'année.',               600),
  q('annual','assiduite','on_time_rate',         90,'Ponctualité 90% annuelle',   'Arriver à l\'heure dans 90% des séances de l\'année.',           700),

  // Académique annuel
  q('annual','academique','courses_completed',   10,'10 cours terminés',          'Compléter 10 cours dans l\'année.',                              800),
  q('annual','academique','courses_completed',   20,'20 cours terminés',          'Compléter 20 cours dans l\'année.',                             1500),
  q('annual','academique','quizzes_completed',  100,'100 quiz dans l\'année',     'Compléter 100 quiz dans l\'année.',                              600),
  q('annual','academique','quiz_perfect',        10,'10 quiz parfaits',           'Obtenir 100% à 10 quiz dans l\'année.',                          800),
  q('annual','academique','assignments_submitted',50,'50 devoirs rendus',         'Rendre 50 devoirs dans l\'année.',                               700),
  q('annual','academique','study_time_minutes',10000,'167h de révision',          'Accumuler 167h de révision dans l\'année.',                     1000),
  q('annual','academique','gpa_annual',           14,'Moyenne annuelle ≥ 14/20', 'Maintenir une moyenne générale ≥ 14/20 sur l\'année.',          1200),
  q('annual','academique','certifications_earned', 3,'3 certifications obtenues','Obtenir 3 certifications UniFlow dans l\'année.',               1000),
  q('annual','academique','program_completed',     1,'Parcours complet',          'Terminer l\'intégralité du parcours de formation.',              2000),

  // Social annuel
  q('annual','social','forum_post_count',       200,'200 messages forum',         'Publier 200 messages sur le forum dans l\'année.',               600),
  q('annual','social','help_replies',           100,'100 aides données',          'Répondre à 100 questions d\'autres apprenants.',                  800),
  q('annual','social','resources_shared',        50,'50 ressources partagées',    'Partager 50 ressources pédagogiques dans l\'année.',              600),
  q('annual','social','connections_made',        50,'50 connexions établies',     'Se connecter avec 50 membres dans l\'année.',                    400),
  q('annual','social','likes_received',         500,'500 likes reçus',            'Recevoir 500 likes sur ses publications.',                        700),

  // Communauté annuelle
  q('annual','communaute','leaderboard_points',20000,'20 000 points annuels',    'Accumuler 20 000 points dans l\'année.',                         1500),
  q('annual','communaute','xp_earned',          5000,'5 000 XP cette année',     'Gagner 5 000 XP cette année.',                                   800),
  q('annual','communaute','badges_earned',        20,'20 badges dans l\'année',  'Débloquer 20 badges dans l\'année.',                              600),
  q('annual','communaute','monthly_quests_done',   9,'9 mois de quêtes',         'Compléter les quêtes mensuelles pendant 9 mois.',                 800),
  q('annual','communaute','weekly_quests_done',   40,'40 semaines de quêtes',    'Compléter les quêtes hebdo pendant 40 semaines.',               1000),
  q('annual','communaute','top3_annual',           1,'Podium annuel',             'Finir dans le top 3 du classement annuel.',                      2000),
  q('annual','communaute','number_one_annual',     1,'#1 de l\'année',            'Être numéro 1 du classement annuel.',                           3000),

  // Spécial annuel
  q('annual','special','perfect_year',             1,'Année parfaite',            'Compléter toutes les quêtes annuelles obligatoires.',            5000),
  q('annual','special','all_badges',               1,'Collectionneur ultime',     'Débloquer les 100 badges dans l\'année.',                       5000),
  q('annual','special','year_streak',              1,'Streak 365 jours',          'Maintenir un streak de connexion de 365 jours.',               3000),
  q('annual','special','champion_annuel',          1,'Champion Annuel UniFlow',   'Être désigné Champion Annuel UniFlow (all-round).',             5000),
  q('annual','special','best_teacher_year',        1,'Meilleur formateur de l\'année','Être élu meilleur formateur de l\'année.',                 3000, ['teacher']),
  q('annual','special','mystery_annual',           1,'Grand Défi Annuel',         'Relever le Grand Défi Annuel UniFlow (annoncé le 1er janvier).', 2000),

  // Formateurs annuels
  q('annual','formateur','sessions_held',        100,'100 séances animées',       'Animer 100 séances dans l\'année.',                             1500, ['teacher']),
  q('annual','formateur','students_graduated',    10,'10 apprenants diplômés',   'Accompagner 10 apprenants jusqu\'à leur diplôme.',              2000, ['teacher']),
  q('annual','formateur','course_created',         5,'5 cours créés',             'Créer ou mettre à jour 5 cours dans l\'année.',                 1200, ['teacher']),

  // Admins annuels
  q('annual','admin','platform_growth',          100,'100 nouveaux actifs',       'Accueillir 100 nouveaux utilisateurs actifs dans l\'année.',     800, ['admin']),
  q('annual','admin','zero_incidents',             1,'Zéro incident critique',    'Passer l\'année sans incident critique sur la plateforme.',     1000, ['admin']),

  // ── Annuelles supplémentaires ────────────────────────────────────────────
  q('annual','academique','notes_annual',        100,'100 notes de cours',        'Créer 100 notes de cours dans l\'année.',                         600),
  q('annual','academique','quiz_streak_annual',   30,'Streak quiz 30 jours',      'Compléter au moins 1 quiz chaque jour pendant 30 jours cumulés.', 700),
  q('annual','academique','avg_above_12',          1,'Moyenne annuelle ≥ 12/20', 'Maintenir une moyenne ≥ 12/20 toute l\'année.',                   800),
  q('annual','academique','all_modules',           1,'Tous les modules',          'Terminer tous les modules de son parcours annuel.',              1500),
  q('annual','academique','flashcard_master',    200,'200 flashcards maîtrisées', 'Maîtriser 200 flashcards dans l\'année.',                         500),
  q('annual','academique','video_library',        50,'50 vidéos regardées',       'Regarder 50 vidéos de cours dans l\'année.',                      400),
  q('annual','social','mega_helper',             200,'200 aides données',         'Répondre à 200 questions de la communauté dans l\'année.',       1000),
  q('annual','social','content_king',             30,'30 ressources partagées',   'Partager 30 ressources pédagogiques originales dans l\'année.',   600),
  q('annual','social','mega_network',            100,'100 connexions',            'Établir 100 connexions dans l\'année.',                           700),
  q('annual','social','forum_legend',            500,'500 messages forum',        'Publier 500 messages sur le forum dans l\'année.',               1200),
  q('annual','communaute','quest_finisher',        1,'Toutes les quêtes',         'Compléter les 300 quêtes disponibles dans l\'année.',            3000),
  q('annual','communaute','consistent_annual',    48,'48 semaines actives',       'Être actif au moins 48 semaines dans l\'année.',                  800),
  q('annual','communaute','top10_annual',          1,'Top 10 annuel',             'Finir dans le top 10 du classement annuel.',                     1500),
  q('annual','communaute','badges_50',            50,'50 badges collectés',       'Débloquer 50 badges dans l\'année.',                             1000),
  q('annual','communaute','xp_2000',            2000,'2 000 XP en un an',         'Accumuler 2 000 XP dans l\'année (palier intermédiaire).',        500),
  q('annual','habitudes','annual_streak',         90,'Streak 90 jours',           'Maintenir un streak de connexion de 90 jours cumulés.',           600),
  q('annual','habitudes','goals_annual',          12,'12 objectifs atteints',     'Atteindre 12 objectifs personnels dans l\'année (1/mois).',       700),
  q('annual','habitudes','reflection_journal',   12,'12 journaux mensuels',       'Rédiger 12 entrées de journal de bord (1 par mois).',             400),
  q('annual','habitudes','healthy_balance',        1,'Équilibre sain',            'Maintenir un ratio étude/social équilibré toute l\'année.',       500),
  q('annual','special','annual_hackathon',         1,'Hackathon annuel',          'Participer au grand hackathon annuel UniFlow.',                  1000),
  q('annual','special','showcase',                1,'Showcase annuel',            'Présenter un projet lors du showcase annuel UniFlow.',            800),
  q('annual','special','media_feature',           1,'Mis à la une',               'Être mis à la une sur les réseaux de KERNEL FORGE.',             1500),
  q('annual','special','ambassador',              3,'3 filleuls actifs',          'Parrainer 3 membres qui restent actifs plus de 3 mois.',          600),
  q('annual','special','impact_award',             1,'Prix Impact UniFlow',       'Recevoir le Prix Impact décerné annuellement par le jury.',      5000),
  q('annual','formateur','student_of_year',        1,'Apprenant de l\'année formé','Avoir formé l\'apprenant de l\'année.',                         2500, ['teacher']),
  q('annual','formateur','innovation_award',       1,'Prix Innovation pédago',    'Recevoir le Prix Innovation Pédagogique annuel.',                3000, ['teacher']),
  q('annual','admin','community_award',            1,'Prix Communauté',           'Recevoir le Prix Communauté de l\'année.',                       2000, ['admin']),
  q('annual','parent','family_award',              1,'Famille engagée',           'Être reconnu(e) famille la plus engagée sur UniFlow.',           1000, ['parent']),
  q('annual','challenge','annual_quiz_champion',   1,'Champion quiz annuel',      'Avoir la meilleure moyenne de quiz de toute la plateforme.',     2500),
  q('annual','challenge','triple_crown',           1,'Triple couronne',           'Gagner les classements hebdo, mensuel et annuel la même année.', 5000),
  q('annual','challenge','early_graduate',         1,'Diplômé(e) précoce',        'Terminer son parcours avant la date prévue.',                   2000),
  q('annual','challenge','comeback_year',          1,'Retour triomphal',          'Passer de bottom 50% à top 10% dans l\'année.',                 1500),
  q('annual','challenge','full_commitment',        1,'Engagement total',          'Ne manquer aucune séance obligatoire de toute l\'année.',       2000),
  q('annual','mixte','platform_marathon',          1,'Marathon plateforme',       'Utiliser les 3 versions (web, mobile, desktop) régulièrement.',  300),
  q('annual','mixte','feedback_champion',          5,'5 feedbacks transformants', 'Soumettre 5 feedbacks qui ont été implémentés.',                  800),
  q('annual','micro','annual_check',               1,'Bilan annuel complet',      'Compléter le bilan annuel de progression.',                       50),
  q('annual','special','unflow_legend',            1,'Légende UniFlow',           'Être nommé(e) Légende UniFlow (jury + communauté).',            10000),
  q('annual','special','five_year_plan',           1,'Plan 5 ans',                'Définir et partager son plan d\'apprentissage sur 5 ans.',        200),
  q('annual','special','inspire_100',            100,'100 personnes inspirées',   'Avoir inspiré 100 membres à rejoindre ou progresser sur UniFlow.',1500),
  q('annual','communaute','all_weekly_done',      52,'52 semaines de quêtes',     'Compléter les quêtes hebdo chaque semaine de l\'année entière.', 2000),
  q('annual','communaute','all_monthly_done',     12,'12 mois de quêtes',         'Compléter les quêtes mensuelles chaque mois de l\'année.',       1500),
  q('annual','special','ultimate_quest',           1,'Quête Ultime',              'Compléter la Quête Ultime secrète — débloquée en fin d\'année.', 9999),
]

// ─── Vérification ────────────────────────────────────────────────────────────

console.log(`Total quêtes à seeder : ${quests.length}`)
if (quests.length !== 300) {
  console.warn(`⚠️  Attendu 300, trouvé ${quests.length} — vérifier le fichier.`)
}

// ─── Exécution ───────────────────────────────────────────────────────────────

async function run() {
  let created = 0
  let failed  = 0
  for (const quest of quests) {
    try {
      await db.createDocument(DATABASE_ID, COLLECTION_ID, ID.unique(), quest)
      console.log(`✅ [${quest.sortOrder}] ${quest.period.toUpperCase()} — ${quest.title}`)
      created++
    } catch (e) {
      console.error(`❌ [${quest.sortOrder}] ${quest.title}: ${e.message}`)
      failed++
    }
  }
  console.log(`\nRésultat : ${created} créés, ${failed} erreurs sur ${quests.length} quêtes.`)
}

run()
