/**
 * Seed — badges 1 à 34 : assiduité (bronze→diamond) et académique (bronze→diamond).
 * Appeler avec : node scripts/seed-badges-part1.mjs
 */
import { createClient, databaseId, endpoint, projectId, requireConfig } from './appwrite-env.mjs'

requireConfig()
const request = createClient()
const DATABASE_ID = databaseId
const COLLECTION_ID = 'badges_catalog'

const badges = [
  // ── ASSIDUITÉ ─────────────────────────────────────────────────────────────
  {
    name: 'Premier pas',
    description: 'Assister à sa première séance.',
    unlockedMessage: 'Tu étais là dès le début — c\'est ce qui compte.',
    category: 'assiduite', rarity: 'common', level: 'bronze',
    imageFileId: 'badge_premier_pas',
    criteria: JSON.stringify({ type: 'attendance_count', threshold: 1 }),
    xpReward: 10, isLimited: false, sortOrder: 1,
  },
  {
    name: 'Assidu',
    description: 'Être présent à 90 % des séances (min. 5).',
    unlockedMessage: 'Présent à 90 % — une assiduité exemplaire.',
    category: 'assiduite', rarity: 'rare', level: 'silver',
    imageFileId: 'badge_assidu',
    criteria: JSON.stringify({ type: 'attendance_rate', threshold: 0.9, min_sessions: 5 }),
    xpReward: 50, isLimited: false, sortOrder: 2,
  },
  {
    name: 'Ponctuel',
    description: 'Arriver à l\'heure à 10 séances d\'affilée.',
    unlockedMessage: 'Dix séances à l\'heure — sans exception.',
    category: 'assiduite', rarity: 'rare', level: 'silver',
    imageFileId: 'badge_ponctuel',
    criteria: JSON.stringify({ type: 'on_time_streak', threshold: 10 }),
    xpReward: 50, isLimited: false, sortOrder: 3,
  },
  {
    name: 'Irréprochable',
    description: 'Zéro absence injustifiée sur un mois complet.',
    unlockedMessage: 'Un mois sans absence — un sans-faute.',
    category: 'assiduite', rarity: 'epic', level: 'gold',
    imageFileId: 'badge_irreprochable',
    criteria: JSON.stringify({ type: 'zero_unexcused', period: 'month' }),
    xpReward: 100, isLimited: false, sortOrder: 4,
  },
  {
    name: 'Pilier',
    description: 'Présent à 95 % des séances sur un semestre (min. 30).',
    unlockedMessage: 'Le pilier de la promo — toujours là.',
    category: 'assiduite', rarity: 'epic', level: 'gold',
    imageFileId: 'badge_pilier',
    criteria: JSON.stringify({ type: 'attendance_rate', threshold: 0.95, min_sessions: 30 }),
    xpReward: 150, isLimited: false, sortOrder: 5,
  },
  {
    name: 'Légende de la présence',
    description: 'Présent à 100 % sur toute l\'année universitaire.',
    unlockedMessage: 'Présent à chaque séance de l\'année — une légende.',
    category: 'assiduite', rarity: 'legendary', level: 'diamond',
    imageFileId: 'badge_legende_presence',
    criteria: JSON.stringify({ type: 'attendance_rate', threshold: 1.0, min_sessions: 60, period: 'year' }),
    xpReward: 500, isLimited: false, sortOrder: 6,
  },
  {
    name: 'Matinal',
    description: 'Arriver avant 7h30 à 5 séances.',
    unlockedMessage: 'Cinq matins de bonne heure — le soleil te connaît.',
    category: 'assiduite', rarity: 'common', level: 'bronze',
    imageFileId: 'badge_matinal',
    criteria: JSON.stringify({ type: 'early_arrival', hour_before: 7, minutes_before: 30, count: 5 }),
    xpReward: 20, isLimited: false, sortOrder: 7,
  },
  {
    name: 'Meilleur assidu de la semaine',
    description: 'Avoir le meilleur taux de présence de la promo cette semaine.',
    unlockedMessage: 'Meilleur assidu de la semaine — bravo !',
    category: 'communaute', rarity: 'rare', level: 'silver',
    imageFileId: 'badge_best_assidu_week',
    criteria: JSON.stringify({ type: 'rank_top', metric: 'attendance', period: 'week', rank: 1 }),
    xpReward: 60, isLimited: false, sortOrder: 8,
  },
  {
    name: 'Meilleur assidu du mois',
    description: 'Avoir le meilleur taux de présence de la promo ce mois.',
    unlockedMessage: 'Meilleur assidu du mois — le podium t\'appartient.',
    category: 'communaute', rarity: 'epic', level: 'gold',
    imageFileId: 'badge_best_assidu_month',
    criteria: JSON.stringify({ type: 'rank_top', metric: 'attendance', period: 'month', rank: 1 }),
    xpReward: 120, isLimited: false, sortOrder: 9,
  },
  // ── ACADÉMIQUE ────────────────────────────────────────────────────────────
  {
    name: 'Premier devoir',
    description: 'Rendre son premier devoir.',
    unlockedMessage: 'Premier devoir rendu — la suite est lancée.',
    category: 'academique', rarity: 'common', level: 'bronze',
    imageFileId: 'badge_premier_devoir',
    criteria: JSON.stringify({ type: 'submission_count', threshold: 1 }),
    xpReward: 10, isLimited: false, sortOrder: 10,
  },
  {
    name: 'Travailleur',
    description: 'Rendre 10 devoirs.',
    unlockedMessage: 'Dix devoirs rendus — une belle régularité.',
    category: 'academique', rarity: 'common', level: 'bronze',
    imageFileId: 'badge_travailleur',
    criteria: JSON.stringify({ type: 'submission_count', threshold: 10 }),
    xpReward: 20, isLimited: false, sortOrder: 11,
  },
  {
    name: 'Dans les délais',
    description: 'Rendre 3 devoirs avant la date limite.',
    unlockedMessage: 'Trois devoirs dans les délais — sans retard.',
    category: 'academique', rarity: 'common', level: 'bronze',
    imageFileId: 'badge_delais',
    criteria: JSON.stringify({ type: 'on_time_submissions', threshold: 3 }),
    xpReward: 30, isLimited: false, sortOrder: 12,
  },
  {
    name: 'Major',
    description: 'Obtenir une moyenne pondérée ≥ 14/20 sur au moins 3 notes.',
    unlockedMessage: 'Moyenne de 14/20 ou plus — un parcours d\'excellence.',
    category: 'academique', rarity: 'rare', level: 'silver',
    imageFileId: 'badge_major',
    criteria: JSON.stringify({ type: 'weighted_average', threshold: 14, min_grades: 3 }),
    xpReward: 80, isLimited: false, sortOrder: 13,
  },
  {
    name: 'Sans faute',
    description: 'Réussir un quiz avec la note maximale.',
    unlockedMessage: 'Un quiz à 100 % — un sans-faute.',
    category: 'academique', rarity: 'rare', level: 'silver',
    imageFileId: 'badge_sans_faute',
    criteria: JSON.stringify({ type: 'perfect_quiz', count: 1 }),
    xpReward: 60, isLimited: false, sortOrder: 14,
  },
  {
    name: 'Perfectionniste',
    description: 'Réussir 5 quiz à 100 %.',
    unlockedMessage: 'Cinq quiz parfaits — le perfectionnisme te définit.',
    category: 'academique', rarity: 'epic', level: 'gold',
    imageFileId: 'badge_perfectionniste',
    criteria: JSON.stringify({ type: 'perfect_quiz', count: 5 }),
    xpReward: 150, isLimited: false, sortOrder: 15,
  },
  {
    name: 'Série de devoirs',
    description: 'Rendre 5 devoirs d\'affilée avant la date limite.',
    unlockedMessage: 'Cinq devoirs dans les délais d\'affilée — une série !',
    category: 'academique', rarity: 'rare', level: 'silver',
    imageFileId: 'badge_serie_devoirs',
    criteria: JSON.stringify({ type: 'on_time_streak', category: 'assignment', threshold: 5 }),
    xpReward: 70, isLimited: false, sortOrder: 16,
  },
  {
    name: 'Mention Bien',
    description: 'Atteindre une moyenne ≥ 12/20 sur un semestre.',
    unlockedMessage: 'Mention Bien — un semestre solide.',
    category: 'academique', rarity: 'rare', level: 'silver',
    imageFileId: 'badge_mention_bien',
    criteria: JSON.stringify({ type: 'semester_average', threshold: 12 }),
    xpReward: 90, isLimited: false, sortOrder: 17,
  },
  {
    name: 'Mention Très Bien',
    description: 'Atteindre une moyenne ≥ 16/20 sur un semestre.',
    unlockedMessage: 'Mention Très Bien — un semestre d\'exception.',
    category: 'academique', rarity: 'epic', level: 'gold',
    imageFileId: 'badge_mention_tres_bien',
    criteria: JSON.stringify({ type: 'semester_average', threshold: 16 }),
    xpReward: 200, isLimited: false, sortOrder: 18,
  },
  {
    name: 'Académicien',
    description: 'Obtenir 20/20 sur une évaluation.',
    unlockedMessage: 'Un 20/20 — la perfection académique.',
    category: 'academique', rarity: 'epic', level: 'gold',
    imageFileId: 'badge_academicien',
    criteria: JSON.stringify({ type: 'max_score', count: 1 }),
    xpReward: 100, isLimited: false, sortOrder: 19,
  },
  {
    name: 'Omniscient',
    description: 'Obtenir 20/20 sur 3 évaluations différentes.',
    unlockedMessage: 'Trois 20/20 — rien ne t\'échappe.',
    category: 'academique', rarity: 'legendary', level: 'diamond',
    imageFileId: 'badge_omniscient',
    criteria: JSON.stringify({ type: 'max_score', count: 3 }),
    xpReward: 400, isLimited: false, sortOrder: 20,
  },
  {
    name: 'Régulier',
    description: 'Rendre tous les devoirs d\'une UE.',
    unlockedMessage: 'Tous les devoirs de l\'UE rendus — régularité exemplaire.',
    category: 'academique', rarity: 'rare', level: 'silver',
    imageFileId: 'badge_regulier',
    criteria: JSON.stringify({ type: 'all_submissions_for_ue' }),
    xpReward: 70, isLimited: false, sortOrder: 21,
  },
  {
    name: 'Meilleur de la semaine',
    description: 'Avoir la meilleure note de la promo cette semaine.',
    unlockedMessage: 'Meilleure note de la semaine — le podium est à toi.',
    category: 'communaute', rarity: 'rare', level: 'silver',
    imageFileId: 'badge_best_grade_week',
    criteria: JSON.stringify({ type: 'rank_top', metric: 'grades', period: 'week', rank: 1 }),
    xpReward: 60, isLimited: false, sortOrder: 22,
  },
  {
    name: 'Meilleur du mois',
    description: 'Avoir la meilleure moyenne de la promo ce mois.',
    unlockedMessage: 'Meilleure moyenne du mois — un mois d\'excellence.',
    category: 'communaute', rarity: 'epic', level: 'gold',
    imageFileId: 'badge_best_grade_month',
    criteria: JSON.stringify({ type: 'rank_top', metric: 'grades', period: 'month', rank: 1 }),
    xpReward: 120, isLimited: false, sortOrder: 23,
  },
  {
    name: 'Top 3 de la promo',
    description: 'Figurer dans le top 3 du classement mensuel.',
    unlockedMessage: 'Top 3 de la promo ce mois — bravo !',
    category: 'communaute', rarity: 'epic', level: 'gold',
    imageFileId: 'badge_top3_promo',
    criteria: JSON.stringify({ type: 'rank_top', metric: 'xp', period: 'month', rank: 3 }),
    xpReward: 100, isLimited: false, sortOrder: 24,
  },
  {
    name: 'Top 3 de l\'année',
    description: 'Figurer dans le top 3 du classement annuel.',
    unlockedMessage: 'Top 3 de la promo cette année — une saison dorée.',
    category: 'communaute', rarity: 'legendary', level: 'diamond',
    imageFileId: 'badge_top3_annuel',
    criteria: JSON.stringify({ type: 'rank_top', metric: 'xp', period: 'year', rank: 3 }),
    xpReward: 500, isLimited: false, sortOrder: 25,
  },
  {
    name: 'Rendu express',
    description: 'Rendre un devoir plus de 24h avant la date limite.',
    unlockedMessage: 'Rendu 24h à l\'avance — l\'organisation, c\'est toi.',
    category: 'academique', rarity: 'common', level: 'bronze',
    imageFileId: 'badge_rendu_express',
    criteria: JSON.stringify({ type: 'early_submission', hours_before: 24 }),
    xpReward: 15, isLimited: false, sortOrder: 26,
  },
  {
    name: 'Champion du quiz',
    description: 'Réussir 10 quiz avec une note ≥ 80 %.',
    unlockedMessage: 'Dix quiz réussis à 80 % — le champion des quiz.',
    category: 'academique', rarity: 'epic', level: 'gold',
    imageFileId: 'badge_champion_quiz',
    criteria: JSON.stringify({ type: 'quiz_score', threshold: 0.8, count: 10 }),
    xpReward: 180, isLimited: false, sortOrder: 27,
  },
  {
    name: 'Autodidacte',
    description: 'Consulter 20 ressources de bibliothèque.',
    unlockedMessage: 'Vingt ressources consultées — l\'apprentissage ne s\'arrête jamais.',
    category: 'academique', rarity: 'rare', level: 'silver',
    imageFileId: 'badge_autodidacte',
    criteria: JSON.stringify({ type: 'library_views', threshold: 20 }),
    xpReward: 60, isLimited: false, sortOrder: 28,
  },
  {
    name: 'Bibliophile',
    description: 'Consulter 100 ressources de bibliothèque.',
    unlockedMessage: 'Cent ressources consultées — un vrai bibliophile.',
    category: 'academique', rarity: 'epic', level: 'gold',
    imageFileId: 'badge_bibliophile',
    criteria: JSON.stringify({ type: 'library_views', threshold: 100 }),
    xpReward: 150, isLimited: false, sortOrder: 29,
  },
  {
    name: 'Premier quiz',
    description: 'Compléter son premier quiz.',
    unlockedMessage: 'Premier quiz complété — le jeu commence.',
    category: 'academique', rarity: 'common', level: 'bronze',
    imageFileId: 'badge_premier_quiz',
    criteria: JSON.stringify({ type: 'quiz_completed', threshold: 1 }),
    xpReward: 10, isLimited: false, sortOrder: 30,
  },
  {
    name: 'Infatigable',
    description: 'Rendre 50 devoirs au total.',
    unlockedMessage: 'Cinquante devoirs rendus — infatigable.',
    category: 'academique', rarity: 'epic', level: 'gold',
    imageFileId: 'badge_infatigable',
    criteria: JSON.stringify({ type: 'submission_count', threshold: 50 }),
    xpReward: 200, isLimited: false, sortOrder: 31,
  },
  {
    name: 'Légende académique',
    description: 'Maintenir une moyenne ≥ 16/20 sur toute l\'année.',
    unlockedMessage: 'Moyenne ≥ 16/20 sur toute l\'année — une légende.',
    category: 'academique', rarity: 'legendary', level: 'diamond',
    imageFileId: 'badge_legende_academique',
    criteria: JSON.stringify({ type: 'year_average', threshold: 16 }),
    xpReward: 600, isLimited: false, sortOrder: 32,
  },
  {
    name: 'Montée en puissance',
    description: 'Améliorer sa moyenne de 3 points entre deux semestres.',
    unlockedMessage: 'Trois points de mieux — la montée en puissance.',
    category: 'academique', rarity: 'rare', level: 'silver',
    imageFileId: 'badge_montee_puissance',
    criteria: JSON.stringify({ type: 'average_improvement', delta: 3 }),
    xpReward: 80, isLimited: false, sortOrder: 33,
  },
  {
    name: 'Comeback',
    description: 'Passer d\'une moyenne < 10 à ≥ 12 au semestre suivant.',
    unlockedMessage: 'De < 10 à ≥ 12 — le comeback de l\'année.',
    category: 'academique', rarity: 'epic', level: 'gold',
    imageFileId: 'badge_comeback',
    criteria: JSON.stringify({ type: 'average_improvement', from_below: 10, to_above: 12 }),
    xpReward: 150, isLimited: false, sortOrder: 34,
  },
]

async function seed() {
  let created = 0
  for (const badge of badges) {
    const documentId = `badge_${String(badge.sortOrder).padStart(3, '0')}`
    try {
      const res = await request('POST', `/databases/${DATABASE_ID}/collections/${COLLECTION_ID}/documents`, {
        documentId,
        data: badge,
        permissions: ['read("users")'],
      })
      if (res.status === 201 || res.status === 200) {
        created++
        process.stdout.write(`  ✓ ${badge.name}\n`)
      } else if (res.status === 409) {
        created++
        process.stdout.write(`  = ${badge.name} (existant)\n`)
      }
    } catch (e) {
      process.stderr.write(`  ✗ ${badge.name}: ${e.message}\n`)
    }
  }
  console.log(`\nPart 1 : ${created}/${badges.length} badges traités.`)
}

seed()
