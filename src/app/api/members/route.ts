import { NextRequest, NextResponse } from 'next/server'
import { db, members, clubs } from '@/db'
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

// GET members - club admins only see their club members
export async function GET(request: NextRequest) {
  const session = getSession(request)

  try {
    let query = db
      .select({
        id: members.id,
        firstName: members.firstName,
        lastName: members.lastName,
        gender: members.gender,
        birthDate: members.birthDate,
        country: members.country,
        isActive: members.isActive,
        imageUrl: members.imageUrl,
        clubId: members.clubId,
        clubName: clubs.name,
        clubShortName: clubs.shortName,
      })
      .from(members)
      .leftJoin(clubs, eq(members.clubId, clubs.id))
      .orderBy(members.lastName, members.firstName)

    // Club admins only see their own club's members
    if (session && session.role === 'admin' && session.clubId) {
      query = query.where(eq(members.clubId, session.clubId)) as typeof query
    }

    const allMembers = await query
    return NextResponse.json(allMembers)
  } catch (error) {
    console.error('Failed to fetch members:', error)
    return NextResponse.json(
      { error: 'Failed to fetch members' },
      { status: 500 }
    )
  }
}

// POST create new member - club admins can only create for their club
export async function POST(request: NextRequest) {
  const session = getSession(request)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()

    // Club admins can only create members for their own club
    let clubId = body.clubId || null
    if (session.role === 'admin' && session.clubId) {
      clubId = session.clubId // Force their own club
    }

    const newMember = await db.insert(members).values({
      firstName: body.firstName,
      lastName: body.lastName,
      gender: body.gender,
      birthDate: body.birthDate ? new Date(body.birthDate) : null,
      clubId,
      country: body.country || 'Switzerland',
      isActive: body.isActive ?? true,
    }).returning()

    return NextResponse.json(newMember[0], { status: 201 })
  } catch (error) {
    console.error('Failed to create member:', error)
    return NextResponse.json(
      { error: 'Failed to create member' },
      { status: 500 }
    )
  }
}
