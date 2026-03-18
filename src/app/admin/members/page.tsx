'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { getClubLogo } from '@/lib/club-logos'
import { Avatar, EditableAvatar } from '@/components/Avatar'
import { useLanguage } from '@/hooks/useLanguage'
import { t } from '@/lib/translations/admin'

interface Member {
  id: string
  firstName: string
  lastName: string
  gender: 'men' | 'women'
  birthDate: string | null
  country: string | null
  isActive: boolean | null
  imageUrl: string | null
  clubId: string | null
  clubName: string | null
  clubShortName: string | null
}

interface Club {
  id: string
  name: string
  shortName: string | null
  location: string | null
}

interface Session {
  role: 'super_admin' | 'admin'
  clubId?: string
}

export default function MembersPage() {
  const lang = useLanguage()
  const [members, setMembers] = useState<Member[]>([])
  const [clubs, setClubs] = useState<Club[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [clubFilter, setClubFilter] = useState('all')
  const [sortField, setSortField] = useState<'name' | 'club' | 'gender'>('name')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [showModal, setShowModal] = useState(false)
  const [editingMember, setEditingMember] = useState<Member | null>(null)
  const [formData, setFormData] = useState({ firstName: '', lastName: '', clubId: '', gender: 'men' as 'men' | 'women', birthDate: '' })
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [session, setSession] = useState<Session | null>(null)

  const isSuperAdmin = session?.role === 'super_admin'
  const userClubId = session?.clubId

  // Find user's club name for display
  const userClub = userClubId ? clubs.find(c => c.id === userClubId)?.name : undefined

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

  useEffect(() => {
    async function fetchData() {
      try {
        const [membersRes, clubsRes] = await Promise.all([
          fetch('/api/members', { credentials: 'include' }),
          fetch('/api/clubs', { credentials: 'include' })
        ])
        if (!membersRes.ok || !clubsRes.ok) throw new Error('Failed to fetch data')
        const [membersData, clubsData] = await Promise.all([
          membersRes.json(),
          clubsRes.json()
        ])
        setMembers(membersData)
        setClubs(clubsData)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data')
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

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

  // Filter and sort members based on user role
  // Note: API already filters by clubId for club admins, this is just for local filtering
  const filteredMembers = members
    .filter(member => {
      const fullName = `${member.firstName} ${member.lastName}`.toLowerCase()
      const matchesSearch = fullName.includes(search.toLowerCase())
      const matchesClub = clubFilter === 'all' || member.clubId === clubFilter
      return matchesSearch && matchesClub
    })
    .sort((a, b) => {
      let comparison = 0
      switch (sortField) {
        case 'name':
          comparison = `${a.lastName} ${a.firstName}`.localeCompare(`${b.lastName} ${b.firstName}`)
          break
        case 'club':
          comparison = (a.clubName || '').localeCompare(b.clubName || '')
          break
        case 'gender':
          comparison = a.gender.localeCompare(b.gender)
          break
      }
      return sortDirection === 'asc' ? comparison : -comparison
    })

  const openAddModal = () => {
    setEditingMember(null)
    setFormData({
      firstName: '',
      lastName: '',
      // Club admins: pre-set their club, super admins: empty
      clubId: userClubId || '',
      gender: 'men',
      birthDate: '',
    })
    setShowModal(true)
  }

  const openEditModal = (member: Member) => {
    setEditingMember(member)
    setFormData({
      firstName: member.firstName,
      lastName: member.lastName,
      clubId: member.clubId || '',
      gender: member.gender,
      birthDate: member.birthDate ? member.birthDate.split('T')[0] : '',
    })
    setShowModal(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      if (editingMember) {
        // Update existing member via API
        const response = await fetch(`/api/members/${editingMember.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(formData),
        })
        if (!response.ok) throw new Error('Failed to update member')
        // Refetch to get updated data with club info
        const membersRes = await fetch('/api/members', { credentials: 'include' })
        if (membersRes.ok) setMembers(await membersRes.json())
      } else {
        // Add new member via API
        const response = await fetch('/api/members', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(formData),
        })
        if (!response.ok) throw new Error('Failed to create member')
        // Refetch to get updated data with club info
        const membersRes = await fetch('/api/members', { credentials: 'include' })
        if (membersRes.ok) setMembers(await membersRes.json())
      }

      setShowModal(false)
      setEditingMember(null)
    } catch (err) {
      console.error('Failed to save member:', err)
      alert(t(lang, 'saveError'))
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm(t(lang, 'confirmDelete'))) {
      try {
        const response = await fetch(`/api/members/${id}`, {
          method: 'DELETE',
          credentials: 'include',
        })
        if (!response.ok) throw new Error('Failed to delete member')
        setMembers(members.filter(m => m.id !== id))
      } catch (err) {
        console.error('Failed to delete member:', err)
        alert(t(lang, 'deleteError'))
      }
    }
  }

  const handleImageUpload = async (file: File) => {
    if (!editingMember) return

    setIsUploadingImage(true)
    try {
      const uploadFormData = new FormData()
      uploadFormData.append('image', file)
      uploadFormData.append('memberId', editingMember.id)

      const response = await fetch('/api/members/upload', {
        method: 'POST',
        credentials: 'include',
        body: uploadFormData,
      })

      if (!response.ok) throw new Error('Failed to upload image')

      const result = await response.json()

      // Update the editing member and the members list with the new image URL
      setEditingMember({ ...editingMember, imageUrl: result.imageUrl })
      setMembers(members.map(m =>
        m.id === editingMember.id ? { ...m, imageUrl: result.imageUrl } : m
      ))
    } catch (err) {
      console.error('Failed to upload image:', err)
      alert(t(lang, 'uploadError'))
    } finally {
      setIsUploadingImage(false)
    }
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">{t(lang, 'members')}</h1>
          <p className="text-gray-400">
            {isSuperAdmin
              ? t(lang, 'manageAllAthletes')
              : `${t(lang, 'manageClubAthletes')} ${userClub || t(lang, 'yourClub')}`
            }
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="px-4 py-2 bg-primary hover:bg-primary-light text-white rounded-lg transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          {t(lang, 'addAthlete')}
        </button>
      </div>

      {/* Role indicator for testing */}
      {!isSuperAdmin && (
        <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg text-sm text-blue-400">
          {t(lang, 'clubAdminNote')} <strong>{userClub}</strong> {t(lang, 'clubAdminNoteEnd')}
        </div>
      )}

      {/* Loading/Error states */}
      {isLoading && <div className="text-gray-400 mb-6">{t(lang, 'loadingMembers')}</div>}
      {error && <div className="text-red-400 mb-6">{error}</div>}

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <div className="flex-1">
          <input
            type="text"
            placeholder={t(lang, 'search')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-2 bg-dark-700 border border-dark-500 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary"
          />
        </div>
        {/* Only super admins can filter by club */}
        {isSuperAdmin && (
          <select
            value={clubFilter}
            onChange={(e) => setClubFilter(e.target.value)}
            className="px-4 py-2 bg-dark-700 border border-dark-500 rounded-lg text-white focus:outline-none focus:border-primary"
          >
            <option value="all">{t(lang, 'allClubs')}</option>
            {clubs.map(club => (
              <option key={club.id} value={club.id}>{club.name}</option>
            ))}
          </select>
        )}
      </div>

      {/* Table */}
      <div className="bg-dark-700/50 rounded-xl border border-primary/20 overflow-hidden">
        <table className="w-full">
          <thead className="bg-dark-600/50">
            <tr className="text-left text-gray-400 text-sm">
              <th className="py-3 px-4 cursor-pointer hover:text-white" onClick={() => handleSort('name')}>
                {t(lang, 'name')}<SortIcon field="name" />
              </th>
              {isSuperAdmin && (
                <th className="py-3 px-4 cursor-pointer hover:text-white" onClick={() => handleSort('club')}>
                  {t(lang, 'club')}<SortIcon field="club" />
                </th>
              )}
              <th className="py-3 px-4 cursor-pointer hover:text-white" onClick={() => handleSort('gender')}>
                {t(lang, 'category')}<SortIcon field="gender" />
              </th>
              <th className="py-3 px-4">{t(lang, 'birthDate')}</th>
              <th className="py-3 px-4">{t(lang, 'actions')}</th>
            </tr>
          </thead>
          <tbody>
            {filteredMembers.map(member => {
              const logo = member.clubName ? getClubLogo(member.clubName) : null
              return (
                <tr key={member.id} className="border-t border-dark-600 hover:bg-dark-600/30 group">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <Avatar
                        imageUrl={member.imageUrl}
                        firstName={member.firstName}
                        lastName={member.lastName}
                        size="sm"
                        showHoverEffect
                      />
                      <span className="font-medium">{member.firstName} {member.lastName}</span>
                    </div>
                  </td>
                  {isSuperAdmin && (
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        {logo && (
                          <Image src={logo} alt="" width={20} height={20} className="rounded" />
                        )}
                        <span className="text-gray-400">{member.clubName || t(lang, 'noClub')}</span>
                      </div>
                    </td>
                  )}
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded text-xs ${
                      member.gender === 'men' ? 'bg-blue-500/20 text-blue-400' : 'bg-pink-500/20 text-pink-400'
                    }`}>
                      {member.gender === 'men' ? t(lang, 'men') : t(lang, 'women')}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-400">
                    {member.birthDate ? new Date(member.birthDate).toLocaleDateString('de-CH') : '-'}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEditModal(member)}
                        className="p-2 text-gray-400 hover:text-white hover:bg-dark-600 rounded transition-colors"
                        title={t(lang, 'edit')}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(member.id)}
                        className="p-2 text-gray-400 hover:text-red-400 hover:bg-dark-600 rounded transition-colors"
                        title={t(lang, 'delete')}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {!isLoading && filteredMembers.length === 0 && (
          <div className="py-8 text-center text-gray-500">
            {t(lang, 'noMembersFound')}
          </div>
        )}
      </div>

      <div className="mt-4 text-sm text-gray-500">
        {filteredMembers.length} {!isSuperAdmin ? '' : `${t(lang, 'of')} ${members.length}`} {t(lang, 'membersCount')}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-dark-800 rounded-xl border border-primary/20 p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {editingMember ? t(lang, 'editMember') : t(lang, 'addMember')}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                {/* Avatar upload (only shown when editing) */}
                {editingMember && (
                  <div className="flex flex-col items-center gap-2 mb-4">
                    <EditableAvatar
                      imageUrl={editingMember.imageUrl}
                      firstName={formData.firstName || editingMember.firstName}
                      lastName={formData.lastName || editingMember.lastName}
                      size="xl"
                      onImageChange={handleImageUpload}
                      isUploading={isUploadingImage}
                    />
                    <span className="text-xs text-gray-500">{t(lang, 'clickToChange')}</span>
                  </div>
                )}

                <div>
                  <label className="block text-sm text-gray-400 mb-1">{t(lang, 'firstName')} *</label>
                  <input
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full px-4 py-2 bg-dark-700 border border-dark-500 rounded-lg text-white focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">{t(lang, 'lastName')} *</label>
                  <input
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full px-4 py-2 bg-dark-700 border border-dark-500 rounded-lg text-white focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1">{t(lang, 'birthDate')}</label>
                  <input
                    type="date"
                    value={formData.birthDate}
                    onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                    className="w-full px-4 py-2 bg-dark-700 border border-dark-500 rounded-lg text-white focus:outline-none focus:border-primary"
                  />
                </div>

                {/* Club selector - disabled for club admins */}
                <div>
                  <label className="block text-sm text-gray-400 mb-1">{t(lang, 'club')}</label>
                  {isSuperAdmin ? (
                    <select
                      value={formData.clubId}
                      onChange={(e) => setFormData({ ...formData, clubId: e.target.value })}
                      className="w-full px-4 py-2 bg-dark-700 border border-dark-500 rounded-lg text-white focus:outline-none focus:border-primary"
                    >
                      <option value="">{t(lang, 'noClub')}</option>
                      {clubs.map(club => (
                        <option key={club.id} value={club.id}>{club.name}</option>
                      ))}
                    </select>
                  ) : (
                    <div className="w-full px-4 py-2 bg-dark-600 border border-dark-500 rounded-lg text-gray-300 cursor-not-allowed">
                      {userClub || t(lang, 'yourClub')}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1">{t(lang, 'category')}</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value as 'men' | 'women' })}
                    className="w-full px-4 py-2 bg-dark-700 border border-dark-500 rounded-lg text-white focus:outline-none focus:border-primary"
                  >
                    <option value="men">{t(lang, 'men')}</option>
                    <option value="women">{t(lang, 'women')}</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 bg-dark-600 hover:bg-dark-500 text-white rounded-lg transition-colors"
                >
                  {t(lang, 'cancel')}
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-primary hover:bg-primary-light text-white rounded-lg transition-colors"
                >
                  {editingMember ? t(lang, 'save') : t(lang, 'add')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
