// Robust name matching utility for handling special characters

/**
 * Normalizes a string for comparison by:
 * - Converting to lowercase
 * - Normalizing Unicode (NFD decomposition + removing diacritics)
 * - Trimming whitespace
 */
export function normalizeForComparison(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/ß/g, 'ss') // Handle German eszett
    .trim()
}

/**
 * Check if two names match, accounting for special characters
 */
export function namesMatch(name1: string, name2: string): boolean {
  return normalizeForComparison(name1) === normalizeForComparison(name2)
}

/**
 * Find the best match for a name in a list of names
 * Returns the original name from the list if found, or null
 */
export function findNameMatch(
  searchName: string,
  nameList: string[]
): string | null {
  const normalizedSearch = normalizeForComparison(searchName)

  // First try exact match (case-insensitive)
  const exactMatch = nameList.find(
    name => name.toLowerCase().trim() === searchName.toLowerCase().trim()
  )
  if (exactMatch) return exactMatch

  // Then try normalized match
  const normalizedMatch = nameList.find(
    name => normalizeForComparison(name) === normalizedSearch
  )
  if (normalizedMatch) return normalizedMatch

  return null
}

/**
 * Calculate similarity between two strings (Levenshtein distance based)
 * Returns a score from 0 to 1 (1 = identical)
 */
export function calculateSimilarity(str1: string, str2: string): number {
  const s1 = normalizeForComparison(str1)
  const s2 = normalizeForComparison(str2)

  if (s1 === s2) return 1

  const longer = s1.length > s2.length ? s1 : s2
  const shorter = s1.length > s2.length ? s2 : s1

  if (longer.length === 0) return 1

  const distance = levenshteinDistance(s1, s2)
  return (longer.length - distance) / longer.length
}

function levenshteinDistance(str1: string, str2: string): number {
  const m = str1.length
  const n = str2.length
  const dp: number[][] = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0))

  for (let i = 0; i <= m; i++) dp[i][0] = i
  for (let j = 0; j <= n; j++) dp[0][j] = j

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1]
      } else {
        dp[i][j] = Math.min(
          dp[i - 1][j] + 1,     // deletion
          dp[i][j - 1] + 1,     // insertion
          dp[i - 1][j - 1] + 1  // substitution
        )
      }
    }
  }

  return dp[m][n]
}

/**
 * Find potential matches for a name with similarity scores
 */
export function findPotentialMatches(
  searchName: string,
  nameList: string[],
  minSimilarity: number = 0.7
): Array<{ name: string; similarity: number }> {
  return nameList
    .map(name => ({
      name,
      similarity: calculateSimilarity(searchName, name)
    }))
    .filter(match => match.similarity >= minSimilarity)
    .sort((a, b) => b.similarity - a.similarity)
}
