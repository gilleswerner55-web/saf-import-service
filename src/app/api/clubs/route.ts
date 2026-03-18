import { NextRequest, NextResponse } from 'next/server'
import { db, clubs } from '@/db'
import { eq } from 'drizzle-orm'

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

// GET clubs - club admins only see their own club
export async function GET(request: NextRequest) {
  const session = getSession(request)

  try {
    // Club admins only see their own club
    if (session && session.role === 'admin' && session.clubId) {
      const club = await db
        .select()
        .from(clubs)
        .where(eq(clubs.id, session.clubId))
      return NextResponse.json(club)
    }

    // Super admins see all clubs
    const allClubs = await db
      .select()
      .from(clubs)
      .orderBy(clubs.name)

    return NextResponse.json(allClubs)
  } catch (error) {
    console.error('Failed to fetch clubs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch clubs' },
      { status: 500 }
    )
  }
}

// POST create new club - super_admin only
export async function POST(request: NextRequest) {
  const session = getSession(request)
  if (!session || session.role !== 'super_admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const body = await request.json()

    const newClub = await db.insert(clubs).values({
      name: body.name,
      shortName: body.shortName,
      location: body.location,
      logoUrl: body.logoUrl,
      presidentId: body.presidentId || null,
    }).returning()

    return NextResponse.json(newClub[0], { status: 201 })
  } catch (error) {
    console.error('Failed to create club:', error)
    return NextResponse.json(
      { error: 'Failed to create club' },
      { status: 500 }
    )
  }
}
