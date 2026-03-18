import { NextRequest, NextResponse } from 'next/server'
import { db, members } from '@/db'
import { eq } from 'drizzle-orm'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('image') as File | null
    const memberId = formData.get('memberId') as string | null

    if (!file) {
      return NextResponse.json({ error: 'No image file provided' }, { status: 400 })
    }

    if (!memberId) {
      return NextResponse.json({ error: 'No member ID provided' }, { status: 400 })
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'File must be an image' }, { status: 400 })
    }

    // Get the member to get their name for the filename
    const member = await db.select().from(members).where(eq(members.id, memberId)).limit(1)
    if (member.length === 0) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 })
    }

    // Create filename from member name (kebab-case)
    const firstName = member[0].firstName.toLowerCase().replace(/[^a-z0-9]/g, '')
    const lastName = member[0].lastName.toLowerCase().replace(/[^a-z0-9]/g, '')
    const ext = file.name.split('.').pop() || 'jpg'
    const filename = `${firstName}-${lastName}.${ext}`

    // Ensure the directory exists
    const uploadDir = path.join(process.cwd(), 'public', 'athletes')
    await mkdir(uploadDir, { recursive: true })

    // Convert file to buffer and write
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const filepath = path.join(uploadDir, filename)
    await writeFile(filepath, buffer)

    // Update member's imageUrl in database
    const imageUrl = `/athletes/${filename}`
    await db.update(members)
      .set({ imageUrl, updatedAt: new Date() })
      .where(eq(members.id, memberId))

    return NextResponse.json({
      success: true,
      imageUrl,
      message: 'Image uploaded successfully'
    })
  } catch (error) {
    console.error('Image upload error:', error)
    return NextResponse.json(
      { error: 'Failed to upload image: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    )
  }
}
