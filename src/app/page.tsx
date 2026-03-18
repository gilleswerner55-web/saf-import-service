'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useLanguage } from '@/hooks/useLanguage'
import { t } from '@/lib/translations/home'
import { t as tc } from '@/lib/translations/common'

export default function Home() {
  const lang = useLanguage()
  const [stats, setStats] = useState({ clubs: 0, members: 0 })

  useEffect(() => {
    fetch('/api/stats')
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(console.error)
  }, [])

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 px-4 flex flex-col items-center justify-center text-center">
        <div className="absolute inset-0 bg-gradient-to-b from-primary-900/30 to-dark-900/80" />

        <div className="relative z-10 max-w-4xl mx-auto">
          {/* Logo */}
          <div className="mb-8 flex justify-center">
            <Image
              src="/logo-saf.png"
              alt="Swiss Armsport Federation"
              width={200}
              height={200}
              className="drop-shadow-2xl"
            />
          </div>

          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            <span className="text-primary">Swiss Armsport</span>
            <br />
            <span className="text-white">Federation</span>
          </h1>

          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            {t(lang, 'subtitle')}
          </p>

          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              href="/rankings"
              className="px-8 py-4 bg-primary hover:bg-primary-light text-white font-semibold rounded-lg transition-all hover:scale-105 shadow-lg"
            >
              {t(lang, 'viewRankings')}
            </Link>
            <Link
              href="/tournaments"
              className="px-8 py-4 bg-dark-600 hover:bg-dark-500 text-white font-semibold rounded-lg transition-all hover:scale-105 border border-primary/30"
            >
              {t(lang, 'tournamentsButton')}
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 bg-dark-800/50">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6 rounded-xl bg-dark-700/50 border border-primary/20">
              <div className="text-4xl font-bold text-primary mb-2">{stats.clubs || '–'}</div>
              <div className="text-gray-400">{t(lang, 'clubs')}</div>
            </div>
            <div className="text-center p-6 rounded-xl bg-dark-700/50 border border-primary/20">
              <div className="text-4xl font-bold text-primary mb-2">{stats.members || '–'}</div>
              <div className="text-gray-400">{t(lang, 'members')}</div>
            </div>
            <div className="text-center p-6 rounded-xl bg-dark-700/50 border border-primary/20">
              <div className="text-4xl font-bold text-primary mb-2">SLP</div>
              <div className="text-gray-400">{tc(lang, 'slp')}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            {t(lang, 'quickAccess')}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link href="/rankings" className="group">
              <div className="p-6 rounded-xl bg-dark-700/50 border border-primary/20 hover:border-primary/50 transition-all">
                <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                  {t(lang, 'slpRankingsMen')}
                </h3>
                <p className="text-gray-400">
                  {t(lang, 'slpRankingsMenDesc')}
                </p>
              </div>
            </Link>

            <Link href="/rankings?category=women" className="group">
              <div className="p-6 rounded-xl bg-dark-700/50 border border-primary/20 hover:border-primary/50 transition-all">
                <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                  {t(lang, 'slpRankingsWomen')}
                </h3>
                <p className="text-gray-400">
                  {t(lang, 'slpRankingsWomenDesc')}
                </p>
              </div>
            </Link>

            <Link href="/tournaments" className="group">
              <div className="p-6 rounded-xl bg-dark-700/50 border border-primary/20 hover:border-primary/50 transition-all">
                <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                  {t(lang, 'tournamentCalendar')}
                </h3>
                <p className="text-gray-400">
                  {t(lang, 'tournamentCalendarDesc')}
                </p>
              </div>
            </Link>

            <Link href="/admin" className="group">
              <div className="p-6 rounded-xl bg-dark-700/50 border border-primary/20 hover:border-primary/50 transition-all">
                <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                  {t(lang, 'adminArea')}
                </h3>
                <p className="text-gray-400">
                  {t(lang, 'adminAreaDesc')}
                </p>
              </div>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
