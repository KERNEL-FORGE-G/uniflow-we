import { ShieldOff } from 'lucide-react'
import { PageTransition } from '@/components/motion/PageTransition'
import { ActionResult } from '@/components/feedback/ActionResult'
import { useUserRole } from '@/utils/userRole'

/**
 * Affiché quand une garde de route refuse l'accès : rôle insuffisant, ou
 * espace réservé à l'autre type de compte. Dire pourquoi évite le symptôme
 * « je clique et rien ne se passe » des redirections silencieuses.
 */
export default function AccessDeniedPage({ reason }: { reason?: string }) {
  const { currentUser, authUser } = useUserRole()
  const home = authUser?.role === 'ADMIN' || authUser?.isSuperAdmin ? '/admin' : '/app'

  return (
    <PageTransition className="flex min-h-[70vh] items-center justify-center p-6">
      <ActionResult
        status="error"
        layout="screen"
        icon={ShieldOff}
        title="Accès refusé"
        description={reason ?? `Cet écran n’est pas ouvert à votre compte (${currentUser.roleLabel}).`}
        actions={[
          { label: 'Retour à mon espace', to: home },
          { label: 'Mon profil', to: '/app/profil', variant: 'secondary' },
        ]}
      />
    </PageTransition>
  )
}
