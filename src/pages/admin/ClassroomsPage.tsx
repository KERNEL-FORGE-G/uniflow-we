import React, { useState } from 'react'
import { Calendar, Clock, CheckCircle, XCircle, MapPin, Users, Eye } from 'lucide-react'
import { Badge } from '../../components/ui/Badge'
import { Avatar } from '../../components/ui/Avatar'

type ReservationStatus = 'pending' | 'approved' | 'rejected'

interface Reservation {
  id: string
  classroom: string
  building: string
  requestedBy: string
  role: string
  purpose: string
  date: string
  startTime: string
  endTime: string
  duration: string
  participants: number
  status: ReservationStatus
  requestDate: string
}

const mockReservations: Reservation[] = [
  {
    id: 'R001',
    classroom: 'Salle A204',
    building: 'Bâtiment A',
    requestedBy: 'Dr. Martin',
    role: 'Enseignant',
    purpose: 'TP Programmation Web',
    date: '2024-05-22',
    startTime: '14:00',
    endTime: '16:00',
    duration: '2h',
    participants: 25,
    status: 'pending',
    requestDate: '2024-05-18 10:30'
  },
  {
    id: 'R002',
    classroom: 'Amphi B105',
    building: 'Bâtiment B',
    requestedBy: 'Lucas Dubois (Délégué)',
    role: 'Délégué',
    purpose: 'Réunion étudiants L2 Info',
    date: '2024-05-23',
    startTime: '16:00',
    endTime: '18:00',
    duration: '2h',
    participants: 80,
    status: 'pending',
    requestDate: '2024-05-19 14:20'
  },
  {
    id: 'R003',
    classroom: 'Salle C301',
    building: 'Bâtiment C',
    requestedBy: 'Emma Martin',
    role: 'Étudiant',
    purpose: 'Travail de groupe Projet POO',
    date: '2024-05-24',
    startTime: '10:00',
    endTime: '12:00',
    duration: '2h',
    participants: 6,
    status: 'pending',
    requestDate: '2024-05-20 09:15'
  },
  {
    id: 'R004',
    classroom: 'Salle A101',
    building: 'Bâtiment A',
    requestedBy: 'Pr. Lambert',
    role: 'Enseignant',
    purpose: 'Cours Algorithmique',
    date: '2024-05-21',
    startTime: '08:00',
    endTime: '10:00',
    duration: '2h',
    participants: 30,
    status: 'approved',
    requestDate: '2024-05-15 16:00'
  },
  {
    id: 'R005',
    classroom: 'Labo C302',
    building: 'Bâtiment C',
    requestedBy: 'Marie Dupont',
    role: 'Étudiant',
    purpose: 'Répétition présentation',
    date: '2024-05-20',
    startTime: '18:00',
    endTime: '20:00',
    duration: '2h',
    participants: 4,
    status: 'rejected',
    requestDate: '2024-05-19 20:30'
  },
]

const statusConfig: Record<ReservationStatus, { label: string; variant: 'warning' | 'success' | 'danger'; icon: any }> = {
  pending: { label: 'En attente', variant: 'warning', icon: Clock },
  approved: { label: 'Approuvée', variant: 'success', icon: CheckCircle },
  rejected: { label: 'Refusée', variant: 'danger', icon: XCircle },
}

export default function ClassroomsPage() {
  const [filter, setFilter] = useState<ReservationStatus | 'all'>('pending')
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null)

  const filtered = mockReservations.filter(r => filter === 'all' || r.status === filter)
  const stats = {
    pending: mockReservations.filter(r => r.status === 'pending').length,
    approved: mockReservations.filter(r => r.status === 'approved').length,
    rejected: mockReservations.filter(r => r.status === 'rejected').length,
  }

  const handleApprove = (id: string) => {
    console.log('Approuver réservation:', id)
    // TODO: API call
  }

  const handleReject = (id: string) => {
    console.log('Refuser réservation:', id)
    // TODO: API call
  }

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="rounded-xl border border-[#e5e7eb] bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <MapPin className="h-6 w-6 text-[#1e3a8a]" />
            <div>
              <h1 className="text-xl font-bold text-[#111827]">Gestion des Réservations de Salles</h1>
              <p className="text-sm text-[#6b7280] mt-0.5">Validation et suivi des demandes</p>
            </div>
          </div>
          <select 
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="rounded-lg border border-[#e5e7eb] bg-white px-4 py-2 text-sm outline-none focus:border-[#1e3a8a]">
            <option value="all">Toutes les réservations</option>
            <option value="pending">En attente</option>
            <option value="approved">Approuvées</option>
            <option value="rejected">Refusées</option>
          </select>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 flex items-center gap-3">
            <Clock className="h-8 w-8 text-amber-600" />
            <div>
              <p className="text-2xl font-extrabold text-amber-900">{stats.pending}</p>
              <p className="text-xs text-amber-700">En attente</p>
            </div>
          </div>
          <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3 flex items-center gap-3">
            <CheckCircle className="h-8 w-8 text-emerald-600" />
            <div>
              <p className="text-2xl font-extrabold text-emerald-900">{stats.approved}</p>
              <p className="text-xs text-emerald-700">Approuvées</p>
            </div>
          </div>
          <div className="rounded-lg bg-red-50 border border-red-200 p-3 flex items-center gap-3">
            <XCircle className="h-8 w-8 text-red-600" />
            <div>
              <p className="text-2xl font-extrabold text-red-900">{stats.rejected}</p>
              <p className="text-xs text-red-700">Refusées</p>
            </div>
          </div>
        </div>
      </div>

      {/* Reservations list */}
      <div className="rounded-xl border border-[#e5e7eb] bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-[#f3f4f6] bg-[#f9fafb]">
              <tr>
                {['ID','Salle','Demandeur','Motif','Date','Horaire','Durée','Participants','Statut','Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-[#6b7280] uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f9fafb]">
              {filtered.map(res => {
                const config = statusConfig[res.status]
                const StatusIcon = config.icon
                return (
                  <tr key={res.id} className="hover:bg-[#f9fafb] transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-[#6b7280]">{res.id}</td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-semibold text-[#111827]">{res.classroom}</p>
                        <p className="text-xs text-[#6b7280]">{res.building}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Avatar name={res.requestedBy} size="sm" />
                        <div>
                          <p className="font-medium text-[#111827]">{res.requestedBy}</p>
                          <p className="text-xs text-[#6b7280]">{res.role}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 max-w-xs">
                      <p className="text-[#374151] truncate">{res.purpose}</p>
                    </td>
                    <td className="px-4 py-3 text-[#374151] whitespace-nowrap">{res.date}</td>
                    <td className="px-4 py-3 font-mono text-xs text-[#6b7280] whitespace-nowrap">
                      {res.startTime} - {res.endTime}
                    </td>
                    <td className="px-4 py-3 text-[#374151]">{res.duration}</td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-1 text-[#374151]">
                        <Users className="h-3.5 w-3.5" />
                        {res.participants}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={config.variant} className="flex items-center gap-1 w-fit">
                        <StatusIcon className="h-3 w-3" />
                        {config.label}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button 
                          onClick={() => setSelectedReservation(res)}
                          className="rounded p-1 hover:bg-[#f3f4f6] text-[#1e3a8a]" title="Voir détails">
                          <Eye className="h-4 w-4" />
                        </button>
                        {res.status === 'pending' && (
                          <>
                            <button 
                              onClick={() => handleApprove(res.id)}
                              className="rounded p-1 hover:bg-emerald-50 text-emerald-600" title="Approuver">
                              <CheckCircle className="h-4 w-4" />
                            </button>
                            <button 
                              onClick={() => handleReject(res.id)}
                              className="rounded p-1 hover:bg-red-50 text-red-600" title="Refuser">
                              <XCircle className="h-4 w-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedReservation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in"
          onClick={() => setSelectedReservation(null)}>
          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="bg-[#1e3a8a] p-6 text-white">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-extrabold mb-1">Détails de la réservation</h2>
                  <p className="text-sm text-blue-100">ID: {selectedReservation.id} • Demandée le {selectedReservation.requestDate}</p>
                </div>
                <button onClick={() => setSelectedReservation(null)} className="text-white hover:bg-white/20 rounded-lg p-2">
                  <XCircle className="h-6 w-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg border border-[#e5e7eb] p-4">
                  <p className="text-xs text-[#6b7280] mb-1">Salle demandée</p>
                  <p className="font-bold text-[#111827]">{selectedReservation.classroom}</p>
                  <p className="text-xs text-[#6b7280]">{selectedReservation.building}</p>
                </div>
                <div className="rounded-lg border border-[#e5e7eb] p-4">
                  <p className="text-xs text-[#6b7280] mb-1">Statut</p>
                  <Badge variant={statusConfig[selectedReservation.status].variant} className="flex items-center gap-1 w-fit">
                    {React.createElement(statusConfig[selectedReservation.status].icon, { className: 'h-3 w-3' })}
                    {statusConfig[selectedReservation.status].label}
                  </Badge>
                </div>
              </div>

              <div className="rounded-lg border border-[#e5e7eb] p-4">
                <p className="text-xs text-[#6b7280] mb-2">Demandeur</p>
                <div className="flex items-center gap-3">
                  <Avatar name={selectedReservation.requestedBy} size="md" />
                  <div>
                    <p className="font-semibold text-[#111827]">{selectedReservation.requestedBy}</p>
                    <p className="text-sm text-[#6b7280]">{selectedReservation.role}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-[#e5e7eb] p-4">
                <p className="text-xs text-[#6b7280] mb-1">Motif de la demande</p>
                <p className="text-sm text-[#374151]">{selectedReservation.purpose}</p>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="rounded-lg border border-[#e5e7eb] p-4">
                  <p className="text-xs text-[#6b7280] mb-1 flex items-center gap-1"><Calendar className="h-3 w-3" />Date</p>
                  <p className="font-semibold text-[#111827]">{selectedReservation.date}</p>
                </div>
                <div className="rounded-lg border border-[#e5e7eb] p-4">
                  <p className="text-xs text-[#6b7280] mb-1 flex items-center gap-1"><Clock className="h-3 w-3" />Horaire</p>
                  <p className="font-mono text-sm text-[#111827]">{selectedReservation.startTime} - {selectedReservation.endTime}</p>
                  <p className="text-xs text-[#6b7280]">{selectedReservation.duration}</p>
                </div>
                <div className="rounded-lg border border-[#e5e7eb] p-4">
                  <p className="text-xs text-[#6b7280] mb-1 flex items-center gap-1"><Users className="h-3 w-3" />Participants</p>
                  <p className="font-semibold text-[#111827]">{selectedReservation.participants}</p>
                </div>
              </div>

              {selectedReservation.status === 'pending' && (
                <div className="flex gap-3 pt-4 border-t border-[#e5e7eb]">
                  <button onClick={() => handleReject(selectedReservation.id)}
                    className="flex-1 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-700 hover:bg-red-100 transition-colors flex items-center justify-center gap-2">
                    <XCircle className="h-4 w-4" /> Refuser
                  </button>
                  <button onClick={() => handleApprove(selectedReservation.id)}
                    className="flex-1 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2">
                    <CheckCircle className="h-4 w-4" /> Approuver
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
