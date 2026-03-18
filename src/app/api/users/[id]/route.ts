import { NextRequest, NextResponse } from 'next/server'
import { db, users } from '@/db'
import { eq } from 'drizzle-orm'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'

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

// DELETE user (super_admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = getSession(request)
  if (!session || session.role !== 'super_admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await params

  // Prevent deleting yourself
  if (id === session.userId) {
    return NextResponse.json({ error: 'Cannot delete yourself' }, { status: 400 })
  }

  const deleted = await db.delete(users).where(eq(users.id, id)).returning()

  if (deleted.length === 0) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  return NextResponse.json({ success: true })
}

// PUT update user (super_admin only, or user updating own password)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = getSession(request)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const body = await request.json()

  // Only super_admin can update other users
  if (id !== session.userId && session.role !== 'super_admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Only super_admin can change roles
  if (body.role && session.role !== 'super_admin') {
    return NextResponse.json({ error: 'Cannot change role' }, { status: 403 })
  }

  const updateData: { role?: 'super_admin' | 'admin'; passwordHash?: string; updatedAt: Date } = {
    updatedAt: new Date(),
  }

  if (body.role) {
    updateData.role = body.role
  }

  // Reset password (generates new random password)
  let generatedPassword: string | undefined
  if (body.resetPassword) {
    generatedPassword = crypto.randomBytes(8).toString('hex')
    updateData.passwordHash = await bcrypt.hash(generatedPassword, 12)
  }

  // Set specific password
  if (body.newPassword) {
    updateData.passwordHash = await bcrypt.hash(body.newPassword, 12)
  }

  const [updated] = await db
    .update(users)
    .set(updateData)
    .where(eq(users.id, id))
    .returning({
      id: users.id,
      email: users.email,
      role: users.role,
    })

  if (!updated) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  return NextResponse.json({
    ...updated,
    ...(generatedPassword && { generatedPassword }),
  })
}
