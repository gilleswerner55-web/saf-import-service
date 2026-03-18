import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const cookie = request.cookies.get('admin-session')?.value

  if (!cookie) {
    return NextResponse.json({ user: null })
  }

  try {
    const session = JSON.parse(Buffer.from(cookie, 'base64').toString('utf-8'))

    // Check if expired
    if (session.exp && session.exp < Date.now()) {
      return NextResponse.json({ user: null })
    }

    return NextResponse.json({
      user: {
        userId: session.userId,
        email: session.email,
        role: session.role,
        clubId: session.clubId,
      }
    })
  } catch {
    return NextResponse.json({ user: null })
  }
}
