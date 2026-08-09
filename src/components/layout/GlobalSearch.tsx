import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, BookOpen, ClipboardList, Building2, X, ArrowRight, CornerDownLeft, Sparkles, Filter } from 'lucide-react'
import { useUserRole } from '../../utils/userRole'
import { coursesApi, assignmentsApi, classroomsApi, Course, Assignment, Classroom } from '../../lib/api'
import { cn } from '../../utils/cn'

type CategoryFilter = 'all' | 'courses' | 'assignments' | 'classrooms'

export function GlobalSearch() {
  const navigate = useNavigate()
  const { language, currentRole } = useUserRole()
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [activeFilter, setActiveFilter] = useState<CategoryFilter>('all')
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const [courses, setCourses] = useState<Course[]>([])
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [classrooms, setClassrooms] = useState<Classroom[]>([])
  const [loading, setLoading] = useState(false)

  // Load searchable data
  useEffect(() => {
    let isMounted = true
    const fetchData = async () => {
      setLoading(true)
      try {
        const [cList, aList, clList] = await Promise.all([
          coursesApi.list().catch(() => []),
          assignmentsApi.mine().catch(() => []),
          classroomsApi.list().catch(() => [])
        ])
        if (isMounted) {
          setCourses(cList ?? [])
          setAssignments(aList ?? [])
          setClassrooms(clList ?? [])
        }
      } catch (err) {
        console.error('Search data fetch error:', err)
      } finally {
        if (isMounted) setLoading(false)
      }
    }
    fetchData()
    return () => { isMounted = false }
  }, [])

  // Keyboard shortcut (Ctrl+K or /)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        inputRef.current?.focus()
        setIsOpen(true)
      } else if (e.key === 'Escape') {
        setIsOpen(false)
        inputRef.current?.blur()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Filter logic
  const trimmed = query.trim().toLowerCase()

  const filteredCourses = courses.filter(c => {
    if (!trimmed) return true
    return (
      c.name?.toLowerCase().includes(trimmed) ||
      c.code?.toLowerCase().includes(trimmed) ||
      c.teachingUnit?.name?.toLowerCase().includes(trimmed) ||
      `${c.teacher?.firstName} ${c.teacher?.lastName}`.toLowerCase().includes(trimmed)
    )
  })

  const filteredAssignments = assignments.filter(a => {
    if (!trimmed) return true
    return (
      a.title?.toLowerCase().includes(trimmed) ||
      a.code?.toLowerCase().includes(trimmed) ||
      a.description?.toLowerCase().includes(trimmed) ||
      a.status?.toLowerCase().includes(trimmed)
    )
  })

  const filteredClassrooms = classrooms.filter(cl => {
    if (!trimmed) return true
    return (
      cl.name?.toLowerCase().includes(trimmed) ||
      cl.building?.toLowerCase().includes(trimmed) ||
      cl.type?.toLowerCase().includes(trimmed)
    )
  })

  const showCourses = activeFilter === 'all' || activeFilter === 'courses'
  const showAssignments = activeFilter === 'all' || activeFilter === 'assignments'
  const showClassrooms = activeFilter === 'all' || activeFilter === 'classrooms'

  const totalResults =
    (showCourses ? filteredCourses.length : 0) +
    (showAssignments ? filteredAssignments.length : 0) +
    (showClassrooms ? filteredClassrooms.length : 0)

  const handleSelect = (url: string) => {
    setIsOpen(false)
    setQuery('')
    navigate(url)
  }

  return (
    <div ref={containerRef} className="relative flex-1 max-w-md transition-all duration-200">
      {/* Search Input Bar */}
      <div className="relative flex items-center">
        <Search className={cn(
          'absolute left-3.5 h-4 w-4 transition-colors pointer-events-none',
          isOpen ? 'text-[#1e3a8a]' : 'text-[#9ca3af]'
        )} />

        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          placeholder={
            language === 'FR'
              ? 'Rechercher cours, devoirs, salles (Ctrl+K)...'
              : 'Search courses, assignments, rooms (Ctrl+K)...'
          }
          className="w-full rounded-xl border border-[#e5e7eb] bg-[#f9fafb] py-2 pl-10 pr-20 text-sm outline-none focus:border-[#1e3a8a] focus:ring-2 focus:ring-[#1e3a8a]/15 focus:bg-white transition-all shadow-xs"
        />

        <div className="absolute right-2.5 flex items-center gap-1">
          {query ? (
            <button
              onClick={() => { setQuery(''); inputRef.current?.focus() }}
              className="rounded-lg p-1 text-[#9ca3af] hover:text-[#111827] hover:bg-[#f3f4f6] transition-colors"
              title="Effacer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          ) : (
            <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded-md border border-[#e5e7eb] bg-white px-1.5 py-0.5 text-[10px] font-bold text-[#6b7280] shadow-2xs pointer-events-none">
              <span className="text-[9px]">Ctrl</span> K
            </kbd>
          )}
        </div>
      </div>

      {/* Results Dropdown */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-2 z-50 rounded-2xl border border-[#e5e7eb] bg-white p-3 shadow-2xl animate-fade-in max-h-[82vh] overflow-y-auto">
          {/* Category Filter Chips */}
          <div className="flex items-center gap-1.5 pb-2.5 border-b border-[#e5e7eb] mb-2 overflow-x-auto no-scrollbar">
            <span className="text-[10px] font-bold text-[#9ca3af] uppercase tracking-wider mr-1 shrink-0 flex items-center gap-1">
              <Filter className="h-3 w-3" /> Filtre :
            </span>
            <button
              onClick={() => setActiveFilter('all')}
              className={cn(
                'rounded-lg px-2.5 py-1 text-xs font-semibold transition-all shrink-0',
                activeFilter === 'all'
                  ? 'bg-[#1e3a8a] text-white shadow-xs'
                  : 'bg-[#f3f4f6] text-[#4b5563] hover:bg-[#e5e7eb]'
              )}
            >
              Tous ({courses.length + assignments.length + classrooms.length})
            </button>
            <button
              onClick={() => setActiveFilter('courses')}
              className={cn(
                'rounded-lg px-2.5 py-1 text-xs font-semibold transition-all shrink-0 flex items-center gap-1',
                activeFilter === 'courses'
                  ? 'bg-[#1e3a8a] text-white shadow-xs'
                  : 'bg-[#eff3ff] text-[#1e3a8a] hover:bg-[#dce5fd]'
              )}
            >
              <BookOpen className="h-3 w-3" /> Cours ({courses.length})
            </button>
            <button
              onClick={() => setActiveFilter('assignments')}
              className={cn(
                'rounded-lg px-2.5 py-1 text-xs font-semibold transition-all shrink-0 flex items-center gap-1',
                activeFilter === 'assignments'
                  ? 'bg-[#d97706] text-white shadow-xs'
                  : 'bg-[#fef3c7] text-[#92400e] hover:bg-[#fde68a]'
              )}
            >
              <ClipboardList className="h-3 w-3" /> Devoirs ({assignments.length})
            </button>
            <button
              onClick={() => setActiveFilter('classrooms')}
              className={cn(
                'rounded-lg px-2.5 py-1 text-xs font-semibold transition-all shrink-0 flex items-center gap-1',
                activeFilter === 'classrooms'
                  ? 'bg-[#0d9488] text-white shadow-xs'
                  : 'bg-[#f0fdfa] text-[#0d9488] hover:bg-[#ccfbf1]'
              )}
            >
              <Building2 className="h-3 w-3" /> Salles ({classrooms.length})
            </button>
          </div>

          {/* Quick suggestions when query is empty */}
          {!trimmed && (
            <div className="py-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#6b7280] mb-2 px-1">
                <Sparkles className="h-3.5 w-3.5 text-[#0d9488]" />
                <span>Recherches rapides suggérées</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-3">
                <button
                  onClick={() => handleSelect('/app/cours')}
                  className="flex items-center gap-2 rounded-xl border border-[#e5e7eb] p-2.5 hover:bg-[#f9fafb] hover:border-[#1e3a8a]/30 transition-all text-left"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#eff3ff] text-[#1e3a8a]">
                    <BookOpen className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#111827]">Vos Cours</p>
                    <p className="text-[10px] text-[#6b7280]">Voir tout le catalogue</p>
                  </div>
                </button>
                <button
                  onClick={() => handleSelect('/app/devoirs')}
                  className="flex items-center gap-2 rounded-xl border border-[#e5e7eb] p-2.5 hover:bg-[#f9fafb] hover:border-[#d97706]/30 transition-all text-left"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#fef3c7] text-[#d97706]">
                    <ClipboardList className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#111827]">Devoirs & TP</p>
                    <p className="text-[10px] text-[#6b7280]">Échéances à rendre</p>
                  </div>
                </button>
                <button
                  onClick={() => handleSelect(currentRole === 'admin' ? '/admin/salles' : '/app/salles')}
                  className="flex items-center gap-2 rounded-xl border border-[#e5e7eb] p-2.5 hover:bg-[#f9fafb] hover:border-[#0d9488]/30 transition-all text-left"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#f0fdfa] text-[#0d9488]">
                    <Building2 className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#111827]">Salles & Amphis</p>
                    <p className="text-[10px] text-[#6b7280]">Disponibilités</p>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Search Results List */}
          {totalResults === 0 && trimmed ? (
            <div className="py-8 text-center">
              <p className="text-sm font-semibold text-[#374151]">Aucun résultat trouvé pour "{query}"</p>
              <p className="text-xs text-[#6b7280] mt-1">Essayez avec le code d'un cours (ex: INFO101), le nom d'un devoir ou une salle (ex: Amphi 500).</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Group: COURS */}
              {showCourses && filteredCourses.length > 0 && (
                <div>
                  <div className="flex items-center justify-between px-2 py-1 mb-1">
                    <span className="text-[11px] font-extrabold text-[#1e3a8a] uppercase tracking-wider flex items-center gap-1.5">
                      <BookOpen className="h-3.5 w-3.5" />
                      Cours ({filteredCourses.length})
                    </span>
                    <button
                      onClick={() => handleSelect('/app/cours')}
                      className="text-[11px] font-semibold text-[#1e3a8a] hover:underline"
                    >
                      Voir tous →
                    </button>
                  </div>
                  <div className="space-y-1">
                    {filteredCourses.slice(0, 4).map(course => (
                      <div
                        key={course.id}
                        onClick={() => handleSelect(`/app/cours`)}
                        className="group flex items-center justify-between rounded-xl p-2.5 hover:bg-[#eff3ff]/60 transition-all cursor-pointer border border-transparent hover:border-[#1e3a8a]/20"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#eff3ff] font-mono text-xs font-extrabold text-[#1e3a8a]">
                            {course.code || 'UE'}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-xs font-bold text-[#111827] group-hover:text-[#1e3a8a] transition-colors">
                              {course.name}
                            </p>
                            <p className="truncate text-[11px] text-[#6b7280]">
                              {course.type && <span className="font-semibold text-[#1e3a8a] mr-1">[{course.type}]</span>}
                              {course.teacher ? `${course.teacher.firstName} ${course.teacher.lastName}` : 'Enseignant non assigné'}
                              {course.classroom && ` · ${course.classroom.name}`}
                            </p>
                          </div>
                        </div>
                        <ArrowRight className="h-4 w-4 text-[#9ca3af] group-hover:text-[#1e3a8a] group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Group: DEVOIRS */}
              {showAssignments && filteredAssignments.length > 0 && (
                <div>
                  <div className="flex items-center justify-between px-2 py-1 mb-1">
                    <span className="text-[11px] font-extrabold text-[#d97706] uppercase tracking-wider flex items-center gap-1.5">
                      <ClipboardList className="h-3.5 w-3.5" />
                      Devoirs ({filteredAssignments.length})
                    </span>
                    <button
                      onClick={() => handleSelect('/app/devoirs')}
                      className="text-[11px] font-semibold text-[#d97706] hover:underline"
                    >
                      Voir tous →
                    </button>
                  </div>
                  <div className="space-y-1">
                    {filteredAssignments.slice(0, 4).map(assignment => (
                      <div
                        key={assignment.id}
                        onClick={() => handleSelect('/app/devoirs')}
                        className="group flex items-center justify-between rounded-xl p-2.5 hover:bg-[#fef3c7]/50 transition-all cursor-pointer border border-transparent hover:border-[#d97706]/20"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#fef3c7] text-[#d97706]">
                            <ClipboardList className="h-4.5 w-4.5" />
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-xs font-bold text-[#111827] group-hover:text-[#d97706] transition-colors">
                              {assignment.title}
                            </p>
                            <p className="truncate text-[11px] text-[#6b7280]">
                              <span className="font-mono font-bold text-[#d97706] mr-1">{assignment.code}</span>
                              · Limite: {assignment.due}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0 ml-2">
                          <span className={cn(
                            'rounded-full px-2 py-0.5 text-[10px] font-extrabold',
                            assignment.status === 'Soumis' || assignment.status === 'Noté'
                              ? 'bg-emerald-100 text-emerald-800'
                              : assignment.status === 'En retard'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-amber-100 text-amber-800'
                          )}>
                            {assignment.status}
                          </span>
                          <ArrowRight className="h-4 w-4 text-[#9ca3af] group-hover:text-[#d97706] group-hover:translate-x-0.5 transition-all" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Group: SALLES */}
              {showClassrooms && filteredClassrooms.length > 0 && (
                <div>
                  <div className="flex items-center justify-between px-2 py-1 mb-1">
                    <span className="text-[11px] font-extrabold text-[#0d9488] uppercase tracking-wider flex items-center gap-1.5">
                      <Building2 className="h-3.5 w-3.5" />
                      Salles & Amphis ({filteredClassrooms.length})
                    </span>
                    <button
                      onClick={() => handleSelect(currentRole === 'admin' ? '/admin/salles' : '/app/salles')}
                      className="text-[11px] font-semibold text-[#0d9488] hover:underline"
                    >
                      Voir toutes →
                    </button>
                  </div>
                  <div className="space-y-1">
                    {filteredClassrooms.slice(0, 4).map(classroom => (
                      <div
                        key={classroom.id}
                        onClick={() => handleSelect(currentRole === 'admin' ? '/admin/salles' : '/app/salles')}
                        className="group flex items-center justify-between rounded-xl p-2.5 hover:bg-[#f0fdfa] transition-all cursor-pointer border border-transparent hover:border-[#0d9488]/20"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#f0fdfa] text-[#0d9488]">
                            <Building2 className="h-4.5 w-4.5" />
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-xs font-bold text-[#111827] group-hover:text-[#0d9488] transition-colors">
                              {classroom.name}
                            </p>
                            <p className="truncate text-[11px] text-[#6b7280]">
                              {classroom.building} · {classroom.type || 'Salle'} ({classroom.capacity} places)
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0 ml-2">
                          <span className={cn(
                            'rounded-full px-2 py-0.5 text-[10px] font-bold',
                            classroom.isAvailable ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                          )}>
                            {classroom.isAvailable ? 'Disponible' : 'Occupée'}
                          </span>
                          <ArrowRight className="h-4 w-4 text-[#9ca3af] group-hover:text-[#0d9488] group-hover:translate-x-0.5 transition-all" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Footer instruction */}
          <div className="mt-3 pt-2 border-t border-[#e5e7eb] flex items-center justify-between text-[11px] text-[#9ca3af]">
            <span>Tapez pour filtrer les éléments de votre campus</span>
            <span className="flex items-center gap-1 font-mono">
              <CornerDownLeft className="h-3 w-3" /> Entrée pour naviguer
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
