import type { Language } from '@/hooks/useLanguage'

export const translations = {
  de: {
    // Navigation
    rankings: 'Rankings',
    tournaments: 'Turniere',
    clubs: 'Vereine',
    admin: 'Admin',

    // Common
    loading: 'Lade...',
    error: 'Fehler',
    save: 'Speichern',
    cancel: 'Abbrechen',
    delete: 'Löschen',
    edit: 'Bearbeiten',
    add: 'Hinzufügen',
    search: 'Suchen...',
    noResults: 'Keine Ergebnisse gefunden.',
    all: 'Alle',

    // Genders
    men: 'Herren',
    women: 'Damen',

    // Status
    upcoming: 'Bevorstehend',
    completed: 'Abgeschlossen',
    active: 'Aktiv',
    inactive: 'Inaktiv',

    // Stats
    athletes: 'Athleten',
    points: 'Punkte',
    members: 'Mitglieder',
    users: 'Benutzer',

    // Dates
    date: 'Datum',
    lastUpdated: 'Letzte Aktualisierung',

    // Organization
    swissArmsportFederation: 'Schweizerischer Armwrestling Verband',
    saf: 'SAF',
    slp: 'Swiss League Points',
  },
  en: {
    // Navigation
    rankings: 'Rankings',
    tournaments: 'Tournaments',
    clubs: 'Clubs',
    admin: 'Admin',

    // Common
    loading: 'Loading...',
    error: 'Error',
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    add: 'Add',
    search: 'Search...',
    noResults: 'No results found.',
    all: 'All',

    // Genders
    men: 'Men',
    women: 'Women',

    // Status
    upcoming: 'Upcoming',
    completed: 'Completed',
    active: 'Active',
    inactive: 'Inactive',

    // Stats
    athletes: 'Athletes',
    points: 'Points',
    members: 'Members',
    users: 'Users',

    // Dates
    date: 'Date',
    lastUpdated: 'Last updated',

    // Organization
    swissArmsportFederation: 'Swiss Armwrestling Federation',
    saf: 'SAF',
    slp: 'Swiss League Points',
  },
  fr: {
    // Navigation
    rankings: 'Classements',
    tournaments: 'Tournois',
    clubs: 'Clubs',
    admin: 'Admin',

    // Common
    loading: 'Chargement...',
    error: 'Erreur',
    save: 'Enregistrer',
    cancel: 'Annuler',
    delete: 'Supprimer',
    edit: 'Modifier',
    add: 'Ajouter',
    search: 'Rechercher...',
    noResults: 'Aucun resultat trouve.',
    all: 'Tous',

    // Genders
    men: 'Hommes',
    women: 'Femmes',

    // Status
    upcoming: 'A venir',
    completed: 'Termine',
    active: 'Actif',
    inactive: 'Inactif',

    // Stats
    athletes: 'Athletes',
    points: 'Points',
    members: 'Membres',
    users: 'Utilisateurs',

    // Dates
    date: 'Date',
    lastUpdated: 'Derniere mise a jour',

    // Organization
    swissArmsportFederation: 'Federation Suisse de Bras de Fer',
    saf: 'SAF',
    slp: 'Swiss League Points',
  },
  it: {
    // Navigation
    rankings: 'Classifiche',
    tournaments: 'Tornei',
    clubs: 'Club',
    admin: 'Admin',

    // Common
    loading: 'Caricamento...',
    error: 'Errore',
    save: 'Salva',
    cancel: 'Annulla',
    delete: 'Elimina',
    edit: 'Modifica',
    add: 'Aggiungi',
    search: 'Cerca...',
    noResults: 'Nessun risultato trovato.',
    all: 'Tutti',

    // Genders
    men: 'Uomini',
    women: 'Donne',

    // Status
    upcoming: 'In arrivo',
    completed: 'Completato',
    active: 'Attivo',
    inactive: 'Inattivo',

    // Stats
    athletes: 'Atleti',
    points: 'Punti',
    members: 'Membri',
    users: 'Utenti',

    // Dates
    date: 'Data',
    lastUpdated: 'Ultimo aggiornamento',

    // Organization
    swissArmsportFederation: 'Federazione Svizzera di Braccio di Ferro',
    saf: 'SAF',
    slp: 'Swiss League Points',
  },
} as const

export type CommonTranslationKey = keyof typeof translations.de

export function t(lang: Language, key: CommonTranslationKey): string {
  return translations[lang][key] || translations.de[key]
}
