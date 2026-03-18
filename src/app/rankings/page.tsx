'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import type { SLPStandings, Athlete, Club } from '@/lib/types'
import { getClubLogo } from '@/lib/club-logos'
import { Avatar } from '@/components/Avatar'
import { useLanguage } from '@/hooks/useLanguage'
import { t } from '@/lib/translations/rankings'

interface MemberWithImage {
  firstName: string
  lastName: string
  imageUrl: string | null
}

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) {
    return (
      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gold text-dark-900 font-bold">
        1
      </span>
    )
  }
  if (rank === 2) {
    return (
      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-silver text-dark-900 font-bold">
        2
      </span>
    )
  }
  if (rank === 3) {
    return (
      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-bronze text-dark-900 font-bold">
        3
      </span>
    )
  }
  return (
    <span className="inline-flex items-center justify-center w-8 h-8 text-gray-400 font-semibold">
      {rank}
    </span>
  )
}

function ClubLogo({ clubName, size = 'sm' }: { clubName: string; size?: 'sm' | 'md' }) {
  const logoUrl = getClubLogo(clubName)
  const dimensions = size === 'sm' ? 24 : 40

  if (!logoUrl) {
    return null
  }

  return (
    <div className={`${size === 'sm' ? 'w-6 h-6' : 'w-10 h-10'} rounded bg-white/10 overflow-hidden flex items-center justify-center flex-shrink-0`}>
      <Image
        src={logoUrl}
        alt={clubName}
        width={dimensions}
        height={dimensions}
        className="object-contain"
      />
    </div>
  )
}

function AthleteRow({ athlete, expanded, onToggle, imageUrl, independentLabel }: { athlete: Athlete; expanded: boolean; onToggle: () => void; imageUrl?: string | null; independentLabel: string }) {
  // Split name into first and last for Avatar
  const nameParts = athlete.name.split(' ')
  const firstName = nameParts[0] || ''
  const lastName = nameParts.slice(1).join(' ') || ''

  return (
    <>
      <tr
        className="border-b border-dark-600 hover:bg-dark-700/50 transition-colors cursor-pointer"
        onClick={onToggle}
      >
        <td className="py-5 px-4 md:px-6">
          <RankBadge rank={athlete.rank} />
        </td>
        <td className="py-5 px-2 md:px-4 group relative">
          <Avatar
            imageUrl={imageUrl}
            firstName={firstName}
            lastName={lastName}
            size="md"
            showHoverEffect
          />
        </td>
        <td className="py-5 px-2 md:px-4">
          <div className="font-semibold text-white text-lg">{athlete.name}</div>
        </td>
        <td className="py-5 px-2 md:px-4 hidden md:table-cell">
          <div className="flex items-center gap-2">
            {athlete.club && <ClubLogo clubName={athlete.club} />}
            <span className="text-gray-400">{athlete.club || independentLabel}</span>
          </div>
        </td>
        <td className="py-5 px-2 md:px-4 text-right">
          <span className="font-bold text-primary text-xl">{athlete.points}</span>
          <span className="text-gray-500 text-sm ml-1">pts</span>
        </td>
        <td className="py-5 px-4 text-gray-400">
          <svg
            className={`w-5 h-5 transition-transform ${expanded ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </td>
      </tr>
      {expanded && (
        <tr className="bg-dark-700/30">
          <td colSpan={6} className="py-4 px-6">
            {/* Mobile: show club info */}
            <div className="md:hidden flex items-center gap-2 mb-3 text-sm">
              {athlete.club && <ClubLogo clubName={athlete.club} />}
              <span className="text-gray-400">{athlete.club || independentLabel}</span>
            </div>
            <div className="text-sm text-gray-300 font-mono">
              {athlete.breakdown}
            </div>
          </td>
        </tr>
      )}
    </>
  )
}

function ClubRow({ club, expanded, onToggle, athletesLabel }: { club: Club; expanded: boolean; onToggle: () => void; athletesLabel: string }) {
  const athleteEntries = Object.entries(club.breakdown).sort((a, b) => b[1].total - a[1].total)

  return (
    <>
      <tr
        className="border-b border-dark-600 hover:bg-dark-700/50 transition-colors cursor-pointer"
        onClick={onToggle}
      >
        <td className="py-5 px-4 md:px-6">
          <RankBadge rank={club.rank} />
        </td>
        <td className="py-5 px-4">
          <div className="flex items-center gap-4">
            <ClubLogo clubName={club.club} size="md" />
            <div>
              <div className="font-semibold text-white text-lg">{club.club}</div>
              <div className="text-sm text-gray-400">{club.athletes} {athletesLabel}</div>
            </div>
          </div>
        </td>
        <td className="py-5 px-4 text-right">
          <span className="font-bold text-primary text-xl">{club.points}</span>
          <span className="text-gray-500 text-sm ml-1">pts</span>
        </td>
        <td className="py-5 px-4 text-gray-400">
          <svg
            className={`w-5 h-5 transition-transform ${expanded ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </td>
      </tr>
      {expanded && (
        <tr className="bg-dark-700/30">
          <td colSpan={4} className="py-4 px-6">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {athleteEntries.map(([name, data]) => (
                <div key={name} className="text-sm flex justify-between bg-dark-600/50 rounded px-3 py-2">
                  <span className="text-gray-300">{name}</span>
                  <span className="text-primary font-semibold ml-2">{data.total}</span>
                </div>
              ))}
            </div>
          </td>
        </tr>
      )}
    </>
  )
}

export default function RankingsPage() {
  const lang = useLanguage()
  const [standings, setStandings] = useState<SLPStandings | null>(null)
  const [memberImages, setMemberImages] = useState<Record<string, string | null>>({})
  const [category, setCategory] = useState<'men' | 'women' | 'clubs'>('men')
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)

  // Get locale for date formatting
  const dateLocale = lang === 'de' ? 'de-CH' : lang === 'fr' ? 'fr-CH' : lang === 'it' ? 'it-CH' : 'en-GB'

  useEffect(() => {
    // Fetch both standings and member images in parallel
    Promise.all([
      fetch('/api/standings').then(res => res.json()),
      fetch('/api/members').then(res => res.json())
    ])
      .then(([standingsData, membersData]) => {
        setStandings(standingsData)
        // Create a lookup map: "FirstName LastName" -> imageUrl
        const imageMap: Record<string, string | null> = {}
        if (Array.isArray(membersData)) {
          membersData.forEach((member: MemberWithImage) => {
            const fullName = `${member.firstName} ${member.lastName}`
            imageMap[fullName] = member.imageUrl
          })
        }
        setMemberImages(imageMap)
        setLoading(false)
      })
      .catch(err => {
        console.error('Failed to load data:', err)
        setLoading(false)
      })
  }, [])

  const toggleRow = (id: string) => {
    setExpandedRows(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen py-12 px-4 flex items-center justify-center">
        <div className="text-gray-400">{t(lang, 'loading')}</div>
      </div>
    )
  }

  if (!standings) {
    return (
      <div className="min-h-screen py-12 px-4 flex items-center justify-center">
        <div className="text-red-400">{t(lang, 'loadError')}</div>
      </div>
    )
  }

  const athletes = category === 'men' ? standings.men : category === 'women' ? standings.women : []
  const clubs = standings.clubs

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">
            <span className="text-primary">SLP</span> Rankings {standings.season}
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            {t(lang, 'subtitle')}
          </p>
          <p className="text-sm text-gray-500 mt-2">
            {t(lang, 'lastUpdated')}: {new Date(standings.lastUpdated).toLocaleDateString(dateLocale)}
          </p>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-8 justify-center">
          <div className="flex bg-dark-700 rounded-lg p-1">
            <button
              onClick={() => { setCategory('men'); setExpandedRows(new Set()) }}
              className={`px-6 py-2 rounded-md font-medium transition-all ${
                category === 'men'
                  ? 'bg-primary text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {t(lang, 'men')} ({standings.men.length})
            </button>
            <button
              onClick={() => { setCategory('women'); setExpandedRows(new Set()) }}
              className={`px-6 py-2 rounded-md font-medium transition-all ${
                category === 'women'
                  ? 'bg-primary text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {t(lang, 'women')} ({standings.women.length})
            </button>
            <button
              onClick={() => { setCategory('clubs'); setExpandedRows(new Set()) }}
              className={`px-6 py-2 rounded-md font-medium transition-all ${
                category === 'clubs'
                  ? 'bg-primary text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {t(lang, 'clubs')} ({standings.clubs.length})
            </button>
          </div>
        </div>

        {/* Rankings Table */}
        <div className="bg-dark-800/50 rounded-xl border border-primary/20 overflow-hidden">
          <table className="w-full">
            <thead className="bg-dark-700/50">
              {category === 'clubs' ? (
                <tr className="text-left text-gray-400 text-sm uppercase">
                  <th className="py-4 px-4 md:px-6 w-16">{t(lang, 'rank')}</th>
                  <th className="py-4 px-4">{t(lang, 'club')}</th>
                  <th className="py-4 px-4">{t(lang, 'points')}</th>
                  <th className="py-4 px-4 w-12"></th>
                </tr>
              ) : (
                <tr className="text-left text-gray-400 text-sm uppercase">
                  <th className="py-4 px-4 md:px-6 w-16">{t(lang, 'rank')}</th>
                  <th className="py-4 px-2 md:px-4 w-12 md:w-16"></th>
                  <th className="py-4 px-2 md:px-4">{t(lang, 'athlete')}</th>
                  <th className="py-4 px-2 md:px-4 hidden md:table-cell">{t(lang, 'club')}</th>
                  <th className="py-4 px-2 md:px-4 text-right">{t(lang, 'points')}</th>
                  <th className="py-4 px-4 w-12"></th>
                </tr>
              )}
            </thead>
            <tbody>
              {category === 'clubs' ? (
                clubs.map(club => (
                  <ClubRow
                    key={club.club}
                    club={club}
                    expanded={expandedRows.has(club.club)}
                    onToggle={() => toggleRow(club.club)}
                    athletesLabel={t(lang, 'athletes')}
                  />
                ))
              ) : (
                athletes.map(athlete => (
                  <AthleteRow
                    key={`${athlete.rank}-${athlete.name}`}
                    athlete={athlete}
                    expanded={expandedRows.has(`${athlete.rank}-${athlete.name}`)}
                    onToggle={() => toggleRow(`${athlete.rank}-${athlete.name}`)}
                    imageUrl={memberImages[athlete.name]}
                    independentLabel={t(lang, 'independent')}
                  />
                ))
              )}
            </tbody>
          </table>

          {athletes.length === 0 && category !== 'clubs' && (
            <tbody>
              <tr>
                <td colSpan={6} className="py-12 text-center text-gray-500">
                  {t(lang, 'noAthletes')}
                </td>
              </tr>
            </tbody>
          )}
        </div>

        {/* Tournaments included */}
        <div className="mt-8 p-6 bg-dark-700/50 rounded-xl border border-primary/20">
          <h3 className="font-semibold text-lg mb-3">{t(lang, 'tournamentsIncluded')}</h3>
          <div className="flex flex-wrap gap-3">
            {standings.tournaments.map(tournament => (
              <div key={tournament.name} className="px-4 py-2 bg-dark-600 rounded-lg">
                <div className="font-medium">{tournament.name}</div>
                <div className="text-sm text-gray-400">
                  {new Date(tournament.date).toLocaleDateString(dateLocale)} • {tournament.type}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-6 p-6 bg-dark-700/50 rounded-xl border border-primary/20">
          <h3 className="font-semibold text-lg mb-2">{t(lang, 'pointSystem')}</h3>
          <div className="text-gray-400 text-sm space-y-2">
            <p><strong>{t(lang, 'placement')}:</strong> {t(lang, 'placementDesc')}</p>
            <p><strong>{t(lang, 'categorySize')}:</strong> {t(lang, 'categorySizeDesc')}</p>
            <p><strong>{t(lang, 'tournamentType')}:</strong> {t(lang, 'tournamentTypeDesc')}</p>
            <p className="text-xs text-gray-500 mt-3">{standings.note}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
