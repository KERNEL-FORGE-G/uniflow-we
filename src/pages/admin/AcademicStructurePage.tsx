import { useState } from 'react'
import { Database, Plus, Edit, Trash2, Building2, Users, BookOpen, ChevronRight } from 'lucide-react'
import { Button } from '../../components/ui/Button'

interface Department {
  id: string
  name: string
  code: string
  head: string
  studentsCount: number
  teachersCount: number
  ueCount: number
}

interface Faculty {
  id: string
  name: string
  code: string
  dean: string
  departments: Department[]
}

const mockStructure: Faculty[] = [
  {
    id: '1',
    name: 'Faculté des Sciences',
    code: 'FS',
    dean: 'Pr. Emmanuel Tonye',
    departments: [
      { id: '1a', name: 'Informatique', code: 'INFO', head: 'Pr. Martin Dupont', studentsCount: 520, teachersCount: 24, ueCount: 45 },
      { id: '1b', name: 'Mathématiques', code: 'MATH', head: 'Pr. Jean Mbida', studentsCount: 380, teachersCount: 18, ueCount: 38 },
      { id: '1c', name: 'Physique', code: 'PHY', head: 'Dr. Alice Fouda', studentsCount: 290, teachersCount: 15, ueCount: 32 },
    ]
  },
  {
    id: '2',
    name: 'Faculté d\'Économie',
    code: 'FSEG',
    dean: 'Pr. Paul Essomba',
    departments: [
      { id: '2a', name: 'Économie', code: 'ECO', head: 'Dr. Sophie Kamga', studentsCount: 640, teachersCount: 22, ueCount: 42 },
      { id: '2b', name: 'Gestion', code: 'GEST', head: 'Dr. Marie Ngo Bisse', studentsCount: 580, teachersCount: 20, ueCount: 40 },
    ]
  },
  {
    id: '3',
    name: 'Faculté de Droit',
    code: 'FSJP',
    dean: 'Pr. Hervé Ngono',
    departments: [
      { id: '3a', name: 'Droit Privé', code: 'DPRIV', head: 'Dr. Charlotte Etoga', studentsCount: 430, teachersCount: 16, ueCount: 35 },
      { id: '3b', name: 'Droit Public', code: 'DPUB', head: 'Dr. Albert Mbassi', studentsCount: 385, teachersCount: 14, ueCount: 33 },
    ]
  },
]

export default function AcademicStructurePage() {
  const [expandedFaculty, setExpandedFaculty] = useState<string | null>(mockStructure[0].id)

  const totalStats = {
    faculties: mockStructure.length,
    departments: mockStructure.reduce((sum, f) => sum + f.departments.length, 0),
    students: mockStructure.reduce((sum, f) => sum + f.departments.reduce((dSum, d) => dSum + d.studentsCount, 0), 0),
    teachers: mockStructure.reduce((sum, f) => sum + f.departments.reduce((dSum, d) => dSum + d.teachersCount, 0), 0),
  }

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#111827]">Structure Académique</h1>
          <p className="text-sm text-[#6b7280] mt-0.5">Administration · Organisation de l'université 2026</p>
        </div>
        <Button className="bg-[#1e3a8a] hover:bg-[#1e3a8a]/90">
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle Faculté
        </Button>
      </div>

      {/* Global Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-[#e5e7eb] bg-white p-4 shadow-sm">
          <div className="inline-flex items-center justify-center rounded-lg p-2 bg-[#eff3ff] mb-3">
            <Building2 className="h-5 w-5 text-[#1e3a8a]" />
          </div>
          <p className="text-2xl font-bold text-[#111827]">{totalStats.faculties}</p>
          <p className="text-xs text-[#6b7280] mt-0.5">Facultés</p>
        </div>
        <div className="rounded-xl border border-[#e5e7eb] bg-white p-4 shadow-sm">
          <div className="inline-flex items-center justify-center rounded-lg p-2 bg-[#f0fdfa] mb-3">
            <Database className="h-5 w-5 text-[#0d9488]" />
          </div>
          <p className="text-2xl font-bold text-[#111827]">{totalStats.departments}</p>
          <p className="text-xs text-[#6b7280] mt-0.5">Départements</p>
        </div>
        <div className="rounded-xl border border-[#e5e7eb] bg-white p-4 shadow-sm">
          <div className="inline-flex items-center justify-center rounded-lg p-2 bg-purple-50 mb-3">
            <Users className="h-5 w-5 text-[#7c3aed]" />
          </div>
          <p className="text-2xl font-bold text-[#111827]">{totalStats.students.toLocaleString()}</p>
          <p className="text-xs text-[#6b7280] mt-0.5">Étudiants</p>
        </div>
        <div className="rounded-xl border border-[#e5e7eb] bg-white p-4 shadow-sm">
          <div className="inline-flex items-center justify-center rounded-lg p-2 bg-amber-50 mb-3">
            <BookOpen className="h-5 w-5 text-[#d97706]" />
          </div>
          <p className="text-2xl font-bold text-[#111827]">{totalStats.teachers}</p>
          <p className="text-xs text-[#6b7280] mt-0.5">Enseignants</p>
        </div>
      </div>

      {/* Faculties & Departments */}
      <div className="space-y-4">
        {mockStructure.map(faculty => {
          const isExpanded = expandedFaculty === faculty.id
          return (
            <div key={faculty.id} className="rounded-xl border border-[#e5e7eb] bg-white shadow-sm overflow-hidden">
              {/* Faculty Header */}
              <div 
                onClick={() => setExpandedFaculty(isExpanded ? null : faculty.id)}
                className="flex items-center justify-between p-5 cursor-pointer hover:bg-[#f9fafb] transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-[#1e3a8a] to-[#7c3aed] flex items-center justify-center text-white font-bold text-sm shrink-0">
                    {faculty.code}
                  </div>
                  <div>
                    <h3 className="font-bold text-[#111827] text-lg">{faculty.name}</h3>
                    <p className="text-sm text-[#6b7280]">Doyen : {faculty.dean}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-4 text-sm">
                    <div className="text-center">
                      <p className="font-bold text-[#111827]">{faculty.departments.length}</p>
                      <p className="text-xs text-[#6b7280]">Départements</p>
                    </div>
                    <div className="text-center">
                      <p className="font-bold text-[#111827]">
                        {faculty.departments.reduce((sum, d) => sum + d.studentsCount, 0)}
                      </p>
                      <p className="text-xs text-[#6b7280]">Étudiants</p>
                    </div>
                  </div>
                  <ChevronRight className={`h-5 w-5 text-[#6b7280] transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                </div>
              </div>

              {/* Departments */}
              {isExpanded && (
                <div className="border-t border-[#f3f4f6] bg-[#f9fafb] p-5">
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {faculty.departments.map(dept => (
                      <div key={dept.id} className="rounded-lg border border-[#e5e7eb] bg-white p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-[#eff3ff] flex items-center justify-center text-[#1e3a8a] font-bold text-xs">
                              {dept.code}
                            </div>
                            <div>
                              <h4 className="font-bold text-[#111827] text-sm">{dept.name}</h4>
                              <p className="text-xs text-[#6b7280]">{dept.head}</p>
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <button className="rounded p-1.5 hover:bg-[#eff3ff] text-[#6b7280] hover:text-[#1e3a8a] transition-colors">
                              <Edit className="h-3.5 w-3.5" />
                            </button>
                            <button className="rounded p-1.5 hover:bg-red-50 text-[#6b7280] hover:text-red-600 transition-colors">
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-3 mt-3 pt-3 border-t border-[#f3f4f6]">
                          <div className="text-center">
                            <p className="text-lg font-bold text-[#1e3a8a]">{dept.studentsCount}</p>
                            <p className="text-[10px] text-[#6b7280]">Étudiants</p>
                          </div>
                          <div className="text-center">
                            <p className="text-lg font-bold text-[#0d9488]">{dept.teachersCount}</p>
                            <p className="text-[10px] text-[#6b7280]">Enseignants</p>
                          </div>
                          <div className="text-center">
                            <p className="text-lg font-bold text-[#7c3aed]">{dept.ueCount}</p>
                            <p className="text-[10px] text-[#6b7280]">UE</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 flex justify-end">
                    <Button variant="outline" size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Ajouter un département
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
