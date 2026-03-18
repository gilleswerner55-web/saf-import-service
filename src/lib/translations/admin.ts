import type { Language } from '@/hooks/useLanguage'

export const translations = {
  de: {
    // Dashboard
    dashboard: 'Dashboard',
    welcomeBack: 'Willkommen zuruck',
    notLoggedIn: 'Nicht eingeloggt',
    pleaseLogin: 'Bitte melde dich an um fortzufahren.',

    // Stats
    athletes: 'Athleten',
    clubs: 'Vereine',
    tournaments: 'Turniere',
    users: 'Benutzer',

    // Quick actions
    quickAccess: 'Schnellzugriff',
    manageMembers: 'Mitglieder verwalten',
    manageMembersDesc: 'Athleten hinzufugen und bearbeiten',
    addTournament: 'Turnier hinzufugen',
    addTournamentDesc: 'Neues Turnier erfassen',
    inviteUser: 'Benutzer einladen',
    inviteUserDesc: 'Club-Admins hinzufugen',

    // Recent activity
    recentTournaments: 'Letzte Turniere',
    tournament: 'Turnier',
    date: 'Datum',
    type: 'Typ',
    status: 'Status',
    completed: 'Abgeschlossen',

    // Members page
    members: 'Mitglieder',
    manageAllAthletes: 'Verwalte alle registrierten Athleten',
    manageClubAthletes: 'Verwalte Athleten von',
    yourClub: 'deinem Verein',
    addAthlete: 'Athlet hinzufugen',
    clubAdminNote: 'Du bist als Club Admin fur',
    clubAdminNoteEnd: 'eingeloggt. Du siehst nur Athleten deines Verein.',
    loadingMembers: 'Lade Mitglieder...',
    search: 'Suchen...',
    allClubs: 'Alle Vereine',
    name: 'Name',
    club: 'Verein',
    category: 'Kategorie',
    actions: 'Aktionen',
    noClub: 'Kein Verein',
    men: 'Herren',
    women: 'Damen',
    noMembersFound: 'Keine Mitglieder gefunden.',
    membersCount: 'Mitglieder',
    of: 'von',

    // Modal
    editMember: 'Mitglied bearbeiten',
    addMember: 'Mitglied hinzufugen',
    firstName: 'Vorname',
    lastName: 'Nachname',
    birthDate: 'Geburtsdatum',
    clickToChange: 'Klicken zum Andern',
    cancel: 'Abbrechen',
    save: 'Speichern',
    add: 'Hinzufugen',
    edit: 'Bearbeiten',
    delete: 'Loschen',
    confirmDelete: 'Mitglied wirklich loschen?',
    saveError: 'Fehler beim Speichern',
    deleteError: 'Fehler beim Loschen',
    uploadError: 'Fehler beim Hochladen des Bildes',

    // Sidebar navigation
    backToWebsite: 'Zuruck zur Website',
    logout: 'Abmelden',
  },
  en: {
    // Dashboard
    dashboard: 'Dashboard',
    welcomeBack: 'Welcome back',
    notLoggedIn: 'Not logged in',
    pleaseLogin: 'Please log in to continue.',

    // Stats
    athletes: 'Athletes',
    clubs: 'Clubs',
    tournaments: 'Tournaments',
    users: 'Users',

    // Quick actions
    quickAccess: 'Quick Access',
    manageMembers: 'Manage Members',
    manageMembersDesc: 'Add and edit athletes',
    addTournament: 'Add Tournament',
    addTournamentDesc: 'Create new tournament',
    inviteUser: 'Invite User',
    inviteUserDesc: 'Add club admins',

    // Recent activity
    recentTournaments: 'Recent Tournaments',
    tournament: 'Tournament',
    date: 'Date',
    type: 'Type',
    status: 'Status',
    completed: 'Completed',

    // Members page
    members: 'Members',
    manageAllAthletes: 'Manage all registered athletes',
    manageClubAthletes: 'Manage athletes from',
    yourClub: 'your club',
    addAthlete: 'Add Athlete',
    clubAdminNote: 'You are logged in as Club Admin for',
    clubAdminNoteEnd: '. You can only see athletes from your club.',
    loadingMembers: 'Loading members...',
    search: 'Search...',
    allClubs: 'All Clubs',
    name: 'Name',
    club: 'Club',
    category: 'Category',
    actions: 'Actions',
    noClub: 'No Club',
    men: 'Men',
    women: 'Women',
    noMembersFound: 'No members found.',
    membersCount: 'Members',
    of: 'of',

    // Modal
    editMember: 'Edit Member',
    addMember: 'Add Member',
    firstName: 'First Name',
    lastName: 'Last Name',
    birthDate: 'Date of Birth',
    clickToChange: 'Click to change',
    cancel: 'Cancel',
    save: 'Save',
    add: 'Add',
    edit: 'Edit',
    delete: 'Delete',
    confirmDelete: 'Really delete member?',
    saveError: 'Error saving',
    deleteError: 'Error deleting',
    uploadError: 'Error uploading image',

    // Sidebar navigation
    backToWebsite: 'Back to website',
    logout: 'Logout',
  },
  fr: {
    // Dashboard
    dashboard: 'Tableau de bord',
    welcomeBack: 'Bienvenue',
    notLoggedIn: 'Non connecte',
    pleaseLogin: 'Veuillez vous connecter pour continuer.',

    // Stats
    athletes: 'Athletes',
    clubs: 'Clubs',
    tournaments: 'Tournois',
    users: 'Utilisateurs',

    // Quick actions
    quickAccess: 'Acces rapide',
    manageMembers: 'Gerer les membres',
    manageMembersDesc: 'Ajouter et modifier des athletes',
    addTournament: 'Ajouter un tournoi',
    addTournamentDesc: 'Creer un nouveau tournoi',
    inviteUser: 'Inviter un utilisateur',
    inviteUserDesc: 'Ajouter des admins de club',

    // Recent activity
    recentTournaments: 'Derniers tournois',
    tournament: 'Tournoi',
    date: 'Date',
    type: 'Type',
    status: 'Statut',
    completed: 'Termine',

    // Members page
    members: 'Membres',
    manageAllAthletes: 'Gerer tous les athletes inscrits',
    manageClubAthletes: 'Gerer les athletes de',
    yourClub: 'votre club',
    addAthlete: 'Ajouter un athlete',
    clubAdminNote: 'Vous etes connecte en tant qu\'Admin Club pour',
    clubAdminNoteEnd: '. Vous ne voyez que les athletes de votre club.',
    loadingMembers: 'Chargement des membres...',
    search: 'Rechercher...',
    allClubs: 'Tous les clubs',
    name: 'Nom',
    club: 'Club',
    category: 'Categorie',
    actions: 'Actions',
    noClub: 'Pas de club',
    men: 'Hommes',
    women: 'Femmes',
    noMembersFound: 'Aucun membre trouve.',
    membersCount: 'Membres',
    of: 'sur',

    // Modal
    editMember: 'Modifier le membre',
    addMember: 'Ajouter un membre',
    firstName: 'Prenom',
    lastName: 'Nom',
    birthDate: 'Date de naissance',
    clickToChange: 'Cliquer pour changer',
    cancel: 'Annuler',
    save: 'Enregistrer',
    add: 'Ajouter',
    edit: 'Modifier',
    delete: 'Supprimer',
    confirmDelete: 'Vraiment supprimer le membre?',
    saveError: 'Erreur lors de l\'enregistrement',
    deleteError: 'Erreur lors de la suppression',
    uploadError: 'Erreur lors du telechargement de l\'image',

    // Sidebar navigation
    backToWebsite: 'Retour au site',
    logout: 'Deconnexion',
  },
  it: {
    // Dashboard
    dashboard: 'Dashboard',
    welcomeBack: 'Bentornato',
    notLoggedIn: 'Non connesso',
    pleaseLogin: 'Effettua il login per continuare.',

    // Stats
    athletes: 'Atleti',
    clubs: 'Club',
    tournaments: 'Tornei',
    users: 'Utenti',

    // Quick actions
    quickAccess: 'Accesso rapido',
    manageMembers: 'Gestisci membri',
    manageMembersDesc: 'Aggiungi e modifica atleti',
    addTournament: 'Aggiungi torneo',
    addTournamentDesc: 'Crea nuovo torneo',
    inviteUser: 'Invita utente',
    inviteUserDesc: 'Aggiungi admin del club',

    // Recent activity
    recentTournaments: 'Ultimi tornei',
    tournament: 'Torneo',
    date: 'Data',
    type: 'Tipo',
    status: 'Stato',
    completed: 'Completato',

    // Members page
    members: 'Membri',
    manageAllAthletes: 'Gestisci tutti gli atleti registrati',
    manageClubAthletes: 'Gestisci atleti di',
    yourClub: 'il tuo club',
    addAthlete: 'Aggiungi atleta',
    clubAdminNote: 'Sei connesso come Admin Club per',
    clubAdminNoteEnd: '. Puoi vedere solo gli atleti del tuo club.',
    loadingMembers: 'Caricamento membri...',
    search: 'Cerca...',
    allClubs: 'Tutti i club',
    name: 'Nome',
    club: 'Club',
    category: 'Categoria',
    actions: 'Azioni',
    noClub: 'Nessun club',
    men: 'Uomini',
    women: 'Donne',
    noMembersFound: 'Nessun membro trovato.',
    membersCount: 'Membri',
    of: 'di',

    // Modal
    editMember: 'Modifica membro',
    addMember: 'Aggiungi membro',
    firstName: 'Nome',
    lastName: 'Cognome',
    birthDate: 'Data di nascita',
    clickToChange: 'Clicca per cambiare',
    cancel: 'Annulla',
    save: 'Salva',
    add: 'Aggiungi',
    edit: 'Modifica',
    delete: 'Elimina',
    confirmDelete: 'Eliminare davvero il membro?',
    saveError: 'Errore durante il salvataggio',
    deleteError: 'Errore durante l\'eliminazione',
    uploadError: 'Errore durante il caricamento dell\'immagine',

    // Sidebar navigation
    backToWebsite: 'Torna al sito',
    logout: 'Esci',
  },
} as const

export type AdminTranslationKey = keyof typeof translations.de

export function t(lang: Language, key: AdminTranslationKey): string {
  return translations[lang][key] || translations.de[key]
}
