import test from 'node:test'
import assert from 'node:assert/strict'
import { adminSeries, applyHit, counterPayload, dayKey, emptyDaily, lastDays, publicSummary, sanitizeHit, sumDaily } from './metrics.js'

test('dayKey suit le jour civil du Cameroun', () => {
  // 23 h 30 UTC = 00 h 30 le lendemain à Douala (UTC+1).
  assert.equal(dayKey(new Date('2026-09-20T23:30:00Z')), '2026-09-21')
  assert.equal(dayKey(new Date('2026-09-20T22:30:00Z')), '2026-09-20')
})

test('lastDays renvoie une série continue terminée par aujourd\'hui', () => {
  const days = lastDays(3, new Date('2026-09-21T12:00:00Z'))
  assert.deepEqual(days, ['2026-09-19', '2026-09-20', '2026-09-21'])
})

test('sanitizeHit exige un visiteur et une plateforme valides, et borne le reste', () => {
  assert.throws(() => sanitizeHit({ platform: 'web' }), /HIT_INVALID/)
  assert.throws(() => sanitizeHit({ visitorId: 'abcdefgh', platform: 'tv' }), /HIT_INVALID/)
  assert.throws(() => sanitizeHit({ visitorId: 'trop court', platform: 'web' }), /HIT_INVALID/)
  const hit = sanitizeHit({ visitorId: 'a1b2c3d4-e5f6', platform: 'web', device: 'fridge', path: '/x'.padEnd(300, 'y'), referrer: 'https://google.com', authenticated: 'oui', newSession: false, browser: 'Chrome\u0000' })
  assert.equal(hit.device, 'other')
  assert.equal(hit.path.length, 255)
  assert.equal(hit.authenticated, false)
  assert.equal(hit.newSession, false)
  assert.equal(hit.browser, 'Chrome')
  assert.equal(sanitizeHit({ visitorId: 'a1b2c3d4-e5f6', platform: 'mobile' }).newSession, true)
})

test('applyHit compte pages, sessions, visiteurs uniques, appareils et plateformes', () => {
  const hit = sanitizeHit({ visitorId: 'visiteur-0001', platform: 'desktop', device: 'desktop', authenticated: true })
  let day = applyHit(emptyDaily('2026-09-21'), hit, { firstOfDay: true })
  assert.equal(day.pageViews, 1)
  assert.equal(day.visits, 1)
  assert.equal(day.uniqueVisitors, 1)
  assert.equal(day.deviceDesktop, 1)
  assert.equal(day.platformDesktop, 1)
  assert.equal(day.authenticated, 1)
  // Même visiteur, même session : une page de plus, rien d'autre.
  day = applyHit(day, { ...hit, newSession: false }, { firstOfDay: false })
  assert.equal(day.pageViews, 2)
  assert.equal(day.visits, 1)
  assert.equal(day.uniqueVisitors, 1)
  // Nouvelle session du même visiteur : une visite de plus, pas un visiteur de plus.
  day = applyHit(day, hit, { firstOfDay: false })
  assert.equal(day.visits, 2)
  assert.equal(day.uniqueVisitors, 1)
  // Les métadonnées Appwrite ne sont pas renvoyées à l'écriture.
  const payload = counterPayload({ ...day, $id: '2026-09-21', $createdAt: 'x' })
  assert.equal('$id' in payload, false)
  assert.equal(payload.day, '2026-09-21')
})

test('sumDaily et publicSummary agrègent sans exposer de ligne brute', () => {
  const today = dayKey()
  const days = [
    { ...emptyDaily('2020-01-01'), visits: 5, uniqueVisitors: 4, pageViews: 9, deviceMobile: 3, deviceDesktop: 2, platformWeb: 5 },
    { ...emptyDaily(today), visits: 2, uniqueVisitors: 2, pageViews: 3, deviceMobile: 1, deviceDesktop: 1, platformWeb: 1, platformMobile: 1 },
  ]
  assert.equal(sumDaily(days).visits, 7)
  const summary = publicSummary(days, today)
  assert.equal(summary.totalVisits, 7)
  assert.equal(summary.totalVisitors, 6)
  assert.equal(summary.today.visits, 2)
  assert.equal(summary.last7Days.visits, 2)
  assert.deepEqual(summary.devices, { mobile: 4, tablet: 0, desktop: 3, other: 0 })
  assert.deepEqual(summary.platforms, { web: 6, mobile: 1, desktop: 0 })
  assert.equal(summary.daysTracked, 2)
})

test('adminSeries comble les jours sans visite par des zéros', () => {
  const today = new Date('2026-09-21T12:00:00Z')
  const series = adminSeries([{ ...emptyDaily('2026-09-20'), visits: 3 }], 3, today)
  assert.deepEqual(series.map((d) => [d.day, d.visits]), [['2026-09-19', 0], ['2026-09-20', 3], ['2026-09-21', 0]])
})
