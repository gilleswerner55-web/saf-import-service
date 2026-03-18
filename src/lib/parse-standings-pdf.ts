export interface ParsedPlacement {
  position: number
  name: string
  country: string
}

export interface ParsedCategory {
  name: string
  arm: 'left' | 'right'
  gender: 'men' | 'women'
  type: 'master' | 'junior' | 'amateur' | 'senior'
  weightClass: string
  placements: ParsedPlacement[]
}

export interface ParsedTournamentResults {
  tournamentName: string
  categories: ParsedCategory[]
  totalAthletes: number
  uniqueAthletes: string[]
}

// Category patterns to identify the type
const categoryPatterns = {
  master: /^Master\s+(Men|Women)/i,
  junior: /^Junior\s+(Boys|Girls)/i,
  amateur: /^Amateur/i,
  senior: /^(Senior\s+Women|Men\s+\d+)/i,
}

function parseCategory(categoryLine: string): Omit<ParsedCategory, 'placements'> | null {
  const armMatch = categoryLine.match(/(Left|Right)$/i)
  if (!armMatch) return null

  const arm = armMatch[1].toLowerCase() as 'left' | 'right'
  const categoryWithoutArm = categoryLine.replace(/\s*(Left|Right)$/i, '').trim()

  // Determine gender
  let gender: 'men' | 'women' = 'men'
  if (/Women|Girls/i.test(categoryWithoutArm)) {
    gender = 'women'
  }

  // Determine type
  let type: 'master' | 'junior' | 'amateur' | 'senior' = 'senior'
  if (categoryPatterns.master.test(categoryWithoutArm)) {
    type = 'master'
  } else if (categoryPatterns.junior.test(categoryWithoutArm)) {
    type = 'junior'
  } else if (categoryPatterns.amateur.test(categoryWithoutArm)) {
    type = 'amateur'
  }

  // Extract weight class
  const weightMatch = categoryWithoutArm.match(/[+-]?\d+\s*kg|\+\d+/i)
  const weightClass = weightMatch ? weightMatch[0].replace(/\s/g, '') : 'open'

  return {
    name: categoryWithoutArm,
    arm,
    gender,
    type,
    weightClass,
  }
}

function parsePlacement(line: string): ParsedPlacement | null {
  // Match pattern: "1ATHLETE NAME - Country" or "1 ATHLETE NAME - Country" (with or without space after number)
  const match = line.match(/^\s*(\d+)\s*([A-ZÄÖÜÉÈÀÂÊÎÔÛÇ\s'-]+(?:\s*[+-]?\d+)?)\s*-\s*(\w+)\s*$/i)

  if (!match) return null

  return {
    position: parseInt(match[1], 10),
    name: match[2].trim().replace(/\s*[+-]?\d+\s*$/, '').trim(), // Remove weight class notation from name
    country: match[3].trim(),
  }
}

export async function parseStandingsPdf(pdfBuffer: Buffer): Promise<ParsedTournamentResults> {
  // Dynamic import for pdf-parse to avoid webpack issues
  const pdfParse = (await import('pdf-parse')).default
  const data = await pdfParse(pdfBuffer)

  // Get all text from PDF
  const allText: string = data.text

  // Split into lines and clean up
  const lines: string[] = allText.split('\n').map((l: string) => l.trim()).filter((l: string) => l.length > 0)

  // Try to extract tournament name from header
  let tournamentName = 'Tournament'
  const headerMatch = allText.match(/^([^-\n]+)\s*-\s*Standings/m)
  if (headerMatch) {
    tournamentName = headerMatch[1].trim()
  }

  const categories: ParsedCategory[] = []
  let currentCategory: ParsedCategory | null = null
  const allAthletes = new Set<string>()

  for (const line of lines) {
    // Skip page headers/footers
    if (line.includes('Standings Page') || line.match(/^Page\s+\d+/i)) {
      continue
    }

    // Check if this is a category header
    if (line.match(/(Left|Right)$/i) && !line.match(/^\d+/)) {
      const categoryInfo = parseCategory(line)
      if (categoryInfo) {
        // Save previous category if exists
        if (currentCategory && currentCategory.placements.length > 0) {
          categories.push(currentCategory)
        }
        currentCategory = {
          ...categoryInfo,
          placements: [],
        }
      }
      continue
    }

    // Try to parse as placement
    if (currentCategory) {
      const placement = parsePlacement(line)
      if (placement) {
        currentCategory.placements.push(placement)
        allAthletes.add(placement.name)
      }
    }
  }

  // Don't forget the last category
  if (currentCategory && currentCategory.placements.length > 0) {
    categories.push(currentCategory)
  }

  return {
    tournamentName,
    categories,
    totalAthletes: allAthletes.size,
    uniqueAthletes: Array.from(allAthletes).sort(),
  }
}

// SLP Point calculation based on the algorithm
export interface SLPPointsConfig {
  placementPoints: Record<number, number>
  categorySizeBonus: { min: number; max: number; bonus: number }[]
  tournamentTypeBonus: Record<string, number>
}

export const defaultSLPConfig: SLPPointsConfig = {
  placementPoints: {
    1: 15,
    2: 11,
    3: 8,
    4: 4,
    5: 3,
    6: 2,
  },
  categorySizeBonus: [
    { min: 3, max: 5, bonus: 1 },
    { min: 6, max: 10, bonus: 2 },
    { min: 11, max: Infinity, bonus: 3 },
  ],
  tournamentTypeBonus: {
    national: 0,
    international: 7,
    em: 9,
    wm: 10,
  },
}

export interface AthletePoints {
  name: string
  categories: {
    category: string
    arm: string
    position: number
    basePoints: number
    sizeBonus: number
    total: number
  }[]
  bestCategory: string
  totalPoints: number
}

interface CategoryPoints {
  category: string
  arm: string
  position: number
  basePoints: number
  sizeBonus: number
  total: number
}

export function calculateSLPPoints(
  results: ParsedTournamentResults,
  tournamentType: 'national' | 'international' | 'em' | 'wm' = 'national',
  config: SLPPointsConfig = defaultSLPConfig
): Map<string, AthletePoints> {
  const athletePoints = new Map<string, AthletePoints>()
  const typeBonus = config.tournamentTypeBonus[tournamentType] || 0

  for (const category of results.categories) {
    const categorySize = category.placements.length

    // Calculate size bonus
    let sizeBonus = 0
    for (const bonusRule of config.categorySizeBonus) {
      if (categorySize >= bonusRule.min && categorySize <= bonusRule.max) {
        sizeBonus = bonusRule.bonus
        break
      }
    }

    for (const placement of category.placements) {
      // Only Swiss athletes get SLP points
      if (placement.country.toLowerCase() !== 'switzerland') continue

      const basePoints = config.placementPoints[placement.position] || 1
      const totalCategoryPoints = basePoints + sizeBonus + typeBonus

      if (!athletePoints.has(placement.name)) {
        athletePoints.set(placement.name, {
          name: placement.name,
          categories: [],
          bestCategory: '',
          totalPoints: 0,
        })
      }

      const athlete = athletePoints.get(placement.name)!
      athlete.categories.push({
        category: category.name,
        arm: category.arm,
        position: placement.position,
        basePoints,
        sizeBonus: sizeBonus + typeBonus,
        total: totalCategoryPoints,
      })
    }
  }

  // Calculate best category for each athlete (they only keep their best score)
  athletePoints.forEach((athlete: AthletePoints) => {
    if (athlete.categories.length > 0) {
      const best = athlete.categories.reduce((a: CategoryPoints, b: CategoryPoints) =>
        a.total > b.total ? a : b
      )
      athlete.bestCategory = `${best.category} ${best.arm}`
      athlete.totalPoints = best.total
    }
  })

  return athletePoints
}
