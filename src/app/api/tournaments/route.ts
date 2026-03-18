import { NextRequest, NextResponse } from 'next/server'
import { db, tournaments, tournamentOrganizers, clubs } from '@/db'
import { desc, eq } from 'drizzle-orm'

// Helper to get session from cookie
function getSession(request: NextRequest) {
  const cookie = request.cookies.get('admin-session')?.value
  if (!cookie) return null
  try {
    return JSON.parse(Buffer.from(cookie, 'base64').toString('utf-8'))
  } catch {
    return null
  }
}

// GET all tournaments with organizers
export async function GET() {
  try {
    const allTournaments = await db
      .select()
      .from(tournaments)
      .orderBy(desc(tournaments.date))

    // Get organizers for all tournaments
    const organizers = await db
      .select({
        tournamentId: tournamentOrganizers.tournamentId,
        clubId: tournamentOrganizers.clubId,
        clubName: clubs.name,
        clubShortName: clubs.shortName,
      })
      .from(tournamentOrganizers)
      .leftJoin(clubs, eq(tournamentOrganizers.clubId, clubs.id))

    // Map organizers to tournaments
    const tournamentsWithOrganizers = allTournaments.map(tournament => ({
      ...tournament,
      organizers: organizers
        .filter(o => o.tournamentId === tournament.id)
        .map(o => ({
          clubId: o.clubId,
          clubName: o.clubName,
          clubShortName: o.clubShortName,
        })),
    }))

    return NextResponse.json(tournamentsWithOrganizers)
  } catch (error) {
    console.error('Failed to fetch tournaments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tournaments' },
      { status: 500 }
    )
  }
}

// POST create new tournament - super_admin only
export async function POST(request: NextRequest) {
  const session = getSession(request)
  if (!session || session.role !== 'super_admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const body = await request.json()

    const newTournament = await db.insert(tournaments).values({
      name: body.name,
      date: new Date(body.date),
      location: body.location,
      type: body.type || 'national',
      status: body.status || 'upcoming',
      logoUrl: body.logoUrl,
      posterUrl: body.posterUrl,
    }).returning()

    // Add organizers if provided
    if (body.organizerClubIds && body.organizerClubIds.length > 0) {
      await db.insert(tournamentOrganizers).values(
        body.organizerClubIds.map((clubId: string) => ({
          tournamentId: newTournament[0].id,
          clubId,
        }))
      )
    }

    // Fetch the organizers to return with the tournament
    const organizers = await db
      .select({
        clubId: tournamentOrganizers.clubId,
        clubName: clubs.name,
        clubShortName: clubs.shortName,
      })
      .from(tournamentOrganizers)
      .leftJoin(clubs, eq(tournamentOrganizers.clubId, clubs.id))
      .where(eq(tournamentOrganizers.tournamentId, newTournament[0].id))

    return NextResponse.json({
      ...newTournament[0],
      organizers: organizers.map(o => ({
        clubId: o.clubId,
        clubName: o.clubName,
        clubShortName: o.clubShortName,
      })),
    }, { status: 201 })
  } catch (error) {
    console.error('Failed to create tournament:', error)
    return NextResponse.json(
      { error: 'Failed to create tournament' },
      { status: 500 }
    )
  }
}
