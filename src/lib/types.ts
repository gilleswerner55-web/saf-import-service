// SLP Standings Types

export interface Athlete {
  rank: number
  name: string
  club: string
  points: number
  breakdown: string
}

export interface ClubBreakdown {
  [athleteName: string]: { total: number }
}

export interface Club {
  rank: number
  club: string
  points: number
  athletes: number
  breakdown: ClubBreakdown
}

export interface Tournament {
  name: string
  date: string
  type: string
}

export interface SLPStandings {
  season: string
  lastUpdated: string
  tournaments: Tournament[]
  note: string
  men: Athlete[]
  women: Athlete[]
  clubs: Club[]
}
