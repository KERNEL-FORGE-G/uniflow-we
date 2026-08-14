import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, BookOpen, FileText, Video, Users, Clock, Calendar, Download, Play, Eye, CheckCircle, Film, Loader2 } from 'lucide-react'
import { Badge } from '../components/ui/Badge'
import { Avatar } from '../components/ui/Avatar'
import { Course, coursesApi } from '../lib/api'

type Tab = 'infos' | 'documents' | 'videos' | 'visio' | 'syllabus'

type CourseDocument = { id: string; name: string; type: string; size?: string; date?: string; downloads?: number }
type CourseVideo = { id: string; title: string; duration?: string; date?: string; views?: number }
type SyllabusItem = { week: number; title: string; topics: string[]; completed?: boolean }

// Les contenus pédagogiques doivent provenir d’un endpoint backend dédié.
const documents: CourseDocument[] = []
const videos: CourseVideo[] = []
const syllabus: SyllabusItem[] = []

interface UiCourse {
  id: string; code: string; name: string; description?: string
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
  ...c,
  title: c.name,
  teacher: c.teacher ? `${c.teacher.firstName} ${c.teacher.lastName}` : 'N/A',
  semester: 'N/A',
  progress: 0,
  color: 'from-blue-600 to-blue-800',
  enrolled: 0,
  status: 'En cours'
})

export default function CourseDetailPage() {
  const navigate = useNavigate()
  const { courseId } = useParams()
  const [activeTab, setActiveTab] = useState<Tab>('infos')
  const [course, setCourse] = useState<UiCourse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!courseId) return
    coursesApi.getOne(courseId)
      .then(c => setCourse(mapToUiCourse(c)))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [courseId])
  
  const tabs: { id: Tab; label: string; icon: any }[] = [
    { id: 'infos', label: 'Informations', icon: BookOpen },
    { id: 'documents', label: 'Documents', icon: FileText },
    { id: 'videos', label: 'Vidéos', icon: Video },
    { id: 'visio', label: 'Visioconférence', icon: Users },
    { id: 'syllabus', label: 'Programme', icon: Calendar },
  ]

  if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-[#1e3a8a]" /></div>
  if (error) return <div className="p-6 text-red-500">Erreur: {error}</div>
  if (!course) return <div className="p-6">Cours introuvable</div>

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Back button + Header */}
      <button onClick={() => navigate('/app/cours')}
        className="flex items-center gap-2 text-sm font-medium text-[#6b7280] hover:text-[#1e3a8a] transition-colors">
        <ArrowLeft className="h-4 w-4" /> Retour aux cours
      </button>

      {/* Course header */}
      <div className={`rounded-xl border border-[#e5e7eb] bg-gradient-to-r ${course.color} p-6 text-white shadow-lg`}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center rounded-md bg-white/20 px-2.5 py-1 text-xs font-bold backdrop-blur-sm">
                {course.code}
              </span>
              <Badge variant="success" className="text-xs">{course.status}</Badge>
            </div>
            <h1 className="text-2xl font-extrabold mb-2">{course.title}</h1>
            <p className="text-sm opacity-90">{course.teacher} • {course.semester}</p>
            <div className="mt-4 flex items-center gap-6 text-sm">
              <span className="flex items-center gap-1.5"><Users className="h-4 w-4" />{course.enrolled} inscrits</span>
              <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" />{course.credits} crédits</span>
              <span className="flex items-center gap-1.5">{course.type}</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-extrabold">{course.progress}%</div>
            <p className="text-xs opacity-80 mt-1">Progression</p>
            <div className="mt-2 h-2 w-24 rounded-full bg-white/30 overflow-hidden">
              <div className="h-full bg-white rounded-full transition-all" style={{ width: `${course.progress}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-[#e5e7eb] overflow-x-auto">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 -mb-px whitespace-nowrap ${
              activeTab === id
                ? 'border-[#1e3a8a] text-[#1e3a8a]'
                : 'border-transparent text-[#6b7280] hover:text-[#374151]'
            }`}>
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'infos' && (
        <div className="grid gap-5 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-5">
            <div className="rounded-xl border border-[#e5e7eb] bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-[#111827] mb-4">Description du cours</h2>
              <p className="text-sm text-[#6b7280] leading-relaxed mb-4">
                Ce cours introduit les concepts fondamentaux de l'algorithmique et des structures de données. 
                Vous apprendrez à concevoir, analyser et implémenter des algorithmes efficaces pour résoudre 
                des problèmes computationnels.
              </p>
              <h3 className="text-sm font-bold text-[#111827] mb-2">Objectifs pédagogiques</h3>
              <ul className="space-y-2 text-sm text-[#6b7280]">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-[#0d9488] shrink-0 mt-0.5" />
                  Comprendre les principes de base de la complexité algorithmique
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-[#0d9488] shrink-0 mt-0.5" />
                  Maîtriser les structures de données classiques (tableaux, listes, arbres)
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-[#0d9488] shrink-0 mt-0.5" />
                  Implémenter des algorithmes de tri et de recherche efficaces
                </li>
              </ul>
            </div>

            <div className="rounded-xl border border-[#e5e7eb] bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-[#111827] mb-4">Évaluation</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg bg-[#f9fafb]">
                  <span className="text-sm font-medium text-[#374151]">Contrôle Continu (CC)</span>
                  <span className="text-sm font-bold text-[#1e3a8a]">30%</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-[#f9fafb]">
                  <span className="text-sm font-medium text-[#374151]">Examen Final</span>
                  <span className="text-sm font-bold text-[#1e3a8a]">70%</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-5">
            <div className="rounded-xl border border-[#e5e7eb] bg-white p-5 shadow-sm">
              <h3 className="text-sm font-bold text-[#111827] mb-3">Enseignant</h3>
              <div className="flex items-center gap-3 mb-4">
                <Avatar name={course.teacher} size="lg" />
                <div>
                  <p className="font-semibold text-[#111827]">{course.teacher}</p>
                  <p className="text-xs text-[#6b7280]">Professeur</p>
                </div>
              </div>
              <button onClick={() => navigate('/app/messages')}
                className="w-full rounded-lg bg-[#1e3a8a] px-4 py-2 text-sm font-semibold text-white hover:bg-[#2d4fa8] transition-colors">
                Contacter
              </button>
            </div>

            <div className="rounded-xl border border-[#e5e7eb] bg-white p-5 shadow-sm">
              <h3 className="text-sm font-bold text-[#111827] mb-3">Prochaine session</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#6b7280]">Date</span>
                  <span className="font-semibold text-[#111827]">Lundi 29 janv.</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6b7280]">Horaire</span>
                  <span className="font-semibold text-[#111827]">08:00 - 10:00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6b7280]">Salle</span>
                  <span className="font-semibold text-[#111827]">A204</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'documents' && (
        <div className="rounded-xl border border-[#e5e7eb] bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-[#111827] mb-4">Documents du cours</h2>
          <div className="space-y-3">
            {documents.length === 0 && <p className="py-10 text-center text-sm text-[#6b7280]">Aucun document n’est disponible pour ce cours.</p>}
            {documents.map(doc => (
              <div key={doc.id} className="flex items-center justify-between p-4 rounded-lg border border-[#e5e7eb] hover:bg-[#f9fafb] transition-colors">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#eff3ff]">
                    <FileText className="h-5 w-5 text-[#1e3a8a]" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#111827]">{doc.name}</p>
                    <div className="flex items-center gap-2 text-xs text-[#6b7280] mt-0.5">
                      <span>{doc.type}</span>
                      <span>•</span>
                      <span>{doc.size}</span>
                      <span>•</span>
                      <span>{doc.date}</span>
                      <span>•</span>
                      <span>{doc.downloads} téléchargements</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="rounded-lg p-2 text-[#6b7280] hover:bg-[#f3f4f6] transition-colors">
                    <Eye className="h-4 w-4" />
                  </button>
                  <button className="rounded-lg bg-[#1e3a8a] p-2 text-white hover:bg-[#2d4fa8] transition-colors">
                    <Download className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'videos' && (
        <div className="rounded-xl border border-[#e5e7eb] bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-[#111827] mb-4">Vidéos du cours</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {videos.length === 0 && <p className="col-span-full py-10 text-center text-sm text-[#6b7280]">Aucune vidéo n’est disponible pour ce cours.</p>}
            {videos.map(video => (
              <div key={video.id} className="rounded-xl border border-[#e5e7eb] overflow-hidden hover:shadow-md transition-shadow group cursor-pointer">
                <div className="relative h-40 bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
                  <Film className="h-12 w-12 text-white/30" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Play className="h-12 w-12 text-white" />
                  </div>
                  <div className="absolute bottom-2 right-2 bg-black/70 px-2 py-0.5 rounded text-xs text-white font-semibold">
                    {video.duration}
                  </div>
                </div>
                <div className="p-3">
                  <h3 className="font-semibold text-sm text-[#111827] mb-1 line-clamp-2">{video.title}</h3>
                  <div className="flex items-center justify-between text-xs text-[#6b7280]">
                    <span>{video.date}</span>
                    <span>{video.views} vues</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'visio' && (
        <div className="rounded-xl border border-[#e5e7eb] bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-[#111827] mb-4">Visioconférence</h2>
          <div className="text-center py-12">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-[#eff3ff]">
              <Video className="h-10 w-10 text-[#1e3a8a]" />
            </div>
            <h3 className="text-lg font-bold text-[#111827] mb-2">Aucune session en cours</h3>
            <p className="text-sm text-[#6b7280] mb-6">
              Aucune visioconférence n'est actuellement active pour ce cours.
            </p>
            <button onClick={() => navigate('/app/visio')}
              className="rounded-lg bg-[#1e3a8a] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#2d4fa8] transition-colors">
              Voir toutes les réunions
            </button>
          </div>
        </div>
      )}

      {activeTab === 'syllabus' && (
        <div className="rounded-xl border border-[#e5e7eb] bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-[#111827] mb-4">Programme du cours</h2>
          <div className="space-y-4">
            {syllabus.length === 0 && <p className="py-10 text-center text-sm text-[#6b7280]">Le programme de ce cours n’est pas encore renseigné.</p>}
            {syllabus.map((item, index) => (
              <div key={index} className={`rounded-lg border p-4 ${item.completed ? 'border-[#0d9488] bg-[#f0fdfa]' : 'border-[#e5e7eb]'}`}>
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <span className="inline-block text-xs font-bold text-[#6b7280] mb-1">SEMAINE {item.week}</span>
                    <h3 className="text-sm font-bold text-[#111827]">{item.title}</h3>
                  </div>
                  {item.completed && (
                    <CheckCircle className="h-5 w-5 text-[#0d9488]" />
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
