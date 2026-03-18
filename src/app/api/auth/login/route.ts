import { NextRequest, NextResponse } from 'next/server'
import { db, users } from '@/db'
import { eq } from 'drizzle-orm'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 })
    }

    // Find user by email
    const user = await db.query.users.findFirst({
      where: eq(users.email, email.toLowerCase()),
    })

    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.passwordHash)
    if (!passwordMatch) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    // Generate session token
    const sessionToken = crypto.randomBytes(32).toString('hex')

    // Create session data (encode user info in base64)
    const sessionData = Buffer.from(JSON.stringify({
      userId: user.id,
      email: user.email,
      role: user.role,
      clubId: user.clubId,
      token: sessionToken,
      exp: Date.now() + 7 * 24 * 60 * 60 * 1000, // 1 week
    })).toString('base64')

    const response = NextResponse.json({
      success: true,
      user: {
        email: user.email,
        role: user.role,
        clubId: user.clubId,
      }
    })

    response.cookies.set('admin-session', sessionData, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 1 week
    })

    return response
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ error: 'Login failed' }, { status: 500 })
  }
}
