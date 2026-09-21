import test from 'node:test'
import assert from 'node:assert/strict'
import {
  RELEASE_PLATFORMS,
  ReleaseValidationError,
  isValidReleaseUrl,
  isValidSha256,
  normalizeRelease,
  releaseView,
  visibleReleases,
} from './app-releases.js'

const SHA = 'a'.repeat(64)
const FIXED_NOW = () => new Date('2026-09-21T14:00:00.000Z')

const valid = {
  platform: 'android',
  version: '1.2.0',
  url: 'https://github.com/KERNEL-FORGE-G/uniflow-apps/releases/download/v1.2.0/uniflow-1.2.0-arm64-v8a.apk',
  fileName: 'uniflow-1.2.0-arm64-v8a.apk',
  sizeBytes: 44355174,
  sha256: SHA.toUpperCase(),
  notes: 'Première version publique.',
}

test('les quatre plateformes sont dans l’ordre d’affichage, Android en tête', () => {
  assert.deepEqual(RELEASE_PLATFORMS, ['android', 'windows', 'linux', 'macos'])
})

test('isValidReleaseUrl : https absolu uniquement', () => {
  assert.equal(isValidReleaseUrl('https://github.com/KERNEL-FORGE-G/uniflow-apps/releases'), true)
  assert.equal(isValidReleaseUrl('  https://example.org/app.apk  '), true)
  assert.equal(isValidReleaseUrl('http://github.com/x.apk'), false)
  assert.equal(isValidReleaseUrl('github.com/x.apk'), false)
  assert.equal(isValidReleaseUrl('javascript:alert(1)'), false)
  assert.equal(isValidReleaseUrl('https://'), false)
  assert.equal(isValidReleaseUrl(''), false)
  assert.equal(isValidReleaseUrl(undefined), false)
  assert.equal(isValidReleaseUrl(`https://example.org/${'a'.repeat(1100)}`), false)
})

test('isValidSha256 : 64 hexadécimaux, ou vide', () => {
  assert.equal(isValidSha256(''), true)
  assert.equal(isValidSha256(undefined), true)
  assert.equal(isValidSha256(SHA), true)
  assert.equal(isValidSha256(SHA.toUpperCase()), true)
  assert.equal(isValidSha256(SHA.slice(1)), false)
  assert.equal(isValidSha256(`${SHA.slice(1)}g`), false)
})

test('normalizeRelease : entrée valide normalisée (sha en minuscules, date par défaut, publié)', () => {
  const release = normalizeRelease(valid, { now: FIXED_NOW })
  assert.deepEqual(release, {
    platform: 'android',
    version: '1.2.0',
    url: valid.url,
    fileName: valid.fileName,
    sizeBytes: 44355174,
    sha256: SHA,
    notes: 'Première version publique.',
    publishedAt: '2026-09-21T14:00:00.000Z',
    enabled: true,
  })
})

test('normalizeRelease : champs facultatifs absents → vides, taille 0, plateforme insensible à la casse', () => {
  const release = normalizeRelease({ platform: ' Windows ', version: '0.9.0', url: 'https://example.org/setup.exe' }, { now: FIXED_NOW })
  assert.equal(release.platform, 'windows')
  assert.equal(release.fileName, '')
  assert.equal(release.sizeBytes, 0)
  assert.equal(release.sha256, '')
  assert.equal(release.notes, '')
  assert.equal(release.enabled, true)
})

test('normalizeRelease : taille et date acceptées sous forme de chaînes, enabled sous forme de chaîne', () => {
  const release = normalizeRelease({ ...valid, sizeBytes: '1024', publishedAt: '2026-09-20T10:00:00Z', enabled: 'false' })
  assert.equal(release.sizeBytes, 1024)
  assert.equal(release.publishedAt, '2026-09-20T10:00:00.000Z')
  assert.equal(release.enabled, false)
  assert.equal(normalizeRelease({ ...valid, enabled: false }).enabled, false)
  assert.equal(normalizeRelease({ ...valid, enabled: 'true' }).enabled, true)
})

test('normalizeRelease : refus lisibles, code RELEASE_INVALID', () => {
  const cases = [
    [{ ...valid, platform: 'ios' }, /Plateforme inconnue/],
    [{ ...valid, platform: '' }, /Plateforme inconnue/],
    [{ ...valid, version: '   ' }, /version est requise/],
    [{ ...valid, version: 'v'.repeat(33) }, /dépasse 32/],
    [{ ...valid, url: 'http://github.com/x.apk' }, /https:\/\//],
    [{ ...valid, url: '' }, /https:\/\//],
    [{ ...valid, sizeBytes: -1 }, /taille/],
    [{ ...valid, sizeBytes: 12.5 }, /taille/],
    [{ ...valid, sizeBytes: 'douze' }, /taille/],
    [{ ...valid, sha256: 'abc' }, /SHA-256/],
    [{ ...valid, notes: 'n'.repeat(2001) }, /notes dépassent/],
    [{ ...valid, fileName: 'f'.repeat(256) }, /nom de fichier/],
    [{ ...valid, publishedAt: 'hier' }, /date de publication/],
  ]
  for (const [input, expected] of cases) {
    assert.throws(() => normalizeRelease(input), (exception) => {
      assert.ok(exception instanceof ReleaseValidationError, `instance attendue pour ${JSON.stringify(input)}`)
      assert.equal(exception.code, 'RELEASE_INVALID')
      assert.match(exception.message, expected)
      return true
    })
  }
  assert.throws(() => normalizeRelease(null), ReleaseValidationError)
})

test('releaseView : vue client sans métadonnées Appwrite, plateforme repliée sur $id', () => {
  const view = releaseView({
    $id: 'android',
    $permissions: ['read("any")'],
    $updatedAt: '2026-09-21T14:05:00.000+00:00',
    version: '1.2.0',
    url: valid.url,
    sizeBytes: 44355174,
    enabled: true,
  })
  assert.deepEqual(view, {
    platform: 'android',
    version: '1.2.0',
    url: valid.url,
    fileName: '',
    sizeBytes: 44355174,
    sha256: '',
    notes: '',
    publishedAt: null,
    enabled: true,
    updatedAt: '2026-09-21T14:05:00.000+00:00',
  })
  assert.equal(releaseView(null), null)
})

test('visibleReleases : le public ne voit que les releases publiées, le superadmin toutes ; tri Android d’abord', () => {
  const documents = [
    { $id: 'macos', platform: 'macos', version: '1.0.0', url: 'https://example.org/m.dmg', enabled: true },
    { $id: 'android', platform: 'android', version: '1.2.0', url: valid.url, enabled: true },
    { $id: 'windows', platform: 'windows', version: '0.9.0', url: 'https://example.org/w.exe', enabled: false },
    { $id: 'ios', platform: 'ios', version: '1.0.0', url: 'https://example.org/i', enabled: true },
  ]
  assert.deepEqual(visibleReleases(documents).map((release) => release.platform), ['android', 'macos'])
  assert.deepEqual(visibleReleases(documents, { includeDisabled: true }).map((release) => release.platform), ['android', 'windows', 'macos'])
  assert.deepEqual(visibleReleases(undefined), [])
})
