import test from 'node:test'
import assert from 'node:assert/strict'
import { SESSION_KEY, VISITOR_KEY, detectBrowser, detectDevice, detectOs, normalizePath, startSessionIfNeeded, visitorIdFrom } from './metricsModel.ts'

const ANDROID_PHONE = 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0 Mobile Safari/537.36'
const ANDROID_TABLET = 'Mozilla/5.0 (Linux; Android 13; SM-X700) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0 Safari/537.36'
const IPHONE = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1'
const IPAD = 'Mozilla/5.0 (iPad; CPU OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/128.0 Mobile/15E148 Safari/604.1'
const WINDOWS_EDGE = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0 Safari/537.36 Edg/128.0'
const LINUX_FIREFOX = 'Mozilla/5.0 (X11; Linux x86_64; rv:130.0) Gecko/20100101 Firefox/130.0'
const MAC_SAFARI = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_6) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.6 Safari/605.1.15'

test('detectDevice distingue téléphone, tablette et ordinateur', () => {
  assert.equal(detectDevice(ANDROID_PHONE), 'mobile')
  assert.equal(detectDevice(IPHONE), 'mobile')
  assert.equal(detectDevice(ANDROID_TABLET), 'tablet')
  assert.equal(detectDevice(IPAD), 'tablet')
  assert.equal(detectDevice(WINDOWS_EDGE), 'desktop')
  assert.equal(detectDevice(LINUX_FIREFOX), 'desktop')
  assert.equal(detectDevice('', 400), 'mobile')
  assert.equal(detectDevice('', 900), 'tablet')
  assert.equal(detectDevice('', 1400), 'desktop')
  assert.equal(detectDevice(''), 'other')
})

test('detectBrowser et detectOs lisent les principaux agents', () => {
  assert.equal(detectBrowser(WINDOWS_EDGE), 'Edge')
  assert.equal(detectBrowser(LINUX_FIREFOX), 'Firefox')
  assert.equal(detectBrowser(ANDROID_PHONE), 'Chrome')
  assert.equal(detectBrowser(MAC_SAFARI), 'Safari')
  assert.equal(detectBrowser(IPAD), 'Chrome')
  assert.equal(detectBrowser(''), '')
  assert.equal(detectOs(WINDOWS_EDGE), 'Windows')
  assert.equal(detectOs(ANDROID_PHONE), 'Android')
  assert.equal(detectOs(IPHONE), 'iOS')
  assert.equal(detectOs(MAC_SAFARI), 'macOS')
  assert.equal(detectOs(LINUX_FIREFOX), 'Linux')
})

test('normalizePath retire le dièse, la requête et masque les jetons de réinitialisation', () => {
  assert.equal(normalizePath('#/app/emploi-du-temps?x=1'), '/app/emploi-du-temps')
  assert.equal(normalizePath(''), '/')
  assert.equal(normalizePath('#/reinitialiser-mot-de-passe?userId=abc&secret=xyz'), '/reinitialiser-mot-de-passe')
})

test("l'identifiant visiteur est stable et la session ne démarre qu'une fois", () => {
  const map = new Map<string, string>()
  const storage = { getItem: (k: string) => map.get(k) ?? null, setItem: (k: string, v: string) => { map.set(k, v) } }
  const first = visitorIdFrom(storage)
  assert.equal(visitorIdFrom(storage), first)
  assert.equal(map.get(VISITOR_KEY), first)
  map.set(VISITOR_KEY, 'pas valide !!')
  assert.notEqual(visitorIdFrom(storage), 'pas valide !!')
  const session = new Map<string, string>()
  const sessionStorage = { getItem: (k: string) => session.get(k) ?? null, setItem: (k: string, v: string) => { session.set(k, v) } }
  assert.equal(startSessionIfNeeded(sessionStorage), true)
  assert.equal(startSessionIfNeeded(sessionStorage), false)
  assert.ok(session.get(SESSION_KEY))
  assert.equal(startSessionIfNeeded(undefined), true)
})
