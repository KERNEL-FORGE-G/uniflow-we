import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { lazy, Suspense, useEffect, useState, type ReactNode } from 'react'
import { AnimatePresence } from 'framer-motion'
import SEOHead from './components/SEOHead'
import { AppLayout } from './components/layout/AppLayout'
import { AdminLayout } from './components/layout/AdminLayout'
import { RoleProvider, useUserRole, type Role } from './utils/userRole'
import { IdleTimer } from './components/IdleTimer'
import { GlobalNetworkToast } from './components/GlobalNetworkToast'
import { Skeleton } from './components/ui/Skeleton'
import { ErrorBoundary } from './components/feedback/ErrorBoundary'
import { UniLoading } from './components/mascot/UniScenes'
import { OfflineBanner } from './components/offline/OfflineBanner'
import { CornerStack, CornerStackProvider } from './components/layout/CornerStack'

// Uni est monté une seule fois, pour le site public comme pour l'espace connecté.
const UniAssistant = lazy(() => import('./components/assistant/UniAssistant').then((module) => ({ default: module.UniAssistant })))
import { trackPageView } from './lib/metrics'
import { PageTransition } from './components/motion/PageTransition'
import { LEGAL_DOCUMENTS } from './data/legal'
import { pushNotificationService } from './services/pushNotificationService'
import { initTheme } from './utils/theme'

// Pages chargées immédiatement (landing, auth)
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import NotFoundPage from './pages/NotFoundPage'
import AccessDeniedPage from './pages/AccessDeniedPage'

// Lazy loading pour les pages de l'app
const DashboardPage = lazy(() => import('./pages/DashboardPage'))
const IndependentWorkspacePage = lazy(() => import('./pages/IndependentWorkspacePage'))
const DashboardCompactPage = lazy(() => import('./pages/DashboardCompactPage'))
const CoursesPage = lazy(() => import('./pages/CoursesPage'))
const CourseDetailPage = lazy(() => import('./pages/CourseDetailPage'))
const ProfilePage = lazy(() => import('./pages/ProfilePage'))
const SchedulePage = lazy(() => import('./pages/SchedulePage'))
const AttendancePage = lazy(() => import('./pages/AttendancePage'))
const NotificationsPage = lazy(() => import('./pages/NotificationsPage'))
const AssignmentsPage = lazy(() => import('./pages/AssignmentsPage'))
const GradesPage = lazy(() => import('./pages/GradesPage'))
const MessagingPage = lazy(() => import('./pages/MessagingPage'))
const SettingsPage = lazy(() => import('./pages/SettingsPage'))
const LibraryPage = lazy(() => import('./pages/LibraryPage'))
const HelpPage = lazy(() => import('./pages/HelpPage'))
const DemoPage = lazy(() => import('./pages/DemoPage'))
const AttendanceManagePage = lazy(() => import('./pages/AttendanceManagePage'))
const TeacherCoursesPage = lazy(() => import('./pages/TeacherCoursesPage'))
const ClassroomsPage = lazy(() => import('./pages/ClassroomsPage'))
const PresentationPage = lazy(() => import('./pages/PresentationPage'))
const AboutPage = lazy(() => import('./pages/AboutPage'))
const PricingPage = lazy(() => import('./pages/PricingPage'))
const DownloadPage = lazy(() => import('./pages/DownloadPage'))
const SubscriptionFlowPage = lazy(() => import('./pages/SubscriptionFlowPage'))
const BillingPage = lazy(() => import('./pages/billing/BillingPage'))
const ContactPage = lazy(() => import('./pages/ContactPage'))
const SentinellePage = lazy(() => import('./pages/SentinellePage'))
const ForumPage = lazy(() => import('./pages/ForumPage'))
const TeamsPage = lazy(() => import('./pages/TeamsPage'))
const LegalDocumentPage = lazy(() => import('./pages/legal/LegalDocumentPage'))
const PromotionPage = lazy(() => import('./pages/PromotionPage'))
const PersonalAccountPage = lazy(() => import('./pages/PersonalAccountPages'))
const ForgotPasswordPage = lazy(() => import('./pages/auth/ForgotPasswordPage'))
const ResetPasswordPage = lazy(() => import('./pages/auth/ResetPasswordPage'))

// Admin pages lazy loaded
const AdminDashboardPage = lazy(() => import('./pages/admin/AdminDashboardPage'))
const AdminUsersPage = lazy(() => import('./pages/admin/AdminUsersPage'))
const AdminCoursesPage = lazy(() => import('./pages/admin/AdminCoursesPage'))
const StudentsPage = lazy(() => import('./pages/admin/StudentsPage'))
const TeachersPage = lazy(() => import('./pages/admin/TeachersPage'))
const AcademicStructurePage = lazy(() => import('./pages/admin/AcademicStructurePage'))
const UEPage = lazy(() => import('./pages/admin/UEPage'))
const AdminClassroomsPage = lazy(() => import('./pages/admin/ClassroomsPage'))
const AdminSettingsPage = lazy(() => import('./pages/admin/AdminSettingsPage'))
const AdminReportsPage = lazy(() => import('./pages/admin/AdminReportsPage'))
const AttendanceHistoryPage = lazy(() => import('./pages/admin/AttendanceHistoryPage'))
const AdminActivityPage = lazy(() => import('./pages/admin/AdminActivityPage'))
const AdminSecurityPage = lazy(() => import('./pages/admin/AdminSecurityPage'))
const AdminPaymentsPage = lazy(() => import('./pages/admin/AdminPaymentsPage'))
const AdminAudiencePage = lazy(() => import('./pages/admin/AdminAudiencePage'))
const AdminTeamPage = lazy(() => import('./pages/admin/AdminTeamPage'))

/**
 * Écran d'attente : squelette immédiat, puis Uni « réfléchit » si l'attente
 * dépasse un instant — un chargement rapide ne doit pas faire clignoter la
 * mascotte, un chargement long ne doit pas laisser un écran gris muet.
 */
function PageLoader() {
  const [slow, setSlow] = useState(false)
  useEffect(() => {
    const timer = window.setTimeout(() => setSlow(true), 450)
    return () => window.clearTimeout(timer)
  }, [])
  return (
    <div className="relative min-h-screen bg-[#f3f4f6] p-6 animate-fade-in dark:bg-slate-950">
      <div className="max-w-[1920px] mx-auto space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
        </div>
        <Skeleton className="h-96" />
      </div>
      {slow && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="rounded-3xl bg-white/85 px-8 shadow-xl backdrop-blur dark:bg-slate-900/85">
            <UniLoading label="Uni prépare la page" size={132} />
          </div>
        </div>
      )}
    </div>
  )
}

/** Compte les pages vues (service `/metrics`) ; doit vivre sous `RoleProvider` pour savoir si la personne est connectée. */
function AudienceTracker() {
  const { pathname } = useLocation()
  const { authUser, isSessionReady } = useUserRole()
  useEffect(() => {
    if (!isSessionReady) return
    void trackPageView(pathname, Boolean(authUser))
  }, [pathname, authUser, isSessionReady])
  return null
}

/**
 * Le rôle ADMIN (et le `superadmin` de la plateforme) a son propre espace :
 * toute redirection « chez soi » passe par ici pour ne pas renvoyer un
 * administrateur vers le tableau de bord étudiant.
 */
function homeOf(user: { role: string; isSuperAdmin?: boolean } | null) {
  if (!user) return '/login'
  return user.role === 'ADMIN' || user.isSuperAdmin ? '/admin' : '/app'
}

function AuthenticatedRoute({ children }: { children: ReactNode }) {
  const { authUser, isSessionReady } = useUserRole()
  const location = useLocation()
  if (!isSessionReady) return <PageLoader />
  return authUser ? <>{children}</> : <Navigate to="/login" replace state={{ from: location.pathname }} />
}

function GuestRoute({ children }: { children: ReactNode }) {
  const { authUser, isSessionReady } = useUserRole()
  if (!isSessionReady) return <PageLoader />
  return authUser ? <Navigate to={homeOf(authUser)} replace /> : <>{children}</>
}

function AdminRoute({ children }: { children: ReactNode }) {
  const { authUser, isSessionReady } = useUserRole()
  if (!isSessionReady) return <PageLoader />
  if (!authUser) return <Navigate to="/login" replace />
  const allowed = authUser.role === 'ADMIN' || authUser.isSuperAdmin
  return allowed ? <>{children}</> : <AccessDeniedPage reason="L’administration est réservée aux comptes ADMIN de l’université et à l’administrateur de la plateforme." />
}

/** Écran universitaire : refuse les comptes indépendants et, si précisé, les rôles non listés. */
function UniversityRoute({ roles, children }: { roles?: Role[]; children: ReactNode }) {
  const { authUser, currentUser, currentRole, isSessionReady } = useUserRole()
  if (!isSessionReady) return <PageLoader />
  if (!authUser) return <Navigate to="/login" replace />
  if (currentUser.accountType === 'PERSONAL') {
    return <AccessDeniedPage reason="Cet écran fait partie de l’espace universitaire. Votre compte indépendant dispose de sa propre gestion personnelle." />
  }
  if (roles && !roles.includes(currentRole)) {
    return <AccessDeniedPage reason={`Cet écran est réservé aux rôles : ${roles.map(roleLabel).join(', ')}.`} />
  }
  return <>{children}</>
}

function roleLabel(role: Role) {
  return { student: 'étudiant', delegate: 'délégué', teacher: 'enseignant', admin: 'administration' }[role]
}

/** Écran commun aux deux types de compte, avec une version personnelle dédiée. */
function AccountAwareRoute({ kind, children }: { kind: 'profile' | 'settings' | 'help'; children: ReactNode }) {
  const { currentUser, isSessionReady } = useUserRole()
  if (!isSessionReady) return <PageLoader />
  return currentUser.accountType === 'PERSONAL' ? <PersonalAccountPage kind={kind} /> : <>{children}</>
}

function AccountHomePage() {
  const { currentUser, isSessionReady } = useUserRole()
  if (!isSessionReady) return <PageLoader />
  return currentUser.accountType === 'PERSONAL' ? <IndependentWorkspacePage /> : <DashboardPage />
}

/**
 * Les comptes indépendants utilisent la même source Appwrite que la gestion
 * personnelle. Cette garde attend l’hydratation de session avant de décider de
 * la vue, au lieu de s’appuyer sur une valeur localStorage potentiellement
 * absente pendant le premier rendu.
 */
function PersonalLearningRoute({ tab, scheduleOnly = false, children }: { tab: 'courses' | 'schedule' | 'assignments' | 'grades'; scheduleOnly?: boolean; children: ReactNode }) {
  const { currentUser, isSessionReady } = useUserRole()
  if (!isSessionReady) return <PageLoader />
  return currentUser.accountType === 'PERSONAL' ? <IndependentWorkspacePage initialTab={tab} scheduleOnly={scheduleOnly} /> : <>{children}</>
}

/** Espace connecté : layout + transition de page animée sur le contenu seulement. */
function Shell({ children }: { children: ReactNode }) {
  const location = useLocation()
  return (
    <AuthenticatedRoute>
      <AppLayout>
        <AnimatePresence mode="wait" initial={false}>
          <PageTransition key={location.pathname}>
            <Suspense fallback={<PageLoader />}>{children}</Suspense>
          </PageTransition>
        </AnimatePresence>
      </AppLayout>
    </AuthenticatedRoute>
  )
}

function PublicPage({ children }: { children: ReactNode }) {
  const location = useLocation()
  return (
    <AnimatePresence mode="wait" initial={false}>
      <PageTransition key={location.pathname}>{children}</PageTransition>
    </AnimatePresence>
  )
}

export default function App() {
  const location = useLocation()

  useEffect(() => {
    initTheme()
    let disposed = false

    const syncWhenOnline = async () => {
      if (disposed || !navigator.onLine) return
      await pushNotificationService.update()
      if (!disposed) {
        window.dispatchEvent(new CustomEvent('uniflow:network-restored'))
        window.dispatchEvent(new CustomEvent('uniflow:session-restored'))
      }
    }

    pushNotificationService.init().then(() => {
      // Check once after startup and again whenever the device reconnects.
      void syncWhenOnline()
    })
    window.addEventListener('online', syncWhenOnline)
    return () => {
      disposed = true
      window.removeEventListener('online', syncWhenOnline)
    }
  }, [])

  return (
    <RoleProvider>
      <CornerStackProvider>
        <SEOHead />
        {/* Seul conteneur `fixed bottom right` de l'application : Uni, le bandeau
            d'inactivité et les bandeaux de page s'y empilent (voir CornerStack.tsx). */}
        <CornerStack />
        <IdleTimer />
        <GlobalNetworkToast />
        <AudienceTracker />
        <OfflineBanner />
        <Suspense fallback={null}><UniAssistant /></Suspense>
        <ErrorBoundary resetKey={location.pathname}>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/about" element={<PublicPage><AboutPage /></PublicPage>} />
              <Route path="/pricing" element={<PublicPage><PricingPage /></PublicPage>} />
              <Route path="/download" element={<PublicPage><DownloadPage /></PublicPage>} />
              <Route path="/subscribe" element={<PublicPage><SubscriptionFlowPage /></PublicPage>} />
              <Route path="/subscribe/:planId" element={<PublicPage><SubscriptionFlowPage /></PublicPage>} />
              <Route path="/contact" element={<PublicPage><ContactPage /></PublicPage>} />
              <Route path="/presentation" element={<PublicPage><PresentationPage /></PublicPage>} />
              <Route path="/login" element={<GuestRoute><PublicPage><LoginPage /></PublicPage></GuestRoute>} />
              <Route path="/register" element={<GuestRoute><PublicPage><RegisterPage /></PublicPage></GuestRoute>} />
              <Route path="/mot-de-passe-oublie" element={<GuestRoute><PublicPage><ForgotPasswordPage /></PublicPage></GuestRoute>} />
              <Route path="/reinitialiser-mot-de-passe" element={<PublicPage><ResetPasswordPage /></PublicPage>} />
              <Route path="/sentinelle" element={<PublicPage><SentinellePage /></PublicPage>} />
              <Route path="/forum" element={<PublicPage><ForumPage /></PublicPage>} />
              <Route path="/teams" element={<PublicPage><TeamsPage /></PublicPage>} />
              {LEGAL_DOCUMENTS.map((doc) => (
                <Route key={doc.slug} path={doc.path} element={<PublicPage><LegalDocumentPage document={doc} /></PublicPage>} />
              ))}

              {/* Accueil — tableau de bord universitaire ou espace indépendant */}
              <Route path="/app" element={<Shell><AccountHomePage /></Shell>} />
              <Route path="/app/independent" element={<Navigate to="/app" replace />} />
              <Route path="/app/accueil-compact" element={<Shell><UniversityRoute><DashboardCompactPage /></UniversityRoute></Shell>} />

              {/* Apprentissage — commun, avec version personnelle */}
              <Route path="/app/cours" element={<Shell><PersonalLearningRoute tab="courses"><CoursesPage /></PersonalLearningRoute></Shell>} />
              <Route path="/app/cours/:courseId" element={<Shell><PersonalLearningRoute tab="courses"><CourseDetailPage /></PersonalLearningRoute></Shell>} />
              <Route path="/app/emploi-du-temps" element={<Shell><PersonalLearningRoute tab="schedule" scheduleOnly><SchedulePage /></PersonalLearningRoute></Shell>} />
              <Route path="/app/devoirs" element={<Shell><PersonalLearningRoute tab="assignments"><AssignmentsPage /></PersonalLearningRoute></Shell>} />
              <Route path="/app/notes" element={<Shell><PersonalLearningRoute tab="grades"><GradesPage /></PersonalLearningRoute></Shell>} />

              {/* Commun aux deux types de compte */}
              <Route path="/app/profil" element={<Shell><AccountAwareRoute kind="profile"><ProfilePage /></AccountAwareRoute></Shell>} />
              <Route path="/app/parametres" element={<Shell><AccountAwareRoute kind="settings"><SettingsPage /></AccountAwareRoute></Shell>} />
              <Route path="/app/aide" element={<Shell><AccountAwareRoute kind="help"><HelpPage /></AccountAwareRoute></Shell>} />
              <Route path="/app/abonnement" element={<Shell><BillingPage /></Shell>} />
              <Route path="/app/billing" element={<Navigate to="/app/abonnement" replace />} />

              {/* Universitaire uniquement */}
              <Route path="/app/presences" element={<Shell><UniversityRoute roles={['student', 'delegate']}><AttendancePage /></UniversityRoute></Shell>} />
              <Route path="/app/gestion-presences" element={<Shell><UniversityRoute roles={['delegate', 'teacher']}><AttendanceManagePage /></UniversityRoute></Shell>} />
              <Route path="/app/notifications" element={<Shell><UniversityRoute><NotificationsPage /></UniversityRoute></Shell>} />
              <Route path="/app/messages" element={<Shell><UniversityRoute><MessagingPage /></UniversityRoute></Shell>} />
              <Route path="/app/messages/:conversationId" element={<Shell><UniversityRoute><MessagingPage /></UniversityRoute></Shell>} />
              <Route path="/app/bibliotheque" element={<Shell><UniversityRoute><LibraryPage /></UniversityRoute></Shell>} />
              <Route path="/app/salles" element={<Shell><UniversityRoute><ClassroomsPage /></UniversityRoute></Shell>} />
              <Route path="/app/promotion" element={<Shell><UniversityRoute roles={['student', 'delegate']}><PromotionPage /></UniversityRoute></Shell>} />
              <Route path="/app/mes-cours-enseignant" element={<Shell><UniversityRoute roles={['teacher']}><TeacherCoursesPage /></UniversityRoute></Shell>} />
              <Route path="/app/demo" element={<Shell><UniversityRoute><DemoPage /></UniversityRoute></Shell>} />

              {/* Anciennes adresses de la visioconférence : elle vit désormais dans l'application de bureau */}
              <Route path="/app/visio/*" element={<Navigate to="/app/aide" replace />} />
              <Route path="/app/visioconference/*" element={<Navigate to="/app/aide" replace />} />

              {/* Administration */}
              <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
                <Route index element={<AdminDashboardPage />} />
                <Route path="utilisateurs" element={<AdminUsersPage />} />
                <Route path="etudiants" element={<StudentsPage />} />
                <Route path="enseignants" element={<TeachersPage />} />
                <Route path="equipe" element={<AdminTeamPage />} />
                <Route path="structure" element={<AcademicStructurePage />} />
                <Route path="cours" element={<AdminCoursesPage />} />
                <Route path="ue" element={<UEPage />} />
                <Route path="salles" element={<AdminClassroomsPage />} />
                <Route path="parametres" element={<AdminSettingsPage />} />
                <Route path="rapports" element={<AdminReportsPage />} />
                <Route path="paiements" element={<AdminPaymentsPage />} />
                <Route path="audience" element={<AdminAudiencePage />} />
                <Route path="historique-presences" element={<AttendanceHistoryPage />} />
                <Route path="activite" element={<AdminActivityPage />} />
                <Route path="securite" element={<AdminSecurityPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Route>

              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </CornerStackProvider>
    </RoleProvider>
  )
}
