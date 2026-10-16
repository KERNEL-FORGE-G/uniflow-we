import { readFile } from 'node:fs/promises'
import { basename, resolve } from 'node:path'

import { apiKey, endpoint, projectId, requireConfig } from './appwrite-env.mjs'

requireConfig()
const bucketId = 'uniflow_assets'

// `--replace` : supprime puis retéléverse un fichier dont la source a changé
// (même identifiant, donc même URL publique ; coupure de quelques secondes,
// couverte par le repli local `/logos/uniflow-primary-original.png` du client).
const replace = process.argv.includes('--replace')

const assets = [
  {
    fileId: 'uniflow_primary_logo',
    // Version détourée et « démattée » (halo clair retiré) — `assets/brand/`
    // garde l'original sur fond blanc, inutilisable sur les pages bleues.
    source: resolve('public/logos/uniflow-primary-original.png'),
    contentType: 'image/png',
    name: 'uniflow-logo-principal.png',
  },
]

function requestHeaders() {
  return {
    'X-Appwrite-Project': projectId,
    'X-Appwrite-Key': apiKey,
  }
}

async function getFile(fileId) {
  const response = await fetch(`${endpoint}/storage/buckets/${bucketId}/files/${fileId}`, {
    headers: requestHeaders(),
  })
  if (response.status === 404) return null
  if (!response.ok) throw new Error(`Lecture Appwrite refusée (${response.status}) pour ${fileId}.`)
  return response.json()
}

async function uploadAsset(asset) {
  const buffer = await readFile(asset.source)
  const existing = await getFile(asset.fileId)
  const viewUrl = `${endpoint}/storage/buckets/${bucketId}/files/${asset.fileId}/view?project=${encodeURIComponent(projectId)}`
  if (existing) {
    if (existing.sizeOriginal === buffer.byteLength) {
      console.log(JSON.stringify({ fileId: asset.fileId, bytes: buffer.byteLength, viewUrl, reused: true }))
      return
    }
    if (!replace) {
      throw new Error(`Le fichier existant ${asset.fileId} ne correspond pas à la source locale ; relancer avec --replace pour le remplacer (même URL publique).`)
    }
    const deleted = await fetch(`${endpoint}/storage/buckets/${bucketId}/files/${asset.fileId}`, {
      method: 'DELETE',
      headers: requestHeaders(),
    })
    if (!deleted.ok && deleted.status !== 404) {
      throw new Error(`Suppression Appwrite refusée (${deleted.status}) pour ${asset.fileId}.`)
    }
  }

  const form = new FormData()
  form.set('fileId', asset.fileId)
  form.append('permissions[]', 'read("any")')
  form.set('file', new Blob([buffer], { type: asset.contentType }), asset.name)

  const response = await fetch(`${endpoint}/storage/buckets/${bucketId}/files`, {
    method: 'POST',
    headers: requestHeaders(),
    body: form,
  })
  if (!response.ok) throw new Error(`Téléversement Appwrite refusé (${response.status}) pour ${basename(asset.source)} : ${await response.text()}`)

  const uploaded = await response.json()
  if (uploaded.$id !== asset.fileId || uploaded.sizeOriginal !== buffer.byteLength) {
    throw new Error(`Réponse Appwrite incohérente pour ${asset.fileId}.`)
  }
  console.log(JSON.stringify({ fileId: asset.fileId, bytes: buffer.byteLength, viewUrl }))
}

for (const asset of assets) await uploadAsset(asset)
