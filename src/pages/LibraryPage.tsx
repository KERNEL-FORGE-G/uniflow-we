import { useState } from 'react'
import { Search, FileText, Video, Music, Download, Eye, BookOpen, FileType, Film, Headphones, File } from 'lucide-react'

type TabType = 'Documents' | 'Vidéos' | 'Audios'

const docs = [
  { id: '1', title: 'Cours Algorithmique - Chapitre 1', course: 'INFO101', type: 'PDF', size: '2.4 MB', date: 'Mai 2026', icon: FileText },
  { id: '2', title: 'TD Bases de données - Exercices', course: 'INFO201', type: 'PDF', size: '1.8 MB', date: 'Mai 2026', icon: FileText },
  { id: '3', title: 'Slides - Introduction aux réseaux', course: 'INFO301', type: 'PPTX', size: '5.2 MB', date: 'Avr 2026', icon: FileType },
  { id: '4', title: 'Sujet Examen IA 2025', course: 'INFO401', type: 'PDF', size: '850 KB', date: 'Mar 2026', icon: File },
]

const videos = [
  { id: '1', title: 'Introduction à l\'Algorithmique', course: 'INFO101', duration: '45:30', size: '120 MB', date: 'Mai 2026' },
  { id: '2', title: 'Bases de données relationnelles', course: 'INFO201', duration: '1:12:45', size: '280 MB', date: 'Mai 2026' },
  { id: '3', title: 'Réseaux TCP/IP - Partie 1', course: 'INFO301', duration: '38:20', size: '95 MB', date: 'Avr 2026' },
  { id: '4', title: 'Machine Learning - Régression', course: 'INFO401', duration: '52:15', size: '145 MB', date: 'Mar 2026' },
]

const audios = [
  { id: '1', title: 'Podcast - Histoire de l\'IA', course: 'INFO401', duration: '28:45', size: '25 MB', date: 'Mai 2026' },
  { id: '2', title: 'Interview Dr. Kamga - Pédagogie', course: 'Général', duration: '42:10', size: '38 MB', date: 'Avr 2026' },
  { id: '3', title: 'Cours audio - Économie S1', course: 'ECO101', duration: '1:05:30', size: '58 MB', date: 'Mar 2026' },
  { id: '4', title: 'Conférence - Blockchain & Crypto', course: 'INFO301', duration: '1:18:20', size: '72 MB', date: 'Fév 2026' },
]

export default function LibraryPage() {
  const [activeTab, setActiveTab] = useState<TabType>('Documents')
  const [search, setSearch] = useState('')

  const getFilteredContent = () => {
    const lowerSearch = search.toLowerCase()
    if (activeTab === 'Documents') return docs.filter(d => d.title.toLowerCase().includes(lowerSearch) || d.course.toLowerCase().includes(lowerSearch))
    if (activeTab === 'Vidéos') return videos.filter(v => v.title.toLowerCase().includes(lowerSearch) || v.course.toLowerCase().includes(lowerSearch))
    return audios.filter(a => a.title.toLowerCase().includes(lowerSearch) || a.course.toLowerCase().includes(lowerSearch))
  }

  const filtered = getFilteredContent()

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-[#111827]">Bibliothèque</h1>
        <p className="text-sm text-[#6b7280] mt-0.5">Tous vos supports de cours · Documents, vidéos, audios</p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-3 border-b border-[#e5e7eb]">
        {(['Documents', 'Vidéos', 'Audios'] as TabType[]).map(tab => {
          const icons = { Documents: BookOpen, Vidéos: Film, Audios: Headphones }
          const Icon = icons[tab]
          return (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition-colors ${
                activeTab === tab
                  ? 'border-[#1e3a8a] text-[#1e3a8a]'
                  : 'border-transparent text-[#6b7280] hover:text-[#1e3a8a]'
              }`}>
              <Icon className="h-4 w-4" />
              {tab}
            </button>
          )
        })}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9ca3af]" />
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder={`Rechercher dans ${activeTab.toLowerCase()}...`}
          className="w-full rounded-xl border border-[#e5e7eb] bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-[#1e3a8a] focus:ring-2 focus:ring-[#1e3a8a]/10" />
      </div>

      {/* Content grid */}
      {activeTab === 'Documents' && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(filtered as typeof docs).map(doc => {
            const Icon = doc.icon
            return (
              <div key={doc.id} className="group rounded-xl border border-[#e5e7eb] bg-white p-5 shadow-sm hover:shadow-md hover:border-[#1e3a8a]/30 transition-all">
                <div className="flex items-start gap-3 mb-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#eff3ff]">
                    <Icon className="h-6 w-6 text-[#1e3a8a]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-[#111827] text-sm leading-snug line-clamp-2">{doc.title}</p>
                    <p className="text-xs text-[#9ca3af] mt-0.5">{doc.course}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-[#6b7280] mb-3">
                  <span className="font-medium">{doc.type} · {doc.size}</span>
                  <span>{doc.date}</span>
                </div>
                <div className="flex gap-2">
                  <button className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-[#1e3a8a] px-3 py-2 text-xs font-semibold text-white hover:bg-[#2d4fa8] transition-colors">
                    <Download className="h-3.5 w-3.5" /> Télécharger
                  </button>
                  <button className="flex items-center justify-center rounded-lg border border-[#e5e7eb] px-3 py-2 text-[#6b7280] hover:bg-[#f9fafb] transition-colors">
                    <Eye className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {activeTab === 'Vidéos' && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(filtered as typeof videos).map(video => (
            <div key={video.id} className="group rounded-xl border border-[#e5e7eb] bg-white overflow-hidden shadow-sm hover:shadow-md hover:border-[#1e3a8a]/30 transition-all">
              <div className="relative aspect-video bg-gradient-to-br from-[#1e3a8a] to-[#0d9488] flex items-center justify-center">
                <Film className="h-12 w-12 text-white/40" />
                <div className="absolute bottom-2 right-2 rounded-md bg-black/70 px-2 py-0.5 text-xs font-bold text-white">
                  {video.duration}
                </div>
              </div>
              <div className="p-4">
                <p className="font-semibold text-[#111827] text-sm leading-snug line-clamp-2 mb-1">{video.title}</p>
                <p className="text-xs text-[#9ca3af] mb-3">{video.course} · {video.size}</p>
                <div className="flex gap-2">
                  <button className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-[#1e3a8a] px-3 py-2 text-xs font-semibold text-white hover:bg-[#2d4fa8] transition-colors">
                    <Video className="h-3.5 w-3.5" /> Regarder
                  </button>
                  <button className="flex items-center justify-center rounded-lg border border-[#e5e7eb] px-3 py-2 text-[#6b7280] hover:bg-[#f9fafb] transition-colors">
                    <Download className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'Audios' && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(filtered as typeof audios).map(audio => (
            <div key={audio.id} className="group rounded-xl border border-[#e5e7eb] bg-white p-5 shadow-sm hover:shadow-md hover:border-[#1e3a8a]/30 transition-all">
              <div className="flex items-start gap-3 mb-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#f0fdfa]">
                  <Headphones className="h-6 w-6 text-[#0d9488]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-[#111827] text-sm leading-snug line-clamp-2">{audio.title}</p>
                  <p className="text-xs text-[#9ca3af] mt-0.5">{audio.course}</p>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs text-[#6b7280] mb-3">
                <span className="font-medium">{audio.duration}</span>
                <span>{audio.size}</span>
              </div>
              <div className="flex gap-2">
                <button className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-[#0d9488] px-3 py-2 text-xs font-semibold text-white hover:bg-[#14b8a8] transition-colors">
                  <Music className="h-3.5 w-3.5" /> Écouter
                </button>
                <button className="flex items-center justify-center rounded-lg border border-[#e5e7eb] px-3 py-2 text-[#6b7280] hover:bg-[#f9fafb] transition-colors">
                  <Download className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {filtered.length === 0 && (
        <div className="rounded-xl border border-[#e5e7eb] bg-white p-12 text-center shadow-sm">
          <BookOpen className="mx-auto h-12 w-12 text-[#e5e7eb] mb-3" />
          <p className="text-sm text-[#9ca3af]">Aucun {activeTab.toLowerCase()} trouvé.</p>
        </div>
      )}
    </div>
  )
}
