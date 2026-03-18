'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import type { SLPStandings } from '@/lib/types'
import { getClubLogo } from '@/lib/club-logos'
import { useLanguage } from '@/hooks/useLanguage'
import { t } from '@/lib/translations/clubs'

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) {
    return (
      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gold text-dark-900 font-bold text-sm">
        1
      </span>
    )
  }
  if (rank === 2) {
    return (
      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-silver text-dark-900 font-bold text-sm">
        2
      </span>
    )
  }
  if (rank === 3) {
    return (
      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-bronze text-dark-900 font-bold text-sm">
        3
      </span>
    )
  }
  return (
    <span className="inline-flex items-center justify-center w-6 h-6 text-gray-500 font-semibold text-sm">
      #{rank}
    </span>
  )
}

function ClubLogo({ clubName }: { clubName: string }) {
  const logoUrl = getClubLogo(clubName)

  if (!logoUrl) {
    return (
      <div className="w-16 h-16 rounded-lg bg-dark-600 flex items-center justify-center text-2xl font-bold text-primary">
        {clubName.charAt(0)}
      </div>
    )
  }

  return (
    <div className="w-16 h-16 rounded-lg bg-white/10 overflow-hidden flex items-center justify-center p-1">
      <Image
        src={logoUrl}
        alt={clubName}
        width={56}
        height={56}
        className="object-contain"
      />
    </div>
  )
}

export default function ClubsPage() {
  const lang = useLanguage()
  const [standings, setStandings] = useState<SLPStandings | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/standings')
      .then(res => res.json())
      .then(data => {
        setStandings(data)
        setLoading(false)
      })
      .catch(err => {
        console.error('Failed to load standings:', err)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen py-12 px-4 flex items-center justify-center">
        <div className="text-gray-400">{t(lang, 'loading')}</div>
      </div>
    )
  }

  const clubs = standings?.clubs || []

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">
            {t(lang, 'title')}
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            {t(lang, 'subtitle')}
          </p>
        </div>

        {/* Clubs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clubs.map(club => (
            <div
              key={club.club}
              className="p-6 rounded-xl bg-dark-700/50 border border-primary/20 hover:border-primary/40 transition-all"
            >
              <div className="flex items-start gap-4 mb-4">
                <ClubLogo clubName={club.club} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-lg font-semibold leading-tight">{club.club}</h3>
                    <RankBadge rank={club.rank} />
                  </div>
                  <div className="mt-2 flex gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">{t(lang, 'points')}: </span>
                      <span className="text-primary font-bold">{club.points}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">{t(lang, 'athletes')}: </span>
                      <span className="text-white font-semibold">{club.athletes}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Top Athletes */}
              <div className="pt-4 border-t border-dark-500">
                <p className="text-xs text-gray-500 mb-2">{t(lang, 'topAthletes')}</p>
                <div className="flex flex-wrap gap-1">
                  {Object.entries(club.breakdown)
                    .sort((a, b) => b[1].total - a[1].total)
                    .slice(0, 3)
                    .map(([name, data]) => (
                      <span
                        key={name}
                        className="text-xs bg-dark-600 px-2 py-1 rounded"
                      >
                        {name.split(' ')[0]} ({data.total})
                      </span>
                    ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary Stats */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-6 rounded-xl bg-dark-700/50 border border-primary/20">
            <div className="text-4xl font-bold text-primary mb-2">{clubs.length}</div>
            <div className="text-gray-400">{t(lang, 'clubs')}</div>
          </div>
          <div className="text-center p-6 rounded-xl bg-dark-700/50 border border-primary/20">
            <div className="text-4xl font-bold text-primary mb-2">
              {clubs.reduce((sum, c) => sum + c.athletes, 0)}
            </div>
            <div className="text-gray-400">{t(lang, 'activeAthletes')}</div>
          </div>
          <div className="text-center p-6 rounded-xl bg-dark-700/50 border border-primary/20">
            <div className="text-4xl font-bold text-primary mb-2">
              {clubs.reduce((sum, c) => sum + c.points, 0)}
            </div>
            <div className="text-gray-400">{t(lang, 'totalPoints')}</div>
          </div>
        </div>

        {/* Join CTA */}
        <div className="mt-12 text-center p-8 bg-dark-800/50 rounded-xl border border-primary/20">
          <h3 className="text-2xl font-bold mb-4">
            {t(lang, 'registerClub')}
          </h3>
          <p className="text-gray-400 mb-6 max-w-xl mx-auto">
            {t(lang, 'registerClubDesc')}
          </p>
          <a
            href="mailto:info@swissarmsport.ch"
            className="inline-block px-8 py-3 bg-primary hover:bg-primary-light text-white font-semibold rounded-lg transition-colors"
          >
            {t(lang, 'contact')}
          </a>
        </div>
      </div>
    </div>
  )
}
