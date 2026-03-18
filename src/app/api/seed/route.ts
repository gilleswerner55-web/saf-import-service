import { NextResponse } from 'next/server'
import { db, clubs, members, tournaments, slpRankings, users } from '@/db'
import * as fs from 'fs'
import * as path from 'path'
import bcrypt from 'bcryptjs'

interface SLPData {
  season: string
  lastUpdated: string
  tournaments: { name: string; date: string; type: string }[]
  men: { rank: number; name: string; club: string; points: number; breakdown: string }[]
  women: { rank: number; name: string; club: string; points: number; breakdown: string }[]
  clubs: { rank: number; club: string; points: number; athletes: number; breakdown: Record<string, { total: number }> }[]
}

export async function POST() {
  // Allow seeding (temporarily enabled for initial setup)
  // if (process.env.NODE_ENV === 'production') {
  //   return NextResponse.json({ error: 'Not allowed in production' }, { status: 403 })
  // }

  try {
    console.log('🌱 Seeding database from slp_2026_standings.json...')

    // Read the JSON data
    const jsonPath = path.join(process.cwd(), 'public', 'slp_2026_standings.json')
    const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf-8')) as SLPData

    // Clear existing data (in correct order due to foreign keys)
    console.log('Clearing existing data...')
    await db.delete(slpRankings)
    await db.delete(members)
    await db.delete(tournaments)
    await db.delete(clubs)

    // Insert clubs from JSON
    console.log('Inserting clubs...')
    const clubNames = jsonData.clubs.map(c => c.club)
    const insertedClubs = await db.insert(clubs).values(
      clubNames.map(name => ({ name, shortName: null, location: null }))
    ).returning()

    const clubMap = new Map(insertedClubs.map(c => [c.name, c.id]))

    // Insert members from JSON (both men and women)
    console.log('Inserting members...')
    const allAthletes = [
      ...jsonData.men.map(a => ({ ...a, gender: 'men' as const })),
      ...jsonData.women.map(a => ({ ...a, gender: 'women' as const }))
    ]

    // Map of athlete names to their image URLs (from copied images)
    const athleteImages: Record<string, string> = {
      'Christian Käslin': '/athletes/christian-kaeslin.jpg',
      'Christoph Schneiter': '/athletes/christoph-schneiter.jpg',
      'Francesco Cicala': '/athletes/francesco-cicala.jpg',
      'Idrissou Bebane': '/athletes/idrissou-bebane.jpg',
      'Jordan Fagone': '/athletes/jordan-fagone.jpg',
      'Lars Stelzer': '/athletes/lars-stelzer.jpg',
      'Luca Specht': '/athletes/luca-specht.jpg',
      'Michael Otika': '/athletes/michael-otika.jpg',
      'Noa Hartmann': '/athletes/noa-hartmann.jpg',
      'Stefan Hüppin': '/athletes/stefan-hueppin.jpg',
      'Viktor Reinok': '/athletes/viktor-reinok.jpg',
      'Heorhii Zavadskyi': '/athletes/zavadskyi-heorhii.jpg',
    }

    const memberValues = allAthletes.map(athlete => {
      // Split name into first and last name
      const nameParts = athlete.name.split(' ')
      const firstName = nameParts[0]
      const lastName = nameParts.slice(1).join(' ') || ''

      return {
        firstName,
        lastName,
        gender: athlete.gender,
        clubId: athlete.club ? clubMap.get(athlete.club) || null : null,
        country: 'Switzerland',
        imageUrl: athleteImages[athlete.name] || null,
      }
    })

    const insertedMembers = await db.insert(members).values(memberValues).returning()

    // Create a map from full name to member ID
    const memberMap = new Map(insertedMembers.map(m => [`${m.firstName} ${m.lastName}`, m.id]))

    // Insert SLP rankings
    console.log('Inserting SLP rankings...')
    const rankingValues = allAthletes.map(athlete => ({
      season: jsonData.season,
      memberId: memberMap.get(athlete.name)!,
      gender: athlete.gender,
      totalPoints: athlete.points,
      rank: athlete.rank,
      breakdown: athlete.breakdown,
      lastUpdated: new Date(jsonData.lastUpdated),
    }))

    await db.insert(slpRankings).values(rankingValues)

    // Insert tournaments from JSON
    console.log('Inserting tournaments...')
    await db.insert(tournaments).values([
      // From JSON
      ...jsonData.tournaments.map(t => ({
        name: t.name,
        date: new Date(t.date),
        location: t.name.includes('Züri') ? 'Zürich' : 'Switzerland',
        type: t.type as 'national' | 'international' | 'em' | 'wm',
        status: 'completed' as const,
        participantCount: allAthletes.length
      })),
      // Additional upcoming tournaments
      {
        name: 'Zurich Open 2026',
        date: new Date('2026-02-21'),
        location: 'Affoltern am Albis',
        type: 'national' as const,
        status: 'upcoming' as const,
      },
      {
        name: 'Schweizer Meisterschaft 2026',
        date: new Date('2026-03-28'),
        location: 'Wintersingen',
        type: 'national' as const,
        status: 'upcoming' as const,
      },
    ])

    // Create super admin user if ADMIN_EMAIL and ADMIN_PASSWORD are set
    let adminCreated = false
    const adminEmail = process.env.ADMIN_EMAIL
    const adminPassword = process.env.ADMIN_PASSWORD

    if (adminEmail && adminPassword) {
      console.log('Creating super admin user...')
      // Delete existing users first
      await db.delete(users)

      const passwordHash = await bcrypt.hash(adminPassword, 12)
      await db.insert(users).values({
        email: adminEmail,
        passwordHash,
        role: 'super_admin',
      })
      adminCreated = true
      console.log(`   - Super admin created: ${adminEmail}`)
    }

    console.log('✅ Database seeded successfully!')
    console.log(`   - ${clubNames.length} clubs`)
    console.log(`   - ${allAthletes.length} members`)
    console.log(`   - ${allAthletes.length} rankings`)
    console.log(`   - ${jsonData.tournaments.length + 2} tournaments`)
    if (adminCreated) console.log(`   - 1 super admin user`)

    return NextResponse.json({
      success: true,
      message: 'Database seeded successfully',
      stats: {
        clubs: clubNames.length,
        members: allAthletes.length,
        rankings: allAthletes.length,
        tournaments: jsonData.tournaments.length + 2,
        users: adminCreated ? 1 : 0
      }
    })
  } catch (error) {
    console.error('Failed to seed database:', error)
    return NextResponse.json(
      { error: 'Failed to seed database: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    )
  }
}
