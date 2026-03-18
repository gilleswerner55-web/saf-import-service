import type { Language } from '@/hooks/useLanguage'

export const translations = {
  de: {
    subtitle: 'Offizielle Rankings und Turnierverwaltung des Schweizer Armwrestling Verbands',
    viewRankings: 'Rankings anzeigen',
    tournamentsButton: 'Turniere',
    clubs: 'Vereine',
    members: 'Mitglieder',
    quickAccess: 'Schnellzugriff',
    slpRankingsMen: 'SLP Rankings Herren',
    slpRankingsMenDesc: 'Aktuelle Swiss League Points Rangliste der Herren',
    slpRankingsWomen: 'SLP Rankings Damen',
    slpRankingsWomenDesc: 'Aktuelle Swiss League Points Rangliste der Damen',
    tournamentCalendar: 'Turnierkalender',
    tournamentCalendarDesc: 'Kommende und vergangene Turniere',
    adminArea: 'Admin Bereich',
    adminAreaDesc: 'Vereinsverwaltung (nur fur Berechtigte)',
  },
  en: {
    subtitle: 'Official rankings and tournament management of the Swiss Armwrestling Federation',
    viewRankings: 'View Rankings',
    tournamentsButton: 'Tournaments',
    clubs: 'Clubs',
    members: 'Members',
    quickAccess: 'Quick Access',
    slpRankingsMen: 'SLP Rankings Men',
    slpRankingsMenDesc: 'Current Swiss League Points rankings for men',
    slpRankingsWomen: 'SLP Rankings Women',
    slpRankingsWomenDesc: 'Current Swiss League Points rankings for women',
    tournamentCalendar: 'Tournament Calendar',
    tournamentCalendarDesc: 'Upcoming and past tournaments',
    adminArea: 'Admin Area',
    adminAreaDesc: 'Club management (authorized only)',
  },
  fr: {
    subtitle: 'Classements officiels et gestion des tournois de la Federation Suisse de Bras de Fer',
    viewRankings: 'Voir les classements',
    tournamentsButton: 'Tournois',
    clubs: 'Clubs',
    members: 'Membres',
    quickAccess: 'Acces rapide',
    slpRankingsMen: 'Classement SLP Hommes',
    slpRankingsMenDesc: 'Classement actuel Swiss League Points des hommes',
    slpRankingsWomen: 'Classement SLP Femmes',
    slpRankingsWomenDesc: 'Classement actuel Swiss League Points des femmes',
    tournamentCalendar: 'Calendrier des tournois',
    tournamentCalendarDesc: 'Tournois a venir et passes',
    adminArea: 'Espace Admin',
    adminAreaDesc: 'Gestion des clubs (autorises uniquement)',
  },
  it: {
    subtitle: 'Classifiche ufficiali e gestione tornei della Federazione Svizzera di Braccio di Ferro',
    viewRankings: 'Vedi classifiche',
    tournamentsButton: 'Tornei',
    clubs: 'Club',
    members: 'Membri',
    quickAccess: 'Accesso rapido',
    slpRankingsMen: 'Classifica SLP Uomini',
    slpRankingsMenDesc: 'Classifica attuale Swiss League Points degli uomini',
    slpRankingsWomen: 'Classifica SLP Donne',
    slpRankingsWomenDesc: 'Classifica attuale Swiss League Points delle donne',
    tournamentCalendar: 'Calendario tornei',
    tournamentCalendarDesc: 'Tornei in arrivo e passati',
    adminArea: 'Area Admin',
    adminAreaDesc: 'Gestione club (solo autorizzati)',
  },
} as const

export type HomeTranslationKey = keyof typeof translations.de

export function t(lang: Language, key: HomeTranslationKey): string {
  return translations[lang][key] || translations.de[key]
}
