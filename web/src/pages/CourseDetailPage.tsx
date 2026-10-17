import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Badge } from '../components/ui/Badge'
import { Avatar } from '../components/ui/Avatar'
import { IconTile, SubjectIcon, UniIcon, type UniIconName } from '../components/ui/UniIcon'
import { darkenHex, subjectColor } from '../lib/subjectIcon'
import { Course, coursesApi, libraryApi, schedulesApi, type LibraryResource, type Schedule } from '../lib/api'

type Tab = 'infos' | 'documents' | 'videos' | 'visio' | 'syllabus'

type CourseDocument = { id: string; name: string; type: string; size?: string; date?: string; downloads?: number }
type CourseVideo = { id: string; title: string; duration?: string; date?: string; views?: number }
type SyllabusItem = { week: number; title: string; topics: string[]; completed?: boolean }

const syllabus: SyllabusItem[] = []

interface UiCourse {
  id: string; code: string; name: string; description?: string
  program?: string; level?: string
  type: 'CM' | 'TD' | 'TP'; credits: number; hours: number
  title: string
  teacher: string
  semester: string
  progress: number
  color: string
  enrolled: number
  status: string
}

const mapToUiCourse = (c: Course): UiCourse => ({
  program: c.program,
  level: c.level,
  ...c,
  title: c.name,
  teacher: c.teacher ? `${c.teacher.firstName} ${c.teacher.lastName}` : 'N/A',
  semester: 'N/A',
  progress: 0,
  // Même couleur que la carte du cours dans la liste : la matière se reconnaît d'une page à l'autre.
  color: subjectColor(c.code),
  enrolled: 0,
  status: 'En cours'
})

export default function CourseDetailPage() {
  const navigate = useNavigate()
  const { courseId } = useParams()
  const [activeTab, setActiveTab] = useState<Tab>('infos')
  const [course, setCourse] = useState<UiCourse | null>(null)
  const [documents, setDocuments] = useState<CourseDocument[]>([])
  const [videos, setVideos] = useState<CourseVideo[]>([])
  const [nextSchedule, setNextSchedule] = useState<Schedule | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!courseId) return
    Promise.all([coursesApi.getOne(courseId), libraryApi.list(), schedulesApi.list()])
      .then(([loadedCourse, resources, schedules]) => {
        setCourse(mapToUiCourse(loadedCourse))
        const related = (resources as LibraryResource[]).filter((resource) => resource.courseId === loadedCourse.id)
        setDocuments(related
          .filter((resource) => !/vidéo|video/i.test(resource.type))
          .map((resource) => ({ id: resource.id, name: resource.title, type: resource.type, size: resource.size, date: resource.date })))
        setVideos(related
          .filter((resource) => /vidéo|video/i.test(resource.type))
          .map((resource) => ({ id: resource.id, title: resource.title, date: resource.date })))
        setNextSchedule((schedules as Schedule[]).find((schedule) => schedule.course.id === loadedCourse.id) || null)
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [courseId])
  
  const tabs: { id: Tab; label: string; icon: UniIconName }[] = [
    { id: 'infos', label: 'Informations', icon: 'courses' },
    { id: 'documents', label: 'Documents', icon: 'document' },
    { id: 'videos', label: 'Vidéos', icon: 'video' },
    { id: 'visio', label: 'Visioconférence', icon: 'users' },
    { id: 'syllabus', label: 'Programme', icon: 'agenda' },
  ]

  if (loading) return <div className="flex h-screen items-center justify-center"><UniIcon name="spinner" weight="bold" size={32} className="animate-spin text-[#1e3a8a]" /></div>
  if (error) return <div className="p-6 text-red-500">Erreur: {error}</div>
  if (!course) return <div className="p-6">Cours introuvable</div>

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Back button */}
      <button onClick={() => navigate('/app/cours')}
        className="flex items-center gap-2 text-sm font-medium text-[#6b7280] hover:text-[#1e3a8a] transition-colors">
        <UniIcon name="back" weight="bold" size={16} /> Retour aux cours
      </button>

      {/* =========================================================================
          HERO BENTO - Détail du cours
         ========================================================================= */}
      <section className="rounded-3xl bg-gradient-to-br from-[#0B132B] via-[#1E3A8A] to-[#0D9488] p-6 sm:p-8 text-white shadow-xl border border-white/10 relative overflow-hidden">
        <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-cyan-400/20 blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 w-80 h-80 rounded-full bg-blue-600/25 blur-3xl pointer-events-none" />

        <div className="relative z-10 grid gap-6 lg:grid-cols-12 items-center">
          <div className="lg:col-span-8 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/15 backdrop-blur-md border border-white/20 px-3 py-1 text-xs font-semibold text-cyan-200">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                {course.code} · {course.type}
              </span>
              <Badge variant="success" className="text-xs">{course.status}</Badge>
            </div>

            <div className="flex items-start gap-4">
              <div className="hidden shrink-0 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 p-3 sm:block">
                <SubjectIcon subject={course.name} code={course.code} size={36} />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">{course.title}</h1>
                <p className="text-sm sm:text-base text-slate-200/90 mt-1">{course.teacher} • {course.semester}</p>
              </div>
            </div>

            {/* Micro-cartes Bento de statistiques */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 p-3.5 hover:bg-white/15 transition-all">
                <span className="text-[11px] font-medium text-slate-300 block">Effectif</span>
                <span className="text-xl font-black text-white flex items-center gap-1.5 mt-0.5"><UniIcon name="users" size={16} />{course.enrolled} inscrits</span>
                <span className="text-[10px] text-cyan-300 block mt-0.5 font-medium">Cohorte Appwrite</span>
              </div>
              <div className="rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 p-3.5 hover:bg-white/15 transition-all">
                <span className="text-[11px] font-medium text-slate-300 block">Pondération</span>
                <span className="text-xl font-black text-white flex items-center gap-1.5 mt-0.5"><UniIcon name="time" size={16} />{course.credits} crédits</span>
                <span className="text-[10px] text-emerald-300 block mt-0.5 font-medium">{course.hours}h · {course.type}</span>
              </div>
              <div className="rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 p-3.5 hover:bg-white/15 transition-all">
                <span className="text-[11px] font-medium text-slate-300 block">Supports</span>
                <span className="text-2xl font-black text-white">{documents.length + videos.length}</span>
                <span className="text-[10px] text-cyan-300 block mt-0.5 font-medium">{documents.length} doc(s) · {videos.length} vidéo(s)</span>
              </div>
              <div className="rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 p-3.5 hover:bg-white/15 transition-all">
                <span className="text-[11px] font-medium text-slate-300 block">Progression</span>
                <span className="text-2xl font-black text-emerald-300">{course.progress}%</span>
                <div className="mt-1.5 h-1.5 w-full rounded-full bg-white/25 overflow-hidden">
                  <div className="h-full bg-emerald-400 rounded-full transition-all" style={{ width: `${course.progress}%` }} />
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 flex justify-center lg:justify-end">
            <div className="relative group">
              <div className="absolute inset-0 bg-cyan-400/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all" />
              <img
                src="/illustrations/course_study_hero_3d.png"
                alt="Espace d'étude 3D"
                className="relative z-10 w-44 sm:w-56 lg:w-64 h-auto object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-500"
                onError={(e) => { e.currentTarget.src = '/illustrations/uni_copilot_3d.png' }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200/80 overflow-x-auto">
        {tabs.map(({ id, label, icon }) => (
          <button key={id} onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 -mb-px whitespace-nowrap ${
              activeTab === id
                ? 'border-[#1e3a8a] text-[#1e3a8a]'
                : 'border-transparent text-[#6b7280] hover:text-[#374151]'
            }`}>
            <UniIcon name={icon} weight={activeTab === id ? 'fill' : 'duotone'} size={16} />
            {label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'infos' && (
        <div className="grid gap-5 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-5">
            <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm hover:shadow-md transition-all">
              <h2 className="text-lg font-bold text-[#111827] mb-4">Description du cours</h2>
              <p className="text-sm text-[#6b7280] leading-relaxed mb-4">
                {course.description || 'La description de ce cours n’est pas encore renseignée dans Appwrite.'}
              </p>
              <h3 className="text-sm font-bold text-[#111827] mb-2">Objectifs pédagogiques</h3>
              <ul className="space-y-2 text-sm text-[#6b7280]">
                <li className="flex items-start gap-2">
                  <UniIcon name="success" weight="fill" size={16} className="text-[#0d9488] shrink-0 mt-0.5" />
                  Ressources et créneaux du parcours {[course.program, course.level].filter(Boolean).join(' · ') || 'universitaire'} dans Appwrite
                </li>
                <li className="flex items-start gap-2">
                  <UniIcon name="success" weight="fill" size={16} className="text-[#0d9488] shrink-0 mt-0.5" />
                  Supports pédagogiques disponibles depuis la bibliothèque universitaire
                </li>
                <li className="flex items-start gap-2">
                  <UniIcon name="success" weight="fill" size={16} className="text-[#0d9488] shrink-0 mt-0.5" />
                  Évaluations et présences consultables depuis les parcours associés
                </li>
              </ul>
            </div>

            <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm hover:shadow-md transition-all">
              <h2 className="text-lg font-bold text-[#111827] mb-4">Évaluation</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#f9fafb] border border-slate-200/60">
                  <span className="text-sm font-medium text-[#374151]">Contrôle Continu (CC)</span>
                  <span className="text-sm font-bold text-[#1e3a8a]">30%</span>
                </div>
                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#f9fafb] border border-slate-200/60">
                  <span className="text-sm font-medium text-[#374151]">Examen Final</span>
                  <span className="text-sm font-bold text-[#1e3a8a]">70%</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-5">
            <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm hover:shadow-md transition-all">
              <h3 className="text-sm font-bold text-[#111827] mb-3">Enseignant</h3>
              <div className="flex items-center gap-3 mb-4">
                <Avatar name={course.teacher} size="lg" />
                <div>
                  <p className="font-semibold text-[#111827]">{course.teacher}</p>
                  <p className="text-xs text-[#6b7280]">Professeur</p>
                </div>
              </div>
              <button onClick={() => navigate('/app/messages')}
                className="w-full rounded-xl bg-[#1e3a8a] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#2d4fa8] transition-colors">
                Contacter
              </button>
            </div>

            <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm hover:shadow-md transition-all">
              <h3 className="text-sm font-bold text-[#111827] mb-3">Prochaine session</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#6b7280]">Jour</span>
                  <span className="font-semibold text-[#111827]">{nextSchedule?.dayOfWeek || 'Non planifié'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6b7280]">Horaire</span>
                  <span className="font-semibold text-[#111827]">{nextSchedule ? `${nextSchedule.startTime} – ${nextSchedule.endTime}` : '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6b7280]">Salle</span>
                  <span className="font-semibold text-[#111827]">{nextSchedule?.course.classroom.name || '—'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'documents' && (
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm hover:shadow-md transition-all">
          <h2 className="text-lg font-bold text-[#111827] mb-4">Documents du cours</h2>
          <div className="space-y-3">
            {documents.length === 0 && <p className="py-10 text-center text-sm text-[#6b7280]">Aucun document n’est disponible pour ce cours.</p>}
            {documents.map(doc => (
              <div key={doc.id} className="flex items-center justify-between p-4 rounded-2xl border border-slate-200/80 hover:bg-[#f9fafb] transition-colors">
                <div className="flex items-center gap-3">
                  <IconTile name="document" color="#1E3A8A" variant="soft" size={44} />
                  <div>
                    <p className="text-sm font-semibold text-[#111827]">{doc.name}</p>
                    <div className="flex items-center gap-2 text-xs text-[#6b7280] mt-0.5">
                      <span>{doc.type}</span>
                      <span>•</span>
                      <span>{doc.size}</span>
                      <span>•</span>
                      <span>{doc.date}</span>
                      <span>•</span>
                      <span>Source Appwrite</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button disabled title="Aperçu non provisionné" className="rounded-xl p-2 text-slate-300 cursor-not-allowed">
                    <UniIcon name="eye" size={16} />
                  </button>
                  <button disabled title="Fichier non associé dans le bucket Appwrite" className="rounded-xl bg-slate-200 p-2 text-slate-500 cursor-not-allowed">
                    <UniIcon name="download" weight="bold" size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'videos' && (
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm hover:shadow-md transition-all">
          <h2 className="text-lg font-bold text-[#111827] mb-4">Vidéos du cours</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {videos.length === 0 && <p className="col-span-full py-10 text-center text-sm text-[#6b7280]">Aucune vidéo n’est disponible pour ce cours.</p>}
            {videos.map(video => (
              <div key={video.id} className="rounded-2xl border border-slate-200/80 overflow-hidden hover:shadow-md transition-all group cursor-pointer">
                <div className="relative h-40 bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
                  <UniIcon name="film" size={48} className="text-white/30" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <UniIcon name="play" weight="fill" size={48} className="text-white" />
                  </div>
                  <div className="absolute bottom-2 right-2 bg-black/70 px-2 py-0.5 rounded text-xs text-white font-semibold">
                    {video.duration}
                  </div>
                </div>
                <div className="p-3.5">
                  <h3 className="font-semibold text-sm text-[#111827] mb-1 line-clamp-2">{video.title}</h3>
                  <div className="flex items-center justify-between text-xs text-[#6b7280]">
                    <span>{video.date}</span>
                    <span>Source Appwrite</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'visio' && (
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm hover:shadow-md transition-all">
          <h2 className="text-lg font-bold text-[#111827] mb-4">Visioconférence</h2>
          <div className="text-center py-12">
            <div className="mx-auto mb-4 flex justify-center"><IconTile name="video" color="#1E3A8A" variant="soft" size={56} /></div>
            <h3 className="text-lg font-bold text-[#111827] mb-2">Aucune session en cours</h3>
            <p className="text-sm text-[#6b7280] mb-6">
              Aucune visioconférence n'est actuellement active pour ce cours.
            </p>
            <button onClick={() => navigate('/app/visio')}
              className="rounded-xl bg-[#1e3a8a] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#2d4fa8] transition-colors">
              Voir toutes les réunions
            </button>
          </div>
        </div>
      )}

      {activeTab === 'syllabus' && (
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm hover:shadow-md transition-all">
          <h2 className="text-lg font-bold text-[#111827] mb-4">Programme du cours</h2>
          <div className="space-y-4">
            {syllabus.length === 0 && <p className="py-10 text-center text-sm text-[#6b7280]">Le programme de ce cours n’est pas encore renseigné.</p>}
            {syllabus.map((item, index) => (
              <div key={index} className={`rounded-2xl border p-4 ${item.completed ? 'border-[#0d9488] bg-[#f0fdfa]' : 'border-slate-200/80'}`}>
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <span className="inline-block text-xs font-bold text-[#6b7280] mb-1">SEMAINE {item.week}</span>
                    <h3 className="text-sm font-bold text-[#111827]">{item.title}</h3>
                  </div>
                  {item.completed && (
                    <UniIcon name="success" weight="fill" size={20} className="text-[#0d9488]" />
                  )}
                </div>
                <ul className="space-y-1 mt-2">
                  {item.topics.map((topic, i) => (
                    <li key={i} className="text-xs text-[#6b7280] flex items-center gap-2">
                      <span className="h-1 w-1 rounded-full bg-[#9ca3af]"></span>
                      {topic}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
