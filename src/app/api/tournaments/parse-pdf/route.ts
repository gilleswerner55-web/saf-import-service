import { NextRequest, NextResponse } from 'next/server'
import { parseStandingsPdf, calculateSLPPoints } from '@/lib/parse-standings-pdf'

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

// POST parse PDF - super_admin only
export async function POST(request: NextRequest) {
  const session = getSession(request)
  if (!session || session.role !== 'super_admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const formData = await request.formData()
    const file = formData.get('pdf') as File | null
    const tournamentType = (formData.get('tournamentType') as string) || 'national'

    if (!file) {
      return NextResponse.json(
        { error: 'No PDF file provided' },
        { status: 400 }
      )
    }

    if (!file.type.includes('pdf')) {
      return NextResponse.json(
        { error: 'File must be a PDF' },
        { status: 400 }
      )
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Parse the PDF
    const results = await parseStandingsPdf(buffer)

    // Calculate SLP points
    const slpPoints = calculateSLPPoints(
      results,
      tournamentType as 'national' | 'international' | 'em' | 'wm'
    )

    // Convert Map to array for JSON serialization
    const athletePointsArray = Array.from(slpPoints.values())
      .sort((a, b) => b.totalPoints - a.totalPoints)

    return NextResponse.json({
      success: true,
      tournamentName: results.tournamentName,
      totalCategories: results.categories.length,
      totalAthletes: results.totalAthletes,
      categories: results.categories.map(c => ({
        name: c.name,
        arm: c.arm,
        gender: c.gender,
        type: c.type,
        weightClass: c.weightClass,
        athleteCount: c.placements.length,
        placements: c.placements,
      })),
      slpRankings: athletePointsArray,
    })
  } catch (error) {
    console.error('PDF parsing error:', error)
    return NextResponse.json(
      { error: 'Failed to parse PDF: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    )
  }
}
