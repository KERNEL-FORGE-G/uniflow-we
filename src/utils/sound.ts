// Web Audio API sound synthesizer for UniFlow UI feedback

let audioCtx: AudioContext | null = null

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext
    if (AudioContextClass) {
      audioCtx = new AudioContextClass()
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {})
  }
  return audioCtx
}

let isMuted = false

export function setSoundMuted(muted: boolean) {
  isMuted = muted
}

export function getSoundMuted(): boolean {
  return isMuted
}

/**
 * Sound played on button click or interactive element tap
 */
export function playClickSound() {
  if (isMuted) return
  const ctx = getAudioContext()
  if (!ctx) return

  try {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'sine'
    osc.frequency.setValueAtTime(580, ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(320, ctx.currentTime + 0.05)

    gain.gain.setValueAtTime(0.09, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start()
    osc.stop(ctx.currentTime + 0.05)
  } catch {}
}

/**
 * Sound played when an action succeeds (bright 3-note ascending arpeggio)
 */
export function playSuccessSound() {
  if (isMuted) return
  const ctx = getAudioContext()
  if (!ctx) return

  try {
    const now = ctx.currentTime
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'sine'
    osc.frequency.setValueAtTime(523.25, now)        // C5
    osc.frequency.setValueAtTime(659.25, now + 0.07)  // E5
    osc.frequency.setValueAtTime(783.99, now + 0.14)  // G5

    gain.gain.setValueAtTime(0.1, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.32)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start(now)
    osc.stop(now + 0.32)
  } catch {}
}

/**
 * Sound played when an action fails / error occurs (subtle descending tone)
 */
export function playErrorSound() {
  if (isMuted) return
  const ctx = getAudioContext()
  if (!ctx) return

  try {
    const now = ctx.currentTime
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'triangle'
    osc.frequency.setValueAtTime(320, now)
    osc.frequency.setValueAtTime(220, now + 0.1)

    gain.gain.setValueAtTime(0.12, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start(now)
    osc.stop(now + 0.28)
  } catch {}
}

/**
 * Initialize global event listener for all button clicks
 */
export function initGlobalSoundListeners() {
  if (typeof window === 'undefined') return

  const handleGlobalClick = (event: MouseEvent) => {
    const target = event.target as HTMLElement | null
    if (!target) return

    const clickable = target.closest('button, a, input[type="button"], input[type="submit"], [role="button"]')
    if (clickable) {
      playClickSound()
    }
  }

  window.addEventListener('click', handleGlobalClick, { capture: true })
}
