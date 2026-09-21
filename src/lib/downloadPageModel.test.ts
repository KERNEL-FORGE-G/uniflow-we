import test from 'node:test'
import assert from 'node:assert/strict'
import {
  ANDROID_INSTALL_STEPS,
  DOWNLOAD_FAQ,
  DOWNLOAD_PAGE_PATH,
  buildDownloadChannels,
  formatPublishedDate,
  releaseMetaLine,
  shortSha,
  splitReleaseNotes,
} from './downloadPageModel.ts'
import { releaseFallbackUrl, type AppRelease } from './appReleasesModel.ts'

const android: AppRelease = {
  platform: 'android',
  version: '1.0.0',
  url: 'https://github.com/KERNEL-FORGE-G/uniflow-apps/releases/download/uniflow/app-release.apk',
  fileName: 'app-release.apk',
  sizeBytes: 87184725,
  sha256: '2804af7ccb9e75b31e88a1a7643ff81737e0f756c40ae7d6647dfd9609e11773',
  notes: 'Première version installable.',
  publishedAt: '2026-09-21T14:53:33.000Z',
  enabled: true,
  updatedAt: null,
}

const linux: AppRelease = { ...android, platform: 'linux', version: '0.9.0', url: 'https://github.com/KERNEL-FORGE-G/uniflow-apps/releases/download/desktop-v0.9.0/uniflow.AppImage', fileName: 'uniflow.AppImage', sizeBytes: 120_000_000 }

test('la page vit sous /download', () => {
  assert.equal(DOWNLOAD_PAGE_PATH, '/download')
})

test('avant toute réponse, les deux canaux sont en recherche, pas « bientôt »', () => {
  const channels = buildDownloadChannels(undefined, true)
  assert.equal(channels.android.status, 'checking')
  assert.equal(channels.desktop.status, 'checking')
  assert.equal(channels.fallbackUrl, releaseFallbackUrl)
})

test('sans aucune version publiée, tout est « bientôt » et le repli est GitHub', () => {
  const channels = buildDownloadChannels([], false)
  assert.equal(channels.android.status, 'soon')
  assert.equal(channels.android.release, null)
  assert.equal(channels.desktop.status, 'soon')
  assert.equal(channels.desktop.publishedCount, 0)
  assert.deepEqual(channels.desktop.entries.map((entry) => entry.label), ['Windows', 'Linux', 'macOS'])
  assert.ok(channels.desktop.entries.every((entry) => entry.release === null))
})

test('Android publié : disponible ; bureau sans version : bientôt', () => {
  const channels = buildDownloadChannels([android], false)
  assert.equal(channels.android.status, 'available')
  assert.equal(channels.android.release?.url, android.url)
  assert.equal(channels.desktop.status, 'soon')
})

test('une seule version de bureau publiée suffit à ouvrir le canal, ligne par système', () => {
  const channels = buildDownloadChannels([android, linux], false)
  assert.equal(channels.desktop.status, 'available')
  assert.equal(channels.desktop.publishedCount, 1)
  const byLabel = Object.fromEntries(channels.desktop.entries.map((entry) => [entry.label, entry.release?.version ?? null]))
  assert.deepEqual(byLabel, { Windows: null, Linux: '0.9.0', macOS: null })
})

test('une release dépubliée ou sans URL https ne compte pas', () => {
  const disabled = { ...android, enabled: false }
  const insecure = { ...linux, url: 'http://example.com/x' }
  const channels = buildDownloadChannels([disabled, insecure], false)
  assert.equal(channels.android.status, 'soon')
  assert.equal(channels.desktop.status, 'soon')
})

test('le miroir local permet d’afficher une version même pendant une requête en cours', () => {
  const channels = buildDownloadChannels([android], true)
  assert.equal(channels.android.status, 'available')
})

test('date de publication en français, vide si absente ou illisible', () => {
  assert.equal(formatPublishedDate('2026-09-21T14:53:33.000Z'), '21 septembre 2026')
  assert.equal(formatPublishedDate(null), '')
  assert.equal(formatPublishedDate('pas une date'), '')
})

test('ligne de métadonnées : version, taille, date, sans les champs vides', () => {
  assert.equal(releaseMetaLine(android), 'Version 1.0.0 · 83,1 Mo · publiée le 21 septembre 2026')
  assert.equal(releaseMetaLine({ ...android, sizeBytes: 0, publishedAt: null }), 'Version 1.0.0')
})

test('empreinte abrégée : début et fin, complète si courte, vide sinon', () => {
  assert.equal(shortSha(android.sha256), '2804af7c…e11773')
  assert.equal(shortSha('abcdef'), 'abcdef')
  assert.equal(shortSha(''), '')
  assert.equal(shortSha(undefined), '')
})

test('notes de version : lignes et puces deviennent une liste', () => {
  assert.deepEqual(splitReleaseNotes('- Hors ligne\n- Présence QR\n\n• Badges'), ['Hors ligne', 'Présence QR', 'Badges'])
  assert.deepEqual(splitReleaseNotes('Un seul paragraphe.'), ['Un seul paragraphe.'])
  assert.deepEqual(splitReleaseNotes(''), [])
})

test('trois étapes d’installation et une FAQ qui couvre l’avertissement Android et le bureau', () => {
  assert.equal(ANDROID_INSTALL_STEPS.length, 3)
  assert.ok(DOWNLOAD_FAQ.some((item) => /avertissement/i.test(item.question)))
  assert.ok(DOWNLOAD_FAQ.some((item) => /ordinateur/i.test(item.question) && /Windows, Linux, macOS/.test(item.answer)))
})
