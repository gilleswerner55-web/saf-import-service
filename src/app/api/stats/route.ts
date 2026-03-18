import { NextResponse } from 'next/server'
import { db, clubs, members } from '@/db'
import { count } from 'drizzle-orm'

export async function GET() {
  try {
    const [clubsResult, membersResult] = await Promise.all([
      db.select({ count: count() }).from(clubs),
      db.select({ count: count() }).from(members),
    ])

    return NextResponse.json({
      clubs: clubsResult[0]?.count ?? 0,
      members: membersResult[0]?.count ?? 0,
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    })
  } catch (error) {
    console.error('Failed to fetch stats:', error)
    return NextResponse.json({ clubs: 0, members: 0 }, { status: 500 })
  }
}
