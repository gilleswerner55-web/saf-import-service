import { NextResponse } from 'next/server'
import { db, members, clubs, tournaments, slpRankings } from '@/db'
import { eq, desc, asc } from 'drizzle-orm'

export async function GET() {
  try {
    // Fetch all data in parallel
    const [rankingsData, tournamentsData, clubsData] = await Promise.all([
      // Get rankings with member and club info
      db.select({
        rank: slpRankings.rank,
        totalPoints: slpRankings.totalPoints,
        breakdown: slpRankings.breakdown,
        gender: slpRankings.gender,
        season: slpRankings.season,
        lastUpdated: slpRankings.lastUpdated,
        firstName: members.firstName,
        lastName: members.lastName,
        clubName: clubs.name,
      })
        .from(slpRankings)
        .leftJoin(members, eq(slpRankings.memberId, members.id))
        .leftJoin(clubs, eq(members.clubId, clubs.id))
        .orderBy(asc(slpRankings.rank)),

      // Get completed tournaments
      db.select()
        .from(tournaments)
        .where(eq(tournaments.status, 'completed'))
        .orderBy(desc(tournaments.date)),

      // Get all clubs for club rankings calculation
      db.select()
        .from(clubs),
    ])

    // Get unique season and lastUpdated from rankings
    const season = rankingsData[0]?.season || '2026'
    const lastUpdated = rankingsData[0]?.lastUpdated?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0]

    // Split rankings by gender
    const men = rankingsData
      .filter(r => r.gender === 'men')
      .map(r => ({
        rank: r.rank!,
        name: `${r.firstName} ${r.lastName}`,
        club: r.clubName || '',
        points: r.totalPoints,
        breakdown: r.breakdown || '',
      }))

    const women = rankingsData
      .filter(r => r.gender === 'women')
      .map(r => ({
        rank: r.rank!,
        name: `${r.firstName} ${r.lastName}`,
        club: r.clubName || '',
        points: r.totalPoints,
        breakdown: r.breakdown || '',
      }))

    // Calculate club rankings from individual rankings
    const clubPointsMap = new Map<string, { points: number; athletes: Set<string>; breakdown: Record<string, { total: number }> }>()

    rankingsData.forEach(r => {
      if (r.clubName) {
        const existing = clubPointsMap.get(r.clubName) || { points: 0, athletes: new Set<string>(), breakdown: {} }
        const athleteName = `${r.firstName} ${r.lastName}`
        existing.points += r.totalPoints
        existing.athletes.add(athleteName)
        existing.breakdown[athleteName] = { total: r.totalPoints }
        clubPointsMap.set(r.clubName, existing)
      }
    })

    // Convert to array and sort by points
    const clubRankings = Array.from(clubPointsMap.entries())
      .map(([club, data]) => ({
        club,
        points: data.points,
        athletes: data.athletes.size,
        breakdown: data.breakdown,
      }))
      .sort((a, b) => b.points - a.points)
      .map((club, index) => ({
        rank: index + 1,
        ...club,
      }))

    // Format tournaments
    const tournamentsList = tournamentsData.map(t => ({
      name: t.name,
      date: t.date.toISOString().split('T')[0],
      type: t.type,
    }))

    return NextResponse.json({
      season,
      lastUpdated,
      tournaments: tournamentsList,
      note: 'Best CATEGORY (weight class) per athlete across both arms. Only points from that single best category count for both arms.',
      men,
      women,
      clubs: clubRankings,
    })
  } catch (error) {
    console.error('Failed to fetch standings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch standings' },
      { status: 500 }
    )
  }
}
