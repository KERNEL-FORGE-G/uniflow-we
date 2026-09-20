/**
 * Comptes de référence du projet Appwrite Cloud.
 *
 * L'ancien serveur auto-hébergé portait onze comptes (sept étudiants, un
 * administrateur, trois sondes) ; il est mort avec sa montée en 2.2.0 et ses
 * mots de passe n'étaient de toute façon pas exportables. Le projet Cloud
 * repart donc de zéro : ce script crée **un compte par rôle** — ADMIN,
 * administration (ADMIN), enseignant, délégué, étudiant, tous UY1 / ICT4D — et
 * un compte **indépendant** (`PERSONAL`), pour que les deux parcours de
 * connexion des trois clients soient réellement testables.
 *
 * `kernel@forge.codes` est l'**admin de la plateforme** (label `superadmin`) :
 * seul lui crée des comptes administration ; une administration crée les
 * enseignants, délégués et étudiants de son université ; l'inscription libre
 * ne produit que des étudiants.
 *
 * Idempotent : les identifiants sont fixes, une seconde exécution met à jour
 * le profil et l'annuaire sans recréer le compte. Les mots de passe sont
 * générés à la première exécution et écrits dans
 * `uniflow-backend/.comptes-demo.local` (ignoré par Git) — jamais dans un
 * fichier versionné, jamais dans un `.env` client.
 *
 * Usage : node scripts/seed-accounts.mjs
 */

import { randomBytes } from 'node:crypto'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { createClient, databaseId, requireConfig } from './appwrite-env.mjs'

requireConfig()
const request = createClient()

const UNIVERSITY = 'Université de Yaoundé I'
const PROGRAM = 'ICT4D'
const CREDENTIALS_FILE = new URL('../../uniflow-backend/.comptes-demo.local', import.meta.url)

/** `id` = identifiant Appwrite ET identifiant du document `users`. */
export const accounts = [
  { id: 'kernel-forge-admin', email: 'kernel@forge.codes', name: 'KERNEL FORGE', username: 'kernelforge', accountType: 'UNIVERSITY', role: 'ADMIN', level: 'L1', matricule: '', superAdmin: true },
  { id: 'uy1-administration', email: 'administration.ict4d@uniflow.test', name: 'Administration ICT4D', username: 'administration', accountType: 'UNIVERSITY', role: 'ADMIN', level: 'L1', matricule: '' },
  { id: 'uy1-teacher-01', email: 'enseignant.ict4d@uniflow.test', name: 'Pr. Fouda', username: 'pr.fouda', accountType: 'UNIVERSITY', role: 'TEACHER', level: 'L1', matricule: '' },
  { id: 'uy1-delegate-l1', email: 'delegue.ict4d.l1@uniflow.test', name: 'Délégué ICT4D L1', username: 'delegue.l1', accountType: 'UNIVERSITY', role: 'DELEGATE', level: 'L1', matricule: 'UY1-ICT4D-L1-2026-001' },
  { id: 'uy1-student-l1', email: 'etudiant.ict4d.l1@uniflow.test', name: 'Étudiante ICT4D L1', username: 'etudiante.l1', accountType: 'UNIVERSITY', role: 'STUDENT', level: 'L1', matricule: 'UY1-ICT4D-L1-2026-002' },
  { id: 'uy1-student-l2', email: 'etudiant.ict4d.l2@uniflow.test', name: 'Étudiant ICT4D L2', username: 'etudiant.l2', accountType: 'UNIVERSITY', role: 'STUDENT', level: 'L2', matricule: 'UY1-ICT4D-L2-2026-001' },
  { id: 'independant-01', email: 'independant@uniflow.test', name: 'Compte indépendant', username: 'independant', accountType: 'PERSONAL', role: 'STUDENT', level: '', matricule: '' },
]

function loadCredentials() {
  if (!existsSync(CREDENTIALS_FILE)) return {}
  const values = {}
  for (const line of readFileSync(CREDENTIALS_FILE, 'utf8').split('\n')) {
    const match = /^([^#=\s]+)=(.*)$/.exec(line.trim())
    if (match) values[match[1]] = match[2]
  }
  return values
}

function saveCredentials(values) {
  const lines = [
    '# Comptes de démonstration UniFlow sur Appwrite Cloud — généré par uniflow-we/scripts/seed-accounts.mjs',
    '# Fichier ignoré par Git. Ne jamais recopier ces valeurs dans un dépôt ni dans un .env client.',
    ...accounts.map((account) => `${account.email}=${values[account.email]}`),
  ]
  writeFileSync(CREDENTIALS_FILE, `${lines.join('\n')}\n`, { mode: 0o600 })
}

/** 20 caractères, lettres, chiffres et ponctuation — Appwrite exige 8 au minimum. */
function generatePassword() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!$%*+-=?'
  return Array.from(randomBytes(20), (byte) => alphabet[byte % alphabet.length]).join('')
}

function ownerPermissions(userId) {
  return [`read("user:${userId}")`, `update("user:${userId}")`, `delete("user:${userId}")`]
}

async function upsertDocument(collectionId, documentId, data, permissions) {
  const created = await request('POST', `/databases/${databaseId}/collections/${collectionId}/documents`, { documentId, data, permissions })
  if (created.status === 409) {
    await request('PATCH', `/databases/${databaseId}/collections/${collectionId}/documents/${documentId}`, { data, permissions })
    return 'mis à jour'
  }
  return 'créé'
}

/**
 * Labels Appwrite = preuve du rôle. Le document `users` est modifiable par
 * son propriétaire (un étudiant pourrait s'y écrire ADMIN) ; les labels, eux,
 * ne se posent qu'avec la clé serveur, et les Functions comme les clients les
 * lisent via `account.get().labels`. Appwrite n'accepte que des lettres et
 * des chiffres dans un label (`role:ADMIN` est refusé en 400) : le label est
 * le nom du rôle tel quel — `ADMIN`, `TEACHER`, `DELEGATE` — et l'absence de
 * label de rôle vaut STUDENT.
 */
export function labelsFor(account) {
  const labels = []
  if (account.role !== 'STUDENT') labels.push(account.role)
  if (account.superAdmin) labels.push('superadmin')
  return labels
}

async function ensureAccount(account, password) {
  const created = await request('POST', '/users', { userId: account.id, email: account.email, password, name: account.name })
  if (created.status === 201) {
    await request('PATCH', `/users/${account.id}/prefs`, { prefs: { uniflowAccountType: account.accountType } })
  }
  await request('PUT', `/users/${account.id}/labels`, { labels: labelsFor(account) })

  const profile = {
    email: account.email,
    name: account.name,
    username: account.username,
    accountType: account.accountType,
    role: account.role,
    university: account.accountType === 'UNIVERSITY' ? UNIVERSITY : '',
    program: account.accountType === 'UNIVERSITY' ? PROGRAM : '',
    ...(account.level ? { level: account.level } : {}),
    country: 'Cameroun',
  }
  const profileState = await upsertDocument('users', account.id, profile, ownerPermissions(account.id))

  let directoryState = 'sans objet'
  if (account.accountType === 'UNIVERSITY') {
    directoryState = await upsertDocument('academic_directory', `directory_${account.id}`, {
      userId: account.id,
      name: account.name,
      role: account.role,
      university: UNIVERSITY,
      program: PROGRAM,
      level: account.level,
      matricule: account.matricule,
      status: 'ACTIVE',
    }, ['read("users")', `update("user:${account.id}")`])
  }

  console.log(`${account.role.padEnd(8)} ${account.email.padEnd(40)} compte ${created.status === 201 ? 'créé' : 'existant'}, profil ${profileState}, annuaire ${directoryState}`)
}

const credentials = loadCredentials()
let generated = 0
for (const account of accounts) {
  if (!credentials[account.email]) {
    credentials[account.email] = generatePassword()
    generated += 1
  }
}
saveCredentials(credentials)

for (const account of accounts) await ensureAccount(account, credentials[account.email])

console.log(`\n${accounts.length} compte(s) traités, ${generated} mot(s) de passe généré(s).`)
console.log(`Identifiants dans ${fileURLToPath(CREDENTIALS_FILE)} (hors Git).`)
