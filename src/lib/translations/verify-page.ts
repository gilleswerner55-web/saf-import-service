export type Language = 'de' | 'en' | 'fr' | 'it'

export const translations = {
  de: {
    // Header
    verification: 'Verifikation & Konsolidierung',
    tournamentNotFound: 'Turnier nicht gefunden',
    tournamentNotFoundDesc: 'Das Turnier mit ID {id} existiert nicht.',
    backToTournaments: 'Zurück zu Turnieren',
    loadingData: 'Lade Daten...',

    // Stats
    totalAthletes: 'Total Athleten',
    swiss: 'Schweizer',
    foreigners: 'Ausländer',
    matched: 'Zugeordnet',
    unmatched: 'Nicht zugeordnet',
    matchRate: 'Match Rate (CH)',

    // Filters
    searchPlaceholder: 'Suchen nach Name, Land, Kategorie...',
    allCountries: 'Alle Länder',
    onlySwitzerland: 'Nur Schweiz',
    abroad: 'Ausland',
    allStatus: 'Alle Status',
    matchedFilter: 'Zugeordnet',
    unmatchedFilter: 'Nicht zugeordnet',

    // Table headers
    athletePdf: 'Athlet (PDF)',
    country: 'Land',
    category: 'Kategorie',
    points: 'Punkte',
    matchStatus: 'Match Status',
    memberSystem: 'Mitglied (System)',

    // Match types
    exact: 'Exakt',
    normalized: 'Normalisiert',
    potentialMatches: 'Mögliche Treffer',
    notFound: 'Nicht gefunden',

    // Legend
    legend: 'Legende Match Status',
    exactDesc: 'Name stimmt 1:1 überein',
    normalizedDesc: 'Match nach Normalisierung (ü=u, ä=a, etc.)',
    potentialDesc: 'Ähnliche Namen gefunden (überprüfen)',
    notFoundDesc: 'Kein Match in Mitgliederliste',

    // Empty state
    noAthletesFound: 'Keine Athleten gefunden mit den aktuellen Filtern.',
    noResultsUploaded: 'Keine Ergebnisse hochgeladen',
    noResultsUploadedDesc: 'Für dieses Turnier wurden noch keine Ergebnisse hochgeladen. Laden Sie eine PDF-Datei mit den Turnierergebnissen hoch, um die Athleten zu verifizieren.',
  },

  en: {
    // Header
    verification: 'Verification & Consolidation',
    tournamentNotFound: 'Tournament not found',
    tournamentNotFoundDesc: 'The tournament with ID {id} does not exist.',
    backToTournaments: 'Back to Tournaments',
    loadingData: 'Loading data...',

    // Stats
    totalAthletes: 'Total Athletes',
    swiss: 'Swiss',
    foreigners: 'Foreigners',
    matched: 'Matched',
    unmatched: 'Unmatched',
    matchRate: 'Match Rate (CH)',

    // Filters
    searchPlaceholder: 'Search by name, country, category...',
    allCountries: 'All Countries',
    onlySwitzerland: 'Switzerland Only',
    abroad: 'Foreign',
    allStatus: 'All Status',
    matchedFilter: 'Matched',
    unmatchedFilter: 'Unmatched',

    // Table headers
    athletePdf: 'Athlete (PDF)',
    country: 'Country',
    category: 'Category',
    points: 'Points',
    matchStatus: 'Match Status',
    memberSystem: 'Member (System)',

    // Match types
    exact: 'Exact',
    normalized: 'Normalized',
    potentialMatches: 'Potential Matches',
    notFound: 'Not Found',

    // Legend
    legend: 'Match Status Legend',
    exactDesc: 'Name matches exactly',
    normalizedDesc: 'Match after normalization (ü=u, ä=a, etc.)',
    potentialDesc: 'Similar names found (verify)',
    notFoundDesc: 'No match in member list',

    // Empty state
    noAthletesFound: 'No athletes found with current filters.',
    noResultsUploaded: 'No results uploaded',
    noResultsUploadedDesc: 'No results have been uploaded for this tournament yet. Upload a PDF file with tournament results to verify athletes.',
  },

  fr: {
    // Header
    verification: 'Vérification & Consolidation',
    tournamentNotFound: 'Tournoi non trouvé',
    tournamentNotFoundDesc: 'Le tournoi avec l\'ID {id} n\'existe pas.',
    backToTournaments: 'Retour aux tournois',
    loadingData: 'Chargement des données...',

    // Stats
    totalAthletes: 'Total athlètes',
    swiss: 'Suisses',
    foreigners: 'Étrangers',
    matched: 'Associés',
    unmatched: 'Non associés',
    matchRate: 'Taux de correspondance (CH)',

    // Filters
    searchPlaceholder: 'Rechercher par nom, pays, catégorie...',
    allCountries: 'Tous les pays',
    onlySwitzerland: 'Suisse uniquement',
    abroad: 'Étranger',
    allStatus: 'Tous les statuts',
    matchedFilter: 'Associés',
    unmatchedFilter: 'Non associés',

    // Table headers
    athletePdf: 'Athlète (PDF)',
    country: 'Pays',
    category: 'Catégorie',
    points: 'Points',
    matchStatus: 'Statut de correspondance',
    memberSystem: 'Membre (Système)',

    // Match types
    exact: 'Exact',
    normalized: 'Normalisé',
    potentialMatches: 'Correspondances possibles',
    notFound: 'Non trouvé',

    // Legend
    legend: 'Légende des statuts de correspondance',
    exactDesc: 'Le nom correspond exactement',
    normalizedDesc: 'Correspondance après normalisation (ü=u, ä=a, etc.)',
    potentialDesc: 'Noms similaires trouvés (à vérifier)',
    notFoundDesc: 'Pas de correspondance dans la liste des membres',

    // Empty state
    noAthletesFound: 'Aucun athlète trouvé avec les filtres actuels.',
    noResultsUploaded: 'Aucun résultat téléchargé',
    noResultsUploadedDesc: 'Aucun résultat n\'a encore été téléchargé pour ce tournoi. Téléchargez un fichier PDF avec les résultats du tournoi pour vérifier les athlètes.',
  },

  it: {
    // Header
    verification: 'Verifica & Consolidamento',
    tournamentNotFound: 'Torneo non trovato',
    tournamentNotFoundDesc: 'Il torneo con ID {id} non esiste.',
    backToTournaments: 'Torna ai tornei',
    loadingData: 'Caricamento dati...',

    // Stats
    totalAthletes: 'Totale atleti',
    swiss: 'Svizzeri',
    foreigners: 'Stranieri',
    matched: 'Associati',
    unmatched: 'Non associati',
    matchRate: 'Tasso di corrispondenza (CH)',

    // Filters
    searchPlaceholder: 'Cerca per nome, paese, categoria...',
    allCountries: 'Tutti i paesi',
    onlySwitzerland: 'Solo Svizzera',
    abroad: 'Estero',
    allStatus: 'Tutti gli stati',
    matchedFilter: 'Associati',
    unmatchedFilter: 'Non associati',

    // Table headers
    athletePdf: 'Atleta (PDF)',
    country: 'Paese',
    category: 'Categoria',
    points: 'Punti',
    matchStatus: 'Stato corrispondenza',
    memberSystem: 'Membro (Sistema)',

    // Match types
    exact: 'Esatto',
    normalized: 'Normalizzato',
    potentialMatches: 'Possibili corrispondenze',
    notFound: 'Non trovato',

    // Legend
    legend: 'Legenda stato corrispondenza',
    exactDesc: 'Il nome corrisponde esattamente',
    normalizedDesc: 'Corrispondenza dopo normalizzazione (ü=u, ä=a, etc.)',
    potentialDesc: 'Nomi simili trovati (da verificare)',
    notFoundDesc: 'Nessuna corrispondenza nella lista membri',

    // Empty state
    noAthletesFound: 'Nessun atleta trovato con i filtri attuali.',
    noResultsUploaded: 'Nessun risultato caricato',
    noResultsUploadedDesc: 'Non sono ancora stati caricati risultati per questo torneo. Carica un file PDF con i risultati del torneo per verificare gli atleti.',
  },
} as const

export type TranslationKey = keyof typeof translations.de

export function getTranslation(lang: Language, key: TranslationKey, params?: Record<string, string>): string {
  let text: string = translations[lang][key] || translations.de[key]
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      text = text.replace(`{${k}}`, v)
    })
  }
  return text
}

export const languageNames: Record<Language, string> = {
  de: 'Deutsch',
  en: 'English',
  fr: 'Français',
  it: 'Italiano',
}
