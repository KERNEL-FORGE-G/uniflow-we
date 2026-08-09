import { useState } from 'react'
import { Download, Eye, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { Badge } from '../components/ui/Badge'
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  BarChart, Bar
} from 'recharts'

// Notes par UE spécifiques de l'étudiant
const myUEGrades = [
  { 
    ue: 'Communication',
    code: 'UE01',
    average: 14.5,
    credits: 6,
    validated: true,
    trend: 'up',
    color: 'from-blue-600 to-indigo-600',
    courses: [
      { name: 'Expression écrite', grade: 15, coef: 2, type: 'CC+Exam' },
      { name: 'Communication orale', grade: 14, coef: 2, type: 'CC+Exam' },
      { name: 'Anglais technique', grade: 14.5, coef: 2, type: 'CC+Exam' },
    ]
  },
  { 
    ue: 'Programmation',
    code: 'UE02',
    average: 15.2,
    credits: 8,
    validated: true,
    trend: 'up',
    color: 'from-teal-600 to-emerald-600',
    courses: [
      { name: 'Algorithmique', grade: 16, coef: 3, type: 'CC+Exam' },
      { name: 'Programmation Web', grade: 15, coef: 3, type: 'TP+Projet' },
      { name: 'Base de Données', grade: 14.5, coef: 2, type: 'CC+Exam' },
    ]
  },
  { 
    ue: 'Conception',
    code: 'UE03',
    average: 14.8,
    credits: 6,
    validated: true,
    trend: 'stable',
    color: 'from-purple-600 to-pink-600',
    courses: [
      { name: 'UML & Modélisation', grade: 15, coef: 2, type: 'CC+Projet' },
      { name: 'Architecture logicielle', grade: 14.5, coef: 2, type: 'CC+Exam' },
      { name: 'Design Patterns', grade: 15, coef: 2, type: 'TP+Projet' },
    ]
  },
  { 
    ue: 'Analyse',
    code: 'UE04',
    average: 13.9,
    credits: 6,
    validated: true,
    trend: 'down',
    color: 'from-amber-600 to-orange-600',
    courses: [
      { name: 'Mathématiques discrètes', grade: 13, coef: 2, type: 'CC+Exam' },
      { name: 'Statistiques', grade: 14.5, coef: 2, type: 'CC+Exam' },
      { name: 'Complexité algorithmique', grade: 14.2, coef: 2, type: 'CC+Exam' },
    ]
  },
  { 
    ue: 'Travail Équipe',
    code: 'UE05',
    average: 15.1,
    credits: 4,
    validated: true,
    trend: 'up',
    color: 'from-rose-600 to-red-600',
    courses: [
      { name: 'Projet collaboratif', grade: 16, coef: 3, type: 'Projet' },
      { name: 'Gestion de projet', grade: 14, coef: 2, type: 'CC+Présentation' },
    ]
  },
]

const semesterEvolution = [
  { sem: 'S1', moyenne: 13.8 },
  { sem: 'S2', moyenne: 14.2 },
  { sem: 'S3', moyenne: 14.7 },
  { sem: 'S4', moyenne: 14.71 },
]

export default function GradesPage() {
  const [sem, setSem] = useState('Semestre 4')
  const [year, setYear] = useState('2023-2024')
  const [selectedUE, setSelectedUE] = useState<typeof myUEGrades[0] | null>(null)

  const totalCredits = myUEGrades.reduce((s, ue) => s + ue.credits, 0)
  const globalAverage = (myUEGrades.reduce((s, ue) => s + ue.average * ue.credits, 0) / totalCredits).toFixed(2)
  const validated = myUEGrades.filter(ue => ue.validated).length

  const getTrendIcon = (trend: string) => {
    if (trend === 'up') return <TrendingUp className="h-4 w-4 text-emerald-600" />
    if (trend === 'down') return <TrendingDown className="h-4 w-4 text-red-600" />
    return <Minus className="h-4 w-4 text-[#6b7280]" />
  }

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-white border border-[#e5e7eb] p-5 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-[#111827]">Mes notes</h1>
          <p className="text-sm text-[#6b7280] mt-0.5">Résultats académiques et bulletins</p>
        </div>
        <div className="flex items-center gap-2">
          <select value={sem} onChange={e => setSem(e.target.value)}
            className="rounded-lg border border-[#e5e7eb] bg-white px-3 py-2 text-sm outline-none focus:border-[#1e3a8a]">
            <option>Semestre 2</option><option>Semestre 1</option>
          </select>
          <select value={year} onChange={e => setYear(e.target.value)}
            className="rounded-lg border border-[#e5e7eb] bg-white px-3 py-2 text-sm outline-none focus:border-[#1e3a8a]">
            <option>2023-2024</option><option>2022-2023</option>
          </select>
          <button
            onClick={() => {
              const content = `RELEVÉ DE NOTES — ${sem} ${year}\n\n${myUEGrades.map((u: any) => `${u.code} ${u.title}: ${u.average}/20 (${u.credits} ECTS)`).join('\n')}\n\nMoyenne générale: ${globalAverage}/20`
              const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' })
              const url = URL.createObjectURL(blob)
              const a = document.createElement('a')
              a.href = url; a.download = `releve-notes-${sem}-${year}.txt`; a.click()
              URL.revokeObjectURL(url)
            }}
            className="flex items-center gap-1.5 rounded-lg border border-[#e5e7eb] bg-white px-3 py-2 text-sm font-medium text-[#374151] hover:bg-[#f9fafb] hover:border-[#1e3a8a] hover:text-[#1e3a8a] transition-all"
          >
            <Download className="h-4 w-4" /> Export PDF
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-[#e5e7eb] bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#eff3ff]">
              <TrendingUp className="h-6 w-6 text-[#1e3a8a]" />
            </div>
            <div>
              <p className="text-2xl font-extrabold text-[#1e3a8a]">{globalAverage}/20</p>
              <p className="text-xs text-[#6b7280]">Moyenne générale</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-[#e5e7eb] bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-50">
              <Badge variant="success" className="text-lg font-bold">{validated}</Badge>
            </div>
            <div>
              <p className="text-2xl font-extrabold text-emerald-600">{validated}/{myUEGrades.length}</p>
              <p className="text-xs text-[#6b7280]">UE validées</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-[#e5e7eb] bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#f0fdfa]">
              <span className="text-xl font-extrabold text-[#0d9488]">{totalCredits}</span>
            </div>
            <div>
              <p className="text-2xl font-extrabold text-[#0d9488]">{totalCredits} ECTS</p>
              <p className="text-xs text-[#6b7280]">Crédits obtenus</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-[#e5e7eb] bg-white p-4 shadow-sm">
          <button
            onClick={() => {
              const lines = [`RELEVÉ DE NOTES — ${sem} ${year}`, `Moyenne générale : ${globalAverage}/20`, `Crédits ECTS obtenus : ${totalCredits}`, '', '--- Détail par UE ---']
              myUEGrades.forEach((u: any) => lines.push(`${u.code} — ${u.title} : ${u.average}/20 (${u.credits} ECTS) — ${u.average >= 10 ? 'VALIDÉ' : 'NON VALIDÉ'}`))
              const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8;' })
              const a = document.createElement('a'); a.href = URL.createObjectURL(blob)
              a.download = `bulletin-${sem.replace(' ','')}-${year}.txt`; a.click()
            }}
            className="w-full flex flex-col items-center justify-center gap-2 h-full hover:bg-[#eff3ff] transition-colors rounded-lg group"
          >
            <Download className="h-8 w-8 text-[#1e3a8a] group-hover:scale-110 transition-transform" />
            <span className="text-xs font-semibold text-[#1e3a8a]">Bulletin {sem}</span>
            <span className="text-xs text-[#6b7280]">{year}</span>
          </button>
        </div>
      </div>

      {/* UE Cards */}
      <div>
        <h2 className="text-lg font-bold text-[#111827] mb-4">Mes Unités d'Enseignement (UE)</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {myUEGrades.map(ue => (
            <div 
              key={ue.code}
              onClick={() => setSelectedUE(ue)}
              className="rounded-xl border border-[#e5e7eb] bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer overflow-hidden">
              {/* Header with gradient */}
              <div className={`bg-gradient-to-r ${ue.color} p-4 text-white`}>
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <span className="inline-block rounded-md bg-white/20 px-2 py-0.5 text-xs font-bold backdrop-blur-sm mb-1">
                      {ue.code}
                    </span>
                    <h3 className="text-lg font-bold">{ue.ue}</h3>
                    <p className="text-xs opacity-90 mt-0.5">{ue.credits} crédits ECTS</p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-extrabold">{ue.average}</div>
                    <p className="text-xs opacity-80">/20</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {ue.validated && <Badge variant="success" className="text-xs">Validée</Badge>}
                  <div className="flex items-center gap-1 text-xs">
                    {getTrendIcon(ue.trend)}
                    <span className="opacity-90">
                      {ue.trend === 'up' ? 'En progression' : ue.trend === 'down' ? 'En baisse' : 'Stable'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Body */}
              <div className="p-4">
                <h4 className="text-xs font-bold text-[#6b7280] uppercase mb-2">Matières de l'UE</h4>
                <div className="space-y-2">
                  {ue.courses.map((course, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-[#f9fafb] hover:bg-[#f3f4f6] transition-colors">
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-[#111827]">{course.name}</p>
                        <p className="text-xs text-[#6b7280]">{course.type} • Coef. {course.coef}</p>
                      </div>
                      <span className={`text-sm font-bold ${
                        course.grade >= 14 ? 'text-emerald-600' : 
                        course.grade >= 10 ? 'text-amber-600' : 
                        'text-red-600'
                      }`}>
                        {course.grade}/20
                      </span>
                    </div>
                  ))}
                </div>
                <button 
                  onClick={(e) => { e.stopPropagation(); setSelectedUE(ue); }}
                  className="mt-3 w-full rounded-lg border border-[#e5e7eb] bg-white px-3 py-2 text-xs font-medium text-[#374151] hover:bg-[#f9fafb] transition-colors flex items-center justify-center gap-1.5">
                  <Eye className="h-3.5 w-3.5" /> Voir le détail
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Evolution chart */}
      <div className="rounded-xl border border-[#e5e7eb] bg-white p-5 shadow-sm">
        <h2 className="text-sm font-bold text-[#111827] mb-4 flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-[#1e3a8a]" />
          Évolution de ma moyenne générale
        </h2>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={semesterEvolution} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
            <XAxis dataKey="sem" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis domain={[12, 16]} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip formatter={(v: any) => [`${v}/20`, 'Moyenne']} />
            <Line type="monotone" dataKey="moyenne" name="Ma moyenne" stroke="#1e3a8a" strokeWidth={3} dot={{ r: 5, fill: '#1e3a8a' }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* UE Detail Modal */}
      {selectedUE && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in"
          onClick={() => setSelectedUE(null)}>
          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className={`bg-gradient-to-r ${selectedUE.color} p-6 text-white`}>
              <div className="flex items-start justify-between mb-2">
                <div>
                  <span className="inline-block rounded-md bg-white/20 px-2 py-0.5 text-xs font-bold backdrop-blur-sm mb-2">
                    {selectedUE.code}
                  </span>
                  <h2 className="text-2xl font-extrabold mb-1">{selectedUE.ue}</h2>
                  <p className="text-sm opacity-90">{selectedUE.credits} crédits ECTS • {selectedUE.courses.length} matières</p>
                </div>
                <div className="text-right">
                  <div className="text-4xl font-extrabold">{selectedUE.average}</div>
                  <p className="text-sm opacity-80">/20</p>
                </div>
              </div>
              {selectedUE.validated && <Badge variant="success">✓ Validée</Badge>}
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5">
              <div>
                <h3 className="text-sm font-bold text-[#111827] mb-3">Détail des notes par matière</h3>
                <div className="space-y-2">
                  {selectedUE.courses.map((course, idx) => (
                    <div key={idx} className="rounded-lg border border-[#e5e7eb] p-4 hover:bg-[#f9fafb] transition-colors">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h4 className="font-semibold text-[#111827]">{course.name}</h4>
                          <p className="text-xs text-[#6b7280] mt-0.5">{course.type} • Coefficient {course.coef}</p>
                        </div>
                        <div className="text-right">
                          <span className={`text-2xl font-extrabold ${
                            course.grade >= 14 ? 'text-emerald-600' : 
                            course.grade >= 10 ? 'text-amber-600' : 
                            'text-red-600'
                          }`}>
                            {course.grade}
                          </span>
                          <span className="text-sm text-[#6b7280]">/20</span>
                        </div>
                      </div>
                      <div className="h-2 rounded-full bg-[#f3f4f6] overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${
                            course.grade >= 14 ? 'bg-emerald-500' : 
                            course.grade >= 10 ? 'bg-amber-500' : 
                            'bg-red-500'
                          }`}
                          style={{ width: `${(course.grade / 20) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Stats bar chart */}
              <div>
                <h3 className="text-sm font-bold text-[#111827] mb-3">Répartition des notes</h3>
                <ResponsiveContainer width="100%" height={150}>
                  <BarChart data={selectedUE.courses.map(c => ({ name: c.name.split(' ')[0], note: c.grade }))}>
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                    <YAxis domain={[0, 20]} tick={{ fontSize: 10 }} />
                    <Tooltip formatter={(v: any) => [`${v}/20`]} />
                    <Bar dataKey="note" fill="#1e3a8a" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="flex gap-3 pt-4 border-t border-[#e5e7eb]">
                <button onClick={() => setSelectedUE(null)}
                  className="flex-1 rounded-lg border border-[#e5e7eb] bg-white px-4 py-2.5 text-sm font-medium text-[#374151] hover:bg-[#f9fafb] transition-colors">
                  Fermer
                </button>
                <button className="flex-1 rounded-lg bg-[#1e3a8a] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#2d4fa8] transition-colors flex items-center justify-center gap-2">
                  <Download className="h-4 w-4" /> Télécharger relevé
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
