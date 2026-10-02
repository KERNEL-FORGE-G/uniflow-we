/**
 * upload-badge-images.mjs
 *
 * Génère des images SVG pour les 100 badges UniFlow et les uploade
 * dans le bucket Appwrite (uniflow_assets) avec le préfixe "badges/".
 *
 * Chaque badge reçoit une image SVG 256×256 px avec :
 *   - Fond circulaire coloré selon la rareté/catégorie
 *   - Icône emoji/texte représentatif
 *   - Bordure distincte selon le niveau (bronze→diamond)
 *   - ID de fichier = imageFileId du catalogue (ex: "badge_assidu")
 *
 * Usage :
 *   node scripts/upload-badge-images.mjs
 *
 * Variables d'environnement requises :
 *   APPWRITE_ENDPOINT, APPWRITE_PROJECT_ID, APPWRITE_API_KEY
 */

import { Client, Storage, ID, InputFile } from 'node-appwrite'
import dotenv from 'dotenv'
dotenv.config()

const client = new Client()
  .setEndpoint(process.env.APPWRITE_ENDPOINT)
  .setProject(process.env.APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY)

const storage = new Storage(client)
const BUCKET_ID = process.env.APPWRITE_STORAGE_BUCKET_ID || 'uniflow_assets'

// ─── Palette couleurs par rareté ──────────────────────────────────────────────
const RARITY_COLORS = {
  common:    { bg: '#6B7280', border: '#9CA3AF', glow: '#D1D5DB' },
  rare:      { bg: '#3B82F6', border: '#60A5FA', glow: '#BFDBFE' },
  epic:      { bg: '#8B5CF6', border: '#A78BFA', glow: '#DDD6FE' },
  legendary: { bg: '#F59E0B', border: '#FCD34D', glow: '#FEF3C7' },
}

// ─── Icônes par slug de badge ─────────────────────────────────────────────────
const BADGE_ICONS = {
  // Assiduité
  badge_premier_pas:       { emoji: '👣', label: 'Premier pas' },
  badge_assidu:            { emoji: '✅', label: 'Assidu' },
  badge_ponctuel:          { emoji: '⏰', label: 'Ponctuel' },
  badge_irreprochable:     { emoji: '🌟', label: 'Irréprochable' },
  badge_pilier:            { emoji: '🏛️', label: 'Pilier' },
  badge_sans_faute:        { emoji: '💎', label: 'Sans faute' },
  badge_infatigable:       { emoji: '⚡', label: 'Infatigable' },
  badge_matinal:           { emoji: '🌅', label: 'Matinal' },
  badge_regulier:          { emoji: '📅', label: 'Régulier' },
  badge_legende_presence:  { emoji: '👑', label: 'Légende présence' },
  // Académique
  badge_premier_cours:     { emoji: '📚', label: 'Premier cours' },
  badge_premier_devoir:    { emoji: '📝', label: 'Premier devoir' },
  badge_premier_quiz:      { emoji: '❓', label: 'Premier quiz' },
  badge_premier_examen:    { emoji: '📋', label: 'Premier examen' },
  badge_mention_bien:      { emoji: '🎓', label: 'Mention bien' },
  badge_mention_tres_bien: { emoji: '🏆', label: 'Mention TB' },
  badge_major:             { emoji: '👑', label: 'Major' },
  badge_quiz_parfait:      { emoji: '💯', label: 'Quiz parfait' },
  badge_5_quiz_parfaits:   { emoji: '🔥', label: '5 quiz parfaits' },
  badge_champion_quiz:     { emoji: '🎯', label: 'Champion quiz' },
  badge_cours_termine:     { emoji: '✔️', label: 'Cours terminé' },
  badge_5_cours:           { emoji: '📖', label: '5 cours' },
  badge_20_cours:          { emoji: '📗', label: '20 cours' },
  badge_10_devoirs:        { emoji: '📃', label: '10 devoirs' },
  badge_serie_devoirs:     { emoji: '⛓️', label: 'Série devoirs' },
  badge_perfectionniste:   { emoji: '🔬', label: 'Perfectionniste' },
  badge_omniscient:        { emoji: '🧠', label: 'Omniscient' },
  badge_legende_academique:{ emoji: '📜', label: 'Légende acad.' },
  badge_academicien:       { emoji: '🎖️', label: 'Académicien' },
  badge_autodidacte:       { emoji: '🔭', label: 'Autodidacte' },
  badge_diplome:           { emoji: '🎓', label: 'Diplômé' },
  badge_meilleur_note:     { emoji: '⭐', label: 'Meilleure note' },
  badge_travailleur:       { emoji: '💪', label: 'Travailleur' },
  badge_rendu_express:     { emoji: '⚡', label: 'Rendu express' },
  // Social
  badge_premier_message:   { emoji: '💬', label: 'Premier message' },
  badge_bavard:            { emoji: '🗣️', label: 'Bavard' },
  badge_orateur:           { emoji: '🎤', label: 'Orateur' },
  badge_commentateur:      { emoji: '💭', label: 'Commentateur' },
  badge_reactif:           { emoji: '⚡', label: 'Réactif' },
  badge_animateur:         { emoji: '🎪', label: 'Animateur' },
  badge_mentor:            { emoji: '🤝', label: 'Mentor' },
  badge_guide:             { emoji: '🧭', label: 'Guide' },
  badge_lien_social:       { emoji: '🔗', label: 'Lien social' },
  badge_networker:         { emoji: '🌐', label: 'Networker' },
  // Communauté
  badge_entraide_debutant: { emoji: '🤲', label: 'Entraide déb.' },
  badge_coequipier:        { emoji: '👥', label: 'Coéquipier' },
  badge_top_contributeur_mois: { emoji: '🥇', label: 'Top contrib.' },
  badge_partage_ressource: { emoji: '📤', label: 'Partage' },
  badge_bibliophile:       { emoji: '📚', label: 'Bibliophile' },
  badge_bibliothecaire:    { emoji: '🏫', label: 'Bibliothécaire' },
  badge_star_communaute:   { emoji: '⭐', label: 'Star communauté' },
  badge_fan_club:          { emoji: '❤️', label: 'Fan club' },
  badge_influenceur:       { emoji: '📡', label: 'Influenceur' },
  badge_ambassadeur:       { emoji: '🌍', label: 'Ambassadeur' },
  // Progression / XP
  badge_xp_500:            { emoji: '🔋', label: 'XP 500' },
  badge_xp_2000:           { emoji: '⚡', label: 'XP 2000' },
  badge_xp_10000:          { emoji: '🔥', label: 'XP 10000' },
  badge_niveau_5:          { emoji: '5️⃣', label: 'Niveau 5' },
  badge_niveau_15:         { emoji: '🔟', label: 'Niveau 15' },
  badge_niveau_max:        { emoji: '💫', label: 'Niveau max' },
  badge_montee_puissance:  { emoji: '📈', label: 'Montée puissance' },
  badge_triple_champion:   { emoji: '🥇', label: 'Triple champion' },
  badge_ultime:            { emoji: '🌌', label: 'Ultime' },
  // Spécial / Événements
  badge_fondateur:         { emoji: '🏗️', label: 'Fondateur' },
  badge_pionnier:          { emoji: '🚀', label: 'Pionnier' },
  badge_beta_testeur:      { emoji: '🔧', label: 'Beta testeur' },
  badge_anniversaire_1an:  { emoji: '🎂', label: '1 an' },
  badge_anniversaire_2ans: { emoji: '🎉', label: '2 ans' },
  badge_noel:              { emoji: '🎄', label: 'Noël' },
  badge_halloween:         { emoji: '🎃', label: 'Halloween' },
  badge_fete_nationale:    { emoji: '🎆', label: 'Fête nationale' },
  badge_premier_mois:      { emoji: '📆', label: 'Premier mois' },
  badge_premier_semaine:   { emoji: '📅', label: 'Première semaine' },
  badge_premier_annuel:    { emoji: '🏅', label: 'Premier annuel' },
  badge_comeback:          { emoji: '🔄', label: 'Comeback' },
  badge_challenge_gagnant: { emoji: '🎖️', label: 'Challenge gagné' },
  // Top classement
  badge_top3_semaine:      { emoji: '🥉', label: 'Top 3 semaine' },
  badge_top10_semaine:     { emoji: '🔟', label: 'Top 10 semaine' },
  badge_posteur_semaine:   { emoji: '✍️', label: 'Posteur semaine' },
  badge_best_assidu_week:  { emoji: '📌', label: 'Best assidu sem.' },
  badge_best_grade_week:   { emoji: '📊', label: 'Best note sem.' },
  badge_top3_promo:        { emoji: '🥈', label: 'Top 3 promo' },
  badge_top10_mois:        { emoji: '🏆', label: 'Top 10 mois' },
  badge_posteur_mois:      { emoji: '📰', label: 'Posteur mois' },
  badge_best_assidu_month: { emoji: '🎯', label: 'Best assidu mois' },
  badge_best_grade_month:  { emoji: '🌟', label: 'Best note mois' },
  badge_top3_annuel:       { emoji: '👑', label: 'Top 3 annuel' },
  badge_legende_sociale:   { emoji: '🌍', label: 'Légende sociale' },
  // Profil / Onboarding
  badge_profil_complet:    { emoji: '✅', label: 'Profil complet' },
  badge_photo_profil:      { emoji: '🖼️', label: 'Photo profil' },
  badge_notif_activees:    { emoji: '🔔', label: 'Notifs activées' },
  badge_connexion_mobile:  { emoji: '📱', label: 'Connexion mobile' },
  badge_dark_mode:         { emoji: '🌙', label: 'Dark mode' },
  badge_certif_bronze:     { emoji: '🥉', label: 'Certif bronze' },
  badge_certif_or:         { emoji: '🥇', label: 'Certif or' },
  badge_delais:            { emoji: '⏱️', label: 'Délais' },
}

// ─── Correspondance slug → rareté ─────────────────────────────────────────────
const BADGE_RARITY = {
  common: [
    'badge_premier_pas','badge_premier_cours','badge_premier_devoir',
    'badge_premier_quiz','badge_premier_message','badge_premier_mois',
    'badge_premier_semaine','badge_profil_complet','badge_photo_profil',
    'badge_notif_activees','badge_connexion_mobile',
  ],
  rare: [
    'badge_assidu','badge_ponctuel','badge_bavard','badge_coequipier',
    'badge_matinal','badge_regulier','badge_reactif','badge_mention_bien',
    'badge_quiz_parfait','badge_cours_termine','badge_entraide_debutant',
    'badge_5_cours','badge_10_devoirs','badge_xp_500','badge_niveau_5',
    'badge_comeback','badge_certif_bronze','badge_dark_mode',
    'badge_top10_semaine','badge_top10_mois','badge_delais',
  ],
  epic: [
    'badge_irreprochable','badge_pilier','badge_orateur','badge_animateur',
    'badge_mentor','badge_guide','badge_5_quiz_parfaits','badge_mention_tres_bien',
    'badge_serie_devoirs','badge_20_cours','badge_xp_2000','badge_niveau_15',
    'badge_bibliophile','badge_bibliothecaire','badge_star_communaute',
    'badge_partage_ressource','badge_top3_semaine','badge_top3_promo',
    'badge_posteur_semaine','badge_posteur_mois','badge_anniversaire_1an',
    'badge_halloween','badge_noel','badge_fete_nationale','badge_beta_testeur',
    'badge_certif_or','badge_montee_puissance','badge_champion_quiz',
    'badge_perfectionniste','badge_best_assidu_week','badge_best_grade_week',
    'badge_best_assidu_month','badge_best_grade_month',
  ],
  legendary: [
    'badge_sans_faute','badge_infatigable','badge_legende_presence',
    'badge_major','badge_omniscient','badge_legende_academique',
    'badge_academicien','badge_diplome','badge_lien_social','badge_networker',
    'badge_top_contributeur_mois','badge_fan_club','badge_influenceur',
    'badge_ambassadeur','badge_xp_10000','badge_niveau_max','badge_triple_champion',
    'badge_ultime','badge_fondateur','badge_pionnier','badge_anniversaire_2ans',
    'badge_premier_annuel','badge_top3_annuel','badge_legende_sociale',
    'badge_meilleur_note','badge_travailleur','badge_autodidacte','badge_guide',
    'badge_rendu_express','badge_challenge_gagnant','badge_commentateur',
  ],
}

// ─── Générateur SVG ───────────────────────────────────────────────────────────

function getRarity(slug) {
  for (const [rarity, slugs] of Object.entries(BADGE_RARITY)) {
    if (slugs.includes(slug)) return rarity
  }
  return 'common'
}

function generateBadgeSVG(slug) {
  const rarity = getRarity(slug)
  const colors = RARITY_COLORS[rarity] || RARITY_COLORS.common
  const info = BADGE_ICONS[slug] || { emoji: '🏅', label: slug.replace('badge_', '') }

  const labelText = info.label.length > 12 
    ? info.label.substring(0, 12) + '…' 
    : info.label

  // Bordures par niveau
  const borderWidth = rarity === 'legendary' ? 5 : rarity === 'epic' ? 4 : 3
  const glowRadius = rarity === 'legendary' ? 8 : rarity === 'epic' ? 5 : 0

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="256" height="256" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <defs>
    <radialGradient id="bgGrad" cx="50%" cy="40%" r="60%">
      <stop offset="0%" stop-color="${colors.bg}" stop-opacity="0.9"/>
      <stop offset="100%" stop-color="${adjustColor(colors.bg, -40)}" stop-opacity="1"/>
    </radialGradient>
    <radialGradient id="glowGrad" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="${colors.glow}" stop-opacity="0.6"/>
      <stop offset="100%" stop-color="${colors.glow}" stop-opacity="0"/>
    </radialGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="4" stdDeviation="8" flood-color="${colors.bg}" flood-opacity="0.4"/>
    </filter>
    ${glowRadius > 0 ? `<filter id="glow">
      <feGaussianBlur stdDeviation="${glowRadius}" result="coloredBlur"/>
      <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>` : ''}
  </defs>

  <!-- Fond -->
  <rect width="256" height="256" fill="#1a1a2e" rx="20"/>

  <!-- Halo externe -->
  ${rarity !== 'common' ? `<circle cx="128" cy="128" r="120" fill="url(#glowGrad)" opacity="0.5"/>` : ''}

  <!-- Cercle principal -->
  <circle cx="128" cy="115" r="90" fill="url(#bgGrad)" filter="url(#shadow)"/>

  <!-- Bordure -->
  <circle cx="128" cy="115" r="90" fill="none" stroke="${colors.border}" stroke-width="${borderWidth}" opacity="0.9"
    ${rarity === 'legendary' ? `filter="url(#glow)"` : ''}/>

  <!-- Cercle intérieur décoratif -->
  <circle cx="128" cy="115" r="75" fill="none" stroke="${colors.border}" stroke-width="1" opacity="0.3"/>

  <!-- Emoji icône -->
  <text x="128" y="128" font-size="64" text-anchor="middle" dominant-baseline="middle"
    style="font-family: 'Segoe UI Emoji', 'Apple Color Emoji', 'Noto Color Emoji', sans-serif;">
    ${info.emoji}
  </text>

  <!-- Bandeau du bas -->
  <rect x="10" y="210" width="236" height="36" rx="10" fill="#0f172a" opacity="0.85"/>

  <!-- Label -->
  <text x="128" y="234" font-family="'Inter', 'Segoe UI', Arial, sans-serif" font-size="14"
    font-weight="700" text-anchor="middle" fill="${colors.border}" letter-spacing="0.5">
    ${labelText.toUpperCase()}
  </text>

  <!-- Indicateur rareté (coins) -->
  ${rarity === 'legendary' ? `
  <polygon points="10,10 30,10 10,30" fill="${colors.border}" opacity="0.8"/>
  <polygon points="246,10 226,10 246,30" fill="${colors.border}" opacity="0.8"/>
  ` : ''}
</svg>`
}

// Assombrit/éclaircit une couleur hex de `amount` (négatif = assombrir)
function adjustColor(hex, amount) {
  const num = parseInt(hex.replace('#', ''), 16)
  const r = Math.min(255, Math.max(0, (num >> 16) + amount))
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0xFF) + amount))
  const b = Math.min(255, Math.max(0, (num & 0xFF) + amount))
  return '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('')
}

// ─── Upload vers Appwrite ──────────────────────────────────────────────────────

const ALL_BADGE_SLUGS = Object.values({
  ...Object.fromEntries(BADGE_RARITY.common.map(s => [s, s])),
  ...Object.fromEntries(BADGE_RARITY.rare.map(s => [s, s])),
  ...Object.fromEntries(BADGE_RARITY.epic.map(s => [s, s])),
  ...Object.fromEntries(BADGE_RARITY.legendary.map(s => [s, s])),
})

// Compléter avec tous les slugs du catalogue (ceux non classifiés → common)
const EXTRA_SLUGS = Object.keys(BADGE_ICONS).filter(s => !ALL_BADGE_SLUGS.includes(s))
const BADGE_SLUGS = [...new Set([...ALL_BADGE_SLUGS, ...EXTRA_SLUGS])]

async function uploadBadgeImage(slug) {
  const svgContent = generateBadgeSVG(slug)
  const buffer = Buffer.from(svgContent, 'utf-8')
  
  try {
    // Tenter de supprimer l'existant (ignore 404)
    await storage.deleteFile(BUCKET_ID, slug).catch(() => {})
    
    const file = await storage.createFile(
      BUCKET_ID,
      slug,                        // fileId = slug exact (ex: "badge_assidu")
      InputFile.fromBuffer(buffer, `${slug}.svg`, 'image/svg+xml'),
      ['read("any")'],             // lecture publique pour les badges
    )
    return { slug, success: true, fileId: file.$id }
  } catch (err) {
    return { slug, success: false, error: err.message }
  }
}

async function main() {
  console.log(`🎯 Upload de ${BADGE_SLUGS.length} images de badges vers Appwrite Storage...`)
  console.log(`   Bucket: ${BUCKET_ID}`)
  console.log(`   Endpoint: ${process.env.APPWRITE_ENDPOINT}`)
  console.log()

  let ok = 0, fail = 0
  const errors = []

  for (let i = 0; i < BADGE_SLUGS.length; i++) {
    const slug = BADGE_SLUGS[i]
    const result = await uploadBadgeImage(slug)
    
    if (result.success) {
      ok++
      process.stdout.write(`\r✅ ${ok}/${BADGE_SLUGS.length} | ${slug.padEnd(35)}`)
    } else {
      fail++
      errors.push(result)
      process.stdout.write(`\r❌ ${fail} erreurs | ${slug.padEnd(35)}`)
    }

    // Pause légère pour éviter le rate-limit Appwrite
    if (i % 10 === 9) await new Promise(r => setTimeout(r, 200))
  }

  console.log('\n')
  console.log(`✅ Succès : ${ok}/${BADGE_SLUGS.length}`)
  if (fail > 0) {
    console.log(`❌ Échecs : ${fail}`)
    errors.forEach(e => console.log(`   - ${e.slug}: ${e.error}`))
  }
  console.log('\n🏁 Upload terminé. Les fileId sont les slugs des badges (ex: "badge_assidu").')
  console.log('   URL d\'accès : ${APPWRITE_ENDPOINT}/storage/buckets/uniflow_assets/files/${fileId}/view?project=${PROJECT_ID}')
}

main().catch(console.error)
