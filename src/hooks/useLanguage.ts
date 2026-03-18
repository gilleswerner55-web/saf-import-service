'use client'

import { useState, useEffect } from 'react'

export type Language = 'de' | 'en' | 'fr' | 'it'

const VALID_LANGUAGES: Language[] = ['de', 'en', 'fr', 'it']

export function useLanguage(): Language {
  const [lang, setLang] = useState<Language>('de')

  useEffect(() => {
    // Read initial value from localStorage
    const stored = localStorage.getItem('language') as Language | null
    if (stored && VALID_LANGUAGES.includes(stored)) {
      setLang(stored)
    }

    // Listen for language changes from LanguageSwitcher
    const handleLanguageChange = (event: CustomEvent<Language>) => {
      setLang(event.detail)
    }

    window.addEventListener('languageChange', handleLanguageChange as EventListener)

    return () => {
      window.removeEventListener('languageChange', handleLanguageChange as EventListener)
    }
  }, [])

  return lang
}
