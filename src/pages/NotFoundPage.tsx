import { motion } from 'framer-motion'
import { Compass } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import { PageTransition } from '@/components/motion/PageTransition'
import { ActionResult } from '@/components/feedback/ActionResult'
import { useUserRole } from '@/utils/userRole'

export default function NotFoundPage() {
  const { pathname } = useLocation()
  const { authUser } = useUserRole()
  const home = authUser ? (authUser.role === 'ADMIN' || authUser.isSuperAdmin ? '/admin' : '/app') : '/'

  return (
    <PageTransition className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-white to-teal-50 p-6 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="w-full max-w-lg">
        <motion.p
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1, transition: { duration: 0.5 } }}
          className="mb-6 text-center text-[88px] font-black leading-none tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-blue-800 to-teal-500"
        >
          404
        </motion.p>
        <ActionResult
          status="warning"
          layout="screen"
          icon={Compass}
          mascot="search"
          title="Uni a cherché partout…"
          description="Cette page n’existe pas : le lien est peut-être ancien, ou l’adresse a été mal saisie."
          detail={pathname}
          actions={[
            { label: authUser ? 'Retour à mon espace' : 'Retour à l’accueil', to: home },
            { label: 'Nous contacter', to: '/contact', variant: 'secondary' },
          ]}
        />
      </div>
    </PageTransition>
  )
}
