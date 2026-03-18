import { NextRequest, NextResponse } from 'next/server'
import { db, users } from '@/db'
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

// GET all users (admin only)
export async function GET(request: NextRequest) {
  const session = getSession(request)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const allUsers = await db.query.users.findMany({
    columns: {
      id: true,
      email: true,
      role: true,
      clubId: true,
      createdAt: true,
    },
  })

  return NextResponse.json(allUsers)
}

// POST create new user (super_admin only)
export async function POST(request: NextRequest) {
  const session = getSession(request)
  if (!session || session.role !== 'super_admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const { email, role, clubId } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 })
    }

    // Admins must have a club assigned
    if (role === 'admin' && !clubId) {
      return NextResponse.json({ error: 'Club required for admin users' }, { status: 400 })
    }

    // Generate random password
    const password = crypto.randomBytes(8).toString('hex')
    const passwordHash = await bcrypt.hash(password, 12)

    const [newUser] = await db.insert(users).values({
      email: email.toLowerCase(),
      passwordHash,
      role: role || 'admin',
      clubId: role === 'super_admin' ? null : clubId,
    }).returning({
      id: users.id,
      email: users.email,
      role: users.role,
      clubId: users.clubId,
      createdAt: users.createdAt,
    })

    // Return user with generated password (shown once)
    return NextResponse.json({
      ...newUser,
      generatedPassword: password,
    })
  } catch (error) {
    console.error('Failed to create user:', error)
    if ((error as { code?: string }).code === '23505') {
      return NextResponse.json({ error: 'Email already exists' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 })
  }
}
