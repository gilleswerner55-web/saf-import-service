'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import type { SLPStandings } from '@/lib/types'
import { useLanguage } from '@/hooks/useLanguage'
import { t } from '@/lib/translations/admin'

export default function AdminPage() {
  const lang = useLanguage()
  const [standings, setStandings] = useState<SLPStandings | null>(null)

  // Get locale for date formatting
  const dateLocale = lang === 'de' ? 'de-CH' : lang === 'fr' ? 'fr-CH' : lang === 'it' ? 'it-CH' : 'en-GB'

  useEffect(() => {
    fetch('/api/standings')
      .then(res => res.json())
      .then(setStandings)
      .catch(console.error)
  }, [])

  const stats = standings ? {
    athletes: standings.men.length + standings.women.length,
    clubs: standings.clubs.length,
    tournaments: standings.tournaments.length,
  } : { athletes: 0, clubs: 0, tournaments: 0 }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{t(lang, 'dashboard')}</h1>
        <p className="text-gray-400">{t(lang, 'welcomeBack')}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="p-6 bg-dark-700/50 rounded-xl border border-primary/20">
          <div className="text-3xl font-bold text-primary">{stats.athletes}</div>
          <div className="text-gray-400">{t(lang, 'athletes')}</div>
        </div>
        <div className="p-6 bg-dark-700/50 rounded-xl border border-primary/20">
          <div className="text-3xl font-bold text-primary">{stats.clubs}</div>
          <div className="text-gray-400">{t(lang, 'clubs')}</div>
        </div>
        <div className="p-6 bg-dark-700/50 rounded-xl border border-primary/20">
          <div className="text-3xl font-bold text-primary">{stats.tournaments}</div>
          <div className="text-gray-400">{t(lang, 'tournaments')}</div>
        </div>
        <div className="p-6 bg-dark-700/50 rounded-xl border border-primary/20">
          <div className="text-3xl font-bold text-primary">1</div>
          <div className="text-gray-400">{t(lang, 'users')}</div>
        </div>
      </div>

      {/* Quick Actions */}
      <h2 className="text-xl font-semibold mb-4">{t(lang, 'quickAccess')}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link href="/admin/members" className="p-6 bg-dark-700/50 rounded-xl border border-primary/20 hover:border-primary/40 transition-all group">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center group-hover:bg-primary/30 transition-colors">
              <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold">{t(lang, 'manageMembers')}</h3>
              <p className="text-gray-400 text-sm">{t(lang, 'manageMembersDesc')}</p>
            </div>
          </div>
        </Link>

        <Link href="/admin/tournaments" className="p-6 bg-dark-700/50 rounded-xl border border-primary/20 hover:border-primary/40 transition-all group">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center group-hover:bg-primary/30 transition-colors">
              <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold">{t(lang, 'addTournament')}</h3>
              <p className="text-gray-400 text-sm">{t(lang, 'addTournamentDesc')}</p>
            </div>
          </div>
        </Link>

        <Link href="/admin/users" className="p-6 bg-dark-700/50 rounded-xl border border-primary/20 hover:border-primary/40 transition-all group">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center group-hover:bg-primary/30 transition-colors">
              <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold">{t(lang, 'inviteUser')}</h3>
              <p className="text-gray-400 text-sm">{t(lang, 'inviteUserDesc')}</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Recent Activity */}
      <h2 className="text-xl font-semibold mt-8 mb-4">{t(lang, 'recentTournaments')}</h2>
      <div className="bg-dark-700/50 rounded-xl border border-primary/20 overflow-hidden">
        <table className="w-full">
          <thead className="bg-dark-600/50">
            <tr className="text-left text-gray-400 text-sm">
              <th className="py-3 px-4">{t(lang, 'tournament')}</th>
              <th className="py-3 px-4">{t(lang, 'date')}</th>
              <th className="py-3 px-4">{t(lang, 'type')}</th>
              <th className="py-3 px-4">{t(lang, 'status')}</th>
            </tr>
          </thead>
          <tbody>
            {standings?.tournaments.map(tournament => (
              <tr key={tournament.name} className="border-t border-dark-600">
                <td className="py-3 px-4 font-medium">{tournament.name}</td>
                <td className="py-3 px-4 text-gray-400">{new Date(tournament.date).toLocaleDateString(dateLocale)}</td>
                <td className="py-3 px-4 capitalize">{tournament.type}</td>
                <td className="py-3 px-4">
                  <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-sm">
                    {t(lang, 'completed')}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
