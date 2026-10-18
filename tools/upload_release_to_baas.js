#!/usr/bin/env node
/**
 * Upload direct et remplacement sans historique des binaires (APK Android, Desktop)
 * sur le bucket BaaS Appwrite 'apk' avec découpage en fragments (chunked upload).
 *
 * Usage:
 *   node tools/upload_release_to_baas.js <localFilePath> <fileIdInBucket>
 */

const fs = require('fs')
const path = require('path')
const crypto = require('crypto')
const { Client, Storage, Permission, Role } = require(path.join(__dirname, '../web/node_modules/node-appwrite'))
const { InputFile } = require(path.join(__dirname, '../web/node_modules/node-appwrite/dist/inputFile.js'))

const ENDPOINT = process.env.APPWRITE_ENDPOINT || 'https://vps.kernelforge.codes/v1'
const PROJECT = process.env.APPWRITE_PROJECT_ID || 'uniflow'
const KEY =
  process.env.APPWRITE_API_KEY ||
  'standard_a5f9daa2801fe7e723c6e06866ab6dcee8fe6ee7fdd5193be6be096e8691cc0a58e176d88083e02e0407db8bfcfcf719dfcecb2bd160fefeaa5868de38b77eacc85ed26a7c969ebbf7fd8a9c2b9ba68cf366f610ce12c1b15f310541a22b4777ee7d635907395f1beee3f641af5e7fef6d92e98d573afe19ac09a4d2a7bab6a2'
const BUCKET_ID = process.env.APPWRITE_APK_BUCKET_ID || 'apk'

const localFilePath = process.argv[2]
const fileId = process.argv[3]

if (!localFilePath || !fileId) {
  console.error('Usage: node tools/upload_release_to_baas.js <localFilePath> <fileIdInBucket>')
  process.exit(1)
}

if (!fs.existsSync(localFilePath)) {
  console.error(`Fichier introuvable : ${localFilePath}`)
  process.exit(1)
}

function calculateSha256(filePath) {
  const hash = crypto.createHash('sha256')
  const fileBuffer = fs.readFileSync(filePath)
  hash.update(fileBuffer)
  return hash.digest('hex')
}

const client = new Client().setEndpoint(ENDPOINT).setProject(PROJECT).setKey(KEY)
const storage = new Storage(client)

async function main() {
  console.log(`Préparation du fichier: ${localFilePath} (ID: ${fileId})`)
  const stat = fs.statSync(localFilePath)
  const sha256 = calculateSha256(localFilePath)
  console.log(`Taille: ${stat.size} octets (${(stat.size / 1024 / 1024).toFixed(2)} Mo), SHA256: ${sha256}`)

  // 1. Suppression de l'ancienne version si existante pour remplacement direct
  try {
    await storage.deleteFile(BUCKET_ID, fileId)
    console.log(`Ancienne version '${fileId}' supprimée du bucket '${BUCKET_ID}'.`)
  } catch (err) {
    // 404 est normal si première publication
  }

  // 2. Upload avec chunking automatique de node-appwrite
  console.log(`Téléversement vers Appwrite bucket '${BUCKET_ID}'...`)
  const inputFile = InputFile.fromPath(localFilePath, fileId)
  const res = await storage.createFile(BUCKET_ID, fileId, inputFile, [Permission.read(Role.any())])

  const downloadUrl = `${ENDPOINT}/storage/buckets/${BUCKET_ID}/files/${fileId}/download?project=${PROJECT}`
  const viewUrl = `${ENDPOINT}/storage/buckets/${BUCKET_ID}/files/${fileId}/view?project=${PROJECT}`

  console.log(`\nSuccès ! Fichier téléversé : ${res.$id}`)
  console.log(`Lien direct de téléchargement : ${downloadUrl}`)
  console.log(`Lien direct de visualisation : ${viewUrl}`)

  return {
    fileId,
    downloadUrl,
    sizeBytes: stat.size,
    sha256,
  }
}

main().catch((err) => {
  console.error('Erreur lors du téléversement :', err)
  process.exit(1)
})
