'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Organizer {
  clubId: string
  clubName: string | null
  clubShortName: string | null
}

interface Tournament {
  id: string
  name: string
  date: string
  location: string
  type: 'national' | 'international' | 'em' | 'wm'
  status: 'upcoming' | 'completed'
  participantCount?: number | null
  logoUrl?: string | null
  posterUrl?: string | null
  organizers: Organizer[]
}

interface Club {
  id: string
  name: string
  shortName?: string | null
}

interface ParsedCategory {
  name: string
  arm: string
  gender: string
  type: string
  weightClass: string
  athleteCount: number
  placements: { position: number; name: string; country: string }[]
}

interface AthletePoints {
  name: string
  categories: {
    category: string
    arm: string
    position: number
    basePoints: number
    sizeBonus: number
    total: number
  }[]
  bestCategory: string
  totalPoints: number
}

interface ParsedResults {
  tournamentName: string
  totalCategories: number
  totalAthletes: number
  categories: ParsedCategory[]
  slpRankings: AthletePoints[]
}

interface Session {
  role: 'super_admin' | 'admin'
  clubId?: string
}

export default function TournamentsPage() {
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [clubs, setClubs] = useState<Club[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [showImageModal, setShowImageModal] = useState(false)
  const [showResultsModal, setShowResultsModal] = useState(false)
  const [uploadingTournament, setUploadingTournament] = useState<Tournament | null>(null)
  const [parsedResults, setParsedResults] = useState<ParsedResults | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [editingTournament, setEditingTournament] = useState<Tournament | null>(null)
  const [sortField, setSortField] = useState<'name' | 'date' | 'location' | 'type' | 'status'>('date')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  const [session, setSession] = useState<Session | null>(null)

  const isSuperAdmin = session?.role === 'super_admin'

  // Check if user is organizer of a tournament
  const isOrganizerOf = (tournament: Tournament): boolean => {
    if (!session?.clubId) return false
    return tournament.organizers.some(o => o.clubId === session.clubId)
  }

  // Fetch session from API (cookie is httpOnly so can't read directly)
  useEffect(() => {
    fetch('/api/auth/me', { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          setSession(data.user)
        }
      })
      .catch(console.error)
  }, [])

  // Fetch tournaments and clubs
  useEffect(() => {
    async function fetchData() {
      try {
        const [tournamentsRes, clubsRes] = await Promise.all([
          fetch('/api/tournaments', { credentials: 'include' }),
          fetch('/api/clubs', { credentials: 'include' }),
        ])

        if (!tournamentsRes.ok) throw new Error('Failed to fetch tournaments')

        const tournamentsData = await tournamentsRes.json()
        setTournaments(tournamentsData.map((t: Tournament & { date: string }) => ({
          ...t,
          date: t.date.split('T')[0],
          organizers: t.organizers || [],
        })))

        if (clubsRes.ok) {
          const clubsData = await clubsRes.json()
          setClubs(clubsData)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load tournaments')
        console.error('Failed to fetch data:', err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

  const [formData, setFormData] = useState({
    name: '',
    date: '',
    location: '',
    type: 'national' as Tournament['type'],
    status: 'upcoming' as Tournament['status'],
    organizerClubIds: [] as string[],
  })

  const [imageFormData, setImageFormData] = useState({
    logoUrl: '',
    posterUrl: '',
  })

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const SortIcon = ({ field }: { field: typeof sortField }) => (
    <span className="ml-1 inline-block">
      {sortField === field ? (
        sortDirection === 'asc' ? '↑' : '↓'
      ) : (
        <span className="text-gray-600">↕</span>
      )}
    </span>
  )

  const sortedTournaments = [...tournaments].sort((a, b) => {
    let comparison = 0
    switch (sortField) {
      case 'name':
        comparison = a.name.localeCompare(b.name)
        break
      case 'date':
        comparison = new Date(a.date).getTime() - new Date(b.date).getTime()
        break
      case 'location':
        comparison = a.location.localeCompare(b.location)
        break
      case 'type':
        comparison = a.type.localeCompare(b.type)
        break
      case 'status':
        comparison = a.status.localeCompare(b.status)
        break
    }
    return sortDirection === 'asc' ? comparison : -comparison
  })

  const openAddModal = () => {
    setEditingTournament(null)
    setFormData({ name: '', date: '', location: '', type: 'national', status: 'upcoming', organizerClubIds: [] })
    setShowModal(true)
  }

  const openEditModal = (tournament: Tournament) => {
    setEditingTournament(tournament)
    setFormData({
      name: tournament.name,
      date: tournament.date,
      location: tournament.location,
      type: tournament.type,
      status: tournament.status,
      organizerClubIds: tournament.organizers.map(o => o.clubId),
    })
    setShowModal(true)
  }

  // Open image-only edit modal for club admin organizers
  const openImageModal = (tournament: Tournament) => {
    setEditingTournament(tournament)
    setImageFormData({
      logoUrl: tournament.logoUrl || '',
      posterUrl: tournament.posterUrl || '',
    })
    setShowImageModal(true)
  }

  const openResultsModal = (tournament: Tournament) => {
    setUploadingTournament(tournament)
    setParsedResults(null)
    setUploadError(null)
    setShowResultsModal(true)
  }

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !uploadingTournament) return

    setIsUploading(true)
    setUploadError(null)
    setParsedResults(null)

    try {
      const formData = new FormData()
      formData.append('pdf', file)
      formData.append('tournamentType', uploadingTournament.type)

      const response = await fetch('/api/tournaments/parse-pdf', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to parse PDF')
      }

      setParsedResults(data)
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : 'Failed to upload PDF')
    } finally {
      setIsUploading(false)
    }
  }

  const handleConfirmResults = async () => {
    if (!parsedResults || !uploadingTournament) return

    try {
      const response = await fetch(`/api/tournaments/${uploadingTournament.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          status: 'completed',
          participantCount: parsedResults.totalAthletes,
          categories: parsedResults.categories,
        }),
      })

      if (!response.ok) throw new Error('Failed to update tournament')

      const updated = await response.json()

      setTournaments(tournaments.map(t =>
        t.id === uploadingTournament.id
          ? { ...updated, date: updated.date.split('T')[0], organizers: updated.organizers || [] }
          : t
      ))

      setShowResultsModal(false)
      setUploadingTournament(null)
      setParsedResults(null)
    } catch (err) {
      console.error('Failed to confirm results:', err)
      alert('Fehler beim Speichern der Resultate')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      if (editingTournament) {
        const response = await fetch(`/api/tournaments/${editingTournament.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(formData),
        })
        if (!response.ok) throw new Error('Failed to update tournament')
        const updated = await response.json()
        setTournaments(tournaments.map(t =>
          t.id === editingTournament.id
            ? { ...updated, date: updated.date.split('T')[0], organizers: updated.organizers || [] }
            : t
        ))
      } else {
        const response = await fetch('/api/tournaments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(formData),
        })
        if (!response.ok) throw new Error('Failed to create tournament')
        const newTournament = await response.json()
        setTournaments([...tournaments, { ...newTournament, date: newTournament.date.split('T')[0], organizers: newTournament.organizers || [] }])
      }

      setShowModal(false)
      setEditingTournament(null)
    } catch (err) {
      console.error('Failed to save tournament:', err)
      alert('Fehler beim Speichern des Turniers')
    }
  }

  // Handle image upload for club admin organizers
  const handleImageUpload = async (file: File, type: 'logo' | 'poster') => {
    if (!editingTournament) return

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', `tournament-${type}`)
      formData.append('id', editingTournament.id)

      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      })

      const data = await uploadRes.json()
      if (!uploadRes.ok) {
        throw new Error(data.error || 'Upload failed')
      }

      setImageFormData(prev => ({
        ...prev,
        [type === 'logo' ? 'logoUrl' : 'posterUrl']: data.url,
      }))
    } catch (err) {
      console.error('Upload failed:', err)
      alert(err instanceof Error ? err.message : 'Upload fehlgeschlagen')
    }
  }

  const handleImageSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingTournament) return

    try {
      const response = await fetch(`/api/tournaments/${editingTournament.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(imageFormData),
      })
      if (!response.ok) throw new Error('Failed to update tournament')
      const updated = await response.json()
      setTournaments(tournaments.map(t =>
        t.id === editingTournament.id
          ? { ...updated, date: updated.date.split('T')[0], organizers: updated.organizers || [] }
          : t
      ))

      setShowImageModal(false)
      setEditingTournament(null)
    } catch (err) {
      console.error('Failed to save images:', err)
      alert('Fehler beim Speichern')
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('Turnier wirklich löschen?')) {
      try {
        const response = await fetch(`/api/tournaments/${id}`, {
          method: 'DELETE',
          credentials: 'include',
        })
        if (!response.ok) throw new Error('Failed to delete tournament')
        setTournaments(tournaments.filter(t => t.id !== id))
      } catch (err) {
        console.error('Failed to delete tournament:', err)
        alert('Fehler beim Löschen des Turniers')
      }
    }
  }

  const handleOrganizerToggle = (clubId: string) => {
    setFormData(prev => ({
      ...prev,
      organizerClubIds: prev.organizerClubIds.includes(clubId)
        ? prev.organizerClubIds.filter(id => id !== clubId)
        : [...prev.organizerClubIds, clubId],
    }))
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Turniere</h1>
          <p className="text-gray-400">
            {isSuperAdmin ? 'Verwalte Turniere und lade Resultate hoch' : 'Übersicht aller Turniere'}
          </p>
        </div>
        {isSuperAdmin && (
          <button
            onClick={openAddModal}
            className="px-4 py-2 bg-primary hover:bg-primary-light text-white rounded-lg transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Turnier hinzufügen
          </button>
        )}
      </div>

      {/* Read-only notice for club admins */}
      {!isSuperAdmin && (
        <div className="mb-6 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg text-sm text-blue-400">
          Als Club-Admin kannst du nur Logo und Poster für Turniere hochladen, bei denen dein Club als Organisator eingetragen ist.
        </div>
      )}

      {/* Table */}
      <div className="bg-dark-700/50 rounded-xl border border-primary/20 overflow-hidden">
        <table className="w-full">
          <thead className="bg-dark-600/50">
            <tr className="text-left text-gray-400 text-sm">
              <th className="py-3 px-4 cursor-pointer hover:text-white" onClick={() => handleSort('name')}>
                Turnier<SortIcon field="name" />
              </th>
              <th className="py-3 px-4 cursor-pointer hover:text-white" onClick={() => handleSort('date')}>
                Datum<SortIcon field="date" />
              </th>
              <th className="py-3 px-4 cursor-pointer hover:text-white" onClick={() => handleSort('location')}>
                Ort<SortIcon field="location" />
              </th>
              <th className="py-3 px-4 cursor-pointer hover:text-white" onClick={() => handleSort('type')}>
                Typ<SortIcon field="type" />
              </th>
              <th className="py-3 px-4">Organisator</th>
              <th className="py-3 px-4 cursor-pointer hover:text-white" onClick={() => handleSort('status')}>
                Status<SortIcon field="status" />
              </th>
              <th className="py-3 px-4">Aktionen</th>
            </tr>
          </thead>
          <tbody>
            {sortedTournaments.map(tournament => {
              const canEdit = isSuperAdmin || isOrganizerOf(tournament)
              return (
                <tr key={tournament.id} className="border-t border-dark-600 hover:bg-dark-600/30">
                  <td className="py-3 px-4 font-medium">{tournament.name}</td>
                  <td className="py-3 px-4 text-gray-400">
                    {new Date(tournament.date).toLocaleDateString('de-CH')}
                  </td>
                  <td className="py-3 px-4 text-gray-400">{tournament.location}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded text-sm capitalize ${
                      tournament.type === 'national' ? 'bg-blue-500/20 text-blue-400' :
                      tournament.type === 'international' ? 'bg-purple-500/20 text-purple-400' :
                      tournament.type === 'em' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-gold/20 text-gold'
                    }`}>
                      {tournament.type === 'em' ? 'EM' : tournament.type === 'wm' ? 'WM' : tournament.type}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    {tournament.organizers.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {tournament.organizers.map(o => (
                          <span key={o.clubId} className="px-2 py-0.5 bg-dark-600 text-gray-300 rounded text-xs">
                            {o.clubShortName || o.clubName}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-500 text-sm">-</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded text-sm ${
                      tournament.status === 'completed'
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-orange-500/20 text-orange-400'
                    }`}>
                      {tournament.status === 'completed' ? 'Abgeschlossen' : 'Bevorstehend'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      {isSuperAdmin && (
                        <>
                          {tournament.status === 'completed' && (
                            <Link
                              href={`/admin/tournaments/${tournament.id}/verify`}
                              className="px-3 py-1 bg-green-500/20 text-green-400 hover:bg-green-500/30 rounded text-sm transition-colors"
                            >
                              Verifizieren
                            </Link>
                          )}
                          {tournament.status === 'upcoming' && (
                            <button
                              onClick={() => openResultsModal(tournament)}
                              className="px-3 py-1 bg-primary/20 text-primary hover:bg-primary/30 rounded text-sm transition-colors"
                            >
                              Resultate hochladen
                            </button>
                          )}
                          <button
                            onClick={() => openEditModal(tournament)}
                            className="p-2 text-gray-400 hover:text-white hover:bg-dark-600 rounded transition-colors"
                            title="Bearbeiten"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete(tournament.id)}
                            className="p-2 text-gray-400 hover:text-red-400 hover:bg-dark-600 rounded transition-colors"
                            title="Löschen"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </>
                      )}
                      {!isSuperAdmin && canEdit && (
                        <button
                          onClick={() => openImageModal(tournament)}
                          className="px-3 py-1 bg-primary/20 text-primary hover:bg-primary/30 rounded text-sm transition-colors"
                          title="Logo/Poster hochladen"
                        >
                          Bilder
                        </button>
                      )}
                      {!isSuperAdmin && !canEdit && (
                        <span className="text-gray-500 text-sm">-</span>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {isLoading && (
          <div className="py-8 text-center text-gray-400">
            Lade Turniere...
          </div>
        )}
        {error && (
          <div className="py-8 text-center text-red-400">
            {error}
          </div>
        )}
        {!isLoading && !error && tournaments.length === 0 && (
          <div className="py-8 text-center text-gray-500">
            Keine Turniere vorhanden.
          </div>
        )}
      </div>

      {/* SLP Bonus Info */}
      <div className="mt-6 p-4 bg-dark-700/50 rounded-xl border border-primary/20">
        <h3 className="font-semibold mb-2">SLP Bonus pro Turniertyp</h3>
        <div className="flex gap-4 text-sm">
          <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded">National: +0</span>
          <span className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded">International: +7</span>
          <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded">EM: +9</span>
          <span className="px-2 py-1 bg-gold/20 text-gold rounded">WM: +10</span>
        </div>
      </div>

      {/* Add/Edit Modal (Super Admin only) */}
      {showModal && isSuperAdmin && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-dark-800 rounded-xl border border-primary/20 p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {editingTournament ? 'Turnier bearbeiten' : 'Turnier hinzufügen'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="z.B. Züri Cup 2026"
                    className="w-full px-4 py-2 bg-dark-700 border border-dark-500 rounded-lg text-white focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Datum *</label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-4 py-2 bg-dark-700 border border-dark-500 rounded-lg text-white focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Ort *</label>
                  <input
                    type="text"
                    required
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="z.B. Zürich"
                    className="w-full px-4 py-2 bg-dark-700 border border-dark-500 rounded-lg text-white focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Typ</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as Tournament['type'] })}
                    className="w-full px-4 py-2 bg-dark-700 border border-dark-500 rounded-lg text-white focus:outline-none focus:border-primary"
                  >
                    <option value="national">National</option>
                    <option value="international">International</option>
                    <option value="em">Europameisterschaft</option>
                    <option value="wm">Weltmeisterschaft</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as Tournament['status'] })}
                    className="w-full px-4 py-2 bg-dark-700 border border-dark-500 rounded-lg text-white focus:outline-none focus:border-primary"
                  >
                    <option value="upcoming">Bevorstehend</option>
                    <option value="completed">Abgeschlossen</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Organisator-Clubs</label>
                  <div className="space-y-2 max-h-40 overflow-y-auto border border-dark-500 rounded-lg p-2">
                    {clubs.map(club => (
                      <label key={club.id} className="flex items-center gap-2 cursor-pointer hover:bg-dark-600 p-1 rounded">
                        <input
                          type="checkbox"
                          checked={formData.organizerClubIds.includes(club.id)}
                          onChange={() => handleOrganizerToggle(club.id)}
                          className="rounded border-dark-500 bg-dark-700 text-primary focus:ring-primary"
                        />
                        <span className="text-sm">{club.shortName || club.name}</span>
                      </label>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Diese Clubs können Logo und Poster hochladen</p>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 bg-dark-600 hover:bg-dark-500 text-white rounded-lg transition-colors"
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-primary hover:bg-primary-light text-white rounded-lg transition-colors"
                >
                  {editingTournament ? 'Speichern' : 'Hinzufügen'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Image Upload Modal (for club admin organizers) */}
      {showImageModal && editingTournament && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-dark-800 rounded-xl border border-primary/20 p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              Logo & Poster hochladen
            </h2>
            <p className="text-gray-400 text-sm mb-4">{editingTournament.name}</p>
            <form onSubmit={handleImageSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Turnier-Logo</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleImageUpload(file, 'logo')
                    }}
                    className="w-full px-4 py-2 bg-dark-700 border border-dark-500 rounded-lg text-white focus:outline-none focus:border-primary file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:bg-primary file:text-white file:cursor-pointer"
                  />
                  <p className="text-xs text-gray-500 mt-1">Kleines Logo für Listen und Übersichten</p>
                  {imageFormData.logoUrl && (
                    <div className="mt-2 text-xs text-green-400">Logo hochgeladen</div>
                  )}
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Turnier-Poster</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleImageUpload(file, 'poster')
                    }}
                    className="w-full px-4 py-2 bg-dark-700 border border-dark-500 rounded-lg text-white focus:outline-none focus:border-primary file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:bg-primary file:text-white file:cursor-pointer"
                  />
                  <p className="text-xs text-gray-500 mt-1">Grosses Plakat/Flyer für die Turnierseite</p>
                  {imageFormData.posterUrl && (
                    <div className="mt-2 text-xs text-green-400">Poster hochgeladen</div>
                  )}
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowImageModal(false)}
                  className="flex-1 px-4 py-2 bg-dark-600 hover:bg-dark-500 text-white rounded-lg transition-colors"
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-primary hover:bg-primary-light text-white rounded-lg transition-colors"
                >
                  Speichern
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Results Upload Modal */}
      {showResultsModal && uploadingTournament && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-800 rounded-xl border border-primary/20 p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-xl font-bold">Resultate hochladen</h2>
                <p className="text-gray-400 text-sm mt-1">{uploadingTournament.name}</p>
              </div>
              <button
                onClick={() => setShowResultsModal(false)}
                className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-dark-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Upload Section */}
            <div className="mb-6">
              <label className="block text-sm text-gray-400 mb-2">Standings PDF hochladen</label>
              <div className="border-2 border-dashed border-dark-500 rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handlePdfUpload}
                  className="hidden"
                  id="pdf-upload"
                  disabled={isUploading}
                />
                <label htmlFor="pdf-upload" className="cursor-pointer">
                  {isUploading ? (
                    <div className="flex flex-col items-center">
                      <svg className="w-8 h-8 text-primary animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span className="text-gray-400 mt-2">PDF wird verarbeitet...</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <svg className="w-12 h-12 text-gray-500 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <span className="text-gray-400">Klicke oder ziehe eine PDF-Datei hierher</span>
                      <span className="text-gray-500 text-sm mt-1">Format: Standings_Turniername.pdf</span>
                    </div>
                  )}
                </label>
              </div>
              {uploadError && (
                <p className="text-red-400 text-sm mt-2">{uploadError}</p>
              )}
            </div>

            {/* Parsed Results Preview */}
            {parsedResults && (
              <div className="space-y-6">
                {/* Summary Stats */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 bg-dark-700/50 rounded-lg border border-primary/20">
                    <div className="text-2xl font-bold text-primary">{parsedResults.totalAthletes}</div>
                    <div className="text-sm text-gray-400">Athleten</div>
                  </div>
                  <div className="p-4 bg-dark-700/50 rounded-lg border border-primary/20">
                    <div className="text-2xl font-bold text-white">{parsedResults.totalCategories}</div>
                    <div className="text-sm text-gray-400">Kategorien</div>
                  </div>
                  <div className="p-4 bg-dark-700/50 rounded-lg border border-primary/20">
                    <div className="text-2xl font-bold text-primary">{parsedResults.slpRankings.length}</div>
                    <div className="text-sm text-gray-400">CH Athleten</div>
                  </div>
                </div>

                {/* Parsed Categories with Placements */}
                <div>
                  <h3 className="font-semibold mb-3">Geparste Kategorien & Platzierungen</h3>
                  <div className="space-y-4 max-h-[400px] overflow-y-auto">
                    {parsedResults.categories.map((cat, i) => (
                      <div key={i} className="bg-dark-700/50 rounded-lg border border-dark-500 overflow-hidden">
                        <div className="px-4 py-2 bg-dark-600/50 border-b border-dark-500">
                          <div className="font-medium">{cat.name}</div>
                          <div className="text-gray-500 text-xs flex gap-2">
                            <span className={`px-2 py-0.5 rounded ${cat.arm === 'left' ? 'bg-blue-500/20 text-blue-400' : 'bg-orange-500/20 text-orange-400'}`}>
                              {cat.arm === 'left' ? 'Links' : 'Rechts'}
                            </span>
                            <span className="text-gray-400">{cat.athleteCount} Athleten</span>
                            <span className="text-gray-400">{cat.weightClass}</span>
                          </div>
                        </div>
                        <table className="w-full text-sm">
                          <thead className="bg-dark-600/30">
                            <tr className="text-left text-gray-400 text-xs">
                              <th className="py-1.5 px-3 w-12">Platz</th>
                              <th className="py-1.5 px-3">Name</th>
                              <th className="py-1.5 px-3 w-24">Land</th>
                            </tr>
                          </thead>
                          <tbody>
                            {cat.placements.map((p) => (
                              <tr key={`${cat.name}-${p.position}`} className="border-t border-dark-600/50">
                                <td className="py-1.5 px-3 font-medium text-primary">{p.position}</td>
                                <td className="py-1.5 px-3">{p.name}</td>
                                <td className="py-1.5 px-3">
                                  <span className={`text-xs ${p.country.toLowerCase() === 'switzerland' ? 'text-green-400' : 'text-gray-400'}`}>
                                    {p.country}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Confirm Button */}
                <div className="flex gap-3 pt-4 border-t border-dark-600">
                  <button
                    onClick={() => {
                      setParsedResults(null)
                      setUploadError(null)
                    }}
                    className="flex-1 px-4 py-2 bg-dark-600 hover:bg-dark-500 text-white rounded-lg transition-colors"
                  >
                    Andere Datei wählen
                  </button>
                  <button
                    onClick={handleConfirmResults}
                    className="flex-1 px-4 py-2 bg-primary hover:bg-primary-light text-white rounded-lg transition-colors"
                  >
                    Resultate bestätigen & speichern
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
