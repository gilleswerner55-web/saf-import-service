'use client'

import { useState, useEffect } from 'react'

type Language = 'de' | 'en' | 'fr' | 'it'

const languageNames: Record<Language, string> = {
  de: 'Deutsch',
  en: 'English',
  fr: 'Français',
  it: 'Italiano',
}

interface LanguageSwitcherProps {
  compact?: boolean
}

export function LanguageSwitcher({ compact = false }: LanguageSwitcherProps) {
  const [lang, setLangState] = useState<Language>('de')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('language') as Language | null
    if (stored && ['de', 'en', 'fr', 'it'].includes(stored)) {
      setLangState(stored)
    }
    setMounted(true)
  }, [])

  const setLang = (newLang: Language) => {
    setLangState(newLang)
    localStorage.setItem('language', newLang)
    // Dispatch custom event so other components can react to language change
    window.dispatchEvent(new CustomEvent('languageChange', { detail: newLang }))
  }

  const languages: Language[] = ['de', 'en', 'fr', 'it']

  if (!mounted) return null

  if (compact) {
    return (
      <select
        value={lang}
        onChange={(e) => setLang(e.target.value as Language)}
        className="bg-dark-700 border border-dark-500 text-gray-300 text-sm rounded px-2 py-1 focus:outline-none focus:border-primary"
      >
        {languages.map((l) => (
          <option key={l} value={l}>
            {l.toUpperCase()}
          </option>
        ))}
      </select>
    )
  }

  return (
    <div className="flex items-center gap-1">
      {languages.map((l) => (
        <button
          key={l}
          onClick={() => setLang(l)}
          className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
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
  )
}
