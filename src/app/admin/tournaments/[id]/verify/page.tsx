'use client'

import { useState, useEffect, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { findNameMatch, findPotentialMatches, normalizeForComparison } from '@/lib/name-matching'
import { translations, languageNames, type Language } from '@/lib/translations/verify-page'

interface ParsedAthlete {
  name: string
  country: string
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

interface Member {
  id: string
  firstName: string
  lastName: string
  gender: string
  country: string
  clubId: string | null
  clubName: string | null
}

interface Tournament {
  id: string
  name: string
  date: string
  location: string
  type: string
  status: string
}

interface MemberMatch {
  athlete: ParsedAthlete
  matchedMember: Member | null
  matchType: 'exact' | 'normalized' | 'potential' | 'none'
  potentialMatches: { name: string; similarity: number }[]
}

function detectBrowserLanguage(): Language {
  if (typeof window === 'undefined') return 'de'

  const browserLang = navigator.language.toLowerCase().split('-')[0]
  if (browserLang === 'de' || browserLang === 'en' || browserLang === 'fr' || browserLang === 'it') {
    return browserLang as Language
  }
  return 'de' // Default to German for Switzerland
}

export default function TournamentVerifyPage() {
  const params = useParams()
  const router = useRouter()
  const tournamentId = params.id as string

  const [tournament, setTournament] = useState<Tournament | null>(null)
  const [members, setMembers] = useState<Member[]>([])
  const [tournamentResults, setTournamentResults] = useState<ParsedAthlete[]>([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [lang, setLang] = useState<Language>('de')
  const [countryFilter, setCountryFilter] = useState<'all' | 'switzerland' | 'other'>('all')
  const [matchFilter, setMatchFilter] = useState<'all' | 'matched' | 'unmatched'>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const t = translations[lang]

  // Detect browser language on mount
  useEffect(() => {
    setLang(detectBrowserLanguage())
  }, [])

  // Fetch tournament and members from database
  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch tournament
        const tournamentRes = await fetch(`/api/tournaments/${tournamentId}`)
        if (!tournamentRes.ok) {
          setNotFound(true)
          setLoading(false)
          return
        }
        const tournamentData = await tournamentRes.json()
        setTournament(tournamentData)

        // Fetch members
        const membersRes = await fetch('/api/members')
        if (membersRes.ok) {
          const membersData = await membersRes.json()
          setMembers(membersData)
        }

        // TODO: In the future, fetch actual tournament results from database
        // For now, tournament results would come from PDF parsing
        setTournamentResults([])

        setLoading(false)
      } catch (err) {
        console.error('Failed to load data:', err)
        setLoading(false)
      }
    }
    fetchData()
  }, [tournamentId])

  // Build list of all registered members with their full names
  const memberNames = useMemo(() => {
    return members.map(m => `${m.firstName} ${m.lastName}`)
  }, [members])

  // Build member lookup map for quick access
  const memberLookup = useMemo(() => {
    const map = new Map<string, Member>()
    members.forEach(m => {
      const fullName = `${m.firstName} ${m.lastName}`
      map.set(normalizeForComparison(fullName), m)
    })
    return map
  }, [members])

  // Match athletes against members list
  const matchedAthletes = useMemo<MemberMatch[]>(() => {
    if (tournamentResults.length === 0) return []

    return tournamentResults.map(athlete => {
      // Try exact match first
      const exactMatch = memberNames.find(
        name => name.toLowerCase().trim() === athlete.name.toLowerCase().trim()
      )

      if (exactMatch) {
        return {
          athlete,
          matchedMember: memberLookup.get(normalizeForComparison(exactMatch)) || null,
          matchType: 'exact' as const,
          potentialMatches: []
        }
      }

      // Try normalized match
      const normalizedMatch = findNameMatch(athlete.name, memberNames)
      if (normalizedMatch) {
        return {
          athlete,
          matchedMember: memberLookup.get(normalizeForComparison(normalizedMatch)) || null,
          matchType: 'normalized' as const,
          potentialMatches: []
        }
      }

      // Find potential fuzzy matches
      const potentials = findPotentialMatches(athlete.name, memberNames, 0.6)
      if (potentials.length > 0) {
        return {
          athlete,
          matchedMember: null,
          matchType: 'potential' as const,
          potentialMatches: potentials.slice(0, 3)
        }
      }

      return {
        athlete,
        matchedMember: null,
        matchType: 'none' as const,
        potentialMatches: []
      }
    })
  }, [tournamentResults, memberNames, memberLookup])

  // Apply filters
  const filteredAthletes = useMemo(() => {
    let result = matchedAthletes

    // Country filter
    if (countryFilter === 'switzerland') {
      result = result.filter(m =>
        m.athlete.country.toLowerCase() === 'switzerland' ||
        m.athlete.country.toLowerCase() === 'sui' ||
        m.athlete.country.toLowerCase() === 'ch'
      )
    } else if (countryFilter === 'other') {
      result = result.filter(m =>
        m.athlete.country.toLowerCase() !== 'switzerland' &&
        m.athlete.country.toLowerCase() !== 'sui' &&
        m.athlete.country.toLowerCase() !== 'ch'
      )
    }

    // Match filter
    if (matchFilter === 'matched') {
      result = result.filter(m => m.matchType === 'exact' || m.matchType === 'normalized')
    } else if (matchFilter === 'unmatched') {
      result = result.filter(m => m.matchType === 'potential' || m.matchType === 'none')
    }

    // Search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(m =>
        m.athlete.name.toLowerCase().includes(query) ||
        m.athlete.country.toLowerCase().includes(query) ||
        m.athlete.bestCategory.toLowerCase().includes(query)
      )
    }

    return result
  }, [matchedAthletes, countryFilter, matchFilter, searchQuery])

  // Stats
  const stats = useMemo(() => {
    const swiss = matchedAthletes.filter(m =>
      m.athlete.country.toLowerCase() === 'switzerland' ||
      m.athlete.country.toLowerCase() === 'sui' ||
      m.athlete.country.toLowerCase() === 'ch'
    )
    const swissMatched = swiss.filter(m => m.matchType === 'exact' || m.matchType === 'normalized')
    const swissUnmatched = swiss.filter(m => m.matchType === 'potential' || m.matchType === 'none')

    return {
      total: matchedAthletes.length,
      swiss: swiss.length,
      other: matchedAthletes.length - swiss.length,
      matched: swissMatched.length,
      unmatched: swissUnmatched.length,
      matchRate: swiss.length > 0 ? Math.round((swissMatched.length / swiss.length) * 100) : 0
    }
  }, [matchedAthletes])

  // Get locale for date formatting
  const getDateLocale = () => {
    switch (lang) {
      case 'en': return 'en-GB'
      case 'fr': return 'fr-CH'
      case 'it': return 'it-CH'
      default: return 'de-CH'
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center py-12">
          <svg className="w-8 h-8 text-primary animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span className="ml-3 text-gray-400">{t.loadingData}</span>
        </div>
      </div>
    )
  }

  if (notFound || !tournament) {
    return (
      <div className="p-8">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold mb-2">{t.tournamentNotFound}</h1>
          <p className="text-gray-400 mb-4">{t.tournamentNotFoundDesc.replace('{id}', tournamentId)}</p>
          <button
            onClick={() => router.push('/admin/tournaments')}
            className="px-4 py-2 bg-primary hover:bg-primary-light text-white rounded-lg"
          >
            {t.backToTournaments}
          </button>
        </div>
      </div>
    )
  }

  // Show message when no results have been uploaded
  if (tournamentResults.length === 0) {
    return (
      <div className="p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/admin/tournaments')}
              className="p-2 text-gray-400 hover:text-white hover:bg-dark-600 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h1 className="text-2xl font-bold">{tournament.name}</h1>
              <p className="text-gray-400 text-sm">
                {t.verification} • {new Date(tournament.date).toLocaleDateString(getDateLocale())}
              </p>
            </div>
          </div>

          {/* Language Selector */}
          <div className="flex items-center gap-2">
            {(Object.keys(languageNames) as Language[]).map(l => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                  lang === l
                    ? 'bg-primary text-white'
                    : 'bg-dark-700 text-gray-400 hover:text-white'
                }`}
                title={languageNames[l]}
              >
                {l.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <div className="text-center py-12 bg-dark-700/50 rounded-xl border border-dark-500">
          <svg className="w-16 h-16 mx-auto text-gray-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h2 className="text-xl font-semibold mb-2">{t.noResultsUploaded}</h2>
          <p className="text-gray-400 mb-6 max-w-md mx-auto">
            {t.noResultsUploadedDesc}
          </p>
          <button
            onClick={() => router.push('/admin/tournaments')}
            className="px-4 py-2 bg-primary hover:bg-primary-light text-white rounded-lg"
          >
            {t.backToTournaments}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/admin/tournaments')}
            className="p-2 text-gray-400 hover:text-white hover:bg-dark-600 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="text-2xl font-bold">{tournament.name}</h1>
            <p className="text-gray-400 text-sm">
              {t.verification} • {new Date(tournament.date).toLocaleDateString(getDateLocale())}
            </p>
          </div>
        </div>

        {/* Language Selector */}
        <div className="flex items-center gap-2">
          {(Object.keys(languageNames) as Language[]).map(l => (
            <button
              key={l}
              onClick={() => setLang(l)}
              className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                lang === l
                  ? 'bg-primary text-white'
                  : 'bg-dark-700 text-gray-400 hover:text-white'
              }`}
              title={languageNames[l]}
            >
              {l.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
        <div className="p-4 bg-dark-700/50 rounded-xl border border-dark-500">
          <div className="text-2xl font-bold">{stats.total}</div>
          <div className="text-sm text-gray-400">{t.totalAthletes}</div>
        </div>
        <div className="p-4 bg-dark-700/50 rounded-xl border border-primary/30">
          <div className="text-2xl font-bold text-primary">{stats.swiss}</div>
          <div className="text-sm text-gray-400">{t.swiss}</div>
        </div>
        <div className="p-4 bg-dark-700/50 rounded-xl border border-dark-500">
          <div className="text-2xl font-bold text-gray-400">{stats.other}</div>
          <div className="text-sm text-gray-400">{t.foreigners}</div>
        </div>
        <div className="p-4 bg-dark-700/50 rounded-xl border border-green-500/30">
          <div className="text-2xl font-bold text-green-400">{stats.matched}</div>
          <div className="text-sm text-gray-400">{t.matched}</div>
        </div>
        <div className="p-4 bg-dark-700/50 rounded-xl border border-orange-500/30">
          <div className="text-2xl font-bold text-orange-400">{stats.unmatched}</div>
          <div className="text-sm text-gray-400">{t.unmatched}</div>
        </div>
        <div className="p-4 bg-dark-700/50 rounded-xl border border-primary/30">
          <div className="text-2xl font-bold">{stats.matchRate}%</div>
          <div className="text-sm text-gray-400">{t.matchRate}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        {/* Search */}
        <div className="flex-1 min-w-[200px]">
          <input
            type="text"
            placeholder={t.searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 bg-dark-700 border border-dark-500 rounded-lg text-white focus:outline-none focus:border-primary"
          />
        </div>

        {/* Country Filter */}
        <div className="flex gap-2">
          <button
            onClick={() => setCountryFilter('all')}
            className={`px-3 py-2 rounded-lg text-sm transition-colors ${
              countryFilter === 'all'
                ? 'bg-primary text-white'
                : 'bg-dark-700 text-gray-400 hover:text-white'
            }`}
          >
            {t.allCountries}
          </button>
          <button
            onClick={() => setCountryFilter('switzerland')}
            className={`px-3 py-2 rounded-lg text-sm transition-colors ${
              countryFilter === 'switzerland'
                ? 'bg-primary text-white'
                : 'bg-dark-700 text-gray-400 hover:text-white'
            }`}
          >
            {t.onlySwitzerland}
          </button>
          <button
            onClick={() => setCountryFilter('other')}
            className={`px-3 py-2 rounded-lg text-sm transition-colors ${
              countryFilter === 'other'
                ? 'bg-primary text-white'
                : 'bg-dark-700 text-gray-400 hover:text-white'
            }`}
          >
            {t.abroad}
          </button>
        </div>

        {/* Match Filter */}
        <div className="flex gap-2">
          <button
            onClick={() => setMatchFilter('all')}
            className={`px-3 py-2 rounded-lg text-sm transition-colors ${
              matchFilter === 'all'
                ? 'bg-primary text-white'
                : 'bg-dark-700 text-gray-400 hover:text-white'
            }`}
          >
            {t.allStatus}
          </button>
          <button
            onClick={() => setMatchFilter('matched')}
            className={`px-3 py-2 rounded-lg text-sm transition-colors ${
              matchFilter === 'matched'
                ? 'bg-green-600 text-white'
                : 'bg-dark-700 text-gray-400 hover:text-white'
            }`}
          >
            {t.matchedFilter}
          </button>
          <button
            onClick={() => setMatchFilter('unmatched')}
            className={`px-3 py-2 rounded-lg text-sm transition-colors ${
              matchFilter === 'unmatched'
                ? 'bg-orange-600 text-white'
                : 'bg-dark-700 text-gray-400 hover:text-white'
            }`}
          >
            {t.unmatchedFilter}
          </button>
        </div>
      </div>

      {/* Athletes Table */}
      <div className="bg-dark-700/50 rounded-xl border border-primary/20 overflow-hidden">
        <table className="w-full">
          <thead className="bg-dark-600/50">
            <tr className="text-left text-gray-400 text-sm">
              <th className="py-3 px-4">{t.athletePdf}</th>
              <th className="py-3 px-4">{t.country}</th>
              <th className="py-3 px-4">{t.category}</th>
              <th className="py-3 px-4 text-right">{t.points}</th>
              <th className="py-3 px-4">{t.matchStatus}</th>
              <th className="py-3 px-4">{t.memberSystem}</th>
            </tr>
          </thead>
          <tbody>
            {filteredAthletes.map((match, i) => (
              <tr key={i} className="border-t border-dark-600 hover:bg-dark-600/30">
                <td className="py-3 px-4 font-medium">{match.athlete.name}</td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-1 rounded text-sm ${
                    match.athlete.country.toLowerCase() === 'switzerland' ||
                    match.athlete.country.toLowerCase() === 'sui' ||
                    match.athlete.country.toLowerCase() === 'ch'
                      ? 'bg-primary/20 text-primary'
                      : 'bg-dark-500 text-gray-400'
                  }`}>
                    {match.athlete.country}
                  </span>
                </td>
                <td className="py-3 px-4 text-gray-400">{match.athlete.bestCategory}</td>
                <td className="py-3 px-4 text-right font-semibold">{match.athlete.totalPoints}</td>
                <td className="py-3 px-4">
                  {match.matchType === 'exact' && (
                    <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-sm">
                      {t.exact}
                    </span>
                  )}
                  {match.matchType === 'normalized' && (
                    <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-sm">
                      {t.normalized}
                    </span>
                  )}
                  {match.matchType === 'potential' && (
                    <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded text-sm">
                      {t.potentialMatches}
                    </span>
                  )}
                  {match.matchType === 'none' && (
                    <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded text-sm">
                      {t.notFound}
                    </span>
                  )}
                </td>
                <td className="py-3 px-4">
                  {match.matchedMember ? (
                    <div>
                      <div className="font-medium text-green-400">{match.matchedMember.firstName} {match.matchedMember.lastName}</div>
                      {match.matchedMember.clubName && (
                        <div className="text-sm text-gray-500">{match.matchedMember.clubName}</div>
                      )}
                    </div>
                  ) : match.potentialMatches.length > 0 ? (
                    <div className="space-y-1">
                      {match.potentialMatches.map((pm, j) => (
                        <div key={j} className="text-sm">
                          <span className="text-yellow-400">{pm.name}</span>
                          <span className="text-gray-500 ml-2">({Math.round(pm.similarity * 100)}%)</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className="text-gray-500">-</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredAthletes.length === 0 && (
          <div className="py-8 text-center text-gray-500">
            {t.noAthletesFound}
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="mt-6 p-4 bg-dark-700/50 rounded-xl border border-dark-500">
        <h3 className="font-semibold mb-3">{t.legend}</h3>
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded">{t.exact}</span>
            <span className="text-gray-400">{t.exactDesc}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded">{t.normalized}</span>
            <span className="text-gray-400">{t.normalizedDesc}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded">{t.potentialMatches}</span>
            <span className="text-gray-400">{t.potentialDesc}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded">{t.notFound}</span>
            <span className="text-gray-400">{t.notFoundDesc}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
