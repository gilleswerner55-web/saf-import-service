/**
 * Swiss League Points (SLP) Calculator
 * Version: 2025
 *
 * IMPORTANT RULE: Per athlete, per tournament, only the BEST placement
 * across all weight classes within a category type counts.
 */

// Point values for placements
const placementPoints: Record<number, number> = {
  1: 15,
  2: 11,
  3: 8,
  4: 4,
  5: 3,
  6: 2,
  // 7 and above = 1 point
}

// Bonus points for competition type
const competitionBonus: Record<string, number> = {
  national: 0,
  international: 7,
  em: 9,  // European Championship
  wm: 10, // World Championship
}

/**
 * Get placement points for a given rank
 */
export function getPlacementPoints(rank: number): number {
  if (rank <= 0) return 0
  if (rank <= 6) return placementPoints[rank]
  return 1 // 7th place and below
}

/**
 * Get category size bonus based on number of participants
 */
export function getCategorySizeBonus(participants: number): number {
  if (participants >= 11) return 3
  if (participants >= 6) return 2
  if (participants >= 3) return 1
  return 0
}

/**
 * Get competition type bonus
 */
export function getCompetitionBonus(type: string): number {
  return competitionBonus[type] || 0
}

/**
 * Extract category type from category name
 */
export function getCategoryType(categoryName: string): string {
  const name = categoryName.toLowerCase()
  if (name.includes('junior boy')) return 'junior_boys'
  if (name.includes('junior girl')) return 'junior_girls'
  if (name.includes('junior')) return 'junior'
  if (name.includes('amateur')) return 'amateur'
  if (name.includes('men') || name.includes('männer')) return 'men'
  if (name.includes('women') || name.includes('frauen') || name.includes('senior women')) return 'women'
  if (name.includes('master')) return 'master'
  return 'other'
}

export interface SingleResult {
  category: string
  rank: number
  participants: number
}

export interface PointsBreakdown {
  placement: number
  sizeBonus: number
  competitionBonus: number
  total: number
}

/**
 * Calculate points for a single result
 */
export function calculateSingleResult(
  rank: number,
  participants: number,
  competitionType: string = 'national'
): PointsBreakdown {
  const placement = getPlacementPoints(rank)
  const sizeBonus = getCategorySizeBonus(participants)
  const compBonus = getCompetitionBonus(competitionType)

  return {
    placement,
    sizeBonus,
    competitionBonus: compBonus,
    total: placement + sizeBonus + compBonus,
  }
}

/**
 * Calculate points for an athlete at a tournament
 * Only counts the BEST result per category type
 */
export function calculateTournamentPoints(
  results: SingleResult[],
  competitionType: string = 'national'
) {
  // Group results by category type
  const byType: Record<string, SingleResult[]> = {}

  results.forEach((result) => {
    const type = getCategoryType(result.category)
    if (!byType[type]) {
      byType[type] = []
    }
    byType[type].push(result)
  })

  // For each category type, find the best result (lowest rank)
  let totalPoints = 0
  const breakdown: Array<{
    category: string
    categoryType: string
    rank: number
    participants: number
    points: PointsBreakdown
  }> = []

  for (const type in byType) {
    const typeResults = byType[type]
    // Sort by rank (ascending) to get best result first
    typeResults.sort((a, b) => a.rank - b.rank)
    const best = typeResults[0]

    const points = calculateSingleResult(
      best.rank,
      best.participants,
      competitionType
    )

    totalPoints += points.total

    breakdown.push({
      category: best.category,
      categoryType: type,
      rank: best.rank,
      participants: best.participants,
      points,
    })
  }

  return {
    competitionType,
    results: breakdown,
    totalPoints,
  }
}
