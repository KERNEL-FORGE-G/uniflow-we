/**
 * Seed — 500 quêtes dynamiques UniFlow pour Appwrite self-hosted.
 * 200 journalières, 180 mensuelles, 120 annuelles.
 *
 * Utilise createClient depuis appwrite-env.mjs (zéro dépendance externe).
 */
import { createClient, databaseId, requireConfig } from './appwrite-env.mjs'
import { ALL_QUESTS_500 } from '../src/data/questsCatalog500.ts'

requireConfig()
const request = createClient()
const DATABASE_ID = databaseId
const COLLECTION_ID = 'quests_catalog'

const categoryMap = {
  "study": "academique",
  "productivity": "progression",
  "academic": "academique",
  "engagement": "social",
  "community": "communaute",
  "resources": "academique",
  "wellness": "progression",
  "assiduity": "assiduite",
  "presence": "assiduite",
  "information": "communaute",
  "learning": "academique",
  "punctuality": "assiduite",
  "organization": "progression",
  "assessment": "academique",
  "reflection": "progression",
  "social": "social",
  "planning": "progression",
  "focus": "progression",
  "memory": "academique",
  "teamwork": "communaute",
  "research": "academique",
  "excellence": "academique",
  "mentorship": "communaute",
  "milestone": "progression",
  "review": "academique",
  "exam_prep": "academique",
  "diligence": "assiduite",
  "tracking": "progression",
  "skills": "academique",
  "growth": "progression",
  "honors": "academique",
  "attendance": "assiduite",
  "curriculum": "academique",
  "streak": "progression",
  "perfect_record": "assiduite",
  "innovation": "academique",
  "library": "academique"
}
function normalizeCategory(cat) {
  return categoryMap[cat] || (['assiduite', 'academique', 'social', 'special', 'communaute', 'progression', 'admin', 'famille'].includes(cat) ? cat : 'progression')
}

async function seed() {
  console.log(`Seeding ${ALL_QUESTS_500.length} quêtes dans Appwrite self-hosted...`)
  let created = 0
  let existing = 0
  let failed = 0

  for (let i = 0; i < ALL_QUESTS_500.length; i++) {
    const q = ALL_QUESTS_500[i]
    const docData = {
      sortOrder: i + 1,
      period: q.period,
      category: normalizeCategory(q.category),
      criteriaType: q.criteriaType || 'general',
      targetValue: Math.round(Number(q.targetValue) || 1),
      title: q.title,
      description: q.description,
      xpReward: Math.round(Number(q.xpReward) || 20),
      targetRoles: '["student", "delegate"]',
      isActive: true,
      iconName: q.iconName || 'trophy',
      colorHex: q.colorHex || '#6366F1',
    }

    try {
      const res = await request('POST', `/databases/${DATABASE_ID}/collections/${COLLECTION_ID}/documents`, {
        documentId: q.id,
        data: docData,
        permissions: ['read("users")'],
      })
      if (res.status === 201 || res.status === 200) {
        created++
        if (created % 50 === 0) console.log(`  [${created}/${ALL_QUESTS_500.length}] quêtes créées...`)
      } else if (res.status === 409) {
        existing++
      }
    } catch (e) {
      failed++
      console.error(`Erreur sur ${q.id}: ${e.message}`)
    }
  }

  console.log(`\nBilan 500 quêtes : ${created} créées, ${existing} existantes, ${failed} erreurs sur ${ALL_QUESTS_500.length} totales.`)
}

seed()
