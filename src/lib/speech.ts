/**
 * Synthèse vocale d'Uni (Web Speech API), activable et désactivable depuis
 * la fenêtre de l'assistant. Le choix est mémorisé par navigateur.
 *
 * Les fonctions pures (`speechText`, `pickFrenchVoice`) sont testées avec
 * `node --test` ; `speak` / `stopSpeaking` ne font que piloter
 * `window.speechSynthesis` et se taisent quand l'API manque (Firefox sans
 * voix, WebView sans moteur).
 */

export const VOICE_PREF_KEY = 'uniflow:assistant:voice'

export function loadVoicePreference(storage: Pick<Storage, 'getItem'> | undefined): boolean {
  try { return storage?.getItem(VOICE_PREF_KEY) === '1' } catch { return false }
}

export function saveVoicePreference(storage: Pick<Storage, 'setItem'> | undefined, enabled: boolean) {
  try { storage?.setItem(VOICE_PREF_KEY, enabled ? '1' : '0') } catch { /* stockage indisponible */ }
}

/**
 * Texte à prononcer : le Markdown résiduel (astérisques, dièses, puces), les
 * émojis et les URL nues sont retirés ; « 08:00 » devient « 8 h », plus
 * naturel à l'oreille qu'« zéro huit deux points zéro zéro ».
 */
export function speechText(markdown: string): string {
  return markdown
    .replace(/https?:\/\/\S+/g, '')
    .replace(/[*_`#>]+/g, '')
    .replace(/^\s*[-•]\s+/gm, '')
    .replace(/\p{Extended_Pictographic}/gu, '')
    .replace(/\b0?(\d{1,2}):(\d{2})\b/g, (_, h: string, m: string) => (m === '00' ? `${Number(h)} h` : `${Number(h)} h ${Number(m)}`))
    .replace(/\s+/g, ' ')
    .trim()
}

export type VoiceLike = { lang: string; name: string; default?: boolean; localService?: boolean }

/** Préfère une voix française locale ; à défaut, n'importe quelle voix `fr-*`. */
export function pickFrenchVoice<T extends VoiceLike>(voices: T[]): T | undefined {
  const french = voices.filter((voice) => /^fr([-_]|$)/i.test(voice.lang))
  if (!french.length) return undefined
  const fromFrance = (voice: T) => /^fr[-_]fr$/i.test(voice.lang)
  return french.find((voice) => voice.localService && fromFrance(voice))
    || french.find(fromFrance)
    || french.find((voice) => voice.default)
    || french[0]
}

export function speechSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window && typeof SpeechSynthesisUtterance !== 'undefined'
}

export function stopSpeaking() {
  if (speechSupported()) window.speechSynthesis.cancel()
}

/**
 * Lit `text` ; `onStateChange(true)` au départ, `false` à la fin ou à
 * l'interruption. Retourne `false` si la synthèse est indisponible.
 */
export function speak(text: string, onStateChange?: (speaking: boolean) => void): boolean {
  if (!speechSupported()) return false
  const content = speechText(text)
  if (!content) return false
  const synth = window.speechSynthesis
  synth.cancel()
  const utterance = new SpeechSynthesisUtterance(content)
  utterance.lang = 'fr-FR'
  utterance.rate = 1
  utterance.pitch = 1.05
  const voice = pickFrenchVoice(synth.getVoices())
  if (voice) utterance.voice = voice
  utterance.onstart = () => onStateChange?.(true)
  utterance.onend = () => onStateChange?.(false)
  utterance.onerror = () => onStateChange?.(false)
  synth.speak(utterance)
  return true
}
