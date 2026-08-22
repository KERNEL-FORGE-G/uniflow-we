import { useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Environment, useAnimations, useGLTF } from '@react-three/drei'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { BookOpen, CalendarDays, ChevronRight, MessageCircle, Sparkles, X } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import type { Group } from 'three'

type CompanionAction = {
  label: string
  description: string
  to: string
  icon: typeof BookOpen
}

const companionActions: CompanionAction[] = [
  { label: 'Mes cours', description: 'Retrouver vos matières synchronisées', to: '/app/cours', icon: BookOpen },
  { label: 'Mon planning', description: 'Consulter la grille de la semaine', to: '/app/emploi-du-temps', icon: CalendarDays },
  { label: 'Centre d’aide', description: 'Trouver un guide UniFlow', to: '/app/aide', icon: MessageCircle },
]

function contextMessage(pathname: string) {
  if (pathname.includes('/cours')) return 'Je suis là pour vous aider à retrouver vos matières et à reprendre votre progression.'
  if (pathname.includes('/emploi-du-temps')) return 'Votre grille reste votre espace de concentration. Je suis disponible depuis les autres écrans.'
  if (pathname.includes('/notes')) return 'Vous pouvez consulter vos évaluations et leur moyenne dans cet espace.'
  if (pathname.includes('/devoirs')) return 'Organisez vos tâches au fur et à mesure de leur création dans votre espace UniFlow.'
  return 'Bonjour, je suis Nova, votre compagnon UniFlow. Je peux vous orienter vers vos cours, votre planning ou le centre d’aide.'
}

function AnimatedCharacter({ reducedMotion, active }: { reducedMotion: boolean; active: boolean }) {
  const group = useRef<Group>(null)
  const modelAsset = useGLTF('/assets/kaykit-companion/manny_med_mod.gltf')
  const animationAsset = useGLTF('/assets/kaykit-companion/Med_General.glb')
  const character = useMemo(() => modelAsset.scene.clone(), [modelAsset.scene])
  const { actions } = useAnimations(animationAsset.animations, group)

  useEffect(() => {
    const names = Object.keys(actions)
    const preferred = active
      ? names.find((name) => /wave|greet|interact/i.test(name))
      : names.find((name) => /idle/i.test(name))
    const action = actions[preferred ?? names[0]]
    if (!action) return
    action.reset().fadeIn(0.18).play()
    return () => { action.fadeOut(0.18) }
  }, [actions, active])

  useFrame(({ clock }) => {
    if (!group.current || reducedMotion) return
    group.current.rotation.y = Math.sin(clock.getElapsedTime() * 0.65) * 0.13
  })

  return <group ref={group} position={[0, -1.15, 0]} scale={1.2}><primitive object={character} /></group>
}

function CompanionScene({ active, reducedMotion }: { active: boolean; reducedMotion: boolean }) {
  return (
    <Canvas
      dpr={[1, 1.5]}
      camera={{ position: [0, 0.65, 3.1], fov: 35 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'low-power' }}
      style={{ pointerEvents: 'none' }}
      aria-hidden="true"
    >
      <ambientLight intensity={1.8} />
      <directionalLight position={[3, 4, 3]} intensity={2.4} color="#cbd8ff" />
      <directionalLight position={[-3, 1, 2]} intensity={1.3} color="#22d3ee" />
      <AnimatedCharacter active={active} reducedMotion={reducedMotion} />
      <Environment preset="city" />
    </Canvas>
  )
}

export function CompanionAssistant() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const reduceMotion = useReducedMotion() ?? false
  const [isOpen, setIsOpen] = useState(false)

  // La route emploi du temps doit continuer à n’afficher que la grille hebdomadaire.
  if (pathname === '/app/emploi-du-temps') return null

  const message = contextMessage(pathname)

  return (
    <div className="fixed bottom-4 right-4 z-40 flex flex-col items-end gap-3 sm:bottom-6 sm:right-6">
      <AnimatePresence>
        {isOpen && (
          <motion.aside
            initial={reduceMotion ? false : { opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            aria-label="Assistant Nova"
            className="w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-[#c7d2fe] bg-white shadow-[0_18px_48px_rgba(15,23,42,0.22)]"
          >
            <div className="flex items-center justify-between bg-gradient-to-r from-[#172554] via-[#1e3a8a] to-[#0f766e] px-4 py-3 text-white">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/15"><Sparkles className="h-4 w-4" /></span>
                <div>
                  <p className="text-sm font-bold">Nova</p>
                  <p className="text-[11px] text-cyan-100">Compagnon UniFlow</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="rounded-lg p-1.5 text-white/80 transition hover:bg-white/15 hover:text-white" aria-label="Fermer l’assistant">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-3 p-4">
              <p className="text-sm leading-6 text-[#334155]">{message}</p>
              <div className="space-y-1.5">
                {companionActions.map((action) => {
                  const Icon = action.icon
                  return (
                    <button
                      key={action.to}
                      onClick={() => { navigate(action.to); setIsOpen(false) }}
                      className="flex w-full items-center gap-3 rounded-xl border border-[#e2e8f0] px-3 py-2.5 text-left transition hover:border-[#93c5fd] hover:bg-[#f8fbff]"
                    >
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#eff6ff] text-[#1d4ed8]"><Icon className="h-4 w-4" /></span>
                      <span className="min-w-0 flex-1"><span className="block text-xs font-bold text-[#1e293b]">{action.label}</span><span className="block truncate text-[11px] text-[#64748b]">{action.description}</span></span>
                      <ChevronRight className="h-4 w-4 text-[#94a3b8]" />
                    </button>
                  )
                })}
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      <button
        onClick={() => setIsOpen((value) => !value)}
        aria-label={isOpen ? 'Fermer Nova, compagnon UniFlow' : 'Ouvrir Nova, compagnon UniFlow'}
        aria-expanded={isOpen}
        className="group relative flex h-[82px] w-[82px] items-center justify-center overflow-hidden rounded-2xl border border-[#93c5fd] bg-[radial-gradient(circle_at_50%_30%,#ecfeff_0%,#dbeafe_43%,#1e3a8a_100%)] shadow-[0_10px_28px_rgba(30,58,138,0.32)] transition hover:-translate-y-0.5 hover:shadow-[0_16px_32px_rgba(30,58,138,0.4)] focus:outline-none focus:ring-4 focus:ring-[#93c5fd]"
      >
        <CompanionScene active={isOpen} reducedMotion={reduceMotion} />
        <span className="absolute bottom-1.5 rounded-md bg-[#0f172a]/75 px-1.5 py-0.5 text-[9px] font-bold tracking-wide text-white">NOVA</span>
      </button>
    </div>
  )
}

useGLTF.preload('/assets/kaykit-companion/manny_med_mod.gltf')
useGLTF.preload('/assets/kaykit-companion/Med_General.glb')
