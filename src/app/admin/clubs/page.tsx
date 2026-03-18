'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { getClubLogo } from '@/lib/club-logos'

interface Club {
  id: string
  name: string
  shortName: string | null
  location: string | null
  logoUrl: string | null
  presidentId: string | null
}

interface Member {
  id: string
  firstName: string
  lastName: string
  clubId: string | null
  clubName: string | null
}

// Mock user - in production, this will come from Auth.js session
const mockUser = {
  email: 'admin@test.ch',
  role: 'super_admin' as 'super_admin' | 'club_admin',
}

export default function ClubsPage() {
  const [clubs, setClubs] = useState<Club[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [editingClub, setEditingClub] = useState<Club | null>(null)
  const [formData, setFormData] = useState({ name: '', shortName: '', location: '', presidentId: '' })
  const [sortBy, setSortBy] = useState<'name' | 'athletes'>('name')

  const isSuperAdmin = mockUser.role === 'super_admin'

  useEffect(() => {
    async function fetchData() {
      try {
        const [clubsRes, membersRes] = await Promise.all([
          fetch('/api/clubs'),
          fetch('/api/members')
        ])
        if (!clubsRes.ok || !membersRes.ok) throw new Error('Failed to fetch data')
        const [clubsData, membersData] = await Promise.all([
          clubsRes.json(),
          membersRes.json()
        ])
        setClubs(clubsData)
        setMembers(membersData)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data')
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

  // Count members per club
  const getMemberCount = (clubId: string) => members.filter(m => m.clubId === clubId).length

  // Get club members
  const getClubMembers = (clubId: string) => members.filter(m => m.clubId === clubId)

  // Get president name
  const getPresidentName = (presidentId: string | null) => {
    if (!presidentId) return null
    const president = members.find(m => m.id === presidentId)
    return president ? `${president.firstName} ${president.lastName}` : null
  }

  const openAddModal = () => {
    setEditingClub(null)
    setFormData({ name: '', shortName: '', location: '', presidentId: '' })
    setShowModal(true)
  }

  const openEditModal = (club: Club) => {
    setEditingClub(club)
    setFormData({
      name: club.name,
      shortName: club.shortName || '',
      location: club.location || '',
      presidentId: club.presidentId || '',
    })
    setShowModal(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      if (editingClub) {
        const response = await fetch(`/api/clubs/${editingClub.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        })
        if (!response.ok) throw new Error('Failed to update club')
        const updated = await response.json()
        setClubs(clubs.map(c => c.id === editingClub.id ? updated : c))
      } else {
        const response = await fetch('/api/clubs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        })
        if (!response.ok) throw new Error('Failed to create club')
        const newClub = await response.json()
        setClubs([...clubs, newClub])
      }

      setShowModal(false)
      setEditingClub(null)
    } catch (err) {
      console.error('Failed to save club:', err)
      alert('Fehler beim Speichern')
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('Verein wirklich löschen? Alle zugehörigen Athleten werden keinem Verein mehr zugeordnet.')) {
      try {
        const response = await fetch(`/api/clubs/${id}`, {
          method: 'DELETE',
        })
        if (!response.ok) throw new Error('Failed to delete club')
        setClubs(clubs.filter(c => c.id !== id))
      } catch (err) {
        console.error('Failed to delete club:', err)
        alert('Fehler beim Löschen')
      }
    }
  }

  const totalMembers = members.filter(m => m.clubId).length

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Vereine</h1>
          <p className="text-gray-400">
            {isSuperAdmin ? 'Verwalte alle Mitgliedsvereine' : 'Übersicht aller Mitgliedsvereine'}
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
            Verein hinzufügen
          </button>
        )}
      </div>

      {/* Loading/Error */}
      {isLoading && <div className="text-gray-400 mb-6">Lade Vereine...</div>}
      {error && <div className="text-red-400 mb-6">{error}</div>}

      {/* Read-only notice for club admins */}
      {!isSuperAdmin && (
        <div className="mb-6 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg text-sm text-blue-400">
          Du hast nur Lesezugriff auf die Vereinsübersicht. Nur Super Admins können Vereine bearbeiten.
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="p-4 bg-dark-700/50 rounded-xl border border-primary/20">
          <div className="text-2xl font-bold text-primary">{clubs.length}</div>
          <div className="text-sm text-gray-400">Vereine</div>
        </div>
        <div className="p-4 bg-dark-700/50 rounded-xl border border-primary/20">
          <div className="text-2xl font-bold text-white">{totalMembers}</div>
          <div className="text-sm text-gray-400">Athleten in Vereinen</div>
        </div>
      </div>

      {/* Sort Control */}
      <div className="flex justify-end mb-4">
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
          className="px-4 py-2 bg-dark-700 border border-dark-500 rounded-lg text-white focus:outline-none focus:border-primary"
        >
          <option value="name">Nach Name</option>
          <option value="athletes">Nach Athleten</option>
        </select>
      </div>

      {/* Clubs Grid */}
      {!isLoading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...clubs].sort((a, b) => {
            switch (sortBy) {
              case 'name': return a.name.localeCompare(b.name)
              case 'athletes': return getMemberCount(b.id) - getMemberCount(a.id)
              default: return 0
            }
          }).map(club => {
            const logo = getClubLogo(club.name)
            const memberCount = getMemberCount(club.id)
            const clubMembers = getClubMembers(club.id)
            return (
              <div
                key={club.id}
                className="p-6 bg-dark-700/50 rounded-xl border border-primary/20 hover:border-primary/40 transition-all"
              >
                <div className="flex items-start gap-4 mb-4">
                  {logo ? (
                    <div className="w-14 h-14 rounded-lg bg-white/10 overflow-hidden flex items-center justify-center p-1 flex-shrink-0">
                      <Image src={logo} alt={club.name} width={48} height={48} className="object-contain" />
                    </div>
                  ) : (
                    <div className="w-14 h-14 rounded-lg bg-dark-600 flex items-center justify-center text-xl font-bold text-primary flex-shrink-0">
                      {club.name.charAt(0)}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate">{club.name}</h3>
                    {club.shortName && <p className="text-sm text-gray-500">{club.shortName}</p>}
                    {club.location && <p className="text-sm text-gray-400">{club.location}</p>}
                  </div>
                </div>

                <div className="bg-dark-600/50 p-3 rounded-lg mb-4">
                  <div className="text-2xl font-bold text-white">{memberCount}</div>
                  <div className="text-xs text-gray-500">Mitglieder</div>
                </div>

                {/* President */}
                {club.presidentId && (
                  <div className="mb-4 text-sm">
                    <span className="text-gray-500">Präsident: </span>
                    <span className="text-white">{getPresidentName(club.presidentId)}</span>
                  </div>
                )}

                {/* Top Members Preview */}
                {clubMembers.length > 0 && (
                  <div className="mb-4 text-xs text-gray-500">
                    <span>Mitglieder: </span>
                    {clubMembers.slice(0, 3).map(m => m.firstName).join(', ')}
                    {clubMembers.length > 3 && ` +${clubMembers.length - 3}`}
                  </div>
                )}

                {isSuperAdmin && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEditModal(club)}
                      className="flex-1 px-3 py-2 bg-dark-600 hover:bg-dark-500 text-white rounded-lg text-sm transition-colors"
                    >
                      Bearbeiten
                    </button>
                    <button
                      onClick={() => handleDelete(club.id)}
                      className="px-3 py-2 text-gray-400 hover:text-red-400 hover:bg-dark-600 rounded-lg transition-colors"
                      title="Löschen"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {!isLoading && clubs.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          Keine Vereine vorhanden. Füge den ersten Verein hinzu.
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-dark-800 rounded-xl border border-primary/20 p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {editingClub ? 'Verein bearbeiten' : 'Verein hinzufügen'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Vereinsname *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="z.B. Armwrestling Bern"
                    className="w-full px-4 py-2 bg-dark-700 border border-dark-500 rounded-lg text-white focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Kurzname</label>
                  <input
                    type="text"
                    value={formData.shortName}
                    onChange={(e) => setFormData({ ...formData, shortName: e.target.value })}
                    placeholder="z.B. AWB"
                    className="w-full px-4 py-2 bg-dark-700 border border-dark-500 rounded-lg text-white focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Ort</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="z.B. Bern"
                    className="w-full px-4 py-2 bg-dark-700 border border-dark-500 rounded-lg text-white focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Präsident</label>
                  <select
                    value={formData.presidentId}
                    onChange={(e) => setFormData({ ...formData, presidentId: e.target.value })}
                    className="w-full px-4 py-2 bg-dark-700 border border-dark-500 rounded-lg text-white focus:outline-none focus:border-primary"
                  >
                    <option value="">-- Kein Präsident --</option>
                    {(editingClub ? getClubMembers(editingClub.id) : members).map(member => (
                      <option key={member.id} value={member.id}>
                        {member.firstName} {member.lastName}
                      </option>
                    ))}
                  </select>
                  {!editingClub && (
                    <p className="text-xs text-gray-500 mt-1">
                      Präsident kann nach Erstellung aus den Vereinsmitgliedern gewählt werden.
                    </p>
                  )}
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
                  {editingClub ? 'Speichern' : 'Hinzufügen'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
