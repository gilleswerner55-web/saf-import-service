import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

interface SessionData {
  userId: string
  email: string
  role: 'super_admin' | 'admin'
  token: string
  exp: number
}

function parseSession(cookie: string | undefined): SessionData | null {
  if (!cookie) return null
  try {
    const data = JSON.parse(Buffer.from(cookie, 'base64').toString('utf-8'))
    // Check if session is expired
    if (data.exp && data.exp < Date.now()) {
      return null
    }
    return data
  } catch {
    return null
  }
}

export function middleware(request: NextRequest) {
  // Block seed endpoint in production only
  if (request.nextUrl.pathname === '/api/seed' && process.env.NODE_ENV === 'production') {
    return new NextResponse('Not Found', { status: 404 })
  }

  // Protect admin routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    const sessionCookie = request.cookies.get('admin-session')
    const session = parseSession(sessionCookie?.value)

    if (!session) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    // Add session info to headers for use in API routes
    const response = NextResponse.next()
    response.headers.set('x-user-id', session.userId)
    response.headers.set('x-user-email', session.email)
    response.headers.set('x-user-role', session.role)
    return response
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/api/seed'],
}
