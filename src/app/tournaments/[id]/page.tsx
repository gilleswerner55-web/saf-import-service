'use client'

import { useState, useEffect, use } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useLanguage, type Language } from '@/hooks/useLanguage'

interface TournamentResult {
  id: string
  athleteName: string
  position: number
  country: string
  totalPoints: number | null
  memberFirstName: string | null
  memberLastName: string | null
  memberImageUrl: string | null
  clubName: string | null
  clubShortName: string | null
  clubLogoUrl: string | null
}

interface TournamentCategory {
  id: string
  name: string
  gender: 'men' | 'women'
  arm: 'left' | 'right'
  type: 'senior' | 'junior' | 'master' | 'amateur'
  weightClass: string | null
  results: TournamentResult[]
}

interface Tournament {
  id: string
  name: string
  date: string
  location: string | null
  type: string
  status: 'upcoming' | 'completed'
  logoUrl: string | null
  posterUrl: string | null
  participantCount: number | null
  organizers: {
    clubId: string
    clubName: string | null
    clubShortName: string | null
    clubLogoUrl: string | null
  }[]
  categories: TournamentCategory[]
}

type ArmTab = 'left' | 'right'
type CategoryFilter = 'all' | 'junior' | 'amateur' | 'senior' | 'master'

const translations = {
  de: {
    back: 'Zuruck zur Ubersicht',
    left: 'Links',
    right: 'Rechts',
    all: 'Alle',
    juniors: 'Junioren',
    amateur: 'Amateur',
    senior: 'Senior',
    masters: 'Masters',
    men: 'Manner',
    women: 'Frauen',
    loading: 'Lade Turnier...',
    notFound: 'Turnier nicht gefunden',
    noResults: 'Keine Ergebnisse verfugbar',
    participants: 'Teilnehmer',
    categories: 'Kategorien',
    organizedBy: 'Organisiert von',
  },
  en: {
    back: 'Back to Overview',
    left: 'Left',
    right: 'Right',
    all: 'All',
    juniors: 'Juniors',
    amateur: 'Amateur',
    senior: 'Senior',
    masters: 'Masters',
    men: 'Men',
    women: 'Women',
    loading: 'Loading tournament...',
    notFound: 'Tournament not found',
    noResults: 'No results available',
    participants: 'Participants',
    categories: 'Categories',
    organizedBy: 'Organized by',
  },
  fr: {
    back: 'Retour a la vue d\'ensemble',
    left: 'Gauche',
    right: 'Droite',
    all: 'Tous',
    juniors: 'Juniors',
    amateur: 'Amateur',
    senior: 'Senior',
    masters: 'Masters',
    men: 'Hommes',
    women: 'Femmes',
    loading: 'Chargement du tournoi...',
    notFound: 'Tournoi non trouve',
    noResults: 'Aucun resultat disponible',
    participants: 'Participants',
    categories: 'Categories',
    organizedBy: 'Organise par',
  },
  it: {
    back: 'Torna alla panoramica',
    left: 'Sinistra',
    right: 'Destra',
    all: 'Tutti',
    juniors: 'Juniores',
    amateur: 'Dilettanti',
    senior: 'Senior',
    masters: 'Masters',
    men: 'Uomini',
    women: 'Donne',
    loading: 'Caricamento torneo...',
    notFound: 'Torneo non trovato',
    noResults: 'Nessun risultato disponibile',
    participants: 'Partecipanti',
    categories: 'Categorie',
    organizedBy: 'Organizzato da',
  },
}

function t(lang: Language, key: keyof typeof translations.de): string {
  return translations[lang][key] || translations.de[key]
}

function getMedalStyle(rank: number) {
  if (rank === 1) return 'bg-gradient-to-br from-yellow-300 to-yellow-500 text-yellow-900'
  if (rank === 2) return 'bg-gradient-to-br from-gray-200 to-gray-400 text-gray-700'
  if (rank === 3) return 'bg-gradient-to-br from-amber-500 to-amber-700 text-amber-100'
  return 'bg-dark-600 text-gray-300'
}

function getTypeColor(type: string) {
  switch (type) {
    case 'senior': return 'bg-primary'
    case 'junior': return 'bg-blue-500'
    case 'amateur': return 'bg-gray-600'
    case 'master': return 'bg-amber-600'
    default: return 'bg-gray-500'
  }
}

export default function TournamentResultPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const lang = useLanguage()
  const [tournament, setTournament] = useState<Tournament | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [armTab, setArmTab] = useState<ArmTab>('left')
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all')

  useEffect(() => {
    async function fetchTournament() {
      try {
        const response = await fetch(`/api/tournaments/${id}`)
        if (!response.ok) {
          if (response.status === 404) {
            setError('notFound')
          } else {
            throw new Error('Failed to fetch tournament')
          }
          return
        }
        const data = await response.json()
        setTournament(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load tournament')
      } finally {
        setIsLoading(false)
      }
    }
    fetchTournament()
  }, [id])

  if (isLoading) {
    return (
      <div className="min-h-screen py-12 px-4 flex items-center justify-center">
        <div className="text-gray-400">{t(lang, 'loading')}</div>
      </div>
    )
  }

  if (error || !tournament) {
    return (
      <div className="min-h-screen py-12 px-4 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 mb-4">{error === 'notFound' ? t(lang, 'notFound') : error}</div>
          <Link href="/tournaments" className="text-primary hover:text-primary-light">
            ← {t(lang, 'back')}
          </Link>
        </div>
      </div>
    )
  }

  const date = new Date(tournament.date)
  const dateLocale = lang === 'de' ? 'de-CH' : lang === 'fr' ? 'fr-CH' : lang === 'it' ? 'it-CH' : 'en-GB'
  const formattedDate = date.toLocaleDateString(dateLocale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  // Filter categories by arm and type
  const filteredCategories = tournament.categories.filter(category => {
    const armMatch = category.arm === armTab
    const typeMatch = categoryFilter === 'all' || category.type === categoryFilter
    return armMatch && typeMatch
  })

  const hasResults = tournament.categories.some(c => c.results.length > 0)

  return (
    <div className="min-h-screen">
      {/* Hero Banner */}
      <section className="relative pt-24 pb-12 bg-gradient-to-b from-dark-800 via-dark-800 to-dark-900 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 right-20 w-64 h-64 border border-primary/10 rounded-full" />
          <div className="absolute bottom-10 left-10 w-48 h-48 border border-white/5 rounded-full" />
        </div>

        <div className="relative max-w-6xl mx-auto px-4">
          <Link href="/tournaments" className="inline-flex items-center text-primary hover:text-primary-light mb-6 transition-colors">
            <span className="mr-2">←</span> {t(lang, 'back')}
          </Link>

          <div className="flex flex-col md:flex-row items-center justify-center gap-6 mb-6">
            {tournament.logoUrl && (
              <div className="w-32 h-32 md:w-48 md:h-48 relative flex-shrink-0">
                <Image
                  src={tournament.logoUrl}
                  alt={tournament.name}
                  fill
                  className="object-contain"
                />
              </div>
            )}
            <div className="text-center md:text-left">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-2">
                {tournament.name}
              </h1>
              <p className="text-primary text-lg">{formattedDate}</p>
              {tournament.location && (
                <p className="text-gray-400">{tournament.location}</p>
              )}
              <div className="flex flex-wrap gap-4 mt-4 justify-center md:justify-start">
                {tournament.participantCount && (
                  <span className="text-sm text-gray-300">
                    <span className="text-primary font-semibold">{tournament.participantCount}</span> {t(lang, 'participants')}
                  </span>
                )}
                {tournament.categories.length > 0 && (
                  <span className="text-sm text-gray-300">
                    <span className="text-primary font-semibold">{tournament.categories.length}</span> {t(lang, 'categories')}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Organizers */}
          {tournament.organizers.length > 0 && (
            <div className="text-center mt-6">
              <span className="text-sm text-gray-500">{t(lang, 'organizedBy')}: </span>
              <span className="text-gray-300">
                {tournament.organizers.map(o => o.clubName || o.clubShortName).join(', ')}
              </span>
            </div>
          )}

          <div className="w-24 h-1 bg-gradient-to-r from-primary to-primary-light mx-auto rounded-full mt-6" />
        </div>
      </section>

      {/* Results Section */}
      {hasResults ? (
        <section className="py-8 px-4">
          <div className="max-w-6xl mx-auto">
            {/* Left/Right Tabs */}
            <div className="flex justify-center mb-8">
              <div className="inline-flex bg-dark-700 rounded-xl p-1 shadow-lg">
                <button
                  onClick={() => setArmTab('left')}
                  className={`px-8 py-3 rounded-lg font-bold transition-all flex items-center gap-2 ${
                    armTab === 'left'
                      ? 'bg-gradient-to-r from-primary to-primary-light text-white shadow-md'
                      : 'text-gray-400 hover:text-white hover:bg-dark-600'
                  }`}
                >
                  <span className="text-xl transform -scale-x-100">💪</span>
                  {t(lang, 'left')}
                </button>
                <button
                  onClick={() => setArmTab('right')}
                  className={`px-8 py-3 rounded-lg font-bold transition-all flex items-center gap-2 ${
                    armTab === 'right'
                      ? 'bg-gradient-to-r from-primary to-primary-light text-white shadow-md'
                      : 'text-gray-400 hover:text-white hover:bg-dark-600'
                  }`}
                >
                  {t(lang, 'right')}
                  <span className="text-xl">💪</span>
                </button>
              </div>
            </div>

            {/* Category Filter */}
            <div className="flex justify-center mb-6 flex-wrap gap-2">
              {[
                { id: 'all' as CategoryFilter, label: t(lang, 'all') },
                { id: 'junior' as CategoryFilter, label: t(lang, 'juniors') },
                { id: 'amateur' as CategoryFilter, label: t(lang, 'amateur') },
                { id: 'senior' as CategoryFilter, label: t(lang, 'senior') },
                { id: 'master' as CategoryFilter, label: t(lang, 'masters') },
              ].map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setCategoryFilter(filter.id)}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                    categoryFilter === filter.id
                      ? 'bg-primary text-white shadow-md'
                      : 'bg-dark-700 text-gray-400 hover:bg-dark-600 hover:text-white border border-dark-600'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>

            {/* Results Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCategories.map((category) => (
                <div key={category.id} className="bg-dark-700/50 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden border border-dark-600">
                  <div className={`${getTypeColor(category.type)} px-5 py-4 flex justify-between items-center`}>
                    <h3 className="font-bold text-white">{category.name}</h3>
                    <span className="bg-black/25 px-3 py-1 rounded-full text-sm text-white/90">
                      {category.results.length}
                    </span>
                  </div>
                  <div className="py-2">
                    {category.results.map((result) => {
                      const displayName = result.memberFirstName && result.memberLastName
                        ? `${result.memberFirstName} ${result.memberLastName}`
                        : result.athleteName
                      return (
                        <div
                          key={result.id}
                          className="flex items-center px-5 py-3 hover:bg-dark-600/50 transition-colors"
                        >
                          <span className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm mr-4 flex-shrink-0 ${getMedalStyle(result.position)}`}>
                            {result.position}
                          </span>
                          {result.memberImageUrl && (
                            <div className="relative group/pic mr-3 flex-shrink-0">
                              <Image
                                src={result.memberImageUrl}
                                alt={displayName}
                                width={28}
                                height={28}
                                className="rounded-full object-cover bg-dark-600 shadow-sm transition-all duration-300 group-hover/pic:scale-150 group-hover/pic:z-50"
                              />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <span className={`text-gray-200 block ${result.position <= 3 ? 'font-semibold' : ''}`}>
                              {displayName}
                            </span>
                            {(result.clubShortName || result.clubName) && (
                              <span className="text-gray-500 text-xs">{result.clubShortName || result.clubName}</span>
                            )}
                          </div>
                          {result.clubLogoUrl && (
                            <div className="relative group/logo flex-shrink-0">
                              <Image
                                src={result.clubLogoUrl}
                                alt={result.clubName || ''}
                                width={24}
                                height={24}
                                className="rounded-full object-contain bg-dark-600 p-0.5 opacity-60 transition-all duration-300 group-hover/logo:opacity-100 group-hover/logo:scale-150 group-hover/logo:z-50"
                              />
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>

            {filteredCategories.length === 0 && (
              <div className="text-center text-gray-500 py-12">
                {t(lang, 'noResults')}
              </div>
            )}
          </div>
        </section>
      ) : (
        <section className="py-12 px-4">
          <div className="max-w-6xl mx-auto text-center">
            <p className="text-gray-500">{t(lang, 'noResults')}</p>
          </div>
        </section>
      )}
    </div>
  )
}
