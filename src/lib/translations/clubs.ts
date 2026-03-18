import type { Language } from '@/hooks/useLanguage'

export const translations = {
  de: {
    title: 'SAF Vereine',
    subtitle: 'Mitgliedsvereine des Schweizerischen Armwrestling Verbands',
    loading: 'Lade Vereine...',
    points: 'Punkte',
    athletes: 'Athleten',
    topAthletes: 'Top Athleten:',
    clubs: 'Vereine',
    activeAthletes: 'Aktive Athleten',
    totalPoints: 'Gesamtpunkte',
    registerClub: 'Deinen Verein registrieren?',
    registerClubDesc: 'Ist dein Armwrestling-Verein noch nicht Mitglied beim SAF? Kontaktiere uns fur weitere Informationen.',
    contact: 'Kontakt aufnehmen',
  },
  en: {
    title: 'SAF Clubs',
    subtitle: 'Member clubs of the Swiss Armwrestling Federation',
    loading: 'Loading clubs...',
    points: 'Points',
    athletes: 'Athletes',
    topAthletes: 'Top Athletes:',
    clubs: 'Clubs',
    activeAthletes: 'Active Athletes',
    totalPoints: 'Total Points',
    registerClub: 'Register your club?',
    registerClubDesc: 'Is your armwrestling club not yet a SAF member? Contact us for more information.',
    contact: 'Contact us',
  },
  fr: {
    title: 'Clubs SAF',
    subtitle: 'Clubs membres de la Federation Suisse de Bras de Fer',
    loading: 'Chargement des clubs...',
    points: 'Points',
    athletes: 'Athletes',
    topAthletes: 'Meilleurs athletes:',
    clubs: 'Clubs',
    activeAthletes: 'Athletes actifs',
    totalPoints: 'Points totaux',
    registerClub: 'Enregistrer votre club?',
    registerClubDesc: 'Votre club de bras de fer n\'est pas encore membre de la SAF? Contactez-nous pour plus d\'informations.',
    contact: 'Nous contacter',
  },
  it: {
    title: 'Club SAF',
    subtitle: 'Club membri della Federazione Svizzera di Braccio di Ferro',
    loading: 'Caricamento club...',
    points: 'Punti',
    athletes: 'Atleti',
    topAthletes: 'Migliori atleti:',
    clubs: 'Club',
    activeAthletes: 'Atleti attivi',
    totalPoints: 'Punti totali',
    registerClub: 'Registrare il tuo club?',
    registerClubDesc: 'Il tuo club di braccio di ferro non e ancora membro della SAF? Contattaci per maggiori informazioni.',
    contact: 'Contattaci',
  },
} as const

export type ClubsTranslationKey = keyof typeof translations.de

export function t(lang: Language, key: ClubsTranslationKey): string {
  return translations[lang][key] || translations.de[key]
}
