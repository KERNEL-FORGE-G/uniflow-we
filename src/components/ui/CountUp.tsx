import { animate, useInView, useReducedMotion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'

/**
 * Compteur qui monte jusqu'à sa valeur quand il entre dans l'écran. Une
 * nouvelle valeur (rafraîchissement des chiffres) repart de l'ancienne, pas de
 * zéro, pour ne pas faire clignoter la page.
 */
export function CountUp({ value, duration = 1.4, suffix = '', className }: { value: number; duration?: number; suffix?: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '0px 0px -10% 0px' })
  const reduced = useReducedMotion() ?? false
  const [shown, setShown] = useState(0)
  const previous = useRef(0)

  useEffect(() => {
    if (!inView) return
    if (reduced) { setShown(value); previous.current = value; return }
    const controls = animate(previous.current, value, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (latest) => setShown(Math.round(latest)),
      onComplete: () => { previous.current = value },
    })
    return () => controls.stop()
  }, [inView, value, duration, reduced])

  return (
    <span ref={ref} className={className} aria-label={`${value.toLocaleString('fr-FR')}${suffix}`}>
      {shown.toLocaleString('fr-FR')}{suffix}
    </span>
  )
}

export default CountUp
