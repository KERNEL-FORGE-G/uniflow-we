import test from 'node:test'
import assert from 'node:assert/strict'
import {
  DESKTOP_PLATFORMS,
  RELEASE_PLATFORMS,
  emptyReleaseForm,
  findDesktopRelease,
  findRelease,
  formatSize,
  isValidReleaseUrl,
  isValidSha256,
  parseSizeInput,
  readCachedReleases,
  releaseCaption,
  releaseFallbackUrl,
  releaseFormFrom,
  releaseFormProblem,
  type AppRelease,
} from './appReleasesModel.ts'

const android: AppRelease = {
  platform: 'android',
  version: '1.2.0',
  url: 'https://github.com/KERNEL-FORGE-G/uniflow-apps/releases/download/v1.2.0/uniflow-1.2.0-arm64-v8a.apk',
  fileName: 'uniflow-1.2.0-arm64-v8a.apk',
  sizeBytes: 44355174,
  sha256: '',
  notes: '',
  publishedAt: '2026-09-21T14:00:00.000Z',
  enabled: true,
  updatedAt: null,
}

test('la page des releases GitHub est la destination de repli', () => {
  assert.equal(releaseFallbackUrl, 'https://github.com/KERNEL-FORGE-G/uniflow-apps/releases')
  assert.equal(isValidReleaseUrl(releaseFallbackUrl), true)
})

test('plateformes : Android en premier, desktop = Windows, Linux, macOS', () => {
  assert.deepEqual([...RELEASE_PLATFORMS], ['android', 'windows', 'linux', 'macos'])
  assert.deepEqual(DESKTOP_PLATFORMS, ['windows', 'linux', 'macos'])
})

test('isValidReleaseUrl : même règle que la Function (https absolu, hôte présent)', () => {
  assert.equal(isValidReleaseUrl('https://example.org/app.apk'), true)
  assert.equal(isValidReleaseUrl('http://example.org/app.apk'), false)
  assert.equal(isValidReleaseUrl('example.org/app.apk'), false)
  assert.equal(isValidReleaseUrl('https://'), false)
  assert.equal(isValidReleaseUrl(''), false)
  assert.equal(isValidReleaseUrl(null), false)
})

test('isValidSha256 : 64 hexadécimaux ou vide', () => {
  assert.equal(isValidSha256(''), true)
  assert.equal(isValidSha256('A'.repeat(64)), true)
  assert.equal(isValidSha256('a'.repeat(63)), false)
  assert.equal(isValidSha256('z'.repeat(64)), false)
})

test('formatSize : « 42,3 Mo » en base 1024, vide si inconnue', () => {
  assert.equal(formatSize(44355174), '42,3 Mo')
  assert.equal(formatSize(30 * 1024 * 1024), '30 Mo')
  assert.equal(formatSize(1536), '2 Ko')
  assert.equal(formatSize(512), '512 o')
  assert.equal(formatSize(1.5 * 1024 ** 3), '1,5 Go')
  assert.equal(formatSize(0), '')
  assert.equal(formatSize(-5), '')
  assert.equal(formatSize(null), '')
  assert.equal(formatSize(undefined), '')
  assert.equal(formatSize(Number.NaN), '')
})

test('parseSizeInput : octets, « 42,3 Mo », « 35.4 MB », espaces de milliers ; null si illisible', () => {
  assert.equal(parseSizeInput('44355174'), 44355174)
  assert.equal(parseSizeInput('44 355 174'), 44355174)
  assert.equal(parseSizeInput('42,3 Mo'), Math.round(42.3 * 1024 * 1024))
  assert.equal(parseSizeInput('35.4 MB'), Math.round(35.4 * 1024 * 1024))
  assert.equal(parseSizeInput('512 Ko'), 512 * 1024)
  assert.equal(parseSizeInput('1,5 Go'), Math.round(1.5 * 1024 ** 3))
  assert.equal(parseSizeInput('12mio'), 12 * 1024 * 1024)
  assert.equal(parseSizeInput(''), 0)
  assert.equal(parseSizeInput(undefined), 0)
  assert.equal(parseSizeInput('douze Mo'), null)
  assert.equal(parseSizeInput('12 parsecs'), null)
  assert.equal(parseSizeInput('-3 Mo'), null)
})

test('formatSize ∘ parseSizeInput redonne la saisie affichée', () => {
  assert.equal(formatSize(parseSizeInput('42,3 Mo') ?? 0), '42,3 Mo')
  assert.equal(formatSize(parseSizeInput('28,8 Mo') ?? 0), '28,8 Mo')
})

test('findRelease : publiée et URL valide seulement ; findDesktopRelease suit l’ordre Windows → Linux → macOS', () => {
  const linux: AppRelease = { ...android, platform: 'linux', url: 'https://example.org/uniflow.AppImage' }
  const macos: AppRelease = { ...android, platform: 'macos', url: 'https://example.org/uniflow.dmg' }
  const windowsDisabled: AppRelease = { ...android, platform: 'windows', url: 'https://example.org/setup.exe', enabled: false }
  const releases = [android, windowsDisabled, macos, linux]

  assert.equal(findRelease(releases, 'android'), android)
  assert.equal(findRelease(releases, 'windows'), null)
  assert.equal(findRelease([{ ...android, url: 'http://insecure.example/x.apk' }], 'android'), null)
  assert.equal(findRelease(undefined, 'android'), null)
  assert.equal(findDesktopRelease(releases), linux)
  assert.equal(findDesktopRelease([android]), null)
})

test('releaseCaption : « Version 1.2.0 · 42,3 Mo », sans taille si inconnue', () => {
  assert.equal(releaseCaption(android), 'Version 1.2.0 · 42,3 Mo')
  assert.equal(releaseCaption({ ...android, sizeBytes: 0 }), 'Version 1.2.0')
  assert.equal(releaseCaption({ ...android, version: '', sizeBytes: 0 }), '')
})

test('releaseFormFrom / releaseFormProblem : pré-remplissage et mêmes refus que la Function', () => {
  const form = releaseFormFrom(android)
  assert.deepEqual(form, { url: android.url, version: '1.2.0', fileName: android.fileName, size: '44355174', sha256: '', notes: '', enabled: true })
  assert.equal(releaseFormProblem(form), null)
  assert.deepEqual(releaseFormFrom(null), emptyReleaseForm)
  assert.match(releaseFormProblem(emptyReleaseForm) ?? '', /version/)
  assert.match(releaseFormProblem({ ...form, version: 'v'.repeat(33) }) ?? '', /32/)
  assert.match(releaseFormProblem({ ...form, url: 'http://example.org/x.apk' }) ?? '', /https/)
  assert.match(releaseFormProblem({ ...form, size: 'beaucoup' }) ?? '', /Taille/)
  assert.equal(releaseFormProblem({ ...form, size: '42,3 Mo' }), null)
  assert.equal(releaseFormProblem({ ...form, size: '' }), null)
  assert.match(releaseFormProblem({ ...form, sha256: 'abc' }) ?? '', /SHA-256/)
})

test('readCachedReleases : miroir local assaini (plateformes inconnues écartées), null si absent ou corrompu', () => {
  const stored = JSON.stringify([android, { ...android, platform: 'ios' }, { platform: 'windows', version: '0.9', url: 'https://example.org/w.exe' }])
  const list = readCachedReleases({ getItem: () => stored })
  assert.deepEqual(list?.map((release) => release.platform), ['android', 'windows'])
  assert.equal(list?.[1].sizeBytes, 0)
  assert.equal(list?.[1].enabled, true)
  assert.equal(readCachedReleases({ getItem: () => null }), null)
  assert.equal(readCachedReleases({ getItem: () => '{oups' }), null)
  assert.equal(readCachedReleases(undefined), null)
})
