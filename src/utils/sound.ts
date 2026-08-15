// Sound design UI UniFlow : feedback discret, contrôlable et accessible.

let audioCtx: AudioContext | null = null
let isMuted = readBooleanPreference('uniflow_sound_muted', false)
let volume = readNumberPreference('uniflow_sound_volume', 0.08, 0, 0.2)

function readBooleanPreference(key: string, fallback: boolean) {
  if (typeof window === 'undefined') return fallback
  return window.localStorage.getItem(key) === 'true'
}

function readNumberPreference(key: string, fallback: number, min: number, max: number) {
  if (typeof window === 'undefined') return fallback
  const value = Number(window.localStorage.getItem(key))
  return Number.isFinite(value) ? Math.min(max, Math.max(min, value)) : fallback
}

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (AudioContextClass) audioCtx = new AudioContextClass()
  }
  if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume().catch(() => {})
  return audioCtx
}

function shouldPlaySound() {
  if (isMuted || volume <= 0 || typeof window === 'undefined') return false
  return window.localStorage.getItem('uniflow_personal_reduced_motion') !== 'true'
}

export function setSoundMuted(muted: boolean) {
  isMuted = muted
  if (typeof window !== 'undefined') window.localStorage.setItem('uniflow_sound_muted', String(muted))
}

export function getSoundMuted() {
  return isMuted
}

export function setSoundVolume(nextVolume: number) {
  volume = Math.min(0.2, Math.max(0, nextVolume))
  if (typeof window !== 'undefined') window.localStorage.setItem('uniflow_sound_volume', String(volume))
}

export function getSoundVolume() {
  return volume
}

function playTone({ type, frequencies, duration, peak }: { type: OscillatorType; frequencies: Array<{ frequency: number; at: number }>; duration: number; peak: number }) {
  if (!shouldPlaySound()) return
  const ctx = getAudioContext()
  if (!ctx) return

  try {
    const now = ctx.currentTime
    const oscillator = ctx.createOscillator()
    const gain = ctx.createGain()
    oscillator.type = type
    frequencies.forEach(({ frequency, at }) => oscillator.frequency.setValueAtTime(frequency, now + at))
    gain.gain.setValueAtTime(Math.min(0.2, peak * (volume / 0.08)), now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration)
    oscillator.connect(gain)
    gain.connect(ctx.destination)
    oscillator.start(now)
    oscillator.stop(now + duration)
  } catch {
    // Le sound design ne doit jamais interrompre une interaction fonctionnelle.
  }
}

export function playClickSound() {
  playTone({ type: 'sine', frequencies: [{ frequency: 580, at: 0 }, { frequency: 320, at: 0.05 }], duration: 0.05, peak: 0.04 })
}

export function playSuccessSound() {
  playTone({ type: 'sine', frequencies: [{ frequency: 523.25, at: 0 }, { frequency: 659.25, at: 0.07 }, { frequency: 783.99, at: 0.14 }], duration: 0.32, peak: 0.06 })
}

export function playErrorSound() {
  playTone({ type: 'triangle', frequencies: [{ frequency: 320, at: 0 }, { frequency: 220, at: 0.1 }], duration: 0.28, peak: 0.07 })
}

export function initGlobalSoundListeners() {
  if (typeof window === 'undefined') return
  const handleGlobalClick = (event: MouseEvent) => {
    const target = event.target as HTMLElement | null
    const clickable = target?.closest('button, a, input[type="button"], input[type="submit"], [role="button"]')
    if (!clickable || clickable.hasAttribute('data-sound-ignore') || clickable.closest('[data-sound-ignore]')) return
    playClickSound()
  }
  window.addEventListener('click', handleGlobalClick, { capture: true })
}
