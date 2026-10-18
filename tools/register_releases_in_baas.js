#!/usr/bin/env node
/**
 * Enregistre / met à jour les releases d'application dans la collection Appwrite `app_releases`.
 * Conçu pour fonctionner de manière idempotente avec suppression préalable ou upsert.
 */

const fs = require('fs')
const path = require('path')
const crypto = require('crypto')
const { Client, Databases, Permission, Role } = require(path.join(__dirname, '../web/node_modules/node-appwrite'))

const ENDPOINT = process.env.APPWRITE_ENDPOINT || 'https://vps.kernelforge.codes/v1'
const PROJECT = process.env.APPWRITE_PROJECT_ID || 'uniflow'
const KEY =
  process.env.APPWRITE_API_KEY ||
  'standard_a5f9daa2801fe7e723c6e06866ab6dcee8fe6ee7fdd5193be6be096e8691cc0a58e176d88083e02e0407db8bfcfcf719dfcecb2bd160fefeaa5868de38b77eacc85ed26a7c969ebbf7fd8a9c2b9ba68cf366f610ce12c1b15f310541a22b4777ee7d635907395f1beee3f641af5e7fef6d92e98d573afe19ac09a4d2a7bab6a2'
const DATABASE_ID = process.env.APPWRITE_DATABASE_ID || 'uniflow'
const COLLECTION_ID = 'app_releases'

function sha256Of(filePath) {
  const hash = crypto.createHash('sha256')
  hash.update(fs.readFileSync(filePath))
  return hash.digest('hex')
}

const client = new Client().setEndpoint(ENDPOINT).setProject(PROJECT).setKey(KEY)
const db = new Databases(client)

async function registerRelease({ platform, version, fileName, localPath, directDownloadUrl, notes }) {
  const stat = fs.statSync(localPath)
  const sha256 = sha256Of(localPath)

  const docData = {
    platform,
    version,
    url: directDownloadUrl,
    fileName,
    sizeBytes: stat.size,
    sha256,
    notes: notes || '',
    publishedAt: new Date().toISOString(),
    enabled: true,
  }

  console.log(`[${platform}] Enregistrement dans ${DATABASE_ID}.${COLLECTION_ID} :`)
  console.log(JSON.stringify(docData, null, 2))

  try {
    await db.deleteDocument(DATABASE_ID, COLLECTION_ID, platform)
    console.log(`[${platform}] Ancien document supprimé.`)
  } catch (err) {
    // 404 est attendu si c'est la première fois
  }

  const res = await db.createDocument(DATABASE_ID, COLLECTION_ID, platform, docData, [Permission.read(Role.any())])
  console.log(`[${platform}] Release publiée avec succès ! ID: ${res.$id}`)
  return res
}

async function main() {
  const platform = process.argv[2]
  if (platform === 'linux') {
    const localPath = path.join(__dirname, '../desktop/build/uniflow-desktop-linux.tar.gz')
    await registerRelease({
      platform: 'linux',
      version: '1.0.0',
      fileName: 'uniflow-desktop-linux.tar.gz',
      localPath,
      directDownloadUrl: `${ENDPOINT}/storage/buckets/apk/files/uniflow-desktop-linux.tar.gz/download?project=${PROJECT}`,
      notes:
        'Version officielle UniFlow Desktop pour Linux (Ubuntu, Debian, Fedora, Arch). Visioconférence HD embarquée, messagerie UniMail @uniflow.cm, Actualités Campus, consultation connectée et synchronisation résiliente.',
    })
  } else if (platform === 'android') {
    const localPath = process.argv[3] || path.join(__dirname, '../mobile/build/app/outputs/flutter-apk/app-release.apk')
    await registerRelease({
      platform: 'android',
      version: '1.0.0',
      fileName: 'uniflow-release.apk',
      localPath,
      directDownloadUrl: `${ENDPOINT}/storage/buckets/apk/files/uniflow-release.apk/download?project=${PROJECT}`,
      notes:
        'Version officielle UniFlow Mobile pour Android 7.0+. Emploi du temps en direct, émargement QR Code certifié, cours et devoirs, UniMail @uniflow.cm, Actualités Campus et moteur de synchronisation résilient en arrière-plan.',
    })
  } else {
    console.log('Usage: node tools/register_releases_in_baas.js <linux|android> [optionalLocalPath]')
  }
}

main().catch((err) => {
  console.error('Erreur :', err)
  process.exit(1)
})
