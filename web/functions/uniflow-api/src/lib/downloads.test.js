import test from 'node:test'
import assert from 'node:assert/strict'
import { DOWNLOAD_PLATFORMS, isDownloadPlatform, summarizeDownloads } from './downloads.js'

test('aucun document : tous les compteurs valent 0, aucun chiffre inventé', () => {
  const stats = summarizeDownloads([])
  assert.equal(stats.total, 0)
  for (const platform of DOWNLOAD_PLATFORMS) assert.equal(stats.platforms[platform], 0)
})

test('le total est la somme réelle des documents par plateforme', () => {
  const stats = summarizeDownloads([
    { $id: 'android', count: 12 },
    { $id: 'windows', count: 5 },
    { $id: 'inconnue', count: 999 },
    { $id: 'linux', count: -3 },
  ])
  assert.equal(stats.platforms.android, 12)
  assert.equal(stats.platforms.windows, 5)
  assert.equal(stats.platforms.linux, 0)
  assert.equal(stats.total, 17)
})

test('seules les plateformes connues sont acceptées', () => {
  assert.equal(isDownloadPlatform('android'), true)
  assert.equal(isDownloadPlatform('ios'), false)
  assert.equal(isDownloadPlatform(undefined), false)
})

test('le total ne descend jamais sous le nombre de comptes créés', () => {
  assert.equal(summarizeDownloads([], 18).total, 18)
  assert.equal(summarizeDownloads([{ $id: 'android', count: 30 }], 18).total, 30)
  const stats = summarizeDownloads([{ $id: 'android', count: 4 }], 18)
  assert.equal(stats.accounts, 18)
  assert.equal(stats.clicks, 4)
})
