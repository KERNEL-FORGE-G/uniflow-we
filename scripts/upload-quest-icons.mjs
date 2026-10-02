/**
 * upload-quest-icons.mjs
 *
 * Génère des icônes SVG pour les types de quêtes UniFlow et les uploade
 * dans le bucket Appwrite (uniflow_assets) avec le préfixe "quests/".
 *
 * Format fileId : "quest_<criteriaType>" (ex: "quest_attendance_count")
 *
 * Usage :
 *   node scripts/upload-quest-icons.mjs
 */

import { Client, Storage, InputFile } from 'node-appwrite'
import dotenv from 'dotenv'
dotenv.config()

const client = new Client()
  .setEndpoint(process.env.APPWRITE_ENDPOINT)
  .setProject(process.env.APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY)

const storage = new Storage(client)
const BUCKET_ID = process.env.APPWRITE_STORAGE_BUCKET_ID || 'uniflow_assets'

// ─── Mapping criteriaType → icône + couleur ───────────────────────────────────

const QUEST_ICONS = {
  // Assiduité
  attendance_count:     { emoji: '📅', color: '#3B82F6', label: 'Présence' },
  on_time_arrivals:     { emoji: '⏰', color: '#6366F1', label: 'Ponctualité' },
  app_open_streak:      { emoji: '🔥', color: '#EF4444', label: 'Série' },
  attendance_rate:      { emoji: '📊', color: '#8B5CF6', label: 'Taux présence' },
  no_absence:           { emoji: '✅', color: '#10B981', label: 'Sans absence' },
  morning_login:        { emoji: '🌅', color: '#F59E0B', label: 'Connexion matin' },
  // Académique
  assignments_submitted:{ emoji: '📝', color: '#0D9488', label: 'Devoirs' },
  quizzes_completed:    { emoji: '❓', color: '#7C3AED', label: 'Quiz' },
  quiz_avg_score:       { emoji: '🎯', color: '#059669', label: 'Score quiz' },
  study_time_minutes:   { emoji: '⏱️', color: '#2563EB', label: 'Temps étude' },
  notes_created:        { emoji: '📓', color: '#0891B2', label: 'Notes' },
  courses_progress:     { emoji: '📈', color: '#16A34A', label: 'Progression' },
  courses_completed:    { emoji: '✔️', color: '#15803D', label: 'Cours terminé' },
  quiz_perfect:         { emoji: '💯', color: '#DC2626', label: 'Quiz parfait' },
  quiz_streak:          { emoji: '⚡', color: '#F97316', label: 'Série quiz' },
  exam_passed:          { emoji: '🎓', color: '#1D4ED8', label: 'Examen' },
  avg_above_12:         { emoji: '📏', color: '#065F46', label: 'Moyenne' },
  // Social
  forum_post_count:     { emoji: '💬', color: '#EC4899', label: 'Posts forum' },
  dm_sent:              { emoji: '✉️', color: '#A855F7', label: 'Messages' },
  help_replies:         { emoji: '🤝', color: '#0284C7', label: 'Aide' },
  new_connections:      { emoji: '🔗', color: '#7C3AED', label: 'Connexions' },
  // Progression / XP
  xp_earned:            { emoji: '⭐', color: '#D97706', label: 'XP gagné' },
  level_up:             { emoji: '📈', color: '#BE185D', label: 'Niveau' },
  badges_earned:        { emoji: '🏅', color: '#B45309', label: 'Badges' },
  leaderboard_points:   { emoji: '🏆', color: '#9333EA', label: 'Classement' },
  // Événements
  event_organized:      { emoji: '🎪', color: '#DB2777', label: 'Événement' },
  events_attended:      { emoji: '🎟️', color: '#7C3AED', label: 'Événements' },
  // Défaut
  default:              { emoji: '🎖️', color: '#6B7280', label: 'Quête' },
}

// ─── Générateur SVG icône quête ───────────────────────────────────────────────

function generateQuestIconSVG(criteriaType) {
  const info = QUEST_ICONS[criteriaType] || QUEST_ICONS.default
  const label = info.label.length > 10 ? info.label.substring(0, 10) + '…' : info.label

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="128" height="128" viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${info.color}"/>
      <stop offset="100%" stop-color="${adjustColor(info.color, -30)}"/>
    </linearGradient>
  </defs>
  <rect width="128" height="128" rx="24" fill="url(#bg)"/>
  <rect x="4" y="4" width="120" height="120" rx="20" fill="none" stroke="rgba(255,255,255,0.3)" stroke-width="2"/>
  <text x="64" y="68" font-size="52" text-anchor="middle" dominant-baseline="middle"
    style="font-family: 'Segoe UI Emoji', 'Apple Color Emoji', 'Noto Color Emoji', sans-serif;">
    ${info.emoji}
  </text>
  <text x="64" y="108" font-family="'Inter', Arial, sans-serif" font-size="10" font-weight="600"
    text-anchor="middle" fill="rgba(255,255,255,0.9)" letter-spacing="0.3">
    ${label.toUpperCase()}
  </text>
</svg>`
}

function adjustColor(hex, amount) {
  const num = parseInt(hex.replace('#', ''), 16)
  const r = Math.min(255, Math.max(0, (num >> 16) + amount))
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0xFF) + amount))
  const b = Math.min(255, Math.max(0, (num & 0xFF) + amount))
  return '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('')
}

// ─── Upload ───────────────────────────────────────────────────────────────────

async function uploadQuestIcon(criteriaType) {
  const fileId = `quest_${criteriaType}`.substring(0, 36)
  const svgContent = generateQuestIconSVG(criteriaType)
  const buffer = Buffer.from(svgContent, 'utf-8')

  try {
    await storage.deleteFile(BUCKET_ID, fileId).catch(() => {})
    const file = await storage.createFile(
      BUCKET_ID,
      fileId,
      InputFile.fromBuffer(buffer, `${fileId}.svg`, 'image/svg+xml'),
      ['read("any")'],
    )
    return { fileId, success: true }
  } catch (err) {
    return { fileId, success: false, error: err.message }
  }
}

async function main() {
  const types = Object.keys(QUEST_ICONS).filter(k => k !== 'default')
  console.log(`🎯 Upload de ${types.length} icônes de quêtes vers Appwrite Storage...`)

  let ok = 0, fail = 0
  for (const type of types) {
    const result = await uploadQuestIcon(type)
    if (result.success) { ok++; process.stdout.write(`\r✅ ${ok}/${types.length} | ${type.padEnd(30)}`) }
    else { fail++; console.log(`\n❌ ${result.fileId}: ${result.error}`) }
    await new Promise(r => setTimeout(r, 100))
  }
  console.log(`\n\n✅ Succès : ${ok} | Échecs : ${fail}`)
}

main().catch(console.error)
