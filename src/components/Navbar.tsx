'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { LanguageSwitcher } from './LanguageSwitcher'
import { useLanguage } from '@/hooks/useLanguage'
import { t } from '@/lib/translations/common'

export function Navbar() {
  const lang = useLanguage()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <nav className="bg-dark-800/95 backdrop-blur-sm border-b border-primary/20 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/logo-saf.png"
              alt="SAF"
              width={40}
              height={40}
              className="rounded"
            />
            <span className="font-bold text-lg hidden sm:block">
              <span className="text-primary">SAF</span> Rankings
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              href="/rankings"
              className="text-gray-300 hover:text-primary transition-colors"
            >
              {t(lang, 'rankings')}
            </Link>
            <Link
              href="/tournaments"
              className="text-gray-300 hover:text-primary transition-colors"
            >
              {t(lang, 'tournaments')}
            </Link>
            <Link
              href="/clubs"
              className="text-gray-300 hover:text-primary transition-colors"
            >
              {t(lang, 'clubs')}
            </Link>
            <Link
              href="/admin"
              className="px-4 py-2 bg-primary hover:bg-primary-light text-white rounded-lg transition-colors"
            >
              {t(lang, 'admin')}
            </Link>
            <LanguageSwitcher />
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-gray-300 hover:text-white"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-primary/20">
            <div className="flex flex-col gap-4">
              <Link
                href="/rankings"
                className="text-gray-300 hover:text-primary transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t(lang, 'rankings')}
              </Link>
              <Link
                href="/tournaments"
                className="text-gray-300 hover:text-primary transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t(lang, 'tournaments')}
              </Link>
              <Link
                href="/clubs"
                className="text-gray-300 hover:text-primary transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t(lang, 'clubs')}
              </Link>
              <Link
                href="/admin"
                className="px-4 py-2 bg-primary hover:bg-primary-light text-white rounded-lg transition-colors text-center"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t(lang, 'admin')}
              </Link>
              <div className="pt-2 border-t border-primary/20">
                <LanguageSwitcher />
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
