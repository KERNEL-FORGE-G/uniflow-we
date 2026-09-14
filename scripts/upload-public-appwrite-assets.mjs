import { readFile } from 'node:fs/promises'
import { basename, resolve } from 'node:path'

const projectId = process.env.APPWRITE_SELF_HOSTED_PROJECT_ID || '6a959096002a64d9d4e6'
const apiKey = process.env.APPWRITE_SELF_HOSTED_API_KEY
const endpoint = (process.env.APPWRITE_SELF_HOSTED_ENDPOINT || 'https://appwrite.kernelforge.codes/v1').replace(/\/+$/, '')
const bucketId = 'uniflow_assets'

if (!apiKey) throw new Error('APPWRITE_SELF_HOSTED_API_KEY est requise pour téléverser les assets publics.')

const assets = [
  {
    fileId: 'uniflow_primary_logo',
    source: resolve('UniFlow_Logo_Principal.png'),
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
    if (existing.sizeOriginal !== buffer.byteLength) {
      throw new Error(`Le fichier existant ${asset.fileId} ne correspond pas à la source locale ; son remplacement doit être réalisé sans supprimer la ressource publique active.`)
    }
    console.log(JSON.stringify({ fileId: asset.fileId, bytes: buffer.byteLength, viewUrl, reused: true }))
    return
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
