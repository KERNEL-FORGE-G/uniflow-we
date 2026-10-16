/**
 * fix-avatar-permissions.mjs
 *
 * Ajoute `read("any")` sur tous les fichiers d'avatar des membres de l'équipe
 * dans le bucket uniflow_assets.
 *
 * Utilise : node scripts/fix-avatar-permissions.mjs
 * Nécessite : APPWRITE_API_KEY dans l'env (ou ../uniflow-backend/.env)
 */

import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Charger la clé API depuis le .env backend
function loadEnv() {
  const paths = [
    resolve(__dirname, '../../uniflow-backend/.env'),
    resolve(__dirname, '../.env'),
  ]
  for (const p of paths) {
    try {
      const content = readFileSync(p, 'utf8')
      const match = content.match(/^APPWRITE_API_KEY=(.+)$/m)
      if (match) return match[1].trim()
    } catch {}
  }
  return process.env.APPWRITE_API_KEY || null
}

const API_KEY = loadEnv()
if (!API_KEY) {
  console.error('❌ APPWRITE_API_KEY non trouvée. Vérifie uniflow-backend/.env')
  process.exit(1)
}

const ENDPOINT = 'https://fra.cloud.appwrite.io/v1'
const PROJECT  = 'uniflow'
const DATABASE = 'uniflow'
const BUCKET   = 'uniflow_assets'

const headers = {
  'X-Appwrite-Project': PROJECT,
  'X-Appwrite-Key': API_KEY,
  'Content-Type': 'application/json',
}

async function apw(path, options = {}) {
  const res = await fetch(`${ENDPOINT}${path}`, { headers, ...options })
  const body = await res.json()
  if (!res.ok) throw new Error(`${res.status} ${path}: ${body.message}`)
  return body
}

// 1. Récupérer tous les membres avec un avatarFileId non vide
async function getTeamMembers() {
  const data = await apw(`/databases/${DATABASE}/collections/team_members/documents?limit=100`)
  return data.documents.filter(d => d.avatarFileId)
}

// 2. Pour chaque fichier, ajouter read("any") si absent
async function fixFilePermissions(fileId, memberName) {
  try {
    const file = await apw(`/storage/buckets/${BUCKET}/files/${fileId}`)
    const perms = file.$permissions || []
    
    if (perms.includes('read("any")')) {
      console.log(`  ✓ ${memberName} (${fileId}) — déjà public`)
      return
    }

    // Ajouter read("any") aux permissions existantes
    const newPerms = [...perms, 'read("any")']
    await apw(`/storage/buckets/${BUCKET}/files/${fileId}`, {
      method: 'PUT',
      body: JSON.stringify({ permissions: newPerms }),
    })
    console.log(`  ✅ ${memberName} (${fileId}) — permission ajoutée`)
  } catch (err) {
    console.error(`  ❌ ${memberName} (${fileId}) — ${err.message}`)
  }
}

async function main() {
  console.log('🔧 Correction des permissions avatar — uniflow_assets\n')
  
  const members = await getTeamMembers()
  console.log(`📋 ${members.length} membres avec avatarFileId trouvés\n`)
  
  for (const member of members) {
    await fixFilePermissions(member.avatarFileId, member.name)
  }
  
  console.log('\n✅ Terminé — recharge la page /teams pour voir les photos.')
}

main().catch(err => {
  console.error('Erreur fatale:', err.message)
  process.exit(1)
})
