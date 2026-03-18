import { NextRequest, NextResponse } from 'next/server'
import { db, members } from '@/db'
import { eq, and } from 'drizzle-orm'

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

// PUT update member
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

    // Club admins can only update members from their own club
    if (session.role === 'admin' && session.clubId) {
      const member = await db.query.members.findFirst({
        where: eq(members.id, id),
      })
      if (!member || member.clubId !== session.clubId) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
    }

    // Club admins cannot change clubId
    let clubId = body.clubId || null
    if (session.role === 'admin' && session.clubId) {
      clubId = session.clubId
    }

    const updated = await db
      .update(members)
      .set({
        firstName: body.firstName,
        lastName: body.lastName,
        gender: body.gender,
        birthDate: body.birthDate ? new Date(body.birthDate) : null,
        clubId,
        imageUrl: body.imageUrl,
        updatedAt: new Date(),
      })
      .where(eq(members.id, id))
      .returning()

    if (updated.length === 0) {
      return NextResponse.json(
        { error: 'Member not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(updated[0])
  } catch (error) {
    console.error('Failed to update member:', error)
    return NextResponse.json(
      { error: 'Failed to update member' },
      { status: 500 }
    )
  }
}

// DELETE member
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = getSession(request)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id } = await params

    // Club admins can only delete members from their own club
    if (session.role === 'admin' && session.clubId) {
      const member = await db.query.members.findFirst({
        where: eq(members.id, id),
      })
      if (!member || member.clubId !== session.clubId) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
    }

    const deleted = await db
      .delete(members)
      .where(eq(members.id, id))
      .returning()

    if (deleted.length === 0) {
      return NextResponse.json(
        { error: 'Member not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete member:', error)
    return NextResponse.json(
      { error: 'Failed to delete member' },
      { status: 500 }
    )
  }
}
