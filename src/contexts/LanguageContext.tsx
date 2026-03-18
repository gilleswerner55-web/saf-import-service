'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export type Language = 'de' | 'en' | 'fr' | 'it'

interface LanguageContextType {
  lang: Language
  setLang: (lang: Language) => void
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

function detectBrowserLanguage(): Language {
  if (typeof window === 'undefined') return 'de'

  const browserLang = navigator.language.toLowerCase().split('-')[0]
  if (browserLang === 'de' || browserLang === 'en' || browserLang === 'fr' || browserLang === 'it') {
    return browserLang as Language
  }
  return 'de' // Default to German for Switzerland
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>('de')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // Check localStorage first, then browser language
    const stored = localStorage.getItem('language') as Language | null
    if (stored && ['de', 'en', 'fr', 'it'].includes(stored)) {
      setLangState(stored)
    } else {
      setLangState(detectBrowserLanguage())
    }
    setMounted(true)
  }, [])

  const setLang = (newLang: Language) => {
    setLangState(newLang)
    localStorage.setItem('language', newLang)
  }

  // Prevent hydration mismatch
  if (!mounted) {
    return <>{children}</>
  }

  return (
    <LanguageContext.Provider value={{ lang, setLang }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}

export const languageNames: Record<Language, string> = {
  de: 'Deutsch',
  en: 'English',
  fr: 'Français',
  it: 'Italiano',
}
