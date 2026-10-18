import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Sparkles, User, Code2, ArrowRight, X, CheckCircle2 } from 'lucide-react'
import {
  setCreatorInterfacePreference,
  type CreatorInterfaceMode,
} from '@/lib/teamMemberAuth'
import { UniMascot } from '../mascot/UniMascot'

interface CreatorModeSwitchModalProps {
  isOpen: boolean
  onClose: () => void
  currentMode?: CreatorInterfaceMode
  memberName?: string
}

export function CreatorModeSwitchModal({
  isOpen,
  onClose,
  currentMode = 'standard',
  memberName,
}: CreatorModeSwitchModalProps) {
  const navigate = useNavigate()
  const [remember, setRemember] = useState(true)

  if (!isOpen) return null

  const handleSelectMode = (mode: CreatorInterfaceMode) => {
    setCreatorInterfacePreference(mode)
    if (remember) {
      localStorage.setItem('uniflow_creator_prompt_dismissed', 'true')
    }
    onClose()
    if (mode === 'member') {
      navigate('/app/membre')
    } else {
      navigate('/app')
    }
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-white/20 bg-gradient-to-b from-slate-900 via-[#0B132B] to-[#1E3A8A] p-6 sm:p-8 text-white shadow-2xl"
        >
          {/* Halos décoratifs */}
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-cyan-500/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-blue-600/25 blur-3xl" />

          {/* Bouton fermeture */}
          <button
            type="button"
            onClick={onClose}
            className="absolute right-5 top-5 rounded-full p-2 text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
            aria-label="Fermer"
          >
            <X className="h-5 w-5" />
          </button>

          {/* En-tête avec Mascotte et Badge */}
          <div className="relative flex items-center gap-4 mb-6">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 shadow-lg shadow-amber-500/30">
              <Sparkles className="h-7 w-7 text-slate-950" />
            </div>
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-400/20 px-3 py-1 text-xs font-black uppercase tracking-wider text-amber-300 border border-amber-400/30">
                ★ Bâtisseur KERNEL FORGE
              </span>
              <h2 className="mt-1 text-2xl font-black text-white sm:text-3xl">
                {memberName ? `Ravi de vous revoir, ${memberName.split(' ')[0]} !` : 'Bienvenue, Bâtisseur !'}
              </h2>
              <p className="mt-1 text-xs sm:text-sm text-slate-300">
                Votre compte est reconnu comme l'un des créateurs du projet UniFlow. Choisissez l'expérience à utiliser :
              </p>
            </div>
          </div>

          {/* Choix des 2 interfaces */}
          <div className="grid gap-4 sm:grid-cols-2 my-6">
            {/* Option 1 : Interface Standard */}
            <motion.div
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleSelectMode('standard')}
              className={`cursor-pointer rounded-2xl border p-5 transition-all flex flex-col justify-between ${
                currentMode === 'standard'
                  ? 'border-cyan-400 bg-white/15 shadow-lg shadow-cyan-500/10'
                  : 'border-white/10 bg-white/5 hover:border-white/25 hover:bg-white/10'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/20 text-blue-300 border border-blue-400/30">
                    <User className="h-5 w-5" />
                  </div>
                  {currentMode === 'standard' && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-cyan-300 bg-cyan-950/60 px-2 py-0.5 rounded-full border border-cyan-400/30">
                      <CheckCircle2 className="h-3 w-3" /> Actif
                    </span>
                  )}
                </div>
                <h3 className="text-base font-black text-white">Interface Utilisateur Standard</h3>
                <p className="mt-2 text-xs text-slate-300 leading-relaxed">
                  Accédez à votre espace étudiant ou universitaire normal : emploi du temps, cours, devoirs, émargements QR et messagerie campus.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs font-bold text-cyan-300">
                <span>Ouvrir le portail standard</span>
                <ArrowRight className="h-4 w-4" />
              </div>
            </motion.div>

            {/* Option 2 : Interface Membre Créateur */}
            <motion.div
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleSelectMode('member')}
              className={`cursor-pointer rounded-2xl border p-5 transition-all flex flex-col justify-between ${
                currentMode === 'member'
                  ? 'border-amber-400 bg-white/15 shadow-lg shadow-amber-500/10'
                  : 'border-white/10 bg-white/5 hover:border-amber-400/40 hover:bg-white/10'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/20 text-amber-300 border border-amber-400/30">
                    <Code2 className="h-5 w-5" />
                  </div>
                  {currentMode === 'member' && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-300 bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-400/30">
                      <CheckCircle2 className="h-3 w-3" /> Actif
                    </span>
                  )}
                </div>
                <h3 className="text-base font-black text-white">Mon Espace Membre Bâtisseur</h3>
                <p className="mt-2 text-xs text-slate-300 leading-relaxed">
                  Gérez votre fiche officielle de créateur : chargez vous-même votre photo, personnalisez vos stacks technologiques et actualisez votre profil public.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs font-bold text-amber-300">
                <span>Gérer ma photo & mes stacks</span>
                <ArrowRight className="h-4 w-4" />
              </div>
            </motion.div>
          </div>

          {/* Bas de boîte de dialogue */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-white/10 text-xs text-slate-400">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="rounded border-white/20 bg-white/10 text-[#0d9488] focus:ring-0"
              />
              <span>Se souvenir de mon choix (modifiable à tout moment)</span>
            </label>
            <span className="text-[11px] text-slate-400">
              Changement de mode accessible depuis votre profil
            </span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
