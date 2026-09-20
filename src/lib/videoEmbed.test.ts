import test from 'node:test'
import assert from 'node:assert/strict'
import { isYouTubeId, youtubeEmbedUrl, youtubeIdFrom, youtubeThumbnailUrl, youtubeWatchUrl } from './videoEmbed.ts'

const ID = 'cIXm0cJJH18'

test('identifiant YouTube : 11 caractères URL-safe', () => {
  assert.equal(isYouTubeId(ID), true)
  assert.equal(isYouTubeId('trop-court'), false)
  assert.equal(isYouTubeId('avec espace!'), false)
})

test('extraction depuis les formes d’URL usuelles', () => {
  assert.equal(youtubeIdFrom(ID), ID)
  assert.equal(youtubeIdFrom(`https://youtu.be/${ID}`), ID)
  assert.equal(youtubeIdFrom(`https://www.youtube.com/watch?v=${ID}&t=12`), ID)
  assert.equal(youtubeIdFrom(`https://www.youtube-nocookie.com/embed/${ID}?rel=0`), ID)
  assert.equal(youtubeIdFrom(`https://youtube.com/shorts/${ID}`), ID)
  assert.equal(youtubeIdFrom('https://vimeo.com/12345'), null)
  assert.equal(youtubeIdFrom('n’importe quoi'), null)
})

test('vignette sur i.ytimg.com (autorisée par la CSP img-src)', () => {
  assert.equal(youtubeThumbnailUrl(ID), `https://i.ytimg.com/vi/${ID}/hqdefault.jpg`)
  assert.equal(youtubeThumbnailUrl(ID, 'maxresdefault'), `https://i.ytimg.com/vi/${ID}/maxresdefault.jpg`)
})

test('embed sans cookies, autoplay uniquement à la demande', () => {
  const idle = new URL(youtubeEmbedUrl(ID))
  assert.equal(idle.origin, 'https://www.youtube-nocookie.com')
  assert.equal(idle.pathname, `/embed/${ID}`)
  assert.equal(idle.searchParams.get('rel'), '0')
  assert.equal(idle.searchParams.get('autoplay'), null)
  const playing = new URL(youtubeEmbedUrl(ID, { autoplay: true, start: 42.7 }))
  assert.equal(playing.searchParams.get('autoplay'), '1')
  assert.equal(playing.searchParams.get('start'), '42')
})

test('lien de repli « Regarder sur YouTube »', () => {
  assert.equal(youtubeWatchUrl(ID), `https://www.youtube.com/watch?v=${ID}`)
})
