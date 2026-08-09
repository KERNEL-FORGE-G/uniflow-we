import { useState } from 'react'
import { LayoutGrid, List, BookOpen, Clock, Users, ChevronRight, Code2, Database, Network, Brain, DollarSign, BookMarked, GraduationCap, RefreshCw, AlertCircle } from 'lucide-react'
import { Badge } from '../components/ui/Badge'
import { useNavigate } from 'react-router-dom'
import { useApi } from '../hooks/useApi'
import { coursesApi, type Course } from '../lib/api'
import type { LucideIcon } from 'lucide-react'

const courseIconMap: Record<string, LucideIcon> = {
  'INFO101': Code2, 'INFO201': Database, 'INFO301': Network,
  'INFO401': Brain, 'ECO101': DollarSign, 'PHIL101': BookMarked,
}
const getCourseIcon = (code: string): LucideIcon => courseIconMap[code] || GraduationCap

const courseGradients = [
  'from-blue-600 to-indigo-700', 'from-teal-600 to-emerald-700',
  'from-purple-600 to-pink-700', 'from-amber-600 to-orange-700',
  'from-rose-600 to-red-700',    'from-cyan-600 to-blue-700',
]

const typeLabel: Record<string, string> = { CM: 'Cours Magistral', TD: 'Travaux Dirigés', TP: 'Travaux Pratiques' }

const tabs = ['Tous', 'CM', 'TD', 'TP'] as const
type Tab = typeof tabs[number]

export default function CoursesPage() {
  const [activeTab, setActiveTab] = useState<Tab>('Tous')
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [search, setSearch] = useState('')
  const navigate = useNavigate()

  const { data: courses, loading, error, refetch } = useApi(() => coursesApi.mine())

  const filtered = (courses ?? []).filter((c: Course) => {
    const matchTab = activeTab === 'Tous' || c.type === activeTab
    const matchSearch = !search
      || c.name.toLowerCase().includes(search.toLowerCase())
      || c.code.toLowerCase().includes(search.toLowerCase())
      || `${c.teacher?.firstName} ${c.teacher?.lastName}`.toLowerCase().includes(search.toLowerCase())
    return matchTab && matchSearch
  })

  if (loading) return (
    <div className="space-y-4 animate-fade-in">
      <div className="h-8 w-48 rounded-lg bg-[#f3f4f6] animate-pulse" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1,2,3,4,5,6].map(i => <div key={i} className="h-52 rounded-xl bg-[#f3f4f6] animate-pulse" />)}
      </div>
    </div>
  )

  if (error) return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <AlertCircle className="h-12 w-12 text-red-400" />
      <p className="text-sm text-[#6b7280]">{error}</p>
      <button onClick={refetch} className="flex items-center gap-2 rounded-lg bg-[#1e3a8a] px-4 py-2 text-sm font-semibold text-white">
        <RefreshCw className="h-4 w-4" /> Réessayer
      </button>
    </div>
  )

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-[#111827]">Mes cours</h1>
          <p className="text-sm text-[#6b7280] mt-0.5">{(courses ?? []).length} cours inscrits</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher un cours..."
              className="rounded-lg border border-[#e5e7eb] bg-[#f9fafb] py-2 pl-9 pr-4 text-sm outline-none focus:border-[#1e3a8a] focus:bg-white w-64" />
            <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9ca3af]" />
          </div>
          <div className="flex rounded-lg border border-[#e5e7eb] overflow-hidden">
            <button onClick={() => setView('grid')} className={`p-2 transition-colors ${view === 'grid' ? 'bg-[#1e3a8a] text-white' : 'bg-white text-[#6b7280]'}`}>
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button onClick={() => setView('list')} className={`p-2 transition-colors ${view === 'list' ? 'bg-[#1e3a8a] text-white' : 'bg-white text-[#6b7280]'}`}>
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-[#e5e7eb]">
        {tabs.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
              activeTab === tab ? 'border-[#1e3a8a] text-[#1e3a8a]' : 'border-transparent text-[#6b7280] hover:text-[#374151]'
            }`}>
            {tab}
          </button>
        ))}
      </div>

      {/* Cards */}
      <div className={view === 'grid' ? 'grid gap-4 sm:grid-cols-2 lg:grid-cols-3' : 'space-y-3'}>
        {filtered.length === 0 && (
          <div className="col-span-3 flex flex-col items-center justify-center py-16 text-[#9ca3af]">
            <BookOpen className="h-12 w-12 mb-3 opacity-30" />
            <p className="font-medium">Aucun cours trouvé</p>
          </div>
        )}
        {filtered.map((course: Course, idx: number) => {
          const CourseIcon = getCourseIcon(course.code)
          const gradient = courseGradients[idx % courseGradients.length]
          const teacherName = course.teacher
            ? `${course.teacher.firstName} ${course.teacher.lastName}`
            : 'Enseignant non assigné'

          return view === 'grid' ? (
            <div key={course.id} onClick={() => navigate(`/app/cours/${course.id}`)}
              className="rounded-xl border border-[#e5e7eb] bg-white shadow-sm hover:shadow-md transition-all overflow-hidden cursor-pointer group">
              <div className={`h-28 bg-gradient-to-r ${gradient} relative p-4 flex flex-col justify-between`}>
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center rounded-md bg-white/20 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur-sm">
                    {course.code}
                  </span>
                  <span className="rounded-md bg-white/20 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur-sm">
                    {course.type}
                  </span>
                </div>
                <div className="flex justify-center">
                  <div className="rounded-xl bg-white/20 backdrop-blur-sm p-3 group-hover:scale-110 transition-transform">
                    <CourseIcon className="h-8 w-8 text-white" strokeWidth={1.5} />
                  </div>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-[#111827] text-sm leading-tight mb-1">{course.name}</h3>
                <p className="text-xs text-[#6b7280] mb-1">{teacherName}</p>
                {course.teachingUnit && (
                  <p className="text-xs text-[#9ca3af]">UE : {course.teachingUnit.name}</p>
                )}
                <div className="mt-3 flex items-center gap-3 text-xs text-[#9ca3af]">
                  <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{course.hours}h</span>
                  <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" />{course.credits} crédits</span>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <Badge variant="primary">{typeLabel[course.type] ?? course.type}</Badge>
                  <ChevronRight className="h-4 w-4 text-[#9ca3af] group-hover:text-[#1e3a8a] transition-colors" />
                </div>
              </div>
            </div>
          ) : (
            <div key={course.id} onClick={() => navigate(`/app/cours/${course.id}`)}
              className="flex items-center gap-4 rounded-xl border border-[#e5e7eb] bg-white p-4 shadow-sm hover:shadow-md transition-all cursor-pointer">
              <div className={`h-14 w-14 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shrink-0`}>
                <CourseIcon className="h-7 w-7 text-white" strokeWidth={1.5} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-[#111827] text-sm truncate">{course.name}</h3>
                  <Badge variant="primary">{course.type}</Badge>
                </div>
                <p className="text-xs text-[#6b7280] mt-0.5">{teacherName}</p>
                {course.teachingUnit && (
                  <p className="text-xs text-[#9ca3af]">{course.teachingUnit.name} · {course.credits} crédits</p>
                )}
              </div>
              <ChevronRight className="h-5 w-5 text-[#9ca3af] shrink-0" />
            </div>
          )
        })}
      </div>

      {/* Stats bottom */}
      {(courses ?? []).length > 0 && (
        <div className="grid grid-cols-3 gap-4 rounded-xl border border-[#e5e7eb] bg-white p-4 shadow-sm">
          {[
            { label: 'Cours total', value: (courses ?? []).length, color: 'text-[#1e3a8a]' },
            { label: 'Crédits total', value: (courses ?? []).reduce((s: number, c: Course) => s + (c.credits ?? 0), 0), color: 'text-[#0d9488]' },
            { label: 'Heures total', value: `${(courses ?? []).reduce((s: number, c: Course) => s + (c.hours ?? 0), 0)}h`, color: 'text-[#7c3aed]' },
          ].map(s => (
            <div key={s.label} className="text-center">
              <p className={`text-2xl font-extrabold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-[#6b7280]">{s.label}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

