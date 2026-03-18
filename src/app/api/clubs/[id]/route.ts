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

// PUT update club - club admins can only update their own club
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = getSession(request)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id } = await params
    const body = await request.json()

    // Club admins can only edit their own club
    if (session.role === 'admin' && session.clubId !== id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const updated = await db
      .update(clubs)
      .set({
        name: body.name,
        shortName: body.shortName || null,
        location: body.location || null,
        logoUrl: body.logoUrl,
        presidentId: body.presidentId || null,
        updatedAt: new Date(),
      })
      .where(eq(clubs.id, id))
      .returning()

    if (updated.length === 0) {
      return NextResponse.json(
        { error: 'Club not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(updated[0])
  } catch (error) {
    console.error('Failed to update club:', error)
    return NextResponse.json(
      { error: 'Failed to update club' },
      { status: 500 }
    )
  }
}

// DELETE club - super_admin only
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = getSession(request)
  if (!session || session.role !== 'super_admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const { id } = await params
    const deleted = await db
      .delete(clubs)
      .where(eq(clubs.id, id))
      .returning()

    if (deleted.length === 0) {
      return NextResponse.json(
        { error: 'Club not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete club:', error)
    return NextResponse.json(
      { error: 'Failed to delete club' },
      { status: 500 }
    )
  }
}
