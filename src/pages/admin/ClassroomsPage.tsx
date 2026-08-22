import React, { useState } from 'react'
import { Calendar, Clock, CheckCircle, XCircle, MapPin, Users, Eye, Sparkles, Filter, Check, X, ShieldAlert } from 'lucide-react'
import { Badge } from '../../components/ui/Badge'
import { Avatar } from '../../components/ui/Avatar'
import { cn } from '../../utils/cn'

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

const initialReservations: Reservation[] = [
  {
    id: 'R001',
    classroom: 'Salle A204',
    building: 'Bâtiment A',
    requestedBy: 'Dr. Martin',
    role: 'Enseignant',
    purpose: 'TP Programmation Web',
    date: '2026-05-22',
    startTime: '14:00',
    endTime: '16:00',
    duration: '2h',
    participants: 25,
    status: 'pending',
    requestDate: '2026-05-18 10:30'
  },
  {
    id: 'R002',
    classroom: 'Amphi B105',
    building: 'Bâtiment B',
    requestedBy: 'Lucas Dubois (Délégué)',
    role: 'Délégué',
    purpose: 'Réunion étudiants ICT4D L1',
    date: '2026-05-23',
    startTime: '16:00',
    endTime: '18:00',
    duration: '2h',
    participants: 80,
    status: 'pending',
    requestDate: '2026-05-19 14:20'
  },
  {
    id: 'R003',
    classroom: 'Salle C301',
    building: 'Bâtiment C',
    requestedBy: 'Emma Martin',
    role: 'Étudiant',
    purpose: 'Travail de groupe Projet POO',
    date: '2026-05-24',
    startTime: '10:00',
    endTime: '12:00',
    duration: '2h',
    participants: 6,
    status: 'pending',
    requestDate: '2026-05-20 09:15'
  },
  {
    id: 'R004',
    classroom: 'Salle A101',
    building: 'Bâtiment A',
    requestedBy: 'Pr. Lambert',
    role: 'Enseignant',
    purpose: 'Cours Algorithmique',
    date: '2026-05-21',
    startTime: '08:00',
    endTime: '10:00',
    duration: '2h',
    participants: 30,
    status: 'approved',
    requestDate: '2026-05-15 16:00'
  },
  {
    id: 'R005',
    classroom: 'Labo C302',
    building: 'Bâtiment C',
    requestedBy: 'Marie Dupont',
    role: 'Étudiant',
    purpose: 'Répétition présentation',
    date: '2026-05-20',
    startTime: '18:00',
    endTime: '20:00',
    duration: '2h',
    participants: 4,
    status: 'rejected',
    requestDate: '2026-05-19 20:30'
  },
]

export default function ClassroomsPage() {
  const [filter, setFilter] = useState<ReservationStatus | 'all'>('pending')
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null)
  const [reservations, setReservations] = useState<Reservation[]>(initialReservations)

  const filtered = reservations.filter(r => filter === 'all' || r.status === filter)

  const stats = {
    pending: reservations.filter(r => r.status === 'pending').length,
    approved: reservations.filter(r => r.status === 'approved').length,
    rejected: reservations.filter(r => r.status === 'rejected').length,
  }

  const handleApprove = (id: string) => {
    setReservations(prev =>
      prev.map(r => r.id === id ? { ...r, status: 'approved' } : r)
    )
    if (selectedReservation?.id === id) {
      setSelectedReservation(prev => prev ? { ...prev, status: 'approved' } : null)
    }
  }

  const handleReject = (id: string) => {
    setReservations(prev =>
      prev.map(r => r.id === id ? { ...r, status: 'rejected' } : r)
    )
    if (selectedReservation?.id === id) {
      setSelectedReservation(prev => prev ? { ...prev, status: 'rejected' } : null)
    }
  }

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* 3D Admin Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#1e3a8a] via-[#1d4ed8] to-[#0f766e] p-6 sm:p-8 text-white shadow-xl border-b-8 border-[#0f2560]">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-xs font-bold backdrop-blur-md border border-white/30 text-white shadow-inner mb-3">
              <Sparkles className="h-3.5 w-3.5 text-amber-300" />
              <span>Panneau d'Administration Salles</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Gestion & Validation des Réservations
            </h1>
            <p className="text-sm text-blue-100/90 mt-1 max-w-xl">
              Validez les demandes d'occupation de salles faites par les enseignants et délégués étudiants.
            </p>
          </div>

          {/* 3D Stat Badges */}
          <div className="grid grid-cols-3 gap-3 shrink-0">
            <button
              onClick={() => setFilter('pending')}
              className={cn(
                'rounded-2xl p-3.5 backdrop-blur-md border shadow-[0_4px_0_0_rgba(0,0,0,0.2)] text-center transition-all',
                filter === 'pending'
                  ? 'bg-amber-500/40 border-amber-300 text-white scale-105'
                  : 'bg-white/10 border-white/20 text-blue-100 hover:bg-white/20'
              )}
            >
              <div className="text-2xl font-black text-amber-300">{stats.pending}</div>
              <div className="text-[10px] font-bold uppercase tracking-wider mt-0.5">En attente</div>
            </button>

            <button
              onClick={() => setFilter('approved')}
              className={cn(
                'rounded-2xl p-3.5 backdrop-blur-md border shadow-[0_4px_0_0_rgba(0,0,0,0.2)] text-center transition-all',
                filter === 'approved'
                  ? 'bg-emerald-500/40 border-emerald-300 text-white scale-105'
                  : 'bg-white/10 border-white/20 text-blue-100 hover:bg-white/20'
              )}
            >
              <div className="text-2xl font-black text-emerald-300">{stats.approved}</div>
              <div className="text-[10px] font-bold uppercase tracking-wider mt-0.5">Approuvées</div>
            </button>

            <button
              onClick={() => setFilter('rejected')}
              className={cn(
                'rounded-2xl p-3.5 backdrop-blur-md border shadow-[0_4px_0_0_rgba(0,0,0,0.2)] text-center transition-all',
                filter === 'rejected'
                  ? 'bg-rose-500/40 border-rose-300 text-white scale-105'
                  : 'bg-white/10 border-white/20 text-blue-100 hover:bg-white/20'
              )}
            >
              <div className="text-2xl font-black text-rose-300">{stats.rejected}</div>
              <div className="text-[10px] font-bold uppercase tracking-wider mt-0.5">Refusées</div>
            </button>
          </div>
        </div>
      </div>

      {/* 3D Filter Bar */}
      <div className="flex items-center justify-between gap-4 bg-white p-3 rounded-2xl border-2 border-[#e5e7eb] shadow-md">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setFilter('all')}
            className={cn(
              'rounded-xl px-4 py-2 text-xs font-black uppercase tracking-wider transition-all select-none',
              filter === 'all'
                ? 'bg-blue-600 text-white shadow-[0_4px_0_0_#1e3a8a]'
                : 'bg-[#f3f4f6] text-[#4b5563] hover:bg-[#e5e7eb]'
            )}
          >
            Toutes ({reservations.length})
          </button>

          <button
            onClick={() => setFilter('pending')}
            className={cn(
              'rounded-xl px-4 py-2 text-xs font-black uppercase tracking-wider transition-all select-none',
              filter === 'pending'
                ? 'bg-amber-500 text-white shadow-[0_4px_0_0_#b45309]'
                : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
            )}
          >
            En attente ({stats.pending})
          </button>

          <button
            onClick={() => setFilter('approved')}
            className={cn(
              'rounded-xl px-4 py-2 text-xs font-black uppercase tracking-wider transition-all select-none',
              filter === 'approved'
                ? 'bg-emerald-600 text-white shadow-[0_4px_0_0_#065f46]'
                : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
            )}
          >
            Approuvées ({stats.approved})
          </button>

          <button
            onClick={() => setFilter('rejected')}
            className={cn(
              'rounded-xl px-4 py-2 text-xs font-black uppercase tracking-wider transition-all select-none',
              filter === 'rejected'
                ? 'bg-rose-600 text-white shadow-[0_4px_0_0_#9f1239]'
                : 'bg-rose-50 text-rose-800 hover:bg-rose-100'
            )}
          >
            Refusées ({stats.rejected})
          </button>
        </div>
      </div>

      {/* Reservations Table Container */}
      <div className="rounded-3xl border-2 border-[#e5e7eb] bg-white shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b-2 border-[#e5e7eb] bg-[#f8fafc]">
              <tr>
                {['ID','Salle & Bâtiment','Demandeur','Motif','Date & Horaire','Statut','Actions 3D'].map(h => (
                  <th key={h} className="px-5 py-3.5 text-left text-xs font-extrabold text-[#475569] uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f1f5f9]">
              {filtered.map(res => {
                const isPending = res.status === 'pending'
                const isApproved = res.status === 'approved'

                return (
                  <tr key={res.id} className="hover:bg-[#f8fafc] transition-colors">
                    <td className="px-5 py-4 font-mono text-xs font-extrabold text-blue-900">{res.id}</td>

                    <td className="px-5 py-4">
                      <div>
                        <p className="font-black text-[#0f172a] text-sm">{res.classroom}</p>
                        <p className="text-xs text-[#64748b]">{res.building}</p>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2.5">
                        <Avatar name={res.requestedBy} size="sm" />
                        <div>
                          <p className="font-extrabold text-[#1e293b] text-xs">{res.requestedBy}</p>
                          <span className="inline-block rounded-md bg-[#f1f5f9] px-2 py-0.5 text-[10px] font-bold text-[#475569]">
                            {res.role}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4 max-w-xs">
                      <p className="text-xs font-medium text-[#334155] line-clamp-1">{res.purpose}</p>
                      <span className="text-[10px] text-[#94a3b8]">{res.participants} participants</span>
                    </td>

                    <td className="px-5 py-4 text-xs font-bold text-[#334155] whitespace-nowrap">
                      <div>{res.date}</div>
                      <div className="font-mono text-[#64748b] text-[11px]">{res.startTime} - {res.endTime} ({res.duration})</div>
                    </td>

                    <td className="px-5 py-4 whitespace-nowrap">
                      {isPending && (
                        <span className="inline-flex items-center gap-1 rounded-xl bg-amber-100 border border-amber-300 px-3 py-1 text-xs font-black text-amber-800 shadow-2xs">
                          <Clock className="h-3.5 w-3.5" /> En attente
                        </span>
                      )}
                      {isApproved && (
                        <span className="inline-flex items-center gap-1 rounded-xl bg-emerald-100 border border-emerald-300 px-3 py-1 text-xs font-black text-emerald-800 shadow-2xs">
                          <CheckCircle className="h-3.5 w-3.5" /> Approuvée
                        </span>
                      )}
                      {!isPending && !isApproved && (
                        <span className="inline-flex items-center gap-1 rounded-xl bg-rose-100 border border-rose-300 px-3 py-1 text-xs font-black text-rose-800 shadow-2xs">
                          <XCircle className="h-3.5 w-3.5" /> Refusée
                        </span>
                      )}
                    </td>

                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedReservation(res)}
                          className="flex items-center gap-1 rounded-xl bg-blue-50 border border-blue-200 px-3 py-1.5 text-xs font-extrabold text-blue-700 hover:bg-blue-100 shadow-2xs active:translate-y-0.5 transition-all"
                        >
                          <Eye className="h-3.5 w-3.5" /> Voir
                        </button>

                        {isPending && (
                          <>
                            <button
                              onClick={() => handleApprove(res.id)}
                              className="flex items-center gap-1 rounded-xl bg-emerald-600 text-white px-3 py-1.5 text-xs font-black border-b-2 border-emerald-950 shadow-2xs hover:bg-emerald-700 active:translate-y-0.5 transition-all"
                            >
                              <Check className="h-3.5 w-3.5" /> Approuver
                            </button>

                            <button
                              onClick={() => handleReject(res.id)}
                              className="flex items-center gap-1 rounded-xl bg-rose-600 text-white px-3 py-1.5 text-xs font-black border-b-2 border-rose-950 shadow-2xs hover:bg-rose-700 active:translate-y-0.5 transition-all"
                            >
                              <X className="h-3.5 w-3.5" /> Refuser
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

      {/* Admin Detail Modal */}
      {selectedReservation && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-md p-4 animate-fade-in"
          onClick={() => setSelectedReservation(null)}
        >
          <div
            className="w-full max-w-xl rounded-3xl border-4 border-slate-700 bg-white shadow-2xl overflow-hidden text-slate-900"
            onClick={e => e.stopPropagation()}
          >
            <div className="bg-gradient-to-r from-blue-700 to-indigo-900 p-6 text-white relative">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-bold text-blue-200 uppercase">ID: {selectedReservation.id}</span>
                  <h2 className="text-2xl font-black">{selectedReservation.classroom}</h2>
                  <p className="text-xs text-blue-100">{selectedReservation.building}</p>
                </div>
                <button
                  onClick={() => setSelectedReservation(null)}
                  className="rounded-xl bg-white/10 p-2 text-white hover:bg-white/20"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4 space-y-2">
                <div className="flex justify-between items-center text-xs font-bold text-slate-600">
                  <span>Demandeur :</span>
                  <span className="text-slate-900">{selectedReservation.requestedBy} ({selectedReservation.role})</span>
                </div>
                <div className="flex justify-between items-center text-xs font-bold text-slate-600">
                  <span>Motif :</span>
                  <span className="text-slate-900">{selectedReservation.purpose}</span>
                </div>
                <div className="flex justify-between items-center text-xs font-bold text-slate-600">
                  <span>Horaire :</span>
                  <span className="text-slate-900">{selectedReservation.date} | {selectedReservation.startTime} - {selectedReservation.endTime}</span>
                </div>
              </div>

              {selectedReservation.status === 'pending' && (
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => handleReject(selectedReservation.id)}
                    className="flex-1 rounded-2xl bg-rose-600 text-white font-black py-3 text-xs uppercase tracking-wider border-b-4 border-rose-950 shadow-md hover:bg-rose-700 transition-all"
                  >
                    Refuser la réservation
                  </button>
                  <button
                    onClick={() => handleApprove(selectedReservation.id)}
                    className="flex-1 rounded-2xl bg-emerald-600 text-white font-black py-3 text-xs uppercase tracking-wider border-b-4 border-emerald-950 shadow-md hover:bg-emerald-700 transition-all"
                  >
                    Valider la réservation
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
