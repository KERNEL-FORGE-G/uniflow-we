import { useState } from 'react'
import { Megaphone, FileText, Video, Settings, Star, Trash2, Check, UserCheck } from 'lucide-react'
import { Badge } from '../components/ui/Badge'
import { AnimatedList } from '../components/ui/AnimatedList'
import { listAppwriteNotifications, markAppwriteNotificationRead, deleteAppwriteNotification, type AppwriteNotification } from '../lib/appwrite'
import { useEffect } from 'react'
import PushNotificationControl from '../components/PushNotificationControl'

const iconMap: Record<string, any> = {
  annonce: Megaphone,
  devoir:  FileText,
  video:   Video,
  system:  Settings,
  absence: UserCheck,
  note:    Star,
}
const colorMap: Record<string, string> = {
  annonce: 'bg-[#eff3ff] text-[#1e3a8a]',
  devoir:  'bg-[#fef3c7] text-[#d97706]',
  video:   'bg-[#f0fdfa] text-[#0d9488]',
  system:  'bg-[#f3f4f6] text-[#6b7280]',
  absence: 'bg-[#d1fae5] text-[#059669]',
  note:    'bg-[#ede9fe] text-[#7c3aed]',
}

const tabs = [
  { label: 'Tous',     filter: null },
  { label: 'Annonces', filter: 'annonce' },
  { label: 'Système',  filter: 'system' },
  { label: 'Non lues', filter: 'unread' },
] as const

type Notification = AppwriteNotification & { id: string; isRead: boolean; message: string }

export default function NotificationsPage() {
  const [notifs, setNotifs] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<string>('Tous')
  const [selected, setSelected] = useState<Notification | null>(null)

  const refetch = async () => {
    setLoading(true)
    try {
      const raw = localStorage.getItem('uniflow_user')
      const user = raw ? JSON.parse(raw) as { id?: string } : null
      const rows = user?.id ? await listAppwriteNotifications(user.id) : []
      setNotifs(rows.map(row => ({ ...row, id: row.$id, message: row.message || row.title })))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { void refetch() }, [])

  const unreadCount = (notifs ?? []).filter(n => !n.isRead).length

  const visible = (notifs ?? []).filter(n => {
    if (activeTab === 'Non lues') return !n.isRead
    if (activeTab === 'Annonces') return n.type === 'annonce'
    if (activeTab === 'Système')  return n.type === 'system'
    return true
  })

  const markAllRead = async () => {
    // no bulk endpoint: mark each unread as read
    await Promise.all((notifs ?? []).filter(n => !n.isRead).map(n => markAppwriteNotificationRead(n.id).catch(() => null)))
    refetch()
  }
  const markRead = async (id: string) => {
    await markAppwriteNotificationRead(id).catch(() => null)
    refetch()
  }
  const deleteNotif = async (id: string) => {
    await deleteAppwriteNotification(id).catch(() => null)
    refetch()
    if (selected && selected.id === id) setSelected(null)
  }
  const acknowledge = async () => {
    if (!selected) return
    await markAppwriteNotificationRead(selected.id).catch(() => null)
    refetch()
  }

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-white border border-[#e5e7eb] p-5 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-[#111827]">Notifications</h1>
          <p className="text-sm text-[#6b7280] mt-0.5">{unreadCount} non lue{unreadCount > 1 ? 's' : ''}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {['Par UE', 'Par type', 'Période'].map(f => (
            <select key={f} className="rounded-lg border border-[#e5e7eb] bg-white px-3 py-2 text-sm outline-none focus:border-[#1e3a8a]">
              <option>{f} ▾</option>
            </select>
          ))}
          <button onClick={markAllRead}
            className="flex items-center gap-1.5 rounded-lg bg-[#1e3a8a] px-4 py-2 text-sm font-semibold text-white hover:bg-[#2d4fa8] transition-colors">
            <Check className="h-4 w-4" /> Tout marquer comme lu
          </button>
        </div>
      </div>

      {/* PWA Push Notification Control Box */}
      <PushNotificationControl />

      {/* Tabs */}
      <div className="flex gap-1 border-b border-[#e5e7eb]">
          {tabs.map(t => {
          const count = t.label === 'Non lues' ? unreadCount : t.filter ? (notifs ?? []).filter(n => n.type === t.filter).length : (notifs ?? []).length
          return (
            <button key={t.label} onClick={() => setActiveTab(t.label)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
                activeTab === t.label ? 'border-[#1e3a8a] text-[#1e3a8a]' : 'border-transparent text-[#6b7280] hover:text-[#374151]'
              }`}>
              {t.label}
              <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${activeTab === t.label ? 'bg-[#1e3a8a] text-white' : 'bg-[#f3f4f6] text-[#6b7280]'}`}>
                {count}
              </span>
            </button>
          )
        })}
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {/* List */}
        <div>
          {visible.length === 0 ? (
            <div className="flex flex-col items-center py-12 text-[#9ca3af]">
              <Check className="h-10 w-10 mb-2 opacity-30" />
              <p className="text-sm">Tout est lu !</p>
            </div>
          ) : (
            <AnimatedList
              items={visible}
              onItemSelect={(n: Notification) => { setSelected(n); markRead(n.id) }}
              showGradients
              enableArrowNavigation
              displayScrollbar={false}
              className="max-h-[calc(100vh-320px)]"
              renderItem={(n: Notification, _index, isSelected) => {
                const typeKey = (n.type || '').toLowerCase()
                const Icon = iconMap[typeKey] || iconMap[n.type] || Megaphone
                const bg = colorMap[typeKey] || colorMap[n.type] || 'bg-[#eff3ff] text-[#1e3a8a]'
                return (
                  <div
                    className={`w-full rounded-xl border p-4 text-left transition-all ${
                      isSelected
                        ? 'border-[#1e3a8a] bg-[#f0f4ff] shadow-sm'
                        : !n.isRead
                        ? 'border-[#e5e7eb] bg-white hover:border-[#1e3a8a]/40 hover:shadow-sm'
                        : 'border-[#e5e7eb] bg-white opacity-75 hover:opacity-100 hover:shadow-sm'
                    }`}>
                    <div className="flex items-start gap-3">
                      <div className={`rounded-lg p-2 shrink-0 ${bg}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className={`text-sm ${!n.isRead ? 'font-semibold text-[#111827]' : 'font-medium text-[#374151]'} truncate`}>{n.title}</p>
                          <div className="flex items-center gap-1 shrink-0">
                            {!n.isRead && <span className="h-2 w-2 rounded-full bg-[#1e3a8a]" />}
                            <button onClick={e => { e.stopPropagation(); deleteNotif(n.id) }}
                              className="rounded p-0.5 hover:bg-red-50 text-[#d1d5db] hover:text-red-500 transition-colors">
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                        <p className="text-xs text-[#9ca3af] mt-0.5">{n.type} · {new Date(n.createdAt).toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                )
              }}
            />
          )}
        </div>

        {/* Detail */}
        {selected && (
          <div className="rounded-xl border border-[#e5e7eb] bg-white p-5 shadow-sm animate-fade-in">
            <div className="flex items-start justify-between gap-3 mb-4">
              <div>
                <h2 className="text-base font-bold text-[#111827]">{selected.title}</h2>
                <p className="text-xs text-[#9ca3af] mt-0.5">{selected.type} · {new Date(selected.createdAt).toLocaleString()}</p>
              </div>
              <div className="flex gap-1">
                <button className="rounded-lg p-1.5 hover:bg-[#f3f4f6] text-[#9ca3af] transition-colors"><Star className="h-4 w-4" /></button>
                <button onClick={() => deleteNotif(selected.id)} className="rounded-lg p-1.5 hover:bg-red-50 text-[#9ca3af] hover:text-red-500 transition-colors"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
            { !selected.isRead && <Badge variant="primary" className="mb-4">Non lue</Badge>}
            <div className="prose prose-sm max-w-none">
              <p className="text-sm leading-relaxed text-[#374151] whitespace-pre-line">{selected.message}</p>
            </div>
            <div className="mt-6 flex gap-2">
              <button onClick={acknowledge}
                className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-[#1e3a8a] py-2.5 text-sm font-semibold text-white hover:bg-[#2d4fa8] transition-colors">
                <Check className="h-4 w-4" /> J'ai compris
              </button>
              <button className="rounded-lg border border-[#e5e7eb] px-4 py-2.5 text-sm font-medium text-[#374151] hover:bg-[#f9fafb] transition-colors">
                Archiver
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
