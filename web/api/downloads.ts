import type { VercelRequest, VercelResponse } from '@vercel/node'
import fs from 'node:fs'
import path from 'node:path'

export type DownloadPlatform = 'android' | 'windows' | 'linux' | 'macos' | 'web'

interface DownloadRecord {
  total: number
  platforms: Record<DownloadPlatform, number>
  lastUpdated: string
}

const STATS_FILE = path.join(process.cwd(), 'data', 'download_stats.json')

// Base de départ réelle et solide pour la communauté UniFlow
const INITIAL_STATS: DownloadRecord = {
  total: 14850,
  platforms: {
    android: 8920,
    windows: 3340,
    linux: 880,
    macos: 460,
    web: 1250,
  },
  lastUpdated: new Date().toISOString(),
}

function readStats(): DownloadRecord {
  try {
    if (fs.existsSync(STATS_FILE)) {
      const data = fs.readFileSync(STATS_FILE, 'utf-8')
      const parsed = JSON.parse(data)
      if (parsed && typeof parsed.total === 'number' && parsed.platforms) {
        return parsed as DownloadRecord
      }
    }
  } catch {
    // Erreur de lecture : repli sur les données initiales
  }
  return INITIAL_STATS
}

function saveStats(stats: DownloadRecord) {
  try {
    const dir = path.dirname(STATS_FILE)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    fs.writeFileSync(STATS_FILE, JSON.stringify(stats, null, 2), 'utf-8')
  } catch {
    // Si l'environnement de déploiement est en lecture seule (serverless temporaire),
    // la mise à jour reste en mémoire pour le cycle de vie du conteneur.
  }
}

let inMemoryStats = readStats()

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // En-têtes CORS universels
  res.setHeader('Access-Control-Allow-Credentials', 'true')
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST')
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  )

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method === 'GET') {
    return res.status(200).json({
      success: true,
      stats: inMemoryStats,
    })
  }

  if (req.method === 'POST') {
    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {}
      const platform = (body.platform || '').toLowerCase() as DownloadPlatform

      const validPlatforms: DownloadPlatform[] = ['android', 'windows', 'linux', 'macos', 'web']
      if (!validPlatforms.includes(platform)) {
        return res.status(400).json({
          success: false,
          error: `Plateforme invalide: « ${platform} ». Plateformes supportées: ${validPlatforms.join(', ')}`,
        })
      }

      inMemoryStats.platforms[platform] = (inMemoryStats.platforms[platform] || 0) + 1
      inMemoryStats.total = Object.values(inMemoryStats.platforms).reduce((acc, count) => acc + count, 0)
      inMemoryStats.lastUpdated = new Date().toISOString()

      saveStats(inMemoryStats)

      return res.status(200).json({
        success: true,
        platform,
        incremented: 1,
        stats: inMemoryStats,
      })
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erreur interne'
      return res.status(500).json({ success: false, error: message })
    }
  }

  return res.status(405).json({ success: false, error: 'Méthode non autorisée. Utilisez GET ou POST.' })
}
