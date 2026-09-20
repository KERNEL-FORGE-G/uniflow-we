/**
 * Injecte l'équipe KERNEL FORGE dans la collection `team_members`.
 *
 * Idempotent : l'identifiant de document est le `slug` du membre, donc une
 * seconde exécution met à jour les documents existants au lieu d'en créer des
 * doublons. Le seed peut être relancé après une modification de cette liste.
 *
 * Les données reprennent les membres qui étaient figés dans
 * `src/pages/TeamsPage.tsx` — le web en montrait neuf, le mobile six et le
 * desktop quatre, d'où trois pages différentes selon la plateforme. L'équipe
 * compte huit membres depuis le 2026-09-20 ; la liste ci-dessous fait foi et
 * le seed supprime de la base ceux qui n'y figurent plus.
 *
 * Chaque document porte `read("any")` : la collection a
 * `documentSecurity: true`, donc ce sont les permissions du document qui
 * décident, pas celles de la collection. Sans elles, la page publique
 * `/teams` — qui s'affiche sans session — ne verrait rien.
 *
 * Par défaut aucune photo n'est attachée : `avatarFileId` reste vide, et les
 * trois clients affichent une silhouette neutre. `--photos` va chercher dans le
 * bucket l'avatar GitHub des membres qui en ont un — voir [importGitHubPhotos].
 */

import { apiKey, createClient, databaseId, endpoint, projectId, requireConfig } from './appwrite-env.mjs'
import { avatarBucketId } from './appwrite-schema.mjs'

const COLLECTION = 'team_members'
const AVATAR_BUCKET = avatarBucketId

/**
 * Comptes GitHub sans photo de profil : l'URL `github.com/<handle>.png`
 * renvoie un 404. La liste vient de `src/utils/avatarUtils.ts`, où elle
 * servait déjà à éviter une image cassée.
 */
const BROKEN_GITHUB_AVATARS = new Set([
  'hawadja1',
  'h-hawadja1',
  'paccotiktok37',
  'FEBNCHAK',
  'Ange55-star',
])

/**
 * `displayOrder` fixe l'ordre d'affichage, identique sur les trois clients :
 * c'est celui de l'ancienne liste du web, qui allait du responsable vers les
 * développeurs.
 */
const members = [
  {
    slug: 'ravel',
    name: 'NGHOMSI FEUKOUO RAVEL',
    github: 'Archlord12345',
    email: 'ravelnghomsi@gmail.com',
    team: 'Leadership',
    subTeam: 'Architecture & Direction',
    role: 'Chef de projet & Architecte',
    badge: 'Lead Architect',
    accent: 'blue',
  },
  {
    slug: 'aliya',
    name: 'Aliyatou Rachid Oumou Tourab',
    github: 'aliya-nadi',
    email: 'oumou.aliyatou@facsciences-uy1.cm',
    team: 'Frontend',
    subTeam: 'Frontend Desktop & Web',
    role: 'Frontend Developer',
    badge: 'Web Desktop',
    accent: 'purple',
  },
  {
    slug: 'judith',
    name: 'Mandeng Judith Oceanne',
    github: 'oceannemj',
    email: 'judithoceanne12@gmail.com',
    team: 'Frontend',
    subTeam: 'Frontend Mobile App',
    role: 'Mobile Developer',
    badge: 'Mobile App',
    accent: 'emerald',
  },
  {
    slug: 'william',
    name: 'Meli William',
    github: 'WilliamMeli-27',
    email: 'meliwilliam27@gmail.com',
    team: 'Backend',
    subTeam: 'Backend APIs & BD',
    role: 'Backend Developer',
    badge: 'Backend & DB',
    accent: 'amber',
  },
  {
    slug: 'sandra',
    name: 'FEBNCHAK M. Borelle Sandra',
    github: 'FEBNCHAK',
    email: 'sandraborelle0@gmail.com',
    team: 'Frontend',
    subTeam: 'Frontend Mobile App',
    role: 'Mobile Developer',
    badge: 'Mobile App',
    accent: 'emerald',
  },
  {
    slug: 'hassane',
    name: 'HASSANE YOUSSOUF OUMAR',
    github: 'hawadja1',
    email: 'h.hawadja1@gmail.com',
    team: 'Backend',
    subTeam: 'Backend Microservices',
    role: 'Backend Developer',
    badge: 'NestJS Backend',
    accent: 'rose',
  },
  {
    slug: 'ange',
    name: 'Mokam Ange',
    github: 'Ange55-star',
    email: 'ange.mokam@facsciences-uy1.cm',
    team: 'Backend',
    subTeam: 'SGBD & Infrastructure',
    role: 'Backend Developer',
    badge: 'Database Architect',
    accent: 'amber',
  },
  // EMTCHEU Aristide Bienvenu (slug `aristide`) a quitté l'équipe : retiré le
  // 2026-09-20 sur demande du propriétaire, et supprimé de la base par le seed.
  {
    slug: 'juvenal',
    name: 'SINENG KENGNI JUVENAL',
    github: 'skjuv',
    email: 'sinengjuvenal@gmail.com',
    team: 'Frontend',
    subTeam: 'Multiplateforme',
    role: 'Frontend Developer',
    badge: 'Fullstack UI',
    accent: 'indigo',
  },
].map((member, index) => ({ ...member, displayOrder: index }))

requireConfig()
console.log(`Injection de l'équipe dans ${endpoint} — projet ${projectId}`)

const request = createClient()

/** Crée le document, ou le remplace s'il existe déjà. */
async function upsert(slug, data, permissions) {
  const created = await request('POST', `/databases/${databaseId}/collections/${COLLECTION}/documents`, {
    documentId: slug,
    data,
    permissions,
  })
  if (created.status === 201) return 'created'
  await request('PATCH', `/databases/${databaseId}/collections/${COLLECTION}/documents/${slug}`, { data, permissions })
  return 'updated'
}

/**
 * Recopie dans le bucket la photo de profil GitHub des membres qui en ont une.
 *
 * Demande explicite (`--photos`) : les photos de ces personnes sont hébergées
 * par GitHub, et cet import les copie chez UniFlow. Les cinq comptes listés
 * dans [BROKEN_GITHUB_AVATARS] n'ont pas de photo — l'import les laisse en
 * silhouette plutôt que d'inventer une image.
 */
async function importGitHubPhotos() {
  for (const member of members) {
    if (!member.github || BROKEN_GITHUB_AVATARS.has(member.github)) {
      console.log(`  ${member.slug} : pas de photo GitHub, laissé en silhouette.`)
      continue
    }
    const response = await fetch(`https://github.com/${member.github}.png?size=256`)
    if (!response.ok) {
      console.log(`  ${member.slug} : GitHub a répondu ${response.status}, laissé en silhouette.`)
      continue
    }
    const bytes = Buffer.from(await response.arrayBuffer())
    const form = new FormData()
    form.set('fileId', 'unique()')
    form.set('file', new Blob([bytes], { type: 'image/png' }), `equipe-${member.slug}.png`)
    // En multipart, Appwrite attend des champs répétés `permissions[]` et non un
    // tableau sérialisé en JSON — même contrainte que dans seed-academic-demo.mjs.
    form.append('permissions[]', 'read("any")')

    const upload = await fetch(`${endpoint}/storage/buckets/${AVATAR_BUCKET}/files`, {
      method: 'POST',
      headers: { 'X-Appwrite-Project': projectId, 'X-Appwrite-Key': apiKey },
      body: form,
    })
    const payload = await upload.json().catch(() => ({}))
    if (!upload.ok) {
      console.log(`  ${member.slug} : téléversement refusé (${upload.status}) — ${payload.message || ''}`)
      continue
    }
    await request('PATCH', `/databases/${databaseId}/collections/${COLLECTION}/documents/${member.slug}`, {
      data: { avatarFileId: payload.$id },
    })
    console.log(`  ${member.slug} : photo importée (${payload.$id}).`)
  }
}

const withPhotos = process.argv.includes('--photos')

for (const member of members) {
  const action = await upsert(member.slug, member, ['read("any")'])
  console.log(`  ${action === 'created' ? 'Créé' : 'Mis à jour'} : ${member.name}`)
}

/**
 * Retire de la base les membres qui ne figurent plus dans la liste ci-dessus.
 *
 * Sans cela, un départ (Aristide, 2026-09-20) restait affiché sur les trois
 * clients : le seed ne faisait que créer ou mettre à jour. La photo attachée
 * est supprimée du bucket avec le document.
 */
const kept = new Set(members.map((member) => member.slug))
const existing = await request('GET', `/databases/${databaseId}/collections/${COLLECTION}/documents?queries[0]=${encodeURIComponent(JSON.stringify({ method: 'limit', values: [100] }))}`)
for (const document of existing.payload.documents || []) {
  if (kept.has(document.$id)) continue
  if (document.avatarFileId) {
    await fetch(`${endpoint}/storage/buckets/${AVATAR_BUCKET}/files/${document.avatarFileId}`, {
      method: 'DELETE',
      headers: { 'X-Appwrite-Project': projectId, 'X-Appwrite-Key': apiKey },
    })
  }
  await request('DELETE', `/databases/${databaseId}/collections/${COLLECTION}/documents/${document.$id}`)
  console.log(`  Supprimé : ${document.name} (n'est plus dans l'équipe)`)
}

if (withPhotos) {
  console.log('Import des photos GitHub :')
  await importGitHubPhotos()
}

console.log(`${members.length} membre(s) de l'équipe en base.`)
