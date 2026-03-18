'use client'

import { useState, useEffect } from 'react'

interface Club {
  id: string
  name: string
}

interface User {
  id: string
  email: string
  role: 'super_admin' | 'admin'
  clubId: string | null
  createdAt: string
  generatedPassword?: string
}

interface CurrentUser {
  userId: string
  email: string
  role: 'super_admin' | 'admin'
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [clubs, setClubs] = useState<Club[]>([])
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [newUserEmail, setNewUserEmail] = useState('')
  const [newUserRole, setNewUserRole] = useState<'admin' | 'super_admin'>('admin')
  const [newUserClubId, setNewUserClubId] = useState('')
  const [createdUser, setCreatedUser] = useState<User | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    // Get current user from API
    fetch('/api/auth/me', { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          setCurrentUser(data.user)
        }
      })
      .catch(console.error)

    // Fetch users
    fetch('/api/users', { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setUsers(data)
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false))

    // Fetch clubs for the dropdown
    fetch('/api/clubs', { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setClubs(data)
        }
      })
      .catch(console.error)
  }, [])

  const isSuperAdmin = currentUser?.role === 'super_admin'

  if (!isSuperAdmin && !loading) {
    return (
      <div className="p-8">
        <div className="max-w-md mx-auto text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/20 flex items-center justify-center">
            <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold mb-2">Zugriff verweigert</h1>
          <p className="text-gray-400">
            Nur Super Admins haben Zugriff auf die Benutzerverwaltung.
          </p>
        </div>
      </div>
    )
  }

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const res = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: newUserEmail,
        role: newUserRole,
        clubId: newUserRole === 'admin' ? newUserClubId : null,
      }),
      credentials: 'include',
    })

    const data = await res.json()

    if (res.ok) {
      setCreatedUser(data)
      setUsers([...users, data])
      setNewUserEmail('')
      setNewUserRole('admin')
      setNewUserClubId('')
    } else {
      setError(data.error || 'Fehler beim Erstellen')
    }
  }

  const handleDeleteUser = async (id: string) => {
    if (!confirm('Benutzer wirklich löschen?')) return

    const res = await fetch(`/api/users/${id}`, { method: 'DELETE', credentials: 'include' })

    if (res.ok) {
      setUsers(users.filter(u => u.id !== id))
    }
  }

  const handleResetPassword = async (id: string) => {
    if (!confirm('Passwort zurücksetzen?')) return

    const res = await fetch(`/api/users/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resetPassword: true }),
      credentials: 'include',
    })

    const data = await res.json()

    if (res.ok && data.generatedPassword) {
      alert(`Neues Passwort: ${data.generatedPassword}\n\nBitte notieren Sie sich dieses Passwort!`)
    }
  }

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="text-gray-400">Lädt...</div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Benutzer</h1>
          <p className="text-gray-400">Verwalte Admin-Zugänge</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-primary hover:bg-primary-light text-white rounded-lg transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
          Benutzer erstellen
        </button>
      </div>

      {/* Roles Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="p-4 bg-dark-700/50 rounded-xl border border-primary/20">
          <h3 className="font-semibold text-primary mb-2">Super Admin</h3>
          <ul className="text-sm text-gray-400 space-y-1">
            <li>• Kann alle Vereine und Mitglieder verwalten</li>
            <li>• Kann Turniere erstellen und Resultate hochladen</li>
            <li>• Kann neue Benutzer erstellen und verwalten</li>
          </ul>
        </div>
        <div className="p-4 bg-dark-700/50 rounded-xl border border-dark-500">
          <h3 className="font-semibold mb-2">Admin</h3>
          <ul className="text-sm text-gray-400 space-y-1">
            <li>• Kann Vereine und Mitglieder verwalten</li>
            <li>• Kann Turniere erstellen und Resultate hochladen</li>
            <li>• Kein Zugriff auf Benutzerverwaltung</li>
          </ul>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-dark-700/50 rounded-xl border border-primary/20 overflow-hidden">
        <table className="w-full">
          <thead className="bg-dark-600/50">
            <tr className="text-left text-gray-400 text-sm">
              <th className="py-3 px-4">E-Mail</th>
              <th className="py-3 px-4">Rolle</th>
              <th className="py-3 px-4">Verein</th>
              <th className="py-3 px-4">Erstellt</th>
              <th className="py-3 px-4">Aktionen</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id} className="border-t border-dark-600 hover:bg-dark-600/30">
                <td className="py-3 px-4 font-medium">
                  {user.email}
                  {user.id === currentUser?.userId && (
                    <span className="ml-2 text-xs text-gray-500">(Du)</span>
                  )}
                </td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-1 rounded text-sm ${
                    user.role === 'super_admin'
                      ? 'bg-primary/20 text-primary'
                      : 'bg-dark-500 text-gray-300'
                  }`}>
                    {user.role === 'super_admin' ? 'Super Admin' : 'Admin'}
                  </span>
                </td>
                <td className="py-3 px-4 text-gray-400">
                  {user.clubId
                    ? clubs.find(c => c.id === user.clubId)?.name || '–'
                    : '–'}
                </td>
                <td className="py-3 px-4 text-gray-400">
                  {new Date(user.createdAt).toLocaleDateString('de-CH')}
                </td>
                <td className="py-3 px-4">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleResetPassword(user.id)}
                      className="p-2 text-gray-400 hover:text-white hover:bg-dark-600 rounded transition-colors"
                      title="Passwort zurücksetzen"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                      </svg>
                    </button>
                    {user.id !== currentUser?.userId && (
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="p-2 text-gray-400 hover:text-red-400 hover:bg-dark-600 rounded transition-colors"
                        title="Löschen"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create User Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-dark-800 rounded-xl border border-primary/20 p-6 w-full max-w-md">
            {createdUser ? (
              <>
                <h2 className="text-xl font-bold mb-4">Benutzer erstellt</h2>
                <div className="bg-dark-700 rounded-lg p-4 mb-4">
                  <p className="text-sm text-gray-400 mb-2">E-Mail:</p>
                  <p className="font-medium mb-4">{createdUser.email}</p>
                  <p className="text-sm text-gray-400 mb-2">Temporäres Passwort:</p>
                  <p className="font-mono bg-dark-600 px-3 py-2 rounded text-primary">
                    {createdUser.generatedPassword}
                  </p>
                </div>
                <p className="text-sm text-yellow-400 mb-4">
                  Bitte teilen Sie dieses Passwort dem Benutzer mit. Es wird nur einmal angezeigt!
                </p>
                <button
                  onClick={() => {
                    setShowModal(false)
                    setCreatedUser(null)
                  }}
                  className="w-full px-4 py-2 bg-primary hover:bg-primary-light text-white rounded-lg transition-colors"
                >
                  Schliessen
                </button>
              </>
            ) : (
              <>
                <h2 className="text-xl font-bold mb-4">Neuer Benutzer</h2>
                <form onSubmit={handleCreateUser}>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">E-Mail Adresse</label>
                      <input
                        type="email"
                        required
                        value={newUserEmail}
                        onChange={(e) => setNewUserEmail(e.target.value)}
                        placeholder="benutzer@email.ch"
                        className="w-full px-4 py-2 bg-dark-700 border border-dark-500 rounded-lg text-white focus:outline-none focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Rolle</label>
                      <select
                        value={newUserRole}
                        onChange={(e) => setNewUserRole(e.target.value as 'admin' | 'super_admin')}
                        className="w-full px-4 py-2 bg-dark-700 border border-dark-500 rounded-lg text-white focus:outline-none focus:border-primary"
                      >
                        <option value="admin">Admin</option>
                        <option value="super_admin">Super Admin</option>
                      </select>
                    </div>
                    {newUserRole === 'admin' && (
                      <div>
                        <label className="block text-sm text-gray-400 mb-1">Verein</label>
                        <select
                          value={newUserClubId}
                          onChange={(e) => setNewUserClubId(e.target.value)}
                          required
                          className="w-full px-4 py-2 bg-dark-700 border border-dark-500 rounded-lg text-white focus:outline-none focus:border-primary"
                        >
                          <option value="">Verein auswählen...</option>
                          {clubs.map(club => (
                            <option key={club.id} value={club.id}>{club.name}</option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                  {error && <p className="text-red-400 text-sm mt-4">{error}</p>}
                  <p className="text-sm text-gray-500 mt-4">
                    Ein temporäres Passwort wird generiert und angezeigt.
                  </p>
                  <div className="flex gap-3 mt-6">
                    <button
                      type="button"
                      onClick={() => {
                        setShowModal(false)
                        setError('')
                      }}
                      className="flex-1 px-4 py-2 bg-dark-600 hover:bg-dark-500 text-white rounded-lg transition-colors"
                    >
                      Abbrechen
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2 bg-primary hover:bg-primary-light text-white rounded-lg transition-colors"
                    >
                      Erstellen
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
