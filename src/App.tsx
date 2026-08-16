import { Routes, Route, Navigate } from 'react-router-dom'
import { lazy, Suspense, useEffect } from 'react'
import SEOHead from './components/SEOHead'
import { AppLayout } from './components/layout/AppLayout'
import { AdminLayout } from './components/layout/AdminLayout'
import { RoleProvider } from './utils/userRole'
import { IdleTimer } from './components/IdleTimer'
import { GlobalNetworkToast } from './components/GlobalNetworkToast'
import { Skeleton } from './components/ui/Skeleton'
import { pushNotificationService } from './services/pushNotificationService'
import { initTheme } from './utils/theme'
import { getAccountType, getToken } from './lib/api'

// Pages chargées immédiatement (landing, auth)
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'

// Lazy loading pour les pages de l'app
const DashboardPage = lazy(() => import('./pages/DashboardPage'))
const IndependentWorkspacePage = lazy(() => import('./pages/IndependentWorkspacePage'))
const DashboardCompactPage = lazy(() => import('./pages/DashboardCompactPage'))
const CoursesPage = lazy(() => import('./pages/CoursesPage'))
const CourseDetailPage = lazy(() => import('./pages/CourseDetailPage'))
const ProfilePage = lazy(() => import('./pages/ProfilePage'))
const SchedulePage = lazy(() => import('./pages/SchedulePage'))
const AttendancePage = lazy(() => import('./pages/AttendancePage'))
const VideoLobbyPage = lazy(() => import('./pages/VideoLobbyPage'))
const VideoConfPage = lazy(() => import('./pages/VideoConfPage'))
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
const SubscriptionFlowPage = lazy(() => import('./pages/SubscriptionFlowPage'))
const ContactPage = lazy(() => import('./pages/ContactPage'))
const SentinellePage = lazy(() => import('./pages/SentinellePage'))
const ForumPage = lazy(() => import('./pages/ForumPage'))
const TeamsPage = lazy(() => import('./pages/TeamsPage'))
const PromotionPage = lazy(() => import('./pages/PromotionPage'))
const PersonalAccountPage = lazy(() => import('./pages/PersonalAccountPages'))

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
const AdminActivityPage = lazy(() => import('./pages/admin/AdminActivityPage'))
const AdminSecurityPage = lazy(() => import('./pages/admin/AdminSecurityPage'))

// Loading fallback
function PageLoader() {
  return (
    <div className="min-h-screen bg-[#f3f4f6] p-6 animate-fade-in">
      <div className="max-w-[1920px] mx-auto space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
        </div>
        <Skeleton className="h-96" />
      </div>
    </div>
  )
}

function StudentApp({ children }: { children: React.ReactNode }) {
  return <AppLayout>{children}</AppLayout>
}

function PersonalAwareRoute({ kind, children }: { kind: 'profile' | 'settings' | 'messages' | 'library' | 'attendance' | 'notifications' | 'video' | 'classrooms' | 'help'; children: React.ReactNode }) {
  return getAccountType() === 'PERSONAL' ? <PersonalAccountPage kind={kind} /> : <>{children}</>
}

function AccountHomePage() {
  const isIndependent = Boolean(getToken()) && getAccountType() === 'PERSONAL'
  return isIndependent ? <IndependentWorkspacePage /> : <DashboardPage />
}

export default function App() {
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
      <SEOHead />
      <IdleTimer />
      <GlobalNetworkToast />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/subscribe" element={<SubscriptionFlowPage />} />
          <Route path="/subscribe/:planId" element={<SubscriptionFlowPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/presentation" element={<PresentationPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/sentinelle" element={<SentinellePage />} />
          <Route path="/forum" element={<ForumPage />} />
          <Route path="/teams" element={<TeamsPage />} />

          {/* Partie 1 — Dashboard */}
          <Route path="/app" element={<StudentApp><AccountHomePage /></StudentApp>} />
          <Route path="/app/independent" element={<StudentApp><IndependentWorkspacePage /></StudentApp>} />
          <Route path="/app/accueil-compact" element={<StudentApp>{getAccountType() === 'PERSONAL' ? <IndependentWorkspacePage /> : <DashboardCompactPage />}</StudentApp>} />

          {/* Partie 2 — Cours, Profil, Emploi du temps */}
          <Route path="/app/cours" element={<StudentApp>{getAccountType() === 'PERSONAL' ? <IndependentWorkspacePage initialTab="courses" /> : <CoursesPage />}</StudentApp>} />
          <Route path="/app/cours/:courseId" element={<StudentApp>{getAccountType() === 'PERSONAL' ? <IndependentWorkspacePage initialTab="courses" /> : <CourseDetailPage />}</StudentApp>} />
          <Route path="/app/profil" element={<StudentApp><PersonalAwareRoute kind="profile"><ProfilePage /></PersonalAwareRoute></StudentApp>} />
          <Route path="/app/emploi-du-temps" element={<StudentApp>{getAccountType() === 'PERSONAL' ? <IndependentWorkspacePage initialTab="schedule" /> : <SchedulePage />}</StudentApp>} />

          {/* Partie 3 — Présences, Visioconf, Notifications */}
          <Route path="/app/presences" element={<StudentApp><PersonalAwareRoute kind="attendance"><AttendancePage /></PersonalAwareRoute></StudentApp>} />
          <Route path="/app/visio" element={<StudentApp><PersonalAwareRoute kind="video"><VideoLobbyPage /></PersonalAwareRoute></StudentApp>} />
          <Route path="/app/visioconference" element={<StudentApp><PersonalAwareRoute kind="video"><VideoConfPage /></PersonalAwareRoute></StudentApp>} />
          <Route path="/app/visioconference/:id" element={<StudentApp><PersonalAwareRoute kind="video"><VideoConfPage /></PersonalAwareRoute></StudentApp>} />
          <Route path="/app/visio/room/:id" element={<StudentApp><PersonalAwareRoute kind="video"><VideoConfPage /></PersonalAwareRoute></StudentApp>} />
          <Route path="/app/notifications" element={<StudentApp><PersonalAwareRoute kind="notifications"><NotificationsPage /></PersonalAwareRoute></StudentApp>} />

          {/* Partie 4 — Devoirs, Notes, Messagerie */}
          <Route path="/app/devoirs" element={<StudentApp>{getAccountType() === 'PERSONAL' ? <IndependentWorkspacePage initialTab="assignments" /> : <AssignmentsPage />}</StudentApp>} />
          <Route path="/app/notes" element={<StudentApp>{getAccountType() === 'PERSONAL' ? <IndependentWorkspacePage initialTab="grades" /> : <GradesPage />}</StudentApp>} />
          <Route path="/app/messages" element={<StudentApp><PersonalAwareRoute kind="messages"><MessagingPage /></PersonalAwareRoute></StudentApp>} />

          {/* Partie 5 — Délégué & Promotion */}
          <Route path="/app/gestion-presences" element={getAccountType() === 'PERSONAL' ? <Navigate to="/app" replace /> : <StudentApp><AttendanceManagePage /></StudentApp>} />
          <Route path="/app/promotion" element={getAccountType() === 'PERSONAL' ? <Navigate to="/app" replace /> : <StudentApp><PromotionPage /></StudentApp>} />

          {/* Partie 8 — Enseignant Spécifique */}
          <Route path="/app/mes-cours-enseignant" element={getAccountType() === 'PERSONAL' ? <Navigate to="/app" replace /> : <StudentApp><TeacherCoursesPage /></StudentApp>} />

          {/* Partie 6 — Paramètres, Bibliothèque, Aide, Salles */}
          <Route path="/app/parametres" element={<StudentApp><PersonalAwareRoute kind="settings"><SettingsPage /></PersonalAwareRoute></StudentApp>} />
          <Route path="/app/bibliotheque" element={<StudentApp><PersonalAwareRoute kind="library"><LibraryPage /></PersonalAwareRoute></StudentApp>} />
          <Route path="/app/salles" element={<StudentApp><PersonalAwareRoute kind="classrooms"><ClassroomsPage /></PersonalAwareRoute></StudentApp>} />
          <Route path="/app/aide" element={<StudentApp><PersonalAwareRoute kind="help"><HelpPage /></PersonalAwareRoute></StudentApp>} />
          <Route path="/app/demo" element={getAccountType() === 'PERSONAL' ? <Navigate to="/app" replace /> : <StudentApp><DemoPage /></StudentApp>} />

          {/* Partie 5 — Administration */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboardPage />} />
            <Route path="utilisateurs" element={<AdminUsersPage />} />
            <Route path="etudiants" element={<StudentsPage />} />
            <Route path="enseignants" element={<TeachersPage />} />
            <Route path="structure" element={<AcademicStructurePage />} />
            <Route path="cours" element={<AdminCoursesPage />} />
            <Route path="ue" element={<UEPage />} />
            <Route path="salles" element={<AdminClassroomsPage />} />
            <Route path="parametres" element={<AdminSettingsPage />} />
            <Route path="rapports" element={<AdminReportsPage />} />
            <Route path="activite" element={<AdminActivityPage />} />
            <Route path="securite" element={<AdminSecurityPage />} />
            <Route path="*" element={<AdminDashboardPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </RoleProvider>
  )
}
